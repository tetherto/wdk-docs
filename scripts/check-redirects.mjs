#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const redirectsPath = path.join(repoRoot, '_redirects');
const docsRoot = path.join(repoRoot, 'content', 'docs');
const publicRoot = path.join(repoRoot, 'public');
const generatedStaticTargets = new Set(['/404.html']);

const moduleRedirects = [
  ['/sdk/wallet-evm', '/sdk/wallet-modules/wallet-evm'],
  ['/sdk/wallet-evm-erc-4337', '/sdk/wallet-modules/wallet-evm-erc-4337'],
  ['/sdk/wallet-btc', '/sdk/wallet-modules/wallet-btc'],
  ['/sdk/wallet-solana', '/sdk/wallet-modules/wallet-solana'],
  ['/sdk/wallet-ton', '/sdk/wallet-modules/wallet-ton'],
  ['/sdk/wallet-ton-gasless', '/sdk/wallet-modules/wallet-ton-gasless'],
  ['/sdk/wallet-tron', '/sdk/wallet-modules/wallet-tron'],
  ['/sdk/wallet-tron-gasfree', '/sdk/wallet-modules/wallet-tron-gasfree'],
  ['/sdk/wallet-spark', '/sdk/wallet-modules/wallet-spark'],
  ['/sdk/swap-velora-evm', '/sdk/swap-modules/swap-velora-evm'],
  ['/sdk/bridge-usdt0-evm', '/sdk/bridge-modules/bridge-usdt0-evm'],
  ['/sdk/lending-aave-evm', '/sdk/lending-modules/lending-aave-evm'],
  ['/sdk/fiat-moonpay', '/sdk/fiat-modules/fiat-moonpay'],
].map(([source, target]) => ({ source, target }));

const expectedRedirects = [
  {
    source: '/examples-and-starters/tools/indexer-api/get-started',
    target: '/tools/indexer-api/get-started',
    status: '301',
  },
  {
    source: '/sdk/lending-aave-evm',
    target: '/sdk/lending-modules/lending-aave-evm',
    status: '301',
  },
  {
    source: '/sdk/lending-aave-evm/',
    target: '/sdk/lending-modules/lending-aave-evm/',
    status: '301',
  },
  {
    source: '/sdk/lending-aave-evm/api-reference',
    target: '/sdk/lending-modules/lending-aave-evm/api-reference',
    status: '301',
  },
  {
    source: '/sdk/bridge-usdt0-evm/guides/get-started',
    target: '/sdk/bridge-modules/bridge-usdt0-evm/guides/get-started',
    status: '301',
  },
  {
    source: '/sdk/wallet-evm/guides/getting-started',
    target: '/sdk/wallet-modules/wallet-evm/guides/getting-started',
    status: '301',
  },
  {
    source: '/__missing-sevalla-404-check',
    target: '/404.html',
    status: '404',
  },
];

function toPosix(filePath) {
  return filePath.split(path.sep).join(path.posix.sep);
}

async function listFiles(rootDir, predicate) {
  if (!fs.existsSync(rootDir)) return [];

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
      if (entry.isFile() && predicate(full)) {
        results.push(full);
      }
    }
  }

  return results.sort((a, b) => a.localeCompare(b));
}

function routeFromDocFile(filePath) {
  let relativePath = toPosix(path.relative(docsRoot, filePath)).replace(/\.mdx$/, '');
  if (relativePath === 'index') return '/';
  if (relativePath.endsWith('/index')) {
    relativePath = relativePath.slice(0, -'/index'.length);
  }
  return `/${relativePath}`;
}

function normalizeRoute(route) {
  if (route === '/') return route;
  return route.replace(/\/+$/, '');
}

function stripTargetDecorations(target) {
  return target.split(/[?#]/, 1)[0];
}

function targetRouteForValidation(target) {
  const cleanTarget = stripTargetDecorations(target);
  if (cleanTarget.includes(':splat')) {
    return normalizeRoute(cleanTarget.replace(/\/:splat.*$/, ''));
  }
  return normalizeRoute(cleanTarget);
}

async function buildValidTargets() {
  const docFiles = await listFiles(docsRoot, (filePath) => filePath.endsWith('.mdx'));
  const publicFiles = await listFiles(publicRoot, () => true);

  const targets = new Set(docFiles.map(routeFromDocFile));

  for (const filePath of publicFiles) {
    targets.add(`/${toPosix(path.relative(publicRoot, filePath))}`);
  }

  return targets;
}

function parseRedirects(raw) {
  const redirects = [];

  raw.split(/\r?\n/).forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    const parts = trimmed.split(/\s+/);
    redirects.push({
      line: index + 1,
      source: parts[0],
      target: parts[1],
      status: parts.find((part) => /^\d{3}!?$/.test(part)),
      options: parts.slice(2),
    });
  });

  return redirects;
}

