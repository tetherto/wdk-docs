# API Reference

This reference describes the main functions and usage patterns of the Wallet Development Kit (WDK), including initialization, configuration, and supported blockchain operations.

---

## Initialization & Configuration

```js
import WdkManager from './index.js';

const seedPhrase = ""; // Add your 12-word seed phrase here

const config = {
  ethereum: {
    chainId: 1,
    blockchain: "ethereum",
    rpcUrl: "https://0xrpc.io/eth",
    bundlerUrl: "https://api.pimlico.io/v2/1/rpc",
    paymasterUrl: "https://api.pimlico.io/v2/1/rpc",
    paymasterAddress: "0x777777777777AeC03fd955926DbF81597e66834C",
    entryPointAddress: "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
    transferMaxFee: 5000000,
    swapMaxFee: 5000000,
    bridgeMaxFee: 5000000,
    paymasterToken: { address: "0xdAC17F958D2ee523a2206206994597C13D831ec7" }
  },
  arbitrum: {
    chainId: 42161,
    blockchain: "arbitrum",
    rpcUrl: "https://arbitrum.drpc.org",
    bundlerUrl: "https://api.pimlico.io/v2/42161/rpc",
    paymasterUrl: "https://api.pimlico.io/v2/42161/rpc",
    paymasterAddress: "0x777777777777AeC03fd955926DbF81597e66834C",
    entryPointAddress: "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
    transferMaxFee: 5000000,
    swapMaxFee: 5000000,
    bridgeMaxFee: 5000000,
    paymasterToken: { address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9" }
  },
  polygon: {
    chainId: 137,
    blockchain: "polygon",
    rpcUrl: "https://polygon-rpc.com",
    bundlerUrl: "https://api.pimlico.io/v2/137/rpc",
    paymasterUrl: "https://api.pimlico.io/v2/137/rpc",
    paymasterAddress: "0x777777777777AeC03fd955926DbF81597e66834C",
    entryPointAddress: "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
    transferMaxFee: 5000000,
    swapMaxFee: 5000000,
    bridgeMaxFee: 5000000,
    paymasterToken: { address: "0xdAC17F958D2ee523a2206206994597C13D831ec7" },
    safeModulesVersion: "0.3.0"
  },
  ton: {
    tonApiUrl: "https://tonapi.io",
    tonApiSecretKey: "...",
    tonCenterUrl: "https://toncenter.com/api/v2/jsonRPC",
    tonCenterSecretKey: "...",
    paymasterToken: { address: "EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs" }
  },
  bitcoin: {
    host: "api.ordimint.com",
    port: 50001
  },
  spark: {
    network: "MAINNET"
  }
};

const wdk = new WdkManager(seedPhrase, config);
```

---

## Technical Reference

### Index

- Core Reference
- Wallet Reference
- Account Abstraction Reference

### Core Reference

#### @wdk/core

##### Index
- WdkManager
- Seeds
- WdkConfig
- IWalletAccount

##### class WdkManager

Creates a new wallet development kit manager.

###### constructor(seed: string | Seeds, config: WdkConfig)

**Parameters**
- `seed: string | Seeds` - A BIP-39 seed phrase to use for all blockchains, or an object mapping each blockchain to a different seed phrase.
- `config: WdkConfig` - The configuration for each blockchain.

###### Methods

**getAccount(blockchain: string, index?: number): Promise<IWalletAccount>**

Returns the wallet account for a specific blockchain and index (see BIP-44)

Parameters:
- `blockchain: string` - A blockchain identifier (e.g., "ethereum").
- `index?: number` - The index of the account to get (default: 0).

Return value:
- `Promise<IWalletAccount>` - The account.

**getAbstractedAddress(blockchain: string, accountIndex: number): Promise<string>**

Returns the abstracted address of an account.

Parameters:
- `blockchain: string` - A blockchain identifier (e.g., "ethereum").
- `accountIndex: number` - The index of the account to use (see BIP-44).

Return value:
- `Promise<string>` - The abstracted address.

**transfer(blockchain: string, accountIndex: number, options: TransferOptions): Promise<TransferResult>**

Transfers a token to another address.

Parameters:
- `blockchain: string` - A blockchain identifier (e.g., "ethereum").
- `accountIndex: number` - The index of the account to use (see BIP-44).
- `options: TransferOptions` - The transfer's options.

Return value:
- `Promise<TransferResult>` - The transfer's result.

**quoteTransfer(blockchain: string, accountIndex: number, options: TransferOptions): Promise<Omit<TransferResult, "hash">>**

Quotes the costs of a transfer operation.

Parameters:
- `blockchain: string` - A blockchain identifier (e.g., "ethereum").
- `accountIndex: number` - The index of the account to use (see BIP-44).
- `options: TransferOptions` - The transfer's options.

Return value:
- `Promise<Omit<TransferResult, "hash">>` - The transfer's quotes.

**swap(blockchain: string, accountIndex: number, options: SwapOptions): Promise<SwapResult>**

Swaps a pair of tokens.

Parameters:
- `blockchain: string` - A blockchain identifier (e.g., "ethereum").
- `accountIndex: number` - The index of the account to use (see BIP-44).
- `options: SwapOptions` - The swap's options.

