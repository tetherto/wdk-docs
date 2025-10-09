---
title: Bridge USDT0 TON API Reference
description: Complete API documentation for @tetherto/wdk-protocol-bridge-usdt0-ton
lastReviewed: 2025-09-04
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

# API Reference

## Table of Contents

| Class | Description | Methods |
|-------|-------------|---------|
| [Usdt0ProtocolTon](#usdt0protocolton) | Main class for bridging USDT0 tokens from TON to other blockchains. Extends `BridgeProtocol` from `@tetherto/wdk-wallet/protocols`. | [Constructor](#constructor) - Creates bridge service<br/>[bridge(options, config?)](#bridgeoptions-config) - Bridges tokens from TON to another blockchain<br/>[quoteBridge(options, config?)](#quotebridgeoptions-config) - Gets the cost of a bridge operation without doing it |

## Usdt0ProtocolTon

The main class for bridging USDT0 tokens from TON blockchain to other chains using the LayerZero protocol.  
Extends `BridgeProtocol` from `@tetherto/wdk-wallet/protocols`.

### Constructor

```javascript
new Usdt0ProtocolTon(account, config?)
```

**Parameters:**
- `account` (WalletAccountTon | WalletAccountTonGasless | WalletAccountReadOnlyTon | WalletAccountReadOnlyTonGasless): The wallet account to use for bridge operations
- `config` (BridgeProtocolConfig, optional): Configuration object
  - `bridgeMaxFee` (bigint, optional): Maximum total bridge cost in nanotons

**Example:**
```javascript
import Usdt0ProtocolTon from '@tetherto/wdk-protocol-bridge-usdt0-ton'
import { WalletAccountTon } from '@tetherto/wdk-wallet-ton'

const account = new WalletAccountTon(seedPhrase, {
  tonApiKey: 'YOUR_TON_API_KEY',
  tonApiEndpoint: 'YOUR_TON_API_ENDPOINT'
})

const bridgeProtocol = new Usdt0ProtocolTon(account, {
  bridgeMaxFee: 1000000000n // Maximum bridge fee in nanotons
})
```

### Methods

| Method | Description | Returns | Throws |
|--------|-------------|---------|--------|
| `bridge(options, config?)` | Bridges tokens from TON to another blockchain | `Promise<BridgeResult>` | If no TON connection or fee exceeds max |
| `quoteBridge(options, config?)` | Gets the cost of a bridge operation | `Promise<Omit<BridgeResult, 'hash'>>` | If no TON connection |

#### `bridge(options, config?)`
Bridges tokens from TON to a different blockchain using the USDT0 protocol.

**Parameters:**
- `options` (Usdt0BridgeOptions): Bridge operation options
  - `targetChain` (string): Where to send tokens
  - `recipient` (string): Address that will get the bridged tokens
  - `token` (string): Token address on TON
  - `amount` (bigint): Amount to bridge in token base units
  - `oft` (OftBridgeConfig, optional): Custom token config for jettons not built in
- `config` (Pick<TonGaslessWalletConfig, 'paymasterToken'> & Pick<BridgeProtocolConfig, 'bridgeMaxFee'>, optional): Override settings for gasless accounts
  - `paymasterToken` (string, optional): Token to use for paying fees
  - `bridgeMaxFee` (bigint, optional): Override maximum bridge fee

**Returns:** `Promise<BridgeResult>` - Bridge operation result

**Throws:**
- Error if account is read-only
- Error if no TON connection is set up
- Error if bridge fee goes over maximum allowed
- Error if target chain is same as source chain (ton)

**Example:**
```javascript
// Standard TON account
const result = await bridgeProtocol.bridge({
  targetChain: 'ethereum',
  recipient: 'RECIPIENT_ADDRESS',
  token: 'TON_TOKEN_ADDRESS',
  amount: 1000000n
})

console.log('Bridge hash:', result.hash)
console.log('Total fee:', result.fee)
console.log('Bridge fee:', result.bridgeFee)

// Gasless TON account
const result2 = await bridgeProtocol.bridge({
  targetChain: 'arbitrum',
  recipient: 'RECIPIENT_ADDRESS',
  token: 'TON_TOKEN_ADDRESS',
  amount: 1000000n
}, {
  paymasterToken: 'USDT', // Token used to pay fees
  bridgeMaxFee: 1000000000n
})

console.log('Bridge hash:', result2.hash)
console.log('Total fee:', result2.fee)
console.log('Bridge fee:', result2.bridgeFee)

// Custom jetton token
const result3 = await bridgeProtocol.bridge({
  targetChain: 'ethereum',
  recipient: 'RECIPIENT_ADDRESS',
  token: 'CUSTOM_TOKEN_ADDRESS',
  amount: 1000000n,
  oft: {
    version: 3,
    sharedDecimals: 6,
    deployments: {
      ton: { token: { address: 'TON_TOKEN_ADDRESS' } },
      ethereum: { token: { address: 'ETH_TOKEN_ADDRESS' } }
    }
  }
})
```

#### `quoteBridge(options, config?)`
Gets the cost of a bridge operation without doing it.

**Parameters:**
- `options` (Usdt0BridgeOptions): Bridge operation options (same as bridge method)
- `config` (Pick<TonGaslessWalletConfig, 'paymasterToken'>, optional): Override settings for gasless accounts
  - `paymasterToken` (string, optional): Token to use for paying fees

**Returns:** `Promise<Omit<BridgeResult, 'hash'>>` - Bridge cost estimate

**Throws:** Error if no TON connection is set up

**Example:**
```javascript
const quote = await bridgeProtocol.quoteBridge({
  targetChain: 'ethereum',
  recipient: 'RECIPIENT_ADDRESS',
  token: 'TON_TOKEN_ADDRESS',
  amount: 1000000n
})

console.log('Fee:', quote.fee, 'nanotons')
console.log('Bridge fee:', quote.bridgeFee, 'nanotons')

// Check if fees are OK
if (quote.fee + quote.bridgeFee > 1000000000n) {
  console.log('Bridge fees too high')
} else {
  // Do bridge
  const result = await bridgeProtocol.bridge({
    targetChain: 'ethereum',
    recipient: 'RECIPIENT_ADDRESS',
    token: 'TON_TOKEN_ADDRESS',
    amount: 1000000n
  })
}
```

## Types

### Usdt0BridgeOptions

```typescript
interface Usdt0BridgeOptions {
  targetChain: string;              // Where to send tokens
  recipient: string;                // Address that will get bridged tokens
  token: string;                    // Token address on TON
  amount: bigint;                   // Amount to bridge in token base units
  oft?: OftBridgeConfig;            // Custom token config for jettons
}
```

### BridgeResult

```typescript
interface BridgeResult {
  hash: string;                     // Bridge transaction hash
  fee: bigint;                      // Total cost in nanotons
  bridgeFee: bigint;                // Bridge service fee in nanotons
}
```

### BridgeProtocolConfig

```typescript
interface BridgeProtocolConfig {
  bridgeMaxFee?: bigint;            // Maximum total bridge cost in nanotons
}
```

### TonGaslessWalletConfig

```typescript
interface TonGaslessWalletConfig {
  paymasterToken?: string;          // Token to use for paying fees
}
```

### OftBridgeConfig

```typescript
interface OftBridgeConfig {
  version: number;                  // OFT version (usually 3)
  sharedDecimals: number;           // Token decimals (usually 6)
  deployments: {                    // Token info for each chain
    [chainKey: string]: {
      token: {
        address: string;            // Token address on this chain
      };
    };
  };
}
```

### Supported Chains

The bridge service supports these chains:

**Source Chain:**
- `'ton'` (EID: 30,343) - TON blockchain

**Target Chains:**
- `'ethereum'` (Chain ID: 1, EID: 30,101)
- `'arbitrum'` (Chain ID: 42,161, EID: 30,110)
- `'tron'` (EID: 30,420)

## Error Handling

The bridge service throws specific errors for different problems:

```javascript
try {
  const result = await bridgeProtocol.bridge({
    targetChain: 'ethereum',
    recipient: 'RECIPIENT_ADDRESS',
    token: 'TON_TOKEN_ADDRESS',
    amount: 1000000n
  })
} catch (error) {
  if (error.message.includes('not supported')) {
    console.error('Chain or token not supported')
  }
  if (error.message.includes('max fee')) {
    console.error('Bridge fee too high')
  }
  if (error.message.includes('ton center')) {
    console.error('TON connection problem')
  }
  if (error.message.includes('non read-only account')) {
    console.error('Cannot bridge with read-only account')
  }
  if (error.message.includes('source chain')) {
    console.error('Cannot bridge to same chain')
  }
  if (error.message.includes('natively supported')) {
    console.error('Token not built in - need custom config')
  }
}
```

## Usage Examples

### Basic Bridge Operation

```javascript
import Usdt0ProtocolTon from '@tetherto/wdk-protocol-bridge-usdt0-ton'
import { WalletAccountTon } from '@tetherto/wdk-wallet-ton'

async function bridgeTokens() {
  // Create wallet account
  const account = new WalletAccountTon(seedPhrase, {
    tonApiKey: 'YOUR_TON_API_KEY',
    tonApiEndpoint: 'YOUR_TON_API_ENDPOINT'
  })
  
  // Create bridge service
  const bridgeProtocol = new Usdt0ProtocolTon(account, {
    bridgeMaxFee: 1000000000n
  })
  
  // Get quote first
  const quote = await bridgeProtocol.quoteBridge({
    targetChain: 'ethereum',
    recipient: 'RECIPIENT_ADDRESS',
    token: 'TON_TOKEN_ADDRESS',
    amount: 1000000n
  })
  
  console.log('Bridge quote:', quote)
  
  // Do bridge
  const result = await bridgeProtocol.bridge({
    targetChain: 'ethereum',
    recipient: 'RECIPIENT_ADDRESS',
    token: 'TON_TOKEN_ADDRESS',
    amount: 1000000n
  })
  
  console.log('Bridge result:', result)
  
  return result
}
```

### Multi-Chain Bridge

```javascript
async function bridgeToMultipleChains(bridgeProtocol) {
  const chains = ['ethereum', 'arbitrum', 'tron']
  const token = 'TON_TOKEN_ADDRESS'
  const amount = 1000000n
  const recipient = 'RECIPIENT_ADDRESS'
  
  const results = []
  
  for (const chain of chains) {
    try {
      // Get quote
      const quote = await bridgeProtocol.quoteBridge({
        targetChain: chain,
        recipient,
        token,
        amount
      })
      
      console.log(`Bridge to ${chain}:`, quote)
      
      // Do bridge
      const result = await bridgeProtocol.bridge({
        targetChain: chain,
        recipient,
        token,
        amount
      })
      
      results.push({ chain, result })
      console.log(`Bridge to ${chain} successful:`, result.hash)
      
    } catch (error) {
      console.error(`Bridge to ${chain} failed:`, error.message)
    }
  }
  
  return results
}
```

### Gasless Bridge

```javascript
import { WalletAccountTonGasless } from '@tetherto/wdk-wallet-ton-gasless'

async function gaslessBridge() {
  // Create gasless account
  const account = new WalletAccountTonGasless(seedPhrase, {
    tonApiKey: 'YOUR_TON_API_KEY',
    tonApiEndpoint: 'YOUR_TON_API_ENDPOINT',
    paymasterToken: 'USDT'
  })
  
  // Create bridge service
  const bridgeProtocol = new Usdt0ProtocolTon(account, {
    bridgeMaxFee: 1000000000n
  })
  
  // Bridge with no TON fees
  const result = await bridgeProtocol.bridge({
    targetChain: 'ethereum',
    recipient: 'RECIPIENT_ADDRESS',
    token: 'TON_TOKEN_ADDRESS',
    amount: 1000000n
  }, {
    paymasterToken: 'USDT' // Use USDT to pay fees
  })
  
  console.log('Gasless bridge result:', result)
  return result
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
				<strong>WDK Bridge USDT0 TON Protocol Configuration</strong>
			</td>
			<td>Get started with WDK's Bridge USDT0 TON Protocol configuration</td>
			<td>
				<a href="./configuration.md">WDK Bridge USDT0 TON Protocol Configuration</a>
			</td>
		</tr>
    <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK Bridge USDT0 TON Protocol Usage</strong>
			</td>
			<td>Get started with WDK's Bridge USDT0 TON Protocol usage</td>
			<td>
				<a href="./usage.md">WDK Bridge USDT0 TON Protocol Usage</a>
			</td>
		</tr>
	</tbody>
</table>

***

### Need Help?

{% include "../../../.gitbook/includes/support-cards.md" %}





