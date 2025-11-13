---
title: React Native Quickstart
description: Get started with WDK in React Native in under 3 minutes
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

In this quickstart, you'll integrate WDK into a React Native app to create a multi-chain wallet that:

- [ ] Supports multiple blockchains (Bitcoin, Ethereum, Polygon, Arbitrum, TON, Tron, Solana)
- [ ] Manages multiple tokens (BTC, USD₮, XAU₮, and more)
- [ ] Provides secure seed generation and encrypted storage
- [ ] Shows real-time balances and transaction history
- [ ] Includes wallet creation, import, and unlock flows

---

## Prerequisites

Before we start, make sure you have:

| Tool             | Version | Why You Need It             |
| ---------------- | ------- | --------------------------- |
| **Node.js**      | 22+     | To run JavaScript code      |
| **npm**          | Latest  | To install packages         |
| **React Native** | 0.81.0+ | Framework version           |
| **Android SDK**  | API 29+ | Android minimum SDK version |
| **iOS**          | 15.1+   | iOS deployment target       |
| **Code Editor**  | Any     | To write code               |

---

## Quick Start Paths

You have 2 options for using WDK in a React Native. Choose your preferred starting point:

{% tabs %}
{% tab title="Use Starter Template (Fastest)" %}
Get up and running in 3 minutes with our pre-configured starter template.

