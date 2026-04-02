---
title: Handle Errors
description: Handle Spark transaction and connection failures, plus fees and disposal.
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

# Handle Errors

This guide explains how to [handle transaction errors](#transaction-errors), [handle connection errors](#connection-errors), and apply [best practices](#best-practices) for fees and secure cleanup.

## Transaction Errors

Operations such as [`account.sendTransaction()`](../api-reference.md#sendtransaction-to-value), [`account.transfer()`](../api-reference.md#transfer-options), [`account.payLightningInvoice()`](../api-reference.md#paylightninginvoice-options), and [`account.withdraw()`](../api-reference.md#withdraw-options) can throw. Wrap each call in `try/catch` and branch on `message` or error type when your runtime allows it:

{% code title="Handle Transaction Errors" lineNumbers="true" %}
```javascript
try {
  const result = await account.sendTransaction({
    to: 'spark1...',
    value: 1000000
  })
  console.log('Transaction hash:', result.hash)
} catch (error) {
  console.error('Send failed:', error.message)
}
```
{% endcode %}

You can isolate Lightning failures by wrapping [`account.payLightningInvoice()`](../api-reference.md#paylightninginvoice-options):

{% code title="Handle Lightning Errors" lineNumbers="true" %}
```javascript
try {
  const payment = await account.payLightningInvoice({
    encodedInvoice: 'lnbc500u1p...',
    maxFeeSats: 1000
  })
  console.log('Payment id:', payment.id)
} catch (error) {
  console.error('Lightning payment failed:', error.message)
}
```
{% endcode %}

## Connection Errors

Spark relies on network access through the Spark SDK. Failures may surface as timeouts, refused connections, or generic SDK errors. Handle them around any async wallet call:

{% code title="Handle Connection Errors" lineNumbers="true" %}
```javascript
try {
  const balance = await account.getBalance()
  console.log('Balance:', balance, 'satoshis')
} catch (error) {
  if (error.message.includes('timeout') || error.message.includes('ECONNREFUSED')) {
    console.error('Network error: check connectivity and Spark service status')
  } else {
    console.error('Operation failed:', error.message)
  }
}
```
{% endcode %}

## Best Practices

### Fee management

Native Spark sends and token transfers report zero fees, but withdrawals and Lightning payments can charge fees. Use [`wallet.getFeeRates()`](../api-reference.md#getfeerates) for wallet-level rate placeholders and [`account.quotePayLightningInvoice()`](../api-reference.md#quotepaylightninginvoice-options) for Lightning sends:

{% code title="Inspect Spark Fee Rates" lineNumbers="true" %}
```javascript
const feeRates = await wallet.getFeeRates()
console.log('Normal fee rate:', feeRates.normal)
console.log('Fast fee rate:', feeRates.fast)
```
{% endcode %}

{% code title="Quote Lightning Fee Before Paying" lineNumbers="true" %}
```javascript
const lightningFee = await account.quotePayLightningInvoice({
  encodedInvoice: 'lnbc500u1p...'
})
console.log('Estimated Lightning fee:', Number(lightningFee), 'satoshis')
```
{% endcode %}

{% hint style="info" %}
[`quoteWithdraw()`](../api-reference.md#quotewithdraw-options) should run before [`withdraw()`](../api-reference.md#withdraw-options) so you understand cooperative exit costs.
{% endhint %}

### Dispose of sensitive data

Clear keys from memory when a session ends. Call [`account.dispose()`](../api-reference.md#dispose-1) for each account and [`wallet.dispose()`](../api-reference.md#dispose) on the manager:

{% code title="Dispose Wallet Resources" lineNumbers="true" %}
```javascript
try {
  const result = await account.sendTransaction({
    to: 'spark1...',
    value: 1000000
  })
  console.log('Transaction hash:', result.hash)
} finally {
  account.dispose()
  wallet.dispose()
}
```
{% endcode %}

{% hint style="warning" %}
After [`dispose()`](../api-reference.md#dispose-1), the account cannot sign new operations. Call disposal when the wallet UI or job is finished.
{% endhint %}

## Next Steps

Return to the [Spark wallet usage overview](../usage.md) or open the [API Reference](../api-reference.md) for full method signatures.
