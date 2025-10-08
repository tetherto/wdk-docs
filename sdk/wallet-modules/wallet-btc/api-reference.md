---
title: Wallet BTC API Reference
description: Complete API documentation for @tetherto/wdk-wallet-btc
author: Matteo Giardino
lastReviewed: 2025-06-26
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
| [WalletManagerBtc](#walletmanagerbtc) | Main class for managing Bitcoin wallets. Extends `WalletManager` from `@tetherto/wdk-wallet`. | [Constructor](#constructor), [Methods](#methods) |
| [WalletAccountBtc](#walletaccountbtc) | Individual Bitcoin wallet account implementation. Implements `IWalletAccount`. | [Constructor](#constructor-1), [Methods](#methods-1), [Properties](#properties) |

## WalletManagerBtc

The main class for managing Bitcoin wallets.  
Extends `WalletManager` from `@tetherto/wdk-wallet`.


#### Constructor

```javascript
new WalletManagerBtc(seed, config)
```
**Parameters:**
- `seed` (string | Uint8Array): BIP-39 mnemonic seed phrase or seed bytes
- `config` (object, optional): Configuration object
  - `host` (string, optional): Electrum server hostname (default: "electrum.blockstream.info")
  - `port` (number, optional): Electrum server port (default: 50001)
  - `network` (string, optional): "bitcoin", "testnet", or "regtest" (default: "bitcoin")

### Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `getAccount(index)` | Returns a wallet account at the specified index | `Promise<WalletAccountBtc>` |
| `getAccountByPath(path)` | Returns a wallet account at the specified BIP-84 derivation path | `Promise<WalletAccountBtc>` |
| `getFeeRates()` | Returns current fee rates for transactions | `Promise<{normal: number, fast: number}>` |
| `dispose()` | Disposes all wallet accounts, clearing private keys from memory | `void` |


##### `getAccount(index)`
Returns a wallet account at the specified index using BIP-84 derivation.

**Parameters:**
- `index` (number, optional): The index of the account to get (default: 0)

**Returns:** `Promise<WalletAccountBtc>` - The wallet account

**Example:**
```javascript
const account = await wallet.getAccount(0)
```

##### `getAccountByPath(path)`
Returns a wallet account at the specified BIP-84 derivation path.

**Parameters:**
- `path` (string): The derivation path (e.g., "0'/0/0")

**Returns:** `Promise<WalletAccountBtc>` - The wallet account

**Example:**
```javascript
const account = await wallet.getAccountByPath("0'/0/1")
```
##### `getFeeRates()`
Returns current fee rates from mempool.space API.

**Returns:** `Promise<{normal: number, fast: number}>` - Object containing fee rates in sat/vB
- `normal`: Standard fee rate for confirmation within ~1 hour
- `fast`: Higher fee rate for faster confirmation

**Example:**
```javascript
const feeRates = await wallet.getFeeRates()
console.log('Normal fee rate:', feeRates.normal, 'sat/vB')
console.log('Fast fee rate:', feeRates.fast, 'sat/vB')
```

##### `dispose()`
Disposes all wallet accounts and clears sensitive data from memory.

**Returns:** `void`

**Example:**
```javascript
wallet.dispose()
```

## WalletAccountBtc

Represents an individual Bitcoin wallet account. Implements `IWalletAccount` from `@tetherto/wdk-wallet`.


#### Constructor

```javascript
new WalletAccountBtc(seed, path, config)
```

**Parameters:**
- `seed` (string | Uint8Array): BIP-39 mnemonic seed phrase or seed bytes
- `path` (string): BIP-84 derivation path (e.g., "0'/0/0")
- `config` (object, optional): Configuration object
  - `host` (string, optional): Electrum server hostname (default: "electrum.blockstream.info")
  - `port` (number, optional): Electrum server port (default: 50001)
  - `network` (string, optional): "bitcoin", "testnet", or "regtest" (default: "bitcoin")

### Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `getAddress()` | Returns the account's Native SegWit address | `Promise<string>` |
| `getBalance()` | Returns the confirmed account balance in satoshis | `Promise<number>` |
| `sendTransaction(options)` | Sends a Bitcoin transaction | `Promise<{hash: string, fee: number}>` |
| `quoteSendTransaction(options)` | Estimates the fee for a transaction | `Promise<{fee: number}>` |
| `getTransfers(options?)` | Returns the account's transfer history | `Promise<BtcTransfer[]>` |
| `sign(message)` | Signs a message with the account's private key | `Promise<string>` |
| `verify(message, signature)` | Verifies a message signature | `Promise<boolean>` |
| `toReadOnlyAccount()` | Creates a read-only version of this account | `Promise<WalletAccountReadOnlyBtc>` |
| `dispose()` | Disposes the wallet account, clearing private keys from memory | `void` |

##### `getAddress()`
Returns the account's Native SegWit (bech32) address.

**Returns:** `Promise<string>` - The Bitcoin address

**Example:**
```javascript
const address = await account.getAddress()
console.log('Address:', address) // bc1q...
```
##### `getBalance()`
Returns the account's confirmed balance in satoshis.

**Returns:** `Promise<number>` - Balance in satoshis

**Example:**
```javascript
const balance = await account.getBalance()
console.log('Balance:', balance, 'satoshis')
```

##### `sendTransaction(options)`
Sends a Bitcoin transaction to a single recipient.

**Parameters:**
- `options` (object): Transaction options
  - `to` (string): Recipient's Bitcoin address
  - `value` (number): Amount in satoshis

**Returns:** `Promise<{hash: string, fee: number}>`
- `hash`: Transaction hash
- `fee`: Transaction fee in satoshis

**Example:**
```javascript
const result = await account.sendTransaction({
  to: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  value: 50000
})
console.log('Transaction hash:', result.hash)
console.log('Fee:', result.fee, 'satoshis')
```

##### `quoteSendTransaction(options)`
Estimates the fee for a transaction without broadcasting it.

**Parameters:**
- `options` (object): Same as sendTransaction options
  - `to` (string): Recipient's Bitcoin address
  - `value` (number): Amount in satoshis

**Returns:** `Promise<{fee: number}>`
- `fee`: Estimated transaction fee in satoshis

**Example:**
```javascript
const quote = await account.quoteSendTransaction({
  to: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  value: 50000
})
console.log('Estimated fee:', quote.fee, 'satoshis')
```

##### `getTransfers(options?)`
Returns the account's transfer history with detailed transaction information.

**Parameters:**
- `options` (object, optional): Filter options
  - `direction` (string, optional): 'incoming', 'outgoing', or 'all' (default: 'all')
  - `limit` (number, optional): Maximum number of transfers (default: 10)
  - `skip` (number, optional): Number of transfers to skip (default: 0)

**Returns:** `Promise<BtcTransfer[]>` - Array of transfer objects
- `txid`: Transaction ID
- `address`: Account's own address
- `vout`: Output index in the transaction
- `height`: Block height (0 if unconfirmed)
- `value`: Transfer value in satoshis
- `direction`: 'incoming' or 'outgoing'
- `fee`: Transaction fee in satoshis (for outgoing transfers)
- `recipient`: Receiving address (for outgoing transfers)

**Example:**
```javascript
const transfers = await account.getTransfers({ 
  direction: 'incoming', 
  limit: 5 
})
console.log('Recent incoming transfers:', transfers)
```

##### `sign(message)`
Signs a message using the account's private key.

**Parameters:**
- `message` (string): Message to sign

**Returns:** `Promise<string>` - Signature as hex string

**Example:**
```javascript
const signature = await account.sign('Hello Bitcoin!')
console.log('Signature:', signature)
```

##### `verify(message, signature)`
Verifies a message signature using the account's public key.

**Parameters:**
- `message` (string): Original message
- `signature` (string): Signature as hex string

**Returns:** `Promise<boolean>` - True if signature is valid

**Example:**
```javascript
const isValid = await account.verify('Hello Bitcoin!', signature)
console.log('Signature valid:', isValid)
```

##### `getTokenBalance(tokenAddress)`
Not supported on the Bitcoin blockchain. Always throws an error.

**Parameters:**
- `tokenAddress` (string): Token contract address

**Throws:** Error - "The 'getTokenBalance' method is not supported on the bitcoin blockchain."

**Example:**
```javascript
// This will throw an error
try {
  await account.getTokenBalance('some-address')
} catch (error) {
  console.log(error.message) // Not supported on bitcoin blockchain
}
```

##### `transfer(options)`
Not supported on the Bitcoin blockchain. Always throws an error.

**Parameters:**
- `options` (object): Transfer options

**Throws:** Error - "The 'transfer' method is not supported on the bitcoin blockchain."

##### `quoteTransfer(options)`
Not supported on the Bitcoin blockchain. Always throws an error.

**Parameters:**
- `options` (object): Transfer options

**Throws:** Error - "The 'quoteTransfer' method is not supported on the bitcoin blockchain."

##### `toReadOnlyAccount()`
Creates a read-only version of this account that can query balances and transactions but cannot sign or send transactions.

**Returns:** `Promise<WalletAccountReadOnlyBtc>` - Read-only account instance

**Example:**
```javascript
const readOnlyAccount = await account.toReadOnlyAccount()
const balance = await readOnlyAccount.getBalance()
```

##### `dispose()`
Disposes the wallet account, securely erasing the private key from memory and closing the Electrum connection.

**Returns:** `void`

**Example:**
```javascript
account.dispose()
// Private key is now securely wiped from memory
```


#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `index` | `number` | The derivation path's index of this account |
| `path` | `string` | The full BIP-84 derivation path of this account |
| `keyPair` | `KeyPair` | The account's public and private key pair |



## Types

### BtcTransaction

```typescript
interface BtcTransaction {
  to: string     // The transaction's recipient
  value: number  // The amount of bitcoins to send to the recipient (in satoshis)
}
```

### TransactionResult

```typescript
interface TransactionResult {
  hash: string  // Transaction hash/ID
  fee: number   // Transaction fee in satoshis
}
```

### FeeRates

```typescript
interface FeeRates {
  normal: number  // Standard fee rate (sat/vB) for ~1 hour confirmation
  fast: number    // Higher fee rate (sat/vB) for faster confirmation
}
```

### BtcTransfer

```typescript
interface BtcTransfer {
  txid: string                        // The transaction's ID
  address: string                     // The user's own address
  vout: number                        // The index of the output in the transaction
  height: number                      // The block height (if unconfirmed, 0)
  value: number                       // The value of the transfer (in satoshis)
  direction: 'incoming' | 'outgoing'  // The direction of the transfer
  fee?: number                        // The fee paid for the full transaction (in satoshis)
  recipient?: string                  // The receiving address for outgoing transfers
}
```

### KeyPair

```typescript
interface KeyPair {
  publicKey: Uint8Array   // Public key bytes
  privateKey: Uint8Array  // Private key bytes
}
```

### BtcWalletConfig

```typescript
interface BtcWalletConfig {
  host?: string                              // Electrum server hostname (default: "electrum.blockstream.info")
  port?: number                              // Electrum server port (default: 50001)
  network?: 'bitcoin' | 'testnet' | 'regtest' // Network to use (default: "bitcoin")
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
				<strong>WDK Bitcoin Wallet Usage</strong>
			</td>
			<td>Get started with WDK's Bitcoin Wallet Usage</td>
			<td>
				<a href="./configuration.md">WDK Bitcoin Wallet Usage</a>
			</td>
		</tr>
        <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK Bitcoin Wallet Configuration</strong>
			</td>
			<td>Get started with WDK's Bitcoin Wallet Configuration</td>
			<td>
				<a href="./configuration.md">WDK Bitcoin Wallet Configuration</a>
			</td>
		</tr>
	</tbody>
</table>

***

### Need Help?

{% include "../../.gitbook/includes/support-cards.md" %}
