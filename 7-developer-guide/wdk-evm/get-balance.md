---
title: Get Balance
description: Read native-coin and token balances with WDK, both on classic accounts and on ERC-4337 / TON account-abstraction wallets.
author: Raquel Carrasco Gonzalez
icon: coins
lastReviewed: 2025-06-23
---

# Getting an account's balance 

WDK offers **two complementary APIs** for balance queries:

| Layer | Typical call | When to use |
|-------|--------------|-------------|
| **Classic account** – the plain address derived from your seed | `await account.getBalance()` `await account.getTokenBalance(token)` | Anytime you work with a regular EOA (EVM), P2PKH / P2WPKH (BTC), or v4 wallet without paymaster (TON). |
| **Account-abstraction helper** – smart-contract wallet that can be gas-sponsored | `wdk.getAbstractedAddressBalance(chain, idx)` `wdk.getAbstractedAddressTokenBalance(chain, idx, token)` | When you enabled a paymaster (ERC-4337 on EVM, gasless v4 on TON) and want to read the **contract-wallet** balance. |

_All balances come back in **base-unit integers** (wei, satoshi, nanoTON, …). Convert to human units in the UI (`formatEther`, `Number(sats)/1e8`, *etc.*)._


## 1 · Classic EVM balance (EOA)

```js
import { WalletManagerEvm } from '@wdk/wallet-evm';


// const evm = new WalletManagerEvm(process.env.MNEMONIC, {
//   provider: 'https://rpc.ankr.com/eth'
// });

// const account  = await evm.getAccount(0);

const balanceWei =  account.getBalance();
console.log('ETH (wei):', balanceWei);

// human-readable ETH
const eth = Number(balanceWei) / 1e18;
console.log('ETH:', eth.toLocaleString());

const usdtRaw =  account.getTokenBalance(
  '0xdAC17F958D2ee523a2206206994597C13D831ec7'   // USDT-ERC20 in Ethereum
);
console.log('USDT (6 dec):', usdtRaw);

```

## 2 · EVM account-abstraction (ERC-4337) balance using `@wdk/account-abstraction-evm`

```js
import { WalletManagerEvm } from '@wdk/wallet-evm';
import AccountAbstractionManagerEvm from '@wdk/account-abstraction-evm';

// Initialize Account Abstraction
const ethereum = new AccountAbstractionManagerEvm(account, {
    "chainId": 42161,
    "rpcUrl": process.env.RPC_URL,
    "bundlerUrl": process.env.BUNDLER_URL,
    "paymasterUrl": process.env.PAYMASTER_URL,
    "paymasterAddress": process.env.PAYMASTER_ADDRESS,
    "entryPointAddress": process.env.ENTRY_POINT_ADDRESS,
    "safeModulesVersion": "0.3.0",
    "transferMaxFee": 5_000_000,
    "paymasterToken": {
        "address": "0xdAC17F958D2ee523a2206206994597C13D831ec7" // USDT on Ethereum Mainnet
    }
});


// Check native token balance (ETH)
const aaWeiBalance = await ethereum.getAbstractedAddressBalance();

console.log("ETH Balance (wei):", aaWeiBalance);

// Check USDT balance
const usdtAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7";

const aaUsdtBalance = await ethereum.getAbstractedAddressTokenBalance(usdtAddress);
console.log("USDT Balance:", aaUsdtBalance);
```


## 3 · EVM account-abstraction (ERC-4337) balance using `@wdk-core` manager


Example using `AccountAbstractionManagerEvm` to check balances on the Ethereum Mainnet.

```js
import WdkManager, { Blockchain } from './wdk-manager.js';


const wdk = new WdkManager(process.env.MNEMONIC, {
  ethereum: {
    provider:     'https://rpc.ankr.com/eth',
    bundlerUrl:   process.env.BUNDLER_URL,
    paymasterUrl: process.env.PM_URL,
    paymasterToken: { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' } // USDT
  }
});

const aaWei  = await wdk.getAbstractedAddressBalance(Blockchain.Ethereum, 0);
const aaUsdt = await wdk.getAbstractedAddressTokenBalance(
  Blockchain.Ethereum,
  0,
  '0xdAC17F958D2ee523…'
);

// Check native token balance (ETH)
const aaWei = await ethereum.getAbstractedAddressBalance();

console.log("ETH Balance:", nativeBalance);

// Check USDT balance
const usdtAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7";

const usdtBalance = await ethereum.getAbstractedAddressTokenBalance(usdtAddress);
console.log("USDT Balance:", usdtBalance);
```

## 4 · Bitcoin balance (UTXO) using `@wdk/wallet-btc`

