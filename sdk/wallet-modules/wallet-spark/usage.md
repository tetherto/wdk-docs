---
title: Wallet Spark Usage
description: Installation, quick start, and usage examples for @tetherto/wdk-wallet-spark
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

To install the `@tetherto/wdk-wallet-spark` package, follow these instructions:

```bash
npm install @tetherto/wdk-wallet-spark
```

## Quick Start

### Importing from `@tetherto/wdk-wallet-spark`

1. WalletManagerSpark: Main class for managing wallets
2. WalletAccountSpark: Use this for full access accounts

### Creating a New Spark Wallet

```javascript
import WalletManagerSpark from '@tetherto/wdk-wallet-spark'

// Use a BIP-39 seed phrase (replace with your own secure phrase)
const seedPhrase = 'your twelve word seed phrase here'


// Create wallet manager with default configuration
const wallet = new WalletManagerSpark(seedPhrase)

// Or with custom network configuration
const wallet = new WalletManagerSpark(seedPhrase, {
  network: 'MAINNET' // 'MAINNET', 'TESTNET', or 'REGTEST'
})

// Get a full access account
const account = await wallet.getAccount(0)

// Get the account's Spark address
const address = await account.getAddress()
console.log('Account address:', address)
```

**Note**: The Spark wallet integrates with the Spark network using the `@buildonspark/spark-sdk`. Network configuration is limited to predefined networks, and there's no custom RPC provider option.

### Managing Multiple Accounts

```javascript
import WalletManagerSpark from '@tetherto/wdk-wallet-spark'

// Assume wallet is already created
// Get the first account (index 0)
const account = await wallet.getAccount(0)
const address = await account.getAddress()
console.log('Account 0 address:', address)

// Get the second account (index 1)
const account1 = await wallet.getAccount(1)
const address1 = await account1.getAddress()
console.log('Account 1 address:', address1)

// Get the third account (index 2)
const account2 = await wallet.getAccount(2)
const address2 = await account2.getAddress()
console.log('Account 2 address:', address2)

// Note: All accounts use BIP-44 derivation paths with pattern:
// m/44'/998'/{networkNumber}'/0/{index} where 998 is the coin type for Spark
// and networkNumber is 0 for MAINNET, 1 for TESTNET, or 2 for REGTEST
```

**Important Note**: Custom derivation paths via `getAccountByPath()` are not supported on the Spark blockchain. Only indexed accounts using the standard BIP-44 pattern are available.

### Checking Balance

```javascript
import WalletManagerSpark from '@tetherto/wdk-wallet-spark'

// Assume wallet and account are already created
// Get Spark balance in satoshis
const balance = await account.getBalance()
console.log('Balance:', balance, 'satoshis')
console.log('Balance:', balance / 100000000, 'BTC')
```

### Transfer History

```javascript
import WalletManagerSpark from '@tetherto/wdk-wallet-spark'

// Assume wallet is already created
// Get transfer history (default: 10 most recent transfers)
const transfers = await account.getTransfers()
console.log('Transfer history:', transfers)

// Get transfer history with options
const recentTransfers = await account.getTransfers({
  direction: 'all', // 'all', 'incoming', or 'outgoing'
  limit: 20,        // Number of transfers to fetch
  skip: 0           // Number of transfers to skip
})
console.log('Recent transfers:', recentTransfers)

// Get only incoming transfers
const incomingTransfers = await account.getTransfers({
  direction: 'incoming',
  limit: 5
})
console.log('Incoming transfers:', incomingTransfers)
```

### Sending Spark Transactions

```javascript
// Send native tokens (satoshis)
const result = await account.sendTransaction({
  to: 'spark1...', // Recipient's Spark address
  value: 1000000   // Amount in satoshis
})
console.log('Transaction hash:', result.hash)
console.log('Transaction fee:', result.fee) // Always 0 for Spark transactions

// Get transaction fee estimate
const quote = await account.quoteSendTransaction({
  to: 'spark1...',
  value: 1000000
})
console.log('Estimated fee:', quote.fee) // Always returns 0

// Example with different amounts
const smallTransaction = await account.sendTransaction({
  to: 'spark1...',
  value: 100000 // 0.001 BTC in satoshis
})
```

**Important Notes:**
- Spark transactions have zero fees (`fee: 0`)
- Memo/description functionality is not supported in `sendTransaction`
- All amounts are specified in satoshis (1 BTC = 100,000,000 satoshis)
- Addresses should be valid Spark network addresses

### Message Signing and Verification

```javascript
// Sign a message
const message = 'Hello, Spark!'
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

### Lightning Network Integration

```javascript
// Create a Lightning Network invoice for receiving payments
const invoice = await account.createLightningInvoice({
  amountSats: 50000, // 0.0005 BTC
  memo: 'Payment for services'
})
console.log('Lightning invoice:', invoice.invoice) // BOLT11 encoded invoice


