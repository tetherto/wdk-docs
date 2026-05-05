---
title: Bridge with ERC-4337
description: Gasless USD₮0 bridging using WalletAccountEvmErc4337 and paymaster options.
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

# Bridge with ERC-4337

This guide covers [prerequisites](#prerequisites), how to [create an ERC-4337 account](#create-a-walletaccountevmerc4337-account), and how to [call the bridge with paymaster configuration](#run-a-gasless-bridge-with-paymaster-options).

## Prerequisites

* `@tetherto/wdk-wallet-evm-erc-4337` installed alongside [@tetherto/wdk-protocol-bridge-usdt0-evm](https://www.npmjs.com/package/@tetherto/wdk-protocol-bridge-usdt0-evm).
* Bundler and paymaster endpoints for your chain (example uses Arbitrum public URLs from the API reference).

## Create a WalletAccountEvmErc4337 account

You can construct an ERC-4337 signing account using [`new WalletAccountEvmErc4337(seed, path, config)`](../../../wallet-modules/wallet-evm-erc-4337/api-reference.md#constructor-1) with chain, provider, bundler, entry point, and paymaster settings:

{% code title="ERC-4337 account on Arbitrum" lineNumbers="true" %}
```javascript
import { WalletAccountEvmErc4337 } from '@tetherto/wdk-wallet-evm-erc-4337'

const seedPhrase = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'

const account = new WalletAccountEvmErc4337(seedPhrase, "0'/0/0", {
  chainId: 42161,
  provider: 'https://arb1.arbitrum.io/rpc',
  bundlerUrl: 'https://api.candide.dev/public/v3/arbitrum',
  entryPointAddress: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
  safeModulesVersion: '0.3.0',
  paymasterUrl: 'https://api.candide.dev/public/v3/arbitrum',
  paymasterAddress: '0x8b1f6cb5d062aa2ce8d581942bbb960420d875ba',
  paymasterToken: { address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9' }
})
```
{% endcode %}

You can wrap that account with the [`new Usdt0ProtocolEvm(account, config?)`](../api-reference.md#constructor) constructor:

{% code title="Usdt0ProtocolEvm with ERC-4337 account" lineNumbers="true" %}
```javascript
import Usdt0ProtocolEvm from '@tetherto/wdk-protocol-bridge-usdt0-evm'

const bridgeProtocol = new Usdt0ProtocolEvm(account, {
  bridgeMaxFee: 1000000000000000n
})
```
{% endcode %}

## Run a gasless bridge with paymaster options

You can execute [`bridge()`](../api-reference.md#bridge-options-config) with a second argument that includes `paymasterToken` (and optional `bridgeMaxFee` override) as described in the [methods table](../api-reference.md#methods). Approve the source-chain bridge spender first, then call [`bridge()`](../api-reference.md#bridge-options-config). Each call returns one hash for the submitted user operation.

{% code title="Gasless bridge with paymasterToken" lineNumbers="true" %}
```javascript
const USDT_TOKEN_ADDRESS = '0xdac17f958d2ee523a2206206994597c13d831ec7'
const USDT0_OFT_ADDRESS = process.env.USDT0_OFT_ADDRESS
const amount = 1000000n
const paymasterToken = { address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9' }

await account.approve({
  token: USDT_TOKEN_ADDRESS,
  spender: USDT0_OFT_ADDRESS,
  amount
}, {
  paymasterToken
})

const result = await bridgeProtocol.bridge(
  {
    targetChain: 'polygon',
    recipient: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    token: USDT_TOKEN_ADDRESS,
    amount,
    oftContractAddress: USDT0_OFT_ADDRESS
  },
  {
    paymasterToken,
    bridgeMaxFee: 1000000000000000n
  }
)

console.log('Bridge hash:', result.hash)
console.log('Total fee:', result.fee)
console.log('Bridge fee:', result.bridgeFee)
```
{% endcode %}

{% hint style="info" %}
The approval and bridge calls are separate user operations. Persist both hashes if your app needs to audit the complete flow.
{% endhint %}

{% hint style="warning" %}
Paymaster policies, token addresses, and URLs are service-specific. Confirm supported tokens and networks with your bundler or paymaster provider before production use.
{% endhint %}

## Next Steps

Bridge to non-EVM chains in [Bridge cross-ecosystem](./bridge-cross-ecosystem.md). For failure modes and cleanup, read [Handle errors](./handle-errors.md).
