import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import fs, { mkdtemp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import lockfile from 'proper-lockfile';

import {
  parseJsonStrict,
  serializeWdkBlocksCatalog,
  serializeWdkBlocksCatalogSchema,
  syncWdkBlocksCatalog,
  validateWdkBlocksCatalogCompatibility,
  validateWdkBlocksCatalogSchemaCompatibility,
  validateWdkBlocksCatalog,
} from '../sync-wdk-blocks-catalog.mjs';

const schemaUrl = 'https://docs.wdk.tether.io/catalog/v1/schema.json';

function block(overrides = {}) {
  return {
    id: 'tetherto.wdk.core',
    slug: 'wdk-core',
    name: 'wdk-core',
    npmPackage: '@tetherto/wdk',
    githubRepo: 'tetherto/wdk',
    category: 'core',
    chains: [],
    badge: 'official',
    description: 'Core SDK',
    docsUrl: 'https://docs.wdk.tether.io/sdk/core-module/',
    ...overrides,
  };
}

function catalog(blocks = [block()], overrides = {}) {
  return {
    $schema: schemaUrl,
    schemaVersion: 1,
    blocks,
    ...overrides,
  };
}

function markdown(...packages) {
  return [
    '## Core Module',
    '',
    '| Module | Description | Documentation |',
    '|--------|-------------|---------------|',
    ...packages.map(
      (pkg) =>
        `| [\`${pkg}\`](https://example.com) | Core SDK | [Docs](https://docs.wdk.tether.io/sdk/core-module/) |`,
    ),
  ].join('\n');
}

function repeatedMarkdown(packageName, communitySource = 'https://example.com') {
  return [
    markdown(packageName),
    '',
    '## Community Modules',
    '',
    '| Module | Category | Description | Documentation |',
    '|--------|----------|-------------|---------------|',
    `| [\`${packageName}\`](${communitySource}) | Core | Listing copy | [Docs](https://docs.wdk.tether.io/sdk/core-module/) |`,
  ].join('\n');
}

function walletMarkdown(packageName) {
  return [
    '## Wallet Modules',
    '',
    '| Module | Blockchain | Description | Documentation |',
    '|--------|------------|-------------|---------------|',
    `| [\`${packageName}\`](https://github.com/tetherto/wdk) | EVM | Core SDK | [Docs](https://docs.wdk.tether.io/sdk/core-module/) |`,
  ].join('\n');
}

function communityMarkdown(packageName) {
  return [
    '## Community Modules',
    '',
    '| Module | Category | Description | Documentation |',
    '|--------|----------|-------------|---------------|',
    `| [\`${packageName}\`](https://www.npmjs.com/package/${packageName}) | Swidge | Core SDK | [README](https://github.com/bob-collective/wdk-protocol-swidge-gateway#readme) |`,
  ].join('\n');
}

test('validates and publishes the current 34-block catalog deterministically', async () => {
  const [source, allModules, published] = await Promise.all([
    readFile('content/feeds/wdk-blocks.v1.json', 'utf8'),
    readFile('content/feeds/all-modules.md', 'utf8'),
    readFile('public/catalog/v1/blocks.json', 'utf8'),
  ]);
  const parsed = validateWdkBlocksCatalog(parseJsonStrict(source), allModules);

  assert.equal(parsed.blocks.length, 34);
  assert.deepEqual(
    Object.fromEntries(
      Object.entries(Object.groupBy(parsed.blocks, ({ category }) => category)).map(
        ([category, blocks]) => [category, blocks.length],
      ),
    ),
    {
      core: 1,
      backup: 1,
      wallet: 16,
      swidge: 8,
      pricing: 2,
      swap: 1,
      bridge: 1,
      lending: 2,
      fiat: 2,
    },
  );
  assert.equal(parsed.blocks.filter(({ badge }) => badge === 'community').length, 14);
  assert.equal(parsed.blocks.find(({ npmPackage }) => npmPackage === '@tetherto/wdk')?.slug, 'wdk-core');
  assert.equal(parsed.blocks.find(({ npmPackage }) => npmPackage === '@arkade-os/wdk')?.slug, 'arkade-wdk');
  assert.match(
    parsed.blocks.find(({ npmPackage }) => npmPackage === 'wdk-protocol-swidge-orchestra')
      ?.description ?? '',
    /filter through package discovery/,
  );
  assert.match(
    parsed.blocks.find(
      ({ npmPackage }) => npmPackage === '@symbiosis-finance/wdk-protocol-swidge-symbiosis',
    )?.description ?? '',
    /capability-gated TON, Tron, and Solana/,
  );
  assert.equal(
    parsed.blocks.find(
      ({ npmPackage }) => npmPackage === '@swapdk/wdk-protocol-swidge-swapdk',
    )?.githubRepo,
    'Swap-DK/wdk-protocol-bridges-swapdk/tree/main/packages/swidge',
  );
  assert.deepEqual(
    parsed.blocks.find(
      ({ npmPackage }) => npmPackage === '@symbiosis-finance/wdk-protocol-swidge-symbiosis',
    )?.chains,
    ['bitcoin', 'ethereum', 'solana', 'ton', 'tron'],
  );
  assert.deepEqual(
    parsed.blocks.find(
      ({ npmPackage }) => npmPackage === 'wdk-protocol-swidge-orchestra',
    )?.chains,
    ['bitcoin', 'ethereum', 'solana', 'ton', 'tron', 'spark'],
  );
  assert.deepEqual(
    parsed.blocks.find(
      ({ npmPackage }) => npmPackage === '@rhino.fi/wdk-protocol-swidge-rhinofi',
    )?.chains,
    ['ethereum', 'solana', 'tron'],
  );
  assert.equal(
    parsed.blocks.find(
      ({ npmPackage }) => npmPackage === '@moonpay/wdk-protocol-swidge-moonpay-trade',
    )?.githubRepo,
    null,
  );
  assert.equal(published, serializeWdkBlocksCatalog(parsed));
  assert.equal(await syncWdkBlocksCatalog({ write: false }), false);
});

test('accepts repeated Markdown presentation rows and nested GitHub locators', () => {
  const entry = block({
    githubRepo: 'morpho-org/sdks/tree/main/packages/wdk-protocol-lending-morpho-evm',
    badge: 'community',
  });

  const source = repeatedMarkdown(
    entry.npmPackage,
    'https://github.com/morpho-org/sdks/tree/main/packages/wdk-protocol-lending-morpho-evm',
  );

  assert.equal(validateWdkBlocksCatalog(catalog([entry]), source).blocks.length, 1);
  assert.throws(
    () => validateWdkBlocksCatalog(catalog([{ ...entry, githubRepo: 'attacker/unrelated' }]), source),
    /githubRepo differs.*morpho-org\/sdks/,
  );
});

test('accepts an explicit null when a package has no public GitHub source', () => {
  const entry = block({ githubRepo: null });

  assert.equal(
    validateWdkBlocksCatalog(catalog([entry]), markdown(entry.npmPackage)).blocks[0].githubRepo,
    null,
  );
});

test('rejects malformed fields and unsupported contract values', () => {
  const invalidCatalogs = [
    catalog(undefined, { schemaVersion: 2 }),
    catalog([block({ githubRepo: '' })]),
    catalog([block({ githubRepo: undefined })]),
    catalog([block({ githubRepo: 'https://github.com/tetherto/wdk' })]),
    catalog([block({ githubRepo: 'tetherto/wdk/tree/main/path with spaces' })]),
    catalog([block({ githubRepo: '../wdk' })]),
    catalog([block({ githubRepo: 'tetherto/..' })]),
    catalog([block({ githubRepo: 'tetherto/wdk/tree/main/../../private' })]),
    catalog([block({ githubRepo: 'tetherto/wdk/tree/main/path?raw=1' })]),
    catalog([block({ githubRepo: 'tetherto/wdk/tree/main//path' })]),
    catalog([block({ category: 'community' })]),
    catalog([block({ chains: ['unknown'] })]),
    catalog([block({ badge: 'trusted' })]),
    catalog([block({ docsUrl: 'http://docs.wdk.tether.io/' })]),
    catalog([block({ unexpected: true })]),
    catalog([block({ chains: ['bitcoin', 'bitcoin'] })]),
    catalog([block()], { blockCount: 1 }),
  ];

  invalidCatalogs.forEach((value) => {
    assert.throws(() => validateWdkBlocksCatalog(value, markdown('@tetherto/wdk')));
  });
});

test('rejects duplicate JSON keys before immutable identities can be overwritten', () => {
  assert.throws(
    () =>
      parseJsonStrict(
        '{"schemaVersion":1,"blocks":[{"id":"tetherto.wdk.core","id":"override"}]}',
      ),
    /Duplicate JSON key `id` at \$\.blocks\[0\]\.id/,
  );
});

test('keeps v1 identities and historical claims append-only', () => {
  const previous = catalog([
    block({ legacySlugs: ['wdk'], legacyNpmPackages: ['@tetherto/wdk-core'] }),
  ]);
  const renamed = catalog([
    block({
      slug: 'wdk-sdk',
      legacySlugs: ['wdk-core', 'wdk'],
      npmPackage: '@tetherto/wdk-sdk',
      legacyNpmPackages: ['@tetherto/wdk', '@tetherto/wdk-core'],
    }),
  ]);

  assert.doesNotThrow(() => validateWdkBlocksCatalogCompatibility(previous, renamed));
  assert.throws(
    () =>
      validateWdkBlocksCatalogCompatibility(
        previous,
        catalog([
          block({
            id: 'tetherto.wdk.other',
            slug: 'wdk-other',
            npmPackage: '@tetherto/other',
          }),
        ]),
      ),
    /cannot remove catalog identity/,
  );
  assert.throws(
    () => validateWdkBlocksCatalogCompatibility(previous, catalog([block()])),
    /must retain slug claim `wdk`/,
  );
  assert.throws(
    () =>
      validateWdkBlocksCatalogCompatibility(
        previous,
        catalog([block({ legacySlugs: ['wdk'], legacyNpmPackages: ['@tetherto/other'] })]),
      ),
    /must retain npm claim `@tetherto\/wdk-core`/,
  );
});

test('keeps the published v1 schema immutable', () => {
  const previous = parseJsonStrict(serializeWdkBlocksCatalogSchema());
  const addedProperty = structuredClone(previous);
  addedProperty.properties.blocks.items.properties.owner = { type: 'string' };
  const addedEnum = structuredClone(previous);
  addedEnum.properties.blocks.items.properties.category.enum.push('staking');

  assert.doesNotThrow(() => validateWdkBlocksCatalogSchemaCompatibility(previous, previous));
  assert.throws(
    () => validateWdkBlocksCatalogSchemaCompatibility(previous, addedProperty),
    /v1 schema cannot change/,
  );
  assert.throws(
    () => validateWdkBlocksCatalogSchemaCompatibility(previous, addedEnum),
    /v1 schema cannot change/,
  );
});

test('rejects duplicate canonical and legacy identity claims', () => {
  const collisions = [
    [block(), block({ id: 'tetherto.wdk.other', npmPackage: '@tetherto/other', slug: 'wdk-core' })],
    [block(), block({ id: 'tetherto.wdk.other', npmPackage: '@tetherto/wdk', slug: 'wdk-other' })],
    [block(), block({ id: 'tetherto.wdk.core', npmPackage: '@tetherto/other', slug: 'wdk-other' })],
    [block({ legacySlugs: ['wdk-other'] }), block({ id: 'tetherto.wdk.other', npmPackage: '@tetherto/other', slug: 'wdk-other' })],
    [block({ legacyNpmPackages: ['@tetherto/other'] }), block({ id: 'tetherto.wdk.other', npmPackage: '@tetherto/other', slug: 'wdk-other' })],
  ];

  collisions.forEach((blocks) => {
    assert.throws(() =>
      validateWdkBlocksCatalog(catalog(blocks), markdown(...blocks.map(({ npmPackage }) => npmPackage))),
    );
  });
});

test('rejects catalog and Markdown package coverage drift', () => {
  assert.throws(
    () => validateWdkBlocksCatalog(catalog(), markdown('@tetherto/wdk', '@arkade-os/wdk')),
    /missing: @arkade-os\/wdk/,
  );
  assert.throws(
    () => validateWdkBlocksCatalog(catalog(), markdown('@arkade-os/wdk')),
    /extra: @tetherto\/wdk/,
  );
});

test('rejects package tables under unmapped module headings', () => {
  const source = [
    markdown('@tetherto/wdk'),
    '',
    '## Staking Modules',
    '',
    '| Module | Description | Documentation |',
    '|--------|-------------|---------------|',
    '| [@example/wdk-staking](https://example.com) | Staking | [Docs](https://example.com/docs) |',
  ].join('\n');

  assert.throws(
    () => validateWdkBlocksCatalog(catalog(), source),
    /Unmapped All Modules section contains package row `@example\/wdk-staking`/,
  );
  assert.throws(
    () =>
      validateWdkBlocksCatalog(
        catalog(),
        markdown('@tetherto/wdk').replace('`@tetherto/wdk`', '<code>@tetherto/wdk</code>'),
      ),
    /Invalid package cell/,
  );
});

test('rejects package-looking rows under unrecognized table headers', () => {
  const rows = [
    '| [@example/wdk-new](https://example.com/wdk-new) | Wallet | [Docs](https://example.com/docs) |',
    '| `@flashnet/orchestra-wdk` | Swidge | [Docs](https://example.com/docs) |',
    '| `@example/wdk.wallet` | Wallet | [Docs](https://example.com/docs) |',
    '| `@example/sdk_wdk` | Wallet | [Docs](https://example.com/docs) |',
  ];

  rows.forEach((row) => {
    const source = [
      markdown('@tetherto/wdk'),
      '',
      '## Wallet Modules',
      '',
      '| SDK | Description | Documentation |',
      '|-----|-------------|---------------|',
      row,
    ].join('\n');

    assert.throws(
      () => validateWdkBlocksCatalog(catalog(), source),
      /Unrecognized All Modules table header contains package row/,
    );
  });
});

test('rejects catalog field drift from the Markdown source', () => {
  const source = markdown('@tetherto/wdk');

  assert.throws(
    () => validateWdkBlocksCatalog(catalog([block({ description: 'Different copy' })]), source),
    /description differs/,
  );
  assert.throws(
    () =>
      validateWdkBlocksCatalog(
        catalog([block({ docsUrl: 'https://docs.wdk.tether.io/other/' })]),
        source,
      ),
    /docsUrl differs/,
  );
  assert.throws(
    () => validateWdkBlocksCatalog(catalog([block({ badge: 'verified' })]), source),
    /badge differs/,
  );

  const walletSource = walletMarkdown('@tetherto/wdk');
  const walletBlock = block({ category: 'wallet', chains: ['ethereum'] });
  assert.doesNotThrow(() => validateWdkBlocksCatalog(catalog([walletBlock]), walletSource));
  assert.throws(
    () =>
      validateWdkBlocksCatalog(
        catalog([{ ...walletBlock, githubRepo: 'tetherto/other' }]),
        walletSource,
      ),
    /githubRepo differs/,
  );
  assert.throws(
    () =>
      validateWdkBlocksCatalog(
        catalog([{ ...walletBlock, chains: ['bitcoin'] }]),
        walletSource,
      ),
    /chains differ/,
  );

  const communitySource = communityMarkdown('@tetherto/wdk');
  const communityBlock = block({
    badge: 'community',
    category: 'swidge',
    docsUrl: 'https://github.com/bob-collective/wdk-protocol-swidge-gateway#readme',
    githubRepo: 'wrong-owner/wrong-repo',
  });
  assert.throws(
    () => validateWdkBlocksCatalog(catalog([communityBlock]), communitySource),
    /githubRepo differs.*bob-collective\/wdk-protocol-swidge-gateway/,
  );

  assert.throws(
    () => validateWdkBlocksCatalog(catalog([walletBlock]), walletSource.replace('EVM', 'Sui')),
    /Unmapped All Modules blockchain `sui`/,
  );
});

test('reports stale output in check mode and does not mutate targets after invalid input', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'wdk-blocks-catalog-'));
  const sourcePath = path.join(root, 'content/feeds/wdk-blocks.v1.json');
  const markdownPath = path.join(root, 'content/feeds/all-modules.md');
  const catalogTargetPath = path.join(root, 'public/catalog/v1/blocks.json');
  const schemaTargetPath = path.join(root, 'public/catalog/v1/schema.json');
  const options = { sourcePath, markdownPath, catalogTargetPath, schemaTargetPath };

  await Promise.all([
    mkdir(path.dirname(sourcePath), { recursive: true }),
    mkdir(path.dirname(catalogTargetPath), { recursive: true }),
  ]);
  await Promise.all([
    writeFile(sourcePath, JSON.stringify(catalog()), 'utf8'),
    writeFile(markdownPath, markdown('@tetherto/wdk'), 'utf8'),
    writeFile(catalogTargetPath, 'old catalog', 'utf8'),
    writeFile(schemaTargetPath, 'old schema', 'utf8'),
  ]);

  assert.equal(await syncWdkBlocksCatalog({ ...options, write: false }), true);
  await writeFile(sourcePath, '{ invalid json', 'utf8');
  await assert.rejects(() => syncWdkBlocksCatalog(options));
  assert.equal(await readFile(catalogTargetPath, 'utf8'), 'old catalog');
  assert.equal(await readFile(schemaTargetPath, 'utf8'), 'old schema');

  await writeFile(
    sourcePath,
    serializeWdkBlocksCatalog(catalog()).replace(
      '"id": "tetherto.wdk.core"',
      '"id": "tetherto.wdk.core",\n      "id": "overridden.identity"',
    ),
    'utf8',
  );
  await assert.rejects(() => syncWdkBlocksCatalog(options), /Duplicate JSON key `id`/);
  assert.equal(await readFile(catalogTargetPath, 'utf8'), 'old catalog');
  assert.equal(await readFile(schemaTargetPath, 'utf8'), 'old schema');

  await writeFile(sourcePath, serializeWdkBlocksCatalog(catalog()), 'utf8');
  await assert.rejects(() => syncWdkBlocksCatalog({ ...options, previousCatalog: false, write: false }));
  assert.equal(await readFile(catalogTargetPath, 'utf8'), 'old catalog');
  assert.equal(await readFile(schemaTargetPath, 'utf8'), 'old schema');
});

