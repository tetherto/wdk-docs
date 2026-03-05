---
title: Create WDK Module
description: CLI scaffolding tool to generate new WDK wallet and protocol modules with a single command.
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

# Create WDK Module

Scaffold new WDK modules with a single command. The CLI generates a fully configured project with source files, tests, TypeScript type definitions, and CI workflows — ready for you to add your blockchain or protocol integration logic.

Powered by [`create-wdk-module`](https://github.com/tetherto/create-wdk-module).

---

## Quick Start

{% stepper %}
{% step %}
### Run the scaffolding command

{% code title="Scaffold a new module" %}
```bash
npx create-wdk-module@latest
```
{% endcode %}

You can also pass arguments directly to skip the interactive prompts:

{% code title="Scaffold with arguments" %}
```bash
npx create-wdk-module@latest wallet stellar
```
{% endcode %}
{% endstep %}

{% step %}
### Install and run tests

{% code title="Set up the generated project" %}
```bash
cd wdk-wallet-stellar
npm install
npm test
```
{% endcode %}
{% endstep %}
{% endstepper %}

---

## Module Types

The CLI supports all five WDK module categories. The generated package name follows WDK naming conventions automatically.

| Type | Description | Generated Package Example |
|------|-------------|---------------------------|
| `wallet` | Blockchain wallet integration | `wdk-wallet-stellar` |
| `swap` | DEX/token swap protocol | `wdk-protocol-swap-jupiter-solana` |
| `bridge` | Cross-chain bridge protocol | `wdk-protocol-bridge-wormhole-evm` |
| `lending` | DeFi lending protocol | `wdk-protocol-lending-compound-evm` |
| `fiat` | Fiat on/off-ramp provider | `wdk-protocol-fiat-moonpay` |

---

## CLI Options

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `[type]` | | Module type (wallet, swap, bridge, lending, fiat) | (interactive prompt) |
| `[name]` | | Module or protocol name | (interactive prompt) |
| `[blockchain]` | | Target blockchain | (interactive prompt) |
| `--scope <scope>` | `-s` | npm scope (e.g., `@myorg`) | none |
| `--git` | | Initialize a git repository | `true` |
| `--no-git` | | Skip git initialization | |
| `--yes` | `-y` | Skip prompts, use defaults | `false` |
| `--version` | `-v` | Show version | |
| `--help` | `-h` | Show help | |

### Examples

{% code title="Common CLI usage patterns" %}
```bash
# Create a wallet module with an npm scope
npx create-wdk-module@latest wallet stellar --scope @myorg

# Create a swap protocol module
npx create-wdk-module@latest swap jupiter solana

# Create with all defaults, no prompts
npx create-wdk-module@latest wallet stellar --yes
```
{% endcode %}

---

## Interactive Mode

When run without arguments, the CLI guides you through module setup step by step:

{% code title="Interactive session" %}
```bash
$ npx create-wdk-module@latest

  Create WDK Module

? What type of module do you want to create?
  > Wallet Module (blockchain wallet integration)
    Swap Module (DEX/token swap integration)
    Bridge Module (cross-chain bridging)
    Lending Module (DeFi lending protocol)
    Fiat Module (fiat on/off-ramp)

? What is the blockchain name? (e.g., "stellar", "solana")
  > stellar

? npm scope (leave empty for none, e.g., @myorg):
  >

? Initialize git repository?
  > Yes

Creating wdk-wallet-stellar...

✓ Template files copied
✓ Initialized git repository

Success! Created wdk-wallet-stellar at ./wdk-wallet-stellar

Next steps:
  cd wdk-wallet-stellar
  npm install
  npm test
```
{% endcode %}

---

## Generated Project Structure

The scaffolded project includes source files, tests, TypeScript definitions, and GitHub CI workflows out of the box.

<details>
<summary>Wallet Module structure</summary>

{% code title="Wallet module project tree" %}
```
wdk-wallet-stellar/
├── .github/
│   ├── workflows/
│   │   ├── build.yml
│   │   └── publish.yml
│   ├── ISSUE_TEMPLATE/
│   │   └── general.md
│   └── PULL_REQUEST_TEMPLATE.md
├── src/
│   ├── wallet-manager-stellar.js
│   ├── wallet-account-stellar.js
│   └── wallet-account-read-only-stellar.js
├── tests/
│   ├── wallet-manager-stellar.test.js
│   ├── wallet-account-stellar.test.js
│   └── wallet-account-read-only-stellar.test.js
├── types/
│   ├── index.d.ts
│   └── src/
│       ├── wallet-manager-stellar.d.ts
│       ├── wallet-account-stellar.d.ts
│       └── wallet-account-read-only-stellar.d.ts
├── .editorconfig
├── .gitignore
├── .npmignore
├── bare.js
├── index.js
├── LICENSE
├── package.json
├── README.md
└── tsconfig.json
```
{% endcode %}

Wallet modules generate three core files that correspond to the WDK wallet architecture:

| File | Purpose |
|------|---------|
| `wallet-manager-*.js` | Module entry point, handles wallet registration and account derivation |
| `wallet-account-*.js` | Full account with signing capabilities (transactions, messages) |
| `wallet-account-read-only-*.js` | Read-only account for balance checks and transaction history |

</details>

<details>
<summary>Protocol Module structure (swap, bridge, lending, fiat)</summary>

{% code title="Protocol module project tree" %}
```
wdk-protocol-swap-jupiter-solana/
├── .github/
│   ├── workflows/
│   │   ├── build.yml
│   │   └── publish.yml
│   ├── ISSUE_TEMPLATE/
│   │   └── general.md
│   └── PULL_REQUEST_TEMPLATE.md
├── src/
│   └── jupiter-protocol-solana.js
├── tests/
│   └── jupiter-protocol-solana.test.js
├── types/
│   ├── index.d.ts
│   └── src/
│       └── jupiter-protocol-solana.d.ts
├── .editorconfig
├── .gitignore
├── .npmignore
├── bare.js
├── index.js
├── LICENSE
├── package.json
├── README.md
└── tsconfig.json
```
{% endcode %}

Protocol modules generate a single provider file rather than the three-file wallet pattern, since protocols interact with external services through a unified interface.

</details>

---

## Next Steps

<table data-card-size="large" data-view="cards">
	<thead>
		<tr>
			<th></th>
			<th></th>
			<th></th>
			<th data-hidden data-card-target data-type="content-ref"></th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>Wallet Modules</strong>
			</td>
			<td>See how official wallet modules are structured and documented</td>
			<td>
				<a href="../sdk/wallet-modules/">wallet-modules</a>
			</td>
		</tr>
		<tr>
			<td>
				<i class="fa-puzzle-piece">:puzzle-piece:</i>
			</td>
			<td>
				<strong>Community Modules</strong>
			</td>
			<td>Explore community-built modules and submit your own</td>
			<td>
				<a href="../sdk/community-modules/">community-modules</a>
			</td>
		</tr>
	</tbody>
</table>

{% hint style="info" %}
**Reference implementation**: The [`wdk-wallet-solana`](https://github.com/tetherto/wdk-wallet-solana) module is a good reference for understanding how a production wallet module implements the WDK interfaces. The [`wdk-wallet`](https://github.com/tetherto/wdk-wallet) package defines the base classes your module must extend.
{% endhint %}

***

## Need Help?

{% include "../.gitbook/includes/support-cards.md" %}
