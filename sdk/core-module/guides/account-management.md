---
title: Manage Accounts
description: Learn how to work with accounts and addresses.
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

This guide explains how to access accounts from your registered wallets. An "Account" object in WDK is your interface for inspecting balances and sending transactions on a specific blockchain.

## Retrieve Accounts

You can retrieve an account using a simple index or a custom derivation path.

### By Index (Recommended)

The simplest way to get an account is by its index (starting at `0`). This uses the default derivation path for the specified blockchain.

{% code title="Get Account by Index" lineNumbers="true" %}
```typescript
// Get the first account (index 0) for Ethereum and TON
const ethAccount = await wdk.getAccount('ethereum', 0)
const tonAccount = await wdk.getAccount('ton', 0)
```
{% endcode %}

### By Derivation Path (Advanced)

If you need a specific hierarchy, you can request an account by its unique derivation path.

{% code title="Get Account by Path" lineNumbers="true" %}
```typescript
// Custom path for Ethereum
const customEthAccount = await wdk.getAccountByPath('ethereum', "0'/0/1")
```
{% endcode %}

{% hint style="info" %}
The WDK instance caches accounts. If you call `getAccount` twice using the same index, the function will return the same `Account` object instance.
{% endhint %}

{% hint style="warning" %}
**Network Mismatch Warning**
Ensure your WDK instance configuration matches your account environment.
*   If using **Testnet** keys, ensure you registered the wallet with a **Testnet RPC** (e.g., `https://sepolia.drpc.org` for ETH, `https://testnet.toncenter.com/api/v2/jsonRPC` for TON).
*   If using **Mainnet** keys, ensure you registered the wallet with a **Mainnet RPC** (e.g., `https://eth.drpc.org` for ETH, `https://toncenter.com/api/v2/jsonRPC` for TON).
Using a Mainnet key on a Testnet RPC (or vice versa) will result in "Network not allowed" or zero balance errors.
{% endhint %}

## View Addresses

Once you have an account object, you can retrieve its public blockchain address using the `getAddress` function.

{% code title="Get Addresses" lineNumbers="true" %}
```typescript
const ethAddress = await ethAccount.getAddress()
console.log('Ethereum address:', ethAddress)
```
{% endcode %}

## Check Balances

You can check the native token balance of any account (e.g., ETH on Ethereum, TON on TON) by using the `getBalance()` function.

{% code title="Get Balance" lineNumbers="true" %}
```typescript
try {
  const balance = await ethAccount.getBalance()
  console.log('Balance:', balance)
} catch (error) {
  console.error('Failed to fetch balance:', error)
}
```
{% endcode %}

### Multi-Chain Balance Check

Because WDK offers a unified interface, you can easily iterate through multiple chains to fetch balances.

The following example:
1. Iterates over an array of user defined chains.
2. Retrieves the first account using the respective chain's `getAccount(index)` function.
3. Retrieves the first account's balance using the `getBalance()` function.
4. Logs the balance to the console.

{% code title="Check All Balances" lineNumbers="true" %}
```typescript
const chains = ['ethereum', 'ton', 'bitcoin']

for (const chain of chains) {
  try {
    const account = await wdk.getAccount(chain, 0)
    const balance = await account.getBalance()
    console.log(`${chain} balance:`, balance)
  } catch (error) {
    console.log(`${chain}: Wallet not registered or unavailable`)
  }
}
```
{% endcode %}

## Next steps

Now that you can access your accounts, learn how to [send transactions](./transactions.md).
