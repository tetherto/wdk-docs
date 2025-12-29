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
    paymasterTokenAddress: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238' // USDC
  },
  
  // Safe configuration
  safeAccountConfig: {
    owners: ['0xAliceEOA...', '0xBobEOA...'],
    threshold: 2
  },
  
  // Optional parameters
  transferMaxFee: 100000000000000
}

const wallet = new WalletManagerEvmMultisigSafe(seedPhrase, config)
```

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

// Read-only account (transferMaxFee not needed)
const readOnlyAccount = new WalletAccountReadOnlyEvmMultisigSafe(
  '0xSafeAddress...', // Safe contract address
  {
    chainId: 11155111n,
    provider: 'https://sepolia.infura.io/v3/YOUR_KEY',
    bundlerUrl: 'https://api.pimlico.io/v2/sepolia/rpc?apikey=YOUR_KEY',
    paymasterOptions: {
      paymasterUrl: 'https://api.pimlico.io/v2/sepolia/rpc?apikey=YOUR_KEY',
      paymasterTokenAddress: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'
    }
    // Note: safeAccountConfig not needed for read-only, address is provided directly
  }
)
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

Pay fees using ERC-20 tokens:

```javascript
paymasterOptions: {
  paymasterUrl: 'https://api.pimlico.io/v2/sepolia/rpc?apikey=YOUR_KEY',
  paymasterTokenAddress: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238' // USDC
}
```

#### Sponsored Paymaster Mode

Use a sponsored paymaster for gasless transactions:

```javascript
paymasterOptions: {
  paymasterUrl: 'https://api.pimlico.io/v2/sepolia/rpc?apikey=YOUR_KEY',
  sponsoredPaymaster: true
}
```

### Safe Account Configuration

The `safeAccountConfig` object specifies how to create or import a Safe.

#### Creating a New Safe

```javascript
safeAccountConfig: {
  owners: ['0xAliceEOA...', '0xBobEOA...', '0xCharlieEOA...'],
  threshold: 2 // 2-of-3 multisig
}
```

#### Importing an Existing Safe

```javascript
safeAccountConfig: {
  safeAddress: '0xExistingSafeAddress...'
}
```

#### Discovering Existing Safes

Omit `safeAccountConfig` to discover Safes:

```javascript
const config = {
  chainId: 11155111n,
  provider: 'https://sepolia.infura.io/v3/YOUR_KEY',
  bundlerUrl: 'https://api.pimlico.io/v2/sepolia/rpc?apikey=YOUR_KEY',
  paymasterOptions: {
    paymasterUrl: 'https://api.pimlico.io/v2/sepolia/rpc?apikey=YOUR_KEY',
    paymasterTokenAddress: '0x...'
  }
  // No safeAccountConfig - use wallet.discoverExistingSafes()
}
```

### Transfer Max Fee

The `transferMaxFee` option specifies the maximum fee amount for transfer operations in paymaster token units.

```javascript
// Maximum fee of 1 USDC (6 decimals)
transferMaxFee: 1000000

// Maximum fee of 0.1 USDC
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
    paymasterTokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' // USDC
  },
  safeAccountConfig: {
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
    paymasterTokenAddress: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359' // USDC
  },
  safeAccountConfig: {
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
    paymasterTokenAddress: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831' // USDC
  },
  safeAccountConfig: {
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
    paymasterTokenAddress: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238' // USDC testnet
  },
  safeAccountConfig: {
    owners: ['0xOwner1...', '0xOwner2...'],
    threshold: 2
  },
  transferMaxFee: 1000000 // 1 USDC max fee
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