---
title: Wallet Spark Configuration
description: Configuration options and settings for @wdk/wallet-spark
author: Matteo Giardino
lastReviewed: 2025-06-26
icon: settings
---

# Configuration

## Wallet Configuration

```javascript
const config = {
  network: 'MAINNET' // 'MAINNET', 'TESTNET', or 'REGTEST'
}

const wallet = new WalletManagerSpark(seedPhrase, config)
```

## Account Configuration

```javascript
const accountConfig = {
  network: 'MAINNET'
}

const account = new WalletAccountSpark(wallet)
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
const config = {
  network: 'MAINNET' // 'MAINNET', 'TESTNET', or 'REGTEST'
}
```

### Network-Specific Configuration

#### Spark Mainnet

```javascript
const mainnetConfig = {
  network: 'MAINNET'
}
```

#### Spark Testnet

```javascript
const testnetConfig = {
  network: 'TESTNET'
}
```

#### Spark Regtest

```javascript
const regtestConfig = {
  network: 'REGTEST'
}
```

## BIP-44 Derivation Path

Spark uses the [BIP-44](../../../resources/concepts.md#bip-44-multi-account-hierarchy) coin type 998, resulting in derivation paths like:
- `m/44'/998'/0'/0/0` for account 0
- `m/44'/998'/0'/0/1` for account 1
- etc.

This ensures compatibility with standard [BIP-44](../../../resources/concepts.md#bip-44-multi-account-hierarchy) wallets while using Spark's unique coin type identifier. 