import test from 'node:test'
import assert from 'node:assert/strict'
import { buildMembership, fetchAllPages, observeSource, qualifyApproval, resolveRepositoryRules } from '../observe.mjs'

const sha = (character) => character.repeat(40)
const HEAD = sha('a')
const TREE = sha('b')
const BASE = sha('c')
const NEXT = sha('d')
const policy = { authorizedReviewers: ['reviewer-a', 'reviewer-b'], quorum: 2 }
const review = (id, state = 'APPROVED', reviewer = 'reviewer-a', commit = HEAD) => ({ id, state, user: { login: reviewer }, commit_id: commit, submitted_at: `2026-10-${String(id).padStart(2, '0')}T00:00:00Z` })
const qualify = (reviews, extra = {}) => qualifyApproval({ headSha: HEAD, reviews, policy, recheckedHeadSha: HEAD, recheckedReviews: structuredClone(reviews), ...extra })

function registry() {
  return { ok: true, json: async () => ({ 'dist-tags': { latest: '1.2.3' }, versions: { '1.2.3': { version: '1.2.3', dist: { integrity: 'sha512-evidence', tarball: 'https://registry.npmjs.org/example/-/example-1.2.3.tgz' }, gitHead: BASE } } }) }
}

function commandMock({ prs = [], reviews = [review(1), review(2, 'APPROVED', 'reviewer-b')], errorEndpoint, finalHead, finalBase, comparison, rules = repositoryRules, recheckedRules, decisions } = {}) {
  const calls = []
  let prReads = 0
  let rulesReads = 0
  let decisionReads = 0
  const summaries = prs.map((pr) => ({ state: 'open', head: { sha: HEAD }, base: { sha: BASE, ref: 'main' }, merged_at: null, merge_commit_sha: null, ...pr }))
  const runCommand = async (file, args, options) => {
    calls.push({ file, args, options })
    if (args[0] === 'auth') return { stdout: '' }
    assert.equal(file, 'gh')
    if (args[1] === 'graphql') {
      assert.equal(args[2], '-f')
      assert(args[3].startsWith('query=query($owner:String!,$name:String!,$number:Int!)'))
      assert(!args[3].includes('mutation'))
      assert(args.includes('owner=tetherto'))
      assert(args.includes('name=example'))
      const value = decisions?.[Math.min(decisionReads++, decisions.length - 1)] ?? { headRefOid: HEAD, baseRefOid: BASE, reviewDecision: 'APPROVED' }
      return { stdout: JSON.stringify({ data: { repository: { pullRequest: value } } }) }
    }
    assert.deepEqual(args.slice(0, 3), ['api', '--method', 'GET'])
    const endpoint = args.at(-1)
    if (endpoint === errorEndpoint) throw Object.assign(new Error('HTTP 404'), { stderr: 'repository inaccessible' })
    let result
    if (endpoint === '/repos/tetherto/example') result = { private: false }
    else if (endpoint.startsWith('/repos/tetherto/example/commits/')) result = { sha: HEAD, commit: { tree: { sha: TREE } } }
    else if (endpoint.startsWith('/repos/tetherto/example/pulls?')) result = [summaries.slice(0, 100), ...(summaries.length > 100 ? [summaries.slice(100)] : [])]
    else if (endpoint.startsWith('/repos/tetherto/example/rules/branches/')) {
      const currentRules = rulesReads++ > 0 && recheckedRules ? recheckedRules : rules
      result = [currentRules.slice(0, 1), currentRules.slice(1)]
    }
    else if (endpoint.startsWith('/repos/tetherto/example/compare/')) result = comparison
    else if (endpoint.endsWith('/reviews?per_page=100')) result = [reviews.slice(0, 1), reviews.slice(1)]
    else if (endpoint.startsWith('/repos/tetherto/example/git/commits/')) result = { sha: HEAD, tree: { sha: TREE } }
    else if (/\/pulls\/\d+$/.test(endpoint)) {
      prReads++
      const number = Number(endpoint.split('/').at(-1))
      const summary = summaries.find((pr) => pr.number === number)
      result = { ...summary, number, head: { ...summary.head, sha: finalHead && prReads >= 3 ? finalHead : HEAD }, base: { ...summary.base, sha: finalBase && prReads >= 3 ? finalBase : BASE } }
    } else throw new Error(`Unexpected test endpoint ${endpoint}`)
    return { stdout: JSON.stringify(result) }
  }
  return { runCommand, calls }
}

