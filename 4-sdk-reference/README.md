# SDK Reference

### 🚧 Work in progress


Welcome to the **WDK Software-Development-Kit (SDK) Reference**.
This part of the documentation is the single source of truth for every public, developer-facing surface of WDK packages: class contracts, type aliases, configuration objects, error codes, security guarantees and versioning rules. It is organised to let you **discover** APIs quickly and **deep-link** directly to the definition you need from your code-review, pull-request or IDE.

> **Target audience** – engineers who *build* or *integrate* wallets, bridges or swaps with WDK; security reviewers; QA; and anyone maintaining a fork or extension.

---

## How the reference is organised

| Path                  | Why you’d open it                                                                                                                                      |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **installation.md**   | Minimal `npm`, `pnpm` and `bun` install commands plus peer-dependency matrix.                                                                          |
| **packages.md**       | Index of every published package (wallets, protocols, utilities) with a one-line elevator pitch.                                                       |
| **classes.md**        | High-level TypeScript declarations for shared abstractions such as `AbstractWalletManager`, `IWalletAccount`, `TransactionResult`, `SwapResult`, etc.  |
| **api-reference/**    | Auto-generated per-package API docs (one Markdown file per class / function).                                                                          |
| **error-codes.md**    | Canonical list of SDK-thrown error codes, meanings and remediation hints.                                                                              |
| **extender-guide.md** | Patterns and gotchas when you add a new blockchain, paymaster or bridge.                                                                               |
| **security.md**       | Threat model, signing/serialization invariants, and secure-by-default recommendations.                                                                 |
| **versioning.md**     | Semantic-versioning contract, LTS windows and deprecation policy.                                                                                      |

---

## What’s in the SDK?

| Domain        | Packages (npm scope **@wdk/**)                                                                                                                                                                   |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Wallets**   | `wallet`, `wallet-evm`, `wallet-evm-erc4337`, `wallet-ton`, `wallet-ton-gasless`, `wallet-btc`, `wallet-spark`, `wallet-tron`, `wallet-tron-gasfree`, `wallet-solana`, `wallet-solana-jupiterz`  |
| **Protocols** | `protocol-swap` + adapters (`swap-paraswap-evm`, `swap-dedust-ton`), `protocol-bridge` + adapters (`bridge-usdt0-evm`, `bridge-usdt0-ton`)                                                       |

Each wallet package implements the common abstractions defined in `@wdk/wallet`, while every protocol package extends either `AbstractSwapProtocol` or `AbstractBridgeProtocol`. This layered design lets you mix-and-match: e.g. use an **EVM ERC-4337** wallet with the **Paraswap** swap protocol, or a **TON Gasless** wallet with the **USDT-0 bridge**.

---

## Reading tips

1. **Start with `installation.md`** to bootstrap a minimal project.
2. Jump to **`packages.md`** to pick the package you need.
3. From there, follow the link into **`api-reference/<package>/`** to see every constructor, method, property and TypeScript generic, complete with example snippets and parameter tables.
4. Keep **`error-codes.md`** open in another tab while integrating—every thrown error links back here.
5. When extending, consult **`extender-guide.md`** *before* opening your editor to avoid common foot-guns.

---

## Conventions used in this section

* **TypeScript first** – code samples are TypeScript and compile with `strict: true`.
* **UTC timestamps** unless stated otherwise.
* Monetary values are in **base units** (wei, satoshi, nanoton, etc.).
* **Citations** in square brackets link back to the canonical definition inside this repo or external standards (BIP-32/44, EIP-1559, etc.).

---

### Quick code peek

```ts
import { WalletManagerEvm } from '@wdk/wallet-evm';

const manager = new WalletManagerEvm(
  process.env.MNEMONIC!,                // 12- or 24-word BIP-39 seed
  { provider: 'https://rpc.ankr.com/eth' }  // see installation.md for options
);

const account = await manager.getAccount(); // derivation path m/44'/60'/0'/0/0
console.log('Address:', await account.getAddress());
```

For detailed typings of `WalletManagerEvm`, head to **`api-reference/wallet-evm/WalletManagerEvm.md`**.

---

## Next up

If you are new to the SDK, continue with **`installation.md`**. If you already have the packages installed, jump straight to **`classes.md`** for the high-level abstractions, or dive into the **API reference** for your chosen package.

Happy building 🚀
