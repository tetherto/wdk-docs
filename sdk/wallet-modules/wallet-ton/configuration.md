---
title: Wallet TON Configuration
description: Configuration options and settings for @tetherto/wdk-wallet-ton
lastReviewed: 2025-06-26
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

The `WalletManagerTon` accepts a configuration object that defines how the wallet interacts with the TON blockchain:

```javascript
import WalletManagerTon from '@tetherto/wdk-wallet-ton'

const config = {
  tonClient: {
    url: 'https://toncenter.com/api/v3',
    secretKey: 'your-api-key' // Optional
  },
  transferMaxFee: 1000000000 // Optional: Maximum fee in nanotons (1 TON)
}

const wallet = new WalletManagerTon(seedPhrase, config)
```

## Account Configuration

```javascript
import { WalletAccountTon } from '@tetherto/wdk-wallet-ton'

const accountConfig = {
  tonClient: {
    url: 'https://toncenter.com/api/v3',
    secretKey: 'your-api-key' // Optional
  },
  transferMaxFee: 1000000000 // Optional: Maximum fee in nanotons
}

const account = new WalletAccountTon(seedPhrase, "0'/0/0", accountConfig)
```

## Configuration Options

### tonClient

The `tonClient` option configures the TON Center API client for blockchain interactions.

**Type:**
```typescript
interface TonClientConfig {
  /**
   * TON Center API endpoint URL
   */
  url: string;

  /**
   * Optional API key for TON Center
   * Required for higher rate limits
   */
  secretKey?: string;
}
```

**Examples:**
```javascript
// Basic configuration
const config = {
  tonClient: { 
    url: 'https://toncenter.com/api/v3'
  }
}

// With API key for higher rate limits
const config = {
  tonClient: {
    url: 'https://toncenter.com/api/v3',
    secretKey: 'your-api-key'
  }
}
```

### transferMaxFee

The `transferMaxFee` option sets the maximum allowed fee (in nanotons) for transfer operations. This helps prevent unexpectedly high transaction fees.

**Type:** `number` (nanotons)

**Default:** No maximum (undefined)

**Examples:**
```javascript
const config = {
  transferMaxFee: 1000000000 // 1 TON in nanotons
}

// Example with both options
const config = {
  tonClient: {
    url: 'https://toncenter.com/api/v3',
    secretKey: 'your-api-key'
  },
  transferMaxFee: 1000000000
}
```

## Read-Only Account Configuration

For read-only accounts, you only need the TON client configuration:

```javascript
import { WalletAccountReadOnlyTon } from '@tetherto/wdk-wallet-ton'

const readOnlyConfig = {
  tonClient: {
    url: 'https://toncenter.com/api/v3',
    secretKey: 'your-api-key' // Optional
  }
}

const readOnlyAccount = new WalletAccountReadOnlyTon(publicKey, readOnlyConfig)
```

## Network Selection

The TON network (mainnet or testnet) is determined by the TON Center API endpoint URL:

- Mainnet: `https://toncenter.com/api/v3`
- Testnet: `https://testnet.toncenter.com/api/v3`

## Security Considerations

- Always use HTTPS URLs for TON Center API endpoints
- Keep API keys secure and never expose them in client-side code
- Consider using environment variables for API keys
- Set appropriate `transferMaxFee` limits for your use case


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
				<strong>WDK TON Wallet Usage</strong>
			</td>
			<td>Get started with WDK's TON Wallet Usage</td>
			<td>
				<a href="./configuration.md">WDK TON Wallet Usage</a>
			</td>
		</tr>
        <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK TON Wallet API</strong>
			</td>
			<td>Get started with WDK's TON Wallet API</td>
			<td>
				<a href="./api-reference.md">WDK TON Wallet API</a>
			</td>
		</tr>
  
	</tbody>
</table>

***

### Need Help?

{% include "../../../.gitbook/includes/support-cards.md" %}



