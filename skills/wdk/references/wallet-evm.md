# wallet-evm, wallet-evm-erc-4337 & wallet-evm-7702-gasless — EVM Chains

## Links — wallet-evm

| Resource | URL |
|----------|-----|
| **npm** | https://www.npmjs.com/package/@tetherto/wdk-wallet-evm |
| **GitHub** | https://github.com/tetherto/wdk-wallet-evm |
| **Docs — Overview** | https://docs.wdk.tether.io/sdk/wallet-modules/wallet-evm |
| **Docs — Usage** | https://docs.wdk.tether.io/sdk/wallet-modules/wallet-evm/usage |
| **Docs — Configuration** | https://docs.wdk.tether.io/sdk/wallet-modules/wallet-evm/configuration |
| **Docs — API Reference** | https://docs.wdk.tether.io/sdk/wallet-modules/wallet-evm/api-reference |

## Links — wallet-evm-erc-4337

| Resource | URL |
|----------|-----|
| **npm** | https://www.npmjs.com/package/@tetherto/wdk-wallet-evm-erc-4337 |
| **GitHub** | https://github.com/tetherto/wdk-wallet-evm-erc-4337 |
| **Docs — Overview** | https://docs.wdk.tether.io/sdk/wallet-modules/wallet-evm-erc-4337 |
| **Docs — Usage** | https://docs.wdk.tether.io/sdk/wallet-modules/wallet-evm-erc-4337/usage |
| **Docs — Configuration** | https://docs.wdk.tether.io/sdk/wallet-modules/wallet-evm-erc-4337/configuration |
| **Docs — API Reference** | https://docs.wdk.tether.io/sdk/wallet-modules/wallet-evm-erc-4337/api-reference |

## Links — wallet-evm-7702-gasless

| Resource | URL |
|----------|-----|
| **npm** | https://www.npmjs.com/package/@tetherto/wdk-wallet-evm-7702-gasless |
| **GitHub** | https://github.com/tetherto/wdk-wallet-evm-7702-gasless |
| **Docs — Overview** | https://docs.wdk.tether.io/sdk/wallet-modules/wallet-evm-7702-gasless |
| **Docs — Usage** | https://docs.wdk.tether.io/sdk/wallet-modules/wallet-evm-7702-gasless/usage |
| **Docs — Configuration** | https://docs.wdk.tether.io/sdk/wallet-modules/wallet-evm-7702-gasless/configuration |
| **Docs — API Reference** | https://docs.wdk.tether.io/sdk/wallet-modules/wallet-evm-7702-gasless/api-reference |

## Packages

Example versions: standard EVM `1.0.0-beta.27`, ERC-4337 `1.0.0-beta.26`, and EIP-7702 gasless `1.0.0-beta.13`.

```bash
npm install @tetherto/wdk-wallet-evm@1.0.0-beta.27
npm install @tetherto/wdk-wallet-evm-erc-4337@1.0.0-beta.26  # for Account Abstraction
npm install @tetherto/wdk-wallet-evm-7702-gasless@1.0.0-beta.13  # for EIP-7702 gasless EOAs
```

```javascript
import WalletManagerEvm from '@tetherto/wdk-wallet-evm'
import WalletManagerEvmErc4337 from '@tetherto/wdk-wallet-evm-erc-4337'
import WalletManagerEvm7702Gasless from '@tetherto/wdk-wallet-evm-7702-gasless'
```

## Key Details — wallet-evm

