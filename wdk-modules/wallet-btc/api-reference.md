---
title: Wallet BTC API Reference
description: Complete API documentation for @wdk/wallet-btc
author: Matteo Giardino
lastReviewed: 2025-06-26
---

# API Reference

## Table of Contents

| Class | Description | Methods |
|-------|-------------|---------|
| [WalletManagerBtc](#walletmanagerbtc) | Main class for managing Bitcoin wallets | [Constructor](#constructor), [Methods](#methods), [Properties](#properties) |
| [WalletAccountBtc](#walletaccountbtc) | Individual Bitcoin wallet account implementation | [Constructor](#constructor-1), [Methods](#methods), [Properties](#properties-1) |

## WalletManagerBtc

The main class for managing Bitcoin wallets. Extends `AbstractWalletManager` from `@wdk/wallet`.

### Constructor

```javascript
new WalletManagerBtc(seed, config)
```

**Parameters:**
- `seed` (string | Uint8Array): [BIP-39](../../../resources/concepts.md#bip-39-mnemonic-seed-phrases) mnemonic seed phrase or seed bytes
- `config` (BtcWalletConfig, optional): Configuration object
  - `host` (string, optional): Electrum server hostname (default: "electrum.blockstream.info")
  - `port` (number, optional): Electrum server port (default: 50001)
  - `network` (string, optional): Network to use - "bitcoin", "testnet", or "regtest" (default: "bitcoin")

**Example:**
```javascript
const wallet = new WalletManagerBtc(seedPhrase, {
  host: 'electrum.blockstream.info',
  port: 50001,
  network: 'bitcoin'
})
```

### Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `getAccount(index)` | Returns a wallet account at the specified index | `Promise<WalletAccountBtc>` |
| `getAccountByPath(path)` | Returns a wallet account at the specified [BIP-84](../../../resources/concepts.md#bip-84-native-segwit) derivation path | `Promise<WalletAccountBtc>` |
| `getFeeRates()` | Returns current fee rates from mempool.space | `Promise<FeeRates>` |
| `dispose()` | Disposes all wallet accounts, clearing private keys from memory | `void` |

#### `getAccount(index)`
Returns a wallet account at the specified index.

**Parameters:**
- `index` (number, optional): The index of the account to get (default: 0)

**Returns:** `Promise<WalletAccountBtc>` - The wallet account

**Example:**
```javascript
const account = await wallet.getAccount(0)
```

#### `getAccountByPath(path)`
Returns a wallet account at the specified [BIP-84](../../../resources/concepts.md#bip-84-native-segwit) derivation path.

**Parameters:**
- `path` (string): The derivation path (e.g., "0'/0/0")

**Returns:** `Promise<WalletAccountBtc>` - The wallet account

**Example:**
```javascript
const account = await wallet.getAccountByPath("0'/0/1")
```

#### `getFeeRates()`
Returns current fee rates from mempool.space API.

**Returns:** `Promise<FeeRates>` - Object containing normal and fast fee rates

**Example:**
```javascript
const feeRates = await wallet.getFeeRates()
console.log('Normal fee rate:', feeRates.normal, 'sat/vB')
console.log('Fast fee rate:', feeRates.fast, 'sat/vB')
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

## WalletAccountBtc

Represents an individual Bitcoin wallet account. Implements `IWalletAccount` from `@wdk/wallet`.

### Constructor

```javascript
new WalletAccountBtc(seed, path, config)
```

**Parameters:**
- `seed` (string | Uint8Array): [BIP-39](../../../resources/concepts.md#bip-39-mnemonic-seed-phrases) mnemonic seed phrase or seed bytes
- `path` (string): [BIP-84](../../../resources/concepts.md#bip-84-native-segwit) derivation path
- `config` (BtcWalletConfig, optional): Configuration object (same as WalletManagerBtc)

**Example:**
```javascript
const account = new WalletAccountBtc(seedPhrase, "0'/0/0", {
  host: 'electrum.blockstream.info',
  port: 50001,
  network: 'bitcoin'
})
```

### Methods

| Method | Description | Returns |
|--------|-------------|---------|
| [`getAddress()`](#getaddress-1) | Returns the account's native SegWit address | `Promise<string>` |
| [`sign(message)`](#signmessage) | Signs a message using the account's private key | `Promise<string>` |
| [`verify(message, signature)`](#verifymessage-signature) | Verifies a message signature | `Promise<boolean>` |
| [`sendTransaction(tx)`](#sendtransactiontx) | Sends a Bitcoin transaction | `Promise<TransactionResult>` |
| [`quoteSendTransaction(tx)`](#quotesendtransactiontx) | Estimates the fee for a transaction | `Promise<{fee: number}>` |
| [`getBalance()`](#getbalance-1) | Returns the Bitcoin balance in satoshis | `Promise<number>` |
| [`getTransfers(options)`](#gettransfersoptions) | Returns transaction history | `Promise<BtcTransfer[]>` |
| [`dispose()`](#dispose-1) | Disposes the wallet account, clearing private keys from memory | `void` |

#### `getAddress()`
Returns the account's native SegWit address.

**Returns:** `Promise<string>` - The account's Bitcoin address

**Example:**
```javascript
const address = await account.getAddress()
console.log('Bitcoin address:', address)
```

#### `sign(message)`
Signs a message using the account's private key.

**Parameters:**
- `message` (string): The message to sign

**Returns:** `Promise<string>` - The message signature

**Example:**
```javascript
const signature = await account.sign('Hello, Bitcoin!')
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
const isValid = await account.verify('Hello, Bitcoin!', signature)
console.log('Signature valid:', isValid)
```

#### `sendTransaction(tx)`
Sends a Bitcoin transaction.

**Parameters:**
- `tx` (BtcTransaction): The transaction object
  - `to` (string): Recipient Bitcoin address
  - `value` (number): Amount in satoshis

**Returns:** `Promise<TransactionResult>` - Object containing hash and fee

**Example:**
```javascript
const result = await account.sendTransaction({
  to: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  value: 100000 // 0.001 BTC
})
console.log('Transaction hash:', result.hash)
console.log('Transaction fee:', result.fee, 'satoshis')
```

#### `quoteSendTransaction(tx)`
Estimates the fee for a Bitcoin transaction.

**Parameters:**
- `tx` (BtcTransaction): The transaction object (same as sendTransaction)

**Returns:** `Promise<{fee: number}>` - Object containing fee estimate

**Example:**
```javascript
const quote = await account.quoteSendTransaction({
  to: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  value: 100000
})
console.log('Estimated fee:', quote.fee, 'satoshis')
```

#### `getBalance()`
Returns the Bitcoin balance in satoshis.

**Returns:** `Promise<number>` - The account balance in satoshis

**Example:**
```javascript
const balance = await account.getBalance()
console.log('Balance:', balance, 'satoshis')
console.log('Balance:', balance / 100000000, 'BTC')
```

#### `getTransfers(options)`
Returns the transaction history for the account.

**Parameters:**
- `options` (object, optional): Query options
  - `direction` (string, optional): Filter by direction - "incoming", "outgoing", or "all" (default: "all")
  - `limit` (number, optional): Number of transfers to return (default: 10)
  - `skip` (number, optional): Number of transfers to skip (default: 0)

**Returns:** `Promise<BtcTransfer[]>` - Array of transfer objects

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
| `path` | `string` | The full BIP-84 derivation path of this account |
| `keyPair` | `{publicKey: Buffer, privateKey: Buffer}` | The account's public and private key pair as buffers |

**Example:**
```javascript
const { publicKey, privateKey } = account.keyPair
console.log('Public key length:', publicKey.length)
console.log('Private key length:', privateKey.length)
```

## Types

## BtcTransaction

```typescript
interface BtcTransaction {
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

## BtcTransfer

```typescript
interface BtcTransfer {
  hash: string
  direction: 'incoming' | 'outgoing'
  value: number
  fee?: number
  timestamp: number
  confirmations: number
}
```

## KeyPair

```typescript
interface KeyPair {
  publicKey: Uint8Array
  privateKey: Uint8Array
}
```

## BtcWalletConfig

```typescript
interface BtcWalletConfig {
  host?: string
  port?: number
  network?: 'bitcoin' | 'testnet' | 'regtest'
}
``` 