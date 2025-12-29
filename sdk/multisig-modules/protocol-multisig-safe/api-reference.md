# API Reference

Complete API documentation for @tetherto/wdk-protocol-multisig-safe

## Classes

| Class | Description |
| --- | --- |
| WalletManagerEvmMultisigSafe | Main class for managing multisig Safe wallets. Extends WalletManager. |
| WalletAccountEvmMultisigSafe | Individual multisig Safe account with signing capabilities. |
| WalletAccountReadOnlyEvmMultisigSafe | Read-only multisig Safe account for balance checks and queries. |

## WalletManagerEvmMultisigSafe

The main class for managing Safe Protocol multisig wallets with ERC-4337 account abstraction.

### Constructor

```javascript
new WalletManagerEvmMultisigSafe(seedPhrase, config)
```

**Parameters:**

* `seedPhrase` (string): BIP-39 mnemonic seed phrase
* `config` (MultisigSafeConfig): Configuration object
  * `chainId` (bigint): Blockchain network ID
  * `provider` (string | Provider): RPC provider URL or EIP-1193 provider
  * `bundlerUrl` (string): ERC-4337 bundler service URL
  * `paymasterOptions` (PaymasterOptions): Paymaster configuration
  * `safeAccountConfig` (SafeAccountConfig, optional): Safe creation or import config
  * `transferMaxFee` (number, optional): Maximum fee in paymaster token units

### Methods

#### getAccount

Returns a multisig Safe account at the specified index.

```javascript
const account = await wallet.getAccount(index)
```

**Parameters:**

* `index` (number): Account index for BIP-44 derivation

**Returns:** `Promise<WalletAccountEvmMultisigSafe>`

#### getAccountByPath

Returns a multisig Safe account at the specified BIP-44 derivation path.

```javascript
const account = await wallet.getAccountByPath(path)
```

**Parameters:**

* `path` (string): BIP-44 derivation path (e.g., "0'/0/5")

**Returns:** `Promise<WalletAccountEvmMultisigSafe>`

#### discoverExistingSafes

Discovers existing Safe wallets where the signer's EOA is an owner.

```javascript
const safes = await wallet.discoverExistingSafes()
```

**Returns:** `Promise<string[]>` - Array of Safe addresses

#### dispose

Disposes the wallet manager and clears sensitive data from memory.

```javascript
wallet.dispose()
```

## WalletAccountEvmMultisigSafe

Individual multisig Safe account with full signing capabilities.

### Constructor

```javascript
new WalletAccountEvmMultisigSafe(seedPhrase, path, config)
```

**Parameters:**

* `seedPhrase` (string): BIP-39 mnemonic seed phrase
* `path` (string): BIP-44 derivation path
* `config` (MultisigSafeConfig): Configuration object

### Methods

#### getAddress

Returns the Safe contract address.

```javascript
const address = await account.getAddress()
```

**Returns:** `Promise<string>` - Safe address (checksummed)

#### getBalance

Returns the native token balance in wei.

```javascript
const balance = await account.getBalance()
```

**Returns:** `Promise<bigint>` - Balance in wei

#### getTokenBalance

Returns the ERC-20 token balance.

```javascript
const balance = await account.getTokenBalance(tokenAddress)
```

**Parameters:**

* `tokenAddress` (string): ERC-20 token contract address

**Returns:** `Promise<bigint>` - Token balance in smallest units

#### getPaymasterTokenBalance

Returns the paymaster token balance for fee payment.

```javascript
const balance = await account.getPaymasterTokenBalance()
```

**Returns:** `Promise<bigint>` - Paymaster token balance

#### isDeployed

Checks if the Safe contract is deployed on-chain.

```javascript
const deployed = await account.isDeployed()
```

**Returns:** `Promise<boolean>`

#### deploy

Deploys the Safe contract on-chain. Requires ETH in signer's EOA.

```javascript
const result = await account.deploy()
```

**Returns:** `Promise<{ hash: string }>` - Deployment transaction hash

#### propose

Proposes a new transaction for multisig approval.

```javascript
const proposal = await account.propose(transaction, overrides?)
```

**Parameters:**

* `transaction` (TransactionRequest): Transaction to propose
  * `to` (string): Recipient address
  * `value` (string | bigint): Value in wei
  * `data` (string, optional): Transaction data
