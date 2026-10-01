#!/usr/bin/env node

import {
  closeSync,
  constants as fsConstants,
  existsSync,
  fstatSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  openSync,
  readFileSync,
  readdirSync,
  readlinkSync,
  realpathSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { createServer } from 'node:net';

const require = createRequire(import.meta.url);
const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '../../..');
const paths = {
  manual: 'contributing/wdk-community-module-docs/COMMUNITY_MODULE_DOCUMENTATION_GUIDE.md',
  readme: 'contributing/wdk-community-module-docs/README.md',
  skill: 'skills/wdk-community-module-docs/SKILL.md',
  validator: 'skills/wdk-community-module-docs/scripts/validate-artifacts.mjs',
};
const errors = [];
const args = process.argv.slice(2);
let prReady = false;
let docsChanged = false;
let selfTest = false;
let skillOnly = false;
let baseRef = 'HEAD';
let baseWasSet = false;
let fragmentTarget = null;
let currentMdxTarget = null;
let excludeApiReference = false;
let sanitizeGenerationTarget = null;
let emitTreeManifest = false;
let checkIsolatedOutput = null;
let routeDecisionsPath = null;
let prApiReferencePolicyPath = null;

for (const arg of args) {
  if (arg === '--pr-ready') prReady = true;
  else if (arg === '--docs-changed') docsChanged = true;
  else if (arg === '--self-test') selfTest = true;
  else if (arg === '--skill-only') skillOnly = true;
  else if (arg === '--exclude-api-reference') excludeApiReference = true;
  else if (arg === '--emit-tree-manifest') emitTreeManifest = true;
  else if (arg === '--sanitize-generation') sanitizeGenerationTarget = '';
  else if (
    arg.startsWith('--validate-mdx=') &&
    arg.length > '--validate-mdx='.length
  ) {
    currentMdxTarget = arg.slice('--validate-mdx='.length);
  }
  else if (
    arg.startsWith('--sanitize-generation=') &&
    arg.length > '--sanitize-generation='.length
  ) {
    sanitizeGenerationTarget = arg.slice('--sanitize-generation='.length);
  }
  else if (
    arg.startsWith('--check-isolated-output=') &&
    arg.length > '--check-isolated-output='.length
  ) {
    checkIsolatedOutput = arg.slice('--check-isolated-output='.length);
  }
  else if (
    arg.startsWith('--route-decisions=') &&
    arg.length > '--route-decisions='.length
  ) {
    routeDecisionsPath = arg.slice('--route-decisions='.length);
  }
  else if (
    arg.startsWith('--api-reference-policy=') &&
    arg.length > '--api-reference-policy='.length
  ) {
    if (prApiReferencePolicyPath !== null) {
      errors.push('--api-reference-policy may be specified only once');
    } else {
      prApiReferencePolicyPath = arg.slice('--api-reference-policy='.length);
    }
  }
  else if (
    arg.startsWith('--emit-baseline-fragments=') &&
    arg.length > '--emit-baseline-fragments='.length
  ) {
    fragmentTarget = arg.slice('--emit-baseline-fragments='.length);
  }
  else if (arg.startsWith('--base=') && arg.length > '--base='.length) {
    baseRef = arg.slice('--base='.length);
    baseWasSet = true;
  } else errors.push(`unknown option: ${arg}`);
}

if (baseWasSet && !docsChanged && !fragmentTarget) {
  errors.push('--base requires --docs-changed or --emit-baseline-fragments');
}
if (excludeApiReference && !fragmentTarget && !currentMdxTarget) {
  errors.push('--exclude-api-reference requires --emit-baseline-fragments or --validate-mdx');
}
if (routeDecisionsPath && !docsChanged) {
  errors.push('--route-decisions requires --docs-changed');
}
if (prReady && !prApiReferencePolicyPath) {
  errors.push('--pr-ready requires --api-reference-policy=<absolute evidence file>');
} else if (prApiReferencePolicyPath && !prReady) {
  errors.push('--api-reference-policy requires --pr-ready');
}
if (fragmentTarget && (docsChanged || selfTest || prReady || currentMdxTarget)) {
  errors.push('--emit-baseline-fragments cannot be combined with validation modes');
}
if (currentMdxTarget && (docsChanged || prReady || skillOnly)) {
  errors.push('--validate-mdx cannot be combined with --docs-changed, --pr-ready, or --skill-only');
}
if (
  skillOnly &&
  (docsChanged || fragmentTarget || currentMdxTarget || excludeApiReference ||
    routeDecisionsPath)
) {
  errors.push(
    '--skill-only supports default validation, --self-test, and policy-backed --pr-ready only',
  );
}
const isolatedModes = [
  sanitizeGenerationTarget !== null,
  emitTreeManifest,
  checkIsolatedOutput !== null,
].filter(Boolean).length;
if (isolatedModes > 1) {
  errors.push('generation sanitizer and tree-manifest modes are mutually exclusive');
}
if (
  isolatedModes > 0 &&
  (docsChanged || prReady || selfTest || skillOnly || fragmentTarget ||
    currentMdxTarget || excludeApiReference || baseWasSet || routeDecisionsPath ||
    prApiReferencePolicyPath)
) {
  errors.push('generation sanitizer and tree-manifest modes cannot be combined with other modes');
}
if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exit(1);
}

function lockedDependencyVersion(name) {
  try {
    const lock = JSON.parse(readFileSync(join(repoRoot, 'package-lock.json'), 'utf8'));
    return lock.packages?.[`node_modules/${name}`]?.version ?? null;
  } catch {
    return null;
  }
}

let RendererSlugger = null;
let rendererSluggerError = 'dependency is unavailable';
let RendererMarkdownParser = null;
let RendererToString = null;
let rendererParserError = 'dependencies are unavailable';
try {
  const sluggerPath = require.resolve('github-slugger');
  const actualVersion = JSON.parse(
    readFileSync(join(dirname(sluggerPath), 'package.json'), 'utf8'),
  ).version;
  const expectedVersion = lockedDependencyVersion('github-slugger');
  if (!expectedVersion || actualVersion !== expectedVersion) {
    throw new Error(
      `resolved github-slugger ${actualVersion ?? 'unknown'}; lock requires ${expectedVersion ?? 'a recorded version'}`,
    );
  }
  ({ default: RendererSlugger } = await import(pathToFileURL(sluggerPath).href));
} catch (error) {
  rendererSluggerError = error.message;
  // Standalone artifact validation remains dependency-free. MDX modes fail below.
}

try {
  const dependencies = ['unified', 'remark-parse', 'remark-mdx', 'mdast-util-to-string'];
  const loaded = {};
  for (const name of dependencies) {
    const modulePath = require.resolve(name);
    const actualVersion = JSON.parse(
      readFileSync(join(dirname(modulePath), 'package.json'), 'utf8'),
    ).version;
    const expectedVersion = lockedDependencyVersion(name);
    if (!expectedVersion || actualVersion !== expectedVersion) {
      throw new Error(
        `resolved ${name} ${actualVersion ?? 'unknown'}; lock requires ${expectedVersion ?? 'a recorded version'}`,
      );
    }
    loaded[name] = await import(pathToFileURL(modulePath).href);
  }
  RendererMarkdownParser = loaded.unified
    .unified()
    .use(loaded['remark-parse'].default)
    .use(loaded['remark-mdx'].default);
  RendererToString = loaded['mdast-util-to-string'].toString;
} catch (error) {
  rendererParserError = error.message;
  // Standalone artifact validation remains dependency-free. MDX modes fail below.
}

if (
  (docsChanged || fragmentTarget || currentMdxTarget || selfTest) &&
  (!RendererSlugger || !RendererMarkdownParser || !RendererToString)
) {
  console.error(
    `MDX validation requires workspace-locked parser dependencies: ${rendererSluggerError}; ${rendererParserError}`,
  );
  process.exit(1);
}

function runGit(gitArgs) {
  return spawnSync('git', gitArgs, {
    cwd: repoRoot,
    encoding: 'utf8',
  });
}

function isWithin(root, candidate) {
  const path = relative(root, candidate);
  return path === '' || (!path.startsWith(`..${sep}`) && path !== '..' && !isAbsolute(path));
}

function isStrictDocsTarget(target) {
  if (
    typeof target !== 'string' ||
    isAbsolute(target) ||
    !target.startsWith('content/docs/') ||
    target === 'content/docs/' ||
    target.endsWith('/') ||
    target.includes('//')
  ) {
    return false;
  }
  return !target.split('/').some((part) => !part || part === '.' || part === '..');
}

function resolveSafeRepoPath(path, allowedRoot = repoRoot) {
  const fullPath = resolve(repoRoot, path);
  if (!isWithin(repoRoot, fullPath) || !isWithin(allowedRoot, fullPath)) {
    errors.push(`${path}: path leaves its allowed repository root`);
    return null;
  }

  const repoRelative = relative(repoRoot, fullPath);
  let cursor = repoRoot;
  try {
    for (const component of repoRelative.split(sep).filter(Boolean)) {
      cursor = join(cursor, component);
      if (lstatSync(cursor).isSymbolicLink()) {
        errors.push(`${relative(repoRoot, cursor)}: symlinks are not allowed in validated paths`);
        return null;
      }
    }
    if (!isWithin(realpathSync(allowedRoot), realpathSync(fullPath))) {
      errors.push(`${path}: resolved path leaves its allowed repository root`);
      return null;
    }
  } catch (error) {
    errors.push(`${path}: unable to resolve a validated path: ${error.message}`);
    return null;
  }
  return fullPath;
}

