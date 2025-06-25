---
title: Quick Start (EVM + ERC-4337)
author: Raquel Carrasco Gonzalez
lastReviewed: 2025-06-25
icon: rocket
---

> 🚧 Work in progress

This guide will walk you through the essential steps to set up a Node.js project and create your **first WDK wallet** using **account abstraction** and a **paymaster**.

The objective is to help you quickly get hands-on experience with the Wallet Development Kit (WDK), so you can understand how to **initialize a wallet**, **configure account abstraction**, and **perform basic blockchain operations** using `@wdk-wallet-evm-erc-4337`.

By the end of this guide, you will have:
- Initialized a Node.js project
- Created a simple script (`test.js`) to interact with [WDK EVM](../7-developer-guide/wdk-evm.md) and EVM Account Abstraction packages. 
- [Set up a wallet](../7-developer-guide/wdk-evm/create-wallet.md) with [account abstraction](./account-abstraction-basics.md) and [paymaster support](./account-abstraction-basics.md)
- Learned the basics of [sending transactions](../7-developer-guide/wdk-evm/transfer.md) and managing your wallet programmatically

---

## 0 · Prerequisites (what you need)

You can use your preferred Bundler & Paymaster service provider. But in this example we will use:  
- `BUNDLER_URL`, `PAYMASTER_URL`, `ENTRY_POINT_ADDRESS` (4337 v0.6)  from the [configuration page](../7-developer-guide/account-abstraction.md)
- RPC public endpoint: `https://polygon-rpc.com` 

| Tool | Version | Why |
|------|---------|-----|
| **Node.js** | 20 + | Native ESM, top-level `await` |
| **npm** | latest | Package manager |
| **Some USDT on Polygon** | test | Send + cover *transfer* amount |

> **Note**:
> For USDT transactions, we provide a test seed phrase that is pre-funded to sponsor a limited number of test transactions. This allows you to experiment with WDK features without needing to fund your own wallet initially.

---

## 1 · Project setup

```bash
mkdir wdk-quickstart && cd $_
npm init -y
npm install @wdk/wallet-evm @wdk/wallet-evm-erc-4337
```

## 2 · Bootstrap script

The script that follows does five things:

| # | Step | What it does | Why it matters |
|---|------|--------------|----------------|
| 1 | **Load deps** | Imports `@wdk/wallet-evm-erc-4337` | Gives the SDK what it needs to talk to any EVM Chain. |
| 2 | **Declare [Seed Phrase](../10-appendices/glossary.md#seed-phrase "A sequence of words that encodes the private key to your blockchain wallet.") and Account [Abstraction Configuration](../7-developer-guide/account-abstraction.md) for Polygon** | Declares the Seed Phrase and the configuration necessary to set up the chain and account abstraction for `WalletManagerEvm`| You always start with an EOA; it can sign messages and fund contract deployments. |
| 3 | **Create/attach a Smart Account** | Wraps that EOA in an ERC-4337 Smart Account via `SmartAccount4337.fromEOA()`. Uses your seed phrase to obtain the first Externally Owned Account (index 0) and attaches it to the RPC URL. | You always start with an EOA; it can sign messages and fund contract deployments, and with the `WalletManagerEvm` configuration turns your bare key into a programmable wallet that supports paymasters, social recovery, batching, etc. |
| 4 | **Read balances** | Queries Pol (Polygon gas and native token) and USDT balances from the Smart Account’s address. | Confirms you’re connected and have funds before attempting a transfer. |
| 5 | **Send a gas-sponsored transfer** | Calls `quoteTransfer` to calculate the cost of transfering 1 USDT and `transfer` to execute the transfer transaccion, with the paymaster covering the gas, and getting paid in the paymaster Token (USDT).| Demonstrates a real ERC-4337 flow: you sign a *UserOperation*, the paymaster sponsors fees, and a bundler posts the tx. |


```js
// ---------- 1. Load deps  ---------- //

import WalletManagerEvm from '@wdk/wallet-evm-erc-4337';


// ---------- 2. Declares seed phrase & Account Abstraction Configuration ---------- //

const seed = 'choose indicate barrel slush penalty hollow box exchange soldier gentle memory rare'

const polygonConfig = {
 "chainId": 137,
 "blockchain": "polygon",
 "provider": "https://polygon-rpc.com",
 "bundlerUrl": "https://api.candide.dev/public/v3/polygon",
 "paymasterUrl": "https://api.candide.dev/public/v3/polygon",
 "paymasterAddress": "0x8b1f6cb5d062aa2ce8d581942bbb960420d875ba",
 "entryPointAddress": "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
 "transferMaxFee": 5000000,
 "swapMaxFee": 5000000,
 "bridgeMaxFee": 5000000,
 "paymasterToken": {
     "address": "0xc2132d05d31c914a87c6611c10748aeb04b58e8f"
 },
 "safeModulesVersion": "0.3.0"
}

// ---------- 2. Wrap in Smart Wallet ----------

const polygonClient = new WalletManagerEvm(seedPhrase, polygonConfig)

const polygonAccount = polygonClient.getAccount(0) // index 0 

const polygonAddress = await polygonClient.getAddress('polygon', 0)
console.log('Smart-Account address:', polygonAddress);

// ---------- 3.  balances ----------

const polygonUSDTBalance = await polygonClient.getTokenBalance('0xc2132d05d31c914a87c6611c10748aeb04b58e8f') //USDT
const polygonPolBalance  = await polygonClient.getNativeBalance();

console.log('USDT balance :', polygonUSDTBalance);
console.log('Pol balance  :', polygonPolBalance);


// ---------- 4.  gas-sponsored transfer ----------
const quote = await polygonAccount.quoteTransfer({
 recipient: '0xd3D224Ca27C4b4350b8BCD52c9381E1a8CEEFcf0', //address where the USDT will be send
 amount: '1000000', // USDT has 6 decimals
 token: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f' // USDT, different on every blockchain
})


// Execute the transfer 
await polygonAccount.transfer({
 recipient: '0xd3D224Ca27C4b4350b8BCD52c9381E1a8CEEFcf0',//address where the USDT will be send
 amount: '1000000', // USDT has 6 decimals
 token: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f' // USDT, different on every blockchain
})


```

## What just happned? 

| Step                 | Behind the scenes                                                                  |
| -------------------- | ---------------------------------------------------------------------------------- |
| **WalletEvm**        | Pure EOA logic (signing, key derivation)                                           |
| **SmartAccount4337** | Deploys / connects to a contract-wallet that can run custom validation & fee logic |
| **Bundler**          | Bundles your `UserOperation` and sends it to `EntryPoint`                          |
| **Paymaster**        | Signs the op, paying gas in USDT so the user needs zero ETH                        |
| **Transfer**         | An on-chain call to USDT’s contract within the Smart Account context               |

## 3 · Next steps

This quick start guide has shown you how to perform a basic USDT transfer on Polygon using the EVM Account Abstraction WDK SDK. However, WDK is designed to support much more: you can interact with multiple blockchains, manage different tokens, and leverage advanced features such as account abstraction, DeFi actions, and cross-chain operations.

To explore the full capabilities of WDK and learn how to build your own custom wallet, check out the [Developer Guide](../7-developer-guide/README.md) section. There you’ll find detailed examples and tutorials covering wallet creation, balance checks, DeFi integrations, transaction history, and more.

- Explore [Supported Blockchains](../1-executive-summary/supported-blockchains.md)
- [Developer Guide](../7-developer-guide/README.md)

