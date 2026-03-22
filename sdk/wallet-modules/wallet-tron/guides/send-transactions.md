---
title: Send TRX
description: Send native TRX and estimate transaction fees on Tron.
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

# Send TRX

This guide explains how to [send native TRX](#send-native-trx), [estimate transaction fees](#estimate-transaction-fees), and [use dynamic fee rates](#use-dynamic-fee-rates).

{% hint style="info" %}
On Tron, values are expressed in sun (1 TRX = 1,000,000 sun).
{% endhint %}

## Send Native TRX

You can transfer TRX to a recipient address using [`account.sendTransaction()`](../api-reference.md#sendtransaction-tx):

{% code title="Send TRX" lineNumbers="true" %}
```javascript
const result = await account.sendTransaction({
  to: 'TLyqzVGLV1srkB7dToTAEqgDSfPtXRJZYH',
  value: 1000000 // 1 TRX in sun
})
console.log('Transaction hash:', result.hash)
console.log('Transaction fee:', result.fee, 'sun')
```
{% endcode %}

## Estimate Transaction Fees

You can get a fee estimate before sending using [`account.quoteSendTransaction()`](../api-reference.md#quotesendtransaction-tx):

{% code title="Quote Transaction Fee" lineNumbers="true" %}
```javascript
const quote = await account.quoteSendTransaction({
  to: 'TLyqzVGLV1srkB7dToTAEqgDSfPtXRJZYH',
  value: 1000000
})
console.log('Estimated fee:', quote.fee, 'sun')
```
{% endcode %}

## Use Dynamic Fee Rates

You can retrieve current fee rates from the wallet manager using [`wallet.getFeeRates()`](../api-reference.md#getfeerates):

{% code title="Get Fee Rates" lineNumbers="true" %}
```javascript
const feeRates = await wallet.getFeeRates()
console.log('Normal fee rate:', feeRates.normal, 'sun')
console.log('Fast fee rate:', feeRates.fast, 'sun')
```
{% endcode %}

## Next Steps

To transfer TRC20 tokens instead of native TRX, see [Transfer TRC20 Tokens](./transfer-tokens.md).
