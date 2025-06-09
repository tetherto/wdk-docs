<!-- LOGO PLACEHOLDER -->
<p align="center">
  <img src="logo.png" alt="WDK Logo" width="120" />
</p>


# WDK One Pager: Quick Start Guide

## Overview
The Wallet Development Kit (WDK) is Tether's comprehensive open-source solution for building non-custodial blockchain wallets across multiple chains. WDK provides developers with a standardized interface to create wallet applications that hide blockchain complexity from end users while maintaining full user control over their assets.

<p align="center">
  <a href="https://www.npmjs.com/package/wdk-core"><img src="https://img.shields.io/npm/v/wdk-core.svg" alt="npm version"></a>
  <a href="https://github.com/your-org/wdk-core/blob/main/LICENSE"><img src="https://img.shields.io/github/license/your-org/wdk-core.svg" alt="license"></a>
</p>

---

## Who is WDK for?

#### Developers & Builders

- **App Developers:** Effortlessly add secure, non-custodial crypto wallet functionality to your web, mobile, or desktop applications
- **Hackers & Tinkerers:** Dive into blockchain abstraction, experiment with wallet features, and build innovative prototypes
- **Product Teams & Startups:** Rapidly prototype, test, and launch wallet solutions for multiple blockchains without reinventing the wheel

#### Business & Ecosystem

- **Partners**: Add your chain, DeFi protocol, or on/off ramp to the WDK ecosystem.
- **Venture Capital/Business**: Evaluate a robust, extensible wallet platform for your portfolio or ecosystem.

#### Education & Learning

- **Educators & Learners:** Use WDK as a hands-on resource for teaching, learning, or exploring blockchain wallet concepts
---
## Key Features

- **Multi-Blockchain Support**: Ethereum, Polygon, Arbitrum, TON, Bitcoin, Spark (Lightning Network)
- **Account Abstraction**: Gasless transactions, flexible fee payments
- **Unified API**: Consistent interface for all supported blockchains
- **Non-Custodial:** Users always control their private keys
- **DeFi Ready**: Native support for token transfers, swaps, and cross-chain bridging
- **Stateless & Non-Custodial**: No data or secrets are stored, you control all keys and secrets—WDK stores nothing

---

## Prerequisites

- Node.js >20.10 installed
- Basic understanding of blockchain concepts
- Some ETH on Arbitrum for gas fees
- Some USDT on Arbitrum for testing

## Quick Start: Tranfer using WDK

### Step 1: Installation

To get started, clone the WDK repository, navigate to the documentation folder, and install the necessary dependencies.

```bash
git clone https://github.com/tetherto/wdk-core
cd wdk-docs
npm install
```

### Step 2: Create `test.js`

Create a test.js file in the root directory to test the functionality.

```bash
touch test.js
```

### Step 3: Initialize WDK Manager

In this step, we create a wallet using the provided seed phrase and initialize Account Abstraction for the Arbitrum network.

First, we import two essential modules:

- **WalletManagerEvm from `@wdk/wallet-evm`**: This module is responsible for managing wallet creation and interacting with accounts on Ethereum-based networks. It allows you to create wallets from a seed phrase and manage accounts within the wallet.

- **AccountAbstractionManagerEvm from `@wdk/account-abstraction-evm`**: This module is used to handle Account Abstraction, which enables advanced transaction management features, such as gasless transactions, on Ethereum-based networks like Arbitrum.


```javascript
import WalletManagerEvm from '@wdk/wallet-evm';
import AccountAbstractionManagerEvm from '@wdk/account-abstraction-evm';
````
Next, you can either use an existing seed phrase or generate a new one for your wallet:

- **Using your seed phrase**: You can manually input your own seed phrase (a string of words that allows you to restore your wallet). This phrase should be kept secure and private.

```javascript

// Import your seed phrase or create a new one
const seedPhrase = "YOUR_SEED_PHRASE"
```
- **Generating a new seed phrase**: If you don't have a seed phrase, you can generate a random one using the`WdkManager.getRandomSeedPhrase()` method. This will provide you with a secure and unique seed phrase that can be used to create a new wallet.

```javascript
// Generate a random seed phrase
const seedPhrase = WdkManager.getRandomSeedPhrase();
console.log("   Generated new seed phrase:", seedPhrase);

// Verify if the seed phrase is valid
const isValid = WdkManager.isValidSeedPhrase(seedPhrase);
console.log("   New seed phrase is valid:", isValid);

