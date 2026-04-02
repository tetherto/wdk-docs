---
title: Get Started
description: Install the package, create VeloraProtocolEvm, and learn supported networks.
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

# Get Started

This guide covers [installation](#installation), [create the swap protocol](#create-the-swap-protocol), and [supported networks](#supported-networks). You need [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) to follow along.

## Installation

Run the following to install [@tetherto/wdk-protocol-swap-velora-evm](https://www.npmjs.com/package/@tetherto/wdk-protocol-swap-velora-evm):

{% code title="Install with npm" lineNumbers="true" %}
```bash
npm install @tetherto/wdk-protocol-swap-velora-evm
```
{% endcode %}

{% hint style="info" %}
You also need an EVM wallet account from [`@tetherto/wdk-wallet-evm`](https://www.npmjs.com/package/@tetherto/wdk-wallet-evm) (or an ERC-4337 account from [`@tetherto/wdk-wallet-evm-erc-4337`](https://www.npmjs.com/package/@tetherto/wdk-wallet-evm-erc-4337)) on the same chain as your RPC provider.
{% endhint %}

## Create the swap protocol

You can construct a swap client with [`new VeloraProtocolEvm(account, config?)`](../api-reference.md#constructor) on top of [`VeloraProtocolEvm`](../api-reference.md#class-veloraprotocolevm):

{% code title="Create VeloraProtocolEvm" lineNumbers="true" %}
```javascript
import VeloraProtocolEvm from '@tetherto/wdk-protocol-swap-velora-evm'
import { WalletAccountEvm } from '@tetherto/wdk-wallet-evm'

const account = new WalletAccountEvm(seedPhrase, "0'/0/0", {
  provider: 'https://ethereum-rpc.publicnode.com'
})

const swapProtocol = new VeloraProtocolEvm(account, {
  swapMaxFee: 200000000000000n
})
```
{% endcode %}

Optional `swapMaxFee` caps the total gas fee in wei for swaps. See [configuration](../configuration.md) for environment-specific settings.

## Supported networks

Velora routing works on EVM networks the aggregator supports, including **Ethereum**, **Polygon**, **Arbitrum**, and other chains where Velora exposes liquidity. Use an RPC endpoint for the network your [`WalletAccountEvm`](../../../wallet-modules/wallet-evm/api-reference.md#walletaccountevm) is configured for so [`swap()`](../api-reference.md#swap-options-config) and [`quoteSwap()`](../api-reference.md#quoteswap-options-config) target the correct chain.

## Next Steps

- [Execute swaps](execute-swaps.md)
- [Get swap quotes](get-swap-quotes.md)
- [Handle errors](handle-errors.md)
