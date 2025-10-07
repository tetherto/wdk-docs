# WDK Indexer Troubleshooting

## Overview

This guide provides comprehensive troubleshooting procedures, common issue resolution, and debugging strategies for WDK Indexers across all supported blockchain networks. While each chain has specific characteristics, many troubleshooting approaches are universal.

> **Repository Context**: Worker types, error patterns, and basic health checks are based on repository implementations. Troubleshooting procedures, recovery scripts, and operational guidance are field-tested best practices.

## Diagnostic Framework

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Symptom       │───▶│   Diagnosis      │───▶│   Resolution    │
│   Detection     │    │   Process        │    │   Strategy      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Monitoring    │    │   Log Analysis   │    │   Preventive    │
│   Tools         │    │   & Debugging    │    │   Measures      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Common Issues and Solutions

### Sync Issues

#### Indexer Falling Behind Chain

**Symptoms:**
- Increasing sync lag (blocks behind chain tip)
- Slow block processing times
- API returning stale data

**Diagnosis:**
```bash
# Check sync status
curl -X POST http://localhost:8080/rpc -d '{
  "jsonrpc": "2.0",
  "method": "getBlockFromChain",
  "params": {"blockNumber": "latest"},
  "id": 1
}'

# Compare with actual chain height
# Bitcoin
curl -s https://blockstream.info/api/blocks/tip/height

# Ethereum
curl -X POST https://mainnet.infura.io/v3/YOUR_KEY -d '{
  "jsonrpc": "2.0",
  "method": "eth_blockNumber",
  "params": [],
  "id": 1
}'
```

**Resolution Steps:**
1. **Check RPC Provider Health:**
   ```bash
   # Test RPC connectivity
   curl -w "@curl-format.txt" -X POST $RPC_URL -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
   ```

2. **Increase Processing Concurrency:**
   ```json
   {
     "txConcurrency": 10,
     "blockBatchSize": 20
   }
   ```

3. **Optimize System Resources:**
   ```bash
   # Check system resources
   htop
   iostat -x 1
   df -h
   ```

4. **Add More RPC Providers:**
   ```json
   {
     "providers": [
       {"url": "primary-provider", "priority": 100},
       {"url": "backup-provider", "priority": 80},
       {"url": "fallback-provider", "priority": 60}
     ]
   }
   ```

#### Sync Completely Stopped

**Symptoms:**
- No new blocks being processed
- Processor appears running but inactive
- Database not receiving updates

**Diagnosis:**
```bash
# Check processor health
curl http://localhost:8080/health

# Monitor processor logs
tail -f logs/processor.log | grep -E "(error|block|sync)"

# Check database connectivity
curl -X POST http://localhost:8080/rpc -d '{
  "jsonrpc": "2.0",
  "method": "getDbCoreKey",
  "id": 1
}'
```

**Resolution Steps:**
1. **Restart Processor Worker:**
   ```bash
   # Graceful restart
   docker-compose restart bitcoin-processor
   
   # Or kill and restart
   pkill -f "proc.indexer.btc.wrk"
   NODE_CONFIG_DIR=./config node worker.js --wtype=proc.indexer.btc.wrk --chain=bitcoin
   ```

2. **Clear Stuck State:**
   ```bash
   # Remove lock files if they exist
   rm -f store/*.lock
   
   # Reset to known good block
   # (This requires manual database intervention)
   ```

3. **Check Configuration:**
   ```bash
   # Validate configuration syntax
   node -e "console.log(JSON.parse(require('fs').readFileSync('config/bitcoin.json')))"
   ```

### API Issues

#### API Endpoints Not Responding

**Symptoms:**
- HTTP timeouts on API calls
- Connection refused errors
- 500 internal server errors

**Diagnosis:**
```bash
# Check if API worker is running
ps aux | grep "api.indexer"

# Test basic connectivity
curl -v http://localhost:8080/health

# Check listening ports
netstat -tulpn | grep 8080

# Monitor API logs
tail -f logs/api.log | grep -E "(error|request|response)"
```

**Resolution Steps:**
1. **Restart API Worker:**
   ```bash
   docker-compose restart bitcoin-api
   ```

2. **Check Port Conflicts:**
   ```bash
   # Find process using port
   lsof -i :8080
   
   # Kill conflicting process if necessary
   sudo kill -9 $(lsof -t -i:8080)
   ```

