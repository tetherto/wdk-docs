---
title: Wallet EVM Overview
description: Overview of the @tetherto/wdk-wallet-evm module
author: Matteo Giardino
lastReviewed: 2025-06-26
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

# @tetherto/wdk-wallet-evm Overview

A simple and secure package to manage BIP-44 wallets for EVM (Ethereum Virtual Machine) blockchains. This package provides a clean API for creating, managing, and interacting with Ethereum-compatible wallets using BIP-39 seed phrases and BIP-44 derivation paths.


## Features

- **BIP-39 Seed Phrase Support**: Generate and validate BIP-39 mnemonic seed phrases
- **EVM Derivation Paths**: Support for BIP-44 standard derivation paths for Ethereum (m/44'/60')
- **Multi-Account Management**: Create and manage multiple accounts from a single seed phrase
- **EVM Address Support**: Generate and manage Ethereum-compatible addresses using ethers.js
- **Message Signing**: Sign and verify messages using EVM cryptography
- **Transaction Management**: Send transactions and get fee estimates with EIP-1559 support
- **ERC20 Support**: Query native token and ERC20 token balances using smart contract interactions
- **TypeScript Support**: Full TypeScript definitions included
- **Memory Safety**: Secure private key management with memory-safe HDNodeWallet implementation
- **Provider Flexibility**: Support for both JSON-RPC URLs and EIP-1193 browser providers
- **Gas Optimization**: Support for EIP-1559 maxFeePerGas and maxPriorityFeePerGas
- **Fee Estimation**: Dynamic fee calculation with normal (1.1x) and fast (2.0x) multipliers

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

- Read the **[Guides](guides.md)** for quick start, and usage examples
- Check the **[API Reference](api-reference.md)**
- Review **[Configuration](configuration.md)** options
- Want to contribute? **[Open a PR on Github](https://github.com/tetherto/wdk-wallet-evm)**
- Found a bug? **[Open an issue on Github](https://github.com/tetherto/wdk-wallet-evm/issues)** 
