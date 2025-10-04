# WDK Indexer Monitoring

## Overview

Comprehensive monitoring is essential for maintaining healthy WDK Indexer deployments across all blockchain networks. This guide covers metrics collection, alerting strategies, observability practices, and troubleshooting workflows that apply to all supported chains.

> **Repository Context**: Core architecture and worker communication patterns are from repository implementations. Monitoring strategies, Prometheus configurations, and alerting rules are production deployment recommendations.

## Monitoring Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   WDK Indexer   │───▶│   Prometheus     │───▶│   Grafana       │
│   Metrics       │    │   (Collection)   │    │   (Dashboard)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Application   │    │   Alertmanager   │    │   Incident      │
│   Logs          │    │   (Alerting)     │    │   Response      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Key Metrics

### Processor Worker Metrics

**Sync Status:**
- `indexer_current_block`: Current indexed block number
- `indexer_chain_height`: Latest block on blockchain
- `indexer_sync_lag`: Difference between chain height and indexed block
- `indexer_sync_lag_seconds`: Time lag in seconds behind chain tip

**Processing Performance:**
- `indexer_blocks_processed_total`: Total blocks processed (counter)
- `indexer_blocks_processing_duration`: Time to process a block (histogram)
- `indexer_transactions_processed_total`: Total transactions indexed (counter)
- `indexer_batch_size`: Number of blocks processed per batch (gauge)

**Error Tracking:**
- `indexer_errors_total`: Total errors encountered (counter)
- `indexer_rpc_errors_total`: RPC-specific errors (counter)
- `indexer_database_errors_total`: Database operation errors (counter)

### API Worker Metrics

**Request Metrics:**
- `indexer_api_requests_total`: Total API requests (counter)
- `indexer_api_request_duration`: Request processing time (histogram)
- `indexer_api_active_connections`: Current active connections (gauge)
- `indexer_api_rate_limit_hits`: Rate limit violations (counter)

**Response Metrics:**
- `indexer_api_responses_total`: Total responses by status code (counter)
- `indexer_api_cache_hits_total`: Cache hit count (counter)
- `indexer_api_cache_misses_total`: Cache miss count (counter)

**Health Metrics:**
- `indexer_api_uptime_seconds`: API worker uptime (gauge)
- `indexer_api_health_status`: Health check status (gauge)

### Database Metrics

**Hyperbee Metrics:**
- `indexer_db_operations_total`: Database operations count (counter)
- `indexer_db_operation_duration`: Database operation latency (histogram)
- `indexer_db_size_bytes`: Database size in bytes (gauge)
- `indexer_db_replication_peers`: Number of replication peers (gauge)

**P2P Replication:**
- `indexer_p2p_peers_connected`: Currently connected peers (gauge)
- `indexer_p2p_data_replicated_bytes`: Data replicated over P2P (counter)
- `indexer_p2p_connection_errors`: P2P connection failures (counter)

### System Metrics

**Resource Usage:**
- `process_cpu_usage_percent`: CPU usage percentage (gauge)
- `process_memory_usage_bytes`: Memory usage in bytes (gauge)
- `process_heap_usage_bytes`: Heap memory usage (gauge)
- `process_file_descriptors`: Open file descriptors (gauge)

**Network Metrics:**
- `indexer_network_bytes_sent`: Network bytes sent (counter)
- `indexer_network_bytes_received`: Network bytes received (counter)
- `indexer_rpc_response_time`: RPC provider response times (histogram)

## Prometheus Configuration

### Metrics Endpoint

WDK Indexers expose metrics on the `/metrics` endpoint:

```bash
# Default metrics endpoint
curl http://localhost:8080/metrics

# Sample metrics output
# HELP indexer_current_block Current indexed block number
# TYPE indexer_current_block gauge
indexer_current_block{chain="bitcoin"} 850000

# HELP indexer_sync_lag Blocks behind chain tip
# TYPE indexer_sync_lag gauge
indexer_sync_lag{chain="bitcoin"} 0
```

### Prometheus Configuration

