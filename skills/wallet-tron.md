# wallet-tron & wallet-tron-gasfree — TRON

## Links — wallet-tron

| Resource | URL |
|----------|-----|
| **npm** | https://www.npmjs.com/package/@tetherto/wdk-wallet-tron |
| **GitHub** | https://github.com/tetherto/wdk-wallet-tron |
| **Docs — Overview** | https://docs.wallet.tether.io/sdk/wallet-modules/wallet-tron |
| **Docs — Usage** | https://docs.wallet.tether.io/sdk/wallet-modules/wallet-tron/usage |
| **Docs — Configuration** | https://docs.wallet.tether.io/sdk/wallet-modules/wallet-tron/configuration |
| **Docs — API Reference** | https://docs.wallet.tether.io/sdk/wallet-modules/wallet-tron/api-reference |

## Links — wallet-tron-gasfree

| Resource | URL |
|----------|-----|
| **npm** | https://www.npmjs.com/package/@tetherto/wdk-wallet-tron-gasfree |
| **GitHub** | https://github.com/tetherto/wdk-wallet-tron-gasfree |
| **Docs — Overview** | https://docs.wallet.tether.io/sdk/wallet-modules/wallet-tron-gasfree |
| **Docs — Usage** | https://docs.wallet.tether.io/sdk/wallet-modules/wallet-tron-gasfree/usage |
| **Docs — Configuration** | https://docs.wallet.tether.io/sdk/wallet-modules/wallet-tron-gasfree/configuration |
| **Docs — API Reference** | https://docs.wallet.tether.io/sdk/wallet-modules/wallet-tron-gasfree/api-reference |

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

- **Derivation**: BIP-44 (`m/44'/195'/0'/0/{index}`)
- **Key type**: secp256k1
- **Fee unit**: sun (1 TRX = 1,000,000 sun)
- **Token standard**: TRC20 via `transfer()`
- **USDT address**: `TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t`
- ⚠️ TRON USDT has the same non-standard `transfer()` as Ethereum USDT (no bool return)
- **Fee model**: Energy + Bandwidth costs (not simple gas like EVM)

## Configuration — wallet-tron

```javascript
const wallet = new WalletManagerTron(seedPhrase, {
  provider: 'https://api.trongrid.io',
  transferMaxFee: 10000000n              // Optional: max fee in sun
})
```

## Key Details — wallet-tron-gasfree

- Same derivation and key type as wallet-tron
- **Gas-free**: Service provider covers transaction fees for TRC20 transfers
- Requires `gasFreeProvider`, `gasFreeApiKey`, `serviceProvider`, `verifyingContract`
- **TRC20 transfers only**: `sendTransaction()` **throws** — use `transfer()` only

## Configuration — wallet-tron-gasfree

```javascript
const wallet = new WalletManagerTronGasfree(seedPhrase, {
  provider: 'https://api.trongrid.io',
  gasFreeProvider: 'https://gasfree-api-url.com',
  gasFreeApiKey: 'your-gasfree-api-key',
  serviceProvider: 'T...',               // Service provider TRON address
  verifyingContract: 'T...',             // Verifying contract TRON address
  transferMaxFee: 10000000n
})
```
