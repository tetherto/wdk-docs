---
title: Wallet Solana Usage
description: Installation, quick start, and usage examples for @tetherto/wdk-wallet-solana
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

To install the `@tetherto/wdk-wallet-solana` package, follow these instructions:

```bash
npm install @tetherto/wdk-wallet-solana
```


## Quick Start

### Importing from `@tetherto/wdk-wallet-solana`

1. WalletManagerSolana: Main class for managing wallets
2. WalletAccountSolana: Use this for full access accounts
3. WalletAccountReadOnlySolana: Use this for read-only accounts

### Creating a New Wallet

```javascript
import WalletManagerSolana, { 
  WalletAccountSolana, 
  WalletAccountReadOnlySolana 
} from '@tetherto/wdk-wallet-solana'

// Use a BIP-39 seed phrase (replace with your own secure phrase)
const seedPhrase = 'your twelve word seed phrase here' // Replace with actual seed generation


// Create wallet manager with Solana RPC provider
const wallet = new WalletManagerSolana(seedPhrase, {
  rpcUrl: 'https://api.mainnet-beta.solana.com', // or any Solana RPC endpoint
  commitment: 'confirmed' // Optional: commitment level
})
// Get a full access account
const account = await wallet.getAccount(0)

// Convert to a read-only account
const readOnlyAccount = await account.toReadOnlyAccount()
```

### Managing Multiple Accounts

```javascript
import WalletManagerSolana from '@tetherto/wdk-wallet-solana'

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

// Note: All addresses are base58-encoded Solana public keys
// All accounts inherit the provider configuration from the wallet manager
```

### Checking Balances

#### Owned Account

For accounts where you have the seed phrase and full access:

```javascript
import WalletManagerSolana from '@tetherto/wdk-wallet-solana'

// Assume wallet and account are already created
// Get native SOL balance (in lamports)
const balance = await account.getBalance()
console.log('Native SOL balance:', balance, 'lamports')

// Get SPL token balance
const splTokenAddress = '...'; // SPL token mint address
const splTokenBalance = await account.getTokenBalance(splTokenAddress);
console.log('SPL token balance:', splTokenBalance);

// Note: Provider is required for balance checks
// Make sure wallet was created with a provider configuration
```

#### Read-Only Account

For addresses where you don't have the seed phrase:

```javascript
import { WalletAccountReadOnlySolana } from '@tetherto/wdk-wallet-solana'

// Create a read-only account
const readOnlyAccount = new WalletAccountReadOnlySolana('publicKey', { // Base58-encoded public key
  rpcUrl: 'https://api.mainnet-beta.solana.com',
  commitment: 'confirmed'
})

// Check native SOL balance
const balance = await readOnlyAccount.getBalance()
console.log('Native balance:', balance, 'lamports')

// Check SPL token balance
const tokenBalance = await readOnlyAccount.getTokenBalance('EPjFWdd5...') // Token mint address
console.log('Token balance:', tokenBalance)

// Note: Token balances are returned in the token's smallest units
// Make sure to adjust for the token's decimals when displaying
```

### Sending Transactions

Send SOL and estimate fees using `WalletAccountSolana`. All transactions require a recent blockhash.

```javascript
// Send native SOL
const result = await account.sendTransaction({
  recipient: 'publicKey', // Recipient's base58-encoded public key
  value: 1000000000n, // 1 SOL in lamports
  commitment: 'confirmed' // Optional: commitment level
})
console.log('Transaction signature:', result.signature)
console.log('Transaction fee:', result.fee, 'lamports')

// Get transaction fee estimate
const quote = await account.quoteSendTransaction({
  recipient: 'publicKey',
  value: 1000000000n
});
console.log('Estimated fee:', quote.fee, 'lamports');

// Note: Fees are calculated based on recent blockhash and instruction count
```

### Token Transfers

Transfer SPL tokens and estimate fees using `WalletAccountSolana`. Uses Token Program instructions.

```javascript
// Transfer SPL tokens
const transferResult = await account.transfer({
  token: 'EPjFWdd...', // Token mint address
  recipient: 'publicKey',  // Recipient's base58-encoded public key
  amount: 1000000n     // Amount in token's base units (use BigInt for large numbers)
}, {
  commitment: 'confirmed' // Optional: commitment level
});
console.log('Transaction signature:', transferResult.signature);
console.log('Transfer fee:', transferResult.fee, 'lamports');


// Quote token transfer fee
const transferQuote = await account.quoteTransfer({
  token: 'EPjFWdd...', // Token mint address
  recipient: 'publicKey',  // Recipient's base58-encoded public key
  amount: 1000000n     // Amount in token's base units
})
console.log('Transfer fee estimate:', transferQuote.fee, 'lamports')

// Note: If recipient doesn't have a token account, one will be created automatically
```

### Message Signing and Verification

Sign and verify messages using Ed25519 cryptography.

```javascript
// Sign a message
const message = 'Hello, Solana!'
const signature = await account.sign(message)
console.log('Signature:', signature)

// Verify a signature (using read-only account)
const readOnlyAccount = await account.toReadOnlyAccount()
const isValid = await readOnlyAccount.verify(message, signature)
console.log('Signature valid:', isValid)
```

### Fee Management

Retrieve current fee rates using `WalletManagerSolana`. Rates are calculated based on recent blockhash and compute unit prices.

```javascript
// Get current fee rates
const feeRates = await wallet.getFeeRates();
console.log('Normal fee rate:', feeRates.normal, 'lamports'); // Standard compute unit price
console.log('Fast fee rate:', feeRates.fast, 'lamports');     // Priority compute unit price with higher unit limit
```

### Memory Management

Clear sensitive data from memory using `dispose` methods in `WalletAccountSolana` and `WalletManagerSolana`.

