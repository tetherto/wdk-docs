---
title: Wallet EVM Guides
description: Installation, quick start, and usage examples for @wdk/wallet-evm
author: Matteo Giardino
lastReviewed: 2025-06-26
---

# Guides

## Installation

```bash
npm install @wdk/wallet-evm
```

## Quick Start

### Creating a New Wallet

```javascript
import WalletManagerEvm from '@wdk/wallet-evm'

// Generate a new random seed phrase (you'll need to implement this or use a library)
const seedPhrase = 'your twelve word seed phrase here' // Replace with actual seed generation
console.log('Seed phrase:', seedPhrase)

// Create wallet manager with RPC provider
const wallet = new WalletManagerEvm(seedPhrase, {
  provider: 'https://rpc.mevblocker.io/fast' // or any other RPC provider
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

### Checking Balances

```javascript
// Get native token balance (ETH, MATIC, BNB, etc.)
const balance = await account.getBalance()
console.log('Native balance:', balance, 'wei')

// Get ERC-20 token balance
const tokenAddress = '0xA0b86a33E6441b8c4C8C8C8C8C8C8C8C8C8C8C8C'
const tokenBalance = await account.getTokenBalance(tokenAddress)
console.log('Token balance:', tokenBalance)
```

### Sending Transactions

```javascript
// Send native tokens
const result = await account.sendTransaction({
  to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  value: 1000000000000000000n, // 1 ETH in wei
  gasLimit: 21000
})
console.log('Transaction hash:', result.hash)
console.log('Transaction fee:', result.fee, 'wei')

// Get transaction fee estimate
const quote = await account.quoteSendTransaction({
  to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  value: 1000000000000000000n
})
console.log('Estimated fee:', quote.fee, 'wei')
```

### Token Transfers

```javascript
// Transfer ERC-20 tokens
const transferResult = await account.transfer({
  token: '0xA0b86a33E6441b8c4C8C8C8C8C8C8C8C8C8C8C8C',
  recipient: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  amount: 1000000000000000000n // 1 token in base units
})
console.log('Transfer hash:', transferResult.hash)
console.log('Transfer fee:', transferResult.fee, 'wei')

// Quote token transfer
const transferQuote = await account.quoteTransfer({
  token: '0xA0b86a33E6441b8c4C8C8C8C8C8C8C8C8C8C8C8C',
  recipient: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  amount: 1000000000000000000n
})
console.log('Transfer fee estimate:', transferQuote.fee, 'wei')
```

### Message Signing and Verification

```javascript
// Sign a message
const message = 'Hello, Ethereum!'
const signature = await account.sign(message)
console.log('Signature:', signature)

// Verify a signature
const isValid = await account.verify(message, signature)
console.log('Signature valid:', isValid)
```

### Fee Management

```javascript
// Get current fee rates from wallet manager
const feeRates = await wallet.getFeeRates()
console.log('Normal fee rate:', feeRates.normal, 'wei')
console.log('Fast fee rate:', feeRates.fast, 'wei')

// Send transaction with custom gas settings
const txWithCustomGas = await account.sendTransaction({
  to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  value: 1000000000000000000n,
  maxFeePerGas: feeRates.fast,
  maxPriorityFeePerGas: 2000000000n // 2 gwei
})
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
import WalletManagerEvm from '@wdk/wallet-evm'

async function setupWallet() {
  // Use existing seed phrase or generate one
  const seedPhrase = 'your twelve word seed phrase here' // Replace with actual seed
  console.log('Using seed phrase:', seedPhrase)
  
  // Create wallet manager
  const wallet = new WalletManagerEvm(seedPhrase, {
    provider: 'https://rpc.mevblocker.io/fast' 
  })
  
  // Get first account
  const account = await wallet.getAccount(0)
  const address = await account.getAddress()
  console.log('Wallet address:', address)
  
  // Check balance
  const balance = await account.getBalance()
  console.log('Balance:', balance, 'wei')
  
  return { wallet, account, address, balance }
}
```

### Multi-Account Management

```javascript
async function manageMultipleAccounts(wallet) {
  const accounts = []
  
  // Create 5 accounts
  for (let i = 0; i < 5; i++) {
    const account = await wallet.getAccount(i)
    const address = await account.getAddress()
    const balance = await account.getBalance()
    
    accounts.push({
      index: i,
      address,
      balance
    })
  }
  
  return accounts
}
```

### Advanced Transaction Example

```javascript
async function sendAdvancedTransaction(account, wallet) {
  // Get current fee rates from wallet manager
  const feeRates = await wallet.getFeeRates()
  
  // Send transaction with EIP-1559 fee mechanism
  const result = await account.sendTransaction({
    to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    value: 1000000000000000000n, // 1 ETH
    data: '0x', // Optional transaction data
    gasLimit: 21000,
    maxFeePerGas: feeRates.fast,
    maxPriorityFeePerGas: 2000000000n // 2 gwei
  })
  
  console.log('Transaction sent:', result.hash)
  console.log('Fee paid:', result.fee, 'wei')
  
  return result
}
```

### Token Transfer with Validation

```javascript
async function transferTokenWithValidation(account, tokenAddress, recipient, amount) {
  // Validate token address
  if (!tokenAddress.startsWith('0x') || tokenAddress.length !== 42) {
    throw new Error('Invalid token address')
  }
  
  // Validate recipient address
  if (!recipient.startsWith('0x') || recipient.length !== 42) {
    throw new Error('Invalid recipient address')
  }
  
  // Check token balance
  const balance = await account.getTokenBalance(tokenAddress)
  if (balance < amount) {
    throw new Error('Insufficient token balance')
  }
  
  // Get transfer quote
  const quote = await account.quoteTransfer({
    token: tokenAddress,
    recipient,
    amount
  })
  
  console.log('Transfer fee estimate:', quote.fee, 'wei')
  
  // Execute transfer
  const result = await account.transfer({
    token: tokenAddress,
    recipient,
    amount
  })
  
  console.log('Transfer completed:', result.hash)
  return result
}
```

### Error Handling

```javascript
try {
  const result = await account.sendTransaction({
    to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    value: 1000000000000000000n
  })
  console.log('Transaction successful:', result.hash)
} catch (error) {
  console.error('Transaction failed:', error.message)
  // Handle specific error types
  if (error.message.includes('insufficient funds')) {
    console.log('Please add more funds to your wallet')
  }
}
``` 