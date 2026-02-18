---
title: Wallet Tron API Reference
description: Complete API documentation for @tetherto/wdk-wallet-tron
icon: code
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

## Table of Contents

| Class | Description | Methods |
|-------|-------------|---------|
| [WalletManagerTron](#walletmanagertron) | Main class for managing Tron wallets. Extends `WalletManager` from `@tetherto/wdk-wallet`. | [Constructor](#constructor), [Methods](#methods) |
| [WalletAccountTron](#walletaccounttron) | Individual Tron wallet account implementation. Extends `WalletAccountReadOnlyTron` and implements `IWalletAccount`. | [Constructor](#constructor-1), [Methods](#methods-1), [Properties](#properties) |
| [WalletAccountReadOnlyTron](#walletaccountreadonlytron) | Read-only Tron wallet account. Extends `WalletAccountReadOnly` from `@tetherto/wdk-wallet`. | [Constructor](#constructor-2), [Methods](#methods-2) |

## WalletManagerTron

The main class for managing Tron wallets. Extends `WalletManager` from `@tetherto/wdk-wallet`.

### Constructor

```javascript
new WalletManagerTron(seed, config?)
```

**Parameters:**
- `seed` (string | Uint8Array): BIP-39 mnemonic seed phrase or seed bytes
- `config` (TronWalletConfig, optional): Configuration object
  - `provider` (string | TronWeb, optional): Tron RPC endpoint URL or TronWeb instance
  - `transferMaxFee` (number | bigint, optional): Maximum fee amount for transfer operations (in sun)

**Example:**
```javascript
const wallet = new WalletManagerTron(seedPhrase, {
  provider: 'https://api.trongrid.io', // Tron RPC endpoint
  transferMaxFee: 10000000 // 10 TRX in sun
})

// Or with TronWeb instance
const tronWeb = new TronWeb({ fullHost: 'https://api.trongrid.io' })
const wallet2 = new WalletManagerTron(seedPhrase, {
  provider: tronWeb,
  transferMaxFee: 10000000
})
```

### Methods

| Method | Description | Returns | Throws |
|--------|-------------|---------|--------|
| `getAccount(index?)` | Returns a wallet account at the specified index | `Promise<WalletAccountTron>` | - |
| `getAccountByPath(path)` | Returns a wallet account at the specified BIP-44 derivation path | `Promise<WalletAccountTron>` | - |
| `getFeeRates()` | Returns current fee rates from Tron network | `Promise<{normal: bigint, fast: bigint}>` | If no provider |
| `dispose()` | Disposes all wallet accounts, clearing private keys from memory | `void` | - |

##### `getAccount(index?)`
Returns a wallet account at the specified index using Tron's BIP-44 derivation (m/44'/195').

**Parameters:**
- `index` (number, optional): The index of the account to get (default: 0)

**Returns:** `Promise<WalletAccountTron>` - The wallet account

**Example:**
```javascript
// Get first account (m/44'/195'/0'/0/0)
const account = await wallet.getAccount(0)

// Get second account (m/44'/195'/0'/0/1)
const account1 = await wallet.getAccount(1)
```

##### `getAccountByPath(path)`
Returns a wallet account at the specified BIP-44 derivation path.

**Parameters:**
- `path` (string): The derivation path (e.g., "0'/0/0")

**Returns:** `Promise<WalletAccountTron>` - The wallet account

**Example:**
```javascript
// Full path: m/44'/195'/0'/0/1
const account = await wallet.getAccountByPath("0'/0/1")
```

##### `getFeeRates()`
Returns current fee rates from Tron network chain parameters.

**Returns:** `Promise<{normal: bigint, fast: bigint}>` - Fee rates in sun
- `normal`: Base fee × 1.1
- `fast`: Base fee × 2.0

**Throws:** Error if no TronWeb provider is configured

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

## WalletAccountTron

Represents an individual Tron wallet account. Extends `WalletAccountReadOnlyTron` and implements `IWalletAccount`.

### Constructor

```javascript
new WalletAccountTron(seed, path, config?)
```

**Parameters:**
- `seed` (string | Uint8Array): BIP-39 mnemonic seed phrase or seed bytes
- `path` (string): BIP-44 derivation path (e.g., "0'/0/0")
- `config` (TronWalletConfig, optional): Configuration object

**Throws:** Error if seed phrase is invalid (BIP-39 validation fails)

**Example:**
```javascript
const account = new WalletAccountTron(seedPhrase, "0'/0/0", {
  provider: 'https://api.trongrid.io',
  transferMaxFee: 10000000 // 10 TRX in sun
})
```

### Methods

| Method | Description | Returns | Throws |
|--------|-------------|---------|--------|
| `getAddress()` | Returns the account's Tron address | `Promise<string>` | - |
| `sign(message)` | Signs a message using the account's private key | `Promise<string>` | - |
| `verify(message, signature)` | Verifies a message signature | `Promise<boolean>` | - |
| `sendTransaction(tx)` | Sends a Tron transaction | `Promise<{hash: string, fee: bigint}>` | If no provider or fee exceeds max |
| `quoteSendTransaction(tx)` | Estimates the fee for a Tron transaction | `Promise<{fee: bigint}>` | If no provider |
| `transfer(options)` | Transfers TRC20 tokens to another address | `Promise<{hash: string, fee: bigint}>` | If no provider or fee exceeds max |
| `quoteTransfer(options)` | Estimates the fee for a TRC20 transfer | `Promise<{fee: bigint}>` | If no provider |
| `getBalance()` | Returns the native TRX balance (in sun) | `Promise<bigint>` | If no provider |
| `getTokenBalance(tokenAddress)` | Returns the balance of a specific TRC20 token | `Promise<bigint>` | If no provider |
| `getTransactionReceipt(hash)` | Returns a transaction's receipt | `Promise<TronTransactionReceipt \| null>` | If no provider |
| `toReadOnlyAccount()` | Returns a read-only copy of the account | `Promise<WalletAccountReadOnlyTron>` | - |
| `dispose()` | Disposes the wallet account, clearing private keys from memory | `void` | - |

##### `getAddress()`
Returns the account's Tron address (starts with 'T').

**Returns:** `Promise<string>` - The account's Tron address

**Example:**
```javascript
const address = await account.getAddress()
console.log('Account address:', address) // T...
```

##### `sign(message)`
Signs a message using Keccak-256 hash and secp256k1 signature.

**Parameters:**
- `message` (string): The message to sign (UTF-8 encoded)

**Returns:** `Promise<string>` - The message signature (hex string)

**Example:**
```javascript
const message = 'Hello, Tron!'
const signature = await account.sign(message)
console.log('Signature:', signature)
```

##### `verify(message, signature)`
Verifies a message signature using secp256k1.

**Parameters:**
- `message` (string): The original message
- `signature` (string): The signature to verify (hex string)

**Returns:** `Promise<boolean>` - True if signature is valid

**Example:**
```javascript
const isValid = await account.verify('Hello, Tron!', signature)
console.log('Signature valid:', isValid)
```


##### `sendTransaction(tx)`
Sends a TRX transaction and returns the result with hash and fee.

**Parameters:**
- `tx` (TronTransaction): The transaction object
  - `to` (string): Recipient Tron address (e.g., 'T...')
  - `value` (number | bigint): Amount in sun (1 TRX = 1,000,000 sun)

**Returns:** `Promise<{hash: string, fee: bigint}>` - Transaction hash and fee in sun

**Throws:** 
- Error if no TronWeb provider is configured
- Error if fee exceeds `transferMaxFee`

**Example:**
```javascript
const result = await account.sendTransaction({
  to: 'TLyqzVGLV1srkB7dToTAEqgDSfPtXRJZYH', // Tron address
  value: 1000000 // 1 TRX in sun
})
console.log('Transaction hash:', result.hash)
console.log('Transaction fee:', result.fee, 'sun')
```

##### `quoteSendTransaction(tx)`
Estimates the bandwidth cost for a TRX transaction.

**Parameters:**
- `tx` (TronTransaction): The transaction object (same as sendTransaction)

**Returns:** `Promise<{fee: bigint}>` - Fee estimate in sun

**Throws:** Error if no TronWeb provider is configured

**Example:**
```javascript
const quote = await account.quoteSendTransaction({
  to: 'TLyqzVGLV1srkB7dToTAEqgDSfPtXRJZYH',
  value: 1000000
})
console.log('Estimated fee:', quote.fee, 'sun')
```

##### `transfer(options)`
Transfers TRC20 tokens using smart contract call.

**Parameters:**
- `options` (TransferOptions): Transfer options
  - `token` (string): TRC20 contract address (e.g., 'T...')
  - `recipient` (string): Recipient Tron address (e.g., 'T...')
  - `amount` (number | bigint): Amount in token's base units

**Returns:** `Promise<{hash: string, fee: bigint}>` - Transaction hash and fee in sun

**Throws:** 
- Error if no TronWeb provider is configured
- Error if fee exceeds `transferMaxFee`

**Example:**
```javascript
const result = await account.transfer({
  token: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', // USDT TRC20
  recipient: 'TLyqzVGLV1srkB7dToTAEqgDSfPtXRJZYH',
  amount: 1000000 // 1 USDT (6 decimals)
})
console.log('Transfer hash:', result.hash)
console.log('Transfer fee:', result.fee, 'sun')
```

##### `quoteTransfer(options)`
Estimates the energy and bandwidth cost for a TRC20 token transfer.

**Parameters:**
- `options` (TransferOptions): Transfer options (same as transfer)

**Returns:** `Promise<{fee: bigint}>` - Fee estimate in sun (energy + bandwidth costs)

**Throws:** Error if no TronWeb provider is configured

**Example:**
```javascript
const quote = await account.quoteTransfer({
  token: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
  recipient: 'TLyqzVGLV1srkB7dToTAEqgDSfPtXRJZYH',
  amount: 1000000
})
console.log('Transfer fee estimate:', quote.fee, 'sun')
```

##### `getBalance()`
Returns the native TRX balance.

**Returns:** `Promise<bigint>` - Balance in sun

**Throws:** Error if no TronWeb provider is configured

**Example:**
```javascript
const balance = await account.getBalance()
console.log('TRX balance:', balance, 'sun')
```

##### `getTokenBalance(tokenAddress)`
Returns the balance of a specific TRC20 token.

**Parameters:**
- `tokenAddress` (string): The TRC20 contract address (e.g., 'T...')

**Returns:** `Promise<bigint>` - Token balance in base units

**Throws:** Error if no TronWeb provider is configured

**Example:**
```javascript
const tokenBalance = await account.getTokenBalance('TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t')
console.log('USDT balance:', tokenBalance) // In 6 decimal units
```

##### `getTransactionReceipt(hash)`
Returns a transaction's receipt if it has been processed.

**Parameters:**
- `hash` (string): The transaction hash

**Returns:** `Promise<TronTransactionReceipt | null>` - Transaction receipt or null

**Throws:** Error if no TronWeb provider is configured

**Example:**
```javascript
const receipt = await account.getTransactionReceipt('0x...')
console.log('Transaction confirmed:', receipt.success)
```

##### `toReadOnlyAccount()`
Creates a read-only copy of the account.

**Returns:** `Promise<WalletAccountReadOnlyTron>` - Read-only account instance

**Example:**
```javascript
const readOnlyAccount = await account.toReadOnlyAccount()

// Can check balances but cannot send transactions
const balance = await readOnlyAccount.getBalance()
```

##### `dispose()`
Disposes the wallet account, clearing private keys from memory using sodium_memzero.

**Example:**
```javascript
account.dispose()
```

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `index` | `number` | The derivation path's index of this account |
| `path` | `string` | The full BIP-44 derivation path of this account |
| `keyPair` | `{publicKey: Uint8Array, privateKey: Uint8Array \| null}` | The account's key pair (⚠️ Contains sensitive data) |

**Example:**
```javascript
console.log('Account index:', account.index) // 0, 1, 2, etc.
console.log('Account path:', account.path) // m/44'/195'/0'/0/0

// ⚠️ SENSITIVE: Handle with care
const { privateKey, publicKey } = account.keyPair
console.log('Public key length:', publicKey.length) // 33 bytes (compressed)
console.log('Private key length:', privateKey.length) // 32 bytes
```

⚠️ **Security Note**: The `keyPair` property contains sensitive cryptographic material. Never log, display, or expose the private key.

## WalletAccountReadOnlyTron

Represents a read-only Tron wallet account that can query balances and estimate fees but cannot send transactions.

### Constructor

```javascript
new WalletAccountReadOnlyTron(address, config?)
```

**Parameters:**
- `address` (string): The account's Tron address
- `config` (Omit<TronWalletConfig, 'transferMaxFee'>, optional): Configuration object without transferMaxFee

**Example:**
```javascript
const readOnlyAccount = new WalletAccountReadOnlyTron('TLyqzVGLV1srkB7dToTAEqgDSfPtXRJZYH', {
  provider: 'https://api.trongrid.io'
})
```

### Methods

| Method | Description | Returns | Throws |
|--------|-------------|---------|--------|
| `getBalance()` | Returns the native TRX balance (in sun) | `Promise<bigint>` | If no provider |
| `getTokenBalance(tokenAddress)` | Returns the balance of a specific TRC20 token | `Promise<bigint>` | If no provider |
| `quoteSendTransaction(tx)` | Estimates the fee for a TRX transaction | `Promise<{fee: bigint}>` | If no provider |
| `quoteTransfer(options)` | Estimates the fee for a TRC20 transfer | `Promise<{fee: bigint}>` | If no provider |
| `verify(message, signature)` | Verifies a message signature | `Promise<boolean>` | - |
| `getTransactionReceipt(hash)` | Returns a transaction's receipt | `Promise<TronTransactionReceipt \| null>` | If no provider |

##### `getBalance()`
Returns the native TRX balance.

**Returns:** `Promise<bigint>` - Balance in sun

**Throws:** Error if no TronWeb provider is configured

**Example:**
```javascript
const balance = await readOnlyAccount.getBalance()
console.log('TRX balance:', balance, 'sun')
```

##### `getTokenBalance(tokenAddress)`
Returns the balance of a specific TRC20 token.

**Parameters:**
- `tokenAddress` (string): The TRC20 contract address

**Returns:** `Promise<bigint>` - Token balance in base units

**Throws:** Error if no TronWeb provider is configured

**Example:**
```javascript
const tokenBalance = await readOnlyAccount.getTokenBalance('TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t')
console.log('USDT balance:', tokenBalance)
```

##### `quoteSendTransaction(tx)`
Estimates the bandwidth cost for a TRX transaction.

**Parameters:**
- `tx` (TronTransaction): The transaction object

**Returns:** `Promise<{fee: bigint}>` - Fee estimate in sun

**Throws:** Error if no TronWeb provider is configured

##### `quoteTransfer(options)`
Estimates the energy and bandwidth cost for a TRC20 transfer.

**Parameters:**
- `options` (TransferOptions): Transfer options

**Returns:** `Promise<{fee: bigint}>` - Fee estimate in sun

**Throws:** Error if no TronWeb provider is configured


##### `verify(message, signature)`
Verifies a message signature using secp256k1.

**Parameters:**
- `message` (string): The original message
- `signature` (string): The signature to verify (hex string)

**Returns:** `Promise<boolean>` - True if signature is valid

**Example:**
```javascript
const readOnlyAccount = new WalletAccountReadOnlyTron('T...', { provider: '...' })
const isValid = await readOnlyAccount.verify(message, signature)
console.log('Signature valid:', isValid)
```

##### `getTransactionReceipt(hash)`
Returns a transaction's receipt if it has been processed.

**Parameters:**
- `hash` (string): The transaction hash

**Returns:** `Promise<TronTransactionReceipt | null>` - Transaction receipt or null

**Throws:** Error if no TronWeb provider is configured

## Types

### TronWalletConfig

```typescript
interface TronWalletConfig {
  provider?: string | TronWeb;        // Tron RPC URL or TronWeb instance
  transferMaxFee?: number | bigint;   // Maximum fee in sun
}
```

### TronTransaction

```typescript
interface TronTransaction {
  to: string;                         // Recipient Tron address
  value: number | bigint;             // Amount in sun (1 TRX = 1,000,000 sun)
}
```

### TransferOptions

```typescript
interface TransferOptions {
  token: string;                      // TRC20 contract address
  recipient: string;                  // Recipient Tron address
  amount: number | bigint;            // Amount in token base units
}
```

### TransactionResult

```typescript
interface TransactionResult {
  hash: string;                       // Transaction hash
  fee: bigint;                        // Fee paid in sun
}
```

### TransferResult

```typescript
interface TransferResult {
  hash: string;                       // Transaction hash
  fee: bigint;                        // Fee paid in sun
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
				<strong>WDK Tron Wallet Usage</strong>
			</td>
			<td>Get started with WDK's Tron Wallet Usage</td>
			<td>
				<a href="./usage.md">WDK Tron Wallet Usage</a>
			</td>
		</tr>
        <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK Tron Wallet Configuration</strong>
			</td>
			<td>Get started with WDK's Tron Wallet Configuration</td>
			<td>
				<a href="./configuration.md">WDK Tron Wallet Configuration</a>
			</td>
		</tr>
	</tbody>
</table>

***

### Need Help?

{% include "../../../.gitbook/includes/support-cards.md" %}


