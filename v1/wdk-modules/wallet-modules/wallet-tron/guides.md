---
title: Wallet Tron Guides
description: Installation, quick start, and usage examples for @tetherto/wdk-wallet-tron
author: Raquel Carrasco Gonzalez
lastReviewed: 2025-06-26
icon: book-open
---

# Guides

## Installation

To install the `@tetherto/wdk-wallet-tron` package, follow these instructions:

### Public Release

Once the package is publicly available, you can install it using npm:

```bash
npm install @tetherto/wdk-wallet-tron
```
### Private Access

If you have access to the private repository, install the package from the develop branch on GitHub:

```bash
npm install git+https://github.com/tetherto/wdk-wallet-tron.git#develop
```

After installation, ensure your package.json includes the dependency correctly:

```json
"dependencies": {
  // ... other dependencies ...
  "@tetherto/wdk-wallet-tron": "git+ssh://git@github.com:tetherto/wdk-wallet-tron.git#develop"
  // ... other dependencies ...
}
```

## Quick Start

### Importing from `@tetherto/wdk-wallet-tron`

1. WalletManagerTron: This is the main class for managing wallets.
2. WalletAccountTron: Use this for full access accounts.
3. WalletAccountReadOnlyTron: Use this for read-only accounts.

### Creating a New Wallet

```javascript
import WalletManagerTron, { WalletAccountTron, WalletAccountReadOnlyTron } from '@tetherto/wdk-wallet-tron'

// Use a BIP-39 seed phrase (replace with your own secure phrase)
const seedPhrase = 'your twelve word seed phrase here' // Replace with actual seed generation

// Create wallet manager with Tron RPC provider
const wallet = new WalletManagerTron(seedPhrase, {
  provider: 'https://api.trongrid.io' // or any other Tron RPC provider
})

// Get a full access account
const account = await wallet.getAccount(0)

// Convert to a read-only account
const readOnlyAccount = await account.toReadOnlyAccount()
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

#### Owned Account

For accounts where you have the seed phrase and full access:

```javascript
import WalletManagerTron from '@tetherto/wdk-wallet-tron'

// Get native TRX balance (in sun)
const balance = await account.getBalance()
console.log('Native TRX balance:', balance, 'sun')

// Get TRC20 token balance
const trc20Address = 'T...'; // TRC20 contract address
const trc20Balance = await account.getTokenBalance(trc20Address);
console.log('TRC20 token balance:', trc20Balance);
```

#### Read-Only Account

For addresses where you don't have the seed phrase:

```javascript
import { WalletAccountReadOnlyTron } from '@tetherto/wdk-wallet-tron'

// Use the address directly
const address = 'T...'; // Replace with the actual Tron address

// Create a read-only account
const readOnlyAccount = new WalletAccountReadOnlyTron(address, {
  provider: 'https://api.trongrid.io'
})
// Check the balance
const balance = await readOnlyAccount.getBalance()
console.log('Read-only account balance:', balance)
```

### Sending Transactions

Send TRX and estimate fees using `WalletAccountTron`. Ensure connection to TronWeb.

```javascript
// Send native TRX
const result = await account.sendTransaction({
  to: 'T...', // Tron address
  value: 1000000 // 1 TRX in sun (1 TRX = 1_000_000 sun)
})
console.log('Transaction hash:', result.hash)
console.log('Transaction fee:', result.fee, 'sun')

// Get transaction fee estimate
const quote = await account.quoteSendTransaction({
  to: 'T...',
  value: 1000000
});
console.log('Estimated fee:', quote.fee, 'sun');
```

### Token Transfers

Transfer TRC20 tokens and estimate fees using `WalletAccountTron`. Ensure connection to TronWeb.

```javascript
// Transfer TRC20 tokens
const transferResult = await account.transfer({
  token: 'T...',      // TRC20 contract address
  recipient: 'T...',  // Recipient's Tron address
  amount: 1000000     // Amount in TRC20's base units
});
console.log('Transfer hash:', transferResult.hash);
console.log('Transfer fee:', transferResult.fee, 'sun');

// Quote token transfer
const transferQuote = await account.quoteTransfer({
  token: 'T...',      // TRC20 contract address
  recipient: 'T...',  // Recipient's Tron address
  amount: 1000000     // Amount in TRC20's base units 
})
console.log('Transfer fee estimate:', transferQuote.fee, 'sun')
```

### Message Signing and Verification

Sign and verify messages using `WalletAccountTron`. Ensure connection to TronWeb.

```javascript
// Sign a message
const message = 'Hello, Tron!'
const signature = await account.sign(message)
console.log('Signature:', signature)

// Verify a signature
const isValid = await account.verify(message, signature)
console.log('Signature valid:', isValid)
```

### Fee Management

Retrieve current fee rates using `WalletManagerTron`. Ensure connection to TronWeb.


```javascript
// Get current fee rates
const feeRates = await wallet.getFeeRates();
console.log('Normal fee rate:', feeRates.normal, 'sun');
console.log('Fast fee rate:', feeRates.fast, 'sun');
```

### Memory Management

Clear sensitive data from memory using `dispose` methods in `WalletAccountTron` and `WalletManagerTron`.

```javascript
// Dispose wallet accounts to clear private keys from memory
account.dispose()

// Dispose entire wallet manager
wallet.dispose()
```

## Complete Examples

### Complete Wallet Setup

```javascript
import WalletManagerTron from '@tetherto/wdk-wallet-tron'

async function setupWallet() {
  // Use a BIP-39 seed phrase (replace with your own secure phrase)
  const seedPhrase = 'your twelve word seed phrase here' // Replace with actual seed generation

  
  // Create wallet manager
  const wallet = new WalletManagerTron(seedPhrase, {
    provider: 'https://api.trongrid.io'
  })
  
  // Get first account
  const account = await wallet.getAccount(0)
  const address = await account.getAddress()
  console.log('Wallet address:', address)
  
  // Check balance
  const balance = await account.getBalance()
  console.log('Balance:', balance, 'sun')
  
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

### Advanced TRC20 Transfer Example

```javascript
async function sendAdvancedTRC20Transfer(account) {
  // Example: send a TRC20 token
  const result = await account.transfer({
    token: 'T...',      // TRC20 contract address (replace with your TRC20)
    recipient: 'T...',  // Recipient's Tron address
    amount: 1000000     // Amount in TRC20's base units
    // Optionally, you can pass a second config argument to override transferMaxFee
  });

  console.log('TRC20 transfer sent:', result.hash);
  console.log('Fee paid (in sun):', result.fee);

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

  // Check TRC20 balance
  const balance = await account.getTokenBalance(trc20Address);
  if (balance < amount) {
    throw new Error('Insufficient TRC20 token balance');
  }

  // Get transfer quote (fee is in sun)
  const quote = await account.quoteTransfer({
    token: trc20Address,
    recipient,
    amount
  });

  console.log('Transfer fee estimate (sun):', quote.fee);

  // Optionally, check against a max fee (if you want to enforce a limit)
  // if (quote.fee > MAX_FEE) throw new Error('Fee too high');

  // Execute transfer
  const result = await account.transfer({
    token: trc20Address,
    recipient,
    amount
  });

  console.log('Transfer completed:', result.hash);
  console.log('Fee paid (sun):', result.fee);
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
  console.log('Transfer successful:', result.hash);
  console.log('Fee paid (sun):', result.fee);
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
