---
title: API Reference
description: Complete reference for the WDK Indexer REST API
icon: code
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

### Authentication
All requests require a valid API key in the `X-API-KEY` header:
```http
X-API-KEY: your-api-key-here
```

### Rate Limiting
- **Limit:** 100 requests per minute per API key
- **Headers:** Rate limit info included in response headers

## API Endpoints

{% openapi src="https://wdk-api-staging.tether.su/documentation/json" path="/api/v1/{blockchain}/{token}/{address}/token-transfers" method="get" %}
Get token transfer history
{% endopenapi %}

{% openapi src="https://wdk-api-staging.tether.su/documentation/json" path="/api/v1/{blockchain}/{token}/{address}/token-transfers" method="get" %}
Get token transfer history
{% endopenapi %}

{% openapi src="https://wdk-api-staging.tether.su/documentation/json" path="/api/v1/{blockchain}/{token}/{address}/token-balances" method="get" %}
Get token balance
{% endopenapi %}


## Need Help?

{% include "../../.gitbook/includes/support-cards.md" %}
