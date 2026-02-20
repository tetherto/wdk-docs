---
title: API Reference
description: Complete API reference for @tetherto/wdk-react-native-core
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

# API Reference

Complete reference for all public exports from `@tetherto/wdk-react-native-core`.

---

## WdkAppProvider

The root provider component that orchestrates WDK initialization. Wraps your app with TanStack Query, Zustand stores, and the worklet runtime.

Must be placed at the root of your component tree. All hooks in this library require `WdkAppProvider` as an ancestor.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `bundle` | [`BundleConfig`](#bundleconfig) | **required** | Worklet bundle configuration |
| `wdkConfigs` | [`WdkConfigs`](#wdkconfigs) | **required** | Network and protocol configurations |
| `enableAutoInitialization` | `boolean` | `true` | Enable automatic wallet initialization on app restart |
| `currentUserId` | `string \| null` | `undefined` | Current user's identifier (typically email). Auto-initialization waits until this is set and matches the active wallet |
| `clearSensitiveDataOnBackground` | `boolean` | `false` | Clear sensitive data when app goes to background. When enabled, biometric auth is required on every app foreground |
| `children` | `React.ReactNode` | **required** | Child components |

### Example

```tsx
import { WdkAppProvider } from '@tetherto/wdk-react-native-core'
import { bundle } from '@tetherto/pear-wrk-wdk'

const wdkConfigs = {
  indexer: {
    url: 'https://wdk-api.tether.io',
    apiKey: 'YOUR_API_KEY',
  },
  networks: {
    ethereum: {
      blockchain: 'ethereum',
      config: {
        chainId: 1,
        provider: 'https://eth.drpc.org',
      },
    },
  },
}

export default function App() {
  return (
    <WdkAppProvider
      bundle={{ bundle }}
      wdkConfigs={wdkConfigs}
      currentUserId={user?.email}
      clearSensitiveDataOnBackground={true}
    >
      <Navigation />
    </WdkAppProvider>
  )
}
```

---

## useWdkApp()

Hook to access app-level initialization state. Use this to check if the app is ready before rendering wallet UI.

Must be used within `WdkAppProvider`.

### Returns

| Property | Type | Description |
|----------|------|-------------|
| `status` | [`AppStatus`](#appstatus) | Combined app status (convenience — derived from worklet + wallet state) |
| `workletStatus` | [`InitializationStatus`](#initializationstatus) | Worklet-specific initialization status |
| `workletState` | `{ isReady: boolean, isLoading: boolean, error: string \| null }` | Worklet state for granular control |
| `walletState` | `{ status: 'not_loaded' \| 'checking' \| 'loading' \| 'ready' \| 'error', identifier: string \| null, error: Error \| null }` | Wallet-specific state |
| `isReady` | `boolean` | `true` when both worklet and wallet are ready |
| `isInitializing` | `boolean` | `true` when worklet is starting or wallet is loading |
| `activeWalletId` | `string \| null` | Currently active wallet identifier |
| `loadingWalletId` | `string \| null` | Wallet identifier being loaded (transient, only during loading) |
| `walletExists` | `boolean \| null` | Whether the loading wallet exists in secure storage (`null` = not checked yet) |
| `error` | `Error \| null` | First error from worklet or wallet initialization |
| `retry` | `() => void` | Retry initialization after an error |

### Example

```tsx
import { useWdkApp, AppStatus } from '@tetherto/wdk-react-native-core'

function AppRouter() {
  const { status, isReady, error, retry } = useWdkApp()

  if (status === AppStatus.ERROR) {
    return <ErrorScreen error={error} onRetry={retry} />
  }

  if (!isReady) {
    return <LoadingScreen />
  }

  return <MainApp />
}
```

### Advanced: Granular State

```tsx
function AppRouter() {
  const { workletState, walletState } = useWdkApp()

  if (workletState.error) {
    return <WorkletErrorScreen error={workletState.error} />
  }

  if (workletState.isReady && walletState.status === 'not_loaded') {
    return <OnboardingScreen />
  }

  if (walletState.status === 'ready') {
    return <MainApp />
  }

  return <LoadingScreen />
}
```

---

## useWalletManager()

Hook for wallet lifecycle operations: create, restore, lock, unlock, delete, and manage wallets.

### Returns

| Property | Type | Description |
|----------|------|-------------|
| `activeWalletId` | `string \| null` | Currently active wallet identifier |
| `status` | `'LOCKED' \| 'UNLOCKED' \| 'NO_WALLET' \| 'LOADING' \| 'ERROR'` | Current wallet status |
| `wallets` | [`WalletInfo[]`](#walletinfo) | List of wallets managed by the device |
| `createWallet` | `(walletId: string) => Promise<void>` | Create a new wallet with biometric-protected storage |
| `restoreWallet` | `(mnemonic: string, walletId: string) => Promise<string>` | Restore a wallet from a seed phrase. Returns the wallet ID |
| `deleteWallet` | `(walletId: string) => Promise<void>` | Delete a wallet and all associated data |
| `lock` | `() => void` | Lock the wallet — clears sensitive data from memory and stops the worklet |
| `unlock` | `(walletId?: string) => Promise<void>` | Unlock a wallet (triggers biometric prompt) |
| `generateMnemonic` | `(wordCount?: 12 \| 24) => Promise<string>` | Generate a new BIP39 mnemonic phrase |
| `getMnemonic` | `(walletId: string) => Promise<string \| null>` | Get mnemonic from wallet (requires biometric auth) |
| `createTemporaryWallet` | `(mnemonic?: string) => Promise<void>` | Create an in-memory wallet for previewing addresses (no biometrics, not persisted) |
| `clearTemporaryWallet` | `() => void` | Clear the temporary wallet session |
| `setActiveWalletId` | `(walletId: string) => void` | Set the active wallet (triggers loading) |
| `clearCache` | `() => void` | Clear cached balance data |
| `refreshWalletList` | `(knownIdentifiers?: string[]) => Promise<void>` | Refresh the wallet list from secure storage |

### Example

```tsx
import { useWalletManager } from '@tetherto/wdk-react-native-core'

function OnboardingScreen() {
  const { createWallet, restoreWallet, generateMnemonic } = useWalletManager()

  const handleCreate = async () => {
    await createWallet('user@example.com')
  }

  const handleRestore = async (mnemonic: string) => {
    await restoreWallet(mnemonic, 'user@example.com')
  }

  const handlePreview = async () => {
    const mnemonic = await generateMnemonic(12)
    console.log('Generated mnemonic:', mnemonic)
  }

  return (
    <View>
      <Button title="Create Wallet" onPress={handleCreate} />
      <Button title="Generate Mnemonic" onPress={handlePreview} />
    </View>
  )
}
```

---

## useAccount(params)

Hook to interact with a specific blockchain account. Returns the address and methods for sending transactions, signing messages, and fetching balances.

Returns `null` if no wallet is active or the address hasn't been loaded yet.

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `params.network` | `string` | Network identifier (e.g., `'ethereum'`, `'bitcoin'`, `'tron'`) |
| `params.accountIndex` | `number` | Account index (0-based, following BIP-44 derivation) |

### Returns `UseAccountReturn<T> | null`

| Property | Type | Description |
|----------|------|-------------|
| `address` | `string` | The derived public address for this account |
| `account` | `{ accountIndex: number, network: string, walletId: string }` | Account identifier |
| `getBalance` | `(tokens: IAsset[]) => Promise<BalanceFetchResult[]>` | Fetch balances directly from the network (no cache) |
| `send` | `(params: TransactionParams) => Promise<TransactionResult>` | Send a transaction (native or token transfer) |
| `sign` | `(message: string) => Promise<string>` | Sign a UTF-8 message with the account's private key |
| `verify` | `(message: string, signature: string) => Promise<boolean>` | Verify a signature |
| `extension` | `() => T` | Access chain-specific methods not in the core API |

#### TransactionParams

| Field | Type | Description |
|-------|------|-------------|
| `to` | `string` | Recipient address |
| `asset` | [`IAsset`](#iasset) | Asset to send |
| `amount` | `string` | Amount in smallest denomination (e.g., wei, satoshi) |

#### TransactionResult

| Field | Type | Description |
|-------|------|-------------|
| `hash` | `string` | Transaction hash |
| `fee` | `string` | Fee paid |

### Example

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

  if (!account) return <Text>No account available</Text>

  const handleSend = async () => {
    const result = await account.send({
      to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      asset: usdt,
      amount: '1000000', // 1 USDT (6 decimals)
    })
    console.log('TX hash:', result.hash)
  }

  return (
    <View>
      <Text>Address: {account.address}</Text>
      <Button title="Send 1 USDT" onPress={handleSend} />
    </View>
  )
}
```

### Extension API

Use `extension()` to access chain-specific methods that aren't part of the core interface:

```tsx
// Type parameter provides type-safe access to chain-specific methods
const btcAccount = useAccount<{ getUtxos: () => Promise<Utxo[]> }>({
  network: 'bitcoin',
  accountIndex: 0,
})

if (btcAccount) {
  const btcApi = btcAccount.extension()
  const utxos = await btcApi.getUtxos()
}
```

---

## useAddresses()

Hook to load and query wallet addresses across all networks.

### Returns

| Property | Type | Description |
|----------|------|-------------|
| `data` | `AddressInfo[] \| undefined` | Flattened array of all loaded addresses for the active wallet |
| `isLoading` | `boolean` | `true` if any address is currently being loaded |
| `loadAddresses` | `(accountIndices: number[], networks?: string[]) => Promise<void>` | Fetch addresses for given account indices. If `networks` is omitted, fetches for all configured networks |
| `getAddressesForNetwork` | `(network: string) => Array<{ address: string, accountIndex: number }>` | Filter addresses by network |
| `getAccountInfoFromAddress` | `(address: string) => AddressInfo \| undefined` | Reverse-lookup: resolve an address string to its account info (case-insensitive) |

#### AddressInfo

| Field | Type | Description |
|-------|------|-------------|
| `address` | `string` | The public address |
| `network` | `string` | Network identifier |
| `accountIndex` | `number` | Account index |

### Example

```tsx
import { useAddresses } from '@tetherto/wdk-react-native-core'

function AddressesScreen() {
  const { data, isLoading, loadAddresses, getAddressesForNetwork } = useAddresses()

  useEffect(() => {
    loadAddresses([0]) // Load addresses for account index 0
  }, [])

  const ethAddresses = getAddressesForNetwork('ethereum')

  if (isLoading) return <Text>Loading addresses...</Text>

  return (
    <View>
      {ethAddresses.map(({ address, accountIndex }) => (
        <Text key={address}>Account {accountIndex}: {address}</Text>
      ))}
    </View>
  )
}
```

---

## useBalance(network, accountIndex, asset, options?)

Hook to fetch a single asset balance using TanStack Query. Automatically reads cached data from Zustand on first render, then fetches fresh data from the network.

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `network` | `string` | Network identifier |
| `accountIndex` | `number` | Account index |
| `asset` | [`IAsset`](#iasset) | Asset to fetch balance for |
| `options` | [`BalanceQueryOptions`](#balancequeryoptions) | Optional query configuration |

### Returns

Standard TanStack Query result (`UseQueryResult`) where `data` is [`BalanceFetchResult`](#balancefetchresult).

| Property | Type | Description |
|----------|------|-------------|
| `data` | `BalanceFetchResult \| undefined` | Balance result |
| `isLoading` | `boolean` | First load in progress |
| `isFetching` | `boolean` | Any fetch in progress (including refetch) |
| `isError` | `boolean` | Query encountered an error |
| `error` | `Error \| null` | Error object if failed |
| `refetch` | `() => Promise<...>` | Manually trigger refetch |

### Example

```tsx
import { useBalance, BaseAsset } from '@tetherto/wdk-react-native-core'

const eth = new BaseAsset({
  id: 'eth',
  network: 'ethereum',
  symbol: 'ETH',
  name: 'Ether',
  decimals: 18,
  isNative: true,
})

function BalanceDisplay() {
  const { data: balance, isLoading } = useBalance('ethereum', 0, eth, {
    refetchInterval: 30000, // Refresh every 30s
  })

  if (isLoading) return <Text>Loading...</Text>

  if (balance?.success) {
    return <Text>ETH Balance: {balance.balance}</Text>
  }

  return <Text>Failed to fetch balance</Text>
}
```

---

## useBalancesForWallet(accountIndex, assetConfigs, options?)

Hook to fetch balances for multiple assets in a single query. Useful for displaying a portfolio view.

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `accountIndex` | `number` | Account index |
| `assetConfigs` | [`IAsset[]`](#iasset) | Array of assets to fetch balances for |
| `options` | [`BalanceQueryOptions`](#balancequeryoptions) | Optional query configuration |

### Returns

Standard TanStack Query result where `data` is `BalanceFetchResult[]`.

### Example

```tsx
import { useBalancesForWallet, BaseAsset } from '@tetherto/wdk-react-native-core'

const assets = [
  new BaseAsset({ id: 'eth', network: 'ethereum', symbol: 'ETH', name: 'Ether', decimals: 18, isNative: true }),
  new BaseAsset({ id: 'usdt-eth', network: 'ethereum', symbol: 'USDT', name: 'Tether USD', decimals: 6, isNative: false, address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' }),
]

function PortfolioScreen() {
  const { data: balances, isLoading } = useBalancesForWallet(0, assets, {
    refetchInterval: 60000,
  })

  if (isLoading) return <Text>Loading balances...</Text>

  return (
    <View>
      {balances?.map((b) => (
        <Text key={b.assetId}>
          {b.assetId}: {b.success ? b.balance : 'Error'}
        </Text>
      ))}
    </View>
  )
}
```

---

## useRefreshBalance()

Hook that returns a TanStack Query mutation for invalidating and refetching balances.

### Returns

Standard TanStack Query mutation result (`UseMutationResult`).

Call `mutate(params)` with:

| Field | Type | Description |
|-------|------|-------------|
| `accountIndex` | `number` | Account index |
| `network` | `string` | Network (required for `'token'` and `'network'` types) |
| `assetId` | `string` | Asset ID (required for `'token'` type) |
| `type` | `'token' \| 'wallet' \| 'network' \| 'all'` | Refresh scope (default: `'token'`) |
| `walletId` | `string` | Optional wallet ID override |

### Example

```tsx
import { useRefreshBalance } from '@tetherto/wdk-react-native-core'

function RefreshButton() {
  const { mutate: refreshBalance, isPending } = useRefreshBalance()

  return (
    <Button
      title="Refresh All Balances"
      disabled={isPending}
      onPress={() => refreshBalance({ accountIndex: 0, type: 'wallet' })}
    />
  )
}
```

---

## BaseAsset

Default implementation of the [`IAsset`](#iasset) interface. Wraps an [`AssetConfig`](#assetconfig) object.

### Constructor

```typescript
new BaseAsset(config: AssetConfig)
```

### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `getId()` | `string` | Unique asset identifier |
| `getNetwork()` | `string` | Network this asset belongs to |
| `getSymbol()` | `string` | Ticker symbol (e.g., `'USDT'`) |
| `getName()` | `string` | Human-readable name |
| `getDecimals()` | `number` | Decimal places |
| `isNative()` | `boolean` | `true` for native chain currency (ETH, BTC, etc.) |
| `getContractAddress()` | `string \| null` | Token contract address (`null` for native assets) |

### Example

```typescript
import { BaseAsset } from '@tetherto/wdk-react-native-core'

const usdt = new BaseAsset({
  id: 'usdt-ethereum',
  network: 'ethereum',
  symbol: 'USDT',
  name: 'Tether USD',
  decimals: 6,
  isNative: false,
  address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
})

console.log(usdt.getSymbol())          // 'USDT'
console.log(usdt.isNative())           // false
console.log(usdt.getContractAddress()) // '0xdAC17F958D2ee523a2206206994597C13D831ec7'
```

---

## IAsset

Interface that all assets must implement. `BaseAsset` provides a default implementation, but you can create custom asset classes for advanced use cases.

```typescript
interface IAsset {
  getId(): string
  getNetwork(): string
  getSymbol(): string
  getName(): string
  getDecimals(): number
  isNative(): boolean
  getContractAddress(): string | null
}
```

---

## Types

### WdkConfigs

Root configuration object passed to `WdkAppProvider`. Defines network and protocol configurations for the WDK worklet.

```typescript
interface WdkConfigs<TNetwork = Record<string, unknown>, TProtocol = Record<string, unknown>> {
  indexer: {
    url: string
    apiKey: string
  }
  networks: {
    [blockchain: string]: {
      blockchain: string
      config: TNetwork
    }
  }
  protocols?: {
    [protocolName: string]: {
      protocol: string
      config: TProtocol
    }
  }
}
```

### AssetConfig

Raw configuration object for defining an asset. Pass this to the `BaseAsset` constructor.

```typescript
type AssetConfig<T = Record<string, unknown>> = T & {
  id: string           // Unique identifier
  network: string      // Network this asset belongs to
  symbol: string       // Ticker symbol
  name: string         // Human-readable name
  decimals: number     // Decimal places
  isNative: boolean    // true for native chain currency
  address?: string | null  // Token contract address (null for native)
}
```

### BalanceFetchResult

Result of a balance fetch operation.

```typescript
interface BalanceFetchResult {
  success: boolean        // Whether the fetch succeeded
  network: string         // Network name
  accountIndex: number    // Account index
  assetId: string         // Asset identifier
  balance: string | null  // Balance as string (null if failed)
  error?: string          // Error message (only if success is false)
}
```

### BundleConfig

Configuration for the worklet bundle.

```typescript
interface BundleConfig {
  bundle: string  // Compiled JavaScript bundle for the worklet runtime
}
```

### BalanceQueryOptions

Options for balance query hooks.

```typescript
interface BalanceQueryOptions {
  enabled?: boolean              // Whether the query is enabled (default: true)
  refetchInterval?: number | false  // Refetch interval in ms (false to disable)
  staleTime?: number             // Stale time in ms
}
```

### WalletInfo

Information about a wallet stored on the device.

```typescript
interface WalletInfo {
  identifier: string  // Wallet identifier (e.g., user email)
  exists: boolean     // Whether wallet exists in secure storage
  isActive: boolean   // Whether this wallet is currently active
}
```

### AccountInfo

Information about a wallet account.

```typescript
interface AccountInfo {
  accountIndex: number              // Account index (0-based)
  addresses: Record<string, string> // Address for each network
}
```

---

## Enums

### AppStatus

Combined app-level status derived from worklet and wallet state.

```typescript
enum AppStatus {
  IDLE = 'idle',                       // Worklet not started
  STARTING_WORKLET = 'starting_worklet', // Worklet is starting
  WORKLET_READY = 'worklet_ready',     // Worklet ready, no wallet loaded
  LOADING_WALLET = 'loading_wallet',   // Loading a wallet
  READY = 'ready',                     // Fully ready
  ERROR = 'error',                     // Worklet or wallet error
}
```

### InitializationStatus

Worklet-specific initialization status.

```typescript
enum InitializationStatus {
  IDLE = 'idle',                         // Worklet not started
  STARTING_WORKLET = 'starting_worklet', // Worklet runtime is starting
  WORKLET_READY = 'worklet_ready',       // Worklet ready, can load wallets
  ERROR = 'error',                       // Worklet initialization failed
}
```

---

## Utilities

### validateMnemonic(mnemonic)

Validates a BIP39 mnemonic phrase. Checks that it contains exactly 12 or 24 non-empty words.

```typescript
function validateMnemonic(mnemonic: string): boolean
```

#### Example

```typescript
import { validateMnemonic } from '@tetherto/wdk-react-native-core'

validateMnemonic('word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12')
// true

validateMnemonic('only three words')
// false
```

### balanceQueryKeys

Factory for constructing TanStack Query keys for balance queries. Useful for manual cache invalidation.

```typescript
const balanceQueryKeys = {
  all: ['balances'],
  byWallet: (walletId: string, accountIndex: number) => [...],
  byNetwork: (network: string) => [...],
  byWalletAndNetwork: (walletId: string, accountIndex: number, network: string) => [...],
  byToken: (walletId: string, accountIndex: number, network: string, assetId: string) => [...],
}
```

#### Example

```typescript
import { balanceQueryKeys } from '@tetherto/wdk-react-native-core'
import { useQueryClient } from '@tanstack/react-query'

const queryClient = useQueryClient()

// Invalidate all balances for a specific wallet
queryClient.invalidateQueries({
  queryKey: balanceQueryKeys.byWallet('user@example.com', 0),
})
```

---

## Need Help?

{% include "../../.gitbook/includes/support-cards.md" %}
