---
title: Wallet Modules Overview
author: Matteo Giardino
lastReviewed: 2025-06-28
---

# Wallet Modules Overview

The Wallet Development Kit (WDK) provides a set of modules that support multiple blockchain networks. All modules share a common interface, ensuring consistent behavior across different blockchain implementations.

## Wallet Modules

### Classic Wallet Modules

Standard wallet implementations that use native blockchain tokens for transaction fees:

| Module | Blockchain | Status | Documentation | GitHub |
|--------|------------|--------|---------------|---------|
| `@wdk/wallet-evm` | EVM | ✅ Ready | [Documentation](./wallet-evm/overview.md) | [Repository](https://github.com/tetherto/wdk-wallet-evm) |
| `@wdk/wallet-ton` | TON | ✅ Ready | [Documentation](./wallet-ton/overview.md) | [Repository](https://github.com/tetherto/wdk-wallet-ton) |
| `@wdk/wallet-btc` | Bitcoin | ✅ Ready | [Documentation](./wallet-btc/overview.md) | [Repository](https://github.com/tetherto/wdk-wallet-btc) |
| `@wdk/wallet-spark` | Spark | ✅ Ready | [Documentation](./wallet-spark/overview.md) | [Repository](https://github.com/tetherto/wdk-wallet-spark) |
| `@wdk/wallet-tron` | TRON | ✅ Ready | [Documentation](./wallet-tron/overview.md) | [Repository](https://github.com/tetherto/wdk-wallet-tron) |
| `@wdk/wallet-solana` | Solana | ✅ Ready | [Documentation](./wallet-solana/overview.md) | [Repository](https://github.com/tetherto/wdk-wallet-solana) |
| `@wdk/wallet-ark` | Ark | In progress | - | [Repository](https://github.com/tetherto/wdk-wallet-ark) |

### Account Abstraction Wallet Modules

Wallet implementations that support [Account Abstraction](../resources/concepts.md#account-abstraction) for gasless transactions using paymaster tokens like USDT:

| Module | Blockchain | Status | Documentation | GitHub |
|--------|------------|--------|---------------|---------|
| `@wdk/wallet-evm-erc4337` | EVM | ✅ Ready | [Documentation](./wallet-evm-erc-4337/overview.md) | [Repository](https://github.com/tetherto/wdk-wallet-evm-erc-4337) |
| `@wdk/wallet-ton-gasless` | TON | ✅ Ready | [Documentation](./wallet-ton-gasless/overview.md) | [Repository](https://github.com/tetherto/wdk-wallet-ton-gasless) |
| `@wdk/wallet-tron-gasfree` | TRON | ✅ Ready | [Documentation](./wallet-tron-gasfree/overview.md) | [Repository](https://github.com/tetherto/wdk-wallet-tron-gasfree) |
| `@wdk/wallet-solana-jupiterz` | Solana | In progress | - | [Repository](https://github.com/tetherto/wdk-wallet-solana-jupiterz) |

## Next steps

To get started with WDK modules, follow these steps:

1. Get up and running quickly with our [Quick Start Guide](../../getting-started/quick-start.md)
2. Choose the modules that best fits your needs from the tables above 
3. Check specific documentation for modules you wish to use

You can also:

- Learn about key concepts like [Account Abstraction](../../resources/concepts.md) and other important definitions
- Use one our ready-to-use examples to be production ready