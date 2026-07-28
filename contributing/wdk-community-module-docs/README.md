# WDK Community Module Docs Skill User Guide

Use this guide to install, invoke, test, and maintain the workspace-local WDK
community module documentation skill. The skill is for external partner and
community module docs that must match the current WDK source, information
architecture, public wording, snippet safety, and validation bar.

For normal partner work, follow Install through Output Contract. The isolated
regeneration protocol is maintainer-only acceptance testing and is not a
prerequisite unless the task explicitly asks for it.

This directory is a contributor surface, not part of the rendered docs site.
Do not add it or the skill files to `src/lib/custom-tree.ts`.

## Package Contents

| Path | Audience | Purpose |
|---|---|---|
| `contributing/wdk-community-module-docs/README.md` | Operator | Installation, invocation, testing, and maintenance. |
| `contributing/wdk-community-module-docs/COMMUNITY_MODULE_DOCUMENTATION_GUIDE.md` | Human author or reviewer | Complete standalone authoring contract. |
| `skills/wdk-community-module-docs/SKILL.md` | Agent | Concise reusable authoring and review workflow. |
| `skills/wdk-community-module-docs/scripts/validate-artifacts.mjs` | Operator or agent | Dependency-free artifact checks; safe fixture sanitization; typed input/output manifests; neutral baseline-fragment output; and optional current-MDX, changed-MDX, parsed-heading/ID, fragment-preservation, and API-reference staging gates. MDX checks use the locked renderer parser/slugger; executable JavaScript/TypeScript fence checks also use workspace TypeScript. |

## Quick Links

