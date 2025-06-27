---
title: Wallet Spark Guides
description: Installation, quick start, and usage examples for @wdk/wallet-spark
author: Matteo Giardino
lastReviewed: 2025-06-26
icon: book-open
---

# Guides

## Installation

```bash
npm install @wdk/wallet-spark
```

## Quick Start

### Creating a New Spark Wallet

```javascript
import WalletManagerSpark from '@wdk/wallet-spark'

// Use a [BIP-39](../../../resources/concepts.md#bip-39-mnemonic-seed-phrases) seed phrase (replace with your own secure phrase)
const seedPhrase = 'your twelve word seed phrase here' // Replace with actual seed generation


// Create wallet manager with default configuration
const wallet = new WalletManagerSpark(seedPhrase)

// Or with custom network configuration
const wallet = new WalletManagerSpark(seedPhrase, {
  network: 'MAINNET' // 'MAINNET', 'TESTNET', or 'REGTEST'
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
```

### Checking Balance

```javascript
// Get Spark balance in satoshis
const balance = await account.getBalance()
console.log('Balance:', balance, 'satoshis')
console.log('Balance:', balance / 100000000, 'BTC')
```

### Sending Spark Transactions

```javascript
// Send Bitcoin on Spark (fee-free transactions on [layer 2](../../../resources/concepts.md#layer-2-solutions))
const result = await account.sendTransaction({
  to: 'sp1pgssxdn5c2vxkqhetf58ssdy6fxz9hpwqd36uccm772gvudvsmueuxtm2leurf',
  value: 100000 // 0.001 BTC
})
console.log('Transaction hash:', result.hash)
console.log('Transaction fee:', result.fee, 'satoshis') // Always 0 on Spark

// Get transaction fee estimate
const quote = await account.quoteSendTransaction({
  to: 'sp1pgssxdn5c2vxkqhetf58ssdy6fxz9hpwqd36uccm772gvudvsmueuxtm2leurf',
  value: 100000
})
console.log('Estimated fee:', quote.fee, 'satoshis') // Always 0 on Spark
```

### Lightning Network Integration

```javascript
// Create a [Lightning Network](../../../resources/concepts.md#lightning-network) invoice for receiving payments
const invoice = await account.createLightningInvoice({
  value: 50000, // 0.0005 BTC
  memo: 'Payment for services'
})
console.log('Lightning invoice:', invoice.encodedInvoice)

// Pay a Lightning invoice
const payment = await account.payLightningInvoice({
  invoice: 'lnbc500u1p...', // [BOLT11](../../../resources/concepts.md#lightning-network) encoded invoice
  maxFeeSats: 1000 // Maximum fee willing to pay
})
console.log('Payment result:', payment)

// Get Lightning payment fee estimate
const feeEstimate = await account.getLightningSendFeeEstimate({
  invoice: 'lnbc500u1p...'
})
console.log('Fee estimate:', feeEstimate, 'satoshis')
```

### Bitcoin Layer 1 Bridge

```javascript
// Generate a single-use deposit address for Bitcoin layer 1 deposits
const depositAddress = await account.getSingleUseDepositAddress()
console.log('Deposit address:', depositAddress)

// Check if a deposit has been confirmed
const txId = await account.getLatestDepositTxId(depositAddress)
if (txId) {
  console.log('Deposit confirmed:', txId)
  
  // Claim the deposit to your Spark wallet
  const walletLeaves = await account.claimDeposit(txId)
  console.log('Deposit claimed:', walletLeaves)
}

// Withdraw Bitcoin from Spark to layer 1
const withdrawal = await account.withdraw({
  to: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  value: 100000 // 0.001 BTC
})
console.log('Withdrawal request:', withdrawal)
```

### Message Signing and Verification

```javascript
// Sign a message
const message = 'Hello, Spark!'
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

### Memory Management

```javascript
// Dispose wallet accounts to clear private keys from memory
account.dispose()

// Dispose entire wallet manager
wallet.dispose()
```

## Complete Examples

### Complete Spark Wallet Setup

```javascript
import WalletManagerSpark from '@wdk/wallet-spark'

async function setupSparkWallet() {
  // Use a [BIP-39](../../../resources/concepts.md#bip-39-mnemonic-seed-phrases) seed phrase (replace with your own secure phrase)
  const seedPhrase = 'your twelve word seed phrase here' // Replace with actual seed generation

  
  // Create Spark wallet manager
  const wallet = new WalletManagerSpark(seedPhrase, {
    network: 'MAINNET'
  })
  
  // Get first account
  const account = await wallet.getAccount(0)
  const address = await account.getAddress()
  console.log('Spark address:', address)
  
  // Check balance
  const balance = await account.getBalance()
  console.log('Balance:', balance / 100000000, 'BTC')
  
  return { wallet, account, address, balance }
}
```

### Lightning Network Integration

```javascript
async function lightningPaymentFlow(account) {
  // Create an invoice to receive payment
  const invoice = await account.createLightningInvoice({
    value: 100000, // 0.001 BTC
    memo: 'Payment for coffee'
  })
  console.log('Invoice created:', invoice.encodedInvoice)
  
  // Later, pay an invoice
  const payment = await account.payLightningInvoice({
    invoice: 'lnbc1000u1p...',
    maxFeeSats: 500
  })
  console.log('Payment sent:', payment)
}
```

### Bitcoin Layer 1 Bridge

```javascript
async function bitcoinBridgeFlow(account) {
  // Generate deposit address
  const depositAddress = await account.getSingleUseDepositAddress()
  console.log('Send Bitcoin to:', depositAddress)
  
  // Check for deposits
  const txId = await account.getLatestDepositTxId(depositAddress)
  if (txId) {
    // Claim the deposit
    const walletLeaves = await account.claimDeposit(txId)
    console.log('Deposit claimed:', walletLeaves)
  }
  
  // Withdraw to Bitcoin layer 1
  const withdrawal = await account.withdraw({
    to: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    value: 50000 // 0.0005 BTC
  })
  console.log('Withdrawal initiated:', withdrawal)
}
```

### Multi-Account Management

```javascript
async function manageMultipleAccounts(wallet) {
  const accounts = []
  
  // Create 3 accounts
  for (let i = 0; i < 3; i++) {
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
    .filter(t => t.transferDirection === 'INCOMING')
    .reduce((sum, t) => sum + t.amountSats, 0)
  
  // Calculate total sent
  const totalSent = allTransfers
    .filter(t => t.transferDirection === 'OUTGOING')
    .reduce((sum, t) => sum + t.amountSats, 0)
  
  return {
    totalReceived: totalReceived / 100000000, // BTC
    totalSent: totalSent / 100000000,         // BTC
    transactionCount: allTransfers.length
  }
}
```

### Error Handling

```javascript
try {
  const result = await account.sendTransaction({
    to: 'sp1pgssxdn5c2vxkqhetf58ssdy6fxz9hpwqd36uccm772gvudvsmueuxtm2leurf',
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