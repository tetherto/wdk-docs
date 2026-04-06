---
title: Handle Errors
description: Handle errors, manage fees, and dispose of sensitive data in TON wallets.
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

This guide covers how to [handle transaction errors](#handle-transaction-errors) and [handle token transfer errors](#handle-token-transfer-errors), plus [best practices](#best-practices) for fee management and memory cleanup.

## Handle Transaction Errors

Wrap transactions in `try/catch` blocks to handle common failure scenarios. Use [`account.sendTransaction()`](../api-reference.md#sendtransaction-tx) with proper error handling:

{% code title="Transaction Error Handling" lineNumbers="true" %}
```javascript
try {
  const result = await account.sendTransaction({
    to: 'EQ...',
    value: 1000000000,
    bounceable: true
  })
  console.log('Transaction hash:', result.hash)
  console.log('Fee paid:', result.fee, 'nanotons')
} catch (error) {
  if (error.message.includes('insufficient balance')) {
    console.error('Not enough TON to complete transaction')
  } else if (error.message.includes('invalid address')) {
    console.error('Invalid recipient address')
  } else if (error.message.includes('timeout')) {
    console.error('Network timeout, please try again')
  } else {
    console.error('Transaction failed:', error.message)
  }
}
```
{% endcode %}

## Handle Token Transfer Errors

Jetton transfers can fail for multiple reasons, such as insufficient token balances. Use [`account.transfer()`](../api-reference.md#transfer-options) with error handling:

{% code title="Token Transfer Error Handling" lineNumbers="true" %}
```javascript
try {
  const result = await account.transfer({
    token: 'EQ...',
    recipient: 'EQ...',
    amount: 1000000
  })
  console.log('Transfer submitted:', result.hash)
} catch (error) {
  console.error('Transfer failed:', error.message)
  if (error.message.toLowerCase().includes('insufficient')) {
    console.log('Please add more tokens to your wallet')
  } else if (error.message.toLowerCase().includes('fee')) {
    console.log('The transfer fee exceeds your configured maximum')
  }
}
```
{% endcode %}

## Best Practices

### Manage Fee Limits

Set `transferMaxFee` when creating the wallet to prevent transactions from exceeding a maximum cost. You can retrieve current network rates using [`wallet.getFeeRates()`](../api-reference.md#getfeerates):

{% code title="Fee Management" lineNumbers="true" %}
```javascript
const feeRates = await wallet.getFeeRates()
console.log('Normal fee rate:', feeRates.normal, 'nanotons')
console.log('Fast fee rate:', feeRates.fast, 'nanotons')
```
{% endcode %}

### Dispose of Sensitive Data

Call [`dispose()`](../api-reference.md#dispose) on accounts and wallet managers to clear private keys and sensitive data from memory when they are no longer needed:

{% code title="Memory Cleanup" lineNumbers="true" %}
```javascript
account.dispose()

wallet.dispose()
```
{% endcode %}

{% hint style="warning" %}
Always call [`dispose()`](../api-reference.md#dispose) in a `finally` block or cleanup handler to ensure sensitive data is cleared even if an error occurs.
{% endhint %}
