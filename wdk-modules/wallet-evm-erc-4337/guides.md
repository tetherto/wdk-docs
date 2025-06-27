---
title: Wallet EVM ERC-4337 Guides
description: Installation, quick start, and usage examples for @wdk/wallet-evm-erc-4337
author: Matteo Giardino
lastReviewed: 2025-06-26
icon: book-open
---

# Guides

## Installation

```bash
npm install @wdk/wallet-evm-erc-4337
```

## Quick Start

### Creating a New Wallet

```javascript
import WalletManagerEvmErc4337 from '@wdk/wallet-evm-erc-4337'

// Use a BIP-39 seed phrase (replace with your own secure phrase)
const seedPhrase = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'

// Create wallet manager with ERC-4337 configuration
const wallet = new WalletManagerEvmErc4337(seedPhrase, {
  chainId: 1, // Ethereum mainnet
  provider: 'https://rpc.mevblocker.io/fast',
  bundlerUrl: 'https://api.candide.dev/public/v3/ethereum',
  paymasterUrl: 'https://api.candide.dev/public/v3/ethereum',
  paymasterAddress: '0x8b1f6cb5d062aa2ce8d581942bbb960420d875ba',
  entryPointAddress: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
  safeModulesVersion: '1.0.0',
  paymasterToken: {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7'
  }
})
```

### Managing Multiple Accounts

```javascript
// Get the first account (index 0)
const account = await wallet.getAccount(0)
const address = await account.getAddress()
console.log('Account 0 address:', address)

// Get the second account (index 1)
const account1 = await wallet.getAccount(1)
const address1 = await account1.getAddress()
console.log('Account 1 address:', address1)

// Get account by custom derivation path
const customAccount = await wallet.getAccountByPath("0'/0/5")
const customAddress = await customAccount.getAddress()
console.log('Custom account address:', customAddress)
```

### Checking Paymaster Token Balance

```javascript
// Get paymaster token balance (e.g., DAI for paying fees)
const paymasterBalance = await account.getPaymasterTokenBalance()
console.log('Paymaster token balance:', paymasterBalance)

// Get native token balance (if any)
const nativeBalance = await account.getBalance()
console.log('Native balance:', nativeBalance, 'wei')
```

### Sending Gasless Transactions

```javascript
// Send a gasless transaction (fees paid in paymaster token)
const result = await account.sendTransaction({
  to: '0x...',
  value: 1000000000000000000n, // 1 ETH in wei
  data: '0x' // Optional transaction data
})
console.log('Transaction hash:', result.hash)
console.log('Transaction fee (in paymaster token):', result.fee)

// Get transaction fee estimate
const quote = await account.quoteSendTransaction({
  to: '0x...',
  value: 1000000000000000000n
})
console.log('Estimated fee (in paymaster token):', quote.fee)
```

### Token Transfers with Gasless Transactions

```javascript
// Transfer ERC-20 tokens using gasless transactions
const transferResult = await account.transfer({
  token: '0x...',
  recipient: '0x...',
  amount: 1000000000000000000n // 1 token in base units
})
console.log('Transfer hash:', transferResult.hash)
console.log('Transfer fee (in paymaster token):', transferResult.fee)

// Quote token transfer
const transferQuote = await account.quoteTransfer({
  token: '0x...',
  recipient: '0x...',
  amount: 1000000000000000000n
})
console.log('Transfer fee estimate (in paymaster token):', transferQuote.fee)
```

### Using Different Paymaster Tokens

```javascript
// Send transaction with a different paymaster token
const result = await account.sendTransaction({
  to: '0x...',
  value: 1000000000000000000n
}, {
  paymasterToken: {
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' // WETH
  }
})
console.log('Transaction paid with WETH:', result.hash)
```

### Memory Management

```javascript
// Dispose wallet accounts to clear private keys from memory
account.dispose()

// Dispose entire wallet manager
wallet.dispose()
```

## Complete Examples

### Complete Wallet Setup

```javascript
import WalletManagerEvmErc4337 from '@wdk/wallet-evm-erc-4337'

async function setupErc4337Wallet() {
  // Use a BIP-39 seed phrase (replace with your own secure phrase)
  const seedPhrase = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
  
  // Create ERC-4337 wallet manager
  const wallet = new WalletManagerEvmErc4337(seedPhrase, {
    chainId: 1, // Ethereum mainnet
    provider: 'https://rpc.mevblocker.io/fast',
    bundlerUrl: 'https://api.candide.dev/public/v3/ethereum',
    paymasterUrl: 'https://api.candide.dev/public/v3/ethereum',
    paymasterAddress: '0x8b1f6cb5d062aa2ce8d581942bbb960420d875ba',
    entryPointAddress: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
    safeModulesVersion: '1.0.0',
    paymasterToken: {
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' // USDT
    }
  })
  
  // Get first account
  const account = await wallet.getAccount(0)
  const address = await account.getAddress()
  console.log('Safe account address:', address)
  
  // Check paymaster token balance
  const paymasterBalance = await account.getPaymasterTokenBalance()
  console.log('Paymaster token balance:', paymasterBalance)
  
  return { wallet, account, address, paymasterBalance }
}
```

### Gasless Transaction Example

```javascript
async function sendGaslessTransaction(account) {
  // Send ETH without holding any ETH for gas fees
  const result = await account.sendTransaction({
    to: '0x...',
    value: 1000000000000000000n, // 1 ETH
    data: '0x' // Optional transaction data
  })
  
  console.log('Gasless transaction hash:', result.hash)
  console.log('Fee paid in paymaster token:', result.fee)
  
  return result
}
```

### Multi-Token Fee Payment

```javascript
async function sendTransactionWithDifferentToken(account) {
  // Send transaction paying fees with USDT instead of DAI
  const result = await account.sendTransaction({
    to: '0x...',
    value: 1000000000000000000n
  }, {
    paymasterToken: {
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' // USDT
    }
  })
  
  console.log('Transaction paid with USDT:', result.hash)
  return result
}
```

### Error Handling

```javascript
try {
  const result = await account.sendTransaction({
    to: '0x...',
    value: 1000000000000000000n
  })
  console.log('Gasless transaction successful:', result.hash)
} catch (error) {
  console.error('Transaction failed:', error.message)
  // Handle specific error types
  if (error.message.includes('insufficient paymaster token balance')) {
    console.log('Please add more paymaster tokens to your wallet')
  }
}
``` 