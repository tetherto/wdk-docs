---
title: Integrate Protocols
description: Learn how to use Swaps, Bridges, and Lending protocols.
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

# Integrate Protocols

The WDK Core module supports registering external protocols. This allows you to extend the basic wallet functionality with advanced features like token swapping, cross-chain bridging, and lending, all through a unified interface.

## Register Protocols

You can register protocols in two ways: globally (for all new accounts) or locally (for a specific existing account).

### Global Registration (Recommended)

Global registration ensures that every account you retrieve already has the protocol ready to use. This is done by chaining `.registerProtocol()` on the WDK instance.

**1. Install Protocol Modules**

> [!WARNING]
> **TODO:** The `@tetherto/wdk-protocol-bridge-usdt0-ton` package is currently unavailable in the registry. This section is pending confirmation from the development team.

```bash
npm install @tetherto/wdk-protocol-swap-velora-evm
# npm install @tetherto/wdk-protocol-bridge-usdt0-ton (Pending release)
```

**2. Register in Code**

{% code title="Global Registration" lineNumbers="true" %}
```typescript
import veloraProtocolEvm from '@tetherto/wdk-protocol-swap-velora-evm'
// import Usdt0ProtocolTon from '@tetherto/wdk-protocol-bridge-usdt0-ton' // TODO: Package unavailable

// Register protocols for specific chains
const wdk = new WDK(seedPhrase)
  .registerWallet('ethereum', WalletManagerEvm, ethConfig)
  .registerWallet('ton', WalletManagerTon, tonConfig)
  
  // Register Velora Swap for Ethereum
  .registerProtocol('ethereum', 'velora', veloraProtocolEvm, {
    apiKey: 'YOUR_API_KEY'
  })
  
  /* TODO: Pending package release
  // Register USDT0 Bridge for TON
  .registerProtocol('ton', 'usdt0', Usdt0ProtocolTon, {
    tonApiKey: 'YOUR_API_KEY'
  })
  */
```
{% endcode %}

### Account-Level Registration

If you only need a protocol for a single session, you can register it directly on an account object.

{% code title="Account Registration" lineNumbers="true" %}
```typescript
const account = await wdk.getAccount('ethereum', 0)

// Register only for this account instance
account.registerProtocol('velora', veloraProtocolEvm, config)
```
{% endcode %}

## Use Protocols

Once registered, you can access the protocol instance using the specific getter methods: `getSwapProtocol`, `getBridgeProtocol`, or `getLendingProtocol`.

### Swapping Tokens

Use `getSwapProtocol` to access registered swap services.

{% code title="Swap Tokens" lineNumbers="true" %}
```typescript
const ethAccount = await wdk.getAccount('ethereum', 0)
const velora = ethAccount.getSwapProtocol('velora')

const result = await velora.swap({
  tokenIn: '0x...', // Address of token to sell
  tokenOut: '0x...', // Address of token to buy
  tokenInAmount: 1000000n // Amount to swap
})
```
{% endcode %}

### Bridging Assets

Use `getBridgeProtocol` to access cross-chain bridges.

{% code title="Bridge Assets" lineNumbers="true" %}
```typescript
/* TODO: Pending package release
const tonAccount = await wdk.getAccount('ton', 0)
const usdt0 = tonAccount.getBridgeProtocol('usdt0')

const result = await usdt0.bridge({
  targetChain: 'ethereum',
  recipient: '0x...', // Ethereum address
  token: 'TON_TOKEN_ADDRESS',
  amount: 1000000n
})
*/
```
{% endcode %}

> [!NOTE]
> **Protocol Availability:** If you try to access a protocol that hasn't been registered (e.g., `getSwapProtocol('uniswap')`), the SDK will throw an error. always ensure registration matches the ID you request.

## Next steps

Learn how to [configure middleware](./middleware.md) to add logging or failover protection to your wallet interactions.
