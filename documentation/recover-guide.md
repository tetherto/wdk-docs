---
title: Recovering Your Funds if the WDK SDK is Down
author: Raquel Carrasco Gonzalez
lastReviewed: 2025-10-01
---

In the event that the WDK (Wallet Development Kit) SDK is unavailable or inaccessible (or whenever you desire) you can still access your funds using the following recovery process. This guide outlines the steps to retrieve your wallet using popular wallets, including MetaMask, Phantom, and Trust Wallet.

## Before Starting to Recover Your Funds

**1. Locate Your Passphrase:** Retrieve the passphrase (seed phrase) that you saved when you initially created your wallet on the WDK application. This passphrase is crucial for recovering your wallet and accessing your funds.

Something like `reopen surface spot total tank custom arctic eagle input exact sketch mutual`

## Set up a New Wallet with Your Passphrase

**1) Download the wallet app/extension from official sources**

- [MetaMask](https://metamask.io/): browser extension (Chrome/Firefox/Brave) and iOS/Android apps
- [Phantom](https://phantom.com/): browser extension and iOS/Android apps
- [Trust Wallet](https://trustwallet.com/): browser extension and iOS/Android apps

Ensure you download only from the official store/listing. Avoid third-party APKs or unofficial sites.

Note: You can use any reputable wallet provider you prefer. MetaMask, Phantom, and Trust Wallet are shown here only as examples. For derivation paths and cross-wallet compatibility details, see the Export Guide: [WDK’s Derivation Path and Compatibility](./export-guide.md).

**2) Import your wallet (seed phrase)**

Follow the steps for your chosen provider. Do not share or screenshot your seed phrase.

### MetaMask (EVM chains)

Typical flow: Get Started → Import using Secret Recovery Phrase → paste 12 words → set password → finish → select intended network(s).


![MetaMask Step 1](../assets/export-guide/metamask1.png)
Step 1: Metamask home page. Click on "Get Metamask" to be redirected to the installation page. 

![MetaMask Step 2](../assets/export-guide/metamask2.png)
Step 2: Select to add extension "Add to Chrome" (or compatible browser used)

![MetaMask Step 3](../assets/export-guide/metamask3.png)
Step 3: Install browser extension clicking on "Add extension".

![MetaMask Step 5](../assets/export-guide/metamask5.png)
Step 4: Once the extension is created, you can start setting up your wallet, you will get redirected, but if not you can open clicking on the browser extension. 

![MetaMask Step 6](../assets/export-guide/metamask6.png)
Step 5: Select "Import using Secret Recovery Phrase"

![MetaMask Step 7](../assets/export-guide/metamask7.png)
Step 6: Enter your 12-word Secret Recovery Phrase (exact order, single spaces).

![MetaMask Step 9](../assets/export-guide/metamask9.png)
Step 7: Create a password.

![MetaMask Step 10](../assets/export-guide/metamask10.png)
Step 8: Accept terms. 

![MetaMask Step 11](../assets/export-guide/metamask11.png)
Step 9: Your wallet is set up!

![MetaMask Step 13](../assets/export-guide/metamask13.png)
Step 10: Confirmation; wallet ready on selected network (EVM).

Verification:
- Add/select the intended EVM network (Ethereum, Polygon, Arbitrum)
- Verify your address matches your expected EVM address

### Phantom

Typical flow: Open → Use Secret Recovery Phrase → Import → paste 12 words → set password → finish.

![Phantom Step 1](../assets/export-guide/phantom1.png)
Step 1: Phantom home page. Click on "Download" to be redirected to the installation page. 

![Phantom Step 2](../assets/export-guide/phantom2.png)
Step 2: Choose Import the extension for your type browser.

![Phantom Step 3](../assets/export-guide/phantom3.png)
Step 3: Install the extension by selecting "Add to Chrome" (or your chosen browser).

![Phantom Step 4](../assets/export-guide/phantom4.png)
Step 4: Install the browser extension by selecting "Add extension".

![Phantom Step 5](../assets/export-guide/phantom5.png)
Step 5: Installation confirmation.

![Phantom Step 6](../assets/export-guide/phantom6.png)
Step 6: Import your wallet by selecting "I already have a wallet".

![Phantom Step 7](../assets/export-guide/phantom7.png)
Step 7: Select "Import Recovery Phrase".

![Phantom Step 8](../assets/export-guide/phantom8.png)
Step 8: Enter your 12-word Secret Recovery Phrase (exact order, single spaces).
![Phantom Step 9](../assets/export-guide/phantom10.png)
Step 9: Your wallet is imported.

![Phantom Step 10](../assets/export-guide/phantom11.png)
Step 10: Create a password.

![Phantom Step 11](../assets/export-guide/phantom13.png)
Step 11: Create a username.

![Phantom Step 12](../assets/export-guide/phantom14.png)
Step 12: Setup complete.

![Phantom Step 13](../assets/export-guide/phantom15.png)
Step 13: Wallet ready.

Verification:
- Ensure the Solana address matches your expected one

### Trust Wallet (multi-chain incl. TON/TRON/EVM)

Typical flow: Add Wallet → Import Wallet → choose chain/wallet type if prompted → paste 12 words → complete setup.

![Trust Step 1](../assets/export-guide/trust1.png)
Step 1: Launch Trust Wallet; Select "Extension Wallet".

![Trust Step 2](../assets/export-guide/trust2.png)
Step 2: Choose used Browser.

![Trust Step 3](../assets/export-guide/trust3.png)
Step 3: Select "Add to Chrome" to add the browser extension.

![Trust Step 4](../assets/export-guide/trust4.png)
Step 4: Confirm installation of the browser extension.

![Trust Step 5](../assets/export-guide/trust5.png)
Step 5: Select "I already have a wallet" to import your passphrase.

![Trust Step 6](../assets/export-guide/trust6.png)
Step 6: Enable device security/biometrics or create new password as prompted.

![Trust Step 7](../assets/export-guide/trust7.png)
Step 7: If prompted, create a new password.

![Trust Step 8](../assets/export-guide/trust8.png)
Step 8: Select "Other mobile wallet or extension" to import your WDK passphrase.

![Trust Step 9](../assets/export-guide/trust9.png)
Step 9: Enter your 12-word Secret Recovery Phrase (exact order, single spaces).

![Trust Step 10](../assets/export-guide/trust11.png)
Step 10: Final confirmation; your wallet is recovered. Click on "Open my wallet" to proceed.

![Trust Step 11](../assets/export-guide/trust12.png)
Step 11: Wallet home page.

Verification:
- For the different networks, ensure the derived account matches your expectations
- Some chains (TON, Solana, Bitcoin) depend on wallet version/subwallet settings, path derivations, or derivation algoritms; if addresses differ, check wallet version and address format (bounceable/non-bounceable)

Note: For derivation paths and cross-wallet compatibility details, see the Export Guide: [WDK’s Derivation Path and Compatibility](./export-guide.md).


**3. Access Your Funds:** Once your wallet is successfully imported into your chosen application, you should be able to see your funds and manage transactions as usual.


## Additional Tips
Backup Your Wallet: Always keep a secure offline backup of your passphrase. Consider multiple copies in separate secure locations.


Verify Address: Double-check that the wallet address displayed in your chosen application matches the one associated with your original WDK wallet. For TON, ensure the same wallet contract/version, subwallet, and address format are selected.

## Conclusion
By following these steps, you can recover your funds and regain access to your wallet in case of any downtime or issues with the WDK application. Remember to maintain good security practices and keep your passphrase confidential to protect your assets effectively.


