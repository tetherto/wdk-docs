# Spark Indexer

## Overview

The WDK Spark Indexer provides comprehensive indexing for the Spark network, supporting native SPARK token transfers and smart contract interactions. Built on proven blockchain indexing technology, it offers efficient processing of Spark network transactions with real-time synchronization capabilities.

### Key Features

- **Spark Network Support**: Native support for Spark blockchain architecture
- **High-Performance Processing**: Optimized for Spark's consensus mechanism
- **Smart Contract Support**: Comprehensive contract interaction monitoring
- **Multi-Network Ready**: Mainnet and testnet compatibility
- **Real-Time Sync**: Low-latency transaction processing
- **Scalable Architecture**: Horizontal scaling with distributed replication

## Architecture

The Spark indexer extends the base WDK indexer architecture with Spark-specific components:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Spark RPC     │    │   Spark Node     │    │   Other Spark   │
│   Endpoints     │    │   Clusters       │    │   RPC Nodes     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 ▼
                    ┌──────────────────────┐
                    │   Spark Client       │
                    │   (JSON-RPC)         │
                    └──────────────────────┘
                                 │
                                 ▼
                    ┌──────────────────────┐
                    │   Spark Processor    │
                    │   (Block + Txns)     │
                    └──────────────────────┘
```

## Supported Networks

| Network | Native Token | RPC Endpoint Examples |
|---------|--------------|----------------------|
| Spark Mainnet | SPARK | `https://rpc.spark.network` |
| Spark Testnet | SPARK | `https://testnet-rpc.spark.network` |

## Configuration

### Required Configuration Files

Create these configuration files in your `config/` directory:

**config/common.json**
```json
{
  "debug": 0,
  "chain": "spark",
  "topicConf": {
    "crypto": {
      "algo": "hmac-sha384",
      "key": "your-secret-encryption-key"
    }
  }
}
```

**config/spark.json**
```json
{
  "chain": "spark",
  "token": "spark",
  "rpcUrl": "https://rpc.spark.network",
  "network": "mainnet",
  "decimals": 18,
  "txConcurrency": 5,
  "blockBatchSize": 10,
  "syncInterval": "*/2 * * * *"
}
```

### Configuration Options

#### Network Settings

- **chain**: Always "spark"
- **token**: Token symbol (usually "spark")
- **rpcUrl**: Spark JSON-RPC endpoint URL
- **network**: Network type ("mainnet", "testnet")
- **decimals**: Token decimal places (typically 18)

#### Performance Settings

- **txConcurrency**: Concurrent transaction processing (default: 5)
- **blockBatchSize**: Blocks processed per batch (default: 10)
- **syncInterval**: Sync frequency cron expression
- **rpcTimeout**: RPC request timeout in milliseconds

### Network-Specific Examples

**Mainnet Configuration**:
```json
{
  "chain": "spark",
  "token": "spark",
  "rpcUrl": "https://rpc.spark.network",
  "network": "mainnet",
  "decimals": 18,
  "txConcurrency": 5,
  "blockBatchSize": 10
}
```

**Testnet Configuration**:
```json
{
  "chain": "spark",
  "token": "spark",
  "rpcUrl": "https://testnet-rpc.spark.network",
  "network": "testnet",
  "decimals": 18,
  "txConcurrency": 10,
  "blockBatchSize": 20
}
```

## Provider Setup

### Spark RPC Endpoints

**Official Spark Endpoints**:
```
Mainnet: https://rpc.spark.network
Testnet: https://testnet-rpc.spark.network
```

**Third-Party Providers**:
- Contact Spark network team for additional RPC providers
- Community-maintained endpoints (use with caution in production)

### Self-Hosted Spark Node

**Requirements**:
- Modern multi-core CPU
- 16GB+ RAM
- 500GB+ SSD storage
- Stable internet connection

**Installation**:
```bash
# Download Spark node software
wget https://releases.spark.network/latest/spark-node

# Make executable
chmod +x spark-node

# Initialize node
./spark-node init --network mainnet

# Start node with RPC enabled
./spark-node start --rpc-enable --rpc-addr 0.0.0.0:8545
```

## Deployment

### Basic Deployment

1. **Clone and Install**:
   ```bash
   git clone https://github.com/tetherto/wdk-indexer-wrk-spark.git
   cd wdk-indexer-wrk-spark
   npm install
   ```

2. **Setup Configuration**:
   ```bash
   cp config/spark.json.example config/spark.json
   cp config/common.json.example config/common.json
   # Edit configurations with your settings
   ```

3. **Start Processor**:
   ```bash
   NODE_CONFIG_DIR=./config node worker.js \
     --env=production \
     --wtype=proc.indexer.spark.wrk \
     --rack=r0 \
     --chain=spark
   ```

4. **Start API Worker**:
   ```bash
   NODE_CONFIG_DIR=./config node worker.js \
     --env=production \
     --wtype=api.indexer.spark.wrk \
     --rack=r0 \
     --chain=spark \
     --procRpc=<processor-rpc-key>
   ```

### Docker Deployment

**Docker Compose**:
```yaml
version: '3.8'
services:
  spark-processor:
    build: .
    environment:
      - NODE_CONFIG_DIR=/app/config
    command: >
      node worker.js 
      --env=production 
      --wtype=proc.indexer.spark.wrk 
      --rack=r0 
      --chain=spark
    volumes:
      - ./config:/app/config
      - spark-data:/app/store
    restart: unless-stopped

  spark-api:
    build: .
    environment:
      - NODE_CONFIG_DIR=/app/config
    command: >
      node worker.js 
      --env=production 
      --wtype=api.indexer.spark.wrk 
      --rack=r0 
      --chain=spark
      --procRpc=${SPARK_PROC_RPC_KEY}
    ports:
      - "8085:8080"
    depends_on:
      - spark-processor
    restart: unless-stopped

volumes:
  spark-data:
```

