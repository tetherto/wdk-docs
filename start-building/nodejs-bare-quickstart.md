---
title: Node.js & Bare Runtime Quickstart
description: Get started with WDK in Node.js or Bare runtime environments in 3 minutes
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
    visible: true
  metadata:
    visible: false
---

# Node.js & Bare Quickstart

## What You'll Build

In this quickstart, you'll create a simple application that:

* [ ] Sets up WDK with multiple blockchain wallets (EVM, Bitcoin, TRON)
* [ ] Generates a new secret phrase (seed phrase)
* [ ] Resolves addresses across different chains
* [ ] Checks balances and estimates transaction costs
* [ ] Sends transactions on multiple blockchains

***

## Prerequisites

Before we start, make sure you have:

{% tabs %}
{% tab title="Node.js" %}
| Tool            | Version | Why You Need It        |
| --------------- | ------- | ---------------------- |
| **Node.js**     | 20+     | To run JavaScript code |
| **npm**         | Latest  | To install packages    |
| **Code Editor** | Any     | To write code          |
{% endtab %}

{% tab title="Bare Runtime" %}
| Tool             | Version | Why You Need It     |
| ---------------- | ------- | ------------------- |
| **Bare Runtime** | >= 1.23.5  | To run JavaScript   |
| **npm**          | Latest  | To install packages |
| **Code Editor**  | Any     | To write code       |

To install Bare runtime first include to the `package.json`:

```
"type": "module"
```

and run the command `npm i -g bare`

{% endtab %}
{% endtabs %}

<!-- **Note**: We'll use testnets for this tutorial, so you don't need real funds to get started! -->

***

## Step 1: Set Up Your Project

First, we need to create a folder and initialize the project

```bash
mkdir wdk-quickstart && cd wdk-quickstart && npm init -y
```

Then install necessary WDK modules

```bash
npm install @tetherto/wdk @tetherto/wdk-wallet-evm @tetherto/wdk-wallet-tron @tetherto/wdk-wallet-btc
```

{% hint style="info" %}
Learn more about WDK modules:

* [**@tetherto/wdk**](../sdk/core-module/README.md) - The main SDK module
* [**@tetherto/wdk-wallet-evm**](../sdk/wallet-modules/wallet-evm/README.md) - Ethereum and EVM-compatible chains support
* [**@tetherto/wdk-wallet-tron**](../sdk/wallet-modules/wallet-tron/README.md) - TRON blockchain support
* [**@tetherto/wdk-wallet-btc**](../sdk/wallet-modules/wallet-btc/README.md) - Bitcoin blockchain support
{% endhint %}

***

## Step 2: Create Your First Wallet

Create a file called `app.js`:

{% code title="app.js" lineNumbers="true" %}
```javascript
import WDK from '@tetherto/wdk'
import WalletManagerEvm from '@tetherto/wdk-wallet-evm'
import WalletManagerTron from '@tetherto/wdk-wallet-tron'
import WalletManagerBtc from '@tetherto/wdk-wallet-btc'

async function main() {
  console.log('Starting WDK App...')
  
  try {
    // Your code will go here
  } catch (error) {
    console.error('Application error:', error.message)
    process.exit(1)
  }
}

// Run the application
main()
```
{% endcode %}

Now, add the following code to generate a seed phrase:

{% code title="app.js" lineNumbers="true" %}
```typescript
  try {
    const seedPhrase = WDK.getRandomSeedPhrase()
    console.log('Generated seed phrase:', seedPhrase)
  } catch (error) {
    console.error('Application error:', error.message)
  }
```
{% endcode %}

Now, let's register wallets for different blockchains:

{% code title="app.js" lineNumbers="true" %}
```typescript
// Add this code after the seed phrase generation
console.log('Registering wallets...')

const wdkWithWallets = new WDK(seedPhrase)
  .registerWallet('ethereum', WalletManagerEvm, {
    provider: 'https://eth.drpc.org'
  })
  .registerWallet('tron', WalletManagerTron, {
    provider: 'https://api.trongrid.io'
  })
  .registerWallet('bitcoin', WalletManagerBtc, {
    provider: 'https://blockstream.info/api'
  })

console.log('Wallets registered for Ethereum, TRON, and Bitcoin')
```
{% endcode %}

{% hint style="info" %}
To learn more about configuring the wallet modules:
* [Configuring @tetherto/wdk-wallet-evm](../sdk/wallet-modules/wallet-evm/configuration.md)
* [Configuring @tetherto/wdk-wallet-tron](../sdk/wallet-modules/wallet-tron/configuration.md)
* [Configuring @tetherto/wdk-wallet-btc](../sdk/wallet-modules/wallet-btc/configuration.md)
{% endhint %}

***

## Step 3: Check Balances

To check balances, we first need to get accounts and addresses. Let's get accounts and addresses for all blockchains:

{% code title="app.js" lineNumbers="true" %}
```typescript
// Add this code after the wallet registration
console.log('Retrieving accounts...')

const accounts = {
  ethereum: await wdkWithWallets.getAccount('ethereum', 0),
  tron: await wdkWithWallets.getAccount('tron', 0),
  bitcoin: await wdkWithWallets.getAccount('bitcoin', 0)
}

console.log('Resolving addresses:')

for (const [chain, account] of Object.entries(accounts)) {
  const address = await account.getAddress()
  console.log(`   ${chain.toUpperCase()}: ${address}`)
}
```
{% endcode %}

Now, let's check balances across all chains:

```typescript
// Add this code after the address resolution
console.log('Checking balances...')

for (const [chain, account] of Object.entries(accounts)) {
    const balance = await account.getBalance()
    console.log(`   ${chain.toUpperCase()}: ${balance.toString()} units`)
}
```

