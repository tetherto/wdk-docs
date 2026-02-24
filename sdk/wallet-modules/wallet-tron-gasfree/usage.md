---
title: Wallet Tron Gas-Free Usage
description: Installation, quick start, and usage examples for @tetherto/wdk-wallet-tron-gasfree
icon: book-open
layout:
  width: default
  title:
    visible: true
  description:
    visible: true
  tableOfContents:
    visible: true
  outline:
    visible: true
  pagination:
    visible: false
  metadata:
    visible: false
---

# Usage
## Installation

To install the `wdk-wallet-tron-gasfree` package, follow these instructions:


```bash
npm install @tetherto/wdk-wallet-tron-gasfree
```

## Quick Start

### Importing from `wdk-wallet-tron-gasfree`

1. WalletManagerTronGasfree: This is the main class for managing wallets with gas-free capabilities.
2. WalletAccountTronGasfree: Use this for full access accounts with gas-free features.
3. WalletAccountReadOnlyTronGasfree: Use this for read-only accounts with gas-free features.

### Creating a New Gas-Free Wallet

```javascript
import WalletManagerTronGasfree, { 
  WalletAccountTronGasfree, 
  WalletAccountReadOnlyTronGasfree 
} from '@tetherto/wdk-wallet-tron-gasfree'

// Use a BIP-39 seed phrase (replace with your own secure phrase)
const seedPhrase = 'your twelve word seed phrase here' // Replace with actual seed generation


// Create wallet manager with Tron RPC provider and gas-free service provider
const wallet = new WalletManagerTronGasfree(seedPhrase, {
  // Tron network configuration
  chainId: 728126428, // Tron chain ID
  provider: 'https://api.trongrid.io', // or any other Tron RPC provider
  // Gas-free service configuration
  gasFreeProvider: 'https://gasfree.provider.url', // Gas-free provider's URL
  gasFreeApiKey: 'your-gasfree-api-key', // Gas-free provider's API key
  gasFreeApiSecret: 'your-gasfree-api-secret', // Gas-free provider's API secret
  serviceProvider: 'T...', // Service provider's address
  verifyingContract: 'T...', // Verifying contract's address
  
  // Optional configuration
  transferMaxFee: 10000000 // Maximum fee in sun (optional)
})

// Get a full access account
const account = await wallet.getAccount(0)

// Convert to a read-only account
const readOnlyAccount = await account.toReadOnlyAccount()
```

### Managing Multiple Accounts

```javascript
import WalletManagerTronGasfree from '@tetherto/wdk-wallet-tron-gasfree'

// Assume wallet is already created
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
### Checking Balances

#### Owned Account
For accounts where you have the seed phrase and full access:

```javascript
import WalletManagerTronGasfree from '@tetherto/wdk-wallet-tron-gasfree'

// Assume wallet and account are already created
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
import { WalletAccountReadOnlyTronGasfree } from '@tetherto/wdk-wallet-tron-gasfree'

// Use the address directly
const address = 'T...'; // Replace with the actual Tron address

// Create a read-only account
const readOnlyAccount = new WalletAccountReadOnlyTronGasfree(address, {
  chainId: 728126428,
  provider: 'https://api.trongrid.io',
  gasFreeProvider: 'https://open.gasfree.io/tron/',
  gasFreeApiKey: 'your-api-key',
  gasFreeApiSecret: 'your-api-secret',
  serviceProvider: 'T...',
  verifyingContract: 'T...'
})
// Check the balance
const balance = await readOnlyAccount.getBalance()
console.log('Read-only account balance:', balance)
```

### Sending Transactions

```javascript
// Send a TRX transaction
const result = await account.sendTransaction({
  to: 'T...',       // Recipient Tron address
  value: 1000000    // Amount in sun
})
console.log('Transaction hash:', result.hash)
console.log('Fee paid:', result.fee, 'sun')
```

For sending TRC20 tokens gas-free, use the `transfer()` method instead.

### Token Transfers

Transfer TRC20 tokens and estimate fees using `WalletAccountTronGasfree`. Ensure connection to TronWeb.

```javascript
// Transfer TRC20 tokens gas-free
const transferResult = await account.transfer({
  token: 'T...',      // TRC20 contract address
  recipient: 'T...',  // Recipient's Tron address
  amount: 1000000     // Amount in TRC20's base units
}, {
  transferMaxFee: 1000 // Optional: Maximum fee allowed for the transfer
});
console.log('Transfer hash:', transferResult.hash);
console.log('Transfer fee:', transferResult.fee, 'sun');


// Quote token transfer
const transferQuote = await account.quoteTransfer({
  token: 'T...',      // TRC20 contract address
  recipient: 'T...',  // Recipient's Tron address
  amount: 1000000     // Amount in TRC20's base units 
})
console.log('Transfer fee estimate:', transferQuote.fee, 'sun') // Includes both transfer and activation fees if needed
```

### Message Signing and Verification

Sign and verify messages using `WalletAccountTronGasfree`. Ensure connection to TronWeb.

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

Retrieve current fee rates using `WalletManagerTronGasfree`. Ensure connection to TronWeb.

```javascript
// Get current fee rates
const feeRates = await wallet.getFeeRates();
console.log('Normal fee rate:', feeRates.normal, 'sun');
console.log('Fast fee rate:', feeRates.fast, 'sun');
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
import WalletManagerTronGasfree from '@tetherto/wdk-wallet-tron-gasfree'

