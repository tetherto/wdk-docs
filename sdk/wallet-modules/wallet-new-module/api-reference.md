---
title: "API Reference: Base Methods"
description: "Core methods are provided by @tetherto/wdk-wallet."
icon: code
layout:
  width: default
  title:
    visible: true
  description:
    visible: true
  tableOfContents:
    visible: true
  outline:
    visible: true
  pagination:
    visible: false
  metadata:
    visible: false
---

# API Reference: Base Methods

Core methods are provided by `@tetherto/wdk-wallet`.

{% code title="Import base methods" lineNumbers="true" %}
```ts
import WalletManager, {
  WalletAccountReadOnly,
  IWalletAccount,
  IWalletAccountReadOnly,
  NotImplementedError
} from '@tetherto/wdk-wallet'
```
{% endcode %}

## WalletManager (default export)

Abstract manager for chain‑specific wallets.

- `constructor(seed: string | Uint8Array, config?: WalletConfig)`
- `static getRandomSeedPhrase(): string`
- `static isValidSeedPhrase(seedPhrase: string): boolean`
- `get seed: Uint8Array`
- `getAccount(index?: number): Promise<IWalletAccount>` (abstract)
- `getAccountByPath(path: string): Promise<IWalletAccount>` (abstract)
- `getFeeRates(): Promise<FeeRates>` (abstract)
- `dispose(): void`

Types:
- `type WalletConfig = { transferMaxFee?: number | bigint }`
- `type FeeRates = { normal: bigint; fast: bigint }`

## IWalletAccountReadOnly

Read‑only view of an account.

- `getAddress(): Promise<string>`
- `getBalance(): Promise<bigint>`
- `getTokenBalance(tokenAddress: string): Promise<bigint>`
- `quoteSendTransaction(tx: Transaction): Promise<Omit<TransactionResult, 'hash'>>`
- `quoteTransfer(options: TransferOptions): Promise<Omit<TransferResult, 'hash'>>`
- `getTransactionReceipt(hash: string): Promise<unknown | null>`

Types:
- `type Transaction = { to: string; value: number | bigint }`
- `type TransactionResult = { hash: string; fee: bigint }`
- `type TransferOptions = { token: string; recipient: string; amount: number | bigint }`
- `type TransferResult = { hash: string; fee: bigint }`

## IWalletAccount (extends IWalletAccountReadOnly)

Writable account with signing and transfer capabilities.

- `get index(): number`
- `get path(): string` (e.g., BIP‑44)
- `get keyPair(): { publicKey: Uint8Array; privateKey: Uint8Array | null }`
- `sign(message: string): Promise<string>`
- `verify(message: string, signature: string): Promise<boolean>`
- `sendTransaction(tx: Transaction): Promise<TransactionResult>`
- `transfer(options: TransferOptions): Promise<TransferResult>`
- `toReadOnlyAccount(): Promise<IWalletAccountReadOnly>`
- `dispose(): void`

## Example: Implementing a Wallet

{% code title="Minimal skeleton (TypeScript)" lineNumbers="true" %}
```ts
import WalletManager, { WalletAccountReadOnly, IWalletAccount } from '@tetherto/wdk-wallet'

class MyAccount extends WalletAccountReadOnly implements IWalletAccount {
  get index() { return 0 }
  get path() { return "m/44'/1337'/0'/0/0" }
  get keyPair() { return { publicKey: new Uint8Array(), privateKey: new Uint8Array() } }

  async getBalance() { return 0n }
  async getTokenBalance(a: string) { return 0n }
  async quoteSendTransaction(tx: { to: string; value: number | bigint }) { return { fee: 0n } }
  async quoteTransfer(o: { token: string; recipient: string; amount: number | bigint }) { return { fee: 0n } }
  async getTransactionReceipt(h: string) { return null }

  async sign(m: string) { return '0x' }
  async verify(m: string, s: string) { return true }
  async sendTransaction(tx: { to: string; value: number | bigint }) { return { hash: '0x', fee: 0n } }
  async transfer(o: { token: string; recipient: string; amount: number | bigint }) { return { hash: '0x', fee: 0n } }
  async toReadOnlyAccount() { return this }
  dispose() {}
}

export default class MyWalletManager extends WalletManager {
  async getAccount(index = 0) { return new MyAccount() }
  async getAccountByPath(path: string) { return new MyAccount() }
  async getFeeRates() { return { normal: 1n, fast: 2n } }
}
```
{% endcode %}

## See Also

- Development Guide: [guide.md](./guide.md)
- Structure & CI: [configuration.md](./configuration.md)
- Concepts and unified interfaces: [Get Started](../../get-started.md#creating-custom-modules)
