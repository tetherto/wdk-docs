---
title: Agent Guide
description: Context and conventions for AI agents working with this module
icon: robot
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

# Agent Guide

{% hint style="info" %}
This guide outlines the conventions, architecture, and workflow for the `@tetherto/wdk-wallet-ton` repository. It is intended for developers contributing to the source code or AI agents working within the repository context.

Source: [`AGENTS.md`](https://github.com/tetherto/wdk-wallet-ton/blob/main/AGENTS.md)
{% endhint %}

This repository is part of the Tether WDK (Wallet Development Kit) ecosystem. It follows strict coding conventions and tooling standards to ensure consistency, reliability, and cross-platform compatibility (Node.js and Bare runtime).

## Project Overview
- **Architecture:** Modular architecture with clear separation between Core, Wallet managers, and Protocols.
- **Runtime:** Supports both Node.js and Bare runtime.

## Tech Stack & Tooling
- **Language:** JavaScript (ES2015+).
- **Module System:** ES Modules (`"type": "module"` in package.json).
- **Type Checking:** TypeScript is used purely for generating type declarations (`.d.ts`). The source code remains JavaScript.
  - Command: `npm run build:types`
- **Linting:** `standard` (JavaScript Standard Style).
  - Command: `npm run lint` / `npm run lint:fix`
- **Testing:** `jest` (configured with `experimental-vm-modules` for ESM support).
  - Command: `npm test`
- **Dependencies:** `cross-env` is consistently used for environment variable management in scripts.

## Coding Conventions
- **File Naming:** Kebab-case (e.g., `wallet-manager.js`).
- **Class Naming:** PascalCase (e.g., `WdkManager`).
- **Private Members:** Prefixed with `_` (underscore) and explicitly documented with `@private`.
- **Imports:** Explicit file extensions are mandatory (e.g., `import ... from './file.js'`).
- **Copyright:** All source files must include the standard Tether copyright header.

## Documentation (JSDoc)
Source code must be strictly typed using JSDoc comments to support the `build:types` process.
- **Types:** Use `@typedef` to define or import types.
- **Methods:** Use `@param`, `@returns`, `@throws`.
- **Generics:** Use `@template`.

## Development Workflow
1.  **Install:** `npm install`
2.  **Lint:** `npm run lint`
3.  **Test:** `npm test`
4.  **Build Types:** `npm run build:types`

## Key Files
- `index.js`: Main entry point.
- `bare.js`: Entry point for Bare runtime optimization.
- `src/`: Core logic.
- `types/`: Generated type definitions (do not edit manually).

## Repository Specifics
- **Domain:** TON Blockchain Wallet.
- **Key Libraries:** `@ton/ton`, `@ton/crypto`.
- **Standards:** BIP-44 (m/44'/607').
- **Features:** Jetton support, Message signing, Cell construction.
