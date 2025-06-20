---
title: Get Balance
author: Raquel Carrasco Gonzalez
lastReviewed: 2025-06-20
---

## Ethereum

## Arbitrum


```javascript
// Check native token balance (ETH)
const nativeBalance = await arbitrum.getAbstractedAddressBalance();
console.log("ETH Balance:", nativeBalance);

// Check USDT balance
const usdtAddress = "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9";

const usdtBalance = await arbitrum.getAbstractedAddressTokenBalance(usdtAddress);
console.log("USDT Balance:", usdtBalance);
```

## Polygon
> 🚧 Work in progress

## Bitcoin
> 🚧 Work in progress

## TON
> 🚧 Work in progress

## Spark
> 🚧 Work in progress