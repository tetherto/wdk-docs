---
title: "How to Make Your Own Protocol Module Compatible with WDK"
description: "How to propose a new protocol (bridge, swap, or lending) module for WDK and how it will be reviewed"
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

# How to Make Your Own Protocol Module Compatible with WDK

This page guides you through creating WDK-compatible protocol modules—**bridge**, **swap**, or **lending**—using our template projects:
- [Bridge Protocol Template](https://github.com/tetherto/wdk-module-templates/wdk-protocol-templates/wdk-protocol-bridge-template)
- [Swap Protocol Template](https://github.com/tetherto/wdk-protocol-templates/wdk-protocol-swap-template)
- [Lending Protocol Template](https://github.com/tetherto/wdk-protocol-templates/wdk-protocol-lending-template)

These templates give you everything you need to implement protocols that work out-of-the-box with the [WDK](https://github.com/tetherto/wdk) ecosystem.

---

{% stepper %}

{% step %}
### Clone the Template

- Go to [wdk-protocol-templates on GitHub](https://github.com/tetherto/wdk-module-templates/wdk-protocol-templates)
- Download or clone the repository
- Pick the protocol type you want (bridge, swap, lending)


#### The Protocol Template Folder Structure 

```text
wdk-protocol-templates/
├─ wdk-protocol-bridge-template/
│  ├─ src/
│  │  ├─ abi.js
│  │  └─ bridge-protocol-[example].js
│  ├─ tests/
│  │  └─ bridge-protocol-[example].test.js
│  ├─ types/
│  │  └─ bridge-protocol-[example].d.ts
│  ├─ bare.js
│  ├─ index.js
│  ├─ package.json
│  ├─ tsconfig.json
│  └─ README.md
├─ wdk-protocol-lending-template/
│  ├─ src/
│  │  └─ lending-protocol-[example].js
│  ├─ tests/
│  │  └─ lending-protocol-[example].test.js
│  ├─ types/
│  │  └─ lending-protocol-[example].d.ts
│  ├─ bare.js
│  ├─ index.js
│  ├─ package.json
│  ├─ tsconfig.json
│  └─ README.md
└─ wdk-protocol-swap-template/
   ├─ src/
   │  └─ swap-protocol-[example].js
   ├─ tests/
   │  └─ swap-protocol-[example].test.js
   ├─ types/
   │  └─ swap-protocol-[example].d.ts
   ├─ bare.js
   ├─ index.js
   ├─ package.json
   ├─ tsconfig.json
   └─ README.md
```

{% endstep %}

{% step %}

### Copy & Rename

**Pick the Module Template**
Open the folder for your protocol:
    - `wdk-protocol-templates/wdk-protocol-bridge-template/` for cross-chain bridges
    - `wdk-protocol-templates/wdk-protocol-swap-template/` for DEX/aggregator swaps
    - `wdk-protocol-templates/wdk-protocol-lending-template/` for lending/borrowing protocols

Rename files and classes by replacing `[example]` with your protocol type and protocol name and ecosystem or network, e.g. `wdk-protocol-bridge-usdt0-evm.js`.

{% endstep %}

{% step %}
### Implement Protocol Logic

Edit the key files for your protocol type:
- **Bridge:** `bridge-protocol-[example].js` — implement logic for bridging between chains/networks, transaction creation, fee calculation, and recipient validation.
- **Swap:** `swap-protocol-[example].js` — implement DEX/swapping logic, quoting swaps, pool/route selection, input validation.
- **Lending:** `lending-protocol-[example].js` — implement supply, withdraw, borrow, repay, and all quoting logic; validate inputs, check collateral and protocol-specific rules.

Depending on your protocol, you may also need to:
- Add or update supporting files such as ABI definitions (`abi.js`), address maps (`address-map.js`), or protocol-specific constants (`constants.js`) in the `src/` directory.
- Import and use these resources in your main protocol logic as needed.

In each main class, you must:
- Replace all `NotImplementedError` throws with real logic relevant to your protocol and network.
- Follow instructions and TODO comments in the file—these describe expected method signatures, inputs/outputs, and contract/API calls.
- Implement and expand tests in `/tests`. You should test successful flows as well as handling edge cases, errors, and invalid inputs.
- Make sure to securely manage any secret keys, avoid leaking account or config data in logs, and document any network-specific exceptions or requirements.

{% endstep %}

{% step %}
### Update Configuration

Update the `README.md` following the template and the `package.json` (name, version, dependencies), and fill in the correct main/module entries.
{% endstep %}

{% step %}

### Run and Test the Template Locally

- Open a terminal in the root of your cloned `wdk-protocol-bridge-template`, `wdk-protocol-swap-template` or `wdk-protocol-lending-template` folder.
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
### Testing Bare Compatibility (optional)

Running your module on [Bare runtime](../resources/concepts.md#bare-runtime) ensures greater portability and robust security across environments.

- Test your package with `bare.js`
- Try calling/wrapping protocol operations (bridge, swap, lend...)
- Avoid Node-only modules (like `fs`); use pure JavaScript and web‑safe crypto
- If you require dependencies that do not work in bare, note them and [contact the WDK team on the Tether Developer's Hub on Discord](https://discord.gg/arYXDhHB2w) for support.

{% endstep %}

{% step %}

### Official Inclusion

If you want your module to be included in the official module list, see the [Official Inclusion requirements](./README.md#official-inclusion).

{% endstep %}
{% endstepper %}

---

## Example: Implementing a Method

Below are real-world patterns for converting protocol template stubs into functioning implementations.

### Example from `bridge-protocol-[example].js`

{% code title="bridge-protocol-[example].js" overflow="wrap" lineNumbers="true" %}
```javascript
// Before:
async bridge(options, config) {
  throw new Error('NotImplementedError: implement bridge logic for your protocol');
}

// After:
async bridge(options, config) {
  // Validate network, recipient, and amount
  // Call your bridge contract/client SDK
  // Return bridge result object
  return {
    hash: tx.hash,
    fee: tx.fee,
    bridgeFee: estimatedBridgeFee,
  }
}
```
{% endcode %}

### Example from `lending-protocol-[example].js`

{% code title="lending-protocol-[example].js" overflow="wrap" lineNumbers="true" %}
```javascript
// Before:
async supply(options, config) {
  throw new Error('NotImplementedError: implement supply logic');
}

// After:
async supply(options, config) {
  // Validate token and amount
  // Interact with protocol contract to supply assets
  // Return transaction receipt/result
  return {
    hash: tx.hash,
    fee: tx.fee,
    suppliedToken: options.token,
    amount: options.amount
  }
}
```
{% endcode %}

### Example from `swap-protocol-[example].js`

{% code title="swap-protocol-[example].js" overflow="wrap" lineNumbers="true" %}
```javascript
// Before:
async swap(options, config) {
  throw new Error('NotImplementedError: implement swap logic for your protocol');
}

// After:
async swap(options, config) {
  // Validate tokens and input
  // Use your aggregator/DEX API or SDK for swap
  // Return swap summary/transaction object
  return {
    hash: tx.hash,
    fee: tx.fee,
    tokenInAmount: ...,
    tokenOutAmount: ...,
  }
}
```
{% endcode %}

> Replace all stubs and document any network, DEX, or bridge-specific behaviors and return values for clarity.

---

## Need an example?

- See template comments and TODOs in each protocol example file for further details.
- Review actual protocol modules:
  - [wdk-protocol-bridge-usdt0-evm](https://github.com/tetherto/wdk-protocol-bridge-usdt0-evm)
  - [wdk-protocol-swap-paraswap-evm](https://github.com/tetherto/wdk-protocol-swap-paraswap-evm)
  - [wdk-protocol-lending-aave-evm](https://github.com/tetherto/wdk-protocol-lending-aave-evm)

---

## Next Steps

- See the main [WDK Wallet Module Template Guide](./wdk-wallet-template.md) for further style and development practices.
- Review and follow code comments in each class file for requirements and patterns.
- When finished, propose your protocol for community review or official inclusion, ensuring your implementation and docs meet the WDK standards.

---

## Need Help?
- Read the comments and README in each template for guidance
- See real-world WDK protocol [templates on GitHub](https://github.com/tetherto/wdk-protocol-templates)
- Join the [Tether Developer's Hub Discord](https://discord.gg/arYXDhHB2w)