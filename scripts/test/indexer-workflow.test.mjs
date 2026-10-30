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
const checkpoint = 'automation/indexer-openapi-validated';
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

function restRows(records, defaultHead) {
  return records.map(({ number, state = 'MERGED', closedAt, mergedAt, headRefOid, isCrossRepository }) => ({
    number, state: state === 'MERGED' || state === 'CLOSED' ? 'closed' : state === 'OPEN' ? 'open' : state,
    closed_at: state === 'OPEN' ? null : closedAt ?? mergedAt ?? '2026-10-29T00:00:00Z',
    merged_at: state === 'MERGED' ? mergedAt ?? closedAt ?? '2026-10-29T00:00:00Z' : null,
    head: { sha: headRefOid ?? defaultHead, repo: { full_name: isCrossRepository ? 'fork/wdk-docs' : 'fixture/wdk-docs' } },
    base: { repo: { full_name: 'fixture/wdk-docs' } },
  }));
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
query=''
previous=''
for arg do
  if [ "$previous" = --jq ]; then query=$arg; fi
  previous=$arg
done
case "$1" in
  api)
    if [ "$GH_STUB_READ_ERROR" = 1 ]; then echo 'Unknown API read failure' >&2; exit 1; fi
    case " $* " in *' --paginate --slurp '*) ;; *) echo 'Missing complete pagination' >&2; exit 80 ;; esac
    if [ -n "$query" ]; then echo 'The --slurp option is not supported with --jq' >&2; exit 80; fi
    count=0
    if [ -f "$GH_STUB_OPEN_COUNT" ]; then read -r count < "$GH_STUB_OPEN_COUNT"; fi
    count=$((count + 1)); printf '%s\\n' "$count" > "$GH_STUB_OPEN_COUNT"
    if [ "$count" = "$GH_STUB_ABORT_OPEN_QUERY" ]; then kill -KILL "$PPID"; exit 1; fi
    open=$GH_STUB_OPEN_JSON
    if [ -f "$GH_STUB_OPEN_COUNT.merged" ]; then open='[]'; fi
    data=$(jq -n --argjson open "$open" --argjson history "$GH_STUB_ALL_JSON" --argjson merged "$GH_STUB_MERGED_JSON" '$open + $merged + $history | unique_by(.number) | sort_by(.number) | reverse')
    if [ "$GH_STUB_CLOSE_AFTER_PUSH" = 1 ] && [ "$count" -ge 3 ]; then
      data='[{"number":123,"state":"closed","closed_at":"2026-10-29T12:00:00Z","merged_at":null,"head":{"repo":{"full_name":"fixture/wdk-docs"}},"base":{"repo":{"full_name":"fixture/wdk-docs"}}}]'
    fi
    if [ "$count" = 2 ] && [ -n "$GH_STUB_MERGE_HEAD" ]; then
      git -C "$GH_STUB_ORIGIN" update-ref refs/heads/develop "$GH_STUB_MERGE_HEAD" || exit 1
      touch "$GH_STUB_OPEN_COUNT.merged"
    fi
    # Return raw slurped pages; the workflow runs its real jq flatten/filter pipe.
    printf '%s' "$data" | jq 'if length == 0 then [[]] else [range(0; length; 100) as $i | .[$i:($i + 100)]] end' ;;
  pr)
    if [ "$2" != create ]; then exit 81; fi
    printf 'created\\n' >> "$GH_STUB_LOG"
    if [ "$GH_STUB_CREATE_ERROR" = 1 ]; then echo 'HTTP 503: simulated PR creation failure' >&2; exit 1; fi ;;
  *) exit 81 ;;
