---
title: Get Started
description: Learn about the WDK React Native UI Kit and how to get started
icon: rocket
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

The WDK React Native UI Kit provides ready-made, themeable components for building wallet applications. It's designed to work seamlessly with the SDK and offers:

* **Ready-made wallet building blocks**: amount input, asset selector, address input, QR code, balance, transaction lists, seed phrase components
* **Themeable out of the box**: light/dark modes, brand colors, `ThemeProvider` and `useTheme` API
* **Type-safe and documented**: Excellent developer experience with TypeScript support
* **Composable and unopinionated**: No business logic; wire in your own data/state from WDK
* **Mobile-first**: React Native primitives with sensible defaults and accessible touch targets

***

## Installation

Install the UI Kit package:

```bash
npm install @tetherto/wdk-uikit-react-native
```

***

## Quick Start

Wrap your app with the theme provider and render a simple component:

{% code title="Basic Setup" lineNumbers="true" %}
```tsx
import { ThemeProvider, lightTheme, TransactionList } from '@tetherto/wdk-uikit-react-native'

export default function App() {
  const transactions = [ /* your transactions */ ]

  return (
    <ThemeProvider initialTheme={lightTheme}>
      <TransactionList transactions={transactions} />
    </ThemeProvider>
  )
}
```
{% endcode %}

***

## Component List

| Component | Description |
| --- | --- |
| [`AmountInput`](api-reference.md#amountinput) | Numeric input with token/fiat toggle, balance helper and Max action |
| [`AssetSelector`](api-reference.md#assetselector) | Token search & pick list with recent items and empty states |
| [`NetworkSelector`](api-reference.md#networkselector) | Network picker with gas level indicators and colors |
| [`Balance`](api-reference.md#balance) | Displays a balance value with optional masking and custom loader |
| [`CryptoAddressInput`](api-reference.md#cryptoaddressinput) | Address input with QR scan and paste helpers, validation state |
| [`QRCode`](api-reference.md#qrcode) | QR renderer for addresses/payment requests with labeling and styling |
| [`TransactionItem`](api-reference.md#transactionitem) | Single transaction row (sent/received) with token, amounts, network |
| [`TransactionList`](api-reference.md#transactionlist) | Virtualized list of transactions using `TransactionItem` |
| [`SeedPhrase`](api-reference.md#seedphrase) | Grid of seed words with optional editing and loading states |

***

## Integration with WDK

Components are designed to work seamlessly with WDK data models. Here's an example of how to wire WDK data into the UI components:

{% code title="WDK Integration Example" lineNumbers="true" %}
```tsx
import * as React from 'react'
import WDK from '@tetherto/wdk'
import WalletManagerEvm from '@tetherto/wdk-wallet-evm'
import WalletManagerBtc from '@tetherto/wdk-wallet-btc'
import { 
  ThemeProvider, 
  lightTheme, 
  Balance, 
  CryptoAddressInput, 
  AmountInput 
} from '@tetherto/wdk-uikit-react-native'

export function WalletScreen() {
  const [balance, setBalance] = React.useState<number | null>(null)
  const [amount, setAmount] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function bootstrap() {
      try {
        const wdkWithWallets = new WDK('your seed phrase')
          .registerWallet('bitcoin', WalletManagerBtc, { 
            provider: 'https://blockstream.info/api' 
          })

        const account = await wdkWithWallets.getAccount('bitcoin', 0)
        const balance = await account.getBalance()

        setBalance(balance)
      } catch (e: any) {
        setError(e?.message ?? 'Unknown error')
      }
    }

    bootstrap()
  }, [])

  return (
    <ThemeProvider initialTheme={lightTheme}>
      <CryptoAddressInput 
        onQRScan={() => {/* Handle QR scan */}} 
      />
      <AmountInput
        label="Enter Amount"
        tokenSymbol="BTC"
        value={amount}
        onChangeText={setAmount}
        tokenBalance={balance?.toString() ?? '0'}
        inputMode={'token'}
        onUseMax={() => setAmount(balance?.toString() ?? '0')}
      />
      <Balance value={balance ?? 0} currency="BTC" />
    </ThemeProvider>
  )
}
```
{% endcode %}

***

## Theming

The UI Kit provides a comprehensive theming system that allows you to use built-in light and dark themes, create custom brand themes from your colors and fonts, customize individual components with fine-grained control, and access theme values anywhere in your application. You can also switch themes dynamically based on user preferences.

For detailed theming documentation, including brand integration, custom themes, component customization, and advanced usage patterns, see the [Theming Guide](theming.md).

***

## Common Patterns

### Address Input with Validation

{% code title="Address Input Pattern" lineNumbers="true" %}
```tsx
import { CryptoAddressInput } from '@tetherto/wdk-uikit-react-native'

export function SendScreen() {
  const [address, setAddress] = React.useState('')
  const [error, setError] = React.useState('')

  const validateAddress = (addr: string) => {
    // Add your validation logic
    if (!addr.startsWith('T') && !addr.startsWith('0x')) {
      setError('Invalid address format')
    } else {
      setError('')
    }
  }

  return (
    <CryptoAddressInput
      value={address}
      onChangeText={(text) => {
        setAddress(text)
        validateAddress(text)
      }}
      error={error}
      onQRScan={() => {/* Open QR scanner */}}
    />
  )
}
```
{% endcode %}

***

## Next Steps

* [Components List](./api-reference.md) - Complete API reference for all components
* [Theming Guide](theming.md) - Deep dive into theming capabilities
* [React Native Starter](../../start-building/react-native-quickstart.md) - See a complete implementation

***

## Need Help?

{% include "../../.gitbook/includes/support-cards.md" %}
