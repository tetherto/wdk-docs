---
title: Handle Errors
description: Handle errors, manage fees, and dispose of sensitive data in gas-free Tron wallets.
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

This guide covers best practices for handling transaction errors, managing fee limits, and cleaning up sensitive data from memory in gas-free Tron wallets.

## Handle Gas-Free Transfer Errors

Gas-free transfers can fail for reasons including exceeded fee limits or insufficient token balances. Wrap calls to [`account.transfer()`](../api-reference.md#transfer-options-config) in `try/catch` blocks:

{% code title="Gas-Free Transfer Error Handling" lineNumbers="true" %}
```javascript
try {
  const result = await account.transfer({
    token: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', // USDT
    recipient: 'TLyqzVGLV1srkB7dToTAEqgDSfPtXRJZYH',
    amount: 1000000
  })
  console.log('Transfer successful:', result.hash)
  console.log('Fee paid:', result.fee, 'token units')
} catch (error) {
  console.error('Transfer failed:', error.message)
  if (error.message.includes('exceeds the transfer max fee')) {
    console.log('Transfer cancelled: fee too high')
  } else if (error.message.toLowerCase().includes('insufficient')) {
    console.log('Please add more TRC20 tokens to your wallet')
  }
}
```
{% endcode %}

## Handle Native TRX Transaction Errors

Native TRX sends via [`account.sendTransaction()`](../api-reference.md#sendtransaction-tx) can fail for standard reasons:

{% code title="Transaction Error Handling" lineNumbers="true" %}
```javascript
try {
  const result = await account.sendTransaction({
    to: 'TLyqzVGLV1srkB7dToTAEqgDSfPtXRJZYH',
    value: 1000000
  })
  console.log('Transaction hash:', result.hash)
} catch (error) {
  if (error.message.toLowerCase().includes('insufficient')) {
    console.error('Not enough TRX to complete transaction')
  } else {
    console.error('Transaction failed:', error.message)
  }
}
```
{% endcode %}

## Manage Fee Limits

Set `transferMaxFee` when creating the wallet or per-transfer to prevent gas-free transfers from exceeding a maximum cost. You can retrieve current network rates using [`wallet.getFeeRates()`](../api-reference.md#getfeerates):

{% code title="Fee Management" lineNumbers="true" %}
```javascript
const feeRates = await wallet.getFeeRates()
console.log('Normal fee rate:', feeRates.normal, 'sun')
console.log('Fast fee rate:', feeRates.fast, 'sun')
```
{% endcode %}

## Dispose of Sensitive Data

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
