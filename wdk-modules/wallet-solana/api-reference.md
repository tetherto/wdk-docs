---
title: Wallet Solana API Reference
description: Complete API documentation for @wdk/wallet-solana
author: Raquel Carrasco Gonzalez
lastReviewed: 2025-06-26
---

# API Reference

### Table of Contents

| Class | Description | Methods |
|-------|-------------|---------|
| [WalletManagerSolana](#walletmanagersolana) | Main class for managing Solana wallets | [Constructor](#constructor), [Methods](#methods), [Properties](#properties) |
| [WalletAccountSolana](#walletaccountsolana) | Individual Solana wallet account implementation | [Constructor](#constructor-1), [Methods](#methods), [Properties](#properties-1) |


### WalletManagerSolana

The main class for managing Solana wallets. Extends `AbstractWalletManager` from `@wdk/wallet`.

#### Constructor

```javascript
new WalletManagerSolana(seed, config)
```

**Parameters:**
- `seed` (string | Uint8Array): BIP-39 mnemonic seed phrase or seed bytes
- `config` (object, optional): Configuration object
  - `rpcUrl` (string, optional): Solana RPC endpoint URL (e.g., 'https://api.mainnet-beta.solana.com')
  - `wsUrl` (string, optional): Custom WebSocket endpoint (advanced, optional)

**Example:**
```javascript
const wallet = new WalletManagerSolana(seedPhrase, {
  rpcUrl: 'https://api.mainnet-beta.solana.com'
})
```

#### Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `getAccount(index)` | Returns a wallet account at the specified index | `Promise<WalletAccountSolana>` |
| `getAccountByPath(path)` | Returns a wallet account at the specified BIP-44 derivation path | `Promise<WalletAccountSolana>` |
| `getFeeRates()` | Returns current fee rates for normal and fast transactions | `Promise<{normal: number, fast: number}>` |
| `dispose()` | Disposes all wallet accounts, clearing private keys from memory | `void` |

##### `getAccount(index)`
Returns a wallet account at the specified index.

**Parameters:**
- `index` (number, optional): The index of the account to get (default: 0)

**Returns:** `Promise<WalletAccountSolana>` - The wallet account

**Example:**
```javascript
const account = await wallet.getAccount(0)
```

##### `getAccountByPath(path)`
Returns a wallet account at the specified BIP-44 derivation path.

**Parameters:**
- `path` (string): The derivation path (e.g., "0'/0/0")

**Returns:** `Promise<WalletAccountSolana>` - The wallet account

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
console.log('Normal fee rate:', feeRates.normal, 'lamports')
console.log('Fast fee rate:', feeRates.fast, 'lamports')
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

### WalletAccountSolana

Represents an individual wallet account. Implements `IWalletAccount` from `@wdk/wallet`.

#### Constructor

```javascript
new WalletAccountSolana(seed, path, config)
```

**Parameters:**
- `seed` (string | Uint8Array): BIP-39 mnemonic seed phrase or seed bytes
- `path` (string): BIP-44 derivation path (e.g., "0'/0/0")
- `config` (object, optional): Configuration object
  - `rpcUrl` (string, optional): Solana RPC endpoint URL (e.g., 'https://api.mainnet-beta.solana.com')
  - `wsUrl` (string, optional): Custom WebSocket endpoint (advanced, optional)

**Example:**
```javascript
const account = new WalletAccountSolana(seedPhrase, "0'/0/0", {
  rpcUrl: 'https://api.mainnet-beta.solana.com'
})
```

#### Methods

| Method | Description | Returns |
|--------|-------------|---------|
| [`getAddress()`](#getaddress) | Returns the account's Solana address | `Promise<string>` |
| [`sign(message)`](#signmessage) | Signs a message using the account's private key | `Promise<string>` |
| [`verify(message, signature)`](#verifymessage-signature) | Verifies a message signature | `Promise<boolean>` |
| [`sendTransaction(tx)`](#sendtransactiontx) | Sends a SOL transaction and returns the result with hash and fee | `Promise<{hash: string, fee: number}>` |
| [`quoteSendTransaction(tx)`](#quotesendtransactiontx) | Estimates the fee for a SOL transaction | `Promise<{fee: number}>` |
| [`transfer(options)`](#transferoptions) | Transfers SPL tokens to another address | `Promise<{hash: string, fee: number}>` |
| [`quoteTransfer(options)`](#quotetransferoptions) | Estimates the fee for an SPL token transfer | `Promise<{fee: number}>` |
| [`getBalance()`](#getbalance) | Returns the native SOL balance (in lamports) | `Promise<number>` |
| [`getTokenBalance(tokenAddress)`](#gettokenbalancetokenaddress) | Returns the balance of a specific SPL token | `Promise<number>` |
| [`dispose()`](#dispose-1) | Disposes the wallet account, clearing private keys from memory | `void` |

##### `getAddress()`
Returns the account's address.

**Returns:** `Promise<string>` - The account's Solana address

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
Sends a SOL transaction and returns the result with hash and fee.

**Parameters:**
- `tx` (object): The transaction object
  - `to` (string): Recipient Solana address (e.g., '...')
  - `value` (number): Amount in lamports (1 SOL = 1,000,000,000 lamports)

**Returns:** `Promise<{hash: string, fee: number}>` - Object containing hash and fee (in lamports)

**Example:**
```javascript
const result = await account.sendTransaction({
  to: '...', // Solana address
  value: 1000000 // 0.001 SOL in lamports
});
console.log('Transaction hash:', result.hash);
console.log('Transaction fee:', result.fee, 'lamports');
```

##### `quoteSendTransaction(tx)`
Estimates the fee for a transaction.

**Parameters:**
- `tx` (object): The transaction object (same as sendTransaction)
  - `to` (string): Recipient Solana address (e.g., '...')
  - `value` (number): Amount in lamports (1 SOL = 1,000,000,000 lamports)

**Returns:** `Promise<{fee: number}>` - Object containing fee estimate (in lamports)

**Example:**
```javascript
const quote = await account.quoteSendTransaction({
  to: '...', // Solana address
  value: 1000000 // 0.001 SOL in lamports
});
console.log('Estimated fee:', quote.fee, 'lamports');
```

##### `transfer(options)`
Transfers SPL tokens to another address.

**Parameters:**
- `options` (object): Transfer options
  - `token` (string): SPL token mint address (e.g., '...')
  - `recipient` (string): Recipient Solana address (e.g., '...')
  - `amount` (number): Amount in SPL token's base units

**Returns:** `Promise<{hash: string, fee: number}>` - Object containing hash and fee (in lamports)

**Example:**
```javascript
const result = await account.transfer({
  token: '...',      // SPL token mint address
  recipient: '...',  // Recipient's Solana address
  amount: 1000000    // Amount in SPL token's base units
});
console.log('Transfer hash:', result.hash);
console.log('Transfer fee:', result.fee, 'lamports');
```

##### `quoteTransfer(options)`
Estimates the fee for an SPL token transfer.

**Parameters:**
- `options` (object): Transfer options (same as transfer)
  - `token` (string): SPL token mint address (e.g., '...')
  - `recipient` (string): Recipient Solana address (e.g., '...')
  - `amount` (number): Amount in SPL token's base units

**Returns:** `Promise<{fee: number}>` - Object containing fee estimate (in lamports)

**Example:**
```javascript
const quote = await account.quoteTransfer({
  token: '...',      // SPL token mint address
  recipient: '...',  // Recipient's Solana address
  amount: 1000000    // Amount in SPL token's base units
});
console.log('Transfer fee estimate:', quote.fee, 'lamports');
```

##### `getBalance()`
Returns the native SOL balance (in lamports).

**Returns:** `Promise<number>` - Balance in lamports

**Example:**
```javascript
const balance = await account.getBalance();
console.log('Balance:', balance, 'lamports');
```

##### `getTokenBalance(tokenAddress)`
Returns the balance of a specific SPL token.

**Parameters:**
- `tokenAddress` (string): The SPL token mint address (e.g., '...')

**Returns:** `Promise<number>` - Token balance in base units 

**Example:**
```javascript
const tokenBalance = await account.getTokenBalance('...');
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

### TransferOptions

```typescript
interface TransferOptions {
  token: string;
  recipient: string;
  amount: number;
}
```

### KeyPair

```typescript
interface KeyPair {
  publicKey: Uint8Array
  privateKey: Uint8Array
}
```