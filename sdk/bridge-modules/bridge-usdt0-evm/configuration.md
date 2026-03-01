---
title: Bridge USD₮0 EVM Configuration
description: Configuration options and settings for @tetherto/wdk-protocol-bridge-usdt0-evm
icon: gear
layout:
  width: default
  title:
    visible: true
  description:
    visible: true
  tableOfContents:
    visible: true
  outline:
    visible: true
  pagination:
    visible: false
  metadata:
    visible: false
---

# Configuration

## Bridge Protocol Configuration

The `Usdt0ProtocolEvm` accepts a configuration object that defines how the bridge protocol works:

```javascript
import Usdt0ProtocolEvm from '@tetherto/wdk-protocol-bridge-usdt0-evm'
import { WalletAccountEvm } from '@tetherto/wdk-wallet-evm'

// Create wallet account first
const account = new WalletAccountEvm(seedPhrase, "0'/0/0", {
  provider: 'https://eth.drpc.org'
})

// Create bridge protocol with configuration
const bridgeProtocol = new Usdt0ProtocolEvm(account, {
  bridgeMaxFee: 1000000000000000n // Optional: Maximum bridge fee in wei
})
```

## Account Configuration

The bridge protocol uses the wallet account's configuration for blockchain access:

```javascript
import { WalletAccountEvm, WalletAccountReadOnlyEvm } from '@tetherto/wdk-wallet-evm'

// Full access account
const account = new WalletAccountEvm(
  seedPhrase,
  "0'/0/0", // BIP-44 derivation path
  {
    provider: 'https://eth.drpc.org',
    transferMaxFee: 100000000000000
  }
)

// Read-only account
const readOnlyAccount = new WalletAccountReadOnlyEvm(
  '0x...', // Ethereum address
  {
    provider: 'https://eth.drpc.org'
  }
)

// Create bridge protocol
const bridgeProtocol = new Usdt0ProtocolEvm(account, {
  bridgeMaxFee: 1000000000000000n
})
```

## Configuration Options

### Bridge Max Fee

The `bridgeMaxFee` option sets a maximum limit for total bridge costs to prevent unexpectedly high fees.

**Type:** `number | bigint` (optional)  
**Unit:** Wei (1 ETH = 1000000000000000000 Wei)

**Examples:**

```javascript
const config = {
  // Set maximum bridge fee to 0.001 ETH
  bridgeMaxFee: 1000000000000000n,
}

// Usage example
try {
  const result = await bridgeProtocol.bridge({
    targetChain: 'arbitrum',
    recipient: '0x...', // Recipient address
    token: '0x...', // USDT contract address
    amount: 1000000n
  })
} catch (error) {
  if (error.message.includes('Exceeded maximum fee')) {
    console.error('Bridge cancelled: Fee too high')
  }
}
```

### Provider

The `provider` option comes from the wallet account configuration and specifies how to connect to the blockchain.

**Type:** `string | Eip1193Provider`

**Examples:**

```javascript
// Option 1: Using RPC URL
const account = new WalletAccountEvm(seedPhrase, "0'/0/0", {
  provider: 'https://eth.drpc.org'
})

// Option 2: Using browser provider (e.g., MetaMask)
const account = new WalletAccountEvm(seedPhrase, "0'/0/0", {
  provider: window.ethereum
})

// Option 3: Using custom JsonRpcProvider
import { JsonRpcProvider } from 'ethers'
const account = new WalletAccountEvm(seedPhrase, "0'/0/0", {
  provider: new JsonRpcProvider('https://eth.drpc.org')
})
```

## ERC-4337 Configuration

When using ERC-4337 accounts, you can override configuration options during bridge operations:

```javascript
// Bridge with ERC-4337 account
const result = await bridgeProtocol.bridge({
  targetChain: 'arbitrum',
  recipient: '0x...', // Recipient address
  token: '0x...', // USDT contract address
  amount: 1000000n
}, {
  paymasterToken: { address: '0x...' }, // Paymaster token for gasless transactions
  bridgeMaxFee: 1000000000000000n // Override maximum bridge fee
})
```

### Paymaster Token

The `paymasterToken` option specifies which token to use for paying gas fees in ERC-4337 accounts.

**Type:** `{ address: string }` (optional)  
**Format:** Object with token contract address

**Example:**

```javascript
const result = await bridgeProtocol.bridge({
  targetChain: 'arbitrum',
  recipient: '0x...', // Recipient address
  token: '0x...', // USDT contract address
  amount: 1000000n
}, {
  paymasterToken: {
    address: '0x...' // Paymaster token address
  }
})
```

