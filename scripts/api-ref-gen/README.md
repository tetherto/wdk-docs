# WDK API Reference Automation

This directory contains the automation that generates and updates WDK API reference pages from multiple upstream repositories.

The system is built for a docs repository that does **not** live in the same repo as the SDK modules it documents. Instead of reading local packages in a monorepo, it:

1. tracks upstream module tags per repo
2. detects every pending version between the last synced tag and the latest allowed tag
3. generates docs for each pending version in order
4. records sync history separately from the docs PR branch
5. opens a single docs PR with one commit per version bump

## What Problem This Solves

WDK modules are published from separate repositories under `tetherto/*`. That creates a few problems for docs automation:

- the docs repo cannot rely on a local monorepo package graph
- multiple module tags can be published between docs runs
- generated docs need review before merge
- sync state must survive even if an auto-generated PR is closed or the update branch is deleted

This system addresses those constraints with two dedicated automation branches:

- `auto/api-ref-sync`
  Stores the durable sync state and version history.
- `auto/api-ref-update`
  Stores the current open docs-update PR branch.

## High-Level Flow

### 1. Restore sync state

The workflow restores these files from `auto/api-ref-sync`:

- `last-synced-shas.json`
- `sync-history.json`

These files are the source of truth for what versions have already been processed.

### 2. Enumerate pending tags

For each module, the generator:

- lists all allowed tags from the upstream repo
- sorts them in semver order
- finds every tag strictly after the stored sync tag

This avoids the old "latest tag only" behavior where intermediate releases were lost.

### 3. Generate docs per version

For each pending tag, oldest to newest:

1. clone the upstream repo at that exact tag
2. install dependencies
3. run TypeDoc to JSON
4. transform TypeDoc JSON to MDX
5. compare the generated output with the current docs page
6. record a `VersionStep` summary

If docs changed, the workflow snapshots that generated file so it can later create one docs commit per version.

If docs did **not** change, the version is still recorded in history as a note-only step.

If one tag fails, later tags for that module are left pending.

### 4. Enrich the version metadata

For each processed tag, the system also tries to fetch:

- GitHub release body
- compare URL / compare metadata fallback

That data is used in:

- the sticky PR comment
- the sync history record
- the GitHub Actions step summary

### 5. Detect ripple risks

After a docs change, the generator compares the previous and new API reference output and extracts removed symbols/headings.

It then scans sibling docs in the same module directory to see whether those removed symbols are still referenced elsewhere.

Warnings are recorded on the `VersionStep` as `rippleWarnings`.

### 6. Render PR metadata

The renderer builds:

- a short PR body
- a sticky PR comment with per-version history
- a GitHub Actions step summary

These are rendered from structured data, not shell-assembled markdown.

### 7. Update branches

If the build succeeds:

- `auto/api-ref-sync` is updated with the latest sync state and history
- `auto/api-ref-update` gets one commit per changed version
- the workflow creates or updates the docs PR

## Data Model

### `last-synced-shas.json`

Maps each module key to its latest synced upstream tag and SHA.

Example:

```json
{
  "wallet-spark": {
    "tag": "v1.0.0-beta.16",
    "sha": "d6b4b88f5622537132d0c9f81864897ba76c5f59"
  }
}
```

### `sync-history.json`

Stores ordered per-version history by module key.

Shape:

```json
{
  "wallet-spark": [
    {
      "key": "wallet-spark",
      "fromTag": "v1.0.0-beta.15",
      "toTag": "v1.0.0-beta.16",
      "sha": "d6b4b88f5622537132d0c9f81864897ba76c5f59",
      "docChanged": true,
      "status": "ok",
      "stats": {
        "lines": 1239,
        "classes": 3,
        "types": 33,
        "functions": 0,
        "enums": 0,
        "outputPath": "content/docs/sdk/wallet-modules/wallet-spark/api-reference.mdx"
      },
      "outputPath": "content/docs/sdk/wallet-modules/wallet-spark/api-reference.mdx",
      "releaseUrl": "https://github.com/tetherto/wdk-wallet-spark/releases/tag/v1.0.0-beta.16",
      "compareUrl": "https://github.com/tetherto/wdk-wallet-spark/compare/v1.0.0-beta.15...v1.0.0-beta.16",
      "releaseBody": "## What's Changed ...",
      "rippleWarnings": []
    }
  ]
}
```

