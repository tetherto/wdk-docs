---
title: Wallet TON Gasless API Reference
description: Complete API documentation for @wdk/wallet-ton-gasless
author: Raquel Carrasco Gonzalez
lastReviewed: 2025-06-26
icon: code
---

# API Reference

### Table of Contents

| Class | Description | Methods |
|-------|-------------|---------|
| [WalletManagerTonGasless](#walletmanagertongasless) | Main class for managing gasless TON wallets | [Constructor](#constructor), [Methods](#methods), [Properties](#properties) |
| [WalletAccountTonGasless](#walletaccounttongasless) | Individual gasless TON wallet account implementation | [Constructor](#constructor-1), [Methods](#methods), [Properties](#properties-1) |


### WalletManagerTonGasless

The main class for managing gasless TON wallets. Extends `WalletManagerTon` from `@wdk/wallet-ton`.


#### Constructor

```javascript
new WalletManagerTonGasless(seed, config)
```

**Parameters:**
- `seed` (string | Uint8Array): BIP-39 mnemonic seed phrase or seed bytes
- `config` (object, optional): Configuration object
  - `tonClient` (object, optional): TON client configuration
    - `url` (string): TON RPC endpoint URL (e.g., 'https://toncenter.com/api/v2/jsonRPC')
    - `secretKey` (string, optional): API key for the TON RPC endpoint, if required
  - `tonApiClient` (object, optional): TON API client configuration
    - `url` (string): TON API endpoint URL (e.g., 'https://tonapi.io')
    - `secretKey` (string, optional): API key for the TON API endpoint
  - `paymasterToken` (object): Paymaster Jetton configuration
    - `address` (string): Paymaster Jetton master contract address
  - `transferMaxFee` (number, optional): Maximum fee for transfer operations (in paymaster Jetton base units)

**Example:**
```javascript
const wallet = new WalletManagerTonGasless(seedPhrase, {
  tonClient: { url: 'https://toncenter.com/api/v2/jsonRPC' },
  tonApiClient: { url: 'https://tonapi.io', secretKey: 'your-tonapi-key' },
  paymasterToken: { address: 'EQC...' },
  transferMaxFee: 10000000
})
```

#### Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `getAccount(index)` | Returns a gasless wallet account at the specified index | `Promise<WalletAccountTonGasless>` |
| `getAccountByPath(path)` | Returns a gasless wallet account at the specified BIP-44 derivation path | `Promise<WalletAccountTonGasless>` |

##### `getAccount(index)`
Returns a gasless wallet account at the specified index.

**Parameters:**
- `index` (number, optional): The index of the account to get (default: 0)

**Returns:** `Promise<WalletAccountTonGasless>` - The gasless wallet account

**Example:**
```javascript
const account = await wallet.getAccount(0)
```

##### `getAccountByPath(path)`
Returns a gasless wallet account at the specified BIP-44 derivation path.

**Parameters:**
- `path` (string): The derivation path (e.g., "0'/0/0")

**Returns:** `Promise<WalletAccountTonGasless>` - The gasless wallet account

**Example:**
```javascript
const account = await wallet.getAccountByPath("0'/0/1")
```

##### `quoteTransfer(options)`

Quotes the fee for a gasless Jetton transfer operation.

**Parameters:**
- `options` (object): Transfer options (recipient, amount, token, etc.)

**Returns:** `Promise<{ fee: number }>` - The estimated fee in paymaster Jetton base units

**Example:**
```javascript
const account = await wallet.getAccount(0)
const quote = await account.quoteTransfer({
  recipient: 'EQC...',
  amount: 1000000,
  token: 'EQC...'
})
console.log('Estimated Jetton fee:', quote.fee)
```

##### `dispose()`
Disposes all wallet accounts, clearing private keys from memory.

**Example:**
```javascript
wallet.dispose()
```

#### Properties

##### `seed`
> **Not exposed for security reasons.**
>
> The wallet's seed phrase is used internally for account derivation and is not accessible via a public property or method.

### WalletAccountTonGasless

Represents an individual gasless TON wallet account.  
Extends `WalletAccountTon` from `@wdk/wallet-ton` and implements `IWalletAccount` from `@wdk/wallet`.

#### Constructor

```javascript
new WalletAccountTonGasless(seed, path, config)
```

**Parameters:**
- `seed` (string | Uint8Array): BIP-39 mnemonic seed phrase or seed bytes
- `path` (string): BIP-44 derivation path (e.g., "0'/0/0")
- `config` (object, optional): Configuration object
  - `tonClient` (object, optional): TON client configuration
    - `url` (string): TON RPC endpoint URL (e.g., 'https://toncenter.com/api/v2/jsonRPC')
    - `secretKey` (string, optional): API key for the TON RPC endpoint, if required
  - `tonApiClient` (object, optional): TON API client configuration
    - `url` (string): TON API endpoint URL (e.g., 'https://tonapi.io')
    - `secretKey` (string, optional): API key for the TON API endpoint
  - `paymasterToken` (object, required): Paymaster Jetton configuration
    - `address` (string): Paymaster Jetton master contract address
  - `transferMaxFee` (number, optional): Maximum fee for transfer operations (in paymaster Jetton base units)

**Example:**
```javascript
const account = new WalletAccountTonGasless(seedPhrase, "0'/0/0", {
  tonClient: { url: 'https://toncenter.com/api/v2/jsonRPC' },
  tonApiClient: { url: 'https://tonapi.io', secretKey: 'your-tonapi-key' },
  paymasterToken: { address: 'EQC...' },
  transferMaxFee: 10000000 // Maximum fee in paymaster Jetton base units
})
```

#### Methods

| Method | Description | Returns |
|--------|-------------|---------|
| [`getAddress()`](#getaddress) | Returns the account's TON address | `Promise<string>` |
| [`sign(message)`](#signmessage) | Signs a message using the account's private key | `Promise<string>` |
| [`verify(message, signature)`](#verifymessage-signature) | Verifies a message signature | `Promise<boolean>` |
| [`transfer(options, [config])`](#sendtransactiontx) | Gasless Jetton transfer to another address (uses paymaster Jetton for fees) | `Promise<{hash: string, fee: number}>` |
| [`quoteTransfer(options, [config])`](#quotesendtransactiontx) | Estimates the fee for a Jetton (gasless) transfer | `Promise<{fee: number}>` |
| [`getPaymasterTokenBalance()`](#transferoptions) | Returns the balance of the paymaster Jetton | `Promise<number>` |
| [`getBalance()`](#quotetransferoptions) | Returns the native TON balance (in nanotons)	 | `Promise<number>` |
| [`getTokenBalance(tokenAddress)`](#gettokenbalancetokenaddress) | Returns the balance of a specific Jetton (TON token)| `Promise<number>` |
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

##### `transfer(options)`
Transfers Jettons (TON tokens) to another address.

**Parameters:**
- `options` (object): Transfer options
  - `token` (string): Jetton master contract address (TON format, e.g., 'EQC...')
  - `recipient` (string): Recipient TON address (e.g., 'EQC...')
  - `amount` (number): Amount in Jetton's base units

**Returns:** `Promise<{hash: string, fee: number}>` - Object containing hash and fee (in paymaster Jetton base units)

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

**Returns:** `Promise<{hash: string, fee: number}>` - Object containing fee (in paymaster Jetton base units)

**Example:**
```javascript
const quote = await account.quoteTransfer({
  token: 'EQC...',      // Jetton master contract address
  recipient: 'EQC...',  // Recipient's TON address
  amount: 1000000000    // Amount in Jetton's base units
});
console.log('Transfer fee estimate:', quote.fee, 'nanotons');
```

##### `getPaymasterTokenBalance()`
Returns the balance of the paymaster Jetton (used for gasless fees).

**Returns:** `Promise<number>` - Paymaster Jetton balance in base units

**Example:**
```javascript
const paymasterBalance = await account.getPaymasterTokenBalance();
console.log('Paymaster Jetton balance:', paymasterBalance);
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

## TonGaslessWalletConfig
```typescript
interface TonGaslessWalletConfig {
  tonClient?: {
    url: string;
    secretKey?: string;
  };
  tonApiClient?: {
    url: string;
    secretKey?: string;
  };
  paymasterToken: {
    address: string; 
  };
  transferMaxFee?: number; 
}
```