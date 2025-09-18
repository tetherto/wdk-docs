---
title: 
description:
author: Raquel Carrasco Gonzalez
lastReviewed: 2025-09-15
icon:    
---


---
## High-Level Architecture

WDK is designed as a **modular framework**.  
At the center is **WDK Core**, which acts as a **Wallet/SDK Manager**.  
Core gives developers a single entry point to interact with independent modules, while keeping the design flexible and non-custodial.

<!-- diagram: App → WDK Core → [Wallet Modules | Protocol Modules | Key Manager] → Blockchains -->

### Module Categories

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