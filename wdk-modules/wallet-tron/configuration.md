---
title: Wallet Tron Configuration
description: Configuration options and settings for @wdk/wallet-tron
author: Raquel Carrasco Gonzalez
lastReviewed: 2025-06-26
icon: gear
---

# Configuration

## Wallet Configuration

```javascript
import WalletManagerTron from '@wdk/wallet-tron'

const config = {
  provider: 'https://api.trongrid.io', // Tron RPC endpoint
  transferMaxFee: 10000000 // Maximum fee in sun (optional, e.g., 10 TRX)
}

const wallet = new WalletManagerTron(seedPhrase, config)
```

## Account Configuration

```javascript
import WalletAccountTron from '@wdk/wallet-tron'

const accountConfig = {
  provider: 'https://api.trongrid.io', // Tron RPC endpoint
  transferMaxFee: 10000000 // Maximum fee in sun (optional, e.g., 10 TRX)
}

const account = new WalletAccountTron(seedPhrase, "0'/0/0", accountConfig)
```

## Configuration Options

### provider

The `provider` option specifies the Tron RPC endpoint for blockchain interactions.

**Type:**
```typescript
string // e.g., 'https://api.trongrid.io'
```

**Example:**
```javascript
const config = {
  provider: 'https://api.trongrid.io'
}
```

### transferMaxFee

The `transferMaxFee` option sets the maximum fee amount (in sun) for transfer operations. This helps prevent transactions from being sent with unexpectedly high fees.

**Type:** `number` (sun)

**Example:**
```javascript
const config = {
  transferMaxFee: 10000000 // 10 TRX in sun
}
```
