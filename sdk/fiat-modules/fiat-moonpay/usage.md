---
title: Fiat MoonPay Usage
description: How to use the @tetherto/wdk-protocol-fiat-moonpay module
icon: book-open
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

# Usage

This guide covers common use cases for integrating MoonPay fiat on-ramp and off-ramp functionality in your WDK application.

## Basic Setup

First, install the module:

```bash
npm install @tetherto/wdk-protocol-fiat-moonpay
```

## Initializing the Module

```typescript
import MoonPayProtocol from '@tetherto/wdk-protocol-fiat-moonpay';

// Initialize with a wallet account
const moonpay = new MoonPayProtocol(walletAccount, {
  apiKey: 'pk_live_xxxxx',
  secretKey: 'sk_live_xxxxx',
});
```

Read more about configuration in [Configuration](./configuration.md).

## Buying Cryptocurrency (On-Ramp)

Generate a widget URL for users to purchase cryptocurrency:

```typescript
// Buy $100 worth of ETH
const result = await moonpay.buy({
  cryptoAsset: 'eth',
  fiatCurrency: 'usd',
  fiatAmount: 10000n, // Amount in cents ($100.00)
});

// Open the MoonPay widget
window.open(result.buyUrl, '_blank');
```

You can also specify the crypto amount instead:

```typescript
// Buy exactly 0.1 ETH
const result = await moonpay.buy({
  cryptoAsset: 'eth',
  fiatCurrency: 'usd',
  cryptoAmount: 100000000000000000n, // 0.1 ETH in wei
});
```

## Selling Cryptocurrency (Off-Ramp)

Generate a widget URL for users to sell cryptocurrency:

```typescript
// Sell 0.5 ETH
const result = await moonpay.sell({
  cryptoAsset: 'eth',
  fiatCurrency: 'usd',
  cryptoAmount: 500000000000000000n, // 0.5 ETH in wei
});

// Open the MoonPay widget
window.open(result.sellUrl, '_blank');
```

## Getting Price Quotes

Get a quote before initiating a transaction:

```typescript
// Get a buy quote for $100 worth of ETH
const buyQuote = await moonpay.quoteBuy({
  cryptoAsset: 'eth',
  fiatCurrency: 'usd',
  fiatAmount: 10000n, // $100.00 in cents
});

console.log('You will receive:', buyQuote.cryptoAmount);
console.log('Fee:', buyQuote.fee);
console.log('Exchange rate:', buyQuote.rate);

// Get a sell quote for 0.5 ETH
const sellQuote = await moonpay.quoteSell({
  cryptoAsset: 'eth',
  fiatCurrency: 'usd',
  cryptoAmount: 500000000000000000n,
});

console.log('You will receive:', sellQuote.fiatAmount);
```

## Fetching Supported Currencies

Query which cryptocurrencies and fiat currencies are supported:

```typescript
// Get supported cryptocurrencies
const cryptoAssets = await moonpay.getSupportedCryptoAssets();
console.log(cryptoAssets);
// [{ code: 'eth', decimals: 18, networkCode: 'ethereum', name: 'Ethereum', ... }, ...]

// Get supported fiat currencies
const fiatCurrencies = await moonpay.getSupportedFiatCurrencies();
console.log(fiatCurrencies);
// [{ code: 'usd', decimals: 2, name: 'US Dollar', ... }, ...]

// Get supported countries
const countries = await moonpay.getSupportedCountries();
console.log(countries);
// [{ code: 'US', name: 'United States', isBuyAllowed: true, isSellAllowed: true, ... }, ...]
```

## Checking Transaction Status

Retrieve details about a transaction:

```typescript
// Get buy transaction details
const buyTx = await moonpay.getTransactionDetail(transactionId, 'buy');

console.log('Status:', buyTx.status); // 'completed', 'failed', or 'in_progress'
console.log('Crypto asset:', buyTx.cryptoAsset);
console.log('Fiat currency:', buyTx.fiatCurrency);

// Get sell transaction details
const sellTx = await moonpay.getTransactionDetail(transactionId, 'sell');
```

## Customizing the Widget

Pass configuration options to customize the MoonPay widget:

```typescript
const result = await moonpay.buy({
  cryptoAsset: 'usdt',
  fiatCurrency: 'eur',
  fiatAmount: 5000n, // €50.00
  config: {
    colorCode: '#1f2937',
    theme: 'dark',
    language: 'de',
    redirectURL: 'https://yourapp.com/payment-complete',
    lockAmount: true, // Prevent user from changing amount
    email: 'user@example.com', // Pre-fill email
    externalCustomerId: 'user_123', // Your user ID
  },
});
```

## Specifying a Custom Recipient Address

By default, the module uses the wallet account's address. You can override this:

```typescript
const result = await moonpay.buy({
  cryptoAsset: 'eth',
  fiatCurrency: 'usd',
  fiatAmount: 10000n,
  recipient: '0x1234...', // Custom recipient address
});
```

For sell operations, you can specify a refund address:

```typescript
const result = await moonpay.sell({
  cryptoAsset: 'eth',
  fiatCurrency: 'usd',
  cryptoAmount: 500000000000000000n,
  refundAddress: '0x1234...', // Address for refunds if needed
});
```

## Next Steps

- [Configuration](./configuration.md) - Detailed configuration options
- [API Reference](./api-reference.md) - Complete API documentation
