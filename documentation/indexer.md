# WDK Indexers

## Overview

WDK Indexers are self-hostable blockchain data indexing services that continuously collect on-chain activity, normalize it into a unified schema, and expose it through lightweight RPC interfaces. They bridge the gap between raw blockchain node data and developer-friendly APIs that wallet applications need.

### Why WDK Indexers?

- **Unified Data Model**: Single transaction/block schema across all supported chains
- **Self-Hostable**: No dependency on external indexing services or rate limits
- **High Availability**: Built-in provider failover and distributed replication
- **Developer-Friendly**: Clean APIs optimized for wallet use cases
- **Horizontally Scalable**: Stateless API layer supports multiple replicas

## Architecture

WDK Indexers follow a consistent two-worker architecture across all supported chains:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Blockchain    │───▶│  Processor       │───▶│  Hyperbee       │
│   RPC/APIs      │    │  Worker          │    │  Database       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                         │
                                                         ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   WDK Client    │◀───│  API Worker      │◀───│  P2P Swarm      │
│   Applications  │    │  (Replicas)      │    │  Replication    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Processor Worker

- **Purpose**: Continuously polls blockchain data and normalizes it
- **Storage**: Commits normalized transactions to Hyperbee distributed database
- **Schedule**: Configurable sync frequency (default: every 5 minutes)
- **Data Structure**: Organizes data into `blocks`, `block-ts`, and `tx-block-map` indexes

### API Worker

- **Purpose**: Serves read-only RPC endpoints for wallet applications
- **Replication**: Automatically syncs data from processor via P2P swarm
- **Scaling**: Multiple API worker instances can run simultaneously
- **Endpoints**: Unified API surface across all blockchain networks

## Supported Networks

| Network | Primary Token | Token Standards | Special Features |
|---------|---------------|-----------------|------------------|
| [Bitcoin](indexer/indexer-btc.md) | BTC | - | Multi-provider failover, UTXO handling |
| [EVM Chains](indexer/indexer-evm.md) | ETH, BNB, etc. | ERC-20 | Multi-chain support, token contracts |
| [Solana](indexer/indexer-solana.md) | SOL | SPL | Bitquery integration, slot-based sync |
| [Spark](indexer/indexer-spark.md) | SPARK | - | Spark network native support |
| [TON](indexer/indexer-ton.md) | TON | - | TON blockchain indexing |
| [TRON](indexer/indexer-tron.md) | TRX | TRC-20 | TRON network support |

## Data Model

All indexers normalize blockchain data into a consistent schema:

### Transaction Schema

```typescript
interface Transaction {
  blockchain: string;        // "bitcoin", "ethereum", "solana", etc.
  blockNumber: bigint;       // Block height
  transactionHash: string;   // Transaction ID/hash
  transactionIndex?: number; // Position in block
  logIndex?: number;         // For token transfers
  from?: string;            // Sender address
  to?: string;              // Recipient address  
  token: string;            // "btc", "eth", "usdt", etc.
  amount: string;           // Decimal amount as string
  timestamp: string;        // ISO 8601 timestamp
}
```

### Block Schema

```typescript
interface Block {
  blockNumber: bigint;      // Block height
  blockHash: string;        // Block hash
  timestamp: string;        // ISO 8601 timestamp
  txns: Transaction[];      // Normalized transactions
}
```

## Quick Start

### Prerequisites

- Node.js ≥ 16
- Network access to blockchain RPC endpoints
- Storage space for blockchain data

### Installation

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

### Configuration

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

### Running the Services

**Start Processor Worker:**
```bash
NODE_CONFIG_DIR=./config node worker.js --env=development --wtype=proc.indexer.btc.wrk --rack=r0 --chain=bitcoin
```

**Start API Worker:**
```bash
NODE_CONFIG_DIR=./config node worker.js --env=development --wtype=api.indexer.btc.wrk --rack=r0 --chain=bitcoin --procRpc=<processor-rpc-key>
```

## API Reference

### Core Methods

#### `validAddress(address: string): Promise<boolean>`
Validates if an address is properly formatted for the blockchain.

