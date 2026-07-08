#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, '..');
const DEFAULT_DIST_DIR = path.join(REPO_ROOT, 'dist');
const DEFAULT_REQUIRED_PATHS = ['index.md', 'sdk/all-modules.md'];
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
  markdownPath = '/sdk/all-modules.md',
  htmlPath = '/sdk/all-modules/',
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

  if (!markdown.text.trimStart().startsWith('# All Modules')) {
    errors.push(`${markdownPath} does not start with the All Modules Markdown heading`);
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
    ...await validateFileSystemOutput(options),
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
