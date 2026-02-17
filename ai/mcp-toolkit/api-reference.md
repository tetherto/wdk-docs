---
title: API Reference
description: WdkMcpServer class and all 35 built-in MCP tools
icon: code
layout:
  width: default
  title:
    visible: true
  description:
    visible: true
  tableOfContents:
    visible: true
  outline:
    visible: true
  pagination:
    visible: true
  metadata:
    visible: false
---

# API Reference

## WdkMcpServer

The `WdkMcpServer` class extends `McpServer` from `@modelcontextprotocol/sdk` with WDK-specific wallet, pricing, indexer, and protocol capabilities.

### Constructor

```javascript
const server = new WdkMcpServer(name: string, version: string)
```

| Parameter | Type | Description |
| --- | --- | --- |
| `name` | `string` | Server name (shown to AI clients) |
| `version` | `string` | Server version string |

### Core Methods

#### `useWdk(config)`

Initializes the WDK wallet engine. Must be called before `registerWallet()` or `registerProtocol()`.

```typescript
server.useWdk(config: WdkConfig): WdkMcpServer
```

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `config.seed` | `string` | Yes | BIP-39 mnemonic seed phrase |

**Returns:** `WdkMcpServer` (for chaining)

---

#### `registerWallet(blockchain, WalletManager, config)`

Registers a wallet module for a specific blockchain.

