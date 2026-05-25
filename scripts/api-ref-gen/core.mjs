import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, readdirSync } from 'fs'
import { execSync } from 'child_process'
import { resolve, dirname, join, basename } from 'path'
import { fileURLToPath } from 'url'
import { transform } from './transform.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export const ROOT = resolve(__dirname, '../..')
export const MODULES_FILE = join(__dirname, 'modules.json')
export const TEMP_DIR = join(__dirname, '.tmp')
export const WORK_DIR = join(TEMP_DIR, 'work')
export const SNAPSHOT_DIR = join(TEMP_DIR, 'snapshots')
export const SHA_FILE = join(__dirname, 'last-synced-shas.json')
export const HISTORY_FILE = join(__dirname, 'sync-history.json')
export const SUMMARY_FILE = join(__dirname, '.generate-summary.json')

export const MODULES = loadModules()

function run (cmd, opts = {}) {
  console.log(`  $ ${cmd}`)
  return execSync(cmd, { stdio: 'inherit', ...opts })
}

export function usage () {
  console.log(`
WDK API Reference Generator
============================

Usage:
  node generate.mjs --module <key>               Generate for a single module
  node generate.mjs --module all                 Generate latest docs for all modules
  node generate.mjs --module <key> --replay-pending
                                                  Replay each pending tag after the stored tag
  node generate.mjs --module all --replay-pending
                                                  Replay pending tags for all modules
  node generate.mjs --module <key> --typedoc-json <path>
                                                  Use pre-built TypeDoc JSON
  node generate.mjs --list                        List available modules

Options:
  --module <key>          Module key from modules.json (or "all")
  --replay-pending        Replay pending tags after the stored sync tag
  --force                 Single-module only; replay pending tags if any exist,
                          otherwise regenerate the latest tag once
  --typedoc-json <path>   Path to existing TypeDoc JSON (skips clone + typedoc)
  --branch <name>         Git branch/tag to clone (default: main)
  --list                  Print all registered modules and exit
  --help                  Show this help message
`)
}

export function listModules (modules = MODULES) {
  console.log('\nRegistered modules:\n')
  console.log('  Key                     Package')
  console.log('  ────────────────────    ──────────────────────────────────────────')
  for (const [key, mod] of Object.entries(modules)) {
    console.log(`  ${key.padEnd(22)}  ${mod.package}`)
  }
  console.log()
}

export function parseArgs (argv = process.argv.slice(2)) {
  const parsed = {
    module: null,
    typedocJson: null,
    branch: 'main',
    replayPending: false,
    force: false
  }

  for (let i = 0; i < argv.length; i++) {
    switch (argv[i]) {
      case '--module':
        parsed.module = argv[++i]
        break
      case '--typedoc-json':
        parsed.typedocJson = argv[++i]
        break
      case '--branch':
        parsed.branch = argv[++i]
        break
      case '--replay-pending':
        parsed.replayPending = true
        break
      case '--check-updates':
        parsed.replayPending = true
        break
      case '--force':
        parsed.force = true
        break
      case '--list':
        listModules()
        process.exit(0)
        break // eslint-disable-line no-unreachable
      case '--help':
        usage()
        process.exit(0)
        break // eslint-disable-line no-unreachable
      default:
        throw new Error(`Unknown option: ${argv[i]}`)
    }
  }

  return parsed
}

export function loadModules (filePath = MODULES_FILE) {
  return JSON.parse(readFileSync(filePath, 'utf-8'))
}

export function readJsonFile (filePath, fallback) {
  if (!existsSync(filePath)) return fallback
  return JSON.parse(readFileSync(filePath, 'utf-8'))
}

function writeJsonFile (filePath, value) {
  writeFileSync(filePath, JSON.stringify(value, null, 2) + '\n')
}

export function ensureParentDir (filePath) {
  mkdirSync(dirname(resolve(filePath)), { recursive: true })
}

export function getStepCounts (steps = []) {
  return steps.reduce((acc, step) => {
    acc.attempts += 1
    if (step.status === 'ok' && step.docChanged) acc.docChanged += 1
    if (step.status === 'ok' && !step.docChanged) acc.noteOnly += 1
    if (step.status === 'failed') acc.failures += 1
    acc.rippleWarnings += step.rippleWarnings?.length ?? 0
    if (step.toTag) acc.lastTag = step.toTag
    return acc
  }, {
    attempts: 0,
    docChanged: 0,
    noteOnly: 0,
    failures: 0,
    rippleWarnings: 0,
    lastTag: null
  })
}

