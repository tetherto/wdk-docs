---
title: Lending Aave EVM Overview
description: Overview of the @tetherto/wdk-protocol-lending-aave-evm module
author: Raquel Carrasco Gonzalez
lastReviewed: 2025-10-06
---

# @tetherto/wdk-protocol-lending-aave-evm Overview

A lightweight package that lets EVM wallet accounts interact with Aave V3: supply, withdraw, borrow, repay, and read account data. It works with both standard EVM wallets and ERC‑4337 smart accounts.

## Features

- **Supply/Withdraw**: Add and remove supported assets from Aave pools
- **Borrow/Repay**: Borrow assets and repay debt
- **Account Data**: Read collateral, debt, health factor, and more
- **Quote System**: Estimate fees before sending transactions
- **AA Support**: Works with standard EVM and ERC‑4337 smart accounts
- **TypeScript Support**: Full TypeScript definitions

## Supported Networks

Works on Aave V3 supported EVM networks (e.g., Ethereum, Arbitrum, Base, Optimism, Polygon, Avalanche, BNB, Celo, Gnosis, Linea, Scroll, Soneium, Sonic, ZkSync, Metis). A working RPC provider and correct token addresses are required.

## Wallet Compatibility

- **Standard EVM Wallets**: `@tetherto/wdk-wallet-evm`
- **ERC‑4337 Smart Accounts**: `@tetherto/wdk-wallet-evm-erc-4337`
- **Read‑Only Accounts**: For quoting and reading account data without sending transactions

## Key Components

- **Aave V3 Integration**: Supply, withdraw, borrow, repay primitives
- **Quote Helpers**: `quoteSupply`, `quoteWithdraw`, `quoteBorrow`, `quoteRepay`
- **Collateral Controls**: Toggle collateral usage; set user eMode

## Next Steps

- Read the **[Guides](guides.md)** for quick start and usage examples
- Check the **[API Reference](api-reference.md)**
- Review **[Configuration](configuration.md)** options
- Want to contribute? **Open a PR on Github**
- Found a bug? **Open an issue on Github**
