# wallet-solana — Solana

## Links

| Resource | URL |
|----------|-----|
| **npm** | https://www.npmjs.com/package/@tetherto/wdk-wallet-solana |
| **GitHub** | https://github.com/tetherto/wdk-wallet-solana |
| **Docs — Overview** | https://docs.wdk.tether.io/sdk/wallet-modules/wallet-solana |
| **Docs — Usage** | https://docs.wdk.tether.io/sdk/wallet-modules/wallet-solana/usage |
| **Docs — Configuration** | https://docs.wdk.tether.io/sdk/wallet-modules/wallet-solana/configuration |
| **Docs — API Reference** | https://docs.wdk.tether.io/sdk/wallet-modules/wallet-solana/api-reference |

## Package

```bash
npm install @tetherto/wdk-wallet-solana
```

```javascript
import WalletManagerSolana from '@tetherto/wdk-wallet-solana'
```

## Key Details

- **Derivation**: BIP-44 (`m/44'/501'/{index}'/0'`)
- **Key type**: Ed25519
- **Fee unit**: lamports (1 SOL = 1,000,000,000 lamports)
- **Token standard**: SPL tokens via `transfer()`
- **Rent-exempt minimum**: ~890,880 lamports for new accounts
- **USD₮ mint**: `Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB`
- `signTransaction()` returns a `FullySignedTransaction` from `@solana/transactions`; WDK does not re-export that type.
- `quoteSendTransaction()` and `sendTransaction()` accept that signed value. Send broadcasts the exact wire bytes and rechecks `transactionMaxFee`.
- ⚠️ Signing seals the recent blockhash or durable nonce. WDK does not refresh or re-sign a supplied signed transaction; submit it before its lifetime becomes invalid.

## Configuration

```javascript
const wallet = new WalletManagerSolana(seedPhrase, {
  provider: 'https://api.mainnet-beta.solana.com',
  transferMaxFee: 10000000n,   // Optional max SPL transfer fee in lamports
  transactionMaxFee: 10000000n // Optional max send/sign fee in lamports
})
```

> **Derivation path change in v1.0.0-beta.4+**: Previous default was `m/44'/501'/0'/0/{index}`, updated to match ecosystem conventions. Use `getAccountByPath` for legacy wallet recovery.

## Chain-Specific Behavior

- Solana accounts require a minimum balance (rent-exempt) to stay alive.
- SPL token transfers may require creating an Associated Token Account (ATA) for the recipient if one doesn't exist.
- Transaction fees are typically very low (~5,000 lamports) but priority fees can increase during congestion.
