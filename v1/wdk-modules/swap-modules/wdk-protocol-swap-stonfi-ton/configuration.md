---
title: Swap Stonfi TON Configuration
description: Configuration options and settings for @tetherto/wdk-protocol-swap-stonfi-ton
lastReviewed: 2025-09-04
icon: gear
---

# Configuration

## Swap Service Configuration

The `StonFiProtocolTon` accepts a configuration object that sets how the swap service works:

```javascript
import StonFiProtocolTon from '@tetherto/wdk-protocol-swap-stonfi-ton'
import { WalletAccountTon } from '@tetherto/wdk-wallet-ton'

// Create wallet account first
const account = new WalletAccountTon(seedPhrase, {
  tonApiKey: 'YOUR_TON_API_KEY',
  tonApiEndpoint: 'YOUR_TON_API_ENDPOINT'
})

// Create swap service with configuration
const swapProtocol = new StonFiProtocolTon(account, {
  swapMaxFee: 1000000000n // Optional: Max swap fee in nanotons
})
```

## Account Configuration

The swap service uses the wallet account's configuration for TON access:

```javascript
import { WalletAccountTon, WalletAccountReadOnlyTon } from '@tetherto/wdk-wallet-ton'

// Full access account
const account = new WalletAccountTon(
  seedPhrase,
  {
    tonApiKey: 'YOUR_TON_API_KEY',
    tonApiEndpoint: 'YOUR_TON_API_ENDPOINT',
    tonCenterApiKey: 'YOUR_TON_CENTER_KEY',
    tonCenterEndpoint: 'YOUR_TON_CENTER_ENDPOINT'
  }
)

// Read-only account
const readOnlyAccount = new WalletAccountReadOnlyTon(
  'TON_ADDRESS', // TON address
  {
    tonApiKey: 'YOUR_TON_API_KEY',
    tonApiEndpoint: 'YOUR_TON_API_ENDPOINT'
  }
)

// Create swap service
const swapProtocol = new StonFiProtocolTon(account, {
  swapMaxFee: 1000000000n
})
```

## Configuration Options

### Swap Max Fee

The `swapMaxFee` option sets a top limit for total swap costs to prevent very high fees.

**Type:** `bigint` (optional)  
**Unit:** Nanotons (1 TON = 1000000000 nanotons)

**Examples:**

```javascript
const config = {
  // Set max swap fee to 1 TON
  swapMaxFee: 1000000000n,
}

// Usage example
try {
  const result = await swapProtocol.swap({
    tokenIn: 'ton',
    tokenOut: 'JETTON_TOKEN_ADDRESS',
    tokenInAmount: 1000000000n
  })
} catch (error) {
  if (error.message.includes('max fee')) {
    console.error('Swap stopped: Fee too high')
  }
}
```

### TON API Configuration

The TON API options come from the wallet account configuration and tell how to connect to TON:

**TON API Key:** `string` - Your TON API access key  
**TON API Endpoint:** `string` - TON API server URL  
**TON Center Key:** `string` - TON Center access key (optional)  
**TON Center Endpoint:** `string` - TON Center server URL (optional)

**Examples:**

```javascript
// Basic TON connection
const account = new WalletAccountTon(seedPhrase, {
  tonApiKey: 'YOUR_TON_API_KEY',
  tonApiEndpoint: 'https://tonapi.io'
})

// Full TON connection with TON Center
const account = new WalletAccountTon(seedPhrase, {
  tonApiKey: 'YOUR_TON_API_KEY',
  tonApiEndpoint: 'https://tonapi.io',
  tonCenterApiKey: 'YOUR_TON_CENTER_KEY',
  tonCenterEndpoint: 'https://toncenter.com'
})
```

## Gasless Configuration

When using gasless accounts, you can change configuration options during swap operations:

```javascript
// Swap with gasless account
const result = await swapProtocol.swap({
  tokenIn: 'JETTON_TOKEN_ADDRESS_A',
  tokenOut: 'JETTON_TOKEN_ADDRESS_B',
  tokenInAmount: 1000000n
}, {
  paymasterToken: 'USDT', // Token used to pay for fees
  swapMaxFee: 1000000000n // Change max swap fee
})
```

