# Chain & Unit Reference

## Chains, Native Tokens & Base Units

| Chain | Chain ID | Native Token | Base Unit | Decimals | 1 Token = |
|-------|----------|-------------|-----------|----------|-----------|
| **Bitcoin** | — | BTC | satoshi | 8 | 100,000,000 sats |
| **Ethereum** | 1 | ETH | wei | 18 | 10^18 wei |
| **Arbitrum** | 42161 | ETH | wei | 18 | 10^18 wei |
| **Optimism** | 10 | ETH | wei | 18 | 10^18 wei |
| **Polygon** | 137 | POL | wei | 18 | 10^18 wei |
| **Berachain** | 80094 | BERA | wei | 18 | 10^18 wei |
| **Ink** | 57073 | ETH | wei | 18 | 10^18 wei |
| **Plasma** | 9745 | XPL | wei | 18 | 10^18 wei |
| **Mantle** | 5000 | MNT | wei | 18 | 10^18 wei |
| **Avalanche** | 43114 | AVAX | wei | 18 | 10^18 wei |
| **Celo** | 42220 | CELO | wei | 18 | 10^18 wei |
| **Kaia** | 8217 | KLAY | wei | 18 | 10^18 wei |
| **Unichain** | 130 | ETH | wei | 18 | 10^18 wei |
| **Sei** | 1329 | SEI | wei | 18 | 10^18 wei |
| **Flare** | 14 | FLR | wei | 18 | 10^18 wei |
| **Rootstock** | 30 | RBTC | wei | 18 | 10^18 wei |
| **Corn** | 21000000 | BTCN | wei | 18 | 10^18 wei |
| **Morph** | 2818 | ETH | wei | 18 | 10^18 wei |
| **XLayer** | 196 | OKB | wei | 18 | 10^18 wei |
| **HyperEVM** | 999 | HYPE | wei | 18 | 10^18 wei |
| **MegaETH** | 4326 | ETH | wei | 18 | 10^18 wei |
| **Monad** | 143 | MON | wei | 18 | 10^18 wei |
| **Stable** | 988 | gUSDT | wei | 18 | 10^18 wei |
| **Conflux eSpace** | 1030 | CFX | wei | 18 | 10^18 wei |
| **Solana** | — | SOL | lamport | 9 | 1,000,000,000 lamports |
| **Spark** | — | BTC | satoshi | 8 | 100,000,000 sats |
| **TON** | — | TON | nanoton | 9 | 1,000,000,000 nanotons |
| **TRON** | — | TRX | sun | 6 | 1,000,000 sun |

## Public RPC Endpoints

Default public RPCs for chains listed above. All are rate-limited — use a provider (Alchemy, QuickNode, Infura, etc.) for production.

### EVM Chains

| Chain | Chain ID | Public RPC | Notes |
|-------|----------|------------|-------|
| **Ethereum** | 1 | `https://eth.drpc.org` | Also: `https://eth.llamarpc.com` |
| **Arbitrum** | 42161 | `https://arb1.arbitrum.io/rpc` | Official Arbitrum Foundation |
| **Optimism** | 10 | `https://mainnet.optimism.io` | Official Optimism |
| **Polygon** | 137 | `https://polygon-rpc.com` | Official Polygon Labs |
| **Avalanche** | 43114 | `https://api.avax.network/ext/bc/C/rpc` | Official Avalanche C-Chain |
| **Celo** | 42220 | `https://forno.celo.org` | Official Celo |
| **Kaia** | 8217 | `https://public-en.node.kaia.io` | Official Kaia Foundation |
| **Plasma** | 9745 | `https://rpc.plasma.to` | Official Plasma |
| **Mantle** | 5000 | `https://rpc.mantle.xyz` | Official Mantle |
| **Berachain** | 80094 | `https://rpc.berachain.com` | Also: `https://berachain-rpc.publicnode.com` |
| **Ink** | 57073 | `https://rpc-gel.inkonchain.com` | Also: `https://ink.drpc.org` |
| **Unichain** | 130 | `https://mainnet.unichain.org` | ⚠️ Rate-limited, not for production |
| **Sei** | 1329 | `https://evm-rpc.sei-apis.com` | Official Sei EVM |
| **Flare** | 14 | `https://flare-api.flare.network/ext/C/rpc` | Official Flare |
| **Rootstock** | 30 | `https://public-node.rsk.co` | Official Rootstock |
| **Corn** | 21000000 | `https://maizenet-rpc.usecorn.com` | Official Corn |
| **Morph** | 2818 | `https://rpc-quicknode.morphl2.io` | Official Morph |
| **XLayer** | 196 | `https://rpc.xlayer.tech` | Official OKX; 100 req/s limit |
| **HyperEVM** | 999 | `https://rpc.hyperliquid.xyz/evm` | ⚠️ 100 req/min limit |
| **MegaETH** | 4326 | `https://mainnet.megaeth.com/rpc` | Official MegaETH |
| **Monad** | 143 | `https://rpc.monad.xyz` | Also: `https://monad-mainnet.drpc.org` |
| **Stable** | 988 | `https://rpc.stable.xyz` | Gas paid in gUSDT |
| **Conflux eSpace** | 1030 | `https://evm.confluxrpc.com` | Official Confura; free tier rate-limited |