[**→ Jump to Starter Template Setup**](#option-1-starter-template-recommended)
{% endtab %}

{% tab title="Add to Existing App" %}
Integrate WDK into your existing React Native or Expo app.

[**→ Jump to Library Integration**](#option-2-add-to-existing-app)
{% endtab %}
{% endtabs %}

---

## Option 1: Starter Template

The fastest way to get started is with our starter template. Note: this is still in alpha, and may be subject to breaking changes.

### Step 1: Clone the Starter

```bash
git clone https://github.com/tetherto/wdk-starter-react-native.git
cd wdk-starter-react-native
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment

Create an environment file for the WDK Indexer API:

```bash
cp .env.example .env
```

Edit `.env` and add your WDK Indexer API key:

```bash
# Replace with your actual API key
EXPO_PUBLIC_WDK_INDEXER_API_KEY=your_actual_api_key_here
EXPO_PUBLIC_WDK_INDEXER_URL=https://your-indexer-url.com
```

{% hint style="info" %}
Get your free WDK Indexer API key [here](../tools/indexer-api/get-started.md)
{% endhint %}

### Step 4: Run Your App

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

**Congratulations!** You now have a multi-chain wallet running.

[**→ Skip to What's Next**](#whats-next)

---

## Option 2: Add to Existing App

Integrate WDK into your existing React Native or Expo project.

### Step 1: Install the Provider Library

```bash
npm install @tetherto/wdk-react-native-provider
```

### Step 2: Install Peer Dependencies

The library requires several peer dependencies for cryptographic operations and blockchain interactions:

```bash
npm install \
  @craftzdog/react-native-buffer \
  @react-native-async-storage/async-storage \
  @tetherto/pear-wrk-wdk \
  @tetherto/wdk-secret-manager \
  b4a \
  bip39 \
  browserify-zlib \
  decimal.js \
  events \
  http2-wrapper \
  https-browserify \
  nice-grpc-web \
  path-browserify \
  process \
  querystring-es3 \
  react-native-bare-kit \
  react-native-crypto \
  react-native-device-info \
  react-native-get-random-values \
  react-native-keychain \
  react-native-tcp-socket \
  react-native-url-polyfill \
  sodium-javascript \
  stream-browserify \
  stream-http
```

### Step 3: Configure Android minSdkVersion

The library requires **Android API 29** or higher to support `react-native-bare-kit`.

{% tabs %}
{% tab title="Expo Projects" %}
Add to your `app.json` or `app.config.js`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            "minSdkVersion": 29
          }
        }
      ]
    ]
  }
}
```

If you haven't installed `expo-build-properties`:

```bash
npx expo install expo-build-properties
```

{% endtab %}

{% tab title="Bare React Native" %}
Update `android/build.gradle`:

```gradle
buildscript {
    ext {
        minSdkVersion = 29
        // ... other config
    }
}
```

{% endtab %}
{% endtabs %}

### Step 4: Configure Metro Bundler

The library requires Node.js core module polyfills. Update your `metro.config.js`:

{% tabs %}
{% tab title="Expo" %}

```js
const { getDefaultConfig } = require("expo/metro-config");
const {
  configureMetroForWDK,
} = require("@tetherto/wdk-react-native-provider/metro-polyfills");

const config = getDefaultConfig(__dirname);
const configWdk = configureMetroForWDK(config);

module.exports = configWdk;
```

{% endtab %}

{% tab title="Bare React Native" %}

```js
const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");
const {
  configureMetroForWDK,
} = require("@tetherto/wdk-react-native-provider/metro-polyfills");

const config = getDefaultConfig(__dirname);
const configWdk = configureMetroForWDK(config);

module.exports = mergeConfig(config, configWdk);
```

{% endtab %}
{% endtabs %}

{% hint style="success" %}
Runtime polyfills for Buffer, process, and crypto are automatically initialized when you import the library. No additional setup needed!
{% endhint %}

### Step 5: Configure Chain Settings

Create a configuration file for your supported blockchains (e.g., `src/config/chains.ts`):

```typescript
// src/config/chains.ts
export const CHAINS_CONFIG = {
  ethereum: {
    chainId: 1,
    blockchain: "ethereum",
    provider: "https://mainnet.gateway.tenderly.co/YOUR_KEY",
    bundlerUrl: "https://api.candide.dev/public/v3/ethereum",
    paymasterUrl: "https://api.candide.dev/public/v3/ethereum",
    paymasterAddress: "0x8b1f6cb5d062aa2ce8d581942bbb960420d875ba",
    entrypointAddress: "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
    transferMaxFee: 5000000,
    swapMaxFee: 5000000,
    bridgeMaxFee: 5000000,
    paymasterToken: {
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT
    },
  },
  polygon: {
    chainId: 137,
    blockchain: "polygon",
    provider: "https://polygon.gateway.tenderly.co/YOUR_KEY",
    bundlerUrl: "https://api.candide.dev/public/v3/polygon",
    paymasterUrl: "https://api.candide.dev/public/v3/polygon",
    paymasterAddress: "0x8b1f6cb5d062aa2ce8d581942bbb960420d875ba",
    entrypointAddress: "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
    transferMaxFee: 5000000,
    swapMaxFee: 5000000,
    bridgeMaxFee: 5000000,
    paymasterToken: {
      address: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f", // USDT on Polygon
    },
    safeModulesVersion: "0.3.0",
  },
  bitcoin: {
    host: "api.ordimint.com",
    port: 50001,
  },
  // Add more chains as needed
};
```

{% hint style="info" %}
See the [Chain Configuration Guide](../core-concepts/chain-configuration.md) for complete configuration options for all supported chains.
{% endhint %}

### Step 6: Add WalletProvider

Wrap your app with the `WalletProvider` to enable wallet functionality throughout your app.

{% tabs %}
{% tab title="Expo Router" %}
Add to your `app/_layout.tsx`:

```tsx
// app/_layout.tsx
import { WalletProvider } from "@tetherto/wdk-react-native-provider";
import { Stack } from "expo-router";
import { CHAINS_CONFIG } from "../config/chains";

export default function RootLayout() {
  return (
    <WalletProvider
      config={{
        indexer: {
          apiKey: process.env.EXPO_PUBLIC_WDK_INDEXER_API_KEY!,
          url: process.env.EXPO_PUBLIC_WDK_INDEXER_URL!,
        },
        chains: CHAINS_CONFIG,
        enableCaching: true,
      }}
    >
      <Stack />
    </WalletProvider>
  );
}
```

{% endtab %}

{% tab title="Standard React Native" %}
Update your `App.tsx`:

```tsx
// App.tsx
import React from "react";
import { WalletProvider } from "@tetherto/wdk-react-native-provider";
import { CHAINS_CONFIG } from "./src/config/chains";
import { NavigationContainer } from "@react-navigation/native";
import { MainNavigator } from "./src/navigation";

export default function App() {
  return (
    <WalletProvider
      config={{
        indexer: {
          apiKey: process.env.EXPO_PUBLIC_WDK_INDEXER_API_KEY!,
          url: process.env.EXPO_PUBLIC_WDK_INDEXER_URL!,
        },
        chains: CHAINS_CONFIG,
        enableCaching: true,
      }}
    >
      <NavigationContainer>
        <MainNavigator />
      </NavigationContainer>
    </WalletProvider>
  );
}
```

{% endtab %}
{% endtabs %}

### Step 7: Use the Wallet Hook

Now you can use the `useWallet` hook in any component to access wallet functionality:

```tsx
// src/screens/WalletScreen.tsx
import React from "react";
import { View, Text, Button } from "react-native";
import { useWallet } from "@tetherto/wdk-react-native-provider";

export function WalletScreen() {
  const {
    wallet,
    balances,
    transactions,
    isInitialized,
    isUnlocked,
    createWallet,
    unlockWallet,
    refreshWalletBalance,
  } = useWallet();

  // Create a new wallet
  const handleCreateWallet = async () => {
    try {
      const wallet = await createWallet({
        name: "Imported Wallet",
        mnemonic: "your twelve word seed phrase goes here",
      });
      console.log("Wallet created:", wallet);
    } catch (error) {
      console.error("Failed to create wallet:", error);
    }
  };

  // Unlock wallet
  const handleUnlockWallet = async () => {
    try {
      await unlockWallet();
      console.log("Wallet unlocked");
    } catch (error) {
      console.error("Failed to unlock wallet:", error);
    }
  };

  if (!isInitialized) {
    return <Text>Initializing WDK...</Text>;
  }

  if (!wallet) {
    return (
      <View>
        <Text>Create or Import a Wallet</Text>
        <Button title="Create New Wallet" onPress={handleCreateWallet} />
        <Button title="Import Wallet" onPress={handleImportWallet} />
      </View>
    );
  }

  if (!isUnlocked) {
    return (
      <View>
        <Text>Wallet Locked</Text>
        <Button title="Unlock Wallet" onPress={handleUnlockWallet} />
      </View>
    );
  }

  return (
    <View>
      <Text>Wallet: {wallet.name}</Text>
      {/* Display balances */}
      {balances.list.map((balance, index) => (
        <Text key={index}>
          {balance.denomination}: {balance.value}
        </Text>
      ))}

      <Button
        title="Refresh Balance"
        onPress={refreshWalletBalance}
        disabled={balances.isLoading}
      />

      {balances.isLoading && <Text>Loading balances...</Text>}
    </View>
  );
}
```

### Step 8: Rebuild and Run

{% tabs %}
{% tab title="Expo" %}
For Expo projects, run prebuild to apply native changes:

```bash
npx expo prebuild --clean
npx expo run:ios
# or
npx expo run:android
```

{% endtab %}

{% tab title="Bare React Native" %}
Rebuild your native apps:

```bash
npx react-native run-ios
# or
npx react-native run-android
```

{% endtab %}
{% endtabs %}

**Congratulations!** You've successfully integrated WDK into your React Native app!

---

## What's Next?

Now that you have WDK integrated, here's what you can explore:

### Access Balances and Transactions

```tsx
const { balances, transactions, addresses } = useWallet();
...
```

### Send Transactions

Use the `WDKService` directly for advanced operations:

```tsx
import {
  WDKService,
  NetworkType,
  AssetTicker,
} from "@tetherto/wdk-react-native-provider";

// Send USDT on Ethereum
const result = await WDKService.sendByNetwork(
  NetworkType.ETHEREUM,
  0, // account index
  100, // amount
  "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", // recipient
  AssetTicker.USDT
);
```

### Quote Transaction Fees

```tsx
// Get fee estimate before sending
const feeEstimate = await WDKService.quoteSendByNetwork(
  NetworkType.ETHEREUM,
  0,
  100,
  "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  AssetTicker.USDT
);

console.log("Estimated fee:", feeEstimate);
```

### Clear Wallet Data

Call `clearWallet()` to securely wipe all sensitive data and secret keys from memory when you're done with wallet operations.

```tsx
const { clearWallet } = useWallet();

// Clear wallet and all stored data
await clearWallet();
```

---

## Troubleshooting

### "Unable to resolve module" errors

If you see errors about missing Node.js modules like `stream`, `buffer`, or `crypto`:

1. Ensure Metro polyfills are configured correctly
2. Clear Metro cache: `npx expo start --clear` or `npx react-native start --reset-cache`
3. Delete and reinstall dependencies:
   ```bash
   rm -rf node_modules
   npm install
   ```

### Android build fails with "Execution failed for task ':app:checkDebugAarMetadata'"

This means your minSdkVersion is too low. Make sure you've set it to 29:


```json
{
  "expo": {
    "plugins": [
      ["expo-build-properties", { "android": { "minSdkVersion": 29 } }]
    ]
  }
}
```

Then rebuild:

```bash
npx expo prebuild --clean
npx expo run:android
```

### "WDK Manager not initialized"

The WDK service initializes automatically when `WalletProvider` mounts. Ensure:

1. Your component is wrapped with `WalletProvider`
2. You're checking `isInitialized` before performing wallet operations:

```tsx
const { isInitialized, createWallet } = useWallet();

if (isInitialized) {
  await createWallet({ name: "My Wallet" });
}
```

### TypeScript errors about missing types

Some peer dependencies may lack type definitions. Add to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "skipLibCheck": true
  }
}
```

### Complete Setup Checklist

**For Expo projects:**

- ✅ Install `@tetherto/wdk-react-native-provider` and peer dependencies
- ✅ Configure Android minSdkVersion to 29 in `app.json`
- ✅ Configure Metro polyfills in `metro.config.js`
- ✅ Add `WalletProvider` to `app/_layout.tsx`
- ✅ Use `useWallet()` hook in components
- ✅ Run `npx expo prebuild --clean` before building

**For bare React Native:**

- ✅ Install package and peer dependencies
- ✅ Set minSdkVersion to 29 in `android/build.gradle`
- ✅ Configure Metro polyfills in `metro.config.js`
- ✅ Wrap root component with `WalletProvider`
- ✅ Rebuild native code

---

## Learn More

Ready to dive deeper? Check out these resources:

### Core Concepts

- [**Chain Configuration**](../core-concepts/chain-configuration.md) - Configure blockchain networks
- [**Wallet Management**](../core-concepts/wallet-management.md) - Create, import, and manage wallets
- [**Transaction Handling**](../core-concepts/transactions.md) - Send and track transactions

### Examples & Starters

- [**React Native Starter**](../examples-and-starters/react-native-starter.md) - Full-featured starter app
- [**React Native UI Kit**](../ui-kits/react-native-ui-kit/) - Pre-built wallet components

### API Reference

- [**WalletProvider API**](../api-reference/wallet-provider.md) - Provider configuration and props
- [**useWallet Hook**](../api-reference/use-wallet-hook.md) - Hook API reference
- [**WDKService API**](../api-reference/wdk-service.md) - Low-level service methods

### **Need Help?**

{% include "../.gitbook/includes/support-cards.md" %}
