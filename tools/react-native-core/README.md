---
title: React Native Core
description: Hooks-based React Native library for building multi-chain wallet apps with WDK
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

# React Native Core

`@tetherto/wdk-react-native-core` is the React Native integration layer for WDK. It provides a hooks-based API for wallet management, balance fetching, account operations, and worklet lifecycle — all built on Zustand and TanStack Query.

This package replaces the deprecated `@tetherto/wdk-react-native-provider` with a modern, modular architecture.

## Features

- **Hooks-based architecture** — `useWdkApp`, `useWalletManager`, `useAccount`, `useBalance`, and more
- **TanStack Query caching** — automatic balance fetching, stale time management, cache invalidation, and optimistic updates
- **Zustand state management** — persisted wallet state with MMKV storage, survives app restarts
- **Worklet runtime** — runs WDK in an isolated Bare worklet via `react-native-bare-kit`
- **Biometric authentication** — secure storage with device biometrics via `@tetherto/wdk-react-native-secure-storage`
- **Multi-wallet support** — create, restore, switch, lock, unlock, and delete wallets
- **TypeScript-first** — full type safety with exported types and interfaces

## Architecture

```
WdkAppProvider
├── QueryClientProvider (TanStack Query)
├── Worklet Runtime (react-native-bare-kit)
│   └── WDK engine (runs in isolated Bare worklet)
├── Zustand Stores
│   ├── workletStore — worklet lifecycle, initialization state
│   └── walletStore — addresses, balances, wallet list (persisted to MMKV)
└── Hooks (public API)
    ├── useWdkApp()         — app state (INITIALIZING, NO_WALLET, LOCKED, READY, ERROR)
    ├── useWalletManager()  — create, restore, lock, unlock, delete wallets
    ├── useAccount()        — address, send, sign, verify, estimateFee
    ├── useAddresses()      — load and query addresses
    ├── useBalance()        — single balance with TanStack Query
    ├── useBalancesForWallet() — bulk balance fetch
    └── useRefreshBalance() — invalidate and refetch balances
```

## Bundle Configuration

The WDK engine runs inside a Bare worklet. You need to provide a bundle — there are two approaches:

### Custom Bundle (Recommended)

Use the `@tetherto/wdk-worklet-bundler` CLI to generate a custom bundle with only the modules you need:

```bash
# Install the bundler
npm install -g @tetherto/wdk-worklet-bundler

# Initialize and configure
wdk-worklet-bundler init

# Generate the bundle
wdk-worklet-bundler generate
```

This generates a `.wdk/` directory in your project:

```typescript
import { bundle } from './.wdk'

<WdkAppProvider bundle={{ bundle }} wdkConfigs={configs}>
  <App />
</WdkAppProvider>
```

For full bundler documentation, see [wdk-worklet-bundler](https://github.com/tetherto/wdk-worklet-bundler).

### Pre-built Bundle

For quick prototyping, use the pre-built bundle from `@tetherto/pear-wrk-wdk` which includes all blockchain modules:

```typescript
import { bundle } from '@tetherto/pear-wrk-wdk'

<WdkAppProvider bundle={{ bundle }} wdkConfigs={configs}>
  <App />
</WdkAppProvider>
```

{% hint style="info" %}
The pre-built bundle includes all blockchain modules, resulting in a larger bundle size. For production apps, generate a custom bundle with only the modules you need.
{% endhint %}

## Quick Start

### 1. Install

```bash
npm install @tetherto/wdk-react-native-core
```

### 2. Wrap Your App

```tsx
import { WdkAppProvider } from '@tetherto/wdk-react-native-core'
import { bundle } from './.wdk'

export default function App() {
  return (
    <WdkAppProvider bundle={{ bundle }} wdkConfigs={configs}>
      <YourApp />
    </WdkAppProvider>
  )
}
```

### 3. Use Hooks

```tsx
import { useWdkApp, useWalletManager, useAccount } from '@tetherto/wdk-react-native-core'

function WalletScreen() {
  const { state } = useWdkApp()
  const { createWallet, unlock } = useWalletManager()
  const { address, isLoading } = useAccount({ network: 'ethereum', accountIndex: 0 })

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

For a full integration guide, see the [React Native Quickstart](../../start-building/react-native-quickstart.md).

---

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
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>API Reference</strong>
			</td>
			<td>Complete reference for all hooks, components, types, and utilities</td>
			<td>
				<a href="./api-reference.md">api-reference.md</a>
			</td>
		</tr>
		<tr>
			<td>
				<i class="fa-mobile-alt">:mobile-alt:</i>
			</td>
			<td>
				<strong>React Native Quickstart</strong>
			</td>
			<td>Step-by-step integration guide for new and existing apps</td>
			<td>
				<a href="../../start-building/react-native-quickstart.md">react-native-quickstart.md</a>
			</td>
		</tr>
	</tbody>
</table>

***

## Need Help?

{% include "../../.gitbook/includes/support-cards.md" %}
