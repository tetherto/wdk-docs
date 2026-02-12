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
const aave = new AaveProtocolEvm(evmAccount)

// Supply collateral
await aave.supply({ token: '0x...', amount: 1000000n })

// Borrow against collateral
await aave.borrow({ token: '0x...', amount: 500000n })

// Repay borrowed amount
await aave.repay({ token: '0x...', amount: 500000n })

// Withdraw collateral
await aave.withdraw({ token: '0x...', amount: 1000000n })

// Check account health
const data = await aave.getAccountData()
// Returns: { totalCollateralBase, totalDebtBase, availableBorrowsBase,
//            currentLiquidationThreshold, ltv, healthFactor }
```

## Write Methods (All Require Human Confirmation)

| Method | Description |
|--------|-------------|
| `supply({token, amount})` | Deposit tokens as collateral |
| `withdraw({token, amount})` | Withdraw supplied tokens |
| `borrow({token, amount})` | Borrow tokens against collateral |
| `repay({token, amount})` | Repay borrowed tokens |
| `setUseReserveAsCollateral({token, useAsCollateral})` | Toggle collateral status |
| `setUserEMode({categoryId})` | Set efficiency mode for correlated assets |

## Read Methods

| Method | Description |
|--------|-------------|
| `getAccountData()` | Get position summary (health factor, LTV, etc.) |
| `getConfig()` | Get protocol configuration |

## Key Concepts

- **Health Factor**: Must stay > 1.0 to avoid liquidation. Below 1.0 = position can be liquidated.
- **LTV (Loan-to-Value)**: Maximum borrowing power relative to collateral.
- **eMode (Efficiency Mode)**: Higher LTV for correlated assets (e.g., stablecoins).
- May internally handle `approve()` for supply/repay operations.
