---
title: Usage
description: Learn how to use the WDK Core module
icon: book-open
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

This package serves as the main entry point and orchestrator for all WDK wallet modules, allowing you to register and manage different blockchain wallets and protocols through a single interface.
## Installation

Install the `@tetherto/wdk-core` package:

```bash
npm install @tetherto/wdk
```

***

## Basic Usage

### Importing WDK Core

{% code title="Import WDK Core" lineNumbers="true" %}
```typescript
import WDK from '@tetherto/wdk'
```
{% endcode %}


### Creating a WDK Instance

{% code title="Create WDK Instance" lineNumbers="true" %}
```typescript
// Generate a random seed phrase
const seedPhrase = WDK.getRandomSeedPhrase()

// Create WDK instance
const wdk = new WDK(seedPhrase)

// Or use your own seed phrase
const wdk = new WDK('your existing seed phrase here...')
```
{% endcode %}

***

## Wallet Registration

### Registering Wallets

{% code title="Register Wallets" lineNumbers="true" %}
```typescript
import WalletManagerEvm from '@tetherto/wdk-wallet-evm'
import WalletManagerTon from '@tetherto/wdk-wallet-ton'
import WalletManagerBtc from '@tetherto/wdk-wallet-btc'

// Register wallets for different blockchains
const wdk = new WDK(seedPhrase)
  .registerWallet('ethereum', WalletManagerEvm, {
    provider: 'https://eth.drpc.org'
  })
  .registerWallet('ton', WalletManagerTon, {
    tonApiKey: 'YOUR_TON_API_KEY',
    tonApiEndpoint: 'https://tonapi.io'
  })
  .registerWallet('bitcoin', WalletManagerBtc, {
    provider: 'https://blockstream.info/api'
  })
```
{% endcode %}

***

## Account Management

### Getting Accounts

{% code title="Get Accounts" lineNumbers="true" %}
```typescript
// Get account by blockchain and index
const ethAccount = await wdk.getAccount('ethereum', 0)
const tonAccount = await wdk.getAccount('ton', 0)

// Get account by derivation path
const customEthAccount = await wdk.getAccountByPath('ethereum', "0'/0/1")
const customTonAccount = await wdk.getAccountByPath('ton', "1'/2/3")

// Get addresses
const ethAddress = await ethAccount.getAddress()
const tonAddress = await tonAccount.getAddress()
console.log('Ethereum address:', ethAddress)
console.log('TON address:', tonAddress)
```
{% endcode %}

### Multi-Chain Account Management

{% code title="Multi-Chain Account Management" lineNumbers="true" %}
```typescript
// Get accounts for different chains
const accounts = {
  ethereum: await wdk.getAccount('ethereum', 0),
  arbitrum: await wdk.getAccount('arbitrum', 0),
  ton: await wdk.getAccount('ton', 0),
  bitcoin: await wdk.getAccount('bitcoin', 0)
}

// Get all addresses
for (const [chain, account] of Object.entries(accounts)) {
  const address = await account.getAddress()
  console.log(`${chain} address:`, address)
}
```
{% endcode %}

***

## Balance Operations

### Cross-Chain Balance Checking

{% code title="Cross-Chain Balance Checking" lineNumbers="true" %}
```typescript
async function checkAllBalances(wdk) {
  const chains = ['ethereum', 'arbitrum', 'ton', 'bitcoin']
  const balances = {}
  
  for (const chain of chains) {
    try {
      const account = await wdk.getAccount(chain, 0)
      const balance = await account.getBalance()
      balances[chain] = balance
      console.log(`${chain} balance:`, balance)
    } catch (error) {
      console.log(`${chain}: Wallet not registered`)
    }
  }
  
  return balances
}

// Usage
const balances = await checkAllBalances(wdk)
```
{% endcode %}

***

## Transaction Operations

### Sending Transactions

