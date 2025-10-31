---
title: Wallet Module Development Guide
description: This guide walks you through building a new WDK wallet module by leveraging `@tetherto/wdk-wallet` base methods.
icon: book-open
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

# Wallet Module Development Guide

This guide walks you through building a new WDK wallet module by leveraging [`@tetherto/wdk-wallet`](https://github.com/tetherto/wdk-wallet).

{% hint style="info" %}
If you plan to submit your module for official inclusion, keep dependencies minimal and confirm bare runtime compatibility or a remediation plan.
{% endhint %}

{% stepper %}
{% step %}
### 1) Create package skeleton

```
wallet-<chain>/
├─ bare.js
├─ index.js
├─ package.json
├─ tsconfig.json
├─ README.md
├─ LICENSE
├─ types/
│  └─ index.d.ts
└─ src/
   ├─ manager.js
   ├─ account-read-only.js
   └─ account.js
```

- Name: `@wdk/wallet-<chain>` (e.g., `@wdk/wallet-zcash`)
- Keep dependencies minimal and bare‑compatible
- Add scripts for lint, type‑check, test
{% endstep %}

{% step %}
### 2) Implement Read‑Only Account

Extend `WalletAccountReadOnly` to implement read‑only methods first.

{% tabs %}
{% tab title="TypeScript" %}
{% code title="src/account-read-only.ts" lineNumbers="true" %}
```typescript
import { WalletAccountReadOnly } from '@tetherto/wdk-wallet'

export default class ZecAccountReadOnly extends WalletAccountReadOnly {
  async getBalance(): Promise<bigint> { /* fetch native balance */ return 0n }
  async getTokenBalance(token: string): Promise<bigint> { /* fetch token */ return 0n }
  async quoteSendTransaction(tx: { to: string; value: number | bigint }) { return { fee: 0n } }
  async quoteTransfer(o: { token: string; recipient: string; amount: number | bigint }) { return { fee: 0n } }
  async getTransactionReceipt(hash: string) { return null }
}
```
{% endcode %}
{% endtab %}

{% tab title="JavaScript" %}
{% code title="src/account-read-only.js" lineNumbers="true" %}
```javascript
import { WalletAccountReadOnly } from '@tetherto/wdk-wallet'

export default class ZecAccountReadOnly extends WalletAccountReadOnly {
  async getBalance () { return 0n }
  async getTokenBalance (token) { return 0n }
  async quoteSendTransaction (tx) { return { fee: 0n } }
  async quoteTransfer (o) { return { fee: 0n } }
  async getTransactionReceipt (hash) { return null }
}
```
{% endcode %}
{% endtab %}
{% endtabs %}
{% endstep %}

{% step %}
### 3) Implement Full Account (Writable)

Create a concrete account that fulfills `IWalletAccount` by extending your read‑only account.

{% tabs %}
{% tab title="TypeScript" %}
{% code title="src/account.ts" lineNumbers="true" %}
```typescript
import { IWalletAccount } from '@tetherto/wdk-wallet'
import ZecAccountReadOnly from './account-read-only'

export default class ZecAccount extends ZecAccountReadOnly implements IWalletAccount {
  get index() { return 0 }
  get path() { return "m/44'/1337'/0'/0/0" }
  get keyPair() { return { publicKey: new Uint8Array(), privateKey: new Uint8Array() } }

  async sign(message: string) { return '0x' }
  async verify(message: string, signature: string) { return true }
  async sendTransaction(tx: { to: string; value: number | bigint }) { return { hash: '0x', fee: 0n } }
  async transfer(o: { token: string; recipient: string; amount: number | bigint }) { return { hash: '0x', fee: 0n } }
  async toReadOnlyAccount() { return new ZecAccountReadOnly(await this.getAddress()) }
  dispose() { /* wipe privateKey */ }
}
```
{% endcode %}
{% endtab %}

{% tab title="JavaScript" %}
{% code title="src/account.js" lineNumbers="true" %}
```javascript
import ZecAccountReadOnly from './account-read-only.js'

export default class ZecAccount extends ZecAccountReadOnly {
  get index () { return 0 }
  get path () { return "m/44'/1337'/0'/0/0" }
  get keyPair () { return { publicKey: new Uint8Array(), privateKey: new Uint8Array() } }

  async sign (message) { return '0x' }
  async verify (message, signature) { return true }
  async sendTransaction (tx) { return { hash: '0x', fee: 0n } }
  async transfer (o) { return { hash: '0x', fee: 0n } }
  async toReadOnlyAccount () { return new ZecAccountReadOnly(await this.getAddress()) }
  dispose () { /* wipe privateKey */ }
}
```
{% endcode %}
{% endtab %}
{% endtabs %}
{% endstep %}

{% step %}
### 4) Implement Wallet Manager

Extend the default `WalletManager` and return your accounts. Cache them in `this._accounts` and implement fee quotes.

{% tabs %}
{% tab title="TypeScript" %}
{% code title="src/manager.ts" lineNumbers="true" %}
```typescript
import WalletManager from '@tetherto/wdk-wallet'
import ZecAccount from './account'

export default class ZecWalletManager extends WalletManager {
  async getAccount(index = 0) {
    const path = `m/44'/1337'/0'/0/${index}`
    if (!this._accounts[path]) this._accounts[path] = new ZecAccount(/* ... */)
    return this._accounts[path]
  }

  async getAccountByPath(path: string) {
    if (!this._accounts[path]) this._accounts[path] = new ZecAccount(/* ... */)
    return this._accounts[path]
  }

  async getFeeRates() { return { normal: 1n, fast: 2n } }
}
```
{% endcode %}
{% endtab %}

{% tab title="JavaScript" %}
{% code title="src/manager.js" lineNumbers="true" %}
```javascript
import WalletManager from '@tetherto/wdk-wallet'
import ZecAccount from './account.js'

