---
title: Get Started
description: Install and create your first Bitcoin wallet.
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

{% code title="Install @tetherto/wdk-wallet-btc" lineNumbers="true" %}
```bash
npm install @tetherto/wdk-wallet-btc
```
{% endcode %}

## 2. Create a Wallet

You can create a new wallet instance using the [`WalletManagerBtc`](../api-reference.md#walletmanagerbtc) constructor with a BIP-39 seed phrase and an Electrum client:

{% code title="Create Bitcoin Wallet" lineNumbers="true" %}
```javascript
import WalletManagerBtc, { ElectrumTcp } from '@tetherto/wdk-wallet-btc'

const seedPhrase = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'

const client = new ElectrumTcp({
  host: 'electrum.blockstream.info',
  port: 50001
})

const wallet = new WalletManagerBtc(seedPhrase, {
  client,
  network: 'bitcoin'
})
```
{% endcode %}

{% hint style="danger" %}
**Secure the Seed Phrase:** You must securely store this seed phrase immediately. If it is lost, the user will permanently lose access to their funds.
{% endhint %}

{% hint style="warning" %}
**Electrum Server Performance:** Public servers like Blockstream's can be 10-300x slower than private servers. For production use, set up your own [Fulcrum](https://github.com/cculianu/Fulcrum) server. For development, consider `fulcrum.frznode.com` as a faster alternative.
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

{% hint style="info" %}
This implementation uses BIP-84 derivation paths and generates Native SegWit (bech32) addresses by default. Addresses start with `bc1` on mainnet. Set `bip: 44` in config for legacy (P2PKH) addresses.
{% endhint %}

## 4. (optional) Convert to Read-Only

You can convert an owned account to a read-only account using [`account.toReadOnlyAccount()`](../api-reference.md#toreadonlyaccount):

{% code title="Convert to Read-Only" lineNumbers="true" %}
```javascript
const readOnlyAccount = await account.toReadOnlyAccount()
```
{% endcode %}

## Next Steps

With your wallet ready, learn how to [manage multiple accounts](./manage-accounts.md).
