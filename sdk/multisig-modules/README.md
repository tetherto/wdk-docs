# Multisig Modules

Overview of WDK Multisig Modules

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
| @tetherto/wdk-protocol-multisig-safe | EVM | ✅ Ready | [Documentation](protocol-multisig-safe/README.md) |

## Module Features

### Standard Features

All multisig modules share these core features:

* **Multi-Owner Management**: Add, remove, and swap owners
* **Threshold Configuration**: Set required approval count
* **Propose/Approve/Execute**: Standard multisig workflow
* **Transaction Tracking**: View pending and historical transactions
* **Message Signing**: Sign and verify messages with multisig approval (EIP-1271)

### Account Abstraction Features

Modules with ERC-4337 support include:

* **Gasless Transactions**: Pay fees in ERC-20 tokens (e.g., USDT)
* **Sponsored Mode**: Completely gas-free transactions
* **Bundled Operations**: Multiple approvals in single transaction

## Getting Started

To get started with WDK multisig modules, follow these steps:

1. Get up and running quickly with our [Quick Start Guide](/start-building/nodejs-bare-quickstart)
2. Choose the module that best fits your needs from the table above
3. Check specific documentation for the module you wish to use

## Next Steps

**Protocol Multisig Safe**

Safe Protocol multisig with ERC-4337 account abstraction

**Node.js Quickstart**

Get started with WDK in a Node.js environment

**Concepts**

Learn about key concepts like Account Abstraction

---

### Need Help?

**Discord Community**

Connect with developers, ask questions, share your projects

[Join Community](https://discord.gg/arYXDhHB2w)

**GitHub Issues**

Report bugs, request features, and get technical help

[Open an Issue](https://github.com/tetherto/wdk-core)

**Email Contact**

For sensitive or private matters, contact our team directly

[Send an email](mailto:support@tether.to)