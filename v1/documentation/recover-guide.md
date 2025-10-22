---
title: Recovering Your Funds if the WDK SDK is Down
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


<figure>
  <img src="../assets/export-guide/metamask1.png" alt="MetaMask Step 1" />
  <figcaption>Step 1: MetaMask home page. Click “Get MetaMask” to go to the installation page.</figcaption>
</figure>
<figure>
  <img src="../assets/export-guide/metamask2.png" alt="MetaMask Step 2" />
  <figcaption>Step 2: Click “Add to Chrome” (or your browser’s equivalent) to add the extension.</figcaption>
</figure>
<figure>
  <img src="../assets/export-guide/metamask3.png" alt="MetaMask Step 3" />
  <figcaption>Step 3: Confirm by selecting “Add extension”.</figcaption>
</figure>
<figure>
  <img src="../assets/export-guide/metamask5.png" alt="MetaMask Step 4" />
  <figcaption>Step 4: After installation, you’ll be redirected to MetaMask. If not, open it from the browser’s extensions menu.</figcaption>
</figure>
<figure>
  <img src="../assets/export-guide/metamask6.png" alt="MetaMask Step 5" />
  <figcaption>Step 5: Select “Import using Secret Recovery Phrase”.</figcaption>
</figure>
<figure>
  <img src="../assets/export-guide/metamask7.png" alt="MetaMask Step 6" />
  <figcaption>Step 6: Enter your 12-word Secret Recovery Phrase (exact order, single spaces).</figcaption>
</figure>
<figure>
  <img src="../assets/export-guide/metamask9.png" alt="MetaMask Step 7" />
  <figcaption>Step 7: Create a password.</figcaption>
</figure>
<figure>
  <img src="../assets/export-guide/metamask10.png" alt="MetaMask Step 8" />
  <figcaption>Step 8: Accept terms.</figcaption>
</figure>
<figure>
  <img src="../assets/export-guide/metamask11.png" alt="MetaMask Step 9" />
  <figcaption>Step 9: Your wallet is set up.</figcaption>
</figure>
<figure>
  <img src="../assets/export-guide/metamask13.png" alt="MetaMask Step 10" />
  <figcaption>Step 10: Confirmation — wallet ready on selected network (EVM).</figcaption>
</figure>

Verification:
- Add/select the intended EVM network (Ethereum, Polygon, Arbitrum)
- Verify your address matches your expected EVM address

### Phantom

Typical flow: Open → Use Secret Recovery Phrase → Import → paste 12 words → set password → finish.

<figure>
  <img src="../assets/export-guide/phantom1.png" alt="Phantom Step 1" />
  <figcaption>Step 1: Phantom home page. Click “Download” to be redirected to the installation page.</figcaption>
</figure>
<figure>
  <img src="../assets/export-guide/phantom2.png" alt="Phantom Step 2" />
  <figcaption>Step 2: Choose the extension for your browser.</figcaption>
</figure>
<figure>
  <img src="../assets/export-guide/phantom3.png" alt="Phantom Step 3" />
  <figcaption>Step 3: Click “Add to Chrome” (or your browser) to install.</figcaption>
</figure>
<figure>
  <img src="../assets/export-guide/phantom4.png" alt="Phantom Step 4" />
  <figcaption>Step 4: Confirm by selecting “Add extension”.</figcaption>
</figure>
<figure>
  <img src="../assets/export-guide/phantom5.png" alt="Phantom Step 5" />
  <figcaption>Step 5: Installation confirmation.</figcaption>
</figure>
<figure>
  <img src="../assets/export-guide/phantom6.png" alt="Phantom Step 6" />
  <figcaption>Step 6: Select “I already have a wallet”.</figcaption>
</figure>
<figure>
  <img src="../assets/export-guide/phantom7.png" alt="Phantom Step 7" />
  <figcaption>Step 7: Choose “Import Recovery Phrase”.</figcaption>
</figure>
<figure>
  <img src="../assets/export-guide/phantom8.png" alt="Phantom Step 8" />
  <figcaption>Step 8: Enter your 12-word Secret Recovery Phrase (exact order, single spaces).</figcaption>
</figure>
<figure>
  <img src="../assets/export-guide/phantom10.png" alt="Phantom Step 9" />
  <figcaption>Step 9: Your wallet is imported.</figcaption>
