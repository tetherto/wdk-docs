---
title: Get Started
description: Install the MCP Toolkit and run your first AI-powered wallet server
icon: rocket
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

# Get Started

## Setup Wizard

The fastest way to get running. Clone the repository and let the wizard configure everything:

{% code title="Terminal" %}
```bash
git clone https://github.com/tetherto/wdk-mcp-toolkit.git
cd wdk-mcp-toolkit
npm install
npm run setup
```
{% endcode %}

The wizard will:
1. Prompt for your seed phrase (required)
2. Ask for optional API keys (WDK Indexer, MoonPay)
3. Generate `.vscode/mcp.json` with your credentials
4. Install required dependencies automatically

Once complete, open the project in VS Code, start the MCP server from `.vscode/mcp.json`, and open the chatbot with **Cmd + Shift + I** (or run **Chat: Open Agent** from the Command Palette on non-Mac).

{% hint style="warning" %}
**Security** - Your seed phrase is stored locally in `.vscode/mcp.json`, which is gitignored. Always use a **dedicated development wallet** with limited funds.
{% endhint %}

***

## Manual Setup

If you prefer to set things up yourself or want to integrate the toolkit into an existing project:

{% stepper %}
{% step %}

#### Install the toolkit

Install the MCP Toolkit and the wallet modules you need:

{% code title="Terminal" %}
```bash
npm install @tetherto/wdk-mcp-toolkit @modelcontextprotocol/sdk

# Wallet modules (add any combination)
npm install @tetherto/wdk-wallet-evm    # Ethereum, Polygon, Arbitrum, etc.
npm install @tetherto/wdk-wallet-btc    # Bitcoin
```
{% endcode %}

{% endstep %}

{% step %}

#### Create your MCP server

Create `index.js` with a basic multi-chain server:

{% code title="index.js" lineNumbers="true" %}
```javascript
import { WdkMcpServer, CHAINS, WALLET_TOOLS, PRICING_TOOLS } from '@tetherto/wdk-mcp-toolkit'
import WalletManagerEvm from '@tetherto/wdk-wallet-evm'
import WalletManagerBtc from '@tetherto/wdk-wallet-btc'

const server = new WdkMcpServer('my-wallet-server', '1.0.0')

// 1. Enable WDK with your seed phrase
server.useWdk({ seed: process.env.WDK_SEED })

// 2. Register wallet modules
server.registerWallet('ethereum', WalletManagerEvm, {
  provider: 'https://eth.drpc.org'
})

server.registerWallet('bitcoin', WalletManagerBtc, {
  network: 'bitcoin',
  host: 'electrum.blockstream.info',
  port: 50001
})

// 3. Enable pricing
server.usePricing()

// 4. Register tools and start
server.registerTools([...WALLET_TOOLS, ...PRICING_TOOLS])
```
{% endcode %}

{% endstep %}

{% step %}

#### Connect your AI client

Add the MCP server to your AI tool's configuration:

{% tabs %}
{% tab title="GitHub Copilot" %}

**Config path:** `.vscode/mcp.json` (project-level)

{% code title=".vscode/mcp.json" %}
```json
{
  "servers": {
    "wdk": {
      "type": "stdio",
      "command": "node",
      "args": ["index.js"],
      "env": {
        "WDK_SEED": "your twelve word seed phrase here"
      }
    }
  }
}
```
{% endcode %}

Then in VS Code:
1. Open `.vscode/mcp.json` and click **Start** above the server config
2. Open GitHub Copilot Chat and select **Agent mode**
3. Click **Tools** to verify the MCP tools are available

