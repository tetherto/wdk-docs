---
title: About WDK
description: Learn about the Wallet Development Kit and its capabilities
icon: book-open
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

# About WDK

The **Wallet Development Kit _by Tether_ (WDK)** is Tether's open-source toolkit that empowers humans, machines and AI agents alike to build, deploy and use secure, multi-chain, self-custodial wallets that can be integrated anywhere from the smallest embedded device to any mobile, desktop and server operating system.

A developer-first framework designed for maximum flexibility and scalability, powering anything from consumer wallets to wallet-enabled apps, DeFi integrations (lending, swaps, ...), IoT use cases, and AI agents.

Unlike closed solutions or SaaS-based wallet infrastructure providers, WDK offers zero lock-in and is designed for maximum flexibility and extensibility. It is modular, runs on Bare, Node.js and React-Native, thus can be embedded in a wide variety of environments.

***

## What Problems Does WDK Solve?

The current blockchain ecosystem is highly fragmented, with each blockchain requiring different SDKs, APIs, and integration approaches. This fragmentation creates significant barriers for developers who want to build truly seamless user-experiences that span across any blockchain, environment and use-case.

Traditional wallet development requires months of integration work. Developers must learn different standards, implement contrasting security practices, or rely on closed-source paid solutions which act as gatekeepers.

### **The Missing AI Foundation**

As we move toward a world where humans, machines and AI Agents need to manage digital assets safely, existing solutions fall short. AI agents will require wallets to interact in the financial infrastructure, and WDK wants to lay secure foundation that works for human, AI and IoT use cases. WDK enables trillions of self-custodial wallets.

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
			<td>
				<strong>Runs Anywhere</strong>
			</td>
			<td>Works with Node.js, Bare runtime, mobile (React Native), and future embedded environments</td>
			<td>
				<a href="../assets/runs-anywhere.png">runs-anywhere.png</a>
			</td>
		</tr>
		<tr>
			<td>
				<strong>Modular &#x26; Extensible</strong>
			</td>
			<td>Pick only the modules you need; extend functionality with custom modules</td>
			<td>
				<a href="../assets/modular.png">modular.png</a>
			</td>
		</tr>
		<tr>
			<td>
				<strong>Developer-Centric</strong>
			</td>
			<td>Clear SDK design, strong TypeScript typing, extensive docs, and ready-to-use starters</td>
			<td>
				<a href="../assets/developer-centric.png">developer-centric.png</a>
			</td>
		</tr>
		<tr>
			<td>
				<strong>Secure by Design</strong>
			</td>
			<td>Stateless and self-custodial architecture ensures keys never leave user control</td>
			<td>
				<a href="../assets/secure.png">secure.png</a>
			</td>
		</tr>
		<tr>
			<td>
				<strong>Zero Lock-In</strong>
			</td>
			<td>Transparent, community-driven, and free to adopt with no vendor lock-in</td>
			<td>
				<a href="../assets/zero-lock-in.png">zero-lock-in.png</a>
			</td>
		</tr>
		<tr>
			<td>
				<strong>Ecosystem-Backed</strong>
			</td>
			<td>Maintained and supported by Tether with strong community involvement</td>
			<td>
				<a href="../assets/ecosystem.png">ecosystem.png</a>
			</td>
		</tr>
	</tbody>
</table>


***

## What WDK Provides

WDK combines four core components to deliver a complete wallet development solution:

<table data-card-size="large" data-view="cards">
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
			<td>
				<strong>Modular SDK</strong>
			</td>
			<td>Unified APIs for wallet and protocol operations across multiple blockchains</td>
			<td>
				<a href="../sdk/get-started.md">getting-started.md</a>
			</td>
			<td>
				<a href="../assets/product-sdk.png">product-sdk.png</a>
			</td>
		</tr>
		<tr>
			<td>
				<strong>Indexer API</strong>
			</td>
			<td>Reliable blockchain data access for balances, transactions, and historical data</td>
			<td>
				<a href="../tools/indexer-api/README.md">indexer</a>
			</td>
			<td>
				<a href="../assets/product-indexer.png">product-indexer.png</a>
			</td>
		</tr>
		<tr>
			<td>
				<strong>UI Kits</strong>
			</td>
			<td>Reusable React Native components for building wallet interfaces</td>
			<td>
				<a href="../ui-kits/react-native-ui-kit/">react-native</a>
			</td>
			<td>
				<a href="../assets/product-ui-kit.png">product-ui-kit.png</a>
			</td>
		</tr>
		<tr>
			<td>
				<strong>Examples &#x26; Starters</strong>
			</td>
			<td>Production-ready wallet templates and reference implementations</td>
			<td>
				<a href="../examples-and-starters/react-native-starter.md">react-native</a>
			</td>
			<td>
				<a href="../assets/product-starters.png">product-starters.png</a>
			</td>
		</tr>
	</tbody>
</table>

***

## Supported Blockchains & Protocols

WDK natively supports a broad set of blockchains and standards out of the box:

{% tabs %}
{% tab title="Wallet Modules" %}
| Blockchain/Module                                               | Support |
| --------------------------------------------------------------- | ------- |
| [Bitcoin](../sdk/wallet-modules/wallet-btc/)                    | ✅       |
| [Ethereum & EVM](../sdk/wallet-modules/wallet-evm/)             | ✅       |
| [Ethereum ERC-4337](../sdk/wallet-modules/wallet-evm-erc-4337/) | ✅       |
| [TON](../sdk/wallet-modules/wallet-ton/)                        | ✅       |
| [TON Gasless](../sdk/wallet-modules/wallet-ton-gasless/)        | ✅       |
| [TRON](../sdk/wallet-modules/wallet-tron/)                      | ✅       |
| [TRON Gasfree](../sdk/wallet-modules/wallet-tron-gasfree/)      | ✅       |
| [Solana](../sdk/wallet-modules/wallet-solana/)                  | ✅       |
| [Spark/Lightning](../sdk/wallet-modules/wallet-spark/)          | ✅       |
{% endtab %}

{% tab title="DeFi Modules" %}
| Protocol/Module                                                | Support |
| -------------------------------------------------------------- | ------- |
| [velora (EVM)](../sdk/swap-modules/swap-velora-evm/)       | ✅       |
| [USD₮0 Bridge (EVM)](../sdk/bridge-modules/bridge-usdt0-evm/)  | ✅       |
| [Aave Lending (EVM)](../sdk/lending-modules/lending-aave-evm/) | ✅       |


{% endtab %}
{% endtabs %}

The modular architecture allows new chains, tokens, or protocols to be added by implementing dedicated modules.

Ready to start building? Explore our [getting started guide](../start-building/nodejs-bare-quickstart.md) or dive into our [SDK documentation](../sdk/get-started.md). 
