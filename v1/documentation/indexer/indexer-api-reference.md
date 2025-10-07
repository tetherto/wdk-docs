# WDK Indexer API Reference

## Overview

All WDK Indexers expose a unified, standardized API regardless of the underlying blockchain. This ensures consistent integration patterns across Bitcoin, Ethereum, Solana, TON, TRON, and other supported networks. The API follows JSON-RPC 2.0 specification and provides both HTTP endpoints and programmatic access.

## Base URL Structure

```
http://localhost:8080/rpc  # Default local deployment
https://your-indexer.com/rpc  # Production deployment
```

## Common Data Types

### Transaction Schema

```typescript
interface Transaction {
  blockchain: string;           // "bitcoin", "ethereum", "solana", etc.
  blockNumber: bigint;          // Block height
  transactionHash: string;      // Transaction ID/hash
  transactionIndex?: number;    // Position within block
  logIndex?: number;           // For token transfers (EVM, TRON)
  direction?: 'in' | 'out' | 'self';  // Transfer direction
  from?: string;               // Sender address
  to?: string;                 // Recipient address
  token: string;               // "btc", "eth", "usdt", etc.
  amount: string;              // Decimal amount as string
  timestamp: string;           // ISO 8601 timestamp
  status?: 'pending' | 'confirmed' | 'failed';
  confirmations?: number;      // Network confirmations
  fee?: string;               // Transaction fee in native token
  metadata?: TransactionMetadata;
}

interface TransactionMetadata {
  contractAddress?: string;    // For token transfers
  gasUsed?: string;           // For EVM chains
  energyUsed?: string;        // For TRON
  slotIndex?: number;         // For Solana
  messageCount?: number;      // For TON
  memo?: string;              // For chains supporting memos
}
```

### Block Schema

```typescript
interface Block {
  blockNumber: bigint;         // Block height
  blockHash: string;           // Block hash
  timestamp: string;           // ISO 8601 timestamp
  txns: Transaction[];         // Normalized transactions
  previousHash?: string;       // Previous block hash
  merkleRoot?: string;         // Merkle root (where applicable)
}
```

### Query Parameters

```typescript
interface QueryParams {
  // Pagination
  limit?: number;              // Max results (default: 50, max: 200)
  cursor?: string;             // Pagination cursor
  
  // Block range
  fromBlock?: bigint;          // Start block
  toBlock?: bigint;            // End block
  
  // Time range  
  fromTs?: string;             // Start timestamp (ISO 8601)
  toTs?: string;               // End timestamp (ISO 8601)
  
  // Filtering
  addresses?: string[];        // Filter by addresses
  tokens?: string[];          // Filter by tokens
  direction?: 'in' | 'out';   // Filter by direction
  
  // Status filtering
  status?: ('pending' | 'confirmed' | 'failed')[];
}
```

## Core API Methods

### Address Validation

#### `validAddress(address: string): Promise<boolean>`

Validates if an address is properly formatted for the blockchain.

**Request:**
```json
{
  "jsonrpc": "2.0",
  "method": "validAddress",
  "params": {
    "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
  },
  "id": 1
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "result": true,
  "id": 1
}
```

### Balance Queries

#### `getBalance(address: string): Promise<string>`

Returns the balance for a given address in the native token.

**Request:**
```json
{
  "jsonrpc": "2.0",
  "method": "getBalance",
  "params": {
    "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
  },
  "id": 1
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "result": "0.12345678",
  "id": 1
}
```

#### `getBalanceMulti(addresses: string[]): Promise<Record<string, string>>`

Returns balances for multiple addresses in a single call.

**Request:**
```json
{
  "jsonrpc": "2.0",
  "method": "getBalanceMulti",
  "params": {
    "addresses": [
      "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
      "1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2"
    ]
  },
  "id": 1
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "result": {
    "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa": "0.12345678",
    "1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2": "0.98765432"
  },
  "id": 1
}
```

### Transaction Queries

#### `getTransaction(hash: string): Promise<Transaction[]>`

Retrieves a transaction by its hash/ID. Returns an array as some transactions may contain multiple logical transfers.

