---
title: Create Wallet
author: Raquel Carrasco Gonzalez
lastReviewed: 2025-06-20
---

# Create Wallet

## The same seed phrase for different blockchains

WDK’s architecture is modular. You use the same seed phrase for different blockchains, but instantiate a different wallet manager for each blockchain. 

Each manager knows how to derive accounts and addresses according to that blockchain’s standards (BIP-44, BIP-84, etc.).

### Validate or Generate a new seed phrase

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

## Create Wallet Manager

### Ethereum

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

### Arbitrum

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

### Polygon

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

### Bitcoin

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


### TON

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


### Spark
> 🚧 Work in progress

## How does this work?

- The **seed phrase** is the root of all your keys and accounts, for any supported blockchain.

- Each **WalletManager** (EVM, BTC, TON, etc.) knows how to derive the correct keys and addresses for its blockchain from the same seed.

- You don’t need to specify the blockchain when generating or validating the seed phrase, but you do when creating a wallet manager or account.

Summary:

- The seed phrase is universal and blockchain-agnostic.

- The wallet/account derivation is blockchain-specific, handled by the appropriate WDK manager.