test('rolls back both outputs when the second promotion fails', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'wdk-blocks-catalog-rollback-'));
  const sourcePath = path.join(root, 'content/feeds/wdk-blocks.v1.json');
  const markdownPath = path.join(root, 'content/feeds/all-modules.md');
  const catalogTargetPath = path.join(root, 'public/catalog/v1/blocks.json');
  const schemaTargetPath = path.join(root, 'public/catalog/v1/schema.json');
  const options = { sourcePath, markdownPath, catalogTargetPath, schemaTargetPath };

  await Promise.all([
    mkdir(path.dirname(sourcePath), { recursive: true }),
    mkdir(path.dirname(catalogTargetPath), { recursive: true }),
  ]);
  await Promise.all([
    writeFile(sourcePath, serializeWdkBlocksCatalog(catalog()), 'utf8'),
    writeFile(markdownPath, markdown('@tetherto/wdk'), 'utf8'),
    writeFile(catalogTargetPath, 'old catalog', 'utf8'),
    writeFile(schemaTargetPath, 'old schema', 'utf8'),
  ]);

  let renameCount = 0;
  const fileSystem = {
    ...fs,
    async rename(from, to) {
      renameCount += 1;
      if (renameCount === 4) throw Object.assign(new Error('injected promotion failure'), { code: 'EIO' });
      return fs.rename(from, to);
    },
  };

  await assert.rejects(
    () => syncWdkBlocksCatalog({ ...options, fileSystem }),
    /injected promotion failure/,
  );
  assert.equal(await readFile(catalogTargetPath, 'utf8'), 'old catalog');
  assert.equal(await readFile(schemaTargetPath, 'utf8'), 'old schema');
});

