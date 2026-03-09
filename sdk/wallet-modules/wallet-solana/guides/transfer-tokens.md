---
title: Transfer SPL Tokens
description: Transfer SPL tokens and estimate transfer fees on Solana.
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

# Transfer SPL Tokens

This guide explains how to transfer SPL tokens (such as USD₮), estimate fees, and validate inputs before executing.

## Transfer Tokens

Use `account.transfer()` to send SPL tokens to a recipient address. If the recipient does not have a token account, one is created automatically.

{% code title="Transfer SPL Tokens" lineNumbers="true" %}
```javascript
const transferResult = await account.transfer({
  token: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT mint address
  recipient: 'publicKey', // Recipient's base58-encoded public key
  amount: 1000000n // Amount in token's base units (6 decimals for USDT)
}, {
  commitment: 'confirmed' // Optional: commitment level
})
console.log('Transfer hash:', transferResult.hash)
console.log('Transfer fee:', transferResult.fee, 'lamports')
```
{% endcode %}

## Estimate Transfer Fees

Use `account.quoteTransfer()` to get a fee estimate before executing the transfer.

{% code title="Quote Token Transfer" lineNumbers="true" %}
```javascript
const transferQuote = await account.quoteTransfer({
  token: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  recipient: 'publicKey',
  amount: 1000000n
})
console.log('Transfer fee estimate:', transferQuote.fee, 'lamports')
```
{% endcode %}

## Transfer with Validation

Validate addresses and check balances before transferring to catch errors early.

{% code title="Validated SPL Token Transfer" lineNumbers="true" %}
```javascript
async function transferSPLWithValidation(account, splTokenMint, recipient, amount) {
  if (typeof splTokenMint !== 'string' || splTokenMint.length < 32) {
    throw new Error('Invalid SPL token mint address')
  }

  if (typeof recipient !== 'string' || recipient.length < 32) {
    throw new Error('Invalid recipient address')
  }

  const balance = await account.getTokenBalance(splTokenMint)
  if (balance < amount) {
    throw new Error('Insufficient SPL token balance')
  }

  const quote = await account.quoteTransfer({
    token: splTokenMint,
    recipient,
    amount
  })
  console.log('Transfer fee estimate:', quote.fee, 'lamports')

  const result = await account.transfer({
    token: splTokenMint,
    recipient,
    amount
  })
  console.log('Transfer hash:', result.hash)
  console.log('Actual fee:', result.fee, 'lamports')

  return result
}
```
{% endcode %}

## Next Steps

Learn how to [sign and verify messages](./sign-verify-messages.md) with your Solana account.
