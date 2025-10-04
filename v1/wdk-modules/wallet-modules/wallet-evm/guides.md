---
title: Wallet EVM Guides
description: Installation, quick start, and usage examples for @tetherto/wdk-wallet-evm
author: Matteo Giardino
lastReviewed: 2025-06-26
icon: book-open
---

# Guides

## Installation

To install the `@tetherto/wdk-wallet-evm` package, follow these instructions:

### Public Release

Once the package is publicly available, you can install it using npm:

```bash
npm install @tetherto/wdk-wallet-evm
```

### Private Access

If you have access to the private repository, install the package from the develop branch on GitHub:

```bash
npm install git+https://github.com/tetherto/wdk-wallet-evm.git#develop
```

After installation, ensure your package.json includes the dependency correctly:

```json
"dependencies": {
  // ... other dependencies ...
  "@tetherto/wdk-wallet-evm": "git+ssh://git@github.com:tetherto/wdk-wallet-evm.git#develop"
  // ... other dependencies ...
}
```

## Quick Start

### Creating a New Wallet

```javascript
import WalletManagerEvm, { WalletAccountEvm, WalletAccountReadOnlyEvm } from '@tetherto/wdk-wallet-evm'


// Generate a new random seed phrase (you'll need to implement this or use a library)
const seedPhrase = 'your twelve word seed phrase here' // Replace with actual seed generation
console.log('Seed phrase:', seedPhrase)

// Create wallet manager with RPC provider
const wallet = new WalletManagerEvm(seedPhrase, {
  provider: 'https://rpc.mevblocker.io/fast', // or any other RPC provider
  transferMaxFee: 100000000000000 // Optional: Maximum fee in wei
})
// OR

// Option 2: Using EIP-1193 provider (e.g., from browser wallet)
const wallet2 = new WalletManagerEvm(seedPhrase, {
  provider: window.ethereum, // EIP-1193 provider
  transferMaxFee: 100000000000000 // Optional: Maximum fee in wei
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
```javascript
// Get native token balance (ETH, MATIC, BNB, etc.)
const balance = await account.getBalance()
console.log('Native balance:', balance, 'wei')

// Get ERC-20 token balance
const tokenAddress = '0xA0b86a33E6441b8c4C8C8C8C8C8C8C8C8C8C8C8C'
const tokenBalance = await account.getTokenBalance(tokenAddress)
console.log('Token balance:', tokenBalance)
```
#### Read-Only Account
```javascript
// Create a read-only account
const readOnlyAccount = new WalletAccountReadOnlyEvm('0x...', { // Ethereum address
   provider: 'https://rpc.mevblocker.io/fast', // or any other RPC provider
})

// Check native token balance
const balance = await readOnlyAccount.getBalance()
console.log('Native balance:', balance, 'wei')

// Check ERC20 token balance
const tokenBalance = await readOnlyAccount.getTokenBalance('0x...') // ERC20 contract address
console.log('Token balance:', tokenBalance)
```

### Sending Transactions

```javascript
// Send native tokens
const result = await account.sendTransaction({
  to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  value: 1000000000000000000n, // 1 ETH in wei
  maxFeePerGas: 30000000000, // Optional: max fee per gas (in wei)
  maxPriorityFeePerGas: 2000000000 // Optional: max priority fee per gas (in wei)

})
console.log('Transaction hash:', result.hash)
console.log('Transaction fee:', result.fee, 'wei')

// OR Legacy style transaction
const legacyResult = await account.sendTransaction({
  to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  value: 1000000000000000000n,
  gasPrice: 20000000000n, // Optional: legacy gas price (in wei)
  gasLimit: 21000 // Optional: gas limit
})

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
}, {
  transferMaxFee: 1000000000000n // Optional: Maximum allowed fee in wei
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
import WalletManagerEvm, { WalletAccountEvm, WalletAccountReadOnlyEvm } from '@tetherto/wdk-wallet-evm'

async function setupWallet() {
  // Use existing seed phrase or generate one
  const seedPhrase = 'your twelve word seed phrase here' // Replace with actual seed
  console.log('Using seed phrase:', seedPhrase)
  
  // Create wallet manager
  const wallet = new WalletManagerEvm(seedPhrase, {
    provider: 'https://rpc.mevblocker.io/fast', 
    transferMaxFee: 100000000000000 // Optional: Maximum fee in wei

  })
  
  // Get first account
  const account = await wallet.getAccount(0)
  const address = await account.getAddress()
  console.log('Wallet address:', address)
  
  // Check balance
  const balance = await account.getBalance()
  console.log('Balance:', balance, 'wei')

    // Check ERC20 balance (e.g., USDT)
  const tokenBalance = await account.getTokenBalance('0xdAC17F958D2ee523a2206206994597C13D831ec7')
  console.log('USDT balance:', tokenBalance)
  
  // Create read-only version
  const readOnlyAccount = await account.toReadOnlyAccount()
  
  return { wallet, account, readOnlyAccount, address }
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
      path: `m/44'/60'/0'/0/${i}`, // Full BIP-44 path
      address,
      balance
    })

     console.log(`Account ${i}:`, {
      address,
      balance: balance.toString(),
      path: `m/44'/60'/0'/0/${i}`
    })

  }

  // Custom derivation path example
  const customAccount = await wallet.getAccountByPath("0'/0/5")
  accounts.push({
    index: 5,
    path: `m/44'/60'/0'/0/5`,
    address: await customAccount.getAddress(),
    balance: await customAccount.getBalance()
  })
  
  return accounts
}
```

### Advanced Transaction Example

```javascript
async function sendAdvancedTransaction(account, wallet) {
  // Get current fee rates from wallet manager
  const feeRates = await wallet.getFeeRates()
  console.log('Normal fee rate:', feeRates.normal, 'wei') // 1.1x base fee
  console.log('Fast fee rate:', feeRates.fast, 'wei')     // 2.0x base fee
    
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
try {
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

  const nativeBalance = await account.getBalance()
  if (nativeBalance === 0n) {
     throw new Error('Need ETH for gas fees')
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
  }, {
    transferMaxFee: 1000000000000n // Optional: Maximum allowed fee in wei
  })
  
 console.log('Transfer completed:', result.hash)
 console.log('Fee paid:', result.fee, 'wei')
 return result
} catch (error) {
    console.error('Transfer failed:', error.message)
    if (error.message.includes('Exceeded maximum fee')) {
      throw new Error('Transfer fee too high')
    }
    throw error
}
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