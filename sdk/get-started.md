---
title: Get Started
description: Learn about the SDK and modules architecture
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

# Get Started

The SDK is a comprehensive, modular plug-in framework designed to simplify multi-chain wallet development.

It is built on some core principles: **self-custodial and stateless** (private keys never leave your app and no data is stored by WDK), **unified interface** (consistent API across all blockchains), and **cross-platform compatibility** (works seamlessly from Node.js to React Native to embedded systems).

#### Capabilities

* **Multi-Chain Support**: Bitcoin, Ethereum, TON, TRON, Solana, Spark, and more
* **Account Abstraction**: Gasless transactions on supported chains
* **DeFi Integration**: Plug-in support for swaps, bridges, and lending protocols
* **Multisig Wallets**: Safe Protocol integration for multi-party wallet control
* **Extensible Design**: Add custom modules for new blockchains or protocols

***

### Modular Architecture

WDK's architecture is built around the concept of composable modules. Each module is a specialized component that handles specific functionality, allowing you to build exactly what you need without unnecessary complexity.

<!-- <figure><img src="../assets/sdk-architecture.png" alt="WDK SDK Architecture"><figcaption><p>WDK SDK modular architecture with core orchestrator and specialized modules</p></figcaption></figure> -->

Each module has a single responsibility. Wallet modules handle blockchain operations, protocol modules manage DeFi interactions, and the core module orchestrates everything.

New functionality is added through modules rather than modifying core code. Also, modules are configured through simple objects, making them easy to customize for different environments and use cases.

***

#### Module Types

WDK modules are organized into six main categories, each serving a specific purpose in the blockchain application stack:

<table data-view="cards">
	<thead>
		<tr>
			<th></th>
			<th></th>
			<th data-hidden data-card-target data-type="content-ref"></th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>
				<strong>Core</strong>
			</td>
			<td>Main orchestrator and shared utilities</td>
			<td>
				<a href="./core-module/README.md">@tetherto/wdk</a>
			</td>
		</tr>
		<tr>
			<td>
				<strong>Wallet</strong>
			</td>
			<td>Blockchain-specific wallet operations</td>
			<td>
				<a href="./wallet-modules/README.md">Wallet Modules</a>
			</td>
		</tr>
		<tr>
			<td>
				<strong>Multisig</strong>
			</td>
			<td>Multi-party wallet management</td>
			<td>
				<a href="./multisig-modules/README.md">Multisig Modules</a>
			</td>
		</tr>
		<tr>
			<td>
				<strong>Swap</strong>
			</td>
			<td>Token swapping across DEXs</td>
			<td>
				<a href="./swap-modules/README.md">Swap Modules</a>
			</td>
		</tr>
		<tr>
			<td>
				<strong>Bridge</strong>
			</td>
			<td>Cross-chain asset transfers</td>
			<td>
				<a href="./bridge-modules/README.md">Bridge Modules</a>
			</td>
		</tr>
		<tr>
			<td>
				<strong>Lending</strong>
			</td>
			<td>DeFi lending and borrowing</td>
			<td>
				<a href="./lending-modules/README.md">Lending Modules</a>
			</td>
		</tr>
	</tbody>
</table>

***

### How to use the SDK

The WDK SDK uses a registration-based system where modules are added to a central orchestrator. This creates a unified interface while maintaining module independence.

#### Registration Flow

**1. Core Module Initialization**

{% code title="Initialize WDK" lineNumbers="true" %}
```typescript
import WDK from '@tetherto/wdk'

const seedPhrase = WDK.getRandomSeedPhrase() // or use your own seed phrase

const wdk = new WDK(seedPhrase)
```
{% endcode %}

**2. Wallet Module Registration**

{% code title="Register Wallets" lineNumbers="true" %}
```typescript
import WalletManagerEvm from '@tetherto/wdk-wallet-evm'
import WalletManagerBtc from '@tetherto/wdk-wallet-btc'

const wdkWithWallets = wdk
  .registerWallet('ethereum', WalletManagerEvm, {
    provider: 'https://eth.drpc.org'
  })
  .registerWallet('bitcoin', WalletManagerBtc, {
    provider: 'https://blockstream.info/api'
  })
```
{% endcode %}

**3. Protocol Module Registration**

{% code title="Register Protocols" lineNumbers="true" %}
```typescript
import SwapveloraEvm from '@tetherto/wdk-protocol-swap-velora-evm'

const wdkWithProtocols = wdkWithWallets
  .registerProtocol('swap-velora-evm', SwapveloraEvm)
```
{% endcode %}

#### Unified Operations

Once registered, all modules work through the same interface:

