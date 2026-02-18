---
title: Community Modules
description: Explore WDK modules built by the community and learn how to create your own custom modules.
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

# Community Modules

The WDK ecosystem is enriched by modules developed by our community. These modules extend WDK's capabilities to support additional blockchains, protocols, and use cases.

{% hint style="warning" %}
Community modules are developed and maintained independently by third-party contributors.

Tether and the WDK Team do not endorse or assume responsibility for their code, security, or maintenance. Use your own judgment and proceed at your own risk.
{% endhint %}

## Available Community Modules

| Module | Type | Description | Repository |
|--------|------|-------------|------------|
| `@utexo/wdk-wallet-rgb` | Bitcoin (RGB) | RGB protocol wallet integration for Bitcoin-based smart contracts | [GitHub](https://github.com/UTEXO-Protocol/wdk-wallet-rgb) |
| `@semanticpay/wdk-wallet-evm-x402-facilitator` | EVM (x402) | Wraps a WDK EVM wallet as an [x402](../../ai/x402.md) facilitator signer for in-process payment verification and settlement | [GitHub](https://github.com/SemanticPay/wdk-wallet-evm-x402-facilitator) |

---

## Create Your Own Module

Want to extend WDK with your own custom module? We encourage community contributions!

{% hint style="info" %}
**Coming Soon: Custom Module Guide**

We're preparing a comprehensive guide on how to create custom WDK modules. Join our [Discord](https://discord.gg/arYXDhHB2w) for updates!
{% endhint %}

In the meantime, you can:

1. **Study existing modules** - Review the source code of official WDK modules on [GitHub](https://github.com/tetherto) to understand the patterns and interfaces
2. **Join the community** - Connect with other developers on our [Discord](https://discord.gg/arYXDhHB2w) to discuss your ideas
3. **Open an issue** - Have questions? Open an issue on the relevant repository

---

## Submit Your Module

If you've built a WDK module, we'd love to feature it here!

**To submit your module:**

1. Ensure your module follows WDK interface conventions
2. Include comprehensive documentation and a clear README
3. Make the repository publicly accessible
4. Submit through our [Community Form](https://forms.gle/wmNwc5epxaa85u8a9) or share on our **#wdk-showcase** Discord channel

Your module may be featured in our documentation and community showcases.

---

## Guidelines for Community Modules

Community modules should:

- Implement the standard WDK module interface
- Include TypeScript type definitions
- Provide clear installation and usage instructions
- Be open source or publicly accessible
- Include appropriate tests and examples
