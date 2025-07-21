# TON Indexer

## Overview

The WDK TON Indexer provides comprehensive indexing for The Open Network (TON), supporting native TON token transfers, smart contract interactions, and TON's unique message-based architecture. Built specifically for TON's high-performance blockchain, it efficiently processes transactions and maintains real-time synchronization.

### Key Features

- **TON Architecture Support**: Native support for TON's message-based consensus
- **Smart Contract Processing**: Comprehensive TVM smart contract monitoring
- **Jetton Token Support**: Complete indexing of TON Jetton (fungible token) transfers
- **Multi-Network Ready**: Mainnet and testnet compatibility
- **High Throughput**: Optimized for TON's high transaction speeds
- **Message Processing**: Handles TON's unique message-passing architecture

## Architecture

The TON indexer extends the base WDK indexer architecture with TON-specific components:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   TON RPC       │    │   TON Full Node  │    │   Other TON     │
│   Endpoints     │    │   HTTP API       │    │   RPC Nodes     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 ▼
                    ┌──────────────────────┐
                    │   TON Client         │
                    │   (TonLib/HTTP)      │
                    └──────────────────────┘
                                 │
                                 ▼
                    ┌──────────────────────┐
                    │   TON Processor      │
                    │   (Blocks + Msgs)    │
                    └──────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    ▼                         ▼
          ┌─────────────────┐       ┌─────────────────┐
          │   TON Native    │       │   Jetton Token  │
          │   Processor     │       │   Processor     │
          └─────────────────┘       └─────────────────┘
```

## Supported Networks

| Network | Native Token | RPC Endpoint Examples |
|---------|--------------|----------------------|
| TON Mainnet | TON | `https://toncenter.com/api/v2/` |
| TON Testnet | TON | `https://testnet.toncenter.com/api/v2/` |

### Popular Jetton Tokens

| Token | Symbol | Contract Address | Decimals |
|-------|--------|------------------|----------|
| Tether USD | USDT | `EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs` | 6 |
| USD Coin | USDC | `EQB-MPwrd1G6WKNkLz_VnV6WqBDd142KMQv-g1O-8QUA3728` | 6 |
| TON Coin | TON | `EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c` | 9 |

## Configuration

### Required Configuration Files

Create these configuration files in your `config/` directory:

**config/common.json**
```json
{
  "debug": 0,
  "chain": "ton",
  "topicConf": {
    "crypto": {
      "algo": "hmac-sha384",
      "key": "your-secret-encryption-key"
    }
  }
}
```

**config/ton.json** (Native TON indexing)
```json
{
  "chain": "ton",
  "token": "ton",
  "rpcUrl": "https://toncenter.com/api/v2/",
  "network": "mainnet",
  "decimals": 9,
  "txConcurrency": 5,
  "blockBatchSize": 10,
  "apiKey": "YOUR_TONCENTER_API_KEY",
  "syncInterval": "*/1 * * * *"
}
```

**config/ton-usdt.json** (Jetton USDT indexing)
```json
{
  "chain": "ton",
  "token": "usdt",
  "rpcUrl": "https://toncenter.com/api/v2/",
  "network": "mainnet",
  "contractAddress": "EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs",
  "decimals": 6,
  "txConcurrency": 3,
  "blockBatchSize": 5,
  "apiKey": "YOUR_TONCENTER_API_KEY"
}
```

### Configuration Options

#### Network Settings

- **chain**: Always "ton"
- **token**: Token symbol ("ton", "usdt", "usdc", etc.)
- **rpcUrl**: TON HTTP API endpoint URL
- **network**: Network type ("mainnet", "testnet")
- **decimals**: Token decimal places (9 for TON, varies for Jettons)

#### Performance Settings

- **txConcurrency**: Concurrent transaction processing (default: 5)
- **blockBatchSize**: Blocks processed per batch (default: 10)
- **syncInterval**: Sync frequency cron expression
- **apiKey**: TONCenter API key for enhanced rate limits

#### Jetton Token Settings

- **contractAddress**: Jetton master contract address (required for Jettons)
- **jettonWalletCode**: Custom jetton wallet code hash (optional)
- **transferOpCode**: Custom transfer operation code (optional)

### Network-Specific Examples

**Mainnet Configuration**:
```json
{
  "chain": "ton",
  "token": "ton",
  "rpcUrl": "https://toncenter.com/api/v2/",
  "network": "mainnet",
  "decimals": 9,
  "txConcurrency": 5,
  "blockBatchSize": 10
}
```

