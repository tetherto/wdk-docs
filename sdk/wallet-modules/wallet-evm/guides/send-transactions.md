---
title: Send Transactions
description: Send native tokens on EVM chains with EIP-1559 or legacy gas settings.
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

This guide explains how to send native tokens (ETH, MATIC, BNB, etc.) on EVM chains, estimate fees, and configure gas parameters.

{% hint style="warning" %}
**BigInt Usage:** Always use `BigInt` (the `n` suffix) for monetary values to avoid precision loss with large numbers.
{% endhint %}

## Send with EIP-1559 Gas Parameters

EIP-1559 transactions provide more predictable gas fees and faster inclusion times.

{% code title="EIP-1559 Transaction" lineNumbers="true" %}
```javascript
const result = await account.sendTransaction({
  to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  value: 1000000000000000000n, // 1 ETH in wei
  maxFeePerGas: 30000000000,
  maxPriorityFeePerGas: 2000000000
})
console.log('Transaction hash:', result.hash)
console.log('Transaction fee:', result.fee, 'wei')
```
{% endcode %}

## Send with Legacy Gas Parameters

For chains or scenarios that do not support EIP-1559, use legacy gas settings.

{% code title="Legacy Transaction" lineNumbers="true" %}
```javascript
const legacyResult = await account.sendTransaction({
  to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  value: 1000000000000000000n,
  gasPrice: 20000000000n,
  gasLimit: 21000
})
console.log('Transaction hash:', legacyResult.hash)
```
{% endcode %}

## Estimate Transaction Fees

Use `quoteSendTransaction()` to get a fee estimate before sending.

{% code title="Quote Transaction Fee" lineNumbers="true" %}
```javascript
const quote = await account.quoteSendTransaction({
  to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  value: 1000000000000000000n
})
console.log('Estimated fee:', quote.fee, 'wei')
```
{% endcode %}

## Use Dynamic Fee Rates

Retrieve current fee rates from the wallet manager and apply them to your transaction.

{% code title="Dynamic Fee Rates" lineNumbers="true" %}
```javascript
const feeRates = await wallet.getFeeRates()
console.log('Normal fee rate:', feeRates.normal, 'wei')
console.log('Fast fee rate:', feeRates.fast, 'wei')

const result = await account.sendTransaction({
  to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  value: 1000000000000000000n,
  data: '0x',
  gasLimit: 21000,
  maxFeePerGas: feeRates.fast,
  maxPriorityFeePerGas: 2000000000n
})
console.log('Transaction sent:', result.hash)
console.log('Fee paid:', result.fee, 'wei')
```
{% endcode %}

{% hint style="info" %}
**Gas Estimation:** The `maxFeePerGas` and `maxPriorityFeePerGas` fields enable EIP-1559 transactions, ensuring more predictable gas fees and faster inclusion times.
{% endhint %}

## Next Steps

To transfer ERC-20 tokens instead of native tokens, see [Transfer ERC-20 Tokens](./transfer-tokens.md).
