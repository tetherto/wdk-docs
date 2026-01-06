---
title: Wallet BTC Usage
description: Installation, quick start, and usage examples for @tetherto/wdk-wallet-btc
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

To install the `@tetherto/wdk-wallet-btc` package, follow these instructions:

```bash
npm install @tetherto/wdk-wallet-btc
```

## Quick Start

### Importing from `@tetherto/wdk-wallet-btc`

1. **WalletManagerBtc**: Main class for managing Bitcoin wallets and multiple accounts
2. **WalletAccountBtc**: Class for individual Bitcoin wallet accounts with full transaction capabilities
3. **Transport Clients**: `ElectrumTcp`, `ElectrumTls`, `ElectrumSsl`, `ElectrumWs` for connecting to Electrum servers
4. **IElectrumClient**: Interface for implementing custom Electrum clients

### Creating a New Wallet

```javascript
import WalletManagerBtc, { ElectrumTcp } from '@tetherto/wdk-wallet-btc'

// Use a BIP-39 seed phrase (replace with your own secure phrase)
const seedPhrase = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'

// Create Electrum client
const client = new ElectrumTcp({
  host: 'electrum.blockstream.info',
  port: 50001
})

// Create wallet manager with client
const wallet = new WalletManagerBtc(seedPhrase, {
  client,
  network: 'bitcoin' // 'bitcoin', 'testnet', or 'regtest'
})

// Get a full access account (uses BIP-84 derivation path by default)
const account = await wallet.getAccount(0)

// Get the account's address (Native SegWit by default)
const address = await account.getAddress()
console.log('Account address:', address)
```
**Note**: This implementation uses BIP-84 derivation paths and generates Native SegWit (bech32) addresses by default. Set `bip: 44` in config for legacy (P2PKH) addresses.

**Important Note about Electrum Servers**: 
While the package defaults to `electrum.blockstream.info` if no host is specified, **we strongly recommend configuring your own Electrum server** for production use. Public servers like Blockstream's can be significantly slower (10-300x) and may fail when fetching transaction history for popular addresses with many transactions. For better performance, consider using alternative public servers like `fulcrum.frznode.com` for development, or set up your own Fulcrum server for production environments.

### Managing Multiple Accounts

```javascript
import WalletManagerBtc, { ElectrumTcp } from '@tetherto/wdk-wallet-btc'

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

// All accounts inherit the client configuration from the wallet manager
```

**Note**: This implementation generates Native SegWit (bech32) addresses by default using BIP-84 derivation paths (`m/84'/0'/account'/0/index`). Set `bip: 44` in config for legacy (P2PKH) addresses using BIP-44 derivation paths.

### Checking Balances

#### Account Balance

```javascript
import WalletManagerBtc, { ElectrumTcp } from '@tetherto/wdk-wallet-btc'

// Assume wallet and account are already created
// Get confirmed balance (returns confirmed balance only)
const balance = await account.getBalance()
console.log('Confirmed balance:', balance, 'satoshis') // 1 BTC = 100,000,000 satoshis

// Get transfer history (incoming and outgoing transfers)
const allTransfers = await account.getTransfers()
console.log('Recent transfers (last 10):', allTransfers)

// Get transfer history with options
const incomingTransfers = await account.getTransfers({
  direction: 'incoming', // 'incoming', 'outgoing', or 'all'
  limit: 20,             // Number of transfers to fetch
  skip: 0                // Number of transfers to skip
})
console.log('Incoming transfers:', incomingTransfers)

// Get outgoing transfers only
const outgoingTransfers = await account.getTransfers({
  direction: 'outgoing',
  limit: 5
})
console.log('Outgoing transfers:', outgoingTransfers)

// Note: All balance and transfer queries require an active Electrum server connection
```

**Important Notes:**
- `getBalance()` returns confirmed balance only (no unconfirmed balance option)
- There's no direct UTXO access method - UTXOs are managed internally
- Use `getTransfers()` instead of `getTransactionHistory()` for transaction data
- Transfer objects include transaction ID, value, direction, fee, and block height information

### Sending Bitcoin Transactions

```javascript
// Send Bitcoin (amount in satoshis)
const result = await account.sendTransaction({
  to: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  value: 100000n // 0.001 BTC
})
console.log('Transaction hash:', result.hash)
console.log('Transaction fee:', result.fee, 'satoshis')

// Get transaction fee estimate before sending
const quote = await account.quoteSendTransaction({
  to: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  value: 100000n
})
console.log('Estimated fee:', quote.fee, 'satoshis')

// Send with custom fee rate (overrides automatic fee estimation)
const resultWithFeeRate = await account.sendTransaction({
  to: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  value: 100000n,
  feeRate: 10n // sat/vB - when provided, confirmationTarget is ignored
})

// Send with confirmation target (uses automatic fee estimation)
const resultWithTarget = await account.sendTransaction({
  to: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  value: 100000n,
  confirmationTarget: 6 // target 6 blocks (~1 hour) for fee estimation
})
```

