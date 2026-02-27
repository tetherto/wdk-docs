# Multisig Modules

This document provides an overview of the WDK Multisig Modules. 

The Wallet Development Kit (WDK) provides multisig modules that enable secure multi-party wallet management. These modules allow multiple signers to control shared wallets with customizable approval thresholds.

## Why Multisig?

Multisig (multi-signature) wallets require multiple parties to approve transactions before execution. This provides:

* **Enhanced Security**: No single point of failure - multiple keys required
* **Team Control**: Perfect for companies, DAOs, and shared treasuries
* **Approval Workflows**: Configurable thresholds
* **Accountability**: Full audit trail of who approved what

## Available Modules

| Module | Blockchain | Status | Documentation |
| --- | --- | --- | --- |
| @tetherto/wdk-wallet-evm-multisig-safe | EVM | ✅ Ready | [Documentation](protocol-multisig-safe/README.md) |

## Module Features

### Standard Features

All multisig modules share these core features:

* **WDK Protocol Compatible**: Implements `IWalletAccount`, works seamlessly with WDK protocols (swap, bridge, lending)
* **Multi-Owner Management**: Add, remove, and swap owners
* **Threshold Configuration**: Set required approval count
* **Propose/Approve/Execute**: Standard multisig workflow
* **Message Signing**: Sign and verify messages with multisig approval

### Advanced Features

Some modules may support additional capabilities depending on the blockchain:

* **Flexible Gas Payment**: Pay fees in stablecoins, native coins, or via sponsorship
* **Per-Transaction Override**: Switch between gas payment modes per transaction
* **Batch Transactions**: Multiple operations in a single proposal
* **Deterministic Addresses**: Predictable wallet addresses from owner configuration

## Getting Started

To get started with WDK multisig modules, follow these steps:

1. Get up and running quickly with our [Quick Start Guide](/start-building/nodejs-bare-quickstart).
2. Choose the module that best fits your needs from the table above.
3. Check specific documentation for the module you wish to use.

## Next Steps

**[Protocol Multisig Safe](protocol-multisig-safe/README.md)**

Safe Protocol multisig with ERC-4337 account abstraction

**[Node.js Quickstart](/start-building/nodejs-bare-quickstart.md)**

Get started with WDK in a Node.js environment

**[Concepts](/resources/concepts.md)**

Learn about key concepts like Account Abstraction

---

### Need Help?


{% include "../../.gitbook/includes/support-cards.md" %}