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

# Node.js & Bare Runtime Quickstart

Get started with WDK in Node.js or Bare runtime environments. Perfect for backend integrations, server-side wallet operations, and embedded applications.

***

## What You'll Build

In this quickstart, you'll create a simple Node.js application that:

- [ ] Sets up WDK with multiple blockchain wallets
- [ ] Generates addresses across different chains
- [ ] Checks balances and estimates transaction costs
- [ ] Sends transactions on multiple blockchains

***

## Prerequisites

Before we start, make sure you have:

{% tabs %}
{% tab title="Node.js Environment" %}
| Tool | Version | Why You Need It |
|------|---------|-----------------|
| **Node.js** | 20+ | To run JavaScript code |
| **npm** | Latest | To install packages |
| **Code Editor** | Any | To write code (VS Code recommended) |
{% endtab %}
{% tab title="Bare Runtime Environment" %}
| Tool | Version | Why You Need It |
|------|---------|-----------------|
| **Bare Runtime** | Latest | To run JavaScript in embedded environments |
| **npm** | Latest | To install packages |
| **Code Editor** | Any | To write code (VS Code recommended) |
{% endtab %}
{% endtabs %}

**Note**: We'll use testnets for this tutorial, so you don't need real funds to get started!

***

## Step 1: Project Setup

### Create Project Directory

```bash:1
mkdir wdk-quickstart && cd wdk-quickstart && npm init -y
```

### Install WDK Dependencies

```bash:1
npm install @tetherto/wdk @tetherto/wdk-wallet-evm @tetherto/wdk-wallet-tron @tetherto/wdk-wallet-btc
```

### Configure Package.json

Add this to your `package.json` to enable modern JavaScript:

```json:1-3
{
  "type": "module"
}
```

### Learn More About WDK Modules

{% hint style="info" %}
Learn more about the core WDK modules:

- **[@tetherto/wdk](../sdk/wdk-core/README.md)** - The main WDK orchestrator that manages multiple blockchain wallets
- **[@tetherto/wdk-wallet-evm](../sdk/wallet-modules/wallet-evm/README.md)** - Ethereum and EVM-compatible chains support
- **[@tetherto/wdk-wallet-tron](../sdk/wallet-modules/wallet-tron/README.md)** - TRON blockchain support
- **[@tetherto/wdk-wallet-btc](../sdk/wallet-modules/wallet-btc/README.md)** - Bitcoin blockchain support
{% endhint %}

***

## Step 2: Create Your First Wallet

Create a file called `app.js`:

```javascript:1-174
import WDK from '@tetherto/wdk'
import WalletManagerEvm from '@tetherto/wdk-wallet-evm'
import WalletManagerTron from '@tetherto/wdk-wallet-tron'
import WalletManagerBtc from '@tetherto/wdk-wallet-btc'

async function main() {
  console.log('Starting WDK App...\n')
  
  try {
    // Step 1: Generate a seed phrase (in production, generate this securely!)
    const seedPhrase = WDK.getRandomSeedPhrase()
    console.log('Generated seed phrase:', seedPhrase)
    
    // Step 2: Create WDK Manager
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
    console.log('\nCreating accounts...')
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
    console.log('\nChecking balances...')
    for (const [chain, account] of Object.entries(accounts)) {
      try {
        const balance = await account.getBalance()
        console.log(`   ${chain.toUpperCase()}: ${balance.toString()} units`)
      } catch (error) {
        console.log(`   ${chain.toUpperCase()}: Unable to check balance`)
      }
    }
    
    // Step 7: Estimate transaction costs
    console.log('\nEstimating transaction costs...')
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
    
    console.log('\nApplication completed successfully!')
    
  } catch (error) {
    console.error('Application error:', error.message)
  }
}

// Run the application
main()
```

***

## Step 3: Run Your Application

Execute your app:

{% tabs %}
{% tab title="Node.js" %}
```bash:1
node app.js
```
{% endtab %}
{% tab title="Bare Runtime" %}
```bash:1
bare app.js
```
{% endtab %}
{% endtabs %}

You should see output like this:

```text:1-21
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
- Generated a single seed phrase that works across all blockchains
- Registered wallet managers for Ethereum, TRON, and Bitcoin
- Created accounts derived from the same seed phrase using BIP-44

### **Unified Interface**
- Used the same API to interact with different blockchains
- Checked balances across multiple chains with consistent methods
- Estimated transaction costs using unified interfaces

### **Self-Custodial Architecture**
- All private keys are derived from your seed phrase
- Keys never leave your application (stateless design)
- Complete control over your digital assets

***

## Next Steps

Now that you have a basic multi-chain wallet running, here's what you can explore:

### **Add More Blockchains**
```javascript:1-7
// Add Solana support
npm install @tetherto/wdk-wallet-solana

// Register in your app
import WalletManagerSolana from '@tetherto/wdk-wallet-solana'
wdk.registerWallet('solana', WalletManagerSolana, {
  provider: 'https://api.mainnet-beta.solana.com'
})
```

### **Send Transactions**
```javascript:1-6
// Send a transaction
const result = await ethAccount.sendTransaction({
  to: '0x742d35Cc6634C0532925a3b8D9C5c8b7b6e5f6e5',
  value: '1000000000000000000' // 1 ETH
})
console.log('Transaction hash:', result.hash)
```

### **Use DeFi Protocols**
```javascript:1-7
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

### **Environment Variables**
For production, use environment variables:

```javascript:1-4
const wdk = new WDK(process.env.SEED_PHRASE)
  .registerWallet('ethereum', WalletManagerEvm, {
    provider: process.env.ETHEREUM_PROVIDER
  })
```

***

## Troubleshooting

### **Common Issues**

**"Provider not connected"**
- Check your API keys and network connections
- Ensure you're using the correct provider URLs

**"Insufficient balance"**
- This is normal for new addresses
- Use testnet faucets to get test tokens

**"Module not found"**
- Make sure you've installed all required packages
- Check your import statements

### **Getting Help**
- **Documentation**: Check our [SDK documentation](../sdk/getting-started.md)
- **Issues**: [Open an issue on GitHub](https://github.com/tetherto/wdk/issues)
- **Community**: [Join our Discord](https://discord.gg/wdk)

***

## Ready for Production?

When you're ready to deploy to production:

1. **Secure Key Management**: Use hardware security modules or secure key storage
2. **Environment Configuration**: Use environment variables for sensitive data
3. **Error Handling**: Implement comprehensive error handling and logging
4. **Testing**: Write unit and integration tests
5. **Monitoring**: Set up monitoring and alerting

Check out our [Go-live Checklist](../resources/go-live-checklist.md) for a complete production readiness guide.

***

Happy building!
