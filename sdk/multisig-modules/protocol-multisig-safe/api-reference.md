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
* `config` (EvmMultisigSafeConfig): Configuration object
  * `chainId` (bigint): Blockchain network ID
  * `provider` (string | Provider): RPC provider URL or EIP-1193 provider
  * `bundlerUrl` (string): ERC-4337 bundler service URL
  * `paymasterOptions` (PaymasterOptions): Paymaster configuration
  * `options` (ExistingSafeOptions | PredictedSafeOptions): Safe creation or import config
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
* `config` (EvmMultisigSafeConfig): Configuration object

### Methods

#### getAddress

Returns the Safe contract address.

```javascript
const address = await account.getAddress()
```

**Returns:** `Promise<string>` - Safe address (checksummed)

#### getSignerAddress

Returns the signer's EOA address.

```javascript
const signerAddress = await account.getSignerAddress()
```

**Returns:** `Promise<string>` - EOA address

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

#### getOwners

Returns the list of Safe owners.

```javascript
const owners = await account.getOwners()
```

**Returns:** `Promise<string[]>` - Array of owner addresses

#### getThreshold

Returns the required number of confirmations.

```javascript
const threshold = await account.getThreshold()
```

**Returns:** `Promise<number>` - Threshold value

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

**Returns:** `Promise<{ deployed: boolean, txHash: string | null }>` - Deployment result

#### propose

Proposes a new transaction for multisig approval.

```javascript
const proposal = await account.propose(transaction, options?)
```

**Parameters:**

* `transaction` (EvmTransaction): Transaction to propose
  * `to` (string): Recipient address
  * `value` (string | bigint): Value in wei
  * `data` (string, optional): Transaction data
* `options` (ProposeOptions, optional): Propose options including paymaster overrides

**Returns:** `Promise<ProposeResult>`

* `safeOperationHash` (string): Unique operation identifier
* `confirmations` (number): Number of confirmations
* `threshold` (number): Required confirmations to execute

#### approve

Approves a pending transaction.

```javascript
const result = await account.approve(safeOperationHash)
```

**Parameters:**

* `safeOperationHash` (string): Operation hash from propose()

**Returns:** `Promise<ApprovalResult>`

* `confirmations` (number): Number of confirmations
* `threshold` (number): Required threshold

#### reject

Rejects a pending transaction by proposing a rejection transaction.

```javascript
const result = await account.reject(safeOperationHash)
```

**Parameters:**

* `safeOperationHash` (string): Operation hash to reject

**Returns:** `Promise<ProposeResult>`

#### execute

Executes a transaction that has met the threshold.

```javascript
const result = await account.execute(safeOperationHash)
```

**Parameters:**

* `safeOperationHash` (string): Operation hash from propose()

**Returns:** `Promise<ExecuteResult>`

* `hash` (string): UserOperation hash

#### isReadyToExecute

Checks if a transaction has met the threshold and is ready to execute.

```javascript
const ready = await account.isReadyToExecute(safeOperationHash)
```

**Parameters:**

* `safeOperationHash` (string): Operation hash to check

**Returns:** `Promise<boolean>`

#### sendTransaction

Proposes, collects approvals, and executes in one call. Auto-executes if threshold is met.

```javascript
const result = await account.sendTransaction(transaction, options?)
```

**Parameters:**

* `transaction` (EvmTransaction): Transaction to send
* `options` (ProposeOptions, optional): Options including paymaster overrides

**Returns:** `Promise<MultisigTransactionResult>`

* `hash` (string): Safe operation hash or UserOp hash
* `fee` (bigint): Estimated fee
* `confirmations` (number): Number of confirmations
* `threshold` (number): Required threshold
* `executed` (boolean): Whether transaction was executed

#### quoteSendTransaction

Estimates the fee for a transaction without executing.

```javascript
const quote = await account.quoteSendTransaction(transaction, options?)
```

**Parameters:**

* `transaction` (EvmTransaction): Transaction to quote
* `options` (ProposeOptions, optional): Options including paymaster overrides

**Returns:** `Promise<{ fee: bigint }>`

#### transfer

Transfers ERC-20 tokens using the multisig workflow. Auto-executes if threshold is met.

```javascript
const result = await account.transfer(transferOptions, proposeOptions?)
```

**Parameters:**

* `transferOptions` (TransferOptions): Transfer details
  * `token` (string): ERC-20 token address
  * `recipient` (string): Recipient address
  * `amount` (string | bigint): Amount in smallest units
* `proposeOptions` (ProposeOptions, optional): Options including paymaster overrides

**Returns:** `Promise<MultisigTransactionResult>`

