# wallet-solana — Solana

## Links

| Resource | URL |
|----------|-----|
| **npm** | https://www.npmjs.com/package/@tetherto/wdk-wallet-solana |
| **GitHub** | https://github.com/tetherto/wdk-wallet-solana |
| **Docs — Overview** | https://docs.wallet.tether.io/sdk/wallet-modules/wallet-solana |
| **Docs — Usage** | https://docs.wallet.tether.io/sdk/wallet-modules/wallet-solana/usage |
| **Docs — Configuration** | https://docs.wallet.tether.io/sdk/wallet-modules/wallet-solana/configuration |
| **Docs — API Reference** | https://docs.wallet.tether.io/sdk/wallet-modules/wallet-solana/api-reference |

## Package

```bash
npm install @tetherto/wdk-wallet-solana
```

```javascript
import WalletManagerSolana from '@tetherto/wdk-wallet-solana'
```

## Key Details

- **Derivation**: BIP-44 (`m/44'/501'/0'/0/{index}`)
- **Key type**: Ed25519
- **Fee unit**: lamports (1 SOL = 1,000,000,000 lamports)
- **Token standard**: SPL tokens via `transfer()`
- **Rent-exempt minimum**: ~890,880 lamports for new accounts
- **USDT mint**: `Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB`

## Configuration

```javascript
const wallet = new WalletManagerSolana(seedPhrase, {
  provider: 'https://api.mainnet-beta.solana.com',
  transferMaxFee: 100000000n  // Optional max fee in lamports
})
```

## Chain-Specific Behavior

- Solana accounts require a minimum balance (rent-exempt) to stay alive.
- SPL token transfers may require creating an Associated Token Account (ATA) for the recipient if one doesn't exist.
- Transaction fees are typically very low (~5,000 lamports) but priority fees can increase during congestion.