**Request:**
```json
{
  "jsonrpc": "2.0",
  "method": "getTransaction",
  "params": {
    "hash": "0x1a2b3c4d5e6f7890abcdef..."
  },
  "id": 1
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "result": [
    {
      "blockchain": "ethereum",
      "blockNumber": 18500000,
      "transactionHash": "0x1a2b3c4d5e6f7890abcdef...",
      "transactionIndex": 45,
      "logIndex": 12,
      "from": "0x742d35cc6266c0c7e4c4b5c7f2b8e6f5f8c3e1a2",
      "to": "0xa0b86a33e6b8c66e29e8bb8a87e8e76e6d6e5e6f",
      "token": "usdt",
      "amount": "1000.000000",
      "timestamp": "2024-01-15T10:30:00.000Z",
      "status": "confirmed",
      "confirmations": 12
    }
  ],
  "id": 1
}
```

#### `queryTransactions(params: QueryParams): Promise<Transaction[]>`

Queries transactions with flexible filtering and pagination.

**Request:**
```json
{
  "jsonrpc": "2.0",
  "method": "queryTransactions",
  "params": {
    "fromTs": "2024-01-01T00:00:00Z",
    "toTs": "2024-01-31T23:59:59Z",
    "addresses": ["1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"],
    "limit": 50
  },
  "id": 1
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "result": [
    {
      "blockchain": "bitcoin",
      "blockNumber": 825000,
      "transactionHash": "abc123def456...",
      "transactionIndex": 8,
      "from": "1SendingAddress...",
      "to": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
      "token": "btc",
      "amount": "0.05000000",
      "timestamp": "2024-01-15T14:20:00.000Z",
      "status": "confirmed",
      "confirmations": 6
    }
  ],
  "id": 1
}
```

### Block Queries

#### `getBlock(blockNumber: bigint): Promise<Block>`

Retrieves a block and its transactions by block number.

**Request:**
```json
{
  "jsonrpc": "2.0",
  "method": "getBlock",
  "params": {
    "blockNumber": 825000
  },
  "id": 1
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "result": {
    "blockNumber": 825000,
    "blockHash": "0000000000000000000123...",
    "timestamp": "2024-01-15T14:20:00.000Z",
    "txns": [
      {
        "blockchain": "bitcoin",
        "blockNumber": 825000,
        "transactionHash": "abc123def456...",
        "token": "btc",
        "amount": "6.25",
        "timestamp": "2024-01-15T14:20:00.000Z"
      }
    ]
  },
  "id": 1
}
```

#### `getBlockFromChain(blockNumber: bigint | 'latest'): Promise<Block>`

Retrieves block information directly from the blockchain (bypasses indexer cache).

**Request:**
```json
{
  "jsonrpc": "2.0",
  "method": "getBlockFromChain",
  "params": {
    "blockNumber": "latest"
  },
  "id": 1
}
```

### Health and Status

#### `getDbCoreKey(): Promise<string>`

Returns the Hyperbee database core key for P2P replication.

**Request:**
```json
{
  "jsonrpc": "2.0",
  "method": "getDbCoreKey",
  "params": {},
  "id": 1
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "result": "4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b",
  "id": 1
}
```

## Pagination

All query methods support cursor-based pagination for efficient data retrieval:

```typescript
interface PaginationResponse<T> {
  data: T[];
  pagination: {
    hasNext: boolean;
    cursor?: string;
    limit: number;
    total?: number;
  };
}
```

**Example with pagination:**
```javascript
// First page
const page1 = await indexer.queryTransactions({ limit: 50 });

// Next page  
const page2 = await indexer.queryTransactions({ 
  cursor: page1.pagination.cursor,
  limit: 50 
});
```

## Error Handling

All methods return standard JSON-RPC 2.0 error responses:

```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32600,
    "message": "Invalid Request",
    "data": "Additional error details"
  },
  "id": 1
}
```

### Common Error Codes

| Code | Message | Description |
|------|---------|-------------|
| -32600 | Invalid Request | Malformed JSON-RPC request |
| -32601 | Method not found | Unknown API method |
| -32602 | Invalid params | Invalid method parameters |
| -32603 | Internal error | Server-side processing error |
| -32000 | Invalid address | Address format validation failed |
| -32001 | Transaction not found | Transaction hash not found |
| -32002 | Block not found | Block number not found |

## Chain-Specific Notes

### Bitcoin (BTC)

- **UTXOs**: Single Bitcoin transaction may generate multiple `Transaction` records (one per relevant output)
- **Change Detection**: Outputs to user addresses in spending transactions are marked as direction: 'self'
- **Address Types**: Supports Legacy (1...), SegWit (3...), and Bech32 (bc1...) addresses

### EVM Chains (Ethereum, BSC, Polygon, etc.)

