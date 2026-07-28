---
name: wdk-community-module-docs
description: Author, review, test, or update source-grounded WDK module documentation for external partners and community maintainers. Use for wallet, gasless/gasfree, swidge, swap, bridge, lending, fiat, pricing/data, provider-suite, catalog, release-state, sidebar, changelog, API-reference, snippet-safety, docs-PR, or isolated regeneration work where current WDK IA, package truth, public wording, and adversarial validation must be enforced. Do not use for unrelated marketing, design-system, or general site copy.
---

# WDK Community Module Docs
Use this skill to create or review WDK module docs that external partners can ship
without drifting from current docs IA, style, safety rules, or API truth.
Resolve the repo root with `git rev-parse --show-toplevel` and work from it. When
`contributing/wdk-community-module-docs/COMMUNITY_MODULE_DOCUMENTATION_GUIDE.md`
exists, load its shared evidence, classification, IA, safety, compatibility, and
validation sections plus only relevant family/template sections. Load
`contributing/wdk-community-module-docs/README.md` only in test-mode. If guides
are absent, use this standalone kernel and report the degraded contract. When installed, run
`node skills/wdk-community-module-docs/scripts/validate-artifacts.mjs --skill-only`.

## Required Starting Checks

1. Confirm whether the task is read-only review, edit mode, or disposable
   test-mode.
2. Run `git status --short --branch`.
3. For edit-mode/current-PR work, resolve a maintainer-approved remote and base.
   Use `upstream/develop` only when configured and confirmed; never guess a
   missing remote/base. Use a clean worktree when dirty. For read-only artifact
   review, do not mutate refs or build output unless asked.
4. Inspect current repo surfaces, not stale memory: `content/docs/sdk/**`,
   `src/lib/custom-tree.ts`, aggregate/community indexes, wallet chooser page and
   component when applicable, `skills/wdk/**`, `source.config.ts`,
   `src/lib/source.ts`, and validation scripts.
5. Inspect relevant open PRs with `gh pr list --repo <approved-owner/repo>` and
   `gh pr view --repo <approved-owner/repo>`; use them as in-flight evidence, not
   merged truth. If repo identity, CLI, auth, or network is unavailable, report
   blocked evidence rather than guessing. Test-mode overrides this step.

Honor explicit user mode and publication limits over workflow defaults. In
read-only mode, do not edit, fetch, install dependencies, or generate build
output unless current external truth is explicitly required. In edit mode, do
not stage, commit, push, or open a PR unless the user explicitly requests that
specific action.

In disposable test-mode, stay inside the supplied isolated root. Never recover
deleted target docs from history, caches, other worktrees, prior output, memory,
chat summaries, or review notes; any access invalidates the fixture. Record
candidate hashes, make no Git publication action, and separate reusable defects
from provider facts. Only a closed generation role's independent evaluator may
compare with original docs.

Before generation, require the guarded operator preflight: one recorded base SHA,
pairwise-disjoint roots, no `.git` metadata, target removal, no dependencies,
symlinks, or generated prose mirrors, external typed/hash manifests, exact output
policy, and heading-only compatibility input.
Do not inspect target-doc PR/history or run base comparison. Use declared scratch
only for consumer checks and current-MDX validation; archive transcripts outside,
remove scratch, freeze all output, then close the role. `CLASSIFICATION_ONLY`,
`CATALOG_ONLY`, and `NO_APPROVED_ROUTE` are distinct policies; only the last has
an empty approved output and predetermined no-route decision.

## Source And Release Truth
Before writing public package text, classify release state as `released`, `placeholder`,
`unpublished`, `deprecated`, `source PR only`, `renaming/in-flight`, or `unverified/blocked`.

