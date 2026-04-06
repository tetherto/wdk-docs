---
title: Transfer Tokens
description: Transfer ERC-20 tokens with gasless transactions.
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

# Transfer Tokens

This guide explains how to [transfer ERC-20 tokens](#transfer-erc-20-tokens), [estimate transfer fees](#estimate-transfer-fees), and [set a maximum fee limit](#transfer-with-maximum-fee-limit).

## Transfer ERC-20 Tokens

You can transfer ERC-20 tokens using gasless transactions with [`account.transfer()`](../api-reference.md#transfer-options-config):

{% code title="Transfer ERC-20 Tokens" lineNumbers="true" %}
```javascript
const result = await account.transfer({
  token: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
  recipient: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  amount: 1000000 // 1 USDT (6 decimals)
})
console.log('Transfer hash:', result.hash)
console.log('Transfer fee:', result.fee)
```
{% endcode %}

## Estimate Transfer Fees

You can estimate the fee for a token transfer without executing it using [`account.quoteTransfer()`](../api-reference.md#quotetransfer-options-config):

{% code title="Estimate Transfer Fee" lineNumbers="true" %}
```javascript
const quote = await account.quoteTransfer({
  token: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  recipient: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  amount: 1000000
})
console.log('Estimated transfer fee:', quote.fee)
```
{% endcode %}

## Transfer with Maximum Fee Limit

You can set a maximum fee for a specific transfer by passing a `transferMaxFee` in the config object to [`account.transfer()`](../api-reference.md#transfer-options-config):

{% code title="Transfer with Fee Limit" lineNumbers="true" %}
```javascript
const result = await account.transfer({
  token: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  recipient: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  amount: 1000000
}, {
  transferMaxFee: 100000
})
```
{% endcode %}

{% hint style="warning" %}
If the estimated fee exceeds `transferMaxFee`, the transfer is cancelled with an "Exceeded maximum fee" error.
{% endhint %}

## Next Steps

Learn how to [sign and verify messages](./sign-verify-messages.md).
