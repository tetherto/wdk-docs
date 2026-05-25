import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync } from 'fs'
import { tmpdir } from 'os'
import { dirname, join } from 'path'
import {
  checkRippleEffect,
  cleanupTempDir,
  getStepSnapshotPath,
  getPendingTags,
  getVersionMetadata,
  normalizeReleaseBody,
  parseSemver,
  runGeneration
} from '../generate.mjs'

const sparkTags = JSON.parse(readFileSync(new URL('./fixtures/spark/tags.json', import.meta.url), 'utf-8'))
const sparkReleases = JSON.parse(readFileSync(new URL('./fixtures/spark/releases.json', import.meta.url), 'utf-8'))
const sparkCompare = JSON.parse(readFileSync(new URL('./fixtures/spark/compare.json', import.meta.url), 'utf-8'))
const expectedSteps = JSON.parse(readFileSync(new URL('./fixtures/spark/expected-steps.json', import.meta.url), 'utf-8'))

function createFixtureRemote () {
  return {
    listTags (repo) {
      return sparkTags[repo] ?? []
    },
    async getReleaseByTag (repo, tag) {
      return sparkReleases[repo]?.[tag] ?? null
    },
    async getCompare (repo, fromTag, toTag) {
      return sparkCompare[repo]?.[`${fromTag}...${toTag}`] ?? null
    }
  }
}

function createTempModuleConfig (tmpRoot, key = 'wallet-spark') {
  const outputPath = join(tmpRoot, key, 'api-reference.mdx')
  return {
    [key]: {
      name: 'Wallet Spark',
      package: '@tetherto/wdk-wallet-spark',
      repo: 'tetherto/wdk-wallet-spark',
      entryPoint: 'index.js',
      outputPath
    }
  }
}

function createFakeGenerator (outputs, failures = new Set()) {
  return (key, opts) => {
    if (failures.has(opts.ref)) {
      throw new Error(`boom: ${opts.ref}`)
    }

    const outputPath = opts.modules[key].outputPath
    mkdirSync(dirname(outputPath), { recursive: true })
    writeFileSync(outputPath, outputs[opts.ref] ?? outputs.default ?? '', 'utf-8')

    return {
      lines: outputs[opts.ref]?.split('\n').length ?? 1,
      classes: 1,
      types: 1,
      functions: 0,
      enums: 0,
      outputPath
    }
  }
}

test('parseSemver accepts legacy beta tags without a dot before the number', () => {
  const parsed = parseSemver('v1.0.0-beta2')
  assert.equal(parsed.preLabel, 'beta')
  assert.equal(parsed.preNum, 2)
})

test('getPendingTags returns tags strictly after the stored tag in semver order', () => {
  const pending = getPendingTags(
    'wallet-spark',
    'v1.0.0-beta.12',
    createFixtureRemote(),
    {
      'wallet-spark': {
        repo: 'tetherto/wdk-wallet-spark'
      }
    }
  )

  assert.deepEqual(
    pending.map(entry => entry.tag),
    ['v1.0.0-beta.13', 'v1.0.0-beta.14', 'v1.0.0-beta.15', 'v1.0.0-beta.16']
  )
})

test('normalizeReleaseBody converts CRLF releases into stable LF markdown', () => {
  const body = sparkReleases['tetherto/wdk-wallet-spark']['v1.0.0-beta.13'].body
  const normalized = normalizeReleaseBody(body)
  assert.match(normalized, /\n\* chore: bump spark sdk/)
  assert.doesNotMatch(normalized, /\r/)
})

test('getVersionMetadata falls back to compare metadata when no release body exists', async () => {
  const remote = {
    listTags () {
      return []
    },
    async getReleaseByTag () {
      return null
    },
    async getCompare () {
      return {
        html_url: 'https://github.com/tetherto/wdk-wallet-spark/compare/v1.0.0-beta.13...v1.0.0-beta.14',
        total_commits: 12,
        commits: [
          { commit: { message: 'feat: sparkscan support for balanes' } },
          { commit: { message: 'Release: v1.0.0-beta.14' } }
        ]
      }
    }
  }

  const metadata = await getVersionMetadata({
    repo: 'tetherto/wdk-wallet-spark',
    fromTag: 'v1.0.0-beta.13',
    toTag: 'v1.0.0-beta.14',
    remote
  })

  assert.match(metadata.releaseBody, /Changes across 12 commits\./)
  assert.match(metadata.releaseBody, /feat: sparkscan support for balanes/)
  assert.equal(
    metadata.compareUrl,
    'https://github.com/tetherto/wdk-wallet-spark/compare/v1.0.0-beta.13...v1.0.0-beta.14'
  )
})

