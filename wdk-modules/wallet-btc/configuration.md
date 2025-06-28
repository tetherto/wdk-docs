---
title: Wallet BTC Configuration
description: Configuration options and settings for @wdk/wallet-btc
author: Matteo Giardino
lastReviewed: 2025-06-26
icon: gear
---

# Configuration

## Wallet Configuration

```javascript
const config = {
  host: 'electrum.blockstream.info', // Electrum server hostname
  port: 50001,                       // Electrum server port
  network: 'bitcoin'                 // Network: 'bitcoin', 'testnet', or 'regtest'
}

const wallet = new WalletManagerBtc(seedPhrase, config)
```

## Account Configuration

```javascript
const accountConfig = {
  host: 'electrum.blockstream.info',
  port: 50001,
  network: 'bitcoin'
}

const account = new WalletAccountBtc(seedPhrase, "0'/0/0", accountConfig)
```

## Configuration Options

### Host

The `host` option specifies the Electrum server hostname to connect to for blockchain data.

**Type:** `string`

**Default:** `"electrum.blockstream.info"`

**Example:**
```javascript
const config = {
  host: 'electrum.blockstream.info'
}
```

### Port

The `port` option specifies the Electrum server port to connect to.

**Type:** `number`

**Default:** `50001`

**Example:**
```javascript
const config = {
  port: 50001
}
```

### Network

The `network` option specifies which Bitcoin network to use.

**Type:** `string`

**Values:**
- `"bitcoin"` - Bitcoin [mainnet](../../../resources/concepts.md#mainnet) (production)
- `"testnet"` - Bitcoin [testnet](../../../resources/concepts.md#testnet) (development)
- `"regtest"` - Bitcoin [regtest](../../../resources/concepts.md#regtest) (local testing)

**Default:** `"bitcoin"`

**Example:**
```javascript
const config = {
  network: 'testnet' // Use testnet for development
}
```

## Electrum Server Configuration

The wallet connects to Electrum servers for blockchain data. You can configure:

```javascript
const config = {
  host: 'electrum.blockstream.info', // Electrum server hostname
  port: 50001,                       // Electrum server port
  network: 'bitcoin'                 // Network: 'bitcoin', 'testnet', or 'regtest'
}
```

### Popular Electrum Servers

- **Blockstream**: `electrum.blockstream.info:50001`
- **Electrum.org**: `electrum.hodlister.co:50001`
- **Testnet**: `testnet.hsmiths.com:53011`

### Network-Specific Configuration

#### Bitcoin Mainnet

```javascript
const mainnetConfig = {
  host: 'electrum.blockstream.info',
  port: 50001,
  network: 'bitcoin'
}
```

#### Bitcoin Testnet

```javascript
const testnetConfig = {
  host: 'testnet.hsmiths.com',
  port: 53011,
  network: 'testnet'
}
```

#### Bitcoin Regtest

```javascript
const regtestConfig = {
  host: 'localhost',
  port: 50001,
  network: 'regtest'
}
``` 