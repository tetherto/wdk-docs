---
title: Manage Transactions
description: Poll MoonPay for transaction status and inspect returned details.
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

# Manage Transactions

This guide shows how to [check transaction status](#check-transaction-status) and [read transaction details](#read-transaction-details) with [`getTransactionDetail()`](/sdk/fiat-modules/fiat-moonpay/api-reference/#gettransactiondetail-txid-direction). Pass the identifier MoonPay returns after checkout (for example from your redirect URL or webhook payload).

## Check transaction status

You can read the high-level state of a buy with [`getTransactionDetail()`](/sdk/fiat-modules/fiat-moonpay/api-reference/#gettransactiondetail-txid-direction):

{% code title="Buy transaction status" lineNumbers="true" %}
```typescript
const buyTx = await moonpay.getTransactionDetail(moonpayTransactionId, 'buy')

console.log('Status:', buyTx.status)
```
{% endcode %}

`status` is one of `completed`, `failed`, or `in_progress` as described in the API reference.

## Read transaction details

You can load the same record to inspect assets and currencies using [`getTransactionDetail()`](/sdk/fiat-modules/fiat-moonpay/api-reference/#gettransactiondetail-txid-direction):

{% code title="Buy transaction fields" lineNumbers="true" %}
```typescript
const buyTx = await moonpay.getTransactionDetail(moonpayTransactionId, 'buy')

console.log('Crypto asset:', buyTx.cryptoAsset)
console.log('Fiat currency:', buyTx.fiatCurrency)
console.log('Metadata:', buyTx.metadata)
```
{% endcode %}

You can query a sell the same way by passing `sell` as the direction to [`getTransactionDetail()`](/sdk/fiat-modules/fiat-moonpay/api-reference/#gettransactiondetail-txid-direction):

{% code title="Sell transaction details" lineNumbers="true" %}
```typescript
const sellTx = await moonpay.getTransactionDetail(moonpayTransactionId, 'sell')

console.log('Status:', sellTx.status)
console.log('Crypto asset:', sellTx.cryptoAsset)
console.log('Fiat currency:', sellTx.fiatCurrency)
```
{% endcode %}

{% hint style="info" %}
The second argument defaults to `buy` when omitted; set it explicitly for sell flows.
{% endhint %}

## Next Steps

- [Buy and sell](/sdk/fiat-modules/fiat-moonpay/guides/buy-and-sell/)
- [Get started](/sdk/fiat-modules/fiat-moonpay/guides/get-started/)
- [Configuration](/sdk/fiat-modules/fiat-moonpay/configuration/)
