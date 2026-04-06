---
title: Sign and Verify Messages
description: Sign messages and verify signatures with Bitcoin accounts.
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

This guide explains how to [sign messages](#sign-a-message) and [verify signatures](#verify-a-signature).

## Sign a Message

You can sign a message with the account's private key using [`account.sign()`](../api-reference.md#sign-message):

{% code title="Sign Message" lineNumbers="true" %}
```javascript
const message = 'Hello, Bitcoin!'
const signature = await account.sign(message)
console.log('Signature:', signature)
```
{% endcode %}

{% hint style="info" %}
The signature is returned as a base64-encoded string.
{% endhint %}

## Verify a Signature

You can verify that a signature was produced by the corresponding private key using [`account.verify()`](../api-reference.md#verify-message-signature):

{% code title="Verify Signature" lineNumbers="true" %}
```javascript
const isValid = await account.verify(message, signature)
console.log('Signature valid:', isValid)
```
{% endcode %}

You can also verify signatures using a [read-only account](../api-reference.md#walletaccountreadonlybtc). Use [`account.toReadOnlyAccount()`](../api-reference.md#toreadonlyaccount) to create one from an owned account, then call [`readOnlyAccount.verify()`](../api-reference.md#verify-message-signature):

{% code title="Verify with Read-Only Account" lineNumbers="true" %}
```javascript
const readOnlyAccount = await account.toReadOnlyAccount()
const isValid = await readOnlyAccount.verify('Hello, Bitcoin!', signature)
console.log('Verified with read-only account:', isValid)
```
{% endcode %}

## Next Steps

Learn how to [handle errors and manage resources](./handle-errors.md).
