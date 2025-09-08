---
title: WDK Indexer - User Guide
author: Raquel Carrasco
lastReviewed: 2025-09-05
---

# WDK Indexer - User Guide

## What is a Blockchain Indexer?

A blockchain indexer is like a search engine for blockchain data. Instead of scanning the entire blockchain every time you need information, it continuously monitors and organizes blockchain transactions, making them instantly searchable.

## About WDK Indexer

WDK Indexer provides fast access to blockchain transaction data across multiple networks. Key features:

- **Multi-blockchain support** - Ethereum, Bitcoin, and other major networks
- **Real-time data** - Continuously syncs with blockchain networks
- **Fast queries** - Get transaction history and balances instantly
- **Simple REST API** - Easy integration with clear documentation

## Getting Started

### Get Your API Key
Contact our admin team to request access. You'll receive:
- Your unique API key
- The base URL for API requests

<!-- TODO: Need to double check this section -->


### Authentication
Include your API key in every request:
```http
X-API-KEY: your-api-key-here
```

## API Reference

{% openapi src="../openapi.yaml" %}
Interactive API documentation with authentication, parameters, and response schemas.
{% endopenapi %}

### Authentication
All requests require a valid API key in the `X-API-KEY` header:
```http
X-API-KEY: your-api-key-here
```

### Rate Limiting
- **Limit:** 100 requests per minute per API key
- **Headers:** Rate limit info included in response headers

## API Endpoints

### Token Transfer History

{% openapi src="../openapi.yaml" path="/api/v1/{blockchain}/{token}/{address}/token-transfers" method="get" %}
Get token transfer history
{% endopenapi %}

### Token Balances

{% openapi src="../openapi.yaml" path="/api/v1/{blockchain}/{token}/{address}/token-balances" method="get" %}
Get token balance
{% endopenapi %}

## Integration Examples

```javascript
const API_KEY = 'your-api-key';
const BASE_URL = 'https://your-indexer-url.com';

async function getTransfers(blockchain, token, address) {
  const response = await fetch(
    `${BASE_URL}/api/v1/${blockchain}/${token}/${address}/token-transfers`,
    { headers: { 'X-API-KEY': API_KEY } }
  );
  return await response.json();
}

async function getBalance(blockchain, token, address) {
  const response = await fetch(
    `${BASE_URL}/api/v1/${blockchain}/${token}/${address}/token-balances`,
    { headers: { 'X-API-KEY': API_KEY } }
  );
  return await response.json();
}
```

<!-- No need thanks to openapi

## Response Format

### Token Transfers Response
```json
{
  "transfers": [
    {
      "transactionHash": "0xabc123...",
      "blockchain": "eth",
      "token": "usdt",
      "from": "0x123...",
      "to": "0x456...",
      "amount": 1000000,
      "type": "received",
      "timestamp": "2023-11-15T10:30:00Z"
    }
  ]
}
```

### Token Balance Response
```json
{
  "tokenBalance": {
    "blockchain": "eth",
    "token": "usdt",
    "amount": 5000000
  }
}
``` -->

## Common Use Cases

- **Wallet Applications** - Display transaction history and balances
- **Portfolio Tracking** - Monitor assets across multiple addresses
- **DeFi Analytics** - Track token movements and liquidity
- **Compliance** - Audit transaction flows for reporting
- **Payment Processing** - Verify incoming payments

## Support


