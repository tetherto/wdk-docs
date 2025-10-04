# Extending WDK Indexers to New Blockchains

This guide explains how to add support for a new blockchain to the WDK Indexer framework.

## Steps to Extend

1. **Implement ChainBaseClient**
   ```javascript
   class ChainNewClient extends ChainBaseClient {
     async getBlockHeight() { /* implementation */ }
     async validAddress(address) { /* implementation */ }
     async getBalance(address) { /* implementation */ }
     async getTransaction(hash) { /* implementation */ }
     async getBlocks(from, to) { /* implementation */ }
   }
   ```

2. **Create Worker Subclasses**
   - Extend `proc.indexer.wrk` for processor
   - Extend `api.indexer.wrk` for API worker

3. **Configuration**
   - Create chain-specific configuration template
   - Document required RPC endpoints and API keys

4. **Testing**
   - Implement integration tests
   - Validate against mainnet and testnet