```
This step ensures that your wallet is properly initialized with a valid seed phrase.

The code first generates a random seed phrase using `WdkManager.getRandomSeedPhrase()`. It then verifies the validity of the seed phrase with `WdkManager.isValidSeedPhrase()`. This check ensures that the generated phrase is valid and can be used to create a secure wallet.

Once the seed phrase is validated, the wallet is created using WalletManagerEvm. The wallet is then linked to the chosen network (Ethereum in this case) by specifying the `chainId` and `rpcUrl`.


```javascript
const wallet = new WalletManagerEvm(seedPhrase, {
    "chainId": 1,
    "rpcUrl": "https://rpc.ankr.com/eth/8XgNbW9oGuvBpx8wwk5TQIOwzIm4On3z"
})

const account = await wallet.getAccount(0);
console.log("   First account address:", await account.getAddress());
```

Next, we initialize the **Account Abstraction** using the `AccountAbstractionManagerEvm` to manage the transaction process on the Ethereum and Arbitrum network. Account Abstraction enables advanced features such as gasless transactions and customizable user operations.

- **account**: This is the wallet account that was previously created. It is used to initialize the `AccountAbstractionManagerEvm`.

- **chainId**: Specifies the Ethereum or Arbitrum network we are working with. In this case, it's set to `1` representing the Ethereum mainner, and `42161`, representing the Arbitrum mainnet.

- **rpcUrl**: The RPC URL that allows your application to interact with the Ethereum or Arbitrum network. Here, it’s connected to a public node via `rpc.ankr.com`.

- **bundlerUrl**: This URL is used to send user transactions to the bundler service. The bundler ensures transactions are aggregated and sent to the network in an optimized way.

- **paymasterUrl**: This URL defines the location of the paymaster service, which is responsible for paying for transaction fees on behalf of the user (in this case, the paymaster is on the Ethereum or Arbitrum network).

- **paymasterAddress**: The address of the paymaster contract. This is the smart contract that will be responsible for paying the gas fees for the transaction.

- **entryPointAddress**: The entry point contract address. This is the smart contract that acts as the entry point for Account Abstraction transactions.

- **safeModulesVersion**: Specifies the version of the safe modules to be used in the contract setup.

- **transferMaxFee**: Defines the maximum fee allowed for transactions, set here to 5,000,000 (in gas or token units).

- **paymasterToken**: The token used by the paymaster to pay for gas. In this example, it’s USDT (Tether) on the Ethereum or Arbitrum network, represented by its contract address.

```javascript
const eth = new AccountAbstractionManagerEvm(account, {
    "chainId": 1,
    "rpcUrl": "https://rpc.ankr.com/eth/ETH_RPC_URL_KEY",
    "bundlerUrl": "https://api.candide.dev/bundler/v3/ethereum/ETH_BUNDLER_URL_KEY",
    "paymasterUrl": "https://api.candide.dev/paymaster/v3/ethereum/ETH_PAYMASTER_URL_KEY",
    "paymasterAddress": "ETH_PAYMASTER_ADDRESS",
    "entryPointAddress": "ETH_ENTRY_POINT_ADDRESS",
    "safeModulesVersion": "0.3.0",
    "transferMaxFee": 5_000_000,
    "paymasterToken": {
        "address": "0xdAC17F958D2ee523a2206206994597C13D831ec7" //USDT Address
    }
});

