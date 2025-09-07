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

## API Reference/Specs

### Authentication
All requests require a valid API key in the header:
```http
X-API-KEY: your-api-key-here
```

### Common Headers and Parameters
**Required Headers:**
- `X-API-KEY` - Your unique API key
- `Content-Type: application/json` (for POST requests)

**Common Path Parameters:**
- `blockchain` - Network identifier (e.g., "eth", "btc", "tron")
- `token` - Token/currency identifier (e.g., "usdt", "btc", "eth")
- `address` - Wallet address to query

### Error Handling
The API returns standard HTTP status codes:

**Success Codes:**
- `200` - Request successful

**Error Codes:**
- `400` - Bad Request - Invalid parameters
- `401` - Unauthorized - Invalid or missing API key
- `404` - Not Found - Address or token not found
- `429` - Too Many Requests - Rate limit exceeded
- `500` - Internal Server Error - Server error

**Error Response Format:**
```json
{
  "error": {
    "code": 400,
    "message": "Invalid blockchain parameter",
    "details": "Supported blockchains: eth, btc, tron"
  }
}
```

### Rate Limiting
- **Limit:** 100 requests per minute per API key
- **Headers:** Rate limit info included in response headers:
  - `X-RateLimit-Limit` - Request limit per minute
  - `X-RateLimit-Remaining` - Remaining requests
  - `X-RateLimit-Reset` - Time when limit resets

## Endpoints

### Token Transfer History
**Endpoint:** `GET /api/v1/:blockchain/:token/:address/token-transfers`

**Endpoint Details:**
Returns complete transfer history for any wallet address and token.

**Path Parameters:**
- `blockchain` - Network (e.g., "eth", "btc")
- `token` - Token/currency (e.g., "usdt", "btc")  
- `address` - Wallet address to query

**Query Parameters:**
- `limit` - Max transfers to return (default: 10)
- `fromTs` - Start timestamp in milliseconds
- `toTs` - End timestamp in milliseconds
- `sort` - Order "asc" or "desc" (default: "desc")

**Request Examples:**
```http
GET /api/v1/eth/usdt/0x123.../token-transfers?limit=20&sort=desc
Host: your-indexer-url.com
X-API-KEY: your-api-key-here
```

**Response Format:**
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

**Error Responses:**
```json
// Invalid blockchain
{
  "error": {
    "code": 400,
    "message": "Invalid blockchain parameter",
    "details": "Supported blockchains: eth, btc, tron"
  }
}

// Address not found
{
  "error": {
    "code": 404,
    "message": "Address not found",
    "details": "No data available for this address"
  }
}
```

### Token Balances
**Endpoint:** `GET /api/v1/:blockchain/:token/:address/token-balances`

**Endpoint Details:**
Returns current token balance for any wallet address.

**Path Parameters:**
- `blockchain` - Network (e.g., "eth", "btc")
- `token` - Token/currency (e.g., "usdt", "btc")  
- `address` - Wallet address to query

**Request Examples:**
```http
GET /api/v1/eth/usdt/0x123.../token-balances
Host: your-indexer-url.com
X-API-KEY: your-api-key-here
```

**Response Format:**
```json
{
  "tokenBalance": {
    "blockchain": "eth",
    "token": "usdt",
    "amount": 5000000
  }
}
```

**Error Responses:**
```json
// Invalid token
{
  "error": {
    "code": 400,
    "message": "Invalid token parameter",
    "details": "Token not supported on this blockchain"
  }
}

// Unauthorized
{
  "error": {
    "code": 401,
    "message": "Unauthorized",
    "details": "Invalid or missing API key"
  }
}
```

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
```

## Common Use Cases

- **Wallet Applications** - Display transaction history and balances
- **Portfolio Tracking** - Monitor assets across multiple addresses
- **DeFi Analytics** - Track token movements and liquidity
- **Compliance** - Audit transaction flows for reporting
- **Payment Processing** - Verify incoming payments

## Support


