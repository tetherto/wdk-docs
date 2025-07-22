# WDK Indexer Performance Optimization

## Overview

This guide covers performance optimization strategies, tuning parameters, and benchmarking practices for WDK Indexers across all supported blockchain networks. While each chain has unique characteristics, the fundamental performance principles and optimization techniques remain consistent.

> **Repository Context**: Sync frequencies, worker types, and chain-specific implementations are based on actual repository code. Performance optimization strategies, benchmarking tools, and scaling recommendations are operational best practices.

## Performance Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   RPC Provider  │───▶│  Processor       │───▶│  Hyperbee       │
│   Performance   │    │  Optimization    │    │  Database       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Network       │    │  Memory/CPU      │    │  P2P Network    │
│   Optimization  │    │  Optimization    │    │  Optimization   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Key Performance Metrics

### Throughput Metrics

**Block Processing:**
- Blocks processed per second (target: match chain block time)
- Transaction throughput (transactions/second)
- Batch processing efficiency (blocks/batch optimal size)

**API Response:**
- Requests per second capacity
- Concurrent connection handling
- Cache hit ratio percentage

### Latency Metrics

**Processing Latency:**
- Average block processing time
- Transaction indexing latency
- Database write latency

**API Latency:**
- Response time percentiles (p50, p95, p99)
- Time to first byte (TTFB)
- End-to-end request processing time

### Resource Efficiency

**CPU Utilization:**
- Processor worker CPU usage (target: 60-80%)
- API worker CPU usage (target: 40-70%)
- Background task CPU overhead

**Memory Usage:**
- Heap memory utilization
- Buffer/cache memory efficiency
- Memory leak detection

**Network Efficiency:**
- RPC call optimization
- P2P bandwidth utilization
- Connection pooling effectiveness

## Configuration Optimization

### Core Performance Settings

**Transaction Concurrency:**
```json
{
  "txConcurrency": {
    "bitcoin": 5,
    "ethereum": 8,
    "solana": 15,
    "ton": 10,
    "tron": 10,
    "spark": 8
  }
}
```

**Block Batch Processing:**
```json
{
  "blockBatchSize": {
    "bitcoin": 10,
    "ethereum": 20,
    "solana": 50,
    "ton": 25,
    "tron": 25,
    "spark": 20
  }
}
```

**Sync Intervals (Actual from Repositories):**
```json
{
  "syncInterval": {
    "base": "*/5 * * * *",         // Every 5 minutes (default)
    "bitcoin": "*/5 * * * *",      // Every 5 minutes
    "ethereum": "*/1 * * * * *",   // Every 1 second (test mode)
    "solana": "*/3 * * * * *",     // Every 3 seconds
    "ton": "*/5 * * * *",          // Every 5 minutes (default)
    "tron": "*/5 * * * *",         // Every 5 minutes (configurable)
    "spark": "*/10 * * * * *"      // Every 10 seconds
  }
}
```

### Network-Specific Optimization

**Fast Networks (Solana, BSC, Polygon):**
```json
{
  "txConcurrency": 15,
  "blockBatchSize": 50,
  "syncInterval": "*/30 * * * * *",
  "rpcTimeout": 15000,
  "maxRetries": 5,
  "backoffMultiplier": 1.5
}
```

**Medium Networks (Ethereum, TRON):**
```json
{
  "txConcurrency": 8,
  "blockBatchSize": 20,
  "syncInterval": "*/1 * * * *",
  "rpcTimeout": 30000,
  "maxRetries": 3,
  "backoffMultiplier": 2.0
}
```

**Slow Networks (Bitcoin):**
```json
{
  "txConcurrency": 5,
  "blockBatchSize": 10,
  "syncInterval": "*/2 * * * *",
  "rpcTimeout": 60000,
  "maxRetries": 3,
  "backoffMultiplier": 2.0
}
```

## RPC Provider Optimization

### Provider Selection Strategy

**Multi-Provider Configuration:**
```json
{
  "providers": [
    {
      "url": "https://primary-provider.com",
      "priority": 100,
      "timeout": 30000,
      "maxConcurrent": 10
    },
    {
      "url": "https://backup-provider.com",
      "priority": 80,
      "timeout": 30000,
      "maxConcurrent": 8
    },
    {
      "url": "https://fallback-provider.com",
      "priority": 60,
      "timeout": 45000,
      "maxConcurrent": 5
    }
  ]
}
```

**Load Balancing Strategies:**

1. **Round Robin**: Distribute requests evenly
2. **Weighted Round Robin**: Based on provider priority
3. **Least Connections**: Route to provider with fewest active requests
4. **Health-Based**: Route only to healthy providers

