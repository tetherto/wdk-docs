---
title: Wallet Modules Overview
description: Overview of all available wallet modules in the Wallet Development Kit
author: Matteo Giardino
lastReviewed: 2025-06-23
icon: puzzle
---

# Wallet Modules Overview

The Wallet Development Kit (WDK) provides a set of modules that support multiple blockchain networks. All modules share a common interface, ensuring consistent behavior across different blockchain implementations.

## Module Categories

WDK modules are organized into three main categories:

1. **Wallet Modules** - Core wallet implementations for different blockchains
2. **Swap Protocol Modules** - DeFi swap functionality across various DEXs
3. **Bridge Protocol Modules** - Cross-chain bridge functionality

## Wallet Modules

### Classic Wallet Modules

Standard wallet implementations that use native blockchain tokens for transaction fees:

| Module | Blockchain | Status | Documentation | GitHub |
|--------|------------|--------|---------------|---------|
| `@wdk/wallet-evm` | EVM | ✅ Ready | [Documentation](./wallet-evm/overview.md) | [Repository](https://github.com/tetherto/wdk-wallet-evm) |
| `@wdk/wallet-ton` | TON | ✅ Ready | [Documentation](./wallet-ton/overview.md) | [Repository](https://github.com/tetherto/wdk-wallet-ton) |
| `@wdk/wallet-btc` | Bitcoin | ✅ Ready | [Documentation](./wallet-btc/overview.md) | [Repository](https://github.com/tetherto/wdk-wallet-btc) |
| `@wdk/wallet-spark` | Spark | ✅ Ready | [Documentation](./wallet-spark/overview.md) | [Repository](https://github.com/tetherto/wdk-wallet-spark) |
| `@wdk/wallet-tron` | TRON | In progress | - | [Repository](https://github.com/tetherto/wdk-wallet-tron) |
| `@wdk/wallet-solana` | Solana | In progress | - | [Repository](https://github.com/tetherto/wdk-wallet-solana) |

### Account Abstraction Wallet Modules

Wallet implementations that support [Account Abstraction](../resources/concepts.md#account-abstraction) for gasless transactions using paymaster tokens like USDT:

| Module | Blockchain | Status | Documentation | GitHub |
|--------|------------|--------|---------------|---------|
| `@wdk/wallet-evm-erc4337` | EVM | ✅ Ready | [Documentation](./wallet-evm-erc-4337/overview.md) | [Repository](https://github.com/tetherto/wdk-wallet-evm-erc-4337) |
| `@wdk/wallet-ton-gasless` | TON | In progress | - | [Repository](https://github.com/tetherto/wdk-wallet-ton-gasless) |
| `@wdk/wallet-tron-gasfree` | TRON | In progress | - | [Repository](https://github.com/tetherto/wdk-wallet-tron-gasfree) |
| `@wdk/wallet-solana-jupiterz` | Solana | In progress | - | [Repository](https://github.com/tetherto/wdk-wallet-solana-jupiterz) |

## Swap Protocol Modules

DeFi swap functionality for token exchanges across different DEXs:

| Module | Blockchain | Status | Documentation | GitHub |
|--------|------------|--------|---------------|---------|
| `@wdk/protocol-swap-paraswap-evm` | EVM | In progress | - | [Repository](https://github.com/tetherto/wdk-protocol-swap-paraswap-evm) |
| `@wdk/protocol-swap-dedust-ton` | TON | In progress | - | [Repository](https://github.com/tetherto/wdk-protocol-swap-dedust-ton) |

## Bridge Protocol Modules

Cross-chain bridge functionality for token transfers between blockchains:

| Module | Route | Status | Documentation | GitHub |
|--------|-------|--------|---------------|---------|
| `@wdk/protocol-bridge-usdt0-evm` | EVM ↔ EVM | In progress | - | [Repository](https://github.com/tetherto/wdk-protocol-bridge-usdt0-evm) |
| `@wdk/protocol-bridge-usdt0-ton` | TON ↔ EVM | In progress | - | [Repository](https://github.com/tetherto/wdk-protocol-bridge-usdt0-ton) |

## Next steps

To get started with WDK modules, follow these steps:

1. Get up and running quickly with our [Quick Start Guide](../2-getting-started/quick-start.md)
2. Choose the modules that best fits your needs from the tables above 
3. Check specific documentation for modules you wish to use

You can also:

- Learn about key concepts like [Account Abstraction](../resources/concepts.md) and other important definitions
- Use one our ready-to-use examples to be production ready