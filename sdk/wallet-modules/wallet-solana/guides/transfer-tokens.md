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

Use [`account.transfer()`](/sdk/wallet-modules/wallet-solana/api-reference#transfer-options) to send SPL tokens to a recipient address. If the recipient does not have a token account, one is created automatically.

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

Use [`account.quoteTransfer()`](/sdk/wallet-modules/wallet-solana/api-reference#quotetransfer-options) to get a fee estimate before executing the transfer.

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

You can validate addresses and check balances before transferring to catch errors early.

### 1. Validate Addresses

{% code title="Address Validation" lineNumbers="true" %}
```javascript
if (typeof splTokenMint !== 'string' || splTokenMint.length < 32) {
  throw new Error('Invalid SPL token mint address')
}

if (typeof recipient !== 'string' || recipient.length < 32) {
  throw new Error('Invalid recipient address')
}
```
{% endcode %}

### 2. Check Balance

Use [`account.getTokenBalance()`](/sdk/wallet-modules/wallet-solana/api-reference#gettokenbalance-tokenmint) to verify sufficient funds:

{% code title="Balance Check" lineNumbers="true" %}
```javascript
const balance = await account.getTokenBalance(splTokenMint)
if (balance < amount) {
  throw new Error('Insufficient SPL token balance')
}
```
{% endcode %}

### 3. Quote and Execute Transfer

Use [`account.quoteTransfer()`](/sdk/wallet-modules/wallet-solana/api-reference#quotetransfer-options) to estimate fees, then [`account.transfer()`](/sdk/wallet-modules/wallet-solana/api-reference#transfer-options) to execute:

{% code title="Quote and Execute" lineNumbers="true" %}
```javascript
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
```
{% endcode %}

## Next Steps

Learn how to [sign and verify messages](./sign-verify-messages.md) with your Solana account.
