---
title: Wallet TON Gasless Configuration
description: Configuration options and settings for @tetherto/wdk-wallet-ton-gasless
author: Raquel Carrasco Gonzalez
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

```javascript
import WalletManagerTonGasless from '@tetherto/wdk-wallet-ton-gasless'

const config = {
  // Required parameters
  tonClient: {
    url: 'https://toncenter.com/api/v3',
    secretKey: 'your-api-key' // Optional
  },
  gasFreeProvider: 'https://your-gasfree-provider.com',
  gasFreeApiKey: 'your-gasfree-api-key',
  gasFreeApiSecret: 'your-gasfree-api-secret',
  serviceProvider: 'EQ...', // Service provider's TON address
  verifyingContract: 'EQ...', // Verifying contract address
  chainId: '1', // TON chain ID
  
  // Optional parameters
  transferMaxFee: 10000000 // Maximum fee in token base units
}

const wallet = new WalletManagerTonGasless(seedPhrase, config)
```

## Account Configuration

```javascript
import { WalletAccountTonGasless } from '@tetherto/wdk-wallet-ton-gasless'

const accountConfig = {
  // Required parameters
  tonClient: {
    url: 'https://toncenter.com/api/v3',
    secretKey: 'your-api-key' // Optional
  },
  gasFreeProvider: 'https://your-gasfree-provider.com',
  gasFreeApiKey: 'your-gasfree-api-key',
  gasFreeApiSecret: 'your-gasfree-api-secret',
  serviceProvider: 'EQ...', // Service provider's TON address
  verifyingContract: 'EQ...', // Verifying contract address
  chainId: '1', // TON chain ID
  
  // Optional parameters
  transferMaxFee: 10000000 // Maximum fee in token base units
}

const account = new WalletAccountTonGasless(seedPhrase, "0'/0/0", accountConfig)
```

## Configuration Options

### tonClient

The `tonClient` option configures the TON Center API client for blockchain interactions.

**Type:**
```typescript
interface TonClientConfig {
  /**
   * TON Center API endpoint URL
   * @example 'https://toncenter.com/api/v3'
   */
  url: string;

  /**
   * Optional API key for TON Center
   * Required for higher rate limits
   */
  secretKey?: string;
}
```

### gasFreeProvider

The `gasFreeProvider` option specifies the gas-free service endpoint.

**Type:** `string`

**Required:** Yes

**Example:**
```javascript
const config = {
  gasFreeProvider: 'https://your-gasfree-provider.com'
}
```

### gasFreeApiKey and gasFreeApiSecret

API credentials for the gas-free service.

**Type:** `string`

**Required:** Yes

**Example:**
```javascript
const config = {
  gasFreeApiKey: 'your-gasfree-api-key',
  gasFreeApiSecret: 'your-gasfree-api-secret'
}
```

### serviceProvider

The TON address of the service provider that handles gas-free transactions.

**Type:** `string`

**Required:** Yes

**Example:**
```javascript
const config = {
  serviceProvider: 'EQ...' // TON address
}
```

### verifyingContract

The TON address of the contract that verifies gas-free transactions.

**Type:** `string`

**Required:** Yes

**Example:**
```javascript
const config = {
  verifyingContract: 'EQ...' // TON address
}
```

### chainId

The blockchain's identifier.

**Type:** `string`

**Required:** Yes

**Example:**
```javascript
const config = {
  chainId: '1' // TON mainnet
}
```

### transferMaxFee

The `transferMaxFee` option sets the maximum allowed fee in token base units for transfer operations.

**Type:** `number`

**Required:** No

**Example:**
```javascript
const config = {
  transferMaxFee: 10000000 // Maximum fee in token base units
}
```

## Complete Configuration Example

Here's a complete configuration example with all options:

```javascript
const config = {
  // TON Client (Required)
  tonClient: {
    url: 'https://toncenter.com/api/v3',
    secretKey: 'your-api-key'
  },
  
  // Gas-free Service (Required)
  gasFreeProvider: 'https://your-gasfree-provider.com',
  gasFreeApiKey: 'your-gasfree-api-key',
  gasFreeApiSecret: 'your-gasfree-api-secret',
  
  // Contract Addresses (Required)
  serviceProvider: 'EQ...', // Service provider's address
  verifyingContract: 'EQ...', // Verifying contract address
  
  // Chain Configuration (Required)
  chainId: '1', // TON mainnet
  
  // Fee Limits (Optional)
  transferMaxFee: 10000000 // Maximum fee in token base units
}
```

## Security Considerations

- Keep API keys and secrets secure and never expose them in client-side code
- Use environment variables for sensitive configuration values
- Always use HTTPS URLs for API endpoints
- Set appropriate `transferMaxFee` limits to prevent excessive fees
- Validate contract addresses before using them in configuration



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
				<strong>WDK TON Gasless Wallet Usage</strong>
			</td>
			<td>Get started with WDK's TON Gasless Wallet Usage</td>
			<td>
				<a href="./configuration.md">WDK TON Gasless Wallet Usage</a>
			</td>
		</tr>
        <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK TON Gasless Wallet API</strong>
			</td>
			<td>Get started with WDK's TON Gasless Wallet API</td>
			<td>
				<a href="./api-reference.md">WDK TON Gasless Wallet API</a>
			</td>
		</tr>
  
	</tbody>
</table>

***

### Need Help?

{% include "../../.gitbook/includes/support-cards.md" %}