function readRegularFile(fullPath, allowedRoot, beforeIdentityCheck = null) {
  const sameSnapshot = (left, right) =>
    left.dev === right.dev &&
    left.ino === right.ino &&
    left.size === right.size &&
    left.mtimeMs === right.mtimeMs &&
    left.ctimeMs === right.ctimeMs;
  const rootReal = realpathSync(allowedRoot);
  const before = lstatSync(fullPath);
  if (before.isSymbolicLink() || !before.isFile()) {
    throw new Error('validated path must be a regular, non-symlink file');
  }
  if (!isWithin(rootReal, realpathSync(fullPath))) {
    throw new Error('validated file resolves outside its allowed root');
  }

  const flags = fsConstants.O_RDONLY |
    (fsConstants.O_NOFOLLOW ?? 0) |
    (fsConstants.O_NONBLOCK ?? 0);
  const descriptor = openSync(fullPath, flags);
  try {
    const opened = fstatSync(descriptor);
    if (!opened.isFile() || !sameSnapshot(opened, before)) {
      throw new Error('validated file identity changed before it was opened');
    }
    if (beforeIdentityCheck) beforeIdentityCheck();
    const after = lstatSync(fullPath);
    if (
      after.isSymbolicLink() ||
      !after.isFile() ||
      !sameSnapshot(after, opened) ||
      !isWithin(rootReal, realpathSync(fullPath))
    ) {
      throw new Error('validated file identity changed while it was being checked');
    }
    const text = readFileSync(descriptor, 'utf8');
    if (!sameSnapshot(fstatSync(descriptor), opened)) {
      throw new Error('validated file contents changed while they were being read');
    }
    return text;
  } finally {
    closeSync(descriptor);
  }
}

function readRepoFile(path, allowedRoot = repoRoot) {
  const fullPath = resolveSafeRepoPath(path, allowedRoot);
  if (fullPath === null) return '';
  try {
    return readRegularFile(fullPath, allowedRoot);
  } catch (error) {
    errors.push(`${path}: ${error.message}`);
    return '';
  }
}

function readBaseFile(path) {
  const result = runGit(['show', `${baseRef}:${path}`]);
  return result.status === 0 ? result.stdout : null;
}

function checkText(path, text) {
  if (!text) return;
  if (!text.endsWith('\n')) errors.push(`${path}: missing final newline`);
  text.split('\n').forEach((line, index) => {
    if (/[ \t]+$/.test(line)) {
      errors.push(`${path}:${index + 1}: trailing whitespace`);
    }
  });
}

function parseFrontmatter(text) {
  const lines = text.split('\n');
  if (lines[0] !== '---') {
    return { fields: new Map(), body: text, present: false, lineOffset: 0 };
  }
  const end = lines.indexOf('---', 1);
  if (end < 0) return { fields: new Map(), body: text, present: false, lineOffset: 0 };

  const fields = new Map();
  for (const line of lines.slice(1, end)) {
    const match = line.match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/);
    if (!match) continue;
    let value = match[2].trim();
    if (
      value.length >= 2 &&
      ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'")))
    ) {
      value = value.slice(1, -1);
    }
    fields.set(match[1], value);
  }
  return {
    fields,
    body: lines.slice(end + 1).join('\n'),
    present: true,
    lineOffset: end + 1,
  };
}

