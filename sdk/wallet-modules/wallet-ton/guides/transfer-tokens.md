---
title: Transfer Jetton Tokens
description: Transfer Jetton tokens and estimate transfer fees on TON.
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

# Transfer Jetton Tokens

This guide explains how to [transfer Jetton tokens](#transfer-tokens), [estimate transfer fees](#estimate-transfer-fees), and [validate inputs before executing](#transfer-with-validation).

## Transfer Tokens

You can send Jetton tokens to a recipient address using [`account.transfer()`](../api-reference.md#transfer-options):

{% code title="Transfer Jetton Tokens" lineNumbers="true" %}
```javascript
const transferResult = await account.transfer({
  token: 'EQ...',      // Jetton contract address
  recipient: 'EQ...',  // Recipient's TON address
  amount: 1000000      // Amount in Jetton's base units
})
console.log('Transfer hash:', transferResult.hash)
console.log('Transfer fee:', transferResult.fee, 'nanotons')
```
{% endcode %}

## Estimate Transfer Fees

You can get a fee estimate before executing the transfer using [`account.quoteTransfer()`](../api-reference.md#quotetransfer-options):

{% code title="Quote Token Transfer" lineNumbers="true" %}
```javascript
const transferQuote = await account.quoteTransfer({
  token: 'EQ...',      // Jetton contract address
  recipient: 'EQ...',  // Recipient's TON address
  amount: 1000000      // Amount in Jetton's base units
})
console.log('Transfer fee estimate:', transferQuote.fee, 'nanotons')
```
{% endcode %}

## Transfer with Validation

Validate addresses and check balances before transferring to catch errors early:

1. Use [`account.getTokenBalance()`](../api-reference.md#gettokenbalance-tokenaddress) to verify sufficient funds.
2. Use [`account.quoteTransfer()`](../api-reference.md#quotetransfer-options) to confirm fees.
3. Execute the transfer with [`account.transfer()`](../api-reference.md#transfer-options):

{% code title="Validated Jetton Transfer" lineNumbers="true" %}
```javascript
async function transferJettonWithValidation(account, jettonAddress, recipient, amount) {
  if (typeof jettonAddress !== 'string' || jettonAddress.length === 0) {
    throw new Error('Invalid Jetton address format')
  }

  if (typeof recipient !== 'string' || recipient.length === 0) {
    throw new Error('Invalid recipient address format')
  }

  const balance = await account.getTokenBalance(jettonAddress)
  if (balance < amount) {
    throw new Error('Insufficient Jetton balance')
  }

  const quote = await account.quoteTransfer({
    token: jettonAddress,
    recipient,
    amount
  })
  console.log('Estimated fee:', quote.fee, 'nanotons')

  const result = await account.transfer({
    token: jettonAddress,
    recipient,
    amount
  })
  console.log('Transfer hash:', result.hash)
  console.log('Actual fee:', result.fee, 'nanotons')

  return result
}
```
{% endcode %}

## Next Steps

Learn how to [sign and verify messages](./sign-verify-messages.md) with your TON account.
