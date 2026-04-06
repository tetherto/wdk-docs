---
title: Check Balances
description: Query native, ERC-20, and paymaster token balances.
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

This guide explains how to check [native token balances](#native-token-balance), [ERC-20 token balances](#erc-20-token-balance), [multiple token balances](#multiple-token-balances), [paymaster token balances](#paymaster-token-balance), and [read-only account balances](#read-only-account-balances).

## Native Token Balance

You can retrieve the native token balance (e.g., ETH) using [`account.getBalance()`](../api-reference.md#getbalance):

{% code title="Get Native Balance" lineNumbers="true" %}
```javascript
const balance = await account.getBalance()
console.log('Native balance:', balance, 'wei')
```
{% endcode %}

## ERC-20 Token Balance

You can check the balance of a specific ERC-20 token using [`account.getTokenBalance()`](../api-reference.md#gettokenbalance-tokenaddress):

{% code title="Get ERC-20 Balance" lineNumbers="true" %}
```javascript
const tokenBalance = await account.getTokenBalance('0xdAC17F958D2ee523a2206206994597C13D831ec7') // USDT
console.log('USDT balance:', tokenBalance)
```
{% endcode %}

## Multiple Token Balances

You can check balances for multiple ERC-20 tokens in a single call using [`account.getTokenBalances()`](../api-reference.md#gettokenbalances-tokenaddresses):

{% code title="Get Multiple Token Balances" lineNumbers="true" %}
```javascript
const tokenBalances = await account.getTokenBalances([
  '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
  '0x68749665FF8D2d112Fa859AA293F07A622782F38'  // XAUT
])
console.log('Multi-token balances:', tokenBalances)
```
{% endcode %}

## Paymaster Token Balance

You can check the paymaster token balance used for paying gas fees using [`account.getPaymasterTokenBalance()`](../api-reference.md#getpaymastertokenbalance):

{% code title="Get Paymaster Token Balance" lineNumbers="true" %}
```javascript
const paymasterBalance = await account.getPaymasterTokenBalance()
console.log('Paymaster token balance:', paymasterBalance)
```
{% endcode %}

{% hint style="info" %}
The paymaster token balance determines how many gasless transactions you can execute. Ensure the paymaster has sufficient token balance before initiating gasless operations.
{% endhint %}

## Read-Only Account Balances

You can check balances for any smart account address without a seed phrase using [`WalletAccountReadOnlyEvmErc4337`](../api-reference.md#walletaccountreadonlyevmerc4337):

{% code title="Read-Only Balance" lineNumbers="true" %}
```javascript
import { WalletAccountReadOnlyEvmErc4337 } from '@tetherto/wdk-wallet-evm-erc-4337'

const readOnlyAccount = new WalletAccountReadOnlyEvmErc4337('0x...', {
  chainId: 1,
  provider: 'https://rpc.mevblocker.io/fast',
  bundlerUrl: 'https://api.candide.dev/public/v3/ethereum',
  paymasterUrl: 'https://api.candide.dev/public/v3/ethereum',
  paymasterAddress: '0x8b1f6cb5d062aa2ce8d581942bbb960420d875ba',
  entryPointAddress: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
  safeModulesVersion: '0.3.0',
  paymasterToken: {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7'
  }
})

const balance = await readOnlyAccount.getBalance()
console.log('Read-only account balance:', balance, 'wei')
```
{% endcode %}

## Next Steps

With balance checks in place, learn how to [send gasless transactions](./send-transactions.md).
