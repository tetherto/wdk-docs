---
title: WDK Utils API Reference
description: API for @tetherto/wdk-utils
icon: code
---

# API Reference

## Package: `@tetherto/wdk-utils`

### Address Validation Helpers

| Function | Description | Returns |
| --- | --- | --- |
| `validateBase58(address)` | Validate a Base58Check Bitcoin address payload and version byte. | See details below. |
| `validateBech32(address)` | Validate a SegWit v0 Bitcoin address. | `BtcAddressValidationResult` |
| `validateBech32m(address)` | Validate a SegWit v1+ Bitcoin address. | `BtcAddressValidationResult` |
| `validateBitcoinAddress(address)` | Validate a Bitcoin address across Base58Check, Bech32, and Bech32m formats. | `BtcAddressValidationResult` |
| `validateEVMAddress(address)` | Validate an EVM address, including EIP-55 checksum rules for mixed-case inputs. | `EvmAddressValidationResult` |
| `stripLightningPrefix(input)` | Remove a leading `lightning:` prefix before other Lightning validation steps. | `string` |
| `validateLightningInvoice(address)` | Validate a Lightning invoice string. | `LightningInvoiceValidationResult` |
| `validateLnurl(address)` | Validate an LNURL string. | `LnurlValidationResult` |
| `validateLightningAddress(address)` | Validate a Lightning Address in `user@domain.tld` form. | `LightningAddressValidationResult` |
| `validateSparkAddress(address)` | Validate a Spark address or a Bitcoin L1 deposit address accepted by Spark flows. | `SparkAddressValidationResult` |
| `validateUmaAddress(address)` | Validate a Universal Money Address. | `UmaAddressValidationResult` |
| `resolveUmaUsername(uma)` | Split a valid UMA string into `localPart`, `domain`, and `lightningAddress`. | Parsed UMA details or `null`. |

#### `validateBase58(address)`

Validate a Base58Check Bitcoin address and identify whether it matches a supported P2PKH or P2SH network version byte.

The published `beta.2` type declaration currently includes an internal `{ decoded: Uint8Array }` branch in this return type. The shipped runtime returns validation results rather than exposing that intermediate decode object.

{% code title="Validate A Base58 Bitcoin Address" lineNumbers="true" %}
```javascript
import { validateBase58 } from '@tetherto/wdk-utils'

const result = validateBase58('18hnriom5tB5KtFb982m8f9cZz4i72PUpZ')
```
{% endcode %}

#### `validateBech32(address)`

Validate a SegWit v0 Bech32 Bitcoin address for supported network prefixes.

{% code title="Validate A Bech32 Bitcoin Address" lineNumbers="true" %}
```javascript
import { validateBech32 } from '@tetherto/wdk-utils'

const result = validateBech32('bc1qu9yqnhc6wjj6s62s9x0shnl5l2r7gq5cudm94r7mvwv0uw4s7acq0hn9g6')
```
{% endcode %}

#### `validateBech32m(address)`

Validate a SegWit v1+ Bech32m Bitcoin address for mainnet, testnet, or regtest.

{% code title="Validate A Bech32m Bitcoin Address" lineNumbers="true" %}
```javascript
import { validateBech32m } from '@tetherto/wdk-utils'

const result = validateBech32m('bc1pkf2alvh0q96nyf7yhw2w3x7etlw22sasn2kxu59xzzl2px7ga4asctyc2v')
```
{% endcode %}

#### `validateBitcoinAddress(address)`

Run the combined Bitcoin validator across Base58Check, Bech32, and Bech32m inputs.

{% code title="Validate A Bitcoin Address" lineNumbers="true" %}
```javascript
import { validateBitcoinAddress } from '@tetherto/wdk-utils'

const result = validateBitcoinAddress('tb1pu9yqnhc6wjj6s62s9x0shnl5l2r7gq5cudm94r7mvwv0uw4s7acqjg9r2f')
```
{% endcode %}

`BtcAddressValidationResult` is one of these shapes:

- `{ success: true, type: 'p2pkh' | 'p2sh' | 'bech32' | 'bech32m', network: 'mainnet' | 'testnet' | 'regtest' }`
- `{ success: false, reason: string }`

