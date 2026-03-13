---
title: Transfer ERC-20 Tokens
description: Transfer ERC-20 tokens and estimate transfer fees on EVM chains.
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

# Transfer ERC-20 Tokens

This guide explains how to transfer ERC-20 tokens (such as USD₮ or XAU₮), estimate fees, and validate inputs before executing.

## Transfer Tokens

Use `account.transfer()` to send ERC-20 tokens to a recipient address.

{% code title="Transfer ERC-20 Tokens" lineNumbers="true" %}
```javascript
const transferResult = await account.transfer({
  token: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
  recipient: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  amount: 1000000000000000000n // 1 token in base units
})
console.log('Transfer hash:', transferResult.hash)
console.log('Transfer fee:', transferResult.fee, 'wei')
```
{% endcode %}

## Estimate Transfer Fees

Use `account.quoteTransfer()` to get a fee estimate before executing the transfer.

{% code title="Quote Token Transfer" lineNumbers="true" %}
```javascript
const transferQuote = await account.quoteTransfer({
  token: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
  recipient: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  amount: 1000000000000000000n
})
console.log('Transfer fee estimate:', transferQuote.fee, 'wei')
```
{% endcode %}

## Transfer with Validation

Validate addresses and check balances before transferring to catch errors early.

{% code title="Validated Token Transfer" lineNumbers="true" %}
```javascript
async function transferTokenWithValidation(account, tokenAddress, recipient, amount) {
  if (!tokenAddress.startsWith('0x') || tokenAddress.length !== 42) {
    throw new Error('Invalid token address')
  }

  if (!recipient.startsWith('0x') || recipient.length !== 42) {
    throw new Error('Invalid recipient address')
  }

  const balance = await account.getTokenBalance(tokenAddress)
  if (balance < amount) {
    throw new Error('Insufficient token balance')
  }

  const nativeBalance = await account.getBalance()
  if (nativeBalance === 0n) {
    throw new Error('Need ETH for gas fees')
  }

  const quote = await account.quoteTransfer({
    token: tokenAddress,
    recipient,
    amount
  })
  console.log('Transfer fee estimate:', quote.fee, 'wei')

  const result = await account.transfer({
    token: tokenAddress,
    recipient,
    amount
  })
  console.log('Transfer completed:', result.hash)
  console.log('Fee paid:', result.fee, 'wei')

  return result
}
```
{% endcode %}

## Next Steps

Learn how to [sign and verify messages](./sign-verify-messages.md) with your EVM account.
