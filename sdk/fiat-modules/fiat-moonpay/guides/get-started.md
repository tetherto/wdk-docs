---
title: Get Started
description: Install the package and initialize MoonPayProtocol with your wallet and keys.
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

This guide covers [installation](#installation) and [initializing the protocol](#initialize-moonpayprotocol). You need [Node.js](https://nodejs.org/), [npm](https://www.npmjs.com/), and MoonPay API keys from your MoonPay dashboard.

## Installation

Run the following to install [@tetherto/wdk-protocol-fiat-moonpay](https://www.npmjs.com/package/@tetherto/wdk-protocol-fiat-moonpay):

{% code title="Install with npm" lineNumbers="true" %}
```bash
npm install @tetherto/wdk-protocol-fiat-moonpay
```
{% endcode %}

## Initialize MoonPayProtocol

You can create a fiat ramp client with [`new MoonPayProtocol(account, config)`](../api-reference.md#new-moonpayprotocol-account-config):

{% code title="Construct MoonPayProtocol" lineNumbers="true" %}
```typescript
import MoonPayProtocol from '@tetherto/wdk-protocol-fiat-moonpay'

const moonpay = new MoonPayProtocol(walletAccount, {
  apiKey: process.env.MOONPAY_PUBLISHABLE_KEY,
  secretKey: process.env.MOONPAY_SECRET_KEY
})
```
{% endcode %}

{% hint style="warning" %}
Never ship a secret key to browsers. Run server-side signing where your architecture allows, and rotate keys if they leak.
{% endhint %}

See [Configuration](../configuration.md) for `cacheTime` and related options.

## Next Steps

- [Buy and sell](buy-and-sell.md)
- [Manage transactions](manage-transactions.md)
