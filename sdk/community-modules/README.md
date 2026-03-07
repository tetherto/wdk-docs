---
title: Community Modules
description: Explore WDK compatible modules built by the community and learn how to create your own custom modules.
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

{% hint style="warning" %}
Community modules are developed and maintained independently by third-party contributors.

Tether and the WDK Team do not endorse or assume responsibility for their code, security, or maintenance. Use your own judgment and proceed at your own risk.
{% endhint %}

## Available Community Modules

| Module | Type | Description | Author |
|--------|------|-------------|--------|
| [@utexo/wdk-wallet-rgb](https://github.com/UTEXO-Protocol/wdk-wallet-rgb) | Wallet Module | Wallet module for RGB, Bitcoin-based smart contracts | [UTEXO](https://github.com/UTEXO-Protocol) |
| [@base58-io/wdk-wallet-cosmos](https://github.com/base58-io/wdk-wallet-cosmos) | Wallet Module | Wallet module for Cosmos-compatible blockchains | [Base58](https://base58.io/) |

---

## Create Your Own Module

Want to extend WDK with your own custom module? Use the `create-wdk-module` CLI to scaffold a fully configured project in seconds:

{% code title="Scaffold a new module" %}
```bash
npx create-wdk-module@latest
```
{% endcode %}

The CLI generates source files, tests, TypeScript type definitions, and CI workflows for all five module types (wallet, swap, bridge, lending, fiat). See the [Create WDK Module documentation](../../tools/create-wdk-module.md) for the full guide, CLI options, and generated project structure.

You can also:

1. **Study existing modules** - Review the source code of official WDK modules on [GitHub](https://github.com/orgs/tetherto/repositories?q=wdk) to understand the patterns and interfaces
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

<a class="button primary" href="https://forms.gle/wmNwc5epxaa85u8a9">Submit your module</a>

---

## Guidelines for Community Modules

Community modules should:

- Implement the standard WDK module interface
- Include TypeScript type definitions
- Provide clear installation and usage instructions
- Be open source or publicly accessible
- Include appropriate tests and examples
