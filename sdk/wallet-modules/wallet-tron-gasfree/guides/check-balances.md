---
title: Check Balances
description: Query native TRX and TRC20 token balances on gas-free Tron wallets.
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

This guide explains how to check native TRX and TRC20 token balances for both owned and read-only gas-free accounts.

## Native TRX Balance

You can retrieve the native TRX balance using [`account.getBalance()`](../api-reference.md#getbalance):

{% code title="Get Native TRX Balance" lineNumbers="true" %}
```javascript
const balance = await account.getBalance()
console.log('Native TRX balance:', balance, 'sun')
```
{% endcode %}

{% hint style="info" %}
On Tron, values are expressed in sun (1 TRX = 1,000,000 sun).
{% endhint %}

## TRC20 Token Balance

You can check the balance of a specific TRC20 token using [`account.getTokenBalance()`](../api-reference.md#gettokenbalance-tokenaddress):

{% code title="Get TRC20 Token Balance" lineNumbers="true" %}
```javascript
const trc20Address = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t' // USDT
const trc20Balance = await account.getTokenBalance(trc20Address)
console.log('TRC20 token balance:', trc20Balance)
```
{% endcode %}

## Read-Only Account Balances

You can check balances for any Tron address without a seed phrase using [`WalletAccountReadOnlyTronGasfree`](../api-reference.md#walletaccountreadonlytrongasfree):

{% code title="Create Read-Only Account" lineNumbers="true" %}
```javascript
import { WalletAccountReadOnlyTronGasfree } from '@tetherto/wdk-wallet-tron-gasfree'

const readOnlyAccount = new WalletAccountReadOnlyTronGasfree('TLyqzVGLV1srkB7dToTAEqgDSfPtXRJZYH', {
  chainId: 728126428,
  provider: 'https://api.trongrid.io',
  gasFreeProvider: 'https://gasfree.provider.url',
  gasFreeApiKey: 'your-api-key',
  gasFreeApiSecret: 'your-api-secret',
  serviceProvider: 'TLyqzVGLV1srkB7dToTAEqgDSfPtXRJZYH',
  verifyingContract: 'TLyqzVGLV1srkB7dToTAEqgDSfPtXRJZYH'
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

With balance checks in place, learn how to [send TRX](./send-transactions.md).
