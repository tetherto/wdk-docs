---
title: Native TON Transactions
description: Understand native TON transaction support in the gasless TON module.
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

# Native TON Transactions

This guide explains native TON transaction support in `@tetherto/wdk-wallet-ton-gasless` and how to [use dynamic fee rates](#use-dynamic-fee-rates). For gasless Jetton token transfers, see [Transfer Jetton Tokens](./transfer-tokens.md).

{% hint style="info" %}
On TON, values are expressed in nanotons (1 TON = 10^9 nanotons).
{% endhint %}

## Native TON Sends

`account.sendTransaction()` is not supported by the gasless TON module. It throws because this module only relays Jetton transfers through the TON API gasless flow.

Use [`@tetherto/wdk-wallet-ton`](../../wallet-ton/) for native TON transfers. If you need to initialize the same gasless address before its first gasless transfer, make sure the initializer uses the same derivation path as the gasless account.

## Use Dynamic Fee Rates

You can retrieve current fee rates from the wallet manager using [`wallet.getFeeRates()`](../api-reference.md#getfeerates):

{% code title="Get Fee Rates" lineNumbers="true" %}
```javascript
const feeRates = await wallet.getFeeRates()
console.log('Normal fee rate:', feeRates.normal, 'nanotons')
console.log('Fast fee rate:', feeRates.fast, 'nanotons')
```
{% endcode %}

## Next Steps

To transfer Jetton tokens with gasless fees (paid in paymaster tokens), see [Transfer Jetton Tokens](./transfer-tokens.md).
