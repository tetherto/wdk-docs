---
title: Swap Stonfi TON Overview
description: Overview of the @tetherto/wdk-protocol-swap-stonfi-ton module
author: Raquel Carrasco
lastReviewed: 2025-09-04
---

# @tetherto/wdk-protocol-swap-stonfi-ton Overview

A simple package that lets TON wallet accounts swap tokens on the StonFi DEX (Decentralized Exchange). This package provides a clean API for swapping jetton tokens on the TON blockchain using the StonFi protocol.

## Features

- **Token Swapping**: Swap jetton tokens on the StonFi DEX on TON blockchain
- **StonFi Integration**: Uses StonFi SDK and API for secure token exchanges
- **Slippage Control**: Built-in slippage tolerance settings to protect against price changes
- **Gasless Support**: Works with both standard TON wallets and gasless TON accounts
- **Fee Management**: Built-in fee calculation and swap cost estimation
- **Token Support**: Supports all jetton tokens available on StonFi DEX
- **TypeScript Support**: Full TypeScript definitions included
- **Memory Safety**: Secure transaction handling with proper error management

## Supported Network

This package works with TON blockchain:

- **TON** (TON Network) - Native blockchain for StonFi DEX

**Note**: Token support is determined by the jetton tokens available on the StonFi DEX. The protocol uses StonFi's liquidity pools to find the best swap rates.

## Wallet Compatibility

The swap service supports multiple TON wallet types:

- **Standard TON Wallets**: `@tetherto/wdk-wallet-ton` accounts with native TON gas
- **Gasless TON Wallets**: `@tetherto/wdk-wallet-ton-gasless` accounts with sponsored transactions
- **Read-Only Accounts**: For querying swap costs without transaction capabilities

## Key Components

- **StonFi SDK Integration**: Uses official StonFi SDK for reliable swaps
- **Gasless Integration**: Built-in support for gasless transaction execution
- **Quote System**: Pre-transaction cost estimation and rate calculation
- **Slippage Protection**: Configurable slippage tolerance for price protection
- **Multi-Protocol Support**: Handles both standard and gasless wallet protocols

## Next Steps

- Read the **[Guides](guides.md)** for quick start and usage examples
- Check the **[API Reference](api-reference.md)**
- Review **[Configuration](configuration.md)** options
- Want to contribute? **[Open a PR on Github](https://github.com/tetherto/wdk-protocol-swap-stonfi-ton)**
- Found a bug? **[Open an issue on Github](https://github.com/tetherto/wdk-protocol-swap-stonfi-ton/issues)**
