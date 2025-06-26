---
title: Wallet EVM ERC-4337 Overview
description: Overview of the @wdk/wallet-evm-erc-4337 module
author: Matteo Giardino
lastReviewed: 2025-06-26
---

# @wdk/wallet-evm-erc-4337 Overview

A simple and secure package to manage BIP-32 wallets for EVM (Ethereum Virtual Machine) blockchains with ERC-4337 account abstraction support. This package provides a clean API for creating, managing, and interacting with Ethereum-compatible wallets using BIP-39 seed phrases, BIP-44 derivation paths, and the ERC-4337 standard for gasless transactions and account abstraction.

## Features

- **ERC-4337 Account Abstraction**: Full support for ERC-4337 standard with account abstraction features
- **Gasless Transactions**: Send transactions without holding native tokens for gas fees
- **Paymaster Integration**: Support for paymaster services to sponsor transaction fees
- **Safe Account Integration**: Built on Safe's 4337 implementation for enhanced security
- **BIP-39 Seed Phrase Support**: Generate and validate BIP-39 mnemonic seed phrases
- **BIP-44 Derivation Paths**: Support for standard BIP-44 derivation paths for EVM chains
- **Multi-Account Management**: Create and manage multiple accounts from a single seed phrase
- **EVM Chain Support**: Works with any EVM-compatible blockchain supporting ERC-4337
- **Token-Based Fee Payment**: Pay transaction fees using ERC-20 tokens instead of native tokens
- **Fee Estimation**: Accurate fee estimation for gasless transactions
- **TypeScript Support**: Full TypeScript definitions included
- **Memory Safety**: Secure private key management with automatic memory cleanup
- **Provider Flexibility**: Support for both RPC URLs and EIP-1193 providers

## Supported Networks

This package works with any EVM-compatible blockchain that supports ERC-4337, including:

- **Ethereum**: Mainnet, Goerli, Sepolia
- **Polygon**: Mainnet, Mumbai
- **Arbitrum**: One, Nova
- **Optimism**: Mainnet, Goerli
- **Base**: Mainnet, Goerli
- **And other ERC-4337 compatible networks...**

## Next Steps

- Read the **[Guides](./guides.md)** for quick start, and usage examples
- Check the **[API Reference](./api-reference.md)** 
- Review **[Configuration](./configuration.md)** options
- Want to contribute? **[Open a PR on Github](https://github.com/tetherto/wdk-wallet-evm-erc-4337)**
- Found a bug? **[Open an issue on Github](https://github.com/tetherto/wdk-wallet-evm-erc-4337/issues)** 