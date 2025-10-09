---
title: Wallet Spark Overview
description: Overview of the @tetherto/wdk-wallet-spark module
lastReviewed: 2025-06-26
---

# @tetherto/wdk-wallet-spark Overview

A simple and secure package to manage BIP-32 wallets for the Spark blockchain. This package provides a clean API for creating, managing, and interacting with Spark wallets using [BIP-39 seed phrases](../../resources/concepts.md#bip-39-mnemonic-seed-phrases), [BIP-44 derivation paths](../../resources/concepts.md#bip-44-multi-account-hierarchy), and the Spark SDK for Bitcoin [layer 2](../../resources/concepts.md#layer-2-solutions) functionality including [Lightning Network](../../resources/concepts.md#lightning-network) integration.

## Features

- **Spark Blockchain Support**: Full integration with the Spark Bitcoin [layer 2](../../resources/concepts.md#layer-2-solutions) network
- **Lightning Network Integration**: Create and pay [Lightning Network](../../resources/concepts.md#lightning-network) invoices directly
- **Bitcoin Layer 1 Bridge**: Deposit and withdraw Bitcoin between layer 1 and Spark
- **[BIP-44 Derivation Paths](../../resources/concepts.md#bip-44-multi-account-hierarchy)**: Support for standard BIP-44 derivation paths with Spark-specific coin type (998)
- **[BIP-39 Seed Phrase Support](../../resources/concepts.md#bip-39-mnemonic-seed-phrases)**: Generate and validate BIP-39 mnemonic seed phrases
- **Multi-Account Management**: Create and manage multiple accounts from a single seed phrase
- **Single-Use Deposit Addresses**: Generate unique deposit addresses for Bitcoin layer 1 deposits
- **Fee-Free Transactions**: Spark transactions are fee-free on the layer 2 network
- **Transaction History**: Complete transaction history with incoming/outgoing transfers
- **Message Signing**: Sign and verify messages using Spark identity keys
- **Memory Safety**: Secure private key management with automatic memory cleanup
- **TypeScript Support**: Full TypeScript definitions included
- **Network Support**: Support for Spark [mainnet](../../resources/concepts.md#mainnet), [testnet](../../resources/concepts.md#testnet), and [regtest](../../resources/concepts.md#regtest) networks

## Supported Networks

This package supports the following Spark networks:

- **Spark Mainnet**: Production Spark network
- **Spark Testnet**: Spark test network for development
- **Spark Regtest**: Local Spark network for testing

## Next Steps

- Read the **[Guides](guides.md)** for quick start, and usage examples
- Check the **[API Reference](api-reference.md)** 
- Review **[Configuration](configuration.md)** options
- Want to contribute? **[Open a PR on Github](https://github.com/tetherto/wdk-wallet-spark)**
- Found a bug? **[Open an issue on Github](https://github.com/tetherto/wdk-wallet-spark/issues)** 