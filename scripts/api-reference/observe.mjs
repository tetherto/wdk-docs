import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const SHA = /^[a-f0-9]{40}$/i
const REVIEW_QUERY = 'query($owner:String!,$name:String!,$number:Int!){repository(owner:$owner,name:$name){pullRequest(number:$number){headRefOid baseRefOid reviewDecision}}}'
const REVIEW_STATES = new Set(['APPROVED', 'CHANGES_REQUESTED', 'DISMISSED', 'COMMENTED', 'PENDING'])

function requireValue(condition, message) {
  if (!condition) throw new TypeError(message)
}

function errorFact(error, operation) {
  const detail = `${error?.message ?? ''} ${error?.stderr ?? ''}`
  const kind = error?.code === 'OBSERVER_RULES_STALE' ? 'stale-snapshot'
    : error?.code === 'OBSERVER_COMMAND_BUDGET' ? 'budget-exhausted'
    : error?.code === 'ERR_CHILD_PROCESS_STDIO_MAXBUFFER' ? 'response-limit'
    : /timeout|timed out|abort|ETIMEDOUT/i.test(detail) || error?.killed ? 'timeout'
    : /rate limit|HTTP 429|HTTP 403.*limit/i.test(detail) ? 'rate-limited'
      : /HTTP 401|authentication|not logged|GH_TOKEN|login/i.test(detail) ? 'authentication'
        : /HTTP 403|HTTP 404|not found|forbidden/i.test(detail) ? 'inaccessible'
          : error instanceof SyntaxError || error instanceof TypeError ? 'invalid-response' : 'request-failed'
  // Do not persist raw CLI stderr: it may contain credentials or private payloads.
  return { operation, kind, message: `${operation}: ${kind}` }
}

function normalizedReviews(reviews) {
  requireValue(Array.isArray(reviews), 'Reviews must be a complete array')
  const ids = new Set()
  return reviews.map((review) => {
    requireValue(Number.isSafeInteger(review.id) && !ids.has(review.id), 'Invalid or duplicate review ID')
    ids.add(review.id)
    requireValue(typeof review.user?.login === 'string' && review.user.login.length > 0, 'Missing review actor')
    requireValue(REVIEW_STATES.has(review.state), 'Unsupported review state')
    requireValue(review.state === 'PENDING' || (typeof review.submitted_at === 'string' && Number.isFinite(Date.parse(review.submitted_at))), 'Missing review submission time')
    requireValue(review.state === 'PENDING' || SHA.test(review.commit_id), 'Missing reviewed source head')
    return { id: review.id, reviewer: review.user.login.toLowerCase(), state: review.state, commit: review.commit_id ?? null, submittedAt: review.submitted_at ?? null }
  }).sort((a, b) => (Date.parse(a.submittedAt) || 0) - (Date.parse(b.submittedAt) || 0) || a.id - b.id)
}

function validReviewPolicy(policy) {
  if (policy?.mode === 'repository-rules') return true
  if (!policy || !Array.isArray(policy.authorizedReviewers) || !policy.authorizedReviewers.length || !Number.isInteger(policy.quorum) || policy.quorum < 1) return false
  const roster = policy.authorizedReviewers
  return roster.every((login) => typeof login === 'string' && /^[a-z\d](?:[a-z\d-]*[a-z\d])?$/i.test(login)) && new Set(roster.map((login) => login.toLowerCase())).size === roster.length && policy.quorum <= roster.length
}

