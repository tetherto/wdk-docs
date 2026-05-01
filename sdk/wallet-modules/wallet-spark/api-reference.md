---
title: Wallet Spark API Reference
description: Complete API documentation for @tetherto/wdk-wallet-spark
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
| [WalletManagerSpark](#walletmanagerspark) | Main class for managing Spark wallets. Extends `WalletManager` from `@tetherto/wdk-wallet`. | [Constructor](#constructor), [Methods](#methods) |
| [WalletAccountSpark](#walletaccountspark) | Individual Spark wallet account implementation. Implements `IWalletAccount`. | [Constructor](#constructor-1), [Methods](#methods-1), [Properties](#properties) |
| [WalletAccountReadOnlySpark](#walletaccountreadonlyspark) | Read-only Spark wallet account. | [Constructor](#constructor-2), [Methods](#methods-2) |

## WalletManagerSpark

The main class for managing Spark wallets.  
Extends `WalletManager` from `@tetherto/wdk-wallet`.

#### Constructor

```javascript
new WalletManagerSpark(seed, config)
```
**Parameters:**
- `seed` (string | Uint8Array): BIP-39 mnemonic seed phrase or seed bytes
- `config` (object, optional): Configuration object
  - `network` (string, optional): 'MAINNET', 'SIGNET', or 'REGTEST' (default: 'MAINNET')
  - `sparkscan` (`SparkScanConfig`, optional): SparkScan configuration for balance polling
  - `syncAndRetry` (boolean, optional): When true, failed sends and Lightning payments sync wallet state and retry once

### Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `getAccount(index)` | Returns a wallet account at the specified index | `Promise<WalletAccountSpark>` |
| `getAccountByPath(path)` | Returns a wallet account at a specific BIP-44 derivation path | `Promise<WalletAccountSpark>` |
| `getFeeRates()` | Returns current fee rates for transactions (always zero for Spark) | `Promise<{normal: bigint, fast: bigint}>` |
| `dispose()` | Disposes all wallet accounts, clearing private keys from memory | `void` |

##### `getAccount(index)`
Returns a wallet account at the specified index using BIP-44 derivation path.

**Parameters:**
- `index` (number, optional): The index of the account to get (default: 0)

**Returns:** `Promise<WalletAccountSpark>` - The wallet account

**Example:**
```javascript
const account = await wallet.getAccount(0)
const account1 = await wallet.getAccount(1)
```

**Note:** Uses derivation path pattern `m/44'/998'/{networkNumber}'/0/{index}` where 998 is the coin type for Spark and networkNumber is 0 for MAINNET, 2 for SIGNET, or 3 for REGTEST.

##### `getFeeRates()`
Returns current fee rates for transactions. On Spark network, transactions have zero fees.

**Returns:** `Promise<{normal: bigint, fast: bigint}>` - Object containing fee rates (always `{normal: 0n, fast: 0n}`)

**Example:**
```javascript
const feeRates = await wallet.getFeeRates()
console.log('Normal fee rate:', feeRates.normal) // Always 0n
console.log('Fast fee rate:', feeRates.fast)     // Always 0n
```

##### `dispose()`
Disposes all wallet accounts and clears sensitive data from memory.

**Returns:** `void`

**Example:**
```javascript
wallet.dispose()
```

##### `getAccountByPath(path)`
Returns a wallet account at a specific BIP-44 derivation path.

**Parameters:**
- `path` (string): The derivation path segment (e.g. `"0'/0/0"`)

**Returns:** `Promise<WalletAccountSpark>` - The wallet account

**Example:**
```javascript
const account = await wallet.getAccountByPath("0'/0/0")
const address = await account.getAddress()
console.log('Account address:', address)
```

**Important Notes:**
- All Spark transactions have zero fees
- Network configuration is limited to predefined values


## WalletAccountSpark

Represents an individual Spark wallet account. Implements `IWalletAccount` from `@tetherto/wdk-wallet`.

**Note**: WalletAccountSpark instances are created internally by `WalletManagerSpark.getAccount()` and are not intended to be constructed directly.

### Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `getAddress()` | Returns the account's Spark address | `Promise<SparkAddressFormat>` |
| `sign(message)` | Signs a message using the account's identity key | `Promise<string>` |
| `signTransaction(tx)` | Always throws because Spark does not support standalone signed transaction payloads | `Promise<never>` |
| `getIdentityKey()` | Returns the account's identity public key | `Promise<string>` |
| `verify(message, signature)` | Verifies a message signature | `Promise<boolean>` |
| `sendTransaction(tx)` | Sends a Spark transaction | `Promise<{hash: string, fee: bigint}>` |
| `quoteSendTransaction(tx)` | Estimates transaction fee (always 0) | `Promise<{fee: bigint}>` |
| `transfer(options)` | Transfers tokens to another address | `Promise<{hash: string, fee: bigint}>` |
| `quoteTransfer(options)` | Quotes the costs of a transfer operation | `Promise<{fee: bigint}>` |
| `getBalance()` | Returns the native token balance in satoshis | `Promise<bigint>` |
| `getTokenBalance(tokenAddress)` | Returns the balance for a specific token | `Promise<bigint>` |
| `getTransactionReceipt(hash)` | Returns a Spark transfer by its ID | `Promise<SparkTransfer \| null>` |
| `getTransfers(options?)` | Returns the account's transfer history | `Promise<SparkTransfer[]>` |
| `getSingleUseDepositAddress()` | Generates a single-use Bitcoin deposit address | `Promise<string>` |
| `getUnusedDepositAddresses(options?)` | Returns unused single-use deposit addresses | `Promise<{depositAddresses: DepositAddressQueryResult[], offset: number}>` |
| `getStaticDepositAddress()` | Gets or creates a reusable static deposit address | `Promise<string>` |
| `getStaticDepositAddresses()` | Returns all existing static deposit addresses | `Promise<DepositAddressQueryResult[]>` |
| `getUtxosForDepositAddress(options)` | Returns confirmed UTXOs for a deposit address | `Promise<{utxos: {txid: string, vout: number}[], offset: number}>` |
| `claimDeposit(txId)` | Claims a Bitcoin deposit to the wallet | `Promise<WalletLeaf[] \| undefined>` |
| `claimStaticDeposit(txId)` | Claims a static Bitcoin deposit to the wallet | `Promise<WalletLeaf[] \| undefined>` |
| `refundStaticDeposit(options)` | Refunds a static deposit back to a Bitcoin address | `Promise<string>` |
| `quoteWithdraw(options)` | Gets a fee quote for withdrawing funds | `Promise<CoopExitFeeQuote>` |
| `withdraw(options)` | Withdraws funds to a Bitcoin address | `Promise<CoopExitRequest \| null \| undefined>` |
| `createLightningInvoice(options)` | Creates a Lightning invoice | `Promise<LightningReceiveRequest>` |
| `getLightningReceiveRequest(invoiceId)` | Gets Lightning receive request by id | `Promise<LightningReceiveRequest \| null>` |
| `getLightningSendRequest(requestId)` | Gets Lightning send request by id | `Promise<LightningSendRequest \| null>` |
| `payLightningInvoice(options)` | Pays a Lightning invoice | `Promise<LightningSendRequest>` |
| `quotePayLightningInvoice(options)` | Gets fee estimate for Lightning payments | `Promise<bigint>` |
| `createSparkSatsInvoice(options)` | Creates a Spark invoice for receiving sats | `Promise<SparkAddressFormat>` |
| `createSparkTokensInvoice(options)` | Creates a Spark invoice for receiving tokens | `Promise<SparkAddressFormat>` |
| `paySparkInvoice(invoices)` | Pays one or more Spark invoices | `Promise<FulfillSparkInvoiceResponse>` |
| `syncWalletBalance()` | Reconciles wallet state and waits for any triggered optimization to complete | `Promise<void>` |
| `getSparkInvoices(params)` | Queries the status of Spark invoices | `Promise<{invoiceStatuses: InvoiceResponse[], offset: number}>` |
| `toReadOnlyAccount()` | Creates a read-only version of this account | `Promise<WalletAccountReadOnlySpark>` |
| `cleanupConnections()` | Cleans up network connections and resources | `Promise<void>` |
| `dispose()` | Disposes the wallet account, clearing private keys | `void` |


##### `getAddress()`
Returns the account's Spark network address.

**Returns:** `Promise<SparkAddressFormat>` - The Spark address

**Example:**
```javascript
const address = await account.getAddress()
console.log('Spark address:', address)
```
##### `sign(message)`
Signs a message using the account's identity key.

**Parameters:**
- `message` (string): The message to sign

**Returns:** `Promise<string>` - The message signature

**Example:**
```javascript
const signature = await account.sign('Hello, Spark!')
console.log('Signature:', signature)
```

##### `signTransaction(tx)`
Exposes the base `IWalletAccount.signTransaction(tx)` method, but standalone Spark transaction signing is not supported. Spark transfers are signed collaboratively with Spark operators through the FROST / Statechain protocol, so this method always throws. Use [`sendTransaction()`](#sendtransaction-to-value) to send Spark transactions.

**Parameters:**
- `tx` ([`SparkTransaction`](#sparktransaction)): The transaction request

**Returns:** `Promise<never>` - Always throws

**Example:**
```javascript
try {
  await account.signTransaction({
    to: 'spark1...',
    value: 1000000
  })
} catch (error) {
  console.error(error.message) // Method 'signTransaction(tx)' not supported on spark.
}
```

##### `getIdentityKey()`
Returns the account's identity public key (hex-encoded).

**Returns:** `Promise<string>` - The identity public key

**Example:**
```javascript
const identityKey = await account.getIdentityKey()
console.log('Identity key:', identityKey) // 02eda8...
```

##### `sendTransaction({to, value})`
Sends a Spark transaction.

When `syncAndRetry` is enabled, the wallet syncs state and retries once after a failure.

**Parameters:**
- `to` (string): Recipient's Spark address
- `value` (number): Amount in satoshis

**Returns:** `Promise<{hash: string, fee: bigint}>` (fee is always 0)

**Example:**
```javascript
const result = await account.sendTransaction({
  to: 'spark1...',
  value: 1000000
})
console.log('Transaction hash:', result.hash)
console.log('Fee:', Number(result.fee)) // Always 0
```

##### `quoteSendTransaction({to, value})`
Estimates the fee for a Spark transaction (always returns 0).

**Parameters:**
- `to` (string): Recipient's Spark address
- `value` (number): Amount in satoshis

**Returns:** `Promise<{fee: bigint}>` - Fee estimate (always 0)

**Example:**
```javascript
const quote = await account.quoteSendTransaction({
  to: 'spark1...',
  value: 1000000
})
console.log('Estimated fee:', Number(quote.fee)) // Always 0
```

##### `transfer(options)`
Transfers tokens to another address.

**Parameters:**
- `options` (object): Transfer options
  - `token` (string): Token identifier (Bech32m token identifier, e.g., `btkn1...`)
  - `amount` (bigint): Amount of tokens to transfer
  - `recipient` (string): Recipient Spark address

**Returns:** `Promise<{hash: string, fee: bigint}>` - Transfer result

**Example:**
```javascript
const result = await account.transfer({
  token: 'btkn1...',
  amount: BigInt(1000000),
  recipient: 'spark1...'
})
console.log('Transfer hash:', result.hash)
```

##### `quoteTransfer(options)`
Quotes the costs of a transfer operation.

**Parameters:**
- `options` (object): Transfer options (same as `transfer`)

**Returns:** `Promise<{fee: bigint}>` - Transfer fee quote

**Example:**
```javascript
const quote = await account.quoteTransfer({
  token: 'btkn1...',
  amount: BigInt(1000000),
  recipient: 'spark1...'
})
console.log('Transfer fee:', Number(quote.fee))
```

##### `getBalance()`
Returns the account's native token balance in satoshis. When `sparkscan` is configured, this uses SparkScan's `btcSoftBalanceSats` value.

**Returns:** `Promise<bigint>` - Balance in satoshis

**Example:**
```javascript
const balance = await account.getBalance()
console.log('Balance:', balance, 'satoshis')
console.log('Balance in BTC:', Number(balance) / 1e8)
```

##### `getTokenBalance(tokenAddress)`
Returns the balance for a specific token.

**Parameters:**
- `tokenAddress` (string): Token contract address

**Returns:** `Promise<bigint>` - Token balance in base unit

**Example:**
```javascript
const tokenBalance = await account.getTokenBalance('token_address...')
console.log('Token balance:', tokenBalance)
```

##### `getTransactionReceipt(hash)`
Returns a Spark transfer by its ID. Only returns Spark transfers, not on-chain Bitcoin transactions.

**Parameters:**
- `hash` (string): The Spark transfer ID

**Returns:** `Promise<SparkTransfer | null>` - The Spark transfer, or null if not found

**Example:**
```javascript
const transfer = await account.getTransactionReceipt('transfer_id...')
console.log('Transfer details:', transfer)
```

##### `getTransfers(options?)`
Returns the Spark transfer history of the account. Only returns Spark transfers, not on-chain Bitcoin transactions.

**Parameters:**
- `options` (GetTransfersOptions, optional): Filter options
  - `direction` (string): 'all', 'incoming', or 'outgoing' (default: 'all')
  - `limit` (number): Maximum transfers to return (default: 10)
  - `skip` (number): Number of transfers to skip (default: 0)

**Returns:** `Promise<SparkTransfer[]>` - Array of Spark transfers

**Example:**
```javascript
const transfers = await account.getTransfers({
  direction: 'incoming',
  limit: 5
})
console.log('Recent incoming transfers:', transfers)
```

##### `getSingleUseDepositAddress()`
Generates a single-use Bitcoin deposit address for funding the Spark wallet.

**Returns:** `Promise<string>` - Bitcoin deposit address

**Example:**
```javascript
const depositAddress = await account.getSingleUseDepositAddress()
console.log('Send Bitcoin to:', depositAddress)
```

##### `getUnusedDepositAddresses(options?)`
Returns unused single-use deposit addresses for the account.

**Parameters:**
- `options` (Omit\<QueryDepositAddressesParams, 'sparkAddress'\>, optional): Query options

**Returns:** `Promise<{depositAddresses: DepositAddressQueryResult[], offset: number}>` - The unused deposit addresses with pagination offset

**Example:**
```javascript
const result = await account.getUnusedDepositAddresses()
console.log('Unused addresses:', result.depositAddresses)
console.log('Offset:', result.offset)
```

##### `getStaticDepositAddress()`
Returns a static deposit address for Bitcoin deposits from layer 1, generating one if it does not already exist. This address can be reused.

**Returns:** `Promise<string>` - The static deposit address

**Example:**
```javascript
const depositAddress = await account.getStaticDepositAddress()
console.log('Static deposit address:', depositAddress)
```

##### `getStaticDepositAddresses()`
Returns all existing static deposit addresses for the account.

**Returns:** `Promise<DepositAddressQueryResult[]>` - The static deposit addresses

**Example:**
```javascript
const addresses = await account.getStaticDepositAddresses()
console.log('Static deposit addresses:', addresses)
```

##### `getUtxosForDepositAddress(options)`
Returns confirmed UTXOs for a specific deposit address.

**Parameters:**
- `options` (GetUtxosParams): Query options

**Returns:** `Promise<{utxos: {txid: string, vout: number}[], offset: number}>` - The confirmed UTXOs with pagination offset

**Example:**
```javascript
const result = await account.getUtxosForDepositAddress({
  depositAddress: 'bc1q...'
})
console.log('UTXOs:', result.utxos)
```

##### `claimDeposit(txId)`
Claims a Bitcoin deposit to add funds to the Spark wallet.

**Parameters:**
- `txId` (string): Bitcoin transaction ID of the deposit

**Returns:** `Promise<WalletLeaf[] | undefined>` - Wallet leaves created from the deposit

**Example:**
```javascript
const leaves = await account.claimDeposit('bitcoin_tx_id...')
console.log('Claimed deposit:', leaves)
```

##### `claimStaticDeposit(txId)`
Claims a static Bitcoin deposit to add funds to the Spark wallet.

**Parameters:**
- `txId` (string): Bitcoin transaction ID of the deposit

**Returns:** `Promise<WalletLeaf[] | undefined>` - Wallet leaves created from the deposit

**Example:**
```javascript
const leaves = await account.claimStaticDeposit('bitcoin_tx_id...')
console.log('Claimed static deposit:', leaves)
```

##### `refundStaticDeposit(options)`
Refunds a deposit made to a static deposit address back to a specified Bitcoin address. The minimum fee is 300 satoshis.

**Parameters:**
- `options` (object): Refund options
  - `depositTransactionId` (string): The transaction ID of the original deposit
  - `outputIndex` (number): The output index of the deposit
  - `destinationAddress` (string): The Bitcoin address to send the refund to
  - `satsPerVbyteFee` (number): The fee rate in sats per vbyte for the refund transaction

**Returns:** `Promise<string>` - The refund transaction as a hex string that needs to be broadcast

**Example:**
```javascript
const refundTx = await account.refundStaticDeposit({
  depositTransactionId: 'txid...',
  outputIndex: 0,
  destinationAddress: 'bc1q...',
  satsPerVbyteFee: 10
})
console.log('Refund transaction (hex):', refundTx)
// Note: This transaction needs to be broadcast to the Bitcoin network
```

##### `quoteWithdraw(options)`
Gets a fee quote for withdrawing funds from Spark cooperatively to an on-chain Bitcoin address.

**Parameters:**
- `options` (object): Withdrawal quote options
  - `withdrawalAddress` (string): The Bitcoin address where the funds should be sent
  - `amountSats` (number): The amount in satoshis to withdraw

**Returns:** `Promise<CoopExitFeeQuote>` - The withdrawal fee quote

**Example:**
```javascript
const feeQuote = await account.quoteWithdraw({
  withdrawalAddress: 'bc1q...',
  amountSats: 1000000
})
console.log('Withdrawal fee quote:', feeQuote)
```

##### `withdraw(options)`
Initiates a withdrawal to move funds from the Spark network to an on-chain Bitcoin address.

**Parameters:**
- `options` (WithdrawOptions): Withdrawal options object (`Omit<WithdrawParams, 'feeQuote'>`)
  - `onchainAddress` (string): Bitcoin address to withdraw to
  - `amountSats` (number): Amount in satoshis to withdraw

**Returns:** `Promise<CoopExitRequest | null | undefined>` - The withdrawal request details, or null/undefined if the request cannot be completed

**Example:**
```javascript
const withdrawal = await account.withdraw({
  onchainAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  amountSats: 100000
})
console.log('Withdrawal request:', withdrawal)
```

##### `createLightningInvoice(options)`
Creates a Lightning invoice for receiving payments.

**Parameters:**
- `options` (CreateLightningInvoiceParams): Invoice options object
  - `amountSats` (number, optional): Amount in satoshis
  - `memo` (string, optional): Invoice description
  - Additional options from `CreateLightningInvoiceParams` may be supported

**Returns:** `Promise<LightningReceiveRequest>` - Lightning invoice details

**Example:**
```javascript
const invoice = await account.createLightningInvoice({
  amountSats: 100000,
  memo: 'Payment for services'
})
console.log('Invoice:', invoice.invoice)
```

##### `getLightningReceiveRequest(invoiceId)`
Gets details of a previously created Lightning receive request.

**Parameters:**
- `invoiceId` (string): Invoice ID

**Returns:** `Promise<LightningReceiveRequest | null>` - Invoice details, or null if not found

**Example:**
```javascript
const request = await account.getLightningReceiveRequest(invoiceId)
if (request) {
  console.log('Invoice status:', request.status)
}
```

##### `getLightningSendRequest(requestId)`
Gets a Lightning send request by id.

**Parameters:**
- `requestId` (string): The id of the Lightning send request

**Returns:** `Promise<LightningSendRequest | null>` - The Lightning send request

**Example:**
```javascript
const request = await account.getLightningSendRequest(requestId)
if (request) {
  console.log('Lightning send request:', request)
}
```

##### `payLightningInvoice(options)`
Pays a Lightning invoice.

When `syncAndRetry` is enabled, the wallet syncs state and retries once after a failure.

**Parameters:**
- `options` (PayLightningInvoiceParams): Payment options object
  - `encodedInvoice` (string): BOLT11 Lightning invoice
  - `maxFeeSats` (number, optional): Maximum fee willing to pay in satoshis
  - Additional options from `PayLightningInvoiceParams` may be supported

**Returns:** `Promise<LightningSendRequest>` - Payment details

**Example:**
```javascript
const payment = await account.payLightningInvoice({
  encodedInvoice: 'lnbc...',
  maxFeeSats: 1000
})
console.log('Payment result:', payment)
```

##### `quotePayLightningInvoice(options)`
Estimates the fee for paying a Lightning invoice.

**Parameters:**
- `options` (LightningSendFeeEstimateInput): Fee estimation options
  - `encodedInvoice` (string): BOLT11 Lightning invoice
  - Additional options may be supported

**Returns:** `Promise<bigint>` - Estimated fee in satoshis

**Example:**
```javascript
const feeEstimate = await account.quotePayLightningInvoice({
  encodedInvoice: 'lnbc...'
})
console.log('Estimated Lightning fee:', Number(feeEstimate), 'satoshis')
```


##### `verify(message, signature)`
Verifies a message signature against the account's identity key.

**Parameters:**
- `message` (string): The original message
- `signature` (string): The signature to verify

**Returns:** `Promise<boolean>` - True if the signature is valid

**Example:**
```javascript
const isValid = await account.verify('Hello, Spark!', signature)
console.log('Signature valid:', isValid)
```

##### `createSparkSatsInvoice(options)`
Creates a Spark invoice for receiving a sats payment.

**Parameters:**
- `options` (object): Invoice options
  - `amount` (number, optional): The amount of sats to receive (optional for open invoices)
  - `memo` (string, optional): Optional memo/description for the payment
  - `senderSparkAddress` (SparkAddressFormat, optional): Optional Spark address of the expected sender
  - `expiryTime` (Date, optional): Optional expiry time for the invoice

**Returns:** `Promise<SparkAddressFormat>` - A Spark invoice that can be paid by another Spark wallet

**Example:**
```javascript
const invoice = await account.createSparkSatsInvoice({
  amount: 100000,
  memo: 'Payment for services'
})
console.log('Spark invoice:', invoice)
```

##### `createSparkTokensInvoice(options)`
Creates a Spark invoice for receiving a token payment.

**Parameters:**
- `options` (object): Invoice options
  - `tokenIdentifier` (string, optional): The Bech32m token identifier (e.g., `btkn1...`)
  - `amount` (bigint, optional): The amount of tokens to receive
  - `memo` (string, optional): Optional memo/description for the payment
  - `senderSparkAddress` (SparkAddressFormat, optional): Optional Spark address of the expected sender
  - `expiryTime` (Date, optional): Optional expiry time for the invoice

**Returns:** `Promise<SparkAddressFormat>` - A Spark invoice that can be paid by another Spark wallet

**Example:**
```javascript
const invoice = await account.createSparkTokensInvoice({
  tokenIdentifier: 'btkn1...',
  amount: BigInt(1000),
  memo: 'Token payment'
})
console.log('Spark token invoice:', invoice)
```

##### `paySparkInvoice(invoices)`
Fulfills one or more Spark invoices by paying them.

**Parameters:**
- `invoices` (SparkInvoice[]): Array of invoices to fulfill
  - Each invoice has:
    - `invoice` (SparkAddressFormat): The Spark invoice to pay
    - `amount` (bigint, optional): Amount to pay (required for invoices without encoded amount)

**Returns:** `Promise<FulfillSparkInvoiceResponse>` - Response containing transaction results and errors

**Example:**
```javascript
const result = await account.paySparkInvoice([
  {
    invoice: 'spark1...',
    amount: BigInt(100000)
  }
])
console.log('Payment result:', result)
```

##### `syncWalletBalance()`
Reconciles the wallet's internal state with the server and waits for any triggered optimization to complete.

**Returns:** `Promise<void>`

**Example:**
```javascript
await account.syncWalletBalance()
```

##### `getSparkInvoices(params)`
Queries the status of Spark invoices.

**Parameters:**
- `params` (QuerySparkInvoicesParams): The query parameters

**Returns:** `Promise<{invoiceStatuses: InvoiceResponse[], offset: number}>` - The invoice statuses with pagination offset

**Example:**
```javascript
const result = await account.getSparkInvoices({
  sparkAddress: await account.getAddress()
})
console.log('Invoice statuses:', result.invoiceStatuses)
```

##### `toReadOnlyAccount()`
Returns a read-only version of this account that can query data but not sign transactions. After the first call, subsequent calls reuse the same read-only account instance.

**Returns:** `Promise<WalletAccountReadOnlySpark>` - Read-only account instance

**Example:**
```javascript
const readOnlyAccount = await account.toReadOnlyAccount()
const balance = await readOnlyAccount.getBalance()
```

##### `cleanupConnections()`
Cleans up network connections and resources.

**Returns:** `Promise<void>`

**Example:**
```javascript
await account.cleanupConnections()
```

##### `dispose()`
Disposes the wallet account, securely erasing private keys from memory.

**Returns:** `void`

**Example:**
```javascript
account.dispose()
// Private keys are now cleared from memory
```

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `index` | `number` | The derivation path index of this account |
| `path` | `string` | The full BIP-44 derivation path |
| `keyPair` | `KeyPair` | The account's public and private key pair |

## WalletAccountReadOnlySpark

Represents a read-only wallet account. Implements `WalletAccountReadOnly` from `@tetherto/wdk-wallet`.

### Constructor

```javascript
new WalletAccountReadOnlySpark(address, config)
```

**Parameters:**
- `address` (string): The account's Spark address
- `config` (SparkWalletConfig, optional): Configuration object

### Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `getAddress()` | Returns the account's Spark address | `Promise<SparkAddressFormat>` |
| `getIdentityKey()` | Returns the account's identity public key | `Promise<string>` |
| `getBalance()` | Returns the native token balance in satoshis | `Promise<bigint>` |
| `getTokenBalance(tokenAddress)` | Returns the balance for a specific token | `Promise<bigint>` |
| `getTransactionReceipt(hash)` | Returns a Spark transfer by its ID | `Promise<SparkTransfer \| null>` |
| `getTransfers(options?)` | Returns the account's Spark transfer history | `Promise<SparkTransfer[]>` |
| `getUnusedDepositAddresses(options?)` | Returns unused single-use deposit addresses | `Promise<{depositAddresses: DepositAddressQueryResult[], offset: number}>` |
| `getStaticDepositAddresses()` | Returns all existing static deposit addresses | `Promise<DepositAddressQueryResult[]>` |
| `getUtxosForDepositAddress(options)` | Returns confirmed UTXOs for a deposit address | `Promise<{utxos: {txid: string, vout: number}[], offset: number}>` |
| `getSparkInvoices(params)` | Queries the status of Spark invoices | `Promise<{invoiceStatuses: InvoiceResponse[], offset: number}>` |
| `quoteSendTransaction(tx)` | Estimates transaction fee (always 0) | `Promise<{fee: bigint}>` |
| `quoteTransfer(options)` | Quotes the costs of a transfer operation | `Promise<{fee: bigint}>` |

##### `getAddress()`
Returns the account's Spark network address.

**Returns:** `Promise<SparkAddressFormat>` - The Spark address

**Example:**
```javascript
const address = await readOnlyAccount.getAddress()
console.log('Spark address:', address)
```

##### `getIdentityKey()`
Returns the account's identity public key (hex-encoded).

**Returns:** `Promise<string>` - The identity public key

**Example:**
```javascript
const identityKey = await readOnlyAccount.getIdentityKey()
console.log('Identity key:', identityKey) // 02eda8...
```

##### `getBalance()`
Returns the account's native token balance in satoshis. When `sparkscan` is configured, this uses SparkScan's `btcSoftBalanceSats` value.

**Returns:** `Promise<bigint>` - Balance in satoshis

**Example:**
```javascript
const balance = await readOnlyAccount.getBalance()
console.log('Balance:', balance, 'satoshis')
```

##### `getTokenBalance(tokenAddress)`
Returns the balance for a specific token.

**Parameters:**
- `tokenAddress` (string): Token contract address

**Returns:** `Promise<bigint>` - Token balance in base unit

**Example:**
```javascript
const tokenBalance = await readOnlyAccount.getTokenBalance('token_address...')
console.log('Token balance:', tokenBalance)
```

##### `getTransactionReceipt(hash)`
Returns a Spark transfer by its ID. Only returns Spark transfers, not on-chain Bitcoin transactions.

**Parameters:**
- `hash` (string): The Spark transfer ID

**Returns:** `Promise<SparkTransfer | null>` - The Spark transfer, or null if not found

**Example:**
```javascript
const transfer = await readOnlyAccount.getTransactionReceipt('transfer_id...')
console.log('Transfer details:', transfer)
```

##### `getTransfers(options?)`
Returns the Spark transfer history of the account. Only returns Spark transfers, not on-chain Bitcoin transactions.

**Parameters:**
- `options` (GetTransfersOptions, optional): Filter options
  - `direction` (string): 'all', 'incoming', or 'outgoing' (default: 'all')
  - `limit` (number): Maximum transfers to return (default: 10)
  - `skip` (number): Number of transfers to skip (default: 0)

**Returns:** `Promise<SparkTransfer[]>` - Array of Spark transfers

**Example:**
```javascript
const transfers = await readOnlyAccount.getTransfers({
  direction: 'incoming',
  limit: 5
})
console.log('Recent incoming transfers:', transfers)
```

##### `getUnusedDepositAddresses(options?)`
Returns unused single-use deposit addresses for the account.

**Parameters:**
- `options` (Omit\<QueryDepositAddressesParams, 'sparkAddress'\>, optional): Query options

**Returns:** `Promise<{depositAddresses: DepositAddressQueryResult[], offset: number}>` - The unused deposit addresses with pagination offset

**Example:**
```javascript
const result = await readOnlyAccount.getUnusedDepositAddresses()
console.log('Unused addresses:', result.depositAddresses)
```

##### `getStaticDepositAddresses()`
Returns all existing static deposit addresses for the account.

**Returns:** `Promise<DepositAddressQueryResult[]>` - The static deposit addresses

**Example:**
```javascript
const addresses = await readOnlyAccount.getStaticDepositAddresses()
console.log('Static deposit addresses:', addresses)
```

##### `getUtxosForDepositAddress(options)`
Returns confirmed UTXOs for a specific deposit address.

**Parameters:**
- `options` (GetUtxosParams): Query options

**Returns:** `Promise<{utxos: {txid: string, vout: number}[], offset: number}>` - The confirmed UTXOs with pagination offset

**Example:**
```javascript
const result = await readOnlyAccount.getUtxosForDepositAddress({
  depositAddress: 'bc1q...'
})
console.log('UTXOs:', result.utxos)
```

##### `getSparkInvoices(params)`
Queries the status of Spark invoices.

**Parameters:**
- `params` (QuerySparkInvoicesParams): The query parameters

**Returns:** `Promise<{invoiceStatuses: InvoiceResponse[], offset: number}>` - The invoice statuses with pagination offset

**Example:**
```javascript
const result = await readOnlyAccount.getSparkInvoices({
  sparkAddress: await readOnlyAccount.getAddress()
})
console.log('Invoice statuses:', result.invoiceStatuses)
```

##### `quoteSendTransaction({to, value})`
Estimates the fee for a Spark transaction (always returns 0).

**Parameters:**
- `to` (string): Recipient's Spark address
- `value` (number): Amount in satoshis

**Returns:** `Promise<{fee: bigint}>` - Fee estimate (always 0)

**Example:**
```javascript
const quote = await readOnlyAccount.quoteSendTransaction({
  to: 'spark1...',
  value: 1000000
})
console.log('Estimated fee:', Number(quote.fee))
```

##### `quoteTransfer(options)`
Quotes the costs of a transfer operation.

**Parameters:**
- `options` (object): Transfer options
  - `token` (string): Token identifier
  - `amount` (bigint): Amount of tokens
  - `recipient` (string): Recipient Spark address

**Returns:** `Promise<{fee: bigint}>` - Transfer fee quote

**Example:**
```javascript
const quote = await readOnlyAccount.quoteTransfer({
  token: 'btkn1...',
  amount: BigInt(1000000),
  recipient: 'spark1...'
})
console.log('Transfer fee:', Number(quote.fee))
```


## Types

### SparkScanConfig

```typescript
interface SparkScanConfig {
  baseUrl?: string  // Optional SparkScan URL (default: "https://api.sparkscan.io")
  network?: 'MAINNET' | 'SIGNET' | 'REGTEST'  // Spark network, SparkScan only accepts MAINNET and REGTEST at runtime
  apiKey?: string  // Optional API key for SparkScan requests
}
```

### SparkWalletConfig

```typescript
interface SparkWalletConfig {
  network?: 'MAINNET' | 'SIGNET' | 'REGTEST'  // The network (default: "MAINNET")
  sparkscan?: SparkScanConfig  // Optional SparkScan configuration for balance polling
  syncAndRetry?: boolean       // When true, failed sends and Lightning payments sync wallet state and retry once
}
```

### SparkTransaction

```typescript
interface SparkTransaction {
  to: string              // The transaction's recipient (Spark address)
  value: number | bigint  // The amount of bitcoins to send to the recipient (in satoshis)
}
```

### TransactionResult

```typescript
interface TransactionResult {
  hash: string  // Transaction hash/ID
  fee: bigint   // Transaction fee in satoshis (always 0n for Spark)
}
```

### KeyPair

```typescript
interface KeyPair {
  publicKey: Uint8Array   // Public key bytes
  privateKey: Uint8Array  // Private key bytes
}
```

### LightningReceiveRequest

```typescript
interface LightningReceiveRequest {
  invoice: string    // BOLT11 encoded Lightning invoice
  id: string        // Invoice ID for tracking
  amountSats: number // Amount in satoshis
  memo?: string     // Optional description
}
```

### LightningSendRequest

```typescript
interface LightningSendRequest {
  id: string           // Payment request ID
  invoice: string      // BOLT11 encoded invoice that was paid
  maxFeeSats: number   // Maximum fee that was allowed
  status: string       // Payment status
}
```

### WalletLeaf

```typescript
interface WalletLeaf {
  // Spark SDK internal structure for wallet state
  // Exact properties depend on Spark SDK implementation
}
```

### CoopExitRequest

```typescript
interface CoopExitRequest {
  id: string              // Withdrawal request ID
  onchainAddress: string  // Bitcoin address for withdrawal
  amountSats: number      // Amount in satoshis
  exitSpeed: string       // Withdrawal speed ('FAST', 'MEDIUM', 'SLOW') - default: 'MEDIUM'
  status: string          // Withdrawal status
}
```

### TransferOptions

```typescript
interface TransferOptions {
  token: string      // Token identifier (Bech32m, e.g. btkn1...)
  amount: bigint     // Amount of tokens to transfer
  recipient: string  // Recipient Spark address
}
```

### GetTransfersOptions

```typescript
interface GetTransfersOptions {
  direction?: 'incoming' | 'outgoing' | 'all'  // Filter by direction (default: 'all')
  limit?: number                               // Number of transfers to return (default: 10)
  skip?: number                                // Number of transfers to skip (default: 0)
}
```

### SparkTransfer

Type alias for `Transfer` from `@buildonspark/spark-sdk/proto/spark`. Key properties include:

```typescript
interface SparkTransfer {
  id: string                    // Transfer ID
  status: string                // Transfer status
  totalValue: number            // Total value in satoshis
  transferDirection: string     // 'INCOMING' or 'OUTGOING'
  type: string                  // Transfer type
  createdTime?: Date            // When the transfer was created
  updatedTime?: Date            // Last update timestamp
}
```

### DepositAddressQueryResult

From `@buildonspark/spark-sdk/proto/spark`:

```typescript
interface DepositAddressQueryResult {
  address: string       // The deposit address
  confirmationStatus: string  // Confirmation status
}
```

### InvoiceResponse

From `@buildonspark/spark-sdk/proto/spark`:

```typescript
interface InvoiceResponse {
  invoiceId: string     // The invoice identifier
  status: string        // The invoice status
}
```

### QueryDepositAddressesParams

```typescript
interface QueryDepositAddressesParams {
  sparkAddress: string  // The Spark address to query deposit addresses for
  offset?: number       // Pagination offset
  limit?: number        // Maximum results to return
}
```

### GetUtxosParams

```typescript
interface GetUtxosParams {
  depositAddress: string  // The deposit address to query UTXOs for
  offset?: number         // Pagination offset
  limit?: number          // Maximum results to return
}
```

### QuerySparkInvoicesParams

```typescript
interface QuerySparkInvoicesParams {
  sparkAddress: string  // The Spark address to query invoices for
  offset?: number       // Pagination offset
  limit?: number        // Maximum results to return
}
```

### Lightning Invoice Options

```typescript
// Use CreateLightningInvoiceParams from @buildonspark/spark-sdk
// Basic options include:
interface CreateLightningInvoiceParams {
  amountSats?: number  // Amount in satoshis
  memo?: string         // Optional description for the invoice
  // Additional options may be available
}
```

### Lightning Payment Options

```typescript
// Use PayLightningInvoiceParams from @buildonspark/spark-sdk
// Basic options include:
interface PayLightningInvoiceParams {
  encodedInvoice: string  // BOLT11-encoded Lightning invoice to pay
  maxFeeSats?: number     // Maximum fee in satoshis to pay
  // Additional options may be available
}
```

### Lightning Fee Estimate Options

```typescript
// Use LightningSendFeeEstimateInput from @buildonspark/spark-sdk/types
// Basic options include:
interface LightningSendFeeEstimateInput {
  encodedInvoice: string  // BOLT11-encoded Lightning invoice to estimate fees for
  // Additional options may be available
}
```

### Withdrawal Options

```typescript
// WithdrawOptions = Omit<WithdrawParams, 'feeQuote'>
interface WithdrawOptions {
  onchainAddress: string  // Bitcoin address where the funds should be sent
  amountSats: number      // Amount in satoshis to withdraw
}

interface QuoteWithdrawOptions {
  withdrawalAddress: string  // Bitcoin address where the funds should be sent
  amountSats: number        // Amount in satoshis to withdraw
}
```

### Spark Invoice Options

```typescript
interface CreateSatsInvoiceOptions {
  amount?: number              // Amount of sats to receive (optional for open invoices)
  memo?: string                // Optional memo/description
  senderSparkAddress?: string  // Optional Spark address of expected sender
  expiryTime?: Date           // Optional expiry time
}

interface CreateTokensInvoiceOptions {
  tokenIdentifier?: string     // Bech32m token identifier (e.g., btkn1...)
  amount?: bigint             // Amount of tokens to receive
  memo?: string                // Optional memo/description
  senderSparkAddress?: string  // Optional Spark address of expected sender
  expiryTime?: Date           // Optional expiry time
}

interface SparkInvoice {
  invoice: string   // The Spark invoice to pay
  amount?: bigint   // Amount to pay (required for invoices without encoded amount)
}
```

### Refund Options

```typescript
interface RefundStaticDepositOptions {
  depositTransactionId: string  // Transaction ID of the original deposit
  outputIndex: number            // Output index of the deposit
  destinationAddress: string     // Bitcoin address to send refund to
  satsPerVbyteFee: number        // Fee rate in sats per vbyte
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
				<strong>WDK Spark Wallet Usage</strong>
			</td>
			<td>Get started with WDK's Spark Wallet Usage</td>
			<td>
				<a href="./usage.md">WDK Spark Wallet Usage</a>
			</td>
		</tr>
        <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK Spark Wallet Configuration</strong>
			</td>
			<td>Get started with WDK's Spark Wallet Configuration</td>
			<td>
				<a href="./configuration.md">WDK Spark Wallet Configuration</a>
			</td>
		</tr>
	</tbody>
</table>

***

### Need Help?

{% include "../../../.gitbook/includes/support-cards.md" %}
