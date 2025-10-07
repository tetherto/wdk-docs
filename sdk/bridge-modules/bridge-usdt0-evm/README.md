---
title: Bridge USDT0 EVM Overview
description: Overview of the @tetherto/wdk-protocol-bridge-usdt0-evm module
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

# @tetherto/wdk-protocol-bridge-usdt0-evm Overview

A simple package that lets EVM wallet accounts bridge USDT0 tokens across different blockchains. This package provides a clean API for moving tokens between chains using the LayerZero protocol and USDT0 bridge system.

## Features

- **Cross-Chain Bridge**: Move USDT0 tokens between supported blockchains
- **LayerZero Integration**: Uses LayerZero protocol for secure cross-chain transfers
- **Multi-Chain Support**: Bridge to Ethereum, Arbitrum, Polygon, and other supported chains
- **Account Abstraction**: Works with both standard EVM wallets and ERC-4337 smart accounts
- **Fee Management**: Built-in fee calculation and bridge cost estimation
- **Token Support**: Supports USDT and other USDT0 ecosystem tokens
- **TypeScript Support**: Full TypeScript definitions included
- **Memory Safety**: Secure transaction handling with proper error management
- **Provider Flexibility**: Works with JSON-RPC URLs and EIP-1193 browser providers

## Supported Networks

This package works with EVM-compatible blockchains and can bridge to:

- **Ethereum** (Chain ID: 1)
- **Arbitrum** (Chain ID: 42,161) - ERC-4337 support
- **Polygon** (Chain ID: 137)


**Note**: Token support is determined by the contracts deployed on each chain. The protocol checks for `oftContract`, `legacyMeshContract`, and `xautOftContract` to determine available tokens.

## Next Steps

- Read the **[Guides](guides.md)** for quick start and usage examples
- Check the **[API Reference](api-reference.md)**
- Review **[Configuration](configuration.md)** options
- Want to contribute? **[Open a PR on Github](https://github.com/tetherto/wdk-protocol-bridge-usdt0-evm)**
- Found a bug? **[Open an issue on Github](https://github.com/tetherto/wdk-protocol-bridge-usdt0-evm/issues)**
