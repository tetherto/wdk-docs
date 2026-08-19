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
npm install @tetherto/wdk-wallet-aptos
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
- The package root does not export `AptosTransactionReceipt`. Receipt `type` is declared as `string`; observed values include `pending_transaction` and `user_transaction`.

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

An address-only `WalletAccountReadOnlyAptos` can read balances and receipts. Fee quotes and Ed25519 message verification also require the matching 32-byte public key. Prefer `account.toReadOnlyAccount()` when starting from a writable account because it carries that public key forward.

## Transaction Safety

- Require explicit human confirmation before `sendTransaction()`, `transfer()`, or `signTransaction()`.
- Quote native APT transfers and enforce an application-level fee limit before sending or signing because `transferMaxFee` does not apply.
- Validate the destination as an Aptos address and treat the fungible-asset metadata address as a separate trust boundary.
- A non-null receipt can still be pending. Wait for an observed `type === 'user_transaction'`, then inspect `success` and `vm_status`.
- Treat `keyPair` and seed material as sensitive, never log signed transactions, and call `dispose()` when secret material is no longer needed.
