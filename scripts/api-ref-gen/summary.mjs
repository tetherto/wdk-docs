#!/usr/bin/env node

import { fileURLToPath } from 'url'
import { getStepCounts, getStepSnapshotPath, isCliEntry, readJsonFile, SUMMARY_FILE } from './core.mjs'

export function getCounts (summary) {
  const steps = summary?.steps ?? []
  const { lastTag, ...counts } = getStepCounts(steps)
  return {
    ...counts,
    hasSummary: steps.length > 0
  }
}

export function getSuccessfulDocSteps (summary) {
  return (summary?.steps ?? [])
    .filter(step => step.status === 'ok' && step.docChanged)
    .map(step => ({
      key: step.key,
      fromTag: step.fromTag || '',
      toTag: step.toTag || '',
      outputPath: step.outputPath || '',
      snapshotPath: getStepSnapshotPath(step.key, step.toTag, step.outputPath),
      commitMessage: step.fromTag
        ? `docs(api-ref): update ${step.key} @ ${step.toTag}`
        : `docs(api-ref): bootstrap ${step.key} @ ${step.toTag}`
    }))
}

export function parseArgs (argv = process.argv.slice(2)) {
  const parsed = {
    mode: null,
    summaryFile: SUMMARY_FILE
  }

  for (let i = 0; i < argv.length; i++) {
    switch (argv[i]) {
      case '--mode':
        parsed.mode = argv[++i]
        break
      case '--summary-file':
        parsed.summaryFile = argv[++i]
        break
      default:
        throw new Error(`Unknown option: ${argv[i]}`)
    }
  }

  return parsed
}

export function usage () {
  console.log(`
WDK API Reference Summary Helper
================================

Usage:
  node summary.mjs --mode gha-outputs
  node summary.mjs --mode doc-steps
`)
}

export function renderGitHubOutputs (summary) {
  const counts = getCounts(summary)
  return [
    `has_summary=${counts.hasSummary}`,
    `attempts=${counts.attempts}`,
    `doc_changed=${counts.docChanged}`,
    `note_only=${counts.noteOnly}`,
    `failures=${counts.failures}`,
    `ripple_warnings=${counts.rippleWarnings}`
  ].join('\n') + '\n'
}

export function renderDocSteps (summary) {
  return getSuccessfulDocSteps(summary)
    .map(step => [
      step.key,
      step.fromTag,
      step.toTag,
      step.outputPath,
      step.snapshotPath,
      step.commitMessage
    ].join('\t'))
    .join('\n')
    .replace(/$/, '\n')
}

export async function main (argv = process.argv.slice(2)) {
  const args = parseArgs(argv)
  if (!args.mode) {
    usage()
    process.exit(1)
  }

  const summary = readJsonFile(args.summaryFile, null)
  switch (args.mode) {
    case 'gha-outputs':
      process.stdout.write(renderGitHubOutputs(summary))
      break
    case 'doc-steps':
      process.stdout.write(renderDocSteps(summary))
      break
    default:
      throw new Error(`Unknown mode: ${args.mode}`)
  }
}

if (isCliEntry(fileURLToPath(import.meta.url))) {
  main().catch(error => {
    console.error(`\n❌ ${error.message}\n`)
    usage()
    process.exitCode = 1
  })
}
