---
title: Fiat MoonPay Configuration
description: Configuration options for the @tetherto/wdk-protocol-fiat-moonpay module
icon: gear
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

# Configuration

This page covers all configuration options for the MoonPay fiat module, including optional URL signing and environment selection.

## Prerequisites

Before using this module, you need:

1. A MoonPay developer account - [Create an account on MoonPay Dashboard](https://dashboard.moonpay.com/signup)
2. A publishable API key from your dashboard
3. If you want signed widget URLs, a trusted backend signing endpoint for the `signUrl` callback

## Installation

```bash
npm install @tetherto/wdk-protocol-fiat-moonpay
```

## Basic Configuration

```typescript
import MoonPayProtocol from '@tetherto/wdk-protocol-fiat-moonpay';

const moonpay = new MoonPayProtocol(walletAccount, {
  apiKey: 'pk_live_xxxxx', // Your MoonPay publishable API key
  signUrl: async (urlForSignature) => {
    const response = await fetch('/api/moonpay/sign-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ urlForSignature }),
    });

    if (!response.ok) {
      throw new Error(`Failed to sign MoonPay URL: ${response.status} ${response.statusText}`);
    }

    const { signedUrl } = await response.json();

    return signedUrl;
  },
  environment: 'sandbox',
});
```

## Configuration Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `apiKey` | string | Yes | - | Your MoonPay publishable API key |
| `signUrl` | function | No | - | Callback used to sign buy and sell widget URLs through a trusted backend |
| `cacheTime` | number | No | `600000` (10 min) | Duration in milliseconds to cache supported currencies |
| `environment` | `'production' \| 'sandbox'` | No | `production` | MoonPay widget URL endpoint set |

## Constructor Overloads

The `MoonPayProtocol` class supports three constructor patterns:

```typescript
// Without account (for public read operations like fetching supported currencies)
const moonpay = new MoonPayProtocol(undefined, config);

// With read-only account
const moonpay = new MoonPayProtocol(readOnlyAccount, config);

// With full wallet account (for buy/sell operations)
const moonpay = new MoonPayProtocol(walletAccount, config);
```

## Environment Configuration

### Sandbox (Testing)

Use sandbox endpoints for development and testing:

```typescript
const moonpay = new MoonPayProtocol(walletAccount, {
  apiKey: 'pk_test_xxxxx',
  signUrl: async (urlForSignature) => {
    const response = await fetch('/api/moonpay/sign-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ urlForSignature }),
    });

    return (await response.json()).signedUrl;
  },
  environment: 'sandbox',
});
```

In sandbox mode:
- No real transactions are processed
- Use test card numbers provided by MoonPay
- KYC verification is simulated

If you do not need signed URLs, omit `signUrl` and the protocol returns unsigned widget URLs directly.

### Production

For production deployments, use live API keys and the production endpoint set:

```typescript
const moonpay = new MoonPayProtocol(walletAccount, {
  apiKey: 'pk_live_xxxxx',
  signUrl: async (urlForSignature) => {
    const response = await fetch('/api/moonpay/sign-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ urlForSignature }),
    });

    return (await response.json()).signedUrl;
  },
  environment: 'production',
});
```

## Widget Customization

When calling `buy()` or `sell()`, you can customize the MoonPay widget appearance:

```typescript
const result = await moonpay.buy({
  cryptoAsset: 'eth',
  fiatCurrency: 'usd',
  fiatAmount: 10000n, // $100.00 in cents
  config: {
    colorCode: '#3B82F6',       // Your brand color (hex)
    theme: 'dark',              // 'dark' or 'light'
    language: 'en',             // ISO 639-1 language code
    redirectURL: 'https://yourapp.com/callback',
  },
});
```

### Available Buy Widget Options

| Option | Type | Description |
|--------|------|-------------|
| `colorCode` | string | Hexadecimal color for widget accent |
| `theme` | `'dark' \| 'light'` | Widget appearance theme |
| `themeId` | string | ID of a custom theme |
| `language` | string | ISO 639-1 language code |
| `showAllCurrencies` | boolean | Show all supported cryptocurrencies |
| `showOnlyCurrencies` | string | Comma-separated currency codes to display |
| `showWalletAddressForm` | boolean | Show wallet address input form |
| `redirectURL` | string | URL to redirect after completion |
| `unsupportedRegionRedirectUrl` | string | URL for unsupported regions |
| `skipUnsupportedRegionScreen` | boolean | Skip unsupported region screen |
| `defaultCurrencyCode` | string | Pre-selected cryptocurrency code |
| `walletAddress` | string | Pre-filled wallet address |
| `walletAddressTag` | string | Wallet address memo/tag (for EOS, XRP, etc.) |
| `walletAddresses` | string | JSON string of wallet addresses for multiple currencies |
| `walletAddressTags` | string | JSON string of address tags for multiple currencies |
| `contractAddress` | string | Token contract address (DeFi Buy only) |
| `networkCode` | string | Network for the token contract (DeFi Buy only) |
| `lockAmount` | boolean | Prevent user from changing amount |
| `email` | string | Pre-fill customer email |
| `externalTransactionId` | string | Your transaction identifier |
| `externalCustomerId` | string | Your customer identifier |
| `paymentMethod` | string | Pre-select payment method |

### Available Sell Widget Options

For `sell()`, the widget config uses `MoonPaySellParams` with different options:

| Option | Type | Description |
|--------|------|-------------|
| `colorCode` | string | Hexadecimal color for widget accent |
| `theme` | `'dark'` \| `'light'` | Widget appearance theme |
| `themeId` | string | ID of a custom theme |
| `language` | string | ISO 639-1 language code |
| `showAllCurrencies` | boolean | Show all supported cryptocurrencies |
| `showOnlyCurrencies` | string | Comma-separated currency codes to display |
| `showWalletAddressForm` | boolean | Show wallet address input form |
| `redirectURL` | string | URL to redirect after completion |
| `unsupportedRegionRedirectUrl` | string | URL for unsupported regions |
| `skipUnsupportedRegionScreen` | boolean | Skip unsupported region screen |
| `defaultBaseCurrencyCode` | string | Pre-selected cryptocurrency to sell |
| `refundWalletAddresses` | string | JSON string of wallet addresses for refunds |
| `lockAmount` | boolean | Prevent user from changing amount |
| `email` | string | Pre-fill customer email |
| `externalTransactionId` | string | Your transaction identifier |
| `externalCustomerId` | string | Your customer identifier |
| `paymentMethod` | string | Pre-select payout method |

## Next Steps

- [Usage Guide](./usage.md) - Learn how to integrate MoonPay
- [API Reference](./api-reference.md) - Complete API documentation
