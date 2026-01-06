# Usage

Installation, quick start, and usage examples for @tetherto/wdk-protocol-multisig-safe

## Installation

To install the `@tetherto/wdk-protocol-multisig-safe` package, follow these instructions:

```bash
npm install @tetherto/wdk-protocol-multisig-safe
```

## Supported Paymaster Tokens

For a complete list of supported ERC-20 tokens that can be used to pay gas fees on each network, see:
[Pimlico ERC-20 Paymaster Supported Tokens](https://docs.pimlico.io/references/paymaster/erc20-paymaster/supported-tokens)

## Quick Start

### Importing from `@tetherto/wdk-protocol-multisig-safe`

1. WalletManagerEvmMultisigSafe: Main class for managing multisig Safe wallets
2. WalletAccountEvmMultisigSafe: Use this for full access accounts
3. WalletAccountReadOnlyEvmMultisigSafe: Use this for read-only accounts

### Creating a New Multisig Wallet

```javascript
import WalletManagerEvmMultisigSafe, { 
  WalletAccountEvmMultisigSafe, 
  WalletAccountReadOnlyEvmMultisigSafe 
} from '@tetherto/wdk-protocol-multisig-safe'

// Use a BIP-39 seed phrase (replace with your own secure phrase)
const seedPhrase = 'your twelve word seed phrase here' // Replace with actual seed generation

// Create wallet manager with multisig Safe configuration
const wallet = new WalletManagerEvmMultisigSafe(seedPhrase, {
  chainId: 11155111n, // Sepolia testnet
  provider: 'https://sepolia.infura.io/v3/YOUR_KEY',
  bundlerUrl: 'https://api.pimlico.io/v2/sepolia/rpc?apikey=YOUR_KEY',
  paymasterOptions: {
    paymasterUrl: 'https://api.pimlico.io/v2/sepolia/rpc?apikey=YOUR_KEY',
    paymasterTokenAddress: '0x...' // USDT or other supported token
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

### Discovering Existing Safes

```javascript
import { WalletAccountReadOnlyEvmMultisigSafe } from '@tetherto/wdk-protocol-multisig-safe'

// Discover Safes where your EOA is an owner
const ownerAddress = '0xYourEOA...'
const existingSafes = await WalletAccountReadOnlyEvmMultisigSafe.getSafesByOwner(
  ownerAddress,
  { chainId: 11155111n }
)

console.log('Found Safes:', existingSafes)
// Returns: ['0xSafe1...', '0xSafe2...', ...]

// Get info about a specific Safe
const safeInfo = await WalletAccountReadOnlyEvmMultisigSafe.getSafeInfo(
  existingSafes[0],
  { chainId: 11155111n }
)

console.log('Owners:', safeInfo.owners)
console.log('Threshold:', safeInfo.threshold)
console.log('Version:', safeInfo.version)
```

### Importing an Existing Safe

```javascript
import WalletManagerEvmMultisigSafe from '@tetherto/wdk-protocol-multisig-safe'

// Import an existing Safe by address using ExistingSafeOptions
const wallet = new WalletManagerEvmMultisigSafe(seedPhrase, {
  chainId: 11155111n,
  provider: 'https://sepolia.infura.io/v3/YOUR_KEY',
  bundlerUrl: 'https://api.pimlico.io/v2/sepolia/rpc?apikey=YOUR_KEY',
  paymasterOptions: {
    paymasterUrl: 'https://api.pimlico.io/v2/sepolia/rpc?apikey=YOUR_KEY',
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
import WalletManagerEvmMultisigSafe from '@tetherto/wdk-protocol-multisig-safe'

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
import WalletManagerEvmMultisigSafe from '@tetherto/wdk-protocol-multisig-safe'

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
import { WalletAccountReadOnlyEvmMultisigSafe } from '@tetherto/wdk-protocol-multisig-safe'

// Create a read-only account
const readOnlyAccount = new WalletAccountReadOnlyEvmMultisigSafe(null, {
  chainId: 11155111n,
  provider: 'https://sepolia.infura.io/v3/YOUR_KEY',
  bundlerUrl: 'https://api.pimlico.io/v2/sepolia/rpc?apikey=YOUR_KEY',
  paymasterOptions: {
    paymasterUrl: 'https://api.pimlico.io/v2/sepolia/rpc?apikey=YOUR_KEY',
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
// Propose a transaction (first signer)
const quote = await account.quoteSendTransaction({
  to: '0xRecipientAddress...',
  value: '1000000000000000000', // 1 ETH in wei
  data: '0x'
})

console.log('Estimated fee:', quote.fee)

const proposal = await account.propose({
  to: '0xRecipientAddress...',
  value: '1000000000000000000',
  data: '0x'
}, {
  amountToApprove: quote.fee * 150n / 100n // 50% buffer
})

console.log('Safe operation hash:', proposal.safeOperationHash)
console.log('Confirmations:', proposal.confirmations)
console.log('Threshold:', proposal.threshold)
```

### Approve a Transaction

```javascript
// Second signer approves the transaction
const bobAccount = new WalletAccountEvmMultisigSafe(bobSeedPhrase, "0'/0/0", config)

const approval = await bobAccount.approve(proposal.safeOperationHash)
console.log('Transaction approved by Bob')
console.log('Confirmations:', approval.confirmations, '/', approval.threshold)
```

### Execute a Transaction

```javascript
// Check if ready to execute
const isReady = await account.isReadyToExecute(proposal.safeOperationHash)
console.log('Ready to execute:', isReady)

// Execute when threshold is met
if (isReady) {
  const result = await account.execute(proposal.safeOperationHash)
  console.log('UserOp hash:', result.hash)

  // Get on-chain transaction hash
  const txHash = await account.getTransactionHashByUserOpHash(result.hash)
  console.log('Transaction hash:', txHash)
}
```

### Get Pending Transactions

```javascript
// Get all pending transactions for the Safe
const pending = await account.getPendingTransactions()
const threshold = await account.getThreshold()

for (const op of pending.results) {
  console.log('Hash:', op.safeOperationHash)
  console.log('Confirmations:', op.confirmations?.length || 0, '/', threshold)
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
  paymasterOptions: {
    paymasterUrl: 'https://api.pimlico.io/v2/sepolia/rpc?apikey=YOUR_KEY',
    paymasterTokenAddress: '0x...' // USDT or other supported token
  },
  options: {
    owners: ['0xAlice...', '0xBob...'],
    threshold: 2
  }
})

// Propose with token approval for gas
const quote = await account.quoteSendTransaction(tx)
const proposal = await account.propose(tx, {
  amountToApprove: quote.fee * 150n / 100n
})
```

### Sponsored (Gasless) Mode

Use a sponsored paymaster for completely gasless transactions:

```javascript
const wallet = new WalletManagerEvmMultisigSafe(seedPhrase, {
  chainId: 11155111n,
  provider: 'https://sepolia.infura.io/v3/YOUR_KEY',
  bundlerUrl: 'https://api.pimlico.io/v2/sepolia/rpc?apikey=YOUR_KEY',
  paymasterOptions: {
    paymasterUrl: 'https://api.pimlico.io/v2/sepolia/rpc?apikey=YOUR_KEY',
    paymasterAddress: '0x...', // Needed for ERC-20 override
    isSponsored: true,
    sponsorshipPolicyId: 'sp_my_policy' // Optional
  },
  options: {
    owners: ['0xAlice...', '0xBob...'],
    threshold: 2
  }
})

// No amountToApprove needed - sponsor pays gas!
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
const proposal = await account.addOwner('0xNewOwnerAddress...', null, {
  amountToApprove: fee * 200n / 100n
})

// Other owners approve
await bobAccount.approve(proposal.safeOperationHash)

// Execute when threshold is met
await account.execute(proposal.safeOperationHash)
```

### Remove an Owner

```javascript
// Propose removing an owner
const proposal = await account.removeOwner('0xOwnerToRemove...', newThreshold, {
  amountToApprove: fee * 200n / 100n
})

// Other owners approve and execute
await bobAccount.approve(proposal.safeOperationHash)
await account.execute(proposal.safeOperationHash)
```

### Swap an Owner

```javascript
// Propose swapping an owner
const proposal = await account.swapOwner('0xOldOwner...', '0xNewOwner...', {
  amountToApprove: fee * 200n / 100n
})

// Other owners approve and execute
await bobAccount.approve(proposal.safeOperationHash)
await account.execute(proposal.safeOperationHash)
```

### Change Threshold

```javascript
// Propose changing the threshold
const proposal = await account.changeThreshold(newThreshold, {
  amountToApprove: fee * 200n / 100n
})

// Other owners approve and execute
await bobAccount.approve(proposal.safeOperationHash)
await account.execute(proposal.safeOperationHash)
```

### Batch Update Owners

```javascript
// Propose batch updating owners and threshold
const proposal = await account.updateOwners(
  ['0xOwner1...', '0xOwner2...', '0xOwner3...'],
  2, // new threshold
  { amountToApprove: fee * 300n / 100n }
)

// Other owners approve and execute
await bobAccount.approve(proposal.safeOperationHash)
await account.execute(proposal.safeOperationHash)
```

## Message Signing

### Sign a Message (Propose)

```javascript
// Alice signs (proposes) a message
const result = await alice.sign('Hello from Safe!')

console.log('Alice signature:', result.signature)
console.log('Message hash:', result.safeMessage.messageHash)
console.log('Confirmations:', result.safeMessage.confirmations.length)
```

### Sign a Message (Approve)

```javascript
// Bob signs (approves) the same message
const approval = await bob.sign('Hello from Safe!', { isApproval: true })

console.log('Bob signature:', approval.signature)
console.log('Confirmations:', approval.safeMessage.confirmations.length)

// Check if fully signed
if (approval.safeMessage.preparedSignature) {
  console.log('Combined signature:', approval.safeMessage.preparedSignature)
}
```

### Verify a Signature (EIP-1271)

```javascript
// Verify the combined signature on-chain
if (approval.safeMessage.preparedSignature) {
  const isValid = await alice.verify(
    'Hello from Safe!',
    approval.safeMessage.preparedSignature
  )
  console.log('Signature valid:', isValid)
}
```

### Get Message Status

```javascript
// Get message by hash
const message = await account.getMessage(messageHash)

console.log('Message:', message.message)
console.log('Proposed by:', message.proposedBy)
console.log('Confirmations:', message.confirmations.length)
console.log('Combined signature:', message.preparedSignature)
```

### Get Pending Messages

```javascript
// Get all pending messages
const pending = await account.getPendingMessages()

for (const msg of pending.results) {
  console.log('Hash:', msg.messageHash)
  console.log('Message:', msg.message)
  console.log('Confirmations:', msg.confirmations.length)
}
```

## Transaction Tracking

### Get Transaction History

```javascript
// Get transaction history for the Safe
const history = await account.getTransactionHistory()

for (const tx of history.results) {
  console.log('Hash:', tx.transactionHash)
  console.log('Status:', tx.isExecuted ? 'Executed' : 'Pending')
}
```

### Get On-Chain Transaction Hash

```javascript
// After executing, get the on-chain transaction hash
const result = await account.execute(safeOperationHash)
console.log('UserOp hash:', result.hash)

// Wait for confirmation and get tx hash
const txHash = await account.getTransactionHashByUserOpHash(result.hash)
console.log('Transaction hash:', txHash)
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
import WalletManagerEvmMultisigSafe from '@tetherto/wdk-protocol-multisig-safe'

async function setupMultisigWallet() {
  const seedPhrase = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
  
  // Create multisig wallet manager
  const wallet = new WalletManagerEvmMultisigSafe(seedPhrase, {
    chainId: 11155111n, // Sepolia testnet
    provider: 'https://sepolia.infura.io/v3/YOUR_KEY',
    bundlerUrl: 'https://api.pimlico.io/v2/sepolia/rpc?apikey=YOUR_KEY',
    paymasterOptions: {
      paymasterUrl: 'https://api.pimlico.io/v2/sepolia/rpc?apikey=YOUR_KEY',
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
  
  // Alice proposes a transaction
  const proposal = await aliceAccount.propose({
    to: '0xRecipient...',
    value: '1000000000000000000',
    data: '0x'
  }, {
    amountToApprove: quote.fee * 150n / 100n
  })
  
  console.log('Proposal created:', proposal.safeOperationHash)
  console.log('Confirmations:', proposal.confirmations, '/', proposal.threshold)
  
  // Bob approves
  const approval = await bobAccount.approve(proposal.safeOperationHash)
  console.log('Bob approved')
  console.log('Confirmations:', approval.confirmations, '/', approval.threshold)
  
  // Check if ready to execute
  const isReady = await aliceAccount.isReadyToExecute(proposal.safeOperationHash)
  
  if (isReady) {
    // Execute the transaction
    const result = await aliceAccount.execute(proposal.safeOperationHash)
    console.log('Transaction executed:', result.hash)
    
    // Get on-chain transaction hash
    const txHash = await aliceAccount.getTransactionHashByUserOpHash(result.hash)
    console.log('TX Hash:', txHash)
  }
}
```

### Complete Message Signing Flow

```javascript
async function messageSigningFlow() {
  const message = 'Hello from Safe!'
  
  // Alice signs (proposes)
  const result = await aliceAccount.sign(message)
  console.log('Alice signed:', result.signature.slice(0, 20) + '...')
  console.log('Message hash:', result.safeMessage.messageHash)
  
  // Bob signs (approves)
  const approval = await bobAccount.sign(message, { isApproval: true })
  console.log('Bob signed:', approval.signature.slice(0, 20) + '...')
  
  // Verify combined signature
  if (approval.safeMessage.preparedSignature) {
    const isValid = await aliceAccount.verify(
      message,
      approval.safeMessage.preparedSignature
    )
    console.log('Signature valid:', isValid)
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