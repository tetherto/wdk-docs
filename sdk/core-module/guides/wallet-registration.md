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

The `registerWallet` method requires three arguments:

1.  **Symbol**: A unique string identifier for the chain (e.g., `'ethereum'`, `'ton'`). You will use this ID later to retrieve accounts.
2.  **Manager Class**: The wallet manager class imported from the specific module (e.g., `WalletManagerEvm`).
3.  **Configuration**: An object containing the chain-specific settings (e.g., RPC providers, API keys).

## Installation

Install the wallet managers for the blockchains you want to support:

```bash
npm install @tetherto/wdk-wallet-evm @tetherto/wdk-wallet-ton @tetherto/wdk-wallet-btc
```

## Example: Registering Multiple Wallets

First, import the necessary wallet manager packages:

{% code title="Import Modules" lineNumbers="true" %}
```typescript
import WalletManagerEvm from '@tetherto/wdk-wallet-evm'
import WalletManagerTon from '@tetherto/wdk-wallet-ton'
import WalletManagerBtc from '@tetherto/wdk-wallet-btc'
```
{% endcode %}

Then, instantiate WDK and chain the registration calls:

{% code title="Register Wallets" lineNumbers="true" %}
```typescript
const wdk = new WDK(seedPhrase)
  // 1. Register Ethereum
  .registerWallet('ethereum', WalletManagerEvm, {
    provider: 'https://eth.drpc.org'
  })
  // 2. Register TON
  .registerWallet('ton', WalletManagerTon, {
    // Get your API key: https://docs.ton.org/ecosystem/api/toncenter/get-api-key
    tonClient: {
      secretKey: 'YOUR_TON_API_KEY',
      url: 'https://toncenter.com/api/v2/jsonRPC'
    }
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
**TON Networks:** The endpoint (`url`) you use must match your API key environment.
*   **Mainnet:** `https://toncenter.com/api/v2/jsonRPC`
*   **Testnet:** `https://testnet.toncenter.com/api/v2/jsonRPC`
{% endhint %}

## Next steps

Once your wallets are registered, you can [manage accounts and specific addresses](./account-management.md).
