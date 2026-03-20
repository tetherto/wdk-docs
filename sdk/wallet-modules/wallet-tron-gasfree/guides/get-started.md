---
title: Get Started
description: Install and create your first gas-free Tron wallet.
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

# Get Started

This guide explains how to install the [`@tetherto/wdk-wallet-tron-gasfree`](https://www.npmjs.com/package/@tetherto/wdk-wallet-tron-gasfree) package and create a new gas-free wallet instance.

## 1. Install the Package

### Prerequisites

*   **[Node.js](https://nodejs.org/)**: version 18 or higher.
*   **[npm](https://www.npmjs.com/)**: usually comes with Node.js.

{% code title="Install @tetherto/wdk-wallet-tron-gasfree" lineNumbers="true" %}
```bash
npm install @tetherto/wdk-wallet-tron-gasfree
```
{% endcode %}

## 2. Create a Gas-Free Wallet

You can create a new gas-free wallet instance using the [`WalletManagerTronGasfree`](../api-reference.md#walletmanagertrongasfree) constructor with a BIP-39 seed phrase, Tron RPC provider, and gas-free service configuration:

{% code title="Create Gas-Free Tron Wallet" lineNumbers="true" %}
```javascript
import WalletManagerTronGasfree, {
  WalletAccountTronGasfree,
  WalletAccountReadOnlyTronGasfree
} from '@tetherto/wdk-wallet-tron-gasfree'

const seedPhrase = 'your twelve word seed phrase here'

const wallet = new WalletManagerTronGasfree(seedPhrase, {
  chainId: 728126428,
  provider: 'https://api.trongrid.io',
  gasFreeProvider: 'https://gasfree.provider.url',
  gasFreeApiKey: 'your-gasfree-api-key',
  gasFreeApiSecret: 'your-gasfree-api-secret',
  serviceProvider: 'TLyqzVGLV1srkB7dToTAEqgDSfPtXRJZYH',
  verifyingContract: 'TLyqzVGLV1srkB7dToTAEqgDSfPtXRJZYH',
  transferMaxFee: 10000000 // Optional: maximum fee in token base units
})
```
{% endcode %}

{% hint style="danger" %}
**Secure the Seed Phrase:** You must securely store this seed phrase immediately. If it is lost, the user will permanently lose access to their funds.
{% endhint %}

## 3. Get Your First Account

You can retrieve an account at a given index using [`wallet.getAccount()`](../api-reference.md#getaccount-index):

{% code title="Get Account" lineNumbers="true" %}
```javascript
const account = await wallet.getAccount(0)
const address = await account.getAddress()
console.log('Gas-free account address:', address)
```
{% endcode %}

You can convert an owned account to a read-only account using [`account.toReadOnlyAccount()`](../api-reference.md#toreadonlyaccount):

{% code title="Convert to Read-Only" lineNumbers="true" %}
```javascript
const readOnlyAccount = await account.toReadOnlyAccount()
```
{% endcode %}

{% hint style="info" %}
All Tron addresses start with `T` and are 34 characters long.
{% endhint %}

## Next Steps

With your wallet ready, learn how to [manage multiple accounts](./manage-accounts.md).
