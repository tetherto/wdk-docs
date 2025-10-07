---
title: WDK Core
description: Overview of the @tetherto/wdk-core module
author: Raquel Carrasco
lastReviewed: 2025-09-11
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

# @tetherto/wdk-core

A comprehensive Wallet Development Kit (WDK) that provides unified interfaces for managing wallets, performing account abstraction, and executing cross-chain operations across multiple blockchains. This package serves as the main entry point and **orchestrator for all WDK wallet and protocol modules**, allowing you to register and manage different blockchain wallets through a single interface.

## Features

- **Multi-Chain Wallet Management**: Register and manage wallets for different blockchains (EVM, TON, Bitcoin, Spark, TRON, Solana)
- **Protocol Registration**: Register swap, bridge, and lending protocols for cross-chain operations
- **Middleware Support**: Register custom middleware for account decoration and enhanced functionality
- **BIP-44 Derivation Paths**: Support for standard derivation paths across all blockchains
- **Multi-Account Management**: Create and manage multiple accounts from a single seed phrase
- **Account Abstraction**: Support for gasless transactions and smart account management
- **Protocol Access**: Access registered protocols (swap, bridge, lending) through account instances
- **TypeScript Support**: Full TypeScript definitions included
- **Memory Safety**: Secure private key management with automatic memory cleanup
- **Provider Flexibility**: Support for custom RPC endpoints for each blockchain

## Supported Networks

This package works with multiple blockchain networks through wallet registration.

<table data-card-size="small" data-view="cards">
  <thead>
    <tr>
      <th></th>
      <th>Type</th>
      <th>Purpose</th>
      <th data-hidden data-card-target data-type="content-ref"></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><img src="../../assets/logos/ethereum-logo.png" alt="Ethereum logo" width="20" height="20" style="object-fit:contain;" /></td>
      <td><strong>EVM Chains</strong></td>
      <td>Ethereum, Arbitrum, etc.</td>
      <td>
        <a href="../wallet-modules/wallet-evm/">wallet-evm</a>, 
        <a href="../wallet-modules/wallet-evm-erc-4337/">wallet-evm-erc-4337</a>
      </td>
    </tr>
    <tr>
      <td><img src="../../assets/logos/ton-logo.png" alt="Ton Logo" width="20" height="20" style="object-fit:contain;"  /></td>
      <td><strong>TON</strong></td>
      <td>TON Mainnet</td>
      <td>
        <a href="../wallet-modules/wallet-ton/">wallet-ton</a>, 
        <a href="../wallet-modules/wallet-ton-gasless/">wallet-ton-gasless</a>
      </td>
    </tr>
    <tr>
      <td><img src="../../assets/logos/bitcoin-logo.png" alt="Bitcoin Logo" width="20" height="20"  style="object-fit:contain;"  /></td>
      <td><strong>Bitcoin</strong></td>
      <td>Bitcoin Mainnet</td>
      <td>
        <a href="../wallet-modules/wallet-btc/">wallet-btc</a>      
      </td>
    </tr>
     <tr>
      <td><img src="../../assets/logos/tron-logo.png" alt="Tron Logo"  width="20" height="20" style="object-fit:contain;" /></td>
      <td><strong>TRON</strong></td>
      <td>Tron Mainnet</td>
      <td>
        <a href="../wallet-modules/wallet-tron/">wallet-tron</a>, 
        <a href="../wallet-modules/wallet-tron-gasfree/">wallet-tron-gasfree</a>
      </td>
    </tr>
     <tr>
      <td><img src="../../assets/logos/solana-logo.png" alt="Solana Logo" width="20" height="20"  style="object-fit:contain;" /></td>
      <td><strong>Solana</strong></td>
      <td>Solana Mainnet</td>
      <td>
        <a href="../wallet-modules/wallet-solana/">wallet-solana</a>      </td>
    </tr>
    </tr>
     <tr>
      <td><img src="../../assets/logos/spark-logo.png" alt="Spark Logo" width="20" height="20"  style="object-fit:contain;" /></td>
      <td><strong>Spark</strong></td>
      <td>Spark Mainnet</td>
      <td>
        <a href="../wallet-modules/wallet-spark/">wallet-spark</a>      
      </td>
    </tr>
  </tbody>
</table>

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
				<a href="../start-building/nodejs-bare-quickstart.md">nodejs-quickstart.md</a>
			</td>
		</tr>
        <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK Core Configuration</strong>
			</td>
			<td>Get started with WDK's configuration</td>
			<td>
				<a href="./configuration.md">WDK Core Configuration</a>
			</td>
		</tr>
        <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK Core API</strong>
			</td>
			<td>Get started with WDK's API</td>
			<td>
				<a href="./api-reference.md">WDK Core API</a>
			</td>
		</tr>
        <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK Core Usage</strong>
			</td>
			<td>Get started with WDK's usage</td>
			<td>
				<a href="./usage.md">WDK Core Usage</a>
			</td>
		</tr>
	</tbody>
</table>

***

### Need Help?

{% include "../.gitbook/includes/support-cards.md" %}
