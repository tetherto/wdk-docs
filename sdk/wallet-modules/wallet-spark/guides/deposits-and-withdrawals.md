---
title: Deposits and Withdrawals
description: Fund Spark from Bitcoin layer 1 and withdraw back on-chain.
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

# Deposits and Withdrawals

This guide explains how to [get a single-use deposit address](#get-a-single-use-deposit-address), [claim deposits](#claim-deposits), [query static deposit addresses](#query-static-deposit-addresses), [query UTXOs for a deposit address](#query-utxos-for-a-deposit-address), and [withdraw to Bitcoin layer 1](#withdraw-to-bitcoin-layer-1).

## Get a Single-Use Deposit Address

1. Call [`account.getSingleUseDepositAddress()`](../api-reference.md#getsingleusedepositaddress).
2. Send Bitcoin to the returned on-chain address and wait for confirmation.

You can generate a one-time Bitcoin deposit address using [`account.getSingleUseDepositAddress()`](../api-reference.md#getsingleusedepositaddress):

{% code title="Single-Use Deposit Address" lineNumbers="true" %}
```javascript
const depositAddress = await account.getSingleUseDepositAddress()
console.log('Send Bitcoin to:', depositAddress)
```
{% endcode %}

## Claim Deposits

1. Identify the Bitcoin transaction id that funded the deposit.
2. Call [`account.claimDeposit()`](../api-reference.md#claimdeposit-txid) with that id.

You can credit the wallet after the deposit confirms using [`account.claimDeposit()`](../api-reference.md#claimdeposit-txid):

{% code title="Claim Single-Use Deposit" lineNumbers="true" %}
```javascript
const txId = 'f4184fc596403b9d638783cf57adfe4c75c605f6356fbc91338530e9831e9e16'
const walletLeaves = await account.claimDeposit(txId)
console.log('Deposit claimed:', walletLeaves)
```
{% endcode %}

### 1. (optional) Use a static deposit address

You can reuse one on-chain deposit address using [`account.getStaticDepositAddress()`](../api-reference.md#getstaticdepositaddress), then credit the wallet with [`account.claimStaticDeposit()`](../api-reference.md#claimstaticdeposit-txid) after the Bitcoin transaction confirms:

{% code title="Static Deposit Flow" lineNumbers="true" %}
```javascript
const staticAddress = await account.getStaticDepositAddress()
console.log('Static deposit address:', staticAddress)

const staticLeaves = await account.claimStaticDeposit(
  'f4184fc596403b9d638783cf57adfe4c75c605f6356fbc91338530e9831e9e16'
)
console.log('Static deposit claimed:', staticLeaves)
```
{% endcode %}

{% hint style="info" %}
You can list unused single-use addresses with [`account.getUnusedDepositAddresses()`](../api-reference.md#getunuseddepositaddresses-options). The method returns a paginated result with `depositAddresses` and `offset` fields.
{% endhint %}

## Query Static Deposit Addresses

You can list all existing static deposit addresses using [`account.getStaticDepositAddresses()`](../api-reference.md#getstaticdepositaddresses):

{% code title="Query Static Deposit Addresses" lineNumbers="true" %}
```javascript
const addresses = await account.getStaticDepositAddresses()
console.log('Static deposit addresses:', addresses)
```
{% endcode %}

## Query UTXOs for a Deposit Address

You can check confirmed UTXOs for a specific deposit address using [`account.getUtxosForDepositAddress()`](../api-reference.md#getutxosfordepositaddress-options):

{% code title="Query UTXOs" lineNumbers="true" %}
```javascript
const result = await account.getUtxosForDepositAddress({
  depositAddress: 'bc1q...'
})
console.log('Confirmed UTXOs:', result.utxos)
console.log('Offset:', result.offset)
```
{% endcode %}

## Withdraw to Bitcoin Layer 1

1. Choose a Bitcoin `onchainAddress` and `amountSats`.
2. Request a cooperative exit quote with [`account.quoteWithdraw()`](../api-reference.md#quotewithdraw-options).
3. Call [`account.withdraw()`](../api-reference.md#withdraw-options) with the destination and amount.

You can request a withdrawal fee quote using [`account.quoteWithdraw()`](../api-reference.md#quotewithdraw-options):

{% code title="Quote Withdrawal" lineNumbers="true" %}
```javascript
const feeQuote = await account.quoteWithdraw({
  withdrawalAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  amountSats: 100000
})
console.log('Withdrawal fee quote:', feeQuote)
```
{% endcode %}

You can initiate the withdrawal using [`account.withdraw()`](../api-reference.md#withdraw-options):

{% code title="Withdraw to On-Chain Bitcoin" lineNumbers="true" %}
```javascript
const withdrawal = await account.withdraw({
  onchainAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  amountSats: 100000
})
console.log('Withdrawal request:', withdrawal)
```
{% endcode %}

{% hint style="info" %}
[`withdraw()`](../api-reference.md#withdraw-options) accepts `onchainAddress` and `amountSats`. Run [`quoteWithdraw()`](../api-reference.md#quotewithdraw-options) first to understand the cooperative exit costs before initiating the withdrawal.
{% endhint %}

## Next Steps

Learn how to [handle errors and follow operational best practices](./handle-errors.md).
