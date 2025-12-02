---
title: Swap velora EVM Guides
description: How to install and use @tetherto/wdk-protocol-swap-velora-evm for swapping tokens on EVM
icon: book-open
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

## Installation

To install the `@tetherto/wdk-protocol-swap-velora-evm` package, run:

```bash
npm install @tetherto/wdk-protocol-swap-velora-evm
```

## Quick Start

### Setting Up a Swap Service

```javascript
import veloraProtocolEvm from '@tetherto/wdk-protocol-swap-velora-evm'
import { WalletAccountEvm } from '@tetherto/wdk-wallet-evm'

// Create a wallet account first
const account = new WalletAccountEvm(seedPhrase, "0'/0/0", {
  provider: 'https://ethereum-rpc.publicnode.com'
})

// Create swap service
const swapProtocol = new veloraProtocolEvm(account, {
  swapMaxFee: 200000000000000n // Optional: Max swap fee (wei)
})
```

### Basic Swap Operation

```javascript
// Swap tokens via velora (USD₮ -> WETH)
const result = await swapProtocol.swap({
  tokenIn: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USD₮
  tokenOut: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
  tokenInAmount: 1000000n // 1 USD₮ in base units (6 decimals)
})

console.log('Swap transaction hash:', result.hash)
console.log('Total fee (wei):', result.fee)
console.log('Tokens sold (base units):', result.tokenInAmount)
console.log('Tokens bought (base units):', result.tokenOutAmount)
```

### Getting Swap Quotes

```javascript
// Get cost before swapping (USD₮ -> WETH)
const quote = await swapProtocol.quoteSwap({
  tokenIn: '0xdAC17F...ec7', // USD₮
  tokenOut: '0xC02a...6Cc2', // WETH
  tokenInAmount: 1000000n
})

console.log('Estimated fee (wei):', quote.fee)
console.log('Tokens in (base units):', quote.tokenInAmount)
console.log('Tokens out (base units):', quote.tokenOutAmount)
```

## Supported Networks

### EVM Networks
- **Ethereum**, **Polygon**, **Arbitrum**, and others supported by velora

## Swap Operations

### Standard EVM Account

```javascript
// Swap with standard EVM account
const result = await swapProtocol.swap({
  tokenIn: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
  tokenOut: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USD₮
  tokenInAmount: 1000000000000000000n // 1 WETH (18 decimals)
})

console.log('Swap hash:', result.hash)
console.log('Total fee (wei):', result.fee)
console.log('Tokens sold:', result.tokenInAmount)
console.log('Tokens bought:', result.tokenOutAmount)
```

### ERC‑4337 Smart Account

```javascript
import { WalletAccountEvmErc4337 } from '@tetherto/wdk-wallet-evm-erc-4337'

const aa = new WalletAccountEvmErc4337(seedPhrase, "0'/0/0", {
  chainId: 1,
  provider: 'https://arb1.arbitrum.io/rpc',
  bundlerUrl: 'YOUR_BUNDLER_URL',
  paymasterUrl: 'YOUR_PAYMASTER_URL'
})

const swapAA = new veloraProtocolEvm(aa, { swapMaxFee: 200000000000000n })

const result = await swapAA.swap({
  tokenIn: '0xdAC17F...ec7', // USD₮
  tokenOut: '0xC02a...6Cc2', // WETH
  tokenInAmount: 1000000n
}, {
  paymasterToken: 'USDT',
  swapMaxFee: 200000000000000n
})

console.log('Swap hash:', result.hash)
console.log('Total fee (wei):', result.fee)
console.log('Tokens sold:', result.tokenInAmount)
console.log('Tokens bought:', result.tokenOutAmount)
```

### Exact Output Swap

```javascript
// Receive an exact amount of output tokens (WETH)
const result = await swapProtocol.swap({
  tokenIn: '0xdAC17F...ec7',
  tokenOut: '0xC02a...6Cc2',
  tokenOutAmount: 500000000000000000n // 0.5 WETH
})

console.log('Swap hash:', result.hash)
console.log('Tokens sold (base units):', result.tokenInAmount)
console.log('Tokens bought (base units):', result.tokenOutAmount)
```

## Error Handling

```javascript
try {
  const result = await swapProtocol.swap({
    tokenIn: '0xTokenIn',
    tokenOut: '0xBadToken',
    tokenInAmount: 1000000n
  })
  console.log('Swap successful:', result.hash)
} catch (error) {
  console.error('Swap failed:', error.message)

  if (error.message.includes('liquidity')) {
    console.log('No route / insufficient liquidity for this pair')
  }
  if (error.message.includes('max fee')) {
    console.log('Swap fee too high')
  }
  if (error.message.includes('read-only')) {
    console.log('Read-only account cannot swap')
  }
}
```

## Complete Examples

### Complete Swap Setup

```javascript
import veloraProtocolEvm from '@tetherto/wdk-protocol-swap-velora-evm'
import { WalletAccountEvm } from '@tetherto/wdk-wallet-evm'

async function setupSwap() {
  // Create wallet account
  const account = new WalletAccountEvm(seedPhrase, "0'/0/0", {
    provider: 'https://ethereum-rpc.publicnode.com'
  })

  // Create swap service
  const swapProtocol = new veloraProtocolEvm(account, {
    swapMaxFee: 200000000000000n
  })

  // Check account
  const address = await account.getAddress()
  const balance = await account.getBalance()
  console.log('Account:', address)
  console.log('Balance (wei):', balance)

  return { account, swapProtocol }
}
```

### Multiple Token Swaps

```javascript
async function swapMultipleTokens(swapProtocol) {
  const swaps = [
    { tokenIn: '0xdAC17F...ec7', tokenOut: '0xC02a...6Cc2', amount: 1000000n }, // USD₮ -> WETH
    { tokenIn: '0xC02a...6Cc2', tokenOut: '0xdAC17F...ec7', amount: 200000000000000000n }, // WETH -> USD₮
  ]

  for (const s of swaps) {
    try {
      const quote = await swapProtocol.quoteSwap({
        tokenIn: s.tokenIn,
        tokenOut: s.tokenOut,
        tokenInAmount: s.amount
      })

      console.log(`Swap ${s.tokenIn} → ${s.tokenOut}: fee ${quote.fee}, out ${quote.tokenOutAmount}`)

      const result = await swapProtocol.swap({
        tokenIn: s.tokenIn,
        tokenOut: s.tokenOut,
        tokenInAmount: s.amount
      })

      console.log('Tx hash:', result.hash)
    } catch (e) {
      console.error(`Swap ${s.tokenIn} → ${s.tokenOut} failed:`, e.message)
    }
  }
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
				<strong>WDK velora Swap Protocol Configuration</strong>
			</td>
			<td>Get started with WDK's velora Swap Protocol configuration</td>
			<td>
				<a href="./configuration.md">WDK velora Swap Protocol Configuration</a>
			</td>
		</tr>
        <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK velora Swap Protocol API</strong>
			</td>
			<td>Get started with WDK's velora Swap Protocol API</td>
			<td>
				<a href="./api-reference.md">WDK velora Swap Protocol API</a>
			</td>
		</tr>
	</tbody>
</table>

***

### Need Help?

{% include "../../../.gitbook/includes/support-cards.md" %}




