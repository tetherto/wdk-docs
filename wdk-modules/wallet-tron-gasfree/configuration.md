---
title: Wallet Tron Gas-Free Configuration
description: Configuration options and settings for @wdk/wallet-tron-gasfree
author: Raquel Carrasco Gonzalez
lastReviewed: 2025-06-26
icon: gear
---

# Configuration

## Wallet Configuration

```javascript
import WalletManagerTronGasfree from '@wdk/wallet-tron-gasfree'

const config = {
  provider: 'https://api.trongrid.io', // Tron RPC endpoint
  gasFreeProvider: 'https://your-gasfree-provider', // Gas-free service endpoint
  apiKey: 'your-api-key', // API key for gas-free provider
  apiSecret: 'your-api-secret', // API secret for gas-free provider
  serviceProvider: 'T...', // Service provider Tron address
  verifyingContract: 'T...', // Gas-free verifying contract address
  chainId: 728126428, // Tron chain ID
  transferMaxFee: 10000000 // Maximum fee in token base units (optional)
}

const wallet = new WalletManagerTronGasfree(seedPhrase, config)
```

## Account Configuration

```javascript
import WalletAccountTronGasfree from '@wdk/wallet-tron-gasfree'

const accountConfig = {
  provider: 'https://api.trongrid.io',
  gasFreeProvider: 'https://your-gasfree-provider',
  apiKey: 'your-api-key',
  apiSecret: 'your-api-secret',
  serviceProvider: 'T...',
  verifyingContract: 'T...',
  chainId: 728126428,
  transferMaxFee: 10000000
}

const account = new WalletAccountTronGasfree(seedPhrase, "0'/0/0", accountConfig)
```

## Configuration Options

### provider
The `provider` option specifies the Tron RPC endpoint for blockchain interactions.

**Type:**
```typescript
string // e.g., 'https://api.trongrid.io'
```

### gasFreeProvider
The `gasFreeProvider` option specifies the endpoint for the gas-free service provider.

**Type:**
```typescript
string // e.g., 'https://your-gasfree-provider'
```

### apiKey
The `apiKey` option is your API key for the gas-free service provider.

**Type:**
```typescript
string
```

### apiSecret
The `apiSecret` option is your API secret for the gas-free service provider.

**Type:**
```typescript
string
```

### serviceProvider
The `serviceProvider` option is the Tron address of the gas-free service provider.

**Type:**
```typescript
string // e.g., 'T...'
```

### verifyingContract
The `verifyingContract` option is the Tron address of the verifying contract for gas-free transfers.

**Type:**
```typescript
string // e.g., 'T...'
```

### chainId
The `chainId` option is the Tron chain ID.

**Type:**
```typescript
number // e.g., 728126428
```

### transferMaxFee
The `transferMaxFee` option sets the maximum fee amount (in token base units) for transfer operations. This helps prevent transactions from being sent with unexpectedly high fees.

**Type:** `number` (token base units)

**Example:**
```javascript
const config = {
  transferMaxFee: 10000000 // 10 TRX in token base units
}
```