```javascript
// Dispose wallet accounts to clear private keys from memory
account.dispose()

// Dispose entire wallet manager
wallet.dispose()
```

## Complete Examples

### Complete Wallet Setup

```javascript
import WalletManagerSolana from '@tetherto/wdk-wallet-solana'

async function setupWallet() {
  try {
    // Use a BIP-39 seed phrase (replace with your own secure phrase)
    const seedPhrase = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
    
    // Create wallet manager with Solana RPC configuration
    const wallet = new WalletManagerSolana(seedPhrase, {
      rpcUrl: 'https://api.mainnet-beta.solana.com',
      transferMaxFee: 10000000 // Optional: Maximum fee in lamports
    })
    
    // Get first account
    const account = await wallet.getAccount(0)
    const address = await account.getAddress()
    console.log('Wallet address:', address)
    
    // Check balance
    const balance = await account.getBalance()
    console.log('SOL balance:', balance, 'lamports')
    
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

### Advanced SPL Token Transfer Example

```javascript
async function sendAdvancedSPLTransfer(account) {
  try {
    // Get transfer quote first
    const quote = await account.quoteTransfer({
      token:'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT mint address
      recipient: '11111111111111111111111111111112', // Recipient's Solana address
      amount: 1000000 // Amount in SPL token's base units (6 decimals for USDT)
    })
    
    console.log('Estimated fee:', quote.fee, 'lamports')
    
    // Execute the transfer
    const result = await account.transfer({
      token:'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
      recipient: '11111111111111111111111111111112',
      amount: 1000000
    })

    console.log('Transfer hash:', result.hash)
    console.log('Fee paid:', result.fee, 'lamports')

    return result
  } catch (error) {
    console.error('Transfer failed:', error)
    throw error
  }
}
```

### Native SOL Transfer Example

```javascript
async function sendSOLTransfer(account) {
  try {
    // Send native SOL
    const result = await account.sendTransaction({
      to: '11111111111111111111111111111112', // Recipient's address
      value: 1000000000 // 1 SOL in lamports
    })
    
    console.log('Transaction hash:', result.hash)
    console.log('Fee paid:', result.fee, 'lamports')
    
    return result
  } catch (error) {
    console.error('Transaction failed:', error)
    throw error
  }
}
```

### Token Transfer with Validation

```javascript
async function transferSPLWithValidation(account, splTokenMint, recipient, amount) {
  try {
    // Validate SPL token mint address (Solana format)
    if (typeof splTokenMint !== 'string' || splTokenMint.length < 32) {
      throw new Error('Invalid SPL token mint address')
    }

    // Validate recipient address (Solana format)
    if (typeof recipient !== 'string' || recipient.length < 32) {
      throw new Error('Invalid recipient address')
    }

    // Check SPL token balance
    const balance = await account.getTokenBalance(splTokenMint)
    if (balance < amount) {
      throw new Error('Insufficient SPL token balance')
    }

    // Get transfer quote (fee is in lamports)
    const quote = await account.quoteTransfer({
      token: splTokenMint,
      recipient,
      amount
    })

    console.log('Transfer fee estimate:', quote.fee, 'lamports')

    // Execute transfer if fee is acceptable
    const result = await account.transfer({
      token: splTokenMint,
      recipient,
      amount
    })

    console.log('Transfer hash:', result.hash)
    console.log('Actual fee:', result.fee, 'lamports')
    
    return result
  } catch (error) {
    console.error('Transfer failed:', error)
    throw error
  }
}
```

### Error Handling

```javascript
try {
  const result = await account.transfer({
    token: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT mint address
    recipient: '11111111111111111111111111111112', // Recipient's Solana address
    amount: 1000000 // Amount in SPL token's base units
  });
  console.log('Transfer submitted:', result.hash);
} catch (error) {
  console.error('Transfer failed:', error.message);
  // Handle specific error types
  if (error.message.toLowerCase().includes('insufficient')) {
    console.log('Please add more USDT tokens to your wallet');
  } else if (error.message.toLowerCase().includes('fee')) {
    console.log('The transfer fee exceeds your configured maximum.');
  }
}
```

### Error Handling and Memory Management

```javascript
async function safeTransferExample(account, wallet) {
  try {
    // Check balances first
    const solBalance = await account.getBalance()
    const transferAmount = 1000000000 // 1 SOL

    if (solBalance < transferAmount) {
      throw new Error('insufficient sol balance')
    }

    // Get fee estimate
    const quote = await account.quoteSendTransaction({
      to: '11111111111111111111111111111112',
      value: transferAmount
    })

    console.log('Estimated fee:', quote.fee, 'lamports')

    // Send transaction
    const result = await account.sendTransaction({
      to: '11111111111111111111111111111112',
      value: transferAmount
    })

    console.log('Transaction successful:', result.hash)
    return result

  } catch (error) {
    if (error.message.includes('insufficient sol balance')) {
      console.error('Please add more SOL to your wallet')
    } else if (error.message.includes('invalid address')) {
      console.error('The recipient address is invalid')
    } else if (error.message.includes('max fee')) {
      console.error('The transfer fee exceeds your configured maximum')
    } else {
      console.error('Transaction failed:', error.message)
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
				<strong>WDK Solana Wallet Configuration</strong>
			</td>
			<td>Get started with WDK's Solana Wallet Configuration</td>
			<td>
				<a href="./configuration.md">WDK Solana Wallet Configuration</a>
			</td>
		</tr>
        <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK Solana Wallet API</strong>
			</td>
			<td>Get started with WDK's Solana Wallet API</td>
			<td>
				<a href="./api-reference.md">WDK Solana Wallet API</a>
			</td>
		</tr>
	</tbody>
</table>

***

### Need Help?

{% include "../../../.gitbook/includes/support-cards.md" %}
