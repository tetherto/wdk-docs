#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, '..');
const DEFAULT_DIST_DIR = path.join(REPO_ROOT, 'dist');
const DEFAULT_REQUIRED_PATHS = ['index.md', 'sdk/get-started.md'];
const DEFAULT_PUBLIC_LLMS_PATH = path.join(REPO_ROOT, 'public', 'llms.txt');
const DEFAULT_CATALOG_SOURCE_PATH = path.join(REPO_ROOT, 'content', 'feeds', 'all-modules.md');
const DEFAULT_PUBLIC_LLMS_FULL_PATH = path.join(REPO_ROOT, 'public', 'llms-full.txt');
const DEFAULT_DOCS_ROOT = path.join(REPO_ROOT, 'content', 'docs');
const DOCS_ORIGIN = 'https://docs.wdk.tether.io';
const LLMS_MAX_CHARACTERS = 50_000;
const LLMS_SECTION_SEPARATOR = '\n\n***\n\n';
const LLMS_SECTION_TERMINATOR = '\n\n***\n';
const HTML_OR_NEXT_ERROR_PATTERN = /<!doctype html|<html\b|404: This page could not be found|self\.__next_f|BAILOUT_TO_CLIENT_SIDE_RENDERING/i;
const IGNORED_HTML_INDEX_PATHS = new Set(['404/index.html', '_not-found/index.html']);

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function collectMarkdownFiles(dir, baseDir = dir) {
  const results = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      results.push(...await collectMarkdownFiles(fullPath, baseDir));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.md')) {
      results.push(path.relative(baseDir, fullPath).split(path.sep).join('/'));
    }
  }

  return results.sort((a, b) => a.localeCompare(b));
}

async function collectIndexHtmlFiles(dir, baseDir = dir) {
  const results = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      results.push(...await collectIndexHtmlFiles(fullPath, baseDir));
      continue;
    }

    if (entry.isFile() && entry.name === 'index.html') {
      results.push(path.relative(baseDir, fullPath).split(path.sep).join('/'));
    }
  }

  return results.sort((a, b) => a.localeCompare(b));
}

function htmlPathForMarkdown(relativePath) {
  if (relativePath === 'index.md') return 'index.html';

  const withoutExtension = relativePath.slice(0, -'.md'.length);
  return `${withoutExtension}/index.html`;
}

function markdownPathForHtmlIndex(relativePath) {
  if (relativePath === 'index.html') return 'index.md';

  return `${relativePath.slice(0, -'/index.html'.length)}.md`;
}

