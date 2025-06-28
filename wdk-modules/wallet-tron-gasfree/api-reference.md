---
title: Wallet Tron Gas-Free API Reference
description: Complete API documentation for @wdk/wallet-tron-gasfree
author: Raquel Carrasco Gonzalez
lastReviewed: 2025-06-26
icon: code
---

# API Reference

### Table of Contents

| Class | Description | Methods |
|-------|-------------|---------|
| [WalletManagerTronGasfree](#walletmanagertrongasfree) | Main class for managing gas-free Tron wallets | [Constructor](#constructor), [Methods](#methods), [Properties](#properties) |
| [WalletAccountTronGasfree](#walletaccounttrongasfree) | Individual gas-free Tron wallet account implementation | [Constructor](#constructor-1), [Methods](#methods), [Properties](#properties-1) |


### WalletManagerTronGasfree

The main class for managing gas-free Tron wallets. Extends `WalletManagerTron` from `@wdk/wallet-tron`.

#### Constructor

```javascript
new WalletManagerTronGasfree(seed, config)
```

**Parameters:**
- `seed` (string | Uint8Array): BIP-39 mnemonic seed phrase or seed bytes
- `config` (object, optional): Configuration object
  - `provider` (string, optional): Tron RPC endpoint URL (e.g., 'https://api.trongrid.io')
  - `gasFreeProvider` (string, required): Gas-free service endpoint
  - `apiKey` (string, required): API key for gas-free provider
  - `apiSecret` (string, required): API secret for gas-free provider
  - `serviceProvider` (string, required): Service provider Tron address
  - `verifyingContract` (string, required): Gas-free verifying contract address
  - `chainId` (number, required): Tron chain ID
  - `transferMaxFee` (number, optional): Maximum fee for transfer operations (in token base units)

**Example:**
```javascript
const wallet = new WalletManagerTronGasfree(seedPhrase, {
  provider: 'https://api.trongrid.io',
  gasFreeProvider: 'https://your-gasfree-provider',
  apiKey: 'your-api-key',
  apiSecret: 'your-api-secret',
  serviceProvider: 'T...',
  verifyingContract: 'T...',
  chainId: 728126428,
  transferMaxFee: 10000000
})
```

#### Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `getAccount(index)` | Returns a gas-free wallet account at the specified index | `Promise<WalletAccountTronGasfree>` |
| `getAccountByPath(path)` | Returns a gas-free wallet account at the specified BIP-44 derivation path | `Promise<WalletAccountTronGasfree>` |
| `dispose()` | Disposes all wallet accounts, clearing private keys from memory | `void` |

##### `getAccount(index)`
Returns a gas-free wallet account at the specified index.

**Parameters:**
- `index` (number, optional): The index of the account to get (default: 0)

**Returns:** `Promise<WalletAccountTronGasfree>` - The wallet account

**Example:**
```javascript
const account = await wallet.getAccount(0)
```

##### `getAccountByPath(path)`
Returns a gas-free wallet account at the specified BIP-44 derivation path.

**Parameters:**
- `path` (string): The derivation path (e.g., "0'/0/0")

**Returns:** `Promise<WalletAccountTronGasfree>` - The wallet account

**Example:**
```javascript
const account = await wallet.getAccountByPath("0'/0/1")
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

### WalletAccountTronGasfree

Represents an individual gas-free wallet account. Extends `WalletAccountTron` from `@wdk/wallet-tron`.

#### Constructor

```javascript
new WalletAccountTronGasfree(seed, path, config)
```

**Parameters:**
- `seed` (string | Uint8Array): BIP-39 mnemonic seed phrase or seed bytes
- `path` (string): BIP-44 derivation path (e.g., "0'/0/0")
- `config` (object, optional): Configuration object (see above)

**Example:**
```javascript
const account = new WalletAccountTronGasfree(seedPhrase, "0'/0/0", {
  provider: 'https://api.trongrid.io',
  gasFreeProvider: 'https://your-gasfree-provider',
  apiKey: 'your-api-key',
  apiSecret: 'your-api-secret',
  serviceProvider: 'T...',
  verifyingContract: 'T...',
  chainId: 728126428,
  transferMaxFee: 10000000
})
```

#### Methods

| Method | Description | Returns |
|--------|-------------|---------|
| [`getAddress()`](#getaddress) | Returns the account's gas-free Tron address | `Promise<string>` |
| [`sign(message)`](#signmessage) | Signs a message using the account's private key | `Promise<string>` |
| [`verify(message, signature)`](#verifymessage-signature) | Verifies a message signature | `Promise<boolean>` |
| [`transfer(options)`](#transferoptions) | Gas-free TRC20 token transfer to another address | `Promise<{id: string, fee: number}>` |
| [`quoteTransfer(options)`](#quotetransferoptions) | Estimates the fee for a gas-free TRC20 transfer | `Promise<{fee: number}>` |
| [`getTransferHash(id)`](#gettransferhashid) | Gets the transaction hash for a submitted transfer | `Promise<string>` |
| [`dispose()`](#dispose-1) | Disposes the wallet account, clearing private keys from memory | `void` |

##### `getAddress()`
Returns the account's gas-free Tron address.

**Returns:** `Promise<string>` - The account's gas-free Tron address

**Example:**
```javascript
const address = await account.getAddress()
console.log('Gas-free account address:', address)
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
Gas-free TRC20 token transfer to another address.

**Parameters:**
- `options` (object): Transfer options
  - `token` (string): TRC20 contract address (e.g., 'T...')
  - `recipient` (string): Recipient Tron address (e.g., 'T...')
  - `amount` (number): Amount in TRC20's base units

**Returns:** `Promise<{id: string, fee: number}>` - Object containing transfer ID and fee (in token base units)

**Example:**
```javascript
const result = await account.transfer({
  token: 'T...',
  recipient: 'T...',
  amount: 1000000
});
console.log('Transfer ID:', result.id);
console.log('Fee (token base units):', result.fee);
```

##### `quoteTransfer(options)`
Estimates the fee for a gas-free TRC20 token transfer.

**Parameters:**
- `options` (object): Transfer options (same as transfer)
  - `token` (string): TRC20 contract address (e.g., 'T...')
  - `recipient` (string): Recipient Tron address (e.g., 'T...')
  - `amount` (number): Amount in TRC20's base units

**Returns:** `Promise<{fee: number}>` - Object containing fee estimate (in token base units)

**Example:**
```javascript
const quote = await account.quoteTransfer({
  token: 'T...',
  recipient: 'T...',
  amount: 1000000
});
console.log('Estimated fee (token base units):', quote.fee);
```

##### `getTransferHash(id)`
Gets the transaction hash for a submitted transfer.

**Parameters:**
- `id` (string): The transfer ID returned by `transfer()`

**Returns:** `Promise<string>` - The transaction hash

**Example:**
```javascript
const txnHash = await account.getTransferHash(result.id)
console.log('Transaction hash:', txnHash)
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
## KeyPair

```typescript
interface KeyPair {
  publicKey: Uint8Array
  privateKey: Uint8Array
}
```