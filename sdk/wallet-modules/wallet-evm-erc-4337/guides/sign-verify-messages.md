---
title: Sign and Verify Messages
description: Sign messages and EIP-712 typed data with smart accounts.
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

This guide explains how to [sign messages](#sign-a-message), [verify signatures](#verify-a-signature), and [sign EIP-712 typed data](#sign-typed-data-eip-712).

## Sign a Message

You can sign a message with the account's private key using [`account.sign()`](../api-reference.md#sign-message):

{% code title="Sign Message" lineNumbers="true" %}
```javascript
const signature = await account.sign('Hello, ERC-4337!')
console.log('Signature:', signature)
```
{% endcode %}

## Verify a Signature

You can verify a signature using a read-only account. Use [`account.toReadOnlyAccount()`](../api-reference.md#toreadonlyaccount) to create one, then call [`readOnlyAccount.verify()`](../api-reference.md#verify-message-signature):

{% code title="Verify Signature" lineNumbers="true" %}
```javascript
const readOnlyAccount = await account.toReadOnlyAccount()
const isValid = await readOnlyAccount.verify('Hello, ERC-4337!', signature)
console.log('Signature valid:', isValid)
```
{% endcode %}

## Sign Typed Data (EIP-712)

You can sign EIP-712 structured data using [`account.signTypedData()`](../api-reference.md#signtypeddata-typeddata):

{% code title="Sign Typed Data" lineNumbers="true" %}
```javascript
const typedData = {
  domain: {
    name: 'MyDApp',
    version: '1',
    chainId: 1,
    verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
  },
  types: {
    Mail: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'contents', type: 'string' }
    ]
  },
  message: {
    from: '0x1234567890abcdef1234567890abcdef12345678',
    to: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    contents: 'Hello!'
  }
}

const typedDataSignature = await account.signTypedData(typedData)
console.log('Typed data signature:', typedDataSignature)
```
{% endcode %}

You can verify typed data signatures using [`readOnlyAccount.verifyTypedData()`](../api-reference.md#verifytypeddata-typeddata-signature):

{% code title="Verify Typed Data" lineNumbers="true" %}
```javascript
const readOnlyAccount = await account.toReadOnlyAccount()
const isValid = await readOnlyAccount.verifyTypedData(typedData, typedDataSignature)
console.log('Typed data signature valid:', isValid)
```
{% endcode %}

## Next Steps

Learn how to [handle errors and manage resources](./handle-errors.md).
