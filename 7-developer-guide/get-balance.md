---
title: Get Balance
description: How to read native-coin and token balances with WdkManager, including account-abstraction variants.
author: Raquel Carrasco Gonzalez
icon: coins
lastReviewed: 2025-06-23
---

# Get the balance of an account (or abstracted address)

WDK offers **two complementary APIs** for balance queries:

| Use-case | Call | Notes |
|----------|------|-------|
| **Direct wallet access** | `await account.getBalance()`<br>`await account.getTokenBalance(token)` | Methods defined in **`IWalletAccount`** (`wallet-account.js`). |
| **Higher-level helper** | `wdk.getAbstractedAddressBalance(chain, idx)`<br>`wdk.getAbstractedAddressTokenBalance(chain, idx, token)` | Convenience wrappers in **`WdkManager`** (`wdk-manager.js`) that work with account-abstraction wallets. |

All returned values are **base-unit integers** (wei, satoshi, nanoTON, *etc.*).  
Convert to decimals in your UI layer.

| Scenario | Call | What it returns |
|----------|------|-----------------|
| **Direct account** (plain wallet) | `await wdk.getAccount(chain, index)` → `account.getBalance()` / `account.getTokenBalance(token)` | Balance held on the **EOA** / standard address. |
| **Account-abstracted address** (AA wallets) | `wdk.getAbstractedAddressBalance(chain, index)`<br>`wdk.getAbstractedAddressTokenBalance(chain, index, token)` | Balance of the **contract wallet / AA address** that wraps the same key-pair. |

_All balances come back in **base units** (wei, satoshi, nanoTON, …)._


Every concrete wallet account in WDK implements two convenience methods — both
declared in `IWalletAccount`:

| Method | Returns | What it means |
|--------|---------|---------------|
| `getBalance()` | `Promise<number>` | **Native-coin** balance of the account (wei, satoshi, nanoton, …).|
| `getTokenBalance(tokenAddress)` | `Promise<number>` | Balance of an **ERC-20 / TRC-20 / SPL** (etc.) token held by the account.|

The numbers are always in **base units** (wei, satoshi, etc.).  
Convert to user-friendly decimals with your UI library or SDK helpers.

---

## 1 · Native balance (EVM wallet)


## 1. Native balance (EVM example)

```js
import { WalletManagerEvm } from '@wdk/wallet-evm';

const manager = new WalletManagerEvm(
  process.env.MNEMONIC,
  { provider: 'https://rpc.ankr.com/eth' }   // any EIP-1193 endpoint
);

(async () => {
  const account = await manager.getAccount();    // m/44'/60'/0'/0/0
  const balanceWei = await account.getBalance();
  console.log('ETH (wei):', balanceWei);

  // human-readable ETH
  const eth = Number(balanceWei) / 1e18;
  console.log('ETH:', eth.toLocaleString());
})();
```

# Reading balances with WDK


## Ethereum

## Arbitrum



```js
import { WalletManagerEvm } from '@wdk/wallet-evm'; //

// Check native token balance (ETH)
const nativeBalance = await arbitrum.getAbstractedAddressBalance();

console.log("ETH Balance:", nativeBalance);

// Check USDT balance
const usdtAddress = "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9";

const usdtBalance = await arbitrum.getAbstractedAddressTokenBalance(usdtAddress);
console.log("USDT Balance:", usdtBalance);
```

## Polygon
> 🚧 Work in progress

## Bitcoin
> 🚧 Work in progress

## TON
> 🚧 Work in progress

## Spark
> 🚧 Work in progress