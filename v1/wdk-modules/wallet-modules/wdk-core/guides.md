---
title: WDK Core Guides
description: Installation, quick start, and usage examples for @tetherto/wdk
lastReviewed: 2025-09-11
icon: book-open
---

## Installation

To install the `@tetherto/wdk` package, follow these instructions:

### Public Release

Once the package is publicly available, you can install it using npm:

```bash
npm install @tetherto/wdk
```

## Quick Start

### Importing from `@tetherto/wdk`

1. WDK: This is the main class for managing wallets across multiple blockchains.
2. IWalletAccountWithProtocols: Extended account interface with protocol support.

### Creating a New WDK Manager

```javascript
import WDK from '@tetherto/wdk'

// Generate a random seed phrase
const seedPhrase = WDK.getRandomSeedPhrase()
console.log('Generated seed:', seedPhrase)

// Or use your own seed phrase
const wdk = new WDK(seedPhrase)
```

### Registering Wallets

```javascript
import WalletManagerEvm from '@tetherto/wdk-wallet-evm'
import WalletManagerTon from '@tetherto/wdk-wallet-ton'

// Register wallets for different blockchains
const wdk = new WDK(seedPhrase)
  .registerWallet('ethereum', WalletManagerEvm, {
    provider: 'https://eth.drpc.org'
  })
  .registerWallet('ton', WalletManagerTon, {
    tonApiKey: 'YOUR_TON_API_KEY',
    tonApiEndpoint: 'https://tonapi.io'
  })
```

### Getting Accounts

```javascript
// Get account by blockchain and index
const ethAccount = await wdk.getAccount('ethereum', 0)
const tonAccount = await wdk.getAccount('ton', 0)

// Get account by derivation path
const customEthAccount = await wdk.getAccountByPath('ethereum', "0'/0/1")
const customTonAccount = await wdk.getAccountByPath('ton', "1'/2/3")

// Get addresses
const ethAddress = await ethAccount.getAddress()
const tonAddress = await tonAccount.getAddress()
console.log('Ethereum address:', ethAddress)
console.log('TON address:', tonAddress)
```

### Registering Protocols

```javascript
import veloraProtocolEvm from '@tetherto/wdk-protocol-swap-velora-evm'
import Usdt0ProtocolTon from '@tetherto/wdk-protocol-bridge-usdt0-ton'

// Register protocols globally
const wdk = new WDK(seedPhrase)
  .registerWallet('ethereum', WalletManagerEvm, ethereumWalletConfig)
  .registerWallet('ton', WalletManagerTon, tonWalletConfig)
  .registerProtocol('ethereum', 'velora', veloraProtocolEvm, {
    apiKey: 'YOUR_velora_API_KEY'
  })
  .registerProtocol('ton', 'usdt0', Usdt0ProtocolTon, {
    tonApiKey: 'YOUR_TON_API_KEY'
  })
```

### Using Protocols

```javascript
// Get accounts with protocol support
const ethAccount = await wdk.getAccount('ethereum', 0)
const tonAccount = await wdk.getAccount('ton', 0)

// Use swap protocol
const velora = ethAccount.getSwapProtocol('velora')
const swapResult = await velora.swap({
  tokenIn: '0x...',
  tokenOut: '0x...',
  amountIn: 1000000,
  slippage: 0.01
})

// Use bridge protocol
const usdt0 = tonAccount.getBridgeProtocol('usdt0')
const bridgeResult = await usdt0.bridge({
  targetChain: 'ethereum',
  recipient: '0x...',
  amount: 1000000
})
```

## Multi-Chain Operations

### Managing Multiple Blockchains

```javascript
import WalletManagerEvm from '@tetherto/wdk-wallet-evm'
import WalletManagerTon from '@tetherto/wdk-wallet-ton'
import WalletManagerBtc from '@tetherto/wdk-wallet-btc'

const wdk = new WDK(seedPhrase)
  .registerWallet('ethereum', WalletManagerEvm, {
    provider: 'https://eth.drpc.org'
  })
  .registerWallet('arbitrum', WalletManagerEvm, {
    provider: 'https://arbitrum-mainnet.infura.io/v3/YOUR_API_KEY'
  })
  .registerWallet('ton', WalletManagerTon, {
    tonApiKey: 'YOUR_TON_API_KEY'
  })
  .registerWallet('bitcoin', WalletManagerBtc, {
    provider: 'https://blockstream.info/api'
  })

// Get accounts for different chains
const accounts = {
  ethereum: await wdk.getAccount('ethereum', 0),
  arbitrum: await wdk.getAccount('arbitrum', 0),
  ton: await wdk.getAccount('ton', 0),
  bitcoin: await wdk.getAccount('bitcoin', 0)
}

// Get all addresses
for (const [chain, account] of Object.entries(accounts)) {
  const address = await account.getAddress()
  console.log(`${chain} address:`, address)
}
```