Return value:
- `Promise<SwapResult>` - The swap's result.

**quoteSwap(blockchain: string, accountIndex: number, options: SwapOptions): Promise<Omit<SwapResult, "hash">>**

Quotes the costs of a swap operation.

Parameters:
- `blockchain: string` - A blockchain identifier (e.g., "ethereum").
- `accountIndex: number` - The index of the account to use (see BIP-44).
- `options: SwapOptions` - The swap's options.

Return value:
- `Promise<Omit<SwapResult, "hash">>` - The swap's quotes.

**bridge(blockchain: string, accountIndex: number, options: BridgeOptions): Promise<BridgeResult>**

Bridges usdt tokens to a different blockchain.

Parameters:
- `blockchain: string` - A blockchain identifier (e.g., "ethereum").
- `accountIndex: number` - The index of the account to use (see BIP-44).
- `options: BridgeOptions` - The bridge's options.

Return value:
- `Promise<BridgeResult>` - The bridge's result.

**quoteBridge(blockchain: string, accountIndex: number, options: BridgeOptions): Promise<Omit<BridgeResult, "hash">>**

Quotes the costs of a bridge operation.

Parameters:
- `blockchain: string` - A blockchain identifier (e.g., "ethereum").
- `accountIndex: number` - The index of the account to use (see BIP-44).
- `options: BridgeOptions` - The bridge's options.

Return value:
- `Promise<Omit<BridgeResult, "hash">>` - The bridge's quotes.

###### Static Methods

**getRandomSeedPhrase(): string**

Returns a random BIP-39 seed phrase.

Return value:
- `string` - The seed phrase.

**isValidSeedPhrase(seedPhrase: string): boolean**

Checks if a seed phrase is valid.

Parameters:
- `seedPhrase: string` - The seed phrase.

Return value:
- `boolean` - True if the seed phrase is valid.

##### type Seeds

Properties:
- `ethereum: string` - The ethereum's wallet seed phrase.
- `arbitrum: string` - The arbitrum's wallet seed phrase.
- `polygon: string` - The polygon's wallet seed phrase.
- `ton: string` - The ton's wallet seed phrase.
- `bitcoin: string` - The bitcoin's wallet seed phrase.
- `spark: string` - The spark's wallet seed phrase.

##### type WdkConfig

Properties:
- `ethereum: EvmWalletConfig | EvmAccountAbstractionConfig` - The configuration for the ethereum blockchain.
- `arbitrum: EvmWalletConfig | EvmAccountAbstractionConfig` - The configuration for the arbitrum blockchain.
- `polygon: EvmWalletConfig | EvmAccountAbstractionConfig` - The configuration for the polygon blockchain.
- `ton: TonWalletConfig | TonAccountAbstractionConfig` - The configuration for the ton blockchain.
- `bitcoin: BtcWalletConfig` - The configuration for the bitcoin blockchain.
- `spark: SparkWalletConfig` - The configuration for the spark blockchain.

##### interface IWalletAccount

Properties:
- `path: string` - The derivation path of this account (see BIP-44).
- `index: number` - The derivation path's index of this account.
- `keyPair: KeyPair` - The account's key pair.

Methods:
- **getAddress(): Promise<string>**
  Returns the account's address.
  Return value: `Promise<string>` - The account's address.

- **sign(message: string): Promise<string>**
  Signs a message.
  Parameters:
  - `message: string` - The message to sign.
  Return value: `Promise<string>` - The message's signature.

- **verify(message: string, signature: string): Promise<boolean>**
  Verifies a message's signature.
  Parameters:
  - `message: string` - The original message.
  - `signature: string` - The signature to verify.
  Return value: `Promise<boolean>` - True if the signature is valid.

- **sendTransaction(tx: Transaction): Promise<string>**
  Sends a transaction.
  Parameters:
  - `tx: Transaction` - The transaction to send.
  Return value: `Promise<string>` - The transaction's hash.

- **getBalance(): Promise<number>**
  Returns the account's native token balance.
  Return value: `Promise<number>` - The native token balance.

- **getTokenBalance(tokenAddress: string): Promise<number>**
  Returns the balance of the account for a specific token.
  Parameters:
  - `tokenAddress: string` - The smart contract address of the token.
  Return value: `Promise<number>` - The token balance.

### Wallet Reference

#### @wdk/wallet-evm

##### Index
- WalletManagerEvm
- WalletAccountEvm
- EvmWalletConfig
- EvmTransaction
- KeyPair

##### class WalletManagerEvm

###### constructor(seedPhrase: string, config?: EvmWalletConfig)

Creates a new wallet manager for evm blockchains.

Parameters:
- `seedPhrase: string` - The wallet's BIP-39 seed phrase.
- `config?: EvmWalletConfig` - The configuration object.

Properties:
- `seedPhrase: string` - The seed phrase of the wallet.

###### Methods

**getAccount(index?: number): Promise<WalletAccountEvm>**

Returns the wallet account at a specific index (see BIP-44).

Parameters:
- `index?: number` - The index of the account to get (default: 0).

Return value:
- `Promise<WalletAccountEvm>` - The account.

**getAccountByPath(path: string): Promise<WalletAccountEvm>**

Returns the wallet account at a specific BIP-44 derivation path.

