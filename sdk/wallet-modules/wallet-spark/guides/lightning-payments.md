---
title: Lightning Payments
description: Create Lightning invoices, pay invoices, and inspect payment status.
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

# Lightning Payments

This guide explains how to [create a Lightning invoice](#create-a-lightning-invoice), [pay a Lightning invoice](#pay-a-lightning-invoice), [estimate Lightning fees](#estimate-lightning-fees), and [fetch a Lightning send request](#fetch-a-lightning-send-request).

## Create a Lightning Invoice

1. Choose an amount in satoshis and an optional memo.
2. Call [`account.createLightningInvoice()`](../api-reference.md#createlightninginvoice-options).

You can create a BOLT11 invoice using [`account.createLightningInvoice()`](../api-reference.md#createlightninginvoice-options):

{% code title="Create Lightning Invoice" lineNumbers="true" %}
```javascript
const invoice = await account.createLightningInvoice({
  amountSats: 50000,
  memo: 'Payment for services'
})
console.log('Lightning invoice:', invoice.invoice)
```
{% endcode %}

## Pay a Lightning Invoice

1. Obtain a BOLT11 `encodedInvoice` string.
2. Set `maxFeeSats` to cap routing fees.
3. Call [`account.payLightningInvoice()`](../api-reference.md#paylightninginvoice-options).

You can pay an invoice using [`account.payLightningInvoice()`](../api-reference.md#paylightninginvoice-options):

{% code title="Pay Lightning Invoice" lineNumbers="true" %}
```javascript
const payment = await account.payLightningInvoice({
  encodedInvoice: 'lnbc500u1p...',
  maxFeeSats: 1000
})
console.log('Payment result:', payment)
```
{% endcode %}

If you enable [`syncAndRetry`](../configuration.md#automatic-retry), the wallet syncs state and retries [`account.payLightningInvoice()`](../api-reference.md#paylightninginvoice-options) once after a failure:

{% code title="Retry Lightning Payment Once" lineNumbers="true" %}
```javascript
const wallet = new WalletManagerSpark(seedPhrase, {
  network: 'MAINNET',
  syncAndRetry: true,
})

const account = await wallet.getAccount(0)
await account.payLightningInvoice({
  encodedInvoice: 'lnbc500u1p...',
  maxFeeSats: 1000,
})
```
{% endcode %}

## Estimate Lightning Fees

You can estimate the routing fee before paying using [`account.quotePayLightningInvoice()`](../api-reference.md#quotepaylightninginvoice-options):

{% code title="Quote Lightning Payment Fee" lineNumbers="true" %}
```javascript
const feeEstimate = await account.quotePayLightningInvoice({
  encodedInvoice: 'lnbc500u1p...'
})
console.log('Fee estimate:', Number(feeEstimate), 'satoshis')
```
{% endcode %}

{% hint style="info" %}
Older references to `getLightningSendFeeEstimate()` map to [`quotePayLightningInvoice()`](../api-reference.md#quotepaylightninginvoice-options).
{% endhint %}

## Fetch a Lightning Send Request

You can load a prior send request by id using [`account.getLightningSendRequest()`](../api-reference.md#getlightningsendrequest-requestid):

{% code title="Get Lightning Send Request" lineNumbers="true" %}
```javascript
const sendRequest = await account.getLightningSendRequest(payment.id)
if (sendRequest) {
  console.log('Payment status:', sendRequest.status)
}
```
{% endcode %}

{% hint style="info" %}
Use the `id` from the object returned by [`payLightningInvoice()`](../api-reference.md#paylightninginvoice-options).
{% endhint %}

## Next Steps

Learn how to [handle Bitcoin layer 1 deposits and withdrawals](./deposits-and-withdrawals.md).
