---
title: 
description:
author: Raquel Carrasco Gonzalez
lastReviewed: 2025-09-15
icon:    
---

## Conceptual Flow / Lifecycle

WDK provides a flexible SDK for building digital wallets across multiple blockchains.  
The lifecycle starts with a user action in the app and ends with a blockchain response, always keeping keys and state under the developer’s control.

---

### General Flow

1. **User Action** – the user performs an action in the app (e.g., view balance, transfer a token).  
2. **App → WDK Core** – the app calls WDK Core with the request, specifying the network and function.  
3. **Core → Module** – Core routes the request to the appropriate module:  
   - **Wallet Module** for standard wallet operations (create wallet, transfer, balances).  
   - **Protocol Module** for advanced use cases (swap, bridge, lending).  
4. **Module → Blockchain** – the module generates and signs the transaction, manages gas configuration or Paymaster logic, and submits it to the blockchain.  
5. **Blockchain → App** – the blockchain returns a response (transaction hash, balance, or error).  

WDK never stores keys, balances, or transactions. It only processes and routes requests.  

<!-- diagram with branches: 
User Action → App → WDK Core → { Wallet Module | Protocol Module } → Blockchain → Response -->

<!-- diagram with branches -->

```text
        [User Action]
              │
              ▼
           [Your App]
              │
              ▼
          [WDK Core]
           /      \
          /        \
 [Wallet Module]  [Protocol Module]
   (create,          (swap,
   transfer,          bridge,
   balances)          lending)
          \        /
           \      /
            ▼    ▼
          [Blockchain]
              │
              ▼
         [Response: 
   tx hash, balance, error]

---

### Example: Gasless USDT Transfer with Paymaster

1. The user selects **Transfer USDT** in the app.  
2. The app calls **WDK Core**, specifying the **Tron network** and the **transfer function**.  
3. WDK Core passes the request to the **Wallet Tron Gasfree Module**.  
4. The module:  
   - Generates the transaction with the user’s private key  
   - Configures gas handling through the **Paymaster**, allowing USDT instead of TRX for fees  
   - Signs and submits the transaction to Tron  
5. The blockchain validates and broadcasts the transaction.  
6. The developer receives the **transaction hash**, which can be tracked via the Indexer API.  

<!-- diagram: Paymaster Gasless USDT Transfer -->

```text
        [User: Transfer USDT]
                  │
                  ▼
              [Your App]
                  │
                  ▼
              [WDK Core]
                  │
                  ▼
     [Wallet Tron Gasfree Module]
                  │
     (build tx + sign with key)
                  │
     (configure Paymaster → pay fees in USDT)
                  │
                  ▼
              [Blockchain]
                  │
                  ▼
     [Response: Transaction Hash]

---

### Indexer for Queries
For read-only operations like balances or transaction history, WDK uses a **public Indexer API**.  
This allows developers to query blockchain data without managing full nodes.  

---

### Key Management Note
If the developer does not already have a private key, WDK can integrate with the **Secret Key Manager** to generate and encrypt one securely.  
See [Secret Key Manager](../wdk-modules/wallet-modules/wdk-core/overview.md) for details.

---
