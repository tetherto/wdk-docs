# WDK Indexer Deployment

## Overview

This guide covers deployment patterns, containerization, and scaling strategies for WDK Indexers across all supported blockchain networks. While each chain has specific requirements, the fundamental deployment architecture remains consistent.

> **Repository Context**: Core worker types, configuration structure, and API methods are based directly on the WDK Indexer repositories. Deployment strategies, Docker configurations, and Kubernetes manifests are recommended production practices.

## Architecture Overview

All WDK Indexers follow a standardized two-worker architecture:

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

### Worker Types

**Processor Worker:**
- Polls blockchain data continuously
- Normalizes transactions into unified schema
- Stores data in Hypercore-based distributed database
- **Deployment**: Single instance per chain/token

**API Worker:**
- Serves read-only RPC endpoints
- Replicates data from processor via P2P
- Handles client requests and queries
- **Deployment**: Multiple instances for scaling

## Prerequisites

### System Requirements

**Minimum:**
- CPU: 2 cores
- RAM: 4GB
- Storage: 100GB SSD
- Network: Stable internet connection

**Recommended:**
- CPU: 4+ cores
- RAM: 8GB+
- Storage: 500GB+ NVMe SSD
- Network: 1Gbps+ connection with low latency

### Software Dependencies

- **Node.js**: Version 16 or higher
- **NPM**: Latest stable version
- **Git**: For repository cloning
- **Docker**: For containerized deployments (optional)

### Network Access

- Outbound HTTPS (443) for RPC providers
- Custom ports for P2P replication (configurable)
- Inbound HTTP (8080) for API access

## Basic Deployment

### 1. Repository Setup

```bash
# Clone the indexer for your target chain
git clone https://github.com/tetherto/wdk-indexer-wrk-{CHAIN}.git
cd wdk-indexer-wrk-{CHAIN}

# Install dependencies
npm install

# Set up configuration
cp config/{chain}.json.example config/{chain}.json
cp config/common.json.example config/common.json

# Edit configuration files with your settings
vim config/common.json
vim config/{chain}.json
```

### 2. Configuration

**Common Configuration (`config/common.json`):**
```json
{
  "debug": 0,
  "chain": "{CHAIN_NAME}",
  "topicConf": {
    "crypto": {
      "algo": "hmac-sha384",
      "key": "your-secret-encryption-key"
    }
  }
}
```

**Chain-Specific Configuration:**
See the [Configuration Reference](indexer-configuration.md) for detailed options.

### 3. Start Services

**Start Processor Worker:**
```bash
NODE_CONFIG_DIR=./config node worker.js \
  --env=production \
  --wtype=wrk-{chain}-indexer-proc \
  --rack=r0 \
  --chain={chain}
```

**Start API Worker:**
```bash
NODE_CONFIG_DIR=./config node worker.js \
  --env=production \
  --wtype=wrk-{chain}-indexer-api \
  --rack=r0 \
  --chain={chain} \
  --proc-rpc=<processor-rpc-key>
```

### 4. Health Verification

```bash
# Check processor health
curl http://localhost:8080/health

# Verify API worker
curl -X POST http://localhost:8080/rpc -d '{
  "jsonrpc": "2.0",
  "method": "getDbCoreKey",
  "id": 1
}'
```

## Docker Deployment

### Single-Chain Docker Compose

**Basic docker-compose.yml:**
```yaml
version: '3.8'

services:
  {chain}-processor:
    build: .
    environment:
      - NODE_CONFIG_DIR=/app/config
      - NODE_ENV=production
          command: >
        node worker.js 
        --env=production 
        --wtype=wrk-{chain}-indexer-proc 
        --rack=r0 
        --chain={chain}
    volumes:
      - ./config:/app/config
      - {chain}-data:/app/store
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  {chain}-api:
    build: .
    environment:
      - NODE_CONFIG_DIR=/app/config
      - NODE_ENV=production
          command: >
        node worker.js 
        --env=production 
        --wtype=wrk-{chain}-indexer-api 
        --rack=r0 
        --chain={chain}
        --proc-rpc=${PROC_RPC_KEY}
    volumes:
      - ./config:/app/config
    ports:
      - "8080:8080"
    depends_on:
      - {chain}-processor
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  {chain}-data:
```

