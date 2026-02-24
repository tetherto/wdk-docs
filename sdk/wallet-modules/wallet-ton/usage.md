---
title: Wallet TON Usage
description: Installation, quick start, and usage examples for @tetherto/wdk-wallet-ton
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

To install the `@tetherto/wdk-wallet-ton` package, follow these instructions:


```bash
npm install @tetherto/wdk-wallet-ton
```



## Quick Start

### Importing from `@tetherto/wdk-wallet-ton`

1. WalletManagerTon: Main class for managing wallets
2. WalletAccountTon: Use this for full access accounts
3. WalletAccountReadOnlyTon: Use this for read-only accounts

### Creating a New Wallet

```javascript
import WalletManagerTon, { WalletAccountTon, WalletAccountReadOnlyTon } from '@tetherto/wdk-wallet-ton'

// Use a BIP-39 seed phrase (replace with your own secure phrase)
const seedPhrase = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about' // Replace with actual seed generation

// Create wallet manager with TON client config
const wallet = new WalletManagerTon(seedPhrase, {
  tonClient: {
    url: 'https://toncenter.com/api/v3',
    secretKey: 'your-api-key' // Optional
  }
})

// Get a full access account
const account = await wallet.getAccount(0)

// Convert to a read-only account
const readOnlyAccount = await account.toReadOnlyAccount()
```

### Managing Multiple Accounts

```javascript
import WalletManagerTon from '@tetherto/wdk-wallet-ton'

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
import WalletManagerTon from '@tetherto/wdk-wallet-ton'

// Assume wallet and account are already created
// Get native TON balance
const balance = await account.getBalance()
console.log('Native TON balance:', balance, 'nanotons')

// Get Jetton token balance
const jettonAddress = 'EQ...'; // Jetton contract address
const jettonBalance = await account.getTokenBalance(jettonAddress);
console.log('Jetton token balance:', jettonBalance);
```

#### Read-Only Account
For addresses where you don't have the seed phrase:

```javascript
import { WalletAccountReadOnlyTon } from '@tetherto/wdk-wallet-ton'

// Use the public key directly
const publicKey = '...'; // Replace with the actual public key

// Create a read-only account
const readOnlyAccount = new WalletAccountReadOnlyTon(publicKey, {
  tonClient: {
    url: 'https://toncenter.com/api/v3',
    secretKey: 'your-api-key' // Optional
  }
})

// Check the balance
const balance = await readOnlyAccount.getBalance()
console.log('Read-only account balance:', balance)
```


### Sending Transactions

Send TON and estimate fees using `WalletAccountTon`. Requires TON Center client configuration.

```javascript
// Send native TON
const result = await account.sendTransaction({
  to: 'EQ...', // TON address
  value: 1000000000, // 1 TON in nanotons
  bounceable: true // Optional: specify if the address is bounceable
})
console.log('Transaction hash:', result.hash)
console.log('Transaction fee:', result.fee, 'nanotons')


// Get transaction fee estimate
const quote = await account.quoteSendTransaction({
  to: 'EQ...',
  value: 1000000000,
  bounceable: true
});
console.log('Estimated fee:', quote.fee, 'nanotons');
```

### Token Transfers

Transfer Jetton tokens and estimate fees using `WalletAccountTon`. Requires TON Center client configuration.

```javascript
// Transfer Jettons
const transferResult = await account.transfer({
  token: 'EQ...',      // Jetton contract address
  recipient: 'EQ...',  // Recipient's TON address
  amount: 1000000      // Amount in Jetton's base units
});
console.log('Transfer hash:', transferResult.hash);
console.log('Transfer fee:', transferResult.fee, 'nanotons');

// Quote token transfer
const transferQuote = await account.quoteTransfer({
  token: 'EQ...',      // Jetton contract address
  recipient: 'EQ...',  // Recipient's TON address
  amount: 1000000      // Amount in Jetton's base units 
})
console.log('Transfer fee estimate:', transferQuote.fee, 'nanotons')
```

### Message Signing and Verification

Sign and verify messages using `WalletAccountTon`.

```javascript
// Sign a message
const message = 'Hello, TON!'
const signature = await account.sign(message)
console.log('Signature:', signature)

// Verify a signature (using read-only account)
const readOnlyAccount = await account.toReadOnlyAccount()
const isValid = await readOnlyAccount.verify(message, signature)
console.log('Signature valid:', isValid)
```

### Fee Management

Retrieve current fee rates using `WalletManagerTon`.

```javascript
// Get current fee rates
const feeRates = await wallet.getFeeRates();
console.log('Normal fee rate:', feeRates.normal, 'nanotons');
console.log('Fast fee rate:', feeRates.fast, 'nanotons');
```

### Memory Management

Clear sensitive data from memory using `dispose` methods in `WalletAccountTon` and `WalletManagerTon`.


