import {
  type DocsSeoConfig,
  getPageSeoState,
  type TetherPage,
} from '@tetherto/docs-seo-core';
import type { MetadataRoute } from 'next';

export type DocsSitemapSource = {
  getPages: (language?: string) => TetherPage[];
};

export function buildDocsSitemap(
  source: DocsSitemapSource,
  config: DocsSeoConfig,
): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const page of source.getPages()) {
    const state = getPageSeoState(page, config);
    if (!state.indexable) continue;
    entries.push({
      url: state.canonicalUrl,
      lastModified: state.lastModified,
      changeFrequency: 'weekly',
      priority: page.slugs.length === 0 ? 1 : 0.7,
    });
  }

  return entries;
}
