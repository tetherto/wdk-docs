---
title: Manage Accounts
description: Work with multiple accounts and custom derivation paths.
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

This guide explains how to [retrieve accounts by index](#retrieve-accounts-by-index) and [use custom derivation paths](#retrieve-account-by-custom-derivation-path).

## Retrieve Accounts by Index

You can retrieve multiple accounts using [`wallet.getAccount()`](../api-reference.md#getaccount-index) with different index values:

{% code title="Retrieve Multiple Accounts" lineNumbers="true" %}
```javascript
const account0 = await wallet.getAccount(0)
const address0 = await account0.getAddress()
console.log('Account 0 address:', address0)

const account1 = await wallet.getAccount(1)
const address1 = await account1.getAddress()
console.log('Account 1 address:', address1)
```
{% endcode %}

You can iterate through multiple accounts using [`wallet.getAccount()`](../api-reference.md#getaccount-index) to inspect addresses and balances in bulk:

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

## Retrieve Account by Custom Derivation Path

You can retrieve an account at a specific derivation path using [`wallet.getAccountByPath()`](../api-reference.md#getaccountbypath-path):

{% code title="Custom Derivation Path" lineNumbers="true" %}
```javascript
const customAccount = await wallet.getAccountByPath("0'/0/5")
const customAddress = await customAccount.getAddress()
console.log('Custom account address:', customAddress)
```
{% endcode %}

{% hint style="info" %}
The default derivation scheme is BIP-84 (Native SegWit): `m/84'/0'/0'/0/{index}` on mainnet. Set `bip: 44` in the wallet configuration for legacy BIP-44 paths: `m/44'/0'/0'/0/{index}`.
{% endhint %}

## Next Steps

With accounts set up, learn how to [check balances](./check-balances.md).
