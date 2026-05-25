import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import React, { type CSSProperties } from 'react';
import {
  precomputeTakumiOgImages,
  type RenderTemplateContext,
} from '@tetherto/docs-seo-og/build';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const COLORS = {
  background: '#000000',
  foreground: '#ffffff',
  muted: '#d7dbe3',
  primary: '#ff6501',
  divider: 'rgba(255, 255, 255, 0.18)',
};

function truncate(value: string | undefined, maxLength: number): string | undefined {
  if (!value || value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1).trimEnd()}...`;
}

function titleSize(title: string): number {
  if (title.length <= 22) return 78;
  if (title.length <= 42) return 64;
  if (title.length <= 64) return 53;
  if (title.length <= 86) return 45;
  return 39;
}

function getFooterHost(): string {
  const origin =
    process.env.NEXT_PUBLIC_DOCS_ORIGIN ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    'https://docs.wdk.tether.su';

  try {
    return new URL(origin).host;
  } catch {
    return origin.replace(/^https?:\/\//, '').replace(/\/$/, '');
  }
}

function buildWdkOgTemplate(
  logoDataUrl: string,
  backgroundDataUrl: string,
  footerHost: string,
): (ctx: RenderTemplateContext) => React.ReactElement {
  return function WdkOgTemplate({ title, description, site }) {
    const displayTitle = title || site;
    const displayDescription = truncate(description, 130);
    const h = React.createElement;

    return h(
      'div',
      {
        style: {
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          overflow: 'hidden',
          background: COLORS.background,
          color: COLORS.foreground,
          fontFamily: 'Inter',
        } satisfies CSSProperties,
      },
      h('img', {
        src: backgroundDataUrl,
        style: {
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        } satisfies CSSProperties,
      }),
      h('div', {
        style: {
          position: 'absolute',
          inset: 0,
          display: 'flex',
          background: 'rgba(0, 0, 0, 0.22)',
        } satisfies CSSProperties,
      }),
      h('div', {
        style: {
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 770,
          display: 'flex',
          background: 'rgba(0, 0, 0, 0.88)',
        } satisfies CSSProperties,
      }),
      h('div', {
        style: {
          position: 'absolute',
          left: 770,
          top: 0,
          bottom: 0,
          width: 260,
          display: 'flex',
          background: 'linear-gradient(90deg, rgba(0,0,0,0.88), rgba(0,0,0,0))',
        } satisfies CSSProperties,
      }),
      h('div', {
        style: {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 170,
          display: 'flex',
          background: 'linear-gradient(0deg, rgba(0,0,0,0.86), rgba(0,0,0,0))',
        } satisfies CSSProperties,
      }),
      h(
        'div',
        {
          style: {
            position: 'relative',
            zIndex: 1,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: '52px 66px 48px',
          } satisfies CSSProperties,
        },
        h('img', {
          src: logoDataUrl,
          width: 218,
          height: 78,
          style: { objectFit: 'contain', flexShrink: 0 } satisfies CSSProperties,
        }),
        h('div', { style: { display: 'flex', flex: 1 } satisfies CSSProperties }),
        h(
          'div',
          {
            style: {
              display: 'flex',
              maxWidth: 690,
              fontSize: titleSize(displayTitle),
              fontWeight: 850,
              lineHeight: 1.04,
              letterSpacing: 0,
              color: COLORS.foreground,
            } satisfies CSSProperties,
          },
          displayTitle,
        ),
        displayDescription
          ? h(
              'div',
              {
                style: {
                  display: 'flex',
                  maxWidth: 690,
                  marginTop: 22,
                  fontSize: 28,
                  fontWeight: 400,
                  lineHeight: 1.32,
                  color: COLORS.muted,
                  letterSpacing: 0,
                } satisfies CSSProperties,
              },
              displayDescription,
            )
          : null,
        h('div', { style: { display: 'flex', flex: 1 } satisfies CSSProperties }),
        h(
          'div',
          {
            style: {
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: 22,
              borderTop: `1px solid ${COLORS.divider}`,
            } satisfies CSSProperties,
          },
          h(
            'div',
            {
              style: {
                display: 'flex',
                fontSize: 27,
                fontWeight: 800,
                color: COLORS.primary,
                letterSpacing: 0,
              } satisfies CSSProperties,
            },
            `${site} by Tether`,
          ),
          h(
            'div',
            {
              style: {
                display: 'flex',
                fontSize: 22,
                color: COLORS.muted,
                letterSpacing: 0,
              } satisfies CSSProperties,
            },
            footerHost,
          ),
        ),
      ),
    );
  };
}

async function main(): Promise<void> {
  if (process.env.SKIP_OG_BUILD === '1') {
    console.log('[og] SKIP_OG_BUILD=1; skipping Takumi prebuild.');
    return;
  }

  const logo = await readFile(
    path.join(root, 'public', 'assets', 'branding', 'wdk-logo-dark.png'),
  );
  const background = await readFile(
    path.join(root, 'public', 'assets', 'branding', 'wdk-og-background.png'),
  );
  const logoDataUrl = `data:image/png;base64,${logo.toString('base64')}`;
  const backgroundDataUrl = `data:image/png;base64,${background.toString('base64')}`;

  await precomputeTakumiOgImages({
    contentDocsDir: path.join(root, 'content', 'docs'),
    publicDir: path.join(root, 'public'),
    site: process.env.DOCS_OG_SITE_LABEL ?? 'WDK',
    ogRouteBase: '/og/docs',
    concurrency: Number(process.env.DOCS_OG_CONCURRENCY ?? '3') || 3,
    renderTemplate: buildWdkOgTemplate(logoDataUrl, backgroundDataUrl, getFooterHost()),
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