**Testnet Configuration**:
```json
{
  "chain": "ton",
  "token": "ton",
  "rpcUrl": "https://testnet.toncenter.com/api/v2/",
  "network": "testnet",
  "decimals": 9,
  "txConcurrency": 10,
  "blockBatchSize": 20
}
```

## Provider Setup

### TON RPC Endpoints

**Official TON Endpoints**:
```
Mainnet: https://toncenter.com/api/v2/
Testnet: https://testnet.toncenter.com/api/v2/
```

**Third-Party Providers**:

**TON Access**:
```
Mainnet: https://mainnet.tonhubapi.com/jsonRPC
Testnet: https://testnet.tonhubapi.com/jsonRPC
```

**TON API**:
```
Mainnet: https://tonapi.io/v1/
```

### TONCenter API Setup

1. **Get API Key**: Register at [toncenter.com](https://toncenter.com)
2. **Generate Key**: Create API key in dashboard
3. **Configure Rate Limits**: Set appropriate rate limits for your use case
4. **Test Connectivity**: Verify API access with test requests

### Self-Hosted TON Node

**Requirements**:
- High-performance CPU (8+ cores)
- 32GB+ RAM
- 1TB+ NVMe SSD
- Stable internet connection (100Mbps+)

**Installation**:
```bash
# Download TON validator software
git clone https://github.com/ton-blockchain/ton.git
cd ton

# Build validator
mkdir build && cd build
cmake .. -DCMAKE_BUILD_TYPE=Release
make -j$(nproc)

# Initialize node
./validator-engine/validator-engine --help

# Start full node with HTTP API
./http-proxy/http-proxy --port 8081 --global-config global.config.json
```

## Deployment

### Basic Deployment

1. **Clone and Install**:
   ```bash
   git clone https://github.com/tetherto/wdk-indexer-wrk-ton.git
   cd wdk-indexer-wrk-ton
   npm install
   ```

2. **Setup Configuration**:
   ```bash
   # Native TON indexing
   cp config/ton.json.example config/ton.json
   
   # Jetton token indexing
   cp config/ton.json.example config/ton-usdt.json
   
   cp config/common.json.example config/common.json
   ```

3. **Start Native TON Processor**:
   ```bash
   NODE_CONFIG_DIR=./config node worker.js \
     --env=production \
     --wtype=proc.indexer.ton.wrk \
     --rack=r0 \
     --chain=ton
   ```

4. **Start Jetton Token Processor**:
   ```bash
   NODE_CONFIG_DIR=./config node worker.js \
     --env=production \
     --wtype=proc.indexer.jetton.wrk \
     --rack=r0 \
     --chain=ton \
     --token=usdt
   ```

5. **Start API Workers**:
   ```bash
   # Native TON API
   NODE_CONFIG_DIR=./config node worker.js \
     --env=production \
     --wtype=api.indexer.ton.wrk \
     --rack=r0 \
     --chain=ton \
     --procRpc=<processor-rpc-key>
   
   # Jetton token API
   NODE_CONFIG_DIR=./config node worker.js \
     --env=production \
     --wtype=api.indexer.jetton.wrk \
     --rack=r0 \
     --chain=ton \
     --token=usdt \
     --procRpc=<jetton-processor-rpc-key>
   ```

### Docker Deployment

**Multi-Service Docker Compose**:
```yaml
version: '3.8'
services:
  # TON Native Token Indexer
  ton-processor:
    build: .
    environment:
      - NODE_CONFIG_DIR=/app/config
    command: >
      node worker.js 
      --env=production 
      --wtype=proc.indexer.ton.wrk 
      --rack=r0 
      --chain=ton
    volumes:
      - ./config:/app/config
      - ton-data:/app/store
    restart: unless-stopped

  ton-api:
    build: .
    environment:
      - NODE_CONFIG_DIR=/app/config
    command: >
      node worker.js 
      --env=production 
      --wtype=api.indexer.ton.wrk 
      --rack=r0 
      --chain=ton
      --procRpc=${TON_PROC_RPC_KEY}
    ports:
      - "8086:8080"
    depends_on:
      - ton-processor
    restart: unless-stopped

  # USDT Jetton Token Indexer
  usdt-processor:
    build: .
    environment:
      - NODE_CONFIG_DIR=/app/config
    command: >
      node worker.js 
      --env=production 
      --wtype=proc.indexer.jetton.wrk 
      --rack=r0 
      --chain=ton
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
      --wtype=api.indexer.jetton.wrk 
      --rack=r0 
      --chain=ton
      --token=usdt
      --procRpc=${USDT_PROC_RPC_KEY}
    ports:
      - "8087:8080"
    depends_on:
      - usdt-processor
    restart: unless-stopped

volumes:
  ton-data:
  usdt-data:
```

## TON-Specific Features

### Native TON Processing

Processes native TON token transfers:

- **Message Processing**: Handles TON's message-based transaction model
- **Nanoton Conversion**: Converts nanotons (10^-9 TON) to TON decimal format
- **Workchain Support**: Processes transactions across TON workchains
- **External Messages**: Handles external message processing

### Jetton Token Processing

Dedicated processing for Jetton tokens:

- **Transfer Notifications**: Monitors jetton transfer notifications
- **Wallet Detection**: Automatically discovers jetton wallet addresses
- **Burn/Mint Events**: Tracks token minting and burning operations
- **Master Contract**: Monitors jetton master contract interactions

### Smart Contract Support

- **TVM Contract Calls**: Processes TON Virtual Machine contract calls
- **Code Updates**: Tracks smart contract code changes
- **Storage Updates**: Monitors contract storage modifications
- **Gas Fee Processing**: Handles TON's gas fee calculations

### Address Validation

Comprehensive TON address validation:

```javascript
// TON addresses (various formats)
"EQD4FPq-PRDieyQKkizFTRtSDyucUIqrj0v_zXJmqaDp6_0t" ✓ // User-friendly
"0:f814fabe3d10e27b240a922cc54d1b520f2b9c508aab8f4bffcd7266a9a0e9eb" ✓ // Raw

// Jetton wallet addresses
"EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs" ✓

// Smart contract addresses
"EQBYTuYbLf8INxFtD8tQeNk5ZLy-nAX9ahQbG_yl1qQ-GEMS" ✓
```

## API Behavior

### Native TON Responses

**Transaction Response**:
```json
{
  "blockchain": "ton",
  "blockNumber": 35000000,
  "transactionHash": "0x1a2b3c4d5e6f7890abcdef...",
  "transactionIndex": 3,
  "from": "EQD4FPq-PRDieyQKkizFTRtSDyucUIqrj0v_zXJmqaDp6_0t",
  "to": "EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs",
  "token": "ton",
  "amount": "5.5",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Jetton Token Responses

**Token Transfer Response**:
```json
{
  "blockchain": "ton",
  "blockNumber": 35000000,
  "transactionHash": "0x1a2b3c4d5e6f7890abcdef...",
  "transactionIndex": 3,
  "logIndex": 1,
  "from": "EQD4FPq-PRDieyQKkizFTRtSDyucUIqrj0v_zXJmqaDp6_0t",
  "to": "EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs",
  "token": "usdt",
  "amount": "1000.0",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Query Examples

```javascript
// Get TON balance
const tonBalance = await tonIndexer.getBalance('EQD4FPq-PRDieyQKkizFTRtSDyucUIqrj0v_zXJmqaDp6_0t');

// Get USDT balance
const usdtBalance = await usdtIndexer.getBalance('EQD4FPq-PRDieyQKkizFTRtSDyucUIqrj0v_zXJmqaDp6_0t');

// Query TON transactions for specific addresses
const tonTransactions = await tonIndexer.queryTransactions({
  fromBlock: 35000000,
  toBlock: 35000100,
  addresses: ['EQD4FPq-PRDieyQKkizFTRtSDyucUIqrj0v_zXJmqaDp6_0t']
});

// Query USDT transfers with timestamp filtering
const usdtTransfers = await usdtIndexer.queryTransactions({
  fromTs: '2024-01-01T00:00:00Z',
  toTs: '2024-01-31T23:59:59Z',
  addresses: ['EQD4FPq-PRDieyQKkizFTRtSDyucUIqrj0v_zXJmqaDp6_0t']
});

// Get specific transaction
const tx = await tonIndexer.getTransaction('0x1a2b3c4d5e6f7890abcdef...');
```

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
    "requests": 100,
    "period": 60000,
    "burst": 10
  }
}
```

**Batch Processing**:
```json
{
  "batchConfig": {
    "transactionBatchSize": 100,
    "messageBatchSize": 500,
    "maxRetries": 3
  }
}
```

## Jetton Token Management

### Adding New Jetton Tokens

1. **Identify Master Contract**: Get jetton master contract address
2. **Check Token Info**: Verify token decimals and metadata
3. **Create Configuration**:
   ```json
   {
     "chain": "ton",
     "token": "newtoken",
     "contractAddress": "EQNewTokenMasterContract...",
     "decimals": 6,
     "rpcUrl": "https://toncenter.com/api/v2/"
   }
   ```
4. **Deploy Workers**: Start processor and API workers for new token

### Popular Jetton Configurations

**USD Coin (USDC)**:
```json
{
  "chain": "ton",
  "token": "usdc",
  "contractAddress": "EQB-MPwrd1G6WKNkLz_VnV6WqBDd142KMQv-g1O-8QUA3728",
  "decimals": 6
}
```

**Wrapped TON (wTON)**:
```json
{
  "chain": "ton",
  "token": "wton",
  "contractAddress": "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c",
  "decimals": 9
}
```

## Monitoring and Maintenance

### Key Metrics

```bash
# Check sync status
curl -X POST http://localhost:8086/rpc -d '{
  "method": "getBlockFromChain",
  "params": {"blockNumber": "latest"}
}'

