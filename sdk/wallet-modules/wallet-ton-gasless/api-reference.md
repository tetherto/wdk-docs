---
title: Wallet TON Gasless API Reference
description: Complete API documentation for @tetherto/wdk-wallet-ton-gasless
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
| [WalletManagerTonGasless](#walletmanagertongasless) | Main class for managing gasless TON wallets | [Constructor](#constructor), [Methods](#methods) |
| [WalletAccountTonGasless](#walletaccounttongasless) | Individual gasless TON wallet account implementation | [Constructor](#constructor-1), [Methods](#methods-1) |
| [WalletAccountReadOnlyTonGasless](#walletaccountreadonlytongasless) | Read-only gasless TON wallet account | [Constructor](#constructor-2), [Methods](#methods-2) |

### WalletManagerTonGasless

The main class for managing gasless TON wallets. Extends `WalletManager` from `@tetherto/wdk-wallet`.

#### Constructor

```javascript
new WalletManagerTonGasless(seed, config)
```

**Parameters:**
- `seed` (string | Uint8Array): BIP-39 mnemonic seed phrase or seed bytes
- `config` (TonGaslessWalletConfig): Configuration object (required)
  - `tonClient` (object | TonClient): TON client configuration or instance
    - `url` (string): TON Center API URL (e.g., 'https://toncenter.com/api/v3')
    - `secretKey` (string, optional): API key for TON Center
  - `tonApiClient` (object | TonApiClient): TON API client configuration or instance
    - `url` (string): TON API URL (e.g., 'https://tonapi.io/v2')
    - `secretKey` (string, optional): API key for TON API
  - `paymasterToken` (object): Paymaster token configuration
    - `address` (string): Paymaster token contract address
  - `transferMaxFee` (number | bigint, optional): Maximum fee for transfer operations

**Example:**
```javascript
const wallet = new WalletManagerTonGasless(seedPhrase, {
  tonClient: {
    url: 'https://toncenter.com/api/v3',
    secretKey: 'your-api-key'
  },
  tonApiClient: {
    url: 'https://tonapi.io/v2',
    secretKey: 'your-tonapi-key'
  },
  paymasterToken: {
    address: 'EQ...'
  },
  transferMaxFee: 1000000000
})
```

#### Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `getAccount(index)` | Returns a gasless wallet account at the specified index | `Promise<WalletAccountTonGasless>` |
| `getAccountByPath(path)` | Returns a gasless wallet account at the specified BIP-44 derivation path | `Promise<WalletAccountTonGasless>` |
| `getFeeRates()` | Returns current fee rates for transactions | `Promise<{normal: bigint, fast: bigint}>` |
| `dispose()` | Disposes all wallet accounts, clearing private keys from memory | `void` |

##### `getAccount(index)`
Returns a gasless wallet account at the specified index.

**Parameters:**
- `index` (number, optional): The index of the account to get (default: 0)

**Returns:** `Promise<WalletAccountTonGasless>` - The wallet account

**Example:**
```javascript
const account = await wallet.getAccount(0)
```

##### `getAccountByPath(path)`
Returns a gasless wallet account at the specified BIP-44 derivation path.

**Parameters:**
- `path` (string): The derivation path (e.g., "0'/0/0")

**Returns:** `Promise<WalletAccountTonGasless>` - The wallet account

**Example:**
```javascript
const account = await wallet.getAccountByPath("0'/0/1")
```

##### `getFeeRates()`
Returns current fee rates for transactions based on blockchain config.

**Returns:** `Promise<{normal: bigint, fast: bigint}>` - Object containing fee rates

**Example:**
```javascript
const feeRates = await wallet.getFeeRates()
console.log('Normal fee rate:', feeRates.normal)
console.log('Fast fee rate:', feeRates.fast)
```

##### `dispose()`
Disposes all wallet accounts, clearing private keys from memory.

**Example:**
```javascript
wallet.dispose()
```

### WalletAccountTonGasless

Individual gasless TON wallet account implementation. Extends `WalletAccountReadOnlyTonGasless` and implements `IWalletAccount`.

#### Constructor

```javascript
new WalletAccountTonGasless(seed, path, config)
```

**Parameters:**
- `seed` (string | Uint8Array): BIP-39 mnemonic seed phrase or seed bytes
- `path` (string): BIP-44 derivation path (e.g., "0'/0/0")
- `config` (TonGaslessWalletConfig): Configuration object (required, same as WalletManagerTonGasless)

#### Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `getAddress()` | Returns the account's TON address | `Promise<string>` |
| `sign(message)` | Signs a message using the account's private key | `Promise<string>` |
| `verify(message, signature)` | Verifies a message signature | `Promise<boolean>` |
| `sendTransaction(tx)` | Sends a TON transaction | `Promise<{hash: string, fee: bigint}>` |
| `transfer(options, config?)` | Transfers tokens using gasless transactions | `Promise<{hash: string, fee: bigint}>` |
| `quoteTransfer(options, config?)` | Estimates the fee for a token transfer | `Promise<{fee: bigint}>` |
| `getBalance()` | Returns the native TON balance (in nanotons) | `Promise<bigint>` |
| `getTokenBalance(tokenAddress)` | Returns the balance of a specific token | `Promise<bigint>` |
| `getPaymasterTokenBalance()` | Returns the balance of the paymaster token | `Promise<bigint>` |
| `getTransactionReceipt(hash)` | Returns a transaction's receipt | `Promise<TonTransactionReceipt \| null>` |
| `toReadOnlyAccount()` | Returns a read-only copy of the account | `Promise<WalletAccountReadOnlyTonGasless>` |
| `dispose()` | Disposes the wallet account, clearing private keys from memory | `void` |

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
Sends a TON transaction.

**Parameters:**
- `tx` (TonTransaction): The transaction object
  - `to` (string): Recipient TON address
  - `value` (number | bigint): Amount in nanotons
  - `bounceable` (boolean, optional): Whether the address is bounceable
  - `body` (string | Cell, optional): Optional message body

**Returns:** `Promise<{hash: string, fee: bigint}>` - Transaction result

**Example:**
```javascript
const result = await account.sendTransaction({
  to: 'EQ...',
  value: 1000000000
})
console.log('Transaction hash:', result.hash)
```

##### `transfer(options, config?)`
Transfers tokens using gasless transactions.

**Parameters:**
- `options` (TransferOptions): Transfer options
  - `token` (string): Token contract address
  - `recipient` (string): Recipient TON address
  - `amount` (number | bigint): Amount in token's base units
- `config` (object, optional): Override configuration
  - `paymasterToken` (object, optional): Override default paymaster token
    - `address` (string): Paymaster token address
  - `transferMaxFee` (number | bigint, optional): Override maximum fee

**Returns:** `Promise<{hash: string, fee: bigint}>` - Transfer result

**Example:**
```javascript
const result = await account.transfer({
  token: 'EQ...',
  recipient: 'EQ...',
  amount: 1000000000
}, {
  paymasterToken: { address: 'EQ...' },
  transferMaxFee: 2000000000
})
```

##### `quoteTransfer(options)`
Estimates the fee for a Jetton (TON token) transfer.

**Parameters:**
- `options` (TransferOptions): Transfer options
  - `token` (string): Token contract address
  - `recipient` (string): Recipient TON address
  - `amount` (number | bigint): Amount in token's base units
- `config` (object, optional): Override configuration
  - `paymasterToken` (object, optional): Override default paymaster token

**Returns:** `Promise<{fee: bigint}>` - Object containing fee estimate (in paymaster token base units)

**Example:**
```javascript
const quote = await account.quoteTransfer({
  token: 'EQ...',
  recipient: 'EQ...',
  amount: 1000000000
});
console.log('Transfer fee estimate:', quote.fee, 'paymaster token units');
```

##### `getPaymasterTokenBalance()`
Returns the balance of the paymaster Jetton (used for gasless fees).

**Returns:** `Promise<bigint>` - Paymaster Jetton balance in base units

**Example:**
```javascript
const paymasterBalance = await account.getPaymasterTokenBalance();
console.log('Paymaster Jetton balance:', paymasterBalance);
```

##### `getBalance()`
Returns the native TON balance (in nanotons).

**Returns:** `Promise<bigint>` - Balance in nanotons

**Example:**
```javascript
const balance = await account.getBalance();
console.log('Balance:', balance, 'nanotons');
```

##### `getTokenBalance(tokenAddress)`
Returns the balance of a specific Jetton (TON token).

**Parameters:**
- `tokenAddress` (string): The token contract address


**Returns:** `Promise<bigint>` - Token balance in base units

**Example:**
```javascript
const tokenBalance = await account.getTokenBalance('EQ...');
console.log('Token balance:', tokenBalance, 'token base units');
```

##### `dispose()`
Disposes the wallet account, clearing private keys from memory.

**Example:**
```javascript
account.dispose()
```

##### `getTransactionReceipt(hash)`
Returns a transaction's receipt if it has been mined.

**Parameters:**
- `hash` (string): The transaction hash

**Returns:** `Promise<TonTransactionReceipt | null>` - Transaction receipt or null if not yet mined

**Example:**
```javascript
const receipt = await account.getTransactionReceipt('transaction-hash')
console.log('Transaction confirmed:', receipt !== null)
```

##### `toReadOnlyAccount()`
Returns a read-only copy of the account.

**Returns:** `Promise<WalletAccountReadOnlyTonGasless>` - The read-only account

**Example:**
```javascript
const readOnlyAccount = await account.toReadOnlyAccount()
const address = await readOnlyAccount.getAddress()
console.log('Read-only account address:', address)
```

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `index` | `number` | The derivation path's index of this account |
| `path` | `string` | The full derivation path of this account |
| `keyPair` | `{publicKey: Uint8Array, privateKey: Uint8Array \| null}` | The account's public and private key pair |

**Example:**
```javascript
const { publicKey, privateKey } = account.keyPair
console.log('Public key length:', publicKey.length)
console.log('Private key length:', privateKey.length)
```

### WalletAccountReadOnlyTonGasless

Read-only gasless TON wallet account.

#### Constructor

```javascript
new WalletAccountReadOnlyTonGasless(publicKey, config)
```

**Parameters:**
- `publicKey` (string | Uint8Array): The account's public key
- `config` (object): Configuration object (required, `Omit<TonGaslessWalletConfig, 'transferMaxFee'>`)

#### Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `getAddress()` | Returns the account's TON address | `Promise<string>` |
| `verify(message, signature)` | Verifies a message signature | `Promise<boolean>` |
| `getBalance()` | Returns the native TON balance | `Promise<bigint>` |
| `getTokenBalance(tokenAddress)` | Returns the balance of a specific token | `Promise<bigint>` |
| `getPaymasterTokenBalance()` | Returns the balance of the paymaster token | `Promise<bigint>` |
| `quoteTransfer(options, config?)` | Estimates the fee for a token transfer | `Promise<{fee: bigint}>` |
| `getTransactionReceipt(hash)` | Returns a transaction's receipt | `Promise<TonTransactionReceipt \| null>` |

##### `getAddress()`
Returns the account's TON address.

**Returns:** `Promise<string>` - The account's TON address

**Example:**
```javascript
const address = await readOnlyAccount.getAddress()
console.log('Account address:', address)
```

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

##### `getBalance()`
Returns the native TON balance (in nanotons).

**Returns:** `Promise<bigint>` - Balance in nanotons

**Example:**
```javascript
const balance = await readOnlyAccount.getBalance()
console.log('TON balance:', balance, 'nanotons')
```

##### `getTokenBalance(tokenAddress)`
Returns the balance of a specific token.

**Parameters:**
- `tokenAddress` (string): The token contract address

**Returns:** `Promise<bigint>` - Token balance in base units

**Example:**
```javascript
const tokenBalance = await readOnlyAccount.getTokenBalance('EQ...')
console.log('Token balance:', tokenBalance, 'token base units')
```

##### `getPaymasterTokenBalance()`
Returns the balance of the paymaster token (used for gasless fees).

**Returns:** `Promise<bigint>` - Paymaster token balance in base units

**Example:**
```javascript
const paymasterBalance = await readOnlyAccount.getPaymasterTokenBalance()
console.log('Paymaster token balance:', paymasterBalance)
```

##### `quoteTransfer(options, config?)`
Estimates the fee for a token transfer.

**Parameters:**
- `options` (TransferOptions): Transfer options
  - `token` (string): Token contract address
  - `recipient` (string): Recipient TON address
  - `amount` (number | bigint): Amount in token's base units
- `config` (object, optional): Override configuration
  - `paymasterToken` (object, optional): Override default paymaster token

**Returns:** `Promise<{fee: bigint}>` - Object containing fee estimate (in paymaster token base units)

**Example:**
```javascript
const quote = await readOnlyAccount.quoteTransfer({
  token: 'EQ...',
  recipient: 'EQ...',
  amount: 1000000000
})
console.log('Transfer fee estimate:', quote.fee, 'paymaster token units')
```

##### `getTransactionReceipt(hash)`
Returns a transaction's receipt.

**Parameters:**
- `hash` (string): The transaction's hash

**Returns:** `Promise<TonTransactionReceipt | null>` - The receipt, or null if the transaction has not been included in a block yet

**Example:**
```javascript
const receipt = await readOnlyAccount.getTransactionReceipt('transaction-hash')
if (receipt) {
  console.log('Transaction receipt:', receipt)
} else {
  console.log('Transaction not yet included in a block')
}
```

## Types

### TonGaslessWalletConfig

```typescript
interface TonGaslessWalletConfig {
  /**
   * TON Center client configuration or an instance of TonClient
   */
  tonClient: TonClientConfig | TonClient;

  /**
   * TON API client configuration or an instance of TonApiClient
   */
  tonApiClient: TonApiClientConfig | TonApiClient;

  /**
   * Paymaster token configuration
   */
  paymasterToken: {
    /**
     * Paymaster token contract address
     * @example 'EQ...'
     */
    address: string;
  };

  /**
   * Maximum fee for transfer operations
   * @optional
   */
  transferMaxFee?: number | bigint;
}
```

### TransferOptions

```typescript
interface TransferOptions {
  /**
   * Token contract address
   * @example 'EQ...'
   */
  token: string;

  /**
   * Recipient's TON address
   * @example 'EQ...'
   */
  recipient: string;

  /**
   * Amount in token's base units
   */
  amount: number | bigint;
}
```

### TransferResult

```typescript
interface TransferResult {
  /**
   * Transaction hash
   */
  hash: string;

  /**
   * Fee paid in paymaster token units
   */
  fee: bigint;
}
```

### KeyPair

```typescript
interface KeyPair {
  /**
   * Ed25519 public key
   */
  publicKey: Uint8Array;

  /**
   * Ed25519 private key (null if the account has been disposed)
   * @security Never expose or log this value
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
				<strong>WDK TON Gasless Wallet Usage</strong>
			</td>
			<td>Get started with WDK's TON Gasless Wallet Usage</td>
			<td>
				<a href="./usage.md">WDK TON Gasless Wallet Usage</a>
			</td>
		</tr>
        <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK TON Gasless Wallet Configuration</strong>
			</td>
			<td>Get started with WDK's TON Gasless Wallet Configuration</td>
			<td>
				<a href="./configuration.md">WDK TON Gasless Wallet Configuration</a>
			</td>
		</tr>
	</tbody>
</table>

***

### Need Help?

{% include "../../../.gitbook/includes/support-cards.md" %}

