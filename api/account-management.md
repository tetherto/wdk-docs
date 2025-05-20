# API: Account Management

Manage blockchain accounts with WDK.

---

## Get Account Instance
Retrieve an account object for a specific blockchain and index.
```javascript
const btcAccount = await wdk.getAccount("bitcoin", 0);
const sparkAccount = await wdk.getAccount("spark", 0);
```

## Get Wallet Address
Get the wallet address for a given blockchain and index.
```javascript
// EVM chains
const ethAddress = await wdk.getAbstractedAddress("ethereum", 0);
// TON
const tonAddress = await wdk.getAbstractedAddress("ton", 0);
// Bitcoin
const btcAddress = await btcAccount.getAddress("bitcoin", 0);
// Spark
const sparkAddress = await sparkAccount.getAddress("spark", 0);
```

---

See also: [Balance Management](balance-management.md) | [API Reference](../api-reference.md) 