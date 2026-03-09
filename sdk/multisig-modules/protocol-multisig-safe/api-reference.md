# API Reference

Complete API documentation for @tetherto/wdk-protocol-multisig-safe

## Classes

| Class | Description |
| --- | --- |
| WalletManagerMultisigEvmSafe4337 | Main class for managing multisig Safe wallets. Extends WalletManager. |
| WalletAccountMultisigEvmSafe4337 | Individual multisig Safe account with signing capabilities. |
| WalletAccountReadOnlyMultisigEvmSafe4337 | Read-only multisig Safe account for balance checks and queries. |

## WalletManagerMultisigEvmSafe4337

The main class for managing Safe Protocol multisig wallets with ERC-4337 account abstraction.

### Constructor

```javascript
new WalletManagerMultisigEvmSafe4337(seed, config)
```

**Parameters:**

* `seed` (string | Uint8Array): BIP-39 mnemonic seed phrase
* `config` (EvmMultisigSafeConfig): Configuration object (see [Configuration](configuration.md))

### Methods

#### getAccount

Returns a multisig Safe account at the specified index.

```javascript
const account = await wallet.getAccount(index)
```

**Parameters:**

* `index` (number, optional): Account index for BIP-44 derivation (default: 0)

**Returns:** `Promise<WalletAccountMultisigEvmSafe4337>`

#### getAccountByPath

Returns a multisig Safe account at the specified BIP-44 derivation path.

```javascript
const account = await wallet.getAccountByPath(path)
```

**Parameters:**

* `path` (string): BIP-44 derivation path (e.g., "0'/0/5")

**Returns:** `Promise<WalletAccountMultisigEvmSafe4337>`

#### getFeeRates

Returns the current fee rates.

```javascript
const feeRates = await wallet.getFeeRates()
```

**Returns:** `Promise<FeeRates>` - Fee rates in wei (`normal` and `fast`)

#### dispose

Disposes the wallet manager and clears sensitive data from memory.

```javascript
wallet.dispose()
```

## WalletAccountMultisigEvmSafe4337

Individual multisig Safe account with full signing capabilities. Extends `WalletAccountReadOnlyMultisigEvmSafe4337`.

### Constructor

```javascript
new WalletAccountMultisigEvmSafe4337(seed, path, config)
```

**Parameters:**

* `seed` (string | Uint8Array): BIP-39 mnemonic seed phrase
* `path` (string): BIP-44 derivation path (e.g., "0'/0/0")
* `config` (EvmMultisigSafeConfig): Configuration object

### Properties

#### index

The derivation path's index of this account.

**Type:** `number`

#### path

The full BIP-44 derivation path (e.g., "m/44'/60'/0'/0/0").

**Type:** `string`

#### keyPair

The account's key pair.

**Type:** `KeyPair`

### Methods

#### getAddress

Returns the Safe contract address (predicted or actual).

```javascript
const address = await account.getAddress()
```

**Returns:** `Promise<string>` - Safe address

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

**Throws:** Error if no paymaster token is configured (e.g., sponsored or native coins mode)

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

#### getMultisigInfo

Returns comprehensive multisig wallet info.

```javascript
const info = await account.getMultisigInfo()
```

**Returns:** `Promise<MultisigInfo>`

* `address` (string): Safe address
* `owners` (string[]): Owner addresses
* `threshold` (number): Required confirmations
* `isCreated` (boolean): Whether Safe is deployed

#### getNonce

Returns the Safe's current nonce.

```javascript
const nonce = await account.getNonce()
```

**Returns:** `Promise<number>` - Current nonce

#### getVersion

Returns the Safe contract version.

```javascript
const version = await account.getVersion()
```

**Returns:** `Promise<string>` - Version string (e.g., "1.4.1") or "not deployed"

#### isDeployed

Checks if the Safe contract is deployed on-chain.

```javascript
const deployed = await account.isDeployed()
```

**Returns:** `Promise<boolean>`

#### deploy

Deploys the Safe contract on-chain. Requires native ETH in the signer's EOA to pay for gas.

```javascript
const result = await account.deploy()
```

**Returns:** `Promise<TransactionResult>` - Deployment result with `txHash` and `fee`

**Throws:** Error if Safe is already deployed

#### sendTransaction

Proposes a transaction for multisig approval. This is the primary method for initiating multisig transactions (replaces the previous `propose` method). Auto-executes if `autoExecute` is true and threshold is met after proposing.

```javascript
const result = await account.sendTransaction(tx, options?)
```

**Parameters:**

* `tx` (EvmTransaction): Transaction to send
  * `to` (string): Recipient address
  * `value` (string | bigint): Value in wei
  * `data` (string, optional): Transaction data