**prometheus.yml:**
```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "indexer_alerts.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  # Bitcoin Indexer
  - job_name: 'bitcoin-processor'
    static_configs:
      - targets: ['bitcoin-processor:8080']
    scrape_interval: 15s
    metrics_path: /metrics
    scrape_timeout: 10s

  - job_name: 'bitcoin-api'
    static_configs:
      - targets: 
        - 'bitcoin-api-1:8080'
        - 'bitcoin-api-2:8080'
        - 'bitcoin-api-3:8080'
    scrape_interval: 15s
    metrics_path: /metrics

  # EVM Indexer
  - job_name: 'ethereum-processor'
    static_configs:
      - targets: ['ethereum-processor:8080']
    scrape_interval: 15s

  # Add other chains as needed...

  # System metrics (optional)
  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
```

### Docker Compose with Monitoring

**docker-compose.monitoring.yml:**
```yaml
version: '3.8'

services:
  # Existing indexer services...
  
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - ./monitoring/alerts:/etc/prometheus/alerts
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=30d'
      - '--web.enable-lifecycle'
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin123
    volumes:
      - grafana-data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards
      - ./monitoring/grafana/datasources:/etc/grafana/provisioning/datasources
    restart: unless-stopped

  alertmanager:
    image: prom/alertmanager:latest
    container_name: alertmanager
    ports:
      - "9093:9093"
    volumes:
      - ./monitoring/alertmanager.yml:/etc/alertmanager/alertmanager.yml
      - alertmanager-data:/alertmanager
    restart: unless-stopped

volumes:
  prometheus-data:
  grafana-data:
  alertmanager-data:
```

## Alerting Rules

### Critical Alerts

**indexer_alerts.yml:**
```yaml
groups:
  - name: indexer.critical
    rules:
      # Sync lag alerts
      - alert: IndexerSyncLagHigh
        expr: indexer_sync_lag > 10
        for: 5m
        labels:
          severity: warning
          team: blockchain
        annotations:
          summary: "Indexer {{ $labels.chain }} sync lag is high"
          description: "Indexer for {{ $labels.chain }} is {{ $value }} blocks behind"

      - alert: IndexerSyncLagCritical
        expr: indexer_sync_lag > 50
        for: 2m
        labels:
          severity: critical
          team: blockchain
        annotations:
          summary: "Indexer {{ $labels.chain }} severely behind"
          description: "Indexer for {{ $labels.chain }} is {{ $value }} blocks behind - immediate attention required"

      # Service health alerts
      - alert: IndexerProcessorDown
        expr: up{job=~".*-processor"} == 0
        for: 1m
        labels:
          severity: critical
          team: blockchain
        annotations:
          summary: "Indexer processor {{ $labels.job }} is down"
          description: "The indexer processor for {{ $labels.job }} has been down for more than 1 minute"

      - alert: IndexerAPIDown
        expr: up{job=~".*-api"} == 0
        for: 1m
        labels:
          severity: critical
          team: blockchain
        annotations:
          summary: "Indexer API {{ $labels.job }} is down"
          description: "The indexer API for {{ $labels.job }} has been down for more than 1 minute"

  - name: indexer.performance
    rules:
      # Performance alerts
      - alert: IndexerHighErrorRate
        expr: rate(indexer_errors_total[5m]) > 0.1
        for: 5m
        labels:
          severity: warning
          team: blockchain
        annotations:
          summary: "High error rate in indexer {{ $labels.chain }}"
          description: "Error rate is {{ $value }} errors/second over the last 5 minutes"

      - alert: IndexerSlowProcessing
        expr: histogram_quantile(0.95, rate(indexer_blocks_processing_duration_bucket[5m])) > 30
        for: 10m
        labels:
          severity: warning
          team: blockchain
        annotations:
          summary: "Slow block processing in {{ $labels.chain }}"
          description: "95th percentile block processing time is {{ $value }}s"

      - alert: IndexerHighMemoryUsage
        expr: process_memory_usage_bytes / 1024 / 1024 / 1024 > 8
        for: 5m
        labels:
          severity: warning
          team: blockchain
        annotations:
          summary: "High memory usage in indexer {{ $labels.job }}"
          description: "Memory usage is {{ $value }}GB"

  - name: indexer.availability
    rules:
      # API availability alerts
      - alert: IndexerAPIHighLatency
        expr: histogram_quantile(0.95, rate(indexer_api_request_duration_bucket[5m])) > 5
        for: 5m
        labels:
          severity: warning
          team: blockchain
        annotations:
          summary: "High API latency for {{ $labels.chain }}"
          description: "95th percentile API response time is {{ $value }}s"

      - alert: IndexerAPIHighErrorRate
        expr: rate(indexer_api_responses_total{status=~"5.."}[5m]) / rate(indexer_api_responses_total[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
          team: blockchain
        annotations:
          summary: "High API error rate for {{ $labels.chain }}"
          description: "API error rate is {{ $value }}% over the last 5 minutes"

  - name: indexer.infrastructure
    rules:
      # Infrastructure alerts
      - alert: IndexerDatabaseConnectionLoss
        expr: indexer_db_replication_peers == 0
        for: 5m
        labels:
          severity: warning
          team: blockchain
        annotations:
          summary: "Database replication peers lost for {{ $labels.chain }}"
          description: "No database replication peers connected"

      - alert: IndexerRPCProviderDown
        expr: rate(indexer_rpc_errors_total[5m]) > 0.5
        for: 5m
        labels:
          severity: critical
          team: blockchain
        annotations:
          summary: "RPC provider issues for {{ $labels.chain }}"
          description: "High RPC error rate: {{ $value }} errors/second"
```