Classify documentation readiness separately as `runnable`, `reference-only`, or `draft-only`. `Runnable` is language/symbol/flow scoped: require an exact graph,
entry point/declarations, peers, and secret-free checks of every executable fence, including creation/interoperability. Prove a public install command from an empty
disposable consumer; a pre-provisioned graph proves only that graph. Freeze transcript, lockfile, graph, tarball, and transitive evidence hashes. Never run community
code in a credential-bearing host. Failure makes affected paths `reference-only`: use labeled `text` for runtime/setup fences and exact non-runnable declarations
only. Other paths need independent evidence; missing/conflicting release or entry-point evidence is `draft-only`.
Use npm with explicit registry overrides when scoped registry config can hide
public npm state:

```bash
PACKAGE='<EXACT_PACKAGE_NAME>'; VERSION='<EXACT_VERSION>'
REGISTRY_ARGS=(--registry=https://registry.npmjs.org)
# For scoped packages, append '--@scope:registry=https://registry.npmjs.org'.
npm view "$PACKAGE" name version deprecated repository.url engines peerDependencies --json "${REGISTRY_ARGS[@]}"
npm view "$PACKAGE" dist-tags versions time --json "${REGISTRY_ARGS[@]}"
npm pack "$PACKAGE@$VERSION" --dry-run --json "${REGISTRY_ARGS[@]}"
```

Replace `@scope` with the exact scope and use its override on every `view` and
`pack` command; `--registry` alone may not override local scoped registry config.

Verify claims against package source, generated types, README, tests, examples,
release notes, npm metadata, and official provider docs. Do not assume community
modules are under `@tetherto/*`. For prereleases, inspect dist-tags and the
target version instead of trusting `npm view <package> version` alone. Pin exact
prerelease versions. Keep stable install commands unpinned unless verified
compatibility requires a fixed version. Never substitute a moving prerelease
dist-tag for the selected version. If the published tarball lacks entry points
or type declarations, keep install/API docs draft-only.

For released APIs, use exact tarball entry points for reachability, declarations
for compile-time shape, published JavaScript and version-matched tests/source for
runtime behavior, and provider docs for provider-owned live facts. A same-version
mismatch blocks the affected claim; narrow it only under the scoped evidence
above. Never blend source `HEAD`, a prerelease tarball, and a stable README.

Treat authoritative registry absence differently from failed evidence. A 401,
403, timeout, DNS failure, private-registry response, missing CLI, or unavailable
authentication does not prove a package is unpublished. Classify it as
`unverified/blocked`, record the exact failed check, make no release or install
claim, and ask for maintainer evidence.

Before editing `api-reference.mdx`, determine whether the current module is
generator-owned from the current generator implementation/configuration and file
history. Update supported generator inputs for generated pages. Hand-author only
manually maintained references. If ownership is unresolved, quarantine that API
page, continue independently verifiable non-reference pages when IA remains
coherent, mark the result incomplete and not PR-ready, and ask a maintainer. Stop
the whole task only when the missing page breaks the route contract or a complete
deliverable was explicitly required. An output allowlist grants write permission,
not page necessity, ownership, IA approval, or source evidence.

## IA Selection

Choose ownership, family, page depth, route, and sidebar separately. Preserve an
existing slug; a new slug requires explicit approval.

- WDK-maintained wallets use `wallet-modules`; independently maintained wallets
  use an approved `community-modules` route regardless of page depth unless
  maintainers explicitly promote another canonical path.
- Swidge, swap, bridge, lending, fiat, and pricing/data providers use their
  functional folders regardless of ownership; community packages are cross-listed.
- Same-family suites stay in that family with an explicit package-role map.
  Multi-family/new-family suites need approved canonical mapping before files.
- Catalog-only integrations edit approved catalogs/aggregates only: no local
  module route or sidebar node.

Update `src/lib/custom-tree.ts` only when the page should render in the sidebar.
For files under `contributing/wdk-community-module-docs/` or skill artifacts, do
not touch the tree.

Every independently maintained page opens with purpose/ownership and any short
source attribution, then uses the current singular responsibility callout.
Community and affected functional/aggregate listings use one plural callout
before their rows; compact chooser/card entries label `Community` and link to
the overview. Changelogs/incidental links do not repeat it.

Classify an unfamiliar module on independent axes before selecting a family:

- Authority/custody: local secrets, supplied signer, remote custodian,
  MPC/multisig participants, or none.
