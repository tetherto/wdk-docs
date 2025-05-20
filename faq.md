# FAQ

Find answers to common questions about WDK.

---

**Q: How do I install WDK?**  
A: See [Getting Started](getting-started.md) for installation instructions.

**Q: How do I add a new blockchain?**  
A: Add a new config object for the blockchain and pass it to `WdkManager` during initialization. See [API Reference](api-reference.md).

**Q: Can I use WDK in a browser or React Native?**  
A: Yes! WDK works in Node.js, browser, and React Native (with polyfills for modules like `crypto`, `buffer`, and `stream`).

**Q: How do I recover my wallet?**  
A: Use your original seed phrase with `WdkManager` to restore all wallet addresses and balances. See [Getting Started](getting-started.md). 