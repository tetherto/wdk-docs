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

WDK documentation is optimized for AI coding assistants. Connect your AI tool directly to WDK docs for context-aware code generation, architecture guidance, and debugging help. This works with any tool that supports the [Model Context Protocol (MCP)](https://modelcontextprotocol.io/).

---

## Connect WDK Docs via MCP Server

The WDK documentation is available as an MCP server, giving your AI tool searchable access to all modules, API references, quickstarts, and guides.

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
The MCP server provides access to published documentation only. If your tool is not listed above, add the MCP server URL (`https://docs.wallet.tether.io/~gitbook/mcp`) to your tool's MCP configuration — most MCP-compatible tools follow a similar JSON format.
{% endhint %}

---

## Add WDK Project Rules

Project rules give your AI assistant persistent context about WDK conventions, package naming, and common patterns every time it works on your project. Copy the rules content below and save it at the file path for your tool.

### Rules Content

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

## Platform Rules
- For Node.js or Bare runtime: Use `@tetherto/wdk` as the orchestrator, then register individual wallet modules
- For React Native: Use `@tetherto/wdk-react-native-provider` with `WalletProvider` and `useWallet()` hook
- `@tetherto/wdk` (wdk-core) requires a Node.js or Bare runtime — it does NOT work in browser/Vite/webpack web contexts
- For web/browser apps, use individual wallet modules directly (e.g., `@tetherto/wdk-wallet-evm`)

## Architecture
- WDK is modular — each blockchain and protocol is a separate npm package
- Wallet modules expose `WalletManager`, `WalletAccount`, and `WalletAccountReadOnly` classes
- `WalletAccount` extends `WalletAccountReadOnly` — it has all read-only methods plus write methods (sign, send)
- All modules follow a consistent pattern: configuration → initialization → usage

## Documentation
- Official docs: https://docs.wallet.tether.io
- For any WDK question, consult the official documentation before making assumptions
- API references, configuration guides, and usage examples are available for every module
````

### Where to Save

| AI Coding Assistant | File Path | Notes |
|---|---|---|
| Cursor | `.cursor/rules/wdk.mdc` | Project-level, auto-attached |
| Claude Code | `CLAUDE.md` | Place in project root |
| Windsurf | `.windsurf/rules/wdk.md` | Project-level rules |
| GitHub Copilot | `.github/copilot-instructions.md` | Project-level instructions |
| Cline | `.clinerules` | Place in project root |
| Continue | `.continuerules` | Place in project root |

{% hint style="info" %}
Copy the rules content above and save it at the file path for your tool. Your AI assistant will automatically read these rules when working in your project.
{% endhint %}

---

## Feed WDK Docs as Context

For tools that don't support MCP, you can feed WDK documentation directly into your AI's context window using these auto-generated endpoints:

| Endpoint | URL | Purpose |
|---|---|---|
| `llms.txt` | `https://docs.wallet.tether.io/llms.txt` | Index of all page URLs and titles |
| `llms-full.txt` | `https://docs.wallet.tether.io/llms-full.txt` | Full documentation content in one file |

You can also append `.md` to any documentation page URL to get the page in markdown format, suitable for pasting into a chat context window.

---

## Tips for Effective AI-Assisted WDK Development

- **Be specific about the chain.** Tell the AI which blockchain you're targeting (e.g., "I'm building on Ethereum using `@tetherto/wdk-wallet-evm`") so it picks the right module.
- **Reference the exact package name.** Mention the full `@tetherto/wdk-*` package name in your prompt for more accurate code generation.
- **Ask the AI to check docs first.** Prompt with "Check the WDK documentation before answering" to ensure it uses the MCP-connected docs rather than outdated training data.
- **Start with a quickstart.** Point the AI at the [Node.js Quickstart](../start-building/nodejs-bare-quickstart.md) or [React Native Quickstart](../start-building/react-native-quickstart.md) as a working reference before building custom features.
- **Iterate in steps.** Use the AI to scaffold your WDK integration first, then refine module configuration and error handling in follow-up prompts.

