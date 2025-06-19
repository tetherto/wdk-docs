---
title: Quick Start Guide
description: Transaction tutorial using Wallet Development Kit (WDK)
author: Raquel Carrasco Gonzalez
lastReviewed: 2025-06-16
---

# Quick Start Guide

This guide will walk you through performing your first transaction using the Wallet Development Kit (WDK) in just 15 minutes.

## Prerequisites

- Node.js installed
- Basic understanding of blockchain concepts
- Some USDT on Arbitrum Mainnet for testing

## Step 1: Installation

```bash
git clone https://github.com/tetherto/wdk-core.git
cd wdk-core
npm install 
```

## Step 2: Import or Create a New Seed Phrase

#### Verify Seed Phrase

```javascript
import WdkManager from '@wdk/wdk-core';

// Check if seed phrase is valid
const isValid = WdkManager.isValidSeedPhrase(process.env.SEED_PHRASE);
console.log("Seed phrase is valid:", isValid);
```

To create a new wallet, you can generate a secure seed phrase using WDK:

```javascript
import WdkManager from '@wdk/wdk-core';

// Or, generate a new seed phrase
const seedPhrase = WdkManager.getRandomSeedPhrase();
console.log("Your seed phrase:", seedPhrase);

// Verify the seed phrase
const isValid = WdkManager.isValidSeedPhrase(seedPhrase);
console.log("Seed phrase is valid:", isValid);
```
#### Create Wallet Manager

```javascript
import WalletManagerEvm from '@wdk/wallet-evm';

// Create wallet manager
const wallet = new WalletManagerEvm(process.env.SEED_PHRASE, {
    "chainId": 42161, // Arbitrum
    "rpcUrl": process.env.RPC_URL
});

// Get the first account
const account = await wallet.getAccount(0);
console.log("Account address:", await account.getAddress());
```

## Step 3: Initialize WDK Manager

```javascript
import AccountAbstractionManagerEvm from '@wdk/account-abstraction-evm';

// Initialize Account Abstraction
const arbitrum = new AccountAbstractionManagerEvm(account, {
    "chainId": 42161,
    "rpcUrl": process.env.RPC_URL,
    "bundlerUrl": process.env.BUNDLER_URL,
    "paymasterUrl": process.env.PAYMASTER_URL,
    "paymasterAddress": process.env.PAYMASTER_ADDRESS,
    "entryPointAddress": process.env.ENTRY_POINT_ADDRESS,
    "safeModulesVersion": "0.3.0",
    "transferMaxFee": 5_000_000,
    "paymasterToken": {
        "address": "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9" // USDT on Arbitrum
    }
});
```

## Step 4: Check Balances

```javascript
// Check native token balance (ETH)
const nativeBalance = await arbitrum.getAbstractedAddressBalance();
console.log("ETH Balance:", nativeBalance);

// Check USDT balance
const usdtAddress = "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9";

const usdtBalance = await arbitrum.getAbstractedAddressTokenBalance(usdtAddress);
console.log("USDT Balance:", usdtBalance);
```

## Step 5: Get USDT Transfer Quote

```javascript
// Estimate the cost of a transfer operation
const quote = await arbitrum.quoteTransfer({
    recipient: "<recipient_address>", // Replace with the actual recipient address
    amount: "1",
    token: usdtAddress // Replace with the desired token to transfer
}, {
    paymasterToken: {
        address: usdtAddress
    },
    transferMaxFee: 1_000_000
});

console.log("Gas Cost:", quote.gasCost);
console.log("Gas Cost in USDT:", (quote.gasCost / 1_000_000).toFixed(6), "USDT");
```

## Step 6: Execute Transfer

```javascript
const transferResult = await arbitrum.transfer({
    recipient: "<recipient_address>", // Replace with the actual recipient address
    amount: "1",
    token: usdtAddress // Replace with the desired token to transfer
}, {
    paymasterToken: {
        address: usdtAddress
    },
    transferMaxFee: 1_000_000
});

console.log("Transfer successful!");
console.log("Transaction Hash:", transferResult.hash);
console.log("Gas Cost:", transferResult.gasCost);
```

## Next Steps
- [Explore supported blockchains](2-getting-started/supported-blockchains.md)
