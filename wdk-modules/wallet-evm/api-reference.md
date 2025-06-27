---
title: Wallet EVM API Reference
description: Complete API documentation for @wdk/wallet-evm
author: Matteo Giardino
lastReviewed: 2025-06-26
icon: code
---

# API Reference

## Table of Contents

| Class | Description | Methods |
|-------|-------------|---------|
| [WalletManagerEvm](#walletmanagerevm) | Main class for managing EVM wallets | [Constructor](#constructor), [Methods](#methods), [Properties](#properties) |
| [WalletAccountEvm](#walletaccountevm) | Individual wallet account implementation | [Constructor](#constructor-1), [Methods](#methods), [Properties](#properties-1) |

## WalletManagerEvm

The main class for managing EVM wallets. Extends `AbstractWalletManager` from `@wdk/wallet`.

### Constructor

```javascript
new WalletManagerEvm(seed, config)
```

**Parameters:**
- `seed` (string | Uint8Array): BIP-39 mnemonic seed phrase or seed bytes
- `config` (object, optional): Configuration object
  - `provider` (string | Eip1193Provider, optional): RPC endpoint URL or EIP-1193 provider instance
  - `transferMaxFee` (number, optional): Maximum fee amount for transfer operations

**Example:**
```javascript
const wallet = new WalletManagerEvm(seedPhrase, {
  provider: 'https://rpc.mevblocker.io/fast',
  transferMaxFee: 5000000
})
```

### Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `getAccount(index)` | Returns a wallet account at the specified index | `Promise<WalletAccountEvm>` |
| `getAccountByPath(path)` | Returns a wallet account at the specified BIP-44 derivation path | `Promise<WalletAccountEvm>` |
| `getFeeRates()` | Returns current fee rates for normal and fast transactions | `Promise<{normal: number, fast: number}>` |
| `dispose()` | Disposes all wallet accounts, clearing private keys from memory | `void` |

#### `getAccount(index)`
Returns a wallet account at the specified index.

**Parameters:**
- `index` (number, optional): The index of the account to get (default: 0)

**Returns:** `Promise<WalletAccountEvm>` - The wallet account

**Example:**
```javascript
const account = await wallet.getAccount(0)
```

#### `getAccountByPath(path)`
Returns a wallet account at the specified BIP-44 derivation path.

**Parameters:**
- `path` (string): The derivation path (e.g., "0'/0/0")

**Returns:** `Promise<WalletAccountEvm>` - The wallet account

**Example:**
```javascript
const account = await wallet.getAccountByPath("0'/0/1")
```

#### `getFeeRates()`
Returns current fee rates for normal and fast transactions.

**Returns:** `Promise<FeeRates>` - Object containing normal and fast fee rates

**Example:**
```javascript
const feeRates = await wallet.getFeeRates()
console.log('Normal fee rate:', feeRates.normal, 'wei')
console.log('Fast fee rate:', feeRates.fast, 'wei')
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

## WalletAccountEvm

Represents an individual wallet account. Implements `IWalletAccount` from `@wdk/wallet`.

### Constructor

```javascript
new WalletAccountEvm(seed, path, config)
```

**Parameters:**
- `seed` (string | Uint8Array): BIP-39 mnemonic seed phrase or seed bytes
- `path` (string): BIP-44 derivation path
- `config` (object, optional): Configuration object
  - `provider` (string | Eip1193Provider, optional): RPC endpoint URL or EIP-1193 provider instance
  - `transferMaxFee` (number, optional): Maximum fee amount for transfer operations

**Example:**
```javascript
const account = new WalletAccountEvm(seedPhrase, "0'/0/0", {
  provider: 'https://rpc.mevblocker.io/fast',
  transferMaxFee: 5000000
})
```

### Methods

| Method | Description | Returns |
|--------|-------------|---------|
| [`getAddress()`](#getaddress) | Returns the account's address | `Promise<string>` |
| [`sign(message)`](#signmessage) | Signs a message using the account's private key | `Promise<string>` |
| [`verify(message, signature)`](#verifymessage-signature) | Verifies a message signature | `Promise<boolean>` |
| [`sendTransaction(tx)`](#sendtransactiontx) | Sends a transaction and returns the result with hash and fee | `Promise<{hash: string, fee: number}>` |
| [`quoteSendTransaction(tx)`](#quotesendtransactiontx) | Estimates the fee for a transaction | `Promise<{fee: number}>` |
| [`transfer(options)`](#transferoptions) | Transfers ERC-20 tokens to another address | `Promise<{hash: string, fee: number}>` |
| [`quoteTransfer(options)`](#quotetransferoptions) | Estimates the fee for a token transfer | `Promise<{fee: number}>` |
| [`getBalance()`](#getbalance) | Returns the native token balance | `Promise<bigint>` |
| [`getTokenBalance(tokenAddress)`](#gettokenbalancetokenaddress) | Returns the balance of a specific ERC-20 token | `Promise<bigint>` |
| [`dispose()`](#dispose-1) | Disposes the wallet account, clearing private keys from memory | `void` |

#### `getAddress()`
Returns the account's address.

**Returns:** `Promise<string>` - The account's Ethereum address

**Example:**
```javascript
const address = await account.getAddress()
console.log('Account address:', address)
```

#### `sign(message)`
Signs a message using the account's private key.

**Parameters:**
- `message` (string): The message to sign

**Returns:** `Promise<string>` - The message signature

**Example:**
```javascript
const signature = await account.sign('Hello, World!')
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
const isValid = await account.verify('Hello, World!', signature)
console.log('Signature valid:', isValid)
```

#### `sendTransaction(tx)`
Sends a transaction and returns the result with hash and fee.

**Parameters:**
- `tx` (EvmTransaction): The transaction object
  - `to` (string): Recipient address
  - `value` (number | bigint): Amount in wei
  - `data` (string, optional): Transaction data
  - `gasLimit` (number, optional): Gas limit
  - `gasPrice` (number, optional): Gas price (legacy)
  - `maxFeePerGas` (number, optional): Max fee per gas (EIP-1559)
  - `maxPriorityFeePerGas` (number, optional): Max priority fee per gas (EIP-1559)

**Returns:** `Promise<TransactionResult>` - Object containing hash and fee

**Example:**
```javascript
const result = await account.sendTransaction({
  to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  value: 1000000000000000000n, // 1 ETH
  gasLimit: 21000
})
console.log('Transaction hash:', result.hash)
console.log('Transaction fee:', result.fee, 'wei')
```

#### `quoteSendTransaction(tx)`
Estimates the fee for a transaction.

**Parameters:**
- `tx` (EvmTransaction): The transaction object (same as sendTransaction)

**Returns:** `Promise<Omit<TransactionResult, "hash">>` - Object containing fee estimate

**Example:**
```javascript
const quote = await account.quoteSendTransaction({
  to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  value: 1000000000000000000n
})
console.log('Estimated fee:', quote.fee, 'wei')
```

#### `transfer(options)`
Transfers ERC-20 tokens to another address.

**Parameters:**
- `options` (TransferOptions): Transfer options
  - `token` (string): Token contract address
  - `recipient` (string): Recipient address
  - `amount` (number | bigint): Amount in base units

**Returns:** `Promise<TransferResult>` - Object containing hash and fee

**Example:**
```javascript
const result = await account.transfer({
  token: '0x...',
  recipient: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  amount: 1000000000000000000n // 1 token
})
console.log('Transfer hash:', result.hash)
console.log('Transfer fee:', result.fee, 'wei')
```

#### `quoteTransfer(options)`
Estimates the fee for a token transfer.

**Parameters:**
- `options` (TransferOptions): Transfer options (same as transfer)

**Returns:** `Promise<Omit<TransferResult, "hash">>` - Object containing fee estimate

**Example:**
```javascript
const quote = await account.quoteTransfer({
  token: '0x...',
  recipient: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  amount: 1000000000000000000n
})
console.log('Transfer fee estimate:', quote.fee, 'wei')
```

#### `getBalance()`
Returns the native token balance.

**Returns:** `Promise<bigint>` - Balance in wei

**Example:**
```javascript
const balance = await account.getBalance()
console.log('Balance:', balance, 'wei')
```

#### `getTokenBalance(tokenAddress)`
Returns the balance of a specific ERC-20 token.

**Parameters:**
- `tokenAddress` (string): The token contract address

**Returns:** `Promise<bigint>` - Token balance in base units

**Example:**
```javascript
const tokenBalance = await account.getTokenBalance('0x...')
console.log('Token balance:', tokenBalance)
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
| `path` | `string` | The full derivation path of this account |
| `keyPair` | `{publicKey: Buffer, privateKey: Buffer}` | The account's public and private key pair as buffers |

**Example:**
```javascript
const { publicKey, privateKey } = account.keyPair
console.log('Public key length:', publicKey.length)
console.log('Private key length:', privateKey.length)
```


## Types

## EvmTransaction

```typescript
interface EvmTransaction {
  to: string
  value: number | bigint
  data?: string
  gasLimit?: number
  gasPrice?: number
  maxFeePerGas?: number
  maxPriorityFeePerGas?: number
}
```

## TransferOptions

```typescript
interface TransferOptions {
  token: string
  recipient: string
  amount: number | bigint
}
```

## TransactionResult

```typescript
interface TransactionResult {
  hash: string
  fee: number
}
```

## TransferResult

```typescript
interface TransferResult {
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

## KeyPair

```typescript
interface KeyPair {
  publicKey: Uint8Array
  privateKey: Uint8Array
}
```

## EvmWalletConfig

```typescript
interface EvmWalletConfig {
  provider?: string | Eip1193Provider
  transferMaxFee?: number
}
``` 