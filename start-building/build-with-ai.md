---
title: Build with AI
description: Connect your AI coding assistant to WDK documentation for context-aware code generation, architecture guidance, and debugging help.
icon: robot
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
    visible: false
  metadata:
    visible: false
---

# Build with AI

WDK documentation is optimized for AI coding assistants. Give your AI tool context about WDK to get accurate code generation, architecture guidance, and debugging help.

There are two ways to provide WDK context to your AI:

1. **[Connect via MCP Server](#connect-wdk-docs-via-mcp-server)** - Best experience. Your AI tool can search and query WDK docs in real time.
2. **[Connect via Markdown](#connect-wdk-docs-via-markdown)** - Works with any AI tool. Feed documentation directly into the context window.

{% hint style="info" %}
**Want to give AI agents wallet access?** The [MCP Toolkit](../ai/mcp-toolkit/README.md) creates an MCP server that exposes WDK wallets as tools - letting AI agents check balances, send transactions, swap tokens, and more.
{% endhint %}

{% hint style="info" %}
**Want agents to pay for resources?** The [x402 guide](../ai/x402.md) shows how to use WDK wallets with the x402 protocol for instant, programmatic USD₮ payments over HTTP.
{% endhint %}

---

## Connect WDK Docs via MCP Server

The WDK documentation is available as an MCP server, giving your AI tool searchable access to all modules, API references, quickstarts, and guides. This works with any tool that supports the [Model Context Protocol (MCP)](https://modelcontextprotocol.io/).

**MCP Server URL:**

```
https://docs.wallet.tether.io/~gitbook/mcp
```

Add this server to your AI tool's MCP configuration:

{% tabs %}
{% tab title="Cursor" %}

**Config path:** `~/.cursor/mcp.json` (global) or `.cursor/mcp.json` (project-level)

```json
{
  "mcpServers": {
    "wdk-docs": {
      "url": "https://docs.wallet.tether.io/~gitbook/mcp"
    }
  }
}
```

→ [Cursor MCP documentation](https://cursor.com/docs/context/mcp)

{% endtab %}
{% tab title="Claude Code" %}

Run this command in your terminal:

```bash
claude mcp add wdk-docs --transport sse https://docs.wallet.tether.io/~gitbook/mcp
```

→ [Claude Code MCP documentation](https://docs.anthropic.com/en/docs/claude-code/tutorials#set-up-model-context-protocol-mcp)

{% endtab %}
{% tab title="Windsurf" %}

**Config path:** `~/.codeium/windsurf/mcp_config.json`

```json
{
  "mcpServers": {
    "wdk-docs": {
      "url": "https://docs.wallet.tether.io/~gitbook/mcp"
    }
  }
}
```

→ [Windsurf MCP documentation](https://docs.windsurf.com/windsurf/cascade/mcp)

{% endtab %}
{% tab title="GitHub Copilot" %}

**Config path:** `.vscode/mcp.json` (project-level)

```json
{
  "servers": {
    "wdk-docs": {
      "url": "https://docs.wallet.tether.io/~gitbook/mcp"
    }
  }
}
```

→ [VS Code MCP documentation](https://code.visualstudio.com/docs/copilot/chat/mcp-servers)

{% endtab %}
{% tab title="Cline" %}

Add via Cline's MCP settings panel in VS Code, or edit the config file directly.

**Server URL:** `https://docs.wallet.tether.io/~gitbook/mcp`

→ [Cline MCP documentation](https://github.com/cline/cline#add-context)

{% endtab %}
{% tab title="Continue" %}

**Config path:** `~/.continue/config.yaml`

Add to the `mcpServers` section:

**Server URL:** `https://docs.wallet.tether.io/~gitbook/mcp`

→ [Continue MCP documentation](https://docs.continue.dev/customize/mcp-tools)

{% endtab %}
{% endtabs %}

{% hint style="info" %}
The MCP server provides access to published documentation only. If your tool is not listed above, add the MCP server URL (`https://docs.wallet.tether.io/~gitbook/mcp`) to your tool's MCP configuration - most MCP-compatible tools follow a similar JSON format.
{% endhint %}

{% hint style="warning" %}
**No MCP support?** You can feed WDK documentation directly into any AI tool as Markdown. See [Connect WDK Docs via Markdown](#connect-wdk-docs-via-markdown) below.
{% endhint %}

### Add WDK Project Rules (Optional)

Project rules give your AI assistant persistent context about WDK conventions, package naming, and common patterns. This is optional but recommended for teams working extensively with WDK.

Copy the rules content below and save it at the file path for your tool.

#### Rules Content

````markdown
# WDK Development Rules

## Package Structure
- All WDK packages are published under the `@tetherto` scope on npm
- Core module: `@tetherto/wdk`
- Wallet modules follow the pattern: `@tetherto/wdk-wallet-<chain>`
  - Examples: `@tetherto/wdk-wallet-evm`, `@tetherto/wdk-wallet-btc`, `@tetherto/wdk-wallet-solana`, `@tetherto/wdk-wallet-ton`, `@tetherto/wdk-wallet-tron`, `@tetherto/wdk-wallet-spark`
- Specialized wallet modules: `@tetherto/wdk-wallet-evm-erc4337`, `@tetherto/wdk-wallet-ton-gasless`, `@tetherto/wdk-wallet-tron-gasfree`
- Protocol modules follow the pattern: `@tetherto/wdk-protocol-<type>-<name>-<chain>`
  - Examples: `@tetherto/wdk-protocol-swap-velora-evm`, `@tetherto/wdk-protocol-bridge-usdt0-evm`, `@tetherto/wdk-protocol-lending-aave-evm`

## Platform Notes
- For Node.js or Bare runtime: Use `@tetherto/wdk` as the orchestrator, then register individual wallet modules
- For React Native: You have two options:
  - Use the React Native provider package for convenience (provides hooks and managed lifecycle)
  - Or use WDK packages directly in the Hermes runtime - this works the same as Node.js integration

## Architecture
- WDK is modular - each blockchain and protocol is a separate npm package
- Wallet modules expose `WalletManager`, `WalletAccount`, and `WalletAccountReadOnly` classes
- `WalletAccount` extends `WalletAccountReadOnly` - it has all read-only methods plus write methods (sign, send)
- All modules follow a consistent pattern: configuration → initialization → usage

## Documentation
- Official docs: https://docs.wallet.tether.io
- For any WDK question, consult the official documentation before making assumptions
- API references, configuration guides, and usage examples are available for every module
````

#### Where to Save

| AI Coding Assistant | File Path | Notes |
|---|---|---|
| Cursor | `.cursor/rules/wdk.mdc` | Project-level, auto-attached |
| Claude Code | `CLAUDE.md` | Place in project root |
| Windsurf | `.windsurf/rules/wdk.md` | Project-level rules |
| GitHub Copilot | `.github/copilot-instructions.md` | Project-level instructions |
| Cline | `.clinerules` | Place in project root |
| Continue | `.continuerules` | Place in project root |

---

## Connect WDK Docs via Markdown

If your AI tool doesn't support MCP, you can feed WDK documentation directly into the context window using these endpoints:

| Endpoint | URL | Description |
|---|---|---|
| Page index | [docs.wallet.tether.io/llms.txt](https://docs.wallet.tether.io/llms.txt) | Index of all page URLs and titles |
| Full docs | [docs.wallet.tether.io/llms-full.txt](https://docs.wallet.tether.io/llms-full.txt) | Complete documentation in one file |

You can also append `.md` to any documentation page URL to get the raw Markdown, ready to paste into a chat context window.

---

## Agent Guidelines in WDK Repos

Each WDK package repository includes an `AGENTS.md` file in its root. This file provides AI agents with context about the project structure, coding conventions, testing patterns, and linting rules.

If your AI tool has access to the WDK source repositories (e.g., via a local clone), it will automatically ingest `AGENTS.md` for additional context beyond the documentation.

---

## Example Prompt

Here's an example prompt you can use to generate a multichain wallet with WDK. Try it with MCP connected or paste the relevant quickstart docs for best results:

```
Create a Node.js app using WDK (@tetherto/wdk) that:
1. Creates a multichain wallet supporting Bitcoin and Polygon
2. Use @tetherto/wdk-wallet-btc for Bitcoin and @tetherto/wdk-wallet-evm for Polygon
3. Generates wallet addresses for both chains
4. Retrieves the balance for each address
5. Use a mnemonic from environment variables

Check the WDK documentation for the correct configuration and initialization pattern.
```

---

## Tips for Effective AI-Assisted Development

- **Be specific about the chain.** Tell the AI which blockchain you're targeting (e.g., "I'm building on Ethereum using `@tetherto/wdk-wallet-evm`") so it picks the right module.
- **Reference the exact package name.** Mention the full `@tetherto/wdk-*` package name in your prompt for more accurate code generation.
- **Ask the AI to check docs first.** Prompt with "Check the WDK documentation before answering" to ensure it uses the MCP-connected docs rather than outdated training data.
- **Start with a quickstart.** Point the AI at the [Node.js Quickstart](nodejs-bare-quickstart.md) or [React Native Quickstart](react-native-quickstart.md) as a working reference before building custom features.
- **Iterate in steps.** Use the AI to scaffold your WDK integration first, then refine module configuration and error handling in follow-up prompts.
