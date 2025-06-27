---
title: Wallet Tron Gas-Free Guides
description: Installation, quick start, and usage examples for @wdk/wallet-tron-gasfree
author: Raquel Carrasco Gonzalez
lastReviewed: 2025-06-26
---

# Guides

## Installation

```bash
npm install @wdk/wallet-tron-gasfree
```

## Quick Start

### Creating a New Gas-Free Wallet

```javascript
import WalletManagerTronGasfree from '@wdk/wallet-tron-gasfree'

// Use a BIP-39 seed phrase (replace with your own secure phrase)
const seedPhrase = 'your twelve word seed phrase here' // Replace with actual seed generation


// Create wallet manager with Tron RPC provider and gas-free service provider
const wallet = new WalletManagerTronGasfree(seedPhrase, {
  provider: 'https://api.trongrid.io', // Tron RPC endpoint
  gasFreeProvider: 'https://your-gasfree-provider', // Gas-free service endpoint
  apiKey: 'your-api-key', // API key for gas-free provider
  apiSecret: 'your-api-secret', // API secret for gas-free provider
  serviceProvider: 'T...', // Service provider Tron address
  verifyingContract: 'T...', // Gas-free verifying contract address
  chainId: 728126428, // Tron chain ID
  transferMaxFee: 10000000 // Maximum fee in token base units (optional)
})
```

### Managing Multiple Accounts

```javascript
// Get the first gas-free account (index 0)
const account = await wallet.getAccount(0)
const address = await account.getAddress()
console.log('Account 0 gas-free address:', address)

// Get the second gas-free account (index 1)
const account1 = await wallet.getAccount(1)
const address1 = await account1.getAddress()
console.log('Account 1 gas-free address:', address1)

// Get account by custom derivation path
const customAccount = await wallet.getAccountByPath("0'/0/5")
const customAddress = await customAccount.getAddress()
console.log('Custom account gas-free address:', customAddress)
```

### Gas-Free TRC20 Token Transfer

```javascript
// Transfer TRC20 tokens gas-free
const transferResult = await account.transfer({
  token: 'T...',      // TRC20 contract address
  recipient: 'T...',  // Recipient's Tron address
  amount: 1000000     // Amount in TRC20's base units
});
console.log('Transfer ID:', transferResult.id);
console.log('Fee (in token base units):', transferResult.fee);

// Get transaction hash after submission (may require polling)
const txnHash = await account.getTransferHash(transferResult.id)
console.log('Transaction hash:', txnHash)
```

### Quote Gas-Free Transfer Fee

```javascript
// Get a quote for a gas-free TRC20 transfer
const quote = await account.quoteTransfer({
  token: 'T...',      // TRC20 contract address
  recipient: 'T...',  // Recipient's Tron address
  amount: 1000000     // Amount in TRC20's base units
})
console.log('Estimated fee (token base units):', quote.fee)
```

### Message Signing and Verification

```javascript
// Sign a message
const message = 'Hello, Tron!'
const signature = await account.sign(message)
console.log('Signature:', signature)

// Verify a signature
const isValid = await account.verify(message, signature)
console.log('Signature valid:', isValid)
```

### Memory Management

```javascript
// Dispose wallet accounts to clear private keys from memory
account.dispose()

// Dispose entire wallet manager
wallet.dispose()
```

## Complete Examples

### Complete Gas-Free Wallet Setup

```javascript
import WalletManagerTronGasfree from '@wdk/wallet-tron-gasfree'

async function setupWallet() {
  // Use a BIP-39 seed phrase (replace with your own secure phrase)
  const seedPhrase = 'your twelve word seed phrase here' // Replace with actual seed generation

  
  // Create gas-free wallet manager
  const wallet = new WalletManagerTronGasfree(seedPhrase, {
    provider: 'https://api.trongrid.io',
    gasFreeProvider: 'https://your-gasfree-provider',
    apiKey: 'your-api-key',
    apiSecret: 'your-api-secret',
    serviceProvider: 'T...',
    verifyingContract: 'T...',
    chainId: 728126428,
    transferMaxFee: 10000000
  })
  
  // Get first gas-free account
  const account = await wallet.getAccount(0)
  const address = await account.getAddress()
  console.log('Gas-free account address:', address)
  
  return { wallet, account, address }
}
```

### Multi-Account Management

```javascript
async function manageMultipleAccounts(wallet) {
  const accounts = []
  
  // Create 5 gas-free accounts
  for (let i = 0; i < 5; i++) {
    const account = await wallet.getAccount(i)
    const address = await account.getAddress()
    
    accounts.push({
      index: i,
      address
    })
  }
  
  return accounts
}
```

### Advanced Gas-Free TRC20 Transfer Example

```javascript
async function sendAdvancedTRC20Transfer(account) {
  // Example: send a TRC20 token gas-free
  const result = await account.transfer({
    token: 'T...',      // TRC20 contract address (replace with your TRC20)
    recipient: 'T...',  // Recipient's Tron address
    amount: 1000000     // Amount in TRC20's base units
    // Optionally, you can pass a second config argument to override transferMaxFee
  });

  console.log('Transfer ID:', result.id);
  console.log('Fee paid (token base units):', result.fee);

  // Get transaction hash after submission
  const txnHash = await account.getTransferHash(result.id)
  console.log('Transaction hash:', txnHash)

  return result;
}
```

### Token Transfer with Validation

```javascript
async function transferTRC20WithValidation(account, trc20Address, recipient, amount) {
  // Validate TRC20 address (Tron format)
  if (!trc20Address.startsWith('T') || trc20Address.length !== 34) {
    throw new Error('Invalid TRC20 contract address');
  }

  // Validate recipient address (Tron format)
  if (!recipient.startsWith('T') || recipient.length !== 34) {
    throw new Error('Invalid recipient address');
  }

  // Get transfer quote (fee is in token base units)
  const quote = await account.quoteTransfer({
    token: trc20Address,
    recipient,
    amount
  });

  console.log('Transfer fee estimate (token base units):', quote.fee);

  // Optionally, check against a max fee (if you want to enforce a limit)
  // if (quote.fee > MAX_FEE) throw new Error('Fee too high');

  // Execute transfer
  const result = await account.transfer({
    token: trc20Address,
    recipient,
    amount
  });

  console.log('Transfer submitted, ID:', result.id);
  console.log('Fee paid (token base units):', result.fee);

  // Get transaction hash after submission
  const txnHash = await account.getTransferHash(result.id)
  console.log('Transaction hash:', txnHash)
  return result;
}
```

### Error Handling

```javascript
try {
  const result = await account.transfer({
    token: 'T...',      // TRC20 contract address
    recipient: 'T...',  // Recipient's Tron address
    amount: 1000000     // Amount in TRC20's base units
  });
  console.log('Transfer submitted:', result.id);
} catch (error) {
  console.error('Transfer failed:', error.message);
  // Handle specific error types
  if (error.message.toLowerCase().includes('insufficient')) {
    console.log('Please add more TRC20 tokens to your wallet');
  } else if (error.message.toLowerCase().includes('max fee')) {
    console.log('The transfer fee exceeds your configured maximum.');
  }
}
``` 
