---
title: New Wallet Module: Proposal + Guide
description: Overview of how to propose a new wallet module for WDK and how it will be reviewed
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

# New Wallet Module: Proposal + Guide

Welcome! This page explains how to propose a new wallet module for WDK and how it will be reviewed. For implementation details and API specifics, see the linked sub‑pages below.

<table data-card-size="small" data-view="cards">
  <thead>
    <tr><th></th><th></th><th data-hidden data-card-target data-type="content-ref"></th></tr>
  </thead>
  <tbody>
    <tr>
      <td>🧭</td>
      <td><strong>Development Guide</strong><br/>Step‑by‑step implementation</td>
      <td><a href="./guide.md">guide.md</a></td>
    </tr>
    <tr>
      <td>🧩</td>
      <td><strong>Configuration</strong><br/>Structure, deps, CI, versioning</td>
      <td><a href="./configuration.md">configuration.md</a></td>
    </tr>
    <tr>
      <td>📚</td>
      <td><strong>API Reference</strong><br/>WalletManager and account interfaces</td>
      <td><a href="./api-reference.md">api-reference.md</a></td>
    </tr>
  </tbody>
</table>

{% hint style="info" %}
WDK is multi‑chain, self‑custodial, and stateless with a unified interface. See [Get Started](../../get-started.md).
{% endhint %}

{% hint style="info" %}
Permissionless by design: anyone can build and use WDK‑compatible wallet implementations for their own projects. These community modules are not maintained or endorsed by WDK/Tether by default.
{% endhint %}

{% hint style="warning" %}
To be officially included in the WDK SDK (maintained and surfaced in templates), a module must satisfy the requirements on this page: pass the [Reviewer Checklist](#checklist-for-reviewers), be compatible with `@tetherto/wdk-core`, and be bare‑runtime compatible (or have an agreed plan to achieve it).
{% endhint %}

---

## Package Proposal Template

Copy this section into your RFC/PR description and fill it out.

### 1) Package Overview

- **Proposed package name:** `@wdk/wallet-<chain>` (e.g., `@wdk/wallet-bitcoin`)
- **Namespace / chain family:** (e.g., EVM, UTXO/Bitcoin, Cosmos-SDK, Solana)
- **Native token:** Name, symbol, decimals
- **Short description:** 1–2 sentences (target users, use-cases)
- **Maintainer(s):** Handle(s), contact(s)
- **Repository URL:** If external

### 2) Feature Matrix

| Feature | Supported? | Details/Notes |
|---|:--:|---|
| Account management | ✅ / ❌ | Derivation path(s), HD support |
| Standard transactions | ✅ / ❌ | RPC/provider notes |
| Multi-account support | ✅ / ❌ | Index strategy |
| ERC-4337 (AA) | ✅ / ❌ | If applicable (EVM-family) |
| Gasless / Paymaster | ✅ / ❌ | Relayer/paymaster details |
| Signature abstraction | ✅ / ❌ | Hardware, multisig, guardians |
| NFTs | ✅ / ❌ | Standards supported |
| DeFi hooks | ✅ / ❌ | Swap/bridge/lending compatibility |
| Other (custom) | ✅ / ❌ | Any chain‑specific features |

### 3) Minimum Viable Implementation (MVI)

- ☐ Seed phrase import & address derivation
- ☐ `getAccount`, `getAddress`
- ☐ `getBalance`, `getTokenBalance`
- ☐ `sendTransaction`, `estimateTransaction`
- ☐ Signing (`signMessage`, `verifySignature`)
- ☐ Transaction history
- ☐ Error handling and types
- ☐ Unified registration with WDK
- ☐ **Bare runtime compatibility**: list all dependencies; call out anything not bare‑compatible

### 4) Dependencies

- Enumerate every npm dependency and purpose
- Note size/caveats and whether it’s required or optional (peerDependency)
- Prefer minimal and audited deps; avoid deep/nested dependency trees

### 5) Documentation & Testing

- ☐ `README.md`: install, config, examples, API reference
- ☐ `CHANGELOG.md`: semver changes
- ☐ Tests: unit + integration (orchestrator registration)
- ☐ CI: lint, type‑check, test, (optional) publish

### 6) Security & Maintenance

- Known chain‑specific edge cases or attack surfaces
- Maintenance plan (who responds to issues, updates, security fixes)

### 7) Official Inclusion

- Have you contacted the Holepunch/WDK team about any non‑bare dependencies?
- Are you willing to maintain the package for ongoing compatibility and security?

<details>
<summary>Example (abbreviated)</summary>

- **Name:** `@wdk/wallet-niceevm`
- **Family:** EVM L2
- **Token:** NICE (18)
- **Features:** Standard tx, AA 4337, gasless via relayer, NFTs (721/1155)
- **Bare:** Uses ethers (ok); blocked by lib-X (needs bare polyfill) → contacted team
- **Docs/Tests/CI:** Included per template

</details>

---

## Checklist for Reviewers

All items must be satisfied before merge/release.

### Structure & Naming

- ☐ Package named `@wdk/wallet-<chain>`
- ☐ Follows monorepo folder structure and naming conventions (kebab‑case files, PascalCase types)
- ☐ Public API exported via `index.js`; public types in `types/`

### Implementation

- ☐ Implements the Wallet Module interface from [WDK Wallet](https://github.com/tetherto/wdk-wallet/)
- ☐ Minimal third‑party deps; avoids deep nested deps
- ☐ OPTIONAL - Works in **bare** runtime (no Node‑only modules like `fs`, no incompatible crypto)
- ☐ Clear error messages and typed results

{% hint style="warning" %}
If something doesn’t run in bare, the author want the repo to be considered or included ad an official WDK wallet module, must either: (a) replace it, or (b) document it and confirm a plan with the Holepunch/WDK team to make it bare‑compatible.
{% endhint %}

### Documentation & Testing

- ☐ `README.md` covers install, config, usage, API
- ☐ `CHANGELOG.md` present and up‑to‑date
- ☐ Unit tests for public methods; integration test for WDK registration
- ☐ CI: lint, type‑check, test pass in headless/bare‑like environments

### Versioning & Release

- ☐ Semantic versioning (major.minor.patch)
- ☐ Git tags/releases match `package.json`

### Security & Maintenance

- ☐ No unsafe/unreviewed deps; provenance is clear
- ☐ Chain edge cases addressed and documented
- ☐ Maintainer contact provided

---

## Inclusion & Next Steps

- For hands‑on development, follow the [Development Guide](./guide.md)
- Use [Configuration](./configuration.md) for structure, CI, and policy details
- Consult the [API Reference](./api-reference.md) when implementing

{% hint style="success" %}
Permissionless by default; for **official** inclusion we require compatibility, documentation, security, and ongoing maintenance. If a dependency is not bare‑compatible, document it and contact the Holepunch/WDK team to agree on a path.
{% endhint %}

## Useful Links

- [Get Started](../../get-started.md)
- [Creating Custom Modules](../../get-started.md#creating-custom-modules)
