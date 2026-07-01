import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { validateFileSystemOutput, validateHttpOutput } from '../check-llm-md-output.mjs';

async function createDistFixture(files) {
  const distDir = await mkdtemp(path.join(tmpdir(), 'wdk-llm-md-'));

  for (const [relativePath, content] of Object.entries(files)) {
    const target = path.join(distDir, relativePath);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, content, 'utf8');
  }

  return distDir;
}

test('accepts markdown output for required files without the manifest', async () => {
  const distDir = await createDistFixture({
    'index.md': '# Welcome to WDK (/)\n\nHome content',
    'index.html': '<!DOCTYPE html><html><body>Home page</body></html>',
    '404/index.html': '<!DOCTYPE html><html><body>Not found</body></html>',
    '_not-found/index.html': '<!DOCTYPE html><html><body>Not found</body></html>',
    'sdk/all-modules.md': '# All Modules (/sdk/all-modules)\n\nModule content',
    'sdk/all-modules/index.html': '<!DOCTYPE html><html><body>All Modules</body></html>',
  });

  const errors = await validateFileSystemOutput({ distDir });

  assert.deepEqual(errors, []);
});

test('rejects missing required markdown files', async () => {
  const distDir = await createDistFixture({
    'index.md': '# Welcome to WDK (/)\n\nHome content',
  });

  const errors = await validateFileSystemOutput({ distDir });

  assert(errors.some((error) => error.includes('Missing required Markdown file: sdk/all-modules.md')));
});

test('rejects an exported HTML page without a matching markdown file', async () => {
  const distDir = await createDistFixture({
    'index.md': '# Welcome to WDK (/)\n\nHome content',
    'index.html': '<!DOCTYPE html><html><body>Home page</body></html>',
    'sdk/all-modules.md': '# All Modules (/sdk/all-modules)\n\nModule content',
    'sdk/all-modules/index.html': '<!DOCTYPE html><html><body>All Modules</body></html>',
    'sdk/get-started/index.html': '<!DOCTYPE html><html><body>Get Started</body></html>',
  });

  const errors = await validateFileSystemOutput({ distDir });

  assert(errors.some((error) => error.includes('Missing Markdown file for exported HTML page: sdk/get-started.md')));
});

test('rejects leaked manifest and Next 404 HTML in markdown files', async () => {
  const distDir = await createDistFixture({
    'index.md': '# Welcome to WDK (/)\n\nHome content',
    'sdk/all-modules.md': '<!DOCTYPE html><title>404: This page could not be found.</title>',
    'llm-md-manifest.json': '[]',
  });

  const errors = await validateFileSystemOutput({ distDir });

  assert(errors.some((error) => error.includes('Temporary manifest was not removed')));
  assert(errors.some((error) => error.includes('contains HTML/Next.js error content')));
});

test('rejects markdown files that duplicate the matching HTML page body', async () => {
  const html = '<!DOCTYPE html><html><body>All Modules</body></html>';
  const distDir = await createDistFixture({
    'index.md': '# Welcome to WDK (/)\n\nHome content',
    'sdk/all-modules.md': html,
    'sdk/all-modules/index.html': html,
  });

  const errors = await validateFileSystemOutput({ distDir });

  assert(errors.some((error) => error.includes('duplicates HTML output')));
});

test('rejects a successful response for a missing markdown route', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    const pathname = new URL(url).pathname;
    const fixtures = {
      '/sdk/all-modules.md': {
        ok: true,
        status: 200,
        text: '# All Modules (/sdk/all-modules)\n\nModule content',
      },
      '/sdk/all-modules/': {
        ok: true,
        status: 200,
        text: '<!DOCTYPE html><html><body>All Modules</body></html>',
      },
      '/does-not-exist.md': {
        ok: true,
        status: 200,
        text: '<!DOCTYPE html><html><body>Fallback</body></html>',
      },
    };
    const fixture = fixtures[pathname];

    return {
      ok: fixture.ok,
      status: fixture.status,
      text: async () => fixture.text,
    };
  };

  try {
    const errors = await validateHttpOutput({ baseUrl: 'http://localhost:8080' });

    assert(errors.some((error) => error.includes('/does-not-exist.md unexpectedly returned HTTP 200')));
  } finally {
    globalThis.fetch = originalFetch;
  }
});
