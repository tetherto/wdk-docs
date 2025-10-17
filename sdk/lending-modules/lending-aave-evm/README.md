---
title: Lending Aave EVM Overview
description: Overview of the @tetherto/wdk-protocol-lending-aave-evm module
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

<table data-card-size="large" data-view="cards">
  <thead>
    <tr>
      <th></th>
      <th></th>
      <th></th>
      <th data-hidden data-card-target data-type="content-ref"></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <i class="fa-book-open">:book-open:</i>
      </td>
      <td>
        <strong>Usage</strong>
      </td>
      <td>How to supply, withdraw, borrow and repay with Aave</td>
      <td>
        <a href="./usage.md">Lending Aave EVM Usage</a>
      </td>
    </tr>
    <tr>
      <td>
        <i class="fa-cog">:cog:</i>
      </td>
      <td>
        <strong>Configuration</strong>
      </td>
      <td>Service setup, account config, ERC‑4337 options</td>
      <td>
        <a href="./configuration.md">Lending Aave EVM Configuration</a>
      </td>
    </tr>
    <tr>
      <td>
        <i class="fa-code">:code:</i>
      </td>
      <td>
        <strong>API Reference</strong>
      </td>
      <td>Full API for Aave Protocol Evm methods and types</td>
      <td>
        <a href="./api-reference.md">Lending Aave EVM API</a>
      </td>
    </tr>
  </tbody>
</table>