- Account ownership: managed lifecycle, caller-owned, remote, or accountless.
- Operations: read, discover, prepare payload, sign, write, status, and recovery.
- Settlement: none/not applicable, synchronous, receipt-based, asynchronous,
  cancellable, partial, resumable, or operator-intervened; HTTP is not settlement.
- Trust boundaries and decision authority: RPC, provider payload, solver,
  webhook, indexer/catalog/policy feed, custodian, paymaster, and user input.
- Package topology and reader journeys: single package, genuinely shared suite,
  or packages spanning different functional families.

Choose wallet only for a managed account lifecycle and account-centric reads,
signing, writes, or recovery; signing-only, custodial, MPC, policy, routing, and
accountless adapters are disqualifying without a new contract. Choose Swidge only
for its actual shared discovery/non-binding-quote plus source-backed execute or
status contract; otherwise prefer an established swap-only or bridge-only
interface by the primary settlement task. Lending requires a market/vault/
position/debt lifecycle; fiat requires a fiat quote/handoff/reconciliation
journey; pricing/tooling is accountless non-custodial read/discovery with no
package write. Authority/custody changes safety and depth, not functional family.
For independent multi-capability journeys, map each functional destination or
stop for multi/new-family IA approval. Suites follow their packages' functional
families. Any disqualifying axis means no route/navigation; report capability,
authority, lifecycle, risk, path options, and maintainer questions.

## Page Set Selection

Use the smallest complete page set:

- Full wallet or provider release docs: `index.mdx`, `usage.mdx`,
  `configuration.mdx`, `api-reference.mdx`, plus guides for broad workflows.
- Compact community wallet exception: `index.mdx` and `api-reference.mdx` only
  for a narrow surface with no secrets, writes, or async recovery; the overview
  contains requirements, install, minimal first read, limitations, and cleanup.
- Community wallet with secrets, signing, writes, or recovery: use the standard
  wallet pages and risk-driven task, cleanup, recovery, and error guides.
- Swidge provider: overview, usage, configuration, API reference, and guides for
  quote/execute, state/recovery, or errors when behavior is complex.
- Provider suite: one suite overview only if each package is mapped to source
  chain, peer wallet, peer dependencies, source path, install package, methods,
  limitations, and its own anchored first-use/read path. Split child pages when
  prerequisites, peers, trust boundaries, confirmation, or recovery differ.
- Pricing/read-only provider: overview, usage, configuration, and API reference
  when credentials, mapping, data freshness, or errors matter; compact modules
  may combine usage into overview.
- Catalog-only integration: verified catalog row and public destination; no
  empty local page set.
- New-family candidate: derive page depth from risk and journey complexity only
  after maintainer IA approval.

Before drafting, record canonical family/path, sidebar/index/cross-list effects,
redirects, and a source-derived phase ledger: discover, quote/requirements,
prepare/reserve/build, persist, inspect, confirm, authorize/sign, execute or hand
off, track, reconcile, recover, and clean up when present. Record page mode and
split rationale. Split
guides when there are multiple independent write flows, long requirement
sequences, status/recovery workflows, or account/chain variants with different
safety rules. A complete-flow usage page may not contain multiple independent
writes or combine a write with a separate status/recovery loop. Group methods in
one operations guide only when prerequisites, review fields, completion
evidence, and recovery are shared. Otherwise split. Do not add empty pages or
hide routable pages from the sidebar. If a required tree or index edit is outside
the permitted scope, consolidate the journey into an already listed page or stop
for scope approval; never create an unlisted guide and defer its navigation fix.

Use a usage hub when focused guides exist: summarize prerequisites, setup,
workflow order, safety, limitations, and links without duplicating every task.
Use a complete-flow usage page only when the module has no split guides.

## Standalone Page Kernel

When the repo manual is unavailable, retain this minimum contract:

- New rendered pages require frontmatter `title`, concrete `description`,
  `docType`, and `schemaType`. API references normally use `APIReference`, but
  preserve a verified nearby `TechArticle` convention when that route requires
  it. The layout renders the title, so do not add a duplicate body H1.
