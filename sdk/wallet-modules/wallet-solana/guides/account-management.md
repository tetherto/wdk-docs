---
title: Manage Accounts
description: Work with multiple Solana accounts and custom derivation paths.
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

This guide explains how to retrieve multiple accounts from your Solana wallet and use custom derivation paths.

## Retrieve Accounts by Index

Use [`getAccount()`](/sdk/wallet-modules/wallet-solana/api-reference#getaccount-index) with a zero-based index to access accounts derived from the default derivation path.

{% code title="Get Accounts by Index" lineNumbers="true" %}
```javascript
const account = await wallet.getAccount(0)
const address = await account.getAddress()
console.log('Account 0 address:', address)

const account1 = await wallet.getAccount(1)
const address1 = await account1.getAddress()
console.log('Account 1 address:', address1)
```
{% endcode %}

## Retrieve Account by Custom Derivation Path

Use [`getAccountByPath()`](/sdk/wallet-modules/wallet-solana/api-reference#getaccountbypath-path) when you need a specific hierarchy beyond the default sequential index.

{% code title="Custom Derivation Path" lineNumbers="true" %}
```javascript
const customAccount = await wallet.getAccountByPath("0'/0'/5'")
const customAddress = await customAccount.getAddress()
console.log('Custom account address:', customAddress)
```
{% endcode %}

{% hint style="info" %}
Solana uses SLIP-0010 derivation paths. Every child segment in a custom path must be hardened, for example `0'/0'/5'`. All accounts inherit the provider configuration from the wallet manager.
{% endhint %}

## Iterate Over Multiple Accounts

You can loop through accounts to inspect addresses and balances in bulk.

{% code title="Multi-Account Iteration" lineNumbers="true" %}
```javascript
async function listAccounts(wallet) {
  const accounts = []

  for (let i = 0; i < 5; i++) {
    const account = await wallet.getAccount(i)
    const address = await account.getAddress()
    const balance = await account.getBalance()

    accounts.push({ index: i, address, balance })
  }

  return accounts
}
```
{% endcode %}

## Next Steps

Now that you can access your accounts, learn how to [check balances](./check-balances.md).