export function qualifyApproval(input) {
  if (input.policy?.mode === 'repository-rules') return qualifyRepositoryApproval(input)
  const { headSha, reviews, policy, recheckedHeadSha, recheckedReviews } = input
  requireValue(SHA.test(headSha), 'An exact source head is required')
  const snapshot = normalizedReviews(reviews)
  const result = { status: 'unsupported', head: headSha, policy: policy ?? null, authority: validReviewPolicy(policy) ? 'operator-configured' : 'unknown', reviewSnapshot: snapshot, effectiveReviews: [], approvals: [], vetoes: [], reasons: [], platformApproval: 'not-evaluated' }
  if (!validReviewPolicy(policy)) {
    result.reasons.push('An explicit authorized reviewer roster and positive quorum are required')
    return result
  }
  requireValue(policy.authorizedReviewers.every((login) => typeof login === 'string' && /^[a-z\d](?:[a-z\d-]*[a-z\d])?$/i.test(login)), 'Invalid authorized reviewer roster')
  const roster = new Set(policy.authorizedReviewers.map((login) => login.toLowerCase()))
  requireValue(roster.size === policy.authorizedReviewers.length && policy.quorum <= roster.size, 'Reviewer roster must be unique and meet quorum')
  if (recheckedHeadSha !== headSha || !Array.isArray(recheckedReviews) || JSON.stringify(snapshot) !== JSON.stringify(normalizedReviews(recheckedReviews))) {
    result.status = 'stale'
    result.reasons.push('Head or review snapshot changed, or was not rechecked')
    return result
  }
  const effective = new Map()
  for (const review of snapshot) {
    // Comments and pending reviews do not supersede an actor's submitted decision.
    if (roster.has(review.reviewer) && !['COMMENTED', 'PENDING'].includes(review.state)) effective.set(review.reviewer, review)
  }
  result.effectiveReviews = [...effective.values()]
  result.approvals = result.effectiveReviews.filter((review) => review.state === 'APPROVED' && review.commit === headSha)
  result.vetoes = result.effectiveReviews.filter((review) => review.state === 'CHANGES_REQUESTED')
  result.status = result.vetoes.length || result.approvals.length < policy.quorum ? 'blocked' : 'qualified'
  if (result.vetoes.length) result.reasons.push('An authorized actor has an effective change request')
  if (result.approvals.length < policy.quorum) result.reasons.push('Current-head authorized approval quorum is not met')
  return result
}


function stable(value) {
  if (Array.isArray(value)) return JSON.stringify(value.map((item) => JSON.parse(stable(item))))
  if (value && typeof value === 'object') return JSON.stringify(Object.fromEntries(Object.keys(value).sort().map((key) => [key, JSON.parse(stable(value[key]))])))
  return JSON.stringify(value)
}

export function resolveRepositoryRules(rules) {
  requireValue(Array.isArray(rules) && rules.every((rule) => rule && typeof rule.type === 'string'), 'Expected complete branch rules')
  const ruleSnapshot = rules.map((rule) => JSON.parse(stable(rule))).sort((a, b) => stable(a).localeCompare(stable(b)))
  const pullRules = ruleSnapshot.filter((rule) => rule.type === 'pull_request')
  const reasons = []
  if (!pullRules.length) reasons.push('No required-review rule was exposed; review authority is unknown')
  for (const rule of pullRules) {
    const parameters = rule.parameters
    if (!parameters || !Number.isInteger(parameters.required_approving_review_count) || parameters.required_approving_review_count < 1 || typeof parameters.dismiss_stale_reviews_on_push !== 'boolean' || typeof parameters.require_code_owner_review !== 'boolean' || !Array.isArray(parameters.required_reviewers)) reasons.push('Required-review policy fields are incomplete')
    if (parameters?.require_code_owner_review === true || parameters?.required_reviewers?.length) reasons.push('Code-owner or required-team authority needs additional qualified evidence')
  }
  const staleDismissal = pullRules.length && pullRules.every((rule) => typeof rule.parameters?.dismiss_stale_reviews_on_push === 'boolean') ? pullRules.some((rule) => rule.parameters.dismiss_stale_reviews_on_push) : null
  if (staleDismissal === false) reasons.push('Retained approvals need actor authority proof when stale-review dismissal is disabled; this pilot cannot qualify them')
  return { status: reasons.length ? 'unsupported' : 'complete', authority: 'repository-required-review-decision', quorum: reasons.length ? null : Math.max(...pullRules.map((rule) => rule.parameters.required_approving_review_count)), dismissStaleReviewsOnPush: staleDismissal, ruleSnapshot, reasons }
}