- Standard overview order is purpose/attribution, responsibility callout, when
  to use, requirements, capabilities, limitations, and next steps. Compact mode
  inserts verified install and minimal first read and links only applicable
  destinations.
- Usage is either a hub linking focused guides or one complete flow, never both.
  Configuration covers fields/defaults/units/security; API reference covers only
  public exports, signatures, options, returns, errors, statuses, and limits.
- Every page works as a direct entry and links to applicable prerequisite, next task, configuration/API detail, and error/recovery destinations. Every promoted
  integration needs its own verified install/import/construct/use path or a narrower promise; retain specific provisioning/support/source links.
- Preserve existing routes and every baseline fragment beside the same semantic
  symbol or concept. Lexical anchor existence is insufficient.
- For MDX tables, escape literal pipes as `\|`, put type expressions in backticks,
  and move raw generics, object shapes, JSX, and multiline declarations out of
  cells. Use balanced current `<Cards>`/`<Card>` syntax and let the build decide
  parser validity.
- A JavaScript/TypeScript fence must be syntactically valid code or declarations.
  Partial control flow, signature notation, and pseudocode use labeled `text`.
- Source-only or unverified packages get no released install claim. Unknown
  authority/custody models get no invented family or route.

## Wallet Contract

- Standard and high-risk wallets need overview, usage, configuration, API,
  getting started, accounts, balances, supported sends/transfers, errors, and
  cleanup. Add signing, history, backup, recovery, or chain workflows when
  exposed.
- Gasless/gasfree wallets also need the source-backed sponsorship, coordinator,
  or fee-payer model and distinct payer/owner roles. Include service/paymaster
  configuration, fee assets, balances, units, caps, and enforcement order only
  when the public surface exposes them; verify exact quote, signing, and send
  behavior.
- Smart accounts also need owner/account roles and source-backed coordination,
  validation, fee sponsorship, deployment/delegation, batching, receipts,
  replay/recovery, and concurrency. Bundler/paymaster/EntryPoint are EVM examples.
- Disclose inherited methods that throw in overview/API/error guidance. Add a
  dedicated negative task page only when an expected journey or documented
  alternative justifies it.
- Preserve current variant labels and grouping from `custom-tree.ts`; verify
  chain-specific derivation, fee payer, endpoint, token, signer, delegation,
  initialization, and cleanup behavior from source.

## Drafting Rules

- Apply the explicit per-page/listing responsibility placement contract above;
  an open PR does not change canonical wording or placement.
- Lead with what the reader can do, then prerequisites, then safe usage.
- Keep provider route support tied to runtime discovery or official provider docs.
- Put provider-owned operational limits that change the default setup at first
  use, not only behind an external link or late limitations section. Prefer a
  canonical final HTTPS destination over a known redirect on changed lines.
- Document unsupported inherited methods, especially gasless/gasfree variants.
- Derive operation phases from source. Do not invent a quote/requirements helper;
  document prepare/build/reserve, persistence, exact-payload inspection, user
  confirmation, authorization, execution/handoff, tracking, and recovery where present.
- State whether preview quotes or requirements are binding. If execution
  prepares a fresh route, quote, or requirement set, say the preview is
  non-binding and document the final result fields to persist or show.
- For Swidge, always describe `SwidgeQuote` as non-binding and persist the actual
  `SwidgeResult`; a provider-specific guarantee is supplemental only.
- For route providers, distinguish empty discovery, unsupported direction/pair, no liquidity/route, stale or changed routes, and provider unavailability. State
  whether to requote, select another pair/provider, wait, or stop. Inspect exact transitive cache/failover helpers: key collisions, null/error triggers, retries,
  and rotation scope are part of a promised integration.
- For stateful quote/write pairs, verify cache or match keys, TTL, one-shot
  consumption, nonce validation/reservation, concurrency, requote and retry
  triggers, final fee source, and signing/broadcast order when present.
