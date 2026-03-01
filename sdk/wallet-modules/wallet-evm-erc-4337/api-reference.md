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
| [ConfigurationError](#configurationerror) | Error thrown when the wallet configuration is invalid or has missing required fields. | - |


## WalletManagerEvmErc4337

The main class for managing ERC-4337 EVM wallets. Extends `WalletManager` from `@tetherto/wdk-wallet`.

### Constructor

```javascript
new WalletManagerEvmErc4337(seed, config)
```

**Parameters:**
- `seed` (string | Uint8Array): BIP-39 mnemonic seed phrase or seed bytes
- `config` (EvmErc4337WalletConfig): Configuration object with common fields and a gas payment mode

**Common config fields (required for all modes):**
  - `chainId` (number): The blockchain's ID (e.g., 1 for Ethereum mainnet)
  - `provider` (string | Eip1193Provider): RPC endpoint URL or EIP-1193 provider instance
  - `bundlerUrl` (string): The URL of the bundler service
  - `entryPointAddress` (string): The address of the entry point smart contract
  - `safeModulesVersion` (string): The Safe modules version (e.g., `'0.3.0'`)

**Gas payment mode** (one of the following):

{% tabs %}
{% tab title="Paymaster Token" %}
Fees are paid using an ERC-20 token through a paymaster service.

- `paymasterUrl` (string): The URL of the paymaster service
- `paymasterAddress` (string): The address of the paymaster smart contract
- `paymasterToken` (object): The paymaster token configuration
  - `address` (string): The address of the ERC-20 token used for fees
- `transferMaxFee` (number | bigint, optional): Maximum fee limit in paymaster token units

```javascript
const wallet = new WalletManagerEvmErc4337(seedPhrase, {
  chainId: 1,
  provider: 'https://rpc.mevblocker.io/fast',
  bundlerUrl: 'https://api.candide.dev/public/v3/ethereum',
  entryPointAddress: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
  safeModulesVersion: '0.3.0',
  // Paymaster token mode
  paymasterUrl: 'https://api.candide.dev/public/v3/ethereum',
  paymasterAddress: '0x8b1f6cb5d062aa2ce8d581942bbb960420d875ba',
  paymasterToken: {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' // USDT
  },
  transferMaxFee: 100000 // Optional: max fee in token units
})
```
{% endtab %}
{% tab title="Sponsorship" %}
Fees are sponsored by a third party via a sponsorship policy.

- `isSponsored` (true): Enables sponsorship mode
- `paymasterUrl` (string): The URL of the paymaster service
- `sponsorshipPolicyId` (string, optional): The sponsorship policy ID

```javascript
const wallet = new WalletManagerEvmErc4337(seedPhrase, {
  chainId: 1,
  provider: 'https://rpc.mevblocker.io/fast',
  bundlerUrl: 'https://api.candide.dev/public/v3/ethereum',
  entryPointAddress: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
  safeModulesVersion: '0.3.0',
  // Sponsorship mode
  isSponsored: true,
  paymasterUrl: 'https://api.candide.dev/public/v3/ethereum',
  sponsorshipPolicyId: 'your-policy-id' // Optional
})
```
{% endtab %}
{% tab title="Native Coins" %}
Fees are paid using the chain's native token (e.g., ETH).

- `useNativeCoins` (true): Enables native coin fee payment
- `transferMaxFee` (number | bigint, optional): Maximum fee limit in native token units

```javascript
const wallet = new WalletManagerEvmErc4337(seedPhrase, {
  chainId: 1,
  provider: 'https://rpc.mevblocker.io/fast',
  bundlerUrl: 'https://api.candide.dev/public/v3/ethereum',
  entryPointAddress: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
  safeModulesVersion: '0.3.0',
  // Native coins mode
  useNativeCoins: true,
  transferMaxFee: 100000000000000n // Optional: max fee in wei
})
```
{% endtab %}
{% endtabs %}

### Methods

| Method | Description | Returns | Throws |
|--------|-------------|---------|--------|
| `getRandomSeedPhrase(wordCount?)` | (static) Returns a random BIP-39 seed phrase | `string` | - |
| `isValidSeedPhrase(seedPhrase)` | (static) Checks if a seed phrase is valid | `boolean` | - |
| `getAccount(index?)` | Returns a wallet account at the specified index | `Promise<WalletAccountEvmErc4337>` | - |
| `getAccountByPath(path)` | Returns a wallet account at the specified BIP-44 derivation path | `Promise<WalletAccountEvmErc4337>` | - |
| `getFeeRates()` | Returns current fee rates for transactions | `Promise<{normal: bigint, fast: bigint}>` | If no provider |
| `dispose()` | Disposes all wallet accounts, clearing private keys from memory | `void` | - |

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `seed` | `Uint8Array` | The wallet's seed phrase as bytes |


#### `getRandomSeedPhrase(wordCount?)` (static)
Returns a random BIP-39 seed phrase.

**Parameters:**
- `wordCount` (12 | 24, optional): The number of words in the seed phrase (default: 12)

**Returns:** `string` - The seed phrase

**Example:**
```javascript
const seedPhrase = WalletManagerEvmErc4337.getRandomSeedPhrase()
console.log('Seed phrase:', seedPhrase) // 12 words

const longSeedPhrase = WalletManagerEvmErc4337.getRandomSeedPhrase(24)
console.log('Long seed phrase:', longSeedPhrase) // 24 words
```

#### `isValidSeedPhrase(seedPhrase)` (static)
Checks if a seed phrase is valid.

**Parameters:**
- `seedPhrase` (string): The seed phrase to validate

**Returns:** `boolean` - True if the seed phrase is valid

**Example:**
```javascript
const isValid = WalletManagerEvmErc4337.isValidSeedPhrase('abandon abandon abandon ...')
console.log('Valid:', isValid)
```

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

#### `getFeeRates()`
Returns current fee rates with ERC-4337 specific multipliers.

**Returns:** `Promise<{normal: bigint, fast: bigint}>` - Fee rates in wei

**Throws:** Error if no provider is configured

**Example:**
```javascript
const feeRates = await wallet.getFeeRates()
console.log('Normal fee rate:', feeRates.normal, 'wei') // base fee × 1.1
console.log('Fast fee rate:', feeRates.fast, 'wei')     // base fee × 2.0
```

#### `dispose()`
Disposes all wallet accounts, clearing private keys from memory.

**Example:**
```javascript
// Clean up when done
wallet.dispose()
```

## WalletAccountEvmErc4337

Represents an individual ERC-4337 wallet account. Extends `WalletAccountReadOnlyEvmErc4337` and implements `IWalletAccount`.

### Constructor

```javascript
new WalletAccountEvmErc4337(seed, path, config)
```

**Parameters:**
- `seed` (string | Uint8Array): BIP-39 mnemonic seed phrase or seed bytes
- `path` (string): BIP-44 derivation path (e.g., "0'/0/0")
- `config` (EvmErc4337WalletConfig): Configuration object (same as [WalletManagerEvmErc4337](#constructor))

**Example:**
```javascript
const account = new WalletAccountEvmErc4337(seedPhrase, "0'/0/0", {
  chainId: 1,
  provider: 'https://rpc.mevblocker.io/fast',
  bundlerUrl: 'https://api.candide.dev/public/v3/ethereum',
  entryPointAddress: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
  safeModulesVersion: '0.3.0',
  paymasterUrl: 'https://api.candide.dev/public/v3/ethereum',
  paymasterAddress: '0x8b1f6cb5d062aa2ce8d581942bbb960420d875ba',
  paymasterToken: {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7'
  }
})
```

### Methods

| Method | Description | Returns | Throws |
|--------|-------------|---------|--------|
| `predictSafeAddress(owner, config)` | (static) Predicts the Safe address for a given owner | `string` | - |
| `getAddress()` | Returns the Safe account's address | `Promise<string>` | - |
| `sign(message)` | Signs a message using the account's private key | `Promise<string>` | - |
| `signTypedData(typedData)` | Signs typed data according to EIP-712 | `Promise<string>` | - |
| `verify(message, signature)` | Verifies a message signature | `Promise<boolean>` | - |
| `verifyTypedData(typedData, signature)` | Verifies a typed data signature (EIP-712) | `Promise<boolean>` | - |
| `sendTransaction(tx, config?)` | Sends a transaction via UserOperation | `Promise<{hash: string, fee: bigint}>` | If fee exceeds max |
| `quoteSendTransaction(tx, config?)` | Estimates the fee for a UserOperation | `Promise<{fee: bigint}>` | - |
| `transfer(options, config?)` | Transfers ERC20 tokens via UserOperation | `Promise<{hash: string, fee: bigint}>` | If fee exceeds max |
| `quoteTransfer(options, config?)` | Estimates the fee for an ERC20 transfer | `Promise<{fee: bigint}>` | - |
| `approve(options)` | Approves a spender to spend ERC20 tokens | `Promise<{hash: string, fee: bigint}>` | - |
| `getBalance()` | Returns the native token balance (in wei) | `Promise<bigint>` | - |
| `getTokenBalance(tokenAddress)` | Returns the balance of a specific ERC20 token | `Promise<bigint>` | - |
| `getTokenBalances(tokenAddresses)` | Returns balances for multiple ERC20 tokens | `Promise<Record<string, bigint>>` | - |
| `getPaymasterTokenBalance()` | Returns the paymaster token balance | `Promise<bigint>` | - |
| `getAllowance(token, spender)` | Returns current token allowance for a spender | `Promise<bigint>` | - |
| `getTransactionReceipt(hash)` | Returns a transaction receipt | `Promise<EvmTransactionReceipt \| null>` | - |
| `getUserOperationReceipt(hash)` | Returns a UserOperation receipt | `Promise<UserOperationReceipt \| null>` | - |
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

##### `signTypedData(typedData)`
Signs typed data according to [EIP-712](https://eips.ethereum.org/EIPS/eip-712).

**Parameters:**
- `typedData` (TypedData): The typed data to sign

**Returns:** `Promise<string>` - The typed data signature

**Example:**
```javascript
const typedData = {
  domain: {
    name: 'MyDApp',
    version: '1',
    chainId: 1,
    verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
  },
  types: {
    Mail: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'contents', type: 'string' }
    ]
  },
  message: {
    from: '0xAlice...',
    to: '0xBob...',
    contents: 'Hello Bob!'
  }
}

const signature = await account.signTypedData(typedData)
console.log('Typed data signature:', signature)
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

##### `verifyTypedData(typedData, signature)`
Verifies a typed data signature according to [EIP-712](https://eips.ethereum.org/EIPS/eip-712).

**Parameters:**
- `typedData` (TypedData): The typed data that was signed
- `signature` (string): The signature to verify

**Returns:** `Promise<boolean>` - True if signature is valid

**Example:**
```javascript
const isValid = await account.verifyTypedData(typedData, signature)
console.log('Typed data signature valid:', isValid)
```

##### `sendTransaction(tx, config?)`
Sends a transaction via UserOperation through the bundler.

**Parameters:**
- `tx` (EvmTransaction | EvmTransaction[]): Transaction object or array for batch transactions
  - `to` (string): Recipient address
  - `value` (number | bigint): Amount in wei
  - `data` (string, optional): Transaction data in hex format
- `config` (optional): Per-call configuration override. Accepts a partial version of the gas payment mode fields (see [Config Override](#config-override)).

**Returns:** `Promise<{hash: string, fee: bigint}>` - UserOperation hash and fee

**Throws:** Error if fee exceeds `transferMaxFee`

**Example:**
```javascript
// Single transaction
const result = await account.sendTransaction({
  to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  value: 1000000000000000000n, // 1 ETH
  data: '0x'
})
console.log('UserOperation hash:', result.hash)
console.log('Fee paid:', result.fee)

// Batch transactions
const batchResult = await account.sendTransaction([
  { to: '0x...', value: 100000000000000000n },
  { to: '0x...', value: 200000000000000000n }
])

// With per-call config override
const customResult = await account.sendTransaction({
  to: '0x...',
  value: 1000000000000000000n
}, {
  paymasterToken: { address: '0xNewToken...' }
})
```

##### `quoteSendTransaction(tx, config?)`
Estimates the fee for a UserOperation without sending it.

**Parameters:**
- `tx` (EvmTransaction | EvmTransaction[]): Transaction object or array (same as sendTransaction)
- `config` (optional): Per-call configuration override (see [Config Override](#config-override))

**Returns:** `Promise<{fee: bigint}>` - Fee estimate

**Example:**
```javascript
const quote = await account.quoteSendTransaction({
  to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  value: 1000000000000000000n
})
console.log('Estimated fee:', quote.fee)
```

##### `transfer(options, config?)`
Transfers ERC20 tokens via UserOperation.

**Parameters:**
- `options` (TransferOptions): Transfer options
  - `token` (string): ERC20 token contract address
  - `recipient` (string): Recipient address
  - `amount` (number | bigint): Amount in token base units
- `config` (optional): Per-call configuration override (see [Config Override](#config-override))

**Returns:** `Promise<{hash: string, fee: bigint}>` - UserOperation hash and fee

**Throws:** 
- Error if fee exceeds `transferMaxFee`
- Error if insufficient token balance

**Example:**
```javascript
const result = await account.transfer({
  token: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
  recipient: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  amount: 1000000 // 1 USDT (6 decimals)
}, {
  transferMaxFee: 50000 // Override max fee for this call
})
console.log('Transfer hash:', result.hash)
console.log('Transfer fee:', result.fee)
```

##### `quoteTransfer(options, config?)`
Estimates the fee for an ERC20 token transfer.

**Parameters:**
- `options` (TransferOptions): Transfer options (same as transfer)
- `config` (optional): Per-call configuration override (see [Config Override](#config-override))

**Returns:** `Promise<{fee: bigint}>` - Fee estimate

**Example:**
```javascript
const quote = await account.quoteTransfer({
  token: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  recipient: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  amount: 1000000
})
console.log('Transfer fee estimate:', quote.fee)
```

##### `getBalance()`
Returns the Safe account's native token balance.

**Returns:** `Promise<bigint>` - Balance in wei

**Example:**
```javascript
const balance = await account.getBalance()
console.log('Native balance:', balance, 'wei')
```

##### `getTokenBalance(tokenAddress)`
Returns the balance of a specific ERC20 token in the Safe account.

**Parameters:**
- `tokenAddress` (string): The ERC20 token contract address

**Returns:** `Promise<bigint>` - Token balance in base units

**Example:**
```javascript
const tokenBalance = await account.getTokenBalance('0xdAC17F958D2ee523a2206206994597C13D831ec7')
console.log('USDT balance:', tokenBalance) // In 6 decimal units
```

##### `getTokenBalances(tokenAddresses)`
Returns balances for multiple ERC20 tokens in one call.

**Parameters:**
- `tokenAddresses` (string[]): List of ERC20 token contract addresses

**Returns:** `Promise<Record<string, bigint>>` - Object mapping each token address to its balance in base units

**Example:**
```javascript
const tokenBalances = await account.getTokenBalances([
  '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
  '0x68749665FF8D2d112Fa859AA293F07A622782F38'  // XAUT
])
console.log('Token balances:', tokenBalances)
```

##### `getPaymasterTokenBalance()`
Returns the balance of the configured paymaster token used for paying fees.

**Returns:** `Promise<bigint>` - Paymaster token balance in base units

**Example:**
```javascript
const paymasterBalance = await account.getPaymasterTokenBalance()
console.log('Paymaster token balance:', paymasterBalance)

// Check if sufficient for transaction
if (paymasterBalance < 10000n) {
  console.warn('Low paymaster token balance - may not cover fees')
}
```

##### `approve(options)`
Approves a spender to spend ERC20 tokens on behalf of the Safe account.

**Parameters:**
- `options` (ApproveOptions): Approve options
  - `token` (string): ERC20 token contract address
  - `spender` (string): The address allowed to spend the tokens
  - `amount` (number | bigint): Amount to approve in token base units

**Returns:** `Promise<{hash: string, fee: bigint}>` - Transaction result

**Example:**
```javascript
const result = await account.approve({
  token: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  spender: '0xSpenderContract...',
  amount: 1000000n // 1 USDT
})
console.log('Approval hash:', result.hash)
```

##### `getAllowance(token, spender)`
Returns the current token allowance for the given spender.

**Parameters:**
- `token` (string): ERC20 token contract address
- `spender` (string): The spender's address

**Returns:** `Promise<bigint>` - The current allowance

**Example:**
```javascript
const allowance = await account.getAllowance(
  '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  '0xSpenderContract...'
)
console.log('Current allowance:', allowance)
```

##### `getTransactionReceipt(hash)`
Returns a transaction receipt by hash.

**Parameters:**
- `hash` (string): The transaction hash

**Returns:** `Promise<EvmTransactionReceipt | null>` - Transaction receipt or null if not mined

**Example:**
```javascript
const receipt = await account.getTransactionReceipt('0x...')
if (receipt) {
  console.log('Confirmed in block:', receipt.blockNumber)
}
```

##### `getUserOperationReceipt(hash)`
Returns a UserOperation receipt by hash.

**Parameters:**
- `hash` (string): The UserOperation hash

**Returns:** `Promise<UserOperationReceipt | null>` - UserOperation receipt or null if not processed

**Example:**
```javascript
const receipt = await account.getUserOperationReceipt('0x...')
if (receipt) {
  console.log('UserOp receipt:', receipt)
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

##### `dispose()`
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
| `keyPair` | `{privateKey: Uint8Array \| null, publicKey: Uint8Array}` | The account's key pair (⚠️ Contains sensitive data) |

**Example:**
```javascript
console.log('Account index:', account.index) // 0, 1, 2, etc.
console.log('Account path:', account.path) // m/44'/60'/0'/0/0

// ⚠️ SENSITIVE: Handle with care
const { privateKey, publicKey } = account.keyPair
console.log('Public key length:', publicKey.length) // 65 bytes
console.log('Private key length:', privateKey?.length) // 32 bytes (null after dispose)
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
- `config` (Omit\<EvmErc4337WalletConfig, 'transferMaxFee'\>): Configuration object without `transferMaxFee`

**Example:**
```javascript
const readOnlyAccount = new WalletAccountReadOnlyEvmErc4337('0x...', {
  chainId: 1,
  provider: 'https://rpc.mevblocker.io/fast',
  bundlerUrl: 'https://api.candide.dev/public/v3/ethereum',
  entryPointAddress: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
  safeModulesVersion: '0.3.0',
  paymasterUrl: 'https://api.candide.dev/public/v3/ethereum',
  paymasterAddress: '0x8b1f6cb5d062aa2ce8d581942bbb960420d875ba',
  paymasterToken: {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7'
  }
})
```

### Static Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `predictSafeAddress(owner, config)` | Predicts the Safe address for a given owner without instantiating an account | `string` |

#### `predictSafeAddress(owner, config)` (static)
Predicts the address of a Safe account.

**Parameters:**
- `owner` (string): The Safe owner's EOA address
- `config` (object): Configuration with:
  - `chainId` (number): The blockchain ID
  - `safeModulesVersion` (string): The Safe modules version

**Returns:** `string` - The predicted Safe address

**Example:**
```javascript
const safeAddress = WalletAccountReadOnlyEvmErc4337.predictSafeAddress(
  '0xOwnerEOA...',
  { chainId: 1, safeModulesVersion: '0.3.0' }
)
console.log('Predicted Safe address:', safeAddress)

// Also available on WalletAccountEvmErc4337 (inherited)
const sameAddress = WalletAccountEvmErc4337.predictSafeAddress(
  '0xOwnerEOA...',
  { chainId: 1, safeModulesVersion: '0.3.0' }
)
```

### Methods

| Method | Description | Returns | Throws |
|--------|-------------|---------|--------|
| `getAddress()` | Returns the Safe account's address | `Promise<string>` | - |
| `verify(message, signature)` | Verifies a message signature | `Promise<boolean>` | - |
| `verifyTypedData(typedData, signature)` | Verifies a typed data signature (EIP-712) | `Promise<boolean>` | - |
| `getBalance()` | Returns the native token balance (in wei) | `Promise<bigint>` | - |
| `getTokenBalance(tokenAddress)` | Returns the balance of a specific ERC20 token | `Promise<bigint>` | - |
| `getTokenBalances(tokenAddresses)` | Returns balances for multiple ERC20 tokens | `Promise<Record<string, bigint>>` | - |
| `getPaymasterTokenBalance()` | Returns the paymaster token balance | `Promise<bigint>` | - |
| `getAllowance(token, spender)` | Returns current token allowance for a spender | `Promise<bigint>` | - |
| `quoteSendTransaction(tx, config?)` | Estimates the fee for a UserOperation | `Promise<{fee: bigint}>` | If simulation fails |
| `quoteTransfer(options, config?)` | Estimates the fee for an ERC20 transfer | `Promise<{fee: bigint}>` | If simulation fails |
| `getTransactionReceipt(hash)` | Returns a transaction receipt | `Promise<EvmTransactionReceipt \| null>` | - |
| `getUserOperationReceipt(hash)` | Returns a UserOperation receipt | `Promise<UserOperationReceipt \| null>` | - |

##### `getAddress()`
Returns the Safe smart contract wallet address.

**Returns:** `Promise<string>` - The Safe account's address

**Example:**
```javascript
const address = await readOnlyAccount.getAddress()
console.log('Safe address:', address)
```

##### `verify(message, signature)`
Verifies a message signature against the underlying EOA address.

**Parameters:**
- `message` (string): The original message
- `signature` (string): The signature to verify

**Returns:** `Promise<boolean>` - True if signature is valid

**Example:**
```javascript
const isValid = await readOnlyAccount.verify(message, signature)
console.log('Signature valid:', isValid)
```

##### `verifyTypedData(typedData, signature)`
Verifies a typed data signature according to [EIP-712](https://eips.ethereum.org/EIPS/eip-712).

**Parameters:**
- `typedData` (TypedData): The typed data that was signed
- `signature` (string): The signature to verify

**Returns:** `Promise<boolean>` - True if signature is valid

**Example:**
```javascript
const isValid = await readOnlyAccount.verifyTypedData(typedData, signature)
console.log('Typed data signature valid:', isValid)
```

##### `getBalance()`
Returns the Safe account's native token balance.

**Returns:** `Promise<bigint>` - Balance in wei

**Example:**
```javascript
const balance = await readOnlyAccount.getBalance()
console.log('Balance:', balance, 'wei')
```

##### `getTokenBalance(tokenAddress)`
Returns the balance of a specific ERC20 token.

**Parameters:**
- `tokenAddress` (string): The ERC20 token contract address

**Returns:** `Promise<bigint>` - Token balance in base units

**Example:**
```javascript
const tokenBalance = await readOnlyAccount.getTokenBalance('0xdAC17F958D2ee523a2206206994597C13D831ec7')
console.log('USDT balance:', tokenBalance)
```

##### `getTokenBalances(tokenAddresses)`
Returns balances for multiple ERC20 tokens.

**Parameters:**
- `tokenAddresses` (string[]): List of ERC20 token contract addresses

**Returns:** `Promise<Record<string, bigint>>` - Object mapping each token address to its balance in base units

**Example:**
```javascript
const tokenBalances = await readOnlyAccount.getTokenBalances([
  '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
  '0x68749665FF8D2d112Fa859AA293F07A622782F38'  // XAUT
])
console.log('Token balances:', tokenBalances)
```

##### `getPaymasterTokenBalance()`
Returns the balance of the configured paymaster token.

**Returns:** `Promise<bigint>` - Paymaster token balance in base units

**Example:**
```javascript
const paymasterBalance = await readOnlyAccount.getPaymasterTokenBalance()
console.log('Paymaster token balance:', paymasterBalance)
```

##### `getAllowance(token, spender)`
Returns the current token allowance for the given spender.

**Parameters:**
- `token` (string): ERC20 token contract address
- `spender` (string): The spender's address

**Returns:** `Promise<bigint>` - The current allowance

**Example:**
```javascript
const allowance = await readOnlyAccount.getAllowance(
  '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  '0xSpenderContract...'
)
console.log('Allowance:', allowance)
```

##### `quoteSendTransaction(tx, config?)`
Estimates the fee for a UserOperation.

**Parameters:**
- `tx` (EvmTransaction | EvmTransaction[]): Transaction object or array
- `config` (optional): Per-call configuration override (see [Config Override](#config-override))

**Returns:** `Promise<{fee: bigint}>` - Fee estimate

**Throws:** Error if simulation fails

**Example:**
```javascript
try {
  const quote = await readOnlyAccount.quoteSendTransaction({
    to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    value: 1000000000000000000n
  })
  console.log('Estimated fee:', quote.fee)
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
- `config` (optional): Per-call configuration override (see [Config Override](#config-override))

**Returns:** `Promise<{fee: bigint}>` - Fee estimate

**Example:**
```javascript
const quote = await readOnlyAccount.quoteTransfer({
  token: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  recipient: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  amount: 1000000
})
console.log('Transfer fee estimate:', quote.fee)
```

##### `getTransactionReceipt(hash)`
Returns a transaction receipt by hash.

**Parameters:**
- `hash` (string): The transaction hash

**Returns:** `Promise<EvmTransactionReceipt | null>` - Transaction receipt or null if not mined

**Example:**
```javascript
const receipt = await readOnlyAccount.getTransactionReceipt('0x...')
if (receipt) {
  console.log('Transaction confirmed in block:', receipt.blockNumber)
  console.log('Status:', receipt.status) // 1 = success, 0 = failed
} else {
  console.log('Transaction not yet mined')
}
```

##### `getUserOperationReceipt(hash)`
Returns a UserOperation receipt by hash.

**Parameters:**
- `hash` (string): The UserOperation hash

**Returns:** `Promise<UserOperationReceipt | null>` - UserOperation receipt or null if not processed

**Example:**
```javascript
const receipt = await readOnlyAccount.getUserOperationReceipt('0x...')
if (receipt) {
  console.log('UserOp receipt:', receipt)
}
```

## Types

The following types are exported from `@tetherto/wdk-wallet-evm-erc-4337` and can be imported directly.

**Exported configuration subtypes:**
- `EvmErc4337WalletCommonConfig`
- `EvmErc4337WalletPaymasterTokenConfig`
- `EvmErc4337WalletSponsorshipPolicyConfig`
- `EvmErc4337WalletNativeCoinsConfig`

### TypedData

```typescript
interface TypedData {
  domain: TypedDataDomain;                           // The domain separator
  types: Record<string, TypedDataField[]>;           // The type definitions
  message: Record<string, unknown>;                  // The message data
}
```

### TypedDataDomain

```typescript
interface TypedDataDomain {
  name?: string;                     // The domain name (e.g., the DApp name)
  version?: string;                  // The domain version
  chainId?: number | bigint;         // The chain ID
  verifyingContract?: string;        // The verifying contract address
  salt?: string;                     // An optional salt
}
```

### TypedDataField

```typescript
interface TypedDataField {
  name: string;                      // The field name
  type: string;                      // The field type (e.g., 'address', 'uint256', 'string')
}
```

### EvmErc4337WalletConfig

The configuration is a union type combining common fields with one of three gas payment modes:

```typescript
// Common fields (required for all modes)
interface EvmErc4337WalletCommonConfig {
  chainId: number;                          // Blockchain ID
  provider: string | Eip1193Provider;       // RPC provider
  bundlerUrl: string;                       // Bundler service URL
  entryPointAddress: string;                // EntryPoint contract address
  safeModulesVersion: string;               // Safe modules version (e.g., '0.3.0')
}

// Mode 1: Paymaster Token
interface EvmErc4337WalletPaymasterTokenConfig {
  isSponsored?: false;
  useNativeCoins?: false;
  paymasterUrl: string;                     // Paymaster service URL
  paymasterAddress: string;                 // Paymaster contract address
  paymasterToken: { address: string };      // ERC-20 token for fees
  transferMaxFee?: number | bigint;         // Maximum fee limit
}

// Mode 2: Sponsorship Policy
interface EvmErc4337WalletSponsorshipPolicyConfig {
  isSponsored: true;
  useNativeCoins?: false;
  paymasterUrl: string;                     // Paymaster service URL
  sponsorshipPolicyId?: string;             // Sponsorship policy ID
}

// Mode 3: Native Coins
interface EvmErc4337WalletNativeCoinsConfig {
  isSponsored?: false;
  useNativeCoins: true;
  transferMaxFee?: number | bigint;         // Maximum fee limit
}

// Full config type
type EvmErc4337WalletConfig = EvmErc4337WalletCommonConfig &
  (EvmErc4337WalletPaymasterTokenConfig |
   EvmErc4337WalletSponsorshipPolicyConfig |
   EvmErc4337WalletNativeCoinsConfig);
```

### Config Override

The `config` parameter on `sendTransaction`, `quoteSendTransaction`, `transfer`, and `quoteTransfer` allows per-call overrides of gas payment settings:

```typescript
type ConfigOverride = Partial<
  EvmErc4337WalletPaymasterTokenConfig |
  EvmErc4337WalletSponsorshipPolicyConfig |
  EvmErc4337WalletNativeCoinsConfig
>;
```

**Available override fields:**
- `isSponsored` (boolean): Switch to sponsorship mode
- `useNativeCoins` (boolean): Switch to native coin mode
- `paymasterUrl` (string): Override paymaster URL
- `paymasterAddress` (string): Override paymaster contract
- `paymasterToken` ({address: string}): Override paymaster token
- `sponsorshipPolicyId` (string): Set sponsorship policy
- `transferMaxFee` (number | bigint): Override maximum fee

### EvmTransaction

```typescript
interface EvmTransaction {
  to: string;                               // Recipient address
  value: number | bigint;                   // Amount in wei
  data?: string;                            // Transaction data (optional)
  gasLimit?: number | bigint;               // Gas limit (optional)
  gasPrice?: number | bigint;               // Legacy gas price (optional)
  maxFeePerGas?: number | bigint;           // EIP-1559 max fee (optional)
  maxPriorityFeePerGas?: number | bigint;   // EIP-1559 priority fee (optional)
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

### ApproveOptions

```typescript
interface ApproveOptions {
  token: string;                            // ERC20 token contract address
  spender: string;                          // Address allowed to spend tokens
  amount: number | bigint;                  // Amount to approve in base units
}
```

### TransactionResult

```typescript
interface TransactionResult {
  hash: string;                             // UserOperation hash
  fee: bigint;                              // Fee paid
}
```

### TransferResult

```typescript
interface TransferResult {
  hash: string;                             // UserOperation hash
  fee: bigint;                              // Fee paid
}
```

### UserOperationReceipt

```typescript
interface UserOperationReceipt {
  userOpHash: string;                       // UserOperation hash
  sender: string;                           // Sender address
  nonce: bigint;                            // Nonce
  actualGasUsed: bigint;                    // Gas used
  actualGasCost: bigint;                    // Gas cost
  success: boolean;                         // Whether the operation succeeded
  receipt: EvmTransactionReceipt;           // The underlying transaction receipt
}
```

### ConfigurationError

```typescript
class ConfigurationError extends Error {
  // Thrown when the wallet configuration is invalid
  // e.g., missing required fields for the selected gas payment mode
}
```

### FeeRates

```typescript
interface FeeRates {
  normal: bigint;                             // Fee rate for normal priority
  fast: bigint;                               // Fee rate for fast priority
}
```

### KeyPair

```typescript
interface KeyPair {
  publicKey: Uint8Array;                      // The public key
  privateKey: Uint8Array | null;              // The private key (null after dispose)
}
```

### Internal Constants

The following constants are used internally by the SDK and are **not importable** from the package entry point.

```typescript
// Used by predictSafeAddress() for deterministic address generation
// Not re-exported from '@tetherto/wdk-wallet-evm-erc-4337'
const SALT_NONCE: string = '0x69b348339eea4ed93f9d11931c3b894c8f9d8c7663a053024b11cb7eb4e5a1f6';

// Fee rate multipliers (protected static on WalletManagerEvm)
// Applied internally by getFeeRates()
const _FEE_RATE_NORMAL_MULTIPLIER: bigint;  // ~110%
const _FEE_RATE_FAST_MULTIPLIER: bigint;    // ~200%
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
				<a href="./usage.md">WDK EVM with ERC-4337 Wallet Usage</a>
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
