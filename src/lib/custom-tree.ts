import type { Node } from 'fumadocs-core/page-tree';
import { resolveIcon } from "@/lib/resolveIcon";

export const customTree: Node[] = [
  {
    type: 'separator',
    name: 'Overview',
  },
  { name: 'Welcome', url: '/', type: 'page', icon: resolveIcon('Rocket') },
  { name: 'About WDK', url: '/overview/about', type: 'page', icon: resolveIcon('Info') },
  { name: 'Our Vision', url: '/overview/vision', type: 'page', icon: resolveIcon('Lightbulb') },
  { name: 'Partner with WDK', url: '/overview/partner-program', type: 'page', icon: resolveIcon('Handshake') },
  { name: 'Get Support', url: '/overview/support', type: 'page', icon: resolveIcon('CircleQuestionMark') },
  { name: 'Changelog', url: '/overview/changelog', type: 'page', icon: resolveIcon('History') },
  { name: 'Showcase', url: '/overview/showcase', type: 'page', icon: resolveIcon('Trophy') },
  {
    type: 'separator',
    name: 'Start Building',
  },
  { name: 'Node.js & Bare Quickstart', url: '/start-building/nodejs-bare-quickstart', type: 'page', icon: resolveIcon('Terminal') },
  { name: 'React Native Quickstart', url: '/start-building/react-native-quickstart', type: 'page', icon: resolveIcon('Smartphone') },
  {
    type: 'separator',
    name: 'AI',
  },
  {
    name: 'MCP Toolkit',
    type: 'folder',
    icon: resolveIcon('Wand'),
    index: {
      name: 'MCP Toolkit',
      url: '/ai/mcp-toolkit',
      type: 'page',
    },
    children: [
      { name: 'Get Started', url: '/ai/mcp-toolkit/get-started', type: 'page', icon: resolveIcon('Rocket') },
      { name: 'Configuration', url: '/ai/mcp-toolkit/configuration', type: 'page', icon: resolveIcon('Settings') },
      { name: 'API Reference', url: '/ai/mcp-toolkit/api-reference', type: 'page', icon: resolveIcon('Code') },
      { name: 'LangChain Integration', url: '/ai/mcp-toolkit/langchain', type: 'page', icon: resolveIcon('Link') },
    ],
  },
  { name: 'Agent Skills', url: '/ai/agent-skills', type: 'page', icon: resolveIcon('Brain') },
  { name: 'OpenClaw', url: '/ai/openclaw', type: 'page', icon: resolveIcon('Cat') },
  { name: 'x402', url: '/ai/x402', type: 'page', icon: resolveIcon('CreditCard') },
  {
    type: 'separator',
    name: 'SDK',
  },
  { name: 'Get Started', url: '/sdk/get-started', type: 'page', icon: resolveIcon('Rocket') },
  { name: 'All Modules', url: '/sdk/all-modules', type: 'page', icon: resolveIcon('LayoutGrid') },
  {
    name: 'Core Module',
    type: 'folder',
    icon: resolveIcon('Box'),
    index: {
      name: 'Core Module',
      url: '/sdk/core-module',
      type: 'page',
    },
    children: [
      { name: 'Usage', url: '/sdk/core-module/usage', type: 'page', icon: resolveIcon('Play') },
      {
        name: 'Guides',
        type: 'folder',
        icon: resolveIcon('BookOpen'),
        children: [
          { name: 'Getting Started', url: '/sdk/core-module/guides/getting-started', type: 'page' },
          { name: 'Register Wallets', url: '/sdk/core-module/guides/wallet-registration', type: 'page' },
          { name: 'Account Management', url: '/sdk/core-module/guides/account-management', type: 'page' },
          { name: 'Send Transactions', url: '/sdk/core-module/guides/transactions', type: 'page' },
          { name: 'Protocol Integration', url: '/sdk/core-module/guides/protocol-integration', type: 'page' },
          { name: 'Middleware', url: '/sdk/core-module/guides/middleware', type: 'page' },
          { name: 'Error Handling', url: '/sdk/core-module/guides/error-handling', type: 'page' },
        ],
      },
      { name: 'Configuration', url: '/sdk/core-module/configuration', type: 'page', icon: resolveIcon('Settings') },
      { name: 'API Reference', url: '/sdk/core-module/api-reference', type: 'page', icon: resolveIcon('Code') },
    ],
  },
  {
    name: 'Wallet Modules',
    type: 'folder',
    icon: resolveIcon('Wallet'),
    index: {
      name: 'Wallet Modules',
      url: '/sdk/wallet-modules',
      type: 'page',
    },
    children: [
      {
        name: 'wallet-btc', type: 'folder',
        index: { name: 'wallet-btc', url: '/sdk/wallet-modules/wallet-btc', type: 'page' },
        children: [
          { name: 'Usage', url: '/sdk/wallet-modules/wallet-btc/usage', type: 'page' },
          {
            name: 'Guides', type: 'folder', icon: resolveIcon('BookOpen'),
            children: [
              { name: 'Get Started', url: '/sdk/wallet-modules/wallet-btc/guides/get-started', type: 'page' },
              { name: 'Manage Accounts', url: '/sdk/wallet-modules/wallet-btc/guides/manage-accounts', type: 'page' },
              { name: 'Check Balances', url: '/sdk/wallet-modules/wallet-btc/guides/check-balances', type: 'page' },
              { name: 'Send BTC', url: '/sdk/wallet-modules/wallet-btc/guides/send-transactions', type: 'page' },
              { name: 'Transaction History', url: '/sdk/wallet-modules/wallet-btc/guides/get-transaction-history', type: 'page' },
              { name: 'Sign and Verify Messages', url: '/sdk/wallet-modules/wallet-btc/guides/sign-verify-messages', type: 'page' },
              { name: 'Handle Errors', url: '/sdk/wallet-modules/wallet-btc/guides/handle-errors', type: 'page' },
            ],
          },
          { name: 'Configuration', url: '/sdk/wallet-modules/wallet-btc/configuration', type: 'page' },
          { name: 'API Reference', url: '/sdk/wallet-modules/wallet-btc/api-reference', type: 'page' },
        ],
      },
      {
        name: 'wallet-evm', type: 'folder',
        index: { name: 'wallet-evm', url: '/sdk/wallet-modules/wallet-evm', type: 'page' },
        children: [
          { name: 'Usage', url: '/sdk/wallet-modules/wallet-evm/usage', type: 'page' },
          {
            name: 'Guides', type: 'folder', icon: resolveIcon('BookOpen'),
            children: [
              { name: 'Getting Started', url: '/sdk/wallet-modules/wallet-evm/guides/getting-started', type: 'page' },
              { name: 'Manage Accounts', url: '/sdk/wallet-modules/wallet-evm/guides/manage-accounts', type: 'page' },
              { name: 'Check Balances', url: '/sdk/wallet-modules/wallet-evm/guides/check-balances', type: 'page' },
              { name: 'Send Transactions', url: '/sdk/wallet-modules/wallet-evm/guides/send-transactions', type: 'page' },
              { name: 'Transfer ERC-20 Tokens', url: '/sdk/wallet-modules/wallet-evm/guides/transfer-tokens', type: 'page' },
              { name: 'Sign and Verify Messages', url: '/sdk/wallet-modules/wallet-evm/guides/sign-verify-messages', type: 'page' },
              { name: 'Error Handling', url: '/sdk/wallet-modules/wallet-evm/guides/error-handling', type: 'page' },
            ],
          },
          { name: 'Configuration', url: '/sdk/wallet-modules/wallet-evm/configuration', type: 'page' },
          { name: 'API Reference', url: '/sdk/wallet-modules/wallet-evm/api-reference', type: 'page' },
        ],
      },
      {
        name: 'wallet-evm-erc-4337', type: 'folder',
        index: { name: 'wallet-evm-erc-4337', url: '/sdk/wallet-modules/wallet-evm-erc-4337', type: 'page' },
        children: [
          { name: 'Usage', url: '/sdk/wallet-modules/wallet-evm-erc-4337/usage', type: 'page' },
          {
            name: 'Guides', type: 'folder', icon: resolveIcon('BookOpen'),
            children: [
              { name: 'Get Started', url: '/sdk/wallet-modules/wallet-evm-erc-4337/guides/get-started', type: 'page' },
              { name: 'Manage Accounts', url: '/sdk/wallet-modules/wallet-evm-erc-4337/guides/manage-accounts', type: 'page' },
              { name: 'Check Balances', url: '/sdk/wallet-modules/wallet-evm-erc-4337/guides/check-balances', type: 'page' },
              { name: 'Send Transactions', url: '/sdk/wallet-modules/wallet-evm-erc-4337/guides/send-transactions', type: 'page' },
              { name: 'Transfer Tokens', url: '/sdk/wallet-modules/wallet-evm-erc-4337/guides/transfer-tokens', type: 'page' },
              { name: 'Sign and Verify Messages', url: '/sdk/wallet-modules/wallet-evm-erc-4337/guides/sign-verify-messages', type: 'page' },
              { name: 'Handle Errors', url: '/sdk/wallet-modules/wallet-evm-erc-4337/guides/handle-errors', type: 'page' },
            ],
          },
          { name: 'Configuration', url: '/sdk/wallet-modules/wallet-evm-erc-4337/configuration', type: 'page' },
          { name: 'API Reference', url: '/sdk/wallet-modules/wallet-evm-erc-4337/api-reference', type: 'page' },
        ],
      },
      {
        name: 'wallet-solana', type: 'folder',
        index: { name: 'wallet-solana', url: '/sdk/wallet-modules/wallet-solana', type: 'page' },
        children: [
          { name: 'Usage', url: '/sdk/wallet-modules/wallet-solana/usage', type: 'page' },
          {
            name: 'Guides', type: 'folder', icon: resolveIcon('BookOpen'),
            children: [
              { name: 'Getting Started', url: '/sdk/wallet-modules/wallet-solana/guides/getting-started', type: 'page' },
              { name: 'Manage Accounts', url: '/sdk/wallet-modules/wallet-solana/guides/account-management', type: 'page' },
              { name: 'Check Balances', url: '/sdk/wallet-modules/wallet-solana/guides/check-balances', type: 'page' },
              { name: 'Send SOL', url: '/sdk/wallet-modules/wallet-solana/guides/send-transactions', type: 'page' },
              { name: 'Transfer SPL Tokens', url: '/sdk/wallet-modules/wallet-solana/guides/transfer-tokens', type: 'page' },
              { name: 'Sign and Verify Messages', url: '/sdk/wallet-modules/wallet-solana/guides/sign-verify-messages', type: 'page' },
              { name: 'Error Handling', url: '/sdk/wallet-modules/wallet-solana/guides/error-handling', type: 'page' },
            ],
          },
          { name: 'Configuration', url: '/sdk/wallet-modules/wallet-solana/configuration', type: 'page' },
          { name: 'API Reference', url: '/sdk/wallet-modules/wallet-solana/api-reference', type: 'page' },
        ],
      },
      {
        name: 'wallet-spark', type: 'folder',
        index: { name: 'wallet-spark', url: '/sdk/wallet-modules/wallet-spark', type: 'page' },
        children: [
          { name: 'Usage', url: '/sdk/wallet-modules/wallet-spark/usage', type: 'page' },
          {
            name: 'Guides', type: 'folder', icon: resolveIcon('BookOpen'),
            children: [
              { name: 'Get Started', url: '/sdk/wallet-modules/wallet-spark/guides/get-started', type: 'page' },
              { name: 'Manage Accounts', url: '/sdk/wallet-modules/wallet-spark/guides/manage-accounts', type: 'page' },
              { name: 'Check Balances', url: '/sdk/wallet-modules/wallet-spark/guides/check-balances', type: 'page' },
              { name: 'Send and Transfer', url: '/sdk/wallet-modules/wallet-spark/guides/send-and-transfer', type: 'page' },
              { name: 'Lightning Payments', url: '/sdk/wallet-modules/wallet-spark/guides/lightning-payments', type: 'page' },
              { name: 'Deposits and Withdrawals', url: '/sdk/wallet-modules/wallet-spark/guides/deposits-and-withdrawals', type: 'page' },
              { name: 'Handle Errors', url: '/sdk/wallet-modules/wallet-spark/guides/handle-errors', type: 'page' },
            ],
          },
          { name: 'Configuration', url: '/sdk/wallet-modules/wallet-spark/configuration', type: 'page' },
          { name: 'API Reference', url: '/sdk/wallet-modules/wallet-spark/api-reference', type: 'page' },
        ],
      },
      {
        name: 'wallet-ton', type: 'folder',
        index: { name: 'wallet-ton', url: '/sdk/wallet-modules/wallet-ton', type: 'page' },
        children: [
          { name: 'Usage', url: '/sdk/wallet-modules/wallet-ton/usage', type: 'page' },
          {
            name: 'Guides', type: 'folder', icon: resolveIcon('BookOpen'),
            children: [
              { name: 'Get Started', url: '/sdk/wallet-modules/wallet-ton/guides/get-started', type: 'page' },
              { name: 'Manage Accounts', url: '/sdk/wallet-modules/wallet-ton/guides/manage-accounts', type: 'page' },
              { name: 'Check Balances', url: '/sdk/wallet-modules/wallet-ton/guides/check-balances', type: 'page' },
              { name: 'Send TON', url: '/sdk/wallet-modules/wallet-ton/guides/send-transactions', type: 'page' },
              { name: 'Transfer Jetton Tokens', url: '/sdk/wallet-modules/wallet-ton/guides/transfer-tokens', type: 'page' },
              { name: 'Sign and Verify Messages', url: '/sdk/wallet-modules/wallet-ton/guides/sign-verify-messages', type: 'page' },
              { name: 'Handle Errors', url: '/sdk/wallet-modules/wallet-ton/guides/handle-errors', type: 'page' },
            ],
          },
          { name: 'Configuration', url: '/sdk/wallet-modules/wallet-ton/configuration', type: 'page' },
          { name: 'API Reference', url: '/sdk/wallet-modules/wallet-ton/api-reference', type: 'page' },
        ],
      },
      {
        name: 'wallet-ton-gasless', type: 'folder',
        index: { name: 'wallet-ton-gasless', url: '/sdk/wallet-modules/wallet-ton-gasless', type: 'page' },
        children: [
          { name: 'Usage', url: '/sdk/wallet-modules/wallet-ton-gasless/usage', type: 'page' },
          {
            name: 'Guides', type: 'folder', icon: resolveIcon('BookOpen'),
            children: [
              { name: 'Get Started', url: '/sdk/wallet-modules/wallet-ton-gasless/guides/get-started', type: 'page' },
              { name: 'Manage Accounts', url: '/sdk/wallet-modules/wallet-ton-gasless/guides/manage-accounts', type: 'page' },
              { name: 'Check Balances', url: '/sdk/wallet-modules/wallet-ton-gasless/guides/check-balances', type: 'page' },
              { name: 'Send TON', url: '/sdk/wallet-modules/wallet-ton-gasless/guides/send-transactions', type: 'page' },
              { name: 'Transfer Jetton Tokens', url: '/sdk/wallet-modules/wallet-ton-gasless/guides/transfer-tokens', type: 'page' },
              { name: 'Sign and Verify Messages', url: '/sdk/wallet-modules/wallet-ton-gasless/guides/sign-verify-messages', type: 'page' },
              { name: 'Handle Errors', url: '/sdk/wallet-modules/wallet-ton-gasless/guides/handle-errors', type: 'page' },
            ],
          },
          { name: 'Configuration', url: '/sdk/wallet-modules/wallet-ton-gasless/configuration', type: 'page' },
          { name: 'API Reference', url: '/sdk/wallet-modules/wallet-ton-gasless/api-reference', type: 'page' },
        ],
      },
      {
        name: 'wallet-tron', type: 'folder',
        index: { name: 'wallet-tron', url: '/sdk/wallet-modules/wallet-tron', type: 'page' },
        children: [
          { name: 'Usage', url: '/sdk/wallet-modules/wallet-tron/usage', type: 'page' },
          {
            name: 'Guides', type: 'folder', icon: resolveIcon('BookOpen'),
            children: [
              { name: 'Get Started', url: '/sdk/wallet-modules/wallet-tron/guides/get-started', type: 'page' },
              { name: 'Manage Accounts', url: '/sdk/wallet-modules/wallet-tron/guides/manage-accounts', type: 'page' },
              { name: 'Check Balances', url: '/sdk/wallet-modules/wallet-tron/guides/check-balances', type: 'page' },
              { name: 'Send TRX', url: '/sdk/wallet-modules/wallet-tron/guides/send-transactions', type: 'page' },
              { name: 'Transfer TRC20 Tokens', url: '/sdk/wallet-modules/wallet-tron/guides/transfer-tokens', type: 'page' },
              { name: 'Sign and Verify Messages', url: '/sdk/wallet-modules/wallet-tron/guides/sign-verify-messages', type: 'page' },
              { name: 'Handle Errors', url: '/sdk/wallet-modules/wallet-tron/guides/handle-errors', type: 'page' },
            ],
          },
          { name: 'Configuration', url: '/sdk/wallet-modules/wallet-tron/configuration', type: 'page' },
          { name: 'API Reference', url: '/sdk/wallet-modules/wallet-tron/api-reference', type: 'page' },
        ],
      },
      {
        name: 'wallet-tron-gasfree', type: 'folder',
        index: { name: 'wallet-tron-gasfree', url: '/sdk/wallet-modules/wallet-tron-gasfree', type: 'page' },
        children: [
          { name: 'Usage', url: '/sdk/wallet-modules/wallet-tron-gasfree/usage', type: 'page' },
          {
            name: 'Guides', type: 'folder', icon: resolveIcon('BookOpen'),
            children: [
              { name: 'Get Started', url: '/sdk/wallet-modules/wallet-tron-gasfree/guides/get-started', type: 'page' },
              { name: 'Manage Accounts', url: '/sdk/wallet-modules/wallet-tron-gasfree/guides/manage-accounts', type: 'page' },
              { name: 'Check Balances', url: '/sdk/wallet-modules/wallet-tron-gasfree/guides/check-balances', type: 'page' },
              { name: 'Send TRX', url: '/sdk/wallet-modules/wallet-tron-gasfree/guides/send-transactions', type: 'page' },
              { name: 'Transfer TRC20 Tokens', url: '/sdk/wallet-modules/wallet-tron-gasfree/guides/transfer-tokens', type: 'page' },
              { name: 'Sign and Verify Messages', url: '/sdk/wallet-modules/wallet-tron-gasfree/guides/sign-verify-messages', type: 'page' },
              { name: 'Handle Errors', url: '/sdk/wallet-modules/wallet-tron-gasfree/guides/handle-errors', type: 'page' },
            ],
          },
          { name: 'Configuration', url: '/sdk/wallet-modules/wallet-tron-gasfree/configuration', type: 'page' },
          { name: 'API Reference', url: '/sdk/wallet-modules/wallet-tron-gasfree/api-reference', type: 'page' },
        ],
      },
    ],
  },
  {
    name: 'Swap Modules',
    type: 'folder',
    icon: resolveIcon('ArrowLeftRight'),
    index: {
      name: 'Swap Modules',
      url: '/sdk/swap-modules',
      type: 'page',
    },
    children: [
      {
        name: 'swap-velora-evm', type: 'folder',
        index: { name: 'swap-velora-evm', url: '/sdk/swap-modules/swap-velora-evm', type: 'page' },
        children: [
          { name: 'Usage', url: '/sdk/swap-modules/swap-velora-evm/usage', type: 'page' },
          {
            name: 'Guides', type: 'folder', icon: resolveIcon('BookOpen'),
            children: [
              { name: 'Get Started', url: '/sdk/swap-modules/swap-velora-evm/guides/get-started', type: 'page' },
              { name: 'Execute Swaps', url: '/sdk/swap-modules/swap-velora-evm/guides/execute-swaps', type: 'page' },
              { name: 'Get Swap Quotes', url: '/sdk/swap-modules/swap-velora-evm/guides/get-swap-quotes', type: 'page' },
              { name: 'Handle Errors', url: '/sdk/swap-modules/swap-velora-evm/guides/handle-errors', type: 'page' },
            ],
          },
          { name: 'Configuration', url: '/sdk/swap-modules/swap-velora-evm/configuration', type: 'page' },
          { name: 'API Reference', url: '/sdk/swap-modules/swap-velora-evm/api-reference', type: 'page' },
        ],
      },
    ],
  },
  {
    name: 'Bridge Modules',
    type: 'folder',
    icon: resolveIcon('Link'),
    index: {
      name: 'Bridge Modules',
      url: '/sdk/bridge-modules',
      type: 'page',
    },
    children: [
      {
        name: 'bridge-usdt0-evm', type: 'folder',
        index: { name: 'bridge-usdt0-evm', url: '/sdk/bridge-modules/bridge-usdt0-evm', type: 'page' },
        children: [
          { name: 'Usage', url: '/sdk/bridge-modules/bridge-usdt0-evm/usage', type: 'page' },
          {
            name: 'Guides', type: 'folder', icon: resolveIcon('BookOpen'),
            children: [
              { name: 'Get Started', url: '/sdk/bridge-modules/bridge-usdt0-evm/guides/get-started', type: 'page' },
              { name: 'Bridge Tokens', url: '/sdk/bridge-modules/bridge-usdt0-evm/guides/bridge-tokens', type: 'page' },
              { name: 'Bridge with ERC-4337', url: '/sdk/bridge-modules/bridge-usdt0-evm/guides/bridge-with-4337', type: 'page' },
              { name: 'Bridge Cross-Ecosystem', url: '/sdk/bridge-modules/bridge-usdt0-evm/guides/bridge-cross-ecosystem', type: 'page' },
              { name: 'Handle Errors', url: '/sdk/bridge-modules/bridge-usdt0-evm/guides/handle-errors', type: 'page' },
            ],
          },
          { name: 'Configuration', url: '/sdk/bridge-modules/bridge-usdt0-evm/configuration', type: 'page' },
          { name: 'API Reference', url: '/sdk/bridge-modules/bridge-usdt0-evm/api-reference', type: 'page' },
        ],
      },
    ],
  },
  {
    name: 'Lending Modules',
    type: 'folder',
    icon: resolveIcon('Banknote'),
    index: {
      name: 'Lending Modules',
      url: '/sdk/lending-modules',
      type: 'page',
    },
    children: [
      {
        name: 'Aave EVM', type: 'folder',
        index: { name: 'Aave EVM', url: '/sdk/lending-modules/lending-aave-evm', type: 'page' },
        children: [
          { name: 'Usage', url: '/sdk/lending-modules/lending-aave-evm/usage', type: 'page' },
          {
            name: 'Guides', type: 'folder', icon: resolveIcon('BookOpen'),
            children: [
              { name: 'Get Started', url: '/sdk/lending-modules/lending-aave-evm/guides/get-started', type: 'page' },
              { name: 'Lending Operations', url: '/sdk/lending-modules/lending-aave-evm/guides/lending-operations', type: 'page' },
              { name: 'Handle Errors', url: '/sdk/lending-modules/lending-aave-evm/guides/handle-errors', type: 'page' },
            ],
          },
          { name: 'Configuration', url: '/sdk/lending-modules/lending-aave-evm/configuration', type: 'page' },
          { name: 'API Reference', url: '/sdk/lending-modules/lending-aave-evm/api-reference', type: 'page' },
        ],
      },
      {
        name: 'Morpho EVM', type: 'folder',
        index: { name: 'Morpho EVM', url: '/sdk/lending-modules/lending-morpho-evm', type: 'page' },
        children: [
          { name: 'Usage', url: '/sdk/lending-modules/lending-morpho-evm/usage', type: 'page' },
          {
            name: 'Guides', type: 'folder', icon: resolveIcon('BookOpen'),
            children: [
              { name: 'Get Started', url: '/sdk/lending-modules/lending-morpho-evm/guides/get-started', type: 'page' },
              { name: 'Lending Operations', url: '/sdk/lending-modules/lending-morpho-evm/guides/lending-operations', type: 'page' },
              { name: 'Handle Errors', url: '/sdk/lending-modules/lending-morpho-evm/guides/handle-errors', type: 'page' },
            ],
          },
          { name: 'Configuration', url: '/sdk/lending-modules/lending-morpho-evm/configuration', type: 'page' },
          { name: 'API Reference', url: '/sdk/lending-modules/lending-morpho-evm/api-reference', type: 'page' },
        ],
      },
    ],
  },
  {
    name: 'Fiat Modules',
    type: 'folder',
    icon: resolveIcon('DollarSign'),
    index: {
      name: 'Fiat Modules',
      url: '/sdk/fiat-modules',
      type: 'page',
    },
    children: [
      {
        name: 'fiat-moonpay', type: 'folder',
        index: { name: 'fiat-moonpay', url: '/sdk/fiat-modules/fiat-moonpay', type: 'page' },
        children: [
          { name: 'Usage', url: '/sdk/fiat-modules/fiat-moonpay/usage', type: 'page' },
          {
            name: 'Guides', type: 'folder', icon: resolveIcon('BookOpen'),
            children: [
              { name: 'Get Started', url: '/sdk/fiat-modules/fiat-moonpay/guides/get-started', type: 'page' },
              { name: 'Buy and Sell', url: '/sdk/fiat-modules/fiat-moonpay/guides/buy-and-sell', type: 'page' },
              { name: 'Manage Transactions', url: '/sdk/fiat-modules/fiat-moonpay/guides/manage-transactions', type: 'page' },
            ],
          },
          { name: 'Configuration', url: '/sdk/fiat-modules/fiat-moonpay/configuration', type: 'page' },
          { name: 'API Reference', url: '/sdk/fiat-modules/fiat-moonpay/api-reference', type: 'page' },
        ],
      },
    ],
  },
  { name: 'Community Modules', url: '/sdk/community-modules', type: 'page', icon: resolveIcon('Users') },
  {
    type: 'separator',
    name: 'UI Kits',
  },
  {
    name: 'React Native UI Kit',
    type: 'folder',
    icon: resolveIcon('Smartphone'),
    index: {
      name: 'React Native UI Kit',
      url: '/ui-kits/react-native-ui-kit',
      type: 'page',
    },
    children: [
      { name: 'Get Started', url: '/ui-kits/react-native-ui-kit/get-started', type: 'page', icon: resolveIcon('Rocket') },
      { name: 'API Reference', url: '/ui-kits/react-native-ui-kit/api-reference', type: 'page', icon: resolveIcon('Code') },
      { name: 'Theming', url: '/ui-kits/react-native-ui-kit/theming', type: 'page', icon: resolveIcon('Palette') },
    ],
  },
  {
    type: 'separator',
    name: 'Examples & Starters',
  },
  { name: 'React Native Starter', url: '/examples-and-starters/react-native-starter', type: 'page', icon: resolveIcon('Smartphone') },
  {
    type: 'separator',
    name: 'Tools',
  },
  {
    name: 'Indexer API',
    type: 'folder',
    icon: resolveIcon('Database'),
    index: {
      name: 'Indexer API',
      url: '/tools/indexer-api',
      type: 'page',
    },
    children: [
      { name: 'Get Started', url: '/tools/indexer-api/get-started', type: 'page', icon: resolveIcon('Rocket') },
      { name: 'API Reference', url: '/tools/indexer-api/api-reference', type: 'page', icon: resolveIcon('Code') },
    ],
  },
  {
    name: 'Secret Manager',
    type: 'folder',
    icon: resolveIcon('KeyRound'),
    index: {
      name: 'Secret Manager',
      url: '/tools/secret-manager',
      type: 'page',
    },
    children: [
      { name: 'Configuration', url: '/tools/secret-manager/configuration', type: 'page', icon: resolveIcon('Settings') },
      { name: 'API Reference', url: '/tools/secret-manager/api-reference', type: 'page', icon: resolveIcon('Code') },
    ],
  },
  {
    name: 'Price Rates',
    type: 'folder',
    icon: resolveIcon('TrendingUp'),
    index: {
      name: 'Price Rates',
      url: '/tools/price-rates',
      type: 'page',
    },
    children: [
      { name: 'Configuration', url: '/tools/price-rates/configuration', type: 'page', icon: resolveIcon('Settings') },
      { name: 'API Reference', url: '/tools/price-rates/api-reference', type: 'page', icon: resolveIcon('Code') },
    ],
  },
  { name: 'Create WDK Module', url: '/tools/create-wdk-module', type: 'page', icon: resolveIcon('Hammer') },
  {
    name: 'React Native Core',
    type: 'folder',
    icon: resolveIcon('Smartphone'),
    index: {
      name: 'React Native Core',
      url: '/tools/react-native-core',
      type: 'page',
    },
    children: [
      { name: 'API Reference', url: '/tools/react-native-core/api-reference', type: 'page', icon: resolveIcon('Code') },
    ],
  },
  {
    name: 'React Native Secure Storage',
    type: 'folder',
    icon: resolveIcon('LockKeyhole'),
    index: {
      name: 'React Native Secure Storage',
      url: '/tools/react-native-secure-storage',
      type: 'page',
    },
    children: [
      { name: 'Configuration', url: '/tools/react-native-secure-storage/configuration', type: 'page', icon: resolveIcon('Settings') },
      { name: 'API Reference', url: '/tools/react-native-secure-storage/api-reference', type: 'page', icon: resolveIcon('Code') },
    ],
  },
  {
    name: 'Failover Provider',
    type: 'folder',
    icon: resolveIcon('ShieldCheck'),
    index: {
      name: 'Failover Provider',
      url: '/tools/failover-provider',
      type: 'page',
    },
    children: [
      { name: 'Configuration', url: '/tools/failover-provider/configuration', type: 'page', icon: resolveIcon('Settings') },
      { name: 'API Reference', url: '/tools/failover-provider/api-reference', type: 'page', icon: resolveIcon('Code') },
    ],
  },
  {
    name: 'Pear Worklet WDK',
    type: 'folder',
    icon: resolveIcon('Cpu'),
    index: {
      name: 'Pear Worklet WDK',
      url: '/tools/pear-wrk-wdk',
      type: 'page',
    },
    children: [
      { name: 'Configuration', url: '/tools/pear-wrk-wdk/configuration', type: 'page', icon: resolveIcon('Settings') },
      { name: 'API Reference', url: '/tools/pear-wrk-wdk/api-reference', type: 'page', icon: resolveIcon('Code') },
    ],
  },
  {
    name: 'WDK Utils',
    type: 'folder',
    icon: resolveIcon('Wrench'),
    index: {
      name: 'WDK Utils',
      url: '/tools/wdk-utils',
      type: 'page',
    },
    children: [
      { name: 'Configuration', url: '/tools/wdk-utils/configuration', type: 'page', icon: resolveIcon('Settings') },
      { name: 'API Reference', url: '/tools/wdk-utils/api-reference', type: 'page', icon: resolveIcon('Code') },
    ],
  },
  {
    name: 'Worklet Bundler',
    type: 'folder',
    icon: resolveIcon('Package'),
    index: {
      name: 'Worklet Bundler',
      url: '/tools/worklet-bundler',
      type: 'page',
    },
    children: [
      { name: 'Configuration', url: '/tools/worklet-bundler/configuration', type: 'page', icon: resolveIcon('Settings') },
      { name: 'API Reference', url: '/tools/worklet-bundler/api-reference', type: 'page', icon: resolveIcon('Code') },
    ],
  },
  {
    type: 'separator',
    name: 'Resources',
  },
  { name: 'Concepts', url: '/resources/concepts', type: 'page', icon: resolveIcon('GraduationCap') },
];
