---
title: Concepts & Definitions
description: Key concepts and definitions used throughout the Wallet Development Kit
author: Matteo Giardino
lastReviewed: 2025-06-26
---

# Concepts & Definitions

This section provides definitions and explanations for key concepts used throughout the Wallet Development Kit (WDK).

## Account Abstraction

Account Abstraction is a blockchain technology that separates the concept of a user account from the mechanism of transaction validation and fee payment. In traditional blockchain systems, users must pay transaction fees in the native token of the blockchain (like ETH on Ethereum). Account Abstraction allows users to pay fees in other tokens or have fees sponsored by third parties.

### Key Benefits

- **Gasless Transactions**: Users can perform transactions without holding native blockchain tokens for gas fees
- **Token-Based Fee Payment**: Fees can be paid in stablecoins like USDT or other tokens
- **Enhanced User Experience**: Simplified onboarding and transaction processes
- **Flexible Fee Models**: Support for sponsored transactions and complex fee structures

### WDK Implementation

WDK provides Account Abstraction support through specialized wallet modules:

- `@wdk/wallet-evm-erc4337` - EVM chains with ERC-4337 standard
- `@wdk/wallet-ton-gasless` - TON blockchain with gasless transactions
- `@wdk/wallet-tron-gasfree` - TRON blockchain with gas-free transactions

These modules allow developers to implement gasless transaction flows where users can pay fees in tokens like USDT or XAUT instead of native blockchain tokens.
