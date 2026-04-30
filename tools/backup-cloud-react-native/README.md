---
title: Backup Cloud React Native
description: Cloud backup helper for encrypted wallet keys in Expo and React Native apps
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

# Backup Cloud React Native

Backup Cloud React Native stores encrypted wallet backup keys in user-owned cloud storage. Use it when a React Native wallet app already encrypts sensitive wallet material locally and needs a small cloud layer for Google Drive or iCloud backup recovery.

Powered by [`@tetherto/wdk-backup-cloud-react-native`](https://www.npmjs.com/package/@tetherto/wdk-backup-cloud-react-native).

## Features

- **Provider abstraction**: Use `CloudBackup` with any implementation of `CloudProvider`.
- **Google Drive provider**: Store backup files in Google Drive `appDataFolder` with a caller-supplied OAuth2 access token.
- **iCloud provider**: Store and restore backup files through `react-native-cloud-storage` on iOS.
- **Typed backup payloads**: Read and write `CloudEncryptionKeyFile` objects with `encryptionKey`, `savedAt`, `platform`, `version`, and `cloudEmail`.
- **Typed errors**: Catch `CloudUnavailableError`, `CloudAuthError`, `CloudStorageError`, and `CloudValidationError`.

## When to use it

Use this package for encrypted key backup only. It does not encrypt wallet data for you, run Google OAuth flows, or create a full wallet recovery UX by itself. Pair it with secure local storage and your app's authentication flow.

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
      <td>Install the package, configure providers, and understand platform requirements.</td>
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
      <td>Review `CloudBackup`, provider configs, result types, and errors.</td>
      <td>
        <a href="./api-reference.md">api-reference.md</a>
      </td>
    </tr>
  </tbody>
</table>

***

## Need Help?

{% include "../../.gitbook/includes/support-cards.md" %}
