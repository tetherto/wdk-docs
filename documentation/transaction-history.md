---
title: Transaction History - Architecture & Integration
description: Complete guide for implementing robust transaction history in wallet applications using the WDK, covering blockchain models, indexer architecture, and best practices.
lastReviewed: 2024-01-15
---

# Transaction History: Architecture & Integration

## Overview

Transaction history is the backbone of any cryptocurrency wallet, providing users with a complete record of their asset movements across multiple blockchains. This guide explains how to implement reliable, scalable transaction history using the WDK Indexer infrastructure, covering everything from blockchain fundamentals to production deployment patterns.

## Table of Contents

1. [What Is "Transaction History"?](#what-is-transaction-history)
2. [Blockchain Models & Their Implications](#blockchain-models--their-implications)
3. [Raw Node vs. Indexer Approaches](#raw-node-vs-indexer-approaches)
4. [WDK Transaction-History Architecture](#wdk-transaction-history-architecture)
5. [Standardized History Record Schema](#standardized-history-record-schema)
6. [Query Patterns & Pagination](#query-patterns--pagination)
7. [Best-Practice Fallback Strategy](#best-practice-fallback-strategy)
8. [Chain-Specific Nuances](#chain-specific-nuances)
9. [Designing the UI/UX](#designing-the-uiux)
10. [Security & Privacy Considerations](#security--privacy-considerations)
11. [Performance Tips](#performance-tips)
12. [Configuration & Deployment Patterns](#configuration--deployment-patterns)
13. [Testing Strategies](#testing-strategies)
14. [Monitoring & Alerting](#monitoring--alerting)
15. [Troubleshooting](#troubleshooting)
16. [Migration Strategies](#migration-strategies)
17. [Cost Optimization](#cost-optimization)
18. [Compliance & Audit](#compliance--audit)
19. [Full End-to-End Example](#full-end-to-end-example)
20. [References](#references)

---

## What Is "Transaction History"?

**Transaction history is a chronological record of all asset movements for a user's addresses, providing transparency and auditability of their cryptocurrency holdings.**

Users expect their wallet to show:
- **Complete transaction list**: All incoming and outgoing transfers
- **Real-time updates**: New transactions appear immediately
- **Rich metadata**: Token names, logos, fiat values, transaction status
- **Smart grouping**: Related transfers grouped logically
- **Search and filtering**: Find specific transactions quickly

### Typical UX Expectations

```typescript
interface TransactionHistoryUI {
  // Core display elements
  transactions: Transaction[];
  pagination: PaginationInfo;
  filters: FilterOptions;
  
  // User experience features
  realTimeUpdates: boolean;
  pendingTransactions: Transaction[];
  fiatConversion: FiatRate[];
  tokenLogos: TokenMetadata[];
}
```

**Why This Matters**: Poor transaction history UX is one of the top reasons users abandon wallet applications. Getting this right builds trust and engagement.

## Blockchain Models & Their Implications

**Different blockchain architectures require different approaches to transaction history retrieval.**

| Blockchain Model | Examples | History Complexity | Key Considerations |
|------------------|----------|-------------------|-------------------|
| **UTXO** | Bitcoin, Litecoin | Medium | Multiple inputs/outputs per tx, change addresses |
| **Account-Based** | Ethereum, BSC, Polygon | High | Contract interactions, token transfers, gas fees |
| **Message-Based** | TON, Solana | Very High | Multiple instructions per tx, program interactions |
| **Hybrid** | TRON | High | Resource consumption, contract events, energy costs |

### UTXO Model (Bitcoin)

```javascript
// Bitcoin transaction structure
{
  "txid": "abc123...",
  "inputs": [
    {"address": "1ABC...", "amount": "0.5"},
    {"address": "1DEF...", "amount": "0.3"}
  ],
  "outputs": [
    {"address": "1GHI...", "amount": "0.7"},  // Recipient
    {"address": "1JKL...", "amount": "0.09"} // Change back to sender
  ]
}
```

**Challenge**: One transaction may represent multiple logical transfers, requiring intelligent parsing to show meaningful history.

### Account-Based Model (Ethereum)

```javascript
// Ethereum transaction with token transfer
{
  "hash": "0xdef456...",
  "from": "0xABC...",
  "to": "0xTokenContract...",  // Contract address
  "value": "0",               // No ETH transferred
  "logs": [
    {
      "topics": ["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"],
      "data": "0x...",         // Encoded transfer details
      "address": "0xTokenContract..."
    }
  ]
}
```

**Challenge**: Actual token transfers are embedded in event logs, not transaction values.

## Raw Node vs. Indexer Approaches

**Directly querying blockchain nodes becomes impractical as transaction volume and complexity increase.**

### Device-Side Scanning

**Pros:**
- Complete data control
- No third-party dependencies
- Real-time synchronization

**Cons:**
- High bandwidth requirements
- Significant storage needs
- Complex parsing logic required
- Battery drain on mobile devices

```javascript
// Naive approach - doesn't scale
async function scanBlocksForAddress(address, fromBlock, toBlock) {
  const transactions = [];
  for (let i = fromBlock; i <= toBlock; i++) {
    const block = await node.getBlock(i);
    for (const tx of block.transactions) {
      if (tx.involves(address)) {
        transactions.push(tx);
      }
    }
  }
  return transactions;
}
```

### Public Explorer APIs

**Pros:**
- No infrastructure required
- Quick to implement

**Cons:**
- Rate limits (often 5-10 requests/second)
- Terms of service restrictions
- No guaranteed SLA
- Privacy concerns
- Potential GDPR issues

### WDK Indexer Solution

**Pros:**
- Self-hosted infrastructure
- No rate limits
- Optimized for wallet use cases
- Unified API across chains
- Real-time updates
- Built-in caching and optimization

**Cons:**
- Requires infrastructure setup
- Storage and bandwidth costs
- Maintenance overhead

## WDK Transaction-History Architecture

**The WDK Indexer provides a scalable, multi-layer architecture for transaction history retrieval.**

```mermaid
graph TB
    subgraph "User Layer"
        WalletApp[Wallet Application]
        WebUI[Web Interface]
        MobileApp[Mobile App]
    end
    
    subgraph "API Gateway Layer"
        RestAPI[REST API Instance]
        Auth[Authentication Service]
        RateLimit[Rate Limiter]
        LoadBalancer[Load Balancer]
    end
    
    subgraph "Orchestration Layer"
        Ork1[Ork Worker 1]
        Ork2[Ork Worker 2]
        OrkN[Ork Worker N]
    end
    
    subgraph "Data Layer"
        DataShard1[Data Shard 1]
        DataShard2[Data Shard 2]
        DataShardN[Data Shard N]
        Cache[(User Cache)]
        IndexerAPI[Indexer API]
        BlockData[(Blockchain Data)]
    end
    
    subgraph "Blockchain Layer"
        Bitcoin[Bitcoin Node]
        Ethereum[Ethereum Node]
        Solana[Solana Node]
        TON[TON Node]
        TRON[TRON Node]
    end
    
    WalletApp --> LoadBalancer
    WebUI --> LoadBalancer
    MobileApp --> LoadBalancer
    
    LoadBalancer --> RestAPI
    RestAPI --> Auth
    RestAPI --> RateLimit
    RestAPI --> Ork1
    RestAPI --> Ork2
    RestAPI --> OrkN
    
    Ork1 --> DataShard1
    Ork2 --> DataShard2
    OrkN --> DataShardN
    
    DataShard1 --> Cache
    DataShard2 --> Cache
    DataShardN --> Cache
    
    DataShard1 --> IndexerAPI
    DataShard2 --> IndexerAPI
    DataShardN --> IndexerAPI
    
    IndexerAPI --> BlockData
    IndexerAPI --> Bitcoin
    IndexerAPI --> Ethereum
    IndexerAPI --> Solana
    IndexerAPI --> TON
    IndexerAPI --> TRON
```

### Core Components

#### 1. REST API Instances (`wdk-app-node`)
- **Role**: Frontend gateway and authentication
- **Functionality**:
  - Bearer token authentication
  - Request routing via CRC32 hashing
  - Local HyperBee caching for user identification
  - Rate limiting and request validation

#### 2. Ork Workers (`wdk-ork-wrk`)
- **Role**: Request orchestration and data aggregation
- **Functionality**:
  - Route requests to appropriate Data Shards
  - Aggregate data from multiple sources
  - Handle load balancing across shards

#### 3. Data Shards (`wdk-data-shard-wrk`)
- **Role**: User-specific data management
- **Components**:
  - **Proc Worker (Writer)**: Daily balance updates, transaction ingestion, cleanup
  - **API Worker (Reader)**: Query interface, real-time balance requests

#### 4. Indexer Workers (Chain-Specific)
- **Role**: Blockchain synchronization and querying
- **Components**:
  - **Proc Worker**: Block synchronization, transaction parsing, storage
  - **API Worker**: Balance queries, transaction lookup, real-time updates

### Data Flow

1. **User Request**: Wallet app requests transaction history via REST API
2. **Authentication**: Bearer token validation and user identification
3. **Routing**: Request routed to appropriate Ork worker based on user ID
4. **Data Aggregation**: Ork queries relevant Data Shards for user transactions
5. **Real-time Fallback**: If recent data missing, query Indexer workers directly
6. **Response Assembly**: Combine cached and real-time data into unified response

### Sequence Diagram: Transaction History Request Flow

```mermaid
sequenceDiagram
    participant App as Wallet App
    participant LB as Load Balancer
    participant API as REST API
    participant Auth as Auth Service
    participant Ork as Ork Worker
    participant Shard as Data Shard
    participant Indexer as Indexer Worker
    participant Cache as Cache Layer
    
    App->>LB: GET /v1/transactions?limit=50
    LB->>API: Route to available instance
    API->>Auth: Validate Bearer Token
    Auth-->>API: User ID + Permissions
    
    API->>Ork: Route via CRC32(userId)
    Ork->>Shard: Query user transactions
    
    alt Recent data available in cache
        Shard->>Cache: Check transaction cache
        Cache-->>Shard: Cached transactions
        Shard-->>Ork: Cached result
    else Cache miss - need fresh data
        Shard->>Indexer: Query blockchain data
        Indexer-->>Shard: Latest transactions
        Shard->>Cache: Update cache
        Shard-->>Ork: Fresh result
    end
    
    Ork-->>API: Aggregated response
    API-->>LB: JSON response
    LB-->>App: Transaction history + pagination
    
    Note over App,Cache: Response time: 50-200ms typical
```

## Standardized History Record Schema

**All transaction history responses follow a consistent schema regardless of underlying blockchain.**

```typescript
interface Transaction {
  // Core identification
  blockchain: string;           // "bitcoin", "ethereum", "solana", etc.
  transactionHash: string;      // Transaction ID/hash
  blockNumber: bigint;          // Block height
  transactionIndex?: number;    // Position within block
  logIndex?: number;           // For token transfers (EVM)
  
  // Transfer details
  direction: 'in' | 'out' | 'self';
  from?: string;               // Sender address
  to?: string;                 // Recipient address
  token: string;               // "btc", "eth", "usdt", etc.
  amount: string;              // Decimal amount as string
  
  // Metadata
  timestamp: string;           // ISO 8601 timestamp
  status: 'pending' | 'confirmed' | 'failed';
  confirmations: number;       // Network confirmations
  fee?: string;               // Transaction fee in native token
  
  // Optional enhanced data
  fiatValue?: string;         // USD value at time of transaction
  description?: string;       // User or system-generated description
  metadata?: {
    contractAddress?: string; // For token transfers
    gasUsed?: string;        // For EVM chains
    energyUsed?: string;     // For TRON
    memo?: string;           // For chains supporting memos
  };
}
```

### Example Response

```json
{
  "transactions": [
    {
      "blockchain": "ethereum",
      "transactionHash": "0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890",
      "blockNumber": 18500000,
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
      "fee": "0.002",
      "fiatValue": "1000.00",
      "metadata": {
        "contractAddress": "0xdac17f958d2ee523a2206206994597c13d831ec7",
        "gasUsed": "65000",
        "gasPrice": "30000000000"
      }
    }
  ],
  "pagination": {
    "hasNext": true,
    "cursor": "eyJibG9jayI6MTg1MDAwMDAsInR4SWR4Ijo0NX0=",
    "limit": 10,
    "total": 1247
  },
  "meta": {
    "responseTime": "120ms",
    "source": "indexer",
    "cacheHit": false
  }
}
```

## Query Patterns & Pagination

**Efficient querying and pagination are crucial for responsive transaction history.**

### Cursor-Based Pagination

```typescript
interface QueryParams {
  // Pagination
  cursor?: string;             // Base64-encoded position
  limit?: number;              // Max results (default: 50, max: 200)
  
  // Filtering
  addresses?: string[];        // Filter by specific addresses
  tokens?: string[];          // Filter by specific tokens
  direction?: 'in' | 'out';   // Filter by direction
  
  // Date range
  fromDate?: string;          // ISO 8601 start date
  toDate?: string;            // ISO 8601 end date
  
  // Amount range
  minAmount?: string;         // Minimum transaction amount
  maxAmount?: string;         // Maximum transaction amount
  
  // Status
  status?: ('pending' | 'confirmed' | 'failed')[];
}
```

### Example API Calls

```javascript
// Basic transaction history
const response = await fetch('/api/v1/transactions', {
  headers: { 'Authorization': 'Bearer TOKEN' }
});

// Filtered query
const filtered = await fetch('/api/v1/transactions?' + new URLSearchParams({
  tokens: 'usdt,usdc',
  direction: 'in',
  fromDate: '2024-01-01T00:00:00Z',
  limit: '100'
}));

// Next page
const nextPage = await fetch('/api/v1/transactions?' + new URLSearchParams({
  cursor: response.pagination.cursor,
  limit: '50'
}));
```

### Handling Blockchain Reorganizations

```javascript
// Monitor for chain reorgs
class TransactionMonitor {
  async handleReorg(reorgBlock) {
    // Invalidate transactions from reorged blocks
    const affectedTxs = await this.getTransactionsFromBlock(reorgBlock);
    
    // Mark as pending or remove
    for (const tx of affectedTxs) {
      if (tx.blockNumber >= reorgBlock) {
        tx.status = 'pending';
        tx.confirmations = 0;
      }
    }
    
    // Notify UI to refresh
    this.emit('reorg', { affectedTransactions: affectedTxs });
  }
}
```

## Best-Practice Fallback Strategy

**Implement a robust fallback hierarchy to ensure transaction history is always available.**

```javascript
class TransactionHistoryService {
  constructor() {
    this.indexerAPI = new IndexerAPI();
    this.directSDK = new WDKDirect();
    this.localStorage = new LocalCache();
  }

  async getTransactionHistory(userId, addresses, options = {}) {
    try {
      // 1. Primary: WDK Indexer (optimal performance)
      console.log('Trying WDK Indexer...');
      const result = await this.indexerAPI.getTransactions(userId, addresses, options);
      
      // Cache successful results
      await this.localStorage.cache(userId, result);
      return result;
      
    } catch (indexerError) {
      console.warn('Indexer failed:', indexerError.message);
      
      try {
        // 2. Secondary: Direct WDK methods (essential data only)
        console.log('Falling back to direct WDK...');
        const balances = await this.directSDK.getBalances(addresses);
        const recentTxs = await this.directSDK.getRecentTransactions(addresses, 10);
        
        return {
          transactions: recentTxs,
          balances: balances,
          source: 'direct',
          limited: true
        };
        
      } catch (directError) {
        console.warn('Direct WDK failed:', directError.message);
        
        // 3. Tertiary: Local cache (offline capability)
        console.log('Using local cache...');
        const cached = await this.localStorage.get(userId);
        
        return {
          ...cached,
          source: 'cache',
          stale: true,
          lastUpdated: cached?.timestamp
        };
      }
    }
  }

  async getBalance(address, token) {
    // Always try real-time balance first
    try {
      return await this.indexerAPI.getBalance(address, token);
    } catch (error) {
      return await this.directSDK.getBalance(address, token);
    }
  }
}
```

## Chain-Specific Nuances

### Bitcoin (UTXO Model)
**Challenge**: UTXO consolidation and change outputs require intelligent parsing.
```javascript
// Bitcoin: Identify change vs. recipient outputs
function parseUTXOTransaction(tx, userAddresses) {
  const userInputs = tx.inputs.filter(inp => userAddresses.includes(inp.address));
  const userOutputs = tx.outputs.filter(out => userAddresses.includes(out.address));
  
  // If user has inputs, outputs to user addresses are likely change
  const isUserSending = userInputs.length > 0;
  return tx.outputs.map(output => ({
    direction: isUserSending && userAddresses.includes(output.address) ? 'self' : 'out',
    amount: output.amount,
    isChange: isUserSending && userAddresses.includes(output.address)
  }));
}
```

### EVM Chains (Ethereum, BSC, Polygon)
**Challenge**: Token transfers are embedded in event logs, not transaction values.
```javascript
// EVM: Parse token transfers from event logs
function parseEVMTokenTransfer(tx) {
  const transferEvents = tx.logs.filter(log => 
    log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
  );
  
  return transferEvents.map(event => ({
    from: '0x' + event.topics[1].slice(26),
    to: '0x' + event.topics[2].slice(26),
    amount: BigInt('0x' + event.data).toString(),
    contractAddress: event.address
  }));
}
```

### Solana (Program-Based)
**Challenge**: Multiple instructions per transaction with complex program interactions.
```javascript
// Solana: Parse SPL token transfers from instruction data
function parseSolanaTransaction(tx) {
  const tokenInstructions = tx.instructions.filter(ix => 
    ix.programId === 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
  );
  
  return tokenInstructions.map(ix => {
    const instruction = parseTokenInstruction(ix.data);
    return {
      type: instruction.type, // 'transfer', 'mint', 'burn'
      source: ix.accounts[0],
      destination: ix.accounts[1],
      amount: instruction.amount
    };
  });
}
```

### TON (Message-Based)
**Challenge**: Transaction completion requires tracking message chains across blocks.
```javascript
// TON: Follow message chain for complete transaction picture
async function getTONTransactionComplete(txHash) {
  const tx = await tonClient.getTransaction(txHash);
  const messages = [];
  
  // Follow outgoing messages
  for (const outMsg of tx.outMessages) {
    const childTx = await tonClient.getTransactionByMessage(outMsg.hash);
    if (childTx) {
      messages.push(...await getTONTransactionComplete(childTx.hash));
    }
  }
  
  return [tx, ...messages];
}
```

### TRON (Resource-Based)
**Challenge**: Energy and bandwidth consumption affects transaction costs and success.
```javascript
// TRON: Include resource consumption in transaction details
function parseTRONTransaction(tx) {
  return {
    hash: tx.txID,
    energyUsed: tx.ret[0]?.energy_usage || 0,
    bandwidthUsed: tx.ret[0]?.bandwidth_usage || 0,
    energyFee: tx.ret[0]?.energy_fee || 0,
    success: tx.ret[0]?.contractRet === 'SUCCESS'
  };
}
```

## Designing the UI/UX

**Effective transaction history UI requires careful consideration of user mental models and blockchain complexity.**

### Transaction Status Indicators

```jsx
function TransactionStatus({ transaction }) {
  const getStatusConfig = (tx) => {
    if (tx.status === 'pending') {
      return {
        color: 'orange',
        icon: 'clock',
        text: `Pending (${tx.confirmations}/${tx.requiredConfirmations})`
      };
    }
    if (tx.status === 'confirmed') {
      return {
        color: 'green', 
        icon: 'check',
        text: `Confirmed (${tx.confirmations})`
      };
    }
    return {
      color: 'red',
      icon: 'x',
      text: 'Failed'
    };
  };

  const config = getStatusConfig(transaction);
  
  return (
    <div className={`status status-${config.color}`}>
      <Icon name={config.icon} />
      <span>{config.text}</span>
    </div>
  );
}
```

### Grouping Related Transfers

```jsx
function TransactionGroup({ transactions }) {
  // Group transactions by hash (for multiple token transfers in one tx)
  const grouped = transactions.reduce((groups, tx) => {
    groups[tx.transactionHash] = groups[tx.transactionHash] || [];
    groups[tx.transactionHash].push(tx);
    return groups;
  }, {});

  return (
    <div className="transaction-groups">
      {Object.entries(grouped).map(([hash, txs]) => (
        <div key={hash} className="transaction-group">
          <div className="group-header">
            <span className="timestamp">{txs[0].timestamp}</span>
            <span className="hash">{hash.slice(0, 8)}...</span>
          </div>
          
          {txs.map((tx, i) => (
            <TransactionItem key={i} transaction={tx} />
          ))}
        </div>
      ))}
    </div>
  );
}
```

### Infinite Scroll Implementation

```jsx
function useTransactionHistory(userId) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const response = await api.getTransactions({
        cursor,
        limit: 50
      });
      
      setTransactions(prev => [...prev, ...response.transactions]);
      setCursor(response.pagination.cursor);
      setHasMore(response.pagination.hasNext);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  }, [cursor, loading, hasMore]);

  return { transactions, loading, hasMore, loadMore };
}
```

## Security & Privacy Considerations

### Personally Identifiable Information (PII)

**Never store or log sensitive user data in transaction history systems.**

```javascript
// Good: Hash addresses for analytics
const analyticsId = crypto.createHash('sha256')
  .update(userAddress + ANALYTICS_SALT)
  .digest('hex')
  .slice(0, 16);

// Bad: Direct address logging
console.log('User transaction:', userAddress, amount); // ❌ Privacy violation
```

### Rate Limiting & DoS Protection

```javascript
class RateLimiter {
  constructor() {
    this.requests = new Map(); // userId -> request timestamps
  }

  async checkLimit(userId, maxRequests = 100, windowMs = 60000) {
    const now = Date.now();
    const userRequests = this.requests.get(userId) || [];
    
    // Remove old requests outside window
    const recentRequests = userRequests.filter(time => now - time < windowMs);
    
    if (recentRequests.length >= maxRequests) {
      throw new Error('Rate limit exceeded');
    }
    
    recentRequests.push(now);
    this.requests.set(userId, recentRequests);
  }
}
```

### Avoiding Address Leakage

```javascript
// Bitcoin: Don't expose unused change addresses
function filterUserRelevantOutputs(transaction, knownAddresses) {
  return transaction.outputs.filter(output => {
    // Only show outputs to known user addresses
    return knownAddresses.includes(output.address);
  });
}

// EVM: Validate address ownership before returning history
async function validateAddressOwnership(userId, address) {
  const signature = await requestSignature(address, `Verify ownership: ${userId}`);
  return verifySignature(signature, address);
}
```

## Performance Tips

### Caching Hot Addresses

```javascript
class AddressCache {
  constructor() {
    this.cache = new Map();
    this.ttl = 5 * 60 * 1000; // 5 minutes
  }

  async getBalance(address, token) {
    const key = `${address}:${token}`;
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < this.ttl) {
      return cached.balance;
    }
    
    const balance = await this.indexer.getBalance(address, token);
    this.cache.set(key, {
      balance,
      timestamp: Date.now()
    });
    
    return balance;
  }
}
```

### Batching API Calls

```javascript
class BatchProcessor {
  constructor() {
    this.pending = [];
    this.batchSize = 50;
    this.batchDelay = 100; // ms
  }

  async getBalances(addresses) {
    return new Promise((resolve, reject) => {
      this.pending.push({ addresses, resolve, reject });
      
      // Debounce batch processing
      clearTimeout(this.batchTimeout);
      this.batchTimeout = setTimeout(() => this.processBatch(), this.batchDelay);
    });
  }

  async processBatch() {
    if (this.pending.length === 0) return;
    
    const batch = this.pending.splice(0, this.batchSize);
    const allAddresses = batch.flatMap(req => req.addresses);
    
    try {
      const results = await this.indexer.getBalancesBatch(allAddresses);
      batch.forEach(req => req.resolve(results));
    } catch (error) {
      batch.forEach(req => req.reject(error));
    }
  }
}
```

### WebSocket Real-Time Updates

```javascript
class RealTimeUpdates {
  constructor(apiUrl) {
    this.ws = new WebSocket(`wss://${apiUrl}/transactions/live`);
    this.subscribers = new Map();
  }

  subscribe(addresses, callback) {
    const id = Math.random().toString(36);
    this.subscribers.set(id, { addresses: new Set(addresses), callback });
    
    // Send subscription message
    this.ws.send(JSON.stringify({
      type: 'subscribe',
      addresses,
      id
    }));
    
    return () => this.unsubscribe(id);
  }

  handleMessage(event) {
    const data = JSON.parse(event.data);
    if (data.type === 'transaction') {
      // Notify relevant subscribers
      for (const [id, sub] of this.subscribers) {
        if (sub.addresses.has(data.transaction.from) || 
            sub.addresses.has(data.transaction.to)) {
          sub.callback(data.transaction);
        }
      }
    }
  }
 }
 ```

## Configuration & Deployment Patterns

**Production-ready deployment configurations for different scale and reliability requirements.**

### High-Availability Multi-Chain Setup

```yaml
# docker-compose.production.yml
version: '3.8'

services:
  # Load Balancer
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl
    depends_on:
      - api-1
      - api-2
      - api-3

  # Multiple API instances
  api-1:
    image: wdk-api:latest
    environment:
      - NODE_ENV=production
      - REDIS_URL=redis://redis-cluster:6379
      - DB_SHARDS=shard-1:6000,shard-2:6001,shard-3:6002
      - JWT_SECRET=${JWT_SECRET}
      - RATE_LIMIT_MAX=1000
      - RATE_LIMIT_WINDOW=60000
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '1.0'
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  api-2:
    image: wdk-api:latest
    environment:
      - NODE_ENV=production
      - REDIS_URL=redis://redis-cluster:6379
      - DB_SHARDS=shard-1:6000,shard-2:6001,shard-3:6002
      - JWT_SECRET=${JWT_SECRET}
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '1.0'
    restart: unless-stopped

  api-3:
    image: wdk-api:latest
    environment:
      - NODE_ENV=production
      - REDIS_URL=redis://redis-cluster:6379
      - DB_SHARDS=shard-1:6000,shard-2:6001,shard-3:6002
      - JWT_SECRET=${JWT_SECRET}
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '1.0'
    restart: unless-stopped

  # Redis Cluster for caching
  redis-cluster:
    image: redis:7-alpine
    command: redis-server --appendonly yes --cluster-enabled yes
    volumes:
      - redis-data:/data
    deploy:
      resources:
        limits:
          memory: 4G
    restart: unless-stopped

  # Chain-specific indexer workers
  btc-processor:
    image: wdk-indexer:btc
    environment:
      - NODE_ENV=production
      - CHAIN=bitcoin
      - BTC_RPC_URL=${BTC_RPC_URL}
      - BTC_RPC_USER=${BTC_RPC_USER}
      - BTC_RPC_PASS=${BTC_RPC_PASS}
      - SYNC_FROM_BLOCK=800000
      - BLOCK_TIME=600000
      - MAX_REORG_DEPTH=6
    volumes:
      - btc-data:/app/data
    deploy:
      resources:
        limits:
          memory: 8G
          cpus: '2.0'
    restart: unless-stopped

  btc-api:
    image: wdk-indexer:btc
    environment:
      - NODE_ENV=production
      - WORKER_TYPE=api
      - CHAIN=bitcoin
      - PROCESSOR_RPC=${BTC_PROCESSOR_RPC}
    ports:
      - "8081:8080"
    depends_on:
      - btc-processor
    restart: unless-stopped

  eth-processor:
    image: wdk-indexer:evm
    environment:
      - NODE_ENV=production
      - CHAIN=ethereum
      - ETH_RPC_URL=${ETH_RPC_URL}
      - ETH_WS_URL=${ETH_WS_URL}
      - SYNC_FROM_BLOCK=18000000
      - BLOCK_TIME=12000
      - MAX_REORG_DEPTH=12
      - GAS_OPTIMIZATION=true
    volumes:
      - eth-data:/app/data
    deploy:
      resources:
        limits:
          memory: 16G
          cpus: '4.0'
    restart: unless-stopped

  eth-api:
    image: wdk-indexer:evm
    environment:
      - NODE_ENV=production
      - WORKER_TYPE=api
      - CHAIN=ethereum
      - PROCESSOR_RPC=${ETH_PROCESSOR_RPC}
    ports:
      - "8082:8080"
    depends_on:
      - eth-processor
    restart: unless-stopped

  # USDT ERC-20 specific indexer
  usdt-processor:
    image: wdk-indexer:erc20
    environment:
      - NODE_ENV=production
      - CHAIN=ethereum
      - TOKEN=usdt
      - CONTRACT_ADDRESS=0xdac17f958d2ee523a2206206994597c13d831ec7
      - ETH_RPC_URL=${ETH_RPC_URL}
      - SYNC_FROM_BLOCK=4634748
    volumes:
      - usdt-data:/app/data
    deploy:
      resources:
        limits:
          memory: 12G
          cpus: '3.0'
    restart: unless-stopped

  usdt-api:
    image: wdk-indexer:erc20
    environment:
      - NODE_ENV=production
      - WORKER_TYPE=api
      - CHAIN=ethereum
      - TOKEN=usdt
      - PROCESSOR_RPC=${USDT_PROCESSOR_RPC}
    ports:
      - "8083:8080"
    depends_on:
      - usdt-processor
    restart: unless-stopped

  # Solana indexer
  sol-processor:
    image: wdk-indexer:solana
    environment:
      - NODE_ENV=production
      - CHAIN=solana
      - SOL_RPC_URL=${SOL_RPC_URL}
      - BITQUERY_API_KEY=${BITQUERY_API_KEY}
      - SYNC_FROM_SLOT=200000000
      - SLOT_TIME=400
    volumes:
      - sol-data:/app/data
    deploy:
      resources:
        limits:
          memory: 20G
          cpus: '4.0'
    restart: unless-stopped

  sol-api:
    image: wdk-indexer:solana
    environment:
      - NODE_ENV=production
      - WORKER_TYPE=api
      - CHAIN=solana
      - PROCESSOR_RPC=${SOL_PROCESSOR_RPC}
    ports:
      - "8084:8080"
    depends_on:
      - sol-processor
    restart: unless-stopped

  # Monitoring stack
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    ports:
      - "9090:9090"
    restart: unless-stopped

  grafana:
    image: grafana/grafana
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
    volumes:
      - grafana-data:/var/lib/grafana
      - ./grafana/dashboards:/etc/grafana/provisioning/dashboards
    ports:
      - "3000:3000"
    restart: unless-stopped

volumes:
  redis-data:
  btc-data:
  eth-data:
  usdt-data:
  sol-data:
  prometheus-data:
  grafana-data:

networks:
  default:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

### Environment Configuration

```bash
# .env.production
# Database Configuration
POSTGRES_URL=postgresql://user:pass@db-cluster:5432/wdk_transactions
REDIS_URL=redis://redis-cluster:6379

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRATION=7d

# Rate Limiting
RATE_LIMIT_MAX=1000
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_SKIP_SUCCESSFUL=true

# Blockchain RPC Endpoints
BTC_RPC_URL=http://bitcoin-core:8332
BTC_RPC_USER=your-btc-rpc-user
BTC_RPC_PASS=your-btc-rpc-password

ETH_RPC_URL=https://mainnet.infura.io/v3/your-project-id
ETH_WS_URL=wss://mainnet.infura.io/ws/v3/your-project-id

SOL_RPC_URL=https://api.mainnet-beta.solana.com
BITQUERY_API_KEY=your-bitquery-api-key

# Monitoring
GRAFANA_PASSWORD=your-grafana-password
PROMETHEUS_RETENTION=30d

# Indexer Configuration
BTC_PROCESSOR_RPC=tcp://btc-processor:6000
ETH_PROCESSOR_RPC=tcp://eth-processor:6001
USDT_PROCESSOR_RPC=tcp://usdt-processor:6002
SOL_PROCESSOR_RPC=tcp://sol-processor:6003

# Performance Tuning
WORKER_CONCURRENCY=4
MAX_CONCURRENT_REQUESTS=100
CACHE_TTL=300
DB_POOL_SIZE=20
```

### Kubernetes Deployment

```yaml
# kubernetes/transaction-history-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: wdk-transaction-history
  labels:
    app: wdk-transaction-history
spec:
  replicas: 3
  selector:
    matchLabels:
      app: wdk-transaction-history
  template:
    metadata:
      labels:
        app: wdk-transaction-history
    spec:
      containers:
      - name: api
        image: wdk-api:latest
        ports:
        - containerPort: 8080
        env:
        - name: NODE_ENV
          value: "production"
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: wdk-secrets
              key: redis-url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: wdk-secrets
              key: jwt-secret
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: wdk-transaction-history-service
spec:
  selector:
    app: wdk-transaction-history
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8080
  type: LoadBalancer

---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: wdk-transaction-history-ingress
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/rate-limit: "100"
spec:
  tls:
  - hosts:
    - api.wallet.com
    secretName: wdk-tls
  rules:
  - host: api.wallet.com
    http:
      paths:
      - path: /v1/transactions
        pathType: Prefix
        backend:
          service:
            name: wdk-transaction-history-service
            port:
              number: 80
```

## Testing Strategies

**Comprehensive testing approach for transaction history systems covering unit, integration, load, and chaos testing.**

### Unit Testing Examples

```javascript
// Transaction parser unit tests
describe('TransactionParser', () => {
  describe('Bitcoin UTXO parsing', () => {
    test('should correctly identify change outputs', () => {
      const transaction = {
        txid: 'abc123',
        inputs: [
          { address: '1UserAddr1', amount: '1.0' },
          { address: '1UserAddr2', amount: '0.5' }
        ],
        outputs: [
          { address: '1RecipientAddr', amount: '1.2' },
          { address: '1UserAddr1', amount: '0.29' } // Change
        ]
      };
      
      const userAddresses = ['1UserAddr1', '1UserAddr2'];
      const parsed = parseUTXOTransaction(transaction, userAddresses);
      
      expect(parsed.outputs[0].direction).toBe('out');
      expect(parsed.outputs[1].direction).toBe('self');
      expect(parsed.outputs[1].isChange).toBe(true);
    });
  });

  describe('EVM token transfer parsing', () => {
    test('should extract token transfers from event logs', () => {
      const transaction = {
        hash: '0xdef456',
        logs: [
          {
            topics: [
              '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
              '0x000000000000000000000000742d35cc6266c0c7e4c4b5c7f2b8e6f5f8c3e1a2',
              '0x000000000000000000000000a0b86a33e6b8c66e29e8bb8a87e8e76e6d6e5e6f'
            ],
            data: '0x00000000000000000000000000000000000000000000d3c21bcecceda1000000',
            address: '0xdac17f958d2ee523a2206206994597c13d831ec7'
          }
        ]
      };
      
      const transfers = parseEVMTokenTransfer(transaction);
      
      expect(transfers).toHaveLength(1);
      expect(transfers[0].from).toBe('0x742d35cc6266c0c7e4c4b5c7f2b8e6f5f8c3e1a2');
      expect(transfers[0].to).toBe('0xa0b86a33e6b8c66e29e8bb8a87e8e76e6d6e5e6f');
      expect(transfers[0].amount).toBe('1000000000000000000000000');
    });
  });
});

// API endpoint unit tests
describe('Transaction History API', () => {
  let app;
  let mockIndexer;

  beforeEach(() => {
    mockIndexer = {
      getTransactions: jest.fn(),
      getBalance: jest.fn()
    };
    app = createTestApp({ indexer: mockIndexer });
  });

  test('should return paginated transactions', async () => {
    const mockTransactions = [
      {
        blockchain: 'ethereum',
        transactionHash: '0x123',
        amount: '100.0',
        token: 'usdt'
      }
    ];
    
    mockIndexer.getTransactions.mockResolvedValue({
      transactions: mockTransactions,
      pagination: { hasNext: true, cursor: 'abc123' }
    });

    const response = await request(app)
      .get('/v1/transactions')
      .set('Authorization', 'Bearer valid-token')
      .expect(200);

    expect(response.body.transactions).toEqual(mockTransactions);
    expect(response.body.pagination.hasNext).toBe(true);
  });

  test('should handle rate limiting', async () => {
    // Make requests up to limit
    for (let i = 0; i < 100; i++) {
      await request(app)
        .get('/v1/transactions')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);
    }

    // Next request should be rate limited
    await request(app)
      .get('/v1/transactions')
      .set('Authorization', 'Bearer valid-token')
      .expect(429);
  });
});
```

### Integration Testing

```javascript
// Integration tests with real database
describe('Transaction History Integration', () => {
  let testDb;
  let indexerService;

  beforeAll(async () => {
    testDb = await createTestDatabase();
    indexerService = new TransactionHistoryService({
      database: testDb,
      redis: createTestRedis()
    });
  });

  afterAll(async () => {
    await testDb.close();
  });

  test('should handle pagination correctly across multiple chains', async () => {
    // Insert test data
    await testDb.insertTransactions([
      { blockchain: 'bitcoin', blockNumber: 100, transactionHash: 'btc1' },
      { blockchain: 'ethereum', blockNumber: 200, transactionHash: 'eth1' },
      { blockchain: 'bitcoin', blockNumber: 101, transactionHash: 'btc2' },
      { blockchain: 'ethereum', blockNumber: 201, transactionHash: 'eth2' }
    ]);

    const firstPage = await indexerService.getTransactions(
      'user123',
      ['1BTC...', '0xETH...'],
      { limit: 2 }
    );
    
    const secondPage = await indexerService.getTransactions(
      'user123', 
      ['1BTC...', '0xETH...'],
      { cursor: firstPage.pagination.cursor, limit: 2 }
    );

    // Verify no duplicates
    const firstPageHashes = firstPage.transactions.map(tx => tx.transactionHash);
    const secondPageHashes = secondPage.transactions.map(tx => tx.transactionHash);
    const overlap = firstPageHashes.filter(hash => secondPageHashes.includes(hash));
    
    expect(overlap).toHaveLength(0);
    expect(firstPage.transactions).toHaveLength(2);
    expect(secondPage.transactions).toHaveLength(2);
  });

  test('should handle blockchain reorgs gracefully', async () => {
    // Insert confirmed transactions
    await testDb.insertTransactions([
      { 
        blockchain: 'ethereum', 
        blockNumber: 12345, 
        transactionHash: '0x123',
        status: 'confirmed',
        confirmations: 10
      },
      { 
        blockchain: 'ethereum', 
        blockNumber: 12346, 
        transactionHash: '0x456',
        status: 'confirmed',
        confirmations: 9
      }
    ]);

    // Simulate reorg at block 12345
    await indexerService.handleReorg('ethereum', 12345);

    const transactions = await indexerService.getTransactions(
      'user123',
      ['0xETH...']
    );
    
    const affectedTxs = transactions.transactions.filter(
      tx => tx.blockNumber >= 12345
    );

    // All affected transactions should be marked as pending or failed
    affectedTxs.forEach(tx => {
      expect(['pending', 'failed']).toContain(tx.status);
      expect(tx.confirmations).toBe(0);
    });
  });

  test('should fallback correctly when indexer is unavailable', async () => {
    // Mock indexer failure
    const mockIndexer = jest.fn().mockRejectedValue(new Error('Indexer offline'));
    const mockDirectSDK = jest.fn().mockResolvedValue({
      transactions: [{ hash: '0x789', amount: '50.0' }],
      source: 'direct'
    });

    const service = new TransactionHistoryService({
      indexer: mockIndexer,
      directSDK: mockDirectSDK,
      cache: testDb
    });

    const result = await service.getTransactionHistory('user123', ['0xETH...']);
    
    expect(result.source).toBe('direct');
    expect(result.limited).toBe(true);
    expect(mockDirectSDK).toHaveBeenCalled();
  });
});
```

### Load Testing with Artillery

```javascript
// artillery-load-test.yml
config:
  target: 'https://api.wallet.com'
  phases:
    # Warm up phase
    - duration: 60
      arrivalRate: 5
      name: "Warm up"
    
    # Ramp up phase  
    - duration: 300
      arrivalRate: 10
      rampTo: 50
      name: "Ramp up load"
    
    # Sustained load phase
    - duration: 600
      arrivalRate: 50
      name: "Sustained load"
    
    # Peak load phase
    - duration: 180
      arrivalRate: 50
      rampTo: 200
      name: "Peak load"
    
    # Cool down phase
    - duration: 120
      arrivalRate: 200
      rampTo: 10
      name: "Cool down"

  plugins:
    metrics-by-endpoint: {}
    
  variables:
    userTokens:
      - "eyJhbGciOiJIUzI1NiIs..."
      - "eyJhbGciOiJIUzI1NiJt..."
      - "eyJhbGciOiJIUzI1NiXY..."

scenarios:
  - name: "Transaction History Load Test"
    weight: 70
    requests:
      - get:
          url: "/v1/transactions"
          headers:
            Authorization: "Bearer {{ userTokens }}"
          qs:
            limit: "{{ $randomInt(10, 100) }}"
            tokens: "{{ $pick(['eth', 'usdt', 'btc', 'usdc']) }}"
          capture:
            - json: "$.pagination.cursor"
              as: "cursor"
      
      # Follow up with next page
      - get:
          url: "/v1/transactions"
          headers:
            Authorization: "Bearer {{ userTokens }}"
          qs:
            cursor: "{{ cursor }}"
            limit: "50"
          ifTrue: "{{ cursor }}"

  - name: "Balance Check Load Test"  
    weight: 30
    requests:
      - get:
          url: "/v1/balance"
          headers:
            Authorization: "Bearer {{ userTokens }}"
          qs:
            address: "{{ $randomString() }}"
            token: "{{ $pick(['eth', 'usdt', 'btc']) }}"

  - name: "Real-time Updates WebSocket"
    weight: 20
    engine: ws
    requests:
      - send: 
          payload: |
            {
              "type": "subscribe",
              "addresses": ["0x742d35cc...", "0xa0b86a33..."],
              "tokens": ["eth", "usdt"]
            }
      - think: 30
      - send:
          payload: |
            {
              "type": "unsubscribe"
            }
```

### Chaos Engineering Tests

```javascript
// chaos-testing.js
const { ChaosToolkit } = require('@chaostoolkit/chaostoolkit');

class TransactionHistoryChaosTests {
  constructor(config) {
    this.config = config;
    this.chaos = new ChaosToolkit(config);
  }

  async testIndexerFailure() {
    console.log('🔥 Testing indexer failure scenarios...');
    
    // Kill random indexer workers
    await this.chaos.killRandomPods({
      labelSelector: 'app=wdk-indexer',
      percentage: 30
    });

    // Verify API still responds (should fallback)
    const response = await this.makeAPIRequest('/v1/transactions');
    expect(response.status).toBe(200);
    expect(response.data.source).toBeOneOf(['direct', 'cache']);
  }

  async testDatabasePartition() {
    console.log('🔥 Testing database network partition...');
    
    // Introduce network latency to database
    await this.chaos.introduceNetworkLatency({
      target: 'postgres',
      latency: '2000ms',
      duration: '2m'
    });

    // API should timeout gracefully
    const start = Date.now();
    const response = await this.makeAPIRequest('/v1/transactions');
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(5000); // 5s timeout
    expect(response.status).toBeOneOf([200, 503]);
  }

  async testMemoryExhaustion() {
    console.log('🔥 Testing memory exhaustion...');
    
    // Fill up memory on API instances
    await this.chaos.consumeMemory({
      target: 'wdk-api',
      percentage: 90,
      duration: '5m'
    });

    // Kubernetes should restart pods
    await this.waitForPodRecovery('wdk-api', '2m');
    
    // Service should recover
    const response = await this.makeAPIRequest('/v1/health');
    expect(response.status).toBe(200);
  }

  async testHighTrafficSpike() {
    console.log('🔥 Testing traffic spike handling...');
    
    // Generate 10x normal traffic
    const promises = [];
    for (let i = 0; i < 1000; i++) {
      promises.push(this.makeAPIRequest('/v1/transactions'));
    }
    
    const responses = await Promise.allSettled(promises);
    const successful = responses.filter(r => r.status === 'fulfilled').length;
    const rateLimited = responses.filter(
      r => r.status === 'fulfilled' && r.value.status === 429
    ).length;
    
    // Should handle gracefully with rate limiting
    expect(successful + rateLimited).toBe(1000);
    expect(rateLimited).toBeGreaterThan(500); // Rate limiting kicked in
  }

  async makeAPIRequest(endpoint) {
    return fetch(`${this.config.apiBaseUrl}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${this.config.testToken}`
      }
    });
  }
}

// Run chaos tests
async function runChaosTests() {
  const chaos = new TransactionHistoryChaosTests({
    apiBaseUrl: 'https://api.wallet.com',
    testToken: process.env.TEST_TOKEN
  });

  await chaos.testIndexerFailure();
  await chaos.testDatabasePartition();
  await chaos.testMemoryExhaustion();
  await chaos.testHighTrafficSpike();
  
  console.log('✅ All chaos tests completed');
}
```

### Performance Benchmarking

```javascript
// benchmark.js
const autocannon = require('autocannon');

async function benchmarkTransactionHistory() {
  console.log('🚀 Running transaction history benchmarks...');

  // Basic transaction history endpoint
  const result1 = await autocannon({
    url: 'https://api.wallet.com/v1/transactions',
    connections: 50,
    duration: 60,
    headers: {
      'Authorization': 'Bearer test-token'
    },
    requests: [
      {
        method: 'GET',
        path: '/v1/transactions?limit=50'
      }
    ]
  });

  console.log('Basic transaction history:');
  console.log(`Requests/sec: ${result1.requests.average}`);
  console.log(`Latency P95: ${result1.latency.p95}ms`);
  console.log(`Latency P99: ${result1.latency.p99}ms`);

  // Filtered queries benchmark
  const result2 = await autocannon({
    url: 'https://api.wallet.com/v1/transactions',
    connections: 30,
    duration: 60,
    headers: {
      'Authorization': 'Bearer test-token'
    },
    requests: [
      {
        method: 'GET',
        path: '/v1/transactions?tokens=usdt,usdc&direction=in&limit=100'
      }
    ]
  });

  console.log('Filtered queries:');
  console.log(`Requests/sec: ${result2.requests.average}`);
  console.log(`Latency P95: ${result2.latency.p95}ms`);

  // Performance assertions
  if (result1.requests.average < 100) {
    throw new Error('Basic endpoint performance below threshold');
  }
  
  if (result1.latency.p95 > 500) {
    throw new Error('P95 latency above 500ms threshold');
  }
}

 benchmarkTransactionHistory().catch(console.error);
 ```

## Monitoring & Alerting

**Comprehensive monitoring strategy to ensure transaction history service reliability and performance.**

### Key Metrics to Monitor

```typescript
interface MonitoringMetrics {
  // Performance metrics
  apiResponseTime: {
    p50: number;      // Median response time
    p95: number;      // 95th percentile
    p99: number;      // 99th percentile
    max: number;      // Maximum response time
  };
  
  // Throughput metrics
  requestsPerSecond: number;
  transactionsProcessed: number;
  
  // Error metrics
  errorRate: number;            // Percentage of failed requests
  indexerLag: {
    bitcoin: number;            // Blocks behind chain tip
    ethereum: number;
    solana: number;
    ton: number;
    tron: number;
  };
  
  // Resource metrics
  cpuUsage: number;            // CPU utilization percentage
  memoryUsage: number;         // Memory usage percentage
  diskUsage: number;           // Disk usage percentage
  
  // Business metrics
  activeUsers: number;         // Users querying history
  cacheHitRatio: number;       // Cache effectiveness (0-1)
  fallbackRate: number;        // Percentage using fallback methods
}
```

### Prometheus Configuration

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "transaction_history_alerts.yml"

scrape_configs:
  - job_name: 'wdk-api'
    static_configs:
      - targets: ['api-1:8080', 'api-2:8080', 'api-3:8080']
    metrics_path: '/metrics'
    scrape_interval: 10s

  - job_name: 'wdk-indexers'
    static_configs:
      - targets: 
          - 'btc-indexer:8080'
          - 'eth-indexer:8080'
          - 'sol-indexer:8080'
          - 'ton-indexer:8080'
          - 'tron-indexer:8080'
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres:5432']

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093
```

### Alert Rules

```yaml
# transaction_history_alerts.yml
groups:
  - name: transaction_history
    rules:
      # High error rate alert
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High error rate in transaction history API"
          description: "Error rate is {{ $value }} errors per second"

      # High response time alert
      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 0.5
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time in transaction history API"
          description: "95th percentile response time is {{ $value }}s"

      # Indexer lag alert
      - alert: IndexerLag
        expr: indexer_blocks_behind > 10
        for: 1m
        labels:
          severity: warning
        annotations:
          summary: "Indexer {{ $labels.chain }} is lagging behind"
          description: "Indexer is {{ $value }} blocks behind chain tip"

      # Cache hit ratio too low
      - alert: LowCacheHitRatio
        expr: cache_hit_ratio < 0.8
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Low cache hit ratio"
          description: "Cache hit ratio is {{ $value }}"

      # Memory usage too high
      - alert: HighMemoryUsage
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes > 0.9
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High memory usage"
          description: "Memory usage is {{ $value }}%"
```

### Application Metrics Collection

```javascript
// metrics.js - Application metrics collection
const prometheus = require('prom-client');

// Create metric instances
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.2, 0.5, 1, 2, 5]
});

const httpRequestsTotal = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});

const transactionsProcessed = new prometheus.Counter({
  name: 'transactions_processed_total',
  help: 'Total number of transactions processed',
  labelNames: ['blockchain', 'token']
});

const indexerBlocksLag = new prometheus.Gauge({
  name: 'indexer_blocks_behind',
  help: 'Number of blocks the indexer is behind chain tip',
  labelNames: ['chain']
});

const cacheHitRatio = new prometheus.Gauge({
  name: 'cache_hit_ratio',
  help: 'Cache hit ratio (0-1)'
});

const activeUsers = new prometheus.Gauge({
  name: 'active_users_total',
  help: 'Number of active users'
});

// Middleware to collect HTTP metrics
function metricsMiddleware(req, res, next) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;
    
    httpRequestDuration
      .labels(req.method, route, res.statusCode)
      .observe(duration);
    
    httpRequestsTotal
      .labels(req.method, route, res.statusCode)
      .inc();
  });
  
  next();
}

// Business metrics tracking
class TransactionMetrics {
  static recordTransaction(blockchain, token) {
    transactionsProcessed.labels(blockchain, token).inc();
  }
  
  static updateIndexerLag(chain, blocksLag) {
    indexerBlocksLag.labels(chain).set(blocksLag);
  }
  
  static updateCacheHitRatio(ratio) {
    cacheHitRatio.set(ratio);
  }
  
  static updateActiveUsers(count) {
    activeUsers.set(count);
  }
}

module.exports = {
  metricsMiddleware,
  TransactionMetrics,
  register: prometheus.register
};
```

### Grafana Dashboard Configuration

```json
{
  "dashboard": {
    "title": "WDK Transaction History",
    "panels": [
      {
        "title": "API Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{route}}"
          }
        ]
      },
      {
        "title": "Response Time Percentiles",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.50, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "P50"
          },
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "P95"
          },
          {
            "expr": "histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "P99"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "singlestat",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m]) / rate(http_requests_total[5m])",
            "format": "percent"
          }
        ]
      },
      {
        "title": "Indexer Lag by Chain",
        "type": "graph",
        "targets": [
          {
            "expr": "indexer_blocks_behind",
            "legendFormat": "{{chain}}"
          }
        ]
      },
      {
        "title": "Cache Hit Ratio",
        "type": "singlestat",
        "targets": [
          {
            "expr": "cache_hit_ratio",
            "format": "percent"
          }
        ]
      }
    ]
  }
}
```

## Troubleshooting

**Common issues and their solutions for transaction history systems.**

### Common Problems & Solutions

| Problem | Symptoms | Root Cause | Solution |
|---------|----------|------------|----------|
| **Slow Query Performance** | API timeouts, high P95 latency | Missing indexes, inefficient queries | Add database indexes, optimize queries, implement caching |
| **Missing Transactions** | Users report missing transfers | Indexer sync issues, address format problems | Check indexer sync status, verify address normalization |
| **Duplicate Transactions** | Same transaction appears multiple times | Pagination cursor issues, race conditions | Fix cursor generation, implement deduplication |
| **Stale Data** | Old transaction status, missing recent txs | Cache invalidation issues, indexer lag | Implement proper cache TTL, monitor indexer sync |
| **Memory Leaks** | Increasing memory usage over time | Event listeners not cleaned up, unclosed connections | Audit event listeners, implement connection pooling |
| **Rate Limiting Errors** | 429 responses, blocked requests | Too aggressive rate limiting, missing auth | Adjust rate limits, implement proper authentication |

### Debugging Tools & Techniques

```javascript
// Debug logging with structured format
const winston = require('winston');

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: 'transaction-history.log',
      maxsize: 100 * 1024 * 1024, // 100MB
      maxFiles: 5
    }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Request tracing
class RequestTracer {
  static trace(req, res, next) {
    const traceId = req.headers['x-trace-id'] || generateTraceId();
    req.traceId = traceId;
    res.setHeader('x-trace-id', traceId);
    
    logger.info('Request started', {
      traceId,
      method: req.method,
      url: req.url,
      userAgent: req.headers['user-agent'],
      ip: req.ip
    });
    
    const start = Date.now();
    res.on('finish', () => {
      logger.info('Request completed', {
        traceId,
        status: res.statusCode,
        duration: Date.now() - start
      });
    });
    
    next();
  }
}

// Performance profiling
class PerformanceProfiler {
  static async profileQuery(queryName, queryFn) {
    const start = process.hrtime.bigint();
    
    try {
      const result = await queryFn();
      const duration = Number(process.hrtime.bigint() - start) / 1000000; // Convert to ms
      
      logger.info('Query performance', {
        queryName,
        duration,
        status: 'success'
      });
      
      return result;
    } catch (error) {
      const duration = Number(process.hrtime.bigint() - start) / 1000000;
      
      logger.error('Query failed', {
        queryName,
        duration,
        error: error.message,
        stack: error.stack
      });
      
      throw error;
    }
  }
}
```

### Health Check Implementation

```javascript
// health-check.js
class HealthChecker {
  constructor(dependencies) {
    this.dependencies = dependencies;
  }

  async checkHealth() {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkIndexers(),
      this.checkExternalAPIs()
    ]);

    const results = checks.map((check, index) => ({
      name: ['database', 'redis', 'indexers', 'external_apis'][index],
      status: check.status === 'fulfilled' ? 'healthy' : 'unhealthy',
      details: check.status === 'fulfilled' ? check.value : check.reason.message,
      timestamp: new Date().toISOString()
    }));

    const overallStatus = results.every(r => r.status === 'healthy') ? 'healthy' : 'unhealthy';

    return {
      status: overallStatus,
      checks: results,
      version: process.env.APP_VERSION,
      uptime: process.uptime()
    };
  }

  async checkDatabase() {
    const start = Date.now();
    await this.dependencies.db.query('SELECT 1');
    const responseTime = Date.now() - start;
    
    return {
      responseTime,
      status: responseTime < 100 ? 'healthy' : 'slow'
    };
  }

  async checkRedis() {
    const start = Date.now();
    await this.dependencies.redis.ping();
    const responseTime = Date.now() - start;
    
    return {
      responseTime,
      status: responseTime < 50 ? 'healthy' : 'slow'
    };
  }

  async checkIndexers() {
    const indexerStatus = {};
    
    for (const [chain, indexer] of Object.entries(this.dependencies.indexers)) {
      try {
        const status = await indexer.getStatus();
        indexerStatus[chain] = {
          status: 'healthy',
          blockHeight: status.blockHeight,
          lag: status.lag
        };
      } catch (error) {
        indexerStatus[chain] = {
          status: 'unhealthy',
          error: error.message
        };
      }
    }
    
    return indexerStatus;
  }

  async checkExternalAPIs() {
    // Check external dependencies like blockchain RPCs
    const apiChecks = {};
    
    // Example: Check Bitcoin RPC
    try {
      const response = await fetch(process.env.BTC_RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'getblockchaininfo',
          id: 1
        })
      });
      
      apiChecks.bitcoin_rpc = response.ok ? 'healthy' : 'unhealthy';
    } catch (error) {
      apiChecks.bitcoin_rpc = 'unhealthy';
    }
    
    return apiChecks;
  }
}

