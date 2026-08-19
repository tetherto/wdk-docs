# WDK Community Module Documentation

This package helps community contributors create module documentation that
matches the WDK docs structure, writing style, API accuracy, safety guidance,
and validation requirements.

It is a contributor resource and is not rendered on the documentation site.

## Who It Is For

- Community module maintainers preparing documentation for WDK.
- WDK developers reviewing a module and its public API.
- Documentation maintainers reviewing structure, examples, links, and wording.

## What It Does

The skill guides authors through current-source review, package verification,
module-family and page selection, source-backed drafting, code-sample checks,
navigation updates, adversarial review, and repository validation.

It does not replace module code review or decide a new documentation family.

## Files

| File | Purpose |
|---|---|
| `contributing/wdk-community-module-docs/README.md` | This introduction. |
| `contributing/wdk-community-module-docs/COMMUNITY_MODULE_DOCUMENTATION_GUIDE.md` | Complete human authoring and review guide. |
| `skills/wdk-community-module-docs/SKILL.md` | Workspace skill instructions. |
| `skills/wdk-community-module-docs/scripts/validate-artifacts.mjs` | Documentation and skill validation checks. |

## Before You Start

- [ ] The WDK development team has completed and approved the module code review.
- [ ] The approval covers the exact source revision being documented.
- [ ] The intended npm package name and version are known.
- [ ] The documentation family and route are agreed with a WDK maintainer.
- [ ] Current source, tests, package metadata, and relevant provider references
      are available.

Do not start authoring while module code review is still open. If approved code
changes materially, ask the WDK development team to confirm the revised source
before continuing.

## How To Use It

1. Work from a current WDK docs branch or clean worktree.
2. Read the relevant sections of the complete authoring guide.
3. Give your workspace documentation assistant the approved source revision,
   intended package and version, provider references, and agreed docs location.
4. Ask it to use `skills/wdk-community-module-docs/SKILL.md` to create or review
   the module documentation.
5. Review every generated claim and code sample against the approved module source.
6. Run the required checks before asking maintainers to merge the documentation.

The files already work in this repository. To use them in another WDK docs
checkout, copy the `contributing/wdk-community-module-docs/` and
`skills/wdk-community-module-docs/` directories into the same repository-relative
locations.

## Publication And Draft PRs

After code review approval, documentation and npm publication can proceed in
parallel. If the intended package and version are not yet published, open or
keep the documentation PR as a draft.

After npm publication:

1. Verify the exact package name, version, registry metadata, and tarball.
2. Recheck imports, declarations, installation instructions, and runnable examples.
3. Run the repository validation required by the complete guide.
4. Mark the documentation PR ready for review only after those checks pass.

## Basic Validation

Run from the repository root:

```bash
node skills/wdk-community-module-docs/scripts/validate-artifacts.mjs
git diff --check
```

When rendered docs or navigation change, run the complete docs-site validation
listed in `COMMUNITY_MODULE_DOCUMENTATION_GUIDE.md`.
