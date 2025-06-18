---
title: SDK Reference Documentation
description: 
author: Raquel Carrasco Gonzalez
lastReviewed: 2025-06-17
---

# Published npm packages

### 🚧 Work in progress

All modules live under the **`@wdk/` scope** on npm and are published from the
monorepo root.  The proposal groups them into three families: **wallet
implementations**, **swap protocols** and **bridge protocols**. :contentReference[oaicite:0]{index=0}

---

## 1. Wallet packages

| Package | Chain / flavour | Notes (from SDK proposal) |
|---------|-----------------|---------------------------|
| `@wdk/wallet` | _abstract_ | Defines `AbstractWalletManager` and `IWalletAccount`. :contentReference[oaicite:1]{index=1} |
| `@wdk/wallet-evm` | EVM (EOA) | “Creates a new wallet manager for EVM blockchains.” :contentReference[oaicite:2]{index=2} |
| `@wdk/wallet-evm-erc4337` | EVM (Account Abstraction) | Includes `paymasterUrl`, `entryPointAddress`, etc. :contentReference[oaicite:3]{index=3} |
| `@wdk/wallet-ton` | TON classic | Implements standard TON wallet behaviour. :contentReference[oaicite:4]{index=4} |
| `@wdk/wallet-ton-gasless` | TON account-abstraction | Gas sponsored via `paymasterToken`. :contentReference[oaicite:5]{index=5} |
| `@wdk/wallet-btc` | Bitcoin | SegWit / Taproot; Electrum back-end. :contentReference[oaicite:6]{index=6} |
| `@wdk/wallet-spark` | Spark (prototype) | Proof-of-concept Spark chain wallet. :contentReference[oaicite:7]{index=7} |
| `@wdk/wallet-tron` | TRON legacy | Standard TRON wallet manager. :contentReference[oaicite:8]{index=8} |
| `@wdk/wallet-tron-gasfree` | TRON gas-sponsored | Uses network paymaster. :contentReference[oaicite:9]{index=9} |
| `@wdk/wallet-solana` | Solana | Ed25519 key-pair wallet. :contentReference[oaicite:10]{index=10} |
| `@wdk/wallet-solana-jupiterz` | Solana + Jupiter Z | Wallet pre-configured for Jupiter aggregator. :contentReference[oaicite:11]{index=11} |

---

## 2. Swap-protocol packages

| Package | Purpose |
|---------|---------|
| `@wdk/protocol-swap` | Houses `AbstractSwapProtocol` base class. :contentReference[oaicite:12]{index=12} |
| `@wdk/protocol-swap-paraswap-evm` | Adapter for the Paraswap router on EVM chains. :contentReference[oaicite:13]{index=13} |
| `@wdk/protocol-swap-dedust-ton` | Adapter for the DeDust DEX on TON. :contentReference[oaicite:14]{index=14} |

---

## 3. Bridge-protocol packages

| Package | Purpose / route |
|---------|-----------------|
| `@wdk/protocol-bridge` | Declares `AbstractBridgeProtocol`. :contentReference[oaicite:15]{index=15} |
| `@wdk/protocol-bridge-usdt0-evm` | Canonical USDT-0 bridge on EVM & L2. :contentReference[oaicite:16]{index=16} |
| `@wdk/protocol-bridge-usdt0-ton` | USDT-0 gateway between TON and EVM. :contentReference[oaicite:17]{index=17} |

---

> **Naming convention** – compose the package name as  
> `@wdk/<layer>-<technology>[-<flavour>]`, e.g.  
> `wallet-ton-gasless`, `protocol-swap-paraswap-evm`. :contentReference[oaicite:18]{index=18}

_Last updated: 17 Jun 2025_
