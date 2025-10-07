---
title: Wallet Tron Gas-Free Configuration
description: Configuration options and settings for @tetherto/wdk-wallet-tron-gasfree
author: Raquel Carrasco Gonzalez
lastReviewed: 2025-08-31
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

```javascript
import WalletManagerTronGasfree from '@tetherto/wdk-wallet-tron-gasfree'
import TronWeb from 'tronweb'

// Option 1: Using RPC URL
const config = {
  // Required parameters
  chainId: '728126428', // Blockchain ID
  provider: 'https://api.trongrid.io', // Tron RPC endpoint
  gasFreeProvider: 'https://api.gasfree.com', // Gas-free service URL
  gasFreeApiKey: 'your-api-key', // Gas-free API key
  gasFreeApiSecret: 'your-api-secret', // Gas-free API secret
  serviceProvider: 'TLyqzVGLV1srkB7dToTAEqgDSfPtXRJZYH', // Service provider address
  verifyingContract: 'TLyqzVGLV1srkB7dToTAEqgDSfPtXRJZYH', // Verifying contract address
  
  // Optional parameter
  transferMaxFee: 10000000 // Maximum fee in token base units
}

const wallet = new WalletManagerTronGasfree(seedPhrase, config)

// Option 2: Using TronWeb instance
const tronWeb = new TronWeb({ fullHost: 'https://api.trongrid.io' })
const config2 = {
  chainId: '728126428',
  provider: tronWeb,
  gasFreeProvider: 'https://api.gasfree.com',
  gasFreeApiKey: 'your-api-key',
  gasFreeApiSecret: 'your-api-secret',
  serviceProvider: 'TLyqzVGLV1srkB7dToTAEqgDSfPtXRJZYH',
  verifyingContract: 'TLyqzVGLV1srkB7dToTAEqgDSfPtXRJZYH'
}
```

## Account Configuration

Both `WalletAccountTronGasfree` and `WalletAccountReadOnlyTronGasfree` share similar configuration requirements:

```javascript
import { WalletAccountTronGasfree, WalletAccountReadOnlyTronGasfree } from '@tetherto/wdk-wallet-tron-gasfree'

// Full access account
const account = new WalletAccountTronGasfree(
  seedPhrase,
  "0'/0/0", // BIP-44 derivation path
  {
    chainId: '728126428',
    provider: 'https://api.trongrid.io',
    gasFreeProvider: 'https://api.gasfree.com',
    gasFreeApiKey: 'your-api-key',
    gasFreeApiSecret: 'your-api-secret',
    serviceProvider: 'TLyqzVGLV1srkB7dToTAEqgDSfPtXRJZYH',
    verifyingContract: 'TLyqzVGLV1srkB7dToTAEqgDSfPtXRJZYH',
    transferMaxFee: 10000000 // Optional
  }
)

// Read-only account (transferMaxFee not needed)
const readOnlyAccount = new WalletAccountReadOnlyTronGasfree(
  'TLyqzVGLV1srkB7dToTAEqgDSfPtXRJZYH', // Tron address
  {
    chainId: '728126428',
    provider: 'https://api.trongrid.io',
    gasFreeProvider: 'https://api.gasfree.com',
    gasFreeApiKey: 'your-api-key',
    gasFreeApiSecret: 'your-api-secret',
    serviceProvider: 'TLyqzVGLV1srkB7dToTAEqgDSfPtXRJZYH',
    verifyingContract: 'TLyqzVGLV1srkB7dToTAEqgDSfPtXRJZYH'
  }
)
```

## Configuration Options

### Provider

The `provider` option specifies how to connect to the Tron network.

**Type:** `string | TronWeb`  
**Required:** Yes

**Examples:**
```javascript
// Option 1: Using RPC URL
const config = {
  provider: 'https://api.trongrid.io'
}

// Option 2: Using TronWeb instance
const tronWeb = new TronWeb({ fullHost: 'https://api.trongrid.io' })
const config = {
  provider: tronWeb
}
```

### Chain ID

The `chainId` option specifies the blockchain's ID.

**Type:** `string`  
**Required:** Yes

**Example:**
```javascript
const config = {
  chainId: '728126428' // Tron Mainnet
}
```

### Gas-Free Provider

The `gasFreeProvider` option specifies the URL of the gas-free service.

**Type:** `string`  
**Required:** Yes

**Example:**
```javascript
const config = {
  gasFreeProvider: 'https://api.gasfree.com'
}
```

### Gas-Free API Key

The `gasFreeApiKey` option is your API key for the gas-free service.

**Type:** `string`  
**Required:** Yes

**Example:**
```javascript
const config = {
  gasFreeApiKey: 'your-api-key'
}
```

### Gas-Free API Secret

The `gasFreeApiSecret` option is your API secret for the gas-free service.

**Type:** `string`  
**Required:** Yes

**Example:**
```javascript
const config = {
  gasFreeApiSecret: 'your-api-secret'
}
```

### Service Provider

The `serviceProvider` option is the Tron address of the gas-free service provider.

**Type:** `string`  
**Required:** Yes

**Example:**
```javascript
const config = {
  serviceProvider: 'TLyqzVGLV1srkB7dToTAEqgDSfPtXRJZYH'
}
```

### Verifying Contract

The `verifyingContract` option is the Tron address of the contract that verifies gas-free transactions.

**Type:** `string`  
**Required:** Yes

**Example:**
```javascript
const config = {
  verifyingContract: 'TLyqzVGLV1srkB7dToTAEqgDSfPtXRJZYH'
}
```

### Transfer Max Fee

The `transferMaxFee` option sets a maximum limit for transaction fees to prevent unexpectedly high costs.

**Type:** `number`  
**Required:** No (optional)  
**Unit:** Token base units

**Example:**
```javascript
const config = {
  transferMaxFee: 10000000 // Maximum fee in token base units
}

// Usage with error handling
try {
  const result = await account.transfer({
    token: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    recipient: 'TLyqzVGLV1srkB7dToTAEqgDSfPtXRJZYH',
    amount: 1000000
  }, {
    transferMaxFee: 5000 // Override default max fee
  })
} catch (error) {
  if (error.message.includes('exceeds the transfer max fee')) {
    console.error('Transfer cancelled: Fee too high')
  }
}
```

## Network-Specific Configurations

### Tron Mainnet

```javascript
const mainnetConfig = {
  chainId: '728126428',
  provider: 'https://api.trongrid.io',
  gasFreeProvider: 'https://api.gasfree.com',
  gasFreeApiKey: 'your-api-key',
  gasFreeApiSecret: 'your-api-secret',
  serviceProvider: 'TLyqzVGLV1srkB7dToTAEqgDSfPtXRJZYH',
  verifyingContract: 'TLyqzVGLV1srkB7dToTAEqgDSfPtXRJZYH'
}
```

### Tron Nile Testnet

```javascript
const nileConfig = {
  chainId: '3448148', // Nile Testnet
  provider: 'https://nile.trongrid.io',
  gasFreeProvider: 'https://testnet.gasfree.com',
  gasFreeApiKey: 'your-testnet-api-key',
  gasFreeApiSecret: 'your-testnet-api-secret',
  serviceProvider: 'TLyqzVGLV1srkB7dToTAEqgDSfPtXRJZYH',
  verifyingContract: 'TLyqzVGLV1srkB7dToTAEqgDSfPtXRJZYH'
}
```