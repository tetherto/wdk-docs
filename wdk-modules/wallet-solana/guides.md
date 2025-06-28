---
title: Wallet Solana Guides
description: Installation, quick start, and usage examples for @wdk/wallet-solana
author: Raquel Carrasco Gonzalez
lastReviewed: 2025-06-26
icon: book-open
---

# Guides

## Installation

```bash
npm install @wdk/wallet-solana
```

## Quick Start

### Creating a New Wallet

```javascript
import WalletManagerSolana from '@wdk/wallet-solana'

// Use a BIP-39 seed phrase (replace with your own secure phrase)
const seedPhrase = 'your twelve word seed phrase here' // Replace with actual seed generation


// Create wallet manager with Solana RPC provider
const wallet = new WalletManagerSolana(seedPhrase, {
  rpcUrl: 'https://api.mainnet-beta.solana.com	' // or any Solana RPC endpoint
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
// Get native SOL balance (in lamports)
const balance = await account.getBalance()
console.log('Native SOL balance:', balance, 'lamports')

// Get SPL token balance
const splTokenAddress = '...'; // SPL token mint address
const splTokenBalance = await account.getTokenBalance(splTokenAddress);
console.log('SPL token balance:', splTokenBalance);
```

### Sending SOL Transactions

```javascript
// Send native SOL
const result = await account.sendTransaction({
  to: '...', // Solana address
  value: 1000000 // 0.001 SOL in lamports (1 SOL = 1_000_000_000 lamports)
})
console.log('Transaction hash:', result.hash)
console.log('Transaction fee:', result.fee, 'lamports')

// Get transaction fee estimate
const quote = await account.quoteSendTransaction({
  to: '...',
  value: 1000000
});
console.log('Estimated fee:', quote.fee, 'lamports');
```

### SPL Token Transfers

```javascript
// Transfer SPL tokens
const transferResult = await account.transfer({
  token: '...',      // SPL token mint address
  recipient: '...',  // Recipient's Solana address
  amount: 1000000    // Amount in SPL token's base units
});
console.log('Transfer hash:', transferResult.hash);
console.log('Transfer fee:', transferResult.fee, 'lamports');

// Quote token transfer
const transferQuote = await account.quoteTransfer({
  token: '...',      // SPL token mint address
  recipient: '...',  // Recipient's Solana address
  amount: 1000000    // Amount in SPL token's base units 
})
console.log('Transfer fee estimate:', transferQuote.fee, 'lamports')
```

### Message Signing and Verification

```javascript
// Sign a message
const message = 'Hello, Solana!'
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
console.log('Normal fee rate:', feeRates.normal, 'lamports');
console.log('Fast fee rate:', feeRates.fast, 'lamports');
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
import WalletManagerSolana from '@wdk/wallet-solana'

async function setupWallet() {
  // Use a BIP-39 seed phrase (replace with your own secure phrase)
  const seedPhrase = 'your twelve word seed phrase here' // Replace with actual seed generation

  
  // Create wallet manager
  const wallet = new WalletManagerSolana(seedPhrase, {
    rpcUrl: 'https://api.mainnet-beta.solana.com'
  })
  
  // Get first account
  const account = await wallet.getAccount(0)
  const address = await account.getAddress()
  console.log('Wallet address:', address)
  
  // Check balance
  const balance = await account.getBalance()
  console.log('Balance:', balance, 'lamports')
  
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

### Advanced SPL Token Transfer Example

```javascript
async function sendAdvancedSPLTransfer(account) {
  // Example: send an SPL token
  const result = await account.transfer({
    token: '...',      // SPL token mint address (replace with your SPL token)
    recipient: '...',  // Recipient's Solana address
    amount: 1000000    // Amount in SPL token's base units
  });

  console.log('Transfer hash:', result.hash);
  console.log('Fee paid (lamports):', result.fee);

  return result;
}
```

### Token Transfer with Validation

```javascript
async function transferSPLWithValidation(account, splTokenAddress, recipient, amount) {
  // Validate SPL token mint address (Solana format)
  if (typeof splTokenAddress !== 'string' || splTokenAddress.length < 32) {
    throw new Error('Invalid SPL token mint address');
  }

  // Validate recipient address (Solana format)
  if (typeof recipient !== 'string' || recipient.length < 32) {
    throw new Error('Invalid recipient address');
  }

  // Get transfer quote (fee is in lamports)
  const quote = await account.quoteTransfer({
    token: splTokenAddress,
    recipient,
    amount
  });

  console.log('Transfer fee estimate (lamports):', quote.fee);

  // Optionally, check against a max fee (if you want to enforce a limit)
  // if (quote.fee > MAX_FEE) throw new Error('Fee too high');

  // Execute transfer
  const result = await account.transfer({
    token: splTokenAddress,
    recipient,
    amount
  });

  console.log('Transfer submitted, hash:', result.hash);
  console.log('Fee paid (lamports):', result.fee);
  return result;
}
```

### Error Handling

```javascript
try {
  const result = await account.transfer({
    token: '...',      // SPL token mint address
    recipient: '...',  // Recipient's Solana address
    amount: 1000000    // Amount in SPL token's base units
  });
  console.log('Transfer submitted:', result.hash);
} catch (error) {
  console.error('Transfer failed:', error.message);
  // Handle specific error types
  if (error.message.toLowerCase().includes('insufficient')) {
    console.log('Please add more SPL tokens to your wallet');
  } else if (error.message.toLowerCase().includes('fee')) {
    console.log('The transfer fee exceeds your configured maximum.');
  }
}
``` 
