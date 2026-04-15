---
title: Error Handling
description: Learn about common errors and best practices.
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

# Error Handling & Best Practices

This guide covers recommended patterns for error handling and security when using the WDK.

## Handling Common Errors

When interacting with multiple chains and protocols, various runtime issues may occur.

### Missing Registration

The most common error is attempting to access a wallet or protocol that hasn't been registered.

{% code title="Check Registration Pattern" lineNumbers="true" %}
```typescript
try {
  // This will throw if 'tron' was never registered via .registerWallet()
  const tronAccount = await wdk.getAccount('tron', 0)
} catch (error) {
  console.error('Tron wallet not available:', error.message)
}
```
{% endcode %}

{% hint style="tip" %}
Always use `try/catch` blocks when initializing sessions or accessing dynamic features.
{% endhint %}

## Memory Management

For security, clear sensitive data from memory when a session is complete. The WDK provides [`dispose()`](../api-reference.md#disposeblockchains) for this purpose.

### Disposing the Instance

You can clear every registered wallet using [`dispose()`](../api-reference.md#disposeblockchains):

{% code title="Dispose WDK" lineNumbers="true" %}
```typescript
function endSession(wdk) {
  // 1. Clean up sensitive data
  wdk.dispose()
  
  // 2. Modify app state to reflect logged-out status
  // ...
  
  console.log('Session ended, wallet data cleared.')
}
```
{% endcode %}

### Disposing Specific Wallets

You can dispose only the wallets you no longer need using [`dispose()`](../api-reference.md#disposeblockchains):

{% code title="Dispose Specific Wallets" lineNumbers="true" %}
```typescript
// Keep the TON wallet registered, but dispose the Ethereum wallet
wdk.dispose(['ethereum'])
```
{% endcode %}

{% hint style="warning" %}
**After Disposal:** Once a wallet is disposed, any later call that depends on that wallet registration will fail until you register it again. If you call `wdk.dispose()` without arguments, you must instantiate a new WDK instance or register fresh wallets before resuming operations.
{% endhint %}

## Security Best Practices

### Environment Variables

Never hardcode API keys or seed phrases in your source code. Use environment variables (e.g., `process.env.TON_API_KEY`).

### Secure Storage

If you persist a session, never store the raw seed phrase in local storage. Use secure operating system storage (like Keychain on macOS or Keystore on Android).