### Alertmanager Configuration

**alertmanager.yml:**
```yaml
global:
  smtp_smarthost: 'smtp.company.com:587'
  smtp_from: 'alerts@company.com'
  smtp_auth_username: 'alerts@company.com'
  smtp_auth_password: 'password'

route:
  group_by: ['alertname', 'chain']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'web.hook'
  routes:
    - match:
        severity: critical
      receiver: 'critical-alerts'
      repeat_interval: 5m
    - match:
        severity: warning
      receiver: 'warning-alerts'
      repeat_interval: 30m

receivers:
  - name: 'web.hook'
    webhook_configs:
      - url: 'http://webhook.company.com/alerts'
        send_resolved: true

  - name: 'critical-alerts'
    email_configs:
      - to: 'blockchain-team@company.com'
        subject: 'CRITICAL: {{ .GroupLabels.alertname }} - {{ .GroupLabels.chain }}'
        body: |
          {{ range .Alerts }}
          Alert: {{ .Annotations.summary }}
          Description: {{ .Annotations.description }}
          {{ end }}
    slack_configs:
      - api_url: 'YOUR_SLACK_WEBHOOK_URL'
        channel: '#blockchain-alerts'
        title: 'CRITICAL Alert'
        text: '{{ range .Alerts }}{{ .Annotations.summary }}{{ end }}'

  - name: 'warning-alerts'
    email_configs:
      - to: 'blockchain-team@company.com'
        subject: 'Warning: {{ .GroupLabels.alertname }} - {{ .GroupLabels.chain }}'
```

## Grafana Dashboards

### Main Indexer Dashboard

**Dashboard Configuration:**
```json
{
  "dashboard": {
    "title": "WDK Indexer Monitoring",
    "panels": [
      {
        "title": "Sync Status",
        "type": "stat",
        "targets": [
          {
            "expr": "indexer_sync_lag",
            "legendFormat": "{{ chain }} lag"
          }
        ]
      },
      {
        "title": "Block Processing Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(indexer_blocks_processed_total[5m])",
            "legendFormat": "{{ chain }} blocks/sec"
          }
        ]
      },
      {
        "title": "API Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(indexer_api_requests_total[5m])",
            "legendFormat": "{{ chain }} requests/sec"
          }
        ]
      },
      {
        "title": "Error Rates",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(indexer_errors_total[5m])",
            "legendFormat": "{{ chain }} errors/sec"
          }
        ]
      }
    ]
  }
}
```

### Chain-Specific Dashboards

**Bitcoin Dashboard Variables:**
```json
{
  "templating": {
    "list": [
      {
        "name": "chain",
        "type": "constant",
        "current": {
          "value": "bitcoin"
        }
      }
    ]
  }
}
```

## Logging Strategy

### Structured Logging

**Log Configuration:**
```json
{
  "debug": 1,
  "logging": {
    "level": "info",
    "format": "json",
    "fields": {
      "service": "wdk-indexer",
      "chain": "bitcoin",
      "component": "processor"
    }
  }
}
```

**Sample Log Entry:**
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "info",
  "message": "Block processed successfully",
  "service": "wdk-indexer",
  "chain": "bitcoin",
  "component": "processor",
  "blockNumber": 850000,
  "transactionCount": 1234,
  "processingTimeMs": 1500,
  "correlationId": "abc123"
}
```

### Log Aggregation

**Filebeat Configuration:**
```yaml
filebeat.inputs:
  - type: container
    paths:
      - '/var/lib/docker/containers/*/*.log'
    processors:
      - add_docker_metadata: ~

