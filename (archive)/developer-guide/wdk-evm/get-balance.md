---
title: Get Balance & Deposit (EVM)
description: Read native‑coin and ERC‑20 balances – and learn how to fund both classic EOAs and ERC‑4337 smart‑accounts – on any EVM chain with WDK.
author: Raquel Carrasco Gonzalez
icon: coins
lastReviewed: 2025‑06‑25
---

# Balances & Deposits – **EVM Edition (unified API)**

Since WDK **v2.0** every wallet module – classic *and* account‑abstraction – implements **exactly the same interface**:

```js
export interface IWalletAccount {
  getBalance(): Promise<bigint>;                    // Native coin – wei
  getTokenBalance(token: string): Promise<bigint>;  // ERC‑20 base unit
  /* …same signing & transfer helpers … */
}
```

That means you call **the same two methods** whether you use:

| Package                | Gas model                                  | Import path                |
| ---------------------- | ------------------------------------------ | -------------------------- |
| Classic EOA            | User pays in native coin                   | `@wdk/wallet-evm`          |
| ERC‑4337 smart‑account | Gas can be paid in USDT/XAUT via paymaster | `@wdk/wallet-evm-erc-4337` |

---

## 1 · Fetching balances (native & token)



### 1.1 Native‑coin balance

#### What is “wei”?

On Ethereum and other EVM-compatible blockchains, the native token (like ETH or POL) is denominated in very small units called wei.
 - 1 ETH = 1,000,000,000,000,000,000 wei (10¹⁸ wei)
 - This high precision helps avoid rounding errors and makes smart contract calculations more reliable.
 - When displaying balances to users, you’ll typically convert from wei to ETH (or the relevant token) for readability.

> **Note:**  
> In the following examples, we use the `account` instance created in the previous section ([create-wallet](./create-wallet.md)). This `account` object represents your wallet on the selected blockchain.  
> You can retrieve the balance of this account using the `getBalance()` method, which returns the amount of the native token (e.g., ETH for Ethereum, POL for Polygon) held by the account.

#### Ethereum
```js
// Retrieve the native token balance for the account, 
const ethWei  = await account.getBalance();       // ETH → wei (Ethereum Mainnet gas token)
```
#### Arbitrum
```js
// Retrieve the native token balance for the account, 
const ethWei  = await account.getBalance();       // ETH → wei (Arbitrum One gas token)
```
#### Polygon
```js
// Retrieve the native token balance for the account
const polyWei = await account.getBalance();       // POL → wei (Polygon Mainnet gas token)
```

### 2.3 ERC‑20 balance (USDT)

When retrieving the balance of a specific token (such as USDT), make sure to use the `account` instance that is configured for the correct blockchain. You must also provide the correct token contract address for that chain, since the same token (e.g., USDT) will have a different contract address on each network.

> **Note:**  
> On EVM-compatible blockchains, tokens like USDT are implemented as **smart contracts**. Each token is a program deployed at a unique address on the blockchain, which manages balances and transfers for that token.  
> Because each blockchain is a separate network, the same token (e.g., USDT) must be deployed separately on each chain, resulting in a different contract address for each network.  
> Always use the correct token address for the chain you are working with to ensure you are interacting with the intended asset.

#### Ethereum
```js
const USDT_ETH  = "0xdAC17F958D2ee523a2206206994597C13D831ec7"; // USDT Address in Ethereum Mainnet chain

const ethUsdt  = await account.getTokenBalance(USDT_ETH); 
```

#### Arbitrum
```js
const USDT_ARB  = "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9"; // USDT Address in Arbitrum One chain

const arbUsdt  = await account.getTokenBalance(USDT_ARB);
```

#### Polygon
```js
const USDT_POLY = "0xc2132d05d31c914a87c6611c10748aeb04b58e8f"; // USDT Address in Polygon Mainnet chain

const polyUsdt = await account.getTokenBalance(USDT_POL);
```

---

## 2 · Depositing funds