test('serializes concurrent output promotion without temp-file races', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'wdk-blocks-catalog-concurrent-'));
  const sourcePath = path.join(root, 'content/feeds/wdk-blocks.v1.json');
  const markdownPath = path.join(root, 'content/feeds/all-modules.md');
  const catalogTargetPath = path.join(root, 'public/catalog/v1/blocks.json');
  const schemaTargetPath = path.join(root, 'public/catalog/v1/schema.json');
  const options = { sourcePath, markdownPath, catalogTargetPath, schemaTargetPath };
  const expectedCatalog = serializeWdkBlocksCatalog(catalog());
  const expectedSchema = serializeWdkBlocksCatalogSchema();

  await Promise.all([
    mkdir(path.dirname(sourcePath), { recursive: true }),
    mkdir(path.dirname(catalogTargetPath), { recursive: true }),
  ]);
  await Promise.all([
    writeFile(sourcePath, expectedCatalog, 'utf8'),
    writeFile(markdownPath, markdown('@tetherto/wdk'), 'utf8'),
  ]);

  await Promise.all([syncWdkBlocksCatalog(options), syncWdkBlocksCatalog(options)]);
  assert.equal(await readFile(catalogTargetPath, 'utf8'), expectedCatalog);
  assert.equal(await readFile(schemaTargetPath, 'utf8'), expectedSchema);
});

