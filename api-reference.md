# API Reference

Explore the main functions provided by the Wallet Development Kit (WDK). Click each section for detailed usage and code examples.

---

## Account Management
- Create, retrieve, and manage blockchain accounts
- [See details & examples](api/account-management.md)

**Key Methods:**
- `getAccount(blockchain: string, index: number): Account`
- `getAbstractedAddress(blockchain: string, index: number): Promise<string>`

| Method | Parameters | Returns |
|--------|------------|---------|
| getAccount | blockchain (string), index (number) | Account instance |
| getAbstractedAddress | blockchain (string), index (number) | Promise<string> |

## Balance Management
- Query native and token balances across supported blockchains
- [See details & examples](api/balance-management.md)

**Key Methods:**
- `getBalance(blockchain: string, index: number): Promise<number>`
- `getAbstractedAddressTokenBalance(blockchain: string, index: number, { token }): Promise<number>`

| Method | Parameters | Returns |
|--------|------------|---------|
| getBalance | blockchain (string), index (number) | Promise<number> |
| getAbstractedAddressTokenBalance | blockchain (string), index (number), { token } | Promise<number> |

## Transaction Management
- Transfer tokens, send transactions, and manage fees
- [See details & examples](api/transaction-management.md)

**Key Methods:**
- `quoteTransfer(blockchain: string, index: number, params): Promise<Quote>`
- `executeTransfer(blockchain: string, index: number, quote): Promise<TxReceipt>`
- `quoteTransaction(params): Promise<Quote>`
- `executeTransaction(quote): Promise<TxReceipt>`

| Method | Parameters | Returns |
|--------|------------|---------|
| quoteTransfer | blockchain, index, params | Promise<Quote> |
| executeTransfer | blockchain, index, quote | Promise<TxReceipt> |
| quoteTransaction | params | Promise<Quote> |
| executeTransaction | quote | Promise<TxReceipt> |

## Lightning Network Support
- Create and pay Lightning invoices, manage Spark accounts
- [See details & examples](api/lightning-network.md)

**Key Methods:**
- `createLightningInvoice({ value, memo }): Promise<Invoice>`
- `payLightningInvoice({ invoice, maxFeeSats }): Promise<Payment>`

| Method | Parameters | Returns |
|--------|------------|---------|
| createLightningInvoice | { value, memo } | Promise<Invoice> |
| payLightningInvoice | { invoice, maxFeeSats } | Promise<Payment> |

## Cross-Chain Operations
- Bridge tokens and assets between blockchains
- [See details & examples](api/cross-chain-operations.md)

**Key Methods:**
- `quoteBridge(blockchain, index, params): Promise<Quote>`
- `executeBridge(blockchain, index, quote): Promise<TxReceipt>`
- `getSingleUseDepositAddress(): Promise<string>`
- `sendTransaction({ to, value }): Promise<TxReceipt>`
- `withdraw({ onchainAddress, amountSats, exitSpeed }): Promise<Withdrawal>`

| Method | Parameters | Returns |
|--------|------------|---------|
| quoteBridge | blockchain, index, params | Promise<Quote> |
| executeBridge | blockchain, index, quote | Promise<TxReceipt> |
| getSingleUseDepositAddress |  | Promise<string> |
| sendTransaction | { to, value } | Promise<TxReceipt> |
| withdraw | { onchainAddress, amountSats, exitSpeed } | Promise<Withdrawal> |

## Account Abstraction Features
- Gasless transactions, flexible fee payments, and more
- [See details & examples](api/account-abstraction.md)

**Key Methods:**
- `quoteTransfer(..., { paymasterToken, ... })`

---

## Common Patterns
- Always `quote` before `execute` for transactions.
- Use `getAccount` and `getAbstractedAddress` to manage accounts across chains.

## Error Handling
- All async methods throw on error. Use `try/catch` for robust error handling.
- Inspect error messages for details on network, config, or validation issues.

---

For conceptual background, see [Core Concepts](../core-concepts.md). 