# protocol-bridge — USDT0 Cross-Chain Bridge

## Links

| Resource | URL |
|----------|-----|
| **npm** | https://www.npmjs.com/package/@tetherto/wdk-protocol-bridge-usdt0-evm |
| **GitHub** | https://github.com/tetherto/wdk-protocol-bridge-usdt0-evm |
| **Docs — Overview** | https://docs.wallet.tether.io/sdk/bridge-modules/bridge-usdt0-evm |
| **Docs — Usage** | https://docs.wallet.tether.io/sdk/bridge-modules/bridge-usdt0-evm/usage |
| **Docs — Configuration** | https://docs.wallet.tether.io/sdk/bridge-modules/bridge-usdt0-evm/configuration |
| **Docs — API Reference** | https://docs.wallet.tether.io/sdk/bridge-modules/bridge-usdt0-evm/api-reference |
| **USDT0 Docs** | https://docs.usdt0.to |
| **USDT0 Deployments** | https://docs.usdt0.to/technical-documentation/deployments |

## Package

```bash
npm install @tetherto/wdk-protocol-bridge-usdt0-evm
```

```javascript
import Usdt0ProtocolEvm from '@tetherto/wdk-protocol-bridge-usdt0-evm'
```

## Quick Reference

```javascript
const bridge = new Usdt0ProtocolEvm(evmAccount, {
  bridgeMaxFee: 1000000000000000n  // Optional max fee in wei
})

// Quote first
const quote = await bridge.quoteBridge({
  targetChain: 'arbitrum',
  recipient: '0x...',
  token: '0x...',      // USDT0 token address on source chain
  amount: 1000000n     // 1 USDT0 (6 decimals)
})

// Then bridge (requires human confirmation)
await bridge.bridge({
  targetChain: 'arbitrum',
  recipient: '0x...',
  token: '0x...',
  amount: 1000000n
})
```

## Supported Routes

**Source chains** (EVM only): ethereum, arbitrum, polygon, berachain, ink
**Destination chains**: ethereum, arbitrum, polygon, berachain, ink, ton, tron

Works with both wallet-evm and wallet-evm-erc-4337 accounts.

## How It Works

- Uses **LayerZero OFT** (Omnichain Fungible Token) protocol for cross-chain messaging
- May internally handle `approve()` + reset allowance for the OFT adapter contract
- Bridge fees include LayerZero messaging fees (paid in native token of source chain)
- Token addresses differ per chain — see `references/deployments.md` for the full table

## Common Interface

| Method | Description |
|--------|-------------|
| `bridge({targetChain, recipient, token, amount})` | Execute bridge (⚠️ write method) |
| `quoteBridge({targetChain, recipient, token, amount})` | Get bridge fee estimate |
| `getConfig()` | Get protocol configuration |
