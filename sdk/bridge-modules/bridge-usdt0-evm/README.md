---
title: Bridge USDT0 EVM Overview
description: Overview of the @tetherto/wdk-protocol-bridge-usdt0-evm module
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

# @tetherto/wdk-protocol-bridge-usdt0-evm Overview

A simple package that lets EVM wallet accounts bridge USDT0 tokens across different blockchains. This package provides a clean API for moving tokens between chains using the LayerZero protocol and USDT0 bridge system.

## Features

- **Cross-Chain Bridge**: Move USDT0 tokens between supported blockchains
- **LayerZero Integration**: Uses LayerZero protocol for secure cross-chain transfers
- **Multi-Chain Support**: Bridge to Ethereum, Arbitrum, Polygon, and other supported chains
- **Account Abstraction**: Works with both standard EVM wallets and ERC-4337 smart accounts
- **Fee Management**: Built-in fee calculation and bridge cost estimation
- **Token Support**: Supports USDT and other USDT0 ecosystem tokens
- **TypeScript Support**: Full TypeScript definitions included
- **Memory Safety**: Secure transaction handling with proper error management
- **Provider Flexibility**: Works with JSON-RPC URLs and EIP-1193 browser providers

## Supported Networks

This package works with EVM-compatible blockchains and can bridge to:

- **Ethereum** (Chain ID: 1)
- **Arbitrum** (Chain ID: 42,161) - ERC-4337 support
- **Polygon** (Chain ID: 137)


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
				<strong>WDK Bridge USDT0 EVM Protocol Configuration</strong>
			</td>
			<td>Get started with WDK's Bridge USDT0 EVM Protocol configuration</td>
			<td>
				<a href="./configuration.md">WDK Bridge USDT0 EVM Protocol Configuration</a>
			</td>
		</tr>
        <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK Bridge USDT0 EVM Protocol API</strong>
			</td>
			<td>Get started with WDK's Bridge USDT0 EVM Protocol API</td>
			<td>
				<a href="./api-reference.md">WDK Bridge USDT0 EVM Protocol API</a>
			</td>
		</tr>
        <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK Bridge USDT0 EVM Protocol Usage</strong>
			</td>
			<td>Get started with WDK's Bridge USDT0 EVM Protocol usage</td>
			<td>
				<a href="./usage.md">WDK Bridge USDT0 EVM Protocol Usage</a>
			</td>
		</tr>
	</tbody>
</table>

***

### Need Help?

{% include "../../../.gitbook/includes/support-cards.md" %}






