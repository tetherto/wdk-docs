---
title: Wallet BTC Configuration
description: Configuration options and settings for @tetherto/wdk-wallet-btc
icon: gear
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

## Wallet Configuration

```javascript
import WalletManagerBtc, { ElectrumTcp } from '@tetherto/wdk-wallet-btc'

const client = new ElectrumTcp({
  host: 'electrum.blockstream.info',
  port: 50001
})

const wallet = new WalletManagerBtc(seedPhrase, {
  client,
  network: 'bitcoin'
})
```

## Account Creation

```javascript
// WalletAccountBtc is created by the WalletManagerBtc
// It takes the same configuration as the manager
const account = await wallet.getAccount(0) // Get account at index 0
const customAccount = await wallet.getAccountByPath("0'/0/5") // Custom path
```

## Configuration Options

### Client

The `client` option specifies an Electrum client instance to use for blockchain data. When provided, the `host`, `port`, and `protocol` options are ignored.

**Type:** `IElectrumClient`

**Default:** None (falls back to host/port/protocol configuration)

**Example:**
```javascript
import { ElectrumTcp } from '@tetherto/wdk-wallet-btc'

const config = {
  client: new ElectrumTcp({ host: 'fulcrum.frznode.com', port: 50001 })
}
```

#### Built-in Transport Clients

The package provides four built-in transport clients:

```javascript
import { 
  ElectrumTcp,   // TCP transport (default, port 50001)
  ElectrumTls,   // TLS transport (port 50002)
  ElectrumSsl,   // SSL transport (port 50002)
  ElectrumWs     // WebSocket transport (port 50003)
} from '@tetherto/wdk-wallet-btc'

// TCP (default)
const tcpClient = new ElectrumTcp({ host: 'electrum.blockstream.info', port: 50001 })

// TLS
const tlsClient = new ElectrumTls({ host: 'electrum.blockstream.info', port: 50002 })

// SSL
const sslClient = new ElectrumSsl({ host: 'electrum.blockstream.info', port: 50002 })

// WebSocket
const wsClient = new ElectrumWs({ host: 'electrum.blockstream.info', port: 50003 })
```

#### Custom Electrum Client

You can implement your own client by extending `IElectrumClient`:

```javascript
import { IElectrumClient } from '@tetherto/wdk-wallet-btc'

class MyCustomElectrumClient implements IElectrumClient {
  // Implement the required interface methods
}

const wallet = new WalletManagerBtc(seedPhrase, {
  client: new MyCustomElectrumClient(params),
  network: 'bitcoin'
})
```

### Host

The `host` option specifies the Electrum server hostname to connect to for blockchain data. Ignored if `client` is provided.

**Type:** `string`

**Default:** `"electrum.blockstream.info"`

**Recommended:** Configure your own Electrum server for production use. Public servers can be 10-300x slower and may fail for addresses with many transactions.

**Example:**
```javascript
const config = {
  host: 'fulcrum.frznode.com' // Alternative public server
}
```

### Port

The `port` option specifies the Electrum server port to connect to. Ignored if `client` is provided.

**Type:** `number`

**Default:** `50001`

**Common Ports:**
- `50001` - TCP (default)
- `50002` - TLS/SSL
- `50003` - WebSocket

**Example:**
```javascript
const config = {
  port: 50001
}
```

### Protocol

The `protocol` option specifies the transport protocol to use. Ignored if `client` is provided.

**Type:** `string`

**Values:**
- `"tcp"` - TCP transport (default)
- `"tls"` - TLS transport
- `"ssl"` - SSL transport

**Default:** `"tcp"`

**Example:**
```javascript
const config = {
  host: 'electrum.blockstream.info',
  port: 50002,
  protocol: 'tls'
}
```

### Network

The `network` option specifies which Bitcoin network to use.

**Type:** `string`

