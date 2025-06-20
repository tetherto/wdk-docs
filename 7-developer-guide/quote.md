---
title: Estimate Fee
author: Raquel Carrasco Gonzalez
lastReviewed: 2025-06-20
---

## Ethereum

## Arbitrum

```javascript
// Estimate the cost of a transfer operation
const quote = await arbitrum.quoteTransfer({
    recipient: "<recipient_address>", // Replace with the actual recipient address
    amount: "1",
    token: usdtAddress // Replace with the desired token to transfer
}, {
    paymasterToken: {
        address: usdtAddress
    },
    transferMaxFee: 1_000_000
});

console.log("Gas Cost:", quote.gasCost);
console.log("Gas Cost in USDT:", (quote.gasCost / 1_000_000).toFixed(6), "USDT");
```

## Polygon

## Bitcoin

## TON

## Spark