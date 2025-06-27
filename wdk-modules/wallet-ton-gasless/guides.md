---
title: Wallet TON Gasless Guides
description: Installation, quick start, and usage examples for @wdk/wallet-ton-gasless
author: Raquel Carrasco Gonzalez
lastReviewed: 2025-06-26
---

# Guides

## Installation

```bash
npm install @wdk/wallet-ton-gasless
```

## Quick Start

### Creating a New Gasless Wallet

```javascript
import WalletManagerTonGasless from '@wdk/wallet-ton-gasless'

// Use a BIP-39 seed phrase (replace with your own secure phrase)
const seedPhrase = 'your twelve word seed phrase here' // Replace with actual seed generation


// Create gasless wallet manager with TON RPC and TON API endpoints, and paymaster token config
const wallet = new WalletManagerTonGasless(seedPhrase, {
  tonClient: { url: 'https://toncenter.com/api/v2/jsonRPC' }, // TON RPC endpoint
  tonApiClient: { url: 'https://tonapi.io', secretKey: 'your-tonapi-key' }, // TON API endpoint (optional secretKey)
  paymasterToken: { address: 'EQC...' }, // Paymaster Jetton master contract address
  transferMaxFee: 10000000 // Maximum fee for transfer operations (in paymaster Jetton base units)
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

### Checking Balances

```javascript
// Get paymaster Jetton balance
const paymasterBalance = await account.getPaymasterTokenBalance()
console.log('Paymaster Jetton balance:', paymasterBalance)

// Get Jetton token balance
const jettonAddress = 'EQC...'; // Jetton master contract address (TON format)
const jettonBalance = await account.getTokenBalance(jettonAddress)
console.log('Jetton token balance:', jettonBalance)
```

### Gasless Jetton Transfers

```javascript
// Gasless transfer of Jettons (fee paid in paymaster Jetton)
const result = await account.transfer({
  token: 'EQC...',      // Jetton master contract address
  recipient: 'EQC...',  // Recipient's TON address
  amount: 1000000000    // Amount in Jetton's base units
})
console.log('Transfer hash:', transferResult.hash)
console.log('Transfer fee (in paymaster Jetton):', transferResult.fee)

// Quote gasless transfer fee
const quote = await account.quoteTransfer({
  token: 'EQC...',      // Jetton master contract address
  recipient: 'EQC...',  // Recipient's TON address
  amount: 1000000000    // Amount in Jetton's base units
})
console.log('Transfer fee estimate (in paymaster Jetton):', transferQuote.fee)
```

### Error Handling

```javascript
try {
  const result = await account.transfer({
    token: 'EQC...',
    recipient: 'EQC...',
    amount: 1000000000
  })
  console.log('Transfer successful:', result.hash)
} catch (error) {
  console.error('Transfer failed:', error.message)
}
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
import WalletManagerTonGasless from '@wdk/wallet-ton-gasless'

async function setupWallet() {
  // Use a BIP-39 seed phrase (replace with your own secure phrase)
  const seedPhrase = 'your twelve word seed phrase here' // Replace with actual seed generation

  
  // Create gasless wallet manager
  const wallet = new WalletManagerTonGasless(seedPhrase, {
    tonClient: { url: 'https://toncenter.com/api/v2/jsonRPC' },
    tonApiClient: { url: 'https://tonapi.io', secretKey: 'your-tonapi-key' }, // optional but recommended for gasless
    paymasterToken: { address: 'EQC...' } // REQUIRED: replace with your paymaster Jetton address
    // transferMaxFee: 10000000 // optional: set a max fee in paymaster Jetton base units
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
import WalletManagerTonGasless from '@wdk/wallet-ton-gasless'

async function manageMultipleAccounts(seedPhrase) {
  // Create gasless wallet manager
  const wallet = new WalletManagerTonGasless(seedPhrase, {
    tonClient: { url: 'https://toncenter.com/api/v2/jsonRPC' },
    tonApiClient: { url: 'https://tonapi.io', secretKey: 'your-tonapi-key' }, // optional but recommended
    paymasterToken: { address: 'EQC...' } // REQUIRED: replace with your paymaster Jetton address
    // transferMaxFee: 10000000 // optional
  })

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
async function sendAdvancedJettonTransfer(account) {
  // Example: send a Jetton (TON token) using gasless transfer
  const result = await account.transfer({
    token: 'EQC...',      // Jetton master contract address (replace with your Jetton)
    recipient: 'EQC...',  // Recipient's TON address
    amount: 1000000000    // Amount in Jetton's base units
    // Optionally, you can pass a second config argument to override paymasterToken or transferMaxFee
  });

  console.log('Jetton transfer sent:', result.hash);
  console.log('Fee paid (in paymaster Jetton base units):', result.fee);

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

  // Get transfer quote (fee is in paymaster Jetton base units)
  const quote = await account.quoteTransfer({
    token: jettonAddress,
    recipient,
    amount
  });

  console.log('Transfer fee estimate (paymaster Jetton base units):', quote.fee);

  // Optionally, check against a max fee (if you want to enforce a limit)
  // if (quote.fee > MAX_FEE) throw new Error('Fee too high');

  // Execute transfer (fee will be paid in paymaster Jetton)
  const result = await account.transfer({
    token: jettonAddress,
    recipient,
    amount
  });

  console.log('Transfer completed:', result.hash);
  console.log('Fee paid (paymaster Jetton base units):', result.fee);
  return result;
}
```

### Error Handling

```javascript
try {
  const result = await account.transfer({
    token: 'EQC...',      // Jetton master contract address
    recipient: 'EQC...',  // Recipient's TON address
    amount: 1000000000    // Amount in Jetton's base units
  });
  console.log('Transfer successful:', result.hash);
  console.log('Fee paid (paymaster Jetton base units):', result.fee);
} catch (error) {
  console.error('Transfer failed:', error.message);
  // Handle specific error types
  if (error.message.toLowerCase().includes('insufficient')) {
    console.log('Please add more Jettons to your wallet or paymaster balance');
  } else if (error.message.toLowerCase().includes('max fee')) {
    console.log('The transfer fee exceeds your configured maximum.');
  }
}
``` 