/* ── Semver helpers ── */

const SEMVER_RE = /^v?(\d+)\.(\d+)\.(\d+)(?:-([a-zA-Z]+)[.]?(\d+))?$/
const ALLOWED_PRE = new Set([null, 'beta'])

export function parseSemver (tag) {
  const m = String(tag || '').match(SEMVER_RE)
  if (!m) return null
  return {
    major: Number(m[1]),
    minor: Number(m[2]),
    patch: Number(m[3]),
    preLabel: m[4] || null,
    preNum: m[5] != null ? Number(m[5]) : null,
    raw: tag
  }
}

export function isAllowedTag (parsed) {
  return parsed != null && ALLOWED_PRE.has(parsed.preLabel)
}

export function compareSemver (a, b) {
  if (a.major !== b.major) return a.major - b.major
  if (a.minor !== b.minor) return a.minor - b.minor
  if (a.patch !== b.patch) return a.patch - b.patch
  if (!a.preLabel && b.preLabel) return 1
  if (a.preLabel && !b.preLabel) return -1
  if (!a.preLabel && !b.preLabel) return 0
  return (a.preNum ?? 0) - (b.preNum ?? 0)
}

/* ── State helpers ── */

export function loadSyncState (filePath = SHA_FILE) {
  return readJsonFile(filePath, {})
}

export function saveSyncState (state, filePath = SHA_FILE) {
  writeJsonFile(filePath, state)
}

export function loadSyncHistory (filePath = HISTORY_FILE) {
  return readJsonFile(filePath, {})
}

export function saveSyncHistory (history, filePath = HISTORY_FILE) {
  writeJsonFile(filePath, history)
}

export function upsertHistoryStep (history, moduleKey, step) {
  const next = history[moduleKey] ? [...history[moduleKey]] : []
  const existingIndex = next.findIndex(entry => entry.toTag === step.toTag && entry.sha === step.sha)
  if (existingIndex >= 0) {
    next[existingIndex] = step
  } else {
    next.push(step)
  }
  history[moduleKey] = next
  return history
}

/* ── GitHub / tag metadata ── */

export function normalizeReleaseBody (body) {
  if (!body) return ''
  return String(body)
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/```(\w+)?\n\n/g, '```$1\n')
    .trim()
}

function getGitHubToken (env = process.env) {
  return env.GH_TOKEN || env.GITHUB_TOKEN || null
}

async function fetchJson (url, token, fetchImpl = globalThis.fetch) {
  if (typeof fetchImpl !== 'function') {
    throw new Error('fetch is not available in this Node runtime')
  }

  const headers = {
    Accept: 'application/vnd.github+json'
  }

  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetchImpl(url, { headers })
  if (res.status === 404) return null
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`GitHub API ${res.status}: ${text}`)
  }

  return res.json()
}

export function createGitHubRemote (options = {}) {
  const token = options.token ?? getGitHubToken(options.env)
  const fetchImpl = options.fetchImpl ?? globalThis.fetch

  return {
    listTags (repo) {
      const url = `https://github.com/${repo}.git`
      const output = execSync(`git ls-remote --tags ${url}`, {
        encoding: 'utf-8',
        timeout: 15_000,
        stdio: ['pipe', 'pipe', 'pipe']
      })

      if (!output.trim()) return []

      return output.trim().split('\n')
        .filter(line => line && !line.includes('^{}'))
        .map(line => {
          const [sha, ref] = line.split('\t')
          return {
            sha: sha.trim(),
            tag: ref.replace('refs/tags/', '')
          }
        })
    },

    async getReleaseByTag (repo, tag) {
      return fetchJson(`https://api.github.com/repos/${repo}/releases/tags/${encodeURIComponent(tag)}`, token, fetchImpl)
    },

    async getCompare (repo, baseTag, headTag) {
      if (!baseTag || !headTag) return null
      return fetchJson(
        `https://api.github.com/repos/${repo}/compare/${encodeURIComponent(baseTag)}...${encodeURIComponent(headTag)}`,
        token,
        fetchImpl
      )
    }
  }
}

export function listAllowedTags (repo, remote = createGitHubRemote()) {
  const entries = remote.listTags(repo)
    .filter(entry => {
      const semver = parseSemver(entry.tag)
      return semver && isAllowedTag(semver)
    })
    .sort((a, b) => compareSemver(parseSemver(a.tag), parseSemver(b.tag)))

  return entries
}

