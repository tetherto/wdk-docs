"use client";

import Link from "next/link";
import { ArrowRight, Check, RotateCcw } from "lucide-react";
import * as React from "react";

type ChainFilter =
  | "all"
  | "evm"
  | "bitcoin"
  | "lightning"
  | "ton"
  | "tron"
  | "solana"
  | "rgb"
  | "cosmos";

type GoalFilter =
  | "all"
  | "standard"
  | "gasless"
  | "lightning"
  | "assets"
  | "cosmos";

type WalletModule = {
  id: string;
  label: string;
  chain: ChainFilter;
  goals: GoalFilter[];
  packageName: string;
  docsHref: string;
  apiHref?: string;
  bestFor: string;
  chooseWhen: string[];
  note?: string;
  maintainer?: string;
};

const chainOptions: Array<{ value: ChainFilter; label: string }> = [
  { value: "all", label: "Any chain" },
  { value: "evm", label: "EVM" },
  { value: "bitcoin", label: "Bitcoin" },
  { value: "lightning", label: "Lightning" },
  { value: "ton", label: "TON" },
  { value: "tron", label: "TRON" },
  { value: "solana", label: "Solana" },
  { value: "rgb", label: "RGB" },
  { value: "cosmos", label: "Cosmos" },
];

const goalOptions: Array<{ value: GoalFilter; label: string }> = [
  { value: "all", label: "Any wallet" },
  { value: "standard", label: "Standard wallet" },
  { value: "gasless", label: "Gasless or smart account" },
  { value: "lightning", label: "Lightning payments" },
  { value: "assets", label: "RGB assets" },
  { value: "cosmos", label: "Cosmos chains" },
];

const defaultChainFilter: ChainFilter = "evm";
const defaultGoalFilter: GoalFilter = "standard";

