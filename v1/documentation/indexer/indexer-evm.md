# EVM Indexer

## Overview

The WDK EVM Indexer provides comprehensive indexing for Ethereum and all EVM-compatible blockchains including Binance Smart Chain, Polygon, Avalanche, and others. It supports both native tokens (ETH, BNB, MATIC) and ERC-20 token contracts with automatic contract detection and normalization.

### Key Features

- **Multi-Chain Support**: Ethereum, BSC, Polygon, Avalanche, Arbitrum, Optimism, and more
- **ERC-20 Token Indexing**: Automatic token contract detection and transfer logging
- **Gas Optimization**: Efficient batch processing with configurable gas limits
- **Contract Interaction**: Smart contract call detection and parsing
- **Address Validation**: Comprehensive Ethereum address format validation
- **Multi-Token Support**: Index multiple tokens per chain simultaneously

## Architecture

The EVM indexer extends the base WDK indexer architecture with Ethereum-specific components:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Ethereum      │    │    Infura/       │    │   Other EVM     │
│   Mainnet       │    │    Alchemy       │    │   RPC Nodes     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 ▼
                    ┌──────────────────────┐
                    │   Ethers.js Client   │
                    │   (JSON-RPC)         │
                    └──────────────────────┘
                                 │
                                 ▼
                    ┌──────────────────────┐
                    │   EVM Processor      │
                    │   (Block + Logs)     │
                    └──────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    ▼                         ▼
          ┌─────────────────┐       ┌─────────────────┐
          │  Native Token   │       │   ERC-20 Token  │
          │   Processor     │       │   Processor     │
          └─────────────────┘       └─────────────────┘
```

## Supported Networks

| Network | Chain ID | Native Token | RPC Endpoint Examples |
|---------|----------|--------------|----------------------|
| Ethereum Mainnet | 1 | ETH | `https://mainnet.infura.io/v3/PROJECT_ID` |
| Ethereum Sepolia | 11155111 | ETH | `https://sepolia.infura.io/v3/PROJECT_ID` |
| Polygon | 137 | MATIC | `https://polygon-mainnet.infura.io/v3/PROJECT_ID` |
| Arbitrum One | 42161 | ETH | `https://arb1.arbitrum.io/rpc` |

## Configuration

For general configuration concepts and shared options, see the [WDK Indexer Configuration](indexer-configuration.md) reference.

### EVM-Specific Configuration

EVM indexers support both native token and ERC-20 token indexing with different configuration patterns:

**config/ethereum.json** (Native ETH indexing)
```json
{
  "chain": "ethereum",
  "token": "eth",
  "rpcUrl": "https://mainnet.infura.io/v3/YOUR_PROJECT_ID",
  "network": "mainnet",
  "txConcurrency": 2,
  "blockBatchSize": 10,
  "gasOptimization": {
    "enabled": true,
    "maxGasPerBatch": "1000000"
  }
}
```

**config/ethereum-usdt.json** (ERC-20 USDT indexing)
```json
{
  "chain": "ethereum", 
  "token": "usdt",
  "rpcUrl": "https://mainnet.infura.io/v3/YOUR_PROJECT_ID",
  "network": "mainnet",
  "contractAddress": "0xdac17f958d2ee523a2206206994597c13d831ec7",
  "decimals": 6,
  "txConcurrency": 2,
  "blockBatchSize": 5
}
```

### EVM-Specific Options

**ERC-20 Token Settings:**
- **contractAddress**: Token contract address (required for ERC-20 tokens)
- **transferEventTopic**: Custom transfer event topic (optional, default: standard Transfer event)

**Gas Optimization:**
- **gasOptimization.enabled**: Enable gas usage optimization
- **gasOptimization.maxGasPerBatch**: Maximum gas consumption per batch

**Performance Tuning:**
- **txConcurrency**: Recommend 2-5 for Ethereum mainnet, 5-10 for faster networks
- **blockBatchSize**: Recommend 5-10 for Ethereum, 10-50 for faster networks

### Example Configurations

**Polygon Mainnet:**
```json
{
  "chain": "polygon",
  "token": "matic",
  "rpcUrl": "https://polygon-mainnet.infura.io/v3/PROJECT_ID",
  "network": "mainnet", 
  "txConcurrency": 5,
  "blockBatchSize": 20,
  "gasOptimization": {
    "enabled": true,
    "maxGasPerBatch": "5000000"
  }
}
```

