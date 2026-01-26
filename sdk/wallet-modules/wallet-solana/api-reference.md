---
title: Wallet Solana API Reference
description: Complete API documentation for @tetherto/wdk-wallet-solana
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

### Table of Contents

| Class | Description | Methods |
|-------|-------------|---------|
| [WalletManagerSolana](#walletmanagersolana) | Main class for managing Solana wallets. Extends `WalletManager` from `@tetherto/wdk-wallet`. | [Constructor](#constructor), [Methods](#methods) |
| [WalletAccountSolana](#walletaccountsolana) | Individual Solana wallet account implementation. Extends `WalletAccountReadOnlySolana` and implements `IWalletAccount`. | [Constructor](#constructor-1), [Methods](#methods-1), [Properties](#properties) |
| [WalletAccountReadOnlySolana](#walletaccountreadonlysolana) | Read-only Solana wallet account. | [Constructor](#constructor-2), [Methods](#methods-2) |

### WalletManagerSolana

The main class for managing Solana wallets.  
Extends `WalletManager` from `@tetherto/wdk-wallet`.

#### Constructor

```javascript
new WalletManagerSolana(seed, config)
```

**Parameters:**
- `seed` (string | Uint8Array): BIP-39 mnemonic seed phrase or seed bytes
- `config` (object): Configuration object
  - `rpcUrl` (string | Connection): RPC endpoint URL or Solana Connection instance
  - `commitment` (string, optional): Commitment level ('processed', 'confirmed', or 'finalized')
  - `transferMaxFee` (number, optional): Maximum fee amount for transfer operations (in lamports)

**Example:**
```javascript
const wallet = new WalletManagerSolana(seedPhrase, {
  rpcUrl: 'https://api.mainnet-beta.solana.com',
  commitment: 'confirmed',
  transferMaxFee: 5000 // Maximum fee in lamports
})
```

#### Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `getAccount(index)` | Returns a wallet account at the specified index | `Promise<WalletAccountSolana>` |
| `getAccountByPath(path)` | Returns a wallet account at the specified BIP-44 derivation path | `Promise<WalletAccountSolana>` |
| `getFeeRates()` | Returns current fee rates for transactions | `Promise<{normal: number, fast: number}>` |
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
Returns current fee rates for transactions based on recent prioritization fees.

**Returns:** `Promise<{normal: number, fast: number}>` - Object containing fee rates in lamports

**Throws:** Error if wallet is not connected to a provider

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

### WalletAccountSolana

Represents an individual Solana wallet account. Extends `WalletAccountReadOnlySolana` and implements `IWalletAccount`.

#### Constructor

```javascript
new WalletAccountSolana(seed, path, config)
```

**Parameters:**
- `seed` (string | Uint8Array): BIP-39 mnemonic seed phrase or seed bytes
- `path` (string): BIP-44 derivation path (e.g., "0'/0/0")
- `config` (SolanaWalletConfig, optional): Configuration object

#### Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `getAddress()` | Returns the account's Solana address | `Promise<string>` |
| `sign(message)` | Signs a message using the account's private key | `Promise<string>` |
| `verify(message, signature)` | Verifies a message signature | `Promise<boolean>` |
| `sendTransaction(tx)` | Sends a Solana transaction | `Promise<{hash: string, fee: number}>` |
| `quoteSendTransaction(tx)` | Estimates the fee for a transaction | `Promise<{fee: number}>` |
| `transfer(options)` | Transfers SPL tokens to another address | `Promise<{hash: string, fee: number}>` |
| `quoteTransfer(options)` | Estimates the fee for an SPL token transfer | `Promise<{fee: number}>` |
| `getBalance()` | Returns the native SOL balance (in lamports) | `Promise<number>` |
| `getTokenBalance(tokenMint)` | Returns the balance of a specific SPL token | `Promise<number>` |
| `toReadOnlyAccount()` | Returns a read-only copy of the account | `Promise<WalletAccountReadOnlySolana>` |
| `dispose()` | Disposes the wallet account, clearing private keys from memory | `void` |

##### `getAddress()`
Returns the account's Solana address.

**Returns:** `Promise<string>` - The account's base58-encoded Solana address

**Example:**
```javascript
const address = await account.getAddress()
console.log('Account address:', address)
```

##### `sign(message)`
Signs a message using the account's private key.

**Parameters:**
- `message` (string): The message to sign

**Returns:** `Promise<string>` - The message signature (hex-encoded)

**Example:**
```javascript
const signature = await account.sign('Hello, Solana!')
console.log('Signature:', signature)
```

##### `verify(message, signature)`
Verifies a message signature.

**Parameters:**
- `message` (string): The original message
- `signature` (string): The signature to verify (hex-encoded)

**Returns:** `Promise<boolean>` - True if the signature is valid

**Example:**
```javascript
const isValid = await account.verify('Hello, Solana!', signature)
console.log('Signature valid:', isValid)
```

##### `sendTransaction(tx)`
Sends a Solana transaction.

**Parameters:**
- `tx` (SolanaTransaction): The transaction object
  - `to` (string): Recipient's Solana address (base58-encoded)
  - `value` (number): Amount in lamports

**Returns:** `Promise<{hash: string, fee: number}>` - Object containing transaction hash and fee (in lamports)

**Throws:** Error if wallet is not connected to a provider

**Example:**
```javascript
const result = await account.sendTransaction({
  to: '11111111111111111111111111111112',
  value: 1000000000 // 1 SOL in lamports
})
console.log('Transaction hash:', result.hash)
console.log('Transaction fee:', result.fee, 'lamports')
```
##### `quoteSendTransaction(tx)`
Estimates the fee for a Solana transaction.

**Parameters:**
- `tx` (SolanaTransaction): The transaction object (same as sendTransaction)

**Returns:** `Promise<{fee: number}>` - Object containing fee estimate (in lamports)

**Example:**
```javascript
const quote = await account.quoteSendTransaction({
  to: '11111111111111111111111111111112',
  value: 1000000000
})
console.log('Estimated fee:', quote.fee, 'lamports')
```

##### `transfer(options)`
Transfers SPL tokens to another address.

**Parameters:**
- `options` (TransferOptions): Transfer options
  - `token` (string): Token mint address (base58-encoded)
  - `recipient` (string): Recipient's Solana address (base58-encoded)
  - `amount` (number): Amount in token's base units

**Returns:** `Promise<{hash: string, fee: number}>` - Object containing transaction hash and fee (in lamports)

**Throws:** Error if wallet is not connected to a provider or if fee exceeds maximum

**Example:**
```javascript
const result = await account.transfer({
  token: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT mint
  recipient: '11111111111111111111111111111112',
  amount: 1000000 // 1 USDT (6 decimals)
})
console.log('Transfer hash:', result.hash)
console.log('Transfer fee:', result.fee, 'lamports')
```

##### `quoteTransfer(options)`
Estimates the fee for an SPL token transfer.

**Parameters:**
- `options` (TransferOptions): Transfer options (same as transfer)

**Returns:** `Promise<{fee: number}>` - Object containing fee estimate (in lamports)

**Example:**
```javascript
const quote = await account.quoteTransfer({
  token: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  recipient: '11111111111111111111111111111112',
  amount: 1000000
})
console.log('Transfer fee estimate:', quote.fee, 'lamports')
```
##### `getBalance()`
Returns the native SOL balance (in lamports).

**Returns:** `Promise<number>` - Balance in lamports

**Example:**
```javascript
const balance = await account.getBalance()
console.log('SOL balance:', balance, 'lamports')
```

##### `getTokenBalance(tokenMint)`
Returns the balance of a specific SPL token.

**Parameters:**
- `tokenMint` (string): Token mint address (base58-encoded)

**Returns:** `Promise<number>` - Token balance in base units

**Example:**
```javascript
const tokenBalance = await account.getTokenBalance('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB')
console.log('USDT balance:', tokenBalance)
```

##### `toReadOnlyAccount()`
Returns a read-only copy of the account.

**Returns:** `Promise<WalletAccountReadOnlySolana>` - The read-only account

**Example:**
```javascript
const readOnlyAccount = await account.toReadOnlyAccount()
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
| `keyPair` | `{publicKey: Buffer, privateKey: Buffer}` | The account's Ed25519 key pair |

⚠️ **Security Note**: The `keyPair` property contains sensitive cryptographic material. Never log, display, or expose the private key.


### WalletAccountReadOnlySolana

Represents a read-only Solana wallet account.

#### Constructor

```javascript
new WalletAccountReadOnlySolana(publicKey, config)
```

**Parameters:**
- `publicKey` (string): The account's public key (base58-encoded)
- `config` (SolanaWalletConfig, optional): Configuration object

#### Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `getAddress()` | Returns the account's Solana address | `Promise<string>` |
| `verify(message, signature)` | Verifies a message signature | `Promise<boolean>` |
| `getBalance()` | Returns the native SOL balance (in lamports) | `Promise<number>` |
| `getTokenBalance(tokenMint)` | Returns the balance of a specific SPL token | `Promise<number>` |
| `quoteSendTransaction(tx)` | Estimates the fee for a transaction | `Promise<{fee: number}>` |
| `quoteTransfer(options)` | Estimates the fee for an SPL token transfer | `Promise<{fee: number}>` |

##### `getAddress()`
Returns the account's Solana address.

**Returns:** `Promise<string>` - The account's base58-encoded Solana address

**Example:**
```javascript
const address = await readOnlyAccount.getAddress()
console.log('Account address:', address)
```

##### `verify(message, signature)`
Verifies a message signature.

**Parameters:**
- `message` (string): The original message
- `signature` (string): The signature to verify (hex-encoded)

**Returns:** `Promise<boolean>` - True if the signature is valid

**Example:**
```javascript
const isValid = await readOnlyAccount.verify('Hello, Solana!', signature)
console.log('Signature valid:', isValid)
```

##### `getBalance()`
Returns the native SOL balance (in lamports).

**Returns:** `Promise<number>` - Balance in lamports

**Example:**
```javascript
const balance = await readOnlyAccount.getBalance()
console.log('SOL balance:', balance, 'lamports')
```

##### `getTokenBalance(tokenMint)`
Returns the balance of a specific SPL token.

**Parameters:**
- `tokenMint` (string): Token mint address (base58-encoded)

**Returns:** `Promise<number>` - Token balance in base units

**Example:**
```javascript
const tokenBalance = await readOnlyAccount.getTokenBalance('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB')
console.log('USDT balance:', tokenBalance)
```

##### `quoteSendTransaction(tx)`
Estimates the fee for a transaction.

**Parameters:**
- `tx` (SolanaTransaction): The transaction object
  - `to` (string): Recipient's Solana address (base58-encoded)
  - `value` (number): Amount in lamports

**Returns:** `Promise<{fee: number}>` - Object containing fee estimate (in lamports)

**Example:**
```javascript
const quote = await readOnlyAccount.quoteSendTransaction({
  to: '11111111111111111111111111111112',
  value: 1000000000
})
console.log('Estimated fee:', quote.fee, 'lamports')
```
##### `quoteTransfer(options)`
Estimates the fee for an SPL token transfer.

**Parameters:**
- `options` (TransferOptions): Transfer options
  - `token` (string): Token mint address (base58-encoded)
  - `recipient` (string): Recipient's Solana address (base58-encoded)
  - `amount` (number): Amount in token's base units

**Returns:** `Promise<{fee: number}>` - Object containing fee estimate (in lamports)

**Example:**
```javascript
const quote = await readOnlyAccount.quoteTransfer({
  token: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  recipient: '11111111111111111111111111111112',
  amount: 1000000
})
console.log('Transfer fee estimate:', quote.fee, 'lamports')
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
				<strong>WDK Solana Wallet Usage</strong>
			</td>
			<td>Get started with WDK's Solana Wallet Usage</td>
			<td>
				<a href="./usage.md">WDK Solana Wallet Usage</a>
			</td>
		</tr>
        <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK Solana Wallet Configuration</strong>
			</td>
			<td>Get started with WDK's Solana Wallet Configuration</td>
			<td>
				<a href="./configuration.md">WDK Solana Wallet Configuration</a>
			</td>
		</tr>
	</tbody>
</table>

***

### Need Help?

{% include "../../../.gitbook/includes/support-cards.md" %}
