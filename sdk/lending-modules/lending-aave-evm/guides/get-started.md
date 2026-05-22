---
title: Get Started
description: Install the package, create AaveProtocolEvm, and review prerequisites.
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

This guide covers [installation](#installation), [creating the lending client](#create-the-lending-client), and [prerequisites](#prerequisites). Use [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) on your machine.

## Installation

Run the following to install [@tetherto/wdk-protocol-lending-aave-evm](https://www.npmjs.com/package/@tetherto/wdk-protocol-lending-aave-evm):

{% code title="Install with npm" lineNumbers="true" %}
```bash
npm install @tetherto/wdk-protocol-lending-aave-evm
```
{% endcode %}

## Create the lending client

You can attach Aave V3 actions to an EVM account from [`WalletAccountEvm`](/sdk/wallet-modules/wallet-evm/api-reference/#walletaccountevm) with [`new AaveProtocolEvm(account)`](/sdk/lending-modules/lending-aave-evm/api-reference/#constructor) on [`AaveProtocolEvm`](/sdk/lending-modules/lending-aave-evm/api-reference/#class-aaveprotocolevm):

{% code title="Create AaveProtocolEvm" lineNumbers="true" %}
```javascript
import AaveProtocolEvm from '@tetherto/wdk-protocol-lending-aave-evm'
import { WalletAccountEvm } from '@tetherto/wdk-wallet-evm'

const account = new WalletAccountEvm(seedPhrase, "0'/0/0", {
  provider: 'https://ethereum-rpc.publicnode.com'
})

const aave = new AaveProtocolEvm(account)
```
{% endcode %}

## Prerequisites

{% hint style="info" %}
**Token balance:** To supply or repay, hold the ERC-20 in the wallet. **Gas:** Keep native balance (ETH on Ethereum, and so on) for transaction fees unless you use sponsored ERC-4337 flows. **Networks:** This module targets mainnet deployments; confirm your RPC matches [supported networks](/sdk/lending-modules/lending-aave-evm/configuration/).
{% endhint %}

Use contract addresses for [Aave-supported reserves](https://aave.com/markets). On Ethereum mainnet, USD₮ uses `0xdAC17F958D2ee523a2206206994597C13D831ec7` (use `USDT` in code identifiers and literals).

## Next Steps

- [Lending operations](/sdk/lending-modules/lending-aave-evm/guides/lending-operations/)
- [Handle errors](/sdk/lending-modules/lending-aave-evm/guides/handle-errors/)
