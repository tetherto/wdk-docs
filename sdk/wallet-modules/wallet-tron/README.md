---
title: Wallet Tron Overview
description: Overview of the @tetherto/wdk-wallet-tron module
author: Raquel Carrasco Gonzalez
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

# @tetherto/wdk-wallet-tron Overview

A simple and secure package to manage BIP-44 wallets for the Tron blockchain. This package provides a clean API for creating, managing, and interacting with Tron wallets using BIP-39 seed phrases and Tron-specific derivation paths.

## Features

- **BIP-39 Seed Phrase Support**: Generate and validate BIP-39 mnemonic seed phrases
- **Tron Derivation Paths**: Support for BIP-44 standard derivation paths for Tron
- **Multi-Account Management**: Create and manage multiple accounts from a single seed phrase
- **Tron Address Support:** Generate and manage Tron addresses
- **Message Signing:** Sign and verify messages using Tron cryptography
- **Transaction Management**: Send transactions and get fee estimates
- **TRC20 Support:** Query native TRX and TRC20 token balances.
- **TypeScript Support**: Full TypeScript definitions included
- **Memory Safety**: Secure private key management with automatic memory cleanup
- **Provider Flexibility:** Support for custom Tron RPC endpoints

## Supported Networks

This package works with the Tron blockchain, including:

- **Tron Mainnet**
- **Tron Shasta Testnet**

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
				<strong>WDK Tron Wallet Configuration</strong>
			</td>
			<td>Get started with WDK's Tron Wallet configuration</td>
			<td>
				<a href="./configuration.md">WDK Tron Wallet Configuration</a>
			</td>
		</tr>
        <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK Tron Wallet API</strong>
			</td>
			<td>Get started with WDK's Tron Wallet API</td>
			<td>
				<a href="./api-reference.md">WDK Tron Wallet API</a>
			</td>
		</tr>
        <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK Tron Wallet Usage</strong>
			</td>
			<td>Get started with WDK's with Tron Wallet usage</td>
			<td>
				<a href="./usage.md">WDK with Tron Wallet Usage</a>
			</td>
		</tr>
	</tbody>
</table>

***

### Need Help?

{% include "../../.gitbook/includes/support-cards.md" %}
