# WDK Community Module Documentation Guide

This guide is the authoring contract for WDK module documentation created by
external partners or maintainers. Use it before writing or reviewing module
docs for wallet, swidge, swap, bridge, lending, fiat, pricing, and community
provider modules.

The goal is uniform public docs that match the current WDK information
architecture, page structure, safety model, source accuracy bar, snippet
discipline, and public-language constraints.

This file is a repository contributor artifact, not a rendered docs page. Keep
it under `contributing/wdk-community-module-docs/`, outside `content/docs/**`,
and do not add it to `src/lib/custom-tree.ts`.

## Contents

- [Before You Start](#before-you-start)
- [Human Authoring Workflow](#human-authoring-workflow)
- [Non-Negotiables](#non-negotiables)
- [Current Source Surfaces](#current-source-surfaces)
- [IA Orientation Matrix](#ia-orientation-matrix)
- [Release-State Classification](#release-state-classification)
- [Evidence and Source Precedence](#evidence-and-source-precedence)
- [Future Module Classification](#future-module-classification)
- [Page Set Matrix](#page-set-matrix)
- [Frontmatter Rules](#frontmatter-rules)
- [Overview Page Template](#overview-page-template)
- [Usage Page Rules](#usage-page-rules)
- [Configuration Page Rules](#configuration-page-rules)
- [API Reference Rules](#api-reference-rules)
- [Wallet Module Rules](#wallet-module-rules)
- [Protocol and Provider Rules](#protocol-and-provider-rules)
- [IA and Navigation Rules](#ia-and-navigation-rules)
- [External Link Rules](#external-link-rules)
- [Public Language Rules](#public-language-rules)
- [MDX and Compatibility Rules](#mdx-and-compatibility-rules)
- [Snippet Review Checklist](#snippet-review-checklist)
- [Validation](#validation)
- [PR Readiness Checklist](#pr-readiness-checklist)
- [Maintainer Questions To Resolve](#maintainer-questions-to-resolve)
- [Authoring Templates](#authoring-templates)
- [Adversarial Test Acceptance](#adversarial-test-acceptance)

## Before You Start

Work in a WDK docs checkout with:

- Git and the repository's maintainer-approved canonical remote.
- Node.js 22 or newer and npm. Use Node `22.22.2` for the documented fallback.
- GitHub CLI authentication when open-PR inspection is required.
- A GitHub package-read token for docs-site dependency installation, as required
  by the root `.npmrc`. Keep it outside the worktree in an approved credential
  store; never put it in docs, logs, shell history, or a file later exposed to
  dependency code.
- Public registry access, or maintainer-provided package evidence, for release
  verification.

Check the environment before source work:

```bash
git remote -v
node --version
npm --version
gh auth status
```

If no `upstream` remote exists, do not guess its URL. Ask for the canonical
remote or use a maintainer-provided base ref. If `gh`, registry, package-token,
or network access is unavailable, report the exact blocked check; do not turn an
access failure into an absence or release-state claim.

Install site dependencies only when edit-mode validation needs them. Do not
source `.env.local` or export its contents into a dependency-install shell. The
root project `.npmrc` consumes `GITHUB_TOKEN`, so pass only that token to one
scripts-disabled npm command in an otherwise allowlisted environment. Use a
token-only file outside the worktree and an isolated temporary home:

```bash
(
  set -euo pipefail
  TOKEN_FILE='<ABSOLUTE_TOKEN_ONLY_FILE_OUTSIDE_THE_WORKTREE>'
  case "$TOKEN_FILE" in /*) ;; *) exit 64 ;; esac
  test -f "$TOKEN_FILE" && test ! -L "$TOKEN_FILE"
  WDK_DOCS_ROOT="$(cd "$(git rev-parse --show-toplevel)" && pwd -P)"
  TOKEN_FILE="$(cd "$(dirname "$TOKEN_FILE")" && pwd -P)/$(basename "$TOKEN_FILE")"
  case "$TOKEN_FILE" in "$WDK_DOCS_ROOT"|"$WDK_DOCS_ROOT"/*) exit 64 ;; esac
  HOME_ROOT="$(cd "$HOME" && pwd -P)"
  TMP_ROOT="$(cd "${TMPDIR:-/tmp}" && pwd -P)"
  SAFE_HOME=''
  SAFE_SENTINEL=''
  cleanup_install() {
    rc=$?
    trap - EXIT HUP INT TERM
    unset PACKAGE_TOKEN
    if test -n "$SAFE_HOME"; then
      if test -n "$SAFE_SENTINEL" && test -f "$SAFE_SENTINEL" && \
        test "$(cat "$SAFE_SENTINEL")" = "$SAFE_HOME"; then
        rm -rf -- "$SAFE_HOME"
      else
        printf 'refusing unsafe install-home cleanup: %s\n' "$SAFE_HOME" >&2
        rc=1
      fi
    fi
    exit "$rc"
  }
  trap cleanup_install EXIT
  trap 'exit 129' HUP
  trap 'exit 130' INT
  trap 'exit 143' TERM
  SAFE_HOME="$(mktemp -d "$TMP_ROOT/wdk-npm-home.XXXXXX")"
  SAFE_HOME="$(cd "$SAFE_HOME" && pwd -P)"
  case "$SAFE_HOME" in /|"$HOME_ROOT"|"$WDK_DOCS_ROOT"|"$WDK_DOCS_ROOT"/*) exit 64 ;; esac
  SAFE_SENTINEL="$SAFE_HOME/.wdk-npm-home"
  printf '%s\n' "$SAFE_HOME" > "$SAFE_SENTINEL"
  IFS= read -r PACKAGE_TOKEN < "$TOKEN_FILE"
  test -n "$PACKAGE_TOKEN"
  env -i HOME="$SAFE_HOME" PATH="$PATH" GITHUB_TOKEN="$PACKAGE_TOKEN" \
    npm ci --ignore-scripts
  unset PACKAGE_TOKEN
)
```

Inspect the root lifecycle scripts and lockfile before running the exact required
postinstall step. Run it only after the token process and temporary home are gone, in a disposable
container/VM that exposes only the clean worktree, an isolated home, an
allowlisted secret-free environment, and no network unless the audited script
requires an explicitly allowlisted destination. Keep credential-bearing `.env*`
files and the token source unmounted. If that isolation is unavailable, report
dependency setup blocked; do not enable scripts while a package token or other
host credential is reachable.

Do not install dependencies, fetch refs, or generate output for a read-only
artifact review unless the review explicitly requires current external truth.

## Human Authoring Workflow

1. Confirm review-only, edit, or disposable test mode and publication limits.
2. Inspect worktree status and refresh the approved base only when the mode
   permits it. Use a clean worktree for edits when the checkout is dirty.
3. Inspect current rendered docs, `custom-tree.ts`, functional indexes, the
   aggregate feed, collection configuration, validation scripts, and relevant
   open PRs.
4. Identify the exact package/source version and build a private claim ledger
   from exports, declarations, implementation, tests, examples, metadata, and
   useful official provider sources.
5. Classify release state. Stop public release/install claims when evidence is
   conflicting or blocked.
6. Classify authority, custody, account ownership, operation surface,
   settlement, trust boundaries, package topology, and reader journeys. Choose
   a family only when those axes satisfy its contract; otherwise stop for IA
   approval.
7. Record release state and documentation readiness separately. A published
   package is not automatically ready for a runnable quickstart.
8. Write an IA/page-set decision, a flow inventory, and a baseline
   route-and-fragment compatibility ledger before rewriting existing pages.
9. Plan frontmatter, section order, page-to-page links, sidebar/listing updates,
   prerequisites, limitations, safety, and cleanup before drafting snippets.
10. Draft from evidence. Keep pseudocode non-executable and verify every runnable
   import, field, return, error, status, amount unit, and write-order claim.
11. Run the underclaiming, overclaiming, API, write-order, IA, security, render,
   partner-journey, and future-fit reviews.
12. Run required validation, distinguish command failures from environment
    blockers, and report only exact commands that passed.
13. Handoff files, sources, results, risks, assumptions, and maintainer questions.
    Do not stage, commit, push, or open a PR unless explicitly requested.

## Non-Negotiables

- Start from current repository truth, not stale plans or old PR bodies.
- Treat `src/lib/custom-tree.ts` as the rendered sidebar source of truth.
- Do not claim a package is released until the exact package name and version
  are verified from npm or another maintainer-approved release surface.
- Do not present a runnable install or quickstart until a clean consumer project
  resolves the documented dependency graph and the selected entry points,
  declarations, imports, and minimal construction path pass the secret-free
  isolated runtime gate. A released package with an unresolved graph remains
  reference-only for setup purposes.
- Pin prerelease packages to the exact verified prerelease version. For stable
  packages, follow the current docs convention and omit a version unless a
  source-backed compatibility constraint requires an exact pin. Do not use a
  moving prerelease dist-tag in public install commands.
- Do not assume community packages use the `@tetherto` scope.
- Do not claim supported chains, tokens, providers, production readiness,
  deprecation, or API behavior unless source evidence proves it.
- Do not expose internal review links, private validation notes, internal
  workflow nicknames, source-audit breadcrumbs, or private PR references in
  public docs, PR text, commits, release notes, or changelog entries.
- Do not include real secrets, seed phrases, private keys, auth tokens, API
  keys, customer data, or production recipient addresses in examples.
- Do not publish write-flow examples that skip any source-exposed preparation,
  quote/requirements, persistence, payload review, confirmation, authorization,
  completion, recovery, or cleanup phase that applies. Do not invent absent phases.
- Every JavaScript or TypeScript fence that can move funds, approve spending,
  create a provider action, or submit a transaction must be safe when copied by
  itself: include source-exposed preparation, in-fence review/confirmation,
  submission, and layered success. Signing-only fences follow the separate
  transaction/message signing contract below and need not pretend to broadcast.
- Preserve existing route fragments as semantic contracts. An old fragment must
  still land beside the same API symbol or reader concept, not merely exist on
  the rewritten page.
- Do not document fee caps, slippage, approval, status, or limit behavior until
  source confirms whether the guard runs before signing, before broadcast, after
  broadcast, only during quote, or not at all.

## Current Source Surfaces

Refresh these before writing current repo docs or reviewing a current PR:

```bash
git status --short --branch
git fetch upstream develop
git log -1 --oneline upstream/develop
gh pr list --repo tetherto/wdk-docs --state open --limit 100
```

If the checkout is dirty, use a clean worktree from fresh `upstream/develop`
for inspection and edits. For read-only review of a supplied artifact, do not
fetch or change repository refs unless current repo truth is part of the ask.
Open PRs are evidence surfaces, not merged truth. Check their base branch,
merge state, files, body, review state, and diff before using them.

Use these repo surfaces for current IA and style:

| Surface | Why it matters |
|---|---|
| `content/docs/sdk/**` | Current SDK docs, frontmatter, section order, examples, and page depth. |
| `src/lib/custom-tree.ts` | Rendered sidebar labels, grouping, page order, and stable URLs. |
| `content/feeds/all-modules.md` | Repo-owned aggregate feed, including functional and community rows and responsibility callouts. It feeds the tracked `llms-full.txt` section; it is not a rendered docs page. |
| `_redirects` and `https://wdk.tether.io/developers/blocks` | Retired local-catalog route handling and the canonical public module catalog destination. |
| `content/docs/sdk/wallet-modules/which-wallet-module.mdx` | Wallet chooser copy and wallet decision journey. |
| `src/components/wallet-module-chooser.tsx` | Rendered wallet chooser data. Update when a wallet should appear there. |
| `skills/wdk/**` | Existing WDK runtime references. Verify before reuse because they may lag current community modules. |
| `source.config.ts` and `src/lib/source.ts` | Fumadocs collection boundary and generated route behavior. |
| `scripts/check-*.mjs` and generation scripts | Actual metadata, redirect, link, search, and generated-output checks. |
| `package.json` scripts | Local validation commands and docs build behavior. |
| Open module PRs | Draft or in-flight docs patterns, package status, and reviewer concerns. |

Generated mirrors such as `public/llms.txt`, `public/llms-full.txt`, search JSON,
`.source/`, `.next/`, and `dist/` are outputs, not authoring evidence. Remove them
from blind regeneration fixtures before the generation role starts. Recreate or
restore them only after generated docs are frozen and the generation role has
closed.

Fumadocs currently collects the default `content/docs` directory. A
repository-root `contributing/` directory is outside the rendered collection,
search index, and docs link checker. Re-verify `source.config.ts` if the
collection configuration changes.

## IA Orientation Matrix

Use this matrix only to recognize family shapes. Refresh the files and sidebar
before every task; examples are not release-state or open-PR truth.

| Family | Orientation examples | Typical sidebar placement |
|---|---|---|
| Wallets | Standard, smart-account, gasless, gasfree, Bitcoin, Spark, TON, TRON, and Solana modules | `Wallets`, grouped by chain or account model. |
| Community wallets | RGB and Cosmos page shapes illustrate current placement, but risk determines whether future page sets can remain compact | Use the `Wallets` sidebar section when discoverable. Keep a new independently maintained wallet under the approved `community-modules` route unless maintainers approve promotion, and include it in `content/feeds/all-modules.md` when approved. |
| Swidge | Shared interface plus provider implementations such as Orchestra and Rhino.fi | `Swap and Bridge`, grouped by provider. |
| Standalone swap and bridge | Velora swap and USDT0 bridge | `Swap and Bridge` while the standalone interface remains public. |
| Lending | Aave and Morpho page shapes | `Lending`; ownership does not override functional placement. |
| Fiat | MoonPay page shape | `On-ramp and Off-ramp`. |
| Pricing and data providers | CoinGecko HTTP page shape | Relevant `Tools and Infrastructure` workflow plus the SDK module reference. |
| Provider suites | Multiple independently installable source-chain or role packages | Functional area with explicit package-to-role mapping. |
| Catalog-only integrations | Public package/source entry without a local page set | All Modules feed only; do not invent a local route. |

## Release-State Classification

Classify the package before writing public release language.

| State | Evidence | Public wording |
|---|---|---|
| Released | Exact package name and version resolves on the intended registry, and source/release notes match docs claims. | State the package name and version only where needed. |
| Placeholder | Package resolves to `0.0.0` or another maintainer-marked placeholder. | Keep docs draft-only. Do not add changelog release claims. |
| Unpublished | Package is absent from the expected registry and no approved release exists. | Do not present install commands as released. Use source-only or draft language. |
| Deprecated | Registry metadata or an approved release notice marks the exact package/version deprecated. | State the exact deprecation and replacement only when the public source does. Do not infer end-of-life. |
| Renaming or scope change in flight | PR, maintainer comment, or package metadata shows pending package rename/scope/version change. | Mark as draft or awaiting release-state confirmation. |
| Source PR only | Source exists in an open PR but no package release exists. | Document as pending review only if maintainers asked for draft docs. |
| Unverified or blocked | Registry, source, or release evidence could not be reached or authenticated. | Make no release or install claim. Report the failed check privately and request maintainer evidence. |

Use explicit registry overrides when local npm config points scoped packages to a
private registry:

```bash
PACKAGE='<EXACT_PACKAGE_NAME>'
VERSION='<EXACT_VERSION>'
REGISTRY_ARGS=(--registry=https://registry.npmjs.org)
# For a scoped package, append '--@scope:registry=https://registry.npmjs.org'.
npm view "$PACKAGE" name version deprecated repository.url engines peerDependencies --json "${REGISTRY_ARGS[@]}"
npm view "$PACKAGE" dist-tags versions time --json "${REGISTRY_ARGS[@]}"
npm pack "$PACKAGE@$VERSION" --dry-run --json "${REGISTRY_ARGS[@]}"
```

Replace `@scope` with the package's exact scope. Apply that scope override to
every `view` and `pack` command for a scoped package; a generic `--registry`
flag may not override a scope-specific local registry setting.

For prereleases, do not trust `npm view <package> version` alone. Inspect
`dist-tags`, `versions`, publish times, release notes, and the PR target
version. If the tarball does not contain a real entry point and type
declarations, block copy-pasteable install/API docs or keep the page draft-only.

Community packages may be provider-scoped, contributor-scoped, unscoped, or
under a WDK organization. Treat every scope as evidence to verify, not a naming
pattern to extrapolate. A package resolving as `0.0.0` or another placeholder
also needs the placeholder policy above even when its name looks final.

Classify documentation readiness independently from release state:

| Readiness | Required evidence | Allowed output |
|---|---|---|
| Runnable | A clean consumer install resolves the exact documented graph; public entry points and declarations load; directly imported peers are installed; identity-sensitive construction passes in the secret-free isolated runtime gate below. | Copy-pasteable install, construction, and task snippets for the verified path. |
| Reference-only | Public API evidence is exact, but dependency resolution, declarations, runtime construction, or interoperability is unresolved or fails. | Source-backed overview, configuration constraints, API declarations, and an explicit blocked setup note. No runnable first-use command. |
| Draft-only | Release state, entry points, declarations, or selected source version is absent, conflicting, or blocked. | Private draft or maintainer decision record only; no public release/install claim. |

A package can be `released` and still be `reference-only`. Do not hide a graph
or declaration failure below a runnable install command. Record the exact
failure and the evidence needed to promote the docs to `runnable`.

A public install command needs its own proof. Run the exact published command
from an empty disposable consumer with a newly created manifest and no inherited
lockfile or `node_modules`. Disable lifecycle scripts when the package supports
that mode; otherwise inspect and explicitly approve the exact scripts before
running them in an isolated, credential-free environment. A pre-provisioned
consumer can prove the resolved graph, declarations, imports, construction, and
runtime behavior of that graph. It does not prove that the published install
command currently resolves from the documented registry. Do not promote or keep
a runnable install fence from pre-provisioned evidence alone.

Freeze install evidence before a history-free generation role starts: exact
command and environment, complete transcript, exit status, generated lockfile,
resolved graph, registry metadata, and hashes for the selected tarball. Also hash
the exact transitive package files, source files, declarations, and tests used to
support helper, error, cache, nominal-identity, or interoperability claims. A
directory path or version label without content hashes is not a source lock. The
generation role may consume this neutral evidence after target deletion, but it
must not infer a passing install from a graph-only fixture.

Readiness may be narrower than a package only when evidence supports that scope.
Classify by language, public symbol, and user flow. An unaffected path may remain
`runnable` only when its exact entry point, transitive graph, imports, construction,
and interoperability pass independently without touching the failed surface.
Name the unavailable language, symbol, or flow before setup, exclude it from
copyable examples, and reconcile chooser, index, sidebar, and cross-link wording.
If a declaration parse failure contaminates the shared TypeScript entry point,
do not imply TypeScript readiness merely because a JavaScript runtime path works.
If the failure cannot be isolated or the page cannot communicate mixed readiness
without ambiguity, classify the package `reference-only`.

Keep a private readiness ledger and use a separate smoke case for each claimed
scope. A passing row must not import or construct a blocked surface:

| Scope ID | Language/runtime | Entry point | Symbols or flow | Graph/declaration/import/construction evidence | Status | Blocker | Public output locations |
|---|---|---|---|---|---|---|---|
| `<ID>` | `<JavaScript, TypeScript, Bare, browser, or other>` | `<EXACT EXPORT PATH>` | `<SYMBOLS AND USER JOURNEY>` | `<SEPARATE TRANSCRIPT PATHS>` | `runnable / reference-only / draft-only` | `<EXACT FAILURE OR NONE>` | `<PAGES, CHOOSERS, INDEXES, AND API SECTIONS>` |

Run graph, declaration, import, construction, and interoperability checks only
for the row that claims them. A shared failing declaration makes every row that
loads it fail; a JavaScript-only row can pass only when its public text says that
the TypeScript path is blocked. Review every direct-entry location in the last
column so a broad readiness badge cannot contradict a scoped limitation.

Keep deterministic and live-provider validation in separate lanes. Deterministic
checks cover parsing, types, imports, creation, local control flow, exact error
branches, and secret-free offline behavior. Fakes may exercise those local
branches, but they cannot establish provider support, credentials, availability,
rates, quotes, chain/token coverage, settlement, or production behavior. Run a
separately authorized live lane only for claims that require the provider. Record
the exact request scope without secrets. A timeout, `429`, authentication block,
or provider outage means the live claim is `unverified/blocked`; it is not proof
that a source-valid snippet is wrong. Conversely, never report a live check as
passed unless that exact check completed successfully.

Use a disposable scratch project for static readiness staging. This host-side
stage does not establish `runnable`; it must never import or construct the
community package. First
prepare two reviewed smoke files outside the repository: `smoke.ts` imports the
documented exports and checks constructor/options/return types; `smoke.mjs`
constructs only an offline path with fake, non-secret values and no financial
write. It must assert identity-sensitive wallet/account interoperability when
applicable, dispose constructed objects in `finally`, and zero caller-owned
synthetic secret bytes there. Inventory exact compatible versions for every peer
those files import.

Run the static stage as one Bash subshell. Replace the package, version,
smoke-file paths, scoped registry override, and peer arguments before running it.
Keep `PEER_ARGS` empty only when neither smoke file imports a peer:

```bash
(
  set -euo pipefail

  WDK_DOCS_ROOT="$(git rev-parse --show-toplevel)"
  WDK_DOCS_ROOT="$(cd "$WDK_DOCS_ROOT" && pwd -P)"
  HOME_ROOT="$(cd "$HOME" && pwd -P)"
  PACKAGE='<EXACT_PACKAGE_NAME>'
  VERSION='<EXACT_VERSION>'
  SMOKE_TS='<ABSOLUTE_PATH_TO_REVIEWED_SMOKE_TS>'
  SMOKE_MJS='<ABSOLUTE_PATH_TO_REVIEWED_SMOKE_MJS>'
  REGISTRY_ARGS=(
    --registry=https://registry.npmjs.org
    # '--@scope:registry=https://registry.npmjs.org'
  )
  PEER_ARGS=(
    # 'directly-imported-peer@EXACT_COMPATIBLE_VERSION'
  )

  case "$SMOKE_TS:$SMOKE_MJS" in /*:/*) ;; *) exit 64 ;; esac
  test -f "$SMOKE_TS" && test ! -L "$SMOKE_TS"
  test -f "$SMOKE_MJS" && test ! -L "$SMOKE_MJS"
  TYPESCRIPT_VERSION="$(node -e '
const lock = require(process.argv[1]);
const version = lock.packages?.["node_modules/typescript"]?.version;
if (!version) process.exit(1);
process.stdout.write(version);
' "$WDK_DOCS_ROOT/package-lock.json")"

  SCRATCH_ROOT=''
  SCRATCH_SENTINEL=''
  cleanup_readiness_scratch() {
    rc=$?
    trap - EXIT HUP INT TERM
    if test -n "$SCRATCH_ROOT"; then
      if test -n "$SCRATCH_SENTINEL" && test -f "$SCRATCH_SENTINEL" && \
        test "$(cat "$SCRATCH_SENTINEL")" = "$SCRATCH_ROOT"; then
        rm -rf -- "$SCRATCH_ROOT"
      else
        printf 'refusing unsafe scratch cleanup: %s\n' "$SCRATCH_ROOT" >&2
        rc=1
      fi
    fi
    exit "$rc"
  }
  trap cleanup_readiness_scratch EXIT HUP INT TERM

  TMP_ROOT="$(cd "${TMPDIR:-/tmp}" && pwd -P)"
  SCRATCH_ROOT="$(mktemp -d "$TMP_ROOT/wdk-doc-readiness.XXXXXX")"
  SCRATCH_ROOT="$(cd "$SCRATCH_ROOT" && pwd -P)"
  case "$SCRATCH_ROOT" in
    /|"$HOME_ROOT"|"$WDK_DOCS_ROOT"|"$WDK_DOCS_ROOT"/*) exit 64 ;;
  esac
  SCRATCH_SENTINEL="$SCRATCH_ROOT/.wdk-doc-readiness-scratch"
  printf '%s\n' "$SCRATCH_ROOT" > "$SCRATCH_SENTINEL"
  mkdir -p "$SCRATCH_ROOT/tarball" "$SCRATCH_ROOT/unpacked" "$SCRATCH_ROOT/consumer"
  PACK_JSON="$SCRATCH_ROOT/pack.json"

  npm pack "$PACKAGE@$VERSION" --json \
    --pack-destination "$SCRATCH_ROOT/tarball" \
    "${REGISTRY_ARGS[@]}" > "$PACK_JSON"
  TARBALL="$(node -e '
const fs = require("node:fs");
const rows = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
if (!Array.isArray(rows) || rows.length !== 1 || typeof rows[0]?.filename !== "string") process.exit(1);
process.stdout.write(rows[0].filename);
' "$PACK_JSON")"
  test "$(basename "$TARBALL")" = "$TARBALL"
  test -f "$SCRATCH_ROOT/tarball/$TARBALL"
  tar -tzf "$SCRATCH_ROOT/tarball/$TARBALL" > "$SCRATCH_ROOT/tarball-files.txt"
  tar -tvzf "$SCRATCH_ROOT/tarball/$TARBALL" > "$SCRATCH_ROOT/tarball-listing.txt"
  awk 'substr($1, 1, 1) != "-" && substr($1, 1, 1) != "d" { bad=1 } END { exit bad }' \
    "$SCRATCH_ROOT/tarball-listing.txt"
  node -e '
const fs = require("node:fs");
for (const path of fs.readFileSync(process.argv[1], "utf8").split(/\r?\n/)) {
  if (path.startsWith("/") || path.split("/").includes("..")) process.exit(1);
}
' "$SCRATCH_ROOT/tarball-files.txt"
  tar -xzf "$SCRATCH_ROOT/tarball/$TARBALL" -C "$SCRATCH_ROOT/unpacked"
  shasum -a 256 "$SCRATCH_ROOT/tarball/$TARBALL"
  node -e 'const p=require(process.argv[1]); console.log({name:p.name,version:p.version,exports:p.exports,types:p.types,engines:p.engines,peerDependencies:p.peerDependencies})' \
    "$SCRATCH_ROOT/unpacked/package/package.json"
  cp "$SMOKE_TS" "$SCRATCH_ROOT/consumer/smoke.ts"
  cp "$SMOKE_MJS" "$SCRATCH_ROOT/consumer/smoke.mjs"

  cd "$SCRATCH_ROOT/consumer"
  npm init -y
  npm pkg set type=module
  if test "${#PEER_ARGS[@]}" -gt 0; then
    npm install --ignore-scripts --save-exact "../tarball/$TARBALL" \
      "${PEER_ARGS[@]}" "${REGISTRY_ARGS[@]}"
  else
    npm install --ignore-scripts --save-exact "../tarball/$TARBALL" \
      "${REGISTRY_ARGS[@]}"
  fi
  npm install --ignore-scripts --save-dev --save-exact \
    "typescript@$TYPESCRIPT_VERSION" "${REGISTRY_ARGS[@]}"
  npm ls --all
)
```

The static stage refuses symlinked smoke inputs, unsafe tar paths, archive links
or special entries, unresolved commands, and cleanup without the unique scratch sentinel. `--ignore-scripts`
prevents package lifecycle execution; if the package requires one, audit it and
report readiness blocked instead of enabling it implicitly.

To promote the result to `runnable`, recreate the exact consumer graph in a
disposable unprivileged container or VM. The runtime gate must use an allowlisted
environment, isolated home, no host or sibling-worktree mounts, no secrets, a
read-only root, dropped capabilities, and denied network access. Prepare the
graph with lifecycle scripts disabled; if registry authentication is required,
use a secret mount that is absent from image layers and destroy it before the
runtime phase. Then type-check `smoke.ts`, import every documented public entry
point from the exact tarball (including subpath-only exports), and run `smoke.mjs`.
Capture Node/npm versions, `npm ls --all`, image/runtime identity, tarball hash,
entry points, type-check, construction/interoperability result, and mismatches in
a private transcript. If this isolation is unavailable, classify the package as
`reference-only`. Never run community-package top-level or constructor code in a
credential-bearing host shell.

## Evidence and Source Precedence

Every public claim needs one or more of these sources:

- Package `package.json`, exports, entry points, and `types` fields.
- Published tarball contents for the exact documented version.
- Generated `.d.ts` files or source TypeScript types.
- Public source implementation for constructors, methods, defaults, errors,
  status mapping, fee mapping, and unsupported paths.
- Public entry points and re-export surfaces. A type that exists in source but
  is not exported from the package entry point is not a public API.
- Tests and examples that exercise the API.
- README, release notes, changelog, npm metadata, and tags.
- Official provider docs for provider-owned capabilities, route support,
  chain support, limits, API keys, status values, and operational prerequisites.
- Current docs in `content/docs/sdk/**` for repo style and IA patterns.
- Open PRs only as in-flight evidence, never as merged truth.

For released-package API claims, use claim-specific authority:

1. The exact tarball's `package.json`, entry points, and re-exports establish
   package identity and public reachability.
2. The exact tarball's declarations establish the compile-time surface only.
3. Published JavaScript plus version-matched source and tests establish runtime
   defaults, behavior, return values, errors, status mapping, and side effects.
4. Official provider docs establish provider-owned live facts such as
   availability, credentials, limits, and status definitions.
5. Version-matched README, examples, and release notes provide supporting
   context but do not override the package or runtime.

Do not silently combine source `HEAD`, a prerelease tarball, and a stable README.
If evidence from different versions conflicts, document only the selected
version or stop and ask a maintainer. If declarations and runtime from the same
version disagree, record both sides and block the affected language, symbol, or
flow. Narrow the block only under independently verified scoped-readiness
evidence; otherwise use package-level `reference-only` or `draft-only`. Never
choose a stale declaration over observed version-matched runtime behavior.

Maintain a private claim ledger while writing:

| Claim | Public text location | Evidence | Status |
|---|---|---|---|
| Package name/version | Install section | `npm view ...`, dist-tags, tarball `package.json` | verified / draft / blocked |
| Direct imports | Install section and snippets | code fences plus `package.json` dependencies/peers | verified |
| Runtime requirements | Prerequisites and setup | `engines`, peer deps, provider docs, source | verified |
| Creation signature | API reference | source/types/public exports | constructor / factory / static creator / injected instance / none |
| Creation invocation | Every creation snippet | exact export kind plus clean-consumer type-check/runtime smoke | `new` class / call factory / static call / blocked |
| Compile-time/runtime match | API reference and setup | exact declarations plus published JavaScript/tests | verified / mismatch / blocked |
| Nominal dependency identity | Every flow crossing package boundaries | exact installed graph plus runtime constructor-identity/interoperability checks | compatible / duplicate identity / blocked |
| Supported chains | Overview or usage | source/provider docs/runtime discovery | verified / runtime-only |
| Quote/read behavior | Usage/API reference | source/tests | verified |
| Write behavior | Usage guide | source/tests | verified |
| Pre-write enforcement | Usage/API reference | implementation order | quote-only / pre-sign / pre-broadcast / post-broadcast / none |
| Requirement taxonomy | Usage/API reference | helper implementations and return types | approval / permit / signature / auth / transaction |
| Status lifecycle | Usage/API reference | source status mapper/provider docs | pending / intervention / terminal |
| Error propagation | Usage/API reference/errors | exact throw, catch, transform, wrap, and escape boundaries | wrapped / raw / structured result / unknown |
| Credential lifecycle | Setup/security | package source plus official provider docs | public/secret classification, exchange, cache, forwarded credential |
| Config ownership/lifecycle | Configuration/cleanup | constructor and manager/account source/tests | copied / retained by reference / mutable / recreation required |
| Reported versus enforced values | First decision and write point | provider response plus local validation/enforcement source | requested / reported / independently validated / locally enforced |
| Transitive helper behavior | Promised integration path | exact helper dependency source/tests/runtime probe | cache-key, failover, retry, null/error, and collision semantics |
| Unsupported method | Limitations/API reference | source/tests/errors | verified |
| Peer dependencies | Install/setup section | `package.json`, npm tarball | verified |
| Documentation readiness | First-use path | clean install, declaration load, import/creation smoke test | runnable / reference-only / draft-only |
| Baseline fragment meaning | Compatibility ledger | base page, repository inbound links, matching candidate section | preserved / retired / maintainer decision |

Do not include the private claim ledger in partner-facing docs unless the
maintainer explicitly wants an internal appendix.

## Future Module Classification

Do not classify from a package prefix, provider name, or one familiar method.
Complete this multi-axis record first:

| Axis | Questions to answer from source |
|---|---|
| Authority and custody | Does the package hold local secrets, call a remote custodian, coordinate MPC/multisig participants, use a supplied signer, or have no signing authority? |
| Account ownership | Does it derive/manage an account lifecycle, act on a caller-owned account, use a remote account, or operate without an account? |
| Operation surface | Is it read-only, discovery-only, payload preparation, signing-only, write execution, status tracking, recovery, or a combination? |
| Settlement model | Is economic settlement absent/not applicable, synchronous, receipt-based, asynchronously fulfilled, cancellable, partially fillable, resumable, or operator-intervened? Keep HTTP/Promise completion separate from economic settlement. |
| Trust boundaries and decision authority | Which RPC, provider payload, solver, webhook, indexer, catalog, allowlist, policy/risk feed, custodian, paymaster, or user field can change or authorize a later outcome? |
| Package topology | Is this one package, several role packages with one journey, or a suite spanning distinct functional families? |
| Reader journeys | What can a direct-entry reader complete, and which journeys have different prerequisites, confirmation fields, or recovery? |

Map to an existing family only when the full record fits its contract:

| Family | Required axis values | Allowed axis values | Disqualifying values or precedence |
|---|---|---|---|
| Wallet | Owns a managed account lifecycle; account-centric reads, signing, sends, recovery, or a source-backed subset; settlement is absent for reads/signing or chain/account based for writes. | Local secrets, supplied signer, remote signer, smart-account coordinator, or service fee payer when the account model and trust boundary are explicit. | Signing-only, remote-custody, policy, routing, or accountless packages without account lifecycle ownership require another or new family. |
| Swidge | Implements the shared route contract for support/discovery and non-binding quote plus the source-backed execute and/or status journey; acts on a caller-owned compatible account or exposes accountless discovery. | Same-chain and cross-chain routes, provider payloads, asynchronous settlement, requirements, and intervention states. | Swap-only/bridge-only interfaces, custodial order systems, or intent engines that do not implement the shared contract use their functional family or require IA approval. |
| Standalone swap | Primary journey converts assets through an established swap interface; source/account authority and same-domain or provider settlement are explicit. | Discovery, quotes, approvals/signatures, asynchronous provider status, and caller-owned accounts. | A shared Swidge contract takes precedence; a transfer whose primary outcome is cross-domain movement belongs to bridge; combined independent journeys require a map. |
| Standalone bridge | Primary journey moves value across settlement domains through an established bridge interface; source/destination and completion layers are explicit. | Quotes, approvals, destination execution, asynchronous status, and caller-owned accounts. | A shared Swidge contract takes precedence; same-domain conversion belongs to swap; independent swap and bridge journeys require a map. |
| Lending | Reads or changes markets, vaults, positions, supply, collateral, debt, repayment, withdrawal, or health; debt/position settlement and account authority are explicit. | Caller-owned accounts, provider preparation, approvals/permits, synchronous receipts, or asynchronous position updates. | Generic swaps, pricing, custody, or yield labels without a lending position/market lifecycle do not qualify. |
| Fiat | Primary journey quotes, creates, hands off, or reconciles fiat on/off-ramp actions; provider/customer authority and external settlement are explicit. | Widgets/URLs, server authorization, custodial/provider accounts, regional availability, webhooks, and asynchronous transaction status. | Crypto-only routing or a generic payment URL without a fiat conversion/reconciliation journey does not qualify. |
| Pricing or tooling | Accountless, non-custodial read/discovery/indexing output is the primary public journey; no package method signs or executes the downstream financial action. | Credentials, caches, failover, pagination, observational output, or decision-steering data with explicit downstream authority controls. | Any signing, custody, or write execution moves the applicable journey to another/new family; a read helper stays a cross-link rather than redefining that family. |
| Catalog-only integration | Public package/source evidence exists, but no local WDK journey, canonical route, or sidebar task is approved. | One verified catalog row and useful public destination. | It is an output policy, not a functional family; promote only after a source-backed journey and IA approval. |
| Provider suite overlay | Multiple packages have an explicit role map, topology, release/readiness ledger, and shared or separated reader journeys. | One same-family suite page when prerequisites and risk boundaries align; multiple functional destinations when they do not. | Suite branding and community ownership never override functional family. A single multi-capability package with independent journeys follows the same precedence. |

Apply these precedence rules after filling every axis:

1. Choose the functional family from the reader's primary completed task and
   economic settlement, not package ownership or provider branding.
2. The exact shared interface wins over a similar method name; Swidge takes
   precedence only when its public contract is actually implemented.
3. When one package exposes independent tasks with different settlement,
   prerequisites, confirmation, or recovery, map each journey to its functional
   destination or stop for a maintainer-approved multi-family/new-family map.
4. Authority, custody, and account ownership adjust safety, responsibility, and
   page depth. A disqualifying value cannot be repaired by adding a disclaimer.

Signing-only adapters do not become wallets unless they own an account
lifecycle. MPC, multisig, custodial, accountless, webhook-led, and asynchronous
intent/order systems do not become wallet or Swidge modules merely because they
sign or route. A suite that spans different functional families does not become
catalog-only as a shortcut.

If any axis does not fit an established contract, create no route, page set, or
navigation entry. Record a new-family or multi-family IA candidate, including
capabilities, authority, lifecycle, risks, path options, and maintainer
questions. Derive tentative page depth from the complexity overlay, but wait for
canonical-path and sidebar approval before creating files.

Use risk and journey complexity to adjust page depth:

| Level | Characteristics | Minimum treatment |
|---|---|---|
| Compact | Narrow observational API, no secrets/recovery, and no data that authorizes or materially steers downstream writes | Overview plus API reference; include configuration only when setup decisions exist. |
| Standard | Credentials, runtime configuration, several user tasks, or provider-owned availability | Overview, usage, configuration, API reference. |
| High-risk | Signing, approvals, fund movement, debt, external settlement, resumable state, materially different variants, or control-plane data that authorizes/steers financial actions | Standard pages plus focused task, recovery, and error guides. |

This overlay outranks provider precedent. Similar package names do not justify
the same page count when their risk and reader journeys differ.

## Page Set Matrix

Choose the smallest page set that covers the module honestly.

Within this repository, the aggregate listing source is
`content/feeds/all-modules.md`. For independently maintained packages,
reconcile the applicable rendered functional index and the Community Modules
feed row. Add a second row to a functional feed section only when that section
intentionally lists community packages with ownership and responsibility
treatment; currently, those sections are Swidge and Lending.
Treat updates to the external Building Blocks catalog as separate coordination;
do not recreate either retired local catalog page.

| Module type | Required pages | Optional pages | Listing/nav updates |
|---|---|---|---|
| WDK-maintained wallet | `index.mdx`, `usage.mdx`, `configuration.mdx`, `api-reference.mdx`; guide pack when behavior is broad. | Chain-specific guides such as transaction history, Lightning, deposits, or special account flows. | `wallet-modules/index.mdx`, the aggregate feed, `custom-tree.ts`, wallet chooser when user selection should expose it. |
| Compact independently maintained wallet exception | `index.mdx` and `api-reference.mdx` only when the public surface is narrow and has no secret material, writes, or asynchronous recovery. The overview must contain the complete first-use path. | Usage or configuration only when they add a real decision or task. | `wallet-modules/index.mdx` when it enumerates the module, the Community Modules feed row, `custom-tree.ts` if sidebar-discoverable, wallet chooser only when desired. |
| Community wallet with secrets, signing, writes, or recovery | Standard wallet pages plus focused task, safety, cleanup, and error guides required by the risk overlay. | Chain-specific account, transaction, token, signing, backup, or recovery guides. | `wallet-modules/index.mdx` when it enumerates the module, the Community Modules feed row, and wallet chooser when part of the decision journey. |
| Swidge provider | `index.mdx`, `usage.mdx`, `configuration.mdx`, `api-reference.mdx`. Guides when state recovery or route execution is complex. | `guides/get-started`, `guides/quote-and-execute`, `guides/state-and-recovery`, `guides/handle-errors`. | `swidge-modules/index.mdx`, the functional and Community Modules feed rows, `custom-tree.ts`. |
| Standalone swap or bridge provider | Prefer Swidge if the provider implements route discovery, quotes, execution, and status across swap/bridge routes. If standalone is source-backed, use overview, usage, configuration, API reference, and flow guides. | Provider-specific approvals, status, route tracking, or recovery guides. | Functional section index when it enumerates the module, the Community Modules feed row, any separately approved functional feed row, and `custom-tree.ts`. |
| Lending provider | `index.mdx`, `usage.mdx`, `configuration.mdx`, `api-reference.mdx`; operations and error guides when write flows have requirements. | Separate requirement, quote, position-read, or market/vault guides. | `lending-modules/index.mdx`, the functional and Community Modules feed rows, `custom-tree.ts`. |
| Fiat provider | `index.mdx`, `usage.mdx`, `configuration.mdx`, `api-reference.mdx`; transaction/status guide if provider has async transaction lifecycle. | Regional availability or widget customization guide. | `fiat-modules/index.mdx` when it enumerates the module, the Community Modules feed row, any separately approved functional feed row, and `custom-tree.ts`. |
| Pricing or read-only data provider | `index.mdx`, `usage.mdx`, `configuration.mdx`, `api-reference.mdx` when credentials, mapping, caching, or errors matter; compact modules may combine usage into overview. | Current/historical data guides, rate-limit or error guide. | `pricing-modules/index.mdx` when it enumerates the module, the Community Modules feed row, any separately approved functional feed row, the relevant tooling workflow, and `custom-tree.ts`. |
| Provider suite | One suite overview plus per-package sections when packages share one user journey. Split pages if package behavior diverges. | Per-role or source-chain pages when setup, methods, limits, release state, or readiness differ substantially. | Same-family suites stay in that functional family; multi-family suites require approved canonical mapping. Catalog row per independently installable community package. |
| Catalog-only integration | No local page set. Require the Community Modules feed fields plus verified maintainer evidence in the coordination record. | Promote to local docs only when a reader journey justifies it. | Community Modules row in the aggregate feed and separate external catalog coordination; no sidebar entry. |
| New-family candidate | Page set derived from the complexity overlay after maintainer IA approval. | Family index or chooser only when more than one module or a distinct decision journey exists. | Approved canonical path, relevant functional indexes and aggregate feed rows, and `custom-tree.ts` only for rendered discoverability. |

Do not add empty pages. Split guides when there are multiple independent write
flows, long prerequisite/requirement sequences, status or recovery workflows
that need their own loop, or different account/chain variants with distinct
safety rules. If a community module has a narrow API, combine install, minimal
setup, requirements, limitations, and next steps in the overview, plus one API
reference.

Changelog treatment is cross-cutting, not family-specific. Update the changelog
when the task introduces or changes public docs for a verified release and the
current repository release policy calls for an entry. Do not add a release entry
for placeholders, unpublished packages, source-only work, or unverified state.

An output allowlist is a maximum write scope. It does not require every listed
page and is not evidence of API ownership, release, IA approval, or factual
accuracy. If a split guide requires a tree or index edit that the task does not
permit, consolidate the journey into an already listed page or stop for scope
approval. Do not create an unlisted routable guide and defer navigation work.

Before drafting, record the page-set decision:

| Decision | Required record |
|---|---|
| Canonical IA | Capability family, route, sidebar node, functional indexes, community cross-listing, chooser/catalog effects, and redirect implications. |
| Flow inventory | For every independent journey: discover, quote/requirements, prepare/reserve/build, persist, inspect, confirm, authorize/sign, execute/handoff, track, reconcile, cancel/retry/recover, and clean up when source exposes each phase. |
| Page mode | Overview-only, usage hub plus focused guides, complete-flow usage, reference-only, catalog-only, or blocked new-family proposal. |
| Split rationale | Which flows share prerequisites and safety boundaries, and which need direct links, different confirmation data, or independent recovery. |

A complete-flow usage page fails this gate when it contains more than one
independent write journey, or combines a write with a separate status/recovery
loop. An operations guide may group closely related methods only when they share
prerequisites, review fields, completion evidence, and recovery. Split again when
those boundaries differ. The decision is based on journeys, not a fixed line or
page count.

## Frontmatter Rules

Site-rendered MDX pages use YAML frontmatter:

```mdx
---
title: Module Name Overview
description: One concrete sentence that names the package and user outcome.
docType: explanation
schemaType: TechArticle
---
```

Use:

- `docType: explanation` for overview and chooser pages.
- `docType: how-to` for new task guides and usage pages. Some existing guides
  use the legacy `getting-started` value; preserve deliberate adjacent style
  when editing those pages, but do not copy it into new families by default.
- `docType: reference` for configuration and API references.
- `schemaType: APIReference` for API reference pages unless an existing repo
  exception is deliberate and documented.
- `icon: BookOpen`, `icon: Settings`, or `icon: Code` on usage/config/API pages when matching existing leaf-page style.

Descriptions must state what the page helps the reader do. Avoid unsupported
adjectives such as "best", "simple", "secure", "seamless", "production-ready",
or "fully supported" unless a public source directly proves the claim.
Catalog and chooser status labels must name their axis. Use a verified package
state such as `Prerelease`, a documentation state such as `Reference only`, or a
capability statement. Do not use `Ready` when readers could infer package
stability, release maturity, runtime interoperability, or production suitability.

Use this title and navigation policy. Within a family, order applicable sections
as Usage, Guides, Configuration, API Reference, then supplemental Reference.
Omit missing sections without changing the relative order.

| Page | Rendered `title` | Description | Sidebar/card label |
|---|---|---|---|
| Partner/community overview | Module or provider-qualified, such as `<Module> Overview` when adjacent pages use that form | Name the package and primary reader outcome | Approved module/provider label. |
| Usage | `<Module> Usage` for independently maintained modules; preserve an established generic first-party title when editing in place | Name the workflow map or complete task | Usually `Usage`. |
| Task guide | Imperative or outcome-based, such as `Quote and execute a route` | State the completed result | Short outcome label matching the tree. |
| Configuration | `<Module> Configuration` for independently maintained modules; generic `Configuration` only when the adjacent merged family deliberately uses it | Name the setup decisions and runtime | Usually `Configuration`. |
| API reference | `<Module> API Reference` for independently maintained modules; generic `API Reference` only when the adjacent merged family deliberately uses it | Name the public package/API surface | Usually `API Reference`. |

Rendered titles must make sense in search and direct entry. Sidebar and card
labels may stay compact because their parent group supplies context. Keep card
labels, page targets, and `custom-tree.ts` entries consistent.

The layout renders the frontmatter title. New MDX pages must not repeat it as a
body `#` heading. When editing a legacy page, do not introduce a second H1; if
removing an existing H1 changes a public fragment, preserve that fragment beside
the same semantic section. The repository's `check:meta` command currently
validates `meta.json`, not MDX frontmatter, so run the changed-MDX validator and
review frontmatter directly.

## Overview Page Template

Place the canonical responsibility callout near the top of every independently
maintained page, before or after the opening content to match adjacent merged
family pages. Use this order for the remaining overview content:

1. One paragraph naming the package, maintainer/provider, module family, and
   primary user outcome.
2. Short source or provider attribution when useful.
3. "When to use it" table mapping use cases to this module and alternatives.
4. "Requirements" or "Prerequisites" for accounts, RPC, provider keys,
   storage, approvals, route support, or network requirements.
5. "Key capabilities" or "Features" with exact method and behavior names.
6. "Limitations" when any unsupported method, runtime caveat, route limit,
   package status, or provider dependency matters.
7. "Next Steps" cards in the same order as sidebar/pages.

Compact page mode is the exception: use the dedicated compact scaffold below so
the overview contains prerequisites, installation, minimal construction or
first read, limitations, cleanup when applicable, and only applicable exits.

Canonical community page or dedicated community listing callout:

```mdx
<Callout type="warn">
Community modules are developed and maintained independently by third-party contributors.

Tether and the WDK Team do not endorse or assume responsibility for their code, security, or maintenance. Use your own judgment and proceed at your own risk.
</Callout>
```

Mixed functional listing callout:

```mdx
<Callout type="warn">
Rows marked Community are developed and maintained independently by third-party contributors.

Tether and the WDK Team do not endorse or assume responsibility for their code, security, or maintenance. Use your own judgment and proceed at your own risk.
</Callout>
```

Verify these exact variants against `content/feeds/all-modules.md`, the merged
module pages, and mixed functional indexes before publishing; do not
paraphrase them. Apply them by surface, without hidden policy:

| Surface | Required responsibility treatment |
|---|---|
| Every page owned by an independently maintained module | Community page callout near the top, before or after the opening purpose/attribution to preserve the placement used by adjacent merged family pages. |
| `## Community Modules` section in `content/feeds/all-modules.md` | Community page/listing callout once before the community listing. |
| Mixed functional index or table with WDK-maintained and community packages | Mixed functional listing callout once before the affected rows. Mark each community row's ownership/status explicitly. |
| Chooser/card outside a community listing | Label the option `Community` or `Independently maintained` and link to the module overview; do not squeeze the full callout into a compact control. |
| Changelog or incidental cross-link | No repeated callout; keep ownership factual and link to the overview or catalog. |

Do not generalize one family's placement into a repository-wide rule. An open PR
does not change canonical wording or adjacent-family placement. If maintainers
standardize either, update this matrix and the affected page sets together.

Put an operational limitation at the first decision point when it changes
whether a reader should use the default setup. Examples include a provider
discouraging keyless access for sustained workloads, a credential mode that is
development-only, a region-dependent flow, or a package that is reference-only.
Do not leave that fact only in an external link or a late limitations section.

## Usage Page Rules

Choose one usage-page mode:

- Hub mode when focused task guides exist. Summarize prerequisites, setup,
  workflow order, safety/limitations, and link to guides in sidebar order. Do not
  duplicate each complete workflow.
- Complete-flow mode for compact modules without split guides. Teach the full
  safe flow on the usage page.

Across the usage hub and its guides, or on a complete-flow page, select only the
phases the verified public API exposes and preserve their actual order:

1. Install exact package names when documentation readiness is runnable. Pin exact
   prerelease versions; keep stable installs unpinned unless compatibility
   evidence requires a fixed version.
2. Create a wallet/protocol/client only when construction is part of the journey.
3. Discover support or prerequisites when runtime discovery exists or prevents
   an invalid user choice.
4. Quote, estimate, or collect requirements only when source exposes that phase.
5. Prepare, reserve, build, or persist only when source separates that phase from
   execution or returns a resumable identifier.
6. Inspect and confirm the exact caller-supplied, quoted, prepared, or handoff
   fields that authorize or materially steer the next action.
7. Authorize or sign only when source exposes a separate authority phase.
8. Execute locally, submit asynchronously, or hand off to a provider only when
   that phase exists; do not turn URL generation into an on-chain write.
9. Track, reconcile, retry, recover, or clean up only for lifecycle states and
   resources the source actually exposes.

Every package imported in an executable snippet must appear in the install or
prerequisites section unless it is built into the runtime. Include peer
dependencies and account/wallet peers that examples import directly. If a
package declares `engines`, mention the runtime requirement before the first
runnable snippet.

Apply the documentation-readiness gate before step 1. If a clean consumer graph,
declaration load, isolated import, or isolated minimal construction path fails,
replace every executable install, import/construction, task, write, and status
fence in the affected language, symbol, or flow with clearly labeled `text`
reference guidance. A nearby `reference-only` notice does not make a JavaScript,
TypeScript, shell, or console fence non-runnable. Declaration-only fences may
remain only when their declarations are exact and cannot be mistaken for a
working first-use path. Do not recommend dependency overrides, duplicate
versions, or forced install flags unless maintainers have validated that exact
resolution and its runtime behavior.

For every executable fence, create a clean-consumer check for that exact code,
including its imports, constructor syntax, config, peer graph, and awaited calls.
Type-check it against the selected package graph and run the smallest secret-free
path the readiness state promises. Syntax parsing alone is insufficient. Verify
whether each callable export is a class that requires `new`, a factory function,
or another value; never infer invocation form from its name or declaration prose.

Inspect regular dependencies as well as peers. When a provider uses
`instanceof`, constructor identity, or another nominal check against an account
or wallet class, resolve the documented dependency graph in a clean project and
run the isolated constructor/interoperability smoke test through every affected
approval, execution, receipt, and recovery path. Compare the actual constructor
objects resolved by both sides; matching names or structurally compatible types
do not satisfy a nominal check. If nested dependencies resolve duplicate class
identities, block the affected flow. Do not claim that a top-level pin fixes a
nested copy unless the exact installed graph and runtime rehearsal prove it.

If execution prepares a fresh quote, route, requirement set, fee estimate, or
transaction after the preview quote, say the preview is non-binding and explain
which final result fields the app must persist or show after execution.

For every stateful quote-before-write pair, verify and document the cache or
matching key, time-to-live, one-shot consumption, nonce validation or
reservation, concurrency behavior, requote triggers, retry behavior, final fee
source, and the order of signing and broadcast when those mechanics exist. Do
not imply that a reviewed quote can be reused unless source proves it.

When docs promise behavior supplied by a transitive helper, inspect and test that
exact installed helper rather than repeating its name or README summary. Trace
cache-key serialization and collisions, cache scope and expiry, which rejected
values or errors trigger failover, fulfilled-null/empty behavior, retry and
rotation order, and whether malformed input is cached or propagated. Put any
user-visible collision or fallback limitation beside the promised integration.

For route providers, document empty discovery, unsupported direction or pair,
no liquidity or usable route, stale or expired route, provider-selection changes,
and provider unavailability as distinct source-backed outcomes. State whether
each requires requoting, another pair/provider, waiting, or stopping. Do not
confuse runtime outcomes with the test harness's IA-level route policy markers.

Distinguish every completion layer the selected account or provider exposes:
submission accepted, transaction included, chain execution succeeded, nested
smart-account or user operation succeeded, provider settlement reached a mapped
terminal state, and application reconciliation completed. A receipt object or
outer transaction success does not prove an inner operation succeeded. Check the
exact source-backed success field for each layer and preserve failed,
intervention-required, timed-out, and indeterminate outcomes separately.

For every provider or chain status model, verify the legal transition graph,
sequence/version fields, terminal-state immutability, and which source wins when
polling, webhooks, and receipts disagree. Verify confirmation/finality
thresholds, transaction replacement, reorg rollback, reversals, and the point at
which application reconciliation may credit or release value. Never equate
`broadcast`, `included`, `settled`, or another label with irreversible success
unless version-matched evidence defines it that way.

Treat provider-generated executable instructions as untrusted input at the
application boundary. When a provider returns a transaction, approval, deposit,
or signing payload, document which fields it controls, such as target, spender,
calldata, value, token, amount, destination address, memo, or PSBT. State which
structural and semantic checks the package performs, whether target or spender
allowlisting is enabled by default, how execution is bound to the reviewed
quote, and which fields the application must verify before confirmation. Do not
imply that a provider response is safe merely because it has the expected shape.

Distinguish values the application requests, values the provider reports, values
the package independently validates, and limits the package locally enforces. A
cap checked against a provider-reported amount is not a verified bound on an
opaque payment instruction unless the package also validates the instruction's
asset, debit, program/target, accounts, and amount correspondence. Keep this
trust boundary adjacent to every affected cap or fee example.

For server-side signing or authorization endpoints, do not accept an arbitrary
provider URL, query, transaction, or payload from the client and sign it. Accept
an authorized application order or intent identifier, load server-owned fields,
construct and allowlist the provider payload, enforce authorization,
idempotency, and rate limits, and bind the response to the reviewed intent. On
return, correlate provider transaction IDs, direction, assets, amounts,
recipient/refund fields, customer/order identifiers, and status with that
intent. Treat verified webhooks or source-backed reconciliation as the
authoritative asynchronous path when the provider requires it.

When the API accepts an idempotency key, verify key generation and entropy,
tenant/account/operation scope, immutable request or intent binding, retention or
expiry, concurrent-request behavior, response replay, same-key/different-payload
conflicts, and which failures may safely retry. Persist the key before the first
attempt and reuse it for the same logical operation; generating a new key on each
retry defeats provider deduplication. Keep application reconciliation separate
from any narrower provider idempotency guarantee.

For API keys, bearer tokens, or equivalent credentials, verify the provider's
public-versus-secret key classification and the package's exact lifecycle. Trace
whether the original key is sent on every request or exchanged for another
credential, which value is cached/renewed/forwarded, the supported browser/server
runtime, HTTPS origin/path and redirect behavior, header format, scope/audience,
expiry, rotation/revocation, storage, and log/error redaction. Do not turn a
provider-documented public key into a server-secret claim, and never expose a
provider-documented secret or send credentials to a caller-controlled endpoint.

Before describing a webhook as verified, trace all of these details to
version-matched package source or official provider documentation:

- Signature algorithm and verification-key source, selection, and rotation.
- Exact signed bytes, required raw-body handling, signature header, and encoding.
- Timestamp format and tolerance, replay defense, and failure behavior.
- Duplicate and out-of-order delivery semantics, retries, and acknowledgment.
- Correlation fields that bind the event to server-owned customer, order, asset,
  amount, direction, and settlement state.

Do not parse or transform the request body before verification when the provider
signs raw bytes. Process valid deliveries idempotently and reconcile them with a
source-backed status read when either channel can arrive late or disagree.

For any approval, permit, authorization, or typed-data helper, distinguish
human-readable action metadata from the exact payload that the signer receives.
Do not claim the user reviewed domain, chain, verifying contract, types, message,
spender, or amount unless the public API exposes those exact fields before
signing. When a helper hides them, document that boundary and either use a
policy-wrapped signer that validates the exact payload or select a source-backed
mode that disables hidden signature requirements.

For snippets:

- Use fake recipients such as `0xRecipient...`, not real addresses unless they
  are canonical contract addresses required for context.
- For a verified server secret, use a server-only environment variable such as
  `process.env.PROVIDER_API_KEY`. For a provider-documented public/publishable key,
  use the source-backed browser or server configuration mechanism and label its
  classification; do not imply secrecy by forcing a Node-only environment shape.
  Do not paste exchanged short-lived tokens; show the supported exchange/refresh
  path only when it is part of the public API.
- Never include seed phrases, private keys, bearer tokens, real API keys, or
  customer identifiers.
- Use `bigint` literals for on-chain integer amounts when source examples do.
- State units near amounts: wei, satoshis, lamports, nanotons, sun, octas, or
  token base units.
- If an example is pseudocode, label it explicitly, use a `text` fence, and
  avoid copy-pasteable imports or plausible concrete error names.
- A `js`, `javascript`, `ts`, `typescript`, `jsx`, or `tsx` fence promises
  syntactically valid code or valid declarations. Wrap runnable fragments in a
  function when they use `return`; express signatures as valid `declare class`,
  `interface`, or `type` declarations. Use `text` for partial control flow or
  signature notation.
- Clean-consumer validation must exercise each executable fence, not one similar
  smoke example. Confirm class-versus-factory invocation, imports, config shape,
  async usage, and the selected dependency graph for that exact fence.
- A write fence must contain its own review and confirmation gate. Introductory
  prose outside the fence is not sufficient for copy-paste safety. Error and
  status examples must consume an existing error, result, receipt, or hash; they
  must not submit a new operation merely to demonstrate handling.

Choose one source-matched flow shape before drafting. Combine shapes only when
one public journey actually combines them:

| Source shape | Minimum safe order |
|---|---|
| Read-only | Construct if needed; read; validate schema/units/freshness; handle missing or stale data. |
| Direct write with no quote/prepare helper | Build exact caller-owned arguments; show fields/effects/fees available before the call; confirm; invoke once; verify the source-backed completion layer. |
| Quote or requirements plus write | Quote/collect requirements; show returned review fields; confirm; satisfy verified requirements; execute; persist the final result rather than assuming the preview is binding. |
| Prepare/reserve plus execute | Prepare; persist resumable ID and exact prepared payload; inspect/confirm; authorize if separate; execute; reconcile or recover. |
| Provider URL or external handoff | Build and confirm the intended provider request; create the URL/session/action; hand off; state that local URL generation does not itself move funds; reconcile only through source-backed status/webhook paths. |
| Asynchronous submission | Confirm; submit once with verified idempotency behavior; persist the operation ID; poll or process verified events; stop on terminal, intervention, indeterminate, or timeout states. |

The following deliberately non-executable variants are shape tests, not APIs.
Use only the matching variant and replace every placeholder from source:

```text
PSEUDOCODE - DO NOT PUBLISH

READ_ONLY
value = await <READ_METHOD>(<VERIFIED_OPTIONS>)
validate <SCHEMA_UNITS_FRESHNESS_AND_MISSING_DATA_RULES>

DIRECT_WRITE
request = <CALLER_OWNED_ARGUMENTS>
show <SOURCE_AVAILABLE_EFFECT_FEE_AND_DESTINATION_FIELDS>; confirm
result = await <DIRECT_WRITE_METHOD>(request)
verify <SOURCE_BACKED_COMPLETION_LAYER>

QUOTE_OR_REQUIREMENTS_THEN_WRITE
preview = await <QUOTE_OR_REQUIREMENTS_METHOD>(<OPTIONS>)
show <SOURCE_VERIFIED_REVIEW_FIELDS>; confirm
result = await <WRITE_METHOD>(<OPTIONS_AND_VERIFIED_REQUIREMENTS>)
persist <FINAL_EXECUTION_FIELDS>

PREPARE_THEN_EXECUTE_OR_ASYNC_SUBMIT
prepared = await <PREPARE_METHOD>(<OPTIONS>)
persist <RESUMABLE_ID_AND_PREPARED_FIELDS>; show exact fields; confirm
result = await <EXECUTE_OR_SUBMIT_METHOD>(prepared)
track only when source exposes status/events; stop on terminal, intervention, indeterminate, or timeout states

PROVIDER_HANDOFF
request = <SERVER_OWNED_VERIFIED_INTENT>
show <HANDOFF_ASSET_AMOUNT_RECIPIENT_REFUND_AND_PROVIDER_FIELDS>; confirm
handoff = await <URL_SESSION_OR_ACTION_METHOD>(request)
persist <PROVIDER_CORRELATION_FIELDS>; do not claim this call moved funds
```

When a snippet creates an account or manager from a seed phrase, private key, or
other secret material, verify what `dispose()` actually clears. Where explicit
seed cleanup matters, use caller-owned mutable `Uint8Array` input, call the
source-backed disposal methods, and zero the caller-owned bytes with `fill(0)`
in `finally`. Do not imply that JavaScript strings can be reliably wiped. If the
complete lifecycle cannot be shown safely, label the snippet as a
non-executable fragment and link directly to cleanup guidance.
Also trace ownership containers: whether a manager caches accounts, whether
disposing an account evicts that cache entry, and whether requesting the same key
or derivation path can return a disposed instance. Document the supported
recreation sequence instead of assuming per-account disposal resets the manager.

## Configuration Page Rules

Configuration pages must include:

- Creation or initialization shape: source-select constructor, callable factory,
  static creator, dependency injection, or no construction step.
- Required and optional config fields.
- Defaults, units, and timeout/retry behavior.
- Runtime requirements such as RPC endpoints, provider APIs, account types,
  storage directories, key handling, indexers, or service credentials.
- Security notes for API keys and server-side secrets.
- Source-backed runtime, origin/redirect, credential scope/expiry/rotation, and
  redaction constraints for authenticated endpoints.
- Chain-specific endpoint rules when the provider requires a precise base URL.
- Fee cap semantics and units.
- Unsupported config combinations.
- Omitted config, malformed top-level values, malformed nested values, and the
  exact error class or raw runtime error each path exposes. Do not generalize a
  custom configuration error beyond the branch that actually throws it.
- Whether config is copied, normalized, frozen, or retained by reference; which
  fields are read once versus per operation; and whether endpoint, signer,
  credential, token, or policy rotation requires a new client/account/manager.
- Operation-specific option behavior. Do not claim an option applies to a method
  only because a shared type name or README table suggests it; verify each
  method implementation passes or enforces that option.

Do not use placeholder provider URLs that look real unless they are official
public endpoints. Use `process.env.*` only for verified server secrets in a
server runtime. Use the provider-documented configuration shape for public or
publishable keys, and plain placeholders only in non-executable tables.

## API Reference Rules

API reference pages should be source-derived and compact. Include:

- Package name and import examples.
- Exports and default export.
- Creation or initialization signatures: constructor, factory, static creator,
  injected instance, or no construction step, exactly as exported.
- Account compatibility table when read-only, writable, smart account, or no-account modes differ.
- Method table with exact method names.
- Detailed sections for high-risk or user-facing methods.
- Config types with exact keys and optionality.
- Options and return types.
- Error classes and when they are thrown.
- Exact propagation boundaries: which errors are caught, translated into
  structured results, wrapped, rethrown, or allowed to escape raw. Executable
  consumers need a final unknown-error branch unless source proves a closed
  public error union.
- Status mapping and fee mapping for route providers.
- Idempotency-key scope, request binding, retention, conflict, replay, and retry
  behavior when a write method accepts a key.
- Status transition, finality/reorg, terminal precedence, and reconciliation
  semantics when operations settle asynchronously.
- Method-specific requirement taxonomy: approvals, permits, signatures,
  authorizations, prerequisite transactions, and which helper emits each one.
- Operation-specific option matrix when shared option types hide differences
  between methods.
- Limitations and unsupported inherited methods.

Determine page ownership before editing. An ignore rule or workflow name alone
does not prove that the current module is generator-owned. Inspect the current
generator implementation/configuration and the page's history:

- For a generator-owned module, update the supported generator input or source
  mapping and regenerate; do not hand-edit output that the next run replaces.
- For a manually maintained community/provider reference, author the page from
  exact public exports and ensure it is intentionally included at PR handoff.
- If the current base has a workflow but no usable generator implementation or
  module mapping, quarantine that API-reference page and ask a maintainer which
  ownership model applies. Continue independently verifiable non-reference pages
  only when the route, navigation, direct-entry links, and requested scope remain
  coherent. Mark the result incomplete and not PR-ready. Stop the whole task only
  when the missing page breaks that contract or the task explicitly requires a
  complete deliverable.

Do not document private helpers as public APIs. Declarations establish only the
compile-time return shape. Verify runtime field presence and semantics from the
exact-version JavaScript and tests; examples are supporting evidence only.

Before rewriting an existing reference, inventory every baseline heading slug,
explicit ID, and repository inbound `route#fragment` link. Record each fragment's
API symbol or reader concept. Preserve the heading or place
`<span id="old-fragment"></span>` immediately before that same semantic
section. Use adjacent HTML IDs for compatibility aliases because the renderer
and repository link checker do not share one trailing heading-ID syntax. Do not
use trailing `[#old-fragment]` or `{#old-fragment}` syntax. An alias beside a
different constructor, overload, method, or concept
is a compatibility failure even when link checking passes. Review the mapping
manually after automated fragment-existence checks.

Preserve semantic heading hierarchy as well as fragments: the page title is the
effective H1, major sections use H2, and child levels must not skip directly to a
deeper level. A surviving anchor does not excuse a malformed table of contents.

Use valid TypeScript declarations for signatures in TypeScript fences. If a
signature is only notation, put it in a labeled `text` fence. Do not publish an
expression-shaped signature that cannot be parsed as TypeScript.

Nested `api-reference.mdx` files are ignored by the repository's generated-file
rules. Existing pages remain tracked, but a new manually authored API reference
can render locally without appearing in a PR. Before handoff, verify each new or
moved page with the validator's `--pr-ready` mode. For a page absent from `HEAD`,
`git diff --cached --name-only --diff-filter=A -- <path>` must show an actual
staged addition; `git add -N` intent-to-add is insufficient. During explicit PR
staging, manually authored pages may need an intentional force-add; do not weaken
the repository-wide ignore rule merely to make one page visible.

Excluding an API reference from generation or MDX validation does not make its
published route safe. `QUARANTINED` is an incomplete diagnostic state and must
fail PR readiness while the page remains routed, linked, or unresolved. An
external regular evidence file is mandatory for every `--pr-ready` run:

| Policy | Use |
|---|---|
| `IN_SCOPE` | This task owns and source-validates the API reference. |
| `NOT_APPLICABLE` | No API-reference route or file is in this task's scope. |
| `QUARANTINED` | Ownership or validation is unresolved; PR readiness must fail. |

Pass it with `--api-reference-policy=/absolute/path/api-reference-policy.txt`.
The validator checks policy spelling, file safety, tracking, and quarantine
failure; it does not authenticate the ownership assertion. Keep approval and
evidence review external. Do not use an ambient variable that can drift from the
file. A task that changes an API reference cannot truthfully use
`NOT_APPLICABLE`.

A skill-only installation in a Git checkout may combine `--skill-only`,
`--pr-ready`, and the same policy file to enforce policy and tracking while the
manual is absent. That mode validates only the skill, validator, policy, and
repository API-reference tracking; it does not claim that the omitted human
guide or partner journey was reviewed.

## Wallet Module Rules

Full wallet docs should cover:

- Overview.
- Usage.
- Configuration.
- API reference.
- Getting started.
- Account management and derivation paths.
- Balances, including token or paymaster balances when present.
- Native sends when supported. Disclose unsupported inherited sends in the
  overview, API reference, and error/limitations guidance; add a dedicated page
  only when an expected reader journey or documented alternative justifies it.
- Token transfers when the public method performs a transfer. An inherited
  method that only throws does not justify a token task page.
- Signing and verification when exposed.
- Error handling, fee caps, and cleanup.
- Special chain guides when the module has distinct workflows.

Required wallet safety points:

- Quote native sends with `quoteSendTransaction()` before `sendTransaction()`
  when available.
- Quote token transfers with `quoteTransfer()` before `transfer()` when available.
- Explain `dispose()` for accounts and managers that own secret material.
- Mention `toReadOnlyAccount()` or read-only account classes when docs show read-only flows.
- Separate `transferMaxFee`, `transactionMaxFee`, gas sponsorship, paymaster
  tokens, and provider fee models.
- Verify fee-cap enforcement order. State whether the cap is checked during
  quote only, before signing, before broadcast, after broadcast, or not by the
  write method.
- Document stateful quote cache keys, TTL, one-shot behavior, nonce/concurrency
  checks, requote triggers, and which final fee or operation the write uses.
- Document unsupported inherited methods for gasless/gasfree variants.

Variant naming must be derived from the current rendered tree, chooser, exact
package spelling, and source terminology on every task. Current examples are
orientation, not an exhaustive registry:

| Naming decision | Rule |
|---|---|
| Base wallet beside variants | Use `Standard <chain>` only when the current group needs to distinguish the base implementation. |
| Gas sponsorship | Preserve the source-backed term exactly: `gasless` and `gasfree` are not interchangeable. Keep existing route/package spelling stable. |
| Smart-account standard | Use the established protocol/account-model label, such as the current ERC-4337 or EIP-7702 grouping, and preserve existing URLs. |
| New variant | Derive the label from its account, authority, fee-payer, or execution model; do not extrapolate a suffix from another chain. |

Chain-specific warnings are required when derivation, fee payer, endpoint,
service, signer, delegation, initialization, or token model differs from the
base wallet interface.

Examples of required warnings:

- EVM `sendTransaction({ data })` can execute arbitrary contract calldata.
- ERC-4337 and EIP-7702 flows may batch or delegate execution.
- Solana accounts may need rent-exempt balances and token account creation.
- Gasless Solana paymaster configuration must match source behavior.
- TON `payload` can call contracts; TON gasless native sends are unsupported.
- TRON fee behavior uses energy and bandwidth; gasfree TRC20 transfer rules differ.
- Bitcoin has no WDK token transfer support in the base wallet.
- Spark has Lightning, deposit, withdrawal, and invoice write methods that need confirmation.
- Aptos-style Ed25519 derivation requires hardened path rules when source verifies it.

## Protocol and Provider Rules

### Decision-Steering Outputs

Apply this section across every module family when an output selects, scores,
allows, denies, authorizes, prioritizes, or materially steers a later action. Do
not apply it to a purely observational result that the documented flow does not
use for a decision.

Always source-verify and document:

- Whether the output is advisory or binding and which actor enforces it.
- Returned reasons or evidence, unknown-value semantics, decision/evaluation
  time, expiry or staleness bounds, fallback behavior, and revalidation triggers.
- Which later action consumes the output and why the output is not itself
  execution authorization when another live check or signer controls the write.

Document these only when the system actually has or is expected to have them:

- Rule, policy, or model identity/version and effective-time semantics.
- Human review, override, escalation, or appeal.
- Audit and correlation fields, access, and retention.
- Sensitive input/output collection, transport, storage, disclosure, and deletion.

Use `not applicable` when a control genuinely does not belong to that output.
Use `unavailable` or `opaque` as a limitation only when the control is relevant
but source or official provider evidence shows it is absent or undisclosed. Do
not invent a governance process for a deterministic route or price result.

### Swidge Providers

Swidge is the preferred route interface for new providers that can quote and
execute swap-only, bridge-only, or combined routes.

Swidge docs must cover:

- `getSupportedChains()` and `getSupportedTokens(options?)` for discovery.
- Provider-owned route support as runtime/provider data.
- `quoteSwidge(options)` before `swidge(options, config?)`.
- Required account type for execution.
- Read-only and no-account modes if supported.
- Required approvals, source payments, signatures, or transaction requirements.
- Fee caps such as `maxNetworkFeeBps` and `maxProtocolFeeBps` when supported.
- Status tracking with `getSwidgeStatus(id, options?)`.
- Async settlement behavior and recovery gaps.
- Provider API keys, rate limits, timeout/retry settings, and endpoint config.
- Provider docs links only where they help explain route support or setup.

Status examples must be source-backed. Include every status the package maps as
terminal or intervention-required, add timeout/backoff behavior, and avoid
inventing statuses from provider docs unless the package returns them. If a
status means user or operator action is needed, break the polling loop and show
what should be surfaced for recovery.

The shared `SwidgeQuote` contract is non-binding. State that unconditionally,
even if one provider appears to reuse a route. Require execution-time caps and
persistence of the actual `SwidgeResult`. Document a stronger provider
guarantee only as supplemental, version-matched evidence; it does not make the
shared preview binding.

### Standalone Swap and Bridge

Use standalone swap or bridge page sets only when the source exposes a standalone
protocol interface that should remain user-facing. Otherwise prefer Swidge.

Standalone swap docs must include quote, approve/allowance behavior, swap
execution, fee caps, supported wallet account types, route/source tokens, and
error handling.

Standalone bridge docs must include quote, approval or source payment
requirements, bridge execution, target-chain behavior, status/receipt tracking,
supported source/destination chains, token address rules, and recovery limits.

### Lending

Lending docs must include:

- Protocol setup and supported account types.
- The protocol's actual pool, market, vault, reserve, asset, or target model.
- Configuration targets and presets only when the public API exposes them.
- Requirements helpers for approvals, permits, signatures, authorization, or
  prerequisite transactions when the package exposes those helpers. Otherwise
  document the exact wallet/account preparation flow.
- Quote helpers before write actions when available; otherwise state how fees,
  rates, health, and transaction effects can be reviewed before execution.
- Supply, withdraw, collateral, borrow, repay, mode, and collateral toggles only
  when supported.
- Position, balance, rate, and health reads only when exposed.
- Liquidation, health factor, stale state, interest accrual, slippage, and allowance caveats.
- Operation-by-operation option semantics. Verify which methods enforce
  slippage, max fee, recipient/on-behalf-of, native amount, deadline, and
  requirement signatures.
- `amount: "max"` or equivalent live-state writes. Document what state is read
  at execution time, which approval target is used, how stale requirements can
  fail, what slippage protects, and whether residual tokens are returned.
- Requirement taxonomy by helper method. Do not imply an approval, permit,
  signature, authorization, or transaction requirement can appear for a flow
  unless that helper emits it.

### Fiat

Fiat docs must include:

- Provider account/API requirements.
- Server-side signing or secret-key handling.
- Quote methods before widget or signed URL generation when available.
- Buy/sell flows and custom recipient/refund fields.
- Supported assets, fiat currencies, countries, and provider-owned availability.
- Status and transaction management when available.
- Clear statement when WDK generates a provider URL rather than moving funds directly.

### Pricing and Read-Only Data Providers

Pricing and other read-only provider docs must cover:

- Provider setup, credentials, base URL, runtime, and peer provider package.
- Asset identifier and chain/network mapping performed by the package.
- Current, historical, batch, pagination, or interval methods only when public.
- Units, precision, timestamp semantics, missing-data behavior, and return shape.
- Rate limits, cache behavior, retries, timeout, and provider error mapping when
  source or official provider docs define them.
- Exact transitive cache/failover helper semantics when the WDK journey promotes
  those helpers, including cache-key encoding/collisions and rejected-error versus
  fulfilled-null/empty failover behavior.
- A self-contained install/import/construct/read path for each promoted provider
  wrapper or failover/caching integration; otherwise keep it out of the promised
  capability list and link only to separately verified applicable guidance.
- Provider-owned asset and network availability as live or external data, not a
  permanent WDK support claim.
- Whether the package performs read-only HTTP requests and therefore does not
  sign transactions or move funds.
- Data provenance, schema/version validation, freshness at decision time,
  unknown-value handling, and fail-closed or fallback behavior.
- Whether results are observational or can select, allow, deny, score, or route a
  later financial action. Catalog membership and capability labels are not
  execution authorization; revalidate live support and policy before a write.
- The cross-family decision-steering rule above when downstream code consumes a
  result to choose, authorize, block, score, prioritize, or route an action.

Do not import write-flow boilerplate into a read-only module merely because
other provider docs contain it. Read-only modules still need exact error,
credential, availability, and data-freshness guidance. A package can be
read-only and still be high-risk control-plane infrastructure when applications
trust its output to authorize or steer fund-moving operations.

### Provider Suites

Provider suites can use one landing page when the reader journey is shared, but
the page must map each package to:

- Source chain or provider role.
- Required peer wallet.
- Required peer dependencies from exact package metadata.
- npm package and source path.
- Supported methods.
- Differences in config and runtime requirements.
- Limitations or unsupported routes.
- A direct first-use path or an explicit source-backed reason that only
  reference material can be provided.

If the suite has different constructors, option names, return shapes, or safety
requirements per package, split into separate pages or sections.

A one-page suite must give every independently installable adapter an anchored,
direct-entry setup and read/quote path where source supports one. A table plus an
example for only one adapter is insufficient. Use child pages when adapters have
different prerequisites, wallet peers, trust boundaries, confirmation fields,
or recovery; keep the suite page as the shared map.

Do not assume every source-chain package uses the standard WDK wallet peer. If a
package declares a provider fork or custom wallet peer, document that exception
in the install, package-suite, and example sections.

### Catalog-Only Integrations

A catalog-only row must match the current Community Modules feed schema: module,
category, one source-backed capability sentence, and public documentation
destination. Keep verified maintainer identity in the evidence and coordination
record. Verify that the destination actually explains installation and API use.
Do not create an empty local overview merely to obtain a docs URL.

Promote a catalog-only integration to a local page set when readers need WDK-
specific setup, safety guidance, API mapping, or cross-links that the public
destination does not provide. Apply the normal release, evidence, disclaimer,
and IA rules after promotion.

## IA and Navigation Rules

Before writing, decide ownership, functional family, page depth, canonical URL,
and sidebar placement separately. Ownership controls responsibility treatment
and community cross-listing; capability controls functional placement; risk and
journeys control page depth; the rendered tree controls sidebar discoverability.
Within this repository, community cross-listing means the Community Modules
section in `content/feeds/all-modules.md`. Coordinate the external Building
Blocks catalog separately because its source is outside this repository.

| Module | Canonical placement |
|---|---|
| WDK-maintained wallet | `content/docs/sdk/wallet-modules/<route>/` under `Wallets`. |
| Independently maintained wallet, at any risk/page depth | Preserve an existing approved route. New community-wallet routes use `content/docs/sdk/community-modules/<route>/` unless maintainers explicitly approve promotion to another canonical wallet path. |
| Swidge provider, any ownership | `content/docs/sdk/swidge-modules/<route>/` under `Swap and Bridge`; independently maintained providers are cross-listed through `content/feeds/all-modules.md`. |
| Standalone swap, any ownership | `content/docs/sdk/swap-modules/<route>/` under `Swap and Bridge`; community ownership adds feed/catalog cross-listing, not a second canonical page. |
| Standalone bridge, any ownership | `content/docs/sdk/bridge-modules/<route>/` under `Swap and Bridge`; community ownership adds feed/catalog cross-listing, not a second canonical page. |
| Lending provider, any ownership | `content/docs/sdk/lending-modules/<route>/` under `Lending`; community ownership adds feed/catalog cross-listing. |
| Fiat provider, any ownership | `content/docs/sdk/fiat-modules/<route>/` under `On-ramp and Off-ramp`; community ownership adds feed/catalog cross-listing. |
| Pricing/data provider, any ownership | `content/docs/sdk/pricing-modules/<route>/` plus a relevant tooling cross-link when it serves that journey. |
| Same-family provider suite | The approved functional family, with one suite map and child pages/sections justified by package roles and divergent journeys; do not invent a generic suite root. |
| Multi-family provider suite | Maintainer-approved canonical map plus functional destinations. Create no route until ownership of each journey and stable URLs are approved. |
| Catalog-only integration | No local module route or sidebar node; edit only the approved aggregate feed and separately coordinated public catalog. |
| New-family candidate | Maintainer-approved canonical path based on user intent; do not invent a folder by analogy. |

Preserve the exact slug for an existing route. A new route slug and every suite
map require explicit approval; do not derive them automatically from package or
provider names.

Navigation checklist:

- Add files only under the canonical path.
- Preserve existing URLs when updating an existing module.
- Update `src/lib/custom-tree.ts` when the page should appear in the rendered sidebar.
- Order applicable family sections as Usage, Guides, Configuration, API Reference,
  then supplemental Reference; omit missing sections without changing this order.
- Do not update `src/lib/custom-tree.ts` for files under
  `contributing/wdk-community-module-docs/`, skill files, or other non-rendered
  authoring artifacts.
- Update functional index pages such as `swidge-modules/index.mdx`, `lending-modules/index.mdx`, or `wallet-modules/index.mdx` when they enumerate providers.
- Update `content/feeds/all-modules.md` when a package belongs in the repo-owned
  aggregate feed. Independently maintained packages need a Community Modules
  row; add a functional feed row only when the current family section is designed
  to list community ownership or maintainers separately approve that expansion.
- Coordinate the canonical Building Blocks catalog separately. Do not recreate
  the retired `all-modules` or Community Modules index routes.
- After changing the feed, run `npm run sync:all-modules-feed` and inspect the
  tracked `public/llms-full.txt` update.
- Update `wallet-modules/which-wallet-module.mdx` and `src/components/wallet-module-chooser.tsx` when a wallet should be part of the decision journey.
- Reconcile every direct-entry aggregate that claims to enumerate the family;
  sidebar presence or one catalog row does not make a stale family index correct.
- Every capability promised by an overview, chooser, catalog, or aggregate must
  lead to a self-contained applicable journey. A promoted helper integration
  needs exact install/import/construct/use guidance and source-checked adjacent
  pages, or the promise must be narrowed or removed.
- Add redirects only when changing or replacing an existing URL.
- Verify the PR edits the current rendered docs tree. Changes to legacy paths
  such as `SUMMARY.md` or root `sdk/**/*.md` do not update the current Fumadocs
  site unless they are ported into `content/docs/**` and `src/lib/custom-tree.ts`
  where needed.

Every page must work as a direct search entry and offer a useful next action.
An exit is required only when that destination exists and applies; a compact
overview must contain any omitted setup/first-use journey itself.

| Current page | Required exits |
|---|---|
| Overview | Compact: API reference and relevant source/provider destination. Standard/high-risk: getting started or usage, focused guides, configuration, and API reference in reader order. |
| Usage hub | Getting started when separate, task guides in workflow order, configuration, API reference, limitations/cleanup. |
| Complete-flow usage | Configuration, API reference, recovery/error guidance, and overview. |
| Configuration | Getting started or usage, API reference, and the task most affected by configuration. |
| API reference | Usage/getting started, configuration, high-risk task guides, and limitations/errors. |
| Task guide | Prerequisite page, relevant API/config section, next workflow step, and recovery/error page when applicable. |

Use existing Card components or concise inline links according to adjacent page
style. Avoid circular "next" labels that do not name an outcome, dead-end pages,
and duplicate full workflows across a hub and its guides.

## External Link Rules

Use external links when they help the reader verify package/source/provider
context:

- npm package page for released packages.
- Public source repository or monorepo package path.
- Official provider docs for API keys, supported chains, route availability,
  rate limits, status values, or provider-specific setup.
- Community maintainer website/profile in catalog rows.

For a new or changed link, prefer the canonical final HTTPS destination rather
than a known redirect. Provider-owned operational guidance that changes the
default setup must also be summarized at first use; a link alone is not the
limitation.
Preserve or add the most useful specific public destination for each claimed
task, such as provisioning/console, supported routes/chains, or source. Do not
replace a working task-specific link with a marketing homepage. Existing links
are evidence inputs: review whether deleting one strands a reader journey.

Do not force provider docs links onto every page. Do not link to private PRs,
internal review threads, private issue trackers, local files, or temporary
validation artifacts.

Verify every new or changed external destination separately from the
deterministic repository link gate. Open it in a browser or use an appropriate
public client, follow redirects, confirm the final canonical destination, and
check that it supports the nearby claim. Record blocked network/automation as
`unverified/blocked`, not as a dead link. If an npm web page rejects automated
requests, use exact registry metadata and tarball retrieval for package truth and
still review the human-facing URL when possible.

## Public Language Rules

Use direct, factual wording:

- "The package exposes..."
- "The module requires..."
- "Call `getSupportedChains()` at runtime..."
- "The provider controls live route availability..."
- "The provider controls live availability; handle an empty result at runtime."

Avoid unsupported or promotional wording:

- "seamless"
- "secure"
- "best"
- "production-ready"
- "fully supported"
- "official" for community-maintained packages
- "Tether-maintained" unless source ownership proves it

For independently maintained packages, say "community module" or
"independently maintained module" and include the responsibility callout.

## MDX and Compatibility Rules

Use the current adjacent component style. A safe card group is:

```mdx
<Cards>
<Card title="Get Started" href="/sdk/<verified-route>/guides/get-started">
Complete the verified first-use workflow.
</Card>
</Cards>
```

Replace the route and text from current IA. Keep `<Cards>` and `<Card>` tags
balanced, use root-relative rendered routes, and do not put a card inside
another card.

GFM tables inside MDX have stricter delimiter behavior than prose:

- Escape every literal union pipe in a cell as `\|`, including inside inline
  code.
- Put type expressions in backticks. Do not leave raw generic notation such as
  `<T>` or raw object notation such as `{ field: string }` in a cell.
- Move multiline declarations, object shapes, JSX, and complex unions to a
  fenced block below the table.
- Keep the same number of unescaped delimiters in every row.
- Treat `npm run build` as the final parser authority; a passing link check does
  not prove that MDX compiled.

For an existing page, create a private compatibility ledger before editing:

| Baseline route and fragment | Baseline symbol or concept | Candidate location | Result |
|---|---|---|---|
| `/sdk/<route>#<fragment>` | Exact creation API, method, type, or reader concept | Same heading or explicit ID immediately before the same concept | preserved / redirect decision / blocked |

Inventory baseline heading slugs and explicit IDs even when no repository link
currently points to them; external bookmarks are not visible to the link
checker. Search the whole repository for inbound fragments, then run the
changed-MDX validator after the output is frozen. That validator checks
frontmatter, parsed ATX/Setext/MDX heading hierarchy, duplicate body H1 and
explicit/generated IDs, table structure, executable-fence syntax, and exact-case
lexical fragment preservation with physical-line diagnostics. Frontmatter titles
are not anchors unless the renderer explicitly assigns an ID. The gate fails closed on deleted,
renamed, or type-changed MDX; route changes require an operator-supplied
redirect/removal decision and semantic ledger. It cannot authenticate approval
or prove semantic destination, so maintainer and ledger review remains mandatory.

After independently confirming maintainer approval for a deletion or rename,
keep a JSON route-decision manifest outside the repository and pass its absolute
path to the validator. Do not commit this private validation input or link it
from rendered docs. The Boolean below records the operator's assertion; it is not
an authenticated signature. A rename record has this shape; include one
`fragments` entry for every baseline fragment exported by the validator:

```json
{
  "version": 1,
  "baseCommit": "<FULL_APPROVED_BASE_COMMIT>",
  "decisions": [
    {
      "kind": "rename",
      "oldPath": "content/docs/sdk/old-route/index.mdx",
      "newPath": "content/docs/sdk/new-route/index.mdx",
      "operatorAssertedMaintainerApproval": true,
      "rationale": "Approved canonical route migration.",
      "redirects": [
        { "source": "/sdk/old-route", "target": "/sdk/new-route", "status": 301 }
      ],
      "fragments": {
        "old-fragment": {
          "semantic": "<EXACT_BASELINE_SEMANTIC>",
          "disposition": "preserved",
          "targetPath": "content/docs/sdk/new-route/index.mdx",
          "targetFragment": "old-fragment"
        }
      }
    }
  ]
}
```

For an approved deletion, use `kind: "delete"`, omit `newPath`, and choose one
coherent policy. With an exact old-route `301` in `_redirects`, mark every
baseline fragment `preserved`, keep the exact fragment spelling, and point it to
an MDX path whose route is that redirect target. Without a redirect, provide a
nonempty `removalReason` and mark every baseline fragment `retired` with its own
reason. Do not claim a fragment rename through an HTTP path redirect: URL hashes
are not sent to the server, so `/old#legacy` reaches `/new#legacy`, not a declared
`#different` mapping. A tested client-side hash rewriter would require a separate
maintainer-approved mechanism and validator support; this manifest does not allow
one.

The validator checks manifest structure, base commit, Git change, exact redirect,
baseline semantic text, same-spelling fragment preservation, and target-anchor
existence. It does not authenticate maintainer approval. Retain immutable or
signed approval evidence privately, verify it independently before invoking the
gate, and review semantic destination manually.

In an isolated regeneration test, the generation role must not run the
base-comparison mode because it can read the deleted original. Close the
generation role, freeze its output, and let an independent evaluator run the
compatibility check.

## Snippet Review Checklist

Before publishing any code fence:

- Imports match public exports.
- Package names match verified npm/source metadata.
- Public install commands include every directly imported non-built-in package.
- Public install commands pin exact verified prerelease versions when documenting
  prerelease packages.
- New or changed prerelease install snippets follow that pinning rule. Existing
  unpinned legacy examples are migration candidates, not permission to copy the
  pattern or a requirement to edit unrelated pages.
- Constructor arguments and config keys match source/types.
- Every class constructor is invoked with `new`; callable factories are verified
  as functions. The exact fence passed clean-consumer type-check and the scoped
  secret-free runtime smoke promised by its readiness state.
- Method names, option keys, return fields, and error names are exact.
- Option applicability is verified per method implementation, not inferred from
  shared type names alone.
- Async behavior is clear: what resolves immediately, what settles later.
- Documentation readiness is `runnable`; otherwise executable setup is replaced
  fence-by-fence with labeled `text` reference-only or draft-only guidance.
- Quotes, requirements, fee caps, slippage, and status loops document whether
  they are pre-write, post-write, non-binding previews, or final execution data.
- Status polling includes terminal and intervention-required states from the
  package mapper, plus timeout/backoff behavior.
- Amount units are stated.
- No secrets, seed phrases, private keys, or real auth values.
- Write snippets include every source-exposed preparation phase and user review;
  do not invent a quote or requirements helper when none exists.
- Every executable write fence is independently safe: it contains preparation,
  review fields, confirmation, submission, and exact success verification.
  Otherwise it is a labeled `text` fragment.
- Transaction, PSBT, UserOperation, and delegation signing fences review
  chain/domain, sender, recipient, asset/value, calldata/instructions, fees,
  nonce, expiry, replay scope, encoding, and downstream relay authority before
  confirmation; a signing-only example does not need to broadcast.
- Message or typed-data signing fences review domain, human-readable intent,
  every field, audience, expiry, nonce, replay scope, signature encoding, and who
  can use or submit the signature before confirmation.
- Approval snippets avoid unlimited allowance unless source and safety context require it.
- Status polling examples use source-backed status IDs and methods.
- Cleanup uses `finally` in executable snippets where accounts/managers own
  secret material.
- Cleanup verifies disposal semantics and zeroes caller-owned mutable seed bytes
  when explicit seed cleanup matters; it never claims a JavaScript string was
  wiped.
- Provider-owned security wording, such as API-key scopes and history access,
  preserves the provider's exact public meaning.
- Pseudocode is labeled as pseudocode and not mixed with copy-pasteable imports.
- Every JavaScript/TypeScript fence parses in the declared language; API notation
  is a valid declaration or a labeled `text` fence.
- Receipt and status examples distinguish inclusion, execution success, nested
  operation success, provider settlement, timeout, and indeterminate outcomes
  when those layers exist.
- Status examples use source-backed transitions, finality/reorg rules, terminal
  precedence, and polling/webhook/receipt reconciliation authority.
- Idempotent write examples reuse one persisted key for one immutable intent and
  follow source-backed scope, expiry, conflict, concurrency, replay, and retry
  semantics.
- Credentialed examples enforce the verified runtime and HTTPS origin/redirect
  policy, distinguish public from secret keys, describe any token exchange/cache,
  and never expose long-lived server secrets to browser code or logs.
- Transitive helper claims trace to the exact installed helper and disclose
  cache-key collisions, failover/error/null behavior, retries, and scope where
  user-visible.
- Error guidance follows every catch/wrap/structured-result/raw escape boundary
  and retains an unknown-error branch unless the public error set is closed.
- Caller-owned config mutation and manager/account disposal-cache interactions
  are tested and documented when those lifecycle boundaries exist.
- Server-side signing constructs payloads from an authorized server-owned
  intent, and provider returns are correlated idempotently with that intent.

## Validation

The complete repository package uses the default artifact-validator mode. An
intentional standalone-skill installation without this manual or the operator
guide uses `validate-artifacts.mjs --skill-only`; that fallback validates the
skill and script only and does not replace this authoring contract. Validator
self-tests and executable JavaScript/TypeScript fence checks require the
workspace `typescript` dependency. MDX and base-comparison modes require the
repo-locked `github-slugger` dependency so fragment checks match rendered
headings.

For edit-mode tasks, check tracked and untracked authoring files. Plain
`git diff --check` does not inspect new untracked files.

```bash
git diff --check

git ls-files --others --exclude-standard -z -- '*.md' '*.mdx' |
while IFS= read -r -d '' file; do
  whitespace_errors="$(git diff --no-index --check /dev/null "$file" 2>&1 || true)"
  if [ -n "$whitespace_errors" ]; then
    printf '%s\n' "$whitespace_errors"
    exit 1
  fi
done

```

When the complete workspace skill package is installed, also run its
deterministic artifact validator:

```bash
node skills/wdk-community-module-docs/scripts/validate-artifacts.mjs
node skills/wdk-community-module-docs/scripts/validate-artifacts.mjs --self-test
```

The default command validates package paths, skill frontmatter, same-file
Markdown anchors, and whitespace in the four authoring artifacts. `--self-test`
also exercises titled-fence parsing, invalid TypeScript rejection, escaped table
pipes, and explicit anchors. It requires the workspace TypeScript dependency.
Neither command replaces the site link checker or build.

In a history-free generation snapshot, validate only the current target pages:

```bash
node skills/wdk-community-module-docs/scripts/validate-artifacts.mjs \
  --validate-mdx="$TARGET_DOCS_DIR"
```

This mode reads no Git base and checks current frontmatter, body H1s, same-page
anchors outside fenced examples, tables, authoring markers, executable-fence
syntax, symlink/special-path exclusion, and whitespace. It does not check
baseline fragments or API semantics. If executable fences exist in a stripped
fixture, expose `typescript` only from the declared scratch dependency tree and
remove that tree before the final manifest.

When rendered MDX changed, run the changed-page gate from a normal edit worktree
or from the independent evaluator in a regeneration test:

```bash
node skills/wdk-community-module-docs/scripts/validate-artifacts.mjs --docs-changed --base=HEAD
```

Use the actual approved comparison ref instead of `HEAD` when the branch base is
different. This mode requires the workspace's TypeScript dependency. It checks
required frontmatter, newly introduced or duplicate body H1s, GFM table
delimiters and raw MDX hazards in table cells, JavaScript/TypeScript fence syntax,
and baseline fragment existence. It does not type-check package APIs and cannot
verify that a preserved fragment still describes the same symbol; source review
and the semantic compatibility ledger remain required.

For an approved route migration, add the external decision manifest:

```bash
node skills/wdk-community-module-docs/scripts/validate-artifacts.mjs \
  --docs-changed --base="$BASE_SHA" \
  --route-decisions=/absolute/private/route-decisions.json
```

Without that option, every MDX deletion or rename fails closed. The manifest
does not replace `npm run check:redirects`, link checks, or semantic review.

Tracking is a separate PR-readiness check because normal edit mode does not
stage files:

```bash
node skills/wdk-community-module-docs/scripts/validate-artifacts.mjs \
  --pr-ready \
  --api-reference-policy=/absolute/private/api-reference-policy.txt
```

Before explicit staging, a new manually authored ignored API reference is
expected to fail `--pr-ready`. Report that failure rather than staging around
the user's limits. During requested PR preparation, include the page
intentionally and rerun the command.

If docs-site content, navigation, redirects, links, generated search data, or
rendered pages changed, run:

If `content/feeds/all-modules.md` changed, first run
`npm run sync:all-modules-feed` and inspect the tracked
`public/llms-full.txt` update. The build fails closed when that feed is stale.

```bash
export LINK_CHECK_EXTERNAL=false
npm run test:link-routing
npm run check:meta
npm run check:redirects
LINK_CHECK_EXTERNAL=false npm run check:links
npm run build
npm run quality
```

The final `quality` command intentionally repeats repository checks as the
maintainer gate. Exporting `LINK_CHECK_EXTERNAL=false` keeps both link-check
passes deterministic while preserving the required command sequence.

`npm run check:meta` currently checks `meta.json` files and may report zero
validated files. Do not describe that as MDX frontmatter validation. The
changed-page gate and build cover separate parts of that contract.

If build or quality fails under a newer local Node runtime due to repo runtime
drift, retry with Node `22.22.2` before treating the docs change as broken:

```bash
PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH" npm run build
PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH" npm run quality
```

Only report a command as passed if that exact command ran and exited
successfully.

Before publishing rendered docs, search the changed files for unreplaced
template markers such as `PSEUDOCODE - DO NOT PUBLISH`, `SOURCE_VERIFY`, and
angle-bracket placeholders. Review the final diff for prohibited public
workflow language, private provenance, real credentials, and real recipient
data. Do not add those prohibited phrases to this guide merely to create a
literal scan pattern.

If only files under `contributing/wdk-community-module-docs/` or
`skills/wdk-community-module-docs/` changed, do not run docs-site build checks;
those files are outside the Fumadocs collection. Validate their Markdown,
frontmatter, same-file anchors, whitespace, and skill structure directly with
the artifact validator above.

For read-only artifact reviews, do not run commands that mutate refs,
dependencies, generated files, or build output unless the user asks. Report the
inspection commands that were run, and say which edit-mode validation was not
run.

## PR Readiness Checklist

Before asking for review, verify:

- Target branch is correct.
- Worktree contains only intended files.
- Package release state is classified.
- Documentation readiness is classified independently; runnable setup has a
  verified clean dependency graph and secret-free isolated smoke path.
- Mixed readiness names the affected language/symbol/flow, has independent
  evidence for every runnable path, and is consistent across direct-entry IA.
- Source surfaces are listed privately.
- All public package names, scopes, and versions are current.
- IA path and sidebar placement are intentional.
- The IA/page-set decision and flow inventory justify canonical family,
  cross-listing, page mode, and guide splits.
- Functional index pages and aggregate module lists are updated when required.
- Catalog/chooser status labels distinguish release maturity, documentation
  readiness, and runtime compatibility; ambiguous `Ready` labels are absent.
- Community modules have responsibility disclaimers.
- Changelog treatment follows verified release state rather than module family.
- API reference is source-backed and excludes private helpers.
- API-reference policy is `IN_SCOPE` or `NOT_APPLICABLE` for final readiness;
  `QUARANTINED` is reported incomplete and never treated as near-actual.
- Decision-steering outputs document advisory-versus-binding status, enforcing
  actor, reasons/unknowns, version and time semantics, review/override/appeal,
  audit/retention, sensitive-data handling, fallback, and revalidation where
  those controls exist; absent or opaque controls are explicit limitations.
- Baseline fragments are lexically preserved and the semantic compatibility
  ledger maps each one to the same symbol or concept.
- Unsupported methods and limitations are documented.
- Write flows preserve every source-exposed preparation and persistence phase
  before confirmation and execution without inventing absent helpers.
- Each executable write fence contains its own review, confirmation, submission,
  and completion checks; incomplete flows use `text`.
- Each executable fence, including non-write construction/configuration examples,
  passed an exact clean-consumer check; reference-only scopes contain no runnable
  install, construction, task, write, or status fences.
- Nominal cross-package checks use one proven runtime class identity; duplicate
  nested identities block affected execution claims.
- Promised integrations are self-contained and their adjacent pages do not
  contradict exact helper, error, credential, or readiness behavior.
- Stable and prerelease install-version policy matches this guide.
- External links are useful and public; every changed destination and redirect
  was reviewed separately or reported `unverified/blocked`.
- Internal workflow notes and private validation breadcrumbs are absent.
- No template or pseudocode marker remains in rendered docs.
- New files were included in whitespace and content review.
- Every manually authored API reference intended for the PR is already in `HEAD`
  or is an actual staged addition, not intent-to-add, despite generated-file
  ignore rules.
- Required validation commands passed or failures are clearly explained.
- `check:meta` results are reported for their real `meta.json` scope, not as a
  claim that MDX frontmatter was validated.

## Maintainer Questions To Resolve

Ask maintainers before publishing when:

- Package release state is placeholder, unpublished, or renaming.
- Source and npm metadata disagree.
- Provider docs and source disagree on supported chains or tokens.
- A module could fit both a functional section and Community Modules.
- No existing family fits the module's user-visible capability and risk.
- Authority, custody, settlement, or package topology only partially resembles
  an existing family, including signing-only, MPC, custodial, accountless, or
  asynchronous intent/order behavior.
- A released package fails clean install, declaration, or interoperability
  checks and maintainers must choose a supported dependency resolution.
- A page would expose a private helper or private validation detail.
- The docs need to claim production readiness, deprecation, support level, or ownership.
- An open PR targets a different base branch than current `upstream/develop`.

## Authoring Templates

These templates define page order only. They are not API examples. Keep them in
`text` fences while drafting, replace every marker from source evidence, then
convert only verified snippets to a language fence. Never publish a marker.

### Pre-Draft Decision Record

Keep this record private to the authoring handoff:

```text
Source lock: <PACKAGE VERSION, TARBALL, MATCHING SOURCE, PROVIDER SOURCES>
Release state: <RELEASED, PLACEHOLDER, UNPUBLISHED, DEPRECATED, SOURCE ONLY, OR BLOCKED>
Documentation readiness: <RUNNABLE, REFERENCE-ONLY, OR DRAFT-ONLY>
Readiness ledger: <ONE ROW PER LANGUAGE, ENTRY POINT, SYMBOL/FLOW, EVIDENCE, STATUS, BLOCKER, AND PUBLIC LOCATION>
Authority/custody: <LOCAL, SUPPLIED SIGNER, REMOTE, MPC/MULTISIG, OR NONE>
Account ownership: <MANAGED, CALLER-OWNED, REMOTE, OR ACCOUNTLESS>
Operations: <READ, DISCOVER, PREPARE, SIGN, WRITE, STATUS, RECOVER>
Settlement: <NONE/NOT APPLICABLE, SYNCHRONOUS, RECEIPT, ASYNC, CANCELLABLE, PARTIAL, OR RESUMABLE>
Trust boundaries: <RPC, PROVIDER PAYLOAD, SOLVER, WEBHOOK, CUSTODIAN, OR OTHER>
Package topology: <SINGLE, SHARED SUITE, OR MULTI-FAMILY SUITE>
Canonical IA: <FAMILY, ROUTE, SIDEBAR, INDEXES, CROSS-LISTING, REDIRECTS>
Flow inventory: <ONE LINE PER INDEPENDENT JOURNEY AND SAFETY BOUNDARY>
Page mode and split rationale: <DECISION>
Baseline fragment ledger: <ROUTE#FRAGMENT -> SAME SYMBOL OR CONCEPT>
Blocked claims and maintainer questions: <DECISION NEEDED>
```

### Overview Scaffold

```text
SOURCE_VERIFY BEFORE PUBLISHING
---
title: <OUTCOME_OR_MODULE_TITLE>
description: <CONCRETE_READER_OUTCOME>
docType: explanation
schemaType: TechArticle
---

<ORDER_THE_NEXT_TWO_BLOCKS_TO_MATCH_ADJACENT_MERGED_FAMILY_PAGES>
<CANONICAL_COMMUNITY_CALLOUT_WHEN_APPLICABLE>
<ONE_PARAGRAPH_PURPOSE_OWNERSHIP_AND_OPTIONAL_SOURCE_ATTRIBUTION>

## When to use it
<USE_CASE_AND_ALTERNATIVE_TABLE>

## Requirements
<RUNTIME_ACCOUNT_PROVIDER_AND_RELEASE_REQUIREMENTS>

## Capabilities
<ONLY_SOURCE_VERIFIED_PUBLIC_CAPABILITIES>

## Limitations
<UNSUPPORTED_RUNTIME_PROVIDER_AND_RELEASE_LIMITS>

## Next Steps
<CARDS_IN_SIDEBAR_ORDER>
```

### Compact Overview Scaffold

Use this only after the compact exception is proven. It replaces separate usage
and configuration pages, so the first-use path must be complete on this page:

```text
SOURCE_VERIFY BEFORE PUBLISHING
---
title: <OUTCOME_OR_MODULE_TITLE>
description: <CONCRETE_READER_OUTCOME>
docType: explanation
schemaType: TechArticle
---

<ORDER_THE_NEXT_TWO_BLOCKS_TO_MATCH_ADJACENT_MERGED_FAMILY_PAGES>
<CANONICAL_COMMUNITY_CALLOUT_WHEN_APPLICABLE>
<ONE_PARAGRAPH_PURPOSE_OWNERSHIP_AND_OPTIONAL_SOURCE_ATTRIBUTION>

## When to use it
<USE_CASE_AND_ALTERNATIVE_TABLE>

## Requirements
<RUNTIME_PROVIDER_STORAGE_AND_RELEASE_REQUIREMENTS>

## Install
<VERIFIED_INSTALL_COMMAND_OR_REFERENCE_ONLY_BLOCKER>

## Minimal setup
<COMPLETE_CONSTRUCTION_AND_FIRST_READ_OR_OTHER NON-WRITE RESULT>

## Capabilities
<ONLY_SOURCE_VERIFIED_NARROW_PUBLIC_CAPABILITIES>

## Limitations and cleanup
<UNSUPPORTED_RUNTIME_PROVIDER_LIFECYCLE_AND_CLEANUP_RULES>

## Reference
<API_REFERENCE_AND_USEFUL_PUBLIC_SOURCE_OR_PROVIDER_LINKS>
```

If minimal setup needs secrets, signing, a financial write, asynchronous
recovery, or more than one independent task, compact mode is invalid. Use the
standard or high-risk page set instead.

### Usage Hub Scaffold

Use this when focused guides contain the complete workflows:

```text
SOURCE_VERIFY BEFORE PUBLISHING
---
title: <USAGE_TITLE>
description: <WORKFLOW_MAP_OUTCOME>
docType: how-to
schemaType: TechArticle
icon: BookOpen
---

<ORDER_THE_NEXT_TWO_BLOCKS_TO_MATCH_ADJACENT_MERGED_FAMILY_PAGES>
<CANONICAL_COMMUNITY_CALLOUT_WHEN_APPLICABLE>
<ONE_PARAGRAPH_PURPOSE_OWNERSHIP_AND_OPTIONAL_SOURCE_ATTRIBUTION>

## Requirements
<SHARED_RUNTIME_ACCOUNT_PROVIDER_AND_RELEASE_REQUIREMENTS>

## Setup
<MINIMAL_VERIFIED_CONSTRUCTION_OR_LINK_TO_GETTING_STARTED>

## Workflow order
<SOURCE_DERIVED_DISCOVER_QUOTE_PREPARE_PERSIST_INSPECT_CONFIRM_AUTHORIZE_EXECUTE_TRACK_RECOVER_SEQUENCE>

## Guides
<CARDS_IN_SIDEBAR_ORDER_WITH_CONCRETE_OUTCOMES>

## Limitations and cleanup
<SHARED_SAFETY_RECOVERY_AND_SECRET_LIFECYCLE_RULES>

## Related pages
<CONFIGURATION_API_OVERVIEW_AND_ERROR_EXITS>
```

### Complete-Flow Usage Phase Library

Use this only when focused task guides do not split the workflow. Keep the common
setup below, then select and rename only the source-matched phases from the flow
shape table above. Omit every absent phase; a direct write does not need an
invented quote or prepare heading, and a read or provider handoff does not need
an execute heading.

```text
SOURCE_VERIFY BEFORE PUBLISHING
---
title: <USAGE_TITLE>
description: <COMPLETE_TASK_OUTCOME>
docType: how-to
schemaType: TechArticle
icon: BookOpen
---

<ORDER_THE_NEXT_TWO_BLOCKS_TO_MATCH_ADJACENT_MERGED_FAMILY_PAGES>
<CANONICAL_COMMUNITY_CALLOUT_WHEN_APPLICABLE>
<ONE_PARAGRAPH_PURPOSE_OWNERSHIP_AND_OPTIONAL_SOURCE_ATTRIBUTION>

## Prerequisites
<STATIC_RUNTIME_ACCOUNT_CREDENTIAL_FUNDING_AND_RELEASE_REQUIREMENTS>

## Install
<VERIFIED_INSTALL_COMMANDS>

## Create the module
<INCLUDE_ONLY_WHEN_CONSTRUCTION_EXISTS; VERIFIED_IMPORT_CONSTRUCTOR_AND_CLEANUP>

## <FIRST_SOURCE_EXPOSED_TASK_PHASE>
<READ_DISCOVER_DIRECT_WRITE_QUOTE_REQUIREMENTS_PREPARE_OR_HANDOFF_CONTENT>

## <NEXT_SOURCE_EXPOSED_PHASE_OR_OMIT>
<EXACT_INPUT_OUTPUT_REVIEW_AND_TRANSITION>

## <REVIEW_AND_CONFIRM_WHEN_A_LATER_ACTION_IS_AUTHORIZED_OR_STEERED>
<EXACT_CALLER_QUOTE_PREPARED_OR_HANDOFF_FIELDS_THE_APP_MUST_SHOW>

## <AUTHORIZE_OR_SIGN_ONLY_WHEN_SEPARATE>
<USE_THE_TRANSACTION_OR_MESSAGE_SIGNING_SAFETY_CONTRACT>

## <EXECUTE_SUBMIT_OR_HAND_OFF_ONLY_WHEN_SOURCE_EXPOSES_IT>
<VERIFIED_LOCAL_WRITE_ASYNC_SUBMISSION_OR_PROVIDER_HANDOFF_AFTER_CONFIRMATION>

## <TRACK_RECONCILE_OR_RECOVER_ONLY_WHEN_SOURCE_EXPOSES_STATE>
<VERIFIED_COMPLETION_TIMEOUT_INTERVENTION_INDETERMINATE_AND_RECOVERY_BEHAVIOR>

## Handle errors and cleanup
<VERIFIED_ERRORS_AND_FINALLY_CLEANUP>

## Related pages
<OVERVIEW_CONFIGURATION_API_AND_RECOVERY_EXITS>
```

Remove write-oriented sections from a read-only module and state that provider
URL/session generation is a handoff rather than execution when that is the
verified behavior. Do not leave empty headings to imitate a larger provider.

### Configuration Scaffold

```text
SOURCE_VERIFY BEFORE PUBLISHING
---
title: <MODULE_QUALIFIED_OR_ADJACENT_CONFIGURATION_TITLE>
description: <CONFIGURATION_OUTCOME>
docType: reference
schemaType: TechArticle
icon: Settings
---

<ORDER_THE_NEXT_TWO_BLOCKS_TO_MATCH_ADJACENT_MERGED_FAMILY_PAGES>
<CANONICAL_COMMUNITY_CALLOUT_WHEN_APPLICABLE>
<ONE_PARAGRAPH_PURPOSE_OWNERSHIP_AND_OPTIONAL_SOURCE_ATTRIBUTION>

## Installation and runtime
<PACKAGE_PEERS_ENGINES_AND_ENVIRONMENT>

## <SOURCE_SELECTED_CREATION_HEADING>
<CONSTRUCTOR_FACTORY_STATIC_CREATOR_INJECTION_OR_NO_CREATION_STEP>

## Configuration fields
<REQUIRED_OPTIONAL_DEFAULT_UNIT_AND_SECURITY_TABLE>

## Operation-specific options
<ONLY_OPTIONS_EACH_IMPLEMENTATION_USES_OR_ENFORCES>

## Unsupported combinations
<SOURCE_VERIFIED_LIMITATIONS>

## Related pages
<GETTING_STARTED_USAGE_API_AND_AFFECTED_TASK_EXITS>
```

### API Reference Scaffold

```text
SOURCE_VERIFY BEFORE PUBLISHING
---
title: <MODULE_QUALIFIED_OR_ADJACENT_API_REFERENCE_TITLE>
description: <PUBLIC_API_SCOPE>
docType: reference
schemaType: APIReference
icon: Code
---

<ORDER_THE_NEXT_TWO_BLOCKS_TO_MATCH_ADJACENT_MERGED_FAMILY_PAGES>
<CANONICAL_COMMUNITY_CALLOUT_WHEN_APPLICABLE>
<ONE_PARAGRAPH_PURPOSE_OWNERSHIP_AND_OPTIONAL_SOURCE_ATTRIBUTION>

## Package and exports
<EXACT_PACKAGE_IMPORTS_EXPORTS_AND_DEFAULT_EXPORT>

## <SOURCE_SELECTED_CREATION_HEADING>
<EXACT_CREATION_SIGNATURE_AND_ACCOUNT_COMPATIBILITY>

## Methods
<EXACT_METHOD_PARAMETERS_ASYNC_RETURN_AND_ERROR_TABLE>

## Types and configuration
<EXACT_EXPORTED_TYPES_KEYS_OPTIONALITY_DEFAULTS_AND_UNITS>

## Requirements statuses and fees
<ONLY_SOURCE_MAPPED_VALUES_AND_HELPERS>

## Errors
<ONLY_PUBLIC_OR_DOCUMENTED_THROWN_ERRORS>

## Limitations
<UNSUPPORTED_INHERITED_PROVIDER_AND_RUNTIME_BEHAVIOR>

## Related pages
<USAGE_CONFIGURATION_HIGH_RISK_TASK_AND_ERROR_EXITS>
```

### Task Guide Scaffold

```text
SOURCE_VERIFY BEFORE PUBLISHING
---
title: <IMPERATIVE_TASK_TITLE>
description: <TASK_RESULT>
docType: how-to
schemaType: TechArticle
---

<ORDER_THE_NEXT_TWO_BLOCKS_TO_MATCH_ADJACENT_MERGED_FAMILY_PAGES>
<CANONICAL_COMMUNITY_CALLOUT_WHEN_APPLICABLE>
<ONE_PARAGRAPH_PURPOSE_OWNERSHIP_AND_OPTIONAL_SOURCE_ATTRIBUTION>

## Prerequisites
<STATE_REQUIRED_BEFORE_STARTING>

## <FIRST_SOURCE_EXPOSED_TASK_PHASE>
<READ_DISCOVER_BUILD_DIRECT_WRITE_QUOTE_REQUIREMENTS_PREPARE_OR_HANDOFF_STEP>

## <REVIEW_AND_CONFIRM_ONLY_WHEN_OUTPUT_AUTHORIZES_OR_STEERS_A_LATER_ACTION>
<EXACT_SAFETY_FIELDS_OR_OMIT_THIS_PHASE>

## <NEXT_SOURCE_EXPOSED_PHASE_OR_RESULT_INTERPRETATION>
<VERIFIED_READ_RESULT_WRITE_HANDOFF_STATUS_OR_LAYERED_SUCCESS_STEP>

## <RECOVER_OR_TROUBLESHOOT_WHEN_SOURCE_EXPOSES_A_FAILURE_PATH>
<OBSERVABLE_FAILURE_CAUSE_AND_ACTION>

## Related pages
<PREREQUISITE_API_NEXT_STEP_AND_ERROR_EXITS>
```

Select only phases that exist for the task. A read-only guide interprets data and
handles missing, stale, or provider-error outcomes; it does not add confirmation
or execution headings unless that output materially steers a later action.

## Adversarial Test Acceptance

Use regeneration tests to evaluate the system, not to train it on exact prose.

1. Resolve a maintainer-approved remote and branch to one immutable base SHA,
   create a clean worktree from that SHA, then copy it to a generation snapshot
   with no `.git` metadata. Use a PR head only as an explicitly approved base,
   never as a reason to expose target-doc history.
2. Install the exact candidate manual, skill, operator guide, and artifact
   validator. Record their hashes before generation.
3. Delete the target module docs, dependencies/symlinks, and every generated
   mirror that can contain their prose, including LLM, search, OG, `.source/`,
   `.next/`, and `dist/` output. Hash the actual remaining filesystem, including
   ignored files, and store both file hashes and a typed tree inventory with
   modes, directories, symlink targets, and special paths outside the fixture.
   Before deletion,
   export a neutral compatibility manifest containing only each baseline
   `route#fragment` and its short semantic heading; include no body prose, code,
   section order, or unsupported factual claim. Non-rendered fixtures distinguish
   neutral `CLASSIFICATION_ONLY`, approved `CATALOG_ONLY`, and approved
   `NO_APPROVED_ROUTE`; only approved catalog tests may edit exact catalog files.
4. Assert that the target, denied surfaces, every `.git` path, and all symlinks
   are absent. The generation snapshot must contain no Git repository, empty or
   otherwise. Distinguish filesystem-enforced isolation from a
   history-sanitized but prompt-enforced process in the result.
5. Forbid the generation agent from recovering those docs from Git history,
   caches, other worktrees, prior outputs, persistent agent or workspace
   memory, chat summaries, review notes, or quoted gold text. Disable ambient
   memory for the generation role when the runner supports it. Any memory read
   invalidates the fixture; discard the run before comparison.
6. Let the agent inspect current non-target docs, package tarballs, matching
   source versions, types, tests, and provider docs. Do not expose target docs PR
   titles, bodies, diffs, files, comments, reviews, or history. Source-repository
   PR code is allowed only as an enumerated non-doc input. Permit the neutral
   fragment manifest as compatibility metadata. Preserve each ID beside the same
   source-backed concept; stop for a maintainer decision when the concept is no
   longer valid instead of moving the ID to unrelated content.
7. After preflight, permit clean-consumer dependency, declaration, import, and
   construction checks only in a declared scratch directory inside the fixture.
   Capture transcripts externally, remove the scratch directory before the final
   manifest, and reject residue. Do not restore docs-workspace dependencies.
8. Treat the output allowlist as a permission ceiling, never as a required page
   set or as ownership, release, IA, or factual evidence.
9. Freeze a full before/after typed tree manifest, target and adjacent outputs,
   command transcripts, and candidate hashes; reject mode/type changes, special
   paths, unrelated empty directories, final symlinks, and any Git metadata;
   then close the generation role.
   Copy allowed output into a separate clean evaluation worktree before allowing
   independent reviewers to compare the result
   with the original docs and source. The original is evaluation data, not
   generation input.
10. For classification tests, compare the closed report with an evaluator-only
   oracle containing expected axes, accepted/rejected families, catalog/route
   decisions, evidence, and maintainer questions. Include known-family,
   catalog-only, and true no-route cases so abstention cannot always pass.
11. Keep all test output unstaged. Do not commit, push, open a PR, or emit git
   action directives.

A generated page set is near-actual only when all of these are true:

- Page count, canonical path, frontmatter, section order, and sidebar/listing
  decisions satisfy current IA and this guide.
- An independent source review reports zero Blocker or High findings for API,
  package, release-state, security, write ordering, or unsupported claims.
- Capability-triggered decision-output controls pass independently: authority,
  reason and unknown semantics, policy/model version and time bounds, human
  review or override, audit/retention, privacy, fallback, and revalidation are
  verified or explicitly limited without forcing a new module family.
- An independent partner-journey review reports zero Blocker or High findings.
- Required metadata, redirect, link, build, and quality commands pass when the
  generated files are rendered docs.
- The independent baseline-fragment gate passes using a neutral manifest that
  was frozen before deletion and did not expose target body prose.
- Differences from the original are editorial or equally accurate alternatives,
  not missing behavior, invented behavior, or copied wording.
- The tested artifact hashes match the final candidate. Any later manual,
  skill, operator-guide, or validator change invalidates affected test results
  until they are rerun.
- The skill also passes manual-absent classification tests. A source-only
  package stays draft-only unless separate release evidence exists. An
  unfamiliar authority/custody model yields a new-family or explicit
  maintainer-decision result. Neither case invents routes or release claims.
- Manual-absent tests exercise `IN_SCOPE`, `NOT_APPLICABLE`, and fail-closed
  `QUARANTINED` PR policy; same-package mixed-readiness tests use independent
  ledger rows; and a non-pricing steering output plus an observational negative
  control exercise both branches of the cross-family decision rule.
- Every row in the behavior coverage matrix has an evaluator-frozen positive and
  trigger control, expected branch, independent assertion, and passing result.
- A deliberate contaminated negative control is rejected before generation, and
  one positive holdout selected after candidate freeze passes without rule
  refinement against its output.

### Behavior Coverage Matrix

Family diversity is not evidence that a rule fired. Before accepting candidate
hashes, freeze an evaluator-only behavior oracle and exercise every row below
independently. A small source microfixture is acceptable when a real module does
not provide both branches. Each row needs a positive control, a negative/trigger
control, the expected public output or abstention, and an independent evaluator
assertion. Do not teach the generator the expected answer.

| Behavior | Positive control | Negative or trigger control | Required evaluator assertion |
|---|---|---|---|
| Fence-scoped readiness | Exact graph and exact fence type-check/runtime path pass. | Install, declaration, import, creation, or interoperability fails for one scope. | Runnable scope keeps only proven fences; blocked scope contains declaration-only or labeled `text`, never runtime/setup fences with a nearby disclaimer. |
| Creation form | Export is a class, callable factory, static creator, injected instance, or has no creation step. | Deliberately use the wrong invocation form in the private negative candidate. | Published heading and fence use the source-selected form; the wrong form fails clean-consumer validation. Include a factory-only holdout. |
| Nominal dependency identity | Both sides resolve the same runtime constructor and affected paths rehearse successfully. | Nested graph resolves structurally similar but distinct class objects. | Compatible paths may be documented; duplicate identity blocks only the affected approval/execution/receipt/recovery paths. |
| Reported versus enforced values | Package validates the executable instruction and enforces the bound locally. | Package checks only a provider-reported amount or label. | Public wording distinguishes requested, reported, validated, and enforced values and does not promote a reported cap into a debit guarantee. |
| Error propagation | Closed public error union or every wrapper boundary is source-proven. | At least one pre-wrapper/raw escape or structured-result transformation exists. | Tables match exact catch/transform/wrap boundaries and executable guidance retains an unknown branch when required. |
| Credential lifecycle | Provider-documented public/publishable key uses a supported runtime shape. | Server secret or original key exchanged for a cached/forwarded token. | Docs distinguish classification, runtime, exchanged value, refresh/cache, forwarding, and useful provisioning destination without exposing credentials. |
| Transitive helper behavior | Unambiguous cache key and source-proven failover/null/retry behavior. | Collision, rejected-error rotation, fulfilled-null/empty non-rotation, or other user-visible edge. | Promised integration is self-contained and limitations match the exact installed helper rather than its name or README summary. |
| Config and disposal lifecycle | Config is copied/frozen and disposal removes owned cache state. | Config is retained/mixed read-once/per-call, or disposed accounts remain manager-cached. | Docs state mutation/rotation/recreation behavior and never imply disposal resets an owner that retains the instance. |
| Aggregate and direct-entry journey | Family indexes, chooser/catalog status, sidebar, specific provider links, and target pages agree. | One aggregate is stale, status axis is ambiguous, or a task link is replaced by a homepage. | All direct entries use one factual release/readiness/compatibility story and lead to a complete applicable journey. |
| Heading and anchor semantics | ATX/Setext/MDX headings form a valid hierarchy with unique IDs. | Skipped level, duplicate explicit/generated ID, duplicate rendered H1, or wrong compatibility destination. | Parser-backed validation reports physical lines and the evaluator confirms each preserved fragment still names the same concept. |

Archive the behavior case ID, source lock, candidate hash, positive/negative input,
expected branch, actual output, reviewer result, and command transcript. One
fixture may cover several rows, but every row must have its own assertion and a
non-triggering control so omission is distinguishable from correct restraint.

To control overfitting, test distinct capability/risk archetypes rather than
several providers with the same interface. A release candidate should include
at least a community wallet, a route provider, a lending provider, an
external-service gasless or gasfree wallet, a smart-account wallet, a fiat
provider, a read-only pricing/data provider, and a multi-package provider suite
with a one-page-versus-split-page decision.

After changing a general classification, safety, MDX, IA, or snippet rule,
reinstall all four artifacts in every fixture. Rerun generation for each
archetype whose inputs or expected decision changed, plus at least one
unaffected control archetype. Hash checks alone do not validate new authoring
behavior. Rerun the full matrix when the core workflow or source contract
changes broadly.

Promote a test finding into the durable rules only when it expresses a general
source, safety, IA, or journey invariant. Keep provider-specific facts in that
provider's docs. When a rule is based on one module only, label it as a
conditional example and require source verification instead of making it a
family default.