### Connection Optimization

**HTTP Keep-Alive:**
```json
{
  "httpConfig": {
    "keepAlive": true,
    "keepAliveTimeout": 30000,
    "maxSockets": 100,
    "maxFreeSockets": 10
  }
}
```

**Connection Pooling:**
```javascript
// Example connection pool configuration
const httpAgent = new http.Agent({
  keepAlive: true,
  keepAliveMsecs: 30000,
  maxSockets: 50,
  maxFreeSockets: 10,
  timeout: 30000
});
```

**Request Batching:**
```json
{
  "batchConfig": {
    "enableBatching": true,
    "maxBatchSize": 100,
    "batchTimeout": 1000,
    "maxConcurrentBatches": 5
  }
}
```

## Memory Optimization

### Heap Management

**Node.js Heap Settings:**
```bash
# Recommended heap sizes by chain
export NODE_OPTIONS="--max-old-space-size=8192"  # 8GB for heavy chains
export NODE_OPTIONS="--max-old-space-size=4096"  # 4GB for medium chains
export NODE_OPTIONS="--max-old-space-size=2048"  # 2GB for light chains

# Additional optimization flags
export NODE_OPTIONS="--max-old-space-size=8192 --optimize-for-size --gc-interval=100"
```

**Memory Monitoring:**
```javascript
// Memory usage monitoring
const memoryUsage = process.memoryUsage();
console.log({
  rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
  heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
  heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
  external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`
});
```

### Buffer Management

**Stream Processing:**
```javascript
// Efficient stream processing for large datasets
const stream = new Transform({
  objectMode: true,
  highWaterMark: 1000,
  transform(chunk, encoding, callback) {
    // Process chunk without accumulating
    this.push(processChunk(chunk));
    callback();
  }
});
```

**Memory-Efficient Pagination:**
```json
{
  "paginationConfig": {
    "defaultLimit": 100,
    "maxLimit": 1000,
    "cursorTimeout": 300000
  }
}
```

## CPU Optimization

### Multi-Core Utilization

**Worker Threads:**
```javascript
// CPU-intensive processing with worker threads
const { Worker, isMainThread, parentPort } = require('worker_threads');

if (isMainThread) {
  // Main thread: distribute work
  const numCPUs = require('os').cpus().length;
  const workers = [];
  
  for (let i = 0; i < numCPUs; i++) {
    workers.push(new Worker(__filename));
  }
} else {
  // Worker thread: process data
  parentPort.on('message', (data) => {
    const result = processTransactions(data);
    parentPort.postMessage(result);
  });
}
```

**Process Optimization:**
```json
{
  "processConfig": {
    "maxConcurrentProcesses": 4,
    "processTimeout": 300000,
    "gracefulShutdownTimeout": 30000
  }
}
```

### Async/Await Optimization

**Efficient Async Patterns:**
```javascript
// Parallel processing with controlled concurrency
async function processBlocksConcurrently(blocks, concurrency = 5) {
  const semaphore = new Semaphore(concurrency);
  
  const promises = blocks.map(async (block) => {
    await semaphore.acquire();
    try {
      return await processBlock(block);
    } finally {
      semaphore.release();
    }
  });
  
  return Promise.all(promises);
}
```

## Database Performance

### Hypercore Database Optimization

**Database Configuration:**
```json
{
  "hypercoreConfig": {
    "cache": {
      "maxSize": 1000,
      "maxAge": 300000
    },
    "batch": {
      "maxSize": 1000,
      "maxWait": 1000
    },
    "compaction": {
      "interval": 3600000,
      "threshold": 0.7
    }
  }
}
```

**Write Optimization:**
```javascript
// Batch writes for better performance
class BatchWriter {
  constructor(db, batchSize = 1000) {
    this.db = db;
    this.batchSize = batchSize;
    this.batch = [];
  }
  
  async write(key, value) {
    this.batch.push({ key, value });
    
    if (this.batch.length >= this.batchSize) {
      await this.flush();
    }
  }
  
  async flush() {
    if (this.batch.length === 0) return;
    
    const batch = this.db.batch();
    for (const { key, value } of this.batch) {
      batch.put(key, value);
    }
    
    await batch.flush();
    this.batch = [];
  }
}
```

### P2P Replication Optimization

**Replication Settings:**
```json
{
  "replicationConfig": {
    "maxPeers": 10,
    "uploadBandwidth": 1048576,  // 1MB/s
    "downloadBandwidth": 5242880, // 5MB/s
    "sparse": true,
    "live": true
  }
}
```

## Caching Strategies

### API Response Caching

**Redis Cache Configuration:**
```json
{
  "cacheConfig": {
    "redis": {
      "host": "redis-cluster",
      "port": 6379,
      "db": 0,
      "keyPrefix": "wdk-indexer:",
      "defaultTTL": 300,
      "maxRetries": 3
    }
  }
}
```

**Cache Invalidation Strategy:**
```javascript
// Intelligent cache invalidation
class SmartCache {
  constructor(redis, config) {
    this.redis = redis;
    this.config = config;
  }
  
