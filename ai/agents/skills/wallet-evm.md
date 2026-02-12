# wallet-evm & wallet-evm-erc-4337 — EVM Chains

## Links — wallet-evm

| Resource | URL |
|----------|-----|
| **npm** | https://www.npmjs.com/package/@tetherto/wdk-wallet-evm |
| **GitHub** | https://github.com/tetherto/wdk-wallet-evm |
| **Docs — Overview** | https://docs.wallet.tether.io/sdk/wallet-modules/wallet-evm |
| **Docs — Usage** | https://docs.wallet.tether.io/sdk/wallet-modules/wallet-evm/usage |
| **Docs — Configuration** | https://docs.wallet.tether.io/sdk/wallet-modules/wallet-evm/configuration |
| **Docs — API Reference** | https://docs.wallet.tether.io/sdk/wallet-modules/wallet-evm/api-reference |

## Links — wallet-evm-erc-4337

| Resource | URL |
|----------|-----|
| **npm** | https://www.npmjs.com/package/@tetherto/wdk-wallet-evm-erc-4337 |
| **GitHub** | https://github.com/tetherto/wdk-wallet-evm-erc-4337 |
| **Docs — Overview** | https://docs.wallet.tether.io/sdk/wallet-modules/wallet-evm-erc-4337 |
| **Docs — Usage** | https://docs.wallet.tether.io/sdk/wallet-modules/wallet-evm-erc-4337/usage |
| **Docs — Configuration** | https://docs.wallet.tether.io/sdk/wallet-modules/wallet-evm-erc-4337/configuration |
| **Docs — API Reference** | https://docs.wallet.tether.io/sdk/wallet-modules/wallet-evm-erc-4337/api-reference |

## Packages

```bash
npm install @tetherto/wdk-wallet-evm
npm install @tetherto/wdk-wallet-evm-erc-4337  # for Account Abstraction
```

```javascript
import WalletManagerEvm from '@tetherto/wdk-wallet-evm'
import WalletManagerEvmErc4337 from '@tetherto/wdk-wallet-evm-erc-4337'
```

## Key Details — wallet-evm

- **Derivation**: BIP-44 (`m/44'/60'/0'/0/{index}`)
- **Fee model**: EIP-1559 (baseFee + priorityFee)
- **Fee rates**: `normal` = base×1.1, `fast` = base×2.0
- **Supports**: ERC20 via `transfer()`, arbitrary calldata via `sendTransaction({data})`
- ⚠️ **Ethereum USDT** uses non-standard ERC20 (no bool return on `transfer()`). Use SafeERC20 in custom contracts.
- ⚠️ `sendTransaction` accepts a `data` field (arbitrary hex calldata) — can execute **any** contract function. Extra scrutiny for non-empty `data`.

## Configuration — wallet-evm

```javascript
const wallet = new WalletManagerEvm(seedPhrase, {
  provider: 'https://eth.drpc.org',      // JSON-RPC URL or EIP-1193 provider
  chainId: 1,                             // Optional, auto-detected
  transferMaxFee: 5000000000000000n       // Optional max fee in wei
})
```

## Key Details — wallet-evm-erc-4337

- **Gasless** via UserOperations + Paymaster
- Fees paid in **paymaster token** (e.g., USDT) instead of native ETH
- `getPaymasterTokenBalance()` for fee balance
- **Batch transactions**: `sendTransaction([tx1, tx2])` — multiple operations in one call
- Same `data` risk as wallet-evm, plus batch execution risk

## Configuration — wallet-evm-erc-4337

```javascript
const wallet = new WalletManagerEvmErc4337(seedPhrase, {
  provider: 'https://arb1.arbitrum.io/rpc',
  chainId: 42161,
  bundlerUrl: 'https://api.candide.dev/public/v3/arbitrum',
  paymasterUrl: 'https://api.candide.dev/public/v3/arbitrum',
  paymasterAddress: '0x8b1f6cb5d062aa2ce8d581942bbb960420d875ba',
  entrypointAddress: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
  paymasterToken: {
    address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9' // USDT on Arbitrum
  },
  transferMaxFee: 5000000       // in paymaster token units
})
```

Currently Account Abstraction (ERC-4337) is supported on: **Arbitrum**.
