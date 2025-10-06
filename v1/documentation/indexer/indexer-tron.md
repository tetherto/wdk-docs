# TRON Indexer

## Overview

The WDK TRON Indexer provides comprehensive indexing for the TRON blockchain, supporting native TRX transfers, smart contract interactions, and TRC-20 token transfers. Built for TRON's high-throughput architecture, it efficiently processes transactions with real-time synchronization and supports TRON's unique features like energy and bandwidth management.

### Key Features

- **TRON Architecture Support**: Native support for TRON's delegated proof-of-stake consensus
- **TRC-20 Token Support**: Complete indexing of TRC-20 token transfers and contracts
- **Energy/Bandwidth Tracking**: Monitors TRON's resource consumption model
- **Smart Contract Processing**: Comprehensive TVM smart contract monitoring
- **Multi-Network Ready**: Mainnet, Testnet (Shasta), and development network support
- **High Performance**: Optimized for TRON's high transaction throughput

## Architecture

The TRON indexer extends the base WDK indexer architecture with TRON-specific components:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   TRON RPC      │    │   TRON Full Node │    │   Other TRON    │
│   Endpoints     │    │   HTTP API       │    │   RPC Nodes     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 ▼
                    ┌──────────────────────┐
                    │   TRON Client        │
                    │   (TronWeb/HTTP)     │
                    └──────────────────────┘
                                 │
                                 ▼
                    ┌──────────────────────┐
                    │   TRON Processor     │
                    │   (Blocks + Txns)    │
                    └──────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    ▼                         ▼
          ┌─────────────────┐       ┌─────────────────┐
          │   TRX Native    │       │   TRC-20 Token  │
          │   Processor     │       │   Processor     │
          └─────────────────┘       └─────────────────┘
```

## Supported Networks

| Network | Native Token | RPC Endpoint Examples |
|---------|--------------|----------------------|
| TRON Mainnet | TRX | `https://api.trongrid.io` |
| TRON Testnet (Shasta) | TRX | `https://api.shasta.trongrid.io` |
| TRON Nile Testnet | TRX | `https://api.nileex.io` |

### Popular TRC-20 Tokens

| Token | Symbol | Contract Address | Decimals |
|-------|--------|------------------|----------|
| Tether USD | USDT | `TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t` | 6 |
| USD Coin | USDT | `TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8` | 6 |
| JUST | JST | `TCFLL5dx5ZJdKnWuesXxi1VPwjLVmWZZy9` | 18 |
| SUN | SUN | `TSSMHYeV2uE9qYH95DqyoCuNCzEL1NvU3S` | 18 |
| BitTorrent | BTT | `TAFjULxiVgT4qWk6UZwjqwZXTSaGaqnVp4` | 18 |

## Configuration

For general configuration concepts and shared options, see the [WDK Indexer Configuration](indexer-configuration.md) reference.

### TRON-Specific Configuration

TRON indexers support native TRX transfers and TRC-20 token processing with energy/bandwidth resource tracking:

**config/tron.json** (Native TRX indexing)
```json
{
  "chain": "tron",
  "token": "trx",
  "rpcUrl": "https://api.trongrid.io",
  "network": "mainnet",
  "decimals": 6,
  "txConcurrency": 5,
  "blockBatchSize": 10,
  "apiKey": "YOUR_TRONGRID_API_KEY",
  "syncInterval": "*/1 * * * *"
}
```

**config/tron-usdt.json** (TRC-20 USDT indexing)
```json
{
  "chain": "tron",
  "token": "usdt",
  "rpcUrl": "https://api.trongrid.io",
  "network": "mainnet",
  "contractAddress": "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
  "decimals": 6,
  "txConcurrency": 3,
  "blockBatchSize": 5,
  "apiKey": "YOUR_TRONGRID_API_KEY"
}
```

### TRON-Specific Options

**API Configuration:**
- **rpcUrl**: TRON HTTP API endpoint URL (TronGrid format)
- **apiKey**: TronGrid API key for enhanced rate limits and priority access
- **network**: Network type ("mainnet", "testnet", "nile")
- **decimals**: 6 for TRX, varies for TRC-20 tokens

