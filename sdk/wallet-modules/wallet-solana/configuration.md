---
title: Wallet Solana Configuration
description: Configuration options and settings for @tetherto/wdk-wallet-solana
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

The `WalletManagerSolana` accepts an optional configuration object that defines how the wallet interacts with the Solana blockchain:

```javascript
import WalletManagerSolana from '@tetherto/wdk-wallet-solana'

const config = {
  rpcUrl: 'https://api.mainnet-beta.solana.com', // Solana RPC endpoint
  wsUrl: 'wss://api.mainnet-beta.solana.com/', // Optional: WebSocket endpoint
  transferMaxFee: 10000000 // Optional: Maximum fee in lamports
}

const wallet = new WalletManagerSolana(seedPhrase, config)
```

## Account Configuration

```javascript
import { WalletAccountSolana } from '@tetherto/wdk-wallet-solana'

const accountConfig = {
  rpcUrl: 'https://api.mainnet-beta.solana.com',
  wsUrl: 'wss://api.mainnet-beta.solana.com/', // Optional
  transferMaxFee: 10000000 // Optional: Maximum fee in lamports
}

const account = new WalletAccountSolana(seedPhrase, "0'/0/0", accountConfig)
```

## Configuration Options

### rpcUrl

The `rpcUrl` option specifies the Solana RPC endpoint for blockchain interactions.

**Type:** `string` (optional)

**Default:** If not provided, wallet functionality that requires RPC will throw an error

**Examples:**
```javascript
// Mainnet
const config = {
  rpcUrl: 'https://api.mainnet-beta.solana.com'
}

// Devnet
const config = {
  rpcUrl: 'https://api.devnet.solana.com'
}

// Custom RPC
const config = {
  rpcUrl: 'https://your-custom-rpc-endpoint.com'
}
```

### wsUrl

The `wsUrl` option specifies a custom WebSocket endpoint for real-time subscriptions and confirmations.

**Type:** `string` (optional)

**Default:** If not provided, the WebSocket URL will be automatically derived from the `rpcUrl`

**Example:**
```javascript
const config = {
  rpcUrl: 'https://api.mainnet-beta.solana.com',
  wsUrl: 'wss://api.mainnet-beta.solana.com/' // Custom WebSocket endpoint
}
```

### transferMaxFee

The `transferMaxFee` option sets the maximum allowed fee (in lamports) for transfer operations. This helps prevent unexpectedly high transaction fees.

**Type:** `number` (optional)

**Unit:** Lamports (1 SOL = 1,000,000,000 lamports)

**Example:**
```javascript
const config = {
  transferMaxFee: 10000000 // 0.01 SOL in lamports
}
```

## Complete Configuration Example

```javascript
import WalletManagerSolana from '@tetherto/wdk-wallet-solana'

const config = {
  // Required for most operations
  rpcUrl: 'https://api.mainnet-beta.solana.com',
  
  // Optional: Custom WebSocket endpoint
  wsUrl: 'wss://api.mainnet-beta.solana.com/',
  
  // Optional: Fee protection
  transferMaxFee: 10000000 // 0.01 SOL maximum fee
}

const wallet = new WalletManagerSolana(seedPhrase, config)
```

## Network Endpoints

### Mainnet
- RPC: `https://api.mainnet-beta.solana.com`
- WebSocket: `wss://api.mainnet-beta.solana.com/`

### Devnet
- RPC: `https://api.devnet.solana.com`
- WebSocket: `wss://api.devnet.solana.com/`

### Testnet
- RPC: `https://api.testnet.solana.com`
- WebSocket: `wss://api.testnet.solana.com/`

## Security Considerations

- Always use HTTPS URLs for RPC endpoints
- Set appropriate `transferMaxFee` limits for your use case
- Consider using environment variables for configuration in production
- Use trusted RPC providers or run your own Solana validator for production applications


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
				<strong>WDK Solana Wallet Usage</strong>
			</td>
			<td>Get started with WDK's Solana Wallet Usage</td>
			<td>
				<a href="./configuration.md">WDK Solana Wallet Usage</a>
			</td>
		</tr>
        <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK Solana Wallet API</strong>
			</td>
			<td>Get started with WDK's Solana Wallet API</td>
			<td>
				<a href="./api-reference.md">WDK Solana Wallet API</a>
			</td>
		</tr>
	</tbody>
</table>

***

### Need Help?

{% include "../../../.gitbook/includes/support-cards.md" %}


