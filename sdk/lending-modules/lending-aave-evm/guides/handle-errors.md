---
title: Handle Errors
description: Catch lending failures and release wallet secrets safely.
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

This guide explains how to [handle operation errors](#operation-errors) and follow [best practices](#best-practices) for disposing wallet state.

## Operation errors

You can catch failures from [`supply()`](../api-reference.md#supply-options-config), [`withdraw()`](../api-reference.md#withdraw-options-config), [`borrow()`](../api-reference.md#borrow-options-config), and [`repay()`](../api-reference.md#repay-options-config) with `try/catch`:

{% code title="Handle a failed supply" lineNumbers="true" %}
```javascript
try {
  await aave.supply({
    token: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    amount: 0n
  })
} catch (e) {
  console.error('Lending failed:', e.message)
  if (e.message.includes('zero')) {
    console.log('Amount must be greater than zero')
  }
}
```
{% endcode %}

You can isolate quote failures from [`quoteSupply()`](../api-reference.md#quotesupply-options-config) (or the other `quote*` methods) when you only need an estimate:

{% code title="Handle quote errors" lineNumbers="true" %}
```javascript
try {
  const q = await aave.quoteBorrow({
    token: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    amount: 1000000n
  })
  console.log('Borrow fee (wei):', q.fee)
} catch (e) {
  console.error('Quote failed:', e.message)
}
```
{% endcode %}

{% hint style="info" %}
See [Rules & Notes](../api-reference.md#rules-notes) for address and amount validation expectations.
{% endhint %}

## Best Practices

You can wipe private keys after lending work by calling [`dispose()`](../../../wallet-modules/wallet-evm/api-reference.md#dispose-1) on [`WalletAccountEvm`](../../../wallet-modules/wallet-evm/api-reference.md#walletaccountevm), or [`dispose()`](../../../wallet-modules/wallet-evm/api-reference.md#dispose) on [`WalletManagerEvm`](../../../wallet-modules/wallet-evm/api-reference.md#walletmanagerevm):

{% code title="Dispose after lending session" lineNumbers="true" %}
```javascript
try {
  await aave.supply({
    token: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    amount: 1000000n
  })
} finally {
  account.dispose()
}
```
{% endcode %}

For ERC-4337 accounts, use [`dispose()`](../../../wallet-modules/wallet-evm-erc-4337/api-reference.md#dispose-1) on the smart-account type. Clear references to [`AaveProtocolEvm`](../api-reference.md#class-aaveprotocolevm) when the session ends.

## Next Steps

- [Lending operations](lending-operations.md)
- [Get started](get-started.md)
- [API reference](../api-reference.md)
