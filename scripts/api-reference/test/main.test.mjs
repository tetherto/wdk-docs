import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { parseJson, snapshot, createOutput, compareSnapshots } from '../io.mjs';
import { validateBundle, inspectBundle, verifyStagedFiles } from '../main.mjs';

const modules = { core: { repository: 'tetherto/wdk' } };
const input = { kind: 'source-preview', repository: 'tetherto/wdk', commit: 'a'.repeat(40), tree: 'b'.repeat(40) };

test('input JSON rejects nested and escaped duplicate keys', () => {
  assert.throws(() => parseJson('{"a":{"value":1,"value":2}}'), /Duplicate/);
  assert.throws(() => parseJson('{"name":1,"n\\u0061me":2}'), /Duplicate/);
  assert.throws(() => parseJson('{"trailing":1,}'));
  assert.deepEqual(parseJson('{"a":1,"b":{"a":2}}'), { a: 1, b: { a: 2 } });
});

test('preview and release labels cannot silently select mutable inputs', () => {
  assert.throws(() => validateBundle({ schemaVersion: 2, module: 'core' }, modules), /schema/);
  assert.throws(() => validateBundle({ schemaVersion: 1, module: 'core', packageRoot: '/tmp', input: { ...input, commit: 'main' } }, modules), /immutable/);
  assert.throws(() => validateBundle({ schemaVersion: 1, module: 'core', packageRoot: '/tmp', input: { kind: 'released-artifact', version: 'latest' } }, modules), /exact version/);
});

test('snapshot identity is content based and refuses input symlinks', async (t) => {
  const root = await fs.mkdtemp(path.join(tmpdir(), 'api-ref-snapshot-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  await fs.writeFile(path.join(root, 'source.js'), 'export const value = 1;');
  const before = await snapshot(root);
  await fs.writeFile(path.join(root, 'source.js'), 'export const value = 2;');
  const after = await snapshot(root);
  assert.notEqual(before.sha256, after.sha256);
  assert.deepEqual(compareSnapshots(before, after).map((r) => [r.file, r.change]), [['source.js', 'changed']]);
  await fs.symlink('/etc/hosts', path.join(root, 'escape'));
  await assert.rejects(snapshot(root), /symlink/);
});

test('scratch creation refuses protected paths and prior output', async (t) => {
  const root = await fs.realpath(await fs.mkdtemp(path.join(tmpdir(), 'api-ref-output-')));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  await fs.mkdir(path.join(root, 'authored'));
  await assert.rejects(createOutput(path.join(root, 'authored', 'run'), [path.join(root, 'authored')]), /outside/);
  await createOutput(path.join(root, 'run'), [path.join(root, 'authored')]);
  await assert.rejects(createOutput(path.join(root, 'run'), [path.join(root, 'authored')]), /EEXIST/);
});

test('analyzed bytes must match the acquired snapshot even when original files are restored', () => {
  const acquired = { files: { 'index.js': 'original', 'package.json': 'metadata', 'README.md': 'reader' } };
  assert.throws(() => verifyStagedFiles(acquired, [{ path: 'index.js', sha256: 'alternate' }, { path: 'package.json', sha256: 'metadata' }], 'dependency'), /disagree/);
  assert.throws(() => verifyStagedFiles(acquired, [{ path: 'package.json', sha256: 'metadata' }], 'package'), /coverage/);
  assert.throws(() => verifyStagedFiles(acquired, [{ path: 'index.js', sha256: 'original' }, { path: 'index.js', sha256: 'original' }], 'package'), /disagree/);
  verifyStagedFiles(acquired, [{ path: 'index.js', sha256: 'original' }, { path: 'package.json', sha256: 'metadata' }], 'package');
});

test('CLI analysis keeps executable package/config text static and authored docs unchanged', async (t) => {
  const root = await fs.realpath(await fs.mkdtemp(path.join(tmpdir(), 'api-ref-cli-')));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const packageRoot = path.join(root, 'package');
  await fs.mkdir(packageRoot);
  await fs.writeFile(path.join(packageRoot, 'package.json'), JSON.stringify({ name: '@tetherto/wdk', version: '1.0.0', type: 'module', exports: { '.': { types: './index.d.ts', import: './index.js' } } }));
  const canary = path.join(root, 'executed');
  await fs.writeFile(path.join(packageRoot, 'index.js'), `import fs from 'node:fs'; fs.writeFileSync(${JSON.stringify(canary)}, 'SDK executed'); export const value = 1;`);
  await fs.writeFile(path.join(packageRoot, 'index.d.ts'), 'export declare const value: number;');
  await fs.writeFile(path.join(packageRoot, 'typedoc.config.mjs'), `import fs from 'node:fs'; fs.writeFileSync(${JSON.stringify(canary)}, 'config executed'); export default {};`);
  const result = await inspectBundle({ schemaVersion: 1, module: 'core', packageRoot, input: { kind: 'released-artifact', version: '1.0.0' }, dependencies: [] }, { out: path.join(root, 'run #1') });
  await assert.rejects(fs.stat(canary), /ENOENT/);
  const receipt = parseJson(await fs.readFile(result.receipt, 'utf8'));
  assert.equal(receipt.readiness.docsAccepted, false);
  assert.equal(receipt.readiness.contentReview, 'pending');
  assert.equal(receipt.identityEvidence.remoteSourceApproval, 'not-verified-by-inspector');
  assert.equal(receipt.docs.preimage, (await import('../io.mjs')).digest(await fs.readFile(path.join(result.output, 'authored-before.md'), 'utf8')));
  await assert.rejects(inspectBundle({ schemaVersion: 1, module: 'core', packageRoot, input, dependencies: [], expectedSnapshot: '0'.repeat(64) }, { out: path.join(root, 'changed') }), /snapshot changed/);
});