Parameters:
- `path: string` - The derivation path (e.g. "0'/0/0").

Return value:
- `Promise<WalletAccountEvm>` - The account.

**getFeeRates(): Promise<{ normal: number, fast: number }>**

Returns the current fee rates.

Return value:
- `Promise<{ normal: number, fast: number }>` - The fee rates (in weis).

###### Static Methods

**getRandomSeedPhrase(): string**

Returns a random BIP-39 seed phrase.

Return value:
- `string` - The seed phrase.

**isValidSeedPhrase(seedPhrase: string): boolean**

Checks if a seed phrase is valid.

Parameters:
- `seedPhrase: string` - The seed phrase.

Return value:
- `boolean` - True if the seed phrase is valid.

##### class WalletAccountEvm

Implements: `IWalletAccount`

###### constructor(seedPhrase: string, path: string, config?: EvmWalletConfig)

Creates a new wallet account for a specific BIP-44 derivation path.

Parameters:
- `seedPhrase: string` - The wallet's BIP-39 seed phrase.
- `path: string` - The BIP-44 derivation path of the account (e.g., "0'/0/0").
- `config?: EvmWalletConfig` - The configuration object.

###### Methods

**sendTransaction(tx: EvmTransaction): Promise<string>**

Sends a transaction.

Parameters:
- `tx: EvmTransaction` - The transaction to send.

Return value:
- `Promise<string>` - The transaction's hash.

**quoteTransaction(tx: EvmTransaction): Promise<number>**

Quotes a transaction.

Parameters:
- `tx: EvmTransaction` - The transaction to quote.

Return value:
- `Promise<number>` - The transaction's fee (in weis).

##### type EvmWalletConfig

Properties:
- `rpcUrl?: string | Eip1193Provider` - The url of the rpc provider, or an instance of a class that implements eip-1193.

##### type EvmTransaction

Properties:
- `to: string` - The transaction's recipient.
- `value: number` - The amount of ethers to send to the recipient (in weis).
- `data?: string` - The transaction's data in hex format.
- `gasLimit?: number` - The maximum amount of gas this transaction is permitted to use.
- `gasPrice?: number` - The price (in wei) per unit of gas this transaction will pay.
- `maxFeePerGas?: number` - The maximum price (in wei) per unit of gas this transaction will pay for the combined EIP-1559 block's base fee and this transaction's priority fee.
- `maxPriorityFeePerGas?: number` - The price (in wei) per unit of gas this transaction will allow in addition to the EIP-1559 block's base fee to bribe miners into giving this transaction priority. This is included in the maxFeePerGas, so this will not affect the total maximum cost set with maxFeePerGas.

##### type KeyPair

Properties:
- `publicKey: string` - The public key.
- `privateKey: string` - The private key.

#### @wdk/wallet-ton

##### Index
- WalletManagerTon
- WalletAccountTon
- TonWalletConfig
- TonTransaction
- KeyPair

##### class WalletManagerTon

###### constructor(seedPhrase: string, config?: TonWalletConfig)

Creates a new wallet manager for the ton blockchain.

Parameters:
- `seedPhrase: string` - The wallet's BIP-39 seed phrase.
- `config?: TonWalletConfig` - The configuration object.

Properties:
- `seedPhrase: string` - The seed phrase of the wallet.

###### Methods

**getAccount(index?: number): Promise<WalletAccountTon>**

Returns the wallet account at a specific index (see BIP-44).

Parameters:
- `index?: number` - The index of the account to get (default: 0).

Return value:
- `Promise<WalletAccountTon>` - The account.

**getAccountByPath(path: string): Promise<WalletAccountTon>**

Returns the wallet account at a specific BIP-44 derivation path.

Parameters:
- `path: string` - The derivation path (e.g. "0'/0/0").

Return value:
- `Promise<WalletAccountTon>` - The account.

**getFeeRates(): Promise<{ normal: number, fast: number }>**

Returns the current fee rates.

Return value:
- `Promise<{ normal: number, fast: number }>` - The fee rates (in nanotons).

###### Static Methods

**getRandomSeedPhrase(): string**

Returns a random BIP-39 seed phrase.

Return value:
- `string` - The seed phrase.

**isValidSeedPhrase(seedPhrase: string): boolean**

Checks if a seed phrase is valid.

Parameters:
- `seedPhrase: string` - The seed phrase.

Return value:
- `boolean` - True if the seed phrase is valid.

##### class WalletAccountTon

Implements: `IWalletAccount`

###### constructor(seedPhrase: string, path: string, config?: TonWalletConfig)

Creates a new wallet account for a specific BIP-44 derivation path.

Parameters:
- `seedPhrase: string` - The wallet's BIP-39 seed phrase.
- `path: string` - The BIP-44 derivation path of the account (e.g., "0'/0/0").
- `config?: TonWalletConfig` - The configuration object.

###### Methods

**sendTransaction(tx: TonTransaction): Promise<string>**

Sends a transaction.

Parameters:
- `tx: TonTransaction` - The transaction to send.

Return value:
- `Promise<string>` - The transaction's hash.

**quoteTransaction(tx: TonTransaction): Promise<number>**

Quotes a transaction.

Parameters:
- `tx: TonTransaction` - The transaction to quote.

