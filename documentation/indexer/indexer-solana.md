# Solana Indexer

## Overview

The WDK Solana Indexer provides comprehensive indexing for the Solana blockchain, supporting both native SOL transfers and SPL (Solana Program Library) tokens. It features integration with Bitquery for enhanced data retrieval and handles Solana's unique slot-based architecture efficiently.

### Key Features

- **Slot-Based Processing**: Native support for Solana's slot-based consensus mechanism
- **SPL Token Support**: Complete indexing of SPL token transfers and programs
- **Bitquery Integration**: Enhanced data retrieval through GraphQL APIs
- **Multi-Network Support**: Mainnet, Testnet, and Devnet compatibility
- **Lamport Conversion**: Automatic conversion between lamports and SOL
- **Program Interaction**: Support for various Solana programs and instructions

## Architecture

The Solana indexer extends the base WDK indexer architecture with Solana-specific components:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Solana RPC    │    │    Bitquery      │    │   Other Solana  │
│   Endpoints     │    │   GraphQL API    │    │   RPC Nodes     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 ▼
                    ┌──────────────────────┐
                    │   Solana Client      │
                    │   (@solana/web3.js)  │
                    └──────────────────────┘
                                 │
                                 ▼
                    ┌──────────────────────┐
                    │  Solana Processor    │
                    │  (Slot + Programs)   │
                    └──────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    ▼                         ▼
          ┌─────────────────┐       ┌─────────────────┐
          │   SOL Native    │       │   SPL Token     │
          │   Processor     │       │   Processor     │
          └─────────────────┘       └─────────────────┘
```

## Supported Networks

| Network | Cluster | Native Token | RPC Endpoint Examples |
|---------|---------|--------------|----------------------|
| Mainnet Beta | mainnet-beta | SOL | `https://api.mainnet-beta.solana.com` |
| Testnet | testnet | SOL | `https://api.testnet.solana.com` |
| Devnet | devnet | SOL | `https://api.devnet.solana.com` |

### Popular SPL Tokens

| Token | Symbol | Mint Address | Decimals |
|-------|--------|--------------|----------|
| USD Coin | USDC | `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` | 6 |
| Tether | USDT | `Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB` | 6 |
| Wrapped SOL | wSOL | `So11111111111111111111111111111111111111112` | 9 |
| Raydium | RAY | `4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R` | 6 |
| Serum | SRM | `SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt` | 6 |

## Configuration

### Required Configuration Files

Create these configuration files in your `config/` directory:

**config/common.json**
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

**config/solana.json** (Native SOL indexing)
```json
{
  "chain": "solana",
  "token": "sol",
  "rpcUrl": "https://api.mainnet-beta.solana.com",
  "network": "mainnet-beta",
  "decimals": 9,
  "queryBlockLimit": 2,
  "bitqueryApiKey": "YOUR_BITQUERY_API_KEY",
  "bitqueryAuthToken": "YOUR_BITQUERY_AUTH_TOKEN",
  "slotConcurrency": 3
}
```

**config/solana-usdc.json** (SPL USDC indexing)
```json
{
  "chain": "solana",
  "token": "usdc",
  "rpcUrl": "https://api.mainnet-beta.solana.com",
  "network": "mainnet-beta",
  "mintAddress": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  "decimals": 6,
  "queryBlockLimit": 5,
  "bitqueryApiKey": "YOUR_BITQUERY_API_KEY",
  "bitqueryAuthToken": "YOUR_BITQUERY_AUTH_TOKEN",
  "slotConcurrency": 5
}
```

### Configuration Options

#### Network Settings

- **chain**: Always "solana"
- **token**: Token symbol ("sol", "usdc", "usdt", etc.)
- **rpcUrl**: Solana JSON-RPC endpoint URL
- **network**: Network cluster ("mainnet-beta", "testnet", "devnet")
- **decimals**: Token decimal places (9 for SOL, varies for SPL tokens)

#### Performance Settings

- **queryBlockLimit**: Slots processed per batch (default: 2)
- **slotConcurrency**: Concurrent slot processing (default: 3)
- **txBatchSize**: Transaction batch size for processing

#### Bitquery Integration

