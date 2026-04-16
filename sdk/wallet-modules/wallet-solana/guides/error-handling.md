---
title: Error Handling
description: Handle errors, manage fees, and dispose of sensitive data in Solana wallets.
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

# Error Handling

This guide covers best practices for handling transaction errors, managing fee limits, and cleaning up sensitive data from memory.

## Handle Transaction Errors

Wrap transactions in `try/catch` blocks to handle common failure scenarios such as insufficient balance, invalid addresses, or exceeded fee limits.

{% code title="Transaction Error Handling" lineNumbers="true" %}
```javascript
try {
  const result = await account.transfer({
    token: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT mint address
    recipient: '11111111111111111111111111111112',
    amount: 1000000n
  })
  console.log('Transfer submitted:', result.hash)
} catch (error) {
  console.error('Transfer failed:', error.message)
  if (error.message.toLowerCase().includes('insufficient')) {
    console.log('Please add more tokens to your wallet')
  } else if (error.message.toLowerCase().includes('fee')) {
    console.log('The transfer fee exceeds your configured maximum')
  }
}
```
{% endcode %}

## Handle SOL Transfer Errors

Native SOL transfers can fail for reasons including insufficient balance or invalid recipient addresses.

{% code title="SOL Transfer Error Handling" lineNumbers="true" %}
```javascript
async function safeTransfer(account, wallet) {
  try {
    const solBalance = await account.getBalance()
    const transferAmount = 1000000000n // 1 SOL

    if (solBalance < transferAmount) {
      throw new Error('Insufficient SOL balance')
    }

    const quote = await account.quoteSendTransaction({
      to: '11111111111111111111111111111112',
      value: transferAmount
    })
    console.log('Estimated fee:', quote.fee, 'lamports')

    const result = await account.sendTransaction({
      to: '11111111111111111111111111111112',
      value: transferAmount
    })
    console.log('Transaction successful:', result.hash)

    return result
  } catch (error) {
    if (error.message.includes('Insufficient SOL')) {
      console.error('Please add more SOL to your wallet')
    } else if (error.message.includes('invalid address')) {
      console.error('The recipient address is invalid')
    } else if (error.message.includes('max fee')) {
      console.error('The transfer fee exceeds your configured maximum')
    } else {
      console.error('Transaction failed:', error.message)
    }
    throw error
  } finally {
    account.dispose()
    wallet.dispose()
  }
}
```
{% endcode %}

## Handle Prebuilt TransactionMessage Errors

If you pass a prebuilt `TransactionMessage`, make sure it already has a recent blockhash or durable nonce lifetime, or let WDK inject the latest blockhash for you. If you set `feePayer`, it must match the wallet address.

{% hint style="info" %}
Durable nonce flows still need a valid nonce account and signer setup in the message you provide. WDK preserves that lifetime instead of replacing it.
{% endhint %}

## Manage Fee Limits

Set `transferMaxFee` when creating the wallet to prevent transactions from exceeding a maximum cost. Retrieve current network rates with [`getFeeRates()`](/sdk/wallet-modules/wallet-solana/api-reference#getfeerates) to make informed decisions.

{% code title="Fee Management" lineNumbers="true" %}
```javascript
const feeRates = await wallet.getFeeRates()
console.log('Normal fee rate:', feeRates.normal, 'lamports')
console.log('Fast fee rate:', feeRates.fast, 'lamports')
```
{% endcode %}

## Dispose of Sensitive Data

Call [`dispose()`](/sdk/wallet-modules/wallet-solana/api-reference#dispose) on accounts and wallet managers to clear private keys and sensitive data from memory when they are no longer needed.

{% code title="Memory Cleanup" lineNumbers="true" %}
```javascript
account.dispose()

wallet.dispose()
```
{% endcode %}

{% hint style="warning" %}
Always call [`dispose()`](/sdk/wallet-modules/wallet-solana/api-reference#dispose) in a `finally` block or cleanup handler to ensure sensitive data is cleared even if an error occurs.
{% endhint %}
