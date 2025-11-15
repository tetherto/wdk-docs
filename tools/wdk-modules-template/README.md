---
title: Create custom SDK modules
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

# WDK Modules Template

Build your own plug-in wallet and protocol modules (bridge, swap, lending, and more) that work seamlessly with the WDK ecosystem. Start with these ready-made templates for fast, robust, and standards-compliant integration.

## Available Templates

- [Wallet Module Template Guide](./wdk-wallet-template.md)
- [Protocol Module Template Guide](./wdk-protocol-template.md)

## Official Inclusion

If you want your module (wallet or protocol) to be considered for official listing in the WDK ecosystem, please follow these requirements:

### Package and Code
- Use correct naming: `@wdk/wallet-<feature>` or `@wdk/protocol-<feature>`
- Follow monorepo structure and naming conventions (kebab-case files, PascalCase types)
- Export only from `index.js`; keep helpers internal to `src/`
- Implement all WDK-required public methods and API for the module type (wallet or protocol)—conform to official interfaces
- Avoid deep/unsafe dependencies; keep dependencies minimal and audited
- All code must run in bare/portable environments by default

### Documentation, Testing, and Versioning
- Include clear install, config, usage, and API docs in `README.md`
- Publish an up-to-date `CHANGELOG.md` with semver releases
- Include basic tests for every public method, integration tests if relevant, and a CI pipeline for linting and type checks
- Use semantic versioning for releases (major.minor.patch)

### Security & Maintenance
- No unsafe/unreviewed dependencies
- Document all known edge cases, limitations, and security notes
- List maintainer(s) and provide contact info for ongoing support

### Important Notes
{% hint style="warning" %}
Bare compatibility is required for official modules. If something does not run in bare, document it and coordinate with the WDK team for an agreed plan before requesting official inclusion.
{% endhint %}

### Inclusion Checklist
- [ ] Correct naming and file structure
- [ ] Minimal, bare-compatible dependencies
- [ ] All required methods implemented & tested
- [ ] Docs and tests present
- [ ] Clear maintainer contact

**To propose for official status:**
Open a GitHub issue or PR and provide:
- The module repository
- Short overview, documentation, and config
- Tests and usage example
- Maintainer contact info
- Security and dependency notes if relevant

A WDK team member will review your submission. Meeting all requirements does not guarantee inclusion; acceptance is at the team's discretion.

## How to Use

1. Read the guide for the module type you need
2. Follow the step-by-step instructions to copy and change the template
3. Implement and include the correct configuration for your desired wallet/ecosyste/network
4. Ensure all public methods use the WDK interface and are consistent in naming, parameters, and expected behavior
5. Test your changes meet all basic requirements and pass the example workflows
6. For official listing, review the inclusion checklist in the guide

## Our Oficial Modules

### Wallet Modules 

Explore the comments in the sample code for implementation tips. For real-world reference implementations, check out the official WDK module repositories: 

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



