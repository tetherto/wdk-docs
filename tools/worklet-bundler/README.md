---
title: Worklet Bundler
description: CLI tool for generating WDK Bare worklet bundles
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

# Worklet Bundler

Worklet Bundler packages selected WDK wallet and protocol modules into a Bare runtime bundle that runs outside your main React Native application thread. Powered by [`@tetherto/wdk-worklet-bundler`](https://github.com/tetherto/wdk-worklet-bundler).

## Features

- **Config-driven bundle generation**: Map logical network names to wallet packages and optional protocol names to protocol packages in `wdk.config.js`.
- **Generated worklet artifact**: Produce a bundle for the Bare runtime plus generated TypeScript types for the host app.
- **Dependency validation helpers**: Validate configured modules, detect the active package manager, and generate install or uninstall commands when dependencies are missing.
- **CLI workflow**: Use `init`, `validate`, `generate`, `list-modules`, and `clean` without building your own wrapper.
- **Bare suspend and resume handling**: `beta.3` generated entrypoints suspend and resume both the `bare-http1` and `bare-https` global agents when the Bare thread lifecycle changes.

## Why this matters

- Bundle generation keeps wallet and protocol code in a separate Bare worklet instead of the UI thread.
- The generated type output gives the host app a stable import for the bundle surface.
- The `beta.3` runtime fix reduces the chance that HTTPS-backed worklet fetches keep running after a Bare thread suspension.

<table data-card-size="large" data-view="cards">
  <thead>
    <tr>
      <th></th>
      <th></th>
      <th></th>
      <th data-hidden data-card-target data-type="content-ref"></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <i class="fa-code">:code:</i>
      </td>
      <td>
        <strong>Worklet Bundler Configuration</strong>
      </td>
      <td>Set up `wdk.config.js`, review defaults, and understand the generated runtime behavior.</td>
      <td>
        <a href="./configuration.md">configuration.md</a>
      </td>
    </tr>
    <tr>
      <td>
        <i class="fa-mobile-alt">:mobile-alt:</i>
      </td>
      <td>
        <strong>Worklet Bundler API Reference</strong>
      </td>
      <td>Review the exported config types, dependency helpers, and bundle-generation functions.</td>
      <td>
        <a href="./api-reference.md">api-reference.md</a>
      </td>
    </tr>
  </tbody>
</table>

***

## Need Help?

{% include "../.gitbook/includes/support-cards.md" %}
