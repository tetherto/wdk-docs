---
title: Bridge USDT0 TON Configuration
description: Configuration options and settings for @tetherto/wdk-protocol-bridge-usdt0-ton
author: Matteo Giardino
lastReviewed: 2025-09-04
icon: gear
---

# Configuration

## Bridge Service Configuration

The `Usdt0ProtocolTon` accepts a configuration object that sets how the bridge service works:

```javascript
import Usdt0ProtocolTon from '@tetherto/wdk-protocol-bridge-usdt0-ton'
import { WalletAccountTon } from '@tetherto/wdk-wallet-ton'

// Create wallet account first
const account = new WalletAccountTon(seedPhrase, {
  tonApiKey: 'YOUR_TON_API_KEY',
  tonApiEndpoint: 'YOUR_TON_API_ENDPOINT'
})

// Create bridge service with configuration
const bridgeProtocol = new Usdt0ProtocolTon(account, {
  bridgeMaxFee: 1000000000n // Optional: Max bridge fee in nanotons
})
```

## Account Configuration

The bridge service uses the wallet account's configuration for TON access:

```javascript
import { WalletAccountTon, WalletAccountReadOnlyTon } from '@tetherto/wdk-wallet-ton'

// Full access account
const account = new WalletAccountTon(
  seedPhrase,
  {
    tonApiKey: 'YOUR_TON_API_KEY',
    tonApiEndpoint: 'YOUR_TON_API_ENDPOINT',
    tonCenterApiKey: 'YOUR_TON_CENTER_KEY',
    tonCenterEndpoint: 'YOUR_TON_CENTER_ENDPOINT'
  }
)

// Read-only account
const readOnlyAccount = new WalletAccountReadOnlyTon(
  'TON_ADDRESS', // TON address
  {
    tonApiKey: 'YOUR_TON_API_KEY',
    tonApiEndpoint: 'YOUR_TON_API_ENDPOINT'
  }
)

// Create bridge service
const bridgeProtocol = new Usdt0ProtocolTon(account, {
  bridgeMaxFee: 1000000000n
})
```

## Configuration Options

### Bridge Max Fee

The `bridgeMaxFee` option sets a top limit for total bridge costs to prevent very high fees.

**Type:** `bigint` (optional)  
**Unit:** Nanotons (1 TON = 1000000000 nanotons)

**Examples:**

```javascript
const config = {
  // Set max bridge fee to 1 TON
  bridgeMaxFee: 1000000000n,
}

// Usage example
try {
  const result = await bridgeProtocol.bridge({
    targetChain: 'ethereum',
    recipient: 'RECIPIENT_ADDRESS',
    token: 'TON_TOKEN_ADDRESS',
    amount: 1000000n
  })
} catch (error) {
  if (error.message.includes('max fee')) {
    console.error('Bridge stopped: Fee too high')
  }
}
```

### TON API Configuration

The TON API options come from the wallet account configuration and tell how to connect to TON:

**TON API Key:** `string` - Your TON API access key  
**TON API Endpoint:** `string` - TON API server URL  
**TON Center Key:** `string` - TON Center access key (optional)  
**TON Center Endpoint:** `string` - TON Center server URL (optional)

**Examples:**

```javascript
// Basic TON connection
const account = new WalletAccountTon(seedPhrase, {
  tonApiKey: 'YOUR_TON_API_KEY',
  tonApiEndpoint: 'https://tonapi.io'
})

// Full TON connection with TON Center
const account = new WalletAccountTon(seedPhrase, {
  tonApiKey: 'YOUR_TON_API_KEY',
  tonApiEndpoint: 'https://tonapi.io',
  tonCenterApiKey: 'YOUR_TON_CENTER_KEY',
  tonCenterEndpoint: 'https://toncenter.com'
})
```

## Gasless Configuration

When using gasless accounts, you can change configuration options during bridge operations:

```javascript
// Bridge with gasless account
const result = await bridgeProtocol.bridge({
  targetChain: 'ethereum',
  recipient: 'RECIPIENT_ADDRESS',
  token: 'TON_TOKEN_ADDRESS',
  amount: 1000000n
}, {
  paymasterToken: 'USDT', // Token used to pay for fees
  bridgeMaxFee: 1000000000n // Change max bridge fee
})
```

### Paymaster Token

The `paymasterToken` option says which token to use for paying fees in gasless accounts.

**Type:** `string` (optional)  
**Format:** Token name or address

**Example:**

```javascript
const result = await bridgeProtocol.bridge({
  targetChain: 'ethereum',
  recipient: 'RECIPIENT_ADDRESS',
  token: 'TON_TOKEN_ADDRESS',
  amount: 1000000n
}, {
  paymasterToken: 'USDT' // Use USDT to pay fees
})
```

## Network Support

The bridge service works with TON network. Change the API settings in the wallet account configuration:

```javascript
// TON Mainnet
const tonAccount = new WalletAccountTon(seedPhrase, {
  tonApiKey: 'YOUR_TON_API_KEY',
  tonApiEndpoint: 'https://tonapi.io'
})

// TON Testnet
const tonTestAccount = new WalletAccountTon(seedPhrase, {
  tonApiKey: 'YOUR_TON_API_KEY',
  tonApiEndpoint: 'https://testnet.tonapi.io'
})
```

## Bridge Options

When calling the bridge method, you need to give bridge options:

```javascript
const bridgeOptions = {
  targetChain: 'ethereum', // Where to send tokens
  recipient: 'RECIPIENT_ADDRESS', // Who gets the tokens
  token: 'TON_TOKEN_ADDRESS', // TON token address
  amount: 1000000n // Amount to bridge in base units
}

const result = await bridgeProtocol.bridge(bridgeOptions)
```

### Target Chain

The `targetChain` option says which blockchain to bridge tokens to.

**Type:** `string`  
**Supported values:** `'ethereum'`, `'arbitrum'`, `'tron'`

### Recipient

The `recipient` option says the address that will get the bridged tokens.

**Type:** `string`  
**Format:** Valid address for the target chain

### Token

The `token` option says which token to bridge.

**Type:** `string`  
**Format:** Token address on TON

### Amount

The `amount` option says how many tokens to bridge.

**Type:** `bigint`  
**Unit:** Base units of the token (e.g., for USDT: 1 USDT = 1000000n)

### Custom Token Config

The `oft` option lets you bridge custom jetton tokens not built into the system.

**Type:** `object` (optional)  
**Format:** OFT bridge configuration

**Example:**

```javascript
const result = await bridgeProtocol.bridge({
  targetChain: 'ethereum',
  recipient: 'RECIPIENT_ADDRESS',
  token: 'CUSTOM_TOKEN_ADDRESS',
  amount: 1000000n,
  oft: {
    version: 3,
    sharedDecimals: 6,
    deployments: {
      ton: {
        token: { address: 'TON_TOKEN_ADDRESS' }
      },
      ethereum: {
        token: { address: 'ETH_TOKEN_ADDRESS' }
      }
    }
  }
})
```

## Error Handling

The bridge service will throw errors for bad configurations:

```javascript
try {
  const result = await bridgeProtocol.bridge({
    targetChain: 'bad-chain',
    recipient: 'RECIPIENT_ADDRESS',
    token: 'TON_TOKEN_ADDRESS',
    amount: 1000000n
  })
} catch (error) {
  if (error.message.includes('not supported')) {
    console.error('Chain or token not supported')
  }
  if (error.message.includes('max fee')) {
    console.error('Bridge fee too high')
  }
  if (error.message.includes('ton center')) {
    console.error('TON connection problem')
  }
  if (error.message.includes('source chain')) {
    console.error('Cannot bridge to same chain')
  }
}
```