- **bitqueryApiKey**: API key for Bitquery service
- **bitqueryAuthToken**: Authentication token for Bitquery
- **bitqueryEndpoint**: Custom Bitquery endpoint (optional)

#### SPL Token Settings

- **mintAddress**: SPL token mint address (required for SPL tokens)
- **programId**: Custom SPL token program ID (optional)
- **associatedTokenProgram**: Associated token program ID (optional)

### Network-Specific Examples

**Testnet Configuration**:
```json
{
  "chain": "solana",
  "token": "sol",
  "rpcUrl": "https://api.testnet.solana.com",
  "network": "testnet",
  "decimals": 9,
  "queryBlockLimit": 5,
  "slotConcurrency": 5
}
```

**Devnet Configuration**:
```json
{
  "chain": "solana",
  "token": "sol", 
  "rpcUrl": "https://api.devnet.solana.com",
  "network": "devnet",
  "decimals": 9,
  "queryBlockLimit": 10,
  "slotConcurrency": 10
}
```

## Provider Setup

### Solana RPC Endpoints

**Official Solana Endpoints**:
```
Mainnet: https://api.mainnet-beta.solana.com
Testnet: https://api.testnet.solana.com
Devnet: https://api.devnet.solana.com
```

**Third-Party Providers**:

**QuickNode**:
```
Mainnet: https://solana-mainnet.quiknode.pro/YOUR_TOKEN/
Testnet: https://solana-testnet.quiknode.pro/YOUR_TOKEN/
```

**Alchemy**:
```
Mainnet: https://solana-mainnet.g.alchemy.com/v2/YOUR_API_KEY
Testnet: https://solana-testnet.g.alchemy.com/v2/YOUR_API_KEY
```

**Helius**:
```
Mainnet: https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY
Devnet: https://devnet.helius-rpc.com/?api-key=YOUR_API_KEY
```

### Bitquery Setup

