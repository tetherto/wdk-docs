---
title: Wallet TON Overview
description: Overview of the @tetherto/wdk-wallet-ton module
author: Raquel Carrasco Gonzalez
lastReviewed: 2025-06-26
---

# @tetherto/wdk-wallet-ton Overview

A simple and secure package to manage BIP-44 wallets for the TON blockchain. This package provides a clean API for creating, managing, and interacting with TON wallets using BIP-39 seed phrases and TON-specific derivation paths.

## Features

- **BIP-39 Seed Phrase Support**: Generate and validate BIP-39 mnemonic seed phrases
- **TON Derivation Paths**: Support for BIP-44 standard derivation paths for TON (m/44'/607')
- **Multi-Account Management**: Create and manage multiple accounts from a single seed phrase
- **TON Address Support**: Generate and manage TON addresses using V5R1 wallet contracts
- **Message Signing**: Sign and verify messages using TON cryptography
- **Transaction Management**: Send transactions and get fee estimates
- **Jetton Support**: Query native TON and Jetton token balances
- **TypeScript Support**: Full TypeScript definitions included
- **Memory Safety**: Secure private key management with automatic memory cleanup using sodium-universal
- **Provider Flexibility**: Support for custom TON RPC endpoints and TON Center API

## Supported Networks

This package works with the TON blockchain (The Open Network), including:

- **TON Mainnet**
- **TON Testnet**

## Next Steps

- Read the **[Guides](guides.md)** for quick start, and usage examples
- Check the **[API Reference](api-reference.md)**
- Review **[Configuration](configuration.md)** options
- Want to contribute? **[Open a PR on Github](https://github.com/tetherto/wdk-wallet-ton)**
- Found a bug? **[Open an issue on Github](https://github.com/tetherto/wdk-wallet-ton/issues)** 

