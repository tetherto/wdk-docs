---
title: WDK Core API Reference
description: Complete API documentation for @tetherto/wdk
icon: code
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

## Table of Contents

| Class | Description | Methods |
|-------|-------------|---------|
| [WDK](#wdk) | Main class for managing wallets across multiple blockchains. Orchestrates wallet managers and protocols. | [Constructor](#constructor), [Methods](#methods) |
| [IWalletAccountWithProtocols](#iwalletaccountwithprotocols) | Extended wallet account interface that supports protocol registration and access. Extends `IWalletAccount`. | [Methods](#methods-1) |


## WDK

The main class for managing wallets across multiple blockchains. This class serves as an orchestrator that allows you to register different wallet managers and protocols, providing a unified interface for multi-chain operations.

### Constructor

{% code title="Constructor" lineNumbers="true" %}
```javascript
new WDK(seed)
```
{% endcode %}

**Parameters:**
- `seed` (string | Uint8Array): BIP-39 mnemonic seed phrase or seed bytes

**Example:**
{% code title="Initialize WDK" lineNumbers="true" %}
```javascript
import WDK from '@tetherto/wdk'

// With seed phrase
const wdk = new WDK('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about')

// With seed bytes
const seedBytes = new Uint8Array([...])
const wdk2 = new WDK(seedBytes)
```
{% endcode %}

### Methods

| Method | Description | Returns | Throws |
|--------|-------------|---------|--------|
| `registerWallet(blockchain, wallet, config)` | Registers a new wallet manager for a blockchain | `WDK` | - |
| `registerProtocol(blockchain, label, protocol, config)` | Registers a protocol globally for a blockchain | `WDK` | - |
| `registerMiddleware(blockchain, middleware)` | Registers middleware for account decoration | `WDK` | - |
| `getAccount(blockchain, index?)` | Returns a wallet account for a blockchain and index | `Promise<IWalletAccountWithProtocols>` | If wallet not registered |
| `getAccountByPath(blockchain, path)` | Returns a wallet account for a blockchain and derivation path | `Promise<IWalletAccountWithProtocols>` | If wallet not registered |
| `getFeeRates()` | Returns current fee rates | `Promise<FeeRates>` | - |
| `dispose()` | Disposes all wallets and accounts, clearing sensitive data | `void` | - |

##### `registerWallet(blockchain, wallet, config)`
Registers a new wallet manager for a specific blockchain.

**Type Parameters:**
- `W`: `typeof WalletManager` - A class that extends the `@tetherto/wdk-wallet`'s `WalletManager` class

**Parameters:**
- `blockchain` (string): The name of the blockchain (e.g., "ethereum", "ton", "bitcoin")
- `wallet` (W): The wallet manager class
- `config` (ConstructorParameters<W>[1]): The configuration object for the wallet

**Returns:** `WDK` - The wdk manager instance (supports method chaining)

**Example:**
{% code title="Register Wallets" lineNumbers="true" %}
```javascript
import WDK from '@tetherto/wdk'
import WalletManagerEvm from '@tetherto/wdk-wallet-evm'
import WalletManagerTon from '@tetherto/wdk-wallet-ton'

const wdk = new WDK(seedPhrase)

// Register EVM wallet
wdk.registerWallet('ethereum', WalletManagerEvm, {
  provider: 'https://eth.drpc.org'
})

// Register TON wallet
wdk.registerWallet('ton', WalletManagerTon, {
  tonApiKey: 'YOUR_TON_API_KEY',
  tonApiEndpoint: 'https://tonapi.io'
})

// Method chaining
const wdk2 = new WDK(seedPhrase)
  .registerWallet('ethereum', WalletManagerEvm, ethereumWalletConfig)
  .registerWallet('ton', WalletManagerTon, tonWalletConfig)
```
{% endcode %}

##### `registerProtocol(blockchain, label, protocol, config)`
Registers a protocol globally for all accounts of a specific blockchain.

**Type Parameters:**
- `P`: `typeof SwapProtocol | typeof BridgeProtocol | typeof LendingProtocol` - A class that extends one of the `@tetherto/wdk-wallet/protocol`'s classes

**Parameters:**
- `blockchain` (string): The name of the blockchain
- `label` (string): Unique label for the protocol (must be unique per blockchain and protocol type)
- `protocol` (P): The protocol class
- `config` (ConstructorParameters<P>[1]): The protocol configuration

**Returns:** `WDK` - The wdk manager instance (supports method chaining)

**Example:**
{% code title="Register Protocols" lineNumbers="true" %}
```javascript
import veloraProtocolEvm from '@tetherto/wdk-protocol-swap-velora-evm'
import Usdt0ProtocolEvm from '@tetherto/wdk-protocol-bridge-usdt0-evm'

// Register swap protocol for Ethereum
wdk.registerProtocol('ethereum', 'velora', veloraProtocolEvm, {
  apiKey: 'YOUR_velora_API_KEY'
})

// Register bridge protocol for Ethereum
wdk.registerProtocol('ethereum', 'usdt0', Usdt0ProtocolEvm)

// Method chaining
const wdk2 = new WDK(seedPhrase)
  .registerWallet('ethereum', WalletManagerEvm, ethereumWalletConfig)
  .registerProtocol('ethereum', 'velora', veloraProtocolEvm, veloraProtocolConfig)
```
{% endcode %}

##### `registerMiddleware(blockchain, middleware)`
Registers middleware for account decoration and enhanced functionality.

**Parameters:**
- `blockchain` (string): The name of the blockchain
- `middleware` (`<A extends IWalletAccount>(account: A) => Promise<A | void>`): Middleware function called when deriving accounts

**Returns:** `WDK` - The wdk manager instance (supports method chaining)

**Example:**
{% code title="Register Middleware" lineNumbers="true" %}
```javascript
// Simple logging middleware
wdk.registerMiddleware('ethereum', async (account) => {
  console.log('New account:', await account.getAddress())
})

// Failover cascade middleware
import { getFailoverCascadeMiddleware } from '@tetherto/wdk-wrapper-failover-cascade'

wdk.registerMiddleware('ethereum', getFailoverCascadeMiddleware({
  fallbackOptions: {
    retries: 3,
    delay: 1000
  }
}))

// Method chaining
const wdk2 = new WDK(seedPhrase)
  .registerWallet('ethereum', WalletManagerEvm, ethereumWalletConfig)
  .registerMiddleware('ethereum', async (account) => {
    console.log('New account:', await account.getAddress())
  })
```
{% endcode %}

##### `getAccount(blockchain, index?)`
Returns a wallet account for a specific blockchain and index using BIP-44 derivation.

**Parameters:**
- `blockchain` (string): The name of the blockchain (e.g., "ethereum")
- `index` (number, optional): The index of the account to get (default: 0)

**Returns:** `Promise<IWalletAccountWithProtocols>` - The wallet account with protocol support

**Throws:** Error if no wallet has been registered for the given blockchain

**Example:**
{% code title="Get Account" lineNumbers="true" %}
```javascript
// Get first account (index 0)
const account = await wdk.getAccount('ethereum', 0)

// Get second account (index 1)
const account1 = await wdk.getAccount('ethereum', 1)

// Default index (0)
const defaultAccount = await wdk.getAccount('ethereum')

// This will throw an error if no wallet registered for 'tron'
try {
  const tronAccount = await wdk.getAccount('tron', 0)
} catch (error) {
  console.error('No wallet registered for tron blockchain')
}
```
{% endcode %}

##### `getAccountByPath(blockchain, path)`
Returns a wallet account for a specific blockchain and BIP-44 derivation path.

**Parameters:**
- `blockchain` (string): The name of the blockchain (e.g., "ethereum")
- `path` (string): The derivation path (e.g., "0'/0/0")

**Returns:** `Promise<IWalletAccountWithProtocols>` - The wallet account with protocol support

**Throws:** Error if no wallet has been registered for the given blockchain

**Example:**
{% code title="Get Account by Path" lineNumbers="true" %}
```javascript
// Full path: m/44'/60'/0'/0/1
const account = await wdk.getAccountByPath('ethereum', "0'/0/1")

// Different derivation path
const customAccount = await wdk.getAccountByPath('ton', "1'/2/3")
```
{% endcode %}

##### `getFeeRates()`
Returns current fee rates for all registered blockchains.

**Returns:** `Promise<FeeRates>` - The fee rates in base units

**Example:**
{% code title="Get Fee Rates" lineNumbers="true" %}
```javascript
const feeRates = await wdk.getFeeRates()
console.log('Fee rates:', feeRates)
```
{% endcode %}

##### `dispose()`
Disposes all wallets and accounts, erasing any sensitive data from memory.

**Example:**
{% code title="Dispose WDK" lineNumbers="true" %}
```javascript
// Clean up all sensitive data
wdk.dispose()
```
{% endcode %}

### Static Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `getRandomSeedPhrase(wordCount?)` | Returns a random BIP-39 seed phrase (12 or 24 words) | `string` |
| `isValidSeedPhrase(seedPhrase)` | Checks if a seed phrase is valid | `boolean` |

##### `getRandomSeedPhrase(wordCount?)`
Returns a random BIP-39 seed phrase. Supports both 12-word (128-bit entropy) and 24-word (256-bit entropy) seed phrases.

**Parameters:**
- `wordCount` (12 | 24, optional): The number of words in the seed phrase. Defaults to 12.

**Returns:** `string` - The seed phrase

**Example:**
{% code title="Generate Random Seed" lineNumbers="true" %}
```javascript
// Generate 12-word seed phrase (default)
const seedPhrase12 = WDK.getRandomSeedPhrase()
console.log('Generated 12-word seed:', seedPhrase12)
// Output: "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"

// Generate 24-word seed phrase (higher security)
const seedPhrase24 = WDK.getRandomSeedPhrase(24)
console.log('Generated 24-word seed:', seedPhrase24)
// Output: "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon art"
```
{% endcode %}

##### `isValidSeedPhrase(seedPhrase)`
Checks if a seed phrase is valid according to BIP-39 standards.

**Parameters:**
- `seedPhrase` (string): The seed phrase to validate

**Returns:** `boolean` - True if the seed phrase is valid

**Example:**
{% code title="Validate Seed Phrase" lineNumbers="true" %}
```javascript
const isValid = WDK.isValidSeedPhrase('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about')
console.log('Seed phrase valid:', isValid) // true

const isInvalid = WDK.isValidSeedPhrase('invalid seed phrase')
console.log('Seed phrase valid:', isInvalid) // false
```
{% endcode %}

## IWalletAccountWithProtocols

Extended wallet account interface that supports protocol registration and access. Extends `IWalletAccount` from `@tetherto/wdk-wallet`.

### Methods

| Method | Description | Returns | Throws |
|--------|-------------|---------|--------|
| `registerProtocol(label, protocol, config)` | Registers a protocol for this specific account | `IWalletAccountWithProtocols` | - |
| `getSwapProtocol(label)` | Returns the swap protocol with the given label | `ISwapProtocol` | If protocol not found |
| `getBridgeProtocol(label)` | Returns the bridge protocol with the given label | `IBridgeProtocol` | If protocol not found |
| `getLendingProtocol(label)` | Returns the lending protocol with the given label | `ILendingProtocol` | If protocol not found |

##### `registerProtocol(label, protocol, config)`
Registers a new protocol for this specific account.

**Type Parameters:**
- `P`: `typeof SwapProtocol | typeof BridgeProtocol | typeof LendingProtocol` - A class that extends one of the `@tetherto/wdk-wallet/protocol`'s classes

**Parameters:**
- `label` (string): Unique label for the protocol (must be unique per account and protocol type)
- `protocol` (P): The protocol class
- `config` (ConstructorParameters<P>[1]): The protocol configuration

**Returns:** `IWalletAccountWithProtocols` - The account instance (supports method chaining)

**Example:**
{% code title="Register Protocol for Account" lineNumbers="true" %}
```javascript
import Usdt0ProtocolEvm from '@tetherto/wdk-protocol-bridge-usdt0-evm'

const account = await wdk.getAccount('ethereum', 0)

// Register protocol for this specific account
account.registerProtocol('usdt0', Usdt0ProtocolEvm, {
  apiKey: 'YOUR_API_KEY'
})

// Method chaining
const account2 = await wdk.getAccount('ethereum', 1)
  .registerProtocol('usdt0', Usdt0ProtocolEvm, usdt0ProtocolConfig)
```
{% endcode %}

##### `getSwapProtocol(label)`
Returns the swap protocol with the given label.

**Parameters:**
- `label` (string): The protocol label

**Returns:** `ISwapProtocol` - The swap protocol instance

**Throws:** Error if no swap protocol with the given label has been registered

**Example:**
{% code title="Get Swap Protocol" lineNumbers="true" %}
```javascript
import veloraProtocolEvm from '@tetherto/wdk-protocol-swap-velora-evm'

// Register swap protocol
account.registerProtocol('velora', veloraProtocolEvm, veloraProtocolConfig)

// Get swap protocol
const velora = account.getSwapProtocol('velora')

// Use the protocol
const swapResult = await velora.swap({
  tokenIn: '0x...',
  tokenOut: '0x...',
  tokenInAmount: 1000000n
})

// This will throw an error
// try {
//   const uniswap = account.getSwapProtocol('uniswap')
// } catch (error) {
//   console.error('No swap protocol with label "uniswap" found')
// }
```
{% endcode %}

##### `getBridgeProtocol(label)`
Returns the bridge protocol with the given label.

**Parameters:**
- `label` (string): The protocol label

**Returns:** `IBridgeProtocol` - The bridge protocol instance

**Throws:** Error if no bridge protocol with the given label has been registered

**Example:**
{% code title="Get Bridge Protocol" lineNumbers="true" %}
```javascript
import Usdt0ProtocolEvm from '@tetherto/wdk-protocol-bridge-usdt0-evm'

// Register bridge protocol
account.registerProtocol('usdt0', Usdt0ProtocolEvm)

// Get bridge protocol
const usdt0 = account.getBridgeProtocol('usdt0')

// Use the protocol
const bridgeResult = await usdt0.bridge({
  targetChain: 'arbitrum',
  recipient: '0x...',
  token: '0x...',
  amount: 1000000n
})
```
{% endcode %}

##### `getLendingProtocol(label)`
Returns the lending protocol with the given label.

**Parameters:**
- `label` (string): The protocol label

**Returns:** `ILendingProtocol` - The lending protocol instance

**Throws:** Error if no lending protocol with the given label has been registered

**Example:**
{% code title="Get Lending Protocol" lineNumbers="true" %}
```javascript
import AaveProtocolEvm from '@tetherto/wdk-protocol-lending-aave-evm'

// Register lending protocol
account.registerProtocol('aave', AaveProtocolEvm, aaveProtocolConfig)

// Get lending protocol
const aave = account.getLendingProtocol('aave')

// Use the protocol
const supplyResult = await aave.supply({
  token: '0x...',
  amount: 1000000n
})
```
{% endcode %}

## Complete Example

{% code title="Complete WDK Flow" lineNumbers="true" %}
```javascript
import WDK from '@tetherto/wdk'
import WalletManagerEvm from '@tetherto/wdk-wallet-evm'
import WalletManagerTon from '@tetherto/wdk-wallet-ton'
import veloraProtocolEvm from '@tetherto/wdk-protocol-swap-velora-evm'
import Usdt0ProtocolEvm from '@tetherto/wdk-protocol-bridge-usdt0-evm'

// Initialize WDK Manager
const wdk = new WDK(seedPhrase)
  .registerWallet('ethereum', WalletManagerEvm, {
    provider: 'https://eth.drpc.org'
  })
  .registerWallet('ton', WalletManagerTon, {
    tonApiKey: 'YOUR_TON_API_KEY',
    tonApiEndpoint: 'https://tonapi.io'
  })
  .registerProtocol('ethereum', 'velora', veloraProtocolEvm, {
    apiKey: 'YOUR_velora_API_KEY'
  })
  .registerProtocol('ethereum', 'usdt0', Usdt0ProtocolEvm)

// Get accounts
const accountEth = await wdk.getAccount('ethereum', 3)
const accountTon = await wdk.getAccountByPath('ton', "1'/2/3")

// Use wallet account methods
const { hash, fee } = await accountEth.sendTransaction({
  to: '0x...',
  value: 1000000000000000000n // 1 ETH
})

// Use protocols
const velora = accountEth.getSwapProtocol('velora')
const swapResult = await velora.swap(swapOptions)

const usdt0 = accountEth.getBridgeProtocol('usdt0')
const bridgeResult = await usdt0.bridge(bridgeOptions)

// Clean up
wdk.dispose()
```
{% endcode %}

## Types

### FeeRates

{% code title="Type: FeeRates" lineNumbers="true" %}
```typescript
interface FeeRates {
  [blockchain: string]: {
    normal: number;
    fast: number;
  };
}
```
{% endcode %}

### Middleware Function

{% code title="Type: MiddlewareFunction" lineNumbers="true" %}
```typescript
type MiddlewareFunction = <A extends IWalletAccount>(
  account: A
) => Promise<A | void>;
```
{% endcode %}

### Protocol Types

{% code title="Types: Protocol Interfaces" lineNumbers="true" %}
```typescript
// Swap Protocol
interface ISwapProtocol {
  swap(options: SwapOptions): Promise<SwapResult>;
}

// Bridge Protocol  
interface IBridgeProtocol {
  bridge(options: BridgeOptions): Promise<BridgeResult>;
}

// Lending Protocol
interface ILendingProtocol {
  supply(options: LendingOptions): Promise<LendingResult>;
  withdraw(options: LendingOptions): Promise<LendingResult>;
  borrow(options: LendingOptions): Promise<LendingResult>;
  repay(options: LendingOptions): Promise<LendingResult>;
}
```
{% endcode %}

***

## Next Steps

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
				<strong>WDK Core Configuration</strong>
			</td>
			<td>Get started with WDK's configuration</td>
			<td>
				<a href="./configuration.md">WDK Core Configuration</a>
			</td>
		</tr>
        <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK Core Usage</strong>
			</td>
			<td>Get started with WDK's Usage</td>
			<td>
				<a href="./usage.md">WDK Core Usage</a>
			</td>
		</tr>
        <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>Wallet Modules</strong>
			</td>
			<td>Explore blockchain-specific wallet modules</td>
			<td>
				<a href="../wallet-modules/README.md">WDK Wallet Modules</a>
			</td>
		</tr>
        <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>Bridge Modules</strong>
			</td>
			<td>Cross-chain USD₮0 bridges</td>
			<td>
				<a href="../bridge-modules/README.md">Bridge Modules</a>
			</td>
		</tr>
	</tbody>
</table>

***

### Need Help?

{% include "../../.gitbook/includes/support-cards.md" %}