export default class ZecWalletManager extends WalletManager {
  async getAccount (index = 0) {
    const path = `m/44'/1337'/0'/0/${index}`
    if (!this._accounts[path]) this._accounts[path] = new ZecAccount()
    return this._accounts[path]
  }

  async getAccountByPath (path) {
    if (!this._accounts[path]) this._accounts[path] = new ZecAccount()
    return this._accounts[path]
  }

  async getFeeRates () { return { normal: 1n, fast: 2n } }
}
```
{% endcode %}
{% endtab %}
{% endtabs %}
{% endstep %}

{% step %}
### 5) Wire exports and types

{% tabs %}
{% tab title="index.js" %}
{% code title="index.js" lineNumbers="true" %}
```javascript
export { default } from './src/manager.js'
```
{% endcode %}
{% endtab %}

{% tab title="types/index.d.ts" %}
{% code title="types/index.d.ts" lineNumbers="true" %}
```ts
import type WalletManager from '@tetherto/wdk-wallet'
import type { IWalletAccount, IWalletAccountReadOnly, Transaction, TransactionResult, TransferOptions, TransferResult } from '@tetherto/wdk-wallet'

export default class ZecWalletManager extends (WalletManager as { new(seed: string | Uint8Array, config?: any): any }) {}
export type { IWalletAccount, IWalletAccountReadOnly, Transaction, TransactionResult, TransferOptions, TransferResult }
```
{% endcode %}
{% endtab %}
{% endtabs %}
{% endstep %}

{% step %}
### 6) Run in bare and test

{% code title="bare.js" lineNumbers="true" %}
```javascript
import ZecWalletManager from './index.js'

const seed = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
const wallet = new ZecWalletManager(seed, { /* provider, chain params */ })

const account = await wallet.getAccount(0)
console.log('address:', await account.getAddress())
console.log('balance:', await account.getBalance())
```
{% endcode %}

If anything fails due to missing APIs in the bare runtime, document the dependency and contact the Holepunch/WDK team for a path to support.
{% endstep %}
{% endstepper %}
