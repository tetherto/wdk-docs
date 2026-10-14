import { createHash } from 'node:crypto'

const SHA = /^[a-f0-9]{40}$/i
const PACKAGE_NAME = /^(?:@[a-z\d._-]+\/)?[a-z\d._-]+$/
const SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/
const STATUSES = new Set(['unknown', 'pending', 'complete', 'qualified', 'passed', 'bound', 'blocked', 'partial', 'stale', 'rejected'])

function requireValue(condition, message) {
  if (!condition) throw new TypeError(message)
}

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical)
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]))
  return value
}

function immutable(value) {
  const copy = structuredClone(value)
  const freeze = (object) => {
    if (object && typeof object === 'object') {
      Object.values(object).forEach(freeze)
      Object.freeze(object)
    }
    return object
  }
  return freeze(copy)
}

function nonempty(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function evidence(value) {
  return Array.isArray(value) && value.length > 0 && value.every(nonempty)
}

function exactVersion(value) {
  if (typeof value !== 'string' || value.length > 256) return false
  const match = SEMVER.exec(value)
  return Boolean(match && match.slice(1, 4).every((part) => Number.isSafeInteger(Number(part))) && (!match[4] || match[4].split('.').every((part) => !/^\d+$/.test(part) || !/^0\d/.test(part))))
}

function npmRegistry(value) {
  if (typeof value !== 'string' || value !== value.trim()) return false
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && url.hostname === 'registry.npmjs.org' && !url.port && !url.username && !url.password && url.pathname === '/' && !url.search && !url.hash
  } catch { return false }
}

function validateCandidate(candidate) {
  requireValue(candidate?.schemaVersion === 1 && candidate.kind === 'cumulative-candidate', 'Unsupported candidate schema')
  requireValue(nonempty(candidate.id), 'Candidate ID is required')
  requireValue(typeof candidate.packageName === 'string' && candidate.packageName.length <= 214 && PACKAGE_NAME.test(candidate.packageName), 'An exact npm package identity is required')
  requireValue(candidate.sourceCut?.kind === 'actual' && nonempty(candidate.sourceCut.repository) && SHA.test(candidate.sourceCut.commit) && SHA.test(candidate.sourceCut.tree), 'Candidate requires an immutable actual source cut')
  requireValue(SHA.test(candidate.docsBase?.commit), 'Candidate requires an exact docs base')
  requireValue(candidate.draft === null || (SHA.test(candidate.draft?.head) && candidate.draft.base === candidate.docsBase.commit), 'Draft must bind an exact head and the selected docs base')
  requireValue(candidate.dependencyContext === null || (typeof candidate.dependencyContext === 'object' && !Array.isArray(candidate.dependencyContext)), 'Dependency context must be explicit object data')
  const digest = candidate.dependencyContext === null ? null : createHash('sha256').update(JSON.stringify(canonical(candidate.dependencyContext))).digest('hex')
  requireValue(candidate.contextDigest === digest, 'Dependency context digest mismatch')
  for (const dimension of ['observation', 'approval', 'membership', 'coverage', 'contentReview', 'draftValidation', 'publication', 'application']) {
    requireValue(candidate[dimension] && STATUSES.has(candidate[dimension].status), `Missing or unsupported ${dimension} status`)
  }
  if (candidate.publication.version !== undefined) requireValue(exactVersion(candidate.publication.version), 'Publication version must be an exact semantic version')
  if (candidate.publication.registry !== undefined) requireValue(npmRegistry(candidate.publication.registry), 'Publication registry must be the HTTPS npm registry base URL')
  return candidate
}

export function createCandidate(input) {
  const dependencyContext = input?.dependencyContext ?? null
  const candidate = {
    schemaVersion: 1,
    kind: 'cumulative-candidate',
    id: input?.id,
    packageName: input?.packageName,
    sourceCut: input?.sourceCut,
    docsBase: input?.docsBase,
    draft: input?.draft ?? null,
    dependencyContext,
    contextDigest: dependencyContext === null ? null : createHash('sha256').update(JSON.stringify(canonical(dependencyContext))).digest('hex'),
    observation: input?.observation ?? { status: 'unknown' },
    approval: input?.approval ?? { status: 'unknown' },
    membership: input?.membership ?? { status: 'unknown', includedUnits: [], excludedUnits: [], directCommits: [] },
    coverage: input?.coverage ?? { status: 'unknown' },
    contentReview: input?.contentReview ?? { status: 'pending' },
    draftValidation: input?.draftValidation ?? { status: 'pending' },
    publication: input?.publication ?? { status: 'pending', requiredChecks: ['actual-artifact-integrity', 'source-correspondence', 'installed-context', 'released-runtime-and-types'] },
    application: input?.application ?? { status: 'pending' }
  }
  return immutable(validateCandidate(candidate))
}

