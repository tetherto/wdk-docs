# Deployments: Token Addresses

## USD₮ (`USDT`) — Native Deployments

WDK-relevant chains only. All USD₮ are **6 decimals**.

| Chain | Address | Notes |
|-------|---------|-------|
| **Ethereum** | `0xdAC17F958D2ee523a2206206994597C13D831ec7` | ⚠️ Non-standard ERC20: no bool return on `transfer()`. Use SafeERC20. Does NOT support EIP-3009. |
| **TRON** | `TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t` | ⚠️ Same non-standard transfer as Ethereum USD₮. |
| **Solana** | `Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB` | SPL token mint address |
| **TON** | `EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs` | Jetton master contract |
| **Aptos** | `0x357b0b74bc833e95a115ad22604854d6b0fca151cecd94111770e5d6ffc9dc2b` | Fungible Asset metadata (the `token` value WDK expects). Contract address: `0xf73e887a8754f540ee6e1a93bdc6dde2af69fc7ca5de32013e89dd44244473cb`. |
| **Avalanche** | `0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7` | Standard ERC20 |
| **Celo** | `0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e` | Standard ERC20 |
| **Kaia** | `0xd077a400968890eacc75cdc901f0356c943e4fdb` | Standard ERC20 |
| **Cosmos (Kava)** | `0x919C1c267BC06a7039e03fcc2eF738525769109c` | ERC20 on Kava EVM |

Full list: https://tether.to/en/supported-protocols/


## USD₮0 (`USDT0`) — Omnichain Deployments via LayerZero

Deployment coverage and addresses change. Resolve them from the authoritative deployment page or API immediately before configuring a route; do not copy a frozen inventory into an integration.

The API groups contracts by product family (`usdt0`, `xaut0`, or `usat`) and network. Treat each contract's `name` as its role; additional roles such as safes, composers, OneSig contracts, and wrappers vary by network.

- **Token** is the contract or asset users hold on that network.
- **OFT** is the LayerZero omnichain contract used for cross-chain messaging.
- **OFT Adapter** locks native USD₮ on Ethereum for the omnichain route.
- Address formats and available metadata differ on non-EVM networks. Use the current chain ID, LayerZero endpoint ID, and address instead of assuming EVM defaults. Resolve token decimals from current chain or token metadata; do not infer them from the deployment role.

Full list + live updates: https://docs.usdt0.to/technical-documentation/deployments
API endpoint: https://docs.usdt0.to/api/deployments
