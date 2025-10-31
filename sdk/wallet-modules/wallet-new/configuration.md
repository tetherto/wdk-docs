---
title: Configuration, Structure, and CI
description: This page gathers structure conventions, dependency policy, docs/testing expectations, CI, and release practices for new wallet modules.
icon: gear
layout:
  width: default
  title:
    visible: true
  description:
    visible: true
  tableOfContents:
    visible: true
  outline:
    visible: true
  pagination:
    visible: false
  metadata:
    visible: false
---

# Configuration, Structure, and CI

This page gathers structure conventions, dependency policy, docs/testing expectations, CI, and release practices for new wallet modules.

## Folder Structure

```
wallet-<chain>/
├─ bare.js
├─ index.js
├─ package.json
├─ tsconfig.json
├─ README.md
├─ LICENSE
├─ types/
│  └─ index.d.ts (public types)
├─ src/
│  └─ ...implementation files...
└─ tests/
   └─ unit & integration tests
```

## Naming & Exports

- **Package**: `@wdk/wallet-<chain>` (e.g., `@wdk/wallet-evm`, `@wdk/wallet-btc`)
- **Files**: kebab‑case (`bare.js`, `package.json`)
- **Types/Interfaces**: PascalCase (e.g., `WalletModule`, `TransactionParams`)
- **Exports**: only from `index.js`; keep helpers internal to `src/`

## Dependencies & Bare Runtime

- Prefer minimal, audited dependencies; avoid deep/nested trees
- Avoid Node‑only modules and APIs; target pure JS/TS and web‑safe crypto
- Test your flows using `bare.js` before submission
- If a required dependency is not available in bare:
  - Document it in your proposal
  - Contact the Holepunch/WDK team to coordinate a bare‑compatible path

{% hint style="warning" %}
Bare compatibility is optional for community modules. For **official** inclusion, provide either bare compatibility or an agreed plan to achieve it.
{% endhint %}

## Docs & Testing Expectations

- `README.md`: what it is, install, config, examples, API, feature table
- `CHANGELOG.md`: follow semver; summarize changes per release
- Code comments: only where non‑obvious (edge cases, invariants)
- Tests:
  - Unit: each public method
  - Integration: registration with WDK orchestrator
  - CI scripts run headless and bare‑like

## CI Pipeline

- Lint: `npm run lint`
- Type‑check: `npm run type-check` or `tsc`
- Test: `npm test`
- Optional: dry‑run publish for release branches

## Versioning & Branching

- Semantic versioning (major.minor.patch)
- `main` for stable releases; feature branches for new work
- Tag releases; keep `CHANGELOG.md` synchronized
