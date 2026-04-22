---
title: Pear Worklet WDK Configuration
description: Configure the Bare worklet context and the JSON payloads passed to initializeWDK and resetWdkWallets
icon: gear
---

# Pear Worklet WDK Configuration

This page explains how to [build the worklet context](#worklet-context), [shape the worklet config payload](#worklet-config-payload), [initialize-wdk](#initialize-wdk), and [reset-selected-wallets](#reset-selected-wallets).

## Worklet Context

You can bind the shipped RPC handlers to your Bare worklet using `registerRpcHandlers()`:

{% code title="Register RPC Handlers" lineNumbers="true" %}
```javascript
const { registerRpcHandlers } = require('@tetherto/pear-wrk-wdk/worklet')
const { WDK } = require('@tetherto/wdk')
const EvmWalletManager = require('@tetherto/wdk-wallet-evm')
const SparkWalletManager = require('@tetherto/wdk-wallet-spark')

const context = {
  wdk: null,
  WDK,
  walletManagers: {
    ethereum: EvmWalletManager,
    spark: SparkWalletManager
  },
  protocolManagers: {},
  wdkLoadError: null
}

module.exports = (rpc) => {
  registerRpcHandlers(rpc, context)
}
```
{% endcode %}

### Required Context Fields

- `wdk`: The current WDK instance. Set this to `null` before the first initialization.
- `WDK`: The WDK constructor used to create the seeded instance.
- `walletManagers`: A map from blockchain name to wallet manager implementation.
- `protocolManagers`: A map from protocol name to protocol manager implementation.
- `wdkLoadError`: Any startup error captured while loading WDK. Use `null` when there is no load failure.

## Worklet Config Payload

Both [`initializeWDK()`](./api-reference.md#initializewdk) and [`resetWdkWallets()`](./api-reference.md#resetwdkwallets) expect `config` to be a JSON string. The decoded object must contain at least one entry under `networks`.

{% code title="Minimal Worklet Config JSON" lineNumbers="true" %}
```javascript
const workletConfig = {
  networks: {
    ethereum: {
      blockchain: 'ethereum',
      config: {
        provider: 'https://rpc.ankr.com/eth_sepolia'
      }
    }
  },
  protocols: {
    moonpay: {
      blockchain: 'ethereum',
      protocolName: 'moonpay',
      config: {
        environment: 'sandbox'
      }
    }
  }
}
```
{% endcode %}

### Payload Rules

- `networks` is required and must contain at least one network entry.
- Each network entry must include `blockchain` and an object `config`.
- `protocols` is optional during initialization.
- `resetWdkWallets()` reads only the `networks` portion of the decoded config.

## Initialize WDK

You can create and register the WDK instance inside the worklet using [`initializeWDK()`](./api-reference.md#initializewdk):

{% code title="Initialize WDK" lineNumbers="true" %}
```javascript
const { HRPC } = require('@tetherto/pear-wrk-wdk')

const hrpc = new HRPC(ipcStream)

await hrpc.initializeWDK({
  encryptionKey: secrets.encryptionKey,
  encryptedSeed: secrets.encryptedSeedBuffer,
  config: JSON.stringify(workletConfig)
})
```
{% endcode %}

### Initialization Rules

- Pass both `encryptionKey` and `encryptedSeed`, or omit both together.
- On first initialization, the worklet must receive an encrypted seed pair so it can create `context.wdk`.
- If `context.wdk` already exists, a later `initializeWDK()` call disposes the existing instance before re-registering wallets and protocols from the new config.

## Reset Selected Wallets

You can selectively dispose and re-register wallet modules using [`resetWdkWallets()`](./api-reference.md#resetwdkwallets):

{% code title="Reset Selected Wallet Modules" lineNumbers="true" %}
```javascript
await hrpc.resetWdkWallets({
  config: JSON.stringify({
    networks: {
      ethereum: {
        blockchain: 'ethereum',
        config: {
          provider: 'https://rpc.ankr.com/eth_sepolia'
        }
      }
    }
  })
})
```
{% endcode %}

### Reset Rules

- `resetWdkWallets()` requires an existing initialized `context.wdk`.
- The handler calls `wdk.dispose(targetChains)` with the blockchains extracted from `config.networks`.
- Only wallets listed in the request `networks` object are re-registered.
- The reset flow does not re-register protocols.

## Call Wallet Methods

You can execute wallet account methods through [`callMethod()`](./api-reference.md#callmethod):

{% code title="Call a Wallet Method" lineNumbers="true" %}
```javascript
const result = await hrpc.callMethod({
  methodName: 'getAddress',
  network: 'ethereum',
  accountIndex: 0
})
```
{% endcode %}

### Call Method Notes

- `args` is optional and must be a JSON string when provided.
- `options` is optional and must be a JSON string when provided.
- When `args` decodes to an array, the handler spreads the values as positional method arguments.
- When `args` decodes to an object or primitive, the handler passes it as a single argument.

***

## Need Help?

{% include "../.gitbook/includes/support-cards.md" %}
