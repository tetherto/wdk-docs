---
title: Multi-Chain Quick Start Guide
author: Raquel Carrasco
lastReviewed: 2025-09-11
icon: rocket
---

# Welcome to Multi-Chain WDK Quick Start Guide! 

This advanced guide will teach you how to build a multi-chain blockchain application using the **Wallet Development Kit (WDK) Core**. We'll use **EVM, TRON, and Bitcoin** to demonstrate how WDK Core orchestrates multiple blockchains through a unified interface.

## What You'll Learn

By the end of this guide, you'll know how to:
- ✅ Set up a Node.js project with WDK Core
- ✅ Register multiple blockchain wallets (EVM, TRON, Bitcoin)
- ✅ Create accounts across different blockchains
- ✅ Check balances across multiple chains
- ✅ Send transactions on different blockchains
- ✅ Register and use protocols (swap, bridge)
- ✅ Build a complete multi-chain application

---

## Prerequisites

Before we start, make sure you have:

| Tool | Version | Why You Need It |
|------|---------|-----------------|
| **Node.js** | 20+ | To run JavaScript code |
| **npm** | Latest | To install packages |
| **Code Editor** | Any | To write code (VS Code recommended) |

**Note**: We'll use testnets for this tutorial, so you don't need real funds to get started!

---

## Step 1: Project Setup

Let's create a new project and install WDK Core with multiple wallet modules:

```bash
# Create a new directory
mkdir my-multi-chain-wdk-app
cd my-multi-chain-wdk-app

# Initialize a Node.js project
npm init -y

# Install WDK Core and wallet modules
npm install @tetherto/wdk @tetherto/wdk-wallet-evm @tetherto/wdk-wallet-tron @tetherto/wdk-wallet-btc

# OR - with private access granted
npm install git+https://github.com/tetherto/wdk-core.git#develop
npm install git+https://github.com/tetherto/wdk-wallet-evm.git#develop
npm install git+https://github.com/tetherto/wdk-wallet-tron.git#develop
npm install git+https://github.com/tetherto/wdk-wallet-btc.git#develop
```

Create a file called `package.json` and add this line to enable modern JavaScript features:

```json
{
  "type": "module",
  "dependencies": {
    "@tetherto/wdk": "git+ssh://git@github.com:tetherto/wdk-core.git#develop",
    "@tetherto/wdk-wallet-evm": "git+ssh://git@github.com/tetherto/wdk-wallet-evm.git#develop",
    "@tetherto/wdk-wallet-tron": "git+ssh://git@github.com/tetherto/wdk-wallet-tron.git#develop",
    "@tetherto/wdk-wallet-btc": "git+ssh://git@github.com/tetherto/wdk-wallet-btc.git#develop"
  }
}
```

---

## Step 2: Understanding Multi-Chain Concepts

Before we write code, let's understand the key concepts:

### What is WDK Core?

**WDK Core** is an orchestrator that manages multiple blockchain wallets through a unified interface. Instead of managing each blockchain separately, you:
- Register different wallet managers for each blockchain
- Use a single seed phrase across all chains
- Access all accounts through one interface
- Register protocols for cross-chain operations

### Key Components

1. **WDK Manager**: The main orchestrator class
2. **Wallet Registration**: Register wallet managers for each blockchain
3. **Account Management**: Create accounts across multiple chains
4. **Protocol Registration**: Add swap, bridge, and lending capabilities
5. **Unified Interface**: Same API across all blockchains

---

## Step 3: Creating Your Multi-Chain Wallet

Create a file called `step1-multi-chain-wallet.js`:

```javascript
import WDK from '@tetherto/wdk'
import WalletManagerEvm from '@tetherto/wdk-wallet-evm'
import WalletManagerTron from '@tetherto/wdk-wallet-tron'
import WalletManagerBtc from '@tetherto/wdk-wallet-btc'

// Step 1: Generate a seed phrase (in production, generate this securely!)
const seedPhrase = WDK.getRandomSeedPhrase()
console.log('Generated seed phrase:', seedPhrase)

// Step 2: Create WDK Manager
const wdk = new WDK(seedPhrase)

// Step 3: Register wallets for different blockchains
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

// Step 4: Get accounts for each blockchain
const ethAccount = await wdkWithWallets.getAccount('ethereum', 0)
const tronAccount = await wdkWithWallets.getAccount('tron', 0)
const btcAccount = await wdkWithWallets.getAccount('bitcoin', 0)

// Step 5: Get addresses
const ethAddress = await ethAccount.getAddress()
const tronAddress = await tronAccount.getAddress()
const btcAddress = await btcAccount.getAddress()

console.log('🎉 Multi-chain wallet is ready!')
console.log('📬 Ethereum address:', ethAddress)
console.log('📬 TRON address:', tronAddress)
console.log('📬 Bitcoin address:', btcAddress)
```

Run it:
```bash
node step1-multi-chain-wallet.js
```

**What happened?**
- We created a WDK Manager with a single seed phrase
- Registered wallets for Ethereum, TRON, and Bitcoin
- Generated addresses for all three blockchains
- All addresses are derived from the same seed phrase!

---

## Step 4: Multi-Chain Balance Checking

Create `step2-multi-chain-balances.js`:

```javascript
import WDK from '@tetherto/wdk'
import WalletManagerEvm from '@tetherto/wdk-wallet-evm'
import WalletManagerTron from '@tetherto/wdk-wallet-tron'
import WalletManagerBtc from '@tetherto/wdk-wallet-btc'

const seedPhrase = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'

const wdk = new WDK(seedPhrase)
  .registerWallet('ethereum', WalletManagerEvm, {
    provider: 'https://mainnet.infura.io/v3/YOUR_API_KEY'
  })
  .registerWallet('tron', WalletManagerTron, {
    provider: 'https://api.trongrid.io'
  })
  .registerWallet('bitcoin', WalletManagerBtc, {
    provider: 'https://blockstream.info/api'
  })

// Get accounts
const ethAccount = await wdk.getAccount('ethereum', 0)
const tronAccount = await wdk.getAccount('tron', 0)
const btcAccount = await wdk.getAccount('bitcoin', 0)

console.log('💰 Checking balances across all chains...\n')

// Check Ethereum balance
try {
  const ethBalance = await ethAccount.getBalance()
  console.log('🔷 Ethereum balance:', ethBalance.toString(), 'wei')
  console.log('🔷 Ethereum balance:', (Number(ethBalance) / 1e18).toFixed(4), 'ETH')
} catch (error) {
  console.log('🔷 Ethereum: Wallet not connected or no balance')
}

// Check TRON balance
try {
  const tronBalance = await tronAccount.getBalance()
  console.log('🔶 TRON balance:', tronBalance.toString(), 'sun')
  console.log('🔶 TRON balance:', (Number(tronBalance) / 1e6).toFixed(4), 'TRX')
} catch (error) {
  console.log('🔶 TRON: Wallet not connected or no balance')
}

// Check Bitcoin balance
try {
  const btcBalance = await btcAccount.getBalance()
  console.log('🟠 Bitcoin balance:', btcBalance.toString(), 'satoshi')
  console.log('🟠 Bitcoin balance:', (Number(btcBalance) / 1e8).toFixed(8), 'BTC')
} catch (error) {
  console.log('🟠 Bitcoin: Wallet not connected or no balance')
}

// Check token balances (if applicable)
console.log('\n🪙 Checking token balances...')

// Check USDT on Ethereum
try {
  const usdtEthBalance = await ethAccount.getTokenBalance('0xdAC17F958D2ee523a2206206994597C13D831ec7')
  console.log('💵 USDT (Ethereum):', usdtEthBalance.toString(), 'units')
} catch (error) {
  console.log('💵 USDT (Ethereum): Not available or no balance')
}

// Check USDT on TRON
try {
  const usdtTronBalance = await tronAccount.getTokenBalance('TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t')
  console.log('💵 USDT (TRON):', usdtTronBalance.toString(), 'units')
} catch (error) {
  console.log('💵 USDT (TRON): Not available or no balance')
}
```

