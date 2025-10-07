---
title: Lending Aave EVM Guides
description: How to install and use @tetherto/wdk-protocol-lending-aave-evm on EVM
author: Raquel Carrasco Gonzalez
lastReviewed: 2025-10-06
icon: book-open
---

# Guides

## Installation

```bash
npm install @tetherto/wdk-protocol-lending-aave-evm
```

## Quick Start

### Setting Up the Lending Service

```javascript
import AaveProtocolEvm from '@tetherto/wdk-protocol-lending-aave-evm'
import { WalletAccountEvm } from '@tetherto/wdk-wallet-evm'

// Create account (m/44'/60'/0'/0/0)
const account = new WalletAccountEvm(seedPhrase, "0'/0/0", {
  provider: 'https://ethereum-rpc.publicnode.com'
})

// Create lending service
const aave = new AaveProtocolEvm(account)
```

### Supply / Withdraw / Borrow / Repay

```javascript
// Supply 1,000,000 base units (token decimals dependent)
await aave.supply({ token: 'TOKEN_ADDRESS', amount: 1000000n })

// Withdraw
await aave.withdraw({ token: 'TOKEN_ADDRESS', amount: 1000000n })

// Borrow
await aave.borrow({ token: 'TOKEN_ADDRESS', amount: 1000000n })

// Repay
await aave.repay({ token: 'TOKEN_ADDRESS', amount: 1000000n })
```

### Quotes Before Sending

```javascript
const supplyQuote   = await aave.quoteSupply({ token: 'TOKEN_ADDRESS', amount: 1000000n })
const withdrawQuote = await aave.quoteWithdraw({ token: 'TOKEN_ADDRESS', amount: 1000000n })
const borrowQuote   = await aave.quoteBorrow({ token: 'TOKEN_ADDRESS', amount: 1000000n })
const repayQuote    = await aave.quoteRepay({ token: 'TOKEN_ADDRESS', amount: 1000000n })
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
const result = await aaveAA.supply({ token: 'TOKEN_ADDRESS', amount: 1000000n }, {
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
  await aave.supply({ token: 'TOKEN_ADDRESS', amount: 0n })
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
  const q = await aave.quoteSupply({ token: 'TOKEN_ADDRESS', amount: 1000000n })
  console.log('Supply fee estimate:', q.fee)

  const tx = await aave.supply({ token: 'TOKEN_ADDRESS', amount: 1000000n })
  console.log('Supply tx hash:', tx.hash)
}
```

