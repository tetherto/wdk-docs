# Runtime Compatibility

Your WDK module is designed to work seamlessly across both traditional and edge-optimized JavaScript runtimes.

## ✅ Supported Runtimes

### 1. Node.js

The module runs out of the box in standard [Node.js](https://nodejs.org/) environments. This includes:

- Local development setups  
- Server-side applications  
- Cloud functions (e.g., AWS Lambda, GCP Functions, Vercel)

### 2. Bare Runtime

We also support [Bare Runtime](https://github.com/holepunchto/bare), a lightweight JavaScript runtime designed for fast, low-level, and embedded environments. Bare provides:

- Faster startup  
- Low-overhead execution  
- Tight integration with native protocols and hypercore-based systems

> **Note:** If you're using the Bare runtime, make sure to handle any non-supported Node.js APIs manually or through polyfills.

---
