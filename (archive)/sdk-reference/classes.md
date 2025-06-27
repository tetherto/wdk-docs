---
title: SDK Reference Documentation
description: 
author: Raquel Carrasco Gonzalez
lastReviewed: 2025-06-17
---

# Core TypeScript abstractions

### 🚧 Work in progress

The WDK SDK centres on a small set of **abstract classes** and **value objects** that
concrete chain-specific packages extend. Keep this file open while reading any
implementation—the inheritance tree below is your mental map. :contentReference[oaicite:0]{index=0}

---

## 1. Wallet layer

### `AbstractWalletManager`

| Member | Signature | Purpose |
|--------|-----------|---------|
| `constructor(seed, config?)` | `string \| Uint8Array, WalletConfig?` | Create a manager bound to a BIP-39 seed phrase. :contentReference[oaicite:1]{index=1} |
| `getAccount(index?)` | `Promise<AbstractWalletAccount>` | Derive account _m/44'/*index*/'_. |
| `getAccountByPath(path)` | `Promise<AbstractWalletAccount>` | Derive arbitrary BIP-44 path. |
| `getFeeRates()` | `Promise<FeeRates>` | Fetch **normal / fast** fee presets. |
| `dispose()` | `void` | Zeroises key-material in memory. |
| **static** `getRandomSeedPhrase()` | `string` | Generate a 12/24-word mnemonic. |
| **static** `isValidSeedPhrase(seed)` | `boolean` | Validate BIP-39 checksum. |

Concrete subclasses include `WalletManagerEvm`, `WalletManagerTon`,
`WalletManagerBtc`, etc. :contentReference[oaicite:2]{index=2}

---

### `IWalletAccount`

| Member | Signature / notes |
|--------|-------------------|
| **properties** | `path: string`, `index: number`, `keyPair: KeyPair` :contentReference[oaicite:3]{index=3} |
| `getAddress()` | `Promise<string>` |
| `sign(message)` / `verify(message, sig)` | ECDSA or EdDSA depending on chain. |
| **transaction helpers** | `sendTransaction`, `quoteSendTransaction` |
| **token helpers** | `transfer`, `quoteTransfer`, `getTokenBalance` |
| `getBalance()` | Native-asset balance. |
| `dispose()` | Securely wipes the private key. |

All helpers return strongly-typed `TransactionResult` / `TransferResult`
objects (see §3). :contentReference[oaicite:4]{index=4}

---

## 2. Protocol layer

### `AbstractSwapProtocol`

```ts
abstract class AbstractSwapProtocol {
  constructor(account: AbstractWalletAccount, config?: SwapProtocolConfig)
  abstract swap(opts: SwapOptions): Promise<SwapResult>
  abstract quoteSwap(opts: SwapOptions): Promise<Omit<SwapResult, 'hash'>>
}
```

### `AbstractBridgeProtocol`

```ts
abstract class AbstractBridgeProtocol {
  constructor(account: AbstractWalletAccount, config?: BridgeProtocolConfig)
  abstract bridge(opts: BridgeOptions): Promise<BridgeResult>
  abstract quoteBridge(opts: BridgeOptions): Promise<Omit<BridgeResult, 'hash'>>
}
```

---

## 3. Shared value objects

| Type | Key fields | Spec location |
|------|------------|---------------|
| `WalletConfig` | `transferMaxFee?` | :contentReference[oaicite:7]{index=7} |
| `Transaction` | `to`, `value` | :contentReference[oaicite:8]{index=8} |
| `TransactionResult` | `hash`, `fee` | :contentReference[oaicite:9]{index=9} |
| `TransferOptions` | `token`, `recipient`, `amount` | :contentReference[oaicite:10]{index=10} |
| `TransferResult` | `hash`, `fee` | :contentReference[oaicite:11]{index=11} |
| `KeyPair` | `publicKey`, `privateKey` | :contentReference[oaicite:12]{index=12} |
| `FeeRates` | `normal`, `fast` | :contentReference[oaicite:13]{index=13} |
| `SwapProtocolConfig` | `swapMaxFee?` | :contentReference[oaicite:14]{index=14} |
| `SwapOptions` | `tokenIn`, `tokenOut`, `tokenInAmount?`, `tokenOutAmount?` | :contentReference[oaicite:15]{index=15} |
| `SwapResult` | `hash`, `fee`, `tokenInAmount`, `tokenOutAmount` | :contentReference[oaicite:16]{index=16} |
| `BridgeProtocolConfig` | `bridgeMaxFee?` | :contentReference[oaicite:17]{index=17} |
| `BridgeOptions` | `targetChain`, `token`, `recipient`, `amount` | :contentReference[oaicite:18]{index=18} |
| `BridgeResult` | `hash`, `fee`, `bridgeFee` | :contentReference[oaicite:19]{index=19} |

---

## 4. Minimal UML

```ts
AbstractWalletManager ◀── WalletManagerEvm
▲                          │
│                          └── WalletManagerEvmErc4337
│
│              AbstractSwapProtocol ◀── ParaswapProtocolEvm
IWalletAccount ◀── WalletAccountEvm
```



(Full diagrams live in `3-architecture/`.)

---

_Last updated: 18 Jun 2025_
