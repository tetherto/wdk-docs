---
title: Lending Operations
description: Supply, withdraw, borrow, repay, quote fees, use ERC-4337, and read account data.
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

# Lending Operations

This guide walks through [supply](#supply), [withdraw](#withdraw), [borrow](#borrow), [repay](#repay), [quotes](#quotes-before-sending), [ERC-4337 usage](#erc-4337-smart-accounts), and [reading account data](#reading-account-data). It assumes an [`AaveProtocolEvm`](../api-reference.md#class-aaveprotocolevm) instance named `aave` and the USD₮ contract on Ethereum mainnet `0xdAC17F958D2ee523a2206206994597C13D831ec7`.

## Supply

You can deposit reserves into the pool using [`supply()`](../api-reference.md#supply-options-config):

{% code title="Supply USDT" lineNumbers="true" %}
```javascript
const USDT = '0xdAC17F958D2ee523a2206206994597C13D831ec7'

const tx = await aave.supply({ token: USDT, amount: 1000000n })
console.log('Supply tx hash:', tx.hash)
```
{% endcode %}

## Withdraw

You can remove supplied liquidity using [`withdraw()`](../api-reference.md#withdraw-options-config):

{% code title="Withdraw USDT" lineNumbers="true" %}
```javascript
const USDT = '0xdAC17F958D2ee523a2206206994597C13D831ec7'

const tx = await aave.withdraw({ token: USDT, amount: 1000000n })
console.log('Withdraw tx hash:', tx.hash)
```
{% endcode %}

## Borrow

You can draw debt against your collateral using [`borrow()`](../api-reference.md#borrow-options-config):

{% code title="Borrow USDT" lineNumbers="true" %}
```javascript
const USDT = '0xdAC17F958D2ee523a2206206994597C13D831ec7'

const tx = await aave.borrow({ token: USDT, amount: 1000000n })
console.log('Borrow tx hash:', tx.hash)
```
{% endcode %}

## Repay

You can pay down debt using [`repay()`](../api-reference.md#repay-options-config):

{% code title="Repay USDT" lineNumbers="true" %}
```javascript
const USDT = '0xdAC17F958D2ee523a2206206994597C13D831ec7'

const tx = await aave.repay({ token: USDT, amount: 1000000n })
console.log('Repay tx hash:', tx.hash)
```
{% endcode %}

## Quotes before sending

You can estimate the supply fee with [`quoteSupply()`](../api-reference.md#quotesupply-options-config):

{% code title="Quote supply fee" lineNumbers="true" %}
```javascript
const USDT = '0xdAC17F958D2ee523a2206206994597C13D831ec7'

const supplyQuote = await aave.quoteSupply({ token: USDT, amount: 1000000n })
console.log('Supply fee (wei):', supplyQuote.fee)
```
{% endcode %}

You can estimate the withdraw fee with [`quoteWithdraw()`](../api-reference.md#quotewithdraw-options-config):

{% code title="Quote withdraw fee" lineNumbers="true" %}
```javascript
const USDT = '0xdAC17F958D2ee523a2206206994597C13D831ec7'

const withdrawQuote = await aave.quoteWithdraw({ token: USDT, amount: 1000000n })
console.log('Withdraw fee (wei):', withdrawQuote.fee)
```
{% endcode %}

You can estimate the borrow fee with [`quoteBorrow()`](../api-reference.md#quoteborrow-options-config):

{% code title="Quote borrow fee" lineNumbers="true" %}
```javascript
const USDT = '0xdAC17F958D2ee523a2206206994597C13D831ec7'

const borrowQuote = await aave.quoteBorrow({ token: USDT, amount: 1000000n })
console.log('Borrow fee (wei):', borrowQuote.fee)
```
{% endcode %}

You can estimate the repay fee with [`quoteRepay()`](../api-reference.md#quoterepay-options-config):

{% code title="Quote repay fee" lineNumbers="true" %}
```javascript
const USDT = '0xdAC17F958D2ee523a2206206994597C13D831ec7'

const repayQuote = await aave.quoteRepay({ token: USDT, amount: 1000000n })
console.log('Repay fee (wei):', repayQuote.fee)
```
{% endcode %}

{% hint style="warning" %}
Health factor and collateralization limits still apply. A quote does not guarantee the transaction will succeed if on-chain state changes.
{% endhint %}

## ERC-4337 smart accounts

You can run the same methods through [`WalletAccountEvmErc4337`](../../../wallet-modules/wallet-evm-erc-4337/api-reference.md#walletaccountevmerc4337) and pass a second `config` argument to override per-call gas payment settings. In `v1.0.0-beta.4`, the lending methods accept the same override families as the wallet module: paymaster token, sponsorship policy, and native coins. See the [ERC-4337 config override](../api-reference.md#erc-4337-config-override-optional) section for the full field list.

{% code title="Supply with paymaster" lineNumbers="true" %}
```javascript
import { WalletAccountEvmErc4337 } from '@tetherto/wdk-wallet-evm-erc-4337'
import AaveProtocolEvm from '@tetherto/wdk-protocol-lending-aave-evm'

const aa = new WalletAccountEvmErc4337(seedPhrase, "0'/0/0", {
  chainId: 42161,
  provider: 'https://arb1.arbitrum.io/rpc',
  bundlerUrl: process.env.BUNDLER_URL,
  paymasterUrl: process.env.PAYMASTER_URL
})

const aaveAA = new AaveProtocolEvm(aa)

const result = await aaveAA.supply(
  { token: '0xdAC17F958D2ee523a2206206994597C13D831ec7', amount: 1000000n },
  {
    paymasterToken: {
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7'
    }
  }
)
console.log('Supply hash:', result.hash)
```
{% endcode %}

You can use the same second argument to:

- override paymaster-token mode with `paymasterUrl`, `paymasterAddress`, `paymasterToken`, or `transferMaxFee`
- switch one call to sponsorship mode with `isSponsored`, `paymasterUrl`, and `sponsorshipPolicyId`
- switch one call to native-coin gas mode with `useNativeCoins` and `transferMaxFee`

Use token addresses that exist on the same chain as the smart account RPC.

## Reading account data

You can inspect collateral, debt, and health using [`getAccountData()`](../api-reference.md#getaccountdata-account):

{% code title="Read Aave account data" lineNumbers="true" %}
```javascript
const data = await aave.getAccountData()

console.log({
  totalCollateralBase: data.totalCollateralBase,
  totalDebtBase: data.totalDebtBase,
  availableBorrowsBase: data.availableBorrowsBase,
  currentLiquidationThreshold: data.currentLiquidationThreshold,
  ltv: data.ltv,
  healthFactor: data.healthFactor
})
```
{% endcode %}

## Next Steps

- [Handle errors](handle-errors.md)
- [Get started](get-started.md)
- [API reference](../api-reference.md)
