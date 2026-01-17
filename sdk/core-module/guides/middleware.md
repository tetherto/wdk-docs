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

> [!WARNING]
> **TODO:** The `@tetherto/wdk-wrapper-failover-cascade` package is currently unavailable in the registry. The section below is pending confirmation from the development team.

*(This feature is currently pending package release)*

<!-- TODO: Uncomment when package is available
One of the most powerful uses of middleware is adding redundancy to your RPC connections. If your primary provider goes down, the middleware can automatically switch to a backup.

### Using Cascade Failover

The `@tetherto/wdk-wrapper-failover-cascade` package provides a ready-to-use middleware for this.

{% code title="Failover Middleware" lineNumbers="true" %}
```typescript
import { getFailoverCascadeMiddleware } from '@tetherto/wdk-wrapper-failover-cascade'

wdk.registerMiddleware('ethereum', getFailoverCascadeMiddleware({
  retries: 3,
  delay: 1000, // Wait 1 second between retries
  fallbackProviders: [
    'https://backup-rpc-1.com',
    'https://backup-rpc-2.com'
  ]
}))
```
{% endcode %}

With this configuration, if `sendTransaction` fails due to a network error, the WDK will automatically retry using the fallback providers without throwing an error to your application.
-->

## Next steps

Learn about [error handling and best practices](./error-handling.md) to ensure your application is robust and secure.
