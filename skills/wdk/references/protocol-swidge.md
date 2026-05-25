# protocol-swidge — Shared Route Interface

## Links

| Resource | URL |
|----------|-----|
| **Docs — Swidge Interface** | https://docs.wallet.tether.io/sdk/swidge-modules |
| **Base package** | https://www.npmjs.com/package/@tetherto/wdk-wallet |

## Interface

Swidge is the preferred interface for new providers that can quote and execute asset routes. Use it for swap-only routes, bridge-only routes, or combined swap and bridge routes where the token changes, the chain changes, or both change. Providers may fulfill those routes through swaps, bridges, intents, solvers, aggregators, or provider-specific routing.

Existing standalone swap and bridge modules remain supported for released modules. New protocol integrations should prefer swidge because WDK plans to deprecate those standalone interfaces in a future release after swidge provider coverage is available.

```javascript
// Concrete provider modules should extend SwidgeProtocol from:
import { SwidgeProtocol } from '@tetherto/wdk-wallet/protocols'
```

## Quick Reference

The example assumes `swidge` is an instance of a concrete provider module that implements the swidge interface.

```javascript
const options = {
  fromToken: '0xSourceToken...',
  toToken: '0xDestinationToken...',
  toChain: 'arbitrum',
  recipient: '0xRecipient...',
  fromTokenAmount: 1000000n,
  slippage: 0.01
}

// Quote first
const quote = await swidge.quoteSwidge(options)

// Then execute the same route options, after explicit user confirmation
const result = await swidge.swidge(options, {
  maxNetworkFeeBps: 50,
  maxProtocolFeeBps: 25
})

// Track asynchronous settlement
const status = await swidge.getSwidgeStatus(result.id, {
  toChain: 'arbitrum'
})
```

## Common Interface

| Method | Description |
|--------|-------------|
| `getSupportedChains()` | List provider-supported chains for swidge operations |
| `getSupportedTokens(options?)` | List provider-supported tokens, optionally filtered by chain or route |
| `quoteSwidge(options)` | Quote a swap-only, bridge-only, or combined route |
| `swidge(options, config?)` | Execute a swidge route (⚠️ write method) |
| `getSwidgeStatus(id, options?)` | Check status for an in-flight route |

## Discovery

Use `getSupportedChains()` and `getSupportedTokens(options?)` to build route selectors and validate user-requested routes before quoting.

```ts
const chains = await swidge.getSupportedChains()
const tokens = await swidge.getSupportedTokens({
  fromChain: 'ethereum',
  fromToken: '0xSourceToken...',
  toChain: 'arbitrum'
})
```

`getSupportedTokens(options?)` accepts optional `fromChain`, `fromToken`, and `toChain` filters. Use returned provider-specific `token` and `chain` identifiers when constructing `quoteSwidge()` input unless the concrete provider docs say otherwise.

## Options

| Option | Description |
|--------|-------------|
| `fromToken` | Source token address or provider-specific asset identifier |
| `toToken` | Destination token address or provider-specific asset identifier |
| `toChain` | Destination chain identifier |
| `recipient` | Optional recipient for the output tokens |
| `refundAddress` | Optional address that receives refunds if the transaction cannot complete |
| `slippage` | Optional decimal slippage tolerance, for example `0.01` for 1% |
| `fromTokenAmount` | Exact source amount to spend. Do not pass with `toTokenAmount` |
| `toTokenAmount` | Exact destination amount to receive. Do not pass with `fromTokenAmount` |

## Config

| Config field | Description |
|--------------|-------------|
| `maxNetworkFeeBps` | Maximum acceptable network fee in basis points of the input amount |
| `maxProtocolFeeBps` | Maximum acceptable protocol fee in basis points of the input amount |

## Status Values

`pending`, `action-required`, `completed`, `failed`, `refund-pending`, `refunded`, `cancelled`, `expired`, `partial`

## Safety Rules

- Use `getSupportedChains()` and `getSupportedTokens()` when selecting or validating swidge routes.
- Always call `quoteSwidge()` before `swidge()`.
- Show source token, destination token, destination chain, recipient, minimum output, and fees to the user before execution.
- Require explicit human confirmation before `swidge()`.
- Provider modules should still document route-specific caveats, token identifier formats, provider limits, and any behavior not represented by shared discovery responses.
