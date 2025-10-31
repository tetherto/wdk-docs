# Configuration, Structure, and CI (Protocols)

Guidelines for protocol modules (swap, bridge, lending) to stay compatible with WDK.

## Folder Structure

```
protocol-<type>-<chain>/
├─ index.js
├─ package.json
├─ tsconfig.json
├─ README.md
├─ LICENSE
├─ types/
│  └─ index.d.ts (public types)
└─ src/
   └─ protocol.(js|ts)
```

## Naming & Exports

- **Package**: `@wdk/protocol-<type>-<chain>` (e.g., `@wdk/protocol-bridge-usdt0-ton`)
- **Files**: kebab‑case
- **Exports**: default export from `index.js`; keep helpers private to `src/`

## Dependencies & Bare Runtime

- Prefer minimal, audited dependencies; avoid deep trees
- Avoid Node‑only APIs; target pure JS/TS and web‑safe crypto
- Test locally in a bare‑like environment
- If a required dependency is not bare‑compatible:
  - Document it in your proposal
  - Coordinate with the Holepunch/WDK team on a path to support

{% hint style="warning" %}
Bare compatibility is optional for community modules. For <strong>official</strong> inclusion, provide either bare compatibility or an agreed plan.
{% endhint %}

## Docs & Testing

- `README.md`: install, config, usage, examples, limitations
- `CHANGELOG.md`: semver entries
- Tests:
  - Unit for each public method
  - Integration: orchestrator usage with real or mocked account
  - CI runs headless and bare‑like

## CI Pipeline

- Lint: `npm run lint`
- Type‑check: `npm run type-check` or `tsc`
- Test: `npm test`
- Optional: dry‑run publish

## Versioning & Branching

- Semver (major.minor.patch)
- `main` as stable; feature branches for new work
- Tag releases; synchronize `CHANGELOG.md`

## Monorepo & Partner

- Place under the appropriate docs tree and/or monorepo location
- Ensure compatibility with `@tetherto/wdk-core`
- Provide maintainer contacts and any external infra details for partner onboarding
