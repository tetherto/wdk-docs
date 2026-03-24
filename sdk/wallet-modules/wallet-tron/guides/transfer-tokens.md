---
title: Transfer TRC20 Tokens
description: Transfer TRC20 tokens and estimate transfer fees on Tron.
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

This guide explains how to [transfer TRC20 tokens](#transfer-tokens), [estimate transfer fees](#estimate-transfer-fees), and [validate inputs before executing](#transfer-with-validation).

## Transfer Tokens

You can send TRC20 tokens to a recipient address using [`account.transfer()`](../api-reference.md#transfer-options):

{% code title="Transfer TRC20 Tokens" lineNumbers="true" %}
```javascript
const transferResult = await account.transfer({
  token: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', // USDT
  recipient: 'TLyqzVGLV1srkB7dToTAEqgDSfPtXRJZYH',
  amount: 1000000 // Amount in TRC20's base units
})
console.log('Transfer hash:', transferResult.hash)
console.log('Transfer fee:', transferResult.fee, 'sun')
```
{% endcode %}

## Estimate Transfer Fees

You can get a fee estimate before executing the transfer using [`account.quoteTransfer()`](../api-reference.md#quotetransfer-options):

{% code title="Quote Token Transfer" lineNumbers="true" %}
```javascript
const transferQuote = await account.quoteTransfer({
  token: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', // USDT
  recipient: 'TLyqzVGLV1srkB7dToTAEqgDSfPtXRJZYH',
  amount: 1000000
})
console.log('Transfer fee estimate:', transferQuote.fee, 'sun')
```
{% endcode %}

## Transfer with Validation

Validate addresses and check balances before transferring to catch errors early:

1. Use [`account.getTokenBalance()`](../api-reference.md#gettokenbalance-tokenaddress) to verify sufficient funds.
2. Use [`account.quoteTransfer()`](../api-reference.md#quotetransfer-options) to confirm fees.
3. Execute the transfer with [`account.transfer()`](../api-reference.md#transfer-options):

{% code title="Validated TRC20 Transfer" lineNumbers="true" %}
```javascript
async function transferTRC20WithValidation(account, trc20Address, recipient, amount) {
  if (!trc20Address.startsWith('T') || trc20Address.length !== 34) {
    throw new Error('Invalid TRC20 contract address')
  }

  if (!recipient.startsWith('T') || recipient.length !== 34) {
    throw new Error('Invalid recipient address')
  }

  const balance = await account.getTokenBalance(trc20Address)
  if (balance < amount) {
    throw new Error('Insufficient TRC20 token balance')
  }

  const quote = await account.quoteTransfer({
    token: trc20Address,
    recipient,
    amount
  })
  console.log('Transfer fee estimate (sun):', quote.fee)

  const result = await account.transfer({
    token: trc20Address,
    recipient,
    amount
  })
  console.log('Transfer completed:', result.hash)
  console.log('Fee paid (sun):', result.fee)

  return result
}
```
{% endcode %}

## Next Steps

Learn how to [sign and verify messages](./sign-verify-messages.md) with your Tron account.
