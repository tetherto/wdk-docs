# API-reference preparation pilot

The docs repository owns this tool. It inspects frozen package inputs, creates scratch source/declaration evidence and stock Markdown, observes source approval facts, and records cumulative/frozen/next candidates. Authored pages remain under normal review. Module repositories need no configuration changes.

Use Node **22.x, at least 22.13** and the root locked dependencies:

```sh
npm ci
npm run api-reference -- capabilities
npm run test:api-reference
```

The root pins TypeDoc and its Markdown plugin. `capabilities` includes the tool source digest, lockfile digest and actual tool versions. A receipt describes mechanical inspection; it does not establish source approval, content acceptance, GitHub approval, merge permission or deployment.

## Inspect frozen inputs

Create an explicit input descriptor outside the docs checkout:

```json
{
  "schemaVersion": 1,
  "module": "core",
  "packageRoot": "/absolute/path/to/acquired/package",
  "input": { "kind": "released-artifact", "version": "1.0.0-beta.19" },
  "dependencies": []
}
```

This is a descriptor example, not a command that acquires or verifies that release. Use the actual exact version and acquired dependency closure. A source preview instead declares `kind: "source-preview"`, the registered `repository`, and exact 40-character `commit` and `tree` identities. Source preview and released artifact remain different input kinds even if package.json retains the old version.

Each dependency declares `{ "name": "package-name", "root": "/acquired/root" }`. For physical nested copies also provide its explicit `lockPath`, for example `node_modules/ethers/node_modules/@noble/hashes`. Preserve the actual source-lock or installed context and importer edges; do not replace it with unrelated nearby dependencies. Duplicate names without distinct explicit paths are rejected.

Optional `expectedSnapshot` is the SHA-256 returned by `snapshot(packageRoot)` in `io.mjs`. It seals the acquired file manifest, excluding `.git` and `node_modules`. This seal cannot prove where those bytes came from. Retain separate acquisition evidence for source/tree mapping, registry identity, actual tarball integrity and packed-file correspondence.

```sh
npm run api-reference -- inspect --bundle /absolute/path/input.json --out /absolute/path/new-run
npm run api-reference -- inspect --bundle /absolute/path/next-input.json --baseline /absolute/path/previous-run/receipt.json --out /absolute/path/next-run
```

The output parent must already exist. Every run directory is exclusively created outside the docs checkout and acquired inputs. Existing directories are never overwritten. Inputs are copied into byte-verified frozen files before analysis; the worker receives no filesystem access to their originals, HOME, credentials, NODE_OPTIONS or package configuration. Node permissions are an additional guard for trusted tooling, not a sandbox for malicious executable code.

Package scripts, SDK imports, upstream configs and plugins are never executed. Only the pinned Markdown plugin runs. The restricted TypeScript host reads frozen declared inputs and trusted compiler libraries. Comment include/document directives block conversion; local comment file/media links are refused. Stock Markdown is untrusted scratch text and must not become executable MDX or a public page automatically.

Outputs include:

- `receipt.json`: input/file identities, exact dependency versions, authored-page preimage, tool identity and explicit readiness gaps.
- `analysis-output/inventory.json`: independent export/member accounting, source and declaration lanes, full reflection artifacts, resolver edges and diagnostics.
- `analysis-output/*.candidate/`: stock Markdown candidates; signatures and comments remain evidence, not behavioral acceptance.
- `authored-before.md` and `review-packet.md`: before/evidence context for focused human reconciliation.
- `failure.json`: a failed run. Failed output is never a successful baseline.

`complete`, `partial` and `blocked` describe the bounded mechanical scope. Unsupported export forms, unresolved dependencies, compiler/source/type conflicts, self-alias rendering gaps, missing overloads or empty output cannot silently become complete. Byte changes with identical signatures still require behavior review. The initial profiles support Core/EVM ESM import conditions; they do not claim all conditional exports, percent-encoded export targets, typesVersions, dynamic CommonJS or every namespace form.

## Observe source changes

```sh
npm run api-reference -- observe --module evm --published-baseline /absolute/path/published-source-map.json --out /absolute/path/new-observation
```

The registered Core/EVM default is the repository's current required-review decision. The observer obtains current branch rules, exact PR head/base, complete reviews and GitHub's current decision, then rechecks them. This profile requires effective stale-review dismissal: retained older reviews plus an unrelated new-head approval cannot establish authorized approval of that revision. Missing or changing policy, unsupported requirements, dismissed approvals and source changes remain explicit. An optional `--review-policy` file can select an explicit authorized reviewer roster and quorum instead.

`published-source-map.json` declares `{ "sourceCommit": "<exact SHA>", "sourceMapping": { "status": "verified", "evidence": ["actual acquisition/correspondence receipt"] } }`. A supplied SHA alone (`--baseline-commit`) does not verify publication correspondence. Missing mapping still permits useful approved units while aggregate membership remains incomplete.

Every PR-list and ancestry page is traversed. With verified ancestry, detailed review queries focus on open PRs and actual changed merged units; historical summaries remain accounted for. Unknown policy avoids pointless review queries. The observer reports auth/access/rate/request-budget failures as incomplete, never an empty successful queue. The default budget is 250 GitHub command processes; actual pages are counted separately. This is not a qualified schedule or freshness SLA.

## Candidate state and review

`candidate.mjs` exports `createCandidate`, `candidateBinding`, `createPreparationState`, `transitionState` and `assessReadiness`. Candidates require immutable package identity, source commit/tree and docs base. `candidateBinding` supplies package name, candidate ID, source identity, exact docs head/base and dependency-context digest for receipts. A frozen epoch cannot be overwritten by next-working changes.

```sh
npm run api-reference -- epoch --state /absolute/path/state.json --event /absolute/path/event.json --out /absolute/path/new-state
```

The functions and their tests show the v1 receipt shape. Human impact closure, exact draft validation, release-owner handoff, actual publication/application and verified remote acceptance are separate gates. Local JSON booleans/evidence strings are operator attestations, not independent proof. Back them with actual checks and remote readback. These functions do not perform or authorize external writes.

For the pilot, Maharshi reviews the prepared docs draft first and routes it to a team reviewer afterward. Keep unpublished docs draft until actual publication checks pass. Separate already-published catch-up from future work; an approved open PR is preparation scope, not release inclusion. Final version edits may require renewed native GitHub approval.

## Validation and rollout boundary

Run `npm run quality` locally with Node 22 against the exact docs head/base and record the input cuts, dependency context, checks and generated outputs. The existing normal CI job skips drafts. This pilot does not change its credential-bearing installer or claim a shared draft-validation lane passed. Keep source-only previews labeled and out of production promotion until exact artifacts and review gates are satisfied.

Continuous observation, independent watcher health, safe shared CI, reviewer capacity and publication reconciliation need operational qualification before claiming the whole process is complete. Rollback is to stop using the inspector/observer; authored docs and accepted release state remain unchanged. No command commits, pushes, merges or creates pull requests.