// Express health check endpoint
app.get('/health', async (req, res) => {
  try {
    const health = await healthChecker.checkHealth();
    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});
```

### Database Query Optimization

```sql
-- Analyze slow queries
EXPLAIN ANALYZE 
SELECT * FROM transactions 
WHERE user_id = $1 
  AND blockchain = $2 
  AND created_at > $3 
ORDER BY created_at DESC 
LIMIT 50;

-- Essential indexes for transaction history
CREATE INDEX CONCURRENTLY idx_transactions_user_blockchain_created 
ON transactions (user_id, blockchain, created_at DESC);

CREATE INDEX CONCURRENTLY idx_transactions_hash 
ON transactions (transaction_hash);

CREATE INDEX CONCURRENTLY idx_transactions_block_number 
ON transactions (blockchain, block_number);

CREATE INDEX CONCURRENTLY idx_transactions_addresses 
ON transactions USING GIN (addresses);

-- Partition large tables by date
CREATE TABLE transactions_2024_01 PARTITION OF transactions 
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- Analyze table statistics
ANALYZE transactions;
```

## Migration Strategies

**Strategies for migrating existing transaction history systems to WDK Indexer.**

### Migration from Explorer APIs

```javascript
class ExplorerToWDKMigration {
  constructor(config) {
    this.explorerAPI = config.explorerAPI;
    this.wdkIndexer = config.wdkIndexer;
    this.database = config.database;
  }

  async migrateUser(userId, addresses) {
    console.log(`Starting migration for user ${userId}`);
    
    try {
      // 1. Export existing data from explorer APIs
      const existingData = await this.exportFromExplorer(addresses);
      console.log(`Exported ${existingData.length} transactions`);
      
      // 2. Validate and clean data
      const validatedData = await this.validateTransactionData(existingData);
      console.log(`Validated ${validatedData.length} transactions`);
      
      // 3. Convert to WDK format
      const wdkFormat = await this.convertToWDKSchema(validatedData);
      
      // 4. Import to WDK database
      await this.importToWDK(userId, wdkFormat);
      
      // 5. Enable hybrid mode for gradual cutover
      await this.enableHybridMode(userId, addresses);
      
      console.log(`Migration completed for user ${userId}`);
      
    } catch (error) {
      console.error(`Migration failed for user ${userId}:`, error);
      throw error;
    }
  }

  async exportFromExplorer(addresses) {
    const allTransactions = [];
    
    for (const address of addresses) {
      let page = 1;
      let hasMore = true;
      
      while (hasMore) {
        try {
          const response = await this.explorerAPI.getTransactions(address, {
            page,
            limit: 100
          });
          
          allTransactions.push(...response.transactions);
          hasMore = response.hasMore;
          page++;
          
          // Rate limiting
          await this.delay(100);
          
        } catch (error) {
          if (error.status === 429) {
            // Rate limited, wait and retry
            await this.delay(60000);
            continue;
          }
          throw error;
        }
      }
    }
    
    return allTransactions;
  }

  async validateTransactionData(transactions) {
    const validated = [];
    const errors = [];
    
    for (const tx of transactions) {
      try {
        // Validate required fields
        if (!tx.hash || !tx.timestamp || !tx.amount) {
          throw new Error('Missing required fields');
        }
        
        // Validate format
        if (!this.isValidTransactionHash(tx.hash)) {
          throw new Error('Invalid transaction hash format');
        }
        
        // Normalize amounts
        tx.amount = this.normalizeAmount(tx.amount, tx.token);
        
        validated.push(tx);
        
      } catch (error) {
        errors.push({ transaction: tx, error: error.message });
      }
    }
    
    if (errors.length > 0) {
      console.warn(`Validation errors for ${errors.length} transactions:`, errors.slice(0, 10));
    }
    
    return validated;
  }

  async convertToWDKSchema(transactions) {
    return transactions.map(tx => ({
      blockchain: this.detectBlockchain(tx.hash),
      transactionHash: tx.hash,
      blockNumber: tx.blockNumber,
      transactionIndex: tx.transactionIndex,
      direction: this.determineDirection(tx),
      from: tx.from,
      to: tx.to,
      token: tx.token || this.detectToken(tx),
      amount: tx.amount,
      timestamp: new Date(tx.timestamp).toISOString(),
      status: tx.confirmations > 0 ? 'confirmed' : 'pending',
      confirmations: tx.confirmations || 0,
      fee: tx.fee,
      metadata: {
        migratedFrom: 'explorer',
        originalData: tx
      }
    }));
  }

  async enableHybridMode(userId, addresses) {
    // Enable gradual cutover
    await this.database.setUserMigrationStatus(userId, {
      status: 'hybrid',
      addresses,
      migratedAt: new Date(),
      cutoverPercentage: 10 // Start with 10% traffic to WDK
    });
    
    // Schedule gradual increase
    setTimeout(() => this.increaseCutoverPercentage(userId, 25), 24 * 60 * 60 * 1000); // 24h
    setTimeout(() => this.increaseCutoverPercentage(userId, 50), 48 * 60 * 60 * 1000); // 48h
    setTimeout(() => this.increaseCutoverPercentage(userId, 100), 72 * 60 * 60 * 1000); // 72h
  }
}

// Hybrid mode service
class HybridTransactionService {
  async getTransactionHistory(userId, addresses, options) {
    const migrationStatus = await this.getMigrationStatus(userId);
    
    if (!migrationStatus || migrationStatus.status === 'not_migrated') {
      // Use old explorer API
      return this.explorerAPI.getTransactions(addresses, options);
    }
    
    if (migrationStatus.status === 'completed') {
      // Use WDK indexer only
      return this.wdkIndexer.getTransactions(userId, addresses, options);
    }
    
    if (migrationStatus.status === 'hybrid') {
      // Random selection based on cutover percentage
      const useWDK = Math.random() < (migrationStatus.cutoverPercentage / 100);
      
      if (useWDK) {
        try {
          return await this.wdkIndexer.getTransactions(userId, addresses, options);
        } catch (error) {
          // Fallback to explorer API
          console.warn('WDK failed, falling back to explorer:', error);
          return this.explorerAPI.getTransactions(addresses, options);
        }
      } else {
        return this.explorerAPI.getTransactions(addresses, options);
      }
    }
  }
}
```

### Database Schema Migration

```sql
-- Migration script for existing transaction tables
BEGIN;

-- Add new columns for WDK compatibility
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS blockchain VARCHAR(20),
ADD COLUMN IF NOT EXISTS direction VARCHAR(10),
ADD COLUMN IF NOT EXISTS transaction_index INTEGER,
ADD COLUMN IF NOT EXISTS log_index INTEGER,
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Populate blockchain field based on existing data
UPDATE transactions 
SET blockchain = CASE 
  WHEN transaction_hash LIKE '0x%' THEN 'ethereum'
  WHEN length(transaction_hash) = 64 THEN 'bitcoin'
  ELSE 'unknown'
END
WHERE blockchain IS NULL;

-- Populate direction field
UPDATE transactions 
SET direction = CASE 
  WHEN amount > 0 THEN 'in'
  WHEN amount < 0 THEN 'out'
  ELSE 'self'
END
WHERE direction IS NULL;

-- Create new indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_blockchain_direction
ON transactions (blockchain, direction);

-- Update constraints
ALTER TABLE transactions 
ALTER COLUMN blockchain SET NOT NULL,
ALTER COLUMN direction SET NOT NULL;

COMMIT;
```

## Cost Optimization

**Strategies to minimize infrastructure costs while maintaining performance and reliability.**

### Storage Optimization

```javascript
// Data lifecycle management
class TransactionDataLifecycle {
  constructor(config) {
    this.config = config;
  }

  // Implement data tiering strategy
  async implementDataTiering() {
    const cutoffDates = {
      hot: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),     // 30 days
      warm: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),   // 1 year
      cold: new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000) // 3 years
    };

    // Move old data to cheaper storage tiers
    await this.moveToWarmStorage(cutoffDates.hot);
    await this.moveToColdStorage(cutoffDates.warm);
    await this.archiveOldData(cutoffDates.cold);
  }

  async moveToWarmStorage(cutoffDate) {
    // Example: Move to standard storage class
    const oldTransactions = await this.database.query(`
      SELECT transaction_hash, blockchain, block_number 
      FROM transactions 
      WHERE created_at < $1 
        AND storage_tier = 'hot'
    `, [cutoffDate]);

    for (const tx of oldTransactions) {
      // Compress and move to warm storage
      const compressed = await this.compressTransaction(tx);
      await this.storeInWarmTier(compressed);
      await this.updateStorageTier(tx.transaction_hash, 'warm');
    }
  }

  async compressTransaction(transaction) {
    // Remove non-essential metadata for old transactions
    const essential = {
      transactionHash: transaction.transaction_hash,
      blockchain: transaction.blockchain,
      blockNumber: transaction.block_number,
      from: transaction.from,
      to: transaction.to,
      amount: transaction.amount,
      timestamp: transaction.timestamp,
      token: transaction.token
    };

    return JSON.stringify(essential);
  }
}

