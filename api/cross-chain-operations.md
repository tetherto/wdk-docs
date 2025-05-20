# API: Cross-Chain Operations

Bridge tokens and assets between blockchains with WDK.

---

## Bridge Tokens (EVM Chains)
```javascript
const quote = await wdk.quoteBridge("ethereum", 0, {
  recipient: "0x...",
  amount: 1_000_000,
  token: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  targetChain: "arbitrum"
});
await wdk.executeBridge("ethereum", 0, quote);
```

## Bitcoin to Spark Bridge
```javascript
const sparkDeposit = await sparkAccount.getSingleUseDepositAddress();
await btcAccount.sendTransaction({
  to: sparkDeposit,
  value: 1_000_000
});
```

## Spark to Bitcoin Withdrawal
```javascript
const withdraw = await sparkAccount.withdraw({
  onchainAddress: "bc1q...",
  amountSats: 1_000_000,
  exitSpeed: "MEDIUM"
});
console.log("Withdrawal initiated:", withdraw);
```

---

See also: [Lightning Network](lightning-network.md) | [API Reference](../api-reference.md) 