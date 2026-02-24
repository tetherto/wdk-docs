---
title: Lending Aave EVM Guides
description: How to install and use @tetherto/wdk-protocol-lending-aave-evm on EVM
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

## Installation

```bash
npm install @tetherto/wdk-protocol-lending-aave-evm
```

## Quick Start

### Setting Up the Lending Service

```javascript
import AaveProtocolEvm from '@tetherto/wdk-protocol-lending-aave-evm'
import { WalletAccountEvm } from '@tetherto/wdk-wallet-evm'

const seedPhrase = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

// Create account (m/44'/60'/0'/0/0)
const account = new WalletAccountEvm(seedPhrase, "0'/0/0", {
    provider: 'https://ethereum-rpc.publicnode.com'
})

// Create lending service
const aave = new AaveProtocolEvm(account)
```

### Supply / Withdraw / Borrow / Repay

{% hint style="info" %}
**Prerequisites:** To use supply, withdraw, borrow, or repay operations, your wallet needs:
1. **Token balance** — hold the token you want to supply or repay
2. **Native token for gas fees** — ETH (or the chain's native token) to pay transaction fees

This module only supports mainnet deployments. See [Supported Networks](./configuration.md) for the full list.
{% endhint %}

Use the contract address of any [Aave-supported token](https://aave.com/markets). For example, USD₮ on Ethereum Mainnet:

```javascript
// USD₮ contract address on Ethereum Mainnet
const USDT = '0xdAC17F958D2ee523a2206206994597C13D831ec7'

// Supply 1,000,000 base units (token decimals dependent)
await aave.supply({ token: USDT, amount: 1000000n })

// Withdraw
await aave.withdraw({ token: USDT, amount: 1000000n })

// Borrow
await aave.borrow({ token: USDT, amount: 1000000n })

// Repay
await aave.repay({ token: USDT, amount: 1000000n })
```

### Quotes Before Sending

```javascript
const supplyQuote   = await aave.quoteSupply({ token: USDT, amount: 1000000n })
const withdrawQuote = await aave.quoteWithdraw({ token: USDT, amount: 1000000n })
const borrowQuote   = await aave.quoteBorrow({ token: USDT, amount: 1000000n })
const repayQuote    = await aave.quoteRepay({ token: USDT, amount: 1000000n })
```

## ERC‑4337 Smart Accounts

```javascript
import { WalletAccountEvmErc4337 } from '@tetherto/wdk-wallet-evm-erc-4337'

const aa = new WalletAccountEvmErc4337(seedPhrase, "0'/0/0", {
  provider: 'https://arb1.arbitrum.io/rpc',
  bundlerUrl: 'YOUR_BUNDLER',
  paymasterUrl: 'YOUR_PAYMASTER'
})

const aaveAA = new AaveProtocolEvm(aa)

// Supply with paymaster covering gas
const result = await aaveAA.supply({ token: '0xdAC17F958D2ee523a2206206994597C13D831ec7', amount: 1000000n }, { // USD₮ on Ethereum
  paymasterToken: 'USDT'
})
```

## Reading Account Data

```javascript
const data = await aave.getAccountData()
console.log({
  totalCollateralBase: data.totalCollateralBase,
  totalDebtBase: data.totalDebtBase,
  availableBorrowsBase: data.availableBorrowsBase,
  currentLiquidationThreshold: data.currentLiquidationThreshold,
  ltv: data.ltv,
  healthFactor: data.healthFactor
})
```

## Error Handling

```javascript
try {
  await aave.supply({ token: '0xdAC17F958D2ee523a2206206994597C13D831ec7', amount: 0n }) // USD₮
} catch (e) {
  console.error('Lending failed:', e.message)
  if (e.message.includes('zero')) console.log('Amount must be > 0')
}
```

## Complete Example

```javascript
import AaveProtocolEvm from '@tetherto/wdk-protocol-lending-aave-evm'
import { WalletAccountEvm } from '@tetherto/wdk-wallet-evm'

async function run() {
  const account = new WalletAccountEvm(seedPhrase, "0'/0/0", {
    provider: 'https://ethereum-rpc.publicnode.com'
  })
  const aave = new AaveProtocolEvm(account)

  // Quote then supply
  // USD₮ contract address on Ethereum Mainnet
  const USDT = '0xdAC17F958D2ee523a2206206994597C13D831ec7'

  const q = await aave.quoteSupply({ token: USDT, amount: 1000000n })
  console.log('Supply fee estimate:', q.fee)

  const tx = await aave.supply({ token: USDT, amount: 1000000n })
  console.log('Supply tx hash:', tx.hash)
}
```


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
				<a href="../../../start-building/nodejs-bare-quickstart.md">Node.js & Bare Quickstart</a>
			</td>
		</tr>
        <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK Lending Aave EVM Protocol Configuration</strong>
			</td>
			<td>Get started with WDK's Lending Aave EVM Protocol configuration</td>
			<td>
				<a href="./configuration.md">WDK Lending Aave EVM Protocol Configuration</a>
			</td>
		</tr>
        <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK Lending Aave EVM Protocol API</strong>
			</td>
			<td>Get started with WDK's Lending Aave EVM Protocol API</td>
			<td>
				<a href="./api-reference.md">WDK Lending Aave EVM Protocol API</a>
			</td>
		</tr>
	</tbody>
</table>

***

### Need Help?

{% include "../../../.gitbook/includes/support-cards.md" %}