**Environment Variables (.env):**
```bash
PROC_RPC_KEY=your-processor-rpc-key
NODE_ENV=production
DEBUG=0
```

### Multi-Chain Docker Compose

**docker-compose.multi.yml:**
```yaml
version: '3.8'

services:
  # Bitcoin Indexer
  bitcoin-processor:
    build: 
      context: ./wdk-indexer-wrk-btc
    environment:
      - NODE_CONFIG_DIR=/app/config
    command: >
      node worker.js 
      --env=production 
      --wtype=wrk-btc-indexer-proc 
      --rack=r0 
      --chain=bitcoin
    volumes:
      - ./config/bitcoin:/app/config
      - bitcoin-data:/app/store
    restart: unless-stopped

  bitcoin-api:
    build:
      context: ./wdk-indexer-wrk-btc
    command: >
      node worker.js 
      --env=production 
      --wtype=wrk-btc-indexer-api 
      --rack=r0 
      --chain=bitcoin
      --proc-rpc=${BTC_PROC_RPC_KEY}
    ports:
      - "8080:8080"
    depends_on:
      - bitcoin-processor
    restart: unless-stopped

  # Ethereum Indexer
  ethereum-processor:
    build:
      context: ./wdk-indexer-wrk-evm
    command: >
      node worker.js 
      --env=production 
      --wtype=wrk-evm-indexer-proc 
      --rack=r0 
      --chain=ethereum
    volumes:
      - ./config/ethereum:/app/config
      - ethereum-data:/app/store
    restart: unless-stopped

  ethereum-api:
    build:
      context: ./wdk-indexer-wrk-evm
    command: >
      node worker.js 
      --env=production 
      --wtype=wrk-evm-indexer-api 
      --rack=r0 
      --chain=ethereum
      --proc-rpc=${ETH_PROC_RPC_KEY}
    ports:
      - "8081:8080"
    depends_on:
      - ethereum-processor
    restart: unless-stopped

volumes:
  bitcoin-data:
  ethereum-data:
```

### Dockerfile Template

**Dockerfile:**
```dockerfile
FROM node:18-alpine

# Install system dependencies
RUN apk add --no-cache \
    curl \
    git \
    && rm -rf /var/cache/apk/*

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Default command
CMD ["node", "worker.js"]
```

## Kubernetes Deployment

### Namespace and ConfigMap

**namespace.yaml:**
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: wdk-indexers
```

**configmap.yaml:**
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: indexer-config
  namespace: wdk-indexers
data:
  common.json: |
    {
      "debug": 0,
      "chain": "bitcoin",
      "topicConf": {
        "crypto": {
          "algo": "hmac-sha384",
          "key": "your-secret-key"
        }
      }
    }
  bitcoin.json: |
    {
      "chain": "bitcoin",
      "token": "btc",
      "rpcUrl": "https://bitcoin-rpc.example.com",
      "network": "mainnet",
      "decimals": 8,
      "txConcurrency": 5,
      "blockBatchSize": 10
    }
```

### Processor Deployment

**processor-deployment.yaml:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: bitcoin-processor
  namespace: wdk-indexers
spec:
  replicas: 1
  selector:
    matchLabels:
      app: bitcoin-processor
  template:
    metadata:
      labels:
        app: bitcoin-processor
    spec:
      containers:
      - name: processor
        image: wdk-indexer-btc:latest
        command: ["node", "worker.js"]
        args:
          - "--env=production"
          - "--wtype=wrk-btc-indexer-proc"
          - "--rack=r0"
          - "--chain=bitcoin"
        env:
        - name: NODE_CONFIG_DIR
          value: "/app/config"
        volumeMounts:
        - name: config
          mountPath: /app/config
        - name: data
          mountPath: /app/store
        resources:
          requests:
            memory: "2Gi"
            cpu: "500m"
          limits:
            memory: "4Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 30
      volumes:
      - name: config
        configMap:
          name: indexer-config
      - name: data
        persistentVolumeClaim:
          claimName: bitcoin-processor-pvc
