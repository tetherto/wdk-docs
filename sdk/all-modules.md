---
title: All Modules
description: Complete list of all available WDK modules including wallet, swap, bridge, lending, and fiat modules.
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

# All Modules

A comprehensive list of all available WDK modules. Each module is designed to be modular and can be used independently or combined with others.

## Core Module

The orchestrator that manages all WDK modules.

| Module | Description | Documentation |
|--------|-------------|---------------|
| [`@tetherto/wdk-core`](https://github.com/tetherto/wdk-core) | Central orchestrator for all WDK modules | [Docs](./core-module/) |

## Wallet Modules

Wallet modules provide blockchain-specific wallet functionality for managing addresses, balances, and transactions.

| Module | Blockchain | Description | Documentation |
|--------|------------|-------------|---------------|
| [`@tetherto/wdk-wallet-btc`](https://github.com/tetherto/wdk-wallet-btc) | Bitcoin | Bitcoin SegWit wallet with BIP-39/BIP-44 support | [Docs](./wallet-modules/wallet-btc/) |
| [`@tetherto/wdk-wallet-evm`](https://github.com/tetherto/wdk-wallet-evm) | EVM | Ethereum and EVM-compatible chains wallet | [Docs](./wallet-modules/wallet-evm/) |
| [`@tetherto/wdk-wallet-evm-erc4337`](https://github.com/tetherto/wdk-wallet-evm-erc-4337) | EVM | ERC-4337 Account Abstraction for EVM chains | [Docs](./wallet-modules/wallet-evm-erc-4337/) |
| [`@tetherto/wdk-wallet-ton`](https://github.com/tetherto/wdk-wallet-ton) | TON | TON blockchain wallet | [Docs](./wallet-modules/wallet-ton/) |
| [`@tetherto/wdk-wallet-ton-gasless`](https://github.com/tetherto/wdk-wallet-ton-gasless) | TON | Gasless transactions on TON | [Docs](./wallet-modules/wallet-ton-gasless/) |
| [`@tetherto/wdk-wallet-tron`](https://github.com/tetherto/wdk-wallet-tron) | TRON | TRON blockchain wallet | [Docs](./wallet-modules/wallet-tron/) |
| [`@tetherto/wdk-wallet-tron-gasfree`](https://github.com/tetherto/wdk-wallet-tron-gasfree) | TRON | Gas-free transactions on TRON | [Docs](./wallet-modules/wallet-tron-gasfree/) |
| [`@tetherto/wdk-wallet-solana`](https://github.com/tetherto/wdk-wallet-solana) | Solana | Solana blockchain wallet | [Docs](./wallet-modules/wallet-solana/) |
| [`@tetherto/wdk-wallet-spark`](https://github.com/tetherto/wdk-wallet-spark) | Spark | Spark/Lightning Bitcoin L2 wallet | [Docs](./wallet-modules/wallet-spark/) |

## Swap Modules

DEX swap functionality for token exchanges.

| Module | Blockchain | Description | Documentation |
|--------|------------|-------------|---------------|
| [`@tetherto/wdk-protocol-swap-velora-evm`](https://github.com/tetherto/wdk-protocol-swap-velora-evm) | EVM | DEX aggregator swap on EVM chains | [Docs](./swap-modules/swap-velora-evm/) |

## Bridge Modules

Cross-chain bridge functionality for token transfers between blockchains.

| Module | Route | Description | Documentation |
|--------|-------|-------------|---------------|
| [`@tetherto/wdk-protocol-bridge-usdt0-evm`](https://github.com/tetherto/wdk-protocol-bridge-usdt0-evm) | EVM ↔ EVM | USD₮0 bridging between EVM chains | [Docs](./bridge-modules/bridge-usdt0-evm/) |

## Lending Modules

DeFi lending and borrowing functionality.

| Module | Blockchain | Description | Documentation |
|--------|------------|-------------|---------------|
| [`@tetherto/wdk-protocol-lending-aave-evm`](https://github.com/tetherto/wdk-protocol-lending-aave-evm) | EVM | Aave protocol integration for EVM | [Docs](./lending-modules/lending-aave-evm/) |

## Fiat Modules

On-ramp and off-ramp functionality for fiat currency integration.

| Module | Provider | Description | Documentation |
|--------|----------|-------------|---------------|
| [`@tetherto/wdk-protocol-fiat-moonpay`](https://github.com/tetherto/wdk-protocol-fiat-moonpay) | MoonPay | MoonPay integration for fiat on-ramp | [Docs](./fiat-modules/fiat-moonpay/) |

## Community Modules

Modules built by the WDK community. See the [Community Modules](./community-modules/) page for more details.

| Module | Blockchain | Description | Documentation |
|--------|------------|-------------|---------------|
| [`@utexo/wdk-wallet-rgb`](https://github.com/UTEXO-Protocol/wdk-wallet-rgb) | Bitcoin (RGB) | RGB protocol wallet integration | [GitHub](https://github.com/UTEXO-Protocol/wdk-wallet-rgb) |