- [Install in a WDK docs workspace](#install-in-a-wdk-docs-workspace)
- [Verify installation](#verify-installation)
- [Invoke the skill](#invoke-the-skill)
- [Required validation](#required-validation)
- [Maintainer-only isolated manual test protocol](#maintainer-only-isolated-manual-test-protocol)
- [Apply the acceptance gate](#6-apply-the-acceptance-gate)
- [Maintenance](#maintenance)
- [Troubleshooting](#troubleshooting)

The package intentionally has no `references/` directory. The skill includes
the core workflow and remains usable on its own. In this repository it loads
the manual for the complete page matrices, family rules, templates, and review
checklists instead of duplicating that material.

## Why This Location Is Safe

The current Fumadocs collection uses the default `content/docs` source. Search,
link checking, generated routes, and the custom sidebar also operate on that
rendered tree. Repository-root `contributing/**` and `skills/**` files are
therefore not published as docs pages.

Re-check `source.config.ts`, `src/lib/source.ts`, and the generation scripts if
the collection root changes. Do not place these artifacts under
`content/docs/contributing/`.

## Install In A WDK Docs Workspace

No installation step is needed when all four files above already exist in the
target checkout.

To install this package from another checkout or artifact directory, set the
source and target repository roots explicitly:

```bash
export SOURCE_ROOT="/path/to/source-wdk-docs"
export WDK_DOCS_ROOT="/path/to/target-wdk-docs"

mkdir -p \
  "$WDK_DOCS_ROOT/contributing/wdk-community-module-docs" \
  "$WDK_DOCS_ROOT/skills/wdk-community-module-docs/scripts"

install -m 0644 \
  "$SOURCE_ROOT/contributing/wdk-community-module-docs/README.md" \
  "$WDK_DOCS_ROOT/contributing/wdk-community-module-docs/README.md"
install -m 0644 \
  "$SOURCE_ROOT/contributing/wdk-community-module-docs/COMMUNITY_MODULE_DOCUMENTATION_GUIDE.md" \
  "$WDK_DOCS_ROOT/contributing/wdk-community-module-docs/COMMUNITY_MODULE_DOCUMENTATION_GUIDE.md"
install -m 0644 \
  "$SOURCE_ROOT/skills/wdk-community-module-docs/SKILL.md" \
  "$WDK_DOCS_ROOT/skills/wdk-community-module-docs/SKILL.md"
install -m 0755 \
  "$SOURCE_ROOT/skills/wdk-community-module-docs/scripts/validate-artifacts.mjs" \
  "$WDK_DOCS_ROOT/skills/wdk-community-module-docs/scripts/validate-artifacts.mjs"
```

Use `git rev-parse --show-toplevel` in each checkout when you need to discover
an absolute repository root. Do not install the skill in a user-global skill
directory when the goal is to keep its version coupled to this docs repository.

## Verify Installation

Run from the target repository root:

```bash
test -f contributing/wdk-community-module-docs/README.md
test -f contributing/wdk-community-module-docs/COMMUNITY_MODULE_DOCUMENTATION_GUIDE.md
test -f skills/wdk-community-module-docs/SKILL.md
test -f skills/wdk-community-module-docs/scripts/validate-artifacts.mjs
node skills/wdk-community-module-docs/scripts/validate-artifacts.mjs
git diff --check
```

The default check is dependency-free. If the target workspace's locked
dependencies are already installed and TypeScript plus the Markdown/MDX parser
resolve, also run:

```bash
node -e "for (const name of ['typescript', 'github-slugger', 'unified', 'remark-parse', 'remark-mdx', 'mdast-util-to-string']) require.resolve(name)"
node skills/wdk-community-module-docs/scripts/validate-artifacts.mjs --self-test
```

Do not run a lockfile-mutating install only for the self-test. When site
validation requires dependencies, use the manual's credential-scoped,
scripts-disabled install and audited lifecycle procedure, then run it.

The default validator does not require staging. For explicit PR-readiness work,
run `node skills/wdk-community-module-docs/scripts/validate-artifacts.mjs
--pr-ready --api-reference-policy=/absolute/private/api-reference-policy.txt`.
The regular external file contains exactly `IN_SCOPE`, `NOT_APPLICABLE`, or
`QUARANTINED`; quarantine fails, and the validator does not authenticate the
ownership assertion. A new ignored, manually authored API reference also fails
until it is an actual staged addition; intent-to-add does not qualify. Determine
ownership before choosing the policy. The standalone manual has the full rules.

An intentional skill-only installation can omit the two `contributing/**`
files and run `node skills/wdk-community-module-docs/scripts/validate-artifacts.mjs
--skill-only`. In a Git checkout it can add `--pr-ready` plus the required
external policy file to check API-reference tracking without the guides. This
does not replace the complete repo-local authoring contract. Add `--self-test`
only where the locked TypeScript and Markdown/MDX parser dependencies exist.

If only `contributing/wdk-community-module-docs/**` and
`skills/wdk-community-module-docs/**` changed, site build checks are not needed.
Run them when rendered docs, navigation, redirects, metadata, links, or
generated site assets change.

## Invoke The Skill

Name the workspace skill path and mode in the prompt. The skill supports
read-only review, edit mode, and disposable test mode.

This repository-local package deliberately follows the existing `skills/**`
layout and explicit-path invocation contract. It does not claim automatic
runtime discovery. Run prompts and validator commands from the root returned by
`git rev-parse --show-toplevel`; do not duplicate the package into a second
loader-specific directory unless maintainers adopt that convention repo-wide.

Review-only:

```text
Use the WDK community module docs skill at skills/wdk-community-module-docs/SKILL.md.
Review <module, files, or PR>. Do not edit, fetch, install dependencies, or
generate build output. Return findings first with severity, file/line evidence,
impact, and remediation. State explicitly if no findings remain.
```

Edit mode:

```text
Use the WDK community module docs skill at skills/wdk-community-module-docs/SKILL.md.
Create or update source-grounded docs for <module/package>. Inspect current repo,
package, source, provider, IA, and open-PR truth before editing. Keep the change
scoped, run required validation, and do not stage, commit, push, or open a PR.
```

Disposable regeneration test:

```text
Use the WDK community module docs skill at skills/wdk-community-module-docs/SKILL.md.
Work only in <absolute isolated worktree>. The target docs were removed before
this task. Regenerate them without reading git history, deleted gold docs,
caches, other worktrees, prior outputs, persistent agent or workspace memory,
chat summaries, or later comparison reports. Do not stage, commit, push, open a
PR, or alter the installed skill package. Report reusable workflow gaps
separately from provider-specific observations. Clean-consumer check every
executable fence exactly as published. A reference-only scope must contain no
runnable install, construction, task, write, or status fence. Trace nominal
dependency identity, error wrapping, credential exchange, transitive helper
behavior, config/disposal lifecycle, and aggregate/direct-entry journeys when
those capabilities exist.
```

Unknown module family:

```text
Use the WDK community module docs skill at skills/wdk-community-module-docs/SKILL.md.
Classify <module> by authority/custody, account ownership, operation surface,
settlement, trust boundaries, package topology, risk, release evidence, and
reader journey.
If no current family fits, propose path options and maintainer questions, but do
not create a route, page set, or sidebar entry without IA approval.
```

Skill-only fallback test:

```text
Use only skills/wdk-community-module-docs/SKILL.md; the repository manual is
intentionally unavailable. Evaluate a source-only package and an unfamiliar
signing/custody model. Report the missing repo contract. Do not invent a release,
family, route, install command, or page set. Validate the intentional fallback
with `node skills/wdk-community-module-docs/scripts/validate-artifacts.mjs
--skill-only`.
```

## Inputs And Workflow

When available, supply the exact package/version, matching public source,
relevant official provider docs, approved family/route/sidebar, task mode, and
known release or compatibility blockers. Never supply real secrets or customer
data as documentation material. `SKILL.md` owns the workflow; the standalone
manual owns page/family detail. Expect current-repo inspection, a source lock,
separate release and readiness decisions, multi-axis IA/page planning,
source-grounded drafting, adversarial review, exact validation, and uncertainty
reporting.

Before drafting, freeze a private per-language/symbol/flow readiness ledger and a
claim-to-journey map. For every promised integration, name the exact destination
that provides verified install/import/construct/use guidance. For every
executable fence, record the clean consumer that type-checked and exercised that
exact fence. This evidence is evaluator input, not partner-facing documentation.

Prove a public install command by running that exact command from an empty,
disposable consumer. A pre-provisioned consumer proves only its resolved graph
and runtime paths, not registry resolution or the published install command.
Freeze the command transcript, lockfile, graph, tarball hash, and hashes of exact
transitive source/declaration/test inputs before target deletion. If install
evidence is absent or blocked, keep install/setup fences reference-only even when
the pre-provisioned graph runs.

## Required Validation

Every edit-mode task runs `git diff --check`, the untracked Markdown check, and
the artifact validator when this package is installed. During history-free
generation, use the single policy-aware branch in
[Preserve Generation Isolation](#4-preserve-generation-isolation): validate the
rendered target only for `RENDERED`, exact allowlisted MDX for `CATALOG_ONLY`, and
no MDX for classification/no-route policies. That mode does not compare baseline
fragments or prove API semantics. MDX and base-comparison modes require the
repo-locked `github-slugger`; executable fences also require TypeScript.

In a normal edit worktree, or after a blind generation role has closed, run the
changed-page gate:

```bash
node skills/wdk-community-module-docs/scripts/validate-artifacts.mjs --docs-changed --base=HEAD
```

Use the approved base ref instead of `HEAD` when appropriate. In a blind
regeneration, only the independent evaluator may run this command after the
generation role closes because baseline-fragment comparison reads original
content.

When docs-site content or navigation changes, run exactly:

```bash
export LINK_CHECK_EXTERNAL=false
npm run check:meta
npm run check:redirects
LINK_CHECK_EXTERNAL=false npm run check:links
npm run build
npm run quality
```

The exported setting applies to the final `quality` gate as well as the explicit
link check. `quality` intentionally repeats repository checks because the
maintainer validation contract requires the exact sequence above.

`check:meta` currently validates `meta.json`, not MDX frontmatter. Report the
number it actually validates; the changed-page gate and build cover separate
MDX concerns.

If a build fails under a newer Node runtime because of repository runtime drift,
retry the failed build or quality command under Node `22.22.2` before treating
the docs change as broken. Report both attempts. Never report a command as
passed unless that exact command exited successfully.

## Output Contract

Follow the skill's reporting contract. Reviews lead with severity, file/line,
impact, and remediation. Edit reports list files, sources, exact validation,
risks, questions, and Git publication state. Test reports add fixture path,
candidate hashes, isolation grade, exercised archetypes, near-actual verdict,
reusable gaps, package defects, and provider-specific facts as separate fields.

## Maintainer-Only Isolated Manual Test Protocol

Use a clean base worktree, a history-free generation snapshot, a separate clean
evaluation worktree, and separate generation/evaluation roles. The generation
role must not see the original target docs. The evaluation role may compare
generated output to the original only after generation is complete.

Disable persistent agent and workspace memory for the generation role when the
runner supports it. Otherwise prohibit memory access explicitly and audit the
generation trace. Any read from persistent memory, prior-run summaries, or
review notes invalidates the fixture; discard it before evaluating output.

### 1. Freeze The Candidate

Record the exact candidate files before creating fixtures. Keep this manifest
outside every future base, generation, evidence, and evaluation root:

```bash
(
set -euo pipefail
: "${CANDIDATE_MANIFEST:?Set an absolute evidence-file path}"
case "$CANDIDATE_MANIFEST" in
  /*) ;;
  *) printf 'candidate manifest must be absolute\n' >&2; exit 64 ;;
esac
REPO_ROOT="$(cd "$(git rev-parse --show-toplevel)" && pwd -P)"
manifest_parent_input="$(dirname "$CANDIDATE_MANIFEST")"
manifest_leaf="$(basename "$CANDIDATE_MANIFEST")"
test "$manifest_leaf" != "." && test "$manifest_leaf" != ".."
test -d "$manifest_parent_input" && test ! -L "$manifest_parent_input"
manifest_parent="$(cd "$manifest_parent_input" && pwd -P)"
test "$manifest_parent_input" = "$manifest_parent"
case "$manifest_parent" in
  "$REPO_ROOT"|"$REPO_ROOT"/*)
    printf 'candidate manifest must stay outside the repository\n' >&2; exit 64 ;;
esac
CANDIDATE_MANIFEST="$manifest_parent/$manifest_leaf"
test ! -e "$CANDIDATE_MANIFEST" && test ! -L "$CANDIDATE_MANIFEST"
TMP_MANIFEST=''
MANIFEST_CREATED=0
MANIFEST_READY=0
cleanup_candidate_manifest() {
  rc=$?
  trap - EXIT HUP INT TERM
  if test -n "$TMP_MANIFEST"; then
    case "$TMP_MANIFEST" in "$manifest_parent"/.wdk-artifact-hashes.*) ;; *) exit 1 ;; esac
    if test -f "$TMP_MANIFEST" && test ! -L "$TMP_MANIFEST"; then
      rm -f -- "$TMP_MANIFEST"
    else
      rc=1
    fi
  fi
  if test "$rc" -ne 0 && test "$MANIFEST_CREATED" -eq 1 && test "$MANIFEST_READY" -eq 0; then
    if test -f "$CANDIDATE_MANIFEST" && test ! -L "$CANDIDATE_MANIFEST"; then
      rm -f -- "$CANDIDATE_MANIFEST"
    else
      rc=1
    fi
  fi
  exit "$rc"
}
trap cleanup_candidate_manifest EXIT
trap 'exit 129' HUP
trap 'exit 130' INT
trap 'exit 143' TERM
TMP_MANIFEST="$(mktemp "$manifest_parent/.wdk-artifact-hashes.XXXXXX")"
test -f "$TMP_MANIFEST" && test ! -L "$TMP_MANIFEST"
shasum -a 256 \
  contributing/wdk-community-module-docs/README.md \
  contributing/wdk-community-module-docs/COMMUNITY_MODULE_DOCUMENTATION_GUIDE.md \
  skills/wdk-community-module-docs/SKILL.md \
  skills/wdk-community-module-docs/scripts/validate-artifacts.mjs \
  > "$TMP_MANIFEST"
test -s "$TMP_MANIFEST"
ln "$TMP_MANIFEST" "$CANDIDATE_MANIFEST"
MANIFEST_CREATED=1
rm -f -- "$TMP_MANIFEST"
TMP_MANIFEST=''
test -s "$CANDIDATE_MANIFEST" && test -f "$CANDIDATE_MANIFEST" && \
  test ! -L "$CANDIDATE_MANIFEST"
node skills/wdk-community-module-docs/scripts/validate-artifacts.mjs
if node -e "for (const name of ['typescript', 'github-slugger', 'unified', 'remark-parse', 'remark-mdx', 'mdast-util-to-string']) require.resolve(name)"; then
  node skills/wdk-community-module-docs/scripts/validate-artifacts.mjs --self-test
else
  printf 'Locked parser dependencies unavailable; evaluator self-test required\n' >&2
fi
MANIFEST_READY=1
)
```

Any candidate change invalidates every test influenced by that change. Reinstall
the candidate and rerun those tests. Run TypeScript-dependent commands
where the repo-locked workspace dependencies already exist; if they do not,
record that blocker and require the independent evaluator to run the self-test.

### 2. Create One Fixture Per Archetype

Before deleting target content, export its compatibility contract from the
approved base after creating the roots below. The manifest contains routes,
fragments, and short semantic headings only; it contains no section body text
or code.

Set `FIXTURE_POLICY=RENDERED` for an existing route regeneration. Non-rendered
fixtures use one exact policy marker and leave `TARGET_DOCS_DIR` unset:

```text
CLASSIFICATION_ONLY
CATALOG_ONLY
NO_APPROVED_ROUTE
```

`CLASSIFICATION_ONLY` asks the generation role to classify and report without
writing; it does not reveal the evaluator's expected family/catalog/no-route
decision. `CATALOG_ONLY` means maintainers already approved exact catalog and
aggregate edits but no module route or sidebar node. `NO_APPROVED_ROUTE` means
maintainers already approved abstention from rendered and catalog output. Use
source-only and unfamiliar-family cases with `CLASSIFICATION_ONLY`, not as an
automatic no-route result.

```bash
set -euo pipefail
: "${BASE_WORKTREE:?Set a new absolute base-worktree path}"
: "${GEN_ROOT:?Set a new absolute generation-root path}"
: "${HARNESS_DIR:?Set an absolute evidence path outside GEN_ROOT}"
: "${BASE_REMOTE:?Set the maintainer-approved Git remote name}"
: "${BASE_REF:?Set the maintainer-approved branch name on BASE_REMOTE}"
: "${FIXTURE_POLICY:?Set RENDERED or a non-rendered policy}"
: "${API_REFERENCE_POLICY:?Set IN_SCOPE, QUARANTINED, or NOT_APPLICABLE}"
: "${CANDIDATE_MANIFEST:?Set the frozen candidate manifest path}"
case "$BASE_WORKTREE:$GEN_ROOT:$HARNESS_DIR" in
  /*:/*:/*) ;;
  *) printf 'fixture roots must be absolute\n' >&2; exit 64 ;;
esac
case "$BASE_REMOTE:$BASE_REF" in
  -*:*|*:-*|:*|*:) printf 'base remote/ref must be nonempty and must not start with -\n' >&2; exit 64 ;;
esac
git check-ref-format "refs/heads/$BASE_REF" >/dev/null
case "$FIXTURE_POLICY" in
  RENDERED)
    case "$API_REFERENCE_POLICY" in IN_SCOPE|QUARANTINED) ;; *) exit 64 ;; esac
    : "${TARGET_DOCS_DIR:?Set a repo-relative content/docs target}"
    case "$TARGET_DOCS_DIR" in
      content/docs/?*) ;;
      *) printf 'target must be below content/docs\n' >&2; exit 64 ;;
    esac
    case "$TARGET_DOCS_DIR" in
      */|*//*) printf 'target must not end with or repeat a slash\n' >&2; exit 64 ;;
    esac
    case "/$TARGET_DOCS_DIR/" in
      */../*|*/./*) printf 'target must not contain dot segments\n' >&2; exit 64 ;;
    esac
    ;;
  CLASSIFICATION_ONLY|CATALOG_ONLY|NO_APPROVED_ROUTE)
    test "$API_REFERENCE_POLICY" = "NOT_APPLICABLE"
    test -z "${TARGET_DOCS_DIR:-}"
    ;;
  *) printf 'invalid fixture policy\n' >&2; exit 64 ;;
esac

canonical_new_root() {
  input="$1"
  test ! -e "$input"
  parent="$(dirname "$input")"
  leaf="$(basename "$input")"
  test "$leaf" != "." && test "$leaf" != ".."
  printf '%s/%s\n' "$(cd "$parent" && pwd -P)" "$leaf"
}
roots_overlap() {
  case "$1" in "$2"|"$2"/*) return 0 ;; esac
  case "$2" in "$1"|"$1"/*) return 0 ;; esac
  return 1
}

base_new="$(canonical_new_root "$BASE_WORKTREE")"
gen_new="$(canonical_new_root "$GEN_ROOT")"
harness_new="$(canonical_new_root "$HARNESS_DIR")"
test -f "$CANDIDATE_MANIFEST" && test ! -L "$CANDIDATE_MANIFEST"
candidate_real="$(cd "$(dirname "$CANDIDATE_MANIFEST")" && pwd -P)/$(basename "$CANDIDATE_MANIFEST")"
test "$base_new" != "/" && test "$gen_new" != "/" && test "$harness_new" != "/"
! roots_overlap "$base_new" "$gen_new"
! roots_overlap "$base_new" "$harness_new"
! roots_overlap "$gen_new" "$harness_new"
case "$candidate_real" in
  "$base_new"/*|"$gen_new"/*|"$harness_new"/*)
    printf 'candidate manifest must stay outside fixture roots\n' >&2; exit 64 ;;
esac

git remote get-url "$BASE_REMOTE" >/dev/null
git fetch --no-tags "$BASE_REMOTE" "refs/heads/$BASE_REF"
export BASE_SHA="$(git rev-parse --verify 'FETCH_HEAD^{commit}')"
git worktree add --detach "$BASE_WORKTREE" "$BASE_SHA"
mkdir -p "$GEN_ROOT" "$HARNESS_DIR"
rsync -a --exclude='.git' "$BASE_WORKTREE/" "$GEN_ROOT/"
test "$(git -C "$BASE_WORKTREE" rev-parse HEAD)" = "$BASE_SHA"
printf '%s\n' "$BASE_SHA" > "$HARNESS_DIR/base-sha.txt"
printf '%s\t%s\n' "$BASE_REMOTE" "$BASE_REF" > "$HARNESS_DIR/base-source.tsv"
printf '%s\n' "$FIXTURE_POLICY" > "$HARNESS_DIR/fixture-policy.txt"
printf '%s\n' "$API_REFERENCE_POLICY" > "$HARNESS_DIR/api-reference-policy.txt"
printf '%s\n' "${TARGET_DOCS_DIR:-}" > "$HARNESS_DIR/target-docs-dir.txt"
```

Install the frozen candidate into `$BASE_WORKTREE` with the commands in
[Install In A WDK Docs Workspace](#install-in-a-wdk-docs-workspace). Then use the
manual's credential-scoped, scripts-disabled dependency procedure, remove its
credential config, audit and run the required repository lifecycle in a
secret-free environment, and export the compatibility contract from that clean
base. The exporter therefore uses the renderer's locked parser and slugger:

```bash
(
  set -euo pipefail
  cd "$BASE_WORKTREE"
  shasum -a 256 \
    contributing/wdk-community-module-docs/README.md \
    contributing/wdk-community-module-docs/COMMUNITY_MODULE_DOCUMENTATION_GUIDE.md \
    skills/wdk-community-module-docs/SKILL.md \
    skills/wdk-community-module-docs/scripts/validate-artifacts.mjs \
    > "$HARNESS_DIR/base-installed-artifacts.sha256"
  cmp "$CANDIDATE_MANIFEST" "$HARNESS_DIR/base-installed-artifacts.sha256"
  recorded_base_sha="$(cat "$HARNESS_DIR/base-sha.txt")"
  recorded_base_source="$(cat "$HARNESS_DIR/base-source.tsv")"
  recorded_fixture_policy="$(cat "$HARNESS_DIR/fixture-policy.txt")"
  recorded_api_policy="$(cat "$HARNESS_DIR/api-reference-policy.txt")"
  recorded_target="$(cat "$HARNESS_DIR/target-docs-dir.txt")"
  test "$recorded_base_sha" = "$BASE_SHA"
  test "$recorded_base_source" = "$(printf '%s\t%s' "$BASE_REMOTE" "$BASE_REF")"
  test "$recorded_fixture_policy" = "$FIXTURE_POLICY"
  test "$recorded_api_policy" = "$API_REFERENCE_POLICY"
  test "$recorded_target" = "${TARGET_DOCS_DIR:-}"
  test "$(git rev-parse HEAD)" = "$recorded_base_sha"
  test -d node_modules
  case "$recorded_fixture_policy:$recorded_api_policy" in
    RENDERED:QUARANTINED)
      node skills/wdk-community-module-docs/scripts/validate-artifacts.mjs \
        --emit-baseline-fragments="$recorded_target" \
        --exclude-api-reference --base="$recorded_base_sha" \
        > "$HARNESS_DIR/baseline-fragments.tsv"
      ;;
    RENDERED:IN_SCOPE)
      node skills/wdk-community-module-docs/scripts/validate-artifacts.mjs \
        --emit-baseline-fragments="$recorded_target" --base="$recorded_base_sha" \
        > "$HARNESS_DIR/baseline-fragments.tsv"
      ;;
    CLASSIFICATION_ONLY:NOT_APPLICABLE|CATALOG_ONLY:NOT_APPLICABLE|NO_APPROVED_ROUTE:NOT_APPLICABLE)
      test -z "$recorded_target"
      printf '%s\n' "$recorded_fixture_policy" \
        > "$HARNESS_DIR/baseline-fragments.tsv"
      ;;
    *) exit 64 ;;
  esac
)
```

For a `RENDERED` fixture, set `API_REFERENCE_POLICY=QUARANTINED` only when that
page is excluded from generation; use `IN_SCOPE` when verified ownership places
it in scope. Non-rendered fixtures use `NOT_APPLICABLE`. The validator consumes
the recorded policy and rejects a quarantined API-reference output path.
Quarantine is a diagnostic state, not a publication state: it cannot pass the
final PR-readiness gate or count as near-actual. Resolve ownership and validate
the page in scope, or obtain a maintainer-approved route decision before handoff.
The generator must preserve each fragment beside the same semantic concept,
using an adjacent HTML `id` when the original heading must change. Do not use
trailing `[#id]` or `{#id}` syntax: the renderer and repository link checker do
not share one trailing heading-ID contract. A manifest is
compatibility metadata, not permission to copy target prose or preserve a stale
claim whose concept is no longer source-backed.

Use the worktree only as the current source snapshot. Run generation in
`$GEN_ROOT`, which has no `.git` metadata. Install the frozen candidate
there, then run this complete guarded block. It aborts before deletion if a
variable, root, artifact, target, or dependency-free artifact check is wrong:

```bash
set -euo pipefail
: "${BASE_WORKTREE:?}" "${GEN_ROOT:?}" "${HARNESS_DIR:?}"
: "${BASE_REMOTE:?}" "${BASE_REF:?}"
: "${FIXTURE_POLICY:?}" "${API_REFERENCE_POLICY:?}"
: "${BASE_SHA:?}" "${CANDIDATE_MANIFEST:?}"
case "$BASE_WORKTREE:$GEN_ROOT:$HARNESS_DIR" in
  /*:/*:/*) ;;
  *) printf 'fixture roots must be absolute\n' >&2; exit 64 ;;
esac
roots_overlap() {
  case "$1" in "$2"|"$2"/*) return 0 ;; esac
  case "$2" in "$1"|"$1"/*) return 0 ;; esac
  return 1
}
base_real="$(cd "$BASE_WORKTREE" && pwd -P)"
gen_real="$(cd "$GEN_ROOT" && pwd -P)"
harness_real="$(cd "$HARNESS_DIR" && pwd -P)"
test "$gen_real" != "/"
! roots_overlap "$base_real" "$gen_real"
! roots_overlap "$base_real" "$harness_real"
! roots_overlap "$gen_real" "$harness_real"
test "$(git -C "$BASE_WORKTREE" rev-parse HEAD)" = "$BASE_SHA"
test "$(cat "$HARNESS_DIR/base-sha.txt")" = "$BASE_SHA"
test "$(cat "$HARNESS_DIR/base-source.tsv")" = "$(printf '%s\t%s' "$BASE_REMOTE" "$BASE_REF")"
test "$(cat "$HARNESS_DIR/fixture-policy.txt")" = "$FIXTURE_POLICY"
test "$(cat "$HARNESS_DIR/api-reference-policy.txt")" = "$API_REFERENCE_POLICY"
test "$(cat "$HARNESS_DIR/target-docs-dir.txt")" = "${TARGET_DOCS_DIR:-}"
case "$FIXTURE_POLICY" in
  RENDERED)
    case "$API_REFERENCE_POLICY" in IN_SCOPE|QUARANTINED) ;; *) exit 64 ;; esac
    : "${TARGET_DOCS_DIR:?}"
    case "$TARGET_DOCS_DIR" in content/docs/?*) ;; *) exit 64 ;; esac
    case "$TARGET_DOCS_DIR" in */|*//*) exit 64 ;; esac
    case "/$TARGET_DOCS_DIR/" in */../*|*/./*) exit 64 ;; esac
    ;;
  CLASSIFICATION_ONLY|CATALOG_ONLY|NO_APPROVED_ROUTE)
    test "$API_REFERENCE_POLICY" = "NOT_APPLICABLE"
    test -z "${TARGET_DOCS_DIR:-}"
    ;;
  *) exit 64 ;;
esac
test ! -e "$GEN_ROOT/.git"
test -z "$(find "$GEN_ROOT" -name .git -print -quit)"
test -d "$GEN_ROOT/content/docs"
if test "$FIXTURE_POLICY" = "RENDERED"; then
  test -e "$GEN_ROOT/$TARGET_DOCS_DIR"
fi
test -f "$GEN_ROOT/contributing/wdk-community-module-docs/README.md"
test -f "$GEN_ROOT/contributing/wdk-community-module-docs/COMMUNITY_MODULE_DOCUMENTATION_GUIDE.md"
test -f "$GEN_ROOT/skills/wdk-community-module-docs/SKILL.md"
test -f "$GEN_ROOT/skills/wdk-community-module-docs/scripts/validate-artifacts.mjs"

cd "$GEN_ROOT"
shasum -a 256 \
  contributing/wdk-community-module-docs/README.md \
  contributing/wdk-community-module-docs/COMMUNITY_MODULE_DOCUMENTATION_GUIDE.md \
  skills/wdk-community-module-docs/SKILL.md \
  skills/wdk-community-module-docs/scripts/validate-artifacts.mjs \
  > "$HARNESS_DIR/generation-installed-artifacts.sha256"
cmp "$CANDIDATE_MANIFEST" "$HARNESS_DIR/generation-installed-artifacts.sha256"
node skills/wdk-community-module-docs/scripts/validate-artifacts.mjs \
  > "$HARNESS_DIR/candidate-default-check.log" 2>&1
if test "$FIXTURE_POLICY" = "RENDERED"; then
  node skills/wdk-community-module-docs/scripts/validate-artifacts.mjs \
    --sanitize-generation="$TARGET_DOCS_DIR" \
    > "$HARNESS_DIR/sanitize-generation.log" 2>&1
  test ! -e "$TARGET_DOCS_DIR"
else
  node skills/wdk-community-module-docs/scripts/validate-artifacts.mjs \
    --sanitize-generation \
    > "$HARNESS_DIR/sanitize-generation.log" 2>&1
fi
test -z "$(find "$GEN_ROOT" -name .git -print -quit)"
chmod a-w \
  contributing/wdk-community-module-docs/README.md \
  contributing/wdk-community-module-docs/COMMUNITY_MODULE_DOCUMENTATION_GUIDE.md \
  skills/wdk-community-module-docs/SKILL.md \
  skills/wdk-community-module-docs/scripts/validate-artifacts.mjs
```

Do not remove aggregate pages, adjacent examples, source configuration, or
validation scripts. They are legitimate current style and IA inputs.

Reject symlinks and every form of local/shared Git history. Hash every actual
input file, including ignored files, and record every path's type, mode, hash,
and symlink target in a structured manifest. Keep evidence outside the
generation root:

```bash
find . -type l -print \
  > "$HARNESS_DIR/symlinks.txt"
test ! -s "$HARNESS_DIR/symlinks.txt"
test -z "$(find . -name .git -print -quit)"
if test "$FIXTURE_POLICY" = "RENDERED"; then
  test -z "$(find . -path "*/$TARGET_DOCS_DIR" -print -quit)"
fi
find . -type f -exec shasum -a 256 {} + | sort \
  > "$HARNESS_DIR/allowed-inputs.sha256"
node skills/wdk-community-module-docs/scripts/validate-artifacts.mjs \
  --emit-tree-manifest > "$HARNESS_DIR/allowed-tree.jsonl"
```

Before starting the generation role, require all assertions to pass:

```bash
if test "$FIXTURE_POLICY" = "RENDERED"; then
  test ! -e "$TARGET_DOCS_DIR"
else
  test -z "${TARGET_DOCS_DIR:-}"
fi
test ! -e public/llms.txt
test ! -e public/llms-full.txt
test ! -e public/api/search.json
test ! -e public/api
test ! -e public/og
test ! -e .next
test ! -e .source
test ! -e dist
test ! -e node_modules
test ! -e .wdk-community-module-docs-scratch
test -s "$HARNESS_DIR/allowed-inputs.sha256"
test -s "$HARNESS_DIR/allowed-tree.jsonl"
test -s "$HARNESS_DIR/baseline-fragments.tsv"
test "$(cat "$HARNESS_DIR/base-sha.txt")" = "$BASE_SHA"
test "$(cat "$HARNESS_DIR/base-source.tsv")" = "$(printf '%s\t%s' "$BASE_REMOTE" "$BASE_REF")"
test "$(cat "$HARNESS_DIR/fixture-policy.txt")" = "$FIXTURE_POLICY"
test "$(cat "$HARNESS_DIR/api-reference-policy.txt")" = "$API_REFERENCE_POLICY"
test "$(cat "$HARNESS_DIR/target-docs-dir.txt")" = "${TARGET_DOCS_DIR:-}"
cmp "$CANDIDATE_MANIFEST" "$HARNESS_DIR/base-installed-artifacts.sha256"
cmp "$CANDIDATE_MANIFEST" "$HARNESS_DIR/generation-installed-artifacts.sha256"
test -z "$(find . -name .git -print -quit)"
if test "$FIXTURE_POLICY" = "RENDERED"; then
  test -z "$(find . -path "*/$TARGET_DOCS_DIR" -print -quit)"
fi
test -e "$HARNESS_DIR/allowed-outputs.txt"
case "$FIXTURE_POLICY" in
  RENDERED)
    test -s "$HARNESS_DIR/allowed-outputs.txt"
    ;;
  CLASSIFICATION_ONLY|NO_APPROVED_ROUTE)
    test ! -s "$HARNESS_DIR/allowed-outputs.txt"
    ;;
  CATALOG_ONLY)
    test -s "$HARNESS_DIR/allowed-outputs.txt"
    test -s "$HARNESS_DIR/catalog-output-policy.txt"
    cmp "$HARNESS_DIR/catalog-output-policy.txt" "$HARNESS_DIR/allowed-outputs.txt"
    ;;
  *) exit 64 ;;
esac
if test "$API_REFERENCE_POLICY" = "QUARANTINED"; then
  ! grep -Eq '(^|/)api-reference\.mdx$' "$HARNESS_DIR/allowed-outputs.txt"
fi
```

Create `allowed-outputs.txt` before generation with one exact repo-relative target
or adjacent path per line and no leading `./`. Include only the module page
set and the IA/index/chooser files the pre-draft decision permits. The list is a
maximum write scope, not a required page set or evidence of ownership, release,
IA approval, or API accuracy. A wildcard for all of `content/docs` defeats the
control. `CLASSIFICATION_ONLY` and `NO_APPROVED_ROUTE` require an empty file.
Include every direct-entry aggregate, catalog, chooser, or index whose factual
status or journey the preflight says must be reconciled; omitting one from the
allowlist does not excuse a contradictory public entry point.
For `CATALOG_ONLY`, create a separately approved `catalog-output-policy.txt`
containing only exact catalog/aggregate files, copy it byte-for-byte to
`allowed-outputs.txt`, and forbid module routes and `custom-tree.ts` in that
policy. The preflight rejects policy drift.

If the repo adds another generated search, LLM, cache, export, or prebuilt-docs
surface, add it to the denylist before the next test. A target route may still
appear legitimately in sidebar, catalog, changelog, or inbound links; do not
delete those IA inputs merely to make a text search empty.

Before positive runs, execute a disposable negative control that intentionally
retains one denied mirror or shared-history pointer. The pre-generation
assertions must reject it before any generation role starts. Discard that
fixture; a contaminated output is never a positive result.

### 3. Exercise Different Risks

Use multiple modules rather than repeating one provider pattern:

| Archetype | Risk being tested |
|---|---|
| Community wallet | Risk-based page selection, account API accuracy, chain-specific warnings, quote lifecycle, and cleanup. |
| Swidge provider | Discovery, non-binding quote, requirements, provider-generated payloads, status and recovery. |
| Lending provider | Approval/permit requirements, source-backed preparation/write ordering, positions, health, and stale-state limitations. |
| Gasless or gasfree wallet variant | Unsupported inherited methods, source-backed sponsorship/coordinator/fee-payer roles, conditional service/paymaster/fee-asset behavior, and variant grouping. |
| Sponsored wallet without a paymaster | Holdout proving the rules derive the actual coordinator and fee model instead of importing an EVM or provider-specific paymaster shape. |
| Smart-account wallet | Owner/account model; source-backed coordination, validation, fee sponsorship, deployment/delegation, receipts, replay, recovery, and concurrency. Treat bundlers, paymasters, and EntryPoint as conditional EVM examples. |
| Fiat provider | Server-side credentials, quote/widget distinction, regional/provider-owned availability. |
| Pricing or read-only provider | Data mapping, freshness, rate limits, errors, and absence of write-flow boilerplate. |
| Transitive helper integration | Exact cache-key encoding/collisions, failover triggers, fulfilled-null/empty behavior, retry/rotation scope, and a self-contained first-use path. |
| Nominal cross-package integration | Exact installed dependency graph, runtime constructor identity, and each approval/execution/receipt path that depends on `instanceof` or equivalent checks. |
| Credentialed provider | Provider public/secret key classification, key-to-token exchange/cache/forwarding, browser/server boundary, and useful provisioning links. |
| Lifecycle ownership | Omitted/malformed config errors, retained mutable config, read-once/per-call state, manager caches, disposal eviction, and recreation behavior. |
| Same-package mixed readiness | Separate language/entry-point/symbol/flow ledger rows, independent smoke evidence, blocked-surface exclusion, and consistent chooser/index/page wording. |
| Cross-family decision-steering output | Advisory/binding authority, unknown/time/fallback/revalidation controls, conditional governance, and downstream action boundary outside the pricing family. |
| Observational negative control | Proves decision/governance boilerplate is omitted when data is not used to steer a documented action. |
| Async webhook/idempotent provider | Raw-body signature verification, key rotation, replay, duplicates, ordering, polling disagreement, idempotency binding/conflicts, and reconciliation. |
| Multi-package provider suite | Package-to-role mapping, divergent peers/configuration, mixed stable/prerelease/reference-only/blocked states, catalog rows, and split-page IA. |

Archetype coverage and behavior coverage are independent gates. Run every row in
the manual's [Behavior Coverage Matrix](COMMUNITY_MODULE_DOCUMENTATION_GUIDE.md#behavior-coverage-matrix)
with evaluator-frozen positive and trigger controls. A real module may cover
several rows; use a minimal source microfixture for a missing branch, including a
factory-only creation holdout. Record expected output or abstention before the
generation role starts, and compare assertions rather than prose.

Run classification counterfactuals for a valid known family, a true catalog-only
integration, a true no-route/new-family case, a source-only package with the
manual absent, and unfamiliar custody/authority. Before generation, an
independent evaluator creates `expected-decision.tsv` in an evaluator-only path
that the generation sandbox cannot read. It records expected axes, accepted and
rejected families, catalog permission, canonical-route decision, evidence, and
maintainer questions. Compare the closed generation transcript with that oracle;
empty output alone never proves correct restraint. After freezing the candidate,
select one untouched positive holdout that did not derive a rule. Record its
verdict before any refinement.

Freeze each behavioral case before running it. Keep this record with the
evaluator evidence, not inside the generation root:

```text
case_id: <STABLE_ID>
trigger_expected: <USE_SKILL | DO_NOT_USE_SKILL>
mode: <REVIEW | EDIT | CLASSIFICATION | REGENERATION>
source_lock: <PACKAGE_VERSION_TARBALL_SOURCE_PROVIDER_INPUTS>
fixture_policy: <RENDERED | CLASSIFICATION_ONLY | CATALOG_ONLY | NO_APPROVED_ROUTE>
expected_axes: <AUTHORITY_ACCOUNT_OPERATIONS_SETTLEMENT_TRUST_TOPOLOGY>
accepted_and_rejected_families: <DECISION_AND_REASON>
expected_page_or_catalog_decision: <DECISION>
allowed_and_forbidden_outputs: <EXACT_PATHS>
required_assertions: <RELEASE_READINESS_API_SECURITY_IA_RENDER_JOURNEY>
```

Include positive triggers for authoring/review/testing and negative triggers for
unrelated marketing, design-system, and general copy work. For at least one
neutral holdout, run the same source-locked prompt with this skill and without
specialized instructions; compare invariant assertions and error rates, never
exact prose. Archive prompts, candidate hashes, base SHA, inputs, decisions,
validation, timing, and verdict so a later candidate can rerun the case.

### 4. Preserve Generation Isolation

Generation may inspect public package metadata, exact tarballs, matching source,
tests, examples, provider docs, and current non-target WDK docs. Test mode
overrides normal documentation-PR inspection: do not read a target docs PR body,
diff, files, comments, review notes, commit history, or title. Source-repository
PR code may be used only when it is an approved source input and does not contain
the deleted documentation. The generation role may not use:

- `git show`, `git log -p`, or another history command for the deleted target.
- Another worktree or checkout containing the target docs.
- Search caches, previous generated output, review notes, or gold diffs.
- Persistent agent or workspace memory, chat summaries, or prior-run memory
  stores, even when an ambient runner policy normally recommends using them.
- A reviewer that has already compared the target to the original.

Neutral readiness inputs prepared before deletion may include exact install
transcripts, lockfiles, resolved-graph inventories, smoke transcripts, and
content hashes for package and transitive evidence. Label each proof by scope.
Do not treat a pre-provisioned graph as proof of the public install command, or a
mocked/offline check as proof of live provider behavior.

The generation role may read `baseline-fragments.tsv` as an enumerated harness
input. It may not read the source pages used to create it. If current source no
longer supports a listed concept, stop for a compatibility decision instead of
attaching the fragment to unrelated content.

After preflight, use one fixed, new scratch directory strictly inside `$GEN_ROOT`
for current-MDX dependencies and any separately declared consumer check. The
guarded subshell below creates and canonicalizes it, writes a root-bound sentinel,
branches without dereferencing an unset target, and removes it on success,
failure, or interruption:

```bash
(
set -euo pipefail
set +e
trap '' HUP INT TERM
(
  set -euo pipefail
  : "${GEN_ROOT:?}" "${HARNESS_DIR:?}" "${FIXTURE_POLICY:?}"
  : "${API_REFERENCE_POLICY:?}"
  test "$(cat "$HARNESS_DIR/fixture-policy.txt")" = "$FIXTURE_POLICY"
  test "$(cat "$HARNESS_DIR/api-reference-policy.txt")" = "$API_REFERENCE_POLICY"
  test "$(cat "$HARNESS_DIR/target-docs-dir.txt")" = "${TARGET_DOCS_DIR:-}"
  gen_real="$(cd "$GEN_ROOT" && pwd -P)"
  SCRATCH_DIR="$gen_real/.wdk-community-module-docs-scratch"
  SCRATCH_SENTINEL="$SCRATCH_DIR/.fixture-scratch"
  SCRATCH_CREATED=0
  SCRATCH_INITIALIZED=0

  cleanup_fixture_scratch() {
    rc=$?
    trap - EXIT HUP INT TERM
    if test "$SCRATCH_CREATED" -eq 1; then
      case "$SCRATCH_DIR" in
        "$gen_real"/.wdk-community-module-docs-scratch) ;;
        *) printf 'refusing unsafe scratch cleanup: %s\n' "$SCRATCH_DIR" >&2; exit 1 ;;
      esac
      if test ! -d "$SCRATCH_DIR" || test -L "$SCRATCH_DIR"; then
        printf 'refusing unsafe scratch cleanup: %s\n' "$SCRATCH_DIR" >&2
        exit 1
      fi
      if test "$SCRATCH_INITIALIZED" -eq 1 && \
        { test ! -f "$SCRATCH_SENTINEL" || test -L "$SCRATCH_SENTINEL" || \
          test "$(cat "$SCRATCH_SENTINEL")" != "$SCRATCH_DIR"; }; then
        printf 'refusing unsafe scratch cleanup: %s\n' "$SCRATCH_DIR" >&2
        exit 1
      fi
      rm -rf -- "$SCRATCH_DIR"
    fi
    exit "$rc"
  }
  trap cleanup_fixture_scratch EXIT
  trap '' HUP INT TERM
  test ! -e "$SCRATCH_DIR"
  mkdir -m 0700 "$SCRATCH_DIR"
  SCRATCH_CREATED=1
  test "$(cd "$SCRATCH_DIR" && pwd -P)" = "$SCRATCH_DIR"
  printf '%s\n' "$SCRATCH_DIR" > "$SCRATCH_SENTINEL"
  SCRATCH_INITIALIZED=1
  mkdir "$SCRATCH_DIR/home" "$SCRATCH_DIR/tmp"
  : > "$SCRATCH_DIR/user.npmrc"
  : > "$SCRATCH_DIR/global.npmrc"
  trap 'exit 129' HUP
  trap 'exit 130' INT
  trap 'exit 143' TERM
  cd "$gen_real"

  case "$FIXTURE_POLICY" in
    RENDERED|CATALOG_ONLY)
      slugger_version="$(node -p \
        "require('./package-lock.json').packages['node_modules/github-slugger'].version")"
      typescript_version="$(node -p \
        "require('./package-lock.json').packages['node_modules/typescript'].version")"
      unified_version="$(node -p \
        "require('./package-lock.json').packages['node_modules/unified'].version")"
      remark_parse_version="$(node -p \
        "require('./package-lock.json').packages['node_modules/remark-parse'].version")"
      remark_mdx_version="$(node -p \
        "require('./package-lock.json').packages['node_modules/remark-mdx'].version")"
      mdast_to_string_version="$(node -p \
        "require('./package-lock.json').packages['node_modules/mdast-util-to-string'].version")"
      env -i HOME="$SCRATCH_DIR/home" PATH="$PATH" TMPDIR="$SCRATCH_DIR/tmp" \
        NPM_CONFIG_USERCONFIG="$SCRATCH_DIR/user.npmrc" \
        NPM_CONFIG_GLOBALCONFIG="$SCRATCH_DIR/global.npmrc" \
        npm install --prefix "$SCRATCH_DIR" --ignore-scripts --no-save \
        --registry=https://registry.npmjs.org \
        "github-slugger@$slugger_version" \
        "typescript@$typescript_version" \
        "unified@$unified_version" \
        "remark-parse@$remark_parse_version" \
        "remark-mdx@$remark_mdx_version" \
        "mdast-util-to-string@$mdast_to_string_version"
      ;;
    CLASSIFICATION_ONLY|NO_APPROVED_ROUTE) ;;
    *) exit 64 ;;
  esac

  case "$FIXTURE_POLICY" in
    RENDERED)
      : "${TARGET_DOCS_DIR:?}"
      case "$API_REFERENCE_POLICY" in
        QUARANTINED)
          NODE_PATH="$SCRATCH_DIR/node_modules" \
            node skills/wdk-community-module-docs/scripts/validate-artifacts.mjs \
            --validate-mdx="$TARGET_DOCS_DIR" --exclude-api-reference \
            > "$HARNESS_DIR/current-mdx.log" 2>&1
          ;;
        IN_SCOPE)
          NODE_PATH="$SCRATCH_DIR/node_modules" \
            node skills/wdk-community-module-docs/scripts/validate-artifacts.mjs \
            --validate-mdx="$TARGET_DOCS_DIR" \
            > "$HARNESS_DIR/current-mdx.log" 2>&1
          ;;
        *) exit 64 ;;
      esac
      ;;
    CATALOG_ONLY)
      catalog_mdx_count=0
      : > "$HARNESS_DIR/current-mdx.log"
      while IFS= read -r output; do
        case "$output" in
          content/docs/*.mdx)
            NODE_PATH="$SCRATCH_DIR/node_modules" \
              node skills/wdk-community-module-docs/scripts/validate-artifacts.mjs \
              --validate-mdx="$output" \
              >> "$HARNESS_DIR/current-mdx.log" 2>&1
            catalog_mdx_count=$((catalog_mdx_count + 1))
            ;;
        esac
      done < "$HARNESS_DIR/allowed-outputs.txt"
      test "$catalog_mdx_count" -gt 0
      ;;
    CLASSIFICATION_ONLY|NO_APPROVED_ROUTE)
      test -z "${TARGET_DOCS_DIR:-}"
      printf 'current MDX validation not applicable to %s\n' "$FIXTURE_POLICY" \
        > "$HARNESS_DIR/current-mdx.log"
      ;;
  esac
)
fixture_rc=$?
trap - HUP INT TERM
set -e
if test -e "$GEN_ROOT/.wdk-community-module-docs-scratch" || \
  test -L "$GEN_ROOT/.wdk-community-module-docs-scratch"; then
  printf 'scratch residue remains after fixture command\n' >&2
  exit 1
fi
if test "$fixture_rc" -ne 0; then
  exit "$fixture_rc"
fi
)
```

Include an unset-`TARGET_DOCS_DIR` run under `set -u` for every non-rendered
policy in the regression matrix. Store transcripts outside the fixture and reject
the run if the fixed scratch path, dependencies, or other scratch residue remains
before the final manifest. Do not restore the docs workspace's `node_modules`
during generation. The recorded `API_REFERENCE_POLICY` controls both baseline
export and current-MDX validation. Do not add a second environment flag that can
drift from the frozen fixture evidence.

For the strongest evidence, run the generation role in a filesystem sandbox or
container that mounts only `$GEN_ROOT` plus explicitly approved public source
inputs and denies sibling checkouts, evaluator output, and the decision oracle.
Otherwise label the result
`history-sanitized-and-instructed`, not blind or filesystem-enforced. A detached
snapshot removes local target history and mirrors, but a prompt alone cannot
prevent an unrestricted process from reading another path or public gold.

### 5. Evaluate After Generation

Close the generation role, then hash the full filesystem again. Compare the
before/after manifests, not only the target directory, and require every changed
path to match the fixture's target-plus-adjacent-output allowlist. The structured
gate rejects baseline deletion, type or mode changes, symlinks, special files,
unapproved files, and empty/unrelated directories:

```bash
test ! -e .wdk-community-module-docs-scratch
test -z "$(find . -name .git -print -quit)"
find . -type f -exec shasum -a 256 {} + | sort \
  > "$HARNESS_DIR/final-files.sha256"
diff -u \
  "$HARNESS_DIR/allowed-inputs.sha256" \
  "$HARNESS_DIR/final-files.sha256" \
  > "$HARNESS_DIR/full-output.diff" || true
node skills/wdk-community-module-docs/scripts/validate-artifacts.mjs \
  --emit-tree-manifest > "$HARNESS_DIR/final-tree.jsonl"
diff -u "$HARNESS_DIR/allowed-tree.jsonl" "$HARNESS_DIR/final-tree.jsonl" \
  > "$HARNESS_DIR/full-tree.diff" || true
node skills/wdk-community-module-docs/scripts/validate-artifacts.mjs \
  --check-isolated-output="$HARNESS_DIR" \
  > "$HARNESS_DIR/typed-tree-check.log" 2>&1
shasum -a 256 \
  contributing/wdk-community-module-docs/README.md \
  contributing/wdk-community-module-docs/COMMUNITY_MODULE_DOCUMENTATION_GUIDE.md \
  skills/wdk-community-module-docs/SKILL.md \
  skills/wdk-community-module-docs/scripts/validate-artifacts.mjs \
  > "$HARNESS_DIR/final-installed-artifacts.sha256"
cmp "$CANDIDATE_MANIFEST" "$HARNESS_DIR/final-installed-artifacts.sha256"
test -z "$(find . -name .git -print -quit)"
printf 'history-free generation snapshot; Git status not applicable\n' \
  > "$HARNESS_DIR/generation-status.txt"
```

For a positive fixture, archive `full-tree.diff` and the passing structured-gate
log. The gate allows content changes to an existing allowlisted regular file but
not deletion, type or mode changes. New regular files must be allowlisted and
mode `0644`; new directories must be mode `0755` ancestors of an actual new
allowlisted file. It rejects symlinks, special paths, and unrelated empty
directories.

For `CLASSIFICATION_ONLY` and `NO_APPROVED_ROUTE`, the independent evaluator
checks the frozen report against its private decision oracle and requires the
typed tree to be unchanged; there is no rendered output to copy or build. For
`RENDERED` and `CATALOG_ONLY`, copy only allowed generated outputs into a
separate clean evaluation worktree.

Install the same frozen artifacts there. The evaluator may compare with the
approved base, run the changed-MDX gate, recreate generated assets, and run the
site build. Source and the published package remain authoritative for API and
release claims.

Run deterministic/offline snippet checks separately from authorized live-provider
checks. Deterministic controls may use fakes to verify local branching, errors,
and payload handling, but cannot prove provider-owned facts. Classify transient
rate limits, authentication blocks, timeouts, and provider outages as blocked
live evidence rather than API failure. Report a live pass only when the exact
published live path completed successfully; do not silently substitute a mock.

Create the evaluation worktree from the recorded commit, not a moving branch.
Apply the same canonical pairwise-disjoint root guard used above before creating
it:

```bash
set -euo pipefail
: "${EVAL_WORKTREE:?Set a new absolute evaluation-worktree path}"
case "$EVAL_WORKTREE" in
  /*) ;;
  *) printf 'evaluation root must be absolute\n' >&2; exit 64 ;;
esac
test ! -e "$EVAL_WORKTREE"
roots_overlap() {
  case "$1" in "$2"|"$2"/*) return 0 ;; esac
  case "$2" in "$1"|"$1"/*) return 0 ;; esac
  return 1
}
base_real="$(cd "$BASE_WORKTREE" && pwd -P)"
gen_real="$(cd "$GEN_ROOT" && pwd -P)"
harness_real="$(cd "$HARNESS_DIR" && pwd -P)"
eval_parent="$(dirname "$EVAL_WORKTREE")"
eval_real="$(cd "$eval_parent" && pwd -P)/$(basename "$EVAL_WORKTREE")"
test "$eval_real" != "/"
! roots_overlap "$eval_real" "$base_real"
! roots_overlap "$eval_real" "$gen_real"
! roots_overlap "$eval_real" "$harness_real"
git worktree add --detach "$EVAL_WORKTREE" "$BASE_SHA"
test "$(git -C "$EVAL_WORKTREE" rev-parse HEAD)" = "$BASE_SHA"
```

Install the frozen candidate into `$EVAL_WORKTREE`, then run:

```bash
set -euo pipefail
(
  cd "$EVAL_WORKTREE"
  shasum -a 256 \
    contributing/wdk-community-module-docs/README.md \
    contributing/wdk-community-module-docs/COMMUNITY_MODULE_DOCUMENTATION_GUIDE.md \
    skills/wdk-community-module-docs/SKILL.md \
    skills/wdk-community-module-docs/scripts/validate-artifacts.mjs \
    > "$HARNESS_DIR/evaluator-installed-artifacts.sha256"
  cmp "$CANDIDATE_MANIFEST" "$HARNESS_DIR/evaluator-installed-artifacts.sha256"
)
```

When API-reference ownership cannot be established without denied history or a
missing generator mapping, quarantine that page rather than treating its
allowlist entry as authorization. Continue independently verifiable prose only
when the remaining route is coherent. The evaluator may retain the baseline
generated API page solely for render checks, but must report that API-reference
regeneration was excluded and that the result is incomplete, not PR-ready.

Archive each exact command with UTC time, cwd, base SHA, Node/npm versions,
stdout/stderr, and exit code outside both roots. Clean generated output before a
retry and record default-runtime and Node `22.22.2` attempts separately.

One zsh-compatible evaluator wrapper is:

```bash
set -euo pipefail

run_logged() (
  label="$1"
  shift
  log="$HARNESS_DIR/$label.log"
  {
    date -u '+utc=%Y-%m-%dT%H:%M:%SZ'
    printf 'cwd=%s\n' "$PWD"
    printf 'base=%s\n' "$(git rev-parse HEAD)"
    printf 'node=%s npm=%s\n' "$(node --version)" "$(npm --version)"
    printf 'command='; printf ' %q' "$@"; printf '\n'
    set +e
    "$@"
    rc=$?
    set -e
    printf 'exit=%s\n' "$rc"
    exit "$rc"
  } > "$log" 2>&1
)

test "$(git rev-parse HEAD)" = "$BASE_SHA"
run_logged 00-artifacts \
  node skills/wdk-community-module-docs/scripts/validate-artifacts.mjs
run_logged 00-self-test \
  node skills/wdk-community-module-docs/scripts/validate-artifacts.mjs --self-test
run_logged 00-changed-mdx \
  node skills/wdk-community-module-docs/scripts/validate-artifacts.mjs \
  --docs-changed --base="$BASE_SHA"
run_logged 00-pr-ready \
  node skills/wdk-community-module-docs/scripts/validate-artifacts.mjs \
  --pr-ready --api-reference-policy="$HARNESS_DIR/api-reference-policy.txt"
run_logged 00-diff-check git diff --check
run_logged 01-check-meta npm run check:meta
run_logged 02-check-redirects npm run check:redirects
export LINK_CHECK_EXTERNAL=false
run_logged 03-check-links npm run check:links
run_logged 04-build npm run build
run_logged 05-quality npm run quality
```

The wrapper preserves the real exit code. Report a pass only when the wrapper
returns zero and the transcript records `exit=0`. Before relying on a changed
wrapper, run it under zsh with a successful command and a command that exits `7`;
require the same exit codes in the transcripts and no skipped cleanup or later
command.

For a maintainer-approved MDX deletion or rename, replace only the
`00-changed-mdx` invocation with the manual's `--route-decisions=<absolute-path>`
form. Keep that decision file outside every repo/worktree and require its
`baseCommit` to equal `$BASE_SHA`. The validator checks structure but does not
authenticate the approval assertion. Without the file, the changed-page gate
must reject all deletions and renames. In disposable route-migration regressions, verify
deletion and rename without a manifest both fail, exact operator-asserted
manifests pass structural checks, and a
stale base, missing redirect, incomplete fragment map, or in-repo manifest fails.

Run separate passes for:

- API, release, security, and provider-generated payload accuracy.
- Page completeness, reader journey, frontmatter, links, and sidebar placement.
- Wallet-specific behavior.
- Protocol/provider behavior.
- Future-fit and overfitting.
- Skill/manual/operator alignment.
- Test isolation, candidate hashes, diff scope, validation, and cleanup.

### 6. Apply The Acceptance Gate

A run is near-actual only when:

- Installed candidate hashes match the frozen candidate.
- No Blocker or High finding remains for API, release, security, write ordering,
  IA, render quality, or partner journey.
- Every executable fence passed an exact clean-consumer check. Reference-only and
  draft-only scopes contain declaration-only or labeled `text` guidance, not
  runnable setup/task fences with a disclaimer nearby.
- Every nominal cross-package path uses one verified runtime class identity;
  duplicate nested identities block the affected execution claim.
- Promised integrations are self-contained; exact helper behavior, credential
  transformation, error propagation, reported-versus-enforced values, lifecycle
  ownership, specific provider links, and family aggregates are consistent.
- Every manual behavior-matrix row has a frozen positive and trigger control,
  expected branch, independent assertion, and passing transcript; family variety
  alone does not satisfy this gate.
- Every required validation command passed exactly as reported.
- The changed-MDX gate passed, and semantic fragment review confirmed that
  compatibility IDs still land beside the same symbol or concept.
- Differences from the original are explained as source-backed improvements or
  equally valid editorial choices, not silently ignored.
- The generated worktree remains unstaged and no commit, push, or PR occurred.
- The isolation grade and any unavailable enforcement are reported accurately.
- The full before/after manifest, allowed adjacent outputs, command transcripts,
  and candidate hashes are archived outside the fixture.
- The negative control failed before generation, and the manual-absent,
  known-family, unfamiliar-family, catalog-only, true no-route, source-only, and
  untouched holdout outcomes match the evaluator-only decision oracle.
- Same-package mixed-readiness, cross-family steering, observational negative,
  and manual-absent `IN_SCOPE`/`NOT_APPLICABLE`/`QUARANTINED` policy branches ran.

### 7. Refine Without Overfitting

Promote a test finding into the manual or skill only when it expresses a general
capability, evidence, trust-boundary, safety, IA, or reader-journey invariant.
Keep package names, provider field names, network lists, and one-off quirks in
the module docs or evidence notes.

Prefer conditional rules such as "when the package exposes a requirements
helper" over requiring one provider's API shape for an entire family. Confirm a
new general rule against at least two archetypes or a stable interface contract
when practical. Re-run every fixture affected by a revised rule.

Reinstall all four artifacts after any candidate change. Rerun generation for
every archetype whose inputs or expected decision changed, plus one unaffected
control. Rerun the full matrix when classification, source locking, snippet
safety, IA, or the core workflow changed broadly. Matching hashes without a new
generation run prove installation only, not behavior.

## Maintenance

Keep `SKILL.md` under 500 lines and update it for workflow behavior. Put detailed
page/family/evidence policy in the standalone manual, operator/test changes here,
and deterministic non-provider checks in the validator.

Before handing off a new version:

- Verify all four installed paths and run the artifact validator.
- In a separate fixture, install only the skill directory (`SKILL.md` plus the
  validator), run `--skill-only`, and test a source-only package plus unfamiliar
  authority/custody. It must report missing guides and avoid invented release,
  install, family, route, or page claims. Also test a lone `SKILL.md` as degraded
  guidance that reports validation unavailable rather than claiming it passed.
- With the manual absent, run the validator's three API-policy states in a Git
  evaluator: `IN_SCOPE` and `NOT_APPLICABLE` can pass their truthful scopes;
  `QUARANTINED` and missing policy must fail PR readiness.
- Confirm the manual remains sufficient for a human partner without the skill.
- Confirm no rendered navigation changed for contributor-only artifacts.
- Record exact validation results and unresolved maintainer questions.

## Troubleshooting

| Symptom | Cause | Resolution |
|---|---|---|
| The skill is not selected. | The runtime did not auto-load workspace skills or the prompt was too broad. | Name `skills/wdk-community-module-docs/SKILL.md` explicitly. |
| The manual is not loaded. | The package was installed with the old layout or only `SKILL.md` was copied. | Reinstall all four current paths and run the validator. |
| A package is called unpublished after a registry error. | Failed access was mistaken for authoritative absence. | Use `unverified/blocked`, report the failed check, and request maintainer evidence. |
| A new API reference is absent from status or a PR. | The generated-file ignore rule matched it. | Verify tracking explicitly and intentionally include the page during requested PR staging. |
| The local page renders but is absent from the sidebar. | The rendered tree was not updated. | Update `src/lib/custom-tree.ts` only when that page is intended to appear. |
| A released package has no reliable quickstart. | Release state was confused with documentation readiness. | Mark setup reference-only until a clean graph, declarations, imports, and minimal construction path pass. |
| A link check passes but an old deep link lands on the wrong overload. | Only fragment existence was preserved. | Move the compatibility ID beside the same semantic symbol and update the fragment ledger. |
| A table passes prose review but fails MDX compilation. | A cell contains an unescaped union pipe, raw generic, or object expression. | Escape literal pipes, wrap simple types in code, move complex shapes below the table, and rerun the build. |
| A JavaScript/TypeScript example is only a fragment. | API notation or partial control flow was labeled executable. | Make it valid code/declarations or use a labeled `text` fence. |
| A reference-only page still looks copyable. | Readiness was applied to prose, not each fence. | Replace runtime JS/TS and install/console fences with labeled `text`; retain only exact declaration-only fences. |
| A snippet parses but fails when copied. | Syntax validation was mistaken for package/API validation. | Type-check and minimally exercise that exact fence in the selected clean dependency graph, including class-versus-factory invocation. |
| A pre-provisioned consumer runs but a fresh install was never attempted. | Resolved-graph evidence was mistaken for install-command evidence. | Run the exact public install command from an empty disposable consumer, or keep install/setup fences reference-only. |
| An offline mock passes but the provider returns `429` or is unavailable. | Deterministic and live-provider evidence were conflated. | Preserve the source-valid deterministic result, mark the live claim blocked, and rerun the exact authorized live lane before claiming it passed. |
| A compatible-looking account is rejected at runtime. | Two packages resolved different copies of a nominal class. | Compare actual constructor identities through every affected path and block execution until the exact graph is aligned and rehearsed. |
| Build fails only under a newer Node runtime. | Repository runtime drift may be involved. | Retry the exact failed build or quality command under Node `22.22.2` and report both results. |