Here is the complete `app.js` file:

{% code title="app.js" lineNumbers="true" %}
```javascript
import WDK from '@tetherto/wdk'
import WalletManagerEvm from '@tetherto/wdk-wallet-evm'
import WalletManagerTron from '@tetherto/wdk-wallet-tron'
import WalletManagerBtc from '@tetherto/wdk-wallet-btc'

async function main() {
  console.log('Starting WDK App...')
  
  try {
    const seedPhrase = WDK.getRandomSeedPhrase()
    console.log('Generated seed phrase:', seedPhrase)

    console.log('Registering wallets...')   

    const wdkWithWallets = new WDK(seedPhrase)
      .registerWallet('ethereum', WalletManagerEvm, {
        provider: 'https://eth.drpc.org'
      })
      .registerWallet('tron', WalletManagerTron, {
        provider: 'https://api.trongrid.io'
      })
      .registerWallet('bitcoin', WalletManagerBtc, {
        provider: 'https://blockstream.info/api'
      })

    console.log('Wallets registered for Ethereum, TRON, and Bitcoin')

    const accounts = {
      ethereum: await wdkWithWallets.getAccount('ethereum', 0),
      tron: await wdkWithWallets.getAccount('tron', 0),
      bitcoin: await wdkWithWallets.getAccount('bitcoin', 0)
    }

    console.log('Resolving addresses:')

    for (const [chain, account] of Object.entries(accounts)) {
      const address = await account.getAddress()
      console.log(`   ${chain.toUpperCase()}: ${address}`)
    }

    console.log('Checking balances...')

    for (const [chain, account] of Object.entries(accounts)) {
        const balance = await account.getBalance()
        console.log(`   ${chain.toUpperCase()}: ${balance.toString()} units`)
    }

    console.log('Application completed successfully!')
    process.exit(0)

  } catch (error) {
    console.error('Application error:', error.message)
    process.exit(1)
  }
}

// Run the application
main()
```
{% endcode %}

***

## Step 4: Run Your App

Execute your app:

{% tabs %}
{% tab title="Node.js" %}
```bash
node app.js
```
{% endtab %}

{% tab title="Bare Runtime" %}
```bash
bare app.js
```
{% endtab %}
{% endtabs %}

You should see an output similar to this:

```
Starting WDK App...
Generated seed phrase: abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about
Registering wallets...
Wallets registered for Ethereum, TRON, and Bitcoin
Resolving addresses:
   ETHEREUM: 0x742d35Cc6634C0532925a3b8D9C5c8b7b6e5f6e5
   TRON: TLyqzVGLV1srkB7dToTAEqgDSfPtXRJZYH
   BITCOIN: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa
Checking balances...
   ETHEREUM: 0 units
   TRON: 0 units
   BITCOIN: 0 units
Application completed successfully!
```

***

## What Just Happened?

**Congratulations!** You've successfully created your first multi-chain WDK application that works in both Node.js and Bare runtime environments. Here's what happened:

* [x] You generated a single seed phrase that works across all blockchains
* [x] You registered wallets for Ethereum, TRON, and Bitcoin
* [x] You created accounts derived from the same seed phrase using BIP-44
* [x] You used the same API to interact with different blockchains
* [x] You checked balances across multiple chains with consistent methods

***

## Next Steps

Now that you have a basic multi-chain wallet running, here's what you can explore:

### Add More Blockchains

For example, to add Solana support:

```bash
npm install @tetherto/wdk-wallet-solana
```

{% code lineNumbers="true" %}
```typescript
import WalletManagerSolana from '@tetherto/wdk-wallet-solana'

// New or existing WDK instance
const wdk = new WDK(seedPhrase)

wdk.registerWallet('solana', WalletManagerSolana, {
  provider: 'https://api.mainnet-beta.solana.com'
})

```
{% endcode %}

### Estimate Transaction Costs

{% code lineNumbers="true" %}
```typescript
for (const [chain, account] of Object.entries(accounts)) {
  try {
    const quote = await account.quoteSendTransaction({
      to: await account.getAddress(),
      value: chain === 'bitcoin' ? 100000000n : chain === 'tron' ? 1000000n : 1000000000000000000n
    })
    console.log(`   ${chain.toUpperCase()}: ${quote.fee.toString()} units`)
  } catch (error) {
    console.log(`   ${chain.toUpperCase()}: Unable to estimate`)
  }
}
```
{% endcode %}

### **Send Transactions**

{% code lineNumbers="true" %}
```typescript
const result = await ethAccount.sendTransaction({
  to: '0x742d35Cc6634C05...a3b8D9C5c8b7b6e5f6e5',
  value: 1000000000000000000n // 1 ETH
})

console.log('Transaction hash:', result.hash)
```
{% endcode %}

### **Use DeFi Protocols**

```bash
npm install @tetherto/wdk-protocol-swap-velora-evm
```

{% code lineNumbers="true" %}
```typescript
import SwapveloraEvm from '@tetherto/wdk-protocol-swap-velora-evm'

wdk.registerProtocol('swap-velora-evm', SwapveloraEvm)
```
{% endcode %}


***

## Troubleshooting

### **Common Issues**

**"Provider not connected"**

* Check your API keys and network connections
* Ensure you're using the correct provider URLs

**"Insufficient balance"**

* This is normal for new addresses
* Use testnet faucets to get test tokens

**"Module not found"**

* Make sure you've installed all required packages
* Check your import statements

### **Need more help?**

{% include "../.gitbook/includes/support-cards.md" %}

