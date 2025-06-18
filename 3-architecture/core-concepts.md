---
title: Core Concepts
description: Fundamental objects, privacy model and extensibility mechanisms of WDK.
author: Raquel Carrasco Gonzalez
lastReviewed: 2025-06-16
------------------------

# Core Concepts

### 🚧 Work in progress

## Object Model

| Artifact          | Purpose                                | Key Methods                            |
| ----------------- | -------------------------------------- | -------------------------------------- |
| **WDK**           | Entry point & plugin registry          | `register*`, `session()`               |
| **WalletSession** | Scoped wallet (one chain + one signer) | `send()`, `getBalance()`, `protocol()` |
| **Chain**         | Chain‑specific adapter                 | `sendTransaction()`, `quoteTransfer()` |
| **Signer**        | Cryptographic backend                  | `sign()`, `getAddress()`               |
| **Token**         | Metadata + tx builder                  | `buildTx()`                            |
| **Protocol**      | Workflow plugin (bridge, stake, swap)  | `execute()`                            |
| **Storage**       | Persistence back‑end                   | *TBD*                                  |

---

## Address Derivation & Jars

A **Jar** represents *seed + derivation index* across all chains. Users gain privacy by moving funds between jars without exposing extra addresses.

```
Seed + Index 0 → Jar 1
Seed + Index 1 → Jar 2
```

*Gasless transfers* make self‑transfer indistinguishable from third‑party transfer.

> **Diagram placeholder:** add a Sankey/flow chart of jar transfers here `assets/svg/jar-privacy.svg`.

---

## Privacy Model

* **Plausible deniability** – account abstraction hides fee token; observers can’t tell ownership.
* **On‑device custody** – Signer plugins retain secrets; SDK holds no keys.
* **Encrypted seed backup** – Versioned `crypto_secretbox` payload stored in hardware keychain.

---

## Extensibility Path

1. Implement new `Chain`, `Signer` or `Protocol` class.
2. Publish as NPM package (e.g. `@wdk/chain-my`).
3. Host app registers plugin at runtime.

No changes to WDK core are required.

---

## Further Reading

* **§ 4 SDK Reference** – TypeScript signatures and full API surface.
* **§ 5 Integration Patterns** – How these concepts map to Web/React, Mobile RN, Server flows.
