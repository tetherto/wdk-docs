---
title: Indexer Testing Strategies
description: Comprehensive testing strategies and examples for WDK Indexer deployments, covering unit tests, integration tests, load testing, and chaos engineering.
lastReviewed: 2024-01-15
---

# Indexer Testing Strategies

## Overview

This guide provides comprehensive testing strategies for WDK Indexer deployments across all supported blockchain networks. It covers everything from unit testing to chaos engineering, ensuring your indexer infrastructure is robust and reliable.

**Target Audience**: DevOps engineers, QA engineers, backend developers
**Prerequisites**: Understanding of testing frameworks, WDK Indexer architecture
**Related Documentation**: [Indexer Overview](../indexer.md) | [Deployment Guide](indexer-deployment.md) | [Monitoring Guide](indexer-monitoring.md)

## Table of Contents

1. [Testing Strategy Overview](#testing-strategy-overview)
2. [Unit Testing](#unit-testing)
3. [Integration Testing](#integration-testing)
4. [Load Testing](#load-testing)
5. [Chaos Engineering](#chaos-engineering)
6. [Performance Testing](#performance-testing)
7. [Security Testing](#security-testing)
8. [Continuous Testing](#continuous-testing)

---

## Testing Strategy Overview

### Testing Pyramid for Indexers

```mermaid
graph TD
    subgraph "Testing Pyramid"
        A[Unit Tests<br/>Fast, Isolated, Many]
        B[Integration Tests<br/>Component Interaction, Medium]
        C[End-to-End Tests<br/>Full System, Slow, Few]
        D[Load Tests<br/>Performance Under Stress]
        E[Chaos Tests<br/>Resilience and Recovery]
    end
    
    A --> B
    B --> C
    C --> D
    D --> E
```

### Test Categories by Component

| Component | Unit Tests | Integration Tests | Load Tests | Chaos Tests |
|-----------|------------|-------------------|------------|-------------|
| **Processor Worker** | ✅ Block parsing, data validation | ✅ Blockchain RPC integration | ✅ High-volume sync | ✅ RPC failures |
| **API Worker** | ✅ Query logic, response formatting | ✅ Database queries | ✅ Concurrent requests | ✅ Database partition |
| **Hypercore Storage** | ✅ Data structures | ✅ P2P replication | ✅ Large datasets | ✅ Network splits |
| **REST API** | ✅ Endpoint logic | ✅ Authentication flow | ✅ Traffic spikes | ✅ Service failures |

## Unit Testing

### Processor Worker Tests

```javascript
// processor-worker.test.js
import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { WrkIndexerProc } from '../workers/proc.indexer.wrk';
import { ChainBaseClient } from '../workers/lib/chain.base.client';

describe('WrkIndexerProc', () => {
  let processor;
  let mockChainClient;
  let mockHypercoreDB;

  beforeEach(() => {
    mockChainClient = {
      getLatestBlock: jest.fn(),
      getBlock: jest.fn(),
      getTransactionsByBlock: jest.fn()
    };

    mockHypercoreDB = {
      dbBlocks: { put: jest.fn(), get: jest.fn() },
      dbBlockTs: { put: jest.fn(), get: jest.fn() },
      dbTxBlockMap: { put: jest.fn(), get: jest.fn() }
    };

    processor = new WrkIndexerProc({
      chainClient: mockChainClient,
      hypercore: mockHypercoreDB,
      config: {
        chain: 'bitcoin',
        syncInterval: '*/5 * * * *',
        startBlock: 800000
      }
    });
  });

  describe('Block Processing', () => {
    test('should process new block correctly', async () => {
      const mockBlock = {
        number: 800001,
        hash: '0x123...',
        timestamp: 1642147200,
        transactions: [
          {
            hash: '0xabc...',
            from: '1ABC...',
            to: '1DEF...',
            amount: '0.001'
          }
        ]
      };

      mockChainClient.getLatestBlock.mockResolvedValue({ number: 800001 });
      mockChainClient.getBlock.mockResolvedValue(mockBlock);
      mockHypercoreDB.dbBlocks.get.mockResolvedValue(null); // Block doesn't exist

      await processor.syncTxns();

      // Verify block was stored
      expect(mockHypercoreDB.dbBlocks.put).toHaveBeenCalledWith(
        800001,
        expect.objectContaining({
          hash: '0x123...',
          timestamp: 1642147200
        })
      );

      // Verify transaction mapping was stored
      expect(mockHypercoreDB.dbTxBlockMap.put).toHaveBeenCalledWith(
        '0xabc...',
        800001
      );
    });

    test('should handle blockchain reorganization', async () => {
      const originalBlock = {
        number: 800001,
        hash: '0x123...',
        transactions: []
      };

      const newBlock = {
        number: 800001,
        hash: '0x456...',
        transactions: []
      };

      // First, block exists with different hash
      mockHypercoreDB.dbBlocks.get.mockResolvedValue(originalBlock);
      mockChainClient.getBlock.mockResolvedValue(newBlock);

      await processor.syncTxns();

      // Should detect reorg and update block
      expect(mockHypercoreDB.dbBlocks.put).toHaveBeenCalledWith(
        800001,
        expect.objectContaining({
          hash: '0x456...'
        })
      );
    });

    test('should validate transaction data before storage', async () => {
      const invalidTransaction = {
        hash: '', // Invalid: empty hash
        from: '1ABC...',
        to: '1DEF...',
        amount: 'invalid' // Invalid: non-numeric amount
      };

      const mockBlock = {
        number: 800001,
        hash: '0x123...',
        transactions: [invalidTransaction]
      };

      mockChainClient.getBlock.mockResolvedValue(mockBlock);

      await expect(processor.processBlock(mockBlock))
        .rejects.toThrow('Invalid transaction data');
    });
  });

  describe('Chain-Specific Processing', () => {
    test('Bitcoin UTXO parsing', async () => {
      const btcTransaction = {
        txid: 'abc123...',
        vin: [
          { addresses: ['1ABC...'], value: 50000000 } // 0.5 BTC
        ],
        vout: [
          { addresses: ['1DEF...'], value: 30000000 }, // 0.3 BTC
          { addresses: ['1ABC...'], value: 19990000 }  // 0.19999 BTC (change)
        ]
      };

      const normalized = processor.normalizeTransaction(btcTransaction, 'bitcoin');

      expect(normalized).toEqual({
        hash: 'abc123...',
        blockchain: 'bitcoin',
        inputs: expect.arrayContaining([
          expect.objectContaining({ address: '1ABC...', amount: '0.5' })
        ]),
        outputs: expect.arrayContaining([
          expect.objectContaining({ address: '1DEF...', amount: '0.3' }),
          expect.objectContaining({ address: '1ABC...', amount: '0.19999' })
        ])
      });
    });

    test('Ethereum ERC-20 token transfer parsing', async () => {
      const ethTransaction = {
        hash: '0xdef456...',
        logs: [
          {
            address: '0xA0b86a33e6B8c66e29e8bb8a87e8e76e6d6e5e6f', // USDT contract
            topics: [
              '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', // Transfer event
              '0x000000000000000000000000742d35cc6266c0c7e4c4b5c7f2b8e6f5f8c3e1a2', // From
              '0x000000000000000000000000a0b86a33e6b8c66e29e8bb8a87e8e76e6d6e5e6f'  // To
            ],
            data: '0x00000000000000000000000000000000000000000000d3c21bcecceda1000000' // Amount
          }
        ]
      };

      const normalized = processor.normalizeTransaction(ethTransaction, 'ethereum');

      expect(normalized.tokenTransfers).toContainEqual({
        token: 'usdt',
        from: '0x742d35cc6266c0c7e4c4b5c7f2b8e6f5f8c3e1a2',
        to: '0xa0b86a33e6b8c66e29e8bb8a87e8e76e6d6e5e6f',
        amount: '1000000.000000'
      });
    });
  });

  describe('Error Handling', () => {
    test('should retry on temporary RPC failures', async () => {
      mockChainClient.getLatestBlock
        .mockRejectedValueOnce(new Error('Connection timeout'))
        .mockRejectedValueOnce(new Error('Rate limited'))
        .mockResolvedValue({ number: 800001 });

      await processor.syncTxns();

      expect(mockChainClient.getLatestBlock).toHaveBeenCalledTimes(3);
    });

    test('should handle database write failures gracefully', async () => {
      const mockBlock = { number: 800001, hash: '0x123...', transactions: [] };
      
      mockChainClient.getBlock.mockResolvedValue(mockBlock);
      mockHypercoreDB.dbBlocks.put.mockRejectedValue(new Error('Database error'));

      await expect(processor.processBlock(mockBlock))
        .rejects.toThrow('Database error');
      
      // Should not continue processing if block storage fails
      expect(mockHypercoreDB.dbTxBlockMap.put).not.toHaveBeenCalled();
    });
  });
});
```

### API Worker Tests

```javascript
// api-worker.test.js
import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { WrkIndexerApi } from '../workers/api.indexer.wrk';

describe('WrkIndexerApi', () => {
  let apiWorker;
  let mockHypercoreDB;

  beforeEach(() => {
    mockHypercoreDB = {
      dbBlocks: { get: jest.fn(), createReadStream: jest.fn() },
      dbTxBlockMap: { get: jest.fn() },
      ready: jest.fn().mockResolvedValue()
    };

    apiWorker = new WrkIndexerApi({
      hypercore: mockHypercoreDB,
      config: { chain: 'ethereum' }
    });
  });

  describe('Transaction Queries', () => {
    test('should return transactions for address', async () => {
      const mockTransactions = [
        {
          hash: '0x123...',
          from: '0xabc...',
          to: '0xdef...',
          amount: '100.0',
          token: 'usdt',
          blockNumber: 18500000
        }
      ];

      // Mock database stream
      const mockStream = {
        on: jest.fn((event, callback) => {
          if (event === 'data') {
            mockTransactions.forEach(tx => callback({ key: tx.hash, value: tx }));
          } else if (event === 'end') {
            callback();
          }
        })
      };

      mockHypercoreDB.dbBlocks.createReadStream.mockReturnValue(mockStream);

      const result = await apiWorker.getTransactionsByAddress('0xabc...');

      expect(result.transactions).toHaveLength(1);
      expect(result.transactions[0]).toMatchObject({
        hash: '0x123...',
        direction: 'out', // Address is sender
        amount: '100.0',
        token: 'usdt'
      });
    });

    test('should handle pagination correctly', async () => {
      const transactions = Array.from({ length: 100 }, (_, i) => ({
        hash: `0x${i.toString().padStart(3, '0')}...`,
        blockNumber: 18500000 - i,
        timestamp: new Date(Date.now() - i * 60000).toISOString()
      }));

      const mockStream = {
        on: jest.fn((event, callback) => {
          if (event === 'data') {
            transactions.forEach((tx, i) => callback({ key: i, value: tx }));
          } else if (event === 'end') {
            callback();
          }
        })
      };

      mockHypercoreDB.dbBlocks.createReadStream.mockReturnValue(mockStream);

      // First page
      const firstPage = await apiWorker.getTransactionsByAddress('0xtest...', {
        limit: 50
      });

      expect(firstPage.transactions).toHaveLength(50);
      expect(firstPage.pagination.hasNext).toBe(true);
      expect(firstPage.pagination.cursor).toBeDefined();

      // Second page
      const secondPage = await apiWorker.getTransactionsByAddress('0xtest...', {
        limit: 50,
        cursor: firstPage.pagination.cursor
      });

      expect(secondPage.transactions).toHaveLength(50);
      expect(secondPage.pagination.hasNext).toBe(false);
      
      // Verify no overlap
      const firstHashes = firstPage.transactions.map(tx => tx.hash);
      const secondHashes = secondPage.transactions.map(tx => tx.hash);
      const overlap = firstHashes.filter(hash => secondHashes.includes(hash));
      expect(overlap).toHaveLength(0);
    });

    test('should filter by token type', async () => {
      const mixedTransactions = [
        { hash: '0x1...', token: 'eth', amount: '1.0' },
        { hash: '0x2...', token: 'usdt', amount: '1000.0' },
        { hash: '0x3...', token: 'usdc', amount: '500.0' },
        { hash: '0x4...', token: 'usdt', amount: '2000.0' }
      ];

      const mockStream = {
        on: jest.fn((event, callback) => {
          if (event === 'data') {
            mixedTransactions.forEach(tx => callback({ key: tx.hash, value: tx }));
          } else if (event === 'end') {
            callback();
          }
        })
      };

      mockHypercoreDB.dbBlocks.createReadStream.mockReturnValue(mockStream);

      const result = await apiWorker.getTransactionsByAddress('0xtest...', {
        tokens: ['usdt']
      });

      expect(result.transactions).toHaveLength(2);
      expect(result.transactions.every(tx => tx.token === 'usdt')).toBe(true);
    });
  });

  describe('Balance Queries', () => {
    test('should calculate current balance correctly', async () => {
      const transactions = [
        { direction: 'in', amount: '1000.0', token: 'usdt' },
        { direction: 'out', amount: '300.0', token: 'usdt' },
        { direction: 'in', amount: '500.0', token: 'usdt' },
        { direction: 'out', amount: '150.0', token: 'usdt' }
      ];

      jest.spyOn(apiWorker, 'getTransactionsByAddress')
        .mockResolvedValue({ transactions });

      const balance = await apiWorker.getBalance('0xtest...', 'usdt');

      expect(balance).toBe('1050.0'); // 1000 - 300 + 500 - 150
    });

    test('should handle multiple tokens', async () => {
      const transactions = [
        { direction: 'in', amount: '1.0', token: 'eth' },
        { direction: 'in', amount: '1000.0', token: 'usdt' },
        { direction: 'out', amount: '0.5', token: 'eth' }
      ];

      jest.spyOn(apiWorker, 'getTransactionsByAddress')
        .mockResolvedValue({ transactions });

      const balances = await apiWorker.getAllBalances('0xtest...');

      expect(balances).toEqual({
        eth: '0.5',
        usdt: '1000.0'
      });
    });
  });

  describe('Health Checks', () => {
    test('should report healthy status when sync is current', async () => {
      mockHypercoreDB.dbBlocks.get
        .mockResolvedValueOnce({ number: 18500000 }) // Latest indexed
        .mockResolvedValueOnce({ number: 18500001 }); // Chain tip

      const health = await apiWorker.getHealthStatus();

      expect(health.status).toBe('healthy');
      expect(health.lag).toBe(1);
    });

    test('should report degraded status when lag is high', async () => {
      mockHypercoreDB.dbBlocks.get
        .mockResolvedValueOnce({ number: 18490000 }) // Latest indexed
        .mockResolvedValueOnce({ number: 18500000 }); // Chain tip

      const health = await apiWorker.getHealthStatus();

      expect(health.status).toBe('degraded');
      expect(health.lag).toBe(10000);
    });
  });
});
```

## Integration Testing

### End-to-End Flow Tests

```javascript
// integration.test.js
import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import Docker from 'dockerode';
import { WDKApiClient } from '../src/api-client';

describe('WDK Indexer Integration', () => {
  let docker;
  let containers;
  let apiClient;

  beforeAll(async () => {
    docker = new Docker();
    
    // Start test environment
    containers = await startTestEnvironment();
    
    // Wait for services to be ready
    await waitForServices();
    
    apiClient = new WDKApiClient({
      baseURL: 'http://localhost:8080'
    });
  }, 60000); // 60 second timeout for setup

  afterAll(async () => {
    // Cleanup containers
    await Promise.all(containers.map(container => 
      container.stop().then(() => container.remove())
    ));
  });

  async function startTestEnvironment() {
    const services = [
      {
        name: 'bitcoin-node',
        image: 'bitcoin-regtest:latest',
        ports: { '18443/tcp': 18443 }
      },
      {
        name: 'btc-processor',
        image: 'wdk-indexer:btc',
        environment: [
          'NODE_ENV=test',
          'BTC_RPC_URL=http://bitcoin-node:18443',
          'CHAIN=bitcoin'
        ],
        ports: { '6000/tcp': 6000 }
      },
      {
        name: 'btc-api',
        image: 'wdk-indexer:btc',
        environment: [
          'NODE_ENV=test',
          'WORKER_TYPE=api',
          'PROC_RPC=tcp://btc-processor:6000'
        ],
        ports: { '8080/tcp': 8080 }
      }
    ];

    const containers = [];
    
    for (const service of services) {
      const container = await docker.createContainer({
        Image: service.image,
        name: service.name,
        Env: service.environment,
        ExposedPorts: service.ports,
        HostConfig: {
          PortBindings: Object.entries(service.ports).reduce((bindings, [internal, external]) => {
            bindings[internal] = [{ HostPort: external.toString() }];
            return bindings;
          }, {})
        }
      });
      
      await container.start();
      containers.push(container);
    }

    return containers;
  }

  async function waitForServices() {
    // Wait for API to be responsive
    let retries = 30;
    while (retries > 0) {
      try {
        const response = await fetch('http://localhost:8080/health');
        if (response.ok) break;
      } catch (error) {
        // Service not ready yet
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      retries--;
    }
    
    if (retries === 0) {
      throw new Error('Services failed to start within timeout');
    }
  }

  test('complete transaction indexing flow', async () => {
    // 1. Generate test transaction on regtest network
    const testAddress = await generateTestAddress();
    const txHash = await sendTestTransaction(testAddress, '0.001');
    
    // 2. Wait for indexer to process the transaction
    await waitForTransactionIndexed(txHash);
    
    // 3. Query transaction via API
    const transactions = await apiClient.getTransactionsByAddress(testAddress);
    
    expect(transactions.transactions).toHaveLength(1);
    expect(transactions.transactions[0]).toMatchObject({
      transactionHash: txHash,
      blockchain: 'bitcoin',
      amount: '0.001',
      direction: 'in'
    });
    
    // 4. Verify balance calculation
    const balance = await apiClient.getBalance(testAddress, 'btc');
    expect(balance).toBe('0.001');
  });

  test('handles blockchain reorganization correctly', async () => {
    const testAddress = await generateTestAddress();
    
    // Create transaction
    const originalTx = await sendTestTransaction(testAddress, '0.002');
    await waitForTransactionIndexed(originalTx);
    
    // Force reorganization by invalidating block
    await invalidateLastBlock();
    await generateNewBlock();
    
    // Create new transaction in reorganized chain
    const newTx = await sendTestTransaction(testAddress, '0.003');
    await waitForTransactionIndexed(newTx);
    
    // Verify old transaction is removed and new one exists
    const transactions = await apiClient.getTransactionsByAddress(testAddress);
    
    expect(transactions.transactions).toHaveLength(1);
    expect(transactions.transactions[0].transactionHash).toBe(newTx);
    expect(transactions.transactions[0].amount).toBe('0.003');
  });

  test('pagination works across multiple blocks', async () => {
    const testAddress = await generateTestAddress();
    
    // Generate 100 transactions across multiple blocks
    const txHashes = [];
    for (let i = 0; i < 100; i++) {
      const txHash = await sendTestTransaction(testAddress, '0.001');
      txHashes.push(txHash);
      
      if (i % 10 === 9) {
        await generateNewBlock(); // Group transactions into blocks
      }
    }
    
    // Wait for all transactions to be indexed
    await Promise.all(txHashes.map(hash => waitForTransactionIndexed(hash)));
    
    // Test pagination
    const firstPage = await apiClient.getTransactionsByAddress(testAddress, {
      limit: 50
    });
    
    expect(firstPage.transactions).toHaveLength(50);
    expect(firstPage.pagination.hasNext).toBe(true);
    
    const secondPage = await apiClient.getTransactionsByAddress(testAddress, {
      limit: 50,
      cursor: firstPage.pagination.cursor
    });
    
    expect(secondPage.transactions).toHaveLength(50);
    expect(secondPage.pagination.hasNext).toBe(false);
    
    // Verify no duplicates
    const allTxHashes = [
      ...firstPage.transactions.map(tx => tx.transactionHash),
      ...secondPage.transactions.map(tx => tx.transactionHash)
    ];
    
    expect(new Set(allTxHashes)).toHaveLength(100);
  });

  // Helper functions
  async function generateTestAddress() {
    const response = await fetch('http://localhost:18443/wallet/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'getnewaddress',
        params: [],
        id: 1
      })
    });
    
    const data = await response.json();
    return data.result;
  }

  async function sendTestTransaction(address, amount) {
    const response = await fetch('http://localhost:18443/wallet/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'sendtoaddress',
        params: [address, parseFloat(amount)],
        id: 1
      })
    });
    
    const data = await response.json();
    return data.result;
  }

  async function waitForTransactionIndexed(txHash) {
    let retries = 30;
    while (retries > 0) {
      try {
        const response = await apiClient.getTransaction(txHash);
        if (response) return;
      } catch (error) {
        // Transaction not indexed yet
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      retries--;
    }
    
    throw new Error(`Transaction ${txHash} not indexed within timeout`);
  }
});
```

## Load Testing

### Performance Testing with Artillery

```yaml
# artillery-load-test.yml
config:
  target: 'http://localhost:8080'
  phases:
    # Warm up
    - duration: 60
      arrivalRate: 5
      name: "Warm up"
    
    # Gradual load increase
    - duration: 300
      arrivalRate: 10
      rampTo: 50
      name: "Ramp up"
    
    # Sustained load
    - duration: 600
      arrivalRate: 50
      name: "Sustained load"
    
    # Peak load
    - duration: 180
      arrivalRate: 50
      rampTo: 200
      name: "Peak load"
    
    # Cool down
    - duration: 120
      arrivalRate: 200
      rampTo: 10
      name: "Cool down"

  plugins:
    metrics-by-endpoint: {}
    expect: {}
    
  variables:
    testAddresses:
      - "1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2"
      - "3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy"
      - "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq"

scenarios:
  - name: "Transaction History Queries"
    weight: 60
    requests:
      - get:
          url: "/v1/transactions"
          qs:
            address: "{{ testAddresses }}"
            limit: "{{ $randomInt(10, 100) }}"
          expect:
            - statusCode: 200
            - hasProperty: "transactions"
            - hasProperty: "pagination"
          capture:
            - json: "$.pagination.cursor"
              as: "cursor"
      
      # Follow-up pagination request
      - get:
          url: "/v1/transactions"
          qs:
            address: "{{ testAddresses }}"
            cursor: "{{ cursor }}"
            limit: "50"
          ifTrue: "{{ cursor }}"
          expect:
            - statusCode: 200

  - name: "Balance Queries"
    weight: 30
    requests:
      - get:
          url: "/v1/balance"
          qs:
            address: "{{ testAddresses }}"
            token: "{{ $pick(['btc', 'eth', 'usdt', 'usdc']) }}"
          expect:
            - statusCode: 200
            - hasProperty: "balance"

  - name: "Health Checks"
    weight: 10
    requests:
      - get:
          url: "/health"
          expect:
            - statusCode: 200
            - hasProperty: "status"
```

### Load Testing with Custom Scripts

```javascript
// load-test.js
import autocannon from 'autocannon';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class IndexerLoadTest {
  constructor(config) {
    this.config = {
      url: 'http://localhost:8080',
      connections: 50,
      duration: 300, // 5 minutes
      ...config
    };
    
    this.testAddresses = [
      '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
      '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
      'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq'
    ];
  }

  async runTransactionHistoryTest() {
    console.log('🚀 Running transaction history load test...');
    
    const result = await autocannon({
      url: this.config.url,
      connections: this.config.connections,
      duration: this.config.duration,
      requests: [
        {
          method: 'GET',
          path: '/v1/transactions',
          setupRequest: (req) => {
            const address = this.testAddresses[Math.floor(Math.random() * this.testAddresses.length)];
            const limit = Math.floor(Math.random() * 90) + 10; // 10-100
            req.path += `?address=${address}&limit=${limit}`;
            return req;
          }
        }
      ]
    });

    this.analyzeResults('Transaction History', result);
    return result;
  }

  async runBalanceQueryTest() {
    console.log('💰 Running balance query load test...');
    
    const result = await autocannon({
      url: this.config.url,
      connections: this.config.connections,
      duration: this.config.duration,
      requests: [
        {
          method: 'GET',
          path: '/v1/balance',
          setupRequest: (req) => {
            const address = this.testAddresses[Math.floor(Math.random() * this.testAddresses.length)];
            const tokens = ['btc', 'eth', 'usdt', 'usdc'];
            const token = tokens[Math.floor(Math.random() * tokens.length)];
            req.path += `?address=${address}&token=${token}`;
            return req;
          }
        }
      ]
    });

    this.analyzeResults('Balance Queries', result);
    return result;
  }

  async runMixedWorkloadTest() {
    console.log('🔀 Running mixed workload test...');
    
    const result = await autocannon({
      url: this.config.url,
      connections: this.config.connections,
      duration: this.config.duration,
      requests: [
        // 70% transaction history queries
        {
          method: 'GET',
          path: '/v1/transactions',
          weight: 70,
          setupRequest: (req) => {
            const address = this.testAddresses[Math.floor(Math.random() * this.testAddresses.length)];
            req.path += `?address=${address}&limit=50`;
            return req;
          }
        },
        // 20% balance queries
        {
          method: 'GET',
          path: '/v1/balance',
          weight: 20,
          setupRequest: (req) => {
            const address = this.testAddresses[Math.floor(Math.random() * this.testAddresses.length)];
            req.path += `?address=${address}&token=btc`;
            return req;
          }
        },
        // 10% health checks
        {
          method: 'GET',
          path: '/health',
          weight: 10
        }
      ]
    });

    this.analyzeResults('Mixed Workload', result);
    return result;
  }

  analyzeResults(testName, result) {
    console.log(`\n📊 ${testName} Results:`);
    console.log(`Requests/sec: ${result.requests.average}`);
    console.log(`Latency P50: ${result.latency.p50}ms`);
    console.log(`Latency P95: ${result.latency.p95}ms`);
    console.log(`Latency P99: ${result.latency.p99}ms`);
    console.log(`Error rate: ${(result.errors / result.requests.total * 100).toFixed(2)}%`);
    
    // Performance assertions
    if (result.requests.average < 100) {
      console.warn('⚠️  Warning: Request rate below 100 req/s');
    }
    
    if (result.latency.p95 > 1000) {
      console.warn('⚠️  Warning: P95 latency above 1000ms');
    }
    
    if (result.errors / result.requests.total > 0.01) {
      console.warn('⚠️  Warning: Error rate above 1%');
    }
  }

  async runAllTests() {
    const results = {};
    
    results.transactionHistory = await this.runTransactionHistoryTest();
    await this.wait(30000); // 30 second break
    
    results.balanceQueries = await this.runBalanceQueryTest();
    await this.wait(30000);
    
    results.mixedWorkload = await this.runMixedWorkloadTest();
    
    this.generateReport(results);
    return results;
  }

  generateReport(results) {
    const report = {
      timestamp: new Date().toISOString(),
      configuration: this.config,
      summary: Object.entries(results).map(([test, result]) => ({
        test,
        requestsPerSecond: result.requests.average,
        p95Latency: result.latency.p95,
        errorRate: (result.errors / result.requests.total * 100).toFixed(2) + '%'
      }))
    };
    
    console.log('\n📋 Performance Report:');
    console.log(JSON.stringify(report, null, 2));
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run load tests
async function runLoadTests() {
  const loadTest = new IndexerLoadTest({
    url: process.env.INDEXER_URL || 'http://localhost:8080',
    connections: parseInt(process.env.CONNECTIONS) || 50,
    duration: parseInt(process.env.DURATION) || 300
  });

  try {
    await loadTest.runAllTests();
    console.log('✅ Load testing completed successfully');
  } catch (error) {
    console.error('❌ Load testing failed:', error);
    process.exit(1);
  }
}

if (process.argv[1] === __filename) {
  runLoadTests();
}

export default IndexerLoadTest;
```

## Chaos Engineering

### Chaos Testing Framework

```javascript
// chaos-testing.js
import { ChaosToolkit } from '@chaostoolkit/chaostoolkit';
import Docker from 'dockerode';

class IndexerChaosTests {
  constructor(config) {
    this.config = config;
    this.docker = new Docker();
    this.chaos = new ChaosToolkit(config);
  }

  async testProcessorWorkerFailure() {
    console.log('🔥 Testing processor worker failure...');
    
    // Kill random processor workers
    await this.chaos.killRandomPods({
      labelSelector: 'app=wdk-indexer,type=processor',
      percentage: 50
    });

    // Verify API workers continue serving cached data
    const apiResponse = await this.makeAPIRequest('/v1/transactions');
    expect(apiResponse.status).toBe(200);
    expect(apiResponse.data.source).toBeOneOf(['cache', 'replica']);

    // Verify automatic recovery
    await this.waitForRecovery('processor', '5m');
    
    const healthResponse = await this.makeAPIRequest('/health');
    expect(healthResponse.status).toBe(200);
    expect(healthResponse.data.status).toBe('healthy');
  }

  async testDatabasePartition() {
    console.log('🔥 Testing database network partition...');
    
    // Introduce network latency to Hypercore storage
    await this.chaos.introduceNetworkLatency({
      target: 'hypercore-storage',
      latency: '2000ms',
      jitter: '500ms',
      duration: '3m'
    });

    // API should timeout gracefully
    const start = Date.now();
    const response = await this.makeAPIRequest('/v1/transactions');
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(10000); // 10s timeout
    expect(response.status).toBeOneOf([200, 503]);
    
    if (response.status === 200) {
      expect(response.data.source).toBe('cache');
    }
  }

  async testMemoryExhaustion() {
    console.log('🔥 Testing memory exhaustion...');
    
    // Fill up memory on API workers
    await this.chaos.consumeMemory({
      target: 'wdk-indexer-api',
      percentage: 95,
      duration: '2m'
    });

    // Kubernetes should restart pods
    await this.waitForPodRecovery('wdk-indexer-api', '3m');
    
    // Service should recover
    const response = await this.makeAPIRequest('/health');
    expect(response.status).toBe(200);
    expect(response.data.status).toBeOneOf(['healthy', 'recovering']);
  }

  async testBlockchainRPCFailure() {
    console.log('🔥 Testing blockchain RPC failure...');
    
    // Block access to blockchain RPC endpoints
    await this.chaos.blockNetworkTraffic({
      target: 'processor-workers',
      destinationPorts: [8332, 8545, 8899], // BTC, ETH, SOL RPC ports
      duration: '2m'
    });

    // Processors should handle gracefully
    await this.wait(30000); // Wait 30 seconds

    const healthResponse = await this.makeAPIRequest('/health');
    expect(healthResponse.status).toBe(200);
    
    // Should report degraded but not failed
    expect(healthResponse.data.status).toBeOneOf(['degraded', 'healthy']);
    
    // Check that lag doesn't grow excessively
    if (healthResponse.data.lag) {
      expect(healthResponse.data.lag).toBeLessThan(1000);
    }
  }

  async testHighTrafficSpike() {
    console.log('🔥 Testing traffic spike handling...');
    
    // Generate 10x normal traffic
    const promises = [];
    for (let i = 0; i < 1000; i++) {
      promises.push(this.makeAPIRequest('/v1/transactions'));
    }
    
    const responses = await Promise.allSettled(promises);
    const successful = responses.filter(r => 
      r.status === 'fulfilled' && r.value.status === 200
    ).length;
    const rateLimited = responses.filter(r => 
      r.status === 'fulfilled' && r.value.status === 429
    ).length;
    
    // Should handle gracefully with rate limiting
    expect(successful + rateLimited).toBe(1000);
    expect(rateLimited).toBeGreaterThan(0); // Rate limiting should kick in
    expect(successful).toBeGreaterThan(500); // At least 50% success
  }

  async testP2PNetworkPartition() {
    console.log('🔥 Testing P2P network partition...');
    
    // Split Hypercore peers into isolated groups
    await this.chaos.partitionNetwork({
      groups: [
        ['hypercore-peer-1', 'hypercore-peer-2'],
        ['hypercore-peer-3', 'hypercore-peer-4']
      ],
      duration: '5m'
    });

    // Each group should continue operating independently
    const responses = await Promise.all([
      this.makeAPIRequest('/v1/transactions', 'group-1'),
      this.makeAPIRequest('/v1/transactions', 'group-2')
    ]);

    responses.forEach(response => {
      expect(response.status).toBe(200);
    });

    // After healing, data should sync
    await this.chaos.healNetwork();
    await this.wait(120000); // Wait 2 minutes for sync
    
    const finalResponse = await this.makeAPIRequest('/health');
    expect(finalResponse.data.status).toBe('healthy');
  }

  async testDiskSpaceExhaustion() {
    console.log('🔥 Testing disk space exhaustion...');
    
    // Fill up disk on storage nodes
    await this.chaos.fillDisk({
      target: 'hypercore-storage',
      percentage: 95,
      duration: '1m'
    });

    // System should handle gracefully
    const response = await this.makeAPIRequest('/health');
    expect(response.status).toBe(200);
    
    // Should report storage issues
    expect(response.data.storage?.status).toBeOneOf(['degraded', 'critical']);
    
    // API should still serve cached data
    const txResponse = await this.makeAPIRequest('/v1/transactions');
    expect(txResponse.status).toBe(200);
  }

  // Helper methods
  async makeAPIRequest(endpoint, group = 'default') {
    const baseUrls = {
      'default': this.config.apiBaseUrl,
      'group-1': this.config.group1ApiUrl,
      'group-2': this.config.group2ApiUrl
    };
    
    try {
      const response = await fetch(`${baseUrls[group]}${endpoint}`, {
        timeout: 10000
      });
      
      return {
        status: response.status,
        data: await response.json()
      };
    } catch (error) {
      return {
        status: 0,
        error: error.message
      };
    }
  }

  async waitForRecovery(service, timeout) {
    const timeoutMs = this.parseTimeout(timeout);
    const start = Date.now();
    
    while (Date.now() - start < timeoutMs) {
      try {
        const health = await this.makeAPIRequest('/health');
        if (health.status === 200 && health.data.status === 'healthy') {
          return;
        }
      } catch (error) {
        // Still recovering
      }
      
      await this.wait(5000); // Check every 5 seconds
    }
    
    throw new Error(`Service ${service} failed to recover within ${timeout}`);
  }

  async waitForPodRecovery(podSelector, timeout) {
    // Implementation depends on Kubernetes client
    // This is a simplified version
    const timeoutMs = this.parseTimeout(timeout);
    const start = Date.now();
    
    while (Date.now() - start < timeoutMs) {
      const pods = await this.chaos.getPods(podSelector);
      const healthyPods = pods.filter(pod => pod.status === 'Running');
      
      if (healthyPods.length > 0) {
        return;
      }
      
      await this.wait(5000);
    }
    
    throw new Error(`Pods ${podSelector} failed to recover within ${timeout}`);
  }

  parseTimeout(timeout) {
    const match = timeout.match(/(\d+)([sm])/);
    if (!match) return 60000; // Default 1 minute
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    return unit === 's' ? value * 1000 : value * 60 * 1000;
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run chaos tests
async function runChaosTests() {
  const chaos = new IndexerChaosTests({
    apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:8080',
    group1ApiUrl: process.env.GROUP1_API_URL,
    group2ApiUrl: process.env.GROUP2_API_URL
  });

  const tests = [
    () => chaos.testProcessorWorkerFailure(),
    () => chaos.testDatabasePartition(),
    () => chaos.testMemoryExhaustion(),
    () => chaos.testBlockchainRPCFailure(),
    () => chaos.testHighTrafficSpike(),
    () => chaos.testP2PNetworkPartition(),
    () => chaos.testDiskSpaceExhaustion()
  ];

  for (const test of tests) {
    try {
      await test();
      console.log('✅ Test passed');
    } catch (error) {
      console.error('❌ Test failed:', error);
    }
    
    // Recovery time between tests
    await chaos.wait(30000);
  }
  
  console.log('🎉 All chaos tests completed');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runChaosTests().catch(console.error);
}

export default IndexerChaosTests;
```

## Performance Testing

### Benchmark Suite

```javascript
// benchmark.js
import { performance } from 'perf_hooks';
import autocannon from 'autocannon';

class IndexerBenchmark {
  constructor(config) {
    this.config = {
      url: 'http://localhost:8080',
      ...config
    };
    
    this.benchmarks = new Map();
  }

  async benchmarkTransactionRetrieval() {
    console.log('📈 Benchmarking transaction retrieval...');
    
    const scenarios = [
      { name: 'Small result set (10 txs)', params: { limit: 10 } },
      { name: 'Medium result set (50 txs)', params: { limit: 50 } },
      { name: 'Large result set (200 txs)', params: { limit: 200 } },
      { name: 'With token filter', params: { limit: 50, tokens: 'usdt' } },
      { name: 'With date range', params: { 
        limit: 50, 
        fromDate: '2024-01-01T00:00:00Z',
        toDate: '2024-01-31T23:59:59Z'
      }}
    ];

    for (const scenario of scenarios) {
      const result = await this.runBenchmark(
        'GET',
        '/v1/transactions',
        scenario.params,
        scenario.name
      );
      
      this.benchmarks.set(scenario.name, result);
    }
  }

  async benchmarkBalanceQueries() {
    console.log('💰 Benchmarking balance queries...');
    
    const scenarios = [
      { name: 'Single token balance', params: { token: 'btc' } },
      { name: 'All tokens balance', params: {} }
    ];

    for (const scenario of scenarios) {
      const result = await this.runBenchmark(
        'GET',
        '/v1/balance',
        { address: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2', ...scenario.params },
        `Balance: ${scenario.name}`
      );
      
      this.benchmarks.set(`Balance: ${scenario.name}`, result);
    }
  }

  async benchmarkConcurrentUsers() {
    console.log('👥 Benchmarking concurrent users...');
    
    const userCounts = [10, 50, 100, 200];
    
    for (const users of userCounts) {
      const result = await autocannon({
        url: this.config.url,
        connections: users,
        duration: 60,
        requests: [
          {
            method: 'GET',
            path: '/v1/transactions?address=1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2&limit=50'
          }
        ]
      });

      this.benchmarks.set(`${users} concurrent users`, {
        requestsPerSecond: result.requests.average,
        p95Latency: result.latency.p95,
        errorRate: (result.errors / result.requests.total * 100).toFixed(2)
      });
    }
  }

  async benchmarkDatabaseOperations() {
    console.log('🗄️ Benchmarking database operations...');
    
    // This would require direct access to the database layer
    // Simulated here for demonstration
    
    const operations = [
      'Single block lookup',
      'Transaction range query',
      'Address index scan',
      'Balance calculation'
    ];

    for (const operation of operations) {
      const start = performance.now();
      
      // Simulate database operation
      await this.simulateDBOperation(operation);
      
      const end = performance.now();
      const duration = end - start;
      
      this.benchmarks.set(`DB: ${operation}`, {
        duration: `${duration.toFixed(2)}ms`,
        throughput: `${(1000 / duration).toFixed(0)} ops/sec`
      });
    }
  }

  async runBenchmark(method, path, params, name) {
    const url = new URL(path, this.config.url);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const start = performance.now();
    
    const response = await fetch(url.toString(), { method });
    const data = await response.json();
    
    const end = performance.now();
    const duration = end - start;

    return {
      duration: `${duration.toFixed(2)}ms`,
      status: response.status,
      dataSize: JSON.stringify(data).length,
      recordCount: data.transactions?.length || 1
    };
  }

  async simulateDBOperation(operation) {
    // Simulate different database operations
    const delays = {
      'Single block lookup': 5,
      'Transaction range query': 20,
      'Address index scan': 50,
      'Balance calculation': 15
    };
    
    await new Promise(resolve => 
      setTimeout(resolve, delays[operation] || 10)
    );
  }

  generateReport() {
    console.log('\n📊 Performance Benchmark Report');
    console.log('='.repeat(50));
    
    for (const [benchmark, result] of this.benchmarks) {
      console.log(`\n${benchmark}:`);
      
      if (typeof result === 'object') {
        Object.entries(result).forEach(([key, value]) => {
          console.log(`  ${key}: ${value}`);
        });
      } else {
        console.log(`  Result: ${result}`);
      }
    }
    
    this.generateRecommendations();
  }

  generateRecommendations() {
    console.log('\n💡 Performance Recommendations:');
    
    // Analyze results and provide recommendations
    const txBenchmarks = Array.from(this.benchmarks.entries())
      .filter(([name]) => name.includes('result set'));
    
    if (txBenchmarks.length > 0) {
      const avgDuration = txBenchmarks.reduce((sum, [, result]) => {
        return sum + parseFloat(result.duration);
      }, 0) / txBenchmarks.length;
      
      if (avgDuration > 500) {
        console.log('- Consider adding database indexes for transaction queries');
        console.log('- Implement result caching for frequently accessed data');
      }
      
      if (avgDuration > 1000) {
        console.log('- Consider pagination limits to reduce response size');
        console.log('- Implement query optimization');
      }
    }
    
    const concurrentBenchmarks = Array.from(this.benchmarks.entries())
      .filter(([name]) => name.includes('concurrent users'));
    
    if (concurrentBenchmarks.length > 0) {
      const highLoadResults = concurrentBenchmarks.filter(([name, result]) => {
        const users = parseInt(name.split(' ')[0]);
        return users >= 100 && parseFloat(result.errorRate) > 1;
      });
      
      if (highLoadResults.length > 0) {
        console.log('- Scale horizontal replicas for high-load scenarios');
        console.log('- Implement connection pooling');
        console.log('- Consider load balancing strategies');
      }
    }
  }

  async runAllBenchmarks() {
    await this.benchmarkTransactionRetrieval();
    await this.benchmarkBalanceQueries();
    await this.benchmarkConcurrentUsers();
    await this.benchmarkDatabaseOperations();
    
    this.generateReport();
  }
}

// Run benchmarks
async function runBenchmarks() {
  const benchmark = new IndexerBenchmark({
    url: process.env.INDEXER_URL || 'http://localhost:8080'
  });

  try {
    await benchmark.runAllBenchmarks();
    console.log('\n✅ Benchmarking completed successfully');
  } catch (error) {
    console.error('❌ Benchmarking failed:', error);
    process.exit(1);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runBenchmarks();
}

export default IndexerBenchmark;
```

## Security Testing

### Security Test Suite

```javascript
// security-tests.js
import { describe, test, expect } from '@jest/globals';

describe('Indexer Security Tests', () => {
  const baseURL = process.env.INDEXER_URL || 'http://localhost:8080';

  describe('Authentication & Authorization', () => {
    test('should reject requests without authentication', async () => {
      const response = await fetch(`${baseURL}/v1/transactions`);
      expect(response.status).toBe(401);
    });

    test('should reject requests with invalid tokens', async () => {
      const response = await fetch(`${baseURL}/v1/transactions`, {
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      });
      expect(response.status).toBe(401);
    });

    test('should validate token permissions', async () => {
      const limitedToken = await generateLimitedToken(['read:balance']);
      
      const response = await fetch(`${baseURL}/v1/transactions`, {
        headers: {
          'Authorization': `Bearer ${limitedToken}`
        }
      });
      
      expect(response.status).toBe(403);
    });
  });

  describe('Input Validation', () => {
    test('should reject invalid address formats', async () => {
      const invalidAddresses = [
        'invalid-address',
        '0x123', // Too short
        '1' + 'a'.repeat(100), // Too long
        '<script>alert("xss")</script>',
        'DROP TABLE transactions;'
      ];

      for (const address of invalidAddresses) {
        const response = await fetch(
          `${baseURL}/v1/transactions?address=${encodeURIComponent(address)}`,
          { headers: { 'Authorization': `Bearer ${validToken}` } }
        );
        
        expect(response.status).toBe(400);
      }
    });

    test('should sanitize and validate query parameters', async () => {
      const maliciousParams = [
        'limit=999999999', // Excessive limit
        'cursor=../../../etc/passwd',
        'tokens=<script>alert(1)</script>',
        'fromDate=2024-13-45T99:99:99Z' // Invalid date
      ];

      for (const param of maliciousParams) {
        const response = await fetch(
          `${baseURL}/v1/transactions?${param}`,
          { headers: { 'Authorization': `Bearer ${validToken}` } }
        );
        
        expect(response.status).toBeOneOf([400, 422]);
      }
    });

    test('should prevent SQL injection attempts', async () => {
      const sqlInjections = [
        "'; DROP TABLE transactions; --",
        "1' OR '1'='1",
        "UNION SELECT * FROM users",
        "1; INSERT INTO transactions VALUES ('fake')"
      ];

      for (const injection of sqlInjections) {
        const response = await fetch(
          `${baseURL}/v1/transactions?address=${encodeURIComponent(injection)}`,
          { headers: { 'Authorization': `Bearer ${validToken}` } }
        );
        
        expect(response.status).toBe(400);
      }
    });
  });

  describe('Rate Limiting', () => {
    test('should enforce rate limits per user', async () => {
      const token = await generateValidToken();
      const promises = [];
      
      // Make 200 rapid requests
      for (let i = 0; i < 200; i++) {
        promises.push(
          fetch(`${baseURL}/v1/transactions`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        );
      }
      
      const responses = await Promise.all(promises);
      const rateLimited = responses.filter(r => r.status === 429);
      
      expect(rateLimited.length).toBeGreaterThan(0);
    });

    test('should implement progressive rate limiting', async () => {
      const token = await generateValidToken();
      
      // First burst should be allowed
      const firstBurst = await Promise.all(
        Array(10).fill().map(() => 
          fetch(`${baseURL}/v1/transactions`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        )
      );
      
      const firstBurstSuccess = firstBurst.filter(r => r.status === 200);
      expect(firstBurstSuccess.length).toBeGreaterThan(5);
      
      // Immediate second burst should be throttled
      const secondBurst = await Promise.all(
        Array(10).fill().map(() => 
          fetch(`${baseURL}/v1/transactions`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        )
      );
      
      const secondBurstThrottled = secondBurst.filter(r => r.status === 429);
      expect(secondBurstThrottled.length).toBeGreaterThan(0);
    });
  });

  describe('Data Privacy', () => {
    test('should not expose sensitive information in errors', async () => {
      const response = await fetch(`${baseURL}/v1/internal-debug`, {
        headers: { 'Authorization': `Bearer ${validToken}` }
      });
      
      expect(response.status).toBe(404);
      
      const body = await response.text();
      expect(body).not.toMatch(/database|password|secret|key/i);
    });

    test('should not leak user data in logs', async () => {
      // This test would require access to log monitoring
      // Implementation depends on logging infrastructure
      const logEntries = await getRecentLogEntries();
      
      const suspiciousEntries = logEntries.filter(entry => 
        /\b[13][a-km-zA-HJ-NP-Z1-9]{25,34}\b/.test(entry) || // Bitcoin addresses
        /\b0x[a-fA-F0-9]{40}\b/.test(entry) // Ethereum addresses
      );
      
      expect(suspiciousEntries).toHaveLength(0);
    });

    test('should implement proper CORS headers', async () => {
      const response = await fetch(`${baseURL}/v1/transactions`, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'https://malicious-site.com',
          'Access-Control-Request-Method': 'GET'
        }
      });
      
      const corsHeader = response.headers.get('Access-Control-Allow-Origin');
      expect(corsHeader).not.toBe('*');
      expect(corsHeader).not.toBe('https://malicious-site.com');
    });
  });

  describe('Infrastructure Security', () => {
    test('should reject requests to internal endpoints', async () => {
      const internalEndpoints = [
        '/metrics',
        '/debug/pprof',
        '/health/internal',
        '/admin',
        '/.env',
        '/config'
      ];

      for (const endpoint of internalEndpoints) {
        const response = await fetch(`${baseURL}${endpoint}`);
        expect(response.status).toBeOneOf([404, 403]);
      }
    });

    test('should implement proper TLS configuration', async () => {
      if (baseURL.startsWith('https://')) {
        const url = new URL(baseURL);
        const response = await fetch(url.toString());
        
        // Check for security headers
        expect(response.headers.get('Strict-Transport-Security')).toBeTruthy();
        expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
        expect(response.headers.get('X-Frame-Options')).toBeTruthy();
      }
    });

    test('should validate request size limits', async () => {
      const largePayload = 'x'.repeat(10 * 1024 * 1024); // 10MB
      
      const response = await fetch(`${baseURL}/v1/transactions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${validToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: largePayload })
      });
      
      expect(response.status).toBeOneOf([413, 400, 405]); // Payload too large or method not allowed
    });
  });

  // Helper functions
  async function generateValidToken() {
    // Implementation depends on your auth system
    return 'valid-test-token';
  }

  async function generateLimitedToken(scopes) {
    // Implementation depends on your auth system
    return 'limited-test-token';
  }

  async function getRecentLogEntries() {
    // Implementation depends on your logging system
    return [];
  }
});
```

## Continuous Testing

### CI/CD Pipeline Configuration

```yaml
# .github/workflows/indexer-tests.yml
name: Indexer Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '0 2 * * *' # Nightly tests

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        chain: [bitcoin, ethereum, solana, ton, tron]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run unit tests
      run: npm run test:unit -- --chain=${{ matrix.chain }}
      
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
        flags: unit-tests-${{ matrix.chain }}

  integration-tests:
    runs-on: ubuntu-latest
    needs: unit-tests
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup test environment
      run: |
        docker-compose -f docker-compose.test.yml up -d
        ./scripts/wait-for-services.sh
    
    - name: Run integration tests
      run: npm run test:integration
      env:
        DATABASE_URL: postgres://postgres:test@localhost:5432/test
        REDIS_URL: redis://localhost:6379
    
    - name: Cleanup
      if: always()
      run: docker-compose -f docker-compose.test.yml down

  load-tests:
    runs-on: ubuntu-latest
    needs: integration-tests
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup load test environment
      run: |
        docker-compose -f docker-compose.loadtest.yml up -d
        ./scripts/wait-for-services.sh
    
    - name: Run load tests
      run: |
        npm run test:load
        npm run test:benchmark
    
    - name: Upload results
      uses: actions/upload-artifact@v3
      with:
        name: load-test-results
        path: results/
    
    - name: Cleanup
      if: always()
      run: docker-compose -f docker-compose.loadtest.yml down

  security-tests:
    runs-on: ubuntu-latest
    needs: integration-tests
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Run security scan
      uses: securecodewarrior/github-action-add-sarif@v1
      with:
        sarif-file: security-scan-results.sarif
    
    - name: Run dependency audit
      run: npm audit --audit-level moderate
    
    - name: Run security tests
      run: npm run test:security

  chaos-tests:
    runs-on: ubuntu-latest
    needs: [integration-tests, load-tests]
    if: github.event_name == 'schedule' # Only run nightly
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup chaos testing
      run: |
        kubectl create namespace chaos-testing
        kubectl apply -f k8s/chaos-testing/
    
    - name: Run chaos experiments
      run: |
        npm run test:chaos
        kubectl logs -n chaos-testing -l app=chaos-test
    
    - name: Cleanup chaos environment
      if: always()
      run: kubectl delete namespace chaos-testing

  performance-regression:
    runs-on: ubuntu-latest
    needs: load-tests
    
    steps:
    - uses: actions/checkout@v3
      with:
        fetch-depth: 0 # Need history for comparison
    
    - name: Run performance comparison
      run: |
        npm run test:performance-regression
        npm run analyze:performance-trends
    
    - name: Comment on PR
      if: github.event_name == 'pull_request'
      uses: actions/github-script@v6
      with:
        script: |
          const fs = require('fs');
          const results = JSON.parse(fs.readFileSync('performance-comparison.json'));
          
          let comment = '## Performance Impact\n\n';
          
          if (results.regression > 10) {
            comment += '⚠️ **Performance regression detected**\n\n';
          } else if (results.improvement > 5) {
            comment += '✅ **Performance improvement detected**\n\n';
          } else {
            comment += '➡️ **No significant performance change**\n\n';
          }
          
          comment += `- Response time change: ${results.responseTimeChange}%\n`;
          comment += `- Throughput change: ${results.throughputChange}%\n`;
          comment += `- Error rate change: ${results.errorRateChange}%\n`;
          
          github.rest.issues.createComment({
            issue_number: context.issue.number,
            owner: context.repo.owner,
            repo: context.repo.repo,
            body: comment
          });
