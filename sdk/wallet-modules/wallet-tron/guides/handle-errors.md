---
title: Handle Errors
description: Handle errors, manage fees, and dispose of sensitive data in Tron wallets.
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
    to: 'TLyqzVGLV1srkB7dToTAEqgDSfPtXRJZYH',
    value: 1000000 // 1 TRX in sun
  })
  console.log('Transaction hash:', result.hash)
  console.log('Fee paid:', result.fee, 'sun')
} catch (error) {
  if (error.message.toLowerCase().includes('insufficient')) {
    console.error('Not enough TRX to complete transaction')
  } else if (error.message.toLowerCase().includes('max fee')) {
    console.error('The transfer fee exceeds your configured maximum')
  } else {
    console.error('Transaction failed:', error.message)
  }
}
```
{% endcode %}

## Handle Token Transfer Errors

TRC20 transfers can fail for additional reasons such as insufficient token balances. Use [`account.transfer()`](../api-reference.md#transfer-options) with error handling:

{% code title="Token Transfer Error Handling" lineNumbers="true" %}
```javascript
try {
  const result = await account.transfer({
    token: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', // USDT
    recipient: 'TLyqzVGLV1srkB7dToTAEqgDSfPtXRJZYH',
    amount: 1000000
  })
  console.log('Transfer successful:', result.hash)
  console.log('Fee paid (sun):', result.fee)
} catch (error) {
  console.error('Transfer failed:', error.message)
  if (error.message.toLowerCase().includes('insufficient')) {
    console.log('Please add more TRC20 tokens to your wallet')
  } else if (error.message.toLowerCase().includes('max fee')) {
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
console.log('Normal fee rate:', feeRates.normal, 'sun')
console.log('Fast fee rate:', feeRates.fast, 'sun')
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
