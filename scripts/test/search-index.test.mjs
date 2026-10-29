import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { oramaStaticClient } from 'fumadocs-core/search/client/orama-static';
import { createSearchIndex } from '../generate-search-index.mjs';

test('exported static search finds schema fields and ordinary docs at their actual headings', async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), 'wdk-search-index-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const documents = {
    'index.mdx': '---\ntitle: Documentation home\n---\n\nWelcome to WDK.\n',
    'tools/index.mdx': '---\ntitle: Developer tools\n---\n\nTooling reference.\n',
    'tools/indexer-api/index.mdx': '---\ntitle: Indexer API\n---\n\nBlockchain data.\n',
    'tools/indexer-api/api-reference.mdx': await readFile(new URL('../../content/docs/tools/indexer-api/api-reference.mdx', import.meta.url), 'utf8'),
    'guides/account-setup.mdx': '---\ntitle: "Account setup"\ndescription: >\n  Configure your\n  application account.\n---\n\nUnheaded search guidance.\n\n## Table of Contents\n\nignoredsearchneedle\n\n## Account derivation\n\nderiveWalletAccount\n\nStable recovery note.\n\n| Field | Type |\n| --- | --- |\n| accountConfig | object |\n\nStable recovery note.\n',
  };
  for (const [relative, content] of Object.entries(documents)) {
    await mkdir(path.dirname(path.join(root, relative)), { recursive: true });
    await writeFile(path.join(root, relative), content);
  }

  const { payload, pageCount } = await createSearchIndex(root);
  assert.equal(payload.type, 'advanced');
  assert.equal(pageCount, Object.keys(documents).length);
  const records = Object.values(payload.docs.docs);
  const section = records.filter((record) => record.type === 'text'
    && record.url === '/guides/account-setup#account-derivation');
  assert.equal(section.length, 1, 'paragraphs and table cells share one searchable heading record');
  assert.equal(section[0].content, 'deriveWalletAccount Stable recovery note. Field Type accountConfig object');
  assert.ok(records.some((record) => record.url === '/guides/account-setup'
    && record.content === 'Unheaded search guidance.'));
  const from = `https://search.test.invalid/${randomUUID()}.json`;
  t.mock.method(globalThis, 'fetch', async (url) => {
    assert.equal(url, from);
    return new Response(JSON.stringify(payload), { headers: { 'content-type': 'application/json' } });
  });
  const client = oramaStaticClient({ from });
  const fields = await client.search('sparkIdentityKey');
  assert.ok(fields.some((item) => item.type === 'text'
    && item.url.startsWith('/tools/indexer-api/api-reference#')
    && item.content.includes('sparkIdentityKey')), 'schema fields need real, usable static search results');
  assert.ok(fields.some((item) => item.type === 'page'
    && item.url === '/tools/indexer-api/api-reference'
    && item.breadcrumbs?.join('/') === 'Developer tools/Indexer API'));
  const ordinary = await client.search('deriveWalletAccount');
  assert.ok(ordinary.some((item) => item.url === '/guides/account-setup#account-derivation'));
  assert.deepEqual(await client.search('ignoredsearchneedle'), [], 'TOC text remains excluded');
  assert.ok((await client.search('Documentation home')).some((item) => item.url === '/'));
});
