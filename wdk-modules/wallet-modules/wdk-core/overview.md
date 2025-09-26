---
title: WDK Core Overview
description: Overview of the @tetherto/wdk module
author: Raquel Carrasco
lastReviewed: 2025-09-11
---

# @tetherto/wdk Overview

A comprehensive Wallet Development Kit (WDK) that provides unified interfaces for managing wallets, performing account abstraction, and executing cross-chain operations across multiple blockchains. This package serves as the main entry point and orchestrator for all WDK wallet modules, allowing you to register and manage different blockchain wallets and protocols through a single interface.

## Features

- **Multi-Chain Wallet Management**: Register and manage wallets for different blockchains (EVM, TON, Bitcoin, Spark, TRON, Solana)
- **Protocol Registration**: Register swap, bridge, and lending protocols for cross-chain operations
- **Middleware Support**: Register custom middleware for account decoration and enhanced functionality
- **BIP-39 Seed Phrase Support**: Generate and validate BIP-39 mnemonic seed phrases
- **BIP-44 Derivation Paths**: Support for standard derivation paths across all blockchains
- **Multi-Account Management**: Create and manage multiple accounts from a single seed phrase
- **Account Abstraction**: Support for gasless transactions and smart account management
- **Cross-Chain Operations**: Bridge tokens between different chains seamlessly
- **Protocol Access**: Access registered protocols (swap, bridge, lending) through account instances
- **TypeScript Support**: Full TypeScript definitions included
- **Memory Safety**: Secure private key management with automatic memory cleanup
- **Provider Flexibility**: Support for custom RPC endpoints for each blockchain

## Supported Networks

This package works with multiple blockchain networks through wallet registration:

- **EVM Chains**: Ethereum, Arbitrum, Polygon (via @tetherto/wdk-wallet-evm)
- **TON**: TON Mainnet (via @tetherto/wdk-wallet-ton)
- **Bitcoin**: Bitcoin Mainnet (via @tetherto/wdk-wallet-btc)
- **Spark**: Spark Mainnet (via @tetherto/wdk-wallet-spark)
- **TRON**: Tron Mainnet (via @tetherto/wdk-/wallet-tron)
- **Solana**: Solana Mainnet (via @tetherto/wdk-wallet-solana)

## Next Steps

- Read the **[Guides](guides.md)** for quick start, and usage examples
- Check the **[API Reference](api-reference.md)**
- Review **[Configuration](configuration.md)** options
- Want to contribute? **[Open a PR on Github](https://github.com/tetherto/wdk-core)**
- Found a bug? **[Open an issue on Github](https://github.com/tetherto/wdk-core/issues)**