### Paymaster Token

The `paymasterToken` option says which token to use for paying fees in gasless accounts.

**Type:** `string` (optional)  
**Format:** Token name or address

**Example:**

```javascript
const result = await swapProtocol.swap({
  tokenIn: 'USDT_TOKEN_ADDRESS',
  tokenOut: 'USDT_TOKEN_ADDRESS',
  tokenInAmount: 1000000n
}, {
  paymasterToken: 'USDT' // Use USDT to pay fees
})
```

**Note:** Gasless swaps only work with jetton-to-jetton pairs. TON-to-jetton and jetton-to-TON swaps need standard (non-gasless) accounts.

## Network Support

The swap service works with TON network. Change the API settings in the wallet account configuration:

```javascript
// TON Mainnet
const tonAccount = new WalletAccountTon(seedPhrase, {
  tonApiKey: 'YOUR_TON_API_KEY',
  tonApiEndpoint: 'https://tonapi.io'
})

// TON Testnet
const tonTestAccount = new WalletAccountTon(seedPhrase, {
  tonApiKey: 'YOUR_TON_API_KEY',
  tonApiEndpoint: 'https://testnet.tonapi.io'
})
```

## Swap Options

When calling the swap method, you need to give swap options:

```javascript
const swapOptions = {
  tokenIn: 'ton', // Token to sell
  tokenOut: 'JETTON_TOKEN_ADDRESS', // Token to buy
  tokenInAmount: 1000000000n, // Amount to sell in base units
  slippageTolerance: 0.01 // 1% slippage (optional)
}

const result = await swapProtocol.swap(swapOptions)
```

### Token In

The `tokenIn` option says which token to sell.

**Type:** `string`  
**Format:** Use `'ton'` for native TON or jetton token address

### Token Out

The `tokenOut` option says which token to buy.

**Type:** `string`  
**Format:** Use `'ton'` for native TON or jetton token address

### Token In Amount

The `tokenInAmount` option says how many tokens to sell.

**Type:** `bigint`  
**Unit:** Base units of the token (for TON: 1 TON = 1000000000n nanotons)

### Token Out Amount

The `tokenOutAmount` option says how many tokens to buy (exact output).

**Type:** `bigint`  
**Unit:** Base units of the token

**Note:** Use either `tokenInAmount` OR `tokenOutAmount`, not both.

### Slippage Tolerance

The `slippageTolerance` option sets how much price change you accept.

**Type:** `number` (optional)  
**Format:** Decimal number (0.01 = 1%)  
**Default:** 0.0001 (0.01%)

**Examples:**

```javascript
// Allow 1% price change
slippageTolerance: 0.01

// Allow 0.5% price change
slippageTolerance: 0.005

// Allow 2% price change
slippageTolerance: 0.02
```

### Recipient Address

The `to` option says where to send the bought tokens.

**Type:** `string` (optional)  
**Format:** Valid TON address  
**Default:** Your own address

**Example:**

```javascript
const result = await swapProtocol.swap({
  tokenIn: 'ton',
  tokenOut: 'JETTON_TOKEN_ADDRESS',
  tokenInAmount: 1000000000n,
  to: 'RECIPIENT_TON_ADDRESS' // Send tokens here
})
```

## Error Handling

The swap service will throw errors for bad configurations:

```javascript
try {
  const result = await swapProtocol.swap({
    tokenIn: 'ton',
    tokenOut: 'BAD_TOKEN_ADDRESS',
    tokenInAmount: 1000000000n
  })
} catch (error) {
  if (error.message.includes('liquidity pool')) {
    console.error('No liquidity for this token pair')
  }
  if (error.message.includes('max fee')) {
    console.error('Swap fee too high')
  }
  if (error.message.includes('ton center')) {
    console.error('TON connection problem')
  }
  if (error.message.includes('read-only')) {
    console.error('Read-only account cannot swap')
  }
  if (error.message.includes('gasless')) {
    console.error('Gasless accounts cannot swap TON')
  }
}
```