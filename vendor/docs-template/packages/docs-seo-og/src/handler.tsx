import type { TetherPage } from '@tetherto/docs-seo-core';
import { ImageResponse } from '@takumi-rs/image-response';
import type { ImageResponseOptions } from '@takumi-rs/image-response';
import { generate as OgTemplate } from 'fumadocs-ui/og';
import { ogImageFileName, resolveOgImageFormat } from './og-image-format';

export type DocsOgHandlerOptions = {
  getPage: (slugs: string[] | undefined) => TetherPage | undefined;
  /** Takumi template `site` prop (e.g. `Tether`) */
  site: string;
  /**
   * Forwarded to `ImageResponse` (e.g. `fonts`, `format`, `quality`).
   * `width`, `height`, and `format: 'webp'` are set by default and may be
   * overridden here. The expected terminal slug segment always follows the
   * resolved `format` (e.g. `image.jpg` for `format: 'jpeg'`).
   */
  imageResponseOptions?: Partial<ImageResponseOptions>;
};

export async function docsOgGet(
  slug: string[] | undefined,
  options: DocsOgHandlerOptions,
): Promise<Response> {
  if (!slug?.length) {
    return new Response('Not Found', { status: 404 });
  }
  let effectiveFormat;
  try {
    effectiveFormat = resolveOgImageFormat(options.imageResponseOptions?.format);
  } catch (error) {
    return new Response((error as Error).message, { status: 500 });
  }
  if (slug[slug.length - 1] !== ogImageFileName(effectiveFormat)) {
    return new Response('Not Found', { status: 404 });
  }

  const pageSlugs = slug.slice(0, -1);
  const page = options.getPage(pageSlugs.length ? pageSlugs : undefined);
  if (!page) {
    return new Response('Not Found', { status: 404 });
  }

  const title = page.data.title ?? '';
  const description = page.data.description ?? '';

  return new ImageResponse(
    <OgTemplate title={title} description={description} site={options.site} />,
    {
      width: 1200,
      height: 630,
      format: effectiveFormat,
      ...options.imageResponseOptions,
    },
  );
}
