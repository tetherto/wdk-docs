#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual, promisify } from 'node:util';

import lockfile from 'proper-lockfile';
import { z } from 'zod';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, '..');
const DEFAULT_SOURCE_PATH = path.join(REPO_ROOT, 'content', 'feeds', 'wdk-blocks.v1.json');
const DEFAULT_MARKDOWN_PATH = path.join(REPO_ROOT, 'content', 'feeds', 'all-modules.md');
const DEFAULT_CATALOG_TARGET_PATH = path.join(REPO_ROOT, 'public', 'catalog', 'v1', 'blocks.json');
const DEFAULT_SCHEMA_TARGET_PATH = path.join(REPO_ROOT, 'public', 'catalog', 'v1', 'schema.json');
const execFileAsync = promisify(execFile);
const NO_PREVIOUS_CATALOG = Symbol('no-previous-catalog');
const NO_PREVIOUS_SCHEMA = Symbol('no-previous-schema');
const UNMAPPED_CATEGORY = Symbol('unmapped-category');
const MARKDOWN_CATEGORY_BY_HEADING = {
  'core module': 'core',
  'backup and recovery tools': 'backup',
  'wallet modules': 'wallet',
  'swidge modules': 'swidge',
  'pricing modules': 'pricing',
  'swap modules': 'swap',
  'bridge modules': 'bridge',
  'lending modules': 'lending',
  'fiat modules': 'fiat',
  'community modules': 'community',
};
const MARKDOWN_CHAIN_BY_BLOCKCHAIN = {
  aptos: 'aptos',
  bitcoin: 'bitcoin',
  evm: 'ethereum',
  solana: 'solana',
  spark: 'spark',
  ton: 'ton',
  tron: 'tron',
};

const id = z
  .string()
  .regex(/^[a-z0-9]+(?:[.-][a-z0-9]+)*$/)
  .describe('Immutable catalog identity; never derive it from a package or URL.');
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const npmPackage = z
  .string()
  .regex(/^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/);
const githubSegment = String.raw`(?!\.{1,2}(?:/|$))[A-Za-z0-9_.-]+`;
const githubRepo = z.string().regex(
  new RegExp(
    String.raw`^${githubSegment}/${githubSegment}(?:/tree/${githubSegment}/${githubSegment}(?:/${githubSegment})*)?$`,
  ),
);
const urlLabel = String.raw`[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?`;
const httpsUrl = z.intersection(
  z.url(),
  z.string().regex(new RegExp(String.raw`^https://${urlLabel}(?:\.${urlLabel})*(?:[/?#][^\s]*)?$`)),
);
const nonBlankText = z.string().regex(/^\S(?:.*\S)?$/);

export const wdkBlockSchema = z
  .object({
    id,
    slug,
    legacySlugs: z
      .array(slug)
      .min(1)
      .describe('Historical matching or redirect claims retained for compatibility.')
      .optional(),
    name: nonBlankText,
    npmPackage,
    legacyNpmPackages: z
      .array(npmPackage)
      .min(1)
      .describe('Historical matching aliases only; never fetch or install these values.')
      .optional(),
    githubRepo: githubRepo
      .nullable()
      .describe('Public GitHub source locator, or null when no public repository is available.'),
    category: z.enum([
      'core',
      'backup',
      'wallet',
      'swidge',
      'pricing',
      'swap',
      'bridge',
      'lending',
      'fiat',
    ]),
    chains: z
      .array(
        z.enum([
          'bitcoin',
          'ethereum',
          'solana',
          'ton',
          'tron',
          'spark',
          'rgb',
          'aptos',
          'cosmos',
        ]),
      )
      .describe(
        'Wallet or source-account families the block can execute from; live routes may be dynamically constrained.',
      ),
    badge: z.enum(['official', 'verified', 'community']),
    description: nonBlankText,
    docsUrl: httpsUrl,
  })
  .strict();

export const wdkBlocksCatalogSchema = z
  .object({
    $schema: z.literal('https://docs.wdk.tether.io/catalog/v1/schema.json'),
    schemaVersion: z.literal(1),
    blocks: z.array(wdkBlockSchema).min(1),
  })
  .strict();

function assertUniqueClaims(blocks, canonicalField, aliasField) {
  const claims = new Map();

  blocks.forEach((block) => {
    [block[canonicalField], ...(block[aliasField] ?? [])].forEach((value) => {
      const previous = claims.get(value);
      if (previous) {
        throw new Error(
          `Duplicate ${canonicalField} claim \`${value}\` in \`${previous}\` and \`${block.id}\``,
        );
      }
      claims.set(value, block.id);
    });
  });
}

