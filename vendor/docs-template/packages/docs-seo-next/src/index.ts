export {
  buildJsonLdGraph,
  DOCS_SEO_WARN_PREFIX,
  getPageSeoState,
  inferJsonLdType,
  tetherSeoFrontmatterSchema,
  warnMissingSeoFrontmatterFields,
  type DocsSeoConfig,
  type JsonLdGraph,
  type PageSeoState,
  type TetherPage,
  type TetherPageData,
  type WarnMissingSeoFrontmatterOptions,
  SEO_SCHEMA_VERSION,
} from '@tetherto/docs-seo-core';

export { buildDocsMetadata, type DocsMetadataOptions } from './metadata';
export { buildDocsSitemap, type DocsSitemapSource } from './sitemap';
export { buildDocsRobots, type DocsRobotsOptions } from './robots';
export { DocsJsonLd, type DocsJsonLdProps } from './json-ld';
