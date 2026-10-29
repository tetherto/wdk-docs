import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob } from 'glob';
import { structure } from 'fumadocs-core/mdx-plugins/remark-structure';
import { createSearchAPI } from 'fumadocs-core/search/server';

const CONTENT_ROOT = path.join(process.cwd(), 'content/docs');
const OUTPUT_FILE = path.join(process.cwd(), 'public/api/search.json');
const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

const UPPERCASE_SEGMENTS = new Map([
  ['ai', 'AI'],
  ['api', 'API'],
  ['btc', 'BTC'],
  ['erc', 'ERC'],
  ['evm', 'EVM'],
  ['mcp', 'MCP'],
  ['sdk', 'SDK'],
  ['su', 'SU'],
  ['ton', 'TON'],
  ['tron', 'TRON'],
  ['ui', 'UI'],
  ['usdt0', 'USD₮0'],
  ['wdk', 'WDK'],
  ['x402', 'x402'],
]);

function stripQuotes(value) {
  const trimmed = value.trim();
  if (trimmed.length < 2) return trimmed;

  const first = trimmed[0];
  const last = trimmed[trimmed.length - 1];
  if ((first === '"' || first === "'") && first === last) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

function normalizeBlockValue(lines, style) {
  const normalized = lines.map((line) => line.replace(/^\s{2}/, ''));
  const text = normalized.join(style === '|' ? '\n' : ' ');

  return text.replace(/\s+/g, ' ').trim();
}

function extractFrontmatter(raw) {
  const match = raw.match(FRONTMATTER_RE);
  if (!match) {
    return {
      frontmatter: {},
      body: raw,
    };
  }

  const lines = match[1].split(/\r?\n/);
  const frontmatter = {};

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const keyMatch = line.match(/^([A-Za-z0-9_-]+):(?:\s*(.*))?$/);
    if (!keyMatch) continue;

    const [, key, rawValue = ''] = keyMatch;
    const trimmedValue = rawValue.trim();

    if (trimmedValue === '>' || trimmedValue === '>-' || trimmedValue === '|' || trimmedValue === '|-') {
      const style = trimmedValue[0];
      const blockLines = [];

      while (index + 1 < lines.length) {
        const nextLine = lines[index + 1];
        if (/^[A-Za-z0-9_-]+:/.test(nextLine)) break;
        index += 1;
        blockLines.push(nextLine);
      }

      frontmatter[key] = normalizeBlockValue(blockLines, style);
      continue;
    }

    frontmatter[key] = stripQuotes(trimmedValue);
  }

  return {
    frontmatter,
    body: raw.slice(match[0].length),
  };
}

function humanizeSegment(segment) {
  return segment
    .split('-')
    .filter(Boolean)
    .map((part) => {
      const lower = part.toLowerCase();
      const mapped = UPPERCASE_SEGMENTS.get(lower);
      if (mapped) return mapped;
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(' ');
}

function titleFromPath(relativePath) {
  const basename = path.basename(relativePath, path.extname(relativePath));
  if (basename === 'index') {
    return humanizeSegment(path.basename(path.dirname(relativePath)));
  }

  return humanizeSegment(basename);
}

function urlFromPath(relativePath) {
  const normalized = relativePath.replace(/\\/g, '/');
  if (normalized === 'index.mdx') return '/';
  if (normalized.endsWith('/index.mdx')) {
    return `/${normalized.slice(0, -'/index.mdx'.length)}`;
  }

  return `/${normalized.slice(0, -'.mdx'.length)}`;
}

function buildBreadcrumbs(relativePath, directoryTitles) {
  const directory = path.dirname(relativePath);
  if (directory === '.') return undefined;

  const parts = directory.split(path.sep);
  const breadcrumbs = parts.map((_, index) => {
    const key = parts.slice(0, index + 1).join(path.sep);
    return directoryTitles.get(key) ?? humanizeSegment(parts[index]);
  });

  return breadcrumbs.length > 0 ? breadcrumbs : undefined;
}

function getSearchableData(data) {
  const ignoredHeadingIds = new Set(
    data.headings
      .filter((heading) => heading.content.trim().toLowerCase() === 'table of contents')
      .map((heading) => heading.id),
  );
  const contentByHeading = new Map();

  for (const item of data.contents) {
    if (item.heading && ignoredHeadingIds.has(item.heading)) continue;

    const normalized = item.content.replace(/\s+/g, ' ').trim();
    if (normalized.length === 0) continue;

    const key = item.heading ?? '';
    const existing = contentByHeading.get(key) ?? [];
    if (!existing.includes(normalized)) existing.push(normalized);
    contentByHeading.set(key, existing);
  }

  return {
    headings: data.headings.filter((heading) => !ignoredHeadingIds.has(heading.id)),
    contents: Array.from(contentByHeading, ([heading, contents]) => ({
      ...(heading ? { heading } : {}),
      content: contents.join(' '),
    })),
  };
}

export async function createSearchIndex(contentRoot = CONTENT_ROOT) {
  const docFiles = (await glob('**/*.mdx', { cwd: contentRoot, nodir: true })).sort();
  const parsedFiles = [];
  const directoryTitles = new Map();

  for (const relativePath of docFiles) {
    const absolutePath = path.join(contentRoot, relativePath);
    const raw = await readFile(absolutePath, 'utf8');
    const parsed = extractFrontmatter(raw);

    parsedFiles.push({ absolutePath, relativePath, ...parsed });

    if (path.basename(relativePath) === 'index.mdx') {
      const directory = path.dirname(relativePath);
      if (directory !== '.') {
        directoryTitles.set(directory, parsed.frontmatter.title ?? titleFromPath(relativePath));
      }
    }
  }

  const indexes = parsedFiles.map(({ body, frontmatter, relativePath }) => ({
    id: urlFromPath(relativePath),
    title: frontmatter.title ?? titleFromPath(relativePath),
    description: frontmatter.description || undefined,
    breadcrumbs: buildBreadcrumbs(relativePath, directoryTitles),
    structuredData: getSearchableData(structure(body)),
    url: urlFromPath(relativePath),
  }));

  const searchApi = createSearchAPI('advanced', { indexes });
  return { payload: await searchApi.export(), pageCount: indexes.length };
}

async function main() {
  const { payload, pageCount } = await createSearchIndex();
  await mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
  await writeFile(OUTPUT_FILE, JSON.stringify(payload));

  console.log(`generated ${path.relative(process.cwd(), OUTPUT_FILE)} for ${pageCount} pages`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => { console.error(error); process.exitCode = 1; });
}