#### quoteTransfer

Estimates the fee for a token transfer.

```javascript
const quote = await account.quoteTransfer(transferOptions, proposeOptions?)
```

**Returns:** `Promise<{ fee: bigint }>`

#### getTransactionHashByUserOpHash

Gets the on-chain transaction hash from a UserOperation hash.

```javascript
const txHash = await account.getTransactionHashByUserOpHash(userOpHash)
```

**Parameters:**

* `userOpHash` (string): UserOperation hash from execute()

**Returns:** `Promise<string | null>` - Transaction hash or null if pending

#### getPendingTransactions

Gets all pending transactions awaiting approval or execution.

```javascript
const pending = await account.getPendingTransactions()
```

**Returns:** `Promise<{ results: SafeOperationResponse[] }>`

#### getSafeOperation

Gets details of a specific Safe operation.

```javascript
const operation = await account.getSafeOperation(safeOperationHash)
```

**Returns:** `Promise<SafeOperationResponse>`

#### getTransactionHistory

Gets the transaction history for the Safe.

```javascript
const history = await account.getTransactionHistory(options?)
```

**Returns:** `Promise<SafeMultisigTransactionListResponse>`

#### addOwner

Proposes adding a new owner to the Safe.

```javascript
const proposal = await account.addOwner(ownerAddress, newThreshold?, options?)
```

**Parameters:**

* `ownerAddress` (string): New owner address
* `newThreshold` (number, optional): New threshold after adding
* `options` (ProposeOptions, optional): Propose options

**Returns:** `Promise<ProposeResult>`

#### removeOwner

Proposes removing an owner from the Safe.

```javascript
const proposal = await account.removeOwner(ownerAddress, newThreshold?, options?)
```

**Parameters:**

* `ownerAddress` (string): Owner address to remove
* `newThreshold` (number, optional): New threshold after removal
* `options` (ProposeOptions, optional): Propose options

**Returns:** `Promise<ProposeResult>`

#### swapOwner

Proposes swapping one owner for another.

```javascript
const proposal = await account.swapOwner(oldOwner, newOwner, options?)
```

**Parameters:**

* `oldOwner` (string): Owner address to remove
* `newOwner` (string): New owner address to add
* `options` (ProposeOptions, optional): Propose options

**Returns:** `Promise<ProposeResult>`

#### changeThreshold

Proposes changing the approval threshold.

```javascript
const proposal = await account.changeThreshold(newThreshold, options?)
```

**Parameters:**

* `newThreshold` (number): New threshold value
* `options` (ProposeOptions, optional): Propose options

**Returns:** `Promise<ProposeResult>`

#### updateOwners

Proposes batch updating owners and threshold.

```javascript
const proposal = await account.updateOwners(newOwners, newThreshold, options?)
```

**Parameters:**

* `newOwners` (string[]): New list of owner addresses
* `newThreshold` (number): New threshold value
* `options` (ProposeOptions, optional): Propose options

**Returns:** `Promise<ProposeResult>`

#### sign

Signs a message with the multisig Safe. Proposes a new message or approves an existing one.

```javascript
const result = await account.sign(message, options?)
```

**Parameters:**

* `message` (string): Message to sign
* `options` (SignOptions, optional): Sign options
  * `isApproval` (boolean): If true, approve existing message; otherwise propose new

**Returns:** `Promise<SignResult>`

* `signature` (string): This owner's signature
* `safeMessage` (SafeMessage): Full SafeMessage object from Safe Transaction Service
  * `messageHash` (string): Message hash
  * `message` (string): Original message
  * `confirmations` (array): Array of confirmations with owner and signature
  * `preparedSignature` (string | null): Combined signature when fully signed
  * `proposedBy` (string): Address that proposed the message
  * `created` (string): Creation timestamp
  * `modified` (string): Last modified timestamp

#### verify

Verifies a message signature using EIP-1271.

```javascript
const isValid = await account.verify(message, signature)
```

**Parameters:**

* `message` (string): Original message
* `signature` (string): Combined signature (preparedSignature from SafeMessage)

**Returns:** `Promise<boolean>` - True if signature is valid

#### getMessage

Gets the status of a signed message.

```javascript
const message = await account.getMessage(messageHash)
```

**Parameters:**

* `messageHash` (string): Message hash

**Returns:** `Promise<SafeMessage | null>`

#### getPendingMessages

Gets all pending messages awaiting signatures.

```javascript
const messages = await account.getPendingMessages()
```

**Returns:** `Promise<{ results: SafeMessage[] }>`

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

### Static Methods

#### getSafesByOwner

