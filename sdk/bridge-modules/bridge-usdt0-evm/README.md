---
title: Bridge USD₮0 EVM Overview
description: Overview of the @tetherto/wdk-protocol-bridge-usdt0-evm module
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

# @tetherto/wdk-protocol-bridge-usdt0-evm Overview

A simple package that lets EVM wallet accounts bridge USD₮0 tokens across chains. This package provides a clean API for moving tokens from EVM source chains to both EVM and non-EVM destinations using the LayerZero protocol and USD₮0 bridge system.

## Features

- **Cross-Chain Bridge**: Move USD₮0 tokens between supported blockchains
- **LayerZero Integration**: Uses LayerZero protocol for secure cross-chain transfers
- **Expanded Multi-Chain Support**: Bridge across 25+ networks including Ethereum, Arbitrum, Optimism, Polygon, Berachain, Monad, and more
- **Non-EVM Destinations**: Bridge from EVM chains to Solana, TON, and TRON
- **Account Abstraction**: Works with both standard EVM wallets and ERC-4337 smart accounts
- **Fee Management**: Built-in fee calculation and bridge cost estimation
- **Token Support**: Supports USD₮0 and XAU₮0 (Tether Gold) across supported routes
- **Route Overrides**: Optional per-call `oftContractAddress` and `dstEid` overrides in `BridgeOptions`
- **TypeScript Support**: Full TypeScript definitions included
- **Memory Safety**: Secure transaction handling with proper error management
- **Provider Flexibility**: Works with JSON-RPC URLs and EIP-1193 browser providers

## Supported Networks

This package supports bridging from EVM source chains to EVM and non-EVM destination chains.

### Source Chains (EVM)

- **Ethereum** (Chain ID: 1)
- **Arbitrum** (Chain ID: 42161)
- **Optimism** (Chain ID: 10)
- **Polygon** (Chain ID: 137)
- **Berachain** (Chain ID: 80094)
- **Ink** (Chain ID: 57073)
- **Plasma** (Chain ID: 9745)
- **Conflux eSpace** (Chain ID: 1030)
- **Corn** (Chain ID: 21000000)
- **Avalanche** (Chain ID: 43114)
- **Celo** (Chain ID: 42220)
- **Flare** (Chain ID: 14)
- **HyperEVM** (Chain ID: 999)
- **Mantle** (Chain ID: 5000)
- **MegaETH** (Chain ID: 4326)
- **Monad** (Chain ID: 143)
- **Morph** (Chain ID: 2818)
- **Rootstock** (Chain ID: 30)
- **Sei** (Chain ID: 1329)
- **Stable** (Chain ID: 988)
- **Unichain** (Chain ID: 130)
- **XLayer** (Chain ID: 196)

### Destination Chains

- **EVM destinations**: All supported EVM chains listed above
- **Solana** (EID: 30168)
- **TON** (EID: 30343)
- **TRON** (EID: 30420)


**Note**: Token support is determined by the contracts deployed on each chain. The protocol checks for `oftContract`, `legacyMeshContract`, and `xautOftContract` to determine available tokens.


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
				<strong>WDK Bridge USD₮0 EVM Protocol API</strong>
			</td>
			<td>Get started with WDK's Bridge USD₮0 EVM Protocol API</td>
			<td>
				<a href="./api-reference.md">WDK Bridge USD₮0 EVM Protocol API</a>
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


