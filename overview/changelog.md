---
title: Changelog
description: Updates and improvements to the Wallet Development Kit (WDK) modules and tools.
icon: clock-rotate-left
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

### February 26, 2026

**Changes**
- **wdk-protocol-bridge-usdt0-evm** ([v1.0.0-beta.3](https://github.com/tetherto/wdk-protocol-bridge-usdt0-evm/releases/tag/v1.0.0-beta.3)): Added per-call `BridgeOptions` overrides (`oftContractAddress`, `dstEid`) and expanded routing from EVM source chains to EVM plus non-EVM destinations (Solana, TON, TRON).

---

### February 25, 2026

**Changes**
- **wallet-evm** ([v1.0.0-beta.8](https://github.com/tetherto/wdk-wallet-evm/releases/tag/v1.0.0-beta.8)): Added [`getTokenBalances(tokenAddresses)`](../sdk/wallet-modules/wallet-evm/api-reference.md#gettokenbalancestokenaddresses) to [`WalletAccountReadOnlyEvm`](../sdk/wallet-modules/wallet-evm/api-reference.md#walletaccountreadonlyevm), also available on [`WalletAccountEvm`](../sdk/wallet-modules/wallet-evm/api-reference.md#walletaccountevm) through inheritance.
- **wallet-evm-erc-4337** ([v1.0.0-beta.5](https://github.com/tetherto/wdk-wallet-evm-erc-4337/releases/tag/v1.0.0-beta.5)): Added EIP-712 typed data methods [`signTypedData(typedData)`](../sdk/wallet-modules/wallet-evm-erc-4337/api-reference.md#signtypeddatatypeddata) and [`verifyTypedData(typedData, signature)`](../sdk/wallet-modules/wallet-evm-erc-4337/api-reference.md#verifytypeddatatypeddata-signature), plus multicall token balance method [`getTokenBalances(tokenAddresses)`](../sdk/wallet-modules/wallet-evm-erc-4337/api-reference.md#gettokenbalancestokenaddresses).

---

### February 24, 2026

**Changes**
- **wallet-spark** ([v1.0.0-beta.11](https://github.com/tetherto/wdk-wallet-spark/releases/tag/v1.0.0-beta.11)): Added Pear runtime entrypoint support (`pear.js`), removed static import causing runtime issues, and bumped spark bare SDK (`@buildonspark/bare`) to `0.0.47`.

---

### February 20, 2026

**What's New**
- **[Showcase](../overview/showcase.md)**: More visibility for our showcase page, we value contributions! Added 4 featured community projects: [wdk-mcp](https://github.com/dieselftw/wdk-mcp), [wdk-starter-browser-extension](https://github.com/base58-io/wdk-starter-browser-extension), [wdk-wallet-evm-x402-facilitator](https://github.com/SemanticPay/wdk-wallet-evm-x402-facilitator), and [x402-usdt0](https://github.com/baghdadgherras/x402-usdt0).
- **[Community Modules](../sdk/community-modules/README.md)**: Added [`@base58-io/wdk-wallet-cosmos`](https://github.com/base58-io/wdk-wallet-cosmos) — wallet module for Cosmos-compatible blockchains by [Base58](https://base58.io/).

---

### February 18, 2026

**What's New**
- **[x402 Payments](../ai/x402.md)**: New guide for accepting and making instant USD₮ payments over HTTP using WDK self-custodial wallets. Covers the x402 protocol, buyer integration with `@tetherto/wdk-wallet-evm`, seller setup with hosted and self-hosted facilitators, and bridging USD₮ to Plasma and Stable chains.

---

### February 15, 2026

**Changes**
- **wallet-spark**: Added [`getIdentityKey()`](../sdk/wallet-modules/wallet-spark/api-reference.md#getidentitykey) method to [`WalletAccountReadOnlySpark`](../sdk/wallet-modules/wallet-spark/api-reference.md#walletaccountreadonlyspark) for retrieving the account's identity public key ([v1.0.0-beta.10](https://github.com/tetherto/wdk-wallet-spark/releases/tag/v1.0.0-beta.10))

---

### February 14, 2026

**Changes**
- **wallet-spark**: Upgrade spark-sdk from `0.6.1` to `0.6.4` and spark bare SDK to `0.0.43` ([v1.0.0-beta.9](https://github.com/tetherto/wdk-wallet-spark/releases/tag/v1.0.0-beta.9))

---

### February 12, 2026

**What's New**
- **[Agent Skills](../ai/agent-skills.md)**: New page covering WDK's agent skill capabilities, self-custodial vs hosted comparison, and platform compatibility with OpenClaw, Claude, Cursor, and other agent platforms.
- **[OpenClaw Integration](../ai/openclaw.md)**: New page for installing and configuring the WDK skill in OpenClaw via ClawHub, including security precautions for running agents locally.

**Changes**
- **wallet-evm** ([v1.0.0-beta.7](https://github.com/tetherto/wdk-wallet-evm/releases/tag/v1.0.0-beta.7)): Added [EIP-712](https://eips.ethereum.org/EIPS/eip-712) typed data support:
  - Added [`signTypedData(typedData)`](../sdk/wallet-modules/wallet-evm/api-reference.md#signtypeddatatypeddata) method to [`WalletAccountEvm`](../sdk/wallet-modules/wallet-evm/api-reference.md#walletaccountevm) for signing structured data
  - Added [`verifyTypedData(typedData, signature)`](../sdk/wallet-modules/wallet-evm/api-reference.md#verifytypeddatatypeddata-signature) method to [`WalletAccountEvm`](../sdk/wallet-modules/wallet-evm/api-reference.md#walletaccountevm) and [`WalletAccountReadOnlyEvm`](../sdk/wallet-modules/wallet-evm/api-reference.md#walletaccountreadonlyevm) for verifying typed data signatures
- **wallet-evm-erc-4337** ([v1.0.0-beta.4](https://github.com/tetherto/wdk-wallet-evm-erc-4337/releases/tag/v1.0.0-beta.4)):
  - Added 2 new gas payment modes: [Sponsorship Policy](../sdk/wallet-modules/wallet-evm-erc-4337/configuration.md#gas-payment-mode-flags) and [Native Coins](../sdk/wallet-modules/wallet-evm-erc-4337/configuration.md#gas-payment-mode-flags), alongside the existing Paymaster Token mode
  - Added per-call [config override](../sdk/wallet-modules/wallet-evm-erc-4337/api-reference.md#config-override) parameter to `sendTransaction`, `transfer`, `quoteSendTransaction`, and `quoteTransfer`
  - Added [`getUserOperationReceipt(hash)`](../sdk/wallet-modules/wallet-evm-erc-4337/api-reference.md#getuseroperationreceipthash) method for retrieving ERC-4337 UserOperation receipts
  - Added [`ConfigurationError`](../sdk/wallet-modules/wallet-evm-erc-4337/api-reference.md#configurationerror) error type for invalid configuration validation

---

### February 10, 2026

**What's New**
- **[Build with AI](../start-building/build-with-ai.md)**: New guide for using AI coding assistants with WDK. Includes MCP server setup, Markdown context endpoints, project rules, and example prompts. Supports Cursor, Claude Code, GitHub Copilot, Windsurf, Cline, and Continue.
- **[MCP Toolkit](../ai/mcp-toolkit/README.md)**: New documentation for `@tetherto/wdk-mcp-toolkit` (`v1.0.0-beta.1`). Covers the `WdkMcpServer` class, 35 built-in MCP tools across 7 categories (wallet, pricing, indexer, swap, bridge, lending, fiat), setup wizard, multi-tool configuration, and full API reference.

---

### February 08, 2026

**Changes**
- **wallet-spark**: Fixed import causing wallet init failure. Upgrade spark-sdk from `0.5.7` to `0.6.1` ([v1.0.0-beta.8](https://github.com/tetherto/wdk-wallet-spark/releases/tag/v1.0.0-beta.8))

---

### February 02, 2026

**Changes**
- **wallet-ton-gasless**: Added `verify` method to [`WalletAccountReadOnlyTonGasless`](../sdk/wallet-modules/wallet-ton-gasless/api-reference.md#walletaccountreadonlytongasless) ([v1.0.0-beta.4](https://github.com/tetherto/wdk-wallet-ton-gasless/releases/tag/v1.0.0-beta.4))
- **wallet-tron-gasfree**: Added `verify` method to [`WalletAccountReadOnlyTronGasfree`](../sdk/wallet-modules/wallet-tron-gasfree/api-reference.md#walletaccountreadonlytrongasfree) ([v1.0.0-beta.4](https://github.com/tetherto/wdk-wallet-tron-gasfree/releases/tag/v1.0.0-beta.4))

---

### January 29, 2026

**What's New**
- **wdk-indexer**
  - Updated Ethereum indexer supported tokens list to add USA₮. 

**Changes**
- **wdk-indexer docs**
  - Fixed the USD₮, XAU₮ token names. 

---

### January 26, 2026

**Changes**
- **wallet-btc** ([v1.0.0-beta.5](https://github.com/tetherto/wdk-wallet-btc/releases/tag/v1.0.0-beta.5)):
  - Added `verify` method to [`WalletAccountReadOnlyBtc`](../sdk/wallet-modules/wallet-btc/api-reference.md#walletaccountreadonlybtc)
  - Added Pluggable Transport classes: [`ElectrumTcp`](../sdk/wallet-modules/wallet-btc/api-reference.md#electrumtcp), [`ElectrumTls`](../sdk/wallet-modules/wallet-btc/api-reference.md#electrumtls), [`ElectrumSsl`](../sdk/wallet-modules/wallet-btc/api-reference.md#electrumssl), [`ElectrumWs`](../sdk/wallet-modules/wallet-btc/api-reference.md#electrumws)
- **wallet-evm**: Added `verify` method to [`WalletAccountReadOnlyEvm`](../sdk/wallet-modules/wallet-evm/api-reference.md#walletaccountreadonlyevm) ([v1.0.0-beta.5](https://github.com/tetherto/wdk-wallet-evm/releases/tag/v1.0.0-beta.5))
- **wallet-solana**: Added `verify` method to [`WalletAccountReadOnlySolana`](../sdk/wallet-modules/wallet-solana/api-reference.md#walletaccountreadonlysolana) ([v1.0.0-beta.5](https://github.com/tetherto/wdk-wallet-solana/releases/tag/v1.0.0-beta.5))
- **wallet-ton**: Added `verify` method to [`WalletAccountReadOnlyTon`](../sdk/wallet-modules/wallet-ton/api-reference.md#walletaccountreadonlyton) ([v1.0.0-beta.7](https://github.com/tetherto/wdk-wallet-ton/releases/tag/v1.0.0-beta.7))
- **wallet-tron**: Added `verify` method to [`WalletAccountReadOnlyTron`](../sdk/wallet-modules/wallet-tron/api-reference.md#walletaccountreadonlytron) ([v1.0.0-beta.4](https://github.com/tetherto/wdk-wallet-tron/releases/tag/v1.0.0-beta.4))
- **wallet-spark**: Added `verify` method to [`WalletAccountReadOnlySpark`](../sdk/wallet-modules/wallet-spark/api-reference.md#walletaccountreadonlyspark) ([v1.0.0-beta.7](https://github.com/tetherto/wdk-wallet-spark/releases/tag/v1.0.0-beta.7))

---

### January 23, 2026

**What's New**
- **wdk-core docs**: Added comprehensive [Core Module Guides](../sdk/core-module/guides/getting-started.md) covering:
  - [Getting Started](../sdk/core-module/guides/getting-started.md) - Installation and instantiation
  - [Wallet Registration](../sdk/core-module/guides/wallet-registration.md) - Registering wallet modules for different blockchains
  - [Account Management](../sdk/core-module/guides/account-management.md) - Working with accounts and addresses
  - [Transactions](../sdk/core-module/guides/transactions.md) - Sending native tokens
  - [Protocol Integration](../sdk/core-module/guides/protocol-integration.md) - Using swaps, bridges, and lending protocols
  - [Middleware](../sdk/core-module/guides/middleware.md) - Configuring logging and failover protection
  - [Error Handling](../sdk/core-module/guides/error-handling.md) - Best practices and memory management
- **wdk-core**: Added support for 24-word seed phrases via `WDK.getRandomSeedPhrase(24)`
- **indexer-api**: 
  - Added new `/api/v1/chains` endpoint to list supported blockchains and tokens
  - Added XAU₮ support for Plasma network

**Changes**
- **wallet-btc docs**: 
  - Updated documentation with BIP-84 (Native SegWit) and BIP-44 (Legacy) support
  - Improved API reference and configuration documentation
- **wallet-spark docs**: 
  - Removed testnet support (now only mainnet and regtest)
  - Added [Lightspark Regtest Faucet](https://app.lightspark.com/regtest-faucet) link for test funds
- **wallet-tron-gasfree docs**: 
  - Updated testnet from Shasta to Nile
  - Updated GasFree service URLs and configuration examples
- **wallet-evm-erc-4337 docs**: Added paymaster token configuration documentation
- **docs**: 
  - Updated token symbols to USD₮ and XAU₮ throughout documentation
  - Various documentation improvements with better cross-linking and examples

**Fixes**
- **wallet-tron-gasfree docs**: Fixed typo "Gras-Free" to "Gas-Free"
- Fixed GitBook callout syntax and formatting issues across documentation

---

### December 23, 2025

**What's New**
- Added [MoonPay Fiat Module](../sdk/fiat-modules/fiat-moonpay/) for on-ramp and off-ramp functionality
- Added [Community Modules](../sdk/community-modules/) section to highlight community-built modules

**Changes**
- Added this changelog page in the docs!
- **wallet-spark**: Updated Spark SDK to latest version ([v1.0.0-beta.6](https://github.com/tetherto/wdk-wallet-spark/releases/tag/v1.0.0-beta.6))
- Introduced [All Modules](../sdk/all-modules.md) page in docs for comprehensive module listings
- Reorganized documentation structure for better navigation

---

### December 17, 2025

**What's New**
- **wdk-core**: Added fiat protocol support for on-ramp integrations ([v1.0.0-beta.5](https://github.com/tetherto/wdk-core/releases/tag/v1.0.0-beta.5))
- **wdk-wallet**: Added fiat protocol integration ([v1.0.0-beta.6](https://github.com/tetherto/wdk-wallet/releases/tag/v1.0.0-beta.6))

---

### December 3, 2025

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

### November 14, 2025

**Changes**
- **wdk-wallet**: Runtime updates and dependency synchronization ([v1.0.0-beta.5](https://github.com/tetherto/wdk-wallet/releases/tag/v1.0.0-beta.5))

---

### November 12, 2025

**What's New**
- **wallet-solana**: Added `sendTransaction` support with unit tests ([v1.0.0-beta.3](https://github.com/tetherto/wdk-wallet-solana/releases/tag/v1.0.0-beta.3))

**Changes**
- **wallet-solana**: Fixed `punycode` module resolution issue
- **lending-aave-evm**: Runtime compatibility updates ([v1.0.0-beta.3](https://github.com/tetherto/wdk-protocol-lending-aave-evm/releases/tag/v1.0.0-beta.3))

---

### November 11, 2025

**Changes**
- **swap-velora-evm**: Runtime compatibility updates ([v1.0.0-beta.4](https://github.com/tetherto/wdk-protocol-swap-velora-evm/releases/tag/v1.0.0-beta.4))

---

### November 9-10, 2025

**What's New**
- **wallet-ton-gasless**: Added unit tests ([v1.0.0-beta.3](https://github.com/tetherto/wdk-wallet-ton-gasless/releases/tag/v1.0.0-beta.3))
- **pear-wrk-wdk**: Added seed buffer support in `workletStart` ([v1.0.0-beta.5](https://github.com/tetherto/pear-wrk-wdk/releases/tag/v1.0.0-beta.5))

**Changes**
- **wallet-tron-gasfree**: Fixed bug interacting with Gasfree API ([v1.0.0-beta.3](https://github.com/tetherto/wdk-wallet-tron-gasfree/releases/tag/v1.0.0-beta.3))
- **wallet-ton-gasless**: Updated TON query-id and transaction hash handling
- **wallet-evm**: Runtime updates ([v1.0.0-beta.4](https://github.com/tetherto/wdk-wallet-evm/releases/tag/v1.0.0-beta.4))
- **wallet-tron**: Dependency and runtime updates ([v1.0.0-beta.3](https://github.com/tetherto/wdk-wallet-tron/releases/tag/v1.0.0-beta.3))

---

### November 8, 2025

**Changes**
- **wdk-core**: Updated `bare-node-runtime` for improved compatibility ([v1.0.0-beta.4](https://github.com/tetherto/wdk-core/releases/tag/v1.0.0-beta.4))
- **wallet-spark**: Updated Spark dependencies and improved `dispose` method ([v1.0.0-beta.5](https://github.com/tetherto/wdk-wallet-spark/releases/tag/v1.0.0-beta.5))

---

### November 7, 2025

**Changes**
- **wallet-evm-erc-4337**: Fixed destructuring of user operation in `getTransactionReceipt()` ([v1.0.0-beta.3](https://github.com/tetherto/wdk-wallet-evm-erc-4337/releases/tag/v1.0.0-beta.3))
- **wallet-ton**: Replaced UUID-based message body with seqno/queryId for TON transfers, downgraded `@ton/ton` to 15.1.0 for stability ([v1.0.0-beta.5](https://github.com/tetherto/wdk-wallet-ton/releases/tag/v1.0.0-beta.5))

---

## How to Stay Updated

- Check this page for the latest updates
- Join our [Discord community](https://discord.gg/arYXDhHB2w) for real-time announcements
- Star and follow the [GitHub repositories](https://github.com/orgs/tetherto/repositories?q=wdk) for detailed release notes
