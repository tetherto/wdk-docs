---
title: Bridge Tokens
description: EVM-to-EVM bridging, quotes, fee caps, and optional OFT or endpoint overrides.
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

# Bridge Tokens

This guide covers [prerequisites](#prerequisites), how to [run a standard EVM-to-EVM bridge](#run-a-standard-evm-to-evm-bridge), [quote bridge fees](#quote-bridge-fees), [override OFT routing](#override-oft-contract-and-destination-endpoint), and [set `bridgeMaxFee`](#cap-fees-with-bridgemaxfee) on the protocol.

## Prerequisites

Complete [Get Started](./get-started.md): an account from [`new WalletAccountEvm(seed, path, config?)`](../../../wallet-modules/wallet-evm/api-reference.md#constructor-1) and a bridge from [`new Usdt0ProtocolEvm(account, config?)`](../api-reference.md#constructor). The source chain RPC must match the account network.

Before calling [`bridge()`](../api-reference.md#bridge-options-config), approve the source-chain bridge spender for the token and amount you want to bridge. If you pass `oftContractAddress`, use the same address as the approval `spender`.

For placeholder values such as `USDT0_OFT_ADDRESS`, use the current token and bridge contract addresses from the [USDT0 deployments](https://docs.usdt0.to/technical-documentation/deployments). For the route mapping used by the WDK package, see the package [`src/config.js`](https://github.com/tetherto/wdk-protocol-bridge-usdt0-evm/blob/main/src/config.js), especially `oftContract`, `legacyMeshContract`, and `xautOftContract`.

## Run a standard EVM-to-EVM bridge

You can move USD₮ on the source chain toward another EVM chain by calling [`bridge()`](../api-reference.md#bridge-options-config) with `targetChain`, `recipient`, `token`, and `amount` (token base units). Amount `1000000n` is 1 USD₮ when the token uses 6 decimals.

{% code title="Standard EVM bridge" lineNumbers="true" %}
```javascript
const USDT_TOKEN_ADDRESS = '0xdac17f958d2ee523a2206206994597c13d831ec7'
const USDT0_OFT_ADDRESS = process.env.USDT0_OFT_ADDRESS
const amount = 1000000n

await account.approve({
  token: USDT_TOKEN_ADDRESS,
  spender: USDT0_OFT_ADDRESS,
  amount
})

const result = await bridgeProtocol.bridge({
  targetChain: 'arbitrum',
  recipient: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  token: USDT_TOKEN_ADDRESS,
  amount,
  oftContractAddress: USDT0_OFT_ADDRESS
})

console.log('Bridge transaction hash:', result.hash)
console.log('Total fee:', result.fee, 'wei')
console.log('Bridge fee:', result.bridgeFee, 'wei')
```
{% endcode %}

{% hint style="warning" %}
`bridge()` does not approve token allowance for you. Use a bounded approval for the bridge amount rather than an unlimited allowance.
{% endhint %}

## Quote bridge fees

You can estimate gas and protocol fees without sending transactions using [`quoteBridge()`](../api-reference.md#quotebridge-options-config):

{% code title="Quote before bridging" lineNumbers="true" %}
```javascript
const quote = await bridgeProtocol.quoteBridge({
  targetChain: 'polygon',
  recipient: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  token: '0xdac17f958d2ee523a2206206994597c13d831ec7',
  amount: 1000000n
})

console.log('Estimated fee:', quote.fee, 'wei')
console.log('Bridge fee:', quote.bridgeFee, 'wei')
```
{% endcode %}

Compare `quote.fee` and `quote.bridgeFee` to your risk limits before calling [`bridge()`](../api-reference.md#bridge-options-config).

{% hint style="info" %}
Some providers estimate the bridge transaction during [`quoteBridge()`](../api-reference.md#quotebridge-options-config). If the estimate fails because allowance is missing, approve the same `token`, `spender`, and `amount` before quoting.
{% endhint %}

## Override OFT contract and destination endpoint

You can point [`bridge()`](../api-reference.md#bridge-options-config) at a specific OFT contract and LayerZero destination endpoint ID when auto-resolution is not enough. Supply values from your deployment or integration configuration (environment variables shown for illustration):

{% code title="Custom OFT and dstEid on bridge" lineNumbers="true" %}
```javascript
const USDT_TOKEN_ADDRESS = '0xdac17f958d2ee523a2206206994597c13d831ec7'
const USDT0_OFT_ADDRESS = process.env.USDT0_OFT_ADDRESS
const amount = 1000000n

await account.approve({
  token: USDT_TOKEN_ADDRESS,
  spender: USDT0_OFT_ADDRESS,
  amount
})

const result = await bridgeProtocol.bridge({
  targetChain: 'arbitrum',
  recipient: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  token: USDT_TOKEN_ADDRESS,
  amount,
  oftContractAddress: USDT0_OFT_ADDRESS,
  dstEid: Number(process.env.CUSTOM_DST_EID)
})

console.log('Bridge transaction hash:', result.hash)
```
{% endcode %}

You can obtain matching fee estimates with [`quoteBridge()`](../api-reference.md#quotebridge-options-config) using the same `oftContractAddress` and `dstEid` fields:

{% code title="Quote with OFT overrides" lineNumbers="true" %}
```javascript
const customQuote = await bridgeProtocol.quoteBridge({
  targetChain: 'arbitrum',
  recipient: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  token: '0xdac17f958d2ee523a2206206994597c13d831ec7',
  amount: 1000000n,
  oftContractAddress: process.env.USDT0_OFT_ADDRESS,
  dstEid: Number(process.env.CUSTOM_DST_EID)
})

console.log('Custom route quote fee:', customQuote.fee, 'wei')
```
{% endcode %}

{% hint style="info" %}
Invalid pairings of `oftContractAddress` and `dstEid` fail at execution time. Validate addresses and endpoint IDs against LayerZero and your token deployment.
{% endhint %}

## Cap fees with bridgeMaxFee

You can pass `bridgeMaxFee` into the [`new Usdt0ProtocolEvm(account, config?)`](../api-reference.md#constructor) constructor so [`bridge()`](../api-reference.md#bridge-options-config) rejects operations whose cost exceeds the cap:

{% code title="Protocol-level bridgeMaxFee" lineNumbers="true" %}
```javascript
import Usdt0ProtocolEvm from '@tetherto/wdk-protocol-bridge-usdt0-evm'

const cappedBridge = new Usdt0ProtocolEvm(account, {
  bridgeMaxFee: 1000000000000000n
})
```
{% endcode %}

{% hint style="warning" %}
If the quote exceeds `bridgeMaxFee`, [`bridge()`](../api-reference.md#bridge-options-config) throws (for example when the message includes `Exceeded maximum fee`). ERC-4337 accounts can also pass `bridgeMaxFee` in the second argument to [`bridge()`](../api-reference.md#bridge-options-config); see [Bridge with ERC-4337](./bridge-with-4337.md).
{% endhint %}

## Next Steps

Bridge to Solana, TON, or TRON in [Bridge cross-ecosystem](./bridge-cross-ecosystem.md), or switch to a smart account in [Bridge with ERC-4337](./bridge-with-4337.md).