# Monitor API usage and performance
tail -f logs/ton-indexer.log | grep -E "(api|performance|rate)"

# Jetton token processing status
curl -X POST http://localhost:8087/rpc -d '{
  "method": "queryTransactions",
  "params": {"fromBlock": "latest"}
}'
```

### Performance Monitoring

**TON-Specific Metrics**:
- Block processing speed vs. TON block time (~5 seconds)
- Message processing efficiency
- API rate limit usage and optimization
- Memory usage during large block processing

**Jetton-Specific Metrics**:
- Transfer notification detection rate
- Jetton wallet discovery success rate
- Master contract interaction parsing
- Balance calculation accuracy

## Troubleshooting

### Common Issues

**API Rate Limiting**:
```bash
# Test TONCenter API connectivity
curl -H "X-API-Key: YOUR_API_KEY" \
  "https://toncenter.com/api/v2/getBlockHeader?seqno=latest"
```

**Address Format Issues**:
```bash
# Convert address formats using TON tools
npm install @ton/ton
node -e "
const { Address } = require('@ton/ton');
const addr = Address.parse('EQD4FPq-PRDieyQKkizFTRtSDyucUIqrj0v_zXJmqaDp6_0t');
console.log('Raw:', addr.toRawString());
console.log('User-friendly:', addr.toString());
"
```

**Jetton Detection Problems**:
```bash
# Verify jetton master contract
curl -H "X-API-Key: YOUR_API_KEY" \
  "https://toncenter.com/api/v2/getAddressInformation?address=EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs"

