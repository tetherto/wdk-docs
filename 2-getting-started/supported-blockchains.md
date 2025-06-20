---
title: Supported Blockchains
description: Overview of blockchains supported by the Wallet Development Kit (WDK)
author: Raquel Carrasco Gonzalez
lastReviewed: 2025-06-20
icon: server
---

WDK is designed to make multi-chain wallet development simple and future-proof. With a single integration, you can support a wide range of blockchains—enabling your users to manage assets, transfer tokens, and interact with dApps across different networks, all from one wallet.

The table below lists the blockchains currently supported by WDK. Networks marked with ⏳ are in active development and will be available soon. If you need support for a chain not listed here, check our [Developer Guide](../7-developer-guide/README.md) for instructions on extending WDK, or reach out to the team.


| Chain      | Type        | Supported | Description                                                                   |
|------------|-------------|-----------|-------------------------------------------------------------------------------|
| Ethereum   | EVM         | ✅        | Leading smart contract platform, supports ERC-20 tokens and DeFi.             |
| Arbitrum   | L2 / EVM    | ✅        | Layer 2 scaling solution for Ethereum, fast and cost-effective.               |
| Polygon    | L2 / EVM    | ✅        | Scalable, low-fee EVM chain, ideal for dApps and DeFi.                        |
| Bitcoin    | Native      | ✅        | The original cryptocurrency, secure and widely adopted.                       |
| TON        | Non-EVM     | ✅        | High-performance blockchain for decentralized apps and payments.              |
| Spark      | *           | ✅        | Fast, low-fee Bitcoin payments via Lightning Network.                         |
| Solana     | Non-EVM     | ⏳        | Ultra-fast, low-fee chain for DeFi and NFTs with a unique parallel runtime.   |
| TRON       | Non-EVM     | ⏳        | High-throughput blockchain optimized for stablecoin transfers and payments.   |

> **Tip:** WDK’s modular architecture means you can add support for new blockchains as your project grows. See the Developer Guide for more details.

---