**Important Notes:**
- Bitcoin transactions support **single recipient only**
- Amounts and fees are always in **satoshis** (1 BTC = 100,000,000 satoshis)
- Minimum amount must be above dust limit (294 satoshis for SegWit, 546 for legacy)
- Fee rates are calculated automatically based on network conditions if not provided

### Message Signing and Verification

```javascript
// Sign a message
const message = 'Hello, Bitcoin!'
const signature = await account.sign(message)
console.log('Signature:', signature) // Returns base64 string

// Verify a signature
const isValid = await account.verify(message, signature)
console.log('Signature valid:', isValid) // true or false

// Example with different message
const message2 = 'Bitcoin message verification test'
const signature2 = await account.sign(message2)
const isValid2 = await account.verify(message2, signature2)
console.log('Second signature valid:', isValid2)
```

### Getting Transaction History

```javascript
// Get all transfers (default: last 10)
const transfers = await account.getTransfers()
console.log('All transfers:', transfers)

// Get only incoming transfers
const incoming = await account.getTransfers({ direction: 'incoming' })
console.log('Incoming transfers:', incoming)

// Get only outgoing transfers with custom limit
const outgoing = await account.getTransfers({ 
  direction: 'outgoing', 
  limit: 5 
})
console.log('Recent outgoing transfers:', outgoing)

// Get transfers with pagination
const moreTransfers = await account.getTransfers({
  direction: 'all',
  limit: 20,
  skip: 10 // Skip first 10 transfers
})
console.log('Next 20 transfers:', moreTransfers)

// Example transfer object structure
console.log('Transfer properties:', {
  txid: 'Transaction ID',
  height: 'Block height (0 if unconfirmed)',
  value: 'Transfer value in satoshis',
  vout: 'Output index in transaction',
  direction: 'incoming or outgoing',
  recipient: 'Receiving address (for outgoing)',
  fee: 'Transaction fee in satoshis',
  address: 'Account address'
})
```

**Important Notes:**
- Returns transfer objects with detailed transaction information
- Direction options: `'incoming'`, `'outgoing'`, or `'all'` (default)
- Default limit is 10 transfers
- Change outputs are automatically filtered out
- Transfers are sorted by block height (newest first)

### Fee Management

```javascript
// Get current fee rates from mempool.space API
const feeRates = await wallet.getFeeRates()
console.log('Normal fee rate:', feeRates.normal, 'sat/vB') // ~1 hour confirmation
console.log('Fast fee rate:', feeRates.fast, 'sat/vB')     // Faster confirmation

// Fee estimation is automatic in transactions
// The wallet automatically selects appropriate fee rates
console.log('Fee rates are used automatically in sendTransaction() and quoteSendTransaction()')
```

**Important Notes:**
- `getFeeRates()` fetches from mempool.space API (returns `normal` and `fast` rates)
- `sendTransaction()`/`quoteSendTransaction()` without `feeRate` uses the Electrum server's `estimateFee()` method
- These are different fee sources - use `getFeeRates()` for display, but transactions estimate fees directly from the connected Electrum server
- Actual fees depend on transaction size (inputs/outputs) and UTXO selection

### Memory Management

```javascript
// Dispose wallet account to clear private keys from memory
account.dispose()
console.log('Account private keys cleared from memory')

// Dispose entire wallet manager (clears all accounts)
wallet.dispose()
console.log('All wallet accounts disposed')

// Note: Electrum connections are automatically closed on disposal
```

**Important Notes:**
- Always call `dispose()` when finished with accounts
- Private keys are securely wiped from memory using `sodium_memzero`
- Electrum server connections are automatically closed
- Disposal is irreversible - create new accounts if needed

## Complete Examples

### Complete Bitcoin Wallet Setup

