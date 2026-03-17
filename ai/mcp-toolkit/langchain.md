---
title: LangChain Integration
description: Use WDK MCP tools in LangChain agents with zero-config server startup
icon: link
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

# LangChain Integration

You can use the WDK MCP Toolkit as a tool provider for [LangChain](https://www.langchain.com/) agents in both Python and TypeScript. LangChain's `MultiServerMCPClient` spawns the MCP server as a subprocess and converts WDK tools into LangChain-compatible tools, giving your agent access to wallet operations, pricing, swaps, bridges, lending, and more.

This integration uses the `serve` CLI command, which starts a fully configured MCP server on stdio with no server script required.

{% hint style="info" %}
This approach uses LangChain's MCP adapters to connect to the WDK MCP server. WDK does not ship a native LangChain integration, it leverages the standard MCP protocol that LangChain already supports.
{% endhint %}

{% hint style="info" %}
**Want more control?** The `serve` command is the fastest way to get running, but you can also [write your own MCP server](get-started.md#manual-setup) with the programmatic API for full control over wallets, tools, and protocols. Then point LangChain's `MultiServerMCPClient` at it using `node your-server.js` instead of the `serve` command.
{% endhint %}

***

## The `serve` Command

The `serve` command provides zero-config MCP server startup so you don't need to write a server script:

{% code title="Terminal" %}
```bash
npx @tetherto/wdk-mcp-toolkit serve
```
{% endcode %}

Pass `WDK_SEED` to enable wallet operations, or omit it to run with pricing tools only:

{% code title="Terminal" %}
```bash
# With wallet operations
WDK_SEED="your twelve word seed phrase here" npx @tetherto/wdk-mcp-toolkit serve

# Pricing-only mode (no seed required)
npx @tetherto/wdk-mcp-toolkit serve
```
{% endcode %}

### Default Chains

By default, `serve` enables **three chains**: Ethereum, Arbitrum, and Bitcoin. For each enabled chain it dynamically imports the required wallet package and skips any that aren't installed. You can change the enabled set with the `WDK_CHAINS` environment variable.

### Built-in Registry

The command has built-in definitions for 13 chains and 4 protocol modules. When a chain is enabled and its package is installed, the wallet is registered automatically. Protocol modules are also auto-registered when their packages are installed and at least one of their target chains is enabled.

| Module | Registers | Default |
| --- | --- | --- |
| `@tetherto/wdk-wallet-evm` | Ethereum, Arbitrum, Polygon, Optimism, Base, Avalanche, BNB, Plasma, Spark | Ethereum + Arbitrum enabled |
| `@tetherto/wdk-wallet-btc` | Bitcoin | Enabled |
| `@tetherto/wdk-wallet-sol` | Solana | Not enabled by default |
| `@tetherto/wdk-wallet-ton` | TON | Not enabled by default |
| `@tetherto/wdk-wallet-tron` | Tron | Not enabled by default |
| `@tetherto/wdk-protocol-swap-velora-evm` | Swap tools (Ethereum, Arbitrum) | -- |
| `@tetherto/wdk-protocol-bridge-usdt0-evm` | Bridge tools (Ethereum, Arbitrum) | -- |
| `@tetherto/wdk-protocol-lending-aave-evm` | Lending tools (Ethereum) | -- |
| `@tetherto/wdk-protocol-fiat-moonpay` | Fiat tools (Ethereum) | Requires `MOONPAY_*` env vars |

{% hint style="info" %}
Missing packages are silently skipped. Install only the modules you need and `serve` will pick them up. For chains or protocols **not** in the built-in registry, use a [custom config file](#custom-config-file).
{% endhint %}

***

## Quick Start

{% tabs %}
{% tab title="Python" %}

#### Install dependencies

{% code title="Terminal" %}
```bash
pip install langchain-mcp-adapters langgraph langchain-openai
```
{% endcode %}

#### Create your agent

{% code title="agent.py" lineNumbers="true" %}
```python
import asyncio
from langchain_mcp_adapters.client import MultiServerMCPClient
from langgraph.prebuilt import create_react_agent
from langchain_openai import ChatOpenAI

async def main():
    client = MultiServerMCPClient({
        "wdk": {
            "transport": "stdio",
            "command": "npx",
            "args": ["-y", "@tetherto/wdk-mcp-toolkit", "serve"],
            "env": {
                "WDK_SEED": "your twelve word seed phrase here",
                "WDK_MCP_ELICITATION": "false",
            },
        }
    })

    tools = await client.get_tools()
    agent = create_react_agent(ChatOpenAI(model="gpt-4o"), tools)

    result = await agent.ainvoke({
        "messages": [{"role": "user", "content": "What is my Ethereum address?"}]
    })
    print(result["messages"][-1].content)

    await client.close()

asyncio.run(main())
```
{% endcode %}

#### Run it

{% code title="Terminal" %}
```bash
export OPENAI_API_KEY="sk-..."
python agent.py
```
{% endcode %}

{% endtab %}
{% tab title="TypeScript" %}

#### Install dependencies

{% code title="Terminal" %}
```bash
npm install @langchain/mcp-adapters @langchain/langgraph @langchain/core @langchain/openai
```
{% endcode %}

#### Create your agent

{% code title="agent.ts" lineNumbers="true" %}
```typescript
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";

const client = new MultiServerMCPClient({
  wdk: {
    transport: "stdio",
    command: "npx",
    args: ["-y", "@tetherto/wdk-mcp-toolkit", "serve"],
    env: {
      WDK_SEED: "your twelve word seed phrase here",
      WDK_MCP_ELICITATION: "false",
    },
  },
});

const tools = await client.getTools();
const agent = createReactAgent({
  llm: new ChatOpenAI({ model: "gpt-4o" }),
  tools,
});

const result = await agent.invoke({
  messages: [
    { role: "user", content: "What is the current price of Bitcoin?" },
  ],
});

console.log(result.messages[result.messages.length - 1].content);
await client.close();
```
{% endcode %}

#### Run it

{% code title="Terminal" %}
```bash
export OPENAI_API_KEY="sk-..."
npx tsx agent.ts
```
{% endcode %}

{% endtab %}
{% endtabs %}

{% hint style="warning" %}
**Security** -- Always use a dedicated development wallet with limited funds. Set `WDK_MCP_ELICITATION` to `"false"` for programmatic agents since elicitation dialogs require a human in the loop.
{% endhint %}

***

## Configuration

### Environment Variables

Control `serve` behavior through environment variables:

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `WDK_SEED` | No | -- | BIP-39 seed phrase. If omitted, only pricing tools are available |
| `WDK_CHAINS` | No | `ethereum,arbitrum,bitcoin` | Comma-separated list of chains to enable |
| `WDK_MCP_ELICITATION` | No | `true` | Set to `"false"` for programmatic agents that cannot handle confirmation dialogs |
| `WDK_RPC_<CHAIN>` | No | Built-in defaults | Override the RPC endpoint for a chain (e.g. `WDK_RPC_ETHEREUM=https://my-rpc.com`) |
| `WDK_CONFIG` | No | -- | Path to a `wdk.config.json` file for custom chains and protocols |
| `WDK_INDEXER_API_KEY` | No | -- | Enables indexer tools for balance and transfer history queries |
| `MOONPAY_API_KEY` | No | -- | Enables fiat on/off-ramp tools |
| `MOONPAY_SECRET_KEY` | No | -- | Required with `MOONPAY_API_KEY` |

### Custom Config File

For chains or protocols not in the built-in defaults, create a `wdk.config.json` and pass its path via `WDK_CONFIG`:

{% code title="Terminal" %}
```bash
WDK_CONFIG=./wdk.config.json WDK_SEED="..." npx @tetherto/wdk-mcp-toolkit serve
```
{% endcode %}

{% code title="wdk.config.json" %}
```json
{
  "chains": {
    "zksync": {
      "module": "@myorg/wdk-wallet-zksync",
      "config": { "provider": "https://mainnet.era.zksync.io" }
    },
    "ethereum": {
      "config": { "provider": "https://my-private-rpc.com" }
    }
  },
  "protocols": [
    {
      "module": "@myorg/wdk-protocol-swap-custom",
      "label": "custom-swap",
      "type": "swap",
      "chains": ["zksync"]
    }
  ],
  "enabledChains": ["ethereum", "zksync", "bitcoin"]
}
```
{% endcode %}

| Field | Description |
| --- | --- |
| `chains` | Add new chains or override config for built-in ones. New chains require a `module` field; overrides for existing chains can omit it |
| `protocols` | Add custom protocols. Each entry requires `module`, `label`, and `chains`. The `type` field (`swap`, `bridge`, `lending`, `fiat`) maps to the corresponding built-in tool set |
| `enabledChains` | Overrides `WDK_CHAINS` env var. If omitted, `WDK_CHAINS` is used |

***

## LLM Provider Support

Both the Python and TypeScript examples support OpenAI and Anthropic. Set the corresponding environment variable and install the matching package:

| Provider | Environment Variable | Python Package | TypeScript Package |
| --- | --- | --- | --- |
| OpenAI | `OPENAI_API_KEY` | `langchain-openai` | `@langchain/openai` |
| Anthropic | `ANTHROPIC_API_KEY` | `langchain-anthropic` | `@langchain/anthropic` |

{% hint style="info" %}
The examples auto-detect which provider to use based on which API key is set. If both are set, OpenAI takes priority.
{% endhint %}

{% hint style="success" %}
**Full examples** -- See the complete interactive agent examples with conversation loops on GitHub: [`examples/langchain/python/`](https://github.com/tetherto/wdk-mcp-toolkit/tree/main/examples/langchain/python) and [`examples/langchain/typescript/`](https://github.com/tetherto/wdk-mcp-toolkit/tree/main/examples/langchain/typescript).
{% endhint %}

***

## Need Help?

{% include "../../.gitbook/includes/support-cards.md" %}
