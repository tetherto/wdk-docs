# lib-wallet-indexer

indexer service for Ethereum with JSON-RPC and Websocket api

## Features:

### JSON-RPC
**getTransactionsByAddress:** Get ETH transactions by address.


### WebSocket:
**subscribeToAccount:** Websocket events for new ERC20 token and ETH transfers for an address.

## Backends:
### Ankr 
We provide a proxy for using [Ankr](https://www.ankr.com/) as your data provider. Using the Ankr proxy allows your to easily access ETH mainnet or testnets

### Hardhat 
Using the the [Hardhat](hardhat.org/) proxy, you're able run an indexer on your local hardhat instance.
See the [wallet-test-tools](https://github.com/tetherto/wallet-lib-test-tools/tree/main/src/eth) repo to setup your local instance.


## Setup and Run

### Clone the wallet indexer repo
```bash
git clone git@github.com:tetherto/lib-wallet-indexer.git
cd lib-wallet-indexer
```

### Install dependencies and copy config
```bash
npm install
cp ./config.json.example ./config.json 
```

### Run
For running with hardhat backend:
```bash
npm run start-hardhat
```

For running against ankr:
```bash
npm run start-ankr
```
