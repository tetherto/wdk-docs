---
title: About WDK
description: Learn about the Wallet Development Kit and it's capabilities
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

A developer-first framework designed for maximum flexibility, supporting everything from consumer wallets to wallet-enabled apps, DeFi integrations, IoT use cases, and AI agents.

Unlike closed solutions or SaaS-based wallet infrastructure providers, WDK offers zero-lock in and designed for maximum flexibility and extensibility. It is modular, runs on Bare, thus can be embedded in a wide variety of environments - from mobile apps to autonomous systems.

***

## What Problems Does WDK Solve?

The current blockchain ecosystem is highly fragmented, with each chain requiring different SDKs, APIs, and integration approaches. This fragmentation creates significant barriers for developers who want to build truly multi-chain applications.

Traditional wallet development requires months of integration work. Developers must learn different standards, implement various security practices, or rely on closed-source paid solutions.

### **The Missing AI Foundation**

As we move toward a world where both humans and machines need to manage digital assets safely, existing solutions fall short. AI agents will require wallets to interact in the finacial infrastructure, and WDK wants to lay secure foundation that works for both human and AI use cases.
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
			<td><a href="../assets/card-placeholder2.svg">placeholder.svg</a></td>
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

| Blockchain/Module | Support |
|-------------------|---------|
| [Bitcoin](../sdk/wallet-modules/wallet-btc/README.md) | ✅ |
| [Ethereum & EVM](../sdk/wallet-modules/wallet-evm/README.md) | ✅ |
| [Ethereum ERC-4337](../sdk/wallet-modules/wallet-evm-erc-4337/README.md) | ✅ |
| [TON](../sdk/wallet-modules/wallet-ton/README.md) | ✅ |
| [TON Gasless](../sdk/wallet-modules/wallet-ton-gasless/README.md) | ✅ |
| [TRON](../sdk/wallet-modules/wallet-tron/README.md) | ✅ |
| [TRON Gasfree](../sdk/wallet-modules/wallet-tron-gasfree/README.md) | ✅ |
| [Solana](../sdk/wallet-modules/wallet-solana/README.md) | ✅ |
| [Spark/Lightning](../sdk/wallet-modules/wallet-spark/README.md) | ✅ |

{% endtab %}

{% tab title="DeFi Modules" %}

| Protocol/Module | Support |
|-----------------|---------|
| [ParaSwap (EVM)](../sdk/swap-modules/swap-paraswap-evm/README.md) | ✅ |
| [StonFi (TON)](../sdk/swap-modules/swap-stonfi-ton/README.md) | ✅ |
| [USDT0 Bridge (EVM)](../sdk/bridge-modules/bridge-usdt0-evm/README.md) | ✅ |
| [USDT0 Bridge (TON)](../sdk/bridge-modules/bridge-usdt0-ton/README.md) | ✅ |
| [Aave Lending (EVM)](../sdk/lending-modules/lending-aave-evm/README.md) | ✅ |

{% endtab %}
{% endtabs %}

The modular architecture allows new chains, tokens, or protocols to be added by implementing dedicated modules.


Ready to start building with WDK? Check out our [getting started guide](../getting-started/prerequisites.md) or explore our [SDK documentation](../sdk/getting-started.md).
