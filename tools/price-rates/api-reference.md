---
title: Price Rates API Reference
description: API for @tetherto/wdk-pricing-bitfinex-http
author: Raquel Carrasco Gonzalez
lastReviewed: 2025-10-06
---

# API Reference

## Package: `@tetherto/wdk-pricing-bitfinex-http`

### Class: `BitfinexPricingClient`

Simple HTTP pricing client for Bitfinex Public REST API.

#### Constructor

{% code title="Create Client" lineNumbers="true" %}
```javascript
new BitfinexPricingClient(options?)
```
{% endcode %}

- `options` (optional): reserved for future use

#### Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `getCurrentPrice(base, quote)` | Fetch latest price for base/quote pair | `Promise<number>` |
| `getHistoricalPrice({ from, to, start?, end? })` | Fetch historical series (downscaled to ≤ 100 points if needed) | `Promise<any[]>` |

##### `getCurrentPrice(base, quote)`

{% code title="Current Price" lineNumbers="true" %}
```javascript
const price = await client.getCurrentPrice('BTC', 'USD')
```
{% endcode %}

##### `getHistoricalPrice({ from, to, start?, end? })`

If the returned series exceeds 100 points, it is downscaled by powers of two until ≤ 100.

{% code title="Historical Prices" lineNumbers="true" %}
```javascript
const series = await client.getHistoricalPrice({
  from: 'BTC',
  to: 'USD',
  start: 1709906400000, // optional
  end:   1709913600000  // optional
})
```
{% endcode %}

## Package: `@tetherto/wdk-pricing-provider`

### Class: `PricingProvider`

Cache-aware wrapper providing a unified API over a `PricingClient` implementation.

#### Constructor

{% code title="Create Provider" lineNumbers="true" %}
```javascript
new PricingProvider({
  client,                 // required: implements PricingClient
  priceCacheDurationMs    // optional: defaults to 1h
})
```
{% endcode %}

- `client`: instance implementing the `PricingClient` contract
- `priceCacheDurationMs` (number, optional): cache TTL for last price in ms (default 3,600,000)

#### Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `getLastPrice(base, quote)` | Returns cached last price; refreshes when TTL expires | `Promise<number>` |
| `getHistoricalPrice({ from, to, start?, end? })` | Delegates to client for historical data | `Promise<any[]>` |

##### `getLastPrice(base, quote)`

{% code title="Last Price with Caching" lineNumbers="true" %}
```javascript
const provider = new PricingProvider({ client })
const last = await provider.getLastPrice('BTC', 'USD')
```
{% endcode %}

##### `getHistoricalPrice({ from, to, start?, end? })`

{% code title="Historical via Provider" lineNumbers="true" %}
```javascript
const hist = await provider.getHistoricalPrice({ from: 'BTC', to: 'USD' })
```
{% endcode %}

### Interface: `PricingClient` (abstract)

Implement this interface to plug your data source into `PricingProvider`.

| Method | Signature | Notes |
|--------|-----------|-------|
| `getCurrentPrice` | `(from: string, to: string) => Promise<number>` | Should return spot price |
| `getHistoricalPrice` | `(opts: { from: string, to: string, start?: number, end?: number }) => Promise<any[]>` | Return series for charting |

## Notes

- Uses Bitfinex Public HTTP API (`/v2/ticker` and `/v2/candles`) under the hood for the Bitfinex client
- Provider caches last price per pair using in-memory store and TTL