function formatJsonPath(pathParts) {
  return pathParts.reduce(
    (result, part) =>
      typeof part === 'number'
        ? `${result}[${part}]`
        : /^[A-Za-z_$][\w$]*$/.test(part)
          ? `${result}.${part}`
          : `${result}[${JSON.stringify(part)}]`,
    '$',
  );
}

export function parseJsonStrict(source) {
  const value = JSON.parse(source);
  let offset = 0;

  const skipWhitespace = () => {
    while (/\s/.test(source[offset] ?? '')) offset += 1;
  };
  const scanString = () => {
    const start = offset;
    offset += 1;
    while (offset < source.length) {
      if (source[offset] === '\\') {
        offset += 2;
      } else if (source[offset] === '"') {
        offset += 1;
        return JSON.parse(source.slice(start, offset));
      } else {
        offset += 1;
      }
    }
    throw new SyntaxError('Unterminated JSON string');
  };
  const scanValue = (pathParts) => {
    skipWhitespace();
    if (source[offset] === '{') {
      offset += 1;
      const keys = new Set();
      skipWhitespace();
      while (source[offset] !== '}') {
        const key = scanString();
        if (keys.has(key)) {
          throw new SyntaxError(
            `Duplicate JSON key \`${key}\` at ${formatJsonPath([...pathParts, key])}`,
          );
        }
        keys.add(key);
        skipWhitespace();
        offset += 1;
        scanValue([...pathParts, key]);
        skipWhitespace();
        if (source[offset] === ',') {
          offset += 1;
          skipWhitespace();
        } else {
          break;
        }
      }
      offset += 1;
      return;
    }
    if (source[offset] === '[') {
      offset += 1;
      let index = 0;
      skipWhitespace();
      while (source[offset] !== ']') {
        scanValue([...pathParts, index]);
        index += 1;
        skipWhitespace();
        if (source[offset] === ',') {
          offset += 1;
          skipWhitespace();
        } else {
          break;
        }
      }
      offset += 1;
      return;
    }
    if (source[offset] === '"') {
      scanString();
      return;
    }
    while (offset < source.length && !/[\s,\]}]/.test(source[offset])) offset += 1;
  };

  scanValue([]);
  return value;
}

export function extractMarkdownPackages(markdown) {
  return [...extractMarkdownBlocks(markdown).keys()];
}

function splitMarkdownRow(line) {
  const trimmed = line.trim();
  if (!trimmed.startsWith('|') || !trimmed.endsWith('|')) return null;
  return trimmed.slice(1, -1).split('|').map((cell) => cell.trim());
}

function normalizeMarkdownText(value) {
  return value
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`/g, '')
    .trim();
}

function markdownLinkHref(value) {
  const href = value.match(/\[[^\]]+\]\(([^)]+)\)/)?.[1];
  if (!href) return null;
  return href.startsWith('/') ? `https://docs.wdk.tether.io${href}` : href;
}

