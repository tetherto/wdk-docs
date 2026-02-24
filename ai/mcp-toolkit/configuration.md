---
title: Configuration
description: Configure wallets, capabilities, tokens, protocols, and custom tools
icon: wrench
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

# Configuration

## Server Setup

Create a server with a name and version:

```javascript
import { WdkMcpServer } from '@tetherto/wdk-mcp-toolkit'

const server = new WdkMcpServer('my-server', '1.0.0')
```

The `WdkMcpServer` extends `McpServer` from the official [`@modelcontextprotocol/sdk`](https://github.com/modelcontextprotocol/typescript-sdk) with WDK-specific capabilities. All standard MCP server features are available.

***

## Wallet Configuration

### Enable WDK

```javascript
server.useWdk({ seed: process.env.WDK_SEED })
```

The `seed` is a BIP-39 mnemonic phrase used for key derivation across all registered blockchains.

{% hint style="danger" %}
**Never hardcode seed phrases in source code.** Use environment variables or a secrets manager. The setup wizard generates a gitignored `.vscode/mcp.json` for local development.
{% endhint %}

### Register Wallets

Register a wallet module for each blockchain you want to support:

```javascript
import WalletManagerEvm from '@tetherto/wdk-wallet-evm'
import WalletManagerBtc from '@tetherto/wdk-wallet-btc'
import WalletManagerSolana from '@tetherto/wdk-wallet-solana'

// EVM chains - one module handles all EVM networks
server.registerWallet('ethereum', WalletManagerEvm, {
  provider: 'https://eth.drpc.org'
})
server.registerWallet('polygon', WalletManagerEvm, {
  provider: 'https://polygon-rpc.com'
})

// Bitcoin
server.registerWallet('bitcoin', WalletManagerBtc, {
  network: 'bitcoin',
  host: 'electrum.blockstream.info',
  port: 50001
})

// Solana
server.registerWallet('solana', WalletManagerSolana, {
  provider: 'https://api.mainnet-beta.solana.com'
})
```

Each `registerWallet()` call registers the chain name and makes it available to all wallet tools. For configuration details of each wallet module, see the [Wallet Modules](../../sdk/wallet-modules/README.md) documentation.

***

## Capabilities

Enable optional capabilities before registering their tools:

| Capability | Method | Requirement | Unlocks |
| --- | --- | --- | --- |
| **Pricing** | `server.usePricing()` | None | `PRICING_TOOLS` (2 tools) |
| **Indexer** | `server.useIndexer({ apiKey })` | [WDK API key](https://wdk-api.tether.io/register) | `INDEXER_TOOLS` (2 tools) |
| **Swap** | `server.registerProtocol(chain, label, SwapProtocol)` | Swap module installed | `SWAP_TOOLS` (2 tools) |
| **Bridge** | `server.registerProtocol(chain, label, BridgeProtocol)` | Bridge module installed | `BRIDGE_TOOLS` (2 tools) |
| **Lending** | `server.registerProtocol(chain, label, LendingProtocol)` | Lending module installed | `LENDING_TOOLS` (8 tools) |
| **Fiat** | `server.registerProtocol(chain, label, FiatProtocol, config)` | Fiat module installed | `FIAT_TOOLS` (8 tools) |

### Pricing

Fetches live prices from Bitfinex. No API key needed.

```javascript
server.usePricing()
```

### Indexer

Enables querying token balances and transfer history for **any** address. Requires an API key.

```javascript
server.useIndexer({ apiKey: process.env.WDK_INDEXER_API_KEY })
```

### Protocols

DeFi protocols are registered per-chain:

```javascript
import VeloraProtocolEvm from '@tetherto/wdk-protocol-swap-velora-evm'
import Usdt0ProtocolEvm from '@tetherto/wdk-protocol-bridge-usdt0-evm'
import AaveProtocolEvm from '@tetherto/wdk-protocol-lending-aave-evm'
import MoonPayProtocol from '@tetherto/wdk-protocol-fiat-moonpay'

server.registerProtocol('ethereum', 'velora', VeloraProtocolEvm)
server.registerProtocol('ethereum', 'usdt0', Usdt0ProtocolEvm)
server.registerProtocol('ethereum', 'aave', AaveProtocolEvm)
server.registerProtocol('ethereum', 'moonpay', MoonPayProtocol, {
  apiKey: process.env.MOONPAY_API_KEY,
  secretKey: process.env.MOONPAY_SECRET_KEY
})
```

***

## Token Management

### Default Tokens

USDT is auto-registered for supported chains via `DEFAULT_TOKENS`. You can query what's available:

```javascript
server.getRegisteredTokens('ethereum')  // ['USDT']
```

### Custom Tokens

Register additional tokens with `registerToken()`:

```javascript
server.registerToken('ethereum', 'DAI', {
  address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  decimals: 18
})
```

Registered tokens are available to all tools that accept a `token` parameter (`getTokenBalance`, `transfer`, `quoteTransfer`, `swap`, etc.).

***

## Tool Registration

### Built-in Tool Arrays

Each category exports three arrays for fine-grained control:

| Export | Contents |
| --- | --- |
| `WALLET_TOOLS` | All 11 wallet tools |
| `WALLET_READ_TOOLS` | 7 read-only wallet tools |
| `WALLET_WRITE_TOOLS` | 4 wallet tools that modify state |
| `PRICING_TOOLS` | All 2 pricing tools |
| `INDEXER_TOOLS` | All 2 indexer tools |
| `SWAP_TOOLS` | All 2 swap tools |
| `SWAP_READ_TOOLS` | 1 read-only swap tool |
| `SWAP_WRITE_TOOLS` | 1 swap tool that modifies state |
| `BRIDGE_TOOLS` | All 2 bridge tools |
| `BRIDGE_READ_TOOLS` | 1 read-only bridge tool |
| `BRIDGE_WRITE_TOOLS` | 1 bridge tool that modifies state |
| `LENDING_TOOLS` | All 8 lending tools |
| `LENDING_READ_TOOLS` | 4 read-only lending tools |
| `LENDING_WRITE_TOOLS` | 4 lending tools that modify state |
| `FIAT_TOOLS` | All 8 fiat tools |
| `FIAT_READ_TOOLS` | 6 read-only fiat tools |
| `FIAT_WRITE_TOOLS` | 2 fiat tools that modify state |

### Read-Only Mode

To allow an AI agent to query data without the ability to make transactions:

```javascript
import {
  WALLET_READ_TOOLS,
  PRICING_TOOLS,
  INDEXER_TOOLS,
  SWAP_READ_TOOLS
} from '@tetherto/wdk-mcp-toolkit'

server.registerTools([
  ...WALLET_READ_TOOLS,
  ...PRICING_TOOLS,
  ...INDEXER_TOOLS,
  ...SWAP_READ_TOOLS
])
```

### Individual Tool Registration

You can also import and register tools individually:

```javascript
import { getAddress, getBalance, getCurrentPrice } from '@tetherto/wdk-mcp-toolkit'

server.registerTools([getAddress, getBalance, getCurrentPrice])
```

### Custom Tools

Add your own MCP tools alongside the built-in ones using the standard `registerTool()` method (inherited from `McpServer`). See the [MCP SDK tools documentation](https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/server.md#tools) for full details.

```javascript
server.registerTool(
  'myCustomTool',
  {
    title: 'My Custom Tool',
    description: 'Description of what this tool does',
    inputSchema: z.object({
      param: z.string().describe('A required parameter')
    }),
    outputSchema: z.object({
      result: z.string()
    }),
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false
    }
  },
  async ({ param }) => {
    return {
      content: [{ type: 'text', text: `Result: ${param}` }],
      structuredContent: { result: param }
    }
  }
)
```

***

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `WDK_SEED` | Yes | BIP-39 mnemonic for wallet key derivation |
| `WDK_INDEXER_API_KEY` | No | API key for WDK Indexer |
| `MOONPAY_API_KEY` | No | API key for MoonPay fiat on/off-ramp |
| `MOONPAY_SECRET_KEY` | No | Secret key for MoonPay |

***

## Security Checklist

{% hint style="danger" %}
**Self-custodial wallets require careful key management.** Follow these guidelines to protect user funds.
{% endhint %}

- [ ] **Use a dedicated development wallet** - Never use production wallets with real funds for testing
- [ ] **Never hardcode seed phrases** - Always use environment variables or `.vscode/mcp.json` (gitignored)
- [ ] **Use `WALLET_READ_TOOLS` for untrusted agents** - Only register write tools when user confirmation is available
- [ ] **Call `server.close()` on shutdown** - This disposes the WDK instance and wipes keys from memory
- [ ] **Use `stdio` transport** - The default transport communicates only with the local AI client process
- [ ] **Review MCP annotations** - Tools declare `readOnlyHint` and `destructiveHint` so clients can warn users appropriately
- [ ] **Keep `.vscode/mcp.json` gitignored** - The setup wizard handles this automatically

***

## Need Help?

{% include "../../.gitbook/includes/support-cards.md" %}
