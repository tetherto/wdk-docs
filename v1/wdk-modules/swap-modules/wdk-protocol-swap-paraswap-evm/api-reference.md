---
title: Swap ParaSwap EVM API Reference
description: API reference for @tetherto/wdk-protocol-swap-paraswap-evm
author: Raquel Carrasco
lastReviewed: 2025-10-06
---

# API Reference

## Class: ParaSwapProtocolEvm

Main class for ParaSwap token swaps on EVM.

### Constructor

```javascript
new ParaSwapProtocolEvm(account, config?)
```

Parameters:
- `account`: `WalletAccountEvm | WalletAccountReadOnlyEvm | WalletAccountEvmErc4337 | WalletAccountReadOnlyEvmErc4337`
- `config` (optional):
  - `swapMaxFee` (`bigint`): maximum total gas fee allowed (wei)

Example:

```javascript
const swap = new ParaSwapProtocolEvm(account, { swapMaxFee: 200000000000000n })
```

### Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `swap(options, config?)` | Perform a token swap | `Promise<{hash: string, fee: bigint, tokenInAmount: bigint, tokenOutAmount: bigint, approveHash?: string, resetAllowanceHash?: string}>` |
| `quoteSwap(options, config?)` | Get estimated fee and amounts | `Promise<{fee: bigint, tokenInAmount: bigint, tokenOutAmount: bigint}>` |

---

### `swap(options, config?)`
Execute a swap via ParaSwap.

Options:
- `tokenIn` (`string`): Address of the ERC‑20 token to sell
- `tokenOut` (`string`): Address of the ERC‑20 token to buy
- `tokenInAmount` (`bigint`, optional): Exact input amount (base units)
- `tokenOutAmount` (`bigint`, optional): Exact output amount (base units)
- `to` (`string`, optional): Recipient address (defaults to account address)

Config (ERC‑4337 only):
- `paymasterToken` (`string`, optional): Token symbol/address for fee sponsorship
- `swapMaxFee` (`bigint`, optional): Per‑swap fee cap (wei)

Returns:
- Standard account: `{ hash, fee, tokenInAmount, tokenOutAmount, approveHash?, resetAllowanceHash? }`
- ERC‑4337 account: `{ hash, fee, tokenInAmount, tokenOutAmount }` (approve may be bundled)

Notes:
- On Ethereum mainnet, selling USDT may first set allowance to 0, then approve.
- Requires a provider; requires a non read‑only account to send transactions.

Example:

```javascript
const tx = await swap.swap({
  tokenIn: '0xdAC17F...ec7',      // USDT
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
  tokenIn: '0xdAC17F...ec7',      // USDT
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