Run it:
```bash
node step2-multi-chain-balances.js
```

**What happened?**
- We checked native token balances across all three blockchains
- We checked USDT balances on both Ethereum and TRON
- Each blockchain has its own balance checking logic
- All through a unified interface!

---

## Step 5: Multi-Chain Transaction Estimation

Create `step3-multi-chain-estimates.js`:

```javascript
import WDK from '@tetherto/wdk'
import WalletManagerEvm from '@tetherto/wdk-wallet-evm'
import WalletManagerTron from '@tetherto/wdk-wallet-tron'
import WalletManagerBtc from '@tetherto/wdk-wallet-btc'

const seedPhrase = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'

const wdk = new WDK(seedPhrase)
  .registerWallet('ethereum', WalletManagerEvm, {
    provider: 'https://mainnet.infura.io/v3/YOUR_API_KEY'
  })
  .registerWallet('tron', WalletManagerTron, {
    provider: 'https://api.trongrid.io'
  })
  .registerWallet('bitcoin', WalletManagerBtc, {
    provider: 'https://blockstream.info/api'
  })

const ethAccount = await wdk.getAccount('ethereum', 0)
const tronAccount = await wdk.getAccount('tron', 0)
const btcAccount = await wdk.getAccount('bitcoin', 0)

console.log('📊 Estimating transaction costs across all chains...\n')

// Estimate Ethereum transaction
try {
  const ethQuote = await ethAccount.quoteSendTransaction({
    to: '0xd3D224Ca27C4b4350b8BCD52c9381E1a8CEEFcf0',
    value: '1000000000000000000' // 1 ETH
  })
  console.log('🔷 Ethereum transaction cost:', ethQuote.fee.toString(), 'wei')
  console.log('🔷 Ethereum transaction cost:', (Number(ethQuote.fee) / 1e18).toFixed(6), 'ETH')
} catch (error) {
  console.log('🔷 Ethereum: Unable to estimate (check provider)')
}

// Estimate TRON transaction
try {
  const tronQuote = await tronAccount.quoteSendTransaction({
    to: 'TLyqzVGLV1srkB7dToTAEqgDSfPtXRJZYH',
    value: 1000000 // 1 TRX in sun
  })
  console.log('🔶 TRON transaction cost:', tronQuote.fee.toString(), 'sun')
  console.log('🔶 TRON transaction cost:', (Number(tronQuote.fee) / 1e6).toFixed(6), 'TRX')
} catch (error) {
  console.log('🔶 TRON: Unable to estimate (check provider)')
}

// Estimate Bitcoin transaction
try {
  const btcQuote = await btcAccount.quoteSendTransaction({
    to: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    value: 100000000 // 1 BTC in satoshi
  })
  console.log('🟠 Bitcoin transaction cost:', btcQuote.fee.toString(), 'satoshi')
  console.log('🟠 Bitcoin transaction cost:', (Number(btcQuote.fee) / 1e8).toFixed(8), 'BTC')
} catch (error) {
  console.log('🟠 Bitcoin: Unable to estimate (check provider)')
}

// Estimate token transfers
console.log('\n🪙 Estimating token transfer costs...')

// Estimate USDT transfer on Ethereum
try {
  const usdtEthQuote = await ethAccount.quoteTransfer({
    token: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    recipient: '0xd3D224Ca27C4b4350b8BCD52c9381E1a8CEEFcf0',
    amount: '1000000' // 1 USDT (6 decimals)
  })
  console.log('💵 USDT (Ethereum) transfer cost:', usdtEthQuote.fee.toString(), 'wei')
} catch (error) {
  console.log('💵 USDT (Ethereum): Unable to estimate')
}

// Estimate USDT transfer on TRON
try {
  const usdtTronQuote = await tronAccount.quoteTransfer({
    token: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    recipient: 'TLyqzVGLV1srkB7dToTAEqgDSfPtXRJZYH',
    amount: '1000000' // 1 USDT (6 decimals)
  })
  console.log('💵 USDT (TRON) transfer cost:', usdtTronQuote.fee.toString(), 'sun')
} catch (error) {
  console.log('💵 USDT (TRON): Unable to estimate')
}
```