export function qualifyRepositoryApproval({ headSha, baseSha, reviews, repositoryRules, graphQL, recheckedHeadSha, recheckedBaseSha, recheckedReviews, recheckedRepositoryRules, recheckedGraphQL }) {
  requireValue(SHA.test(headSha) && SHA.test(baseSha), 'Exact source head and base are required')
  const snapshot = normalizedReviews(reviews)
  const policyFacts = resolveRepositoryRules(repositoryRules ?? [])
  const result = { status: 'unsupported', head: headSha, base: baseSha, authority: 'repository-required-review-decision', policyFacts, observedGraphQL: graphQL ?? null, recheckedGraphQL: recheckedGraphQL ?? null, reviewSnapshot: snapshot, effectiveReviews: [], approvals: [], vetoes: [], reasons: [...policyFacts.reasons], platformApproval: 'source-review-decision-observed', mergePermission: 'not-granted' }
  if (policyFacts.status !== 'complete') return result
  if (!graphQL || !recheckedGraphQL || !Array.isArray(recheckedRepositoryRules)) {
    result.reasons.push('Current GitHub review decision and branch-rule rechecks are required')
    return result
  }
  if (headSha !== recheckedHeadSha || baseSha !== recheckedBaseSha || graphQL.headRefOid !== headSha || graphQL.baseRefOid !== baseSha || recheckedGraphQL.headRefOid !== headSha || recheckedGraphQL.baseRefOid !== baseSha || graphQL.reviewDecision !== recheckedGraphQL.reviewDecision || !Array.isArray(recheckedReviews) || stable(snapshot) !== stable(normalizedReviews(recheckedReviews)) || stable(policyFacts.ruleSnapshot) !== stable(resolveRepositoryRules(recheckedRepositoryRules).ruleSnapshot)) {
    result.status = 'stale'
    result.reasons.push('Source head/base, GitHub decision, reviews or required-review rules changed')
    return result
  }
  const effective = new Map()
  for (const review of snapshot) if (!['COMMENTED', 'PENDING'].includes(review.state)) effective.set(review.reviewer, review)
  result.effectiveReviews = [...effective.values()]
  result.approvals = result.effectiveReviews.filter((review) => review.state === 'APPROVED' && review.commit === headSha)
  result.vetoes = result.effectiveReviews.filter((review) => review.state === 'CHANGES_REQUESTED')
  result.status = graphQL.reviewDecision === 'APPROVED' && result.approvals.length >= policyFacts.quorum && !result.vetoes.length ? 'qualified' : 'blocked'
  if (graphQL.reviewDecision !== 'APPROVED') result.reasons.push('Current GitHub required-review decision is not APPROVED')
  if (result.approvals.length < policyFacts.quorum) result.reasons.push('Effective exact-head positive reviews do not meet the recorded repository quorum')
  if (result.vetoes.length) result.reasons.push('An effective change request remains')
  return result
}

function samePRContext(previous, current) {
  return ['head', 'base'].every((key) => previous[key]?.sha === current[key]?.sha && previous[key]?.ref === current[key]?.ref && previous[key]?.repo?.full_name === current[key]?.repo?.full_name) && previous.state === current.state && previous.merged_at === current.merged_at && previous.merge_commit_sha === current.merge_commit_sha
}

function qualifyPR(previous, current, reviews, recheckedReviews, policy, policyEvidence = {}) {
  const result = qualifyApproval({ ...policyEvidence, headSha: previous.head.sha, baseSha: previous.base.sha, reviews, policy, recheckedHeadSha: current.head?.sha, recheckedBaseSha: current.base?.sha, recheckedReviews })
  if (!samePRContext(previous, current)) {
    result.status = 'stale'
    result.reasons.push('PR base, state or integration context changed during acquisition')
  }
  return result
}

async function defaultRunCommand(file, args, options) {
  return execFileAsync(file, args, { ...options, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, shell: false })
}

/** Fetch every Link-header page. A failed page fails the whole result. */
export async function fetchAllPages(endpoint, { runCommand = defaultRunCommand, timeoutMs = 30_000 } = {}) {
  requireValue(typeof endpoint === 'string' && endpoint.startsWith('/repos/'), 'Only repository GET endpoints are supported')
  const { stdout } = await runCommand('gh', ['api', '--method', 'GET', '--paginate', '--slurp', endpoint], { timeout: timeoutMs })
  const pages = JSON.parse(stdout)
  requireValue(Array.isArray(pages) && pages.length > 0, 'Expected at least one complete API page')
  return pages
}

