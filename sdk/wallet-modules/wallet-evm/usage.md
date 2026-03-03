---
title: Wallet EVM Usage
description: Installation, quick start, and usage examples for @tetherto/wdk-wallet-evm 
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

To install the `@tetherto/wdk-wallet-evm` package, follow these instructions:

```bash
npm install @tetherto/wdk-wallet-evm
```

## Quick Start

### Creating a New Wallet

{% hint style="danger" %}
**Secure the Seed Phrase:** You must securely store this seed phrase immediately. If it is lost, the user will permanently lose access to their funds.
{% endhint %}

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
{% hint style="info" %}
**RPC Providers:** The examples use public RPC endpoints for demonstration. We do not endorse any specific provider.
*   **Testnets:** You can find public RPCs for Ethereum and other EVM chains on [Chainlist](https://chainlist.org).
*   **Mainnet:** For production environments, we recommend using reliable, paid RPC providers to ensure stability.
{% endhint %}

{% hint style="info" %}
> To use test/mock tokens instead of real funds, see the [configuration section](./configuration.md#network-support).

{% endhint %}

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
const tokenAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7' // USDT
const tokenBalance = await account.getTokenBalance(tokenAddress)
console.log('Token balance:', tokenBalance)

// Get balances for multiple ERC-20 tokens
const tokenBalances = await account.getTokenBalances([
  '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
  '0x68749665FF8D2d112Fa859AA293F07A622782F38'  // XAUT
])
console.log('Multi-token balances:', tokenBalances)
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

// Check balances for multiple ERC20 tokens
const tokenBalances = await readOnlyAccount.getTokenBalances([
  '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
  '0x68749665FF8D2d112Fa859AA293F07A622782F38'  // XAUT
])
console.log('Multi-token balances:', tokenBalances)
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

{% hint style="info" %}
**Gas Estimation:** The `maxFeePerGas` and `maxPriorityFeePerGas` fields enable EIP-1559 transactions, ensuring more predictable gas fees and faster inclusion times.
{% endhint %}

### Token Transfers

```javascript
// Transfer ERC-20 tokens
const transferResult = await account.transfer({
  token: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
  recipient: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  amount: 1000000000000000000n // 1 token in base units
})
console.log('Transfer hash:', transferResult.hash)
console.log('Transfer fee:', transferResult.fee, 'wei')

// Quote token transfer
const transferQuote = await account.quoteTransfer({
  token: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
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

// Verify a signature (using read-only account)
const readOnlyAccount = await account.toReadOnlyAccount()
const isValid = await readOnlyAccount.verify(message, signature)
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

  // Check multiple ERC20 balances
  const tokenBalances = await account.getTokenBalances([
    '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
    '0x68749665FF8D2d112Fa859AA293F07A622782F38'  // XAUT
  ])
  console.log('Multi-token balances:', tokenBalances)
  
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
				<strong>WDK EVM Wallet Configuration</strong>
			</td>
			<td>Get started with WDK's EVM Wallet Configuration</td>
			<td>
				<a href="./configuration.md">WDK EVM Wallet Configuration</a>
			</td>
		</tr>
        <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK EVM Wallet API</strong>
			</td>
			<td>Get started with WDK's EVM Wallet API</td>
			<td>
				<a href="./api-reference.md">WDK EVM Wallet API</a>
			</td>
		</tr>
	</tbody>
</table>

***

### Need Help?

{% include "../../../.gitbook/includes/support-cards.md" %}