const repositoryRules = [{ type: 'deletion' }, { type: 'pull_request', ruleset_id: 4846767, parameters: { required_approving_review_count: 1, dismiss_stale_reviews_on_push: true, require_code_owner_review: false, required_reviewers: [], require_last_push_approval: false, required_review_thread_resolution: false } }]

const config = { repository: 'tetherto/example', branch: 'main', packageName: '@tetherto/example', reviewPolicy: policy }

test('current-head authorized quorum qualifies; comments do not erase a decision', () => {
  const result = qualify([review(1), review(2, 'APPROVED', 'reviewer-b'), review(3, 'COMMENTED')])
  assert.equal(result.status, 'qualified')
  assert.equal(result.approvals.length, 2)
  assert.equal(result.platformApproval, 'not-evaluated')
})

// Reduced public API snapshot captured in the design evidence on 13 October 2026.
// These actors are explicitly configured only for this historical replay, not a live roster.
test('actual CLI #39 dismissed approval does not transfer; a fresh exact-head review qualifies', () => {
  const oldHead = '6e698709a60e02da12bbff9285b25394c6e752cb'
  const currentHead = 'ce805b7fec16239aefb446c72b75d5659cbc8ab1'
  const dismissed = { id: 5463971820, state: 'DISMISSED', commit_id: oldHead, submitted_at: '2026-10-08T23:14:50Z', user: { login: 'jonathunne' } }
  const approved = { id: 5483613253, state: 'APPROVED', commit_id: currentHead, submitted_at: '2026-10-11T14:10:41Z', user: { login: 'jonathunne' } }
  const replayPolicy = { authorizedReviewers: ['jonathunne'], quorum: 1 }
  const replay = (reviews) => qualifyApproval({ headSha: currentHead, reviews, policy: replayPolicy, recheckedHeadSha: currentHead, recheckedReviews: reviews })
  assert.equal(replay([dismissed]).status, 'blocked')
  assert.equal(replay([{ ...dismissed, state: 'APPROVED' }]).status, 'blocked')
  assert.equal(replay([dismissed, approved]).status, 'qualified')
  assert.equal(qualifyApproval({ headSha: oldHead, reviews: [{ ...dismissed, state: 'APPROVED' }], policy: replayPolicy, recheckedHeadSha: oldHead, recheckedReviews: [dismissed] }).status, 'stale')
})

test('effective change request vetoes quorum, including a change request on an older head', () => {
  const vetoPolicy = { authorizedReviewers: ['reviewer-a', 'reviewer-b', 'reviewer-c'], quorum: 2 }
  assert.equal(qualify([review(1), review(2, 'APPROVED', 'reviewer-b'), review(3, 'CHANGES_REQUESTED', 'reviewer-c', BASE)], { policy: vetoPolicy }).status, 'blocked')
  assert.equal(qualify([review(1), review(2, 'APPROVED', 'reviewer-b'), review(3, 'CHANGES_REQUESTED', 'unknown')]).status, 'qualified')
})

test('unknown review authority is unsupported, and equal-head review-dismissal race is stale', () => {
  assert.equal(qualify([review(1)], { policy: undefined }).status, 'unsupported')
  assert.equal(qualify([review(1), review(2, 'APPROVED', 'reviewer-b')], { recheckedReviews: [review(1, 'DISMISSED'), review(2, 'APPROVED', 'reviewer-b')] }).status, 'stale')
  assert.equal(qualify([review(1)], { recheckedHeadSha: NEXT }).status, 'stale')
})

test('complete pagination is requested explicitly and failed pages are errors, never empty', async () => {
  const rows = await fetchAllPages('/repos/tetherto/example/pulls?per_page=100', { runCommand: async (file, args) => {
    assert.equal(file, 'gh')
    assert.deepEqual(args.slice(0, 5), ['api', '--method', 'GET', '--paginate', '--slurp'])
    return { stdout: JSON.stringify([[{ number: 1 }], [{ number: 130 }]]) }
  } })
  assert.equal(rows.flat().length, 2)
  await assert.rejects(fetchAllPages('/repos/tetherto/example/pulls', { runCommand: async () => { throw new Error('HTTP 429 rate limit') } }), /429/)
  await assert.rejects(fetchAllPages('/repos/tetherto/example/pulls', { runCommand: async () => ({ stdout: '[]' }) }), /complete API page/)
})

