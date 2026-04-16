---
title: Check Balances
description: Query native BTC balances for owned and read-only accounts.
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

This guide explains how to check [native BTC balances](#native-btc-balance), [maximum spendable amounts](#maximum-spendable-amount), and [read-only account balances](#read-only-account-balances).

## Native BTC Balance

You can retrieve the confirmed balance in satoshis using [`account.getBalance()`](../api-reference.md#getbalance):

{% code title="Get Native BTC Balance" lineNumbers="true" %}
```javascript
const balance = await account.getBalance()
console.log('Total balance:', balance, 'satoshis')
```
{% endcode %}

{% hint style="info" %}
On Bitcoin, balances are expressed in satoshis (1 BTC = 100,000,000 satoshis). The [`getBalance()`](../api-reference.md#getbalance) method returns the total balance, including unconfirmed funds when present.
{% endhint %}

## Maximum Spendable Amount

You can check the maximum amount available to send in a single transaction using [`account.getMaxSpendable()`](../api-reference.md#getmaxspendable):

{% code title="Get Maximum Spendable" lineNumbers="true" %}
```javascript
const { amount, fee } = await account.getMaxSpendable()
console.log('Max spendable:', amount, 'satoshis')
console.log('Estimated fee:', fee, 'satoshis')
```
{% endcode %}

{% hint style="info" %}
The maximum spendable amount can differ from the total balance due to transaction fees, uneconomic UTXOs, the 200-input limit per transaction, and the dust threshold (294 satoshis for SegWit, 546 for legacy).
{% endhint %}

## Read-Only Account Balances

You can check balances for any Bitcoin address without a seed phrase using [`WalletAccountReadOnlyBtc`](../api-reference.md#walletaccountreadonlybtc):

{% code title="Create Read-Only Account" lineNumbers="true" %}
```javascript
import { WalletAccountReadOnlyBtc, ElectrumTcp } from '@tetherto/wdk-wallet-btc'

const client = new ElectrumTcp({
  host: 'electrum.blockstream.info',
  port: 50001
})

const readOnlyAccount = new WalletAccountReadOnlyBtc('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', {
  client,
  network: 'bitcoin'
})
```
{% endcode %}

You can retrieve the balance from a read-only account using [`readOnlyAccount.getBalance()`](../api-reference.md#getbalance):

{% code title="Read-Only Balance" lineNumbers="true" %}
```javascript
const balance = await readOnlyAccount.getBalance()
console.log('Read-only account balance:', balance, 'satoshis')
```
{% endcode %}

{% hint style="info" %}
Read-only accounts follow the same balance behavior as owned accounts: [`getBalance()`](../api-reference.md#getbalance) includes unconfirmed funds when present.
{% endhint %}

{% hint style="info" %}
You can also create a read-only account from an existing owned account using [`account.toReadOnlyAccount()`](../api-reference.md#toreadonlyaccount).
{% endhint %}

## Next Steps

With balance checks in place, learn how to [send BTC](./send-transactions.md).
