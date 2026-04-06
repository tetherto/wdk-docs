---
title: Execute Swaps
description: Run exact-input swaps, exact-output swaps, and swaps with ERC-4337 accounts.
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

# Execute Swaps

This guide explains how to run a [basic exact-input swap](#basic-exact-input-swap), an [exact-output swap](#exact-output-swap), and a [swap from an ERC-4337 smart account](#swap-with-erc-4337). You should already have a [`VeloraProtocolEvm`](../api-reference.md#class-veloraprotocolevm) instance.

{% hint style="warning" %}
Swaps spend tokens and gas on-chain. Use amounts you control and an RPC you trust.
{% endhint %}

## Basic exact-input swap

You can sell an exact amount of the input token using [`swap()`](../api-reference.md#swap-options-config):

{% code title="Exact input: USDT to WETH" lineNumbers="true" %}
```javascript
const result = await swapProtocol.swap({
  tokenIn: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  tokenOut: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  tokenInAmount: 1000000n
})

console.log('Swap transaction hash:', result.hash)
console.log('Total fee (wei):', result.fee)
console.log('Tokens sold (base units):', result.tokenInAmount)
console.log('Tokens bought (base units):', result.tokenOutAmount)
```
{% endcode %}

## Exact output swap

You can receive an exact amount of the output token by passing `tokenOutAmount` to [`swap()`](../api-reference.md#swap-options-config):

{% code title="Exact output amount" lineNumbers="true" %}
```javascript
const result = await swapProtocol.swap({
  tokenIn: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  tokenOut: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  tokenOutAmount: 500000000000000000n
})

console.log('Swap hash:', result.hash)
console.log('Tokens sold (base units):', result.tokenInAmount)
console.log('Tokens bought (base units):', result.tokenOutAmount)
```
{% endcode %}

## Swap with ERC-4337

You can perform a user-operation-backed swap by constructing [`VeloraProtocolEvm`](../api-reference.md#class-veloraprotocolevm) with [`WalletAccountEvmErc4337`](../../../wallet-modules/wallet-evm-erc-4337/api-reference.md#walletaccountevmerc4337) and passing paymaster options to [`swap()`](../api-reference.md#swap-options-config):

{% code title="Swap with smart account and paymaster" lineNumbers="true" %}
```javascript
import { WalletAccountEvmErc4337 } from '@tetherto/wdk-wallet-evm-erc-4337'
import VeloraProtocolEvm from '@tetherto/wdk-protocol-swap-velora-evm'

const aa = new WalletAccountEvmErc4337(seedPhrase, "0'/0/0", {
  chainId: 42161,
  provider: 'https://arb1.arbitrum.io/rpc',
  bundlerUrl: process.env.BUNDLER_URL,
  paymasterUrl: process.env.PAYMASTER_URL
})

const swapAA = new VeloraProtocolEvm(aa, { swapMaxFee: 200000000000000n })

const result = await swapAA.swap({
  tokenIn: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  tokenOut: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  tokenInAmount: 1000000n
}, {
  paymasterToken: 'USDT',
  swapMaxFee: 200000000000000n
})

console.log('Swap hash:', result.hash)
console.log('Total fee (wei):', result.fee)
```
{% endcode %}

{% hint style="info" %}
Token addresses must match the chain your account uses (for example, mainnet USD₮ addresses differ from Arbitrum).
{% endhint %}

## Next Steps

- [Get swap quotes](get-swap-quotes.md) before sending
- [Handle errors](handle-errors.md)
- [Get started](get-started.md) if you still need setup
