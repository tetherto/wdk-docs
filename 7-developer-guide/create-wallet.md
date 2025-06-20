---
title: Create Wallet
author: Raquel Carrasco Gonzalez
lastReviewed: 2025-06-20
---

# Creck Seed Phrase

```javascript
import WdkManager from '@wdk/wdk-core';

// Check if seed phrase is valid
const isValid = WdkManager.isValidSeedPhrase(process.env.SEED_PHRASE);
console.log("Seed phrase is valid:", isValid);
```

Or you can also create a new seed phrase, you can generate a secure seed phrase using WDK:

```javascript
import WdkManager from '@wdk/wdk-core';

// Or, generate a new seed phrase
const seedPhrase = WdkManager.getRandomSeedPhrase();
console.log("Your seed phrase:", seedPhrase);

// Verify the seed phrase
const isValid = WdkManager.isValidSeedPhrase(seedPhrase);
console.log("Seed phrase is valid:", isValid);
```

# Create Wallet Manager

## Ethereum

```javascript
import WalletManagerEvm from '@wdk/wallet-evm';

// Create wallet manager
const wallet = new WalletManagerEvm(process.env.SEED_PHRASE, {
    "chainId": 1, // Ethereum
    "rpcUrl": process.env.RPC_URL
});

// Get the first account
const account = await wallet.getAccount(0);
console.log("Account address:", await account.getAddress());
```

## Arbitrum

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

## Polygon

```javascript
import WalletManagerEvm from '@wdk/wallet-evm';

// Create wallet manager
const wallet = new WalletManagerEvm(process.env.SEED_PHRASE, {
    "chainId": 137, // Polygon
    "rpcUrl": process.env.RPC_URL
});

// Get the first account
const account = await wallet.getAccount(0);
console.log("Account address:", await account.getAddress());
```

## Bitcoin

```javascript
import WalletManagerBtc from '@wdk/wallet-btc';

// Create wallet manager for Bitcoin
const wallet = new WalletManagerBtc(process.env.SEED_PHRASE, {
    network: "bitcoin", // or "testnet" if you want to use testnet
    host: "electrum.blockstream.info", // optional, default is this value
    port: 50001, // optional, default is this value
    bip: 84 // optional, default is 84 (for native segwit addresses)
});

// Get the first account (BIP-44/84 path, e.g., "0'/0/0")
const account = await wallet.getAccount("0'/0/0");
console.log("Account address:", await account.getAddress());
```


## TON

```js
import WalletManagerTonGasless from '@wdk/wallet-ton-gasless';

// Create wallet manager for TON (account abstraction)
const wallet = new WalletManagerTonGasless(process.env.SEED_PHRASE, {
    tonClient: { url: process.env.TON_CENTER_URL, secretKey: process.env.TON_CENTER_SECRET },
    tonApiClient: { url: process.env.TON_API_URL, secretKey: process.env.TON_API_SECRET },
    paymasterToken: {
        address: process.env.PAYMASTER_TOKEN_ADDRESS // e.g., USDT or other token address on TON
    }
});

// Get the first account (BIP-44 path, e.g., "0'/0/0")
const account = await wallet.getAccount("0'/0/0");
console.log("Account address:", await account.getAddress());
```


## Spark
> 🚧 Work in progress






