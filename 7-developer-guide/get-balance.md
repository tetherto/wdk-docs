---
title: WDK Wallet Balance
author: Raquel Carrasco Gonzalez
lastReviewed: 2025-06-20
---

## Step 4: Check Balances

```javascript
// Check native token balance (ETH)
const nativeBalance = await arbitrum.getAbstractedAddressBalance();
console.log("ETH Balance:", nativeBalance);

// Check USDT balance
const usdtAddress = "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9";

const usdtBalance = await arbitrum.getAbstractedAddressTokenBalance(usdtAddress);
console.log("USDT Balance:", usdtBalance);
```