---
title: WDK Core Configuration
description: Configuration options and settings for @tetherto/wdk
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

# Configuration

## WDK Manager Configuration

{% code title="Create WDK Instance" lineNumbers="true" %}
```javascript
import WDK from '@tetherto/wdk'

const wdk = new WDK(seedPhrase)
```
{% endcode %}


The WDK Manager itself only requires a seed phrase for initialization. Configuration is done through the registration of wallets and protocols.

## Wallet Registration Configuration

{% code title="Register WDK Wallet" lineNumbers="true" %}
```javascript
import WDK from '@tetherto/wdk'
import WalletManagerEvm from '@tetherto/wdk-wallet-evm'
import WalletManagerTon from '@@tetherto/wdk-wallet-ton'

const wdk = new WDK(seedPhrase)
  .registerWallet('ethereum', WalletManagerEvm, {
    provider: 'https://mainnet.infura.io/v3/YOUR_API_KEY'
  })
  .registerWallet('ton', WalletManagerTon, {
    tonApiKey: 'YOUR_TON_API_KEY',
    tonApiEndpoint: 'https://tonapi.io'
  })
```
{% endcode %}


## Protocol Registration Configuration

{% code title="Register WDK Protocol" lineNumbers="true" %}
```javascript
import ParaswapProtocolEvm from '@tetherto/wdk-protocol-swap-paraswap-evm'
import Usdt0ProtocolTon from '@tetherto/wdk-protocol-bridge-usdt0-ton'

const wdk = new WDK(seedPhrase)
  .registerProtocol('ethereum', 'paraswap', ParaswapProtocolEvm, {
    apiKey: 'YOUR_PARASWAP_API_KEY'
  })
  .registerProtocol('ton', 'usdt0', Usdt0ProtocolTon, {
    tonApiKey: 'YOUR_TON_API_KEY'
  })
```
{% endcode %}


## Configuration Options

### Wallet Configuration

Each wallet manager requires its own configuration object when registered. The configuration depends on the specific wallet module being used.

#### EVM Wallet Configuration

{% code title="Ethereum WDK Wallet Configuration" lineNumbers="true" %}
```javascript
const ethereumWalletConfig = {
  provider: 'https://mainnet.infura.io/v3/YOUR_API_KEY', // RPC endpoint
  // Additional EVM-specific configuration options
}

wdk.registerWallet('ethereum', WalletManagerEvm, ethereumWalletConfig)
```
{% endcode %}


#### TON Wallet Configuration

{% code title="TON WDK Wallet Configuration" lineNumbers="true" %}
```javascript
const tonConfig = {
  tonApiKey: 'YOUR_TON_API_KEY',
  tonApiEndpoint: 'https://tonapi.io',
  tonCenterApiKey: 'YOUR_TON_CENTER_API_KEY',
  tonCenterEndpoint: 'https://toncenter.com'
}

wdk.registerWallet('ton', WalletManagerTon, tonWalletConfig)
```
{% endcode %}


### Protocol Configuration

Protocols also require their own configuration objects when registered.

#### Swap Protocol Configuration

{% code title="Swap WDK Protocol Configuration" lineNumbers="true" %}
```javascript
const paraswapProtocolConfig = {
  apiKey: 'YOUR_PARASWAP_API_KEY',
  baseUrl: 'https://apiv5.paraswap.io'
}

wdk.registerProtocol('ethereum', 'paraswap', ParaswapProtocolEvm, paraswapProtocolConfig)
```
{% endcode %}


#### Bridge Protocol Configuration

{% code title="Bridge WDK Protocol Configuration" lineNumbers="true" %}
```javascript
const usdt0ProtocolConfig = {
  tonApiKey: 'YOUR_TON_API_KEY',
  ethereumRpcUrl: 'https://mainnet.infura.io/v3/YOUR_API_KEY'
}

wdk.registerProtocol('ton', 'usdt0', Usdt0ProtocolTon, usdt0ProtocolConfig)
```
{% endcode %}


### Middleware Configuration

Middleware functions can be registered to enhance account functionality.

{% code title="Middleware WDK Protocol Configuration" lineNumbers="true" %}
```javascript
// Simple logging middleware
wdk.registerMiddleware('ethereum', async (account) => {
  console.log('New account created:', await account.getAddress())
})

// Failover cascade middleware
import { getFailoverCascadeMiddleware } from '@tetherto/wdk-wrapper-failover-cascade'

wdk.registerMiddleware('ethereum', getFailoverCascadeMiddleware(fallbackOptions))
```
{% endcode %}


## Environment Variables

For production applications, consider using environment variables for sensitive configuration:

{% code title="WDK enviroment variables Configuration" lineNumbers="true" %}
```javascript
const wdk = new WDK(process.env.SEED_PHRASE)
  .registerWallet('ethereum', WalletManagerEvm, {
    provider: process.env.ETHEREUM_RPC_URL
  })
  .registerProtocol('ethereum', 'paraswap', ParaswapProtocolEvm, {
    apiKey: process.env.PARASWAP_API_KEY
  })
```
{% endcode %}


## Configuration Validation

The WDK Manager will validate configurations when wallets and protocols are registered:

- **Wallet Registration**: Ensures the wallet class extends the required base class
- **Protocol Registration**: Validates that protocol labels are unique per blockchain and protocol type
- **Middleware Registration**: Validates that middleware functions have the correct signature

## Error Handling

Configuration errors will be thrown during registration:

{% code title="Configuration errors" lineNumbers="true" %}
```javascript
try {
  wdk.registerWallet('ethereum', InvalidWalletClass, config)
} catch (error) {
  console.error('Wallet registration failed:', error.message)
}

try {
  wdk.registerProtocol('ethereum', 'paraswap', ParaswapProtocolEvm, invalidConfig)
} catch (error) {
  console.error('Protocol registration failed:', error.message)
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
				<strong>WDK Core Usage</strong>
			</td>
			<td>Get started with WDK's usage</td>
			<td>
				<a href="./usage.md">WDK Core Usage</a>
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
    <tr>
            <td>
                <i class="fa-code">:code:</i>
            </td>
            <td>
                <strong>Lending Modules</strong>
            </td>
            <td>Supply, borrow, repay (e.g., Aave)</td>
            <td>
                <a href="../lending-modules/README.md">Lending Modules</a>
            </td>
        </tr>
    <tr>
            <td>
                <i class="fa-code">:code:</i>
            </td>
            <td>
                <strong>Swap Modules</strong>
            </td>
            <td>Token swaps on supported chains</td>
            <td>
                <a href="../swap-modules/README.md">Swap Modules</a>
            </td>
        </tr>
	</tbody>
</table>

***

### Need Help?

{% include "../../.gitbook/includes/support-cards.md" %}