3. **Verify Processor Connectivity:**
   ```bash
   # Test processor RPC key
   curl -X POST http://processor:8079/rpc -d '{
     "jsonrpc": "2.0",
     "method": "getBlockFromChain",
     "params": {"blockNumber": "latest"},
     "id": 1
   }'
   ```

#### Slow API Response Times

**Symptoms:**
- High response latencies (>5 seconds)
- Timeouts on complex queries
- Poor user experience

**Diagnosis:**
```bash
# Monitor response times
curl -w "@curl-format.txt" -X POST http://localhost:8080/rpc -d '{
  "jsonrpc": "2.0",
  "method": "queryTransactions",
  "params": {"addresses": ["ADDRESS"], "limit": 100},
  "id": 1
}'

# Check API worker resource usage
docker stats bitcoin-api

# Monitor database query performance
# (Implementation depends on database metrics)
```

**Resolution Steps:**
1. **Scale API Workers Horizontally:**
   ```yaml
   # docker-compose.yml
   bitcoin-api:
     deploy:
       replicas: 3
   ```

2. **Implement Caching:**
   ```json
   {
     "cacheConfig": {
       "enabled": true,
       "ttl": 300,
       "maxSize": 10000
     }
   }
   ```

3. **Optimize Database Queries:**
   ```json
   {
     "queryOptimization": {
       "indexing": true,
       "batchSize": 1000,
       "timeout": 30000
     }
   }
   ```

### Database Issues

#### Database Corruption or Inconsistency

**Symptoms:**
- Inconsistent data returned by API
- Database read/write errors
- Hypercore corruption warnings

**Diagnosis:**
```bash
# Check database integrity
# (Hypercore-specific commands)
node -e "
const db = require('./path/to/db');
db.verify().then(result => console.log('DB Status:', result));
"

# Check disk space
df -h

# Monitor I/O performance
iostat -x 1
```

**Resolution Steps:**
1. **Stop All Workers:**
   ```bash
   docker-compose stop
   ```

2. **Backup Current State:**
   ```bash
   cp -r store/ store.backup.$(date +%Y%m%d-%H%M%S)/
   ```

3. **Database Recovery:**
   ```bash
   # Hypercore auto-recovery (if supported)
   node recovery-script.js
   
   # Or manual re-sync from known block
   # (Implementation specific)
   ```

4. **Restart Services:**
   ```bash
   docker-compose up -d
   ```

#### P2P Replication Issues

**Symptoms:**
- No connected peers
- Replication lag between workers
- API workers not receiving updates

**Diagnosis:**
```bash
# Check P2P connections
curl -X POST http://localhost:8080/rpc -d '{
  "jsonrpc": "2.0",
  "method": "getPeerCount",
  "id": 1
}'

# Monitor P2P logs
tail -f logs/p2p.log | grep -E "(peer|connect|replicate)"

# Check network connectivity
nc -zv processor-host 49738
```

**Resolution Steps:**
1. **Check Firewall Rules:**
   ```bash
   # Open P2P ports
   ufw allow 49738/tcp
   
   # Check current rules
   ufw status
   ```

2. **Restart P2P Services:**
   ```bash
   # Restart all workers to re-establish connections
   docker-compose restart
   ```

3. **Configure P2P Settings:**
   ```json
   {
     "p2pConfig": {
       "port": 49738,
       "maxPeers": 10,
       "bootstrap": ["processor-host:49738"]
     }
   }
   ```

### RPC Provider Issues

#### Provider Rate Limiting

**Symptoms:**
- 429 "Too Many Requests" errors
- Sudden drop in sync performance
- RPC provider rejection messages

**Diagnosis:**
```bash
# Monitor RPC error rates
tail -f logs/processor.log | grep -E "(429|rate.limit|too.many)"

# Check provider response headers
curl -I -X POST $RPC_URL -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

**Resolution Steps:**
1. **Add Multiple Providers:**
   ```json
   {
     "providers": [
       {"url": "provider1", "priority": 100, "weight": 40},
       {"url": "provider2", "priority": 100, "weight": 30},
       {"url": "provider3", "priority": 100, "weight": 30}
     ]
   }
   ```

2. **Reduce Request Rate:**
   ```json
   {
     "txConcurrency": 3,
     "blockBatchSize": 5,
     "requestDelay": 1000
   }
   ```

3. **Implement Exponential Backoff:**
   ```json
   {
     "retryConfig": {
       "maxRetries": 5,
       "baseDelay": 1000,
       "maxDelay": 30000,
       "backoffMultiplier": 2
     }
   }
   ```

#### Provider Downtime

**Symptoms:**
- Connection timeouts to RPC endpoints
- DNS resolution failures
- Network unreachable errors

**Diagnosis:**
```bash
# Test provider connectivity
curl -m 10 -X POST $RPC_URL -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Check DNS resolution
nslookup provider-hostname

