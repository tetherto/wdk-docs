---
title: Bridge USD₮0 EVM Guides
description: Installation, quick start, and usage examples for @tetherto/wdk-protocol-bridge-usdt0-evm
icon: book-open
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

## Installation

To install the `@tetherto/wdk-protocol-bridge-usdt0-evm` package, follow these instructions:

```bash
npm install @tetherto/wdk-protocol-bridge-usdt0-evm
```

## Quick Start

### Setting Up a Bridge Protocol

```javascript
import Usdt0ProtocolEvm from '@tetherto/wdk-protocol-bridge-usdt0-evm'
import { WalletAccountEvm } from '@tetherto/wdk-wallet-evm'

// Create a wallet account first
const account = new WalletAccountEvm(seedPhrase, "0'/0/0", {
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
  amount: 1000000n // Amount to bridge (1 USDT in 6 decimals)
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
  amount: 1000000n
})

console.log('Estimated fee:', quote.fee, 'wei')
console.log('Bridge fee:', quote.bridgeFee, 'wei')
```

## Supported Chains

### Source Chains (EVM)
- **Ethereum** (Chain ID: 1)
- **Arbitrum** (Chain ID: 42161) - ERC-4337 support
- **Optimism** (Chain ID: 10)
- **Polygon** (Chain ID: 137)
- **Berachain** (Chain ID: 80094)
- **Ink** (Chain ID: 57073)
- **Plasma** (Chain ID: 9745)
- **Conflux eSpace** (Chain ID: 1030)
- **Corn** (Chain ID: 21000000)
- **Avalanche** (Chain ID: 43114)
- **Celo** (Chain ID: 42220)
- **Flare** (Chain ID: 14)
- **HyperEVM** (Chain ID: 999)
- **Mantle** (Chain ID: 5000)
- **MegaETH** (Chain ID: 4326)
- **Monad** (Chain ID: 143)
- **Morph** (Chain ID: 2818)
- **Rootstock** (Chain ID: 30)
- **Sei** (Chain ID: 1329)
- **Stable** (Chain ID: 988)
- **Unichain** (Chain ID: 130)
- **XLayer** (Chain ID: 196)

### Destination Chains
- **All supported EVM source chains** (token-dependent by deployed contracts)
- **Solana** (EID: 30168)
- **TON** (EID: 30343)
- **TRON** (EID: 30420)

## Bridge Operations

### Standard EVM Account

```javascript
// Bridge with standard EVM account
const result = await bridgeProtocol.bridge({
  targetChain: 'arbitrum',
  recipient: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  token: '0xdac17f958d2ee523a2206206994597c13d831ec7',
  amount: 1000000n
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
  amount: 1000000n
}, {
  paymasterToken: { address: '0x...' }, // Paymaster token for gasless transactions
  bridgeMaxFee: 1000000000000000n // Maximum bridge fee
})

// Result has single hash (all operations bundled)
console.log('Bridge hash:', result.hash)
console.log('Total fee:', result.fee)
console.log('Bridge fee:', result.bridgeFee)
```

### Non-EVM Destination (Solana)

```javascript
const solanaResult = await bridgeProtocol.bridge({
  targetChain: 'solana',
  recipient: 'HyXJcgYpURfDhgzuyRL7zxP4FhLg7LZQMeDrR4MXZcMN', // Solana base58 address
  token: '0xdac17f958d2ee523a2206206994597c13d831ec7',
  amount: 1000000n // 1 USDT in 6 decimals
})

console.log('Solana bridge hash:', solanaResult.hash)
console.log('Bridge fee:', solanaResult.bridgeFee)
```

### Non-EVM Destination (TON / TRON)

