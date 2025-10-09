---
title: 
description:
lastReviewed: 2025-09-15
icon:    
---

## Key Terminology

These terms are used throughout the WDK documentation.  
Refer back here whenever you need quick definitions.

---

### Stateless
WDK does not persist secrets, sessions, or configs.  
All operations run in-memory, and developers must handle secure storage externally.

### Self Custodial
Users always control their private keys.  
WDK never stores, transmits, or has access to secrets.

### Account Abstraction
A smart contract wallet model (ERC-4337 and beyond) that separates user operations from the transaction model.  
Enables gasless transactions, custom fee logic, and sponsored transactions.

### Paymaster
A module or service that pays transaction fees on behalf of the user, often using stablecoins (e.g., USDT).  
Simplifies UX by removing the need for native gas tokens.

### Indexer
A backend service that syncs blockchain data and makes it queryable.  
Used in WDK to provide transaction history, balances, and analytics.

### Runtime
The environment where WDK runs.  
Currently supports Node.js and Bare Runtime.

### Wallet Module
A building block that implements wallet functionality for a specific blockchain (e.g., EVM, Bitcoin, Solana).

### Protocol Module
Extends WDK with DeFi functionality like swaps, bridges, or lending.  
Always optional, plug-and-play.

### Secret Key Manager
A module for generating, encrypting, and securely handling private keys.  
Supports recovery and multi-device sync while remaining self-custodial.