// Cost monitoring
class CostMonitor {
  async generateCostReport() {
    const costs = {
      storage: await this.calculateStorageCosts(),
      compute: await this.calculateComputeCosts(),
      network: await this.calculateNetworkCosts(),
      external_apis: await this.calculateExternalAPICosts()
    };

    const recommendations = this.generateRecommendations(costs);
    
    return {
      totalMonthlyCost: Object.values(costs).reduce((sum, cost) => sum + cost, 0),
      breakdown: costs,
      recommendations
    };
  }

  async calculateStorageCosts() {
    const storageUsage = await this.database.query(`
      SELECT 
        blockchain,
        COUNT(*) as transaction_count,
        pg_size_pretty(pg_total_relation_size('transactions')) as table_size
      FROM transactions 
      GROUP BY blockchain
    `);

    // Calculate based on cloud provider pricing
    return storageUsage.reduce((total, usage) => {
      const sizeGB = this.parseSize(usage.table_size);
      return total + (sizeGB * 0.023); // $0.023/GB/month for standard storage
    }, 0);
  }

  generateRecommendations(costs) {
    const recommendations = [];

    if (costs.storage > 1000) {
      recommendations.push({
        type: 'storage',
        description: 'Consider implementing data archival for transactions older than 2 years',
        estimatedSavings: costs.storage * 0.3
      });
    }

    if (costs.compute > 500) {
      recommendations.push({
        type: 'compute',
        description: 'Optimize query performance to reduce CPU usage',
        estimatedSavings: costs.compute * 0.2
      });
    }

    return recommendations;
  }
}
```

### Auto-scaling Configuration

```yaml
# Kubernetes HPA configuration
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: wdk-api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: wdk-api
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
      - type: Percent
        value: 100
        periodSeconds: 30
      - type: Pods
        value: 2
        periodSeconds: 60
