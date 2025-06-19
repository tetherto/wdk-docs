---
title: Prerequisites
author: Raquel Carrasco Gonzalez
lastReviewed: 2025-06-16
---

# Prerequisites

Before you start using the Wallet Development Kit (WDK), ensure you have the following prerequisites set up in your development environment.

- Node.js installed (16 or later)
- Access to the official WDK Core repository


## Blockchain Knowledge

While this documentation will introduce and explain the fundamental concepts required to use WDK, having prior knowledge of the topics below will help you get started more quickly and confidently.

### Required Understanding

- Basic blockchain concepts
- Ethereum and EVM fundamentals
- Bitcoin fundamentals
- TON fundamentals
- Account abstraction basics
- Gas fees and transaction mechanics

## Development Setup

### API Keys and Configuration

- RPC Provider API Key

### Environment Setup

#### Environment Configuration

```bash
SEED_PHRASE=<seed_phrase>
CHAIN_ID=<chain_id>
RPC_URL=<your_rpc_url>
BUNDLER_URL=<your_bundler_url>
PAYMASTER_URL=<your_paymaster_url>
PAYMASTER_ADDRESS=<paymaster_contract_address>
ENTRY_POINT_ADDRESS=<entry_point_contract_address>
```

> **Note**: For development purposes, you can store your seed phrase in the `.env` file. Make sure `.env` is in your `.gitignore` to prevent accidentally committing sensitive data.



## Next Steps

* [Create your first wallet](2-getting-started/quick-start.md)
