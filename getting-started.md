# Getting Started

Welcome to the Wallet Development Kit (WDK)! This guide will help you set up and start building with WDK in minutes.

---

## Prerequisites
- Node.js v14 or higher
- npm
- Basic knowledge of JavaScript/TypeScript
- Familiarity with blockchain concepts

---

## Installation
Install WDK via npm:
```bash
npm install wdk-core
```

---

## Hello World Example
A minimal example to get your first wallet address:
```javascript
import WdkManager from 'wdk-core';

const seedPhrase = "your twelve word seed phrase goes here";
const config = {
  ethereum: {
    chainId: 1,
    blockchain: "ethereum",
    rpcUrl: "https://rpc.ankr.com/eth/YOUR_API_KEY"
  }
};

const wdk = new WdkManager(seedPhrase, config);
const address = await wdk.getAbstractedAddress("ethereum", 0);
console.log("Your Ethereum address:", address);
```

---

## Initialization
Import and initialize WDK with your seed phrase and blockchain configuration:
```javascript
import WdkManager from 'wdk-core';

const seedPhrase = "your twelve word seed phrase goes here";
const config = {
  ethereum: {
    chainId: 1,
    blockchain: "ethereum",
    rpcUrl: "https://rpc.ankr.com/eth/YOUR_API_KEY",
    // ...other config fields
  },
  // Add more blockchains as needed
};

const wdk = new WdkManager(seedPhrase, config);
```
> **Security Tip:** Never expose your seed phrase or API keys in client-side code or public repositories.

---

## Configuration
Each blockchain requires a configuration object. Example fields:

| Field             | Description                                 |
|-------------------|---------------------------------------------|
| chainId           | Network chain ID                            |
| blockchain        | Blockchain name (e.g., "ethereum")          |
| rpcUrl            | RPC endpoint URL                            |
| ...               | ...                                         |

See [Core Concepts](core-concepts.md) for more details on statelessness and abstraction.

---

## Troubleshooting
- **Missing dependencies?** Ensure you are using Node.js v14+ and have run `npm install`.
- **Network errors?** Double-check your RPC URLs and API keys.
- **React Native?** You may need to polyfill Node.js modules like `crypto`, `buffer`, and `stream`.
- **Still stuck?** See the [FAQ](faq.md) or open an issue.

---

## Next Steps
> 🚀 Now that you're set up, explore [Core Concepts](core-concepts.md) and dive into the [API Reference](api-reference.md) to unlock the full power of WDK! 