```

## Compliance & Audit

**Regulatory compliance and audit requirements for transaction history systems.**

### GDPR Compliance

```javascript
class GDPRCompliance {
  constructor(database) {
    this.database = database;
    this.auditLog = new AuditLogger();
  }

  // Right to Access (Article 15)
  async exportUserData(userId, requestId) {
    this.auditLog.log({
      action: 'DATA_EXPORT_REQUEST',
      userId,
      requestId,
      timestamp: new Date(),
      ip: req.ip
    });

    const userData = await this.database.query(`
      SELECT 
        transaction_hash,
        blockchain,
        amount,
        timestamp,
        token,
        'transaction_history' as data_type
      FROM transactions 
      WHERE user_id = $1
    `, [userId]);

    return {
      userId,
      exportDate: new Date().toISOString(),
      data: userData,
      format: 'JSON'
    };
  }

  // Right to Rectification (Article 16)
  async updateUserData(userId, corrections, requestId) {
    this.auditLog.log({
      action: 'DATA_CORRECTION',
      userId,
      requestId,
      corrections,
      timestamp: new Date()
    });

    // Allow user to correct certain fields
    const allowedCorrections = ['user_notes', 'tags', 'categories'];
    
    for (const [field, value] of Object.entries(corrections)) {
      if (allowedCorrections.includes(field)) {
        await this.database.query(`
          UPDATE user_transaction_metadata 
          SET ${field} = $1, updated_at = NOW()
          WHERE user_id = $2
        `, [value, userId]);
      }
    }
  }

