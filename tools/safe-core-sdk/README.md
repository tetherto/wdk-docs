---
title: Safe Core SDK
description: Package map and usage notes for Safe Core SDK packages used with WDK integrations
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

# Safe Core SDK

Safe Core SDK is an external Safe package family for interacting with Safe contracts, the Safe Transaction Service, and Safe transaction relay flows. Use this page as a package map when a WDK integration needs Safe account, transaction-service, or relay capabilities.

The [`safe-core-sdk`](https://www.npmjs.com/package/safe-core-sdk) npm package is a monorepo snapshot. It does not expose a single top-level runtime API for application imports. In app code, install the scoped Safe package that matches the capability you need.

## Package map

| Package | Use it for |
|---------|------------|
| `@safe-global/protocol-kit` | Creating and signing Safe transactions, interacting with Safe contracts, and managing Safe account state. |
| `@safe-global/api-kit` | Reading and proposing transactions through the Safe Transaction Service. |
| `@safe-global/relay-kit` | Relaying Safe transactions and abstracting gas payment flows. |
| `@safe-global/auth-kit` | Authentication flows for Safe-powered apps. |
| `@safe-global/onramp-kit` | Fiat onramp flows exposed by Safe. |
| `@safe-global/safe-core-sdk-types` | Shared TypeScript types used by Safe SDK packages. |

## Install the package you need

{% code title="Install Safe Packages" lineNumbers="true" %}
```bash
npm install @safe-global/protocol-kit @safe-global/api-kit
```
{% endcode %}

Add `@safe-global/relay-kit` only when you need relay or gas abstraction behavior.

## WDK integration notes

- Treat Safe packages as external SDK dependencies, not WDK wallet modules.
- Keep WDK wallet signing and Safe transaction construction as separate steps in your app architecture.
- Use Safe's scoped package documentation for constructor parameters, network support, and transaction-service URLs.
- Do not import from `safe-core-sdk` directly in app code unless a specific Safe release documents a top-level export for that version.

## Related packages

- [`@safe-global/protocol-kit`](https://www.npmjs.com/package/@safe-global/protocol-kit)
- [`@safe-global/api-kit`](https://www.npmjs.com/package/@safe-global/api-kit)
- [`@safe-global/relay-kit`](https://www.npmjs.com/package/@safe-global/relay-kit)
- [`@safe-global/safe-core-sdk-types`](https://www.npmjs.com/package/@safe-global/safe-core-sdk-types)

***

## Need Help?

{% include "../../.gitbook/includes/support-cards.md" %}
