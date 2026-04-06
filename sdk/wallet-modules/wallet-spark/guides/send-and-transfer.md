---
title: Send and Transfer
description: Send native Spark, transfer tokens, and estimate fees.
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

# Send and Transfer

This guide explains how to [send native Spark](#send-spark), [transfer tokens](#transfer-tokens), and [estimate fees](#estimate-fees).

## Send Spark

1. Build the recipient Spark address and amount in satoshis.
2. Call [`account.sendTransaction()`](../api-reference.md#sendtransaction-to-value).

You can send native Spark (satoshis) using [`account.sendTransaction()`](../api-reference.md#sendtransaction-to-value):

{% code title="Send Native Spark" lineNumbers="true" %}
```javascript
const result = await account.sendTransaction({
  to: 'spark1...',
  value: 1000000
})
console.log('Transaction hash:', result.hash)
console.log('Transaction fee:', result.fee)
```
{% endcode %}

{% hint style="info" %}
On-chain Spark transfers report `fee` as `0`. Memos are not supported on [`sendTransaction()`](../api-reference.md#sendtransaction-to-value). Use valid Spark network addresses.
{% endhint %}

## Transfer Tokens

You can move tokens to another Spark address using [`account.transfer()`](../api-reference.md#transfer-options):

{% code title="Transfer Tokens" lineNumbers="true" %}
```javascript
const transferResult = await account.transfer({
  token: 'btkn1...',
  amount: BigInt(1000000),
  recipient: 'spark1...'
})
console.log('Transfer hash:', transferResult.hash)
console.log('Transfer fee:', Number(transferResult.fee))
```
{% endcode %}

{% hint style="info" %}
Token identifiers use Bech32m (for example `btkn1...`). Amounts use the token’s base units.
{% endhint %}

## Estimate Fees

### Spark native and token transfer quotes

You can preview the fee for a native send using [`account.quoteSendTransaction()`](../api-reference.md#quotesendtransaction-to-value):

{% code title="Quote Native Send" lineNumbers="true" %}
```javascript
const quote = await account.quoteSendTransaction({
  to: 'spark1...',
  value: 1000000
})
console.log('Estimated fee:', quote.fee)
```
{% endcode %}

You can preview the fee for a token transfer using [`account.quoteTransfer()`](../api-reference.md#quotetransfer-options):

{% code title="Quote Token Transfer" lineNumbers="true" %}
```javascript
const transferQuote = await account.quoteTransfer({
  token: 'btkn1...',
  amount: BigInt(1000000),
  recipient: 'spark1...'
})
console.log('Estimated transfer fee:', Number(transferQuote.fee))
```
{% endcode %}

### Wallet-level fee rates

You can read wallet-level fee rate placeholders using [`wallet.getFeeRates()`](../api-reference.md#getfeerates):

{% code title="Wallet Fee Rates" lineNumbers="true" %}
```javascript
const feeRates = await wallet.getFeeRates()
console.log('Normal:', feeRates.normal)
console.log('Fast:', feeRates.fast)
```
{% endcode %}

{% hint style="info" %}
Spark network fees for native sends and token transfers are zero; [`wallet.getFeeRates()`](../api-reference.md#getfeerates) returns `{ normal: 0n, fast: 0n }`. Lightning flows can still incur fees; see [Lightning payments](./lightning-payments.md).
{% endhint %}

## Next Steps

Learn how to [create and pay Lightning invoices](./lightning-payments.md).
