---
title: Instantiate WDK
description: Learn how to create a new WDK instance.
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

# Instantiate WDK

This guide explains how to import the WDK Core module and create a new instance to start managing your wallets.

## Import the module

First, import the `WDK` class from the package you installed:

{% code title="Import WDK Core"lineNumbers="true" %}
```typescript
import WDK from '@tetherto/wdk'
```
{% endcode %}

## Create an Instance

To use the SDK, you must create an instance of the `WDK` class. This instance acts as the central manager for all your wallets and protocols.

You can initialize `WDK` in two ways: with a new seed phrase or an existing one.

### Option 1: Generate a new wallet

If you are creating a fresh wallet for a user, use the static `getRandomSeedPhrase()` method to generate a secure mnemonic.

{% code title="Create new WDK Instance" lineNumbers="true" %}
```typescript
// 1. Generate a secure random seed phrase
const seedPhrase = WDK.getRandomSeedPhrase()

// 2. Initialize the WDK instance with the new seed
const wdk = new WDK(seedPhrase)
```
{% endcode %}

> [!IMPORTANT]
> **Secure the Seed Phrase:** You must securely store this seed phrase immediately. If it is lost, the user will permanently lose access to their funds.

### Option 2: Restore an existing wallet

If a user already has a seed phrase (e.g., from a previous session or another wallet), you can pass it directly to the constructor.

{% code title="Restore WDK Instance" lineNumbers="true" %}
```typescript
// Replace this string with the user's actual seed phrase
const existingSeed = 'witch collapse practice feed shame open despair creek road again ice ...'

const wdk = new WDK(existingSeed)
```
{% endcode %}

## Next steps

With your WDK instance ready, you can now [register wallet modules](./wallet-registration.md) to interact with specific blockchains like Ethereum, TON, or Bitcoin.
