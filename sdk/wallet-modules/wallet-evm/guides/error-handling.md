---
title: Error Handling
description: Handle errors, manage fees, and dispose of sensitive data in EVM wallets.
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

# Error Handling

This guide covers best practices for handling transaction errors, managing fee limits, and cleaning up sensitive data from memory.

## Handle Transaction Errors

Wrap transactions in `try/catch` blocks to handle common failure scenarios such as insufficient funds or exceeded fee limits.

{% code title="Transaction Error Handling" lineNumbers="true" %}
```javascript
try {
  const result = await account.sendTransaction({
    to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    value: 1000000000000000000n
  })
  console.log('Transaction successful:', result.hash)
} catch (error) {
  console.error('Transaction failed:', error.message)
  if (error.message.includes('insufficient funds')) {
    console.log('Please add more funds to your wallet')
  }
  if (error.message.includes('Exceeded maximum fee')) {
    console.log('Transfer fee too high')
  }
}
```
{% endcode %}

## Handle Token Transfer Errors

Token transfers can fail for additional reasons such as invalid addresses or insufficient token balances.

{% code title="Token Transfer Error Handling" lineNumbers="true" %}
```javascript
try {
  const result = await account.transfer({
    token: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
    recipient: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    amount: 1000000000000000000n
  })
  console.log('Transfer completed:', result.hash)
} catch (error) {
  console.error('Transfer failed:', error.message)
  if (error.message.includes('Exceeded maximum fee')) {
    console.log('Transfer fee too high')
  }
}
```
{% endcode %}

## Manage Fee Limits

Set `transferMaxFee` when creating the wallet to prevent transactions from exceeding a maximum gas cost. Retrieve current network rates with [`getFeeRates()`](/sdk/wallet-modules/wallet-evm/api-reference#getfeerates) to make informed decisions.

{% code title="Fee Management" lineNumbers="true" %}
```javascript
const feeRates = await wallet.getFeeRates()
console.log('Normal fee rate:', feeRates.normal, 'wei')
console.log('Fast fee rate:', feeRates.fast, 'wei')
```
{% endcode %}

## Dispose of Sensitive Data

Call [`dispose()`](/sdk/wallet-modules/wallet-evm/api-reference#dispose-1) on accounts and wallet managers to clear private keys and sensitive data from memory when they are no longer needed.

{% code title="Memory Cleanup" lineNumbers="true" %}
```javascript
account.dispose()

wallet.dispose()
```
{% endcode %}

{% hint style="warning" %}
Always call [`dispose()`](/sdk/wallet-modules/wallet-evm/api-reference#dispose-1) in a `finally` block or cleanup handler to ensure sensitive data is cleared even if an error occurs.
{% endhint %}
