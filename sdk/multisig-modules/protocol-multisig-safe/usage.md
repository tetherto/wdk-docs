# Usage

Installation, quick start, and usage examples for @tetherto/wdk-protocol-multisig-safe

## Installation

To install the `@tetherto/wdk-protocol-multisig-safe` package, follow these instructions:

```bash
npm install @tetherto/wdk-protocol-multisig-safe
```

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
    paymasterTokenAddress: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238' // USDC on Sepolia
  },
  safeAccountConfig: {
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
import WalletManagerEvmMultisigSafe from '@tetherto/wdk-protocol-multisig-safe'

// Create wallet manager without safeAccountConfig to discover existing Safes
const wallet = new WalletManagerEvmMultisigSafe(seedPhrase, {
  chainId: 11155111n,
  provider: 'https://sepolia.infura.io/v3/YOUR_KEY',
  bundlerUrl: 'https://api.pimlico.io/v2/sepolia/rpc?apikey=YOUR_KEY',
  paymasterOptions: {
    paymasterUrl: 'https://api.pimlico.io/v2/sepolia/rpc?apikey=YOUR_KEY',
    paymasterTokenAddress: '0x...'
  }
})

// Discover Safes where your EOA is an owner
const existingSafes = await wallet.discoverExistingSafes()
console.log('Found Safes:', existingSafes)
// Returns: ['0xSafe1...', '0xSafe2...', ...]
```

### Importing an Existing Safe

```javascript
import WalletManagerEvmMultisigSafe from '@tetherto/wdk-protocol-multisig-safe'

// Import an existing Safe by address
const wallet = new WalletManagerEvmMultisigSafe(seedPhrase, {
  chainId: 11155111n,
  provider: 'https://sepolia.infura.io/v3/YOUR_KEY',
  bundlerUrl: 'https://api.pimlico.io/v2/sepolia/rpc?apikey=YOUR_KEY',
  paymasterOptions: {
    paymasterUrl: 'https://api.pimlico.io/v2/sepolia/rpc?apikey=YOUR_KEY',
    paymasterTokenAddress: '0x...'
  },
  safeAccountConfig: {
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

// Check if Safe is deployed
const isDeployed = await account.isDeployed()
console.log('Is deployed:', isDeployed)

// Deploy the Safe (if not already deployed)
if (!isDeployed) {
  const deployResult = await account.deploy()
  console.log('Deploy transaction hash:', deployResult.hash)
}
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
const tokenContract = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238' // USDC contract address
const tokenBalance = await account.getTokenBalance(tokenContract)
console.log('USDC balance:', tokenBalance)

// Get paymaster token balance (for paying fees)
const paymasterBalance = await account.getPaymasterTokenBalance()
console.log('Paymaster token balance:', paymasterBalance, 'units')
```

#### Read-Only Account

For addresses where you don't have the seed phrase:

```javascript
import { WalletAccountReadOnlyEvmMultisigSafe } from '@tetherto/wdk-protocol-multisig-safe'

// Create a read-only account
const readOnlyAccount = new WalletAccountReadOnlyEvmMultisigSafe('0xSafeAddress...', {
  chainId: 11155111n,
  provider: 'https://sepolia.infura.io/v3/YOUR_KEY',
  bundlerUrl: 'https://api.pimlico.io/v2/sepolia/rpc?apikey=YOUR_KEY',
  paymasterOptions: {
    paymasterUrl: 'https://api.pimlico.io/v2/sepolia/rpc?apikey=YOUR_KEY',
    paymasterTokenAddress: '0x...'
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
const proposal = await account.propose({
  to: '0xRecipientAddress...',
  value: '1000000000000000000', // 1 ETH in wei
  data: '0x' // Optional transaction data
})

console.log('Safe operation hash:', proposal.safeOperationHash)
console.log('Confirmations:', proposal.confirmations)
console.log('Threshold:', proposal.threshold)
```

### Approve a Transaction

```javascript
// Second signer approves the transaction
const bobAccount = new WalletAccountEvmMultisigSafe(bobSeedPhrase, "0'/0/0", config)

await bobAccount.approve(proposal.safeOperationHash)
console.log('Transaction approved by Bob')
```

### Execute a Transaction

```javascript
// Execute when threshold is met
const result = await account.execute(proposal.safeOperationHash)

console.log('Transaction hash:', result.hash)
console.log('Fee paid:', result.fee, 'paymaster token units')
```

### Get Pending Transactions

```javascript
// Get all pending transactions for the Safe
const pendingTxs = await account.getPendingTransactions()

for (const tx of pendingTxs) {
  console.log('Hash:', tx.safeOperationHash)
  console.log('Confirmations:', tx.confirmations.length)
  console.log('Threshold:', tx.threshold)
}
```

## Paymaster Modes

### ERC-20 Paymaster Mode (Default)

Pay transaction fees using ERC-20 tokens (e.g., USDC):

```javascript
const wallet = new WalletManagerEvmMultisigSafe(seedPhrase, {
  chainId: 11155111n,
  provider: 'https://sepolia.infura.io/v3/YOUR_KEY',
  bundlerUrl: 'https://api.pimlico.io/v2/sepolia/rpc?apikey=YOUR_KEY',
  paymasterOptions: {
    paymasterUrl: 'https://api.pimlico.io/v2/sepolia/rpc?apikey=YOUR_KEY',
    paymasterTokenAddress: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238' // USDC
  },
  safeAccountConfig: {
    owners: ['0xAlice...', '0xBob...'],
    threshold: 2
  }
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
    sponsoredPaymaster: true // Enable sponsored mode
  },
  safeAccountConfig: {
    owners: ['0xAlice...', '0xBob...'],
    threshold: 2
  }
})
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
  sponsoredPaymaster: true // Override to sponsored mode
})

// Override to different ERC-20 token
const result2 = await account.sendTransaction({
  to: '0x...',
  value: '1000000000000000000',
  data: '0x'
}, {
  paymasterTokenAddress: '0xDifferentToken...' // Use different token
})
```

## Owner Management

### Add an Owner

```javascript
// Propose adding a new owner
const proposal = await account.proposeAddOwner({
  owner: '0xNewOwnerAddress...',
  threshold: 2 // Optional: update threshold
})

// Other owners approve
await bobAccount.approve(proposal.safeOperationHash)

// Execute when threshold is met
await account.execute(proposal.safeOperationHash)
```

### Remove an Owner

```javascript
// Propose removing an owner
const proposal = await account.proposeRemoveOwner({
  owner: '0xOwnerToRemove...',
  threshold: 1 // Required: new threshold after removal
})

// Other owners approve and execute
await bobAccount.approve(proposal.safeOperationHash)
await account.execute(proposal.safeOperationHash)
```

### Swap an Owner

```javascript
// Propose swapping an owner
const proposal = await account.proposeSwapOwner({
  oldOwner: '0xOldOwnerAddress...',
  newOwner: '0xNewOwnerAddress...'
})

// Other owners approve and execute
await bobAccount.approve(proposal.safeOperationHash)
await account.execute(proposal.safeOperationHash)
```

### Change Threshold

```javascript
// Propose changing the threshold
const proposal = await account.proposeChangeThreshold({
  threshold: 3 // New threshold value
})

// Other owners approve and execute
await bobAccount.approve(proposal.safeOperationHash)
await account.execute(proposal.safeOperationHash)
```

## Message Signing

### Sign a Message

```javascript
// Sign a message with the multisig Safe
const message = 'Hello, Safe!'
const signature = await account.signMessage(message)

console.log('Message signature:', signature)
```

### Verify a Message

```javascript
// Verify a message signature
const isValid = await account.verifyMessage(message, signature)
console.log('Signature valid:', isValid)
```

## Transaction Tracking

### Get Transaction History

```javascript
// Get transaction history for the Safe
const history = await account.getTransactionHistory()

for (const tx of history) {
  console.log('Hash:', tx.hash)
  console.log('Status:', tx.status)
  console.log('Timestamp:', tx.timestamp)
}
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
      paymasterTokenAddress: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238' // USDC
    },
    safeAccountConfig: {
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
  console.log('Paymaster token balance:', paymasterBalance, 'USDC units')
  
  return { wallet, account, address, paymasterBalance }
}
```

### Complete Multisig Transaction Flow

```javascript
async function multisigTransactionFlow() {
  // Alice proposes a transaction
  const proposal = await aliceAccount.propose({
    to: '0xRecipient...',
    value: '1000000000000000000', // 1 ETH
    data: '0x'
  })
  
  console.log('Proposal created:', proposal.safeOperationHash)
  console.log('Current confirmations:', proposal.confirmations.length)
  console.log('Required threshold:', proposal.threshold)
  
  // Bob approves
  await bobAccount.approve(proposal.safeOperationHash)
  console.log('Bob approved')
  
  // Check if ready to execute
  const pendingTxs = await aliceAccount.getPendingTransactions()
  const tx = pendingTxs.find(t => t.safeOperationHash === proposal.safeOperationHash)
  
  if (tx.confirmations.length >= tx.threshold) {
    // Execute the transaction
    const result = await aliceAccount.execute(proposal.safeOperationHash)
    console.log('Transaction executed:', result.hash)
    console.log('Fee paid:', result.fee)
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