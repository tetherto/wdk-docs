# Protocol Module Development Guide

This guide shows how to build swap, bridge, and lending protocol modules using the base contracts in `@tetherto/wdk-wallet/protocols`.

{% hint style="info" %}
Implementations should keep dependencies minimal. Bare runtime compatibility is required for official inclusion; otherwise provide an agreed plan.
{% endhint %}

{% stepper %}
{% step %}
### 1) Choose a naming and skeleton

```
protocol-<type>-<chain>/
├─ index.js
├─ package.json
├─ tsconfig.json
├─ README.md
├─ LICENSE
├─ types/
│  └─ index.d.ts
└─ src/
   └─ protocol.js
```

Examples:
- `@wdk/protocol-swap-velora-evm`
- `@wdk/protocol-bridge-usdt0-ton`
- `@wdk/protocol-lending-aave-evm`
{% endstep %}

{% step %}
### 2) Inject an account (read‑only or writable)

All protocol classes are constructed with a wallet account – read‑only works for quoting; writable is needed to execute.

```ts
// account: IWalletAccountReadOnly for quotes, IWalletAccount for execute
const protocol = new MySwap(account, { /* config */ })
```
{% endstep %}

{% step %}
### 3) Implement a Swap protocol

{% tabs %}
{% tab title="TypeScript" %}
{% code title="src/protocol.ts" lineNumbers="true" %}
```ts
import { SwapProtocol, ISwapProtocol } from '@tetherto/wdk-wallet/protocols'

export default class VeloraSwap extends SwapProtocol implements ISwapProtocol {
  async quoteSwap (options) {
    // return { fee, tokenInAmount, tokenOutAmount }
    return { fee: 0n, tokenInAmount: 0n, tokenOutAmount: 0n }
  }

  async swap (options) {
    // perform swap and return { hash, fee, tokenInAmount, tokenOutAmount }
    return { hash: '0x', fee: 0n, tokenInAmount: 0n, tokenOutAmount: 0n }
  }
}
```
{% endcode %}
{% endtab %}

{% tab title="JavaScript" %}
{% code title="src/protocol.js" lineNumbers="true" %}
```js
import { SwapProtocol } from '@tetherto/wdk-wallet/protocols'

export default class VeloraSwap extends SwapProtocol {
  async quoteSwap (options) { return { fee: 0n, tokenInAmount: 0n, tokenOutAmount: 0n } }
  async swap (options) { return { hash: '0x', fee: 0n, tokenInAmount: 0n, tokenOutAmount: 0n } }
}
```
{% endcode %}
{% endtab %}
{% endtabs %}
{% endstep %}

{% step %}
### 4) Implement a Bridge protocol

{% tabs %}
{% tab title="TypeScript" %}
{% code title="src/protocol.ts" lineNumbers="true" %}
```ts
import { BridgeProtocol, IBridgeProtocol } from '@tetherto/wdk-wallet/protocols'

export default class Usdt0BridgeTon extends BridgeProtocol implements IBridgeProtocol {
  async quoteBridge (options) {
    // return { fee, bridgeFee }
    return { fee: 0n, bridgeFee: 0n }
  }

  async bridge (options) {
    // perform bridge and return { hash, fee, bridgeFee }
    return { hash: '0x', fee: 0n, bridgeFee: 0n }
  }
}
```
{% endcode %}
{% endtab %}

{% tab title="JavaScript" %}
{% code title="src/protocol.js" lineNumbers="true" %}
```js
import { BridgeProtocol } from '@tetherto/wdk-wallet/protocols'

export default class Usdt0BridgeTon extends BridgeProtocol {
  async quoteBridge (options) { return { fee: 0n, bridgeFee: 0n } }
  async bridge (options) { return { hash: '0x', fee: 0n, bridgeFee: 0n } }
}
```
{% endcode %}
{% endtab %}
{% endtabs %}
{% endstep %}

{% step %}
### 5) Implement a Lending protocol

{% tabs %}
{% tab title="TypeScript" %}
{% code title="src/protocol.ts" lineNumbers="true" %}
```ts
import { LendingProtocol, ILendingProtocol } from '@tetherto/wdk-wallet/protocols'

export default class AaveEvm extends LendingProtocol implements ILendingProtocol {
  async quoteSupply (o) { return { fee: 0n } }
  async supply (o) { return { hash: '0x', fee: 0n } }

  async quoteWithdraw (o) { return { fee: 0n } }
  async withdraw (o) { return { hash: '0x', fee: 0n } }

  async quoteBorrow (o) { return { fee: 0n } }
  async borrow (o) { return { hash: '0x', fee: 0n } }

  async quoteRepay (o) { return { fee: 0n } }
  async repay (o) { return { hash: '0x', fee: 0n } }
}
```
{% endcode %}
{% endtab %}

{% tab title="JavaScript" %}
{% code title="src/protocol.js" lineNumbers="true" %}
```js
import { LendingProtocol } from '@tetherto/wdk-wallet/protocols'

export default class AaveEvm extends LendingProtocol {
  async quoteSupply (o) { return { fee: 0n } }
  async supply (o) { return { hash: '0x', fee: 0n } }
  async quoteWithdraw (o) { return { fee: 0n } }
  async withdraw (o) { return { hash: '0x', fee: 0n } }
  async quoteBorrow (o) { return { fee: 0n } }
  async borrow (o) { return { hash: '0x', fee: 0n } }
  async quoteRepay (o) { return { fee: 0n } }
  async repay (o) { return { hash: '0x', fee: 0n } }
}
```
{% endcode %}
{% endtab %}
{% endtabs %}
{% endstep %}

{% step %}
### 6) Exports and types

{% tabs %}
{% tab title="index.js" %}
{% code title="index.js" lineNumbers="true" %}
```js
export { default } from './src/protocol.js'
```
{% endcode %}
{% endtab %}

{% tab title="types/index.d.ts" %}
{% code title="types/index.d.ts" lineNumbers="true" %}
```ts
export { } // re‑export your public types if needed
```
{% endcode %}
{% endtab %}
{% endtabs %}
{% endstep %}

{% step %}
### 7) Test locally

Use a writable account to execute; use read‑only to quote.

```js
import Protocol from './index.js'
const protocol = new Protocol(account, { /* config */ })
console.log(await protocol.quoteSwap?.({ tokenIn: '...', tokenOut: '...', tokenOutAmount: 1n }))
```

If anything fails due to missing APIs in the bare runtime, document the dependency and contact the Holepunch/WDK team for a path to support.
{% endstep %}
{% endstepper %}
