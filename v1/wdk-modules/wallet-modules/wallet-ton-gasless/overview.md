---
title: Wallet TON Gasless Overview
description: Overview of the @tetherto/wdk-wallet-ton-gasless module
lastReviewed: 2025-06-26
---

# @tetherto/wdk-wallet-ton-gasless Overview

A simple and secure package to manage gasless transactions on the TON blockchain. This package provides a clean API for creating, managing, and interacting with TON wallets using BIP-39 seed phrases and TON-specific derivation paths, with support for gasless transactions through a paymaster system.


## Features

- **BIP-39 Seed Phrase Support**: Generate and validate BIP-39 mnemonic seed phrases
- **TON Derivation Paths**: Support for BIP-44 standard derivation paths for TON (m/44'/607')
- **Multi-Account Management**: Create and manage multiple accounts from a single seed phrase
- **TON Address Support**: Generate and manage TON addresses using V5R1 wallet contracts
- **Message Signing**: Sign and verify messages using TON cryptography
- **Gasless Transactions**: Execute transactions without requiring TON for gas fees
- **Paymaster Integration**: Built-in support for paymaster-based fee delegation
- **Jetton Support**: Query native TON and Jetton token balances
- **TypeScript Support**: Full TypeScript definitions included
- **Memory Safety**: Secure private key management with automatic memory cleanup using sodium-universal
- **Provider Flexibility**: Support for both TON Center and TON API endpoints

## Supported Networks

This package works with the TON blockchain (The Open Network), including:

- **TON Mainnet**
- **TON Testnet**

## Next Steps

- Read the **[Guides](guides.md)** for quick start, and usage examples
- Check the **[API Reference](api-reference.md)**
- Review **[Configuration](configuration.md)** options
- Want to contribute? **[Open a PR on Github](https://github.com/tetherto/wdk-wallet-ton-gasless)**
- Found a bug? **[Open an issue on Github](https://github.com/tetherto/wdk-wallet-ton-gasless/issues)** 

