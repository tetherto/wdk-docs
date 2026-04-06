---
title: Handle Errors
description: Handle errors, manage fees, and dispose of sensitive data.
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

This guide explains how to [handle transaction errors](#transaction-errors), [handle connection errors](#connection-errors), and follow [best practices](#best-practices) for fee management and memory cleanup.

## Transaction Errors

Transactions sent via [`account.sendTransaction()`](../api-reference.md#sendtransaction-options) can fail for several reasons. Wrap transaction calls in a `try/catch` block to handle specific error types:

{% code title="Handle Transaction Errors" lineNumbers="true" %}
```javascript
try {
  const result = await account.sendTransaction({
    to: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    value: 100000n
  })
  console.log('Transaction hash:', result.hash)
} catch (error) {
  if (error.message.includes('Insufficient balance')) {
    console.error('Not enough funds in wallet')
  } else if (error.message.includes('dust limit')) {
    console.error('Amount is below the minimum dust limit')
  } else if (error.message.includes('Invalid address')) {
    console.error('Recipient address is invalid')
  } else {
    console.error('Transaction failed:', error.message)
  }
}
```
{% endcode %}

## Connection Errors

Network issues with the Electrum server can cause failures across all operations. Handle connection errors at a higher level:

{% code title="Handle Connection Errors" lineNumbers="true" %}
```javascript
try {
  const balance = await account.getBalance()
  console.log('Balance:', balance, 'satoshis')
} catch (error) {
  if (error.message.includes('ECONNREFUSED') || error.message.includes('timeout')) {
    console.error('Network error: check Electrum server connection')
  } else if (error.message.includes('Invalid seed')) {
    console.error('Invalid seed phrase provided')
  } else {
    console.error('Operation failed:', error.message)
  }
}
```
{% endcode %}

## Best Practices

### Fee Management

You can retrieve current network fee rates using [`wallet.getFeeRates()`](../api-reference.md#getfeerates):

{% code title="Get Fee Rates" lineNumbers="true" %}
```javascript
const feeRates = await wallet.getFeeRates()
console.log('Normal fee rate:', feeRates.normal, 'sat/vB')
console.log('Fast fee rate:', feeRates.fast, 'sat/vB')
```
{% endcode %}

{% hint style="info" %}
[`wallet.getFeeRates()`](../api-reference.md#getfeerates) fetches rates from the mempool.space API, while [`account.sendTransaction()`](../api-reference.md#sendtransaction-options) estimates fees from the connected Electrum server. Use [`getFeeRates()`](../api-reference.md#getfeerates) for display purposes.
{% endhint %}

### Dispose of Sensitive Data

For security, clear sensitive data from memory when a session is complete. Use [`account.dispose()`](../api-reference.md#dispose-1) and [`wallet.dispose()`](../api-reference.md#dispose) to securely wipe private keys:

{% code title="Dispose Resources" lineNumbers="true" %}
```javascript
try {
  const result = await account.sendTransaction({
    to: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    value: 100000n
  })
  console.log('Transaction hash:', result.hash)
} finally {
  account.dispose()
  wallet.dispose()
}
```
{% endcode %}

{% hint style="warning" %}
Always call [`dispose()`](../api-reference.md#dispose) when finished with accounts. Private keys are securely wiped from memory using `sodium_memzero`. Electrum connections are automatically closed. Disposal is irreversible.
{% endhint %}
