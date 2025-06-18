---
title: Scaffold in JS for Browser
description: 
author: Raquel Carrasco Gonzalez
lastReviewed: 2025-06-18
---

# Scaffold in JS for Browser

## 0 . Prerequisites

| Tool                           | Version                                               | Why                                                    |
| ------------------------------ | ----------------------------------------------------- | ------------------------------------------------------ |
| **Node**                       | ≥ 20 LTS                                              | native `crypto`, top-level `await`, import maps        |
| **pnpm**                       | ≥ 8                                                   | monorepo + workspace aliases; matches WDK dev workflow |
| **Git**                        | access to the private **wdk-core** repo, SSH or HTTPS |                                                        |
| **Chrome / Chromium**          | v121+                                                 | stable Manifest V3 & ES Modules                        |
| **VS Code** + Volta (optional) | keeps one toolchain per project                       |                                                        |

---

## 1 . Get the SDK into your workspace

> *Pick exactly **one** of the three methods—linking, git URL, or private registry.
> Mixing them will break module resolution.*

**A. Local link (best for active hacking)**

```bash
git clone git@github.com:tetherto/wdk-core.git
cd wdk-core
npm install
# remain in wdk-core tab ↓
```

In a second terminal:

```bash
# Vite + React (JavaScript template)
npx create-next-app@15.3.3 my-browser-wallet
# Pick:
#   TypeScript?           › No        ← plain JS
#   ESLint?               › Yes       (recommended)
#   Tailwind?             › No       (nice for popup UI)
#   src/ directory?       › Yes       (keeps root clean)
#   App Router?           › Yes       (works fine in an extension)
#   Turbopack for dev?    › Yes / No  (both okay; Webpack is simpler for now)
#   Custom import alias?  › No        (@/* is fine)
cd my-browser-wallet

npm install
npm run dev

npm add -D vite-plugin-chrome-extension     # MV3 bundler helper
# npm link ../wdk-core/packages/wallet-evm
# npm link ../wdk-core/packages/wallet

# repeat for protocol adapters you plan to use
```

**B. Git tag install (read-only PoC)**

```bash
pnpm add "git+https://github.com/<org>/wdk-core.git#v0.9.0-beta.3#packages/wallet-evm"
pnpm add "git+https://github.com/<org>/wdk-core.git#v0.9.0-beta.3#packages/wallet"
```

**C. Private registry**

Set up your `.npmrc` as explained in the revised **installation.md**, then
`pnpm add @wdk/wallet-evm`.

---

## 2 . Scaffold the browser-extension project

1. **Vite + React + TypeScript**

   ```bash
   npx create-vite my-wallet-ext --template react-ts
   cd my-wallet-ext
   pnpm add -D vite-plugin-chrome-extension
   ```

2. **Convert to Manifest V3**

   * Add `vite.config.ts`:

     ```ts
     import { defineConfig } from 'vite';
     import react from '@vitejs/plugin-react';
     import { crx } from 'vite-plugin-chrome-extension';

     export default defineConfig({
       plugins: [react(), crx({ manifest: 'manifest.json' })],
       build: { outDir: 'dist' },
     });
     ```

   * Create `manifest.json`:

     ```json
     {
       "manifest_version": 3,
       "name": "WDK Wallet",
       "version": "0.1.0",
       "action": { "default_popup": "index.html" },
       "background": { "service_worker": "background.js", "type": "module" },
       "permissions": ["storage"],
       "host_permissions": ["https://*.etherscan.io/*"]
     }
     ```

3. **TS config tweaks**

   ```jsonc
   {
     "compilerOptions": {
       "target": "es2022",
       "module": "esnext",
       "moduleResolution": "node",
       "types": ["chrome"]
     }
   }
   ```

---

## 3 . Wire up WDK in React

1. **Add deps**

   ```bash
   pnpm add @wdk/wallet-evm ethers@^6 zod   # zod for config parsing
   ```

