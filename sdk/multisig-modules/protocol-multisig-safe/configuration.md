# Configuration

Configuration options and settings for @tetherto/wdk-protocol-multisig-safe

## Wallet Configuration

The WalletManagerEvmMultisigSafe requires a complete configuration object with required parameters:

```javascript
import WalletManagerEvmMultisigSafe from '@tetherto/wdk-protocol-multisig-safe'

const config = {
  // Required parameters
  chainId: 11155111n,
  provider: 'https://sepolia.infura.io/v3/YOUR_KEY',
  bundlerUrl: 'https://api.pimlico.io/v2/sepolia/rpc?apikey=YOUR_KEY',
  
  // Paymaster configuration
  paymasterOptions: {
    paymasterUrl: 'https://api.pimlico.io/v2/sepolia/rpc?apikey=YOUR_KEY',
    paymasterTokenAddress: '0x...' // USDT or other supported token
  },
  
  // Safe configuration - for creating new Safe
  options: {
    owners: ['0xAliceEOA...', '0xBobEOA...'],
    threshold: 2
  },
  
  // Optional parameters
  transferMaxFee: 100000000000000
}

const wallet = new WalletManagerEvmMultisigSafe(seedPhrase, config)
```

## Supported Paymaster Tokens

For a complete list of supported ERC-20 tokens that can be used to pay gas fees on each network, see:
[Pimlico ERC-20 Paymaster Supported Tokens](https://docs.pimlico.io/references/paymaster/erc20-paymaster/supported-tokens)

## Account Configuration

Both WalletAccountEvmMultisigSafe and WalletAccountReadOnlyEvmMultisigSafe use the same configuration structure:

```javascript
import { 
  WalletAccountEvmMultisigSafe, 
  WalletAccountReadOnlyEvmMultisigSafe 
} from '@tetherto/wdk-protocol-multisig-safe'

// Full access account
const account = new WalletAccountEvmMultisigSafe(
  seedPhrase,
  "0'/0/0", // BIP-44 derivation path
  config // Same config as wallet manager
)

// Read-only account
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
```

## Configuration Options

### Chain ID

The `chainId` option specifies the blockchain network ID. Must be a BigInt.

```javascript
// Ethereum Mainnet
chainId: 1n

// Sepolia Testnet
chainId: 11155111n

// Polygon Mainnet
chainId: 137n

// Arbitrum One
chainId: 42161n
```

### Provider

The `provider` option specifies the RPC endpoint for blockchain communication.

```javascript
// Using RPC URL
const config = {
  provider: 'https://sepolia.infura.io/v3/YOUR_KEY'
}

// Using browser provider (MetaMask)
const config = {
  provider: window.ethereum
}

// Using custom ethers provider
import { JsonRpcProvider } from 'ethers'
const config = {
  provider: new JsonRpcProvider('https://sepolia.infura.io/v3/YOUR_KEY')
}
```

### Bundler URL

The `bundlerUrl` option specifies the URL of the ERC-4337 bundler service that handles UserOperation bundling and submission to the mempool. Required for transaction processing.

```javascript
// Pimlico bundler
bundlerUrl: 'https://api.pimlico.io/v2/sepolia/rpc?apikey=YOUR_KEY'

// Alchemy bundler
bundlerUrl: 'https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY'

// Stackup bundler
bundlerUrl: 'https://api.stackup.sh/v1/node/YOUR_KEY'
```

### Paymaster Options

The `paymasterOptions` object configures how transaction fees are paid.

#### ERC-20 Paymaster Mode

Pay fees using ERC-20 tokens (e.g., USDT):

```javascript
paymasterOptions: {
  paymasterUrl: 'https://api.pimlico.io/v2/sepolia/rpc?apikey=YOUR_KEY',
  paymasterAddress: '0x...', // Optional: paymaster contract address
  paymasterTokenAddress: '0x...' // USDT or other supported token
}
```

#### Sponsored Paymaster Mode

Use a sponsored paymaster for gasless transactions:

```javascript
paymasterOptions: {
  paymasterUrl: 'https://api.pimlico.io/v2/sepolia/rpc?apikey=YOUR_KEY',
  paymasterAddress: '0x...', // Optional: needed for ERC-20 override
  isSponsored: true,
  sponsorshipPolicyId: 'sp_my_policy' // Optional: sponsorship policy ID
}
```

### Safe Options

The `options` object specifies how to create or import a Safe.

#### Creating a New Safe (PredictedSafeOptions)

```javascript
options: {
  owners: ['0xAliceEOA...', '0xBobEOA...', '0xCharlieEOA...'],
  threshold: 2, // 2-of-3 multisig
  saltNonce: '0x...', // Optional: for deterministic address
  safeVersion: '1.4.1', // Optional: Safe contract version
  deploymentType: 'canonical' // Optional: deployment type
}
```

#### Importing an Existing Safe (ExistingSafeOptions)

```javascript
options: {
  safeAddress: '0xExistingSafeAddress...'
}
```

#### Discovering Existing Safes

Use the static method to discover Safes before creating an account:

```javascript
const safes = await WalletAccountReadOnlyEvmMultisigSafe.getSafesByOwner(
  '0xOwnerEOA...',
  { chainId: 11155111n }
)

// Then import the Safe you want
const config = {
  // ... other config
  options: {
    safeAddress: safes[0]
  }
}
```

### Transfer Max Fee

The `transferMaxFee` option specifies the maximum fee amount for transfer operations in paymaster token units.

```javascript
// Maximum fee of 1 USDT (6 decimals)
transferMaxFee: 1000000

// Maximum fee of 0.1 USDT
transferMaxFee: 100000
```

## Network-Specific Configurations

### Ethereum Mainnet

```javascript
const ethereumMainnetConfig = {
  chainId: 1n,
  provider: 'https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY',
  bundlerUrl: 'https://api.pimlico.io/v2/ethereum/rpc?apikey=YOUR_KEY',
  paymasterOptions: {
    paymasterUrl: 'https://api.pimlico.io/v2/ethereum/rpc?apikey=YOUR_KEY',
    paymasterTokenAddress: '0x...' // See Pimlico docs for supported tokens
  },
  options: {
    owners: ['0xOwner1...', '0xOwner2...'],
    threshold: 2
  }
}
```

### Polygon Mainnet

```javascript
const polygonMainnetConfig = {
  chainId: 137n,
  provider: 'https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY',
  bundlerUrl: 'https://api.pimlico.io/v2/polygon/rpc?apikey=YOUR_KEY',
  paymasterOptions: {
    paymasterUrl: 'https://api.pimlico.io/v2/polygon/rpc?apikey=YOUR_KEY',
    paymasterTokenAddress: '0x...' // See Pimlico docs for supported tokens
  },
  options: {
    owners: ['0xOwner1...', '0xOwner2...'],
    threshold: 2
  }
}
```

### Arbitrum One

```javascript
const arbitrumOneConfig = {
  chainId: 42161n,
  provider: 'https://arb-mainnet.g.alchemy.com/v2/YOUR_KEY',
  bundlerUrl: 'https://api.pimlico.io/v2/arbitrum/rpc?apikey=YOUR_KEY',
  paymasterOptions: {
    paymasterUrl: 'https://api.pimlico.io/v2/arbitrum/rpc?apikey=YOUR_KEY',
    paymasterTokenAddress: '0x...' // See Pimlico docs for supported tokens
  },
  options: {
    owners: ['0xOwner1...', '0xOwner2...'],
    threshold: 2
  }
}
```

### Sepolia Testnet

```javascript
const sepoliaTestnetConfig = {
  chainId: 11155111n,
  provider: 'https://sepolia.infura.io/v3/YOUR_KEY',
  bundlerUrl: 'https://api.pimlico.io/v2/sepolia/rpc?apikey=YOUR_KEY',
  paymasterOptions: {
    paymasterUrl: 'https://api.pimlico.io/v2/sepolia/rpc?apikey=YOUR_KEY',
    paymasterTokenAddress: '0x...' // See Pimlico docs for supported tokens
  },
  options: {
    owners: ['0xOwner1...', '0xOwner2...'],
    threshold: 2
  },
  transferMaxFee: 1000000 // 1 USDT max fee (6 decimals)
}
```

For supported tokens on each network, see: [Pimlico ERC-20 Paymaster Supported Tokens](https://docs.pimlico.io/references/paymaster/erc20-paymaster/supported-tokens)

---

### Need Help?

{% include "../../../.gitbook/includes/support-cards.md" %}