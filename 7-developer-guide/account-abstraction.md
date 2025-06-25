---
title: WDK Account Abstraction Configuration
description: Learn how WDK enables advanced account abstraction features—such as gasless transactions and custom validation—across supported blockchains.
author: Raquel Carrasco Gonzalez
lastReviewed: 2025-06-25
---
> 🚧 Work in progress

# Account abstraction (AA) wallets

## What is it?

- **Smart-contract wallet address** distinct from the EOA key.
- Gas can be sponsored via **paymaster tokens**.
- EVM chains: **ERC-4337** (entry-point contract).
- TON: **gasless v4 contract** with paymaster callback.

WDK hides the boilerplate:

```
sequenceDiagram
    participant Dev
    Dev->>WdkManager: getAbstractedAddressBalance('ethereum',0)
    WdkManager->>AccountAbstractionManagerEvm: (instantiate)
    AccountAbstractionManagerEvm->>RPC: eth_getBalance(aaAddress)
```

### EVM account-abstraction (ERC-4337) in WDK

WDK wraps your EOA key in a **smart-contract wallet** that talks to the canonical  
**EntryPoint** contract (ERC-4337). Every user operation (`UserOp`) follows this path:

1. **Bundler** – receives your signed `UserOp`, batches it and submits one on-chain tx.  
2. **EntryPoint** – verifies the signature and calls your **account contract** (wallet).  
3. **Paymaster** (optional) – if present, sponsors the gas and later charges you in a Jetton / ERC-20.  

That is why the config needs:

| Field | Why it’s required |
|-------|-------------------|
| `rpcUrl` | Where the Bundler eventually publishes the batched tx. |
| `bundlerUrl` | REST/WebSocket endpoint that queues your `UserOp`. |
| `entryPointAddress` | Chain-specific EntryPoint (same for all users). |
| `paymasterUrl` / `paymasterAddress` | Optional; lets you go **gasless** or pay fees in USDT, etc. |
| `paymasterToken.address` | ERC-20 the paymaster bills (USDT, USDC…). |
| `safeModulesVersion` | Minor version of the Safe module bundle inside the wallet contract. |
| `transferMaxFee` | Client-side cap so unexpected spikes fail fast. |

If you omit the paymaster fields the wallet still works, but the **user pays gas
in native ETH / MATIC / ARB**. With the fields present, the paymaster front-runs
the fee and later pulls the stable-coin amount from the account.

> The only code that changes per chain is the **chainId** and the  
> **paymasterToken.address** pointing to the correct USDT contract.


### ### TON gassless transactions in WDK

In TON every wallet **is already a smart-contract**. The latest **v4 wallet code** exposes a *plugin slot* that can run custom logic **before the chain deducts toncoin fees**.  

WDK takes advantage of that slot through **`AccountAbstractionManagerTon`** (created for you when you call the high-level helpers on `WdkManager`):

1. **User signs a transfer** → the paymaster-plugin inspects the message.  
2. If the sender holds ≥ **X units of the paymaster Jetton** (e.g. USDT-TON), the plugin *pays the toncoin fee up-front*.  
3. Once the transfer is final, the plugin pulls an equivalent amount of the Jetton from the user to reimburse itself.

Because the plugin must know *which* Jetton to bill, you set

```js
paymasterToken: { address: 'EQDx…USDTJetton' }
```

> **Note**: Jetton is TON’s native standard for fungible tokens—­the TON-chain equivalent of an ERC-20 on Ethereum.

If you omit that field, WdkManager instantiates only the classic WalletManagerTon and fees are paid in native TON as usual, because without that address the plugin can’t form the internal reimbursement call and the wallet reverts to a normal, toncoin-fee wallet.

So “gasless TON v4” in WDK really means fee sponsorship via a paymaster Jetton implemented inside the v4 wallet’s plugin slot—no ERC-4337 entry-point needed, just pure TON smart-contract logic orchestrated by AccountAbstractionManagerTon.

---

## Account Abstraction Configuration