  // Right to Erasure (Article 17)
  async deleteUserData(userId, requestId) {
    this.auditLog.log({
      action: 'DATA_DELETION_REQUEST',
      userId,
      requestId,
      timestamp: new Date()
    });

    // Pseudonymize rather than delete (for blockchain integrity)
    const anonymizedId = this.generateAnonymousId();
    
    await this.database.query(`
      UPDATE transactions 
      SET user_id = $1, 
          personal_data_removed = true,
          deletion_date = NOW()
      WHERE user_id = $2
    `, [anonymizedId, userId]);

    // Remove from cache
    await this.cache.del(`user:${userId}:*`);
  }

  // Data Protection Impact Assessment
  async generateDPIA() {
    return {
      dataTypes: [
        'Wallet addresses (pseudonymous identifiers)',
        'Transaction amounts',
        'Transaction timestamps',
        'IP addresses (logs only)',
        'API usage patterns'
      ],
      legalBasis: 'Legitimate interest (service provision)',
      retentionPeriod: '7 years for financial records',
      dataMinimization: 'Only transaction-relevant data stored',
      encryption: 'AES-256 encryption at rest, TLS 1.3 in transit',
      accessControls: 'Role-based access, audit logging',
      thirdParties: 'Blockchain RPC providers (data processors)',
      risks: [
        {
          risk: 'Address correlation attacks',
          mitigation: 'Address mixing recommendations to users'
        }
      ]
    };
  }
}
```

### Audit Trail Implementation

```typescript
interface AuditLog {
  id: string;
  timestamp: string;
  userId?: string;
  action: AuditAction;
  resource: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  sessionId?: string;
  result: 'success' | 'failure';
  errorMessage?: string;
}

