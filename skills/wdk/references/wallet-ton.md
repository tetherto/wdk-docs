# wallet-ton & wallet-ton-gasless — TON

## Links — wallet-ton

| Resource | URL |
|----------|-----|
| **npm** | https://www.npmjs.com/package/@tetherto/wdk-wallet-ton |
| **GitHub** | https://github.com/tetherto/wdk-wallet-ton |
| **Docs — Overview** | https://docs.wdk.tether.io/sdk/wallet-modules/wallet-ton |
| **Docs — Usage** | https://docs.wdk.tether.io/sdk/wallet-modules/wallet-ton/usage |
| **Docs — Configuration** | https://docs.wdk.tether.io/sdk/wallet-modules/wallet-ton/configuration |
| **Docs — API Reference** | https://docs.wdk.tether.io/sdk/wallet-modules/wallet-ton/api-reference |

## Links — wallet-ton-gasless

| Resource | URL |
|----------|-----|
| **npm** | https://www.npmjs.com/package/@tetherto/wdk-wallet-ton-gasless |
| **GitHub** | https://github.com/tetherto/wdk-wallet-ton-gasless |
| **Docs — Overview** | https://docs.wdk.tether.io/sdk/wallet-modules/wallet-ton-gasless |
| **Docs — Usage** | https://docs.wdk.tether.io/sdk/wallet-modules/wallet-ton-gasless/usage |
| **Docs — Configuration** | https://docs.wdk.tether.io/sdk/wallet-modules/wallet-ton-gasless/configuration |
| **Docs — API Reference** | https://docs.wdk.tether.io/sdk/wallet-modules/wallet-ton-gasless/api-reference |

## Packages

```bash
npm install @tetherto/wdk-wallet-ton
npm install @tetherto/wdk-wallet-ton-gasless  # for gasless variant
```

```javascript
import WalletManagerTon from '@tetherto/wdk-wallet-ton'
import WalletManagerTonGasless from '@tetherto/wdk-wallet-ton-gasless'
```

## Key Details — wallet-ton

- **Derivation**: BIP-44 (`m/44'/607'/{index}'` in v1.0.0-beta.6+)
- **Key type**: Ed25519
- **Wallet contract**: V5R1
- **Fee unit**: nanotons (1 TON = 1,000,000,000 nanotons)
- **Token standard**: Jettons via `transfer()`
- **USDT Jetton master**: `EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs`
- `sendTransaction` accepts a `body` field for arbitrary contract calls — treat with caution.

> **Derivation path change in v1.0.0-beta.6+**: Previous default was `m/44'/607'/0'/0/{index}`, updated to match ecosystem conventions. Existing wallets created with old path will generate different addresses. Use `getAccountByPath` for legacy wallet recovery.

## Configuration — wallet-ton

```javascript
const wallet = new WalletManagerTon(seedPhrase, {
  tonClient: {
    url: 'https://toncenter.com/api/v2/jsonRPC',
    secretKey: 'your-api-key'            // Optional but recommended for production
  },
  transferMaxFee: 1000000000n            // Optional: max fee in nanotons
})
```

## Key Details — wallet-ton-gasless

- Same default derivation and key type as wallet-ton in gasless v1.0.0-beta.5+
- **Gasless Jetton transfers**: fees are paid in a supported paymaster Jetton instead of native TON
- Requires a `tonApiClient` base URL and `paymasterToken.address` configuration
- **Jetton transfers only**: `sendTransaction()`, `quoteSendTransaction()`, and `signTransaction()` are unsupported — use `transfer()` and `quoteTransfer()`
- Transfer fees are returned in paymaster Jetton base units. The account pays them from its configured paymaster Jetton balance; if that Jetton is also being transferred, the same balance must cover both the transfer amount and the final fee.

## Configuration — wallet-ton-gasless

```javascript
const wallet = new WalletManagerTonGasless(seedPhrase, {
  tonClient: {
    url: 'https://toncenter.com/api/v2/jsonRPC',
    secretKey: 'your-api-key'
  },
  tonApiClient: {
    url: 'https://tonapi.io',
    secretKey: 'your-ton-api-key'
  },
  paymasterToken: {
    address: 'EQ...'                     // Paymaster token contract address
  },
  transferMaxFee: 1000000000n
})
```
