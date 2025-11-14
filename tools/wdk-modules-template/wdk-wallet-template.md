---
title: "WDK Wallet Module Template: How to Create a Custom Wallet Module"
description: "Learn how to create a custom wallet module compatible with 
WDK"
layout:
  width: default
  title:
    visible: true
  description:
    visible: true
  tableOfContents:
    visible: true
  outline:
    visible: true
  pagination:
    visible: false
  metadata:
    visible: false

---
# How to create a custom wallet module

This guide shows you how you can create a custom WDK wallet module to 
support any network or chain you like.

{% stepper %}
{% step %}

### Clone the Template

- Visit [wdk-module-templates](https://github.com/tetherto/
wdk-module-templates/) on GitHub
- Download or clone the repository
- Open the folder called `wdk-wallet-template`, which contains the 
scaffolding for a wallet module

{% endstep %}

{% step %}

### The Wallet Template Folder Structure 

```text
/
├─ src/
│  ├─ wallet-account-[example].js
│  ├─ wallet-account-read-only-[example].js
│  └─ wallet-manager-[example].js
├─ types/
│  ├─ index.d.ts
│  └─ src/
│      ├─ wallet-account-[example].d.ts
│      ├─ wallet-account-read-only-[example].d.ts
│      └─ wallet-manager-[example].d.ts
├─ tests/
│  └─ (add unit and integration tests)
├─ package.json
├─ README.md
├─ CHANGELOG.md
└─ LICENSE
```
{% endstep %}

## How To Use

{% step %}

### 1. Copy & Rename

Make a new module folder by copying this template.  
Rename files and classes by replacing `[example]` with your chain or network name, e.g. `wallet-account-solana.js`.

{% endstep %}

{% step %}
### 2. Implement Network Logic

Edit:
- `wallet-account-[example].js`: Implement account logic (key management, signing, addresses, send, transfer, etc.)
- `wallet-account-read-only-[example].js`: Implement fetchers for balance and token balance, quoting fees, etc.
- `wallet-manager-[example].js`: Implement account creation, path derivation, and fee quoting.

In each class, you must:
- Replace all `NotImplementedError` throws with real code using your network’s SDK.
- Follow instructions and TODO comments in the file—these walk you through methods, expected inputs/outputs, and contracts.
- Implement tests in `/tests`. Test all implemented features: create, load, and fetch accounts; sign and verify messages; transfer.
- Make sure to clean up keys from memory using `dispose()` after use.
{% endstep %}

{% step %}
### 3. Update Configuration

Update the `README.md` following the template and the `package.json` (name, version, dependencies), and fill in the correct main/module entries.
{% endstep %}

{% step %}

### 4. Run and Test the Template Locally

- Open a terminal in the root of your cloned `wdk-wallet-template` folder.
- Install dependencies:
  ```bash
  npm install
  ```
- Run the test suite:
  ```bash
  npm test
  ```
- (Optional) To check bare runtime compatibility, run:
  ```bash
  node bare.js
  ```
  >  Running your module on [Bare runtime](../resources/concepts.md#bare-runtime) ensures greater portability and robust security across environments.

- You may also use `npm run build` or `npm run lint` if those scripts are present in `package.json`.

{% endstep %}

{% step %}

### 5. Testing Bare Compatibility (optional)

{% endstep %}

{% step %}

### 6. Official Inclusion

If you want your module to be included in the official module list, see the [Official Inclusion requirements](./README.md#official-inclusion).

{% endstep %}
{% endstepper %}

---

## Example: Implementing a Method

Example from `wallet-account-[example].js`:

{% code title="wallet-account-[example].js" overflow="wrap" lineNumbers="true" %}
```javascript
// Before:
getAddress() {
  throw new NotImplementedError('getAddress not implemented for this example.');
}

// After:
async getAddress() {
  // Use your SDK to derive and return the account's public address
  return mySdk.deriveAddress(this._keyPair.publicKey)
}
```
{% endcode %}

> Be sure to replace all stubs, fill out type definitions, and document any chain-specific details.

---

## Need an example?

- Look at comments in the sample code for ideas
- Visit the oficcial modules repositories for examples
  - [wdk-wallet](https://github.com/tetherto/wdk-wallet)
  - [wdk-wallet-btc](https://github.com/tetherto/wdk-wallet-btc)
  - [wdk-wallet-spark](https://github.com/tetherto/wdk-wallet-spark)
  - [wdk-wallet-evm](https://github.com/tetherto/wdk-wallet-evm)
  - [wdk-wallet-evm-erc-4337](https://github.com/tetherto/wdk-wallet-evm-erc-4337)
  - [wdk-wallet-tron](https://github.com/tetherto/wdk-wallet-tron)
  - [wdk-wallet-tron-gasfree](https://github.com/tetherto/wdk-wallet-tron-gasfree)
  - [wdk-wallet-ton](https://github.com/tetherto/wdk-wallet-ton)
  - [wdk-wallet-ton-gasless](https://github.com/tetherto/wdk-wallet-ton-gasless)
  - [wdk-wallet-solana](https://github.com/tetherto/wdk-wallet-solana)

---

## Next Steps

- See the main [WDK Protocol Module Template Guide](./wdk-protocol-template.md) for step-by-step instructions and requirements for developing protocol modules compatible with WDK.
- Check the code comments in each class file for details of what you need to implement.
- When finished, you can propose your implementation for community use or official listing (if it follows all WDK rules).

---

