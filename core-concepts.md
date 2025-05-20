# Core Concepts

Understand the foundational principles behind the Wallet Development Kit (WDK).

---

## Design Philosophy
WDK is built for security, flexibility, and developer empowerment. We believe:
- **You own your keys and data.**
- **Abstraction should never mean loss of control.**
- **APIs should be simple, powerful, and consistent.**

---

## Stateless & Non-Persistent
WDK does **not** store any data, secrets, or state between calls. All persistence and storage are left to you, the developer.

```
[Your App] --calls--> [WDK] --stateless--> [Blockchain]
```

- Maximum flexibility
- No hidden state or custodial risk
- Full control over user experience and security

---

## Non-Custodial by Design
WDK never has access to user private keys or sensitive data. You decide how and where to store secrets, using secure solutions appropriate for your platform.

---

## Unified Abstraction Layer
WDK exposes a consistent set of methods and patterns across all supported blockchains. This means you can:
- Build multi-chain apps without learning each chain's protocol
- Use a single API for EVM, Bitcoin, TON, and Lightning Network

**Abstraction Model:**
```
[Your Code] → [WDK Unified API] → [Ethereum | Bitcoin | TON | Spark]
```

---

## Account Abstraction
WDK supports account abstraction features such as:
- Gasless transactions (pay fees in tokens like USDT)
- Flexible fee payments

### Implementation Details

- **EVM Chains:** WDK uses the ERC-4337 standard to enable account abstraction for EVM-compatible addresses. This allows features like gasless transactions and flexible fee payments.
- **TON:** For TON, WDK leverages Wallet V5R1 to provide account abstraction capabilities.
- **Bitcoin & Spark:** Account abstraction does not apply to Bitcoin and Spark, as transaction fees are always paid in BTC.
- **Spark:** Spark enables you to receive and pay Lightning Network invoices.

---

## Learn More
- [API Reference](api-reference.md)
- [Security](security.md) 