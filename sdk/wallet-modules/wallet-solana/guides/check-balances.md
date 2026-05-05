---
title: Check Balances
description: Query SOL and SPL token balances on Solana.
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

This guide explains how to check [owned account balances](#owned-account-balances), [batch SPL token balances](#batch-spl-token-balances), and [read-only account balances](#read-only-account-balances).

## Owned Account Balances

Use an account retrieved from [`WalletManagerSolana`](/sdk/wallet-modules/wallet-solana/api-reference#walletmanagersolana) to query balances.

### Native SOL Balance

You can retrieve the native SOL balance from an `Account` object using [`account.getBalance()`](/sdk/wallet-modules/wallet-solana/api-reference#getbalance):

{% code title="Get SOL Balance" lineNumbers="true" %}
```javascript
const balance = await account.getBalance()
console.log('Native SOL balance:', balance, 'lamports')
```
{% endcode %}

### SPL Token Balance

You can retrieve an SPL token balance from an `Account` object using [`account.getTokenBalance(tokenMint)`](/sdk/wallet-modules/wallet-solana/api-reference#gettokenbalance-tokenmint):

{% code title="Get SPL Token Balance" lineNumbers="true" %}
```javascript
const splTokenAddress = 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB' // USDT mint address
const splTokenBalance = await account.getTokenBalance(splTokenAddress)
console.log('SPL token balance:', splTokenBalance)
```
{% endcode %}

{% hint style="info" %}
Token balances are returned in the token's smallest units. Adjust for the token's decimals when displaying (e.g., USD₮ has 6 decimals).
{% endhint %}

### Batch SPL Token Balances

You can retrieve multiple SPL token balances in one batch using [`account.getTokenBalances()`](/sdk/wallet-modules/wallet-solana/api-reference#gettokenbalances-tokenaddresses):

{% code title="Get Batch SPL Token Balances" lineNumbers="true" %}
```javascript
const tokenBalances = await account.getTokenBalances([
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  'So11111111111111111111111111111111111111112'
])

console.log('USDT balance:', tokenBalances['Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'])
console.log('Wrapped SOL balance:', tokenBalances['So11111111111111111111111111111111111111112'])
```
{% endcode %}

{% hint style="info" %}
The returned object maps each token mint address to a `bigint` balance in base units. Missing associated token accounts return `0n`.
{% endhint %}

## Read-Only Account Balances

Use [`WalletAccountReadOnlySolana`](/sdk/wallet-modules/wallet-solana/api-reference#walletaccountreadonlysolana) to check balances for any public key without a seed phrase.

### Native Balance

{% code title="Read-Only SOL Balance" lineNumbers="true" %}
```javascript
import { WalletAccountReadOnlySolana } from '@tetherto/wdk-wallet-solana'

const readOnlyAccount = new WalletAccountReadOnlySolana('publicKey', {
  provider: 'https://api.mainnet-beta.solana.com',
  commitment: 'confirmed'
})

const balance = await readOnlyAccount.getBalance()
console.log('Native balance:', balance, 'lamports')
```
{% endcode %}

### Token Balance

{% code title="Read-Only Token Balance" lineNumbers="true" %}
```javascript
const tokenBalance = await readOnlyAccount.getTokenBalance('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB')
console.log('Token balance:', tokenBalance)
```
{% endcode %}

You can also batch read SPL token balances from a read-only account using [`readOnlyAccount.getTokenBalances()`](/sdk/wallet-modules/wallet-solana/api-reference#gettokenbalances-tokenaddresses):

{% code title="Read-Only Batch Token Balances" lineNumbers="true" %}
```javascript
const tokenBalances = await readOnlyAccount.getTokenBalances([
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  'So11111111111111111111111111111111111111112'
])
console.log('Read-only token balances:', tokenBalances)
```
{% endcode %}

{% hint style="info" %}
You can also create a read-only account from an existing owned account using [`await account.toReadOnlyAccount()`](/sdk/wallet-modules/wallet-solana/api-reference#toreadonlyaccount).
{% endhint %}

## Next Steps

With balance checks in place, learn how to [send SOL](./send-transactions.md).