function normalizeBody(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function countOccurrences(value, search) {
  if (search.length === 0) return 0;

  let count = 0;
  let offset = 0;
  while ((offset = value.indexOf(search, offset)) !== -1) {
    count += 1;
    offset += search.length;
  }

  return count;
}

function summarizePaths(paths, limit = 10) {
  const visible = paths.slice(0, limit).join(', ');
  const remaining = paths.length - limit;
  return remaining > 0 ? `${visible}, and ${remaining} more` : visible;
}

export async function validateLlmsTxt({
  llmsPath = DEFAULT_PUBLIC_LLMS_PATH,
  distDir,
} = {}) {
  const errors = [];
  let llms;

  try {
    llms = await fs.readFile(llmsPath, 'utf8');
  } catch {
    return [`Missing llms.txt artifact: ${llmsPath}`];
  }

  if (llms.length > LLMS_MAX_CHARACTERS) {
    errors.push(`llms.txt exceeds ${LLMS_MAX_CHARACTERS} characters; found ${llms.length}`);
  }
  const byteLength = Buffer.byteLength(llms, 'utf8');
  if (byteLength > LLMS_MAX_CHARACTERS) {
    errors.push(`llms.txt exceeds ${LLMS_MAX_CHARACTERS} UTF-8 bytes; found ${byteLength}`);
  }

  const lines = llms.split(/\r?\n/);
  const h1Lines = lines.filter((line) => line.startsWith('# '));
  if (lines[0] !== '# WDK Documentation' || h1Lines.length !== 1) {
    errors.push('llms.txt must start with exactly one `# WDK Documentation` heading');
  }

  const summaryIndex = lines.findIndex((line) => /^> \S/.test(line));
  const documentationHeadings = lines.filter((line) => line === '## Documentation');
  const documentationIndex = lines.indexOf('## Documentation');
  if (summaryIndex < 1 || documentationHeadings.length !== 1 || summaryIndex > documentationIndex) {
    errors.push('llms.txt must include a blockquote summary before the `## Documentation` section');
  }

  const linkPattern = /^- \[([^\[\]]+)]\((https:\/\/docs\.wdk\.tether\.io\/[^)\s]+\.md)\)$/;
  const linkLines = documentationIndex < 0
    ? []
    : lines.slice(documentationIndex + 1).filter((line) => line.trim().length > 0);
  const linkedPaths = [];

  for (const line of linkLines) {
    const match = line.match(linkPattern);
    if (!match) {
      errors.push(`Invalid llms.txt documentation entry: ${line}`);
      continue;
    }

    const [, label, href] = match;
    if (label.trim().length === 0) {
      errors.push(`llms.txt entry has an empty label: ${line}`);
    }

    const url = new URL(href);
    if (url.origin !== DOCS_ORIGIN || url.search || url.hash) {
      errors.push(`llms.txt entry must use a canonical ${DOCS_ORIGIN} URL without a query or fragment: ${href}`);
      continue;
    }

    linkedPaths.push(url.pathname);
  }

  if (linkLines.length === 0) {
    errors.push('llms.txt must include at least one documentation link');
  }

  const uniquePaths = new Set(linkedPaths);
  if (uniquePaths.size !== linkedPaths.length) {
    errors.push('llms.txt documentation URLs must be unique');
  }

  if (distDir) {
    let markdownFiles;
    let htmlIndexFiles;
    try {
      [markdownFiles, htmlIndexFiles] = await Promise.all([
        collectMarkdownFiles(distDir),
        collectIndexHtmlFiles(distDir),
      ]);
    } catch {
      errors.push(`Missing generated documentation directory: ${distDir}`);
      return errors;
    }

    const expectedRelativePaths = htmlIndexFiles
      .filter((relativePath) => !IGNORED_HTML_INDEX_PATHS.has(relativePath))
      .map(markdownPathForHtmlIndex);
    const expectedPaths = expectedRelativePaths.map((relativePath) => `/${relativePath}`);
    const expectedSet = new Set(expectedPaths);
    const missingPaths = expectedPaths.filter((route) => !uniquePaths.has(route));
    const unexpectedPaths = [...uniquePaths].filter((route) => !expectedSet.has(route));
    const markdownFileSet = new Set(markdownFiles);
    const missingMarkdownFiles = expectedRelativePaths.filter((relativePath) => !markdownFileSet.has(relativePath));
    const orphanMarkdownFiles = markdownFiles.filter((relativePath) => !expectedSet.has(`/${relativePath}`));

    if (missingPaths.length > 0) {
      errors.push(`llms.txt is missing ${missingPaths.length} exported documentation route(s): ${summarizePaths(missingPaths)}`);
    }
    if (unexpectedPaths.length > 0) {
      errors.push(`llms.txt contains ${unexpectedPaths.length} unknown Markdown route(s): ${summarizePaths(unexpectedPaths)}`);
    }
    if (missingMarkdownFiles.length > 0) {
      errors.push(`Exported HTML is missing ${missingMarkdownFiles.length} generated Markdown file(s): ${summarizePaths(missingMarkdownFiles)}`);
    }
    if (orphanMarkdownFiles.length > 0) {
      errors.push(`Generated Markdown has ${orphanMarkdownFiles.length} route(s) without exported HTML: ${summarizePaths(orphanMarkdownFiles)}`);
    }
  }

  return errors;
}

export async function validateDocsHtmlSourceOrder({ distDir = DEFAULT_DIST_DIR } = {}) {
  const errors = [];

  if (!await exists(distDir)) {
    return [`Missing dist directory: ${distDir}`];
  }

  const htmlIndexFiles = (await collectIndexHtmlFiles(distDir))
    .filter((relativePath) => !IGNORED_HTML_INDEX_PATHS.has(relativePath));
  if (htmlIndexFiles.length === 0) {
    return ['No exported documentation HTML pages found'];
  }

  for (const relativeHtmlPath of htmlIndexFiles) {
    const htmlPath = path.join(distDir, relativeHtmlPath);
    const html = await fs.readFile(htmlPath, 'utf8');
    const articleCount = countOccurrences(html, 'id="nd-page"');
    const sidebarCount = countOccurrences(html, 'id="nd-sidebar"');
    const sidebarPlaceholderCount = countOccurrences(html, 'data-sidebar-placeholder');

    if (articleCount !== 1) {
      errors.push(`${relativeHtmlPath} must contain exactly one docs article; found ${articleCount}`);
    }
    if (sidebarCount !== 1 || sidebarPlaceholderCount !== 1) {
      errors.push(`${relativeHtmlPath} must contain exactly one docs sidebar; found ${sidebarCount} sidebar(s) and ${sidebarPlaceholderCount} placeholder(s)`);
    }

    const articleIndex = html.indexOf('id="nd-page"');
    const sidebarIndex = html.indexOf('id="nd-sidebar"');
    const sidebarPlaceholderIndex = html.indexOf('data-sidebar-placeholder');
    if (
      articleIndex >= 0
      && (
        (sidebarIndex >= 0 && articleIndex > sidebarIndex)
        || (sidebarPlaceholderIndex >= 0 && articleIndex > sidebarPlaceholderIndex)
      )
    ) {
      errors.push(`${relativeHtmlPath} serializes repeated navigation before the docs article`);
    }
  }

  return errors;
}

