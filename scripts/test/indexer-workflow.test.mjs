import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { chmod, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { promisify } from 'node:util';

const execute = promisify(execFile);
const workflow = await readFile(new URL('../../.github/workflows/sync-indexer-openapi.yml', import.meta.url), 'utf8');
const branch = 'automation/indexer-openapi';
const spec = 'public/assets/indexer-api/openapi.json';
const artifacts = [spec, 'public/assets/indexer-api/openapi.provenance.json',
  'content/docs/tools/indexer-api/api-reference.mdx', 'public/llms-full.txt'];

// Run the committed workflow shell, so the regression cannot drift into a second implementation.
function shellStep(name) {
  const lines = workflow.split('\n');
  const start = lines.indexOf(`      - name: ${name}`);
  assert.notEqual(start, -1, `missing workflow step: ${name}`);
  const run = lines.findIndex((line, index) => index > start && line === '        run: |');
  assert.notEqual(run, -1, `missing shell body: ${name}`);
  const body = [];
  for (const line of lines.slice(run + 1)) {
    if (line && !line.startsWith('          ')) break;
    body.push(line.slice(10));
  }
  return body.join('\n');
}

async function git(cwd, ...args) {
  const result = await execute('git', args, { cwd, env: { ...process.env, GIT_EDITOR: 'true' } });
  return result.stdout.trim();
}

async function put(repo, relative, content) {
  await mkdir(path.dirname(path.join(repo, relative)), { recursive: true });
  await writeFile(path.join(repo, relative), content);
}

async function commit(repo, message) {
  await git(repo, 'add', '.');
  await git(repo, 'commit', '-m', message);
  return git(repo, 'rev-parse', 'HEAD');
}

async function fixture(t) {
  const root = await mkdtemp(path.join(tmpdir(), 'wdk-indexer-workflow-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const origin = path.join(root, 'origin.git');
  const seed = path.join(root, 'seed');
  const bin = path.join(root, 'bin');
  await mkdir(bin);
  await git(root, 'init', '--bare', '--initial-branch=develop', origin);
  await git(root, 'init', '--initial-branch=develop', seed);
  await git(seed, 'config', 'user.name', 'Fixture');
  await git(seed, 'config', 'user.email', 'fixture@example.invalid');
  await git(seed, 'config', 'commit.gpgsign', 'false');
  for (const file of [...artifacts, 'README.md']) await put(seed, file, 'baseline\n');
  await commit(seed, 'baseline');
  await git(seed, 'remote', 'add', 'origin', origin);
  await git(seed, 'push', '-u', 'origin', 'develop');
  const gh = path.join(bin, 'gh');
  await writeFile(gh, `#!/bin/sh
native_only=false
case "$*" in
  *'--json number,isCrossRepository'*'select(.isCrossRepository == false)'*|*'--json headRefOid,isCrossRepository'*'select(.isCrossRepository == false)'*) native_only=true ;;
esac
case "$1 $2" in
  'pr list')
    case " $* " in
      *' --state open '*)
        if [ "$native_only" = false ] && [ -n "$GH_STUB_FORK_OPEN" ]; then printf '%s' "$GH_STUB_FORK_OPEN";
        else printf '%s' "$GH_STUB_OPEN"; fi ;;
      *' --state merged '*)
        if [ "$native_only" = false ] && [ -n "$GH_STUB_FORK_MERGED" ]; then printf '%s\\n' "$GH_STUB_FORK_MERGED";
        else printf '%s\\n' "$GH_STUB_MERGED_HEADS"; fi ;;
      *) exit 80 ;;
    esac ;;
  'pr create') printf 'created\\n' >> "$GH_STUB_LOG" ;;
  *) exit 81 ;;
esac
`);
  await chmod(gh, 0o755);
  let runs = 0;
  async function runner({ open = '', merged = '', forkOpen = '', forkMerged = '' } = {}) {
    const cwd = path.join(root, `runner-${runs++}`);
    await git(root, 'clone', '--branch', 'develop', origin, cwd);
    await git(cwd, 'config', 'commit.gpgsign', 'false');
    const output = path.join(cwd, '.git/workflow-output');
    const log = path.join(cwd, '.git/gh-log');
    const env = { ...process.env, PATH: `${bin}${path.delimiter}${process.env.PATH}`,
      SYNC_BRANCH: branch, GH_REPO: 'fixture/wdk-docs', RUNNER_TEMP: path.join(cwd, '.git'),
      GITHUB_OUTPUT: output, GH_STUB_OPEN: open, GH_STUB_MERGED_HEADS: merged,
      GH_STUB_FORK_OPEN: forkOpen, GH_STUB_FORK_MERGED: forkMerged, GH_STUB_LOG: log };
    const run = (name) => execute('bash', ['--noprofile', '--norc', '-eo', 'pipefail', '-c', shellStep(name)], { cwd, env });
    async function changed() {
      await writeFile(output, '');
      await run('Detect contract changes');
      return (await readFile(output, 'utf8')).trim() === 'changed=true';
    }
    return { cwd, run, changed, log };
  }
  async function update(version) {
    await git(seed, 'switch', '-c', branch);
    await put(seed, spec, `${version}\n`);
    const head = await commit(seed, version);
    await git(seed, 'push', '-u', 'origin', branch);
    await git(seed, 'switch', 'develop');
    return head;
  }
  async function merge(method, cycle) {
    await put(seed, 'README.md', `develop advanced before merge ${cycle}\n`);
    await commit(seed, `advance before merge ${cycle}`);
    await git(seed, 'fetch', 'origin');
    if (method === 'ordinary') await git(seed, 'merge', '--no-ff', `origin/${branch}`, '-m', `merge ${cycle}`);
    if (method === 'squash') {
      await git(seed, 'merge', '--squash', `origin/${branch}`);
      await commit(seed, `squash ${cycle}`);
    }
    if (method === 'rebase') {
      await git(seed, 'switch', '-c', `rebased-${cycle}`, `origin/${branch}`);
      await git(seed, 'rebase', 'develop');
      await git(seed, 'switch', 'develop');
      await git(seed, 'merge', '--ff-only', `rebased-${cycle}`);
    }
    await put(seed, 'README.md', `develop advanced ${cycle}\n`);
    await put(seed, artifacts[2], `maintainer guidance ${cycle}\n`);
    await commit(seed, `advance develop ${cycle}`);
    await git(seed, 'push', 'origin', 'develop');
  }
  return { root, seed, origin, runner, update, merge };
}

for (const method of ['ordinary', 'squash', 'rebase']) {
  test(`workflow repeats merged updates with a retained branch after ${method} merges and develop advances`, async (t) => {
    const f = await fixture(t);
    let previous = await f.update('contract 1');
    for (let cycle = 1; cycle <= 2; cycle += 1) {
      await f.merge(method, cycle);
      if (method !== 'ordinary') await assert.rejects(git(f.seed, 'merge-base', '--is-ancestor', previous, 'develop'));
      const r = await f.runner({ merged: previous });
      await r.run('Resume the documentation update branch');
      assert.equal(await git(r.cwd, 'branch', '--show-current'), branch);
      assert.equal(await git(r.cwd, 'diff', 'origin/develop', 'HEAD'), '', 'reviewed branch must resume with the current develop tree');
      assert.equal(await r.changed(), false, 'an unchanged contract must not propose another update');
      await put(r.cwd, spec, `contract ${cycle + 1}\n`);
      assert.equal(await r.changed(), true);
      await r.run('Open or update a draft documentation PR');
      const next = await git(r.cwd, 'rev-parse', 'HEAD');
      await git(r.cwd, 'merge-base', '--is-ancestor', previous, next);
      assert.equal(await git(r.cwd, 'ls-remote', 'origin', `refs/heads/${branch}`), `${next}\trefs/heads/${branch}`);
      assert.equal(await readFile(r.log, 'utf8'), 'created\n');
      assert.equal(await readFile(path.join(r.cwd, artifacts[2]), 'utf8'), `maintainer guidance ${cycle}\n`);
      previous = next;
    }
  });
}

test('workflow starts safely when the automation branch is absent or deleted after a squash merge', async (t) => {
  for (const deleted of [false, true]) {
    const f = await fixture(t);
    if (deleted) {
      await f.update('contract 1');
      await f.merge('squash', 1);
      await git(f.seed, 'push', 'origin', '--delete', branch);
    }
    const r = await f.runner();
    await r.run('Resume the documentation update branch');
    assert.equal(await git(r.cwd, 'diff', 'origin/develop', 'HEAD'), '');
    assert.equal(await r.changed(), false);
    await put(r.cwd, spec, 'new contract\n');
    assert.equal(await r.changed(), true);
    await r.run('Open or update a draft documentation PR');
    assert.equal(await readFile(r.log, 'utf8'), 'created\n');
  }
});

test('workflow retains the current develop tree when a historically merged head is ahead of it', async (t) => {
  const f = await fixture(t);
  const previous = await f.update('historically merged contract');
  const r = await f.runner({ merged: previous });
  await r.run('Resume the documentation update branch');
  assert.equal(await git(r.cwd, 'diff', 'origin/develop', 'HEAD'), '');
  await git(r.cwd, 'merge-base', '--is-ancestor', previous, 'HEAD');
  assert.equal(await r.changed(), false);
});

test('workflow preserves an open update while merging develop and updates its existing PR', async (t) => {
  const f = await fixture(t);
  const previous = await f.update('pending contract');
  await put(f.seed, 'README.md', 'new developer guidance\n');
  await commit(f.seed, 'advance develop');
  await git(f.seed, 'push', 'origin', 'develop');
  const r = await f.runner({ open: '123' });
  await r.run('Resume the documentation update branch');
  assert.equal(await readFile(path.join(r.cwd, spec), 'utf8'), 'pending contract\n');
  assert.equal(await readFile(path.join(r.cwd, 'README.md'), 'utf8'), 'new developer guidance\n');
  await put(r.cwd, spec, 'new pending contract\n');
  assert.equal(await r.changed(), true);
  await r.run('Open or update a draft documentation PR');
  await git(r.cwd, 'merge-base', '--is-ancestor', previous, 'HEAD');
  await assert.rejects(readFile(r.log), { code: 'ENOENT' });
});

test('workflow rejects abandoned work, stale merge evidence and unexpected branch files without changing the remote', async (t) => {
  for (const kind of ['abandoned', 'stale-head', 'unexpected-file']) {
    const f = await fixture(t);
    const previous = await f.update('pending contract');
    if (kind === 'stale-head') {
      await f.merge('squash', 1);
      await git(f.seed, 'switch', branch);
      await put(f.seed, spec, 'unreviewed follow-up\n');
      await commit(f.seed, 'change the branch after its PR was merged');
      await git(f.seed, 'push', 'origin', branch);
    }
    if (kind === 'unexpected-file') {
      await git(f.seed, 'switch', branch);
      await put(f.seed, 'unexpected.txt', 'unrelated work\n');
      await commit(f.seed, 'unrelated change');
      await git(f.seed, 'push', 'origin', branch);
    }
    const remote = await git(f.seed, 'ls-remote', 'origin', `refs/heads/${branch}`);
    const r = await f.runner({ open: kind === 'unexpected-file' ? '123' : '',
      merged: kind === 'stale-head' ? previous : '' });
    await assert.rejects(r.run('Resume the documentation update branch'), (error) => {
      assert.equal(error.code, 1);
      assert.match(error.stdout, kind === 'unexpected-file' ? /Unexpected change/ : /has not been merged/);
      return true;
    });
    assert.equal(await git(r.cwd, 'ls-remote', 'origin', `refs/heads/${branch}`), remote);
    assert.equal(await git(r.cwd, 'rev-parse', `origin/${branch}`), remote.split('\t')[0]);
  }
});

test('workflow ignores same-named fork PRs when resuming and creating upstream updates', async (t) => {
  const f = await fixture(t);
  const previous = await f.update('unmerged upstream contract');
  const blocked = await f.runner({ forkOpen: '999', forkMerged: previous });
  await assert.rejects(blocked.run('Resume the documentation update branch'), (error) => {
    assert.equal(error.code, 1);
    assert.match(error.stdout, /has not been merged/);
    return true;
  });
  const upstream = await f.runner({ open: '123', forkOpen: '999' });
  await upstream.run('Resume the documentation update branch');
  assert.equal(await readFile(path.join(upstream.cwd, spec), 'utf8'), 'unmerged upstream contract\n');
  await f.merge('squash', 1);
  const fresh = await f.runner({ merged: previous, forkOpen: '999' });
  await fresh.run('Resume the documentation update branch');
  await put(fresh.cwd, spec, 'new upstream contract\n');
  assert.equal(await fresh.changed(), true);
  await fresh.run('Open or update a draft documentation PR');
  assert.equal(await readFile(fresh.log, 'utf8'), 'created\n', 'a fork PR must not suppress the upstream PR');
});
