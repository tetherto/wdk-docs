---
title: Check Balances
description: Query native and ERC-20 token balances on EVM chains.
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

This guide explains how to check native token and ERC-20 token balances for both owned and read-only accounts.

## Owned Account Balances

Use an account retrieved from `WalletManagerEvm` to query balances.

### Native Token Balance

{% code title="Get Native Balance" lineNumbers="true" %}
```javascript
const balance = await account.getBalance()
console.log('Native balance:', balance, 'wei')
```
{% endcode %}

### Single ERC-20 Token Balance

{% code title="Get ERC-20 Balance" lineNumbers="true" %}
```javascript
const tokenAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7' // USDT
const tokenBalance = await account.getTokenBalance(tokenAddress)
console.log('Token balance:', tokenBalance)
```
{% endcode %}

### Multiple ERC-20 Token Balances

{% code title="Get Multiple Token Balances" lineNumbers="true" %}
```javascript
const tokenBalances = await account.getTokenBalances([
  '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
  '0x68749665FF8D2d112Fa859AA293F07A622782F38'  // XAUT
])
console.log('Multi-token balances:', tokenBalances)
```
{% endcode %}

## Read-Only Account Balances

Use `WalletAccountReadOnlyEvm` to check balances for any public address without a seed phrase.

{% code title="Read-Only Account Balances" lineNumbers="true" %}
```javascript
import { WalletAccountReadOnlyEvm } from '@tetherto/wdk-wallet-evm'

const readOnlyAccount = new WalletAccountReadOnlyEvm('0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', {
   provider: 'https://rpc.mevblocker.io/fast',
})

const balance = await readOnlyAccount.getBalance()
console.log('Native balance:', balance, 'wei')

const tokenBalance = await readOnlyAccount.getTokenBalance('0xdAC17F958D2ee523a2206206994597C13D831ec7')
console.log('Token balance:', tokenBalance)

const tokenBalances = await readOnlyAccount.getTokenBalances([
  '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
  '0x68749665FF8D2d112Fa859AA293F07A622782F38'  // XAUT
])
console.log('Multi-token balances:', tokenBalances)
```
{% endcode %}

{% hint style="info" %}
You can also create a read-only account from an existing owned account using `await account.toReadOnlyAccount()`.
{% endhint %}

## Next Steps

With balance checks in place, learn how to [send transactions](./send-transactions.md).
