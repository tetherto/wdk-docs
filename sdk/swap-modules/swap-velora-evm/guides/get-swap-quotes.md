---
title: Get Swap Quotes
description: Estimate fees and amounts with quoteSwap before executing a swap.
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

# Get Swap Quotes

This guide shows how to [quote before swapping](#quote-before-swapping) and use quotes for [fee estimation](#fee-estimation). Quotes use [`quoteSwap()`](/sdk/swap-modules/swap-velora-evm/api-reference/#quoteswap-options-config), which works with read-only accounts as well as signing accounts.

## Quote before swapping

You can preview fee and token amounts for the same parameters you would pass to [`swap()`](/sdk/swap-modules/swap-velora-evm/api-reference/#swap-options-config) using [`quoteSwap()`](/sdk/swap-modules/swap-velora-evm/api-reference/#quoteswap-options-config):

{% code title="Quote exact input swap" lineNumbers="true" %}
```javascript
const quote = await swapProtocol.quoteSwap({
  tokenIn: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  tokenOut: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  tokenInAmount: 1000000n
})

console.log('Estimated fee (wei):', quote.fee)
console.log('Tokens in (base units):', quote.tokenInAmount)
console.log('Tokens out (base units):', quote.tokenOutAmount)
```
{% endcode %}

You can quote an exact-output style trade the same way by passing `tokenOutAmount` instead of `tokenInAmount` to [`quoteSwap()`](/sdk/swap-modules/swap-velora-evm/api-reference/#quoteswap-options-config):

{% code title="Quote exact output swap" lineNumbers="true" %}
```javascript
const quote = await swapProtocol.quoteSwap({
  tokenIn: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  tokenOut: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  tokenOutAmount: 500000000000000000n
})

console.log('Estimated fee (wei):', quote.fee)
console.log('Required token in (base units):', quote.tokenInAmount)
```
{% endcode %}

## Fee estimation

You can read `quote.fee` from [`quoteSwap()`](/sdk/swap-modules/swap-velora-evm/api-reference/#quoteswap-options-config) as the estimated total swap fee in wei before calling [`swap()`](/sdk/swap-modules/swap-velora-evm/api-reference/#swap-options-config):

{% code title="Quote fee before deciding" lineNumbers="true" %}
```javascript
const quote = await swapProtocol.quoteSwap({
  tokenIn: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  tokenOut: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  tokenInAmount: 1000000n
})

const maxFee = 200000000000000n
console.log('Quoted fee (wei):', quote.fee, 'cap:', maxFee)
```
{% endcode %}

You can compare that estimate to `swapMaxFee` on [`VeloraProtocolEvm`](/sdk/swap-modules/swap-velora-evm/api-reference/#class-veloraprotocolevm) and only then call [`swap()`](/sdk/swap-modules/swap-velora-evm/api-reference/#swap-options-config) when the quote is within your cap:

{% code title="Swap when fee is under cap" lineNumbers="true" %}
```javascript
const maxFee = 200000000000000n
const quote = await swapProtocol.quoteSwap({
  tokenIn: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  tokenOut: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  tokenInAmount: 1000000n
})

if (quote.fee <= maxFee) {
  const result = await swapProtocol.swap({
    tokenIn: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    tokenOut: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    tokenInAmount: 1000000n
  })
  console.log('Swap hash:', result.hash)
}
```
{% endcode %}

{% hint style="info" %}
On-chain conditions can change between quote and execution. The executed [`swap()`](/sdk/swap-modules/swap-velora-evm/api-reference/#swap-options-config) may still differ slightly from the last [`quoteSwap()`](/sdk/swap-modules/swap-velora-evm/api-reference/#quoteswap-options-config) result.
{% endhint %}

## Next Steps

- [Execute swaps](/sdk/swap-modules/swap-velora-evm/guides/execute-swaps/)
- [Handle errors](/sdk/swap-modules/swap-velora-evm/guides/handle-errors/)
- [Get started](/sdk/swap-modules/swap-velora-evm/guides/get-started/)
