#!/usr/bin/env node
// Checks the navigation against the content.
// Usage: node scripts/check-nav.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildTree } from '../src/lib/nav/build.mjs';
import disposition from '../src/lib/nav/disposition.mjs';
import { hubUsagePages } from '../src/lib/nav/inventory.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = path.join(ROOT, 'content/docs');

function contentPages() {
  const pages = new Map();
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.mdx?$/.test(entry.name)) {
        const rel = path.relative(CONTENT, full).replace(/\.mdx?$/, '').replace(/(^|\/)index$/, '');
        pages.set(`/${rel}`, full);
      }
    }
  };
  walk(CONTENT);
  return pages;
}

function urlsIn(node, out = []) {
  if (node.type === 'page') out.push(node.url);
  if (node.index) out.push(node.index.url);
  node.children?.forEach((c) => urlsIn(c, out));
  return out;
}

const pages = contentPages();
const tree = buildTree(disposition);
const failures = [];
const fail = (rule, items) => { if (items.length) failures.push({ rule, items }); };

const counts = new Map();
for (const url of tree.flatMap((n) => urlsIn(n))) counts.set(url, (counts.get(url) ?? 0) + 1);

fail('Page missing from the navigation. Add it to src/lib/nav/inventory.mjs', [...pages.keys()].filter((p) => !counts.has(p)));
fail('Page listed more than once', [...counts].filter(([, c]) => c > 1).map(([u]) => u));
fail('Navigation links to a page that does not exist', [...counts.keys()].filter((u) => !pages.has(u)));
fail('Tab lands on a page that is not in the tab', tree
  .filter((tab) => tab.landing && !tab.children.flatMap((c) => urlsIn(c)).includes(tab.landing))
  .map((tab) => `${tab.name}: ${tab.landing}`));

// A module is marked Community when its own landing page carries the community notice.
const NOTICE = /community[- ]maintained|maintained independently by third-party|community module/i;
const unmarked = [];
const overmarked = [];
const walk = (node) => {
  if (node.index && node.name !== 'Guides' && node.children?.some((c) => c.type !== 'separator')) {
    const file = pages.get(node.index.url);
    const hasNotice = Boolean(file) && NOTICE.test(fs.readFileSync(file, 'utf8'));
    if (hasNotice && node.status !== 'community') unmarked.push(`${node.name} (${node.index.url})`);
    if (!hasNotice && node.status === 'community') overmarked.push(`${node.name} (${node.index.url})`);
  }
  node.children?.forEach(walk);
};
tree.forEach(walk);
fail("Module page has the community notice, but no 'community' status in inventory.mjs", unmarked);
fail("Module has 'community' status in inventory.mjs, but its page has no community notice", overmarked);

// Usage pages with no code are hubs, shown as the landing page of the Guides row.
const hubsNow = [...pages].filter(([u, f]) => u.endsWith('/usage') && !fs.readFileSync(f, 'utf8').includes('```')).map(([u]) => u);
fail('Usage page with no code, missing from hubUsagePages in inventory.mjs', hubsNow.filter((u) => !hubUsagePages.includes(u)));
fail('Listed in hubUsagePages, but the page has code or does not exist', hubUsagePages.filter((u) => !hubsNow.includes(u)));

if (failures.length) {
  console.error('❌ Navigation check failed\n');
  for (const { rule, items } of failures) {
    console.error(`${rule}:`);
    for (const item of items) console.error(`  - ${item}`);
  }
  process.exit(1);
}
console.log(`✅ Navigation check passed: ${counts.size} pages, each listed once, in ${tree.length} tabs.`);