### 2.1 Where to send the assets

You can send funds to these addresses from an exchange, a bridge, or another wallet.

> **Note:**  
> To deposit funds into your wallet, simply use the address you obtained in the [create-wallet](./create-wallet.md) section. This address represents your account on the specific blockchain (Ethereum, Arbitrum, Polygon, etc.) and can be used to receive native tokens (like ETH, POL) or any ERC‑20 token.

#### **Be careful:**  
- **Each blockchain is a separate network.** Only send assets to the address on the correct chain (e.g., send ETH to your Ethereum address, MATIC to your Polygon address). Sending tokens to the wrong network can result in permanent loss of funds.
- **Externally Owned Accounts (EOA)** use the same address format across EVM chains, but **Account Abstraction (AA) smart accounts** may have different addresses on each network. Always double-check you are using the correct address for the intended chain and account type.


### 2.2 Funding a paymaster‑powered account

The type of account you use determines what assets you need to fund:

| Account Type                | What you need to fund         | Why                                      |
|-----------------------------|------------------------------|-------------------------------------------|
| Externally Owned Account (EOA) | Native coin (ETH, POL, etc.) **and** any tokens you want to use | Native coin is required to pay gas fees for all transactions; tokens are needed for transfers or DeFi actions. |
| Paymaster-powered (AA) account | Paymaster token (e.g., USDT, XAUT) | The paymaster covers gas fees, so you only need to hold the paymaster token in your smart account. No native coin is required for most actions. |

For EOAs, always ensure you have a small amount of the native coin to cover gas, plus any tokens you want to use.

For paymaster-powered (account abstraction) wallets, you typically only need to fund the account with the paymaster token (like USDT), since the paymaster will sponsor your gas fees.

---

## 3 · Multi‑chain balance snapshot (one liner)

You can easily retrieve and display your token balances across multiple blockchains in a single call. To do this, you must first set up an account instance for each blockchain you want to query (e.g., Ethereum, Polygon, Arbitrum). Each account should be configured for its respective network and token contract address.

By querying each account’s balance for the same token (e.g., USDT) on different networks, you get a quick overview of your holdings across chains.

```js
const balances = await Promise.all([
  ethAccount.getTokenBalance(USDT_ETH),
  polygonAccount.getTokenBalance(USDT_POL),
  arbitrumClient.getAccount(0).then(a => a.getTokenBalance("0xFd086bC7…"))
]);

console.table([
  { chain: "Ethereum", balance: balances[0].toString() },
  { chain: "Polygon",  balance: balances[1].toString() },
  { chain: "Arbitrum", balance: balances[2].toString() }
]);
```

This approach helps you monitor your assets and manage funds efficiently across all supported networks.

> **Note**  
> For `arbitrumClient`, we first call `getAccount(0)` to obtain the account instance, and then call `getTokenBalance` on that account. This is necessary if `arbitrumClient` is a wallet manager instance (not a direct account), whereas `ethAccount` and `polygonAccount` are already account objects.  
>  
> In summary:  
> - If you have an account object (like `ethAccount` or `polygonAccount`), you can call `getTokenBalance` directly.
> - If you have a wallet manager (like `arbitrumClient`), you must first get the account (with `getAccount(index)`) and then call `getTokenBalance` on that account.

---

## 5 · Troubleshooting tips

| Symptom                                  | Likely cause                                  | Fix                                                                                    |
| ---------------------------------------- | --------------------------------------------- | -------------------------------------------------------------------------------------- |
| `0` balance after deposit                | Wrong network                                 | Confirm chain & token address match the destination wallet.                            |
| `Error: insufficient funds` on AA wallet | Smart‑account not yet deployed                | Send a tiny amount of native coin or perform the first transfer to trigger deployment. |
| `gas price too high`                     | `transferMaxFee` / `swapMaxFee` threshold hit | Raise the limit in the wallet config or retry with lower network congestion.           |

---

© 2025 Wallet Development Kit contributors