- Treat provider-generated transactions, approvals, deposit instructions, and
  signing payloads as untrusted input. Document provider-controlled targets,
  spenders, calldata, values, addresses, memos, or PSBTs; structural and
  semantic checks; allowlist defaults; quote binding; and fields the application
  must verify before confirmation when applicable.
- Require explicit user confirmation language before examples that move funds,
  submit deposits, approve tokens, sign messages, borrow, repay, or generate
  provider actions.
- Keep API keys server-side when source/provider docs require it.
- Use exact imports, class names, config keys, option names, return fields, error names, status values, and units from source evidence. Verify whether each callable
  is a class requiring `new` or a factory, and clean-consumer check the exact published fence rather than one similar smoke example.
- Include every directly imported non-built-in package in install/prerequisite
  instructions. Include package `engines`, peer dependencies, account/wallet
  peers, and provider/env assumptions before the first runnable snippet.
- Do not publish that runnable snippet unless documentation readiness is
  `runnable`. Do not use forced install flags or dependency overrides as a public
  workaround without a maintainer-validated exact graph and isolated smoke path.
- Inspect regular dependencies too. If source uses `instanceof`, constructor identity, or another nominal account/wallet check, resolve the exact graph and compare
  actual constructors across approval, execution, receipt, and recovery. Matching names/types are insufficient; nested duplicate identities block affected flows.
- Verify operation behavior per method implementation. Do not apply a config or
  option to a method only because a shared type or README table suggests it.
- For fee caps, slippage, approvals, requirement helpers, status writes, and broadcasts, verify whether enforcement is pre-sign, pre/post-broadcast, quote-only,
  or absent. Separate requested, provider-reported, independently validated, and locally enforced values; a reported-amount cap does not validate an opaque debit.
- Tie approvals, permits, signatures, authorizations, and transaction
  requirements to the exact helper methods that return them.
- For `amount: "max"` or equivalent live-state writes, document live-state reads,
  approval targets, stale requirement risks, residual token behavior, and what
  slippage or fee caps actually protect.
- Status examples use source-mapped transitions/terminal states, timeout/backoff,
  sequence/version, poll/webhook/receipt precedence, finality, replacement, and
  reorg behavior; never invent or overinterpret labels. Trace throw/catch/result/
  wrap/raw-escape boundaries and retain an unknown-error branch unless closed.
- Distinguish submission, inclusion, chain execution, nested operation success,
  provider settlement, and application reconciliation. Preserve failed,
  timed-out, intervention-required, reversed, and indeterminate outcomes.
- For server-side signing/authorization, accept an authorized application intent
  identifier, load server-owned fields, allowlist the provider payload, and
  enforce authorization and rate limits. Never sign a caller-supplied URL/payload.
- Source-verify idempotency-key generation, scope, immutable intent binding, TTL,
  concurrency, replay/conflict, and retry semantics; persist/reuse it per intent.
- For credentials, trace provider public-versus-secret classification, original key versus exchanged/cached/forwarded token, browser/server runtime, HTTPS
  origin/redirects, scope/expiry/rotation/redaction; never expose a secret.
- Separate deterministic parsing/type/import/offline controls from authorized live-provider checks. Fakes prove only local control flow, not provider support,
  credentials, availability, rates, routes, chain/token coverage, or settlement. Mark timeout, `429`, auth block, or outage blocked; claim a live pass only when the exact check passed.
- Before calling a webhook verified, trace its algorithm, key source/rotation,
  signed bytes, header/encoding, timestamp tolerance, replay defense, and failure
  behavior. Preserve raw bytes and handle duplicate/out-of-order delivery.
- Distinguish action metadata from the exact approval, permit, authorization, or
  typed-data payload the signer receives. Claim exact review only when public API
  exposes it; otherwise use a policy-wrapped signer or disable hidden signing.
- Transaction-signing examples review chain/domain, sender, recipient, asset,
  value, calldata/instructions, fees, nonce, expiry, replay scope, encoding, and
  downstream relay authority before confirmation. They need not broadcast.
- Message/typed-data signing examples review domain, human-readable intent,
  fields, expiry, nonce, audience, replay scope, signature encoding, and who may
  submit/use the result before confirmation.
