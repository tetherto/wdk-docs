---
title: Agent Skills
description: Give any AI agent self-custodial wallet capabilities with WDK agent skills
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

# Agent Skills

WDK provides agent skills: structured instruction sets that teach AI agents how to create wallets, send transactions, swap tokens, bridge assets, and interact with DeFi protocols across 20+ blockchains. All operations are self-custodial. Keys stay on your machine, with no third-party custody dependency.

{% hint style="info" %}
**Skill vs MCP Toolkit**: Use an **agent skill** when your agent platform works with file-based instructions (e.g., OpenClaw, Cursor). Use the [MCP Toolkit](mcp-toolkit/README.md) when your agent supports the Model Context Protocol natively (e.g., Claude, Cursor). Use both for maximum coverage.
{% endhint %}

## What Are Agent Skills?

An agent skill is a structured set of instructions and reference documentation that teaches an AI agent to use a specific tool or SDK. Skills follow the [AgentSkills specification](https://agentskills.io/specification). Each skill is a `SKILL.md` file with frontmatter metadata and detailed instructions that any compatible agent can load and execute.

WDK publishes a skill that covers the full SDK surface: wallet modules, swap, bridge, lending, fiat on/off-ramps, and the indexer. When an agent loads the skill, it learns WDK's APIs so you don't need blockchain expertise to get started.

## Capabilities

Once an agent loads the WDK skill, it can:

| Category | Operations |
| --- | --- |
| **Wallets** | Create and recover wallets across EVM chains, Bitcoin, Solana, Spark, TON, and Tron |
| **Transactions** | Send native tokens and token transfers (ERC-20, SPL, Jetton, TRC-20) |
| **Swaps** | DEX swaps via Velora (EVM) and StonFi (TON) |
| **Bridges** | Cross-chain bridges with USDT0 via LayerZero |
| **Lending** | Supply, borrow, repay, and withdraw via Aave V3 |
| **Fiat** | Buy and sell crypto via MoonPay on/off-ramps |
| **Payments** | x402 HTTP payment protocol support |
| **Gasless** | Fee-free transfers on TON (via paymaster) and Tron (via gas-free service), and ERC-4337 account abstraction on EVM |

{% hint style="warning" %}
All write operations require explicit human confirmation. The skill instructs agents to estimate fees before sending and includes prompt injection protection guidance.
{% endhint %}

## How It Works

1. **Install the skill** by cloning the skill repository or installing from a skill registry like [ClawHub](https://clawhub.ai/HumanRupert/tether-wallet-development-kit)
2. **Agent loads the skill** and reads `SKILL.md` along with per-module reference files to learn WDK's API surface
3. **Agent executes operations** when you ask it to create a wallet or send a transaction, generating the correct WDK code
4. **You confirm** before any write operation (transactions, swaps, bridges) goes through

The skill includes security guidance: pre-transaction validation checklists, prompt injection detection rules, and mandatory key cleanup patterns.

## Self-Custodial vs Hosted

WDK's agent skills use a self-custodial model where your agent controls its own keys locally. This differs from hosted solutions where a third party manages your keys.

| Feature | WDK | Coinbase Agentic Wallet | Privy Server Wallets |
| --- | --- | --- | --- |
| Custody model | Self-custodial | Coinbase-hosted | Privy-hosted (server) |
| Multi-chain | Yes (EVM, Bitcoin, Solana, TON, Tron, Spark) | Base only | EVM + Solana |
| Open source | Yes (SDK + skills) | CLI/skills open, infra closed | Skills open, API closed |
| MCP support | Yes ([MCP Toolkit](mcp-toolkit/README.md)) | Via skills | Via skills |
| OpenClaw support | Yes ([ClawHub skill](https://clawhub.ai/HumanRupert/tether-wallet-development-kit)) | Yes (npx skills) | Yes (ClawHub skill) |
| x402 payments | Yes (native) | Yes (native) | No |
| Key management | Local / self-managed | Coinbase infrastructure | Privy infrastructure |

## Use With Agent Platforms

| Platform | How to Use |
| --- | --- |
| **OpenClaw** | Install from [ClawHub](openclaw.md) or clone to workspace. See [OpenClaw Integration](openclaw.md) |
| **Claude** | Upload `SKILL.md` as project knowledge, or paste into conversation |
| **Cursor / Windsurf** | Clone to `.cursor/skills/wdk` or `.windsurf/skills/wdk` |
| **Any MCP-compatible agent** | Use the [MCP Toolkit](mcp-toolkit/README.md) for structured tool calling |
| **Any other agent** | Copy `SKILL.md` into system prompt or conversation context |

## Community Projects

Projects built by the community using WDK's agentic capabilities:

| Project | Description |
| --- | --- |
| [wdk-wallet-evm-x402-facilitator](https://github.com/SemanticPay/wdk-wallet-evm-x402-facilitator) | Agent-to-agent payments using the x402 HTTP payment protocol |
| [x402-usdt0](https://github.com/baghdadgherras/x402-usdt0) | Reference implementation of x402 on Plasma with USDT0 |
| [Novanet zkML Guardrails](https://github.com/hshadab/tether) | Zero-knowledge ML safety checks for wallet operations |

## Resources

- [WDK Skill on ClawHub](https://clawhub.ai/HumanRupert/tether-wallet-development-kit) - Install the skill
- [AgentSkills Specification](https://agentskills.io/specification) - The skill format standard
- [WDK MCP Toolkit](https://github.com/tetherto/wdk-mcp-toolkit) - MCP server for structured tool calling
- [WDK Core](https://github.com/tetherto/wdk-core) - The core SDK

***

## Need Help?

{% include "../.gitbook/includes/support-cards.md" %}
