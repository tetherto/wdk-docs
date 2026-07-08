#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, '..');
const DEFAULT_DIST_DIR = path.join(REPO_ROOT, 'dist');
const DEFAULT_MANIFEST_PATH = path.join(DEFAULT_DIST_DIR, 'llm-md-manifest.json');

function assertSafeRelativePath(relativePath) {
  const segments = relativePath.split('/');
  if (
    path.isAbsolute(relativePath)
    || segments.some((segment) => segment === '.' || segment === '..' || segment.length === 0)
  ) {
    throw new Error(`Invalid manifest entry url path: ${relativePath}`);
  }
}

export function urlToMarkdownRelativePath(url) {
  if (typeof url !== 'string' || url.length === 0) {
    throw new Error(`Invalid manifest entry url: ${JSON.stringify(url)}`);
  }

  if (url.includes('?') || url.includes('#')) {
    throw new Error(`Invalid manifest entry url: ${JSON.stringify(url)}`);
  }

  const trimmed = url.replace(/^\/+/, '').replace(/\/+$/, '');
  if (trimmed.length === 0) return 'index.md';

  assertSafeRelativePath(trimmed);

  return `${trimmed}.md`;
}

function validateEntry(entry, index) {
  if (!entry || typeof entry !== 'object') {
    throw new Error(`Invalid manifest entry at index ${index}: expected object`);
  }

  if (typeof entry.url !== 'string' || entry.url.length === 0) {
    throw new Error(`Invalid manifest entry at index ${index}: missing url`);
  }

  if (typeof entry.content !== 'string') {
    throw new Error(`Invalid manifest entry at index ${index}: missing content`);
  }
}

export async function readManifest(manifestPath = DEFAULT_MANIFEST_PATH) {
  const raw = await fs.readFile(manifestPath, 'utf8');
  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error(`Expected manifest to be an array, got ${typeof parsed}`);
  }

  parsed.forEach(validateEntry);
  return parsed;
}

export async function generateMarkdownFiles({
  distDir = DEFAULT_DIST_DIR,
  manifestPath = DEFAULT_MANIFEST_PATH,
} = {}) {
  const entries = await readManifest(manifestPath);
  const written = [];

  for (const entry of entries) {
    const relativePath = urlToMarkdownRelativePath(entry.url);
    const target = path.resolve(distDir, relativePath);
    const distRoot = path.resolve(distDir);

    if (!target.startsWith(`${distRoot}${path.sep}`)) {
      throw new Error(`Refusing to write Markdown outside dist: ${relativePath}`);
    }

    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, entry.content, 'utf8');
    written.push(relativePath);
  }

  await fs.unlink(manifestPath);
  return written;
}

async function main() {
  console.log(`Generating per-page Markdown files from ${DEFAULT_MANIFEST_PATH}`);

  let written;
  try {
    written = await generateMarkdownFiles();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Could not generate per-page Markdown files: ${message}`);
  }

  for (const relativePath of written) {
    console.log(`  wrote dist/${relativePath}`);
  }

  console.log(`Generated ${written.length} per-page Markdown file(s)`);
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
