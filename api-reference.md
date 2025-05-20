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
    host: "BITCOIN_NODE",
    port: 8000
  },
  spark: {
    network: "MAINNET"
  }
};

const wdk = new WdkManager(seedPhrase, config);
```

---

## Account Management

- Create and retrieve blockchain account instances
- Retrieve addresses for all supported blockchains

**Key Methods:**
- `wdk.getAccount(blockchain: string, index: number): Account`
- `wdk.getAbstractedAddress(blockchain: string, index: number): Promise<string>`
- `account.getAddress(blockchain: string, index: number): Promise<string>`

**Example:**
```js
const btcAccount = await wdk.getAccount("bitcoin", 0);
const sparkAccount = await wdk.getAccount("spark", 0);

const ethereumAddress = await wdk.getAbstractedAddress("ethereum", 0);
const btcAddress = await btcAccount.getAddress("bitcoin", 0);
```

---

## Balance Management

- Query native and token balances across supported blockchains

**Key Methods:**
- `account.getBalance(blockchain: string, index: number): Promise<number>`
- `wdk.getAbstractedAddressTokenBalance(blockchain: string, index: number, { token }): Promise<number>`

**Example:**
```js
const balanceBTConBitcoin = await btcAccount.getBalance("bitcoin", 0);
const balanceBTConSpark = await sparkAccount.getBalance("spark", 0);

const balanceUSDTonEthereum = await wdk.getAbstractedAddressTokenBalance("ethereum", 0, {
  token: "0xdAC17F958D2ee523a2206206994597C13D831ec7"
});
```

---

## Lightning Network Support

- Create and pay Lightning invoices (Spark only)

**Key Methods:**
- `account.createLightningInvoice({ value, memo }): Promise<Invoice>`
- `account.payLightningInvoice({ invoice, maxFeeSats }): Promise<Payment>`

**Example:**
```js
const lightningInvoice = await sparkAccount.createLightningInvoice({
  value: 1000,
  memo: "Test invoice"
});

const payment = await sparkAccount.payLightningInvoice({
  invoice: "<invoice_string>",
  maxFeeSats: 5
});
```

---

## Transaction Management

- Transfer tokens, send transactions, and manage fees

**Key Methods:**
- `wdk.quoteTransfer(blockchain, index, params): Promise<Quote>`
- `wdk.quoteBridge(blockchain, index, params): Promise<Quote>`
- `account.quoteTransaction({ to, value }): Promise<Quote>`
- `account.getSingleUseDepositAddress(): Promise<string>`
- `account.sendTransaction({ to, value }): Promise<TxReceipt>`
- `account.withdraw({ onchainAddress, amountSats, exitSpeed }): Promise<Withdrawal>`

**Examples:**

*Token Transfer (Ethereum, Polygon, Arbitrum, Ton):*
```js
const quoteTransferUSDTonEthereum = await wdk.quoteTransfer("ethereum", 0, {
  recipient: "0xd3D224Ca27C4b4350b8BCD52c9381E1a8CEEFcf0",
  amount: 1_000_000,
  token: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  paymasterToken: { address: "0xdAC17F958D2ee523a2206206994597C13D831ec7" },
  transferMaxFee: 1_000_000
});
```

*Bridge Tokens:*
```js
const quoteBridgeUSDTonEthereum = await wdk.quoteBridge("ethereum", 0, {
  recipient: "0xd3D224Ca27C4b4350b8BCD52c9381E1a8CEEFcf0",
  amount: 1_000_000,
  token: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  targetChain: "arbitrum"
});
```

*BTC Transfer (Bitcoin, Spark):*
```js
const quoteTransferBTConBitcoin = await btcAccount.quoteTransaction({
  to: "bc1qej90a8xr5sndvdj6zv3w9350evn5p0j7j5g0md",
  value: 1_000_000
});
```

*Spark Deposit/Withdraw:*
```js
const sparkDepositAddress = await sparkAccount.getSingleUseDepositAddress();
await sparkAccount.sendTransaction({
  to: sparkDepositAddress,
  value: 1_000_000
});

const withdraw = await sparkAccount.withdraw({
  onchainAddress: "bc1qej90a8xr5sndvdj6zv3w9350evn5p0j7j5g0md",
  amountSats: 1_000_000,
  exitSpeed: "MEDIUM"
});
```

---

## Supported Blockchains & Config Example

```js
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
    host: "BITCOIN_NODE",
    port: 8000
  },
  spark: {
    network: "MAINNET"
  }
};
```