---
title: Swap velora EVM API Reference
description: API reference for @tetherto/wdk-protocol-swap-velora-evm
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

## Class: VeloraProtocolEvm

Main class for velora token swaps on EVM.

### Constructor

```javascript
new VeloraProtocolEvm(account, config?)
```

Parameters:
- `account`: `WalletAccountEvm | WalletAccountReadOnlyEvm | WalletAccountEvmErc4337 | WalletAccountReadOnlyEvmErc4337`
- `config` (optional):
  - `swapMaxFee` (`number | bigint`): maximum total gas fee allowed (wei)

Example:

```javascript
const swap = new VeloraProtocolEvm(account, { swapMaxFee: 200000000000000n })
```

### Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `swap(options, config?)` | Perform a token swap | `Promise<{hash: string, fee: bigint, tokenInAmount: bigint, tokenOutAmount: bigint, approveHash?: string, resetAllowanceHash?: string}>` |
| `quoteSwap(options, config?)` | Get estimated fee and amounts | `Promise<{fee: bigint, tokenInAmount: bigint, tokenOutAmount: bigint}>` |

---

### `swap(options, config?)`
Execute a swap via velora.

Options:
- `tokenIn` (`string`): Address of the ERC‑20 token to sell
- `tokenOut` (`string`): Address of the ERC‑20 token to buy
- `tokenInAmount` (`number | bigint`, optional): Exact input amount (base units)
- `tokenOutAmount` (`number | bigint`, optional): Exact output amount (base units)
- `to` (`string`, optional): Recipient address (defaults to account address)

Config (ERC‑4337 only):
- `paymasterToken` (`string`, optional): Token symbol/address for fee sponsorship
- `swapMaxFee` (`number | bigint`, optional): Per‑swap fee cap (wei)

Returns:
- Standard account: `{ hash, fee, tokenInAmount, tokenOutAmount, approveHash?, resetAllowanceHash? }`
- ERC‑4337 account: `{ hash, fee, tokenInAmount, tokenOutAmount }` (approve may be bundled)

Notes:
- On Ethereum mainnet, selling USD₮ may first set allowance to 0, then approve.
- Requires a provider; requires a non read‑only account to send transactions.

Example:

```javascript
const tx = await swap.swap({
  tokenIn: '0xdAC17F...ec7',      // USD₮
  tokenOut: '0xC02a...6Cc2',      // WETH
  tokenInAmount: 1000000n
})
```

---

### `quoteSwap(options, config?)`
Get estimated fee and token in/out amounts.

Options are the same as `swap`.

Returns: `{ fee, tokenInAmount, tokenOutAmount }`

Config (ERC‑4337 only):
- `paymasterToken` (`string`, optional): Token symbol/address for fee sponsorship

Works with read‑only accounts.

Example:

```javascript
const quote = await swap.quoteSwap({
  tokenIn: '0xdAC17F...ec7',      // USD₮
  tokenOut: '0xC02a...6Cc2',      // WETH
  tokenOutAmount: 500000000000000000n // 0.5 WETH
})
```

---

## Errors

Common errors include:
- Insufficient liquidity / no route for pair
- Fee exceeds `swapMaxFee`
- Read‑only account cannot send swaps
- Provider/RPC errors (invalid endpoint, network mismatch)

---

## Types

- `swapMaxFee: bigint` — Upper bound for gas fees (wei)
- `tokenInAmount/tokenOutAmount: bigint` — ERC‑20 base units
- `paymasterToken: string` — token symbol or address (AA only)


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
				<strong>WDK Swap velora EVM Protocol Configuration</strong>
			</td>
			<td>Get started with WDK's Swap velora EVM Protocol configuration</td>
			<td>
				<a href="./configuration.md">WDK Swap velora EVM Protocol Configuration</a>
			</td>
		</tr>
    <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK Swap velora EVM Protocol Usage</strong>
			</td>
			<td>Get started with WDK's Swap velora EVM Protocol usage</td>
			<td>
				<a href="./usage.md">WDK Swap velora EVM Protocol Usage</a>
			</td>
		</tr>
	</tbody>
</table>

***

### Need Help?

{% include "../../../.gitbook/includes/support-cards.md" %}


