---
title: Swap velora EVM Configuration
description: Configuration options and settings for @tetherto/wdk-protocol-swap-velora-evm
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

## Swap Service Configuration

The `VeloraProtocolEvm` accepts a configuration object that defines fee controls and behavior:

```javascript
import VeloraProtocolEvm from '@tetherto/wdk-protocol-swap-velora-evm'
import { WalletAccountEvm } from '@tetherto/wdk-wallet-evm'

// Create wallet account first
const account = new WalletAccountEvm(seedPhrase, "0'/0/0", {
  provider: 'https://ethereum-rpc.publicnode.com'
})

// Create swap service with configuration
const swapProtocol = new VeloraProtocolEvm(account, {
  swapMaxFee: 200000000000000n // Optional: Max swap fee in wei
})
```

## Account Configuration

The swap service uses the wallet account configuration for network access and signing:

```javascript
import { WalletAccountEvm, WalletAccountReadOnlyEvm } from '@tetherto/wdk-wallet-evm'

// Full access account
const account = new WalletAccountEvm(
  seedPhrase,
  "0'/0/0",
  {
    provider: 'https://ethereum-rpc.publicnode.com'
  }
)

// Read-only account (quotes only)
const readOnly = new WalletAccountReadOnlyEvm(
  '0xYourAddress',
  {
    provider: 'https://ethereum-rpc.publicnode.com'
  }
)

// Create swap service
const swapProtocol = new VeloraProtocolEvm(account, {
  swapMaxFee: 200000000000000n
})
```

## Configuration Options

### Swap Max Fee

The `swapMaxFee` option sets an upper bound for total gas costs to prevent excessive fees.

**Type:** `number | bigint` (optional)  
**Unit:** Wei

**Examples:**

```javascript
const config = {
  // Cap total gas fee to 0.0002 ETH (in wei)
  swapMaxFee: 200000000000000n,
}

// Usage example
try {
  const result = await swapProtocol.swap({
    tokenIn: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USD₮ (6 decimals)
    tokenOut: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH (18 decimals)
    tokenInAmount: 1000000n
  })
} catch (error) {
  if (error.message.includes('max fee')) {
    console.error('Swap stopped: Fee too high')
  }
}
```

## ERC‑4337 (Account Abstraction) Configuration

When using ERC‑4337 smart accounts (`@tetherto/wdk-wallet-evm-erc-4337`), you can override fee behavior per swap and specify a paymaster token:

```javascript
import { WalletAccountEvmErc4337 } from '@tetherto/wdk-wallet-evm-erc-4337'

const aa = new WalletAccountEvmErc4337(seedPhrase, "0'/0/0", {
  chainId: 1,
  provider: 'https://arb1.arbitrum.io/rpc',
  bundlerUrl: 'YOUR_BUNDLER_URL',
  paymasterUrl: 'YOUR_PAYMASTER_URL'
})

const swapAA = new VeloraProtocolEvm(aa, { swapMaxFee: 200000000000000n })

const result = await swapAA.swap({
  tokenIn: '0xTokenIn',
  tokenOut: '0xTokenOut',
  tokenInAmount: 1000000n
}, {
  paymasterToken: 'USDT', // Token used to pay for gas
  swapMaxFee: 200000000000000n // Per‑swap override
})
```

### Paymaster Token (ERC‑4337)

The `paymasterToken` option indicates which token the paymaster should use to sponsor gas.

**Type:** `string` (optional)  
**Format:** Token symbol or address

**Example:**

```javascript
const result = await swapAA.swap({
  tokenIn: '0xdAC17F...ec7',
  tokenOut: '0xC02a...6Cc2', // WETH
  tokenInAmount: 1000000n
}, {
  paymasterToken: 'USDT'
})
```

## Network Support

velora supports multiple EVM networks (e.g., Ethereum, Polygon, Arbitrum). Ensure your account is configured with a valid provider for the target network.

```javascript
// Ethereum Mainnet
const eth = new WalletAccountEvm(seedPhrase, "0'/0/0", {
  provider: 'https://ethereum-rpc.publicnode.com'
})

// Polygon
const polygon = new WalletAccountEvm(seedPhrase, "0'/0/0", {
  provider: 'https://polygon-bor-rpc.publicnode.com'
})
```

## Swap Options

When calling `swap`, provide the swap parameters:

```javascript
const swapOptions = {
  tokenIn: '0xTokenIn',          // ERC‑20 to sell
  tokenOut: '0xTokenOut',        // ERC‑20 to buy
  tokenInAmount: 1000000n,       // exact input (base units)
  // OR
  // tokenOutAmount: 1000000n,   // exact output (base units)
  to: '0xRecipient'              // optional recipient (defaults to your address)
}

const result = await swapProtocol.swap(swapOptions)
```

### Parameters

- `tokenIn` (`string`): ERC‑20 address to sell  
- `tokenOut` (`string`): ERC‑20 address to buy  
- `tokenInAmount` (`number | bigint`, optional): exact input amount in token base units  
- `tokenOutAmount` (`number | bigint`, optional): exact output amount in token base units  
- `to` (`string`, optional): recipient address (defaults to account address)  

> Note: Use either `tokenInAmount` OR `tokenOutAmount`, not both.



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
				<strong>WDK velora Swap Protocol API</strong>
			</td>
			<td>Get started with WDK's velora Swap Protocol API</td>
			<td>
				<a href="./api-reference.md">WDK velora Swap Protocol API</a>
			</td>
		</tr>
        <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK velora Swap Protocol Usage</strong>
			</td>
			<td>Get started with WDK's velora Swap Protocol usage</td>
			<td>
				<a href="./usage.md">WDK velora Swap Protocol Usage</a>
			</td>
		</tr>
	</tbody>
</table>

***

### Need Help?

{% include "../../../.gitbook/includes/support-cards.md" %}



