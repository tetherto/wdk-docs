# Supported Blockchains

WDK supports a wide range of blockchains, enabling seamless multi-chain wallet development.

---

## EVM-Compatible Blockchains
|  | Blockchain | Description |
|--|------------|-------------|
| 🟦 | Ethereum   | Leading smart contract platform, supports ERC-20 tokens and DeFi. |
| 🟪 | Polygon    | Scalable, low-fee EVM chain, ideal for dApps and DeFi. |
| 🟧 | Arbitrum   | Layer 2 scaling solution for Ethereum, fast and cost-effective. |

## Non-EVM Blockchains
|  | Blockchain | Description |
|--|------------|-------------|
| 💎 | TON        | High-performance blockchain for decentralized apps and payments. |
| 🟠 | Bitcoin    | The original cryptocurrency, secure and widely adopted. |
| ⚡ | Spark (Lightning Network) | Fast, low-fee Bitcoin payments via Lightning Network. |

---

## How to Add a New Blockchain
1. Add a new config object for your blockchain:
   ```js
   const config = {
     ...,
     mychain: {
       chainId: 123,
       blockchain: "mychain",
       rpcUrl: "https://rpc.mychain.org",
       // ...other fields
     }
   };
   ```
2. Pass it to `WdkManager` during initialization.
3. Use the unified API as with any other chain.

For usage and integration, see the [API Reference](api-reference.md). 