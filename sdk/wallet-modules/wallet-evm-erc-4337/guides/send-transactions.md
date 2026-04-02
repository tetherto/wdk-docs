---
title: Send Transactions
description: Send gasless transactions and estimate fees.
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

This guide explains how to [send a gasless transaction](#send-a-gasless-transaction), [estimate fees](#estimate-fees), and [use a custom paymaster token](#send-with-custom-paymaster-token).

## Send a Gasless Transaction

You can send a transaction with gas fees paid in the paymaster token using [`account.sendTransaction()`](../api-reference.md#sendtransaction-tx-config):

{% code title="Send Gasless Transaction" lineNumbers="true" %}
```javascript
const result = await account.sendTransaction({
  to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  value: 1000000000000000n // 0.001 ETH in wei
})
console.log('Transaction hash:', result.hash)
console.log('Fee paid in paymaster token:', result.fee)
```
{% endcode %}

{% hint style="info" %}
ERC-4337 transactions are gasless for the end user. Gas fees are paid through the configured paymaster using the specified paymaster token (e.g., USD₮).
{% endhint %}

## Estimate Fees

You can estimate the fee for a transaction without broadcasting it using [`account.quoteSendTransaction()`](../api-reference.md#quotesendtransaction-tx-config):

{% code title="Estimate Fee" lineNumbers="true" %}
```javascript
const quote = await account.quoteSendTransaction({
  to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  value: 1000000000000000n
})
console.log('Estimated fee:', quote.fee)
```
{% endcode %}

## Send with Custom Paymaster Token

You can override the default paymaster token for a specific transaction by passing a config object to [`account.sendTransaction()`](../api-reference.md#sendtransaction-tx-config):

{% code title="Custom Paymaster Token" lineNumbers="true" %}
```javascript
const result = await account.sendTransaction({
  to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  value: 1000000000000000n
}, {
  paymasterToken: {
    address: '0x68749665FF8D2d112Fa859AA293F07A622782F38' // XAUT
  }
})
```
{% endcode %}

## Next Steps

Learn how to [transfer ERC-20 tokens](./transfer-tokens.md).
