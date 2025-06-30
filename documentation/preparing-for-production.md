---
title: Prepare for Production - Secure Seedphrase Persistence
description: Guidelines for securely handling and persisting seedphrases in production wallet applications using WDK modules.
lastReviewed: 2025-06-27
---

# Prepare for Production: Secure Seedphrase Persistence

## Overview

When building wallet applications, securely handling users' seedphrases is paramount. Improper management can expose sensitive data to memory leaks, runtime inspection, and other vulnerabilities. This guide outlines best practices and implementation strategies for secure seedphrase persistence using WDK modules.

## Table of Contents
1. [Introduction](#introduction)
2. [Risks of Insecure Seedphrase Handling](#risks-of-insecure-seedphrase-handling)
3. [Recommended Secure Storage Approaches](#recommended-secure-storage-approaches)
    - [Device Passkeys](#device-passkeys)
    - [Ephemeral Usage via WDK](#ephemeral-usage-via-wdk)
4. [Using WdkSecretManager for Secure Secret Management](#using-wdksecretmanager-for-secure-secret-management)
    - [What is WdkSecretManager?](#what-is-wdksecretmanager)
    - [Core Functionality](#core-functionality)
    - [Dependencies](#dependencies)
5. [Implementation Guidelines](#implementation-guidelines)
    - [Loading and Decrypting Seeds](#loading-and-decrypting-seeds)
    - [Using Seeds with WDK](#using-seeds-with-wdk)
    - [Purging Secrets from Memory](#purging-secrets-from-memory)
6. [Example Code](#example-code)
7. [Best Practices & Tips](#best-practices--tips)
8. [References](#references)

---

## Introduction

Wallet applications rely on seedphrases (mnemonics) for user authentication and asset recovery. In production, mishandling these secrets can lead to severe security breaches. The WDK ecosystem provides tools and patterns to help developers manage secrets securely and efficiently.

## Risks of Insecure Seedphrase Handling

- **Memory Exposure:** Strings in JavaScript may persist in memory longer than expected, making them vulnerable to memory dumps or leaks.
- **Garbage Collection Issues:** Performance-optimized environments (e.g., Hermes in React Native) may not immediately clear sensitive data from memory.
- **Runtime Inspection:** Development tools and debuggers can access unprotected string values during runtime.

## Recommended Secure Storage Approaches

### Device Passkeys

Leverage native passkey capabilities of Android and iOS devices for secure secret storage:
- **Hardware-backed Security:** Utilizes secure enclaves and biometric authentication.
- **User Convenience:** Seamless authentication without manual password entry.
- **Platform Integration:** Native support reduces implementation complexity and increases security.

### Ephemeral Usage via WDK

Seedphrases should only be decrypted and loaded into memory when needed, and purged immediately after cryptographic operations:
- **Load:** Decrypt the encrypted seed only when required, never as a plain string—always as a buffer.
- **Use:** Use the buffer to initialize WDK modules for signing or wallet derivation.
- **Purge:** Explicitly **zero out the buffer from memory** after use (e.g., with `memzero`).

This ephemeral flow minimizes the in-memory attack surface.


## Using WdkSecretManager for Secure Secret Management

### What is WdkSecretManager?

[WdkSecretManager](https://github.com/tetherto/wdk-secret-manager) is a JavaScript library for secure management of BIP39 mnemonic phrases and related cryptographic secrets. It uses a user-provided passkey and salt to derive a strong cryptographic key (via libsodium pwhash), which is then used to encrypt and decrypt mnemonics using sodium-universal. It is designed for use in production wallet applications, with a focus on minimizing memory exposure and following best practices for secret handling.

**Key Features:**
- **Strong Key Derivation:** Uses PBKDF2 to derive a 256-bit cryptographic key from a user-provided passkey and a unique, random salt. This process is resistant to brute-force and rainbow table attacks.
- **Secure Encryption/Decryption:** Encrypts and decrypts BIP39 seed phrases and entropy buffers using `sodium-universal` (libsodium), ensuring secrets are protected at rest and in memory.
- **Mnemonic and Entropy Generation:** Generates cryptographically secure random entropy and BIP39 mnemonic phrases, supporting industry-standard wallet recovery flows.
- **Explicit Memory Zeroing:** Sensitive buffers are explicitly zeroed out from memory after use (using `sodium.sodium_memzero`), reducing the risk of memory scraping or leaks.
- **Salt Management:** Provides a salt generator (`wdkSaltGenerator.generate`) to create secure, random salts for each user or secret.
- **Platform Support:** Designed for Node.js and React Native environments. (Note: Browser support may require polyfills for Node.js buffers and crypto.)

#### Public API Summary
- **Constructor:** `new WdkSecretManager(passKey, salt)`
  - `passKey`: User's password/passphrase (Buffer, ArrayBuffer, Uint8Array, or string)
  - `salt`: Unique, random 16-byte Buffer (not secret, but must be unique per user)
- **generateAndEncrypt([payload, derivedKey])**: Generates random entropy (or uses provided), derives mnemonic and seed, and returns encrypted seed and entropy.
- **decrypt(payload, [derivedKey])**: Decrypts an encrypted payload (seed or entropy) and returns the original Buffer.
- **generateRandomBuffer()**: Generates a secure 128-bit entropy buffer (for 12-word mnemonics).
- **entropyToMnemonic(entropy)**: Converts entropy Buffer to a BIP39 mnemonic string.
- **mnemonicToEntropy(mnemonic)**: Converts a BIP39 mnemonic string to entropy Buffer.
- **destructor(decryptedSeedBuffer, decryptedEntropy)**: Securely wipes sensitive buffers and internal state from memory.
- **wdkSaltGenerator.generate()**: Static utility to generate a secure, random 16-byte salt.

#### Security Notes
- **Passkey Strength:** The security of encrypted data depends on the strength of the passkey. Always use strong, unique passphrases.
- **Salt Management:** Salts must be unique per user/passkey and stored alongside encrypted data. Never reuse salts across users.
- **Memory Safety:** All sensitive buffers are explicitly zeroed after use. Use the `destructor` method to ensure no sensitive data remains in memory.
- **Error Handling:** Methods validate input types and buffer sizes, throwing errors for invalid or insecure usage.

#### Usage Context
- **Recommended for:** Node.js and React Native wallet applications requiring secure, ephemeral handling of mnemonics and seeds.
- **Not recommended for:** Direct browser use without polyfills for Node.js Buffer and crypto APIs.

For more details and usage examples, see the [official README](https://github.com/noxtton/wdk-secret-manager-internal#readme).

### Dependencies
- **b4a:** Efficient buffer-to-array and array-to-buffer conversions.
- **bip39:** Industry-standard mnemonic generation and entropy conversion.
- **sodium-universal:** Comprehensive cryptographic operations, including memory allocation, random data generation, encryption, and decryption.

## Implementation Guidelines

### Loading and Decrypting Seeds
- Always decrypt the seedphrase only when needed.
- Never handle the seed as a plain string—use buffers.

### Using Seeds with WDK
- Pass the decrypted buffer directly to WDK modules (e.g., `WalletManager`).
- Avoid storing the buffer in global or long-lived variables.

### Purging Secrets from Memory
- Use `memzero` or equivalent to explicitly clear the buffer after use.
- Ensure no references to the buffer remain after purging.

## Example Code

```js
import WdkSecretManager, { wdkSaltGenerator } from '@wdk/wdk-secret-manager-internal';
import WalletManagerEvm from '@wdk/wallet-evm';

// 1. Retrieve user passkey, salt, and encrypted mnemonic (implement these securely in your app)
const passkey = getUserPasskey(); // e.g., from device biometrics
const salt = getStoredSalt(); // Should be a 16-byte Buffer
const encryptedMnemonic = getEncryptedMnemonic(); // Buffer

// 2. Initialize the secret manager and decrypt the seed buffer
const secretManager = new WdkSecretManager(passkey, salt);
const seedBuffer = secretManager.decrypt(encryptedMnemonic);

// 3. Use the seed buffer with WalletManagerEvm
const wallet = new WalletManagerEvm(seedBuffer, {
  provider: 'https://rpc.mevblocker.io/fast' // or your preferred RPC provider
});

// 4. (Optional) Get the first account and its address
const account = await wallet.getAccount(0);
const address = await account.getAddress();
console.log('Account address:', address);

// 5. Purge sensitive data from memory
secretManager.destructor(seedBuffer);
```

> **Note:** Replace `getUserPasskey`, `getStoredSalt`, and `getEncryptedMnemonic` with your actual secure implementations. Always ensure sensitive buffers are purged from memory after use.

## Best Practices & Tips
- Never store seedphrases as plain strings or in persistent memory.
- Always use hardware-backed key storage (e.g., device passkeys) when available.
- Minimize the time secrets are present in memory.
- Regularly audit your codebase for memory leaks or insecure secret handling.
- Use up-to-date cryptographic libraries and follow industry standards.

## References
- [WdkSecretManager GitHub](https://github.com/noxtton/wdk-secret-manager-internal)
- [bip39 npm](https://www.npmjs.com/package/bip39)
- [sodium-universal npm](https://www.npmjs.com/package/sodium-universal)
- [b4a npm](https://www.npmjs.com/package/b4a)
- [Wallet EVM Documentation](../wdk-modules/wallet-evm/overview.md)
