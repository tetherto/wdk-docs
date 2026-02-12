---
title: OpenClaw
description: Give your OpenClaw AI agent a self-custodial WDK wallet in minutes
icon: lobster
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

# OpenClaw

[OpenClaw](https://openclaw.ai) is an open-source AI agent platform. With the WDK skill, your OpenClaw agent can create wallets, send transactions, swap tokens, bridge assets, and interact with DeFi protocols. Everything stays self-custodial.

{% hint style="info" %}
The WDK skill follows the [AgentSkills specification](https://agentskills.io/specification), so it works with any compatible agent platform. This page covers the OpenClaw-specific setup.
{% endhint %}

## Install the WDK Skill

Install from [ClawHub](https://clawhub.ai/HumanRupert/tether-wallet-development-kit):

```bash
clawhub install HumanRupert/tether-wallet-development-kit
```

This installs the skill into your workspace's `skills/` directory. OpenClaw picks it up automatically on the next session.

{% hint style="info" %}
A standalone GitHub repository for the WDK skill is planned. Once available, you'll also be able to install via `git clone` directly. For now, ClawHub is the recommended install method.
{% endhint %}

## Configuration

The WDK skill does not require environment variables. Your agent will ask for a seed phrase in conversation when it needs to create or recover a wallet. The seed phrase is passed as a constructor parameter in code, not stored in configuration.

{% hint style="warning" %}
Your seed phrase controls real funds. Never share it, commit it to version control, or expose it in logs. The skill instructs agents to never log or expose seed phrases or private keys.
{% endhint %}

## Verify It Works

Start a new OpenClaw session and try a simple prompt:

```
Create a multi-chain wallet with Ethereum and Bitcoin support, then show me the addresses.
```

The agent should use the WDK skill to create wallet accounts and return the generated addresses. All write operations (transactions, swaps, bridges) require your explicit confirmation before executing.

## What Your Agent Can Do

Once the skill is loaded, your agent can:

- **Create wallets** across 20+ blockchains (EVM, Bitcoin, Solana, TON, Tron, Spark)
- **Send transactions** and token transfers
- **Swap tokens** via DEX aggregators (Velora, StonFi)
- **Bridge assets** cross-chain with USDT0
- **Lend and borrow** through Aave V3
- **Buy and sell crypto** via MoonPay fiat on/off-ramps
- **Pay with x402**, the HTTP payment protocol

For the full list of capabilities and how skills work, see [Agent Skills](agent-skills.md).

## Next Steps

- [Agent Skills](agent-skills.md) - Full capabilities, how skills work, and a comparison with other agentic wallet solutions
- [MCP Toolkit](mcp-toolkit/README.md) - Programmatic wallet access for MCP-compatible agents
- [OpenClaw Skills Documentation](https://docs.openclaw.ai/tools/skills) - How OpenClaw discovers and loads skills

***

## Need Help?

{% include "../.gitbook/includes/support-cards.md" %}
