---
title: Transaction History
description: Retrieve and filter Bitcoin transfer history.
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
    visible: false
  metadata:
    visible: false
---

# Transaction History

This guide explains how to [retrieve all transfers](#retrieve-all-transfers), [filter by direction](#filter-by-direction), [paginate results](#paginate-results), and [check transaction receipts](#check-transaction-receipts).

## Retrieve All Transfers

You can retrieve the account's transfer history using [`account.getTransfers()`](../api-reference.md#gettransfers-options):

{% code title="Get All Transfers" lineNumbers="true" %}
```javascript
const transfers = await account.getTransfers()
console.log('Recent transfers:', transfers)
```
{% endcode %}

{% hint style="info" %}
The default limit is 10 transfers. Change outputs are automatically filtered out. Transfers are sorted by block height (newest first).
{% endhint %}

## Filter by Direction

You can filter transfers by direction using the `direction` option in [`account.getTransfers()`](../api-reference.md#gettransfers-options):

{% code title="Incoming Transfers" lineNumbers="true" %}
```javascript
const incoming = await account.getTransfers({ direction: 'incoming' })
console.log('Incoming transfers:', incoming)
```
{% endcode %}

You can retrieve outgoing transfers with a custom limit using [`account.getTransfers()`](../api-reference.md#gettransfers-options):

{% code title="Outgoing Transfers" lineNumbers="true" %}
```javascript
const outgoing = await account.getTransfers({
  direction: 'outgoing',
  limit: 5
})
console.log('Outgoing transfers:', outgoing)
```
{% endcode %}

## Paginate Results

You can paginate through transfer history using the `limit` and `skip` options in [`account.getTransfers()`](../api-reference.md#gettransfers-options):

{% code title="Paginate Transfers" lineNumbers="true" %}
```javascript
const page = await account.getTransfers({
  direction: 'all',
  limit: 20,
  skip: 10
})
console.log('Transfers 11-30:', page)
```
{% endcode %}

## Check Transaction Receipts

You can check whether a specific transaction has been confirmed using [`account.getTransactionReceipt()`](../api-reference.md#gettransactionreceipt-hash):

{% code title="Get Transaction Receipt" lineNumbers="true" %}
```javascript
const receipt = await account.getTransactionReceipt('abc123...')
if (receipt) {
  console.log('Transaction confirmed')
}
```
{% endcode %}

## Next Steps

Learn how to [sign and verify messages](./sign-verify-messages.md).
