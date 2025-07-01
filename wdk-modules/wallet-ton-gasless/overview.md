---
title: Wallet TON Gasless Overview
description: Overview of the @wdk/wallet-ton-gasless module
author: Raquel Carrasco Gonzalez
lastReviewed: 2025-06-26
---

# @wdk/wallet-ton-gasless Overview

A simple and secure package to manage BIP-32 wallets for the TON blockchain with gasless Jetton transfers. This package provides a clean API for creating, managing, and interacting with TON wallets using BIP-39 seed phrases, TON-specific derivation paths, and paymaster-based gasless transactions.


## Features

- **BIP-39 Seed Phrase Support**: Generate and validate BIP-39 mnemonic seed phrases
- **TON Derivation Paths**: Support for BIP-44 standard derivation paths for TON
- **Multi-Account Management**: Create and manage multiple accounts from a single seed phrase
- **TON Address Support:** Generate and manage TON addresses
- **Message Signing:** Sign and verify messages using TON cryptography
- **Gasless Jetton Transfers:** Send Jettons (TON tokens) with gas paid in a paymaster Jetton
- **Paymaster Support:** Use a paymaster Jetton to pay for transaction fees
- **Transaction Management**: Send transactions and get fee estimates
- **Jetton Support:** Query native TON and Jetton token balances.
- **TypeScript Support**: Full TypeScript definitions included
- **Memory Safety**: Secure private key management with automatic memory cleanup
- **Provider Flexibility:** Support for custom TON RPC endpoints

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