test('waiters read source only after acquiring the output lock', async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), 'wdk-blocks-catalog-waiter-'));
  const sourcePath = path.join(root, 'content/feeds/wdk-blocks.v1.json');
  const markdownPath = path.join(root, 'content/feeds/all-modules.md');
  const catalogTargetPath = path.join(root, 'public/catalog/v1/blocks.json');
  const schemaTargetPath = path.join(root, 'public/catalog/v1/schema.json');
  const initialCatalog = catalog([block({ name: 'initial-name' })]);
  const currentCatalog = catalog([block({ name: 'current-name' })]);

  await Promise.all([
    mkdir(path.dirname(sourcePath), { recursive: true }),
    mkdir(path.dirname(catalogTargetPath), { recursive: true }),
  ]);
  await Promise.all([
    writeFile(sourcePath, serializeWdkBlocksCatalog(initialCatalog), 'utf8'),
    writeFile(markdownPath, markdown('@tetherto/wdk'), 'utf8'),
  ]);

  const release = await lockfile.lock(catalogTargetPath, {
    realpath: false,
    stale: 5_000,
    update: 1_000,
  });
  let sourceReads = 0;
  let notifyLockAttempt;
  const lockAttempted = new Promise((resolve) => {
    notifyLockAttempt = resolve;
  });
  const originalLock = lockfile.lock;
  t.after(() => {
    lockfile.lock = originalLock;
  });
  lockfile.lock = (...args) => {
    notifyLockAttempt();
    return originalLock(...args);
  };
  const fileSystem = {
    ...fs,
    async readFile(filePath, ...args) {
      if (filePath === sourcePath) sourceReads += 1;
      return fs.readFile(filePath, ...args);
    },
  };

  const pending = syncWdkBlocksCatalog({
    sourcePath,
    markdownPath,
    catalogTargetPath,
    schemaTargetPath,
    fileSystem,
  });
  await lockAttempted;
  assert.equal(sourceReads, 0);
  await writeFile(sourcePath, serializeWdkBlocksCatalog(currentCatalog), 'utf8');
  await release();
  await pending;

  assert.equal(await readFile(catalogTargetPath, 'utf8'), serializeWdkBlocksCatalog(currentCatalog));
});

