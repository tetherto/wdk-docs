---
title: Wallet TON Gasless Configuration
description: Configuration options and settings for @wdk/wallet-ton-gasless
author: Raquel Carrasco Gonzalez
lastReviewed: 2025-06-26
icon: gear
---

# Configuration

## Wallet Configuration

```javascript
import WalletManagerTonGasless from '@wdk/wallet-ton-gasless'

const config = {
  tonClient: { url: 'https://toncenter.com/api/v2/jsonRPC' },
  tonApiClient: { url: 'https://tonapi.io', secretKey: 'your-tonapi-key' }, // optional but recommended
  paymasterToken: { address: 'EQC...' }, // REQUIRED: replace with your paymaster Jetton address
  transferMaxFee: 10000000 // Maximum fee in paymaster Jetton base units (optional)
}

const wallet = new WalletManagerTonGasless(seedPhrase, config)
```

## Account Configuration

```javascript
import WalletAccountTonGasless from '@wdk/wallet-ton-gasless'

const accountConfig = {
  tonClient: { url: 'https://toncenter.com/api/v2/jsonRPC' },
  tonApiClient: { url: 'https://tonapi.io', secretKey: 'your-tonapi-key' }, // optional but recommended
  paymasterToken: { address: 'EQC...' }, // REQUIRED: replace with your paymaster Jetton address
  transferMaxFee: 10000000 // Maximum fee in paymaster Jetton base units (optional)
}

const account = new WalletAccountTonGasless(seedPhrase, "0'/0/0", accountConfig)
```

## Configuration Options

### tonClient

The `tonClient` option specifies the TON RPC endpoint and (optionally) an API key for blockchain interactions.

**Type:**
```typescript
{
  url: string;         
  secretKey?: string;
}
```

**Examples:**
```javascript
// Using TON RPC URL
const config = {
  tonClient: { url: 'https://toncenter.com/api/v2/jsonRPC' }
}

// Using TON RPC URL with API key
const config = {
  tonClient: { url: 'https://toncenter.com/api/v2/jsonRPC', secretKey: 'your-api-key' }
}
```
### tonApiClient

The `tonApiClient` option specifies the TON API endpoint and (optionally) an API key for advanced features and gasless operations.

**Type:**
```javascript
{
  url: string;
  secretKey?: string;
}
```
**Example:**
```javascript
const config = {
  tonApiClient: { url: 'https://tonapi.io', secretKey: 'your-tonapi-key' }
}
```

### paymasterToken

The `paymasterToken` option specifies the Jetton (token) used to pay gas fees for gasless transactions.

**Type:**
```javascript
{
  address: string; // Jetton master contract address
}
```

**Example:**
```javascript
const config = {
  paymasterToken: { address: 'EQC...' }
}
```

### transferMaxFee

The `transferMaxFee` option sets the maximum fee amount (in paymaster Jetton base units) for transfer operations. This helps prevent transactions from being sent with unexpectedly high fees.

**Type:** `number` (paymaster Jetton base units)

**Example:**
```javascript
const config = {
  transferMaxFee: 10000000 
}
```