# Check jetton wallet code
curl -H "X-API-Key: YOUR_API_KEY" \
  "https://toncenter.com/api/v2/runGetMethod?address=MASTER_CONTRACT&method=get_jetton_data"
```

### Debugging Commands

```bash
# Check current masterchain block
curl -H "X-API-Key: YOUR_API_KEY" \
  "https://toncenter.com/api/v2/getMasterchainInfo"

# Verify account state
curl -H "X-API-Key: YOUR_API_KEY" \
  "https://toncenter.com/api/v2/getAddressState?address=ADDRESS"

# Get transaction details
curl -H "X-API-Key: YOUR_API_KEY" \
  "https://toncenter.com/api/v2/getTransactions?address=ADDRESS&limit=1"
```

## Security Considerations

### API Security

- **API Key Protection**: Secure TONCenter API keys
- **Rate Limiting**: Implement application-level rate limiting
- **Connection Encryption**: Always use HTTPS for API connections
- **Provider Redundancy**: Use multiple API providers for failover

### Address Security

- **Address Validation**: Validate TON address formats and checksums
- **Contract Verification**: Verify jetton master contract addresses
- **Workchain Validation**: Ensure addresses belong to correct workchain
- **Bounceable Addresses**: Handle bounceable vs. non-bounceable addresses

### Data Integrity

- **Message Verification**: Validate message signatures and hashes
- **Block Verification**: Verify block hashes and sequences
- **Transaction Verification**: Confirm transaction success status
- **Balance Reconciliation**: Periodically verify balance calculations

## Advanced Configuration

### Custom Message Processing

```javascript
// Custom TON message processor
class CustomTONProcessor extends TONProcessor {
  constructor(config, ctx) {
    super(config, ctx);
    this.customOpCodes = config.customOpCodes || [];
  }

  async processCustomMessages(messages) {
    // Custom message processing logic
  }
}
```

### Multi-Workchain Support

```json
{
  "workchains": {
    "masterchain": {
      "workchainId": -1,
      "enabled": true
    },
    "basechain": {
      "workchainId": 0,
      "enabled": true
    }
  }
}
```

### Jetton Advanced Configuration

```json
{
  "jettonConfig": {
    "autoDiscoverWallets": true,
    "walletCodeHashes": [
      "0x1234567890abcdef...",
      "0xfedcba0987654321..."
    ],
    "transferOpCodes": [
      "0x0f8a7ea5",
      "0x178d4519"
    ]
  }
}
```
