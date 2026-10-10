"use client";

import * as React from "react";

type Provider = "candide" | "pimlico";

const ProviderContext = React.createContext<Provider | undefined>(undefined);

export function ProviderSelector({ children }: { children: React.ReactNode }) {
  const [provider, setProvider] = React.useState<Provider>("candide");
  const id = React.useId();
  const descriptionId = `${id}-description`;

  return (
    <ProviderContext.Provider value={provider}>
      <div className="not-prose my-4 rounded-lg border border-fd-border p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <label htmlFor={id} className="text-sm font-medium">
            Bundler and paymaster
          </label>
          <select
            id={id}
            value={provider}
            aria-describedby={descriptionId}
            onChange={(event) => {
              const value = event.target.value;
              if (value === "candide" || value === "pimlico") setProvider(value);
            }}
            className="min-h-10 w-full rounded-md border border-fd-border bg-fd-background px-3 py-2 text-sm text-fd-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring sm:w-auto sm:min-w-40"
          >
            <option value="candide">Candide</option>
            <option value="pimlico">Pimlico</option>
          </select>
        </div>
        <p id={descriptionId} className="mt-2 text-sm text-fd-muted-foreground">
          This selection updates the setup and examples throughout this guide.
          Your chain RPC (<code>provider</code>) stays the same.
        </p>
      </div>
      {children}
    </ProviderContext.Provider>
  );
}

export function ProviderContent({
  value,
  children,
}: {
  value: Provider;
  children: React.ReactNode;
}) {
  const provider = React.useContext(ProviderContext);
  if (provider === undefined) {
    throw new Error("ProviderContent must be inside ProviderSelector.");
  }
  if (value !== "candide" && value !== "pimlico") {
    throw new Error(`Unknown provider: ${value}`);
  }

  // Unmount inactive examples so their copy buttons cannot copy another provider.
  return value === provider ? <>{children}</> : null;
}
