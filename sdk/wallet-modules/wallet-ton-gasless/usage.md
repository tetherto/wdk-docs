---
title: Wallet TON Gasless Usage
description: Installation, quick start, and usage examples for @tetherto/wdk-wallet-ton-gasless
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

To install the `@tetherto/wdk-wallet-ton-gasless` package, follow these instructions:

```bash
npm install @tetherto/wdk-wallet-ton-gasless
```


## Quick Start

### Importing from `@tetherto/wdk-wallet-ton-gasless`

1. WalletManagerTonGasless: Main class for managing wallets with gasless features
2. WalletAccountTonGasless: Use this for full access accounts with gasless transactions
3. WalletAccountReadOnlyTonGasless: Use this for read-only accounts


### Creating a New Gasless Wallet

```javascript
import WalletManagerTonGasless, { 
  WalletAccountTonGasless, 
  WalletAccountReadOnlyTonGasless 
} from '@tetherto/wdk-wallet-ton-gasless'


// Use a BIP-39 seed phrase (replace with your own secure phrase)
const seedPhrase = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'


// Create gasless wallet manager with TON RPC and TON API endpoints, and paymaster token config
const wallet = new WalletManagerTonGasless(seedPhrase, {
  tonClient: {
    url: 'https://toncenter.com/api/v3',
    secretKey: 'your-api-key' // Optional
  },
  tonApiClient: {
    url: 'https://tonapi.io/v2',
    secretKey: 'your-ton-api-key' // Optional
  },
  paymasterToken: {
    address: 'EQ...' // Paymaster Jetton master contract address
  },
  transferMaxFee: 10000000 // Optional: maximum fee for transfer operations (in paymaster Jetton base units)
})

// Get a full access account
const account = await wallet.getAccount(0)

// Convert to a read-only account
const readOnlyAccount = await account.toReadOnlyAccount()
```

### Managing Multiple Accounts

```javascript
import WalletManagerTonGasless from '@tetherto/wdk-wallet-ton-gasless'

// Assume wallet is already created
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
import WalletManagerTonGasless from '@tetherto/wdk-wallet-ton-gasless'

// Assume wallet and account are already created
// Get native TON balance (in nanotons)
const balance = await account.getBalance()
console.log('Native TON balance:', balance, 'nanotons')

// Get Jetton token balance
const jettonAddress = 'EQ...'; // Jetton contract address
const jettonBalance = await account.getTokenBalance(jettonAddress);
console.log('Jetton token balance:', jettonBalance);

// Get paymaster Jetton balance
const paymasterBalance = await account.getPaymasterTokenBalance()
console.log('Paymaster Jetton balance:', paymasterBalance)
```

#### Read-Only Account

For addresses where you don't have the seed phrase:

```javascript
import { WalletAccountReadOnlyTonGasless } from '@tetherto/wdk-wallet-ton-gasless'

// Use the public key directly
const publicKey = '...'; // Replace with the actual public key

// Create a read-only account
const readOnlyAccount = new WalletAccountReadOnlyTonGasless(publicKey, {
  tonClient: {
    url: 'https://toncenter.com/api/v3',
    secretKey: 'your-api-key' // Optional
  },
  tonApiClient: {
    url: 'https://tonapi.io/v2',
    secretKey: 'your-ton-api-key' // Optional
  },
  paymasterToken: {
    address: 'EQ...' // Paymaster Jetton contract address
  }
})

// Check balances
const balance = await readOnlyAccount.getBalance()
console.log('Native TON balance:', balance)

// Check paymaster token balance
const paymasterBalance = await readOnlyAccount.getPaymasterTokenBalance()
console.log('Paymaster token balance:', paymasterBalance)

// Check any other token balance
const tokenBalance = await readOnlyAccount.getTokenBalance('EQC...')
console.log('Token balance:', tokenBalance)
```

### Sending Transactions

Send a native TON transaction using `WalletAccountTonGasless`.

```javascript
// Send a native TON transaction
const result = await account.sendTransaction({
  to: 'EQ...',         // Recipient's TON address
  value: 1000000000    // Amount in nanotons (1 TON)
})
console.log('Transaction hash:', result.hash)
console.log('Transaction fee:', result.fee, 'nanotons')
```

For transferring Jetton tokens gaslessly (fees paid with a paymaster token), use the `transfer()` method below.


