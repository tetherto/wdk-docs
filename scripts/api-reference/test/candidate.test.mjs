import test from 'node:test'
import assert from 'node:assert/strict'
import { assessReadiness, candidateBinding, createCandidate, createPreparationState, transitionState } from '../candidate.mjs'

const sha = (character) => character.repeat(40)
const SOURCE = '3f36d48943b6050104a605ee167e5e94429f3f86'
const TREE = 'd187e07eb0cb5eb67b731a6e52261f769dfb24d8'
const DOCS = sha('c')
const DRAFT = sha('d')
const NEXT = '08ed781944b2449b60fedccc3e5927ce5e0460a6'
const sourceCut = { kind: 'actual', repository: 'tetherto/wdk-wallet-evm', commit: SOURCE, tree: TREE }

function candidate(id = 'beta21', overrides = {}) {
  const draft = createCandidate({ id, packageName: '@tetherto/wdk-wallet-evm', sourceCut, docsBase: { commit: DOCS }, draft: { head: DRAFT, base: DOCS }, dependencyContext: { '@tetherto/wdk-wallet': '1.0.0-beta.21' }, ...overrides })
  const binding = candidateBinding(draft)
  return createCandidate({ ...draft, observation: { status: 'complete' }, approval: { status: 'qualified', sourceCommit: draft.sourceCut.commit, sourceTree: draft.sourceCut.tree, evidence: ['authorized exact-cut source confirmation'] }, membership: { status: 'complete', includedUnits: [{ number: 134, head: SOURCE }], excludedUnits: [{ number: 118, head: NEXT }], directCommits: [], evidence: ['complete actual ancestry and contribution accounting'] }, coverage: { status: 'complete', evidence: ['complete public API and related authored scope'] }, contentReview: { ...binding, status: 'complete', closed: true, scope: ['sdk/wallet-modules/wallet-evm'], reviewer: 'docs-reviewer', evidence: ['human scope closure receipt'] }, draftValidation: { ...binding, status: 'passed', checks: [{ name: 'source-bound examples', status: 'passed' }], evidence: ['exact head/base test receipt'] }, ...overrides })
}

function freeze(state, value = candidate()) {
  return transitionState(transitionState(state, { type: 'propose', candidate: value }), { type: 'freeze', candidateId: value.id, releaseHandoff: { confirmed: true, owner: 'release-owner', sourceCommit: value.sourceCut.commit, sourceTree: value.sourceCut.tree, evidence: ['exact intended release cut'] } })
}

function published(state) {
  const value = state.frozen.candidate
  const binding = candidateBinding(value)
  return transitionState(state, { type: 'bind-publication', candidateId: value.id, publication: { ...binding, status: 'bound', packageName: '@tetherto/wdk-wallet-evm', version: '1.0.0-beta.21', registry: 'https://registry.npmjs.org', integrity: 'sha512-real-artifact', artifactVerified: true, contextVerified: true, materialDifferencesResolved: true, evidence: ['actual packed bytes and installed context verified'] }, application: { ...binding, status: 'complete', preimagesVerified: true, evidence: ['exact shared docs/manifest/feed preimages verified'] } })
}

function receipt(value) {
  return { ...candidateBinding(value), docsCommit: sha('f'), branch: 'develop', merged: true, evidence: ['actual remote develop merge readback'] }
}

test('exact closed human scope and source-bound checks permit freeze before publication', () => {
  const value = candidate()
  const readiness = assessReadiness(value)
  assert.equal(readiness.canFreeze, true)
  assert.equal(readiness.canRecordAcceptance, false)
  assert.equal(readiness.platformApproval, 'not-evaluated')
  assert.equal(readiness.mergePermission, 'not-granted')
  const state = freeze(createPreparationState(), value)
  assert.equal(state.frozen.candidate.id, 'beta21')
  assert.equal(state.acceptedD, null)
  assert(Object.isFrozen(state.frozen.candidate))
  assert.throws(() => { state.frozen.candidate.sourceCut.commit = NEXT }, TypeError)
})

