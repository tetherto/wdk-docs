# WDK Indexer Configuration

## Overview

All WDK Indexers share a common configuration structure built on the `bfx-svc-boot-js` framework. This page documents the shared configuration patterns, file structure, and common options used across all supported blockchains.

For chain-specific configuration options, see the individual network documentation pages.

## Configuration File Structure

WDK Indexers use a hierarchical configuration system with these files in the `config/` directory:

```
config/
├── common.json              # Shared settings across all workers
├── {chain}.json            # Native token configuration
├── {chain}-{token}.json    # Token-specific configuration
└── facs/                   # Service-specific configurations
    ├── scheduler.json
    ├── db-store.json
    └── hyperbee.json
```

## Common Configuration (`common.json`)

All indexers require a `common.json` file with these shared settings:

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

### Common Fields

#### Core Settings
- **debug**: Log level (0=minimal, 1=info, 2=verbose, 3=debug)
- **chain**: Chain identifier matching the worker type ("bitcoin", "ethereum", "solana", etc.)

#### P2P Topic Configuration
- **topicConf.crypto.algo**: Encryption algorithm for P2P communication
- **topicConf.crypto.key**: Secret key for topic encryption (must match across workers)

### Example by Chain

**Bitcoin (From Repository):**
```json
{
  "debug": 0,
  "chain": "bitcoin",
  "topicConf": {
    "crypto": {
      "algo": "hmac-sha384",
      "key": "my-secret"
    }
  }
}
```

**EVM Chains:**
```json
{
  "debug": 0,
  "chain": "ethereum",
  "topicConf": {
    "crypto": {
      "algo": "hmac-sha384",
      "key": "your-secret-encryption-key"
    }
  }
}
```

**Solana:**
```json
{
  "debug": 0,
  "chain": "solana",
  "topicConf": {
    "crypto": {
      "algo": "hmac-sha384",
      "key": "your-secret-encryption-key"
    }
  }
}
```

## Chain-Specific Configuration

Each blockchain has its own configuration file following the pattern `{chain}.json` for native tokens and `{chain}-{token}.json` for additional tokens.

### Universal Fields

These fields appear across all chain configurations:

#### Network Settings
- **chain**: Chain identifier (must match common.json)
- **token**: Token symbol ("btc", "eth", "usdt", etc.)
- **network**: Network type ("mainnet", "testnet", "devnet", etc.)
- **decimals**: Token decimal places for amount normalization

#### RPC Configuration
- **rpcUrl**: Primary RPC endpoint URL
- **rpcTimeout**: Request timeout in milliseconds (default: 30000)
- **apiKey**: API key for enhanced rate limits (where applicable)

#### Performance Settings
- **txConcurrency**: Number of concurrent transaction processing threads
- **blockBatchSize**: Number of blocks processed per batch
- **syncInterval**: Sync frequency as cron expression (e.g., "*/2 * * * *")

### Configuration Templates

#### Native Token Configuration
```json
{
  "chain": "{CHAIN}",
  "token": "{NATIVE_TOKEN}",
  "rpcUrl": "{RPC_ENDPOINT}",
  "network": "mainnet",
  "decimals": 18,
  "txConcurrency": 5,
  "blockBatchSize": 10,
  "syncInterval": "*/2 * * * *"
}
```

#### Token Contract Configuration
```json
{
  "chain": "{CHAIN}",
  "token": "{TOKEN_SYMBOL}",
  "rpcUrl": "{RPC_ENDPOINT}",
  "network": "mainnet",
  "contractAddress": "{CONTRACT_ADDRESS}",
  "decimals": 6,
  "txConcurrency": 3,
  "blockBatchSize": 5
}
```

## Performance Configuration

### Recommended Settings by Network Speed

**Fast Networks** (Solana, BSC, Polygon):
```json
{
  "txConcurrency": 10,
  "blockBatchSize": 20,
  "syncInterval": "*/30 * * * * *"
}
```

**Medium Networks** (Ethereum, TRON):
```json
{
  "txConcurrency": 5,
  "blockBatchSize": 10,
  "syncInterval": "*/1 * * * *"
}
```

**Slow Networks** (Bitcoin):
```json
{
  "txConcurrency": 2,
  "blockBatchSize": 5,
  "syncInterval": "*/5 * * * *"
}
```

### Tuning Guidelines

#### Transaction Concurrency
- Start with conservative values (2-5)
- Increase gradually while monitoring RPC provider performance
- Reduce if experiencing timeouts or rate limiting

#### Batch Sizes
- Larger batches = more efficient but higher memory usage
- Smaller batches = more resilient to RPC failures
- Adjust based on network block times and RPC capabilities

#### Sync Intervals
- Faster intervals = lower latency but higher RPC load
- Match to expected transaction frequency
- Consider provider rate limits

## Provider Configuration

### Single Provider Setup
```json
{
  "rpcUrl": "https://api.provider.com",
  "rpcTimeout": 30000,
  "apiKey": "your-api-key"
}
```