enum AuditAction {
  VIEW_HISTORY = 'VIEW_HISTORY',
  EXPORT_DATA = 'EXPORT_DATA',
  DELETE_DATA = 'DELETE_DATA',
  API_ACCESS = 'API_ACCESS',
  ADMIN_ACCESS = 'ADMIN_ACCESS',
  CONFIG_CHANGE = 'CONFIG_CHANGE'
}

class AuditLogger {
  constructor(database) {
    this.database = database;
  }

  async log(auditEvent: Partial<AuditLog>) {
    const fullEvent: AuditLog = {
      id: generateUuid(),
      timestamp: new Date().toISOString(),
      result: 'success',
      ...auditEvent
    };

    // Store in database
    await this.database.query(`
      INSERT INTO audit_logs (
        id, timestamp, user_id, action, resource, 
        details, ip_address, user_agent, session_id, result, error_message
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `, [
      fullEvent.id,
      fullEvent.timestamp,
      fullEvent.userId,
      fullEvent.action,
      fullEvent.resource,
      JSON.stringify(fullEvent.details),
      fullEvent.ipAddress,
      fullEvent.userAgent,
      fullEvent.sessionId,
      fullEvent.result,
      fullEvent.errorMessage
    ]);

    // Also send to SIEM system
    await this.sendToSIEM(fullEvent);
  }

