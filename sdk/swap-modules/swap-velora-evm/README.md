---
title: Swap velora EVM Overview
description: Overview of the @tetherto/wdk-protocol-swap-velora-evm module
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

# @tetherto/wdk-protocol-swap-velora-evm Overview

A lightweight package that lets EVM wallet accounts swap tokens using the velora aggregator. It provides a clean SDK for token swaps on EVM chains and works with both standard wallets and ERC‑4337 smart accounts.

## Features

- **Token Swapping**: Execute token swaps through velora on supported EVM networks
- **Account Abstraction**: Compatible with standard EVM accounts and ERC‑4337 smart accounts
- **Fee Controls**: Optional `swapMaxFee` to cap gas costs
- **Allowance Safety**: Handles USD₮ mainnet pattern (reset allowance to 0 before approve)
- **Provider Flexibility**: Works with JSON‑RPC URLs and EIP‑1193 providers
- **TypeScript Support**: Full TypeScript definitions included

## Supported Networks

Works with EVM networks supported by velora (e.g., Ethereum, Polygon, Arbitrum, etc.). A working RPC provider is required.

## Wallet Compatibility

The swap service supports multiple EVM wallet types:

- **Standard EVM Wallets**: `@tetherto/wdk-wallet-evm` accounts
- **ERC‑4337 Smart Accounts**: `@tetherto/wdk-wallet-evm-erc-4337` accounts with bundler/paymaster
- **Read‑Only Accounts**: For quoting swaps without sending transactions

## Key Components

- **velora Integration**: Uses velora aggregator for routing and quotes
- **Quote System**: Pre‑transaction fee and amount estimation via `quoteSwap`
- **AA Integration**: Optional paymaster token and fee cap overrides when using ERC‑4337
- **Allowance Management**: Approve flow handled automatically when required



## Next Steps

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