Gets all Safe addresses owned by an EOA.

```javascript
const safes = await WalletAccountReadOnlyEvmMultisigSafe.getSafesByOwner(ownerAddress, config)
```

**Parameters:**

* `ownerAddress` (string): EOA address to search
* `config` (SafesByOwnerConfig): Configuration with chainId

**Returns:** `Promise<string[]>` - Array of Safe addresses

#### getSafeInfo

Gets Safe info without creating an instance.

```javascript
const info = await WalletAccountReadOnlyEvmMultisigSafe.getSafeInfo(safeAddress, config)
```

**Parameters:**

* `safeAddress` (string): Safe contract address
* `config` (SafesByOwnerConfig): Configuration with chainId

**Returns:** `Promise<SafeInfo>` - Safe info including owners, threshold, version

#### generateDeterministicSaltNonce

Generates a deterministic salt nonce from owners and threshold.

```javascript
const saltNonce = WalletAccountReadOnlyEvmMultisigSafe.generateDeterministicSaltNonce(owners, threshold)
```

**Returns:** `string` - Deterministic salt nonce

### Constructor

```javascript
new WalletAccountReadOnlyEvmMultisigSafe(address, config)
```

**Parameters:**

* `address` (string | null): Safe contract address (null for predicted Safe)
* `config` (EvmMultisigSafeReadOnlyConfig): Configuration object

### Methods

All query methods from WalletAccountEvmMultisigSafe are available:

* `getAddress()`
* `getBalance()`
* `getTokenBalance(tokenAddress)`
* `getPaymasterTokenBalance()`
* `getOwners()`
* `getThreshold()`
* `getNonce()`
* `isDeployed()`
* `getVersion()`
* `getPendingTransactions()`
* `getSafeOperation(hash)`
* `getTransactionHistory(options?)`
* `getIncomingTransactions(options?)`
* `isReadyToExecute(hash)`
* `getTransactionHashByUserOpHash(hash)`
* `getMessage(messageHash)`
* `getPendingMessages()`
* `quoteSendTransaction(tx, options?)`
* `quoteTransfer(options, proposeOptions?)`

## Types

### EvmMultisigSafeConfig

```typescript
interface EvmMultisigSafeConfig {
  // Required
  chainId: bigint
  provider: string | Eip1193Provider
  bundlerUrl: string
  
  // Required - Safe options (one of the following)
  options: ExistingSafeOptions | PredictedSafeOptions
  
  // Optional - Paymaster
  paymasterOptions?: PaymasterOptions
  
  // Optional - Safe Transaction Service
  txServiceUrl?: string
  safeApiKey?: string
  
  // Optional - Fee limits
  transferMaxFee?: number | bigint
}
```

### ExistingSafeOptions

```typescript
interface ExistingSafeOptions {
  safeAddress: string  // Existing Safe address to import
}
```

### PredictedSafeOptions

```typescript
interface PredictedSafeOptions {
  owners: string[]           // Owner addresses
  threshold: number          // Required signatures
  saltNonce?: string         // Optional: for deterministic address
  safeVersion?: SafeVersion  // Optional: Safe contract version
  deploymentType?: DeploymentType
}
```

### PaymasterOptions

```typescript
// ERC-20 Paymaster Mode
interface ERC20PaymasterOptions {
  paymasterUrl: string
  paymasterAddress?: string
  paymasterTokenAddress: string  // ERC-20 token for gas payment
  isSponsored?: false
}

// Sponsored Paymaster Mode
interface SponsoredPaymasterOptions {
  paymasterUrl: string
  paymasterAddress?: string      // Needed for ERC-20 override
  isSponsored: true
  sponsorshipPolicyId?: string
}

type PaymasterOptions = ERC20PaymasterOptions | SponsoredPaymasterOptions
```

### ProposeOptions

```typescript
interface ProposeOptions {
  // Paymaster overrides
  isSponsored?: boolean
  sponsorshipPolicyId?: string
  paymasterTokenAddress?: string
  amountToApprove?: bigint
}
```

### SignOptions

```typescript
interface SignOptions {
  isApproval?: boolean  // If true, approve existing; otherwise propose new
}
```

### SignResult

```typescript
interface SignResult {
  signature: string      // This owner's signature
  safeMessage: SafeMessage  // Full SafeMessage from API
}
```

### SafeMessage

Imported from `@safe-global/api-kit`:

```typescript
interface SafeMessage {
  messageHash: string
  message: string | EIP712TypedData
  proposedBy: string
  confirmations: Array<{
    owner: string
    signature: string
  }>
  preparedSignature: string | null
  created: string
  modified: string
  safe: string
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