  async generateAuditReport(startDate: Date, endDate: Date) {
    const logs = await this.database.query(`
      SELECT 
        action,
        COUNT(*) as count,
        COUNT(DISTINCT user_id) as unique_users,
        AVG(CASE WHEN result = 'success' THEN 1 ELSE 0 END) as success_rate
      FROM audit_logs 
      WHERE timestamp BETWEEN $1 AND $2
      GROUP BY action
      ORDER BY count DESC
    `, [startDate, endDate]);

    return {
      period: { startDate, endDate },
      summary: logs,
      totalEvents: logs.reduce((sum, log) => sum + log.count, 0),
      complianceScore: this.calculateComplianceScore(logs)
    };
  }
}
```

### Sample REST Request/Response

**Request:**
```bash
curl -X GET "https://api.example.com/v1/transactions?limit=10&tokens=eth,usdt" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "transactions": [
    {
      "blockchain": "ethereum",
      "transactionHash": "0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890",
      "blockNumber": 18500000,
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
      "fee": "0.002",
      "fiatValue": "1000.00",
      "metadata": {
        "contractAddress": "0xdac17f958d2ee523a2206206994597c13d831ec7",
        "gasUsed": "65000",
        "gasPrice": "30000000000"
      }
    }
  ],
  "pagination": {
    "hasNext": true,
    "cursor": "eyJibG9jayI6MTg1MDAwMDAsInR4SWR4Ijo0NX0=",
    "limit": 10,
    "total": 1247
  },
  "meta": {
    "responseTime": "120ms",
    "source": "indexer",
    "cacheHit": false
  }
}
```

### React Hook Implementation

```jsx
import { useState, useEffect, useCallback } from 'react';

