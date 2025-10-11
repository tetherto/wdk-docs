---
title: Price Rates Configuration
description: Configure HTTP pricing clients and providers
icon: gear
---

# Price Rates Configuration

## Bitfinex HTTP Client

{% code title="Create Client" lineNumbers="true" %}
```javascript
import { BitfinexPricingClient } from '@tetherto/wdk-pricing-bitfinex-http'

// Create the client (no options needed)
const client = new BitfinexPricingClient()
```
{% endcode %}

### Current Price

{% code title="Get Current Price" lineNumbers="true" %}
```javascript
const price = await client.getCurrentPrice('BTC', 'USD')
```
{% endcode %}

### Historical Series

Downscales long histories to ≤ 100 points.

{% code title="Get Historical Prices" lineNumbers="true" %}
```javascript
const series = await client.getHistoricalPrice({
  from: 'BTC',
  to: 'USD',
  start: 1709906400000, // optional (ms)
  end:   1709913600000  // optional (ms)
})
```
{% endcode %}

## Provider Integration

Works with `@tetherto/wdk-pricing-provider` as a PricingClient implementation.

{% code title="Wrap with PricingProvider" lineNumbers="true" %}
```javascript
import { PricingProvider } from '@tetherto/wdk-pricing-provider'

const provider = new PricingProvider({
  client,
  priceCacheDurationMs: 60 * 60 * 1000 // optional, defaults to 1h
})

const last = await provider.getLastPrice('BTC', 'USD')
const hist = await provider.getHistoricalPrice({ from: 'BTC', to: 'USD' })
```
{% endcode %}

***

## Need Help?

{% include "../../.gitbook/includes/support-cards.md" %}

