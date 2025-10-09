---
title: Wallet Solana Overview
description: Overview of the @tetherto/wdk-wallet-solana module
lastReviewed: 2025-09-01
---

# @tetherto/wdk-wallet-solana Overview

A simple and secure package to manage BIP-44 wallets for the Solana blockchain. This package provides a clean API for creating, managing, and interacting with Solana wallets using BIP-39 seed phrases and Solana-specific derivation paths.

## Features

- **BIP-39 Seed Phrase Support**: Generate and validate BIP-39 mnemonic seed phrases
- **Solana Derivation Paths**: Support for BIP-44 standard derivation paths for Solana (m/44'/501')
- **Multi-Account Management**: Create and manage multiple accounts from a single seed phrase
- **Solana Address Support**: Generate and manage Solana public keys and addresses
- **Message Signing**: Sign and verify messages using Ed25519 cryptography
- **Transaction Management**: Send transactions and get fee estimates
- **SPL Token Support**: Query native SOL and SPL token balances
- **TypeScript Support**: Full TypeScript definitions included
- **Memory Safety**: Secure private key management with memory-safe implementation
- **Provider Flexibility**: Support for custom Solana RPC endpoints
- **Fee Estimation**: Dynamic fee calculation with recent blockhash
- **Program Interaction**: Support for interacting with Solana programs

## Supported Networks

This package works with the Solana blockchain, including:

- **Solana Mainnet**
- **Solana Devnet**
- **Solana Testnet**
- **Localnet**

## Next Steps

- Read the **[Guides](guides.md)** for quick start, and usage examples
- Check the **[API Reference](api-reference.md)**
- Review **[Configuration](configuration.md)** options
- Want to contribute? **[Open a PR on Github](https://github.com/tetherto/wdk-wallet-solana)**
- Found a bug? **[Open an issue on Github](https://github.com/tetherto/wdk-wallet-solana/issues)**

