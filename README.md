# WDK docs

Official documentation for the Wallet Development Kit (WDK) by Tether.

Live at: [docs.wdk.tether.io](https://docs.wdk.tether.io)

## Architecture

WDK docs website is a static website generated via SSG functionality from a Next.js+[Fumadocs](https://fumadocs.dev) application.


## Development

`@tetherto/docs-seo-*` is installed from GitHub Packages. Add a package-read
token to `.env.local`, then export it before installing dependencies:

```bash
cp .env.example .env.local
set -a && . ./.env.local && set +a
```

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The build outputs a fully static site to `dist/` and runs `@vahor/next-broken-links` to validate all internal links post-build.

Production builds should set `NEXT_PUBLIC_DOCS_ORIGIN=https://docs.wdk.tether.io`
so canonical URLs, sitemap entries, Open Graph images, Twitter cards, and JSON-LD
use the public docs origin.

## SEO

The docs site uses `@tetherto/docs-seo-*` for centralized SEO state, metadata,
robots, sitemap, JSON-LD, frontmatter validation, and Takumi-generated Open
Graph images.

Important environment variables:

- `GITHUB_TOKEN`: required for `npm install`; classic PAT or CI token with `read:packages`.
- `NEXT_PUBLIC_DOCS_ORIGIN`: production docs origin for absolute SEO URLs.
- `NEXT_PUBLIC_DOCS_PUBLISHER_LOGO_URL`: optional HTTPS logo for JSON-LD publisher data.
- `SKIP_OG_BUILD=1`: skip the Takumi prebuild and use `/og-default.png`.
- `DOCS_OG_SITE_LABEL` / `DOCS_OG_CONCURRENCY`: tune OG generation.
- `DOCS_SEO_QUIET_GENERATED=1`: suppress warnings for generated/inferred fields.
- `DOCS_SEO_SILENT=1`: suppress all SEO warnings.

## Link Checking

```bash
# Comprehensive markdown-level link checker (internal + external + anchors + assets)
node scripts/check-links.mjs

# Internal-only (fast, no network)
LINK_CHECK_EXTERNAL=false node scripts/check-links.mjs
```

## License

Apache-2.0
