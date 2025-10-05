---
title: Node.js & Bare Runtime Quickstart
description: Get started with WDK in Node.js or Bare runtime environments in 5 minutes
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
{% tab title="Node.js Environment" %}
| Tool            | Version | Why You Need It        |
| --------------- | ------- | ---------------------- |
| **Node.js**     | 20+     | To run JavaScript code |
| **npm**         | Latest  | To install packages    |
| **Code Editor** | Any     | To write code          |
{% endtab %}

{% tab title="Bare Runtime Environment" %}
| Tool             | Version | Why You Need It     |
| ---------------- | ------- | ------------------- |
| **Bare Runtime** | Latest  | To run JavaScript   |
| **npm**          | Latest  | To install packages |
| **Code Editor**  | Any     | To write code       |

To install Bare runtime use command `npm i -g bare`
{% endtab %}
{% endtabs %}

**Note**: We'll use testnets for this tutorial, so you don't need real funds to get started!

***

## Step 1: Project Setup

First we need to create a folder and initialize a the project

```bash
mkdir wdk-quickstart && cd wdk-quickstart && npm init -y
```

Then install necessary WDK modules

```bash
npm install @tetherto/wdk @tetherto/wdk-wallet-evm @tetherto/wdk-wallet-tron @tetherto/wdk-wallet-btc
```

{% hint style="info" %}
Learn more about WDK modules:

* [**@tetherto/wdk**](../sdk/wdk-core/) - The main SDK module
* [**@tetherto/wdk-wallet-evm**](../sdk/wallet-modules/wallet-evm/) - Ethereum and EVM-compatible chains support
* [**@tetherto/wdk-wallet-tron**](../sdk/wallet-modules/wallet-tron/) - TRON blockchain support
* [**@tetherto/wdk-wallet-btc**](../sdk/wallet-modules/wallet-btc/) - Bitcoin blockchain support
{% endhint %}

***

## Step 2: Create Your First Wallet

Create a file called `app.js`:

{% code title="app.js" lineNumbers="true" fullWidth="false" %}
```javascript
import WDK from '@tetherto/wdk'
import WalletManagerEvm from '@tetherto/wdk-wallet-evm'
import WalletManagerTron from '@tetherto/wdk-wallet-tron'
import WalletManagerBtc from '@tetherto/wdk-wallet-btc'

async function main() {
  console.log('Starting WDK App...')
  
  try {
    // Step 1: Generate a seed phrase
    const seedPhrase = WDK.getRandomSeedPhrase()
    console.log('Generated seed phrase:', seedPhrase)
    
    // Step 2: Create WDK instance
    const wdk = new WDK(seedPhrase)
    
    // Step 3: Register wallets for different blockchains
    console.log('Registering wallets...')
    const wdkWithWallets = wdk
      .registerWallet('ethereum', WalletManagerEvm, {
        provider: 'https://mainnet.infura.io/v3/YOUR_API_KEY'
      })
      .registerWallet('tron', WalletManagerTron, {
        provider: 'https://api.trongrid.io'
      })
      .registerWallet('bitcoin', WalletManagerBtc, {
        provider: 'https://blockstream.info/api'
      })
    
    console.log('Wallets registered for Ethereum, TRON, and Bitcoin')
    
    // Step 4: Get accounts for all blockchains
    console.log('Creating accounts...')
    const accounts = {
      ethereum: await wdkWithWallets.getAccount('ethereum', 0),
      tron: await wdkWithWallets.getAccount('tron', 0),
      bitcoin: await wdkWithWallets.getAccount('bitcoin', 0)
    }
    
    // Step 5: Get addresses
    console.log('Account addresses:')
    for (const [chain, account] of Object.entries(accounts)) {
      const address = await account.getAddress()
      console.log(`   ${chain.toUpperCase()}: ${address}`)
    }
    
    // Step 6: Check balances across all chains
    console.log('Checking balances...')
    for (const [chain, account] of Object.entries(accounts)) {
      try {
        const balance = await account.getBalance()
        console.log(`   ${chain.toUpperCase()}: ${balance.toString()} units`)
      } catch (error) {
        console.log(`   ${chain.toUpperCase()}: Unable to check balance`)
      }
    }
    
    // Step 7: Estimate transaction costs
    console.log('Estimating transaction costs...')
    for (const [chain, account] of Object.entries(accounts)) {
      try {
        const quote = await account.quoteSendTransaction({
          to: await account.getAddress(),
          value: chain === 'bitcoin' ? 100000000 : chain === 'tron' ? 1000000 : '1000000000000000000'
        })
        console.log(`   ${chain.toUpperCase()}: ${quote.fee.toString()} units`)
      } catch (error) {
        console.log(`   ${chain.toUpperCase()}: Unable to estimate`)
      }
    }
    
    console.log('Application completed successfully!')
    
  } catch (error) {
    console.error('Application error:', error.message)
  }
}

// Run the application
main()
```
{% endcode %}