/** Binding carried by human review, validation, artifact, and acceptance receipts. */
export function candidateBinding(candidate) {
  validateCandidate(candidate)
  return {
    candidateId: candidate.id,
    packageName: candidate.packageName,
    sourceCommit: candidate.sourceCut.commit,
    sourceTree: candidate.sourceCut.tree,
    docsHead: candidate.draft?.head ?? null,
    docsBase: candidate.docsBase.commit,
    contextDigest: candidate.contextDigest
  }
}

function matchesBinding(candidate, receipt) {
  return Object.entries(candidateBinding(candidate)).every(([key, value]) => value !== null && receipt?.[key] === value)
}

export function assessReadiness(candidate) {
  validateCandidate(candidate)
  const blockers = []
  if (candidate.observation.status !== 'complete') blockers.push('observation-incomplete')
  if (candidate.approval.status !== 'qualified' || candidate.approval.sourceCommit !== candidate.sourceCut.commit || candidate.approval.sourceTree !== candidate.sourceCut.tree || !evidence(candidate.approval.evidence)) blockers.push('source-approval-unqualified')
  if (candidate.membership.status !== 'complete' || !evidence(candidate.membership.evidence) || !['includedUnits', 'excludedUnits', 'directCommits'].every((key) => Array.isArray(candidate.membership[key]))) blockers.push('membership-incomplete')
  if (candidate.coverage.status !== 'complete' || !evidence(candidate.coverage.evidence)) blockers.push('coverage-incomplete')
  if (!candidate.dependencyContext || !Object.keys(candidate.dependencyContext).length) blockers.push('dependency-context-unknown')
  if (!candidate.draft) blockers.push('exact-draft-missing')
  const review = candidate.contentReview
  if (review.status !== 'complete' || !matchesBinding(candidate, review) || !nonempty(review.reviewer) || !Array.isArray(review.scope) || !review.scope.length || !review.scope.every(nonempty) || review.closed !== true || !evidence(review.evidence)) blockers.push('human-impact-scope-not-closed')
  const validation = candidate.draftValidation
  if (validation.status !== 'passed' || !matchesBinding(candidate, validation) || !Array.isArray(validation.checks) || !validation.checks.length || validation.checks.some((check) => !nonempty(check.name) || check.status !== 'passed') || !evidence(validation.evidence)) blockers.push('exact-draft-validation-missing')
  const contentReady = blockers.length === 0
  const publication = candidate.publication
  const publicationBound = publication.status === 'bound' && matchesBinding(candidate, publication) && publication.packageName === candidate.packageName && exactVersion(publication.version) && npmRegistry(publication.registry) && nonempty(publication.integrity) && publication.artifactVerified === true && publication.contextVerified === true && publication.materialDifferencesResolved === true && evidence(publication.evidence)
  const applicationCurrent = candidate.application.status === 'complete' && matchesBinding(candidate, candidate.application) && candidate.application.preimagesVerified === true && evidence(candidate.application.evidence)
  return immutable({ contentReady, canFreeze: contentReady, publicationBound, applicationCurrent, canRecordAcceptance: contentReady && publicationBound && applicationCurrent, blockers, platformApproval: 'not-evaluated', mergePermission: 'not-granted', delivery: 'not-established' })
}

function validateState(state) {
  requireValue(state?.schemaVersion === 1 && state.kind === 'preparation-state', 'Unsupported preparation state schema')
  requireValue(Array.isArray(state.history) && Array.isArray(state.rejections), 'Invalid preparation history')
  requireValue(state.working === null || Boolean(state.working), 'Invalid working epoch')
  requireValue(state.frozen === null || Boolean(state.frozen?.candidate), 'Invalid frozen epoch')
  for (const candidate of [state.working, state.frozen?.candidate, ...state.history.map((item) => item?.candidate)].filter(Boolean)) validateCandidate(candidate)
  requireValue(state.history.every((item) => item && ['superseded-working', 'rejected', 'accepted'].includes(item.disposition) && item.candidate), 'Invalid history record')
  requireValue(state.rejections.every((item) => nonempty(item?.candidateId) && nonempty(item.repository) && SHA.test(item.sourceCommit) && SHA.test(item.sourceTree) && nonempty(item.reason) && nonempty(item.actor)), 'Invalid rejection record')
  if (state.frozen) {
    const { candidate, releaseHandoff } = state.frozen
    requireValue(releaseHandoff?.confirmed === true && nonempty(releaseHandoff.owner) && releaseHandoff.sourceCommit === candidate.sourceCut.commit && releaseHandoff.sourceTree === candidate.sourceCut.tree && evidence(releaseHandoff.evidence), 'Frozen handoff does not bind the candidate cut')
  }
  if (state.working && state.frozen) requireValue(state.working.id !== state.frozen.candidate.id, 'Frozen and working IDs must differ')
  if (state.acceptedD !== null) requireValue(SHA.test(state.acceptedD?.docsCommit) && nonempty(state.acceptedD?.branch) && evidence(state.acceptedD?.evidence), 'Accepted docs baseline requires actual commit evidence')
  return state
}

