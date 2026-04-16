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
  transferMaxFee: 10000000 // Optional: Maximum fee in lamports
}

const wallet = new WalletManagerSolana(seedPhrase, config)
```

## Account Configuration

Accounts are obtained through the `WalletManagerSolana` instance using `getAccount()` or `getAccountByPath()`:

```javascript
import WalletManagerSolana from '@tetherto/wdk-wallet-solana'

const accountConfig = {
  rpcUrl: 'https://api.mainnet-beta.solana.com',
  transferMaxFee: 10000000 // Optional: Maximum fee in lamports
}

const wallet = new WalletManagerSolana(seedPhrase, accountConfig)

// Get account by index
const account = await wallet.getAccount(0)

// Or get account by custom derivation path
const customAccount = await wallet.getAccountByPath("0'/0'/5'")
```

## Configuration Options

### rpcUrl

The `rpcUrl` option specifies one Solana RPC endpoint for blockchain interactions. At runtime, `v1.0.0-beta.6` also accepts an ordered list of endpoints to enable provider failover.

**Type:** `string` in the published TypeScript definition (optional)

**Default:** If not provided, wallet functionality that requires RPC will throw an error

**Examples:**
```javascript
// Single endpoint
const config = {
  rpcUrl: 'https://api.mainnet-beta.solana.com'
}

// Devnet
const config = {
  rpcUrl: 'https://api.devnet.solana.com'
}

// Failover across multiple endpoints
const config = {
  rpcUrl: [
    'https://api.mainnet-beta.solana.com',
    'https://rpc.ankr.com/solana'
  ]
}

// Custom RPC
const config = {
  rpcUrl: 'https://your-custom-rpc-endpoint.com'
}
```

When `rpcUrl` is an array, WDK initializes a failover provider and tries the next RPC when the current provider fails.

{% hint style="info" %}
In `v1.0.0-beta.6`, the runtime accepts `rpcUrl: string[]` for failover, but the published TypeScript definition still narrows `rpcUrl` to `string`. If you're using TypeScript, cast the config or wrap it until the typings catch up.
{% endhint %}

### retries

The `retries` option controls how many times the failover provider retries a request before moving on to the next RPC entry.

**Type:** `number` (optional)

**Default:** `3`

**Example:**
```javascript
const config = {
  rpcUrl: [
    'https://api.mainnet-beta.solana.com',
    'https://rpc.ankr.com/solana'
  ],
  retries: 5
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

## Derivation Paths

Solana wallets use SLIP-0010 derivation paths. The default derivation path follows ecosystem conventions:

- Default path: `m/44'/501'/{index}'/0'` (where `{index}` is the account index)
- Custom child paths must keep every segment hardened, for example `0'/0'/5'`

{% hint style="warning" %}

**Default Derivation Path Change in v1.0.0-beta.4+**

The default derivation path was updated in v1.0.0-beta.4 to match ecosystem conventions:

- **Before** (<= v1.0.0-beta.3): `m/44'/501'/0'/0/{index}`
- **After** (v1.0.0-beta.4+): `m/44'/501'/{index}'/0'`

If you're upgrading from an earlier version, existing wallets created with the old path will generate different addresses. Make sure to migrate any existing wallets or use the old path explicitly if needed for compatibility.

Use [`getAccountByPath`](./api-reference.md#getaccountbypathpath) to supply an explicit derivation path when importing or recreating legacy wallets.

{% endhint %}

## Security Considerations

- Always use HTTPS URLs for RPC endpoints
- Use RPC endpoints that serve the same Solana network when enabling failover
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
				<a href="./usage.md">WDK Solana Wallet Usage</a>
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