function githubRootFromUrl(value) {
  return value?.match(/^https:\/\/github\.com\/([^/#]+\/[^/#]+)/)?.[1] ?? null;
}

export function extractMarkdownBlocks(markdown) {
  const blocks = new Map();
  let section = null;
  let header = [];
  let inTable = false;

  markdown.split('\n').forEach((line) => {
    const heading = line.match(/^##\s+(.+?)\s*$/)?.[1]?.toLowerCase();
    if (heading) {
      section = MARKDOWN_CATEGORY_BY_HEADING[heading] ?? UNMAPPED_CATEGORY;
      header = [];
      inTable = false;
      return;
    }
    if (section === null) return;

    const cells = splitMarkdownRow(line);
    if (!cells) {
      header = [];
      inTable = false;
      return;
    }
    if (cells.every((cell) => /^:?-+:?$/.test(cell))) {
      inTable = true;
      return;
    }
    if (!inTable) {
      header = cells.map((cell) => cell.toLowerCase());
      return;
    }

    const packageColumn = header.findIndex((cell) => /^(module|package)$/.test(cell));
    if (packageColumn < 0) {
      const packageName = cells
        .map(normalizeMarkdownText)
        .find((cell) => npmPackage.safeParse(cell).success && /(?:^|[\/._-])wdk(?:[._-]|$)/.test(cell));
      if (packageName) {
        throw new Error(`Unrecognized All Modules table header contains package row \`${packageName}\``);
      }
      return;
    }
    if (section === UNMAPPED_CATEGORY) {
      throw new Error(
        `Unmapped All Modules section contains package row \`${normalizeMarkdownText(cells[packageColumn] ?? '')}\``,
      );
    }
    const packageName = normalizeMarkdownText(cells[packageColumn] ?? '');
    if (!npmPackage.safeParse(packageName).success) {
      throw new Error(`Invalid package cell in All Modules section: \`${cells[packageColumn] ?? ''}\``);
    }
    const description = cells[header.findIndex((cell) => cell.includes('description'))] ?? '';
    const docs = cells[header.findIndex((cell) => cell.includes('documentation'))] ?? '';
    const ownership = cells[header.findIndex((cell) => cell.includes('ownership'))] ?? '';
    const categoryCell = cells[header.findIndex((cell) => cell.includes('category'))] ?? '';
    const blockchain = cells[header.findIndex((cell) => cell.includes('blockchain'))] ?? '';
    const blockchainName = normalizeMarkdownText(blockchain).toLowerCase();
    const chain = MARKDOWN_CHAIN_BY_BLOCKCHAIN[blockchainName];
    if (blockchainName && !chain) {
      throw new Error(`Unmapped All Modules blockchain \`${blockchainName}\``);
    }
    const functionalCategory = section === 'community' ? categoryCell.toLowerCase() : section;
    const row = {
      category: functionalCategory,
      chains: chain ? [chain] : null,
      description: normalizeMarkdownText(description),
      docsUrl: markdownLinkHref(docs),
      sourceUrl: markdownLinkHref(cells[packageColumn]),
      githubSources: [markdownLinkHref(cells[packageColumn]), markdownLinkHref(docs)]
        .map(githubRootFromUrl)
        .filter(Boolean),
      community: section === 'community' || ownership.toLowerCase() === 'community',
      functional: section !== 'community',
    };
    const existing = blocks.get(packageName);

    if (!existing || row.functional) {
      if (existing?.functional && row.functional) {
        throw new Error(`Duplicate functional Markdown rows for \`${packageName}\``);
      }
      blocks.set(packageName, {
        ...row,
        community: row.community || existing?.community || false,
        githubSources: [...new Set([...(existing?.githubSources ?? []), ...row.githubSources])],
      });
      return;
    }

    existing.community ||= row.community;
    existing.githubSources = [...new Set([...existing.githubSources, ...row.githubSources])];
  });

  return blocks;
}

export function validateWdkBlocksCatalog(value, markdown) {
  const catalog = wdkBlocksCatalogSchema.parse(value);

  assertUniqueClaims(catalog.blocks, 'id', '__noAliases');
  assertUniqueClaims(catalog.blocks, 'slug', 'legacySlugs');
  assertUniqueClaims(catalog.blocks, 'npmPackage', 'legacyNpmPackages');

  catalog.blocks.forEach((block) => {
    if (new Set(block.chains).size !== block.chains.length) {
      throw new Error(`Block \`${block.id}\` contains duplicate chain values`);
    }
  });

  const markdownBlocks = extractMarkdownBlocks(markdown);
  const markdownPackages = new Set(markdownBlocks.keys());
  const catalogPackages = new Set(catalog.blocks.map((block) => block.npmPackage));
  const missing = [...markdownPackages].filter((pkg) => !catalogPackages.has(pkg));
  const extra = [...catalogPackages].filter((pkg) => !markdownPackages.has(pkg));

  if (missing.length > 0 || extra.length > 0) {
    throw new Error(
      `Catalog package coverage mismatch; missing: ${missing.join(', ') || 'none'}; extra: ${extra.join(', ') || 'none'}`,
    );
  }

  catalog.blocks.forEach((block) => {
    const markdownBlock = markdownBlocks.get(block.npmPackage);
    const expectedBadge = markdownBlock.community
      ? 'community'
      : block.npmPackage.startsWith('@tetherto/')
        ? 'official'
        : 'verified';
    const comparisons = {
      category: markdownBlock.category,
      description: markdownBlock.description,
      docsUrl: markdownBlock.docsUrl,
      badge: expectedBadge,
    };

    Object.entries(comparisons).forEach(([field, expected]) => {
      if (block[field] !== expected) {
        throw new Error(
          `Catalog \`${block.id}\` ${field} differs from All Modules Markdown: expected \`${expected}\``,
        );
      }
    });

    if (markdownBlock.chains && markdownBlock.chains.join() !== block.chains.join()) {
      throw new Error(
        `Catalog \`${block.id}\` chains differ from All Modules Markdown: expected \`${markdownBlock.chains.join(',')}\``,
      );
    }

    const mismatchedSource = markdownBlock.githubSources.find(
      (source) => block.githubRepo?.split('/').slice(0, 2).join('/') !== source,
    );
    if (mismatchedSource) {
      throw new Error(
        `Catalog \`${block.id}\` githubRepo differs from All Modules Markdown: expected \`${mismatchedSource}\``,
      );
    }
  });

  return catalog;
}

export function validateWdkBlocksCatalogCompatibility(previousValue, currentValue) {
  const previous = wdkBlocksCatalogSchema.parse(previousValue);
  const current = wdkBlocksCatalogSchema.parse(currentValue);
  const currentById = new Map(current.blocks.map((block) => [block.id, block]));

  previous.blocks.forEach((previousBlock) => {
    const currentBlock = currentById.get(previousBlock.id);
    if (!currentBlock) {
      throw new Error(`Schema v1 cannot remove catalog identity \`${previousBlock.id}\``);
    }

    const currentSlugClaims = new Set([currentBlock.slug, ...(currentBlock.legacySlugs ?? [])]);
    const previousSlugClaims = [previousBlock.slug, ...(previousBlock.legacySlugs ?? [])];
    const removedSlug = previousSlugClaims.find((claim) => !currentSlugClaims.has(claim));
    if (removedSlug) {
      throw new Error(
        `Catalog identity \`${previousBlock.id}\` must retain slug claim \`${removedSlug}\` in schema v1`,
      );
    }

    const currentPackageClaims = new Set([
      currentBlock.npmPackage,
      ...(currentBlock.legacyNpmPackages ?? []),
    ]);
    const previousPackageClaims = [
      previousBlock.npmPackage,
      ...(previousBlock.legacyNpmPackages ?? []),
    ];
    const removedPackage = previousPackageClaims.find((claim) => !currentPackageClaims.has(claim));
    if (removedPackage) {
      throw new Error(
        `Catalog identity \`${previousBlock.id}\` must retain npm claim \`${removedPackage}\` in schema v1`,
      );
    }
  });
}

export function validateWdkBlocksCatalogSchemaCompatibility(previousValue, currentValue) {
  const previous = typeof previousValue === 'string' ? parseJsonStrict(previousValue) : previousValue;
  const current = typeof currentValue === 'string' ? parseJsonStrict(currentValue) : currentValue;
  if (!isDeepStrictEqual(previous, current)) {
    throw new Error('The published v1 schema cannot change; publish a new versioned catalog path');
  }
}

export function serializeWdkBlocksCatalog(catalog) {
  return `${JSON.stringify(catalog, null, 2)}\n`;
}

export function serializeWdkBlocksCatalogSchema() {
  const schema = z.toJSONSchema(wdkBlocksCatalogSchema, { target: 'draft-2020-12' });
  const blockProperties = schema.properties.blocks.items.properties;
  ['legacySlugs', 'legacyNpmPackages', 'chains'].forEach((property) => {
    blockProperties[property].uniqueItems = true;
  });
  return `${JSON.stringify(
    {
      ...schema,
      $id: 'https://docs.wdk.tether.io/catalog/v1/schema.json',
      title: 'WDK blocks catalog v1',
      $comment:
        'Consumers must apply validation equivalent to the publisher, including URL parsing and cross-block uniqueness for id, slug claims, and npm package claims.',
    },
    null,
    2,
  )}\n`;
}

async function readIfPresent(filePath, fileSystem = fs) {
  try {
    return await fileSystem.readFile(filePath, 'utf8');
  } catch (error) {
    if (error && typeof error === 'object' && error.code === 'ENOENT') return null;
    throw error;
  }
}

async function removeIfPresent(fileSystem, filePath) {
  try {
    await fileSystem.unlink(filePath);
  } catch (error) {
    if (!error || typeof error !== 'object' || error.code !== 'ENOENT') throw error;
  }
}

async function replaceOutputFiles(outputs, fileSystem) {
  const token = `${process.pid}.${randomUUID()}`;
  const staged = outputs.map(({ targetPath, contents }) => ({
    targetPath,
    contents,
    temporaryPath: `${targetPath}.${token}.tmp`,
    backupPath: `${targetPath}.${token}.bak`,
  }));
  const backups = [];
  const committed = [];
  let retainBackups = false;
  let failure = null;

  try {
    for (const { targetPath, temporaryPath, contents } of staged) {
      await fileSystem.mkdir(path.dirname(targetPath), { recursive: true });
      await fileSystem.writeFile(temporaryPath, contents, 'utf8');
    }

    for (const output of staged) {
      try {
        await fileSystem.rename(output.targetPath, output.backupPath);
        backups.push(output);
      } catch (error) {
        if (!error || typeof error !== 'object' || error.code !== 'ENOENT') throw error;
      }
      await fileSystem.rename(output.temporaryPath, output.targetPath);
      committed.push(output);
    }
  } catch (error) {
    const rollbackErrors = [];
    for (const output of [...committed].reverse()) {
      try {
        await removeIfPresent(fileSystem, output.targetPath);
      } catch (rollbackError) {
        rollbackErrors.push(rollbackError);
      }
    }
    for (const output of [...backups].reverse()) {
      try {
        await fileSystem.rename(output.backupPath, output.targetPath);
      } catch (rollbackError) {
        rollbackErrors.push(rollbackError);
      }
    }
    if (rollbackErrors.length > 0) {
      retainBackups = true;
      failure = new AggregateError(
        [error, ...rollbackErrors],
        'Catalog output promotion and rollback both failed; backup files were retained',
      );
    } else {
      failure = error;
    }
  }

  const cleanup = staged.flatMap((output) => {
    const paths = [output.temporaryPath];
    if (!retainBackups) paths.push(output.backupPath);
    return paths.map((filePath) => removeIfPresent(fileSystem, filePath));
  });
  const cleanupErrors = (await Promise.allSettled(cleanup))
    .filter(({ status }) => status === 'rejected')
    .map(({ reason }) => reason);

  if (failure && cleanupErrors.length > 0) {
    throw new AggregateError([failure, ...cleanupErrors], 'Catalog publication and cleanup failed');
  }
  if (failure) throw failure;
  if (cleanupErrors.length > 0) {
    throw new AggregateError(cleanupErrors, 'Catalog output cleanup failed');
  }
}

async function findAbandonedOutputFiles(outputs, fileSystem) {
  const abandoned = [];
  const directories = new Map();
  for (const { targetPath } of outputs) {
    const directory = path.dirname(targetPath);
    const targetNames = directories.get(directory) ?? [];
    targetNames.push(path.basename(targetPath));
    directories.set(directory, targetNames);
  }

  for (const [directory, targetNames] of directories) {
    let entries;
    try {
      entries = await fileSystem.readdir(directory);
    } catch (error) {
      if (error && typeof error === 'object' && error.code === 'ENOENT') continue;
      throw error;
    }
    for (const entry of entries) {
      if (
        targetNames.some(
          (targetName) =>
            entry.startsWith(`${targetName}.`) && (entry.endsWith('.tmp') || entry.endsWith('.bak')),
        )
      ) {
        abandoned.push(path.join(directory, entry));
      }
    }
  }
  return abandoned;
}

async function removeAbandonedOutputFiles(abandoned, fileSystem) {
  const cleanupErrors = (await Promise.allSettled(
    abandoned.map((filePath) => removeIfPresent(fileSystem, filePath)),
  ))
    .filter(({ status }) => status === 'rejected')
    .map(({ reason }) => reason);
  if (cleanupErrors.length > 0) {
    throw new AggregateError(cleanupErrors, 'Abandoned catalog output cleanup failed');
  }
}

async function withOutputLock(targetPath, fileSystem, operation) {
  await fileSystem.mkdir(path.dirname(targetPath), { recursive: true });
  const release = await lockfile.lock(targetPath, {
    realpath: false,
    stale: 5_000,
    update: 1_000,
    retries: { retries: 400, factor: 1, minTimeout: 25, maxTimeout: 25, randomize: false },
  });

  let result;
  let failure = null;
  try {
    result = await operation();
  } catch (error) {
    failure = error;
  }

  try {
    await release();
  } catch (cleanupError) {
    if (failure) {
      throw new AggregateError([failure, cleanupError], 'Catalog operation and lock cleanup failed');
    }
    throw cleanupError;
  }
  if (failure) throw failure;
  return result;
}

export async function syncWdkBlocksCatalog({
  sourcePath = DEFAULT_SOURCE_PATH,
  markdownPath = DEFAULT_MARKDOWN_PATH,
  catalogTargetPath = DEFAULT_CATALOG_TARGET_PATH,
  schemaTargetPath = DEFAULT_SCHEMA_TARGET_PATH,
  previousCatalog = NO_PREVIOUS_CATALOG,
  previousSchema = NO_PREVIOUS_SCHEMA,
  fileSystem = fs,
  write = true,
} = {}) {
  return withOutputLock(catalogTargetPath, fileSystem, async () => {
    const [source, markdown] = await Promise.all([
      fileSystem.readFile(sourcePath, 'utf8'),
      fileSystem.readFile(markdownPath, 'utf8'),
    ]);
    const catalog = validateWdkBlocksCatalog(parseJsonStrict(source), markdown);
    if (previousCatalog !== NO_PREVIOUS_CATALOG) {
      validateWdkBlocksCatalogCompatibility(previousCatalog, catalog);
    }
    const catalogOutput = serializeWdkBlocksCatalog(catalog);
    const schemaOutput = serializeWdkBlocksCatalogSchema();
    if (previousSchema !== NO_PREVIOUS_SCHEMA) {
      validateWdkBlocksCatalogSchemaCompatibility(previousSchema, schemaOutput);
    }
    const outputs = [
      { targetPath: catalogTargetPath, contents: catalogOutput },
      { targetPath: schemaTargetPath, contents: schemaOutput },
    ];
    const abandoned = await findAbandonedOutputFiles(outputs, fileSystem);
    const [currentCatalog, currentSchema] = await Promise.all([
      readIfPresent(catalogTargetPath, fileSystem),
      readIfPresent(schemaTargetPath, fileSystem),
    ]);
    const changed =
      abandoned.length > 0 || currentCatalog !== catalogOutput || currentSchema !== schemaOutput;

    if (changed && write) {
      await replaceOutputFiles(outputs, fileSystem);
      await removeAbandonedOutputFiles(abandoned, fileSystem);
    }
    return changed;
  });
}

async function readFileAtRef(ref, filePath) {
  const { stdout: paths } = await execFileAsync(
    'git',
    ['ls-tree', '-r', '--name-only', ref, '--', filePath],
    { cwd: REPO_ROOT },
  );
  if (!paths.trim()) return { found: false };

  const { stdout } = await execFileAsync('git', ['show', `${ref}:${filePath}`], {
    cwd: REPO_ROOT,
    maxBuffer: 2 * 1024 * 1024,
  });
  return { found: true, value: stdout };
}

async function main() {
  const args = process.argv.slice(2);
  const checkOnly = args.includes('--check');
  const baseIndex = args.indexOf('--base-ref');
  const baseRef = baseIndex >= 0 ? args[baseIndex + 1] : null;
  const recognized = new Set(['--check', '--base-ref', baseRef]);
  if (
    args.some((arg) => !recognized.has(arg)) ||
    args.filter((arg) => arg === '--check').length > 1 ||
    args.filter((arg) => arg === '--base-ref').length > 1 ||
    (baseIndex >= 0 && (!baseRef || baseRef.startsWith('--')))
  ) {
    throw new Error(
      'Usage: node scripts/sync-wdk-blocks-catalog.mjs [--check] [--base-ref <git-ref>]',
    );
  }

  if (baseRef) {
    await execFileAsync('git', ['rev-parse', '--verify', `${baseRef}^{commit}`], { cwd: REPO_ROOT });
  }
  const [previousCatalog, previousSchema] = baseRef
    ? await Promise.all([
        readFileAtRef(baseRef, 'content/feeds/wdk-blocks.v1.json'),
        readFileAtRef(baseRef, 'public/catalog/v1/schema.json'),
      ])
    : [{ found: false }, { found: false }];
  const changed = await syncWdkBlocksCatalog({
    previousCatalog: previousCatalog.found
      ? parseJsonStrict(previousCatalog.value)
      : NO_PREVIOUS_CATALOG,
    previousSchema: previousSchema.found ? previousSchema.value : NO_PREVIOUS_SCHEMA,
    write: !checkOnly,
  });
  if (checkOnly && changed) {
    throw new Error('Public WDK blocks catalog is stale; run `npm run sync:wdk-blocks-catalog`');
  }
  console.log(changed ? 'updated public WDK blocks catalog' : 'public WDK blocks catalog is current');
}

const invokedDirectly =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