# Test network path
traceroute provider-hostname
```

**Resolution Steps:**
1. **Automatic Failover:**
   ```json
   {
     "failoverConfig": {
       "enabled": true,
       "healthCheckInterval": 30000,
       "failureThreshold": 3,
       "recoveryThreshold": 2
     }
   }
   ```

2. **Provider Health Monitoring:**
   ```bash
   #!/bin/bash
   # provider-health-check.sh
   
   providers=("provider1.com" "provider2.com" "provider3.com")
   
   for provider in "${providers[@]}"; do
     if curl -m 5 -f "https://$provider" > /dev/null 2>&1; then
       echo "$provider: OK"
     else
       echo "$provider: FAILED"
       # Send alert
     fi
   done
   ```

### Memory and Resource Issues

#### Memory Leaks

**Symptoms:**
- Continuously increasing memory usage
- Out of memory errors
- Slow garbage collection

**Diagnosis:**
```bash
# Monitor memory usage over time
while true; do
  docker stats --no-stream bitcoin-processor | grep bitcoin-processor
  sleep 60
done

# Node.js heap analysis
node --inspect worker.js
# Connect Chrome DevTools to inspect heap
```

**Resolution Steps:**
1. **Increase Memory Limits:**
   ```bash
   export NODE_OPTIONS="--max-old-space-size=8192"
   ```

2. **Implement Memory Monitoring:**
   ```javascript
   // Memory monitoring
   setInterval(() => {
     const usage = process.memoryUsage();
     console.log({
       rss: Math.round(usage.rss / 1024 / 1024),
       heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
       heapUsed: Math.round(usage.heapUsed / 1024 / 1024)
     });
   }, 60000);
   ```

3. **Optimize Code:**
   ```javascript
   // Proper cleanup
   function processBlocks(blocks) {
     try {
       // Process blocks
     } finally {
       // Clean up references
       blocks = null;
       global.gc && global.gc();
     }
   }
   ```

#### High CPU Usage

**Symptoms:**
- CPU usage consistently >90%
- System becomes unresponsive
- Slow block processing

**Diagnosis:**
```bash
# Monitor CPU usage
top -p $(pgrep -f indexer)

# CPU profiling
node --prof worker.js
# Process profile after running
node --prof-process isolate-*.log > profile.txt
```

**Resolution Steps:**
1. **Optimize Processing:**
   ```json
   {
     "txConcurrency": 5,
     "blockBatchSize": 10,
     "processingTimeout": 30000
   }
   ```

2. **Use Worker Threads:**
   ```javascript
   const { Worker } = require('worker_threads');
   
   function distributeWork(data) {
     const worker = new Worker('./worker-thread.js');
     worker.postMessage(data);
     return new Promise(resolve => {
       worker.on('message', resolve);
     });
   }
   ```

## Error Categories and Patterns

### Network Errors

**Connection Timeouts:**
```
Error: connect ETIMEDOUT
Error: socket hang up
Error: ECONNRESET
```

**Resolution:**
- Increase timeout values
- Implement retry logic
- Check network connectivity

**DNS Resolution Errors:**
```
Error: getaddrinfo ENOTFOUND
Error: getaddrinfo EAI_AGAIN
```

**Resolution:**
- Verify DNS configuration
- Use IP addresses instead of hostnames
- Configure alternative DNS servers

### Blockchain-Specific Errors

**Invalid Block/Transaction Data:**
```
Error: Invalid block hash
Error: Transaction not found
Error: Block number out of range
```

**Resolution:**
- Verify RPC provider data integrity
- Implement data validation
- Add error handling for malformed data

**Chain Reorganization:**
```
Warning: Chain reorganization detected
Error: Block hash mismatch
```

**Resolution:**
- Implement reorg handling logic
- Maintain block cache for rollbacks
- Add confirmation requirements

### Application Errors

**Configuration Errors:**
```
Error: Invalid configuration
Error: Missing required field
Error: JSON parse error
```

**Resolution:**
- Validate configuration on startup
- Use configuration schema validation
- Provide clear error messages

**Worker Communication Errors:**
```
Error: RPC key mismatch
Error: Worker not responding
Error: Communication timeout
```

**Resolution:**
- Verify RPC keys match
- Implement health checks
- Add worker restart logic

## Debugging Tools and Techniques

### Log Analysis

**Structured Logging Format:**
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "error",
  "message": "RPC request failed",
  "component": "processor",
  "chain": "bitcoin",
  "error": {
    "code": "ECONNRESET",
    "message": "socket hang up",
    "stack": "..."
  },
  "context": {
    "blockNumber": 850000,
    "provider": "primary",
    "attempt": 2
  }
}
```

