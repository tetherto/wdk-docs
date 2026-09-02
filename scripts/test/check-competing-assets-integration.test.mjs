import test from 'node:test'
import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

import {
  COMPETING_ASSET_POLICIES,
  PROHIBITED_CHAIN_POLICY
} from '../competing-assets-policy.mjs'
import {
  validateCompetingAssetCatalog,
  validateCompetingAssets,
  validateCompetingAssetsInSearchIndex,
  validateTokenSymbolFiles
} from '../check-token-symbols.mjs'

const execFileAsync = promisify(execFile)
const CHECKER_PATH = fileURLToPath(new URL('../check-token-symbols.mjs', import.meta.url))
const REPOSITORY_ROOT = fileURLToPath(new URL('../..', import.meta.url))

async function fixtureRoot(testContext, prefix) {
  const root = await mkdtemp(path.join(tmpdir(), prefix))
  testContext.after(async () => {
    await rm(root, { recursive: true, force: true })
  })
  return root
}

async function writeFixture(root, relativePath, content) {
  const target = path.join(root, relativePath)
  await mkdir(path.dirname(target), { recursive: true })
  await writeFile(target, content, 'utf8')
}

function sfntFixture(scalerType = Buffer.from([0x00, 0x01, 0x00, 0x00])) {
  const buffer = Buffer.alloc(32)
  Buffer.from(scalerType).copy(buffer, 0)
  buffer.writeUInt16BE(1, 4)
  buffer.writeUInt16BE(16, 6)
  buffer.writeUInt16BE(0, 8)
  buffer.writeUInt16BE(0, 10)
  buffer.write('test', 12, 4, 'ascii')
  buffer.writeUInt32BE(28, 20)
  buffer.writeUInt32BE(4, 24)
  buffer.writeUInt32BE(0xdeadbeef, 28)
  return buffer
}

function sfntCollectionFixture() {
  const buffer = Buffer.alloc(48)
  buffer.write('ttcf', 0, 4, 'ascii')
  buffer.writeUInt32BE(0x00010000, 4)
  buffer.writeUInt32BE(1, 8)
  buffer.writeUInt32BE(16, 12)
  buffer.writeUInt32BE(0x00010000, 16)
  buffer.writeUInt16BE(1, 20)
  buffer.writeUInt16BE(16, 22)
  buffer.writeUInt16BE(0, 24)
  buffer.writeUInt16BE(0, 26)
  buffer.write('test', 28, 4, 'ascii')
  buffer.writeUInt32BE(44, 36)
  buffer.writeUInt32BE(4, 40)
  buffer.writeUInt32BE(0xdeadbeef, 44)
  return buffer
}

function woffFixture(signature) {
  if (signature === 'wOF2') {
    const buffer = Buffer.alloc(49)
    buffer.write(signature, 0, 4, 'ascii')
    buffer.writeUInt32BE(0x00010000, 4)
    buffer.writeUInt32BE(buffer.length, 8)
    buffer.writeUInt16BE(1, 12)
    buffer.writeUInt32BE(32, 16)
    buffer.writeUInt32BE(1, 20)
    buffer[48] = 0xff
    return buffer
  }

  const buffer = Buffer.alloc(68)
  buffer.write('wOFF', 0, 4, 'ascii')
  buffer.writeUInt32BE(0x00010000, 4)
  buffer.writeUInt32BE(buffer.length, 8)
  buffer.writeUInt16BE(1, 12)
  buffer.writeUInt32BE(32, 16)
  buffer.write('test', 44, 4, 'ascii')
  buffer.writeUInt32BE(64, 48)
  buffer.writeUInt32BE(4, 52)
  buffer.writeUInt32BE(4, 56)
  buffer.writeUInt32BE(0xdeadbeef, 64)
  return buffer
}

function riffWebpFixture() {
  const buffer = Buffer.alloc(22)
  buffer.write('RIFF', 0, 4, 'ascii')
  buffer.writeUInt32LE(buffer.length - 8, 4)
  buffer.write('WEBP', 8, 4, 'ascii')
  buffer.write('VP8L', 12, 4, 'ascii')
  buffer.writeUInt32LE(1, 16)
  buffer[20] = 0x2f
  return buffer
}