output.elasticsearch:
  hosts: ["elasticsearch:9200"]
  index: "wdk-indexer-logs-%{+yyyy.MM.dd}"

setup.template.name: "wdk-indexer"
setup.template.pattern: "wdk-indexer-*"
```

**ELK Stack Integration:**
```yaml
# docker-compose.logging.yml
version: '3.8'

services:
  elasticsearch:
    image: elasticsearch:7.17.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms1g -Xmx1g"
    volumes:
      - elasticsearch-data:/usr/share/elasticsearch/data
    ports:
      - "9200:9200"

  kibana:
    image: kibana:7.17.0
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch

  filebeat:
    image: elastic/filebeat:7.17.0
    volumes:
      - ./filebeat.yml:/usr/share/filebeat/filebeat.yml
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
    depends_on:
      - elasticsearch

volumes:
  elasticsearch-data:
```

## Health Checks

### Endpoint Health Checks

**Basic Health Check:**
```bash
#!/bin/bash
# health-check.sh

INDEXER_URL="http://localhost:8080"
TIMEOUT=10

# Basic connectivity
if ! curl -f -m $TIMEOUT "$INDEXER_URL/health" > /dev/null 2>&1; then
    echo "CRITICAL: Health endpoint unreachable"
    exit 2
fi

# Detailed health data
HEALTH_DATA=$(curl -s -m $TIMEOUT "$INDEXER_URL/health")
STATUS=$(echo "$HEALTH_DATA" | jq -r '.status')

if [ "$STATUS" != "healthy" ]; then
    echo "CRITICAL: Service reports unhealthy status: $STATUS"
    exit 2
fi

echo "OK: Service is healthy"
exit 0
```

**Comprehensive Health Check:**
```bash
#!/bin/bash
# comprehensive-health-check.sh

INDEXER_URL="http://localhost:8080"
CHAIN="bitcoin"
WARNING_LAG=5
CRITICAL_LAG=20

# Get sync status
SYNC_DATA=$(curl -s -X POST "$INDEXER_URL/rpc" -d '{
  "jsonrpc": "2.0",
  "method": "getBlockFromChain",
  "params": {"blockNumber": "latest"},
  "id": 1
}')

CURRENT_BLOCK=$(echo "$SYNC_DATA" | jq -r '.result.blockNumber')
CHAIN_HEIGHT=$(curl -s "https://blockstream.info/api/blocks/tip/height")
LAG=$((CHAIN_HEIGHT - CURRENT_BLOCK))

if [ $LAG -gt $CRITICAL_LAG ]; then
    echo "CRITICAL: Sync lag is $LAG blocks"
    exit 2
elif [ $LAG -gt $WARNING_LAG ]; then
    echo "WARNING: Sync lag is $LAG blocks"
    exit 1
fi

echo "OK: Sync lag is $LAG blocks"
exit 0
```

### Kubernetes Health Checks

**Liveness Probe:**
```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 30
  periodSeconds: 30
  timeoutSeconds: 10
  failureThreshold: 3
```

**Readiness Probe:**
```yaml
readinessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 10
  timeoutSeconds: 5
  successThreshold: 1
  failureThreshold: 3
```

## Performance Monitoring

### Key Performance Indicators (KPIs)

**Sync Performance:**
- Blocks processed per second
- Time to sync from scratch
- Average block processing time
- Transaction throughput

**API Performance:**
- Request latency (p50, p95, p99)
- Requests per second capacity
- Error rate percentage
- Cache hit ratio

**Resource Efficiency:**
- CPU utilization percentage
- Memory usage patterns
- Disk I/O operations
- Network bandwidth usage

### Performance Benchmarking

**Load Testing Script:**
```bash
#!/bin/bash
# load-test.sh

INDEXER_URL="http://localhost:8080"
CONCURRENT_USERS=50
DURATION=300  # 5 minutes

# Install artillery if not present
which artillery || npm install -g artillery

# Create test configuration
cat > artillery-config.yml << EOF
config:
  target: '$INDEXER_URL'
  phases:
    - duration: $DURATION
      arrivalRate: 10
  processor: "./custom-functions.js"

