import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import test, { after } from 'node:test';
import { START, END, SOURCE_URL } from '../indexer-openapi.mjs';
import { FILES, replaceFeed, publishFiles, syncIndexer } from '../sync-indexer-openapi.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const RAW = await readFile(path.join(ROOT, FILES.spec), 'utf8');
const PROVENANCE = JSON.parse(await readFile(path.join(ROOT, FILES.provenance), 'utf8'));
const PAGE = `---\ntitle: API Reference\ndescription: REST reference\n---\n\n${START}\n${END}\n\n## Need Help?\n\n<SupportCards />\n`;
const RECORD = '## API Reference\nURL: https://docs.wdk.tether.io/tools/indexer-api/api-reference\nDescription: REST reference\n\nold content';
const NEXT = '## Next\nURL: https://docs.wdk.tether.io/tools/next\nDescription: Next page\n\nKeep this.';
const FEED = `Keep the introduction.\n\n***\n\n${RECORD}\n\n***\n\n${NEXT}\n\n***\n\n## All Modules\n\nKeep the community catalog.\n\n***\n`;
const fixtureRoots = [];
after(async () => {
  await Promise.all(fixtureRoots.map((root) => rm(root, { recursive: true, force: true })));
});

async function fixture() {
  const root = await mkdtemp(path.join(tmpdir(), 'wdk-indexer-sync-'));
  fixtureRoots.push(root);
  for (const [name, content] of [
    [FILES.spec, RAW], [FILES.provenance, `${JSON.stringify(PROVENANCE, null, 2)}\n`],
    [FILES.page, PAGE], [FILES.feed, FEED],
  ]) {
    const target = path.join(root, name);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, content);
  }
  return root;
}

const snapshot = (root) => Promise.all(Object.values(FILES).map((file) => readFile(path.join(root, file), 'utf8')));
function fetcher(raw = RAW, { version = PROVENANCE.health.deployedVersion, specStatus = 200, healthStatus = 503 } = {}) {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push(url);
    assert.equal(options.redirect, 'error');
    assert(options.signal instanceof AbortSignal);
    if (url === SOURCE_URL) return new Response(raw, { status: specStatus });
    assert.equal(url, new URL('/api/v1/health', SOURCE_URL).href);
    return new Response(JSON.stringify({ status: 'degraded', deployedVersion: version }), { status: healthStatus });
  };
  return { fetchImpl, calls };
}

test('replaces only the exact REST feed record and preserves the All Modules catalog', () => {
  const updated = replaceFeed(FEED, PAGE);
  assert(updated.startsWith('Keep the introduction.\n\n***\n\n'));
  assert(updated.endsWith(`${NEXT}\n\n***\n\n## All Modules\n\nKeep the community catalog.\n\n***\n`));
  assert(updated.includes('<SupportCards />'));
  assert.throws(() => replaceFeed(FEED + `\n${RECORD}`, PAGE), /exactly one/);
  assert.throws(() => replaceFeed(FEED.replace('\n\n***\n\n' + NEXT, '\n' + NEXT), PAGE), /separator/);
});

test('offline generation is deterministic and --check is write-free and detects stale output', async () => {
  const root = await fixture();
  const original = await snapshot(root);
  await assert.rejects(syncIndexer({ root, check: true }), /stale/);
  assert.deepEqual(await snapshot(root), original);
  assert.equal(await syncIndexer({ root }), true);
  const generated = await snapshot(root);
  assert.equal(await syncIndexer({ root }), false);
  assert.equal(await syncIndexer({ root, check: true }), false);
  assert.deepEqual(await snapshot(root), generated);
});

test('unchanged bytes and deployment version retain exact provenance without PR churn', async () => {
  const root = await fixture();
  await syncIndexer({ root });
  const before = await snapshot(root);
  const { fetchImpl, calls } = fetcher();
  assert.equal(await syncIndexer({ root, refresh: true, fetchImpl }), false);
  assert.equal(calls.length, 2);
  assert.deepEqual(await snapshot(root), before);
});

test('changed source updates spec, provenance, reference and feed together', async () => {
  const root = await fixture();
  const document = JSON.parse(RAW);
  document.paths['/api/v1/chains'].get.summary = 'Discover current chain and token identifiers';
  const raw = JSON.stringify(document);
  const { fetchImpl } = fetcher(raw);
  assert.equal(await syncIndexer({ root, refresh: true, fetchImpl }), true);
  const [stored, provenance, page, feed] = await snapshot(root);
  assert.equal(stored, raw);
  assert.equal(JSON.parse(provenance).sha256, createHash('sha256').update(raw).digest('hex'));
  assert(page.includes('Discover current chain and token identifiers'));
  assert(feed.includes('Discover current chain and token identifiers'));
  await syncIndexer({ root, check: true });
});

test('deployment advance with unchanged export fails closed without changing files', async () => {
  const root = await fixture();
  const before = await snapshot(root);
  await assert.rejects(syncIndexer({ root, refresh: true, ...fetcher(RAW, { version: '999.0.0' }) }), /Deployment version changed/);
  assert.deepEqual(await snapshot(root), before);
});

test('download, size, invalid contract and health failures leave all artifacts unchanged', async () => {
  const root = await fixture();
  const before = await snapshot(root);
  const rounded = JSON.parse(RAW);
  rounded.paths['/api/v1/chains'].get.responses['200'].content['application/json'].schema.example = 'RAW_NUMBER';
  const cases = [
    fetcher('unavailable', { specStatus: 503 }),
    fetcher(' '.repeat(2 * 1024 * 1024 + 1)),
    fetcher('{"openapi":"3.0.0","paths":{}}'),
    fetcher(JSON.stringify(rounded).replace('"RAW_NUMBER"', '0.10000000000000001')),
    fetcher(RAW, { healthStatus: 500 }),
    { fetchImpl: async () => { throw new Error('network failure'); } },
  ];
  for (const { fetchImpl } of cases) {
    await assert.rejects(syncIndexer({ root, refresh: true, fetchImpl }));
    assert.deepEqual(await snapshot(root), before);
    assert(!(await readdir(root)).includes('.indexer-openapi.lock'));
  }
});

test('an existing publisher lock is preserved and prevents concurrent writes', async () => {
  const root = await fixture();
  const lock = path.join(root, '.indexer-openapi.lock');
  await writeFile(lock, 'another publisher\n');
  const before = await snapshot(root);
  await assert.rejects(syncIndexer({ root }), { code: 'EEXIST' });
  assert.equal(await readFile(lock, 'utf8'), 'another publisher\n');
  assert.deepEqual(await snapshot(root), before);
});

test('partial rename failure restores original bytes and removes staged files', async () => {
  const root = await fixture();
  const before = await snapshot(root);
  const { rename } = await import('node:fs/promises');
  let count = 0;
  await assert.rejects(publishFiles(root, new Map([
    [FILES.spec, 'changed spec'], [FILES.provenance, 'changed provenance'],
  ]), { renameFile: async (...args) => {
    if (++count === 2) throw new Error('disk failure');
    return rename(...args);
  } }), /disk failure/);
  assert.deepEqual(await snapshot(root), before);
  assert.deepEqual((await readdir(path.join(root, 'public/assets/indexer-api'))).sort(), ['openapi.json', 'openapi.provenance.json']);
});
