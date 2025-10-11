---
title: Wallet EVM ERC-4337 API Reference
description: Complete API documentation for @tetherto/wdk-wallet-evm-erc-4337
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
| [WalletManagerEvmErc4337](#walletmanagerevmerc4337) | Main class for managing ERC-4337 EVM wallets. Extends `WalletManager` from `@tetherto/wdk-wallet`. | [Constructor](#constructor), [Methods](#methods) |
| [WalletAccountEvmErc4337](#walletaccountevmerc4337) | Individual ERC-4337 wallet account implementation. Extends `WalletAccountReadOnlyEvmErc4337` and implements `IWalletAccount`. | [Constructor](#constructor-1), [Methods](#methods-1), [Properties](#properties) |
| [WalletAccountReadOnlyEvmErc4337](#walletaccountreadonlyevmerc4337) | Read-only ERC-4337 wallet account. Extends `WalletAccountReadOnly` from `@tetherto/wdk-wallet`. | [Constructor](#constructor-2), [Methods](#methods-2) |


## WalletManagerEvmErc4337

The main class for managing ERC-4337 EVM wallets. Extends `WalletManager` from `@tetherto/wdk-wallet`.

### Fee Rate Constants

```javascript
const FEE_RATE_NORMAL_MULTIPLIER = 1.1
const FEE_RATE_FAST_MULTIPLIER = 2.0
```

### Constructor

```javascript
new WalletManagerEvmErc4337(seed, config)
```

**Parameters:**
- `seed` (string | Uint8Array): BIP-39 mnemonic seed phrase or seed bytes
- `config` (EvmErc4337WalletConfig, optional): Configuration object
  - `chainId` (number): The blockchain's ID (e.g., 1 for Ethereum mainnet)
  - `provider` (string | Eip1193Provider, optional): RPC endpoint URL or EIP-1193 provider instance
  - `bundlerUrl` (string): The URL of the bundler service
  - `paymasterUrl` (string): The URL of the paymaster service
  - `paymasterAddress` (string): The address of the paymaster smart contract
  - `entryPointAddress` (string): The address of the entry point smart contract
  - `safeModulesVersion` (string): The Safe modules version
  - `paymasterToken` (object): The paymaster token configuration
    - `address` (string): The address of the paymaster token
  - `transferMaxFee` (number, optional): Maximum fee amount for transfer operations

**Example:**
```javascript
const wallet = new WalletManagerEvmErc4337(seedPhrase, {
  chainId: 1, // Ethereum mainnet
  provider: 'https://rpc.mevblocker.io/fast',
  bundlerUrl: 'https://api.candide.dev/public/v3/ethereum',
  paymasterUrl: 'https://api.candide.dev/public/v3/ethereum',
  paymasterAddress: '0x8b1f6cb5d062aa2ce8d581942bbb960420d875ba',
  entryPointAddress: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
  safeModulesVersion: '1.0.0',
  paymasterToken: {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7'
  }
  transferMaxFee: 100000 // Optional: Maximum fee in paymaster token units
})
```

### Methods

| Method | Description | Returns | Throws |
|--------|-------------|---------|--------|
| `getAccount(index?)` | Returns a wallet account at the specified index | `Promise<WalletAccountEvmErc4337>` | - |
| `getAccountByPath(path)` | Returns a wallet account at the specified BIP-44 derivation path | `Promise<WalletAccountEvmErc4337>` | - |
| `getFeeRates()` | Returns current fee rates for transactions | `Promise<{normal: number, fast: number}>` | If no provider |
| `dispose()` | Disposes all wallet accounts, clearing private keys from memory | `void` | - |


#### `getAccount(index)`
Returns a wallet account at the specified index using BIP-44 derivation.

**Parameters:**
- `index` (number, optional): The index of the account to get (default: 0)

**Returns:** `Promise<WalletAccountEvmErc4337>` - The wallet account

**Example:**
```javascript
// Get first account (index 0)
const account = await wallet.getAccount(0)

// Get default account
const defaultAccount = await wallet.getAccount()
```

#### `getAccountByPath(path)`
Returns a wallet account at the specified BIP-44 derivation path.

**Parameters:**
- `path` (string): The derivation path (e.g., "0'/0/0")

**Returns:** `Promise<WalletAccountEvmErc4337>` - The wallet account

**Example:**
```javascript
// Full derivation path: m/44'/60'/0'/0/1
const account = await wallet.getAccountByPath("0'/0/1")
```

##### `getFeeRates()`
Returns current fee rates with ERC-4337 specific multipliers.

**Returns:** `Promise<{normal: number, fast: number}>` - Fee rates in wei

**Throws:** Error if no provider is configured

**Example:**
```javascript
const feeRates = await wallet.getFeeRates()
console.log('Normal fee rate:', feeRates.normal, 'wei') // base fee × 1.1
console.log('Fast fee rate:', feeRates.fast, 'wei')     // base fee × 2.0
```

##### `dispose()`
Disposes all wallet accounts, clearing private keys from memory.

**Example:**
```javascript
// Clean up when done
wallet.dispose()
```

## WalletAccountEvmErc4337

Represents an individual ERC-4337 wallet account. Extends `WalletAccountReadOnlyEvmErc4337` and implements `IWalletAccount`.

### Constants

```javascript
const SALT_NONCE = '0x69b348339eea4ed93f9d11931c3b894c8f9d8c7663a053024b11cb7eb4e5a1f6'
const FEE_TOLERANCE_COEFFICIENT = 1.2
```

### Constructor

```javascript
new WalletAccountEvmErc4337(seed, path, config)
```

**Parameters:**
- `seed` (string | Uint8Array): BIP-39 mnemonic seed phrase or seed bytes
- `path` (string): BIP-44 derivation path (e.g., "0'/0/0")
- `config` (EvmErc4337WalletConfig): Configuration object (same as WalletManagerEvmErc4337)


**Example:**
```javascript
const account = new WalletAccountEvmErc4337(seedPhrase, "0'/0/0", {
  chainId: 1, // Ethereum mainnet
  provider: 'https://rpc.mevblocker.io/fast',
  bundlerUrl: 'https://api.candide.dev/public/v3/ethereum',
  paymasterUrl: 'https://api.candide.dev/public/v3/ethereum',
  paymasterAddress: '0x8b1f6cb5d062aa2ce8d581942bbb960420d875ba',
  entryPointAddress: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
  safeModulesVersion: '1.0.0',
  paymasterToken: {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7'
  }
})
```

### Methods

### Methods

| Method | Description | Returns | Throws |
|--------|-------------|---------|--------|
| `getAddress()` | Returns the Safe account's address | `Promise<string>` | - |
| `sign(message)` | Signs a message using the account's private key | `Promise<string>` | - |
| `verify(message, signature)` | Verifies a message signature | `Promise<boolean>` | - |
| `sendTransaction(tx, config?)` | Sends a gasless transaction via UserOperation | `Promise<{hash: string, fee: number}>` | If fee exceeds max |
| `quoteSendTransaction(tx, config?)` | Estimates the fee for a UserOperation | `Promise<{fee: number}>` | - |
| `transfer(options, config?)` | Transfers ERC20 tokens via UserOperation | `Promise<{hash: string, fee: number}>` | If fee exceeds max |
| `quoteTransfer(options, config?)` | Estimates the fee for an ERC20 transfer | `Promise<{fee: number}>` | - |
| `getBalance()` | Returns the native token balance (in wei) | `Promise<number>` | - |
| `getTokenBalance(tokenAddress)` | Returns the balance of a specific ERC20 token | `Promise<number>` | - |
| `getPaymasterTokenBalance()` | Returns the paymaster token balance | `Promise<number>` | - |
| `toReadOnlyAccount()` | Returns a read-only copy of the account | `Promise<WalletAccountReadOnlyEvmErc4337>` | - |
| `dispose()` | Disposes the wallet account, clearing private keys from memory | `void` | - |

##### `getAddress()`
Returns the Safe smart contract wallet address (not the underlying EOA address).

**Returns:** `Promise<string>` - The Safe account's address

**Example:**
```javascript
const address = await account.getAddress()
console.log('Safe account address:', address) // 0x... (Smart contract address)
```

##### `sign(message)`
Signs a message using the underlying EOA private key.

**Parameters:**
- `message` (string): The message to sign

**Returns:** `Promise<string>` - The message signature

**Example:**
```javascript
const message = 'Hello, ERC-4337!'
const signature = await account.sign(message)
console.log('Signature:', signature)
```

##### `verify(message, signature)`
Verifies a message signature against the underlying EOA address.

**Parameters:**
- `message` (string): The original message
- `signature` (string): The signature to verify

**Returns:** `Promise<boolean>` - True if signature is valid

**Example:**
```javascript
const isValid = await account.verify(message, signature)
console.log('Signature valid:', isValid)
```

##### `sendTransaction(tx, config?)`
Sends a gasless transaction via UserOperation through the bundler.

**Parameters:**
- `tx` (EvmTransaction | EvmTransaction[]): Transaction object or array for batch transactions
  - `to` (string): Recipient address
  - `value` (number): Amount in wei
  - `data` (string, optional): Transaction data in hex format
- `config` (optional object): Override configuration
  - `paymasterToken` (object): Override paymaster token

**Returns:** `Promise<{hash: string, fee: number}>` - UserOperation hash and fee in paymaster token units

**Throws:** Error if fee exceeds `transferMaxFee`

**Example:**
```javascript
// Single transaction
const result = await account.sendTransaction({
  to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  value: 1000000000000000000, // 1 ETH
  data: '0x'
})
console.log('UserOperation hash:', result.hash)
console.log('Fee paid (paymaster token units):', result.fee)

// Batch transactions
const batchResult = await account.sendTransaction([
  { to: '0x...', value: 100000000000000000 },
  { to: '0x...', value: 200000000000000000 }
])

// With custom paymaster token
const customResult = await account.sendTransaction({
  to: '0x...',
  value: 1000000000000000000
}, {
  paymasterToken: { address: '0x...' }
})
```

##### `quoteSendTransaction(tx, config?)`
Estimates the fee for a UserOperation without sending it.

**Parameters:**
- `tx` (EvmTransaction | EvmTransaction[]): Transaction object or array (same as sendTransaction)
- `config` (optional object): Override configuration (same as sendTransaction)

**Returns:** `Promise<{fee: number}>` - Fee estimate in paymaster token units

**Example:**
```javascript
const quote = await account.quoteSendTransaction({
  to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  value: 1000000000000000000
})
console.log('Estimated fee (paymaster token units):', quote.fee)
```

##### `transfer(options, config?)`
Transfers ERC20 tokens via UserOperation with gasless execution.

**Parameters:**
- `options` (TransferOptions): Transfer options
  - `token` (string): ERC20 token contract address
  - `recipient` (string): Recipient address
  - `amount` (number | bigint): Amount in token base units
- `config` (optional object): Override configuration
  - `paymasterToken` (object): Override paymaster token
  - `transferMaxFee` (number): Override maximum fee limit

**Returns:** `Promise<{hash: string, fee: number}>` - UserOperation hash and fee in paymaster token units

**Throws:** 
- Error if fee exceeds `transferMaxFee`
- Error if insufficient paymaster token balance

**Example:**
```javascript
const result = await account.transfer({
  token: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
  recipient: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  amount: 1000000 // 1 USDT (6 decimals)
}, {
  transferMaxFee: 50000 // Max 50,000 paymaster token units
})
console.log('Transfer hash:', result.hash)
console.log('Transfer fee:', result.fee, 'paymaster token units')
```

##### `quoteTransfer(options, config?)`
Estimates the fee for an ERC20 token transfer.

**Parameters:**
- `options` (TransferOptions): Transfer options (same as transfer)
- `config` (optional object): Override configuration (same as transfer)

**Returns:** `Promise<{fee: number}>` - Fee estimate in paymaster token units

**Example:**
```javascript
const quote = await account.quoteTransfer({
  token: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  recipient: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  amount: 1000000
})
console.log('Transfer fee estimate:', quote.fee, 'paymaster token units')
```

##### `getBalance()`
Returns the Safe account's native token balance.

**Returns:** `Promise<number>` - Balance in wei

**Example:**
```javascript
const balance = await account.getBalance()
console.log('Native balance:', balance, 'wei')
```

##### `getTokenBalance(tokenAddress)`
Returns the balance of a specific ERC20 token in the Safe account.

**Parameters:**
- `tokenAddress` (string): The ERC20 token contract address

**Returns:** `Promise<number>` - Token balance in base units

**Example:**
```javascript
const tokenBalance = await account.getTokenBalance('0xdAC17F958D2ee523a2206206994597C13D831ec7')
console.log('USDT balance:', tokenBalance) // In 6 decimal units
```

##### `getPaymasterTokenBalance()`
Returns the balance of the configured paymaster token used for paying fees.

**Returns:** `Promise<number>` - Paymaster token balance in base units

**Example:**
```javascript
const paymasterBalance = await account.getPaymasterTokenBalance()
console.log('Paymaster token balance:', paymasterBalance)

// Check if sufficient for transaction
if (paymasterBalance < 10000) {
  console.warn('Low paymaster token balance - may not cover fees')
}
```

##### `toReadOnlyAccount()`
Creates a read-only copy of the account with the same Safe address and configuration.

**Returns:** `Promise<WalletAccountReadOnlyEvmErc4337>` - Read-only account instance

**Example:**
```javascript
const readOnlyAccount = await account.toReadOnlyAccount()

// Can check balances but cannot send transactions
const balance = await readOnlyAccount.getBalance()
// readOnlyAccount.sendTransaction() // Would not be available
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

## WalletAccountReadOnlyEvmErc4337
Represents a read-only ERC-4337 wallet account that can query balances and estimate fees but cannot send transactions.

### Constructor

```javascript
new WalletAccountReadOnlyEvmErc4337(address, config)
```

**Parameters:**
- `address` (string): The EOA address (owner address)
- `config` (Omit<EvmErc4337WalletConfig, 'transferMaxFee'>): Configuration object without transferMaxFee

**Example:**
```javascript
const readOnlyAccount = new WalletAccountReadOnlyEvmErc4337('0x...', {
  chainId: 1,
  provider: 'https://rpc.mevblocker.io/fast',
  bundlerUrl: 'https://api.candide.dev/public/v3/ethereum',
  paymasterUrl: 'https://api.candide.dev/public/v3/ethereum',
  paymasterAddress: '0x8b1f6cb5d062aa2ce8d581942bbb960420d875ba',
  entryPointAddress: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
  safeModulesVersion: '1.0.0',
  paymasterToken: {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7'
  }
})
```

### Methods

| Method | Description | Returns | Throws |
|--------|-------------|---------|--------|
| `getAddress()` | Returns the Safe account's address | `Promise<string>` | - |
| `getBalance()` | Returns the native token balance (in wei) | `Promise<number>` | - |
| `getTokenBalance(tokenAddress)` | Returns the balance of a specific ERC20 token | `Promise<number>` | - |
| `getPaymasterTokenBalance()` | Returns the paymaster token balance | `Promise<number>` | - |
| `quoteSendTransaction(tx, config?)` | Estimates the fee for a UserOperation | `Promise<{fee: number}>` | If simulation fails |
| `quoteTransfer(options, config?)` | Estimates the fee for an ERC20 transfer | `Promise<{fee: number}>` | If simulation fails |
| `getTransactionReceipt(hash)` | Returns a transaction's receipt by UserOperation hash | `Promise<EvmTransactionReceipt \| null>` | - |

##### `getAddress()`
Returns the Safe smart contract wallet address.

**Returns:** `Promise<string>` - The Safe account's address

**Example:**
```javascript
const address = await readOnlyAccount.getAddress()
console.log('Safe address:', address)
```
##### `getBalance()`
Returns the Safe account's native token balance.

**Returns:** `Promise<number>` - Balance in wei

**Example:**
```javascript
const balance = await readOnlyAccount.getBalance()
console.log('Balance:', balance, 'wei')
```

##### `getTokenBalance(tokenAddress)`
Returns the balance of a specific ERC20 token.

**Parameters:**
- `tokenAddress` (string): The ERC20 token contract address

**Returns:** `Promise<number>` - Token balance in base units

**Example:**
```javascript
const tokenBalance = await readOnlyAccount.getTokenBalance('0xdAC17F958D2ee523a2206206994597C13D831ec7')
console.log('USDT balance:', tokenBalance)
```

##### `getPaymasterTokenBalance()`
Returns the balance of the configured paymaster token.

**Returns:** `Promise<number>` - Paymaster token balance in base units

**Example:**
```javascript
const paymasterBalance = await readOnlyAccount.getPaymasterTokenBalance()
console.log('Paymaster token balance:', paymasterBalance)
```

##### `quoteSendTransaction(tx, config?)`
Estimates the fee for a UserOperation.

**Parameters:**
- `tx` (EvmTransaction | EvmTransaction[]): Transaction object or array
- `config` (optional object): Override paymaster token

**Returns:** `Promise<{fee: number}>` - Fee estimate in paymaster token units

**Throws:** Error if simulation fails or insufficient paymaster funds

**Example:**
```javascript
try {
  const quote = await readOnlyAccount.quoteSendTransaction({
    to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    value: 1000000000000000000
  })
  console.log('Estimated fee:', quote.fee, 'paymaster token units')
} catch (error) {
  if (error.message.includes('not enough funds')) {
    console.error('Insufficient paymaster token balance')
  }
}
```

##### `quoteTransfer(options, config?)`
Estimates the fee for an ERC20 token transfer.

**Parameters:**
- `options` (TransferOptions): Transfer options
- `config` (optional object): Override paymaster token

**Returns:** `Promise<{fee: number}>` - Fee estimate in paymaster token units

**Example:**
```javascript
const quote = await readOnlyAccount.quoteTransfer({
  token: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  recipient: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  amount: 1000000
})
console.log('Transfer fee estimate:', quote.fee, 'paymaster token units')
```

##### `getTransactionReceipt(hash)`
Returns a transaction's receipt by UserOperation hash.

**Parameters:**
- `hash` (string): The UserOperation hash

**Returns:** `Promise<EvmTransactionReceipt | null>` - Transaction receipt or null if not mined

**Example:**
```javascript
const receipt = await readOnlyAccount.getTransactionReceipt('0x...')
if (receipt) {
  console.log('Transaction confirmed in block:', receipt.blockNumber)
  console.log('Status:', receipt.status) // 1 = success, 0 = failed
} else {
  console.log('UserOperation not yet mined')
}
```

## Types

### EvmErc4337WalletConfig

```typescript
interface EvmErc4337WalletConfig {
  chainId: number;                          // Blockchain ID (required)
  provider: string | Eip1193Provider;       // RPC provider (required)
  bundlerUrl: string;                       // Bundler service URL (required)
  paymasterUrl: string;                     // Paymaster service URL (required)
  paymasterAddress: string;                 // Paymaster contract address (required)
  entryPointAddress: string;                // EntryPoint contract address (required)
  safeModulesVersion: string;               // Safe modules version (required)
  paymasterToken: {                         // Paymaster token config (required)
    address: string;                        // Token contract address
  };
  transferMaxFee?: number;                  // Maximum fee limit (optional)
}
```
### EvmTransaction

```typescript
interface EvmTransaction {
  to: string;                               // Recipient address
  value: number;                            // Amount in wei
  data?: string;                            // Transaction data (optional)
  gasLimit?: number;                        // Gas limit (optional)
  gasPrice?: number;                        // Legacy gas price (optional)
  maxFeePerGas?: number;                    // EIP-1559 max fee (optional)
  maxPriorityFeePerGas?: number;            // EIP-1559 priority fee (optional)
}
```
### TransferOptions

```typescript
interface TransferOptions {
  token: string;                            // ERC20 token contract address
  recipient: string;                        // Recipient address
  amount: number | bigint;                  // Amount in token base units
}
```

### TransactionResult

```typescript
interface TransactionResult {
  hash: string;                             // UserOperation hash
  fee: number;                              // Fee paid in paymaster token units
}
```

### TransferResult

```typescript
interface TransferResult {
  hash: string;                             // UserOperation hash
  fee: number;                              // Fee paid in paymaster token units
}
```

### Constants

```typescript
// ERC-4337 specific constants
const SALT_NONCE: string = '0x69b348339eea4ed93f9d11931c3b894c8f9d8c7663a053024b11cb7eb4e5a1f6';
const FEE_TOLERANCE_COEFFICIENT: number = 1.2;

// Fee rate multipliers (inherited from WalletManager)
const FEE_RATE_NORMAL_MULTIPLIER: number = 1.1;
const FEE_RATE_FAST_MULTIPLIER: number = 2.0;
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
				<strong>WDK EVM with ERC-4337 Wallet Usage</strong>
			</td>
			<td>Get started with WDK's EVM with ERC-4337 Wallet Usage</td>
			<td>
				<a href="./configuration.md">WDK EVM with ERC-4337 Wallet Usage</a>
			</td>
		</tr>
        <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK EVM with ERC-4337 Wallet Configuration</strong>
			</td>
			<td>Get started with WDK's EVM with ERC-4337 Wallet Configuration</td>
			<td>
				<a href="./configuration.md">WDK EVM with ERC-4337 Wallet Configuration</a>
			</td>
		</tr>
	</tbody>
</table>

***

### Need Help?

{% include "../../../.gitbook/includes/support-cards.md" %}