```javascript
// Dispose wallet accounts to clear private keys from memory
account.dispose()

// Dispose entire wallet manager
wallet.dispose()
```

## Complete Examples

### Complete Wallet Setup

```javascript
import WalletManagerTon from '@tetherto/wdk-wallet-ton'

async function setupWallet() {
  try {
    // Use a BIP-39 seed phrase (replace with your own secure phrase)
    const seedPhrase = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
    
    // Create wallet manager with TON client config
    const wallet = new WalletManagerTon(seedPhrase, {
      tonClient: {
        url: 'https://toncenter.com/api/v3',
        secretKey: 'your-api-key' // Optional
      },
      transferMaxFee: 1000000000 // Optional: 1 TON in nanotons
    })
    
    // Get first account
    const account = await wallet.getAccount(0)
    const address = await account.getAddress()
    console.log('Wallet address:', address)
    
    // Check balance
    const balance = await account.getBalance()
    console.log('Balance:', balance, 'nanotons')
    
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
      
      accounts.push({
        index: i,
        address,
        balance
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
async function sendAdvancedTransaction(account) {
  try {
    // Send transaction with TON-specific options
    const result = await account.sendTransaction({
      to: 'EQ...', // Recipient's TON address
      value: 1000000000, // 1 TON in nanotons
      bounceable: true, // TON-specific: whether the address is bounceable
      body: '' // Optional: message body
    });

    console.log('Transaction hash:', result.hash);
    console.log('Fee paid:', result.fee, 'nanotons');

    return result;
  } catch (error) {
    if (error.message.includes('insufficient balance')) {
      console.error('Not enough TON to complete transaction');
    } else if (error.message.includes('invalid address')) {
      console.error('Invalid recipient address');
    } else {
      console.error('Transaction failed:', error.message);
    }
    throw error;
  }
}
```

### Token Transfer with Validation

```javascript
async function transferJettonWithValidation(account, jettonAddress, recipient, amount) {
  try {
    // Validate TON addresses (basic check)
    if (typeof jettonAddress !== 'string' || jettonAddress.length === 0) {
      throw new Error('Invalid Jetton address format');
    }

    // Validate recipient address
    if (typeof recipient !== 'string' || recipient.length === 0) {
      throw new Error('Invalid recipient address format');
    }

    // Check Jetton balance
    const balance = await account.getTokenBalance(jettonAddress);
    if (balance < amount) {
      throw new Error('Insufficient Jetton balance');
    }

    // Get transfer quote first
    const quote = await account.quoteTransfer({
      token: jettonAddress,
      recipient,
      amount
    });

    console.log('Estimated fee:', quote.fee, 'nanotons');

    // Execute transfer if fee is acceptable
    const result = await account.transfer({
      token: jettonAddress,
      recipient,
      amount
    });

    console.log('Transfer hash:', result.hash);
    console.log('Actual fee:', result.fee, 'nanotons');
    
    return result;
  } catch (error) {
    console.error('Transfer failed:', error.message);
    throw error;
  }
}
```

### Error Handling and Memory Management

```javascript
async function safeTransactionExample(account, wallet) {
  try {
    // Check balance first
    const balance = await account.getBalance();
    const transferAmount = 1000000000; // 1 TON

    if (balance < transferAmount) {
      throw new Error('insufficient balance');
    }

    // Get fee estimate
    const quote = await account.quoteSendTransaction({
      to: 'EQ...',
      value: transferAmount
    });

    console.log('Estimated fee:', quote.fee, 'nanotons');

    // Send transaction
    const result = await account.sendTransaction({
      to: 'EQ...',
      value: transferAmount
    });

    console.log('Transaction successful:', result.hash);
    return result;

  } catch (error) {
    if (error.message.includes('insufficient balance')) {
      console.error('Please add more TON to your wallet');
    } else if (error.message.includes('invalid address')) {
      console.error('The recipient address is invalid');
    } else if (error.message.includes('timeout')) {
      console.error('Network timeout - please try again');
    } else {
      console.error('Transaction failed:', error.message);
    }
    throw error;

  } finally {
    // Always clean up sensitive data
    account.dispose();
    wallet.dispose();
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
				<strong>WDK TON Wallet Configuration</strong>
			</td>
			<td>Get started with WDK's TON Wallet Configuration</td>
			<td>
				<a href="./configuration.md">WDK TON Wallet Configuration</a>
			</td>
		</tr>
        <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK TON Wallet API</strong>
			</td>
			<td>Get started with WDK's TON Wallet API</td>
			<td>
				<a href="./api-reference.md">WDK TON Wallet API</a>
			</td>
		</tr>
	</tbody>
</table>

***

### Need Help?

{% include "../../../.gitbook/includes/support-cards.md" %}