test('runGeneration replays pending tags and records note-only no-diff steps', async () => {
  cleanupTempDir()
  const tmpRoot = mkdtempSync(join(tmpdir(), 'api-ref-gen-'))
  const modules = createTempModuleConfig(tmpRoot)

  const result = await runGeneration(
    { module: 'wallet-spark', branch: 'main', replayPending: true, force: false, typedocJson: null },
    {
      modules,
      persist: false,
      remote: createFixtureRemote(),
      syncHistory: {},
      syncState: {
        'wallet-spark': {
          tag: 'v1.0.0-beta.12',
          sha: '637059cd9d8cf622c47f35d7f448109e68955769'
        }
      },
      generateModule: createFakeGenerator({
        'v1.0.0-beta.13': '# WalletManagerSpark\n\n## getBalance\n',
        'v1.0.0-beta.14': '# WalletManagerSpark\n\n## getBalance\n'
      })
    }
  )

  const comparableSteps = result.steps.slice(0, 2).map(({ stats, ...step }) => ({
    ...step,
    outputPath: '__TEMP_OUTPUT__'
  }))

  assert.deepEqual(comparableSteps, expectedSteps)
  assert.deepEqual(
    result.steps.map(step => step.toTag),
    ['v1.0.0-beta.13', 'v1.0.0-beta.14', 'v1.0.0-beta.15', 'v1.0.0-beta.16']
  )
  assert.equal(result.state['wallet-spark'].tag, 'v1.0.0-beta.16')
  assert.equal(
    existsSync(getStepSnapshotPath('wallet-spark', 'v1.0.0-beta.13', modules['wallet-spark'].outputPath)),
    true
  )
  assert.equal(
    existsSync(getStepSnapshotPath('wallet-spark', 'v1.0.0-beta.14', modules['wallet-spark'].outputPath)),
    false
  )
  cleanupTempDir()

  rmSync(tmpRoot, { recursive: true, force: true })
})

test('runGeneration stops processing later tags after the first failure', async () => {
  const tmpRoot = mkdtempSync(join(tmpdir(), 'api-ref-gen-'))
  const modules = createTempModuleConfig(tmpRoot)

  const result = await runGeneration(
    { module: 'wallet-spark', branch: 'main', replayPending: true, force: false, typedocJson: null },
    {
      modules,
      persist: false,
      remote: createFixtureRemote(),
      syncHistory: {},
      syncState: {
        'wallet-spark': {
          tag: 'v1.0.0-beta.12',
          sha: '637059cd9d8cf622c47f35d7f448109e68955769'
        }
      },
      generateModule: createFakeGenerator(
        {
          'v1.0.0-beta.13': '# ok',
          'v1.0.0-beta.15': '# should-not-run'
        },
        new Set(['v1.0.0-beta.14'])
      )
    }
  )

  assert.deepEqual(
    result.steps.map(step => [step.toTag, step.status]),
    [
      ['v1.0.0-beta.13', 'ok'],
      ['v1.0.0-beta.14', 'failed']
    ]
  )

  rmSync(tmpRoot, { recursive: true, force: true })
})

