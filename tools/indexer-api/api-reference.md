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
| `GET /api/v1/health` | 10 req / 1 hour |
| `GET /api/v1/:blockchain/:token/:address/token-balances` | 4 req / 10s |
| `GET /api/v1/:blockchain/:token/:address/token-transfers` | 8 req / 10s |
| `POST /api/v1/batch/token-transfers` | 8 req / 10s |
| `POST /api/v1/batch/token-balances` | 4 req / 10s |

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

{% openapi src="./openapi.json" path="/api/v1/batch/token-transfers" method="post" %}
Get batch token transfers for multiple addresses
{% endopenapi %}

***

{% openapi src="./openapi.json" path="/api/v1/batch/token-balances" method="post" %}
Get batch token balances for multiple addresses
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
