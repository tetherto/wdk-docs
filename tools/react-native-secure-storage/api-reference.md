---
title: React Native Secure Storage API Reference
description: API surface for @tetherto/wdk-react-native-secure-storage
icon: code
---

# React Native Secure Storage API Reference

## Exports

| Export | Type | Description |
|--------|------|-------------|
| `createSecureStorage` | Function | Creates a `SecureStorage` instance. |
| `SecureStorage` | Interface | Wallet credential storage contract. |
| `SecureStorageOptions` | Type | Factory options for logger, authentication, and timeout behavior. |
| `AuthenticationOptions` | Type | Biometric prompt options. |
| `SecureStorageItemOptions` | Type | Per-item storage options such as `requireBiometrics`. |
| `LogLevel`, `defaultLogger` | Value | Built-in logger controls. |
| `MAX_IDENTIFIER_LENGTH`, `MAX_VALUE_LENGTH` | Constant | Validation limits for identifiers and stored values. |
| `MIN_TIMEOUT_MS`, `MAX_TIMEOUT_MS` | Constant | Allowed timeout bounds. |
| `SecureStorageError` | Class | Base error class. |
| `KeychainWriteError`, `KeychainReadError` | Class | Keychain operation errors. |
| `AuthenticationError` | Class | Authentication failed or was unavailable. |
| `ValidationError` | Class | Input validation failed. |
| `TimeoutError` | Class | Operation timed out. |
| `DeviceSecurityNotEnabledError` | Class | Device security is not enabled when required by the app. |

## createSecureStorage

```typescript
function createSecureStorage(options?: SecureStorageOptions): SecureStorage
```

### SecureStorageOptions

```typescript
interface SecureStorageOptions {
  logger?: Logger
  authentication?: AuthenticationOptions
  timeoutMs?: number
}
```

### AuthenticationOptions

```typescript
interface AuthenticationOptions {
  promptMessage?: string
  cancelLabel?: string
  disableDeviceFallback?: boolean
}
```

## SecureStorage

| Method | Description | Returns |
|--------|-------------|---------|
| `isDeviceSecurityEnabled()` | Checks whether device passcode, PIN, pattern, or biometrics are enabled. | `Promise<boolean>` |
| `isBiometricAvailable()` | Checks whether biometric authentication is available. | `Promise<boolean>` |
| `authenticate()` | Runs the configured authentication prompt. | `Promise<boolean>` |
| `setEncryptionKey(key, identifier?, options?)` | Stores the wallet encryption key. | `Promise<void>` |
| `getEncryptionKey(identifier?, options?)` | Reads the wallet encryption key. | `Promise<string \| null>` |
| `setEncryptedSeed(encryptedSeed, identifier?)` | Stores an encrypted seed payload. | `Promise<void>` |
| `getEncryptedSeed(identifier?)` | Reads an encrypted seed payload. | `Promise<string \| null>` |
| `setEncryptedEntropy(encryptedEntropy, identifier?)` | Stores encrypted entropy. | `Promise<void>` |
| `getEncryptedEntropy(identifier?)` | Reads encrypted entropy. | `Promise<string \| null>` |
| `getAllEncrypted(identifier?)` | Reads encrypted seed, encrypted entropy, and encryption key together. | `Promise<{ encryptedSeed: string \| null; encryptedEntropy: string \| null; encryptionKey: string \| null }>` |
| `hasWallet(identifier?)` | Checks whether any wallet material exists for the identifier. | `Promise<boolean>` |
| `deleteWallet(identifier?)` | Deletes wallet material for the identifier. | `Promise<void>` |
| `cleanup()` | Releases resources associated with the storage instance. | `void` |

## SecureStorageItemOptions

```typescript
interface SecureStorageItemOptions {
  requireBiometrics?: boolean
}
```

Pass `requireBiometrics: true` when reading or writing the encryption key if your app requires biometric access for that item.

## Error handling

All package-specific errors extend `SecureStorageError` and expose a `code` string. Getters return `null` when a value is missing; operational failures throw typed errors.

{% code title="Handle Secure Storage Errors" lineNumbers="true" %}
```typescript
import {
  AuthenticationError,
  SecureStorageError,
  TimeoutError,
  ValidationError
} from '@tetherto/wdk-react-native-secure-storage'

try {
  const key = await storage.getEncryptionKey('primary-wallet', {
    requireBiometrics: true
  })
} catch (error) {
  if (error instanceof AuthenticationError) {
    // Prompt the user to retry or choose another recovery path.
  } else if (error instanceof TimeoutError || error instanceof ValidationError) {
    // Surface a recoverable error state.
  } else if (error instanceof SecureStorageError) {
    // Log the machine-readable error code without sensitive values.
  }
}
```
{% endcode %}

***

## Need Help?

{% include "../../.gitbook/includes/support-cards.md" %}
