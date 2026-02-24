---
title: Swap Modules Overview
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

# Swap Modules Overview

The Swap Development Kit (WDK) provides a set of modules that support swap on top of multiple blockchain networks. All modules share a common interface, ensuring consistent behavior across different blockchain implementations.

## Swap Protocol Modules

DeFi swap functionality for token exchanges across different DEXs:

| Module | Blockchain | Status | Documentation |
|--------|------------|--------|---------------|
| [`@tetherto/wdk-protocol-swap-velora-evm`](https://github.com/tetherto/wdk-protocol-swap-velora-evm) | EVM | ✅ Ready | [Documentation](./swap-velora-evm/) |

## Next steps

To get started with WDK modules, follow these steps:

1. Get up and running quickly with our [Quick Start Guide](../../start-building/nodejs-bare-quickstart.md)
2. Choose the modules that best fit your needs from the tables above 
3. Check specific documentation for modules you wish to use

You can also:

- Learn about key concepts like [Account Abstraction](../../resources/concepts.md#account-abstraction) and other important definitions
- Use one of our ready-to-use examples to be production ready