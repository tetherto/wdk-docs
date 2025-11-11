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
- [Bridge Protocol Template](https://github.com/tetherto/wdk-protocol-bridge-template)
- [Swap Protocol Template](https://github.com/tetherto/wdk-protocol-swap-template)
- [Lending Protocol Template](https://github.com/tetherto/wdk-protocol-lending-template)

These templates give you everything you need to implement protocols that work out-of-the-box with the [WDK](https://github.com/tetherto/wdk) ecosystem.

---

{% stepper %}

{% step %}
### Step 1  
**Get the Templates**

- Go to [wdk-protocol-templates on GitHub](https://github.com/tetherto/wdk-protocol-templates)
- Download or clone the repository
- Pick the protocol type you want (bridge, swap, lending)

{% endstep %}

{% step %}
### Step 2  
**Pick the Module Template**
- Open the folder for your protocol:
    - `wdk-protocol-bridge-template/` for cross-chain bridges
    - `wdk-protocol-swap-template/` for DEX/aggregator swaps
    - `wdk-protocol-lending-template/` for lending/borrowing protocols

Each folder has:
- Minimal working code (`src/`)
- Full type stubs
- README with usage, quickstart, and TODOs
- Example/test files

{% endstep %}

{% step %}
### Step 3  
**Implement Your Protocol Logic**
- For **Bridge**: Replace stubs in `bridge-protocol-example.js` with logic for bridging between chains/networks
- For **Swap**: Replace stubs in `swap-protocol-example.js` with logic for token swaps, quoting, etc.
- For **Lending**: Implement supply, withdraw, borrow, repay, and quote logic in `lending-protocol-example.js`
- Remove all NotImplementedError after you finish each method

{% endstep %}

{% step %}
### Step 4  
**Configure and Test**
- Update `package.json`, types, and README for your network and settings
- Make sure all WDK-required public methods are implemented
- Add meaningful tests in `tests/`

{% endstep %}

{% step %}
### Step 5  
**Documentation and Official Inclusion**
- Document your module’s install and usage in `README.md`
- If you want it to be listed as an official protocol module, see the checklist below

{% endstep %}
{% endstepper %}

---

## Templates Overview

| Template | Purpose | Reference |
|---|---|---|
| Bridge Protocol | Cross-chain token transfers (LayerZero, native, or custom bridges) | [Repo](https://github.com/tetherto/wdk-protocol-bridge-template) |
| Swap Protocol | DEX swaps, aggregation, or router integration | [Repo](https://github.com/tetherto/wdk-protocol-swap-template) |
| Lending Protocol | DeFi lending/borrowing pools, interest, collateralization | [Repo](https://github.com/tetherto/wdk-protocol-lending-template) |

All must respect the WDK class interface for easy wallet orchestrator integration.

---

## Official Inclusion

Follow this checklist to have your module reviewed for inclusion as an official WDK protocol module:

- Follows naming convention: `@wdk/protocol-<feature>`
- Implements all standard WDK methods for its protocol type
- Documentation is present and shows use/config/test
- CI and basic tests are present
- Maintainer contact is included

To propose inclusion: open a GitHub issue or PR with your module, usage, tests, and contact. The WDK team will review. Even if all requirements are met, inclusion is at the team's discretion.

---

## Need Help?
- Read the comments and README in each template for guidance
- See real-world WDK protocol [templates on GitHub](https://github.com/tetherto/wdk-protocol-templates)
- Join the [Tether Developer's Hub Discord](https://discord.gg/arYXDhHB2w)