---
title: Fiat MoonPay API Reference
description: API Reference for the @tetherto/wdk-protocol-fiat-moonpay module
icon: code
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

# API Reference

Complete API documentation for the `@tetherto/wdk-protocol-fiat-moonpay` module.

## Constructor

### `new MoonPayProtocol(account, config)`

Creates a new MoonPayProtocol instance.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `account` | `IWalletAccount` \| `IWalletAccountReadOnly` \| `undefined` | Wallet account for transactions |
| `config` | `MoonPayProtocolConfig` | Configuration object |

**Config Options:**

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `apiKey` | string | Yes | - | Your MoonPay publishable API key |
| `secretKey` | string | Yes | - | Your MoonPay secret key |
| `cacheTime` | number | No | `600000` | Cache duration for currencies (ms) |

**Example:**

```typescript
import MoonPayProtocol from '@tetherto/wdk-protocol-fiat-moonpay';

const moonpay = new MoonPayProtocol(walletAccount, {
  apiKey: 'pk_live_xxxxx',
  secretKey: 'sk_live_xxxxx',
});
```

---

## Methods

### `buy(options)`

Generates a signed widget URL for purchasing cryptocurrency.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `options.cryptoAsset` | string | Yes | Cryptocurrency code (e.g., 'eth', 'btc') |
| `options.fiatCurrency` | string | Yes | Fiat currency code (e.g., 'usd', 'eur') |
| `options.cryptoAmount` | number \| bigint | No* | Amount in smallest crypto units |
| `options.fiatAmount` | number \| bigint | No* | Amount in smallest fiat units (cents) |
| `options.recipient` | string | No | Wallet address (uses account address if not provided) |
| `options.config` | MoonPayBuyParams | No | Widget configuration options |

*Either `cryptoAmount` or `fiatAmount` must be provided, but not both.

**Returns:** `Promise<{ buyUrl: string }>`

---

### `sell(options)`

Generates a signed widget URL for selling cryptocurrency.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `options.cryptoAsset` | string | Yes | Cryptocurrency code |
| `options.fiatCurrency` | string | Yes | Fiat currency code |
| `options.cryptoAmount` | number \| bigint | No* | Amount in smallest crypto units |
| `options.fiatAmount` | number \| bigint | No* | Amount in smallest fiat units |
| `options.refundAddress` | string | No | Refund wallet address |
| `options.config` | MoonPaySellParams | No | Widget configuration options |

**Returns:** `Promise<{ sellUrl: string }>`

---

### `quoteBuy(options)`

Gets a price quote for a cryptocurrency purchase.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `options.cryptoAsset` | string | Yes | Cryptocurrency code |
| `options.fiatCurrency` | string | Yes | Fiat currency code |
| `options.cryptoAmount` | number \| bigint | No* | Amount in smallest crypto units |
| `options.fiatAmount` | number \| bigint | No* | Amount in smallest fiat units |
| `options.config` | MoonPayQuoteBuyParams | No | Quote parameters |

**Returns:** `Promise<MoonPayBuyQuote>`

```typescript
{
  cryptoAmount: bigint,  // Crypto amount you'll receive
  fiatAmount: bigint,    // Fiat amount to pay
  fee: bigint,           // Total fee amount
  rate: string,          // Exchange rate
  metadata: MoonPayBuyQuoteMetadata
}
```

---

### `quoteSell(options)`

Gets a price quote for selling cryptocurrency.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `options.cryptoAsset` | string | Yes | Cryptocurrency code |
| `options.fiatCurrency` | string | Yes | Fiat currency code |
| `options.cryptoAmount` | number \| bigint | Yes | Amount in smallest crypto units |
| `options.config` | MoonPayQuoteSellParams | No | Quote parameters |

**Returns:** `Promise<MoonPaySellQuote>`

```typescript
{
  cryptoAmount: bigint,  // Crypto amount to sell
  fiatAmount: bigint,    // Fiat amount you'll receive
  fee: bigint,           // Total fee amount
  rate: string,          // Exchange rate
  metadata: MoonPaySellQuoteMetadata
}
```

---

### `getSupportedCryptoAssets()`

Fetches the list of supported cryptocurrencies. Results are cached.

