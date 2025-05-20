# Security

Security is paramount when building with WDK. Follow these best practices to protect your users and their assets.

---

## Threat Model
- WDK never stores or transmits secrets—security is your responsibility.
- Assume all client environments are potentially hostile.
- Always validate and sanitize user input.

---

## Key Management
- **Never** store seed phrases or private keys in plain text or client-side code.
- Use secure storage solutions (e.g., OS keychain, hardware modules).

---

## Secure Configuration
- Protect API keys and endpoint URLs from public exposure.
- Use environment variables or secure vaults for sensitive data.

---

## Transaction Validation
- Always validate transaction parameters before sending.
- Implement proper error handling and user confirmations.

---

## Fee Estimation
- Estimate fees based on current network conditions.
- Set appropriate max fees for transfers, swaps, and bridges.

---

> **Reminder:** WDK is stateless and non-custodial. You are responsible for all sensitive data handling.

---

See also: [Core Concepts](core-concepts.md) | [FAQ](faq.md) 