---
title: Send SOL
description: Send native SOL and estimate transaction fees on Solana.
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

# Send SOL

This guide explains how to send native SOL, estimate transaction fees, and use dynamic fee rates.

{% hint style="warning" %}
**BigInt Usage:** Always use `BigInt` (the `n` suffix) for monetary values to avoid precision loss with large numbers.
{% endhint %}

{% hint style="info" %}
On Solana, values are expressed in lamports (1 SOL = 10^9 lamports). Fees are calculated based on the recent blockhash and instruction count.
{% endhint %}

## Send Native SOL

Use [`account.sendTransaction()`](/sdk/wallet-modules/wallet-solana/api-reference#sendtransaction-tx) to transfer SOL to a recipient address.

{% code title="Send SOL" lineNumbers="true" %}
```javascript
const result = await account.sendTransaction({
  recipient: 'publicKey', // Recipient's base58-encoded public key
  value: 1000000000n, // 1 SOL in lamports
  commitment: 'confirmed' // Optional: commitment level
})
console.log('Transaction hash:', result.hash)
console.log('Transaction fee:', result.fee, 'lamports')
```
{% endcode %}

## Estimate Transaction Fees

Use [`account.quoteSendTransaction()`](/sdk/wallet-modules/wallet-solana/api-reference#quotesendtransaction-tx) to get a fee estimate before sending.

{% code title="Quote Transaction Fee" lineNumbers="true" %}
```javascript
const quote = await account.quoteSendTransaction({
  recipient: 'publicKey',
  value: 1000000000n
})
console.log('Estimated fee:', quote.fee, 'lamports')
```
{% endcode %}

## Use Dynamic Fee Rates

Retrieve current fee rates using [`wallet.getFeeRates()`](/sdk/wallet-modules/wallet-solana/api-reference#getfeerates). Rates are calculated based on the recent blockhash and compute unit prices.

{% code title="Dynamic Fee Rates" lineNumbers="true" %}
```javascript
const feeRates = await wallet.getFeeRates()
console.log('Normal fee rate:', feeRates.normal, 'lamports')
console.log('Fast fee rate:', feeRates.fast, 'lamports')
```
{% endcode %}

## Complete Example

{% code title="Full SOL Transfer Flow" lineNumbers="true" %}
```javascript
async function sendSOLTransfer(account, wallet) {
  const solBalance = await account.getBalance()
  const transferAmount = 1000000000n // 1 SOL

  if (solBalance < transferAmount) {
    throw new Error('Insufficient SOL balance')
  }

  const quote = await account.quoteSendTransaction({
    recipient: '11111111111111111111111111111112',
    value: transferAmount
  })
  console.log('Estimated fee:', quote.fee, 'lamports')

  const result = await account.sendTransaction({
    recipient: '11111111111111111111111111111112',
    value: transferAmount
  })

  console.log('Transaction hash:', result.hash)
  console.log('Fee paid:', result.fee, 'lamports')

  return result
}
```
{% endcode %}

## Next Steps

To transfer SPL tokens instead of native SOL, see [Transfer SPL Tokens](./transfer-tokens.md).
