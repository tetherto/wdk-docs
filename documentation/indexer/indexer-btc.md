# Bitcoin Indexer

## Overview

The WDK Bitcoin Indexer provides comprehensive indexing for the Bitcoin blockchain, supporting both mainnet and testnet networks. It features robust multi-provider failover, UTXO transaction handling, and Bitcoin-specific address validation across all address formats.

### Key Features

- **Multi-Provider Support**: RPC nodes with automatic failover
- **UTXO Handling**: Proper Bitcoin transaction input/output processing  
- **Address Validation**: Support for all Bitcoin address formats (Legacy, SegWit, Bech32)
- **Network Support**: Mainnet, Testnet, and Regtest
- **Satoshi Normalization**: Automatic conversion between satoshis and BTC
- **Provider Redundancy**: Built-in health monitoring and failover

## Architecture

The Bitcoin indexer extends the base WDK indexer architecture with Bitcoin-specific components:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Bitcoin Core   │    │   Blockstream    │    │  Other Bitcoin  │
│     RPC         │    │      API         │    │   RPC Nodes     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 ▼
                    ┌──────────────────────┐
                    │   Provider Manager   │
                    │   (Failover Logic)   │
                    └──────────────────────┘
                                 │
                                 ▼
                    ┌──────────────────────┐
                    │  Bitcoin Processor   │
                    │  (UTXO Processing)   │
                    └──────────────────────┘
```

## Configuration

### Required Configuration Files

Create these configuration files in your `config/` directory:

**config/common.json**
```json
{
  "debug": 0,
  "chain": "bitcoin",
  "topicConf": {
    "crypto": {
      "algo": "hmac-sha384",
      "key": "your-secret-encryption-key"
    }
  }
}
```

**config/bitcoin.json**
```json
{
  "network": "mainnet",
  "token": "btc",
  "txConcurrency": 10,
  "providers": {
    "rpc": [
      {
        "name": "primary-node",
        "uri": "http://username:password@127.0.0.1:8332",
        "timeout": 30000,
        "priority": 100
      },
      {
        "name": "backup-node", 
        "uri": "http://username:password@backup.example.com:8332",
        "timeout": 30000,
        "priority": 90
      }
    ],
    "apis": {
      "blockstream": {
        "enabled": true,
        "baseUrl": "https://blockstream.info/api",
        "timeout": 30000,
        "priority": 50
      }
    }
  }
}
```

### Configuration Options

#### Network Settings

- **network**: `"mainnet"`, `"testnet"`, or `"regtest"`
- **token**: Token symbol (usually `"btc"`)
- **txConcurrency**: Number of concurrent transaction processing (default: 10)

#### Provider Configuration

**RPC Providers** (Array of Bitcoin Core nodes):
- **name**: Identifier for logging and monitoring
- **uri**: Full RPC URL with authentication
- **timeout**: Request timeout in milliseconds
- **priority**: Provider preference (higher = preferred)

**API Providers** (External services):
- **blockstream**: Blockstream.info API integration
- **enabled**: Whether to use this provider
- **baseUrl**: API endpoint URL
- **timeout**: Request timeout
- **priority**: Failover priority

### Network-Specific Examples

**Mainnet Configuration:**
```json
{
  "network": "mainnet",
  "token": "btc",
  "providers": {
    "rpc": [
      {
        "name": "local-mainnet",
        "uri": "http://user:pass@localhost:8332",
        "timeout": 30000,
        "priority": 100
      }
    ]
  }
}
```

**Testnet Configuration:**
```json
{
  "network": "testnet",
  "token": "btc",
  "providers": {
    "rpc": [
      {
        "name": "local-testnet",
        "uri": "http://user:pass@localhost:18332",
        "timeout": 30000,
        "priority": 100
      }
    ],
    "apis": {
      "blockstream": {
        "enabled": true,
        "baseUrl": "https://blockstream.info/testnet/api",
        "timeout": 30000,
        "priority": 50
      }
    }
  }
}
```

## Provider Setup

### Bitcoin Core RPC

1. **Install Bitcoin Core**: Download from [bitcoin.org](https://bitcoin.org/en/download)

2. **Configure bitcoin.conf**:
   ```
   # RPC settings
   server=1
   rpcuser=your-username
   rpcpassword=your-secure-password
   rpcallowip=127.0.0.1
   rpcport=8332
   
   # Optional: Reduce storage requirements
   prune=50000
   
   # Testnet (if needed)
   # testnet=1
   # rpcport=18332
   ```

3. **Start Bitcoin Core**:
   ```bash
   bitcoind -daemon
   ```

4. **Verify RPC Access**:
   ```bash
   bitcoin-cli getblockchaininfo
   ```

### External API Providers

**Blockstream API** (Free, no registration required):
- Mainnet: `https://blockstream.info/api`
- Testnet: `https://blockstream.info/testnet/api`
- Rate limits apply for heavy usage

