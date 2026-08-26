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
- ⚠️ In wallet-evm `1.0.0-beta.16`, do not pass a serialized signed transaction to `sendTransaction()`. The declared string input is not broadcast as supplied and can produce a different populated transaction. Use a separate relay or provider for signed raw bytes.
- `quoteSendTransaction(serializedTx)` is non-broadcasting, but calculates with current provider fee data rather than reproducing the serialized fee settings.

## Configuration — wallet-evm

```javascript
const wallet = new WalletManagerEvm(seedPhrase, {
  provider: 'https://eth.drpc.org',      // JSON-RPC URL or EIP-1193 provider
  chainId: 1,                             // Optional, auto-detected
  transferMaxFee: 5000000000000000n       // Optional max fee in wei
})
```

## Key Details — wallet-evm-erc-4337

- **Gasless** via UserOperations + Paymaster
- Fees paid in **paymaster token** (e.g., USD₮) instead of native ETH
- `getPaymasterTokenBalance()` for fee balance
- **Batch transactions**: `sendTransaction([tx1, tx2])` — multiple operations in one call
- `signTransaction(tx)` signs one `UserOperationV7`; the signed result can be quoted and submitted through `sendTransaction()`.
- Signed UserOperations preserve their nonce and fee-mode configuration. Submit promptly through the same account and do not mutate them.
- Signed UserOperation submission does not reapply `transactionMaxFee`. In paymaster-token mode, a signed-operation quote is a buffered native-gas ceiling in wei, not a token-denominated charge.
- Quote-cache keys omit fee-mode configuration. Use the same mode, paymaster token, paymaster endpoints, and sponsorship policy for a quote and its matching send, sign, or transfer.
- Same `data` risk as wallet-evm, plus batch execution risk

## Configuration — wallet-evm-erc-4337

```javascript
const wallet = new WalletManagerEvmErc4337(seedPhrase, {
  provider: 'https://arb1.arbitrum.io/rpc',
  chainId: 42161,
  bundlerUrl: 'https://api.candide.dev/public/v3/42161',
  paymasterUrl: 'https://api.candide.dev/public/v3/42161',
  paymasterAddress: '0x8b1f6cb5d062aa2ce8d581942bbb960420d875ba',
  paymasterToken: {
    address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9' // USDt on Arbitrum
  },
  transferMaxFee: 5000000       // in paymaster token units
})
```

## Key Details — wallet-evm-7702-gasless

- Uses EIP-7702 delegation and ERC-4337 UserOperations while retaining the EOA address.
- Supports sponsored mode and paymaster-token mode.
- Owned account paymaster-token quotes are cached for up to 2 minutes.
- Before reusing a cached UserOperation, the account validates its EntryPoint nonce and re-quotes if the nonce moved.
- A send that needs a fresh EIP-7702 authorization rebuilds the UserOperation instead of reusing the cached one.
- Quote-cache keys omit fee-mode configuration. Use the same mode, paymaster token, paymaster endpoints, and sponsorship policy for a quote and its matching send or transfer.
