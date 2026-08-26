# backup-cloud — Google Drive And CloudKit Recovery

## Links

| Resource | URL |
|----------|-----|
| **npm** | https://www.npmjs.com/package/@tetherto/wdk-backup-cloud |
| **GitHub** | https://github.com/tetherto/wdk-backup-cloud |
| **Docs — Overview** | https://docs.wdk.tether.io/tools/backup-cloud |
| **Docs — Usage** | https://docs.wdk.tether.io/tools/backup-cloud/usage |
| **Docs — Migration Guide** | https://docs.wdk.tether.io/tools/backup-cloud/guides/migrate-from-react-native |
| **Docs — Configuration** | https://docs.wdk.tether.io/tools/backup-cloud/configuration |
| **Docs — API Reference** | https://docs.wdk.tether.io/tools/backup-cloud/api-reference |

## Package

```bash
npm install @tetherto/wdk-backup-cloud@1.0.0-beta.1
```

```javascript
import {
  CloudBackup,
  GoogleDriveProvider,
  CloudKitProvider
} from '@tetherto/wdk-backup-cloud'
```

## Security Boundary

- The package stores the exact string passed to `uploadEncryptedKey()`. It does not encrypt, decrypt, derive, or validate wallet key material.
- Pass only application-produced authenticated ciphertext. Never pass a seed phrase, plaintext private key, plaintext master key, password, or cloud credential.
- Keep the encryption-envelope format, expected public wallet identity, credential lifecycle, OAuth or Apple sign-in flow, and cloud-account selection in the application.
- Do not expose ciphertext, `cloudEmail`, access tokens, CloudKit tokens, request URLs, headers, or complete provider error causes in responses, logs, or telemetry.
- A successful upload verifies only that an item exists. Download, compare, decrypt, and validate the expected wallet identity before treating it as recoverable.

## Google Drive

```javascript
const backup = new CloudBackup(new GoogleDriveProvider({
  getAccessToken: async () => googleAuth.getAccessToken(),
  cloudEmail: signedInGoogleAccount.email
}))
```

- The application supplies an OAuth 2 token with the `drive.appdata` scope. The package does not implement Google sign-in or token refresh.
- The provider creates or updates the first matching JSON file in `appDataFolder`.
- The default basename is `wallet_backup_key.json`; directory segments in `filePath` are discarded.
- Upload overwrites the logical backup and does not retain versions.

## CloudKit

```javascript
const backup = new CloudBackup(new CloudKitProvider({
  containerIdentifier: 'iCloud.com.example.wallet',
  environment: 'production',
  getCloudKitAuth: async () => ({
    apiToken: await cloudKitAuth.getApiToken(),
    webAuthToken: await cloudKitAuth.getUserWebAuthToken()
  })
}))
```

- Provision CloudKit Web Services and a record type with String fields named `encryptionKey`, `savedAt`, and `cloudEmail`.
- The provider always uses the user's private database. Development and production environments are separate.
- `getCloudKitAuth()` must return the Web Services API token and a user web-auth token. The package does not perform Apple sign-in.
- Upload uses `forceUpdate` on one stable record and does not retain versions or resolve concurrent writes.

## Methods

| Method | Behavior |
|--------|----------|
| `uploadEncryptedKey(ciphertext)` | Creates or overwrites the configured item. Requires explicit human confirmation. |
| `downloadEncryptedKey()` | Returns `{ encryptionKey, savedAt, cloudEmail }` or `null` for not found. Keep the returned ciphertext out of transcripts and logs. |
| `deleteBackup()` | Permanently deletes the item and treats an already-missing item as success. Requires explicit human confirmation after a verified recovery drill. |
| `isAvailable()` | Returns `false` on every provider error. Use only as a UI hint. |
| `exists()` | Returns `false` for absence or any provider error. It cannot prove that a backup is missing. |

## Safe Write And Restore Pattern

```javascript
const written = await backup.uploadEncryptedKey(encryptedMasterKey)
const downloaded = await backup.downloadEncryptedKey()

if (downloaded === null || downloaded.encryptionKey !== encryptedMasterKey) {
  throw new Error('Cloud backup read-back verification failed')
}

const restoredMasterKey = await decryptAndAuthenticate(downloaded.encryptionKey)
const restoredWalletId = await derivePublicWalletId(restoredMasterKey)

if (restoredWalletId !== expectedWalletId) {
  throw new Error('Cloud backup does not match the expected wallet')
}
```

`decryptAndAuthenticate`, `derivePublicWalletId`, and `expectedWalletId` are application-owned. Never print or return `encryptedMasterKey`, `downloaded`, or `restoredMasterKey` from an agent workflow.

## Migration Safety

- Google Drive normally needs no copy only when both clients use the same OAuth application/project, Google account, `drive.appdata` authorization, and basename, and the new client can read, decrypt, and validate the existing payload.
- The legacy React Native `ICloudProvider` stores an iCloud Drive file; `CloudKitProvider` stores a private-database record. Migration requires a per-user client copy.
- Keep the legacy read path and original item until the new payload has been downloaded, decrypted, and validated through a separate recovery drill.
- CloudKit beta.1 writes with `forceUpdate` and offers no atomic create-if-absent operation. Coordinate every writer for the account across devices; if that is not possible, do not automate migration. Return and validate an existing record instead of treating its presence as success.
- Never infer that `exists() === false` means migration is safe. Authentication, network, quota, timeout, and service failures also return `false`.
- Deletion is a separate destructive operation. Require a new explicit confirmation after verification; do not fold deletion into migration automatically.
