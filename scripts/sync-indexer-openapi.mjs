#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { readFile, writeFile, rename, unlink, open } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SOURCE_URL, parseJson, renderReference, replaceReference } from './indexer-openapi.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const FILES = {
  spec: 'public/assets/indexer-api/openapi.json',
  provenance: 'public/assets/indexer-api/openapi.provenance.json',
  page: 'content/docs/tools/indexer-api/api-reference.mdx',
  feed: 'public/llms-full.txt',
};
const ROUTE = 'https://docs.wdk.tether.io/tools/indexer-api/api-reference';
const SEPARATOR = '\n\n***\n\n';
const hash = (raw) => createHash('sha256').update(raw).digest('hex');
const utc = () => new Date().toISOString();

export function replaceFeed(feed, page, route = ROUTE) {
  const frontmatter = page.match(/^---\n([\s\S]*?)\n---\n/);
  if (!frontmatter) throw new Error('Indexer reference needs frontmatter');
  const title = frontmatter[1].match(/^title: (.+)$/m)?.[1];
  const description = frontmatter[1].match(/^description: (.+)$/m)?.[1];
  if (!title || !description) throw new Error('Indexer reference needs a title and description');
  const records = [...feed.matchAll(/^## [^\n]+\nURL: (https:\/\/docs\.wdk\.tether\.io\/[^\n]*)\nDescription: [^\n]+\n/gm)];
  const matches = records.filter((record) => record[1] === route);
  if (matches.length !== 1) throw new Error('Expected exactly one Indexer REST record in llms-full.txt');
  const record = matches[0];
  const next = records[records.indexOf(record) + 1];
  if (!next || feed.slice(next.index - SEPARATOR.length, next.index) !== SEPARATOR) {
    throw new Error('Indexer REST feed record needs its next page separator');
  }
  const body = page.slice(frontmatter[0].length).trim();
  const replacement = `## ${title}\nURL: ${route}\nDescription: ${description}\n\n${body}`;
  return feed.slice(0, record.index) + replacement + feed.slice(next.index - SEPARATOR.length);
}

// Stage every output before replacing any target; restore original bytes on failure.
export async function publishFiles(root, updates, { renameFile = rename } = {}) {
  const staged = [];
  const replaced = [];
  try {
    for (const [relative, content] of updates) {
      const target = path.join(root, relative);
      const original = await readFile(target).catch((error) => {
        if (error.code === 'ENOENT') return null;
        throw error;
      });
      if (original?.equals(Buffer.from(content))) continue;
      const temporary = `${target}.${process.pid}.tmp`;
      const handle = await open(temporary, 'wx');
      staged.push({ target, temporary, original });
      try { await handle.writeFile(content); }
      finally { await handle.close(); }
    }
    for (const file of staged) {
      await renameFile(file.temporary, file.target);
      replaced.push(file);
    }
  } catch (error) {
    const rollbackErrors = [];
    for (const file of replaced.reverse()) {
      try {
        if (file.original === null) await unlink(file.target);
        else await writeFile(file.target, file.original);
      } catch (rollbackError) { rollbackErrors.push(rollbackError); }
    }
    if (rollbackErrors.length) throw new AggregateError([error, ...rollbackErrors], 'Indexer publication and rollback failed');
    throw error;
  } finally {
    await Promise.all(staged.map(({ temporary }) => unlink(temporary).catch((error) => {
      if (error.code !== 'ENOENT') throw error;
    })));
  }
  return staged.length;
}

async function fetchBytes(url, { fetchImpl = fetch, maxBytes = 2 * 1024 * 1024 } = {}) {
  const response = await fetchImpl(url, { redirect: 'error', signal: AbortSignal.timeout(30_000) });
  const chunks = [];
  let size = 0;
  for await (const chunk of response.body) {
    size += chunk.length;
    if (size > maxBytes) throw new Error(`Response exceeds ${maxBytes} bytes: ${url}`);
    chunks.push(chunk);
  }
  return { response, raw: new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(Buffer.concat(chunks)) };
}

export async function syncIndexer({ root = ROOT, refresh = false, check = false, fetchImpl = fetch } = {}) {
  if (refresh && check) throw new Error('--refresh and --check cannot be combined');
  let lock;
  const lockPath = path.join(root, '.indexer-openapi.lock');
  try {
    if (!check) {
      lock = await open(lockPath, 'wx');
      await lock.writeFile(`${process.pid}\n`);
    }
    const [storedRaw, storedProvenance, page, feed] = await Promise.all(
      Object.values(FILES).map((file) => readFile(path.join(root, file), 'utf8')),
    );
    let raw = storedRaw;
    let provenance = parseJson(storedProvenance);
    if (refresh) {
      const downloaded = await fetchBytes(SOURCE_URL, { fetchImpl });
      if (downloaded.response.status !== 200) throw new Error(`OpenAPI download returned HTTP ${downloaded.response.status}`);
      raw = downloaded.raw;
      const retrievedAt = utc();
      const healthUrl = new URL('/api/v1/health', SOURCE_URL).href;
      const observed = await fetchBytes(healthUrl, { fetchImpl });
      if (![200, 503].includes(observed.response.status)) throw new Error(`Health returned HTTP ${observed.response.status}`);
      const health = parseJson(observed.raw);
      if (typeof health.deployedVersion !== 'string' || !health.deployedVersion.trim()) {
        throw new Error('Health response is missing its deployedVersion');
      }
      if (typeof health.status !== 'string' || !health.status.trim()) {
        throw new Error('Health response is missing its status');
      }
      // A version advance without a changed export needs backend reconciliation.
      if (hash(raw) === hash(storedRaw) && health.deployedVersion !== provenance.health?.deployedVersion) {
        throw new Error('Deployment version changed without an updated OpenAPI export; reconcile the production contract before syncing');
      }
      // Identical bytes and deployment version retain observation times to avoid PR churn.
      if (hash(raw) !== hash(storedRaw)) {
        provenance = {
          environment: 'production', sourceUrl: SOURCE_URL, retrievedAt, sha256: hash(raw),
          health: { sourceUrl: healthUrl, checkedAt: utc(), httpStatus: observed.response.status,
            deployedVersion: health.deployedVersion, status: health.status },
        };
      }
    }
    const updatedPage = replaceReference(page, renderReference(raw, provenance));
    const updatedFeed = replaceFeed(feed, updatedPage);
    const updates = new Map([
      [FILES.spec, raw], [FILES.provenance, `${JSON.stringify(provenance, null, 2)}\n`],
      [FILES.page, updatedPage], [FILES.feed, updatedFeed],
    ]);
    const originals = [storedRaw, storedProvenance, page, feed];
    const changed = [...updates.values()].some((value, index) => value !== originals[index]);
    if (check) {
      if (changed) throw new Error('Indexer reference or LLM feed is stale; run npm run generate:indexer');
      return false;
    }
    await publishFiles(root, updates);
    return changed;
  } finally {
    if (lock) {
      await lock.close();
      await unlink(lockPath);
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length > 1 || args.some((arg) => !['--check', '--refresh'].includes(arg))) {
    throw new Error('Usage: node scripts/sync-indexer-openapi.mjs [--check|--refresh]');
  }
  const changed = await syncIndexer({ check: args.includes('--check'), refresh: args.includes('--refresh') });
  console.log(changed ? 'Updated Indexer contract, reference and LLM feed' : 'Indexer contract, reference and LLM feed are current');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => { console.error(error); process.exitCode = 1; });
}
