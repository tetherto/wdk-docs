---
title: Wallet EVM ERC-4337 Overview
description: Overview of the @tetherto/wdk-wallet-evm-erc-4337 module
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

# @tetherto/wdk-wallet-evm-erc-4337 Overview

A simple and secure package to manage ERC-4337 compliant wallets for EVM-compatible blockchains. This package provides a clean API for creating, managing, and interacting with account abstraction wallets using BIP-39 seed phrases and EVM-specific derivation paths.

## Features

- **BIP-39 Seed Phrase Support**: Generate and validate BIP-39 mnemonic seed phrases
- **EVM Derivation Paths**: Support for BIP-44 standard derivation paths for Ethereum (m/44'/60')
- **Multi-Account Management**: Create and manage multiple account abstraction wallets from a single seed phrase
- **ERC-4337 Support**: Full implementation of ERC-4337 account abstraction standard
- **UserOperation Management**: Create and send UserOperations through bundlers
- **Message Signing**: Sign and verify messages using EVM cryptography
- **EIP-712 Typed Data Support**: Sign and verify typed data payloads
- **ERC20 Support**: Query native token and ERC20 token balances using smart contract interactions
- **Batch Token Balance Queries**: Fetch balances for multiple ERC20 tokens in one call with `getTokenBalances`
- **TypeScript Support**: Full TypeScript definitions included
- **Memory Safety**: Secure private key management with memory-safe HDNodeWallet implementation
- **Bundler Integration**: Support for ERC-4337 bundler services
- **Gas Optimization**: Paymaster support and gas estimation for UserOperations
- **Fee Estimation**: Dynamic fee calculation with bundler-aware estimation

## Supported Networks

This package works with any EVM-compatible blockchain, including:

- **Ethereum Mainnet**
- **Ethereum Testnets** (Sepolia)
- **Other EVM Chains** (Polygon, Arbitrum, Avalanche C-chain, Plasma etc.)

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
				<strong>WDK EVM with ERC-4337 Wallet Configuration</strong>
			</td>
			<td>Get started with WDK's EVM with ERC-4337 Wallet configuration</td>
			<td>
				<a href="./configuration.md">WDK EVM with ERC-4337 Wallet Configuration</a>
			</td>
		</tr>
        <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK EVM with ERC-4337 Wallet API</strong>
			</td>
			<td>Get started with WDK's EVM with ERC-4337 Wallet API</td>
			<td>
				<a href="./api-reference.md">WDK EVM with ERC-4337 Wallet API</a>
			</td>
		</tr>
        <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK EVM with ERC-4337 Wallet Usage</strong>
			</td>
			<td>Get started with WDK's EVM with ERC-4337 Wallet usage</td>
			<td>
				<a href="./usage.md">WDK EVM with ERC-4337 Wallet Usage</a>
			</td>
		</tr>
	</tbody>
</table>

***

### Need Help?

{% include "../../../.gitbook/includes/support-cards.md" %}
