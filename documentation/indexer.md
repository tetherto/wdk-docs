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
│   Blockchain    │───▶│  Processor       │───▶│  Hypercore      │
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
- **Storage**: Commits normalized transactions to Hypercore-based distributed database
- **Schedule**: Configurable sync frequency (varies by chain: from 1 second to 5 minutes)
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

## WDK Indexer vs. Direct RPC Calls

WDK Indexers provide a unified, developer-friendly API for wallet applications by pre-processing and normalizing blockchain data. In contrast, direct RPC calls to a node return raw, chain-specific data and require complex, manual parsing for transaction history and balances.

| Feature                | Direct RPC Node         | WDK Indexer                |
|------------------------|------------------------|----------------------------|
| Data format            | Raw, chain-specific    | Unified, normalized        |
| Querying history       | Manual, slow           | Fast, single API call      |
| Address tracking       | Manual, complex        | Handled by indexer         |
| Pagination/filtering   | Manual                 | Built-in                   |
| Cross-chain support    | No                     | Yes                        |
| Caching/performance    | No                     | Yes                        |
| Setup complexity       | Node only              | Node + indexer             |

**Summary:** Use the WDK Indexer for fast, reliable, and scalable wallet data integration. Use direct RPC only if you need raw access and are prepared to handle all blockchain-specific logic yourself.

## Getting Started

### Quick Start

For step-by-step setup instructions, see the **[Quick Start Guide](indexer/indexer-quick-start.md)**.

### API Reference

All WDK Indexers expose a unified, standardized API regardless of the underlying blockchain. The API follows JSON-RPC 2.0 specification and provides consistent integration patterns across all supported networks.

**Key Features:**
- Unified data schema across all blockchains
- Standardized method names and parameters
- Chain-specific metadata where needed
- Comprehensive error handling and pagination

For complete API documentation, method signatures, examples, and chain-specific notes, see the **[WDK Indexer API Reference](indexer/indexer-api-reference.md)**.

#### Quick API Overview

| Method | Purpose | Returns |
|--------|---------|---------|
| `validAddress(address)` | Validate address format | `boolean` |
| `getBalance(address)` | Get balance for address | `string` |
| `getBalanceMulti(addresses)` | Get multiple balances | `Record<string, string>` |
| `getTransaction(hash)` | Get transaction by hash | `Transaction[]` |
| `queryTransactions(params)` | Query with filters | `Transaction[]` |
| `getBlock(blockNumber)` | Get block data | `Block` |

#### Example Usage

```javascript
// Initialize indexer client
const indexer = new WDKIndexerClient('http://localhost:8080');

// Get balance
const balance = await indexer.getBalance('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');

// Query transactions with filters
const transactions = await indexer.queryTransactions({
  fromTs: '2024-01-01T00:00:00Z',
  toTs: '2024-01-31T23:59:59Z', 
  addresses: ['1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'],
  limit: 50
});
```

<!-- ## Operations and Maintenance

> **Note**: The following sections provide operational guidance and best practices that extend beyond the basic repository implementations. Core architecture and API details are based directly on the repository code, while deployment, monitoring, and optimization strategies are recommended practices for production use.

 ### Deployment

WDK Indexers support multiple deployment strategies including Docker, Kubernetes, and bare metal installations. The architecture is designed for horizontal scaling of API workers while maintaining single processor instances per chain.

For comprehensive deployment guides including Docker Compose, Kubernetes manifests, and scaling strategies, see the **[Deployment Guide](indexer/indexer-deployment.md)**. -->

## Configuration

WDK Indexers use a standardized configuration system with both common settings and chain-specific options. All configuration follows the `bfx-svc-boot-js` framework conventions.

For complete configuration documentation including common settings, chain-specific options, and performance tuning, see the **[Configuration Reference](indexer/indexer-configuration.md)**.

<!-- ### Performance Optimization

Performance optimization involves tuning RPC provider settings, memory management, CPU utilization, and database configuration. Each blockchain has specific optimization strategies while sharing common principles.

For comprehensive performance optimization strategies, benchmarking guidelines, and chain-specific tuning, see the **[Performance Guide](indexer/indexer-performance.md)**. -->

<!-- ### Monitoring

Comprehensive monitoring is essential for production deployments. WDK Indexers expose Prometheus metrics and support various alerting and dashboard configurations.

For complete monitoring setup including Prometheus configuration, Grafana dashboards, alerting rules, and observability best practices, see the **[Monitoring Guide](indexer/indexer-monitoring.md)**. -->

<!-- ### Troubleshooting

Common issues include sync lag, API performance problems, RPC provider failures, and resource constraints. Most troubleshooting procedures are universal across chains with some blockchain-specific considerations.

For comprehensive troubleshooting procedures, common issue resolution, and debugging strategies, see the **[Troubleshooting Guide](indexer/indexer-troubleshooting.md)**. -->

## Extending to New Chains

For instructions on adding support for a new blockchain, see **[Extending WDK Indexers](indexer/indexer-extending.md)**.

## Next Steps

1. **Choose Your Blockchain**: Select from the [supported networks](#supported-networks)
2. **Quick Start**: Follow the [Quick Start Guide](indexer/indexer-quick-start.md)
<!-- 3. **Deploy**: Use the [Deployment Guide](indexer/indexer-deployment.md) for production setup -->
<!-- 4. **Configure Monitoring**: Set up observability with the [Monitoring Guide](indexer/indexer-monitoring.md) -->
5. **Integrate**: Use the [API Reference](indexer/indexer-api-reference.md) for wallet integration

For detailed chain-specific instructions, configuration options, and deployment notes, refer to the individual blockchain documentation pages.