function isoBaseMediaFixture(brand, mediaBox) {
  const buffer = Buffer.alloc(32)
  buffer.writeUInt32BE(16, 0)
  buffer.write('ftyp', 4, 4, 'ascii')
  buffer.write(brand, 8, 4, 'ascii')
  buffer.write(brand, 12, 4, 'ascii')
  buffer.writeUInt32BE(16, 16)
  buffer.write(mediaBox, 20, 4, 'ascii')
  buffer.writeUInt32BE(0xdeadbeef, 24)
  buffer.writeUInt32BE(0xcafebabe, 28)
  return buffer
}

function relativeFiles(root, files) {
  return files
    .map((file) => path.relative(root, file).split(path.sep).join('/'))
}

async function runChecker(root, ...arguments_) {
  try {
    const result = await execFileAsync(
      process.execPath,
      [CHECKER_PATH, '--root', root, ...arguments_],
      { encoding: 'utf8' }
    )
    return { code: 0, stderr: result.stderr, stdout: result.stdout }
  } catch (error) {
    return {
      code: error.code,
      stderr: error.stderr ?? '',
      stdout: error.stdout ?? ''
    }
  }
}

function scanOnlyBuildOutput(root) {
  return {
    root,
    sourceDirectories: [],
    visibleSourceDirectories: [],
    visibleSourceFiles: [],
    catalogSourceFiles: [],
    generatedMarkdownFiles: [],
    generatedCatalogFiles: [],
    generatedSearchIndexFiles: [],
    buildOutputDirectories: ['dist']
  }
}

