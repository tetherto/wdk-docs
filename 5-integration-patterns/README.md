---
title: Integration Patterns & Best Practices
description: Architectural reference for integrating the Wallet Development Kit in web, mobile, and backend environments.
author: Raquel Carrasco Gonzalez
lastReviewed: 2025-06-16
---

# Integration Patterns & Best Practices

This section describes the most common architectural patterns for incorporating the Wallet Development Kit (WDK) into your product. It is intended for engineers and architects who need to decide **where application code ends and WDK responsibilities begin** before writing the first line of integration code.

## What you will find here

* **Pattern catalogue** – high-level diagrams, data flows, and prerequisite checklists for each environment (web, mobile, server, widget).
* **Design trade-offs** – latency, key custody, security surface, and operational complexity for every pattern.
* **Customisation matrix** – which configuration knobs are global and which are pattern-specific.

## How to use this section

1. Identify the scenario that resembles your target deployment.
2. Review the *When to choose* and *When to avoid* bullet lists.
3. Note the links to API scopes, required SDK packages, and security considerations.
4. Proceed to the matching tutorial in **§ 7 Code Examples & Tutorials** to get runnable code.

## Index

| Pattern                | Brief description                                                                               | Link                                                    |
| ---------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Web / React            | Client-side provider; keys live in browser storage or injected wallet.                          | [Web / React](./common-patterns/web-react.md)           |
| Mobile / React Native  | Keys stored in OS secure element or biometrically-protected keystore.                           | [Mobile / React Native](./common-patterns/mobile-rn.md) |
| Server-side (Node, Go) | Custodial or semi-custodial model using HSM/KMS; suitable for exchanges and enterprise flows.   | [Server-side](./common-patterns/server-node.md)         |
| White-label widget     | Drop-in iframe or script tag that exposes limited wallet functions; minimal engineering effort. | [White-label widget](./common-patterns/white-label.md)  |

> *Need to support a hybrid solution?* Combine patterns using the design rules in [Customisation Options](./customization.md).

---

### Relationship with other sections

* **§ 2 Getting Started** – proves your toolchain can compile WDK.
* **§ 4 SDK Reference** – exhaustive API surface and error codes.
* **§ 7 Code Examples & Tutorials** – step-by-step implementation once you have selected a pattern.

---

\*Last updated 2025-06-16 – update diagrams or links in the same PR if the patte


<!-- * [5 · Integration Patterns & Best Practices](5-integration-patterns/README.md)
    * [Common Patterns](5-integration-patterns/common-patterns.md)
    * [Customization Options](5-integration-patterns/customization.md) -->
