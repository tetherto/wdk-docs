---
title: Estimate Fee & Execute Transactions (EVM)
description: Quote gas costs and execute ERC‑20 transaction on classic EOAs and ERC‑4337 smart‑accounts with the Wallet Development Kit.
author: Raquel Carrasco Gonzalez
icon: arrow-right
lastReviewed: 2025‑06‑25
---

# Estimate → Transfer – **EVM Edition**

> From WDK **v2.0** onward, **all** wallet accounts (classic or AA) expose the same two helpers for token moves:
>
> * `quoteTransfer(options)` – dry‑run; returns `{ fee, … }`
> * `transfer(options)`      – sends the transaction; returns `{ hash, fee }`

The only difference is **who pays the gas**:

| Wallet type                                         | Fee token                                                            |
| --------------------------------------------------- | -------------------------------------------------------------------- |
| Classic EOA (`@wdk/wallet-evm`)                     | Native coin (ETH, MATIC, ARB…)                                       |
| ERC‑4337 smart‑account (`@wdk/wallet-evm-erc-4337`) | Paymaster token (e.g. USDT, XAUT) or native coin if no paymaster set |

---

## 1 · Setup (recap)

> **Reference:**  
> For detailed instructions on creating wallet/account instances, see [Wallet & Account](./create-wallet.md).  
> For information on checking balances and funding your accounts, see [Get Balance & Deposit](./get-balance.md).

```js
import WalletManagerEvm from "@wdk/wallet-evm";               // Classic
import WalletManagerEvm from "@wdk/wallet-evm-erc-4337";      // Smart‑account


// Classic Ethereum (main‑net)
const ethClient = new WalletManagerEvm(seed, {
  provider: "https://rpc.mevblocker.io/fast"
});

// Polygon smart‑account (Candide paymaster)
const polygonClient = new WalletManagerEvmAA(seed, {
  chainId: 137,
  blockchain: "polygon",
  provider: "https://polygon-rpc.com",
  bundlerUrl: "https://api.candide.dev/public/v3/polygon",
  paymasterUrl: "https://api.candide.dev/public/v3/polygon",
  paymasterAddress: "0x8b1f6cb5d062aa2ce8d581942bbb960420d875ba",
  entryPointAddress: "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
  paymasterToken: { address: "0xdAC17F958D2ee523a2206206994597C13D831ec7" },
  transferMaxFee: 5_000_000
});
```
---

## 2 · Quote the transfer cost

Quoting a transaction before broadcasting it is important because it allows you to **estimate the gas fees** and **total cost of the transaction** in advance. This helps you ensure that your account has sufficient funds to cover both the **transfer amount and the associated fees**, and lets you review the cost before committing to the transaction. 

By quoting first, you can avoid failed transactions due to insufficient balance or unexpected high fees, and provide a better user experience by displaying the estimated cost to the user.

After a successful quote you can broadcast the transaction, optionally re‑using the same `options` object.

### 2.1 Parameters common to any chain

```js
interface TransferOptions {
  recipient: string;  // checksummed EVM address
  token: string;      // ERC‑20 contract address
  amount: bigint;     // base units (e.g. 1 USDT → 1_000_000n)
}
```

### 2.2 Classic EOA – user pays for his gas cost in native token (ETH, POL)

The process for quoting a transfer is the same for every EVM-compatible chain. Ensure you are using the correct account instance and provide the appropriate recipient and token contract addresses for the network you are working with.

```js
import WalletManagerEvm from "@wdk/wallet-evm";               // Classic

const ethAccount = await ethClient.getAccount(0); // 

const quote = await ethAccount.quoteTransfer({
  recipient: "0x63FaC9201494f0bd17B9892B9fae4d52fe3BD377", // Replace with the actual recipient address
  token:     "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT, replace with the desired ERC‑20 contract address to transfer
  amount:    1_000_000n                                   // 1 USDT (6 dec) or desired amount to transfer
});

console.log("Estimated gas (wei):", quote.fee.toString());
```

> **Note:** Update the addresses and account for the specific EVM chain you are using (Ethereum, Polygon, Arbitrum, etc.).

### 2.3 Smart‑account – gas in USDT via paymaster

This example uses the smart-account instance (`account`) created and configured for polygon chain in [create-wallet.md](./create-wallet.md). You can set up similar smart-account configurations for other EVM chains (like Ethereum, Arbitrum, etc.) as shown in that section. 

The paymaster and the token used to pay gas fees (e.g., USDT) were already set up when you initialized the account, so you don’t need to specify them again here—just provide the recipient, token address, and amount.

```js
import WalletManagerEvm from "@wdk/wallet-evm-erc-4337";      // Smart‑account

const account = await polygonClient.getAccount(0);

const quote = await account.quoteTransfer({
  recipient: "0xd3D224Ca27C4b4350b8BCD52c9381E1a8CEEFcf0", // Replace with the actual recipient address
  token:     "0xc2132d05d31c914a87c6611c10748aeb04b58e8f", // USDT‑Polygon
  amount:    1_000_000n                                    // 1 USDT (6 dec) or desired amount to transfer
});

console.log("Gas fee (USDT base):", quote.fee.toString());
```

> The smart‑account automatically negotiates with the paymaster; no extra parameters are needed unless you want to override `transferMaxFee` at call‑time.

---

## 3 · Execute the transfer

After a successful quote, you can broadcast the transaction to the blockchain. The process is similar for both classic EOAs and smart-accounts, but the way fees are paid may differ.

