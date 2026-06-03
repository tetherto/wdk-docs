# WDK Docs

Official documentation for the Wallet Development Kit (WDK) by Tether.

Live at: [docs.wdk.tether.io](https://docs.wdk.tether.io)

## Stack

The docs site is a static Next.js application built with [Fumadocs](https://fumadocs.dev).

- Docs content lives in `content/docs/**/*.mdx`.
- Sidebar navigation is defined in `src/lib/custom-tree.ts`.
- Generated Fumadocs artifacts live under `.source/` and should not be edited directly.
- Generated search output at `public/api/search.json` is created by dev/build scripts and should not be committed unless the project intentionally starts tracking it.

## Prerequisites

- Node.js 22 or newer.
- npm.
- A GitHub token with `read:packages` access for installing `@tetherto/docs-seo-*` from GitHub Packages.

## Setup

Copy the local environment template and add your package-read token:

```bash
cp .env.example .env.local
```

Set `GITHUB_TOKEN` in `.env.local`, then export it before installing dependencies:

```bash
set -a && . ./.env.local && set +a
npm install
```

## Local Preview

Start the local docs server:

```bash
npm run dev
```

The dev server runs on [http://localhost:3001](http://localhost:3001). The command generates the local search index first, then starts Next.js with Fumadocs.

Useful smoke-test routes:

- [http://localhost:3001/](http://localhost:3001/)
- [http://localhost:3001/overview/changelog/](http://localhost:3001/overview/changelog/)
- [http://localhost:3001/sdk/all-modules/](http://localhost:3001/sdk/all-modules/)
- [http://localhost:3001/sdk/swidge-modules/](http://localhost:3001/sdk/swidge-modules/)
- [http://localhost:3001/sdk/core-module/guides/protocol-integration/](http://localhost:3001/sdk/core-module/guides/protocol-integration/)

If port `3001` is already in use, stop the other process or run Next directly with another port:

```bash
DOCS_SEO_QUIET_GENERATED=1 NODE_OPTIONS='--import tsx/esm' npx next dev --turbo -p 3002
```

## Validation

Run these checks before opening or updating a PR:

```bash
git diff --check
npm run check:meta
LINK_CHECK_EXTERNAL=false npm run check:links
npm run build
```

Use the external link checker when network checks are required:

```bash
npm run check:links
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
npm run check:links

# Internal-only (fast, no network)
LINK_CHECK_EXTERNAL=false npm run check:links
```

## License

Apache-2.0
