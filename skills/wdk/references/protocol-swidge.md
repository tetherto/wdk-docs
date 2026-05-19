# protocol-swidge — Unified Swap and Bridge Interface

## Links

| Resource | URL |
|----------|-----|
| **Docs — Swidge Interface** | https://docs.wallet.tether.io/sdk/swidge-modules |
| **Base package** | https://www.npmjs.com/package/@tetherto/wdk-wallet |

## Interface

Swidge is the shared interface for providers that can quote and execute a swap and bridge as one route. Use it when a provider may change both token and chain in one operation.

Existing standalone swap and bridge modules remain supported. WDK plans to deprecate those standalone interfaces in a future release after swidge provider modules are available.

```javascript
// Concrete provider modules should extend SwidgeProtocol from:
import { SwidgeProtocol } from '@tetherto/wdk-wallet/protocols'
```

## Quick Reference

The example assumes `swidge` is an instance of a concrete provider module that implements the swidge interface.

```javascript
// Quote first
const quote = await swidge.quoteSwidge({
  fromToken: '0xSourceToken...',
  toToken: '0xDestinationToken...',
  toChain: 'arbitrum',
  recipient: '0xRecipient...',
  fromTokenAmount: 1000000n,
  slippage: 0.01
})

// Then execute, after explicit user confirmation
const result = await swidge.executeSwidge(quote, {
  swidgeMaxFee: 200000000000000n,
  swidgeMaxProtocolFee: 100000000000000n
})

// Track asynchronous settlement
const status = await swidge.getSwidgeStatus(result.id, {
  toChain: 'arbitrum',
  providerData: result.providerData
})
```

## Common Interface

| Method | Description |
|--------|-------------|
| `quoteSwidge(options)` | Quote a unified swap + bridge route |
| `executeSwidge(quote, config?)` | Execute a previously quoted route (⚠️ write method) |
| `getSwidgeStatus(id, options?)` | Check status for an in-flight route |

## Options

| Option | Description |
|--------|-------------|
| `fromToken` | Source token address or provider-specific asset identifier |
| `toToken` | Destination token address or provider-specific asset identifier |
| `toChain` | Destination chain identifier |
| `recipient` | Optional recipient for the output tokens |
| `slippage` | Optional decimal slippage tolerance, for example `0.01` for 1% |
| `fromTokenAmount` | Exact source amount to spend. Do not pass with `toTokenAmount` |
| `toTokenAmount` | Exact destination amount to receive. Do not pass with `fromTokenAmount` |

## Status Values

`pending`, `action-required`, `completed`, `failed`, `refund-pending`, `refunded`, `cancelled`, `expired`, `partial`

## Safety Rules

- Always call `quoteSwidge()` before `executeSwidge()`.
- Show source token, destination token, destination chain, recipient, minimum output, and fees to the user before execution.
- Require explicit human confirmation before `executeSwidge()`.
- Provider modules should document supported assets and chains until the base interface exposes dedicated discovery methods such as `getSupportedAssets()` and `getSupportedChains()`.
