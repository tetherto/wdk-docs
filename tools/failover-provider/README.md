---
title: Failover Provider
description: Generic provider failover wrapper for retrying sync and async calls across provider candidates
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

# Failover Provider

Failover Provider wraps multiple provider-like objects behind one proxy so your integration can retry failed calls against the next candidate without rewriting each call site. Use this page to review the [Configuration](./configuration.md) and [API Reference](./api-reference.md) for the released `@tetherto/wdk-failover-provider` surface.

Powered by [`@tetherto/wdk-failover-provider`](https://github.com/tetherto/wdk-failover-provider).

## Features

- **Generic provider wrapper**: `FailoverProvider<T>` accepts any provider-like object type and returns a proxied `T` from `initialize()`.
- **Configurable retries**: Set `retries` to control how many additional attempts happen after the first failure.
- **Retry predicate**: Use `shouldRetryOn(error)` to decide which errors should advance to the next provider.
- **Sync and async failover**: The runtime retries both synchronous throws and rejected promises.
- **Zero runtime dependencies**: The published package ships a single default export with no runtime dependency tree.

## Why this matters

- You can keep one provider-shaped integration surface while rotating between browser, JSON-RPC, or custom provider implementations.
- You can narrow failover behavior to transient errors instead of retrying every exception.
- You can add redundancy to read-heavy or submission-heavy flows without building your own retry proxy.

<table data-card-size="large" data-view="cards">
  <thead>
    <tr>
      <th></th>
      <th></th>
      <th></th>
      <th data-hidden data-card-target data-type="content-ref"></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <i class="fa-code">:code:</i>
      </td>
      <td>
        <strong>Failover Provider Configuration</strong>
      </td>
      <td>Install the package, add provider candidates, and tune retry behavior.</td>
      <td>
        <a href="./configuration.md">configuration.md</a>
      </td>
    </tr>
    <tr>
      <td>
        <i class="fa-mobile-alt">:mobile-alt:</i>
      </td>
      <td>
        <strong>Failover Provider API Reference</strong>
      </td>
      <td>Review `FailoverProvider<T>`, its config, and the proxied runtime behavior.</td>
      <td>
        <a href="./api-reference.md">api-reference.md</a>
      </td>
    </tr>
  </tbody>
</table>

***

## Need Help?

{% include "../.gitbook/includes/support-cards.md" %}
