# New Protocol Module: Proposal + Guide

This section explains how to propose and implement new protocol modules (swap, bridge, lending) compatible with WDK.

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
      <td><strong>API Reference</strong><br/>Protocol base contracts</td>
      <td><a href="./api-reference.md">api-reference.md</a></td>
    </tr>
  </tbody>
</table>

{% hint style="info" %}
Anyone can build and use WDK‑compatible protocol implementations for their own projects. Community modules are not maintained by WDK/Tether by default.
{% endhint %}

{% hint style="warning" %}
For <strong>official inclusion</strong> in the WDK SDK (maintained and surfaced), your module must pass the checklist below, be compatible with <code>@tetherto/wdk-core</code>, and be bare‑runtime compatible (or have an agreed plan).
{% endhint %}

---

## Protocol Module Proposal Template

Copy into your RFC/PR and fill it out.

### 1) Overview

- **Proposed package name:** `@wdk/protocol-<type>-<chain>` (e.g., `@wdk/protocol-swap-velora-evm`)
- **Protocol type:** Swap / Bridge / Lending / Other
- **Target chain(s):** e.g., EVM, TON, etc.
- **Short description:** 1–2 sentences
- **Maintainer(s):** Handles, contacts
- **Repo URL:** If external

### 2) Feature Matrix

| Capability | Supported? | Notes |
|---|:--:|---|
| Quote | ✅ / ❌ | e.g., quoteSwap/quoteBridge/quoteBorrow |
| Execute | ✅ / ❌ | swap/bridge/supply/borrow/repay/withdraw |
| Read‑only mode | ✅ / ❌ | works with IWalletAccountReadOnly |
| Multi‑chain | ✅ / ❌ | list chains |
| Tokens | ✅ / ❌ | standards, decimals |
| Fees | ✅ / ❌ | protocol fees, relayers |

### 3) Minimum Viable Implementation

- ☐ Implements the appropriate interface(s): `ISwapProtocol`, `IBridgeProtocol`, `ILendingProtocol`
- ☐ `quote*` methods and `*` (execute) methods
- ☐ Clear error handling and types
- ☐ Works with both read‑only and writable accounts where applicable
- ☐ Dependencies listed with bare compatibility notes

### 4) Dependencies

- List every npm dependency and why it's needed
- Mark optional/peer deps; avoid deep dependency trees

### 5) Docs, Tests, CI

- ☐ README with usage and examples
- ☐ CHANGELOG with semver
- ☐ Unit + integration tests (orchestrator usage)
- ☐ CI: lint, type‑check, test

### 6) Security & Maintenance

- Known risks (slippage, MEV, liquidity, bridge trust)
- Maintenance plan (contacts, update cadence)

---

## Reviewer Checklist

- ☐ Naming: `@wdk/protocol-<type>-<chain>`
- ☐ Structure and exports follow conventions
- ☐ Implements interface(s) from [WDK Wallet protocols](https://github.com/tetherto/wdk-wallet/) (`/protocols`)
- ☐ Minimal dependencies; provenance clear
- ☐ Bare runtime compatibility (or agreed remediation plan)
- ☐ Docs complete; tests passing in CI
- ☐ Semver + CHANGELOG + tags
- ☐ Maintainer contact provided

---

## Next Steps

- Build with the [Development Guide](./guide.md)
- Use [Configuration](./configuration.md) for structure/CI/policies
- Consult the [API Reference](./api-reference.md) when implementing
