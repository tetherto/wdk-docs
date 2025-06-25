---
title: Wallet Development Kit – EVM Wallet Module
description: Statically-typed, provider-agnostic HD wallet manager for any Ethereum-compatible chain.
author: Raquel Carrasco Gonzalez
lastReviewed: 2025-06-24
---

## ✨ Features

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

## 📦 Installation

```bash
# With npm
npm install @wdk/wallet-evm
```

<details>
<summary>Peer-dependencies</summary>

| Package                | Why                                         | Version        |
| ---------------------- | ------------------------------------------- | -------------- |
| `ethers` **or** `viem` | Low-level encoding, signing & RPC utilities | ^6.0 or latest |

</details>

---


## WDK EVM Developer Guide Index

- **[Create Wallet](./wdk-evm/create-wallet.md):** How to generate, import, and manage EVM-compatible wallets and accounts.
- **[Get Balance](./wdk-evm/get-balance.md):** Read native-coin and ERC-20 balances, and learn how to fund both classic EOAs and smart-accounts.
- **[Transfer](./wdk-evm/transfer.md):** Estimate gas, quote, and execute ERC-20 and native token transfers on classic and smart-accounts.

---

## 🗂️ API Reference (Essentials)

### `class WalletManagerEvm extends AbstractWalletManager`

| Member                       | Description                                                                                         |
| ---------------------------- | --------------------------------------------------------------------------------------------------- |
| `constructor(seed, config?)` | Instantiate the manager with a BIP-39 seed (string or `Uint8Array`).                                |
| `getAccount(index?)`         | ➜ `Promise<WalletAccountEvm>` – derive account at BIP-44 path `m/44'/60'/0'/0/index` (default `0`). |
| `getAccountByPath(path)`     | ➜ `Promise<WalletAccountEvm>` – derive at arbitrary path (e.g. `m/44'/60'/0'/1/99`).                |
| `getFeeRates()`              | Current fee estimates as `{ normal, fast }`.                                                        |
| `dispose()`                  | Zeroes private keys from memory.                                                                    |

### `class WalletAccountEvm implements IWalletAccount`

| Member                          | Return type                                | Notes                                   |
| ------------------------------- | ------------------------------------------ | --------------------------------------- |
| `getAddress()`                  | `Promise<string>`                          | Checksummed EVM address                 |
| `sign(message)`                 | `Promise<string>`                          | EIP-191 personal-sign                   |
| `verify(message, signature)`    | `Promise<boolean>`                         | Verifies `sign(...)` result             |
| `sendTransaction(tx)`           | `Promise<TransactionResult>`               | Native or contract interaction          |
| `quoteSendTransaction(tx)`      | `Promise<Omit<TransactionResult, "hash">>` | Dry-run for gas usage                   |
| `transfer(options)`             | `Promise<TransferResult>`                  | ERC-20 helper (wraps `sendTransaction`) |
| `quoteTransfer(options)`        | `Promise<Omit<TransferResult, "hash">>`    | Dry-run for ERC-20 transfer             |
| `getBalance()`                  | `Promise<bigint>`                          | Native-token balance (wei)              |
| `getTokenBalance(tokenAddress)` | `Promise<bigint>`                          | ERC-20 balance (base-unit)              |
| `dispose()`                     | `void`                                     | Forget account + private key            |

### `type EvmWalletConfig extends WalletConfig`

```ts
interface EvmWalletConfig extends WalletConfig {
  /** EIP-1193 provider instance *or* RPC URL */
  provider?: string | Eip1193Provider;
}
```

### `type EvmTransaction extends Transaction`

Additional optional fields:

```ts
interface EvmTransaction extends Transaction {
  data?: string;                // calldata (hex)
  gasLimit?: number;            // units
  gasPrice?: number;            // wei (legacy)
  maxFeePerGas?: number;        // wei (EIP-1559)
  maxPriorityFeePerGas?: number;// wei (tip)
}
```

> **Tip:** When both legacy *and* EIP-1559 fields are provided, `maxFeePerGas` / `maxPriorityFeePerGas` win.

---

## 🔧 Configuration Examples

### Minimal – any EVM chain

```jsonc
{
  "provider": "https://rpc.mevblocker.io/fast"
}
```

### Ready for Account-Abstraction (ERC-4337)

If you plan to migrate to `@wdk/wallet-evm-erc4337`, add bundler & paymaster details.
Below is a **valid** Ethereum main-net setup using *Candide*.

```jsonc
{
  "chainId": 1,
  "blockchain": "ethereum",
  "provider": "https://rpc.mevblocker.io/fast",
  "bundlerUrl": "https://api.candide.dev/public/v3/ethereum",
  "paymasterUrl": "https://api.candide.dev/public/v3/ethereum",
  "paymasterAddress": "0x8b1f6cb5d062aa2ce8d581942bbb960420d875ba",
  "entrypointAddress": "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
  "transferMaxFee": 5_000_000,
  "swapMaxFee": 5_000_000,
  "bridgeMaxFee": 5_000_000,
  "paymasterToken": {
    "address": "0xdAC17F958D2ee523a2206206994597C13D831ec7"
  }
}
```

Below is the analogous setup on Arbitrum One using *Pimlico* – notice that the **bundlerUrl**, **paymasterUrl** *and* **paymasterAddress** must always change together.

```jsonc
{
  "chainId": 42161,
  "blockchain": "arbitrum",
  "provider": "https://1rpc.io/arb",
  "bundlerUrl": "https://public.pimlico.io/v2/42161/rpc",
  "paymasterUrl": "https://public.pimlico.io/v2/42161/rpc",
  "paymasterAddress": "0x777777777777AeC03fd955926DbF81597e66834C",
  "entrypointAddress": "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
  "transferMaxFee": 5_000_000,
  "swapMaxFee": 5_000_000,
  "bridgeMaxFee": 5_000_000,
  "paymasterToken": {
    "address": "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9"
  }
}
```

> ⚖️ **Neutrality notice** – *Candide* and *Pimlico* both provide excellent bundler & paymaster services. Choose the one that best fits your needs; `@wdk/wallet-evm` works equally well with either.

---

## 🧩 Interoperability

* **Account Abstraction:** Drop-in replacement with [`@wdk/wallet-evm-erc4337`](../wallet-evm-erc4337) for gas-sponsored transactions.
* **Swap & Bridge:** Combine with protocol modules such as `@wdk/protocol-swap-paraswap-evm` or `@wdk/protocol-bridge-usdt0-evm` for DeFi flows.

---

## 🛠️ Testing

```bash
pnpm test
```

Unit tests cover seed handling, address derivation, signing, and provider edge-cases.
You can run **live** integration suites against a fork (Foundry/Hardhat/Anvil) by exporting `WDK_RPC_URL`.

---

## 🤝 Contributing

1. Fork & clone ❤
2. `pnpm install`
3. `pnpm lint && pnpm test`
4. Submit a PR – make sure you run `pnpm build` and commit the generated types.

Please follow the repo's Conventional Commits policy; CI enforces lint, type-check & snapshot tests.

---

## 📝 License

MIT © 2025 Wallet Development Kit
