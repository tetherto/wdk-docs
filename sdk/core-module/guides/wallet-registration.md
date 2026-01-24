---
title: Register Wallets
description: Learn how to register wallet modules for different blockchains.
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

# Register Wallets

This guide explains how to register wallet modules with your WDK instance. The WDK Core module itself doesn't contain blockchain-specific logic; instead, you register separate modules for each chain you want to support (e.g., Ethereum, TON, Bitcoin).

## How it works

The WDK uses a builder pattern, allowing you to chain `.registerWallet()` calls. Each call connects a blockchain-specific manager to your central WDK instance.

### Parameters

The `registerWallet` method (see [API Reference](../api-reference.md#registerwalletblockchain-wallet-config)) requires three arguments:

1.  **Symbol**: A unique string identifier for the chain (e.g., `'ethereum'`, `'ton'`). You will use this ID later to retrieve accounts.
2.  **Manager Class**: The wallet manager class imported from the specific module (e.g., `WalletManagerEvm`).
3.  **Configuration**: An object containing the chain-specific settings (e.g., RPC providers, API keys).

## Installation

Install the [wallet managers](../../wallet-modules/README.md) for the blockchains you want to support:


```bash
npm install @tetherto/wdk-wallet-evm @tetherto/wdk-wallet-tron @tetherto/wdk-wallet-btc
```

## Example: Registering Multiple Wallets

### Import the Wallet Manager Packages

First, import the necessary wallet manager packages:

{% code title="Import Modules" lineNumbers="true" %}
```typescript
import WalletManagerEvm from '@tetherto/wdk-wallet-evm'
import WalletManagerTron from '@tetherto/wdk-wallet-tron'
import WalletManagerBtc from '@tetherto/wdk-wallet-btc'
```
{% endcode %}

### Register the Wallets

Then, [instantiate WDK](./getting-started.md#initialize-wdk) and chain the registration calls:

{% code title="Register Wallets" lineNumbers="true" %}
```typescript
const wdk = new WDK(seedPhrase)
  // 1. Register Ethereum
  .registerWallet('ethereum', WalletManagerEvm, {
    provider: 'https://eth.drpc.org'
  })
  // 2. Register TRON
  .registerWallet('tron', WalletManagerTron, {
    provider: 'https://api.trongrid.io'
  })
  // 3. Register Bitcoin
  .registerWallet('bitcoin', WalletManagerBtc, {
    provider: 'https://blockstream.info/api'
  })
```
{% endcode %}

{% hint style="info" %}
**Ethereum Networks:** Choose the RPC endpoint that matches your environment (Mainnet or Testnet).
*   **Mainnet:** `https://eth.drpc.org`
*   **Sepolia (Testnet):** `https://sepolia.drpc.org`
{% endhint %}

{% hint style="info" %}
**TRON Networks:** Choose the correct provider for your environment.
*   **Mainnet:** `https://api.trongrid.io`
*   **Shasta (Testnet):** `https://api.shasta.trongrid.io`
{% endhint %}

## Next Steps

Once your wallets are registered, you can [manage accounts and specific addresses](./account-management.md).
