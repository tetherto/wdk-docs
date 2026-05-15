# WDK API Reference Automation — Proposal

## TL;DR

We built a pipeline that auto-generates API reference docs from SDK source code using TypeDoc → MDX. It's been validated against 5 live SDK repos.

To automate it, the **docs repo polls** each SDK repo's release tags every 6 hours via `git ls-remote --tags`, parses semver, compares against the last processed tag, and only regenerates modules with a new release. This approach requires **zero changes to any SDK repo** — no trigger workflows, no cross-repo tokens, no coordination across 15 repos. Docs update when code is published, not when it's merged.

**What the team needs to provide:** nothing right now. All `@tetherto` packages are public on npm. One ask: **use consistent `vMAJOR.MINOR.PATCH-beta.N` tag format** across SDK repos going forward.

---

## How It Works

```
Docs Repo (wdk-docs-migration)
═══════════════════════════════

  Every 6 hours (cron)
       │
       ▼
  ┌──────────────────────────────────────────────────┐
  │ generate-api-ref.yml                             │
  │                                                  │
  │ 1. For each module in modules.json               │
  │    → git ls-remote --tags {repo}                 │
  │    → Parse semver, filter to beta/stable          │
  │    → Compare latest tag with last-synced-shas.json│
  │ 2. Skip unchanged modules                        │
  │ 3. Clone at exact release tag                    │
  │ 4. TypeDoc → transform → write MDX               │
  │ 5. Update stored tag+SHA (only on success)       │
  │ 6. Build site (quality gate)                     │
  │ 7. Create/update PR if output changed            │
  └──────────────────────────────────────────────────┘
              │
              ▼
  ┌──────────────────────────────────────────────────┐
  │ Auto-PR                                          │
  │ "docs(api-ref): auto-update API references"      │
  │                                                  │
  │ Existing quality-gates.yml and                   │
  │ pr-preview-vercel.yml run on this PR             │
  └──────────────────────────────────────────────────┘
```

### Why Release Tags, Not `main`

Jonathan raised a key insight: `main` will increasingly contain unreleased code. With the new automated release process pushing more frequent version bumps, the release tag is the real signal that code is published and installable. Generating docs from `main` would document APIs that users can't actually access yet.

By triggering on release tags:
- **Docs match npm** — generated API reference reflects what users can `npm install`
- **No noise from WIP** — unreleased features, experiments, or reverts on `main` don't affect docs
- **Clean audit trail** — `last-synced-shas.json` shows exactly which release version each module's docs were generated from

### Why Polling, Not Push

The original approach required adding a trigger workflow (`.github/workflows/trigger-docs-update.yml`) to each of the 15+ SDK repos, plus a cross-repo auth token (`DOCS_DISPATCH_TOKEN`). This created:

- **Iteration friction** — updating the trigger means PRs to 15 repos
- **Token management** — PATs expire, GitHub Apps need org-level setup
- **Onboarding overhead** — every new SDK module requires a workflow addition

The polling approach eliminates all of this. The docs repo owns the entire automation. Adding a new module is a one-line addition to `modules.json`.

### Three Trigger Modes

| Mode | When | What Happens |
|------|------|--------------|
| **Scheduled cron** (primary) | Every 6 hours | Checks all repos for new release tags, regenerates only changed modules |
| **`workflow_dispatch`** (manual) | Developer clicks "Run workflow" | Regenerate a specific module or all — with optional force flag to bypass tag check |
| **`repository_dispatch`** (opt-in) | SDK team adds a trigger (optional) | Instant update for teams that want near-realtime docs sync |

### Key Design Decisions

- **Tag-based, not branch-based** — the generator clones at the exact release tag (e.g., `v1.0.0-beta.10`), not `main`. Docs always reflect published releases.
- **Semver-aware** — tags are parsed and sorted by semver. Only beta and stable releases are considered. RC, alpha, and non-semver tags (e.g., `integration-rn-starter`) are filtered out.
- **PRs, not direct pushes** — all generated content goes through a single auto-PR (`auto/api-ref-update`) that gets updated in-place on each run. No PR sprawl.
- **Tag+SHA tracking** — `last-synced-shas.json` stores both the tag name and its SHA per module, so re-tagged releases are also detected.
- **Failure isolation** — if generation fails for one module, its tag state is not updated. The next run will retry it. Successfully generated modules keep their new state.
- **Existing CI reused** — the auto-PR triggers `quality-gates.yml` (link check + build) and `pr-preview-vercel.yml` (Vercel preview) automatically.

### Tradeoffs

