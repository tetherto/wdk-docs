---
title: Bridge USDT0 EVM Guides
description: Installation, quick start, and usage examples for @tetherto/wdk-protocol-bridge-usdt0-evm
author: Raquel Carrasco
lastReviewed: 2025-09-04
icon: book-open
---

# Guides

## Installation

To install the `@tetherto/wdk-protocol-bridge-usdt0-evm` package, follow these instructions:

### Public Release

Once the package is publicly available, you can install it using npm:

```bash
npm install @tetherto/wdk-protocol-bridge-usdt0-evm
```

### Private Access

If you have access to the private repository, install the package from the develop branch on GitHub:

```bash
npm install git+https://github.com/tetherto/wdk-protocol-bridge-usdt0-evm.git#develop
```

After installation, ensure your package.json includes the dependency correctly:

```json
"dependencies": {
  // ... other dependencies ...
  "@tetherto/wdk-protocol-bridge-usdt0-evm": "git+ssh://git@github.com:tetherto/wdk-protocol-bridge-usdt0-evm.git#develop"
  // ... other dependencies ...
}
```

## Quick Start

### Setting Up a Bridge Protocol

```javascript
import Usdt0ProtocolEvm from '@tetherto/wdk-protocol-bridge-usdt0-evm'
import { WalletAccountEvm } from '@tetherto/wdk-wallet-evm'

// Create a wallet account first
const account = new WalletAccountEvm(seedPhrase, {
  provider: 'https://rpc.mevblocker.io/fast'
})

// Create bridge protocol instance
const bridgeProtocol = new Usdt0ProtocolEvm(account, {
  bridgeMaxFee: 1000000000000000n // Optional: Maximum bridge fee in wei
})
```

### Basic Bridge Operation

```javascript
// Bridge tokens to another chain
const result = await bridgeProtocol.bridge({
  targetChain: 'arbitrum', // Destination chain
  recipient: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', // Recipient address
  token: '0xdac17f958d2ee523a2206206994597c13d831ec7', // Token contract address
  amount: 1000000000000000000n // Amount to bridge (1 token in base units)
})

console.log('Bridge transaction hash:', result.hash)
console.log('Total fee:', result.fee, 'wei')
console.log('Bridge fee:', result.bridgeFee, 'wei')
```

### Getting Bridge Quotes

```javascript
// Get cost estimate before bridging
const quote = await bridgeProtocol.quoteBridge({
  targetChain: 'polygon',
  recipient: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  token: '0xdac17f958d2ee523a2206206994597c13d831ec7',
  amount: 1000000000000000000n
})

console.log('Estimated fee:', quote.fee, 'wei')
console.log('Bridge fee:', quote.bridgeFee, 'wei')
```

## Supported Chains

### Source Chains (EVM)
- **Ethereum** (Chain ID: 1)
- **Arbitrum** (Chain ID: 42,161) - ERC-4337 support
- **Polygon** (Chain ID: 137)
- **Berachain** (Chain ID: 80,094)
- **Ink** (Chain ID: 57,073)

### Destination Chains
- **Ethereum** (Chain ID: 1)
- **Arbitrum** (Chain ID: 42,161)
- **Polygon** (Chain ID: 137)
- **Berachain** (Chain ID: 80,094)
- **Ink** (Chain ID: 57,073)
- **TON** (Chain ID: 30,343)
- **TRON** (Chain ID: 728,126,428)

## Bridge Operations

### Standard EVM Account

```javascript
// Bridge with standard EVM account
const result = await bridgeProtocol.bridge({
  targetChain: 'arbitrum',
  recipient: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  token: '0xdac17f958d2ee523a2206206994597c13d831ec7',
  amount: 1000000000000000000n
})

// Result includes separate transaction hashes
console.log('Bridge hash:', result.hash)
console.log('Approve hash:', result.approveHash)
console.log('Reset allowance hash:', result.resetAllowanceHash) // Only for USDT on Ethereum
console.log('Total fee:', result.fee)
console.log('Bridge fee:', result.bridgeFee)
```