* `options` (object, optional): Send options
  * `autoExecute` (boolean): Auto-execute if threshold is met (default: false)
  * Plus any paymaster config overrides (see [Per-Transaction Override](usage.md#per-transaction-override))

**Returns:** `Promise<MultisigTransactionResult>`

* `proposalId` (string): Safe operation hash
* `hash` (string): Safe operation hash or UserOp hash (if executed)
* `fee` (bigint): Estimated fee
* `confirmations` (number): Number of confirmations
* `threshold` (number): Required threshold
* `executed` (boolean): Whether transaction was executed

#### transfer

Transfers tokens using the multisig workflow. Auto-executes if `autoExecute` is true and threshold is met after proposing.

```javascript
const result = await account.transfer(transferOptions, options?)
```

**Parameters:**

* `transferOptions` (TransferOptions): Transfer details
  * `token` (string): ERC-20 token address
  * `recipient` (string): Recipient address
  * `amount` (string | bigint): Amount in smallest units
* `options` (object, optional): Send options (same as `sendTransaction`)

**Returns:** `Promise<MultisigTransactionResult>`

#### approveTx

Approves (signs) an existing proposal.

```javascript
const result = await account.approveTx(proposalId)
```

**Parameters:**

* `proposalId` (string): Safe operation hash from sendTransaction()

**Returns:** `Promise<MultisigResult>`

* `proposalId` (string): Safe operation hash
* `confirmations` (number): Updated number of confirmations
* `threshold` (number): Required threshold

#### rejectTx

Rejects a proposal by creating a rejection transaction with the same nonce.

```javascript
const result = await account.rejectTx(proposalId)
```

**Parameters:**

* `proposalId` (string): Safe operation hash to reject

**Returns:** `Promise<MultisigResult>` - The rejection proposal result

#### executeTx

Executes a fully signed Safe operation via the bundler.

```javascript
const result = await account.executeTx(proposalId)
```

**Parameters:**

* `proposalId` (string): Safe operation hash from sendTransaction()

**Returns:** `Promise<MultisigExecuteResult>`

* `hash` (string): UserOperation hash

**Throws:** Error if not enough confirmations

#### isReadyToExecute

Checks if a transaction has met the threshold and is ready to execute.

```javascript
const ready = await account.isReadyToExecute(proposalId)
```

**Parameters:**

* `proposalId` (string): Safe operation hash to check

**Returns:** `Promise<boolean>`

#### getProposals

Gets multiple Safe operations by their hashes.

```javascript
const proposals = await account.getProposals(proposalIds)
```

**Parameters:**

* `proposalIds` (string[]): Array of Safe operation hashes

**Returns:** `Promise<(MultisigProposal | null)[]>`

* Each element contains `proposalId`, `confirmations`, `threshold`, or `null` if not found

#### getTransactionReceipt

Returns a transaction's receipt. Supports both regular transaction hashes and UserOperation hashes (from ERC-4337 bundler).

```javascript
const receipt = await account.getTransactionReceipt(hash)
```

**Parameters:**

* `hash` (string): Transaction hash or UserOperation hash

**Returns:** `Promise<EvmTransactionReceipt | UserOperationReceipt | null>` - The receipt, or null if not yet included in a block

#### quoteSendTransaction

Estimates the fee for a transaction without executing.

```javascript
const quote = await account.quoteSendTransaction(tx, config?)
```

**Parameters:**

* `tx` (EvmTransaction): Transaction to quote
* `config` (object, optional): Paymaster config overrides

**Returns:** `Promise<{ fee: bigint }>`

#### quoteTransfer

Estimates the fee for a token transfer.

```javascript
const quote = await account.quoteTransfer(transferOptions, config?)
```

**Parameters:**

* `transferOptions` (TransferOptions): Transfer details
* `config` (object, optional): Paymaster config overrides

**Returns:** `Promise<{ fee: bigint }>`

#### quoteDeploy

Estimates the fee for deploying the Safe.

```javascript
const quote = await account.quoteDeploy()
```

**Returns:** `Promise<{ fee: bigint }>`

**Throws:** Error if Safe is already deployed

#### addOwner

Proposes adding a new owner to the Safe.

```javascript
const proposal = await account.addOwner(ownerAddress, options?)
```

**Parameters:**

* `ownerAddress` (string): New owner address
* `options` (object, optional):
  * `threshold` (number, optional): New threshold after adding (defaults to current)
  * Plus any paymaster config overrides

**Returns:** `Promise<MultisigResult>`

#### removeOwner

Proposes removing an owner from the Safe.

```javascript
const proposal = await account.removeOwner(ownerAddress, options?)
```

**Parameters:**

* `ownerAddress` (string): Owner address to remove
* `options` (object, optional):
  * `threshold` (number, optional): New threshold after removal (defaults to current)
  * Plus any paymaster config overrides

**Returns:** `Promise<MultisigResult>`

#### swapOwner

Proposes swapping one owner for another.

```javascript
const proposal = await account.swapOwner(oldOwnerAddress, newOwnerAddress, config?)
```

**Parameters:**

* `oldOwnerAddress` (string): Owner address to remove
* `newOwnerAddress` (string): New owner address to add
* `config` (object, optional): Paymaster config overrides

**Returns:** `Promise<MultisigResult>`

#### changeThreshold

Proposes changing the approval threshold.

```javascript
const proposal = await account.changeThreshold(newThreshold, config?)
```

**Parameters:**

* `newThreshold` (number): New threshold value
* `config` (object, optional): Paymaster config overrides

**Returns:** `Promise<MultisigResult>`

#### updateOwners

Proposes batch updating owners and threshold in a single transaction.

```javascript
const proposal = await account.updateOwners(newOwners, newThreshold, config?)
```

**Parameters:**

* `newOwners` (string[]): New list of owner addresses
* `newThreshold` (number): New threshold value
* `config` (object, optional): Paymaster config overrides

**Returns:** `Promise<MultisigResult>`

**Throws:** Error if no changes to make

#### proposeMessage

Proposes signing a message with the multisig Safe.

```javascript
const result = await account.proposeMessage(message)
```

**Parameters:**

* `message` (string): Message to sign

**Returns:** `Promise<MessageProposal>`

* `messageHash` (string): Message hash for approval
* `signature` (string): This owner's signature
* `confirmations` (number): Number of confirmations
* `threshold` (number): Required confirmations
* `combinedSignature` (string | null): Combined signature when fully signed

#### approveMessage

Approves a previously proposed message.

```javascript
const result = await account.approveMessage(messageHash)
```

**Parameters:**

* `messageHash` (string): Message hash from proposeMessage()

**Returns:** `Promise<MessageProposal>`

* `messageHash` (string): Message hash
* `signature` (string): This owner's signature
* `confirmations` (number): Number of confirmations
* `threshold` (number): Required confirmations
* `combinedSignature` (string | null): Combined signature when fully signed

#### sign

Signs a message. Internally calls proposeMessage.

```javascript
const signature = await account.sign(message)
```

**Parameters:**

* `message` (string): Message to sign

**Returns:** `Promise<string>` - This owner's signature

#### verify

Verifies a message signature using EIP-1271.

```javascript
const isValid = await account.verify(message, signature)
```

**Parameters:**

* `message` (string): Original message
* `signature` (string): Combined signature (combinedSignature from approveMessage result)

**Returns:** `Promise<boolean>` - True if signature is valid

#### getMessages

Gets the status of multiple signed messages.

```javascript
const messages = await account.getMessages(messageHashes)
```

**Parameters:**

* `messageHashes` (string[]): Array of message hashes

**Returns:** `Promise<(MessageInfo | null)[]>`

* Each element contains `messageHash`, `message`, `confirmations`, `threshold`, `combinedSignature`, or `null` if not found

#### validateSignerIsOwner

Validates that the signer is an owner of the Safe.

```javascript
await account.validateSignerIsOwner()
```

**Throws:** Error if signer is not an owner of the Safe

#### toReadOnlyAccount

Converts to a read-only account.

```javascript
const readOnly = await account.toReadOnlyAccount()
```

**Returns:** `Promise<WalletAccountReadOnlyMultisigEvmSafe4337>`

#### dispose

Disposes the account and clears sensitive data from memory.

```javascript
account.dispose()
```

## WalletAccountReadOnlyMultisigEvmSafe4337

Read-only account for balance checks and queries without signing capabilities.

### Static Methods

#### generateDeterministicSaltNonce

Generates a deterministic salt nonce from owners and threshold. Produces the same nonce regardless of owner order.

```javascript
const saltNonce = WalletAccountReadOnlyMultisigEvmSafe4337.generateDeterministicSaltNonce(owners, threshold)
```

**Parameters:**

* `owners` (string[]): Array of owner addresses
* `threshold` (number): Number of required signatures

**Returns:** `string` - Deterministic salt nonce (hex string)

### Constructor

```javascript
new WalletAccountReadOnlyMultisigEvmSafe4337(signerAddress, config)
```

**Parameters:**

* `signerAddress` (string | null): The signer's EOA address, or null for pure read-only
* `config` (EvmMultisigSafeReadOnlyConfig): Configuration object

### Methods

All query methods from WalletAccountMultisigEvmSafe4337 are available:

* `getAddress()`
* `getSignerAddress()`
* `getBalance()`
* `getTokenBalance(tokenAddress)`
* `getPaymasterTokenBalance()`
* `getOwners()`
* `getThreshold()`
* `getMultisigInfo()`
* `getNonce()`
* `getVersion()`
* `isDeployed()`
* `getProposals(proposalIds)`
* `getMessages(messageHashes)`
* `isReadyToExecute(proposalId)`
* `getTransactionReceipt(hash)`
* `verify(message, signature)`
* `quoteSendTransaction(tx, config?)`
* `quoteTransfer(transferOptions, config?)`
* `quoteDeploy()`

{% hint style="info" %}
For transaction history, pending operations, and incoming transfers, use `SafeApiKit` directly. The read-only account exposes `_getApiKit()` for advanced queries.
{% endhint %}

## Constants

### DEFAULT_SAFE_MODULES_VERSION

The default Safe modules version.

```javascript
const DEFAULT_SAFE_MODULES_VERSION = '0.2.0'
```

### DEFAULT_SAFE_VERSION

The default Safe contract version.

```javascript
const DEFAULT_SAFE_VERSION = '1.4.1'
```

## Types

### EvmMultisigSafeConfig

```typescript
type EvmMultisigSafeConfig = EvmMultisigSafeCommonConfig & (
  EvmMultisigSafePaymasterTokenConfig |
  EvmMultisigSafeSponsoredConfig |
  EvmMultisigSafeNativeCoinsConfig
)
```

### EvmMultisigSafeCommonConfig

```typescript
interface EvmMultisigSafeCommonConfig {
  provider: string | Eip1193Provider    // RPC URL or EIP-1193 provider
  bundlerUrl: string                     // ERC-4337 bundler URL
  chainId: bigint                        // Chain ID
  safeOptions: ExistingSafeOptions | PredictedSafeOptions

  // Optional
  entryPointAddress?: string             // EntryPoint contract address
  safeModulesVersion?: string            // Default: '0.2.0'
  paymasterUrl?: string                  // Paymaster service URL
  txServiceUrl?: string                  // Custom Safe Transaction Service URL
  safeApiKey?: string                    // Safe API key
}
```

### EvmMultisigSafePaymasterTokenConfig

```typescript
interface EvmMultisigSafePaymasterTokenConfig {
  isSponsored?: false
  useNativeCoins?: false
  paymasterAddress: string               // Paymaster contract address
  paymasterTokenAddress: string          // ERC-20 token for gas payment
  transferMaxFee?: number | bigint       // Maximum fee for transfers
  amountToApprove?: number | bigint      // Amount to approve for paymaster
}
```

### EvmMultisigSafeSponsoredConfig

```typescript
interface EvmMultisigSafeSponsoredConfig {
  isSponsored: true
  useNativeCoins?: false
  sponsorshipPolicyId?: string           // Sponsorship policy ID
}
```

### EvmMultisigSafeNativeCoinsConfig

```typescript
interface EvmMultisigSafeNativeCoinsConfig {
  isSponsored?: false
  useNativeCoins: true
  transferMaxFee?: number | bigint       // Maximum fee for transfers
}
```

### EvmMultisigSafeReadOnlyConfig

```typescript
type EvmMultisigSafeReadOnlyConfig = Omit<EvmMultisigSafeConfig, 'transferMaxFee' | 'amountToApprove'>
```

### ExistingSafeOptions

```typescript
interface ExistingSafeOptions {
  safeAddress: string                    // Existing Safe address to import
}
```

### PredictedSafeOptions

```typescript
interface PredictedSafeOptions {
  owners: string[]                       // Owner addresses
  threshold: number                      // Required signatures
  saltNonce?: string                     // For deterministic address
  safeVersion?: string                   // Safe contract version
  deploymentType?: string               // Deployment type
}
```

### MultisigResult

```typescript
interface MultisigResult {
  proposalId: string
  confirmations: number
  threshold: number
}
```

### MultisigTransactionResult

```typescript
interface MultisigTransactionResult {
  proposalId: string
  hash: string
  fee: bigint
  confirmations: number
  threshold: number
  executed: boolean
}
```

### MultisigExecuteResult

```typescript
interface MultisigExecuteResult {
  hash: string                           // UserOperation hash
}
```

### MultisigInfo

```typescript
interface MultisigInfo {
  address: string
  owners: string[]
  threshold: number
  isCreated: boolean
}
```

### MultisigProposal

```typescript
interface MultisigProposal {
  proposalId: string
  confirmations: number
  threshold: number
}
```

### MessageProposal

```typescript
interface MessageProposal {
  messageHash: string
  signature: string
  confirmations: number
  threshold: number
  combinedSignature: string | null
}
```

### MessageInfo

```typescript
interface MessageInfo {
  messageHash: string
  message: string
  confirmations: number
  threshold: number
  combinedSignature: string | null
}
```

---

### Need Help?

{% include "../../../.gitbook/includes/support-cards.md" %}
