---
title: Wallet Modules Overview
author: Matteo Giardino
lastReviewed: 2025-06-28
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
    visible: false
  metadata:
    visible: false
---

# Wallet Modules Overview

The Wallet Development Kit (WDK) provides a set of modules that support multiple blockchain networks. All modules share a common interface, ensuring consistent behavior across different blockchain implementations.

## Wallet Modules

## Core Module

The unified core module that provides a single interface for managing all supported blockchains:

| Module | Description | Status | Documentation | GitHub |
|--------|-------------|--------|---------------|---------|
| `@tetherto/wdk` | Unified WDK Core | ✅ Ready | [Documentation](../core-module) | [Repository](https://github.com/tetherto/wdk-core) |


### Classic Wallet Modules

Standard wallet implementations that use native blockchain tokens for transaction fees:

| Module | Blockchain | Status | Documentation | GitHub |
|--------|------------|--------|---------------|---------|
| `@tetherto/wdk-wallet-evm` | EVM | ✅ Ready | [Documentation](./wallet-evm/README.md) | [Repository](https://github.com/tetherto/wdk-wallet-evm) |
| `@tetherto/wdk-wallet-ton` | TON | ✅ Ready | [Documentation](./wallet-ton/README.md) | [Repository](https://github.com/tetherto/wdk-wallet-ton) |
| `@tetherto/wdk-wallet-btc` | Bitcoin | ✅ Ready | [Documentation](./wallet-btc/README.md) | [Repository](https://github.com/tetherto/wdk-wallet-btc) |
| `@tetherto/wdk-wallet-spark` | Spark | ✅ Ready | [Documentation](./wallet-spark/README.md) | [Repository](https://github.com/tetherto/wdk-wallet-spark) |
| `@tetherto/wdk-wallet-tron` | TRON | ✅ Ready | [Documentation](./wallet-tron/README.md) | [Repository](https://github.com/tetherto/wdk-wallet-tron) |
| `@tetherto/wdk-wallet-solana` | Solana | ✅ Ready | [Documentation](./wallet-solana/README.md) | [Repository](https://github.com/tetherto/wdk-wallet-solana) |
| `@tetherto/wdk-wallet-ark` | Ark | In progress | - | - |

### Account Abstraction Wallet Modules

Wallet implementations that support [Account Abstraction](../../resources/concepts.md#account-abstraction) for gasless transactions using paymaster tokens like USDT:

| Module | Blockchain | Status | Documentation | GitHub |
|--------|------------|--------|---------------|---------|
| `@tetherto/wdk-wallet-evm-erc4337` | EVM | ✅ Ready | [Documentation](./wallet-evm-erc-4337/README.md) | [Repository](https://github.com/tetherto/wdk-wallet-evm-erc-4337) |
| `@tetherto/wdk-wallet-ton-gasless` | TON | ✅ Ready | [Documentation](./wallet-ton-gasless/README.md) | [Repository](https://github.com/tetherto/wdk-wallet-ton-gasless) |
| `@tetherto/wdk-wallet-tron-gasfree` | TRON | ✅ Ready | [Documentation](./wallet-tron-gasfree/README.md) | [Repository](https://github.com/tetherto/wdk-wallet-tron-gasfree) |
| `@tetherto/wdk-wallet-solana-jupiterz` | Solana | In progress | - | - |

## Next steps

To get started with WDK modules, follow these steps:

1. Get up and running quickly with our [Quick Start Guide](../../start-building/nodejs-bare-quickstart.md)
2. Choose the modules that best fits your needs from the tables above 
3. Check specific documentation for modules you wish to use

You can also:

- Learn about key concepts like [Account Abstraction](../../resources/concepts.md#account-abstraction) and other important definitions
- Use one our ready-to-use examples to be production ready