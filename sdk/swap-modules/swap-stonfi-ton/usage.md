---
title: Swap Stonfi TON Guides
description: How to install and use @tetherto/wdk-protocol-swap-stonfi-ton for swapping tokens on TON
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

To install the `@tetherto/wdk-protocol-swap-stonfi-ton` package, follow these steps:

```bash
npm install @tetherto/wdk-protocol-swap-stonfi-ton
```

## Quick Start

### Setting Up a Swap Service

```javascript
import StonFiProtocolTon from '@tetherto/wdk-protocol-swap-stonfi-ton'
import { WalletAccountTon } from '@tetherto/wdk-wallet-ton'

// Create a wallet account first
const account = new WalletAccountTon(seedPhrase, {
  tonApiKey: 'YOUR_TON_API_KEY',
  tonApiEndpoint: 'YOUR_TON_API_ENDPOINT'
})

// Create swap service
const swapProtocol = new StonFiProtocolTon(account, {
  swapMaxFee: 1000000000n // Optional: Max swap fee
})
```

### Basic Swap Operation

```javascript
// Swap tokens on StonFi DEX
const result = await swapProtocol.swap({
  tokenIn: 'ton', // Token to sell (use 'ton' for native TON)
  tokenOut: 'JETTON_TOKEN_ADDRESS', // Token to buy
  tokenInAmount: 1000000000n, // Amount to sell (1 TON in nanotons)
  slippageTolerance: 0.01 // 1% slippage (optional)
})

console.log('Swap transaction hash:', result.hash)
console.log('Total fee:', result.fee, 'nanotons')
console.log('Tokens sold:', result.tokenInAmount, 'nanotons')
console.log('Tokens bought:', result.tokenOutAmount)
```

### Getting Swap Quotes

```javascript
// Get cost before swapping
const quote = await swapProtocol.quoteSwap({
  tokenIn: 'JETTON_TOKEN_ADDRESS',
  tokenOut: 'ton',
  tokenInAmount: 1000000n // Amount to sell
})

console.log('Fee:', quote.fee, 'nanotons')
console.log('Tokens sold:', quote.tokenInAmount)
console.log('Tokens bought:', quote.tokenOutAmount, 'nanotons')
```

## Supported Network

### TON Blockchain
- **TON** (TON Network) - Native blockchain for StonFi DEX

## Swap Operations

### Standard TON Account

```javascript
// Swap with standard TON account
const result = await swapProtocol.swap({
  tokenIn: 'ton',
  tokenOut: 'JETTON_TOKEN_ADDRESS',
  tokenInAmount: 1000000000n,
  slippageTolerance: 0.005 // 0.5% slippage
})

console.log('Swap hash:', result.hash)
console.log('Total fee:', result.fee)
console.log('Tokens sold:', result.tokenInAmount)
console.log('Tokens bought:', result.tokenOutAmount)
```

### Gasless TON Account

```javascript
// Swap with gasless account (no TON needed for fees)
const result = await swapProtocol.swap({
  tokenIn: 'JETTON_TOKEN_ADDRESS',
  tokenOut: 'ton',
  tokenInAmount: 1000000n
}, {
  paymasterToken: 'USDT', // Token used to pay for fees
  swapMaxFee: 1000000000n // Max swap fee
})

console.log('Swap hash:', result.hash)
console.log('Total fee:', result.fee)
console.log('Tokens sold:', result.tokenInAmount)
console.log('Tokens bought:', result.tokenOutAmount)
```

### Jetton to Jetton Swap

```javascript
// Swap between two jetton tokens
const result = await swapProtocol.swap({
  tokenIn: 'USDT_TOKEN_ADDRESS',
  tokenOut: 'USDT_TOKEN_ADDRESS',
  tokenInAmount: 1000000n, // 1 USD₮ in base units
  slippageTolerance: 0.02, // 2% slippage
  to: 'RECIPIENT_ADDRESS' // Optional: where to send tokens
})

console.log('Swap hash:', result.hash)
console.log('USDT sold:', result.tokenInAmount)
console.log('USDT bought:', result.tokenOutAmount)
```

### Exact Output Swap

```javascript
// Swap to get exact amount of output tokens
const result = await swapProtocol.swap({
  tokenIn: 'ton',
  tokenOut: 'JETTON_TOKEN_ADDRESS',
  tokenOutAmount: 1000000n, // Exact amount to buy
  slippageTolerance: 0.01
})

console.log('Swap hash:', result.hash)
console.log('TON sold:', result.tokenInAmount, 'nanotons')
console.log('Tokens bought:', result.tokenOutAmount)
```

## Error Handling