```javascript
import WalletManagerBtc, { ElectrumTcp } from '@tetherto/wdk-wallet-btc'

async function setupBitcoinWallet() {
  // Use a BIP-39 seed phrase (replace with your own secure phrase)
  const seedPhrase = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'

  // Create Electrum client (better performance than default)
  const client = new ElectrumTcp({
    host: 'fulcrum.frznode.com',
    port: 50001
  })

  // Create Bitcoin wallet manager with recommended configuration
  const wallet = new WalletManagerBtc(seedPhrase, {
    client,
    network: 'bitcoin' // 'bitcoin', 'testnet', or 'regtest'
  })
  
  // Get first account (BIP-84 derivation path m/84'/0'/0'/0/0)
  const account = await wallet.getAccount(0)
  const address = await account.getAddress()
  console.log('Bitcoin Native SegWit address:', address) // bc1...
  
  // Check confirmed balance
  const balance = await account.getBalance()
  console.log('Balance:', balance, 'satoshis')
  console.log('Balance:', Number(balance) / 100000000, 'BTC')
  
  // Get current fee rates
  const feeRates = await wallet.getFeeRates()
  console.log('Current fee rates:', feeRates) // { normal: bigint, fast: bigint } sat/vB
  
  return { wallet, account, address, balance, feeRates }
}

// Example usage with error handling
async function safeWalletSetup() {
  try {
    const walletData = await setupBitcoinWallet()
    console.log('Wallet setup successful:', walletData)
    return walletData
  } catch (error) {
    console.error('Wallet setup failed:', error.message)
    throw error
  }
}
```

### Multi-Account Management

```javascript
import WalletManagerBtc, { ElectrumTcp } from '@tetherto/wdk-wallet-btc'

async function manageMultipleAccounts(wallet) {
  const accounts = []
  
  // Create 5 accounts using BIP-84 derivation
  for (let i = 0; i < 5; i++) {
    try {
      const account = await wallet.getAccount(i)
      const address = await account.getAddress()
      const balance = await account.getBalance()
      
      accounts.push({
        index: i,
        address,
        balance: balance, // Keep in satoshis (bigint)
        balanceBTC: Number(balance) / 100000000, // Convert to BTC for display
        derivationPath: `m/84'/0'/0'/0/${i}` // BIP-84 path
      })
    } catch (error) {
      console.error(`Failed to create account ${i}:`, error.message)
    }
  }
  
  // Create account with custom derivation path
  try {
    const customAccount = await wallet.getAccountByPath("0'/0/10")
    const customAddress = await customAccount.getAddress()
    const customBalance = await customAccount.getBalance()
    
    accounts.push({
      index: 'custom',
      address: customAddress,
      balance: customBalance,
      balanceBTC: Number(customBalance) / 100000000,
      derivationPath: `m/84'/0'/0'/0/10`
    })
  } catch (error) {
    console.error('Failed to create custom account:', error.message)
  }
  
  return accounts
}
```

### Transaction History Analysis

```javascript
async function analyzeTransactionHistory(account) {
  try {
    // Get all transfers (default limit is 10)
    const allTransfers = await account.getTransfers({ 
      direction: 'all',
      limit: 100 // Get more transfers for better analysis
    })
    
    // Calculate total received
    const totalReceived = allTransfers
      .filter(t => t.direction === 'incoming')
      .reduce((sum, t) => sum + t.value, 0n)
    
    // Calculate total sent
    const totalSent = allTransfers
      .filter(t => t.direction === 'outgoing')
      .reduce((sum, t) => sum + t.value, 0n)
    
    // Calculate total fees (only for outgoing transactions)
    const totalFees = allTransfers
      .filter(t => t.direction === 'outgoing' && t.fee)
      .reduce((sum, t) => sum + (t.fee || 0n), 0n)
    
    // Count confirmed vs unconfirmed transactions
    const confirmedTxs = allTransfers.filter(t => t.height > 0).length
    const unconfirmedTxs = allTransfers.filter(t => t.height === 0).length
    
    // Get recent activity (last 5 transactions)
    const recentActivity = allTransfers.slice(0, 5).map(t => ({
      txid: t.txid,
      direction: t.direction,
      value: t.value,
      valueBTC: Number(t.value) / 100000000,
      confirmed: t.height > 0,
      blockHeight: t.height
    }))
    
    return {
      totalReceived: Number(totalReceived) / 100000000, // BTC
      totalSent: Number(totalSent) / 100000000,         // BTC
      totalFees: Number(totalFees) / 100000000,         // BTC
      netBalance: Number(totalReceived - totalSent) / 100000000, // BTC
      transactionCount: allTransfers.length,
      confirmedTransactions: confirmedTxs,
      unconfirmedTransactions: unconfirmedTxs,
      recentActivity
    }
  } catch (error) {
    console.error('Failed to analyze transaction history:', error.message)
    return null
  }
}
```

### Fee Optimization and Transaction Sending

```javascript
async function sendWithOptimalFee(wallet, account, recipient, amount) {
  try {
    // Validate amount (must be above dust limit)
    const dustLimit = 294n // SegWit dust limit
    if (amount <= dustLimit) {
      throw new Error(`Amount must be above dust limit (${dustLimit} satoshis). Provided: ${amount}`)
    }
    
    // Get current fee rates from mempool.space
    const feeRates = await wallet.getFeeRates()
    console.log('Current network fee rates:')
    console.log(`- Normal (1 hour): ${feeRates.normal} sat/vB`)
    console.log(`- Fast (priority): ${feeRates.fast} sat/vB`)
    
    // Quote transaction to estimate fees
    const quote = await account.quoteSendTransaction({
      to: recipient,
      value: amount
    })
    
    console.log(`Estimated fee: ${quote.fee} satoshis`)
    
    // Check if we have sufficient balance
    const balance = await account.getBalance()
    const totalRequired = amount + quote.fee
    
    if (balance < totalRequired) {
      throw new Error(`Insufficient balance. Required: ${totalRequired}, Available: ${balance}`)
    }
    
    console.log(`Sending ${amount} satoshis with ${quote.fee} satoshis fee`)
    
    // Send transaction
    const result = await account.sendTransaction({
      to: recipient,
      value: amount
    })
    
    console.log('Transaction sent successfully:')
    console.log(`- Hash: ${result.hash}`)
    console.log(`- Fee paid: ${result.fee} satoshis`)
    console.log(`- Amount sent: ${amount} satoshis`)
    
    return {
      ...result,
      amountSent: amount,
      totalCost: amount + result.fee
    }
  } catch (error) {
    console.error('Transaction failed:', error.message)
    throw error
  }
}
```

### Comprehensive Error Handling

```javascript
import WalletManagerBtc, { ElectrumTcp } from '@tetherto/wdk-wallet-btc'

