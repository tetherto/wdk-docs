---
title: Send TON
description: Send native TON and estimate transaction fees.
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

This guide explains how to [send native TON](#send-native-ton), [estimate transaction fees](#estimate-transaction-fees), and [use dynamic fee rates](#use-dynamic-fee-rates).

{% hint style="info" %}
On TON, values are expressed in nanotons (1 TON = 10^9 nanotons). Transactions support an optional `bounceable` parameter specific to the TON network.
{% endhint %}

## Send Native TON

You can transfer TON to a recipient address using [`account.sendTransaction()`](../api-reference.md#sendtransaction-tx):

{% code title="Send TON" lineNumbers="true" %}
```javascript
const result = await account.sendTransaction({
  to: 'EQ...', // TON address
  value: 1000000000, // 1 TON in nanotons
  bounceable: true // Optional: specify if the address is bounceable
})
console.log('Transaction hash:', result.hash)
console.log('Transaction fee:', result.fee, 'nanotons')
```
{% endcode %}

## Estimate Transaction Fees

You can get a fee estimate before sending using [`account.quoteSendTransaction()`](../api-reference.md#quotesendtransaction-tx):

{% code title="Quote Transaction Fee" lineNumbers="true" %}
```javascript
const quote = await account.quoteSendTransaction({
  to: 'EQ...',
  value: 1000000000,
  bounceable: true
})
console.log('Estimated fee:', quote.fee, 'nanotons')
```
{% endcode %}

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

To transfer Jetton tokens instead of native TON, see [Transfer Jetton Tokens](./transfer-tokens.md).
