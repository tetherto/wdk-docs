---
title: React Native Secure Storage
description: Secure wallet credential storage for React Native apps
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

# React Native Secure Storage

React Native Secure Storage provides a typed wrapper for storing encrypted wallet seed material and encryption keys with `react-native-keychain`. It is designed for React Native wallet apps that need app-scoped encrypted storage with optional biometric access.

Powered by [`@tetherto/wdk-react-native-secure-storage`](https://www.npmjs.com/package/@tetherto/wdk-react-native-secure-storage).

## Features

- **Wallet credential helpers**: Store and retrieve encrypted seeds, encrypted entropy, and encryption keys.
- **Per-wallet identifiers**: Pass an optional `identifier` to isolate storage keys for multiple wallets.
- **Biometric access**: Require biometric authentication for encryption key reads with `requireBiometrics`.
- **Device security checks**: Check whether device passcode, PIN, pattern, or biometrics are enabled before sensitive flows.
- **Typed errors**: Catch validation, authentication, timeout, keychain read, and keychain write failures.

## When to use it

Use this package for local encrypted storage in React Native wallet apps. It does not generate wallet seeds, encrypt plaintext seed material by itself, or provide cloud backup. Pair it with WDK wallet modules and a backup provider when you need recovery across devices.

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
        <strong>Configuration</strong>
      </td>
      <td>Install dependencies, configure authentication prompts, and create a storage instance.</td>
      <td>
        <a href="./configuration.md">configuration.md</a>
      </td>
    </tr>
    <tr>
      <td>
        <i class="fa-mobile-alt">:mobile-alt:</i>
      </td>
      <td>
        <strong>API Reference</strong>
      </td>
      <td>Review `createSecureStorage`, storage methods, options, constants, and errors.</td>
      <td>
        <a href="./api-reference.md">api-reference.md</a>
      </td>
    </tr>
  </tbody>
</table>

***

## Need Help?

{% include "../../.gitbook/includes/support-cards.md" %}
