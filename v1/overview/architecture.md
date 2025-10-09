---
title: Architecture 
description: WDK is a collection of modules that work together to build wallets. It includes wallet SDKs, protocol SDKs for DeFi features, WDK Core for management, Secret Manager and Indexer modules for data queries. Together, they help developers create complete, flexible, self-custodial wallet solutions.
lastReviewed: 2025-09-15
icon: building
---


## High-Level Architecture

WDK is designed as a **modular framework**.  
At the center is **WDK Core**, which acts as a **Wallet/SDK Manager**.  
Core gives developers a single entry point to interact with independent modules, while keeping the design flexible and self-custodial.

### Conceptual Flow

The WDK flow starts with a user action and ends with a blockchain response:

1. **User Action** – the user performs an action in the app (e.g., view balance, transfer a token).  
2. **App → WDK Core** – the app calls WDK Core with the request, specifying the network and function.  
3. **Core → Module** – Core routes the request to the appropriate module:  
   - **Wallet Module** for standard wallet operations (create wallet, transfer, balances).  
   - **Protocol Module** for advanced use cases (swap, bridge, lending).  
4. **Module → Blockchain** – the module generates and signs the transaction, manages gas configuration or Paymaster logic, and submits it to the blockchain.  
5. **Blockchain → App** – the blockchain returns a response (transaction hash, balance, or error).  
6. **Indexer API** – for read-only operations like balances or transaction history, WDK uses the Indexer API to query blockchain data without managing full nodes.

```text
        [User Action]
              │
              ▼
           [Your App]
              │
              ▼
          [WDK Core]    [Indexer API]  [Key Manager]
                         (balances,      (generate,
                         transaction     encrypt,
                         history)        store keys)
           /      \        │              │
          /        \       │              │
 [Wallet Module]  [Protocol Module]       │
   (create,          (swap,               │
   transfer,          bridge,              │
   balances)          lending)             │
          \        /       │              │
           \      /        │              │
            ▼    ▼         ▼              ▼
          [Blockchain]
              │
              ▼
         [Response: 
   tx hash, balance, error]
```

WDK never stores keys, balances, or transactions. It only processes and routes requests.

<!-- diagram: App → WDK Core → [Wallet Modules | Protocol Modules | Key Manager] → Blockchains -->

### Module Categories

WDK is built around a collection of modules that work together to provide comprehensive wallet capabilities. These modules include wallet implementations for different blockchains, protocol modules for advanced DeFi features, and supporting modules for data queries and key management.
---

### Core
- **WDK Core (Wallet Manager)** – the controller that unifies access to all modules.  
- Developers call Core → Core routes requests to the right module.  
- Keeps API usage consistent across networks.  

---

WDK modules fall into four main categories:

1. **Wallet Modules** – core wallet implementations for each blockchain (EVM, Bitcoin, Solana, TON, Tron, Spark, Ark ⏳).  
   - Subtypes:  
     - *Classic Wallets* – use native gas tokens.  
     - *Account Abstraction Wallets* – support gasless transactions via Paymaster.  

2. **Swap Protocol Modules** – enable DeFi token swaps across different DEXs ⏳  

3. **Bridge Protocol Modules** – cross-chain token transfers ⏳  

4. **Lending Protocol Modules** – DeFi lending & borrowing (e.g., Aave) ⏳  


> For the full list of supported modules and their repositories, see the [Modules Overview](../wdk-modules/overview.md).

### Supporting Modules

WDK also includes essential supporting modules that enhance wallet functionality:

- **Indexer API** – Provides fast access to blockchain transaction data and balances across multiple networks. Offers real-time data synchronization and simple REST API integration for wallet applications.

- **Secret Manager** – Secure, in-memory management of wallet seed phrases and sessions. Handles BIP39 mnemonic generation, encryption, and secure key derivation for wallet applications.

> For detailed information about these supporting modules, see the [Indexer Overview](../../documentation/indexer-overview.md) and [Secret Manager](../../documentation/secret-manager.md) documentation.