**Log Analysis Commands:**
```bash
# Find errors by type
grep '"level":"error"' logs/indexer.log | jq '.error.code' | sort | uniq -c

# Analyze sync performance
grep 'block processed' logs/indexer.log | jq '.duration' | awk '{sum+=$1; count++} END {print "Avg:", sum/count}'

# Monitor RPC provider issues
grep 'rpc' logs/indexer.log | jq -r '[.timestamp, .provider, .error.code] | @csv'
```

### Performance Monitoring

**Custom Metrics Collection:**
```javascript
// Custom metrics for debugging
const metrics = {
  blockProcessingTime: [],
  rpcResponseTime: [],
  memoryUsage: [],
  
  record(metric, value) {
    this[metric].push({
      timestamp: Date.now(),
      value: value
    });
    
    // Keep only last 1000 entries
    if (this[metric].length > 1000) {
      this[metric].shift();
    }
  },
  
  getStats(metric) {
    const values = this[metric].map(entry => entry.value);
    return {
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      count: values.length
    };
  }
};
```

### Health Check Scripts

**Comprehensive Health Check:**
```bash
#!/bin/bash
# comprehensive-health-check.sh

INDEXER_URL="http://localhost:8080"
CHAIN="bitcoin"
LOG_FILE="/tmp/health-check-$(date +%Y%m%d-%H%M%S).log"

echo "WDK Indexer Health Check - $(date)" | tee $LOG_FILE
echo "===============================" | tee -a $LOG_FILE

# Basic connectivity
echo "Testing basic connectivity..." | tee -a $LOG_FILE
if curl -f -m 10 "$INDEXER_URL/health" > /dev/null 2>&1; then
  echo "✅ Health endpoint accessible" | tee -a $LOG_FILE
else
  echo "❌ Health endpoint failed" | tee -a $LOG_FILE
  exit 1
fi

# Sync status
echo "Checking sync status..." | tee -a $LOG_FILE
SYNC_DATA=$(curl -s -X POST "$INDEXER_URL/rpc" -d '{
  "jsonrpc": "2.0",
  "method": "getBlockFromChain",
  "params": {"blockNumber": "latest"},
  "id": 1
}')

CURRENT_BLOCK=$(echo "$SYNC_DATA" | jq -r '.result.blockNumber // 0')
if [ "$CURRENT_BLOCK" -gt 0 ]; then
  echo "✅ Sync active, current block: $CURRENT_BLOCK" | tee -a $LOG_FILE
else
  echo "❌ Sync appears stopped" | tee -a $LOG_FILE
fi

# Database connectivity
echo "Testing database connectivity..." | tee -a $LOG_FILE
DB_DATA=$(curl -s -X POST "$INDEXER_URL/rpc" -d '{
  "jsonrpc": "2.0",
  "method": "getDbCoreKey",
  "id": 1
}')

if echo "$DB_DATA" | jq -e '.result' > /dev/null 2>&1; then
  echo "✅ Database accessible" | tee -a $LOG_FILE
else
  echo "❌ Database connection failed" | tee -a $LOG_FILE
fi

# Resource usage
echo "Checking resource usage..." | tee -a $LOG_FILE
CPU_USAGE=$(top -bn1 | grep "node" | awk '{print $9}' | head -1)
MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')

echo "CPU Usage: ${CPU_USAGE:-N/A}%" | tee -a $LOG_FILE
echo "Memory Usage: ${MEMORY_USAGE}%" | tee -a $LOG_FILE
echo "Disk Usage: ${DISK_USAGE}%" | tee -a $LOG_FILE

echo "Health check completed. Log saved to: $LOG_FILE"
```

## Emergency Procedures

### Service Recovery

**Quick Recovery Checklist:**
1. ☐ Stop all workers gracefully
2. ☐ Backup current state
3. ☐ Check logs for error patterns
4. ☐ Verify system resources
5. ☐ Restart services in order: processor → API
6. ☐ Monitor sync resumption
7. ☐ Verify API functionality

