# protocol-swap — DEX Swaps (Velora EVM + StonFi TON)

## Links — swap-velora-evm

| Resource | URL |
|----------|-----|
| **npm** | https://www.npmjs.com/package/@tetherto/wdk-protocol-swap-velora-evm |
| **Docs — Overview** | https://docs.wallet.tether.io/sdk/swap-modules/swap-velora-evm |
| **Docs — Usage** | https://docs.wallet.tether.io/sdk/swap-modules/swap-velora-evm/usage |
| **Docs — Configuration** | https://docs.wallet.tether.io/sdk/swap-modules/swap-velora-evm/configuration |
| **Docs — API Reference** | https://docs.wallet.tether.io/sdk/swap-modules/swap-velora-evm/api-reference |

## Links — swap-stonfi-ton

| Resource | URL |
|----------|-----|
| **npm** | ⚠️ Not yet published to npm |
| **Docs — Overview** | https://docs.wallet.tether.io/sdk/swap-modules/swap-stonfi-ton |
| **Docs — Usage** | https://docs.wallet.tether.io/sdk/swap-modules/swap-stonfi-ton/usage |
| **Docs — Configuration** | https://docs.wallet.tether.io/sdk/swap-modules/swap-stonfi-ton/configuration |
| **Docs — API Reference** | https://docs.wallet.tether.io/sdk/swap-modules/swap-stonfi-ton/api-reference |

## Packages

```bash
npm install @tetherto/wdk-protocol-swap-velora-evm
# @tetherto/wdk-protocol-swap-stonfi-ton — not yet on npm
```

```javascript
import VeloraProtocolEvm from '@tetherto/wdk-protocol-swap-velora-evm'
import StonFiProtocolTon from '@tetherto/wdk-protocol-swap-stonfi-ton'
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

### StonFi (TON)

```javascript
const stonfi = new StonFiProtocolTon(tonAccount, { swapMaxFee: 1000000000n })

await stonfi.swap({
  tokenIn: 'ton',              // Use 'ton' for native TON
  tokenOut: 'EQ...',           // Jetton master address
  tokenInAmount: 1000000000n   // In nanotons or Jetton base units
})
```

## Common Interface

Both swap protocols implement:

| Method | Description |
|--------|-------------|
| `swap({tokenIn, tokenOut, tokenInAmount})` | Execute swap (⚠️ write method) |
| `quoteSwap({tokenIn, tokenOut, tokenInAmount})` | Get swap quote with expected output |
| `getConfig()` | Get protocol configuration |
