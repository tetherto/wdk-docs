---
title: Wallet EVM ERC-4337 Configuration
description: Configuration options and settings for @tetherto/wdk-wallet-evm-erc-4337
icon: gear
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

# Configuration

## Wallet Configuration

The `WalletManagerEvmErc4337` requires a complete ERC-4337 configuration object with all required parameters:

```javascript
import WalletManagerEvmErc4337 from '@tetherto/wdk-wallet-evm-erc-4337'

const config = {
  // Required parameters
  chainId: 1,
  provider: 'https://rpc.mevblocker.io/fast',
  safeModulesVersion: '0.3.0', // '0.2.0' and '0.3.0' are valid
  entryPointAddress: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
  bundlerUrl: `https://api.pimlico.io/v1/ethereum/rpc?apikey=${PIMLICO_API_KEY}`,
  paymasterUrl: `https://api.pimlico.io/v2/ethereum/rpc?apikey=${PIMLICO_API_KEY}`,
  paymasterAddress: '0x777777777777AeC03fd955926DbF81597e66834C',
  transferMaxFee: 100000000000000,
  paymasterToken: {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7'
  }
}

const wallet = new WalletManagerEvmErc4337(seedPhrase, config)
```

## Account Configuration

Both `WalletAccountEvmErc4337` and `WalletAccountReadOnlyEvmErc4337` use the same configuration structure:

```javascript
import { WalletAccountEvmErc4337, WalletAccountReadOnlyEvmErc4337 } from '@tetherto/wdk-wallet-evm-erc-4337'

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
    safeModulesVersion: '0.3.0',
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

// Avalanche C-Chain
const config = { chainId: 43114 }

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

The `paymasterUrl` option specifies the URL of the paymaster service that sponsors transaction fees using ERC-20 tokens or sponsorship policies.

**Type:** `string`  
**Required:** Yes, for Paymaster Token mode and Sponsorship Policy mode. Not used in Native Coins mode.

**Example:**
```javascript
const config = {
  paymasterUrl: 'https://api.candide.dev/public/v3/ethereum'
}
```

### Paymaster Address

The `paymasterAddress` option specifies the address of the paymaster smart contract.

