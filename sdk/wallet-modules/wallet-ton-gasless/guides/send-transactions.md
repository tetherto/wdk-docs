---
title: Send TON
description: Send native TON transactions and estimate fees.
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

# Send TON

This guide explains how to [send native TON](#send-native-ton) and [use dynamic fee rates](#use-dynamic-fee-rates). Native TON sends are not gasless; for gasless Jetton token transfers, see [Transfer Jetton Tokens](/sdk/wallet-modules/wallet-ton-gasless/guides/transfer-tokens/).

{% hint style="info" %}
On TON, values are expressed in nanotons (1 TON = 10^9 nanotons).
{% endhint %}

## Send Native TON

You can transfer TON to a recipient address using [`account.sendTransaction()`](/sdk/wallet-modules/wallet-ton-gasless/api-reference/#sendtransaction-tx):

{% code title="Send TON" lineNumbers="true" %}
```javascript
const result = await account.sendTransaction({
  to: 'EQ...',
  value: 1000000000 // 1 TON in nanotons
})
console.log('Transaction hash:', result.hash)
console.log('Transaction fee:', result.fee, 'nanotons')
```
{% endcode %}

## Use Dynamic Fee Rates

You can retrieve current fee rates from the wallet manager using [`wallet.getFeeRates()`](/sdk/wallet-modules/wallet-ton-gasless/api-reference/#getfeerates):

{% code title="Get Fee Rates" lineNumbers="true" %}
```javascript
const feeRates = await wallet.getFeeRates()
console.log('Normal fee rate:', feeRates.normal, 'nanotons')
console.log('Fast fee rate:', feeRates.fast, 'nanotons')
```
{% endcode %}

## Next Steps

To transfer Jetton tokens with gasless fees (paid in paymaster tokens), see [Transfer Jetton Tokens](/sdk/wallet-modules/wallet-ton-gasless/guides/transfer-tokens/).