// Pay a Lightning invoice
const payment = await account.payLightningInvoice({
  encodedInvoice: 'lnbc500u1p...', // BOLT11 encoded invoice
  maxFeeSats: 1000 // Maximum fee willing to pay
})
console.log('Payment result:', payment)

// Get Lightning payment fee estimate
// Note: getLightningSendFeeEstimate() has been renamed to quotePayLightningInvoice()
const feeEstimate = await account.quotePayLightningInvoice({
  encodedInvoice: 'lnbc500u1p...'
})
console.log('Fee estimate:', Number(feeEstimate), 'satoshis')

// Get Lightning send request by ID (new in v1.0.0-beta.6)
const sendRequest = await account.getLightningSendRequest(payment.id)
if (sendRequest) {
  console.log('Payment status:', sendRequest.status)
}
```

### Bitcoin Layer 1 Bridge

```javascript
// Generate a static deposit address for Bitcoin layer 1 deposits
// getSingleUseDepositAddress() can also be used but static deposit address is recommended
const depositAddress = await account.getStaticDepositAddress()
console.log('Deposit address:', depositAddress)

// Check if a deposit has been confirmed
const utxos = await account.getUtxosForDepositAddress(depositAddress)
if (utxos) {
  console.log('Deposit confirmed:', utxos)
  
  // Claim the deposit to your Spark wallet
  const walletLeaves = await account.claimStaticDeposit(utxos[utxos.length - 1])
  console.log('Deposit claimed:', walletLeaves)
}

// Get withdrawal fee quote first (recommended)
const feeQuote = await account.quoteWithdraw({
  withdrawalAddress: 'bc1...',
  amountSats: 100000 // 0.001 BTC
})
console.log('Withdrawal fee quote:', feeQuote)

// Withdraw Bitcoin from Spark to layer 1
// Note: withdraw() now uses onchainAddress and amountSats parameters
const withdrawal = await account.withdraw({
  onchainAddress: 'bc1...',
  amountSats: 100000 // 0.001 BTC
})
console.log('Withdrawal request:', withdrawal)
```

### Spark Invoices

Spark invoices allow you to create invoices for receiving payments directly on the Spark network (not Lightning).

```javascript
// Create a Spark invoice for receiving sats
const satsInvoice = await account.createSparkSatsInvoice({
  amount: 100000, // 0.001 BTC
  memo: 'Payment for services',
  expiryTime: new Date(Date.now() + 3600000) // 1 hour from now
})
console.log('Spark sats invoice:', satsInvoice)

// Create a Spark invoice for receiving tokens
const tokenInvoice = await account.createSparkTokensInvoice({
  tokenIdentifier: 'btkn1...',
  amount: BigInt(1000),
  memo: 'Token payment'
})
console.log('Spark token invoice:', tokenInvoice)

// Pay a Spark invoice
const paymentResult = await account.paySparkInvoice([
  {
    invoice: satsInvoice,
    amount: BigInt(100000)
  }
])
console.log('Payment result:', paymentResult)

// Query Spark invoice status
const invoiceStatus = await account.getSparkInvoices([
  satsInvoice,
  tokenInvoice
])
console.log('Invoice statuses:', invoiceStatus)
```

### Token Transfers

```javascript
// Transfer tokens to another address
const transferResult = await account.transfer({
  token: 'btkn1...', // Token identifier (Bech32m format)
  amount: BigInt(1000000), // Amount of tokens
  recipient: 'spark1...' // Recipient Spark address
})
console.log('Token transfer hash:', transferResult.hash)
console.log('Transfer fee:', Number(transferResult.fee)) // Always 0
```

### Additional Deposit Methods

```javascript
// Get unused deposit addresses
const unusedAddresses = await account.getUnusedDepositAddresses()
console.log('Unused deposit addresses:', unusedAddresses)

// Get static deposit address (reusable)
const staticAddress = await account.getStaticDepositAddress()
console.log('Static deposit address:', staticAddress)

// Claim a static deposit
const staticLeaves = await account.claimStaticDeposit('bitcoin_tx_id...')
console.log('Claimed static deposit:', staticLeaves)

// Refund a static deposit
const refundTx = await account.refundStaticDeposit({
  depositTransactionId: 'txid...',
  outputIndex: 0,
  destinationAddress: 'bc1q...',
  satsPerVbyteFee: 10
})
console.log('Refund transaction (hex):', refundTx)
// Note: This transaction needs to be broadcast to the Bitcoin network
```

## Complete Examples

### Complete Spark Wallet Setup

```javascript
import WalletManagerSpark from '@tetherto/wdk-wallet-spark'

