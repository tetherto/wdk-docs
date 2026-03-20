---
title: Check Balances
description: Query native TON and Jetton token balances.
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

This guide explains how to check native TON and Jetton token balances for both owned and read-only accounts.

## Native TON Balance

You can retrieve the native TON balance using [`account.getBalance()`](../api-reference.md#getbalance):

{% code title="Get Native TON Balance" lineNumbers="true" %}
```javascript
const balance = await account.getBalance()
console.log('Native TON balance:', balance, 'nanotons')
```
{% endcode %}

{% hint style="info" %}
On TON, values are expressed in nanotons (1 TON = 10^9 nanotons).
{% endhint %}

## Jetton Token Balance

You can check the balance of a specific Jetton token using [`account.getTokenBalance()`](../api-reference.md#gettokenbalance-tokenaddress):

{% code title="Get Jetton Token Balance" lineNumbers="true" %}
```javascript
const jettonAddress = 'EQ...' // Jetton contract address
const jettonBalance = await account.getTokenBalance(jettonAddress)
console.log('Jetton token balance:', jettonBalance)
```
{% endcode %}

## Read-Only Account Balances

You can check balances for any public key without a seed phrase using [`WalletAccountReadOnlyTon`](../api-reference.md#walletaccountreadonlyton):

{% code title="Create Read-Only Account" lineNumbers="true" %}
```javascript
import { WalletAccountReadOnlyTon } from '@tetherto/wdk-wallet-ton'

const readOnlyAccount = new WalletAccountReadOnlyTon(publicKey, {
  tonClient: {
    url: 'https://toncenter.com/api/v3',
    secretKey: 'your-api-key' // Optional
  }
})
```
{% endcode %}

You can retrieve the native balance from a read-only account using [`readOnlyAccount.getBalance()`](../api-reference.md#getbalance):

{% code title="Read-Only Native Balance" lineNumbers="true" %}
```javascript
const balance = await readOnlyAccount.getBalance()
console.log('Read-only account balance:', balance)
```
{% endcode %}

{% hint style="info" %}
You can also create a read-only account from an existing owned account using [`account.toReadOnlyAccount()`](../api-reference.md#toreadonlyaccount).
{% endhint %}

## Next Steps

With balance checks in place, learn how to [send TON](./send-transactions.md).
