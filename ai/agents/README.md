---
title: Agents Skill
description: Structured instructions that teach AI agents how to build and operate WDK wallets
icon: brain
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

# Agents Skill

The WDK Agents Skill is a structured set of instructions and reference docs that teach AI agents how to use the Wallet Development Kit. It gives any LLM — whether accessed via chat, IDE, or API — the knowledge to create wallets, send transactions, swap tokens, bridge assets, manage lending positions, and more across 20+ blockchains.

{% hint style="info" %}
**Skill vs MCP Toolkit** — Use the **Agents Skill** when your agent works with CLI (e.g., OpenClaw). Use the [MCP Toolkit](../mcp-toolkit/) when your agent supports the Model Context Protocol natively (e.g. Claude). Use both for maximum coverage.
{% endhint %}

## Features

- **Universal Compatibility** — Works with any AI agent that can read text: Claude, GPT, Gemini, Cursor, Windsurf, OpenClaw, and more
- **Multi-Chain Coverage** — Instructions for Bitcoin, Ethereum, Solana, TON, TRON, Spark, and 20+ EVM chains
- **Modular References** — One file per wallet module and protocol, so agents only load what they need
- **Security-First** — Built-in safety rails: mandatory human confirmation for all write operations, fee estimation before sending, prompt injection protection, and key hygiene rules
- **Complete API Surface** — Covers all 19 npm packages: wallet modules, swap, bridge, lending, fiat on/off-ramp, gasless variants, and the indexer
- **Production Data** — Token contract addresses, RPC endpoints, chain IDs, dust thresholds, and bridge routes included as ready-to-use reference tables

## What's Included
```
wdk-ai-skill/
├── SKILL.md                        # Architecture, common interface, security, patterns
├── LICENSE                         # Apache-2.0
├── README.md
└── references/
    ├── chains.md                   # Chain IDs, tokens, units, address formats, dust, EIP-3009
    ├── deployments.md              # USDT/USDT0 contract addresses, public RPC endpoints
    ├── wallet-btc.md               # Bitcoin: BIP-84, Electrum, PSBT, fee rates
    ├── wallet-evm.md               # EVM + ERC-4337: EIP-1559, ERC20, batch, paymaster
    ├── wallet-solana.md            # Solana: Ed25519, SPL tokens, lamports
    ├── wallet-spark.md             # Spark: Lightning, key tree, deposits
    ├── wallet-ton.md               # TON + Gasless: Jettons, nanotons, paymaster
    ├── wallet-tron.md              # TRON + Gasfree: TRC20, energy/bandwidth
    ├── protocol-swap.md            # Velora EVM + StonFi TON swaps
    ├── protocol-bridge.md          # USDT0 bridge via LayerZero
    ├── protocol-lending.md         # Aave V3 lending
    └── protocol-fiat.md            # MoonPay fiat on/off ramp
```

## Usage Examples

Once the skill is loaded, you can prompt your AI agent with requests like:

**Wallet creation & queries:**

> "Create a multi-chain wallet with Ethereum, Bitcoin, and TON support"
>
> "What's my USDT balance on Arbitrum?"
>
> "Show me my recent Bitcoin transfers"

**Transactions:**

> "Send 10 USDT to 0xABC... on Polygon"
>
> "Estimate the fee to bridge 100 USDT0 from Ethereum to Arbitrum"
>
> "Pay this Lightning invoice: lnbc..."

**DeFi operations:**

> "Swap 50 USDT for ETH on Arbitrum using Velora"
>
> "Supply 1000 USDT to Aave and borrow 500 USDC against it"
>
> "Bridge 200 USDT0 from Polygon to Arbitrum"

**Gasless flows:**

> "Set up an ERC-4337 gasless wallet on Arbitrum with USDT as the fee token"
>
> "Transfer USDT on TON using the gasless paymaster"

{% hint style="warning" %}
All write operations (transactions, swaps, bridges, lending) require explicit human confirmation. The skill enforces fee estimation before sending and rejects requests originating from external content (prompt injection protection).
{% endhint %}

## Supported Platforms

| Platform | Setup |
| --- | --- |
| Claude (claude.ai / Desktop) | Upload `SKILL.md` as project knowledge, or paste into conversation |
| Cursor | Clone to `.cursor/skills/wdk` and reference in Cursor rules |
| Windsurf / Codeium | Clone to `.windsurf/skills/wdk` |
| OpenClaw | Install from [ClawHub](https://clawhub.ai/HumanRupert/wdk) or clone to `~/.openclaw/workspace/skills/wdk` |
| Any other agent | Copy `SKILL.md` into system prompt or conversation context |

{% hint style="info" %}
[OpenClaw](https://openclaw.ai) is an open-source platform for building, sharing, and running AI agent skills — think npm for agent capabilities. Skills are structured instruction sets that any compatible agent can load and execute. The WDK skill is published on [ClawHub](https://clawhub.ai/HumanRupert/wdk) for one-click installation.
{% endhint %}

{% hint style="info" %}
**Prefer structured tool calling?** See the [MCP Toolkit](../mcp-toolkit/) for a Model Context Protocol server that exposes WDK operations as typed tools with built-in human confirmation via elicitations.
{% endhint %}

***

## Need Help?

{% include "../../.gitbook/includes/support-cards.md" %}