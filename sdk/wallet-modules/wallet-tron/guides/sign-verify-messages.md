---
title: Sign and Verify Messages
description: Sign messages and verify signatures with Tron accounts using secp256k1.
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

This guide explains how to [sign messages](#sign-a-message) with an owned account and [verify signatures](#verify-a-signature) using a read-only account. Tron uses secp256k1 cryptography for signing.

## Sign a Message

You can produce a cryptographic signature for any string message using [`account.sign()`](../api-reference.md#sign-message):

{% code title="Sign a Message" lineNumbers="true" %}
```javascript
const message = 'Hello, Tron!'
const signature = await account.sign(message)
console.log('Signature:', signature)
```
{% endcode %}

## Verify a Signature

You can verify that a signature was produced by the corresponding private key using [`readOnlyAccount.verify()`](../api-reference.md#verify-message-signature):

{% code title="Verify a Signature" lineNumbers="true" %}
```javascript
const readOnlyAccount = await account.toReadOnlyAccount()
const isValid = await readOnlyAccount.verify(message, signature)
console.log('Signature valid:', isValid)
```
{% endcode %}

{% hint style="info" %}
You can also create a [`WalletAccountReadOnlyTron`](../api-reference.md#walletaccountreadonlytron) from any Tron address to verify signatures without access to the private key.
{% endhint %}

## Next Steps

For best practices on handling errors, managing fees, and cleaning up memory, see [Handle Errors](./handle-errors.md).