function internalDocRoutes(markdown) {
  const routes = new Set();
  const linkPattern = /\]\((\/[^)\s]+)\)/g;

  for (const match of markdown.matchAll(linkPattern)) {
    routes.add(match[1].split(/[?#]/, 1)[0]);
  }

  return [...routes].sort((a, b) => a.localeCompare(b));
}

async function docRouteExists(docsRoot, route) {
  const relative = route.replace(/^\/+|\/+$/g, '');
  const candidates = relative.length === 0
    ? ['index.mdx']
    : [`${relative}.mdx`, `${relative}/index.mdx`];

  for (const candidate of candidates) {
    if (await exists(path.join(docsRoot, candidate))) return true;
  }

  return false;
}

export async function validateAllModulesFeed({
  sourcePath = DEFAULT_CATALOG_SOURCE_PATH,
  publicPath = DEFAULT_PUBLIC_LLMS_FULL_PATH,
  distPath = path.join(DEFAULT_DIST_DIR, 'llms-full.txt'),
  docsRoot = DEFAULT_DOCS_ROOT,
} = {}) {
  const errors = [];
  let source;

  try {
    source = (await fs.readFile(sourcePath, 'utf8')).trim();
  } catch {
    return [`Missing All Modules catalog source: ${sourcePath}`];
  }

  if (!source.startsWith('## All Modules\n')) {
    errors.push('All Modules catalog source must start with the exact `## All Modules` heading');
  }
  if (!source.includes('\nURL: https://wdk.tether.io/developers/blocks\n')) {
    errors.push('All Modules catalog source must identify the canonical Building Blocks URL');
  }
  if (source.includes(LLMS_SECTION_TERMINATOR)) {
    errors.push('All Modules catalog source must not contain an llms-full section separator');
  }
  const communitySection = source.slice(source.indexOf('\n## Community Modules\n'));
  if (
    communitySection.length === 0
    || !communitySection.includes('| Module | Category | Description | Documentation |')
    || !/^\| \[`/m.test(communitySection)
  ) {
    errors.push('All Modules catalog source must include the community-module table');
  }

  for (const route of internalDocRoutes(source)) {
    if (!await docRouteExists(docsRoot, route)) {
      errors.push(`All Modules catalog source links to missing documentation route: ${route}`);
    }
  }

  for (const [label, artifactPath] of [['public', publicPath], ['built', distPath]]) {
    let artifact;
    try {
      artifact = await fs.readFile(artifactPath, 'utf8');
    } catch {
      errors.push(`Missing ${label} llms-full artifact: ${artifactPath}`);
      continue;
    }

    const headingCount = countOccurrences(artifact, '\n## All Modules\n')
      + (artifact.startsWith('## All Modules\n') ? 1 : 0);
    if (headingCount !== 1) {
      errors.push(`${label} llms-full artifact must contain exactly one \`## All Modules\` heading; found ${headingCount}`);
    }
    const communityHeadingCount = countOccurrences(artifact, '\n## Community Modules\n')
      + (artifact.startsWith('## Community Modules\n') ? 1 : 0);
    if (communityHeadingCount !== 1) {
      errors.push(`${label} llms-full artifact must contain exactly one \`## Community Modules\` heading; found ${communityHeadingCount}`);
    }
    if (/^URL: https:\/\/docs\.wdk\.tether\.io\/sdk\/community-modules\/?$/m.test(artifact)) {
      errors.push(`${label} llms-full artifact still contains the retired Community Modules page`);
    }
    if (countOccurrences(artifact, source) !== 1) {
      errors.push(`${label} llms-full artifact must contain the catalog source exactly once`);
    }
    const terminatedFeedCount = countOccurrences(artifact, `${source}${LLMS_SECTION_SEPARATOR}`)
      + (artifact.endsWith(`${source}${LLMS_SECTION_TERMINATOR}`) ? 1 : 0);
    if (terminatedFeedCount !== 1) {
      errors.push(`${label} llms-full artifact must terminate the All Modules feed with a section separator`);
    }
  }

  return errors;
}

export async function validateFileSystemOutput({
  distDir = DEFAULT_DIST_DIR,
  requiredPaths = DEFAULT_REQUIRED_PATHS,
} = {}) {
  const errors = [];

  if (!await exists(distDir)) {
    return [`Missing dist directory: ${distDir}`];
  }

  const manifestPath = path.join(distDir, 'llm-md-manifest.json');
  if (await exists(manifestPath)) {
    errors.push('Temporary manifest was not removed: llm-md-manifest.json');
  }

  for (const requiredPath of requiredPaths) {
    if (!await exists(path.join(distDir, requiredPath))) {
      errors.push(`Missing required Markdown file: ${requiredPath}`);
    }
  }

  const markdownFiles = await collectMarkdownFiles(distDir);
  const markdownFileSet = new Set(markdownFiles);
  const htmlIndexFiles = await collectIndexHtmlFiles(distDir);

  for (const relativePath of htmlIndexFiles) {
    if (IGNORED_HTML_INDEX_PATHS.has(relativePath)) continue;

    const expectedMarkdownPath = markdownPathForHtmlIndex(relativePath);
    if (!markdownFileSet.has(expectedMarkdownPath)) {
      errors.push(`Missing Markdown file for exported HTML page: ${expectedMarkdownPath}`);
    }
  }

  for (const relativePath of markdownFiles) {
    const markdownPath = path.join(distDir, relativePath);
    const content = await fs.readFile(markdownPath, 'utf8');

    if (HTML_OR_NEXT_ERROR_PATTERN.test(content)) {
      errors.push(`${relativePath} contains HTML/Next.js error content`);
    }

    if (!content.trimStart().startsWith('# ')) {
      errors.push(`${relativePath} does not look like an LLM Markdown page`);
    }

    const matchingHtmlPath = path.join(distDir, htmlPathForMarkdown(relativePath));
    if (await exists(matchingHtmlPath)) {
      const html = await fs.readFile(matchingHtmlPath, 'utf8');
      if (normalizeBody(html) === normalizeBody(content)) {
        errors.push(`${relativePath} duplicates HTML output at ${htmlPathForMarkdown(relativePath)}`);
      }
    } else {
      errors.push(`Generated Markdown file has no exported HTML page: ${relativePath}`);
    }
  }

  return errors;
}

async function fetchText(url) {
  const response = await fetch(url, { redirect: 'follow' });
  const text = await response.text();

  return { response, text };
}

export async function validateHttpOutput({
  baseUrl,
  markdownPath = '/sdk/get-started.md',
  htmlPath = '/sdk/get-started/',
  missingPath = '/does-not-exist.md',
} = {}) {
  if (!baseUrl) return [];

  const errors = [];
  const origin = baseUrl.replace(/\/+$/, '');
  const markdown = await fetchText(`${origin}${markdownPath}`);
  const html = await fetchText(`${origin}${htmlPath}`);
  const missing = await fetchText(`${origin}${missingPath}`);

  if (!markdown.response.ok) {
    errors.push(`${markdownPath} returned HTTP ${markdown.response.status}`);
  }

  if (HTML_OR_NEXT_ERROR_PATTERN.test(markdown.text)) {
    errors.push(`${markdownPath} returned HTML/Next.js error content`);
  }

  if (!markdown.text.trimStart().startsWith('# Get Started')) {
    errors.push(`${markdownPath} does not start with the Get Started Markdown heading`);
  }

  if (!html.response.ok) {
    errors.push(`${htmlPath} returned HTTP ${html.response.status}`);
  }

  if (normalizeBody(html.text) === normalizeBody(markdown.text)) {
    errors.push(`${markdownPath} duplicates ${htmlPath} response body`);
  }

  if (missing.response.ok) {
    errors.push(`${missingPath} unexpectedly returned HTTP ${missing.response.status}`);
  }

  return errors;
}

function parseArgs(argv) {
  const options = {
    distDir: DEFAULT_DIST_DIR,
    requiredPaths: [...DEFAULT_REQUIRED_PATHS],
    baseUrl: undefined,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--dist') {
      options.distDir = path.resolve(argv[++index]);
      continue;
    }

    if (arg === '--base-url') {
      options.baseUrl = argv[++index];
      continue;
    }

    if (arg === '--required') {
      options.requiredPaths.push(argv[++index]);
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const errors = [
    ...await validateLlmsTxt({
      llmsPath: path.join(options.distDir, 'llms.txt'),
      distDir: options.distDir,
    }),
    ...await validateFileSystemOutput(options),
    ...await validateDocsHtmlSourceOrder(options),
    ...await validateAllModulesFeed({ distPath: path.join(options.distDir, 'llms-full.txt') }),
    ...await validateHttpOutput(options),
  ];

  if (errors.length > 0) {
    console.error(`LLM Markdown output check failed with ${errors.length} issue(s):`);
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
    return;
  }

  console.log('LLM Markdown output check passed.');
}

const invokedDirectly = process.argv[1]
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) console.error(error.stack);
    process.exitCode = 1;
  });
}
