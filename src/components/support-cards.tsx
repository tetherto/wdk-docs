import { FilePenLine, Github, Handshake, Mail } from "lucide-react";
import type { ComponentType } from "react";

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      width="24"
      height="24"
    >
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

type LinkCard = {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  href: string;
  cta: string;
  accent: boolean;
};

const supportCards: LinkCard[] = [
  {
    icon: DiscordIcon,
    title: "Discord Community",
    description: "Connect with developers, ask questions, share your projects",
    href: "https://discord.gg/arYXDhHB2w",
    cta: "Join Community",
    accent: true,
  },
  {
    icon: Github,
    title: "GitHub Issues",
    description: "Report bugs, request features, and get technical help",
    href: "https://github.com/tetherto/wdk-core",
    cta: "Open an Issue",
    accent: false,
  },
  {
    icon: Mail,
    title: "Email Contact",
    description:
      "For sensitive or private matters, contact our team directly",
    href: "mailto:wallet-info@tether.io",
    cta: "Send an email",
    accent: false,
  },
];

const communityCards: LinkCard[] = [
  {
    icon: FilePenLine,
    title: "Community Form",
    description: "Submit your WDK project for a documentation showcase review",
    href: "https://forms.gle/wmNwc5epxaa85u8a9",
    cta: "Submit Project",
    accent: true,
  },
  {
    icon: DiscordIcon,
    title: "#wdk-showcase",
    description: "Share your project directly with the community on Discord",
    href: "https://discordapp.com/channels/1425125849346216029/1427975123406688267",
    cta: "Open Channel",
    accent: false,
  },
];

const getInvolvedCards: LinkCard[] = [
  {
    icon: Handshake,
    title: "Partner with us",
    description: "Driving impact? Register your project for direct team access",
    href: "https://wkf.ms/4hd40JK",
    cta: "Apply now",
    accent: true,
  },
  {
    icon: Github,
    title: "GitHub Repos",
    description: "View source code, report issues, and contribute on GitHub",
    href: "https://github.com/tetherto/wdk",
    cta: "View repos",
    accent: false,
  },
  {
    icon: DiscordIcon,
    title: "Get Support",
    description: "Need help? Our community can help troubleshoot",
    href: "https://discord.gg/arYXDhHB2w",
    cta: "Join Discord",
    accent: false,
  },
];

function LinkCardGrid({ cards }: { cards: LinkCard[] }) {
  return (
    <div className="not-prose grid gap-4 sm:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <a
            key={card.title}
            href={card.href}
            target={card.href.startsWith("mailto:") ? undefined : "_blank"}
            rel="noopener noreferrer"
            className="group flex flex-col gap-3 rounded-lg border border-fd-border bg-fd-card p-5 transition-colors hover:bg-fd-accent/50"
          >
            <Icon className="size-6 text-fd-muted-foreground" />
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-fd-foreground">
                {card.title}
              </span>
              <span className="text-sm text-fd-muted-foreground leading-relaxed">
                {card.description}
              </span>
            </div>
            <span
              className={[
                "mt-auto inline-flex w-fit items-center rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                card.accent
                  ? "bg-fd-primary text-fd-primary-foreground hover:bg-fd-primary/90"
                  : "border border-fd-border text-fd-foreground hover:bg-fd-accent",
              ].join(" ")}
            >
              {card.cta}
            </span>
          </a>
        );
      })}
    </div>
  );
}

export function SupportCards() {
  return <LinkCardGrid cards={supportCards} />;
}

export function CommunityCards() {
  return <LinkCardGrid cards={communityCards} />;
}

export function GetInvolvedCards() {
  return <LinkCardGrid cards={getInvolvedCards} />;
}
