---
title: Wallet Development Kit (WDK) Documentation
author: Raquel Carrasco Gonzalez
lastReviewed: 2025-09-15
icon: book-open
---
<p align="center">
  <img src="./assets/logo.png" width="120" />
</p>

# Wallet Development Kit (WDK)

The Wallet Development Kit (WDK) is a **developer-first SDK** for deploying **non-custodial wallets** across multiple blockchains.  

It’s designed to be **flexible, modular, and consistent**, whether you are building wallets for your users or experimenting with your own custody solutions. WDK includes **protocol modules**—Swap, Bridge, Lending—and an **Indexer API**, simplifying cross-chain interactions and multi-chain wallet management.

On top of that, WDK provides **UI templates** and a **unified SDK**, keeping wallet functions and methods consistent across different blockchains, so developers can focus on building **robust integrations** rather than reinventing blockchain logic.

---

## Why WDK is Different

WDK isn’t just another wallet SDK:  

- **Runs Anywhere**: Node.js, Bare runtime, mobile environments—your choice.  
- **Flexible & Modular**: Use only what you need, extend with custom modules.  
- **Developer-Centric**: Clear SDK, detailed documentation, and ready-to-use examples.  
- **Zero Lock-In**: Fully self-custodial; no dependencies on external services.

---

## Who is WDK for?

- **New developers**: Create mobile/web wallets in minutes using a familiar JS/TS interface
- **Experienced engineers**: Integrate advanced features like account abstraction without reinventing the wheel. Customize flows like tipping, swapping, buying/selling, and more.
- **Startups & Enterprises**:Launch wallet products with full ownership of UX, logic, and keys.
- **Educators & Innovators**:Use WDK to prototype, test, and teach wallet development across major blockchains

---

## How to Get Started

Independendlty on your experience and goals:

1. [Create your first wallet using WDK](getting-started/quick-start.md) – see WDK in action with a working example.  

Next, depending on your experience and goals:

### For Beginners
1. [Check the WDK core module](wdk-modules/wallet-modules/wdk-core/overview.md) – install dependencies and runtime environments.  
2. [Explore WDK Examples & UI Templates]() – see working examples, install dependencies, and set up your runtime environment.

### For Intermediate Users
1. [Check the WDK core module](wdk-modules/wallet-modules/wdk-core/overview.md) – install dependencies and runtime environments.  
2. [Explore WDK Examples & UI Templates]() – see working examples, install dependencies, and set up your runtime environment.
3. Integrate [Secret Key Manager](wdk-modules/wallet-modules/wdk-core/overview.md) – securely manage wallet keys with encryption, multi-device sync, and backup/recovery options.
4. Integrate the [Public Indexer API](documentation/indexer-overview.md) – connect your wallet to the Indexer using your API keys to fetch transaction history and query multi-chain wallet data securely.

### For Advanced Users

1. Explore [Wallet Modules Overview](wdk-modules/wallet-modules/overview.md) – understand how each blockchain wallet works (EVM, BTC, TON, Solana, Tron).  
2. Explore [Indexer Modules]() – learn how to set up and use your own Indexer for querying transaction history and multi-chain wallet data.
3. Check [Swap, Bridge, and Lending Modules](wdk-modules/overview.md) – integrate decentralized exchanges, cross-chain bridges, and lending/borrowing functionalities.

---

## Key Resources

- **WDK Manager**: [Core Module](./wdk-modules/wallet-modules/wdk-core/overview.md)  
- **Core Concepts**: [Concepts](resources/concepts.md) – wallets, accounts, transactions  
- **Production Readiness**: [Preparing for Production](documentation/preparing-for-production.md) – security & scaling best practices  
- **Transaction History**: [Indexer Overview](documentation/indexer-overview.md) – history setup & queries  
- **Secret Key Manager**: [Secret Manager](wdk-modules/wallet-modules/wdk-core/overview.md) – encrypted key storage, sync, recovery  
- **Paymaster**: [Paymaster Guide](wdk-modules/wallet-modules/wallet-evm-erc-4337/guides.md) – gasless tx, sponsorships, fee management  
- **Examples & Templates**: Ready-to-use wallet examples for fast integration  
- **Runtimes**: [Compatibility](./documentation/using-bare-runtime.md) – Node & Bare 

---

## Audience, Scope & Maintenance

- **Audience**: Developers integrating wallets for themselves or their users.  
- **Scope**: Core wallet functionalities, multi-chain support, and modular extensions like swaps, bridges, and lending.  
- **Maintenance**: WDK is actively developed and evolving. Expect updates, enhancements, and improvements over time.

---

## Private Beta Partner Guidelines

As a beta partner, you get early access to WDK and **help shape its future**. In return, please:

- **Provide Feedback**: Share experiences, suggestions, and feature requests.  
- **Report Bugs**: Notify us of any issues or unexpected behavior.  
- **Respect Confidentiality**: Keep documentation and code within your team.  
- **Collaborate**: Engage with our team for guidance or support.

Your input is invaluable to making WDK the most developer-friendly wallet SDK.

---

## Supported Blockchains

WDK supports a growing set of blockchains. This list is continuously expanding, with **more integrations coming soon**. Chains marked with ⏳ are in active development.

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

