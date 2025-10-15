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

## Base URL

{% code title="API Base URL" %}
```
https://wdk-api.tether.io
```
{% endcode %}

{% hint style="info" %}
- Request API key: `https://wdk-api.tether.io/request`
{% endhint %}

***

## Authentication

All requests require a valid API key in the `x-api-key` header:

{% code title="Authentication Header" %}
```http
x-api-key: your-api-key-here
```
{% endcode %}

{% hint style="info" %}
**Don't have an API key yet?** Request one by following the steps in our [Get Started](get-started.md) guide.
{% endhint %}

***

## Rate Limiting

| Endpoint | Limit |
| --- | --- |
| `GET /api/v1/:blockchain/:token/:address/token-balances` | 4 req / 10s |
| `GET /api/v1/:blockchain/:token/:address/token-transfers` | 8 req / 10s |

{% hint style="info" %}
Response headers include window info:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642694400
```
{% endhint %}

***

## API Endpoints

{% openapi src="./openapi.json" path="/api/v1/health" method="get" %}
Check API server status
{% endopenapi %}

***

{% openapi src="./openapi.json" path="/api/v1/{blockchain}/{token}/{address}/token-transfers" method="get" %}
Get token transfer history for an address
{% endopenapi %}

***

{% openapi src="./openapi.json" path="/api/v1/{blockchain}/{token}/{address}/token-balances" method="get" %}
Get current token balance for an address
{% endopenapi %}

***

## Error Handling

The API returns standard HTTP error codes:

| Status Code | Description |
| --- | --- |
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Invalid API key |
| 404 | Not Found - Resource not found |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

### Error Response Format

{% code title="Error Response" lineNumbers="true" %}
```json
{
  "error": "error_type",
  "message": "Detailed error message"
}
```
{% endcode %}

***

## Next Steps

* [**Get Started**](get-started.md) - Quick start guide with setup instructions
* [**React Native Starter**](../../examples-and-starters/react-native-starter.md) - See it in action

***

## Need Help?

{% include "../../.gitbook/includes/support-cards.md" %}
