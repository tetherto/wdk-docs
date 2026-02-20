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

Integrate WDK into your existing React Native or Expo project using `@tetherto/wdk-react-native-core`.

### Step 1: Install the Core Library

```bash
npm install @tetherto/wdk-react-native-core
```

{% hint style="info" %}
`@tetherto/wdk-react-native-core` replaces the deprecated `@tetherto/wdk-react-native-provider`. It uses a hooks-based architecture (Zustand + TanStack Query) with no Node.js polyfills required.
{% endhint %}

### Step 2: Install Dependencies

The library bundles most of its dependencies, but requires the following native and peer packages:

```bash
npm install \
  react-native-bare-kit \
  react-native-mmkv \
  expo-crypto \
  @tanstack/react-query \
  zustand \
  immer \
  zod \
  @tetherto/wdk-react-native-secure-storage \
  @tetherto/pear-wrk-wdk
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

### Step 4: Configure the Bundle

The WDK engine runs inside a Bare worklet. You need to provide a bundle — choose one of two approaches:

{% tabs %}
{% tab title="Pre-built Bundle (Recommended)" %}
Import the ready-made bundle directly from `@tetherto/pear-wrk-wdk` (already installed in Step 2):

```typescript
import { bundle } from '@tetherto/pear-wrk-wdk'
```

This includes all supported networks and protocols. No additional setup required.

{% endtab %}

{% tab title="Custom Bundle" %}
Use the `@tetherto/wdk-worklet-bundler` CLI to generate a custom bundle with only the modules you need:

```bash
npx @tetherto/wdk-worklet-bundler
```

This generates a `.wdk-bundle/` directory in your project. Import it:

```typescript
import { bundle } from './.wdk-bundle'
```

{% endtab %}
{% endtabs %}

### Step 5: Configure WDK Settings

Create a configuration file for your WDK setup (e.g., `src/config/wdk.ts`):

```typescript
// src/config/wdk.ts
import type { WdkConfigs } from '@tetherto/wdk-react-native-core'

export const wdkConfigs: WdkConfigs = {
  indexer: {
    url: process.env.EXPO_PUBLIC_WDK_INDEXER_BASE_URL!,
    apiKey: process.env.EXPO_PUBLIC_WDK_INDEXER_API_KEY!,
  },
  networks: {
    ethereum: {
      blockchain: 'ethereum',
      config: {
        chainId: 1,
        provider: 'https://mainnet.gateway.tenderly.co/YOUR_KEY',
        bundlerUrl: 'https://api.candide.dev/public/v3/ethereum',
        paymasterUrl: 'https://api.candide.dev/public/v3/ethereum',
        paymasterAddress: '0x8b1f6cb5d062aa2ce8d581942bbb960420d875ba',
        entrypointAddress: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
        transferMaxFee: 5000000,
        paymasterToken: {
          address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
        },
      },
    },
    bitcoin: {
      blockchain: 'bitcoin',
      config: {
        host: 'api.ordimint.com',
        port: 50001,
      },
    },
    // Add more networks as needed
  },
}
```

{% hint style="info" %}
See the [Chain Configuration Guide](../sdk/core-module/configuration.md) for complete configuration options for all supported chains.
{% endhint %}

### Step 6: Add WdkAppProvider

Wrap your app with `WdkAppProvider` to enable wallet functionality throughout your app.

{% tabs %}
{% tab title="Expo Router" %}
Add to your `app/_layout.tsx`:

```tsx
// app/_layout.tsx
import { WdkAppProvider } from '@tetherto/wdk-react-native-core'
import { bundle } from '@tetherto/pear-wrk-wdk'
import { Stack } from 'expo-router'
import { wdkConfigs } from '../config/wdk'

