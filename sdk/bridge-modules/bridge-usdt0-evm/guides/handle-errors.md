---
title: Handle Errors
description: Catch bridge failures, interpret messages, and dispose of signing accounts safely.
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

This guide describes [errors thrown by the bridge](#errors-from-the-bridge-protocol), [how to catch and branch on messages](#catch-and-branch-on-error-messages), and [best practices](#best-practices) for clearing sensitive material from memory.

## Errors from the bridge protocol

Calls to [`bridge()`](../api-reference.md#bridge-options-config) and [`quoteBridge()`](../api-reference.md#quotebridge-options-config) throw when the account is read-only, no provider is configured, the route is invalid, fees exceed [`bridgeMaxFee`](../api-reference.md#bridgeprotocolconfig), or the destination matches the source chain. The [API reference](../api-reference.md#error-handling) lists representative `error.message` substrings.

## Catch and branch on error messages

You can wrap [`bridge()`](../api-reference.md#bridge-options-config) in `try/catch` and inspect `error.message` for stable substrings:

{% code title="Handle bridge errors" lineNumbers="true" %}
```javascript
try {
  const result = await bridgeProtocol.bridge({
    targetChain: 'arbitrum',
    recipient: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    token: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    amount: 1000000n
  })
  console.log('Bridge successful:', result.hash)
} catch (error) {
  console.error('Bridge failed:', error.message)

  if (error.message.includes('not supported')) {
    console.error('Chain or token not supported')
  }
  if (error.message.includes('Exceeded maximum fee')) {
    console.error('Bridge fee above bridgeMaxFee')
  }
  if (error.message.includes('insufficient funds')) {
    console.error('Not enough tokens or gas')
  }
  if (error.message.includes('must be connected to a provider')) {
    console.error('Wallet not connected to blockchain')
  }
  if (
    error.message.includes(
      'requires the protocol to be initialized with a non read-only account'
    )
  ) {
    console.error('Cannot bridge with read-only account')
  }
  if (error.message.includes('cannot be equal to the source chain')) {
    console.error('Source and destination chain must differ')
  }
}
```
{% endcode %}

{% hint style="info" %}
Prefer [`quoteBridge()`](../api-reference.md#quotebridge-options-config) before [`bridge()`](../api-reference.md#bridge-options-config) when you want to fail early on fee or route issues without broadcasting.
{% endhint %}

## Best practices

You can clear private key material from memory when a session ends by calling [`account.dispose()`](../../../wallet-modules/wallet-evm/api-reference.md#dispose-1) on [`WalletAccountEvm`](../../../wallet-modules/wallet-evm/api-reference.md#walletaccountevm), or [`account.dispose()`](../../../wallet-modules/wallet-evm-erc-4337/api-reference.md#dispose-1) on [`WalletAccountEvmErc4337`](../../../wallet-modules/wallet-evm-erc-4337/api-reference.md#walletaccountevmerc4337):

{% code title="Dispose EVM account after use" lineNumbers="true" %}
```javascript
account.dispose()
```
{% endcode %}

{% hint style="warning" %}
Call dispose only when you no longer need signing for that account instance. Create a new account object for later sessions.
{% endhint %}

Combine quoting, fee caps via [`new Usdt0ProtocolEvm(account, config?)`](../api-reference.md#constructor), and user-facing validation of `targetChain` and `recipient` to reduce avoidable failures.

## Next Steps

Review configuration defaults in [WDK Bridge USD₮0 EVM Protocol Configuration](../configuration.md) or return to [Get Started](./get-started.md) for setup.
