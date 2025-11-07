---
title: "How to Make Your Own Wallet Module Compatible with WDK"
description: "How to propose a new wallet module for WDK and how it will be reviewed"
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

# How to Make Your Own Wallet Module Compatible with WDK

This guide shows you how to make a wallet module for a new ecosystem, network or chain, you can find a `wdk-wallet-template` project in [wdk-module-templates](https://github.com/raigal-r/wdk-module-templates).  
You can use these steps to copy, adjust, and build your own module compatible with WDK.

---

{% stepper %}
{% step %}
### Step 1  
**Get the Template**

- Go to [wdk-module-templates on GitHub](https://github.com/raigal-r/wdk-module-templates)
- Download or clone the code

{% endstep %}
{% step %}
### Step 2  
**Pick the Right Folder**

- Open the folder called `wdk-wallet-template`
- This folder has the wdk minimum structure code for a wallet module

```text
wallet-<example>/
├─ bare.js
├─ index.js
├─ package.json
├─ README.md
├─ LICENSE
├─ types/
│  └─ index.d.ts
├─ src/
│  ├─ manager.js
│  ├─ account-read-only.js
│  └─ account.js
└─ tests/
   └─ unit & integration tests
```
{% endstep %}
{% step %}

### Step 3  
**Implement Account Logic**

- Extend and develop `account-read-only.js` (read-only) and `account.js` (full account)
- Implement all required wallet/account methods for your network
- Remove `NotImplementedError` from each function after proper implementation

{% endstep %}
{% step %}
### Step 4  
**Implement Wallet Manager**

- Extend `manager.js` to serve accounts by index or path
- Provide fee quotes and management functions

{% endstep %}
{% step %}

### Step 5  
**Testing and Bare Compatibility [OPTIONAL]**

- Test your package with `bare.js`
- Try account creation, address viewing, balance, and send functions
- Avoid Node-only modules (like `fs`); use pure JavaScript and web‑safe crypto
- If you require dependencies that do not work in bare, note them and [you can contact the WDK team on the Tether Developer's Hub on Discord](https://discord.gg/arYXDhHB2w) for support.

{% endstep %}
{% step %}
### Step 6  
**Documentation & CI**

- Write a `README.md` (what it is, install, config, usage, API, feature table)
- Add a `CHANGELOG.md` (track changes per release)
- Add unit and integration tests—cover each public method and orchestrator registration
- Add scripts for linting, testing, and type-check
- Use semantic versioning

{% endstep %}
{% step %}
### Step 7  
**Publish, Share, and Official Inclusion**

- Publish or share your module with your app or community
- If you want your module to be official, see [Official Inclusion](#official-inclusion)

{% endstep %}
{% endstepper %}
---

## Official Inclusion

Follow these if you’d like your module to be listed as official and reviewed by the WDK team:

### Package and Code

- Name your package `@wdk/wallet-<example>`
- Follow monorepo structure and naming conventions (kebab-case files, PascalCase types)
- Export only from `index.js`; keep helpers internal to `src/`
- Implement the WDK Wallet Module interface
- Avoid deep/unsafe dependencies; keep dependencies minimal and audited
- All code must run in bare/portable environments by default

### Docs, Testing, and Versioning

- `README.md` must explain install, config, examples, API, and feature table
- `CHANGELOG.md` up-to-date with semver releases
- Include unit tests for every public method, integration tests for orchestrator registration
- Test your module with the bare runtime using `bare.js`
- Lint and type-check scripts are present; CI pipeline covers build/test
- Use semantic versioning for releases (major.minor.patch)

### Security & Maintenance

- No unsafe/unreviewed dependencies
- Document all known edge cases, limitations, and security notes
- List maintainer(s) and provide contact info for long-term support

### Important Notes

{% hint style="warning" %}
Bare compatibility is required for official modules. If something does not run in bare, document it and coordinate with the WDK team for an agreed compatibility plan before requesting official inclusion.
{% endhint %}

### Inclusion Checklist

- [ ] Correct naming and file structure
- [ ] Minimal, bare-compatible dependencies
- [ ] All required wallet methods implemented & tested
- [ ] Docs and tests present
- [ ] Clear maintainer contact

**To propose for official status:**
Contact the WDK team and provide a short overview, your documentation, tests, dependencies, security notes, and maintainer info. A team member will review your submission. Please note that even if all requirements are met, the team reserves the right to reject proposals at its discretion.

---

## Need Help?

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

