---
title: Manage Accounts
description: Work with multiple EVM accounts and custom derivation paths.
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

This guide explains how to retrieve multiple accounts from your EVM wallet and use custom derivation paths.

## Retrieve Accounts by Index

Use `getAccount()` with a zero-based index to access accounts derived from the default BIP-44 path (`m/44'/60'/0'/0/{index}`).

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

Use `getAccountByPath()` when you need a specific hierarchy beyond the default sequential index.

{% code title="Custom Derivation Path" lineNumbers="true" %}
```javascript
const customAccount = await wallet.getAccountByPath("0'/0/5")
const customAddress = await customAccount.getAddress()
console.log('Custom account address:', customAddress)
```
{% endcode %}

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

    accounts.push({
      index: i,
      path: `m/44'/60'/0'/0/${i}`,
      address,
      balance
    })

    console.log(`Account ${i}:`, { address, balance: balance.toString() })
  }

  return accounts
}
```
{% endcode %}

## Next Steps

Now that you can access your accounts, learn how to [check balances](./check-balances.md).