```

### Test Environment Management

```bash
#!/bin/bash
# scripts/test-environment.sh

set -e

COMMAND=${1:-help}

case $COMMAND in
  "setup")
    echo "🚀 Setting up test environment..."
    
    # Start test infrastructure
    docker-compose -f docker-compose.test.yml up -d
    
    # Wait for services
    ./scripts/wait-for-services.sh
    
    # Initialize test data
    npm run test:seed-data
    
    echo "✅ Test environment ready"
    ;;
    
  "teardown")
    echo "🧹 Tearing down test environment..."
    
    docker-compose -f docker-compose.test.yml down -v
    docker system prune -f
    
    echo "✅ Test environment cleaned up"
    ;;
    
  "reset")
    echo "🔄 Resetting test environment..."
    
    $0 teardown
    $0 setup
    ;;
    
  "run-all")
    echo "🧪 Running all test suites..."
    
    npm run test:unit
    npm run test:integration
    npm run test:load
    npm run test:security
    
    echo "✅ All tests completed"
    ;;
    
  "help"|*)
    echo "Test Environment Management"
    echo ""
    echo "Usage: $0 {setup|teardown|reset|run-all|help}"
    echo ""
    echo "Commands:"
    echo "  setup     - Start test environment"
    echo "  teardown  - Stop and clean up test environment"
    echo "  reset     - Reset test environment (teardown + setup)"
    echo "  run-all   - Run all test suites"
    echo "  help      - Show this help message"
    ;;
esac
```

---

> **Next Steps**: Implement these testing strategies in your CI/CD pipeline and adapt them to your specific infrastructure. For operational guidance, see [Monitoring](indexer-monitoring.md) and [Troubleshooting](indexer-troubleshooting.md) guides. 