test('observer reports useful approved U with unknown published-source mapping', async () => {
  const mock = commandMock({ prs: [{ number: 118, state: 'open' }] })
  const result = await observeSource(config, { runCommand: mock.runCommand, fetch: async () => registry() })
  assert.equal(result.approvedUnits.length, 1)
  assert.equal(result.approvedUnits[0].head, HEAD)
  assert.equal(result.approvedUnits[0].tree, TREE)
  assert.equal(result.completeness.reviews, true)
  assert.equal(result.completeness.membership, false)
  assert.equal(result.membership.status, 'incomplete')
  assert.equal(result.publication.artifactBinding, 'unverified')
  assert(mock.calls.every((call) => call.options.timeout === 30_000))
})

test('observer rechecks head after tree acquisition; changed head emits no eligible unit', async () => {
  const mock = commandMock({ prs: [{ number: 39 }], finalHead: NEXT })
  const result = await observeSource(config, { runCommand: mock.runCommand, fetch: async () => registry() })
  assert.equal(result.approvedUnits.length, 0)
  assert.equal(result.pullRequests[0].approval.status, 'stale')
})

test('an inaccessible API differs from successful empty scope and preserves registry facts', async () => {
  const unavailable = commandMock({ errorEndpoint: '/repos/tetherto/example' })
  const failed = await observeSource(config, { runCommand: unavailable.runCommand, fetch: async () => registry() })
  const empty = commandMock()
  const success = await observeSource(config, { runCommand: empty.runCommand, fetch: async () => registry() })
  assert.equal(failed.completeness.source, false)
  assert.equal(failed.errors[0].kind, 'inaccessible')
  assert.equal(failed.publication.version, '1.2.3')
  assert.equal(success.completeness.source, true)
  assert.equal(success.completeness.reviews, true)
  assert.deepEqual(success.errors, [])
})

test('old PRs beyond previous monitor count limits are retained across all pages', async () => {
  const prs = Array.from({ length: 130 }, (_, i) => ({ number: i + 1, state: 'closed' }))
  const mock = commandMock({ prs })
  const result = await observeSource(config, { runCommand: mock.runCommand, fetch: async () => registry() })
  assert.equal(result.pullRequests.length, 130)
  assert.equal(result.pullRequests.at(-1).number, 130)
  assert.equal(result.completeness.reviews, true)
})

