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
| `requireBiometrics` | `boolean` | `true` | Require biometric authentication for wallet operations |
| `currentUserId` | `string \| null` | `undefined` | Current user's identifier (typically email). Auto-initialization waits until this is set and matches the active wallet |
| `clearSensitiveDataOnBackground` | `boolean` | `false` | Clear sensitive data when app goes to background. When enabled, biometric auth is required on every app foreground |
| `children` | `React.ReactNode` | **required** | Child components |

### Example

```tsx
import { WdkAppProvider } from '@tetherto/wdk-react-native-core'
import { bundle } from './.wdk'

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

Hook to access app-level state. Returns a discriminated union representing the current state of the WDK lifecycle.

Must be used within `WdkAppProvider`.

### Returns

| Property | Type | Description |
|----------|------|-------------|
| `state` | [`WdkAppState`](#wdkappstate) | Current app state (discriminated union) |
| `retry` | `() => void` | Retry initialization after an error |

### WdkAppState

The `state` property is a discriminated union on the `status` field:

| Status | Additional Fields | Description |
|--------|-------------------|-------------|
| `'INITIALIZING'` | — | Worklet is starting or wallet is loading |
| `'NO_WALLET'` | — | Worklet is ready, no wallet has been created |
| `'LOCKED'` | `walletId: string` | A wallet exists but is locked (requires biometric unlock) |
| `'READY'` | `walletId: string` | Wallet is unlocked and ready for operations |
| `'ERROR'` | `error: Error` | Initialization failed |

### Example

```tsx
import { useWdkApp, useWalletManager } from '@tetherto/wdk-react-native-core'

