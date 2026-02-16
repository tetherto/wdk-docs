# Configuration

Configuration options and settings for @tetherto/wdk-wallet-evm-multisig-safe

## Wallet Configuration

The WalletManagerEvmMultisigSafe requires a complete configuration object with required parameters:

```javascript
import WalletManagerEvmMultisigSafe from '@tetherto/wdk-wallet-evm-multisig-safe'

const config = {
  // Required
  chainId: 11155111n,
  provider: 'https://sepolia.infura.io/v3/YOUR_KEY',
  bundlerUrl: 'https://api.pimlico.io/v2/sepolia/rpc?apikey=YOUR_KEY',
  
  // Paymaster configuration
  paymasterOptions: {
    paymasterUrl: 'https://api.pimlico.io/v2/sepolia/rpc?apikey=YOUR_KEY',
    paymasterAddress: '0x...',           // Optional: paymaster contract address
    paymasterTokenAddress: '0x...',      // ERC-20 token for gas (e.g., USDT)
    isSponsored: false,                  // Optional: true for gasless mode
    sponsorshipPolicyId: 'sp_my_policy'  // Optional: sponsorship policy ID
  },
  
  // Safe Transaction Service (pick one, not both)
  safeApiKey: 'eyJhb...',                        // API key (backend/testing only)
  // txServiceUrl: 'https://your-proxy.com/safe', // OR proxy URL (recommended for frontend)

  // Safe options (pick one, not both)
  options: {
    owners: ['0xAliceEOA...', '0xBobEOA...'],    // Create new Safe
    threshold: 2
  },
  // options: { safeAddress: '0x...' }            // OR import existing Safe
  
  // Optional
  transferMaxFee: 1000000,               // Max fee in paymaster token units
  entryPointAddress: '0x...',            // Custom EntryPoint contract address
  safeModulesVersion: '0.2.0'           // Safe modules version (default: '0.2.0')
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
} from '@tetherto/wdk-wallet-evm-multisig-safe'

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
  paymasterAddress: '0x...',        // Required: paymaster contract address
  paymasterTokenAddress: '0x...'    // Required: USDT or other supported token
}
```

#### Sponsored Paymaster Mode

Use a sponsored paymaster for gasless transactions:

```javascript
paymasterOptions: {
  paymasterUrl: 'https://api.pimlico.io/v2/sepolia/rpc?apikey=YOUR_KEY',
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

### Safe Transaction Service

Configure how the package communicates with the Safe Transaction Service for proposal coordination.

```javascript
// Option 1: Use Safe's hosted service with API key (simple, good for testing/backend)
const config = {
  safeApiKey: 'eyJhb...',
  // ...
}

// Option 2: Use a custom/proxy Transaction Service URL (recommended for frontend)
const config = {
  txServiceUrl: 'https://your-backend.com/safe-proxy',
  // ...
}
```

Get your API key from the [Safe Developer Dashboard](https://developer.safe.global).

### Transfer Max Fee

The `transferMaxFee` option specifies the maximum fee amount for transfer operations in paymaster token units.

```javascript
// Maximum fee of 1 USDT (6 decimals)
transferMaxFee: 1000000

// Maximum fee of 0.1 USDT
transferMaxFee: 100000
```

## Security Notes

### Safe API Key

Do not expose `safeApiKey` in client-side code. Use `txServiceUrl` pointing to a backend proxy that injects the key server-side. Get your API key from the [Safe Developer Dashboard](https://developer.safe.global).

### Sponsorship Policy

The `sponsorshipPolicyId` is visible to the client. Without restrictions, anyone could use your policy to sponsor their own transactions. Configure policy rules to restrict by sender address, contract, gas limit, or time window.

See Pimlico's guides:
- [Sponsorship Policies](https://docs.pimlico.io/guides/how-to/sponsorship-policies)
- [Webhook Verification](https://docs.pimlico.io/guides/how-to/sponsorship-policies/webhook)

---

### Need Help?

{% include "../../../.gitbook/includes/support-cards.md" %}