#### `validateEVMAddress(address)`

Validate an EVM address. Mixed-case inputs must satisfy EIP-55 checksum casing, while all-lowercase and all-uppercase inputs remain valid.

{% code title="Validate An EVM Address" lineNumbers="true" %}
```javascript
import { validateEVMAddress } from '@tetherto/wdk-utils'

const result = validateEVMAddress('0x742d35Cc6634C0532925a3b844Bc454e4438f44e')
```
{% endcode %}

`EvmAddressValidationResult` is one of these shapes:

- `{ success: true, type: 'evm' }`
- `{ success: false, reason: string }`

#### `stripLightningPrefix(input)`

Remove a `lightning:` URI prefix before validating or parsing Lightning inputs.

{% code title="Strip A Lightning Prefix" lineNumbers="true" %}
```javascript
import { stripLightningPrefix } from '@tetherto/wdk-utils'

const invoice = stripLightningPrefix(
  'lightning:lnbc100u1p5m3k6fpp5uk9rs7fdrvssehzthphfjvpc3t5hyacgrveskwqzwclrdsl0cjgsdqydp5scqzzsxqrrssrzjqvgptfurj3528snx6e3dtwepafxw5fpzdymw9pj20jj09sunnqmwqqqqqyqqqqqqqqqqqqqqqqqqqqqqjqnp4qtem70et4qm86lv449zcpqjn9nmamd6qrzm3wa3d7msnq2kx3yapwsp50c4l2z72hcmejj88en6eu2p8u2ypv87pw5pndzjjtclwaw0f7wds9qyyssqtqeqrvaaw92y7at9463vxhwkjdy7lpxet7h6g4vry8xyw4ar9yn8qq36dryntpf252v58c4hrf4g59z2pr25lhp06n7x4z7yltd022cqk7lc7e'
)
```
{% endcode %}

#### `validateLightningInvoice(address)`

Validate a Lightning invoice string after trimming input and removing any `lightning:` URI prefix.

{% code title="Validate A Lightning Invoice" lineNumbers="true" %}
```javascript
import { validateLightningInvoice } from '@tetherto/wdk-utils'

const result = validateLightningInvoice(
  'lnbc100u1p5m3k6fpp5uk9rs7fdrvssehzthphfjvpc3t5hyacgrveskwqzwclrdsl0cjgsdqydp5scqzzsxqrrssrzjqvgptfurj3528snx6e3dtwepafxw5fpzdymw9pj20jj09sunnqmwqqqqqyqqqqqqqqqqqqqqqqqqqqqqjqnp4qtem70et4qm86lv449zcpqjn9nmamd6qrzm3wa3d7msnq2kx3yapwsp50c4l2z72hcmejj88en6eu2p8u2ypv87pw5pndzjjtclwaw0f7wds9qyyssqtqeqrvaaw92y7at9463vxhwkjdy7lpxet7h6g4vry8xyw4ar9yn8qq36dryntpf252v58c4hrf4g59z2pr25lhp06n7x4z7yltd022cqk7lc7e'
)
```
{% endcode %}

`LightningInvoiceValidationResult` is one of these shapes:

- `{ success: true, type: 'invoice' }`
- `{ success: false, reason: string }`

#### `validateLnurl(address)`

Validate an LNURL string that begins with `lnurl1`.

{% code title="Validate An LNURL" lineNumbers="true" %}
```javascript
import { validateLnurl } from '@tetherto/wdk-utils'

const result = validateLnurl(
  'lnurl1dp68gurn8ghj7ampd3kx2ar0veekzar0wd5xjtnrdakj7tnhv4kxctttdehhwm30d3h82unvwqhhxurj093k7mtxdae8gwfjnztwnf'
)
```
{% endcode %}

`LnurlValidationResult` is one of these shapes:

- `{ success: true, type: 'lnurl' }`
- `{ success: false, reason: string }`

#### `validateLightningAddress(address)`

Validate a Lightning Address in `user@domain.tld` form.

