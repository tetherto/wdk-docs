# wallet-btc — Bitcoin

## Links

| Resource | URL |
|----------|-----|
| **npm** | https://www.npmjs.com/package/@tetherto/wdk-wallet-btc |
| **GitHub** | https://github.com/tetherto/wdk-wallet-btc |
| **Docs — Overview** | https://docs.wallet.tether.io/sdk/wallet-modules/wallet-btc |
| **Docs — Usage** | https://docs.wallet.tether.io/sdk/wallet-modules/wallet-btc/usage |
| **Docs — Configuration** | https://docs.wallet.tether.io/sdk/wallet-modules/wallet-btc/configuration |
| **Docs — API Reference** | https://docs.wallet.tether.io/sdk/wallet-modules/wallet-btc/api-reference |

## Package

```bash
npm install @tetherto/wdk-wallet-btc
```

```javascript
import WalletManagerBtc from '@tetherto/wdk-wallet-btc'
```

## Key Details

- **Derivation**: BIP-84 (Native SegWit only, `bc1...` addresses)
- **Path**: `m/84'/0'/0'/0/{index}`
- **Provider**: Electrum servers (TCP/TLS/SSL, NOT HTTP RPC)
- **Fee unit**: sat/vB (satoshis per virtual byte)
- **Balance unit**: satoshis (1 BTC = 100,000,000 sats)
- **Dust**: 546 sats (P2PKH), 294 sats (P2WPKH)

## Configuration

```javascript
const wallet = new WalletManagerBtc(seedPhrase, {
  host: 'electrum.blockstream.info',  // Electrum server hostname
  port: 50001,                         // 50001=TCP, 50002=SSL
  network: 'bitcoin'                   // 'bitcoin', 'testnet', or 'regtest'
})
```

## Chain-Specific Behavior

- **No token support**: `getTokenBalance()` and `transfer()` **throw**. Bitcoin has no token standard in WDK.
- **UTXO-based**: Uses coinselect for UTXO selection and PSBT for transaction signing.
- **Fee rates**: `wallet.getFeeRates()` returns `{normal, fast}` from mempool.space API.
  - `normal`: ~1 hour confirmation
  - `fast`: next block confirmation
- **Transfer history**: `account.getTransfers({direction, limit, skip})` — direction is `'incoming'`, `'outgoing'`, or `'all'`.
- **Memory safety**: `dispose()` calls `sodium_memzero` on all key material.
