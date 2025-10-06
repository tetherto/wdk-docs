---
title: React Native Starter (Alpha)
description:  Multi-chain wallet starter built with WDK, Expo, and React Native
icon: mobile
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

The React Native Starter Alpha is a Expo + React Native app showing how to build a multi-chain wallet using WDK via BareKit worklets and secure secret management. This starter includes wallet creation/import flows, balances, transactions, and a modular service layer.

[!Demo Video](../assets/starter-react-native-demo.mp4)

***

## Features

**Multi-Chain Support**

| Blockchain | Features | Operations |
| --- | --- | --- |
| **Bitcoin** | SegWit native transfers | Address resolution, balance fetching, transaction history, sending, receiving |
| **Ethereum** | Transactions with gas fees sponsorship | Account abstraction, ERC-20 support, transaction history |
| **Polygon** | Transactions with gas fees sponsorship | Account abstraction, ERC-20 support, transaction history |
| **Arbitrum** | Transactions with gas fees sponsorship | Account abstraction, ERC-20 support, transaction history |
| **TON** | Native transfers | Native transfers, transaction history |

**Multi-Token Support**

| Token | Networks | Features |
| --- | --- | --- |
| **BTC** | Bitcoin | Native SegWit transfers, UTXO management |
| **USD₮** | Ethereum, Polygon, Arbitrum, TON | Account Abstraction (EVM), Native transfers (TON) |
| **XAU₮** | Ethereum | ERC-20 transfers, transaction history |

**Wallet Management**