async function setupSparkWallet() {
  // Use a BIP-39 seed phrase (replace with your own secure phrase)
  const seedPhrase = 'your twelve word seed phrase here' // Replace with actual seed generation

  // Create Spark wallet manager
  const wallet = new WalletManagerSpark(seedPhrase, {
    network: 'MAINNET' // 'MAINNET', 'TESTNET', or 'REGTEST'
  })
  
  // Get first account
  const account = await wallet.getAccount(0)
  const address = await account.getAddress()
  console.log('Spark address:', address)
  
  // Check balance
  const balance = await account.getBalance()
  console.log('Balance:', balance / 100000000, 'BTC')
  
  return { wallet, account, address, balance }
}
```

### Lightning Network Integration

```javascript
async function lightningPaymentFlow(account) {
  // Create an invoice to receive payment
  const invoice = await account.createLightningInvoice({
    amountSats: 100000, // 0.001 BTC
    memo: 'Payment for coffee'
  })
  console.log('Invoice created:', invoice.invoice)

  // Later, pay an invoice
  const payment = await account.payLightningInvoice({
    encodedInvoice: 'lnbc1000u1p...',
    maxFeeSats: 500
  })
  console.log('Payment sent:', payment)
}
```
### Bitcoin Layer 1 Bridge

```javascript
async function bitcoinBridgeFlow(account) {
  // Generate deposit address
  const depositAddress = await account.getStaticDepositAddress()
  console.log('Send Bitcoin to:', depositAddress)
  
  // Check for deposits
  const txId = await account.getUtxosForDepositAddress(depositAddress)
  if (txId) {
    // Claim the deposit
    const walletLeaves = await account.claimStaticDeposit(txId)
    console.log('Deposit claimed:', walletLeaves)
  }
  
  // Get withdrawal fee quote
  const feeQuote = await account.quoteWithdraw({
    withdrawalAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    amountSats: 50000 // 0.0005 BTC
  })
  console.log('Withdrawal fee quote:', feeQuote)
  
  // Withdraw to Bitcoin layer 1
  // Note: withdraw() now uses onchainAddress and amountSats parameters
  const withdrawal = await account.withdraw({
    onchainAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    amountSats: 50000 // 0.0005 BTC
  })
  console.log('Withdrawal initiated:', withdrawal)
}
```
### Multi-Account Management

```javascript
async function manageMultipleAccounts(wallet) {
  const accounts = []
  
  // Create 3 accounts
  for (let i = 0; i < 3; i++) {
    const account = await wallet.getAccount(i)
    const address = await account.getAddress()
    const balance = await account.getBalance()
    
    accounts.push({
      index: i,
      address,
      balance: balance / 100000000 // Convert to BTC
    })
  }
  
  return accounts
}
```
### Transaction History Analysis

```javascript
async function analyzeTransactionHistory(account) {
  // Get all transfers
  const allTransfers = await account.getTransfers()
  
  // Note: The actual transfer object structure depends on the Spark SDK
  // This example assumes common properties, but verify with actual response
  
  let totalReceived = 0
  let totalSent = 0
  
  allTransfers.forEach(transfer => {
    // Adjust property names based on actual Spark SDK response
    if (transfer.direction === 'incoming' || transfer.type === 'receive') {
      totalReceived += transfer.amount || transfer.value || 0
    } else if (transfer.direction === 'outgoing' || transfer.type === 'send') {
      totalSent += transfer.amount || transfer.value || 0
    }
  })
  
  return {
    totalReceived: totalReceived / 100000000, // BTC
    totalSent: totalSent / 100000000,         // BTC
    transactionCount: allTransfers.length
  }
}
```
### Error Handling

```javascript
async function robustSparkWalletOperations(wallet) {
  try {
    const account = await wallet.getAccount(0)
    
    // Safe balance check
    try {
      const balance = await account.getBalance()
      console.log('Balance:', balance, 'satoshis')
    } catch (balanceError) {
      console.error('Failed to get balance:', balanceError.message)
    }
    
    // Safe Lightning invoice creation
    try {
      const invoice = await account.createLightningInvoice({
        amountSats: 1000,
        memo: 'Test payment'
      })
      console.log('Invoice created successfully')
    } catch (invoiceError) {
      console.error('Failed to create Lightning invoice:', invoiceError.message)
    }
    
    // Safe transfer history retrieval
    try {
      const transfers = await account.getTransfers({ limit: 5 })
      console.log('Retrieved', transfers.length, 'transfers')
    } catch (transferError) {
      console.error('Failed to get transfers:', transferError.message)
    }
    
  } catch (error) {
    console.error('Wallet operation failed:', error.message)
  } finally {
    // Always clean up
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
				<strong>WDK Spark Wallet Configuration</strong>
			</td>
			<td>Get started with WDK's Spark Wallet Configuration</td>
			<td>
				<a href="./configuration.md">WDK Spark Wallet Configuration</a>
			</td>
		</tr>
        <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK Spark Wallet API</strong>
			</td>
			<td>Get started with WDK's Spark Wallet API</td>
			<td>
				<a href="./api-reference.md">WDK Spark Wallet API</a>
			</td>
		</tr>
	</tbody>
</table>

***

### Need Help?

{% include "../../../.gitbook/includes/support-cards.md" %}
