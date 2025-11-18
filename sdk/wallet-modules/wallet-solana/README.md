---
title: Wallet Solana Overview
description: Overview of the @tetherto/wdk-wallet-solana module
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

# @tetherto/wdk-wallet-solana Overview

A simple and secure package to manage BIP-44 wallets for the Solana blockchain. This package provides a clean API for creating, managing, and interacting with Solana wallets using BIP-39 seed phrases and Solana-specific derivation paths.

{% hint style="warning" %}

**Default Derivation Path Change in v1.0.0-beta.4+**

The default derivation path was updated in v1.0.0-beta.4 to match ecosystem conventions:

- **Before** (v1.0.0-beta.3): `m/44'/501'/0'/0/{index}`
- **After** (v1.0.0-beta.4+): `m/44'/501'/{index}'/0'`

If you're upgrading from an earlier version, existing wallets created with the old path will generate different addresses. Make sure to migrate any existing wallets or use the old path explicitly if needed for compatibility.

Use [`getAccountByPath`](./api-reference.md#getaccountbypathpath) to supply an explicit derivation path when importing or recreating legacy wallets.

{% endhint %}

## Features

- **BIP-39 Seed Phrase Support**: Generate and validate BIP-39 mnemonic seed phrases
- **Solana Derivation Paths**: Support for BIP-44 standard derivation paths for Solana (m/44'/501')
- **Multi-Account Management**: Create and manage multiple accounts from a single seed phrase
- **Solana Address Support**: Generate and manage Solana public keys and addresses
- **Message Signing**: Sign and verify messages using Ed25519 cryptography
- **Transaction Management**: Send transactions and get fee estimates
- **SPL Token Support**: Query native SOL and SPL token balances
- **TypeScript Support**: Full TypeScript definitions included
- **Memory Safety**: Secure private key management with memory-safe implementation
- **Provider Flexibility**: Support for custom Solana RPC endpoints
- **Fee Estimation**: Dynamic fee calculation with recent blockhash
- **Program Interaction**: Support for interacting with Solana programs

## Supported Networks

This package works with the Solana blockchain, including:

- **Solana Mainnet**
- **Solana Devnet**
- **Solana Testnet**
- **Localnet**

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
				<strong>WDK Solana Wallet Configuration</strong>
			</td>
			<td>Get started with WDK's Solana Wallet configuration</td>
			<td>
				<a href="./configuration.md">WDK Solana Wallet Configuration</a>
			</td>
		</tr>
        <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK Solana Wallet API</strong>
			</td>
			<td>Get started with WDK's Solana Wallet API</td>
			<td>
				<a href="./api-reference.md">WDK Solana Wallet API</a>
			</td>
		</tr>
        <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK Solana Wallet Usage</strong>
			</td>
			<td>Get started with WDK's with Solana Wallet usage</td>
			<td>
				<a href="./usage.md">WDK with Solana Wallet Usage</a>
			</td>
		</tr>
	</tbody>
</table>

***

### Need Help?

{% include "../../../.gitbook/includes/support-cards.md" %}
