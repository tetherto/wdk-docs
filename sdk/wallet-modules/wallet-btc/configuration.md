---
title: Wallet BTC Configuration
description: Configuration options and settings for @tetherto/wdk-wallet-btc
lastReviewed: 2025-06-26
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
const config = {
  host: 'electrum.blockstream.info', // Electrum server hostname
  port: 50001,                       // Electrum server port
  network: 'bitcoin'                 // Network: 'bitcoin', 'testnet', or 'regtest'
}

const wallet = new WalletManagerBtc(seedPhrase, config)
```

## Account Creation

```javascript
// WalletAccountBtc is created by the WalletManagerBtc
// It takes the same configuration as the manager
const account = await wallet.getAccount(0) // Get account at index 0
const customAccount = await wallet.getAccountByPath("0'/0/5") // Custom path
```

## Configuration Options

### Host

The `host` option specifies the Electrum server hostname to connect to for blockchain data.

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

The `port` option specifies the Electrum server port to connect to.

**Type:** `number`

**Default:** `50001`

**Common Ports:**
- `50001` - TCP (default)
- `50002` - SSL (configure separately if needed)

**Example:**
```javascript
const config = {
  port: 50001
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
// Production with custom Fulcrum server
const productionConfig = {
  host: 'your-fulcrum-server.com',
  port: 50001,
  network: 'bitcoin'
}

// Development with alternative public server
const developmentConfig = {
  host: 'fulcrum.frznode.com',
  port: 50001,
  network: 'bitcoin'
}
```

### Network-Specific Configuration

#### Bitcoin Mainnet

```javascript
const mainnetConfig = {
  host: 'electrum.blockstream.info', // Or your own server
  port: 50001,
  network: 'bitcoin'
}
```

#### Bitcoin Testnet

```javascript
const testnetConfig = {
  host: 'testnet.hsmiths.com', // Example testnet server
  port: 53011,
  network: 'testnet'
}
```

#### Bitcoin Regtest

```javascript
const regtestConfig = {
  host: 'localhost', // Local regtest node
  port: 50001,
  network: 'regtest'
}
```

## BIP-84 Derivation Paths

Bitcoin uses [BIP-84](../../../resources/concepts.md#bip-84-native-segwit) standard derivation paths for Native SegWit addresses:

- `m/84'/0'/0'/0/0` for account 0, address 0
- `m/84'/0'/0'/0/1` for account 0, address 1
- `m/84'/0'/1'/0/0` for account 1, address 0
- etc.

**Note:** Only Native SegWit (P2WPKH) addresses are supported, starting with 'bc1' (mainnet) or 'tb1' (testnet).

## Complete Configuration Example

```javascript
import WalletManagerBtc from '@tetherto/wdk-wallet-btc'

// Create wallet manager with configuration
const wallet = new WalletManagerBtc(seedPhrase, {
  host: 'your-electrum-server.com', // Replace with your server
  port: 50001,
  network: 'bitcoin'
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
				<a href="./configuration.md">WDK BTC Wallet Usage</a>
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
