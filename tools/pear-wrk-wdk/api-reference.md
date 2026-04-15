---
title: Pear Worklet WDK API Reference
description: API reference for the HRPC client, registerRpcHandlers helper, and request types in @tetherto/pear-wrk-wdk
icon: code
---

# Pear Worklet WDK API Reference

## Package: `@tetherto/pear-wrk-wdk`

### Export: `HRPC`

#### Command Methods

| Method | Signature | Description |
| --- | --- | --- |
| `log()` | `log(args: LogRequest): void` | Sends a log payload over the HRPC stream. |
| `workletStart()` | `workletStart(args: WorkletStartRequest): Promise<WorkletStartResponse>` | Deprecated worklet startup request. Prefer `initializeWDK()`. |
| `initializeWDK()` | `initializeWDK(args: WdkInitializeParams): Promise<{ status: string }>` | Creates or reinitializes the worklet WDK instance and registers wallets and optional protocols from `config`. |
| `resetWdkWallets()` | `resetWdkWallets(args: WdkResetWalletParams): Promise<{ status: string }>` | Selectively disposes and re-registers only the wallets listed in `config.networks`. |
| `generateEntropyAndEncrypt()` | `generateEntropyAndEncrypt(args: WdkGenerateEntropyParams): Promise<WdkEntropyResult>` | Generates encrypted seed and entropy buffers inside the worklet. |
| `getMnemonicFromEntropy()` | `getMnemonicFromEntropy(args: WdkGetMnemonicParams): Promise<{ mnemonic: string }>` | Decrypts an encrypted entropy payload and returns the mnemonic. |
| `getSeedAndEntropyFromMnemonic()` | `getSeedAndEntropyFromMnemonic(args: { mnemonic: string }): Promise<WdkEntropyResult>` | Converts a mnemonic into encrypted seed and entropy buffers. |
| `dispose()` | `dispose(args: DisposeRequest): void` | Disposes the worklet WDK instance. |
| `callMethod()` | `callMethod(args: CallMethodRequest): Promise<CallMethodResponse>` | Looks up the target account and invokes one wallet or protocol method by name. |
| `registerWallet()` | `registerWallet(args: { config: string }): Promise<{ status: string, blockchains: string }>` | Dynamically registers additional wallets from a JSON config string. |
| `registerProtocol()` | `registerProtocol(args: { config: string }): Promise<{ status: string }>` | Dynamically registers additional protocols from a JSON config string. |

#### Handler Registration Methods

| Method | Signature | Description |
| --- | --- | --- |
| `onLog()` | `onLog(responseFn): void` | Registers the server-side handler for `log()`. |
| `onWorkletStart()` | `onWorkletStart(responseFn): void` | Registers the server-side handler for `workletStart()`. |
| `onInitializeWDK()` | `onInitializeWDK(responseFn): void` | Registers the server-side handler for `initializeWDK()`. |
| `onResetWdkWallets()` | `onResetWdkWallets(responseFn): void` | Registers the server-side handler for `resetWdkWallets()`. |
| `onGenerateEntropyAndEncrypt()` | `onGenerateEntropyAndEncrypt(responseFn): void` | Registers the server-side handler for encrypted entropy generation. |
| `onGetMnemonicFromEntropy()` | `onGetMnemonicFromEntropy(responseFn): void` | Registers the server-side handler for mnemonic recovery. |
| `onGetSeedAndEntropyFromMnemonic()` | `onGetSeedAndEntropyFromMnemonic(responseFn): void` | Registers the server-side handler for mnemonic migration. |
| `onDispose()` | `onDispose(responseFn): void` | Registers the server-side handler for `dispose()`. |
| `onCallMethod()` | `onCallMethod(responseFn): void` | Registers the server-side handler for `callMethod()`. |
| `onRegisterWallet()` | `onRegisterWallet(responseFn): void` | Registers the server-side handler for `registerWallet()`. |
| `onRegisterProtocol()` | `onRegisterProtocol(responseFn): void` | Registers the server-side handler for `registerProtocol()`. |

#### `log`

- `type?` (`LogType`): Optional numeric log level.
- `data?` (`string | null`): Optional log payload.

#### `workletStart`

Deprecated startup request retained in the shipped type surface.

- `enableDebugLogs?` (`number`)
- `seedPhrase?` (`string | null`)
- `seedBuffer?` (`string | null`)
- `config` (`string`): JSON string of network configurations.

Returns:

- `status?` (`string | null`)

#### `initializeWDK`