async function setupWallet() {
  // Use a BIP-39 seed phrase
  const seedPhrase = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
  
  // Create gas-free wallet manager with required config
  const wallet = new WalletManagerTronGasfree(seedPhrase, {
    // Required parameters
    chainId: 728126428, // Blockchain ID
    provider: 'https://api.trongrid.io', // Tron RPC endpoint
    gasFreeProvider: 'https://api.gasfree.com', // Gas-free service URL
    gasFreeApiKey: 'your-api-key',
    gasFreeApiSecret: 'your-api-secret',
    serviceProvider: 'TLyqzVGLV1srkB7dToTAEqgDSfPtXRJZYH', // Service provider address
    verifyingContract: 'TLyqzVGLV1srkB7dToTAEqgDSfPtXRJZYH', // Verifying contract address
    
    // Optional parameter
    transferMaxFee: 10000000 // Maximum fee in token base units
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
  
  // Create 5 gas-free accounts (m/44'/195'/0'/0/0 through m/44'/195'/0'/0/4)
  for (let i = 0; i < 5; i++) {
    const account = await wallet.getAccount(i)
    const address = await account.getAddress()
    
    accounts.push({
      index: i,
      path: `m/44'/195'/0'/0/${i}`,
      address
    })
    
    console.log(`Account ${i}:`, address)
  }
  
  // Custom derivation path
  const customAccount = await wallet.getAccountByPath("0'/0/5")
  accounts.push({
    index: 5,
    path: `m/44'/195'/0'/0/5`,
    address: await customAccount.getAddress()
  })
  
  return accounts
}
```

### Gas-Free TRC20 Transfer Example

```javascript
async function sendGasFreeTRC20Transfer(account) {
  try {
    // Get transfer quote first
    const quote = await account.quoteTransfer({
      token: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', // TRC20 token
      recipient: 'TLyqzVGLV1srkB7dToTAEqgDSfPtXRJZYH',
      amount: 1000000 // Amount in token base units
    })
    console.log('Estimated fee (token units):', quote.fee)
    
    // Send the transfer
    const result = await account.transfer({
      token: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
      recipient: 'TLyqzVGLV1srkB7dToTAEqgDSfPtXRJZYH',
      amount: 1000000
    })
    
    console.log('Transfer ID:', result.hash)
    console.log('Fee paid (token units):', result.fee)
    
    return result
  } catch (error) {
    if (error.message.includes('exceeds the transfer max fee')) {
      console.error('Transfer cancelled: Fee too high')
    } else {
      console.error('Transfer failed:', error.message)
    }
    throw error
  }
}
```

### Token Transfer with Fee Limit

```javascript
async function transferWithFeeLimit(account, tokenAddress, recipient, amount, maxFee) {
  // Validate TRC20 address (Tron format)
  if (!tokenAddress.startsWith('T') || tokenAddress.length !== 34) {
    throw new Error('Invalid TRC20 contract address')
  }
  
  // Validate recipient address (Tron format)
  if (!recipient.startsWith('T') || recipient.length !== 34) {
    throw new Error('Invalid recipient address')
  }
  
  // Get transfer quote
  const quote = await account.quoteTransfer({
    token: tokenAddress,
    recipient,
    amount
  })
  console.log('Transfer fee estimate:', quote.fee, 'token units')
  
  // Execute transfer with fee limit
  const result = await account.transfer({
    token: tokenAddress,
    recipient,
    amount
  }, {
    transferMaxFee: maxFee // Optional fee limit in token units
  })
  
  console.log('Transfer ID:', result.hash)
  console.log('Fee paid:', result.fee, 'token units')
  
  return result
}
```


<table data-card-size="large" data-view="cards">
	<thead>
		<tr>
			<th></th>
			<th></th>
			<th></th>
			<th data-hidden data-card-target data-type="content-ref"></th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>Node.js Quickstart</strong>
			</td>
			<td>Get started with WDK in a Node.js environment</td>
			<td>
				<a href="../../../start-building/nodejs-bare-quickstart.md">nodejs-quickstart.md</a>
			</td>
		</tr>
    <tr>
			<td>
				<i class="fa-mobile-alt">:mobile-alt:</i>
			</td>
			<td>
				<strong>React Native Quickstart</strong>
			</td>
			<td>Build mobile wallets with React Native Expo</td>
			<td>
				<a href="../../../start-building/react-native-quickstart.md">react-native-quickstart.md</a>
			</td>
		</tr>
    <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK Tron Gasfree Wallet Configuration</strong>
			</td>
			<td>Get started with WDK's Tron Gasfree Wallet Configuration</td>
			<td>
				<a href="./configuration.md">WDK Tron Gasfree Wallet Configuration</a>
			</td>
		</tr>
        <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK Tron Gasfree Wallet API</strong>
			</td>
			<td>Get started with WDK's Tron Gasfree Wallet API</td>
			<td>
				<a href="./api-reference.md">WDK Tron Gasfree Wallet API</a>
			</td>
		</tr>
	</tbody>
</table>

***

### Need Help?

{% include "../../../.gitbook/includes/support-cards.md" %}