| Aspect | Implication |
|--------|-------------|
| **Latency** | Docs update within 6 hours of a new release tag. Manual `workflow_dispatch` available for instant regeneration. |
| **API rate limits** | 13 `git ls-remote --tags` calls per run. No GitHub API quota consumed (ls-remote uses Git protocol). |
| **CI minutes** | No-change runs take ~30 seconds (just tag checks). Only modules with new releases trigger the full clone → TypeDoc → transform pipeline. |
| **Higher release cadence** | Works well — more frequent releases mean the cron picks up changes regularly. We can increase frequency to every 3 hours during release sprints. |

---

## What We Need From the Team

### Nothing — for now

All `@tetherto` packages are currently public on npm, so the generator works without any secrets. No cross-repo auth tokens. No workflow files in SDK repos. No coordination across 15 repositories.

| What was needed before | What's needed now |
|------------------------|-------------------|
| `DOCS_DISPATCH_TOKEN` (cross-repo PAT or GitHub App) | **Not needed** |
| `trigger-docs-update.yml` in 15 SDK repos | **Not needed** |
| `NPM_READ_TOKEN` for private packages | **Not needed** (all packages are public) |

> **Future-proofing:** If any `@tetherto` dependency is published as private in the future, the generator already supports an `NPM_READ_TOKEN` secret. Just add it to the docs repo's Actions secrets — no code changes required.

### One ask: Consistent tag format

The automation parses semver tags to find the latest release. It currently handles inconsistencies across repos, but consistent tagging makes everything more robust.

**Current state across 13 repos:**

| Issue | Repos affected | Example |
|-------|---------------|---------|
| Missing `v` prefix | core, evm, ton, tron, solana | `1.0.0-beta.2` instead of `v1.0.0-beta.2` |
| Non-semver tags | 8 repos | `integration-rn-starter` |
| Typo tag | wallet-spark | `v1.0.0-beta2` (missing dot before number) |
| RC tag | wallet-evm | `v2.0.0-rc.1` |

The generator handles all of these (filters non-semver, normalizes `v` prefix, skips RC/alpha). But going forward:

**Recommended format: `vMAJOR.MINOR.PATCH-beta.N`** (e.g., `v1.0.0-beta.6`)

---

## What's Already Built

| Component | Status | Details |
|-----------|--------|---------|
| `generate.mjs` | Complete | CLI — clones SDK repo at release tag, runs TypeDoc, transforms to MDX, writes output. Supports `--check-updates` for tag-based change detection and `--force` to bypass it. Includes semver parsing, tag filtering (beta/stable only), and SHA tracking. |
| `transform.mjs` | Complete | TypeDoc JSON → Fumadocs MDX converter with: class/type/method cross-linking, MDX-safe escaping, source blocks with GitHub links, deep-link anchors, inheritance info extraction, empty type stub filtering. |
| `modules.json` | Complete | Registry of 15 modules with repo URL, entry point, output path, deprecation flags |
| `last-synced-shas.json` | Complete | Tag+SHA tracking file — stores `{ tag, sha }` per module for change detection |
| `generate-api-ref.yml` | Complete | Docs-side GitHub Actions workflow with 6-hour cron, manual trigger, and optional dispatch trigger |
| Quality gates | Existing | `quality-gates.yml` (link check + meta check + build) runs on every PR |
| Vercel preview | Existing | `pr-preview-vercel.yml` deploys preview on every PR |
| Multi-module validation | Complete | Tested on 5 live SDK repos — all passed (see below) |

### Validated Against Live SDK Repos

The generator has been tested against 5 real SDK repos by cloning from GitHub at their latest beta tag, running TypeDoc, and producing full MDX output:

| Module | Tag | Lines | Classes | Types | Result |
|--------|-----|-------|---------|-------|--------|
| `wallet-evm` | `v1.0.0-beta.10` | 963 | 3 | 16 | Pass |
| `core` | `v1.0.0-beta.6` | 266 | 1 | 4 | Pass |
| `wallet-btc` | `v1.0.0-beta.8` | 2,300 | 10 | 15 | Pass |
| `wallet-solana` | `v1.0.0-beta.5` | 746 | 3 | 9 | Pass |
| `lending-aave-evm` | `v1.0.0-beta.3` | 341 | 1 | 10 | Pass |

All outputs include working cross-links, source blocks, type resolution, inheritance info, and MDX-safe escaping. Empty type stubs (re-exported references like `FeeRates`, `KeyPair`) are filtered out.

### Tag Change Detection — Tested

The `--check-updates` mode has been verified against all 13 active SDK repos:

- **All tags null (first run):** detects all 13 modules as new releases, shows tag names (e.g., `● wallet-evm — new: v1.0.0-beta.10`)
- **All tags current:** reports "All modules up to date. Nothing to regenerate." and exits in under 30 seconds
- **RC tags:** correctly filtered — `wallet-evm` resolves to `v1.0.0-beta.10`, not `v2.0.0-rc.1`
- **Non-semver tags:** `integration-rn-starter` and similar are silently ignored
- **Tag transitions:** shows the version change (e.g., `● wallet-btc — v1.0.0-beta.7 → v1.0.0-beta.8`)

### Generator Capabilities

- Extracts classes, constructors, methods, properties, types, functions, and enums from SDK source
- Resolves concrete return types via TypeScript compiler (e.g., `Promise<TransactionResult>` even when JSDoc says `{Promise}`)
- Generates GitHub source links for every class member, pointing to the exact release tag
- Cross-links class names, type names, and method names within descriptions
- Extracts and renders `@example` blocks as fenced code snippets
- Shows class inheritance info (`Extends @tetherto/wdk-wallet`) from TypeDoc's `extendedTypes` metadata
- Filters out empty type stubs — re-exported type aliases with no documentable content are omitted
- Escapes MDX-unsafe characters (`<`, `>`, `{`, `}`) in type signatures
- Handles overloaded method signatures, static methods, optional parameters
- Skips private/protected constructors and `@internal` members
- Guards against circular type references and oversized output
- Supports pre-built TypeDoc JSON input (for local testing without cloning)

---

## Covered Modules

| Module Key | Repository | Latest Tag | Package |
|------------|-----------|------------|---------|
| `core` | `tetherto/wdk-core` | `v1.0.0-beta.6` | `@tetherto/wdk` |
| `wallet-btc` | `tetherto/wdk-wallet-btc` | `v1.0.0-beta.8` | `@tetherto/wdk-wallet-btc` |
| `wallet-evm` | `tetherto/wdk-wallet-evm` | `v1.0.0-beta.10` | `@tetherto/wdk-wallet-evm` |
| `wallet-evm-erc-4337` | `tetherto/wdk-wallet-evm-erc-4337` | `v1.0.0-beta.5` | `@tetherto/wdk-wallet-evm-erc4337` |
| `wallet-ton` | `tetherto/wdk-wallet-ton` | `v1.0.0-beta.7` | `@tetherto/wdk-wallet-ton` |
| `wallet-ton-gasless` | `tetherto/wdk-wallet-ton-gasless` | `v1.0.0-beta.4` | `@tetherto/wdk-wallet-ton-gasless` |
| `wallet-tron` | `tetherto/wdk-wallet-tron` | `v1.0.0-beta.4` | `@tetherto/wdk-wallet-tron` |
| `wallet-tron-gasfree` | `tetherto/wdk-wallet-tron-gasfree` | `v1.0.0-beta.4` | `@tetherto/wdk-wallet-tron-gasfree` |
| `wallet-solana` | `tetherto/wdk-wallet-solana` | `v1.0.0-beta.5` | `@tetherto/wdk-wallet-solana` |
| `wallet-spark` | `tetherto/wdk-wallet-spark` | `v1.0.0-beta.11` | `@tetherto/wdk-wallet-spark` |
| `swap-velora-evm` | `tetherto/wdk-protocol-swap-velora-evm` | `v1.0.0-beta.4` | `@tetherto/wdk-protocol-swap-velora-evm` |
| `bridge-usdt0-evm` | `tetherto/wdk-protocol-bridge-usdt0-evm` | `v1.0.0-beta.3` | `@tetherto/wdk-protocol-bridge-usdt0-evm` |
| `lending-aave-evm` | `tetherto/wdk-protocol-lending-aave-evm` | `v1.0.0-beta.3` | `@tetherto/wdk-protocol-lending-aave-evm` |

**Excluded:** `fiat-moonpay` (no public repo), `swap-stonfi-ton` and `bridge-usdt0-ton` (deprecated).

---

## Rollout Plan

| Phase | What Happens |
|-------|--------------|
| **Phase 1: Manual validation** | Deploy `generate-api-ref.yml` with `workflow_dispatch` only (cron disabled). Trigger manually for 3-4 modules. Verify PRs are created correctly with quality gates passing. |
| **Phase 2: Enable cron** | Turn on the 6-hour schedule. Monitor for 1 week. Confirm tag tracking works correctly — no unnecessary regeneration, failed modules retried on next run. |
| **Phase 3: Full coverage** | Run `--module all --force` once to generate API references for all 13 modules. Review the single auto-PR. Merge. |
| **Phase 4: Hardening** | Add Slack notification for failures. Consider auto-merge for auto-PRs where only `api-reference.mdx` files changed and quality gates pass. |

---

## FAQ