function maskFencesAndComments(text) {
  let fence = null;
  const lines = text.split('\n').map((line) => {
    if (fence) {
      const close = line.match(/^ {0,3}(`{3,}|~{3,})\s*$/);
      if (
        close &&
        close[1][0] === fence.marker &&
        close[1].length >= fence.length
      ) {
        fence = null;
      }
      return '';
    }
    const open = line.match(/^ {0,3}(`{3,}|~{3,})(?:[^\r\n]*)$/);
    if (open) {
      fence = { marker: open[1][0], length: open[1].length };
      return '';
    }
    return line;
  });
  return lines.join('\n').replace(/<!--[\s\S]*?-->/g, (comment) =>
    '\n'.repeat((comment.match(/\n/g) ?? []).length),
  );
}

function stripHtmlTags(value) {
  let previous;
  do {
    previous = value;
    value = value.replace(/<[^>]*>/g, '');
  } while (value !== previous);
  return value;
}

function stripHeadingFormatting(rawHeading) {
  return stripHtmlTags(
    rawHeading
      .replace(/\s+#+\s*$/, '')
      .replace(/\s*\[#([^\]]+)]\s*$/, '')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\[([^\]]+)]\([^)]+\)/g, '$1'),
  )
    .replace(/[*_~]/g, '')
    .replace(/&[a-zA-Z0-9#]+;/g, '')
    .trim();
}

function fallbackSlug(rawHeading) {
  return stripHeadingFormatting(rawHeading)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(
      /[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g,
      '',
    )
    .replace(/\s/g, '-')
    .replace(/^-+|-+$/g, '');
}

function createHeadingSlugger() {
  if (RendererSlugger) return new RendererSlugger();
  const occurrences = Object.create(null);
  return {
    slug(value) {
      const original = fallbackSlug(value);
      let result = original;
      while (Object.hasOwn(occurrences, result)) {
        occurrences[original] += 1;
        result = `${original}-${occurrences[original]}`;
      }
      occurrences[result] = 0;
      return result;
    },
  };
}

function headingParts(rawHeading) {
  const explicit = rawHeading.match(/\s*\[#([^\]]+)]\s*$/);
  const visibleHeading = explicit ? rawHeading.slice(0, explicit.index) : rawHeading;
  return {
    explicitId: explicit?.[1]?.trim() || null,
    semantic: stripHeadingFormatting(visibleHeading) || 'heading',
  };
}

function walkAst(node, visitor) {
  visitor(node);
  if (Array.isArray(node.children)) {
    for (const child of node.children) walkAst(child, visitor);
  }
}

function literalHtmlAttributes(value, attributeName) {
  const values = [];
  value = value.replace(/<!--[\s\S]*?-->/g, '');
  const tagPattern = /<([a-z][a-z0-9-]*)(?:\s[^<>]*?)?>/g;
  for (const tag of value.matchAll(tagPattern)) {
    const attributePattern = new RegExp(
      `\\s${attributeName}\\s*=\\s*(?:"([^"]+)"|'([^']+)')`,
      'g',
    );
    for (const attribute of tag[0].matchAll(attributePattern)) {
      const literal = (attribute[1] ?? attribute[2] ?? '').trim();
      if (literal) values.push(literal);
    }
  }
  return values;
}

const parserFailures = new Set();
function parseRendererTree(text, path) {
  if (!RendererMarkdownParser || !RendererToString) return null;
  try {
    const parsed = parseFrontmatter(text);
    const tree = RendererMarkdownParser.parse(parsed.body);
    tree.__lineOffset = parsed.lineOffset;
    return tree;
  } catch (error) {
    const label = `${path}: unable to parse Markdown/MDX for anchor validation: ${error.message}`;
    if (!parserFailures.has(label)) {
      parserFailures.add(label);
      errors.push(label);
    }
    return { type: 'root', children: [] };
  }
}

function rendererAnchorEvents(text, path) {
  const tree = parseRendererTree(text, path);
  if (tree === null) return null;
  const events = [];
  const slugger = createHeadingSlugger();
  walkAst(tree, (node) => {
    const offset = node.position?.start?.offset ?? Number.MAX_SAFE_INTEGER;
    const line = (node.position?.start?.line ?? 1) + (tree.__lineOffset ?? 0);
    if (node.type === 'heading') {
      const semantic = RendererToString(node).trim() || 'heading';
      const id = slugger.slug(semantic);
      if (id) events.push({ type: 'heading', id, semantic, offset, line });
      return;
    }
    if (
      (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') &&
      typeof node.name === 'string' &&
      node.name === node.name.toLowerCase()
    ) {
      for (const attribute of node.attributes ?? []) {
        if (
          attribute.type === 'mdxJsxAttribute' &&
          attribute.name === 'id' &&
          typeof attribute.value === 'string' &&
          attribute.value.trim()
        ) {
          events.push({ type: 'explicit', id: attribute.value.trim(), offset, line });
        }
      }
      return;
    }
    if (node.type === 'html' && typeof node.value === 'string') {
      for (const id of literalHtmlAttributes(node.value, 'id')) {
        events.push({ type: 'explicit', id, offset, line });
      }
    }
  });
  return events.sort((left, right) => left.offset - right.offset);
}

function rendererHeadingRecords(text, path) {
  const tree = parseRendererTree(text, path);
  if (tree === null) return null;
  const records = [];
  walkAst(tree, (node) => {
    const offset = node.position?.start?.offset ?? Number.MAX_SAFE_INTEGER;
    const line = (node.position?.start?.line ?? 1) + (tree.__lineOffset ?? 0);
    if (node.type === 'heading') {
      records.push({
        depth: node.depth,
        semantic: RendererToString(node).trim() || 'heading',
        offset,
        line,
      });
      return;
    }
    if (
      (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') &&
      typeof node.name === 'string' &&
      /^h[1-6]$/.test(node.name)
    ) {
      records.push({
        depth: Number(node.name[1]),
        semantic: RendererToString(node).trim() || node.name,
        offset,
        line,
      });
      return;
    }
    if (node.type === 'html' && typeof node.value === 'string') {
      const pattern = /<h([1-6])(?:\s[^<>]*?)?>([\s\S]*?)<\/h\1\s*>/gi;
      for (const match of node.value.matchAll(pattern)) {
        const before = node.value.slice(0, match.index);
        records.push({
          depth: Number(match[1]),
          semantic: stripHtmlTags(match[2]).trim() || `h${match[1]}`,
          offset: offset + match.index,
          line: line + (before.match(/\n/g) ?? []).length,
        });
      }
    }
  });
  return records.sort((left, right) => left.offset - right.offset);
}

function checkDuplicateAnchors(path, text) {
  const events = rendererAnchorEvents(text, path);
  if (events === null) return;
  const seen = new Map();
  for (const event of events) {
    const first = seen.get(event.id);
    if (first) {
      errors.push(
        `${path}:${event.line}: duplicate rendered ID #${event.id}; first generated or declared at line ${first.line}`,
      );
    } else seen.set(event.id, event);
  }
}

function fallbackExplicitIds(visible) {
  return literalHtmlAttributes(visible, 'id');
}

function extractAnchors(text, path = 'document') {
  const events = rendererAnchorEvents(text, path);
  if (events !== null) return new Set(events.map((event) => event.id));

  const { body } = parseFrontmatter(text);
  const visible = maskFencesAndComments(body);
  const anchors = new Set();
  const slugger = createHeadingSlugger();

  for (const line of visible.split('\n')) {
    const heading = line.match(/^\s{0,3}#{1,6}\s+(.+?)\s*$/);
    if (!heading) continue;
    const rawHeading = heading[1].trim();
    const { explicitId, semantic } = headingParts(rawHeading);
    if (explicitId) anchors.add(explicitId);
    else {
      const slug = slugger.slug(semantic);
      if (slug) anchors.add(slug);
    }
  }

  for (const id of fallbackExplicitIds(visible)) anchors.add(id);
  return anchors;
}

function extractAnchorRecords(text, path = 'document') {
  const events = rendererAnchorEvents(text, path);
  if (events !== null) {
    const records = new Map();
    for (const [index, event] of events.entries()) {
      if (event.type === 'heading') records.set(event.id, event.semantic);
      else {
        const nextHeading = events.slice(index + 1).find((candidate) => candidate.type === 'heading');
        records.set(event.id, nextHeading?.semantic ?? `explicit anchor: ${event.id}`);
      }
    }
    return records;
  }

  const { body } = parseFrontmatter(text);
  const visible = maskFencesAndComments(body);
  const records = new Map();
  const slugger = createHeadingSlugger();

  for (const line of visible.split('\n')) {
    const heading = line.match(/^\s{0,3}#{1,6}\s+(.+?)\s*$/);
    if (heading) {
      const rawHeading = heading[1].trim();
      const { explicitId, semantic } = headingParts(rawHeading);
      if (explicitId) records.set(explicitId, semantic);
      else {
        const slug = slugger.slug(semantic);
        if (slug) records.set(slug, semantic);
      }
    }

    for (const id of fallbackExplicitIds(line)) {
      if (id && !records.has(id)) records.set(id, `explicit anchor: ${id}`);
    }
  }
  return records;
}

function routeForMdxPath(path) {
  let route = path.replace(/^content\/docs\//, '').replace(/\.mdx$/, '');
  route = route.replace(/\/index$/, '');
  return `/${route}`;
}

function baselineFragmentRows(target) {
  if (!isStrictDocsTarget(target)) {
    errors.push('--emit-baseline-fragments target must be a strict descendant of content/docs');
    return [];
  }
  const base = runGit(['rev-parse', '--verify', `${baseRef}^{commit}`]);
  if (base.status !== 0) {
    errors.push(`invalid base ref ${baseRef}: ${base.stderr.trim()}`);
    return [];
  }
  const tree = runGit(['ls-tree', '-r', '--name-only', baseRef, '--', target]);
  if (tree.status !== 0) {
    errors.push(`unable to list baseline fragments for ${target}: ${tree.stderr.trim()}`);
    return [];
  }
  const files = tree.stdout
    .split('\n')
    .filter((path) => path.endsWith('.mdx'))
    .filter((path) => !excludeApiReference || basename(path) !== 'api-reference.mdx')
    .sort();
  if (files.length === 0) {
    errors.push(`${target}: no baseline MDX files found at ${baseRef}`);
    return [];
  }

  const rows = [];
  for (const path of files) {
    const text = readBaseFile(path);
    if (text === null) {
      errors.push(`${path}: unable to read from ${baseRef}`);
      continue;
    }
    const route = routeForMdxPath(path);
    for (const [fragment, semantic] of extractAnchorRecords(text, `${path}@${baseRef}`)) {
      rows.push(`${route}#${fragment}\t${semantic}`);
    }
  }
  return [...new Set(rows)].sort();
}

function decodeFragment(path, value, line) {
  try {
    return decodeURIComponent(value);
  } catch {
    errors.push(`${path}:${line}: malformed percent encoding in #${value}`);
    return null;
  }
}

function rendererSamePageLinks(text, path) {
  const tree = parseRendererTree(text, path);
  if (tree === null) return null;
  const links = [];
  walkAst(tree, (node) => {
    const line = (node.position?.start?.line ?? 1) + (tree.__lineOffset ?? 0);
    if (node.type === 'link' && typeof node.url === 'string' && node.url.startsWith('#')) {
      links.push({ raw: node.url.slice(1), line });
      return;
    }
    if (
      (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') &&
      typeof node.name === 'string' &&
      node.name === node.name.toLowerCase()
    ) {
      for (const attribute of node.attributes ?? []) {
        if (
          attribute.type === 'mdxJsxAttribute' &&
          attribute.name === 'href' &&
          typeof attribute.value === 'string' &&
          attribute.value.startsWith('#')
        ) {
          links.push({ raw: attribute.value.slice(1), line });
        }
      }
      return;
    }
    if (node.type === 'html' && typeof node.value === 'string') {
      for (const href of literalHtmlAttributes(node.value, 'href')) {
        if (href.startsWith('#')) links.push({ raw: href.slice(1), line });
      }
    }
  });
  return links;
}

function checkAnchors(path, text) {
  if (!text) return;
  const anchors = extractAnchors(text, path);
  const rendererLinks = rendererSamePageLinks(text, path);
  if (rendererLinks !== null) {
    for (const { raw, line } of rendererLinks) {
      const target = decodeFragment(path, raw, line);
      if (target !== null && !anchors.has(target)) {
        errors.push(`${path}:${line}: missing heading or explicit ID for #${raw}`);
      }
    }
    return;
  }

  const patterns = [/\]\(#([^)]+)\)/g, /\bhref=(?:"#([^"]+)"|'#([^']+)')/g];
  const visible = maskFencesAndComments(text);

  for (const pattern of patterns) {
    for (const match of visible.matchAll(pattern)) {
      const raw = match[1] ?? match[2];
      const line = visible.slice(0, match.index).split('\n').length;
      const target = decodeFragment(path, raw, line);
      if (target !== null && !anchors.has(target)) {
        errors.push(`${path}:${line}: missing heading or explicit ID for #${raw}`);
      }
    }
  }
}

function checkSkill(text) {
  if (!text) return;
  const lines = text.split('\n');
  if (lines[0] !== '---') {
    errors.push(`${paths.skill}: missing YAML frontmatter`);
    return;
  }
  const end = lines.indexOf('---', 1);
  if (end < 0) {
    errors.push(`${paths.skill}: unterminated YAML frontmatter`);
    return;
  }

  const fields = new Map();
  for (const line of lines.slice(1, end)) {
    const match = line.match(/^([a-z][a-z0-9_-]*):\s+(.+)$/);
    if (!match) {
      errors.push(`${paths.skill}: invalid frontmatter line: ${line}`);
      continue;
    }
    fields.set(match[1], match[2]);
  }

  const allowed = new Set(['name', 'description']);
  for (const field of fields.keys()) {
    if (!allowed.has(field)) errors.push(`${paths.skill}: unsupported field ${field}`);
  }
  if (fields.get('name') !== 'wdk-community-module-docs') {
    errors.push(`${paths.skill}: name must be wdk-community-module-docs`);
  }
  const description = fields.get('description') ?? '';
  if (!description || description.length > 1024) {
    errors.push(`${paths.skill}: description must contain 1-1024 characters`);
  }
  if (/[<>]/.test(description)) {
    errors.push(`${paths.skill}: description must not contain angle brackets`);
  }
  if (lines.length > 500) {
    errors.push(`${paths.skill}: keep SKILL.md under 500 lines (found ${lines.length})`);
  }
  if (!text.includes(paths.manual)) {
    errors.push(`${paths.skill}: manual path does not match the installed layout`);
  }
}

function countUnescapedPipes(line) {
  let count = 0;
  for (let index = 0; index < line.length; index += 1) {
    if (line[index] !== '|') continue;
    let slashes = 0;
    for (let cursor = index - 1; cursor >= 0 && line[cursor] === '\\'; cursor -= 1) {
      slashes += 1;
    }
    if (slashes % 2 === 0) count += 1;
  }
  return count;
}

function isTableDelimiter(line) {
  return /^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
}

function checkMdxTables(path, text) {
  const parsed = parseFrontmatter(text);
  const lines = maskFencesAndComments(parsed.body).split('\n');
  for (let index = 0; index < lines.length - 1; index += 1) {
    if (!lines[index].includes('|') || !isTableDelimiter(lines[index + 1])) continue;
    const expected = countUnescapedPipes(lines[index + 1]);
    let cursor = index;
    while (cursor < lines.length && lines[cursor].includes('|') && lines[cursor].trim()) {
      const line = lines[cursor];
      const physicalLine = cursor + 1 + parsed.lineOffset;
      if (countUnescapedPipes(line) !== expected) {
        errors.push(
          `${path}:${physicalLine}: table row has a different number of unescaped pipe delimiters`,
        );
      }
      const withoutCode = line.replace(/`[^`]*`/g, '');
      if (/[<{]/.test(withoutCode)) {
        errors.push(
          `${path}:${physicalLine}: raw MDX generic/object syntax in table cell; use inline code or a fenced block`,
        );
      }
      cursor += 1;
    }
    index = cursor - 1;
  }
}

function extractCodeFences(path, text) {
  const fences = [];
  const lines = text.split('\n');
  let current = null;
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!current) {
      const start = line.match(/^\s*(`{3,}|~{3,})\s*([A-Za-z0-9_-]*)(?:\s+.*)?$/);
      if (start) {
        current = {
          marker: start[1][0],
          length: start[1].length,
          language: start[2].toLowerCase(),
          startLine: index + 1,
          code: [],
        };
      }
      continue;
    }

    const close = line.match(/^\s*(`{3,}|~{3,})\s*$/);
    if (close && close[1][0] === current.marker && close[1].length >= current.length) {
      fences.push({ ...current, code: current.code.join('\n') });
      current = null;
    } else current.code.push(line);
  }
  if (current) errors.push(`${path}:${current.startLine}: unclosed code fence`);
  return fences;
}

function checkExecutableFences(path, text) {
  const executable = new Set(['js', 'javascript', 'jsx', 'ts', 'typescript', 'tsx']);
  const fences = extractCodeFences(path, text).filter((fence) => executable.has(fence.language));
  if (fences.length === 0) return;

  let ts;
  try {
    ts = require('typescript');
  } catch (error) {
    errors.push(`${path}: executable-fence validation requires the workspace TypeScript dependency: ${error.message}`);
    return;
  }
  const expectedTypeScript = lockedDependencyVersion('typescript');
  if (!expectedTypeScript || ts.version !== expectedTypeScript) {
    errors.push(
      `${path}: resolved TypeScript ${ts.version}; lock requires ${expectedTypeScript ?? 'a recorded version'}`,
    );
    return;
  }

  const functionLike = (node) =>
    ts.isFunctionDeclaration(node) ||
    ts.isFunctionExpression(node) ||
    ts.isArrowFunction(node) ||
    ts.isMethodDeclaration(node) ||
    ts.isConstructorDeclaration(node) ||
    ts.isGetAccessorDeclaration(node) ||
    ts.isSetAccessorDeclaration(node);

  for (const fence of fences) {
    const isJs = fence.language === 'js' || fence.language === 'javascript' || fence.language === 'jsx';
    const isJsx = fence.language === 'jsx' || fence.language === 'tsx';
    const kind = isJs
      ? isJsx
        ? ts.ScriptKind.JSX
        : ts.ScriptKind.JS
      : isJsx
        ? ts.ScriptKind.TSX
        : ts.ScriptKind.TS;
    const fileName = `snippet.${isJs ? 'js' : 'ts'}${isJsx ? 'x' : ''}`;
    const source = ts.createSourceFile(fileName, fence.code, ts.ScriptTarget.Latest, true, kind);

    for (const diagnostic of source.parseDiagnostics) {
      const position = source.getLineAndCharacterOfPosition(diagnostic.start ?? 0);
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ');
      errors.push(`${path}:${fence.startLine + 1 + position.line}: invalid ${fence.language} fence: ${message}`);
    }

    const visit = (node) => {
      if (ts.isReturnStatement(node)) {
        let parent = node.parent;
        let enclosed = false;
        while (parent && parent !== source) {
          if (functionLike(parent)) {
            enclosed = true;
            break;
          }
          parent = parent.parent;
        }
        if (!enclosed) {
          const position = source.getLineAndCharacterOfPosition(node.getStart(source));
          errors.push(
            `${path}:${fence.startLine + 1 + position.line}: executable fence has return outside a function; use valid code or a text fragment`,
          );
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(source);

    if (/SOURCE_VERIFY|PSEUDOCODE - DO NOT PUBLISH|<[A-Z][A-Z0-9_]+>/.test(fence.code)) {
      errors.push(`${path}:${fence.startLine}: executable fence contains an authoring placeholder`);
    }
  }
}

function countBodyH1(text, path = 'document') {
  const headings = rendererHeadingRecords(text, path);
  if (headings !== null) return headings.filter((heading) => heading.depth === 1).length;
  const { body } = parseFrontmatter(text);
  const visible = maskFencesAndComments(body).split('\n');
  let count = visible.filter((line) => /^\s{0,3}#\s+/.test(line)).length;
  for (let index = 1; index < visible.length; index += 1) {
    if (/^\s{0,3}=+\s*$/.test(visible[index]) && visible[index - 1].trim()) count += 1;
  }
  return count;
}

function checkHeadingCompatibilitySyntax(path, text) {
  for (const [index, line] of maskFencesAndComments(text).split('\n').entries()) {
    if (!/^\s{0,3}#{1,6}\s+/.test(line)) continue;
    if (/\s\[#([^\]]+)]\s*$/.test(line) || /\s\{#([^}]+)}\s*$/.test(line)) {
      errors.push(
        `${path}:${index + 1}: use an adjacent HTML id for compatibility; trailing heading-ID syntax is not shared by the renderer and link checker`,
      );
    }
  }
}

function checkHeadingHierarchy(path, text) {
  const headings = rendererHeadingRecords(text, path);
  if (headings === null) return;
  let previousLevel = 1;
  for (const heading of headings) {
    const level = heading.depth;
    if (level > previousLevel + 1) {
      errors.push(
        `${path}:${heading.line}: heading level jumps from H${previousLevel} to H${level}; treat the rendered title as H1 and do not skip levels`,
      );
    }
    previousLevel = level;
  }
}

function checkMdxPage(path, text, baseText) {
  checkText(path, text);
  checkAnchors(path, text);
  const parsed = parseFrontmatter(text);
  if (!parsed.present) {
    errors.push(`${path}: missing or unterminated YAML frontmatter`);
    return;
  }

  for (const field of ['title', 'description', 'docType', 'schemaType']) {
    if (!parsed.fields.get(field)) errors.push(`${path}: missing frontmatter ${field}`);
  }
  const allowedDocTypes = new Set([
    'explanation',
    'getting-started',
    'how-to',
    'page',
    'reference',
    'tutorial',
  ]);
  const docType = parsed.fields.get('docType');
  if (docType && !allowedDocTypes.has(docType)) {
    errors.push(`${path}: unsupported docType ${docType}`);
  }
  const allowedSchemas = new Set(['APIReference', 'TechArticle', 'WebPage']);
  const schemaType = parsed.fields.get('schemaType');
  if (schemaType && !allowedSchemas.has(schemaType)) {
    errors.push(`${path}: unsupported schemaType ${schemaType}`);
  }
  const h1Count = countBodyH1(text, path);
  const baseH1Count = baseText === null ? 0 : countBodyH1(baseText, `${path}@${baseRef}`);
  if (h1Count > 1 || (h1Count > 0 && baseH1Count === 0)) {
    errors.push(`${path}: frontmatter title must not be duplicated by a new body H1`);
  }

  if (/SOURCE_VERIFY|PSEUDOCODE - DO NOT PUBLISH/.test(text)) {
    errors.push(`${path}: unreplaced authoring marker`);
  }
  checkHeadingCompatibilitySyntax(path, text);
  checkHeadingHierarchy(path, text);
  checkDuplicateAnchors(path, text);
  checkMdxTables(path, text);
  checkExecutableFences(path, text);

  if (baseText !== null) {
    const candidateAnchors = extractAnchors(text, path);
    for (const anchor of extractAnchors(baseText, `${path}@${baseRef}`)) {
      if (!candidateAnchors.has(anchor)) {
        errors.push(`${path}: baseline fragment #${anchor} is missing from the candidate`);
      }
    }
  }
}

function parseNameStatus(output) {
  const tokens = output.split('\0');
  if (tokens.at(-1) === '') tokens.pop();
  const records = [];
  for (let index = 0; index < tokens.length;) {
    const status = tokens[index++];
    const code = status[0];
    let oldPath = null;
    let candidatePath = null;
    if (code === 'R' || code === 'C') {
      oldPath = tokens[index++];
      candidatePath = tokens[index++];
    } else {
      const path = tokens[index++];
      oldPath = code === 'A' ? null : path;
      candidatePath = code === 'D' ? null : path;
    }
    if (!status || (!oldPath && !candidatePath)) {
      errors.push('unable to parse changed MDX name-status output');
      break;
    }
    if (oldPath?.endsWith('.mdx') || candidatePath?.endsWith('.mdx')) {
      records.push({ status, code, oldPath, candidatePath });
    }
  }
  return records;
}

function changedMdxRecords() {
  const changed = runGit([
    'diff',
    '--name-status',
    '--find-renames',
    '--diff-filter=ACDMRT',
    '-z',
    baseRef,
    '--',
    'content/docs',
  ]);
  if (changed.status !== 0) {
    errors.push(`unable to list changed MDX against ${baseRef}: ${changed.stderr.trim()}`);
    return [];
  }
  const untracked = runGit([
    'ls-files',
    '--others',
    '--exclude-standard',
    '-z',
    '--',
    'content/docs',
  ]);
  if (untracked.status !== 0) {
    errors.push(`unable to list untracked MDX: ${untracked.stderr.trim()}`);
    return [];
  }
  const ignored = runGit([
    'ls-files',
    '--others',
    '--ignored',
    '--exclude-standard',
    '-z',
    '--',
    'content/docs',
  ]);
  if (ignored.status !== 0) {
    errors.push(`unable to list ignored untracked MDX: ${ignored.stderr.trim()}`);
    return [];
  }
  const records = parseNameStatus(changed.stdout);
  for (const path of `${untracked.stdout}${ignored.stdout}`.split('\0')) {
    if (path.endsWith('.mdx')) {
      records.push({ status: '?', code: '?', oldPath: null, candidatePath: path });
    }
  }
  const unique = new Map();
  for (const record of records) {
    unique.set(`${record.status}\0${record.oldPath ?? ''}\0${record.candidatePath ?? ''}`, record);
  }
  return [...unique.values()].sort((left, right) =>
    (left.candidatePath ?? left.oldPath).localeCompare(right.candidatePath ?? right.oldPath),
  );
}

function parseRepoRedirects() {
  const redirects = new Set();
  const text = readRepoFile('_redirects');
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const parts = trimmed.split(/\s+/);
    const status = parts.find((part) => /^\d{3}!?$/.test(part)) ?? '';
    redirects.add([parts[0] ?? '', parts[1] ?? '', status.replace(/!$/, '')].join('\u0000'));
  }
  return redirects;
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function readRouteDecisionDocument() {
  if (routeDecisionsPath === null) return null;
  if (!isAbsolute(routeDecisionsPath)) {
    errors.push('--route-decisions requires an absolute path outside the repository');
    return null;
  }
  try {
    const stat = lstatSync(routeDecisionsPath);
    if (stat.isSymbolicLink() || !stat.isFile()) {
      errors.push(`${routeDecisionsPath}: route-decision input must be a regular file`);
      return null;
    }
    const real = realpathSync(routeDecisionsPath);
    if (isWithin(repoRoot, real)) {
      errors.push(`${routeDecisionsPath}: route-decision input must stay outside the repository`);
      return null;
    }
    return JSON.parse(readRegularFile(real, dirname(real)));
  } catch (error) {
    errors.push(`${routeDecisionsPath}: unable to read route decisions: ${error.message}`);
    return null;
  }
}

function loadRouteDecisions(changed, baseCommit) {
  const byOld = new Map();
  const byNew = new Map();
  const document = readRouteDecisionDocument();
  if (document === null) return { byOld, byNew };
  if (!isPlainObject(document) || document.version !== 1) {
    errors.push(`${routeDecisionsPath}: route-decision version must be 1`);
    return { byOld, byNew };
  }
  if (document.baseCommit !== baseCommit) {
    errors.push(`${routeDecisionsPath}: baseCommit must equal ${baseCommit}`);
  }
  if (!Array.isArray(document.decisions)) {
    errors.push(`${routeDecisionsPath}: decisions must be an array`);
    return { byOld, byNew };
  }

  const repoRedirects = parseRepoRedirects();
  const changedOldPaths = new Map(
    changed
      .filter((record) => record.code === 'D' || record.code === 'R')
      .map((record) => [record.oldPath, record]),
  );
  const changedNewPaths = new Set(
    changed.map((record) => record.candidatePath).filter(Boolean),
  );

  for (const [index, decision] of document.decisions.entries()) {
    const label = `${routeDecisionsPath}:decisions[${index}]`;
    if (!isPlainObject(decision)) {
      errors.push(`${label}: decision must be an object`);
      continue;
    }
    const { kind, oldPath, newPath } = decision;
    if (kind !== 'rename' && kind !== 'delete') {
      errors.push(`${label}: kind must be rename or delete`);
      continue;
    }
    if (!isStrictDocsTarget(oldPath) || !oldPath.endsWith('.mdx')) {
      errors.push(`${label}: oldPath must be a strict content/docs MDX descendant`);
      continue;
    }
    if (byOld.has(oldPath)) {
      errors.push(`${label}: duplicate oldPath ${oldPath}`);
      continue;
    }
    if (decision.operatorAssertedMaintainerApproval !== true) {
      errors.push(`${label}: operatorAssertedMaintainerApproval must be true`);
    }
    if (typeof decision.rationale !== 'string' || !decision.rationale.trim()) {
      errors.push(`${label}: rationale is required`);
    }

    if (kind === 'rename') {
      if (!isStrictDocsTarget(newPath) || !newPath.endsWith('.mdx') || newPath === oldPath) {
        errors.push(`${label}: rename newPath must be a different strict content/docs MDX descendant`);
      } else if (byNew.has(newPath)) {
        errors.push(`${label}: duplicate newPath ${newPath}`);
      } else byNew.set(newPath, decision);
    } else if (newPath !== null && newPath !== undefined) {
      errors.push(`${label}: delete decisions must omit newPath or set it to null`);
    }
    byOld.set(oldPath, decision);

    const actual = changedOldPaths.get(oldPath);
    if (!actual) errors.push(`${label}: oldPath is not deleted or renamed in the current diff`);
    else if (kind === 'delete' && actual.code !== 'D') {
      errors.push(`${label}: delete decision does not match Git change ${actual.status}`);
    } else if (kind === 'rename' && actual.code === 'R' && actual.candidatePath !== newPath) {
      errors.push(`${label}: rename target does not match ${actual.candidatePath}`);
    }
    if (kind === 'rename' && !changedNewPaths.has(newPath)) {
      errors.push(`${label}: rename newPath is not added or renamed in the current diff`);
    }

    const redirects = Array.isArray(decision.redirects) ? decision.redirects : [];
    if (!Array.isArray(decision.redirects)) {
      errors.push(`${label}: redirects must be an array`);
    }
    const oldRoute = routeForMdxPath(oldPath);
    const newRoute = kind === 'rename' && isStrictDocsTarget(newPath)
      ? routeForMdxPath(newPath)
      : null;
    let hasLandingRedirect = false;
    const landingTargets = new Set();
    for (const [redirectIndex, redirect] of redirects.entries()) {
      const redirectLabel = `${label}.redirects[${redirectIndex}]`;
      if (
        !isPlainObject(redirect) ||
        typeof redirect.source !== 'string' ||
        typeof redirect.target !== 'string' ||
        redirect.status !== 301
      ) {
        errors.push(`${redirectLabel}: source, target, and numeric status 301 are required`);
        continue;
      }
      if (!redirect.source.startsWith('/') || !redirect.target.startsWith('/')) {
        errors.push(`${redirectLabel}: route redirects must use root-relative internal paths`);
      }
      if (/[?#]/.test(redirect.source) || /[?#]/.test(redirect.target)) {
        errors.push(`${redirectLabel}: server redirects cannot map query strings or URL fragments`);
      }
      if (!repoRedirects.has([redirect.source, redirect.target, '301'].join('\u0000'))) {
        errors.push(`${redirectLabel}: exact redirect is absent from _redirects`);
      }
      if (redirect.source === oldRoute) {
        landingTargets.add(redirect.target);
        if (kind === 'delete' || redirect.target === newRoute) hasLandingRedirect = true;
      }
    }
    const hasRemovalReason =
      kind === 'delete' &&
      typeof decision.removalReason === 'string' &&
      decision.removalReason.trim().length > 0;
    if (kind === 'rename' && !hasLandingRedirect) {
      errors.push(`${label}: rename requires an exact old-route to new-route 301 redirect`);
    }
    if (kind === 'delete' && !hasLandingRedirect && !hasRemovalReason) {
      errors.push(`${label}: delete requires an exact old-route 301 redirect or removalReason`);
    }

    const baseText = readBaseFile(oldPath);
    if (baseText === null) {
      errors.push(`${label}: oldPath does not exist at the approved base`);
      continue;
    }
    const baselineFragments = extractAnchorRecords(baseText, `${oldPath}@${baseRef}`);
    const fragments = isPlainObject(decision.fragments) ? decision.fragments : null;
    if (fragments === null) {
      errors.push(`${label}: fragments must be an object keyed by every baseline fragment`);
      continue;
    }
    for (const fragment of Object.keys(fragments)) {
      if (!baselineFragments.has(fragment)) {
        errors.push(`${label}.fragments.${fragment}: fragment is absent from the baseline page`);
      }
    }
    for (const [fragment, baselineSemantic] of baselineFragments) {
      const disposition = fragments[fragment];
      const fragmentLabel = `${label}.fragments.${fragment}`;
      if (!isPlainObject(disposition)) {
        errors.push(`${fragmentLabel}: disposition is required`);
        continue;
      }
      if (disposition.semantic !== baselineSemantic) {
        errors.push(`${fragmentLabel}: semantic must match the baseline fragment ledger`);
      }
      if (disposition.disposition === 'retired') {
        if (
          kind !== 'delete' ||
          hasLandingRedirect ||
          !hasRemovalReason ||
          typeof disposition.reason !== 'string' ||
          !disposition.reason.trim()
        ) {
          errors.push(
            `${fragmentLabel}: retired requires a deletion without a redirect and an operator-recorded removal reason`,
          );
        }
        continue;
      }
      if (disposition.disposition !== 'preserved') {
        errors.push(`${fragmentLabel}: disposition must be preserved or retired`);
        continue;
      }
      if (
        !isStrictDocsTarget(disposition.targetPath) ||
        !disposition.targetPath.endsWith('.mdx') ||
        typeof disposition.targetFragment !== 'string' ||
        !disposition.targetFragment
      ) {
        errors.push(`${fragmentLabel}: a strict MDX targetPath and targetFragment are required`);
        continue;
      }
      if (disposition.targetFragment !== fragment) {
        errors.push(
          `${fragmentLabel}: HTTP path redirects preserve URL hashes, so fragment spelling must remain exact`,
        );
      }
      if (kind === 'rename' && disposition.targetPath !== newPath) {
        errors.push(`${fragmentLabel}: rename fragments must remain on the renamed target path`);
      }
      if (
        kind === 'delete' &&
        (!hasLandingRedirect || !landingTargets.has(routeForMdxPath(disposition.targetPath)))
      ) {
        errors.push(
          `${fragmentLabel}: preserved delete fragment must exist on an exact old-route redirect target`,
        );
      }
      const targetText = readRepoFile(disposition.targetPath, join(repoRoot, 'content/docs'));
      if (
        targetText &&
        !extractAnchors(targetText, disposition.targetPath).has(disposition.targetFragment)
      ) {
        errors.push(`${fragmentLabel}: target fragment is absent from ${disposition.targetPath}`);
      }
    }
  }
  return { byOld, byNew };
}

function checkChangedMdx() {
  const base = runGit(['rev-parse', '--verify', `${baseRef}^{commit}`]);
  if (base.status !== 0) {
    errors.push(`invalid base ref ${baseRef}: ${base.stderr.trim()}`);
    return 0;
  }
  const docsRoot = join(repoRoot, 'content/docs');
  const changed = changedMdxRecords();
  const routeDecisions = loadRouteDecisions(changed, base.stdout.trim());
  for (const record of changed) {
    const { code, oldPath, candidatePath } = record;
    if (code === 'D') {
      if (!routeDecisions.byOld.has(oldPath)) {
        errors.push(
          `${oldPath}: deleted MDX requires an external route-decision manifest after independent approval`,
        );
      }
      continue;
    }
    if (code === 'T') {
      errors.push(`${candidatePath}: MDX type changes are not allowed by the changed-page gate`);
      continue;
    }
    if (code === 'R') {
      const decision = routeDecisions.byOld.get(oldPath);
      if (oldPath?.endsWith('.mdx') && candidatePath?.endsWith('.mdx')) {
        checkMdxPage(
          candidatePath,
          readRepoFile(candidatePath, docsRoot),
          decision ? null : readBaseFile(oldPath),
        );
      }
      if (!decision) {
        errors.push(
          `${oldPath} -> ${candidatePath}: renamed MDX requires an external route-decision manifest after independent approval`,
        );
      }
      continue;
    }
    if (candidatePath?.endsWith('.mdx')) {
      const baseText = oldPath === null || code === 'C' ? null : readBaseFile(oldPath);
      checkMdxPage(candidatePath, readRepoFile(candidatePath, docsRoot), baseText);
    }
  }
  return changed.length;
}

function currentMdxPaths(target) {
  const docsRoot = join(repoRoot, 'content/docs');
  if (!isStrictDocsTarget(target)) {
    errors.push(`--validate-mdx target must be a strict descendant of content/docs: ${target}`);
    return [];
  }
  const fullTarget = resolve(repoRoot, target);
  if (!isWithin(docsRoot, fullTarget)) {
    errors.push(`--validate-mdx target must stay under content/docs: ${target}`);
    return [];
  }
  const safeTarget = resolveSafeRepoPath(target, docsRoot);
  if (safeTarget === null) return [];

  const errorCountBeforeWalk = errors.length;
  const results = [];
  const walk = (fullPath) => {
    const stat = lstatSync(fullPath);
    const displayPath = relative(repoRoot, fullPath);
    if (stat.isSymbolicLink()) {
      errors.push(`${displayPath}: symlinks are not allowed in --validate-mdx targets`);
      return;
    }
    if (stat.isDirectory()) {
      for (const entry of readdirSync(fullPath)) walk(join(fullPath, entry));
    } else if (stat.isFile() && fullPath.endsWith('.mdx')) {
      if (!excludeApiReference || basename(fullPath) !== 'api-reference.mdx') {
        results.push(displayPath);
      }
    } else if (!stat.isFile()) {
      errors.push(`${displayPath}: special paths are not allowed in --validate-mdx targets`);
    }
  };

  try {
    walk(safeTarget);
  } catch (error) {
    errors.push(`${target}: unable to enumerate current MDX: ${error.message}`);
    return [];
  }
  if (results.length === 0 && errors.length === errorCountBeforeWalk) {
    errors.push(`${target}: no MDX files found`);
  }
  return results.sort();
}

function checkCurrentMdx(target) {
  const docsRoot = join(repoRoot, 'content/docs');
  const current = currentMdxPaths(target);
  for (const path of current) checkMdxPage(path, readRepoFile(path, docsRoot), null);
  return current.length;
}

function bytewiseSort(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function snapshotRepoTree(root = repoRoot) {
  const records = [];
  const walk = (directory, parent = '') => {
    for (const entry of readdirSync(directory).sort(bytewiseSort)) {
      const path = parent ? `${parent}/${entry}` : entry;
      const fullPath = join(directory, entry);
      const stat = lstatSync(fullPath);
      const mode = (stat.mode & 0o7777).toString(8);
      if (entry === '.git') {
        errors.push(`${path}: Git metadata is not allowed in a generation snapshot`);
      } else if (stat.isSymbolicLink()) {
        records.push({ path, type: 'symlink', mode, target: readlinkSync(fullPath) });
      } else if (stat.isDirectory()) {
        records.push({ path, type: 'directory', mode });
        walk(fullPath, path);
      } else if (stat.isFile()) {
        const sha256 = createHash('sha256').update(readFileSync(fullPath)).digest('hex');
        records.push({ path, type: 'file', mode, sha256 });
      } else records.push({ path, type: 'special', mode });
    }
  };
  walk(root);
  return records;
}

function manifestText(records) {
  return `${records.map((record) => JSON.stringify(record)).join('\n')}\n`;
}

function inspectGenerationSnapshot(directory = repoRoot, parent = '') {
  for (const entry of readdirSync(directory).sort(bytewiseSort)) {
    const path = parent ? `${parent}/${entry}` : entry;
    const fullPath = join(directory, entry);
    const stat = lstatSync(fullPath);
    if (entry === '.git') {
      errors.push(`${path}: Git metadata is not allowed before fixture sanitization`);
    } else if (stat.isSymbolicLink()) {
      errors.push(`${path}: symlinks are not allowed before fixture sanitization`);
    } else if (stat.isDirectory()) inspectGenerationSnapshot(fullPath, path);
    else if (!stat.isFile()) {
      errors.push(`${path}: special paths are not allowed before fixture sanitization`);
    }
  }
}

function sanitizeGenerationRoot(target) {
  const hasRenderedTarget = target !== '';
  if (hasRenderedTarget) {
    if (!isStrictDocsTarget(target)) {
      errors.push('--sanitize-generation target must be a strict descendant of content/docs');
      return 0;
    }
  }
  if (repoRoot === resolve('/')) {
    errors.push('--sanitize-generation refuses to operate at the filesystem root');
    return 0;
  }
  if (hasRenderedTarget && !existsSync(resolve(repoRoot, target))) {
    errors.push(`${target}: target docs must exist before fixture sanitization`);
    return 0;
  }

  try {
    inspectGenerationSnapshot();
  } catch (error) {
    errors.push(`unable to inspect the generation snapshot: ${error.message}`);
  }
  if (errors.length > 0) return 0;

  const requested = [
    ...(hasRenderedTarget ? [target] : []),
    '.next',
    '.source',
    '.turbo',
    '.cache',
    'coverage',
    'dist',
    'node_modules',
    'out',
    'public/api',
    'public/og',
    'public/llms.txt',
    'public/llms-full.txt',
  ];
  const deletions = [];
  for (const path of requested) {
    const fullPath = resolve(repoRoot, path);
    if (!existsSync(fullPath)) continue;
    const safePath = resolveSafeRepoPath(path);
    if (safePath !== null) deletions.push({ path, fullPath: safePath });
  }
  if (errors.length > 0) return 0;

  for (const { fullPath } of deletions) {
    rmSync(fullPath, { force: true, recursive: true });
  }
  for (const { path, fullPath } of deletions) {
    if (existsSync(fullPath)) errors.push(`${path}: fixture sanitizer did not remove the path`);
  }
  if (hasRenderedTarget && existsSync(resolve(repoRoot, target))) {
    errors.push(`${target}: target docs remain after fixture sanitization`);
  }
  return deletions.length;
}

function safeEvidenceFile(evidenceRoot, name) {
  const path = join(evidenceRoot, name);
  try {
    const stat = lstatSync(path);
    if (stat.isSymbolicLink() || !stat.isFile()) {
      errors.push(
        `${path}: evidence input must be a regular file, not a symlink or special path`,
      );
      return null;
    }
    if (!isWithin(evidenceRoot, realpathSync(path))) {
      errors.push(`${path}: evidence input leaves the evidence root`);
      return null;
    }
    return realpathSync(path);
  } catch (error) {
    errors.push(`${path}: unable to read evidence input: ${error.message}`);
    return null;
  }
}

function apiReferencePrReadinessError(policy) {
  if (!['IN_SCOPE', 'QUARANTINED', 'NOT_APPLICABLE'].includes(policy)) {
    return 'invalid API reference policy token';
  }
  if (policy === 'QUARANTINED') {
    return 'QUARANTINED API reference policy is incomplete and cannot pass PR readiness';
  }
  return null;
}

function parseApiReferencePolicyText(text, source) {
  const match = /^(IN_SCOPE|QUARANTINED|NOT_APPLICABLE)(?:\r?\n)?$/.exec(text);
  if (!match) {
    errors.push(
      `${source}: expected exactly one canonical API reference policy token and an optional final newline`,
    );
    return '';
  }
  return match[1];
}

function loadPrApiReferencePolicy(path) {
  if (!isAbsolute(path)) {
    errors.push('--api-reference-policy requires an absolute evidence-file path');
    return null;
  }
  try {
    const evidenceRoot = realpathSync(dirname(resolve(path)));
    const safePath = safeEvidenceFile(evidenceRoot, basename(path));
    if (safePath === null) return null;
    const policy = parseApiReferencePolicyText(
      readRegularFile(safePath, evidenceRoot),
      path,
    );
    if (!policy) return null;
    const policyError = apiReferencePrReadinessError(policy);
    if (policyError) errors.push(`${path}: ${policyError}`);
    return policy;
  } catch (error) {
    errors.push(`${path}: unable to read API reference policy: ${error.message}`);
    return null;
  }
}

function parseTreeManifest(path, evidenceRoot) {
  if (path === null) return new Map();
  const records = new Map();
  for (const [index, line] of readRegularFile(path, evidenceRoot).split('\n').entries()) {
    if (!line) continue;
    try {
      const record = JSON.parse(line);
      if (
        !record ||
        typeof record.path !== 'string' ||
        !['directory', 'file', 'special', 'symlink'].includes(record.type) ||
        typeof record.mode !== 'string' ||
        records.has(record.path)
      ) {
        throw new Error('invalid or duplicate record');
      }
      records.set(record.path, record);
    } catch (error) {
      errors.push(`${path}:${index + 1}: invalid tree-manifest record: ${error.message}`);
    }
  }
  return records;
}

function normalizeAllowedOutput(path, source) {
  const normalized = path.replace(/^\.\//, '');
  if (
    !normalized ||
    isAbsolute(normalized) ||
    normalized.split('/').some((part) => part === '.' || part === '..') ||
    resolve(repoRoot, normalized) === repoRoot ||
    !isWithin(repoRoot, resolve(repoRoot, normalized))
  ) {
    errors.push(`${source}: invalid allowed output path ${path}`);
    return null;
  }
  return normalized;
}

function sameManifestRecord(left, right) {
  return (
    left.type === right.type &&
    left.mode === right.mode &&
    (left.sha256 ?? null) === (right.sha256 ?? null) &&
    (left.target ?? null) === (right.target ?? null)
  );
}

function checkIsolatedOutputTree(evidencePath) {
  if (!isAbsolute(evidencePath)) {
    errors.push('--check-isolated-output requires an absolute evidence directory');
    return;
  }
  let evidenceRoot;
  try {
    const stat = lstatSync(evidencePath);
    if (stat.isSymbolicLink() || !stat.isDirectory()) {
      errors.push(`${evidencePath}: evidence root must be a regular directory`);
      return;
    }
    evidenceRoot = realpathSync(evidencePath);
  } catch (error) {
    errors.push(`${evidencePath}: unable to resolve evidence root: ${error.message}`);
    return;
  }
  if (isWithin(repoRoot, evidenceRoot)) {
    errors.push(`${evidencePath}: evidence root must be outside the generation root`);
    return;
  }

  const baselinePath = safeEvidenceFile(evidenceRoot, 'allowed-tree.jsonl');
  const outputsPath = safeEvidenceFile(evidenceRoot, 'allowed-outputs.txt');
  const policyPath = safeEvidenceFile(evidenceRoot, 'fixture-policy.txt');
  const fragmentsPath = safeEvidenceFile(evidenceRoot, 'baseline-fragments.tsv');
  const apiPolicyPath = safeEvidenceFile(evidenceRoot, 'api-reference-policy.txt');
  const targetPath = safeEvidenceFile(evidenceRoot, 'target-docs-dir.txt');
  const baseline = parseTreeManifest(baselinePath, evidenceRoot);
  const allowed = new Set();
  const allowedText = outputsPath === null ? '' : readRegularFile(outputsPath, evidenceRoot);
  if (outputsPath !== null) {
    for (const line of allowedText.split(/\r?\n/)) {
      if (!line) continue;
      const path = normalizeAllowedOutput(line, outputsPath);
      if (path !== null) allowed.add(path);
    }
  }
  const fixturePolicy = policyPath === null
    ? ''
    : readRegularFile(policyPath, evidenceRoot).trim();
  const fragmentPolicy = fragmentsPath === null
    ? ''
    : readRegularFile(fragmentsPath, evidenceRoot).trim();
  const apiReferencePolicy = apiPolicyPath === null
    ? ''
    : parseApiReferencePolicyText(
      readRegularFile(apiPolicyPath, evidenceRoot),
      apiPolicyPath,
    );
  const targetDocsDirectory = targetPath === null
    ? ''
    : readRegularFile(targetPath, evidenceRoot).trim();
  const policies = new Set([
    'RENDERED',
    'CLASSIFICATION_ONLY',
    'CATALOG_ONLY',
    'NO_APPROVED_ROUTE',
  ]);
  if (!policies.has(fixturePolicy)) {
    errors.push(`${policyPath ?? evidenceRoot}: invalid fixture policy ${fixturePolicy || '(empty)'}`);
  } else if (fixturePolicy === 'RENDERED' && !isStrictDocsTarget(targetDocsDirectory)) {
    errors.push('RENDERED fixture requires a strict target below content/docs');
  } else if (fixturePolicy !== 'RENDERED' && targetDocsDirectory !== '') {
    errors.push(`${fixturePolicy} fixture requires an empty target-docs-dir.txt`);
  } else if (
    fixturePolicy === 'RENDERED' &&
    !['IN_SCOPE', 'QUARANTINED'].includes(apiReferencePolicy)
  ) {
    errors.push('RENDERED fixture requires API reference policy IN_SCOPE or QUARANTINED');
  } else if (fixturePolicy !== 'RENDERED' && apiReferencePolicy !== 'NOT_APPLICABLE') {
    errors.push(`${fixturePolicy} fixture requires API reference policy NOT_APPLICABLE`);
  } else if (fixturePolicy !== 'RENDERED' && fragmentPolicy !== fixturePolicy) {
    errors.push(`${fixturePolicy} must be the exact non-rendered compatibility marker`);
  } else if (fixturePolicy === 'RENDERED' && (!fragmentPolicy || policies.has(fragmentPolicy))) {
    errors.push('RENDERED fixture requires a non-policy baseline fragment manifest');
  } else if (fixturePolicy === 'RENDERED' && allowed.size === 0) {
    errors.push('RENDERED fixture requires at least one allowed output');
  } else if (
    (fixturePolicy === 'CLASSIFICATION_ONLY' || fixturePolicy === 'NO_APPROVED_ROUTE') &&
    allowed.size !== 0
  ) {
    errors.push(`${fixturePolicy} fixture requires an empty output allowlist`);
  } else if (fixturePolicy === 'CATALOG_ONLY') {
    const catalogPath = safeEvidenceFile(evidenceRoot, 'catalog-output-policy.txt');
    if (catalogPath !== null && readRegularFile(catalogPath, evidenceRoot) !== allowedText) {
      errors.push('CATALOG_ONLY allowlist differs from its approved catalog policy');
    }
    if (allowed.size === 0) errors.push('CATALOG_ONLY fixture requires approved catalog output');
  }
  if (
    apiReferencePolicy === 'QUARANTINED' &&
    [...allowed].some((path) => basename(path) === 'api-reference.mdx')
  ) {
    errors.push('QUARANTINED API reference policy forbids API-reference output paths');
  }
  if (errors.length > 0) return;

  for (const record of baseline.values()) {
    if (record.type === 'symlink' || record.type === 'special') {
      errors.push(`${record.path}: unsafe path exists in the allowed tree`);
    }
  }
  if (fixturePolicy === 'CATALOG_ONLY') {
    for (const path of allowed) {
      const record = baseline.get(path);
      if (!record || record.type !== 'file') {
        errors.push(`${path}: CATALOG_ONLY output must be an existing regular file`);
      }
      if (path === 'src/lib/custom-tree.ts') {
        errors.push('CATALOG_ONLY output must not modify src/lib/custom-tree.ts');
      }
    }
  }
  const current = new Map(snapshotRepoTree().map((record) => [record.path, record]));
  const addedFiles = new Set();

  for (const [path, expected] of baseline) {
    const actual = current.get(path);
    if (!actual) {
      errors.push(`${path}: baseline path was deleted`);
      continue;
    }
    if (allowed.has(path) && expected.type === 'file') {
      if (actual.type !== 'file' || actual.mode !== expected.mode) {
        errors.push(`${path}: allowed file changed type or mode`);
      }
    } else if (!sameManifestRecord(expected, actual)) {
      errors.push(`${path}: baseline path changed outside its allowed content policy`);
    }
  }

  const addedDirectories = [];
  for (const [path, actual] of current) {
    if (baseline.has(path)) continue;
    if (actual.type === 'file') {
      if (!allowed.has(path)) errors.push(`${path}: added file is not allowlisted`);
      else if (actual.mode !== '644') errors.push(`${path}: added file mode must be 644`);
      else addedFiles.add(path);
    } else if (actual.type === 'directory') addedDirectories.push(actual);
    else errors.push(`${path}: added ${actual.type} path is not allowed`);
  }
  for (const directory of addedDirectories) {
    const hasAllowedDescendant = [...addedFiles].some((path) =>
      path.startsWith(`${directory.path}/`),
    );
    if (!hasAllowedDescendant) {
      errors.push(`${directory.path}: added directory has no generated allowlisted file`);
    } else if (directory.mode !== '755') {
      errors.push(`${directory.path}: added directory mode must be 755`);
    }
  }
}

async function runSelfTests() {
  if (
    apiReferencePrReadinessError('IN_SCOPE') !== null ||
    apiReferencePrReadinessError('NOT_APPLICABLE') !== null ||
    !apiReferencePrReadinessError('QUARANTINED')?.includes('cannot pass PR readiness') ||
    !apiReferencePrReadinessError('UNKNOWN')?.includes('invalid API reference policy')
  ) {
    errors.push('self-test: API-reference PR-readiness policy drifted');
  }
  const acceptedDocsTargets = [
    'content/docs/sdk/example',
    'content/docs/sdk/example/index.mdx',
  ];
  const rejectedDocsTargets = [
    '',
    'content/docs',
    'content/docs/',
    'content/docs//sdk',
    'content/docs/sdk/',
    'content/docs/./sdk',
    'content/docs/../outside',
    '/content/docs/sdk',
  ];
  if (
    acceptedDocsTargets.some((target) => !isStrictDocsTarget(target)) ||
    rejectedDocsTargets.some((target) => isStrictDocsTarget(target))
  ) {
    errors.push('self-test: strict content/docs target boundary drifted');
  }

  const titledFence = [
    '```typescript title="Example"',
    'const value: string = "ok";',
    '```',
  ].join('\n');
  const fences = extractCodeFences('self-test', titledFence);
  if (fences.length !== 1 || fences[0].language !== 'typescript') {
    errors.push('self-test: titled executable fence was not parsed');
  }

  let ts;
  try {
    ts = require('typescript');
  } catch (error) {
    errors.push(`self-test: TypeScript dependency unavailable: ${error.message}`);
    return;
  }
  const expectedTypeScript = lockedDependencyVersion('typescript');
  if (!expectedTypeScript || ts.version !== expectedTypeScript) {
    errors.push(
      `self-test: resolved TypeScript ${ts.version}; lock requires ${expectedTypeScript ?? 'a recorded version'}`,
    );
    return;
  }
  const invalid = ts.createSourceFile(
    'invalid.ts',
    'method(value: string): Promise<string>',
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  if (invalid.parseDiagnostics.length === 0) {
    errors.push('self-test: invalid TypeScript signature was not rejected');
  }

  if (countUnescapedPipes('| `A \\| B` | value |') !== 3) {
    errors.push('self-test: escaped table pipe was counted as a delimiter');
  }
  const errorsBeforeTableLine = errors.length;
  checkMdxTables(
    'self-test-table-line',
    '---\ntitle: Example\n---\n\n| A | B |\n|---|---|\n| good | row |\n| broken |',
  );
  const tableLineErrors = errors.splice(errorsBeforeTableLine);
  if (tableLineErrors.length !== 1 || !tableLineErrors[0].includes(':8:')) {
    errors.push('self-test: table diagnostics did not report the failing physical row');
  }
  const anchors = extractAnchors('---\ntitle: Example\n---\n\n<span id="legacy"></span>\n## Current');
  if (anchors.has('example') || !anchors.has('legacy') || !anchors.has('current')) {
    errors.push('self-test: rendered heading or explicit-ID anchors were not extracted exactly');
  }
  const records = extractAnchorRecords('---\ntitle: Example\n---\n\n<span id="legacy"></span>\n## Current');
  if (records.has('example') || records.get('current') !== 'Current') {
    errors.push('self-test: baseline fragment semantics were not extracted');
  }
  const renderedAnchors = extractAnchors(
    '---\ntitle: Example\n---\n\n## Foo\n## Foo\n## Foo-1\n<span id="stable-account"></span>\n## Account setup',
  );
  if (
    !renderedAnchors.has('foo') ||
    !renderedAnchors.has('foo-1') ||
    !renderedAnchors.has('foo-1-1') ||
    !renderedAnchors.has('stable-account') ||
    renderedAnchors.has('account-setup-stable-account')
  ) {
    errors.push('self-test: HTML compatibility IDs or collision suffixes drifted');
  }
  const errorsBeforeHeadingIds = errors.length;
  checkHeadingCompatibilitySyntax(
    'self-test-heading-ids',
    '---\ntitle: Example\n---\n\n## One [#old]\n## Two {#older}',
  );
  const headingIdErrors = errors.splice(errorsBeforeHeadingIds);
  if (headingIdErrors.length !== 2) {
    errors.push('self-test: trailing heading-ID syntax was not rejected');
  }
  const errorsBeforeHeadingHierarchy = errors.length;
  checkHeadingHierarchy(
    'self-test-heading-hierarchy',
    '---\ntitle: Example\n---\n\n### Skipped\n## Major\n#### Skipped child',
  );
  const headingHierarchyErrors = errors.splice(errorsBeforeHeadingHierarchy);
  if (
    headingHierarchyErrors.length !== 2 ||
    !headingHierarchyErrors[0].includes(':5:') ||
    !headingHierarchyErrors[1].includes(':7:')
  ) {
    errors.push('self-test: skipped MDX heading levels were not rejected');
  }
  if (
    countBodyH1(
      '---\ntitle: Example\n---\n\nSetext heading\n==============\n\n<h1>MDX heading</h1>',
      'self-test-rendered-h1',
    ) !== 2
  ) {
    errors.push('self-test: Setext or MDX body H1 was not recognized');
  }
  const errorsBeforeMdxHierarchy = errors.length;
  checkHeadingHierarchy(
    'self-test-mdx-heading-hierarchy',
    '---\ntitle: Example\n---\n\n<h3>Skipped</h3>',
  );
  const mdxHierarchyErrors = errors.splice(errorsBeforeMdxHierarchy);
  if (mdxHierarchyErrors.length !== 1 || !mdxHierarchyErrors[0].includes(':5:')) {
    errors.push('self-test: MDX heading hierarchy or physical line offset drifted');
  }
  const errorsBeforeDuplicateAnchor = errors.length;
  checkDuplicateAnchors(
    'self-test-duplicate-anchor',
    '---\ntitle: Example\n---\n\n## Current\n<span id="current"></span>',
  );
  const duplicateAnchorErrors = errors.splice(errorsBeforeDuplicateAnchor);
  if (
    duplicateAnchorErrors.length !== 1 ||
    !duplicateAnchorErrors[0].includes(':6:') ||
    !duplicateAnchorErrors[0].includes('line 5')
  ) {
    errors.push('self-test: duplicate explicit/generated IDs were not rejected');
  }
  const errorsBeforeFencedLink = errors.length;
  checkAnchors(
    'self-test-fenced-link',
    '---\ntitle: Example\n---\n\n```md\n[Example]' + '(#not-a-live-link)\n```',
  );
  if (errors.length !== errorsBeforeFencedLink) {
    errors.push('self-test: a link inside a fenced example was treated as live');
  }
  const errorsBeforeLongFence = errors.length;
  checkAnchors(
    'self-test-long-fence',
    '---\ntitle: Example\n---\n\n````md\n```\n````\n\n[Broken]' + '(#missing)',
  );
  const longFenceErrors = errors.splice(errorsBeforeLongFence);
  if (longFenceErrors.length !== 1 || !longFenceErrors[0].includes('#missing')) {
    errors.push('self-test: a shorter fence marker hid a live link after a longer fence');
  }
  const dataIdAnchors = extractAnchors(
    '---\ntitle: Example\n---\n\n<span data-id="legacy"></span>\n## Current',
    'self-test-data-id',
  );
  if (dataIdAnchors.has('legacy') || !dataIdAnchors.has('current')) {
    errors.push('self-test: data-id was accepted as a rendered ID anchor');
  }

  const specialRoot = mkdtempSync(join(tmpdir(), 'wdk-doc-validator.'));
  const expectSpecialPathRejection = (path, label, hook = null) => {
    try {
      readRegularFile(path, label === 'device' ? '/' : specialRoot, hook);
      errors.push(`self-test: ${label} path was accepted as a regular file`);
    } catch {
      // Expected.
    }
  };
  try {
    const regular = join(specialRoot, 'regular.mdx');
    writeFileSync(regular, 'regular\n');
    if (readRegularFile(regular, specialRoot) !== 'regular\n') {
      errors.push('self-test: regular-file descriptor read failed');
    }

    const gitTree = join(specialRoot, 'git-tree');
    mkdirSync(join(gitTree, '.git', 'hooks'), { recursive: true });
    writeFileSync(join(gitTree, '.git', 'hooks', 'pre-commit'), 'hidden\n');
    const errorsBeforeGitTree = errors.length;
    snapshotRepoTree(gitTree);
    const gitTreeErrors = errors.splice(errorsBeforeGitTree);
    if (
      gitTreeErrors.length !== 1 ||
      !gitTreeErrors[0].includes('Git metadata is not allowed')
    ) {
      errors.push('self-test: Git metadata was not rejected from a generation snapshot');
    }

    const fifo = join(specialRoot, 'content.fifo');
    const mkfifo = spawnSync('mkfifo', [fifo], { encoding: 'utf8' });
    if (mkfifo.status !== 0) errors.push(`self-test: unable to create FIFO: ${mkfifo.stderr}`);
    else expectSpecialPathRejection(fifo, 'FIFO');

    if (existsSync('/dev/null')) expectSpecialPathRejection('/dev/null', 'device');

    const socket = join(specialRoot, 'content.sock');
    const server = createServer();
    await new Promise((resolveListen, rejectListen) => {
      server.once('error', rejectListen);
      server.listen(socket, resolveListen);
    });
    try {
      expectSpecialPathRejection(socket, 'socket');
    } finally {
      await new Promise((resolveClose) => server.close(resolveClose));
    }

    const swapped = join(specialRoot, 'swapped.mdx');
    const original = join(specialRoot, 'original.mdx');
    writeFileSync(swapped, 'before\n');
    expectSpecialPathRejection(swapped, 'swapped', () => {
      renameSync(swapped, original);
      writeFileSync(swapped, 'after\n');
    });
  } finally {
    rmSync(specialRoot, { recursive: true, force: true });
  }
  const changes = parseNameStatus(
    'D\0content/docs/deleted.mdx\0' +
      'R100\0content/docs/old.mdx\0content/docs/new.mdx\0' +
      'T\0content/docs/type-change.mdx\0',
  );
  if (
    changes.length !== 3 ||
    changes[0].code !== 'D' ||
    changes[1].oldPath !== 'content/docs/old.mdx' ||
    changes[1].candidatePath !== 'content/docs/new.mdx' ||
    changes[2].code !== 'T'
  ) {
    errors.push('self-test: deletion, rename, or type-change status was not preserved');
  }
}

function walkApiReferences(directory, results = []) {
  for (const entry of readdirSync(directory)) {
    const fullPath = join(directory, entry);
    const stat = lstatSync(fullPath);
    const path = relative(repoRoot, fullPath);
    if (stat.isSymbolicLink()) {
      errors.push(`${path}: symlinks are not allowed during API-reference tracking`);
    } else if (stat.isDirectory()) walkApiReferences(fullPath, results);
    else if (stat.isFile() && entry === 'api-reference.mdx') results.push(fullPath);
    else if (!stat.isFile()) {
      errors.push(`${path}: special paths are not allowed during API-reference tracking`);
    }
  }
  return results;
}

function checkApiReferencesAreTracked() {
  const docsRoot = resolveSafeRepoPath('content/docs');
  if (docsRoot === null) return;
  try {
    for (const fullPath of walkApiReferences(docsRoot)) {
      const path = relative(repoRoot, fullPath);
      const inHead = runGit(['cat-file', '-e', `HEAD:${path}`]);
      if (inHead.status === 0) continue;

      const staged = runGit([
        'diff',
        '--cached',
        '--name-only',
        '--diff-filter=A',
        '-z',
        '--',
        path,
      ]);
      const stagedPaths = staged.stdout.split('\0').filter(Boolean);
      if (staged.status !== 0 || stagedPaths.length !== 1 || stagedPaths[0] !== path) {
        errors.push(
          `${path}: new API reference requires an actual staged addition; intent-to-add is insufficient`,
        );
      }
    }
  } catch (error) {
    errors.push(`content/docs: unable to verify API references: ${error.message}`);
  }
}

if (emitTreeManifest) {
  try {
    const snapshot = snapshotRepoTree();
    if (errors.length > 0) throw new Error(errors.join('\n'));
    process.stdout.write(manifestText(snapshot));
  } catch (error) {
    console.error(`unable to emit tree manifest: ${error.message}`);
    process.exit(1);
  }
  process.exit(0);
}

if (fragmentTarget) {
  const rows = baselineFragmentRows(fragmentTarget);
  if (errors.length > 0) {
    console.error(errors.join('\n'));
    process.exit(1);
  }
  process.stdout.write(`${rows.join('\n')}\n`);
  process.exit(0);
}

const activePaths = skillOnly
  ? { skill: paths.skill, validator: paths.validator }
  : paths;
const contents = Object.fromEntries(
  Object.entries(activePaths).map(([name, path]) => [name, readRepoFile(path)]),
);

for (const [name, path] of Object.entries(activePaths)) {
  checkText(path, contents[name]);
  if (/\.mdx?$/.test(path)) checkAnchors(path, contents[name]);
}
checkSkill(contents.skill);

if (!skillOnly) {
  for (const path of Object.values(paths)) {
    if (!contents.readme.includes(path)) {
      errors.push(`${paths.readme}: missing installed path ${path}`);
    }
  }
}

if (sanitizeGenerationTarget !== null) {
  if (errors.length > 0) {
    console.error(errors.join('\n'));
    process.exit(1);
  }
  const deletedCount = sanitizeGenerationRoot(sanitizeGenerationTarget);
  if (errors.length > 0) {
    console.error(errors.join('\n'));
    process.exit(1);
  }
  console.log(`Sanitized generation root; removed ${deletedCount} approved path(s).`);
  process.exit(0);
}

if (checkIsolatedOutput !== null) {
  if (errors.length === 0) checkIsolatedOutputTree(checkIsolatedOutput);
  if (errors.length > 0) {
    console.error(errors.join('\n'));
    process.exit(1);
  }
  console.log('Validated typed generation-tree changes against the output allowlist.');
  process.exit(0);
}

const changedMdxCount = docsChanged ? checkChangedMdx() : 0;
const currentMdxCount = currentMdxTarget ? checkCurrentMdx(currentMdxTarget) : 0;
if (selfTest) await runSelfTests();
const prApiReferencePolicy = prReady && prApiReferencePolicyPath
  ? loadPrApiReferencePolicy(prApiReferencePolicyPath)
  : null;
if (prReady) checkApiReferencesAreTracked();

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(
  skillOnly
    ? 'Validated standalone skill path, frontmatter, same-file anchors, and whitespace.'
    : 'Validated artifact paths, skill frontmatter, same-file anchors, and whitespace.',
);
console.log(
  docsChanged
    ? `Validated ${changedMdxCount} MDX change(s) against ${baseRef}.`
    : currentMdxTarget
      ? `Validated ${currentMdxCount} current MDX file(s) without a Git base comparison.`
      : 'Skipped MDX checks; use --validate-mdx=<path> during generation or --docs-changed --base=<ref> during evaluation.',
);
console.log(
  routeDecisionsPath
    ? `Validated route-decision manifest structure from ${routeDecisionsPath}; maintainer approval was not authenticated.`
    : 'No route-decision manifest supplied; MDX deletions and renames fail closed.',
);
console.log(selfTest ? 'Validator self-tests passed.' : 'Skipped validator self-tests; use --self-test.');
const prPolicySuffix = prApiReferencePolicy
  ? ` under ${prApiReferencePolicy} policy`
  : '';
console.log(
  prReady
    ? `Validated that API-reference files present in content/docs are tracked${prPolicySuffix}.`
    : 'Skipped API-reference tracking; use --pr-ready with its required external policy file.',
);
