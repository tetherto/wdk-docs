---
title: Bridge Cross-Ecosystem
description: Send USD₮0 from EVM toward Solana, TON, or TRON recipients.
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

# Bridge Cross-Ecosystem

This guide covers [prerequisites](#prerequisites) and how to [bridge to Solana](#bridge-to-solana), [bridge to TON](#bridge-to-ton), and [bridge to TRON](#bridge-to-tron) using [`bridge()`](../api-reference.md#bridge-options-config). The same [`Usdt0ProtocolEvm`](../api-reference.md#usdt0protocolevm) instance you use for EVM destinations applies; only `targetChain` and `recipient` formats change.

## Prerequisites

A [`Usdt0ProtocolEvm`](../api-reference.md#usdt0protocolevm) backed by a non-read-only EVM account, with enough USD₮ (and native gas for non-4337 accounts) on the source chain. Approve the source-chain bridge spender before calling [`bridge()`](../api-reference.md#bridge-options-config). Recipient strings must match each network’s address encoding.

## Bridge to Solana

You can set `targetChain` to `solana` and pass a base58 Solana address as `recipient` when calling [`bridge()`](../api-reference.md#bridge-options-config):

{% code title="Bridge toward Solana" lineNumbers="true" %}
```javascript
const USDT_TOKEN_ADDRESS = '0xdac17f958d2ee523a2206206994597c13d831ec7'
const USDT_BRIDGE_SPENDER_ADDRESS = process.env.USDT0_BRIDGE_SPENDER_ADDRESS
const amount = 1000000n

await account.approve({
  token: USDT_TOKEN_ADDRESS,
  spender: USDT_BRIDGE_SPENDER_ADDRESS,
  amount
})

const solanaResult = await bridgeProtocol.bridge({
  targetChain: 'solana',
  recipient: 'HyXJcgYpURfDhgzuyRL7zxP4FhLg7LZQMeDrR4MXZcMN',
  token: USDT_TOKEN_ADDRESS,
  amount,
  oftContractAddress: USDT_BRIDGE_SPENDER_ADDRESS
})

console.log('Solana bridge hash:', solanaResult.hash)
console.log('Bridge fee:', solanaResult.bridgeFee)
```
{% endcode %}

{% hint style="warning" %}
Validate Solana addresses (length and base58 alphabet) before bridging. A malformed `recipient` fails the operation.
{% endhint %}

## Bridge to TON

You can set `targetChain` to `ton` and supply a TON user-friendly or raw address string as `recipient` in [`bridge()`](../api-reference.md#bridge-options-config):

{% code title="Bridge toward TON" lineNumbers="true" %}
```javascript
const USDT_TOKEN_ADDRESS = '0xdac17f958d2ee523a2206206994597c13d831ec7'
const USDT_BRIDGE_SPENDER_ADDRESS = process.env.USDT0_BRIDGE_SPENDER_ADDRESS
const amount = 1000000n

await account.approve({
  token: USDT_TOKEN_ADDRESS,
  spender: USDT_BRIDGE_SPENDER_ADDRESS,
  amount
})

const tonResult = await bridgeProtocol.bridge({
  targetChain: 'ton',
  recipient: 'EQAd31gAUhdO0d0NZsNb_cGl_Maa9PSuNhVLE9z8bBSjX6Gq',
  token: USDT_TOKEN_ADDRESS,
  amount,
  oftContractAddress: USDT_BRIDGE_SPENDER_ADDRESS
})

console.log('TON bridge hash:', tonResult.hash)
```
{% endcode %}

## Bridge to TRON

You can set `targetChain` to `tron` and pass a base58Check TRON address (typically starting with `T`) to [`bridge()`](../api-reference.md#bridge-options-config):

{% code title="Bridge toward TRON" lineNumbers="true" %}
```javascript
const USDT_TOKEN_ADDRESS = '0xdac17f958d2ee523a2206206994597c13d831ec7'
const USDT_BRIDGE_SPENDER_ADDRESS = process.env.USDT0_BRIDGE_SPENDER_ADDRESS
const amount = 1000000n

await account.approve({
  token: USDT_TOKEN_ADDRESS,
  spender: USDT_BRIDGE_SPENDER_ADDRESS,
  amount
})

const tronResult = await bridgeProtocol.bridge({
  targetChain: 'tron',
  recipient: 'TFG4wBaDQ8sHWWP1ACeSGnoNR6RRzevLPt',
  token: USDT_TOKEN_ADDRESS,
  amount,
  oftContractAddress: USDT_BRIDGE_SPENDER_ADDRESS
})

console.log('TRON bridge hash:', tronResult.hash)
```
{% endcode %}

{% hint style="info" %}
LayerZero endpoint IDs for these destinations are listed under [Supported chains](../api-reference.md#supported-chains) in the API reference.
{% endhint %}

## Next Steps

Harden integrations with [Handle errors](./handle-errors.md), or return to [Bridge tokens](./bridge-tokens.md) for EVM-only flows and quotes.