**Values:**
- `"bitcoin"` - Bitcoin [mainnet](../../../resources/concepts.md#mainnet) (production)
- `"testnet"` - Bitcoin [testnet](../../../resources/concepts.md#testnet) (development)
- `"regtest"` - Bitcoin [regtest](../../../resources/concepts.md#regtest) (local testing)

**Default:** `"bitcoin"`

**Example:**
```javascript
const config = {
  network: 'testnet' // Use testnet for development
}
```

### BIP

The `bip` option specifies the address type derivation standard to use.

**Type:** `number`

**Values:**
- `84` - [BIP-84](../../../resources/concepts.md#bip-84-native-segwit) (P2WPKH / Native SegWit) - addresses start with `bc1` (mainnet) or `tb1` (testnet)
- `44` - [BIP-44](../../../resources/concepts.md#bip-44-legacy) (P2PKH / Legacy) - addresses start with `1` (mainnet) or `m`/`n` (testnet)

**Default:** `84`

**Example:**
```javascript
// Use legacy addresses
const config = {
  bip: 44
}
```

## Electrum Server Configuration

**Important**: While the package defaults to `electrum.blockstream.info:50001` for convenience, **we strongly recommend configuring your own Electrum server** for production use.

### Recommended Approach

**For Production:**
- Set up your own Fulcrum server for optimal performance and reliability
- Use recent Fulcrum versions that support pagination for high-transaction addresses

**For Development/Testing:**
- `fulcrum.frznode.com:50001` - Generally faster than default
- `electrum.blockstream.info:50001` - Default fallback

### Configuration Examples

```javascript
import { ElectrumTcp, ElectrumTls } from '@tetherto/wdk-wallet-btc'

// Production with custom Fulcrum server
const productionClient = new ElectrumTls({
  host: 'your-fulcrum-server.com',
  port: 50002
})

const productionWallet = new WalletManagerBtc(seedPhrase, {
  client: productionClient,
  network: 'bitcoin'
})

// Development with alternative public server
const developmentClient = new ElectrumTcp({
  host: 'fulcrum.frznode.com',
  port: 50001
})

const developmentWallet = new WalletManagerBtc(seedPhrase, {
  client: developmentClient,
  network: 'bitcoin'
})
```

### Network-Specific Configuration

#### Bitcoin Mainnet

```javascript
import { ElectrumTcp } from '@tetherto/wdk-wallet-btc'

const client = new ElectrumTcp({
  host: 'electrum.blockstream.info', // Or your own server
  port: 50001
})

const wallet = new WalletManagerBtc(seedPhrase, {
  client,
  network: 'bitcoin'
})
```

#### Bitcoin Testnet

```javascript
import { ElectrumTcp } from '@tetherto/wdk-wallet-btc'

const client = new ElectrumTcp({
  host: 'testnet.hsmiths.com', // Example testnet server
  port: 53011
})

const wallet = new WalletManagerBtc(seedPhrase, {
  client,
  network: 'testnet'
})
```

#### Bitcoin Regtest

```javascript
import { ElectrumTcp } from '@tetherto/wdk-wallet-btc'

const client = new ElectrumTcp({
  host: 'localhost', // Local regtest node
  port: 50001
})

const wallet = new WalletManagerBtc(seedPhrase, {
  client,
  network: 'regtest'
})
```

## Derivation Paths

Bitcoin wallet addresses are derived using BIP-32 hierarchical deterministic paths:

### BIP-84 (Native SegWit) - Default

- `m/84'/0'/0'/0/0` for mainnet account 0, address 0
- `m/84'/1'/0'/0/0` for testnet/regtest account 0, address 0

Addresses start with `bc1` (mainnet) or `tb1` (testnet).

### BIP-44 (Legacy)

- `m/44'/0'/0'/0/0` for mainnet account 0, address 0
- `m/44'/1'/0'/0/0` for testnet/regtest account 0, address 0

Addresses start with `1` (mainnet) or `m`/`n` (testnet).

{% hint style="warning" %}
**Default Derivation Path Change in v1.0.0-beta.4+**

The default derivation path was updated in v1.0.0-beta.4 to use BIP-84 (Native SegWit) instead of BIP-44 (Legacy):

- **Previous path** (<= v1.0.0-beta.3): `m/44'/0'/0'/0/{index}` (Legacy addresses)
- **Current path** (v1.0.0-beta.4+): `m/84'/0'/0'/0/{index}` (Native SegWit addresses)

If you're upgrading from an earlier version, existing wallets created with the old path will generate different addresses. Make sure to migrate any existing wallets or use the old path explicitly if needed for compatibility.

Use [`getAccountByPath`](./api-reference.md#getaccountbypathpath) to supply an explicit derivation path when importing or recreating legacy wallets.

{% endhint %}

## Complete Configuration Example

```javascript
import WalletManagerBtc, { ElectrumTls } from '@tetherto/wdk-wallet-btc'

// Create Electrum client
const client = new ElectrumTls({
  host: 'your-electrum-server.com', // Replace with your server
  port: 50002
})

// Create wallet manager with configuration
const wallet = new WalletManagerBtc(seedPhrase, {
  client,
  network: 'bitcoin',
  bip: 84 // Native SegWit (default)
})

// Get accounts (inherit configuration from manager)
const account0 = await wallet.getAccount(0)
const account1 = await wallet.getAccount(1)
const customAccount = await wallet.getAccountByPath("0'/0/5")

// Clean up when done
wallet.dispose()
```

## Performance Considerations

**Electrum Server Performance:**
- Public servers like Blockstream's can be significantly slower
- Addresses with many transactions may cause timeouts
- Custom Fulcrum servers provide better performance and reliability
- Consider server location and network latency

**Configuration Tips:**
- Use `fulcrum.frznode.com` for better development performance
- Set up your own Fulcrum server for production
- Monitor connection stability and implement retry logic
- Consider using multiple backup servers


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
				<a href="../../../start-building/nodejs-bare-quickstart.md">nodejs-quickstart.md</a>
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
				<a href="../../../start-building/react-native-quickstart.md">react-native-quickstart.md</a>
			</td>
		</tr>
    	<tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK BTC Wallet Usage</strong>
			</td>
			<td>Get started with WDK's BTC Wallet Usage</td>
			<td>
				<a href="./usage.md">WDK BTC Wallet Usage</a>
			</td>
		</tr>
        <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK BTC Wallet API</strong>
			</td>
			<td>Get started with WDK's BTC Wallet API</td>
			<td>
				<a href="./api-reference.md">WDK BTC Wallet API</a>
			</td>
		</tr>
	 </tbody>
</table>

***

### Need Help?

{% include "../../../.gitbook/includes/support-cards.md" %}
