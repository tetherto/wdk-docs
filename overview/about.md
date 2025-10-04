---
title: About WDK
description: Learn about the Wallet Development Kit - what it is, the problems it solves, and how it enables secure multi-chain wallet development
icon: info-circle
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
    visible: true
  metadata:
    visible: false
---

# What is WDK

The **Wallet Development Kit (WDK)** is Tether's open-source initiative to enable developers to build secure, multi-chain, non-custodial wallets with minimal effort. WDK is a developer-first framework designed for maximum flexibility, supporting everything from consumer wallets to wallet-enabled apps, DeFi integrations, and even IoT use cases.

Unlike closed solutions or SaaS-based wallet infrastructure providers, WDK is fully open-source and designed for maximum flexibility and extensibility. It is modular, compatible with Bare runtime, and can be embedded in a wide variety of environments.

***

## What Problems Does WDK Solve?

Developers building wallets or wallet-enabled applications today face significant challenges:

### **Fragmented Blockchain Standards**
Inconsistent SDKs and APIs across different blockchain ecosystems make multi-chain development complex and time-consuming.

### **Complex Integrations**
Developers spend months stitching together multiple chains and protocols, often reinventing common functionality instead of focusing on unique features.

### **Security Risks**
Poor practices in key management and non-custodial architecture lead to vulnerabilities and compromised user funds.

### **Slow Time-to-Market**
Starting from scratch or forking existing wallets means inheriting opinionated architectures and technical debt, significantly delaying product launches.

***

## Why WDK is Different

<table data-view="cards">
	<thead>
		<tr>
			<th></th>
			<th></th>
			<th data-hidden data-card-cover data-type="image">Cover image</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td><strong>Runs Anywhere</strong></td>
			<td>Works with Node.js, Bare runtime, mobile (React Native), and future embedded environments</td>
			<td><a href="assets/card-placeholder1.svg">placeholder.svg</a></td>
		</tr>
		<tr>
			<td><strong>Flexible & Modular</strong></td>
			<td>Pick only the modules you need; extend functionality with custom modules</td>
			<td><a href="assets/card-placeholder2.svg">placeholder.svg</a></td>
		</tr>
		<tr>
			<td><strong>Developer-Centric</strong></td>
			<td>Clear SDK design, strong TypeScript typing, extensive docs, and ready-to-use starters</td>
			<td><a href="assets/card-placeholder3.svg">placeholder.svg</a></td>
		</tr>
		<tr>
			<td><strong>Zero Lock-In</strong></td>
			<td>Fully non-custodial and stateless; no reliance on external providers</td>
			<td><a href="assets/card-placeholder1.svg">placeholder.svg</a></td>
		</tr>
		<tr>
			<td><strong>Ecosystem-Backed</strong></td>
			<td>Maintained and supported by Tether with strong community involvement</td>
			<td><a href="assets/card-placeholder2.svg">placeholder.svg</a></td>
		</tr>
	</tbody>
</table>

***

## What WDK Provides

WDK combines four core components to deliver a complete wallet development solution:

<table data-view="cards">
	<thead>
		<tr>
			<th></th>
			<th></th>
			<th data-hidden data-card-target data-type="content-ref"></th>
			<th data-hidden data-card-cover data-type="image">Cover image</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td><strong>Modular SDK</strong></td>
			<td>Unified APIs for wallet and protocol operations across multiple blockchains</td>
			<td><a href="../sdk/getting-started.md">SDK Documentation</a></td>
			<td><a href="assets/card-placeholder1.svg">placeholder.svg</a></td>
		</tr>
		<tr>
			<td><strong>Indexer API</strong></td>
			<td>Reliable blockchain data access for balances, transactions, and historical data</td>
			<td><a href="../tools/indexer/README.md">Indexer Documentation</a></td>
			<td><a href="assets/card-placeholder2.svg">placeholder.svg</a></td>
		</tr>
		<tr>
			<td><strong>UI Kits</strong></td>
			<td>Reusable React Native components for building wallet interfaces</td>
			<td><a href="../ui-kit/react-native/README.md">UI Kit Documentation</a></td>
			<td><a href="assets/card-placeholder3.svg">placeholder.svg</a></td>
		</tr>
		<tr>
			<td><strong>Examples & Starters</strong></td>
			<td>Production-ready wallet templates and reference implementations</td>
			<td><a href="../starters/react-native/README.md">Starter Documentation</a></td>
			<td><a href="assets/card-placeholder1.svg">placeholder.svg</a></td>
		</tr>
	</tbody>
</table>

***

## Core Features

### **Unified Multi-Chain Experience**
Single API for Bitcoin, Ethereum, Polygon, Arbitrum, TRON, TON, Solana, Spark (Lightning), and others.

### **Account Abstraction**
Support for gasless transactions across EVM, TON, and TRON via dedicated modules (ERC-4337, gasless TON, gasfree TRON).

