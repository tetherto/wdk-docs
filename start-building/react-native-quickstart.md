---
title: React Native Quickstart
description: Get started with WDK in React Native by running the production-ready starter wallet in 3 minutes
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

# React Native Quickstart

## What You'll Build

In this quickstart, you'll run a production-ready multi-chain wallet app that:

* [ ] Supports multiple blockchains (Bitcoin, Ethereum, Polygon, Arbitrum, TON)
* [ ] Manages multiple tokens (BTC, USD₮, XAU₮)
* [ ] Provides secure seed generation and import
* [ ] Shows real-time balances and transaction history
* [ ] Includes QR code scanning and send/receive flows

{% hint style="info" %}
You can try all features without real funds required. You can use the Pimlico or Candide faucets to get some Sepolia USDt. 

<a class="button primary" href="https://dashboard.pimlico.io/test-erc20-faucet"> Get mock/test USDt on Pimlico </a>
<a class="button primary" href="https://dashboard.candide.dev/faucet"> Get mock/test USDt on Candide </a>

See the [configuration.md](../sdk/wallet-modules/wallet-evm-erc-4337/configuration.md) for quick setup and Sepolia testnet configuration.
{% endhint %}

***

## Prerequisites

Before we start, make sure you have:

| Tool            | Version | Why You Need It                    |
| --------------- | ------- | ---------------------------------- |
| **Node.js**     | 18+     | To run JavaScript code             |
| **npm**         | Latest  | To install packages                |
| **Code Editor** | Any     | To write code                      |
| **Xcode**       | Latest  | iOS simulator and build tools      |
| **Android SDK** | Latest  | Android emulator and build tools   |

***

## Step 1: Set Up Your Project

First, clone the React Native starter repository:

```bash
git clone https://github.com/tetherto/wdk-starter-react-native.git
cd wdk-starter-react-native
```

Then install dependencies:

```bash
npm install
```

{% hint style="info" %}
Learn more about the React Native starter: 

* [**React Native Starter**](../examples-and-starters/react-native-starter.md) - Multi-chain support, secure storage, and more
* [**React Native UI Kit**](../ui-kits/react-native-ui-kit/) - Components for building wallet interfaces
{% endhint %}

***

## Step 2: Configure Environment

Create an environment file for the WDK Indexer API:

```bash
cp .env.example .env
```

Edit `.env` and add your WDK Indexer API key:

```bash
# Replace PUT_WDK_API_KEY_HERE with your actual API key
EXPO_PUBLIC_WDK_INDEXER_API_KEY=your_actual_api_key_here
```

{% hint style="info" %}
Get your free WDK Indexer API key [here](../tools/indexer-api/get-started.md)
{% endhint %}

***

## Step 3: Generate Worklet Bundle

Generate the Secret Manager worklet bundle (required for secure key management):

```bash
npm run gen:bundle
```

***

## Step 4: Run Your App

Choose your platform:

{% tabs %}
{% tab title="iOS Simulator" %}
```bash
npm run ios
```
{% endtab %}

{% tab title="Android Emulator" %}
```bash
npm run android
```
{% endtab %}
{% endtabs %}

You should see the wallet app launch with:

```
Starting WDK React Native App...
Loading wallet interface...
Multi-chain support enabled
```

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

## Next Steps

Now that you have a working wallet app, here's what you can explore:

### Explore the Codebase

The starter includes a modular architecture:

```
src/
├── app/                         # Screens (Expo Router)
├── components/                  # UI components
├── config/                      # Chains/networks config
├── contexts/                    # React contexts
├── services/
│   └── wdk-service/             # Worklet + HRPC + wallet orchestration
├── worklet/                     # Secret manager worklet entry
└── wdk-secret-manager-worklet.bundle.js  # Generated bundle
```

### Add More Networks

The starter supports these networks out of the box:

* **Bitcoin**: SegWit native transfers
* **Ethereum**: Gasless transactions with sponsored gas fees
* **Polygon**: Gasless transactions with sponsored gas fees  
* **Arbitrum**: Gasless transactions with sponsored gas fees
* **TON**: Native transfers

### Customize the UI

This starter uses components from the [WDK React Native UI Kit](../ui-kits/react-native-ui-kit/README.md). To customize the look and feel of the app, check the [Theming](../ui-kits/react-native-ui-kit/theming.md) documentation.

### **Need more help?**

{% include "../.gitbook/includes/support-cards.md" %}
