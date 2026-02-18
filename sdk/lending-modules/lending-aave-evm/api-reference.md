---
title: Lending Aave EVM API Reference
description: API reference for @tetherto/wdk-protocol-lending-aave-evm
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

## Class: AaveProtocolEvm

Main class for Aave V3 lending on EVM.

### Constructor

```javascript
new AaveProtocolEvm(account)
```

Parameters:
- `account`: `WalletAccountEvm | WalletAccountReadOnlyEvm | WalletAccountEvmErc4337 | WalletAccountReadOnlyEvmErc4337`

Example:

```javascript
const aave = new AaveProtocolEvm(account)
```

### Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `supply(options, config?)` | Add tokens to the pool | `Promise<{hash: string, fee: bigint, approveHash?: string, resetAllowanceHash?: string}>` |
| `quoteSupply(options, config?)` | Estimate cost to add tokens | `Promise<{fee: bigint}>` |
| `withdraw(options, config?)` | Remove tokens from the pool | `Promise<{hash: string, fee: bigint}>` |
| `quoteWithdraw(options, config?)` | Estimate cost to withdraw | `Promise<{fee: bigint}>` |
| `borrow(options, config?)` | Borrow tokens | `Promise<{hash: string, fee: bigint}>` |
| `quoteBorrow(options, config?)` | Estimate borrowing cost | `Promise<{fee: bigint}>` |
| `repay(options, config?)` | Repay borrowed tokens | `Promise<{hash: string, fee: bigint}>` |
| `quoteRepay(options, config?)` | Estimate repayment cost | `Promise<{fee: bigint}>` |
| `setUseReserveAsCollateral(token, use, config?)` | Toggle token as collateral | `Promise<{hash: string, fee: bigint}>` |
| `setUserEMode(categoryId, config?)` | Set user eMode | `Promise<{hash: string, fee: bigint}>` |
| `getAccountData(account?)` | Read account stats | `Promise<{ totalCollateralBase: bigint, totalDebtBase: bigint, availableBorrowsBase: bigint, currentLiquidationThreshold: bigint, ltv: bigint, healthFactor: bigint }>` |

---

### `supply(options, config?)`
Add tokens to the pool.

Options:
- `token` (`string`): token address
- `amount` (`number | bigint`): amount in base units
- `onBehalfOf` (`string`, optional)

Returns:
- May include `approveHash` and `resetAllowanceHash` for standard accounts (e.g., USD₮ allowance reset on Ethereum mainnet)

Example:

```javascript
const res = await aave.supply({ token: 'TOKEN_ADDRESS', amount: 1000000n })
```

---

### `quoteSupply(options, config?)`
Estimate fee to add tokens.

```javascript
const q = await aave.quoteSupply({ token: 'TOKEN_ADDRESS', amount: 1000000n })
```

---

### `withdraw(options, config?)`
Remove tokens from the pool.

Options:
- `token` (`string`)
- `amount` (`number | bigint`)
- `to` (`string`, optional)

```javascript
const tx = await aave.withdraw({ token: 'TOKEN_ADDRESS', amount: 1000000n })
```

---

### `quoteWithdraw(options, config?)`
Estimate fee to withdraw tokens.

```javascript
const q = await aave.quoteWithdraw({ token: 'TOKEN_ADDRESS', amount: 1000000n })
```

---

### `borrow(options, config?)`
Borrow tokens.

Options:
- `token` (`string`)
- `amount` (`number | bigint`)
- `onBehalfOf` (`string`, optional)

```javascript
const tx = await aave.borrow({ token: 'TOKEN_ADDRESS', amount: 1000000n })
```

---

### `quoteBorrow(options, config?)`
Estimate fee to borrow tokens.

```javascript
const q = await aave.quoteBorrow({ token: 'TOKEN_ADDRESS', amount: 1000000n })
```

---

### `repay(options, config?)`
Repay borrowed tokens.

Options:
- `token` (`string`)
- `amount` (`number | bigint`)
- `onBehalfOf` (`string`, optional)

```javascript
const tx = await aave.repay({ token: 'TOKEN_ADDRESS', amount: 1000000n })
```

Returns:
- For standard accounts, may include `approveHash` / `resetAllowanceHash` when applicable.

---

### `quoteRepay(options, config?)`
Estimate fee to repay borrowed tokens.

```javascript
const q = await aave.quoteRepay({ token: 'TOKEN_ADDRESS', amount: 1000000n })
```

---

### `setUseReserveAsCollateral(token, use, config?)`
Toggle token as collateral for the user.

```javascript
const tx = await aave.setUseReserveAsCollateral('TOKEN_ADDRESS', true)
```

---

### `setUserEMode(categoryId, config?)`
Set user eMode category.

```javascript
const tx = await aave.setUserEMode(1)
```

---

### `getAccountData(account?)`
Read account stats like total collateral, debt, and health.

```javascript
const data = await aave.getAccountData()
```

Returns the following structure:

```javascript
{
  totalCollateralBase: bigint,
  totalDebtBase: bigint,
  availableBorrowsBase: bigint,
  currentLiquidationThreshold: bigint,
  ltv: bigint,
  healthFactor: bigint
}
```

---

## ERC‑4337 Config (optional)

- `paymasterToken` (`string`): token used to pay gas when sponsored.

## Rules & Notes

- `token` must be a valid (non‑zero) address
- `amount` > 0 and in token base units (use BigInt)
- `onBehalfOf`/`to` (if set) must be valid, non‑zero addresses
- A provider is required to read/send transactions
- For USD₮ on mainnet, allowance may be reset to 0 then set again before actions


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
				<strong>WDK Lending Aave EVM Protocol Usage</strong>
			</td>
			<td>Get started with WDK's Lending Aave EVM Protocol usage</td>
			<td>
				<a href="./usage.md">WDK Lending Aave EVM Protocol Usage</a>
			</td>
		</tr>
	</tbody>
</table>

***

### Need Help?

{% include "../../../.gitbook/includes/support-cards.md" %}


