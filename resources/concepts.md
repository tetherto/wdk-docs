---
title: Concepts & Definitions
description: Key concepts and definitions used throughout the Wallet Development Kit
author: Matteo Giardino
lastReviewed: 2025-06-26
---

# Concepts & Definitions

This section provides definitions and explanations for key concepts used throughout the Wallet Development Kit (WDK).

## Account Abstraction

Account Abstraction is a blockchain technology that separates the concept of a user account from the mechanism of transaction validation and fee payment. In traditional blockchain systems, users must pay transaction fees in the native token of the blockchain (like ETH on Ethereum). Account Abstraction allows users to pay fees in other tokens or have fees sponsored by third parties, enabling gasless transactions and enhanced user experiences.

### WDK Implementation

WDK provides Account Abstraction support through specialized wallet modules:

- `@wdk/wallet-evm-erc4337` - EVM chains with ERC-4337 standard
- `@wdk/wallet-ton-gasless` - TON blockchain with gasless transactions
- `@wdk/wallet-tron-gasfree` - TRON blockchain with gas-free transactions

These modules allow developers to implement gasless transaction flows where users can pay fees in tokens like USDT or XAUT instead of native blockchain tokens.

## ERC-4337

ERC-4337 is an Ethereum standard that enables Account Abstraction without requiring changes to the Ethereum protocol itself. It introduces a new transaction type called "UserOperation" that allows smart contract wallets to handle transaction validation and fee payment logic through components like EntryPoint contracts, Bundlers, and Paymasters.

## Gasless Transactions

Gasless transactions allow users to perform blockchain operations without holding native tokens for gas fees. Instead, transaction fees are paid by third-party services or in alternative tokens, enabling new user onboarding, cross-chain operations, and corporate applications where companies can sponsor employee transactions.

## Paymaster Services

Paymaster services are third-party providers that sponsor transaction fees on behalf of users. They accept payment in various tokens and handle the conversion and payment of gas fees to the blockchain network, providing fee estimation, gas optimization, and high transaction success rates.

## Safe Accounts

Safe Accounts are smart contract wallets built on the Safe protocol that provide enhanced security features and multi-signature capabilities. In the context of ERC-4337, Safe Accounts can be used as the underlying wallet implementation, combining the security benefits of multi-signature with the flexibility of Account Abstraction for enterprise, family, and institutional use cases.
