#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, '..');
const DEFAULT_SOURCE_PATH = path.join(REPO_ROOT, 'content', 'feeds', 'all-modules.md');
const DEFAULT_TARGET_PATH = path.join(REPO_ROOT, 'public', 'llms-full.txt');
const SECTION_SEPARATOR = '\n\n***\n\n';
const SECTION_TERMINATOR = '\n\n***\n';
const SECTION_HEADING_PATTERN = /(?:^|\n)## All Modules\n/g;

export function upsertAllModulesFeed(artifact, source) {
  const normalizedSource = source.trim();
  if (!normalizedSource.startsWith('## All Modules\n')) {
    throw new Error('All Modules catalog source must start with the exact `## All Modules` heading');
  }
  if (normalizedSource.includes(SECTION_TERMINATOR)) {
    throw new Error('All Modules catalog source must not contain an llms-full section separator');
  }

  const matches = [...artifact.matchAll(SECTION_HEADING_PATTERN)];
  if (matches.length > 1) {
    throw new Error(`Expected at most one All Modules feed section, found ${matches.length}`);
  }

  if (matches.length === 1) {
    const match = matches[0];
    const sectionStart = match.index + (match[0].startsWith('\n') ? 1 : 0);
    const separatorStart = artifact.indexOf(SECTION_SEPARATOR, sectionStart);
    const terminalSeparatorStart = artifact.endsWith(SECTION_TERMINATOR)
      ? artifact.length - SECTION_TERMINATOR.length
      : -1;
    const sectionEnd = separatorStart === -1 ? terminalSeparatorStart : separatorStart;
    if (sectionEnd < sectionStart) {
      throw new Error('Existing All Modules feed is missing its terminating llms-full section separator');
    }
    const existingSection = artifact.slice(sectionStart, sectionEnd);
    if (/\n## [^\n]+\nURL: https?:\/\//.test(existingSection)) {
      throw new Error('Existing All Modules feed contains a later page record before its terminating separator');
    }
    return `${artifact.slice(0, sectionStart)}${normalizedSource}${artifact.slice(sectionEnd)}`;
  }

  return `${artifact.trimEnd()}${SECTION_SEPARATOR}${normalizedSource}${SECTION_TERMINATOR}`;
}

export async function syncAllModulesFeed({
  sourcePath = DEFAULT_SOURCE_PATH,
  targetPath = DEFAULT_TARGET_PATH,
  write = true,
} = {}) {
  const [source, artifact] = await Promise.all([
    fs.readFile(sourcePath, 'utf8'),
    fs.readFile(targetPath, 'utf8'),
  ]);
  const updated = upsertAllModulesFeed(artifact, source);

  if (updated === artifact) return false;

  if (write) await fs.writeFile(targetPath, updated, 'utf8');
  return true;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.some((arg) => arg !== '--check') || args.filter((arg) => arg === '--check').length > 1) {
    throw new Error('Usage: node scripts/sync-all-modules-feed.mjs [--check]');
  }

  const checkOnly = args.includes('--check');
  const changed = await syncAllModulesFeed({ write: !checkOnly });
  if (checkOnly && changed) {
    throw new Error('public/llms-full.txt All Modules feed is stale; run `npm run sync:all-modules-feed`');
  }
  console.log(changed ? 'updated public/llms-full.txt All Modules feed' : 'public/llms-full.txt All Modules feed is current');
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