### ERC-4337 Account

```javascript
// Bridge with ERC-4337 account (gasless)
const result = await bridgeProtocol.bridge({
  targetChain: 'arbitrum',
  recipient: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  token: '0xdac17f958d2ee523a2206206994597c13d831ec7',
  amount: 1000000000000000000n
}, {
  paymasterToken: '0x...', // Paymaster token for gasless transactions
  bridgeMaxFee: 1000000000000000n // Maximum bridge fee
})

// Result has single hash (all operations bundled)
console.log('Bridge hash:', result.hash)
console.log('Total fee:', result.fee)
console.log('Bridge fee:', result.bridgeFee)
```

## Error Handling

```javascript
try {
  const result = await bridgeProtocol.bridge({
    targetChain: 'arbitrum',
    recipient: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    token: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    amount: 1000000000000000000n
  })
  console.log('Bridge successful:', result.hash)
} catch (error) {
  console.error('Bridge failed:', error.message)
  
  // Handle specific errors
  if (error.message.includes('not supported')) {
    console.log('Chain or token not supported')
  }
  if (error.message.includes('Exceeded maximum fee')) {
    console.log('Bridge fee too high')
  }
  if (error.message.includes('insufficient funds')) {
    console.log('Not enough tokens or gas')
  }
}
```

## Complete Examples

### Complete Bridge Setup

```javascript
import Usdt0ProtocolEvm from '@tetherto/wdk-protocol-bridge-usdt0-evm'
import { WalletAccountEvm } from '@tetherto/wdk-wallet-evm'

async function setupBridge() {
  // Create wallet account
  const account = new WalletAccountEvm(seedPhrase, {
    provider: 'https://rpc.mevblocker.io/fast'
  })
  
  // Create bridge protocol
  const bridgeProtocol = new Usdt0ProtocolEvm(account, {
    bridgeMaxFee: 1000000000000000n
  })
  
  // Check account balance
  const address = await account.getAddress()
  const balance = await account.getBalance()
  console.log('Account:', address)
  console.log('Balance:', balance, 'wei')
  
  return { account, bridgeProtocol }
}
```

### Multi-Chain Bridge Example

```javascript
async function bridgeToMultipleChains(bridgeProtocol) {
  const chains = ['arbitrum', 'polygon', 'berachain']
  const token = '0xdac17f958d2ee523a2206206994597c13d831ec7'
  const amount = 1000000000000000000n
  const recipient = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
  
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
      console.log('  Fee:', quote.fee, 'wei')
      console.log('  Bridge fee:', quote.bridgeFee, 'wei')
      
      // Execute bridge
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

### Bridge with Validation

```javascript
async function bridgeWithValidation(bridgeProtocol, targetChain, recipient, token, amount) {
  try {
    // Validate chain
    const supportedChains = ['ethereum', 'arbitrum', 'polygon', 'berachain', 'ink', 'ton', 'tron']
    if (!supportedChains.includes(targetChain)) {
      throw new Error('Chain not supported')
    }
    
    // Validate addresses
    if (!recipient.startsWith('0x') || recipient.length !== 42) {
      throw new Error('Invalid recipient address')
    }
    
    if (!token.startsWith('0x') || token.length !== 42) {
      throw new Error('Invalid token address')
    }
    
    // Get quote first
    const quote = await bridgeProtocol.quoteBridge({
      targetChain,
      recipient,
      token,
      amount
    })
    
    console.log('Bridge quote:')
    console.log('  Fee:', quote.fee, 'wei')
    console.log('  Bridge fee:', quote.bridgeFee, 'wei')
    
    // Check if fees are acceptable
    if (quote.fee + quote.bridgeFee > 1000000000000000n) {
      throw new Error('Fees too high')
    }
    
    // Execute bridge
    const result = await bridgeProtocol.bridge({
      targetChain,
      recipient,
      token,
      amount
    })
    
    console.log('Bridge successful:', result.hash)
    return result
    
  } catch (error) {
    console.error('Bridge validation failed:', error.message)
    throw error
  }
}
```