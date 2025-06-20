---
title: Quick Start Guide
description: Transaction tutorial using Wallet Development Kit (WDK)
author: Raquel Carrasco Gonzalez
lastReviewed: 2025-06-16
icon: rocket
---

# Quick Start Guide

This guide will walk you through performing your first transaction in Arbitrum Mainnet using the Wallet Development Kit (WDK) in just 15 minutes.

## Prerequisites

- Node.js installed
- Basic understanding of blockchain concepts
- Some USDT on Arbitrum Mainnet for testing

## Step 1: Installation

Begin by cloning the official WDK Core repository and installing the required dependencies. This will set up your local development environment with all the necessary packages.

```bash
git clone https://github.com/tetherto/wdk-core.git
cd wdk-core
npm install 
```

## Step 2: Import or Create a New Seed Phrase

Next, create a new file named `test.js` inside the `wdk-core` directory. This file will be used to experiment with and test the WDK SDK functionality. 

You may also want to add a `.env` file in this directory to manage configuration variables such as your seed phrase and API keys, as demonstrated in the [Prerequisites](2-getting-started/prerequisites.md) section.

> **Note**: If you plan to push your code to a repository, remember to add .env to your .gitignore file. This will help ensure that sensitive information like your seed phrase or API keys remains private and is not accidentally committed.

After creating the file, make sure you are in the `wdk-core` directory to proceed with the following code examples.

### Verify Seed Phrase

In this step, you will either import an existing seed phrase or generate a new one using the WDK SDK. The seed phrase will be used to identify your wallet and sign transactions on the blockchain. While WDK supports multiple blockchains (Ethereum, EVM Layer 2s, Bitcoin, and TON), this example will focus on creating and using an Arbitrum account.

> **Note**: A seed phrase (also known as a recovery phrase or mnemonic) is a sequence of words that encodes the private key to your blockchain wallet. It acts as the master key to access and control your funds across supported blockchains. Anyone with access to your seed phrase can fully control your wallet, so it must be kept secure and never shared.


First, in your `test.js` file, import a seed phrase as shown below and check if it's valid.

```javascript
import WdkManager from '@wdk/wdk-core';

// Check if seed phrase is valid
const isValid = WdkManager.isValidSeedPhrase(process.env.SEED_PHRASE);
console.log("Seed phrase is valid:", isValid);
```

Or, if you don’t have an existing seed phrase, you can generate a new one as shown below.

If you have already imported a seed phrase, you do not need to create a new one.

```javascript
import WdkManager from '@wdk/wdk-core';

// Or, generate a new seed phrase
const seedPhrase = WdkManager.getRandomSeedPhrase();
console.log("Your seed phrase:", seedPhrase);

// Verify the seed phrase
const isValid = WdkManager.isValidSeedPhrase(seedPhrase);
console.log("Seed phrase is valid:", isValid);
```

### Create Wallet Manager

Now you can create a wallet instance using your seed phrase. The `WalletManagerEvm` class generates a wallet manager tied to your seed phrase and allows you to derive blockchain accounts and addresses from it. This enables you to interact with the blockchain securely and programmatically.

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
> **Note**:
> In blockchain systems, a private key is a secret value that proves ownership and allows you to sign transactions. The public key is mathematically derived from the private key and is used to generate your account address—the identifier you share to receive funds.
> - **Private key**: Keep this secret; it controls your assets.
> - **Public key**: Used to verify signatures, not secret.
> - **Account/address**: The public-facing identifier (e.g., 0x... for Ethereum) that others use to send you assets.
>
> Your seed phrase is the master key that can generate all private keys, public keys, and addresses for your wallet. 
>
> Never share your seed phrase or private keys with anyone. Only your address should be shared to receive assets.


## Step 3: Initialize WDK Manager

In this step, you will initialize the **WDK Account Abstraction Manager** for Arbitrum. This manager enables advanced features such as account abstraction, gas sponsorship, and seamless transaction handling. By providing the necessary configuration parameters — including your account, network details, and paymaster information — you prepare the SDK to interact with the blockchain according to your specific requirements.

The following code demonstrates how to set up the **Account Abstraction Manager** for Arbitrum using your previously created account and environment variables:

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
> **Note**:
>
> **Account Abstraction** is a concept in Ethereum and EVM-compatible blockchains that allows for more flexible and programmable accounts. Instead of being limited to standard externally owned accounts (EOAs), account abstraction enables custom logic for transaction validation, gas payment, and signature schemes. This makes features like social recovery, multi-signature wallets, and gasless transactions possible.
>
> A **Paymaster** is a smart contract or service that can sponsor transaction fees (gas) on behalf of users. This allows users to interact with the blockchain without needing to hold the native token (e.g., ETH for Arbitrum) for gas, enabling use cases like gasless transactions or paying fees in alternative tokens.
>
> A **Bundler** is a service that collects user operations (transactions) and submits them to the blockchain in batches. This improves efficiency and can reduce costs, especially in account abstraction systems where multiple user operations are handled together.
>
>
> Other terms in this config:
> - **Entry Point**: The smart contract that acts as the main gateway for account abstraction operations.
> - **Chain ID**: The unique identifier for the blockchain network (e.g., 42161 for Arbitrum).
> - **Paymaster Token**: The token used to pay for transaction fees when using a paymaster (e.g., USDT).

