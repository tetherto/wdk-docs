---
Wallet & Account (EVM)
description: Generate, validate and reuse a universal seed phrase, create EVM‑specific wallets, and derive accounts (classic & ERC‑4337) in WDK
author: Raquel Carrasco Gonzalez
lastReviewed: 2025-06-24
icon: wallet
---

# Seed Phrase, Wallet & Account – **EVM Edition**

> **Scope:** This guide covers **Ethereum‑compatible chains only**. For Bitcoin, TON or other blockchains, refer to their dedicated sections.

---

## 1 · One seed phrase → many EVM chains

WDK is modular: one BIP‑39 seed phrase can drive wallets on **any** EVM chain—Ethereum, Arbitrum, Polygon, etc.
Each chain simply gets its own *wallet manager* instance that knows how to derive addresses at the standard BIP‑44 path `m/44'/60'/0'/0/index`.

| Concept                         | Universal? | Chain‑specific? | Responsibility                                                   |
| ------------------------------- | ---------- | --------------- | ---------------------------------------------------------------- |
| Seed phrase                     | ✔          | —               | `WalletManagerEvm.isValidSeedPhrase()` / `getRandomSeedPhrase()` |
| Key derivation + address format | —          | ✔ (BIP‑44)      | **WalletManagerEvm**                                             |
| Account abstraction             | —          | ✔ (ERC‑4337)    | **WalletManagerEvmErc4337**                                      |

### How it fits together

1. **Seed phrase** – root entropy; never leaves your secure storage.
2. **Wallet manager** – derives the private key for a given account index.
3. **Account** – exposes helpers to sign, send and query on‑chain.
4. *(Optional)* **ERC‑4337 account** – smart‑contract wallet driven by the same key, sponsored by a bundler + paymaster.

---

## 2 · Validate or generate a seed phrase

```js
import { WalletManagerEvm } from "@wdk/wallet-evm";

// Example seed phrase for demonstration purposes only.
// Never use this seed phrase in production or with real funds.
const seedPhrase = 'choose indicate barrel slush penalty hollow box exchange soldier gentle memory rare'

// Validate an existing phrase (12/24 words)
const isValid = WalletManagerEvm.isValidSeedPhrase(seedPhrase);
console.log("Seed is valid:", isValid);
```
Or you can generate a new seed phrase. 

```js
// Or create a fresh one
const seedPhrase = WalletManagerEvm.getRandomSeedPhrase();
console.log("Your new seed:", seedPhrase);

// Validate the generated phrase (12 words)
const isValid = WalletManagerEvm.isValidSeedPhrase(seedPhrase);
console.log("Seed is valid:", isValid);
```

*Tip – The same helpers exist on every other `WalletManager*`; all delegate to the same internal BIP‑39 implementation.*

---

## 3 · Instantiate classic wallet managers

> **Note**: This configuration is for a classic EOA wallet only. 
>
>If you want to use Account Abstraction (ERC-4337) features, see the section 4 for the required configuration and modules.


### 3.1 Ethereum Mainnet (provider‑only)

```js
import { WalletManagerEvm } from "@wdk/wallet-evm";

const eth = new WalletManagerEvm(seedPhrase, {
  chainId: 1,
  provider: "https://rpc.mevblocker.io/fast"
});

const account = await eth.getAccount(); // index 0
console.log("EOA:", await account.getAddress());
```

### 3.2 Arbitrum One (provider‑only)

```js
import { WalletManagerEvm } from "@wdk/wallet-evm";

const arb = new WalletManagerEvm(seedPhrase, {
  chainId: 42161,
  provider: "https://1rpc.io/arb"
});

const account = await arb.getAccount(1); // index 1
console.log("EOA:", await account.getAddress());
```

### 3. Polygon (provider‑only)

```js
import { WalletManagerEvm } from "@wdk/wallet-evm";

const pol = new WalletManagerEvm(seedPhrase, {
  chainId: 137,
  provider: "https://polygon-rpc.com"
});

const account = await pol.getAccount(1); // index 1
console.log("EOA:", await account.getAddress());
```

> **Gas policy** – With a plain EOA the user pays network fees in the chain’s native token (ETH (mainnet), ETH (arbitrum), POL, etc.).
---

## 4 · Opt‑in to ERC‑4337 account abstraction

If you want sponsored or token‑denominated gas, create an **ERC‑4337 wallet manager** instead.

For the examples in this documentation, we use **Candide** and **Pimlico** as service providers for `bundlerUrl` and `paymasterUrl`. However, you are free to choose any compatible service provider that meets your configuration needs.

*WDK does not favour any service providers – choose the one you prefer.*

### 4.1 Ethereum

