---
title: Send Transactions
description: Send BTC and estimate transaction fees.
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

# Send Transactions

This guide explains how to [send BTC](#send-btc), [estimate fees before sending](#estimate-fees), [use a custom fee rate](#send-with-custom-fee-rate), and [target a specific confirmation time](#send-with-confirmation-target).

## Send BTC

You can send Bitcoin to a recipient using [`account.sendTransaction()`](../api-reference.md#sendtransaction-options):

{% code title="Send BTC" lineNumbers="true" %}
```javascript
const result = await account.sendTransaction({
  to: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  value: 100000n // 0.001 BTC in satoshis
})
console.log('Transaction hash:', result.hash)
console.log('Transaction fee:', result.fee, 'satoshis')
```
{% endcode %}

{% hint style="info" %}
Bitcoin transactions support a single recipient only. Amounts and fees are always in satoshis (1 BTC = 100,000,000 satoshis). The minimum amount must be above the dust limit (294 satoshis for SegWit, 546 for legacy).
{% endhint %}

## Extend Post-Broadcast Polling

If you want [`account.sendTransaction()`](../api-reference.md#sendtransaction-options-timeoutms) to keep polling after broadcast until spent inputs disappear from the unspent-output set, pass the optional `timeoutMs` argument:

{% code title="Send BTC With Extended Polling" lineNumbers="true" %}
```javascript
const result = await account.sendTransaction(
  {
    to: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    value: 100000n,
  },
  30000
)

console.log('Transaction hash:', result.hash)
```
{% endcode %}

{% hint style="info" %}
If you omit `timeoutMs`, the wallet uses the default post-broadcast polling window before returning.
{% endhint %}

## Estimate Fees

You can estimate the fee for a transaction without broadcasting it using [`account.quoteSendTransaction()`](../api-reference.md#quotesendtransaction-options):

{% code title="Estimate Fee" lineNumbers="true" %}
```javascript
const quote = await account.quoteSendTransaction({
  to: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  value: 100000n
})
console.log('Estimated fee:', quote.fee, 'satoshis')
```
{% endcode %}

## Send with Custom Fee Rate

You can override automatic fee estimation by providing a `feeRate` in sat/vB to [`account.sendTransaction()`](../api-reference.md#sendtransaction-options):

{% code title="Custom Fee Rate" lineNumbers="true" %}
```javascript
const result = await account.sendTransaction({
  to: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  value: 100000n,
  feeRate: 10n // sat/vB
})
```
{% endcode %}

{% hint style="info" %}
When `feeRate` is provided, the `confirmationTarget` parameter is ignored.
{% endhint %}

## Send with Confirmation Target

You can target a specific number of blocks for confirmation using the `confirmationTarget` parameter in [`account.sendTransaction()`](../api-reference.md#sendtransaction-options):

{% code title="Confirmation Target" lineNumbers="true" %}
```javascript
const result = await account.sendTransaction({
  to: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  value: 100000n,
  confirmationTarget: 6 // target 6 blocks (~1 hour)
})
```
{% endcode %}

## Next Steps

Learn how to [view transaction history](./get-transaction-history.md).
