---
title: Recovering Your Funds if the WDK SDK is Down
author: Raquel Carrasco Gonzalez
lastReviewed: 2025-10-01
---

In the event that the WDK (Wallet Development Kit) SDK is unavailable or inaccessible, you can still access your funds using the following recovery process. This guide outlines the steps to retrieve your wallet using popular wallets, including MetaMask, Phantom, and Trust Wallet.

## Before Starting to Recover Your Funds

**1. Locate Your Passphrase:** Retrieve the passphrase (seed phrase) that you saved when you initially created your wallet on the WDK application. This passphrase is crucial for recovering your wallet and accessing your funds.

Something like `reopen surface spot total tank custom arctic eagle input exact sketch mutual`

## Set up a New Wallet with Your Passphrase

**1) Download the wallet app/extension from official sources**

- MetaMask: browser extension (Chrome/Firefox/Brave) and iOS/Android apps
- Phantom: browser extension and iOS/Android apps
- Trust Wallet: iOS/Android apps

Ensure you download only from the official store/listing. Avoid third-party APKs or unofficial sites.

**2) Import your wallet (seed phrase)**

Follow the steps for your chosen provider. Do not share or screenshot your seed phrase.

### MetaMask (EVM chains)

1. Open MetaMask → Get Started → Import using Secret Recovery Phrase
2. Paste your 12-word seed phrase (exact order, single spaces)
3. Create a strong password (local device lock)
4. Confirm and finish setup

Screenshots:
![metamask-import-step-1](./images/metamask-import-1.png)
![metamask-import-step-2](./images/metamask-import-2.png)

Verification:
- Add/select the intended network (Ethereum, Polygon, Arbitrum)
- Verify your address matches your expected EVM address

### Phantom (Solana)

1. Open Phantom → Use Secret Recovery Phrase → Import
2. Paste your 12-word seed phrase
3. Set a password
4. Finish

Screenshots:
![phantom-import-step-1](./images/phantom-import-1.png)
![phantom-import-step-2](./images/phantom-import-2.png)

Verification:
- Ensure the Solana address matches your expected one

### Trust Wallet (multi-chain incl. TON/TRON/EVM)

1. Open Trust Wallet → Add Wallet → Import Wallet
2. Choose the correct chain/wallet type if prompted
3. Paste your 12-word seed phrase
4. Complete setup

Screenshots:
![trust-import-step-1](./images/trust-import-1.png)
![trust-import-step-2](./images/trust-import-2.png)

Verification:
- For TON/TRON/EVM, ensure the derived account matches your expectations
- Some chains (TON) depend on wallet version/subwallet settings; if addresses differ, check wallet version and address format (bounceable/non-bounceable)


**3. Access Your Funds:** Once your wallet is successfully imported into your chosen application, you should be able to see your funds and manage transactions as usual.


## Additional Tips
Backup Your Wallet: Always keep a secure offline backup of your passphrase. Consider multiple copies in separate secure locations.


Verify Address: Double-check that the wallet address displayed in your chosen application matches the one associated with your original WDK wallet. For TON, ensure the same wallet contract/version, subwallet, and address format are selected.

## Conclusion
By following these steps, you can recover your funds and regain access to your wallet in case of any downtime or issues with the WDK application. Remember to maintain good security practices and keep your passphrase confidential to protect your assets effectively.