test('actual EVM #118 approval predates beta.21 publication but lies outside its immutable cut', () => {
  const published = '3f36d48943b6050104a605ee167e5e94429f3f86'
  const merged = '08ed781944b2449b60fedccc3e5927ce5e0460a6'
  const approvedHead = '2327dea2e2fcaef69691ab8e5618ced1eb6db2a6'
  const reviews = [{ id: 5471774621, state: 'APPROVED', commit_id: approvedHead, submitted_at: '2026-10-09T15:00:35Z', user: { login: 'claudiovb' } }]
  const githubReleasePublishedAt = '2026-10-09T19:44:21Z'
  assert(Date.parse(reviews[0].submitted_at) < Date.parse(githubReleasePublishedAt))
  const approval = qualifyApproval({ headSha: approvedHead, reviews, recheckedHeadSha: approvedHead, recheckedReviews: reviews, policy: { authorizedReviewers: ['claudiovb'], quorum: 1 } })
  assert.equal(approval.status, 'qualified')
  const pr = { number: 118, head: { sha: approvedHead }, merged_at: '2026-10-11T20:30:42Z', merge_commit_sha: merged }
  const frozen = buildMembership({ baselineCommit: published, sourceCut: { commit: published }, comparison: [{ status: 'identical', base_commit: { sha: published }, merge_base_commit: { sha: published }, total_commits: 0, commits: [] }], pullRequests: [pr] })
  assert.equal(frozen.status, 'complete')
  assert.deepEqual(frozen.includedUnits, [])
  assert.equal(frozen.excludedUnits[0].number, 118)
  assert.equal(frozen.excludedUnits[0].reason, 'merge-not-in-baseline-to-cut-ancestry')
  const capturedCommits = [
    ['0591342693fcdc21f8ffb15144a5b2b5daee2f32', '86bae73fb348ab030253ba9cb34817a3a3967806', ['8b4b88ec150b55a57977bbc1d6ef5e803bda13c3']],
    ['b33e39cebb90b68ff9363a21bd24059694723268', '692f9c34de674eab7e2fda92272809683db3459b', ['0591342693fcdc21f8ffb15144a5b2b5daee2f32']],
    ['56368cd96e56b903af72c6ab04abba30d12630f0', '4824b65cc12736dfdf40a31a333120b1b951da75', ['b33e39cebb90b68ff9363a21bd24059694723268']],
    [approvedHead, '687a16be5c86656040c08d374df788eceb401176', ['56368cd96e56b903af72c6ab04abba30d12630f0', published]],
    [merged, '687a16be5c86656040c08d374df788eceb401176', [published, approvedHead]]
  ].map(([commit, tree, parents]) => ({ sha: commit, commit: { tree: { sha: tree } }, parents: parents.map((parent) => ({ sha: parent })) }))
  const later = buildMembership({ baselineCommit: published, sourceCut: { commit: merged }, comparison: [{ status: 'ahead', base_commit: { sha: published }, merge_base_commit: { sha: published }, total_commits: 5, commits: capturedCommits }], pullRequests: [pr] })
  assert.equal(later.status, 'complete')
  assert.equal(later.includedUnits[0].number, 118)
  assert.equal(later.commits.length, 5)
  assert.equal(later.sourceConfirmation, 'pending')
})

test('truncated ancestry and diverged baseline cannot establish membership', () => {
  const comparison = [{ status: 'ahead', base_commit: { sha: BASE }, merge_base_commit: { sha: BASE }, total_commits: 2, commits: [{ sha: HEAD, commit: { tree: { sha: TREE } }, parents: [{ sha: BASE }] }] }]
  assert.equal(buildMembership({ baselineCommit: BASE, sourceCut: { commit: HEAD }, comparison }).status, 'incomplete')
  assert.equal(buildMembership({ baselineCommit: BASE, sourceCut: { commit: HEAD }, comparison: [{ ...comparison[0], status: 'diverged' }] }).status, 'incomplete')
})

test('registry failure remains explicit and branch data remains useful', async () => {
  const mock = commandMock()
  const result = await observeSource(config, { runCommand: mock.runCommand, fetch: async () => { throw new Error('request timed out') } })
  assert.equal(result.completeness.source, true)
  assert.equal(result.completeness.registry, false)
  assert.equal(result.publication, null)
  assert.equal(result.errors[0].kind, 'timeout')
})

test('unknown reviewer policy remains incomplete even when no PRs are returned', async () => {
  const mock = commandMock()
  const result = await observeSource({ ...config, reviewPolicy: undefined }, { runCommand: mock.runCommand, fetch: async () => registry() })
  assert.equal(result.completeness.source, true)
  assert.equal(result.completeness.reviews, false)
  assert.equal(result.health, 'incomplete')
})

test('comparison source identities cannot be substituted despite complete commit counts', () => {
  const page = { status: 'ahead', total_commits: 1, base_commit: { sha: BASE }, merge_base_commit: { sha: BASE }, commits: [{ sha: HEAD, commit: { tree: { sha: TREE } }, parents: [{ sha: BASE }] }] }
  assert.equal(buildMembership({ baselineCommit: BASE, sourceCut: { commit: HEAD }, comparison: [{ ...page, base_commit: { sha: NEXT } }] }).status, 'incomplete')
  assert.equal(buildMembership({ baselineCommit: BASE, sourceCut: { commit: NEXT }, comparison: [page] }).status, 'incomplete')
})