**BSC with Higher Throughput:**
```json
{
  "chain": "bsc",
  "token": "bnb",
  "rpcUrl": "https://bsc-dataseed.binance.org/",
  "network": "mainnet",
  "txConcurrency": 10,
  "blockBatchSize": 50,
  "gasOptimization": {
    "enabled": true,
    "maxGasPerBatch": "10000000"
  }
}
```

**Custom ERC-20 Token:**
```json
{
  "chain": "ethereum",
  "token": "custom",
  "rpcUrl": "https://mainnet.infura.io/v3/PROJECT_ID",
  "contractAddress": "0x1234567890123456789012345678901234567890",
  "decimals": 18,
  "network": "mainnet",
  "txConcurrency": 3,
  "blockBatchSize": 8
}
```

## Provider Setup

### Infura Setup (or any other provider of your preference)

1. **Create Account**: Sign up at [infura.io](https://infura.io)
2. **Create Project**: Select Ethereum or your target network
3. **Get Project ID**: Copy from project settings
4. **Configure Endpoints**:
   ```
   Mainnet: https://mainnet.infura.io/v3/YOUR_PROJECT_ID
   Sepolia: https://sepolia.infura.io/v3/YOUR_PROJECT_ID
   Polygon: https://polygon-mainnet.infura.io/v3/YOUR_PROJECT_ID
   ```

### Public RPC Endpoints (or any other public provider of your preference)

**Free public endpoints** (use with caution in production):

```json
{
  "ethereum": "https://cloudflare-eth.com",
  "polygon": "https://polygon-rpc.com/",
  "arbitrum": "https://arb1.arbitrum.io/rpc",
}
```

### Self-Hosted Node

**Geth (Ethereum)**:
```bash
# Install Geth
sudo apt-get install ethereum

# Start with JSON-RPC enabled
geth --http --http.addr 127.0.0.1 --http.port 8545 --http.api eth,net,web3
```

**BSC Node**:
```bash
# Clone BSC repository
git clone https://github.com/binance-chain/bsc
cd bsc && make geth

# Start BSC node
./build/bin/geth --config ./config.toml --datadir ./node
```

## Deployment

### Basic Deployment

1. **Clone and Install**:
   ```bash
   git clone https://github.com/tetherto/wdk-indexer-wrk-evm.git
   cd wdk-indexer-wrk-evm
   npm install
   ```

2. **Setup Configuration**:
   ```bash
   # Native token indexing
   cp config/ethereum.json.example config/ethereum.json
   
   # ERC-20 token indexing  
   cp config/ethereum.json.example config/ethereum-usdt.json
   
   cp config/common.json.example config/common.json
   ```

3. **Start Native Token Processor**:
   ```bash
   NODE_CONFIG_DIR=./config node worker.js \
     --env=production \
     --wtype=proc.indexer.evm.wrk \
     --rack=r0 \
     --chain=ethereum
   ```

4. **Start ERC-20 Token Processor**:
   ```bash
   NODE_CONFIG_DIR=./config node worker.js \
     --env=production \
     --wtype=proc.indexer.erc20.wrk \
     --rack=r0 \
     --chain=ethereum \
     --token=usdt
   ```

5. **Start API Workers**:
   ```bash
   # Native token API
   NODE_CONFIG_DIR=./config node worker.js \
     --env=production \
     --wtype=api.indexer.evm.wrk \
     --rack=r0 \
     --chain=ethereum \
     --procRpc=<processor-rpc-key>
   
   # ERC-20 token API
   NODE_CONFIG_DIR=./config node worker.js \
     --env=production \
     --wtype=api.indexer.erc20.wrk \
     --rack=r0 \
     --chain=ethereum \
     --token=usdt \
     --procRpc=<erc20-processor-rpc-key>
   ```

### Docker Deployment

**Multi-Service Docker Compose**:
```yaml
version: '3.8'
services:
  # Ethereum Native Token Indexer
  ethereum-processor:
    build: .
    environment:
      - NODE_CONFIG_DIR=/app/config
    command: >
      node worker.js 
      --env=production 
      --wtype=proc.indexer.evm.wrk 
      --rack=r0 
      --chain=ethereum
    volumes:
      - ./config:/app/config
      - ethereum-data:/app/store
    restart: unless-stopped

  ethereum-api:
    build: .
    environment:
      - NODE_CONFIG_DIR=/app/config
    command: >
      node worker.js 
      --env=production 
      --wtype=api.indexer.evm.wrk 
      --rack=r0 
      --chain=ethereum
      --procRpc=${ETH_PROC_RPC_KEY}
    ports:
      - "8081:8080"
    depends_on:
      - ethereum-processor
    restart: unless-stopped

  # USDT ERC-20 Token Indexer  
  usdt-processor:
    build: .
    environment:
      - NODE_CONFIG_DIR=/app/config
    command: >
      node worker.js 
      --env=production 
      --wtype=proc.indexer.erc20.wrk 
      --rack=r0 
      --chain=ethereum
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
      --wtype=api.indexer.erc20.wrk 
      --rack=r0 
      --chain=ethereum
      --token=usdt
      --procRpc=${USDT_PROC_RPC_KEY}
    ports:
      - "8082:8080"
    depends_on:
      - usdt-processor
    restart: unless-stopped

volumes:
  ethereum-data:
  usdt-data:
```

## EVM-Specific Features

### Native Token Processing

Processes native blockchain transfers (ETH, BNB, MATIC, etc.):

- **Value Transfers**: Direct ETH/token transfers between addresses
- **Contract Interactions**: Calls to smart contracts with value
- **Gas Optimization**: Efficient batching to reduce RPC calls
- **Wei Conversion**: Automatic conversion from wei to decimal format

### ERC-20 Token Processing

Dedicated processing for ERC-20 token contracts:

- **Transfer Event Monitoring**: Listens for Transfer events from token contracts
- **Multi-Contract Support**: Index multiple tokens simultaneously
- **Decimal Normalization**: Handles different token decimal places
- **Contract Validation**: Verifies ERC-20 compliance

### Smart Contract Support

- **Contract Detection**: Identifies contract addresses vs. EOAs
- **Event Log Processing**: Parses relevant contract events
- **Function Call Tracking**: Monitors specific contract interactions
- **Multi-Signature Support**: Handles multi-sig wallet transactions

### Address Validation

Comprehensive Ethereum address validation:

```javascript
// Standard Ethereum addresses
"0x742d35cc6266c0c7e4c4b5c7f2b8e6f5f8c3e1a2" ✓

// Checksummed addresses (EIP-55)
"0x742d35Cc6266C0C7e4C4b5C7f2B8E6f5F8c3E1A2" ✓

// Contract addresses
"0xA0b86a33E6b8c66E29E8bb8A87E8e76e6D6e5E6f" ✓
```

## API Behavior

The EVM indexer implements the [standard WDK Indexer API](indexer-api-reference.md) with EVM-specific behaviors:

### EVM-Specific Features

**Transaction Types:**
- Native token transfers (ETH, BNB, MATIC, etc.)
- ERC-20 token transfers via event logs
- Smart contract interactions with value transfers
- Multiple token transfers within single transactions

**Event Log Processing:**
- `logIndex` field for ERC-20 transfers to identify event position
- `contractAddress` in metadata for token contract identification
- Automatic parsing of Transfer events (topic: `0xddf252ad...`)
- Support for custom event signatures

**Gas and Fee Tracking:**
- `gasUsed` included in metadata for transaction cost analysis
- Wei to Ether conversion for native token amounts
- ERC-20 decimal normalization based on contract specifications

### Example EVM Responses

**Native ETH Transfer:**
```json
{
  "blockchain": "ethereum",
  "blockNumber": 18500000,
  "transactionHash": "0x1a2b3c4d5e6f...",
  "transactionIndex": 45,
  "direction": "out",
  "from": "0x742d35cc6266c0c7e4c4b5c7f2b8e6f5f8c3e1a2",
  "to": "0xa0b86a33e6b8c66e29e8bb8a87e8e76e6d6e5e6f",
  "token": "eth",
  "amount": "1.5",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": "confirmed",
  "confirmations": 12,
  "metadata": {
    "gasUsed": "21000"
  }
}
```

**ERC-20 Token Transfer:**
```json
{
  "blockchain": "ethereum",
  "blockNumber": 18500000,
  "transactionHash": "0x1a2b3c4d5e6f...",
  "transactionIndex": 45,
  "logIndex": 12,
  "direction": "in",
  "from": "0x742d35cc6266c0c7e4c4b5c7f2b8e6f5f8c3e1a2",
  "to": "0xa0b86a33e6b8c66e29e8bb8a87e8e76e6d6e5e6f",
  "token": "usdt",
  "amount": "1000.000000",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": "confirmed",
  "confirmations": 12,
  "metadata": {
    "contractAddress": "0xdac17f958d2ee523a2206206994597c13d831ec7",
    "gasUsed": "65000"
  }
}
```

For complete API documentation, method signatures, and examples, see the [WDK Indexer API Reference](indexer-api-reference.md).

## Performance Optimization

### Recommended Settings by Network

**Ethereum Mainnet**:
```json
{
  "txConcurrency": 2,
  "blockBatchSize": 5,
  "gasOptimization": {
    "enabled": true,
    "maxGasPerBatch": "500000"
  }
}
```

**BSC (Higher throughput)**:
```json
{
  "txConcurrency": 5,
  "blockBatchSize": 20,
  "gasOptimization": {
    "enabled": true,
    "maxGasPerBatch": "2000000"
  }
}
```

**Polygon (Fast finality)**:
```json
{
  "txConcurrency": 10,
  "blockBatchSize": 50,
  "gasOptimization": {
    "enabled": true,
    "maxGasPerBatch": "5000000"
  }
}
```

### RPC Optimization

**Connection Pooling**:
```json
{
  "rpcUrl": "https://mainnet.infura.io/v3/PROJECT_ID",
  "rpcOptions": {
    "timeout": 30000,
    "retries": 3,
    "retryDelay": 1000
  }
}
```

**Batch Processing Tuning**:
```json
{
  "blockBatchSize": 10,
  "txConcurrency": 3,
  "logBatchSize": 1000,
  "eventFilterBatchSize": 10000
}
```

## Multi-Chain Deployment

### Running Multiple Networks

Deploy separate indexers for each network:

```bash
# Ethereum mainnet
NODE_CONFIG_DIR=./config node worker.js --chain=ethereum

# BSC mainnet  
NODE_CONFIG_DIR=./config node worker.js --chain=bsc

# Polygon mainnet
NODE_CONFIG_DIR=./config node worker.js --chain=polygon
```

### Cross-Chain Configuration

**config/multi-chain.json**:
```json
{
  "networks": {
    "ethereum": {
      "rpcUrl": "https://mainnet.infura.io/v3/PROJECT_ID",
      "chainId": 1,
      "token": "eth"
    },
    "bsc": {
      "rpcUrl": "https://bsc-dataseed.binance.org/",
      "chainId": 56, 
      "token": "bnb"
    },
    "polygon": {
      "rpcUrl": "https://polygon-mainnet.infura.io/v3/PROJECT_ID",
      "chainId": 137,
      "token": "matic"
    }
  }
}
```

## Token Contract Management

### Adding New ERC-20 Tokens

1. **Identify Contract**: Get token contract address from Etherscan
2. **Check Decimals**: Verify token decimal places
3. **Create Configuration**:
   ```json
   {
     "chain": "ethereum",
     "token": "newtoken",
     "contractAddress": "0x...",
     "decimals": 18,
     "rpcUrl": "https://mainnet.infura.io/v3/PROJECT_ID"
   }
   ```
4. **Deploy Workers**: Start processor and API workers for new token

### Popular Token Configurations

**USDC (Ethereum)**:
```json
{
  "chain": "ethereum",
  "token": "usdc", 
  "contractAddress": "0xa0b86a33e6b8c66e29e8bb8a87e8e76e6d6e5e6f",
  "decimals": 6
}
```

**USDT (BSC)**:
```json
{
  "chain": "bsc",
  "token": "usdt",
  "contractAddress": "0x55d398326f99059ff775485246999027b3197955", 
  "decimals": 18
}
```

**LINK (Ethereum)**:
```json
{
  "chain": "ethereum", 
  "token": "link",
  "contractAddress": "0x514910771af9ca656af840dff83e8264ecf986ca",
  "decimals": 18
}
```

## Monitoring and Maintenance

### Key Metrics

```bash
# Check sync status across networks
curl -X POST http://localhost:8081/rpc -d '{
  "method": "getBlockFromChain",
  "params": {"blockNumber": "latest"}
}'

# Monitor gas usage and performance
tail -f logs/ethereum-indexer.log | grep -E "(gas|performance|rpc)"

# ERC-20 event processing status
curl -X POST http://localhost:8082/rpc -d '{
  "method": "queryTransactions", 
  "params": {"fromBlock": "latest"}
}'
```

### Performance Monitoring

**Network-Specific Metrics**:
- Block processing speed vs. network block time
- RPC endpoint response times and errors
- Event log processing efficiency
- Memory usage during large block processing

**Token-Specific Metrics**:
- Transfer event detection rate
- Contract interaction success rate
- Decimal conversion accuracy
- Balance calculation consistency

## Troubleshooting

### Common Issues

**RPC Rate Limiting**:
```bash
# Symptoms: 429 errors, slow sync
# Solutions:
# 1. Reduce concurrency
# 2. Add multiple RPC endpoints 
# 3. Upgrade to paid RPC service
```

**Large Block Processing**:
```bash
# Symptoms: Memory errors, timeouts
# Solutions:
# 1. Increase Node.js heap size
# 2. Reduce blockBatchSize
# 3. Lower txConcurrency
```

**ERC-20 Event Missing**:
```bash
# Check contract address
curl -X POST $RPC_URL -d '{
  "method": "eth_getCode",
  "params": ["0xCONTRACT_ADDRESS", "latest"]
}'

# Verify Transfer event topic
curl -X POST $RPC_URL -d '{
  "method": "eth_getLogs",
  "params": [{
    "address": "0xCONTRACT_ADDRESS",
    "topics": ["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"],
    "fromBlock": "0x1234567",
    "toBlock": "0x1234567"
  }]
}'
```

### Debugging Commands

```bash
# Test RPC connectivity
curl -X POST $RPC_URL -d '{
  "method": "eth_blockNumber",
  "params": []
}'

# Check contract code existence
curl -X POST $RPC_URL -d '{
  "method": "eth_getCode", 
  "params": ["0xCONTRACT_ADDRESS", "latest"]
}'

# Verify address balance
curl -X POST $RPC_URL -d '{
  "method": "eth_getBalance",
  "params": ["0xADDRESS", "latest"]
}'
```

## Security Considerations

### RPC Security

- **API Key Protection**: Never expose API keys in client-side code
- **Rate Limiting**: Implement application-level rate limiting
- **Endpoint Rotation**: Use multiple RPC providers for redundancy
- **HTTPS Only**: Always use encrypted connections

### Smart Contract Security

- **Contract Verification**: Verify contracts on Etherscan before indexing
- **Event Validation**: Validate Transfer event signatures and topics
- **Decimal Validation**: Verify token decimal places match expected values
- **Address Validation**: Check contract addresses against known lists

### Data Integrity

- **Checksum Validation**: Use checksummed addresses (EIP-55)
- **Block Hash Verification**: Verify block hashes during processing
- **Transaction Receipt Validation**: Confirm transaction success status
- **Balance Reconciliation**: Periodically verify balance calculations

## Advanced Configuration

### Custom Event Processing

```javascript
// Custom ERC-20 event processor
class CustomTokenProcessor extends ERC20Processor {
  constructor(config, ctx) {
    super(config, ctx);
    this.customEventTopics = [
      '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925' // Approval
    ];
  }

  async processCustomEvents(logs) {
    // Custom event processing logic
  }
}
```

### Multi-Network Load Balancing

```json
{
  "loadBalancing": {
    "enabled": true,
    "strategy": "round-robin",
    "endpoints": [
      "https://mainnet.infura.io/v3/PROJECT_ID_1",
      "https://eth-mainnet.g.alchemy.com/v2/API_KEY_1", 
      "https://rpc.ankr.com/eth"
    ],
    "healthCheck": {
      "interval": 30000,
      "timeout": 5000
    }
  }
}
```

### Gas Price Optimization

```json
{
  "gasOptimization": {
    "enabled": true,
    "strategy": "adaptive",
    "maxGasPerBatch": "2000000",
    "dynamicBatching": true,
    "priorityFeeAdjustment": 1.1
  }
}
```
