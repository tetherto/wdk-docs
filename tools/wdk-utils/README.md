---
title: WDK Utils
description: Address validation helpers and EIP-681 request parsers for @tetherto/wdk-utils
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

# WDK Utils

WDK Utils provides validation helpers for Bitcoin, EVM, Lightning, Spark, and UMA identifiers, plus EIP-681 request parsing helpers for token transfer deep links. Powered by [`@tetherto/wdk-utils`](https://github.com/tetherto/wdk-utils).

## Features

- **Address validation helpers**: Validate Bitcoin, EVM, Lightning invoice, LNURL, Lightning address, Spark, and UMA inputs before you hand them to a wallet flow.
- **EIP-681 request parsing**: Detect request-shaped EIP-681 strings and parse transfer payloads into `recipient`, `tokenAddress`, `chainId`, and `amountSmallest`.
- **No runtime setup**: Import the functions you need. The package has no constructor or runtime configuration.
- **TypeScript support**: The published package ships typed exports for every validator and parser.
- **Bare runtime export**: The package publishes a bare entrypoint in addition to the default module entrypoint.

## Why this matters

- Validate user input early and return machine-readable failure reasons before you attempt a transaction or resolution flow.
- Normalize EIP-681 payment links into structured transfer data that wallet UIs can inspect before execution.
- Reuse the same helpers across Node.js and Bare-based environments without adding a larger wallet module dependency.

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
        <strong>WDK Utils Configuration</strong>
      </td>
      <td>Install the package, import the helpers, and review runtime notes.</td>
      <td>
        <a href="./configuration.md">configuration.md</a>
      </td>
    </tr>
    <tr>
      <td>
        <i class="fa-mobile-alt">:mobile-alt:</i>
      </td>
      <td>
        <strong>WDK Utils API Reference</strong>
      </td>
      <td>Review the exported validators, parsers, and result types.</td>
      <td>
        <a href="./api-reference.md">api-reference.md</a>
      </td>
    </tr>
  </tbody>
</table>

***

## Need Help?

{% include "../.gitbook/includes/support-cards.md" %}