export function getLatestTag (repo, remote = createGitHubRemote()) {
  const tags = listAllowedTags(repo, remote)
  return tags[tags.length - 1] ?? null
}

export function getPendingTags (moduleKey, storedTag, remote = createGitHubRemote(), modules = MODULES) {
  const mod = modules[moduleKey]
  if (!mod) throw new Error(`Unknown module key: "${moduleKey}"`)

  const tags = listAllowedTags(mod.repo, remote)
  if (!storedTag) return tags

  const index = tags.findIndex(entry => entry.tag === storedTag)
  if (index === -1) return tags
  return tags.slice(index + 1)
}

function summarizeCompare (compare, compareUrl) {
  const commits = compare?.commits ?? []
  const titles = commits
    .map(commit => commit.commit?.message?.split('\n')[0]?.trim())
    .filter(Boolean)
    .slice(0, 5)

  const lines = []
  const total = compare?.total_commits ?? commits.length
  if (total > 0) {
    lines.push(`Changes across ${total} commit${total === 1 ? '' : 's'}.`)
  }
  if (titles.length > 0) {
    lines.push('', ...titles.map(title => `- ${title}`))
  }
  if (compareUrl) {
    lines.push('', `Full Changelog: ${compareUrl}`)
  }
  return normalizeReleaseBody(lines.join('\n'))
}

export async function getVersionMetadata ({ repo, fromTag, toTag, remote = createGitHubRemote() }) {
  const compareUrl = fromTag ? `https://github.com/${repo}/compare/${fromTag}...${toTag}` : null
  let releaseUrl = `https://github.com/${repo}/releases/tag/${toTag}`
  let releaseBody = ''

  try {
    const release = await remote.getReleaseByTag(repo, toTag)
    if (release) {
      releaseUrl = release.html_url || releaseUrl
      releaseBody = normalizeReleaseBody(release.body)
    }
  } catch (error) {
    console.warn(`  ! Could not fetch release metadata for ${repo}@${toTag}: ${error.message}`)
  }

  if (!releaseBody && compareUrl) {
    try {
      const compare = await remote.getCompare(repo, fromTag, toTag)
      releaseBody = summarizeCompare(compare, compareUrl)
    } catch (error) {
      console.warn(`  ! Could not fetch compare metadata for ${repo} ${fromTag}...${toTag}: ${error.message}`)
    }
  }

  return {
    compareUrl,
    releaseBody,
    releaseUrl
  }
}

/* ── Ripple detection ── */

