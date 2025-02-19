# Mobile Integration Guide

## Overview

In this guide, we'll work through the process of integrating the WDK (Wallet Development Kit) into your mobile application.

We will be using the `lib-wallet-bare` library, it's designed to seamlessly integrate WDK into React Native Bare Kit projects. 

## Key Features of lib-wallet-bare

- Native WDK integration for React Native Bare Kit
- Platform-specific bundles for iOS and Android
- Secure IPC communication layer
- Comprehensive wallet management capabilities

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Bundle Integration](#bundle-integration)
- [Setting up Worklet](#setting-up-worklet)
  - [Setup Storage Path](#1-setup-storage-path)
  - [Import Required Bundles](#2-import-required-bundles)
  - [Initialize Worklet](#3-initialize-worklet)
  - [Important Notes](#important-notes)
- [Wallet Operations](#wallet-operations)
  - [Create RPC Message Helper](#create-rpc-message-helper)
  - [Wallet Management](#wallet-management)
    - [Load an Existing Wallet](#load-an-existing-wallet)
    - [Get Wallet List](#get-wallet-list)
    - [Get Wallet Details](#get-wallet-details)
  - [Asset Operations](#asset-operations)
    - [Get Balance](#get-balance)
    - [Generate New Address](#generate-new-address)
    - [Get Transaction History](#get-transaction-history)
    - [Send Transaction](#send-transaction)
    - [Get Fee Estimate](#get-fee-estimate)
    - [Get Connection Status](#get-connection-status)
    - [Get Funded Addresses](#get-funded-addresses)
  - [Handling Responses](#handling-responses)
  - [Example Usage](#example-usage)
- [Best Practices](#best-practices)
- [Next Steps](#next-steps)

## Prerequisites

- React Native Bare Kit project
- Node.js and npm installed
- Basic understanding of React Native development

## Installation

1. Add lib-wallet-bare to your project:
```bash
npm install lib-wallet-bare
```

2. Install peer dependencies:
```bash
npm install react-native-bare-kit react-native-fs
```

## Bundle Integration

Before we can start integrating the WDK into your project, we need to generate the platform-specific bundles. 

1. Run the following command to generate the bundles:

```bash
# For iOS
npm run bundle-ios-local

# For Android
npm run bundle-android-local

# For both platforms
npm run bundle-local
```

2. Copy the generated bundles to the root directory of your project:
- `ios.bundle.cjs` for iOS
- `android.bundle.cjs` for Android

## Setting up Worklet in your project

After installing the dependencies and generating the bundles, the next step is to set up the Worklet. 

The Worklet provides the IPC (Inter-Process Communication) channel that enables communication between your React Native app and BareKit, which in turn communicates with the WDK.


Let's set up and integrate the Worklet:

### 1. Setup Storage Path

First, we need to set up a storage path for the wallet data:

```typescript
import RNFS from 'react-native-fs';
const storePath = RNFS.DocumentDirectoryPath;
```

### 2. Import Required Bundles

Import the platform-specific bundles that we generated earlier:

```typescript
const iosBundle = require('<DIR>/ios.bundle.cjs');
const androidBundle = require('<DIR>/android.bundle.cjs');
```

Note : Make sure to use the correct path to the bundles.

### 3. Initialize Worklet

Here's how to set up the Worklet with proper initialization and cleanup:

```typescript
import React, { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { Worklet } from 'react-native-bare-kit';

function YourComponent() {
  const [ipc, setIpc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const worklet = new Worklet();

  // Setup the bundle and IPC communication
  async function setupBundle() {
    const socket = worklet.IPC;
    setIpc(socket);
    socket.setEncoding('utf8');
    
    // Handle incoming messages
    socket.on('data', (data: string) => {
      const response = JSON.parse(data);
      console.log("From WDK:", response);
    });

    // Initialize RPC with storage configuration
    socket.write(rpcMsg('rpc.start', [{
      store_path: storePath
    }]));
  }

  // Initialize Worklet on component mount
  useEffect(() => {
    const bundle = Platform.OS === 'ios' ? iosBundle : androidBundle;
    
    worklet.start('/app.bundle', bundle)
      .then(() => {
        setLoading(false);
        setupBundle();
      })
      .catch((error) => {
        console.error('Failed to start worklet:', error);
      });

    // Cleanup on unmount
    return () => {
      worklet.terminate();
    };
  }, []);

  // Your component JSX here
}
```

### Important Notes

- The Worklet must be initialized before any wallet operations can be performed
- Always handle the loading state appropriately in your UI
- Make sure to clean up the Worklet when the component unmounts
- Handle errors that might occur during initialization
- The IPC connection is used for all subsequent communication with the WDK

### 5. Wallet Operations

After setting up the Worklet, you can perform various wallet operations. All operations are performed through RPC calls using the IPC connection.

### Create RPC Message Helper

Create an optional helper function to format RPC messages:

```typescript
function rpcMsg(method: string, params: any[]): string {
  return JSON.stringify({
    method,
    params
  });
}
```

### Wallet Management

These operations handle wallet creation, loading, and management tasks.

#### Create a New Wallet
```typescript
// Create a new wallet with BTC and ETH assets
const createWallet = () => {
  if (!ipc) return;
  
  const walletConfig = {
    store_path: storePath,
    name: 'default',
    assets: [
      {
        module: 'lib-wallet-pay-btc',
        name: 'btc',
        network: 'regtest',
        endpoints: {
          host: 'ws://34.65.144.199',
          port: '8001'
        }
      },
      {
        module: 'lib-wallet-pay-eth',
        name: 'eth',
        network: 'sepolia',
        endpoints: {
          web3: 'ws://34.65.144.199/eth/hardhat/indexer/web3',
          indexerWs: 'ws://34.65.144.199/eth/hardhat/indexer/ws',
          indexer: 'http://34.65.144.199/eth/hardhat/indexer/rpc'
        }
      },
      // Add more assets here as needed
    ],
    seed: {
      mnemonic: 'your twelve word mnemonic here'
    }
  };
  
  // Create a wallet with the given config
  ipc.write(rpcMsg('manager.createWallet', [walletConfig]));
};
```

Note : Always make sure to check if the IPC connection is available before making any calls.

#### Load an Existing Wallet
```typescript
const loadWallet = (walletName: string) => {
  ipc.write(rpcMsg('manager.loadWallet', [{
    name: walletName
  }]));
};
```

#### Get Wallet List
```typescript
const getWalletList = () => {
  ipc.write(rpcMsg('manager.getWalletList', []));
};
```

#### Get Wallet Details
```typescript
const getWallet = (walletName: string) => {
  ipc.write(rpcMsg('manager.getWallet', [{
    single: walletName
  }]));
};
```

### Asset Operations

These operations are specific to cryptocurrency assets within a wallet. Each operation is performed on a specific asset (e.g., 'btc' or 'eth').

The RPC are structured as follows :
```typescript
wallet.${walletName}.pay.${currency}.${action}
```

where :
- ${walletName} is the name of the wallet
- ${currency} is the currency of the asset
- ${action} is the action to perform


Note : Always make sure to check if the IPC connection is available before making any calls.

#### Get Balance
```typescript
const getBalance = (walletName: string, currency: string = 'btc') => {
  ipc.write(rpcMsg(`wallet.${walletName}.pay.${currency}.getBalance`, []));
};
```

#### Generate New Address
```typescript
const getNewAddress = (walletName: string, currency: string = 'btc') => {
  ipc.write(rpcMsg(`wallet.${walletName}.pay.${currency}.getNewAddress`, []));
};
```

#### Get Transaction History
```typescript
const getTransactions = (walletName: string, currency: string = 'btc') => {
  ipc.write(rpcMsg(`wallet.${walletName}.pay.${currency}.getTransactions`, []));
};
```

#### Send Transaction
```typescript
interface TransactionParams {
  recipientAddress: string;
  amount: string;
  fee?: string;
}

const sendTransaction = (
  walletName: string, 
  currency: string = 'btc',
  params: TransactionParams
) => {
  ipc.write(rpcMsg(`wallet.${walletName}.pay.${currency}.sendTransaction`, [{
    address: params.recipientAddress,
    amount: params.amount,
    unit: 'base',
    fee: params.fee
  }]));
};
```

#### Get Fee Estimate
```typescript
const getFeeEstimate = (walletName: string, currency: string = 'btc') => {
  ipc.write(rpcMsg(`wallet.${walletName}.pay.${currency}.getFeeEstimate`, []));
};
```

#### Get Connection Status
```typescript
const getConnectionStatus = (walletName: string, currency: string = 'btc') => {
  ipc.write(rpcMsg(`wallet.${walletName}.pay.${currency}.getConnectionStatus`, []));
};
```

#### Get Funded Addresses
```typescript
const getFundedAddresses = (walletName: string, currency: string = 'btc') => {
  ipc.write(rpcMsg(`wallet.${walletName}.pay.${currency}.getFundedAddresses`, []));
};
```

### Handling Responses

All RPC calls return responses through the IPC channel. The responses follow this format:

```typescript
interface WDKResponse {
  // For successful responses
  result?: any;        // The actual result data
  cid?: string | null; // Correlation ID if provided in the request

  // For error responses
  error?: {
    code: number;      // Error code (e.g., -32700 for invalid JSON)
    msg: string;       
  };

  // For status notifications
  method?: string;     // e.g., "rpc.status"
  params?: [{         // Status parameters
    status: string;   // e.g., "ready", "error"
    message: string | null;
  }];
}
```

Common response types:

1. **Success Response**:
```typescript
{
  result: { /* operation result */ },
  cid: "correlation-id"  // if provided in request
}
```

2. **Error Response**:
```typescript
{
  error: {
    code: -32601,  // Error code
    msg: "Method not found"  // Error message
  },
  cid: "correlation-id"  // if provided in request
}
```

3. **Status Notification**:
```typescript
{
  method: "rpc.status",
  params: [{
    status: "ready",
    message: null
  }],
  cid: "correlation-id"
}
```

Here's how to handle these responses:

```typescript
socket.on('data', (data: string) => {
  const response: WDKResponse = JSON.parse(data);
  
  // Handle status notifications
  if (response.method === 'rpc.status') {
    const status = response.params?.[0].status;
    switch (status) {
      case 'ready':
        console.log('RPC is ready');
        break;
      case 'error':
        console.error('RPC error:', response.params?.[0].message);
        break;
    }
    return;
  }

  // Handle errors
  if (response.error) {
    console.error(`Error ${response.error.code}: ${response.error.msg}`);
    return;
  }

  // Handle successful results
  if (response.result) {
    console.log('Operation result:', response.result);
  }
});
```

Common Error Codes:
- `-32700`: Invalid JSON
- `-32600`: Invalid Request
- `-32601`: Method not found
- `-32000`: RPC not started
- `-32001`: Uncaught exception
- `-32002`: Unhandled rejection

### Example Usage

Here's a complete example showing how to use these operations in a component:

```typescript
function WalletComponent() {
  const [ipc, setIpc] = useState<any>(null);
  const [balance, setBalance] = useState<string>('0');
  const [address, setAddress] = useState<string>('');
  
  // ... Worklet setup code from previous section ...

  // Handle responses
  useEffect(() => {
    if (!ipc) return;
    
    ipc.on('data', (data: string) => {
      const response = JSON.parse(data);
      
      if (response.error) {
        console.error('WDK Error:', response.error);
        return;
      }

      if (response.result?.balance) {
        setBalance(response.result.balance);
      }
      
      if (response.result?.address) {
        setAddress(response.result.address);
      }
    });
  }, [ipc]);

  // Example function to initialize wallet
  const initializeWallet = async () => {
    // Create wallet
    createWallet();
    
    // Get initial balance
    getBalance('default', 'btc');
    
    // Generate address
    getNewAddress('default', 'btc');
  };

  return (
    // Your UI components here
  );
}
```

Please refer to wdk-bare-expo for a complete example.

## Best Practices

1. **Error Handling**
   - Always check if IPC is available before making calls
   - Handle RPC errors appropriately
   - Provide user feedback for failed operations

2. **State Management**
   - Keep track of wallet state (loading, ready, error)
   - Cache responses when appropriate
   - Update UI state based on RPC responses

3. **Security**
   - Never store sensitive data (mnemonics, private keys) in plain text
   - Clear sensitive data when component unmounts
   - Implement proper authentication before wallet operations

4. **Performance**
   - Avoid unnecessary RPC calls
   - Implement proper loading states
   - Handle background/foreground transitions

## Next Steps

Now that you have a complete understanding of wallet operations, you can:
1. Implement a full wallet interface
2. Add error recovery mechanisms
3. Implement proper state management
4. Add security features
