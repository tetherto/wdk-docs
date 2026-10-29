// Local change: accept Takumi format types and reject unsupported OG formats.
import type { ImageResponseOptions } from '@takumi-rs/image-response';

export type OgImageFormat = 'webp' | 'png' | 'jpeg';

/** `jpeg` -> `image.jpg` (conventional extension); otherwise `image.<format>`. */
export function ogImageFileName(format: OgImageFormat = 'webp'): string {
  return format === 'jpeg' ? 'image.jpg' : `image.${format}`;
}

/**
 * Resolves the effective OG image format from a Takumi `format` option,
 * defaulting to `webp`. Rejects formats without a supported OG filename,
 * including `raw` pixel-buffer output.
 */
export function resolveOgImageFormat(
  requested: ImageResponseOptions['format'],
): OgImageFormat {
  if (requested === undefined) return 'webp';
  if (requested === 'webp' || requested === 'png' || requested === 'jpeg') {
    return requested;
  }
  throw new Error(
    `OG images cannot use format "${requested}"; use "webp", "png", or "jpeg".`,
  );
}
