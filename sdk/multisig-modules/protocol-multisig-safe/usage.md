# Usage

Installation, quick start, and usage examples for @tetherto/wdk-wallet-evm-multisig-safe

## Installation

To install the `@tetherto/wdk-wallet-evm-multisig-safe` package, follow these instructions:

```bash
npm install @tetherto/wdk-wallet-evm-multisig-safe
```

## Supported Paymaster Tokens

For a complete list of supported ERC-20 tokens that can be used to pay gas fees on each network, see:
[Pimlico ERC-20 Paymaster Supported Tokens](https://docs.pimlico.io/references/paymaster/erc20-paymaster/supported-tokens)

## Quick Start

### Importing from `@tetherto/wdk-wallet-evm-multisig-safe`

1. WalletManagerEvmMultisigSafe: Main class for managing multisig Safe wallets
2. WalletAccountEvmMultisigSafe: Use this for full access accounts
3. WalletAccountReadOnlyEvmMultisigSafe: Use this for read-only accounts

### Creating a New Multisig Wallet

```javascript
import WalletManagerEvmMultisigSafe, { 
  WalletAccountEvmMultisigSafe, 
  WalletAccountReadOnlyEvmMultisigSafe 
} from '@tetherto/wdk-wallet-evm-multisig-safe'

// Use a BIP-39 seed phrase (replace with your own secure phrase)
const seedPhrase = 'your twelve word seed phrase here' // Replace with actual seed generation

// Create wallet manager with multisig Safe configuration
const wallet = new WalletManagerEvmMultisigSafe(seedPhrase, {
  chainId: 11155111n, // Sepolia testnet
  provider: 'https://sepolia.infura.io/v3/YOUR_KEY',
  bundlerUrl: 'https://api.pimlico.io/v2/sepolia/rpc?apikey=YOUR_KEY',
  safeApiKey: 'YOUR_SAFE_API_KEY', // OR txServiceUrl: 'https://your-proxy.com/safe'
  paymasterOptions: {
    paymasterUrl: 'https://api.pimlico.io/v2/sepolia/rpc?apikey=YOUR_KEY',
    paymasterAddress: '0x...',       // Paymaster contract address
    paymasterTokenAddress: '0x...'   // USDT or other supported token
  },
  options: {
    owners: ['0xAliceEOA...', '0xBobEOA...'],
    threshold: 2
  },
  transferMaxFee: 100000000000000 // Optional: Maximum fee in paymaster token units
})

// Get the first account
const account = await wallet.getAccount(0)
const safeAddress = await account.getAddress()
console.log('Safe address:', safeAddress)
```

### Importing an Existing Safe

```javascript
import WalletManagerEvmMultisigSafe from '@tetherto/wdk-wallet-evm-multisig-safe'

// Import an existing Safe by address using ExistingSafeOptions
const wallet = new WalletManagerEvmMultisigSafe(seedPhrase, {
  chainId: 11155111n,
  provider: 'https://sepolia.infura.io/v3/YOUR_KEY',
  bundlerUrl: 'https://api.pimlico.io/v2/sepolia/rpc?apikey=YOUR_KEY',
  safeApiKey: 'YOUR_SAFE_API_KEY',
  paymasterOptions: {
    paymasterUrl: 'https://api.pimlico.io/v2/sepolia/rpc?apikey=YOUR_KEY',
    paymasterAddress: '0x...',
    paymasterTokenAddress: '0x...'
  },
  options: {
    safeAddress: '0xExistingSafeAddress...' // Import by address
  }
})

const account = await wallet.getAccount(0)
const address = await account.getAddress()
console.log('Imported Safe:', address)
```

### Deploying a Safe

```javascript
// Note: Deployment requires ETH in the signer's EOA for gas
const account = await wallet.getAccount(0)

// Check signer's EOA address
const signerEoa = await account.getSignerAddress()
console.log('Fund this address with ETH for deployment:', signerEoa)

// Check if Safe is deployed
const isDeployed = await account.isDeployed()
console.log('Is deployed:', isDeployed)

// Deploy the Safe (if not already deployed)
if (!isDeployed) {
  const deployResult = await account.deploy()
  console.log('Deployed:', deployResult.deployed)
  console.log('Transaction hash:', deployResult.txHash)
}

// After deployment, all transactions can use paymaster or sponsor
// No more ETH needed in the Safe or signer's EOA!
```

### Managing Multiple Accounts

```javascript
import WalletManagerEvmMultisigSafe from '@tetherto/wdk-wallet-evm-multisig-safe'

// Get the first account (index 0)
const account = await wallet.getAccount(0)
const address = await account.getAddress()
console.log('Account 0 address:', address)

// Get the second account (index 1)
const account1 = await wallet.getAccount(1)
const address1 = await account1.getAddress()
console.log('Account 1 address:', address1)

// Get account by custom derivation path
const customAccount = await wallet.getAccountByPath("0'/0/5")
const customAddress = await customAccount.getAddress()
console.log('Custom account address:', customAddress)
```

### Checking Balances

#### Owned Account

For accounts where you have the seed phrase and full access:

```javascript
import WalletManagerEvmMultisigSafe from '@tetherto/wdk-wallet-evm-multisig-safe'

// Assume wallet and account are already created
// Get native token balance (in wei)
const balance = await account.getBalance()
console.log('Native balance:', balance, 'wei') // 1 ETH = 1000000000000000000 wei

// Get ERC20 token balance
const tokenContract = '0x...' // Token contract address
const tokenBalance = await account.getTokenBalance(tokenContract)
console.log('Token balance:', tokenBalance)

// Get paymaster token balance (for paying fees)
const paymasterBalance = await account.getPaymasterTokenBalance()
console.log('Paymaster token balance:', paymasterBalance, 'units')
```

#### Read-Only Account

For addresses where you don't have the seed phrase:

```javascript
import { WalletAccountReadOnlyEvmMultisigSafe } from '@tetherto/wdk-wallet-evm-multisig-safe'

// Create a read-only account
const readOnlyAccount = new WalletAccountReadOnlyEvmMultisigSafe(null, {
  chainId: 11155111n,
  provider: 'https://sepolia.infura.io/v3/YOUR_KEY',
  bundlerUrl: 'https://api.pimlico.io/v2/sepolia/rpc?apikey=YOUR_KEY',
  safeApiKey: 'YOUR_SAFE_API_KEY',
  paymasterOptions: {
    paymasterUrl: 'https://api.pimlico.io/v2/sepolia/rpc?apikey=YOUR_KEY',
    paymasterAddress: '0x...',
    paymasterTokenAddress: '0x...'
  },
  options: {
    safeAddress: '0xSafeAddress...'
  }
})

// Check native token balance
const balance = await readOnlyAccount.getBalance()
console.log('Native balance:', balance, 'wei')

// Check ERC20 token balance
const tokenBalance = await readOnlyAccount.getTokenBalance('0x...')
console.log('Token balance:', tokenBalance)
```

## Multisig Transaction Workflow

### Propose a Transaction

```javascript
// Get fee estimate
const quote = await account.quoteSendTransaction({
  to: '0xRecipientAddress...',
  value: '1000000000000000000', // 1 ETH in wei
  data: '0x'
})

console.log('Estimated fee:', quote.fee)

// Propose the transaction
const proposal = await account.propose({
  to: '0xRecipientAddress...',
  value: '1000000000000000000',
  data: '0x'
})

console.log('Proposal ID:', proposal.proposalId)
console.log('Confirmations:', proposal.confirmations, '/', proposal.threshold)
```

### Approve a Transaction

```javascript
// Second signer approves the transaction
const bobAccount = new WalletAccountEvmMultisigSafe(bobSeedPhrase, "0'/0/0", config)

const approval = await bobAccount.approve(proposal.proposalId)
console.log('Transaction approved by Bob')
console.log('Confirmations:', approval.confirmations, '/', approval.threshold)
```

### Execute a Transaction

```javascript
// Check if ready to execute
const isReady = await account.isReadyToExecute(proposal.proposalId)
console.log('Ready to execute:', isReady)

// Execute when threshold is met
if (isReady) {
  const result = await account.execute(proposal.proposalId)
  console.log('UserOp hash:', result.hash)
}
```

## Paymaster Modes

### ERC-20 Paymaster Mode (Default)

Pay transaction fees using ERC-20 tokens (e.g., USDT):

```javascript
const wallet = new WalletManagerEvmMultisigSafe(seedPhrase, {
  chainId: 11155111n,
  provider: 'https://sepolia.infura.io/v3/YOUR_KEY',
  bundlerUrl: 'https://api.pimlico.io/v2/sepolia/rpc?apikey=YOUR_KEY',
  safeApiKey: 'YOUR_SAFE_API_KEY',
  paymasterOptions: {
    paymasterUrl: 'https://api.pimlico.io/v2/sepolia/rpc?apikey=YOUR_KEY',
    paymasterAddress: '0x...',
    paymasterTokenAddress: '0x...' // USDT or other supported token
  },
  options: {
    owners: ['0xAlice...', '0xBob...'],
    threshold: 2
  }
})

// Propose transaction (paymaster handles token payment automatically)
const proposal = await account.propose(tx)
```

### Sponsored (Gasless) Mode

Use a sponsored paymaster for completely gasless transactions:

```javascript
const wallet = new WalletManagerEvmMultisigSafe(seedPhrase, {
  chainId: 11155111n,
  provider: 'https://sepolia.infura.io/v3/YOUR_KEY',
  bundlerUrl: 'https://api.pimlico.io/v2/sepolia/rpc?apikey=YOUR_KEY',
  safeApiKey: 'YOUR_SAFE_API_KEY',
  paymasterOptions: {
    paymasterUrl: 'https://api.pimlico.io/v2/sepolia/rpc?apikey=YOUR_KEY',
    isSponsored: true,
    sponsorshipPolicyId: 'sp_my_policy' // Optional
  },
  options: {
    owners: ['0xAlice...', '0xBob...'],
    threshold: 2
  }
})

// Sponsor pays gas
const proposal = await account.propose(tx)
```

### Per-Transaction Override

Override paymaster mode for individual transactions:

```javascript
// Default config uses ERC-20 paymaster
const account = await wallet.getAccount(0)

// Override to sponsored mode for this transaction
const result = await account.sendTransaction({
  to: '0x...',
  value: '1000000000000000000',
  data: '0x'
}, {
  isSponsored: true // Override to sponsored mode
})

// Override to different ERC-20 token
const result2 = await account.sendTransaction({
  to: '0x...',
  value: '1000000000000000000',
  data: '0x'
}, {
  isSponsored: false,
  paymasterTokenAddress: '0xDifferentToken...' // Use different token
})
```

## Owner Management

### Add an Owner

```javascript
// Propose adding a new owner
const proposal = await account.addOwner('0xNewOwnerAddress...')

// Other owners approve
await bobAccount.approve(proposal.proposalId)

// Execute when threshold is met
await account.execute(proposal.proposalId)
```

### Remove an Owner

```javascript
// Propose removing an owner
const proposal = await account.removeOwner('0xOwnerToRemove...')

// Other owners approve and execute
await bobAccount.approve(proposal.proposalId)
await account.execute(proposal.proposalId)
```

### Swap an Owner

```javascript
// Propose swapping an owner
const proposal = await account.swapOwner('0xOldOwner...', '0xNewOwner...')

// Other owners approve and execute
await bobAccount.approve(proposal.proposalId)
await account.execute(proposal.proposalId)
```

### Change Threshold

```javascript
// Propose changing the threshold
const proposal = await account.changeThreshold(newThreshold)

// Other owners approve and execute
await bobAccount.approve(proposal.proposalId)
await account.execute(proposal.proposalId)
```

### Batch Update Owners

```javascript
// Propose batch updating owners and threshold
const proposal = await account.updateOwners(
  ['0xOwner1...', '0xOwner2...', '0xOwner3...'],
  2 // new threshold
)

// Other owners approve and execute
await bobAccount.approve(proposal.proposalId)
await account.execute(proposal.proposalId)
```

## Message Signing

### Propose a Message

```javascript
// Alice proposes signing a message
const result = await alice.proposeMessage('Hello from Safe!')

console.log('Alice signature:', result.signature)
console.log('Message hash:', result.messageHash)
console.log('Confirmations:', result.confirmations, '/', result.threshold)
```

### Approve a Message

```javascript
// Bob approves the message
const approval = await bob.approveMessage(result.messageHash)

console.log('Bob signature:', approval.signature)
console.log('Confirmations:', approval.confirmations, '/', approval.threshold)

// Check if fully signed
if (approval.combinedSignature) {
  console.log('Combined signature:', approval.combinedSignature)
}
```

### Verify a Signature (EIP-1271)

```javascript
// Verify the combined signature on-chain
if (approval.combinedSignature) {
  const isValid = await alice.verify(
    'Hello from Safe!',
    approval.combinedSignature
  )
  console.log('Signature valid:', isValid)
}
```

### Get Message Status

```javascript
// Get messages by hash
const [message] = await account.getMessages([messageHash])

console.log('Message:', message.message)
console.log('Confirmations:', message.confirmations, '/', message.threshold)
console.log('Combined signature:', message.combinedSignature)
```

## Tracking Transactions

After executing a transaction, you receive a UserOp hash. You can track status on these explorers:

- **JiffyScan**: `https://jiffyscan.xyz/userOpHash/{userOpHash}?network=sepolia`
- **Blockscout**: `https://eth-sepolia.blockscout.com/op/{userOpHash}`

To get the on-chain transaction hash programmatically, use the Safe4337Pack directly:

```javascript
const result = await account.execute(proposalId)
console.log('UserOp hash:', result.hash)

// Get on-chain tx hash via safe4337Pack
const safe4337Pack = await account._getSafe4337Pack()
const receipt = await safe4337Pack.getUserOperationReceipt(result.hash)
const txHash = receipt?.receipt?.transactionHash
console.log('TX Hash:', txHash)
```

## Memory Management

```javascript
// Dispose wallet accounts to clear private keys from memory
account.dispose()

// Dispose entire wallet manager
wallet.dispose()
```

## Complete Examples

### Complete Wallet Setup

```javascript
import WalletManagerEvmMultisigSafe from '@tetherto/wdk-wallet-evm-multisig-safe'

async function setupMultisigWallet() {
  const seedPhrase = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
  
  // Create multisig wallet manager
  const wallet = new WalletManagerEvmMultisigSafe(seedPhrase, {
    chainId: 11155111n, // Sepolia testnet
    provider: 'https://sepolia.infura.io/v3/YOUR_KEY',
    bundlerUrl: 'https://api.pimlico.io/v2/sepolia/rpc?apikey=YOUR_KEY',
    safeApiKey: 'YOUR_SAFE_API_KEY',
    paymasterOptions: {
      paymasterUrl: 'https://api.pimlico.io/v2/sepolia/rpc?apikey=YOUR_KEY',
      paymasterAddress: '0x...',
      paymasterTokenAddress: '0x...' // USDT or other supported token
    },
    options: {
      owners: ['0xAliceEOA...', '0xBobEOA...'],
      threshold: 2
    },
    transferMaxFee: 100000 // Optional: Maximum fee in paymaster token units
  })
  
  // Get first account
  const account = await wallet.getAccount(0)
  const address = await account.getAddress()
  console.log('Safe address:', address)
  
  // Check balances
  const nativeBalance = await account.getBalance()
  console.log('Native balance:', nativeBalance, 'wei')
  
  const paymasterBalance = await account.getPaymasterTokenBalance()
  console.log('Paymaster token balance:', paymasterBalance, 'units')
  
  return { wallet, account, address, paymasterBalance }
}
```

### Complete Multisig Transaction Flow

```javascript
async function multisigTransactionFlow() {
  // Get fee quote
  const quote = await aliceAccount.quoteSendTransaction({
    to: '0xRecipient...',
    value: '1000000000000000000', // 1 ETH
    data: '0x'
  })
  console.log('Estimated fee:', quote.fee)
  
  // Alice proposes a transaction
  const proposal = await aliceAccount.propose({
    to: '0xRecipient...',
    value: '1000000000000000000',
    data: '0x'
  })
  
  console.log('Proposal created:', proposal.proposalId)
  console.log('Confirmations:', proposal.confirmations, '/', proposal.threshold)
  
  // Bob approves
  const approval = await bobAccount.approve(proposal.proposalId)
  console.log('Bob approved')
  console.log('Confirmations:', approval.confirmations, '/', approval.threshold)
  
  // Check if ready to execute
  const isReady = await aliceAccount.isReadyToExecute(proposal.proposalId)
  
  if (isReady) {
    // Execute the transaction
    const result = await aliceAccount.execute(proposal.proposalId)
    console.log('Transaction executed:', result.hash)
  }
}
```

### Complete Message Signing Flow

```javascript
async function messageSigningFlow() {
  const message = 'Hello from Safe!'
  
  // Alice proposes the message
  const result = await aliceAccount.proposeMessage(message)
  console.log('Alice signed:', result.signature.slice(0, 20) + '...')
  console.log('Message hash:', result.messageHash)
  console.log('Confirmations:', result.confirmations, '/', result.threshold)
  
  // Bob approves the message
  const approval = await bobAccount.approveMessage(result.messageHash)
  console.log('Bob signed:', approval.signature.slice(0, 20) + '...')
  console.log('Confirmations:', approval.confirmations, '/', approval.threshold)
  
  // Verify combined signature
  if (approval.combinedSignature) {
    const isValid = await aliceAccount.verify(
      message,
      approval.combinedSignature
    )
    console.log('Signature valid:', isValid)
  }
}
```

---

### Need Help?

{% include "../../../.gitbook/includes/support-cards.md" %}