test('same-head PR base-context race is stale rather than transferring approval', async () => {
  const mock = commandMock({ prs: [{ number: 39 }], finalBase: NEXT })
  const result = await observeSource(config, { runCommand: mock.runCommand, fetch: async () => registry() })
  assert.equal(result.approvedUnits.length, 0)
  assert.equal(result.pullRequests[0].approval.status, 'stale')
  assert(result.pullRequests[0].approval.reasons.some((reason) => reason.includes('integration context')))
})

test('auth, rate limits and response bounds stay explicit and do not become empty observations', async () => {
  for (const [error, kind] of [
    [new Error('authentication: not logged in'), 'authentication'],
    [new Error('HTTP 403 API rate limit exceeded'), 'rate-limited'],
    [Object.assign(new Error('stdout maxBuffer exceeded'), { code: 'ERR_CHILD_PROCESS_STDIO_MAXBUFFER', killed: true }), 'response-limit']
  ]) {
    const result = await observeSource(config, { runCommand: async () => { throw error }, fetch: async () => registry() })
    assert.equal(result.errors[0].kind, kind)
    assert.equal(result.completeness.source, false)
    assert.equal(result.health, 'incomplete')
    assert.equal(result.sourceCut, null)
  }
})

const verifiedBaseline = { sourceCommit: BASE, sourceMapping: { status: 'verified', evidence: ['operator-verified published artifact source correspondence'] } }
const comparePage = (commits, total = commits.length) => ({ status: 'ahead', total_commits: total, base_commit: { sha: BASE }, merge_base_commit: { sha: BASE }, commits })
const compareCommit = (commit, parent = BASE) => ({ sha: commit, commit: { tree: { sha: TREE } }, parents: [{ sha: parent }] })

test('missing policy retains all summaries without fetching historical details or reviews', async () => {
  const prs = Array.from({ length: 130 }, (_, i) => ({ number: i + 1, state: 'closed', merged_at: '2018-01-01T00:00:00Z', merge_commit_sha: NEXT }))
  prs.push({ number: 1000, state: 'open', created_at: '2017-01-01T00:00:00Z' })
  const mock = commandMock({ prs })
  const result = await observeSource({ ...config, reviewPolicy: undefined }, { runCommand: mock.runCommand, fetch: async () => registry() })
  assert.equal(result.pullRequests.length, 131)
  assert.equal(result.pullRequests.at(-1).head, HEAD)
  assert.equal(result.pullRequests.at(-1).base, BASE)
  assert.equal(result.reviewScope.mode, 'unqualified-summaries')
  assert.equal(result.completeness.reviews, false)
  assert.equal(result.requests.githubCommands, 5)
  assert.equal(mock.calls.filter((call) => /\/pulls\/\d+/.test(call.args.at(-1))).length, 0)
})

test('verified complete multi-page ancestry limits details to delta merges and every older open PR', async () => {
  const prs = Array.from({ length: 130 }, (_, i) => ({ number: i + 1, state: 'closed', merged_at: '2018-01-01T00:00:00Z', merge_commit_sha: sha('e') }))
  prs.push({ number: 1000, state: 'open', created_at: '2010-01-01T00:00:00Z' })
  prs.push({ number: 1001, state: 'closed', merged_at: '2026-10-14T00:00:00Z', merge_commit_sha: HEAD })
  const comparison = [comparePage([compareCommit(NEXT)], 2), comparePage([compareCommit(HEAD, NEXT)], 2)]
  const mock = commandMock({ prs, comparison })
  const result = await observeSource({ ...config, publishedBaseline: verifiedBaseline }, { runCommand: mock.runCommand, fetch: async () => registry() })
  assert.equal(result.membership.commits.length, 2)
  assert.equal(result.completeness.membership, true)
  assert.equal(result.reviewScope.mode, 'verified-baseline-delta-and-open')
  assert.deepEqual(result.reviewScope.relevantPRNumbers, [1000, 1001])
  assert.equal(result.reviewScope.notRequestedPRNumbers.length, 130)
  assert.equal(result.pullRequests.length, 132)
  assert.equal(result.approvedUnits.find((unit) => unit.number === 1000)?.head, HEAD)
  assert.equal(result.requests.githubCommands, 20)
  assert.equal(result.completeness.reviews, true)
  assert.equal(mock.calls.filter((call) => /\/pulls\/(?:[1-9]|[1-9][0-9]|1[0-2][0-9]|130)(?:\?|\/|$)/.test(call.args.at(-1))).length, 0)
  const comparisonIndex = mock.calls.findIndex((call) => call.args.at(-1).includes('/compare/'))
  const detailIndex = mock.calls.findIndex((call) => call.args.at(-1).endsWith('/pulls/1000'))
  assert(comparisonIndex < detailIndex)
})

