---
title: Bridge USDT0 EVM Configuration
description: Configuration options and settings for @tetherto/wdk-protocol-bridge-usdt0-evm
lastReviewed: 2025-09-04
icon: gear
---

# Configuration

## Bridge Protocol Configuration

The `Usdt0ProtocolEvm` accepts a configuration object that defines how the bridge protocol works:

```javascript
import Usdt0ProtocolEvm from '@tetherto/wdk-protocol-bridge-usdt0-evm'
import { WalletAccountEvm } from '@tetherto/wdk-wallet-evm'

// Create wallet account first
const account = new WalletAccountEvm(seedPhrase, {
  provider: 'https://eth-mainnet.g.alchemy.com/v2/your-api-key'
})

// Create bridge protocol with configuration
const bridgeProtocol = new Usdt0ProtocolEvm(account, {
  bridgeMaxFee: 1000000000000000n // Optional: Maximum bridge fee in wei
})
```

## Account Configuration

The bridge protocol uses the wallet account's configuration for blockchain access:

```javascript
import { WalletAccountEvm, WalletAccountReadOnlyEvm } from '@tetherto/wdk-wallet-evm'

// Full access account
const account = new WalletAccountEvm(
  seedPhrase,
  "0'/0/0", // BIP-44 derivation path
  {
    provider: 'https://eth-mainnet.g.alchemy.com/v2/your-api-key',
    transferMaxFee: 100000000000000
  }
)

// Read-only account
const readOnlyAccount = new WalletAccountReadOnlyEvm(
  '0x...', // Ethereum address
  {
    provider: 'https://eth-mainnet.g.alchemy.com/v2/your-api-key'
  }
)

// Create bridge protocol
const bridgeProtocol = new Usdt0ProtocolEvm(account, {
  bridgeMaxFee: 1000000000000000n
})
```

## Configuration Options

### Bridge Max Fee

The `bridgeMaxFee` option sets a maximum limit for total bridge costs to prevent unexpectedly high fees.

**Type:** `bigint` (optional)  
**Unit:** Wei (1 ETH = 1000000000000000000 Wei)

**Examples:**

```javascript
const config = {
  // Set maximum bridge fee to 0.001 ETH
  bridgeMaxFee: 1000000000000000n,
}

// Usage example
try {
  const result = await bridgeProtocol.bridge({
    targetChain: 'arbitrum',
    recipient: '0x...', // Recipient address
    token: '0x...', // USDT contract address
    amount: 1000000000000000000n
  })
} catch (error) {
  if (error.message.includes('Exceeded maximum fee')) {
    console.error('Bridge cancelled: Fee too high')
  }
}
```

### Provider

The `provider` option comes from the wallet account configuration and specifies how to connect to the blockchain.

**Type:** `string | Eip1193Provider`

**Examples:**

```javascript
// Option 1: Using RPC URL
const account = new WalletAccountEvm(seedPhrase, {
  provider: 'https://eth-mainnet.g.alchemy.com/v2/your-api-key'
})

// Option 2: Using browser provider (e.g., MetaMask)
const account = new WalletAccountEvm(seedPhrase, {
  provider: window.ethereum
})

// Option 3: Using custom JsonRpcProvider
import { JsonRpcProvider } from 'ethers'
const account = new WalletAccountEvm(seedPhrase, {
  provider: new JsonRpcProvider('https://eth-mainnet.g.alchemy.com/v2/your-api-key')
})
```

## ERC-4337 Configuration

When using ERC-4337 accounts, you can override configuration options during bridge operations:

```javascript
// Bridge with ERC-4337 account
const result = await bridgeProtocol.bridge({
  targetChain: 'arbitrum',
  recipient: '0x...', // Recipient address
  token: '0x...', // USDT contract address
  amount: 1000000000000000000n
}, {
  paymasterToken: '0x...', // Paymaster token for gasless transactions
  bridgeMaxFee: 1000000000000000n // Override maximum bridge fee
})
```

### Paymaster Token

The `paymasterToken` option specifies which token to use for paying gas fees in ERC-4337 accounts.

**Type:** `string` (optional)  
**Format:** Token contract address

**Example:**

```javascript
const result = await bridgeProtocol.bridge({
  targetChain: 'arbitrum',
  recipient: '0x...', // Recipient address
  token: '0x...', // USDT contract address
  amount: 1000000000000000000n
}, {
  paymasterToken: '0x...' // Paymaster token address
})
```

## Network Support

The bridge protocol works with EVM-compatible networks. Change the provider URL in the wallet account configuration:

```javascript
// Ethereum Mainnet
const ethereumAccount = new WalletAccountEvm(seedPhrase, {
  provider: 'https://eth-mainnet.g.alchemy.com/v2/your-api-key'
})

// Arbitrum
const arbitrumAccount = new WalletAccountEvm(seedPhrase, {
  provider: 'https://arb1.arbitrum.io/rpc'
})

// Polygon
const polygonAccount = new WalletAccountEvm(seedPhrase, {
  provider: 'https://polygon-rpc.com'
})
```

## Bridge Options

When calling the bridge method, you need to provide bridge options:

```javascript
const bridgeOptions = {
  targetChain: 'arbitrum', // Destination chain name
  recipient: '0x...', // Recipient address
  token: '0x...', // USDT contract address
  amount: 1000000000000000000n // Amount to bridge in base units
}

const result = await bridgeProtocol.bridge(bridgeOptions)
```

### Target Chain

The `targetChain` option specifies which blockchain to bridge tokens to.

**Type:** `string`  
**Supported values:** `'ethereum'`, `'arbitrum'`, `'polygon'`, `'berachain'`, `'ink'`, `'ton'`, `'tron'`

### Recipient

The `recipient` option specifies the address that will receive the bridged tokens.

**Type:** `string`  
**Format:** Valid address for the target chain

### Token

The `token` option specifies which token contract to bridge.

**Type:** `string`  
**Format:** Token contract address on the source chain

### Amount

The `amount` option specifies how many tokens to bridge.

**Type:** `bigint`  
**Unit:** Base units of the token (e.g., for USDT: 1 USDT = 1000000n)

## Error Handling

The bridge protocol will throw errors for invalid configurations:

```javascript
try {
  const result = await bridgeProtocol.bridge({
    targetChain: 'invalid-chain',
    recipient: '0x...', // Recipient address
    token: '0x...', // USDT contract address
    amount: 1000000000000000000n
  })
} catch (error) {
  if (error.message.includes('not supported')) {
    console.error('Chain or token not supported')
  }
  if (error.message.includes('Exceeded maximum fee')) {
    console.error('Bridge fee too high')
  }
  if (error.message.includes('must be connected to a provider')) {
    console.error('Wallet not connected to blockchain')
  }
}
```