Return value:
- `Promise<number>` - The transaction's fee (in nanotons).

##### type TonWalletConfig

Properties:
- `tonApiUrl?: string` - The ton api's url.
- `tonApiSecretKey?: string` - The api-key to use to authenticate on the ton api.

##### type TonTransaction

Properties:
- `to: string` - The transaction's recipient.
- `value: number` - The amount of tons to send to the recipient (in nanotons).
- `bounceable?: boolean` - If set, overrides the bounceability of the transaction.

##### type KeyPair

Properties:
- `publicKey: string` - The public key.
- `privateKey: string` - The private key.

#### @wdk/wallet-btc

##### Index
- WalletManagerBtc
- WalletAccountBtc
- BtcWalletConfig
- BtcTransaction
- KeyPair

##### class WalletManagerBtc

###### constructor(seedPhrase: string, config?: BtcWalletConfig)

Creates a new wallet manager for the bitcoin blockchain.

Parameters:
- `seedPhrase: string` - The wallet's BIP-39 seed phrase.
- `config?: BtcWalletConfig` - The configuration object.

Properties:
- `seedPhrase: string` - The seed phrase of the wallet.

###### Methods

**getAccount(index?: number): Promise<WalletAccountBtc>**

Returns the wallet account at a specific index (see BIP-44).

Parameters:
- `index?: number` - The index of the account to get (default: 0).

Return value:
- `Promise<WalletAccountBtc>` - The account.

**getAccountByPath(path: string): Promise<WalletAccountBtc>**

Returns the wallet account at a specific BIP-44 derivation path.

Parameters:
- `path: string` - The derivation path (e.g. "/0'/0/0").

Return value:
- `Promise<WalletAccountBtc>` - The account.

**getFeeRates(): Promise<{ normal: number, fast: number }>**

Returns the current fee rates.

Return value:
- `Promise<{ normal: number, fast: number }>` - The fee rates (in satoshis).

###### Static Methods

**getRandomSeedPhrase(): string**

Returns a random BIP-39 seed phrase.

Return value:
- `string` - The seed phrase.

**isValidSeedPhrase(seedPhrase: string): boolean**

Checks if a seed phrase is valid.

Parameters:
- `seedPhrase: string` - The seed phrase.

Return value:
- `boolean` - True if the seed phrase is valid.

##### class WalletAccountBtc

Implements: `IWalletAccount`

###### constructor(seedPhrase: string, path: string, config?: BtcWalletConfig)

Creates a new wallet account for a specific BIP-44 derivation path.

Parameters:
- `seedPhrase: string` - The wallet's BIP-39 seed phrase.
- `path: string` - The BIP-44 derivation path of the account (e.g., "0'/0/0").
- `config?: BtcWalletConfig` - The configuration object.

###### Methods

**sendTransaction(tx: BtcTransaction): Promise<string>**

Sends a transaction.

Parameters:
- `tx: BtcTransaction` - The transaction to send.

Return value:
- `Promise<string>` - The transaction's hash.

**quoteTransaction(tx: BtcTransaction): Promise<number>**

Quotes a transaction.

Parameters:
- `tx: BtcTransaction` - The transaction to quote.

Return value:
- `Promise<number>` - The transaction's fee (in satoshis).

**getTransfers(options?: Object): Promise<BtcTransfer[]>**

Returns the bitcoin transfers history of the account.

Parameters:
- `options: Object` - The options.
  - `options.direction?: "incoming" | "outgoing" | "all"` - If set, only returns transfers with the given direction (default: "all").
  - `options.limit?: number` - The number of transfers to return (default: 10).
  - `options.skip?: number` - The number of transfers to skip (default: 0).

Return value:
- `Promise<BtcTransfer[]>` - The bitcoin transfers.

##### type BtcWalletConfig

Properties:
- `host?: string` - The electrum server's hostname (default: "electrum.blockstream.info").
- `port?: number` - The electrum server's port (default: 50001).
- `network?: string` - The name of the network to use; available values: "bitcoin", "regtest", "testnet" (default: "bitcoin").
- `bip?: 44 | 84` - The bip standard to use for derivation paths; available values: 44, 84 (default: 84).

##### type BtcTransaction

Properties:
- `to: string` - The transaction's recipient.
- `value: number` - The amount of bitcoins to send to the recipient (in satoshis).

##### type KeyPair

Properties:
- `publicKey: string` - The public key.
- `privateKey: string` - The private key.

##### type BtcTransfer

Properties:
- `txid: string` – Transaction ID
- `vout: number` – Index of the output in the transaction
- `direction: "incoming" | "outgoing"` – Direction of the transfer
- `value: number` – Value of the transfer in BTC
- `fee: number | null` – Fee paid for the full transaction in BTC
- `recipient: string | null` – Receiving address for outgoing transfers
- `height: number` – Block height (0 if unconfirmed)
- `address: string` – User's own address

#### @wdk/wallet-spark

##### Index
- WalletManagerSpark
- WalletAccountSpark
- SparkWalletConfig
- SparkTransaction
- KeyPair

##### class WalletManagerSpark

###### constructor(seedPhrase: string, config?: SparkWalletConfig)

Creates a new wallet manager for the spark blockchain.

