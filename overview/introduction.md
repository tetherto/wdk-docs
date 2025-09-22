---
title: Introduction to Wallet Development Kit (WDK)
description: Build complete wallet solutions with WDK's modular ecosystem - wallet modules, protocols, indexer, and secret manager working together seamlessly. Much more than just an SDK. 
author: Raquel Carrasco Gonzalez
lastReviewed: 2025-09-18
icon: lightbulb  

---

## Introduction

The **Wallet Development Kit (WDK)** is Tether's open-source ecosystem for building complete wallet solutions across multiple blockchains. Much more than just an SDK, WDK provides a modular collection of components that work together seamlessly.

This introduction covers WDK's core concepts, design philosophy, and key capabilities. To understand how all components fit together, see our [Architecture Overview](architecture.md). For a structured learning path, see our [Recommended Reading Order](#recommended-reading-order) to guide you through the complete documentation.

---

## Purpose & Design Goals

### What Problems Does WDK Solve?

Building a complete wallet requires many different parts working together:

- **Wallet Core** - Create accounts, send transactions, check balances
- **Multi-Chain Support** - Work with different blockchains (Ethereum, Bitcoin, TON, etc.)
- **DeFi Features** - Swap tokens, bridge between chains, lend/borrow
- **Data Access** - Get transaction history and real-time balances
- **Security** - Safely manage user keys and seed phrases
- **Account Abstraction** - Enable gasless transactions and smart accounts

Most developers face major challenges:

- Each blockchain needs its own SDK with different APIs
- DeFi features require separate integrations for each protocol
- Data access needs custom indexer solutions
- Security requires complex key management systems
- Everything works differently across chains

WDK solves this by providing **all the pieces** in one modular system that works together seamlessly.

---

### Use Cases

- Build wallets for creators, communities, or DAOs
- Integrate wallet functions into DeFi, payments, gaming, or tipping apps
- Develop cross-platform wallet experiences (React Native, Electron, Web)

---

### Design Philosophy
WDK is guided by three core principles:

- **Consistency** – Unified interface and API patterns across all supported blockchains.
- **Non-Custodial by Design** – users always control their keys; WDK never stores or manages them.  
- **User Experience First** – support for Account Abstraction, gasless/gasfree transactions, and Paymaster integration to remove the friction of handling gas tokens.  

---

### Why Not Just Use Individual SDKs?
Compared to ad hoc integrations or single-network SDKs, WDK offers:

- **Faster Development** – single API instead of learning multiple SDKs.  
- **Easier Maintenance** – one codebase instead of managing multiple integrations.  
- **Modular Architecture** – add protocols and blockchains without redesign.  
- **Production Ready** – built-in security, error handling, and best practices.  

WDK helps developers build faster, maintain less, and deliver better experiences.

---

## Key Features

- **Multi-Blockchain Support**: Ethereum, Polygon, Arbitrum, Bitcoin, TON, Spark, Solana
- **Unified API Layer**: A single interface across chains
- **Account Abstraction**: Enable gasless transactions & custom fee logic on EVM, TON & TRON
- **Stateless & Non-Custodial**: No data storage by WDK; developers control all keys and sensitive data
- **DeFi Ready**: Built-in support for swaps, token transfers, and cross-chain actions
- **Modular & Extensible**: Add your own chains, tokens, or business logic

---

### Key Takeaway
WDK acts as a **bridge, not a custodian**.  
It unifies access to blockchains and protocols through a modular design, while leaving keys and control entirely in the developer’s hands.  

---

## How It Works

WDK brings together different parts that work as one system to build complete wallet solutions. Each part has its own job, but they all connect to give you everything you need.

### The Complete Picture

**Wallet Modules** handle the core wallet functions - creating accounts, sending money, and checking balances across different blockchains.

**Protocol Modules** add advanced features like swapping tokens, moving money between chains, and lending.

**Indexer API** gives you fast access to blockchain data without running your own node.

**Secret Manager** keeps your users' keys safe in memory with strong protection.

**WDK Core** ties everything together with one simple interface.

### Working Together

All these parts are designed to work together perfectly. You can use any combination you need:

- Use just wallet modules for basic wallet functions
- Add protocol modules for DeFi features  
- Include the indexer for better data access
- Use secret manager for secure key handling
- Mix and match based on what your app needs

### Developer Freedom

WDK is **stateless**: it processes requests but stores nothing. All sensitive data (keys, sessions, configs) stays in your hands.

```
[Your App] → [WDK Core] → [Wallet Modules + Protocol Modules + Indexer + Secret Manager] → [Blockchains]
```

This gives you:
- No custodial risk
- Full control over your app
- Freedom to build what you want
- Easy to add or remove features

---
## Open Source Vision

We are committed to making WDK fully open-source in 2025. Join us now to shape its roadmap and be part of a growing ecosystem of developers creating the next generation of crypto wallets.

---

## Recommended Reading Order

To get the most out of WDK, we suggest reading the documentation in the following order:

1. **Introduction** – high-level purpose and orientation  
2. **Architecture** – how all components work together  
3. **Getting Started** – prerequisites and [Quick Start](../getting-started/quick-start.md) guide  
4. **Modules** – explore [Wallet Modules](../wdk-modules/overview.md) and Protocol Modules (Swaps, Bridges, Lending)  
5. **Production** – best practices in [Preparing for Production](../documentation/preparing-for-production.md)  
6. **Advanced Resources (Optional)** – Indexer, Secret Manager, and additional integrations  

---
