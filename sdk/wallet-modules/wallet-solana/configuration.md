---
title: Wallet Solana Configuration
description: Configuration options and settings for @tetherto/wdk-wallet-solana
author: Raquel Carrasco Gonzalez
lastReviewed: 2025-09-01
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

# Configuration

## Wallet Configuration

The `WalletManagerSolana` accepts an optional configuration object that defines how the wallet interacts with the Solana blockchain:

```javascript
import WalletManagerSolana from '@tetherto/wdk-wallet-solana'

const config = {
  rpcUrl: 'https://api.mainnet-beta.solana.com', // Solana RPC endpoint
  wsUrl: 'wss://api.mainnet-beta.solana.com/', // Optional: WebSocket endpoint
  transferMaxFee: 10000000 // Optional: Maximum fee in lamports
}

const wallet = new WalletManagerSolana(seedPhrase, config)
```

## Account Configuration

```javascript
import { WalletAccountSolana } from '@tetherto/wdk-wallet-solana'

const accountConfig = {
  rpcUrl: 'https://api.mainnet-beta.solana.com',
  wsUrl: 'wss://api.mainnet-beta.solana.com/', // Optional
  transferMaxFee: 10000000 // Optional: Maximum fee in lamports
}

const account = new WalletAccountSolana(seedPhrase, "0'/0/0", accountConfig)
```

## Configuration Options

### rpcUrl

The `rpcUrl` option specifies the Solana RPC endpoint for blockchain interactions.

**Type:** `string` (optional)

**Default:** If not provided, wallet functionality that requires RPC will throw an error

**Examples:**
```javascript
// Mainnet
const config = {
  rpcUrl: 'https://api.mainnet-beta.solana.com'
}

// Devnet
const config = {
  rpcUrl: 'https://api.devnet.solana.com'
}

// Custom RPC
const config = {
  rpcUrl: 'https://your-custom-rpc-endpoint.com'
}
```

### wsUrl

The `wsUrl` option specifies a custom WebSocket endpoint for real-time subscriptions and confirmations.

**Type:** `string` (optional)

**Default:** If not provided, the WebSocket URL will be automatically derived from the `rpcUrl`

**Example:**
```javascript
const config = {
  rpcUrl: 'https://api.mainnet-beta.solana.com',
  wsUrl: 'wss://api.mainnet-beta.solana.com/' // Custom WebSocket endpoint
}
```

### transferMaxFee

The `transferMaxFee` option sets the maximum allowed fee (in lamports) for transfer operations. This helps prevent unexpectedly high transaction fees.

**Type:** `number` (optional)

**Unit:** Lamports (1 SOL = 1,000,000,000 lamports)

**Example:**
```javascript
const config = {
  transferMaxFee: 10000000 // 0.01 SOL in lamports
}
```

## Complete Configuration Example

```javascript
import WalletManagerSolana from '@tetherto/wdk-wallet-solana'

const config = {
  // Required for most operations
  rpcUrl: 'https://api.mainnet-beta.solana.com',
  
  // Optional: Custom WebSocket endpoint
  wsUrl: 'wss://api.mainnet-beta.solana.com/',
  
  // Optional: Fee protection
  transferMaxFee: 10000000 // 0.01 SOL maximum fee
}

const wallet = new WalletManagerSolana(seedPhrase, config)
```

## Network Endpoints

### Mainnet
- RPC: `https://api.mainnet-beta.solana.com`
- WebSocket: `wss://api.mainnet-beta.solana.com/`

### Devnet
- RPC: `https://api.devnet.solana.com`
- WebSocket: `wss://api.devnet.solana.com/`

### Testnet
- RPC: `https://api.testnet.solana.com`
- WebSocket: `wss://api.testnet.solana.com/`

## Security Considerations

- Always use HTTPS URLs for RPC endpoints
- Set appropriate `transferMaxFee` limits for your use case
- Consider using environment variables for configuration in production
- Use trusted RPC providers or run your own Solana validator for production applications