### Cross-Chain Balance Checking

```javascript
async function checkAllBalances(wdk) {
  const chains = ['ethereum', 'arbitrum', 'ton', 'bitcoin']
  const balances = {}
  
  for (const chain of chains) {
    try {
      const account = await wdk.getAccount(chain, 0)
      const balance = await account.getBalance()
      balances[chain] = balance
      console.log(`${chain} balance:`, balance)
    } catch (error) {
      console.log(`${chain}: Wallet not registered`)
    }
  }
  
  return balances
}
```

### Sending Transactions Across Chains

```javascript
async function sendMultiChainTransactions(wdk) {
  // Ethereum transaction
  const ethAccount = await wdk.getAccount('ethereum', 0)
  const ethResult = await ethAccount.sendTransaction({
    to: '0x...',
    value: 1000000000000000000 // 1 ETH
  })
  console.log('Ethereum transaction:', ethResult.hash)
  
  // TON transaction
  const tonAccount = await wdk.getAccount('ton', 0)
  const tonResult = await tonAccount.sendTransaction({
    to: 'T...',
    value: 1000000000 // 1 TON
  })
  console.log('TON transaction:', tonResult.hash)
}
```

## Protocol Management

### Registering Account-Specific Protocols

```javascript
import veloraProtocolEvm from '@tetherto/wdk-protocol-swap-velora-evm'

// Register protocol for specific account
const ethAccount = await wdk.getAccount('ethereum', 0)

wdk.registerProtocol('ethereum', 'velora' veloraProtocolEvm, veloraProtocolConfig)

// or, more concisely:

const wdk = new WDK('...')
    .registerProtocol('ethereum', 'velora' veloraProtocolEvm, veloraProtocolConfig)

```

### Multiple Protocol Types

```javascript
// Register different protocol types
const account = await wdk.getAccount('ethereum', 0)

// Swap protocol
account.registerProtocol('velora', veloraProtocolEvm, veloraConfig)
const velora = account.getSwapProtocol('velora')

// Bridge protocol
account.registerProtocol('usdt0', Usdt0ProtocolEvm, usdt0Config)
const usdt0 = account.getBridgeProtocol('usdt0')

// Lending protocol
account.registerProtocol('aave', AaveProtocolEvm, aaveConfig)
const aave = account.getLendingProtocol('aave')
```

## Middleware Usage

### Logging Middleware

```javascript
// Register logging middleware
wdk.registerMiddleware('ethereum', async (account) => {
  const address = await account.getAddress()
  console.log('New Ethereum account created:', address)
})

wdk.registerMiddleware('ton', async (account) => {
  const address = await account.getAddress()
  console.log('New TON account created:', address)
})

// This will trigger the middleware
const account = await wdk.getAccount('ethereum', 0)
```

### Failover Middleware

```javascript
import { getFailoverCascadeMiddleware } from '@tetherto/wdk-wrapper-failover-cascade'

// Register failover middleware
wdk.registerMiddleware('ethereum', getFailoverCascadeMiddleware({
  retries: 3,
  delay: 1000,
  fallbackProviders: [
    'https://backup-rpc-1.com',
    'https://backup-rpc-2.com'
  ]
}))

// Transactions will automatically retry with fallback providers
const account = await wdk.getAccount('ethereum', 0)
const result = await account.sendTransaction(tx) // Will retry on failure
```

## Complete Examples

### Complete Multi-Chain Setup

