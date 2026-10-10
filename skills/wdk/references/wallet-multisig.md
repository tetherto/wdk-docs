# Multisig Wallet Modules

These notes cover Safe `1.0.0-beta.1` and Squads `1.0.0-beta.2`. Verify the installed version and read its concrete module documentation before constructing transactions.

| Module | Chain | Documentation |
| --- | --- | --- |
| `@tetherto/wdk-wallet-multisig-safe` | EVM | https://docs.wdk.tether.io/sdk/wallet-modules/wallet-multisig-safe |
| `@tetherto/wdk-wallet-multisig-squads` | Solana | https://docs.wdk.tether.io/sdk/wallet-modules/wallet-multisig-squads |

## Safe

- Configure the chain RPC, bundler, and coordinator for the same network. Keep owner keys separate and require the configured approval threshold.
- Review the complete proposal before approving it. Proposal submission, sufficient signatures, bundler acceptance, and on-chain confirmation are distinct states.
- `sign(message)` proposes a message through the coordinator. It is not a local owner-signature helper.
- `executeProposal()` returns a UserOperation hash and a native maximum gas estimate. Do not treat that hash or an `autoExecute` result as a confirmed transaction receipt.
- The published TypeScript declarations do not accept the exported Safe transaction-service coordinator as the declared coordinator interface. Use the documented default `txServiceUrl` and `safeApiKey` configuration path for TypeScript.

## Squads

- Distinguish the member signer, multisig account, and vault address. The member needs SOL for transaction fees and account rent; vault balances do not pay those costs automatically.
- Check member permission masks, threshold, proposal state, and any timelock before approving or executing.
- Review proposals again after owner or configuration changes. Reconcile partial coordinator operations before retrying.
- Standard SPL token transfers are supported; do not assume Token-2022 support. The beta.2 quote helpers still estimate against vault index zero.
- In beta.2, a coordinator approval whose transaction bundle is not yet fully signed returns `transaction: undefined`. Pending coordinator confirmations are held off-chain, and on-chain confirmations do not increase until a transaction is submitted. A fully signed approval-only bundle can broadcast before the proposal threshold is reached; check for an actual transaction and inspect proposal state before reporting a broadcast or execution.
- A custom backend must verify each base58 signature against the supplied `signerAddress` and the exact held `messageBytes` before merging approvals. Reject invalid signatures without changing the held proposal. The SDK interface does not implement this backend validation automatically.

Both modules have chain-specific deployment and recovery prerequisites. Follow their get-started, proposal, owner-management, and error-handling guides rather than assuming the standard wallet transaction flow applies unchanged.
