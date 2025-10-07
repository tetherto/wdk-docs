---
title: Swap Modules Overview
author: Raquel Carrasco Gonzalez
lastReviewed: 2025-09-04
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

The Swap Development Kit (WDK) provides a set of modules that supportswap on top of multiple blockchain networks. All modules share a common interface, ensuring consistent behavior across different blockchain implementations.

## Swap Protocol Modules

DeFi swap functionality for token exchanges across different DEXs:

| Module | Blockchain | Status | Documentation | GitHub |
|--------|------------|--------|---------------|---------|
| `@tetherto/wdk-protocol-swap-paraswap-evm` | EVM | In progress | [Documentation](./wdk-protocol-swap-paraswap-evm/overview.md) | [Repository](https://github.com/tetherto/wdk-protocol-swap-paraswap-evm) |
| `@tetherto/wdk-protocol-swap-dedust-ton` | TON | In progress | [Documentation](./wdk-protocol-swap-stonfi-ton/overview.md) | [Repository](https://github.com/tetherto/wdk-protocol-swap-dedust-ton) |

## Next steps

To get started with WDK modules, follow these steps:

1. Get up and running quickly with our [Quick Start Guide](../../getting-started/quick-start.md)
2. Choose the modules that best fits your needs from the tables above 
3. Check specific documentation for modules you wish to use

You can also:

- Learn about key concepts like [Account Abstraction](../../resources/concepts.md) and other important definitions
- Use one our ready-to-use examples to be production ready