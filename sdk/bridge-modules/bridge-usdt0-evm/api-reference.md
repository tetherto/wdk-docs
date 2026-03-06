---
title: Bridge USD₮0 EVM API Reference
description: Complete API documentation for @tetherto/wdk-protocol-bridge-usdt0-evm
icon: code
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
| [Usdt0ProtocolEvm](#usdt0protocolevm) | Main class for bridging USD₮0 tokens across blockchains. Extends `BridgeProtocol` from `@tetherto/wdk-wallet/protocols`. | [Constructor](#constructor), [Methods](#methods) |

## Usdt0ProtocolEvm

The main class for bridging USD₮0 tokens across different blockchains using the LayerZero protocol.  
Extends `BridgeProtocol` from `@tetherto/wdk-wallet/protocols`.

### Constructor

```javascript
new Usdt0ProtocolEvm(account, config?)
```

**Parameters:**
- `account` (WalletAccountEvm | WalletAccountEvmErc4337 | WalletAccountReadOnlyEvm | WalletAccountReadOnlyEvmErc4337): The wallet account to use for bridge operations
- `config` (BridgeProtocolConfig, optional): Configuration object
  - `bridgeMaxFee` (number | bigint, optional): Maximum total bridge cost in wei

**Example:**
```javascript
import Usdt0ProtocolEvm from '@tetherto/wdk-protocol-bridge-usdt0-evm'
import { WalletAccountEvm } from '@tetherto/wdk-wallet-evm'

const account = new WalletAccountEvm(seedPhrase, "0'/0/0", {
  provider: 'https://eth.drpc.org'
})

const bridgeProtocol = new Usdt0ProtocolEvm(account, {
  bridgeMaxFee: 1000000000000000n // Maximum bridge fee in wei
})
```

### Methods

| Method | Description | Returns | Throws |
|--------|-------------|---------|--------|
| `bridge(options, config?)` | Bridges tokens to another blockchain | `Promise<BridgeResult>` | If no provider or fee exceeds max |
| `quoteBridge(options, config?)` | Estimates the cost of a bridge operation | `Promise<Omit<BridgeResult, 'hash'>>` | If no provider |

#### `bridge(options, config?)`
Bridges tokens to a different blockchain using the USD₮0 protocol.

**Parameters:**
- `options` (BridgeOptions): Bridge operation options
  - `targetChain` (string): Destination chain name
  - `recipient` (string): Address that will receive the bridged tokens (EVM hex address, Solana base58 address, TON address, or TRON address)
  - `token` (string): Token contract address on source chain
  - `amount` (number | bigint): Amount to bridge in token base units
  - `oftContractAddress` (string, optional): Custom OFT contract address to use instead of auto-resolving from the source chain
  - `dstEid` (number, optional): Custom LayerZero destination endpoint ID override
- `config` (Pick<EvmErc4337WalletConfig, 'paymasterToken'> & Pick<BridgeProtocolConfig, 'bridgeMaxFee'>, optional): Override configuration for ERC-4337 accounts
  - `paymasterToken` ({ address: string }, optional): Paymaster token configuration for gas fees
  - `bridgeMaxFee` (number | bigint, optional): Override maximum bridge fee

**Returns:** `Promise<BridgeResult>` - Bridge operation result

**Throws:**
- Error if account is read-only
- Error if no provider is configured
- Error if bridge fee exceeds maximum allowed

**Example:**
```javascript
// Standard EVM account
const result = await bridgeProtocol.bridge({
  targetChain: 'arbitrum',
  recipient: '0x...', // Recipient address
  token: '0x...', // ₮ contract address
  amount: 1000000n
})

console.log('Bridge hash:', result.hash)
console.log('Approve hash:', result.approveHash)
console.log('Reset allowance hash:', result.resetAllowanceHash) // Only for USDT on Ethereum
console.log('Total fee:', result.fee)
console.log('Bridge fee:', result.bridgeFee)

// ERC-4337 account
const result2 = await bridgeProtocol.bridge({
  targetChain: 'arbitrum',
  recipient: '0x...', // Recipient address
  token: '0x...', // USDT contract address
  amount: 1000000n
}, {
  paymasterToken: { address: '0x...' }, // Paymaster token configuration
  bridgeMaxFee: 1000000000000000n
})

console.log('Bridge hash:', result2.hash) // Single hash for bundled operations
console.log('Total fee:', result2.fee)
console.log('Bridge fee:', result2.bridgeFee)
```

#### `quoteBridge(options, config?)`
Estimates the cost of a bridge operation without executing it.

**Parameters:**
- `options` (BridgeOptions): Bridge operation options (same as bridge method)
- `config` (Pick<EvmErc4337WalletConfig, 'paymasterToken'>, optional): Override configuration for ERC-4337 accounts
  - `paymasterToken` ({ address: string }, optional): Paymaster token configuration for gas fees

**Returns:** `Promise<Omit<BridgeResult, 'hash'>>` - Bridge cost estimate

**Throws:** Error if no provider is configured

**Example:**
```javascript
const quote = await bridgeProtocol.quoteBridge({
  targetChain: 'polygon',
  recipient: '0x...', // Recipient address
  token: '0x...', // USDT contract address
  amount: 1000000n
})

console.log('Estimated fee:', quote.fee, 'wei')
console.log('Bridge fee:', quote.bridgeFee, 'wei')

// Check if fees are acceptable
if (quote.fee + quote.bridgeFee > 1000000000000000n) {
  console.log('Bridge fees too high')
} else {
  // Proceed with bridge
  const result = await bridgeProtocol.bridge({
    targetChain: 'polygon',
    recipient: '0x...', // Recipient address
    token: '0x...', // USDT contract address
    amount: 1000000n
  })
}
```

## Types

### BridgeOptions

```typescript
interface BridgeOptions {
  targetChain: string;              // Destination chain name
  recipient: string;                // Address that will receive bridged tokens
  token: string;                    // Token contract address on source chain
  amount: number | bigint;          // Amount to bridge in token base units
  oftContractAddress?: string;      // Optional custom OFT contract address
  dstEid?: number;                  // Optional destination endpoint ID override
}
```

### BridgeResult

```typescript
interface BridgeResult {
  hash: string;                     // Main bridge transaction hash
  fee: bigint;                      // Total gas cost in wei
  bridgeFee: bigint;                // Bridge protocol fee in wei
  approveHash?: string;             // Approve transaction hash (standard accounts only)
  resetAllowanceHash?: string;      // Reset allowance hash (USDT on Ethereum only)
}
```

### BridgeProtocolConfig

```typescript
interface BridgeProtocolConfig {
  bridgeMaxFee?: number | bigint;    // Maximum total bridge cost in wei
}
```

### EvmErc4337WalletConfig

```typescript
interface EvmErc4337WalletConfig {
  paymasterToken?: {                // Token to use for paying gas fees
    address: string;
  };
}
```

### Supported Chains

The bridge protocol supports the following chains:

**Source Chains (EVM):**
- `'ethereum'` (Chain ID: 1)
- `'arbitrum'` (Chain ID: 42161) - ERC-4337 support
- `'optimism'` (Chain ID: 10)
- `'polygon'` (Chain ID: 137)
- `'berachain'` (Chain ID: 80094)
- `'ink'` (Chain ID: 57073)
- `'plasma'` (Chain ID: 9745)
- `'conflux'` (Chain ID: 1030)
- `'corn'` (Chain ID: 21000000)
- `'avalanche'` (Chain ID: 43114)
- `'celo'` (Chain ID: 42220)
- `'flare'` (Chain ID: 14)
- `'hyperevm'` (Chain ID: 999)
- `'mantle'` (Chain ID: 5000)
- `'megaeth'` (Chain ID: 4326)
- `'monad'` (Chain ID: 143)
- `'morph'` (Chain ID: 2818)
- `'rootstock'` (Chain ID: 30)
- `'sei'` (Chain ID: 1329)
- `'stable'` (Chain ID: 988)
- `'unichain'` (Chain ID: 130)
- `'xlayer'` (Chain ID: 196)

**Destination Chains:**
- **EVM destinations**: same as source-chain set above
- `'solana'` (EID: 30168)
- `'ton'` (EID: 30343)
- `'tron'` (EID: 30420)

## Error Handling

The bridge protocol throws specific errors for different failure cases:

```javascript
try {
  const result = await bridgeProtocol.bridge({
    targetChain: 'arbitrum',
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
  if (error.message.includes('requires the protocol to be initialized with a non read-only account')) {
    console.error('Cannot bridge with read-only account')
  }
  if (error.message.includes('cannot be equal to the source chain')) {
    console.error('Cannot bridge to the same chain')
  }
}
```

## Usage Examples

### Basic Bridge Operation

```javascript
import Usdt0ProtocolEvm from '@tetherto/wdk-protocol-bridge-usdt0-evm'
import { WalletAccountEvm } from '@tetherto/wdk-wallet-evm'

async function bridgeTokens() {
  // Create wallet account
  const account = new WalletAccountEvm(seedPhrase, "0'/0/0", {
    provider: 'https://eth.drpc.org'
  })
  
  // Create bridge protocol
  const bridgeProtocol = new Usdt0ProtocolEvm(account, {
    bridgeMaxFee: 1000000000000000n
  })
  
  // Get quote first
  const quote = await bridgeProtocol.quoteBridge({
    targetChain: 'arbitrum',
    recipient: '0x...', // Recipient address
    token: '0x...', // USDT contract address
    amount: 1000000n
  })
  
  console.log('Bridge quote:', quote)
  
  // Execute bridge
  const result = await bridgeProtocol.bridge({
    targetChain: 'arbitrum',
    recipient: '0x...', // Recipient address
    token: '0x...', // USDT contract address
    amount: 1000000n
  })
  
  console.log('Bridge result:', result)
  
  return result
}
```

### Multi-Chain Bridge

```javascript
async function bridgeToMultipleChains(bridgeProtocol) {
  const chains = ['arbitrum', 'polygon', 'ethereum']
  const token = '0x...' // USDT contract address
  const amount = 1000000n
  const recipient = '0x...' // Recipient address
  
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
      
      // Execute bridge
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

### ERC-4337 Gasless Bridge

```javascript
import { WalletAccountEvmErc4337 } from '@tetherto/wdk-wallet-evm-erc-4337'

async function gaslessBridge() {
  // Create ERC-4337 account
  const account = new WalletAccountEvmErc4337(seedPhrase, "0'/0/0", {
    chainId: 42161,
    provider: 'https://arb1.arbitrum.io/rpc',
    bundlerUrl: 'https://api.candide.dev/public/v3/arbitrum',
    entryPointAddress: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
    safeModulesVersion: '0.3.0',
    paymasterUrl: 'https://api.candide.dev/public/v3/arbitrum',
    paymasterAddress: '0x8b1f6cb5d062aa2ce8d581942bbb960420d875ba',
    paymasterToken: { address: '0x...' } // Paymaster token configuration
  })
  
  // Create bridge protocol
  const bridgeProtocol = new Usdt0ProtocolEvm(account, {
    bridgeMaxFee: 1000000000000000n
  })
  
  // Bridge with gasless transactions
  const result = await bridgeProtocol.bridge({
    targetChain: 'polygon',
    recipient: '0x...', // Recipient address
    token: '0x...', // USDT contract address
    amount: 1000000n
  }, {
    paymasterToken: { address: '0x...' } // Paymaster token configuration
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
				<strong>WDK Bridge USD₮0 EVM Protocol Configuration</strong>
			</td>
			<td>Get started with WDK's Bridge USD₮0 EVM Protocol configuration</td>
			<td>
				<a href="./configuration.md">WDK Bridge USD₮0 EVM Protocol Configuration</a>
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


