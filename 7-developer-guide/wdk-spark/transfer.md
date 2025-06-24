---
title: Execute Transfer
author: Raquel Carrasco Gonzalez
lastReviewed: 2025-06-20
---

## Ethereum
> 🚧 Work in progress

## Arbitrum

```javascript
const transferResult = await arbitrum.transfer({
    recipient: "<recipient_address>", // Replace with the actual recipient address
    amount: "1",
    token: usdtAddress // Replace with the desired token to transfer
}, {
    paymasterToken: {
        address: usdtAddress
    },
    transferMaxFee: 1_000_000
});

console.log("Transfer successful!");
console.log("Transaction Hash:", transferResult.hash);
console.log("Gas Cost:", transferResult.gasCost);
```

## Polygon
> 🚧 Work in progress

## Bitcoin
> 🚧 Work in progress

## TON
> 🚧 Work in progress

## Spark
> 🚧 Work in progress