---
title: Wallet BTC Overview
description: Overview of the @wdk/wallet-btc module
author: Matteo Giardino
lastReviewed: 2025-06-26
---

# @wdk/wallet-btc Overview

This module is part of the [**WDK (Wallet Development Kit)**](https://wallet.tether.io/) project, which empowers developers to build secure, non-custodial wallets with unified blockchain access, stateless architecture, and complete user control. 

For detailed documentation about the complete WDK ecosystem, visit [docs.wallet.tether.io](https://docs.wallet.tether.io).

## Features

- **BIP-39 Seed Phrase Support**: Generate and validate BIP-39 mnemonic seed phrases
- **Bitcoin Derivation Paths**: Support for BIP-84 standard derivation paths for Bitcoin (m/84'/0')
- **Multi-Account Management**: Create and manage multiple accounts from a single seed phrase
- **Address Types Support**: Generate and manage Legacy, SegWit, and Native SegWit addresses
- **UTXO Management**: Track and manage unspent transaction outputs
- **Transaction Management**: Create, sign, and broadcast Bitcoin transactions
- **Fee Estimation**: Dynamic fee calculation with different priority levels
- **Electrum Support**: Connect to Electrum servers for network interaction
- **TypeScript Support**: Full TypeScript definitions included
- **Memory Safety**: Secure private key management with memory-safe implementation
- **Network Flexibility**: Support for both mainnet and testnet
- **Transaction Building**: Support for complex transaction construction with multiple inputs/outputs

## Supported Networks

This package works with Bitcoin networks:

- **Bitcoin Mainnet** (`"bitcoin"`)
- **Bitcoin Testnet** (`"testnet"`)  
- **Bitcoin Regtest** (`"regtest"`)

### Electrum Server Configuration

**Important**: While the package defaults to `electrum.blockstream.info:50001` for convenience, **we strongly recommend configuring your own Electrum server** for production use.

#### Recommended Approach:

**For Production:**
- Set up your own Fulcrum server for optimal performance and reliability
- Use recent Fulcrum versions that support pagination for high-transaction addresses

**For Development/Testing:**
- `fulcrum.frznode.com:50001` - Generally faster than default
- `electrum.blockstream.info:50001` - Default fallback

## Next Steps

- Read the **[Guides](./guides.md)** for quick start, and usage examples
- Check the **[API Reference](./api-reference.md)** 
- Review **[Configuration](./configuration.md)** options
- Want to contribute? **[Open a PR on Github](https://github.com/tetherto/wdk-wallet-btc)**
- Found a bug? **[Open an issue on Github](https://github.com/tetherto/wdk-wallet-btc/issues)** 