{% code title="Sending Transactions" lineNumbers="true" %}
```typescript
// Send Ethereum transaction
const ethAccount = await wdk.getAccount('ethereum', 0)
const ethResult = await ethAccount.sendTransaction({
  to: '0x...',
  value: '1000000000000000000' // 1 ETH
})
console.log('Ethereum transaction:', ethResult.hash)

// Send TON transaction
const tonAccount = await wdk.getAccount('ton', 0)
const tonResult = await tonAccount.sendTransaction({
  to: 'T...',
  value: '1000000000' // 1 TON
})
console.log('TON transaction:', tonResult.hash)
```
{% endcode %}

### Multi-Chain Transaction Function

{% code title="Multi-Chain Transaction Function" lineNumbers="true" %}
```typescript
async function sendMultiChainTransactions(wdk) {
  // Ethereum transaction
  const ethAccount = await wdk.getAccount('ethereum', 0)
  const ethResult = await ethAccount.sendTransaction({
    to: '0x...',
    value: '1000000000000000000' // 1 ETH
  })
  console.log('Ethereum transaction:', ethResult.hash)
  
  // TON transaction
  const tonAccount = await wdk.getAccount('ton', 0)
  const tonResult = await tonAccount.sendTransaction({
    to: 'T...',
    value: '1000000000' // 1 TON
  })
  console.log('TON transaction:', tonResult.hash)
}
```
{% endcode %}

***

## Protocol Integration

### Registering Protocols

{% code title="Registering Protocols" lineNumbers="true" %}
```typescript
import veloraProtocolEvm from '@tetherto/wdk-protocol-swap-velora-evm'
import Usdt0ProtocolTon from '@tetherto/wdk-protocol-bridge-usdt0-ton' 

// Register protocols globally
const wdk = new WDK(seedPhrase)
  .registerWallet('ethereum', WalletManagerEvm, ethereumWalletConfig)
  .registerWallet('ton', WalletManagerTon, tonWalletConfig)
  .registerProtocol('ethereum', 'velora', veloraProtocolEvm, {
    apiKey: 'YOUR_velora_API_KEY'
  })
  .registerProtocol('ton', 'usdt0', Usdt0ProtocolTon, {
    tonApiKey: 'YOUR_TON_API_KEY'
  })
```
{% endcode %}

### Using Protocols

{% code title="Using Protocols" lineNumbers="true" %}
```typescript
// Get accounts with protocol support
const ethAccount = await wdk.getAccount('ethereum', 0)
const tonAccount = await wdk.getAccount('ton', 0)

// Use swap protocol
const velora = ethAccount.getSwapProtocol('velora')
const swapResult = await velora.swap({
  tokenIn: '0x...',
  tokenOut: '0x...',
  amountIn: '1000000',
  slippage: 0.01
})

// Use bridge protocol
const usdt0 = tonAccount.getBridgeProtocol('usdt0')
const bridgeResult = await usdt0.bridge({
  targetChain: 'ethereum',
  recipient: '0x...',
  amount: '1000000'
})
```
{% endcode %}

### Multiple Protocol Types

{% code title="Multiple Protocol Types" lineNumbers="true" %}
```typescript
// Register different protocol types
const account = await wdk.getAccount('ethereum', 0)

// Swap protocol
account.registerProtocol('velora', veloraProtocolEvm, veloraConfig)
const velora = account.getSwapProtocol('velora')

// Bridge protocol
account.registerProtocol('usdt0', Usdt0ProtocolEvm, usdt0Config)
const usdt0 = account.getBridgeProtocol('usdt0')

// Lending protocol
account.registerProtocol('aave', AaveProtocolEvm, aaveConfig)
const aave = account.getLendingProtocol('aave')
```
{% endcode %}

***

## Middleware

### Logging Middleware

{% code title="Logging Middleware" lineNumbers="true" %}
```typescript
// Register logging middleware
wdk.registerMiddleware('ethereum', async (account) => {
  const address = await account.getAddress()
  console.log('New Ethereum account created:', address)
})

wdk.registerMiddleware('ton', async (account) => {
  const address = await account.getAddress()
  console.log('New TON account created:', address)
})

// This will trigger the middleware
const account = await wdk.getAccount('ethereum', 0)
```
{% endcode %}

