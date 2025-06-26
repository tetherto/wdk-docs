---
title: Wallet BTC Guides
description: Installation, quick start, and usage examples for @wdk/wallet-btc
author: Matteo Giardino
lastReviewed: 2025-06-26
---

# Guides

## Installation

```bash
npm install @wdk/wallet-btc
```

## Quick Start

### Creating a New Bitcoin Wallet

```javascript
import WalletManagerBtc from '@wdk/wallet-btc'

// Use a BIP-39 seed phrase (replace with your own secure phrase)
const seedPhrase = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'

// Create wallet manager with default configuration
const wallet = new WalletManagerBtc(seedPhrase)

// Or with custom Electrum server configuration
const wallet = new WalletManagerBtc(seedPhrase, {
  host: 'electrum.blockstream.info',
  port: 50001,
  network: 'bitcoin' // 'bitcoin', 'testnet', or 'regtest'
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

### Checking Balance

```javascript
// Get Bitcoin balance in satoshis
const balance = await account.getBalance()
console.log('Balance:', balance, 'satoshis')
console.log('Balance:', balance / 100000000, 'BTC')
```

### Sending Bitcoin Transactions

```javascript
// Send Bitcoin (amount in satoshis)
const result = await account.sendTransaction({
  to: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  value: 100000 // 0.001 BTC
})
console.log('Transaction hash:', result.hash)
console.log('Transaction fee:', result.fee, 'satoshis')

// Get transaction fee estimate
const quote = await account.quoteSendTransaction({
  to: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  value: 100000
})
console.log('Estimated fee:', quote.fee, 'satoshis')
```

### Message Signing and Verification

```javascript
// Sign a message
const message = 'Hello, Bitcoin!'
const signature = await account.sign(message)
console.log('Signature:', signature)

// Verify a signature
const isValid = await account.verify(message, signature)
console.log('Signature valid:', isValid)
```

### Getting Transaction History

```javascript
// Get all transfers
const transfers = await account.getTransfers()
console.log('All transfers:', transfers)

// Get only incoming transfers
const incoming = await account.getTransfers({ direction: 'incoming' })
console.log('Incoming transfers:', incoming)

// Get only outgoing transfers with limit
const outgoing = await account.getTransfers({ 
  direction: 'outgoing', 
  limit: 5 
})
console.log('Recent outgoing transfers:', outgoing)
```

### Fee Management

```javascript
// Get current fee rates from mempool.space
const feeRates = await wallet.getFeeRates()
console.log('Normal fee rate:', feeRates.normal, 'sat/vB')
console.log('Fast fee rate:', feeRates.fast, 'sat/vB')
```

### Memory Management

```javascript
// Dispose wallet accounts to clear private keys from memory
account.dispose()

// Dispose entire wallet manager
wallet.dispose()
```

## Complete Examples

### Complete Bitcoin Wallet Setup

```javascript
import WalletManagerBtc from '@wdk/wallet-btc'

async function setupBitcoinWallet() {
  // Use a BIP-39 seed phrase (replace with your own secure phrase)
  const seedPhrase = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
  
  // Create Bitcoin wallet manager
  const wallet = new WalletManagerBtc(seedPhrase, {
    host: 'electrum.blockstream.info',
    port: 50001,
    network: 'bitcoin'
  })
  
  // Get first account
  const account = await wallet.getAccount(0)
  const address = await account.getAddress()
  console.log('Bitcoin address:', address)
  
  // Check balance
  const balance = await account.getBalance()
  console.log('Balance:', balance / 100000000, 'BTC')
  
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
      balance: balance / 100000000 // Convert to BTC
    })
  }
  
  return accounts
}
```

### Transaction History Analysis

```javascript
async function analyzeTransactionHistory(account) {
  // Get all transfers
  const allTransfers = await account.getTransfers()
  
  // Calculate total received
  const totalReceived = allTransfers
    .filter(t => t.direction === 'incoming')
    .reduce((sum, t) => sum + t.value, 0)
  
  // Calculate total sent
  const totalSent = allTransfers
    .filter(t => t.direction === 'outgoing')
    .reduce((sum, t) => sum + t.value, 0)
  
  // Calculate total fees
  const totalFees = allTransfers
    .filter(t => t.fee)
    .reduce((sum, t) => sum + t.fee, 0)
  
  return {
    totalReceived: totalReceived / 100000000, // BTC
    totalSent: totalSent / 100000000,         // BTC
    totalFees: totalFees / 100000000,         // BTC
    transactionCount: allTransfers.length
  }
}
```

### Fee Optimization

```javascript
async function sendWithOptimalFee(wallet, account, recipient, amount) {
  // Get current fee rates
  const feeRates = await wallet.getFeeRates()
  
  // Quote transaction with current fees
  const quote = await account.quoteSendTransaction({
    to: recipient,
    value: amount
  })
  
  console.log('Normal fee estimate:', quote.fee, 'satoshis')
  console.log('Current fee rates:', feeRates)
  
  // Send transaction
  const result = await account.sendTransaction({
    to: recipient,
    value: amount
  })
  
  console.log('Transaction sent:', result.hash)
  console.log('Actual fee paid:', result.fee, 'satoshis')
  
  return result
}
```

### Error Handling

```javascript
try {
  const result = await account.sendTransaction({
    to: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    value: 100000
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