---
title: Getting Started
description: Install and create your first EVM wallet.
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

This guide explains how to install the [`@tetherto/wdk-wallet-evm`](https://www.npmjs.com/package/@tetherto/wdk-wallet-evm) package and create a new wallet instance.

## 1. Installation

### Prerequisites

Before you begin, ensure you have the following installed:

*   **[Node.js](https://nodejs.org/)**: version 18 or higher.
*   **[npm](https://www.npmjs.com/)**: usually comes with Node.js.

### Install Package

{% code title="Install @tetherto/wdk-wallet-evm" lineNumbers="true" %}
```bash
npm install @tetherto/wdk-wallet-evm
```
{% endcode %}

## 2. Create a Wallet

Import the module and create a [`WalletManagerEvm`](/sdk/wallet-modules/wallet-evm/api-reference#walletmanagerevm) instance with a BIP-39 seed phrase and an RPC provider.

{% code title="Create EVM Wallet" lineNumbers="true" %}
```javascript
import WalletManagerEvm, { WalletAccountEvm, WalletAccountReadOnlyEvm } from '@tetherto/wdk-wallet-evm'

const seedPhrase = 'your twelve word seed phrase here'

const wallet = new WalletManagerEvm(seedPhrase, {
  provider: 'https://rpc.mevblocker.io/fast',
  transferMaxFee: 100000000000000 // Optional: maximum fee in wei
})
```
{% endcode %}

{% hint style="danger" %}
**Secure the Seed Phrase:** You must securely store this seed phrase immediately. If it is lost, the user will permanently lose access to their funds.
{% endhint %}

You can also pass an EIP-1193 provider (e.g., from a browser wallet) instead of an RPC URL:

{% code title="Use EIP-1193 Provider" lineNumbers="true" %}
```javascript
const wallet = new WalletManagerEvm(seedPhrase, {
  provider: window.ethereum,
  transferMaxFee: 100000000000000
})
```
{% endcode %}

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
**RPC Providers:** The examples use public RPC endpoints for demonstration. We do not endorse any specific provider.
*   **Testnets:** You can find public RPCs for Ethereum and other EVM chains on [Chainlist](https://chainlist.org).
*   **Mainnet:** For production environments, we recommend using reliable, paid RPC providers to ensure stability.
{% endhint %}

{% hint style="info" %}
To use test/mock tokens instead of real funds, see the [configuration section](../configuration.md#network-support).
{% endhint %}

## Next Steps

With your wallet ready, learn how to [manage multiple accounts](./manage-accounts.md).
