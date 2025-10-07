---
title: Wallet TON Configuration
description: Configuration options and settings for @tetherto/wdk-wallet-ton
author: Raquel Carrasco Gonzalez
lastReviewed: 2025-06-26
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

The `WalletManagerTon` accepts a configuration object that defines how the wallet interacts with the TON blockchain:

```javascript
import WalletManagerTon from '@tetherto/wdk-wallet-ton'

const config = {
  tonClient: {
    url: 'https://toncenter.com/api/v3',
    secretKey: 'your-api-key' // Optional
  },
  transferMaxFee: 1000000000 // Optional: Maximum fee in nanotons (1 TON)
}

const wallet = new WalletManagerTon(seedPhrase, config)
```

## Account Configuration

```javascript
import { WalletAccountTon } from '@tetherto/wdk-wallet-ton'

const accountConfig = {
  tonClient: {
    url: 'https://toncenter.com/api/v3',
    secretKey: 'your-api-key' // Optional
  },
  transferMaxFee: 1000000000 // Optional: Maximum fee in nanotons
}

const account = new WalletAccountTon(seedPhrase, "0'/0/0", accountConfig)
```

## Configuration Options

### tonClient

The `tonClient` option configures the TON Center API client for blockchain interactions.

**Type:**
```typescript
interface TonClientConfig {
  /**
   * TON Center API endpoint URL
   */
  url: string;

  /**
   * Optional API key for TON Center
   * Required for higher rate limits
   */
  secretKey?: string;
}
```

**Examples:**
```javascript
// Basic configuration
const config = {
  tonClient: { 
    url: 'https://toncenter.com/api/v3'
  }
}

// With API key for higher rate limits
const config = {
  tonClient: {
    url: 'https://toncenter.com/api/v3',
    secretKey: 'your-api-key'
  }
}
```

### transferMaxFee

The `transferMaxFee` option sets the maximum allowed fee (in nanotons) for transfer operations. This helps prevent unexpectedly high transaction fees.

**Type:** `number` (nanotons)

**Default:** No maximum (undefined)

**Examples:**
```javascript
const config = {
  transferMaxFee: 1000000000 // 1 TON in nanotons
}

// Example with both options
const config = {
  tonClient: {
    url: 'https://toncenter.com/api/v3',
    secretKey: 'your-api-key'
  },
  transferMaxFee: 1000000000
}
```

## Read-Only Account Configuration

For read-only accounts, you only need the TON client configuration:

```javascript
import { WalletAccountReadOnlyTon } from '@tetherto/wdk-wallet-ton'

const readOnlyConfig = {
  tonClient: {
    url: 'https://toncenter.com/api/v3',
    secretKey: 'your-api-key' // Optional
  }
}

const readOnlyAccount = new WalletAccountReadOnlyTon(publicKey, readOnlyConfig)
```

## Network Selection

The TON network (mainnet or testnet) is determined by the TON Center API endpoint URL:

- Mainnet: `https://toncenter.com/api/v3`
- Testnet: `https://testnet.toncenter.com/api/v3`

## Security Considerations

- Always use HTTPS URLs for TON Center API endpoints
- Keep API keys secure and never expose them in client-side code
- Consider using environment variables for API keys
- Set appropriate `transferMaxFee` limits for your use case