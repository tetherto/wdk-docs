"use client";
import { RootProvider } from "fumadocs-ui/provider/next";
import dynamic from "next/dynamic";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { shouldUseNativeDocumentNavigation } from "@/lib/link-routing";

const hasInkeepApiKey = Boolean(process.env.NEXT_PUBLIC_INKEEP_API_KEY?.trim());
const SearchDialog = hasInkeepApiKey
  ? dynamic(() => import("@/components/inkeep-search"))
  : dynamic(() => import("@/components/search-dialog"));
const InkeepScript = hasInkeepApiKey
  ? dynamic(() => import("@/components/inkeep-script").then((mod) => mod.InkeepScript), {
      ssr: false,
    })
  : null;

type NoPrefetchLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  prefetch?: boolean;
};

function getHrefPathname(href: string | undefined): string | null {
  if (!href) return null;

  try {
    return new URL(href, window.location.origin).pathname;
  } catch {
    return null;
  }
}

function hasHash(href: string | undefined): boolean {
  if (!href) return false;

  try {
    return new URL(href, window.location.origin).hash.length > 0;
  } catch {
    return href.includes("#");
  }
}

function NoPrefetchLink({ prefetch: _prefetch, href, onClick, ...props }: NoPrefetchLinkProps) {
  const pathname = usePathname();

  const handleClick: React.MouseEventHandler<HTMLAnchorElement> = (event) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const hrefPathname = getHrefPathname(href);
    if (!hrefPathname || hasHash(href) || hrefPathname !== pathname) return;

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Work around static-export navigation edge cases by disabling prefetch globally.
  // Raw text artifacts are not application routes and must use a browser document request.
  if (!href) return <a onClick={handleClick} {...props} />;
  if (shouldUseNativeDocumentNavigation(href)) {
    return <a href={href} onClick={handleClick} {...props} />;
  }

  // Keep ordinary documentation routes client-side so sidebar state is preserved.
  return <NextLink href={href} onClick={handleClick} prefetch={false} {...props} />;
}

export function Provider({ children }: { children: ReactNode }) {
  return (
    <RootProvider
      components={{
        Link: NoPrefetchLink,
      }}
      search={{
        SearchDialog,
      }}
    >
      {children}
      {InkeepScript ? <InkeepScript /> : null}
    </RootProvider>
  );
}