* `overrides` (PaymasterOverrides, optional): Override paymaster settings

**Returns:** `Promise<SafeOperationProposal>`

* `safeOperationHash` (string): Unique operation identifier
* `confirmations` (string[]): Array of signer addresses who confirmed
* `threshold` (number): Required confirmations to execute

#### approve

Approves a pending transaction.

```javascript
await account.approve(safeOperationHash)
```

**Parameters:**

* `safeOperationHash` (string): Operation hash from propose()

**Returns:** `Promise<void>`

#### execute

Executes a transaction that has met the threshold.

```javascript
const result = await account.execute(safeOperationHash, overrides?)
```

**Parameters:**

* `safeOperationHash` (string): Operation hash from propose()
* `overrides` (PaymasterOverrides, optional): Override paymaster settings

**Returns:** `Promise<{ hash: string, fee: bigint }>`

#### sendTransaction

Proposes, collects approvals, and executes in one call. Use when you control enough signers.

```javascript
const result = await account.sendTransaction(transaction, overrides?)
```

**Parameters:**

* `transaction` (TransactionRequest): Transaction to send
* `overrides` (PaymasterOverrides, optional): Override paymaster settings

**Returns:** `Promise<{ hash: string, fee: bigint }>`

#### quoteSendTransaction

Estimates the fee for a transaction without executing.

```javascript
const quote = await account.quoteSendTransaction(transaction, overrides?)
```

**Parameters:**

* `transaction` (TransactionRequest): Transaction to quote
* `overrides` (PaymasterOverrides, optional): Override paymaster settings

**Returns:** `Promise<{ fee: bigint }>`

#### transfer

Transfers ERC-20 tokens using the multisig workflow.

```javascript
const result = await account.transfer(transferRequest, overrides?)
```

**Parameters:**

* `transferRequest` (TransferRequest): Transfer details
  * `token` (string): ERC-20 token address
  * `recipient` (string): Recipient address
  * `amount` (bigint): Amount in smallest units
* `overrides` (PaymasterOverrides, optional): Override paymaster settings

**Returns:** `Promise<{ hash: string, fee: bigint }>`

#### quoteTransfer

Estimates the fee for a token transfer.

```javascript
const quote = await account.quoteTransfer(transferRequest, overrides?)
```

**Returns:** `Promise<{ fee: bigint }>`

#### getPendingTransactions

Gets all pending transactions awaiting approval or execution.

```javascript
const pending = await account.getPendingTransactions()
```

**Returns:** `Promise<SafeOperationProposal[]>`

#### getTransactionHistory

Gets the transaction history for the Safe.

```javascript
const history = await account.getTransactionHistory()
```

**Returns:** `Promise<SafeTransaction[]>`

#### proposeAddOwner

Proposes adding a new owner to the Safe.

```javascript
const proposal = await account.proposeAddOwner({ owner, threshold? })
```

**Parameters:**

* `owner` (string): New owner address
* `threshold` (number, optional): New threshold after adding

**Returns:** `Promise<SafeOperationProposal>`

#### proposeRemoveOwner

Proposes removing an owner from the Safe.

```javascript
const proposal = await account.proposeRemoveOwner({ owner, threshold })
```

**Parameters:**

* `owner` (string): Owner address to remove
* `threshold` (number): New threshold after removal (required)

**Returns:** `Promise<SafeOperationProposal>`

#### proposeSwapOwner

Proposes swapping one owner for another.

```javascript
const proposal = await account.proposeSwapOwner({ oldOwner, newOwner })
```

**Parameters:**

* `oldOwner` (string): Owner address to remove
* `newOwner` (string): New owner address to add

**Returns:** `Promise<SafeOperationProposal>`

#### proposeChangeThreshold

Proposes changing the approval threshold.

```javascript
const proposal = await account.proposeChangeThreshold({ threshold })
```

**Parameters:**

* `threshold` (number): New threshold value

**Returns:** `Promise<SafeOperationProposal>`

#### signMessage

Signs a message with the multisig Safe.

```javascript
const signature = await account.signMessage(message)
```

**Parameters:**

* `message` (string): Message to sign

**Returns:** `Promise<string>` - EIP-191 compliant signature

#### verifyMessage

Verifies a message signature.

```javascript
const isValid = await account.verifyMessage(message, signature)
```

**Parameters:**

