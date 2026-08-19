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
  apiKey: 'pk_...'        // MoonPay publishable key
})

// Buy crypto with fiat (generates an unsigned widget URL unless signUrl is configured)
const { buyUrl } = await moonpay.buy({
  cryptoAsset: 'eth',
  fiatCurrency: 'usd',
  fiatAmount: 10000n
})

// Sell crypto for fiat (generates an unsigned widget URL unless signUrl is configured)
const { sellUrl } = await moonpay.sell({
  cryptoAsset: 'eth',
  fiatCurrency: 'usd',
  cryptoAmount: 500000000000000000n
})
```

## How It Works

- `buy()` and `sell()` generate MoonPay widget URLs — they do not directly move funds
- The URL is presented to the user who completes the transaction in MoonPay's widget
- The wallet address from the connected account is automatically included
- Configure `signUrl` to send URLs to an authenticated backend that keeps the MoonPay signing secret server-side

## Configuration

```javascript
const moonpay = new MoonPayProtocol(account, {
  apiKey: 'pk_...',       // Required: MoonPay publishable API key
  signUrl: async (urlForSignature) => {
    const response = await fetch('/api/moonpay/sign-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urlForSignature })
    })

    return (await response.json()).signedUrl
  }
})
```

The backend must authenticate the caller and validate or reconstruct the MoonPay URL before signing. Omit `signUrl` when unsigned widget URLs are acceptable.

## Methods

| Method | Description |
|--------|-------------|
| `buy({cryptoAsset, fiatCurrency, fiatAmount})` | Generate a buy URL (⚠️ write method) |
| `sell({cryptoAsset, fiatCurrency, cryptoAmount})` | Generate a sell URL (⚠️ write method) |
| `getSupportedCryptoAssets()` | List currently supported crypto assets |
| `getSupportedFiatCurrencies()` | List currently supported fiat currencies |
| `getSupportedCountries()` | List currently supported countries |
