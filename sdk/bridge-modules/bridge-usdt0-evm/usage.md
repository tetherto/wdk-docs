---
title: Bridge USD₮0 EVM Usage
description: Task-focused guides for @tetherto/wdk-protocol-bridge-usdt0-evm
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

The [@tetherto/wdk-protocol-bridge-usdt0-evm](https://www.npmjs.com/package/@tetherto/wdk-protocol-bridge-usdt0-evm) package bridges USD₮0 across EVM and selected non-EVM networks. Use the guides below for setup, standard and gasless bridging, cross-ecosystem recipients, and error handling.


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
      <td>Install the package, attach WalletAccountEvm, and review supported chains.</td>
      <td><a href="./guides/get-started.md">Get Started</a></td>
    </tr>
    <tr>
      <td><i class="fa-exchange-alt">:exchange-alt:</i></td>
      <td><strong>Bridge Tokens</strong></td>
      <td>EVM-to-EVM bridges, quotes, fee caps, and optional OFT or endpoint overrides.</td>
      <td><a href="./guides/bridge-tokens.md">Bridge Tokens</a></td>
    </tr>
    <tr>
      <td><i class="fa-bolt">:bolt:</i></td>
      <td><strong>Bridge with ERC-4337</strong></td>
      <td>Gasless bridging with WalletAccountEvmErc4337 and paymaster options.</td>
      <td><a href="./guides/bridge-with-4337.md">Bridge with ERC-4337</a></td>
    </tr>
    <tr>
      <td><i class="fa-globe">:globe:</i></td>
      <td><strong>Bridge Cross-Ecosystem</strong></td>
      <td>Send toward Solana, TON, or TRON recipients from EVM.</td>
      <td><a href="./guides/bridge-cross-ecosystem.md">Bridge Cross-Ecosystem</a></td>
    </tr>
    <tr>
      <td><i class="fa-exclamation-triangle">:exclamation-triangle:</i></td>
      <td><strong>Handle Errors</strong></td>
      <td>Interpret bridge failures and dispose of signing material safely.</td>
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
				<strong>WDK Bridge USD₮0 EVM Protocol Configuration</strong>
			</td>
			<td>Configure RPC, fees, and protocol options for this bridge</td>
			<td>
				<a href="./configuration.md">WDK Bridge USD₮0 EVM Protocol Configuration</a>
			</td>
		</tr>
		<tr>
			<td>
				<i class="fa-code">:code:</i>
			</td>
			<td>
				<strong>WDK Bridge USD₮0 EVM Protocol API</strong>
			</td>
			<td>Constructor, methods, types, and error behavior</td>
			<td>
				<a href="./api-reference.md">WDK Bridge USD₮0 EVM Protocol API</a>
			</td>
		</tr>
	</tbody>
</table>

***

{% include "../../../.gitbook/includes/support-cards.md" %}