test('runGeneration force mode replays pending tags first and latest once when none remain', async () => {
  const tmpRoot = mkdtempSync(join(tmpdir(), 'api-ref-gen-'))
  const modules = createTempModuleConfig(tmpRoot)
  const remote = createFixtureRemote()

  const pendingResult = await runGeneration(
    { module: 'wallet-spark', branch: 'main', replayPending: false, force: true, typedocJson: null },
    {
      modules,
      persist: false,
      remote,
      syncHistory: {},
      syncState: {
        'wallet-spark': {
          tag: 'v1.0.0-beta.12',
          sha: '637059cd9d8cf622c47f35d7f448109e68955769'
        }
      },
      generateModule: createFakeGenerator({
        'v1.0.0-beta.13': '# step 13',
        'v1.0.0-beta.14': '# step 14',
        'v1.0.0-beta.15': '# step 15',
        'v1.0.0-beta.16': '# step 16'
      })
    }
  )

  assert.deepEqual(
    pendingResult.steps.map(step => step.toTag),
    ['v1.0.0-beta.13', 'v1.0.0-beta.14', 'v1.0.0-beta.15', 'v1.0.0-beta.16']
  )

  const latestOnlyResult = await runGeneration(
    { module: 'wallet-spark', branch: 'main', replayPending: false, force: true, typedocJson: null },
    {
      modules,
      persist: false,
      remote,
      syncHistory: {},
      syncState: {
        'wallet-spark': {
          tag: 'v1.0.0-beta.16',
          sha: 'd6b4b88f5622537132d0c9f81864897ba76c5f59'
        }
      },
      generateModule: createFakeGenerator({
        'v1.0.0-beta.16': '# latest once'
      })
    }
  )

  assert.deepEqual(latestOnlyResult.steps.map(step => step.toTag), ['v1.0.0-beta.16'])

  rmSync(tmpRoot, { recursive: true, force: true })
})

test('runGeneration rejects force with module=all and preserves module insertion order', async () => {
  await assert.rejects(
    runGeneration(
      { module: 'all', branch: 'main', replayPending: false, force: true, typedocJson: null },
      { persist: false }
    ),
    /--force cannot be used with --module all/
  )

  const tmpRoot = mkdtempSync(join(tmpdir(), 'api-ref-gen-'))
  const modules = {
    alpha: {
      name: 'Alpha',
      package: '@example/alpha',
      repo: 'alpha/repo',
      entryPoint: 'index.js',
      outputPath: join(tmpRoot, 'alpha', 'api-reference.mdx')
    },
    beta: {
      name: 'Beta',
      package: '@example/beta',
      repo: 'beta/repo',
      entryPoint: 'index.js',
      outputPath: join(tmpRoot, 'beta', 'api-reference.mdx')
    }
  }

  const remote = {
    listTags (repo) {
      if (repo === 'alpha/repo') return [{ tag: 'v1.0.0-beta.2', sha: 'a2' }]
      if (repo === 'beta/repo') return [{ tag: 'v1.0.0-beta.2', sha: 'b2' }]
      return []
    },
    async getReleaseByTag () {
      return null
    },
    async getCompare () {
      return null
    }
  }

  const result = await runGeneration(
    { module: 'all', branch: 'main', replayPending: true, force: false, typedocJson: null },
    {
      modules,
      persist: false,
      remote,
      syncHistory: {},
      syncState: {},
      generateModule: createFakeGenerator({
        'v1.0.0-beta.2': '# same'
      })
    }
  )

  assert.deepEqual(result.steps.map(step => step.key), ['alpha', 'beta'])

  rmSync(tmpRoot, { recursive: true, force: true })
})

test('checkRippleEffect finds sibling docs that reference removed symbols', () => {
  const tmpRoot = mkdtempSync(join(tmpdir(), 'api-ref-gen-ripple-'))
  const moduleDir = join(tmpRoot, 'wallet-spark')
  mkdirSync(moduleDir, { recursive: true })

  writeFileSync(join(moduleDir, 'usage.mdx'), 'Use WalletManagerSpark#getBalance for balance checks.\n', 'utf-8')
  writeFileSync(join(moduleDir, 'api-reference.mdx'), 'placeholder', 'utf-8')

  const previousDoc = '## WalletManagerSpark\n\n### getBalance\n'
  const nextDoc = '## WalletManagerSpark\n\n### getAddress\n'
  const warnings = checkRippleEffect(previousDoc, nextDoc, moduleDir)

  assert.deepEqual(warnings, [{ file: 'usage.mdx', symbol: 'getBalance' }])

  rmSync(tmpRoot, { recursive: true, force: true })
})
