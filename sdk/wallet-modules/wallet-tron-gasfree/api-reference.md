---
title: Wallet Tron Gas-Free API Reference
description: Complete API documentation for @tetherto/wdk-wallet-tron-gasfree
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
| [WalletManagerTronGasfree](#walletmanagertrongasfree) | Main class for managing gas-free Tron wallets. Extends `WalletManager` from `@tetherto/wdk-wallet`. | [Constructor](#constructor), [Methods](#methods) |
| [WalletAccountTronGasfree](#walletaccounttrongasfree) | Individual gas-free Tron wallet account implementation. Extends `WalletAccountReadOnlyTronGasfree`. | [Constructor](#constructor-1), [Methods](#methods-1) |
| [WalletAccountReadOnlyTronGasfree](#walletaccountreadonlytrongasfree) | Read-only gas-free Tron wallet account. | [Constructor](#constructor-2), [Methods](#methods-2) |

### WalletManagerTronGasfree

The main class for managing gas-free Tron wallets. Extends `WalletManager` from `@tetherto/wdk-wallet`.
#### Constructor

```javascript
new WalletManagerTronGasfree(seed, config)
```

**Parameters:**
- `seed` (string | Uint8Array): BIP-39 mnemonic seed phrase or seed bytes
- `config` (object): Configuration object
  - `chainId` (number): The blockchain's id
  - `provider` (string): Tron RPC endpoint URL
  - `gasFreeProvider` (string): Gas-free service endpoint
  - `gasFreeApiKey` (string): API key for gas-free provider
  - `gasFreeApiSecret` (string): API secret for gas-free provider
  - `serviceProvider` (string): Service provider Tron address
  - `verifyingContract` (string): Gas-free verifying contract address
  - `transferMaxFee` (number | bigint, optional): Maximum fee for transfer operations

**Example:**
```javascript
const wallet = new WalletManagerTronGasfree(seedPhrase, {
  chainId: 728126428,
  provider: 'https://api.trongrid.io',
  gasFreeProvider: 'https://gasfree.provider.url',
  gasFreeApiKey: 'your-api-key',
  gasFreeApiSecret: 'your-api-secret',
  serviceProvider: 'T...',
  verifyingContract: 'T...',
  transferMaxFee: 10000000 // Optional
})
```

#### Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `getAccount(index)` | Returns a wallet account at the specified index | `Promise<WalletAccountTronGasfree>` |
| `getAccountByPath(path)` | Returns a wallet account at the specified BIP-44 derivation path | `Promise<WalletAccountTronGasfree>` |
| `getFeeRates()` | Returns current fee rates for normal and fast transactions | `Promise<{normal: bigint, fast: bigint}>` |
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

##### `getFeeRates()`
Returns current fee rates for normal and fast transactions.

**Returns:** `Promise<{normal: bigint, fast: bigint}>` - Object containing fee rates in sun
- `normal`: Fee rate for normal priority transactions
- `fast`: Fee rate for high priority transactions

**Example:**
```javascript
const feeRates = await wallet.getFeeRates()
console.log('Normal fee rate:', feeRates.normal, 'sun')
console.log('Fast fee rate:', feeRates.fast, 'sun')
```

##### `dispose()`
Disposes all wallet accounts, clearing private keys from memory. This method should be called when you're done using the wallet to ensure sensitive data is removed.

**Example:**
```javascript
wallet.dispose()
```


### WalletAccountTronGasfree

Individual gas-free Tron wallet account implementation.

#### Constructor

```javascript
new WalletAccountTronGasfree(seed, path, config)
```

**Parameters:**
- `seed` (string | Uint8Array): BIP-39 mnemonic seed phrase or seed bytes
- `path` (string): BIP-44 derivation path (e.g., "0'/0/0")
- `config` (object): Same configuration object as WalletManagerTronGasfree

#### Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `getAddress()` | Returns the account's address | `Promise<string>` |
| `getBalance()` | Returns the native TRX balance (in sun) | `Promise<bigint>` |
| `getTokenBalance(tokenAddress)` | Returns the balance of a specific TRC20 token | `Promise<bigint>` |
| `sendTransaction(tx)` | Sends a Tron transaction | `Promise<{hash: string, fee: bigint}>` |
| `transfer(options, config?)` | Transfers TRC20 tokens gas-free | `Promise<{hash: string, fee: bigint}>` |
| `quoteSendTransaction(tx)` | Estimates the fee for a Tron transaction | `Promise<{fee: bigint}>` |
| `quoteTransfer(options)` | Estimates the fee for a TRC20 transfer | `Promise<{fee: bigint}>` |
| `sign(message)` | Signs a message using the account's private key | `Promise<string>` |
| `verify(message, signature)` | Verifies a message signature | `Promise<boolean>` |
| `getTransactionReceipt(hash)` | Returns a transaction's receipt | `Promise<TronTransactionReceipt \| null>` |
| `toReadOnlyAccount()` | Returns a read-only copy of the account | `Promise<WalletAccountReadOnlyTronGasfree>` |
| `dispose()` | Disposes the wallet account, clearing private keys from memory | `void` |


##### `getAddress()`
Returns the account's gas-free Tron address.

**Returns:** `Promise<string>` - The account's Tron address

**Example:**
```javascript
const address = await account.getAddress()
console.log('Account address:', address)
```

##### `getBalance()`
Returns the native TRX balance in sun units.

**Returns:** `Promise<bigint>` - Balance in sun

**Example:**
```javascript
const balance = await account.getBalance()
console.log('TRX Balance:', balance, 'sun')
```

##### `getTokenBalance(tokenAddress)`
Returns the balance of a specific TRC20 token.

**Parameters:**
- `tokenAddress` (string): The TRC20 contract address (e.g., 'T...')

**Returns:** `Promise<bigint>` - Token balance in base units

**Example:**
```javascript
const tokenBalance = await account.getTokenBalance('T...')
console.log('Token balance:', tokenBalance)
```

##### `transfer(options, config?)`
Transfers TRC20 tokens to another address using the gas-free service.

**Parameters:**
- `options` (TransferOptions): Transfer options
  - `token` (string): TRC20 contract address
  - `recipient` (string): Recipient's Tron address
  - `amount` (number | bigint): Amount in token base units
- `config` (object, optional): Additional configuration
  - `transferMaxFee` (number | bigint, optional): Maximum fee for this transfer (overrides wallet-level setting)

**Returns:** `Promise<{hash: string, fee: bigint}>` - Object containing transaction hash and fee paid in token base units

**Example:**
```javascript
const result = await account.transfer({
  token: 'T...',      // TRC20 contract address
  recipient: 'T...',  // Recipient's address
  amount: 1000000     // Amount in token base units
}, {
  transferMaxFee: 5000 // Optional: override max fee
})
console.log('Transaction hash:', result.hash)
console.log('Fee paid:', result.fee, 'token base units')
```

##### `sendTransaction(tx)`
Sends a TRX transaction.

**Parameters:**
- `tx` (TronTransaction): The transaction object
  - `to` (string): Recipient Tron address
  - `value` (number | bigint): Amount in sun

**Returns:** `Promise<{hash: string, fee: bigint}>` - Transaction hash and fee

**Example:**
```javascript
const result = await account.sendTransaction({
  to: 'T...',
  value: 1000000
})
console.log('Transaction hash:', result.hash)
```

##### `quoteSendTransaction(tx)`
Estimates the fee for a Tron transaction.

**Parameters:**
- `tx` (TronTransaction): The transaction object

**Returns:** `Promise<{fee: bigint}>` - Fee estimate in sun

**Example:**
```javascript
const quote = await account.quoteSendTransaction({
  to: 'T...',
  value: 1000000
})
console.log('Estimated fee:', quote.fee, 'sun')
```

##### `quoteTransfer(options)`
Estimates the fee for a TRC20 token transfer.

**Parameters:**
- `options` (TransferOptions): Transfer options (same as transfer method)

**Returns:** `Promise<{fee: bigint}>` - Estimated fee in token base units

**Example:**
```javascript
const quote = await account.quoteTransfer({
  token: 'T...',
  recipient: 'T...',
  amount: 1000000
})
console.log('Estimated fee:', quote.fee, 'token base units')
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

##### `dispose()`
Disposes the wallet account, clearing private keys from memory.

**Example:**
```javascript
account.dispose()
```

##### `getTransactionReceipt(hash)`
Returns a transaction's receipt if it has been processed.

**Parameters:**
- `hash` (string): The transaction hash

**Returns:** `Promise<TronTransactionReceipt | null>` - Transaction receipt or null

**Example:**
```javascript
const receipt = await account.getTransactionReceipt('abc123...')
if (receipt) {
  console.log('Transaction confirmed')
}
```

##### `toReadOnlyAccount()`
Returns a read-only copy of the account.

**Returns:** `Promise<WalletAccountReadOnlyTronGasfree>` - Read-only account instance

**Example:**
```javascript
const readOnlyAccount = await account.toReadOnlyAccount()
const balance = await readOnlyAccount.getBalance()
```

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `index` | `number` | The derivation path's index of this account |
| `path` | `string` | The full BIP-44 derivation path of this account |
| `keyPair` | `{publicKey: Uint8Array, privateKey: Uint8Array \| null}` | The account's key pair (⚠️ Contains sensitive data) |

⚠️ **Security Note**: The `keyPair` property contains sensitive cryptographic material. Never log, display, or expose the private key.

### WalletAccountReadOnlyTronGasfree

Read-only gas-free Tron wallet account.

#### Constructor

```javascript
new WalletAccountReadOnlyTronGasfree(address, config)
```

**Parameters:**
- `address` (string): The account's Tron address
- `config` (object): Configuration object
  - `chainId` (number): The blockchain's id
  - `provider` (string): Tron RPC endpoint URL
  - `gasFreeProvider` (string): Gas-free service endpoint
  - `gasFreeApiKey` (string): API key for gas-free provider
  - `gasFreeApiSecret` (string): API secret for gas-free provider
  - `serviceProvider` (string): Service provider Tron address
  - `verifyingContract` (string): Gas-free verifying contract address

#### Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `getAddress()` | Returns the account's address | `Promise<string>` |
| `getBalance()` | Returns the native TRX balance (in sun) | `Promise<bigint>` |
| `getTokenBalance(tokenAddress)` | Returns the balance of a specific TRC20 token | `Promise<bigint>` |
| `quoteSendTransaction(tx)` | Estimates the fee for a Tron transaction | `Promise<{fee: bigint}>` |
| `quoteTransfer(options)` | Estimates the fee for a TRC20 transfer | `Promise<{fee: bigint}>` |
| `verify(message, signature)` | Verifies a message signature | `Promise<boolean>` |
| `getTransactionReceipt(hash)` | Returns a transaction's receipt | `Promise<TronTransactionReceipt \| null>` |

##### `getAddress()`
Returns the account's gas-free Tron address.

**Returns:** `Promise<string>` - The account's Tron address

**Example:**
```javascript
const address = await readOnlyAccount.getAddress()
console.log('Account address:', address)
```

##### `getBalance()`
Returns the native TRX balance in sun units.

**Returns:** `Promise<bigint>` - Balance in sun

**Example:**
```javascript
const balance = await readOnlyAccount.getBalance()
console.log('TRX Balance:', balance, 'sun')
```

##### `getTokenBalance(tokenAddress)`
Returns the balance of a specific TRC20 token.

**Parameters:**
- `tokenAddress` (string): The TRC20 contract address (e.g., 'T...')

**Returns:** `Promise<bigint>` - Token balance in base units

**Example:**
```javascript
const tokenBalance = await readOnlyAccount.getTokenBalance('T...')
console.log('Token balance:', tokenBalance)
```

##### `quoteTransfer(options)`
Estimates the fee for a TRC20 token transfer without requiring private keys.

**Parameters:**
- `options` (TransferOptions): Transfer options
  - `token` (string): TRC20 contract address
  - `recipient` (string): Recipient's Tron address
  - `amount` (number | bigint): Amount in token base units

**Returns:** `Promise<{fee: bigint}>` - Estimated fee in token base units

**Example:**
```javascript
const quote = await readOnlyAccount.quoteTransfer({
  token: 'T...',
  recipient: 'T...',
  amount: 1000000
})
console.log('Estimated fee:', quote.fee, 'token base units')
```

##### `quoteSendTransaction(tx)`
Estimates the fee for a Tron transaction.

**Parameters:**
- `tx` (TronTransaction): The transaction object

**Returns:** `Promise<{fee: bigint}>` - Fee estimate in sun

##### `verify(message, signature)`
Verifies a message signature.

**Parameters:**
- `message` (string): The original message
- `signature` (string): The signature to verify

**Returns:** `Promise<boolean>` - True if the signature is valid

**Example:**
```javascript
const isValid = await readOnlyAccount.verify('Hello, World!', signature)
console.log('Signature valid:', isValid)
```

##### `getTransactionReceipt(hash)`
Returns a transaction's receipt if it has been processed.

**Parameters:**
- `hash` (string): The transaction hash

**Returns:** `Promise<TronTransactionReceipt | null>` - Transaction receipt or null

## Types

### TransferOptions
Configuration options for token transfers.

```typescript
interface TransferOptions {
  /**
   * The TRC20 token contract address
   * @example 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t' // USDT contract
   */
  token: string;

  /**
   * The recipient's Tron address
   * @example 'TJYeasTPa6gpEEfQa7s9CqqqgvYh6JtpAR'
   */
  recipient: string;

  /**
   * Amount to transfer in token base units
   * @example 1000000 // 1 USDT (6 decimals)
   */
  amount: number | bigint;
}
```

### TransferResult
Result object returned by transfer operations.

```typescript
interface TransferResult {
  /**
   * The transaction hash
   * @example '0x123...'
   */
  hash: string;

  /**
   * Fee paid in token base units
   * @example 1000 // Fee in token base units
   */
  fee: bigint;
}
```

### FeeRates
Fee rate information for transactions.

```typescript
interface FeeRates {
  /**
   * Fee rate for normal priority transactions (in sun)
   * @example 1000
   */
  normal: bigint;

  /**
   * Fee rate for high priority transactions (in sun)
   * @example 2000n
   */
  fast: bigint;
}
```

### TronGasfreeWalletConfig
Configuration options for wallet initialization.

```typescript
interface TronGasfreeWalletConfig {
  /**
   * The blockchain's ID
   * @example 728126428 // Tron Mainnet
   */
  chainId: number;

  /**
   * Tron RPC endpoint URL or TronWeb instance
   * @example 'https://api.trongrid.io'
   */
  provider: string | TronWeb;

  /**
   * Gas-free service endpoint
   * @example 'https://gasfree.trongrid.io'
   */
  gasFreeProvider: string;

  /**
   * API key for gas-free provider
   */
  gasFreeApiKey: string;

  /**
   * API secret for gas-free provider
   */
  gasFreeApiSecret: string;

  /**
   * Service provider Tron address
   * @example 'T...'
   */
  serviceProvider: string;

  /**
   * Gas-free verifying contract address
   * @example 'T...'
   */
  verifyingContract: string;

  /**
   * Maximum fee for transfer operations (in token base units)
   * @optional
   * @example 10000000
   */
  transferMaxFee?: number | bigint;
}
```

### KeyPair
Account key pair information.

```typescript
interface KeyPair {
  /**
   * Public key as Uint8Array
   */
  publicKey: Uint8Array;

  /**
   * Private key as Uint8Array (sensitive data) — null on read-only accounts
   */
  privateKey: Uint8Array | null;
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
				<strong>WDK Tron Gasfree Wallet Usage</strong>
			</td>
			<td>Get started with WDK's Tron Gasfree Wallet Usage</td>
			<td>
				<a href="./usage.md">WDK Tron Gasfree Wallet Usage</a>
			</td>
		</tr>
        <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK Tron Gasfree Wallet Configuration</strong>
			</td>
			<td>Get started with WDK's Tron Gasfree Wallet Configuration</td>
			<td>
				<a href="./configuration.md">WDK Tron Gasfree Wallet Configuration</a>
			</td>
		</tr>
	</tbody>
</table>

***

### Need Help?

{% include "../../../.gitbook/includes/support-cards.md" %}


