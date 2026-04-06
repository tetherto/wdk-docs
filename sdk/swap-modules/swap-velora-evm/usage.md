---
title: Swap velora EVM Guides
description: How to install and use @tetherto/wdk-protocol-swap-velora-evm for swapping tokens on EVM
icon: book-open
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

# Usage

The [@tetherto/wdk-protocol-swap-velora-evm](https://www.npmjs.com/package/@tetherto/wdk-protocol-swap-velora-evm) module routes ERC-20 swaps on EVM chains through Velora. Use the guides below for setup, execution, quotes, and error handling.


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
      <td><i class="fa-rocket">:rocket:</i></td>
      <td><strong>Get Started</strong></td>
      <td>Install the package, create VeloraProtocolEvm, and review supported networks.</td>
      <td><a href="./guides/get-started.md">Get Started</a></td>
    </tr>
    <tr>
      <td><i class="fa-exchange-alt">:exchange-alt:</i></td>
      <td><strong>Execute Swaps</strong></td>
      <td>Exact-input and exact-output swaps, including ERC-4337 smart accounts.</td>
      <td><a href="./guides/execute-swaps.md">Execute Swaps</a></td>
    </tr>
    <tr>
      <td><i class="fa-calculator">:calculator:</i></td>
      <td><strong>Get Swap Quotes</strong></td>
      <td>Quote before swapping and compare fees to your max fee cap.</td>
      <td><a href="./guides/get-swap-quotes.md">Get Swap Quotes</a></td>
    </tr>
    <tr>
      <td><i class="fa-exclamation-triangle">:exclamation-triangle:</i></td>
      <td><strong>Handle Errors</strong></td>
      <td>Handle swap and quote failures and dispose wallet state safely.</td>
      <td><a href="./guides/handle-errors.md">Handle Errors</a></td>
    </tr>
  </tbody>
</table>


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
				<strong>Node.js Quickstart</strong>
			</td>
			<td>Get started with WDK in a Node.js environment</td>
			<td>
				<a href="../../../start-building/nodejs-bare-quickstart.md">Node.js & Bare Quickstart</a>
			</td>
		</tr>
        <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK velora Swap Protocol Configuration</strong>
			</td>
			<td>RPC, fee limits, and environment settings for the Velora swap protocol</td>
			<td>
				<a href="./configuration.md">WDK velora Swap Protocol Configuration</a>
			</td>
		</tr>
        <tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK velora Swap Protocol API</strong>
			</td>
			<td>Methods, options, and error notes for VeloraProtocolEvm</td>
			<td>
				<a href="./api-reference.md">WDK velora Swap Protocol API</a>
			</td>
		</tr>
	</tbody>
</table>

{% include "../../../.gitbook/includes/support-cards.md" %}