const walletModules: WalletModule[] = [
  {
    id: "evm-standard",
    label: "Standard EVM",
    chain: "evm",
    goals: ["standard"],
    packageName: "@tetherto/wdk-wallet-evm",
    docsHref: "/sdk/wallet-modules/wallet-evm",
    apiHref: "/sdk/wallet-modules/wallet-evm/api-reference",
    bestFor: "Externally owned accounts on Ethereum and EVM-compatible chains.",
    chooseWhen: [
      "You want the normal EVM account model.",
      "Users can pay gas with the chain native token.",
      "You need EVM transfers, token transfers, signing, and balances.",
    ],
  },
  {
    id: "evm-4337",
    label: "Smart accounts (ERC-4337)",
    chain: "evm",
    goals: ["gasless"],
    packageName: "@tetherto/wdk-wallet-evm-erc4337",
    docsHref: "/sdk/wallet-modules/wallet-evm-erc-4337",
    apiHref: "/sdk/wallet-modules/wallet-evm-erc-4337/api-reference",
    bestFor: "Account abstraction flows that submit UserOperations through a bundler.",
    chooseWhen: [
      "You need smart accounts instead of plain EOAs.",
      "You plan to use bundler and paymaster infrastructure.",
      "Your product needs sponsored or token-paid transaction flows.",
    ],
  },
  {
    id: "evm-7702",
    label: "EIP-7702 accounts",
    chain: "evm",
    goals: ["gasless"],
    packageName: "@tetherto/wdk-wallet-evm-7702-gasless",
    docsHref: "/sdk/wallet-modules/wallet-evm-7702-gasless",
    apiHref: "/sdk/wallet-modules/wallet-evm-7702-gasless/api-reference",
    bestFor: "EOA-based EIP-7702 delegation with ERC-4337 UserOperation submission.",
    chooseWhen: [
      "You need the user to keep an EOA address.",
      "Your target chain supports the required EIP-7702 and ERC-4337 flow.",
      "You can provide RPC, bundler, paymaster, and delegation configuration.",
    ],
  },
  {
    id: "bitcoin",
    label: "Bitcoin",
    chain: "bitcoin",
    goals: ["standard"],
    packageName: "@tetherto/wdk-wallet-btc",
    docsHref: "/sdk/wallet-modules/wallet-btc",
    apiHref: "/sdk/wallet-modules/wallet-btc/api-reference",
    bestFor: "Bitcoin SegWit wallet flows.",
    chooseWhen: [
      "You need BTC addresses, balances, transfers, and transaction history.",
      "Your app does not need Lightning routing.",
      "Your wallet flow is native Bitcoin rather than RGB assets.",
    ],
  },
  {
    id: "spark",
    label: "Lightning (Spark)",
    chain: "lightning",
    goals: ["lightning"],
    packageName: "@tetherto/wdk-wallet-spark",
    docsHref: "/sdk/wallet-modules/wallet-spark",
    apiHref: "/sdk/wallet-modules/wallet-spark/api-reference",
    bestFor: "Spark wallets with Lightning payment support.",
    chooseWhen: [
      "You need Lightning payments through Spark.",
      "You need deposit and withdrawal flows for a Spark wallet.",
      "Your Bitcoin use case needs faster payment routing than base-layer BTC.",
    ],
  },
  {
    id: "ton-standard",
    label: "Standard TON",
    chain: "ton",
    goals: ["standard"],
    packageName: "@tetherto/wdk-wallet-ton",
    docsHref: "/sdk/wallet-modules/wallet-ton",
    apiHref: "/sdk/wallet-modules/wallet-ton/api-reference",
    bestFor: "TON wallets where users pay regular TON fees.",
    chooseWhen: [
      "You need TON addresses, balances, transfers, and Jetton support.",
      "Your app does not need gasless Jetton transfer flows.",
      "Users can hold enough TON for transaction fees.",
    ],
  },
  {
    id: "ton-gasless",
    label: "Gasless TON",
    chain: "ton",
    goals: ["gasless"],
    packageName: "@tetherto/wdk-wallet-ton-gasless",
    docsHref: "/sdk/wallet-modules/wallet-ton-gasless",
    apiHref: "/sdk/wallet-modules/wallet-ton-gasless/api-reference",
    bestFor: "TON Jetton transfer flows that avoid requiring users to hold TON for gas.",
    chooseWhen: [
      "You need gasless Jetton transfers.",
      "Your app is designed around sponsor or relayer-backed TON flows.",
      "You want TON support but do not want gas funding to block first use.",
    ],
  },
  {
    id: "tron-standard",
    label: "Standard TRON",
    chain: "tron",
    goals: ["standard"],
    packageName: "@tetherto/wdk-wallet-tron",
    docsHref: "/sdk/wallet-modules/wallet-tron",
    apiHref: "/sdk/wallet-modules/wallet-tron/api-reference",
    bestFor: "TRON wallets where users pay standard network costs.",
    chooseWhen: [
      "You need TRX and TRC20 wallet operations.",
      "Users can handle normal TRON resource or fee requirements.",
      "You do not need gasfree TRC20 transfer flows.",
    ],
  },
  {
    id: "tron-gasfree",
    label: "Gasfree TRON",
    chain: "tron",
    goals: ["gasless"],
    packageName: "@tetherto/wdk-wallet-tron-gasfree",
    docsHref: "/sdk/wallet-modules/wallet-tron-gasfree",
    apiHref: "/sdk/wallet-modules/wallet-tron-gasfree/api-reference",
    bestFor: "TRON applications that need gasfree TRC20 transfers.",
    chooseWhen: [
      "You are building a TRC20 transfer flow.",
      "You want users to transfer without managing TRON gas/resources directly.",
      "Your app can provide the required gasfree configuration.",
    ],
  },
  {
    id: "solana",
    label: "Solana",
    chain: "solana",
    goals: ["standard"],
    packageName: "@tetherto/wdk-wallet-solana",
    docsHref: "/sdk/wallet-modules/wallet-solana",
    apiHref: "/sdk/wallet-modules/wallet-solana/api-reference",
    bestFor: "Solana wallets with SOL and SPL token support.",
    chooseWhen: [
      "You need Solana addresses, balances, transfers, and message signing.",
      "Your app is not using a separate gasless Solana module.",
      "You want the standard Solana wallet integration.",
    ],
  },
  {
    id: "rgb",
    label: "RGB",
    chain: "rgb",
    goals: ["assets"],
    packageName: "@utexo/wdk-wallet-rgb",
    docsHref: "/sdk/community-modules/wdk-wallet-rgb",
    apiHref: "/sdk/community-modules/wdk-wallet-rgb/api-reference",
    bestFor: "RGB assets on Bitcoin with local RGB wallet state.",
    chooseWhen: [
      "You need RGB asset issuance, balances, or transfers.",
      "Your app can persist RGB state in an app-private data directory.",
      "You are comfortable using an independently maintained module.",
    ],
    maintainer: "UTEXO",
  },
  {
    id: "cosmos",
    label: "Cosmos",
    chain: "cosmos",
    goals: ["cosmos"],
    packageName: "@base58-io/wdk-wallet-cosmos",
    docsHref: "/sdk/community-modules/wdk-wallet-cosmos",
    apiHref: "/sdk/community-modules/wdk-wallet-cosmos/api-reference",
    bestFor: "Cosmos-compatible chains with Bech32 accounts and RPC-backed transfers.",
    chooseWhen: [
      "You need a Cosmos-compatible wallet module.",
      "You want chain-registry or custom RPC endpoint configuration.",
      "You are comfortable using an independently maintained module.",
    ],
    maintainer: "Base58",
  },
];

function FilterButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={[
        "min-h-10 rounded-md border px-3 py-2 text-left text-sm transition-colors",
        active
          ? "border-[#FF6600] bg-[#FF6600] text-white"
          : "border-fd-border bg-fd-background text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export function WalletModuleChooser() {
  const [chain, setChain] = React.useState<ChainFilter>(defaultChainFilter);
  const [goal, setGoal] = React.useState<GoalFilter>(defaultGoalFilter);

  const results = walletModules.filter((module) => {
    const chainMatch = chain === "all" || module.chain === chain;
    const goalMatch = goal === "all" || module.goals.includes(goal);
    return chainMatch && goalMatch;
  });

  return (
    <div className="not-prose my-6 rounded-lg border border-fd-border bg-fd-card">
      <div className="border-b border-fd-border p-4 sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-fd-foreground">
              Wallet module chooser
            </p>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-fd-muted-foreground">
              Pick the chain and account model you need. The chooser narrows the
              module list and links to the matching docs and API reference.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setChain(defaultChainFilter);
              setGoal(defaultGoalFilter);
            }}
            className="inline-flex min-h-9 w-fit items-center gap-2 rounded-md border border-fd-border px-3 py-2 text-sm text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground"
          >
            <RotateCcw className="size-4" />
            Reset
          </button>
        </div>
      </div>

      <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="space-y-5">
          <section>
            <h2 className="text-sm font-semibold text-fd-foreground">
              1. Choose the chain
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {chainOptions.map((option) => (
                <FilterButton
                  key={option.value}
                  active={chain === option.value}
                  onClick={() => setChain(option.value)}
                >
                  {option.label}
                </FilterButton>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-fd-foreground">
              2. Choose the wallet model
            </h2>
            <div className="mt-3 grid gap-2">
              {goalOptions.map((option) => (
                <FilterButton
                  key={option.value}
                  active={goal === option.value}
                  onClick={() => setGoal(option.value)}
                >
                  {option.label}
                </FilterButton>
              ))}
            </div>
          </section>
        </div>

        <section>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-fd-foreground">
              3. Recommended modules
            </h2>
            <span className="rounded-md border border-fd-border px-2 py-1 text-xs text-fd-muted-foreground">
              {results.length} result{results.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="mt-3 grid gap-3">
            {results.map((module) => (
              <article
                key={module.id}
                className="rounded-lg border border-fd-border bg-fd-background p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-fd-foreground">
                      {module.label}
                    </h3>
                    <p className="mt-1 text-sm text-fd-muted-foreground">
                      {module.bestFor}
                    </p>
                  </div>
                  {module.maintainer ? (
                    <span className="w-fit rounded-md border border-fd-border px-2 py-1 text-xs text-fd-muted-foreground">
                      Maintainer: {module.maintainer}
                    </span>
                  ) : null}
                </div>

                <p className="mt-3 rounded-md bg-fd-muted px-3 py-2 font-mono text-xs text-fd-muted-foreground">
                  {module.packageName}
                </p>

                <ul className="mt-3 space-y-2">
                  {module.chooseWhen.map((item) => (
                    <li key={item} className="flex gap-2 text-sm text-fd-muted-foreground">
                      <Check className="mt-0.5 size-4 shrink-0 text-[#FF6600]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={module.docsHref}
                    className="inline-flex min-h-9 items-center gap-2 rounded-md bg-[#FF6600] px-3 py-2 text-sm font-medium text-white hover:bg-[#e65c00]"
                  >
                    Open docs
                    <ArrowRight className="size-4" />
                  </Link>
                  {module.apiHref ? (
                    <Link
                      href={module.apiHref}
                      className="inline-flex min-h-9 items-center rounded-md border border-fd-border px-3 py-2 text-sm font-medium text-fd-foreground hover:bg-fd-accent"
                    >
                      API reference
                    </Link>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
