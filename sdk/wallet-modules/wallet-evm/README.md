---
title: Wallet EVM Overview
description: Overview of the @tetherto/wdk-wallet-evm module
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

# @tetherto/wdk-wallet-evm Overview

A simple and secure package to manage BIP-44 wallets for EVM (Ethereum Virtual Machine) blockchains. This package provides a clean API for creating, managing, and interacting with Ethereum-compatible wallets using BIP-39 seed phrases and BIP-44 derivation paths.


## Features

- **BIP-39 Seed Phrase Support**: Generate and validate BIP-39 mnemonic seed phrases
- **EVM Derivation Paths**: Support for BIP-44 standard derivation paths for Ethereum (m/44'/60')
- **Multi-Account Management**: Create and manage multiple accounts from a single seed phrase
- **EVM Address Support**: Generate and manage Ethereum-compatible addresses using ethers.js
- **Message Signing**: Sign and verify messages using EVM cryptography
- **Transaction Management**: Send transactions and get fee estimates with EIP-1559 support
- **ERC20 Support**: Query native token and ERC20 token balances using smart contract interactions
- **Batch Token Balance Queries**: Fetch balances for multiple ERC20 tokens in one call with `getTokenBalances`
- **TypeScript Support**: Full TypeScript definitions included
- **Memory Safety**: Secure private key management with memory-safe HDNodeWallet implementation
- **Provider Flexibility**: Support for both JSON-RPC URLs and EIP-1193 browser providers
- **Gas Optimization**: Support for EIP-1559 maxFeePerGas and maxPriorityFeePerGas
- **Fee Estimation**: Dynamic fee calculation with normal (1.1x) and fast (2.0x) multipliers

## Supported Networks

This package works with any EVM-compatible blockchain, including:

- **Ethereum**: Mainnet, Sepolia
- **Polygon**: Mainnet, Amoy
- **Binance Smart Chain (BSC)**: Mainnet, Testnet
- **Arbitrum**: One, Nova
- **Optimism**: Mainnet, Sepolia
- **Avalanche C-Chain**: Mainnet, Fuji
- **And many more...**



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
				<a href="../../../start-building/nodejs-bare-quickstart.md">nodejs-quickstart.md</a>
			</td>
		</tr>
        <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK EVM Wallet Configuration</strong>
			</td>
			<td>Get started with WDK's EVM Wallet configuration</td>
			<td>
				<a href="./configuration.md">WDK EVM Wallet Configuration</a>
			</td>
		</tr>
        <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK EVM Wallet API</strong>
			</td>
			<td>Get started with WDK's EVM Wallet API</td>
			<td>
				<a href="./api-reference.md">WDK EVM Wallet API</a>
			</td>
		</tr>
        <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK EVM Wallet Usage</strong>
			</td>
			<td>Get started with WDK's EVM Wallet usage</td>
			<td>
				<a href="./usage.md">WDK EVM Wallet Usage</a>
			</td>
		</tr>
	</tbody>
</table>

***

### Need Help?

{% include "../../../.gitbook/includes/support-cards.md" %}
