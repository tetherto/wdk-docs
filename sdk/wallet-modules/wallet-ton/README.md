---
title: Wallet TON Overview
description: Overview of the @tetherto/wdk-wallet-ton module
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

# @tetherto/wdk-wallet-ton Overview

A simple and secure package to manage BIP-44 wallets for the TON blockchain. This package provides a clean API for creating, managing, and interacting with TON wallets using BIP-39 seed phrases and TON-specific derivation paths.

## Features

- **BIP-39 Seed Phrase Support**: Generate and validate BIP-39 mnemonic seed phrases
- **TON Derivation Paths**: Support for BIP-44 standard derivation paths for TON (m/44'/607')
- **Multi-Account Management**: Create and manage multiple accounts from a single seed phrase
- **TON Address Support**: Generate and manage TON addresses using V5R1 wallet contracts
- **Message Signing**: Sign and verify messages using TON cryptography
- **Transaction Management**: Send transactions and get fee estimates
- **Jetton Support**: Query native TON and Jetton token balances
- **TypeScript Support**: Full TypeScript definitions included
- **Memory Safety**: Secure private key management with automatic memory cleanup using sodium-universal
- **Provider Flexibility**: Support for custom TON RPC endpoints and TON Center API

## Supported Networks

This package works with the TON blockchain (The Open Network), including:

- **TON Mainnet**
- **TON Testnet**

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
				<strong>WDK TON Wallet Configuration</strong>
			</td>
			<td>Get started with WDK's TON Wallet configuration</td>
			<td>
				<a href="./configuration.md">WDK TON Wallet Configuration</a>
			</td>
		</tr>
        <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK TON Wallet API</strong>
			</td>
			<td>Get started with WDK's TON Wallet API</td>
			<td>
				<a href="./api-reference.md">WDK TON Wallet API</a>
			</td>
		</tr>
        <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK TON Wallet Usage</strong>
			</td>
			<td>Get started with WDK's with TON Wallet usage</td>
			<td>
				<a href="./usage.md">WDK with TON Wallet Usage</a>
			</td>
		</tr>
	</tbody>
</table>

***

### Need Help?

{% include "../../../.gitbook/includes/support-cards.md" %}
