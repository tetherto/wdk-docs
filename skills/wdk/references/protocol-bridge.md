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
npm install @tetherto/wdk-protocol-bridge-usdt0-evm
```

```javascript
import Usdt0ProtocolEvm from '@tetherto/wdk-protocol-bridge-usdt0-evm'
```

## Choose the account flow

| Account | Approval behavior | Submission |
|---|---|---|
| Standard `WalletAccountEvm` | Call `account.approve()` for the source-chain OFT or bridge spender before `bridge()`. | Approval and bridge are separate EVM transactions. |
| `WalletAccountEvmErc4337` | Do not call `account.approve()` separately. The protocol builds an approval to the transaction-value helper. | Approval and helper bridge call are submitted in one UserOperation. |

ERC-4337 helper bridging is available from Ethereum, Arbitrum, Plasma, and Polygon. Other supported EVM source chains require a standard account.

## Standard account quick reference

```javascript
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

const quote = await bridge.quoteBridge(options)

await evmAccount.approve({
  token: options.token,
  spender: options.oftContractAddress,
  amount: options.amount
})

const result = await bridge.bridge(options)
```

For a standard account, `fee` and `bridgeFee` are in source-chain native base units. `bridge()` rejects when `fee + bridgeFee` is equal to or greater than `bridgeMaxFee`.

## ERC-4337 quick reference

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

### ERC-4337 fee-unit limitation

In `1.0.0-beta.7`:

- `bridgeFee` is in bridged-token base units.
- `fee` is in source-native base units for native gas, paymaster-token base units for token-paid gas, or zero for sponsored gas.
- The protocol numerically adds `fee + bridgeFee` when enforcing `bridgeMaxFee`.

Do not interpret that sum as one currency or configure an ERC-4337 cap until the selected payment mode is known to produce compatible units. Equality with the cap is rejected.

## Supported routes

**EVM source and destination keys:** `ethereum`, `arbitrum`, `optimism`, `polygon`, `berachain`, `ink`, `plasma`, `conflux`, `corn`, `avalanche`, `celo`, `flare`, `hyperevm`, `mantle`, `megaeth`, `monad`, `morph`, `rootstock`, `sei`, `stable`, `unichain`, `xlayer`

**Additional destination keys:** `solana`, `ton`, `tron`

For Solana, TON, and TRON targets, beta.7 skips a source chain's ordinary `oftContract` during auto-resolution. The bundled source-side candidates are:

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

Validate the destination address for its target ecosystem, verify route contracts and endpoint overrides, and keep approvals bounded to the intended standard-account transfer.