export default function RootLayout() {
  return (
    <WdkAppProvider
      bundle={{ bundle }}
      wdkConfigs={wdkConfigs}
      currentUserId={currentUser?.email}
    >
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
import { bundle } from '@tetherto/pear-wrk-wdk'
import { NavigationContainer } from '@react-navigation/native'
import { MainNavigator } from './src/navigation'
import { wdkConfigs } from './src/config/wdk'

export default function App() {
  return (
    <WdkAppProvider
      bundle={{ bundle }}
      wdkConfigs={wdkConfigs}
      currentUserId={currentUser?.email}
    >
      <NavigationContainer>
        <MainNavigator />
      </NavigationContainer>
    </WdkAppProvider>
  )
}
```

{% endtab %}
{% endtabs %}

### Step 7: Use Hooks

Now you can use the WDK hooks in any component inside `WdkAppProvider`:

```tsx
// src/screens/WalletScreen.tsx
import React from 'react'
import { View, Text, Button } from 'react-native'
import {
  useWdkApp,
  useWalletManager,
  useAccount,
  useBalance,
  BaseAsset,
  AppStatus,
} from '@tetherto/wdk-react-native-core'

// Define your assets
const usdt = new BaseAsset({
  id: 'usdt-ethereum',
  network: 'ethereum',
  symbol: 'USDT',
  name: 'Tether USD',
  decimals: 6,
  isNative: false,
  address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
})

export function WalletScreen() {
  const { status, isReady, error, retry } = useWdkApp()
  const { createWallet, unlock, lock } = useWalletManager()
  const account = useAccount({ network: 'ethereum', accountIndex: 0 })
  const { data: balance } = useBalance('ethereum', 0, usdt, {
    enabled: isReady,
  })

  // Handle app initialization states
  if (status === AppStatus.ERROR) {
    return (
      <View>
        <Text>Error: {error?.message}</Text>
        <Button title="Retry" onPress={retry} />
      </View>
    )
  }

  if (!isReady) {
    return <Text>Initializing WDK...</Text>
  }

  // Create a new wallet
  const handleCreateWallet = async () => {
    try {
      await createWallet('user@example.com')
      console.log('Wallet created')
    } catch (err) {
      console.error('Failed to create wallet:', err)
    }
  }

  // Unlock wallet (triggers biometric prompt)
  const handleUnlock = async () => {
    try {
      await unlock()
      console.log('Wallet unlocked')
    } catch (err) {
      console.error('Failed to unlock:', err)
    }
  }

  return (
    <View>
      {account && <Text>Address: {account.address}</Text>}

      {balance?.success && (
        <Text>USDT Balance: {balance.balance}</Text>
      )}

      <Button title="Create Wallet" onPress={handleCreateWallet} />
      <Button title="Unlock" onPress={handleUnlock} />
      <Button title="Lock" onPress={lock} />
    </View>
  )
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
  const account = useAccount({ network: 'ethereum', accountIndex: 0 })

  const handleSend = async () => {
    if (!account) return

    const result = await account.send({
      to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      asset: usdt,
      amount: '1000000', // 1 USDT (6 decimals)
    })
    console.log('TX hash:', result.hash, 'Fee:', result.fee)
  }

  return <Button title="Send 1 USDT" onPress={handleSend} />
}
```

### Lock the Wallet

Use `lock()` to clear sensitive data from memory — replaces the old `clearWallet()`:

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

### "useWdkApp must be used within WdkAppProvider"

Ensure your component is rendered inside `WdkAppProvider`. The provider must be at the root of your component tree:

```tsx
// ✅ Correct
<WdkAppProvider bundle={{ bundle }} wdkConfigs={configs}>
  <MyComponent />  {/* Can use useWdkApp() here */}
</WdkAppProvider>

// ❌ Wrong — hook used outside provider
<MyComponent />  {/* Cannot use useWdkApp() here */}
<WdkAppProvider bundle={{ bundle }} wdkConfigs={configs}>
  ...
</WdkAppProvider>
```

### Metro cache issues

If you see stale module errors after upgrading, clear the Metro cache:

```bash
npx expo start --clear
# or
npx react-native start --reset-cache
```

### TypeScript errors about missing types

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

- ✅ Install `@tetherto/wdk-react-native-core` and dependencies
- ✅ Configure Android minSdkVersion to 29 in `app.json`
- ✅ Set up bundle (pre-built or custom)
- ✅ Create `WdkConfigs` configuration
- ✅ Add `WdkAppProvider` to `app/_layout.tsx`
- ✅ Use hooks (`useWdkApp`, `useWalletManager`, `useAccount`, `useBalance`)
- ✅ Run `npx expo prebuild --clean` before building

**For bare React Native:**

- ✅ Install package and dependencies
- ✅ Set minSdkVersion to 29 in `android/build.gradle`
- ✅ Set up bundle (pre-built or custom)
- ✅ Create `WdkConfigs` configuration
- ✅ Wrap root component with `WdkAppProvider`
- ✅ Rebuild native code

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
