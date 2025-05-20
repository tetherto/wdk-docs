# API: Account Abstraction Features

Enable gasless transactions and flexible fee payments with WDK.

---

## Gasless Token Transfer
Quote a transfer where the fee is paid in a token (e.g., USDT):
```javascript
const quote = await wdk.quoteTransfer("ethereum", 0, {
  recipient: "0x...",
  amount: 1_000_000,
  token: "0x6B175474E89094C44Da98b954EedeAC495271d0F", // DAI
  paymasterToken: {
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7" // USDT
  },
  transferMaxFee: 1_000_000
});
```

---

See also: [Transaction Management](transaction-management.md) | [API Reference](../api-reference.md) 