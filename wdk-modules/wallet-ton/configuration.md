---
title: Wallet TON Configuration
description: Configuration options and settings for @wdk/wallet-ton
author: Raquel Carrasco Gonzalez
lastReviewed: 2025-06-26
icon: gear
---
# Configuration

## Wallet Configuration

```javascript
const config = {
  tonClient: { url: 'https://toncenter.com/api/v2/jsonRPC' }, 
  transferMaxFee: 10000000 
}

const wallet = new WalletManagerTon(seedPhrase, config)
```

## Account Configuration

```javascript
const accountConfig = {
  tonClient: { url: 'https://toncenter.com/api/v2/jsonRPC' },
  transferMaxFee: 10000000
}

const account = new WalletAccountTon(seedPhrase, "0'/0/0", accountConfig)
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

### transferMaxFee

The `transferMaxFee` option sets the maximum fee amount (in nanotons) for transfer operations. This helps prevent transactions from being sent with unexpectedly high fees.

**Type:** `number` (nanotons)

**Example:**
```javascript
const config = {
  transferMaxFee: 10000000 // 0.01 TON in nanotons
}
```
