// Where everything appears: tabs > categories > entries.
// This is the file to edit to rearrange the docs. Page URLs do not depend on it.
//
// Entries are keys from ./inventory.mjs. Use { key, name } to change a row's label and
// { group, icon, entries } for a collapsible row. Each page must appear exactly once;
// run `npm run check:nav` after changing this file.

const named = (key, name) => ({ key, name });

export default {
  label: 'Five tabs: Start / Wallets / DeFi & Fiat / AI & CLI / Tools',
  normalizeLabels: true,
  foldHubUsage: true,
  utilities: [
    { name: 'Changelog', url: '/overview/changelog' },
    { name: 'Support', url: '/overview/support' },
  ],
  tabs: [
    {
      name: 'Start',
      icon: 'Rocket',
      categories: [
        { name: 'Quickstarts', entries: ['home', 'nodejs-bare-quickstart', 'react-native-quickstart', 'react-native-starter', 'which-wallet-module'] },
        { name: 'Understand WDK', entries: [named('get-started', 'Architecture'), 'concepts'] },
        { name: 'About WDK', entries: ['about', 'vision', 'showcase', 'partner-program', 'support', 'changelog'] },
      ],
    },
    {
      name: 'Wallets',
      icon: 'Wallet',
      categories: [
        { name: 'Overview', entries: ['wallet-modules', 'core-module'] },
        {
          name: 'By chain',
          entries: [
            { group: 'EVM', icon: 'Blocks', entries: ['wallet-evm', 'wallet-evm-hinkal', 'wallet-evm-bermuda', 'wallet-evm-erc-4337', 'wallet-multisig-safe', 'wallet-evm-7702-gasless'] },
            { group: 'Bitcoin', icon: 'Bitcoin', entries: [named('wallet-btc', 'Standard Bitcoin'), 'wallet-spark', 'wdk-wallet-rgb', 'wdk-rgb-lightning'] },
            { group: 'TON', icon: 'Circle', entries: ['wallet-ton', 'wallet-ton-gasless'] },
            { group: 'TRON', icon: 'Triangle', entries: ['wallet-tron', 'wallet-tron-gasfree'] },
            { group: 'Solana', icon: 'Sun', entries: ['wallet-solana', 'wallet-multisig-squads', 'wallet-solana-gasless'] },
            'wallet-aptos',
            'wdk-wallet-cosmos',
          ],
        },
        { name: 'React Native', entries: ['react-native-core', 'react-native-secure-storage'] },
        { name: 'Keys and recovery', entries: [named('backup-cloud', 'Cloud Backup'), named('wdk-utils', 'WDK Utils')] },
      ],
    },
    {
      name: 'DeFi & Fiat',
      icon: 'Route',
      categories: [
        {
          name: 'Swap and bridge',
          entries: [
            'swidge-modules',
            'swidge-orchestra',
            'swidge-rhinofi',
            'swidge-symbiosis',
            'swidge-lifi',
            'swidge-0x',
            'swidge-moonpay-trade',
            'swidge-butter',
            { group: 'Velora swaps', icon: 'ArrowLeftRight', index: 'swap-modules', entries: ['swap-velora-evm'] },
            { group: 'USD₮0 bridge', icon: 'Waypoints', index: 'bridge-modules', entries: ['bridge-usdt0-evm', 'bridge-usdt0-solana'] },
          ],
        },
        { name: 'Lending', entries: ['lending-modules', 'lending-aave-evm', 'lending-morpho-evm'] },
        { name: 'Smart deposit addresses', entries: ['sda-modules', 'sda-rhinofi', 'sda-candide'] },
        { name: 'On-ramp and off-ramp', entries: ['fiat-modules', 'fiat-moonpay', 'fiat-transak'] },
      ],
    },
    {
      name: 'AI & CLI',
      icon: 'Bot',
      categories: [
        { name: 'AI', entries: ['build-with-ai', 'agent-skills', 'openclaw', 'x402'] },
        { name: 'CLI', entries: ['cli'] },
      ],
    },
    {
      name: 'Tools',
      icon: 'Wrench',
      // Fumadocs opens a tab on its first plain page, which here would be a pricing reference.
      landing: 'indexer-api',
      categories: [
        { name: 'Data', entries: [named('indexer-api', 'Indexer API'), named('price-rates', 'Price Rates'), 'pricing-modules', 'pricing-coingecko-http', named('asset-registry', 'Asset Registry')] },
        { name: 'Infrastructure', entries: [named('failover-provider', 'Failover Provider'), 'p2p-address-book'] },
        { name: 'Runtimes and packaging', entries: [named('pear-wrk-wdk', 'Pear Worklet'), named('worklet-bundler', 'Worklet Bundler'), named('create-wdk-module', 'Create a WDK Module')] },
      ],
    },
  ],
};