- Executable snippets that create accounts/managers from secrets must verify
  disposal behavior. Where explicit seed cleanup matters, use caller-owned
  mutable bytes, dispose source-backed objects, and zero those bytes in
  `finally`; do not claim JavaScript strings can be wiped. Trace retained mutable
  config, read-once/per-call fields, rotation/recreation, manager caches, and
  whether disposal evicts entries. Otherwise label the snippet as a fragment.
- Keep pseudocode in a `text` fence, label it non-executable, and avoid plausible
  package names, imports, methods, or fields that could be mistaken for verified
  API. Otherwise readers will copy it.
- Treat every `js`, `javascript`, `ts`, `typescript`, `jsx`, or `tsx` fence as a
  syntax-valid, copyable contract. Use valid declarations for API signatures.
  Wrap runnable `return` paths in functions. Use `text` for incomplete fragments.
- Every executable financial write fence is independently safe: include every
  source-exposed preparation phase, review fields, confirmation, submission, and
  layered success. Signing-only fences use the signing contracts above instead
  of pretending to submit. Error/tracking examples consume an existing result.
- Never include secrets, seed phrases, private keys, real auth tokens, real user
  data, or internal validation breadcrumbs.
- Avoid unsupported adjectives and ownership/support claims.
- In catalogs/choosers, label release maturity, docs readiness, and runtime compatibility separately; never use ambiguous `Ready`. Reconcile every family
  aggregate that claims to enumerate modules with the rendered tree.
- Remove write boilerplate from read-only modules. Across any family, steering
  outputs require advisory/binding status, actor, reasons/unknowns, time bounds,
  fallback, revalidation, and downstream authority. Add policy/model version,
  review/override/appeal, audit/retention, and sensitive-data handling only when
  applicable; distinguish `not applicable` from relevant-but-opaque limitations.
- Verify PRs edit the current rendered docs tree. Legacy paths such as
  `SUMMARY.md` or root `sdk/**/*.md` do not update current rendered pages unless
  ported into `content/docs/**` and `src/lib/custom-tree.ts` where needed.
## Adversarial Review Gate

Before finalizing, run these passes:

1. Underclaiming: missing module family, page type, prerequisites, limitations,
   safety warning, source evidence, or sidebar/listing update.
2. Overclaiming: unsupported capability, unsupported chain/token, stale package
   version, unreleased package called released, private helper documented as
   public, or provider-owned support presented as WDK-owned.
3. API exactness: imports, methods, config keys, and compile-time shapes trace to
   public exports or declarations; runtime fields, semantics, errors, and statuses
   trace through exact-version implementation, dependencies, catch/wrap boundaries,
   and tests; every executable fence passes its exact consumer check.
4. Installability: release state and documentation readiness are separate; every
   runnable setup has clean install-command, graph, declaration, import, and smoke
   proof. Pre-provisioned graphs do not prove install commands.
5. Write-flow ordering: quotes, requirements, fee caps, slippage, approvals,
   status handling, and broadcasts are documented at the point source actually
   enforces them; every executable write fence is independently safe.
6. IA: URLs are stable, fragments retain the same semantic destination,
   `custom-tree.ts` placement matches current tree, wallet
   variants stay grouped correctly, and functional modules live in functional
   sections.
7. Security: no secrets; write flows preserve source-exposed preparation order,
   bind provider intent, show confirmation, and verify layered completion.
8. Render/link quality: frontmatter, lone-H1 policy, headings, GFM tables, MDX
   components, syntax-valid code fences, cards, anchors, and links follow repo
   conventions.
9. Future-fit: follow capability, authority, custody, settlement, trust boundary,
   topology, risk, and evidence, not names/page counts; test family archetypes and
   independent positive/trigger behavior controls; stop unknown families for IA approval.
10. Partner journey: every page works as a direct entry, prerequisites precede
   dependent steps, related pages provide the next action, and hub/task pages do
   not duplicate or strand workflows.

## Validation

For edit-mode tasks, always run:

