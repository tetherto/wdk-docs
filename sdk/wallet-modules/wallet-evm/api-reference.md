---
title: Wallet EVM API Reference
description: Complete API documentation for @tetherto/wdk-wallet-evm
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
| [WalletManagerEvm](#walletmanagerevm) | Main class for managing EVM wallets. Extends `WalletManager` from `@tetherto/wdk-wallet`. | [Constructor](#constructor), [Methods](#methods) |
| [WalletAccountEvm](#walletaccountevm) | Individual EVM wallet account implementation. Extends `WalletAccountReadOnlyEvm` and implements `IWalletAccount` from `@tetherto/wdk-wallet`. | [Constructor](#constructor-1), [Methods](#methods-1), [Properties](#properties) |
| [WalletAccountReadOnlyEvm](#walletaccountreadonlyevm) | Read-only EVM wallet account. Extends `WalletAccountReadOnly` from `@tetherto/wdk-wallet`. | [Constructor](#constructor-2), [Methods](#methods-2) |

## WalletManagerEvm

The main class for managing EVM wallets.  
Extends `WalletManager` from `@tetherto/wdk-wallet`.



### Constructor

```javascript
new WalletManagerEvm(seed, config?)
```

**Parameters:**
- `seed` (string | Uint8Array): BIP-39 mnemonic seed phrase or seed bytes
- `config` (object, optional): Configuration object
  - `provider` (string | Eip1193Provider, optional): RPC endpoint URL or EIP-1193 provider instance
  - `transferMaxFee` (number, optional): Maximum fee amount for transfer operations (in wei)

**Example:**
```javascript
const wallet = new WalletManagerEvm(seedPhrase, {
  provider: 'https://rpc.mevblocker.io/fast',
  transferMaxFee: 100000000000000 // Maximum fee in wei
})
```

### Methods

| Method | Description | Returns | Throws |
|--------|-------------|---------|--------|
| `getAccount(index?)` | Returns a wallet account at the specified index | `Promise<WalletAccountEvm>` | - |
| `getAccountByPath(path)` | Returns a wallet account at the specified BIP-44 derivation path | `Promise<WalletAccountEvm>` | - |
| `getFeeRates()` | Returns current fee rates for transactions | `Promise<{normal: number, fast: number}>` | If no provider is set |
| `dispose()` | Disposes all wallet accounts, clearing private keys from memory | `void` | - |

#### `getAccount(index?)`
Returns a wallet account at the specified index following BIP-44 standard.

**Parameters:**
- `index` (number, optional): The index of the account to get (default: 0)

**Returns:** `Promise<WalletAccountEvm>` - The wallet account

**Example:**
```javascript
// Get first account (index 0)
const account = await wallet.getAccount(0)

// Get second account (index 1) 
const account1 = await wallet.getAccount(1)

// Get first account (default)
const defaultAccount = await wallet.getAccount()
```

#### `getAccountByPath(path)`
Returns a wallet account at the specified BIP-44 derivation path.

**Parameters:**
- `path` (string): The derivation path (e.g., "0'/0/0")

**Returns:** `Promise<WalletAccountEvm>` - The wallet account

**Example:**
```javascript
// Full path: m/44'/60'/0'/0/1
const account = await wallet.getAccountByPath("0'/0/1")

// Custom path: m/44'/60'/0'/0/5
const customAccount = await wallet.getAccountByPath("0'/0/5")
```

#### `getFeeRates()`
Returns current fee rates based on network conditions with predefined multipliers.

**Returns:** `Promise<{normal: number, fast: number}>` - Fee rates in wei
- `normal`: Base fee × 1.1 (10% above base)
- `fast`: Base fee × 2.0 (100% above base)

**Throws:** Error if no provider is configured

**Example:**
```javascript
const feeRates = await wallet.getFeeRates()
console.log('Normal fee rate:', feeRates.normal, 'wei')
console.log('Fast fee rate:', feeRates.fast, 'wei')

// Use in transaction
const result = await account.sendTransaction({
  to: '0x...',
  value: 1000000000000000000n,
  maxFeePerGas: feeRates.fast
})
```

#### `dispose()`
Disposes all wallet accounts, clearing private keys from memory.

**Example:**
```javascript
// Clean up when done
wallet.dispose()
```

## WalletAccountEvm

Represents an individual wallet account. Implements `IWalletAccount` from `@tetherto/wdk-wallet`.

### Constants

```javascript
const BIP_44_ETH_DERIVATION_PATH_PREFIX = "m/44'/60'"
```

### Constructor

```javascript
new WalletAccountEvm(seed, path, config?)
```

**Parameters:**
- `seed` (string | Uint8Array): BIP-39 mnemonic seed phrase or seed bytes
- `path` (string): BIP-44 derivation path (e.g., "0'/0/0")
- `config` (object, optional): Configuration object
  - `provider` (string | Eip1193Provider, optional): RPC endpoint URL or EIP-1193 provider instance
  - `transferMaxFee` (number, optional): Maximum fee amount for transfer operations (in wei)

**Throws:**
- Error if seed phrase is invalid (BIP-39 validation fails)

**Example:**
```javascript
const account = new WalletAccountEvm(seedPhrase, "0'/0/0", {
  provider: 'https://rpc.mevblocker.io/fast',
  transferMaxFee: 100000000000000
})
```

### Methods

| Method | Description | Returns | Throws |
|--------|-------------|---------|--------|
| `getAddress()` | Returns the account's address | `Promise<string>` | - |
| `sign(message)` | Signs a message using the account's private key | `Promise<string>` | - |
| `verify(message, signature)` | Verifies a message signature | `Promise<boolean>` | - |
| `sendTransaction(tx)` | Sends an EVM transaction | `Promise<{hash: string, fee: number}>` | If no provider |
| `quoteSendTransaction(tx)` | Estimates the fee for an EVM transaction | `Promise<{fee: number}>` | If no provider |
| `transfer(options)` | Transfers ERC20 tokens to another address | `Promise<{hash: string, fee: number}>` | If no provider or fee exceeds max |
| `quoteTransfer(options)` | Estimates the fee for an ERC20 transfer | `Promise<{fee: number}>` | If no provider |
| `getBalance()` | Returns the native token balance (in wei) | `Promise<bigint>` | If no provider |
| `getTokenBalance(tokenAddress)` | Returns the balance of a specific ERC20 token | `Promise<bigint>` | If no provider |
| `approve(options)` | Approves a spender to spend tokens | `Promise<{hash: string, fee: number}>` | If no provider |
| `toReadOnlyAccount()` | Returns a read-only copy of the account | `Promise<WalletAccountReadOnlyEvm>` | - |
| `dispose()` | Disposes the wallet account, clearing private keys from memory | `void` | - |

#### `getAddress()`
Returns the account's Ethereum address.

**Returns:** `Promise<string>` - Checksummed Ethereum address

**Example:**
```javascript
const address = await account.getAddress()
console.log('Account address:', address) // 0x...
```

#### `sign(message)`
Signs a message using the account's private key.

**Parameters:**
- `message` (string): The message to sign

**Returns:** `Promise<string>` - The message signature

**Example:**
```javascript
const message = 'Hello, Ethereum!'
const signature = await account.sign(message)
console.log('Signature:', signature)
```

#### `verify(message, signature)`
Verifies a message signature against the account's address.

**Parameters:**
- `message` (string): The original message
- `signature` (string): The signature to verify

**Returns:** `Promise<boolean>` - True if signature is valid

**Example:**
```javascript
const message = 'Hello, Ethereum!'
const signature = await account.sign(message)
const isValid = await account.verify(message, signature)
console.log('Signature valid:', isValid) // true
```

#### `sendTransaction(tx)`
Sends an EVM transaction and returns the result with hash and fee.

**Parameters:**
- `tx` (EvmTransaction): The transaction object
  - `to` (string): Recipient address
  - `value` (number): Amount in wei
  - `data` (string, optional): Transaction data in hex format
  - `gasLimit` (number, optional): Maximum gas units
  - `gasPrice` (number, optional): Legacy gas price in wei
  - `maxFeePerGas` (number, optional): EIP-1559 max fee per gas in wei
  - `maxPriorityFeePerGas` (number, optional): EIP-1559 max priority fee per gas in wei

**Returns:** `Promise<{hash: string, fee: number}>` - Transaction result

**Throws:** Error if no provider is configured

**Example:**
```javascript
// EIP-1559 transaction
const result = await account.sendTransaction({
  to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  value: 1000000000000000000, // 1 ETH in wei
  maxFeePerGas: 30000000000,
  maxPriorityFeePerGas: 2000000000
})

// Legacy transaction
const legacyResult = await account.sendTransaction({
  to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  value: 1000000000000000000,
  gasPrice: 20000000000,
  gasLimit: 21000
})

console.log('Transaction hash:', result.hash)
console.log('Transaction fee:', result.fee, 'wei')
```

#### `quoteSendTransaction(tx)`
Estimates the fee for an EVM transaction without sending it.

**Parameters:**
- `tx` (EvmTransaction): The transaction object (same format as sendTransaction)

**Returns:** `Promise<{fee: number}>` - Fee estimate in wei

**Throws:** Error if no provider is configured

**Example:**
```javascript
const quote = await account.quoteSendTransaction({
  to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  value: 1000000000000000000
})
console.log('Estimated fee:', quote.fee, 'wei')
```

#### `transfer(options)`
Transfers ERC20 tokens to another address using the standard transfer function.

**Parameters:**
- `options` (TransferOptions): Transfer options
  - `token` (string): Token contract address
  - `recipient` (string): Recipient address
  - `amount` (number | bigint): Amount in token base units

**Returns:** `Promise<{hash: string, fee: number}>` - Transfer result

**Throws:** 
- Error if no provider is configured
- Error if fee exceeds `transferMaxFee` (if configured)

**Example:**
```javascript
const result = await account.transfer({
  token: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USD₮
  recipient: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  amount: 1000000 // 1 USD₮ (6 decimals)
})
console.log('Transfer hash:', result.hash)
console.log('Transfer fee:', result.fee, 'wei')
```

#### `approve(options)`
Approves a specific amount of tokens to a spender.

**Parameters:**
- `options` (ApproveOptions): Approve options
  - `token` (string): Token contract address
  - `spender` (string): Spender address
  - `amount` (number | bigint): Amount to approve

**Returns:** `Promise<{hash: string, fee: number}>` - Transaction result

**Throws:** 
- Error if no provider is configured
- Error if trying to re-approve USDT on Ethereum without resetting to 0 first

**Example:**
```javascript
const result = await account.approve({
  token: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
  spender: '0xSpenderAddress...',
  amount: 1000000n
})
console.log('Approve hash:', result.hash)
```

#### `quoteTransfer(options)`
Estimates the fee for an ERC20 token transfer.

**Parameters:**
- `options` (TransferOptions): Transfer options (same as transfer)

**Returns:** `Promise<{fee: number}>` - Fee estimate in wei

**Throws:** Error if no provider is configured

**Example:**
```javascript
const quote = await account.quoteTransfer({
  token: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  recipient: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  amount: 1000000
})
console.log('Transfer fee estimate:', quote.fee, 'wei')
```

#### `getBalance()`
Returns the native token balance (ETH, MATIC, BNB, etc.).

**Returns:** `Promise<bigint>` - Balance in wei

**Throws:** Error if no provider is configured

**Example:**
```javascript
const balance = await account.getBalance()
console.log('Balance:', balance, 'wei')
console.log('Balance in ETH:', balance / 1000000000000000000)
```

#### `getTokenBalance(tokenAddress)`
Returns the balance of a specific ERC20 token using the balanceOf function.

**Parameters:**
- `tokenAddress` (string): The ERC20 token contract address

**Returns:** `Promise<bigint>` - Token balance in base units

**Throws:** Error if no provider is configured

**Example:**
```javascript
// Get USD₮ balance
const usdtBalance = await account.getTokenBalance('0xdAC17F958D2ee523a2206206994597C13D831ec7')
console.log('USDT balance:', usdtBalance) // In 6 decimal places
console.log('USDT balance formatted:', usdtBalance / 1000000, 'USDT')
```

#### `toReadOnlyAccount()`
Creates a read-only copy of the account with the same configuration.

**Returns:** `Promise<WalletAccountReadOnlyEvm>` - Read-only account instance

**Example:**
```javascript
const readOnlyAccount = await account.toReadOnlyAccount()

// Can check balances but cannot send transactions
const balance = await readOnlyAccount.getBalance()
// readOnlyAccount.sendTransaction() // Would throw error
```

#### `dispose()`
Disposes the wallet account, erasing the private key from memory.

**Example:**
```javascript
// Clean up when done
account.dispose()
```

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `index` | `number` | The derivation path's index of this account |
| `path` | `string` | The full BIP-44 derivation path of this account |
| `keyPair` | `{privateKey: Buffer, publicKey: Buffer}` | The account's key pair (⚠️ Contains sensitive data) |

**Example:**
```javascript
console.log('Account index:', account.index) // 0, 1, 2, etc.
console.log('Account path:', account.path) // m/44'/60'/0'/0/0

// ⚠️ SENSITIVE: Handle with care
const { privateKey, publicKey } = account.keyPair
console.log('Public key length:', publicKey.length) // 65 bytes
console.log('Private key length:', privateKey.length) // 32 bytes
```

⚠️ **Security Note**: The `keyPair` property contains sensitive cryptographic material. Never log, display, or expose the private key.

## WalletAccountReadOnlyEvm

Represents a read-only wallet account that can query balances and estimate fees but cannot send transactions.

### Constructor

```javascript
new WalletAccountReadOnlyEvm(address, config?)
```

**Parameters:**
- `address` (string): The account's Ethereum address
- `config` (object, optional): Configuration object
  - `provider` (string | Eip1193Provider, optional): RPC endpoint URL or EIP-1193 provider instance

**Example:**
```javascript
const readOnlyAccount = new WalletAccountReadOnlyEvm('0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', {
  provider: 'https://rpc.mevblocker.io/fast'
})
```

### Methods

| Method | Description | Returns | Throws |
|--------|-------------|---------|--------|
| `getBalance()` | Returns the native token balance (in wei) | `Promise<bigint>` | If no provider |
| `getTokenBalance(tokenAddress)` | Returns the balance of a specific ERC20 token | `Promise<bigint>` | If no provider |
| `quoteSendTransaction(tx)` | Estimates the fee for an EVM transaction | `Promise<{fee: number}>` | If no provider |
| `quoteTransfer(options)` | Estimates the fee for an ERC20 transfer | `Promise<{fee: number}>` | If no provider |
| `verify(message, signature)` | Verifies a message signature | `Promise<boolean>` | - |
| `getTransactionReceipt(hash)` | Returns a transaction's receipt | `Promise<EvmTransactionReceipt \| null>` | If no provider |
| `getAllowance(token, spender)` | Returns current allowance for a spender | `Promise<bigint>` | If no provider |

#### `verify(message, signature)`
Verifies a message signature against the account's address.

**Parameters:**
- `message` (string): The original message
- `signature` (string): The signature to verify

**Returns:** `Promise<boolean>` - True if signature is valid

**Example:**
```javascript
const message = 'Hello, Ethereum!'
const signature = await account.sign(message)

const readOnlyAccount = new WalletAccountReadOnlyEvm('0x...', { provider: '...' })
const isValid = await readOnlyAccount.verify(message, signature)
console.log('Signature valid:', isValid) // true
```

#### `getBalance()`
Returns the account's native token balance.

**Returns:** `Promise<bigint>` - Balance in wei

**Throws:** Error if no provider is configured

**Example:**
```javascript
const balance = await readOnlyAccount.getBalance()
console.log('Balance:', balance, 'wei')
```

#### `getTokenBalance(tokenAddress)`
Returns the balance of a specific ERC20 token.

**Parameters:**
- `tokenAddress` (string): The ERC20 token contract address

**Returns:** `Promise<bigint>` - Token balance in base units

**Throws:** Error if no provider is configured

**Example:**
```javascript
const tokenBalance = await readOnlyAccount.getTokenBalance('0xdAC17F958D2ee523a2206206994597C13D831ec7')
console.log('USDT balance:', tokenBalance)
```

#### `quoteSendTransaction(tx)`
Estimates the fee for an EVM transaction.

**Parameters:**
- `tx` (EvmTransaction): The transaction object

**Returns:** `Promise<{fee: number}>` - Fee estimate in wei

**Throws:** Error if no provider is configured

**Example:**
```javascript
const quote = await readOnlyAccount.quoteSendTransaction({
  to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  value: 1000000000000000000
})
console.log('Estimated fee:', quote.fee, 'wei')
```

#### `quoteTransfer(options)`
Estimates the fee for an ERC20 token transfer.

**Parameters:**
- `options` (TransferOptions): Transfer options

**Returns:** `Promise<{fee: number}>` - Fee estimate in wei

**Throws:** Error if no provider is configured

**Example:**
```javascript
const quote = await readOnlyAccount.quoteTransfer({
  token: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  recipient: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  amount: 1000000
})
console.log('Transfer fee estimate:', quote.fee, 'wei')
```

#### `getTransactionReceipt(hash)`
Returns a transaction's receipt if it has been mined.

**Parameters:**
- `hash` (string): The transaction hash

**Returns:** `Promise<EvmTransactionReceipt | null>` - Transaction receipt or null if not yet mined

**Throws:** Error if no provider is configured

**Example:**
```javascript
const receipt = await readOnlyAccount.getTransactionReceipt('0x...')
if (receipt) {
  console.log('Transaction confirmed in block:', receipt.blockNumber)
  console.log('Gas used:', receipt.gasUsed)
  console.log('Status:', receipt.status) // 1 = success, 0 = failed
} else {
  console.log('Transaction not yet mined')
}
```

#### `getAllowance(token, spender)`
Returns the current allowance for the given token and spender.

**Parameters:**
- `token` (string): The token's address
- `spender` (string): The spender's address

**Returns:** `Promise<bigint>` - The allowance

**Example:**
```javascript
const allowance = await readOnlyAccount.getAllowance(
  '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  '0xSpenderAddress...'
)
console.log('Allowance:', allowance)
```

This comprehensive API Reference now includes all methods from the source code with detailed descriptions, parameters, return types, error conditions, and practical examples.

## Types

### EvmTransaction

```typescript
interface EvmTransaction {
  to: string;                        // The transaction's recipient address
  value: number;                     // The amount of ethers to send (in wei)
  data?: string;                     // The transaction's data in hex format (optional)
  gasLimit?: number;                 // Maximum amount of gas this transaction can use (optional)
  gasPrice?: number;                 // Legacy gas price in wei (optional)
  maxFeePerGas?: number;            // EIP-1559 max fee per gas in wei (optional)
  maxPriorityFeePerGas?: number;    // EIP-1559 priority fee in wei (optional)
}
```

### TransferOptions

```typescript
interface TransferOptions {
  token: string;                     // ERC20 token contract address
  recipient: string;                 // Recipient's Ethereum address
  amount: number | bigint;           // Amount in token's base units
}
```

### TransactionResult

```typescript
interface TransactionResult {
  hash: string;                      // Transaction hash
  fee: number;                       // Transaction fee paid in wei
}
```

### TransferResult

```typescript
interface TransferResult {
  hash: string;                      // Transfer transaction hash
  fee: number;                       // Transfer fee paid in wei
}
```

### FeeRates

```typescript
interface FeeRates {
  normal: number;                    // Normal priority fee rate (base fee × 1.1)
  fast: number;                      // Fast priority fee rate (base fee × 2.0)
}
```

### KeyPair

```typescript
interface KeyPair {
  privateKey: Buffer;                // Private key as Buffer (32 bytes)
  publicKey: Buffer;                 // Public key as Buffer (65 bytes)
}
```

### EvmWalletConfig

```typescript
interface EvmWalletConfig {
  provider?: string | Eip1193Provider;  // RPC URL or EIP-1193 provider instance
  transferMaxFee?: number;              // Maximum fee for transfers in wei
}
```

### EvmTransactionReceipt

```typescript
interface EvmTransactionReceipt {
  to: string;                        // Recipient address
  from: string;                      // Sender address
  contractAddress: string | null;    // Contract address if contract creation
  transactionIndex: number;          // Transaction index in block
  gasUsed: bigint;                   // Gas actually used
  logsBloom: string;                 // Bloom filter for logs
  blockHash: string;                 // Block hash containing transaction
  transactionHash: string;           // Transaction hash
  logs: Array<Log>;                  // Event logs
  blockNumber: number;               // Block number
  confirmations: number;             // Number of confirmations
  cumulativeGasUsed: bigint;         // Cumulative gas used in block
  effectiveGasPrice: bigint;         // Effective gas price paid
  status: number;                    // Transaction status (1 = success, 0 = failed)
  type: number;                      // Transaction type (0 = legacy, 2 = EIP-1559)
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
				<strong>WDK EVM Wallet Usage</strong>
			</td>
			<td>Get started with WDK's EVM Wallet Usage</td>
			<td>
				<a href="./usage.md">WDK EVM Wallet Usage</a>
			</td>
		</tr>
        <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK EVM Wallet Configuration</strong>
			</td>
			<td>Get started with WDK's EVM Wallet Configuration</td>
			<td>
				<a href="./configuration.md">WDK EVM Wallet Configuration</a>
			</td>
		</tr>
	</tbody>
</table>

***

### Need Help?

{% include "../../../.gitbook/includes/support-cards.md" %}