```js
import { WalletManagerEvm } from "@wdk/wallet-evm-erc-4337";

const ethereumConfig = {
  chainId: 1,
  blockchain: "ethereum",
  provider: "https://rpc.mevblocker.io/fast",
  // You can use any compatible service provider for bundlerUrl and paymasterUrl.
  // The URLs below use Candide as an example.
  bundlerUrl: "https://api.candide.dev/public/v3/ethereum",
  paymasterUrl: "https://api.candide.dev/public/v3/ethereum",
  // The paymasterAddress below is for example/testing purposes and works with the example provider.
  // If you use a different service provider or deploy your own paymaster, be sure to use your own paymaster address/key.
  paymasterAddress: "0x8b1f6cb5d062aa2ce8d581942bbb960420d875ba",
  entrypointAddress: "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
  transferMaxFee: 5_000_000,
  swapMaxFee:     5_000_000,
  bridgeMaxFee:   5_000_000,
  paymasterToken: {
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7"
  }
};

const ethereumClient = new WalletManagerEvm(seedPhrase, ethereumConfig)

const aaEthereumAccount = await ethereumClient.getAccount();
console.log("Smart‑account:", await aaEthereumAccount.getAddress()); // 0x… counterfactual
```

### 4.2 Arbitrum One

```js

const arbitrumConfig = {
 "chainId": 42161,
 "blockchain": "arbitrum",
 "provider": "https://1rpc.io/arb",
  // You can use any compatible service provider for bundlerUrl and paymasterUrl.
  // The URLs below use Pimlico as an example.
 "bundlerUrl": "https://public.pimlico.io/v2/42161/rpc",
 "paymasterUrl": "https://public.pimlico.io/v2/42161/rpc",
  // The paymasterAddress below is for example/testing purposes and works with the example provider.
  // If you use a different service provider or deploy your own paymaster, be sure to use your own paymaster address/key.
 "paymasterAddress": "0x777777777777AeC03fd955926DbF81597e66834C",
 "entrypointAddress": "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
 "transferMaxFee": 5000000,
 "swapMaxFee": 5000000,
 "bridgeMaxFee": 5000000,
 "paymasterToken": {
     "address": "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9"
 }
}

const arbitrumClient = new WalletManagerEvm(seedPhrase, arbitrumConfig)


const aaArbitrumAccount = await arbitrumClient.getAccount();
console.log("Smart‑account:", await aaArbitrumAccount.getAddress()); // 0x… counterfactual
```

### 4.3 Polygon

```js
const polygonConfig = {
 "chainId": 137,
 "blockchain": "polygon",
 "provider": "https://polygon-rpc.com",
  // You can use any compatible service provider for bundlerUrl and paymasterUrl.
  // The URLs below use Pimlico as an example.
 "bundlerUrl": "https://api.candide.dev/public/v3/polygon",
 "paymasterUrl": "https://api.candide.dev/public/v3/polygon",
  // The paymasterAddress below is for example/testing purposes and works with the example provider.
  // If you use a different service provider or deploy your own paymaster, be sure to use your own paymaster address/key.
 "paymasterAddress": "0x8b1f6cb5d062aa2ce8d581942bbb960420d875ba",
 "entryPointAddress": "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
 "transferMaxFee": 5000000,
 "swapMaxFee": 5000000,
 "bridgeMaxFee": 5000000,
 "paymasterToken": {
     "address": "0xdAC17F958D2ee523a2206206994597C13D831ec7"
 },
 "safeModulesVersion": "0.3.0"
}

const polygonClient = new WalletManagerEvm(seedPhrase, polygonConfig)

const aaPolygonAccount = await polygonClient.getAccount();
console.log("Smart‑account:", await aaPolygonAccount.getAddress()); // 0x… counterfactual
```

> **Important:** `bundlerUrl`, `paymasterUrl` *and* `paymasterAddress` **must always be updated together** when switching providers or networks.

---

## 5 · Summary cheat‑sheet

| Task           | Classic EOA                                | ERC‑4337 smart‑account                                           |
| -------------- | ------------------------------------------ | ---------------------------------------------------------------- |
| Instantiate    | `new WalletManagerEvm(seed, { provider })` | `new WalletManagerEvm(seed, { provider, bundlerUrl, … })` |
| Derive account | `manager.getAccount(index)`                | same API                                                         |
| Derive address | `account.getAddress()`              | same API                            |

---

## Next steps

* **Account's balance & Deposit →** [Getting an account's balance](./get-balance.md)
* **Transactions & gas strategy →** [Sending EVM transactions](./transfer.md)
* **Swaps & bridges →** [DeFi protocols](../defi.md)

---

© 2025 Wallet Development Kit contributors 