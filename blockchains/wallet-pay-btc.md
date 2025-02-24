# 🏦 lib-wallet-pay-btc

Bitcoin payment method for WDK. Powered by Electrum protocol ⚡

## ✨ Features:
- 🔑 Support for P2WPKH/BIP84 HD path traversal.
- 💰 Internal UTXO management 
- 🧮 Internal balance calculation. 
- 📡 Transaction broadcasting
- 🧩 Modular design. drop in seed/storage/block source components

## Terminology
### Wallet Software
- **Electrum**: A popular, feature-rich Bitcoin wallet software that supports various advanced features like multi-signature wallets, hardware wallet integration, and coin control. It uses a distributed network of servers to verify transactions and broadcast them to the Bitcoin network.

- **Fulcrum**: An open-source implementation of the Electrum Server protocol. It allows users to run their own Electrum server, providing enhanced privacy and independence from third-party servers when using Electrum wallet software.

### Bitcoin Improvement Proposals (BIPs)
BIPs are design documents for introducing features or information to Bitcoin. Here are links to the repositories of three important BIPs related to wallet management:

- [BIP39 (Mnemonic code for generating deterministic keys)](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki)

- [BIP44 (Multi-Account Hierarchy for Deterministic Wallets)](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki)

- [BIP84 (Derivation scheme for P2WPKH based accounts)](https://github.com/bitcoin/bips/blob/master/bip-0084.mediawiki)

These BIPs work together to provide a standardized way of generating and managing Bitcoin addresses and keys, enhancing interoperability between different wallet implementations.

These BIPs work together to provide a standardized way of generating and managing Bitcoin addresses and keys, enhancing interoperability between different wallet implementations.
To learn more about Bitcoin check out the [Plan B school](https://planb.network/courses)

## 🚀 Usage

```javascript
// Start with a storage engine
const storeEngine = new WalletStoreHyperbee()
await storeEngine.init()

// Generate a seed or use a mnemonic phrase
const seed = await BIP39Seed.generate(/** Can enter mnemonic phrase here to **/)

// Connect to an electrum server.
// host and port are the electrum server details.
// Additional options can be passed to the Electrum class with regards to caching.
const provider = await Electrum({ store: storeEngine, host, port })
await provider.connect()

// setup key manager for managing address generation
const km = new KeyManager({
    seed
  })
await km.init()

// Start new Bitcoin wallet
const btcPay = new BitcoinPay({
  // Asset name is a unique key for the assets
  // allow multiple assets of same type per wallet
  asset_name: 'btc',
  // Electrum provider.
  provider,
  // Key manager: handle address generation library from seed.
  key_manager: km,
  // Wallet store: Storage engine for the wallet
  store: storeEngine
  // Network: network type, regtest, testnet, mainnet
  network: 'regtest',
  // Min confs: Minimum number of confirmations to consider a transaction confirmed
  min_block_confirmations: 1,
  // Gap limit: Number of addresses to look ahead for transactions.
  gap_limit: 20,
})
// Start wallet.
await btcPay.initialize({})

// Listen to each path that has transactions.
// This wallet follow BIP84 standard for address generation and 
// the gap limit by default is 20.
btcPay.on('sync-path', (pathType, path, hasTx, progress) => {
  console.log('Syncing path', pathType, path, hasTx, progress)
})

// Parse blockchain for transactions to your wallet.
// This needs to be run when recreating a wallet. 
// This can take long depending on the number of addresses a wallet has created.
await btcPay.syncTransactions({ 
  reset : false // Passing true will resync from scratch 
})

// Pause the sync process. 
// If the application needs to sleep and come back to resume syncing.
await btcPay.pauseSync()
btcPay.broadcasted((tx) => {
  // transaction is broadcasted but not updated internal state
})

const tx = await btcPay.sendTransaction({}, {
    amount: 0.1,
    unit: 'main',
    address: "bcr11",
    fee: 10
})



// Get a new address. This will add the address to watch list for incoming payments. You should limit address generation to prevent spam.
// This will return address, HD PATH, pubkey and WIF private key of the address. 
const { address } = await btcPay.getNewAddress()

// Get balance of an address
// Balance is returned in format of:
// Confirmed: Confirmed balance. This is transactions that have more than min number of confirmations 
// Pending: Pending balance. Transactions that have less than min number of confirmations
// Mempool: Mempool balance. Transactions that are in the mempool and have no confirmations.
// If you pass an address, it will return balance of that address in your wallet
// If you don't pass an address, it will return total balance of all addresses in your wallet.
const addrBalance = await btcPay.getBalance({}, address)

// Get total balance across all addresses
const walletBalance = await btcPay.getBalance({})

// Send bitcoin to an address
// Result will contain:
// - txid: Transaction ID
// - feeRate: Fee rate in sat/vByte
// - fee: Fee in satoshis
// - vSize: Virtual size of the transaction
// - hex: Raw transaction hex
// - utxo: UTXO used in the transaction
// - vout: Vout bytes of the transaction
// - changeAddress: Change address of the transaction. which contains, address, WIF, path, pub key.
const result = await btcPay.sendTransaction({}, {
  to: 'bcr111...', // bitcoin address of the recipient
  
  // Amounts of bitcoin to send 
  amount: 0.0001, // Value of amount 
  unit: 'main', // unit of amount: main = Bitcoin and base = satoshi unit

  fee: 10, // Fees in sats per vbyte. 10 = 10 sat/vByte
})

// Get a list of transactions
const txs = await btcPay.getTransactions(query)

// is address a valid bitcoin address
const isvalid = await btcPay.isValidAddress('bcrt1qxeyapzy3ylv67qnxjtwx8npd8ypjkuy8xstu0m')

// Destroy instance of the wallet. This stops all wallet activity.
// You need to recreate btcPay instance to use the wallet again.
await btcPay.destroy()


```

## 📚 Methods


### 🛠️ Methods

The following methods are available on this module:

#### 🏠 `getNewAddress()`

* **Description**: Generates a new Bitcoin address.
* **Return Value**: A Promise that resolves to the newly generated address.

Example usage:
```javascript
const wallet = new WalletPayBitcoin();
const newAddress = await wallet.getNewAddress();
console.log(newAddress); // Output: a newly generated Bitcoin address object.
```

#### 💰 `getBalance(opts, addr)`

* **Description**: Retrieves the balance of an address or the entire wallet.
* **Return Value**: A Promise that resolves to the balance in BTC (or a rejection with an error message).
* **Parameters**:
        + `opts` (optional): An object containing configuration options for the method. Currently, no specific properties are required.
        + `addr`: The address you want to get the balance for

Example usage:
```javascript
const balance = await wallet.getBalance();
console.log(balance); // Output: the balance of the entire wallet

const balanceForAddress = await wallet.getBalance(opts, { address: '<addr>' });
console.log(balanceForAddress); // Output: the balance for a specific address
```

#### 🔄 `syncTransactions(opts)`

* **Description**: Syncs transactions with Electrum.
* **Return Value**: A Promise that resolves when syncing is complete (or a rejection with an error message).
* **Parameters**:
        + `opts` (optional): An object containing configuration options for the method. Currently, no specific properties are required.
            - `reset` Boolean, if you want to resync from start

Example usage:
```javascript
await wallet.syncTransactions(opts);
console.log('Syncing complete!'); // Output: confirmation message when syncing is done
```

#### ⏸️ `pauseSync()`

* **Description**: Pauses syncing transactions from Electrum.
* **Return Value**: A Promise that resolves immediately (or a rejection with an error message).

Example usage:
```javascript
wallet.pauseSync();
console.log('Syncing paused!'); // Output: confirmation message when syncing is paused
```

#### 📤 `sendTransaction(opts, outgoing)`

* **Description**: Sends a transaction to a specified address.
* **Return Value**: A Promise that resolves when the transaction is sent (or a rejection with an error message).
* **Parameters**:
        + `outgoing`: An object containing configuration options for the method. Required properties include:
                - `address`
                - `amount`
                - `unit` `main` for btc and `base` for sats 
                - `fee` in sats per byte: 
        + `opts`: 

Example usage:
```javascript
const txOpts = {
  address: '',
  unit: 'base',
  amount: 10000,
  fee: 10  
};
const tx = await wallet.sendTransaction({}, txOpts);
console.log('Transaction sent!'); // Output: confirmation message when the transaction is sent
```

#### 📜 `getTransactions(opts, fn)`
* **Description**: Retrieves transaction history from the history store. This method iterates through all entries in the history store and processes transactions using the provided callback function.
* **Return Value**: A Promise that resolves when all transactions have been processed (or a rejection with an error if an exception occurs).
* **Parameters**:
  + `fn` (Function): A callback function to process each set of transactions.

Example usage:
```javascript
await wallet.getTransactions({}, async (txs) => {
    console.log('iterate through tx', txs)

});

```

Notes:
- The callback function `fn` should be an async function that takes one parameter: an array of transaction objects for a specific block height.
- This method retrieves all transactions stored in the history store, including those in the mempool (height 0).
- Transactions are grouped by block height in the history store.
- The method uses the `entries` method of the underlying store, which may have performance implications for large transaction histories.

## 🔔 Events

The `BitcoinPay` instance emits the following events:

### 1. 🟢 `'ready'`

* **Description**: Emitted when the wallet is fully initialized and ready for use.
* **Callback Parameters**: None

Example usage:
```javascript
btcPay.on('ready', () => {
  console.log('Bitcoin wallet is ready for use');
});
```

### 2. 🔄 `'synced-path'`

* **Description**: Emitted for each HD path that has been synced during the transaction synchronization process.
* **Callback Parameters**: 
  - `pathType` (String): Type of the path (e.g., 'external', 'internal')
  - `path` (String): The HD path that was synced
  - `hasTx` (Boolean): Whether the path has any transactions
  - `progress` (Object): Sync progress information

Example usage:
```javascript
btcPay.on('synced-path', (pathType, path, hasTx, progress) => {
  console.log(`Synced path: ${pathType} ${path}, Has transactions: ${hasTx}`);
  console.log('Sync progress:', progress);
});
```

### 3. 💸 `'new-tx'`

* **Description**: Emitted when a new transaction is detected for the wallet.
* **Callback Parameters**: 
  - `transaction` (Object): The new transaction object

Example usage:
```javascript
btcPay.on('new-tx', (transaction) => {
  console.log('New transaction detected:', transaction);
});
```

## 🛠️ Development

To set up the development environment for the Bitcoin payment module, follow these steps:

1. Set up a local Bitcoin environment:
   - Follow the instructions in the [Test tools : Bitcoin](../test-tools/btc-testing.md)
   - This will help you set up a local Bitcoin regtest network for development and testing

2. Clone the repository:
   ```bash
   git clone git@github.com:tetherto/lib-wallet-pay-btc.git
   cd lib-wallet-pay-btc
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Run tests:
    ```bash
    npm run test:pay
    ```

### 🔗 Links
- [List of Electrum nodes](https://1209k.com/bitcoin-eye/ele.php) (Fulcrum recommended)

### 🧪 Testing

- There is extensive integration tests for this package. 
- We use Brittle for testing. Checkout package.json for various test commands.
- Integration tests need a electrum server connected to a regtest bitcoin node.
- To setup testing environment see: [WDK test tools](https://github.com/tetherto/wallet-lib-test-tools/blob/main/src/bitcoin/README.md)

to run tests, take a look at `package.json` for the various test scripts.
```
npm run test:*
```