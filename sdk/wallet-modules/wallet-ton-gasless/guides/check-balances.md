---
title: Check Balances
description: Query native TON, Jetton, and paymaster token balances.
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

This guide explains how to check native TON, Jetton, and paymaster token balances for both owned and read-only accounts.

## Native TON Balance

You can retrieve the native TON balance using [`account.getBalance()`](../api-reference.md#getbalance):

{% code title="Get Native TON Balance" lineNumbers="true" %}
```javascript
const balance = await account.getBalance()
console.log('Native TON balance:', balance, 'nanotons')
```
{% endcode %}

## Jetton Token Balance

You can check the balance of a specific Jetton token using [`account.getTokenBalance()`](../api-reference.md#gettokenbalance-tokenaddress):

{% code title="Get Jetton Token Balance" lineNumbers="true" %}
```javascript
const jettonAddress = 'EQ...' // Jetton contract address
const jettonBalance = await account.getTokenBalance(jettonAddress)
console.log('Jetton token balance:', jettonBalance)
```
{% endcode %}

## Paymaster Token Balance

You can check the balance of the configured paymaster token using [`account.getPaymasterTokenBalance()`](../api-reference.md#getpaymastertokenbalance):

{% code title="Get Paymaster Token Balance" lineNumbers="true" %}
```javascript
const paymasterBalance = await account.getPaymasterTokenBalance()
console.log('Paymaster Jetton balance:', paymasterBalance)
```
{% endcode %}

{% hint style="info" %}
The paymaster token balance determines how many gasless transfers you can execute. Ensure sufficient paymaster token balance before initiating gasless transfers.
{% endhint %}

## Read-Only Account Balances

You can check balances for any public key without a seed phrase using [`WalletAccountReadOnlyTonGasless`](../api-reference.md#walletaccountreadonlytongasless):

{% code title="Create Read-Only Account" lineNumbers="true" %}
```javascript
import { WalletAccountReadOnlyTonGasless } from '@tetherto/wdk-wallet-ton-gasless'

const readOnlyAccount = new WalletAccountReadOnlyTonGasless(publicKey, {
  tonClient: {
    url: 'https://toncenter.com/api/v3',
    secretKey: 'your-api-key' // Optional
  },
  tonApiClient: {
    url: 'https://tonapi.io/v2',
    secretKey: 'your-ton-api-key' // Optional
  },
  paymasterToken: {
    address: 'EQ...' // Paymaster Jetton contract address
  }
})
```
{% endcode %}

You can retrieve balances from a read-only account using [`readOnlyAccount.getBalance()`](../api-reference.md#getbalance) and [`readOnlyAccount.getPaymasterTokenBalance()`](../api-reference.md#getpaymastertokenbalance):

{% code title="Read-Only Balances" lineNumbers="true" %}
```javascript
const balance = await readOnlyAccount.getBalance()
console.log('Native TON balance:', balance)

const paymasterBalance = await readOnlyAccount.getPaymasterTokenBalance()
console.log('Paymaster token balance:', paymasterBalance)
```
{% endcode %}

## Next Steps

With balance checks in place, learn how to [send TON](./send-transactions.md).
