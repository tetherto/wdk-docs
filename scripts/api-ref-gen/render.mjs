#!/usr/bin/env node

import { writeFileSync } from 'fs'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import nunjucks from 'nunjucks'
import {
  compareSemver,
  ensureParentDir,
  getStepCounts,
  HISTORY_FILE,
  isCliEntry,
  MODULES,
  parseSemver,
  readJsonFile,
  ROOT,
  SUMMARY_FILE
} from './core.mjs'

export const COMMENT_MARKER = '<!-- api-ref-history-comment -->'
export const TEMPLATES_DIR = resolve(ROOT, 'templates')

const env = new nunjucks.Environment(
  new nunjucks.FileSystemLoader(TEMPLATES_DIR, { noCache: true }),
  {
    autoescape: false,
    lstripBlocks: true,
    trimBlocks: true,
    throwOnUndefined: false
  }
)

env.addFilter('code', value => value ? `\`${value}\`` : '`-`')
env.addFilter('shortSha', value => value ? String(value).slice(0, 7) : '-')

function sortHistorySteps (steps = []) {
  return [...steps].sort((left, right) => {
    const leftTag = parseSemver(left.toTag)
    const rightTag = parseSemver(right.toTag)
    if (leftTag && rightTag) return compareSemver(leftTag, rightTag)
    if (left.toTag && right.toTag) return String(left.toTag).localeCompare(String(right.toTag))
    if (left.toTag) return 1
    if (right.toTag) return -1
    return 0
  })
}

function buildModuleHistory (history = {}, modules = MODULES) {
  return Object.entries(history)
    .filter(([, steps]) => Array.isArray(steps) && steps.length > 0)
    .map(([key, steps]) => ({
      key,
      name: modules[key]?.name ?? key,
      outputPath: modules[key]?.outputPath ?? steps.at(-1)?.outputPath ?? null,
      steps: sortHistorySteps(steps).map(step => ({
        ...step,
        docsChangedLabel: step.docChanged ? 'yes' : 'no',
        rippleWarnings: step.rippleWarnings ?? []
      }))
    }))
}

export function createRenderModel ({
  eventName = 'manual',
  module = 'all',
  summary = {},
  history = {},
  modules = MODULES
} = {}) {
  const steps = summary.steps ?? []
  const moduleHistory = buildModuleHistory(history, modules)
  const run = getStepCounts(steps)

  return {
    eventName,
    module,
    moduleLabel: module === 'all' ? 'all modules' : module,
    generatedAt: summary.timestamp ?? new Date().toISOString(),
    run,
    steps,
    modules: moduleHistory,
    failedSteps: steps.filter(step => step.status === 'failed'),
    noteOnlySteps: steps.filter(step => step.status === 'ok' && !step.docChanged)
  }
}

export function renderPrBody (input) {
  return env.render('pr-body.njk', createRenderModel(input)).trim() + '\n'
}

export function renderPrComment (input) {
  return env.render('pr-comment.njk', {
    ...createRenderModel(input),
    commentMarker: COMMENT_MARKER
  }).trim() + '\n'
}

export function renderStepSummary (input) {
  const model = createRenderModel(input)
  const lines = [
    '# API Reference Run Summary',
    '',
    `- Trigger: \`${model.eventName}\``,
    `- Module scope: \`${model.moduleLabel}\``,
    `- Versions processed: ${model.run.attempts}`,
    `- Docs changed: ${model.run.docChanged}`,
    `- Note-only versions: ${model.run.noteOnly}`,
    `- Failures: ${model.run.failures}`,
    `- Ripple warnings: ${model.run.rippleWarnings}`,
    ''
  ]

  if (model.steps.length > 0) {
    lines.push('| Module | Version | Docs | Status | Ripple |')
    lines.push('|--------|---------|------|--------|--------|')
    for (const step of model.steps) {
      const docs = step.docChanged ? 'changed' : 'note-only'
      const version = step.toTag ? `\`${step.toTag}\`` : '`-`'
      lines.push(`| \`${step.key}\` | ${version} | ${docs} | ${step.status} | ${step.rippleWarnings.length} |`)
    }
    lines.push('')
  }

  if (model.failedSteps.length > 0) {
    lines.push('## Failed Versions', '')
    for (const step of model.failedSteps) {
      lines.push(`- \`${step.key}\` at \`${step.toTag || 'unknown'}\``)
    }
    lines.push('')
  }

  return lines.join('\n').trim() + '\n'
}

export function writeRenderedOutput (filePath, content) {
  ensureParentDir(filePath)
  writeFileSync(filePath, content, 'utf-8')
}

export function parseArgs (argv = process.argv.slice(2)) {
  const parsed = {
    mode: null,
    output: null,
    eventName: 'manual',
    module: 'all',
    summaryFile: SUMMARY_FILE,
    historyFile: HISTORY_FILE
  }

  for (let i = 0; i < argv.length; i++) {
    switch (argv[i]) {
      case '--mode':
        parsed.mode = argv[++i]
        break
      case '--output':
        parsed.output = argv[++i]
        break
      case '--event-name':
        parsed.eventName = argv[++i]
        break
      case '--module':
        parsed.module = argv[++i]
        break
      case '--summary-file':
        parsed.summaryFile = argv[++i]
        break
      case '--history-file':
        parsed.historyFile = argv[++i]
        break
      default:
        throw new Error(`Unknown option: ${argv[i]}`)
    }
  }

  return parsed
}

export function usage () {
  console.log(`
WDK API Reference Renderer
==========================

Usage:
  node render.mjs --mode pr-body --output /tmp/pr-body.md
  node render.mjs --mode pr-comment --output /tmp/pr-comment.md
  node render.mjs --mode step-summary --output /tmp/summary.md

Options:
  --mode <pr-body|pr-comment|step-summary>
  --output <path>
  --event-name <name>
  --module <key|all>
  --summary-file <path>
  --history-file <path>
`)
}

export function loadRenderInput ({ summaryFile = SUMMARY_FILE, historyFile = HISTORY_FILE } = {}) {
  return {
    summary: readJsonFile(summaryFile, { steps: [], modules: [], timestamp: null }),
    history: readJsonFile(historyFile, {})
  }
}

export function renderByMode (mode, input) {
  switch (mode) {
    case 'pr-body':
      return renderPrBody(input)
    case 'pr-comment':
      return renderPrComment(input)
    case 'step-summary':
      return renderStepSummary(input)
    default:
      throw new Error(`Unknown render mode: ${mode}`)
  }
}

export async function main (argv = process.argv.slice(2)) {
  const args = parseArgs(argv)

  if (!args.mode || !args.output) {
    usage()
    process.exit(1)
  }

  const files = loadRenderInput(args)
  const content = renderByMode(args.mode, {
    eventName: args.eventName,
    module: args.module,
    ...files
  })

  writeRenderedOutput(args.output, content)
}

if (isCliEntry(fileURLToPath(import.meta.url))) {
  main().catch(error => {
    console.error(`\n❌ ${error.message}\n`)
    usage()
    process.exitCode = 1
  })
}