Parameters:
- `seedPhrase: string` - The wallet's BIP-39 seed phrase.
- `config?: SparkWalletConfig` - The configuration object.

Properties:
- `seedPhrase: string` - The seed phrase of the wallet.

###### Methods

**getAccount(index?: number): Promise<WalletAccountSpark>**

Returns the wallet account at a specific index (see BIP-44).

Parameters:
- `index?: number` - The index of the account to get (default: 0).

Return value:
- `Promise<WalletAccountSpark>` - The account.

**getAccountByPath(path: string): Promise<WalletAccountSpark>**

Returns the wallet account at a specific BIP-44 derivation path.

Parameters:
- `path: string` - The derivation path (e.g. "/0'/0/0").

Return value:
- `Promise<WalletAccountSpark>` - The account.

**getFeeRates(): Promise<{ normal: number, fast: number }>**

Returns the current fee rates.

Return value:
- `Promise<{ normal: number, fast: number }>` - The fee rates (in satoshis).

###### Static Methods

**getRandomSeedPhrase(): string**

Returns a random BIP-39 seed phrase.

Return value:
- `string` - The seed phrase.

**isValidSeedPhrase(seedPhrase: string): boolean**

Checks if a seed phrase is valid.

Parameters:
- `seedPhrase: string` - The seed phrase.

Return value:
- `boolean` - True if the seed phrase is valid.

##### class WalletAccountSpark

Implements: `IWalletAccount`

###### Methods

**sendTransaction(tx: SparkTransaction): Promise<string>**

Sends a transaction.

Parameters:
- `tx: SparkTransaction` - The transaction to send.

Return value:
- `Promise<string>` - The transaction's hash.

**quoteTransaction(tx: SparkTransaction): Promise<number>**

Quotes a transaction.

Parameters:
- `tx: SparkTransaction` - The transaction to quote.

Return value:
- `Promise<number>` - The transaction's fee (in satoshis).

**getSingleUseDepositAddress(): Promise<string>**

Generates a single-use deposit address for bitcoin deposits from layer 1.

Once you deposit funds to this address, it cannot be used again.

Return value:
- `Promise<string>` - The single-use deposit address.

**claimDeposit(txId: string): Promise<WalletLeaf[] | undefined>**

Claims a deposit to the wallet.

Parameters:
- `txId: string` - The transaction id of the deposit.

Return value:
- `Promise<WalletLeaf[] | undefined>` - The single-use deposit address.

**getLatestDepositTxId(depositAddress: string): Promise<string | null>**

Checks for a confirmed deposit to the specified deposit address.

Parameters:
- `depositAddress: string` - The deposit address to check.

Return value:
- `Promise<string | null>` - The transaction id if found, null otherwise.

**withdraw(options:{ to: string, value: number }): Promise<CoopExitRequest | null | undefined>**

Initiates a withdrawal to move funds from the Spark network to an on-chain Bitcoin address.

Parameters:
- `options: Object` - The withdrawal's options.
  - `options.to: string` - The bitcoin address where the funds should be sent.
  - `options.value: number` - The amount in satoshis to withdraw.

Return value:
- `Promise<CoopExitRequest | null | undefined>` - The withdrawal request details, or null/undefined if the request cannot be completed.

**createLightningInvoice(options:{ value: number, memo?: string }): Promise<LightningReceiveRequest>**

Creates a lightning invoice for receiving payments.

Parameters:
- `options: Object` - The invoice's options.
  - `options.value: number` - The amount in satoshis.
  - `options.memo?: string` - An optional description for the invoice.

Return value:
- `Promise<LightningReceiveRequest>` - The BOLT11-encoded invoice.

**getLightningReceiveRequest(invoiceId: string): Promise<LightningReceiveRequest | null>**

Gets a lightning receive request by id.

Parameters:
- `invoiceId: string` - The id of the lightning receive request.

Return value:
- `Promise<LightningReceiveRequest | null>` - The lightning receive request.

**payLightningInvoice(options:{ invoice: string, maxFeeSats: number }): Promise<LightningSendRequest>**

Pays a lightning invoice.

Parameters:
- `options: Object` - The payment's options.
  - `options.invoice: string` - The BOLT11-encoded lightning invoice to pay.
  - `options.maxFeeStats: number` - The maximum fee to pay (in satoshis).

Return value:
- `Promise<LightningSendRequest>` - The lightning payment request details.

**getLightningSendFeeEstimate(options:{ invoice: string }): Promise<number>**

Gets fee estimate for sending Lightning payments.

Parameters:
- `options: Object` - The fee estimation options.
  - `options.invoice: string` - The BOLT11-encoded Lightning invoice to estimate fees for.

Return value:
- `Promise<number>` - Fee estimate for sending Lightning payments.

**getTransfers(options?: Object): Promise<SparkTransfer[]>**

Returns the bitcoin transfers history of the account.

Parameters:
- `options: Object` - The options.
  - `options.direction?: "incoming" | "outgoing" | "all"` - If set, only returns transfers with the given direction (default: "all").
  - `options.limit?: number` - The number of transfers to return (default: 10).
  - `options.skip?: number` - The number of transfers to skip (default: 0).

Return value:
- `Promise<SparkTransfer[]>` - The bitcoin transfers.

##### type SparkWalletConfig

