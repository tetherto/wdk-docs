---
title: Wallet Spark Configuration
description: Configuration options and settings for @tetherto/wdk-wallet-spark
lastReviewed: 2025-06-26
icon: gear
---

# Configuration

## Wallet Configuration

```javascript
const config = {
  network: 'MAINNET' // 'MAINNET', 'TESTNET', or 'REGTEST'
}

const wallet = new WalletManagerSpark(seedPhrase, config)
```

## Account Creation

```javascript
// WalletAccountSpark is created by the WalletManagerSpark
// It does not take configuration parameters directly
const account = await wallet.getAccount(0) // Get account at index 0
```

## Configuration Options

### Network

The `network` option specifies which Spark network to use.

**Type:** `string`

**Values:**
- `"MAINNET"` - Spark [mainnet](../../../resources/concepts.md#mainnet) (production)
- `"TESTNET"` - Spark [testnet](../../../resources/concepts.md#testnet) (development)
- `"REGTEST"` - Spark [regtest](../../../resources/concepts.md#regtest) (local testing)

**Default:** `"MAINNET"`

**Example:**
```javascript
const config = {
  network: 'TESTNET' // Use testnet for development
}
```

## Network Configuration

The wallet can be configured for different Spark networks:

```javascript
// Mainnet configuration
const mainnetConfig = {
  network: 'MAINNET'
}

// Testnet configuration  
const testnetConfig = {
  network: 'TESTNET'
}

// Regtest configuration
const regtestConfig = {
  network: 'REGTEST'
}
```

## BIP-44 Derivation Path

Spark uses the [BIP-44](../../../resources/concepts.md#bip-44-multi-account-hierarchy) coin type 998, resulting in derivation paths like:
- `m/44'/998'/0'/0/0` for account 0
- `m/44'/998'/1'/0/0` for account 1
- etc.

This ensures compatibility with standard [BIP-44](../../../resources/concepts.md#bip-44-multi-account-hierarchy) wallets while using Spark's unique coin type identifier.

## Complete Configuration Example

```javascript
import WalletManagerSpark from '@tetherto/wdk-wallet-spark'

// Create wallet manager with configuration
const wallet = new WalletManagerSpark(seedPhrase, {
  network: 'MAINNET'
})

// Get accounts (no additional configuration needed)
const account0 = await wallet.getAccount(0)
const account1 = await wallet.getAccount(1)

// Clean up when done
wallet.dispose()
```
