import type { DocsSeoConfig } from '@tetherto/docs-seo-next';

export function getDocsSeoConfig(): DocsSeoConfig {
  const origin =
    process.env.NEXT_PUBLIC_DOCS_ORIGIN ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    'http://localhost:8080';

  return {
    metadataBase: new URL(origin),
    siteName: 'WDK Docs',
    imageSiteLabel: 'WDK',
    publisherName: 'Tether',
    publisherLogoUrl: process.env.NEXT_PUBLIC_DOCS_PUBLISHER_LOGO_URL,
    trailingSlash: true,
    staticOgImagePath: '/og-default.png',
  };
}
