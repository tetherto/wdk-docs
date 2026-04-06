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

This guide explains how to [handle transaction errors](#transaction-errors), [handle transfer errors](#transfer-errors), and follow [best practices](#best-practices) for fee management and memory cleanup.

## Transaction Errors

Transactions sent via [`account.sendTransaction()`](../api-reference.md#sendtransaction-tx-config) can fail when the paymaster token balance is insufficient. Wrap calls in a `try/catch` block:

{% code title="Handle Transaction Errors" lineNumbers="true" %}
```javascript
try {
  const result = await account.sendTransaction({
    to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    value: 1000000000000000n
  })
  console.log('Transaction hash:', result.hash)
} catch (error) {
  if (error.message.includes('not enough funds')) {
    console.error('Insufficient paymaster token balance')
  } else {
    console.error('Transaction failed:', error.message)
  }
}
```
{% endcode %}

## Transfer Errors

Token transfers via [`account.transfer()`](../api-reference.md#transfer-options-config) can fail due to insufficient balance or exceeding the maximum fee limit:

{% code title="Handle Transfer Errors" lineNumbers="true" %}
```javascript
try {
  const result = await account.transfer({
    token: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    recipient: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    amount: 1000000
  })
  console.log('Transfer hash:', result.hash)
} catch (error) {
  if (error.message.includes('Exceeded maximum fee')) {
    console.error('Transfer cancelled: fee exceeds the configured limit')
  } else if (error.message.includes('not enough funds')) {
    console.error('Insufficient paymaster token balance')
  } else {
    console.error('Transfer failed:', error.message)
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
console.log('Normal fee rate:', feeRates.normal)
console.log('Fast fee rate:', feeRates.fast)
```
{% endcode %}

### Dispose of Sensitive Data

For security, clear sensitive data from memory when a session is complete. Use [`account.dispose()`](../api-reference.md#dispose-1) and [`wallet.dispose()`](../api-reference.md#dispose) to securely wipe private keys:

{% code title="Dispose Resources" lineNumbers="true" %}
```javascript
try {
  const result = await account.sendTransaction({
    to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    value: 1000000000000000n
  })
  console.log('Transaction hash:', result.hash)
} finally {
  account.dispose()
  wallet.dispose()
}
```
{% endcode %}

{% hint style="warning" %}
Always call [`dispose()`](../api-reference.md#dispose) when finished with accounts. Private keys are securely wiped from memory. Disposal is irreversible.
{% endhint %}
