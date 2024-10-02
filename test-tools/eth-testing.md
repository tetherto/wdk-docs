# ETH test tools
## Setting up a Local Ethereum Network with Hardhat

This README guides you through setting up a local Ethereum network using Hardhat, deploying an ERC20 token, and performing token and ETH transfers.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Project Structure](#project-structure)
4. [Setting Up the Local Network](#setting-up-the-local-network)
5. [Deploying the ERC20 Token](#deploying-the-erc20-token)
6. [Performing ERC20 Token Transfers](#performing-erc20-token-transfers)
7. [Performing ETH Transfers](#performing-eth-transfers)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js (v12.0.0 or later)
- npm (usually comes with Node.js)

## Installation

1. Clone this repository and navigate to this directory


2. Install the dependencies:
   ```
   npm install
   ```

## Project Structure

```
.
├── contracts/
│   └── YourERC20Token.sol
├── scripts/
│   ├── deployer.js
│   ├── erc-transfer.js
│   └── eth-transfer.js
├── hardhat.config.js
├── index.js
└── README.md
```

## Setting Up the Local Network

To start your local Ethereum network:

For more detailed information, refer to the [Hardhat documentation](https://hardhat.org/getting-started/).

```
npx hardhat node
```

This command will start a local Ethereum network and display a list of available accounts with their private keys.

Keep this terminal window open while working with your local network.

**IMPORTANT: closing this process will reset your blockchain, you would need to redo any transactions you may have done**

## Deploying the ERC20 Token

To deploy your ERC20 token to the local network:

```
npx hardhat run scripts/deploy.js --network localhost
```

This script will deploy your ERC20 token and output the contract address. Make note of this address for future use.

## Performing ERC20 Token Transfers

To transfer ERC20 tokens:

```
ADDR=<recipient-address> AMT=<amount> npx hardhat run ./scripts/erc-transfer.js --network localhost
```

Replace `<recipient-address>` with the Ethereum address you want to send tokens to, and `<amount>` with the number of tokens to send.

Example:
```
ADDR=0x6122cfcd13692dfbe876e513109c5b653c4c2399 AMT=1222 npx hardhat run ./scripts/erc-transfer.js --network localhost
```

## Performing ETH Transfers

To transfer ETH:

```
ADDR=<recipient-address> AMT=<amount> npx hardhat run ./scripts/eth-transfer.js --network localhost
```

Replace `<recipient-address>` with the Ethereum address you want to send ETH to, and `<amount>` with the amount of ETH to send.

Example:
```
ADDR=0x6122cfcd13692dfbe876e513109c5b653c4c2399 AMT=1 npx hardhat run ./scripts/eth-transfer.js --network localhost
```

## 🧪 EthTester Class

A utility class for testing Ethereum transactions and smart contracts, designed to work with local Ethereum networks like Hardhat.

## 📚 Table of Contents

- [Usage](#usage)
- [API](#api)
- [Configuration](#configuration)
- [Dependencies](#dependencies)
- [Contributing](#contributing)
- [License](#license)

## 🔧 Usage

Here's a quick example of how to use EthTester:

```javascript
const EthTester = require('eth-tester');

async function example() {
  const tester = new EthTester({
    uri: 'http://localhost:8545',
    privateKey: '0xYourPrivateKey'
  });

  await tester.init();

  // Mine a block
  await tester.mine();

  // Send Ether to an address
  await tester.sendToAddress({
    address: '0xRecipientAddress',
    amount: '1'  // 1 ETH
  });

  // Send tokens to an address
  await tester.sendToken({
    address: '0xRecipientAddress',
    amount: '1000000000000000000'  // 1 token (assuming 18 decimals)
  });
}

example();
```

## 📘 API

### `EthTester`

#### Constructor

- `new EthTester(config)`
  - `config.uri`: (optional) The Ethereum node URI (default: 'http://127.0.0.1:8545/')
  - `config.privateKey`: (optional) The private key to use for transactions

#### Methods

- `init()`
  - Initializes the connection to the Ethereum network
- `mine(opts)`
  - Mines new blocks
  - `opts.blocks`: (optional) Number of blocks to mine (default: 1)
- `sendToAddress(opts)`
  - Sends Ether to an address
  - `opts.address`: Recipient's Ethereum address
  - `opts.amount`: Amount of Ether to send
- `sendToken(opts)`
  - Sends ERC20 tokens to an address
  - `opts.address`: Recipient's Ethereum address
  - `opts.amount`: Amount of tokens to send
- `getNewAddress()`
  - Returns the Ethereum address associated with the configured private key

## ⚙️ Configuration

EthTester uses a configuration file `erc20.config.json` for ERC20 token details. Ensure this file is present in the same directory with the following structure:

```json
{
  "contractAddress": "0xYourTokenContractAddress"
}
```
