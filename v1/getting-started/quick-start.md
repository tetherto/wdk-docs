---
title: Quick Start Guide
icon: rocket
---

# Welcome to WDK Quick Start Guide! 

This guide will teach you how to build your first blockchain application using the **Wallet Development Kit (WDK)**. We'll use the **EVM-ERC-4337 module** as our example, but the concepts you learn here apply to all WDK modules across different blockchains.

## What You'll Learn

By the end of this guide, you'll know how to:
- ✅ Set up a Node.js project with WDK
- ✅ Create a smart wallet with [account abstraction](../resources/concepts.md#account-abstraction)
- ✅ Check token balances
- ✅ Send [gasless transactions](../resources/concepts.md#gasless-transactions)
- ✅ Build a complete working application

---

## Prerequisites

Before we start, make sure you have:

| Tool | Version | Why You Need It |
|------|---------|-----------------|
| **Node.js** | 20+ | To run JavaScript code |
| **npm** | Latest | To install packages |
| **Code Editor** | Any | To write code (VS Code recommended) |

**Note**: We'll use Polygon testnet for this tutorial, so you don't need real funds to get started!

---

## Step 1: Project Setup

Let's create a new project and install WDK:

```bash
# Create a new directory
mkdir my-first-wdk-app
cd my-first-wdk-app

# Initialize a Node.js project
npm init -y

# Install WDK EVM-ERC-4337 module
npm install @wdk/wallet-evm-erc-4337

# OR - with private access granted
npm install git+https://github.com/tetherto/wdk-wallet-evm-erc-4337.git
```

Create a file called `package.json` and add this line to enable modern JavaScript features:

```json
{
  "type": "module",
  "dependencies": {
  "@wdk/wallet-evm-erc-4337": "git+ssh://git@github.com:tetherto/wdk-wallet-evm-erc-4337.git#develop"
  // ... other dependencies ...
}
}
```

---

## Step 2: Understanding the Basics

Before we write code, let's understand the key concepts:

### What is [Account Abstraction](../resources/concepts.md#account-abstraction) (ERC-4337)?

Traditional wallets require you to hold the native token (like ETH) to pay for gas fees. With **Account Abstraction**, you can:
- Pay fees with any token (like USDT)
- Send transactions without holding native tokens
- Use smart contracts as your wallet

### Key Components

1. **Wallet Manager**: Creates and manages your wallet
2. **Account**: Your specific wallet address
3. **[Paymaster](../resources/concepts.md#paymaster-services)**: Pays your gas fees in exchange for tokens
4. **Bundler**: Groups transactions for efficiency

---

## Step 3: Creating Your First Wallet

Create a file called `step1-wallet.js`:

```javascript
import WalletManagerEvmErc4337 from '@wdk/wallet-evm-erc-4337'

// Step 1: Create a [seed phrase](../resources/concepts.md#seed-phrases-and-private-keys) (in production, generate this securely!)
const seedPhrase = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'

// Step 2: Configure for Polygon testnet
const config = {
 // Required parameters
  chainId: 137, // Polygon mainnet
  provider: 'https://polygon-rpc.com',
  bundlerUrl: 'https://api.candide.dev/public/v3/polygon',
  paymasterUrl: 'https://api.candide.dev/public/v3/polygon',
  paymasterAddress: '0x8b1f6cb5d062aa2ce8d581942bbb960420d875ba',
  entryPointAddress: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
  safeModulesVersion: '0.3.0',
  paymasterToken: {
    address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f' // USDT on Polygon
  },

  // Optional parameters
  transferMaxFee: 100000000000000 // Optional: Maximum fee in wei
}

// Step 3: Create wallet manager
const wallet = new WalletManagerEvmErc4337(seedPhrase, config)

// Step 4: Get your first account
const account = await wallet.getAccount(0)
const address = await account.getAddress()

console.log('🎉 Your wallet is ready!')
console.log('📬 Wallet address:', address)
console.log('🔗 Network: Polygon')
```

Run it:
```bash
node step1-wallet.js
```

**What happened?**
- We created a wallet manager with your [seed phrase](../resources/concepts.md#seed-phrases-and-private-keys)
- Configured it for Polygon network
- Generated your first wallet address

---

## Step 4: Checking Balances

Create `step2-balances.js`:

```javascript
import WalletManagerEvmErc4337 from '@wdk/wallet-evm-erc-4337'

const seedPhrase = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'

const config = {
 // Required parameters
  chainId: 137, // Polygon mainnet
  provider: 'https://polygon-rpc.com',
  bundlerUrl: 'https://api.candide.dev/public/v3/polygon',
  paymasterUrl: 'https://api.candide.dev/public/v3/polygon',
  paymasterAddress: '0x8b1f6cb5d062aa2ce8d581942bbb960420d875ba',
  entryPointAddress: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
  safeModulesVersion: '0.3.0',
  paymasterToken: {
    address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f' // USDT on Polygon
  },

  // Optional parameters
  transferMaxFee: 100000000000000 // Optional: Maximum fee in wei
}

const wallet = new WalletManagerEvmErc4337(seedPhrase, config)
const account = await wallet.getAccount(0)

// Check native token balance (MATIC)
const nativeBalance = await account.getBalance()
console.log('💰 Native balance (MATIC):', nativeBalance.toString(), 'wei')

// Check USDT balance (paymaster token)
const usdtBalance = await account.getTokenBalance('0xc2132d05d31c914a87c6611c10748aeb04b58e8f')
console.log('💵 USDT balance:', usdtBalance.toString(), 'units')

// Check paymaster token balance (for paying fees)
const paymasterBalance = await account.getPaymasterTokenBalance()
console.log('🎫 Paymaster token balance:', paymasterBalance, 'units')
```

Run it:
```bash
node step2-balances.js
```

**What happened?**
- We checked your MATIC balance (native token)
- We checked your USDT balance (ERC-20 token)
- We checked your [paymaster](../resources/concepts.md#paymaster-services) token balance (for paying fees)

---

## Step 5: Estimating Transaction Costs

Create `step3-estimate.js`:

```javascript
import WalletManagerEvmErc4337 from '@wdk/wallet-evm-erc-4337'

const seedPhrase = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'

const config = {
 // Required parameters
  chainId: 137, // Polygon mainnet
  provider: 'https://polygon-rpc.com',
  bundlerUrl: 'https://api.candide.dev/public/v3/polygon',
  paymasterUrl: 'https://api.candide.dev/public/v3/polygon',
  paymasterAddress: '0x8b1f6cb5d062aa2ce8d581942bbb960420d875ba',
  entryPointAddress: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
  safeModulesVersion: '0.3.0',
  paymasterToken: {
    address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f' // USDT on Polygon
  },

  // Optional parameters
  transferMaxFee: 100000000000000 // Optional: Maximum fee in wei
}

const wallet = new WalletManagerEvmErc4337(seedPhrase, config)
const account = await wallet.getAccount(0)

// Estimate cost of sending 1 USDT
const transferQuote = await account.quoteTransfer({
  token: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f', // USDT
  recipient: '0xd3D224Ca27C4b4350b8BCD52c9381E1a8CEEFcf0', // Example recipient
  amount: '1000000' // 1 USDT (6 decimals)
})

console.log('📊 Transfer cost estimate:', transferQuote.fee, 'USDT units')

// Estimate cost of sending native token with default paymaster token
const transactionQuote = await account.quoteSendTransaction({
  to: '0xd3D224Ca27C4b4350b8BCD52c9381E1a8CEEFcf0',
  value: '1000000000000000000' // 1 MATIC (18 decimals)
})

console.log('📊 Transaction cost estimate:', transactionQuote.fee, 'USDT units')
```

Run it:
```bash
node step3-estimate.js
```

**What happened?**
- We estimated how much it would cost to send 1 USDT
- We estimated how much it would cost to send 1 MATIC
- Both estimates are in USDT units (because that's our [paymaster](../resources/concepts.md#paymaster-services) token)

---

## Step 6: Sending Your First [Gasless Transaction](../resources/concepts.md#gasless-transactions)

Create `step4-transfer.js`:

```javascript
import WalletManagerEvmErc4337 from '@wdk/wallet-evm-erc-4337'

const seedPhrase = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'

const config = {
 // Required parameters
  chainId: 137, // Polygon mainnet
  provider: 'https://polygon-rpc.com',
  bundlerUrl: 'https://api.candide.dev/public/v3/polygon',
  paymasterUrl: 'https://api.candide.dev/public/v3/polygon',
  paymasterAddress: '0x8b1f6cb5d062aa2ce8d581942bbb960420d875ba',
  entryPointAddress: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
  safeModulesVersion: '0.3.0',
  paymasterToken: {
    address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f' // USDT on Polygon
  },

  // Optional parameters
  transferMaxFee: 100000000000000 // Optional: Maximum fee in wei
}

const wallet = new WalletManagerEvmErc4337(seedPhrase, config)
const account = await wallet.getAccount(0)

try {
  console.log('🚀 Sending transaction...')
  
  // Send 1 USDT to yourself (for testing)
  const result = await account.transfer({
    token: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f', // USDT
    recipient: await account.getAddress(), // Send to yourself
    amount: '1000000' // 1 USDT
  })
  
  console.log('✅ Transaction successful!')
  console.log('🔗 Transaction hash:', result.hash)
  console.log('💸 Fee paid:', result.fee, 'USDT units')
  
} catch (error) {
  console.error('❌ Transaction failed:', error.message)
}
```

Run it:
```bash
node step4-transfer.js
```

**What happened?**
- We sent a transaction using [account abstraction](../resources/concepts.md#account-abstraction)
- The [paymaster](../resources/concepts.md#paymaster-services) paid the gas fees in USDT
- You didn't need any MATIC to send the transaction!

---

## Step 7: Putting It All Together

Now let's create a complete application that combines everything we learned. Create `complete-app.js`:

```javascript
import WalletManagerEvmErc4337 from '@wdk/wallet-evm-erc-4337'

async function main() {
  console.log('🚀 Starting WDK Complete Application...\n')
  
  // Configuration
  const seedPhrase = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'

  const config = {
  // Required parameters
    chainId: 137, // Polygon mainnet
    provider: 'https://polygon-rpc.com',
    bundlerUrl: 'https://api.candide.dev/public/v3/polygon',
    paymasterUrl: 'https://api.candide.dev/public/v3/polygon',
    paymasterAddress: '0x8b1f6cb5d062aa2ce8d581942bbb960420d875ba',
    entryPointAddress: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
    safeModulesVersion: '0.3.0',
    paymasterToken: {
      address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f' // USDT on Polygon
    },

    // Optional parameters
    transferMaxFee: 100000000000000 // Optional: Maximum fee in wei
  }
  
  try {
    // Step 1: Create wallet
    console.log('📦 Creating wallet...')
    const wallet = new WalletManagerEvmErc4337(seedPhrase, config)
    const account = await wallet.getAccount(0)
    const address = await account.getAddress()
    console.log('✅ Wallet created:', address)
    
    // Step 2: Check balances
    console.log('\n💰 Checking balances...')
    const nativeBalance = await account.getBalance()
    const usdtBalance = await account.getTokenBalance('0xc2132d05d31c914a87c6611c10748aeb04b58e8f')
    const paymasterBalance = await account.getPaymasterTokenBalance()
    
    console.log('   MATIC balance:', nativeBalance.toString(), 'wei')
    console.log('   USDT balance:', usdtBalance.toString(), 'units')
    console.log('   Paymaster balance:', paymasterBalance, 'units')
    
    // Step 3: Estimate transaction cost
    console.log('\n📊 Estimating transaction cost...')
    const quote = await account.quoteTransfer({
      token: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
      recipient: address, // Send to yourself
      amount: '1000000' // 1 USDT
    })
    console.log('   Estimated cost:', quote.fee, 'USDT units')
    
    // Step 4: Send transaction (if we have enough balance)
    if (usdtBalance >= 1000000n && paymasterBalance >= quote.fee) {
      console.log('\n🚀 Sending transaction...')
      const result = await account.transfer({
        token: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
        recipient: address,
        amount: '1000000'
      })
      console.log('✅ Transaction successful!')
      console.log('   Hash:', result.hash)
      console.log('   Fee:', result.fee, 'USDT units')
    } else {
      console.log('\n⚠️  Insufficient balance for transaction')
      console.log('   Need at least 1 USDT and', quote.fee, 'USDT for fees')
    }
    
    // Step 5: Clean up
    console.log('\n🧹 Cleaning up...')
    account.dispose()
    console.log('✅ Application completed successfully!')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

// Run the application
main()
```

Run it:
```bash
node complete-app.js
```

**What this complete app does:**
1. Creates a wallet with [account abstraction](../resources/concepts.md#account-abstraction)
2. Checks all your balances
3. Estimates transaction costs
4. Sends a transaction (if you have enough funds)
5. Cleans up resources

---

## Understanding What Happened Behind the Scenes

When you send a transaction with WDK EVM-ERC-4337, here's what happens:

| Component | What It Does |
|-----------|-------------|
| **Your Wallet** | Signs the transaction with your [private key](../resources/concepts.md#seed-phrases-and-private-keys) |
| **[Account Abstraction](../resources/concepts.md#account-abstraction)** | Wraps your transaction in a smart contract |
| **[Paymaster](../resources/concepts.md#paymaster-services)** | Pays the gas fees in exchange for your USDT |
| **Bundler** | Groups your transaction with others for efficiency |
| **Blockchain** | Executes the transaction on Polygon |

The magic is that you can send [gasless transactions](../resources/concepts.md#gasless-transactions) without holding any MATIC - the paymaster covers the gas fees!

---

## Next Steps

Congratulations! You've successfully built your first WDK application. Here's what you can explore next:

### Try Different Modules
- **Bitcoin**: `@wdk/wallet-btc`
- **Solana**: `@wdk/wallet-solana`
- **TON**: `@wdk/wallet-ton`
- **TON**: `@wdk/wallet-tron`

### Advanced Features
- [Multi-account management](../wdk-modules/wallet-evm-erc-4337/guides.md)
- [Custom transaction types](../wdk-modules/wallet-evm-erc-4337/api-reference.md)
- [Error handling and retry logic](../documentation/preparing-for-production.md)

### Documentation
- [API Reference](../wdk-modules/wallet-evm-erc-4337/api-reference.md)
- [Configuration Options](../wdk-modules/wallet-evm-erc-4337/configuration.md)
- [Production Guidelines](../documentation/preparing-for-production.md)

---

## Need Help?

- **Documentation**: Check the [API Reference](../wdk-modules/wallet-evm-erc-4337/api-reference.md)
- **Examples**: Browse [Guides](../wdk-modules/wallet-evm-erc-4337/guides.md)
- **Issues**: [Open an issue on GitHub](https://github.com/tetherto/wdk-wallet-evm-erc-4337/issues)

Happy building! 🎉