test('incomplete comparison cannot prune historical merged source and retains conservative review fallback', async () => {
  const mock = commandMock({ prs: [{ number: 118, state: 'closed', merged_at: '2018-01-01T00:00:00Z', merge_commit_sha: NEXT }], comparison: [comparePage([compareCommit(HEAD)], 2)] })
  const result = await observeSource({ ...config, publishedBaseline: verifiedBaseline }, { runCommand: mock.runCommand, fetch: async () => registry() })
  assert.equal(result.reviewScope.mode, 'full-conservative')
  assert.equal(result.completeness.membership, false)
  assert.deepEqual(result.reviewScope.relevantPRNumbers, [118])
  assert(mock.calls.some((call) => call.args.at(-1).endsWith('/pulls/118')))
})

test('command-budget exhaustion retains observed scope and explicitly leaves relevant reviews incomplete', async () => {
  const mock = commandMock({ prs: [{ number: 118 }, { number: 39 }] })
  const result = await observeSource({ ...config, maxGithubCommands: 5 }, { runCommand: mock.runCommand, fetch: async () => registry() })
  assert.equal(result.requests.githubCommands, 5)
  assert.equal(mock.calls.length, 5)
  assert.equal(result.pullRequests.length, 2)
  assert.deepEqual(result.reviewScope.relevantPRNumbers, [118, 39])
  assert.equal(result.completeness.reviews, false)
  assert.equal(result.completeness.source, true)
  assert.equal(result.errors.filter((error) => error.kind === 'budget-exhausted').length, 1)
  assert.equal(result.health, 'incomplete')
  assert.equal(result.publication.version, '1.2.3')
})

const repositoryPolicy = { mode: 'repository-rules' }
function repositoryQualification(overrides = {}) {
  const reviews = [review(1)]
  const graphQL = { headRefOid: HEAD, baseRefOid: BASE, reviewDecision: 'APPROVED' }
  return qualifyApproval({ headSha: HEAD, baseSha: BASE, reviews, policy: repositoryPolicy, repositoryRules, graphQL, recheckedHeadSha: HEAD, recheckedBaseSha: BASE, recheckedReviews: reviews, recheckedRepositoryRules: repositoryRules, recheckedGraphQL: graphQL, ...overrides })
}

test('repository-rules mode qualifies current GitHub APPROVED under recorded quorum without a manual actor roster', async () => {
  const mock = commandMock({ prs: [{ number: 117 }], reviews: [review(1)] })
  const result = await observeSource({ ...config, reviewPolicy: repositoryPolicy }, { runCommand: mock.runCommand, fetch: async () => registry() })
  assert.equal(result.approvedUnits.length, 1)
  assert.equal(result.approvedUnits[0].approval.authority, 'repository-required-review-decision')
  assert.equal(result.approvedUnits[0].approval.policyFacts.quorum, 1)
  assert.equal(result.approvedUnits[0].approval.policyFacts.dismissStaleReviewsOnPush, true)
  assert.equal(result.approvedUnits[0].approval.policyFacts.rechecked, true)
  assert.equal(result.approvedUnits[0].approval.observedGraphQL.reviewDecision, 'APPROVED')
  assert.equal(result.completeness.reviews, true)
  assert.equal(mock.calls.filter((call) => call.args[1] === 'graphql').length, 3)
  assert.equal(mock.calls.filter((call) => call.args.at(-1).includes('/rules/branches/')).length, 2)
})

test('old APPROVED review cannot qualify a new head when current GitHub decision requires review', () => {
  const reviews = [review(1, 'APPROVED', 'reviewer-a', BASE)]
  const graphQL = { headRefOid: HEAD, baseRefOid: BASE, reviewDecision: 'REVIEW_REQUIRED' }
  const result = repositoryQualification({ reviews, recheckedReviews: reviews, graphQL, recheckedGraphQL: graphQL })
  assert.equal(result.status, 'blocked')
  assert.equal(result.approvals.length, 0)
  assert.equal(repositoryQualification({ reviews, recheckedReviews: reviews }).status, 'blocked')
})

