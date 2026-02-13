# protocol-fiat — MoonPay Fiat On/Off Ramp

## Links

| Resource | URL |
|----------|-----|
| **npm** | https://www.npmjs.com/package/@tetherto/wdk-protocol-fiat-moonpay |
| **Docs — Overview** | https://docs.wallet.tether.io/sdk/fiat-modules/fiat-moonpay |
| **Docs — Usage** | https://docs.wallet.tether.io/sdk/fiat-modules/fiat-moonpay/usage |
| **Docs — Configuration** | https://docs.wallet.tether.io/sdk/fiat-modules/fiat-moonpay/configuration |
| **Docs — API Reference** | https://docs.wallet.tether.io/sdk/fiat-modules/fiat-moonpay/api-reference |

## Package

```bash
npm install @tetherto/wdk-protocol-fiat-moonpay
```

```javascript
import MoonPayProtocol from '@tetherto/wdk-protocol-fiat-moonpay'
```

## Quick Reference

```javascript
const moonpay = new MoonPayProtocol(account, {
  apiKey: 'pk_...',       // MoonPay publishable key
  secretKey: 'sk_...'     // MoonPay secret key (for URL signing)
})

// Buy crypto with fiat (generates signed widget URL)
const { buyUrl } = await moonpay.buy({
  cryptoAsset: 'eth',
  fiatCurrency: 'usd',
  fiatAmount: 10000n
})

// Sell crypto for fiat (generates signed widget URL)
const { sellUrl } = await moonpay.sell({
  cryptoAsset: 'eth',
  fiatCurrency: 'usd',
  cryptoAmount: 500000000000000000n
})
```

## How It Works

- `buy()` and `sell()` generate **signed MoonPay widget URLs** — they do not directly move funds
- The URL is presented to the user who completes the transaction in MoonPay's widget
- The wallet address from the connected account is automatically included
- URLs are signed with `secretKey` for security

## Configuration

```javascript
const moonpay = new MoonPayProtocol(account, {
  apiKey: 'pk_...',       // Required: MoonPay publishable API key
  secretKey: 'sk_...'     // Required: MoonPay secret key for URL signing
})
```

## Methods

| Method | Description |
|--------|-------------|
| `buy({cryptoAsset, fiatCurrency, fiatAmount})` | Generate signed buy URL (⚠️ write method) |
| `sell({cryptoAsset, fiatCurrency, cryptoAmount})` | Generate signed sell URL (⚠️ write method) |
| `getConfig()` | Get protocol configuration |
