# API Reference

Complete API documentation for @tetherto/wdk-wallet-evm-multisig-safe

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
  * `options` (ExistingSafeOptions | PredictedSafeOptions): Safe creation or import config
  * `paymasterOptions` (PaymasterOptions, optional): Paymaster configuration
  * `safeApiKey` (string, optional): Safe API key
  * `txServiceUrl` (string, optional): Custom Safe Transaction Service URL
  * `transferMaxFee` (number | bigint, optional): Maximum fee in paymaster token units
  * `entryPointAddress` (string, optional): EntryPoint contract address
  * `safeModulesVersion` (string, optional): Safe modules version (default: '0.2.0')

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

* `proposalId` (string): Unique Safe operation hash
* `confirmations` (number): Number of confirmations
* `threshold` (number): Required confirmations to execute

#### approve

Approves a pending transaction.

```javascript
const result = await account.approve(proposalId)
```

**Parameters:**

* `proposalId` (string): Operation hash from propose()

**Returns:** `Promise<ApprovalResult>`

* `confirmations` (number): Number of confirmations
* `threshold` (number): Required threshold

#### reject

Rejects a pending transaction by proposing a rejection transaction.

```javascript
const result = await account.reject(proposalId)
```

**Parameters:**

* `proposalId` (string): Operation hash to reject

**Returns:** `Promise<ProposeResult>`

#### execute

Executes a transaction that has met the threshold.

```javascript
const result = await account.execute(proposalId)
```

**Parameters:**

* `proposalId` (string): Operation hash from propose()

**Returns:** `Promise<ExecuteResult>`

* `hash` (string): UserOperation hash

#### isReadyToExecute

Checks if a transaction has met the threshold and is ready to execute.

```javascript
const ready = await account.isReadyToExecute(proposalId)
```

**Parameters:**

* `proposalId` (string): Operation hash to check

**Returns:** `Promise<boolean>`

#### getProposal

Gets a specific Safe operation by hash.

```javascript
const proposal = await account.getProposal(proposalId)
```

**Parameters:**

* `proposalId` (string): The Safe operation hash

**Returns:** `Promise<MultisigProposal | null>`

* `proposalId` (string): Operation hash
* `confirmations` (number): Number of confirmations
* `threshold` (number): Required threshold

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

#### quoteDeploy

Estimates the fee for deploying the Safe.

```javascript
const quote = await account.quoteDeploy()
```

**Returns:** `Promise<{ fee: bigint }>`

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

#### proposeMessage

Proposes signing a message with the multisig Safe.

```javascript
const result = await account.proposeMessage(message)
```

**Parameters:**

* `message` (string): Message to sign

**Returns:** `Promise<MessageResult>`

* `signature` (string): This owner's signature
* `messageHash` (string): Message hash for approval
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

**Returns:** `Promise<MessageResult>`

* `signature` (string): This owner's signature
* `confirmations` (number): Number of confirmations
* `threshold` (number): Required confirmations
* `combinedSignature` (string | null): Combined signature when fully signed

#### verify

Verifies a message signature using EIP-1271.

```javascript
const isValid = await account.verify(message, signature)
```

**Parameters:**

* `message` (string): Original message
* `signature` (string): Combined signature (combinedSignature from approveMessage result)

**Returns:** `Promise<boolean>` - True if signature is valid

#### getMessage

Gets the status of a signed message.

```javascript
const message = await account.getMessage(messageHash)
```

**Parameters:**

* `messageHash` (string): Message hash

**Returns:** `Promise<MessageInfo | null>`

* `messageHash` (string): Message hash
* `message` (string): Original message
* `confirmations` (number): Number of confirmations
* `threshold` (number): Required confirmations
* `combinedSignature` (string | null): Combined signature when fully signed

#### sign

Signs a message with the multisig Safe. Internally calls proposeMessage for new messages or approveMessage for existing ones.

```javascript
const signature = await account.sign(message)
```

**Parameters:**

* `message` (string): Message to sign

**Returns:** `Promise<string>` - This owner's signature

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
* `getProposal(proposalId)`
* `getMessage(messageHash)`
* `isReadyToExecute(proposalId)`
* `quoteSendTransaction(tx, options?)`
* `quoteTransfer(options, proposeOptions?)`
* `quoteDeploy()`

{% hint style="info" %}
For transaction history, pending operations, and incoming transfers, use `SafeApiKit` directly. The read-only account exposes `_getApiKit()` for advanced queries.
{% endhint %}

## Types

### EvmMultisigSafeConfig

```typescript
interface EvmMultisigSafeConfig {
  // Required
  chainId: bigint
  provider: string | Eip1193Provider
  bundlerUrl: string
  options: ExistingSafeOptions | PredictedSafeOptions
  
  // Optional - Paymaster
  paymasterOptions?: PaymasterOptions
  
  // Optional - Safe Transaction Service (pick one)
  txServiceUrl?: string
  safeApiKey?: string
  
  // Optional - Advanced
  transferMaxFee?: number | bigint
  entryPointAddress?: string
  safeModulesVersion?: string  // Default: '0.2.0'
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
type SponsoredPaymasterOption = {
  isSponsored: true
  sponsorshipPolicyId?: string
}

type ERC20PaymasterOption = {
  isSponsored?: false
  paymasterAddress: string
  paymasterTokenAddress: string
  amountToApprove?: bigint
}

type PaymasterOptions = {
  paymasterUrl: string
} & (SponsoredPaymasterOption | ERC20PaymasterOption) | undefined
```

### ProposeOptions

```typescript
interface ProposeOptions {
  // Paymaster overrides
  isSponsored?: boolean
  sponsorshipPolicyId?: string
  paymasterTokenAddress?: string
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