test('recovers a stale lock and abandoned output after a killed writer', async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), 'wdk-blocks-catalog-crash-'));
  const sourcePath = path.join(root, 'content/feeds/wdk-blocks.v1.json');
  const markdownPath = path.join(root, 'content/feeds/all-modules.md');
  const outputDirectory = path.join(root, 'public/catalog/v1');
  const catalogTargetPath = path.join(outputDirectory, 'blocks.json');
  const schemaTargetPath = path.join(outputDirectory, 'schema.json');
  const expectedCatalog = serializeWdkBlocksCatalog(catalog());
  const expectedSchema = serializeWdkBlocksCatalogSchema();

  await Promise.all([
    mkdir(path.dirname(sourcePath), { recursive: true }),
    mkdir(outputDirectory, { recursive: true }),
  ]);
  await Promise.all([
    writeFile(sourcePath, expectedCatalog, 'utf8'),
    writeFile(markdownPath, markdown('@tetherto/wdk'), 'utf8'),
    writeFile(catalogTargetPath, 'old catalog', 'utf8'),
    writeFile(schemaTargetPath, 'old schema', 'utf8'),
  ]);

  const moduleUrl = new URL('../sync-wdk-blocks-catalog.mjs', import.meta.url).href;
  const child = spawn(
    process.execPath,
    [
      '--input-type=module',
      '--eval',
      `import fs from 'node:fs/promises'; import { syncWdkBlocksCatalog } from ${JSON.stringify(moduleUrl)}; let renames = 0; const fileSystem = { ...fs, async rename(from, to) { await fs.rename(from, to); renames += 1; if (renames === 2) { process.stdout.write('ready\\n'); setInterval(() => {}, 1000); await new Promise(() => {}); } } }; await syncWdkBlocksCatalog({ sourcePath: ${JSON.stringify(sourcePath)}, markdownPath: ${JSON.stringify(markdownPath)}, catalogTargetPath: ${JSON.stringify(catalogTargetPath)}, schemaTargetPath: ${JSON.stringify(schemaTargetPath)}, fileSystem });`,
    ],
    { cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'] },
  );
  t.after(() => {
    if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL');
  });
  const [ready] = await Promise.race([
    once(child.stdout, 'data'),
    once(child, 'exit').then(([code, signal]) => {
      throw new Error(`lock holder exited before ready (${code ?? signal})`);
    }),
  ]);
  assert.match(ready.toString(), /ready/);
  child.kill('SIGKILL');
  await once(child, 'exit');
  assert.equal(await readFile(catalogTargetPath, 'utf8'), expectedCatalog);
  assert.equal(await readFile(schemaTargetPath, 'utf8'), 'old schema');

  const stale = new Date(Date.now() - 10_000);
  await fs.utimes(`${catalogTargetPath}.lock`, stale, stale);
  await syncWdkBlocksCatalog({
    sourcePath,
    markdownPath,
    catalogTargetPath,
    schemaTargetPath,
  });

  assert.equal(await readFile(catalogTargetPath, 'utf8'), expectedCatalog);
  assert.equal(await readFile(schemaTargetPath, 'utf8'), expectedSchema);
  assert.deepEqual(
    (await readdir(outputDirectory)).filter(
      (name) => name.endsWith('.tmp') || name.endsWith('.bak') || name.endsWith('.lock'),
    ),
    [],
  );
});

