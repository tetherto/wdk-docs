---
title: WDK’s Derivation Path and Compatibility with Other Wallet Providers
description: How derivation paths impact wallet compatibility and recovery on different blockchains.
---

This guide explains the derivation path used for WDK, the official derivation paths for the networks supported by WDK, and the compatibility modes with other wallet providers to help you manage, migrate, and access your assets seamlessly.

---

## Derivation Paths

Derivation paths are a set of instructions that tell a wallet how to create addresses from your single seed, allowing you to recover your funds.

Different blockchains use different standard derivation paths. For example:

- Ethereum wallets typically follow `m/44'/60'/0'/0/x`
- Bitcoin wallets use `m/44'/0'/0'/0/x` or `m/84'/0'/0'/0/0`
- Tron uses `m/44'/195'/0'/0/x`

This means that the exact seed phrase can create different addresses on each network, and using the wrong path could cause funds to appear “missing” if the wallet isn’t set to the network’s standard path.

**Further Reading:**

- [Derivation Path – Plan B](https://planb.network/en/resources/glossary/derivation-path)  
- [Derivation Path – Learn Me Bitcoin](https://learnmeabitcoin.com/technical/keys/hd-wallets/derivation-paths/)  
- [Derivation Path in Plain English – Stack](https://ethereum.stackexchange.com/questions/70017/can-someone-explain-the-meaning-of-derivation-path-in-wallet-in-plain-english-s)

---

## Official Derivation Paths

A derivation path is a line that shows how to create an account from a single seed. It has the form:

- m / 44' / coin' / account' / change / index
  - `44'` → says it follows the BIP44 rule  
  - `coin'` → is the number for each chain (see [SLIP-0044 Registered coin types](https://github.com/satoshilabs/slips/blob/master/slip-0044.md))  
  - `account'`, `change`, `index` → indicate which account and key to use  

---

## Blockchain Derivation Paths

| Blockchain | WDK Derivation Path | Typical Derivation Path |
|------------|-------------------|-----------------------|
| Bitcoin | `m/84'/0'/0'/0/x` | `m/44'/0'/0'/0/x` or `m/84'/0'/0'/0/x` |
| Ethereum (EVM) | `m/44'/60'/0'/0/x` | `m/44'/60'/0'/0/x` |
| Tron | `m/44'/195'/0'/0/x` | `m/44'/195'/0'/0/x` |
| TON | `m/44'/607'/x'` | `m/44'/396'/0'/0/x` |
| Spark | `m/44'/998'/0'/0/x` | `m/44'/503'/0'/0/x` |
| Solana | `m/44'/501'/x'/0'` | `m/44'/501'/0'/0'` |

Here, `x` is the account index (0, 1, 2…).

{% hint style="warning" %}
**Recent Derivation Path Updates**

WDK has updated default derivation paths for several wallet modules to match ecosystem conventions:

- **Bitcoin**: Changed from `m/44'/0'/0'/0/{index}` (v1.0.0-beta.3) to `m/84'/0'/0'/0/{index}` (v1.0.0-beta.4+) - now uses BIP-84 Native SegWit
- **Solana**: Changed from `m/44'/501'/0'/0/{index}` (v1.0.0-beta.3) to `m/44'/501'/{index}'/0'` (v1.0.0-beta.4+)
- **TON**: Changed from `m/44'/607'/0'/0/1` (v1.0.0-beta.5) to `m/44'/607'/{index}'` (v1.0.0-beta.6+)

If you're upgrading from an earlier version, existing wallets will generate different addresses. Make sure to migrate any existing wallets or use explicit paths for backward compatibility.

Use the module-specific `getAccountByPath` helpers to supply legacy derivation paths when needed: [wallet-btc](../../sdk/wallet-modules/wallet-btc/api-reference.md#getaccountbypathpath), [wallet-solana](../../sdk/wallet-modules/wallet-solana/api-reference.md#getaccountbypathpath), and [wallet-ton](../../sdk/wallet-modules/wallet-ton/api-reference.md#getaccountbypathpath).

{% endhint %}

---

## Bitcoin Derivation Paths by Address Type

| Address Type | Derivation Path | Notes |
|--------------|----------------|-------|
| Legacy (P2PKH) | `m/44'/0'/0'/0/x` | Starts with 1... addresses |
| SegWit (P2SH-P2WPKH) | `m/49'/0'/0'/0/x` | Starts with 3..., backwards-compatible SegWit |
| Native SegWit (Bech32, P2WPKH) | `m/84'/0'/0'/0/x` | Starts with bc1..., fully native SegWit |
| Taproot (P2TR) | `m/86'/0'/0'/0/x` | Starts with bc1p..., latest Bitcoin upgrade |

{% hint style="info" %}
**Note:** WDK Bitcoin wallets now use BIP-84 (Native SegWit) by default. The path was updated in v1.0.0-beta.4 from `m/44'/0'/0'/0/{index}` (Legacy) to `m/84'/0'/0'/0/{index}` (Native SegWit).
Specify the previous derivation path explicitly using [`wallet-btc`'s `getAccountByPath`](../../sdk/wallet-modules/wallet-btc/api-reference.md#getaccountbypathpath) if you need to keep generating Legacy addresses.
{% endhint %}

---

## Ethereum

Ethereum and EVM-compatible networks primarily use a single standard derivation path:

- Ethereum (ETH) – `m/44'/60'/0'/0/x` (x = 0, 1, 2…)

Some wallets or layer-2 solutions may use **custom derivation paths** for internal purposes.

---

## Tron

- Tron (TRX) – `m/44'/195'/0'/0/x` (x = 0, 1, 2…)  

Some wallets may offer custom derivation paths for multi-account management.

---

## TON

- **Official TON path:** `m/44'/396'/0'/0/x`  
- **WDK path:** `m/44'/607'/{x}'`

{% hint style="info" %}
**Note:** The WDK TON derivation path was updated in v1.0.0-beta.6 from `m/44'/607'/0'/0/1` to `m/44'/607'/{x}'` to match ecosystem conventions.
Use [`wallet-ton`'s `getAccountByPath`](../../sdk/wallet-modules/wallet-ton/api-reference.md#getaccountbypathpath) if you need to keep deriving addresses with the legacy path.
{% endhint %}  

---

## Spark (FLR)

- **Official Spark path:** `m/44'/503'/0'/0/x`  
- **WDK Spark path:** `m/44'/998'/0'/0/x` – WDK uses this for SDK consistency and internal account management  

---

## Solana

Solana wallets use derivation paths to generate addresses from a single seed phrase. Solana is special because wallets and apps can use different derivation schemes and algorithms.

### Official / Standard Path

- Coin Type: `501` (SLIP-0044)  
- Derivation Path: `m/44'/501'/0'/0/x` (x = 0, 1, 2…)  
- Derivation Algorithm: BIP32  

### Special Cases

- Some apps use custom paths internally: `m/44'/501'/x'/0/0` or `m/44'/501'/0/0`  

### WDK Standard Path

- Coin Type: `501` (SLIP-0010)  
- Derivation Path: `m/44'/501'/{x}'/0'` (updated in v1.0.0-beta.4)  
- Previous Path: `m/44'/501'/0'/0/x` (v1.0.0-beta.3 and earlier)
- Derivation Algorithm: SLIP10

{% hint style="info" %}
**Note:** The WDK Solana derivation path was updated in v1.0.0-beta.4 from `m/44'/501'/0'/0/{index}` to `m/44'/501'/{index}'/0'` to match ecosystem conventions.
You can still derive addresses along the old path via [`wallet-solana`'s `getAccountByPath`](../../sdk/wallet-modules/wallet-solana/api-reference.md#getaccountbypathpath).
{% endhint %}  

### Algorithm Considerations

- Solana uses **ed25519 curve** instead of secp256k1 (Bitcoin/Ethereum)  
- Derivation is performed using SLIP-0010  
- Using the wrong algorithm generates entirely different addresses  

---

## Comparative Table

| Wallet/App | BTC | EVM | Tron | TON | Spark | Solana | Solana Algorithm |
|------------|-----|-----|------|-----|-------|--------|----------------|
| WDK | `m/84'/0'/0'/0/x` | `m/44'/60'/0'/0/x` | `m/44'/195'/0'/0/x` | `m/44'/607'/{x}'` | `m/44'/998'/0'/0/x` | `m/44'/501'/{x}'/0'` | SLIP10 |
| Phantom | `m/84'/0'/0'/0/x` | `m/44'/60'/0'/0/x` | N/A | N/A | N/A | `m/44'/501'/0'/0` | SLIP10 |
| Trust Wallet | `m/84'/0'/0'/0/x` | `m/44'/60'/0'/0/x` | `m/44'/195'/0'/0/x` | `m/44'/607'/0'` | N/A | `m/44'/501'/x'/0/0` | BIP32 |
| Magic Eden | `m/44'/0'/x'/0/0`* | `m/44'/60'/0'/0/x` | N/A | N/A | N/A | `m/44'/501'/x'/0/0` | BIP32 |
| MetaMask | N/A | `m/44'/60'/0'/0/x` | N/A | N/A | N/A | `m/44'/501'/x'/0/0` | BIP32 |

\*Note: Magic Eden’s documentation lists `m/44'/0'/X'/0/0` (Legacy), but the app may generate Bech32 (bc1q…) addresses.

---

### References

- [Trust Wallet Core Usage](https://developer.trustwallet.com/developer/wallet-core/integration-guide/wallet-core-usage)  
- [Phantom Wallet Derivation Paths](https://help.phantom.com/hc/en-us/articles/12988493966227-What-derivation-paths-does-Phantom-wallet-support)  
- [Magic Eden Derivation Paths](https://help.magiceden.io/en/articles/10113666-understanding-derivation-paths-and-compatibility-modes-in-the-magic-eden-app)  
- [MetaMask Seed Phrase Import Guide](https://support.metamask.io/configure/wallet/importing-a-seed-phrase-from-another-wallet-software-derivation-path/)  
- [SLIP-0044 Registered Coin Types](https://github.com/satoshilabs/slips/blob/master/slip-0044.md)  
- [SLIP-0010 Specification](https://github.com/satoshilabs/slips/blob/master/slip-0010.md)