  async get(key) {
    const cached = await this.redis.get(key);
    if (cached) {
      return JSON.parse(cached);
    }
    return null;
  }
  
  async set(key, value, ttl = this.config.defaultTTL) {
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }
  
  async invalidatePattern(pattern) {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}
```

### Memory Caching

**LRU Cache Implementation:**
```javascript
const LRU = require('lru-cache');

const cache = new LRU({
  max: 10000,
  maxAge: 1000 * 60 * 5, // 5 minutes
  updateAgeOnGet: true,
  stale: true
});

// Cache frequently accessed data
async function getCachedBalance(address) {
  const cacheKey = `balance:${address}`;
  let balance = cache.get(cacheKey);
  
  if (!balance) {
    balance = await fetchBalance(address);
    cache.set(cacheKey, balance);
  }
  
  return balance;
}
```

## Load Testing and Benchmarking

### Performance Testing Framework

**Artillery Load Testing:**
```yaml
# load-test-config.yml
config:
  target: 'http://localhost:8080'
  phases:
    - duration: 300
      arrivalRate: 10
      name: "Warm up"
    - duration: 600
      arrivalRate: 50
      name: "Sustained load"
    - duration: 300
      arrivalRate: 100
      name: "Peak load"

scenarios:
  - name: "API Load Test"
    weight: 70
    flow:
      - post:
          url: "/rpc"
          json:
            jsonrpc: "2.0"
            method: "getBalance"
            params:
              address: "{{ $randomAddress() }}"
            id: "{{ $uuid() }}"
  
  - name: "Transaction Query Test"
    weight: 30
    flow:
      - post:
          url: "/rpc"
          json:
            jsonrpc: "2.0"
            method: "queryTransactions"
            params:
              addresses: ["{{ $randomAddress() }}"]
              limit: 50
            id: "{{ $uuid() }}"
```

**Benchmark Script:**
```bash
#!/bin/bash
# benchmark.sh

INDEXER_URL="http://localhost:8080"
DURATION=300
CONCURRENT_USERS=(10 25 50 100 200)

echo "Starting WDK Indexer Performance Benchmark"
echo "Timestamp: $(date)"
echo "Target: $INDEXER_URL"
echo "Duration: ${DURATION}s per test"
echo "=========================================="

for users in "${CONCURRENT_USERS[@]}"; do
    echo "Testing with $users concurrent users..."
    
    artillery run \
        --config load-test-config.yml \
        --overrides '{"config":{"phases":[{"duration":'$DURATION',"arrivalRate":'$users'}]}}' \
        --output "results-${users}users.json"
    
    # Generate report
    artillery report "results-${users}users.json" --output "report-${users}users.html"
    
    echo "Completed test with $users users"
    sleep 30  # Cool down between tests
done

echo "Benchmark completed. Check report-*.html files for results."
```

### Performance Metrics Collection

**Metrics Collection Script:**
```bash
#!/bin/bash
# collect-metrics.sh

INDEXER_URL="http://localhost:8080"
OUTPUT_FILE="performance-metrics-$(date +%Y%m%d-%H%M%S).json"

echo "Collecting performance metrics..."

# System metrics
SYSTEM_METRICS=$(cat << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "system": {
    "cpu_cores": $(nproc),
    "memory_total": "$(free -m | awk '/^Mem:/{print $2}')MB",
    "disk_space": "$(df -h / | awk 'NR==2{print $4}')",
    "load_average": "$(uptime | awk -F'load average:' '{print $2}')"
  }
}
EOF
)

# Indexer metrics
INDEXER_METRICS=$(curl -s "$INDEXER_URL/metrics" | grep -E "indexer_|process_" | head -20)

