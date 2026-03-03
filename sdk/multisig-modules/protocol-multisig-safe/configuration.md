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

  // Paymaster configuration (flat, not nested)
  paymasterUrl: 'https://api.pimlico.io/v2/sepolia/rpc?apikey=YOUR_KEY',
  paymasterAddress: '0x...',           // Optional: paymaster contract address
  paymasterTokenAddress: '0x...',      // ERC-20 token for gas (e.g., USDT)

  // Safe Transaction Service (pick one, not both)
  safeApiKey: 'eyJhb...',                        // API key (backend/testing only)
  // txServiceUrl: 'https://your-proxy.com/safe', // OR proxy URL (recommended for frontend)

  // Safe options (pick one, not both)
  safeOptions: {
    owners: ['0xAliceEOA...', '0xBobEOA...'],    // Create new Safe
    threshold: 2
  },
  // safeOptions: { safeAddress: '0x...' }        // OR import existing Safe

  // Optional
  transferMaxFee: 1000000,               // Max fee in paymaster token units
  amountToApprove: 1500000,              // Amount to approve for paymaster
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

// Read-only account (pass null as signerAddress)
const readOnlyAccount = new WalletAccountReadOnlyEvmMultisigSafe(null, {
  chainId: 11155111n,
  provider: 'https://sepolia.infura.io/v3/YOUR_KEY',
  bundlerUrl: 'https://api.pimlico.io/v2/sepolia/rpc?apikey=YOUR_KEY',
  paymasterUrl: 'https://api.pimlico.io/v2/sepolia/rpc?apikey=YOUR_KEY',
  paymasterTokenAddress: '0x...',
  safeOptions: {
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
```

### Provider

The `provider` option specifies the RPC endpoint for blockchain communication.

```javascript
// Using RPC URL
provider: 'https://sepolia.infura.io/v3/YOUR_KEY'
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

### Gas Payment Modes

There are three mutually exclusive modes for paying transaction gas fees. These are configured as flat properties on the config object (not nested).

#### ERC-20 Paymaster Mode

Pay fees using ERC-20 tokens (e.g., USDT). The Safe must hold sufficient tokens.

```javascript
const config = {
  paymasterUrl: 'https://api.pimlico.io/v2/sepolia/rpc?apikey=YOUR_KEY',
  paymasterAddress: '0x...',        // Paymaster contract address
  paymasterTokenAddress: '0x...',   // USDT or other supported token
  // isSponsored and useNativeCoins are omitted or false
}
```

#### Sponsored Paymaster Mode

Use a sponsored paymaster for gasless transactions:

```javascript
const config = {
  paymasterUrl: 'https://api.pimlico.io/v2/sepolia/rpc?apikey=YOUR_KEY',
  isSponsored: true,
  sponsorshipPolicyId: 'sp_my_policy', // Optional: sponsorship policy ID
}
```

#### Native Coins Mode

Pay gas fees using native coins (e.g., ETH) directly from the Safe. No paymaster needed.

```javascript
const config = {
  useNativeCoins: true,
}
```

### Safe Options

The `safeOptions` object specifies how to create or import a Safe.

#### Creating a New Safe (PredictedSafeOptions)

```javascript
safeOptions: {
  owners: ['0xAliceEOA...', '0xBobEOA...', '0xCharlieEOA...'],
  threshold: 2, // 2-of-3 multisig
  saltNonce: '0x...', // Optional: for deterministic address
  safeVersion: '1.4.1', // Optional: Safe contract version
  deploymentType: 'canonical' // Optional: deployment type
}
```

#### Importing an Existing Safe (ExistingSafeOptions)

```javascript
safeOptions: {
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

The `transferMaxFee` option specifies the maximum fee amount for transfer operations in paymaster token units. Only applies to ERC-20 paymaster and native coins modes.

```javascript
// Maximum fee of 1 USDT (6 decimals)
transferMaxFee: 1000000

// Maximum fee of 0.1 USDT
transferMaxFee: 100000
```

### Amount to Approve

The `amountToApprove` option specifies how many tokens to approve for the paymaster when using ERC-20 paymaster mode.

```javascript
// Approve 1.5 USDT for paymaster
amountToApprove: 1500000
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