→ [VS Code MCP documentation](https://code.visualstudio.com/docs/copilot/chat/mcp-servers)

{% endtab %}
{% tab title="Cursor" %}

**Config path:** `.cursor/mcp.json` (project-level)

```json
{
  "mcpServers": {
    "wdk": {
      "command": "node",
      "args": ["index.js"],
      "env": {
        "WDK_SEED": "your twelve word seed phrase here"
      }
    }
  }
}
```

→ [Cursor MCP documentation](https://cursor.com/docs/context/mcp)

{% endtab %}
{% tab title="Claude Code" %}

Run this command from your project directory:

```bash
claude mcp add wdk -- node index.js
```

Set the environment variable separately:

```bash
export WDK_SEED="your twelve word seed phrase here"
```

→ [Claude Code MCP documentation](https://docs.anthropic.com/en/docs/claude-code/tutorials#set-up-model-context-protocol-mcp)

{% endtab %}
{% tab title="Windsurf" %}

**Config path:** `~/.codeium/windsurf/mcp_config.json`

```json
{
  "mcpServers": {
    "wdk": {
      "command": "node",
      "args": ["index.js"],
      "env": {
        "WDK_SEED": "your twelve word seed phrase here"
      }
    }
  }
}
```

→ [Windsurf MCP documentation](https://docs.windsurf.com/windsurf/cascade/mcp)

{% endtab %}
{% tab title="Cline" %}

Add via Cline's MCP settings panel in VS Code, or create the config file directly:

```json
{
  "mcpServers": {
    "wdk": {
      "command": "node",
      "args": ["index.js"],
      "env": {
        "WDK_SEED": "your twelve word seed phrase here"
      }
    }
  }
}
```

→ [Cline MCP documentation](https://github.com/cline/cline#add-context)

{% endtab %}
{% tab title="Continue" %}

**Config path:** `~/.continue/config.yaml`

Add to the `mcpServers` section with the command and arguments for your server:

```
command: node
args: ["index.js"]
env:
  WDK_SEED: "your twelve word seed phrase here"
```

→ [Continue MCP documentation](https://docs.continue.dev/customize/mcp-tools)

{% endtab %}
{% endtabs %}

{% endstep %}

{% step %}

#### Try it out

Ask your AI assistant:

```
What's my ethereum address?
```

```
Check my BTC balance
```

```
What's the current price of ETH in USD?
```

```
Send 10 USDT to 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7 on ethereum
```

{% hint style="info" %}
Write operations (sending, swapping, bridging) will show a **confirmation dialog** before executing. You must explicitly approve each transaction.
{% endhint %}

{% endstep %}
{% endstepper %}

***

## Optional Capabilities

Add more capabilities by installing additional packages and enabling them on the server:

{% code title="Additional capabilities" lineNumbers="true" %}
```javascript
import { INDEXER_TOOLS, SWAP_TOOLS, BRIDGE_TOOLS, LENDING_TOOLS, FIAT_TOOLS } from '@tetherto/wdk-mcp-toolkit'
import VeloraProtocolEvm from '@tetherto/wdk-protocol-swap-velora-evm'
import Usdt0ProtocolEvm from '@tetherto/wdk-protocol-bridge-usdt0-evm'
import AaveProtocolEvm from '@tetherto/wdk-protocol-lending-aave-evm'
import MoonPayProtocol from '@tetherto/wdk-protocol-fiat-moonpay'

// Indexer - transaction history
server.useIndexer({ apiKey: process.env.WDK_INDEXER_API_KEY })

// DeFi protocols
server.registerProtocol('ethereum', 'velora', VeloraProtocolEvm)
server.registerProtocol('ethereum', 'usdt0', Usdt0ProtocolEvm)
server.registerProtocol('ethereum', 'aave', AaveProtocolEvm)
server.registerProtocol('ethereum', 'moonpay', MoonPayProtocol, {
  secretKey: process.env.MOONPAY_SECRET_KEY,
  apiKey: process.env.MOONPAY_API_KEY
})

// Register the corresponding tools
server.registerTools([
  ...INDEXER_TOOLS,
  ...SWAP_TOOLS,
  ...BRIDGE_TOOLS,
  ...LENDING_TOOLS,
  ...FIAT_TOOLS
])
```
{% endcode %}

***

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `WDK_SEED` | Yes | BIP-39 seed phrase for wallet derivation |
| `WDK_INDEXER_API_KEY` | No | Enables `INDEXER_TOOLS` - [get a key](https://wdk-api.tether.io/register) |
| `MOONPAY_API_KEY` | No | Enables `FIAT_TOOLS` - [MoonPay Dashboard](https://dashboard.moonpay.com/) |
| `MOONPAY_SECRET_KEY` | No | Required with `MOONPAY_API_KEY` |

***

## Next Steps

* [**Configuration**](configuration.md) - Wallets, tokens, protocols, custom tools, and security
* [**API Reference**](api-reference.md) - All 35 built-in MCP tools with parameters and schemas

***

## Need Help?

{% include "../../.gitbook/includes/support-cards.md" %}