scenarios:
  - name: "API Load Test"
    weight: 100
    flow:
      - post:
          url: "/rpc"
          json:
            jsonrpc: "2.0"
            method: "getBalance"
            params:
              address: "{{ \$randomBitcoinAddress() }}"
            id: 1
EOF

# Run load test
artillery run artillery-config.yml
```

### Resource Monitoring Scripts

**Resource Monitor:**
```bash
#!/bin/bash
# monitor-resources.sh

CONTAINER_NAME="bitcoin-processor"
LOG_FILE="/var/log/indexer-resources.log"

while true; do
    TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    # Get container stats
    STATS=$(docker stats --no-stream --format "table {{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}" $CONTAINER_NAME | tail -n 1)
    
    echo "$TIMESTAMP $CONTAINER_NAME $STATS" >> $LOG_FILE
    
    sleep 60
done
```

## Incident Response

### Alert Runbooks

**Sync Lag Alert Response:**
1. Check processor health and logs
2. Verify RPC provider connectivity
3. Check system resources (CPU, memory, disk)
4. Review recent configuration changes
5. Escalate if lag continues to increase

**API Down Alert Response:**
1. Check API worker health status
2. Verify load balancer configuration
3. Check processor-to-API connectivity
4. Review application logs for errors
5. Restart API workers if necessary

**High Error Rate Response:**
1. Identify error patterns in logs
2. Check RPC provider status
3. Verify database connectivity
4. Review recent deployments
5. Implement temporary rate limiting if needed

### Escalation Matrix

| Alert Severity | Response Time | Escalation Path |
|----------------|---------------|-----------------|
| Critical | 5 minutes | On-call engineer → Team lead → Manager |
| Warning | 30 minutes | On-call engineer → Team lead |
| Info | 4 hours | Regular work hours review |

## Monitoring Best Practices

### Metric Collection

1. **Use consistent labeling**: Apply consistent labels across all metrics
2. **Avoid high cardinality**: Limit unique label combinations
3. **Monitor what matters**: Focus on business-critical metrics
4. **Establish baselines**: Know normal operating parameters

### Alerting Strategy

1. **Alert on symptoms, not causes**: Focus on user impact
2. **Reduce alert fatigue**: Tune thresholds appropriately
3. **Group related alerts**: Use alert grouping and routing
4. **Document response procedures**: Maintain current runbooks

### Dashboard Design

1. **Start with overview**: High-level health dashboard
2. **Drill down capability**: Link to detailed views
3. **Include context**: Add annotations for deployments
4. **Regular reviews**: Update dashboards based on incidents

## Troubleshooting Monitoring

### Common Issues

**Missing Metrics:**
```bash
# Check if metrics endpoint is accessible
curl http://localhost:8080/metrics

# Verify Prometheus scraping
curl http://prometheus:9090/api/v1/targets
```

**High Cardinality:**
```bash
# Check metric cardinality
curl -s http://prometheus:9090/api/v1/label/__name__/values | jq '.data | length'

# Identify high cardinality metrics
curl -s http://prometheus:9090/api/v1/label/__name__/values | jq -r '.data[]' | sort
```

**Alert Not Firing:**
```bash
# Check alert rule syntax
promtool check rules indexer_alerts.yml

# Verify alert evaluation
curl http://prometheus:9090/api/v1/rules
```

## Next Steps

After implementing monitoring:

1. **Establish Baselines**: Collect baseline metrics for normal operations
2. **Tune Alerts**: Adjust thresholds based on observed patterns
3. **Create Runbooks**: Document response procedures for each alert
4. **Regular Reviews**: Schedule monthly monitoring effectiveness reviews
5. **Capacity Planning**: Use metrics for infrastructure planning

For chain-specific monitoring considerations, refer to individual indexer documentation:
- [Bitcoin Monitoring](indexer-btc.md#monitoring-and-maintenance)
- [EVM Monitoring](indexer-evm.md#monitoring-and-maintenance)
- [Solana Monitoring](indexer-solana.md#monitoring-and-maintenance)
- [TON Monitoring](indexer-ton.md#monitoring-and-maintenance)
- [TRON Monitoring](indexer-tron.md#monitoring-and-maintenance)
- [Spark Monitoring](indexer-spark.md#monitoring-and-maintenance)
