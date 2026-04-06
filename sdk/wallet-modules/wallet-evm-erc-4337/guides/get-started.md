---
title: Get Started
description: Install and create your first ERC-4337 smart account wallet.
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

This guide explains how to [install the package](#1-install-the-package), [create a wallet](#2-create-a-wallet), [get your first account](#3-get-your-first-account), and optionally [convert to read-only](#4-optional-convert-to-read-only).

## 1. Install the Package

### Prerequisites

*   **[Node.js](https://nodejs.org/)**: version 18 or higher.
*   **[npm](https://www.npmjs.com/)**: usually comes with Node.js.

{% code title="Install @tetherto/wdk-wallet-evm-erc-4337" lineNumbers="true" %}
```bash
npm install @tetherto/wdk-wallet-evm-erc-4337
```
{% endcode %}

## 2. Create a Wallet

You can create a new wallet instance using the [`WalletManagerEvmErc4337`](../api-reference.md#walletmanagerevmerc4337) constructor with a BIP-39 seed phrase and ERC-4337 configuration:

{% code title="Create ERC-4337 Wallet" lineNumbers="true" %}
```javascript
import WalletManagerEvmErc4337 from '@tetherto/wdk-wallet-evm-erc-4337'

const seedPhrase = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'

const wallet = new WalletManagerEvmErc4337(seedPhrase, {
  chainId: 1,
  provider: 'https://rpc.mevblocker.io/fast',
  bundlerUrl: 'https://api.candide.dev/public/v3/ethereum',
  paymasterUrl: 'https://api.candide.dev/public/v3/ethereum',
  paymasterAddress: '0x8b1f6cb5d062aa2ce8d581942bbb960420d875ba',
  entryPointAddress: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
  safeModulesVersion: '0.3.0',
  paymasterToken: {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' // USDT
  }
})
```
{% endcode %}

{% hint style="danger" %}
**Secure the Seed Phrase:** You must securely store this seed phrase immediately. If it is lost, the user will permanently lose access to their funds.
{% endhint %}

{% hint style="info" %}
To use test/mock tokens instead of real funds, see the [testnet configuration section](../configuration.md#network-specific-configurations).
{% endhint %}

## 3. Get Your First Account

You can retrieve a smart account at a given index using [`wallet.getAccount()`](../api-reference.md#getaccount-index):

{% code title="Get Account" lineNumbers="true" %}
```javascript
const account = await wallet.getAccount(0)
const address = await account.getAddress()
console.log('Smart account address:', address)
```
{% endcode %}

## 4. (optional) Convert to Read-Only

You can convert an owned account to a read-only account using [`account.toReadOnlyAccount()`](../api-reference.md#toreadonlyaccount):

{% code title="Convert to Read-Only" lineNumbers="true" %}
```javascript
const readOnlyAccount = await account.toReadOnlyAccount()
```
{% endcode %}

## Next Steps

With your wallet ready, learn how to [manage multiple accounts](./manage-accounts.md).
