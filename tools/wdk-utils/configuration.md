---
title: WDK Utils Configuration
description: Install and import validation helpers and EIP-681 parsers from @tetherto/wdk-utils
icon: gear
---

# WDK Utils Configuration

This package does not have constructor options or runtime configuration. This page shows how to install `@tetherto/wdk-utils`, import the helpers you need, and understand the published runtime surface.

## Install the package

You can install `@tetherto/wdk-utils` from npm:

{% code title="Install @tetherto/wdk-utils" lineNumbers="true" %}
```bash
npm install @tetherto/wdk-utils
```
{% endcode %}

## Import address validation helpers

You can import only the validators your flow needs from the package entrypoint:

{% code title="Import Address Validators" lineNumbers="true" %}
```javascript
import {
  validateBitcoinAddress,
  validateEVMAddress,
  validateLightningInvoice,
  validateLnurl,
  validateLightningAddress,
  validateSparkAddress,
  validateUmaAddress,
  resolveUmaUsername
} from '@tetherto/wdk-utils'
```
{% endcode %}

## Import EIP-681 helpers

You can detect and parse token transfer requests using the `beta.2` EIP-681 helpers:

{% code title="Import EIP-681 Helpers" lineNumbers="true" %}
```javascript
import {
  isEip681Request,
  parseEip681Request
} from '@tetherto/wdk-utils'
```
{% endcode %}

## Runtime notes

- `@tetherto/wdk-utils` exports plain functions. There is no client object to initialize.
- The package publishes a default module entrypoint through `index.js` and a bare runtime entrypoint through `bare.js`.
- `parseEip681Request()` currently supports transfer requests for the schemes implemented in the published runtime: `ethereum`, `pol`, `matic`, `polygon`, `arbitrum`, and `plasma`.
- `parseEip681Request()` accepts both `uint256` and `value` query parameters for the amount field and normalizes the parsed amount into `amountSmallest`.

## Examples

You can validate common wallet inputs before handing them to a module:

{% code title="Validate Common Inputs" lineNumbers="true" %}
```javascript
import {
  validateBitcoinAddress,
  validateLightningAddress,
  validateUmaAddress
} from '@tetherto/wdk-utils'

const btc = validateBitcoinAddress('bc1qu9yqnhc6wjj6s62s9x0shnl5l2r7gq5cudm94r7mvwv0uw4s7acq0hn9g6')
const lightning = validateLightningAddress('sprycomfort92@waletofsatoshi.com')
const uma = validateUmaAddress('$you@uma.money')
```
{% endcode %}

You can parse a request-shaped EIP-681 transfer string into structured data:

{% code title="Parse An EIP-681 Transfer Request" lineNumbers="true" %}
```javascript
import { parseEip681Request } from '@tetherto/wdk-utils'

const request = parseEip681Request(
  'pol:0xc2132D05D31c914a87C6611C10748AEb04B58e8F@137/transfer?address=0xA9e338082A061d657014c08e652D96B38639F22a&uint256=0.175309000e6'
)
```
{% endcode %}

***

## Need Help?

{% include "../../.gitbook/includes/support-cards.md" %}
