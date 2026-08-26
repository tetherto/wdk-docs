# wallet-aptos — Aptos

## Links

| Resource | URL |
|----------|-----|
| **npm** | https://www.npmjs.com/package/@tetherto/wdk-wallet-aptos |
| **GitHub** | https://github.com/tetherto/wdk-wallet-aptos |
| **Docs — Overview** | https://docs.wdk.tether.io/sdk/wallet-modules/wallet-aptos |
| **Docs — Usage** | https://docs.wdk.tether.io/sdk/wallet-modules/wallet-aptos/usage |
| **Docs — Configuration** | https://docs.wdk.tether.io/sdk/wallet-modules/wallet-aptos/configuration |
| **Docs — API Reference** | https://docs.wdk.tether.io/sdk/wallet-modules/wallet-aptos/api-reference |

## Package

```bash
npm install @tetherto/wdk-wallet-aptos@1.0.0-beta.2
```

```javascript
import WalletManagerAptos from '@tetherto/wdk-wallet-aptos'
```

## Key Details

- **Derivation**: SLIP-0010 Ed25519 at `m/44'/637'/{index}'/0'/0'`; every path segment is hardened.
- **Native unit**: APT balances and fees are returned in octas.
- **Token model**: `getTokenBalance()` and `transfer()` use Aptos fungible-asset metadata addresses.
- **Native transfers**: `quoteSendTransaction()`, `sendTransaction()`, and `signTransaction()` accept `{ to, value }`.
- **Fungible-asset transfers**: `quoteTransfer()` and `transfer()` accept `{ token, recipient, amount }`.
- `signTransaction()` simulates and signs a native APT transfer without broadcasting. It still needs a configured fullnode and is not an offline operation.
- `transferMaxFee` applies only to fungible-asset `transfer()` and rejects a fee equal to or greater than the cap. It does not protect native send or sign operations.
- `getTransaction()` returns the exported `AptosTransactionInfo`; `waitForTransaction()` polls the same normalized receipt contract. Both accept a trimmed `0x` plus 64-hex-character hash.
- Aptos mempool transactions are `pending`; any committed transaction is `final`. Finality does not imply execution success, so inspect `success` and the raw `transaction.vm_status`.
- `getTransactionReceipt()` remains as a deprecated raw lookup. The package root does not export `AptosTransactionReceipt`; its `type` is declared as `string`, with observed `pending_transaction` and `user_transaction` values.

## Configuration

```javascript
const wallet = new WalletManagerAptos(seedPhrase, {
  provider: 'https://fullnode.mainnet.aptoslabs.com/v1',
  txnExpirationSecs: 60,
  transferMaxFee: 100000n
})
```

- `provider` accepts one fullnode REST URL or an ordered URL array for failover.
- `retries` defaults to `3` for provider arrays.
- `chainId` is optional and is fetched from ledger info when omitted. A supplied value is not checked against ledger info before signing, so keep it consistent with every configured provider.
- Mainnet uses chain ID `1`; testnet uses chain ID `2`.

## Read-Only Accounts

An address-only `WalletAccountReadOnlyAptos` can read balances and track transactions. Its constructor stores the supplied address verbatim without validation or normalization, so validate external input first. Fee quotes and Ed25519 message verification also require the matching 32-byte public key. Prefer `account.toReadOnlyAccount()` when starting from a writable account because it carries that public key forward.

## Transaction Safety

- Require explicit human confirmation before `sendTransaction()`, `transfer()`, or `signTransaction()`.
- Quote native APT transfers for user review, but do not present the quote as an enforced cap. Send and sign simulate again, expose no native maximum-fee argument, and do not apply `transferMaxFee`.
- Validate the destination as an Aptos address and treat the fungible-asset metadata address as a separate trust boundary.
- `waitForTransaction()` treats a valid-but-unknown hash as transient, polls every 4 seconds by default, and times out after 60 seconds unless overridden.
- Treat `keyPair` and seed material as sensitive and never log signed transactions. Account disposal clears its private key, but manager disposal only disposes cached accounts and signers; beta.2 retains the manager's `seed` buffer, so release all seed and manager references and use process isolation when stronger memory reclamation is required.
