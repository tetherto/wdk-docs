---
title: Wallet EVM Configuration
description: Configuration options and settings for @wdk/wallet-evm
author: Matteo Giardino
lastReviewed: 2025-06-26
---

# Configuration

## Wallet Configuration

```javascript
const config = {
  provider: 'https://rpc.mevblocker.io/fast', // RPC endpoint URL
  transferMaxFee: 5000000 // Maximum fee for transfer operations (in wei)
}

const wallet = new WalletManagerEvm(seedPhrase, config)
```

## Account Configuration

```javascript
const accountConfig = {
  provider: 'https://rpc.mevblocker.io/fast',
  transferMaxFee: 5000000
}

const account = new WalletAccountEvm(seedPhrase, "0'/0/0", accountConfig)
```

## Configuration Options

### Provider

The `provider` option specifies the RPC endpoint or EIP-1193 provider instance to use for blockchain interactions.

**Type:** `string | Eip1193Provider`

**Examples:**
```javascript
// Using RPC URL
const config = {
  provider: 'https://rpc.mevblocker.io/fast'
}

// Using custom provider instance
const config = {
  provider: customProviderInstance
}
```

### Transfer Max Fee

The `transferMaxFee` option sets the maximum fee amount (in wei) for transfer operations. This helps prevent transactions from being sent with unexpectedly high fees.

**Type:** `number`

**Example:**
```javascript
const config = {
  transferMaxFee: 5000000 // 0.005 ETH in wei
}
```