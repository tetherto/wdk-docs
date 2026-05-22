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

You can catch failures from [`supply()`](/sdk/lending-modules/lending-aave-evm/api-reference/#supply-options-config), [`withdraw()`](/sdk/lending-modules/lending-aave-evm/api-reference/#withdraw-options-config), [`borrow()`](/sdk/lending-modules/lending-aave-evm/api-reference/#borrow-options-config), and [`repay()`](/sdk/lending-modules/lending-aave-evm/api-reference/#repay-options-config) with `try/catch`:

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

You can isolate quote failures from [`quoteSupply()`](/sdk/lending-modules/lending-aave-evm/api-reference/#quotesupply-options-config) (or the other `quote*` methods) when you only need an estimate:

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
See [Rules & Notes](/sdk/lending-modules/lending-aave-evm/api-reference/#rules-notes) for address and amount validation expectations.
{% endhint %}

## Best Practices

You can wipe private keys after lending work by calling [`dispose()`](/sdk/wallet-modules/wallet-evm/api-reference/#dispose-1) on [`WalletAccountEvm`](/sdk/wallet-modules/wallet-evm/api-reference/#walletaccountevm), or [`dispose()`](/sdk/wallet-modules/wallet-evm/api-reference/#dispose) on [`WalletManagerEvm`](/sdk/wallet-modules/wallet-evm/api-reference/#walletmanagerevm):

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

For ERC-4337 accounts, use [`dispose()`](/sdk/wallet-modules/wallet-evm-erc-4337/api-reference/#dispose-1) on the smart-account type. Clear references to [`AaveProtocolEvm`](/sdk/lending-modules/lending-aave-evm/api-reference/#class-aaveprotocolevm) when the session ends.

## Next Steps

- [Lending operations](/sdk/lending-modules/lending-aave-evm/guides/lending-operations/)
- [Get started](/sdk/lending-modules/lending-aave-evm/guides/get-started/)
- [API reference](/sdk/lending-modules/lending-aave-evm/api-reference/)