1. **Create Account**: Sign up at [bitquery.io](https://bitquery.io)
2. **Get API Credentials**: Obtain API key and authentication token
3. **Configure Access**: Set up Solana data access in your account
4. **Verify Endpoints**: Test connectivity to Bitquery GraphQL API

**Bitquery GraphQL Endpoint**:
```
https://graphql.bitquery.io
```

### Self-Hosted Solana Validator

**Requirements**:
- High-performance SSD (2TB+ recommended)
- 128GB+ RAM
- Fast internet connection (1Gbps+ recommended)

**Installation**:
```bash
# Install Solana CLI tools
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Start validator (mainnet)
solana-validator \
  --identity validator-keypair.json \
  --vote-account vote-account-keypair.json \
  --ledger ledger/ \
  --rpc-port 8899 \
  --entrypoint entrypoint.mainnet-beta.solana.com:8001 \
  --expected-genesis-hash 5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d \
  --wal-recovery-mode skip_any_corrupted_record \
  --limit-ledger-size
```

## Deployment

### Basic Deployment

1. **Clone and Install**:
   ```bash
   git clone https://github.com/tetherto/wdk-indexer-wrk-solana.git
   cd wdk-indexer-wrk-solana
   npm install
   ```

2. **Setup Configuration**:
   ```bash
   # Native SOL indexing
   cp config/solana.json.example config/solana.json
   
   # SPL token indexing
   cp config/solana.json.example config/solana-usdc.json
   
   cp config/common.json.example config/common.json
   ```

3. **Start Native SOL Processor**:
   ```bash
   NODE_CONFIG_DIR=./config node worker.js \
     --env=production \
     --wtype=proc.indexer.solana.wrk \
     --rack=r0 \
     --chain=solana
   ```

4. **Start SPL Token Processor**:
   ```bash
   NODE_CONFIG_DIR=./config node worker.js \
     --env=production \
     --wtype=proc.indexer.spl.wrk \
     --rack=r0 \
     --chain=solana \
     --token=usdc
   ```

5. **Start API Workers**:
   ```bash
   # Native SOL API
   NODE_CONFIG_DIR=./config node worker.js \
     --env=production \
     --wtype=api.indexer.solana.wrk \
     --rack=r0 \
     --chain=solana \
     --procRpc=<processor-rpc-key>
   
   # SPL token API
   NODE_CONFIG_DIR=./config node worker.js \
     --env=production \
     --wtype=api.indexer.spl.wrk \
     --rack=r0 \
     --chain=solana \
     --token=usdc \
     --procRpc=<spl-processor-rpc-key>
   ```

### Docker Deployment

**Multi-Service Docker Compose**:
```yaml
version: '3.8'
services:
  # Solana Native Token Indexer
  solana-processor:
    build: .
    environment:
      - NODE_CONFIG_DIR=/app/config
    command: >
      node worker.js 
      --env=production 
      --wtype=proc.indexer.solana.wrk 
      --rack=r0 
      --chain=solana
    volumes:
      - ./config:/app/config
      - solana-data:/app/store
    restart: unless-stopped

  solana-api:
    build: .
    environment:
      - NODE_CONFIG_DIR=/app/config
    command: >
      node worker.js 
      --env=production 
      --wtype=api.indexer.solana.wrk 
      --rack=r0 
      --chain=solana
      --procRpc=${SOL_PROC_RPC_KEY}
    ports:
      - "8083:8080"
    depends_on:
      - solana-processor
    restart: unless-stopped

  # USDC SPL Token Indexer
  usdc-processor:
    build: .
    environment:
      - NODE_CONFIG_DIR=/app/config
    command: >
      node worker.js 
      --env=production 
      --wtype=proc.indexer.spl.wrk 
      --rack=r0 
      --chain=solana
      --token=usdc
    volumes:
      - ./config:/app/config
      - usdc-data:/app/store
    restart: unless-stopped

  usdc-api:
    build: .
    environment:
      - NODE_CONFIG_DIR=/app/config
    command: >
      node worker.js 
      --env=production 
      --wtype=api.indexer.spl.wrk 
      --rack=r0 
      --chain=solana
      --token=usdc
      --procRpc=${USDC_PROC_RPC_KEY}
    ports:
      - "8084:8080"
    depends_on:
      - usdc-processor
    restart: unless-stopped

volumes:
  solana-data:
  usdc-data:
```

## Solana-Specific Features

### Slot-Based Processing

Solana uses slots instead of traditional blocks:

- **Slot Processing**: Processes transactions within slots sequentially
- **Slot Finality**: Handles Solana's slot confirmation mechanism
- **Skip Empty Slots**: Efficiently skips slots with no relevant transactions
- **Batch Processing**: Groups multiple slots for efficient processing

### Native SOL Processing

Processes native SOL transfers:

- **System Program**: Monitors system program transfer instructions
- **Lamport Conversion**: Converts lamports (10^-9 SOL) to SOL decimal format
- **Account Changes**: Tracks SOL balance changes across accounts
- **Rent Considerations**: Handles Solana's rent mechanism

### SPL Token Processing

Dedicated processing for SPL tokens:

- **Token Program Monitoring**: Tracks SPL token program instructions
- **Transfer Instructions**: Processes token transfer instructions
- **Account Association**: Handles associated token accounts
- **Mint/Burn Events**: Tracks token minting and burning operations

### Address Validation

Comprehensive Solana address validation:

```javascript
// Standard Solana addresses (Base58 encoded)
"11111111111111111111111111111112" ✓ // System Program

// Token mint addresses
"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" ✓ // USDC

// Associated token accounts
"ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL" ✓

// Program addresses
"TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" ✓ // SPL Token Program
```

### Bitquery Integration

Enhanced data retrieval through Bitquery GraphQL:

- **Bulk Queries**: Efficient bulk transaction retrieval
- **Historical Data**: Access to complete historical data
- **Complex Filtering**: Advanced filtering capabilities
- **Real-time Updates**: Near real-time data synchronization

## API Behavior

### Native SOL Responses

**Transaction Response**:
```json
{
  "blockchain": "solana",
  "blockNumber": 250000000,
  "transactionHash": "5j7s8K9m2N3o4P5q6R7s8T9u0V1w2X3y4Z5a6B7c8D9e0F1g2H3i4J5k6L7m8N9o0P",
  "transactionIndex": 12,
  "from": "11111111111111111111111111111112",
  "to": "22222222222222222222222222222223",
  "token": "sol",
  "amount": "1.5",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### SPL Token Responses

**Token Transfer Response**:
```json
{
  "blockchain": "solana",
  "blockNumber": 250000000,
  "transactionHash": "5j7s8K9m2N3o4P5q6R7s8T9u0V1w2X3y4Z5a6B7c8D9e0F1g2H3i4J5k6L7m8N9o0P",
  "transactionIndex": 12,
  "logIndex": 3,
  "from": "TokenOwnerAddress1111111111111111111111111111",
  "to": "TokenOwnerAddress2222222222222222222222222222",
  "token": "usdc",
  "amount": "1000.0",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Query Examples

```javascript
// Get SOL balance
const solBalance = await solIndexer.getBalance('11111111111111111111111111111112');

// Get USDC balance
const usdcBalance = await usdcIndexer.getBalance('TokenOwnerAddress1111111111111111111111111111');

// Query SOL transactions for specific addresses
const solTransactions = await solIndexer.queryTransactions({
  fromBlock: 250000000,
  toBlock: 250000100,
  addresses: ['11111111111111111111111111111112']
});

// Query USDC transfers with timestamp filtering
const usdcTransfers = await usdcIndexer.queryTransactions({
  fromTs: '2024-01-01T00:00:00Z',
  toTs: '2024-01-31T23:59:59Z',
  addresses: ['TokenOwnerAddress1111111111111111111111111111']
});

// Get specific transaction
const tx = await solIndexer.getTransaction('5j7s8K9m2N3o4P5q6R7s8T9u0V1w2X3y4Z5a6B7c8D9e0F1g2H3i4J5k6L7m8N9o0P');
```

## Performance Optimization

### Recommended Settings by Network

**Mainnet Beta**:
```json
{
  "queryBlockLimit": 2,
  "slotConcurrency": 3,
  "bitqueryBatchSize": 1000,
  "rpcTimeout": 30000
}
```

**Testnet/Devnet**:
```json
{
  "queryBlockLimit": 10,
  "slotConcurrency": 10,
  "bitqueryBatchSize": 2000,
  "rpcTimeout": 15000
}
```

### Bitquery Optimization

**Query Batching**:
```json
{
  "bitqueryConfig": {
    "batchSize": 1000,
    "maxRetries": 3,
    "retryDelay": 1000,
    "timeout": 30000
  }
}
```

**GraphQL Query Optimization**:
```graphql
query GetSolanaTransfers($limit: Int!, $offset: Int!) {
  solana {
    transfers(
      limit: $limit
      offset: $offset
      options: {desc: "block.height"}
    ) {
      block {
        height
        timestamp {
          time
        }
      }
      transaction {
        signature
        index
      }
      sender {
        address
      }
      receiver {
        address
      }
      amount
      currency {
        symbol
        decimals
      }
    }
  }
}
```

## SPL Token Management

### Adding New SPL Tokens

1. **Identify Mint Address**: Get token mint address from Solana Explorer
2. **Check Token Info**: Verify token decimals and metadata
3. **Create Configuration**:
   ```json
   {
     "chain": "solana",
     "token": "newtoken",
     "mintAddress": "NewTokenMintAddress1111111111111111111111111111",
     "decimals": 9,
     "rpcUrl": "https://api.mainnet-beta.solana.com"
   }
   ```
4. **Deploy Workers**: Start processor and API workers for new token

### Popular SPL Token Configurations

**USDT (Tether)**:
```json
{
  "chain": "solana",
  "token": "usdt",
  "mintAddress": "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
  "decimals": 6
}
```

**RAY (Raydium)**:
```json
{
  "chain": "solana",
  "token": "ray",
  "mintAddress": "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
  "decimals": 6
}
```

**SRM (Serum)**:
```json
{
  "chain": "solana",
  "token": "srm",
  "mintAddress": "SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt",
  "decimals": 6
}
```

## Monitoring and Maintenance

### Key Metrics

```bash
# Check slot sync status
curl -X POST http://localhost:8083/rpc -d '{
  "method": "getBlockFromChain",
  "params": {"blockNumber": "latest"}
}'

# Monitor Bitquery API usage
tail -f logs/solana-indexer.log | grep -E "(bitquery|graphql|api)"

# SPL token processing status
curl -X POST http://localhost:8084/rpc -d '{
  "method": "queryTransactions",
  "params": {"fromBlock": "latest"}
}'
```

### Performance Monitoring

**Slot-Specific Metrics**:
- Slot processing speed vs. network slot time (~400ms)
- Empty slot detection and skipping efficiency
- Bitquery API response times and rate limits
- Memory usage during large slot processing

**Token-Specific Metrics**:
- SPL token transfer detection rate
- Associated token account resolution success
- Program instruction parsing accuracy
- Balance calculation consistency across accounts

## Troubleshooting

### Common Issues

**RPC Connection Problems**:
```bash
# Test Solana RPC connectivity
curl -X POST https://api.mainnet-beta.solana.com -H "Content-Type: application/json" -d '
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "getSlot"
}'
```

**Bitquery API Issues**:
```bash
# Test Bitquery connectivity
curl -X POST https://graphql.bitquery.io \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: YOUR_API_KEY" \
  -d '{"query": "{ solana { blocks(limit: 1) { height } } }"}'
```

**SPL Token Detection Problems**:
```bash
# Verify token mint address
curl -X POST https://api.mainnet-beta.solana.com -H "Content-Type: application/json" -d '
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "getAccountInfo",
  "params": ["EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"]
}'

# Check token program ownership
curl -X POST https://api.mainnet-beta.solana.com -H "Content-Type: application/json" -d '
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "getTokenAccountsByOwner",
  "params": [
    "OWNER_ADDRESS",
    {"mint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"},
    {"encoding": "jsonParsed"}
  ]
}'
```

### Debugging Commands

```bash
# Check current slot
curl -X POST $SOLANA_RPC_URL -d '{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "getSlot"
}'

# Verify account balance
curl -X POST $SOLANA_RPC_URL -d '{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "getBalance",
  "params": ["ACCOUNT_ADDRESS"]
}'

# Get transaction details
curl -X POST $SOLANA_RPC_URL -d '{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "getTransaction",
  "params": ["TRANSACTION_SIGNATURE", "jsonParsed"]
}'
```

## Security Considerations

### RPC Security

- **API Key Protection**: Secure RPC provider API keys
- **Rate Limiting**: Implement application-level rate limiting
- **Connection Encryption**: Always use HTTPS for RPC connections
- **Provider Redundancy**: Use multiple RPC providers for failover

### Bitquery Security

- **API Key Management**: Rotate Bitquery API keys regularly
- **Query Validation**: Validate GraphQL queries before execution
- **Rate Limit Monitoring**: Monitor Bitquery usage limits
- **Data Verification**: Cross-verify critical data with RPC sources

### Account Security

- **Address Validation**: Validate Solana address formats (Base58)
- **Program Verification**: Verify SPL token program addresses
- **Account Ownership**: Verify associated token account ownership
- **Transaction Verification**: Validate transaction signatures and success status

## Advanced Configuration

### Custom Program Processing

```javascript
// Custom SPL token processor
class CustomSPLProcessor extends SPLProcessor {
  constructor(config, ctx) {
    super(config, ctx);
    this.customProgramIds = [
      'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA', // SPL Token
      'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'  // Associated Token
    ];
  }

  async processCustomInstructions(instructions) {
    // Custom instruction processing logic
  }
}
```

### Multi-Cluster Configuration

```json
{
  "clusters": {
    "mainnet-beta": {
      "rpcUrl": "https://api.mainnet-beta.solana.com",
      "commitment": "confirmed"
    },
    "testnet": {
      "rpcUrl": "https://api.testnet.solana.com",
      "commitment": "confirmed"
    },
    "devnet": {
      "rpcUrl": "https://api.devnet.solana.com",
      "commitment": "processed"
    }
  }
}
```

### Bitquery Advanced Queries

```json
{
  "bitqueryQueries": {
    "transfers": "query GetTransfers($limit: Int!) { solana { transfers(limit: $limit) { ... } } }",
    "instructions": "query GetInstructions($limit: Int!) { solana { instructions(limit: $limit) { ... } } }",
    "accounts": "query GetAccounts($addresses: [String!]) { solana { accounts(addresses: $addresses) { ... } } }"
  }
}
```
