---
title: Wallet TON Gasless Configuration
description: Configuration options and settings for @tetherto/wdk-wallet-ton-gasless
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
import WalletManagerTonGasless from '@tetherto/wdk-wallet-ton-gasless'

const config = {
  // Required: TON Center API client
  tonClient: {
    url: 'https://toncenter.com/api/v3',
    secretKey: 'your-api-key' // Optional, for higher rate limits
  },
  // Required: TON API client (used for gasless transaction relay)
  tonApiClient: {
    url: 'https://tonapi.io/v2',
    secretKey: 'your-tonapi-key' // Optional but recommended
  },
  // Required: Paymaster token used to pay gas fees
  paymasterToken: {
    address: 'EQ...' // Paymaster Jetton master contract address
  },
  // Optional: Maximum fee for transfer operations (in paymaster token base units)
  transferMaxFee: 10000000
}

const wallet = new WalletManagerTonGasless(seedPhrase, config) // config is required
```

## Account Configuration

```javascript
import { WalletAccountTonGasless } from '@tetherto/wdk-wallet-ton-gasless'

const accountConfig = {
  // Required: TON Center API client
  tonClient: {
    url: 'https://toncenter.com/api/v3',
    secretKey: 'your-api-key' // Optional
  },
  // Required: TON API client
  tonApiClient: {
    url: 'https://tonapi.io/v2',
    secretKey: 'your-tonapi-key' // Optional but recommended
  },
  // Required: Paymaster token
  paymasterToken: {
    address: 'EQ...' // Paymaster Jetton master contract address
  },
  // Optional: Maximum fee for transfer operations
  transferMaxFee: 10000000
}

const account = new WalletAccountTonGasless(seedPhrase, "0'/0/0", accountConfig) // config is required
```

## Read-Only Account Configuration

```javascript
import { WalletAccountReadOnlyTonGasless } from '@tetherto/wdk-wallet-ton-gasless'

const readOnlyConfig = {
  // Required: TON Center API client
  tonClient: {
    url: 'https://toncenter.com/api/v3',
    secretKey: 'your-api-key' // Optional
  },
  // Required: TON API client
  tonApiClient: {
    url: 'https://tonapi.io/v2',
    secretKey: 'your-tonapi-key' // Optional but recommended
  },
  // Required: Paymaster token
  paymasterToken: {
    address: 'EQ...' // Paymaster Jetton master contract address
  }
  // Note: transferMaxFee is NOT available for read-only accounts
}

const readOnlyAccount = new WalletAccountReadOnlyTonGasless(publicKey, readOnlyConfig) // config is required
```

## Configuration Options

### tonClient

The `tonClient` option configures the TON Center API client for blockchain interactions. You can pass either a configuration object or an existing `TonClient` instance.

**Type:**
```typescript
type TonClientOption = TonClientConfig | TonClient;

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

**Required:** Yes

### tonApiClient

The `tonApiClient` option configures the TON API client used for gasless transaction relay and fee estimation. You can pass either a configuration object or an existing `TonApiClient` instance.

**Type:**
```typescript
type TonApiClientOption = TonApiClientConfig | TonApiClient;

interface TonApiClientConfig {
  /**
   * TON API endpoint URL
   * @example 'https://tonapi.io/v2'
   */
  url: string;

  /**
   * Optional API key for TON API
   */
  secretKey?: string;
}
```

**Required:** Yes

### paymasterToken

The `paymasterToken` option specifies the Jetton token used to pay gas fees in gasless transactions.

**Type:**
```typescript
interface PaymasterTokenConfig {
  /**
   * Paymaster Jetton master contract address
   * @example 'EQ...'
   */
  address: string;
}
```

**Required:** Yes

**Example:**
```javascript
const config = {
  paymasterToken: {
    address: 'EQ...' // Paymaster Jetton master contract address
  }
}
```

### transferMaxFee

The `transferMaxFee` option sets the maximum allowed fee for transfer operations, denominated in the paymaster token's base units. This helps prevent unexpectedly high transaction fees.

**Type:** `number | bigint`

**Required:** No

**Example:**
```javascript
const config = {
  transferMaxFee: 10000000 // Maximum fee in paymaster token base units
}
```

## Complete Configuration Example

Here's a complete configuration example with all options:

```javascript
const config = {
  // TON Center API client (required)
  tonClient: {
    url: 'https://toncenter.com/api/v3',
    secretKey: 'your-api-key'
  },
  
  // TON API client for gasless relay (required)
  tonApiClient: {
    url: 'https://tonapi.io/v2',
    secretKey: 'your-tonapi-key'
  },
  
  // Paymaster token for gas fee payment (required)
  paymasterToken: {
    address: 'EQ...' // Paymaster Jetton master contract address
  },
  
  // Fee limits (optional)
  transferMaxFee: 10000000 // Maximum fee in paymaster token base units
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
				<a href="./usage.md">WDK TON Gasless Wallet Usage</a>
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

{% include "../../../.gitbook/includes/support-cards.md" %}





