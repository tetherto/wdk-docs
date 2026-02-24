---
title: Configure Middleware
description: Learn how to intercept and enhance wallet operations with middleware.
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

# Configure Middleware

Middleware allows you to intercept wallet operations. You can use this to add [logging](#logging), implement retry logic, or handle [failovers for RPC providers](#failover-protection-with-provider-failover).

## Register Middleware

When registering middleware, you should reference a specific chain. The middleware function runs every time an account is instantiated or an operation is performed, depending on the implementation.

### Logging

This simple middleware logs a message whenever a new account is accessed.

{% code title="Logging Middleware" lineNumbers="true" %}
```typescript
wdk.registerMiddleware('ethereum', async (account) => {
  const address = await account.getAddress()
  console.log('Accessed Ethereum account:', address)
  
  // You can also attach custom properties or wrap methods here
})
```
{% endcode %}

## Failover Protection with Provider Failover

The [`@tetherto/wdk-provider-failover`](https://www.npmjs.com/package/@tetherto/wdk-provider-failover) package provides a resilient wrapper for wallet instances. Unlike standard middleware, you wrap your wallet class instantiation directly.

### Install `@tetherto/wdk-provider-failover`

You can install the `@tetherto/wdk-provider-failover` using npm with the following command:

```bash
npm install @tetherto/wdk-provider-failover
```

### Use `createFallbackWallet`

You can import the `createFallbackWallet` function to ensure that if your primary RPC fails, the wallet automatically retries with the fallback providers.

With this configuration, if `sendTransaction` fails due to a network error, the WDK will automatically retry using the fallback providers without throwing an error to your application.

{% code title="Failover Wrapper Usage" lineNumbers="true" %}
```typescript
import { createFallbackWallet } from '@tetherto/wdk-provider-failover'
import { WalletAccountReadOnlyEvm } from '@tetherto/wdk-wallet-evm'

const wallet = createFallbackWallet(
  WalletAccountReadOnlyEvm,
  ['0x...'], // constructor args
  {
    primary: { provider: 'https://eth.drpc.org' },
    fallbacks: [
      { provider: 'https://eth.llamarpc.com' },
      { provider: 'https://ethereum.publicnode.com' }
    ]
  }
)

// Use the wallet instance directly
const balance = await wallet.getBalance()
```
{% endcode %}

## Next Steps

Learn about [error handling and best practices](./error-handling.md) to ensure your application is robust and secure.
