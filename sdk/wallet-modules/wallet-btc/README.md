---
title: Wallet BTC Overview
description: Overview of the @tetherto/wdk-wallet-btc module
author: Matteo Giardino
lastReviewed: 2025-06-26
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

# @tetherto/wdk-wallet-btc Overview

A simple and secure package to manage BIP-84 (SegWit) wallets for the Bitcoin blockchain. This package provides a clean API for creating, managing, and interacting with Bitcoin wallets using BIP-39 seed phrases and BIP-84 derivation paths for Native SegWit addresses.

## Features

- **BIP-39 Seed Phrase Support**: Generate and validate BIP-39 mnemonic seed phrases
- **Bitcoin Derivation Paths**: Support for BIP-84 standard derivation paths for Bitcoin (m/84'/0')
- **Multi-Account Management**: Create and manage multiple accounts from a single seed phrase
- **Address Types Support**: Generate and manage Legacy, SegWit, and Native SegWit addresses
- **UTXO Management**: Track and manage unspent transaction outputs
- **Transaction Management**: Create, sign, and broadcast Bitcoin transactions
- **Fee Estimation**: Dynamic fee calculation with different priority levels
- **Electrum Support**: Connect to Electrum servers for network interaction
- **TypeScript Support**: Full TypeScript definitions included
- **Memory Safety**: Secure private key management with memory-safe implementation
- **Network Flexibility**: Support for both mainnet and testnet
- **Transaction Building**: Support for complex transaction construction with multiple inputs/outputs

## Supported Networks

This package works with Bitcoin networks:

- **Bitcoin Mainnet** (`"bitcoin"`)
- **Bitcoin Testnet** (`"testnet"`)  
- **Bitcoin Regtest** (`"regtest"`)

### Electrum Server Configuration

**Important**: While the package defaults to `electrum.blockstream.info:50001` for convenience, **we strongly recommend configuring your own Electrum server** for production use.

#### Recommended Approach:

**For Production:**
- Set up your own Fulcrum server for optimal performance and reliability
- Use recent Fulcrum versions that support pagination for high-transaction addresses

**For Development/Testing:**
- `fulcrum.frznode.com:50001` - Generally faster than default
- `electrum.blockstream.info:50001` - Default fallback

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
				<a href="../../start-building/nodejs-bare-quickstart.md">nodejs-quickstart.md</a>
			</td>
		</tr>
        <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK BTC Wallet Configuration</strong>
			</td>
			<td>Get started with WDK's BTC Wallet configuration</td>
			<td>
				<a href="./configuration.md">WDK BTC Wallet Configuration</a>
			</td>
		</tr>
        <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK BTC Wallet API</strong>
			</td>
			<td>Get started with WDK's BTC Wallet API</td>
			<td>
				<a href="./api-reference.md">WDK BTC Wallet API</a>
			</td>
		</tr>
        <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK BTC Wallet Usage</strong>
			</td>
			<td>Get started with WDK's BTC Wallet usage</td>
			<td>
				<a href="./usage.md">WDK BTC Wallet Usage</a>
			</td>
		</tr>
	</tbody>
</table>

***

### Need Help?

{% include "../../.gitbook/includes/support-cards.md" %}