- **Log Index**: Token transfers include `logIndex` field for event log position
- **Contract Addresses**: Token transfers include `contractAddress` in metadata
- **Gas Information**: Includes `gasUsed` in metadata for transaction cost analysis
- **Multiple Transfers**: Single transaction may contain multiple token transfers

### Solana (SOL)

- **Slot-Based**: `blockNumber` represents Solana slots, not traditional blocks
- **Program Instructions**: Complex transactions may include multiple program interactions
- **Account Resolution**: SPL token transfers show actual token account owners, not token accounts
- **Lamports**: Native SOL amounts automatically converted from lamports

### TON

- **Message Chains**: Complex transactions may span multiple blocks via message propagation
- **Jetton Transfers**: Token transfers processed through Jetton wallet contracts
- **Address Formats**: Supports both user-friendly and raw address formats
- **Gas Fees**: Includes detailed gas consumption information

### TRON (TRX)

- **Resource Model**: Includes `energyUsed` and bandwidth consumption in metadata
- **TRC-20 Support**: Token transfers include contract address and event log information
- **Address Format**: Uses Base58 address encoding similar to Bitcoin
- **Sun Conversion**: Native TRX amounts converted from SUN (10^-6 TRX)

### Spark

- **Network Specific**: Optimized for Spark network's consensus mechanism
- **Native Processing**: Focuses on native SPARK token transfers and smart contracts
- **Performance**: Higher throughput settings for Spark's faster block times

## Rate Limiting

API workers implement rate limiting to ensure fair usage:

- **Default Limits**: 100 requests per minute per IP
- **Burst Allowance**: Up to 10 requests in burst
- **Headers**: Rate limit information included in response headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642694400
```

## Authentication

For production deployments, API access can be secured with:

- **API Keys**: Include in `Authorization` header
- **IP Whitelisting**: Restrict access to specific IP ranges
- **JWT Tokens**: For user-specific access control

```http
Authorization: Bearer your-api-key-or-jwt-token
```

## Examples

### JavaScript/Node.js

```javascript
const axios = require('axios');

class WDKIndexerClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async request(method, params) {
    const response = await axios.post(`${this.baseUrl}/rpc`, {
      jsonrpc: '2.0',
      method,
      params,
      id: Date.now()
    });
    
    if (response.data.error) {
      throw new Error(response.data.error.message);
    }
    
    return response.data.result;
  }

  async getBalance(address) {
    return this.request('getBalance', { address });
  }

  async queryTransactions(params) {
    return this.request('queryTransactions', params);
  }
}

// Usage
const indexer = new WDKIndexerClient('http://localhost:8080');
const balance = await indexer.getBalance('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');
console.log(`Balance: ${balance} BTC`);
```

### Python

```python
import requests
import json

class WDKIndexerClient:
    def __init__(self, base_url):
        self.base_url = base_url
    
    def request(self, method, params):
        payload = {
            "jsonrpc": "2.0",
            "method": method,
            "params": params,
            "id": 1
        }
        
        response = requests.post(f"{self.base_url}/rpc", json=payload)
        data = response.json()
        
        if "error" in data:
            raise Exception(data["error"]["message"])
        
        return data["result"]
    
    def get_balance(self, address):
        return self.request("getBalance", {"address": address})
    
    def query_transactions(self, **params):
        return self.request("queryTransactions", params)

# Usage
indexer = WDKIndexerClient("http://localhost:8080")
balance = indexer.get_balance("1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa")
print(f"Balance: {balance} BTC")
```

### cURL

```bash
# Get balance
curl -X POST http://localhost:8080/rpc \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "getBalance",
    "params": {"address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"},
    "id": 1
  }'

# Query transactions
curl -X POST http://localhost:8080/rpc \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "queryTransactions",
    "params": {
      "addresses": ["1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"],
      "limit": 10
    },
    "id": 1
  }'
```

## Best Practices

1. **Batch Requests**: Use `getBalanceMulti` for multiple addresses
2. **Pagination**: Always handle pagination for large datasets
3. **Error Handling**: Implement proper error handling for all API calls
4. **Rate Limiting**: Respect rate limits and implement exponential backoff
5. **Caching**: Cache frequently accessed data on the client side
6. **Connection Pooling**: Use connection pooling for high-volume applications

## Support

For API-specific questions or issues:

- Review chain-specific documentation for unique behaviors
- Check the [troubleshooting guide](../indexer.md#troubleshooting) for common issues
- Refer to the [transaction history integration guide](../transaction-history.md) for implementation patterns