### Multi-Provider Setup (Bitcoin Example)
```json
{
  "providers": {
    "rpc": [
      {
        "name": "primary-node",
        "uri": "http://user:pass@localhost:8332",
        "timeout": 30000,
        "priority": 100
      },
      {
        "name": "backup-node",
        "uri": "http://user:pass@backup.com:8332",
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

### Provider Failover Configuration
- **priority**: Higher values preferred (0-100)
- **timeout**: Per-request timeout in milliseconds
- **retries**: Number of retry attempts (optional)
- **healthCheck**: Health check interval (optional)

## Environment-Specific Configuration

### Development
```json
{
  "debug": 2,
  "network": "testnet",
  "txConcurrency": 1,
  "blockBatchSize": 1,
  "syncInterval": "*/10 * * * * *"
}
```

### Production
```json
{
  "debug": 0,
  "network": "mainnet",
  "txConcurrency": 5,
  "blockBatchSize": 10,
  "syncInterval": "*/2 * * * *"
}
```

### Testing
```json
{
  "debug": 3,
  "network": "regtest",
  "txConcurrency": 1,
  "blockBatchSize": 1,
  "syncInterval": "*/1 * * * * *"
}
```

## Security Configuration

### Encryption Settings
```json
{
  "topicConf": {
    "crypto": {
      "algo": "hmac-sha384",
      "key": "use-a-strong-randomly-generated-key-here"
    }
  }
}
```

### RPC Security
- Use HTTPS endpoints in production
- Rotate API keys regularly
- Limit RPC access to trusted networks
- Use strong authentication credentials

### Configuration File Security
- Set appropriate file permissions (600)
- Store sensitive keys in environment variables
- Use configuration management tools for production
- Regular backup of configuration files

## Configuration Validation

### Required Fields Validation

All configurations must include:
- `chain` field matching worker type
- `token` field for token identification
- Valid `rpcUrl` or provider configuration
- `decimals` field for amount normalization

### Format Validation

- RPC URLs must be valid HTTP/HTTPS endpoints
- Cron expressions must be valid for syncInterval
- Numeric fields must be within reasonable ranges
- Contract addresses must match chain format

### Testing Configuration

```bash
# Test RPC connectivity
curl -X POST $RPC_URL -H "Content-Type: application/json" -d '{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "getBlockNumber",
  "params": []
}'

# Validate configuration syntax
node -e "console.log(JSON.parse(require('fs').readFileSync('config/bitcoin.json')))"

# Test worker startup
NODE_CONFIG_DIR=./config node worker.js --env=development --wtype=proc.indexer.btc.wrk --rack=r0 --chain=bitcoin --dry-run
```

## Configuration Override Patterns

### Environment Variables
```bash
# Override RPC URL
export WDK_INDEXER_RPC_URL="https://custom-endpoint.com"

# Override debug level
export WDK_INDEXER_DEBUG=2

# Override API key
export WDK_INDEXER_API_KEY="your-production-api-key"
```

### Runtime Parameters
```bash
# Override chain configuration
NODE_CONFIG_DIR=./config node worker.js \
  --chain=bitcoin \
  --rpcUrl=https://custom-endpoint.com \
  --debug=1
```

### Configuration Merging

Configuration precedence (highest to lowest):
1. Command-line arguments
2. Environment variables
3. Chain-specific configuration file
4. Common configuration file
5. Default values

## Troubleshooting Configuration

### Common Issues

**Invalid JSON Syntax:**
```bash
# Validate JSON syntax
jsonlint config/bitcoin.json
```

**Missing Required Fields:**
```bash
# Check for required fields
node -e "
const config = require('./config/bitcoin.json');
const required = ['chain', 'token', 'rpcUrl', 'decimals'];
required.forEach(field => {
  if (!config[field]) console.error('Missing required field:', field);
});
"
```

**RPC Connectivity Issues:**
```bash
# Test RPC endpoint
curl -f -X POST $RPC_URL -H "Content-Type: application/json" -d '{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "getBlockNumber",
  "params": []
}' || echo "RPC endpoint failed"
```

### Configuration Debugging

Enable debug logging to troubleshoot configuration issues:

```json
{
  "debug": 3
}
```

Look for these log patterns:
- `config loaded:` - Configuration successfully parsed
- `rpc connected:` - RPC endpoint accessible
- `validation error:` - Configuration validation failures
- `provider fallback:` - Provider failover events

## Advanced Configuration

### Custom Worker Configuration

```json
{
  "workerConfig": {
    "maxMemory": "2GB",
    "gcInterval": 300000,
    "processTimeout": 600000
  }
}
```

### Database Configuration

```json
{
  "hyperbeeConfig": {
    "storageDir": "./store",
    "replicationTimeout": 30000,
    "compactionInterval": 3600000
  }
}
```

### Scheduler Configuration

```json
{
  "schedulerConfig": {
    "timezone": "UTC",
    "maxConcurrentJobs": 5,
    "jobTimeout": 300000
  }
}
```

## Migration and Versioning

### Configuration Schema Versioning

When upgrading indexer versions:

1. **Backup Current Configuration:**
   ```bash
   cp -r config config.backup.$(date +%Y%m%d)
   ```

2. **Check Schema Changes:**
   ```bash
   # Review upgrade notes for configuration changes
   git log --oneline v1.0.0..v2.0.0 -- config/
   ```

3. **Migrate Configuration:**
   ```bash
   # Apply schema migrations if provided
   node scripts/migrate-config.js --from=v1.0.0 --to=v2.0.0
   ```

4. **Validate New Configuration:**
   ```bash
   # Test configuration validity
   NODE_CONFIG_DIR=./config node worker.js --validate-config
   ```

### Backward Compatibility

- Minor version updates maintain configuration compatibility
- Major version updates may require configuration migration
- Deprecated fields are supported for one major version
- Migration scripts provided for breaking changes

## Next Steps

- Review chain-specific configuration documentation:
  - [Bitcoin Configuration](indexer-btc.md#configuration)
  - [EVM Configuration](indexer-evm.md#configuration) 
  - [Solana Configuration](indexer-solana.md#configuration)
  - [TON Configuration](indexer-ton.md#configuration)
  - [TRON Configuration](indexer-tron.md#configuration)
  - [Spark Configuration](indexer-spark.md#configuration)
- Set up your [deployment environment](indexer-deployment.md)
- Configure [monitoring and maintenance](indexer-monitoring.md)
