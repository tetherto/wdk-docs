---
title: Wallet Development Kit – EVM Wallet Module
description: Statically-typed, provider-agnostic HD wallet manager for any Ethereum-compatible chain.
author: Raquel Carrasco Gonzalez
lastReviewed: 2025-06-24
---

> 🚧 Work in progress

## Features

| Capability                    | Details                                                          |
| ----------------------------- | ---------------------------------------------------------------- |
| **BIP-39 / BIP-44 HD Keys**   | Deterministic key-derivation from a single seed phrase           |
| **JSON-RPC & EIP-1193**       | Works with any standard RPC endpoint or custom provider instance |
| **EIP-1559 Fees**             | `gasPrice`, `maxFeePerGas`, `maxPriorityFeePerGas` all supported |
| **Quote Before You Send**     | Built-in cost estimators for transactions & ERC-20 transfers     |
| **Token-Aware**               | Helper methods for reading balances & transferring ERC-20 tokens |
| **Framework Agnostic**        | Runs in Node.js, the browser, or React-Native with the same API  |
| **[Account-Abstraction Ready](./account-abstraction.md)** | Seamless upgrade path to `@wdk/wallet-evm-erc4337`               |
| **100 % TypeScript**          | Fully typed API surface & inline docs                            |

---

## Installation

```bash
# With npm
npm install @wdk/wallet-evm
```

---

## WDK EVM Developer Guide Index

- **[Wallet & Account (EVM)](./wdk-evm/create-wallet.md):** How to generate, import, and manage EVM-compatible wallets and accounts.
- **[Get Balance & Deposit (EVM)](./wdk-evm/get-balance.md):** Read native-coin and ERC-20 balances, and learn how to fund both classic EOAs and smart-accounts.
- **[Estimate Fee & Execute Transactions (EVM)](./wdk-evm/transfer.md):** Estimate gas, quote, and execute ERC-20 and native token transfers on classic and smart-accounts.


---

<!-- ## 🧩 Interoperability

* **Account Abstraction:** Drop-in replacement with [`@wdk/wallet-evm-erc4337`](../wallet-evm-erc4337) for gas-sponsored transactions.
* **Swap & Bridge:** Combine with protocol modules such as `@wdk/protocol-swap-paraswap-evm` or `@wdk/protocol-bridge-usdt0-evm` for DeFi flows. -->


## 📝 License

MIT © 2025 Wallet Development Kit