Below is a sample configuration object for account abstraction across multiple blockchains.  
This structure shows the required fields for each supported network, including EVM chains (Ethereum, Arbitrum, Polygon), as well as TRON, TON, Bitcoin, and Spark.  
You can use and adapt these settings when initializing your account abstraction managers in WDK.

### RPC Provider API Key

Below is a quick explainer you can drop into the docs.

|                           |                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **What is it?**           | A unique identifier issued by an RPC-as-a-service provider (e.g., Alchemy, Infura, QuickNode, Chainstack, Ankr). It’s appended to the RPC URL, e.g. `https://eth-mainnet.g.alchemy.com/v2/<API_KEY>`.                                                                                                                                                                                                                            |
| **Why do I need it?**     | • **Authentication & rate-limits** – lets the provider know who’s calling and apply usage quotas.<br>• **Reliability** – paid tiers include SLAs, archival data, websockets, etc.<br>• **Analytics & billing** – the key ties requests to your project so you can track traffic and costs.<br>• **Access to extras** – some endpoints (trace, debug, mempool, NFT APIs) require an authenticated key.                            |
| **How do I get one?**     | 1. **Choose a provider** (Alchemy, Infura, QuickNode, …).<br>2. **Create an account** (email + password or OAuth).<br>3. **Create a project/app** inside the dashboard.<br>4. The dashboard will display an **HTTP** and **WebSocket** endpoint containing your key—copy it.<br>5. **Store it securely** (environment variable or secrets manager), e.g. `export ETH_RPC_URL="https://eth-mainnet.g.alchemy.com/v2/abcdef123…"`. |
| **Free vs. paid?**        | Most providers offer a free tier (≈ 300k–500k requests/month). Upgrade for higher throughput, WebSocket support, archive data, or dedicated nodes.                                                                                                                                                                                                                                                                               |
| **Self-host alternative** | You can run your own node (e.g. Geth, Erigon, Nethermind) and skip API keys entirely, but you must maintain hardware, sync, and uptime yourself.                                                                                                                                                                                                                                                                                 |

> **Tip:** Never commit API keys to Git. Use `.env` files and a secrets manager in CI/CD.

### Bundler URL

Use the table below as a drop-in FAQ for your docs.

|                           |                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **What is it?**           | An HTTP (or WebSocket) endpoint exposed by an **ERC-4337 Bundler**. A Bundler collects `UserOperation`s from the AA mempool and submits them to the on-chain `EntryPoint` contract. Example: <br>`https://api.pimlico.io/v1/matic/bundler` <br>`https://bundler.stackup.sh/v1/testnet`                                                                                                                                                             |
| **Why do I need it?**     | • **Account Abstraction flow** – without a Bundler your Smart Account’s `UserOperation`s never reach the chain.<br>• **Batching & fee optimisation** – Bundlers aggregate multiple ops into a single transaction, saving gas.<br>• **Mempool propagation** – they gossip your `UserOperation` to other nodes so it can be picked up quickly.<br>• **Spam & replay protection** – good providers run validators to drop malformed or malicious ops. |
| **How do I get one?**     | 1. **Pick a provider** (Pimlico, Candide, Biconomy, StackUp, Alchemy AA, etc.).<br>2. **Sign up / create a project** in their dashboard.<br>3. Copy the **Bundler URL** (often shown alongside a Paymaster URL or API key).<br>4. Save it in an environment variable: <br>`export BUNDLER_URL="https://api.pimlico.io/v1/matic/bundler"`                                                                                                           |
| **Free vs. paid?**        | Most providers offer a free community tier (rate-limited); paid plans unlock higher TPS, private mempools, and SLA guarantees.                                                                                                                                                                                                                                                                                                                     |
| **Self-host alternative** | Run your own Bundler (open-source implementations from StackUp, Pimlico, Biconomy). You’ll need:<br>• A synced RPC node<br>• Persistent storage for the AA mempool<br>• Cron job or service to mine & broadcast bundles                                                                                                                                                                                                                            |
| **Security tip**          | Treat Bundler URLs with API tokens the same as RPC keys—keep them in `.env` files or a secrets manager and never commit them to Git.                                                                                                                                                                                                                                                                                                               |

