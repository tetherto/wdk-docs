<!-- LOGO PLACEHOLDER -->
<p align="center">
  <img src="./logo.png" alt="WDK Logo" width="120" />
</p>

# Wallet Development Kit (WDK)

**Tether’s open-source Wallet Development Kit (WDK)** empowers developers to build secure, non-custodial wallets with unified blockchain access, stateless architecture, and complete user control. WDK simplifies the complexity of blockchain infrastructure without compromising on flexibility or security.

---

## What is WDK?

WDK is a **developer-first framework** to create cross-chain wallets that are secure, extensible, and production-ready. It provides a single, stateless API to interact with Ethereum, Bitcoin, TON, and Spark (Lightning Network)—abstracting blockchain-specific complexity while keeping developers in full control of keys and data.

---

## 🔑 Key Features

- **Multi-Blockchain Support**: Ethereum, Polygon, Arbitrum, Bitcoin, TON, Spark
- **Unified API Layer**: A single interface across chains
- **Account Abstraction**: Enable gasless transactions & custom fee logic on EVM & TON
- **Stateless & Secure**: No secrets or data are stored by WDK
- **Non-Custodial by Design**: You manage keys; WDK never sees them
- **DeFi Ready**: Built-in support for swaps, token transfers, and cross-chain actions
- **Modular & Extensible**: Add your own chains, tokens, or business logic

---

## 👤 Who is WDK for?

### Developers & Builders
- Create mobile/web wallets in minutes using a familiar JS/TS interface
- Integrate advanced features like account abstraction without reinventing the wheel

### Startups & Enterprises
- Launch wallet products with full ownership of UX, logic, and keys
- Customize flows like tipping, swapping, buying/selling, and more

### Educators & Innovators
- Use WDK to prototype, test, and teach wallet development across major blockchains

---

## 🔍 How It Works

WDK is **stateless**: it processes requests but stores nothing. All sensitive data (keys, sessions, configs) stays in your hands.

```

[Your App] → [WDK API] → [Ethereum | Bitcoin | TON | Spark]

```

This guarantees:
- No custodial risk
- Full user control
- Flexibility to scale or pivot

---

## 🛠️ Use Cases

- Build wallets for creators, communities, or DAOs
- Integrate wallet functions into DeFi, payments, gaming, or tipping apps
- Develop cross-platform wallet experiences (React Native, Electron, Web)

---

## 🌍 Supported Blockchains

WDK supports a growing set of blockchains. This list is continuously expanding, with **more integrations coming soon**. Chains marked with ⏳ are in active development.

| Chain      | Type        | Supported | Description                                                                   |
|------------|-------------|-----------|-------------------------------------------------------------------------------|
| Ethereum   | EVM         | ✅        | Leading smart contract platform, supports ERC-20 tokens and DeFi.             |
| Arbitrum   | L2 / EVM    | ✅        | Layer 2 scaling solution for Ethereum, fast and cost-effective.               |
| Polygon    | L2 / EVM    | ✅        | Scalable, low-fee EVM chain, ideal for dApps and DeFi.                        |
| Bitcoin    | Native      | ✅        | The original cryptocurrency, secure and widely adopted.                       |
| TON        | Non-EVM     | ✅        | High-performance blockchain for decentralized apps and payments.              |
| Spark      | L2 / BTC    | ✅        | Fast, low-fee Bitcoin payments via Lightning Network.                         |
| Solana     | Non-EVM     | ⏳        | Ultra-fast, low-fee chain for DeFi and NFTs with a unique parallel runtime.   |
| TRON       | Non-EVM     | ⏳        | High-throughput blockchain optimized for stablecoin transfers and payments.   |


---

## 🔐 Completely non custodial

WDK never stores or transmits secrets. Developers are responsible for key storage using secure techniques like OS keychain, HSMs, or hardware wallets. All operations are performed in-memory.

---

## 📬 Contact us to get started!

WDK is currently in **private beta**. If you're building wallet products, protocols, or integrations and want early access:

👉 **Please [fill out this form](https://docs.google.com/forms/d/e/1FAIpQLSfh3UKsQ-PwJCQOQyJ3EVMKVyHTuqK1XndyiKe4uLslEEtWSw/viewform)** 👈

We’re especially excited to collaborate with:
- Layer 1/2 chains looking for wallet integrations
- Fintech and crypto startups building novel user experiences

---

## 🌐 Open Source Vision

We are committed to making WDK fully open-source in 2025. Join us now to shape its roadmap and be part of a growing ecosystem of developers creating the next generation of crypto wallets.

---