## Spark-Specific Features

### Native SPARK Processing

Processes native SPARK token transfers:

- **Transfer Detection**: Monitors native SPARK transfers between addresses
- **Balance Tracking**: Maintains accurate balance state across accounts
- **Decimal Conversion**: Handles SPARK decimal precision automatically
- **Gas Fee Processing**: Tracks gas fees and network costs

### Smart Contract Support

- **Contract Deployment**: Tracks new contract deployments
- **Contract Calls**: Monitors contract function calls and state changes
- **Event Logs**: Processes contract event emissions
- **Internal Transactions**: Handles internal contract-to-contract calls

### Address Validation

Comprehensive Spark address validation:

```javascript
// Spark network addresses (format depends on implementation)
"spark1qw508d6qejxtdg4y5r3zarvary0c5xw7k..." ✓

// Contract addresses
"spark1contract1234567890abcdef..." ✓
```

## API Behavior

### Spark Transaction Responses

**Transaction Response**:
```json
{
  "blockchain": "spark",
  "blockNumber": 1500000,
  "transactionHash": "0x1a2b3c4d5e6f7890abcdef...",
  "transactionIndex": 5,
  "from": "spark1sender1234567890abcdef...",
  "to": "spark1receiver1234567890abcdef...",
  "token": "spark",
  "amount": "10.5",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Balance Response**:
```json
"125.75"  // SPARK balance as decimal string
```

### Query Examples

```javascript
// Get SPARK balance
const balance = await sparkIndexer.getBalance('spark1address1234567890abcdef...');

// Validate Spark address
const isValid = await sparkIndexer.validAddress('spark1address1234567890abcdef...');

// Query transactions in block range
const transactions = await sparkIndexer.queryTransactions({
  fromBlock: 1500000,
  toBlock: 1500100,
  addresses: ['spark1address1234567890abcdef...']
});

// Get specific transaction
const tx = await sparkIndexer.getTransaction('0x1a2b3c4d5e6f7890abcdef...');
```

## Performance Optimization

### Recommended Settings

**Mainnet**:
```json
{
  "txConcurrency": 5,
  "blockBatchSize": 10,
  "syncInterval": "*/2 * * * *",
  "rpcTimeout": 30000
}
```

**Testnet**:
```json
{
  "txConcurrency": 10,
  "blockBatchSize": 20,
  "syncInterval": "*/1 * * * *",
  "rpcTimeout": 15000
}
```

### Scaling Considerations

- **Processor**: Single instance recommended for sequential processing
- **API Workers**: Scale horizontally based on query load
- **Storage**: Plan for network growth and transaction volume
- **Network**: Ensure reliable connectivity to Spark nodes

## Monitoring and Maintenance

### Key Metrics

```bash
# Check sync status
curl -X POST http://localhost:8085/rpc -d '{
  "method": "getBlockFromChain",
  "params": {"blockNumber": "latest"}
}'

# Monitor indexer health
tail -f logs/spark-indexer.log | grep -E "(sync|error|performance)"

# Database replication status
curl -X POST http://localhost:8085/rpc -d '{
  "method": "getDbCoreKey"
}'
```

### Performance Monitoring

**Network-Specific Metrics**:
- Block processing speed vs. network block time
- RPC endpoint response times and availability
- Transaction processing throughput
- Memory usage during block processing

## Troubleshooting

### Common Issues

**RPC Connection Problems**:
```bash
# Test Spark RPC connectivity
curl -X POST https://rpc.spark.network -H "Content-Type: application/json" -d '{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "eth_blockNumber",
  "params": []
}'
```

**Sync Issues**:
```bash
# Check current block height
curl -X POST $SPARK_RPC_URL -d '{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "eth_blockNumber",
  "params": []
}'

# Verify indexer processing
tail -f logs/indexer.log | grep "processing blocks"
```

### Debugging Commands

```bash
# Test RPC endpoint
curl -X POST $SPARK_RPC_URL -d '{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "net_version",
  "params": []
}'

# Check account balance
curl -X POST $SPARK_RPC_URL -d '{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "eth_getBalance",
  "params": ["ADDRESS", "latest"]
}'
```

## Security Considerations

### RPC Security

- **Endpoint Security**: Use authenticated RPC endpoints when available
- **Network Security**: Implement proper firewall rules
- **Rate Limiting**: Monitor and limit RPC request rates
- **Connection Encryption**: Always use HTTPS for RPC connections

### Data Security

- **Configuration Security**: Secure configuration files and API keys
- **Access Control**: Implement proper access controls for indexer APIs
- **Data Validation**: Validate all incoming data from RPC sources
- **Monitoring**: Monitor for unusual activity or errors

## Advanced Configuration

### Custom Processing

```javascript
// Custom Spark processor
class CustomSparkProcessor extends SparkProcessor {
  constructor(config, ctx) {
    super(config, ctx);
    this.customFeatures = config.customFeatures || {};
  }

  async processCustomTransactions(transactions) {
    // Custom transaction processing logic
  }
}
```

### Performance Tuning

```json
{
  "advanced": {
    "batchSize": 20,
    "cacheSize": 1000,
    "workerCount": 4,
    "memoryLimit": "2GB"
  }
}
```

## Migration and Upgrades

### Data Migration

When upgrading between indexer versions:

1. **Stop Services**: Gracefully shutdown processor and API workers
2. **Backup Data**: Copy `store/` directory to backup location
3. **Update Code**: Pull latest indexer version
4. **Restart Services**: Start with same configuration

### Configuration Updates

- Review configuration schema changes in release notes
- Update RPC URLs if endpoints have changed
- Adjust performance settings based on network changes
