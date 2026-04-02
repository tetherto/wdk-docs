---
title: Get Started
description: Install the bridge package, wire WalletAccountEvm, and review supported chains.
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

This guide shows how to [install the package](#install-the-package), [create an EVM account](#create-an-evm-account), [instantiate the bridge protocol](#instantiate-the-bridge-protocol), and review [supported chains](#supported-chains).

## Install the package

### Prerequisites

* **[Node.js](https://nodejs.org/)**: version 18 or higher.
* **[npm](https://www.npmjs.com/)**: usually bundled with Node.js.

You can add the published package to your project from npm: [@tetherto/wdk-protocol-bridge-usdt0-evm](https://www.npmjs.com/package/@tetherto/wdk-protocol-bridge-usdt0-evm).

{% code title="Install @tetherto/wdk-protocol-bridge-usdt0-evm" lineNumbers="true" %}
```bash
npm install @tetherto/wdk-protocol-bridge-usdt0-evm
```
{% endcode %}

## Create an EVM account

You can construct a signing account using [`new WalletAccountEvm(seed, path, config?)`](../../../wallet-modules/wallet-evm/api-reference.md#constructor-1) from `@tetherto/wdk-wallet-evm` with an RPC `provider`:

{% code title="Create WalletAccountEvm" lineNumbers="true" %}
```javascript
import { WalletAccountEvm } from '@tetherto/wdk-wallet-evm'

const seedPhrase = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'

const account = new WalletAccountEvm(seedPhrase, "0'/0/0", {
  provider: 'https://eth.drpc.org'
})
```
{% endcode %}

{% hint style="danger" %}
**Seed phrase:** Store the mnemonic securely. Anyone with the phrase controls the funds on derived accounts.
{% endhint %}

## Instantiate the bridge protocol

You can create a [`Usdt0ProtocolEvm`](../api-reference.md#usdt0protocolevm) instance with the [`new Usdt0ProtocolEvm(account, config?)`](../api-reference.md#constructor) constructor. Optional `bridgeMaxFee` caps the total bridge cost in wei (see [BridgeProtocolConfig](../api-reference.md#bridgeprotocolconfig)):

{% code title="Construct Usdt0ProtocolEvm" lineNumbers="true" %}
```javascript
import Usdt0ProtocolEvm from '@tetherto/wdk-protocol-bridge-usdt0-evm'

const bridgeProtocol = new Usdt0ProtocolEvm(account, {
  bridgeMaxFee: 1000000000000000n
})
```
{% endcode %}

{% hint style="info" %}
The account must not be read-only. Read-only accounts cannot call [`bridge()`](../api-reference.md#bridge-options-config).
{% endhint %}

## Supported chains

Bridge operations use EVM source chains listed in the [API reference](../api-reference.md#supported-chains). Destination routes include the same EVM set where USD₮0 contracts are deployed, plus Solana (EID 30168), TON (EID 30343), and TRON (EID 30420).

**Source chains (EVM, `targetChain` keys)**

| Chain | Key | Chain ID |
| --- | --- | --- |
| Ethereum | `ethereum` | 1 |
| Arbitrum | `arbitrum` | 42161 |
| Optimism | `optimism` | 10 |
| Polygon | `polygon` | 137 |
| Berachain | `berachain` | 80094 |
| Ink | `ink` | 57073 |
| Plasma | `plasma` | 9745 |
| Conflux eSpace | `conflux` | 1030 |
| Corn | `corn` | 21000000 |
| Avalanche | `avalanche` | 43114 |
| Celo | `celo` | 42220 |
| Flare | `flare` | 14 |
| HyperEVM | `hyperevm` | 999 |
| Mantle | `mantle` | 5000 |
| MegaETH | `megaeth` | 4326 |
| Monad | `monad` | 143 |
| Morph | `morph` | 2818 |
| Rootstock | `rootstock` | 30 |
| Sei | `sei` | 1329 |
| Stable | `stable` | 988 |
| Unichain | `unichain` | 130 |
| XLayer | `xlayer` | 196 |

Arbitrum supports ERC-4337 workflows (see [Bridge with ERC-4337](./bridge-with-4337.md)).

**Non-EVM destinations**

| Network | `targetChain` | Endpoint ID |
| --- | --- | --- |
| Solana | `solana` | 30168 |
| TON | `ton` | 30343 |
| TRON | `tron` | 30420 |

## Next Steps

Run a standard EVM-to-EVM transfer with [Bridge tokens](./bridge-tokens.md), or use [Bridge with ERC-4337](./bridge-with-4337.md) for gasless flows on supported networks.
