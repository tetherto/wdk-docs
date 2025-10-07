---
title: Overview
description: Fast access to blockchain data across multiple networks with the WDK Indexer API
icon: magnifying-glass
layout:
  width: default
  title:
    visible: true
  description:
    visible: true
  tableOfContents:
    visible: true
  outline:
    visible: true
  pagination:
    visible: true
  metadata:
    visible: false
---

# Indexer API Overview

## What is a Blockchain Indexer?

A blockchain indexer is like a search engine for blockchain data. Instead of scanning the entire blockchain every time you need information, it continuously monitors and organizes blockchain transactions, making them instantly searchable and accessible through a simple API.

***

## About WDK Indexer

WDK Indexer provides fast, reliable access to blockchain transaction data across multiple networks. It's designed to work seamlessly with the WDK SDK and React Native Starter, but can also be used as a standalone service.

### Key Features

* **Multi-Blockchain Support**: Bitcoin, Ethereum, Solana, TON, TRON, Spark, and other major networks
* **Real-Time Data**: Continuously syncs with blockchain networks for up-to-date information
* **Fast Queries**: Get transaction history and balances instantly without scanning the blockchain
* **Unified API**: Consistent JSON-RPC 2.0 API across all supported blockchains
* **Flexible Deployment**: Run locally, self-host, or use managed infrastructure
* **P2P Replication**: Built on Hyperbee for decentralized data replication

***

## Getting Started

### Prerequisites

Before using the WDK Indexer API, you'll need:

* **Indexer Deployment**: A running WDK Indexer instance (local or hosted)
* **API Endpoint**: The base URL for your indexer instance
* **Authentication** (optional): API key or JWT token for secured deployments

### API Base URL

The indexer exposes a single JSON-RPC 2.0 endpoint:

{% code title="API Endpoint" %}
```
http://localhost:8080/rpc  # Default local deployment
https://your-indexer.com/rpc  # Production deployment
```
{% endcode %}

***

## Supported Blockchains

The WDK Indexer provides unified data access across:

| Blockchain | Native Token | Token Standards | Special Features |
| --- | --- | --- | --- |
| **Bitcoin** | BTC | - | UTXO tracking, SegWit, Bech32 |
| **Ethereum** | ETH | ERC-20, ERC-721 | Smart contracts, gas tracking |
| **Solana** | SOL | SPL Tokens | Slot-based, program interactions |
| **TON** | TON | Jetton | Message chains, gas details |
| **TRON** | TRX | TRC-20, TRC-721 | Energy/bandwidth tracking |
| **Spark** | SPARK | Native | Optimized for high throughput |
| **Polygon** | MATIC | ERC-20, ERC-721 | EVM-compatible |
| **Arbitrum** | ETH | ERC-20, ERC-721 | Layer 2 optimizations |

***

## Core Capabilities

### Balance Queries

Get real-time balance information for any address:

* **Single address balances**: Native tokens and supported token standards
* **Multi-address batching**: Query multiple addresses in one request
* **Historical balances**: Balance at specific block heights

### Transaction History

Retrieve comprehensive transaction history:

* **Flexible filtering**: By address, token, time range, or block range
* **Direction tracking**: Incoming, outgoing, or self-transfers
* **Status information**: Pending, confirmed, or failed transactions
* **Pagination support**: Cursor-based pagination for large datasets

### Block Information

Access block-level data:

* **Block queries**: Get full block data with normalized transactions
* **Real-time access**: Query latest blocks directly from the blockchain
* **Historical data**: Access archived block information

### Address Validation

Validate addresses before processing:

* **Format checking**: Ensure addresses are properly formatted
* **Chain-specific validation**: Support for different address types (Legacy, SegWit, Bech32, etc.)

***

## Common Use Cases

<table data-view="cards">
<thead>
<tr>
<th>Use Case</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Wallet Applications</strong></td>
<td>Display real-time balances and transaction history for user wallets</td>
</tr>
<tr>
<td><strong>Portfolio Tracking</strong></td>
<td>Monitor assets across multiple addresses and blockchains</td>
</tr>
<tr>
<td><strong>DeFi Analytics</strong></td>
<td>Track token movements, liquidity, and protocol interactions</td>
</tr>
<tr>
<td><strong>Payment Processing</strong></td>
<td>Verify incoming payments and track transaction confirmations</td>
</tr>
<tr>
<td><strong>Compliance & Auditing</strong></td>
<td>Audit transaction flows for regulatory reporting</td>
</tr>
<tr>
<td><strong>Block Explorers</strong></td>
<td>Build custom block explorers with rich transaction data</td>
</tr>
</tbody>
</table>

***

## Quick Example

Here's a simple example of querying transaction history:

{% code title="Query Transactions" lineNumbers="true" %}
```javascript
const axios = require('axios');

async function getTransactionHistory(address) {
  const response = await axios.post('http://localhost:8080/rpc', {
    jsonrpc: '2.0',
    method: 'queryTransactions',
    params: {
      addresses: [address],
      limit: 50
    },
    id: 1
  });
  
  if (response.data.error) {
    throw new Error(response.data.error.message);
  }
  
  return response.data.result;
}

// Usage
const txns = await getTransactionHistory('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');
console.log(`Found ${txns.length} transactions`);
```
{% endcode %}

***

## Rate Limiting

The WDK Indexer API implements rate limiting to ensure fair usage and system stability:

* **Default Limit**: 100 requests per minute per IP
* **Burst Allowance**: Up to 10 requests in burst
* **Response Headers**: Rate limit information included in all responses

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642694400
```

***

## Authentication

For production deployments, the API can be secured with:

* **API Keys**: Include in `Authorization` header
* **IP Whitelisting**: Restrict access to specific IP ranges
* **JWT Tokens**: For user-specific access control

{% code title="Authenticated Request" lineNumbers="true" %}
```javascript
const response = await axios.post('https://your-indexer.com/rpc', {
  jsonrpc: '2.0',
  method: 'getBalance',
  params: { address: '0x742d35cc6634c0c7e4c4b5c7f2b8e6f5f8c3e1a2' },
  id: 1
}, {
  headers: {
    'Authorization': 'Bearer your-api-key-here'
  }
});
```
{% endcode %}

***

## Next Steps

Ready to dive deeper? Explore the detailed API documentation:

* [**API Reference**](api-reference.md) - Complete method documentation with examples
* [**Indexer Deployment**](../../documentation/indexer/indexer-deployment.md) - Deploy your own indexer instance
* [**Configuration Guide**](../../documentation/indexer/indexer-configuration.md) - Configure indexer settings
* [**Integration Patterns**](../../documentation/transaction-history.md) - Best practices for integrating with your app

***

## Need Help?

{% include "../../.gitbook/includes/support-cards.md" %}