Run it:
```bash
node step3-multi-chain-estimates.js
```

**What happened?**
- We estimated transaction costs for all three blockchains
- We estimated both native token and ERC-20/TRC-20 token transfers
- Each blockchain has different fee structures and units
- All through the same unified interface!

---

## Step 6: Multi-Chain Transactions

Create `step4-multi-chain-transactions.js`:

```javascript
import WDK from '@tetherto/wdk'
import WalletManagerEvm from '@tetherto/wdk-wallet-evm'
import WalletManagerTron from '@tetherto/wdk-wallet-tron'
import WalletManagerBtc from '@tetherto/wdk-wallet-btc'

const seedPhrase = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'

const wdk = new WDK(seedPhrase)
  .registerWallet('ethereum', WalletManagerEvm, {
    provider: 'https://mainnet.infura.io/v3/YOUR_API_KEY'
  })
  .registerWallet('tron', WalletManagerTron, {
    provider: 'https://api.trongrid.io'
  })
  .registerWallet('bitcoin', WalletManagerBtc, {
    provider: 'https://blockstream.info/api'
  })

const ethAccount = await wdk.getAccount('ethereum', 0)
const tronAccount = await wdk.getAccount('tron', 0)
const btcAccount = await wdk.getAccount('bitcoin', 0)

console.log('🚀 Sending transactions across all chains...\n')

// Send Ethereum transaction
try {
  console.log('🔷 Sending Ethereum transaction...')
  const ethResult = await ethAccount.sendTransaction({
    to: await ethAccount.getAddress(), // Send to yourself
    value: '1000000000000000000' // 1 ETH
  })
  console.log('✅ Ethereum transaction successful!')
  console.log('   Hash:', ethResult.hash)
  console.log('   Fee:', ethResult.fee.toString(), 'wei')
} catch (error) {
  console.log('❌ Ethereum transaction failed:', error.message)
}

// Send TRON transaction
try {
  console.log('\n🔶 Sending TRON transaction...')
  const tronResult = await tronAccount.sendTransaction({
    to: await tronAccount.getAddress(), // Send to yourself
    value: 1000000 // 1 TRX in sun
  })
  console.log('✅ TRON transaction successful!')
  console.log('   Hash:', tronResult.hash)
  console.log('   Fee:', tronResult.fee.toString(), 'sun')
} catch (error) {
  console.log('❌ TRON transaction failed:', error.message)
}

// Send Bitcoin transaction
try {
  console.log('\n🟠 Sending Bitcoin transaction...')
  const btcResult = await btcAccount.sendTransaction({
    to: await btcAccount.getAddress(), // Send to yourself
    value: 100000000 // 1 BTC in satoshi
  })
  console.log('✅ Bitcoin transaction successful!')
  console.log('   Hash:', btcResult.hash)
  console.log('   Fee:', btcResult.fee.toString(), 'satoshi')
} catch (error) {
  console.log('❌ Bitcoin transaction failed:', error.message)
}

// Send token transfers
console.log('\n🪙 Sending token transfers...')

// Send USDT on Ethereum
try {
  console.log('💵 Sending USDT on Ethereum...')
  const usdtEthResult = await ethAccount.transfer({
    token: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    recipient: await ethAccount.getAddress(),
    amount: '1000000' // 1 USDT
  })
  console.log('✅ USDT (Ethereum) transfer successful!')
  console.log('   Hash:', usdtEthResult.hash)
  console.log('   Fee:', usdtEthResult.fee.toString(), 'wei')
} catch (error) {
  console.log('❌ USDT (Ethereum) transfer failed:', error.message)
}

// Send USDT on TRON
try {
  console.log('💵 Sending USDT on TRON...')
  const usdtTronResult = await tronAccount.transfer({
    token: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    recipient: await tronAccount.getAddress(),
    amount: '1000000' // 1 USDT
  })
  console.log('✅ USDT (TRON) transfer successful!')
  console.log('   Hash:', usdtTronResult.hash)
  console.log('   Fee:', usdtTronResult.fee.toString(), 'sun')
} catch (error) {
  console.log('❌ USDT (TRON) transfer failed:', error.message)
}
```