#### `getBalance(address: string): Promise<string>`
Returns the balance for a given address in the native token.

#### `getBalanceMulti(addresses: string[]): Promise<Record<string, string>>`
Returns balances for multiple addresses in a single call.

#### `getTransaction(hash: string): Promise<Transaction[]>`
Retrieves a transaction by its hash/ID.

#### `queryTransactions(params): Promise<Transaction[]>`
Queries transactions with flexible filtering:

```typescript
interface QueryParams {
  fromTs?: string;      // Start timestamp
  toTs?: string;        // End timestamp  
  fromBlock?: bigint;   // Start block
  toBlock?: bigint;     // End block
  addresses?: string[]; // Filter by addresses
}
```

#### `getBlock(blockNumber: bigint): Promise<Block>`
Retrieves a block and its transactions by block number.

### Example Usage

```javascript
// Query transactions for specific addresses in a time range
const transactions = await indexer.queryTransactions({
  fromTs: '2024-01-01T00:00:00Z',
  toTs: '2024-01-31T23:59:59Z', 
  addresses: ['1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa']
});

// Get current balance
const balance = await indexer.getBalance('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');
```

## Configuration Reference

### Common Configuration

All indexers support these common configuration options:

- **debug**: Log level (0-3)
- **chain**: Chain identifier
- **topicConf**: P2P topic encryption settings

### Chain-Specific Configuration

Each chain has its own configuration file with options like:

- **rpcUrl**: Blockchain RPC endpoint
- **token**: Primary token symbol
- **network**: Network type (mainnet/testnet)
- **providers**: Provider configuration and failover
- **performance tuning**: Batch sizes, concurrency limits

See individual chain documentation for complete configuration options.

## Scaling and Operations

### Horizontal Scaling

- **Processor**: Usually single instance per chain
- **API Workers**: Deploy multiple replicas for load distribution
- **Database**: Hyperbee handles P2P replication automatically

### Monitoring

Monitor these key metrics:

- Sync lag (latest indexed block vs. chain height)
- RPC endpoint health and response times
- Database replication status
- API worker response times

### Performance Optimization

- **Batch Sizes**: Tune transaction batch sizes per chain
- **Concurrency**: Adjust concurrent RPC requests
- **Provider Failover**: Configure multiple RPC providers
- **Caching**: API workers automatically cache recent data

## Troubleshooting

### Common Issues

**Sync Lag**
- Check RPC provider response times
- Verify network connectivity
- Increase batch sizes if provider supports it

**API Errors**
- Ensure API worker can connect to processor RPC
- Verify P2P swarm connectivity
- Check database replication status

**Provider Failures**
- Configure multiple providers for redundancy
- Monitor provider health endpoints
- Implement proper failover timeouts

### Health Checks

```bash
# Check processor status
curl http://localhost:8080/health

# Check database core key
curl -X POST http://localhost:8080/rpc -d '{"method":"getDbCoreKey"}'
```

## Extending to New Chains

To add support for a new blockchain:

1. **Implement ChainBaseClient**
   ```javascript
   class ChainNewClient extends ChainBaseClient {
     async getBlockHeight() { /* implementation */ }
     async validAddress(address) { /* implementation */ }
     async getBalance(address) { /* implementation */ }
     async getTransaction(hash) { /* implementation */ }
     async getBlocks(from, to) { /* implementation */ }
   }
   ```

2. **Create Worker Subclasses**
   - Extend `proc.indexer.wrk` for processor
   - Extend `api.indexer.wrk` for API worker

3. **Configuration**
   - Create chain-specific configuration template
   - Document required RPC endpoints and API keys

4. **Testing**
   - Implement integration tests
   - Validate against mainnet and testnet

## License and Contributing

WDK Indexers are licensed under Apache-2.0. For contributing guidelines, see the individual repository CONTRIBUTING.md files.

## Next Steps

- Choose your target blockchain from the [supported networks](#supported-networks)
- Follow the chain-specific setup guide
- Deploy processor and API workers
- Integrate with your WDK wallet application
