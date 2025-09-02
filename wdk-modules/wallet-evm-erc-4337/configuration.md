---
title: Wallet EVM ERC-4337 Configuration
description: Configuration options and settings for @wdk/wallet-evm-erc-4337
author: Matteo Giardino
lastReviewed: 2025-08-31
icon: gear
---

# Configuration

## Wallet Configuration

The `WalletManagerEvmErc4337` requires a complete ERC-4337 configuration object with all required parameters:

```javascript
import WalletManagerEvmErc4337 from '@wdk/wallet-evm-erc-4337'

const config = {
  // Required parameters
  chainId: 1, // Ethereum mainnet
  provider: 'https://rpc.mevblocker.io/fast',
  bundlerUrl: 'https://api.candide.dev/public/v3/ethereum',
  paymasterUrl: 'https://api.candide.dev/public/v3/ethereum',
  paymasterAddress: '0x8b1f6cb5d062aa2ce8d581942bbb960420d875ba',
  entryPointAddress: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
  safeModulesVersion: '1.0.0',
  paymasterToken: {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' // USDT
  },
  
  // Optional parameter
  transferMaxFee: 100000 // Maximum fee in paymaster token units
}

const wallet = new WalletManagerEvmErc4337(seedPhrase, config)
```

## Account Configuration

Both `WalletAccountEvmErc4337` and `WalletAccountReadOnlyEvmErc4337` use the same configuration structure:

```javascript
import { WalletAccountEvmErc4337, WalletAccountReadOnlyEvmErc4337 } from '@wdk/wallet-evm-erc-4337'

// Full access account
const account = new WalletAccountEvmErc4337(
  seedPhrase,
  "0'/0/0", // BIP-44 derivation path
  config    // Same config as wallet manager
)

// Read-only account (transferMaxFee not needed)
const readOnlyAccount = new WalletAccountReadOnlyEvmErc4337(
  '0x...', // Smart contract wallet address
  {
    chainId: 1,
    provider: 'https://rpc.mevblocker.io/fast',
    bundlerUrl: 'https://api.candide.dev/public/v3/ethereum',
    paymasterUrl: 'https://api.candide.dev/public/v3/ethereum',
    paymasterAddress: '0x8b1f6cb5d062aa2ce8d581942bbb960420d875ba',
    entryPointAddress: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
    safeModulesVersion: '1.0.0',
    paymasterToken: {
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7'
    }
    // Note: transferMaxFee omitted for read-only accounts
  }
)
```

## Configuration Options

### Chain ID

The `chainId` option specifies the blockchain network ID. **Required** for fee estimation and Safe4337Pack initialization.

**Type:** `number`  
**Required:** Yes

**Examples:**
```javascript
// Ethereum Mainnet
const config = { chainId: 1 }

// Polygon Mainnet  
const config = { chainId: 137 }

// Arbitrum One
const config = { chainId: 42161 }

```

### Provider

The `provider` option specifies the RPC endpoint or EIP-1193 provider instance for blockchain interactions. **Required** for all operations.

**Type:** `string | Eip1193Provider`  
**Required:** Yes

**Examples:**
```javascript
// Using RPC URL
const config = {
  provider: 'https://rpc.mevblocker.io/fast'
}

// Using browser provider (MetaMask)
const config = {
  provider: window.ethereum
}

// Using custom ethers provider
import { JsonRpcProvider } from 'ethers'
const config = {
  provider: new JsonRpcProvider('https://rpc.mevblocker.io/fast')
}
```

### Bundler URL

The `bundlerUrl` option specifies the URL of the ERC-4337 bundler service that handles UserOperation bundling and submission to the mempool. **Required** for transaction processing.

**Type:** `string`  
**Required:** Yes

**Example:**
```javascript
const config = {
  bundlerUrl: 'https://api.candide.dev/public/v3/ethereum'
}
```

### Paymaster URL

The `paymasterUrl` option specifies the URL of the paymaster service that sponsors transaction fees using ERC-20 tokens. **Required** for gasless transactions.

**Type:** `string`  
**Required:** Yes