## Step 4: Check Balances

In this step, you will check the balances of your wallet for both the native gas token (ETH, in the case of Arbitrum) and a specific ERC-20 token (USDT). If you have just generated a new seed phrase, your wallet will be empty and the balances will be zero. To proceed with transactions, you’ll need to send some USDT to your new wallet address—the same address that was logged from the `account` variable in the previous step.

To get the balance of a specific token, you provide its contract address (for example, the USDT token address on Arbitrum). To check your balance of the network’s native token (ETH), you simply call the relevant method without specifying a token address.

```javascript
// Check native token balance (ETH)
const nativeBalance = await arbitrum.getAbstractedAddressBalance();
console.log("ETH Balance:", nativeBalance);

// Check USDT balance
const usdtAddress = "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9";

const usdtBalance = await arbitrum.getAbstractedAddressTokenBalance(usdtAddress);
console.log("USDT Balance:", usdtBalance);
```

> **Note**:
> On blockchains like Ethereum and Arbitrum, tokens such as USDT are implemented as smart contracts —programs deployed on the blockchain that manage balances and transfers. Each token contract has its own unique address, just like user accounts. When you interact with a token (e.g., to check your balance or send tokens), you are actually interacting with its smart contract at that address. This is why you need to provide the token’s contract address to check its balance or perform transfers.

## Step 5: Get USDT Transfer Quote

In this step, you will estimate the cost of transferring USDT from your wallet to another address. Before actually sending tokens, it’s important to know how much the transaction will cost in terms of gas fees. The WDK SDK provides a method to quote the expected gas cost for a transfer operation, allowing you to plan and ensure you have sufficient funds to cover the transaction.

You’ll need to specify the recipient address, the amount to send, and the token’s contract address. The quote will return the estimated gas cost, which you can display in both raw units and as an equivalent value in USDT.

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
> **Note**:
>
> **Gas cost** is the fee you pay to process transactions and execute smart contracts on a blockchain. Gas fees compensate network validators (or miners) for the computational resources required to verify and include your transaction in a block.
> - On networks like Ethereum and Arbitrum, every operation that **changes the blockchain’s state** — such as sending tokens, deploying a contract, or interacting with DeFi protocols — requires gas.
> - **Read-only actions** (like checking your balance or viewing data) do not require gas, because they don’t alter the blockchain’s state. For example, when you checked your balance in the previous step, no fee was charged.
> - Gas costs fluctuate based on network demand and transaction complexity.
> - Paying the correct gas fee ensures your transaction is processed in a timely manner. If you don’t provide enough gas, your transaction may fail or be delayed.
>
> Understanding gas costs is essential for managing your funds efficiently and avoiding failed or stuck transactions.

## Step 6: Execute Transfer

In this step, you will perform an actual USDT transfer from your wallet to another address on the Arbitrum network.

This operation sends tokens on-chain and changes the blockchain’s state. You’ll specify the recipient address, the amount to send, and the token’s contract address. The SDK will handle the transaction, and you’ll receive a transaction hash as confirmation.

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

> **Note**:
> - **Sufficient USDT balance**: To successfully complete the transfer, your wallet must have enough USDT to cover both the amount you want to send and the transaction fee (gas cost) if you are using a paymaster to pay fees in USDT. This means your required balance will be slightly higher than the transfer amount.
> - **Typical transfer cost**: On the Arbitrum network, the transaction fee for a simple token transfer is usually very low—often less than $0.10 USD (but this can vary with network conditions). Always check the quoted gas cost before confirming.
> - **On-chain transactions**: Sending tokens is a state-changing operation, meaning it updates the blockchain’s ledger. This is why you pay a gas fee for the transfer.
> - **Transaction hash**: After submitting a transaction, you receive a unique hash (ID) that you can use to track its status on a block explorer.
> - **Token contracts**: The transfer interacts with the USDT smart contract at its specific address, ensuring the correct token is sent.
> - **Paymaster**: If configured, the paymaster can sponsor the gas fees, allowing you to pay transaction costs in USDT instead of the native token (ETH).
> - **Security**: Always double-check the recipient address and the amount before confirming a transfer. Blockchain transactions are irreversible.



## Next Steps

This quick start guide has shown you how to perform a basic USDT transfer on Arbitrum using the WDK SDK. However, WDK is designed to support much more: you can interact with multiple blockchains, manage different tokens, and leverage advanced features such as account abstraction, DeFi actions, and cross-chain operations.

To explore the full capabilities of WDK and learn how to build your own custom wallet, check out the [Developer Guide](../7-examples/README.md) section. There you’ll find detailed examples and tutorials covering wallet creation, balance checks, DeFi integrations, transaction history, and more.

- Explore [Supported Blockchains](2-getting-started/supported-blockchains.md)
- [Developer Guide](../7-examples/README.md)

