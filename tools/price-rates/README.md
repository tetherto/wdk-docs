---
title: Price Rates
description: Unified pricing tools for fetching current and historical asset prices
author: Raquel Carrasco Gonzalez
lastReviewed: 2025-10-06
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

# Price Rates

Pricing utilities for WDK apps. Includes HTTP clients and providers to retrieve current and historical prices from supported services.

Powered by [`@tetherto/wdk-pricing-bitfinex-http`](https://github.com/tetherto/wdk-pricing-bitfinex-http) and compatible with [`@tetherto/wdk-pricing-provider`](https://github.com/tetherto/wdk-pricing-provider).

## Features

- **Current Prices**: Fetch latest price for a base/quote pair (e.g., BTC/USD)
- **Historical Series**: Retrieve historical price series; long histories optionally downscaled to ≤ 100 points
- **Provider Compatibility**: Works with `@tetherto/wdk-pricing-provider`
- **Lightweight HTTP Client**: Minimal dependencies; easy to integrate

## Why this matters

- Consistent pricing is required for balance valuations, charts, and quotes
- A unified client reduces integration time and data handling errors

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
				<i class="fa-book-open">:book-open:</i>
			</td>
			<td>
				<strong>Price Rates Overview</strong>
			</td>
			<td>Get started with WDK price clients</td>
			<td>
				<a href="./configuration.md">configuration.md</a>
			</td>
		</tr>
		<tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>Price Rates API</strong>
			</td>
			<td>Check the API reference and examples</td>
			<td>
				<a href="./api-reference.md">api-reference.md</a>
			</td>
		</tr>
	</tbody>
</table>

***

### Need Help?

{% include "../.gitbook/includes/support-cards.md" %}

