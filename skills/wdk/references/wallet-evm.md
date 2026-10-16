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

```bash
npm install @tetherto/wdk-wallet-evm
npm install @tetherto/wdk-wallet-evm-erc-4337  # for Account Abstraction
npm install @tetherto/wdk-wallet-evm-7702-gasless  # for EIP-7702 gasless EOAs
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
- In wallet-evm beta.20, transfer and approval options accept gas overrides directly. Object fee quotes use supplied gas limits and fee rates before provider estimates; serialized quotes use their encoded execution-gas fields. Simulation still runs.
- `transactionMaxFee` applies to sends and provider-backed signing, including sends from transfers and approvals; transfers additionally check `transferMaxFee`. Equality is allowed. The quoted execution-gas fee excludes transferred value and blob gas, is not the eventual fee paid, and does not lock unspecified object fields. Offline signing does not run the cap check.
- Beta.20 broadcasts the exact supplied signed bytes after checking their encoded gas limit and fee rate. Independently review the recipient, value, data, chain ID, nonce, and every fee field. Type 4 transactions reject legacy `gasPrice`; blob fields are now declared but do not imply newly added runtime blob support.
- In wallet-evm beta.20, the runtime accepts and reuses an existing ethers `Provider`, and a manager shares one provider across its accounts. The published declaration still accepts only URLs and EIP-1193 providers, so this ethers-provider path is runtime-only for TypeScript consumers.
- ⚠️ Velora beta.8 and beta.9, USD₮0 bridge beta.10, and Aave beta.7 cannot initialize with accounts derived by standard EVM beta.19 or beta.20, ERC-4337 beta.21, or EIP-7702 beta.7 managers when their shared ethers provider lacks the EIP-1193 `request()` method. These protocols require an EIP-1193 `request()` method on non-string provider inputs. Use the corresponding direct account constructor with its original RPC URL or genuine EIP-1193 input; never mutate internal provider fields. Direct accounts do not receive WDK Core policies or middleware, so retain required application checks and account-level controls.

## Configuration — wallet-evm

```javascript
const wallet = new WalletManagerEvm(seedPhrase, {
  provider: 'https://eth.drpc.org',      // JSON-RPC URL or EIP-1193 provider
  chainId: 1,                             // Optional, auto-detected
  transferMaxFee: 5000000000000000n       // Optional max fee in wei
})
```

## Key Details — wallet-evm-erc-4337

- Beta.21 accepts ethers providers and mixed provider lists, and shares the manager RPC client with its accounts and read-only conversions. A supplied ethers provider must support JSON-RPC `send(method, params)`; bundler and paymaster configuration remain separate.
- Beta.21 moves transfer and approval gas overrides into their options. Follow https://docs.wdk.tether.io/sdk/wallet-modules/wallet-evm-erc-4337/api-reference for that version's signatures. Its EVM dependency remains beta.19; standard EVM beta.20 quote behavior does not apply to these UserOperation methods.
- **Gasless** via UserOperations + Paymaster
- Fees paid in **paymaster token** (e.g., USD₮) instead of native ETH
- `getPaymasterTokenBalance()` for fee balance
- [`WalletAccountReadOnlyEvmErc4337.fromSafeAddress()`](https://docs.wallet.tether.io/sdk/wallet-modules/wallet-evm-erc-4337/guides/manage-accounts#read-a-known-safe-address) monitors a supplied Safe address without its owner or a seed. It cannot sign, send, or verify owner signatures. Non-sponsored quotes require a deployed Safe; a sponsored zero-fee quote does not establish deployment or eligibility.
- **Batch transactions**: `sendTransaction([tx1, tx2])` — multiple operations in one call
- `signTransaction(tx)` signs one `UserOperationV7`; the signed result can be quoted and submitted through `sendTransaction()`.
- The first UserOperation chain lookup checks the provider against constructor `chainId` and caches success. Sponsored quotes and already-signed quote/send paths skip this check; recreate the account when changing networks.
- Signed UserOperations preserve their nonce and fee-mode configuration. Submit promptly through the same account and do not mutate them.
- Signed UserOperation submission does not reapply `transactionMaxFee`. In paymaster-token mode, a signed-operation quote is a buffered native-gas ceiling in wei, not a token-denominated charge.
- Quote-cache keys omit fee-mode configuration. Keep the same mode, paymaster token, paymaster URL, `paymasterHeaders`, address, and sponsorship policy for a quote and its matching send, sign, or transfer.
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

- Beta.7 accepts ethers providers and mixed provider lists, and shares the manager RPC client with its accounts and read-only conversions. Supplied ethers providers must support JSON-RPC `send(method, params)`. Bundler and paymaster endpoints remain separate.
- To wrap an existing EVM account in beta.7, use the same installed EVM beta.19 package instance as the gasless module. An EVM beta.20 account or a second package copy fails the class identity check. Standard EVM beta.20 transfer overrides and quote changes do not apply to these UserOperation methods.
- Uses EIP-7702 delegation and ERC-4337 UserOperations while retaining the EOA address.
- Supports sponsored mode and paymaster-token mode.
- `entryPointVersion` accepts `'0.8'` (default) or `'0.9'`. Match the delegation implementation, bundler, and paymaster to that version.
- Optional `chainId` checks the provider's first UserOperation chain lookup and caches success. Owned-account quotes and sends check even sponsored or signed inputs; read-only sponsored quotes skip it. The check does not validate an externally signed payload's chain or EntryPoint.
- Owned account paymaster-token quotes are cached for up to 2 minutes.
- Before reusing a cached UserOperation, the account validates its EntryPoint nonce and re-quotes if the nonce moved.
- A send that needs a fresh EIP-7702 authorization rebuilds the UserOperation instead of reusing the cached one.
- Quote-cache keys include the transaction, sponsorship mode, paymaster token, expected paymaster address, and sponsorship policy. Changing a keyed field creates a fresh quote.