test('preserves published files and recovery debris after a restaging failure', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'wdk-blocks-catalog-staging-'));
  const sourcePath = path.join(root, 'content/feeds/wdk-blocks.v1.json');
  const markdownPath = path.join(root, 'content/feeds/all-modules.md');
  const outputDirectory = path.join(root, 'public/catalog/v1');
  const catalogTargetPath = path.join(outputDirectory, 'blocks.json');
  const schemaTargetPath = path.join(outputDirectory, 'schema.json');
  const abandonedPath = `${catalogTargetPath}.crashed.tmp`;

  await Promise.all([
    mkdir(path.dirname(sourcePath), { recursive: true }),
    mkdir(outputDirectory, { recursive: true }),
  ]);
  await Promise.all([
    writeFile(sourcePath, serializeWdkBlocksCatalog(catalog()), 'utf8'),
    writeFile(markdownPath, markdown('@tetherto/wdk'), 'utf8'),
    writeFile(catalogTargetPath, 'old catalog', 'utf8'),
    writeFile(schemaTargetPath, 'old schema', 'utf8'),
    writeFile(abandonedPath, 'partial catalog', 'utf8'),
  ]);
  const fileSystem = {
    ...fs,
    async writeFile(filePath, ...args) {
      if (filePath.includes('schema.json.') && filePath.endsWith('.tmp')) {
        throw Object.assign(new Error('injected staging failure'), { code: 'EIO' });
      }
      return fs.writeFile(filePath, ...args);
    },
  };

  await assert.rejects(
    () =>
      syncWdkBlocksCatalog({
        sourcePath,
        markdownPath,
        catalogTargetPath,
        schemaTargetPath,
        fileSystem,
      }),
    /injected staging failure/,
  );
  assert.deepEqual(
    (await readdir(outputDirectory)).filter((name) => name.endsWith('.tmp') || name.endsWith('.bak')),
    [path.basename(abandonedPath)],
  );
  assert.equal(await readFile(catalogTargetPath, 'utf8'), 'old catalog');
  assert.equal(await readFile(schemaTargetPath, 'utf8'), 'old schema');
});

