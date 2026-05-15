#!/usr/bin/env node

export * from './core.mjs'

import { fileURLToPath } from 'url'
import { cleanupWorkDir, isCliEntry, main, usage } from './core.mjs'

if (isCliEntry(fileURLToPath(import.meta.url))) {
  main().catch(error => {
    console.error(`\n❌ ${error.message}\n`)
    usage()
    process.exitCode = 1
  }).finally(() => {
    cleanupWorkDir()
  })
}
