---
title: MCP Toolkit
description: Build MCP servers that give AI agents self-custodial WDK wallets
icon: wand-magic-sparkles
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

# MCP Toolkit

The MCP Toolkit lets AI agents interact with self-custodial WDK wallets. It creates an [MCP server](https://modelcontextprotocol.io/) that exposes wallet operations (checking balances, sending transactions, swapping tokens, bridging assets, and more) as structured tools that any MCP-compatible AI client can call.

Powered by [`@tetherto/wdk-mcp-toolkit`](https://github.com/tetherto/wdk-mcp-toolkit).

{% hint style="warning" %}
**Beta** - This package is in active development (`v1.0.0-beta.1`). APIs may change between releases.
{% endhint %}

{% embed url="https://files.gitbook.com/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FRwT8I8B1DP5OZiLSjSCW%2Fuploads%2F4bLqUGsw5krkbnRiAEmx%2F543206805-9fc1aa65-b76b-4569-bac0-42f75ccdc1ce.mp4?alt=media&token=25181754-0e5d-4497-b59c-ebc8c955675e" %}

## Features

- **MCP Server Extension** - Extends the official `@modelcontextprotocol/sdk` McpServer with WDK-specific capabilities
- **Multi-Chain** - Support for 13 blockchains out of the box, including EVM chains, Bitcoin, Solana, Spark, TON, and Tron
- **35 Built-in Tools** - Ready-to-use tools for wallets, pricing, indexer queries, swaps, bridges, lending, and fiat on/off-ramps
- **Human Confirmation** - All write operations use MCP elicitations to require explicit user approval before broadcasting transactions
- **Extensible** - Register custom tools alongside built-in ones using standard MCP SDK patterns
- **Secure by Design** - Seed phrases stay local, `close()` wipes keys from memory, and read/write tool separation lets you control access

## Supported Chains

| Chain | Identifier |
| --- | --- |
| Ethereum | `ethereum` |
| Polygon | `polygon` |
| Arbitrum | `arbitrum` |
| Optimism | `optimism` |
| Base | `base` |
| Avalanche | `avalanche` |
| BNB Chain | `bnb` |
| Plasma | `plasma` |
| Bitcoin | `bitcoin` |
| Solana | `solana` |
| Spark | `spark` |
| TON | `ton` |
| Tron | `tron` |

{% hint style="info" %}
You can register **any** blockchain name - the `CHAINS` constants are for convenience only. For custom chains, register tokens manually with `registerToken()`.
{% endhint %}

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
				<i class="fa-rocket">:rocket:</i>
			</td>
			<td>
				<strong>Get Started</strong>
			</td>
			<td>Install and run your first MCP server in minutes</td>
			<td>
				<a href="./get-started.md">get-started.md</a>
			</td>
		</tr>
		<tr>
			<td>
				<i class="fa-wrench">:wrench:</i>
			</td>
			<td>
				<strong>Configuration</strong>
			</td>
			<td>Wallets, capabilities, tokens, protocols, and custom tools</td>
			<td>
				<a href="./configuration.md">configuration.md</a>
			</td>
		</tr>
		<tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>API Reference</strong>
			</td>
			<td>All 35 built-in MCP tools and the WdkMcpServer class</td>
			<td>
				<a href="./api-reference.md">api-reference.md</a>
			</td>
		</tr>
	</tbody>
</table>

{% hint style="info" %}
**Already using an AI coding assistant?** See [Build with AI](../../start-building/build-with-ai.md) for how to connect WDK docs as context via MCP or Markdown.
{% endhint %}

***

## Need Help?

{% include "../../.gitbook/includes/support-cards.md" %}
