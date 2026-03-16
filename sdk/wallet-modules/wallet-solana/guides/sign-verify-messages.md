---
title: Sign and Verify Messages
description: Sign messages and verify signatures with Solana accounts using Ed25519.
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

This guide explains how to sign arbitrary messages with an owned account and verify signatures using a read-only account. Solana uses Ed25519 cryptography for signing.

## Sign a Message

Use [`account.sign()`](/sdk/wallet-modules/wallet-solana/api-reference#sign-message) to produce an Ed25519 signature for any string message.

{% code title="Sign a Message" lineNumbers="true" %}
```javascript
const message = 'Hello, Solana!'
const signature = await account.sign(message)
console.log('Signature:', signature)
```
{% endcode %}

## Verify a Signature

You can get a [read-only account](/sdk/wallet-modules/wallet-solana/api-reference#walletaccountreadonlysolana) from any `Account` object by calling [`account.toReadOnlyAccount()`](/sdk/wallet-modules/wallet-solana/api-reference#toreadonlyaccount). Use a read-only account to [`verify()`](/sdk/wallet-modules/wallet-solana/api-reference#verify-message-signature) that a signature was produced by the corresponding private key.

{% code title="Verify a Signature" lineNumbers="true" %}
```javascript
const readOnlyAccount = await account.toReadOnlyAccount()
const isValid = await readOnlyAccount.verify(message, signature)
console.log('Signature valid:', isValid)
```
{% endcode %}

{% hint style="info" %}
You can also create a [`WalletAccountReadOnlySolana`](/sdk/wallet-modules/wallet-solana/api-reference#walletaccountreadonlysolana) from any public key to verify signatures without access to the private key.
{% endhint %}

## Next Steps

For best practices on handling errors, managing fees, and cleaning up memory, see [Error Handling](./error-handling.md).
