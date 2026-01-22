---
title: Send Transactions
description: Learn how to send native tokens on different blockchains.
layout:
  width: default
  title:
    visible: true
  description:
    visible: true
  tableOfContents:
    visible: true
  outline:
    visible: true
  pagination:
    visible: false
  metadata:
    visible: false
---

# Send Transactions


You can send native tokens (like ETH, TON, or BTC) from any of your wallet accounts to another address.

{% hint style="info" %}
**Get Testnet Funds:** To test these transactions without spending real money, verify you are on a testnet and use a faucet:
*   **Ethereum (Sepolia):** [Google Cloud Faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia)
*   **TON Testnet:** [Testgiver Bot](https://t.me/testgiver_ton_bot)
{% endhint %}

{% hint style="warning" %}
**BigInt Usage:** Always use `BigInt` (the `n` suffix) for monetary values to avoid precision loss with large numbers.
{% endhint %}

## Send Native Tokens

The `sendTransaction` method allows you to transfer value. It accepts a unified configuration object, though specific parameters (like `value` formatting) may vary slightly depending on the blockchain.

### Ethereum Example

{% hint style="tip" %}
On EVM chains, values are typically expressed in Wei (1 ETH = 10^18 Wei).
{% endhint %}

The following example will:

1. Retrieve the first Ethereum account (see [Manage Accounts](./account-management.md))
2. Send 0.001 ETH (1000000000000000 wei) to an account using `sendTransaction`.

{% code title="Send ETH" lineNumbers="true" %}
```typescript
const ethAccount = await wdk.getAccount('ethereum', 0)

const result = await ethAccount.sendTransaction({
  to: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  value: 1000000000000000n // 0.001 ETH (in Wei)
})

console.log('Transaction sent! Hash:', result.hash)
```
{% endcode %}

### TON Example

{% hint style="tip" %}
On TON, values are expressed in Nanotons (1 TON = 10^9 Nanotons).
{% endhint %}

The following example will:

1. Retrieve the first TON account
2. Send 1 TON (1000000000 nton) to an account using `sendTransaction`.

{% code title="Send TON" lineNumbers="true" %}
```typescript
// Send TON transaction
const tonAccount = await wdk.getAccount('ton', 0)
const tonResult = await tonAccount.sendTransaction({
  to: 'UQCz5ON7jjK32HnqPushubsHxgsXgeSZDZPvh8P__oqol90r',
  value: 1000000000n // 1 TON (in nanotons)
})
console.log('TON transaction:', tonResult.hash)
```
{% endcode %}

## Handling Responses

The `sendTransaction` method returns a transaction result object. The most important field is typically `hash`, which represents the transaction ID on the blockchain. You can use this hash to track the status of your payment on a block explorer.

## Multi-Chain Transactions

You can orchestrate payments across different chains in a single function by acting on multiple account objects sequentially.

The following example will:
1. Retrieve an ETH and ton account using the `getAccount()` method.  
2. Send ETH and `await` the transaction.
3. Send TON and `await` the transaction.

{% code title="Multi-Chain Payment" lineNumbers="true" %}
```typescript
async function sendCrossChainPayments(wdk) {
  const ethAccount = await wdk.getAccount('ethereum', 0)
  const tonAccount = await wdk.getAccount('ton', 0)

  // 1. Send ETH
  await ethAccount.sendTransaction({
    to: '0x...',
    value: 1000000000000000000n
  })

  // 2. Send TON
  await tonAccount.sendTransaction({
    to: 'EQ...',
    value: 1000000000n
  })
}
```
{% endcode %}

## Next Steps

For more complex interactions like swapping tokens or bridging assets, learn how to [integrate protocols](./protocol-integration.md).
