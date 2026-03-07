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

- [ ] Supports multiple blockchains (Bitcoin, Ethereum, Polygon, Arbitrum, TON, Tron)
- [ ] Manages multiple tokens (BTC, USD₮, XAU₮, and more)
- [ ] Provides secure seed generation and encrypted storage
- [ ] Shows real-time balances and transaction history
- [ ] Includes wallet creation, import, and unlock flows

{% hint style="info" %}
You can try all features without real funds required. You can use the Pimlico or Candide faucets to get some Sepolia USD₮.

<a class="button primary" href="https://dashboard.pimlico.io/test-erc20-faucet"> Get mock/test USD₮ on Pimlico </a>
<a class="button primary" href="https://dashboard.candide.dev/faucet"> Get mock/test USD₮ on Candide </a>

See the [configuration.md](../sdk/wallet-modules/wallet-evm-erc-4337/configuration.md) for quick setup and Sepolia testnet configuration.
{% endhint %}

{% hint style="info" %}
**Want to build faster?** Connect your AI coding assistant to WDK docs for context-aware help. [Learn how →](build-with-ai.md)
{% endhint %}


## Prerequisites

Before we start, make sure you have:

| Tool             | Version | Why You Need It             |
| ---------------- | ------- | --------------------------- |
| **Node.js**      | 22+     | To run JavaScript code      |
| **npm**          | Latest  | To install packages         |
| **React Native** | 0.81.0+ | Framework version           |
| **Android SDK**  | API 29+ | Android minimum SDK version |
| **iOS**          | 15.1+   | iOS deployment target       |

---

## Quick Start Paths

You have 2 options for using WDK in a React Native. Choose your preferred starting point:

{% tabs %}
{% tab title="Use Starter Template (Fastest)" %}
Get up and running in 3 minutes with our pre-configured starter template.

