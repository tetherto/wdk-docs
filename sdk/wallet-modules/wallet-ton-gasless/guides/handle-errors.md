---
title: Handle Errors
description: Handle errors, manage fees, and dispose of sensitive data in gasless TON wallets.
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

This guide covers how to [handle gasless transfer errors](#handle-gasless-transfer-errors) and [handle unsupported native TON sends](#handle-unsupported-native-ton-sends), plus [best practices](#best-practices) for fee management and memory cleanup.

## Handle Gasless Transfer Errors

Gasless transfers can fail for reasons specific to the paymaster model. Wrap calls to [`account.transfer()`](../api-reference.md#transfer-options-config) in `try/catch` blocks:

{% code title="Gasless Transfer Error Handling" lineNumbers="true" %}
```javascript
try {
  const result = await account.transfer({
    token: 'EQ...',
    recipient: 'EQ...',
    amount: 1000000000
  })
  console.log('Transfer hash:', result.hash)
} catch (error) {
  if (error.message.includes('insufficient jetton balance')) {
    console.error('Please add more Jetton tokens to your wallet')
  } else if (error.message.includes('insufficient paymaster balance')) {
    console.error('Please add more paymaster tokens for gas fees')
  } else if (error.message.includes('invalid address')) {
    console.error('The recipient address is invalid')
  } else if (error.message.includes('max fee')) {
    console.error('The transfer fee exceeds your configured maximum')
  } else if (error.message.includes('Failed to parse error response')) {
    console.error('TON API returned an unexpected error response. Check tonApiClient.url and account initialization.')
  } else {
    console.error('Transfer failed:', error.message)
  }
}
```
{% endcode %}

## Handle Unsupported Native TON Sends

Native TON transactions are not supported by `@tetherto/wdk-wallet-ton-gasless`. Calling [`account.sendTransaction()`](../api-reference.md#sendtransaction-tx) throws:

{% code title="Unsupported Native TON Send" lineNumbers="true" %}
```javascript
try {
  await account.sendTransaction({
    to: 'EQ...',
    value: 1000000000
  })
} catch (error) {
  console.error(error.message)
  // Method 'sendTransaction(tx)' not supported on ton gasless.
}
```
{% endcode %}

Use `@tetherto/wdk-wallet-ton` when you need to send native TON.

## Best Practices

### Manage Fee Limits

Set `transferMaxFee` when creating the wallet to prevent gasless transfers from exceeding a maximum cost. You can retrieve current network rates using [`wallet.getFeeRates()`](../api-reference.md#getfeerates):

{% code title="Fee Management" lineNumbers="true" %}
```javascript
const feeRates = await wallet.getFeeRates()
console.log('Normal fee rate:', feeRates.normal, 'nanotons')
console.log('Fast fee rate:', feeRates.fast, 'nanotons')
```
{% endcode %}

### Dispose of Sensitive Data

Call [`dispose()`](../api-reference.md#dispose) on accounts and wallet managers to clear private keys and sensitive data from memory when they are no longer needed:

{% code title="Memory Cleanup" lineNumbers="true" %}
```javascript
account.dispose()

wallet.dispose()
```
{% endcode %}

{% hint style="warning" %}
Always call [`dispose()`](../api-reference.md#dispose) in a `finally` block or cleanup handler to ensure sensitive data is cleared even if an error occurs.
{% endhint %}