Properties:
- `network?: string` - The network type; available values: "MAINNET", "REGTEST", "TESTNET" (default: "MAINNET").

##### type SparkTransaction

Properties:
- `to: string` - The transaction's recipient.
- `value: number` - The amount of bitcoins to send to the recipient (in satoshis).

##### type KeyPair

Properties:
- `publicKey: string` - The public key.
- `privateKey: string` - The private key.

##### type SparkTransfer

Properties:
To be defined…

### Account Abstraction Reference

#### @wdk/account-abstraction-evm

##### Index
- AccountAbstractionManagerEvm
- Account
- EvmAccountAbstractionConfig
- TransferOptions
- TransferResult
- SwapOptions
- SwapResult
- BridgeOptions
- BridgeResult

##### class AccountAbstractionManagerEvm

###### constructor(account: Account, config: EvmAccountAbstractionConfig)

Creates a new account abstraction manager for evm blockchains.

Each manager is bound to a single account that will be able to transfer, swap and bridge erc-20 tokens from its abstracted address, paying gas fees with the paymaster token.

Parameters:
- `account: Account` - The account to bind to this account abstraction manager.
- `config: EvmAccountAbstractionConfig` - The account abstraction configuration.

###### Methods

**getAbstractedAddress(): Promise<string>**

Returns the abstracted address of the account bound to this account abstraction manager.

Return value:
- `Promise<string>` - The abstracted address.

**transfer(options: TransferOptions, config?: Pick<EvmAccountAbstractionConfig, 'transferMaxFee', 'paymasterToken'>): Promise<TransferResult>**

Transfers a token to another address.

Parameters:
- `options: TransferOptions` - The transfer's options.
- `config?: Pick<EvmAccountAbstractionConfig, 'transferMaxFee', 'paymasterToken'>` - If set, overrides the 'transferMaxFee' and 'paymasterToken' options defined in the manager configuration.

Return value:
- `Promise<TransferResult>` - The transfer's result.

**quoteTransfer(options: TransferOptions, config?: Pick<EvmAccountAbstractionConfig, 'transferMaxFee', 'paymasterToken'>): Promise<Omit<TransferResult, "hash">>**

Quotes the costs of a transfer operation.

Parameters:
- `options: TransferOptions` - The transfer's options.
- `config?: Pick<EvmAccountAbstractionConfig, 'transferMaxFee', 'paymasterToken'>` - If set, overrides the 'transferMaxFee' and 'paymasterToken' options defined in the manager configuration.

Return value:
- `Promise<Omit<TransferResult, "hash">>` - The transfer's quotes.

**swap(options: SwapOptions, config?: Pick<EvmAccountAbstractionConfig, 'swapMaxFee', 'paymasterToken'>): Promise<SwapResult>**

Swaps a pair of tokens.

Parameters:
- `options: SwapOptions` - The swap's options.
- `config?: Pick<EvmAccountAbstractionConfig, 'swapMaxFee', 'paymasterToken'>` - If set, overrides the 'swapMaxFee' and 'paymasterToken' options defined in the manager configuration.

Return value:
- `Promise<SwapResult>` - The swap's result.

**quoteSwap(options: SwapOptions, config?: Pick<EvmAccountAbstractionConfig, 'swapMaxFee', 'paymasterToken'>): Promise<Omit<SwapResult, "hash">>**

Quotes the costs of a swap operation.

Parameters:
- `options: SwapOptions` - The swap's options.
- `config?: Pick<EvmAccountAbstractionConfig, 'swapMaxFee', 'paymasterToken'>` - If set, overrides the 'swapMaxFee' and 'paymasterToken' options defined in the manager configuration.

Return value:
- `Promise<Omit<SwapResult, "hash">>` - The swap's quotes.

**bridge(options: BridgeOptions, config?: Pick<EvmAccountAbstractionConfig, 'bridgeMaxFee', 'paymasterToken'>): Promise<BridgeResult>**

Bridges a token to a different blockchain.

Parameters:
- `options: BridgeOptions` - The bridge's options.
- `config?: Pick<EvmAccountAbstractionConfig, 'bridgeMaxFee', 'paymasterToken'>` - If set, overrides the 'bridgeMaxFee' and 'paymasterToken' options defined in the manager configuration.

Return value:
- `Promise<BridgeResult>` - The bridge's result.

**quoteBridge(options: BridgeOptions, config?: Pick<EvmAccountAbstractionConfig, 'bridgeMaxFee', 'paymasterToken'>): Promise<Omit<BridgeResult, "hash">>**

Quotes the costs of a bridge operation.

Parameters:
- `options: BridgeOptions` - The bridge's options.
- `config?: Pick<EvmAccountAbstractionConfig, 'bridgeMaxFee', 'paymasterToken'>` - If set, overrides the 'bridgeMaxFee' and 'paymasterToken' options defined in the manager configuration.

Return value:
- `Promise<Omit<BridgeResult, "hash">>` - The bridge's quotes.

**getAbstractedAddressBalance(): Promise<number>**

Returns the eth balance of the abstracted address.

Return value:
- `Promise<number>` - The eth balance (in weis).

**getAbstractedAddressPaymasterTokenBalance(): Promise<number>**

Returns the paymaster token balance of the abstracted address.

