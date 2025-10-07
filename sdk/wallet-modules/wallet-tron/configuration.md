---
title: Wallet Tron Configuration
description: Configuration options and settings for @tetherto/wdk-wallet-tron
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

```javascript
import WalletManagerTron from '@tetherto/wdk-wallet-tron'

const config = {
  provider: 'https://api.trongrid.io', // Tron RPC endpoint
  transferMaxFee: 10000000 // Maximum fee in sun (optional)
}

const wallet = new WalletManagerTron(seedPhrase, config)
```

## Account Configuration

```javascript
import { WalletAccountTron } from '@tetherto/wdk-wallet-tron'

const accountConfig = {
  provider: 'https://api.trongrid.io',
  transferMaxFee: 10000000 // Maximum fee in sun (optional)
}

const account = new WalletAccountTron(seedPhrase, "0'/0/0", accountConfig)
```

## Configuration Options

### Provider

The `provider` option specifies the Tron RPC endpoint or TronWeb instance for blockchain interactions.

**Type:** `string | TronWeb`

**Example:**
```javascript
const config = {
  provider: 'https://api.trongrid.io'
}
```

### Transfer Max Fee

The `transferMaxFee` option sets the maximum fee amount (in sun) for transfer operations. This helps prevent transactions from being sent with unexpectedly high fees.

**Type:** `number` (optional)  
**Unit:** Sun (1 TRX = 1,000,000 Sun)

**Example:**
```javascript
const config = {
  transferMaxFee: 10000000 // 10 TRX in sun
}
```