---
title: Backup Cloud React Native Configuration
description: Install and configure @tetherto/wdk-backup-cloud-react-native providers
icon: gear
---

# Backup Cloud React Native Configuration

This page shows how to install `@tetherto/wdk-backup-cloud-react-native`, configure cloud providers, and use `CloudBackup` safely with encrypted wallet key material.

## Install the package

{% code title="Install Backup Cloud React Native" lineNumbers="true" %}
```bash
npm install @tetherto/wdk-backup-cloud-react-native react-native-cloud-storage
```
{% endcode %}

`react-native-cloud-storage` is an optional peer dependency in the package, but the built-in Google Drive and iCloud providers need it at runtime.

{% hint style="info" %}
This package uses native cloud storage capabilities. Configure it in a development build or native app build, not Expo Go.
{% endhint %}

## Google Drive

`GoogleDriveProvider` requires a valid OAuth2 access token. Your app is responsible for sign-in, token refresh, and requesting the Google Drive `drive.appdata` scope.

{% code title="Create Google Drive Backup" lineNumbers="true" %}
```typescript
import { CloudBackup, GoogleDriveProvider } from '@tetherto/wdk-backup-cloud-react-native'

const provider = new GoogleDriveProvider({
  accessToken,
  cloudEmail: 'user@example.com',
  filePath: 'wallet_backup_key.json'
})

const backup = new CloudBackup(provider)

await backup.uploadEncryptedKey(encryptedMasterKey, {
  walletId: 'primary-wallet'
})
```
{% endcode %}

## iCloud

`ICloudProvider` uses iCloud-backed file storage. Use it on iOS devices where iCloud Drive is available and enabled.

{% code title="Create iCloud Backup" lineNumbers="true" %}
```typescript
import { CloudBackup, ICloudProvider } from '@tetherto/wdk-backup-cloud-react-native'

const provider = new ICloudProvider({
  cloudEmail: 'user@example.com',
  filePath: 'wallet_backup_key.json',
  maxSyncRetries: 10,
  syncRetryDelayMs: 1000
})

const backup = new CloudBackup(provider)
const restored = await backup.downloadEncryptedKey()
```
{% endcode %}

## Check availability

Call `isAvailable()` before offering backup or restore actions. Call `exists()` when you need to know whether a backup file is present without downloading it.

{% code title="Check Backup State" lineNumbers="true" %}
```typescript
if (!(await backup.isAvailable())) {
  throw new Error('Cloud backup is not available on this device')
}

const hasBackup = await backup.exists()
```
{% endcode %}

## Runtime notes

- Uploads overwrite the existing backup file for the configured provider path.
- `deleteBackup()` is idempotent and can be called when no backup exists.
- The SDK stores the encrypted key string you pass to it. Encrypt wallet material before calling `uploadEncryptedKey()`.
- Error messages should not contain encrypted key material. Treat backup payloads as sensitive even when encrypted.

***

## Need Help?

{% include "../../.gitbook/includes/support-cards.md" %}