Return value:
- `Promise<number>` - The paymaster token balance (in base unit).

**getAbstractedAddressTokenBalance(tokenAddress: string): Promise<number>**

Returns the balance of the abstracted address for a specific erc-20 token.

Parameters:
- `tokenAddress: string` - The smart contract address of the erc-20 token.

Return value:
- `Promise<number>` - The token balance (in base unit).

##### type Account

Properties:
- `address?: string` - The account's address.
- `getAddress?: () => Promise<string>` - An async callback function that returns the account's address.
- `keyPair: KeyPair` - The account's key pair.

##### type EvmAccountAbstractionConfig

Properties:
- `chainId: number` - The blockchain's id (e.g., 1 for ethereum).
- `rpcUrl: string | Eip1193Provider` - The url of the rpc provider, or an instance of a class that implements eip-1193.
- `bundlerUrl: string` - The url of the bundler service.
- `paymasterUrl: string` - The url of the paymaster service.
- `paymasterAddress: string` - The address of the paymaster smart contract.
- `entryPointAddress: string` - The address of the entry point smart contract.
- `safeModulesVersion: string` - The safe modules version.
- `transferMaxFee?: number` - The maximum fee amount for transfer operations.
- `swapMaxFee?: number` - The maximum fee amount for swap operations.
- `bridgeMaxFee?: number` - The maximum fee amount for bridge operations.
- `paymasterToken: Object` - The paymaster token configuration.
  - `paymasterToken.address: string` - The address of the paymaster token.

##### type TransferOptions

Properties:
- `recipient: string` - The address of the recipient.
- `token: string` - The address of the token to transfer.
- `amount: number` - The amount of tokens to transfer to the recipient (in base units).

##### type TransferResult

Properties:
- `hash: string` - The hash of the transfer operation.
- `gasCost: number` - The gas cost in paymaster token.

##### type SwapOptions

Properties:
- `tokenIn: string` - The address of the token to sell.
- `tokenOut: string` - The address of the token to buy.
- `tokenInAmount?: number` - The amount of input tokens to sell (in base unit).
- `tokenOutAmount?: number` - The amount of output tokens to buy (in base unit).

##### type SwapResult

Properties:
- `hash: string` - The hash of the swap operation.
- `gasCost: number` - The gas cost in paymaster token.
- `tokenInAmount: number` - The amount of input tokens sold.
- `tokenOutAmount: number` - The amount of output tokens bought.

##### type BridgeOptions

Properties:
- `targetChain: string` - The identifier of the destination blockchain (e.g., "arbitrum").
- `recipient: string` - The address of the recipient.
- `token: string` - The address of the token to bridge.
- `amount: number` - The amount of usdt tokens to bridge to the destination chain (in base unit).

##### type BridgeResult

Properties:
- `hash: string` - The hash of the bridge operation.
- `gasCost: number` - The gas cost in paymaster token.
- `bridgeCost: number` - The bridge cost in usdt tokens.

#### @wdk/account-abstraction-ton

##### Index
- AccountAbstractionManagerTon
- Account
- TonAccountAbstractionConfig
- TransferOptions
- TransferResult
- SwapOptions
- SwapResult
- BridgeOptions
- BridgeResult

##### class AccountAbstractionManagerTon

###### constructor(account: Account, config: TonAccountAbstractionConfig)

Creates a new account abstraction manager for the ton blockchain.

Each manager is bound to a single account that will be able to transfer, swap and bridge jetton tokens from its abstracted address, paying gas fees with the paymaster token.

Parameters:
- `account: Account` - The account to bind to this account abstraction manager.
- `config: TonAccountAbstractionConfig` - The account abstraction configuration.

###### Methods

**getAbstractedAddress(): Promise<string>**

Returns the abstracted address of the account bound to this account abstraction manager.

Return value:
- `Promise<string>` - The abstracted address.

**transfer(options: TransferOptions, config?: Pick<TonAccountAbstractionConfig, 'transferMaxFee', 'paymasterToken'>): Promise<TransferResult>**

Transfers a token to another address.

Parameters:
- `options: TransferOptions` - The transfer's options.
- `config?: Pick<TonAccountAbstractionConfig, 'transferMaxFee', 'paymasterToken'>` - If set, overrides the 'transferMaxFee' and 'paymasterToken' options defined in the manager configuration.

Return value:
- `Promise<TransferResult>` - The transfer's result.

**quoteTransfer(options: TransferOptions, config?: Pick<TonAccountAbstractionConfig, 'transferMaxFee', 'paymasterToken'>): Promise<Omit<TransferResult, "hash">>**

Quotes the costs of a transfer operation.

Parameters:
- `options: TransferOptions` - The transfer's options.
- `config?: Pick<TonAccountAbstractionConfig, 'transferMaxFee', 'paymasterToken'>` - If set, overrides the 'transferMaxFee' and 'paymasterToken' options defined in the manager configuration.

Return value:
- `Promise<Omit<TransferResult, "hash">>` - The transfer's quotes.

**swap(options: SwapOptions, config?: Pick<TonAccountAbstractionConfig, 'swapMaxFee', 'paymasterToken'>): Promise<SwapResult>**

Swaps a pair of tokens.

