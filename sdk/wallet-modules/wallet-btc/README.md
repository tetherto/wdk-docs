---
title: Wallet BTC Overview
description: Overview of the @tetherto/wdk-wallet-btc module
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

A simple and secure package to manage BIP-84 (SegWit) and BIP-44 (Legacy) wallets for the Bitcoin blockchain. This package provides a clean API for creating, managing, and interacting with Bitcoin wallets using BIP-39 seed phrases and Bitcoin-specific derivation paths.

{% hint style="warning" %}
**Default Derivation Path Change in v1.0.0-beta.4+**

The default derivation path was updated in v1.0.0-beta.4 to use BIP-84 (Native SegWit) instead of BIP-44 (Legacy):

- **Previous path** (<= v1.0.0-beta.3): `m/44'/0'/0'/0/{index}` (Legacy addresses)
- **Current path** (v1.0.0-beta.4+): `m/84'/0'/0'/0/{index}` (Native SegWit addresses)

If you're upgrading from an earlier version, existing wallets created with the old path will generate different addresses. Make sure to migrate any existing wallets or use the old path explicitly if needed for compatibility.

Use [`getAccountByPath`](./api-reference.md#getaccountbypathpath) to supply an explicit derivation path when importing or recreating legacy wallets.

{% endhint %}

## Features

- **BIP-39 Seed Phrase Support**: Generate and validate BIP-39 mnemonic seed phrases
- **Bitcoin Derivation Paths**: Support for BIP-84 (Native SegWit, default) and BIP-44 (Legacy) derivation paths
- **Multi-Account Management**: Create and manage multiple accounts from a single seed phrase
- **Address Types Support**: Generate Native SegWit (P2WPKH) addresses by default, with Legacy (P2PKH) support via configuration
- **UTXO Management**: Track and manage unspent transaction outputs
- **Transaction Management**: Create, sign, and broadcast Bitcoin transactions (single recipient per transaction)
- **Fee Estimation**: Dynamic fee calculation via mempool.space API
- **Electrum Support**: Connect to Electrum servers for network interaction
- **TypeScript Support**: Full TypeScript definitions included
- **Memory Safety**: Secure private key management with memory-safe implementation
- **Network Flexibility**: Support for mainnet, testnet, and regtest

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
				<a href="../../../start-building/nodejs-bare-quickstart.md">Node.js & Bare Quickstart</a>
			</td>
		</tr>
        <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK Bitcoin Wallet Configuration</strong>
			</td>
			<td>Get started with WDK's Bitcoin Wallet configuration</td>
			<td>
				<a href="./configuration.md">WDK Bitcoin Wallet Configuration</a>
			</td>
		</tr>
        <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK Bitcoin Wallet API</strong>
			</td>
			<td>Get started with WDK's Bitcoin Wallet API</td>
			<td>
				<a href="./api-reference.md">WDK Bitcoin Wallet API</a>
			</td>
		</tr>
        <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK Bitcoin Wallet Usage</strong>
			</td>
			<td>Get started with WDK's Bitcoin Wallet usage</td>
			<td>
				<a href="./usage.md">WDK Bitcoin Wallet Usage</a>
			</td>
		</tr>
	</tbody>
</table>

***

### Need Help?

{% include "../../../.gitbook/includes/support-cards.md" %}