- **Derivation**: BIP-44 (`m/44'/60'/0'/0/{index}`)
- **Fee model**: EIP-1559 (baseFee + priorityFee)
- **Fee rates**: `normal` = base×1.1, `fast` = base×2.0
- **Supports**: ERC20 via `transfer()`, arbitrary calldata via `sendTransaction({data})`
- ⚠️ **Ethereum USD₮** uses non-standard ERC20 (no bool return on `transfer()`). Use SafeERC20 in custom contracts.
- ⚠️ `sendTransaction` accepts a `data` field (arbitrary hex calldata) — can execute **any** contract function. Extra scrutiny for non-empty `data`.
- Transfer and approval options accept gas overrides directly. Object fee quotes use supplied gas limits and fee rates before provider estimates; serialized quotes use their encoded execution-gas fields. Simulation still runs.
- `account.config` exposes the stored options on standard EVM beta.27 full and read-only accounts. Manager-derived accounts expose the initialized provider. Treat the configuration as read-only and keep credentials out of logs.
- `transactionMaxFee` applies to sends, approvals and provider-backed signing. ERC-20 `transfer()` uses only `transferMaxFee`; configure it separately. Object sends check populated gas/fee fields before passing them to the signer. `signTransaction()` checks a quote without populating missing fields. Equality is allowed, transferred value is excluded, and the cap is not the eventual fee paid. Offline signing does not run the cap check.
- Supplied signed transactions are broadcast unchanged after checking their encoded execution-gas fields. Independently review recipient, value, calldata, chain ID, nonce and fee fields. Type 4 transactions reject legacy `gasPrice`; type-3/blob transactions and blob fields are unsupported.
- Runtime and declarations accept ethers `Provider` inputs. A manager shares one provider across its accounts. A nonzero `chainId` pins module-built URL and EIP-1193 providers without detecting the endpoint's chain or a browser network switch; prebuilt ethers providers retain their own network settings.
- See the [signer migration](https://docs.wdk.tether.io/sdk/wallet-modules/wallet-evm/configuration#signer-migration) for self-relative paths, seed/signer overloads, removed account `index`, and signer ownership. Cleanup depends on the concrete signer and ownership options; account disposal does not imply app-supplied signer disposal or complete secret erasure.
- ⚠️ The documented Velora, USD₮0 bridge, and Aave adapters require EIP-1193 `request()` on non-string provider inputs. A shared ethers provider without `request()` is incompatible. Use the corresponding direct account constructor with its original RPC URL or genuine EIP-1193 input; never mutate internal provider fields. Direct accounts bypass WDK middleware and the WDK Policies plugin, so retain required application checks and account-level controls.

## Configuration — wallet-evm

```javascript
const wallet = new WalletManagerEvm(seedPhrase, {
  provider: 'https://eth.drpc.org',      // JSON-RPC URL or EIP-1193 provider
  chainId: 1,                             // Pin this endpoint to Ethereum; does not verify its chain
  transferMaxFee: 5000000000000000n       // Optional max fee in wei
})
```

## Key Details — wallet-evm-erc-4337

- Ethers providers and mixed provider lists are accepted. The manager shares its RPC client with accounts and read-only conversions. A supplied ethers provider must support JSON-RPC `send(method, params)`; bundler and paymaster configuration remain separate.
- Transfer and approval gas overrides belong in their options. Follow https://docs.wdk.tether.io/sdk/wallet-modules/wallet-evm-erc-4337/api-reference for signatures. The module implements its own UserOperation methods.
- **Gasless** via UserOperations + Paymaster
- Fees paid in **paymaster token** (e.g., USD₮) instead of native ETH
- `getPaymasterTokenBalance()` for fee balance
- [`WalletAccountReadOnlyEvmErc4337.fromSafeAddress()`](https://docs.wdk.tether.io/sdk/wallet-modules/wallet-evm-erc-4337/guides/manage-accounts#read-a-known-safe-address) monitors a supplied Safe address without its owner or a seed. A deployed Safe can verify ERC-1271 signatures. An undeployed Safe with an unknown owner cannot verify. Non-sponsored quotes require a deployed Safe; a sponsored zero-fee quote does not establish deployment or eligibility.
- **Batch transactions**: `sendTransaction([tx1, tx2])` — multiple operations in one call
- `signTransaction(tx)` signs one `UserOperationV7`; the signed result can be quoted and submitted through `sendTransaction()`.
- The first UserOperation chain lookup checks the provider against constructor `chainId` and caches success. Sponsored quotes and already-signed quote/send paths skip this check; recreate the account when changing networks.
- Signed UserOperations preserve their nonce and fee-mode configuration. Submit promptly through the same account and do not mutate them.
- Signed UserOperation submission does not reapply `transactionMaxFee`. In paymaster-token mode, a signed-operation quote is a buffered native-gas ceiling in wei, not a token-denominated charge.
- The default-lane quote cache keys on the transaction, fee mode, `paymasterUrl`, `paymasterHeaders`, paymaster token address, expected paymaster address, and `sponsorshipPolicyId`. A change to any of these values requires a fresh build. The wallet checks the current default-lane nonce before reuse.
- `sign()` and `signTypedData()` produce SafeMessage signatures. Verification uses the Safe contract after deployment or recovers a known owner before deployment.
- Custom signer accounts use the `/signers` subpath. Register the signer with `addSigner()` and use `getAccount(signerName)` directly or derive with a named signer. App-supplied signers are caller-owned unless the direct account config opts into signer disposal.
- Same `data` risk as wallet-evm, plus batch execution risk

## Configuration — wallet-evm-erc-4337

```javascript
const wallet = new WalletManagerEvmErc4337(seedPhrase, {
  provider: 'https://arb1.arbitrum.io/rpc',
  chainId: 42161,
  safeModulesVersion: '0.3.0',
  bundlerUrl: 'https://api.candide.dev/public/v3/42161',
  paymasterUrl: 'https://api.candide.dev/public/v3/42161',
  paymasterAddress: '0x8b1f6cb5d062aa2ce8d581942bbb960420d875ba',
  paymasterToken: {
    address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9' // USDt0 on Arbitrum
  },
  transferMaxFee: 5000000       // in paymaster token units
})
```

## Key Details — wallet-evm-7702-gasless

- Ethers providers and mixed provider lists are accepted. The manager shares its RPC client with accounts and read-only conversions. Supplied ethers providers must support JSON-RPC `send(method, params)`. Bundler and paymaster endpoints remain separate.
- To wrap an existing EVM account, use the same installed EVM beta.26 package instance as the gasless module. The wrapped EVM account remains caller-owned.
- For custom signers, use the `/signers` subpath. The signer needs typed-data signing for UserOperations and authorization signing when the account needs a new delegation.
- Token-paymaster mode requires a provider-verified `paymasterAddress` in the merged configuration. Wallet-built operations reject a different returned paymaster address before the UserOperation signature. During sign/send, a delegation authorization may already have been signed. Already-signed submission does not repeat this check. See [paymaster configuration](https://docs.wdk.tether.io/sdk/wallet-modules/wallet-evm-7702-gasless/configuration#paymaster-token).
- Uses EIP-7702 delegation and ERC-4337 UserOperations while retaining the EOA address.
- Supports sponsored mode and paymaster-token mode.
- `entryPointVersion` accepts `'0.8'` (default) or `'0.9'`. Match the delegation implementation, bundler, and paymaster to that version.
- Optional `chainId` checks the provider's first UserOperation chain lookup and caches success. Owned-account quotes and sends check even sponsored or signed inputs; read-only sponsored quotes skip it. The check does not validate an externally signed payload's chain or EntryPoint.
- Owned-account paymaster-token quotes are cached for up to 2 minutes only when the account is already delegated to the configured contract. An undelegated quote uses an unsigned estimation tuple, does not sign an authorization and does not enter the cache.
- Before reusing a cached UserOperation, the account validates its EntryPoint nonce and re-quotes if the nonce moved.
- A send that needs a fresh EIP-7702 authorization rebuilds the UserOperation instead of reusing the cached one.
- Quote-cache keys include the transaction, sponsorship mode, paymaster token, expected paymaster address, and sponsorship policy. Changing a keyed field creates a fresh quote.
