---
title: Buy and Sell
description: On-ramp, off-ramp, quotes, supported assets, widget options, and custom recipients.
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

# Buy and Sell

This guide explains [buying crypto (on-ramp)](#buy-crypto-on-ramp), [selling crypto (off-ramp)](#sell-crypto-off-ramp), [quotes](#get-price-quotes), [supported currencies](#supported-currencies-and-countries), [widget customization](#widget-customization), and [custom recipients](#custom-recipient-addresses). It assumes a [`MoonPayProtocol`](../api-reference.md#new-moonpayprotocol-account-config) instance named `moonpay`.

{% hint style="info" %}
Amounts use smallest units: fiat in minor units (cents), crypto in on-chain base units (for example wei for ETH).
{% endhint %}

## Buy crypto (on-ramp)

You can build a signed purchase URL with [`buy()`](../api-reference.md#buy-options) when you know the fiat spend:

{% code title="Buy with fiat amount" lineNumbers="true" %}
```typescript
const result = await moonpay.buy({
  cryptoAsset: 'usdt',
  fiatCurrency: 'usd',
  fiatAmount: 10000n
})

window.open(result.buyUrl, '_blank')
```
{% endcode %}

You can request a fixed crypto amount instead by passing `cryptoAmount` to [`buy()`](../api-reference.md#buy-options):

{% code title="Buy with crypto amount" lineNumbers="true" %}
```typescript
const result = await moonpay.buy({
  cryptoAsset: 'eth',
  fiatCurrency: 'usd',
  cryptoAmount: 100000000000000000n
})

window.open(result.buyUrl, '_blank')
```
{% endcode %}

## Sell crypto (off-ramp)

You can generate a sell widget URL with [`sell()`](../api-reference.md#sell-options):

{% code title="Sell ETH for USD" lineNumbers="true" %}
```typescript
const result = await moonpay.sell({
  cryptoAsset: 'eth',
  fiatCurrency: 'usd',
  cryptoAmount: 500000000000000000n
})

window.open(result.sellUrl, '_blank')
```
{% endcode %}

## Get price quotes

You can preview economics before opening the widget using [`quoteBuy()`](../api-reference.md#quotebuy-options):

{% code title="Buy quote" lineNumbers="true" %}
```typescript
const buyQuote = await moonpay.quoteBuy({
  cryptoAsset: 'eth',
  fiatCurrency: 'usd',
  fiatAmount: 10000n
})

console.log('Crypto amount:', buyQuote.cryptoAmount)
console.log('Fee:', buyQuote.fee)
console.log('Exchange rate:', buyQuote.rate)
```
{% endcode %}

You can estimate proceeds for a sell with [`quoteSell()`](../api-reference.md#quotesell-options):

{% code title="Sell quote" lineNumbers="true" %}
```typescript
const sellQuote = await moonpay.quoteSell({
  cryptoAsset: 'eth',
  fiatCurrency: 'usd',
  cryptoAmount: 500000000000000000n
})

console.log('Fiat amount:', sellQuote.fiatAmount)
```
{% endcode %}

## Supported currencies and countries

You can list tradable assets with [`getSupportedCryptoAssets()`](../api-reference.md#getsupportedcryptoassets):

{% code title="Supported crypto" lineNumbers="true" %}
```typescript
const cryptoAssets = await moonpay.getSupportedCryptoAssets()
console.log(cryptoAssets)
```
{% endcode %}

You can list fiat currencies with [`getSupportedFiatCurrencies()`](../api-reference.md#getsupportedfiatcurrencies):

{% code title="Supported fiat" lineNumbers="true" %}
```typescript
const fiatCurrencies = await moonpay.getSupportedFiatCurrencies()
console.log(fiatCurrencies)
```
{% endcode %}

You can check regional availability with [`getSupportedCountries()`](../api-reference.md#getsupportedcountries):

{% code title="Supported countries" lineNumbers="true" %}
```typescript
const countries = await moonpay.getSupportedCountries()
console.log(countries)
```
{% endcode %}

## Widget customization

You can pass UI options under `config` to [`buy()`](../api-reference.md#buy-options) (see [`MoonPayBuyParams`](../api-reference.md#moonpaybuyparams)):

{% code title="Themed buy widget" lineNumbers="true" %}
```typescript
const result = await moonpay.buy({
  cryptoAsset: 'usdt',
  fiatCurrency: 'eur',
  fiatAmount: 5000n,
  config: {
    colorCode: '#1f2937',
    theme: 'dark',
    language: 'de',
    redirectURL: 'https://yourapp.com/payment-complete',
    lockAmount: true,
    email: 'user@example.com',
    externalCustomerId: 'user_123'
  }
})

window.open(result.buyUrl, '_blank')
```
{% endcode %}

## Custom recipient addresses

By default [`buy()`](../api-reference.md#buy-options) credits the connected wallet. You can override the destination with `recipient`:

{% code title="Custom buy recipient" lineNumbers="true" %}
```typescript
const result = await moonpay.buy({
  cryptoAsset: 'eth',
  fiatCurrency: 'usd',
  fiatAmount: 10000n,
  recipient: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
})

window.open(result.buyUrl, '_blank')
```
{% endcode %}

You can set a refund destination on sells with `refundAddress` on [`sell()`](../api-reference.md#sell-options):

{% code title="Custom sell refund address" lineNumbers="true" %}
```typescript
const result = await moonpay.sell({
  cryptoAsset: 'eth',
  fiatCurrency: 'usd',
  cryptoAmount: 500000000000000000n,
  refundAddress: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
})

window.open(result.sellUrl, '_blank')
```
{% endcode %}

## Next Steps

- [Manage transactions](manage-transactions.md)
- [Get started](get-started.md)
- [API reference](../api-reference.md)
