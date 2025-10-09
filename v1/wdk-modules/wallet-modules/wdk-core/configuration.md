---
title: WDK Core Configuration
description: Configuration options and settings for @tetherto/wdk
lastReviewed: 2025-09-11
icon: gear
---

# Configuration

## WDK Manager Configuration

```javascript
import WDK from '@tetherto/wdk'

const wdk = new WDK(seedPhrase)
```

The WDK Manager itself only requires a seed phrase for initialization. Configuration is done through the registration of wallets and protocols.

## Wallet Registration Configuration

```javascript
import WDK from '@tetherto/wdk'
import WalletManagerEvm from '@tetherto/wdk-wallet-evm'
import WalletManagerTon from '@@tetherto/wdk-wallet-ton'

const wdk = new WDK(seedPhrase)
  .registerWallet('ethereum', WalletManagerEvm, {
    provider: 'https://eth.drpc.org'
  })
  .registerWallet('ton', WalletManagerTon, {
    tonApiKey: 'YOUR_TON_API_KEY',
    tonApiEndpoint: 'https://tonapi.io'
  })
```

## Protocol Registration Configuration

```javascript
import veloraProtocolEvm from '@tetherto/wdk-protocol-swap-velora-evm'
import Usdt0ProtocolTon from '@tetherto/wdk-protocol-bridge-usdt0-ton'

const wdk = new WDK(seedPhrase)
  .registerProtocol('ethereum', 'velora', veloraProtocolEvm, {
    apiKey: 'YOUR_velora_API_KEY'
  })
  .registerProtocol('ton', 'usdt0', Usdt0ProtocolTon, {
    tonApiKey: 'YOUR_TON_API_KEY'
  })
```

## Configuration Options

### Wallet Configuration

Each wallet manager requires its own configuration object when registered. The configuration depends on the specific wallet module being used.

#### EVM Wallet Configuration

```javascript
const ethereumWalletConfig = {
  provider: 'https://eth.drpc.org', // RPC endpoint
  // Additional EVM-specific configuration options
}

wdk.registerWallet('ethereum', WalletManagerEvm, ethereumWalletConfig)
```

#### TON Wallet Configuration

```javascript
const tonConfig = {
  tonApiKey: 'YOUR_TON_API_KEY',
  tonApiEndpoint: 'https://tonapi.io',
  tonCenterApiKey: 'YOUR_TON_CENTER_API_KEY',
  tonCenterEndpoint: 'https://toncenter.com'
}

wdk.registerWallet('ton', WalletManagerTon, tonWalletConfig)
```


### Protocol Configuration

Protocols also require their own configuration objects when registered.

#### Swap Protocol Configuration

```javascript
const veloraProtocolConfig = {
  apiKey: 'YOUR_velora_API_KEY',
  baseUrl: 'https://apiv5.velora.io'
}

wdk.registerProtocol('ethereum', 'velora', veloraProtocolEvm, veloraProtocolConfig)
```

#### Bridge Protocol Configuration

```javascript
const usdt0ProtocolConfig = {
  tonApiKey: 'YOUR_TON_API_KEY',
  ethereumRpcUrl: 'https://eth.drpc.org'
}

wdk.registerProtocol('ton', 'usdt0', Usdt0ProtocolTon, usdt0ProtocolConfig)
```

### Middleware Configuration

Middleware functions can be registered to enhance account functionality.

```javascript
// Simple logging middleware
wdk.registerMiddleware('ethereum', async (account) => {
  console.log('New account created:', await account.getAddress())
})

// Failover cascade middleware
import { getFailoverCascadeMiddleware } from '@tetherto/wdk-wrapper-failover-cascade'

wdk.registerMiddleware('ethereum', getFailoverCascadeMiddleware(fallbackOptions))
```

## Environment Variables

For production applications, consider using environment variables for sensitive configuration:

```javascript
const wdk = new WDK(process.env.SEED_PHRASE)
  .registerWallet('ethereum', WalletManagerEvm, {
    provider: process.env.ETHEREUM_RPC_URL
  })
  .registerProtocol('ethereum', 'velora', veloraProtocolEvm, {
    apiKey: process.env.velora_API_KEY
  })
```

## Configuration Validation

The WDK Manager will validate configurations when wallets and protocols are registered:

- **Wallet Registration**: Ensures the wallet class extends the required base class
- **Protocol Registration**: Validates that protocol labels are unique per blockchain and protocol type
- **Middleware Registration**: Validates that middleware functions have the correct signature

## Error Handling

Configuration errors will be thrown during registration:

```javascript
try {
  wdk.registerWallet('ethereum', InvalidWalletClass, config)
} catch (error) {
  console.error('Wallet registration failed:', error.message)
}

try {
  wdk.registerProtocol('ethereum', 'velora', veloraProtocolEvm, invalidConfig)
} catch (error) {
  console.error('Protocol registration failed:', error.message)
}
```
