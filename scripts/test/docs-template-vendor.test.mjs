import 'tsx/esm';
import assert from 'node:assert/strict';
import { realpathSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const repoRoot = realpathSync(fileURLToPath(new URL('../../', import.meta.url)));
const packageIds = [
  '@tetherto/docs-seo-schema',
  '@tetherto/docs-seo-core',
  '@tetherto/docs-seo-next',
  '@tetherto/docs-seo-og',
  '@tetherto/docs-seo-og/build',
  '@tetherto/docs-seo-og/handler',
];
const [schema, core, next, og, ogBuild, ogHandler] = await Promise.all(
  packageIds.map((id) => import(id)),
);
const config = {
  metadataBase: new URL('https://docs.wdk.tether.io'),
  siteName: 'WDK Docs',
  publisherName: 'Tether',
  trailingSlash: true,
};
const data = schema.tetherSeoFrontmatterSchema.parse({
  description: '  Wallet API reference  ',
  docType: 'reference',
  schemaType: 'TechArticle',
  lastModified: '2026-10-27T00:00:00.000Z',
  ogImage: '/og/custom.png',
});
const page = {
  url: '/sdk/example',
  slugs: ['sdk', 'example'],
  data: { ...data, title: 'Example Wallet API' },
};
const home = {
  url: '/',
  slugs: [],
  data: { ...data, title: 'WDK Docs', docType: 'page', schemaType: 'WebPage' },
};

test('WDK SEO imports resolve to local workspace sources, including OG subpaths', () => {
  const vendorRoot = path.join(repoRoot, 'vendor', 'docs-template', 'packages');
  for (const id of packageIds) {
    const resolved = realpathSync(fileURLToPath(import.meta.resolve(id)));
    assert.ok(resolved.startsWith(`${vendorRoot}${path.sep}`), `${id}: ${resolved}`);
  }
  assert.equal(typeof next.buildDocsMetadata, 'function');
  assert.equal(typeof next.DocsJsonLd, 'function');
  assert.equal(typeof ogBuild.precomputeTakumiOgImages, 'function');
  assert.equal(typeof ogHandler.docsOgGet, 'function');
  assert.equal(next.getPageSeoState, core.getPageSeoState);
  assert.equal(core.tetherSeoFrontmatterSchema, schema.tetherSeoFrontmatterSchema);
});

test('WDK page metadata, JSON-LD and indexing consume the same canonical state', () => {
  assert.equal(data.description, 'Wallet API reference');
  assert.equal(schema.tetherSeoFrontmatterSchema.safeParse({ description: ' ' }).success, false);
  const state = next.getPageSeoState(page, config);
  assert.equal(state.canonicalUrl, 'https://docs.wdk.tether.io/sdk/example/');
  assert.equal(state.ogImageOverride, 'https://docs.wdk.tether.io/og/custom.png');
  const metadata = next.buildDocsMetadata({
    state, ogImageUrl: state.ogImageOverride, siteName: config.siteName,
  });
  assert.equal(metadata.alternates.canonical, state.canonicalUrl);
  assert.equal(metadata.openGraph.images[0].url, state.ogImageOverride);
  const graph = next.buildJsonLdGraph(page, state, config);
  assert.equal(graph.url, metadata.alternates.canonical);
  assert.equal(graph.headline, page.data.title);
  assert.equal(graph.publisher.name, 'Tether');
  const script = next.DocsJsonLd({ data: graph });
  assert.equal(script.type, 'script');
  assert.equal(script.props.type, 'application/ld+json');
  assert.deepEqual(JSON.parse(script.props.dangerouslySetInnerHTML.__html), graph);

  const hidden = { ...page, data: { ...page.data, noIndex: true } };
  const hiddenState = next.getPageSeoState(hidden, config);
  assert.equal(next.buildJsonLdGraph(hidden, hiddenState, config), null);
  assert.deepEqual(next.buildDocsMetadata({
    state: hiddenState, ogImageUrl: state.ogImageOverride, siteName: config.siteName,
  }).robots, { index: false, follow: true });
  const sitemap = next.buildDocsSitemap({ getPages: () => [home, page, hidden] }, config);
  assert.deepEqual(sitemap.map((entry) => entry.url), [
    'https://docs.wdk.tether.io/', state.canonicalUrl,
  ]);
  const robots = next.buildDocsRobots({ sitemapUrl: 'https://docs.wdk.tether.io/sitemap.xml' });
  assert.equal(robots.sitemap, 'https://docs.wdk.tether.io/sitemap.xml');
  assert.ok(robots.rules.some((rule) => rule.userAgent === 'OAI-SearchBot' && rule.allow === '/'));
  assert.ok(robots.rules.some((rule) => rule.userAgent === 'GPTBot' && rule.disallow === '/'));
});

test('WDK default OG paths stay WebP and unsupported formats fail before rendering', async () => {
  assert.equal(og.getPageImage(home).url, '/og/docs/image.webp');
  assert.equal(og.getPageImage(page).url, '/og/docs/sdk/example/image.webp');
  assert.deepEqual(og.docsOgGenerateStaticParams(() => [home, page]), [
    { slug: ['image.webp'] }, { slug: ['sdk', 'example', 'image.webp'] },
  ]);
  const missing = await ogHandler.docsOgGet(['missing', 'image.webp'], {
    site: 'WDK', getPage: () => undefined,
  });
  assert.equal(missing.status, 404);
  for (const [format, filename] of [['webp', 'image.webp'], ['png', 'image.png'], ['jpeg', 'image.jpg']]) {
    let lookedUp = false;
    const response = await ogHandler.docsOgGet(['missing', filename], {
      site: 'WDK',
      getPage: () => { lookedUp = true; return undefined; },
      imageResponseOptions: { format },
    });
    assert.equal(response.status, 404, format);
    assert.equal(lookedUp, true, `${format} must reach page lookup`);
    assert.equal(og.getPageImage(page, undefined, format).url, `/og/docs/sdk/example/${filename}`);
  }
  for (const format of ['raw', 'ico']) {
    let lookedUp = false;
    const response = await ogHandler.docsOgGet(['example', 'image.webp'], {
      site: 'WDK',
      getPage: () => { lookedUp = true; return page; },
      imageResponseOptions: { format },
    });
    assert.equal(response.status, 500, format);
    assert.equal(lookedUp, false, `${format} must fail before page lookup/rendering`);
  }
});