> **Quick test:**
>
> ```bash
> curl -X POST $BUNDLER_URL \
>   -H "Content-Type: application/json" \
>   -d '{"jsonrpc":"2.0","id":1,"method":"eth_supportedEntryPoints","params":[]}'
> ```
>
> A healthy Bundler should return the address of the supported `EntryPoint` contract.



```json
{
    "ethereum": {
        "chainId": 1,
        "blockchain": "ethereum",
        "provider": "https://rpc.mevblocker.io/fast",
        "bundlerUrl": "https://api.candide.dev/public/v3/ethereum",
        "paymasterUrl": "https://api.candide.dev/public/v3/ethereum",
        "paymasterAddress": "0x8b1f6cb5d062aa2ce8d581942bbb960420d875ba",
        "entrypointAddress": "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
        "transferMaxFee": 5000000,
        "swapMaxFee": 5000000,
        "bridgeMaxFee": 5000000,
        "paymasterToken": {
            "address": "0xdAC17F958D2ee523a2206206994597C13D831ec7"
        }
    },
    "arbitrum": {
        "chainId": 42161,
        "blockchain": "arbitrum",
        "provider": "https://1rpc.io/arb",
        "bundlerUrl": "https://public.pimlico.io/v2/42161/rpc",
        "paymasterUrl": "https://public.pimlico.io/v2/42161/rpc",
        "paymasterAddress": "0x777777777777AeC03fd955926DbF81597e66834C",
        "entrypointAddress": "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
        "transferMaxFee": 5000000,
        "swapMaxFee": 5000000,
        "bridgeMaxFee": 5000000,
        "paymasterToken": {
            "address": "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9"
        }
    },
    "polygon": {
        "chainId": 137,
        "blockchain": "polygon",
        "provider": "https://polygon-rpc.com",
        "bundlerUrl": "https://api.candide.dev/public/v3/polygon",
        "paymasterUrl": "https://api.candide.dev/public/v3/polygon",
        "paymasterAddress": "0x8b1f6cb5d062aa2ce8d581942bbb960420d875ba",
        "entryPointAddress": "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
        "transferMaxFee": 5000000,
        "swapMaxFee": 5000000,
        "bridgeMaxFee": 5000000,
        "paymasterToken": {
            "address": "0xdAC17F958D2ee523a2206206994597C13D831ec7"
        },
        "safeModulesVersion": "0.3.0"
    },
    "tron": {
        "chainId": 3448148188,
        "provider": "https://trongrid.io",
        "gasFreeProvider": "https://gasfree.io",
        "apiKey": "75d7a666-9edf-4301-96a9-01a2d17500ea",
        "apiSecret": "g6glyFa2Ksb_YRZjOSk5JdQBd27dsyi11f23m89c4IU",
        "serviceProvider": "TKtWbdzEq5ss9vTS9kwRhBp5mXmBfBns3E",
        "verifyingContract": "THQGuFzL87ZqhxkgqYEryRAd7gqFqL5rdc",
        "transferMaxFee": 10000000,
        "swapMaxFee": 1000000,
        "bridgeMaxFee": 1000000,
        "paymasterToken": {
            "address": "TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf"
        }
    },
    "ton": {
        "tonApiUrl": "https://tonapi.io",
        "tonApiSecretKey": null,
        "tonCenterUrl": "https://toncenter.com/api/v2/jsonRPC",
        "tonCenterSecretKey": null,
        "paymasterToken": {
            "address": "EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs"
        }
    },
    "bitcoin": {
        "host": "api.ordimint.com",
        "port": 50001
    },
    "spark": {
        "network": "MAINNET"
    }
}
```

> **Tip:**  
> Adjust the values (such as provider URLs, paymaster addresses, and token addresses) to match your environment and the service providers you choose.  
> For more details on each field, see the relevant sections above or the [Wallet & Account (EVM)](./wdk-evm/create-wallet.md) [Wallet & Account (TON)](./wdk-ton/create-wallet.md) or  documentation.
