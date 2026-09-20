# protocol-swap — DEX Swaps (Velora EVM)

## Links — swap-velora-evm

| Resource | URL |
|----------|-----|
| **npm** | https://www.npmjs.com/package/@tetherto/wdk-protocol-swap-velora-evm |
| **Docs — Overview** | https://docs.wallet.tether.io/sdk/swap-modules/swap-velora-evm |
| **Docs — Usage** | https://docs.wallet.tether.io/sdk/swap-modules/swap-velora-evm/usage |
| **Docs — Configuration** | https://docs.wallet.tether.io/sdk/swap-modules/swap-velora-evm/configuration |
| **Docs — API Reference** | https://docs.wallet.tether.io/sdk/swap-modules/swap-velora-evm/api-reference |

## Packages

```bash
npm install @tetherto/wdk-protocol-swap-velora-evm
```

```javascript
import VeloraProtocolEvm from '@tetherto/wdk-protocol-swap-velora-evm'
```

## Quick Reference

### Velora (EVM)

```javascript
// Standard EVM account on Ethereum; complete input-token approval first
const USDT = '0xdAC17F958D2ee523a2206206994597C13D831ec7' // USDt, 6 decimals
const WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' // 18 decimals
const velora = new VeloraProtocolEvm(evmAccount, { swapMaxFee: 200000000000000n })

// Quote first
const quote = await velora.quoteSwap({
  tokenIn: USDT,
  tokenOut: WETH,
  tokenInAmount: 1000000n
})

// Then swap (requires human confirmation)
await velora.swap({
  tokenIn: USDT,
  tokenOut: WETH,
  tokenInAmount: 1000000n
})
```

- Complete input-token approval to the current Velora spender separately; the protocol does not approve or reset allowances.
- `swap()` forwards the same config and one transaction to account quote/send methods; `quoteSwap()` forwards config to account quoting without a concrete-class check.
- Per-call `swapMaxFee` applies to standard and smart accounts. It rejects fees equal to or above the cap, in the account quote's units; `quoteSwap()` does not enforce this cap.
- Works with both wallet-evm and wallet-evm-erc-4337 accounts

## Common Interface

| Method | Description |
|--------|-------------|
| `swap({tokenIn, tokenOut, tokenInAmount})` | Execute swap (⚠️ write method) |
| `quoteSwap({tokenIn, tokenOut, tokenInAmount})` | Get swap quote with expected output |
