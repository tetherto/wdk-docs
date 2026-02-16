# wallet-evm-multisig-safe

Overview of the @tetherto/wdk-wallet-evm-multisig-safe module

A simple and secure package to manage Safe Protocol multisig wallets with ERC-4337 account abstraction for EVM-compatible blockchains. This package provides a clean API for creating, managing, and interacting with multisig wallets using BIP-39 seed phrases and the Safe smart contract infrastructure.

## Features

* **Safe Protocol Integration**: Full support for Safe (formerly Gnosis Safe) multisig wallets
* **ERC-4337 Account Abstraction**: Gasless transactions via paymasters and bundlers
* **Paymaster Modes**: Support for both ERC-20 paymaster and sponsored (gasless) modes
* **Per-Transaction Override**: Switch between ERC-20 and sponsored mode per transaction
* **Multi-Owner Management**: Add, remove, swap owners and change threshold
* **Propose/Approve/Execute**: Standard multisig transaction workflow
* **Message Signing**: Propose/approve flow for multisig message signing with EIP-1271 verification
* **Deterministic Addresses**: Predictable Safe addresses from owner configuration
* **Auto-Execute**: Automatically execute transactions when threshold is met
* **TypeScript Support**: Full TypeScript definitions included
* **Memory Safety**: Secure private key management with memory-safe implementation

## Supported Networks

This package works with any EVM-compatible network that supports:

* **Ethereum**: Mainnet, Sepolia
* **Polygon**: Mainnet, Mumbai
* **Arbitrum**: One, Nova
* **Optimism**: Mainnet, Goerli
* **And more**: Any chain with Safe Protocol and ERC-4337 infrastructure

## Next Steps

**Node.js Quickstart**

Get started with WDK in a Node.js environment

**WDK Multisig Safe Configuration**

Get started with WDK's Multisig Safe configuration

**WDK Multisig Safe API**

Get started with WDK's Multisig Safe API

**WDK Multisig Safe Usage**

Get started with WDK's Multisig Safe usage

---

### Need Help?

{% include "../../../.gitbook/includes/support-cards.md" %}