function extractHeadingSymbols (text) {
  const lines = String(text || '').split(/\r?\n/)
  const symbols = new Set()

  for (const line of lines) {
    const match = line.match(/^#{2,3}\s+(.+?)\s*$/)
    if (!match) continue

    const normalized = match[1]
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/`/g, '')
      .replace(/\s+\[source\]$/i, '')
      .trim()

    if (normalized) symbols.add(normalized)
  }

  return symbols
}

function shouldCheckSymbol (symbol) {
  return /[a-z][A-Z]/.test(symbol) || /^[A-Z][A-Za-z0-9]+$/.test(symbol)
}

export function checkRippleEffect (previousDoc, nextDoc, moduleDir) {
  if (!previousDoc || !nextDoc || !moduleDir || !existsSync(moduleDir)) return []

  const before = extractHeadingSymbols(previousDoc)
  const after = extractHeadingSymbols(nextDoc)
  const removed = [...before].filter(symbol => !after.has(symbol) && shouldCheckSymbol(symbol))

  if (removed.length === 0) return []

  const warnings = []
  for (const entry of readdirSync(moduleDir, { withFileTypes: true })) {
    if (!entry.isFile()) continue
    if (!entry.name.endsWith('.mdx')) continue
    if (entry.name === 'api-reference.mdx') continue

    const filePath = join(moduleDir, entry.name)
    const content = readFileSync(filePath, 'utf-8')

    for (const symbol of removed) {
      if (content.includes(symbol)) {
        warnings.push({
          file: entry.name,
          symbol
        })
      }
    }
  }

  const deduped = new Map()
  for (const warning of warnings) {
    deduped.set(`${warning.file}:${warning.symbol}`, warning)
  }

  return [...deduped.values()]
}

/* ── Clone & build pipeline ── */

function cloneAndInstall (mod, ref) {
  const repoUrl = `https://github.com/${mod.repo}.git`
  const cloneDir = join(WORK_DIR, mod.repo.split('/')[1])

  if (existsSync(cloneDir)) rmSync(cloneDir, { recursive: true })
  mkdirSync(WORK_DIR, { recursive: true })

  console.log(`\n  Cloning ${mod.repo} (ref: ${ref}) ...`)
  run(`git clone --depth 1 --branch ${ref} ${repoUrl} "${cloneDir}"`, { timeout: 120_000 })

  const npmToken = process.env.NPM_READ_TOKEN
  if (npmToken) {
    writeFileSync(
      join(cloneDir, '.npmrc'),
      `//registry.npmjs.org/:_authToken=${npmToken}\n`
    )
  }

  console.log('  Installing dependencies ...')
  run('npm install --ignore-scripts', { cwd: cloneDir, timeout: 300_000 })

  return cloneDir
}

function runTypedoc (cloneDir, entryPoint) {
  mkdirSync(WORK_DIR, { recursive: true })
  const outputJson = join(WORK_DIR, 'typedoc-output.json')
  const entry = join(cloneDir, entryPoint)

  if (!existsSync(entry)) {
    throw new Error(
      `Entry point not found: ${entry}\n` +
      '  Check the "entryPoint" field in modules.json for this module.'
    )
  }

  const typedocBin = join(__dirname, 'node_modules', '.bin', 'typedoc')
  const tsconfig = join(cloneDir, 'tsconfig.json')
  const tsconfigFlag = existsSync(tsconfig) ? `--tsconfig "${tsconfig}"` : ''

  console.log('  Running TypeDoc ...')
  run(
    `"${typedocBin}" --json "${outputJson}" --entryPointStrategy expand ` +
    `--excludePrivate --excludeInternal ` +
    `${tsconfigFlag} "${entry}"`,
    { cwd: cloneDir, timeout: 120_000 }
  )

  return outputJson
}

/**
 * Generate API reference for a single module.
 * @returns {{ lines, classes, types, functions, enums, outputPath }} stats from the transform
 */
export function generateForModule (key, opts = {}) {
  const modules = opts.modules ?? MODULES
  const mod = modules[key]
  if (!mod) {
    throw new Error(`Unknown module key: "${key}"`)
  }

  if (mod.deprecated) {
    console.log(`\n  ⊘ Skipping deprecated module: ${mod.name} (${key})`)
    return null
  }

  console.log(`\n──────────────────────────────────────────`)
  console.log(`  Module: ${mod.name} (${mod.package})`)
  console.log(`──────────────────────────────────────────`)

  let typedocJsonPath = opts.typedocJson
  let cloneDir = null

  if (!typedocJsonPath) {
    const ref = opts.ref || opts.branch || 'main'
    cloneDir = cloneAndInstall(mod, ref)
    typedocJsonPath = runTypedoc(cloneDir, mod.entryPoint)
  } else {
    typedocJsonPath = resolve(typedocJsonPath)
    if (!existsSync(typedocJsonPath)) {
      throw new Error(`TypeDoc JSON not found: ${typedocJsonPath}`)
    }
    console.log(`  Using pre-built TypeDoc JSON: ${typedocJsonPath}`)
  }

  const outputPath = resolve(ROOT, mod.outputPath)
  mkdirSync(dirname(outputPath), { recursive: true })

  console.log('  Transforming TypeDoc JSON → MDX ...')
  const stats = transform({
    inputPath: typedocJsonPath,
    outputPath,
    moduleConfig: mod
  })

  const parts = [`${stats.classes} classes`, `${stats.types} types`]
  if (stats.functions) parts.push(`${stats.functions} functions`)
  if (stats.enums) parts.push(`${stats.enums} enums`)
  console.log(`  ✓ Generated ${stats.lines} lines (${parts.join(', ')})`)
  console.log(`  → ${mod.outputPath}`)

  if (cloneDir) {
    rmSync(cloneDir, { recursive: true, force: true })
  }

  return { ...stats, outputPath: mod.outputPath }
}

function readDoc (filePath) {
  if (!filePath || !existsSync(filePath)) return null
  return readFileSync(filePath, 'utf-8')
}

export function getStepSnapshotPath (key, toTag, outputPath) {
  const safeTag = String(toTag || 'manual').replace(/[^\w.-]+/g, '_')
  return join(SNAPSHOT_DIR, key, safeTag, basename(outputPath || 'api-reference.mdx'))
}

function writeStepSnapshot (step, absoluteOutputPath, content) {
  if (!step.docChanged || !content) return
  const snapshotPath = getStepSnapshotPath(step.key, step.toTag, absoluteOutputPath)
  mkdirSync(dirname(snapshotPath), { recursive: true })
  writeFileSync(snapshotPath, content, 'utf-8')
}

function aggregateModuleSummaries (steps) {
  const grouped = new Map()

  for (const step of steps) {
    const current = grouped.get(step.key) ?? {
      key: step.key,
      outputPath: step.outputPath,
      attempts: 0,
      successes: 0,
      failures: 0,
      noteOnly: 0,
      rippleWarningCount: 0,
      lastTag: null
    }

    current.attempts += 1
    if (step.status === 'ok') current.successes += 1
    if (step.status === 'failed') current.failures += 1
    if (step.status === 'ok' && !step.docChanged) current.noteOnly += 1
    current.rippleWarningCount += step.rippleWarnings.length
    current.lastTag = step.toTag

    grouped.set(step.key, current)
  }

  return [...grouped.values()]
}

function writeSummary (steps, summaryFile = SUMMARY_FILE) {
  if (!summaryFile || steps.length === 0) return
  writeJsonFile(summaryFile, {
    timestamp: new Date().toISOString(),
    steps,
    modules: aggregateModuleSummaries(steps)
  })
}

function selectRefsForModule (key, args, storedEntry, remote, modules = MODULES) {
  const mod = modules[key]
  const storedTag = storedEntry?.tag || null

  if (args.typedocJson) {
    return [{
      ref: args.branch,
      tag: null,
      sha: null
    }]
  }

  if (args.replayPending) {
    return getPendingTags(key, storedTag, remote, modules)
      .map(entry => ({ ref: entry.tag, tag: entry.tag, sha: entry.sha }))
  }

  if (args.force) {
    if (args.module === 'all') {
      throw new Error('--force cannot be used with --module all')
    }

    const pending = getPendingTags(key, storedTag, remote, modules)
    if (pending.length > 0) {
      return pending.map(entry => ({ ref: entry.tag, tag: entry.tag, sha: entry.sha }))
    }

    const latest = getLatestTag(mod.repo, remote)
    return latest
      ? [{ ref: latest.tag, tag: latest.tag, sha: latest.sha }]
      : [{ ref: args.branch, tag: null, sha: null }]
  }

  if (args.branch !== 'main') {
    const explicitTag = parseSemver(args.branch) ? args.branch : null
    return [{ ref: args.branch, tag: explicitTag, sha: null }]
  }

  const latest = getLatestTag(mod.repo, remote)
  return latest
    ? [{ ref: latest.tag, tag: latest.tag, sha: latest.sha }]
    : [{ ref: args.branch, tag: null, sha: null }]
}

export async function runGeneration (args, options = {}) {
  const modules = options.modules ?? MODULES
  const remote = options.remote ?? createGitHubRemote(options.remoteOptions)
  const generateModule = options.generateModule ?? generateForModule
  const stateFile = options.stateFile ?? SHA_FILE
  const historyFile = options.historyFile ?? HISTORY_FILE
  const persist = options.persist ?? true
  const summaryFile = options.summaryFile ?? (persist ? SUMMARY_FILE : null)
  const log = options.log ?? console

  if (!args.module) {
    throw new Error('Missing required --module argument')
  }

  if (args.typedocJson && args.module === 'all') {
    throw new Error('--typedoc-json cannot be used with --module all')
  }

  if (args.force && args.module === 'all') {
    throw new Error('--force cannot be used with --module all')
  }

  if (args.typedocJson && (args.force || args.replayPending)) {
    throw new Error('--typedoc-json cannot be combined with --force or --replay-pending')
  }

  const moduleKeys = args.module === 'all'
    ? Object.keys(modules).filter(key => !modules[key].deprecated)
    : [args.module]

  const currentState = options.syncState ?? loadSyncState(stateFile)
  const currentHistory = options.syncHistory ?? loadSyncHistory(historyFile)
  const nextState = structuredClone(currentState)
  const nextHistory = structuredClone(currentHistory)
  const steps = []

  for (const key of moduleKeys) {
    const mod = modules[key]
    if (!mod) {
      throw new Error(`Unknown module key: "${key}"`)
    }

    const refs = selectRefsForModule(key, args, nextState[key], remote, modules)
    if (args.replayPending && refs.length === 0) {
      log.log(`  ○ ${key} — no pending tags after ${nextState[key]?.tag || '∅'}`)
      continue
    }

    for (const refInfo of refs) {
      const fromTag = nextState[key]?.tag || null
      const outputPath = resolve(ROOT, mod.outputPath)
      const previousDoc = readDoc(outputPath)
      const metadata = (refInfo.tag && !args.typedocJson)
        ? await getVersionMetadata({
            repo: mod.repo,
            fromTag,
            toTag: refInfo.tag,
            remote
          })
        : { compareUrl: null, releaseBody: '', releaseUrl: null }

      try {
        const stats = generateModule(key, {
          branch: args.branch,
          modules,
          ref: refInfo.ref,
          typedocJson: args.typedocJson
        })

        const nextDoc = readDoc(outputPath)
        const docChanged = previousDoc !== nextDoc
        const rippleWarnings = docChanged
          ? checkRippleEffect(previousDoc, nextDoc, dirname(outputPath))
          : []

        const step = {
          key,
          fromTag,
          toTag: refInfo.tag,
          sha: refInfo.sha,
          docChanged,
          status: 'ok',
          stats,
          outputPath: mod.outputPath,
          releaseUrl: metadata.releaseUrl,
          compareUrl: metadata.compareUrl,
          releaseBody: metadata.releaseBody,
          rippleWarnings
        }

        writeStepSnapshot(step, outputPath, nextDoc)
        steps.push(step)
        upsertHistoryStep(nextHistory, key, step)
        if (refInfo.tag && refInfo.sha) {
          nextState[key] = { tag: refInfo.tag, sha: refInfo.sha }
        }

        if (args.replayPending) {
          const icon = docChanged ? '✓' : '○'
          log.log(`  ${icon} ${key} ${fromTag ? `${fromTag} → ` : ''}${refInfo.tag}${docChanged ? '' : ' (no doc diff)'}`)
        }
      } catch (error) {
        const failedStep = {
          key,
          fromTag,
          toTag: refInfo.tag,
          sha: refInfo.sha,
          docChanged: false,
          status: 'failed',
          stats: null,
          outputPath: mod.outputPath,
          releaseUrl: metadata.releaseUrl,
          compareUrl: metadata.compareUrl,
          releaseBody: metadata.releaseBody,
          rippleWarnings: []
        }

        steps.push(failedStep)
        upsertHistoryStep(nextHistory, key, failedStep)
        log.error(`\n  ✗ Failed: ${key}${refInfo.tag ? ` @ ${refInfo.tag}` : ''} — ${error.message}\n`)
        break
      }
    }
  }

  if (persist) {
    saveSyncState(nextState, stateFile)
    saveSyncHistory(nextHistory, historyFile)
  }

  writeSummary(steps, summaryFile)

  return {
    history: nextHistory,
    state: nextState,
    steps,
    summary: {
      modules: aggregateModuleSummaries(steps),
      timestamp: new Date().toISOString()
    }
  }
}

export async function main (argv = process.argv.slice(2), options = {}) {
  const args = parseArgs(argv)
  if (!args.module) {
    usage()
    process.exit(1)
  }

  const result = await runGeneration(args, options)

  if (result.steps.length === 0) {
    console.log('\n  Nothing to generate.\n')
    return result
  }

  console.log('\n══════════════════════════════════════════')
  console.log('  Summary')
  console.log('══════════════════════════════════════════')
  for (const step of result.steps) {
    const icon = step.status === 'ok' ? (step.docChanged ? '✓' : '○') : '✗'
    const tagPart = step.toTag ? ` @ ${step.toTag}` : ''
    const notePart = step.status === 'ok' && !step.docChanged ? ' (no doc diff)' : ''
    console.log(`  ${icon} ${step.key}${tagPart}${notePart}`)
  }
  console.log()

  return result
}

export function cleanupWorkDir () {
  if (existsSync(WORK_DIR)) {
    rmSync(WORK_DIR, { recursive: true, force: true })
  }
}

export function cleanupTempDir () {
  if (existsSync(TEMP_DIR)) {
    rmSync(TEMP_DIR, { recursive: true, force: true })
  }
}

export function removeSummaryFile (summaryFile = SUMMARY_FILE) {
  if (existsSync(summaryFile)) {
    rmSync(summaryFile, { force: true })
  }
}

export function isCliEntry (currentFile = __filename) {
  return process.argv[1] && resolve(process.argv[1]) === currentFile
}