### **Non-Custodial & Stateless**
WDK never stores secrets; all sensitive data remains in memory under developer control.

### **Security by Design**
Secure key management, seed phrase handling, and passkey/biometric support built-in.

### **Extensible Modules**
Built-in support for swap, bridge, and lending protocols, with the ability to add new protocols.

### **Bare Runtime Compatibility**
Ensuring portability to almost any platform, from mobile to IoT devices.

***

## Key Value Propositions

<table data-view="cards">
	<thead>
		<tr>
			<th></th>
			<th></th>
			<th data-hidden data-card-cover data-type="image">Cover image</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td><strong>Fast Development</strong></td>
			<td>Go from zero to production wallet in days, not months with pre-built modules and starters</td>
			<td><a href="assets/card-placeholder1.svg">placeholder.svg</a></td>
		</tr>
		<tr>
			<td><strong>Security by Design</strong></td>
			<td>Stateless and non-custodial architecture ensures keys never leave developer control</td>
			<td><a href="assets/card-placeholder2.svg">placeholder.svg</a></td>
		</tr>
		<tr>
			<td><strong>Multi-Chain Ready</strong></td>
			<td>Out-of-the-box support for 9+ blockchains with unified APIs</td>
			<td><a href="assets/card-placeholder3.svg">placeholder.svg</a></td>
		</tr>
		<tr>
			<td><strong>Modular & Extensible</strong></td>
			<td>Add only what you need; extend functionality with custom modules</td>
			<td><a href="assets/card-placeholder1.svg">placeholder.svg</a></td>
		</tr>
		<tr>
			<td><strong>Cross-Platform</strong></td>
			<td>Works seamlessly in Node.js, React Native, Bare runtime, and embedded environments</td>
			<td><a href="assets/card-placeholder2.svg">placeholder.svg</a></td>
		</tr>
		<tr>
			<td><strong>Open Source</strong></td>
			<td>Transparent, community-driven, and free to adopt with no vendor lock-in</td>
			<td><a href="assets/card-placeholder3.svg">placeholder.svg</a></td>
		</tr>
	</tbody>
</table>

***

## Differentiation from Other Solutions

Existing wallet SDKs and frameworks typically address narrow use cases or single chains. Full wallets like MetaMask or Phantom are closed ecosystems that cannot be repurposed easily by developers. Other players in the space offer wallet infrastructure as a service but are closed source and operate on a paid model, creating vendor lock-in and long-term cost concerns.

**WDK differentiates itself by being:**

- **Multi-chain out of the box**
- **Non-custodial and stateless by design**
- **Open-source and free to adopt**
- **Ecosystem-backed with direct support from Tether**

***

## Supported Blockchains & Protocols

WDK natively supports a broad set of blockchains and standards out of the box:

{% tabs %}
{% tab title="Wallet Modules" %}
- **Bitcoin** (`wallet-btc`)
- **Ethereum & EVM** (`wallet-evm`)
- **Ethereum with ERC-4337** (`wallet-evm-erc-4337`)
- **TON** (`wallet-ton`)
- **TON Gasless** (`wallet-ton-gasless`)
- **TRON** (`wallet-tron`)
- **TRON Gasfree** (`wallet-tron-gasfree`)
- **Solana** (`wallet-solana`)
- **Spark/Lightning** (`wallet-spark`)
{% endtab %}

{% tab title="DeFi Modules" %}
- **Swap Protocols**
  - ParaSwap on EVM (`swap-paraswap-evm`)
  - StonFi on TON (`swap-stonfi-ton`)
- **Bridge Protocols**
  - USDT0 on EVM (`bridge-usdt0-evm`)
  - USDT0 on TON (`bridge-usdt0-ton`)
- **Lending Protocols**
  - Aave on EVM (`lending-aave-evm`)
{% endtab %}
{% endtabs %}

The modular architecture allows new chains, tokens, or protocols to be added by implementing dedicated modules.

***

## Technical Architecture

WDK follows a stateless architecture where sensitive data such as private keys is never persisted. All operations are executed in memory with automatic cleanup, ensuring security while maintaining flexibility.

### **SDK Structure**
- Written in **JavaScript** with complete **TypeScript definitions**
- Distributed as ES modules and compiled for **Bare runtime** compatibility
- Validated through **automated tests** with GitHub Actions CI/CD

### **Indexer Architecture**
- Horizontally scalable backend service with API key authentication
- Worker-based architecture with dedicated workers per blockchain
- Communication via **HyperDHT** topic-based discovery for dynamic scaling

### **UI Kit**
- **React Native (0.76+)** with partial **React (18+)** support
- Built with TypeScript, Reanimated, SVG, and Safe Area Context
- Tested with Jest and React Testing Library

***

Ready to start building with WDK? Check out our [getting started guide](../getting-started/prerequisites.md) or explore our [SDK documentation](../sdk/getting-started.md).
