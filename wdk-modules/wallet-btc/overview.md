---
title: Wallet BTC Overview
description: Overview of the @wdk/wallet-btc module
author: Matteo Giardino
lastReviewed: 2025-06-26
---

# @wdk/wallet-btc Overview

A simple and secure package to manage BIP-32 wallets for the Bitcoin blockchain. This package provides a clean API for creating, managing, and interacting with Bitcoin wallets using [BIP-39](../../resources/concepts.md#bip-39-mnemonic-seed-phrases) seed phrases, [BIP-84](../../resources/concepts.md#bip-84-native-segwit) derivation paths for native SegWit addresses, and Electrum protocol for blockchain interaction.

## Features

- **[BIP-84 Native SegWit Support](../../resources/concepts.md#bip-84-native-segwit)**: Full support for BIP-84 derivation paths with native SegWit (P2WPKH) addresses
- **[BIP-39 Seed Phrase Support](../../resources/concepts.md#bip-39-mnemonic-seed-phrases)**: Generate and validate BIP-39 mnemonic seed phrases
- **Electrum Protocol Integration**: Direct connection to Electrum servers for blockchain data
- **[UTXO Management](../../resources/concepts.md#utxo-unspent-transaction-output)**: Automatic UTXO selection and change address handling
- **Fee Estimation**: Dynamic fee estimation using mempool.space API
- **Transaction History**: Complete transaction history with incoming/outgoing transfers
- **Message Signing**: Sign and verify messages using Bitcoin message signing standard
- **Multi-Account Management**: Create and manage multiple accounts from a single seed phrase
- **Memory Safety**: Secure private key management with automatic memory cleanup
- **TypeScript Support**: Full TypeScript definitions included
- **Network Support**: Support for Bitcoin [mainnet](../../resources/concepts.md#mainnet), [testnet](../../resources/concepts.md#testnet), and [regtest](../../resources/concepts.md#regtest) networks

## Supported Networks

This package supports the following Bitcoin networks:

- **Bitcoin Mainnet**: Production Bitcoin network
- **Bitcoin Testnet**: Bitcoin test network for development
- **Bitcoin Regtest**: Local Bitcoin network for testing

## Next Steps

- Read the **[Guides](./guides.md)** for quick start, and usage examples
- Check the **[API Reference](./api-reference.md)** 
- Review **[Configuration](./configuration.md)** options
- Want to contribute? **[Open a PR on Github](https://github.com/tetherto/wdk-wallet-btc)**
- Found a bug? **[Open an issue on Github](https://github.com/tetherto/wdk-wallet-btc/issues)** 