## Deployment

### Basic Deployment

1. **Clone and Install**:
   ```bash
   git clone https://github.com/tetherto/wdk-indexer-wrk-btc.git
   cd wdk-indexer-wrk-btc
   npm install
   ```

2. **Setup Configuration**:
   ```bash
   cp config/bitcoin.json.example config/bitcoin.json
   cp config/common.json.example config/common.json
   # Edit configurations with your settings
   ```

3. **Start Processor**:
   ```bash
   NODE_CONFIG_DIR=./config node worker.js \
     --env=production \
     --wtype=proc.indexer.btc.wrk \
     --rack=r0 \
     --chain=bitcoin
   ```

4. **Start API Worker**:
   ```bash
   NODE_CONFIG_DIR=./config node worker.js \
     --env=production \
     --wtype=api.indexer.btc.wrk \
     --rack=r0 \
     --chain=bitcoin \
     --procRpc=<processor-rpc-key>
   ```

### Docker Deployment

**Dockerfile Example**:
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 8080
CMD ["node", "worker.js"]
```

**Docker Compose**:
```yaml
version: '3.8'
services:
  bitcoin-processor:
    build: .
    environment:
      - NODE_CONFIG_DIR=/app/config
    command: >
      node worker.js 
      --env=production 
      --wtype=proc.indexer.btc.wrk 
      --rack=r0 
      --chain=bitcoin
    volumes:
      - ./config:/app/config
      - bitcoin-data:/app/store
    restart: unless-stopped

  bitcoin-api:
    build: .
    environment:
      - NODE_CONFIG_DIR=/app/config
    command: >
      node worker.js 
      --env=production 
      --wtype=api.indexer.btc.wrk 
      --rack=r0 
      --chain=bitcoin
      --procRpc=${PROC_RPC_KEY}
    volumes:
      - ./config:/app/config
    ports:
      - "8080:8080"
    depends_on:
      - bitcoin-processor
    restart: unless-stopped

volumes:
  bitcoin-data:
```

## Bitcoin-Specific Features

### UTXO Processing

The Bitcoin indexer properly handles UTXO (Unspent Transaction Output) model:

- **Input Processing**: Resolves previous transaction outputs to determine senders
- **Output Processing**: Creates separate transaction records for each output
- **Coinbase Handling**: Properly identifies and processes coinbase transactions
- **Multi-Input Transactions**: Determines single sender when possible

### Address Validation

Supports all Bitcoin address formats:

```javascript
// Legacy addresses (P2PKH)
"1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa" ✓

// Script hash addresses (P2SH) 
"3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy" ✓

// SegWit v0 (P2WPKH)
"bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4" ✓

// SegWit v1 (P2TR - Taproot)
"bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297" ✓
```

### Amount Normalization

Automatically handles Bitcoin's dual amount representation:

- **Satoshis**: Integer values ≥ 100,000,000 are treated as satoshis
- **BTC**: Decimal values < 1 are treated as BTC
- **Conversion**: Automatic conversion to BTC decimal strings

```javascript
// Input: 100000000 satoshis → Output: "1.0" BTC
// Input: 0.5 BTC → Output: "0.5" BTC
```

### Provider Failover

Intelligent provider management:

1. **Health Monitoring**: Continuous health checks on all providers
2. **Priority-Based**: Uses highest priority available provider
3. **Automatic Failover**: Switches providers on errors or timeouts
4. **Load Balancing**: Distributes requests across healthy providers

## API Behavior

The Bitcoin indexer implements the [standard WDK Indexer API](indexer-api-reference.md) with Bitcoin-specific behaviors:

### Bitcoin-Specific Features

**UTXO Model:**
- Single Bitcoin transaction may generate multiple `Transaction` records (one per relevant output)
- Change outputs to user addresses are marked with `direction: 'self'`
- Complex multi-input/output transactions automatically parsed

**Address Formats:**
- Legacy addresses (1...), SegWit (3...), and Bech32 (bc1...) supported
- Automatic address format detection and validation
- Multi-signature address support

**Amount Handling:**
- Satoshi amounts automatically converted to BTC decimal format
- Transaction fees calculated from input/output differences
- Proper handling of dust amounts and minimum transaction sizes

### Example Bitcoin Response

```json
{
  "blockchain": "bitcoin",
  "blockNumber": 850000,
  "transactionHash": "1a2b3c4d5e6f...",
  "transactionIndex": 1,
  "direction": "in",
  "from": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
  "to": "3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy", 
  "token": "btc",
  "amount": "0.001",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": "confirmed",
  "confirmations": 6
}
```

For complete API documentation, method signatures, and examples, see the [WDK Indexer API Reference](indexer-api-reference.md).

## Performance Optimization

### Recommended Settings

**For Bitcoin Core RPC**:
```json
{
  "txConcurrency": 5,
  "providers": {
    "rpc": [
      {
        "timeout": 60000,
        "priority": 100
      }
    ]
  }
}
```

**For Mixed Providers**:
```json
{
  "txConcurrency": 15,
  "providers": {
    "rpc": [{"priority": 100}],
    "apis": {
      "blockstream": {"priority": 80}
    }
  }
}
```

### Scaling Considerations

- **Processor**: Single instance recommended due to sequential block processing
- **API Workers**: Scale horizontally based on query load
- **Storage**: Plan for ~500GB+ for full Bitcoin mainnet history
- **Network**: Ensure reliable connectivity to Bitcoin nodes

## Monitoring and Maintenance

### Key Metrics

```bash
# Check sync status
curl -X POST http://localhost:8080/rpc -d '{
  "method": "getBlockFromChain",
  "params": {"blockNumber": "latest"}
}'