function resolveRedirect(redirects, sourcePath) {
  for (const redirect of redirects) {
    if (redirect.source.endsWith('/*')) {
      const prefix = redirect.source.slice(0, -1);
      if (!sourcePath.startsWith(prefix)) continue;

      return {
        ...redirect,
        resolvedTarget: redirect.target.replace(':splat', sourcePath.slice(prefix.length)),
      };
    }

    if (redirect.source === sourcePath) {
      return {
        ...redirect,
        resolvedTarget: redirect.target,
      };
    }
  }

  return undefined;
}

function validateModuleRedirectShape(redirects, failures) {
  const bySource = new Map(redirects.map((redirect) => [redirect.source, redirect]));

  for (const { source, target } of moduleRedirects) {
    const bareRule = bySource.get(source);
    if (!bareRule || bareRule.target !== target || bareRule.status !== '301') {
      failures.push({
        line: bareRule?.line ?? 0,
        reason: `Missing module landing redirect: ${source} -> ${target} 301`,
      });
    }

    const indexRule = bySource.get(`${source}/`);
    if (indexRule) {
      failures.push({
        line: indexRule.line,
        reason: `Module alias "${source}/" should be covered by the splat rule.`,
      });
    }

    const splatRule = bySource.get(`${source}/*`);
    if (!splatRule || splatRule.target !== `${target}/:splat` || splatRule.status !== '301') {
      failures.push({
        line: splatRule?.line ?? 0,
        reason: `Missing module nested redirect: ${source}/* -> ${target}/:splat 301`,
      });
    }
  }
}

function validateCatchAll404Redirect(redirects, failures) {
  const catchAllRule = redirects.find((redirect) => redirect.source === '/*');

  if (!catchAllRule) {
    failures.push({
      line: 0,
      reason: 'Missing catch-all 404 redirect: /* -> /404.html 404',
    });
    return;
  }

  if (catchAllRule.target !== '/404.html' || catchAllRule.status !== '404') {
    failures.push({
      line: catchAllRule.line,
      reason: `Expected catch-all 404 redirect to be /* -> /404.html 404, got ${catchAllRule.target} ${catchAllRule.status ?? ''}`.trim(),
    });
  }

  const lastRule = redirects.at(-1);
  if (lastRule && catchAllRule.line !== lastRule.line) {
    failures.push({
      line: catchAllRule.line,
      reason: 'Catch-all 404 redirect must be the last rule in _redirects.',
    });
  }
}

async function run() {
  if (!fs.existsSync(redirectsPath)) {
    console.log('✅ check-redirects: no _redirects file found.');
    return;
  }

  const validTargets = await buildValidTargets();
  const redirects = parseRedirects(await fs.promises.readFile(redirectsPath, 'utf8'));
  const seenSources = new Map();
  const failures = [];

  for (const redirect of redirects) {
    if (!redirect.source || !redirect.target) {
      failures.push({ line: redirect.line, reason: 'Redirect rule must include source and target.' });
      continue;
    }

    if (seenSources.has(redirect.source)) {
      failures.push({
        line: redirect.line,
        reason: `Duplicate source path "${redirect.source}" also appears on line ${seenSources.get(redirect.source)}.`,
      });
    } else {
      seenSources.set(redirect.source, redirect.line);
    }

    if (!redirect.source.startsWith('/')) {
      failures.push({ line: redirect.line, reason: `Source path must start with "/": ${redirect.source}` });
    }

    if (/^https?:\/\//.test(redirect.target)) continue;

    if (!redirect.target.startsWith('/')) {
      failures.push({ line: redirect.line, reason: `Internal target must start with "/": ${redirect.target}` });
      continue;
    }

    const targetRoute = targetRouteForValidation(redirect.target);
    if (!validTargets.has(targetRoute) && !generatedStaticTargets.has(targetRoute)) {
      failures.push({
        line: redirect.line,
        reason: `Target route does not exist in content/docs or public: ${redirect.target}`,
      });
    }
  }

  validateModuleRedirectShape(redirects, failures);
  validateCatchAll404Redirect(redirects, failures);

  for (const expected of expectedRedirects) {
    const redirect = resolveRedirect(redirects, expected.source);
    if (!redirect) {
      failures.push({
        line: 0,
        reason: `Expected redirect did not match any rule: ${expected.source}`,
      });
      continue;
    }

    if (redirect.resolvedTarget !== expected.target || redirect.status !== expected.status) {
      failures.push({
        line: redirect.line,
        reason:
          `Expected ${expected.source} -> ${expected.target} ${expected.status}, ` +
          `got ${redirect.resolvedTarget} ${redirect.status ?? ''}`.trim(),
      });
    }
  }

  if (failures.length === 0) {
    console.log(
      `✅ check-redirects: validated ${redirects.length} redirect rule(s) ` +
      `and ${expectedRedirects.length} expected match(es).`,
    );
    return;
  }

  console.error(`❌ check-redirects: found ${failures.length} redirect issue(s):\n`);
  for (const failure of failures) {
    console.error(failure.line > 0 ? `- _redirects:${failure.line}` : '- _redirects');
    console.error(`  reason: ${failure.reason}`);
  }
  process.exitCode = 1;
}

run().catch((error) => {
  console.error(`❌ check-redirects failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
