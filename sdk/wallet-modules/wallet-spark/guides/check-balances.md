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

You can read the account balance in satoshis using [`account.getBalance()`](/sdk/wallet-modules/wallet-spark/api-reference/#getbalance):

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

If you configure [`sparkscan`](/sdk/wallet-modules/wallet-spark/configuration/#sparkscan-balance-polling), [`account.getBalance()`](/sdk/wallet-modules/wallet-spark/api-reference/#getbalance) returns SparkScan's `btcSoftBalanceSats` value instead of the Spark SDK balance:

{% code title="SparkScan Balance Polling" lineNumbers="true" %}
```javascript
const wallet = new WalletManagerSpark(seedPhrase, {
  network: 'MAINNET',
  sparkscan: {
    apiKey: 'your-api-key-here',
  },
})

const account = await wallet.getAccount(0)
const balance = await account.getBalance()
console.log('SparkScan balance:', balance)
```
{% endcode %}

## Token Balance

You can read a specific token balance using [`account.getTokenBalance()`](/sdk/wallet-modules/wallet-spark/api-reference/#gettokenbalance-tokenaddress):

{% code title="Token Balance" lineNumbers="true" %}
```javascript
const tokenBalance = await account.getTokenBalance('token_address...')
console.log('Token balance:', tokenBalance)
```
{% endcode %}

## Read-Only Account Balances

1. Construct a [`WalletAccountReadOnlySpark`](/sdk/wallet-modules/wallet-spark/api-reference/#walletaccountreadonlyspark) instance with the Spark address and optional config.
2. Call [`readOnlyAccount.getBalance()`](/sdk/wallet-modules/wallet-spark/api-reference/#getbalance).

You can create a read-only account from a Spark address using the [`WalletAccountReadOnlySpark`](/sdk/wallet-modules/wallet-spark/api-reference/#walletaccountreadonlyspark) constructor:

{% code title="Read-Only Account" lineNumbers="true" %}
```javascript
import { WalletAccountReadOnlySpark } from '@tetherto/wdk-wallet-spark'

const readOnlyAccount = new WalletAccountReadOnlySpark('spark1...', {
  network: 'MAINNET'
})
```
{% endcode %}

You can read the native balance from that account using [`readOnlyAccount.getBalance()`](/sdk/wallet-modules/wallet-spark/api-reference/#getbalance):

{% code title="Read-Only Native Balance" lineNumbers="true" %}
```javascript
const balance = await readOnlyAccount.getBalance()
console.log('Read-only balance:', balance, 'satoshis')
```
{% endcode %}

{% hint style="info" %}
The same [`sparkscan`](/sdk/wallet-modules/wallet-spark/configuration/#sparkscan-balance-polling) behavior applies to read-only accounts.
{% endhint %}

You can read a token balance on a read-only account using [`readOnlyAccount.getTokenBalance()`](/sdk/wallet-modules/wallet-spark/api-reference/#gettokenbalance-tokenaddress):

{% code title="Read-Only Token Balance" lineNumbers="true" %}
```javascript
const tokenBalance = await readOnlyAccount.getTokenBalance('token_address...')
console.log('Read-only token balance:', tokenBalance)
```
{% endcode %}

{% hint style="info" %}
You can also obtain a read-only handle from an owned account with [`account.toReadOnlyAccount()`](/sdk/wallet-modules/wallet-spark/api-reference/#toreadonlyaccount).
{% endhint %}

## Next Steps

With balances verified, learn how to [send Spark and transfer tokens](/sdk/wallet-modules/wallet-spark/guides/send-and-transfer/).
