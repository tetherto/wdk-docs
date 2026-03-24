---
title: Sign and Verify Messages
description: Sign messages and verify signatures with gasless TON accounts.
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

# Sign and Verify Messages

This guide explains how to [sign messages](#sign-a-message) with an owned account and [verify signatures](#verify-a-signature).

## Sign a Message

You can produce a cryptographic signature for any string message using [`account.sign()`](../api-reference.md#sign-message):

{% code title="Sign a Message" lineNumbers="true" %}
```javascript
const message = 'Hello, TON!'
const signature = await account.sign(message)
console.log('Signature:', signature)
```
{% endcode %}

## Verify a Signature

You can verify that a signature is valid using [`account.verify()`](../api-reference.md#verify-message-signature):

{% code title="Verify a Signature" lineNumbers="true" %}
```javascript
const isValid = await account.verify(message, signature)
console.log('Signature valid:', isValid)
```
{% endcode %}

You can also create a [`WalletAccountReadOnlyTonGasless`](../api-reference.md#walletaccountreadonlytongasless) from any public key to verify signatures without access to the private key:

{% code title="Verify with Read-Only Account" lineNumbers="true" %}
```javascript
import { WalletAccountReadOnlyTonGasless } from '@tetherto/wdk-wallet-ton-gasless'

const readOnlyAccount = new WalletAccountReadOnlyTonGasless(publicKey, {
  tonClient: {
    url: 'https://toncenter.com/api/v3',
    secretKey: 'your-api-key'
  },
  tonApiClient: {
    url: 'https://tonapi.io/v2',
    secretKey: 'your-ton-api-key'
  },
  paymasterToken: {
    address: 'EQ...'
  }
})

const isValid = await readOnlyAccount.verify(message, signature)
console.log('Signature valid:', isValid)
```
{% endcode %}

## Next Steps

For best practices on handling errors, managing fees, and cleaning up memory, see [Handle Errors](./handle-errors.md).
