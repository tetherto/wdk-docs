# protocol-bridge — USD₮0 Cross-Chain Bridge

## Links

| Resource | URL |
|----------|-----|
| **npm** | https://www.npmjs.com/package/@tetherto/wdk-protocol-bridge-usdt0-evm |
| **GitHub** | https://github.com/tetherto/wdk-protocol-bridge-usdt0-evm |
| **Docs — Overview** | https://docs.wallet.tether.io/sdk/bridge-modules/bridge-usdt0-evm |
| **Docs — Usage** | https://docs.wallet.tether.io/sdk/bridge-modules/bridge-usdt0-evm/usage |
| **Docs — Configuration** | https://docs.wallet.tether.io/sdk/bridge-modules/bridge-usdt0-evm/configuration |
| **Docs — API Reference** | https://docs.wallet.tether.io/sdk/bridge-modules/bridge-usdt0-evm/api-reference |
| **USD₮0 Docs** | https://docs.usdt0.to |
| **USD₮0 Deployments** | https://docs.usdt0.to/technical-documentation/deployments |

## Package

```bash
npm install @tetherto/wdk-protocol-bridge-usdt0-evm @tetherto/wdk-wallet-evm
```

```javascript
import Usdt0ProtocolEvm from '@tetherto/wdk-protocol-bridge-usdt0-evm'
import { WalletAccountEvm } from '@tetherto/wdk-wallet-evm'
```

## Choose the account flow

From `1.0.0-beta.9`, the constructor accepts shared `IWalletAccountReadOnly` and `IWalletAccount` interfaces. Runtime use still requires EVM-compatible account operations and the account's internal `_config.provider`; implementing the shared interface alone is insufficient. Read-only accounts can quote. Execution additionally requires a callable `sendTransaction()`.

⚠️ Bridge beta.10 is incompatible with accounts derived by `WalletManagerEvm` beta.19. Those accounts contain an ethers `Provider`, while the bridge treats every non-string value as EIP-1193 and rejects it during construction. Use a directly constructed `WalletAccountEvm` with its original URL or EIP-1193 input. Do not mutate `_config`. This direct account is outside WDK Core's policy and middleware decoration, so retain any required application checks and account-level fee caps explicitly.

| Account | Approval behavior | Submission |
|---|---|---|
| Standard `WalletAccountEvm` | Call `account.approve()` for the source-chain OFT or bridge spender before `bridge()`. | Approval and bridge are separate EVM transactions. |
| `WalletAccountEvmErc4337` | Do not call `account.approve()` separately. The protocol builds an approval to the transaction-value helper. | Approval and helper bridge call are submitted in one UserOperation. |

ERC-4337 helper bridging is available from Ethereum, Arbitrum, Plasma, and Polygon. Other supported EVM source chains require a standard account.

Helper selection and batching use the bridge package's concrete ERC-4337 classes. Beta.10 pins `@tetherto/wdk-wallet-evm-erc-4337` to beta.11. An account from a separate package copy or version, including beta.20, takes the non-batched standard path and skips the helper and per-call ERC-4337 configuration. Use the exact isolated pair below; do not override the bridge dependency or downgrade an application that needs beta.20.

## Standard account quick reference

```javascript
const evmAccount = new WalletAccountEvm(seedPhrase, "0'/0/0", {
  provider: 'https://eth.drpc.org',
  transactionMaxFee: 5000000000000000n
})

const bridge = new Usdt0ProtocolEvm(evmAccount, {
  bridgeMaxFee: 1000000000000000n
})

const options = {
  targetChain: 'arbitrum',
  recipient: '0x...',
  token: '0x...',
  amount: 1000000n,
  oftContractAddress: process.env.USDT0_OFT_ADDRESS
}

try {
  const quote = await bridge.quoteBridge(options)

  await evmAccount.approve({
    token: options.token,
    spender: options.oftContractAddress,
    amount: options.amount
  })

  const result = await bridge.bridge(options)
} finally {
  evmAccount.dispose()
}
```

