---
title: Wallet TON API Reference
description: Complete API documentation for @wdk/wallet-ton
author: Raquel Carrasco Gonzalez
lastReviewed: 2025-06-26
---

## API Reference

### Table of Contents

| Class | Description | Methods |
|-------|-------------|---------|
| [WalletManagerTon](#walletmanagerton) | Main class for managing TON wallets | [Constructor](#constructor), [Methods](#methods), [Properties](#properties) |
| [WalletAccountTon](#walletaccountton) | Individual TON wallet account implementation | [Constructor](#constructor-1), [Methods](#methods), [Properties](#properties-1) |


### WalletManagerTon

The main class for managing TON wallets. Extends `AbstractWalletManager` from `@wdk/wallet`.

#### Constructor

```javascript
new WalletManagerTon(seed, config)
```

**Parameters:**
- `seed` (string | Uint8Array): BIP-39 mnemonic seed phrase or seed bytes
- `config` (object, optional): Configuration object
  - `tonClient` (object, optional): TON client configuration
    - `url` (string): TON RPC endpoint URL (e.g., 'https://toncenter.com/api/v2/jsonRPC')
    - `secretKey` (string, optional): API key for the TON RPC endpoint, if required
  - `transferMaxFee` (number, optional): Maximum fee amount for transfer operations (in nanotons)

**Example:**
```javascript
const wallet = new WalletManagerTon(seedPhrase, {
  tonClient: { url: 'https://toncenter.com/api/v2/jsonRPC' },
  transferMaxFee: 10000000 // Maximum fee in nanotons (e.g., 0.01 TON)
})
```

#### Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `getAccount(index)` | Returns a wallet account at the specified index | `Promise<WalletAccountTon>` |
| `getAccountByPath(path)` | Returns a wallet account at the specified BIP-44 derivation path | `Promise<WalletAccountTon>` |
| `getFeeRates()` | Returns current fee rates for normal and fast transactions | `Promise<{normal: number, fast: number}>` |
| `dispose()` | Disposes all wallet accounts, clearing private keys from memory | `void` |

##### `getAccount(index)`
Returns a wallet account at the specified index.

**Parameters:**
- `index` (number, optional): The index of the account to get (default: 0)

**Returns:** `Promise<WalletAccountTon>` - The wallet account

**Example:**
```javascript
const account = await wallet.getAccount(0)
```

##### `getAccountByPath(path)`
Returns a wallet account at the specified BIP-44 derivation path.

**Parameters:**
- `path` (string): The derivation path (e.g., "0'/0/0")

**Returns:** `Promise<WalletAccountTon>` - The wallet account

**Example:**
```javascript
const account = await wallet.getAccountByPath("0'/0/1")
```

##### `getFeeRates()`
Returns current fee rates for normal and fast transactions.

**Returns:** `Promise<FeeRates>` - Object containing normal and fast fee rates

**Example:**
```javascript
const feeRates = await wallet.getFeeRates()
console.log('Normal fee rate:', feeRates.normal, 'nanotons')
console.log('Fast fee rate:', feeRates.fast, 'nanotons')
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

### WalletAccountTon

Represents an individual wallet account. Implements `IWalletAccount` from `@wdk/wallet`.

#### Constructor

```javascript
new WalletAccountTon(seed, path, config)
```

**Parameters:**
- `seed` (string | Uint8Array): BIP-39 mnemonic seed phrase or seed bytes
- `path` (string): BIP-44 derivation path (e.g., "0'/0/0")
- `config` (object, optional): Configuration object
  - `tonClient` (object, optional): TON client configuration
    - `url` (string): TON RPC endpoint URL (e.g., 'https://toncenter.com/api/v2/jsonRPC')
    - `secretKey` (string, optional): API key for the TON RPC endpoint, if required
  - `transferMaxFee` (number, optional): Maximum fee amount for transfer operations (in nanotons)

**Example:**
```javascript
const account = new WalletAccountTon(seedPhrase, "0'/0/0", {
  tonClient: { url: 'https://toncenter.com/api/v2/jsonRPC' },
  transferMaxFee: 10000000 // Maximum fee in nanotons (e.g., 0.01 TON)
})
```

#### Methods

| Method | Description | Returns |
|--------|-------------|---------|
| [`getAddress()`](#getaddress) | Returns the account's TON address | `Promise<string>` |
| [`sign(message)`](#signmessage) | Signs a message using the account's private key | `Promise<string>` |
| [`verify(message, signature)`](#verifymessage-signature) | Verifies a message signature | `Promise<boolean>` |
| [`sendTransaction(tx)`](#sendtransactiontx) | Sends a TON transaction and returns the result with hash and fee | `Promise<{hash: string, fee: number}>` |
| [`quoteSendTransaction(tx)`](#quotesendtransactiontx) | Estimates the fee for a TON transaction | `Promise<{fee: number}>` |
| [`transfer(options)`](#transferoptions) | Transfers Jettons (TON tokens) to another address | `Promise<{hash: string, fee: number}>` |
| [`quoteTransfer(options)`](#quotetransferoptions) | Estimates the fee for a Jetton transfer | `Promise<{fee: number}>` |
| [`getBalance()`](#getbalance) | Returns the native TON balance (in nanotons) | `Promise<number>` |
| [`getTokenBalance(tokenAddress)`](#gettokenbalancetokenaddress) | Returns the balance of a specific Jetton (TON token) | `Promise<number>` |
| [`dispose()`](#dispose-1) | Disposes the wallet account, clearing private keys from memory | `void` |

##### `getAddress()`
Returns the account's address.

**Returns:** `Promise<string>` - The account's TON address

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
Sends a TON transaction and returns the result with hash and fee.

**Parameters:**
- `tx` (object): The transaction object
  - `to` (string): Recipient TON address (e.g., 'EQC...')
  - `value` (number): Amount in nanotons (1 TON = 1,000,000,000 nanotons)
  - `bounceable` (boolean, optional): Whether the address is bounceable (TON-specific, optional)


**Returns:** `Promise<{hash: string, fee: number}>` - Object containing hash and fee (in nanotons)

**Example:**
```javascript
const result = await account.sendTransaction({
  to: 'EQC...', // TON address
  value: 1000000000 // 1 TON in nanotons
});
console.log('Transaction hash:', result.hash);
console.log('Transaction fee:', result.fee, 'nanotons');
```

##### `quoteSendTransaction(tx)`
Estimates the fee for a transaction.

**Parameters:**
- `tx` (object): The transaction object (same as sendTransaction)
  - `to` (string): Recipient TON address (e.g., 'EQC...')
  - `value` (number): Amount in nanotons (1 TON = 1,000,000,000 nanotons)
  - `bounceable` (boolean, optional): Whether the address is bounceable (TON-specific, optional)

**Returns:** `Promise<{fee: number}>` - Object containing fee estimate (in nanotons)

**Example:**
```javascript
const quote = await account.quoteSendTransaction({
  to: 'EQC...', // TON address
  value: 1000000000 // 1 TON in nanotons
});
console.log('Estimated fee:', quote.fee, 'nanotons');
```

##### `transfer(options)`
Transfers Jettons (TON tokens) to another address.

**Parameters:**
- `options` (object): Transfer options
  - `token` (string): Jetton master contract address (TON format, e.g., 'EQC...')
  - `recipient` (string): Recipient TON address (e.g., 'EQC...')
  - `amount` (number): Amount in Jetton's base units

**Returns:** `Promise<{hash: string, fee: number}>` - Object containing hash and fee (in nanotons)

**Example:**
```javascript
const result = await account.transfer({
  token: 'EQC...',      // Jetton master contract address
  recipient: 'EQC...',  // Recipient's TON address
  amount: 1000000000    // Amount in Jetton's base units
});
console.log('Transfer hash:', result.hash);
console.log('Transfer fee:', result.fee, 'nanotons');
```

##### `quoteTransfer(options)`
Estimates the fee for a Jetton (TON token) transfer.

**Parameters:**
- `options` (object): Transfer options (same as transfer)
  - `token` (string): Jetton master contract address (TON format, e.g., 'EQC...')
  - `recipient` (string): Recipient TON address (e.g., 'EQC...')
  - `amount` (number): Amount in Jetton's base units

**Returns:** `Promise<{fee: number}>` - Object containing fee estimate (in nanotons)

**Example:**
```javascript
const quote = await account.quoteTransfer({
  token: 'EQC...',      // Jetton master contract address
  recipient: 'EQC...',  // Recipient's TON address
  amount: 1000000000    // Amount in Jetton's base units
});
console.log('Transfer fee estimate:', quote.fee, 'nanotons');
```

##### `getBalance()`
Returns the native TON balance (in nanotons).

**Returns:** `Promise<number>` - Balance in nanotons

**Example:**
```javascript
const balance = await account.getBalance();
console.log('Balance:', balance, 'nanotons');
```

##### `getTokenBalance(tokenAddress)`
Returns the balance of a specific Jetton (TON token).

**Parameters:**
- `tokenAddress` (string): The Jetton master contract address (TON format, e.g., 'EQC...')

**Returns:** `Promise<number>` - Token balance in base units 

**Example:**
```javascript
const tokenBalance = await account.getTokenBalance('EQC...');
console.log('Token balance:', tokenBalance, 'nanotons');
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

## TonTransaction

```typescript
interface TonTransaction {
  to: string;                
  value: number;            
  bounceable?: boolean;      
}
```

## TransferOptions

```typescript
interface TransferOptions {
  token: string;           
  recipient: string;        
  amount: number;            
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

## TonWalletConfig

```typescript
interface TonWalletConfig {
  tonClient?: {
    url: string;             
    secretKey?: string;      
  };
  transferMaxFee?: number;  
}
``` 