* **Secure Seed Generation**: Cryptographically secure entropy generation
* **Seed Import**: Import existing 12-word mnemonic phrases
* **Encrypted Storage**: Secure key storage via [`@tetherto/wdk-secret-manager`](https://github.com/tetherto/wdk-secret-manager)
* **Multi-Account Support**: Derive multiple accounts from single seed

**Asset Management**

* **Real-Time Balances**: Live balance updates via [WDK Indexer](https://indexer.wallet.tether.io/)
* **Transaction History**: Complete transaction tracking and history
* **Price Conversion**: Real-time fiat pricing via Bitfinex provider

**User Experience**

* **QR Code Scanner**: Scan addresses and payment requests via camera
* **Send/Receive Flows**: Intuitive transfer interfaces
* **Network Selection**: Choose optimal network for each transaction
* **Token Selection**: Multi-token transfer support
* **Activity Feed**: Real-time transaction monitoring

***

## Prerequisites

Before we start, make sure you have:

| Tool | Version | Why You Need It |
| --- | --- | --- |
| **Node.js** | 18+ | To run JavaScript code |
| **npm** | Latest | To install packages |
| **Code Editor** | Any | To write code |
| **Xcode** | Latest | iOS simulator and build tools |
| **Android SDK** | Latest | Android emulator and build tools |
| **npx** | Latest | For bundling worklets via `bare-pack` |

***

## Quick Start

Get your React Native wallet running in minutes with these simple steps:

{% stepper %}
{% step %}
### Clone Repository

```bash
git clone https://github.com/tetherto/wdk-starter-react-native.git
cd wdk-starter-react-native
npm install
```
{% endstep %}

{% step %}
### Configure Environment

```bash
cp .env.example .env
# Edit .env and add your WDK Indexer API key
```
{% endstep %}

{% step %}
### Generate Bundle

```bash
npm run gen:bundle
```
{% endstep %}

{% step %}
### Run Your App

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

## What Just Happened?

**Congratulations!** You've successfully launched a production-ready multi-chain wallet app. Here's what you now have:

* [x] A complete multi-chain wallet supporting Bitcoin, Ethereum, Polygon, Arbitrum, and TON
* [x] Secure seed phrase generation and import functionality
* [x] Real-time balance updates via WDK Indexer API
* [x] Transaction history and activity feed
* [x] QR code scanning for addresses and payments
* [x] Send/receive flows for BTC, USD₮, and XAU₮ tokens

***

## Project Structure

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

### Key Components

* **`app/`**: Expo Router-based screen navigation
* **`components/`**: Reusable UI components from WDK React Native UI Kit
* **`config/`**: Blockchain network configurations
* **`contexts/`**: React contexts for state management
* **`services/wdk-service/`**: Core wallet orchestration and HRPC integration
* **`worklet/`**: Secure secret management worklet

***

## Supported Networks & Operations

### Bitcoin (BTC)
- **Address Resolution**: SegWit addresses (native)
- **Balance Fetching**: ✅ Supported
- **Transaction History**: ✅ Supported  
- **Sending**: ✅ Native SegWit transfers
- **Receiving**: ✅ Native SegWit addresses

### Tether USD (USD₮)
- **Networks**: Ethereum, Polygon, Arbitrum, TON
- **Address Resolution**: ✅ All supported networks
- **Balance Fetching**: ✅ All supported networks
- **Transaction History**: ✅ All supported networks
- **Sending**: ✅ Account Abstraction (EVM networks), Native (TON)
- **Receiving**: ✅ All supported networks

### Tether Gold (XAU₮)
- **Networks**: Ethereum
- **Address Resolution**: ✅ Ethereum
- **Balance Fetching**: ✅ Ethereum
- **Transaction History**: ✅ Ethereum
- **Sending**: ✅ Ethereum
- **Receiving**: ✅ Ethereum

### Additional Networks (Coming Soon)
- **Spark**: Support Planned
- **TRON**: Support Planned
- **Solana**: Support Planned

***

## Available Scripts

| Script | Description |
| --- | --- |
| `npm start` | Start Expo development server with dev client |
| `npm run android` | Run on Android emulator/device |
| `npm run ios` | Run on iOS simulator |
| `npm run web` | Start web development server |
| `npm run gen:bundle` | Build secret manager worklet bundle |
| `npm run prebuild` | Generate native project files |
| `npm run prebuild:clean` | Clean and regenerate native project files |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint errors |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |

***

## Technology Stack

### Core Technologies
- **Expo**: ~54 with development client
- **React Native**: 0.81.4
- **React**: 19
- **Reanimated**: ~4.1
- **New Architecture**: Enabled

### Build Configuration
- **Android**: minSdkVersion 29
- **iOS**: Latest Xcode toolchain
- **Build Properties**: Configured via `expo-build-properties`

### Polyfills
See `metro.config.js` for comprehensive polyfills:
- **Stream, Buffer, Crypto**: Node.js compatibility
- **Net/TLS, URL, HTTP/HTTPS/HTTP2**: Network compatibility
- **Zlib, Path**: File system compatibility
- **Nice-gRPC → Web**: gRPC web compatibility
- **Sodium-universal → JavaScript**: Cryptographic compatibility
- **Querystring, Events**: Node.js event system

***

## Customization

### UI Theming

This starter uses components from the [WDK React Native UI Kit](../ui-kits/react-native-ui-kit/README.md). To customize the look and feel:

* [**Theming Guide**](../ui-kits/react-native-ui-kit/theming.md) - Deep dive into theming capabilities
* [**Component Reference**](../ui-kits/react-native-ui-kit/api-reference.md) - Complete component documentation

### Adding Networks

The starter supports these networks out of the box:

* **Bitcoin**: SegWit native transfers
* **Ethereum**: Transactions with gas fees sponsorship
* **Polygon**: Transactions with gas fees sponsorship  
* **Arbitrum**: Transactions with gas fees sponsorship
* **TON**: Native transfers

### Extending Functionality

* **Add New Tokens**: Configure additional ERC-20 or native tokens
* **Custom Networks**: Add support for additional blockchain networks
* **DeFi Integration**: Integrate swap, bridge, or lending protocols
* **Advanced Features**: Add staking, governance, or other DeFi features

***

## Next Steps

Now that you have a working wallet app, here's what you can explore:

* [**WDK SDK Documentation**](../sdk/get-started.md) - Learn about the underlying SDK
* [**UI Kit Documentation**](../ui-kits/react-native-ui-kit/get-started.md) - Customize the interface
* [**WDK Indexer API**](../tools/indexer-api/overview.md) - Understand data fetching
* [**Secret Manager**](../tools/secret-manager/overview.md) - Learn about secure key management

***

## Need Help?

{% include "../.gitbook/includes/support-cards.md" %}