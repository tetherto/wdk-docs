---
title: Wallet Tron API Reference
description: Complete API documentation for @wdk/wallet-tron
author: Raquel Carrasco Gonzalez
lastReviewed: 2025-06-26
icon: code
---

# API Reference

### Table of Contents

| Class | Description | Methods |
|-------|-------------|---------|
| [WalletManagerTron](#walletmanagertron) | Main class for managing Tron wallets | [Constructor](#constructor), [Methods](#methods), [Properties](#properties) |
| [WalletAccountTron](#walletaccounttron) | Individual Tron wallet account implementation | [Constructor](#constructor-1), [Methods](#methods), [Properties](#properties-1) |


### WalletManagerTron

The main class for managing Tron wallets. Extends `AbstractWalletManager` from `@wdk/wallet`.

#### Constructor

```javascript
new WalletManagerTron(seed, config)
```

**Parameters:**
- `seed` (string | Uint8Array): BIP-39 mnemonic seed phrase or seed bytes
- `config` (object, optional): Configuration object
  - `provider` (string, optional): Tron RPC endpoint URL (e.g., 'https://api.trongrid.io')
  - `transferMaxFee` (number, optional): Maximum fee for transfer operations (in sun)

**Example:**
```javascript
const wallet = new WalletManagerTron(seedPhrase, {
  provider: 'https://api.trongrid.io',
  transferMaxFee: 10000000 // Maximum fee in sun (e.g., 10 TRX)
})
```

#### Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `getAccount(index)` | Returns a wallet account at the specified index | `Promise<WalletAccountTron>` |
| `getAccountByPath(path)` | Returns a wallet account at the specified BIP-44 derivation path | `Promise<WalletAccountTron>` |
| `getFeeRates()` | Returns current fee rates for normal and fast transactions | `Promise<{normal: number, fast: number}>` |
| `dispose()` | Disposes all wallet accounts, clearing private keys from memory | `void` |

##### `getAccount(index)`
Returns a wallet account at the specified index.

**Parameters:**
- `index` (number, optional): The index of the account to get (default: 0)

**Returns:** `Promise<WalletAccountTron>` - The wallet account

**Example:**
```javascript
const account = await wallet.getAccount(0)
```

##### `getAccountByPath(path)`
Returns a wallet account at the specified BIP-44 derivation path.

**Parameters:**
- `path` (string): The derivation path (e.g., "0'/0/0")

**Returns:** `Promise<WalletAccountTron>` - The wallet account

**Example:**
```javascript
const account = await wallet.getAccountByPath("0'/0/1")
```

##### `getFeeRates()`
Returns current fee rates for normal and fast transactions.

**Returns:** `Promise<{normal: number, fast: number}>` - Object containing normal and fast fee rates

**Example:**
```javascript
const feeRates = await wallet.getFeeRates()
console.log('Normal fee rate:', feeRates.normal, 'sun')
console.log('Fast fee rate:', feeRates.fast, 'sun')
```

##### `dispose()`
Disposes all wallet accounts, clearing private keys from memory.

**Example:**
```javascript
wallet.dispose()
```

#### Properties

##### `seed`
The wallet's seed phrase.

**Type:** `string | Uint8Array`

**Example:**
```javascript
console.log('Seed phrase:', wallet.seed)
```

### WalletAccountTron

Represents an individual wallet account. Implements `IWalletAccount` from `@wdk/wallet`.

#### Constructor

```javascript
new WalletAccountTron(seed, path, config)
```

**Parameters:**
- `seed` (string | Uint8Array): BIP-39 mnemonic seed phrase or seed bytes
- `path` (string): BIP-44 derivation path (e.g., "0'/0/0")
- `config` (object, optional): Configuration object
  - `provider` (string, optional): Tron RPC endpoint URL (e.g., 'https://api.trongrid.io')
  - `transferMaxFee` (number, optional): Maximum fee for transfer operations (in sun)

**Example:**
```javascript
const account = new WalletAccountTron(seedPhrase, "0'/0/0", {
  provider: 'https://api.trongrid.io',
  transferMaxFee: 10000000 // Maximum fee in sun (e.g., 10 TRX)
})
```

#### Methods

| Method | Description | Returns |
|--------|-------------|---------|
| [`getAddress()`](#getaddress) | Returns the account's Tron address | `Promise<string>` |
| [`sign(message)`](#signmessage) | Signs a message using the account's private key | `Promise<string>` |
| [`verify(message, signature)`](#verifymessage-signature) | Verifies a message signature | `Promise<boolean>` |
| [`sendTransaction(tx)`](#sendtransactiontx) | Sends a Tron transaction and returns the result with hash and fee | `Promise<{hash: string, fee: number}>` |
| [`quoteSendTransaction(tx)`](#quotesendtransactiontx) | Estimates the fee for a Tron transaction | `Promise<{fee: number}>` |
| [`transfer(options)`](#transferoptions) | Transfers TRC20 tokens to another address | `Promise<{hash: string, fee: number}>` |
| [`quoteTransfer(options)`](#quotetransferoptions) | Estimates the fee for a TRC20 transfer | `Promise<{fee: number}>` |
| [`getBalance()`](#getbalance) | Returns the native TRX balance (in sun) | `Promise<number>` |
| [`getTokenBalance(tokenAddress)`](#gettokenbalancetokenaddress) | Returns the balance of a specific TRC20 token | `Promise<number>` |
| [`dispose()`](#dispose-1) | Disposes the wallet account, clearing private keys from memory | `void` |

##### `getAddress()`
Returns the account's address.

**Returns:** `Promise<string>` - The account's Tron address

**Example:**
```javascript
const address = await account.getAddress()
console.log('Account address:', address)
```

##### `sign(message)`
Signs a message using the account's private key.

**Parameters:**
- `message` (string): The message to sign

**Returns:** `Promise<string>` - The message signature

**Example:**
```javascript
const signature = await account.sign('Hello, World!')
console.log('Signature:', signature)
```

##### `verify(message, signature)`
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

##### `sendTransaction(tx)`
Sends a Tron transaction and returns the result with hash and fee.

**Parameters:**
- `tx` (object): The transaction object
  - `to` (string): Recipient Tron address (e.g., 'T...')
  - `value` (number): Amount in sun (1 TRX = 1,000,000 sun)

**Returns:** `Promise<{hash: string, fee: number}>` - Object containing hash and fee (in sun)

**Example:**
```javascript
const result = await account.sendTransaction({
  to: 'T...', // Tron address
  value: 1000000 // 1 TRX in sun
});
console.log('Transaction hash:', result.hash);
console.log('Transaction fee:', result.fee, 'sun');
```

##### `quoteSendTransaction(tx)`
Estimates the fee for a transaction.

**Parameters:**
- `tx` (object): The transaction object (same as sendTransaction)
  - `to` (string): Recipient Tron address (e.g., 'T...')
  - `value` (number): Amount in sun (1 TRX = 1,000,000 sun)

**Returns:** `Promise<{fee: number}>` - Object containing fee estimate (in sun)

**Example:**
```javascript
const quote = await account.quoteSendTransaction({
  to: 'T...', // Tron address
  value: 1000000 // 1 TRX in sun
});
console.log('Estimated fee:', quote.fee, 'sun');
```

##### `transfer(options)`
Transfers TRC20 tokens to another address.

**Parameters:**
- `options` (object): Transfer options
  - `token` (string): TRC20 contract address (e.g., 'T...')
  - `recipient` (string): Recipient Tron address (e.g., 'T...')
  - `amount` (number): Amount in TRC20's base units

**Returns:** `Promise<{hash: string, fee: number}>` - Object containing hash and fee (in sun)

**Example:**
```javascript
const result = await account.transfer({
  token: 'T...',      // TRC20 contract address
  recipient: 'T...',  // Recipient's Tron address
  amount: 1000000     // Amount in TRC20's base units
});
console.log('Transfer hash:', result.hash);
console.log('Transfer fee:', result.fee, 'sun');
```

##### `quoteTransfer(options)`
Estimates the fee for a TRC20 token transfer.

**Parameters:**
- `options` (object): Transfer options (same as transfer)
  - `token` (string): TRC20 contract address (e.g., 'T...')
  - `recipient` (string): Recipient Tron address (e.g., 'T...')
  - `amount` (number): Amount in TRC20's base units

**Returns:** `Promise<{fee: number}>` - Object containing fee estimate (in sun)

**Example:**
```javascript
const quote = await account.quoteTransfer({
  token: 'T...',      // TRC20 contract address
  recipient: 'T...',  // Recipient's Tron address
  amount: 1000000     // Amount in TRC20's base units
});
console.log('Transfer fee estimate:', quote.fee, 'sun');
```

##### `getBalance()`
Returns the native TRX balance (in sun).

**Returns:** `Promise<number>` - Balance in sun

**Example:**
```javascript
const balance = await account.getBalance();
console.log('Balance:', balance, 'sun');
```

##### `getTokenBalance(tokenAddress)`
Returns the balance of a specific TRC20 token.

**Parameters:**
- `tokenAddress` (string): The TRC20 contract address (e.g., 'T...')

**Returns:** `Promise<number>` - Token balance in base units 

**Example:**
```javascript
const tokenBalance = await account.getTokenBalance('T...');
console.log('Token balance:', tokenBalance);
```

##### `dispose()`
Disposes the wallet account, clearing private keys from memory.

**Example:**
```javascript
account.dispose()
```

#### Properties

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

## TransferOptions

```typescript
interface TransferOptions {
  token: string;           
  recipient: string;        
  amount: number;            
}
```

## TransferResult

```typescript
interface TransferResult {
  hash: string
  fee: number
}
```

## KeyPair

```typescript
interface KeyPair {
  publicKey: Uint8Array
  privateKey: Uint8Array
}
```