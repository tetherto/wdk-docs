import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'fs'
import { renderPrBody, renderPrComment, renderStepSummary } from '../render.mjs'

const bodySnapshot = readFileSync(new URL('./fixtures/render/pr-body.md', import.meta.url), 'utf-8')
const commentSnapshot = readFileSync(new URL('./fixtures/render/pr-comment.md', import.meta.url), 'utf-8')
const stepSummarySnapshot = readFileSync(new URL('./fixtures/render/step-summary.md', import.meta.url), 'utf-8')

const renderInput = {
  eventName: 'workflow_dispatch',
  module: 'wallet-spark',
  summary: {
    timestamp: '2026-04-15T07:00:00.000Z',
    steps: [
      {
        key: 'wallet-spark',
        fromTag: 'v1.0.0-beta.12',
        toTag: 'v1.0.0-beta.13',
        sha: 'a8174040f6d2dae46df31560adf168cc91a5eecb',
        docChanged: true,
        status: 'ok',
        stats: { lines: 120, classes: 1, types: 2, functions: 0, enums: 0, outputPath: 'ignored' },
        outputPath: 'content/docs/sdk/wallet-modules/wallet-spark/api-reference.mdx',
        releaseUrl: 'https://github.com/tetherto/wdk-wallet-spark/releases/tag/v1.0.0-beta.13',
        compareUrl: 'https://github.com/tetherto/wdk-wallet-spark/compare/v1.0.0-beta.12...v1.0.0-beta.13',
        releaseBody: "## What's Changed\n- Added staged sync support.",
        rippleWarnings: []
      },
      {
        key: 'wallet-spark',
        fromTag: 'v1.0.0-beta.13',
        toTag: 'v1.0.0-beta.14',
        sha: 'cb0ac35fe73249bf6ff72cfd9a945a538576fa44',
        docChanged: false,
        status: 'ok',
        stats: { lines: 120, classes: 1, types: 2, functions: 0, enums: 0, outputPath: 'ignored' },
        outputPath: 'content/docs/sdk/wallet-modules/wallet-spark/api-reference.mdx',
        releaseUrl: 'https://github.com/tetherto/wdk-wallet-spark/releases/tag/v1.0.0-beta.14',
        compareUrl: 'https://github.com/tetherto/wdk-wallet-spark/compare/v1.0.0-beta.13...v1.0.0-beta.14',
        releaseBody: "## What's Changed\n- No API surface changes.",
        rippleWarnings: []
      },
      {
        key: 'wallet-evm',
        fromTag: 'v1.2.0',
        toTag: 'v1.3.0',
        sha: '0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f',
        docChanged: true,
        status: 'ok',
        stats: { lines: 210, classes: 2, types: 4, functions: 1, enums: 0, outputPath: 'ignored' },
        outputPath: 'content/docs/sdk/wallet-modules/wallet-evm/api-reference.mdx',
        releaseUrl: 'https://github.com/tetherto/wdk-wallet-evm/releases/tag/v1.3.0',
        compareUrl: 'https://github.com/tetherto/wdk-wallet-evm/compare/v1.2.0...v1.3.0',
        releaseBody: '## Highlights\n- Added transport fallback support.',
        rippleWarnings: [{ file: 'usage.mdx', symbol: 'sendTransaction' }]
      }
    ],
    modules: []
  },
  history: {
    'wallet-spark': [
      {
        key: 'wallet-spark',
        fromTag: null,
        toTag: 'v1.0.0-beta.12',
        sha: '637059cd9d8cf622c47f35d7f448109e68955769',
        docChanged: true,
        status: 'ok',
        stats: null,
        outputPath: 'content/docs/sdk/wallet-modules/wallet-spark/api-reference.mdx',
        releaseUrl: 'https://github.com/tetherto/wdk-wallet-spark/releases/tag/v1.0.0-beta.12',
        compareUrl: null,
        releaseBody: '## Bootstrap\n- Seeded initial Spark docs.',
        rippleWarnings: [],
        bootstrap: true
      },
      {
        key: 'wallet-spark',
        fromTag: 'v1.0.0-beta.12',
        toTag: 'v1.0.0-beta.13',
        sha: 'a8174040f6d2dae46df31560adf168cc91a5eecb',
        docChanged: true,
        status: 'ok',
        stats: null,
        outputPath: 'content/docs/sdk/wallet-modules/wallet-spark/api-reference.mdx',
        releaseUrl: 'https://github.com/tetherto/wdk-wallet-spark/releases/tag/v1.0.0-beta.13',
        compareUrl: 'https://github.com/tetherto/wdk-wallet-spark/compare/v1.0.0-beta.12...v1.0.0-beta.13',
        releaseBody: "## What's Changed\n- Added staged sync support.",
        rippleWarnings: []
      },
      {
        key: 'wallet-spark',
        fromTag: 'v1.0.0-beta.13',
        toTag: 'v1.0.0-beta.14',
        sha: 'cb0ac35fe73249bf6ff72cfd9a945a538576fa44',
        docChanged: false,
        status: 'ok',
        stats: null,
        outputPath: 'content/docs/sdk/wallet-modules/wallet-spark/api-reference.mdx',
        releaseUrl: 'https://github.com/tetherto/wdk-wallet-spark/releases/tag/v1.0.0-beta.14',
        compareUrl: 'https://github.com/tetherto/wdk-wallet-spark/compare/v1.0.0-beta.13...v1.0.0-beta.14',
        releaseBody: "## What's Changed\n- No API surface changes.",
        rippleWarnings: []
      }
    ],
    'wallet-evm': [
      {
        key: 'wallet-evm',
        fromTag: 'v1.2.0',
        toTag: 'v1.3.0',
        sha: '0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f',
        docChanged: true,
        status: 'ok',
        stats: null,
        outputPath: 'content/docs/sdk/wallet-modules/wallet-evm/api-reference.mdx',
        releaseUrl: 'https://github.com/tetherto/wdk-wallet-evm/releases/tag/v1.3.0',
        compareUrl: 'https://github.com/tetherto/wdk-wallet-evm/compare/v1.2.0...v1.3.0',
        releaseBody: '## Highlights\n- Added transport fallback support.',
        rippleWarnings: [{ file: 'usage.mdx', symbol: 'sendTransaction' }]
      }
    ]
  }
}

test('renderPrBody matches the approved snapshot', () => {
  assert.equal(renderPrBody(renderInput), bodySnapshot)
})

test('renderPrComment matches the approved snapshot', () => {
  assert.equal(renderPrComment(renderInput), commentSnapshot)
})

test('renderStepSummary matches the approved snapshot', () => {
  assert.equal(renderStepSummary(renderInput), stepSummarySnapshot)
})
