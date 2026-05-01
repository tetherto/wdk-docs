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

This guide explains how to [send EVM transactions with EIP-1559 gas parameters](#send-with-eip-1559-gas-parameters), [send legacy gas transactions](#send-with-legacy-gas-parameters), [sign without broadcasting](#sign-without-broadcasting), [estimate fees](#estimate-transaction-fees), and [use dynamic fee rates](#use-dynamic-fee-rates).

{% hint style="warning" %}
**BigInt Usage:** Always use `BigInt` (the `n` suffix) for monetary values to avoid precision loss with large numbers.
{% endhint %}

## Send with EIP-1559 Gas Parameters

You can use [`account.sendTransaction()`](/sdk/wallet-modules/wallet-evm/api-reference#sendtransaction-tx) to send an EIP-1559 transaction. EIP-1559 transactions provide more predictable gas fees and faster inclusion times.

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

You can also use [`account.sendTransaction()`](/sdk/wallet-modules/wallet-evm/api-reference#sendtransaction-tx) with legacy gas settings for chains that do not support EIP-1559.

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

## Sign Without Broadcasting

Use [`account.signTransaction()`](/sdk/wallet-modules/wallet-evm/api-reference#signtransaction-tx) when you need a signed raw transaction but want to submit it through a separate relay, service, or review flow.

{% code title="Sign EVM Transaction" lineNumbers="true" %}
```javascript
const signedTransaction = await account.signTransaction({
  to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  value: 1000000000000000000n,
  chainId: 1,
  maxFeePerGas: 30000000000n,
  maxPriorityFeePerGas: 2000000000n
})

console.log('Signed transaction:', signedTransaction)
```
{% endcode %}

{% hint style="info" %}
`signTransaction()` returns the signed transaction payload and does not broadcast it. Use `sendTransaction()` when WDK should sign, broadcast, and return the transaction hash.
{% endhint %}

## Estimate Transaction Fees

Use [`account.quoteSendTransaction()`](/sdk/wallet-modules/wallet-evm/api-reference#quotesendtransaction-tx) to get a fee estimate before sending.

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

Retrieve current fee rates using [`wallet.getFeeRates()`](/sdk/wallet-modules/wallet-evm/api-reference#getfeerates) and apply them to your transaction.

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
