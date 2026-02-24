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
const velora = new VeloraProtocolEvm(evmAccount, { swapMaxFee: 200000000000000n })

// Quote first
const quote = await velora.quoteSwap({
  tokenIn: '0x...',
  tokenOut: '0x...',
  tokenInAmount: 1000000n
})

// Then swap (requires human confirmation)
await velora.swap({
  tokenIn: '0x...',
  tokenOut: '0x...',
  tokenInAmount: 1000000n
})
```

- May internally handle `approve()` + reset allowance
- Works with both wallet-evm and wallet-evm-erc-4337 accounts

## Common Interface

| Method | Description |
|--------|-------------|
| `swap({tokenIn, tokenOut, tokenInAmount})` | Execute swap (⚠️ write method) |
| `quoteSwap({tokenIn, tokenOut, tokenInAmount})` | Get swap quote with expected output |
| `getConfig()` | Get protocol configuration |
