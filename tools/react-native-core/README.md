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
- **TypeScript-first** — full type safety with exported types, interfaces, and enums

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
    ├── useWdkApp()         — app status, initialization state
    ├── useWalletManager()  — create, restore, lock, unlock, delete wallets
    ├── useAccount()        — address, send, sign, verify, getBalance
    ├── useAddresses()      — load and query addresses
    ├── useBalance()        — single balance with TanStack Query
    ├── useBalancesForWallet() — bulk balance fetch
    └── useRefreshBalance() — invalidate and refetch balances
```

## Bundle Configuration

The WDK engine runs inside a Bare worklet. You need to provide a bundle — there are two approaches:

### Pre-built Bundle

Use the ready-made bundle from `@tetherto/pear-wrk-wdk`:

```typescript
import { bundle } from '@tetherto/pear-wrk-wdk'

<WdkAppProvider bundle={{ bundle }} wdkConfigs={configs}>
  <App />
</WdkAppProvider>
```

### Custom Bundle

Use the `@tetherto/wdk-worklet-bundler` CLI to generate a custom bundle with only the modules you need:

```bash
npx @tetherto/wdk-worklet-bundler
```

This generates a `.wdk-bundle/` directory in your project:

```typescript
import { bundle } from './.wdk-bundle'

<WdkAppProvider bundle={{ bundle }} wdkConfigs={configs}>
  <App />
</WdkAppProvider>
```

## Quick Start

### 1. Install

```bash
npm install @tetherto/wdk-react-native-core
```

### 2. Wrap Your App

```tsx
import { WdkAppProvider } from '@tetherto/wdk-react-native-core'
import { bundle } from '@tetherto/pear-wrk-wdk'

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
  const { isReady } = useWdkApp()
  const { createWallet, unlock } = useWalletManager()
  const account = useAccount({ network: 'ethereum', accountIndex: 0 })

  if (!isReady) return <Text>Loading...</Text>

  return <Text>Address: {account?.address}</Text>
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
