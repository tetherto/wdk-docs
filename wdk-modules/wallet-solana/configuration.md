---
title: Wallet Solana Configuration
description: Configuration options and settings for @wdk/wallet-solana
author: Raquel Carrasco Gonzalez
lastReviewed: 2025-06-26
icon: gear
---

# Configuration

## Wallet Configuration

```javascript
import WalletManagerSolana from '@wdk/wallet-solana'

const config = {
  rpcUrl: 'https://api.mainnet-beta.solana.com' // Solana RPC endpoint
}

const wallet = new WalletManagerSolana(seedPhrase, config)
```

## Account Configuration

```javascript
import WalletAccountSolana from '@wdk/wallet-solana'

const accountConfig = {
  rpcUrl: 'https://api.mainnet-beta.solana.com'
}

const account = new WalletAccountSolana(seedPhrase, "0'/0/0", accountConfig)
```

## Configuration Options

### rpcUrl
The `rpcUrl` option specifies the Solana RPC endpoint for blockchain interactions.

**Type:**
```typescript
string // e.g., 'https://api.mainnet-beta.solana.com'
```

### wsUrl (optional, advanced)
The `wsUrl` option specifies a custom WebSocket endpoint for subscriptions.  
If not provided, it will be derived automatically from `rpcUrl`.  
Most users do not need to set this.

**Type:**
```typescript
string // e.g., 'wss://api.mainnet-beta.solana.com'
```
