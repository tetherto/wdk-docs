## All Modules
URL: https://wdk.tether.io/developers/blocks
Description: Complete list of available WDK wallet, pricing, swidge, swap, bridge, lending, and fiat interfaces and modules.

A comprehensive list of all available WDK modules. Each module is designed to be modular and can be used independently or combined with others.

## Core Module

The orchestrator that manages all WDK modules.

| Module | Description | Documentation |
|--------|-------------|---------------|
| [`@tetherto/wdk`](https://github.com/tetherto/wdk) | Central orchestrator for all WDK modules | [Docs](/sdk/core-module/) |

## Wallet Modules

Wallet modules provide blockchain-specific wallet functionality for managing addresses, balances, and transactions.

| Module | Blockchain | Description | Documentation |
|--------|------------|-------------|---------------|
| [`@tetherto/wdk-wallet-btc`](https://github.com/tetherto/wdk-wallet-btc) | Bitcoin | Bitcoin SegWit wallet with BIP-39/BIP-44 support | [Docs](/sdk/wallet-modules/wallet-btc/) |
| [`@tetherto/wdk-wallet-evm`](https://github.com/tetherto/wdk-wallet-evm) | EVM | Ethereum and EVM-compatible chains wallet | [Docs](/sdk/wallet-modules/wallet-evm/) |
| [`@tetherto/wdk-wallet-evm-erc-4337`](https://github.com/tetherto/wdk-wallet-evm-erc-4337) | EVM | ERC-4337 Account Abstraction for EVM chains | [Docs](/sdk/wallet-modules/wallet-evm-erc-4337/) |
| [`@tetherto/wdk-wallet-evm-7702-gasless`](https://github.com/tetherto/wdk-wallet-evm-7702-gasless) | EVM | EIP-7702 gasless account abstraction for EVM chains | [Docs](/sdk/wallet-modules/wallet-evm-7702-gasless/) |
| [`@tetherto/wdk-wallet-ton`](https://github.com/tetherto/wdk-wallet-ton) | TON | TON blockchain wallet | [Docs](/sdk/wallet-modules/wallet-ton/) |
| [`@tetherto/wdk-wallet-ton-gasless`](https://github.com/tetherto/wdk-wallet-ton-gasless) | TON | Gasless Jetton transfers on TON | [Docs](/sdk/wallet-modules/wallet-ton-gasless/) |
| [`@tetherto/wdk-wallet-tron`](https://github.com/tetherto/wdk-wallet-tron) | TRON | TRON blockchain wallet | [Docs](/sdk/wallet-modules/wallet-tron/) |
| [`@tetherto/wdk-wallet-tron-gasfree`](https://github.com/tetherto/wdk-wallet-tron-gasfree) | TRON | Gas-free transactions on TRON | [Docs](/sdk/wallet-modules/wallet-tron-gasfree/) |
| [`@tetherto/wdk-wallet-solana`](https://github.com/tetherto/wdk-wallet-solana) | Solana | Solana blockchain wallet | [Docs](/sdk/wallet-modules/wallet-solana/) |
| [`@tetherto/wdk-wallet-solana-gasless`](https://github.com/tetherto/wdk-wallet-solana-gasless) | Solana | Gasless Solana transactions through a Kora-compatible paymaster | [Docs](/sdk/wallet-modules/wallet-solana-gasless/) |
| [`@tetherto/wdk-wallet-aptos`](https://github.com/tetherto/wdk-wallet-aptos) | Aptos | Aptos blockchain wallet with native APT and fungible asset support | [Docs](/sdk/wallet-modules/wallet-aptos/) |
| [`@tetherto/wdk-wallet-spark`](https://github.com/tetherto/wdk-wallet-spark) | Spark | Spark/Lightning Bitcoin L2 wallet | [Docs](/sdk/wallet-modules/wallet-spark/) |

## Swidge Modules

Swidge providers can quote and execute asset routes. A route can be swap-only, bridge-only, or a combined swap and bridge route.

<Callout type="warn">
Rows marked Community are developed and maintained independently by third-party contributors.

Tether and the WDK Team do not endorse or assume responsibility for their code, security, or maintenance. Use your own judgment and proceed at your own risk.
</Callout>

| Module | Provider | Ownership | Description | Documentation |
|--------|----------|-----------|-------------|---------------|
| [`wdk-protocol-swidge-orchestra`](https://www.npmjs.com/package/wdk-protocol-swidge-orchestra) | Flashnet Orchestra | Community | Swidge provider for BTC and stablecoin routes returned by Orchestra. Treat the live [Orchestra route matrix](https://orchestration.flashnet.xyz/v1/orchestration/routes) as provider-level data and filter through package discovery before exposing routes. | [Docs](/sdk/swidge-modules/swidge-orchestra/) |
| [`@rhino.fi/wdk-protocol-swidge-rhinofi`](https://www.npmjs.com/package/@rhino.fi/wdk-protocol-swidge-rhinofi) | Rhino.fi | Community | Swidge routes for Rhino.fi cross-chain swap and bridge operations | [Docs](/sdk/swidge-modules/swidge-rhinofi/) |
| [`@symbiosis-finance/wdk-protocol-swidge-symbiosis`](https://www.npmjs.com/package/@symbiosis-finance/wdk-protocol-swidge-symbiosis) | Symbiosis | Community | Runtime-discovered exact-input quotes with EVM, Bitcoin, and capability-gated TON, Tron, and Solana source execution through the Symbiosis API | [Docs](/sdk/swidge-modules/swidge-symbiosis/) |
| [`@lifi/wdk-protocol-swidge-lifi`](https://www.npmjs.com/package/@lifi/wdk-protocol-swidge-lifi) | LI.FI | Community | Swidge routes for LI.FI swap, bridge, and combined swap-plus-bridge operations | [Docs](/sdk/swidge-modules/swidge-lifi/) |
| [`@0x/wdk-protocol-swidge-0x`](https://www.npmjs.com/package/@0x/wdk-protocol-swidge-0x) | 0x | Community | Same-chain EVM token swaps through the 0x Swap API v2 | [Docs](/sdk/swidge-modules/swidge-0x/) |

## Pricing Modules

Pricing modules provide `PricingClient` implementations for market data sources.

| Module | Provider | Description | Documentation |
|--------|----------|-------------|---------------|
| [`@tetherto/wdk-pricing-coingecko-http`](https://github.com/tetherto/wdk-pricing-coingecko-http) | CoinGecko | CoinGecko HTTP pricing client for current prices, price data, and historical series | [Docs](/sdk/pricing-modules/pricing-coingecko-http/) |
| [`@tetherto/wdk-pricing-bitfinex-http`](https://github.com/tetherto/wdk-pricing-bitfinex-http) | Bitfinex | Bitfinex HTTP pricing client for current prices, batched price data, and historical series | [Docs](/tools/price-rates/) |

## Swap Modules

DEX swap functionality for token exchanges.

| Module | Blockchain | Description | Documentation |
|--------|------------|-------------|---------------|
| [`@tetherto/wdk-protocol-swap-velora-evm`](https://github.com/tetherto/wdk-protocol-swap-velora-evm) | EVM | DEX aggregator swap on EVM chains | [Docs](/sdk/swap-modules/swap-velora-evm/) |

## Bridge Modules

Cross-chain bridge functionality for token transfers between blockchains.

| Module | Route | Description | Documentation |
|--------|-------|-------------|---------------|
| [`@tetherto/wdk-protocol-bridge-usdt0-evm`](https://github.com/tetherto/wdk-protocol-bridge-usdt0-evm) | EVM → EVM + Non-EVM | USD₮0 bridging from EVM source chains to EVM and non-EVM destinations | [Docs](/sdk/bridge-modules/bridge-usdt0-evm/) |

## Lending Modules

DeFi lending and borrowing functionality.

<Callout type="warn">
Rows marked Community are developed and maintained independently by third-party contributors.

Tether and the WDK Team do not endorse or assume responsibility for their code, security, or maintenance. Use your own judgment and proceed at your own risk.
</Callout>

| Module | Blockchain | Ownership | Description | Documentation |
|--------|------------|-----------|-------------|---------------|
| [`@tetherto/wdk-protocol-lending-aave-evm`](https://github.com/tetherto/wdk-protocol-lending-aave-evm) | EVM | Tether | Aave protocol integration for EVM | [Docs](/sdk/lending-modules/lending-aave-evm/) |
| [`@morpho-org/wdk-protocol-lending-morpho-evm`](https://www.npmjs.com/package/@morpho-org/wdk-protocol-lending-morpho-evm) | EVM | Community | Morpho Vault V2 and Morpho Blue lending integration for EVM | [Docs](/sdk/lending-modules/lending-morpho-evm/) |

## Fiat Modules

On-ramp and off-ramp functionality for fiat currency integration.

| Module | Provider | Description | Documentation |
|--------|----------|-------------|---------------|
| [`@tetherto/wdk-protocol-fiat-moonpay`](https://github.com/tetherto/wdk-protocol-fiat-moonpay) | MoonPay | MoonPay integration for fiat on-ramp | [Docs](/sdk/fiat-modules/fiat-moonpay/) |

## Community Modules

Modules built and maintained by the WDK community.

<Callout type="warn">
Community modules are developed and maintained independently by third-party contributors.

Tether and the WDK Team do not endorse or assume responsibility for their code, security, or maintenance. Use your own judgment and proceed at your own risk.
</Callout>

| Module | Category | Description | Documentation |
|--------|----------|-------------|---------------|
| [`@utexo/wdk-wallet-rgb`](https://github.com/UTEXO-Protocol/wdk-wallet-rgb) | Wallet | RGB protocol wallet integration | [Docs](/sdk/community-modules/wdk-wallet-rgb/) |
| [`@utexo/wdk-rgb-lightning`](https://www.npmjs.com/package/@utexo/wdk-rgb-lightning) | Wallet | RGB Lightning node and wallet integration | [Docs](/sdk/community-modules/wdk-rgb-lightning/) |
| [`@arkade-os/wdk`](https://www.npmjs.com/package/@arkade-os/wdk) | Wallet | Bitcoin wallet module built on the Arkade SDK | [README](https://github.com/arkade-os/arkade-wdk#readme) |
| [`@base58-io/wdk-wallet-cosmos`](https://github.com/base58-io/wdk-wallet-cosmos) | Wallet | Cosmos-compatible wallet integration | [Docs](/sdk/community-modules/wdk-wallet-cosmos/) |
| [`@morpho-org/wdk-protocol-lending-morpho-evm`](https://www.npmjs.com/package/@morpho-org/wdk-protocol-lending-morpho-evm) | Lending | Morpho Vault V2 and Morpho Blue lending integration | [Docs](/sdk/lending-modules/lending-morpho-evm/) |
| [`wdk-protocol-swidge-orchestra`](https://github.com/flashnetxyz/wdk-protocol-swidge-orchestra) | Swidge | Flashnet Orchestra BTC and stablecoin route integration | [Docs](/sdk/swidge-modules/swidge-orchestra/) |
| [`@rhino.fi/wdk-protocol-swidge-rhinofi`](https://www.npmjs.com/package/@rhino.fi/wdk-protocol-swidge-rhinofi) | Swidge | Rhino.fi cross-chain route integration | [Docs](/sdk/swidge-modules/swidge-rhinofi/) |
| [`@symbiosis-finance/wdk-protocol-swidge-symbiosis`](https://www.npmjs.com/package/@symbiosis-finance/wdk-protocol-swidge-symbiosis) | Swidge | Same-chain and cross-chain exact-input routes through Symbiosis | [Docs](/sdk/swidge-modules/swidge-symbiosis/) |
| [`@lifi/wdk-protocol-swidge-lifi`](https://www.npmjs.com/package/@lifi/wdk-protocol-swidge-lifi) | Swidge | LI.FI swap and bridge route integration | [Docs](/sdk/swidge-modules/swidge-lifi/) |
| [`@0x/wdk-protocol-swidge-0x`](https://www.npmjs.com/package/@0x/wdk-protocol-swidge-0x) | Swidge | 0x same-chain EVM route integration | [Docs](/sdk/swidge-modules/swidge-0x/) |
| [`@moonpay/wdk-protocol-swidge-moonpay-trade`](https://www.npmjs.com/package/@moonpay/wdk-protocol-swidge-moonpay-trade) | Swidge | Routes through MoonPay Trade | [README](https://www.npmjs.com/package/@moonpay/wdk-protocol-swidge-moonpay-trade#readme) |
| [`@swapdk/wdk-protocol-swidge-swapdk`](https://www.npmjs.com/package/@swapdk/wdk-protocol-swidge-swapdk) | Swidge | Routes through SwapDK | [README](https://github.com/Swap-DK/wdk-protocol-bridges-swapdk#readme) |
| [`@gobob/wdk-protocol-swidge-gateway`](https://www.npmjs.com/package/@gobob/wdk-protocol-swidge-gateway) | Swidge | Routes through the BOB Gateway | [README](https://github.com/bob-collective/wdk-protocol-swidge-gateway#readme) |
