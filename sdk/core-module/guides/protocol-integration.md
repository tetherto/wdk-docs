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

The WDK Core module supports registering external protocols. This allows you to extend the basic wallet functionality with advanced features like [token swapping](#swapping-tokens), [cross-chain bridging](#bridging-assets), and lending, all through a unified interface.

## Register Protocols

You can register protocols in two ways: [globally](#global-registration-recommended) (for all new accounts) or [locally](#account-level-registration) (for a specific existing account).

### Global Registration (Recommended)

Global registration ensures that every account you retrieve already has the protocol ready to use. You can do this by chaining a call to `.registerProtocol()` on the WDK instance.

### 1. Install Protocol Modules

Install the [`@tetherto/wdk-protocol-swap-velora-evm`](https://www.npmjs.com/package/@tetherto/wdk-protocol-swap-velora-evm) and [`@tetherto/wdk-protocol-bridge-usdt0-evm`](https://www.npmjs.com/package/@tetherto/wdk-protocol-bridge-usdt0-evm) packages:

```bash
npm install @tetherto/wdk-protocol-swap-velora-evm && npm install @tetherto/wdk-protocol-bridge-usdt0-evm
```

### 2. Register in Code

{% code title="Global Registration" lineNumbers="true" %}
```typescript
import veloraProtocolEvm from '@tetherto/wdk-protocol-swap-velora-evm'
import usdt0ProtocolEvm from '@tetherto/wdk-protocol-bridge-usdt0-evm'

// Register protocols for specific chains
const wdk = new WDK(seedPhrase)
  .registerWallet('ethereum', WalletManagerEvm, ethConfig)
  
  // Register Velora Swap for Ethereum
  .registerProtocol('ethereum', 'velora', veloraProtocolEvm, {
    apiKey: 'YOUR_API_KEY'
  })
  
  // Register USDT0 Bridge for Ethereum
  .registerProtocol('ethereum', 'usdt0', usdt0ProtocolEvm, {
     ethereumRpcUrl: 'https://eth.drpc.org' // Configuration depends on the module
  })
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

Once [registered](#register-protocols), you can access the protocol instance using the specific getter methods: `getSwapProtocol`, `getBridgeProtocol`, or `getLendingProtocol`.

### Swapping Tokens

Use `getSwapProtocol` to access registered swap services on any wallet account.

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

1. Use `getBridgeProtocol` to access cross-chain bridges.
2. Call `bridge` from the bridge protocol to send tokens from one protocol to another.

{% code title="Bridge Assets" lineNumbers="true" %}
```typescript
const ethAccount = await wdk.getAccount('ethereum', 0)
const usdt0 = ethAccount.getBridgeProtocol('usdt0')

const result = await usdt0.bridge({
  targetChain: 'ton',
  recipient: 'UQBla...', // TON address
  token: '0x...', // ERC20 Token Address
  amount: 1000000n
})
```
{% endcode %}

{% hint style="info" %}
**Protocol Availability:** If you try to access a protocol that hasn't been registered (e.g., `getSwapProtocol('uniswap')`), the SDK will throw an error. always ensure registration matches the ID you request.
{% endhint %}

## Next Steps

Learn how to [configure middleware](./middleware.md) to add logging or failover protection to your wallet interactions.
