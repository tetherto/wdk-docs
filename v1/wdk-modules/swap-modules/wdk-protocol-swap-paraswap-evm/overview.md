---
title: Swap velora EVM Overview
description: Overview of the @tetherto/wdk-protocol-swap-velora-evm module
lastReviewed: 2025-10-06
---

# @tetherto/wdk-protocol-swap-velora-evm Overview

A lightweight package that lets EVM wallet accounts swap tokens using the velora aggregator. It provides a clean SDK for token swaps on EVM chains and works with both standard wallets and ERC‑4337 smart accounts.

## Features

- **Token Swapping**: Execute token swaps through velora on supported EVM networks
- **Account Abstraction**: Compatible with standard EVM accounts and ERC‑4337 smart accounts
- **Fee Controls**: Optional `swapMaxFee` to cap gas costs
- **Allowance Safety**: Handles USDT mainnet pattern (reset allowance to 0 before approve)
- **Provider Flexibility**: Works with JSON‑RPC URLs and EIP‑1193 providers
- **TypeScript Support**: Full TypeScript definitions included

## Supported Networks

Works with EVM networks supported by velora (e.g., Ethereum, Polygon, Arbitrum, etc.). A working RPC provider is required.

## Wallet Compatibility

The swap service supports multiple EVM wallet types:

- **Standard EVM Wallets**: `@tetherto/wdk-wallet-evm` accounts
- **ERC‑4337 Smart Accounts**: `@tetherto/wdk-wallet-evm-erc-4337` accounts with bundler/paymaster
- **Read‑Only Accounts**: For quoting swaps without sending transactions

## Key Components

- **velora Integration**: Uses velora aggregator for routing and quotes
- **Quote System**: Pre‑transaction fee and amount estimation via `quoteSwap`
- **AA Integration**: Optional paymaster token and fee cap overrides when using ERC‑4337
- **Allowance Management**: Approve flow handled automatically when required

## Next Steps

- Read the **[Guides](guides.md)** for quick start and usage examples
- Check the **[API Reference](api-reference.md)**
- Review **[Configuration](configuration.md)** options
- Want to contribute? **Open a PR on Github**
- Found a bug? **Open an issue on Github**
