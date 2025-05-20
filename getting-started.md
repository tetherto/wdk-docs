# Getting Started

The Wallet Development Kit (WDK) enables developers to build secure, non-custodial blockchain wallets with minimal effort. This guide provides a streamlined introduction to installing, configuring, and initializing WDK in your project.

---

## Installation

Install the WDK core package using npm:

```bash
npm install wdk-core
```

---

## Quick Start

The following example demonstrates how to initialize WDK and generate two addresses from the same seed phrase:
- An ERC-4337 abstracted address for Polygon
- A Spark address

```javascript
import WdkManager from 'wdk-core';

const seedPhrase = "your twelve word seed phrase goes here";
const config = {
  polygon: {
    "chainId": 137,
    "rpcUrl": "https://polygon",
    "bundlerUrl": "https://api.pimlico.io/v2/137/rpc",
    "paymasterUrl": "https://api.pimlico.io/v2/137/rpc",
    "paymasterAddress": "0x777777777777AeC03fd955926DbF81597e66834C",
    "entryPointAddress": "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
    "safeModulesVersion": "0.3.0",
    "paymasterToken": {
        "address": "0xdAC17F958D2ee523a2206206994597C13D831ec7"
    }
  },
  spark: {
    blockchain: "MAINNET"
  }
};

const wdk = new WdkManager(seedPhrase, config);

// Generate an ERC-4337 abstracted address for Polygon
const polygonAddress = await wdk.getAbstractedAddress("polygon", 0);
console.log("Your Polygon ERC-4337 address:", polygonAddress);

// Generate a Spark address
const sparkAddress = await wdk.getAddress("spark", 0);
console.log("Your Spark address:", sparkAddress);
```

---

## Next Steps

- Explore [Core Concepts](core-concepts.md) for architectural details
- Review the [API Reference](api-reference.md) for available methods
- See [Supported Blockchains](supported-blockchains.md)
- For troubleshooting, consult the [FAQ](faq.md)

---

For further assistance, please open an issue or contact support as described in the [README](README.md). 