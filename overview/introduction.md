---
title: Introduction to Wallet Development Kit (WDK)
description: Build secure, multi-chain wallets with WDK's unified API and non-custodial architecture.
author: Raquel Carrasco Gonzalez
lastReviewed: 2025-09-18
icon: lightbulb  

---

## Introduction

The **Wallet Development Kit (WDK)** is Tether's open-source solution for building secure, non-custodial wallets across multiple blockchains. 

This introduction covers WDK's core concepts, design philosophy, and key capabilities. For a structured learning path, see our [Recommended Reading Order](reading-order.md) to guide you through the complete documentation.

---

## Purpose & Design Goals

### What Problems Does WDK Solve?
Most wallets are built for a single blockchain or ecosystem (e.g., Ethereum, Solana, Bitcoin).

This creates major challenges for developers who want to support multiple networks in one product:

- Each network requires its own SDK or integration.  
- Functions and methods vary across chains, making development inconsistent.  
- Developers spend time re-learning patterns and maintaining fragmented codebases.  

WDK removes these barriers by providing a **consistent SDK** that abstracts away blockchain differences.

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

WDK is **stateless**: it processes requests but stores nothing. All sensitive data (keys, sessions, configs) stays in your hands.

```
[Your App] → [WDK API] → [Ethereum | Bitcoin | TON | Spark | Tron | Solana]
```

This guarantees:
- No custodial risk
- Full user control
- Flexibility to scale or pivot

---
## Open Source Vision

We are committed to making WDK fully open-source in 2025. Join us now to shape its roadmap and be part of a growing ecosystem of developers creating the next generation of crypto wallets.

---