* `message` (string): Original message
* `signature` (string): Signature to verify

**Returns:** `Promise<boolean>`

#### toReadOnlyAccount

Converts to a read-only account.

```javascript
const readOnly = await account.toReadOnlyAccount()
```

**Returns:** `Promise<WalletAccountReadOnlyEvmMultisigSafe>`

#### dispose

Disposes the account and clears sensitive data from memory.

```javascript
account.dispose()
```

## WalletAccountReadOnlyEvmMultisigSafe

Read-only account for balance checks and queries without signing capabilities.

### Constructor

```javascript
new WalletAccountReadOnlyEvmMultisigSafe(address, config)
```

**Parameters:**

* `address` (string): Safe contract address
* `config` (MultisigSafeConfig): Configuration object (without safeAccountConfig)

### Methods

#### getAddress

Returns the Safe contract address.

```javascript
const address = await readOnlyAccount.getAddress()
```

**Returns:** `Promise<string>`

#### getBalance

Returns the native token balance in wei.

```javascript
const balance = await readOnlyAccount.getBalance()
```

**Returns:** `Promise<bigint>`

#### getTokenBalance

Returns the ERC-20 token balance.

```javascript
const balance = await readOnlyAccount.getTokenBalance(tokenAddress)
```

**Returns:** `Promise<bigint>`

#### getPaymasterTokenBalance

Returns the paymaster token balance.

```javascript
const balance = await readOnlyAccount.getPaymasterTokenBalance()
```

**Returns:** `Promise<bigint>`

#### isDeployed

Checks if the Safe contract is deployed.

```javascript
const deployed = await readOnlyAccount.isDeployed()
```

**Returns:** `Promise<boolean>`

#### getPendingTransactions

Gets all pending transactions.

```javascript
const pending = await readOnlyAccount.getPendingTransactions()
```

**Returns:** `Promise<SafeOperationProposal[]>`

#### getTransactionHistory

Gets the transaction history.

```javascript
const history = await readOnlyAccount.getTransactionHistory()
```

**Returns:** `Promise<SafeTransaction[]>`

## Types

### MultisigSafeConfig

```typescript
interface MultisigSafeConfig {
  chainId: bigint
  provider: string | Provider
  bundlerUrl: string
  paymasterOptions: PaymasterOptions
  safeAccountConfig?: SafeAccountConfig
  transferMaxFee?: number
}
```

### PaymasterOptions

```typescript
interface PaymasterOptions {
  paymasterUrl: string
  paymasterTokenAddress?: string  // For ERC-20 paymaster mode
  sponsoredPaymaster?: boolean    // For sponsored mode
}
```

### SafeAccountConfig

```typescript
interface SafeAccountConfig {
  owners?: string[]      // For creating new Safe
  threshold?: number     // For creating new Safe
  safeAddress?: string   // For importing existing Safe
}
```

### PaymasterOverrides

```typescript
interface PaymasterOverrides {
  paymasterTokenAddress?: string  // Override paymaster token
  sponsoredPaymaster?: boolean    // Override to sponsored mode
  transferMaxFee?: number         // Override max fee
}
```

### SafeOperationProposal

```typescript
interface SafeOperationProposal {
  safeOperationHash: string
  confirmations: string[]
  threshold: number
  to: string
  value: string
  data: string
}
```

## Error Handling

```javascript
try {
  const result = await account.execute(safeOperationHash)
} catch (error) {
  if (error.message.includes('threshold not met')) {
    console.error('Not enough confirmations to execute')
  }
  if (error.message.includes('not enough funds')) {
    console.error('Insufficient paymaster token balance')
  }
  if (error.message.includes('Exceeded maximum fee')) {
    console.error('Transaction fee exceeds limit')
  }
  if (error.message.includes('not an owner')) {
    console.error('Signer is not an owner of this Safe')
  }
  if (error.message.includes('already confirmed')) {
    console.error('This signer has already confirmed')
  }
}
```

---

### Need Help?

**Discord Community**

Connect with developers, ask questions, share your projects

[Join Community](https://discord.gg/arYXDhHB2w)

**GitHub Issues**

Report bugs, request features, and get technical help

[Open an Issue](https://github.com/tetherto/wdk-core)

**Email Contact**

For sensitive or private matters, contact our team directly

[Send an email](mailto:support@tether.to)