---
title: Wallet Tron Gras-Free Overview
description: Overview of the @wdk/wallet-tron-gasfree module
author: Raquel Carrasco Gonzalez
lastReviewed: 2025-06-26
---

# @wdk/wallet-tron-gasfree Overview

A simple and secure package to manage BIP-32 wallets for the Tron blockchain with **gas-free TRC20 token transfers**. This package provides a clean API for creating, managing, and interacting with Tron wallets using BIP-39 seed phrases and Tron-specific derivation paths, with support for gas-free operations via a service provider.

## Features

- **BIP-39 Seed Phrase Support**: Generate and validate BIP-39 mnemonic seed phrases
- **Tron Derivation Paths**: Support for BIP-44 standard derivation paths for Tron
- **Multi-Account Management**: Create and manage multiple accounts from a single seed phrase
- **Tron Address Support:** Generate and manage Tron addresses
- **Gas-Free TRC20 Transfers:** Send TRC20 tokens without paying gas (fees are paid in tokens via a service provider)
- **Message Signing:** Sign and verify messages using Tron cryptography
- **Transaction Management**: Send transactions and get fee estimates
- **TRC20 Support:** Query native TRX and TRC20 token balances.
- **TypeScript Support**: Full TypeScript definitions included
- **Memory Safety**: Secure private key management with automatic memory cleanup
- **Provider Flexibility:** Support for custom Tron RPC endpoints and gas-free service providers

## Supported Networks

This package works with the Tron blockchain, including:

- **Tron Mainnet**
- **Tron Shasta Testnet**

## Next Steps

- Read the **[Guides](guides.md)** for quick start, and usage examples
- Check the **[API Reference](api-reference.md)**
- Review **[Configuration](configuration.md)** options
- Want to contribute? **[Open a PR on Github](https://github.com/tetherto/wdk-wallet-tron-gasfree)**
- Found a bug? **[Open an issue on Github](https://github.com/tetherto/wdk-wallet-tron-gasfree/issues)** 

