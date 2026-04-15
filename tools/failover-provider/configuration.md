---
title: Failover Provider Configuration
description: Install @tetherto/wdk-failover-provider and configure retries, retry predicates, and provider candidates
icon: gear
---

# Failover Provider Configuration

This page shows how to install `@tetherto/wdk-failover-provider`, configure `retries` and `shouldRetryOn`, and build a proxied provider with `addProvider()` and `initialize()`.

## Install the package

You can install the package from npm:

{% code title="Install @tetherto/wdk-failover-provider" lineNumbers="true" %}
```bash
npm install @tetherto/wdk-failover-provider
```
{% endcode %}

## Create a failover provider

You can wrap any provider-like object type. This example uses plain objects so the retry behavior is easy to see:

{% code title="Create A Failover Provider" lineNumbers="true" %}
```javascript
import FailoverProvider from '@tetherto/wdk-failover-provider'

const primary = {
  name: 'primary',
  async getBlockNumber () {
    throw new Error('temporary upstream outage')
  }
}

const secondary = {
  name: 'secondary',
  async getBlockNumber () {
    return 21345678
  }
}

const provider = new FailoverProvider({
  retries: 1,
  shouldRetryOn: (error) => error.message.includes('temporary')
})
  .addProvider(primary)
  .addProvider(secondary)
  .initialize()
```
{% endcode %}

## Configuration options

### `retries`

`retries` controls how many additional attempts happen after the first failure. The published runtime defaults to `3`, which means a call can make up to `1 + retries` total attempts before the latest error is thrown.

### `shouldRetryOn`

`shouldRetryOn(error)` decides whether a thrown error or rejected promise should advance to the next provider. The published default retries on any `Error` instance.

Use a narrow predicate when you only want to retry transient failures:

{% code title="Retry Only On Transient Errors" lineNumbers="true" %}
```javascript
const provider = new FailoverProvider({
  retries: 2,
  shouldRetryOn: (error) => /timeout|temporary|429/.test(error.message)
})
```
{% endcode %}

## Register provider candidates

Call `addProvider(provider)` once per candidate before you call `initialize()`. `addProvider()` returns the same `FailoverProvider` instance, so you can chain the calls.

The generic type `T` applies to every added candidate, so keep the provider shape consistent across the chain.

{% code title="Add Multiple Provider Candidates" lineNumbers="true" %}
```javascript
const provider = new FailoverProvider({ retries: 2 })
  .addProvider(primary)
  .addProvider(secondary)
  .addProvider({
    name: 'tertiary',
    async getBlockNumber () {
      return 21345679
    }
  })
  .initialize()
```
{% endcode %}

## Initialize the proxy

Call `initialize()` after you have added at least one provider. The returned value is a proxied provider of type `T`.

The runtime throws if you call `initialize()` before adding any providers:

{% code title="Initialize Requires At Least One Provider" lineNumbers="true" %}
```javascript
const factory = new FailoverProvider()

factory.initialize()
// Error: Cannot initialize an empty provider. Call `addProvider` before this function.
```
{% endcode %}

## Runtime notes

- Non-function properties are read from the currently active provider.
- When a synchronous method throws and `shouldRetryOn(error)` returns `true`, the proxy switches to the next provider and retries.
- When an asynchronous method rejects and `shouldRetryOn(error)` returns `true`, the proxy switches to the next provider and retries.
- Provider selection advances in round-robin order. If `retries` is larger than the number of providers, the runtime loops back through the list.

***

## Need Help?

{% include "../../.gitbook/includes/support-cards.md" %}
