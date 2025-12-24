---
title: Wallet Spark Configuration
description: Configuration options and settings for @tetherto/wdk-wallet-spark
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

```javascript
const config = {
  network: 'MAINNET' // 'MAINNET', 'TESTNET', or 'REGTEST'
}

const wallet = new WalletManagerSpark(seedPhrase, config)
```

## Account Creation

```javascript
// WalletAccountSpark is created by the WalletManagerSpark
// It does not take configuration parameters directly
const account = await wallet.getAccount(0) // Get account at index 0
```

## Configuration Options

### Network

The `network` option specifies which Spark network to use.

**Type:** `string`

**Values:**
- `"MAINNET"` - Spark [mainnet](../../../resources/concepts.md#mainnet) (production)
- `"TESTNET"` - Spark [testnet](../../../resources/concepts.md#testnet) (development)
- `"REGTEST"` - Spark [regtest](../../../resources/concepts.md#regtest) (Spark regtest)

**Default:** `"MAINNET"`

**Example:**
```javascript
const config = {
  network: 'REGTEST' // Use REGTEST for development
}
```

### SparkScan API Key

The `sparkScanApiKey` option allows you to provide an API key for SparkScan API requests. This is used for read-only operations like fetching balances and transaction receipts.

**Type:** `string` (optional)

**Example:**
```javascript
const config = {
  network: 'MAINNET',
  sparkScanApiKey: 'your-api-key-here'
}
```

## Network Configuration

The wallet can be configured for different Spark networks:

```javascript
// Mainnet configuration
const mainnetConfig = {
  network: 'MAINNET'
}

// Testnet configuration  
const testnetConfig = {
  network: 'TESTNET'
}

// Regtest configuration
const regtestConfig = {
  network: 'REGTEST'
}
```

## BIP-44 Derivation Path

Spark uses the [BIP-44](../../../resources/concepts.md#bip-44-multi-account-hierarchy) coin type 998, resulting in derivation paths like:
- `m/44'/998'/0'/0/0` for MAINNET account index 0
- `m/44'/998'/0'/0/1` for MAINNET account index 1
- `m/44'/998'/1'/0/0` for TESTNET account index 0
- `m/44'/998'/2'/0/0` for REGTEST account index 0

The path follows the pattern `m/44'/998'/{networkNumber}'/0/{index}` where:
- `998` is the coin type for Spark
- `networkNumber` is 0 for MAINNET, 1 for TESTNET, or 2 for REGTEST
- `index` is the account index

This ensures compatibility with standard [BIP-44](../../../resources/concepts.md#bip-44-multi-account-hierarchy) wallets while using Spark's unique coin type identifier.

## Complete Configuration Example

```javascript
import WalletManagerSpark from '@tetherto/wdk-wallet-spark'

// Create wallet manager with configuration
const wallet = new WalletManagerSpark(seedPhrase, {
  network: 'MAINNET'
})

// Get accounts (no additional configuration needed)
const account0 = await wallet.getAccount(0)
const account1 = await wallet.getAccount(1)

// Clean up when done
wallet.dispose()
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
				<strong>WDK Spark Wallet Usage</strong>
			</td>
			<td>Get started with WDK's Spark Wallet Usage</td>
			<td>
				<a href="./usage.md">WDK Spark Wallet Usage</a>
			</td>
		</tr>
        <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK Spark Wallet API</strong>
			</td>
			<td>Get started with WDK's Spark Wallet API</td>
			<td>
				<a href="./api-reference.md">WDK Spark Wallet API</a>
			</td>
		</tr>
	</tbody>
</table>

***

### Need Help?

{% include "../../../.gitbook/includes/support-cards.md" %}



