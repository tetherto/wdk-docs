---
title: Check Balances
description: Query native Spark balances and read-only account balances.
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

# Check Balances

This guide explains how to read a [native Spark balance](#native-spark-balance), query a [token balance](#token-balance), and check [read-only account balances](#read-only-account-balances).

## Native Spark Balance

You can read the account balance in satoshis using [`account.getBalance()`](../api-reference.md#getbalance):

{% code title="Native Spark Balance" lineNumbers="true" %}
```javascript
const balance = await account.getBalance()
console.log('Balance:', balance, 'satoshis')
console.log('Balance in BTC:', Number(balance) / 100000000)
```
{% endcode %}

{% hint style="info" %}
Balances are in satoshis (1 BTC = 100,000,000 satoshis).
{% endhint %}

## Token Balance

You can read a specific token balance using [`account.getTokenBalance()`](../api-reference.md#gettokenbalance-tokenaddress):

{% code title="Token Balance" lineNumbers="true" %}
```javascript
const tokenBalance = await account.getTokenBalance('token_address...')
console.log('Token balance:', tokenBalance)
```
{% endcode %}

## Read-Only Account Balances

1. Construct a [`WalletAccountReadOnlySpark`](../api-reference.md#walletaccountreadonlyspark) instance with the Spark address and optional config.
2. Call [`readOnlyAccount.getBalance()`](../api-reference.md#getbalance).

You can create a read-only account from a Spark address using the [`WalletAccountReadOnlySpark`](../api-reference.md#walletaccountreadonlyspark) constructor:

{% code title="Read-Only Account" lineNumbers="true" %}
```javascript
import { WalletAccountReadOnlySpark } from '@tetherto/wdk-wallet-spark'

const readOnlyAccount = new WalletAccountReadOnlySpark('spark1...', {
  network: 'MAINNET'
})
```
{% endcode %}

You can read the native balance from that account using [`readOnlyAccount.getBalance()`](../api-reference.md#getbalance):

{% code title="Read-Only Native Balance" lineNumbers="true" %}
```javascript
const balance = await readOnlyAccount.getBalance()
console.log('Read-only balance:', balance, 'satoshis')
```
{% endcode %}

You can read a token balance on a read-only account using [`readOnlyAccount.getTokenBalance()`](../api-reference.md#gettokenbalance-tokenaddress):

{% code title="Read-Only Token Balance" lineNumbers="true" %}
```javascript
const tokenBalance = await readOnlyAccount.getTokenBalance('token_address...')
console.log('Read-only token balance:', tokenBalance)
```
{% endcode %}

{% hint style="info" %}
You can also obtain a read-only handle from an owned account with [`account.toReadOnlyAccount()`](../api-reference.md#toreadonlyaccount).
{% endhint %}

## Next Steps

With balances verified, learn how to [send Spark and transfer tokens](./send-and-transfer.md).