Run it:
```bash
node step4-multi-chain-transactions.js
```

**What happened?**
- We sent transactions on all three blockchains
- We sent both native tokens and ERC-20/TRC-20 tokens
- Each blockchain has its own transaction format and fee structure
- All through the same unified interface!

---

## Step 7: Protocol Registration and Usage

Create `step5-protocols.js`:

```javascript
import WDK from '@tetherto/wdk'
import WalletManagerEvm from '@tetherto/wdk-wallet-evm'
import WalletManagerTron from '@tetherto/wdk-wallet-tron'
import WalletManagerBtc from '@tetherto/wdk-wallet-btc'

const seedPhrase = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'

const wdk = new WDK(seedPhrase)
  .registerWallet('ethereum', WalletManagerEvm, {
    provider: 'https://mainnet.infura.io/v3/YOUR_API_KEY'
  })
  .registerWallet('tron', WalletManagerTron, {
    provider: 'https://api.trongrid.io'
  })
  .registerWallet('bitcoin', WalletManagerBtc, {
    provider: 'https://blockstream.info/api'
  })


// Get accounts with protocol support
const ethAccount = await wdk.getAccount('ethereum', 0)
const tronAccount = await wdk.getAccount('tron', 0)

console.log('\n🔄 Using protocols...')

```

Run it:
```bash
node step5-protocols.js
```

**What happened?**
- We demonstrated how to register protocols globally
- We showed how to access protocols through accounts
- We prepared the structure for swap and bridge operations
- This is where the real power of WDK Core shines!

---

## Step 8: Complete Multi-Chain Application

Now let's create a complete application that combines everything we learned. Create `complete-multi-chain-app.js`:

```javascript
import WDK from '@tetherto/wdk'
import WalletManagerEvm from '@tetherto/wdk-wallet-evm'
import WalletManagerTron from '@tetherto/wdk-wallet-tron'
import WalletManagerBtc from '@tetherto/wdk-wallet-btc'

async function main() {
  console.log('🚀 Starting Multi-Chain WDK Application...\n')
  
  // Configuration
  const seedPhrase = WDK.getRandomSeedPhrase()
  console.log('🔑 Generated seed phrase:', seedPhrase)
  
  try {
    // Step 1: Initialize WDK Manager
    console.log('📦 Initializing WDK Manager...')
    const wdk = new WDK(seedPhrase)
    
    // Step 2: Register wallets for different blockchains
    console.log('🔗 Registering wallets...')
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
    
    console.log('✅ Wallets registered for Ethereum, TRON, and Bitcoin')
    
    // Step 3: Get accounts for all blockchains
    console.log('\n👤 Creating accounts...')
    const accounts = {
      ethereum: await wdkWithWallets.getAccount('ethereum', 0),
      tron: await wdkWithWallets.getAccount('tron', 0),
      bitcoin: await wdkWithWallets.getAccount('bitcoin', 0)
    }
    
    // Step 4: Get addresses
    console.log('📬 Account addresses:')
    for (const [chain, account] of Object.entries(accounts)) {
      const address = await account.getAddress()
      console.log(`   ${chain.toUpperCase()}: ${address}`)
    }
    
    // Step 5: Check balances across all chains
    console.log('\n💰 Checking balances...')
    const balances = {}
    
    for (const [chain, account] of Object.entries(accounts)) {
      try {
        const balance = await account.getBalance()
        balances[chain] = balance
        console.log(`   ${chain.toUpperCase()}: ${balance.toString()} units`)
      } catch (error) {
        console.log(`   ${chain.toUpperCase()}: Unable to check balance (${error.message})`)
        balances[chain] = 0
      }
    }
    
    // Step 6: Estimate transaction costs
    console.log('\n📊 Estimating transaction costs...')
    const estimates = {}
    
    for (const [chain, account] of Object.entries(accounts)) {
      try {
        const quote = await account.quoteSendTransaction({
          to: await account.getAddress(),
          value: chain === 'bitcoin' ? 100000000 : chain === 'tron' ? 1000000 : '1000000000000000000'
        })
        estimates[chain] = quote.fee
        console.log(`   ${chain.toUpperCase()}: ${quote.fee.toString()} units`)
      } catch (error) {
        console.log(`   ${chain.toUpperCase()}: Unable to estimate (${error.message})`)
        estimates[chain] = 0
      }
    }
    
    // Step 7: Send test transactions (if balances are sufficient)
    console.log('\n🚀 Sending test transactions...')
    
    for (const [chain, account] of Object.entries(accounts)) {
      try {
        if (balances[chain] > estimates[chain]) {
          console.log(`   Sending ${chain.toUpperCase()} transaction...`)
          const result = await account.sendTransaction({
            to: await account.getAddress(),
            value: chain === 'bitcoin' ? 100000000 : chain === 'tron' ? 1000000 : '1000000000000000000'
          })
          console.log(`   ✅ ${chain.toUpperCase()} transaction successful: ${result.hash}`)
        } else {
          console.log(`   ⚠️  ${chain.toUpperCase()}: Insufficient balance for transaction`)
        }
      } catch (error) {
        console.log(`   ❌ ${chain.toUpperCase()} transaction failed: ${error.message}`)
      }
    }
    
    // Step 9: Clean up
    console.log('\n🧹 Cleaning up...')
    wdkWithWallets.dispose()
    console.log('✅ Application completed successfully!')
    
  } catch (error) {
    console.error('❌ Application error:', error.message)
  }
}

// Run the application
main()
```

