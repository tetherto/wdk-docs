---
title: Wallet BTC API Reference
description: Complete API documentation for @tetherto/wdk-wallet-btc
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
| [WalletManagerBtc](#walletmanagerbtc) | Main class for managing Bitcoin wallets. Extends `WalletManager` from `@tetherto/wdk-wallet`. | [Constructor](#constructor), [Methods](#methods) |
| [WalletAccountBtc](#walletaccountbtc) | Individual Bitcoin wallet account implementation. Implements `IWalletAccount`. | [Constructor](#constructor-1), [Methods](#methods-1), [Properties](#properties) |
| [WalletAccountReadOnlyBtc](#walletaccountreadonlybtc) | Read-only Bitcoin wallet account. Extends `WalletAccountReadOnly` from `@tetherto/wdk-wallet`. | [Constructor](#constructor-2), [Methods](#methods-2) |
| [ElectrumTcp](#electrumtcp) | Standard TCP Electrum client. Implements `IElectrumClient`. | [Constructor](#constructor-3) |
| [ElectrumTls](#electrumtls) | TLS Electrum client. Implements `IElectrumClient`. | [Constructor](#constructor-4) |
| [ElectrumSsl](#electrumssl) | SSL Electrum client. Implements `IElectrumClient`. | [Constructor](#constructor-5) |
| [ElectrumWs](#electrumws) | WebSocket Electrum client for browser environments. Implements `IElectrumClient`. | [Constructor](#constructor-6), [Methods](#methods-3) |

## WalletManagerBtc

The main class for managing Bitcoin wallets.  
Extends `WalletManager` from `@tetherto/wdk-wallet`.


#### Constructor

```javascript
new WalletManagerBtc(seed, config)
```
**Parameters:**
- `seed` (string | Uint8Array): BIP-39 mnemonic seed phrase or seed bytes
- `config` (BtcWalletConfig, optional): Configuration object
  - `client` (IElectrumClient, optional): Electrum client instance. If provided, host/port/protocol are ignored.
  - `host` (string, optional): Electrum server hostname (default: "electrum.blockstream.info"). Ignored if client is provided.
  - `port` (number, optional): Electrum server port (default: 50001). Ignored if client is provided.
  - `protocol` (string, optional): Transport protocol - "tcp", "tls", or "ssl" (default: "tcp"). Ignored if client is provided.
  - `network` (string, optional): "bitcoin", "testnet", or "regtest" (default: "bitcoin")
  - `bip` (number, optional): BIP address type - 44 (legacy) or 84 (native SegWit) (default: 84)

### Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `getAccount(index)` | Returns a wallet account at the specified index | `Promise<WalletAccountBtc>` |
| `getAccountByPath(path)` | Returns a wallet account at the specified derivation path | `Promise<WalletAccountBtc>` |
| `getFeeRates()` | Returns current fee rates for transactions | `Promise<{normal: bigint, fast: bigint}>` |
| `dispose()` | Disposes all wallet accounts, clearing private keys from memory | `void` |


##### `getAccount(index)`
Returns a wallet account at the specified index using BIP-84 (default) or BIP-44 derivation.

**Parameters:**
- `index` (number, optional): The index of the account to get (default: 0)

**Returns:** `Promise<WalletAccountBtc>` - The wallet account

**Example:**
```javascript
// Returns the account with derivation path:
// For mainnet (bitcoin): m/84'/0'/0'/0/1
// For testnet or regtest: m/84'/1'/0'/0/1
const account = await wallet.getAccount(1)
```

##### `getAccountByPath(path)`
Returns a wallet account at the specified derivation path.

**Parameters:**
- `path` (string): The derivation path (e.g., "0'/0/0")

**Returns:** `Promise<WalletAccountBtc>` - The wallet account

**Example:**
```javascript
// Returns the account with derivation path:
// For mainnet (bitcoin): m/84'/0'/0'/0/1
// For testnet or regtest: m/84'/1'/0'/0/1
const account = await wallet.getAccountByPath("0'/0/1")
```
##### `getFeeRates()`
Returns current fee rates from mempool.space API.

**Returns:** `Promise<{normal: bigint, fast: bigint}>` - Object containing fee rates in sat/vB
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

Represents an individual Bitcoin wallet account. Extends `WalletAccountReadOnlyBtc` and implements `IWalletAccount` from `@tetherto/wdk-wallet`.


#### Constructor

```javascript
new WalletAccountBtc(seed, path, config)
```

**Parameters:**
- `seed` (string | Uint8Array): BIP-39 mnemonic seed phrase or seed bytes
- `path` (string): Derivation path suffix (e.g., "0'/0/0")
- `config` (BtcWalletConfig, optional): Configuration object
  - `client` (IElectrumClient, optional): Electrum client instance. If provided, host/port/protocol are ignored.
  - `host` (string, optional): Electrum server hostname (default: "electrum.blockstream.info"). Ignored if client is provided.
  - `port` (number, optional): Electrum server port (default: 50001). Ignored if client is provided.
  - `protocol` (string, optional): Transport protocol - "tcp", "tls", or "ssl" (default: "tcp"). Ignored if client is provided.
  - `network` (string, optional): "bitcoin", "testnet", or "regtest" (default: "bitcoin")
  - `bip` (number, optional): BIP address type - 44 (legacy) or 84 (native SegWit) (default: 84)

### Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `getAddress()` | Returns the account's Bitcoin address | `Promise<string>` |
| `getBalance()` | Returns the confirmed account balance in satoshis | `Promise<bigint>` |
| `sendTransaction(options)` | Sends a Bitcoin transaction | `Promise<{hash: string, fee: bigint}>` |
| `quoteSendTransaction(options)` | Estimates the fee for a transaction | `Promise<{fee: bigint}>` |
| `getTransfers(options?)` | Returns the account's transfer history | `Promise<BtcTransfer[]>` |
| `getTransactionReceipt(hash)` | Returns a transaction's receipt | `Promise<BtcTransactionReceipt \| null>` |
| `getMaxSpendable()` | Returns the maximum spendable amount | `Promise<BtcMaxSpendableResult>` |
| `sign(message)` | Signs a message with the account's private key | `Promise<string>` |
| `verify(message, signature)` | Verifies a message signature | `Promise<boolean>` |
| `toReadOnlyAccount()` | Creates a read-only version of this account | `Promise<WalletAccountReadOnlyBtc>` |
| `dispose()` | Disposes the wallet account, clearing private keys from memory | `void` |

##### `getAddress()`
Returns the account's Bitcoin address (Native SegWit bech32 by default, or legacy if using BIP-44).

**Returns:** `Promise<string>` - The Bitcoin address

**Example:**
```javascript
const address = await account.getAddress()
console.log('Address:', address) // bc1q... (BIP-84) or 1... (BIP-44)
```
##### `getBalance()`
Returns the account's confirmed balance in satoshis.

**Returns:** `Promise<bigint>` - Balance in satoshis

**Example:**
```javascript
const balance = await account.getBalance()
console.log('Balance:', balance, 'satoshis')
```

##### `sendTransaction(options)`
Sends a Bitcoin transaction to a single recipient.

**Parameters:**
- `options` (BtcTransaction): Transaction options
  - `to` (string): Recipient's Bitcoin address
  - `value` (number | bigint): Amount in satoshis
  - `feeRate` (number | bigint, optional): Fee rate in sat/vB. If provided, overrides the fee rate estimated from the blockchain.
  - `confirmationTarget` (number, optional): Target blocks for confirmation (default: 1)

**Returns:** `Promise<{hash: string, fee: bigint}>`
- `hash`: Transaction hash
- `fee`: Transaction fee in satoshis

**Example:**
```javascript
const result = await account.sendTransaction({
  to: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  value: 50000n
})
console.log('Transaction hash:', result.hash)
console.log('Fee:', result.fee, 'satoshis')
```

##### `quoteSendTransaction(options)`
Estimates the fee for a transaction without broadcasting it.

**Parameters:**
- `options` (BtcTransaction): Same as sendTransaction options
  - `to` (string): Recipient's Bitcoin address
  - `value` (number | bigint): Amount in satoshis
  - `feeRate` (number | bigint, optional): Fee rate in sat/vB. If provided, overrides the fee rate estimated from the blockchain.
  - `confirmationTarget` (number, optional): Target blocks for confirmation (default: 1)

**Returns:** `Promise<{fee: bigint}>`
- `fee`: Estimated transaction fee in satoshis

**Example:**
```javascript
const quote = await account.quoteSendTransaction({
  to: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  value: 50000n
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
- `value`: Transfer value in satoshis (bigint)
- `direction`: 'incoming' or 'outgoing'
- `fee`: Transaction fee in satoshis (bigint, for outgoing transfers)
- `recipient`: Receiving address (for outgoing transfers)

**Example:**
```javascript
const transfers = await account.getTransfers({ 
  direction: 'incoming', 
  limit: 5 
})
console.log('Recent incoming transfers:', transfers)
```

##### `getTransactionReceipt(hash)`
Returns a transaction's receipt if it has been included in a block.

**Parameters:**
- `hash` (string): The transaction hash (64 hex characters)

**Returns:** `Promise<BtcTransactionReceipt | null>` - The receipt, or null if the transaction has not been included in a block yet.

**Example:**
```javascript
const receipt = await account.getTransactionReceipt('abc123...')
if (receipt) {
  console.log('Transaction confirmed')
}
```

##### `getMaxSpendable()`
Returns the maximum spendable amount that can be sent in a single transaction. The maximum spendable amount can differ from the wallet's total balance for several reasons:
- **Transaction fees**: Fees are subtracted from the total balance
- **Uneconomic UTXOs**: Small UTXOs where the fee to spend them exceeds their value are excluded
- **UTXO limit**: A transaction can include at most 200 inputs. Wallets with more UTXOs cannot spend their full balance in a single transaction.
- **Dust limit**: Outputs below the dust threshold (294 sats for SegWit, 546 sats for legacy) cannot be created

**Returns:** `Promise<BtcMaxSpendableResult>` - Maximum spendable result
- `amount`: Maximum spendable amount in satoshis (bigint)
- `fee`: Estimated network fee in satoshis (bigint)
- `changeValue`: Estimated change value in satoshis (bigint)

**Example:**
```javascript
const { amount, fee } = await account.getMaxSpendable()
console.log('Max spendable:', amount, 'satoshis')
console.log('Estimated fee:', fee, 'satoshis')
```

##### `sign(message)`
Signs a message using the account's private key.

**Parameters:**
- `message` (string): Message to sign

**Returns:** `Promise<string>` - Signature as base64 string

**Example:**
```javascript
const signature = await account.sign('Hello Bitcoin!')
console.log('Signature:', signature)
```

##### `verify(message, signature)`
Verifies a message signature using the account's public key.

**Parameters:**
- `message` (string): Original message
- `signature` (string): Signature as base64 string

**Returns:** `Promise<boolean>` - True if signature is valid

**Example:**
```javascript
const isValid = await account.verify('Hello Bitcoin!', signature)
console.log('Signature valid:', isValid)
```

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
| `path` | `string` | The full derivation path of this account |
| `keyPair` | `KeyPair` | The account's public and private key pair |


## WalletAccountReadOnlyBtc

Represents a read-only Bitcoin wallet account. Extends `WalletAccountReadOnly` from `@tetherto/wdk-wallet`.

#### Constructor

```javascript
new WalletAccountReadOnlyBtc(address, config)
```

**Parameters:**
- `address` (string): The account's Bitcoin address
- `config` (object, optional): Configuration object (same as BtcWalletConfig but without `bip`)
  - `client` (IElectrumClient, optional): Electrum client instance. If provided, host/port/protocol are ignored.
  - `host` (string, optional): Electrum server hostname (default: "electrum.blockstream.info"). Ignored if client is provided.
  - `port` (number, optional): Electrum server port (default: 50001). Ignored if client is provided.
  - `protocol` (string, optional): Transport protocol - "tcp", "tls", or "ssl" (default: "tcp"). Ignored if client is provided.
  - `network` (string, optional): "bitcoin", "testnet", or "regtest" (default: "bitcoin")

### Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `getAddress()` | Returns the account's Bitcoin address | `Promise<string>` |
| `getBalance()` | Returns the confirmed account balance in satoshis | `Promise<bigint>` |
| `quoteSendTransaction(options)` | Estimates the fee for a transaction | `Promise<{fee: bigint}>` |
| `getTransactionReceipt(hash)` | Returns a transaction's receipt | `Promise<BtcTransactionReceipt \| null>` |
| `getMaxSpendable()` | Returns the maximum spendable amount | `Promise<BtcMaxSpendableResult>` |
| `verify(message, signature)` | Verifies a message signature | `Promise<boolean>` |


##### `getAddress()`
Returns the account's Bitcoin address.

**Returns:** `Promise<string>` - The Bitcoin address

**Example:**
```javascript
const address = await readOnlyAccount.getAddress()
console.log('Address:', address)
```

##### `getBalance()`
Returns the account's confirmed balance in satoshis.

**Returns:** `Promise<bigint>` - Balance in satoshis

**Example:**
```javascript
const balance = await readOnlyAccount.getBalance()
console.log('Balance:', balance, 'satoshis')
```

##### `quoteSendTransaction(options)`
Estimates the fee for a transaction without broadcasting it.

**Parameters:**
- `options` (BtcTransaction): Transaction options
  - `to` (string): Recipient's Bitcoin address
  - `value` (number | bigint): Amount in satoshis
  - `feeRate` (number | bigint, optional): Fee rate in sat/vB
  - `confirmationTarget` (number, optional): Target blocks for confirmation (default: 1)

**Returns:** `Promise<{fee: bigint}>` - Estimated fee in satoshis

**Example:**
```javascript
const quote = await readOnlyAccount.quoteSendTransaction({
  to: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  value: 50000n
})
console.log('Estimated fee:', quote.fee, 'satoshis')
```

##### `getTransactionReceipt(hash)`
Returns a transaction's receipt if it has been included in a block.

**Parameters:**
- `hash` (string): The transaction hash

**Returns:** `Promise<BtcTransactionReceipt | null>` - The receipt, or null if not yet included

**Example:**
```javascript
const receipt = await readOnlyAccount.getTransactionReceipt('abc123...')
if (receipt) {
  console.log('Transaction confirmed')
}
```

##### `getMaxSpendable()`
Returns the maximum spendable amount that can be sent in a single transaction.

**Returns:** `Promise<BtcMaxSpendableResult>` - Maximum spendable result
- `amount`: Maximum spendable amount in satoshis (bigint)
- `fee`: Estimated network fee in satoshis (bigint)
- `changeValue`: Estimated change value in satoshis (bigint)

**Example:**
```javascript
const { amount, fee } = await readOnlyAccount.getMaxSpendable()
console.log('Max spendable:', amount, 'satoshis')
```

##### `verify(message, signature)`
Verifies a message signature using the account's public key.

**Parameters:**
- `message` (string): Original message
- `signature` (string): Signature as base64 string

**Returns:** `Promise<boolean>` - True if signature is valid

**Example:**
```javascript
const isValid = await readOnlyAccount.verify('Hello Bitcoin!', signature)
console.log('Signature valid:', isValid)
```


## ElectrumTcp

Electrum client using TCP transport. Standard for command-line and server-side environments.
Implements `IElectrumClient`.

#### Constructor

```javascript
new ElectrumTcp(config)
```

**Parameters:**
- `config` (Omit<MempoolElectrumConfig, 'protocol'>): Configuration options
  - `host` (string): Electrum server hostname
  - `port` (number): Electrum server port

## ElectrumTls

Electrum client using TLS transport.
Implements `IElectrumClient`.

#### Constructor

```javascript
new ElectrumTls(config)
```

**Parameters:**
- `config` (Omit<MempoolElectrumConfig, 'protocol'>): Configuration options
  - `host` (string): Electrum server hostname
  - `port` (number): Electrum server port

## ElectrumSsl

Electrum client using SSL transport.
Implements `IElectrumClient`.

#### Constructor

```javascript
new ElectrumSsl(config)
```

**Parameters:**
- `config` (Omit<MempoolElectrumConfig, 'protocol'>): Configuration options
  - `host` (string): Electrum server hostname
  - `port` (number): Electrum server port

## ElectrumWs

Electrum client using WebSocket transport. Compatible with browser environments where TCP sockets are not available.
Implements `IElectrumClient`.

#### Constructor

```javascript
new ElectrumWs(config)
```

**Parameters:**
- `config` (ElectrumWsConfig): Configuration options
  - `url` (string): The WebSocket URL (e.g., 'wss://electrum.example.com:50004')

### Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `connect()` | Establishes connection to Electrum server | `Promise<void>` |
| `close()` | Closes the connection | `Promise<void>` |
| `reconnect()` | Recreates the underlying socket and reinitializes the session | `Promise<void>` |
| `getBalance(scripthash)` | Returns balance for a script hash | `Promise<ElectrumBalance>` |
| `listUnspent(scripthash)` | Returns UTXOs for a script hash | `Promise<ElectrumUtxo[]>` |
| `getHistory(scripthash)` | Returns transaction history | `Promise<ElectrumHistoryItem[]>` |
| `getTransaction(txHash)` | Returns raw transaction hex | `Promise<string>` |
| `broadcast(rawTx)` | Broadcasts raw transaction | `Promise<string>` |
| `estimateFee(blocks)` | Returns estimated fee rate | `Promise<number>` |

## Types

### BtcTransaction

```typescript
interface BtcTransaction {
  to: string                    // The transaction's recipient
  value: number | bigint        // The amount of bitcoins to send to the recipient (in satoshis)
  confirmationTarget?: number   // Optional confirmation target in blocks (default: 1)
  feeRate?: number | bigint     // Optional fee rate in satoshis per virtual byte
}
```

### TransactionResult

```typescript
interface TransactionResult {
  hash: string  // Transaction hash/ID
  fee: bigint   // Transaction fee in satoshis
}
```

### FeeRates

```typescript
interface FeeRates {
  normal: bigint  // Standard fee rate (sat/vB) for ~1 hour confirmation
  fast: bigint    // Higher fee rate (sat/vB) for faster confirmation
}
```

### BtcTransfer

```typescript
interface BtcTransfer {
  txid: string                        // The transaction's ID
  address: string                     // The user's own address
  vout: number                        // The index of the output in the transaction
  height: number                      // The block height (if unconfirmed, 0)
  value: bigint                       // The value of the transfer (in satoshis)
  direction: 'incoming' | 'outgoing'  // The direction of the transfer
  fee?: bigint                        // The fee paid for the full transaction (in satoshis)
  recipient?: string                  // The receiving address for outgoing transfers
}
```

### BtcMaxSpendableResult

```typescript
interface BtcMaxSpendableResult {
  amount: bigint      // The maximum spendable amount in satoshis
  fee: bigint         // The estimated network fee in satoshis
  changeValue: bigint // The estimated change value in satoshis
}
```

### KeyPair

```typescript
interface KeyPair {
  publicKey: Uint8Array          // Public key bytes
  privateKey: Uint8Array | null  // Private key bytes (null after dispose)
}
```

### BtcWalletConfig

```typescript
interface BtcWalletConfig {
  client?: IElectrumClient                    // Electrum client instance. If provided, host/port/protocol are ignored.
  host?: string                               // Electrum server hostname (default: "electrum.blockstream.info")
  port?: number                               // Electrum server port (default: 50001)
  protocol?: 'tcp' | 'tls' | 'ssl'            // Transport protocol (default: "tcp")
  network?: 'bitcoin' | 'testnet' | 'regtest' // Network to use (default: "bitcoin")
  bip?: 44 | 84                               // BIP address type - 44 (legacy) or 84 (native SegWit) (default: 84)
}
```

### IElectrumClient

Interface for implementing custom Electrum clients.
```typescript
interface IElectrumClient {
  connect(): Promise<void>
  close(): Promise<void>
  reconnect(): Promise<void>
  getBalance(scripthash: string): Promise<ElectrumBalance>
  listUnspent(scripthash: string): Promise<ElectrumUtxo[]>
  getHistory(scripthash: string): Promise<ElectrumHistoryItem[]>
  getTransaction(txHash: string): Promise<string>
  broadcast(rawTx: string): Promise<string>
  estimateFee(blocks: number): Promise<number>
}
```

### ElectrumBalance
```typescript
interface ElectrumBalance {
  confirmed: number    // Confirmed balance in satoshis
  unconfirmed?: number // Unconfirmed balance in satoshis
}
```

### ElectrumUtxo
```typescript
interface ElectrumUtxo {
  tx_hash: string  // The transaction hash containing this UTXO
  tx_pos: number   // The output index within the transaction
  value: number    // The UTXO value in satoshis
  height?: number  // The block height (0 if unconfirmed)
}
```

### ElectrumHistoryItem
```typescript
interface ElectrumHistoryItem {
  tx_hash: string // The transaction hash
  height: number  // The block height (0 or negative if unconfirmed)
}
```

### MempoolElectrumConfig

```typescript
interface MempoolElectrumConfig {
  host: string              // Electrum server hostname
  port: number              // Electrum server port
  protocol?: 'tcp' | 'ssl' | 'tls' // Transport protocol (default: 'tcp')
  maxRetry?: number         // Maximum reconnection attempts (default: 2)
  retryPeriod?: number      // Delay between reconnection attempts in ms (default: 1000)
  pingPeriod?: number       // Delay between keep-alive pings in ms (default: 120000)
  callback?: (err: Error | null) => void // Called when all retries are exhausted
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
				<a href="./usage.md">WDK Bitcoin Wallet Usage</a>
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

{% include "../../../.gitbook/includes/support-cards.md" %}