**Resource Optimization:**
- **txConcurrency**: Recommend 3-5 for mainnet, 5-10 for testnets
- **blockBatchSize**: Recommend 5-10 for TRON block processing
- **syncInterval**: Recommend "*/1 * * * *" (every minute) for TRON

**TRC-20 Token Settings:**
- **contractAddress**: TRC-20 contract address (required for TRC-20 tokens)
- **transferMethodId**: Custom transfer method ID (optional)
- **eventSignature**: Custom Transfer event signature (optional)

### Example Configurations

**Mainnet Production:**
```json
{
  "chain": "tron",
  "token": "trx",
  "rpcUrl": "https://api.trongrid.io",
  "network": "mainnet",
  "decimals": 6,
  "txConcurrency": 5,
  "blockBatchSize": 10,
  "apiKey": "YOUR_PRODUCTION_API_KEY",
  "syncInterval": "*/1 * * * *",
  "rpcTimeout": 30000
}
```

**Shasta Testnet:**
```json
{
  "chain": "tron",
  "token": "trx",
  "rpcUrl": "https://api.shasta.trongrid.io",
  "network": "testnet",
  "decimals": 6,
  "txConcurrency": 10,
  "blockBatchSize": 20,
  "syncInterval": "*/30 * * * * *",
  "rpcTimeout": 15000
}
```

**Custom TRC-20 Token:**
```json
{
  "chain": "tron",
  "token": "custom-trc20",
  "rpcUrl": "https://api.trongrid.io",
  "network": "mainnet",
  "contractAddress": "TCustomTRC20ContractAddress...",
  "decimals": 8,
  "txConcurrency": 3,
  "blockBatchSize": 5,
  "apiKey": "YOUR_API_KEY"
}
```

## Provider Setup

### TRON RPC Endpoints

**Official TRON Endpoints**:
```
Mainnet: https://api.trongrid.io
Shasta Testnet: https://api.shasta.trongrid.io
Nile Testnet: https://api.nileex.io
```

**Third-Party Providers**:

**TronStack**:
```
Mainnet: https://tron-mainnet.tronstack.io
Testnet: https://tron-testnet.tronstack.io
```

**GetBlock**:
```
Mainnet: https://trx.getblock.io/YOUR_API_KEY/mainnet/
Testnet: https://trx.getblock.io/YOUR_API_KEY/testnet/
```

### TronGrid API Setup