**Example:**
```javascript
const config = {
  paymasterUrl: 'https://api.candide.dev/public/v3/ethereum'
}
```

### Paymaster Address

The `paymasterAddress` option specifies the address of the paymaster smart contract. **Required** for paymaster integration.

**Type:** `string`  
**Required:** Yes

**Example:**
```javascript
const config = {
  paymasterAddress: '0x8b1f6cb5d062aa2ce8d581942bbb960420d875ba'
}
```

### Entry Point Address

The `entryPointAddress` option specifies the address of the ERC-4337 EntryPoint smart contract. **Required** for UserOperation processing.

**Type:** `string`  
**Required:** Yes

**Standard EntryPoint v0.7:**
```javascript
const config = {
  entryPointAddress: '0x0000000071727De22E5E9d8BAf0edAc6f37da032'
}
```

### Safe Modules Version

The `safeModulesVersion` option specifies the Safe modules version for smart contract wallet implementation. **Required** for Safe4337Pack initialization.

**Type:** `string`  
**Required:** Yes

**Example:**
```javascript
const config = {
  safeModulesVersion: '1.0.0'
}
```

### Paymaster Token

The `paymasterToken` option specifies the ERC-20 token used for paying transaction fees through the paymaster. **Required** for fee calculations and payments.

**Type:** `object`  
**Required:** Yes

**Properties:**
- `address` (string): The ERC-20 token contract address

**Example:**
```javascript
const config = {
  paymasterToken: {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' // USDT
  }
}
```

### Transfer Max Fee

The `transferMaxFee` option sets the maximum fee amount **in paymaster token units** for transfer operations. This prevents transactions with unexpectedly high fees. **Optional** parameter.

**Type:** `number`  
**Required:** No (optional)  
**Unit:** Paymaster token base units

**Example:**
```javascript
const config = {
  transferMaxFee: 100000 // 100,000 paymaster token units (e.g., 0.1 USDT if 6 decimals)
}

// Usage with error handling
try {
  const result = await account.transfer({
    token: '0x...',
    recipient: '0x...',
    amount: 1000000
  })
} catch (error) {
  if (error.message.includes('Exceeded maximum fee')) {
    console.error('Transfer cancelled: Fee too high')
  }
}
```

## Network-Specific Configurations

### Ethereum Mainnet

```javascript
const ethereumConfig = {
  chainId: 1,
  provider: 'https://rpc.mevblocker.io/fast',
  bundlerUrl: 'https://api.candide.dev/public/v3/ethereum',
  paymasterUrl: 'https://api.candide.dev/public/v3/ethereum',
  paymasterAddress: '0x8b1f6cb5d062aa2ce8d581942bbb960420d875ba',
  entryPointAddress: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
  safeModulesVersion: '1.0.0',
  paymasterToken: {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' // USDT
  },
  transferMaxFee: 100000 // 0.1 USDT
}
```

### Polygon Mainnet

```javascript
const polygonConfig = {
  chainId: 137,
  provider: 'https://polygon-rpc.com',
  bundlerUrl: 'https://api.candide.dev/public/v3/polygon',
  paymasterUrl: 'https://api.candide.dev/public/v3/polygon',
  paymasterAddress: '0x8b1f6cb5d062aa2ce8d581942bbb960420d875ba',
  entryPointAddress: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
  safeModulesVersion: '1.0.0',
  paymasterToken: {
    address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F' // USDT on Polygon
  },
  transferMaxFee: 100000
}
```

### Arbitrum One

```javascript
const arbitrumConfig = {
  chainId: 42161,
  provider: 'https://arb1.arbitrum.io/rpc',
  bundlerUrl: 'https://public.pimlico.io/v2/42161/rpc',
  paymasterUrl: 'https://public.pimlico.io/v2/42161/rpc',
  paymasterAddress: '0x777777777777AeC03fd955926DbF81597e66834C',
  entryPointAddress: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
  safeModulesVersion: '1.0.0',
  paymasterToken: {
    address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9' // USDT on Arbitrum
  },
  transferMaxFee: 100000
}
```