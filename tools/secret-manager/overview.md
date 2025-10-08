---
title: Secret Manager Overview
description: Why and how to use the Secret Manager in WDK apps
author: Raquel Carrasco Gonzalez
lastReviewed: 2025-10-06
---

# Secret Manager Overview

The Secret Manager secures wallet seeds and encrypted payloads in memory, using PBKDF2‑SHA256 for key derivation and libsodium secretbox for authenticated encryption. It also provides mnemonic ↔ entropy helpers and secure random generators.

## When to use it

- Creating a new wallet (generate entropy, get mnemonic)
- Importing an existing mnemonic and producing an encrypted seed for session use
- Decrypting a stored payload with a user passkey or a master key (32‑byte)

## Core Capabilities

- Generate and encrypt seed and entropy
- Decrypt encrypted data with integrity checks
- Convert 16‑byte entropy ↔ 12‑word BIP‑39 mnemonic
- Zeroize sensitive buffers with `dispose()`

## Next Steps

- Read the configuration page for constructor and options
- Review the API Reference for method signatures and examples

***

### Need Help?

{% include "../.gitbook/includes/support-cards.md" %}