test('F/W overlap preserves cumulative lineage and never rewrites frozen beta.21 or includes EVM #118 in it', () => {
  const state = freeze(createPreparationState())
  const before = JSON.stringify(state.frozen)
  const nextCandidate = candidate('next', { sourceCut: { ...sourceCut, commit: NEXT, tree: '687a16be5c86656040c08d374df788eceb401176' }, membership: { status: 'complete', includedUnits: [{ number: 134, head: '4b671aa5e8560c99ca3dadd41908ccbfd7275f0f' }, { number: 118, head: '2327dea2e2fcaef69691ab8e5618ced1eb6db2a6' }], excludedUnits: [], directCommits: [], evidence: ['later actual ancestry'] } })
  const nextState = transitionState(state, { type: 'propose', candidate: nextCandidate })
  assert.equal(JSON.stringify(nextState.frozen), before)
  assert.equal(nextState.working.sourceCut.commit, NEXT)
  assert.equal(nextState.frozen.candidate.membership.excludedUnits[0].number, 118)
  assert.throws(() => transitionState(nextState, { type: 'freeze', candidateId: 'next' }), /one frozen/)
})

test('partial coverage, unknown membership, empty scope closure and mismatched draft receipt cannot freeze', () => {
  for (const overrides of [
    { coverage: { status: 'partial', evidence: ['one unresolved export'] } },
    { membership: { status: 'unknown' } },
    { contentReview: { ...candidate().contentReview, scope: [] } },
    { contentReview: { ...candidate().contentReview, closed: false } },
    { draftValidation: { ...candidate().draftValidation, docsHead: NEXT } },
    { approval: { ...candidate().approval, status: 'stale' } },
    { approval: { ...candidate().approval, sourceTree: sha('1') } }
  ]) {
    const value = candidate('blocked', overrides)
    assert.equal(assessReadiness(value).canFreeze, false)
    assert.throws(() => freeze(createPreparationState(), value), /cannot freeze/)
  }
})

test('partial or dismissed evidence cannot advance accepted D, even if state JSON was edited after freezing', () => {
  const state = published(freeze(createPreparationState()))
  for (const dimension of ['coverage', 'membership', 'approval', 'observation', 'contentReview', 'draftValidation']) {
    const partial = structuredClone(state)
    partial.frozen.candidate[dimension].status = dimension === 'approval' ? 'stale' : 'partial'
    assert.throws(() => transitionState(partial, { type: 'accept', candidateId: 'beta21', receipt: receipt(partial.frozen.candidate) }), /cannot advance accepted D/)
    assert.equal(partial.acceptedD, null)
  }
})

test('only actual artifact binding, verified application and exact remote acceptance readback advance D', () => {
  const state = freeze(createPreparationState())
  assert.throws(() => transitionState(state, { type: 'accept', candidateId: 'beta21', receipt: receipt(state.frozen.candidate) }), /cannot advance accepted D/)
  const bound = published(state)
  assert.deepEqual(bound.frozen.candidate, state.frozen.candidate)
  assert.throws(() => transitionState(bound, { type: 'accept', candidateId: 'beta21', receipt: { ...receipt(bound.frozen.candidate), docsHead: NEXT } }), /remote develop merge evidence/)
  const accepted = transitionState(bound, { type: 'accept', candidateId: 'beta21', receipt: receipt(bound.frozen.candidate) })
  assert.equal(accepted.acceptedD.docsCommit, sha('f'))
  assert.equal(accepted.frozen, null)
  assert.equal(accepted.history.at(-1).disposition, 'accepted')
  assert.equal(state.acceptedD, null)
})

test('rejected draft retains drift, cannot auto-recreate, and deliberate new attempt can retry', () => {
  const proposed = transitionState(createPreparationState(), { type: 'propose', candidate: candidate() })
  const rejected = transitionState(proposed, { type: 'reject', candidateId: 'beta21', actor: 'owner', reason: 'withdrawn after material review question' })
  assert.equal(rejected.acceptedD, null)
  assert.equal(rejected.rejections[0].sourceCommit, SOURCE)
  assert.equal(rejected.working, null)
  assert.throws(() => transitionState(rejected, { type: 'propose', candidate: candidate('retry') }), /owner-selected retry/)
  const retried = transitionState(rejected, { type: 'propose', candidate: candidate('retry'), retryOf: 'beta21', selectedBy: 'owner' })
  assert.equal(retried.working.id, 'retry')
  assert.equal(retried.rejections.length, 1)
})

test('candidate IDs, input schema and context digest fail closed on inconsistent input', () => {
  const state = transitionState(createPreparationState(), { type: 'propose', candidate: candidate() })
  assert.throws(() => transitionState(state, { type: 'propose', candidate: candidate('beta21', { sourceCut: { ...sourceCut, commit: NEXT } }) }), /IDs are immutable/)
  assert.throws(() => transitionState({ ...state, schemaVersion: 2 }, { type: 'accept' }), /Unsupported preparation/)
  const altered = structuredClone(state)
  altered.working.dependencyContext.extra = 'different resolution'
  assert.throws(() => transitionState(altered, { type: 'freeze' }), /context digest mismatch/)
  assert.throws(() => createCandidate({ id: 'projection', packageName: '@tetherto/wdk-wallet-evm', sourceCut: { ...sourceCut, kind: 'projected' }, docsBase: { commit: DOCS } }), /actual source cut/)
})