### Non-EVM Chains

| Chain | Endpoint | Notes |
|-------|----------|-------|
| **Bitcoin** | `electrum.blockstream.info:50001` (TCP) | Electrum protocol, not HTTP RPC |
| **Solana** | `https://api.mainnet-beta.solana.com` | Official Solana; heavy rate limits |
| **TON** | `https://toncenter.com/api/v2/jsonRPC` | Requires API key for production |
| **TRON** | `https://api.trongrid.io` | TronGrid API; requires API key for production |
| **Spark** | Uses `@buildonspark/spark-sdk` | SDK handles connectivity |

## Common Token Decimals

| Token | Decimals | Note |
|-------|----------|------|
| USDT / USDT0 | 6 | All chains |
| USDC | 6 | All chains |
| DAI | 18 | EVM chains |
| WETH | 18 | EVM chains |
| WBTC | 8 | EVM chains |


## EIP-3009 Support (Gasless Transfers)

EIP-3009 allows `transferWithAuthorization` / `receiveWithAuthorization` — the user signs an off-chain EIP-712 message and a relayer submits it, paying gas on behalf of the user.

| Token | Chain | EIP-3009 Support |
|-------|-------|-----------------|
| USDT (native) | Ethereum | ❌ Not supported |
| USDT (native) | TRON | ❌ Not supported |
| USDT0 | Arbitrum | ✅ Supported |
| USDT0 | Plasma | ✅ Supported — Plasma Relayer API provides free gas. Min 1 USDT0 (1,000,000 base units). |

Spec: https://eips.ethereum.org/EIPS/eip-3009


## Address Format Validation

| Chain | Format | Example |
|-------|--------|---------|
| **Bitcoin** | Bech32 (`bc1...`) | `bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4` |
| **EVM** (all) | Hex, 42 chars, checksum | `0xdAC17F958D2ee523a2206206994597C13D831ec7` |
| **Solana** | Base58, 32-44 chars | `Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB` |
| **TON** | Base64url or raw | `EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs` |
| **TRON** | Base58Check, starts with `T` | `TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t` |


## Dust Thresholds

Minimum meaningful amounts below which transactions will fail or be rejected by the network:

| Chain | Dust Threshold | Notes |
|-------|---------------|-------|
| **Bitcoin** | 546 sats (P2PKH), 294 sats (P2WPKH) | Network enforced |
| **Solana** | ~890,880 lamports | Rent-exempt minimum for accounts |
| **Plasma (gasless)** | 1,000,000 (1 USDT0) | Relayer minimum |
| **TRON** | Varies | Energy/bandwidth cost may exceed value for tiny amounts |


## WDK Bridge Supported Routes

Source chains (EVM only): ethereum, arbitrum, polygon, berachain, ink
Destination chains: ethereum, arbitrum, polygon, berachain, ink, ton, tron

ERC-4337 (Account Abstraction) currently supported on: Arbitrum
