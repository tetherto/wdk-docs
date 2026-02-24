---
title: Wallet Tron Configuration
description: Configuration options and settings for @tetherto/wdk-wallet-tron
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
import WalletManagerTron from '@tetherto/wdk-wallet-tron'

const config = {
  provider: 'https://api.trongrid.io', // Tron RPC endpoint
  transferMaxFee: 10000000 // Maximum fee in sun (optional)
}

const wallet = new WalletManagerTron(seedPhrase, config)
```

## Account Configuration

```javascript
import { WalletAccountTron } from '@tetherto/wdk-wallet-tron'

const accountConfig = {
  provider: 'https://api.trongrid.io',
  transferMaxFee: 10000000 // Maximum fee in sun (optional)
}

const account = new WalletAccountTron(seedPhrase, "0'/0/0", accountConfig)
```

## Configuration Options

### Provider

The `provider` option specifies the Tron RPC endpoint or TronWeb instance for blockchain interactions.

**Type:** `string | TronWeb`

**Example:**
```javascript
const config = {
  provider: 'https://api.trongrid.io'
}
```

### Transfer Max Fee

The `transferMaxFee` option sets the maximum fee amount (in sun) for transfer operations. This helps prevent transactions from being sent with unexpectedly high fees.

**Type:** `number | bigint` (optional)  
**Unit:** Sun (1 TRX = 1,000,000 Sun)

**Example:**
```javascript
const config = {
  transferMaxFee: 10000000 // 10 TRX in sun
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
				<strong>WDK Tron Wallet Usage</strong>
			</td>
			<td>Get started with WDK's Tron Wallet Usage</td>
			<td>
				<a href="./usage.md">WDK Tron Wallet Usage</a>
			</td>
		</tr>
        <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK Tron Wallet API</strong>
			</td>
			<td>Get started with WDK's Tron Wallet API</td>
			<td>
				<a href="./api-reference.md">WDK Tron Wallet API</a>
			</td>
		</tr>
	</tbody>
</table>

***

### Need Help?

{% include "../../../.gitbook/includes/support-cards.md" %}
