---
title: Prerequisites
author: Raquel Carrasco Gonzalez
lastReviewed: 2025-06-28
icon: clipboard
---

# Prerequisites

Before using the **Wallet Development Kit (WDK)**, ensure your development environment is properly set up with the following prerequisites:

- Node.js installed (20 or later)

---

## Blockchain Knowledge

This documentation will introduce the fundamental concepts required to use WDK. However, having prior knowledge of the following topics will help you get started more quickly and confidently.

### **Required Knowladge**

- [Account abstraction basics](../resources/concepts.md#account-abstraction)

### **Optional but Helpful**

- Basic blockchain concepts
- [Ethereum fundamentals](https://ethereum.org/en/what-is-ethereum/)
  - [Ethereum Virtual Machine fundamentals](https://ethereum.org/en/developers/docs/evm/)
  - [Gas fees](https://ethereum.org/en/gas/)
- [TON fundamentals](https://docs.ton.org/v3/concepts/dive-into-ton/introduction)
- [Bitcoin fundamentals](https://developer.bitcoin.org/devguide/block_chain.html)
- [Spark fundamentals](https://docs.spark.money/home/welcome)
- [Tether Tokens](https://tether.to/en/)

---

## Development Setup

### **Smart Wallet Configuration**

For a detailed example, check the Account Abstraction Configuration, but feel free to choose a configuration that best fits your needs.

- [Account Abstraction Configuration](../resources/concepts.md#account-abstraction)

### **Provider Flexibility**

You can use any RPC, bundler, or paymaster provider that is compatible with your target blockchain. WDK supports both public and private endpoints, giving you full control over your infrastructure.

**Recommended public endpoints:**
- **Ethereum Mainnet RPC:** `https://rpc.mevblocker.io/fast` or `https://eth.llamarpc.com`
- **Polygon Mainnet RPC:** `https://polygon-rpc.com`
- **Arbitrum One RPC:** `https://1rpc.io/arb`
- **Bundler/Paymaster Providers:** [Candide](https://candide.dev), [Pimlico](https://pimlico.io), or any other compatible service.

Feel free to substitute these URLs in your wallet configuration, or use your own infrastructure for greater reliability, privacy, or performance.

> **How can I obtain this?**
> You can use the public endpoints listed above, find others in official network documentation, or set up your own node or service provider for maximum control.
>
> **Why are they needed?**
> These endpoints connect your wallet to the blockchain and to services that enable advanced features like account abstraction and gas sponsorship. Without them, your wallet cannot send transactions, check balances, or interact with smart contracts.


---

## Next Steps

* [Create your first wallet using WDK](./quick-start.md)

or 

* [Learn more about Account Abstraction](../resources/concepts.md#account-abstraction)