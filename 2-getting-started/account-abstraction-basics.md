---
title: Account Abstraction Basics
description: Understand EOAs, Smart Accounts, and how ERC-4337 brings full account abstraction (gas-sponsored transactions, paymasters, social recovery, and more) to every EVM chain.
author: Raquel Carrasco Gonzalez
lastReviewed: 2025-06-25
icon: book-open
---

> 🚧 Work in progress


# Account Abstraction 101

Most users today control an **Externally Owned Account (EOA)**—a simple public-/private-key pair.  
**Account Abstraction (AA)** replaces that fragile model with **Smart Accounts**: programmable wallets implemented as on-chain smart contracts.  

---

## 1 · Externally Owned Accounts (EOAs)

| Property | EOA |
|----------|-----|
| **Who controls it?** | A single private key. |
| **Lives on-chain?** | No—only its *balance* and *nonce* are stored; the logic is off-chain. |
| **Can validate logic?** | No — only `secp256k1` signature checks are allowed. |
| **Gas payment** | Must be paid from the same EOA balance and in the chain’s native coin. |
| **Upgradeability / recovery** | Impossible without rotating keys or migrating funds. |

EOAs are simple but brittle: lose the key, lose the funds. They also limit UX—every user must hold native gas and sign each transaction.  :contentReference[oaicite:0]{index=0}

---

## 2 · Smart Accounts (a.k.a. Smart-Contract Accounts)

A **Smart Account** is an on-chain smart contract that *owns* your funds and *enforces* custom rules (multi-sig, biometrics, daily spend limits, etc.). Because a smart account is just code, it can:

* Accept **any** verification logic (WebAuthn, biometrics, socials).  
* Let someone else pay gas (via *paymasters*).  
* Support built-in recovery or upgrade paths.

Put simply, a Smart Account *is* a smart contract; the contract’s code is the wallet.  :contentReference[oaicite:1]{index=1}

---

### EOA vs Smart Account at a glance

| Feature | EOA | Smart Account |
|---------|-----|---------------|
| Ownership | Single private key | Contract code (can reference many keys or none) |
| Execution logic | Hard-coded into the protocol | Programmable in Solidity/Vyper |
| Fee options | Native coin only | Native coin, ERC-20, or third-party sponsor |
| Recovery | Manual key management | Social recovery, guardians, time-locks |
| Upgrades | Impossible | Versioned contract modules |

:contentReference[oaicite:2]{index=2}

---

## 3 · How Account Abstraction Works (ERC-4337)

ERC-4337 introduces a new object, **UserOperation**, and a shared **EntryPoint** contract.  
1. Apps craft a `UserOperation` describing *what* to do.  
2. A **Bundler** (relayer) wraps many `UserOperation`s into one on-chain tx.  
3. The Smart Account’s `validateUserOp()` decides if the action is allowed and **who** pays the gas (it can invoke a **Paymaster**).  

No consensus-layer changes are required—ERC-4337 lives entirely in contracts and mempool-like infrastructure.  :contentReference[oaicite:3]{index=3}

---

## 4 · Why You Care

* **User experience:** seed-less sign-in, gasless onboarding, single-click batch actions.  
* **Security:** built-in 2FA, spending caps, upgradeable bug fixes.  
* **Flexibility:** pay fees in stablecoins, delegate gas to a dApp, schedule transactions.  

WDK abstracts all of this complexity, letting you create, sign, and send `UserOperation`s with a few lines of code.

---

## 5 · Next Steps

1. **Configure Account Abstraction in WDK** → [Account Abstraction Configuration](../7-developer-guide/account-abstraction.md)  
2. **See gas sponsorship in action** → *Paymaster & Bundler Guide* (coming soon)  
3. **Build your first Smart Account wallet** → [Quick Start](./quick-start.md)
