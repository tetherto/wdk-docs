---
title: React Native Starter (Alpha)
description: Multi-chain wallet starter built with WDK, Expo, and React Native
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

# React Native Starter

The React Native Starter Alpha is a Expo + React Native app showing how to build a multi-chain wallet using WDK via BareKit worklets and secure secret management. This starter includes wallet creation/import flows, balances, transactions, and a modular service layer.

{% embed url="https://files.gitbook.com/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FytSNr1FkZhOoYwcLqOLe%2Fuploads%2FJVvhHxX5wFJ9bwZgwNWC%2Fstarter-react-native-demo.mp4?alt=media&token=440309fc-8d85-4dc6-b29d-357504d85185" %}

***

### Features

**Multi-Token & Chain Support**

* **BTC**: Native SegWit transfers on Bitcoin network
* **USD₮**: Gasless transactions on EVM networks (Ethereum, Polygon, Arbitrum) and native transfers on TON
* **XAU₮**: Gasless transactions on Ethereum network

**Wallet Management**

* **Secure Seed Generation**: Cryptographically secure entropy generation
* **Seed Import**: Import existing 12-word mnemonic phrases
* **Encrypted Storage**: Secure key storage via [`@tetherto/wdk-secret-manager`](https://github.com/tetherto/wdk-secret-manager)
* **Multi-Account Support**: Derive multiple accounts from single seed

**Asset Management**

* **Real-Time Balances**: Live balance updates via [WDK Indexer](https://indexer.wallet.tether.io/)
* **Transaction History**: Complete transaction tracking and history via [WDK Indexer](https://indexer.wallet.tether.io/)
* **Price Conversion**: Real-time fiat pricing via Pricing Provider

**User Experience**

* **QR Code Scanner**: Scan addresses and payment requests via camera
* **Send/Receive Flows**: Intuitive transfer interfaces
* **Network Selection**: Choose optimal network for each transaction
* **Token Selection**: Multi-token transfer support
* **Activity Feed**: Real-time transaction monitoring

***

### Quick Start

Get your React Native wallet running in minutes with these simple steps:

{% stepper %}
{% step %}
#### Clone Repository

```bash
git clone https://github.com/tetherto/wdk-starter-react-native.git
cd wdk-starter-react-native
npm install
```
{% endstep %}

{% step %}
#### Configure Environment

```bash
cp .env.example .env
# Edit .env and add your WDK Indexer API key
```
{% endstep %}

{% step %}
#### Generate Bundle

```bash
npm run gen:bundle
```
{% endstep %}

{% step %}
#### Run Your App

```bash
npm run ios    # iOS Simulator
npm run android # Android Emulator
```
{% endstep %}
{% endstepper %}

{% hint style="info" %}
**Need detailed instructions?** Check out the complete [React Native Quickstart](../start-building/react-native-quickstart.md) guide for step-by-step setup, configuration, and troubleshooting.
{% endhint %}

***

### Project Structure

The starter includes a modular architecture designed for scalability and maintainability:

{% code title="Project Structure" lineNumbers="true" %}
```
src/
├── app/                         # Screens (Expo Router)
├── components/                  # UI components
├── config/                      # Chains/networks config
├── contexts/                    # React contexts
├── services/
│   └── wdk-service/             # Worklet + HRPC + wallet orchestration
├── spec/                        # HRPC/schema (copied for reference)
├── worklet/                     # Secret manager worklet entry
└── wdk-secret-manager-worklet.bundle.js  # Generated bundle
```
{% endcode %}

***

### Available Scripts

| Script                   | Description                                   |
| ------------------------ | --------------------------------------------- |
| `npm start`              | Start Expo development server with dev client |
| `npm run android`        | Run on Android emulator/device                |
| `npm run ios`            | Run on iOS simulator                          |
| `npm run web`            | Start web development server                  |
| `npm run gen:bundle`     | Build secret manager worklet bundle           |
| `npm run prebuild`       | Generate native project files                 |
| `npm run prebuild:clean` | Clean and regenerate native project files     |
| `npm run lint`           | Run ESLint                                    |
| `npm run lint:fix`       | Fix ESLint errors                             |
| `npm run format`         | Format code with Prettier                     |
| `npm run format:check`   | Check code formatting                         |

***

### Technology Stack

#### Core Technologies

* **Expo**: \~54 with development client
* **React Native**: 0.81.4
* **React**: 19
* **Reanimated**: \~4.1
* **New Architecture**: Enabled

#### Build Configuration

* **Android**: minSdkVersion 29
* **iOS**: Latest Xcode toolchain
* **Build Properties**: Configured via `expo-build-properties`

#### Polyfills

See `metro.config.js` for comprehensive polyfills:

* **Stream, Buffer, Crypto**: Node.js compatibility
* **Net/TLS, URL, HTTP/HTTPS/HTTP2**: Network compatibility
* **Zlib, Path**: File system compatibility
* **Nice-gRPC → Web**: gRPC web compatibility
* **Sodium-universal → JavaScript**: Cryptographic compatibility
* **Querystring, Events**: Node.js event system

***

### Next Steps

**Customizing the UI**

This starter uses components from the [WDK React Native UI Kit](../ui-kits/react-native-ui-kit/). To customize the look and feel:

* [**Theming Guide**](../ui-kits/react-native-ui-kit/theming.md) - Deep dive into theming capabilities
* [**Component Reference**](../ui-kits/react-native-ui-kit/api-reference.md) - Complete component documentation


**Add new functionality**

This starter provides a solid foundation that you can extend with additional functionality:

* **Add support for other tokens** using wallet modules in the [WDK SDK](../sdk/get-started.md)
* **Add DeFi protocols** like swaps, bridges, and lending using [protocol modules](../sdk/get-started.md)


**Or explore documentation**

* [**WDK SDK Documentation**](../sdk/get-started.md) - Learn about the underlying SDK
* [**UI Kit Documentation**](../ui-kits/react-native-ui-kit/get-started.md) - Customize the interface
* [**WDK Indexer API**](../tools/indexer-api/overview.md) - Understand data fetching
* [**Secret Manager**](../tools/secret-manager/overview.md) - Learn about secure key management

***

### Need Help?

{% include "../.gitbook/includes/support-cards.md" %}
