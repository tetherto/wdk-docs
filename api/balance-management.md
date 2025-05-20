# API: Balance Management

Query balances for native tokens and ERC-20 tokens across blockchains.

---

## Get Native Token Balance
```javascript
const btcBalance = await btcAccount.getBalance("bitcoin", 0);
const sparkBalance = await sparkAccount.getBalance("spark", 0);
```

## Get ERC-20 Token Balance
```javascript
const usdtBalance = await wdk.getAbstractedAddressTokenBalance("ethereum", 0, {
  token: "0xdAC17F958D2ee523a2206206994597C13D831ec7"
});
```

---

See also: [Account Management](account-management.md) | [API Reference](../api-reference.md) 