---
title: Get Started
description: Learn about the WDK Indexer REST API and how to use it
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


The WDK Indexer REST API provides fast, reliable access to blockchain transaction data across multiple networks including Bitcoin, Ethereum, Solana, TON, TRON, Spark, Polygon, and Arbitrum.

{% hint style="info" %}
- API base URL: `https://wdk-api.tether.io`
- Request API key: `https://wdk-api.tether.io/register`
{% endhint %}

A blockchain indexer continuously monitors and organizes blockchain transactions, making them instantly searchable through a simple REST API.

***

## Getting Started

{% stepper %}
{% step %}
#### Request API Key

Request your API key to access the WDK Indexer API.

<a class="button primary" href="https://wdk-api.tether.io/register">Request API Key</a>

{% endstep %}

{% step %}
#### Make Your First Request

Use your API key to query blockchain data via the REST API.
{% endstep %}
{% endstepper %}

***

## Rate Limiting

The WDK Indexer API implements rate limiting to ensure fair usage and system stability:

| Endpoint | Limit |
| --- | --- |
| `GET /api/v1/:blockchain/:token/:address/token-balances` | 4 req / 10s |
| `GET /api/v1/:blockchain/:token/:address/token-transfers` | 8 req / 10s |

***

## Authentication

All API requests require your API key in the `x-api-key` header:

{% code title="Authentication Header" lineNumbers="false" %}
```http
x-api-key: your-api-key-here
```
{% endcode %}

***

## Quick Example

Here's a quick example of how to query a token balance with curl.

{% code title="Using curl" lineNumbers="true" %}
```bash
curl -X GET "http://wdk-api.tether.to/api/v1/ethereum/usdt/0x742d35cc.../token-balances" \
     -H "x-api-key: your-api-key-here"
```
{% endcode %}

{% code title="Using JavaScript" lineNumbers="true" %}
```javascript
const axios = require('axios');

async function getTokenBalance(blockchain, token, address) {
  const response = await axios.get(
    `http://wdk-api.tether.to/api/v1/${blockchain}/${token}/${address}/token-balances`,
    {
      headers: {
        'x-api-key': 'your-api-key-here'
      }
    }
  );
  
  return response.data.tokenBalance;
}

const balance = await getTokenBalance('ethereum', 'usdt', '0x742d35cc...');
console.log(`Balance: ${balance.amount} ${balance.token.toUpperCase()}`);
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