**Recovery Script:**
```bash
#!/bin/bash
# emergency-recovery.sh

echo "Starting emergency recovery procedure..."

# Stop services
echo "Stopping services..."
docker-compose stop

# Backup current state
echo "Creating backup..."
cp -r store/ "store.backup.emergency.$(date +%Y%m%d-%H%M%S)/"

# Check system resources
echo "System status:"
df -h
free -h
ps aux | grep indexer

# Restart services
echo "Restarting services..."
docker-compose up -d

# Wait and verify
sleep 30
curl -f http://localhost:8080/health && echo "Recovery successful" || echo "Recovery failed"
```

### Data Recovery

**Database Recovery:**
```bash
#!/bin/bash
# database-recovery.sh

BACKUP_DIR="store.backup.$(date +%Y%m%d-%H%M%S)"
RECOVERY_BLOCK=${1:-"latest-100"}

echo "Starting database recovery..."

# Stop services
docker-compose stop

# Create backup of current state
cp -r store/ "$BACKUP_DIR/"

# Recovery options
case "$RECOVERY_BLOCK" in
  "full-resync")
    echo "Full resync: removing all data"
    rm -rf store/*
    ;;
  "latest-"*)
    BLOCKS_BACK=${RECOVERY_BLOCK#latest-}
    echo "Rolling back $BLOCKS_BACK blocks"
    # Implementation specific to database format
    ;;
  *)
    echo "Rolling back to block $RECOVERY_BLOCK"
    # Implementation specific
    ;;
esac

# Restart and monitor
docker-compose up -d
echo "Recovery initiated. Monitor logs for progress."
```

## Prevention and Best Practices

### Monitoring Setup

**Essential Alerts:**
1. Sync lag > 10 blocks
2. API response time > 5 seconds
3. Error rate > 5%
4. Memory usage > 80%
5. Disk usage > 85%

### Configuration Validation

**Startup Validation:**
```javascript
// config-validator.js
function validateConfig(config) {
  const required = ['chain', 'token', 'rpcUrl', 'decimals'];
  const missing = required.filter(field => !config[field]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
  
  if (config.txConcurrency > 20) {
    console.warn('High txConcurrency may cause rate limiting');
  }
  
  return true;
}
```

### Regular Maintenance

**Maintenance Checklist:**
- [ ] Weekly: Review error logs and patterns
- [ ] Weekly: Check disk space and performance
- [ ] Monthly: Update RPC provider configurations
- [ ] Monthly: Review and optimize performance settings
- [ ] Quarterly: Full backup and disaster recovery test

## Support and Escalation

### Log Collection for Support

**Support Package Script:**
```bash
#!/bin/bash
# collect-support-info.sh

SUPPORT_DIR="support-package-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$SUPPORT_DIR"

# Collect logs
cp logs/*.log "$SUPPORT_DIR/"

# Collect configuration (sanitized)
cp config/*.json "$SUPPORT_DIR/"
# Remove sensitive data
sed -i 's/"key".*/"key": "REDACTED"/g' "$SUPPORT_DIR"/*.json

# System information
uname -a > "$SUPPORT_DIR/system-info.txt"
docker version >> "$SUPPORT_DIR/system-info.txt"
free -h >> "$SUPPORT_DIR/system-info.txt"
df -h >> "$SUPPORT_DIR/system-info.txt"

# Current status
curl -s http://localhost:8080/health > "$SUPPORT_DIR/health-status.json"
docker-compose ps > "$SUPPORT_DIR/docker-status.txt"

# Create archive
tar -czf "${SUPPORT_DIR}.tar.gz" "$SUPPORT_DIR/"
echo "Support package created: ${SUPPORT_DIR}.tar.gz"
```

### Escalation Procedure

**Level 1 - Self Service:**
- Check this troubleshooting guide
- Review logs for obvious errors
- Restart services if safe to do so

**Level 2 - Team Support:**
- Create support package
- Document issue reproduction steps
- Contact team with detailed information

**Level 3 - Engineering Escalation:**
- Critical production impact
- Data corruption suspected
- Security incident

For chain-specific troubleshooting procedures, refer to the individual chain documentation:
- [Bitcoin Troubleshooting](indexer-btc.md#troubleshooting)
- [EVM Troubleshooting](indexer-evm.md#troubleshooting)
- [Solana Troubleshooting](indexer-solana.md#troubleshooting)
- [TON Troubleshooting](indexer-ton.md#troubleshooting)
- [TRON Troubleshooting](indexer-tron.md#troubleshooting)
- [Spark Troubleshooting](indexer-spark.md#troubleshooting)
