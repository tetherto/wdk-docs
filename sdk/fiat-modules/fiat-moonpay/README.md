---
title: Fiat MoonPay Overview
description: Overview of the @tetherto/wdk-protocol-fiat-moonpay module
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

# @tetherto/wdk-protocol-fiat-moonpay Overview

A WDK module for integrating MoonPay's fiat on-ramp and off-ramp services. This module generates signed widget URLs that allow users to buy and sell cryptocurrency using fiat currencies directly within your application.

Get started by reading the [Usage](./usage.md) guide.

{% hint style="info" %}
This module requires a MoonPay developer account. [Create your account here](https://dashboard.moonpay.com/signup).
{% endhint %}

## Features

- **Fiat On-Ramp**: Generate widget URLs for users to buy cryptocurrency with fiat
- **Fiat Off-Ramp**: Generate widget URLs for users to sell cryptocurrency for fiat
- **Price Quotes**: Get real-time quotes for buy and sell operations
- **Transaction Tracking**: Retrieve transaction status and details
- **Currency Support**: Query supported cryptocurrencies, fiat currencies, and countries
- **Customizable Widget**: Configure colors, themes, language, and behavior

## Supported Payment Methods

- Credit and debit cards (Visa, Mastercard, etc.)
- Bank transfers (ACH, SEPA, etc.)
- Apple Pay and Google Pay
- Local payment methods (varies by region)

For the full list of supported payment methods by country, see [MoonPay's Supported Payment Methods](https://support.moonpay.com/en/articles/380823-moonpay-s-supported-payment-methods).

## Supported Cryptocurrencies

This module supports purchasing and selling cryptocurrencies on networks compatible with WDK wallet modules, including:

- Ethereum and EVM-compatible chains (ETH, USD₮, etc.)
- Bitcoin (BTC)
- TRON (TRX, USD₮)
- TON
- Solana (SOL, USD₮)

## Next Steps

<table data-card-size="large" data-view="cards">
  <thead>
    <tr>
      <th></th>
      <th></th>
      <th></th>
      <th data-hidden data-card-target data-type="content-ref"></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>:gear:</td>
      <td><strong>Configuration</strong></td>
      <td>Set up your MoonPay API credentials and configure the module</td>
      <td><a href="./configuration.md">Configuration</a></td>
    </tr>
    <tr>
      <td>:book:</td>
      <td><strong>Usage Guide</strong></td>
      <td>Learn how to integrate MoonPay in your application</td>
      <td><a href="./usage.md">Usage</a></td>
    </tr>
    <tr>
      <td>:page_facing_up:</td>
      <td><strong>API Reference</strong></td>
      <td>Complete API documentation for the module</td>
      <td><a href="./api-reference.md">API Reference</a></td>
    </tr>
  </tbody>
</table>

---

### MoonPay Resources

- [MoonPay Dashboard](https://dashboard.moonpay.com/signup) - Create your developer account
- [MoonPay Support Center](https://support.moonpay.com/) - Official MoonPay documentation and support
- [Supported Payment Methods](https://support.moonpay.com/en/articles/380823-moonpay-s-supported-payment-methods) - Full list by country

---

### Need Help?

{% include "../../../.gitbook/includes/support-cards.md" %}
