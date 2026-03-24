---
title: Transfer Jetton Tokens
description: Transfer Jetton tokens gaslessly with fees paid in paymaster tokens.
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

This guide explains how to [transfer Jetton tokens gaslessly](#transfer-tokens-gasless), [override paymaster configuration](#override-paymaster-configuration), [estimate transfer fees](#estimate-transfer-fees), and [validate inputs before executing](#transfer-with-validation).

## Transfer Tokens (Gasless)

You can send Jetton tokens gaslessly using [`account.transfer()`](../api-reference.md#transfer-options-config). Fees are deducted from the configured paymaster token:

{% code title="Gasless Jetton Transfer" lineNumbers="true" %}
```javascript
const result = await account.transfer({
  token: 'EQ...',      // Jetton master contract address
  recipient: 'EQ...',  // Recipient's TON address
  amount: 1000000000   // Amount in Jetton's base units
})
console.log('Transfer hash:', result.hash)
console.log('Transfer fee:', result.fee, 'paymaster token units')
```
{% endcode %}

## Override Paymaster Configuration

You can override the default paymaster token and maximum fee on a per-transfer basis by passing a second configuration argument to [`account.transfer()`](../api-reference.md#transfer-options-config):

{% code title="Transfer with Config Override" lineNumbers="true" %}
```javascript
const result = await account.transfer({
  token: 'EQ...',
  recipient: 'EQ...',
  amount: 1000000000
}, {
  paymasterToken: {
    address: 'EQ...' // Override default paymaster token
  },
  transferMaxFee: 2000000000 // Override maximum allowed fee
})
console.log('Transfer hash:', result.hash)
console.log('Transfer fee:', result.fee, 'paymaster token units')
```
{% endcode %}

## Estimate Transfer Fees

You can get a fee estimate before executing the transfer using [`account.quoteTransfer()`](../api-reference.md#quotetransfer-options):

{% code title="Quote Gasless Transfer" lineNumbers="true" %}
```javascript
const quote = await account.quoteTransfer({
  token: 'EQ...',
  recipient: 'EQ...',
  amount: 1000000
})
console.log('Transfer fee estimate:', quote.fee, 'paymaster token units')
```
{% endcode %}

## Transfer with Validation

Validate balances before transferring:

1. Use [`account.getTokenBalance()`](../api-reference.md#gettokenbalance-tokenaddress) to check Jetton balance.
2. Use [`account.getPaymasterTokenBalance()`](../api-reference.md#getpaymastertokenbalance) to verify sufficient paymaster funds.
3. Use [`account.quoteTransfer()`](../api-reference.md#quotetransfer-options) to estimate fees.
4. Execute the transfer with [`account.transfer()`](../api-reference.md#transfer-options-config):

{% code title="Validated Gasless Transfer" lineNumbers="true" %}
```javascript
async function transferWithValidation(account, jettonAddress, recipient, amount) {
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

  const paymasterBalance = await account.getPaymasterTokenBalance()
  console.log('Paymaster token balance:', paymasterBalance)

  const quote = await account.quoteTransfer({
    token: jettonAddress,
    recipient,
    amount
  })
  console.log('Estimated fee (paymaster token):', quote.fee)

  const result = await account.transfer({
    token: jettonAddress,
    recipient,
    amount
  })
  console.log('Transfer hash:', result.hash)
  console.log('Actual fee (paymaster token):', result.fee)

  return result
}
```
{% endcode %}

## Next Steps

Learn how to [sign and verify messages](./sign-verify-messages.md) with your gasless TON account.
