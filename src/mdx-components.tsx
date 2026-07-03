import defaultMdxComponents from 'fumadocs-ui/mdx';
import { Mermaid } from '@/components/mermaid';
import type { MDXComponents } from 'mdx/types';
import * as TabsComponents from 'fumadocs-ui/components/tabs';
import * as StepComponents from 'fumadocs-ui/components/steps';
import { Callout } from 'fumadocs-ui/components/callout';
import { Accordion, Accordions } from 'fumadocs-ui/components/accordion';
import * as React from "react";
import Link from "next/link";
import { GithubInfo } from 'fumadocs-ui/components/github-info';
import { CustomTabs, CustomTabsItem } from "@/components/custom-tabs";
import { Embed } from '@/components/embed';
import { ImageCard, ImageCards } from '@/components/image-card';
import { FeaturedShowcaseProducts } from '@/components/showcase-products';
import { CommunityCards, GetInvolvedCards, SupportCards } from '@/components/support-cards';
import { WalletModuleChooser } from '@/components/wallet-module-chooser';

function WrapCode({ children }: { children: React.ReactNode }) {
  return <div className="fd-code-wrap">{children}</div>;
}

function ButtonLink({
  href,
  children,
  className = "",
  ...props
}: React.ComponentProps<typeof Link>) {
  return (
    <Link
      href={href}
      className={[
        "inline-flex items-center justify-center",
        "rounded-md px-3 py-1.5 text-sm font-medium",
        "transition-opacity hover:opacity-90",
        "bg-fd-primary text-fd-primary-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring",
        "focus-visible:ring-offset-2 focus-visible:ring-offset-fd-background",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </Link>
  );
}

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    Mermaid,
    WrapCode,
    ButtonLink,
    GithubInfo,
    Callout,
    Accordion,
    Accordions,
    Embed,
    ImageCard,
    ImageCards,
    FeaturedShowcaseProducts,
    CommunityCards,
    GetInvolvedCards,
    SupportCards,
    WalletModuleChooser,
    ...TabsComponents,
    Tabs: CustomTabs,
    Tab: CustomTabsItem,
    ...StepComponents,
    ...components,
  };
}