{% code title="Validate A Lightning Address" lineNumbers="true" %}
```javascript
import { validateLightningAddress } from '@tetherto/wdk-utils'

const result = validateLightningAddress('sprycomfort92@waletofsatoshi.com')
```
{% endcode %}

`LightningAddressValidationResult` is one of these shapes:

- `{ success: true, type: 'address' }`
- `{ success: false, reason: string }`

#### `validateSparkAddress(address)`

Validate a Spark address or a Bitcoin Bech32m deposit address accepted by Spark flows.

{% code title="Validate A Spark Address" lineNumbers="true" %}
```javascript
import { validateSparkAddress } from '@tetherto/wdk-utils'

const spark = validateSparkAddress(
  'spark1pgss82uvuvyjggx72gl42qk3285yz0j6lgxw9uk2mvgajsr8w22nudv8w6hqs2'
)
const l1Deposit = validateSparkAddress(
  'bc1p4lpn5nrunrjdk6teyjd2z53vmv82hlgjvv4pejkhg9wz5jq86zuqsruz85'
)
```
{% endcode %}

`SparkAddressValidationResult` is one of these shapes:

- `{ success: true, type: 'spark' | 'btc' }`
- `{ success: false, reason: string }`

#### `validateUmaAddress(address)`

Validate a Universal Money Address in `$user@domain.tld` form.

{% code title="Validate A UMA Address" lineNumbers="true" %}
```javascript
import { validateUmaAddress } from '@tetherto/wdk-utils'

const result = validateUmaAddress('$you@uma.money')
```
{% endcode %}

`UmaAddressValidationResult` is one of these shapes:

- `{ success: true, type: 'uma' }`
- `{ success: false, reason: string }`

#### `resolveUmaUsername(uma)`

Resolve a valid UMA string into the local part, domain, and underlying Lightning Address.

{% code title="Resolve A UMA Username" lineNumbers="true" %}
```javascript
import { resolveUmaUsername } from '@tetherto/wdk-utils'

const result = resolveUmaUsername('$alice@wallet.com')
```
{% endcode %}

### EIP-681 Request Parsing Helpers

| Function | Description | Returns |
| --- | --- | --- |
| `isEip681Request(input)` | Detect whether a string has the shape of a supported EIP-681 request. | `boolean` |
| `parseEip681Request(input)` | Parse a supported EIP-681 transfer request into structured transfer data. | `Eip681ParseResult` |

#### `isEip681Request(input)`

Detect whether a string looks like a supported EIP-681 transfer request before you attempt a full parse.

{% code title="Detect An EIP-681 Request" lineNumbers="true" %}
```javascript
import { isEip681Request } from '@tetherto/wdk-utils'

const looksLikeRequest = isEip681Request(
  'polygon:0xc2132D05D31c914a87C6611C10748AEb04B58e8F@137/transfer?address=0xA9e338082A061d657014c08e652D96B38639F22a&value=1000000'
)
```
{% endcode %}

#### `parseEip681Request(input)`

Parse a supported EIP-681 transfer request. The published runtime supports `transfer` requests, accepts `value` as an alias for `uint256`, and normalizes scientific-notation amounts into integer `amountSmallest` strings.

{% code title="Parse An EIP-681 Request" lineNumbers="true" %}
```javascript
import { parseEip681Request } from '@tetherto/wdk-utils'

const result = parseEip681Request(
  'pol:0xc2132D05D31c914a87C6611C10748AEb04B58e8F@137/transfer?address=0xA9e338082A061d657014c08e652D96B38639F22a&uint256=0.175309000e6'
)
```
{% endcode %}

`Eip681ParseResult` is one of these shapes:

- `{ success: true, type: 'eip681-transfer', value: Eip681TransferRequest }`
- `{ success: false, reason: 'INVALID_FORMAT' | 'UNSUPPORTED_METHOD' | 'MISSING_REQUIRED_PARAM' | 'INVALID_RECIPIENT' | 'INVALID_AMOUNT' }`

`Eip681TransferRequest` contains:

- `recipient: string`
- `tokenAddress: string`
- `chainId: number`
- `amountSmallest: string`

***

## Need Help?

{% include "../../.gitbook/includes/support-cards.md" %}