```javascript
import WDK from '@tetherto/wdk'
import WalletManagerEvm from '@tetherto/wdk-wallet-evm'
import WalletManagerTon from '@tetherto/wdk-wallet-ton'
import veloraProtocolEvm from '@tetherto/wdk-protocol-swap-velora-evm'

async function setupMultiChainWallet() {
  // Generate or use existing seed phrase
  const seedPhrase = WDK.getRandomSeedPhrase()
  
  // Initialize WDK Manager
  const wdk = new WDK(seedPhrase)
    .registerWallet('ethereum', WalletManagerEvm, {
      provider: 'https://eth.drpc.org'
    })
    .registerWallet('ton', WalletManagerTon, {
      tonApiKey: 'YOUR_TON_API_KEY'
    })
    .registerProtocol('ethereum', 'velora', veloraProtocolEvm, {
      apiKey: 'YOUR_velora_API_KEY'
    })
  
  // Get accounts
  const ethAccount = await wdk.getAccount('ethereum', 0)
  const tonAccount = await wdk.getAccount('ton', 0)
  
  // Get addresses
  const ethAddress = await ethAccount.getAddress()
  const tonAddress = await tonAccount.getAddress()
  
  console.log('Ethereum address:', ethAddress)
  console.log('TON address:', tonAddress)
  
  return { wdk, ethAccount, tonAccount }
}
```

### Advanced Protocol Usage

```javascript
async function advancedProtocolUsage(wdk) {
  const ethAccount = await wdk.getAccount('ethereum', 0)
  
  // Register multiple protocols
  ethAccount.registerProtocol('velora', veloraProtocolEvm, veloraConfig)
  ethAccount.registerProtocol('uniswap', UniswapProtocolEvm, uniswapConfig)
  
  // Use different swap protocols
  const velora = ethAccount.getSwapProtocol('velora')
  const uniswap = ethAccount.getSwapProtocol('uniswap')
  
  // Compare quotes
  const veloraQuote = await velora.quoteSwap(swapOptions)
  const uniswapQuote = await uniswap.quoteSwap(swapOptions)
  
  // Use the better quote
  const bestProtocol = veloraQuote.outputAmount > uniswapQuote.outputAmount ? velora : uniswap
  const result = await bestProtocol.swap(swapOptions)
  
  return result
}
```

### Error Handling

```javascript
async function handleErrors(wdk) {
  try {
    // This will throw if no wallet registered for 'tron'
    const tronAccount = await wdk.getAccount('tron', 0)
  } catch (error) {
    console.error('Tron wallet not registered:', error.message)
  }
  
  try {
    const ethAccount = await wdk.getAccount('ethereum', 0)
    
    // This will throw if no swap protocol registered
    const uniswap = ethAccount.getSwapProtocol('uniswap')
  } catch (error) {
    console.error('Uniswap protocol not registered:', error.message)
  }
}
```

### Memory Management

```javascript
async function cleanupExample(wdk) {
  // Use the WDK Manager
  const ethAccount = await wdk.getAccount('ethereum', 0)
  const tonAccount = await wdk.getAccount('ton', 0)
  
  // Perform operations
  const ethAddress = await ethAccount.getAddress()
  const tonAddress = await tonAccount.getAddress()
  
  // Clean up sensitive data
  wdk.dispose()
  
  // After dispose, accounts are no longer usable
  // This will throw an error
  try {
    await ethAccount.getAddress()
  } catch (error) {
    console.log('Account disposed, cannot access private keys')
  }
}
```

### Production Example

```javascript
import WDK from '@tetherto/wdk'
import WalletManagerEvm from '@tetherto/wdk-wallet-evm'
import WalletManagerTon from '@tetherto/wdk-wallet-ton'

class MultiChainWalletService {
  constructor(seedPhrase) {
    this.wdk = new WDK(seedPhrase)
      .registerWallet('ethereum', WalletManagerEvm, {
        provider: process.env.ETHEREUM_RPC_URL
      })
      .registerWallet('ton', WalletManagerTon, {
        tonApiKey: process.env.TON_API_KEY
      })
  }
  
  async getAccount(blockchain, index = 0) {
    return await this.wdk.getAccount(blockchain, index)
  }
  
  async getBalance(blockchain, index = 0) {
    const account = await this.getAccount(blockchain, index)
    return await account.getBalance()
  }
  
  async sendTransaction(blockchain, index, transaction) {
    const account = await this.getAccount(blockchain, index)
    return await account.sendTransaction(transaction)
  }
  
  dispose() {
    this.wdk.dispose()
  }
}

// Usage
const walletService = new MultiChainWalletService(process.env.SEED_PHRASE)
const ethBalance = await walletService.getBalance('ethereum', 0)
const tonBalance = await walletService.getBalance('ton', 0)
```
