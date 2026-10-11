"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

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
          <div className="relative w-full sm:w-auto">
            <select
              id={id}
              value={provider}
              aria-describedby={descriptionId}
              onChange={(event) => {
                const value = event.target.value;
                if (value === "candide" || value === "pimlico") setProvider(value);
              }}
              className="min-h-10 w-full appearance-none rounded-md border border-fd-border bg-fd-background py-2 pl-3 pr-10 text-sm text-fd-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring sm:min-w-40 forced-colors:appearance-auto forced-colors:focus-visible:[outline:auto]"
            >
              <option value="candide">Candide</option>
              <option value="pimlico">Pimlico</option>
            </select>
            <ChevronDown
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 forced-colors:hidden"
            />
          </div>
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