# Combine and save
echo "$SYSTEM_METRICS" > "$OUTPUT_FILE"
echo "Metrics collected in $OUTPUT_FILE"
```

## Optimization Recommendations by Chain

### Bitcoin Optimization

**Recommended Settings:**
```json
{
  "bitcoin": {
    "txConcurrency": 5,
    "blockBatchSize": 10,
    "syncInterval": "*/2 * * * *",
    "rpcTimeout": 60000,
    "memoryLimit": "4GB",
    "cacheSize": 1000
  }
}
```

**Bitcoin-Specific Optimizations:**
- Use multiple RPC providers for failover
- Optimize UTXO processing for large transactions
- Implement efficient address validation caching

### EVM Optimization

**Recommended Settings:**
```json
{
  "ethereum": {
    "txConcurrency": 8,
    "blockBatchSize": 20,
    "syncInterval": "*/1 * * * *",
    "rpcTimeout": 30000,
    "memoryLimit": "8GB",
    "logBatchSize": 1000
  }
}
```

**EVM-Specific Optimizations:**
- Batch event log queries for ERC-20 tokens
- Optimize gas calculation for transaction fees
- Implement efficient contract address validation

### Solana Optimization

**Recommended Settings:**
```json
{
  "solana": {
    "txConcurrency": 15,
    "blockBatchSize": 50,
    "syncInterval": "*/30 * * * * *",
    "rpcTimeout": 15000,
    "memoryLimit": "16GB",
    "slotBatchSize": 100
  }
}
```

**Solana-Specific Optimizations:**
- Handle slot-based processing efficiently
- Optimize SPL token account resolution
- Implement efficient lamport conversion

## Monitoring Performance

### Real-Time Performance Monitoring

**Performance Dashboard Metrics:**
```javascript
// Performance metrics collection
const performanceMetrics = {
  sync: {
    blocksPerSecond: gauge('indexer_blocks_per_second'),
    syncLag: gauge('indexer_sync_lag_seconds'),
    processingTime: histogram('indexer_processing_duration')
  },
  api: {
    requestsPerSecond: gauge('indexer_api_requests_per_second'),
    responseTime: histogram('indexer_api_response_time'),
    errorRate: gauge('indexer_api_error_rate')
  },
  resources: {
    cpuUsage: gauge('indexer_cpu_usage_percent'),
    memoryUsage: gauge('indexer_memory_usage_bytes'),
    diskUsage: gauge('indexer_disk_usage_bytes')
  }
};
```

### Performance Alerts

**Critical Performance Alerts:**
```yaml
# performance-alerts.yml
groups:
  - name: performance.critical
    rules:
      - alert: IndexerPerformanceDegraded
        expr: indexer_blocks_per_second < 0.5
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Indexer performance degraded"
          description: "Block processing rate is {{ $value }} blocks/second"

      - alert: IndexerHighLatency
        expr: histogram_quantile(0.95, rate(indexer_api_response_time_bucket[5m])) > 10
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High API latency detected"
          description: "95th percentile response time is {{ $value }}s"
```

## Troubleshooting Performance Issues

### Common Performance Problems

**Slow Sync Issues:**
1. Check RPC provider response times
2. Verify network connectivity
3. Review transaction concurrency settings
4. Monitor system resource usage

**High Memory Usage:**
1. Check for memory leaks
2. Optimize batch sizes
3. Review cache configuration
4. Monitor garbage collection

**API Latency Issues:**
1. Implement response caching
2. Optimize database queries
3. Review connection pooling
4. Scale API workers horizontally

### Performance Profiling

**Node.js Profiling:**
```bash
# CPU profiling
node --prof app.js

# Memory profiling
node --inspect app.js

# Generate flame graph
node --prof --prof-process isolate-*.log > profile.txt
```

**Memory Leak Detection:**
```javascript
// Memory leak detection
const v8 = require('v8');

setInterval(() => {
  const heapSnapshot = v8.writeHeapSnapshot();
  console.log(`Heap snapshot written to: ${heapSnapshot}`);
}, 300000); // Every 5 minutes
```

## Best Practices

### Development Best Practices

1. **Implement Circuit Breakers**: Prevent cascade failures
2. **Use Connection Pooling**: Optimize network resources
3. **Batch Operations**: Reduce overhead
4. **Monitor Resource Usage**: Proactive optimization
5. **Regular Profiling**: Identify bottlenecks early

### Operational Best Practices

1. **Capacity Planning**: Monitor growth trends
2. **Regular Performance Testing**: Validate optimizations
3. **Documentation**: Maintain performance runbooks
4. **Alerting**: Set up performance monitoring
5. **Regular Reviews**: Quarterly performance assessments

## Next Steps

After implementing performance optimizations:

1. **Establish Baselines**: Measure current performance
2. **Implement Monitoring**: Set up comprehensive metrics
3. **Regular Testing**: Schedule performance tests
4. **Continuous Optimization**: Iterative improvements
5. **Documentation**: Maintain optimization procedures

For chain-specific performance considerations, refer to individual indexer documentation and their performance sections. Each blockchain has unique characteristics that may require specialized optimization strategies.
