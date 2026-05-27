import { ExternalLinkIcon } from "lucide-react";

type ShowcaseProduct = {
  name: string;
  label: string;
  description: string;
  href: string;
  image: string;
  imageAlt: string;
  tags: string[];
  linkLabel: string;
};

const products: ShowcaseProduct[] = [
  {
    name: "Rumble Wallet",
    label: "Creator economy wallet",
    description:
      "A self-custodial wallet built on WDK and integrated into the Rumble ecosystem for creator tipping, direct payments, and Bitcoin, USD₮, and XAU₮ support.",
    href: "https://wallet.rumble.com/",
    image: "/assets/showcase/rumble-wallet-preview.png",
    imageAlt: "Rumble Wallet product preview",
    tags: ["Powered by WDK", "Creator tipping", "Self-custodial"],
    linkLabel: "Visit Rumble Wallet",
  },
  {
    name: "Tether Wallet",
    label: "The people's wallet",
    description:
      "A self-custodial wallet for storing, sending, and receiving USD₮, USA₮, XAU₮, and Bitcoin, focused on everyday transfers, remittances, and user-controlled keys.",
    href: "https://wallet.tether.io/",
    image: "/assets/showcase/tether-wallet-preview.webp",
    imageAlt: "Tether Wallet mobile app preview",
    tags: ["Self-custodial", "Digital dollars", "Bitcoin and gold"],
    linkLabel: "Visit Tether Wallet",
  },
];

export function FeaturedShowcaseProducts() {
  return (
    <div className="not-prose grid gap-4 md:grid-cols-2">
      {products.map((product) => (
        <article
          key={product.name}
          className="group flex h-full flex-col overflow-hidden rounded-lg border border-fd-border bg-fd-card transition-colors hover:bg-fd-accent/50"
        >
          <div className="flex aspect-[16/10] items-center justify-center overflow-hidden bg-fd-muted/60 p-4">
            <img
              src={product.image}
              alt={product.imageAlt}
              className="h-full w-full object-contain"
              loading="lazy"
            />
          </div>
          <div className="flex flex-1 flex-col gap-4 p-5">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium uppercase text-fd-muted-foreground">
                {product.label}
              </span>
              <h3 className="text-lg font-semibold leading-tight text-fd-foreground">
                {product.name}
              </h3>
              <p className="text-sm leading-relaxed text-fd-muted-foreground">
                {product.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-fd-border bg-fd-background px-2.5 py-1 text-xs font-medium text-fd-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>

              <a
                href={product.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto inline-flex w-fit items-center gap-2 rounded-md bg-fd-primary px-3 py-1.5 text-sm font-medium text-fd-primary-foreground transition-colors hover:bg-fd-primary/90"
              >
                <span>{product.linkLabel}</span>
                <ExternalLinkIcon className="size-3.5" aria-hidden="true" />
              </a>
          </div>
        </article>
      ))}
    </div>
  );
}