test('coordinates rollback across independent module instances', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'wdk-blocks-catalog-lock-'));
  const sourcePath = path.join(root, 'content/feeds/wdk-blocks.v1.json');
  const markdownPath = path.join(root, 'content/feeds/all-modules.md');
  const catalogTargetPath = path.join(root, 'public/catalog/v1/blocks.json');
  const schemaTargetPath = path.join(root, 'public/catalog/v1/schema.json');
  const options = { sourcePath, markdownPath, catalogTargetPath, schemaTargetPath };
  const expectedCatalog = serializeWdkBlocksCatalog(catalog());
  const expectedSchema = serializeWdkBlocksCatalogSchema();

  await Promise.all([
    mkdir(path.dirname(sourcePath), { recursive: true }),
    mkdir(path.dirname(catalogTargetPath), { recursive: true }),
  ]);
  await Promise.all([
    writeFile(sourcePath, expectedCatalog, 'utf8'),
    writeFile(markdownPath, markdown('@tetherto/wdk'), 'utf8'),
    writeFile(catalogTargetPath, 'old catalog', 'utf8'),
    writeFile(schemaTargetPath, 'old schema', 'utf8'),
  ]);

  const scriptUrl = new URL('../sync-wdk-blocks-catalog.mjs', import.meta.url);
  const [writerA, writerB] = await Promise.all([
    import(`${scriptUrl.href}?writer=a`),
    import(`${scriptUrl.href}?writer=b`),
  ]);
  let releaseFailure;
  const failureReached = new Promise((resolve) => {
    releaseFailure = resolve;
  });
  let renameCount = 0;
  const failingFileSystem = {
    ...fs,
    async rename(from, to) {
      renameCount += 1;
      if (renameCount === 4) {
        releaseFailure();
        await new Promise((resolve) => setTimeout(resolve, 50));
        throw Object.assign(new Error('writer A failed'), { code: 'EIO' });
      }
      return fs.rename(from, to);
    },
  };

  const first = writerA.syncWdkBlocksCatalog({ ...options, fileSystem: failingFileSystem });
  await failureReached;
  const second = writerB.syncWdkBlocksCatalog(options);
  const [firstResult, secondResult] = await Promise.allSettled([first, second]);

  assert.equal(firstResult.status, 'rejected');
  assert.equal(secondResult.status, 'fulfilled');
  assert.equal(await readFile(catalogTargetPath, 'utf8'), expectedCatalog);
  assert.equal(await readFile(schemaTargetPath, 'utf8'), expectedSchema);
});
