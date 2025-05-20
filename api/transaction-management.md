# API: Transaction Management

Send tokens and manage transactions across blockchains.

---

## EVM Chain Token Transfer
Quote and execute a token transfer:
```javascript
const quote = await wdk.quoteTransfer("ethereum", 0, {
  recipient: "0x...",
  amount: 1_000_000,
  token: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  transferMaxFee: 1_000_000
});
await wdk.executeTransfer("ethereum", 0, quote);
```

## Bitcoin Transfer
```javascript
const quote = await btcAccount.quoteTransaction({
  to: "bc1q...",
  value: 1_000_000
});
await btcAccount.executeTransaction(quote);
```

## Spark Transfer
```javascript
const quote = await sparkAccount.quoteTransaction({
  to: "sp1...",
  value: 1_000_000
});
await sparkAccount.executeTransaction(quote);
```

---

See also: [Balance Management](balance-management.md) | [API Reference](../api-reference.md) 