import type { Node } from 'fumadocs-core/page-tree';
import { resolveIcon } from "@/lib/resolveIcon";

function separator(name: string): Node {
  return { type: 'separator', name };
}

function page(name: string, url: string, icon?: string): Node {
  return { name, url, type: 'page', icon: resolveIcon(icon) } as Node;
}

function folder(
  name: string,
  url: string,
  icon: string,
  children: Node[] = [],
  indexName = name,
): Node {
  return {
    name,
    type: 'folder',
    icon: resolveIcon(icon),
    index: {
      name: indexName,
      url,
      type: 'page',
    },
    children,
  } as Node;
}

function group(name: string, icon: string, children: Node[]): Node {
  return {
    name,
    type: 'folder',
    icon: resolveIcon(icon),
    children,
  } as Node;
}

const guides = (children: Node[]): Node => group('Guides', 'BookOpen', children);

const apiReference = (url: string): Node => page('API Reference', url, 'Code');
const configuration = (url: string): Node => page('Configuration', url, 'Settings');
const usage = (url: string): Node => page('Usage', url, 'Play');

export const customTree: Node[] = [
  separator('Overview'),
  page('Welcome', '/', 'Rocket'),
  page('About WDK', '/overview/about', 'Info'),
  page('Our Vision', '/overview/vision', 'Lightbulb'),
  page('Partner with WDK', '/overview/partner-program', 'Handshake'),
  page('Showcase', '/overview/showcase', 'Trophy'),

  separator('Start Building'),
  page('Node.js and Bare Quickstart', '/start-building/nodejs-bare-quickstart', 'Terminal'),
  page('React Native Quickstart', '/start-building/react-native-quickstart', 'Smartphone'),
  page('React Native Starter', '/examples-and-starters/react-native-starter', 'Smartphone'),

  separator('Foundation'),
  page('Understand WDK architecture', '/sdk/get-started', 'Network'),
  folder('Core SDK', '/sdk/core-module', 'Box', [
    usage('/sdk/core-module/usage'),
    guides([
      page('Getting Started', '/sdk/core-module/guides/getting-started'),
      page('Register Wallets', '/sdk/core-module/guides/wallet-registration'),
      page('Account Management', '/sdk/core-module/guides/account-management'),
      page('Send Transactions', '/sdk/core-module/guides/transactions'),
      page('Transaction Policies', '/sdk/core-module/guides/transaction-policies'),
      page('Protocol Integration', '/sdk/core-module/guides/protocol-integration'),
      page('Middleware', '/sdk/core-module/guides/middleware'),
      page('Error Handling', '/sdk/core-module/guides/error-handling'),
    ]),
    configuration('/sdk/core-module/configuration'),
    apiReference('/sdk/core-module/api-reference'),
  ]),
  page('All modules reference', '/sdk/all-modules', 'LayoutGrid'),

  separator('Wallets'),
  page('Which wallet module do I need?', '/sdk/wallet-modules/which-wallet-module', 'ListChecks'),
  page('Wallet module reference', '/sdk/wallet-modules', 'WalletCards'),
  group('EVM', 'Blocks', [
    folder('Standard EVM', '/sdk/wallet-modules/wallet-evm', 'Wallet', [
      usage('/sdk/wallet-modules/wallet-evm/usage'),
      guides([
        page('Getting Started', '/sdk/wallet-modules/wallet-evm/guides/getting-started'),
        page('Manage Accounts', '/sdk/wallet-modules/wallet-evm/guides/manage-accounts'),
        page('Check Balances', '/sdk/wallet-modules/wallet-evm/guides/check-balances'),
        page('Send Transactions', '/sdk/wallet-modules/wallet-evm/guides/send-transactions'),
        page('Transfer ERC-20 Tokens', '/sdk/wallet-modules/wallet-evm/guides/transfer-tokens'),
        page('Sign and Verify Messages', '/sdk/wallet-modules/wallet-evm/guides/sign-verify-messages'),
        page('Error Handling', '/sdk/wallet-modules/wallet-evm/guides/error-handling'),
      ]),
      configuration('/sdk/wallet-modules/wallet-evm/configuration'),
      apiReference('/sdk/wallet-modules/wallet-evm/api-reference'),
    ]),
    folder('Smart accounts (ERC-4337)', '/sdk/wallet-modules/wallet-evm-erc-4337', 'ShieldCheck', [
      usage('/sdk/wallet-modules/wallet-evm-erc-4337/usage'),
      guides([
        page('Get Started', '/sdk/wallet-modules/wallet-evm-erc-4337/guides/get-started'),
        page('Manage Accounts', '/sdk/wallet-modules/wallet-evm-erc-4337/guides/manage-accounts'),
        page('Check Balances', '/sdk/wallet-modules/wallet-evm-erc-4337/guides/check-balances'),
        page('Send Transactions', '/sdk/wallet-modules/wallet-evm-erc-4337/guides/send-transactions'),
        page('Transfer Tokens', '/sdk/wallet-modules/wallet-evm-erc-4337/guides/transfer-tokens'),
        page('Sign and Verify Messages', '/sdk/wallet-modules/wallet-evm-erc-4337/guides/sign-verify-messages'),
        page('Handle Errors', '/sdk/wallet-modules/wallet-evm-erc-4337/guides/handle-errors'),
      ]),
      configuration('/sdk/wallet-modules/wallet-evm-erc-4337/configuration'),
      apiReference('/sdk/wallet-modules/wallet-evm-erc-4337/api-reference'),
    ]),
    folder('EIP-7702 accounts', '/sdk/wallet-modules/wallet-evm-7702-gasless', 'BadgeCheck', [
      usage('/sdk/wallet-modules/wallet-evm-7702-gasless/usage'),
      guides([
        page('Get Started', '/sdk/wallet-modules/wallet-evm-7702-gasless/guides/get-started'),
        page('Manage Accounts', '/sdk/wallet-modules/wallet-evm-7702-gasless/guides/manage-accounts'),
        page('Check Balances', '/sdk/wallet-modules/wallet-evm-7702-gasless/guides/check-balances'),
        page('Send Transactions', '/sdk/wallet-modules/wallet-evm-7702-gasless/guides/send-transactions'),
        page('Transfer Tokens', '/sdk/wallet-modules/wallet-evm-7702-gasless/guides/transfer-tokens'),
        page('Sign and Verify Messages', '/sdk/wallet-modules/wallet-evm-7702-gasless/guides/sign-verify-messages'),
        page('Handle Errors', '/sdk/wallet-modules/wallet-evm-7702-gasless/guides/handle-errors'),
      ]),
      configuration('/sdk/wallet-modules/wallet-evm-7702-gasless/configuration'),
      apiReference('/sdk/wallet-modules/wallet-evm-7702-gasless/api-reference'),
    ]),
  ]),
  folder('Bitcoin', '/sdk/wallet-modules/wallet-btc', 'Bitcoin', [
    usage('/sdk/wallet-modules/wallet-btc/usage'),
    guides([
      page('Get Started', '/sdk/wallet-modules/wallet-btc/guides/get-started'),
      page('Manage Accounts', '/sdk/wallet-modules/wallet-btc/guides/manage-accounts'),
      page('Check Balances', '/sdk/wallet-modules/wallet-btc/guides/check-balances'),
      page('Send BTC', '/sdk/wallet-modules/wallet-btc/guides/send-transactions'),
      page('Transaction History', '/sdk/wallet-modules/wallet-btc/guides/get-transaction-history'),
      page('Sign and Verify Messages', '/sdk/wallet-modules/wallet-btc/guides/sign-verify-messages'),
      page('Handle Errors', '/sdk/wallet-modules/wallet-btc/guides/handle-errors'),
    ]),
    configuration('/sdk/wallet-modules/wallet-btc/configuration'),
    apiReference('/sdk/wallet-modules/wallet-btc/api-reference'),
  ]),
  folder('Lightning (Spark)', '/sdk/wallet-modules/wallet-spark', 'Zap', [
    usage('/sdk/wallet-modules/wallet-spark/usage'),
    guides([
      page('Get Started', '/sdk/wallet-modules/wallet-spark/guides/get-started'),
      page('Manage Accounts', '/sdk/wallet-modules/wallet-spark/guides/manage-accounts'),
      page('Check Balances', '/sdk/wallet-modules/wallet-spark/guides/check-balances'),
      page('Send and Transfer', '/sdk/wallet-modules/wallet-spark/guides/send-and-transfer'),
      page('Lightning Payments', '/sdk/wallet-modules/wallet-spark/guides/lightning-payments'),
      page('Deposits and Withdrawals', '/sdk/wallet-modules/wallet-spark/guides/deposits-and-withdrawals'),
      page('Handle Errors', '/sdk/wallet-modules/wallet-spark/guides/handle-errors'),
    ]),
    configuration('/sdk/wallet-modules/wallet-spark/configuration'),
    apiReference('/sdk/wallet-modules/wallet-spark/api-reference'),
  ]),
  group('TON', 'Circle', [
    folder('Standard TON', '/sdk/wallet-modules/wallet-ton', 'Wallet', [
      usage('/sdk/wallet-modules/wallet-ton/usage'),
      guides([
        page('Get Started', '/sdk/wallet-modules/wallet-ton/guides/get-started'),
        page('Manage Accounts', '/sdk/wallet-modules/wallet-ton/guides/manage-accounts'),
        page('Check Balances', '/sdk/wallet-modules/wallet-ton/guides/check-balances'),
        page('Send TON', '/sdk/wallet-modules/wallet-ton/guides/send-transactions'),
        page('Transfer Jetton Tokens', '/sdk/wallet-modules/wallet-ton/guides/transfer-tokens'),
        page('Sign and Verify Messages', '/sdk/wallet-modules/wallet-ton/guides/sign-verify-messages'),
        page('Handle Errors', '/sdk/wallet-modules/wallet-ton/guides/handle-errors'),
      ]),
      configuration('/sdk/wallet-modules/wallet-ton/configuration'),
      apiReference('/sdk/wallet-modules/wallet-ton/api-reference'),
    ]),
    folder('Gasless TON', '/sdk/wallet-modules/wallet-ton-gasless', 'Fuel', [
      usage('/sdk/wallet-modules/wallet-ton-gasless/usage'),
      guides([
        page('Get Started', '/sdk/wallet-modules/wallet-ton-gasless/guides/get-started'),
        page('Manage Accounts', '/sdk/wallet-modules/wallet-ton-gasless/guides/manage-accounts'),
        page('Check Balances', '/sdk/wallet-modules/wallet-ton-gasless/guides/check-balances'),
        page('Native Sends Unsupported', '/sdk/wallet-modules/wallet-ton-gasless/guides/send-transactions'),
        page('Transfer Jetton Tokens', '/sdk/wallet-modules/wallet-ton-gasless/guides/transfer-tokens'),
        page('Sign and Verify Messages', '/sdk/wallet-modules/wallet-ton-gasless/guides/sign-verify-messages'),
        page('Handle Errors', '/sdk/wallet-modules/wallet-ton-gasless/guides/handle-errors'),
      ]),
      configuration('/sdk/wallet-modules/wallet-ton-gasless/configuration'),
      apiReference('/sdk/wallet-modules/wallet-ton-gasless/api-reference'),
    ]),
  ]),
  group('TRON', 'Triangle', [
    folder('Standard TRON', '/sdk/wallet-modules/wallet-tron', 'Wallet', [
      usage('/sdk/wallet-modules/wallet-tron/usage'),
      guides([
        page('Get Started', '/sdk/wallet-modules/wallet-tron/guides/get-started'),
        page('Manage Accounts', '/sdk/wallet-modules/wallet-tron/guides/manage-accounts'),
        page('Check Balances', '/sdk/wallet-modules/wallet-tron/guides/check-balances'),
        page('Send TRX', '/sdk/wallet-modules/wallet-tron/guides/send-transactions'),
        page('Transfer TRC20 Tokens', '/sdk/wallet-modules/wallet-tron/guides/transfer-tokens'),
        page('Sign and Verify Messages', '/sdk/wallet-modules/wallet-tron/guides/sign-verify-messages'),
        page('Handle Errors', '/sdk/wallet-modules/wallet-tron/guides/handle-errors'),
      ]),
      configuration('/sdk/wallet-modules/wallet-tron/configuration'),
      apiReference('/sdk/wallet-modules/wallet-tron/api-reference'),
    ]),
    folder('Gasfree TRON', '/sdk/wallet-modules/wallet-tron-gasfree', 'Fuel', [
      usage('/sdk/wallet-modules/wallet-tron-gasfree/usage'),
      guides([
        page('Get Started', '/sdk/wallet-modules/wallet-tron-gasfree/guides/get-started'),
        page('Manage Accounts', '/sdk/wallet-modules/wallet-tron-gasfree/guides/manage-accounts'),
        page('Check Balances', '/sdk/wallet-modules/wallet-tron-gasfree/guides/check-balances'),
        page('Send TRX', '/sdk/wallet-modules/wallet-tron-gasfree/guides/send-transactions'),
        page('Transfer TRC20 Tokens', '/sdk/wallet-modules/wallet-tron-gasfree/guides/transfer-tokens'),
        page('Sign and Verify Messages', '/sdk/wallet-modules/wallet-tron-gasfree/guides/sign-verify-messages'),
        page('Handle Errors', '/sdk/wallet-modules/wallet-tron-gasfree/guides/handle-errors'),
      ]),
      configuration('/sdk/wallet-modules/wallet-tron-gasfree/configuration'),
      apiReference('/sdk/wallet-modules/wallet-tron-gasfree/api-reference'),
    ]),
  ]),
  group('Solana', 'Sun', [
    folder('Standard Solana', '/sdk/wallet-modules/wallet-solana', 'Wallet', [
      usage('/sdk/wallet-modules/wallet-solana/usage'),
      guides([
        page('Getting Started', '/sdk/wallet-modules/wallet-solana/guides/getting-started'),
        page('Manage Accounts', '/sdk/wallet-modules/wallet-solana/guides/account-management'),
        page('Check Balances', '/sdk/wallet-modules/wallet-solana/guides/check-balances'),
        page('Send SOL', '/sdk/wallet-modules/wallet-solana/guides/send-transactions'),
        page('Transfer SPL Tokens', '/sdk/wallet-modules/wallet-solana/guides/transfer-tokens'),
        page('Sign and Verify Messages', '/sdk/wallet-modules/wallet-solana/guides/sign-verify-messages'),
        page('Error Handling', '/sdk/wallet-modules/wallet-solana/guides/error-handling'),
      ]),
      configuration('/sdk/wallet-modules/wallet-solana/configuration'),
      apiReference('/sdk/wallet-modules/wallet-solana/api-reference'),
    ]),
    folder('Gasless Solana', '/sdk/wallet-modules/wallet-solana-gasless', 'Fuel', [
      usage('/sdk/wallet-modules/wallet-solana-gasless/usage'),
      guides([
        page('Get Started', '/sdk/wallet-modules/wallet-solana-gasless/guides/get-started'),
        page('Manage Accounts', '/sdk/wallet-modules/wallet-solana-gasless/guides/manage-accounts'),
        page('Check Balances', '/sdk/wallet-modules/wallet-solana-gasless/guides/check-balances'),
        page('Send Transactions', '/sdk/wallet-modules/wallet-solana-gasless/guides/send-transactions'),
        page('Transfer SPL Tokens', '/sdk/wallet-modules/wallet-solana-gasless/guides/transfer-tokens'),
        page('Sign and Verify Messages', '/sdk/wallet-modules/wallet-solana-gasless/guides/sign-verify-messages'),
        page('Handle Errors', '/sdk/wallet-modules/wallet-solana-gasless/guides/handle-errors'),
      ]),
      configuration('/sdk/wallet-modules/wallet-solana-gasless/configuration'),
      apiReference('/sdk/wallet-modules/wallet-solana-gasless/api-reference'),
    ]),
  ]),
  folder('RGB', '/sdk/community-modules/wdk-wallet-rgb', 'Palette', [
    apiReference('/sdk/community-modules/wdk-wallet-rgb/api-reference'),
  ]),
  folder('Cosmos', '/sdk/community-modules/wdk-wallet-cosmos', 'Orbit', [
    apiReference('/sdk/community-modules/wdk-wallet-cosmos/api-reference'),
  ]),

  separator('Swap and Bridge'),
  page('Swidge protocol interface', '/sdk/swidge-modules', 'Route'),
  folder('Rhino.fi', '/sdk/swidge-modules/swidge-rhinofi', 'Waypoints', [
    usage('/sdk/swidge-modules/swidge-rhinofi/usage'),
    configuration('/sdk/swidge-modules/swidge-rhinofi/configuration'),
    apiReference('/sdk/swidge-modules/swidge-rhinofi/api-reference'),
  ]),
  folder('Velora', '/sdk/swap-modules/swap-velora-evm', 'ArrowLeftRight', [
    usage('/sdk/swap-modules/swap-velora-evm/usage'),
    guides([
      page('Get Started', '/sdk/swap-modules/swap-velora-evm/guides/get-started'),
      page('Execute Swaps', '/sdk/swap-modules/swap-velora-evm/guides/execute-swaps'),
      page('Get Swap Quotes', '/sdk/swap-modules/swap-velora-evm/guides/get-swap-quotes'),
      page('Handle Errors', '/sdk/swap-modules/swap-velora-evm/guides/handle-errors'),
    ]),
    configuration('/sdk/swap-modules/swap-velora-evm/configuration'),
    apiReference('/sdk/swap-modules/swap-velora-evm/api-reference'),
  ]),
  folder('USDT0 bridge', '/sdk/bridge-modules/bridge-usdt0-evm', 'Waypoints', [
    usage('/sdk/bridge-modules/bridge-usdt0-evm/usage'),
    guides([
      page('Get Started', '/sdk/bridge-modules/bridge-usdt0-evm/guides/get-started'),
      page('Bridge Tokens', '/sdk/bridge-modules/bridge-usdt0-evm/guides/bridge-tokens'),
      page('Bridge with ERC-4337', '/sdk/bridge-modules/bridge-usdt0-evm/guides/bridge-with-4337'),
      page('Bridge Cross-Ecosystem', '/sdk/bridge-modules/bridge-usdt0-evm/guides/bridge-cross-ecosystem'),
      page('Handle Errors', '/sdk/bridge-modules/bridge-usdt0-evm/guides/handle-errors'),
    ]),
    configuration('/sdk/bridge-modules/bridge-usdt0-evm/configuration'),
    apiReference('/sdk/bridge-modules/bridge-usdt0-evm/api-reference'),
  ]),

  separator('Lending'),
  page('Lending module reference', '/sdk/lending-modules', 'Banknote'),
  folder('Aave', '/sdk/lending-modules/lending-aave-evm', 'Landmark', [
    usage('/sdk/lending-modules/lending-aave-evm/usage'),
    guides([
      page('Get Started', '/sdk/lending-modules/lending-aave-evm/guides/get-started'),
      page('Lending Operations', '/sdk/lending-modules/lending-aave-evm/guides/lending-operations'),
      page('Handle Errors', '/sdk/lending-modules/lending-aave-evm/guides/handle-errors'),
    ]),
    configuration('/sdk/lending-modules/lending-aave-evm/configuration'),
    apiReference('/sdk/lending-modules/lending-aave-evm/api-reference'),
  ]),
  folder('Morpho', '/sdk/lending-modules/lending-morpho-evm', 'Sprout', [
    usage('/sdk/lending-modules/lending-morpho-evm/usage'),
    guides([
      page('Get Started', '/sdk/lending-modules/lending-morpho-evm/guides/get-started'),
      page('Lending Operations', '/sdk/lending-modules/lending-morpho-evm/guides/lending-operations'),
      page('Handle Errors', '/sdk/lending-modules/lending-morpho-evm/guides/handle-errors'),
    ]),
    configuration('/sdk/lending-modules/lending-morpho-evm/configuration'),
    apiReference('/sdk/lending-modules/lending-morpho-evm/api-reference'),
  ]),

  separator('On-ramp and Off-ramp'),
  page('Fiat module reference', '/sdk/fiat-modules', 'DollarSign'),
  folder('MoonPay', '/sdk/fiat-modules/fiat-moonpay', 'CreditCard', [
    usage('/sdk/fiat-modules/fiat-moonpay/usage'),
    guides([
      page('Get Started', '/sdk/fiat-modules/fiat-moonpay/guides/get-started'),
      page('Buy and Sell', '/sdk/fiat-modules/fiat-moonpay/guides/buy-and-sell'),
      page('Manage Transactions', '/sdk/fiat-modules/fiat-moonpay/guides/manage-transactions'),
    ]),
    configuration('/sdk/fiat-modules/fiat-moonpay/configuration'),
    apiReference('/sdk/fiat-modules/fiat-moonpay/api-reference'),
  ]),

  separator('AI'),
  page('Build with AI', '/start-building/build-with-ai', 'Bot'),
  folder('WDK CLI', '/ai/wdk-cli', 'Terminal', [
    page('Get Started', '/ai/wdk-cli/get-started', 'Rocket'),
    configuration('/ai/wdk-cli/configuration'),
    page('Commands', '/ai/wdk-cli/commands', 'ListChecks'),
    page('MCP', '/ai/wdk-cli/mcp', 'Wand'),
  ]),
  folder('MCP Toolkit', '/ai/mcp-toolkit', 'Wand', [
    page('Get Started', '/ai/mcp-toolkit/get-started', 'Rocket'),
    configuration('/ai/mcp-toolkit/configuration'),
    apiReference('/ai/mcp-toolkit/api-reference'),
    page('LangChain Integration', '/ai/mcp-toolkit/langchain', 'Link'),
  ]),
  page('Agent Skills', '/ai/agent-skills', 'Brain'),
  page('OpenClaw', '/ai/openclaw', 'Cat'),
  page('x402', '/ai/x402', 'CreditCard'),

  separator('React Native'),
  folder('React Native Core', '/tools/react-native-core', 'Smartphone', [
    apiReference('/tools/react-native-core/api-reference'),
  ]),
  folder('React Native Secure Storage', '/tools/react-native-secure-storage', 'LockKeyhole', [
    configuration('/tools/react-native-secure-storage/configuration'),
    apiReference('/tools/react-native-secure-storage/api-reference'),
  ]),

  separator('UI Kits'),
  folder('React Native UI Kit', '/ui-kits/react-native-ui-kit', 'PanelsTopLeft', [
    page('Get Started', '/ui-kits/react-native-ui-kit/get-started', 'Rocket'),
    apiReference('/ui-kits/react-native-ui-kit/api-reference'),
    page('Theming', '/ui-kits/react-native-ui-kit/theming', 'Palette'),
  ]),

  separator('Tools and Infrastructure'),
  folder('Track balances and transactions', '/tools/indexer-api', 'Database', [
    page('Get Started', '/tools/indexer-api/get-started', 'Rocket'),
    apiReference('/tools/indexer-api/api-reference'),
  ]),
  folder('Manage wallet secrets safely', '/tools/secret-manager', 'KeyRound', [
    configuration('/tools/secret-manager/configuration'),
    apiReference('/tools/secret-manager/api-reference'),
  ]),
  folder('Fetch token prices', '/tools/price-rates', 'TrendingUp', [
    configuration('/tools/price-rates/configuration'),
    apiReference('/tools/price-rates/api-reference'),
    page('Pricing module reference', '/sdk/pricing-modules', 'LayoutGrid'),
    folder('CoinGecko HTTP', '/sdk/pricing-modules/pricing-coingecko-http', 'TrendingUp', [
      usage('/sdk/pricing-modules/pricing-coingecko-http/usage'),
      guides([
        page('Get Started', '/sdk/pricing-modules/pricing-coingecko-http/guides/get-started'),
        page('Fetch Current Prices', '/sdk/pricing-modules/pricing-coingecko-http/guides/fetch-current-prices'),
        page('Fetch Historical Prices', '/sdk/pricing-modules/pricing-coingecko-http/guides/fetch-historical-prices'),
        page('Handle Errors', '/sdk/pricing-modules/pricing-coingecko-http/guides/handle-errors'),
      ]),
      configuration('/sdk/pricing-modules/pricing-coingecko-http/configuration'),
      apiReference('/sdk/pricing-modules/pricing-coingecko-http/api-reference'),
    ]),
  ]),
  folder('Look up asset metadata', '/tools/asset-registry', 'Tags', [
    configuration('/tools/asset-registry/configuration'),
    apiReference('/tools/asset-registry/api-reference'),
  ]),
  folder('Add provider failover', '/tools/failover-provider', 'ShieldCheck', [
    configuration('/tools/failover-provider/configuration'),
    apiReference('/tools/failover-provider/api-reference'),
  ]),
  folder('Run WDK in a Pear worklet', '/tools/pear-wrk-wdk', 'Cpu', [
    configuration('/tools/pear-wrk-wdk/configuration'),
    apiReference('/tools/pear-wrk-wdk/api-reference'),
  ]),
  folder('Validate addresses and parse payment links', '/tools/wdk-utils', 'Wrench', [
    configuration('/tools/wdk-utils/configuration'),
    apiReference('/tools/wdk-utils/api-reference'),
  ]),
  folder('Bundle WDK for a Bare worklet', '/tools/worklet-bundler', 'Package', [
    configuration('/tools/worklet-bundler/configuration'),
    apiReference('/tools/worklet-bundler/api-reference'),
  ]),

  separator('Partners and Contributors'),
  page('Contribute a module to WDK', '/tools/create-wdk-module', 'Hammer'),

  separator('Resources'),
  page('Concepts', '/resources/concepts', 'GraduationCap'),
  page('Get Support', '/overview/support', 'CircleQuestionMark'),
  page('Changelog', '/overview/changelog', 'History'),
];
