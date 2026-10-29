# Indexer OpenAPI reference generation

The production contract at `https://wdk-api.tether.io/docs/json` supplies the REST reference. Staging at `wdk-api.tether.su` is a separate environment. This work is tracked in [WDK Docs #288](https://github.com/tetherto/wdk-docs/issues/288).

```sh
npm run sync:indexer       # Fetch production, validate, and update the snapshot and generated content
npm run generate:indexer  # Regenerate from the checked-in snapshot without networking
npm run check:indexer     # Offline freshness and contract checks; writes nothing
node --test scripts/test/indexer-openapi.test.mjs
```

The raw snapshot remains byte-exact. `public/assets/indexer-api/openapi.provenance.json` binds the source URL, retrieval time and SHA-256 to those bytes and records a separate health observation. HTTP 503 from health is recorded as observed degradation; it does not prevent documenting a successfully retrieved contract. The deployed version is the API release identifier. The export's `info.version` currently lags it. These values come from separate HTTP responses, not an atomic deployment/contract pair. Every refresh fetches both. Identical contract bytes and an unchanged deployment version produce no changes; an advanced deployment version with unchanged contract bytes stops for backend reconciliation.

The generator covers every supported HTTP operation in the snapshot, including inherited parameters, authentication requirements, request bodies and all declared responses. It renders native Markdown field tables for readable, searchable schema details and collapsible JSON preserving complete parameter, security and media definitions. Constraint keys and scalar values use separate inline-code spans so exact machine token identifiers retain their source spelling without typography exceptions. Required-list labels describe the local object schema only; composition branches can add constraints. The existing route, per-page Markdown exporter, search pipeline and LLM feed remain the consumers. The sync command updates only this reference's LLM section and preserves unrelated feed records.

## Validation boundary

`indexer-openapi.mjs` is a bounded contract validator and renderer, not a complete OpenAPI implementation. It rejects duplicate JSON keys, non-finite numbers, unsafe integral numeric literals and numbers that would change mathematical value when rendered. Equivalent decimal/exponent spelling is accepted; finite rounding and underflow fail with a JSON pointer. It also rejects unsupported dialects, malformed known structures, unrecognized features, external references, unexpected servers, unsupported security and incomplete path parameters. API requests are not executed by these checks.

The production export declares OpenAPI 3.0.0 but contains 23 `type: "null"` declarations and one `propertyNames` declaration outside that dialect. `indexer-openapi-compatibility.json` records the exact JSON pointers and offending values. Those reviewed defects remain unchanged in the raw snapshot and generated schemas. A new or changed defect fails generation; an upstream fix can remove a defect. Do not convert nullability, rewrite the source, or describe this compatibility allowance as passing formal OpenAPI validation. Update the allowlist only after reviewing an authoritative source change.

New paths and supported parameter/schema constraints generate automatically. New OpenAPI features fail with their source location until validation, rendering and regression coverage support them. The current scope uses inline schemas and a single header API key. Add reusable references or other authentication only when the upstream contract requires them.

The pure renderer does not write files. The sync command validates and prepares its outputs before publishing them under a filesystem lock with rollback. Normal builds consume the checked-in artifacts and run the offline freshness check. The workflow checks daily at 05:17 UTC, checks out `develop`, and proposes a draft PR from `automation/indexer-openapi` into `develop`. GitHub schedules run only when the workflow exists on the repository's default branch; merging it into `develop` alone does not activate the daily schedule when the default branch is `main`. Promote the workflow through the normal release path to activate scheduling. The workflow does not establish production API behavior or automatically approve a change.

An open automation PR is resumed normally. After merge, a retained branch must either be an ancestor of `develop` or have its exact head recorded on a merged PR into `develop`. Only PRs from this repository count as evidence. For squash/rebase merges, an ancestry-only merge keeps the current `develop` contents and allows the next push to fast-forward. Unexpected files stop branch reuse.

After quality checks, the workflow publishes the update branch and the `automation/indexer-openapi-validated` checkpoint branch in one atomic push. If PR creation fails or the runner stops after pushing, the next scheduled or manual run can resume only when both refs identify the exact same validated commit. A missing or different checkpoint cannot authorize recovery. A maintainer's latest decision to close an update without merging stops unattended publication until it is explicitly reopened or a reviewed replacement is created. API lookup failures stop the run, and an unsupported atomic push changes neither ref.

The checkpoint is workflow-owned recovery state and advances by fast-forward. Its ancestry is retained without replacing current documentation, including after squash/rebase merges and deletion of a merged update branch. A checkpoint left without an update branch must be proven merged before starting another update. These checks assume trusted repository writers; a writer able to forge both refs is outside this trust boundary. Leave the checkpoint intact. For an unrecognized pending branch, inspect its source and generated diff, run the quality checks, and open its draft PR after review to resume the normal path. The workflow preserves remote work while refusing unrecognized recovery state.

## Review and verification

Run the generator tests, repository quality build, external-link check and source/export parity checks. Verify actual schema-field search results and ordinary downloads against a locally served production static build. Keep authenticated runtime compatibility and the backend-hosted `/docs` redirect as separate validation and deployment actions. `wdk-indexer-http` JavaScript package reference generation is a separate contract.