test('changed release handoff and mismatched publication cannot relabel a frozen candidate', () => {
  const value = candidate()
  const state = transitionState(createPreparationState(), { type: 'propose', candidate: value })
  assert.throws(() => transitionState(state, { type: 'freeze', candidateId: 'beta21', releaseHandoff: { confirmed: true, owner: 'owner', sourceCommit: NEXT, sourceTree: TREE, evidence: ['different cut'] } }), /exact intended cut/)
  const frozen = freeze(createPreparationState())
  const binding = candidateBinding(frozen.frozen.candidate)
  assert.throws(() => transitionState(frozen, { type: 'bind-publication', candidateId: 'beta21', publication: { ...binding, sourceCommit: NEXT, status: 'bound', artifactVerified: true } }), /match the exact candidate/)
})

test('edited input state cannot detach the exact frozen handoff or replace archived immutable candidates', () => {
  const frozen = freeze(createPreparationState())
  const changedHandoff = structuredClone(frozen)
  changedHandoff.frozen.releaseHandoff.sourceCommit = NEXT
  assert.throws(() => transitionState(changedHandoff, { type: 'accept', candidateId: 'beta21' }), /handoff does not bind/)
  const rejected = transitionState(frozen, { type: 'reject', candidateId: 'beta21', actor: 'owner', reason: 'needs another review' })
  const changedHistory = structuredClone(rejected)
  changedHistory.history[0].candidate.schemaVersion = 2
  assert.throws(() => transitionState(changedHistory, { type: 'propose', candidate: candidate('retry'), retryOf: 'beta21', selectedBy: 'owner' }), /Unsupported candidate/)
})

test('candidate package identity prevents binding a Core artifact to a frozen EVM candidate', () => {
  const frozen = freeze(createPreparationState())
  const evm = frozen.frozen.candidate
  assert.equal(candidateBinding(evm).packageName, '@tetherto/wdk-wallet-evm')
  const copiedPublication = { ...candidateBinding(evm), status: 'bound', packageName: '@tetherto/wdk', version: '1.0.0-beta.21', registry: 'https://registry.npmjs.org', integrity: 'sha512-other-artifact', artifactVerified: true, contextVerified: true, materialDifferencesResolved: true, evidence: ['copied receipt with the wrong package'] }
  assert.throws(() => transitionState(frozen, { type: 'bind-publication', candidateId: evm.id, publication: copiedPublication }), /match the exact candidate/)
  assert.equal(assessReadiness(createCandidate({ ...evm, publication: copiedPublication })).publicationBound, false)
  const core = candidate('core-cut', { packageName: '@tetherto/wdk', sourceCut: { ...sourceCut, repository: 'tetherto/wdk' } })
  assert.equal(candidateBinding(core).packageName, '@tetherto/wdk')
  assert.equal(assessReadiness(core).canFreeze, true)
})

test('constructors reject absent package identities, placeholder versions and unsafe registry identities', () => {
  const input = candidate()
  assert.throws(() => createCandidate({ ...input, packageName: undefined }), /package identity/)
  for (const version of ['NEXT', 'latest', 'v1.2.3', '^1.2.3', '1.2', '01.2.3', '1.2.3-beta.01', '1.2.3 ', '1.2.3-']) {
    assert.throws(() => createCandidate({ ...input, publication: { status: 'pending', version } }), /exact semantic version/)
  }
  for (const registry of ['http://registry.npmjs.org', 'https://registry.npmjs.org.evil.example', 'https://token@registry.npmjs.org', 'https://registry.npmjs.org/package', 'https://registry.npmjs.org?token=value', 'not-a-url']) {
    assert.throws(() => createCandidate({ ...input, publication: { status: 'pending', registry } }), /HTTPS npm registry/)
  }
  for (const version of ['1.2.3', '1.0.0-beta.21', '1.2.3-0', '1.2.3-beta-1+build.01']) {
    assert.equal(createCandidate({ ...input, publication: { status: 'pending', version, registry: 'https://registry.npmjs.org/' } }).publication.version, version)
  }
})