### 3.1 Classic Ethereum

In this example, you send a token transfer from a classic Externally Owned Account (EOA) on Ethereum. The transaction fee (gas) will be paid in the native token (ETH).

```js
const result = await ethAccount.transfer({
  recipient: "0x63FaC9201494f0bd17B9892B9fae4d52fe3BD377",
  token:     "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  amount:    1_000_000n
});

console.log("Hash:", result.hash);
console.log("Fee paid (wei):", result.fee.toString());
```
- **Step 1:** Call `transfer()` with the recipient, token address, and amount.
- **Step 2:** The transaction is signed and broadcast to the Ethereum network.
- **Step 3:** The result includes the transaction hash and the fee paid in wei.

### 3.2 Polygon smart‑account

Here, you send a token transfer from a smart-account (account abstraction) on Polygon. The transaction fee is paid in USDT via a paymaster, rather than in the native token (POL).

```js
const tx = await polyAccount.transfer({
  recipient: "0xd3D224Ca27C4b4350b8BCD52c9381E1a8CEEFcf0",
  token:     "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
  amount:    1_000_000n
});

console.log("Hash:", tx.hash);
console.log("Fee paid (USDT base):", tx.fee.toString());
```
- **Step 1:** Call `transfer()` with the recipient, token address, and amount.
- **Step 2:** The smart-account interacts with the paymaster to sponsor the gas fee in USDT.
- **Step 3:** The result includes the transaction hash and the fee paid in USDT base units.

---

## 4 · Native‑coin transfers (optional)

### 4.1 Classic EOA 

Use `quoteSendTransaction` / `sendTransaction` if you want to send ETH / POL itself:

```ts
await ethAccount.quoteSendTransaction({
  to:    "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
  value: 100_000_000_000_000_000n // 0.1 ETH
});
```

### 4.2 ERC-4337 Smart Account: Native-coin transfer

Here’s how to use `quoteSendTransaction` and `sendTransaction` with a smart account, including the optional override for `paymasterToken`:

```js
// Quote the cost of sending native coin (e.g., ETH) from a smart account
const quote = await smartAccount.quoteSendTransaction({
  to:    "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
  value: 100_000_000_000_000_000n // 0.1 ETH
}, {
  paymasterToken: { address: "0xdAC17F958D2ee523a2206206994597C13D831ec7" } // Optional: override paymaster token
});

console.log("Estimated gas (USDT base):", quote.fee.toString());

// Send the native coin transfer, optionally overriding paymasterToken
const result = await smartAccount.sendTransaction({
  to:    "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
  value: 100_000_000_000_000_000n // 0.1 ETH
}, {
  paymasterToken: { address: "0xdAC17F958D2ee523a2206206994597C13D831ec7" } // Optional
});

console.log("Hash:", result.hash);
console.log("Fee paid (USDT base):", result.fee.toString());
```

---

## 5 · Overriding paymasterToken and transferMaxFee

You can override the `paymasterToken` and `transferMaxFee` at call time for both `transfer` and `quoteTransfer`:

> **Note**:
> When changing the `paymasterToken` ensure it's supported by paymaster or service provider, if not, you must also update the `paymasterAddress` and `bundlerUrl` in your configuration to match the new provider. Failing to do so may result in failed transactions or unsupported token errors.


```js
// Override paymasterToken and transferMaxFee for a token transfer
const quote = await smartAccount.quoteTransfer({
  recipient: "0xRecipientAddress",
  token:     "0xTokenAddress",
  amount:    1_000_000n
}, {
  paymasterToken: { address: "0xAnotherTokenAddress" },
  transferMaxFee: 10_000_000
});

console.log("Estimated gas (in new token):", quote.fee.toString());

const tx = await smartAccount.transfer({
  recipient: "0xRecipientAddress",
  token:     "0xTokenAddress",
  amount:    1_000_000n
}, {
  paymasterToken: { address: "0xAnotherTokenAddress" },
  transferMaxFee: 10_000_000
});

console.log("Hash:", tx.hash);
console.log("Fee paid (in new token):", tx.fee.toString());
```

---

### 6 · Summary Table of Methods

| Method                       | Description                                      | Optional Config at Call Time                |
|------------------------------|--------------------------------------------------|---------------------------------------------|
| `quoteTransfer(options, config?)`      | Quote ERC-20 transfer cost                    | `paymasterToken`, `transferMaxFee`          |
| `transfer(options, config?)`           | Execute ERC-20 transfer                       | `paymasterToken`, `transferMaxFee`          |
| `quoteSendTransaction(tx, config?)`    | Quote native coin transfer cost               | `paymasterToken`                            |
| `sendTransaction(tx, config?)`         | Execute native coin transfer                  | `paymasterToken`                            |

---

## 7 · Common errors & solutions

| Error message                             | Meaning                                | Resolution                                                     |
| ----------------------------------------- | -------------------------------------- | -------------------------------------------------------------- |
| `transferMaxFee exceeded`                 | Network gas spiked above your limit    | Increase `transferMaxFee` in the wallet config or retry later. |
| `ERC‑20: transfer amount exceeds balance` | Insufficient token balance             | Top‑up the sending account.                                    |
| `Paymaster balance too low`               | Smart‑account lacks USDT/XAUT for fees | Deposit tokens to the smart‑account address.                   |

---

© 2025 Wallet Development Kit contributors