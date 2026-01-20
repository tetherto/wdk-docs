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

Middleware allows you to intercept wallet operations. You can use this to add logging, implement retry logic, or handle failovers for RPC providers.

## Register Middleware

Reference a specific chain when registering middleware. The middleware function runs every time an account is instantiated or an operation is performed, depending on the implementation.

### Example: Logging

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

## Failover Protection


### Using Provider Failover

The `@tetherto/wdk-provider-failover` package provides a resilient wrapper for wallet instances. Unlike standard middleware, you wrap your wallet class instantiation directly.

```bash
npm install @tetherto/wdk-provider-failover
```

{% code title="Failover Wrapper Usage" lineNumbers="true" %}
```typescript
import { createFallbackWallet } from '@tetherto/wdk-provider-failover'
import { WalletAccountReadOnlyEvm } from '@tetherto/wdk-wallet-evm'

const wallet = createFallbackWallet(
  WalletAccountReadOnlyEvm,
  ['0x...'], // constructor args
  {
    primary: { provider: 'https://mainnet.infura.io/v3/YOUR_KEY' },
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

This wrapper ensures that if your primary RPC fails, the wallet automatically retries with the fallback providers.

With this configuration, if `sendTransaction` fails due to a network error, the WDK will automatically retry using the fallback providers without throwing an error to your application.

## Next steps

Learn about [error handling and best practices](./error-handling.md) to ensure your application is robust and secure.
