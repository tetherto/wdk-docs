# API Reference: Protocol Base Contracts

Protocol contracts are provided by `@tetherto/wdk-wallet/protocols`.

{% code title="Imports" lineNumbers="true" %}
```ts
import {
  SwapProtocol, ISwapProtocol,
  BridgeProtocol, IBridgeProtocol,
  LendingProtocol, ILendingProtocol
} from '@tetherto/wdk-wallet/protocols'
```
{% endcode %}

## Swap

- Class: `SwapProtocol` (abstract), Interface: `ISwapProtocol`
- Constructor: `(account: IWalletAccountReadOnly | IWalletAccount, config?: SwapProtocolConfig)`
- Methods:
  - `quoteSwap(options: SwapOptions): Promise<Omit<SwapResult,'hash'>>`
  - `swap(options: SwapOptions): Promise<SwapResult>`
- Types (high‑level):
  - `SwapProtocolConfig = { swapMaxFee?: number | bigint }`
  - `SwapOptions = { tokenIn, tokenOut, to? } & ( { tokenOutAmount } | { tokenInAmount } )`
  - `SwapResult = { hash: string, fee: bigint, tokenInAmount: bigint, tokenOutAmount: bigint }`

## Bridge

- Class: `BridgeProtocol` (abstract), Interface: `IBridgeProtocol`
- Constructor: `(account: IWalletAccountReadOnly | IWalletAccount, config?: BridgeProtocolConfig)`
- Methods:
  - `quoteBridge(options: BridgeOptions): Promise<Omit<BridgeResult,'hash'>>`
  - `bridge(options: BridgeOptions): Promise<BridgeResult>`
- Types (high‑level):
  - `BridgeProtocolConfig = { bridgeMaxFee?: number | bigint }`
  - `BridgeOptions = { targetChain: string, recipient: string, token: string, amount: number | bigint }`
  - `BridgeResult = { hash: string, fee: bigint, bridgeFee: bigint }`

## Lending

- Class: `LendingProtocol` (abstract), Interface: `ILendingProtocol`
- Constructor: `(account: IWalletAccountReadOnly | IWalletAccount)`
- Methods:
  - `quoteSupply(options: SupplyOptions) -> costs`
  - `supply(options: SupplyOptions) -> result`
  - `quoteWithdraw(options: WithdrawOptions) -> costs`
  - `withdraw(options: WithdrawOptions) -> result`
  - `quoteBorrow(options: BorrowOptions) -> costs`
  - `borrow(options: BorrowOptions) -> result`
  - `quoteRepay(options: RepayOptions) -> costs`
  - `repay(options: RepayOptions) -> result`
- Types (high‑level):
  - `SupplyOptions = { token, amount, onBehalfOf? }`, `SupplyResult = { hash, fee }`
  - `WithdrawOptions = { token, amount, to? }`, `WithdrawResult = { hash, fee }`
  - `BorrowOptions = { token, amount, onBehalfOf? }`, `BorrowResult = { hash, fee }`
  - `RepayOptions = { token, amount, onBehalfOf? }`, `RepayResult = { hash, fee }`

## Minimal example

{% code title="Swap protocol skeleton (TS)" lineNumbers="true" %}
```ts
import { SwapProtocol, ISwapProtocol } from '@tetherto/wdk-wallet/protocols'

export default class MySwap extends SwapProtocol implements ISwapProtocol {
  async quoteSwap (o) { return { fee: 0n, tokenInAmount: 0n, tokenOutAmount: 0n } }
  async swap (o) { return { hash: '0x', fee: 0n, tokenInAmount: 0n, tokenOutAmount: 0n } }
}
```
{% endcode %}

## See also

- Development Guide: [guide.md](./guide.md)
- Configuration: [configuration.md](./configuration.md)
- Wallet accounts and core concepts: [wdk-wallet](https://github.com/tetherto/wdk-wallet/)
