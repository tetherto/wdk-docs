---
title: Pear Worklet WDK
description: Low-level HRPC infrastructure for running WDK inside a Bare worklet
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

# Pear Worklet WDK

Pear Worklet WDK is the low-level transport and handler layer for running WDK inside a Bare worklet. It provides the `HRPC` client, the `registerRpcHandlers()` server helper, and the typed request payloads needed to initialize WDK, call wallet methods, and reset selected wallet modules from the host app.

Powered by [`@tetherto/pear-wrk-wdk`](https://github.com/tetherto/pear-wrk-wdk).

## Features

- **Bare worklet bridge**: Connect a host app to a worklet through the shipped `HRPC` client and generated HRPC schema
- **Typed lifecycle requests**: Initialize WDK with `initializeWDK({ config, encryptionKey, encryptedSeed })` and tear it down with `dispose()`
- **Selective wallet resets**: Re-register only the wallet modules listed in a new worklet `networks` config using `resetWdkWallets({ config })`
- **Generic wallet method calls**: Call account methods through `callMethod({ methodName, network, accountIndex, args, options })`
- **Dynamic registration hooks**: Register additional wallets or protocols with `registerWallet()` and `registerProtocol()`

## Why this matters

- You can keep WDK state and signing operations off the main thread in Bare-based apps
- You can reconfigure selected wallet modules without fully disposing the worklet
- You can use one transport layer across custom mobile, desktop, or embedded Bare integrations

{% hint style="info" %}
Use this package when you need direct control over the worklet host and RPC layer. If you want generated worklet entry files instead, start with [`@tetherto/wdk-worklet-bundler`](https://github.com/tetherto/wdk-worklet-bundler).
{% endhint %}

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
				<i class="fa-gear">:gear:</i>
			</td>
			<td>
				<strong>Pear Worklet WDK Configuration</strong>
			</td>
			<td>Build the worklet context and pass the JSON config payloads used by initialize and reset requests</td>
			<td>
				<a href="./configuration.md">configuration.md</a>
			</td>
		</tr>
		<tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>Pear Worklet WDK API Reference</strong>
			</td>
			<td>Review the exported class, server helper, and request shapes</td>
			<td>
				<a href="./api-reference.md">api-reference.md</a>
			</td>
		</tr>
	</tbody>
</table>

***

## Need Help?

{% include "../.gitbook/includes/support-cards.md" %}
