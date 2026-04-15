---
title: Worklet Bundler API Reference
description: API for @tetherto/wdk-worklet-bundler
icon: code
---

# API Reference

## Package: `@tetherto/wdk-worklet-bundler`

### Configuration Types

#### `WdkBundleConfig`

`WdkBundleConfig` is the public configuration shape for `wdk.config.js`.

{% code title="WdkBundleConfig Shape" lineNumbers="true" %}
```typescript
interface WdkBundleConfig {
  networks: Record<string, { package: string }>
  protocols?: Record<string, { package: string; [key: string]: any }>
  preloadModules?: string[]
  output?: {
    bundle?: string
    types?: string
  }
  options?: {
    minify?: boolean
    sourceMaps?: boolean
    targets?: string[]
  }
}
```
{% endcode %}

#### `ResolvedConfig`

`ResolvedConfig` extends `WdkBundleConfig` with absolute filesystem paths produced by `loadConfig()`.

{% code title="ResolvedConfig Additions" lineNumbers="true" %}
```typescript
interface ResolvedConfig extends WdkBundleConfig {
  configPath: string
  projectRoot: string
  resolvedOutput: {
    bundle: string
    types: string
  }
}
```
{% endcode %}

### Dependency Helpers

| Function | Description | Returns |
| --- | --- | --- |
| `validateDependencies(modules, projectRoot)` | Resolve configured packages and report which modules are installed or missing. | `ValidationResult` |
| `detectPackageManager(projectRoot)` | Detect whether the project uses `npm`, `yarn`, or `pnpm`. | `'npm'`, `'yarn'`, or `'pnpm'` |
| `generateInstallCommand(missing, packageManager?)` | Build the command string used to install missing dependencies. | `string` |
| `installDependencies(missing, projectRoot, options?)` | Install missing dependencies with the detected or selected package manager. | `InstallResult` |
| `generateUninstallCommand(packages, packageManager?)` | Build the command string used to remove packages. | `string` |
| `uninstallDependencies(packages, projectRoot, options?)` | Remove packages with the detected or selected package manager. | `UninstallResult` |

#### `validateDependencies(modules, projectRoot)`

Use this helper to confirm that the packages listed in `wdk.config.js` are already resolvable from the host project.

{% code title="Validate Missing Dependencies" lineNumbers="true" %}
```typescript
import { validateDependencies } from '@tetherto/wdk-worklet-bundler'

const result = validateDependencies(
  ['@tetherto/wdk-wallet-btc', '@tetherto/pear-wrk-wdk'],
  process.cwd()
)
```
{% endcode %}

`ValidationResult` contains:

- `valid` (`boolean`)
- `installed` (`ModuleInfo[]`)
- `missing` (`string[]`)

#### `detectPackageManager(projectRoot)`

Use this helper when you need the same package-manager detection logic that the CLI uses before install or uninstall flows.

{% code title="Detect The Package Manager" lineNumbers="true" %}
```typescript
import { detectPackageManager } from '@tetherto/wdk-worklet-bundler'

const packageManager = detectPackageManager(process.cwd())
```
{% endcode %}

#### `generateInstallCommand(missing, packageManager?)`

Build the install command string without mutating the project:

{% code title="Generate An Install Command" lineNumbers="true" %}
```typescript
import { generateInstallCommand } from '@tetherto/wdk-worklet-bundler'

const command = generateInstallCommand(
  ['@tetherto/wdk-wallet-btc', '@tetherto/pear-wrk-wdk'],
  'npm'
)
```
{% endcode %}

#### `installDependencies(missing, projectRoot, options?)`

Run the install flow from code when you want the same dependency installation behavior as `generate --install`.

#### `generateUninstallCommand(packages, packageManager?)`

Build the uninstall command string without mutating the project.

#### `uninstallDependencies(packages, projectRoot, options?)`

Run the uninstall flow from code and receive a structured `UninstallResult`.

### Bundle Generation

| Function | Description | Returns |
| --- | --- | --- |
| `loadConfig(configPath?)` | Load, validate, and resolve a `wdk.config.js` file into absolute paths. | `Promise<ResolvedConfig>` |
| `generateBundle(config, options?)` | Generate the entrypoint, imports, bundle, and optional type output. | `Promise<GenerateBundleResult>` |
| `generateSourceFiles(config, options?)` | Generate the source entrypoint and related artifacts without bundling. | `Promise<{ entryPath: string }>` |
| `generateEntryPoint(config, outputDir)` | Generate only the Bare worklet entrypoint file. | `Promise<string>` |
| `generateWalletModulesCode(config)` | Generate the wallet-module section inserted into the entrypoint. | `string` |

#### `loadConfig(configPath?)`

`loadConfig()` searches for `wdk.config.js` when no explicit path is supplied, validates the public config shape, and resolves the output paths relative to the config file directory.

{% code title="Load The Resolved Config" lineNumbers="true" %}
```typescript
import { loadConfig } from '@tetherto/wdk-worklet-bundler'

const config = await loadConfig()
```
{% endcode %}

#### `generateBundle(config, options?)`

Use `generateBundle()` when you want the same bundle workflow that powers the CLI `generate` command.

`GenerateBundleOptions` supports:

- `dryRun`
- `verbose`
- `silent`
- `skipTypes`
- `skipGeneration`

`GenerateBundleResult` contains:

- `success`
- `bundlePath`
- `typesPath`
- `bundleSize`
- `duration`
- `error?`
- `missingModule?`

{% code title="Generate A Bundle Programmatically" lineNumbers="true" %}
```typescript
import { generateBundle, loadConfig } from '@tetherto/wdk-worklet-bundler'

const config = await loadConfig('./wdk.config.js')
const result = await generateBundle(config, { verbose: true })
```
{% endcode %}

#### `generateSourceFiles(config, options?)`

Use `generateSourceFiles()` when you want the generated entrypoint without the final `bare-pack` step.

#### `generateEntryPoint(config, outputDir)`

Use `generateEntryPoint()` when you need the exact generated Bare entrypoint string written to a chosen output directory.

In `beta.3`, the generated entrypoint suspends and resumes both the `bare-http1` and `bare-https` global agents when the Bare runtime emits `suspend` and `resume`.

#### `generateWalletModulesCode(config)`

Use `generateWalletModulesCode()` when you only need the generated wallet-module section for inspection or custom generator flows.

### CLI Commands

The published CLI exposes these commands through `wdk-worklet-bundler`:

| Command | Description | Key Options |
| --- | --- | --- |
| `generate` | Generate a WDK bundle from configuration. | `--config`, `--install`, `--keep-artifacts`, `--dry-run`, `--no-types`, `--source-only`, `--skip-generation`, `--verbose` |
| `init` | Create a new `wdk.config.js` file. | `--yes` |
| `validate` | Validate configuration without building. | `--config` |
| `list-modules` | List available WDK modules. | `--json` |
| `clean` | Remove the generated `.wdk` folder. | `--yes` |

For the end-to-end config workflow, see [Worklet Bundler Configuration](./configuration.md).

***

## Need Help?

{% include "../../.gitbook/includes/support-cards.md" %}
