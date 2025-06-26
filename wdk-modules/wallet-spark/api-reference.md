---
title: Wallet Spark API Reference
description: Complete API documentation for @wdk/wallet-spark
author: Matteo Giardino
lastReviewed: 2025-06-26
---

# API Reference

## Table of Contents

| Class | Description | Methods |
|-------|-------------|---------|
| [WalletManagerSpark](#walletmanagerspark) | Main class for managing Spark wallets | [Constructor](#constructor), [Methods](#methods), [Properties](#properties) |
| [WalletAccountSpark](#walletaccountspark) | Individual Spark wallet account implementation | [Constructor](#constructor-1), [Methods](#methods), [Properties](#properties-1) |

## WalletManagerSpark

The main class for managing Spark wallets. Extends `AbstractWalletManager` from `@wdk/wallet`.

### Constructor

```javascript
new WalletManagerSpark(seed, config)
```

**Parameters:**
- `seed` (string | Uint8Array): [BIP-39](../../../resources/concepts.md#bip-39-mnemonic-seed-phrases) mnemonic seed phrase or seed bytes
- `config` (SparkWalletConfig, optional): Configuration object
  - `network` (string, optional): Network to use - "MAINNET", "TESTNET", or "REGTEST" (default: "MAINNET")

**Example:**
```javascript
const wallet = new WalletManagerSpark(seedPhrase, {
  network: 'MAINNET'
})
```

### Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `getAccount(index)` | Returns a wallet account at the specified index | `Promise<WalletAccountSpark>` |
| `getFeeRates()` | Returns current fee rates (always 0 for Spark) | `Promise<FeeRates>` |
| `dispose()` | Disposes all wallet accounts, clearing private keys from memory | `void` |

#### `getAccount(index)`
Returns a wallet account at the specified index.

**Parameters:**
- `index` (number, optional): The index of the account to get (default: 0)

**Returns:** `Promise<WalletAccountSpark>` - The wallet account

**Example:**
```javascript
const account = await wallet.getAccount(0)
```

#### `getFeeRates()`
Returns current fee rates (always 0 for Spark transactions).

**Returns:** `Promise<FeeRates>` - Object containing normal and fast fee rates (both 0)

**Example:**
```javascript
const feeRates = await wallet.getFeeRates()
console.log('Normal fee rate:', feeRates.normal) // Always 0
console.log('Fast fee rate:', feeRates.fast) // Always 0
```

#### `dispose()`
Disposes all wallet accounts, clearing private keys from memory.

**Example:**
```javascript
wallet.dispose()
```

### Properties

#### `seed`
The wallet's seed phrase.

**Type:** `string | Uint8Array`

**Example:**
```javascript
console.log('Seed phrase:', wallet.seed)
```

## WalletAccountSpark

Represents an individual Spark wallet account. Implements `IWalletAccount` from `@wdk/wallet`.

### Constructor

```javascript
new WalletAccountSpark(wallet)
```

**Parameters:**
- `wallet`: Internal Spark wallet instance (created by WalletManagerSpark)

**Note:** This constructor is typically not called directly. Use `WalletManagerSpark.getAccount()` instead.

### Methods

| Method | Description | Returns |
|--------|-------------|---------|
| [`getAddress()`](#getaddress-1) | Returns the account's Spark address | `Promise<string>` |
| [`sign(message)`](#signmessage) | Signs a message using the account's identity key | `Promise<string>` |
| [`verify(message, signature)`](#verifymessage-signature) | Verifies a message signature | `Promise<boolean>` |
| [`sendTransaction(tx)`](#sendtransactiontx) | Sends a Spark transaction | `Promise<TransactionResult>` |
| [`quoteSendTransaction(tx)`](#quotesendtransactiontx) | Estimates the fee for a transaction | `Promise<{fee: number}>` |
| [`getBalance()`](#getbalance-1) | Returns the Spark balance in satoshis | `Promise<number>` |
| [`getSingleUseDepositAddress()`](#getsingleusedepositaddress) | Generates a single-use deposit address | `Promise<string>` |
| [`claimDeposit(txId)`](#claimdeposittxid) | Claims a Bitcoin layer 1 deposit | `Promise<WalletLeaf[]>` |
| [`getLatestDepositTxId(address)`](#getlatestdeposittxidaddress) | Checks for confirmed deposits | `Promise<string>` |
| [`withdraw(options)`](#withdrawoptions) | Withdraws Bitcoin to layer 1 | `Promise<CoopExitRequest>` |
| [`createLightningInvoice(options)`](#createlightninginvoiceoptions) | Creates a [Lightning Network](../../../resources/concepts.md#lightning-network) invoice | `Promise<LightningReceiveRequest>` |
| [`payLightningInvoice(options)`](#paylightninginvoiceoptions) | Pays a [Lightning Network](../../../resources/concepts.md#lightning-network) invoice | `Promise<LightningSendRequest>` |
| [`getLightningSendFeeEstimate(options)`](#getlightningsendfeeestimateoptions) | Estimates [Lightning Network](../../../resources/concepts.md#lightning-network) payment fees | `Promise<number>` |
| [`getTransfers(options)`](#gettransfersoptions) | Returns transaction history | `Promise<SparkTransfer[]>` |
| [`dispose()`](#dispose-1) | Disposes the wallet account, clearing private keys from memory | `void` |

#### `getAddress()`
Returns the account's Spark address.

**Returns:** `Promise<string>` - The account's Spark address

**Example:**
```javascript
const address = await account.getAddress()
console.log('Spark address:', address)
```

#### `sign(message)`
Signs a message using the account's identity key.

**Parameters:**
- `message` (string): The message to sign

**Returns:** `Promise<string>` - The message signature

**Example:**
```javascript
const signature = await account.sign('Hello, Spark!')
console.log('Signature:', signature)
```

#### `verify(message, signature)`
Verifies a message signature.

**Parameters:**
- `message` (string): The original message
- `signature` (string): The signature to verify

**Returns:** `Promise<boolean>` - True if the signature is valid

**Example:**
```javascript
const isValid = await account.verify('Hello, Spark!', signature)
console.log('Signature valid:', isValid)
```

#### `sendTransaction(tx)`
Sends a Spark transaction (fee-free).

**Parameters:**
- `tx` (SparkTransaction): The transaction object
  - `to` (string): Recipient Spark address
  - `value` (number): Amount in satoshis

**Returns:** `Promise<TransactionResult>` - Object containing hash and fee (always 0)

**Example:**
```javascript
const result = await account.sendTransaction({
  to: 'sp1pgssxdn5c2vxkqhetf58ssdy6fxz9hpwqd36uccm772gvudvsmueuxtm2leurf',
  value: 100000 // 0.001 BTC
})
console.log('Transaction hash:', result.hash)
console.log('Transaction fee:', result.fee, 'satoshis') // Always 0
```

#### `quoteSendTransaction(tx)`
Estimates the fee for a Spark transaction (always 0).

**Parameters:**
- `tx` (SparkTransaction): The transaction object (same as sendTransaction)

**Returns:** `Promise<{fee: number}>` - Object containing fee estimate (always 0)

**Example:**
```javascript
const quote = await account.quoteSendTransaction({
  to: 'sp1pgssxdn5c2vxkqhetf58ssdy6fxz9hpwqd36uccm772gvudvsmueuxtm2leurf',
  value: 100000
})
console.log('Estimated fee:', quote.fee, 'satoshis') // Always 0
```

#### `getBalance()`
Returns the Spark balance in satoshis.

**Returns:** `Promise<number>` - Balance in satoshis

**Example:**
```javascript
const balance = await account.getBalance()
console.log('Balance:', balance, 'satoshis')
console.log('Balance:', balance / 100000000, 'BTC')
```

#### `getSingleUseDepositAddress()`
Generates a single-use deposit address for Bitcoin layer 1 deposits.

**Returns:** `Promise<string>` - A unique Bitcoin address for deposits

**Example:**
```javascript
const depositAddress = await account.getSingleUseDepositAddress()
console.log('Deposit address:', depositAddress)
```

#### `claimDeposit(txId)`
Claims a Bitcoin layer 1 deposit to the Spark wallet.

**Parameters:**
- `txId` (string): The transaction ID of the deposit

**Returns:** `Promise<WalletLeaf[]>` - The wallet leaves resulting from the deposit

**Example:**
```javascript
const walletLeaves = await account.claimDeposit('abc123...')
console.log('Deposit claimed:', walletLeaves)
```

#### `getLatestDepositTxId(address)`
Checks for a confirmed deposit to the specified deposit address.

**Parameters:**
- `address` (string): The deposit address to check

**Returns:** `Promise<string | null>` - The transaction ID if found, null otherwise

**Example:**
```javascript
const txId = await account.getLatestDepositTxId(depositAddress)
if (txId) {
  console.log('Deposit confirmed:', txId)
}
```

#### `withdraw(options)`
Initiates a withdrawal to move funds from Spark to an on-chain Bitcoin address.

**Parameters:**
- `options` (object): Withdrawal options
  - `to` (string): The Bitcoin address where funds should be sent
  - `value` (number): Amount in satoshis to withdraw

**Returns:** `Promise<CoopExitRequest>` - The withdrawal request details

**Example:**
```javascript
const withdrawal = await account.withdraw({
  to: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  value: 100000 // 0.001 BTC
})
console.log('Withdrawal request:', withdrawal)
```

#### `createLightningInvoice(options)`
Creates a Lightning invoice for receiving payments.

**Parameters:**
- `options` (object): Invoice options
  - `value` (number): Amount in satoshis
  - `memo` (string, optional): Optional description for the invoice

**Returns:** `Promise<LightningReceiveRequest>` - BOLT11 encoded invoice

**Example:**
```javascript
const invoice = await account.createLightningInvoice({
  value: 50000, // 0.0005 BTC
  memo: 'Payment for services'
})
console.log('Lightning invoice:', invoice.encodedInvoice)
```

#### `payLightningInvoice(options)`
Pays a Lightning invoice.

**Parameters:**
- `options` (object): Payment options
  - `invoice` (string): The BOLT11-encoded Lightning invoice to pay
  - `maxFeeSats` (number): Maximum fee in satoshis to pay

**Returns:** `Promise<LightningSendRequest>` - The Lightning payment request details

**Example:**
```javascript
const payment = await account.payLightningInvoice({
  invoice: 'lnbc500u1p...',
  maxFeeSats: 1000
})
console.log('Payment result:', payment)
```

#### `getLightningSendFeeEstimate(options)`
Gets fee estimate for sending Lightning payments.

**Parameters:**
- `options` (object): Fee estimation options
  - `invoice` (string): The BOLT11-encoded Lightning invoice to estimate fees for

**Returns:** `Promise<number>` - Fee estimate for sending Lightning payments

**Example:**
```javascript
const feeEstimate = await account.getLightningSendFeeEstimate({
  invoice: 'lnbc500u1p...'
})
console.log('Fee estimate:', feeEstimate, 'satoshis')
```

#### `getTransfers(options)`
Returns the transaction history for the account.

**Parameters:**
- `options` (object, optional): Query options
  - `direction` (string, optional): Filter by direction - "incoming", "outgoing", or "all" (default: "all")
  - `limit` (number, optional): Number of transfers to return (default: 10)
  - `skip` (number, optional): Number of transfers to skip (default: 0)

**Returns:** `Promise<SparkTransfer[]>` - Array of transfer objects

**Example:**
```javascript
// Get all transfers
const transfers = await account.getTransfers()

// Get only incoming transfers with limit
const incoming = await account.getTransfers({ 
  direction: 'incoming', 
  limit: 5 
})

// Get outgoing transfers with pagination
const outgoing = await account.getTransfers({ 
  direction: 'outgoing', 
  limit: 10, 
  skip: 20 
})
```

#### `dispose()`
Disposes the wallet account, clearing private keys from memory.

**Example:**
```javascript
account.dispose()
```

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `index` | `number` | The derivation path's index of this account |
| `path` | `string` | The full BIP-44 derivation path of this account |
| `keyPair` | `{publicKey: Buffer, privateKey: Buffer}` | The account's public and private key pair as buffers |

**Example:**
```javascript
const { publicKey, privateKey } = account.keyPair
console.log('Public key length:', publicKey.length)
console.log('Private key length:', privateKey.length)
```

## Types

## SparkTransaction

```typescript
interface SparkTransaction {
  to: string
  value: number
}
```

## TransactionResult

```typescript
interface TransactionResult {
  hash: string
  fee: number
}
```

## FeeRates

```typescript
interface FeeRates {
  normal: number
  fast: number
}
```

## SparkTransfer

```typescript
interface SparkTransfer {
  hash: string
  transferDirection: 'INCOMING' | 'OUTGOING'
  amountSats: number
  timestamp: number
  confirmations: number
}
```

## WalletLeaf

```typescript
interface WalletLeaf {
  // Spark-specific wallet leaf structure
}
```

## CoopExitRequest

```typescript
interface CoopExitRequest {
  // Cooperative exit request details
}
```

## LightningReceiveRequest

```typescript
interface LightningReceiveRequest {
  encodedInvoice: string
  // Other Lightning invoice properties
}
```

## LightningSendRequest

```typescript
interface LightningSendRequest {
  // Lightning payment request details
}
```

## KeyPair

```typescript
interface KeyPair {
  publicKey: Uint8Array
  privateKey: Uint8Array
}
```

## SparkWalletConfig

```typescript
interface SparkWalletConfig {
  network?: 'MAINNET' | 'TESTNET' | 'REGTEST'
}
``` 