/** Actual ancestry establishes membership. Reviews and approval dates do not. */
export function buildMembership({ baselineCommit, sourceCut, comparison, pullRequests = [] }) {
  requireValue(SHA.test(baselineCommit) && SHA.test(sourceCut?.commit), 'Membership requires exact baseline and selected cut')
  requireValue(Array.isArray(comparison), 'Comparison pages are required')
  const first = comparison[0]
  if (!first || !['ahead', 'identical'].includes(first.status) || !Number.isSafeInteger(first.total_commits) || first.total_commits < 0 || first.base_commit?.sha !== baselineCommit || first.merge_base_commit?.sha !== baselineCommit) {
    return { status: 'incomplete', reasons: ['Baseline is not a proven ancestor of the selected cut'], includedUnits: [], excludedUnits: [], commits: [] }
  }
  const commits = comparison.flatMap((page) => {
    requireValue(Array.isArray(page.commits), 'Missing comparison commits')
    return page.commits.map((commit) => {
      requireValue(SHA.test(commit.sha) && SHA.test(commit.commit?.tree?.sha), 'Missing exact commit/tree identity')
      requireValue(Array.isArray(commit.parents) && commit.parents.every((parent) => SHA.test(parent.sha)), 'Missing commit ancestry')
      return { commit: commit.sha, tree: commit.commit.tree.sha, parents: commit.parents.map((parent) => parent.sha) }
    })
  })
  const commitSet = new Set(commits.map((commit) => commit.commit))
  if (comparison.some((page) => page.total_commits !== first.total_commits || page.base_commit?.sha !== baselineCommit || page.merge_base_commit?.sha !== baselineCommit) || commitSet.size !== commits.length || commits.length !== first.total_commits || (first.status === 'identical' ? sourceCut.commit !== baselineCommit || commits.length !== 0 : !commitSet.has(sourceCut.commit))) {
    return { status: 'incomplete', reasons: ['Comparison pagination does not account for every unique commit'], includedUnits: [], excludedUnits: [], commits }
  }
  const includedUnits = []
  const excludedUnits = []
  for (const pr of pullRequests) {
    const unit = { number: pr.number, head: pr.head?.sha ?? null, mergeCommit: pr.merge_commit_sha ?? null }
    if (pr.merged_at && commitSet.has(pr.merge_commit_sha)) includedUnits.push({ ...unit, integration: 'requires-source-confirmation' })
    else excludedUnits.push({ ...unit, reason: pr.merged_at ? 'merge-not-in-baseline-to-cut-ancestry' : 'not-merged' })
  }
  // Unmapped commits are accounted for, but not guessed to be unreviewed direct commits.
  const mapped = new Set(includedUnits.map((unit) => unit.mergeCommit))
  return { status: 'complete', baselineCommit, sourceCommit: sourceCut.commit, includedUnits, excludedUnits, commits, unmappedCommits: commits.filter((commit) => !mapped.has(commit.commit)), sourceConfirmation: 'pending', netChange: 'requires-source-inspection', evidence: ['complete GitHub comparison ancestry; PR merge locators are contribution leads'] }
}

