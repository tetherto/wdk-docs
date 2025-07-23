
---
title: Paymaster Fundamentals & Integration
lastReviewed: 2024-01-15
---

# Paymaster Fundamentals & Integration

## Introduction

A **Paymaster** is a service or smart contract that sponsors transaction fees ("gas") on behalf of users, enabling gasless or subsidized blockchain interactions. Paymasters are a key enabler for seamless user experiences, onboarding, and advanced wallet features, especially in Account Abstraction (ERC-4337), TON, and TRON ecosystems.

## Paymaster Fundamentals

### What is a Paymaster?
- A paymaster is an entity (often a smart contract or backend service) that pays transaction fees for users, allowing them to interact with the blockchain without holding the native token for gas.
- This enables "meta-transactions" or "gasless transactions," where the user signs a transaction, but the paymaster submits and pays for it.

### Why Use a Paymaster?
- **Onboarding:** New users can interact with dApps without first acquiring native tokens.
- **UX:** Removes friction for non-crypto-native users.
- **Promotions:** dApps can sponsor user actions (e.g., first swap free).
- **Advanced Flows:** Enables relaying, batch transactions, and more.

### Security and Trust
- Paymasters must validate transactions to avoid abuse (e.g., spam, draining funds).
- Rate limiting, whitelisting, and business logic are often enforced.
- Users must trust the paymaster not to censor or front-run their transactions.

## WDK Paymaster Architecture

The WDK provides a modular approach to paymaster integration, supporting multiple chains and paymaster models:

- **Wallet → Paymaster → Blockchain**: The wallet prepares a transaction, the paymaster sponsors the fee, and the transaction is submitted to the network.
- **Configurable**: Paymaster logic can be customized per chain and use case.
- **Chain-Specific Support**: EVM/ERC-4337, TON, and TRON each have unique paymaster flows.

## Chain-Specific Implementations

### EVM/ERC-4337 Paymaster

#### Overview
- ERC-4337 introduces Account Abstraction, allowing smart contract wallets to use paymasters for gas sponsorship.
- The paymaster is a smart contract that validates and pays for user operations (UserOps).

#### How It Works
1. User creates a UserOperation (UserOp) and signs it.
2. The wallet or bundler submits the UserOp to the EntryPoint contract.
3. The EntryPoint calls the paymaster's `validatePaymasterUserOp` method.
4. If valid, the paymaster pays the gas; otherwise, the operation is rejected.

#### WDK Integration: `wdk-wallet-evm-erc-4337`
- Supports ERC-4337 paymaster flows out of the box.
- Allows configuration of paymaster address and logic.
- Example configuration:

```json
{
  "paymaster": {
    "address": "0xPaymasterContract...",
    "type": "sponsor", // or "whitelist", "quota", etc.
    "policy": {
      "maxGas": 100000,
      "allowedMethods": ["transfer", "swap"]
    }
  }
}
```

#### Example Flow
```typescript
const userOp = await wallet.createUserOperation({
  to: recipient,
  data: callData,
  paymaster: {
    address: '0xPaymasterContract...',
    params: { /* custom params */ }
  }
});
await wallet.sendUserOperation(userOp);
```

#### Best Practices
- Use a reputable paymaster contract.
- Monitor paymaster balance and refill as needed.
- Implement abuse prevention (e.g., quotas, whitelists).

---

### TON Gasless Paymaster

#### Overview
- TON supports gasless transactions via off-chain relayers or smart contracts that sponsor fees.
- The paymaster (relayer) receives a signed message from the user and submits it, paying the fee.

#### How It Works
1. User signs a transaction offline.
2. The wallet sends the signed message to the paymaster/relayer.
3. The paymaster submits the transaction to the TON network, paying the fee.
4. The user receives confirmation once the transaction is included in a block.

#### WDK Integration: `wdk-wallet-ton-gasless`
- Provides utilities for preparing and relaying gasless transactions.
- Example usage:

```typescript
const signedTx = await wallet.signTransaction({
  to: recipient,
  amount: '1',
  gasless: true
});
await tonPaymaster.relayTransaction(signedTx);
```

#### Example Configuration
```json
{
  "paymaster": {
    "endpoint": "https://ton-relayer.example.com",
    "maxFee": "0.05 TON",
    "whitelist": ["user1", "user2"]
  }
}
```

#### Best Practices
- Use authenticated endpoints to prevent abuse.
- Set reasonable fee limits and quotas.
- Monitor relayer health and transaction status.

---

### TRON Gasfree Paymaster

#### Overview
- TRON allows resource delegation (bandwidth/energy) to sponsor user transactions.
- A paymaster account can delegate resources or submit transactions on behalf of users.

#### How It Works
1. User prepares a transaction.
2. The paymaster (resource sponsor) signs and submits the transaction, covering resource costs.
3. The user receives the result without spending their own TRX.

#### WDK Integration: `wdk-wallet-tron-gasfree`
- Supports gasfree transactions via resource delegation or relayer services.
- Example usage:

```typescript
const tx = await wallet.createTransaction({
  to: recipient,
  amount: '10',
  gasfree: true
});
await tronPaymaster.sendTransaction(tx);
```

#### Example Configuration
```json
{
  "paymaster": {
    "account": "TXYZ...Paymaster",
    "maxBandwidth": 100000,
    "maxEnergy": 50000,
    "policy": {
      "allowedContracts": ["TXYZ...Contract"]
    }
  }
}
```

#### Best Practices
- Monitor resource usage and refill as needed.
- Implement rate limiting and contract whitelisting.
- Track sponsored transaction history for auditing.

---

## Integration Guide

### Using Paymaster Features in Your Wallet

1. **Enable Paymaster Support**: Configure your wallet to use the appropriate paymaster settings for the target chain.
2. **Prepare Transactions**: Use the wallet SDK to prepare transactions with `gasless: true` or paymaster parameters.
3. **Relay or Submit**: For off-chain relayers, send the signed transaction to the paymaster endpoint. For on-chain paymasters, include the paymaster address in the transaction data.
4. **Handle Responses**: Monitor transaction status and handle errors (e.g., paymaster out of funds, rejected by policy).

### Example (Unified Pseudocode)
```typescript
const tx = await wallet.prepareTransaction({
  to: recipient,
  amount: '5',
  gasless: true,
  paymaster: { /* chain-specific config */ }
});
await wallet.sendTransaction(tx);
```

### Best Practices
- Always validate paymaster terms and policies.
- Inform users when transactions are sponsored.
- Provide fallback if paymaster is unavailable.
- Monitor for abuse and implement anti-spam measures.

---

## Security and Compliance

- **Abuse Prevention**: Implement quotas, whitelists, and rate limiting to prevent spam and abuse.
- **Transparency**: Clearly communicate to users when a third party is sponsoring their transaction.
- **Auditing**: Track sponsored transactions for compliance and reporting.
- **Compliance**: Ensure paymaster operations comply with local regulations (e.g., KYC/AML if required).
- **Fallbacks**: Always provide a way for users to pay their own fees if sponsorship is unavailable.

---

## References and Further Reading
- [EIP-4337: Account Abstraction via EntryPoint Contract](https://eips.ethereum.org/EIPS/eip-4337)
- [TON Documentation](https://ton.org/docs/)
- [TRON Developer Hub](https://developers.tron.network/)
- [Meta-transactions Explained](https://blog.openzeppelin.com/gasless-meta-transactions-2775125e2e8e)
- [WDK Documentation](../README.md)
- [WDK Indexer](indexer.md)