| Field         | Type                                      | Default                       | Why you'd change it                                                                                                        |
| ------------- | ----------------------------------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **`network`** | `"bitcoin"` \| `"testnet"` \| `"regtest"` | `"bitcoin"`                   | Point the wallet at main-net, public test-net, or a local regtest node.                                                    |
| **`host`**    | `string`                                  | `"electrum.blockstream.info"` | Use your own Electrum server for privacy or faster sync.                                                                   |
| **`port`**    | `number`                                  | `50001` (TCP) / `50002` (SSL) | Match the port of the Electrum host you supply.                                                                            |
| **`bip`**     | `44` \| `49` \| `84`                      | `84`                          | Choose address format:<br>• `44` → legacy P2PKH `1...`<br>• `49` → nested SegWit `3...`<br>• `84` → native SegWit `bc1...` |


```js
import { WalletManagerBtc } from '@wdk/wallet-btc';

// Classic BTC wallet — fees paid in satoshis
const btc = new WalletManagerBtc(process.env.MNEMONIC, { network: 'bitcoin' }); //

const account = await btc.getAccount(0);   // m/84'/0'/0'/0/0 (SegWit)
const sats    = await account.getBalance();

console.log('BTC (sats):', sats);
```


## 5 · Bitcoin balance (UTXO) using `@wdk-core` manager

```js
import WdkManager, { Blockchain } from './wdk-manager.js';

// WdkManager orchestrates all chains; config only the ones you need
const wdk = new WdkManager(process.env.MNEMONIC, {
  bitcoin: { network: 'bitcoin' }
});

const account = await wdk.getAccount(Blockchain.Bitcoin, 0);
const sats    = await account.getBalance();

console.log('BTC (sats):', sats);

```

## 6 · TON balance (classic) using `@wdk/wallet-ton`

```js
import { WalletManagerTon } from '@wdk/wallet-ton';

// Classic TON wallet – fees paid in native TON
const ton = new WalletManagerTon(process.env.MNEMONIC, {
  tonClient:    { url: process.env.TON_CENTER_URL, secretKey: process.env.TON_CENTER_SK },
  tonApiClient: { url: process.env.TON_API_URL,    secretKey: process.env.TON_API_SK }
});

const account = await ton.getAccount("0'/0/0");          // v4 wallet at m/44'/607'/0'/0/0
const nano   = await account.getBalance();               // nanoTON (1 TON = 1e9)

console.log('TON (nano):', nano);
```

| Field                | Type     | Default | Purpose                                 |
|----------------------|----------|---------|-----------------------------------------|
| `tonClient.url`      | string   | —       | gRPC endpoint for full-node access      |
| `tonClient.secretKey`| string   | —       | API key for the node (if required)      |
| `tonApiClient.url`   | string   | —       | Public REST endpoint (used for Jetton look-ups) |
| `tonApiClient.secretKey` | string | —     | API key for the REST endpoint           |

## 7 · TON balance (gas-sponsored v4 wallet) using `WdkManager`

```js
import WdkManager, { Blockchain } from './wdk-manager.js';

const USDT_TON = "EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs"; // USDT on TON

const wdk = new WdkManager(process.env.MNEMONIC, {
  ton: {
    tonClient:    { url: process.env.TON_CENTER_URL, secretKey: process.env.TON_CENTER_SK },
    tonApiClient: { url: process.env.TON_API_URL,    secretKey: process.env.TON_API_SK },
    /* paymaster Jetton → enables "gasless" mode */
    paymasterToken: { address: USDT_TON}     // e.g. USDT-TON master
  }
});

/* Balance of the contract-wallet that the paymaster deploys */
const aaNano = await wdk.getAbstractedAddressBalance(Blockchain.Ton, 0);
const aaUsdt = await wdk.getAbstractedAddressTokenBalance(
  Blockchain.Ton,
  0,
  'EQDx…USDTJetton'                                    // same Jetton address
);

console.log('AA TON (nano):',  aaNano);
console.log('AA USDT (base):', aaUsdt);
```
> **Note**: 
>
>If you omit `paymasterToken`, `wdk.getAbstractedAddressBalance` throws `Error: Account abstraction unsupported for blockchain: ton` — fall back to the classic methods shown above.
>
>Fees are front-run by the paymaster in toncoin and later reimbursed in the specified Jetton; the user sees a zero-TON fee UX.

## Spark
> 🚧 Work in progress

## 8 · Quick reference

| Task                     | Classic account                      | Account-abstracted address                              |
| ------------------------ | ------------------------------------ | ------------------------------------------------------- |
| Get address              | `account.getAddress()`               | `wdk.getAbstractedAddress()`                            |
| Native balance           | `account.getBalance()`               | `wdk.getAbstractedAddressBalance()`                     |
| Token balance            | `account.getTokenBalance(token)`     | `wdk.getAbstractedAddressTokenBalance()`                |
| Transfer / Swap / Bridge | Use account's `sendTransaction` etc. | `wdk.transfer / swap / bridge` (handles paymaster & AA) |

> Tip: Start with classic wallets; switch to AA helpers when you need gasless UX or custom fee logic.
