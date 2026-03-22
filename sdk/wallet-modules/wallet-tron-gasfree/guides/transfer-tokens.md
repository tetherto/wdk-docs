---
title: Transfer TRC20 Tokens
description: Transfer TRC20 tokens gas-free and estimate transfer fees.
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

# Transfer TRC20 Tokens

This guide explains how to [transfer TRC20 tokens gas-free](#transfer-tokens-gas-free), [override the fee limit](#override-fee-limit), [estimate transfer fees](#estimate-transfer-fees), and [validate inputs before executing](#transfer-with-validation).

## Transfer Tokens (Gas-Free)

You can send TRC20 tokens gas-free using [`account.transfer()`](../api-reference.md#transfer-options-config). The gas-free service handles the fee payment:

{% code title="Gas-Free TRC20 Transfer" lineNumbers="true" %}
```javascript
const transferResult = await account.transfer({
  token: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', // USDT
  recipient: 'TLyqzVGLV1srkB7dToTAEqgDSfPtXRJZYH',
  amount: 1000000 // Amount in TRC20's base units
})
console.log('Transfer hash:', transferResult.hash)
console.log('Transfer fee:', transferResult.fee, 'token units')
```
{% endcode %}

## Override Fee Limit

You can set a maximum fee for a specific transfer by passing a second configuration object specifying a `transferMaxFee` to [`account.transfer()`](../api-reference.md#transfer-options-config):

{% code title="Transfer with Fee Limit" lineNumbers="true" %}
```javascript
const result = await account.transfer({
  token: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', // USDT
  recipient: 'TLyqzVGLV1srkB7dToTAEqgDSfPtXRJZYH',
  amount: 1000000
}, {
  transferMaxFee: 1000 // Maximum fee allowed in token units
})
console.log('Transfer hash:', result.hash)
console.log('Transfer fee:', result.fee, 'token units')
```
{% endcode %}

## Estimate Transfer Fees

You can get a fee estimate before executing the transfer using [`account.quoteTransfer()`](../api-reference.md#quotetransfer-options):

{% code title="Quote Gas-Free Transfer" lineNumbers="true" %}
```javascript
const transferQuote = await account.quoteTransfer({
  token: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', // USDT
  recipient: 'TLyqzVGLV1srkB7dToTAEqgDSfPtXRJZYH',
  amount: 1000000
})
console.log('Transfer fee estimate:', transferQuote.fee, 'token units')
```
{% endcode %}

## Transfer with Validation

Validate addresses and check balances before transferring:

1. Use [`account.getTokenBalance()`](../api-reference.md#gettokenbalance-tokenaddress) to verify sufficient funds.
2. Use [`account.quoteTransfer()`](../api-reference.md#quotetransfer-options) to confirm fees.
3. Execute the transfer with [`account.transfer()`](../api-reference.md#transfer-options-config):

{% code title="Validated Gas-Free Transfer" lineNumbers="true" %}
```javascript
async function transferWithValidation(account, tokenAddress, recipient, amount) {
  if (!tokenAddress.startsWith('T') || tokenAddress.length !== 34) {
    throw new Error('Invalid TRC20 contract address')
  }

  if (!recipient.startsWith('T') || recipient.length !== 34) {
    throw new Error('Invalid recipient address')
  }

  const balance = await account.getTokenBalance(tokenAddress)
  if (balance < amount) {
    throw new Error('Insufficient TRC20 token balance')
  }

  const quote = await account.quoteTransfer({
    token: tokenAddress,
    recipient,
    amount
  })
  console.log('Transfer fee estimate:', quote.fee, 'token units')

  const result = await account.transfer({
    token: tokenAddress,
    recipient,
    amount
  })
  console.log('Transfer completed:', result.hash)
  console.log('Fee paid:', result.fee, 'token units')

  return result
}
```
{% endcode %}

## Next Steps

Learn how to [sign and verify messages](./sign-verify-messages.md) with your gas-free Tron account.