```javascript
try {
  const result = await swapProtocol.swap({
    tokenIn: 'ton',
    tokenOut: 'JETTON_TOKEN_ADDRESS',
    tokenInAmount: 1000000000n
  })
  console.log('Swap successful:', result.hash)
} catch (error) {
  console.error('Swap failed:', error.message)
  
  // Handle specific errors
  if (error.message.includes('liquidity pool')) {
    console.log('No liquidity for this token pair')
  }
  if (error.message.includes('max fee')) {
    console.log('Swap fee too high')
  }
  if (error.message.includes('ton center')) {
    console.log('TON connection problem')
  }
  if (error.message.includes('read-only')) {
    console.log('Read-only account cannot swap')
  }
}
```

## Complete Examples

### Complete Swap Setup

```javascript
import StonFiProtocolTon from '@tetherto/wdk-protocol-swap-stonfi-ton'
import { WalletAccountTon } from '@tetherto/wdk-wallet-ton'

async function setupSwap() {
  // Create wallet account
  const account = new WalletAccountTon(seedPhrase, {
    tonApiKey: 'YOUR_TON_API_KEY',
    tonApiEndpoint: 'YOUR_TON_API_ENDPOINT'
  })
  
  // Create swap service
  const swapProtocol = new StonFiProtocolTon(account, {
    swapMaxFee: 1000000000n
  })
  
  // Check account balance
  const address = await account.getAddress()
  const balance = await account.getBalance()
  console.log('Account:', address)
  console.log('Balance:', balance, 'nanotons')
  
  return { account, swapProtocol }
}
```

### Multiple Token Swaps

```javascript
async function swapMultipleTokens(swapProtocol) {
  const swaps = [
    { tokenIn: 'ton', tokenOut: 'USDT_ADDRESS', amount: 1000000000n },
    { tokenIn: 'USDT_ADDRESS', tokenOut: 'USDT_ADDRESS', amount: 1000000n },
    { tokenIn: 'USDT_ADDRESS', tokenOut: 'ton', amount: 1000000n }
  ]
  
  for (const swap of swaps) {
    try {
      // Get quote first
      const quote = await swapProtocol.quoteSwap({
        tokenIn: swap.tokenIn,
        tokenOut: swap.tokenOut,
        tokenInAmount: swap.amount
      })
      
      console.log(`Swap ${swap.tokenIn} to ${swap.tokenOut}:`)
      console.log('  Fee:', quote.fee, 'nanotons')
      console.log('  Tokens in:', quote.tokenInAmount)
      console.log('  Tokens out:', quote.tokenOutAmount)
      
      // Do swap
      const result = await swapProtocol.swap({
        tokenIn: swap.tokenIn,
        tokenOut: swap.tokenOut,
        tokenInAmount: swap.amount,
        slippageTolerance: 0.01
      })
      
      console.log(`  Transaction hash: ${result.hash}`)
      
    } catch (error) {
      console.error(`Swap ${swap.tokenIn} to ${swap.tokenOut} failed:`, error.message)
    }
  }
}
```

### Swap with Checks

```javascript
async function swapWithChecks(swapProtocol, tokenIn, tokenOut, amount) {
  try {
    // Check if we have enough balance (for TON)
    if (tokenIn === 'ton') {
      const balance = await swapProtocol._account.getBalance()
      if (balance < amount + 100000000n) { // Keep 0.1 TON for fees
        throw new Error('Not enough TON balance')
      }
    }
    
    // Get quote first
    const quote = await swapProtocol.quoteSwap({
      tokenIn,
      tokenOut,
      tokenInAmount: amount
    })
    
    console.log('Swap quote:')
    console.log('  Fee:', quote.fee, 'nanotons')
    console.log('  Tokens in:', quote.tokenInAmount)
    console.log('  Tokens out:', quote.tokenOutAmount)
    
    // Check if fees are OK
    if (quote.fee > 500000000n) {
      throw new Error('Fees too high')
    }
    
    // Check if we get enough tokens out
    const minOutput = amount * 95n / 100n // At least 95% of input value
    if (tokenIn === 'ton' && tokenOut === 'ton') {
      if (quote.tokenOutAmount < minOutput) {
        throw new Error('Output too low')
      }
    }
    
    // Do swap
    const result = await swapProtocol.swap({
      tokenIn,
      tokenOut,
      tokenInAmount: amount,
      slippageTolerance: 0.01
    })
    
    console.log('Swap successful:', result.hash)
    return result
    
  } catch (error) {
    console.error('Swap check failed:', error.message)
    throw error
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
				<strong>WDK Stonfi Swap Protocol Configuration</strong>
			</td>
			<td>Get started with WDK's Stonfi Swap Protocol configuration</td>
			<td>
				<a href="./configuration.md">WDK Stonfi Swap Protocol Configuration</a>
			</td>
		</tr>
        <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK Stonfi Swap Protocol API</strong>
			</td>
			<td>Get started with WDK's Stonfi Swap Protocol API</td>
			<td>
				<a href="./api-reference.md">WDK Stonfi Swap Protocol API</a>
			</td>
	</tbody>
</table>

***

### Need Help?

{% include "../../../.gitbook/includes/support-cards.md" %}


