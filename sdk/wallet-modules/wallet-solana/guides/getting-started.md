---
title: Getting Started
description: Install and create your first Solana wallet.
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

# Getting Started

This guide explains how to install the [`@tetherto/wdk-wallet-solana`](https://www.npmjs.com/package/@tetherto/wdk-wallet-solana) package and create a new wallet instance.

## 1. Installation

### Prerequisites

Before you begin, ensure you have the following installed:

*   **[Node.js](https://nodejs.org/)**: version 18 or higher.
*   **[npm](https://www.npmjs.com/)**: usually comes with Node.js.

### Install Package

{% code title="Install @tetherto/wdk-wallet-solana" lineNumbers="true" %}
```bash
npm install @tetherto/wdk-wallet-solana
```
{% endcode %}

## 2. Create a Wallet

Import the module and create a [`WalletManagerSolana`](/sdk/wallet-modules/wallet-solana/api-reference#walletmanagersolana) instance with a BIP-39 seed phrase and a Solana RPC endpoint.

{% code title="Create Solana Wallet" lineNumbers="true" %}
```javascript
import WalletManagerSolana, {
  WalletAccountSolana,
  WalletAccountReadOnlySolana
} from '@tetherto/wdk-wallet-solana'

const seedPhrase = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'

const wallet = new WalletManagerSolana(seedPhrase, {
  provider: 'https://api.mainnet-beta.solana.com',
  commitment: 'confirmed' // Optional: commitment level
})
```
{% endcode %}

{% hint style="info" %}
To enable RPC failover, pass [`provider`](../configuration.md#provider) as an ordered array of endpoints and set [`retries`](../configuration.md#retries) to control additional failover attempts. `rpcUrl` remains available as a deprecated alias for `provider`.
{% endhint %}

{% hint style="danger" %}
**Secure the Seed Phrase:** You must securely store this seed phrase immediately. If it is lost, the user will permanently lose access to their funds.
{% endhint %}

## 3. Get Your First Account

Retrieve an account from the wallet and inspect its address.

{% code title="Get Account" lineNumbers="true" %}
```javascript
const account = await wallet.getAccount(0)
const address = await account.getAddress()
console.log('Wallet address:', address)

const readOnlyAccount = await account.toReadOnlyAccount()
```
{% endcode %}

{% hint style="info" %}
All Solana addresses are base58-encoded public keys. Accounts inherit the provider configuration from the wallet manager.
{% endhint %}

## Next Steps

With your wallet ready, learn how to [manage multiple accounts](./account-management.md).
