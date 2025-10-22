---
title: Secret Manager Configuration
description: Configure passkey, salt, KDF iterations and runtime options for @tetherto/wdk-secret-manager
icon: gear
---


# Secret Manager Configuration

This page shows how to configure the Secret Manager instance, what parameters matter for security, and how to use environment/runtime options.

## Constructor

{% code title="Create Secret Manager" lineNumbers="true" %}
```javascript
import WdkSecretManager from '@tetherto/wdk-secret-manager'

const passkey = 'correct horse battery staple'   // ≥ 12 chars (or Buffer/Uint8Array ≥ 12 bytes)
const salt    = WdkSecretManager.generateSalt()  // 16‑byte Buffer

// Optional: PBKDF2 iterations (default 100,000)
const sm = new WdkSecretManager(passkey, salt, { iterations: 100_000 })
```
{% endcode %}

### Parameters

- `passkey` (`string | Buffer | Uint8Array`): User secret used to derive the encryption key. Must be at least 12 characters/bytes. Prefer a strong, user‑specific passkey from secure storage (e.g., Keychain/Keystore).
- `salt` (`Buffer`): 16‑byte random Buffer. The salt is not secret but must be unique per user/session. Store the salt alongside the encrypted payload.
- `kdfParams.iterations` (`number`, optional): PBKDF2 iterations (default `100_000`). Increase for stronger resistance (with performance trade‑off).

## Static Utilities

### `generateSalt()`

{% code title="Generate Salt" lineNumbers="true" %}
```javascript
const salt = WdkSecretManager.generateSalt() // Buffer(16)
```
{% endcode %}

## Recommended Settings

- Use at least `100_000` PBKDF2 iterations in mobile/desktop; consider higher values on powerful backends.
- Enforce passkeys ≥ 12 characters with mixed entropy (or binary secrets of similar strength).
- Generate a fresh 16‑byte salt per user/session; never reuse salts with the same passkey.
- Store salt with the encrypted payload; never store plaintext passkeys or mnemonics.

## Runtime Notes

- Node.js: Uses `sodium-native` and Node `crypto` (PBKDF2).
- Bare runtime: A bare build is provided; PBKDF2 is handled by the bare crypto shim.

## Examples

### Generate and Encrypt Seed + Entropy

{% code title="Generate & Encrypt" lineNumbers="true" %}
```javascript
const { encryptedEntropy, encryptedSeed } = await sm.generateAndEncrypt()

// Decrypt later
const entropy = sm.decrypt(encryptedEntropy) // Buffer(16)
const seed    = sm.decrypt(encryptedSeed)    // Buffer(64)
```
{% endcode %}

### Encrypt/Decrypt Arbitrary Data (16–64 bytes)

{% code title="Encrypt/Decrypt Data" lineNumbers="true" %}
```javascript
// Data length must be between 16 and 64 bytes
import { randomBytes } from 'crypto'
const data    = randomBytes(32)              // Buffer(32)
const payload = sm.encrypt(data)             // Buffer(header + ciphertext)
const out     = sm.decrypt(payload)          // Buffer(32)
```
{% endcode %}

### Skip PBKDF2 with a Master Key

If you already have a 32‑byte key (e.g., derived via a KMS), you can skip PBKDF2:

{% code title="Master Key Mode" lineNumbers="true" %}
```javascript
import { pbkdf2Sync } from 'crypto'
import b4a from 'b4a'

const masterKey = b4a.from(pbkdf2Sync(b4a.from(passkey), b4a.from(salt), 100_000, 32, 'sha256'))

const cipher = sm.encrypt(Buffer.from('0123456789abcdef0123456789abcdef'), masterKey)
const plain  = sm.decrypt(cipher, masterKey)
```
{% endcode %}

### Mnemonic Helpers

{% code title="Entropy ↔ Mnemonic" lineNumbers="true" %}
```javascript
const entropy16 = sm.generateRandomBuffer()         // Buffer(16)
const mnemonic  = sm.entropyToMnemonic(entropy16)   // 12 words
const entropy2  = sm.mnemonicToEntropy(mnemonic)    // Buffer(16)
```
{% endcode %}

### Memory Management

{% code title="Dispose" lineNumbers="true" %}
```javascript
// Wipes internal passkey/salt/iteration state from memory
sm.dispose()
```
{% endcode %}

## Constraints & Validation

- `encrypt(data)` requires `data` to be a Buffer of length 16–64 bytes.
- `mnemonicToEntropy` expects a 12‑word BIP39 mnemonic; throws on invalid input.
- Constructor validates passkey length/type and salt length (16 bytes).

## Security Checklist

- Use strong, unique passkeys per user; never persist them in plaintext
- Generate a fresh 16‑byte salt per user/session
- Tune PBKDF2 iterations appropriate to your platform
- Encrypt before storing/sending secrets; keep operations in memory and call `dispose()` when done

***

## Need Help?

{% include "../../.gitbook/includes/support-cards.md" %}