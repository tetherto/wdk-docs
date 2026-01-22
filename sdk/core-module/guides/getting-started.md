---
title: Getting Started
description: Install and instantiate the WDK Core module.
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

This guide explains how to install the [`@tetherto/wdk`](https://www.npmjs.com/package/@tetherto/wdk) package and create a new instance to start managing your wallets.

## 1. Installation

### Prerequisites

Before you begin, ensure you have the following installed:

*   **[Node.js](https://nodejs.org/)**: version 18 or higher.
*   **[npm](https://www.npmjs.com/)**: usually comes with Node.js.

### Install Package

To install the WDK Core package, run the following command in your terminal:

```bash
npm install @tetherto/wdk
```

This package allows you to manage different blockchain wallets and protocols through a single interface.

## 2. Instantiation

To use WDK, you must create an instance of the `WDK` class. This instance acts as the central manager for all your wallets and protocols.

### Import the Module

First, import the `WDK` class from the package:

{% code title="Import WDK Core" lineNumbers="true" %}
```typescript
import WDK from '@tetherto/wdk'
```
{% endcode %}

### Initialize WDK

You can initialize `WDK` in two ways: with a [new seed phrase](#generate-a-new-wallet) or an [existing one](#restore-an-existing-wallet).

#### Generate a New Wallet

If you are creating a fresh wallet for a user, use the static `getRandomSeedPhrase()` method to generate a secure mnemonic.

{% code title="Create new WDK Instance" lineNumbers="true" %}
```typescript
// 1. Generate a secure random seed phrase
// Generate 24-word seed phrase for higher security
const seedPhrase = WDK.getRandomSeedPhrase(24)

// Or use 12-word seed phrase (default)
// const seedPhrase = WDK.getRandomSeedPhrase()

// 2. Initialize the WDK instance with the new seed
const wdk = new WDK(seedPhrase)
```
{% endcode %}

{% hint style="danger" %}
**Secure the Seed Phrase:** You must securely store this seed phrase immediately. If it is lost, the user will permanently lose access to their funds.
{% endhint %}

#### Restore an Existing Wallet

If a user already has a seed phrase (e.g., from a previous session or another wallet), you can pass it directly to the constructor.

{% code title="Restore WDK Instance" lineNumbers="true" %}
```typescript
// Replace this string with the user's actual seed phrase
const existingSeed = 'witch collapse practice feed shame open despair creek road again ice ...'

const wdk = new WDK(existingSeed)
```
{% endcode %}

## Next Steps

With your WDK instance ready, you can now [register wallet modules](./wallet-registration.md) to interact with specific blockchains like [Ethereum](../../wallet-modules/wallet-evm/README.md), [TON](../../wallet-modules/wallet-ton/README.md), or [Bitcoin](../../wallet-modules/wallet-btc/README.md).
