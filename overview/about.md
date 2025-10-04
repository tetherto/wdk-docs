---
title: About WDK
description: Learn about the Wallet Development Kit - the problems it solves, and how it enables secure multi-chain wallet development
icon: lightbulb
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

The **Wallet Development Kit (WDK)** is Tether's open-source initiative to enable developers to build secure, multi-chain, non-custodial wallets with minimal effort. 

A developer-first framework designed for maximum flexibility, supporting everything from consumer wallets to wallet-enabled apps, DeFi integrations, IoT use cases, and AI agents. It enables the future where programmable money becomes the standard for value exchange, replacing traditional financial infrastructure with transparent, efficient, and accessible digital rails.

Unlike closed solutions or SaaS-based wallet infrastructure providers, WDK offers zero-lock in and designed for maximum flexibility and extensibility. It is modular, runs on Bare, thus can be embedded in a wide variety of environments - from mobile apps to autonomous systems.

***

## What Problems Does WDK Solve?

The current blockchain ecosystem is highly fragmented, with each chain requiring different SDKs, APIs, and integration approaches. This fragmentation creates significant barriers for developers who want to build truly multi-chain applications.

Traditional wallet development requires months of integration work. Developers must learn different standards, implement various security practices, or rely on closed-source solutions.

### **The Missing Foundation**

As we move toward a world where both humans and machines need to manage digital assets safely, existing solutions fall short. AI agents will require wallets to interact in the finacial infrastructure, and WDK wants to lay secure secure foundation that works for both human and AI use cases.
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
			<td><a href="../assets/card-placeholder1.svg">placeholder.svg</a></td>
		</tr>
		<tr>
			<td><strong>Modular & Extensible</strong></td>
			<td>Pick only the modules you need; extend functionality with custom modules</td>
			<td><a href="../assets/card-placeholder2.svg">placeholder.svg</a></td>
		</tr>
		<tr>
			<td><strong>Developer-Centric</strong></td>
			<td>Clear SDK design, strong TypeScript typing, extensive docs, and ready-to-use starters</td>
			<td><a href="../assets/card-placeholder3.svg">placeholder.svg</a></td>
		</tr>
    <tr>
			<td><strong>Secure by Design</strong></td>
			<td>Stateless and non-custodial architecture ensures keys never leave user control</td>
			<td><a href="assets/card-placeholder2.svg">placeholder.svg</a></td>
		</tr> 
		<tr>
			<td><strong>Zero Lock-In</strong></td>
			<td>Transparent, community-driven, and free to adopt with no vendor lock-in</td>
			<td><a href="../assets/card-placeholder1.svg">placeholder.svg</a></td>
		</tr>
		<tr>
			<td><strong>Ecosystem-Backed</strong></td>
			<td>Maintained and supported by Tether with strong community involvement</td>
			<td><a href="../assets/card-placeholder2.svg">placeholder.svg</a></td>
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
			<td><a href="../assets/card-placeholder1.svg">placeholder.svg</a></td>
		</tr>
		<tr>
			<td><strong>Indexer API</strong></td>
			<td>Reliable blockchain data access for balances, transactions, and historical data</td>
			<td><a href="../tools/indexer/README.md">Indexer Documentation</a></td>
			<td><a href="../assets/card-placeholder2.svg">placeholder.svg</a></td>
		</tr>
		<tr>
			<td><strong>UI Kits</strong></td>
			<td>Reusable React Native components for building wallet interfaces</td>
			<td><a href="../ui-kit/react-native/README.md">UI Kit Documentation</a></td>
			<td><a href="../assets/card-placeholder3.svg">placeholder.svg</a></td>
		</tr>
		<tr>
			<td><strong>Examples & Starters</strong></td>
			<td>Production-ready wallet templates and reference implementations</td>
			<td><a href="../starters/react-native/README.md">Starter Documentation</a></td>
			<td><a href="../assets/card-placeholder1.svg">placeholder.svg</a></td>
		</tr>
	</tbody>
</table>

***

## Supported Blockchains & Protocols

WDK natively supports a broad set of blockchains and standards out of the box:

{% tabs %}
{% tab title="Wallet Modules" %}

| Chain/Module                                                      | Type             | Supported |
|-------------------------------------------------------------------|------------------|-----------|
| [EVM](../wdk-modules/wallet-modules/wallet-evm/overview.md)   | EVM  /  L2       | ✅        |
| [EVM ERC-4337](../wdk-modules/wallet-modules/wallet-evm-erc-4337/overview.md)       | EVM Gasless      | ✅        |
| [Bitcoin](../wdk-modules/wallet-modules/wallet-btc/overview.md)                     | Native           | ✅        |
| [TON](../wdk-modules/wallet-modules/wallet-ton/overview.md)                         | Non-EVM          | ✅        |
| [TON Gasless](../wdk-modules/wallet-modules/wallet-ton-gasless/overview.md)         | TON Gasless      | ✅        |
| [Spark](../wdk-modules/wallet-modules/wallet-spark/overview.md)                     | *                | ✅        |
| [Solana](../wdk-modules/wallet-modules/wallet-solana/overview.md)                   | Non-EVM          | ✅        |
| [TRON](../wdk-modules/wallet-modules/wallet-tron/overview.md)                       | Non-EVM          | ✅        |
| [TRON Gasfree](../wdk-modules/wallet-modules/wallet-tron-gasfree/overview.md)       | TRON Gasfree     | ✅        |
| [Ark](https://github.com/tetherto/wdk-wallet-ark)    | *    | ⏳        |

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


Ready to start building with WDK? Check out our [getting started guide](../getting-started/prerequisites.md) or explore our [SDK documentation](../sdk/getting-started.md).
