---
title: Bridge USDT0 TON Overview
description: Overview of the @tetherto/wdk-protocol-bridge-usdt0-ton module
author: Raquel Carrasco
lastReviewed: 2025-09-04
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

# @tetherto/wdk-protocol-bridge-usdt0-ton Overview

A simple package that lets TON wallet accounts bridge USDT0 tokens across different blockchains. This package provides a clean API for moving tokens between TON and other supported chains using the LayerZero protocol and USDT0 bridge system.

## Features

- **Cross-Chain Bridge**: Move USDT0 tokens between TON and other supported blockchains
- **LayerZero Integration**: Uses LayerZero protocol for secure cross-chain transfers
- **Multi-Chain Support**: Bridge from TON to Ethereum, Arbitrum, Polygon, and TRON
- **Gasless Support**: Works with both standard TON wallets and gasless TON accounts
- **Fee Management**: Built-in fee calculation and bridge cost estimation
- **Token Support**: Supports USDT and other USDT0 ecosystem tokens on TON
- **TypeScript Support**: Full TypeScript definitions included
- **Memory Safety**: Secure transaction handling with proper error management
- **Flexible Configuration**: Works with custom OFT configurations for unsupported jettons

## Supported Networks

This package works with TON blockchain and can bridge to:

- **EVM**
    - **Ethereum** (Chain ID: 1, EID: 30101)
    - **Arbitrum** (Chain ID: 42161, EID: 30110)
    - EVM L2 networks
- **TRON** (EID: 30420)
- **TON** (EID: 30343) - Source chain

**Note**: Token support is determined by the OFT (Omnichain Fungible Token) contracts deployed on each chain. The protocol uses LayerZero's endpoint IDs (EIDs) to identify destination chains and handle cross-chain communication.

## Wallet Compatibility

The bridge supports multiple TON wallet types:

- **Standard TON Wallets**: `@tetherto/wdk-wallet-ton` accounts with native TON gas
- **Gasless TON Wallets**: `@tetherto/wdk-wallet-ton-gasless` accounts with sponsored transactions
- **Read-Only Accounts**: For querying bridge costs without transaction capabilities

## Key Components

- **OFT Bridge Configuration**: Configurable token contracts and chain mappings
- **Gasless Integration**: Built-in support for gasless transaction execution
- **Quote System**: Pre-transaction cost estimation and fee calculation
- **Multi-Protocol Support**: Handles both standard and gasless wallet protocols

## Next Steps

- Read the **[Guides](guides.md)** for quick start and usage examples
- Check the **[API Reference](api-reference.md)**
- Review **[Configuration](configuration.md)** options
- Want to contribute? **[Open a PR on Github](https://github.com/tetherto/wdk-protocol-bridge-usdt0-ton)**
- Found a bug? **[Open an issue on Github](https://github.com/tetherto/wdk-protocol-bridge-usdt0-ton/issues)**

{% include "../.gitbook/includes/support-cards.md" %}

