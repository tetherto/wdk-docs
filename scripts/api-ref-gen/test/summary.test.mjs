import test from 'node:test'
import assert from 'node:assert/strict'
import { getCounts, getSuccessfulDocSteps, renderDocSteps, renderGitHubOutputs } from '../summary.mjs'

const summary = {
  steps: [
    {
      key: 'wallet-spark',
      fromTag: null,
      toTag: 'v1.0.0-beta.12',
      status: 'ok',
      docChanged: true,
      outputPath: 'content/docs/sdk/wallet-modules/wallet-spark/api-reference.mdx',
      rippleWarnings: []
    },
    {
      key: 'wallet-spark',
      fromTag: 'v1.0.0-beta.12',
      toTag: 'v1.0.0-beta.13',
      status: 'ok',
      docChanged: false,
      outputPath: 'content/docs/sdk/wallet-modules/wallet-spark/api-reference.mdx',
      rippleWarnings: []
    },
    {
      key: 'wallet-evm',
      fromTag: 'v1.2.0',
      toTag: 'v1.3.0',
      status: 'failed',
      docChanged: false,
      outputPath: 'content/docs/sdk/wallet-modules/wallet-evm/api-reference.mdx',
      rippleWarnings: [{ file: 'usage.mdx', symbol: 'sendTransaction' }]
    }
  ]
}

test('getCounts returns workflow-facing summary counts', () => {
  assert.deepEqual(getCounts(summary), {
    attempts: 3,
    docChanged: 1,
    failures: 1,
    hasSummary: true,
    noteOnly: 1,
    rippleWarnings: 1
  })
})

test('getSuccessfulDocSteps preserves bootstrap commit messages and snapshot paths', () => {
  const [step] = getSuccessfulDocSteps(summary)
  assert.equal(step.commitMessage, 'docs(api-ref): bootstrap wallet-spark @ v1.0.0-beta.12')
  assert.match(step.snapshotPath, /scripts\/api-ref-gen\/\.tmp\/snapshots\/wallet-spark\/v1\.0\.0-beta\.12\/api-reference\.mdx$/)
})

test('render helpers emit stable workflow output formats', () => {
  const [step] = getSuccessfulDocSteps(summary)

  assert.equal(
    renderGitHubOutputs(summary),
    'has_summary=true\nattempts=3\ndoc_changed=1\nnote_only=1\nfailures=1\nripple_warnings=1\n'
  )

  assert.equal(
    renderDocSteps(summary),
    `wallet-spark\t\tv1.0.0-beta.12\tcontent/docs/sdk/wallet-modules/wallet-spark/api-reference.mdx\t${step.snapshotPath}\tdocs(api-ref): bootstrap wallet-spark @ v1.0.0-beta.12\n`
  )
})
