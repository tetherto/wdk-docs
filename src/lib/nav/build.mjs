// Turns a disposition (tabs > categories > entries) into a plain navigation tree.
// Used by the site (via src/lib/custom-tree.ts) and by ia-loop/ for scoring.
import { hubUsagePages, inventory } from './inventory.mjs';

// One wording per guide type. Slugs and page titles are untouched.
const LABELS = {
  'Getting Started': 'Get Started',
  'Error Handling': 'Handle Errors',
  'Account Management': 'Manage Accounts',
};

const clone = (value) => JSON.parse(JSON.stringify(value));

function normalizeLabels(node) {
  if (LABELS[node.name]) node.name = LABELS[node.name];
  node.children?.forEach(normalizeLabels);
}

// Hub Usage page becomes the landing page of an always-open Guides row.
function foldModuleSections(node, hubs) {
  if (!node.children) return;
  const guides = node.children.find((c) => c.type === 'folder' && c.name === 'Guides');
  if (guides) {
    guides.defaultOpen = true;
    const hub = node.children.find((c) => c.type === 'page' && c.name === 'Usage' && hubs.has(c.url));
    if (hub) {
      guides.index = { name: 'Guides', url: hub.url, type: 'page' };
      node.children = node.children.filter((c) => c !== hub);
    }
  }
  node.children.forEach((c) => foldModuleSections(c, hubs));
}

function take(key) {
  const node = inventory[key];
  if (!node) throw new Error(`Unknown inventory key: ${key}`);
  return clone(node);
}

function splitModule(node, only) {
  const isReference = (c) => c.type === 'page' && (c.name === 'Configuration' || c.name === 'API Reference');
  if (only === 'reference') {
    const children = node.children.filter(isReference);
    return { type: 'folder', name: node.name, icon: node.icon, status: node.status, children };
  }
  return { ...node, children: node.children.filter((c) => !isReference(c)) };
}

function buildEntry(entry, spec) {
  if (typeof entry === 'string') return finish(take(entry), spec);
  if (entry.separator) return { type: 'separator', name: entry.separator };
  if (entry.group) {
    const node = { type: 'folder', name: entry.group, icon: entry.icon, children: entry.entries.map((e) => buildEntry(e, spec)) };
    if (entry.index) {
      const index = take(entry.index);
      node.index = { name: entry.indexName ?? entry.group, url: index.url, type: 'page' };
    }
    if (entry.defaultOpen) node.defaultOpen = true;
    return node;
  }
  if (entry.url) return { type: 'page', name: entry.name, url: entry.url, icon: entry.icon };
  let node = take(entry.key);
  if (entry.without && node.children) node.children = stripUrls(node.children, new Set(entry.without));
  if (entry.only) node = splitModule(node, entry.only);
  if (entry.append) node.children = [...node.children, ...entry.append.map((e) => buildEntry(e, spec))];
  if (entry.name) node.name = entry.name;
  if (entry.indexName && node.index) node.index.name = entry.indexName;
  return finish(node, spec);
}

function stripUrls(children, urls) {
  return children
    .filter((c) => !(c.type === 'page' && urls.has(c.url)))
    .map((c) => (c.children ? { ...c, children: stripUrls(c.children, urls) } : c));
}

function finish(node, spec) {
  if (spec.normalizeLabels) normalizeLabels(node);
  if (spec.foldHubUsage) foldModuleSections(node, new Set(hubUsagePages));
  return node;
}

function landingUrl(key) {
  const node = take(key);
  return node.index?.url ?? node.url;
}

export function buildTree(spec) {
  const tabs = spec.tabs.map((tab) => ({
    type: 'folder',
    root: !spec.flat,
    name: tab.name,
    icon: tab.icon,
    ...(tab.landing ? { landing: landingUrl(tab.landing) } : {}),
    children: tab.categories.flatMap((category) => [
      ...(category.name ? [{ type: 'separator', name: category.name }] : []),
      ...category.entries.map((entry) => buildEntry(entry, spec)),
    ]),
  }));
  return spec.flat ? tabs.flatMap((tab) => tab.children) : tabs;
}