**Returns:** `Promise<MoonPaySupportedCryptoAsset[]>`

```typescript
{
  code: string,          // Currency code (e.g., 'eth')
  decimals: number,      // Decimal places
  networkCode: string,   // Network identifier
  name: string,          // Display name
  metadata: MoonPayCryptoCurrencyDetails
}
```

---

### `getSupportedFiatCurrencies()`

Fetches the list of supported fiat currencies. Results are cached.

**Returns:** `Promise<MoonPaySupportedFiatCurrency[]>`

```typescript
{
  code: string,          // Currency code (e.g., 'usd')
  decimals: number,      // Decimal places
  name: string,          // Display name
  metadata: MoonPayFiatCurrencyDetails
}
```

---

### `getSupportedCountries()`

Fetches the list of supported countries.

**Returns:** `Promise<MoonPaySupportedCountry[]>`

```typescript
{
  code: string,          // ISO country code
  name: string,          // Country name
  isBuyAllowed: boolean, // Buy operations allowed
  isSellAllowed: boolean,// Sell operations allowed
  metadata: MoonPayCountryDetail
}
```

---

### `getTransactionDetail(txId, direction?)`

Retrieves details of a specific transaction.

**Parameters:**

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `txId` | string | Yes | - | MoonPay transaction ID |
| `direction` | `'buy'` \| `'sell'` | No | `'buy'` | Transaction type |

**Returns:** `Promise<MoonPayTransactionDetail>`

```typescript
{
  status: 'completed' | 'failed' | 'in_progress',
  cryptoAsset: string,
  fiatCurrency: string,
  metadata: MoonPayBuyTransaction | MoonPaySellTransaction
}
```

---

## Types

### `MoonPayProtocolConfig`

```typescript
interface MoonPayProtocolConfig {
  apiKey: string;
  secretKey: string;
  cacheTime?: number;
}
```

### `MoonPayBuyParams`

Widget configuration options for `buy()` operations:

```typescript
interface MoonPayBuyParams {
  // UI options (shared with MoonPaySellParams)
  colorCode?: string;
  theme?: 'dark' | 'light';
  themeId?: string;
  language?: string;
  showAllCurrencies?: boolean;
  showOnlyCurrencies?: string;
  showWalletAddressForm?: boolean;
  redirectURL?: string;
  unsupportedRegionRedirectUrl?: string;
  skipUnsupportedRegionScreen?: boolean;

  // Buy-specific options
  defaultCurrencyCode?: string;
  walletAddress?: string;
  walletAddressTag?: string;
  walletAddresses?: string;
  walletAddressTags?: string;
  contractAddress?: string;
  networkCode?: string;
  lockAmount?: boolean;
  email?: string;
  externalTransactionId?: string;
  externalCustomerId?: string;
  paymentMethod?: string;
}
```

### `MoonPaySellParams`

Widget configuration options for `sell()` operations:

```typescript
interface MoonPaySellParams {
  // UI options (shared with MoonPayBuyParams)
  colorCode?: string;
  theme?: 'dark' | 'light';
  themeId?: string;
  language?: string;
  showAllCurrencies?: boolean;
  showOnlyCurrencies?: string;
  showWalletAddressForm?: boolean;
  redirectURL?: string;
  unsupportedRegionRedirectUrl?: string;
  skipUnsupportedRegionScreen?: boolean;

  // Sell-specific options
  defaultBaseCurrencyCode?: string;
  refundWalletAddresses?: string;
  lockAmount?: boolean;
  email?: string;
  externalTransactionId?: string;
  externalCustomerId?: string;
  paymentMethod?: string;
}
```

### `MoonPayQuoteBuyParams`

```typescript
interface MoonPayQuoteBuyParams {
  extraFeePercentage?: number;  // 0-10%
  paymentMethod?: string;
  areFeesIncluded?: boolean;
  walletAddress?: string;
}
```

### `MoonPayQuoteSellParams`

```typescript
interface MoonPayQuoteSellParams {
  extraFeePercentage?: number;  // 0-10%
  payoutMethod?: string;
}
```

---

## Next Steps

- [Configuration](./configuration.md) - Setup and configuration options
- [Usage Guide](./usage.md) - Common usage patterns