2. **Create a wallet provider**

   ```tsx
   // src/WalletContext.tsx
   import React, { createContext, useContext, useMemo } from 'react';
   import { WalletManagerEvm } from '@wdk/wallet-evm';

   const WalletCtx = createContext<WalletManagerEvm | null>(null);
   export const useWallet = () => useContext(WalletCtx)!;

   export const WalletProvider: React.FC<{ seed: string }> = ({ seed, children }) => {
     const manager = useMemo(
       () =>
         new WalletManagerEvm(seed, {
           provider: 'https://rpc.ankr.com/eth',      // todo: inject per-network
         }),
       [seed],
     );

     return <WalletCtx.Provider value={manager}>{children}</WalletCtx.Provider>;
   };
   ```

3. **Persist / encrypt the seed**

   *During private beta keep it simple: AES-GCM with a pass-phrase and store the
   blob in `chrome.storage.local`.*

   ```ts
   // src/seedStore.ts
   export async function saveEncryptedSeed(cipher: ArrayBuffer) {
     await chrome.storage.local.set({ seed: Array.from(new Uint8Array(cipher)) });
   }
   export async function loadEncryptedSeed(): Promise<ArrayBuffer | null> {
     const { seed } = await chrome.storage.local.get('seed');
     return seed ? new Uint8Array(seed).buffer : null;
   }
   ```

---

## 4 . Extension UI skeleton

```
src/
├── pages/
│   ├── Onboarding.tsx     # create / import seed
│   ├── Dashboard.tsx      # show balances
│   ├── Send.tsx           # tx form
│   └── Swap.tsx           # optional
├── WalletContext.tsx
└── index.tsx
```

Use **React Router** inside the popup; keep each flow under 3 screens to stay
within typical popup height.

---

## 5 . Background service worker (optional)

If you need *content-script ↔ wallet* messaging:

```js
// background.ts
import { chromeRuntimeMessenger } from '@wdk/wallet-evm/helpers/chrome';

chrome.runtime.onMessage.addListener(chromeRuntimeMessenger);
```

The helper wraps WDK wallet calls and enforces origin checks.

---

## 6 . Build & load

```bash
pnpm run build          # vite build
chrome://extensions → Load unpacked → dist/
```

Test:

```ts
const account = await wallet.getAccount();
await account.sendTransaction({ to: '0xabc…', value: 0n });
```

Look for an on-chain tx hash in the dev console.

---

## 7 . Hardening checklist (before shipping)

| Area                        | Action                                                                                        |
| --------------------------- | --------------------------------------------------------------------------------------------- |
| **Secret handling**         | Replace pass-phrase AES with WebCrypto + biometric unlock API (if available).                 |
| **Content Security Policy** | Lock `connect-src` to your RPC endpoints and aggregators.                                     |
| **Error codes**             | Map `SdkError.code` to user-friendly messages (see `error-codes.md`).                         |
| **Gas estimation**          | Always show fee quotes from `wallet.quoteSendTransaction()` *before* asking for confirmation. |
| **Unit tests**              | Stub `chrome.*`, use Jest/Vitest + `jsdom`.                                                   |
| **CI**                      | Run `pnpm -r test && pnpm -r typecheck && vite build` on every PR.                            |
| **Audits**                  | Re-run the WDK static-analysis scripts (`pnpm audit:wdk`) after each SDK update.              |

---

### Next steps

1. **Pick consumption method** (local link, git tag, or private registry) and
   wire it up.
2. **Bootstrap the React + Vite project** with Manifest V3.
3. **Implement the WalletProvider** and a minimal onboarding flow; once your
   address renders in the popup you’re past 80 % of the setup friction.
4. Add swap or bridge flows later—those only require dropping in the relevant
   protocol adapter and calling `quoteSwap` / `swap`.

Ping me once you have the scaffold in place and we can drill down into any
step—crypto storage, fee quoting, swap UX, etc. Happy hacking! 🚀
