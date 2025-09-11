---
title: WDK Core Configuration
description: Configuration options and settings for @wdk/core
author: Raquel Carrasco
lastReviewed: 2025-09-11
icon: gear
---

# Configuration

## WDK Manager Configuration

```javascript
import WdkManager from '@wdk/core'

const wdk = new WdkManager(seedPhrase)
```

The WDK Manager itself only requires a seed phrase for initialization. Configuration is done through the registration of wallets and protocols.

## Wallet Registration Configuration

```javascript
import WdkManager from '@wdk/core'
import WalletManagerEvm from '@wdk/wallet-evm'
import WalletManagerTon from '@wdk/wallet-ton'

const wdk = new WdkManager(seedPhrase)
  .registerWallet('ethereum', WalletManagerEvm, {
    provider: 'https://mainnet.infura.io/v3/YOUR_API_KEY'
  })
  .registerWallet('ton', WalletManagerTon, {
    tonApiKey: 'YOUR_TON_API_KEY',
    tonApiEndpoint: 'https://tonapi.io'
  })
```

## Protocol Registration Configuration

```javascript
import ParaswapProtocolEvm from '@wdk/protocol-swap-paraswap-evm'
import Usdt0ProtocolTon from '@wdk/protocol-bridge-usdt0-ton'

const wdk = new WdkManager(seedPhrase)
  .registerProtocol('ethereum', 'paraswap', ParaswapProtocolEvm, {
    apiKey: 'YOUR_PARASWAP_API_KEY'
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
const evmConfig = {
  provider: 'https://mainnet.infura.io/v3/YOUR_API_KEY', // RPC endpoint
  // Additional EVM-specific configuration options
}

wdk.registerWallet('ethereum', WalletManagerEvm, evmConfig)
```

#### TON Wallet Configuration

```javascript
const tonConfig = {
  tonApiKey: 'YOUR_TON_API_KEY',
  tonApiEndpoint: 'https://tonapi.io',
  tonCenterApiKey: 'YOUR_TON_CENTER_API_KEY',
  tonCenterEndpoint: 'https://toncenter.com'
}

wdk.registerWallet('ton', WalletManagerTon, tonConfig)
```

#### Bitcoin Wallet Configuration

```javascript
const btcConfig = {
  provider: 'https://blockstream.info/api', // Bitcoin RPC endpoint
  // Additional Bitcoin-specific configuration options
}

wdk.registerWallet('bitcoin', WalletManagerBtc, btcConfig)
```

### Protocol Configuration

Protocols also require their own configuration objects when registered.

#### Swap Protocol Configuration

```javascript
const paraswapConfig = {
  apiKey: 'YOUR_PARASWAP_API_KEY',
  baseUrl: 'https://apiv5.paraswap.io'
}

wdk.registerProtocol('ethereum', 'paraswap', ParaswapProtocolEvm, paraswapConfig)
```

#### Bridge Protocol Configuration

```javascript
const usdt0Config = {
  tonApiKey: 'YOUR_TON_API_KEY',
  ethereumRpcUrl: 'https://mainnet.infura.io/v3/YOUR_API_KEY'
}

wdk.registerProtocol('ton', 'usdt0', Usdt0ProtocolTon, usdt0Config)
```

### Middleware Configuration

Middleware functions can be registered to enhance account functionality.

```javascript
// Simple logging middleware
wdk.registerMiddleware('ethereum', async (account) => {
  console.log('New account created:', await account.getAddress())
})

// Failover cascade middleware
import { getFailoverCascadeMiddleware } from '@wdk/wrapper-failover-cascade'

const failoverConfig = {
  retries: 3,
  delay: 1000,
  fallbackProviders: ['https://backup-rpc.com']
}

wdk.registerMiddleware('ethereum', getFailoverCascadeMiddleware(failoverConfig))
```

## Account-Specific Protocol Configuration

Protocols can also be registered for specific accounts rather than globally.

```javascript
const account = await wdk.getAccount('ethereum', 0)

// Register protocol for this specific account
account.registerProtocol('uniswap', UniswapProtocolEvm, {
  routerAddress: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
  factoryAddress: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f'
})
```

## Environment Variables

For production applications, consider using environment variables for sensitive configuration:

```javascript
const wdk = new WdkManager(process.env.SEED_PHRASE)
  .registerWallet('ethereum', WalletManagerEvm, {
    provider: process.env.ETHEREUM_RPC_URL
  })
  .registerProtocol('ethereum', 'paraswap', ParaswapProtocolEvm, {
    apiKey: process.env.PARASWAP_API_KEY
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
  wdk.registerProtocol('ethereum', 'paraswap', ParaswapProtocolEvm, invalidConfig)
} catch (error) {
  console.error('Protocol registration failed:', error.message)
}
```
