"use client";

import type { SharedProps } from "fumadocs-ui/components/dialog/search";
import {
  SearchDialog,
  SearchDialogContent,
  SearchDialogOverlay,
} from "fumadocs-ui/components/dialog/search";
import {
  InkeepEmbeddedSearch,
  type InkeepEmbeddedSearchProps,
} from "@inkeep/cxkit-react";
import { useEffect, useState } from "react";
import {
  ensureInkeepDevConsolePatched,
  installInkeepDomGuards,
  transformInkeepSource,
} from "@/lib/inkeep";

ensureInkeepDevConsolePatched();

const WDK_ORANGE = "#FF6501";

export default function CustomDialog(props: SharedProps) {
  const [mounted, setMounted] = useState(false);
  const [syncTarget, setSyncTarget] = useState<HTMLElement | null>(null);
  const { open, onOpenChange } = props;
  const inkeepApiKey = process.env.NEXT_PUBLIC_INKEEP_API_KEY?.trim() ?? "";
  // We do this because document is not available in the server
  useEffect(() => {
    setMounted(true);
    setSyncTarget(document.documentElement);
  }, []);

  useEffect(() => {
    return installInkeepDomGuards();
  }, []);

  if (!mounted || !syncTarget) return null;

  const config: InkeepEmbeddedSearchProps = {
    baseSettings: {
      apiKey: inkeepApiKey,
      primaryBrandColor: WDK_ORANGE,
      organizationDisplayName: "WDK",
      transformSource: transformInkeepSource,
      // ...optional settings
      colorMode: {
        sync: {
          target: syncTarget,
          attributes: ["class"],
          isDarkMode: (attributes) => !!attributes.class?.includes("dark"),
        },
      },
    },
    searchSettings: {
      // optional settings
    },
  };

  return (
    <SearchDialog
      open={open}
      onOpenChange={onOpenChange}
      search=""
      onSearchChange={() => undefined}
      isLoading={false}
    >
      <SearchDialogOverlay />
      <SearchDialogContent className="max-w-6xl p-0">
        <InkeepEmbeddedSearch {...config} />
      </SearchDialogContent>
    </SearchDialog>
  );
}