```javascript
const tonResult = await bridgeProtocol.bridge({
  targetChain: 'ton',
  recipient: 'EQAd31gAUhdO0d0NZsNb_cGl_Maa9PSuNhVLE9z8bBSjX6Gq', // TON address
  token: '0xdac17f958d2ee523a2206206994597c13d831ec7',
  amount: 1000000n // 1 USDT in 6 decimals
})

const tronResult = await bridgeProtocol.bridge({
  targetChain: 'tron',
  recipient: 'TFG4wBaDQ8sHWWP1ACeSGnoNR6RRzevLPt', // TRON address
  token: '0xdac17f958d2ee523a2206206994597c13d831ec7',
  amount: 1000000n // 1 USDT in 6 decimals
})

console.log('TON bridge hash:', tonResult.hash)
console.log('TRON bridge hash:', tronResult.hash)
```

### BridgeOptions Overrides

```javascript
// Override OFT contract address and destination endpoint id
const customResult = await bridgeProtocol.bridge({
  targetChain: 'arbitrum',
  recipient: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  token: '0xdac17f958d2ee523a2206206994597c13d831ec7',
  amount: 1000000n,
  oftContractAddress: '0xYourCustomOftContractAddress',
  dstEid: 30110
})

console.log('Custom route bridge hash:', customResult.hash)

const customQuote = await bridgeProtocol.quoteBridge({
  targetChain: 'arbitrum',
  recipient: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  token: '0xdac17f958d2ee523a2206206994597c13d831ec7',
  amount: 1000000n,
  oftContractAddress: '0xYourCustomOftContractAddress',
  dstEid: 30110
})

console.log('Custom route quote:', customQuote)
```

## Error Handling

```javascript
try {
  const result = await bridgeProtocol.bridge({
    targetChain: 'arbitrum',
    recipient: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    token: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    amount: 1000000n
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
  const account = new WalletAccountEvm(seedPhrase, "0'/0/0", {
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
  const amount = 1000000n
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
    const supportedChains = [
      'ethereum', 'arbitrum', 'optimism', 'polygon', 'berachain', 'ink',
      'plasma', 'conflux', 'corn', 'avalanche', 'celo', 'flare', 'hyperevm', 'mantle', 'megaeth',
      'monad', 'morph', 'rootstock', 'sei', 'stable', 'unichain', 'xlayer',
      'solana', 'ton', 'tron'
    ]
    if (!supportedChains.includes(targetChain)) {
      throw new Error('Chain not supported')
    }
    
    // Validate recipient format by target chain family
    if (['solana'].includes(targetChain)) {
      if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(recipient)) {
        throw new Error('Invalid Solana recipient address')
      }
    } else if (['ton', 'tron'].includes(targetChain)) {
      if (!recipient || recipient.length < 10) {
        throw new Error('Invalid non-EVM recipient address')
      }
    } else if (!recipient.startsWith('0x') || recipient.length !== 42) {
      throw new Error('Invalid EVM recipient address')
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


<table data-card-size="large" data-view="cards">
	<thead>
		<tr>
			<th></th>
			<th></th>
			<th></th>
			<th data-hidden data-card-target data-type="content-ref"></th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>Node.js Quickstart</strong>
			</td>
			<td>Get started with WDK in a Node.js environment</td>
			<td>
				<a href="../../../start-building/nodejs-bare-quickstart.md">Node.js & Bare Quickstart</a>
			</td>
		</tr>
        <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK Bridge USD₮0 EVM Protocol Configuration</strong>
			</td>
			<td>Get started with WDK's Bridge USD₮0 EVM Protocol configuration</td>
			<td>
				<a href="./configuration.md">WDK Bridge USD₮0 EVM Protocol Configuration</a>
			</td>
		</tr>
        <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK Bridge USD₮0 EVM Protocol API</strong>
			</td>
			<td>Get started with WDK's Bridge USD₮0 EVM Protocol API</td>
			<td>
				<a href="./api-reference.md">WDK Bridge USD₮0 EVM Protocol API</a>
			</td>
		</tr>
	</tbody>
</table>

***

### Need Help?

{% include "../../../.gitbook/includes/support-cards.md" %}

