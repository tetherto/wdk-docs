---
title: Changelog
description: Updates and improvements to the Wallet Development Kit (WDK) modules and tools.
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

# Changelog

Stay up to date with the latest improvements, new features, and bug fixes across all WDK modules.

---


### December 23, 2024

**What's New**
- Added [MoonPay Fiat Module](../sdk/fiat-modules/fiat-moonpay/) for on-ramp and off-ramp functionality
- Added [Community Modules](../sdk/community-modules/) section to highlight community-built modules

**Changes**
- Added this changelog page in the docs!
- **wallet-spark**: Updated Spark SDK to latest version ([v1.0.0-beta.6](https://github.com/tetherto/wdk-wallet-spark/releases/tag/v1.0.0-beta.6))
- Introduced [All Modules](../sdk/all-modules.md) page in docs for comprehensive module listings
- Reorganized documentation structure for better navigation

### December 17, 2024

**What's New**
- **wdk-core**: Added fiat protocol support for on-ramp integrations ([v1.0.0-beta.5](https://github.com/tetherto/wdk-core/releases/tag/v1.0.0-beta.5))
- **wdk-wallet**: Added fiat protocol integration ([v1.0.0-beta.6](https://github.com/tetherto/wdk-wallet/releases/tag/v1.0.0-beta.6))

### December 3, 2024

**What's New**
- **wallet-ton**: Added integration tests ([v1.0.0-beta.6](https://github.com/tetherto/wdk-wallet-ton/releases/tag/v1.0.0-beta.6))
- **wallet-btc**: Added support for custom `feeRate` and `confirmationTarget` parameters ([v1.0.0-beta.4](https://github.com/tetherto/wdk-wallet-btc/releases/tag/v1.0.0-beta.4))

**Changes**
- **wallet-ton**: Updated default derivation path, fixed transaction receipt LT and from address
- **wallet-solana**: Updated default derivation path for better compatibility ([v1.0.0-beta.4](https://github.com/tetherto/wdk-wallet-solana/releases/tag/v1.0.0-beta.4))
- **wallet-btc**: Multiple improvements:
  - Automatic dust limit inference based on wallet type
  - Performance improvements with bounded concurrency and caching for `getTransfers`
  - Switched to `bitcoinjs-message` for standard message signing
  - Updated default BIP to 84 (Native SegWit)
  - Fixed testnet derivation path (now uses `1'`)

---

### November 14, 2024

**Changes**
- **wdk-wallet**: Runtime updates and dependency synchronization ([v1.0.0-beta.5](https://github.com/tetherto/wdk-wallet/releases/tag/v1.0.0-beta.5))

### November 12, 2024

**What's New**
- **wallet-solana**: Added `sendTransaction` support with unit tests ([v1.0.0-beta.3](https://github.com/tetherto/wdk-wallet-solana/releases/tag/v1.0.0-beta.3))

**Changes**
- **wallet-solana**: Fixed `punycode` module resolution issue
- **lending-aave-evm**: Runtime compatibility updates ([v1.0.0-beta.3](https://github.com/tetherto/wdk-protocol-lending-aave-evm/releases/tag/v1.0.0-beta.3))

### November 11, 2024

**Changes**
- **swap-velora-evm**: Runtime compatibility updates ([v1.0.0-beta.4](https://github.com/tetherto/wdk-protocol-swap-velora-evm/releases/tag/v1.0.0-beta.4))

### November 9-10, 2024

**What's New**
- **wallet-ton-gasless**: Added unit tests ([v1.0.0-beta.3](https://github.com/tetherto/wdk-wallet-ton-gasless/releases/tag/v1.0.0-beta.3))
- **pear-wrk-wdk**: Added seed buffer support in `workletStart` ([v1.0.0-beta.5](https://github.com/tetherto/pear-wrk-wdk/releases/tag/v1.0.0-beta.5))

**Changes**
- **wallet-tron-gasfree**: Fixed bug interacting with Gasfree API ([v1.0.0-beta.3](https://github.com/tetherto/wdk-wallet-tron-gasfree/releases/tag/v1.0.0-beta.3))
- **wallet-ton-gasless**: Updated TON query-id and transaction hash handling
- **wallet-evm**: Runtime updates ([v1.0.0-beta.4](https://github.com/tetherto/wdk-wallet-evm/releases/tag/v1.0.0-beta.4))
- **wallet-tron**: Dependency and runtime updates ([v1.0.0-beta.3](https://github.com/tetherto/wdk-wallet-tron/releases/tag/v1.0.0-beta.3))

### November 8, 2024

**Changes**
- **wdk-core**: Updated `bare-node-runtime` for improved compatibility ([v1.0.0-beta.4](https://github.com/tetherto/wdk-core/releases/tag/v1.0.0-beta.4))
- **wallet-spark**: Updated Spark dependencies and improved `dispose` method ([v1.0.0-beta.5](https://github.com/tetherto/wdk-wallet-spark/releases/tag/v1.0.0-beta.5))

### November 7, 2024

**Changes**
- **wallet-evm-erc-4337**: Fixed destructuring of user operation in `getTransactionReceipt()` ([v1.0.0-beta.3](https://github.com/tetherto/wdk-wallet-evm-erc-4337/releases/tag/v1.0.0-beta.3))
- **wallet-ton**: Replaced UUID-based message body with seqno/queryId for TON transfers, downgraded `@ton/ton` to 15.1.0 for stability ([v1.0.0-beta.5](https://github.com/tetherto/wdk-wallet-ton/releases/tag/v1.0.0-beta.5))

---

## How to Stay Updated

- Check this page for the latest updates
- Join our [Discord community](https://discord.gg/arYXDhHB2w) for real-time announcements
- Star and follow the [GitHub repositories](https://github.com/orgs/tetherto/repositories?q=wdk) for detailed release notes