## Network Support

The bridge protocol uses EVM wallet providers as source chains and supports both EVM and non-EVM destinations. Change the provider URL in the wallet account configuration:

```javascript
// Ethereum Mainnet
const ethereumAccount = new WalletAccountEvm(seedPhrase, "0'/0/0", {
  provider: 'https://eth.drpc.org'
})

// Arbitrum
const arbitrumAccount = new WalletAccountEvm(seedPhrase, "0'/0/0", {
  provider: 'https://arb1.arbitrum.io/rpc'
})

// Polygon
const polygonAccount = new WalletAccountEvm(seedPhrase, "0'/0/0", {
  provider: 'https://polygon-rpc.com'
})
```

## Bridge Options

When calling the bridge method, you need to provide bridge options:

```javascript
const bridgeOptions = {
  targetChain: 'arbitrum', // Destination chain name
  recipient: '0x...', // Recipient address
  token: '0x...', // USDT contract address
  amount: 1000000n, // Amount to bridge in base units
  oftContractAddress: '0x...', // Optional custom OFT contract address
  dstEid: 30110 // Optional LayerZero destination endpoint ID override
}

const result = await bridgeProtocol.bridge(bridgeOptions)
```

### Target Chain

The `targetChain` option specifies which blockchain to bridge tokens to.

**Type:** `string`  
**Supported values:** `'ethereum'`, `'arbitrum'`, `'optimism'`, `'polygon'`, `'berachain'`, `'ink'`, `'plasma'`, `'conflux'`, `'corn'`, `'avalanche'`, `'celo'`, `'flare'`, `'hyperevm'`, `'mantle'`, `'megaeth'`, `'monad'`, `'morph'`, `'rootstock'`, `'sei'`, `'stable'`, `'unichain'`, `'xlayer'`, `'solana'`, `'ton'`, `'tron'`

### Recipient

The `recipient` option specifies the address that will receive the bridged tokens.

**Type:** `string`  
**Format:** Valid address for the target chain

### Token

The `token` option specifies which token contract to bridge.

**Type:** `string`  
**Format:** Token contract address on the source chain

### Amount

The `amount` option specifies how many tokens to bridge.

**Type:** `number | bigint`  
**Unit:** Base units of the token (e.g., for USD₮: 1 USD₮ = 1000000n)

### OFT Contract Address

The optional `oftContractAddress` option lets you override auto-discovery and force a specific OFT contract.

**Type:** `string` (optional)  
**Format:** Valid EVM contract address on the source chain

### Destination EID Override

The optional `dstEid` option lets you override the default LayerZero destination endpoint ID for the selected target chain.

**Type:** `number` (optional)

## Error Handling

The bridge protocol will throw errors for invalid configurations:

```javascript
try {
  const result = await bridgeProtocol.bridge({
    targetChain: 'invalid-chain',
    recipient: '0x...', // Recipient address
    token: '0x...', // USDT contract address
    amount: 1000000n
  })
} catch (error) {
  if (error.message.includes('not supported')) {
    console.error('Chain or token not supported')
  }
  if (error.message.includes('Exceeded maximum fee')) {
    console.error('Bridge fee too high')
  }
  if (error.message.includes('must be connected to a provider')) {
    console.error('Wallet not connected to blockchain')
  }
}
```


<table data-card-size="large" data-view="cards">
	<thead>
		<tr>
			<th></th>
			<th></th>
			<th></th>
			<th data-hidden data-card-target data-type="content-ref"></th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>Node.js Quickstart</strong>
			</td>
			<td>Get started with WDK in a Node.js environment</td>
			<td>
				<a href="../../../start-building/nodejs-bare-quickstart.md">Node.js & Bare Quickstart</a>
			</td>
		</tr>
     <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK Bridge USD₮0 EVM Protocol API</strong>
			</td>
			<td>Get started with WDK's Bridge USD₮0 EVM Protocol API</td>
			<td>
				<a href="./api-reference.md">WDK Bridge USD₮0 EVM Protocol API</a>
			</td>
		</tr>
        <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK Bridge USD₮0 EVM Protocol Usage</strong>
			</td>
			<td>Get started with WDK's Bridge USD₮0 EVM Protocol usage</td>
			<td>
				<a href="./usage.md">WDK Bridge USD₮0 EVM Protocol Usage</a>
			</td>
		</tr>
	</tbody>
</table>

***

### Need Help?

{% include "../../../.gitbook/includes/support-cards.md" %}



