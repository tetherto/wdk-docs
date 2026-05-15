#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const docsRoot = path.join(process.cwd(), 'content', 'docs');

async function listMetaFiles(rootDir) {
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
      if (entry.isFile() && entry.name === 'meta.json') {
        results.push(full);
      }
    }
  }

  return results.sort((a, b) => a.localeCompare(b));
}

function hasDocTarget(dir, pageEntry) {
  const asFile = path.join(dir, `${pageEntry}.mdx`);
  if (fs.existsSync(asFile)) return true;

  const asDir = path.join(dir, pageEntry);
  if (!fs.existsSync(asDir)) return false;
  if (!fs.statSync(asDir).isDirectory()) return false;

  return (
    fs.existsSync(path.join(asDir, 'index.mdx')) ||
    fs.existsSync(path.join(asDir, 'meta.json'))
  );
}

async function run() {
  const metaFiles = await listMetaFiles(docsRoot);
  const failures = [];

  for (const metaFile of metaFiles) {
    const raw = await fs.promises.readFile(metaFile, 'utf8');
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      failures.push({
        file: path.relative(process.cwd(), metaFile),
        reason: `Invalid JSON: ${error instanceof Error ? error.message : String(error)}`,
      });
      continue;
    }

    const pages = parsed?.pages;
    if (!Array.isArray(pages)) continue;

    const seen = new Set();
    for (const pageEntry of pages) {
      if (typeof pageEntry !== 'string') continue;
      if (seen.has(pageEntry)) {
        failures.push({
          file: path.relative(process.cwd(), metaFile),
          reason: `Duplicate page entry "${pageEntry}"`,
        });
      }
      seen.add(pageEntry);

      if (!hasDocTarget(path.dirname(metaFile), pageEntry)) {
        failures.push({
          file: path.relative(process.cwd(), metaFile),
          reason: `Missing target for page entry "${pageEntry}"`,
        });
      }
    }
  }

  if (failures.length === 0) {
    console.log(`✅ check-meta: validated ${metaFiles.length} meta.json files.`);
    return;
  }

  console.error(`❌ check-meta: found ${failures.length} navigation issue(s):\n`);
  for (const failure of failures) {
    console.error(`- ${failure.file}`);
    console.error(`  reason: ${failure.reason}`);
  }
  process.exitCode = 1;
}

run().catch((error) => {
  console.error(`❌ check-meta failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