Run it:
```bash
node complete-multi-chain-app.js
```

**What this complete app does:**
1. Generates a secure seed phrase
2. Registers wallets for Ethereum, TRON, and Bitcoin
3. Creates accounts across all blockchains
4. Checks balances across all chains
5. Estimates transaction costs
6. Sends test transactions (if funds available)
7. Demonstrates protocol registration
8. Cleans up resources

---

## Understanding What Happened Behind the Scenes

When you use WDK Core for multi-chain operations, here's what happens:

| Component | What It Does |
|-----------|-------------|
| **WDK Manager** | Orchestrates all wallet managers and protocols |
| **Wallet Registration** | Registers specific wallet managers for each blockchain |
| **Account Derivation** | Uses BIP-44 to derive accounts from the same seed phrase |
| **Unified Interface** | Provides the same API across all blockchains |
| **Protocol Management** | Manages swap, bridge, and lending protocols |
| **Cross-Chain Operations** | Enables operations across multiple blockchains |

The magic is that you can manage multiple blockchains through a single interface, all derived from one seed phrase!

---

## Next Steps

Congratulations! You've successfully built your first multi-chain WDK application. Here's what you can explore next:

### Try Different Blockchains
- **Solana**: `@tetherto/wdk-wallet-solana`
- **TON**: `@tetherto/wdk-wallet-ton`
- **Spark**: `@tetherto/wdk-wallet-spark`

### Advanced Features
- [Protocol Integration](../wdk-modules/wdk-core/guides.md)
- [Middleware Usage](../wdk-modules/wdk-core/guides.md)
- [Account Abstraction](../wdk-modules/wallet-evm-erc-4337/guides.md)

### Documentation
- [WDK Core API Reference](../wdk-modules/wdk-core/api-reference.md)
- [WDK Core Configuration](../wdk-modules/wdk-core/configuration.md)
- [Individual Wallet Modules](../wdk-modules/wallet-modules/overview.md)

---

## Need Help?

- **Documentation**: Check the [WDK Core API Reference](../wdk-modules/wdk-core/api-reference.md)
- **Examples**: Browse [WDK Core Guides](../wdk-modules/wdk-core/guides.md)
- **Issues**: [Open an issue on GitHub](https://github.com/tetherto/wdk-core/issues)

Happy multi-chain building! 🎉