const arbitrum = new AccountAbstractionManagerEvm(account, {
    "chainId": 42161,
    "rpcUrl": "https://arbitrum-one.public.blastapi.io",
    "bundlerUrl": "https://api.candide.dev/bundler/v3/arbitrum/ARB_BUNDLER_URL_KEY",
    "paymasterUrl": "https://api.candide.dev/paymaster/v3/arbitrum/ARB_PAYMASTER_URL_KEY",
    "paymasterAddress": "ARB_PAYMASTER_ADDRESS",
    "entryPointAddress": "ARB_ENTRY_POINT_ADDRESS",
    "safeModulesVersion": "0.3.0",
    "transferMaxFee": 5_000_000,
    "paymasterToken": {
        "address": "0xdAC17F958D2ee523a2206206994597C13D831ec7" //USDT Address
    }
});
```

### Step 4: Estimate and Execute the Transfer

In this step, we first estimate the gas cost for a transfer operation and then execute the transfer using the `AccountAbstractionManagerEvm` setup.

- **Estimate Transfer Quote**: We call quoteTransfer to get an estimated gas cost for the transfer. The result includes the gas cost and its value in USDT
  - `quoteTransfer`: Estimates the gas cost for the transfer.

```javascript
const quote = await arbitrum.quoteTransfer({
    recipient: "0xd3D224Ca27C4b4350b8BCD52c9381E1a8CEEFcf0",
    amount: "1",
    token: "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9"
}, {
    paymasterToken: {
        address: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9'
    },
    transferMaxFee: 5_000_000
})
```
- **Execute the Transfer**: Once the gas cost is estimated, we proceed to execute the transfer using the transfer method. The transfer includes the recipient's address, the amount to transfer, and the token address (USDT in this case). The transaction is executed using the paymaster to cover the gas fees.
  - `transfer`: Executes the transfer by sending the specified amount and token to the recipient. The gas fees are paid by the paymaster. The transfer result includes details such as the transaction hash and gas cost.

```javascript
const transferResult = await arbitrum.transfer({
    recipient: "0xd3D224Ca27C4b4350b8BCD52c9381E1a8CEEFcf0",
    amount: "1",
    token: "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9"
}, {
    paymasterToken: {
        address: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9'
    },
    transferMaxFee: 1_000_000
});
```

Congratulations! 🎉 Your transaction has been successfully executed.

### Step 5: What's Next?

You’ve now completed a successful transaction using WDK with Account Abstraction on Ethereum/Arbitrum. You can use the transaction hash to track the status of your transfer on a blockchain explorer.

Feel free to explore more advanced features of WDK, such as integrating multiple tokens, managing gas fees, and interacting with other blockchain networks.

---

## Important Notes

### Account Abstraction
- `AccountAbstractionManagerEvm` works with any EVM network
- Configuration determines the network and behavior
- Primarily used on mainnet with real transactions
- No need for ETH to give paymaster approval
- Requires specific `node_modules` version for proper paymaster integration

### Token Allowance
- Allowance is automatically handled by the paymaster
- The paymaster gets just enough allowance for the specific action
- No need to manually approve tokens
- Allowance is calculated based on the transfer amount plus gas fees and a 10% buffer, to account for gas price fluctuations

### Common Issues
1. **Token Balance Check Error**
   - The error `"could not decode result data"` typically means the token doesn't exist on the network.

   - **Solution**: Verify the token address is correct for the network you're using.

2. **Insufficient Balance**
   - Ensure you have enough balance in both the native token and the token being transferred.

   - **Solution**: Confirm that the account balance covers both the transfer amount and the gas fees.

   - **Tip**: Keep in mind that gas prices may fluctuate, so always allow for potential increases when calculating the required balance.

3. **Paymaster Configuration**
   - Verify that the `paymasterAddress` is correctly configured for the target network.

   - Double-check the paymasterToken configuration.

   - Ensure that the `node_modules` dependencies are up to date. You can verify this by checking the package.json version.

   - **Solution**: 
     - Update `node_modules` to the latest version.
     - Confirm that the paymasterToken address matches the network.
     - Ensure the paymaster service is running correctly.

4. **`INSUFFICIENT_FUNDS Error`**
   - If you continue encountering the `INSUFFICIENT_FUNDS` error, it may be necessary to adjust the allowance in the `node_modules` files.

   - **Important**: This should only be done in a test environment — never in production!

   - **Solution**: Increase the allowance buffer in the `node_modules/@wdk/account-abstraction-evm/src/transfer-operations.js` file.

Here's how to add or increase the allowance:

    ```javasript 
    if (transferMaxFee && gasCostInPaymasterToken >= BigInt(transferMaxFee)) {
      throw new Error('Exceeded maximum gas cost for send operation.')
    }

    //Add or increase the allowance here 
    const allowance = gasCostInPaymasterToken * 110n / 100n // 10% buffer
    
    const txs = await this.#baseOps.prependApprove(
      [transferTx],
      [
        {
          tokenAddress: paymasterToken.address,
          spender: this.#config.paymasterAddress,
          amount: allowance
        }
      ]
    )
    ```

## Resources
- [WDK Documentation](https://github.com/tetherto/wdk-docs)
- [Arbitrum Bridge](https://bridge.arbitrum.io/)
- [Arbitrum Explorer](https://arbiscan.io/)

## Support
For issues and questions:
- GitHub Issues: [WDK Issues](https://github.com/tetherto/wdk-core/issues)
- Documentation: [WDK Docs](https://github.com/itsdeka/wdk-docs) 