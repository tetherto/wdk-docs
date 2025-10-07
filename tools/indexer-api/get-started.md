---
title: Get Started
description: Get started with the WDK Indexer REST API in minutes
icon: rocket
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

# Get Started

The WDK Indexer REST API provides fast, reliable access to blockchain transaction data across multiple networks including Bitcoin, Ethereum, Solana, TON, TRON, Spark, Polygon, and Arbitrum.

A blockchain indexer continuously monitors and organizes blockchain transactions, making them instantly searchable through a simple JSON-RPC 2.0 API.

***

## Getting Started

{% stepper %}
{% step %}
#### Request API Key

Request your API key to access the WDK Indexer API.

<a href="https://forms.google.com/your-api-key-request-form"><button>Request API Key</button></a>
{% endstep %}

{% step %}
#### Get Your Credentials

You'll receive:
* Your unique API key
* API endpoint: `http://wdk-api-01.tether.to/rpc`
{% endstep %}

{% step %}
#### Make Your First Request

Use your API key to query blockchain data via the JSON-RPC 2.0 endpoint.
{% endstep %}
{% endstepper %}

***

## Rate Limiting

The WDK Indexer API implements rate limiting to ensure fair usage and system stability:

* **Default Limit**: 100 requests per minute per IP
* **Burst Allowance**: Up to 10 requests in burst
* **Response Headers**: Rate limit information included in all responses

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642694400
```

***

## Authentication

For production deployments, the API can be secured with:

* **API Keys**: Include in `Authorization` header
* **IP Whitelisting**: Restrict access to specific IP ranges
* **JWT Tokens**: For user-specific access control

{% code title="Authenticated Request" lineNumbers="true" %}
```javascript
const response = await axios.post('https://your-indexer.com/rpc', {
  jsonrpc: '2.0',
  method: 'getBalance',
  params: { address: '0x742d35cc6634c0c7e4c4b5c7f2b8e6f5f8c3e1a2' },
  id: 1
}, {
  headers: {
    'Authorization': 'Bearer your-api-key-here'
  }
});
```
{% endcode %}

***

## Quick Example

Here's a simple example of querying an address balance:

{% code title="Get Balance" lineNumbers="true" %}
```javascript
const axios = require('axios');

async function getBalance(address) {
  const response = await axios.post('http://wdk-api-01.tether.to/rpc', {
    jsonrpc: '2.0',
    method: 'getBalance',
    params: { address },
    id: 1
  }, {
    headers: {
      'Authorization': 'Bearer your-api-key-here'
    }
  });
  
  if (response.data.error) {
    throw new Error(response.data.error.message);
  }
  
  return response.data.result;
}

// Usage
const balance = await getBalance('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');
console.log(`Balance: ${balance} BTC`);
```
{% endcode %}

{% hint style="info" %}
**Need more examples?** Check out the complete [API Reference](api-reference.md) for detailed method documentation, parameters, and response formats.
{% endhint %}

***

## Next Steps

* [**API Reference**](api-reference.md) - Complete method documentation with examples and response formats

***

## Need Help?

{% include "../../.gitbook/includes/support-cards.md" %}