test('same source head with changed GitHub decision or mismatched base is stale', () => {
  assert.equal(repositoryQualification({ recheckedGraphQL: { headRefOid: HEAD, baseRefOid: BASE, reviewDecision: 'REVIEW_REQUIRED' } }).status, 'stale')
  assert.equal(repositoryQualification({ graphQL: { headRefOid: HEAD, baseRefOid: NEXT, reviewDecision: 'APPROVED' } }).status, 'stale')
  assert.equal(repositoryQualification({ recheckedHeadSha: NEXT }).status, 'stale')
})

test('repository mode still enforces exact-head positive quorum and effective change-request veto', () => {
  const twoReviewRules = [{ ...repositoryRules[1], parameters: { ...repositoryRules[1].parameters, required_approving_review_count: 2 } }]
  assert.equal(repositoryQualification({ repositoryRules: twoReviewRules, recheckedRepositoryRules: twoReviewRules }).status, 'blocked')
  const reviews = [review(1), review(2, 'CHANGES_REQUESTED', 'reviewer-b', BASE)]
  assert.equal(repositoryQualification({ reviews, recheckedReviews: reviews }).status, 'blocked')
})

test('rule access failures, missing review fields and code-owner/team requirements remain incomplete', async () => {
  const incomplete = [{ type: 'pull_request', parameters: { required_approving_review_count: 1 } }]
  const codeowners = [{ ...repositoryRules[1], parameters: { ...repositoryRules[1].parameters, require_code_owner_review: true } }]
  assert.equal(resolveRepositoryRules(incomplete).status, 'unsupported')
  assert.equal(repositoryQualification({ repositoryRules: codeowners, recheckedRepositoryRules: codeowners }).status, 'unsupported')
  const mock = commandMock({ prs: [{ number: 117 }], errorEndpoint: '/repos/tetherto/example/rules/branches/main?per_page=100' })
  const result = await observeSource({ ...config, reviewPolicy: repositoryPolicy }, { runCommand: mock.runCommand, fetch: async () => registry() })
  assert.equal(result.repositoryReviewPolicy.status, 'unknown')
  assert.equal(result.completeness.reviews, false)
  assert.equal(result.approvedUnits.length, 0)
  assert.equal(result.pullRequests.length, 1)
  assert.equal(result.errors[0].kind, 'inaccessible')
})

test('mid-scan rules change withdraws all provisional eligible units and retains stale evidence', async () => {
  const changedRules = [{ ...repositoryRules[1], parameters: { ...repositoryRules[1].parameters, required_approving_review_count: 2 } }]
  const mock = commandMock({ prs: [{ number: 117 }], reviews: [review(1)], recheckedRules: changedRules })
  const result = await observeSource({ ...config, reviewPolicy: repositoryPolicy }, { runCommand: mock.runCommand, fetch: async () => registry() })
  assert.equal(result.approvedUnits.length, 0)
  assert.equal(result.repositoryReviewPolicy.status, 'stale')
  assert.equal(result.pullRequests[0].approval.status, 'stale')
  assert.equal(result.completeness.reviews, false)
  assert.equal(result.errors[0].kind, 'stale-snapshot')
})

test('observer decision recheck prevents an equal-head APPROVED-to-REVIEW_REQUIRED race', async () => {
  const approved = { headRefOid: HEAD, baseRefOid: BASE, reviewDecision: 'APPROVED' }
  const mock = commandMock({ prs: [{ number: 117 }], reviews: [review(1)], decisions: [approved, approved, { ...approved, reviewDecision: 'REVIEW_REQUIRED' }] })
  const result = await observeSource({ ...config, reviewPolicy: repositoryPolicy }, { runCommand: mock.runCommand, fetch: async () => registry() })
  assert.equal(result.approvedUnits.length, 0)
  assert.equal(result.pullRequests[0].approval.status, 'stale')
  assert.equal(result.completeness.reviews, false)
})

