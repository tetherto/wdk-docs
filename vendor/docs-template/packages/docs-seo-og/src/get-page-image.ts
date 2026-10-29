import type { TetherPage } from '@tetherto/docs-seo-core';
import { ogImageFileName, type OgImageFormat } from './og-image-format';

export type PageImageResult = {
  segments: string[];
  /** Root-relative URL, e.g. `/og/docs/foo/image.webp` */
  url: string;
};

/**
 * OG image segments and root-relative URL (Fumadocs convention: terminal `image.webp`,
 * or `image.jpg`/`image.png` when `format` is overridden).
 * With `output: 'export'`, run `precomputeTakumiOgImages` from `@tetherto/docs-seo-og/build` before
 * `next build` so these paths exist under `public/`. For dynamic SSR, use a Route Handler instead.
 * @see https://fumadocs.dev/docs/integrations/og/takumi
 */
export function getPageImage(
  page: TetherPage,
  ogRouteBase = '/og/docs',
  format: OgImageFormat = 'webp',
): PageImageResult {
  const segments = [...page.slugs, ogImageFileName(format)];
  const base = ogRouteBase.replace(/\/$/, '');
  return {
    segments,
    url: `${base}/${segments.join('/')}`,
  };
}

export function docsOgGenerateStaticParams(
  getPages: () => TetherPage[],
  format: OgImageFormat = 'webp',
): { slug: string[] }[] {
  return getPages().map((page) => ({
    slug: getPageImage(page, undefined, format).segments,
  }));
}