**Type:** `string`  
**Required:** Yes, for Paymaster Token mode only. Not used in Sponsorship Policy or Native Coins modes.

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
  safeModulesVersion: '0.3.0'
}
```

### Paymaster Token

The `paymasterToken` option specifies the ERC-20 token used for paying transaction fees through the paymaster.

**Type:** `object`  
**Required:** Yes, for Paymaster Token mode only. Not used in Sponsorship Policy or Native Coins modes.

**Properties:**
- `address` (string): The ERC-20 token contract address

**Example:**
```javascript
const config = {
  paymasterToken: {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' // USD₮
  }
}
```

### Sponsorship Policy ID

The `sponsorshipPolicyId` option specifies the sponsorship policy identifier for sponsored transactions.

**Type:** `string`  
**Required:** No (optional), only used in Sponsorship Policy mode.

**Example:**
```javascript
const config = {
  isSponsored: true,
  sponsorshipPolicyId: 'sp_my_policy_id'
}
```

### Gas Payment Mode Flags

These boolean flags control which gas payment mode is used. Only one mode should be active at a time.

#### `isSponsored`

Enables Sponsorship Policy mode, where a sponsor covers transaction fees.

**Type:** `boolean`  
**Default:** `false`

```javascript
const config = {
  isSponsored: true,
  paymasterUrl: 'https://api.candide.dev/public/v3/ethereum'
}
```

#### `useNativeCoins`

Enables Native Coins mode, where the user pays fees in the chain's native currency (ETH, MATIC, etc.).

**Type:** `boolean`  
**Default:** `false`

```javascript
const config = {
  useNativeCoins: true,
  transferMaxFee: 100000000000000n // Optional: max fee in wei
}
```

### Transfer Max Fee

The `transferMaxFee` option sets the maximum fee amount **in paymaster token units** for transfer operations. This prevents transactions with unexpectedly high fees. **Optional** parameter.

**Type:** `number | bigint`  
**Required:** No (optional)  
**Unit:** Paymaster token base units

**Example:**
```javascript
const config = {
  transferMaxFee: 100000 // 100,000 paymaster token units (e.g., 0.1 USD₮ if 6 decimals)
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


{% hint style="info" %}
**Supported Paymaster Tokens**

The following tokens are supported for gas payments on Ethereum Mainnet:

*   **USD₮**: `0xdAC17F958D2ee523a2206206994597C13D831ec7`
*   **USA₮**: `0x07041776f5007aca2a54844f50503a18a72a8b68`
*   **XAU₮**: `0x68749665ff8d2d112fa859aa293f07a622782f38`
{% endhint %}

```javascript
const ethereumConfig = {
  chainId: 1,
  provider: 'https://rpc.mevblocker.io/fast',
  bundlerUrl: 'https://api.candide.dev/public/v3/ethereum',
  paymasterUrl: 'https://api.candide.dev/public/v3/ethereum',
  paymasterAddress: '0x8b1f6cb5d062aa2ce8d581942bbb960420d875ba',
  entryPointAddress: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
  safeModulesVersion: '0.3.0',
  paymasterToken: {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' // USDT
  },
  transferMaxFee: 100000 // 100,000 paymaster token units (e.g., 0.1 USDT if 6 decimals)
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
  safeModulesVersion: '0.3.0',
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
  safeModulesVersion: '0.3.0',
  paymasterToken: {
    address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9' // USDT on Arbitrum
  },
  transferMaxFee: 100000
}
```

### Avalanche C-Chain

``` javascript
const avalancheConfig = {
  chainId: 43114,
  provider: 'https://avalanche-c-chain-rpc.publicnode.com',
  bundlerUrl: "https://public.pimlico.io/v2/43114/rpc",
  paymasterUrl: "https://public.pimlico.io/v2/43114/rpc",
  paymasterAddress: '0x8b1f6cb5d062aa2ce8d581942bbb960420d875ba',
  entryPointAddress: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
  safeModulesVersion: '0.3.0',
  paymasterToken: {
    address: '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7' // USDT
  },
  transferMaxFee: 100000 // 100,000 paymaster token units (e.g., 0.1 USDT if 6 decimals)
}
```

### Plasma

```javascript
// Plasma (example Layer 2)
const plasmaConfig = {
  chainId: 9745,
  provider: 'https://plasma.drpc.org',
  // For ERC-4337 support, optional fields:
  bundlerUrl: 'https://api.candide.dev/public/v3/9745',
  paymasterUrl: 'https://api.candide.dev/public/v3/9745',
  paymasterAddress: '0x8b1f6cb5d062aa2ce8d581942bbb960420d875ba',
  entryPointAddress: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
  safeModulesVersion: '0.3.0',
  paymasterToken: {
    address: '0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb' // USDT
  },
  transferMaxFee: 100000 // 100,000 paymaster token units (e.g., 0.1 USDT if 6 decimals)
}
```

### Sepolia Testnet (USD₮ ERC-20 mock/testnet only)

````javascript

// Pimlico
const sepoliaConfigPimlico = {
  chainId: 11155111,
  provider: 'https://sepolia.drpc.org',
  bundlerUrl: 'https://public.pimlico.io/v2/11155111/rpc',
  paymasterUrl: 'https://public.pimlico.io/v2/11155111/rpc',
  paymasterAddress: '0x777777777777AeC03fd955926DbF81597e66834C',
  entryPointAddress: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
  safeModulesVersion: '0.3.0',
  paymasterToken: {
    address: '0xd077a400968890eacc75cdc901f0356c943e4fdb' // USDT Sepolia
  }, 
  transferMaxFee: 100000 // 0.1 USDT (6 decimals)
}

// Candide
const sepoliaConfigCandide = {
  chainId: 11155111,
  provider: 'https://sepolia.drpc.org',
  bundlerUrl: 'https://api.candide.dev/public/v3/11155111',
  paymasterUrl: 'https://api.candide.dev/public/v3/11155111',
  paymasterAddress: '0x8b1f6cb5d062aa2ce8d581942bbb960420d875ba',
  entryPointAddress: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
  safeModulesVersion: '0.3.0',
  paymasterToken: {
    address: '0xd077a400968890eacc75cdc901f0356c943e4fdb' // USDT Sepolia
  },   
  transferMaxFee: 100000
}
````

**Important**
Ethereum Sepolia is a testnet. The USD₮ tokens available at the links below are not real and do not entitle the holder to anything. In particular, they cannot be redeemed with Tether International, S.A. de C.V. ("Tether International") and are not Tether Tokens as described in [Tether International's Terms of Service](https://tether.to/en/legal). The USD₮ tokens available at the links below on this testnet are intended for testing WDK on Ethereum Sepolia. The links below are links to third-party websites and are Third-Party Information as described in Tether Operations, S.A. de [C.V.'s Website Terms](https://tether.io/terms/)

**USD₮ on Sepolia contract:** [0xd077a400968890eacc75cdc901f0356c943e4fdb](https://sepolia.etherscan.io/address/0xd077a400968890eacc75cdc901f0356c943e4fdb)

**Get test USD₮:**
- [Pimlico faucet](https://dashboard.pimlico.io/test-erc20-faucet)
- [Candide faucet](https://dashboard.candide.dev/faucet)

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
				<a href="../../../start-building/nodejs-bare-quickstart.md">nodejs-quickstart.md</a>
			</td>
		</tr>
    <tr>
			<td>
				<i class="fa-mobile-alt">:mobile-alt:</i>
			</td>
			<td>
				<strong>React Native Quickstart</strong>
			</td>
			<td>Build mobile wallets with React Native Expo</td>
			<td>
				<a href="../../../start-building/react-native-quickstart.md">react-native-quickstart.md</a>
			</td>
		</tr>
    <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK EVM with ERC-4337 Wallet Usage</strong>
			</td>
			<td>Get started with WDK's EVM with ERC-4337 Wallet Usage</td>
			<td>
				<a href="./usage.md">WDK EVM with ERC-4337 Wallet Usage</a>
			</td>
		</tr>
        <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK EVM with ERC-4337 Wallet API</strong>
			</td>
			<td>Get started with WDK's EVM with ERC-4337 Wallet API</td>
			<td>
				<a href="./api-reference.md">WDK EVM with ERC-4337 Wallet API</a>
			</td>
		</tr>
	</tbody>
</table>

***

### Need Help?

{% include "../../../.gitbook/includes/support-cards.md" %}