```typescript
server.registerWallet<W extends typeof WalletManager>(
  blockchain: string,
  WalletManager: W,
  config: ConstructorParameters<W>[1]
): WdkMcpServer
```

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `blockchain` | `string` | Yes | Chain name (e.g., `'ethereum'`, `'bitcoin'`) |
| `WalletManager` | `class` | Yes | Wallet module class (e.g., `WalletManagerEvm`) |
| `config` | `object` | Yes | Module-specific config (see each wallet module's docs) |

**Requires:** `useWdk()` called first

---

#### `registerProtocol(chain, label, Protocol, config?)`

Registers a DeFi protocol (swap, bridge, lending, or fiat) for a chain.

```typescript
server.registerProtocol<P extends typeof SwapProtocol | typeof BridgeProtocol | typeof LendingProtocol | typeof FiatProtocol>(
  chain: string,
  label: string,
  Protocol: P,
  config?: ConstructorParameters<P>[1]
): WdkMcpServer
```

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `chain` | `string` | Yes | Chain name (must have a wallet registered) |
| `label` | `string` | Yes | Protocol identifier (e.g., `'velora'`, `'aave'`) |
| `Protocol` | `class` | Yes | Protocol module class |
| `config` | `object` | No | Protocol-specific config |

**Requires:** `useWdk()` called first

---

#### `useIndexer(config)`

Enables the WDK Indexer client for querying token balances and transfer history.

```typescript
server.useIndexer(config: { apiKey: string }): WdkMcpServer
```

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `config.apiKey` | `string` | Yes | WDK Indexer API key |

---

#### `usePricing()`

Enables the Bitfinex pricing client for current and historical prices.

```typescript
server.usePricing(): WdkMcpServer
```

---

#### `registerTools(tools)`

Registers multiple MCP tools at once.

```typescript
server.registerTools(tools: ToolFunction[]): WdkMcpServer
```

---

#### `registerToken(chain, symbol, token)`

Registers a custom token for a chain.

```typescript
server.registerToken(chain: string, symbol: string, token: TokenInfo): WdkMcpServer
```

| Parameter | Type | Description |
| --- | --- | --- |
| `chain` | `string` | Chain name |
| `symbol` | `string` | Token symbol (e.g., `'USDT'`) |
| `token.address` | `string` | Token contract address |
| `token.decimals` | `number` | Token decimal places |

---

#### `close()`

Disposes the WDK instance and clears seed material from memory. Call this when shutting down the server.

```typescript
server.close(): void
```

### Query Methods

| Method | Returns | Description |
| --- | --- | --- |
| `getChains()` | `string[]` | Registered blockchain names |
| `getTokenInfo(chain, symbol)` | `TokenInfo \| undefined` | Token address and decimals |
| `getRegisteredTokens(chain)` | `string[]` | Registered token symbols for a chain |
| `getSwapChains()` | `string[]` | Chains with swap protocols |
| `getSwapProtocols(chain)` | `string[]` | Swap protocol labels for a chain |
| `getBridgeChains()` | `string[]` | Chains with bridge protocols |
| `getBridgeProtocols(chain)` | `string[]` | Bridge protocol labels for a chain |
| `getLendingChains()` | `string[]` | Chains with lending protocols |
| `getLendingProtocols(chain)` | `string[]` | Lending protocol labels for a chain |
| `getFiatChains()` | `string[]` | Chains with fiat protocols |
| `getFiatProtocols(chain)` | `string[]` | Fiat protocol labels for a chain |

### Getters

| Getter | Type | Description |
| --- | --- | --- |
| `server.wdk` | `WalletKit` | WDK instance (after `useWdk()`) |
| `server.indexerClient` | `WdkIndexerClient` | Indexer client (after `useIndexer()`) |
| `server.pricingClient` | `WdkPricingClient` | Pricing client (after `usePricing()`) |

***

## Types

```typescript
type WdkConfig = {
  seed?: string
}

type TokenInfo = {
  address: string
  decimals: number
}

type ToolFunction = (server: WdkMcpServer) => void
```

***

## Built-in MCP Tools

All tools use [Zod](https://zod.dev/) for input/output validation and include [MCP tool annotations](https://modelcontextprotocol.io/docs/concepts/tools#tool-annotations) that describe their behavior to AI clients.

### MCP Annotations

Every tool declares these annotations:

| Annotation | Type | Meaning |
| --- | --- | --- |
| `readOnlyHint` | `boolean` | Tool does not modify state |
| `destructiveHint` | `boolean` | Tool may spend funds or make irreversible changes |
| `idempotentHint` | `boolean` | Calling multiple times produces the same result |
| `openWorldHint` | `boolean` | Tool interacts with external systems |

{% hint style="info" %}
**Human Confirmation** - All tools where `destructiveHint: true` use MCP [elicitations](https://modelcontextprotocol.io/docs/concepts/elicitation) to show a confirmation dialog before broadcasting. The user must explicitly approve each transaction.
{% endhint %}

***

## Wallet Tools

_Requires: `useWdk()` + `registerWallet()`_

### `getAddress`

Get the wallet address for a blockchain. **Read-only.**

**Input:**

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `chain` | `enum` | Yes | The blockchain to get the address for |

**Output:**

| Field | Type | Description |
| --- | --- | --- |
| `address` | `string` | The wallet address |

---

### `getBalance`

Get the native token balance for a blockchain (ETH, BTC, SOL, etc.). **Read-only.**

**Input:**

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `chain` | `enum` | Yes | The blockchain to query |

**Output:**

| Field | Type | Description |
| --- | --- | --- |
| `balance` | `string` | Balance in base units (wei, satoshis, etc.) |

---

### `getTokenBalance`

Get the balance of a registered token (USDT, XAU₮, etc.). **Read-only.**

**Input:**

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `chain` | `enum` | Yes | The blockchain to query |
| `token` | `string` | Yes | Token symbol (e.g., `"USDT"`) |

**Output:**

| Field | Type | Description |
| --- | --- | --- |
| `balance` | `string` | Human-readable token balance |
| `balanceBaseUnits` | `string` | Balance in smallest unit |

---

### `getFeeRates`

Get current network fee rates. **Read-only.**

**Input:**

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `chain` | `enum` | Yes | The blockchain to query |

**Output:**

| Field | Type | Description |
| --- | --- | --- |
| `normal` | `string` | Normal fee rate (balanced speed) |
| `fast` | `string` | Fast fee rate (higher cost, faster confirmation) |

Fee units vary by chain: satoshis/byte (Bitcoin), wei (Ethereum), or chain-specific units.

---

### `getMaxSpendableBtc`

Get the maximum spendable Bitcoin amount after fees. **Read-only.** Bitcoin-only.

**Input:** None

**Output:**

| Field | Type | Description |
| --- | --- | --- |
| `amount` | `string` | Maximum spendable amount (satoshis) |
| `fee` | `string` | Estimated transaction fee (satoshis) |
| `changeValue` | `string` | Expected change output (satoshis) |

---

### `quoteSendTransaction`

Estimate the fee for sending native currency. **Read-only.** Does not broadcast.

**Input:**

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `chain` | `enum` | Yes | The blockchain |
| `to` | `string` | Yes | Recipient address |
| `value` | `string` | Yes | Amount in **base units** (wei, satoshis) |

**Output:**

| Field | Type | Description |
| --- | --- | --- |
| `fee` | `string` | Estimated transaction fee in base units |

---

### `quoteTransfer`

Estimate the fee for transferring a token. **Read-only.** Does not broadcast.

**Input:**

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `chain` | `enum` | Yes | The blockchain |
| `token` | `string` | Yes | Token symbol (e.g., `"USDT"`) |
| `recipient` | `string` | Yes | Recipient address |
| `amount` | `string` | Yes | Amount in **human-readable** format (e.g., `"10"`) |

**Output:**

| Field | Type | Description |
| --- | --- | --- |
| `fee` | `string` | Estimated transaction fee in base units |

---

### `sendTransaction`

Send native currency (ETH, BTC, etc.). **Destructive** - requires user confirmation.

**Input:**

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `chain` | `enum` | Yes | The blockchain |
| `to` | `string` | Yes | Recipient address |
| `value` | `string` | Yes | Amount in **base units** (wei, satoshis) |

**Output:**

| Field | Type | Description |
| --- | --- | --- |
| `hash` | `string` | Transaction hash |
| `fee` | `string` | Actual fee paid |

{% hint style="warning" %}
This tool shows a confirmation dialog with transaction details before broadcasting. The user must approve the transaction explicitly.
{% endhint %}

---

### `transfer`

Transfer a registered token. **Destructive** - requires user confirmation.

**Input:**

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `chain` | `enum` | Yes | The blockchain |
| `token` | `string` | Yes | Token symbol (e.g., `"USDT"`) |
| `to` | `string` | Yes | Recipient address |
| `amount` | `string` | Yes | Amount in **human-readable** format (e.g., `"100"`) |

**Output:**

| Field | Type | Description |
| --- | --- | --- |
| `hash` | `string` | Transaction hash |
| `fee` | `string` | Actual fee paid |

{% hint style="warning" %}
This tool shows a confirmation dialog with transaction details before broadcasting. The user must approve the transaction explicitly.
{% endhint %}

---

### `sign`

Sign an arbitrary message with the wallet's private key. **Does not reveal the private key.**

**Input:**

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `chain` | `enum` | Yes | The blockchain |
| `message` | `string` | Yes | Message to sign |

**Output:**

| Field | Type | Description |
| --- | --- | --- |
| `signature` | `string` | Cryptographic signature |

---

### `verify`

Verify that a signature is valid for a given message. **Read-only.**

**Input:**

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `chain` | `enum` | Yes | The blockchain |
| `message` | `string` | Yes | Original message |
| `signature` | `string` | Yes | Signature to verify |

**Output:**

| Field | Type | Description |
| --- | --- | --- |
| `valid` | `boolean` | Whether the signature is valid |

***

## Pricing Tools

_Requires: `usePricing()`_

### `getCurrentPrice`

Get the current spot price from Bitfinex. **Read-only.**

**Input:**

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `base` | `string` | Yes | Base currency (e.g., `"BTC"`, `"ETH"`) |
| `quote` | `string` | Yes | Quote currency (e.g., `"USD"`, `"USDT"`) |

**Output:**

| Field | Type | Description |
| --- | --- | --- |
| `base` | `string` | Base currency |
| `quote` | `string` | Quote currency |
| `price` | `number` | Current spot price |

---

### `getHistoricalPrice`

Get historical price data (OHLCV candles) from Bitfinex. **Read-only.**

**Input:**

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `from` | `string` | Yes | Base currency (e.g., `"BTC"`) |
| `to` | `string` | Yes | Quote currency (e.g., `"USD"`) |
| `start` | `number` | No | Start timestamp (ms, unix epoch) |
| `end` | `number` | No | End timestamp (ms, unix epoch) |

**Output:**

| Field | Type | Description |
| --- | --- | --- |
| `from` | `string` | Base currency |
| `to` | `string` | Quote currency |
| `start` | `number` | Start timestamp (if provided) |
| `end` | `number` | End timestamp (if provided) |
| `points` | `number[][]` | Array of `[timestamp, open, close, high, low, volume]` |

{% hint style="info" %}
Long time ranges are automatically downscaled to ≤100 data points.
{% endhint %}

***

## Indexer Tools

_Requires: `useIndexer()`_

### `getIndexerTokenBalance`

Get token balance for **any** address via the WDK Indexer API. **Read-only.**

**Input:**

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `blockchain` | `enum` | Yes | Blockchain to query |
| `token` | `enum` | Yes | Token (e.g., `"usdt"`, `"xaut"`, `"btc"`) |
| `address` | `string` | Yes | Wallet address |

**Output:**

| Field | Type | Description |
| --- | --- | --- |
| `tokenBalance.blockchain` | `string` | Blockchain name |
| `tokenBalance.token` | `string` | Token name |
| `tokenBalance.amount` | `string` | Token balance |

{% hint style="info" %}
This queries the **indexed** balance, which may have slight delay compared to real-time blockchain state. For your own wallet's balance, use `getBalance` or `getTokenBalance` instead.
{% endhint %}

---

### `getTokenTransfers`

Get token transfer history for an address. **Read-only.**

**Input:**

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `blockchain` | `enum` | Yes | Blockchain to query |
| `token` | `enum` | Yes | Token (e.g., `"usdt"`, `"xaut"`, `"btc"`) |
| `address` | `string` | Yes | Wallet address |
| `limit` | `number` | No | Results per page (1–1000, default: 10) |
| `fromTs` | `number` | No | Start timestamp (unix seconds) |
| `toTs` | `number` | No | End timestamp (unix seconds) |
| `sort` | `enum` | No | `"asc"` or `"desc"` (default: `"desc"`) |

**Output:**

| Field | Type | Description |
| --- | --- | --- |
| `transfers` | `object[]` | Array of transfer records |
| `transfers[].blockchain` | `string` | Blockchain |
| `transfers[].blockNumber` | `number` | Block number |
| `transfers[].transactionHash` | `string` | Transaction hash |
| `transfers[].token` | `string` | Token |
| `transfers[].amount` | `string` | Transfer amount |
| `transfers[].timestamp` | `number` | Unix timestamp |
| `transfers[].from` | `string` | Sender address |
| `transfers[].to` | `string` | Recipient address |

***

## Swap Tools

_Requires: `registerProtocol()` with a swap protocol_

### `quoteSwap`

Get a swap quote without executing. **Read-only.**

**Input:**

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `chain` | `enum` | Yes | Blockchain with swap protocol |
| `tokenIn` | `string` | Yes | Token to sell (e.g., `"USDT"`) |
| `tokenOut` | `string` | Yes | Token to buy (e.g., `"WETH"`) |
| `amount` | `string` | Yes | Amount in human-readable units |
| `side` | `enum` | Yes | `"sell"` or `"buy"` |

**Output:**

| Field | Type | Description |
| --- | --- | --- |
| `protocol` | `string` | DEX protocol used |
| `tokenIn` | `string` | Input token symbol |
| `tokenOut` | `string` | Output token symbol |
| `tokenInAmount` | `string` | Input amount (human-readable) |
| `tokenOutAmount` | `string` | Output amount (human-readable) |
| `fee` | `string` | Estimated fee |

---

### `swap`

Execute a token swap. **Destructive** - requires user confirmation.

**Input:**

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `chain` | `enum` | Yes | Blockchain with swap protocol |
| `tokenIn` | `string` | Yes | Token to sell |
| `tokenOut` | `string` | Yes | Token to buy |
| `amount` | `string` | Yes | Amount in human-readable units |
| `side` | `enum` | Yes | `"sell"` or `"buy"` |
| `to` | `string` | No | Recipient address (defaults to wallet) |

**Output:**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Whether the swap succeeded |
| `protocol` | `string` | DEX protocol used |
| `hash` | `string` | Transaction hash |
| `tokenIn` | `string` | Input token symbol |
| `tokenOut` | `string` | Output token symbol |
| `tokenInAmount` | `string` | Actual input amount |
| `tokenOutAmount` | `string` | Actual output amount |
| `fee` | `string` | Fee paid |

{% hint style="warning" %}
This tool quotes the swap first, then shows a confirmation dialog before broadcasting.
{% endhint %}

***

## Bridge Tools

_Requires: `registerProtocol()` with a bridge protocol_

### `quoteBridge`

Get a bridge quote without executing. **Read-only.**

**Input:**

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `chain` | `enum` | Yes | Source blockchain |
| `targetChain` | `string` | Yes | Destination blockchain |
| `token` | `string` | Yes | Token to bridge (e.g., `"USDT"`) |
| `amount` | `string` | Yes | Amount in human-readable units |
| `recipient` | `string` | No | Recipient on target chain (defaults to wallet) |

**Output:**

| Field | Type | Description |
| --- | --- | --- |
| `protocol` | `string` | Bridge protocol used |
| `sourceChain` | `string` | Source blockchain |
| `targetChain` | `string` | Destination blockchain |
| `token` | `string` | Token symbol |
| `amount` | `string` | Amount to bridge |
| `fee` | `string` | Estimated gas fee |
| `bridgeFee` | `string` | Bridge protocol fee |

---

### `bridge`

Execute a cross-chain bridge. **Destructive** - requires user confirmation.

**Input:**

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `chain` | `enum` | Yes | Source blockchain |
| `targetChain` | `string` | Yes | Destination blockchain |
| `token` | `string` | Yes | Token to bridge |
| `amount` | `string` | Yes | Amount in human-readable units |
| `recipient` | `string` | No | Recipient on target chain (defaults to wallet) |

**Output:**

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Whether the bridge succeeded |
| `protocol` | `string` | Bridge protocol used |
| `hash` | `string` | Transaction hash |
| `sourceChain` | `string` | Source blockchain |
| `targetChain` | `string` | Destination blockchain |
| `token` | `string` | Token symbol |
| `amount` | `string` | Amount bridged |
| `fee` | `string` | Gas fee paid |
| `bridgeFee` | `string` | Bridge protocol fee paid |

{% hint style="warning" %}
Bridge finality varies by target chain - tokens may take minutes to hours to arrive.
{% endhint %}

***

## Lending Tools

_Requires: `registerProtocol()` with a lending protocol_

### `quoteSupply`

Get a fee estimate for supplying tokens to a lending pool. **Read-only.**

**Input:**

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `chain` | `enum` | Yes | Blockchain with lending protocol |
| `token` | `string` | Yes | Token to supply |
| `amount` | `string` | Yes | Amount in human-readable units |
| `onBehalfOf` | `string` | No | Address to receive aTokens (defaults to wallet) |

**Output:**

| Field | Type | Description |
| --- | --- | --- |
| `protocol` | `string` | Lending protocol used |
| `chain` | `string` | Blockchain |
| `token` | `string` | Token symbol |
| `amount` | `string` | Amount to supply |
| `fee` | `string` | Estimated gas fee |

---

### `supply`

Supply tokens to a lending pool. **Destructive** - requires user confirmation.

Same input as `quoteSupply`. Output includes `success`, `protocol`, `hash`, `token`, `amount`, and `fee`.

---

### `quoteWithdraw`

Estimate fee for withdrawing from a lending pool. **Read-only.**

**Input:**

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `chain` | `enum` | Yes | Blockchain |
| `token` | `string` | Yes | Token to withdraw |
| `amount` | `string` | Yes | Amount in human-readable units |

**Output:** Same structure as `quoteSupply`.

---

### `withdraw`

Withdraw tokens from a lending pool. **Destructive** - requires user confirmation.

Same input as `quoteWithdraw`. Output includes `success`, `protocol`, `hash`, `token`, `amount`, and `fee`.

---

### `quoteBorrow`

Estimate fee for borrowing from a lending pool. **Read-only.**

**Input:**

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `chain` | `enum` | Yes | Blockchain |
| `token` | `string` | Yes | Token to borrow |
| `amount` | `string` | Yes | Amount in human-readable units |

**Output:** Same structure as `quoteSupply`.

---

### `borrow`

Borrow tokens from a lending pool. **Destructive** - requires user confirmation.

Same input as `quoteBorrow`. Output includes `success`, `protocol`, `hash`, `token`, `amount`, and `fee`.

---

### `quoteRepay`

Estimate fee for repaying a loan. **Read-only.**

**Input:**

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `chain` | `enum` | Yes | Blockchain |
| `token` | `string` | Yes | Token to repay |
| `amount` | `string` | Yes | Amount in human-readable units |

**Output:** Same structure as `quoteSupply`.

---

### `repay`

Repay borrowed tokens. **Destructive** - requires user confirmation.

Same input as `quoteRepay`. Output includes `success`, `protocol`, `hash`, `token`, `amount`, and `fee`.

***

## Fiat Tools

_Requires: `registerProtocol()` with a fiat protocol_

### `quoteBuy`

Get a quote for purchasing crypto with fiat. **Read-only.**

**Input:**

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `chain` | `enum` | Yes | Blockchain for the fiat protocol |
| `cryptoAsset` | `string` | Yes | Crypto asset code (e.g., `"eth"`, `"btc"`) |
| `fiatCurrency` | `string` | Yes | Fiat currency code (e.g., `"USD"`, `"EUR"`) |
| `amount` | `string` | Yes | Amount to quote |
| `amountType` | `enum` | Yes | `"crypto"` or `"fiat"` |

**Output:**

| Field | Type | Description |
| --- | --- | --- |
| `protocol` | `string` | Fiat protocol used |
| `cryptoAsset` | `string` | Crypto asset code |
| `fiatCurrency` | `string` | Fiat currency code |
| `cryptoAmount` | `string` | Crypto amount (base units) |
| `fiatAmount` | `string` | Fiat amount (smallest units, e.g., cents) |
| `fee` | `string` | Total fee (fiat smallest units) |
| `rate` | `string` | Exchange rate |

---

### `buy`

Execute a fiat-to-crypto purchase. **Destructive** - requires user confirmation.

Same input as `quoteBuy`. Output includes `success`, `protocol`, redirect URL or transaction details.

---

### `quoteSell`

Get a quote for selling crypto to fiat. **Read-only.**

Same input structure as `quoteBuy`. Same output structure.

---

### `sell`

Execute a crypto-to-fiat sale. **Destructive** - requires user confirmation.

Same input as `quoteSell`. Output includes `success`, `protocol`, and transaction details.

---

### `getTransactionDetail`

Get details of a fiat transaction by ID. **Read-only.**

**Input:**

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `chain` | `enum` | Yes | Blockchain |
| `transactionId` | `string` | Yes | Transaction ID from the fiat provider |

---

### `getSupportedCryptoAssets`

List crypto assets supported by the fiat provider. **Read-only.**

**Input:**

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `chain` | `enum` | Yes | Blockchain |

---

### `getSupportedFiatCurrencies`

List fiat currencies supported by the fiat provider. **Read-only.**

**Input:**

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `chain` | `enum` | Yes | Blockchain |

---

### `getSupportedCountries`

List countries supported by the fiat provider. **Read-only.**

**Input:**

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `chain` | `enum` | Yes | Blockchain |

***

## Utility Exports

Utility functions for converting between human-readable amounts and blockchain base units:

```javascript
import {
  parseAmountToBaseUnits,
  formatBaseUnitsToAmount,
  AmountParseError,
  AMOUNT_ERROR_CODES
} from '@tetherto/wdk-mcp-toolkit'
```

### `parseAmountToBaseUnits(amount, decimals)`

Converts a human-readable amount string to `BigInt` base units without floating-point errors.

```javascript
parseAmountToBaseUnits('2.01', 6)   // → 2010000n
parseAmountToBaseUnits('100', 18)   // → 100000000000000000000n
parseAmountToBaseUnits('1,000.50', 6) // → 1000500000n
```

### `formatBaseUnitsToAmount(baseUnits, decimals)`

Converts `BigInt` base units to a human-readable string.

```javascript
formatBaseUnitsToAmount(2010000n, 6)  // → '2.01'
formatBaseUnitsToAmount(100000000000000000000n, 18) // → '100'
```

### `AmountParseError`

Custom error class with a `code` property for programmatic handling:

| Error Code | Description |
| --- | --- |
| `EMPTY_STRING` | Empty amount string |
| `INVALID_FORMAT` | Not a valid number |
| `NEGATIVE_AMOUNT` | Negative amounts not allowed |
| `EXCESSIVE_PRECISION` | More decimal places than token supports |
| `INVALID_DECIMALS` | Decimals value out of range |
| `SCIENTIFIC_NOTATION_PRECISION` | Scientific notation exceeds precision |

***

## Need Help?

{% include "../../.gitbook/includes/support-cards.md" %}