</figure>
<figure>
  <img src="../assets/export-guide/phantom11.png" alt="Phantom Step 10" />
  <figcaption>Step 10: Create a password.</figcaption>
</figure>
<figure>
  <img src="../assets/export-guide/phantom13.png" alt="Phantom Step 11" />
  <figcaption>Step 11: Create a username.</figcaption>
</figure>
<figure>
  <img src="../assets/export-guide/phantom14.png" alt="Phantom Step 12" />
  <figcaption>Step 12: Setup complete.</figcaption>
</figure>
<figure>
  <img src="../assets/export-guide/phantom15.png" alt="Phantom Step 13" />
  <figcaption>Step 13: Wallet ready.</figcaption>
</figure>

Verification:
- Ensure the Solana address matches your expected one

### Trust Wallet (multi-chain incl. TON/TRON/EVM)

Typical flow: Add Wallet → Import Wallet → choose chain/wallet type if prompted → paste 12 words → complete setup.

<figure>
  <img src="../assets/export-guide/trust1.png" alt="Trust Step 1" />
  <figcaption>Step 1: Launch Trust Wallet; Select “Extension Wallet”.</figcaption>
</figure>
<figure>
  <img src="../assets/export-guide/trust2.png" alt="Trust Step 2" />
  <figcaption>Step 2: Choose your browser.</figcaption>
</figure>
<figure>
  <img src="../assets/export-guide/trust3.png" alt="Trust Step 3" />
  <figcaption>Step 3: Select “Add to Chrome” to add the browser extension.</figcaption>
</figure>
<figure>
  <img src="../assets/export-guide/trust4.png" alt="Trust Step 4" />
  <figcaption>Step 4: Confirm installation of the browser extension.</figcaption>
</figure>
<figure>
  <img src="../assets/export-guide/trust5.png" alt="Trust Step 5" />
  <figcaption>Step 5: Select “I already have a wallet” to import your passphrase.</figcaption>
</figure>
<figure>
  <img src="../assets/export-guide/trust6.png" alt="Trust Step 6" />
  <figcaption>Step 6: Enable device security/biometrics or create a new password as prompted.</figcaption>
</figure>
<figure>
  <img src="../assets/export-guide/trust7.png" alt="Trust Step 7" />
  <figcaption>Step 7: If prompted, create a new password.</figcaption>
</figure>
<figure>
  <img src="../assets/export-guide/trust8.png" alt="Trust Step 8" />
  <figcaption>Step 8: Select “Other mobile wallet or extension” to import your WDK passphrase.</figcaption>
</figure>
<figure>
  <img src="../assets/export-guide/trust9.png" alt="Trust Step 9" />
  <figcaption>Step 9: Enter your 12-word Secret Recovery Phrase (exact order, single spaces).</figcaption>
</figure>
<figure>
  <img src="../assets/export-guide/trust11.png" alt="Trust Step 10" />
  <figcaption>Step 10: Final confirmation; your wallet is recovered. Click “Open my wallet” to proceed.</figcaption>
</figure>
<figure>
  <img src="../assets/export-guide/trust12.png" alt="Trust Step 11" />
  <figcaption>Step 11: Wallet home page.</figcaption>
</figure>

Verification:
- For the different networks, ensure the derived account matches your expectations
- Some chains (TON, Solana, Bitcoin) depend on wallet version/subwallet settings, path derivations, or derivation algoritms; if addresses differ, check wallet version and address format (bounceable/non-bounceable)

Note: For derivation paths and cross-wallet compatibility details, see the Export Guide: [WDK’s Derivation Path and Compatibility](./export-guide.md).


**3. Access Your Funds:** Once your wallet is successfully imported into your chosen application, you should be able to see your funds and manage transactions as usual.


## Additional Tips
Backup Your Wallet: Always keep a secure offline backup of your passphrase. Consider multiple copies in separate secure locations.

Verify Address: Double-check that the wallet address displayed in your chosen application matches the one associated with your original WDK wallet. If you see a different, don't worry your funds are not lost! That could be for the wallet configuration, check [WDK's Derivation Path and Compatibility](./export-guide.md) to know more.


## Conclusion

By following these steps, you can recover your funds and regain access to your wallet in case of any downtime or issues with the WDK application. Remember to maintain good security practices and keep your passphrase confidential to protect your assets effectively.