### Jetton Token Transfers (Gasless)

Transfer Jetton tokens and estimate fees using `WalletAccountTonGasless`. Requires TON Center client configuration.

```javascript
// Gasless transfer of Jettons (fee paid in paymaster Jetton)
const result = await account.transfer({
  token: 'EQ...',      // Jetton master contract address
  recipient: 'EQ...',  // Recipient's TON address
  amount: 1000000000    // Amount in Jetton's base units
}, {
  paymasterToken: {    // Optional: override default paymaster token
    address: 'EQ...'
  },
  transferMaxFee: 1000000 // Optional: override maximum allowed fee
})
console.log('Transfer hash:', result.hash)
console.log('Transfer fee:', result.fee, 'paymaster token units')

// Quote gasless transfer fee
const quote = await account.quoteTransfer({
  token: 'EQ...',      // Jetton contract address
  recipient: 'EQ...',  // Recipient's TON address
  amount: 1000000      // Amount in Jetton's base units 
})
console.log('Transfer fee estimate:', quote.fee, 'paymaster token units')
```

### Message Signing and Verification

Sign and verify messages using `WalletAccountTonGasless`.

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

Retrieve current fee rates using `WalletManagerTonGasless`.

```javascript
// Get current fee rates
const feeRates = await wallet.getFeeRates();
console.log('Normal fee rate:', feeRates.normal, 'nanotons');
console.log('Fast fee rate:', feeRates.fast, 'nanotons');
```

### Memory Management

Clear sensitive data from memory using `dispose` methods in `WalletAccountTonGasless` and `WalletManagerTonGasless`.


```javascript
// Dispose wallet accounts to clear private keys from memory
account.dispose()

// Dispose entire wallet manager
wallet.dispose()
```

## Complete Examples

### Complete Wallet Setup

```javascript
import WalletManagerTonGasless from '@tetherto/wdk-wallet-ton-gasless'

async function setupWallet() {
  try {
    // Use a BIP-39 seed phrase (replace with your own secure phrase)
    const seedPhrase = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
    
    // Create gasless wallet manager
    const wallet = new WalletManagerTonGasless(seedPhrase, {
      tonClient: {
        url: 'https://toncenter.com/api/v3',
        secretKey: 'your-api-key' // Optional
      },
      tonApiClient: {
        url: 'https://tonapi.io/v2',
        secretKey: 'your-tonapi-key' // Optional but recommended
      },
      paymasterToken: {
        address: 'EQ...' // REQUIRED: Paymaster token address
      },
      transferMaxFee: 1000000000 // Optional: Maximum fee in nanotons
    })
    
    // Get first account
    const account = await wallet.getAccount(0)
    const address = await account.getAddress()
    console.log('Wallet address:', address)
    // Check balances
    const balance = await account.getBalance()
    const paymasterBalance = await account.getPaymasterTokenBalance()
    console.log('TON balance:', balance, 'nanotons')
    console.log('Paymaster token balance:', paymasterBalance)
    
    return { wallet, account, address, balance }
  } catch (error) {
    console.error('Failed to setup wallet:', error)
    throw error
  }
}
```

### Multi-Account Management

```javascript
async function manageMultipleAccounts(wallet) {
  try {
    const accounts = []
    
    // Create 5 accounts
    for (let i = 0; i < 5; i++) {
      const account = await wallet.getAccount(i)
      const address = await account.getAddress()
      const balance = await account.getBalance()
      const paymasterBalance = await account.getPaymasterTokenBalance()
      
      accounts.push({
        index: i,
        address,
        balance,
        paymasterBalance
      })
    }
    return accounts
  } catch (error) {
    console.error('Failed to manage accounts:', error)
    throw error
  } finally {
    // Clean up when done to remove sensitive data from memory
    wallet.dispose()
  }
}
```