For a standard account, `fee` and `bridgeFee` are in source-chain native base units. `bridge()` rejects when `fee + bridgeFee` is equal to or greater than `bridgeMaxFee`.

## ERC-4337 quick reference

```bash
npm install --save-exact @tetherto/wdk-protocol-bridge-usdt0-evm@1.0.0-beta.10 @tetherto/wdk-wallet-evm-erc-4337@1.0.0-beta.11
npm ls @tetherto/wdk-wallet-evm-erc-4337 --all
```

Proceed only when every listed copy is beta.11 and the bridge's entry is `deduped`. If beta.20 is also listed, keep that application on the standard account flow or isolate the beta.10/beta.11 pair in a separate package.

```javascript
const bridge = new Usdt0ProtocolEvm(erc4337Account)

const result = await bridge.bridge(
  {
    targetChain: 'polygon',
    recipient: '0x...',
    token: process.env.USDT_SOURCE_TOKEN_ADDRESS,
    amount: 1000000n,
    oftContractAddress: process.env.USDT0_OFT_ADDRESS
  },
  {
    paymasterToken: {
      address: process.env.PAYMASTER_TOKEN_ADDRESS
    }
  }
)
```

The returned hash identifies the single UserOperation containing the approval and helper bridge call.

### ERC-4337 fee units

Starting in `1.0.0-beta.10`:

- `bridgeFee` is in source-native base units.
- `fee` is in source-native base units for native gas, paymaster-token base units for token-paid gas, or zero for sponsored gas.
- The protocol numerically adds `fee + bridgeFee` when enforcing `bridgeMaxFee`.

Native-gas and sponsored flows use compatible units. Do not interpret the token-paid sum as one currency or configure a cap for that mode without an application-owned conversion. Equality with the cap is rejected.

## Supported routes

**EVM source and destination keys:** `ethereum`, `arbitrum`, `optimism`, `polygon`, `berachain`, `ink`, `plasma`, `conflux`, `corn`, `avalanche`, `celo`, `flare`, `hyperevm`, `mantle`, `megaeth`, `monad`, `morph`, `rootstock`, `sei`, `stable`, `unichain`, `xlayer`

**Additional destination keys:** `solana`, `ton`, `tron`

For Solana, TON, and TRON targets, beta.10 skips a source chain's ordinary `oftContract` during auto-resolution. The bundled source-side candidates are:

- USD₮0 legacy mesh: Ethereum, Arbitrum, Celo.
- XAU₮0 OFT: Ethereum, Arbitrum, Avalanche, Celo, HyperEVM, Ink, Monad, Plasma, Polygon, Stable.

These are candidate source contracts, not a Cartesian route guarantee. A contract must have the selected destination peer configured on-chain. `getSupportedChains()` and `getSupportedTokens()` expose static configuration and do not prove a source-token-destination pair. Verify the exact route with `quoteBridge()`, or supply a verified route-specific `oftContractAddress` and optional `dstEid`.

Route availability also depends on a matching USD₮0 or XAU₮0 deployment. Verify current contract addresses against the USD₮0 deployment documentation.

## Common interface

| Method | Description |
|--------|-------------|
| `bridge({ targetChain, recipient, token, amount, oftContractAddress?, dstEid? }, config?)` | Execute a bridge operation. Requires human confirmation before the write. |
| `quoteBridge({ targetChain, recipient, token, amount, oftContractAddress?, dstEid? }, config?)` | Estimate account and bridge fee fields without submitting. |
| `getSupportedChains()` | Return the configured chain descriptors. |
| `getSupportedTokens(options?)` | Return configured USD₮0 or XAU₮0 token descriptors, optionally filtered by chain or token symbol. |

Beta.10 validates EVM, Solana, TON, and TRON recipients during quote and execution. It rejects zero destinations, the TRON zero/burn address, and TON workchains other than `0`. Keep application validation before the write, verify route contracts and endpoint overrides, and keep approvals bounded to the intended standard-account transfer.
