---
title: Wallet EVM ERC-4337 API Reference
description: Complete API documentation for @wdk/wallet-evm-erc-4337
author: Matteo Giardino
lastReviewed: 2025-06-26
icon: code
---

# API Reference

## Table of Contents

| Class | Description | Methods |
|-------|-------------|---------|
| [WalletManagerEvmErc4337](#walletmanagerevm-erc-4337) | Main class for managing ERC-4337 EVM wallets | [Constructor](#constructor), [Methods](#methods), [Properties](#properties) |
| [WalletAccountEvmErc4337](#walletaccountevm-erc-4337) | Individual ERC-4337 wallet account implementation | [Constructor](#constructor-1), [Methods](#methods), [Properties](#properties-1) |

## WalletManagerEvmErc4337

The main class for managing ERC-4337 EVM wallets. Extends `WalletManagerEvm` from `@wdk/wallet-evm`.

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
  transferMaxFee: 5000000
})
```

### Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `getAccount(index)` | Returns a wallet account at the specified index | `Promise<WalletAccountEvmErc4337>` |
| `getAccountByPath(path)` | Returns a wallet account at the specified BIP-44 derivation path | `Promise<WalletAccountEvmErc4337>` |

#### `getAccount(index)`
Returns a wallet account at the specified index.

**Parameters:**
- `index` (number, optional): The index of the account to get (default: 0)

**Returns:** `Promise<WalletAccountEvmErc4337>` - The wallet account

**Example:**
```javascript
const account = await wallet.getAccount(0)
```

#### `getAccountByPath(path)`
Returns a wallet account at the specified BIP-44 derivation path.

**Parameters:**
- `path` (string): The derivation path (e.g., "0'/0/0")

**Returns:** `Promise<WalletAccountEvmErc4337>` - The wallet account

**Example:**
```javascript
const account = await wallet.getAccountByPath("0'/0/1")
```

### Properties

#### `seed`
The wallet's seed phrase.

**Type:** `string | Uint8Array`

**Example:**
```javascript
console.log('Seed phrase:', wallet.seed)
```

## WalletAccountEvmErc4337

Represents an individual ERC-4337 wallet account. Extends `WalletAccountEvm` from `@wdk/wallet-evm`.

### Constructor

```javascript
new WalletAccountEvmErc4337(seed, path, config)
```

**Parameters:**
- `seed` (string | Uint8Array): BIP-39 mnemonic seed phrase or seed bytes
- `path` (string): BIP-44 derivation path
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

| Method | Description | Returns |
|--------|-------------|---------|
| [`getAddress()`](#getaddress-1) | Returns the Safe account's address | `Promise<string>` |
| [`getPaymasterTokenBalance()`](#getpaymastertokenbalance) | Returns the paymaster token balance | `Promise<number>` |
| [`sendTransaction(tx, config)`](#sendtransactiontx-config) | Sends a gasless transaction | `Promise<TransactionResult>` |
| [`quoteSendTransaction(tx, config)`](#quotesendtransactiontx-config) | Estimates the fee for a gasless transaction | `Promise<{fee: number}>` |
| [`transfer(options, config)`](#transferoptions-config) | Transfers ERC-20 tokens using gasless transactions | `Promise<TransferResult>` |
| [`quoteTransfer(options, config)`](#quotetransferoptions-config) | Estimates the fee for a token transfer | `Promise<{fee: number}>` |
| [`getBalance()`](#getbalance-1) | Returns the native token balance | `Promise<bigint>` |
| [`getTokenBalance(tokenAddress)`](#gettokenbalancetokenaddress-1) | Returns the balance of a specific ERC-20 token | `Promise<bigint>` |
| [`dispose()`](#dispose-2) | Disposes the wallet account, clearing private keys from memory | `void` |

#### `getAddress()`
Returns the Safe account's address (different from the underlying EOA address).

**Returns:** `Promise<string>` - The Safe account's address

**Example:**
```javascript
const address = await account.getAddress()
console.log('Safe account address:', address)
```

#### `getPaymasterTokenBalance()`
Returns the balance of the configured paymaster token.

**Returns:** `Promise<number>` - The paymaster token balance in base units

**Example:**
```javascript
const balance = await account.getPaymasterTokenBalance()
console.log('Paymaster token balance:', balance)
```

#### `sendTransaction(tx, config)`
Sends a gasless transaction using ERC-4337 account abstraction.

**Parameters:**
- `tx` (EvmTransaction): The transaction object
  - `to` (string): Recipient address
  - `value` (number | bigint): Amount in wei
  - `data` (string, optional): Transaction data
- `config` (object, optional): Override configuration
  - `paymasterToken` (object, optional): Override paymaster token configuration

**Returns:** `Promise<TransactionResult>` - Object containing hash and fee

**Example:**
```javascript
const result = await account.sendTransaction({
  to: '0x...',
  value: 1000000000000000000n, // 1 ETH
  data: '0x'
})
console.log('Transaction hash:', result.hash)
console.log('Transaction fee (in paymaster token):', result.fee)
```

#### `quoteSendTransaction(tx, config)`
Estimates the fee for a gasless transaction.

**Parameters:**
- `tx` (EvmTransaction): The transaction object (same as sendTransaction)
- `config` (object, optional): Override configuration (same as sendTransaction)

**Returns:** `Promise<{fee: number}>` - Object containing fee estimate

**Example:**
```javascript
const quote = await account.quoteSendTransaction({
  to: '0x...',
  value: 1000000000000000000n
})
console.log('Estimated fee (in paymaster token):', quote.fee)
```

#### `transfer(options, config)`
Transfers ERC-20 tokens using gasless transactions.

**Parameters:**
- `options` (TransferOptions): Transfer options
  - `token` (string): Token contract address
  - `recipient` (string): Recipient address
  - `amount` (number | bigint): Amount in base units
- `config` (object, optional): Override configuration
  - `paymasterToken` (object, optional): Override paymaster token configuration
  - `transferMaxFee` (number, optional): Override maximum fee limit

**Returns:** `Promise<TransferResult>` - Object containing hash and fee

**Example:**
```javascript
const result = await account.transfer({
  token: '0x...',
  recipient: '0x...',
  amount: 1000000000000000000n // 1 token
})
console.log('Transfer hash:', result.hash)
console.log('Transfer fee (in paymaster token):', result.fee)
```

#### `quoteTransfer(options, config)`
Estimates the fee for a token transfer.

**Parameters:**
- `options` (TransferOptions): Transfer options (same as transfer)
- `config` (object, optional): Override configuration (same as transfer)

**Returns:** `Promise<{fee: number}>` - Object containing fee estimate

**Example:**
```javascript
const quote = await account.quoteTransfer({
  token: '0x...',
  recipient: '0x...',
  amount: 1000000000000000000n
})
console.log('Transfer fee estimate (in paymaster token):', quote.fee)
```

#### `getBalance()`
Returns the native token balance.

**Returns:** `Promise<bigint>` - Balance in wei

**Example:**
```javascript
const balance = await account.getBalance()
console.log('Native balance:', balance, 'wei')
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

## KeyPair

```typescript
interface KeyPair {
  publicKey: Uint8Array
  privateKey: Uint8Array
}
```

## EvmErc4337WalletConfig

```typescript
interface EvmErc4337WalletConfig {
  chainId: number
  provider?: string | Eip1193Provider
  bundlerUrl: string
  paymasterUrl: string
  paymasterAddress: string
  entryPointAddress: string
  safeModulesVersion: string
  paymasterToken: {
    address: string
  }
  transferMaxFee?: number
}
``` 