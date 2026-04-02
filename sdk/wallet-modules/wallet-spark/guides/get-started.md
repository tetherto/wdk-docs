---
title: Get Started
description: Install the Spark wallet package and create your first account.
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

This guide explains how to [install the package](#1-install-the-package), [create a wallet](#2-create-a-wallet), [get your first account](#3-get-your-first-account), and optionally [convert the account to read-only](#4-optional-convert-to-read-only).

## 1. Install the Package

### Prerequisites

* **[Node.js](https://nodejs.org/)**: version 18 or higher.
* **[npm](https://www.npmjs.com/)**: usually comes with Node.js.

Install [@tetherto/wdk-wallet-spark](https://www.npmjs.com/package/@tetherto/wdk-wallet-spark):

{% code title="Install @tetherto/wdk-wallet-spark" lineNumbers="true" %}
```bash
npm install @tetherto/wdk-wallet-spark
```
{% endcode %}

{% hint style="info" %}
The WDK Spark wallet module uses ES Modules (`import` / `export`). Set `"type": "module"` in `package.json`, or run in an environment that supports ESM.
{% endhint %}

## 2. Create a Wallet

You can create a wallet manager using the [`WalletManagerSpark`](../api-reference.md#walletmanagerspark) constructor with a BIP-39 seed phrase:

{% code title="Create Spark Wallet" lineNumbers="true" %}
```javascript
import WalletManagerSpark from '@tetherto/wdk-wallet-spark'

const seedPhrase = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'

const wallet = new WalletManagerSpark(seedPhrase)

const walletRegtest = new WalletManagerSpark(seedPhrase, {
  network: 'REGTEST'
})
```
{% endcode %}

{% hint style="danger" %}
**Secure the seed phrase:** Store this seed phrase securely. If it is lost, the user will permanently lose access to their funds.
{% endhint %}

{% hint style="info" %}
For development on **REGTEST**, you can request test funds from the [Lightspark Regtest Faucet](https://app.lightspark.com/regtest-faucet).
{% endhint %}

{% hint style="info" %}
The Spark wallet uses `@buildonspark/spark-sdk`. Network options are `MAINNET` or `REGTEST` only; there is no custom RPC provider option.
{% endhint %}

## 3. Get Your First Account

1. Call [`wallet.getAccount()`](../api-reference.md#getaccount-index) with index `0`.
2. Call [`account.getAddress()`](../api-reference.md#getaddress) to read the Spark address.

You can retrieve the first account using [`wallet.getAccount()`](../api-reference.md#getaccount-index):

{% code title="Get First Account" lineNumbers="true" %}
```javascript
const account = await wallet.getAccount(0)
const address = await account.getAddress()
console.log('Account address:', address)
```
{% endcode %}

## 4. (optional) Convert to Read-Only

You can create a read-only view of the account using [`account.toReadOnlyAccount()`](../api-reference.md#toreadonlyaccount):

{% code title="Convert to Read-Only" lineNumbers="true" %}
```javascript
const readOnlyAccount = await account.toReadOnlyAccount()
```
{% endcode %}

## Next Steps

With your wallet ready, learn how to [manage multiple accounts](./manage-accounts.md).
