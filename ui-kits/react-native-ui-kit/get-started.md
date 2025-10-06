---
title: Get Started
description: Quick start guide for the WDK React Native UI Kit
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

# Get Started

Build production-quality wallet interfaces with the WDK React Native UI Kit. This guide will get you up and running in minutes.

***

## About the UI Kit

The WDK React Native UI Kit provides ready-made, themeable components for building wallet applications. It's designed to work seamlessly with the WDK SDK and offers:

- **Ready-made wallet building blocks**: amount input, asset selector, address input, QR code, balance, transaction lists, seed phrase components
- **Themeable out of the box**: light/dark modes, brand colors, `ThemeProvider` and `useTheme` API
- **Type-safe and documented**: Excellent developer experience with TypeScript support
- **Composable and unopinionated**: No business logic; wire in your own data/state from WDK
- **Mobile-first**: React Native primitives with sensible defaults and accessible touch targets

***

## Installation

Install the UI Kit package:

```bash
npm install @tetherto/wdk-uikit-react-native
```

***

## Quick Start

### Basic Setup

Wrap your app with the theme provider and render a simple component:

{% code title="Basic Setup" lineNumbers="true" %}
```tsx
import { ThemeProvider, lightTheme, TransactionList } from '@tetherto/wdk-uikit-react-native'

export default function App() {
  const transactions = [
    { 
      id: '1', 
      token: 'USDT', 
      amount: '10.00', 
      fiatAmount: '10.00', 
      fiatCurrency: 'USD', 
      network: 'Ethereum', 
      type: 'received' 
    }
  ]

  return (
    <ThemeProvider initialTheme={lightTheme}>
      <TransactionList transactions={transactions} />
    </ThemeProvider>
  )
}
```
{% endcode %}

***

## Integration with WDK

### Connecting WDK Data to UI Components

Here's how to wire WDK data into the UI components:

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

### Using Built-in Themes

The UI Kit comes with built-in light and dark themes:

{% code title="Built-in Themes" lineNumbers="true" %}
```tsx
import { ThemeProvider, lightTheme, darkTheme } from '@tetherto/wdk-uikit-react-native'

export function App() {
  return (
    <ThemeProvider initialTheme={lightTheme}>
      {/* Your app content */}
    </ThemeProvider>
  )
}

// Or use dark theme
export function AppDark() {
  return (
    <ThemeProvider initialTheme={darkTheme}>
      {/* Your app content */}
    </ThemeProvider>
  )
}
```
{% endcode %}

### Creating Brand Themes

Create custom themes from your brand colors:

{% code title="Brand Theme Creation" lineNumbers="true" %}
```tsx
import { 
  ThemeProvider, 
  createThemeFromBrand 
} from '@tetherto/wdk-uikit-react-native'

const brandTheme = createThemeFromBrand({
  primaryColor: '#0F62FE',
  secondaryColor: '#6F6F6F',
  fontFamily: { 
    regular: 'System', 
    bold: 'System' 
  },
}, 'light')

export function App() {
  return (
    <ThemeProvider initialTheme={brandTheme}>
      {/* Your branded app */}
    </ThemeProvider>
  )
}
```
{% endcode %}

### Using Theme in Components

Access theme values anywhere in your components:

{% code title="Using Theme Hook" lineNumbers="true" %}
```tsx
import { useTheme } from '@tetherto/wdk-uikit-react-native'

export function CustomComponent() {
  const theme = useTheme()
  
  return (
    <View style={{ 
      backgroundColor: theme.colors.background,
      padding: theme.spacing.md 
    }}>
      <Text style={{ color: theme.colors.text }}>
        Themed content
      </Text>
    </View>
  )
}
```
{% endcode %}

***

## Common Patterns

### Transaction List with Real Data

{% code title="Transaction List Pattern" lineNumbers="true" %}
```tsx
import { TransactionList, TransactionItem } from '@tetherto/wdk-uikit-react-native'

export function TransactionHistory({ transactions, onTransactionPress }) {
  return (
    <TransactionList 
      transactions={transactions}
      onTransactionPress={onTransactionPress}
    />
  )
}
```
{% endcode %}

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

### Asset Selection

{% code title="Asset Selection Pattern" lineNumbers="true" %}
```tsx
import { AssetSelector } from '@tetherto/wdk-uikit-react-native'

export function AssetPicker({ tokens, recentTokens, onSelectToken }) {
  return (
    <AssetSelector
      tokens={tokens}
      recentTokens={recentTokens}
      onSelectToken={onSelectToken}
    />
  )
}
```
{% endcode %}

***

## Next Steps

- [Components List](components.md) - Explore all available components
- [Theming Guide](theming.md) - Deep dive into theming capabilities
- [React Native Starter](https://github.com/tetherto/wdk-starter-react-native) - See a complete implementation

***

## Need Help?

{% include "../../.gitbook/includes/support-cards.md" %}