function useTransactionHistory(options = {}) {
  const [state, setState] = useState({
    transactions: [],
    loading: true,
    error: null,
    hasMore: true,
    cursor: null
  });

  const transactionService = new TransactionHistoryService();

  const loadTransactions = useCallback(async (reset = false) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await transactionService.getTransactionHistory(
        options.userId,
        options.addresses,
        {
          cursor: reset ? null : state.cursor,
          limit: options.limit || 50,
          ...options.filters
        }
      );

      setState(prev => ({
        transactions: reset ? response.transactions : [...prev.transactions, ...response.transactions],
        loading: false,
        hasMore: response.pagination.hasNext,
        cursor: response.pagination.cursor,
        error: null
      }));

    } catch (error) {
      setState(prev => ({ ...prev, loading: false, error }));
    }
  }, [options, state.cursor]);

  // Load initial data
  useEffect(() => {
    loadTransactions(true);
  }, [options.userId, options.addresses]);

  // Real-time updates
  useEffect(() => {
    if (!options.realTime || !options.addresses) return;

    const realTime = new RealTimeUpdates(options.apiUrl);
    const unsubscribe = realTime.subscribe(options.addresses, (newTransaction) => {
      setState(prev => ({
        ...prev,
        transactions: [newTransaction, ...prev.transactions]
      }));
    });

    return unsubscribe;
  }, [options.addresses, options.realTime]);

  return {
    ...state,
    loadMore: () => loadTransactions(false),
    refresh: () => loadTransactions(true)
  };
}

// Usage in component
function TransactionHistoryScreen() {
  const { transactions, loading, error, hasMore, loadMore } = useTransactionHistory({
    userId: 'user123',
    addresses: ['0x742d35cc...', '0xa0b86a33...'],
    realTime: true,
    filters: {
      tokens: ['eth', 'usdt'],
      direction: 'in'
    }
  });

  if (loading && transactions.length === 0) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage error={error} />;
  }

  return (
    <div className="transaction-history">
      <TransactionList 
        transactions={transactions}
        onLoadMore={hasMore ? loadMore : null}
      />
    </div>
  );
}
```

### Transaction List Component

```jsx
function TransactionList({ transactions, onLoadMore }) {
  const { ref, inView } = useInView({ threshold: 0 });

  useEffect(() => {
    if (inView && onLoadMore) {
      onLoadMore();
    }
  }, [inView, onLoadMore]);

  return (
    <div className="transaction-list">
      {transactions.map((tx, index) => (
        <TransactionItem key={`${tx.transactionHash}-${index}`} transaction={tx} />
      ))}
      
      {onLoadMore && (
        <div ref={ref} className="load-more-trigger">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
}

function TransactionItem({ transaction }) {
  const formatAmount = (amount, token) => {
    const formatted = parseFloat(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    });
    return `${formatted} ${token.toUpperCase()}`;
  };

  const getDirectionIcon = (direction) => {
    switch (direction) {
      case 'in': return '↓';
      case 'out': return '↑';
      case 'self': return '⟲';
      default: return '→';
    }
  };

  return (
    <div className={`transaction-item direction-${transaction.direction}`}>
      <div className="transaction-icon">
        <span className="direction-indicator">
          {getDirectionIcon(transaction.direction)}
        </span>
        <TokenLogo token={transaction.token} />
      </div>
      
      <div className="transaction-details">
        <div className="transaction-header">
          <span className="amount">
            {transaction.direction === 'out' ? '-' : '+'}
            {formatAmount(transaction.amount, transaction.token)}
          </span>
          <TransactionStatus transaction={transaction} />
        </div>
        
        <div className="transaction-meta">
          <span className="timestamp">
            {new Date(transaction.timestamp).toLocaleString()}
          </span>
          <span className="hash">
            {transaction.transactionHash.slice(0, 8)}...
          </span>
        </div>
        
        {transaction.fiatValue && (
          <div className="fiat-value">
            ${parseFloat(transaction.fiatValue).toFixed(2)} USD
          </div>
        )}
      </div>
      
      <div className="transaction-actions">
        <button onClick={() => viewOnExplorer(transaction)}>
          View Details
        </button>
      </div>
    </div>
  );
}
```

## References

- **WDK Indexer Repositories**:
  - `wdk-app-node` - REST API instances
  - `wdk-ork-wrk` - Request orchestration workers  
  - `wdk-data-shard-wrk` - User data management
  - `wdk-indexer-wrk-base` - Base indexer functionality
  - Chain-specific indexers: `wdk-indexer-wrk-btc`, `wdk-indexer-wrk-evm`, etc.

- **Technical Documentation**:
  - [Holepunch Hyper Technology](https://hypercore-protocol.org/)
  - [WDK Core Documentation](../README.md)
  - [Individual Chain Indexer Docs](indexer/)

- **Blockchain References**:
  - [Bitcoin Developer Documentation](https://developer.bitcoin.org/)
  - [Ethereum JSON-RPC API](https://ethereum.github.io/execution-apis/api-documentation/)
  - [Solana Web3.js Documentation](https://solana-labs.github.io/solana-web3.js/)
  - [TON Development Documentation](https://ton.org/docs/)
  - [TRON Developer Hub](https://developers.tron.network/)

> **Note**: The WDK Indexer codebase is currently in active development. Contact the WDK team for early access or evaluation opportunities before the public release.