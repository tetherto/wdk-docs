# lib-wallet-indexer

Node.js indexer for Ethereum with JSON-RPC and Websocket api

## Feaures:

### JSON-RPC
**getTransactionsByAddress:** Get ETH transactions by address


### WebSocket:
**subscribeToAccount:** Websocket events for new transactions for an address. Supports ERC20 tokens and ETH transactions.


## Run
```
npm install
cp ./config.json.example ./config.json 
npm run start
```