Parameters:
- `options: SwapOptions` - The swap's options.
- `config?: Pick<TonAccountAbstractionConfig, 'swapMaxFee', 'paymasterToken'>` - If set, overrides the 'swapMaxFee' and 'paymasterToken' options defined in the manager configuration.

Return value:
- `Promise<SwapResult>` - The swap's result.

**quoteSwap(options: SwapOptions, config?: Pick<TonAccountAbstractionConfig, 'swapMaxFee', 'paymasterToken'>): Promise<Omit<SwapResult, "hash">>**

Quotes the costs of a swap operation.

Parameters:
- `options: SwapOptions` - The swap's options.
- `config?: Pick<TonAccountAbstractionConfig, 'swapMaxFee', 'paymasterToken'>` - If set, overrides the 'swapMaxFee' and 'paymasterToken' options defined in the manager configuration.

Return value:
- `Promise<Omit<SwapResult, "hash">>` - The swap's quotes.

**bridge(options: BridgeOptions, config?: Pick<TonAccountAbstractionConfig, 'bridgeMaxFee', 'paymasterToken'>): Promise<BridgeResult>**

Bridges a token to a different blockchain.

Parameters:
- `options: BridgeOptions` - The bridge's options.
- `config?: Pick<TonAccountAbstractionConfig, 'bridgeMaxFee', 'paymasterToken'>` - If set, overrides the 'bridgeMaxFee' and 'paymasterToken' options defined in the manager configuration.

Return value:
- `Promise<BridgeResult>` - The bridge's result.

**quoteBridge(options: BridgeOptions, config?: Pick<TonAccountAbstractionConfig, 'bridgeMaxFee', 'paymasterToken'>): Promise<Omit<BridgeResult, "hash">>**

Quotes the costs of a bridge operation.

Parameters:
- `options: BridgeOptions` - The bridge's options.
- `config?: Pick<TonAccountAbstractionConfig, 'bridgeMaxFee', 'paymasterToken'>` - If set, overrides the 'bridgeMaxFee' and 'paymasterToken' options defined in the manager configuration.

Return value:
- `Promise<Omit<BridgeResult, "hash">>` - The bridge's quotes.

**getAbstractedAddressBalance(): Promise<number>**

Returns the ton balance of the abstracted address.

Return value:
- `Promise<number>` - The ton balance (in nanotons).

**getAbstractedAddressPaymasterTokenBalance(): Promise<number>**

Returns the paymaster token balance of the abstracted address.

Return value:
- `Promise<number>` - The paymaster token balance (in base unit).

**getAbstractedAddressTokenBalance(tokenAddress: string): Promise<number>**

Returns the balance of the abstracted address for a specific jetton token.

Parameters:
- `tokenAddress: string` - The smart contract address of the jetton token.

Return value:
- `Promise<number>` - The token balance (in base unit).

##### type Account

Properties:
- `address?: string` - The account's address.
- `getAddress?: () => Promise<string>` - An async callback function that returns the account's address.
- `keyPair: KeyPair` - The account's key pair.

##### type TonAccountAbstractionConfig

Properties:
- `tonApiUrl: string` - The ton api's url.
- `tonApiSecretKey: string` - The api-key to use to authenticate on the ton api.
- `tonCenterUrl: string` - The ton center api's url.
- `tonCenterSecretKey: string` - The api-key to use to authenticate on the ton center api.
- `transferMaxFee?: number` - The maximum fee amount for transfer operations.
- `swapMaxFee?: number` - The maximum fee amount for swap operations.
- `bridgeMaxFee?: number` - The maximum fee amount for bridge operations.
- `paymasterToken: Object` - The paymaster token configuration.
  - `paymasterToken.address: string` - The address of the paymaster token.

##### type TransferOptions

Properties:
- `recipient: string` - The address of the recipient.
- `token: string` - The address of the token to transfer.
- `amount: number` - The amount of tokens to transfer to the recipient (in base units).

##### type TransferResult

Properties:
- `hash: string` - The hash of the transfer operation.
- `gasCost: number` - The gas cost in paymaster token.

##### type SwapOptions

Properties:
- `tokenIn: string` - The address of the token to sell.
- `tokenOut: string` - The address of the token to buy.
- `tokenInAmount?: number` - The amount of input tokens to sell (in base unit).
- `tokenOutAmount?: number` - The amount of output tokens to buy (in base unit).

##### type SwapResult

Properties:
- `hash: string` - The hash of the swap operation.
- `gasCost: number` - The gas cost in paymaster token.
- `tokenInAmount: number` - The amount of input tokens sold.
- `tokenOutAmount: number` - The amount of output tokens bought.

##### type BridgeOptions

Properties:
- `targetChain: string` - The identifier of the destination blockchain (e.g., "arbitrum").
- `token: string` - The address of the token to bridge.
- `recipient: string` - The address of the recipient.
- `amount: number` - The amount of usdt tokens to bridge to the destination chain (in base unit).
- `oft?: OftConfig` - If set, overrides the default oft config for the token to bridge. It is required for tokens that are not natively supported.

##### type BridgeResult

Properties:
- `hash: string` - The hash of the bridge operation.
- `gasCost: number` - The gas cost in paymaster token.
- `bridgeCost: number` - The bridge cost in usdt tokens.