async function robustBitcoinOperations(wallet, account) {
  try {
    // Test balance retrieval
    const balance = await account.getBalance()
    console.log('Current balance:', balance, 'satoshis')
    
    // Test transaction with proper error handling
    const recipient = 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'
    const amount = 100000n // 0.001 BTC
    
    try {
      const result = await account.sendTransaction({
        to: recipient,
        value: amount
      })
      console.log('Transaction successful:', result.hash)
      return result
    } catch (txError) {
      // Handle specific transaction errors
      if (txError.message.includes('Insufficient balance')) {
        console.log('Error: Not enough funds in wallet')
        console.log(`Required: ${amount} satoshis, Available: ${balance} satoshis`)
      } else if (txError.message.includes('dust limit')) {
        console.log('Error: Amount is below minimum dust limit')
      } else if (txError.message.includes('Invalid address')) {
        console.log('Error: Recipient address is invalid')
      } else {
        console.log('Transaction error:', txError.message)
      }
      throw txError
    }
    
  } catch (error) {
    console.error('Bitcoin operation failed:', error.message)
    
    // Handle network/connection errors
    if (error.message.includes('ECONNREFUSED') || error.message.includes('timeout')) {
      console.log('Network error: Check Electrum server connection')
    } else if (error.message.includes('Invalid seed')) {
      console.log('Wallet error: Invalid seed phrase provided')
    }
    
    throw error
  } finally {
    // Always clean up resources
    console.log('Cleaning up wallet resources...')
    // Note: Don't dispose here if wallet is still needed
    // wallet.dispose()
  }
}

// Example usage with complete cleanup
async function completeWalletWorkflow() {
  let wallet = null
  let account = null
  
  try {
    // Setup
    const seedPhrase = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
    
    const client = new ElectrumTcp({
      host: 'fulcrum.frznode.com',
      port: 50001
    })
    
    wallet = new WalletManagerBtc(seedPhrase, {
      client,
      network: 'bitcoin'
    })
    
    account = await wallet.getAccount(0)
    
    // Operations
    await robustBitcoinOperations(wallet, account)
    
  } catch (error) {
    console.error('Workflow failed:', error.message)
  } finally {
    // Always dispose to clear private keys from memory
    if (account) {
      account.dispose()
      console.log('Account disposed')
    }
    if (wallet) {
      wallet.dispose()
      console.log('Wallet disposed')
    }
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
				<strong>WDK Bitcoin Wallet Configuration</strong>
			</td>
			<td>Get started with WDK's Bitcoin Wallet Configuration</td>
			<td>
				<a href="./configuration.md">WDK Bitcoin Wallet Configuration</a>
			</td>
		</tr>
        <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK Bitcoin Wallet API</strong>
			</td>
			<td>Get started with WDK's Bitcoin Wallet API</td>
			<td>
				<a href="./api-reference.md">WDK Bitcoin Wallet API</a>
			</td>
		</tr>
	</tbody>
</table>

***

### Need Help?

{% include "../../../.gitbook/includes/support-cards.md" %}