---
title: Transaction History - Developer Integration Guide
description: How to fetch and display wallet transaction history using the WDK.
lastReviewed: 2024‑01‑15
---

# Transaction History

> **Scope**  
> This guide covers **client‑side** integration only. Indexer deployment, scaling, and monitoring are detailed separately in the [Indexer section](indexer.md).


**Related Docs**: [Indexer Overview](indexer.md) · [Indexer API Reference](indexer/indexer-api-reference.md)

---

## 1. What Is Transaction History?

A chronological list of all transfers for a user’s addresses, enriched with token metadata, fiat values, and status.

**User expectations**

| Requirement | Details |
|-------------|---------|
| Completeness | All chains & assets |
| Real‑time    | New txs appear instantly |
| Rich data    | Token logo, fiat value, status |
| Filtering    | By asset, date, direction |
| Grouping     | Show related transfers together |

---

## 2. Blockchain Models (Retrieval Nuances)

| Model | Examples | Integration Hint |
|-------|----------|------------------|
| **UTXO** | Bitcoin | Detect change outputs to avoid double‑counting. |
| **Account** | Ethereum, EVM L2s | Parse **event logs** for token transfers. |
| **Message** | Solana, TON | Each tx can hold multiple instructions—parse all. |

---

## 3. WDK API Integration

The WDK exposes a single **`/v1/transactions`** endpoint that normalises data across chains.

```ts
GET /v1/transactions
  • limit        (default 50, max 200)
  • cursor       (opaque string for pagination)
  • addresses[]  (user addresses)
  • tokens[]     (optional filter)
  • direction    (in | out | self)
  • fromDate/toDate (ISO 8601)
```

### Minimal client example

```js
import { WDKClient } from '@wdk/sdk';

const wdk = new WDKClient({
  baseURL: 'https://api.your-wdk.com',
  apiKey: process.env.WDK_API_KEY
});

export async function fetchTxHistory({ addresses, cursor }) {
  const { data } = await wdk.get('/v1/transactions', {
    params: { addresses, limit: 50, cursor }
  });
  return data;        // { transactions[], pagination{} }
}
```

**Response (trimmed)**

```ts
interface Transaction {
  blockchain: string;           // "bitcoin" | "ethereum" | ...
  transactionHash: string;
  direction: 'in' | 'out' | 'self';
  token: string;                // "btc" | "eth" | "usdt" | ...
  amount: string;
  timestamp: string;            // ISO‑8601
  status: 'pending' | 'confirmed' | 'failed';
  confirmations: number;
  fee?: string;
}
```

---

## 4. Client‑Side Patterns

| Goal       | Approach                                                                   |
| ---------- | -------------------------------------------------------------------------- |
| Pagination | Use cursor returned by API; append to local list.                          |
| Real‑time  | Open **`wss://api.../transactions/live`** and subscribe to user addresses. |
| Caching    | Cache last response (e.g. `localStorage`) for 1–5 min to reduce calls.     |
| React hook | See `useTransactionHistory` example in `/examples`.                        |

---

## 5. Security & Privacy

* Request only the addresses you must display.
* Hash addresses before sending to analytics (`SHA‑256 + salt`).
* Enforce client‑side rate limiting (≤ 100 req / min) to avoid API throttling.

---

## 6. Performance Tips

| Technique              | Benefit                                                  |
| ---------------------- | -------------------------------------------------------- |
| **Batching**           | Combine up to 200 txs per request.                       |
| **Virtual scrolling**  | Render long lists without DOM bloat.                     |
| **Prefetch next page** | Fetch `cursor`+1 in background when user nears list end. |

<!-- ---

## 7. Next Steps

1. **UI patterns** → [Transaction History UI Patterns](transaction-history-ui-patterns.md)
2. **Full examples** → [`/examples/transaction-history`](transaction-history-examples.md)
3. **Indexer ops** → [Deployment Guide](indexer/indexer-deployment.md) -->

