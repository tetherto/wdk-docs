---
title: WDK Core API Reference
description: Complete API documentation for @wdk/core
author: Raquel Carrasco
lastReviewed: 2025-09-11
icon: code
---

# API Reference

## Table of Contents

| Class | Description | Methods |
|-------|-------------|---------|
| [WdkManager](#wdkmanager) | Main class for managing wallets across multiple blockchains. Orchestrates wallet managers and protocols. | [Constructor](#constructor), [Methods](#methods) |
| [IWalletAccountWithProtocols](#iwalletaccountwithprotocols) | Extended wallet account interface that supports protocol registration and access. Extends `IWalletAccount`. | [Methods](#methods-1) |

## WdkManager

The main class for managing wallets across multiple blockchains. This class serves as an orchestrator that allows you to register different wallet managers and protocols, providing a unified interface for multi-chain operations.

### Constructor

```javascript
new WdkManager(seed)
```

**Parameters:**
- `seed` (string | Uint8Array): BIP-39 mnemonic seed phrase or seed bytes

**Example:**
```javascript
import WdkManager from '@wdk/core'

// With seed phrase
const wdk = new WdkManager('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about')

// With seed bytes
const seedBytes = new Uint8Array([...])
const wdk2 = new WdkManager(seedBytes)
```

### Methods

| Method | Description | Returns | Throws |
|--------|-------------|---------|--------|
| `registerWallet(blockchain, wallet, config)` | Registers a new wallet manager for a blockchain | `WdkManager` | - |
| `registerProtocol(blockchain, label, protocol, config)` | Registers a protocol globally for a blockchain | `WdkManager` | - |
| `registerMiddleware(blockchain, middleware)` | Registers middleware for account decoration | `WdkManager` | - |
| `getAccount(blockchain, index?)` | Returns a wallet account for a blockchain and index | `Promise<IWalletAccountWithProtocols>` | If wallet not registered |
| `getAccountByPath(blockchain, path)` | Returns a wallet account for a blockchain and derivation path | `Promise<IWalletAccountWithProtocols>` | If wallet not registered |
| `getFeeRates()` | Returns current fee rates | `Promise<FeeRates>` | - |
| `dispose()` | Disposes all wallets and accounts, clearing sensitive data | `void` | - |

##### `registerWallet(blockchain, wallet, config)`
Registers a new wallet manager for a specific blockchain.

**Type Parameters:**
- `W`: `typeof WalletManager` - A class that extends the `@wdk/wallet`'s `WalletManager` class

**Parameters:**
- `blockchain` (string): The name of the blockchain (e.g., "ethereum", "ton", "bitcoin")
- `wallet` (W): The wallet manager class
- `config` (ConstructorParameters<W>[1]): The configuration object for the wallet

**Returns:** `WdkManager` - The wdk manager instance (supports method chaining)

**Example:**
```javascript
import WdkManager from '@wdk/core'
import WalletManagerEvm from '@wdk/wallet-evm'
import WalletManagerTon from '@wdk/wallet-ton'

const wdk = new WdkManager(seedPhrase)

// Register EVM wallet
wdk.registerWallet('ethereum', WalletManagerEvm, {
  provider: 'https://mainnet.infura.io/v3/YOUR_API_KEY'
})

// Register TON wallet
wdk.registerWallet('ton', WalletManagerTon, {
  tonApiKey: 'YOUR_TON_API_KEY',
  tonApiEndpoint: 'https://tonapi.io'
})

// Method chaining
const wdk2 = new WdkManager(seedPhrase)
  .registerWallet('ethereum', WalletManagerEvm, ethereumConfig)
  .registerWallet('ton', WalletManagerTon, tonConfig)
```

##### `registerProtocol(blockchain, label, protocol, config)`
Registers a protocol globally for all accounts of a specific blockchain.

**Type Parameters:**
- `P`: `typeof SwapProtocol | typeof BridgeProtocol | typeof LendingProtocol` - A class that extends one of the `@wdk/wallet/protocol`'s classes

**Parameters:**
- `blockchain` (string): The name of the blockchain
- `label` (string): Unique label for the protocol (must be unique per blockchain and protocol type)
- `protocol` (P): The protocol class
- `config` (ConstructorParameters<P>[1]): The protocol configuration

**Returns:** `WdkManager` - The wdk manager instance (supports method chaining)

**Example:**
```javascript
import ParaswapProtocolEvm from '@wdk/protocol-swap-paraswap-evm'
import Usdt0ProtocolTon from '@wdk/protocol-bridge-usdt0-ton'

// Register swap protocol for Ethereum
wdk.registerProtocol('ethereum', 'paraswap', ParaswapProtocolEvm, {
  apiKey: 'YOUR_PARASWAP_API_KEY'
})

// Register bridge protocol for TON
wdk.registerProtocol('ton', 'usdt0', Usdt0ProtocolTon, {
  tonApiKey: 'YOUR_TON_API_KEY'
})

// Method chaining
const wdk2 = new WdkManager(seedPhrase)
  .registerWallet('ethereum', WalletManagerEvm, ethereumConfig)
  .registerProtocol('ethereum', 'paraswap', ParaswapProtocolEvm, paraswapConfig)
```

##### `registerMiddleware(blockchain, middleware)`
Registers middleware for account decoration and enhanced functionality.

**Parameters:**
- `blockchain` (string): The name of the blockchain
- `middleware` (`<A extends IWalletAccount>(account: A) => Promise<A | void>`): Middleware function called when deriving accounts

**Returns:** `WdkManager` - The wdk manager instance (supports method chaining)

**Example:**
```javascript
// Simple logging middleware
wdk.registerMiddleware('ethereum', async (account) => {
  console.log('New account:', await account.getAddress())
})

// Failover cascade middleware
import { getFailoverCascadeMiddleware } from '@wdk/wrapper-failover-cascade'

wdk.registerMiddleware('ethereum', getFailoverCascadeMiddleware({
  fallbackOptions: {
    retries: 3,
    delay: 1000
  }
}))

// Method chaining
const wdk2 = new WdkManager(seedPhrase)
  .registerWallet('ethereum', WalletManagerEvm, ethereumConfig)
  .registerMiddleware('ethereum', loggingMiddleware)
```

##### `getAccount(blockchain, index?)`
Returns a wallet account for a specific blockchain and index using BIP-44 derivation.

**Parameters:**
- `blockchain` (string): The name of the blockchain (e.g., "ethereum")
- `index` (number, optional): The index of the account to get (default: 0)

**Returns:** `Promise<IWalletAccountWithProtocols>` - The wallet account with protocol support

**Throws:** Error if no wallet has been registered for the given blockchain

**Example:**
```javascript
// Get first account (index 0)
const account = await wdk.getAccount('ethereum', 0)

// Get second account (index 1)
const account1 = await wdk.getAccount('ethereum', 1)

// Default index (0)
const defaultAccount = await wdk.getAccount('ethereum')

// This will throw an error if no wallet registered for 'tron'
try {
  const tronAccount = await wdk.getAccount('tron', 0)
} catch (error) {
  console.error('No wallet registered for tron blockchain')
}
```

##### `getAccountByPath(blockchain, path)`
Returns a wallet account for a specific blockchain and BIP-44 derivation path.

**Parameters:**
- `blockchain` (string): The name of the blockchain (e.g., "ethereum")
- `path` (string): The derivation path (e.g., "0'/0/0")

**Returns:** `Promise<IWalletAccountWithProtocols>` - The wallet account with protocol support

**Throws:** Error if no wallet has been registered for the given blockchain

**Example:**
```javascript
// Full path: m/44'/60'/0'/0/1
const account = await wdk.getAccountByPath('ethereum', "0'/0/1")

// Different derivation path
const customAccount = await wdk.getAccountByPath('ton', "1'/2/3")
```

##### `getFeeRates()`
Returns current fee rates for all registered blockchains.

**Returns:** `Promise<FeeRates>` - The fee rates in base units

**Example:**
```javascript
const feeRates = await wdk.getFeeRates()
console.log('Fee rates:', feeRates)
```

##### `dispose()`
Disposes all wallets and accounts, erasing any sensitive data from memory.

**Example:**
```javascript
// Clean up all sensitive data
wdk.dispose()
```

### Static Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `getRandomSeedPhrase()` | Returns a random BIP-39 seed phrase | `string` |
| `isValidSeedPhrase(seedPhrase)` | Checks if a seed phrase is valid | `boolean` |

##### `getRandomSeedPhrase()`
Returns a random BIP-39 seed phrase.

**Returns:** `string` - The seed phrase

**Example:**
```javascript
const seedPhrase = WdkManager.getRandomSeedPhrase()
console.log('Generated seed:', seedPhrase)
// Output: "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"
```

##### `isValidSeedPhrase(seedPhrase)`
Checks if a seed phrase is valid according to BIP-39 standards.

**Parameters:**
- `seedPhrase` (string): The seed phrase to validate

**Returns:** `boolean` - True if the seed phrase is valid

**Example:**
```javascript
const isValid = WdkManager.isValidSeedPhrase('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about')
console.log('Seed phrase valid:', isValid) // true

const isInvalid = WdkManager.isValidSeedPhrase('invalid seed phrase')
console.log('Seed phrase valid:', isInvalid) // false
```

## IWalletAccountWithProtocols

Extended wallet account interface that supports protocol registration and access. Extends `IWalletAccount` from `@wdk/wallet`.

### Methods

| Method | Description | Returns | Throws |
|--------|-------------|---------|--------|
| `registerProtocol(label, protocol, config)` | Registers a protocol for this specific account | `IWalletAccountWithProtocols` | - |
| `getSwapProtocol(label)` | Returns the swap protocol with the given label | `ISwapProtocol` | If protocol not found |
| `getBridgeProtocol(label)` | Returns the bridge protocol with the given label | `IBridgeProtocol` | If protocol not found |
| `getLendingProtocol(label)` | Returns the lending protocol with the given label | `ILendingProtocol` | If protocol not found |

##### `registerProtocol(label, protocol, config)`
Registers a new protocol for this specific account.

**Type Parameters:**
- `P`: `typeof SwapProtocol | typeof BridgeProtocol | typeof LendingProtocol` - A class that extends one of the `@wdk/wallet/protocol`'s classes

**Parameters:**
- `label` (string): Unique label for the protocol (must be unique per account and protocol type)
- `protocol` (P): The protocol class
- `config` (ConstructorParameters<P>[1]): The protocol configuration

**Returns:** `IWalletAccountWithProtocols` - The account instance (supports method chaining)

**Example:**
```javascript
import Usdt0ProtocolEvm from '@wdk/protocol-bridge-usdt0-evm'

const account = await wdk.getAccount('ethereum', 0)

// Register protocol for this specific account
account.registerProtocol('usdt0', Usdt0ProtocolEvm, {
  apiKey: 'YOUR_API_KEY'
})

// Method chaining
const account2 = await wdk.getAccount('ethereum', 1)
  .registerProtocol('usdt0', Usdt0ProtocolEvm, usdt0Config)
```

##### `getSwapProtocol(label)`
Returns the swap protocol with the given label.

**Parameters:**
- `label` (string): The protocol label

**Returns:** `ISwapProtocol` - The swap protocol instance

**Throws:** Error if no swap protocol with the given label has been registered

**Example:**
```javascript
import ParaswapProtocolEvm from '@wdk/protocol-swap-paraswap-evm'

// Register swap protocol
account.registerProtocol('paraswap', ParaswapProtocolEvm, paraswapConfig)

// Get swap protocol
const paraswap = account.getSwapProtocol('paraswap')

// Use the protocol
const swapResult = await paraswap.swap({
  tokenIn: '0x...',
  tokenOut: '0x...',
  amountIn: 1000000,
  slippage: 0.01
})

// This will throw an error
try {
  const uniswap = account.getSwapProtocol('uniswap')
} catch (error) {
  console.error('No swap protocol with label "uniswap" found')
}
```

##### `getBridgeProtocol(label)`
Returns the bridge protocol with the given label.

**Parameters:**
- `label` (string): The protocol label

**Returns:** `IBridgeProtocol` - The bridge protocol instance

**Throws:** Error if no bridge protocol with the given label has been registered

**Example:**
```javascript
import Usdt0ProtocolTon from '@wdk/protocol-bridge-usdt0-ton'

// Register bridge protocol
account.registerProtocol('usdt0', Usdt0ProtocolTon, usdt0Config)

// Get bridge protocol
const usdt0 = account.getBridgeProtocol('usdt0')

// Use the protocol
const bridgeResult = await usdt0.bridge({
  targetChain: 'ethereum',
  recipient: '0x...',
  amount: 1000000
})
```

##### `getLendingProtocol(label)`
Returns the lending protocol with the given label.

**Parameters:**
- `label` (string): The protocol label

**Returns:** `ILendingProtocol` - The lending protocol instance

**Throws:** Error if no lending protocol with the given label has been registered

**Example:**
```javascript
import AaveProtocolEvm from '@wdk/protocol-lending-aave-evm'

// Register lending protocol
account.registerProtocol('aave', AaveProtocolEvm, aaveConfig)

// Get lending protocol
const aave = account.getLendingProtocol('aave')

// Use the protocol
const lendResult = await aave.lend({
  token: '0x...',
  amount: 1000000,
  interestRateMode: 'stable'
})
```

## Complete Example

```javascript
import WdkManager from '@wdk/core'
import WalletManagerEvm from '@wdk/wallet-evm'
import WalletManagerTon from '@wdk/wallet-ton'
import ParaswapProtocolEvm from '@wdk/protocol-swap-paraswap-evm'
import Usdt0ProtocolTon from '@wdk/protocol-bridge-usdt0-ton'

// Initialize WDK Manager
const wdk = new WdkManager(seedPhrase)
  .registerWallet('ethereum', WalletManagerEvm, {
    provider: 'https://mainnet.infura.io/v3/YOUR_API_KEY'
  })
  .registerWallet('ton', WalletManagerTon, {
    tonApiKey: 'YOUR_TON_API_KEY',
    tonApiEndpoint: 'https://tonapi.io'
  })
  .registerProtocol('ethereum', 'paraswap', ParaswapProtocolEvm, {
    apiKey: 'YOUR_PARASWAP_API_KEY'
  })
  .registerProtocol('ton', 'usdt0', Usdt0ProtocolTon, {
    tonApiKey: 'YOUR_TON_API_KEY'
  })

// Get accounts
const accountEth = await wdk.getAccount('ethereum', 3)
const accountTon = await wdk.getAccountByPath('ton', "1'/2/3")

// Use wallet account methods
const { hash, fee } = await accountEth.sendTransaction({
  to: '0x...',
  value: 1000000000000000000 // 1 ETH
})

// Use protocols
const paraswap = accountEth.getSwapProtocol('paraswap')
const swapResult = await paraswap.swap(swapOptions)

const usdt0 = accountTon.getBridgeProtocol('usdt0')
const bridgeResult = await usdt0.bridge(bridgeOptions)

// Clean up
wdk.dispose()
```

## Types

### FeeRates

```typescript
interface FeeRates {
  [blockchain: string]: {
    normal: number;
    fast: number;
  };
}
```

### Middleware Function

```typescript
type MiddlewareFunction = <A extends IWalletAccount>(
  account: A
) => Promise<A | void>;
```

### Protocol Types

```typescript
// Swap Protocol
interface ISwapProtocol {
  swap(options: SwapOptions): Promise<SwapResult>;
}

// Bridge Protocol  
interface IBridgeProtocol {
  bridge(options: BridgeOptions): Promise<BridgeResult>;
}

// Lending Protocol
interface ILendingProtocol {
  lend(options: LendingOptions): Promise<LendingResult>;
}
```