- `encryptionKey?` (`string`): Base64-encoded decryption key for the encrypted seed buffer.
- `encryptedSeed?` (`string`): Base64-encoded encrypted seed buffer.
- `config` (`string`): JSON stringified `WdkWorkletConfig`.

The handler requires `encryptionKey` and `encryptedSeed` to be passed together or omitted together. When a seeded WDK instance already exists, the runtime disposes it before re-registering the wallets and optional protocols in `config`.

#### `resetWdkWallets`

- `config` (`string`): JSON stringified object containing a `networks` map.

The runtime validates `config.networks`, extracts each target `blockchain`, calls `wdk.dispose(targetChains)`, and re-registers only those wallet managers. This method does not re-register protocols.

#### `generateEntropyAndEncrypt`

- `wordCount` (`12 | 24`): The mnemonic word count to generate.

Returns:

- `encryptionKey` (`string`)
- `encryptedSeedBuffer` (`string`)
- `encryptedEntropyBuffer` (`string`)

#### `getMnemonicFromEntropy`

- `encryptedEntropy` (`string`): Base64-encoded encrypted entropy buffer.
- `encryptionKey` (`string`): Base64-encoded decryption key.

Returns:

- `mnemonic` (`string`)

#### `getSeedAndEntropyFromMnemonic`

- `mnemonic` (`string`): Source mnemonic to migrate into encrypted buffers.

Returns:

- `encryptionKey` (`string`)
- `encryptedSeedBuffer` (`string`)
- `encryptedEntropyBuffer` (`string`)

#### `dispose`

- `args` (`DisposeRequest`): Empty request object.

#### `callMethod`

- `methodName` (`string`): Account method to invoke.
- `network` (`string`): Target blockchain key used to resolve the account.
- `accountIndex` (`number`): Account index passed to `wdk.getAccount(network, accountIndex)`.
- `args?` (`string`): JSON string of the method arguments.
- `options?` (`string`): JSON string of `CallMethodOptions`.

`options.protocolType` may be `swap`, `bridge`, `lending`, or `fiat`. When present, the runtime resolves the protocol-specific account wrapper before invoking `methodName`.

#### `registerWallet`

- `config` (`string`): JSON string of network config entries.

Returns:

- `status` (`string`)
- `blockchains` (`string`): JSON stringified array of registered blockchain names.

#### `registerProtocol`

- `config` (`string`): JSON string of protocol config entries.

Returns:

- `status` (`string`)

#### `onLog`

Registers the server-side handler used to service `log()` requests.

#### `onWorkletStart`

Registers the server-side handler used to service the deprecated `workletStart()` request.

#### `onInitializeWDK`

Registers the server-side handler used to service `initializeWDK()` requests on the worklet side.

#### `onResetWdkWallets`

Registers the server-side handler used to service `resetWdkWallets()` requests on the worklet side.

#### `onGenerateEntropyAndEncrypt`

Registers the server-side handler used to service encrypted entropy generation requests.

#### `onGetMnemonicFromEntropy`

Registers the server-side handler used to service mnemonic recovery requests.

#### `onGetSeedAndEntropyFromMnemonic`

Registers the server-side handler used to service mnemonic migration requests.

#### `onDispose`

Registers the server-side handler used to service `dispose()` requests.

#### `onCallMethod`

Registers the server-side handler used to service `callMethod()` requests.

#### `onRegisterWallet`

Registers the server-side handler used to service `registerWallet()` requests.

#### `onRegisterProtocol`

Registers the server-side handler used to service `registerProtocol()` requests.

### Export: `registerRpcHandlers(rpc, context)`

Registers the package's server-side handlers on the provided RPC instance.

- `rpc` (`any`): RPC server instance that supports the generated handler registration methods.
- `context` (`RpcContext`): Runtime context containing `wdk`, `WDK`, `walletManagers`, `protocolManagers`, and `wdkLoadError`.

### Types

#### `WdkWorkletConfig`

```ts
interface WdkWorkletConfig {
  networks: {
    [blockchain: string]: {
      blockchain: string
      config: unknown
    }
  }
  protocols?: {
    [protocolName: string]: {
      blockchain: string
      protocolName: string
      config: unknown
    }
  }
}
```

#### `WdkResetWalletParams`

```ts
interface WdkResetWalletParams {
  config: string
}
```

#### `CallMethodOptions`

```ts
interface CallMethodOptions {
  transformResult: Function
  defaultValue: any
  protocolType: 'swap' | 'bridge' | 'lending' | 'fiat'
  protocolName: string
}
```

***

## Need Help?

{% include "../.gitbook/includes/support-cards.md" %}