export async function observeSource(config, dependencies = {}) {
  const { repository, branch, packageName, reviewPolicy, publishedBaseline, timeoutMs = 30_000, maxGithubCommands = 250 } = config ?? {}
  requireValue(typeof repository === 'string' && /^[a-z\d_.-]+\/[a-z\d_.-]+$/i.test(repository), 'Invalid repository owner/name')
  requireValue(typeof branch === 'string' && branch.length > 0 && branch.length <= 250 && !/[\s\x00-\x1f?#]/.test(branch), 'Invalid branch')
  requireValue(typeof packageName === 'string' && /^(?:@[a-z\d._-]+\/)?[a-z\d._-]+$/.test(packageName), 'Invalid npm package name')
  requireValue(Number.isInteger(timeoutMs) && timeoutMs >= 1 && timeoutMs <= 120_000, 'Invalid request timeout')
  requireValue(Number.isInteger(maxGithubCommands) && maxGithubCommands >= 1 && maxGithubCommands <= 5000, 'GitHub command budget must be 1..5000')
  const runCommand = dependencies.runCommand ?? defaultRunCommand
  const fetch = dependencies.fetch ?? globalThis.fetch
  const observedAt = (dependencies.now ?? (() => new Date().toISOString()))()
  const observation = { schemaVersion: 1, kind: 'source-observation', repository, branch, packageName, observedAt, readOnly: true, health: 'complete', completeness: { source: false, reviews: false, membership: false, registry: false }, entitlement: 'unverified', sourceCut: null, pullRequests: [], approvedUnits: [], publication: null, membership: { status: 'incomplete', reasons: ['Published source mapping is unknown'] }, errors: [], requests: { githubCommands: 0, githubPages: 0, registryRequests: 0 }, continuousOperation: 'unqualified', platformApproval: 'not-evaluated', requestBudget: { maxGithubCommands, commandTimeoutMs: timeoutMs }, repositoryReviewPolicy: null, reviewScope: { mode: 'full-conservative', relevantPRNumbers: [], notRequestedPRNumbers: [] } }
  let reservedGithubCommands = 0
  const runGithub = async (file, args, options) => {
    if (observation.requests.githubCommands >= maxGithubCommands - reservedGithubCommands) throw Object.assign(new Error('GitHub command budget exhausted'), { code: 'OBSERVER_COMMAND_BUDGET' })
    observation.requests.githubCommands++
    return runCommand(file, args, options)
  }
  const api = async (endpoint, paginate = false) => {
    if (paginate) {
      const pages = await fetchAllPages(endpoint, { runCommand: runGithub, timeoutMs })
      observation.requests.githubPages += pages.length
      return pages
    }
    const { stdout } = await runGithub('gh', ['api', '--method', 'GET', endpoint], { timeout: timeoutMs })
    observation.requests.githubPages++
    return JSON.parse(stdout)
  }
  const currentDecision = async (number) => {
    const [owner, name] = repository.split('/')
    const { stdout } = await runGithub('gh', ['api', 'graphql', '-f', `query=${REVIEW_QUERY}`, '-f', `owner=${owner}`, '-f', `name=${name}`, '-F', `number=${number}`], { timeout: timeoutMs })
    observation.requests.githubPages++
    const response = JSON.parse(stdout)
    requireValue(!response.errors?.length && response.data?.repository?.pullRequest, 'Incomplete GraphQL review decision')
    const decision = response.data.repository.pullRequest
    requireValue(SHA.test(decision.headRefOid) && SHA.test(decision.baseRefOid) && (decision.reviewDecision === null || ['APPROVED', 'CHANGES_REQUESTED', 'REVIEW_REQUIRED'].includes(decision.reviewDecision)), 'Invalid GraphQL source identity or review decision')
    return decision
  }
  const recordError = (error, operation) => {
    const fact = errorFact(error, operation)
    if (fact.kind !== 'budget-exhausted' || !observation.errors.some((item) => item.kind === 'budget-exhausted')) observation.errors.push(fact)
    observation.health = 'incomplete'
  }
  let pullRequests = null
  try {
    // A public API success alone does not establish authenticated cross-repository access.
    await runGithub('gh', ['auth', 'status'], { timeout: timeoutMs })
    await api(`/repos/${repository}`)
    observation.entitlement = 'accessible-with-current-gh-auth'
    const branchEndpoint = `/repos/${repository}/commits/${encodeURIComponent(branch)}`
    const tip = await api(branchEndpoint)
    requireValue(SHA.test(tip.sha) && SHA.test(tip.commit?.tree?.sha), 'Missing branch commit/tree')
    observation.sourceCut = { kind: 'actual', repository, branch, commit: tip.sha, tree: tip.commit.tree.sha }
    const pages = await api(`/repos/${repository}/pulls?state=all&base=${encodeURIComponent(branch)}&per_page=100&sort=created&direction=asc`, true)
    requireValue(pages.every(Array.isArray), 'Invalid PR pagination')
    pullRequests = pages.flat()
    if (publishedBaseline?.sourceMapping?.status === 'verified' && Array.isArray(publishedBaseline.sourceMapping.evidence) && publishedBaseline.sourceMapping.evidence.length && SHA.test(publishedBaseline.sourceCommit)) {
      try {
        const comparison = await api(`/repos/${repository}/compare/${publishedBaseline.sourceCommit}...${tip.sha}?per_page=100`, true)
        observation.membership = buildMembership({ baselineCommit: publishedBaseline.sourceCommit, sourceCut: observation.sourceCut, comparison, pullRequests })
        observation.completeness.membership = observation.membership.status === 'complete'
      } catch (error) {
        recordError(error, 'baseline-ancestry')
        observation.membership = { status: 'incomplete', reasons: ['Failed to acquire complete baseline ancestry'] }
      }
    }
    const repositoryMode = reviewPolicy?.mode === 'repository-rules'
    let repositoryRules = null
    const readRules = async () => (await api(`/repos/${repository}/rules/branches/${encodeURIComponent(branch)}?per_page=100`, true)).flatMap((page) => {
      requireValue(Array.isArray(page), 'Incomplete rules pagination')
      return page
    })
    if (repositoryMode) {
      try {
        repositoryRules = await readRules()
        observation.repositoryReviewPolicy = resolveRepositoryRules(repositoryRules)
      } catch (error) {
        recordError(error, 'repository-review-policy')
        observation.repositoryReviewPolicy = { status: 'unknown', authority: 'repository-required-review-decision', reasons: ['Failed to acquire complete required-review rules'] }
      }
    }
    const approvalPolicyKnown = validReviewPolicy(reviewPolicy) && (!repositoryMode || observation.repositoryReviewPolicy?.status === 'complete')
    const delta = observation.completeness.membership ? new Set(observation.membership.commits.map((commit) => commit.commit)) : null
    observation.reviewScope.mode = !approvalPolicyKnown ? 'unqualified-summaries' : delta ? 'verified-baseline-delta-and-open' : 'full-conservative'
    reservedGithubCommands = repositoryMode && observation.repositoryReviewPolicy?.status === 'complete' ? 2 : 1
    const seen = new Set()
    // Unknown baseline correspondence must not starve approved open work behind history.
    const reviewOrder = [...pullRequests].sort((a, b) => Number(a.state !== 'open') - Number(b.state !== 'open'))
    for (const summary of reviewOrder) {
      requireValue(Number.isSafeInteger(summary.number) && summary.number > 0 && !seen.has(summary.number), 'Invalid or duplicate PR number')
      seen.add(summary.number)
      requireValue(SHA.test(summary.head?.sha) && SHA.test(summary.base?.sha) && ['open', 'closed'].includes(summary.state), 'Missing PR summary source context')
      const summaryFact = { number: summary.number, state: summary.state, head: summary.head.sha, base: summary.base.sha, mergeCommit: summary.merged_at ? summary.merge_commit_sha : null, mergedAt: summary.merged_at ?? null, detail: 'summary-only' }
      if (summary.state === 'closed' && !summary.merged_at) {
        observation.pullRequests.push({ ...summaryFact, approval: { status: 'rejected', reasons: ['Closed without merge'] } })
        continue
      }
      if (!approvalPolicyKnown) {
        observation.reviewScope.notRequestedPRNumbers.push(summary.number)
        observation.pullRequests.push({ ...summaryFact, approval: { status: 'unsupported', authority: 'unknown', reasons: [repositoryMode ? 'Repository required-review policy is incomplete; review details were not requested' : 'Explicit review policy is required; review details were not requested'] } })
        continue
      }
      if (delta && summary.state !== 'open' && !delta.has(summary.merge_commit_sha)) {
        observation.reviewScope.notRequestedPRNumbers.push(summary.number)
        observation.pullRequests.push({ ...summaryFact, approval: { status: 'not-requested', reasons: ['Historical merge outside the verified baseline-to-cut ancestry'] } })
        continue
      }
      observation.reviewScope.relevantPRNumbers.push(summary.number)
      try {
        const endpoint = `/repos/${repository}/pulls/${summary.number}`
        const pr = await api(endpoint)
        requireValue(SHA.test(pr.head?.sha) && SHA.test(pr.base?.sha), 'Missing PR source context')
        requireValue(!repositoryMode || pr.base.ref === branch, 'PR no longer targets the selected required-review branch')
        if (pr.state === 'closed' && !pr.merged_at) {
          observation.pullRequests.push({ number: pr.number, state: 'closed', head: pr.head.sha, approval: { status: 'rejected', reasons: ['Closed without merge'] } })
          continue
        }
        const graphQL = repositoryMode ? await currentDecision(pr.number) : null
        const reviews = (await api(`${endpoint}/reviews?per_page=100`, true)).flatMap((page) => {
          requireValue(Array.isArray(page), 'Invalid review pagination')
          return page
        })
        const reviewsAgain = (await api(`${endpoint}/reviews?per_page=100`, true)).flatMap((page) => {
          requireValue(Array.isArray(page), 'Invalid review pagination')
          return page
        })
        const graphQLAgain = repositoryMode ? await currentDecision(pr.number) : null
        const prAgain = await api(endpoint)
        const policyEvidence = { repositoryRules, recheckedRepositoryRules: repositoryRules, graphQL, recheckedGraphQL: graphQLAgain }
        const approval = qualifyPR(pr, prAgain, reviews, reviewsAgain, reviewPolicy, policyEvidence)
        const fact = { detail: 'head-and-reviews-rechecked', number: pr.number, state: pr.state, head: pr.head.sha, base: pr.base.sha, mergeCommit: pr.merged_at ? pr.merge_commit_sha : null, mergedAt: pr.merged_at ?? null, approval }
        if (approval.status === 'qualified') {
          const head = await api(`/repos/${repository}/git/commits/${pr.head.sha}`)
          requireValue(head.sha === pr.head.sha && SHA.test(head.tree?.sha), 'Missing reviewed source tree')
          // Recheck after tree acquisition as well; a new head must not qualify old source.
          const finalReviews = (await api(`${endpoint}/reviews?per_page=100`, true)).flat()
          const finalGraphQL = repositoryMode ? await currentDecision(pr.number) : null
          const finalPR = await api(endpoint)
          fact.approval = qualifyPR(pr, finalPR, reviews, finalReviews, reviewPolicy, { ...policyEvidence, recheckedGraphQL: finalGraphQL })
          if (fact.approval.status === 'qualified') observation.approvedUnits.push({ repository, number: pr.number, head: pr.head.sha, tree: head.tree.sha, base: pr.base.sha, approval: fact.approval, observedAt, membership: 'not-established-by-approval' })
        }
        observation.pullRequests.push(fact)
      } catch (error) {
        recordError(error, `pull-request-${summary.number}`)
        observation.pullRequests.push({ ...summaryFact, approval: { status: 'unknown', reasons: ['Failed to obtain complete current approval evidence'] } })
      }
    }
    reservedGithubCommands = 0
    if (repositoryMode && observation.repositoryReviewPolicy?.status === 'complete') {
      try {
        const recheckedRules = resolveRepositoryRules(await readRules())
        if (stable(observation.repositoryReviewPolicy.ruleSnapshot) !== stable(recheckedRules.ruleSnapshot)) throw Object.assign(new Error('Repository rules changed'), { code: 'OBSERVER_RULES_STALE' })
        observation.repositoryReviewPolicy.rechecked = true
        for (const fact of observation.pullRequests) if (fact.approval.policyFacts) fact.approval.policyFacts.rechecked = true
      } catch (error) {
        recordError(error, 'repository-review-policy-recheck')
        observation.repositoryReviewPolicy.status = error.code === 'OBSERVER_RULES_STALE' ? 'stale' : 'unknown'
        observation.repositoryReviewPolicy.rechecked = false
        observation.approvedUnits = []
        for (const fact of observation.pullRequests) if (fact.approval.status === 'qualified') fact.approval = { ...fact.approval, status: 'stale', reasons: [...fact.approval.reasons, 'Required-review rules could not be confirmed unchanged'] }
      }
    }
    observation.completeness.reviews = approvalPolicyKnown && (!repositoryMode || observation.repositoryReviewPolicy?.rechecked === true) && observation.pullRequests.every((pr) => !['unknown', 'unsupported', 'stale'].includes(pr.approval.status))
    const finalTip = await api(branchEndpoint)
    observation.completeness.source = finalTip.sha === tip.sha && finalTip.commit?.tree?.sha === tip.commit.tree.sha
    if (!observation.completeness.source) {
      observation.membership = { ...observation.membership, status: 'stale', reasons: ['Branch advanced during observation'] }
      observation.completeness.membership = false
      observation.health = 'incomplete'
    }
  } catch (error) {
    recordError(error, 'github-observation')
    if (observation.entitlement === 'unverified') observation.entitlement = observation.errors.at(-1).kind
  }
  try {
    observation.requests.registryRequests++
    const response = await fetch(`https://registry.npmjs.org/${encodeURIComponent(packageName)}`, { headers: { Accept: 'application/vnd.npm.install-v1+json' }, signal: AbortSignal.timeout(timeoutMs) })
    if (!response.ok) throw new Error(`npm registry HTTP ${response.status}`)
    const metadata = await response.json()
    const latest = metadata['dist-tags']?.latest
    const version = metadata.versions?.[latest]
    requireValue(typeof latest === 'string' && version?.version === latest && typeof version.dist?.integrity === 'string' && typeof version.dist?.tarball === 'string', 'Missing exact npm metadata')
    observation.publication = { status: 'observed-metadata-only', packageName, version: latest, registry: 'https://registry.npmjs.org', integrity: version.dist.integrity, tarball: version.dist.tarball, gitHead: version.gitHead ?? null, artifactBinding: 'unverified' }
    observation.completeness.registry = true
  } catch (error) { recordError(error, 'npm-observation') }
  if (Object.values(observation.completeness).some((value) => !value)) observation.health = 'incomplete'
  return observation
}
