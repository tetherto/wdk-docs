# wallet-spark — Spark (Bitcoin L2 + Lightning)

## Links

| Resource | URL |
|----------|-----|
| **npm** | https://www.npmjs.com/package/@tetherto/wdk-wallet-spark |
| **GitHub** | https://github.com/tetherto/wdk-wallet-spark |
| **Docs — Overview** | https://docs.wallet.tether.io/sdk/wallet-modules/wallet-spark |
| **Docs — Usage** | https://docs.wallet.tether.io/sdk/wallet-modules/wallet-spark/usage |
| **Docs — Configuration** | https://docs.wallet.tether.io/sdk/wallet-modules/wallet-spark/configuration |
| **Docs — API Reference** | https://docs.wallet.tether.io/sdk/wallet-modules/wallet-spark/api-reference |

## Package

```bash
npm install @tetherto/wdk-wallet-spark
```

```javascript
import WalletManagerSpark from '@tetherto/wdk-wallet-spark'
```

Requires peer dependency: `@buildonspark/spark-sdk`

## Key Details

- **Derivation**: BIP-44 (`m/44'/998'/{net}'/0/{index}`)
- **Balance unit**: satoshis (1 BTC = 100,000,000 sats)
- **Zero fees** for Spark-to-Spark transactions
- **Lightning Network** integration for invoices and payments

### Key Tree

| Purpose | Path Suffix |
|---------|-------------|
| Identity | `/0'` |
| Signing | `/0'/0'` |
| Deposit | `/0'/1'` |
| Static Deposit | `/0'/2'` |
| HTLC Preimage | `/0'/3'` |

## Configuration

```javascript
const wallet = new WalletManagerSpark(seedPhrase, {
  network: 'mainnet'  // or 'testnet'
})
```

## Chain-Specific Methods

### Deposits (L1 → Spark)
- `getSingleUseDepositAddress()` — Generate a Bitcoin L1 address for depositing into Spark
- `claimDeposit(txId)` — Claim a deposit after it confirms on L1
- `getStaticDepositAddress()` — Reusable deposit address
- `claimStaticDeposit(depositId)` — Claim from static deposit
- `refundStaticDeposit(depositId)` — Refund unclaimed static deposit

### Withdrawals (Spark → L1)
- `withdraw({to, value})` — Withdraw to a Bitcoin L1 address

### Lightning Network
- `createLightningInvoice({value, memo})` — Create a Lightning invoice (receive)
- `payLightningInvoice({invoice, maxFeeSats})` — Pay a Lightning invoice (send)

### Spark Invoices
- `createSparkSatsInvoice({value})` — Invoice for sats on Spark
- `createSparkTokensInvoice({tokenId, amount})` — Invoice for tokens on Spark
- `paySparkInvoice({invoice})` — Pay a Spark invoice

### Token Operations
- `transfer({token, recipient, amount})` — Transfer tokens on Spark
- `getTokenBalance(tokenPublicKey)` — Query token balance

All write methods listed above require explicit human confirmation.
