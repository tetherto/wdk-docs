---
title: Wallet & Account
description: How to generate, validate and reuse a universal seed phrase, create blockchain-specific wallets, **and work with account-abstraction addresses** in WDK.
author: Raquel Carrasco Gonzalez
lastReviewed: 2025-06-20
---

#  Seed Phrase, Wallet & Account

## 1 · One seed phrase → many blockchains

WDK’s architecture is modular. You use the same seed phrase for different blockchains, but instantiate a different wallet manager for each blockchain. 

Each manager knows how to derive accounts and addresses according to that blockchain’s standards (BIP-44, BIP-84, etc.).

| Concept | Universal? | Blockchain-specific? | Who handles it |
|---------|------------|----------------------|----------------|
| Seed phrase | ✔ | — | `WdkManager.isValidSeedPhrase` / `getRandomSeedPhrase` |
| Key derivation | — | ✔ BIP-44/84/2017-TON | The corresponding **WalletManager** |
| Account abstraction | — | ✔ (EVM ERC-4337, TON gasless) | `AccountAbstractionManager*` spun up by **WdkManager** |

### How does this work?

- The **seed phrase** is the root of all your keys and accounts, for any supported blockchain.

- Each **WalletManager** (EVM, BTC, TON, etc.) knows how to derive the correct keys and addresses for its blockchain from the same seed.

- You don’t need to specify the blockchain when generating or validating the seed phrase, but you do when creating a wallet manager or account.

- Using **Account-Abstraction Manager** (optional) wraps that account in a smart-contract wallet or gasless proxy.

## 2 · Validate or generate a seed phrase

```javascript
import WdkManager from './wdk-core/wdk-manager.js';

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

## 3 · Instantiate classic wallet managers

### Example: Getting an Ethereum account

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

### Example: Getting an Arbitrum account

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

### Example: Getting an Polygon account

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

### Example: Getting a Bitcoin account

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


### Example: Getting a TON account

```js
import WalletManagerTonGasless from '@wdk/wallet-ton-gasless';

// Create wallet manager for TON (account abstraction)
const wallet = new WalletManagerTonGasless(process.env.SEED_PHRASE, {
    tonClient: { url: process.env.TON_CENTER_URL, secretKey: process.env.TON_CENTER_SECRET },
    tonApiClient: { url: process.env.TON_API_URL, secretKey: process.env.TON_API_SECRET },
});

// Get the first account (BIP-44 path, e.g., "0'/0/0")
const account = await wallet.getAccount("0'/0/0");
console.log("Account address:", await account.getAddress());
```


### Example: Getting a Spark account
> 🚧 Work in progress

## 4 · Account abstraction (AA) wallets

### What is it?

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

### EVM ERC-4337 example (native & token balance) in Arbitrum

```js
import AccountAbstractionManagerEvm from '@wdk/account-abstraction-evm';

// Initialize Account Abstraction
const wdk = new AccountAbstractionManagerEvm(account, {
    "chainId": 42161, // Arbitrum
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

// Check native token balance (ETH)
const nativeBalance = await wdk.getAbstractedAddressBalance();
console.log("ETH Balance:", nativeBalance);

// Check USDT balance
const usdtAddress = "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9"; // USDT on Arbitrum
​
const usdtBalance = await arbitrum.getAbstractedAddressTokenBalance(usdtAddress);
console.log("USDT Balance:", usdtBalance);
```

### TON gas-sponsored example

```js 
import WdkManager, { Blockchain } from './wdk-manager.js';

const ton = new WdkManager(seed, {
  ton: {
    tonClient: { url: process.env.TON_CENTER_URL, secretKey: process.env.TON_CENTER_SK },
    tonApiClient: { url: process.env.TON_API_URL, secretKey: process.env.TON_API_SK },
    paymasterToken: { address: process.env.USDT_TON }
  }
});

const aaTon = await ton.getAbstractedAddress(Blockchain.Ton, 0);
console.log('AA TON address:', aaTon);

const bal = await ton.getAbstractedAddressBalance(Blockchain.Ton, 0);
console.log('AA TON (nanoTON):', bal);
```

## 5 · Quick reference

| Task                     | Classic account                      | Account-abstracted address                              |
| ------------------------ | ------------------------------------ | ------------------------------------------------------- |
| Get address              | `account.getAddress()`               | `wdk.getAbstractedAddress()`                            |
| Native balance           | `account.getBalance()`               | `wdk.getAbstractedAddressBalance()`                     |
| Token balance            | `account.getTokenBalance(token)`     | `wdk.getAbstractedAddressTokenBalance()`                |
| Transfer / Swap / Bridge | Use account’s `sendTransaction` etc. | `wdk.transfer / swap / bridge` (handles paymaster & AA) |

> Tip: Start with classic wallets; switch to AA helpers when you need gasless UX or custom fee logic.







