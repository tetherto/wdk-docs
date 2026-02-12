# Deployments: Token Addresses & RPC Endpoints

## USD₮ (USDT) — Native Deployments

WDK-relevant chains only. All USDT are **6 decimals**.

| Chain | Address | Notes |
|-------|---------|-------|
| **Ethereum** | `0xdAC17F958D2ee523a2206206994597C13D831ec7` | ⚠️ Non-standard ERC20: no bool return on `transfer()`. Use SafeERC20. Does NOT support EIP-3009. |
| **TRON** | `TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t` | ⚠️ Same non-standard transfer as Ethereum USDT. |
| **Solana** | `Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB` | SPL token mint address |
| **TON** | `EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs` | Jetton master contract |
| **Avalanche** | `0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7` | Standard ERC20 |
| **Celo** | `0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e` | Standard ERC20 |
| **Kaia** | `0xd077a400968890eacc75cdc901f0356c943e4fdb` | Standard ERC20 |
| **Cosmos (Kava)** | `0x919C1c267BC06a7039e03fcc2eF738525769109c` | ERC20 on Kava EVM |

Full list: https://tether.to/en/supported-protocols/


## USD₮0 (USDT0) — Omnichain Deployments via LayerZero

Token address = what users hold. OFT address = LayerZero cross-chain messaging. All **6 decimals**.

| Chain | Chain ID | Token Address | OFT Address |
|-------|----------|---------------|-------------|
| **Ethereum** | 1 | (native USDT locked) | `0x6C96dE32CEa08842dcc4058c14d3aaAD7Fa41dee` (Adapter) |
| **Arbitrum** | 42161 | `0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9` | `0x14E4A1B13bf7F943c8ff7C51fb60FA964A298D92` |
| **Optimism** | 10 | `0x01bFF41798a0BcF287b996046Ca68b395DbC1071` | `0xF03b4d9AC1D5d1E7c4cEf54C2A313b9fe051A0aD` |
| **Polygon** | 137 | `0xc2132D05D31c914a87C6611C10748AEb04B58e8F` | `0x6BA10300f0DC58B7a1e4c0e41f5daBb7D7829e13` |
| **Plasma** | 9745 | `0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb` | `0x02ca37966753bDdDf11216B73B16C1dE756A7CF9` |
| **Mantle** | 5000 | `0x779Ded0c9e1022225f8E0630b35a9b54bE713736` | `0xcb768e263FB1C62214E7cab4AA8d036D76dc59CC` |
| **Berachain** | 80094 | `0x779Ded0c9e1022225f8E0630b35a9b54bE713736` | `0x3Dc96399109df5ceb2C226664A086140bD0379cB` |
| **Ink** | 57073 | `0x0200C29006150606B650577BBE7B6248F58470c1` | `0x1cB6De532588fCA4a21B7209DE7C456AF8434A65` |
| **Unichain** | 130 | `0x9151434b16b9763660705744891fA906F660EcC5` | `0xc07bE8994D035631c36fb4a89C918CeFB2f03EC3` |
| **Sei** | 1329 | `0x9151434b16b9763660705744891fA906F660EcC5` | `0x56Fe74A2e3b484b921c447357203431a3485CC60` |
| **Flare** | 14 | `0xe7cd86e13AC4309349F30B3435a9d337750fC82D` | `0x567287d2A9829215a37e3B88843d32f9221E7588` |
| **Rootstock** | 30 | `0x779dED0C9e1022225F8e0630b35A9B54Be713736` | `0x1a594d5d5d1c426281C1064B07f23F57B2716B61` |
| **Corn** | 21000000 | `0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb` | `0x3f82943338a8a76c35BFA0c1828aA27fd43a34E4` |
| **Morph** | 2818 | `0xe7cd86e13AC4309349F30B3435a9d337750fC82D` | `0xcb768e263FB1C62214E7cab4AA8d036D76dc59CC` |
| **XLayer** | 196 | `0x779Ded0c9e1022225f8E0630b35a9b54bE713736` | `0x94bcca6bdfd6a61817ab0e960bfede4984505554` |
| **HyperEVM** | 999 | `0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb` | `0x904861a24F30EC96ea7CFC3bE9EA4B476d237e98` |
| **MegaETH** | 4326 | `0xb8ce59fc3717ada4c02eadf9682a9e934f625ebb` | `0x9151434b16b9763660705744891fa906f660ecc5` |
| **Monad** | 143 | `0xe7cd86e13AC4309349F30B3435a9d337750fC82D` | `0x9151434b16b9763660705744891fA906F660EcC5` |
| **Stable** | 988 | `0x779Ded0c9e1022225f8E0630b35a9b54bE713736` | `0xedaba024be4d87974d5aB11C6Dd586963CcCB027` |
| **Conflux eSpace** | 1030 | `0xaf37E8B6C9ED7f6318979f56Fc287d76c30847ff` | `0xC57efa1c7113D98BdA6F9f249471704Ece5dd84A` |

Full list + live updates: https://docs.usdt0.to/technical-documentation/deployments
API endpoint: https://docs.usdt0.to/api/deployments