[**→ Jump to Starter Template Setup**](#option-1-starter-template)
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
EXPO_PUBLIC_WDK_INDEXER_BASE_URL=https://wdk-api.tether.io
EXPO_PUBLIC_WDK_INDEXER_API_KEY=your_actual_api_key_here
# Optional: For Tron network support
EXPO_PUBLIC_TRON_API_KEY=your_tron_api_key
EXPO_PUBLIC_TRON_API_SECRET=your_tron_api_secret
```

{% hint style="info" %}
**Where do I get an Indexer API key?** The WDK Indexer is required for transaction history and balance indexing. Get your free API key from the [Indexer API setup guide](../tools/indexer-api/get-started.md).
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

Integrate WDK into your existing React Native or Expo project using `@tetherto/wdk-react-native-core`.

### Step 1: Install

```bash
npm install @tetherto/wdk-react-native-core
```

### Step 2: Configure Android minSdkVersion

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

### Step 3: Configure the Bundle

The WDK engine runs inside a Bare worklet. You need to provide a bundle - choose one of two approaches:

{% tabs %}
{% tab title="Custom Bundle (Recommended)" %}
Use the `@tetherto/wdk-worklet-bundler` CLI to generate a bundle with only the modules you need:

```bash
# 1. Install the bundler CLI
npm install -g @tetherto/wdk-worklet-bundler

# 2. Initialize configuration in your React Native project
wdk-worklet-bundler init

# 3. Edit wdk.config.js to configure your networks (see example below)

# 4. Install required WDK modules (pick the ones you need)
npm install @tetherto/wdk @tetherto/wdk-wallet-evm-erc-4337

# 5. Generate the bundle
wdk-worklet-bundler generate
```

This generates a `.wdk/` directory in your project. Import it:

```typescript
import { bundle } from './.wdk'
```

{% hint style="info" %}
**Which WDK modules do I need?** Each blockchain requires its own wallet module (e.g., `wdk-wallet-evm-erc-4337` for Ethereum/Polygon, `wdk-wallet-btc` for Bitcoin). See the full list of available modules in the [wdk-worklet-bundler documentation](https://github.com/tetherto/wdk-worklet-bundler).
{% endhint %}

{% endtab %}

{% tab title="Pre-built Bundle" %}
For quick prototyping, install and import the ready-made bundle from `@tetherto/pear-wrk-wdk`:

```bash
npm install @tetherto/pear-wrk-wdk
```

```typescript
import { bundle } from '@tetherto/pear-wrk-wdk'
```

{% hint style="info" %}
The pre-built bundle includes all blockchain modules, resulting in a larger bundle size. For production apps, generate a custom bundle with only the modules you need.
{% endhint %}

{% endtab %}
{% endtabs %}

### Step 4: Configure WDK Settings

Create a configuration file for your WDK setup (e.g., `src/config/wdk.ts`):

```typescript
// src/config/wdk.ts
import type { WdkConfigs } from '@tetherto/wdk-react-native-core'

export const wdkConfigs: WdkConfigs = {
  indexer: {
    url: 'https://wdk-api.tether.io',
    apiKey: 'YOUR_INDEXER_API_KEY',
  },
  networks: {
    ethereum: {
      blockchain: 'ethereum',
      config: {
        chainId: 11155111, // Sepolia testnet
        provider: 'https://rpc.sepolia.org',
        bundlerUrl: 'https://api.candide.dev/public/v3/sepolia',
        paymasterUrl: 'https://api.candide.dev/public/v3/sepolia',
        paymasterAddress: '0x8b1f6cb5d062aa2ce8d581942bbb960420d875ba',
        entrypointAddress: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
        transferMaxFee: 5000000,
        paymasterToken: {
          address: '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0', // USDT on Sepolia
        },
      },
    },
    // Add more networks as needed
  },
}
```

{% hint style="info" %}
**Where do I get an Indexer API key?** The WDK Indexer is required for transaction history and balance indexing. Get your free API key from the [Indexer API setup guide](../tools/indexer-api/get-started.md).
{% endhint %}

{% hint style="info" %}
This example uses **Sepolia testnet** with a free public RPC so you can start immediately without API keys. For production or mainnet configuration, see the [Chain Configuration Guide](../sdk/core-module/configuration.md).
{% endhint %}

### Step 5: Add WdkAppProvider

Wrap your app with `WdkAppProvider` to enable wallet functionality throughout your app.

{% tabs %}
{% tab title="Expo Router" %}
Add to your `app/_layout.tsx`:

```tsx
// app/_layout.tsx
import { WdkAppProvider } from '@tetherto/wdk-react-native-core'
import { bundle } from './.wdk'
import { Stack } from 'expo-router'
import { wdkConfigs } from '../config/wdk'

export default function RootLayout() {
  return (
    <WdkAppProvider bundle={{ bundle }} wdkConfigs={wdkConfigs}>
      <Stack />
    </WdkAppProvider>
  )
}
```

{% endtab %}

{% tab title="Standard React Native" %}
Update your `App.tsx`:

```tsx
// App.tsx
import React from 'react'
import { WdkAppProvider } from '@tetherto/wdk-react-native-core'
import { bundle } from './.wdk'
import { NavigationContainer } from '@react-navigation/native'
import { MainNavigator } from './src/navigation'
import { wdkConfigs } from './src/config/wdk'

export default function App() {
  return (
    <WdkAppProvider bundle={{ bundle }} wdkConfigs={wdkConfigs}>
      <NavigationContainer>
        <MainNavigator />
      </NavigationContainer>
    </WdkAppProvider>
  )
}
```

{% endtab %}
{% endtabs %}

### Step 6: Use Hooks

Now you can use the WDK hooks in any component inside `WdkAppProvider`:

```tsx
import { useWdkApp, useWalletManager, useAccount } from '@tetherto/wdk-react-native-core'

function WalletScreen() {
  const { state } = useWdkApp()
  const { createWallet, unlock } = useWalletManager()
  const { address } = useAccount({ network: 'ethereum', accountIndex: 0 })

  switch (state.status) {
    case 'INITIALIZING':
      return <Text>Loading...</Text>
    case 'NO_WALLET':
      return <Button title="Create Wallet" onPress={() => createWallet('my-wallet')} />
    case 'LOCKED':
      return <Button title="Unlock" onPress={() => unlock()} />
    case 'READY':
      return <Text>Address: {address}</Text>
    case 'ERROR':
      return <Text>Error: {state.error.message}</Text>
  }
}
```

For the full list of available hooks and their parameters, see the [React Native Core API Reference](../tools/react-native-core/api-reference.md).

### Step 7: Rebuild and Run

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

### Send Transactions

Use the `useAccount()` hook to send transactions:

```tsx
import { useAccount, BaseAsset } from '@tetherto/wdk-react-native-core'

const usdt = new BaseAsset({
  id: 'usdt-ethereum',
  network: 'ethereum',
  symbol: 'USDT',
  name: 'Tether USD',
  decimals: 6,
  isNative: false,
  address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
})

function SendScreen() {
  const { address, send } = useAccount({ network: 'ethereum', accountIndex: 0 })

  const handleSend = async () => {
    if (!address) return

    const result = await send({
      to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      asset: usdt,
      amount: '1000000', // 1 USDT (6 decimals)
    })

    if (result.success) {
      console.log('TX hash:', result.hash, 'Fee:', result.fee)
    } else {
      console.error('TX failed:', result.error)
    }
  }

  return <Button title="Send 1 USDT" onPress={handleSend} />
}
```

### Lock the Wallet

Use `lock()` to clear sensitive data from memory:

```tsx
const { lock } = useWalletManager()

// Lock wallet and clear all sensitive data
lock()
```

### Refresh Balances

```tsx
import { useRefreshBalance } from '@tetherto/wdk-react-native-core'

const { mutate: refreshBalance } = useRefreshBalance()

// Refresh all balances for account 0
refreshBalance({ accountIndex: 0, type: 'wallet' })
```

---

## Troubleshooting

**Android build fails with "Execution failed for task ':app:checkDebugAarMetadata'"**

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

**"useWdkApp must be used within WdkAppProvider"**

Ensure your component is rendered inside `WdkAppProvider`. The provider must be at the root of your component tree:

```tsx
// Correct
<WdkAppProvider bundle={{ bundle }} wdkConfigs={configs}>
  <MyComponent />  {/* Can use useWdkApp() here */}
</WdkAppProvider>

// Wrong - hook used outside provider
<MyComponent />  {/* Cannot use useWdkApp() here */}
<WdkAppProvider bundle={{ bundle }} wdkConfigs={configs}>
  ...
</WdkAppProvider>
```

**Biometric prompt not appearing on simulator**

Biometric authentication is required by default. On iOS Simulator, enable Face ID via `Features > Face ID > Enrolled`. On Android Emulator, set up a fingerprint in `Settings > Security`. To disable biometrics during development, pass `requireBiometrics={false}` to `WdkAppProvider`.

**Metro cache issues**

If you see stale module errors after upgrading, clear the Metro cache:

```bash
npx expo start --clear
# or
npx react-native start --reset-cache
```

**TypeScript errors about missing types**

Some native dependencies may lack type definitions. Add to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "skipLibCheck": true
  }
}
```

### Complete Setup Checklist

**For Expo projects:**

- Install `@tetherto/wdk-react-native-core`
- Configure Android minSdkVersion to 29 in `app.json`
- Set up bundle (custom or pre-built)
- Create `WdkConfigs` configuration
- Add `WdkAppProvider` to `app/_layout.tsx`
- Use hooks (`useWdkApp`, `useWalletManager`, `useAccount`, `useBalance`)
- Run `npx expo prebuild --clean` before building

**For bare React Native:**

- Install package
- Set minSdkVersion to 29 in `android/build.gradle`
- Set up bundle (custom or pre-built)
- Create `WdkConfigs` configuration
- Wrap root component with `WdkAppProvider`
- Rebuild native code

---

## Learn More

Ready to dive deeper? Check out these resources:

### Core Concepts

- [**React Native Core Docs**](../tools/react-native-core/) - Full documentation for `@tetherto/wdk-react-native-core`
- [**API Reference**](../tools/react-native-core/api-reference.md) - Complete hook and type reference
- [**Chain Configuration**](../sdk/core-module/configuration.md#wallet-configuration) - Configure blockchain networks

### Examples & Starters

- [**React Native Starter**](../examples-and-starters/react-native-starter.md) - Full-featured starter app
- [**React Native UI Kit**](../ui-kits/react-native-ui-kit/) - Pre-built wallet components

### **Need Help?**

{% include "../.gitbook/includes/support-cards.md" %}
