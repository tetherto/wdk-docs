---
title: Secret Manager API Reference
description: API for @tetherto/wdk-secret-manager
lastReviewed: 2025-10-06
---

# API Reference

## Package: `@tetherto/wdk-secret-manager`

### Class: `WdkSecretManager`

#### Constructor

{% code title="Create Secret Manager" lineNumbers="true" %}
```javascript
new WdkSecretManager(passKey, salt, kdfParams?)
// passKey: string | Buffer | Uint8Array  (min 12 chars/bytes)
// salt:    Buffer (16 bytes)
// kdfParams?: { iterations?: number }  // default: 100_000
```
{% endcode %}

- `passKey`: User password/device secret (string or binary). Must be at least 12 characters/bytes.
- `salt`: 16‑byte random Buffer. Store alongside encrypted payloads; salt is not secret but must be unique per user/session.
- `kdfParams.iterations`: PBKDF2 iterations (defaults to 100,000).

#### Static Methods

- `generateSalt()` → `Buffer`
  - Returns a cryptographically secure, random 16‑byte salt Buffer.

{% code title="Generate Salt" lineNumbers="true" %}
```javascript
import WdkSecretManager from '@tetherto/wdk-secret-manager'
const salt = WdkSecretManager.generateSalt()
```
{% endcode %}

#### Methods

- `generateAndEncrypt(entropyOpt?, masterKeyOpt?)` → `{ encryptedSeed: Buffer, encryptedEntropy: Buffer }`
  - Generates 16‑byte entropy (or uses `entropyOpt`), converts to 12‑word mnemonic, derives 64‑byte BIP39 seed, and encrypts both.
  - `masterKeyOpt` (optional): 32‑byte key (Buffer) to skip PBKDF2.

- `encrypt(data, masterKeyOpt?)` → `Buffer`
  - Encrypts arbitrary data with authenticated encryption and a self‑describing header.
  - Constraints: `data` must be a Buffer of length 16–64 bytes.
  - `masterKeyOpt` (optional): 32‑byte key to skip PBKDF2.

- `decrypt(payload, masterKeyOpt?)` → `Buffer`
  - Decrypts a payload produced by `encrypt`. Validates header and MAC.

- `generateRandomBuffer()` → `Buffer`
  - Returns a 16‑byte cryptographically secure random buffer.

- `entropyToMnemonic(entropy)` → `string`
  - Converts 16‑byte entropy to a 12‑word BIP39 mnemonic.

- `mnemonicToEntropy(mnemonic)` → `Buffer`
  - Converts a 12‑word mnemonic back to its 16‑byte entropy buffer.

- `dispose()` → `void`
  - Securely wipes internal state (passkey, salt, iterations). The instance should not be used afterwards.

#### Header & Payload (for `encrypt`)

- Header layout: `[version(1), kdf_alg(1), iterations(u32le), reserved(u32le=0), salt(16), nonce(24)]`
- Ciphertext: `secretbox([len(1) | data(16..64)], nonce, key)`

#### Examples

{% code title="Generate, Encrypt, Decrypt" lineNumbers="true" %}
```javascript
import WdkSecretManager from '@tetherto/wdk-secret-manager'

const passkey = 'correct horse battery staple'
const salt = WdkSecretManager.generateSalt()
const sm = new WdkSecretManager(passkey, salt, { iterations: 100_000 })

// Generate and encrypt new seed + entropy
const { encryptedSeed, encryptedEntropy } = await sm.generateAndEncrypt()

// Decrypt entropy and recover mnemonic
const entropy = sm.decrypt(encryptedEntropy)
const mnemonic = sm.entropyToMnemonic(entropy)

// Wipe sensitive memory and internal state when done
sm.dispose()
```
{% endcode %}

{% code title="Encrypt/Decrypt Arbitrary Data (16–64 bytes)" lineNumbers="true" %}
```javascript
const data = sm.generateRandomBuffer()                // 16 bytes
const payload = sm.encrypt(data)                      // Buffer with header + ciphertext
const out = sm.decrypt(payload)                       // Buffer(16)
```
{% endcode %}

{% code title="Use Pre‑Derived 32‑byte Master Key (skip PBKDF2)" lineNumbers="true" %}
```javascript
import { pbkdf2Sync } from 'crypto'
import b4a from 'b4a'

const masterKey = b4a.from(pbkdf2Sync(b4a.from(passkey), b4a.from(salt), 100_000, 32, 'sha256'))

const cipher = sm.encrypt(Buffer.from('0123456789abcdef0123456789abcdef'), masterKey)
const plain  = sm.decrypt(cipher, masterKey)
```
{% endcode %}

## Security Notes

- Use strong, unique passkeys; never store them in plaintext
- Salts must be unique per user/session; store them with encrypted payloads
- No plaintext persistence; all operations are done in memory
- Call `dispose()` to zeroize internal secrets when done

***

## Need Help?

{% include "../../.gitbook/includes/support-cards.md" %}

