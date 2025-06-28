---
title: Wallet EVM ERC-4337 Configuration
description: Configuration options and settings for @wdk/wallet-evm-erc-4337
author: Matteo Giardino
lastReviewed: 2025-06-26
icon: gear
---

# Configuration

## Wallet Configuration

```javascript
const config = {
  chainId: 1, // Ethereum mainnet
  provider: 'https://rpc.mevblocker.io/fast',
  bundlerUrl: 'https://api.candide.dev/public/v3/ethereum',
  paymasterUrl: 'https://api.candide.dev/public/v3/ethereum',
  paymasterAddress: '0x8b1f6cb5d062aa2ce8d581942bbb960420d875ba',
  entryPointAddress: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
  safeModulesVersion: '1.0.0',
  paymasterToken: {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7'
  },
  transferMaxFee: 5000000
}

const wallet = new WalletManagerEvmErc4337(seedPhrase, config)
```

## Account Configuration

```javascript
const accountConfig = {
  chainId: 1,
  provider: 'https://rpc.mevblocker.io/fast',
  bundlerUrl: 'https://api.candide.dev/public/v3/ethereum',
  paymasterUrl: 'https://api.candide.dev/public/v3/ethereum',
  paymasterAddress: '0x8b1f6cb5d062aa2ce8d581942bbb960420d875ba',
  entryPointAddress: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
  safeModulesVersion: '1.0.0',
  paymasterToken: {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7'
  },
  transferMaxFee: 5000000
}

const account = new WalletAccountEvmErc4337(seedPhrase, "0'/0/0", accountConfig)
```

## Configuration Options

### Chain ID

The `chainId` option specifies the blockchain network ID.

**Type:** `number`

**Examples:**
```javascript
// Ethereum Mainnet
const config = {
  chainId: 1
}

// Polygon Mainnet
const config = {
  chainId: 137
}

// Arbitrum One
const config = {
  chainId: 42161
}
```

### Provider

The `provider` option specifies the RPC endpoint or EIP-1193 provider instance to use for blockchain interactions.

**Type:** `string | Eip1193Provider`

**Examples:**
```javascript
// Using RPC URL
const config = {
  provider: 'https://rpc.mevblocker.io/fast'
}

// Using custom provider instance
const config = {
  provider: customProviderInstance
}
```

### Bundler URL

The `bundlerUrl` option specifies the URL of the bundler service that handles UserOperation bundling and submission.

**Type:** `string`

**Example:**
```javascript
const config = {
  bundlerUrl: 'https://api.candide.dev/public/v3/ethereum'
}
```

### Paymaster URL

The `paymasterUrl` option specifies the URL of the paymaster service that sponsors transaction fees.

**Type:** `string`

**Example:**
```javascript
const config = {
  paymasterUrl: 'https://api.candide.dev/public/v3/ethereum'
}
```

### Paymaster Address

The `paymasterAddress` option specifies the address of the paymaster smart contract.

**Type:** `string`

**Example:**
```javascript
const config = {
  paymasterAddress: '0x8b1f6cb5d062aa2ce8d581942bbb960420d875ba'
}
```

### Entry Point Address

The `entryPointAddress` option specifies the address of the ERC-4337 entry point smart contract.

**Type:** `string`

**Example:**
```javascript
const config = {
  entryPointAddress: '0x0000000071727De22E5E9d8BAf0edAc6f37da032'
}
```

### Safe Modules Version

The `safeModulesVersion` option specifies the Safe modules version to use.

**Type:** `string`

**Example:**
```javascript
const config = {
  safeModulesVersion: '1.0.0'
}
```

### Paymaster Token

The `paymasterToken` option specifies the ERC-20 token used for paying transaction fees.

**Type:** `object`

**Properties:**
- `address` (string): The token contract address

**Example:**
```javascript
const config = {
  paymasterToken: {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' // USDT
  }
}
```

### Transfer Max Fee

The `transferMaxFee` option sets the maximum fee amount (in wei) for transfer operations. This helps prevent transactions from being sent with unexpectedly high fees.

**Type:** `number`

**Example:**
```javascript
const config = {
  transferMaxFee: 5000000 // 0.005 ETH in wei
}
```

## Configuration Examples

### Ethereum Mainnet Configuration

```javascript
const ethereumConfig = {
  chainId: 1, // Ethereum mainnet
  provider: 'https://rpc.mevblocker.io/fast',
  bundlerUrl: 'https://api.candide.dev/public/v3/ethereum',
  paymasterUrl: 'https://api.candide.dev/public/v3/ethereum',
  paymasterAddress: '0x8b1f6cb5d062aa2ce8d581942bbb960420d875ba',
  entryPointAddress: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
  safeModulesVersion: '1.0.0',
  paymasterToken: {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7'
  }
}
```

### Arbitrum One Configuration

```javascript
const arbitrumConfig = {
  chainId: 42161, // Arbitrum One
  provider: 'https://1rpc.io/arb',
  bundlerUrl: 'https://public.pimlico.io/v2/42161/rpc',
  paymasterUrl: 'https://public.pimlico.io/v2/42161/rpc',
  paymasterAddress: '0x777777777777AeC03fd955926DbF81597e66834C',
  entryPointAddress: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
  safeModulesVersion: '1.0.0',
  paymasterToken: {
    address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9'
  },
}
```

### Polygon Configuration

```javascript
const polygonConfig = {
  chainId: 137, // Polygon mainnet
  provider: 'https://polygon-rpc.com',
  bundlerUrl: 'https://api.candide.dev/public/v3/polygon',
  paymasterUrl: 'https://api.candide.dev/public/v3/polygon',
  paymasterAddress: '0x8b1f6cb5d062aa2ce8d581942bbb960420d875ba',
  entryPointAddress: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
  safeModulesVersion: '0.3.0',
  paymasterToken: {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7'
  },
}
``` 