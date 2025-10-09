---
title: Wallet Spark API Reference
description: Complete API documentation for @tetherto/wdk-wallet-spark
lastReviewed: 2025-06-26
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

# API Reference


### Table of Contents

| Class | Description | Methods |
|-------|-------------|---------|
| [WalletManagerSpark](#walletmanagerspark) | Main class for managing Spark wallets. Extends `WalletManager` from `@tetherto/wdk-wallet`. | [Constructor](#constructor), [Methods](#methods) |
| [WalletAccountSpark](#walletaccountspark) | Individual Spark wallet account implementation. Implements `IWalletAccount`. | [Constructor](#constructor-1), [Methods](#methods-1), [Properties](#properties) |

## WalletManagerSpark

The main class for managing Spark wallets.  
Extends `WalletManager` from `@tetherto/wdk-wallet`.

#### Constructor

```javascript
new WalletManagerSpark(seed, config)
```
**Parameters:**
- `seed` (string | Uint8Array): BIP-39 mnemonic seed phrase or seed bytes
- `config` (object, optional): Configuration object
  - `network` (string, optional): 'MAINNET', 'TESTNET', or 'REGTEST' (default: 'MAINNET')

### Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `getAccount(index)` | Returns a wallet account at the specified index | `Promise<WalletAccountSpark>` |
| `getFeeRates()` | Returns current fee rates for transactions (always zero for Spark) | `Promise<{normal: number, fast: number}>` |
| `dispose()` | Disposes all wallet accounts, clearing private keys from memory | `void` |

##### `getAccount(index)`
Returns a wallet account at the specified index using BIP-44 derivation path.

**Parameters:**
- `index` (number, optional): The index of the account to get (default: 0)

**Returns:** `Promise<WalletAccountSpark>` - The wallet account

**Example:**
```javascript
const account = await wallet.getAccount(0)
const account1 = await wallet.getAccount(1)
```

**Note:** Uses derivation path pattern `m/44'/998'/0'/0/{index}` where 998 is the coin type for Liquid Bitcoin.

##### `getFeeRates()`
Returns current fee rates for transactions. On Spark network, transactions have zero fees.

**Returns:** `Promise<{normal: number, fast: number}>` - Object containing fee rates (always `{normal: 0, fast: 0}`)

**Example:**
```javascript
const feeRates = await wallet.getFeeRates()
console.log('Normal fee rate:', feeRates.normal) // Always 0
console.log('Fast fee rate:', feeRates.fast)     // Always 0
```

##### `dispose()`
Disposes all wallet accounts and clears sensitive data from memory.

**Returns:** `void`

**Example:**
```javascript
wallet.dispose()
```

**Important Notes:**
- `getAccountByPath(path)` is not supported and will throw an error
- Custom derivation paths are not available - only indexed accounts
- All Spark transactions have zero fees
- Network configuration is limited to predefined values


## WalletAccountSpark

Represents an individual Spark wallet account. Implements `IWalletAccount` from `@tetherto/wdk-wallet`.

**Note**: WalletAccountSpark instances are created internally by `WalletManagerSpark.getAccount()` and are not intended to be constructed directly.

### Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `getAddress()` | Returns the account's Spark address | `Promise<string>` |
| `sign(message)` | Signs a message using the account's identity key | `Promise<string>` |
| `verify(message, signature)` | Verifies a message signature | `Promise<boolean>` |
| `sendTransaction(tx)` | Sends a Spark transaction | `Promise<{hash: string, fee: number}>` |
| `quoteSendTransaction(tx)` | Estimates transaction fee (always 0) | `Promise<{fee: number}>` |
| `getBalance()` | Returns the native token balance in satoshis | `Promise<number>` |
| `getTransfers(options?)` | Returns the account's transfer history | `Promise<Transfer[]>` |
| `getSingleUseDepositAddress()` | Generates a single-use Bitcoin deposit address | `Promise<string>` |
| `claimDeposit(txId)` | Claims a Bitcoin deposit to the wallet | `Promise<WalletLeaf[]>` |
| `withdraw({to, value})` | Withdraws funds to a Bitcoin address | `Promise<CoopExitRequest>` |
| `createLightningInvoice({value, memo?})` | Creates a Lightning invoice | `Promise<LightningReceiveRequest>` |
| `payLightningInvoice({invoice, maxFeeSats})` | Pays a Lightning invoice | `Promise<LightningSendRequest>` |
| `toReadOnlyAccount()` | Creates a read-only version of this account | `Promise<WalletAccountReadOnlySpark>` |
| `dispose()` | Disposes the wallet account, clearing private keys | `void` |


##### `getAddress()`
Returns the account's Spark network address.

**Returns:** `Promise<string>` - The Spark address

**Example:**
```javascript
const address = await account.getAddress()
console.log('Spark address:', address)
```
##### `sign(message)`
Signs a message using the account's identity key.

**Parameters:**
- `message` (string): The message to sign

**Returns:** `Promise<string>` - The message signature

**Example:**
```javascript
const signature = await account.sign('Hello, Spark!')
console.log('Signature:', signature)
```
##### `verify(message, signature)`
Verifies a message signature against the account's identity key.

**Parameters:**
- `message` (string): The original message
- `signature` (string): The signature to verify

**Returns:** `Promise<boolean>` - True if the signature is valid

**Example:**
```javascript
const isValid = await account.verify('Hello, Spark!', signature)
console.log('Signature valid:', isValid)
```

##### `sendTransaction({to, value})`
Sends a Spark transaction.

**Parameters:**
- `to` (string): Recipient's Spark address
- `value` (number): Amount in satoshis

**Returns:** `Promise<{hash: string, fee: number}>` (fee is always 0)

**Example:**
```javascript
const result = await account.sendTransaction({
  to: 'spark1...',
  value: 1000000
})
```

##### `quoteSendTransaction({to, value})`
Estimates the fee for a Spark transaction (always returns 0).

**Parameters:**
- `to` (string): Recipient's Spark address
- `value` (number): Amount in satoshis

**Returns:** `Promise<{fee: number}>` - Fee estimate (always 0)

**Example:**
```javascript
const quote = await account.quoteSendTransaction({
  to: 'spark1...',
  value: 1000000
})
console.log('Estimated fee:', quote.fee) // Always 0
```

##### `transfer(options)`
Transfers tokens to another address. Not supported on Spark blockchain.

**Parameters:**
- `options` (object): Transfer options

**Throws:** Error - "Not supported on Spark blockchain"

##### `quoteTransfer(options)`
Quotes the costs of a transfer operation. Not supported on Spark blockchain.

**Parameters:**
- `options` (object): Transfer options

**Throws:** Error - "Not supported on Spark blockchain"

##### `getBalance()`
Returns the account's native token balance in satoshis.

**Returns:** `Promise<number>` - Balance in satoshis

**Example:**
```javascript
const balance = await account.getBalance()
console.log('Balance:', balance, 'satoshis')
```

##### `getTokenBalance(tokenAddress)`
Returns the balance for a specific token. Not supported on Spark blockchain.

**Parameters:**
- `tokenAddress` (string): Token contract address

**Throws:** Error - "Not supported on Spark blockchain"

##### `getTransactionReceipt(hash)`
Gets the transaction receipt for a given transaction hash.

**Parameters:**
- `hash` (string): Transaction hash

**Returns:** `Promise<SparkTransactionReceipt>` - Transaction receipt details

**Example:**
```javascript
const receipt = await account.getTransactionReceipt('0x...')
console.log('Transaction receipt:', receipt)
```

##### `getTransfers(options?)`
Returns the account's transfer history with filtering options.

**Parameters:**
- `options` (object, optional): Filter options
  - `direction` (string): 'all', 'incoming', or 'outgoing' (default: 'all')
  - `limit` (number): Maximum transfers to return (default: 10)
  - `skip` (number): Number of transfers to skip (default: 0)

**Returns:** `Promise<Transfer[]>` - Array of transfer objects

**Example:**
```javascript
const transfers = await account.getTransfers({
  direction: 'incoming',
  limit: 5
})
console.log('Recent incoming transfers:', transfers)
```

##### `getSingleUseDepositAddress()`
Generates a single-use Bitcoin deposit address for funding the Spark wallet.

**Returns:** `Promise<string>` - Bitcoin deposit address

**Example:**
```javascript
const depositAddress = await account.getSingleUseDepositAddress()
console.log('Send Bitcoin to:', depositAddress)
```

##### `claimDeposit(txId)`
Claims a Bitcoin deposit to add funds to the Spark wallet.

**Parameters:**
- `txId` (string): Bitcoin transaction ID of the deposit

**Returns:** `Promise<WalletLeaf[] | undefined>` - Wallet leaves created from the deposit

**Example:**
```javascript
const leaves = await account.claimDeposit('bitcoin_tx_id...')
console.log('Claimed deposit:', leaves)
```

##### `getLatestDepositTxId(depositAddress)`
Checks for a confirmed Bitcoin deposit to the specified address.

**Parameters:**
- `depositAddress` (string): Bitcoin deposit address to check

**Returns:** `Promise<string | null>` - Transaction ID if found, null otherwise

**Example:**
```javascript
const txId = await account.getLatestDepositTxId(depositAddress)
if (txId) {
  console.log('Found deposit:', txId)
}
```

##### `withdraw({to, value})`
Withdraws funds from the Spark network to an on-chain Bitcoin address.

**Parameters:**
- `to` (string): Bitcoin address to withdraw to
- `value` (number): Amount in satoshis

**Returns:** `Promise<CoopExitRequest | null | undefined>` - Withdrawal request details

**Example:**
```javascript
const withdrawal = await account.withdraw({
  to: 'bc1q...',
  value: 1000000
})
console.log('Withdrawal request:', withdrawal)
```

##### `createLightningInvoice({value, memo?})`
Creates a Lightning invoice for receiving payments.

**Parameters:**
- `value` (number): Amount in satoshis
- `memo` (string, optional): Invoice description

**Returns:** `Promise<LightningReceiveRequest>` - Lightning invoice details

**Example:**
```javascript
const invoice = await account.createLightningInvoice({
  value: 100000,
  memo: 'Payment for services'
})
console.log('Invoice:', invoice.invoice)
```

##### `getLightningReceiveRequest(invoiceId)`
Gets details of a previously created Lightning receive request.

**Parameters:**
- `invoiceId` (string): Invoice ID

**Returns:** `Promise<LightningReceiveRequest>` - Invoice details

**Example:**
```javascript
const request = await account.getLightningReceiveRequest(invoiceId)
console.log('Invoice status:', request.status)
```

##### `payLightningInvoice({invoice, maxFeeSats})`
Pays a Lightning invoice.

**Parameters:**
- `invoice` (string): BOLT11 Lightning invoice
- `maxFeeSats` (number): Maximum fee willing to pay in satoshis

**Returns:** `Promise<LightningSendRequest>` - Payment details

**Example:**
```javascript
const payment = await account.payLightningInvoice({
  invoice: 'lnbc...',
  maxFeeSats: 1000
})
console.log('Payment result:', payment)
```

##### `getLightningSendFeeEstimate({invoice})`
Estimates the fee for paying a Lightning invoice.

**Parameters:**
- `invoice` (string): BOLT11 Lightning invoice

**Returns:** `Promise<number>` - Estimated fee in satoshis

**Example:**
```javascript
const feeEstimate = await account.getLightningSendFeeEstimate({
  invoice: 'lnbc...'
})
console.log('Estimated Lightning fee:', feeEstimate, 'satoshis')
```

##### `toReadOnlyAccount()`
Creates a read-only version of this account that can query data but not sign transactions.

**Returns:** `Promise<WalletAccountReadOnlySpark>` - Read-only account instance

**Example:**
```javascript
const readOnlyAccount = await account.toReadOnlyAccount()
const balance = await readOnlyAccount.getBalance()
```

##### `cleanupConnections()`
Cleans up network connections and resources.

**Returns:** `Promise<void>`

**Example:**
```javascript
await account.cleanupConnections()
```

##### `dispose()`
Disposes the wallet account, securely erasing private keys from memory.

**Returns:** `void`

**Example:**
```javascript
account.dispose()
// Private keys are now cleared from memory
```

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `index` | `number` | The derivation path index of this account |
| `path` | `string` | The full BIP-44 derivation path |
| `keyPair` | `KeyPair` | The account's public and private key pair |

## Types

### SparkWalletConfig

```typescript
interface SparkWalletConfig {
  network?: 'MAINNET' | 'TESTNET' | 'REGTEST'  // The network (default: "MAINNET")
}
```

### SparkTransaction

```typescript
interface SparkTransaction {
  to: string     // The transaction's recipient (Spark address)
  value: number  // The amount of bitcoins to send to the recipient (in satoshis)
}
```

### TransactionResult

```typescript
interface TransactionResult {
  hash: string  // Transaction hash/ID
  fee: number   // Transaction fee in satoshis (always 0 for Spark)
}
```

### KeyPair

```typescript
interface KeyPair {
  publicKey: Uint8Array   // Public key bytes
  privateKey: Uint8Array  // Private key bytes
}
```

### LightningReceiveRequest

```typescript
interface LightningReceiveRequest {
  invoice: string    // BOLT11 encoded Lightning invoice
  id: string        // Invoice ID for tracking
  amountSats: number // Amount in satoshis
  memo?: string     // Optional description
}
```

### LightningSendRequest

```typescript
interface LightningSendRequest {
  id: string           // Payment request ID
  invoice: string      // BOLT11 encoded invoice that was paid
  maxFeeSats: number   // Maximum fee that was allowed
  status: string       // Payment status
}
```

### WalletLeaf

```typescript
interface WalletLeaf {
  // Spark SDK internal structure for wallet state
  // Exact properties depend on Spark SDK implementation
}
```

### CoopExitRequest

```typescript
interface CoopExitRequest {
  id: string              // Withdrawal request ID
  onchainAddress: string  // Bitcoin address for withdrawal
  amountSats: number      // Amount in satoshis
  exitSpeed: string       // Withdrawal speed ('FAST', 'MEDIUM', 'SLOW')
  status: string          // Withdrawal status
}
```

### SparkTransactionReceipt

```typescript
interface SparkTransactionReceipt {
  transferDirection: string  // 'INCOMING' or 'OUTGOING'
  amountSats: number        // Transfer amount in satoshis
  txId: string             // Transaction ID
  timestamp: number        // Transaction timestamp
  // Additional properties depend on Spark SDK implementation
}
```

### TransferOptions

```typescript
interface TransferOptions {
  direction?: 'incoming' | 'outgoing' | 'all'  // Filter by direction (default: 'all')
  limit?: number                               // Number of transfers to return (default: 10)
  skip?: number                                // Number of transfers to skip (default: 0)
}
```

### Lightning Invoice Options

```typescript
interface LightningInvoiceOptions {
  value: number     // Amount in satoshis
  memo?: string     // Optional description for the invoice
}
```

### Lightning Payment Options

```typescript
interface LightningPaymentOptions {
  invoice: string      // BOLT11-encoded Lightning invoice to pay
  maxFeeSats: number   // Maximum fee in satoshis to pay
}
```

### Lightning Fee Estimate Options

```typescript
interface LightningFeeEstimateOptions {
  invoice: string  // BOLT11-encoded Lightning invoice to estimate fees for
}
```

### Withdrawal Options

```typescript
interface WithdrawalOptions {
  to: string      // Bitcoin address where the funds should be sent
  value: number   // Amount in satoshis to withdraw
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
				<strong>WDK Spark Wallet Usage</strong>
			</td>
			<td>Get started with WDK's Spark Wallet Usage</td>
			<td>
				<a href="./configuration.md">WDK Spark Wallet Usage</a>
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
	</tbody>
</table>

***

### Need Help?

{% include "../../../.gitbook/includes/support-cards.md" %}

