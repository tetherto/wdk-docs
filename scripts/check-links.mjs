#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const docsRoot = path.join(repoRoot, 'content', 'docs');
const publicRoot = path.join(repoRoot, 'public');
const linkcheckIgnorePath = path.join(repoRoot, '.linkcheckignore');

const outputFormat = normalizeOutputFormat(process.env.LINK_CHECK_FORMAT ?? 'text');
const externalEnabled = parseBooleanEnv('LINK_CHECK_EXTERNAL', true);
const externalConcurrency = parsePositiveIntEnv('LINK_CHECK_CONCURRENCY', 5);
const externalTimeoutMs = parsePositiveIntEnv('LINK_CHECK_TIMEOUT', 15_000);
const externalProgressEvery = parsePositiveIntEnv('LINK_CHECK_PROGRESS_EVERY', 10);
const warnOnBareInternalLinks = parseBooleanEnv('LINK_CHECK_WARN_BARE', true);
const externalSkipMatchers = [
  ...loadSkipMatchersFromFile(linkcheckIgnorePath),
  ...parseSkipMatchers(process.env.LINK_CHECK_SKIP ?? ''),
];

const fencePatterns = [/```[\s\S]*?```/g, /~~~[\s\S]*?~~~/g];
const commentPatterns = [/{\/\*[\s\S]*?\*\/}/g, /<!--[\s\S]*?-->/g];
const inlineCodePattern = /`[^`\n]*`/g;
const indentedCodePattern = /^(?: {4}|\t).+$/gm;

const markdownReferencePattern = /^\s*\[[^\]]+]:\s*(\S+)/gm;
const markdownAutolinkPattern = /<((?:https?:\/\/|mailto:|tel:)[^>\s]+)>/g;
const jsxAttributePattern =
  /\b(href|src|url)\s*=\s*(?:"([^"]+)"|'([^']+)'|\{\s*"([^"]+)"\s*\}|\{\s*'([^']+)'\s*\})/g;
const htmlIdPattern = /\bid\s*=\s*(?:"([^"]+)"|'([^']+)')/g;

const assetExtensions = new Set([
  '.avif',
  '.bmp',
  '.csv',
  '.gif',
  '.ico',
  '.jpeg',
  '.jpg',
  '.json',
  '.mp3',
  '.mp4',
  '.pdf',
  '.png',
  '.svg',
  '.txt',
  '.wav',
  '.webm',
  '.webp',
  '.woff',
  '.woff2',
  '.xml',
  '.yaml',
  '.yml',
  '.zip',
]);

function parseBooleanEnv(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined) return fallback;
  const value = raw.trim().toLowerCase();
  if (['0', 'false', 'no', 'off'].includes(value)) return false;
  if (['1', 'true', 'yes', 'on'].includes(value)) return true;
  return fallback;
}

function parsePositiveIntEnv(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined) return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
}

function normalizeOutputFormat(raw) {
  const normalized = raw.trim().toLowerCase();
  return normalized === 'json' ? 'json' : 'text';
}

function parseSkipEntries(chunks) {
  const cleaned = chunks.map((chunk) => chunk.trim()).filter(Boolean);

  return cleaned.map((chunk) => {
    if (chunk.startsWith('/') && chunk.endsWith('/') && chunk.length > 2) {
      try {
        return { type: 'regex', value: new RegExp(chunk.slice(1, -1), 'i') };
      } catch {
        return { type: 'substring', value: chunk.toLowerCase() };
      }
    }
    return { type: 'substring', value: chunk.toLowerCase() };
  });
}

function parseSkipMatchers(raw) {
  return parseSkipEntries(raw.split(','));
}

function loadSkipMatchersFromFile(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, 'utf8');
  const chunks = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));

  return parseSkipEntries(chunks);
}

function shouldSkipUrl(url) {
  for (const matcher of externalSkipMatchers) {
    if (matcher.type === 'regex' && matcher.value.test(url)) return true;
    if (matcher.type === 'substring' && url.toLowerCase().includes(matcher.value)) return true;
  }
  return false;
}

function toPosix(filePath) {
  return filePath.split(path.sep).join(path.posix.sep);
}

async function listMdxFiles(rootDir) {
  const results = [];
  const stack = [rootDir];

  while (stack.length > 0) {
    const current = stack.pop();
    const entries = await fs.promises.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(full);
        continue;
      }
      if (entry.isFile() && entry.name.endsWith('.mdx')) {
        results.push(full);
      }
    }
  }

  return results.sort((a, b) => a.localeCompare(b));
}

function stripMarkdownExtension(segment) {
  return segment.replace(/\.mdx?$/i, '');
}

function normalizeRoute(route) {
  let normalized = route.replace(/\\/g, '/').trim();
  if (normalized === '') return '/';
  if (!normalized.startsWith('/')) normalized = `/${normalized}`;
  normalized = path.posix.normalize(normalized);

  if (!normalized.startsWith('/')) normalized = `/${normalized}`;
  if (normalized.length > 1) normalized = normalized.replace(/\/+$/, '');

  if (normalized.length > 1 && normalized.endsWith('/index')) {
    normalized = normalized.slice(0, -'/index'.length);
    if (normalized === '') normalized = '/';
  }

  return normalized || '/';
}

function fileToRoute(relativeMdxPath) {
  const noExt = stripMarkdownExtension(toPosix(relativeMdxPath));
  if (noExt === 'index') return '/';
  if (noExt.endsWith('/index')) return normalizeRoute(`/${noExt.slice(0, -'/index'.length)}`);
  return normalizeRoute(`/${noExt}`);
}

function fileToBaseRoute(relativeMdxPath, route) {
  const noExt = stripMarkdownExtension(toPosix(relativeMdxPath));
  if (noExt === 'index' || noExt.endsWith('/index')) return route;
  return normalizeRoute(path.posix.dirname(route));
}

function createLineResolver(content) {
  const lineStarts = [0];
  for (let index = 0; index < content.length; index += 1) {
    if (content[index] === '\n') lineStarts.push(index + 1);
  }

  return (index) => {
    let low = 0;
    let high = lineStarts.length - 1;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (lineStarts[mid] <= index) low = mid + 1;
      else high = mid - 1;
    }
    return high + 1;
  };
}

function maskWithPatterns(content, patterns) {
  let masked = content;
  for (const pattern of patterns) {
    pattern.lastIndex = 0;
    masked = masked.replace(pattern, (segment) => segment.replace(/[^\n]/g, ' '));
  }
  return masked;
}

function decodeURIComponentSafe(value) {
  if (!value) return value;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function parseFrontmatter(content) {
  const match = content.match(/^\uFEFF?---[ \t]*\r?\n[\s\S]*?\r?\n---[ \t]*(?:\r?\n|$)/);
  if (!match) {
    return {
      frontmatterRaw: '',
      body: content,
    };
  }

  return {
    frontmatterRaw: match[0],
    body: content.slice(match[0].length),
  };
}

function maskFrontmatter(content) {
  const { frontmatterRaw } = parseFrontmatter(content);
  if (!frontmatterRaw) return content;

  return `${frontmatterRaw.replace(/[^\n]/g, ' ')}${content.slice(frontmatterRaw.length)}`;
}

function parseFrontmatterTitle(frontmatterRaw) {
  if (!frontmatterRaw) return '';

  const lines = frontmatterRaw.split(/\r?\n/);
  for (let index = 1; index < lines.length; index += 1) {
    const line = lines[index];
    const match = line.match(/^\s*title\s*:\s*(.+?)\s*$/);
    if (!match) continue;

    let title = match[1].trim();
    if (
      (title.startsWith('"') && title.endsWith('"')) ||
      (title.startsWith("'") && title.endsWith("'"))
    ) {
      title = title.slice(1, -1);
    }
    return title.trim();
  }

  return '';
}

function readBalancedParens(content, startIndex) {
  let depth = 1;
  let index = startIndex;

  while (index < content.length) {
    const char = content[index];
    if (char === '\\') {
      index += 2;
      continue;
    }
    if (char === '(') depth += 1;
    else if (char === ')') {
      depth -= 1;
      if (depth === 0) {
        return {
          value: content.slice(startIndex, index),
          end: index,
        };
      }
    }
    index += 1;
  }

  return null;
}

function parseMarkdownDestination(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return '';

  if (trimmed.startsWith('<')) {
    const end = trimmed.indexOf('>');
    if (end !== -1) return trimmed.slice(1, end).trim();
  }

  let index = 0;
  while (index < trimmed.length) {
    const char = trimmed[index];
    if (/\s/.test(char)) break;
    if (char === '\\' && index + 1 < trimmed.length) {
      index += 2;
      continue;
    }
    index += 1;
  }

  return trimmed.slice(0, index).replace(/\\([()])/g, '$1').trim();
}

function extractMarkdownInlineLinks(content, lineFromIndex) {
  const links = [];
  const openerPattern = /!?\[[^\]\n]*]\(/g;

  for (let match = openerPattern.exec(content); match; match = openerPattern.exec(content)) {
    const openIndex = match.index;
    const destinationStart = openIndex + match[0].length;
    const parsed = readBalancedParens(content, destinationStart);
    if (!parsed) continue;

    openerPattern.lastIndex = parsed.end + 1;
    const target = parseMarkdownDestination(parsed.value);
    if (!target) continue;

    links.push({
      target,
      line: lineFromIndex(openIndex),
      sourceType: 'markdown',
    });
  }

  return links;
}

function extractMarkdownReferenceLinks(content, lineFromIndex) {
  const links = [];
  markdownReferencePattern.lastIndex = 0;
  for (
    let match = markdownReferencePattern.exec(content);
    match;
    match = markdownReferencePattern.exec(content)
  ) {
    const target = parseMarkdownDestination(match[1]);
    if (!target) continue;
    links.push({
      target,
      line: lineFromIndex(match.index),
      sourceType: 'markdown-reference',
    });
  }
  return links;
}

function extractMarkdownAutolinks(content, lineFromIndex) {
  const links = [];
  markdownAutolinkPattern.lastIndex = 0;
  for (
    let match = markdownAutolinkPattern.exec(content);
    match;
    match = markdownAutolinkPattern.exec(content)
  ) {
    links.push({
      target: match[1].trim(),
      line: lineFromIndex(match.index),
      sourceType: 'markdown-autolink',
    });
  }
  return links;
}

function extractJsxAttributeLinks(content, lineFromIndex) {
  const links = [];
  jsxAttributePattern.lastIndex = 0;
  for (
    let match = jsxAttributePattern.exec(content);
    match;
    match = jsxAttributePattern.exec(content)
  ) {
    const target = match[2] ?? match[3] ?? match[4] ?? match[5] ?? '';
    if (!target.trim()) continue;
    links.push({
      target: target.trim(),
      line: lineFromIndex(match.index),
      sourceType: `jsx-${match[1]}`,
    });
  }
  return links;
}

function extractAllLinks(content) {
  const lineFromIndex = createLineResolver(content);
  const frontmatterMasked = maskFrontmatter(content);
  const maskedForLinks = maskWithPatterns(frontmatterMasked, [
    ...fencePatterns,
    ...commentPatterns,
    indentedCodePattern,
    inlineCodePattern,
  ]);

  return [
    ...extractMarkdownInlineLinks(maskedForLinks, lineFromIndex),
    ...extractMarkdownReferenceLinks(maskedForLinks, lineFromIndex),
    ...extractMarkdownAutolinks(maskedForLinks, lineFromIndex),
    ...extractJsxAttributeLinks(maskedForLinks, lineFromIndex),
  ];
}

function stripHtmlTags(str) {
  let prev;
  do {
    prev = str;
    str = str.replace(/<[^>]*>/g, '');
  } while (str !== prev);
  return str;
}

function stripHeadingFormatting(rawHeading) {
  return stripHtmlTags(rawHeading
    .replace(/\s+#+\s*$/, '')
    .replace(/\s*\{#([A-Za-z0-9:_-]+)\}\s*$/, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1'))
    .replace(/[*_~]/g, '')
    .replace(/&[a-zA-Z0-9#]+;/g, '')
    .trim();
}

function slugifyHeading(rawHeading) {
  const normalized = stripHeadingFormatting(rawHeading)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(
      /[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g,
      '',
    )
    .replace(/\s/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalized;
}

function extractHeadings(content) {
  const { frontmatterRaw, body } = parseFrontmatter(content);
  const frontmatterTitle = parseFrontmatterTitle(frontmatterRaw);
  const masked = maskWithPatterns(body, [...fencePatterns, ...commentPatterns, indentedCodePattern]);
  const anchors = new Set();
  const slugCount = new Map();

  if (frontmatterTitle) {
    const titleSlug = slugifyHeading(frontmatterTitle);
    if (titleSlug) {
      anchors.add(titleSlug);
      slugCount.set(titleSlug, 1);
    }
  }

  const lines = masked.split('\n');
  for (const line of lines) {
    const headingMatch = line.match(/^\s{0,3}#{1,6}\s+(.+?)\s*$/);
    if (!headingMatch) continue;

    const rawHeading = headingMatch[1].trim();
    if (!rawHeading) continue;

    const explicitIdMatch = rawHeading.match(/\{#([A-Za-z0-9:_-]+)\}\s*$/);
    if (explicitIdMatch?.[1]) anchors.add(explicitIdMatch[1]);

    const slugBase = slugifyHeading(rawHeading);
    if (!slugBase) continue;

    const current = slugCount.get(slugBase) ?? 0;
    const slug = current === 0 ? slugBase : `${slugBase}-${current}`;
    slugCount.set(slugBase, current + 1);
    anchors.add(slug);
  }

  htmlIdPattern.lastIndex = 0;
  for (let match = htmlIdPattern.exec(masked); match; match = htmlIdPattern.exec(masked)) {
    const id = (match[1] ?? match[2] ?? '').trim();
    if (id) anchors.add(id);
  }

  return anchors;
}

function splitTarget(rawTarget) {
  const trimmed = rawTarget.trim().replace(/^<|>$/g, '');
  const hashIndex = trimmed.indexOf('#');
  const queryIndex = trimmed.indexOf('?');

  const pathEnd =
    hashIndex === -1
      ? queryIndex === -1
        ? trimmed.length
        : queryIndex
      : queryIndex === -1
        ? hashIndex
        : Math.min(hashIndex, queryIndex);

  const pathname = trimmed.slice(0, pathEnd);
  const query =
    queryIndex === -1 ? '' : trimmed.slice(queryIndex + 1, hashIndex === -1 ? undefined : hashIndex);
  const fragment = hashIndex === -1 ? '' : trimmed.slice(hashIndex + 1);

  return { normalized: trimmed, pathname, query, fragment };
}

function isSkippableScheme(target) {
  return /^(mailto:|tel:|javascript:|data:)/i.test(target);
}

function extractScheme(target) {
  const match = target.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):/);
  return match ? match[1].toLowerCase() : '';
}

function isExternalHttpTarget(target) {
  return /^https?:\/\//i.test(target) || /^\/\/[^/]/.test(target);
}

function normalizeExternalUrl(target) {
  return target.startsWith('//') ? `https:${target}` : target;
}

function hasAssetExtension(pathname) {
  const ext = path.posix.extname(pathname).toLowerCase();
  return assetExtensions.has(ext);
}

function hasStaleDocsPrefix(pathname) {
  return pathname === '/docs' || pathname.startsWith('/docs/');
}

function isBareInternalPath(pathname) {
  if (!pathname) return false;
  if (pathname.startsWith('/')) return false;
  if (pathname.startsWith('./') || pathname.startsWith('../')) return false;
  if (hasAssetExtension(pathname)) return false;
  if (pathname.includes(':')) return false;
  return true;
}

function resolveDocsRoute(pathname, sourceBaseRoute) {
  const normalizedPath = stripMarkdownExtension(pathname);
  if (!normalizedPath) return sourceBaseRoute;
  if (normalizedPath.startsWith('/')) return normalizeRoute(normalizedPath);
  return normalizeRoute(path.posix.join(sourceBaseRoute, normalizedPath));
}

function resolveRelativeAssetPath(pathname, sourceAbsoluteFilePath) {
  if (pathname.startsWith('/')) return path.join(publicRoot, pathname.replace(/^\//, ''));
  return path.resolve(path.dirname(sourceAbsoluteFilePath), pathname);
}

function summarizeAnchors(anchorSet, limit = 8) {
  const anchors = [...anchorSet].sort((a, b) => a.localeCompare(b));
  if (anchors.length <= limit) return anchors;
  return [...anchors.slice(0, limit), `... (+${anchors.length - limit} more)`];
}

const urlShortenerDomains = new Set([
  'bit.ly', 'goo.gl', 't.co', 'tinyurl.com', 'wkf.ms',
  'forms.gle', 'is.gd', 'buff.ly', 'ow.ly', 'rb.gy',
]);

const requestHeaders = {
  'user-agent': 'Mozilla/5.0 (compatible; WDK-Docs-LinkChecker/1.0; +https://docs.wdk.tether.io)',
  'accept': 'text/html,application/xhtml+xml,*/*;q=0.8',
  'accept-language': 'en-US,en;q=0.5',
  'accept-encoding': 'identity',
};

function isUrlShortener(url) {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return urlShortenerDomains.has(hostname);
  } catch {
    return false;
  }
}

function createFinding({ severity, file, line, link, type, message, status, details }) {
  return { severity, file, line, link, type, message, status, details };
}

async function requestUrl(url, { method, timeoutMs, followRedirects = false }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method,
      redirect: followRedirects ? 'follow' : 'manual',
      signal: controller.signal,
      headers: requestHeaders,
    });

    const location = response.headers.get('location') || '';

    return {
      kind: 'response',
      method,
      status: response.status,
      statusText: response.statusText || '',
      location,
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        kind: 'timeout',
        method,
        error: `Timeout after ${timeoutMs}ms`,
      };
    }
    return {
      kind: 'network',
      method,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    clearTimeout(timer);
  }
}

function resolveRedirectLocation(base, location) {
  if (!location) return '';
  try {
    return new URL(location, base).href;
  } catch {
    return location;
  }
}

async function followRedirectChain(url, { method, timeoutMs, maxHops = 5 }) {
  const chain = [];
  let current = url;

  for (let hop = 0; hop < maxHops; hop += 1) {
    const result = await requestUrl(current, { method, timeoutMs, followRedirects: false });

    if (result.kind !== 'response') {
      return { finalResult: result, chain, finalUrl: current };
    }

    const status = result.status;
    if (status >= 300 && status < 400 && result.location) {
      const nextUrl = resolveRedirectLocation(current, result.location);
      chain.push({ from: current, to: nextUrl, status });
      current = nextUrl;
      continue;
    }

    return { finalResult: result, chain, finalUrl: current };
  }

  const lastResult = await requestUrl(current, { method, timeoutMs, followRedirects: true });
  return { finalResult: lastResult, chain, finalUrl: current };
}

function classifyExternalResult(result) {
  if (result.kind === 'timeout' || result.kind === 'network') {
    return {
      severity: 'warn',
      status: '',
      message: `${result.error} (${result.method}) - URL may work in a browser`,
    };
  }

  const status = result.status;
  const statusText = result.statusText || '';
  const statusLabel = statusText ? `HTTP ${status} ${statusText}` : `HTTP ${status}`;

  if (status >= 200 && status < 300) {
    return { severity: 'ok', status: statusLabel, message: '' };
  }

  if (status >= 300 && status < 400) {
    return { severity: 'ok', status: statusLabel, message: '' };
  }

  if (status === 403 || status === 429) {
    return {
      severity: 'warn',
      status: statusLabel,
      message: status === 403 ? 'HTTP 403 Forbidden (may be login-gated or rate-limited)' : 'HTTP 429 Too Many Requests',
    };
  }

  if (status === 404 || status === 410) {
    return { severity: 'error', status: statusLabel, message: statusLabel };
  }

  if (status >= 500) {
    return { severity: 'error', status: statusLabel, message: statusLabel };
  }

  return { severity: 'warn', status: statusLabel, message: `${statusLabel} (unexpected status)` };
}

async function checkExternalUrl(url) {
  if (shouldSkipUrl(url)) {
    return {
      severity: 'skip',
      status: '',
      message: 'Skipped by LINK_CHECK_SKIP',
      redirectChain: [],
    };
  }

  const maxAttempts = 2;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    let { finalResult, chain, finalUrl } = await followRedirectChain(url, {
      method: 'HEAD',
      timeoutMs: externalTimeoutMs,
    });

    if (finalResult.kind === 'response' && (finalResult.status === 405 || finalResult.status === 501)) {
      ({ finalResult, chain, finalUrl } = await followRedirectChain(url, {
        method: 'GET',
        timeoutMs: externalTimeoutMs,
      }));
    }

    if (finalResult.kind !== 'response') {
      const getChain = await followRedirectChain(url, {
        method: 'GET',
        timeoutMs: externalTimeoutMs,
      });
      if (getChain.finalResult.kind === 'response') {
        finalResult = getChain.finalResult;
        chain = getChain.chain;
        finalUrl = getChain.finalUrl;
      }
    }

    const classified = classifyExternalResult(finalResult);

    if (classified.severity === 'ok' || classified.severity === 'warn') {
      let redirectInfo = '';
      if (chain.length > 0 && !isUrlShortener(url)) {
        redirectInfo = finalUrl;
      }
      return { ...classified, redirectChain: chain, redirectTarget: redirectInfo };
    }

    const isRetryable =
      finalResult.kind !== 'response' || finalResult.status >= 500;

    if (!isRetryable || attempt >= maxAttempts) {
      return { ...classified, redirectChain: chain, redirectTarget: '' };
    }
  }

  return { severity: 'warn', status: '', message: 'Exhausted retries', redirectChain: [], redirectTarget: '' };
}

async function runConcurrent(items, concurrency, worker, onItemDone) {
  const outputs = new Map();
  const queue = [...items];
  const maxWorkers = Math.max(1, Math.min(concurrency, queue.length || 1));

  const workers = Array.from({ length: maxWorkers }, async () => {
    while (queue.length > 0) {
      const item = queue.shift();
      if (item === undefined) continue;
      const value = await worker(item);
      outputs.set(item, value);
      if (onItemDone) onItemDone(item, value);
    }
  });

  await Promise.all(workers);
  return outputs;
}

function printFindingBlock(title, findings, labelOverride) {
  if (findings.length === 0) return;
  console.log(`${title} (${findings.length})\n`);
  for (const finding of findings) {
    console.log(`  ${finding.file}:${finding.line}`);
    console.log(`    Link:   ${finding.link}`);
    console.log(`    Type:   ${finding.type}`);
    if (finding.status) console.log(`    Status: ${finding.status}`);
    const label = labelOverride || (finding.severity === 'error' ? 'Error' : finding.severity === 'info' ? 'Info' : 'Warn');
    console.log(`    ${label}:  ${finding.message}`);
    if (finding.details) console.log(`    Found:  ${finding.details}`);
    console.log('');
  }
}

function printReport({ stats, errors, warnings, infos }) {
  console.log('==============================================================================');
  console.log('LINK CHECK REPORT');
  console.log('==============================================================================');
  console.log('');

  if (errors.length === 0 && warnings.length === 0 && infos.length === 0) {
    console.log('No broken links found.\n');
  } else {
    printFindingBlock('BROKEN LINKS', errors);
    printFindingBlock('WARNINGS', warnings);
    printFindingBlock('REDIRECTS', infos, 'Info');
  }

  console.log('------------------------------------------------------------------------------');
  console.log(
    `Summary: ${stats.files} files | ${stats.totalLinks} links | ${errors.length} errors | ${warnings.length} warnings | ${infos.length} redirects`,
  );
  console.log(
    `         Internal: ${stats.internal.checked} checked, ${stats.internal.broken} broken`,
  );
  console.log(
    `         Anchors:  ${stats.anchors.checked} checked, ${stats.anchors.broken} broken`,
  );

  if (externalEnabled) {
    console.log(
      `         External: ${stats.external.checked} checked, ${stats.external.broken} broken, ${stats.external.warnings} warnings (cached: ${stats.external.unique} unique URLs, cache hits: ${stats.external.cacheHits}, skipped: ${stats.external.skipped})`,
    );
  } else {
    console.log(
      `         External: ${stats.external.discovered} discovered, checking disabled via LINK_CHECK_EXTERNAL=false`,
    );
  }

  console.log(
    `         Assets:   ${stats.assets.checked} checked, ${stats.assets.broken} broken`,
  );
  console.log('==============================================================================');
}

function printJsonReport({ stats, errors, warnings, infos }) {
  const payload = {
    format: 'link-check-report-v1',
    generatedAt: new Date().toISOString(),
    summary: {
      files: stats.files,
      totalLinks: stats.totalLinks,
      errors: errors.length,
      warnings: warnings.length,
      redirects: infos.length,
      internal: stats.internal,
      anchors: stats.anchors,
      external: externalEnabled ? stats.external : { discovered: stats.external.discovered },
      assets: stats.assets,
    },
    findings: {
      errors,
      warnings,
      redirects: infos,
    },
    config: {
      linkCheckExternal: externalEnabled,
      linkCheckConcurrency: externalConcurrency,
      linkCheckTimeoutMs: externalTimeoutMs,
      linkCheckFormat: outputFormat,
      linkCheckWarnBare: warnOnBareInternalLinks,
    },
  };

  console.log(JSON.stringify(payload, null, 2));
}

async function run() {
  const absoluteFiles = await listMdxFiles(docsRoot);
  const files = absoluteFiles.map((file) => path.relative(docsRoot, file)).sort((a, b) => a.localeCompare(b));

  const records = new Map();
  const routeToRecord = new Map();

  for (const relativeFile of files) {
    const absoluteFile = path.join(docsRoot, relativeFile);
    const content = await fs.promises.readFile(absoluteFile, 'utf8');
    const route = fileToRoute(relativeFile);
    const baseRoute = fileToBaseRoute(relativeFile, route);
    const anchors = extractHeadings(content);

    const record = {
      relativeFile,
      absoluteFile,
      content,
      route,
      baseRoute,
      anchors,
    };

    records.set(relativeFile, record);
    routeToRecord.set(route, record);
    routeToRecord.set(normalizeRoute(`${route}/index`), record);
  }

  const stats = {
    files: files.length,
    totalLinks: 0,
    internal: { checked: 0, broken: 0 },
    anchors: { checked: 0, broken: 0 },
    external: {
      discovered: 0,
      checked: 0,
      unique: 0,
      cacheHits: 0,
      skipped: 0,
      broken: 0,
      warnings: 0,
    },
    assets: { checked: 0, broken: 0 },
  };

  const findings = [];
  const externalUsage = new Map();

  for (const record of records.values()) {
    const links = extractAllLinks(record.content);

    for (const link of links) {
      const rawTarget = link.target.trim();
      if (!rawTarget) continue;

      const scheme = extractScheme(rawTarget);
      if (isSkippableScheme(rawTarget)) continue;
      if (scheme && !['http', 'https'].includes(scheme)) {
        stats.totalLinks += 1;
        stats.internal.checked += 1;
        stats.internal.broken += 1;
        findings.push(
          createFinding({
            severity: 'error',
            file: path.join('content', 'docs', record.relativeFile),
            line: link.line,
            link: rawTarget,
            type: 'scheme',
            message: `Unsupported link scheme: ${scheme}:`,
          }),
        );
        continue;
      }

      const parsed = splitTarget(rawTarget);
      if (!parsed.normalized) continue;

      if (parsed.normalized.includes('.gitbook/')) {
        stats.totalLinks += 1;
        stats.internal.checked += 1;
        stats.internal.broken += 1;
        findings.push(
          createFinding({
            severity: 'error',
            file: path.join('content', 'docs', record.relativeFile),
            line: link.line,
            link: rawTarget,
            type: 'internal',
            message:
              'Legacy GitBook path detected (.gitbook). Use local /assets/... or route paths.',
          }),
        );
        continue;
      }

      if (isExternalHttpTarget(parsed.normalized)) {
        const externalUrl = normalizeExternalUrl(parsed.normalized);
        stats.totalLinks += 1;
        stats.external.discovered += 1;

        if (!externalUsage.has(externalUrl)) externalUsage.set(externalUrl, []);
        externalUsage.get(externalUrl).push({
          file: path.join('content', 'docs', record.relativeFile),
          line: link.line,
          link: rawTarget,
        });
        continue;
      }

      const fragment = decodeURIComponentSafe(parsed.fragment);
      const hasFragment = Boolean(fragment);
      const pathname = decodeURIComponentSafe(parsed.pathname);

      if (!pathname && hasFragment) {
        stats.totalLinks += 1;
        stats.anchors.checked += 1;

        if (!record.anchors.has(fragment) && !record.anchors.has(fragment.toLowerCase())) {
          stats.anchors.broken += 1;
          findings.push(
            createFinding({
              severity: 'error',
              file: path.join('content', 'docs', record.relativeFile),
              line: link.line,
              link: rawTarget,
              type: 'anchor',
              message: `Anchor #${fragment} not found in current page`,
              details: summarizeAnchors(record.anchors).join(', '),
            }),
          );
        }
        continue;
      }

      if (!pathname && !hasFragment) continue;

      if (hasStaleDocsPrefix(pathname)) {
        stats.totalLinks += 1;
        stats.internal.checked += 1;
        stats.internal.broken += 1;
        findings.push(
          createFinding({
            severity: 'error',
            file: path.join('content', 'docs', record.relativeFile),
            line: link.line,
            link: rawTarget,
            type: 'internal',
            message: 'Stale /docs/ prefix detected. Base URL is now /.',
          }),
        );
        continue;
      }

      const isAssetPath = hasAssetExtension(pathname) || pathname.startsWith('/assets/');
      if (isAssetPath) {
        stats.totalLinks += 1;
        stats.assets.checked += 1;

        const resolvedAssetPath = resolveRelativeAssetPath(pathname, record.absoluteFile);
        if (!fs.existsSync(resolvedAssetPath)) {
          stats.assets.broken += 1;
          findings.push(
            createFinding({
              severity: 'error',
              file: path.join('content', 'docs', record.relativeFile),
              line: link.line,
              link: rawTarget,
              type: 'asset',
              message: `Asset not found at ${toPosix(path.relative(repoRoot, resolvedAssetPath))}`,
            }),
          );
        }
        continue;
      }

      stats.totalLinks += 1;
      stats.internal.checked += 1;

      if (
        warnOnBareInternalLinks &&
        link.sourceType.startsWith('jsx-') &&
        isBareInternalPath(pathname)
      ) {
        findings.push(
          createFinding({
            severity: 'warn',
            file: path.join('content', 'docs', record.relativeFile),
            line: link.line,
            link: rawTarget,
            type: 'internal-style',
            message: 'Bare internal link. Prefer ./, ../, or / for clearer route intent.',
          }),
        );
      }

      const resolvedRoute = resolveDocsRoute(pathname, record.baseRoute);
      const targetRecord = routeToRecord.get(resolvedRoute);

      if (!targetRecord) {
        stats.internal.broken += 1;
        findings.push(
          createFinding({
            severity: 'error',
            file: path.join('content', 'docs', record.relativeFile),
            line: link.line,
            link: rawTarget,
            type: hasFragment ? 'internal + anchor' : 'internal',
            message: `Route not found: ${resolvedRoute}`,
          }),
        );
        continue;
      }

      if (hasFragment) {
        stats.anchors.checked += 1;
        if (!targetRecord.anchors.has(fragment) && !targetRecord.anchors.has(fragment.toLowerCase())) {
          stats.anchors.broken += 1;
          findings.push(
            createFinding({
              severity: 'error',
              file: path.join('content', 'docs', record.relativeFile),
              line: link.line,
              link: rawTarget,
              type: 'internal + anchor',
              message: `Anchor #${fragment} not found in ${resolvedRoute}`,
              details: summarizeAnchors(targetRecord.anchors).join(', '),
            }),
          );
        }
      }
    }
  }

  if (externalEnabled && externalUsage.size > 0) {
    stats.external.unique = externalUsage.size;
    const urls = [...externalUsage.keys()];
    let completedUnique = 0;
    if (outputFormat !== 'json') {
      console.error(`Checking external URLs: 0/${urls.length}...`);
    }

    const externalResults = await runConcurrent(
      urls,
      externalConcurrency,
      async (url) => checkExternalUrl(url),
      () => {
        completedUnique += 1;
        if (
          outputFormat !== 'json' &&
          (completedUnique % externalProgressEvery === 0 || completedUnique === urls.length)
        ) {
          console.error(`Checking external URLs: ${completedUnique}/${urls.length}...`);
        }
      },
    );

    let checkedUnique = 0;

    for (const [url, result] of externalResults.entries()) {
      const usages = externalUsage.get(url) ?? [];
      if (result.severity === 'skip') {
        stats.external.skipped += usages.length;
        continue;
      }

      checkedUnique += 1;
      stats.external.checked += usages.length;

      if (result.severity === 'warn') stats.external.warnings += usages.length;
      if (result.severity === 'error') stats.external.broken += usages.length;

      if (result.severity === 'warn' || result.severity === 'error') {
        for (const usage of usages) {
          findings.push(
            createFinding({
              severity: result.severity,
              file: usage.file,
              line: usage.line,
              link: usage.link,
              type: 'external',
              status: result.status,
              message: result.message,
            }),
          );
        }
      }

      if (result.redirectTarget) {
        for (const usage of usages) {
          findings.push(
            createFinding({
              severity: 'info',
              file: usage.file,
              line: usage.line,
              link: usage.link,
              type: 'external (redirect)',
              message: `Redirects to ${result.redirectTarget} -- consider updating to the final URL.`,
            }),
          );
        }
      }
    }

    stats.external.cacheHits = Math.max(0, stats.external.checked - checkedUnique);
  }

  const errors = findings
    .filter((f) => f.severity === 'error')
    .sort((a, b) => `${a.file}:${a.line}`.localeCompare(`${b.file}:${b.line}`));
  const warnings = findings
    .filter((f) => f.severity === 'warn')
    .sort((a, b) => `${a.file}:${a.line}`.localeCompare(`${b.file}:${b.line}`));
  const infos = findings
    .filter((f) => f.severity === 'info')
    .sort((a, b) => `${a.file}:${a.line}`.localeCompare(`${b.file}:${b.line}`));

  if (outputFormat === 'json') {
    printJsonReport({ stats, errors, warnings, infos });
  } else {
    printReport({ stats, errors, warnings, infos });
  }

  if (errors.length > 0) {
    process.exitCode = 1;
    return;
  }

  if (outputFormat !== 'json') {
    console.log(`\n✅ check-links: scanned ${stats.files} MDX files, no broken links found.`);
  }
}

run().catch((error) => {
  console.error(`❌ check-links failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