**How often will docs update after an SDK release?**
Within 6 hours. The cron runs at 00:00, 06:00, 12:00, 18:00 UTC. Manual `workflow_dispatch` is available for immediate regeneration. During release sprints, cron frequency can be increased to every 3 hours.

**Why not trigger on every merge to `main`?**
`main` will have unreleased code — the new branch protections and release process means code lands in `main` before the release tag is created. A release tag is the indicator that code is actually published and installable. Docs should match what users can `npm install`.

**Can we make it instant for specific repos?**
Yes. Any SDK team can optionally add a `repository_dispatch` trigger to their repo. The docs workflow already accepts dispatch events. This is opt-in, not required.

**What if a repo uses RC tags?**
RC tags (e.g., `v2.0.0-rc.1`) are currently filtered out. The generator only considers beta and stable releases. This can be changed per-module in `modules.json` if needed.

**What happens when a new SDK module is created?**
Add one entry to `modules.json` with the repo, entry point, and output path. The next cron run will detect it (null state → new tag) and generate the reference.

**What happens when a module is deprecated?**
Set `"deprecated": true` in `modules.json`. The generator skips it. Delete the `api-reference.mdx` file in the same commit.

**What if TypeDoc fails on a module?**
The generator logs the error, does not update the tag state for that module, and continues with the rest. The next run will retry. The summary shows which modules succeeded and which failed.

**What about the Indexer API (OpenAPI)?**
The Indexer API uses an OpenAPI spec, not TypeDoc. A separate pipeline using `fumadocs-openapi` is planned but is out of scope for this proposal.

**Will this consume a lot of CI minutes?**
No. The tag check phase takes ~30 seconds for all 13 modules. Only modules with new releases trigger the full pipeline (clone, npm install, TypeDoc, transform). A typical run with 1-2 changed modules takes 3-5 minutes.

**What about the tag naming inconsistencies?**
The generator handles all current inconsistencies (missing `v` prefix, typo tags, non-semver tags). But consistent `vMAJOR.MINOR.PATCH-beta.N` format across repos would make the automation more robust and the tag history easier to audit.

---

## Appendix: Docs-Side Workflow

This workflow is at `.github/workflows/generate-api-ref.yml` in the docs repo.

```yaml
name: Generate API References

on:
  schedule:
    - cron: '0 */6 * * *'

  workflow_dispatch:
    inputs:
      module:
        description: 'Module key from modules.json (or "all")'
        required: false
        default: 'all'
      force:
        description: 'Skip tag check and force regeneration'
        required: false
        type: boolean
        default: false

  repository_dispatch:
    types: [sdk-updated]

permissions:
  contents: write
  pull-requests: write

jobs:
  generate:
    runs-on: ubuntu-latest
    timeout-minutes: 60

    steps:
      - name: Checkout docs repo
        uses: actions/checkout@v4
        with:
          ref: feat/api-ref-gen

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install generator dependencies
        working-directory: scripts/api-ref-gen
        run: npm install

      - name: Determine module and flags
        id: config
        run: |
          MODULE="all"
          FLAGS=""

          if [ "${{ github.event_name }}" = "workflow_dispatch" ]; then
            MODULE="${{ github.event.inputs.module }}"
            if [ "${{ github.event.inputs.force }}" = "true" ]; then
              FLAGS="--force"
            fi
          fi

          if [ "${{ github.event_name }}" = "repository_dispatch" ]; then
            MODULE="${{ github.event.client_payload.module || 'all' }}"
            FLAGS="--force"
          fi

          if [ "${{ github.event_name }}" = "schedule" ]; then
            FLAGS="--check-updates"
          fi

          echo "module=$MODULE" >> "$GITHUB_OUTPUT"
          echo "flags=$FLAGS" >> "$GITHUB_OUTPUT"

      - name: Generate API references
        working-directory: scripts/api-ref-gen
        env:
          NPM_READ_TOKEN: ${{ secrets.NPM_READ_TOKEN }}
        run: |
          node generate.mjs --module ${{ steps.config.outputs.module }} ${{ steps.config.outputs.flags }}

      - name: Install site dependencies & build
        run: |
          npm ci
          npm run build

      - name: Create or update PR
        uses: peter-evans/create-pull-request@v6
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          commit-message: 'docs(api-ref): auto-update API references'
          title: 'docs(api-ref): auto-update API references'
          body: |
            Automated API reference update.

            **Trigger:** `${{ github.event_name }}`
            **Module:** `${{ steps.config.outputs.module }}`

            This PR was generated by the API reference automation pipeline.
          branch: auto/api-ref-update
          base: feat/api-ref-gen
          add-paths: |
            content/docs/**/api-reference.mdx
            scripts/api-ref-gen/last-synced-shas.json
          delete-branch: true
```
