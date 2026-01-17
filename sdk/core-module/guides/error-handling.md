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

Always use `try/catch` blocks when initializing sessions or accessing dynamic features.

## Memory Management

For security, you should clear sensitive data from memory when a session is complete. The WDK provided a `.dispose()` method for this purpose.

### Disposing the Instance

Calling `dispose()` clears the seed phrase and private keys derived in memory.

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

> [!WARNING]
> **After Disposal:** Once disposed, any attempt to use the `wdk` instance or its derived accounts will result in an error. You must inspect a new instance to resume operations.

## Security Best Practices

*   **Environment Variables:** Never hardcode API keys or seed phrases in your source code. Use environment variables (e.g., `process.env.TON_API_KEY`).
*   **Secure Storage:** If persisting a session, never store the raw seed phrase in local storage. Use secure operating system storage (like Keychain on macOS or Keystore on Android).
