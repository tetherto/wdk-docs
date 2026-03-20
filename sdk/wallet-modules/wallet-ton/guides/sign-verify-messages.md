---
title: Sign and Verify Messages
description: Sign messages and verify signatures with TON accounts.
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

This guide explains how to sign arbitrary messages with an owned account and verify signatures using a read-only account.

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

You can verify that a signature was produced by the corresponding private key using [`readOnlyAccount.verify()`](../api-reference.md#verify-message-signature):

{% code title="Verify a Signature" lineNumbers="true" %}
```javascript
const readOnlyAccount = await account.toReadOnlyAccount()
const isValid = await readOnlyAccount.verify(message, signature)
console.log('Signature valid:', isValid)
```
{% endcode %}

{% hint style="info" %}
You can also create a [`WalletAccountReadOnlyTon`](../api-reference.md#walletaccountreadonlyton) from any public key to verify signatures without access to the private key.
{% endhint %}

## Next Steps

For best practices on handling errors, managing fees, and cleaning up memory, see [Handle Errors](./handle-errors.md).
