---
title: Handle Errors
description: Catch swap failures, interpret common messages, and clean up sensitive state.
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

# Handle Errors

This guide covers [swap errors](#swap-errors), [quote errors](#quote-errors), and [best practices](#best-practices) for clearing wallet material after use.

## Swap errors

You can detect failed swaps by wrapping [`swap()`](../api-reference.md#swap-options-config) in `try/catch` and inspecting `error.message`:

{% code title="Handle swap failures" lineNumbers="true" %}
```javascript
try {
  const result = await swapProtocol.swap({
    tokenIn: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    tokenOut: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    tokenInAmount: 1000000n
  })
  console.log('Swap successful:', result.hash)
} catch (error) {
  console.error('Swap failed:', error.message)

  if (error.message.includes('liquidity')) {
    console.log('No route or insufficient liquidity for this pair')
  }
  if (error.message.includes('max fee')) {
    console.log('Swap fee exceeds swapMaxFee')
  }
  if (error.message.includes('read-only')) {
    console.log('Read-only account cannot swap')
  }
}
```
{% endcode %}

{% hint style="warning" %}
Match string fragments only as a convenience; production apps should prefer stable error codes from your runtime when available.
{% endhint %}

## Quote errors

You can handle failures from [`quoteSwap()`](../api-reference.md#quoteswap-options-config) the same way, including provider or routing errors:

{% code title="Handle quote failures" lineNumbers="true" %}
```javascript
try {
  const quote = await swapProtocol.quoteSwap({
    tokenIn: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    tokenOut: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    tokenInAmount: 1000000n
  })
  console.log('Quoted fee (wei):', quote.fee)
} catch (error) {
  console.error('Quote failed:', error.message)
}
```
{% endcode %}

Common causes are listed under [Errors](../api-reference.md#errors) in the API reference (liquidity, fee cap, read-only send attempts, RPC issues).

## Best Practices

You can clear signing material when a session ends by calling [`dispose()`](../../../wallet-modules/wallet-evm/api-reference.md#dispose-1) on each [`WalletAccountEvm`](../../../wallet-modules/wallet-evm/api-reference.md#walletaccountevm), or [`dispose()`](../../../wallet-modules/wallet-evm/api-reference.md#dispose) on [`WalletManagerEvm`](../../../wallet-modules/wallet-evm/api-reference.md#walletmanagerevm) if you use a manager:

{% code title="Dispose wallet accounts" lineNumbers="true" %}
```javascript
try {
  await swapProtocol.swap({
    tokenIn: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    tokenOut: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    tokenInAmount: 1000000n
  })
} finally {
  account.dispose()
}
```
{% endcode %}

If you use an ERC-4337 account, call [`dispose()`](../../../wallet-modules/wallet-evm-erc-4337/api-reference.md#dispose-1) on that account type per its API reference. Drop references to your [`VeloraProtocolEvm`](../api-reference.md#class-veloraprotocolevm) instance when you no longer need it.

## Next Steps

- [Get swap quotes](get-swap-quotes.md)
- [Execute swaps](execute-swaps.md)
- [API reference](../api-reference.md)