test('unknown baseline processes older open approved work before budget-heavy merged history', async () => {
  const history = Array.from({ length: 100 }, (_, i) => ({ number: i + 1, state: 'closed', merged_at: '2015-01-01T00:00:00Z', merge_commit_sha: NEXT }))
  const mock = commandMock({ prs: [...history, { number: 117, state: 'open', created_at: '2011-01-01T00:00:00Z' }], reviews: [review(1)] })
  const result = await observeSource({ ...config, reviewPolicy: repositoryPolicy, maxGithubCommands: 20 }, { runCommand: mock.runCommand, fetch: async () => registry() })
  assert.equal(result.approvedUnits[0]?.number, 117)
  assert.equal(result.completeness.membership, false)
  assert.equal(result.completeness.reviews, false)
  assert.equal(result.requests.githubCommands, 20)
  assert.equal(result.pullRequests.length, 101)
})

test('captured Core #117 current repository approval supersedes earlier change requests without actor-permission lookup', () => {
  const headSha = '342fb4edfb285811ecac8324475fd793e1ca8a99'
  const baseSha = '339a403c3cd6378df4d61868bf4073f4986d0b58'
  const reviews = [
    { id: 5491390618, state: 'CHANGES_REQUESTED', commit_id: '1b1a76ffa749d0aacf8c5b7ef75910015769392b', submitted_at: '2026-10-12T13:22:21Z', user: { login: 'AlonzoRicardo' } },
    { id: 5491483925, state: 'COMMENTED', commit_id: '1b1a76ffa749d0aacf8c5b7ef75910015769392b', submitted_at: '2026-10-12T13:30:25Z', user: { login: 'AlonzoRicardo' } },
    { id: 5503996888, state: 'CHANGES_REQUESTED', commit_id: 'a250993d75240b965e5f077a804fe37e5a40b8bb', submitted_at: '2026-10-13T13:08:49Z', user: { login: 'AlonzoRicardo' } },
    { id: 5517762652, state: 'APPROVED', commit_id: headSha, submitted_at: '2026-10-14T12:20:35Z', user: { login: 'AlonzoRicardo' } }
  ]
  const graphQL = { headRefOid: headSha, baseRefOid: baseSha, reviewDecision: 'APPROVED' }
  const result = qualifyApproval({ headSha, baseSha, reviews, policy: repositoryPolicy, repositoryRules, graphQL, recheckedHeadSha: headSha, recheckedBaseSha: baseSha, recheckedReviews: reviews, recheckedRepositoryRules: repositoryRules, recheckedGraphQL: graphQL })
  assert.equal(result.status, 'qualified')
  assert.equal(result.authority, 'repository-required-review-decision')
  assert.equal(result.approvals[0].id, 5517762652)
  assert.equal(result.vetoes.length, 0)
})

test('repository rules without effective stale dismissal cannot combine old eligible and current outsider approvals', async () => {
  const retainedRules = [{ ...repositoryRules[1], parameters: { ...repositoryRules[1].parameters, dismiss_stale_reviews_on_push: false } }]
  const reviews = [review(1, 'APPROVED', 'eligible-reviewer', BASE), review(2, 'APPROVED', 'outsider-reviewer', HEAD)]
  const result = repositoryQualification({ repositoryRules: retainedRules, recheckedRepositoryRules: retainedRules, reviews, recheckedReviews: reviews })
  assert.equal(result.status, 'unsupported')
  assert.equal(result.policyFacts.dismissStaleReviewsOnPush, false)
  assert(result.reasons.some((reason) => reason.includes('actor authority proof')))
  const mock = commandMock({ prs: [{ number: 117 }], reviews, rules: retainedRules })
  const observed = await observeSource({ ...config, reviewPolicy: repositoryPolicy }, { runCommand: mock.runCommand, fetch: async () => registry() })
  assert.equal(observed.approvedUnits.length, 0)
  assert.equal(observed.completeness.reviews, false)
  assert.equal(observed.repositoryReviewPolicy.status, 'unsupported')
  assert.equal(observed.pullRequests[0].approval.status, 'unsupported')
  assert.equal(qualify([review(1), review(2, 'APPROVED', 'reviewer-b')], { repositoryRules: retainedRules }).status, 'qualified')
})
