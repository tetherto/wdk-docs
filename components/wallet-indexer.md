# lib-wallet-indexer

Node.js indexer for Ethereum with JSON-RPC and Websocket api

## Features:

### JSON-RPC
**getTransactionsByAddress:** Get ETH transactions by address


### WebSocket:
**subscribeToAccount:** Websocket events for new transactions for an address. Supports ERC20 tokens and ETH transactions.


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
```bash
npm run start
```

