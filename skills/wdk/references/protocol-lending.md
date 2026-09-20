# protocol-lending — Aave V3 Lending

## Links

| Resource | URL |
|----------|-----|
| **npm** | https://www.npmjs.com/package/@tetherto/wdk-protocol-lending-aave-evm |
| **Docs — Overview** | https://docs.wallet.tether.io/sdk/lending-modules/lending-aave-evm |
| **Docs — Usage** | https://docs.wallet.tether.io/sdk/lending-modules/lending-aave-evm/usage |
| **Docs — Configuration** | https://docs.wallet.tether.io/sdk/lending-modules/lending-aave-evm/configuration |
| **Docs — API Reference** | https://docs.wallet.tether.io/sdk/lending-modules/lending-aave-evm/api-reference |

## Package

```bash
npm install @tetherto/wdk-protocol-lending-aave-evm
```

```javascript
import AaveProtocolEvm from '@tetherto/wdk-protocol-lending-aave-evm'
```

## Quick Reference

```javascript
// Ethereum account; complete Pool approval before supply or repayment
const USDT = '0xdAC17F958D2ee523a2206206994597C13D831ec7' // USDt, 6 decimals
const aave = new AaveProtocolEvm(evmAccount)

// Supply tokens
await aave.supply({ token: USDT, amount: 1000000n })

// Borrow only when eligible collateral provides enough borrowing power
await aave.borrow({ token: USDT, amount: 500000n })

// Repay borrowed amount
await aave.repay({ token: USDT, amount: 500000n })

// Withdraw supplied tokens when the remaining position permits it
await aave.withdraw({ token: USDT, amount: 1000000n })

// Check account health
const data = await aave.getAccountData()
// Returns: { totalCollateralBase, totalDebtBase, availableBorrowsBase,
//            currentLiquidationThreshold, ltv, healthFactor }
```

## Write Methods (All Require Human Confirmation)

| Method | Description |
|--------|-------------|
| `supply({token, amount})` | Deposit tokens into the reserve |
| `withdraw({token, amount})` | Withdraw supplied tokens |
| `borrow({token, amount})` | Borrow tokens against collateral |
| `repay({token, amount})` | Repay borrowed tokens |
| `setUseReserveAsCollateral(token, useAsCollateral, config?)` | Toggle collateral status |
| `setUserEMode(categoryId, config?)` | Set efficiency mode for correlated assets |

## Read Methods

| Method | Description |
|--------|-------------|
| `getAccountData()` | Get position summary (health factor, LTV, etc.) |
| `quoteSupply(options, config?)` / `quoteRepay(options, config?)` | Estimate supply or repayment fees |
| `quoteBorrow(options, config?)` / `quoteWithdraw(options, config?)` | Estimate borrowing or withdrawal fees |

## Key Concepts

- **Health Factor**: Must stay > 1.0 to avoid liquidation. Below 1.0 = position can be liquidated.
- **LTV (Loan-to-Value)**: Maximum borrowing power relative to collateral.
- **eMode (Efficiency Mode)**: Higher LTV for correlated assets (e.g., stablecoins).
- Supply and repayment require sufficient Pool allowance. Approvals and any required reset are caller-owned, separate operations.
- Accepts shared wallet interfaces, but requires an EVM provider in `account._config.provider` and the account methods each operation calls. Writes require a callable `sendTransaction()`.
- Operation config is forwarded to the account; fees retain that account's gas-payment denomination.
