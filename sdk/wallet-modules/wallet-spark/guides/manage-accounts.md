---
title: Manage Accounts
description: Retrieve Spark accounts by index and iterate over them.
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

# Manage Accounts

This guide explains how to [retrieve accounts by index](#retrieve-accounts-by-index), [retrieve accounts by derivation path](#retrieve-accounts-by-derivation-path), and [iterate over accounts](#iterate-over-accounts).

## Retrieve Accounts by Index

1. Call [`wallet.getAccount()`](../api-reference.md#getaccount-index) with the account index.
2. Call [`account.getAddress()`](../api-reference.md#getaddress) for each account.

You can retrieve multiple accounts using [`wallet.getAccount()`](../api-reference.md#getaccount-index) with different index values:

{% code title="Retrieve Accounts by Index" lineNumbers="true" %}
```javascript
const account0 = await wallet.getAccount(0)
const address0 = await account0.getAddress()
console.log('Account 0 address:', address0)

const account1 = await wallet.getAccount(1)
const address1 = await account1.getAddress()
console.log('Account 1 address:', address1)
```
{% endcode %}

{% hint style="info" %}
Accounts use BIP-44 paths `m/44'/998'/{networkNumber}'/0/{index}` where `998` is Spark’s coin type and `networkNumber` is `0` for MAINNET, `2` for SIGNET, or `3` for REGTEST.
{% endhint %}

## Retrieve Accounts by Derivation Path

You can retrieve an account at a specific BIP-44 derivation path using [`wallet.getAccountByPath()`](../api-reference.md#getaccountbypath-path):

{% code title="Retrieve Account by Path" lineNumbers="true" %}
```javascript
const account = await wallet.getAccountByPath("0'/0/0")
const address = await account.getAddress()
console.log('Account address:', address)
```
{% endcode %}

{% hint style="info" %}
The path segment is appended to the base path `m/44'/998'/`. For example, `"0'/0/0"` resolves to `m/44'/998'/0'/0/0` on MAINNET. See [`getAccountByPath()`](../api-reference.md#getaccountbypath-path) in the API reference.
{% endhint %}

## Iterate Over Accounts

You can walk a range of indices using [`wallet.getAccount()`](../api-reference.md#getaccount-index) inside a loop:

{% code title="Iterate Over Accounts" lineNumbers="true" %}
```javascript
for (let i = 0; i < 5; i++) {
  const account = await wallet.getAccount(i)
  const address = await account.getAddress()
  const balance = await account.getBalance()
  console.log(`Account ${i}: ${address} (${balance} satoshis)`)
}
```
{% endcode %}

## Next Steps

With accounts set up, learn how to [check balances](./check-balances.md).