```

### API Service Deployment

**api-deployment.yaml:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: bitcoin-api
  namespace: wdk-indexers
spec:
  replicas: 3
  selector:
    matchLabels:
      app: bitcoin-api
  template:
    metadata:
      labels:
        app: bitcoin-api
    spec:
      containers:
      - name: api
        image: wdk-indexer-btc:latest
        command: ["node", "worker.js"]
        args:
          - "--env=production"
          - "--wtype=wrk-btc-indexer-api"
          - "--rack=r0"
          - "--chain=bitcoin"
          - "--proc-rpc=$(PROC_RPC_KEY)"
        env:
        - name: NODE_CONFIG_DIR
          value: "/app/config"
        - name: PROC_RPC_KEY
          valueFrom:
            secretKeyRef:
              name: indexer-secrets
              key: proc-rpc-key
        volumeMounts:
        - name: config
          mountPath: /app/config
        ports:
        - containerPort: 8080
        resources:
          requests:
            memory: "1Gi"
            cpu: "250m"
          limits:
            memory: "2Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 10
      volumes:
      - name: config
        configMap:
          name: indexer-config

---
apiVersion: v1
kind: Service
metadata:
  name: bitcoin-api-service
  namespace: wdk-indexers
spec:
  selector:
    app: bitcoin-api
  ports:
  - port: 80
    targetPort: 8080
  type: ClusterIP

---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: bitcoin-api-hpa
  namespace: wdk-indexers
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: bitcoin-api
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
```

### Persistent Storage

**pvc.yaml:**
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: bitcoin-processor-pvc
  namespace: wdk-indexers
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 500Gi
  storageClassName: fast-ssd
```

## Scaling Strategies

### Horizontal Scaling

**API Workers:**
- Deploy multiple API worker instances
- Use load balancer for request distribution
- Scale based on CPU/memory usage and request volume
- No limit on number of replicas

**Processor Workers:**
- **Single instance only** per chain/token
- Sequential block processing prevents horizontal scaling
- Vertical scaling (more CPU/RAM) for performance

### Vertical Scaling

**Resource Allocation Guidelines:**

| Chain Type | CPU | Memory | Storage |
|------------|-----|--------|---------|
| Bitcoin | 2-4 cores | 4-8GB | 500GB+ |
| EVM Chains | 4-6 cores | 8-16GB | 1TB+ |
| Solana | 6-8 cores | 16-32GB | 2TB+ |
| TON/TRON | 4-6 cores | 8-16GB | 1TB+ |

### Load Balancing

**Nginx Configuration:**
```nginx
upstream indexer_api {
    least_conn;
    server api-1:8080 max_fails=3 fail_timeout=30s;
    server api-2:8080 max_fails=3 fail_timeout=30s;
    server api-3:8080 max_fails=3 fail_timeout=30s;
}

server {
    listen 80;
    server_name indexer.example.com;

    location /rpc {
        proxy_pass http://indexer_api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }
}
```

## Security Considerations

### Network Security

**Firewall Rules:**
```bash
# Allow API access
ufw allow 8080/tcp

# Block direct access to processor
ufw deny 8079/tcp

# Allow P2P replication (adjust port as needed)
ufw allow 49738/tcp
```

**TLS/SSL Configuration:**
```nginx
server {
    listen 443 ssl http2;
    server_name indexer.example.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;

    location /rpc {
        proxy_pass http://indexer_api;
        # ... other proxy settings
    }
}
```

### Access Control

**API Key Authentication:**
```javascript
// Example middleware for API key validation
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || !isValidApiKey(apiKey)) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  next();
};
```

**Rate Limiting:**
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP'
});
```

### Configuration Security

