---
title: Bridge USDT0 TON Guides
description: How to install and use @tetherto/wdk-protocol-bridge-usdt0-ton for bridging tokens from TON
lastReviewed: 2025-09-04
icon: book-open
---

## Installation

To install the `@tetherto/wdk-protocol-bridge-usdt0-ton` package, follow these steps:

```bash
npm install @tetherto/wdk-protocol-bridge-usdt0-ton
```

## Quick Start

### Setting Up a Bridge

```javascript
import Usdt0ProtocolTon from '@tetherto/wdk-protocol-bridge-usdt0-ton'
import { WalletAccountTon } from '@tetherto/wdk-wallet-ton'

// Create a wallet account first
const account = new WalletAccountTon(seedPhrase, {
  tonApiKey: 'YOUR_TON_API_KEY',
  tonApiEndpoint: 'YOUR_TON_API_ENDPOINT'
})

// Create bridge service
const bridgeProtocol = new Usdt0ProtocolTon(account, {
  bridgeMaxFee: 1000000000n // Optional: Max bridge fee
})
```

### Basic Bridge Operation

```javascript
// Bridge tokens to another chain
const result = await bridgeProtocol.bridge({
  targetChain: 'ethereum', // Where to send tokens
  recipient: 'RECIPIENT_ADDRESS', // Who gets the tokens
  token: 'TON_TOKEN_ADDRESS', // TON token address
  amount: 1000000n // Amount to bridge (1 USDT in base units)
})

console.log('Bridge transaction hash:', result.hash)
console.log('Total fee:', result.fee, 'nanotons')
console.log('Bridge fee:', result.bridgeFee, 'nanotons')
```

### Getting Bridge Quotes

```javascript
// Get cost before bridging
const quote = await bridgeProtocol.quoteBridge({
  targetChain: 'arbitrum',
  recipient: 'RECIPIENT_ADDRESS',
  token: 'TON_TOKEN_ADDRESS',
  amount: 1000000n
})

console.log('Fee:', quote.fee, 'nanotons')
console.log('Bridge fee:', quote.bridgeFee, 'nanotons')
```

## Supported Chains

### Source Chain
- **TON** (TON Network) - Where tokens start

### Target Chains
- **Ethereum** (Chain ID: 1)
- **Arbitrum** (Chain ID: 42,161)
- **TRON** (Chain ID: 728,126,428)

## Bridge Operations

### Standard TON Account

```javascript
// Bridge with standard TON account
const result = await bridgeProtocol.bridge({
  targetChain: 'ethereum',
  recipient: 'RECIPIENT_ADDRESS',
  token: 'TON_TOKEN_ADDRESS',
  amount: 1000000n
})

console.log('Bridge hash:', result.hash)
console.log('Total fee:', result.fee)
console.log('Bridge fee:', result.bridgeFee)
```

### Gasless TON Account

```javascript
// Bridge with gasless account (no TON needed for fees)
const result = await bridgeProtocol.bridge({
  targetChain: 'arbitrum',
  recipient: 'RECIPIENT_ADDRESS',
  token: 'TON_TOKEN_ADDRESS',
  amount: 1000000n
}, {
  paymasterToken: 'USDT', // Token used to pay for fees
  bridgeMaxFee: 1000000000n // Max bridge fee
})

console.log('Bridge hash:', result.hash)
console.log('Total fee:', result.fee)
console.log('Bridge fee:', result.bridgeFee)
```

### Custom Token Bridge

```javascript
// Bridge custom jetton tokens
const result = await bridgeProtocol.bridge({
  targetChain: 'ethereum',
  recipient: 'RECIPIENT_ADDRESS',
  token: 'CUSTOM_TOKEN_ADDRESS',
  amount: 1000000n,
  oft: {
    // Custom token config
    version: 3,
    sharedDecimals: 6,
    deployments: {
      ton: { /* ton config */ },
      ethereum: { /* ethereum config */ }
    }
  }
})
```