# Monitor provider health
tail -f logs/bitcoin-indexer.log | grep -E "(provider|failover|timeout)"

# Database replication status
curl -X POST http://localhost:8080/rpc -d '{
  "method": "getDbCoreKey"
}'
```

### Common Issues

**Slow Sync**:
- Increase `txConcurrency` if providers can handle it
- Add additional RPC providers for load distribution
- Consider using pruned Bitcoin nodes to reduce disk I/O

**Provider Failures**:
- Monitor Bitcoin Core node health and disk space
- Configure multiple providers with different priorities
- Set appropriate timeouts for your network conditions

**Memory Usage**:
- Large blocks (e.g., block 567,890) may require increased Node.js heap
- Use `--max-old-space-size=8192` for 8GB heap limit

## Security Considerations

### RPC Security

- Use strong authentication credentials
- Limit RPC access to localhost or trusted networks
- Consider using RPC over TLS for remote connections
- Regularly rotate RPC passwords

### Network Security

- Use VPN or private networks for node communication
- Implement proper firewall rules
- Monitor for unusual network activity
- Keep Bitcoin Core updated with security patches

### Data Security

- Encrypt topic configuration with strong keys
- Secure configuration files with appropriate permissions
- Regular backups of indexer data
- Monitor access logs for unauthorized attempts

## Troubleshooting

### Connection Issues

```bash
# Test Bitcoin RPC connectivity
curl -u username:password \
  -X POST http://localhost:8332/ \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"1.0","id":"test","method":"getblockchaininfo","params":[]}'

# Check indexer health
curl http://localhost:8080/health
```

### Sync Problems

```bash
# Check current sync status
bitcoin-cli getblockchaininfo

# Verify indexer is processing blocks
tail -f logs/indexer.log | grep "processing blocks"

# Check for stuck processes
ps aux | grep "indexer.btc.wrk"
```

### Provider Debugging

```bash
# Enable debug logging
export DEBUG=bitcoin-indexer:*
node worker.js --debug

# Test specific provider
curl -X POST http://localhost:8080/rpc -d '{
  "method": "getBlockFromChain", 
  "params": {"blockNumber": "latest"}
}'
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
- Update provider URLs if nodes have changed
- Adjust performance settings based on new capabilities

## Advanced Configuration

### Custom Provider Implementation

```javascript
class CustomBitcoinProvider extends BaseProvider {
  constructor(config, ctx) {
    super(config, ctx);
    this.name = 'custom-provider';
    this.priority = config.priority || 50;
  }

  async getBlockCount() {
    // Custom implementation
  }
  
  async getBlock(hash, verbosity) {
    // Custom implementation
  }
}
```

### Performance Tuning

```json
{
  "txConcurrency": 20,
  "batchSize": 10,
  "cacheSize": 1000,
  "providers": {
    "rpc": [
      {
        "name": "high-performance-node",
        "uri": "http://user:pass@fast-node:8332",
        "timeout": 30000,
        "priority": 100,
        "maxConnections": 10
      }
    ]
  }
}
```