### Advanced Transaction Example
```javascript
async function sendAdvancedGaslessTransfer(account) {
  try {
    // Check paymaster token balance first
    const paymasterBalance = await account.getPaymasterTokenBalance()
    console.log('Paymaster token balance:', paymasterBalance)
    
    // Get transfer quote first
    const quote = await account.quoteTransfer({
      token: 'EQ...',      // Jetton master contract address
      recipient: 'EQ...',  // Recipient's TON address
      amount: 1000000000   // Amount in Jetton's base units
    })
    
    console.log('Estimated fee (paymaster token):', quote.fee)
      // Execute gasless transfer
    const result = await account.transfer({
      token: 'EQ...',
      recipient: 'EQ...',
      amount: 1000000000
    }, {
      paymasterToken: {     // Optional: override default paymaster
        address: 'EQ...'
      },
      transferMaxFee: 2000000000 // Optional: override max fee
    })

    console.log('Transfer hash:', result.hash)
    console.log('Actual fee (paymaster token):', result.fee)

    return result
  }catch (error) {
    console.error('Transfer failed:', error)
    throw error
  }
}
```

### Token Transfer with Validation

```javascript
async function transferJettonWithValidation(account, jettonAddress, recipient, amount) {
  try {
    // Validate TON addresses (basic check)
    if (typeof jettonAddress !== 'string' || jettonAddress.length === 0) {
      throw new Error('Invalid Jetton address format')
    }

    // Validate recipient address
    if (typeof recipient !== 'string' || recipient.length === 0) {
      throw new Error('Invalid recipient address format')
    }

    // Check Jetton balance
    const balance = await account.getTokenBalance(jettonAddress)
    if (balance < amount) {
      throw new Error('Insufficient Jetton balance')
    }
     // Check paymaster token balance
    const paymasterBalance = await account.getPaymasterTokenBalance()
    console.log('Paymaster token balance:', paymasterBalance)

    // Get transfer quote (fee is in paymaster token units)
    const quote = await account.quoteTransfer({
      token: jettonAddress,
      recipient,
      amount
    })

    console.log('Transfer fee estimate (paymaster token):', quote.fee)

    // Execute transfer if fee is acceptable
    const result = await account.transfer({
      token: jettonAddress,
      recipient,
      amount
    })
     console.log('Transfer hash:', result.hash)
    console.log('Actual fee (paymaster token):', result.fee)
    
    return result
  } catch (error) {
    console.error('Transfer failed:', error)
    throw error
  }
}
```


### Error Handling and Memory Management

```javascript
async function safeTransferExample(account, wallet) {
  try {
    // Check balances first
    const jettonBalance = await account.getTokenBalance('EQ...')
    const paymasterBalance = await account.getPaymasterTokenBalance()
    const transferAmount = 1000000000

    if (jettonBalance < transferAmount) {
      throw new Error('insufficient jetton balance')
    }

    if (paymasterBalance < 1000000) { // Minimum paymaster balance check
      throw new Error('insufficient paymaster balance')
    }
    // Get fee estimate
    const quote = await account.quoteTransfer({
      token: 'EQ...',
      recipient: 'EQ...',
      amount: transferAmount
    })

    console.log('Estimated fee (paymaster token):', quote.fee)

    // Execute transfer
    const result = await account.transfer({
      token: 'EQ...',
      recipient: 'EQ...',
      amount: transferAmount
    })

    console.log('Transfer successful:', result.hash)
    return result
      } catch (error) {
    if (error.message.includes('insufficient jetton balance')) {
      console.error('Please add more Jetton tokens to your wallet')
    } else if (error.message.includes('insufficient paymaster balance')) {
      console.error('Please add more paymaster tokens for gas fees')
    } else if (error.message.includes('invalid address')) {
      console.error('The recipient address is invalid')
    } else if (error.message.includes('max fee')) {
      console.error('The transfer fee exceeds your configured maximum')
    } else {
      console.error('Transfer failed:', error.message)
    }
    throw error

  } finally {
    // Always clean up sensitive data
    account.dispose()
    wallet.dispose()
  }
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
				<strong>WDK TON Gasless Wallet Configuration</strong>
			</td>
			<td>Get started with WDK's TON Gasless Wallet Configuration</td>
			<td>
				<a href="./configuration.md">WDK TON Gasless Wallet Configuration</a>
			</td>
		</tr>
        <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK TON Gasless Wallet API</strong>
			</td>
			<td>Get started with WDK's TON Gasless Wallet API</td>
			<td>
				<a href="./api-reference.md">WDK TON Gasless Wallet API</a>
			</td>
		</tr>
	</tbody>
</table>

***

### Need Help?

{% include "../../../.gitbook/includes/support-cards.md" %}