esac
`);
  await chmod(gh, 0o755);
  let runs = 0;
  async function runner({ open = '', merged = '', forkOpen = '', forkMerged = '', forkLatest = '',
    latest = merged ? 'MERGED' : '', createError = '', abortOpenQuery = '',
    closeAfterPush = '', readError = '', history, mergedHistory } = {}) {
    const cwd = path.join(root, `runner-${runs++}`);
    await git(root, 'clone', '--no-local', '--branch', 'develop', origin, cwd);
    await git(cwd, 'config', 'commit.gpgsign', 'false');
    const baseHead = await git(cwd, 'rev-parse', 'origin/develop');
    const output = path.join(cwd, '.git/workflow-output');
    const log = path.join(cwd, '.git/gh-log');
    const env = { ...process.env, PATH: `${bin}${path.delimiter}${process.env.PATH}`,
      SYNC_BRANCH: branch, CHECKPOINT_BRANCH: checkpoint, GH_REPO: 'fixture/wdk-docs', RUNNER_TEMP: path.join(cwd, '.git'),
      GITHUB_OUTPUT: output, GH_STUB_LOG: log,
      GH_STUB_OPEN_JSON: JSON.stringify(restRows([
        ...(forkOpen ? [{ number: Number(forkOpen), state: 'OPEN', isCrossRepository: true }] : []),
        ...(open ? [{ number: Number(open), state: 'OPEN', isCrossRepository: false }] : []),
      ], baseHead)),
      GH_STUB_ALL_JSON: JSON.stringify(restRows(history ?? [
        ...(forkLatest ? [{ number: 999, state: forkLatest, closedAt: '2026-10-30T00:00:00Z', isCrossRepository: true }] : []),
        ...(latest ? [{ number: 123, state: latest, closedAt: '2026-10-29T00:00:00Z', isCrossRepository: false }] : []),
      ], baseHead)),
      GH_STUB_MERGED_JSON: JSON.stringify(restRows(mergedHistory ?? [
        ...(forkMerged ? [{ number: 999, headRefOid: forkMerged, mergedAt: '2026-10-30T00:00:00Z', isCrossRepository: true }] : []),
        ...(merged ? [{ number: 123, headRefOid: merged, mergedAt: '2026-10-29T00:00:00Z', isCrossRepository: false }] : []),
      ], baseHead)),
      GH_STUB_OPEN_COUNT: path.join(cwd, '.git/open-query-count'), GH_STUB_ABORT_OPEN_QUERY: abortOpenQuery,
      GH_STUB_CREATE_ERROR: createError, GH_STUB_CLOSE_AFTER_PUSH: closeAfterPush,
      GH_STUB_READ_ERROR: readError };
    const run = (name) => execute('bash', ['--noprofile', '--norc', '-eo', 'pipefail', '-c', shellStep(name)], { cwd, env });
    async function changed() {
      await writeFile(output, '');
      await run('Detect contract changes');
      return (await readFile(output, 'utf8')).trim() === 'changed=true';
    }
    return { cwd, run, changed, log, env };
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
  async function mark(head) {
    await git(seed, 'push', 'origin', `${head}:refs/heads/${checkpoint}`);
  }
  return { root, seed, origin, runner, update, merge, mark };
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
      assert.equal(await git(r.cwd, 'ls-remote', '--heads', 'origin', checkpoint), `${next}\trefs/heads/${checkpoint}`);
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

async function pendingUpdate(f, options) {
  const runner = await f.runner(options);
  await runner.run('Resume the documentation update branch');
  await put(runner.cwd, spec, 'new validated contract\n');
  assert.equal(await runner.changed(), true);
  return runner;
}

test('workflow recovers after PR creation failure and does not duplicate an unknown successful creation', async (t) => {
  for (const alreadyCreated of [false, true]) {
    const f = await fixture(t);
    const first = await pendingUpdate(f, { createError: '1' });
    await assert.rejects(first.run('Open or update a draft documentation PR'), (error) => {
      assert.match(error.stderr, /HTTP 503/); return true;
    });
    const head = await git(first.cwd, 'rev-parse', 'HEAD');
    assert.equal(await git(first.cwd, 'ls-remote', '--heads', 'origin', checkpoint), `${head}\trefs/heads/${checkpoint}`);
    const retry = await f.runner({ open: alreadyCreated ? '123' : '' });
    await retry.run('Resume the documentation update branch');
    assert.equal(await readFile(path.join(retry.cwd, spec), 'utf8'), 'new validated contract\n');
    assert.equal(await retry.changed(), true);
    await retry.run('Open or update a draft documentation PR');
    if (alreadyCreated) await assert.rejects(readFile(retry.log), { code: 'ENOENT' });
    else assert.equal(await readFile(retry.log, 'utf8'), 'created\n');
  }
});

test('workflow recovers when its runner is killed after the atomic push', async (t) => {
  const f = await fixture(t);
  const first = await pendingUpdate(f, { abortOpenQuery: '3' });
  await assert.rejects(first.run('Open or update a draft documentation PR'), (error) => {
    assert.ok(error.signal === 'SIGKILL' || error.code === 137, 'publisher must stop on the injected SIGKILL');
    return true;
  });
  const head = await git(first.cwd, 'rev-parse', 'HEAD');
  assert.equal(await git(first.cwd, 'ls-remote', '--heads', 'origin', checkpoint), `${head}\trefs/heads/${checkpoint}`);
  const retry = await f.runner();
  await retry.run('Resume the documentation update branch');
  assert.equal(await readFile(path.join(retry.cwd, spec), 'utf8'), 'new validated contract\n');
  assert.equal(await retry.changed(), true);
  await retry.run('Open or update a draft documentation PR');
  assert.equal(await readFile(retry.log, 'utf8'), 'created\n');
});

test('workflow refuses missing, wrong or stale-head checkpoints', async (t) => {
  for (const kind of ['missing', 'wrong', 'altered']) {
    const f = await fixture(t);
    const head = await f.update('pending contract');
    if (kind !== 'missing') await f.mark(kind === 'wrong' ? await git(f.seed, 'rev-parse', 'develop') : head);
    if (kind === 'altered') {
      await git(f.seed, 'switch', branch);
      await put(f.seed, spec, 'unvalidated change\n');
      await commit(f.seed, 'alter the marked branch');
      await git(f.seed, 'push', 'origin', branch);
    }
    const before = await git(f.seed, 'ls-remote', '--refs', 'origin');
    const runner = await f.runner();
    await assert.rejects(runner.run('Resume the documentation update branch'), (error) => {
      assert.match(error.stdout, /not been merged or checkpointed/); return true;
    });
    assert.equal(await git(f.seed, 'ls-remote', '--refs', 'origin'), before);
  }
});

test('workflow refuses a deleted unmerged checkpoint and an open PR whose head is missing', async (t) => {
  const f = await fixture(t);
  const head = await f.update('old pending contract');
  await f.mark(head);
  await git(f.seed, 'push', 'origin', '--delete', branch);
  const absent = await f.runner();
  await assert.rejects(absent.run('Resume the documentation update branch'), (error) => {
    assert.match(error.stdout, /unmerged checkpoint/); return true;
  });
  const open = await f.runner({ open: '123' });
  await assert.rejects(open.run('Resume the documentation update branch'), (error) => {
    assert.match(error.stdout, /open upstream PR has no automation branch/); return true;
  });
});

test('workflow respects explicit closure even for a valid marker and ignores fork closure history', async (t) => {
  const f = await fixture(t);
  const head = await f.update('pending contract');
  await f.mark(head);
  const closed = await f.runner({ latest: 'CLOSED' });
  await assert.rejects(closed.run('Resume the documentation update branch'), (error) => {
    assert.match(error.stdout, /closed without merging/); return true;
  });
  const fork = await f.runner({ forkLatest: 'CLOSED', forkOpen: '999' });
  await fork.run('Resume the documentation update branch');
  assert.equal(await readFile(path.join(fork.cwd, spec), 'utf8'), 'pending contract\n');
  await git(f.seed, 'push', 'origin', '--delete', branch);
  const absent = await f.runner({ latest: 'CLOSED' });
  await assert.rejects(absent.run('Resume the documentation update branch'), (error) => {
    assert.match(error.stdout, /closed without merging/); return true;
  });
});

test('workflow resumes a deleted human-edited merged PR and verifies its fetched historical head', async (t) => {
  for (const wrongHead of [false, true]) {
    const f = await fixture(t);
    const first = await pendingUpdate(f);
    await first.run('Open or update a draft documentation PR');
    const validated = await git(first.cwd, 'rev-parse', 'HEAD');
    await git(f.seed, 'fetch', 'origin');
    await git(f.seed, 'switch', '-c', branch, `origin/${branch}`);
    await put(f.seed, artifacts[1], 'maintainer metadata\n');
    const human = await commit(f.seed, 'human PR amendment');
    await git(f.seed, 'push', 'origin', branch);
    await git(f.origin, 'update-ref', 'refs/pull/123/head', wrongHead ? validated : human);
    await git(f.seed, 'switch', 'develop');
    await f.merge('squash', 1);
    await git(f.seed, 'push', 'origin', '--delete', branch);
    const retry = await f.runner({ merged: human });
    await assert.rejects(git(retry.cwd, 'cat-file', '-e', `${human}^{commit}`), 'a fresh clone must need the historical pull ref');
    if (wrongHead) {
      await assert.rejects(retry.run('Resume the documentation update branch'), (error) => {
        assert.match(error.stdout, /merged PR head changed/); return true;
      });
      continue;
    }
    await retry.run('Resume the documentation update branch');
    assert.equal(await git(retry.cwd, 'diff', 'origin/develop', 'HEAD'), '');
    await git(retry.cwd, 'merge-base', '--is-ancestor', validated, 'HEAD');
    assert.equal(await readFile(path.join(retry.cwd, artifacts[1]), 'utf8'), 'maintainer metadata\n');
    await put(retry.cwd, spec, 'next contract\n');
    assert.equal(await retry.changed(), true);
    await retry.run('Open or update a draft documentation PR');
    const next = await git(retry.cwd, 'rev-parse', 'HEAD');
    assert.equal(await git(retry.cwd, 'ls-remote', '--heads', 'origin', checkpoint), `${next}\trefs/heads/${checkpoint}`);
  }
});

test('workflow refuses unrelated or unexpected checkpoint work even with a native open PR', async (t) => {
  for (const unexpected of [false, true]) {
    const f = await fixture(t);
    await f.update('pending branch');
    await git(f.seed, 'switch', '-c', 'disjoint-checkpoint');
    await put(f.seed, unexpected ? 'unexpected.txt' : spec, 'disjoint checkpoint\n');
    const head = await commit(f.seed, 'disjoint checkpoint');
    await f.mark(head);
    const runner = await f.runner({ open: '123' });
    const before = await git(f.seed, 'ls-remote', '--refs', 'origin');
    await assert.rejects(runner.run('Resume the documentation update branch'), (error) => {
      assert.match(error.stdout, unexpected ? /Unexpected change/ : /checkpoint contains unmerged work/); return true;
    });
    assert.equal(await git(f.seed, 'ls-remote', '--refs', 'origin'), before);
  }
});

test('workflow orders complete terminal history by close time, prefers closure on ties and accepts many native cycles', async (t) => {
  for (const kind of ['older-reclosed', 'tie', 'many-merged', 'older-reclosed-after-100']) {
    const f = await fixture(t);
    const head = await f.update('validated pending contract');
    await f.mark(head);
    const history = kind === 'many-merged' || kind === 'older-reclosed-after-100'
      ? [
        ...Array.from({ length: 201 }, (_, index) => ({ number: index + 2, state: 'MERGED', closedAt: '2026-10-28T00:00:00Z', isCrossRepository: false })),
        ...(kind === 'older-reclosed-after-100' ? [{ number: 1, state: 'CLOSED', closedAt: '2026-10-29T00:00:00Z', isCrossRepository: false }] : []),
      ]
      : [
        { number: 123, state: 'MERGED', closedAt: '2026-10-28T00:00:00Z', isCrossRepository: false },
        { number: 122, state: 'CLOSED', closedAt: kind === 'tie' ? '2026-10-28T00:00:00Z' : '2026-10-29T00:00:00Z', isCrossRepository: false },
      ];
    const runner = await f.runner({ history });
    if (kind === 'many-merged') await runner.run('Resume the documentation update branch');
    else await assert.rejects(runner.run('Resume the documentation update branch'), (error) => {
      assert.match(error.stdout, /closed without merging/); return true;
    });
  }
});

test('workflow rechecks closure before push and before creating a PR', async (t) => {
  for (const when of ['before-push', 'after-push']) {
    const f = await fixture(t);
    const runner = await pendingUpdate(f, { closeAfterPush: when === 'after-push' ? '1' : '' });
    if (when === 'before-push') runner.env.GH_STUB_ALL_JSON = JSON.stringify(restRows([{ number: 123, state: 'CLOSED', closedAt: '2026-10-29T12:00:00Z', isCrossRepository: false }]));
    await assert.rejects(runner.run('Open or update a draft documentation PR'), (error) => {
      assert.match(error.stdout, /closed without merging/); return true;
    });
    const remote = await git(runner.cwd, 'ls-remote', '--refs', 'origin', `refs/heads/${branch}`);
    assert.equal(Boolean(remote), when === 'after-push');
    await assert.rejects(readFile(runner.log), { code: 'ENOENT' });
    const retry = await f.runner({ latest: 'CLOSED' });
    await assert.rejects(retry.run('Resume the documentation update branch'));
  }
});

test('workflow rejects a stale head replayed against the current checkpoint', async (t) => {
  const f = await fixture(t);
  const abandoned = await f.update('old validated candidate');
  await f.mark(abandoned);
  await git(f.seed, 'switch', '-c', 'later-candidate');
  await put(f.seed, spec, 'later merged candidate\n');
  const merged = await commit(f.seed, 'later update');
  await git(f.seed, 'push', 'origin', 'later-candidate');
  await git(f.origin, 'update-ref', `refs/heads/${branch}`, merged);
  await git(f.origin, 'update-ref', `refs/heads/${checkpoint}`, merged);
  await git(f.seed, 'switch', 'develop');
  await f.merge('squash', 1);
  // Simulate a stale operator replay solely in this disposable bare origin.
  await git(f.origin, 'update-ref', `refs/heads/${branch}`, abandoned);
  const runner = await f.runner({ merged });
  await assert.rejects(runner.run('Resume the documentation update branch'), (error) => {
    assert.match(error.stdout, /not been merged or checkpointed/); return true;
  });
  assert.equal(await git(runner.cwd, 'ls-remote', '--heads', 'origin', checkpoint), `${merged}\trefs/heads/${checkpoint}`);
});

test('workflow refuses unstaged validator changes before publishing', async (t) => {
  const f = await fixture(t);
  const runner = await pendingUpdate(f);
  await put(runner.cwd, artifacts[2], 'changed after staging\n');
  await assert.rejects(runner.run('Open or update a draft documentation PR'));
  assert.equal(await git(runner.cwd, 'ls-remote', '--heads', 'origin', branch, checkpoint), '');
});

test('workflow recovers a pending update when the prior PR merges after the publication intent check', async (t) => {
  const f = await fixture(t);
  const first = await pendingUpdate(f);
  await first.run('Open or update a draft documentation PR');
  const previous = await git(first.cwd, 'rev-parse', 'HEAD');
  const next = await pendingUpdate(f, { open: '123', createError: '1', merged: previous });
  await put(next.cwd, artifacts[1], 'second pending provenance\n');
  assert.equal(await next.changed(), true);
  await git(f.seed, 'fetch', 'origin');
  await git(f.seed, 'merge', '--squash', `origin/${branch}`);
  await put(f.seed, 'README.md', 'concurrent merge\n');
  const merged = await commit(f.seed, 'prepare concurrent squash merge');
  await git(f.seed, 'push', 'origin', 'HEAD:refs/heads/prepared-merge');
  next.env.GH_STUB_ORIGIN = f.origin;
  next.env.GH_STUB_MERGE_HEAD = merged;
  await assert.rejects(next.run('Open or update a draft documentation PR'), (error) => {
    assert.match(error.stderr, /HTTP 503/); return true;
  });
  assert.equal(await git(next.cwd, 'ls-remote', '--heads', 'origin', 'develop'), `${merged}\trefs/heads/develop`);
  const retry = await f.runner({ merged: previous });
  await retry.run('Resume the documentation update branch');
  assert.equal(await readFile(path.join(retry.cwd, spec), 'utf8'), 'new validated contract\n');
  assert.equal(await readFile(path.join(retry.cwd, artifacts[1]), 'utf8'), 'second pending provenance\n');
  assert.equal(await readFile(path.join(retry.cwd, 'README.md'), 'utf8'), 'concurrent merge\n');
  assert.equal(await retry.changed(), true);
  await retry.run('Open or update a draft documentation PR');
  assert.equal(await readFile(retry.log, 'utf8'), 'created\n');
});

test('workflow stops on unknown API reads and unknown state', async (t) => {
  for (const kind of ['read', 'unknown-state']) {
    const f = await fixture(t);
    const head = await f.update('pending contract');
    await f.mark(head);
    const runner = await f.runner({ readError: kind === 'read' ? '1' : '',
      latest: kind === 'unknown-state' ? 'UNKNOWN' : '' });
    await assert.rejects(runner.run('Resume the documentation update branch'), (error) => {
      assert.match(`${error.stdout}${error.stderr}`, /unknown|Unknown/); return true;
    });
  }
});

test('workflow atomic publication preserves both refs when either ref is rejected', async (t) => {
  for (const kind of ['checkpoint-hook', 'concurrent-branch', 'concurrent-checkpoint']) {
    const f = await fixture(t);
    if (kind === 'concurrent-branch') await f.update('pending contract');
    const runner = await pendingUpdate(f, { open: kind === 'concurrent-branch' ? '123' : '' });
    if (kind === 'checkpoint-hook') {
      const hook = path.join(f.origin, 'hooks/update');
      await writeFile(hook, `#!/bin/sh\ncase "$1" in refs/heads/${checkpoint}) echo "checkpoint rejected" >&2; exit 1 ;; esac\n`);
      await chmod(hook, 0o755);
    } else if (kind === 'concurrent-branch') {
      await git(f.seed, 'switch', branch);
      await put(f.seed, spec, 'concurrent operator update\n');
      await commit(f.seed, 'concurrent change');
      await git(f.seed, 'push', 'origin', branch);
    } else {
      await git(f.seed, 'switch', '-c', 'concurrent-checkpoint');
      await put(f.seed, spec, 'concurrent checkpoint\n');
      const head = await commit(f.seed, 'concurrent checkpoint');
      await f.mark(head);
    }
    const before = await git(f.seed, 'ls-remote', '--refs', 'origin');
    await assert.rejects(runner.run('Open or update a draft documentation PR'), (error) => {
      assert.match(error.stderr, /atomic|non-fast-forward|fetch first/); return true;
    });
    assert.equal(await git(f.seed, 'ls-remote', '--refs', 'origin'), before);
    await assert.rejects(readFile(runner.log), { code: 'ENOENT' });
  }
});
