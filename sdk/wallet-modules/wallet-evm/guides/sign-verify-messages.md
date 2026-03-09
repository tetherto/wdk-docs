---
title: Sign and Verify Messages
description: Sign messages and verify signatures with EVM accounts.
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

Use `account.sign()` to produce a cryptographic signature for any string message.

{% code title="Sign a Message" lineNumbers="true" %}
```javascript
const message = 'Hello, Ethereum!'
const signature = await account.sign(message)
console.log('Signature:', signature)
```
{% endcode %}

## Verify a Signature

Use a read-only account to verify that a signature was produced by the corresponding private key.

{% code title="Verify a Signature" lineNumbers="true" %}
```javascript
const readOnlyAccount = await account.toReadOnlyAccount()
const isValid = await readOnlyAccount.verify(message, signature)
console.log('Signature valid:', isValid)
```
{% endcode %}

{% hint style="info" %}
You can also create a `WalletAccountReadOnlyEvm` from any public address to verify signatures without access to the private key.
{% endhint %}

## Next Steps

For best practices on handling errors, managing fees, and cleaning up memory, see [Error Handling](./error-handling.md).
