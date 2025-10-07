# WDK Indexer Quick Start

This guide walks you through installing and running a WDK Indexer for any supported blockchain.

## Prerequisites

- Node.js ≥ 16
- Network access to blockchain RPC endpoints
- Storage space for blockchain data

## Installation

```bash
# Clone the indexer for your target chain
git clone https://github.com/tetherto/wdk-indexer-wrk-btc.git
cd wdk-indexer-wrk-btc

# Install dependencies
npm install

# Set up configuration
cp config/bitcoin.json.example config/bitcoin.json
cp config/common.json.example config/common.json

# Edit configuration files with your settings
```

## Configuration

Create configuration files in the `config/` directory:

**config/common.json**
```json
{
  "debug": 0,
  "chain": "bitcoin",
  "topicConf": {
    "crypto": {
      "algo": "hmac-sha384", 
      "key": "your-secret-key"
    }
  }
}
```

**Chain-specific configuration** (see individual chain documentation for details)

## Running the Services

**Start Processor Worker:**
```bash
NODE_CONFIG_DIR=./config node worker.js --env=development --wtype=wrk-btc-indexer-proc --rack=r0 --chain=bitcoin
```

**Start API Worker:**
```bash
NODE_CONFIG_DIR=./config node worker.js --env=development --wtype=wrk-btc-indexer-api --rack=r0 --chain=bitcoin --proc-rpc=<processor-rpc-key>
```
