---
title: Wallet EVM Overview
description: Overview of the @wdk/wallet-evm module
author: Matteo Giardino
lastReviewed: 2025-06-26
---

# @wdk/wallet-evm Overview

A simple and secure package to manage BIP-32 wallets for EVM (Ethereum Virtual Machine) blockchains. This package provides a clean API for creating, managing, and interacting with Ethereum-compatible wallets using BIP-39 seed phrases and BIP-44 derivation paths.


## Features

- **BIP-39 Seed Phrase Support**: Generate and validate BIP-39 mnemonic seed phrases
- **BIP-44 Derivation Paths**: Support for standard BIP-44 derivation paths for EVM chains
- **Multi-Account Management**: Create and manage multiple accounts from a single seed phrase
- **EVM Chain Support**: Works with any EVM-compatible blockchain (Ethereum, Polygon, BSC, etc.)
- **Message Signing**: Sign and verify messages using EIP-191 standard
- **Transaction Management**: Send transactions and get fee estimates
- **Token Support**: Query native token and ERC-20 token balances
- **EIP-1559 Support**: Full support for EIP-1559 fee mechanism
- **TypeScript Support**: Full TypeScript definitions included
- **Memory Safety**: Secure private key management with automatic memory cleanup
- **Provider Flexibility**: Support for both RPC URLs and EIP-1193 providers

## Supported Networks

This package works with any EVM-compatible blockchain, including:

- **Ethereum**: Mainnet, Goerli, Sepolia
- **Polygon**: Mainnet, Mumbai
- **Binance Smart Chain (BSC)**: Mainnet, Testnet
- **Arbitrum**: One, Nova
- **Optimism**: Mainnet, Goerli
- **Avalanche C-Chain**: Mainnet, Fuji
- **And many more...**


## Next Steps

- Read the **[Guides](./guides.md)** for quick start, and usage examples
- Check the **[API Reference](./api-reference.md)** 
- Want to contribute? **[Open a PR on Github](https://github.com/tetherto/wdk-wallet-evm)**
- Found a bug? **[Open an issue on Github](https://github.com/tetherto/wdk-wallet-evm/issues)** 
