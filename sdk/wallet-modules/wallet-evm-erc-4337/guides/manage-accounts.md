---
title: Manage Accounts
description: Work with multiple smart accounts and custom derivation paths.
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

You can retrieve multiple smart accounts using [`wallet.getAccount()`](../api-reference.md#getaccount-index) with different index values:

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

## Retrieve Account by Custom Derivation Path

You can retrieve an account at a specific derivation path using [`wallet.getAccountByPath()`](../api-reference.md#getaccountbypath-path):

{% code title="Custom Derivation Path" lineNumbers="true" %}
```javascript
const customAccount = await wallet.getAccountByPath("0'/0/5")
const customAddress = await customAccount.getAddress()
console.log('Custom account address:', customAddress)
```
{% endcode %}

## Next Steps

With accounts set up, learn how to [check balances](./check-balances.md).