### Failover Middleware

{% code title="Failover Middleware" lineNumbers="true" %}
```typescript
import { getFailoverCascadeMiddleware } from '@tetherto/wdk-wrapper-failover-cascade'

// Register failover middleware
wdk.registerMiddleware('ethereum', getFailoverCascadeMiddleware({
  retries: 3,
  delay: 1000,
  fallbackProviders: [
    'https://backup-rpc-1.com',
    'https://backup-rpc-2.com'
  ]
}))

// Transactions will automatically retry with fallback providers
const account = await wdk.getAccount('ethereum', 0)
const result = await account.sendTransaction(tx) // Will retry on failure
```
{% endcode %}

***

## Complete Examples

### Multi-Chain Wallet Setup

{% code title="Multi-Chain Wallet Setup" lineNumbers="true" %}
```typescript
import WDK from '@tetherto/wdk'
import WalletManagerEvm from '@tetherto/wdk-wallet-evm'
import WalletManagerTon from '@tetherto/wdk-wallet-ton'
import veloraProtocolEvm from '@tetherto/wdk-protocol-swap-velora-evm'

async function setupMultiChainWallet() {
  // Generate or use existing seed phrase
  const seedPhrase = WDK.getRandomSeedPhrase()
  
  // Initialize WDK Manager
  const wdk = new WDK(seedPhrase)
    .registerWallet('ethereum', WalletManagerEvm, {
      provider: 'https://eth.drpc.org'
    })
    .registerWallet('ton', WalletManagerTon, {
      tonApiKey: 'YOUR_TON_API_KEY'
    })
    .registerProtocol('ethereum', 'velora', veloraProtocolEvm, {
      apiKey: 'YOUR_velora_API_KEY'
    })
  
  // Get accounts
  const ethAccount = await wdk.getAccount('ethereum', 0)
  const tonAccount = await wdk.getAccount('ton', 0)
  
  // Get addresses
  const ethAddress = await ethAccount.getAddress()
  const tonAddress = await tonAccount.getAddress()
  
  console.log('Ethereum address:', ethAddress)
  console.log('TON address:', tonAddress)
  
  return { wdk, ethAccount, tonAccount }
}
```
{% endcode %}

***

## Error Handling

### Handling Common Errors

{% code title="Handling Common Errors" lineNumbers="true" %}
```typescript
async function handleErrors(wdk) {
  try {
    // This will throw if no wallet registered for 'tron'
    const tronAccount = await wdk.getAccount('tron', 0)
  } catch (error) {
    console.error('Tron wallet not registered:', error.message)
  }
  
  try {
    const ethAccount = await wdk.getAccount('ethereum', 0)
    
    // This will throw if no swap protocol registered
    const uniswap = ethAccount.getSwapProtocol('uniswap')
  } catch (error) {
    console.error('Uniswap protocol not registered:', error.message)
  }
}
```
{% endcode %}

### Memory Management

{% code title="Memory Management" lineNumbers="true" %}
```typescript
async function cleanupExample(wdk) {
  // Use the WDK Manager
  const ethAccount = await wdk.getAccount('ethereum', 0)
  const tonAccount = await wdk.getAccount('ton', 0)
  
  // Perform operations
  const ethAddress = await ethAccount.getAddress()
  const tonAddress = await tonAccount.getAddress()
  
  // Clean up sensitive data
  wdk.dispose()
  
  // After dispose, accounts are no longer usable
  // This will throw an error
  try {
    await ethAccount.getAddress()
  } catch (error) {
    console.log('Account disposed, cannot access private keys')
  }
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
				<strong>WDK Core API</strong>
			</td>
			<td>Get started with WDK's API</td>
			<td>
				<a href="./api-reference.md">WDK Core API</a>
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
			<td>Cross-chain USDT0 bridges</td>
			<td>
				<a href="../bridge-modules/README.md">Bridge Modules</a>
			</td>
		</tr>
	</tbody>
</table>

***

## Need Help?

{% include "../../.gitbook/includes/support-cards.md" %}
