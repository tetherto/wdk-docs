---
title: Fiat Modules Overview
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

# Fiat Modules Overview

The Wallet Development Kit (WDK) provides fiat modules that enable on-ramp and off-ramp functionality, allowing users to seamlessly convert between fiat currencies and cryptocurrencies within your application.

## Fiat Protocol Modules

On-ramp and off-ramp functionality for fiat currency integration:

| Module | Provider | Status | Documentation |
|--------|----------|--------|---------------|
| [`@tetherto/wdk-protocol-fiat-moonpay`](https://github.com/tetherto/wdk-protocol-fiat-moonpay) | MoonPay | ✅ Ready | [Documentation](./fiat-moonpay/) |

## Features

Fiat modules provide:

- **On-Ramp**: Allow users to purchase cryptocurrency using fiat currencies (credit card, bank transfer, etc.)
- **Off-Ramp**: Enable users to sell cryptocurrency and receive fiat currencies
- **Multiple Payment Methods**: Support for various payment options depending on the provider
- **KYC Integration**: Built-in Know Your Customer verification flows
- **Multi-Currency Support**: Support for multiple fiat and cryptocurrencies

## Next Steps

To get started with WDK fiat modules, follow these steps:

1. Get up and running quickly with our [Quick Start Guide](../../start-building/nodejs-bare-quickstart.md)
2. Choose the fiat module that best fits your needs from the table above
3. Check specific documentation for the module you wish to use

You can also:

- Learn about key concepts in our [Concepts](../../resources/concepts.md) page
- Explore [wallet modules](../wallet-modules/) to manage user wallets
- Check our [examples](../../examples-and-starters/react-native-starter.md) for production-ready implementations
