---
title: Swap Stonfi TON API Reference
description: Complete API documentation for @tetherto/wdk-protocol-swap-stonfi-ton
author: Raquel Carrasco Gonzalez
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
| [StonFiProtocolTon](#stonfiprotocolton) | Main class for swapping tokens on StonFi DEX on TON blockchain. Extends `SwapProtocol` from `@tetherto/wdk-wallet/protocols`. | [Constructor](#constructor) - Creates swap service<br/>[swap(options, config?)](#swapoptions-config) - Swaps tokens on StonFi DEX<br/>[quoteSwap(options, config?)](#quoteswapoptions-config) - Gets the cost of a swap operation without doing it |

## StonFiProtocolTon

The main class for swapping tokens on StonFi DEX on TON blockchain.  
Extends `SwapProtocol` from `@tetherto/wdk-wallet/protocols`.

### Constructor

```javascript
new StonFiProtocolTon(account, config?)
```

**Parameters:**
- `account` (WalletAccountTon | WalletAccountTonGasless | WalletAccountReadOnlyTon | WalletAccountReadOnlyTonGasless): The wallet account to use for swap operations
- `config` (SwapProtocolConfig, optional): Configuration object
  - `swapMaxFee` (bigint, optional): Maximum total swap cost in nanotons

**Example:**
```javascript
import StonFiProtocolTon from '@tetherto/wdk-protocol-swap-stonfi-ton'
import { WalletAccountTon } from '@tetherto/wdk-wallet-ton'

const account = new WalletAccountTon(seedPhrase, {
  tonApiKey: 'YOUR_TON_API_KEY',
  tonApiEndpoint: 'YOUR_TON_API_ENDPOINT'
})

const swapProtocol = new StonFiProtocolTon(account, {
  swapMaxFee: 1000000000n // Maximum swap fee in nanotons
})
```

### Methods

| Method | Description | Returns | Throws |
|--------|-------------|---------|--------|
| `swap(options, config?)` | Swaps tokens on StonFi DEX | `Promise<SwapResult>` | If no TON connection or fee exceeds max |
| `quoteSwap(options, config?)` | Gets the cost of a swap operation | `Promise<Omit<SwapResult, 'hash'>>` | If no TON connection |

#### `swap(options, config?)`
Swaps tokens on StonFi DEX using the StonFi protocol.

**Parameters:**
- `options` (StonFiSwapOptions): Swap operation options
  - `tokenIn` (string): Token to sell (use `'ton'` for native TON or jetton address)
  - `tokenOut` (string): Token to buy (use `'ton'` for native TON or jetton address)
  - `tokenInAmount` (bigint, optional): Amount to sell in token base units
  - `tokenOutAmount` (bigint, optional): Exact amount to buy in token base units
  - `slippageTolerance` (number, optional): Max price change allowed (default: 0.0001 = 0.01%)
  - `to` (string, optional): Address to send bought tokens (default: your address)
- `config` (Pick<TonGaslessWalletConfig, 'paymasterToken'> & Pick<SwapProtocolConfig, 'swapMaxFee'>, optional): Override settings for gasless accounts
  - `paymasterToken` (string, optional): Token to use for paying fees
  - `swapMaxFee` (bigint, optional): Override maximum swap fee

**Returns:** `Promise<SwapResult>` - Swap operation result

**Throws:**
- Error if account is read-only
- Error if no TON connection is set up
- Error if swap fee goes over maximum allowed
- Error if no liquidity pool found for token pair
- Error if gasless account tries to swap native TON

**Example:**
```javascript
// Standard TON account - TON to jetton
const result = await swapProtocol.swap({
  tokenIn: 'ton',
  tokenOut: 'JETTON_TOKEN_ADDRESS',
  tokenInAmount: 1000000000n, // 1 TON
  slippageTolerance: 0.01 // 1%
})

console.log('Swap hash:', result.hash)
console.log('Total fee:', result.fee)
console.log('Tokens sold:', result.tokenInAmount)
console.log('Tokens bought:', result.tokenOutAmount)

// Gasless TON account - jetton to jetton only
const result2 = await swapProtocol.swap({
  tokenIn: 'USDT_TOKEN_ADDRESS',
  tokenOut: 'USDT_TOKEN_ADDRESS',
  tokenInAmount: 1000000n // 1 USDT
}, {
  paymasterToken: 'USDT', // Token used to pay fees
  swapMaxFee: 1000000000n
})

console.log('Swap hash:', result2.hash)
console.log('Total fee:', result2.fee)
console.log('Tokens sold:', result2.tokenInAmount)
console.log('Tokens bought:', result2.tokenOutAmount)

// Exact output swap
const result3 = await swapProtocol.swap({
  tokenIn: 'ton',
  tokenOut: 'JETTON_TOKEN_ADDRESS',
  tokenOutAmount: 1000000n, // Exact amount to buy
  slippageTolerance: 0.005 // 0.5%
})

console.log('TON sold:', result3.tokenInAmount, 'nanotons')
console.log('Tokens bought:', result3.tokenOutAmount)
```

#### `quoteSwap(options, config?)`
Gets the cost of a swap operation without doing it.

**Parameters:**
- `options` (StonFiSwapOptions): Swap operation options (same as swap method)
- `config` (Pick<TonGaslessWalletConfig, 'paymasterToken'>, optional): Override settings for gasless accounts
  - `paymasterToken` (string, optional): Token to use for paying fees

**Returns:** `Promise<Omit<SwapResult, 'hash'>>` - Swap cost estimate

**Throws:** Error if no TON connection is set up

**Example:**
```javascript
const quote = await swapProtocol.quoteSwap({
  tokenIn: 'ton',
  tokenOut: 'JETTON_TOKEN_ADDRESS',
  tokenInAmount: 1000000000n
})

console.log('Fee:', quote.fee, 'nanotons')
console.log('Tokens sold:', quote.tokenInAmount, 'nanotons')
console.log('Tokens bought:', quote.tokenOutAmount)

// Check if swap is good
if (quote.fee > 500000000n) {
  console.log('Swap fees too high')
} else {
  // Do swap
  const result = await swapProtocol.swap({
    tokenIn: 'ton',
    tokenOut: 'JETTON_TOKEN_ADDRESS',
    tokenInAmount: 1000000000n
  })
}
```

## Types

### StonFiSwapOptions

```typescript
interface StonFiSwapOptions {
  tokenIn: string;                      // Token to sell
  tokenOut: string;                     // Token to buy
  tokenInAmount?: bigint;               // Amount to sell (use this OR tokenOutAmount)
  tokenOutAmount?: bigint;              // Exact amount to buy (use this OR tokenInAmount)
  slippageTolerance?: number;           // Max price change (default: 0.0001)
  to?: string;                          // Where to send bought tokens (optional)
}
```

### SwapResult

```typescript
interface SwapResult {
  hash: string;                         // Swap transaction hash
  fee: bigint;                          // Total cost in nanotons
  tokenInAmount: bigint;                // Actual tokens sold in base units
  tokenOutAmount: bigint;               // Actual tokens bought in base units
}
```

### SwapProtocolConfig

```typescript
interface SwapProtocolConfig {
  swapMaxFee?: bigint;                  // Maximum total swap cost in nanotons
}
```

### TonGaslessWalletConfig

```typescript
interface TonGaslessWalletConfig {
  paymasterToken?: string;              // Token to use for paying fees
}
```

## Supported Network

The swap service supports TON blockchain:

**Source and Target Network:**
- `'ton'` - TON blockchain with StonFi DEX

**Token Support:**
- Native TON (use `'ton'` string)
- All jetton tokens available on StonFi DEX
- Token addresses are TON jetton contract addresses

**Note:** Gasless accounts can only swap jetton-to-jetton pairs. TON-to-jetton and jetton-to-TON swaps need standard accounts.

## Error Handling

The swap service throws specific errors for different problems:

```javascript
try {
  const result = await swapProtocol.swap({
    tokenIn: 'ton',
    tokenOut: 'JETTON_TOKEN_ADDRESS',
    tokenInAmount: 1000000000n
  })
} catch (error) {
  if (error.message.includes('liquidity pool')) {
    console.error('No liquidity for this token pair')
  }
  if (error.message.includes('max fee')) {
    console.error('Swap fee too high')
  }
  if (error.message.includes('ton center')) {
    console.error('TON connection problem')
  }
  if (error.message.includes('non read-only account')) {
    console.error('Cannot swap with read-only account')
  }
  if (error.message.includes('gasless')) {
    console.error('Gasless accounts cannot swap TON')
  }
}
```

## Usage Examples

### Basic Swap Operation

```javascript
import StonFiProtocolTon from '@tetherto/wdk-protocol-swap-stonfi-ton'
import { WalletAccountTon } from '@tetherto/wdk-wallet-ton'

async function swapTokens() {
  // Create wallet account
  const account = new WalletAccountTon(seedPhrase, {
    tonApiKey: 'YOUR_TON_API_KEY',
    tonApiEndpoint: 'YOUR_TON_API_ENDPOINT'
  })
  
  // Create swap service
  const swapProtocol = new StonFiProtocolTon(account, {
    swapMaxFee: 1000000000n
  })
  
  // Get quote first
  const quote = await swapProtocol.quoteSwap({
    tokenIn: 'ton',
    tokenOut: 'JETTON_TOKEN_ADDRESS',
    tokenInAmount: 1000000000n
  })
  
  console.log('Swap quote:', quote)
  
  // Do swap
  const result = await swapProtocol.swap({
    tokenIn: 'ton',
    tokenOut: 'JETTON_TOKEN_ADDRESS',
    tokenInAmount: 1000000000n,
    slippageTolerance: 0.01
  })
  
  console.log('Swap result:', result)
  
  return result
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
  
  const results = []
  
  for (const swap of swaps) {
    try {
      // Get quote
      const quote = await swapProtocol.quoteSwap({
        tokenIn: swap.tokenIn,
        tokenOut: swap.tokenOut,
        tokenInAmount: swap.amount
      })
      
      console.log(`Swap ${swap.tokenIn} to ${swap.tokenOut}:`, quote)
      
      // Do swap
      const result = await swapProtocol.swap({
        tokenIn: swap.tokenIn,
        tokenOut: swap.tokenOut,
        tokenInAmount: swap.amount,
        slippageTolerance: 0.01
      })
      
      results.push({ swap, result })
      console.log(`Swap ${swap.tokenIn} to ${swap.tokenOut} successful:`, result.hash)
      
    } catch (error) {
      console.error(`Swap ${swap.tokenIn} to ${swap.tokenOut} failed:`, error.message)
    }
  }
  
  return results
}
```

### Gasless Swap

```javascript
import { WalletAccountTonGasless } from '@tetherto/wdk-wallet-ton-gasless'

async function gaslessSwap() {
  // Create gasless account
  const account = new WalletAccountTonGasless(seedPhrase, {
    tonApiKey: 'YOUR_TON_API_KEY',
    tonApiEndpoint: 'YOUR_TON_API_ENDPOINT',
    paymasterToken: 'USDT'
  })
  
  // Create swap service
  const swapProtocol = new StonFiProtocolTon(account, {
    swapMaxFee: 1000000000n
  })
  
  // Swap jetton to jetton with no TON fees
  const result = await swapProtocol.swap({
    tokenIn: 'USDT_TOKEN_ADDRESS',
    tokenOut: 'USDT_TOKEN_ADDRESS',
    tokenInAmount: 1000000n
  }, {
    paymasterToken: 'USDT' // Use USDT to pay fees
  })
  
  console.log('Gasless swap result:', result)
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
				<strong>WDK Stonfi Swap Protocol Usage</strong>
			</td>
			<td>Get started with WDK's Stonfi Swap Protocol usage</td>
			<td>
				<a href="./usage.md">WDK Stonfi Swap Protocol  Usage</a>
			</td>
		</tr>
	</tbody>
</table>

***

### Need Help?

{% include "../../../.gitbook/includes/support-cards.md" %}