***

## Step 3: Run Your Application

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

You should see output like this:

```
Starting WDK App...
Generated seed phrase: abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about
Registering wallets...
Wallets registered for Ethereum, TRON, and Bitcoin
Creating accounts...
Account addresses:
   ETHEREUM: 0x742d35Cc6634C0532925a3b8D9C5c8b7b6e5f6e5
   TRON: TLyqzVGLV1srkB7dToTAEqgDSfPtXRJZYH
   BITCOIN: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa
Checking balances...
   ETHEREUM: 0 units
   TRON: 0 units
   BITCOIN: 0 units
Estimating transaction costs...
   ETHEREUM: 21000000000000000 units
   TRON: 1000000 units
   BITCOIN: 10000 units
Application completed successfully!
```

***

## What Just Happened?

**Congratulations!** You've successfully created your first multi-chain WDK application that works in both Node.js and Bare runtime environments. Here's what happened:

### **Multi-Chain Wallet Creation**

* Generated a single seed phrase that works across all blockchains
* Registered wallet managers for Ethereum, TRON, and Bitcoin
* Created accounts derived from the same seed phrase using BIP-44

### **Unified Interface**

* Used the same API to interact with different blockchains
* Checked balances across multiple chains with consistent methods
* Estimated transaction costs using unified interfaces

### **Self-Custodial Architecture**

* All private keys are derived from your seed phrase
* Keys never leave your application (stateless design)
* Complete control over your digital assets

***

## Next Steps

Now that you have a basic multi-chain wallet running, here's what you can explore:

### **Add More Blockchains**

```typescript
// Add Solana support
npm install @tetherto/wdk-wallet-solana

// Register in your app
import WalletManagerSolana from '@tetherto/wdk-wallet-solana'

wdk.registerWallet('solana', WalletManagerSolana, {
  provider: 'https://api.mainnet-beta.solana.com'
})
```

### **Send Transactions**

```typescript
// Send a transaction
const result = await ethAccount.sendTransaction({
  to: '0x742d35Cc6634C0532925a3b8D9C5c8b7b6e5f6e5',
  value: '1000000000000000000' // 1 ETH
})

console.log('Transaction hash:', result.hash)
```

### **Use DeFi Protocols**

```typescript
// Register swap protocol
npm install @tetherto/wdk-protocol-swap-paraswap-evm

// Use in your app
import SwapParaswapEvm from '@tetherto/wdk-protocol-swap-paraswap-evm'
wdk.registerProtocol('swap-paraswap-evm', SwapParaswapEvm)
```

***

## Configuration

### **Provider Configuration**

Update the providers in your app for different networks:

```javascript:1-10
// Ethereum Mainnet
provider: 'https://mainnet.infura.io/v3/YOUR_API_KEY'

// Ethereum Sepolia Testnet
provider: 'https://sepolia.infura.io/v3/YOUR_API_KEY'

// TRON Mainnet
provider: 'https://api.trongrid.io'

// Bitcoin Mainnet
provider: 'https://blockstream.info/api'
```

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

### **Need More help?**

* **Documentation**: Check our [SDK documentation](../sdk/getting-started.md)
* **Issues**: [Open an issue on GitHub](https://github.com/tetherto/wdk/issues)
* **Community**: [Join our Discord](https://discord.gg/wdk)

***

## Ready for Production?

When you're ready to deploy to production:

1. **Secure Key Management**: Use a secure key storage
2. **Environment Configuration**: Use environment variables for sensitive data
3. **Error Handling**: Implement comprehensive error handling and logging
4. **Testing**: Write unit and integration tests
5. **Monitoring**: Set up monitoring and alerting

Check out our [Go-live Checklist](../resources/go-live-checklist.md) for a complete production readiness guide.

***

Happy building!
