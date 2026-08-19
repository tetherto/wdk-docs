import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { syncAllModulesFeed, upsertAllModulesFeed } from '../sync-all-modules-feed.mjs';

const source = [
  '## All Modules',
  'URL: https://wdk.tether.io/developers/blocks',
  '',
  'Current catalog',
].join('\n');

test('replaces an existing All Modules feed without moving adjacent sections', () => {
  const artifact = [
    '# WDK Documentation',
    '',
    '***',
    '',
    '## All Modules',
    '',
    'Old catalog',
    '',
    '***',
    '',
    '## Core Module',
    '',
    'Core content',
    '',
  ].join('\n');

  const updated = upsertAllModulesFeed(artifact, source);

  assert.equal(updated, artifact.replace('## All Modules\n\nOld catalog', source));
});

test('appends the feed when an artifact refresh omits it', () => {
  const artifact = '# WDK Documentation\n\n## Core Module\n';

  const updated = upsertAllModulesFeed(artifact, source);

  assert.equal(updated, `# WDK Documentation\n\n## Core Module\n\n***\n\n${source}\n\n***\n`);
  assert.equal(upsertAllModulesFeed(updated, source), updated);
});

test('rejects duplicate All Modules feed sections', () => {
  const artifact = `${source}\n\n***\n\n${source}\n\n***\n\n`;

  assert.throws(() => upsertAllModulesFeed(artifact, source), /at most one All Modules feed section/);
});

test('rejects an existing feed without a terminating separator', () => {
  const artifact = `${source}\n## Later Page\nMUST SURVIVE\n`;

  assert.throws(
    () => upsertAllModulesFeed(artifact, source),
    /missing its terminating llms-full section separator/,
  );
});

test('rejects a later page record before a terminal separator', () => {
  const artifact = [
    '## All Modules',
    '',
    'Old catalog',
    '',
    '## Later Page',
    'URL: https://docs.wdk.tether.io/sdk/later-page',
    '',
    'MUST SURVIVE',
    '',
    '***',
    '',
  ].join('\n');

  assert.throws(
    () => upsertAllModulesFeed(artifact, source),
    /contains a later page record before its terminating separator/,
  );
});

test('check-only synchronization reports drift without modifying the artifact', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'wdk-all-modules-sync-'));
  const sourcePath = path.join(root, 'content/feeds/all-modules.md');
  const targetPath = path.join(root, 'public/llms-full.txt');
  const artifact = '# WDK Documentation\n';

  await mkdir(path.dirname(sourcePath), { recursive: true });
  await mkdir(path.dirname(targetPath), { recursive: true });
  await writeFile(sourcePath, `${source}\n`, 'utf8');
  await writeFile(targetPath, artifact, 'utf8');

  const changed = await syncAllModulesFeed({ sourcePath, targetPath, write: false });

  assert.equal(changed, true);
  assert.equal(await readFile(targetPath, 'utf8'), artifact);
});