export function createPreparationState({ publishedB = null, acceptedD = null } = {}) {
  return immutable(validateState({ schemaVersion: 1, kind: 'preparation-state', publishedB, acceptedD, frozen: null, working: null, history: [], rejections: [] }))
}

/** Pure local evidence transitions. This function never writes or approves a PR. */
export function transitionState(state, event) {
  validateState(state)
  requireValue(event && nonempty(event.type), 'Transition type is required')
  const next = structuredClone(state)
  switch (event.type) {
    case 'propose': {
      const candidate = validateCandidate(event.candidate)
      const existing = [state.working, state.frozen?.candidate, ...state.history.map((item) => item.candidate)].filter(Boolean)
      const sameId = existing.find((item) => item.id === candidate.id)
      if (sameId) {
        requireValue(JSON.stringify(canonical(sameId)) === JSON.stringify(canonical(candidate)), 'Candidate IDs are immutable; choose a new ID for changed input')
        return immutable(state)
      }
      const rejected = state.rejections.findLast((item) => item.repository === candidate.sourceCut.repository && item.sourceCommit === candidate.sourceCut.commit && item.sourceTree === candidate.sourceCut.tree)
      if (rejected) requireValue(event.retryOf === rejected.candidateId && nonempty(event.selectedBy), 'Rejected source requires deliberate owner-selected retry')
      if (state.working) next.history.push({ disposition: 'superseded-working', candidate: state.working })
      next.working = candidate
      break
    }
    case 'freeze': {
      requireValue(!state.frozen, 'At most one frozen epoch may be active')
      requireValue(state.working?.id === event.candidateId, 'Select the current working candidate')
      requireValue(assessReadiness(state.working).canFreeze, 'Candidate cannot freeze without complete exact content and validation receipts')
      const handoff = event.releaseHandoff
      requireValue(handoff?.confirmed === true && nonempty(handoff.owner) && handoff.sourceCommit === state.working.sourceCut.commit && handoff.sourceTree === state.working.sourceCut.tree && evidence(handoff.evidence), 'Release owner must confirm the exact intended cut')
      next.frozen = { candidate: state.working, releaseHandoff: handoff }
      next.working = null
      break
    }
    case 'reject': {
      requireValue(nonempty(event.reason) && nonempty(event.actor), 'Rejection needs a reason and accountable actor')
      const candidate = state.working?.id === event.candidateId ? state.working : state.frozen?.candidate.id === event.candidateId ? state.frozen.candidate : null
      requireValue(candidate, 'Candidate to reject is not active')
      next.rejections.push({ candidateId: candidate.id, repository: candidate.sourceCut.repository, sourceCommit: candidate.sourceCut.commit, sourceTree: candidate.sourceCut.tree, reason: event.reason, actor: event.actor })
      next.history.push({ disposition: 'rejected', candidate, reason: event.reason })
      if (state.working?.id === candidate.id) next.working = null
      else next.frozen = null
      break
    }
    case 'bind-publication': {
      requireValue(state.frozen?.candidate.id === event.candidateId, 'Publication must select the frozen candidate')
      const candidate = createCandidate({ ...state.frozen.candidate, publication: event.publication, application: event.application ?? state.frozen.candidate.application })
      requireValue(assessReadiness(candidate).publicationBound, 'Actual artifact reconciliation must match the exact candidate')
      // Preserve the frozen C. Later receipts are separate epoch evidence.
      next.frozen = { ...state.frozen, publication: event.publication, application: event.application ?? null }
      break
    }
    case 'accept': {
      requireValue(state.frozen?.candidate.id === event.candidateId, 'Acceptance must select the frozen candidate')
      const candidate = createCandidate({ ...state.frozen.candidate, publication: state.frozen.publication ?? state.frozen.candidate.publication, application: state.frozen.application ?? state.frozen.candidate.application })
      requireValue(assessReadiness(candidate).canRecordAcceptance, 'Partial, unknown or unbound evidence cannot advance accepted D')
      const receipt = event.receipt
      requireValue(matchesBinding(candidate, receipt) && SHA.test(receipt?.docsCommit) && receipt.branch === 'develop' && receipt.merged === true && evidence(receipt.evidence), 'Acceptance requires verified exact remote develop merge evidence')
      next.acceptedD = { ...receipt, sourceCut: candidate.sourceCut, dependencyContext: candidate.dependencyContext }
      next.history.push({ disposition: 'accepted', candidate: state.frozen.candidate, publication: candidate.publication, acceptance: receipt })
      next.frozen = null
      break
    }
    default: throw new TypeError(`Unsupported transition: ${event.type}`)
  }
  return immutable(validateState(next))
}
