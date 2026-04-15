---
title: Failover Provider API Reference
description: API for @tetherto/wdk-failover-provider
icon: code
---

# API Reference

## Package: `@tetherto/wdk-failover-provider`

### Class: `FailoverProvider<T>`

`FailoverProvider<T>` collects provider candidates of one shared shape and returns a proxied `T` that retries failed calls against the next provider.

#### Constructor

Use the constructor to set retry behavior before you add provider candidates:

{% code title="Create A FailoverProvider Factory" lineNumbers="true" %}
```javascript
new FailoverProvider({
  retries,        // optional, defaults to 3
  shouldRetryOn   // optional, defaults to (error) => error instanceof Error
})
```
{% endcode %}

- `retries` (`number`, optional): Number of additional attempts after the first failure. Total attempts are `1 + retries`.
- `shouldRetryOn` (`(error: Error) => boolean`, optional): Predicate that decides whether the proxy should switch to the next provider after a failure.

#### Methods

| Method | Description | Returns |
| --- | --- | --- |
| `addProvider(provider)` | Register one provider candidate and return the same factory so you can chain more candidates. | `FailoverProvider<T>` |
| `initialize()` | Return a proxied provider of type `T` that reads from the active provider and retries failed calls against the next provider. | `T` |

#### `addProvider(provider)`

Register a provider candidate. Every candidate should satisfy the same `T` shape because `initialize()` returns one proxied `T`.

{% code title="Register A Provider Candidate" lineNumbers="true" %}
```javascript
const factory = new FailoverProvider({ retries: 1 })

factory.addProvider({
  name: 'primary',
  async getBlockNumber () {
    return 21345678
  }
})
```
{% endcode %}

#### `initialize()`

Create the failover-enabled proxy after you have added at least one provider. The runtime throws if the factory is still empty.

{% code title="Initialize The Failover Proxy" lineNumbers="true" %}
```javascript
const provider = new FailoverProvider({ retries: 1 })
  .addProvider(primary)
  .addProvider(secondary)
  .initialize()

const blockNumber = await provider.getBlockNumber()
```
{% endcode %}

#### `FailoverProviderConfig`

The package exports the `FailoverProviderConfig` type through its top-level type surface.

| Field | Description |
| --- | --- |
| `retries?` | Additional retry attempts after the first failure. Defaults to `3`. |
| `shouldRetryOn?` | Retry predicate for thrown errors and rejected promises. Defaults to retrying any `Error` instance. |

## Runtime behavior

- `initialize()` returns a JavaScript `Proxy` over the first added provider.
- Non-function properties are forwarded from the currently active provider.
- If a property getter throws and `shouldRetryOn(error)` returns `true`, the runtime advances to the next provider before retrying the property access.
- If a synchronous method throws and `shouldRetryOn(error)` returns `true`, the runtime advances to the next provider and retries the method call.
- If an asynchronous method rejects and `shouldRetryOn(error)` returns `true`, the runtime advances to the next provider and retries the method call.
- Provider switching is round-robin. If the active provider already changed while another call was failing, the runtime keeps the newer active provider instead of advancing twice.

## Example

This example shows a transient failure on the first provider and a successful retry on the second provider:

{% code title="Retry Across Two Providers" lineNumbers="true" %}
```javascript
import FailoverProvider from '@tetherto/wdk-failover-provider'

const primary = {
  async getBlockNumber () {
    throw new Error('temporary upstream outage')
  }
}

const secondary = {
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

const blockNumber = await provider.getBlockNumber()
```
{% endcode %}

***

## Need Help?

{% include "../../.gitbook/includes/support-cards.md" %}