### `VersionStep`

This is the core record that everything downstream consumes.

Fields:

- `key`
- `fromTag`
- `toTag`
- `sha`
- `docChanged`
- `status`
- `stats`
- `outputPath`
- `releaseUrl`
- `compareUrl`
- `releaseBody`
- `rippleWarnings`

## Files In This Directory

### Runtime

- `core.mjs`
  Main orchestration logic for module selection, pending-tag enumeration, sync-state updates, upstream cloning, TypeDoc execution, metadata enrichment, ripple detection, and summary writing.
- `generate.mjs`
  Thin CLI entrypoint that calls `core.mjs`.
- `transform.mjs`
  Converts TypeDoc JSON into the MDX page written into `content/docs/.../api-reference.mdx`.
- `render.mjs`
  Renders PR body, sticky PR comment, and GitHub Actions step summary from structured run data.
- `summary.mjs`
  Reads `.generate-summary.json` and exports workflow-friendly summaries such as "which doc steps changed" and aggregate counts.
- `modules.json`
  Registry of all supported upstream modules, including repo, entry point, output path, and default export rename.

### State

- `last-synced-shas.json`
  Latest synced tag/SHA by module.
- `sync-history.json`
  Durable per-version history by module.
- `.generate-summary.json`
  Per-run artifact used by workflow rendering and PR orchestration.

### Tests and Fixtures

- `test/core.test.mjs`
  Generator and state-contract tests.
- `test/render.test.mjs`
  Renderer snapshot tests.
- `test/summary.test.mjs`
  Summary/helper tests.
- `test/fixtures/`
  Recorded Spark fixtures used to test backlog replay without live network calls.

### Reference Material

- `samples/`
  Example TypeDoc JSON and generated MDX output.
- `REPORT-2026-04-03.md`
  Earlier working notes for the generator.

## Workflow Behavior

The GitHub Actions workflow lives at:

- `.github/workflows/generate-api-ref.yml`

Key behavior:

- supports `workflow_dispatch`
- supports `repository_dispatch`
- defaults scheduled and manual runs to all active modules
- replays pending tags with `replay_pending=true`
- keeps `force=true` restricted to single-module manual runs
- updates the sticky comment using pinned actions
- builds the docs site before updating remote automation branches

## Local Usage

Install generator dependencies:

```bash
cd scripts/api-ref-gen
npm install
```

List modules:

```bash
node generate.mjs --list
```

Replay pending versions for a single module:

```bash
node generate.mjs --module wallet-spark --replay-pending
```

Force a single-module refresh:

```bash
node generate.mjs --module wallet-spark --force
```

Run from a pre-built TypeDoc JSON fixture:

```bash
node generate.mjs --module wallet-spark --typedoc-json ./path/to/typedoc-output.json
```

Render PR outputs locally from the latest summary:

```bash
node render.mjs --mode pr-body --output /tmp/pr-body.md
node render.mjs --mode pr-comment --output /tmp/pr-comment.md
node render.mjs --mode step-summary --output /tmp/step-summary.md
```

Run tests:

```bash
npm test
```

## Current Design Tradeoffs

Generated API reference pages include:

- SEO frontmatter: `title`, `description`, `docType: reference`,
  `schemaType: APIReference`, and `icon`
- Table of contents: one row per class, linking to its section
- Per-class sections: constructor signature, methods summary table, then
  detailed method docs with parameters, return types, `@throws`, and `@example`
- Properties: from accessor (getter) declarations
- Types section: interfaces and type aliases with property tables
- Source links: deep links to the exact line on GitHub when available

This system is intentionally split into:

- extraction/state logic in JS
- TypeDoc-to-MDX transformation
- PR/comment rendering
- workflow orchestration

That separation makes local testing possible, but a few content-quality gaps still exist:

- manual footer content on some API pages must be preserved or re-appended
- external alias-heavy types may need curated overrides if TypeDoc only exposes them as package references
- same-page anchor validation should remain part of the local test gate

## Recommended Mental Model

If someone is exploring this directory for the first time, think of it in four layers:

1. `modules.json` says **what repos/pages exist**
2. `core.mjs` says **what versions need processing**
3. `transform.mjs` says **how TypeDoc becomes docs content**
4. `render.mjs` + workflow say **how that work becomes a PR**

That is the full API reference automation pipeline.