function AppRouter() {
  const { state, retry } = useWdkApp()
  const { createWallet, unlock } = useWalletManager()

  switch (state.status) {
    case 'INITIALIZING':
      return <LoadingScreen />
    case 'NO_WALLET':
      return <Button title="Create Wallet" onPress={() => createWallet('user@example.com')} />
    case 'LOCKED':
      return <Button title="Unlock" onPress={() => unlock(state.walletId)} />
    case 'READY':
      return <MainApp walletId={state.walletId} />
    case 'ERROR':
      return <ErrorScreen error={state.error} onRetry={retry} />
  }
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
| `createTemporaryWallet` | `(walletId: string, mnemonic?: string) => Promise<string>` | Create an in-memory wallet for previewing addresses. Returns the temporary wallet ID |
| `clearTemporaryWallet` | `() => void` | Clear the temporary wallet session |
| `setActiveWalletId` | `(walletId: string) => void` | Set the active wallet (triggers loading) |
| `clearCache` | `() => void` | Clear cached balance data |

#### Advanced Crypto Methods

These methods provide lower-level access to wallet cryptographic operations. Most apps won't need these directly.

| Property | Type | Description |
|----------|------|-------------|
| `getEncryptionKey` | `(walletId: string) => Promise<string \| null>` | Get encryption key (requires biometric auth) |
| `getEncryptedSeed` | `(walletId: string) => Promise<string \| null>` | Get encrypted seed from storage |
| `getEncryptedEntropy` | `(walletId: string) => Promise<string \| null>` | Get encrypted entropy from storage |
| `generateEntropyAndEncrypt` | `(wordCount?: 12 \| 24) => Promise<{ encryptionKey, encryptedSeedBuffer, encryptedEntropyBuffer }>` | Generate and encrypt entropy for wallet creation |
| `getMnemonicFromEntropy` | `(encryptedEntropy: string, encryptionKey: string) => Promise<{ mnemonic: string }>` | Derive mnemonic from encrypted entropy |
| `getSeedAndEntropyFromMnemonic` | `(mnemonic: string) => Promise<{ encryptionKey, encryptedSeedBuffer, encryptedEntropyBuffer }>` | Get encrypted seed and entropy from a mnemonic phrase |

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

Hook to interact with a specific blockchain account. Always returns an object — check `address` or `account` for readiness.

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `params.network` | `string` | Network identifier (e.g., `'ethereum'`, `'bitcoin'`, `'tron'`) |
| `params.accountIndex` | `number` | Account index (0-based, following BIP-44 derivation) |

### Returns `UseAccountReturn<T>`

| Property | Type | Description |
|----------|------|-------------|
| `address` | `string \| null` | The derived public address (`null` if not loaded yet) |
| `isLoading` | `boolean` | `true` if the account address is being derived |
| `error` | `Error \| null` | Error if address derivation failed |
| `account` | `{ accountIndex, network, walletId } \| null` | Account identifier (`null` if no active wallet or address not loaded) |
| `getBalance` | `(tokens: IAsset[]) => Promise<BalanceFetchResult[]>` | Fetch balances directly from the network (no cache) |
| `send` | `(params: TransactionParams) => Promise<TransactionResult>` | Send a transaction (native or token transfer) |
| `sign` | `(message: string) => Promise<UseAccountResponse & { signature: string }>` | Sign a UTF-8 message with the account's private key |
| `verify` | `(message: string, signature: string) => Promise<UseAccountResponse & { verified: boolean }>` | Verify a signature |
| `estimateFee` | `(params: TransactionParams) => Promise<Omit<TransactionResult, 'hash'>>` | Estimate the fee for a transaction |
| `extension` | `() => T` | Access chain-specific methods not in the core API |

#### UseAccountResponse

Base response type for account operations:

```typescript
interface UseAccountResponse {
  success: boolean
  error?: string
}
```

#### TransactionParams

| Field | Type | Description |
|-------|------|-------------|
| `to` | `string` | Recipient address |
| `asset` | [`IAsset`](#iasset) | Asset to send |
| `amount` | `string` | Amount in smallest denomination (e.g., wei, satoshi) |

#### TransactionResult

Extends `UseAccountResponse`:

| Field | Type | Description |
|-------|------|-------------|
| `success` | `boolean` | Whether the transaction succeeded |
| `hash` | `string` | Transaction hash |
| `fee` | `string` | Fee paid |
| `error` | `string` | Error message (only if `success` is `false`) |

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
  const { address, isLoading, send, estimateFee } = useAccount({ network: 'ethereum', accountIndex: 0 })

  if (isLoading) return <Text>Deriving address...</Text>
  if (!address) return <Text>No account available</Text>

  const handleSend = async () => {
    const txParams = {
      to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      asset: usdt,
      amount: '1000000', // 1 USDT (6 decimals)
    }

    // Estimate fee first
    const estimate = await estimateFee(txParams)
    console.log('Estimated fee:', estimate.fee)

    // Send the transaction
    const result = await send(txParams)
    if (result.success) {
      console.log('TX hash:', result.hash)
    } else {
      console.error('TX failed:', result.error)
    }
  }

  return (
    <View>
      <Text>Address: {address}</Text>
      <Button title="Send 1 USDT" onPress={handleSend} />
    </View>
  )
}
```

### Extension API

Use `extension()` to access chain-specific methods that aren't part of the core interface. The returned proxy waits for wallet initialization automatically:

```tsx
// Type parameter provides type-safe access to chain-specific methods
const { extension } = useAccount<{ getTransfers: () => Promise<Transfer[]> }>({
  network: 'bitcoin',
  accountIndex: 0,
})

// Safe to call at any time — waits for wallet initialization internally
const btcApi = extension()
const transfers = await btcApi.getTransfers()
```

---

## useAddresses()

Hook to load and query wallet addresses across all networks.

### Returns

| Property | Type | Description |
|----------|------|-------------|
| `data` | `AddressInfo[] \| undefined` | Flattened array of all loaded addresses for the active wallet |
| `isLoading` | `boolean` | `true` if any address is currently being loaded |
| `loadAddresses` | `(accountIndices: number[], networks?: string[]) => Promise<AddressInfoResult[]>` | Fetch addresses for given account indices. Returns results for each address load attempt |
| `getAddressesForNetwork` | `(network: string) => Array<{ address: string, accountIndex: number }>` | Filter addresses by network |
| `getAccountInfoFromAddress` | `(address: string) => AddressInfo \| undefined` | Reverse-lookup: resolve an address string to its account info (case-insensitive) |

#### AddressInfo

| Field | Type | Description |
|-------|------|-------------|
| `address` | `string` | The public address |
| `network` | `string` | Network identifier |
| `accountIndex` | `number` | Account index |

#### AddressInfoResult

Discriminated union indicating success or failure for each address load:

```typescript
type AddressInfoResult =
  | { network: string; accountIndex: number; success: true; address: string }
  | { network: string; accountIndex: number; success: false; reason: Error }
```

### Example

```tsx
import { useAddresses } from '@tetherto/wdk-react-native-core'

function AddressesScreen() {
  const { data, isLoading, loadAddresses, getAddressesForNetwork } = useAddresses()

  useEffect(() => {
    loadAddresses([0]).then((results) => {
      const failed = results.filter((r) => !r.success)
      if (failed.length > 0) {
        console.warn('Some addresses failed to load:', failed)
      }
    })
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

## useBalance(accountIndex, asset, options?)

Hook to fetch a single asset balance using TanStack Query. The network is derived from the asset's `getNetwork()` method. Automatically reads cached data from Zustand on first render, then fetches fresh data from the network.

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `accountIndex` | `number` | Account index |
| `asset` | [`IAsset`](#iasset) | Asset to fetch balance for (network is derived from `asset.getNetwork()`) |
| `options` | [`BalanceQueryOptions`](#balancequeryoptions) | Optional query configuration |

### Returns `UseBalanceResult`

A composite result combining address loading state with TanStack Query state:

| Property | Type | Description |
|----------|------|-------------|
| `data` | `BalanceFetchResult \| undefined` | Balance result |
| `isLoading` | `boolean` | `true` while address is loading or first balance fetch is in progress |
| `isFetching` | `boolean` | Any fetch in progress (including refetch) |
| `isError` | `boolean` | Query encountered an error |
| `error` | `Error \| null` | Error from address loading or balance query |
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
  const { data: balance, isLoading } = useBalance(0, eth, {
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

Hook to fetch balances for multiple assets in a single query. Automatically loads addresses for all required networks before fetching balances.

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `accountIndex` | `number` | Account index |
| `assetConfigs` | [`IAsset[]`](#iasset) | Array of assets to fetch balances for |
| `options` | [`BalanceQueryOptions`](#balancequeryoptions) | Optional query configuration |

### Returns `UseBalancesForWalletResult`

Same shape as `UseBalanceResult` but `data` is `BalanceFetchResult[]`.

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
