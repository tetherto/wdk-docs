# wallet-tron & wallet-tron-gasfree — TRON

## Links — wallet-tron

| Resource | URL |
|----------|-----|
| **npm** | https://www.npmjs.com/package/@tetherto/wdk-wallet-tron |
| **GitHub** | https://github.com/tetherto/wdk-wallet-tron |
| **Docs — Overview** | https://docs.wdk.tether.io/sdk/wallet-modules/wallet-tron |
| **Docs — Usage** | https://docs.wdk.tether.io/sdk/wallet-modules/wallet-tron/usage |
| **Docs — Configuration** | https://docs.wdk.tether.io/sdk/wallet-modules/wallet-tron/configuration |
| **Docs — API Reference** | https://docs.wdk.tether.io/sdk/wallet-modules/wallet-tron/api-reference |

## Links — wallet-tron-gasfree

| Resource | URL |
|----------|-----|
| **npm** | https://www.npmjs.com/package/@tetherto/wdk-wallet-tron-gasfree |
| **GitHub** | https://github.com/tetherto/wdk-wallet-tron-gasfree |
| **Docs — Overview** | https://docs.wdk.tether.io/sdk/wallet-modules/wallet-tron-gasfree |
| **Docs — Usage** | https://docs.wdk.tether.io/sdk/wallet-modules/wallet-tron-gasfree/usage |
| **Docs — Configuration** | https://docs.wdk.tether.io/sdk/wallet-modules/wallet-tron-gasfree/configuration |
| **Docs — API Reference** | https://docs.wdk.tether.io/sdk/wallet-modules/wallet-tron-gasfree/api-reference |

## Packages

```bash
npm install @tetherto/wdk-wallet-tron
npm install @tetherto/wdk-wallet-tron-gasfree  # for gas-free variant
```

```javascript
import WalletManagerTron from '@tetherto/wdk-wallet-tron'
import WalletManagerTronGasfree from '@tetherto/wdk-wallet-tron-gasfree'
```

## Key Details — wallet-tron

- Import `SeedSignerTron` and `PrivateKeySignerTron` from `@tetherto/wdk-wallet-tron/signers`. Use a derivable signer as the manager’s default, or register a signer and call `getAccount(name)` to use it directly. The caller disposes supplied signers after use.
- Standard TRON full and read-only accounts expose `account.config`. Manager-derived accounts expose the initialized TronWeb client. Treat the configuration as read-only and keep credentials out of logs.
- **Derivation**: BIP-44 (`m/44'/195'/0'/0/{index}`)
- **Key type**: secp256k1
- **Fee unit**: sun (1 TRX = 1,000,000 sun)
- **Token standard**: TRC20 via `transfer()`
- **USD₮ address**: `TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t`
- ⚠️ TRON USD₮ has the same non-standard `transfer()` as Ethereum USD₮ (no bool return)
- **Fee model**: Energy + Bandwidth costs (not simple gas like EVM)
- `signTransaction()` returns the exported `TronSignedTransaction` type.
- `quoteSendTransaction()` and `sendTransaction()` accept that signed object; send forwards it unchanged to `tronWeb.trx.sendRawTransaction()` and rechecks `transactionMaxFee`.
- ⚠️ WDK does not refresh the reference block or expiration, re-sign a supplied signed transaction, or repeat the unsigned owner-address check. Validate ownership and submit while it remains valid.

## Configuration — wallet-tron

```javascript
const wallet = new WalletManagerTron(seedPhrase, {
  provider: 'https://api.trongrid.io',
  transferMaxFee: 10000000n,              // Optional: max TRC20 transfer fee in sun
  transactionMaxFee: 10000000n            // Optional: max send/sign fee in sun
})
```

## Key Details — wallet-tron-gasfree

- Same derivation and key type as wallet-tron
- **Gas-free**: Service provider covers transaction fees for TRC20 transfers
- GasFree beta.10 accepts TRON RPC URL/`TronWeb` arrays and `retries`, sharing the initialized provider across manager-derived accounts. This is RPC failover, not an array of GasFree relay endpoints. Standard TRON beta.14 also shares its manager provider.
- Configure `chainId`, `gasFreeProvider`, `serviceProvider`, and `verifyingContract`. Supply both `gasFreeApiKey` and `gasFreeApiSecret` when your provider requires signed requests.
- GasFree beta.14 uses the wallet's `transferMaxFee` by default. A value passed to `transfer(options, { transferMaxFee })` overrides it. Set caps in the transferred token's base units.
- GasFree beta.14 derives `getAddress()` locally when `verifyingContract` matches the packaged controller for mainnet or Nile. Other valid controllers on these networks use the GasFree provider.
- **TRC20 transfers only**: `sendTransaction()` **throws** — use `transfer()` only

## Configuration — wallet-tron-gasfree

```javascript
const wallet = new WalletManagerTronGasfree(seedPhrase, {
  provider: 'https://api.trongrid.io',
  gasFreeProvider: 'https://gasfree-api-url.com',
  chainId: 728126428,                    // TRON mainnet
  gasFreeApiKey,                         // Application-supplied credentials
  gasFreeApiSecret,
  serviceProvider: 'T...',               // Service provider TRON address
  verifyingContract: 'T...',             // Verifying contract TRON address
  transferMaxFee: 10000000n
})
```