**Environment Variables:**
```bash
# Use environment variables for sensitive data
export RPC_API_KEY="your-secret-api-key"
export PROC_RPC_KEY="your-processor-rpc-key"
export ENCRYPTION_KEY="your-encryption-key"
```

**File Permissions:**
```bash
# Secure configuration files
chmod 600 config/*.json
chown indexer:indexer config/*.json
```

## Monitoring Integration

### Health Checks

**HTTP Health Endpoint:**
```bash
# Basic health check
curl http://localhost:8080/health

# Expected response
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "version": "1.0.0"
}
```

**Detailed Health Monitoring:**
```bash
# Check sync status
curl -X POST http://localhost:8080/rpc -d '{
  "jsonrpc": "2.0",
  "method": "getBlockFromChain",
  "params": {"blockNumber": "latest"},
  "id": 1
}'

# Check database status
curl -X POST http://localhost:8080/rpc -d '{
  "jsonrpc": "2.0",
  "method": "getDbCoreKey",
  "id": 1
}'
```

### Logging Configuration

**Structured Logging:**
```json
{
  "debug": 1,
  "logging": {
    "level": "info",
    "format": "json",
    "output": "stdout"
  }
}
```

**Log Aggregation (Docker):**
```yaml
logging:
  driver: "json-file"
  options:
    max-size: "100m"
    max-file: "5"
```

## Backup and Recovery

### Data Backup

**Processor Data:**
```bash
# Stop processor
docker-compose stop bitcoin-processor

# Backup store directory
tar -czf backup-$(date +%Y%m%d).tar.gz store/

# Restart processor
docker-compose start bitcoin-processor
```

**Configuration Backup:**
```bash
# Backup configuration
tar -czf config-backup-$(date +%Y%m%d).tar.gz config/
```

### Disaster Recovery

**Recovery Process:**
1. Deploy new infrastructure
2. Restore configuration files
3. Restore processor data (optional - can resync)
4. Start services and verify sync

**Automated Backup Script:**
```bash
#!/bin/bash
# backup-indexer.sh

BACKUP_DIR="/backups/indexer"
DATE=$(date +%Y%m%d-%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup configuration
tar -czf $BACKUP_DIR/config-$DATE.tar.gz config/

# Backup processor data (if needed)
docker-compose exec bitcoin-processor tar -czf /tmp/store-$DATE.tar.gz store/
docker cp $(docker-compose ps -q bitcoin-processor):/tmp/store-$DATE.tar.gz $BACKUP_DIR/

# Clean old backups (keep 7 days)
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

## Troubleshooting Deployment

### Common Issues

**Port Conflicts:**
```bash
# Check if port is in use
netstat -tulpn | grep :8080

# Kill process using port
sudo kill -9 $(lsof -t -i:8080)
```

**Permission Issues:**
```bash
# Fix ownership
sudo chown -R $USER:$USER config/ store/

# Fix permissions
chmod 755 config/
chmod 600 config/*.json
```

**Docker Issues:**
```bash
# Check container logs
docker-compose logs bitcoin-processor

# Check container health
docker-compose ps

# Rebuild containers
docker-compose build --no-cache
```

### Performance Issues

**Resource Monitoring:**
```bash
# Monitor container resources
docker stats

# Check system resources
htop
iostat -x 1
```

**Database Issues:**
```bash
# Check disk space
df -h

# Check database corruption
# (Hypercore is append-only and self-healing)
```

## Next Steps

After successful deployment:

1. **Configure Monitoring**: Set up comprehensive monitoring using the [Monitoring Guide](indexer-monitoring.md)
2. **Performance Tuning**: Optimize settings using the [Performance Guide](indexer-performance.md)
3. **Operational Procedures**: Establish maintenance procedures using the [Troubleshooting Guide](indexer-troubleshooting.md)
4. **Chain-Specific Setup**: Follow chain-specific deployment notes in individual indexer documentation

For production deployments, ensure you have:
- ✅ Proper backup procedures
- ✅ Monitoring and alerting
- ✅ Security hardening
- ✅ Documentation for operations team
- ✅ Disaster recovery plan
