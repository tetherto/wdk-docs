---
title: Worklet Bundler Configuration
description: Configure wdk.config.js and generate Bare worklet bundles with @tetherto/wdk-worklet-bundler
icon: gear
---

# Worklet Bundler Configuration

This page shows how to install `@tetherto/wdk-worklet-bundler`, shape `wdk.config.js`, and generate a Bare worklet bundle for your WDK modules.

## Install the package

Install the bundler as a development dependency in the host project:

{% code title="Install @tetherto/wdk-worklet-bundler" lineNumbers="true" %}
```bash
npm install --save-dev @tetherto/wdk-worklet-bundler
```
{% endcode %}

## Create `wdk.config.js`

Use `init` to create a starter config, or write the file yourself:

{% code title="Initialize A Starter Config" lineNumbers="true" %}
```bash
npx wdk-worklet-bundler init
```
{% endcode %}

The published config surface accepts `networks`, optional `protocols`, optional `preloadModules`, optional `output`, and optional `options`:

{% code title="Example wdk.config.js" lineNumbers="true" %}
```javascript
module.exports = {
  networks: {
    ethereum: {
      package: '@tetherto/wdk-wallet-evm-erc-4337'
    },
    bitcoin: {
      package: '@tetherto/wdk-wallet-btc'
    }
  },

  protocols: {
    moonpay: {
      package: '@tetherto/wdk-protocol-fiat-moonpay'
    }
  },

  preloadModules: [
    'spark-frost-bare-addon'
  ],

  output: {
    bundle: './.wdk-bundle/wdk-worklet.bundle.js',
    types: './.wdk/index.d.ts'
  },

  options: {
    minify: false,
    sourceMaps: false,
    targets: ['ios-arm64', 'android-arm64']
  }
}
```
{% endcode %}

## Required fields

### `networks`

`networks` is required. Each key is a logical network name, and each value must provide a `package` string for the wallet module to bundle.

The loader also accepts local paths that resolve relative to the config file’s directory:

{% code title="Use A Local Wallet Package" lineNumbers="true" %}
```javascript
module.exports = {
  networks: {
    local_dev: {
      package: './local-packages/my-custom-wallet'
    }
  }
}
```
{% endcode %}

## Optional fields

### `protocols` (optional)

Use `protocols` when the worklet should preload WDK protocol packages alongside wallet modules.

### `preloadModules` (optional)

Use `preloadModules` for native addons or other modules that must be required before the generated worklet starts.

### `output` (optional)

If you omit `output.bundle`, the loader resolves the bundle path to `./.wdk-bundle/wdk-worklet.bundle.js`. If you omit `output.types`, the loader resolves the type path to `./.wdk/index.d.ts`.

### `options` (optional)

The published config type supports these build options:

- `minify` (`boolean`): Minify the generated bundle.
- `sourceMaps` (`boolean`): Request source map output.
- `targets` (`string[]`): Override the default Bare build hosts. The shipped defaults cover iOS arm64 and simulator targets plus Android arm, arm64, ia32, and x64 hosts.

## Validate and generate the bundle

Use `validate` to check the config and dependency resolution before you generate the bundle:

{% code title="Validate wdk.config.js" lineNumbers="true" %}
```bash
npx wdk-worklet-bundler validate
```
{% endcode %}

Use `generate` to build the worklet artifact:

{% code title="Generate The Worklet Bundle" lineNumbers="true" %}
```bash
npx wdk-worklet-bundler generate --install
```
{% endcode %}

`generate --install` can auto-install missing configured modules after the package manager is detected from the project root. Use `--source-only` when you want the generated `.wdk/wdk-worklet.generated.js` entrypoint and related artifacts without running `bare-pack`.

## Suspend and resume behavior

Generated `beta.3` worklet entrypoints register Bare lifecycle handlers for `suspend` and `resume`, then apply those handlers to both the `bare-http1` and `bare-https` global agents. No config flag is required for this behavior.

This matters when a generated worklet performs HTTPS-backed fetches. In `beta.2`, only the `bare-http1` agent was suspended and resumed. In `beta.3`, generated worklets suspend and resume both agents together.

## Troubleshooting

- If `loadConfig()` cannot find a config file, run `npx wdk-worklet-bundler init` or pass `--config <path>`.
- If `validate` or `generate` reports missing modules, use `generate --install` or inspect the install command from the exported helper APIs in the [API Reference](./api-reference.md).
- If you need to inspect generated source before bundling, use `generate --source-only` and review the files in `.wdk/`.

***

## Need Help?

{% include "../../.gitbook/includes/support-cards.md" %}
