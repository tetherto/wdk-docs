---
title: Get Started
description: Install and create your first TON wallet.
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

This guide explains how to [install the package](#1-install-the-package), [create a wallet](#2-create-a-wallet), and [get your first account](#3-get-your-first-account).

## 1. Install the Package

### Prerequisites

*   **[Node.js](https://nodejs.org/)**: version 18 or higher.
*   **[npm](https://www.npmjs.com/)**: usually comes with Node.js.

{% code title="Install @tetherto/wdk-wallet-ton" lineNumbers="true" %}
```bash
npm install @tetherto/wdk-wallet-ton
```
{% endcode %}

## 2. Create a Wallet

You can create a new wallet instance using the [`WalletManagerTon`](../api-reference.md#walletmanagerton) constructor with a BIP-39 seed phrase and a TON Center client configuration:

{% code title="Create TON Wallet" lineNumbers="true" %}
```javascript
import WalletManagerTon, { WalletAccountTon, WalletAccountReadOnlyTon } from '@tetherto/wdk-wallet-ton'

const seedPhrase = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'

const wallet = new WalletManagerTon(seedPhrase, {
  tonClient: {
    url: 'https://toncenter.com/api/v3',
    secretKey: 'your-api-key' // Optional
  }
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
console.log('Wallet address:', address)
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
