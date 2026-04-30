---
title: Backup Cloud React Native API Reference
description: API surface for @tetherto/wdk-backup-cloud-react-native
icon: code
---

# Backup Cloud React Native API Reference

## Exports

| Export | Type | Description |
|--------|------|-------------|
| `CloudBackup` | Class | High-level wrapper around a `CloudProvider`. |
| `GoogleDriveProvider` | Class | Google Drive `appDataFolder` provider. |
| `ICloudProvider` | Class | iCloud provider backed by `react-native-cloud-storage`. |
| `CloudProvider` | Interface | Provider contract for upload, download, delete, availability, and existence checks. |
| `GoogleDriveConfig` | Type | Configuration for `GoogleDriveProvider`. |
| `ICloudConfig` | Type | Configuration for `ICloudProvider`. |
| `CloudEncryptionKeyFile` | Type | Backup payload shape stored in cloud storage. |
| `CloudKeyResult` | Type | Rich result type for cloud key retrieval flows. |
| `CloudUnavailableError` | Class | Cloud service is unavailable or disabled. |
| `CloudAuthError` | Class | Credentials are invalid, expired, or missing. |
| `CloudStorageError` | Class | Read, write, delete, or parse operation failed. |
| `CloudValidationError` | Class | Caller supplied an invalid argument or payload. |

## CloudBackup

```typescript
new CloudBackup(provider: CloudProvider)
```

### Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `uploadEncryptedKey(key, metadata)` | Uploads an encrypted wallet master key and metadata. | `Promise<CloudEncryptionKeyFile | null>` |
| `downloadEncryptedKey()` | Downloads the encrypted key file. | `Promise<CloudEncryptionKeyFile | null>` |
| `deleteBackup()` | Deletes the configured backup file. | `Promise<void>` |
| `isAvailable()` | Checks whether the provider is accessible. | `Promise<boolean>` |
| `exists()` | Checks whether a backup file exists without downloading it. | `Promise<boolean>` |

## CloudProvider

```typescript
interface CloudProvider {
  upload(encryptedKey: string, metadata: Record<string, unknown>): Promise<CloudEncryptionKeyFile | null>
  download(): Promise<CloudEncryptionKeyFile | null>
  delete(): Promise<void>
  isAvailable(): Promise<boolean>
  exists(): Promise<boolean>
}
```

## GoogleDriveConfig

```typescript
interface GoogleDriveConfig {
  readonly accessToken: string
  readonly filePath?: string
  readonly cloudEmail?: string
}
```

`accessToken` must be a valid OAuth2 access token scoped to `drive.appdata`. The package does not perform OAuth flows.

## ICloudConfig

```typescript
interface ICloudConfig {
  readonly filePath?: string
  readonly cloudEmail?: string
  readonly maxSyncRetries?: number
  readonly syncRetryDelayMs?: number
}
```

`maxSyncRetries` and `syncRetryDelayMs` control retry behavior when iCloud has a placeholder file that still needs to sync to the device.

## CloudEncryptionKeyFile

```typescript
interface CloudEncryptionKeyFile {
  readonly encryptionKey: string
  readonly savedAt: string
  readonly platform: 'ios' | 'android'
  readonly version: number
  readonly cloudEmail: string
}
```

## Errors

All cloud errors extend `CloudError` and carry a machine-readable `code`:

```typescript
type CloudErrorCode =
  | 'CLOUD_UNAVAILABLE'
  | 'CLOUD_AUTH_ERROR'
  | 'CLOUD_STORAGE_ERROR'
  | 'CLOUD_VALIDATION_ERROR'
```

***

## Need Help?

{% include "../../.gitbook/includes/support-cards.md" %}
