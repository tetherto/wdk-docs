---
title: Lending Aave EVM Configuration
description: Configuration options and settings for @tetherto/wdk-protocol-lending-aave-evm
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

## Service Setup

```javascript
import AaveProtocolEvm from '@tetherto/wdk-protocol-lending-aave-evm'
import { WalletAccountEvm } from '@tetherto/wdk-wallet-evm'

// Create wallet account first
const account = new WalletAccountEvm(seedPhrase, "0'/0/0", {
  provider: 'https://ethereum-rpc.publicnode.com'
})

// Create lending service
const aave = new AaveProtocolEvm(account)
```

## Account Configuration

The service uses the wallet account configuration to connect to the target network and sign transactions.

```javascript
import { WalletAccountEvm, WalletAccountReadOnlyEvm } from '@tetherto/wdk-wallet-evm'

// Full access account
const account = new WalletAccountEvm(seedPhrase, "0'/0/0", {
  provider: 'https://ethereum-rpc.publicnode.com'
})

// Read-only account (quotes, reads)
const readOnly = new WalletAccountReadOnlyEvm('0xYourAddress', {
  provider: 'https://ethereum-rpc.publicnode.com'
})

const aave = new AaveProtocolEvm(account)
```

## ERC‑4337 (Account Abstraction)

When using ERC‑4337 smart accounts, you can optionally specify a `paymasterToken` per operation to sponsor gas.

```javascript
import { WalletAccountEvmErc4337 } from '@tetherto/wdk-wallet-evm-erc-4337'

const aa = new WalletAccountEvmErc4337(seedPhrase, "0'/0/0", {
  chainId: 1,
  provider: 'https://arb1.arbitrum.io/rpc',
  bundlerUrl: 'YOUR_BUNDLER_URL',
  paymasterUrl: 'YOUR_PAYMASTER_URL'
})

const aaveAA = new AaveProtocolEvm(aa)

const result = await aaveAA.supply({ token: '0xdAC17F...ec7', amount: 1000000n }, {
  paymasterToken: 'USDT'
})
```

## Network Support

Aave V3 spans multiple EVM chains (Ethereum, Arbitrum, Base, Optimism, Polygon, Avalanche, BNB, Celo, Gnosis, Linea, Scroll, Soneium, Sonic, ZkSync, Metis). Ensure the correct RPC and token addresses for the target chain.

```javascript
// Ethereum Mainnet
const eth = new WalletAccountEvm(seedPhrase, "0'/0/0", {
  provider: 'https://ethereum-rpc.publicnode.com'
})

// Arbitrum
const arb = new WalletAccountEvm(seedPhrase, "0'/0/0", {
  provider: 'https://arb1.arbitrum.io/rpc'
})
```

## Operation Options

Each operation accepts a simple options object:

```javascript
// Supply
await aave.supply({ token: 'TOKEN_ADDRESS', amount: 1000000n })

// Withdraw
await aave.withdraw({ token: 'TOKEN_ADDRESS', amount: 1000000n })

// Borrow
await aave.borrow({ token: 'TOKEN_ADDRESS', amount: 1000000n })

// Repay
await aave.repay({ token: 'TOKEN_ADDRESS', amount: 1000000n })
```

### Common Parameters

- `token` (`string`): ERC‑20 token address
- `amount` (`number | bigint`): token amount in base units
- `onBehalfOf` (`string`, optional): another address to act for (supply/borrow/repay)
- `to` (`string`, optional): destination address (withdraw)

> Note: `amount` must be > 0. Addresses must be valid/non‑zero. A provider is required for any write.


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
				<strong>WDK Lending Aave EVM Protocol API</strong>
			</td>
			<td>Get started with WDK's Lending Aave EVM Protocol API</td>
			<td>
				<a href="./api-reference.md">WDK Lending Aave EVM Protocol API</a>
			</td>
		</tr>
        <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK Lending Aave EVM Protocol Usage</strong>
			</td>
			<td>Get started with WDK's Lending Aave EVM Protocol usage</td>
			<td>
				<a href="./usage.md">WDK Lending Aave EVM Protocol Usage</a>
			</td>
		</tr>
	</tbody>
</table>

***

### Need Help?

{% include "../../../.gitbook/includes/support-cards.md" %}



