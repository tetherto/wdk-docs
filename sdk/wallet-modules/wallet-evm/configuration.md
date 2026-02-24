---
title: Wallet EVM Configuration
description: Configuration options and settings for @tetherto/wdk-wallet-evm
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

## Wallet Configuration

The `WalletManagerEvm` accepts a configuration object that defines how the wallet interacts with the blockchain:

```javascript
import WalletManagerEvm from '@tetherto/wdk-wallet-evm'

const config = {
  // Recommended: RPC endpoint URL or EIP-1193 provider (required for blockchain operations)
  provider: 'https://eth.drpc.org',
  
  // Optional: Maximum fee for transfer operations (in wei)
  transferMaxFee: 100000000000000 // 0.0001 ETH
}

const wallet = new WalletManagerEvm(seedPhrase, config)
```

## Account Configuration

Both `WalletAccountEvm` and `WalletAccountReadOnlyEvm` share similar configuration options:

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
```

## Configuration Options

### Provider

The `provider` option specifies how to connect to the blockchain. It can be either a URL string or an EIP-1193 compatible provider instance.

**Type:** `string | Eip1193Provider`

**Examples:**

```javascript
// Option 1: Using RPC URL
const config = {
  provider: 'https://eth.drpc.org'
}

// Option 2: Using browser provider (e.g., MetaMask)
const config = {
  provider: window.ethereum
}

// Option 3: Using a custom EIP-1193 provider
// Works in Node.js, Bare, and browsers - zero external dependencies
function createFetchProvider(rpcUrl) {
  let requestId = 0
  return {
    request: async ({ method, params }) => {
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: ++requestId,
          method,
          params: params || []
        })
      })
      const data = await response.json()
      if (data.error) throw new Error(data.error.message)
      return data.result
    }
  }
}

const config = {
  provider: createFetchProvider('https://eth.drpc.org')
}
```

### Transfer Max Fee

The `transferMaxFee` option sets a maximum limit for transaction fees to prevent unexpectedly high costs.

**Type:** `number | bigint` (optional)  
**Unit:** Wei (1 ETH = 1000000000000000000 Wei)

**Examples:**

```javascript
const config = {
  // Set maximum fee to 0.0001 ETH
  transferMaxFee: 100000000000000n,
}

// Usage example
try {
  const result = await account.transfer({
    token: '0x...', // ERC20 address
    recipient: '0x...',
    amount: 1000000n
  })
} catch (error) {
  if (error.message.includes('Exceeded maximum fee')) {
    console.error('Transfer cancelled: Fee too high')
  }
}
```

### Fee Rate Multipliers

The wallet manager uses predefined multipliers for fee calculations:

```javascript
// Normal fee rate = base fee × 1.1
const normalFee = await wallet.getFeeRates()
console.log('Normal fee:', normalFee.normal)

// Fast fee rate = base fee × 2.0
const fastFee = await wallet.getFeeRates()
console.log('Fast fee:', fastFee.fast)
```

## Network Support

The configuration works with any EVM-compatible network. Just change the provider URL:

```javascript
// Ethereum Mainnet
const mainnetConfig = {
  provider: 'https://eth.drpc.org'
}

// Polygon (Matic)
const polygonConfig = {
  provider: 'https://polygon-rpc.com'
}

// Arbitrum
const arbitrumConfig = {
  provider: 'https://arb1.arbitrum.io/rpc'
}

// BSC (Binance Smart Chain)
const bscConfig = {
  provider: 'https://bsc-dataseed.binance.org'
}

// Avalanche C-Chain
const avalancheConfig = {
  provider: 'https://avalanche-c-chain-rpc.publicnode.com',
}

// Plasma 
const plasmaConfig = {
  provider: 'https://plasma.drpc.org',
}

// Stable (uses USD₮ as native gas token)
// No need for ERC-4337 paymaster/bundler setup.
const stableConfig = {
  provider: 'https://rpc.stable.xyz',
}

// Sepolia Testnet
const sepoliaConfig = {
  provider: 'https://sepolia.drpc.org',
}

```


## Next Steps 

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
				<a href="../../../start-building/nodejs-bare-quickstart.md">nodejs-quickstart.md</a>
			</td>
		</tr>
    <tr>
			<td>
				<i class="fa-mobile-alt">:mobile-alt:</i>
			</td>
			<td>
				<strong>React Native Quickstart</strong>
			</td>
			<td>Build mobile wallets with React Native Expo</td>
			<td>
				<a href="../../../start-building/react-native-quickstart.md">react-native-quickstart.md</a>
			</td>
		</tr>
    <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK EVM Wallet Usage</strong>
			</td>
			<td>Get started with WDK's EVM Wallet Usage</td>
			<td>
				<a href="./usage.md">WDK EVM Wallet Usage</a>
			</td>
		</tr>
        <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK EVM Wallet API</strong>
			</td>
			<td>Get started with WDK's EVM Wallet API</td>
			<td>
				<a href="./api-reference.md">WDK EVM Wallet API</a>
			</td>
		</tr>
	</tbody>
</table>

***

### Need Help?

{% include "../../../.gitbook/includes/support-cards.md" %}