{% code title="Unified Operations" lineNumbers="true" %}
```typescript
// Get accounts from different blockchains using the same method
const ethAccount = await wdkWithProtocols.getAccount('ethereum', 0)
const btcAccount = await wdkWithProtocols.getAccount('bitcoin', 0)

// Check balances using unified interface
const ethBalance = await ethAccount.getBalance()
const btcBalance = await btcAccount.getBalance()

// Send transactions with consistent API
const ethTx = await ethAccount.sendTransaction({
  to: '0x...',
  value: '1000000000000000000'
})

const btcTx = await btcAccount.sendTransaction({
  to: '1A1z...',
  value: 100000000
})

// Use DeFi protocols through the same interface
const swapResult = await wdkWithProtocols.executeProtocol('swap-velora-evm', {
  fromToken: 'ETH',
  toToken: 'USDT',
  amount: '1000000000000000000'
})
```
{% endcode %}

***

### Creating Custom Modules

WDK's modular architecture makes it straightforward to add support for new blockchains or protocols. Each module type has a specific interface that must be implemented.

#### Wallet Module Interface

{% code title="Custom Wallet Module Setup" lineNumbers="true" %}
```typescript
interface WalletModule {
  // Account management
  getAccount(index: number): Promise<Account>
  getAddress(index: number): Promise<string>
  getBalance(index: number): Promise<BigNumber>
  
  // Transaction operations
  sendTransaction(params: TransactionParams): Promise<TransactionResult>
  estimateTransaction(params: TransactionParams): Promise<TransactionQuote>
  
  // Key management
  signMessage(message: string, index: number): Promise<string>
  verifySignature(message: string, signature: string, address: string): Promise<boolean>
  
  // Blockchain-specific operations
  getTransactionHistory(index: number, limit?: number): Promise<Transaction[]>
  getTokenBalance(index: number, tokenAddress: string): Promise<BigNumber>
}
```
{% endcode %}


#### Protocol Module Interface

{% code title="Custom Protocol Module Setup" lineNumbers="true" %}
```typescript
interface ProtocolModule {
  // Protocol execution
  execute(params: ProtocolParams): Promise<ProtocolResult>
  estimate(params: ProtocolParams): Promise<ProtocolQuote>
  
  // Supported operations
  getSupportedTokens(): Promise<Token[]>
  getSupportedChains(): Promise<Chain[]>
  getOperationTypes(): Promise<OperationType[]>
  
  // Protocol-specific methods
  getLiquidityPools?(): Promise<Pool[]>
  getLendingRates?(): Promise<Rate[]>
  getBridgeRoutes?(): Promise<Route[]>
}
```
{% endcode %}


#### Module Implementation Example

{% code title="Custom Wallet Module Implementation" lineNumbers="true" %}
```typescript
class CustomWalletModule implements WalletModule {
  private provider: string
  private chainId: number
  
  constructor(config: { provider: string; chainId: number }) {
    this.provider = config.provider
    this.chainId = config.chainId
  }
  
  async getAccount(index: number): Promise<Account> {
    // Implement account derivation logic
    const privateKey = await this.derivePrivateKey(index)
    return new CustomAccount(privateKey, this.provider)
  }
  
  async getAddress(index: number): Promise<string> {
    const account = await this.getAccount(index)
    return account.getAddress()
  }
  
  async getBalance(index: number): Promise<BigNumber> {
    const address = await this.getAddress(index)
    // Implement balance fetching logic
    const balance = await this.fetchBalance(address)
    return new BigNumber(balance)
  }
  
  async sendTransaction(params: TransactionParams): Promise<TransactionResult> {
    // Implement transaction sending logic
    const account = await this.getAccount(params.accountIndex)
    const tx = await account.sendTransaction(params)
    return tx
  }
  
  // Additional methods...
}
```
{% endcode %}


#### Module Registration

{% code title="Custom Wallet Module Registration" lineNumbers="true" %}
```typescript
// Register your custom module
const wdkWithCustom = wdk.registerWallet('custom-chain', CustomWalletModule, {
  provider: 'https://custom-rpc-endpoint.com',
  chainId: 12345
})

// Use it like any other module
const customAccount = await wdkWithCustom.getAccount('custom-chain', 0)
const balance = await customAccount.getBalance()
```
{% endcode %}


<!-- {% hint style="info" %} -->
<!-- **Learn More**: For detailed information on creating custom modules, check out our [Extender Guide](../extender-guide.md).
{% endhint %} -->

***

### Quick Start Paths

Ready to start building? Choose your development environment:

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
				<strong>Node.js Quickstart</strong>
			</td>
			<td>Get started with WDK in a Node.js environment</td>
			<td>
				<a href="../start-building/nodejs-bare-quickstart.md">nodejs-quickstart.md</a>
			</td>
		</tr>
		<tr>
			<td>
				<i class="fa-mobile-alt">:mobile-alt:</i>
			</td>
			<td>
				<strong>React Native Quickstart</strong>
			</td>
			<td>Build mobile wallets with React Native Expo</td>
			<td>
				<a href="../start-building/react-native-quickstart.md">react-native-quickstart.md</a>
			</td>
		</tr>
	</tbody>
</table>


***

### Need Help?

{% include "../.gitbook/includes/support-cards.md" %}