1. **Get API Key**: Register at [trongrid.io](https://www.trongrid.io)
2. **Generate Key**: Create API key in developer console
3. **Configure Limits**: Set appropriate rate limits for your application
4. **Test Access**: Verify API connectivity with test requests

### Self-Hosted TRON Node

**Requirements**:
- High-performance CPU (8+ cores)
- 64GB+ RAM
- 2TB+ SSD storage
- Stable internet connection (100Mbps+)

**Installation**:
```bash
# Download TRON Java-tron
git clone https://github.com/tronprotocol/java-tron.git
cd java-tron

# Build using Gradle
./gradlew clean build -x test

# Configure node
cp src/main/resources/config.conf config-local.conf

# Start full node
java -Xmx64g -XX:+UseConcMarkSweepGC -jar FullNode.jar -c config-local.conf
```

## Deployment

### Basic Deployment

1. **Clone and Install**:
   ```bash
   git clone https://github.com/tetherto/wdk-indexer-wrk-tron.git
   cd wdk-indexer-wrk-tron
   npm install
   ```

2. **Setup Configuration**:
   ```bash
   # Native TRX indexing
   cp config/tron.json.example config/tron.json
   
   # TRC-20 token indexing
   cp config/tron.json.example config/tron-usdt.json
   
   cp config/common.json.example config/common.json
   ```

3. **Start Native TRX Processor**:
   ```bash
   NODE_CONFIG_DIR=./config node worker.js \
     --env=production \
     --wtype=proc.indexer.tron.wrk \
     --rack=r0 \
     --chain=tron
   ```

4. **Start TRC-20 Token Processor**:
   ```bash
   NODE_CONFIG_DIR=./config node worker.js \
     --env=production \
     --wtype=proc.indexer.trc20.wrk \
     --rack=r0 \
     --chain=tron \
     --token=usdt
   ```

5. **Start API Workers**:
   ```bash
   # Native TRX API
   NODE_CONFIG_DIR=./config node worker.js \
     --env=production \
     --wtype=api.indexer.tron.wrk \
     --rack=r0 \
     --chain=tron \
     --procRpc=<processor-rpc-key>
   
   # TRC-20 token API
   NODE_CONFIG_DIR=./config node worker.js \
     --env=production \
     --wtype=api.indexer.trc20.wrk \
     --rack=r0 \
     --chain=tron \
     --token=usdt \
     --procRpc=<trc20-processor-rpc-key>
   ```

### Docker Deployment

**Multi-Service Docker Compose**:
```yaml
version: '3.8'
services:
  # TRON Native Token Indexer
  tron-processor:
    build: .
    environment:
      - NODE_CONFIG_DIR=/app/config
    command: >
      node worker.js 
      --env=production 
      --wtype=proc.indexer.tron.wrk 
      --rack=r0 
      --chain=tron
    volumes:
      - ./config:/app/config
      - tron-data:/app/store
    restart: unless-stopped

  tron-api:
    build: .
    environment:
      - NODE_CONFIG_DIR=/app/config
    command: >
      node worker.js 
      --env=production 
      --wtype=api.indexer.tron.wrk 
      --rack=r0 
      --chain=tron
      --procRpc=${TRX_PROC_RPC_KEY}
    ports:
      - "8088:8080"
    depends_on:
      - tron-processor
    restart: unless-stopped

  # USDT TRC-20 Token Indexer
  usdt-processor:
    build: .
    environment:
      - NODE_CONFIG_DIR=/app/config
    command: >
      node worker.js 
      --env=production 
      --wtype=proc.indexer.trc20.wrk 
      --rack=r0 
      --chain=tron
      --token=usdt
    volumes:
      - ./config:/app/config
      - usdt-data:/app/store
    restart: unless-stopped

  usdt-api:
    build: .
    environment:
      - NODE_CONFIG_DIR=/app/config
    command: >
      node worker.js 
      --env=production 
      --wtype=api.indexer.trc20.wrk 
      --rack=r0 
      --chain=tron
      --token=usdt
      --procRpc=${USDT_PROC_RPC_KEY}
    ports:
      - "8089:8080"
    depends_on:
      - usdt-processor
    restart: unless-stopped

volumes:
  tron-data:
  usdt-data:
```

## TRON-Specific Features

### Native TRX Processing

Processes native TRX token transfers:

- **Transfer Contracts**: Monitors TransferContract transactions
- **Sun Conversion**: Converts SUN (10^-6 TRX) to TRX decimal format
- **Resource Tracking**: Tracks energy and bandwidth consumption
- **Account Activation**: Handles TRON account activation transactions

### TRC-20 Token Processing

Dedicated processing for TRC-20 tokens:

- **Transfer Events**: Monitors TRC-20 Transfer events from contracts
- **Contract Calls**: Processes TRC-20 contract function calls
- **Token Creation**: Tracks new TRC-20 token deployments
- **Freeze/Unfreeze**: Handles TRON's token freezing mechanisms

### Smart Contract Support

- **TVM Contract Calls**: Processes TRON Virtual Machine contract calls
- **Energy Consumption**: Tracks smart contract energy usage
- **Contract Events**: Monitors and parses contract event logs
- **Internal Transactions**: Handles internal contract transactions

### Address Validation

Comprehensive TRON address validation:

```javascript
// TRON addresses (Base58 format)
"TLPuzoqeWd8JWqamCNKXP6Y4FbH1H3a3H8" ✓ // Regular address

// Contract addresses
"TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t" ✓ // USDT contract

// Hex addresses (internal format)
"0x41a0b86a33e6b8c66e29e8bb8a87e8e76e6d6e5e6f" ✓

// Multi-signature addresses
"TMuA6YqfCeX8EhbfYEg5y7S4DqzSJireY9" ✓
```

## API Behavior

The TRON indexer implements the [standard WDK Indexer API](indexer-api-reference.md) with TRON-specific behaviors:

### TRON-Specific Features

**Resource Model:**
- Energy and bandwidth consumption tracking
- `energyUsed` and bandwidth details in metadata
- Resource cost calculation for transaction fees
- Sun to TRX conversion (1 TRX = 1,000,000 SUN)

**TRC-20 Token Support:**
- TRC-20 token transfers via event log processing
- Contract address identification in metadata
- Support for custom TRC-20 implementations
- Automatic decimal normalization for different tokens

**Address Formats:**
- Base58 address encoding (similar to Bitcoin)
- Support for regular addresses (T...) and contract addresses
- Multi-signature wallet address handling
- Address validation with checksum verification

### Example TRON Responses

**Native TRX Transfer:**
```json
{
  "blockchain": "tron",
  "blockNumber": 55000000,
  "transactionHash": "0x1a2b3c4d5e6f7890abcdef...",
  "transactionIndex": 8,
  "direction": "out",
  "from": "TLPuzoqeWd8JWqamCNKXP6Y4FbH1H3a3H8",
  "to": "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
  "token": "trx",
  "amount": "100.5",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": "confirmed",
  "confirmations": 19,
  "metadata": {
    "energyUsed": "0",
    "bandwidthUsed": "267"
  }
}
```

**TRC-20 Token Transfer:**
```json
{
  "blockchain": "tron",
  "blockNumber": 55000000,
  "transactionHash": "0x1a2b3c4d5e6f7890abcdef...",
  "transactionIndex": 8,
  "logIndex": 2,
  "direction": "in",
  "from": "TLPuzoqeWd8JWqamCNKXP6Y4FbH1H3a3H8",
  "to": "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
  "token": "usdt",
  "amount": "5000.000000",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": "confirmed",
  "confirmations": 19,
  "metadata": {
    "contractAddress": "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
    "energyUsed": "13000",
    "bandwidthUsed": "345"
  }
}
```

For complete API documentation, method signatures, and examples, see the [WDK Indexer API Reference](indexer-api-reference.md).

## Performance Optimization

### Recommended Settings by Network

**Mainnet**:
```json
{
  "txConcurrency": 5,
  "blockBatchSize": 10,
  "syncInterval": "*/1 * * * *",
  "apiTimeout": 30000
}
```

**Testnet**:
```json
{
  "txConcurrency": 10,
  "blockBatchSize": 20,
  "syncInterval": "*/30 * * * * *",
  "apiTimeout": 15000
}
```

### API Optimization

**Rate Limiting**:
```json
{
  "rateLimit": {
    "requests": 200,
    "period": 60000,
    "burst": 20
  }
}
```

**Batch Processing**:
```json
{
  "batchConfig": {
    "transactionBatchSize": 100,
    "contractCallBatchSize": 50,
    "eventLogBatchSize": 1000
  }
}
```

## TRC-20 Token Management

### Adding New TRC-20 Tokens

1. **Identify Contract**: Get TRC-20 contract address from TRONSCAN
2. **Check Token Info**: Verify token decimals and symbol
3. **Create Configuration**:
   ```json
   {
     "chain": "tron",
     "token": "newtoken",
     "contractAddress": "TNewTokenContractAddress...",
     "decimals": 18,
     "rpcUrl": "https://api.trongrid.io"
   }
   ```
4. **Deploy Workers**: Start processor and API workers for new token

### Popular TRC-20 Configurations

**USD Coin (USDT)**:
```json
{
  "chain": "tron",
  "token": "usdc",
  "contractAddress": "TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8",
  "decimals": 6
}
```

**JUST (JST)**:
```json
{
  "chain": "tron",
  "token": "jst",
  "contractAddress": "TCFLL5dx5ZJdKnWuesXxi1VPwjLVmWZZy9",
  "decimals": 18
}
```

**BitTorrent (BTT)**:
```json
{
  "chain": "tron",
  "token": "btt",
  "contractAddress": "TAFjULxiVgT4qWk6UZwjqwZXTSaGaqnVp4",
  "decimals": 18
}
```

## Monitoring and Maintenance

### Key Metrics

```bash
# Check sync status
curl -X POST http://localhost:8088/rpc -d '{
  "method": "getBlockFromChain",
  "params": {"blockNumber": "latest"}
}'

# Monitor API usage and performance
tail -f logs/tron-indexer.log | grep -E "(api|performance|energy)"

# TRC-20 token processing status
curl -X POST http://localhost:8089/rpc -d '{
  "method": "queryTransactions",
  "params": {"fromBlock": "latest"}
}'
```

### Performance Monitoring

**TRON-Specific Metrics**:
- Block processing speed vs. TRON block time (~3 seconds)
- Energy consumption tracking accuracy
- Contract event processing efficiency
- Memory usage during high-throughput periods

**TRC-20-Specific Metrics**:
- Transfer event detection rate
- Contract call success rate
- Token balance calculation accuracy
- Event log processing latency

## Troubleshooting

### Common Issues

**API Rate Limiting**:
```bash
# Test TronGrid API connectivity
curl -H "TRON-PRO-API-KEY: YOUR_API_KEY" \
  "https://api.trongrid.io/wallet/getnowblock"
```

**Address Format Issues**:
```bash
# Convert address formats using TronWeb
npm install tronweb
node -e "
const TronWeb = require('tronweb');
const address = 'TLPuzoqeWd8JWqamCNKXP6Y4FbH1H3a3H8';
console.log('Base58:', address);
console.log('Hex:', TronWeb.address.toHex(address));
console.log('Valid:', TronWeb.isAddress(address));
"
```

**TRC-20 Event Missing**:
```bash
# Verify TRC-20 contract
curl -X POST https://api.trongrid.io/wallet/getcontract \
  -H "Content-Type: application/json" \
  -d '{"value": "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"}'

# Check contract events
curl -X POST https://api.trongrid.io/v1/contracts/TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t/events \
  -H "TRON-PRO-API-KEY: YOUR_API_KEY"
```

### Debugging Commands

```bash
# Check current block
curl -X POST https://api.trongrid.io/wallet/getnowblock

# Verify account info
curl -X POST https://api.trongrid.io/wallet/getaccount \
  -H "Content-Type: application/json" \
  -d '{"address": "TLPuzoqeWd8JWqamCNKXP6Y4FbH1H3a3H8"}'

# Get transaction details
curl -X POST https://api.trongrid.io/wallet/gettransactionbyid \
  -H "Content-Type: application/json" \
  -d '{"value": "TRANSACTION_ID"}'
```

## Security Considerations

### API Security

- **API Key Protection**: Secure TronGrid API keys
- **Rate Limiting**: Implement application-level rate limiting
- **Connection Encryption**: Always use HTTPS for API connections
- **Provider Redundancy**: Use multiple API providers for failover

### Address Security

- **Address Validation**: Validate TRON address formats and checksums
- **Contract Verification**: Verify TRC-20 contract addresses on TRONSCAN
- **Multi-sig Support**: Handle multi-signature wallet addresses
- **Base58 Encoding**: Ensure proper Base58 address encoding

### Data Integrity

- **Transaction Verification**: Validate transaction signatures and results
- **Block Verification**: Verify block hashes and sequences
- **Energy Verification**: Confirm energy consumption calculations
- **Balance Reconciliation**: Periodically verify balance calculations

## Advanced Configuration

### Custom Contract Processing

```javascript
// Custom TRC-20 processor
class CustomTRC20Processor extends TRC20Processor {
  constructor(config, ctx) {
    super(config, ctx);
    this.customEventSignatures = config.customEventSignatures || [];
  }

  async processCustomEvents(events) {
    // Custom event processing logic
  }
}
```

### Energy Optimization

```json
{
  "energyConfig": {
    "trackEnergyUsage": true,
    "energyThreshold": 100000,
    "optimizeContractCalls": true
  }
}
```

### Multi-Network Configuration

```json
{
  "networks": {
    "mainnet": {
      "rpcUrl": "https://api.trongrid.io",
      "apiKey": "MAINNET_API_KEY"
    },
    "shasta": {
      "rpcUrl": "https://api.shasta.trongrid.io",
      "apiKey": "TESTNET_API_KEY"
    },
    "nile": {
      "rpcUrl": "https://api.nileex.io",
      "apiKey": "NILE_API_KEY"
    }
  }
}
```