test('wires the policy checker into Node 22 quality CI, including draft pull requests and build output', async () => {
  const packageJson = JSON.parse(await readFile(path.join(REPOSITORY_ROOT, 'package.json'), 'utf8'))
  const workflow = await readFile(path.join(REPOSITORY_ROOT, '.github/workflows/quality-gates.yml'), 'utf8')

  assert.match(packageJson.scripts['check:tokens'], /check-token-symbols\.mjs/u)
  assert.match(packageJson.scripts.quality, /(?:^|&&[ \t]*)npm run check:tokens(?:[ \t]*&&|$)/u)
  assert.match(packageJson.scripts.build, /check-token-symbols\.mjs --include-build-output/u)
  assert.match(packageJson.scripts['build:static'], /check-token-symbols\.mjs --include-build-output/u)
  assert.match(workflow, /node-version:[ \t]*['"]22['"]/u)
  assert.match(workflow, /pull_request:\r?\n[ \t]+types: \[opened, synchronize, reopened, ready_for_review\]/u)
  assert.match(workflow, /run:[ \t]*npm run quality/u)
  assert.doesNotMatch(workflow, /github\.event\.pull_request\.draft/u)
})

test('keeps the competing-asset catalog valid and reports policy-backed match kinds', () => {
  assert.deepEqual(validateCompetingAssetCatalog(), [])
  assert(COMPETING_ASSET_POLICIES.some((policy) => policy.id === 'circle-usd'))
  assert.equal(PROHIBITED_CHAIN_POLICY.id, 'coinbase-base')

  const content = [
    'USD Coin is a competing asset.',
    'Symbol: USDC.',
    'Address: 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48.',
    'The source identifier is usdCoin.',
    'Do not route on Base.'
  ].join('\n')
  const issues = validateCompetingAssets(content, { file: 'fixture.md' })

  assert.deepEqual(issues.map((issue) => ({
    column: issue.column,
    kind: issue.kind,
    line: issue.line,
    policyId: issue.policyId,
    value: issue.value
  })), [
    { column: 1, kind: 'name', line: 1, policyId: 'circle-usd', value: 'USD Coin' },
    { column: 9, kind: 'symbol', line: 2, policyId: 'circle-usd', value: 'USDC' },
    {
      column: 10,
      kind: 'address',
      line: 3,
      policyId: 'circle-usd',
      value: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
    },
    { column: 26, kind: 'identifier', line: 4, policyId: 'circle-usd', value: 'usdCoin' },
    { column: 8, kind: 'chain-route', line: 5, policyId: 'coinbase-base', value: 'route on Base' }
  ])

  assert.deepEqual(validateCompetingAssets([
    'Base account configuration is supported.',
    'Use the source-accurate USD₮ and USDT spellings.'
  ].join('\n')), [])
})

test('discovers Markdown and future JSON, YAML, Python, and shell files under governed content and skill roots', async (testContext) => {
  const root = await fixtureRoot(testContext, 'wdk-competing-governed-')
  const files = {
    'content/docs/reference.mdx': '# DAI reference\n',
    'content/feeds/skills/feed-guide.md': '# DAI feed guide\n',
    'content/feeds/skills/feed-data.json': '{"symbol":"DAI"}\n',
    'content/feeds/skills/feed-config.yaml': 'symbol: DAI\n',
    'content/feeds/skills/feed-check.py': 'symbol = "DAI"\n',
    'content/feeds/skills/feed-check.sh': 'echo DAI\n',
    'skills/wdk/references/skill-guide.mdx': '# DAI skill guide\n',
    'skills/wdk/fixtures/skill-data.yml': 'asset: DAI\n',
    'skills/wdk/fixtures/skill-check.py': 'print("DAI")\n',
    'skills/wdk/fixtures/skill-check.sh': 'printf DAI\n',
    'other/ignored.json': '{"symbol":"DAI"}\n'
  }
  for (const [relativePath, content] of Object.entries(files)) {
    await writeFixture(root, relativePath, content)
  }

  const result = await validateTokenSymbolFiles({ root })
  const discovered = relativeFiles(root, result.files)
  const expectedFiles = Object.keys(files)
    .filter((relativePath) => !relativePath.startsWith('other/'))
    .sort((left, right) => left.localeCompare(right))

  assert.deepEqual(discovered, expectedFiles)
  assert(!discovered.includes('other/ignored.json'))
  assert.deepEqual(result.issues.map((issue) => [issue.file, issue.kind, issue.policyId, issue.value]), expectedFiles.map((file) => [
    file,
    'symbol',
    'maker-dai',
    'DAI'
  ]))
})

test('discovers every UTF-8 script and GitHub file regardless of extension, with only narrow exclusions', async (testContext) => {
  const root = await fixtureRoot(testContext, 'wdk-competing-source-sinks-')
  const exactRootAndGeneratorFiles = [
    '.env.example',
    '.gitignore',
    '.npmrc',
    '.vercelignore',
    'LICENSE',
    'README.md',
    '_redirects',
    'cli.json',
    'next.config.mjs',
    'package.json',
    'postcss.config.mjs',
    'source.config.ts',
    'scripts/generate-llm-md-files.mjs',
    'scripts/generate-og.mts',
    'scripts/generate-search-index.mjs',
    'scripts/sync-all-modules-feed.mjs',
    'tsconfig.json'
  ]
  const governedFiles = [
    'scripts/check-token-symbols.ts',
    'scripts/competing-assets-policy.ts',
    'scripts/nested/asset-policy.json',
    'scripts/nested/asset-policy.yaml',
    'scripts/nested/asset-policy.py',
    'scripts/nested/asset-policy.sh',
    'scripts/nested/asset-policy.bin',
    'scripts/test/nested/asset-policy.yaml',
    'scripts/tester/asset-policy.mjs',
    '.github/actions/check/action.yml',
    '.github/scripts/asset-policy.mjs',
    '.github/templates/asset-policy.md',
    '.github/templates/asset-policy.bin',
    'public/assets/indexer-api/openapi.json',
    'public/reference.md',
    'templates/pr-body.njk'
  ]
  const excludedFiles = [
    'scripts/check-token-symbols.mjs',
    'scripts/competing-assets-policy.mjs',
    'scripts/test/check-competing-assets.test.mjs',
    'scripts/test/check-competing-assets-integration.test.mjs',
    'scripts/test/check-token-symbols.test.mjs'
  ]
  const ignoredFiles = [
    'next.config.ts',
    'source.config.mjs',
    'AGENTS.md',
    'nested/README.md',
    'package-lock.json',
    'other/generate-og.mts',
    'other/generate-search-index.mjs',
  ]
  for (const relativePath of [...exactRootAndGeneratorFiles, ...governedFiles, ...excludedFiles, ...ignoredFiles]) {
    await writeFixture(root, relativePath, '# DAI\n')
  }
  await writeFixture(root, 'src/components/asset-label.tsx', "export const label = 'DAI'\n")

  const result = await validateTokenSymbolFiles({ root })
  const discovered = relativeFiles(root, result.files)
  const expectedFiles = [
    ...exactRootAndGeneratorFiles,
    ...governedFiles,
    'src/components/asset-label.tsx'
  ].sort((left, right) => left.localeCompare(right))

  assert.deepEqual(discovered, expectedFiles)
  assert.equal(new Set(discovered).size, discovered.length)
  for (const relativePath of excludedFiles) assert(!discovered.includes(relativePath))
  for (const relativePath of ignoredFiles) assert(!discovered.includes(relativePath))
  assert.deepEqual(result.issues.map((issue) => [issue.file, issue.kind, issue.policyId, issue.value]), expectedFiles.map((file) => [
    file,
    'symbol',
    'maker-dai',
    'DAI'
  ]))
})

test('scans extensionless and misleading-extension UTF-8 files while skipping recognized binary formats by content', async (testContext) => {
  const root = await fixtureRoot(testContext, 'wdk-competing-text-detection-')
  const textualFiles = [
    'content/docs/extensionless',
    'content/docs/disguised.png',
    'content/docs/disguised.woff2',
    'scripts/nested/policy.unknown',
    'public/asset.bin',
    'public/disguised.avif',
    'public/disguised.ttf'
  ]
  for (const relativePath of textualFiles) await writeFixture(root, relativePath, 'DAI\n')

  const recognizedBinaryFiles = {
    'public/binary-as-text.avif.txt': isoBaseMediaFixture('avif', 'meta'),
    'public/binary-as-text.avis.txt': isoBaseMediaFixture('avis', 'meta'),
    'public/binary-as-text.gif.txt': Buffer.from('R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==', 'base64'),
    'public/binary-as-text.jpeg.txt': Buffer.from('/9j/4AAQSkZJRgABAQAAAQABAAD/2Q==', 'base64'),
    'public/binary-as-text.mp4.txt': isoBaseMediaFixture('isom', 'moov'),
    'public/binary-as-text.otf.txt': sfntFixture(Buffer.from('OTTO', 'ascii')),
    'public/binary-as-text.png.txt': Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
      'base64'
    ),
    'public/binary-as-text.quicktime.txt': isoBaseMediaFixture('qt  ', 'moov'),
    'public/binary-as-text.ttc.txt': sfntCollectionFixture(),
    'public/binary-as-text.ttf.txt': sfntFixture(),
    'public/binary-as-text.true-sfnt.txt': sfntFixture(Buffer.from('true', 'ascii')),
    'public/binary-as-text.type1-sfnt.txt': sfntFixture(Buffer.from('typ1', 'ascii')),
    'public/binary-as-text.webp.txt': riffWebpFixture(),
    'public/binary-as-text.woff.txt': woffFixture('wOFF'),
    'public/binary-as-text.woff2.txt': woffFixture('wOF2')
  }
  for (const [relativePath, content] of Object.entries(recognizedBinaryFiles)) {
    await writeFixture(root, relativePath, content)
  }

  const result = await validateTokenSymbolFiles({ root })
  assert.deepEqual(relativeFiles(root, result.files), textualFiles.slice().sort((left, right) => left.localeCompare(right)))
  assert.deepEqual(result.issues.map((issue) => [issue.file, issue.kind, issue.policyId, issue.value]), textualFiles
    .slice()
    .sort((left, right) => left.localeCompare(right))
    .map((file) => [file, 'symbol', 'maker-dai', 'DAI']))
})

test('fails closed for malformed recognized signatures, unknown binary data, and NUL-containing UTF-8', async (testContext) => {
  const invalidUtf8Root = await fixtureRoot(testContext, 'wdk-competing-invalid-utf8-')
  await writeFixture(invalidUtf8Root, 'content/docs/opaque.bin', Buffer.from([0xc3, 0x28]))
  await assert.rejects(
    validateTokenSymbolFiles({ root: invalidUtf8Root }),
    /Governed file content\/docs\/opaque\.bin is neither valid UTF-8 text nor a recognized binary asset\./
  )

  const nulRoot = await fixtureRoot(testContext, 'wdk-competing-nul-')
  await writeFixture(nulRoot, 'scripts/opaque.data', Buffer.from('neutral\0DAI', 'utf8'))
  await assert.rejects(
    validateTokenSymbolFiles({ root: nulRoot }),
    /Governed UTF-8 text file scripts\/opaque\.data contains a NUL byte\./
  )

  const malformedFixtures = {
    'public/truncated.woff2': Buffer.concat([Buffer.from('wOF2', 'ascii'), Buffer.from([0xff])]),
    'public/length-mismatch.woff': (() => {
      const buffer = woffFixture('wOFF')
      buffer.writeUInt32BE(buffer.length - 1, 8)
      return buffer
    })(),
    'public/out-of-bounds.ttf': (() => {
      const buffer = sfntFixture()
      buffer.writeUInt32BE(buffer.length + 1, 20)
      return buffer
    })()
  }
  for (const [relativePath, content] of Object.entries(malformedFixtures)) {
    const root = await fixtureRoot(testContext, 'wdk-competing-malformed-binary-')
    await writeFixture(root, relativePath, content)
    await assert.rejects(
      validateTokenSymbolFiles({ root }),
      new RegExp(`Governed file ${relativePath.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')} is neither valid UTF-8 text nor a recognized binary asset\\.`)
    )
  }
})

test('rejects file, directory, and explicit-file symlinks in governed paths', async (testContext) => {
  const fileRoot = await fixtureRoot(testContext, 'wdk-competing-file-link-')
  await writeFixture(fileRoot, 'outside/target.txt', 'DAI\n')
  await mkdir(path.join(fileRoot, 'content/docs'), { recursive: true })
  await symlink(path.join(fileRoot, 'outside/target.txt'), path.join(fileRoot, 'content/docs/linked.txt'))
  await assert.rejects(
    validateTokenSymbolFiles({ root: fileRoot }),
    /Governed path content\/docs\/linked\.txt must not be a symbolic link\./
  )

  const directoryRoot = await fixtureRoot(testContext, 'wdk-competing-directory-link-')
  await writeFixture(directoryRoot, 'outside/target.txt', 'DAI\n')
  await mkdir(path.join(directoryRoot, 'content'), { recursive: true })
  await symlink(path.join(directoryRoot, 'outside'), path.join(directoryRoot, 'content/docs'))
  await assert.rejects(
    validateTokenSymbolFiles({ root: directoryRoot }),
    /Governed path content\/docs must not be a symbolic link\./
  )

  const brokenRoot = await fixtureRoot(testContext, 'wdk-competing-broken-link-')
  await mkdir(path.join(brokenRoot, 'content'), { recursive: true })
  await symlink(path.join(brokenRoot, 'missing'), path.join(brokenRoot, 'content/docs'))
  await assert.rejects(
    validateTokenSymbolFiles({ root: brokenRoot }),
    /Governed path content\/docs must not be a symbolic link\./
  )

  const explicitRoot = await fixtureRoot(testContext, 'wdk-competing-explicit-link-')
  await writeFixture(explicitRoot, 'outside/env.txt', 'NEUTRAL=value\n')
  await symlink(path.join(explicitRoot, 'outside/env.txt'), path.join(explicitRoot, '.env.example'))
  await assert.rejects(
    validateTokenSymbolFiles({ root: explicitRoot }),
    /Governed path \.env\.example must not be a symbolic link\./
  )
})

test('discovers textual public artifacts and scans structured search JSON as serialized content', async (testContext) => {
  const root = await fixtureRoot(testContext, 'wdk-competing-public-')
  await writeFixture(root, 'public/llms-full.txt', '# Full documentation\nDAI\n')
  await writeFixture(root, 'public/llms.txt', '# Documentation index\nDAI\n')
  await writeFixture(root, 'public/api/search.json', JSON.stringify({
    docs: {
      docs: {
        'z-last': { title: 'Dai Stablecoin' },
        'a-first': { description: 'DAI' }
      }
    }
  }))
  await writeFixture(root, 'public/reference.md', '# DAI\n')
  await writeFixture(root, 'public/api/openapi.json', '{"title":"DAI"}\n')
  await writeFixture(root, 'public/ignored.bin', 'DAI\n')

  const result = await validateTokenSymbolFiles({ root })
  assert.deepEqual(relativeFiles(root, result.files), [
    'public/api/openapi.json',
    'public/api/search.json',
    'public/ignored.bin',
    'public/llms-full.txt',
    'public/llms.txt',
    'public/reference.md'
  ])
  assert.deepEqual(result.issues.map((issue) => ({
    file: issue.file,
    generatedSource: issue.generatedSource,
    kind: issue.kind,
    line: issue.line,
    column: issue.column,
    policyId: issue.policyId,
    value: issue.value
  })), [
    {
      file: 'public/api/openapi.json',
      generatedSource: undefined,
      kind: 'symbol',
      line: 1,
      column: 11,
      policyId: 'maker-dai',
      value: 'DAI'
    },
    {
      file: 'public/api/search.json',
      generatedSource: 'docs.docs',
      kind: 'symbol',
      line: undefined,
      column: undefined,
      policyId: 'maker-dai',
      value: 'DAI'
    },
    {
      file: 'public/api/search.json',
      generatedSource: 'docs.docs',
      kind: 'name',
      line: undefined,
      column: undefined,
      policyId: 'maker-dai',
      value: 'Dai Stablecoin'
    },
    {
      file: 'public/ignored.bin',
      generatedSource: undefined,
      kind: 'symbol',
      line: 1,
      column: 1,
      policyId: 'maker-dai',
      value: 'DAI'
    },
    {
      file: 'public/llms-full.txt',
      generatedSource: undefined,
      kind: 'symbol',
      line: 2,
      column: 1,
      policyId: 'maker-dai',
      value: 'DAI'
    },
    {
      file: 'public/llms.txt',
      generatedSource: undefined,
      kind: 'symbol',
      line: 2,
      column: 1,
      policyId: 'maker-dai',
      value: 'DAI'
    },
    {
      file: 'public/reference.md',
      generatedSource: undefined,
      kind: 'symbol',
      line: 1,
      column: 3,
      policyId: 'maker-dai',
      value: 'DAI'
    }
  ])

  const directIssues = validateCompetingAssetsInSearchIndex(
    JSON.stringify({ docs: { docs: { z: { title: 'DAI' }, a: { title: 'DAI' } } } }),
    { file: 'public/api/search.json' }
  )
  assert.deepEqual(directIssues.map((issue) => ({
    column: issue.column,
    generatedSource: issue.generatedSource,
    line: issue.line,
    value: issue.value
  })), [
    { column: undefined, generatedSource: 'docs.docs', line: undefined, value: 'DAI' },
    { column: undefined, generatedSource: 'docs.docs', line: undefined, value: 'DAI' }
  ])
})

test('fails closed for a malformed structured public search index', async (testContext) => {
  const root = await fixtureRoot(testContext, 'wdk-competing-search-invalid-')
  await writeFixture(root, 'public/api/search.json', '{"docs":{}}\n')

  await assert.rejects(
    validateTokenSymbolFiles({ root }),
    /Generated search index public\/api\/search\.json does not contain a docs\.docs object\./
  )

  await writeFixture(root, 'public/api/search.json', '{not valid JSON}\n')
  await assert.rejects(
    validateTokenSymbolFiles({ root }),
    /Generated search index public\/api\/search\.json is not valid JSON:/
  )
})

test('rejects prohibited asset and Coinbase Base names in governed file paths', async (testContext) => {
  const root = await fixtureRoot(testContext, 'wdk-competing-paths-')
  await writeFixture(root, 'content/docs/sdk/usdc/index.mdx', '# Neutral page\n')
  await writeFixture(root, 'content/docs/sdk/base/index.mdx', '# Neutral page\n')
  await writeFixture(root, 'content/docs/sdk/database/index.mdx', '# Neutral page\n')

  const result = await validateTokenSymbolFiles({ root })
  assert.deepEqual(result.issues.map((issue) => [issue.file, issue.generatedSource, issue.policyId, issue.value]), [
    ['content/docs/sdk/base/index.mdx', '$filePath', 'coinbase-base', '/sdk/base'],
    ['content/docs/sdk/usdc/index.mdx', '$filePath', 'circle-usd', 'usdc']
  ])
})

test('scans canonical reader build artifacts without compiled chunks or duplicate route payloads', async (testContext) => {
  const root = await fixtureRoot(testContext, 'wdk-competing-build-')
  const buildFiles = {
    'dist/assets/entry.js': "const asset = 'DAI'\n",
    'dist/assets/icon.svg': '<svg><title>DAI</title></svg>\n',
    'dist/assets/style.css': '/* DAI */\n',
    'dist/_next/static/chunks/vendor.js': "const asset = 'DAI'\nconst month = instance.$M\n",
    'dist/_next/static/media/reader-diagram.svg': '<svg><title>DAI</title></svg>\n',
    'dist/index.html': '<!doctype html><p>DAI</p>\n',
    'dist/page.html': '<!doctype html><p>Dai Stablecoin</p>\n',
    'dist/data.json': '{"symbol":"DAI"}\n',
    'dist/feed.xml': '<asset>DAI</asset>\n',
    'dist/docs/index.txt': 'DAI canonical route payload\n',
    'dist/docs/not-index.txt': 'DAI arbitrary route payload\n',
    'dist/docs/page.md': '# DAI build page\n',
    'dist/docs/page/index.html': '<!doctype html><p>DAI paired HTML duplicate</p>\n',
    'dist/docs/page/index.txt': 'DAI paired RSC duplicate\n',
    'dist/llms-full.txt': '# DAI build LLM output\n',
    'dist/llms.txt': '# DAI build index\n',
    'dist/api/search': JSON.stringify({
      docs: { docs: { 'route-doc': { title: 'DAI' } } }
    }),
    'dist/api/search.json': JSON.stringify({
      docs: { docs: { 'build-doc': { title: 'Dai Stablecoin' } } }
    }),
    'dist/ignored.txt': 'DAI should not be scanned as a generic build text file\n',
    'dist/ignored.yaml': 'symbol: DAI\n'
  }
  const requiredFiles = {
    'dist/index.html': buildFiles['dist/index.html'],
    'dist/llms-full.txt': buildFiles['dist/llms-full.txt'],
    'dist/llms.txt': buildFiles['dist/llms.txt'],
    'dist/api/search': buildFiles['dist/api/search'],
    'dist/api/search.json': buildFiles['dist/api/search.json']
  }
  for (const [relativePath, content] of Object.entries(buildFiles)) {
    await writeFixture(root, relativePath, content)
  }

  const cleanWithoutFlag = await validateTokenSymbolFiles({
    root,
    sourceDirectories: [],
    visibleSourceDirectories: [],
    visibleSourceFiles: [],
    catalogSourceFiles: [],
    generatedMarkdownFiles: [],
    generatedCatalogFiles: [],
    generatedSearchIndexFiles: []
  })
  assert.deepEqual(cleanWithoutFlag, { files: [], issues: [] })

  const withBuild = await validateTokenSymbolFiles(scanOnlyBuildOutput(root))
  const expectedFiles = Object.keys(requiredFiles)
    .concat([
      'dist/assets/entry.js',
      'dist/assets/icon.svg',
      'dist/assets/style.css',
      'dist/_next/static/media/reader-diagram.svg',
      'dist/data.json',
      'dist/docs/index.txt',
      'dist/docs/not-index.txt',
      'dist/docs/page.md',
      'dist/feed.xml',
      'dist/ignored.txt',
      'dist/ignored.yaml',
      'dist/page.html'
    ])
    .sort((left, right) => left.localeCompare(right))
  assert.deepEqual(relativeFiles(root, withBuild.files), expectedFiles)
  assert(!relativeFiles(root, withBuild.files).includes('dist/docs/page/index.html'))
  assert(!relativeFiles(root, withBuild.files).includes('dist/docs/page/index.txt'))
  assert(!relativeFiles(root, withBuild.files).includes('dist/_next/static/chunks/vendor.js'))
  assert.deepEqual(withBuild.issues.map((issue) => [
    issue.file,
    issue.generatedSource,
    issue.kind,
    issue.policyId,
    issue.value
  ]), [
    ['dist/_next/static/media/reader-diagram.svg', undefined, 'symbol', 'maker-dai', 'DAI'],
    ['dist/api/search', 'docs.docs', 'symbol', 'maker-dai', 'DAI'],
    ['dist/api/search.json', 'docs.docs', 'name', 'maker-dai', 'Dai Stablecoin'],
    ['dist/assets/entry.js', undefined, 'symbol', 'maker-dai', 'DAI'],
    ['dist/assets/icon.svg', undefined, 'symbol', 'maker-dai', 'DAI'],
    ['dist/assets/style.css', undefined, 'symbol', 'maker-dai', 'DAI'],
    ['dist/data.json', undefined, 'symbol', 'maker-dai', 'DAI'],
    ['dist/docs/index.txt', undefined, 'symbol', 'maker-dai', 'DAI'],
    ['dist/docs/not-index.txt', undefined, 'symbol', 'maker-dai', 'DAI'],
    ['dist/docs/page.md', undefined, 'symbol', 'maker-dai', 'DAI'],
    ['dist/feed.xml', undefined, 'symbol', 'maker-dai', 'DAI'],
    ['dist/ignored.txt', undefined, 'symbol', 'maker-dai', 'DAI'],
    ['dist/ignored.yaml', undefined, 'symbol', 'maker-dai', 'DAI'],
    ['dist/index.html', undefined, 'symbol', 'maker-dai', 'DAI'],
    ['dist/llms-full.txt', undefined, 'symbol', 'maker-dai', 'DAI'],
    ['dist/llms.txt', undefined, 'symbol', 'maker-dai', 'DAI'],
    ['dist/page.html', undefined, 'name', 'maker-dai', 'Dai Stablecoin']
  ])

  const cleanCli = await runChecker(root)
  assert.equal(cleanCli.code, 0)
  assert.match(cleanCli.stdout, /validated 0 documentation policy files\./)
  assert.equal(cleanCli.stderr, '')

  const buildCli = await runChecker(root, '--include-build-output')
  assert.equal(buildCli.code, 1)
  assert.match(buildCli.stderr, /- dist\/api\/search\.json/)
  assert.match(buildCli.stderr, /generated source: docs\.docs/)
  assert.match(buildCli.stderr, /found: "Dai Stablecoin"/)
  assert.match(buildCli.stderr, /policy: maker-dai \(Dai\) \[name\]/)
})

test('requires dist and every required build artifact when build output scanning is enabled', async (testContext) => {
  const root = await fixtureRoot(testContext, 'wdk-competing-build-required-')

  await assert.rejects(
    validateTokenSymbolFiles(scanOnlyBuildOutput(root)),
    new RegExp(`Build-output directory does not exist: ${root.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\/dist`)
  )

  await mkdir(path.join(root, 'dist'), { recursive: true })
  await writeFixture(root, 'dist/index.html', '<!doctype html>\n')
  const missing = await runChecker(root, '--include-build-output')
  assert.equal(missing.code, 1)
  assert.match(missing.stderr, /Build output dist is missing required files:/)
  assert.match(missing.stderr, /llms-full\.txt/)
  assert.match(missing.stderr, /llms\.txt/)
  assert.match(missing.stderr, /api\/search/)
  assert.match(missing.stderr, /api\/search\.json/)
})

test('emits deterministic CLI diagnostics with policy, kind, file, line, and column, and exits cleanly for valid content', async (testContext) => {
  const root = await fixtureRoot(testContext, 'wdk-competing-cli-')
  await writeFixture(root, 'content/docs/z-guide.md', [
    '# Guide',
    '',
    'Send DAI.',
    'On Base.'
  ].join('\n'))
  await writeFixture(root, 'content/docs/a-guide.md', 'Dai Stablecoin\n')

  const first = await runChecker(root)
  const second = await runChecker(root)
  assert.equal(first.code, 1)
  assert.equal(second.code, 1)
  assert.equal(first.stdout, '')
  assert.equal(first.stderr, second.stderr)
  assert.match(first.stderr, /❌ check-token-symbols: found 3 documentation-policy issue\(s\):/)
  assert.match(first.stderr, /- content\/docs\/a-guide\.md:1:1/)
  assert.match(first.stderr, /policy: maker-dai \(Dai\) \[name\]/)
  assert.match(first.stderr, /- content\/docs\/z-guide\.md:3:6/)
  assert.match(first.stderr, /policy: maker-dai \(Dai\) \[symbol\]/)
  assert.match(first.stderr, /found: "DAI"/)
  assert.match(first.stderr, /- content\/docs\/z-guide\.md:4:1/)
  assert.match(first.stderr, /policy: coinbase-base \(Coinbase Base\) \[chain-route\]/)
  assert(first.stderr.indexOf('content/docs/a-guide.md:1:1') < first.stderr.indexOf('content/docs/z-guide.md:3:6'))
  assert(first.stderr.indexOf('content/docs/z-guide.md:3:6') < first.stderr.indexOf('content/docs/z-guide.md:4:1'))

  const cleanRoot = await fixtureRoot(testContext, 'wdk-competing-cli-clean-')
  await writeFixture(cleanRoot, 'content/docs/clean.md', '# Supported documentation\nUse neutral assets.\n')
  const clean = await runChecker(cleanRoot)
  assert.equal(clean.code, 0)
  assert.equal(clean.stderr, '')
  assert.equal(clean.stdout, '✅ check-token-symbols: validated 1 documentation policy files.\n')
})
