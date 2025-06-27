---
title: Wallet TON Guides
description: Installation, quick start, and usage examples for @wdk/wallet-ton
author: Raquel Carrasco Gonzalez
lastReviewed: 2025-06-26
icon: book-open
---

# Guides

## Installation

```bash
npm install @wdk/wallet-ton
```

## Quick Start

### Creating a New Wallet

```javascript
import WalletManagerTon from '@wdk/wallet-ton'

// Use a BIP-39 seed phrase (replace with your own secure phrase)
const seedPhrase = 'your twelve word seed phrase here' // Replace with actual seed generation

// Create wallet manager with TON RPC provider
const wallet = new WalletManagerTon(seedPhrase, {
  tonClient: { url: 'https://toncenter.com/api/v2/jsonRPC' } // or any other TON RPC provider
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
// Get native TON balance
const balance = await account.getBalance()
console.log('Native TON balance:', balance, 'nanotons')

// Get Jetton token balance
const jettonAddress = 'EQC...'; // Jetton master contract address (TON format)
const jettonBalance = await account.getTokenBalance(jettonAddress);
console.log('Jetton token balance:', jettonBalance);
```

### Sending Transactions

```javascript
// Send native TON
const result = await account.sendTransaction({
  to: 'EQC...', // TON address, e.g., starts with EQ...
  value: 1000000000 // 1 TON in nanotons (1 TON = 1_000_000_000 nanotons)
})
console.log('Transaction hash:', result.hash)
console.log('Transaction fee:', result.fee, 'nanotons')


// Get transaction fee estimate
const quote = await account.quoteSendTransaction({
  to: 'EQC...',
  value: 1000000000
});
console.log('Estimated fee:', quote.fee, 'nanotons');
```

### Token Transfers

```javascript
// Transfer Jettons
const transferResult = await account.transfer({
  token: 'EQC...',      // Jetton master contract address
  recipient: 'EQC...',  // Recipient's TON address
  amount: 1000000000    // Amount in Jetton's base units
});
console.log('Transfer hash:', transferResult.hash);
console.log('Transfer fee:', transferResult.fee, 'nanotons');

// Quote token transfer
const transferQuote = await account.quoteTransfer({
  token: 'EQC...',      // Jetton master contract address
  recipient: 'EQC...',  // Recipient's TON address
  amount: 1000000000    // Amount in Jetton's base units 
})
console.log('Transfer fee estimate:', transferQuote.fee, 'nanotons')
```

### Message Signing and Verification

```javascript
// Sign a message
const message = 'Hello, TON!'
const signature = await account.sign(message)
console.log('Signature:', signature)

// Verify a signature
const isValid = await account.verify(message, signature)
console.log('Signature valid:', isValid)
```

### Fee Management

```javascript
// Get current fee rates
const feeRates = await wallet.getFeeRates();
console.log('Normal fee rate:', feeRates.normal, 'nanotons');
console.log('Fast fee rate:', feeRates.fast, 'nanotons');
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
import WalletManagerTon from '@wdk/wallet-ton'

async function setupWallet() {
  // Use a BIP-39 seed phrase (replace with your own secure phrase)
  const seedPhrase = 'your twelve word seed phrase here' // Replace with actual seed generation

  
  // Create wallet manager
  const wallet = new WalletManagerTon(seedPhrase, {
    tonClient: { url: 'https://toncenter.com/api/v2/jsonRPC' }
  })
  
  // Get first account
  const account = await wallet.getAccount(0)
  const address = await account.getAddress()
  console.log('Wallet address:', address)
  
  // Check balance
  const balance = await account.getBalance()
  console.log('Balance:', balance, 'nanotons')
  
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
  const feeRates = await wallet.getFeeRates();

  // Send transaction with custom fee logic (TON does not use EIP-1559 fields)
  const result = await account.sendTransaction({
    to: 'EQC...', // Recipient's TON address
    value: 1000000000 // 1 TON in nanotons
    // bounceable: true // (optional, TON-specific)
  });

  console.log('Transaction sent:', result.hash);
  console.log('Fee paid:', result.fee, 'nanotons');

  return result;
}
```

### Token Transfer with Validation

```javascript
async function transferJettonWithValidation(account, jettonAddress, recipient, amount) {
  // Validate Jetton address (TON format)
  if (!jettonAddress.startsWith('EQ') || jettonAddress.length !== 48) {
    throw new Error('Invalid Jetton address');
  }

  // Validate recipient address (TON format)
  if (!recipient.startsWith('EQ') || recipient.length !== 48) {
    throw new Error('Invalid recipient address');
  }

  // Check Jetton balance
  const balance = await account.getTokenBalance(jettonAddress);
  if (balance < amount) {
    throw new Error('Insufficient Jetton balance');
  }

  // Get transfer quote
  const quote = await account.quoteTransfer({
    token: jettonAddress,
    recipient,
    amount
  });

  console.log('Transfer fee estimate:', quote.fee, 'nanotons');

  // Execute transfer
  const result = await account.transfer({
    token: jettonAddress,
    recipient,
    amount
  });

  console.log('Transfer completed:', result.hash);
  return result;
}
```

### Error Handling

```javascript
try {
  const result = await account.sendTransaction({
    to: 'EQC...', // TON address
    value: 1000000000 // 1 TON in nanotons
  });
  console.log('Transaction successful:', result.hash);
} catch (error) {
  console.error('Transaction failed:', error.message);
  // Handle specific error types
  if (error.message.includes('insufficient funds')) {
    console.log('Please add more funds to your wallet');
  }
}
``` 