/**
 * URL helpers safe for static export / client bundles (no Takumi).
 * For Route Handlers, import from `@tetherto/docs-seo-og/handler`.
 */
export {
  docsOgGenerateStaticParams,
  getPageImage,
  type PageImageResult,
} from './get-page-image';
export { ogImageFileName, type OgImageFormat } from './og-image-format';
export type { TetherPage, WarnMissingSeoFrontmatterOptions } from '@tetherto/docs-seo-core';
export {
  DOCS_SEO_WARN_PREFIX,
  warnMissingSeoFrontmatterFields,
} from '@tetherto/docs-seo-core';