```bash
git diff --check
git ls-files --others --exclude-standard -z -- '*.md' '*.mdx' |
while IFS= read -r -d '' file; do
  whitespace_errors="$(git diff --no-index --check /dev/null "$file" 2>&1 || true)"
  test -z "$whitespace_errors" || {
    printf '%s\n' "$whitespace_errors"
    exit 1
  }
done
```

The repo ignores nested `api-reference.mdx` paths. Every `--pr-ready` run requires
an external regular `--api-reference-policy=<absolute-file>` containing
`IN_SCOPE` (owned/validated), `NOT_APPLICABLE` (no API reference in task scope),
or `QUARANTINED` (unresolved and must fail). The validator cannot authenticate
ownership. New pages need real staged additions, not intent-to-add; force-add
only during requested PR staging.

When this skill package is present, validate it with:

```bash
node skills/wdk-community-module-docs/scripts/validate-artifacts.mjs
node skills/wdk-community-module-docs/scripts/validate-artifacts.mjs --self-test
```

Use `--skill-only` when guides are absent but skill plus validator are installed;
it may combine with policy-backed `--pr-ready` in a Git checkout. A lone
`SKILL.md` cannot claim validator success. Self-tests need locked dependencies.

During generation, run `--validate-mdx="$TARGET_DOCS_DIR"` only for `RENDERED`;
add `--exclude-api-reference` only when that page is explicitly quarantined.
For `CATALOG_ONLY`, run it once per exact allowlisted `content/docs/*.mdx` file.
For `CLASSIFICATION_ONLY` and `NO_APPROVED_ROUTE`, log that current MDX validation
is not applicable; never dereference the intentionally unset target.
After freezing generation, the evaluator runs the base comparison:
```bash
node skills/wdk-community-module-docs/scripts/validate-artifacts.mjs --docs-changed --base=HEAD
```

Both modes check frontmatter, H1s, exact same-page anchors, tables, fences,
markers, path types, and whitespace. Base mode checks lexical fragments and
rejects type changes. Deletions/renames need the manual's external
`--route-decisions` manifest; without it they fail closed. The manifest preserves
same-spelling URL hashes only and records, but does not authenticate, approval.

Use `--pr-ready --api-reference-policy=<absolute-file>` only after the task
includes explicit PR-readiness or staging work.

If docs-site content or navigation changed, run:

```bash
export LINK_CHECK_EXTERNAL=false
npm run check:meta
npm run check:redirects
LINK_CHECK_EXTERNAL=false npm run check:links
npm run build
npm run quality
```

Verify every new/changed external destination and final redirect in a browser or provider-appropriate
client. Keep deterministic/live lanes separate. Treat blocked automation as unverified, not dead; npm CLI evidence outranks bot-blocked web pages.

If a local build fails under a newer Node runtime because of repo runtime drift,
retry with Node `22.22.2` before treating the docs change as broken.

Do not claim validation passed unless the exact command passed. `check:meta`
validates `meta.json`, not MDX frontmatter; report its actual scope. For read-only
artifact review, report skipped edit-mode validation. In disposable test-mode,
generation runs no base comparison/site build; the closed role's independent
evaluator runs changed-MDX and site checks.

## Reporting

For review-only work, list findings first in severity order with file/line
evidence, impact, and remediation. Say explicitly when no findings remain and
name skipped validation or residual test gaps.

For edit and test work, final reports must include:

- Files changed.
- Source surfaces used.
- Source lock, release state, readiness ledger by language/entry point/symbol or
  flow, IA/page-set decision, confidence, and blocked claims.
- Exact validation commands and results.
- Remaining risks and assumptions.
- Maintainer questions, especially package release state, placement, provider
  support, or source/API uncertainty.
- Base, history-free generation, and clean evaluation roots; candidate hashes;
  families; verdict; isolation grade; manifest/allowlist/transcript locations;
  reusable gaps; package defects; and provider observations in test-mode. Keep
  those categories separate.
- Confirmation that files remain unstaged and no commit, push, or PR occurred
  unless the user explicitly requested one of those actions.
