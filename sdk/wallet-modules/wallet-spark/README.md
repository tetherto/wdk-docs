---
title: Wallet Spark Overview
description: Overview of the @tetherto/wdk-wallet-spark module
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

# @tetherto/wdk-wallet-spark Overview

{% hint style="danger" %}
**Known Issue: Thread Hanging in Node.js Bare Environments**

There is a known issue with this module causing thread hanging when used in bare Node.js environments. The module is not production-ready in Node.js at this time.

For the latest updates and workarounds, please check the [GitHub Issues](https://github.com/tetherto/wdk-wallet-spark/issues).

The module works correctly in React Native environments.
{% endhint %}

A simple and secure package to manage BIP-32 wallets for the Spark blockchain. This package provides a clean API for creating, managing, and interacting with Spark wallets using [BIP-39 seed phrases](../../resources/concepts.md#bip-39-mnemonic-seed-phrases), [BIP-44 derivation paths](../../resources/concepts.md#bip-44-multi-account-hierarchy), and the Spark SDK for Bitcoin [layer 2](../../resources/concepts.md#layer-2-solutions) functionality including [Lightning Network](../../resources/concepts.md#lightning-network) integration.

## Features

- **Spark Blockchain Support**: Full integration with the Spark Bitcoin [layer 2](../../resources/concepts.md#layer-2-solutions) network
- **Lightning Network Integration**: Create and pay [Lightning Network](../../resources/concepts.md#lightning-network) invoices directly
- **Bitcoin Layer 1 Bridge**: Deposit and withdraw Bitcoin between layer 1 and Spark
- **[BIP-44 Derivation Paths](../../resources/concepts.md#bip-44-multi-account-hierarchy)**: Support for standard BIP-44 derivation paths with Spark-specific coin type (998)
- **[BIP-39 Seed Phrase Support](../../resources/concepts.md#bip-39-mnemonic-seed-phrases)**: Generate and validate BIP-39 mnemonic seed phrases
- **Multi-Account Management**: Create and manage multiple accounts from a single seed phrase
- **Single-Use Deposit Addresses**: Generate unique deposit addresses for Bitcoin layer 1 deposits
- **Fee-Free Transactions**: Spark transactions are fee-free on the layer 2 network
- **Transaction History**: Complete transaction history with incoming/outgoing transfers
- **Message Signing**: Sign and verify messages using Spark identity keys
- **Memory Safety**: Secure private key management with automatic memory cleanup
- **TypeScript Support**: Full TypeScript definitions included
- **Network Support**: Support for Spark [mainnet](../../resources/concepts.md#mainnet), [testnet](../../resources/concepts.md#testnet), and [regtest](../../resources/concepts.md#regtest) networks

## Supported Networks

This package supports the following Spark networks:

- **Spark Mainnet**: Production Spark network
- **Spark Testnet**: Spark test network for development
- **Spark Regtest**: Local Spark network for testing

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
				<strong>WDK Spark Wallet Configuration</strong>
			</td>
			<td>Get started with WDK's Spark Wallet configuration</td>
			<td>
				<a href="./configuration.md">WDK Spark Wallet Configuration</a>
			</td>
		</tr>
        <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK Spark Wallet API</strong>
			</td>
			<td>Get started with WDK's Spark Wallet API</td>
			<td>
				<a href="./api-reference.md">WDK Spark Wallet API</a>
			</td>
		</tr>
        <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK Spark Wallet Usage</strong>
			</td>
			<td>Get started with WDK's with Spark Wallet usage</td>
			<td>
				<a href="./usage.md">WDK with Spark Wallet Usage</a>
			</td>
		</tr>
	</tbody>
</table>

***

### Need Help?

{% include "../../../.gitbook/includes/support-cards.md" %}
