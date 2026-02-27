# wallet-evm-multisig-safe

Overview of the @tetherto/wdk-wallet-evm-multisig-safe module

A simple and secure package to manage Safe Protocol multisig wallets with ERC-4337 account abstraction for EVM-compatible blockchains. This package provides a clean API for creating, managing, and interacting with multisig wallets using BIP-39 seed phrases and the Safe smart contract infrastructure.

## Features

* **Safe Protocol Integration**: Full support for Safe multisig wallets
* **ERC-4337 Account Abstraction**: Gasless transactions via paymasters and bundlers
* **Three Gas Payment Modes**: ERC-20 paymaster, sponsored (gasless), and native coins
* **Per-Transaction Override**: Switch between gas payment modes per transaction
* **Multi-Owner Management**: Add, remove, swap owners and change threshold
* **Propose/Approve/Execute**: Standard multisig transaction workflow
* **Message Signing**: Propose/approve flow for multisig message signing with EIP-1271 verification
* **Deterministic Addresses**: Predictable Safe addresses from owner configuration
* **Auto-Execute**: Automatically execute transactions when threshold is met
* **Batch Transactions**: Propose multiple transactions in a single Safe operation
* **TypeScript Support**: Full TypeScript definitions included
* **Memory Safety**: Secure private key management with memory-safe implementation

## Supported Networks

This package works with any EVM-compatible network that supports:

* **Ethereum**: Mainnet, Sepolia
* **And more**: Any chain with Safe Protocol and ERC-4337 infrastructure

## Next Steps

**[Node.js Quickstart](/start-building/nodejs-bare-quickstart.md)**

Get started with WDK in a Node.js environment

**[Configuration](configuration.md)**

Configure gas payment modes, Safe options, and transaction service

**[API Reference](api-reference.md)**

Complete API documentation for all classes and methods

**[Usage](usage.md)**

Installation, quick start, and usage examples

---

### Need Help?

{% include "../../../.gitbook/includes/support-cards.md" %}
