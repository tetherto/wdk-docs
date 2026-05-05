---
title: React Native Secure Storage Configuration
description: Install and configure @tetherto/wdk-react-native-secure-storage
icon: gear
---

# React Native Secure Storage Configuration

This page shows how to install `@tetherto/wdk-react-native-secure-storage`, create a storage instance, and configure authentication behavior.

## Install the package

{% code title="Install React Native Secure Storage" lineNumbers="true" %}
```bash
npm install @tetherto/wdk-react-native-secure-storage react-native-keychain expo-crypto expo-local-authentication
```
{% endcode %}

The package declares `react-native` as a peer dependency and uses native modules through `react-native-keychain`.

{% hint style="info" %}
Use this package in a React Native app or development build with native modules available. Expo Go is not enough for all keychain-backed flows.
{% endhint %}

## Create a storage instance

Use `createSecureStorage()` once and reuse the returned object in your wallet storage layer.

{% code title="Create Secure Storage" lineNumbers="true" %}
```typescript
import { createSecureStorage } from '@tetherto/wdk-react-native-secure-storage'

const storage = createSecureStorage({
  authentication: {
    promptMessage: 'Authenticate to access wallet',
    cancelLabel: 'Cancel',
    disableDeviceFallback: false
  },
  timeoutMs: 30000
})
```
{% endcode %}

## Store wallet material

Store encrypted values only. The package stores encrypted seed and entropy payloads plus the encryption key you provide.

{% code title="Store Wallet Material" lineNumbers="true" %}
```typescript
const walletId = 'primary-wallet'

await storage.setEncryptedSeed(encryptedSeed, walletId)
await storage.setEncryptedEntropy(encryptedEntropy, walletId)
await storage.setEncryptionKey(encryptionKey, walletId, {
  requireBiometrics: true
})
```
{% endcode %}

## Restore wallet material

Getters return `null` when a value has not been stored. They throw typed errors for validation, authentication, timeout, and keychain failures.

{% code title="Restore Wallet Material" lineNumbers="true" %}
```typescript
const walletId = 'primary-wallet'

const { encryptedSeed, encryptedEntropy, encryptionKey } =
  await storage.getAllEncrypted(walletId)

if (!encryptedSeed || !encryptionKey) {
  throw new Error('Wallet data is incomplete')
}
```
{% endcode %}

## Check device security

Use device checks before prompting the user to create or unlock a wallet.

{% code title="Check Device Security" lineNumbers="true" %}
```typescript
const deviceSecurityEnabled = await storage.isDeviceSecurityEnabled()
const biometricsAvailable = await storage.isBiometricAvailable()

if (!deviceSecurityEnabled) {
  throw new Error('Enable device security before creating a wallet')
}
```
{% endcode %}

## Cleanup

Call `cleanup()` when the storage instance is no longer needed. Use `deleteWallet(identifier)` when you want to remove stored wallet data.

***

## Need Help?

{% include "../../.gitbook/includes/support-cards.md" %}