## Error Handling

```javascript
try {
  const result = await bridgeProtocol.bridge({
    targetChain: 'ethereum',
    recipient: 'RECIPIENT_ADDRESS',
    token: 'TON_TOKEN_ADDRESS',
    amount: 1000000n
  })
  console.log('Bridge successful:', result.hash)
} catch (error) {
  console.error('Bridge failed:', error.message)
  
  // Handle specific errors
  if (error.message.includes('not supported')) {
    console.log('Chain or token not supported')
  }
  if (error.message.includes('max fee')) {
    console.log('Bridge fee too high')
  }
  if (error.message.includes('ton center')) {
    console.log('TON connection problem')
  }
}
```

## Complete Examples

### Complete Bridge Setup

```javascript
import Usdt0ProtocolTon from '@tetherto/wdk-protocol-bridge-usdt0-ton'
import { WalletAccountTon } from '@tetherto/wdk-wallet-ton'

async function setupBridge() {
  // Create wallet account
  const account = new WalletAccountTon(seedPhrase, {
    tonApiKey: 'YOUR_TON_API_KEY',
    tonApiEndpoint: 'YOUR_TON_API_ENDPOINT'
  })
  
  // Create bridge service
  const bridgeProtocol = new Usdt0ProtocolTon(account, {
    bridgeMaxFee: 1000000000n
  })
  
  // Check account balance
  const address = await account.getAddress()
  const balance = await account.getBalance()
  console.log('Account:', address)
  console.log('Balance:', balance, 'nanotons')
  
  return { account, bridgeProtocol }
}
```

### Bridge to Multiple Chains

```javascript
async function bridgeToMultipleChains(bridgeProtocol) {
  const chains = ['ethereum', 'arbitrum', 'tron']
  const token = 'TON_TOKEN_ADDRESS'
  const amount = 1000000n
  const recipient = 'RECIPIENT_ADDRESS'
  
  for (const chain of chains) {
    try {
      // Get quote first
      const quote = await bridgeProtocol.quoteBridge({
        targetChain: chain,
        recipient,
        token,
        amount
      })
      
      console.log(`Bridge to ${chain}:`)
      console.log('  Fee:', quote.fee, 'nanotons')
      console.log('  Bridge fee:', quote.bridgeFee, 'nanotons')
      
      // Do bridge
      const result = await bridgeProtocol.bridge({
        targetChain: chain,
        recipient,
        token,
        amount
      })
      
      console.log(`  Transaction hash: ${result.hash}`)
      
    } catch (error) {
      console.error(`Bridge to ${chain} failed:`, error.message)
    }
  }
}
```

### Bridge with Checks

```javascript
async function bridgeWithChecks(bridgeProtocol, targetChain, recipient, token, amount) {
  try {
    // Check chain
    const supportedChains = ['ethereum', 'arbitrum', 'tron']
    if (!supportedChains.includes(targetChain)) {
      throw new Error('Chain not supported')
    }
    
    // Check addresses
    if (!recipient || recipient.length < 10) {
      throw new Error('Bad recipient address')
    }
    
    // Get quote first
    const quote = await bridgeProtocol.quoteBridge({
      targetChain,
      recipient,
      token,
      amount
    })
    
    console.log('Bridge quote:')
    console.log('  Fee:', quote.fee, 'nanotons')
    console.log('  Bridge fee:', quote.bridgeFee, 'nanotons')
    
    // Check if fees are OK
    if (quote.fee + quote.bridgeFee > 1000000000n) {
      throw new Error('Fees too high')
    }
    
    // Do bridge
    const result = await bridgeProtocol.bridge({
      targetChain,
      recipient,
      token,
      amount
    })
    
    console.log('Bridge successful:', result.hash)
    return result
    
  } catch (error) {
    console.error('Bridge check failed:', error.message)
    throw error
  }
}
```
