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

This guide explains how to check native SOL and SPL token balances for both owned and read-only accounts.

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

## Read-Only Account Balances

Use [`WalletAccountReadOnlySolana`](/sdk/wallet-modules/wallet-solana/api-reference#walletaccountreadonlysolana) to check balances for any public key without a seed phrase.

### Native Balance

{% code title="Read-Only SOL Balance" lineNumbers="true" %}
```javascript
import { WalletAccountReadOnlySolana } from '@tetherto/wdk-wallet-solana'

const readOnlyAccount = new WalletAccountReadOnlySolana('publicKey', {
  rpcUrl: 'https://api.mainnet-beta.solana.com',
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

{% hint style="info" %}
You can also create a read-only account from an existing owned account using [`await account.toReadOnlyAccount()`](/sdk/wallet-modules/wallet-solana/api-reference#toreadonlyaccount).
{% endhint %}

## Next Steps

With balance checks in place, learn how to [send SOL](./send-transactions.md).
