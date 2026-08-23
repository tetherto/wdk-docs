import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import {
  validateAllModulesFeed,
  validateDocsHtmlSourceOrder,
  validateFileSystemOutput,
  validateHttpOutput,
  validateLlmsTxt,
} from '../check-llm-md-output.mjs';

async function createDistFixture(files) {
  const distDir = await mkdtemp(path.join(tmpdir(), 'wdk-llm-md-'));

  for (const [relativePath, content] of Object.entries(files)) {
    const target = path.join(distDir, relativePath);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, content, 'utf8');
  }

  return distDir;
}

function htmlPathForMarkdown(relativePath) {
  if (relativePath === 'index.md') return 'index.html';
  return `${relativePath.slice(0, -'.md'.length)}/index.html`;
}

async function createLlmsFixture({ llms, markdownFiles, htmlFiles = markdownFiles }) {
  const root = await mkdtemp(path.join(tmpdir(), 'wdk-llms-txt-'));
  const llmsPath = path.join(root, 'llms.txt');
  const distDir = path.join(root, 'dist');

  await mkdir(distDir, { recursive: true });
  await writeFile(llmsPath, llms, 'utf8');

  for (const relativePath of markdownFiles) {
    const target = path.join(distDir, relativePath);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, '# Fixture\n', 'utf8');
  }

  for (const relativePath of htmlFiles) {
    const target = path.join(distDir, htmlPathForMarkdown(relativePath));
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, '<!DOCTYPE html><article id="nd-page">Fixture</article>', 'utf8');
  }

  return { llmsPath, distDir };
}

const validLlmsLines = [
    '# WDK Documentation',
    '',
    '> Complete WDK documentation index.',
    '',
    '## Documentation',
    '',
    '- [Welcome to WDK](https://docs.wdk.tether.io/index.md)',
    '- [Core](https://docs.wdk.tether.io/sdk/core-module.md)',
    '- [Get Started](https://docs.wdk.tether.io/sdk/get-started.md)',
    '',
];
const fixtureMarkdownFiles = ['index.md', 'sdk/core-module.md', 'sdk/get-started.md'];

test('accepts a structured llms.txt with exact exported HTML and Markdown coverage', async () => {
  const llms = validLlmsLines.join('\n');
  const fixture = await createLlmsFixture({
    llms,
    markdownFiles: fixtureMarkdownFiles,
  });

  const errors = await validateLlmsTxt(fixture);

  assert.deepEqual(errors, []);
});

const invalidLlmsCases = [
  {
    name: 'a missing H1',
    mutate: (lines) => lines.with(0, 'WDK Documentation'),
    expected: 'must start with exactly one',
  },
  {
    name: 'a missing blockquote summary',
    mutate: (lines) => lines.filter((line) => !line.startsWith('> ')),
    expected: 'blockquote summary',
  },
  {
    name: 'a missing Documentation H2',
    mutate: (lines) => lines.filter((line) => line !== '## Documentation'),
    expected: 'blockquote summary',
  },
  {
    name: 'a legacy bare URL entry',
    mutate: (lines) => lines.with(6, '- Welcome to WDK: https://docs.wdk.tether.io/'),
    expected: 'Invalid llms.txt documentation entry',
  },
  {
    name: 'a same-origin HTML target',
    mutate: (lines) => lines.with(6, '- [Welcome to WDK](https://docs.wdk.tether.io/)'),
    expected: 'Invalid llms.txt documentation entry',
  },
  {
    name: 'a foreign-origin Markdown target',
    mutate: (lines) => lines.with(6, '- [Welcome to WDK](https://example.com/index.md)'),
    expected: 'Invalid llms.txt documentation entry',
  },
  {
    name: 'multiple Markdown links in one entry',
    mutate: (lines) => lines.with(
      6,
      '- [Injected](https://example.com/off-origin.md) [Welcome](https://docs.wdk.tether.io/index.md)',
    ),
    expected: 'Invalid llms.txt documentation entry',
  },
  {
    name: 'a query-bearing Markdown target',
    mutate: (lines) => lines.with(6, '- [Welcome to WDK](https://docs.wdk.tether.io/index.md?raw=1)'),
    expected: 'Invalid llms.txt documentation entry',
  },
  {
    name: 'a duplicate route',
    mutate: (lines) => [...lines.slice(0, -1), lines[6], ''],
    expected: 'must be unique',
  },
  {
    name: 'an oversized artifact',
    mutate: (lines) => lines.with(2, `> ${'x'.repeat(50_001)}`),
    expected: 'exceeds 50000 characters',
  },
  {
    name: 'a missing exported route',
    mutate: (lines) => lines.filter((line) => !line.includes('/sdk/get-started.md')),
    expected: 'missing 1 exported documentation route',
  },
  {
    name: 'an extra retired route',
    mutate: (lines) => [...lines.slice(0, -1), '- [Retired](https://docs.wdk.tether.io/sdk/all-modules.md)', ''],
    expected: 'unknown Markdown route',
  },
  {
    name: 'the invalid root /.md route',
    mutate: (lines) => lines.with(6, '- [Welcome to WDK](https://docs.wdk.tether.io/.md)'),
    expected: 'Invalid llms.txt documentation entry',
  },
];

for (const { name, mutate, expected } of invalidLlmsCases) {
  test(`rejects llms.txt with ${name}`, async () => {
    const fixture = await createLlmsFixture({
      llms: mutate(validLlmsLines).join('\n'),
      markdownFiles: fixtureMarkdownFiles,
    });

    const errors = await validateLlmsTxt(fixture);

    assert(errors.some((error) => error.includes(expected)), errors.join('\n'));
  });
}

test('rejects generated Markdown without matching exported HTML', async () => {
  const fixture = await createLlmsFixture({
    llms: validLlmsLines.join('\n'),
    markdownFiles: [...fixtureMarkdownFiles, 'sdk/all-modules.md'],
    htmlFiles: fixtureMarkdownFiles,
  });

  const errors = await validateLlmsTxt(fixture);

  assert(errors.some((error) => error.includes('without exported HTML')));
});

test('accepts docs HTML that serializes the article before one sidebar', async () => {
  const distDir = await createDistFixture({
    'index.md': '# Welcome to WDK (/)',
    'index.html': '<div id="nd-page">Article</div><div data-sidebar-placeholder><aside id="nd-sidebar">Navigation</aside></div>',
  });

  const errors = await validateDocsHtmlSourceOrder({ distDir });

  assert.deepEqual(errors, []);
});

test('rejects docs HTML with navigation first or duplicated sidebars', async () => {
  const distDir = await createDistFixture({
    'nested/page/index.html': '<div data-sidebar-placeholder><aside id="nd-sidebar">Navigation</aside></div><div id="nd-page">Article</div><aside id="nd-sidebar">Duplicate</aside>',
  });

  const errors = await validateDocsHtmlSourceOrder({ distDir });

  assert(errors.some((error) => error.includes('exactly one docs sidebar')));
  assert(errors.some((error) => error.includes('repeated navigation before the docs article')));
});

for (const [name, html, expected] of [
  ['missing article', '<div data-sidebar-placeholder><aside id="nd-sidebar">Navigation</aside></div>', 'exactly one docs article; found 0'],
  ['duplicate article', '<article id="nd-page"></article><article id="nd-page"></article><div data-sidebar-placeholder><aside id="nd-sidebar"></aside></div>', 'exactly one docs article; found 2'],
  ['missing sidebar', '<article id="nd-page"></article><div data-sidebar-placeholder></div>', 'found 0 sidebar(s)'],
  ['missing placeholder', '<article id="nd-page"></article><aside id="nd-sidebar"></aside>', '0 placeholder(s)'],
]) {
  test(`rejects docs HTML with a ${name}`, async () => {
    const distDir = await createDistFixture({ 'nested/page/index.html': html });

    const errors = await validateDocsHtmlSourceOrder({ distDir });

    assert(errors.some((error) => error.includes(expected)), errors.join('\n'));
  });
}

test('ignores framework not-found HTML in the source-order gate', async () => {
  const distDir = await createDistFixture({
    'index.html': '<article id="nd-page"></article><div data-sidebar-placeholder><aside id="nd-sidebar"></aside></div>',
    '404/index.html': '<h1>Not found</h1>',
    '_not-found/index.html': '<h1>Not found</h1>',
  });

  const errors = await validateDocsHtmlSourceOrder({ distDir });

  assert.deepEqual(errors, []);
});

test('keeps the repository llms.txt artifact valid', async () => {
  const errors = await validateLlmsTxt();

  assert.deepEqual(errors, []);
});

test('accepts markdown output for required files without the manifest', async () => {
  const distDir = await createDistFixture({
    'index.md': '# Welcome to WDK (/)\n\nHome content',
    'index.html': '<!DOCTYPE html><html><body>Home page</body></html>',
    '404/index.html': '<!DOCTYPE html><html><body>Not found</body></html>',
    '_not-found/index.html': '<!DOCTYPE html><html><body>Not found</body></html>',
    'sdk/get-started.md': '# Get Started (/sdk/get-started)\n\nArchitecture content',
    'sdk/get-started/index.html': '<!DOCTYPE html><html><body>Get Started</body></html>',
  });

  const errors = await validateFileSystemOutput({ distDir });

  assert.deepEqual(errors, []);
});

test('rejects missing required markdown files', async () => {
  const distDir = await createDistFixture({
    'index.md': '# Welcome to WDK (/)\n\nHome content',
  });

  const errors = await validateFileSystemOutput({ distDir });

  assert(errors.some((error) => error.includes('Missing required Markdown file: sdk/get-started.md')));
});

test('rejects an exported HTML page without a matching markdown file', async () => {
  const distDir = await createDistFixture({
    'index.md': '# Welcome to WDK (/)\n\nHome content',
    'index.html': '<!DOCTYPE html><html><body>Home page</body></html>',
    'sdk/get-started.md': '# Get Started (/sdk/get-started)\n\nArchitecture content',
    'sdk/get-started/index.html': '<!DOCTYPE html><html><body>Get Started</body></html>',
    'sdk/wallet-modules/index.html': '<!DOCTYPE html><html><body>Wallet Modules</body></html>',
  });

  const errors = await validateFileSystemOutput({ distDir });

  assert(errors.some((error) => error.includes('Missing Markdown file for exported HTML page: sdk/wallet-modules.md')));
});

test('rejects leaked manifest and Next 404 HTML in markdown files', async () => {
  const distDir = await createDistFixture({
    'index.md': '# Welcome to WDK (/)\n\nHome content',
    'sdk/get-started.md': '<!DOCTYPE html><title>404: This page could not be found.</title>',
    'llm-md-manifest.json': '[]',
  });

  const errors = await validateFileSystemOutput({ distDir });

  assert(errors.some((error) => error.includes('Temporary manifest was not removed')));
  assert(errors.some((error) => error.includes('contains HTML/Next.js error content')));
});

test('rejects markdown files that duplicate the matching HTML page body', async () => {
  const html = '<!DOCTYPE html><html><body>Get Started</body></html>';
  const distDir = await createDistFixture({
    'index.md': '# Welcome to WDK (/)\n\nHome content',
    'sdk/get-started.md': html,
    'sdk/get-started/index.html': html,
  });

  const errors = await validateFileSystemOutput({ distDir });

  assert(errors.some((error) => error.includes('duplicates HTML output')));
});

test('rejects a successful response for a missing markdown route', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    const pathname = new URL(url).pathname;
    const fixtures = {
      '/sdk/get-started.md': {
        ok: true,
        status: 200,
        text: '# Get Started (/sdk/get-started)\n\nArchitecture content',
      },
      '/sdk/get-started/': {
        ok: true,
        status: 200,
        text: '<!DOCTYPE html><html><body>Get Started</body></html>',
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

test('accepts one exact All Modules feed with valid internal documentation links', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'wdk-all-modules-feed-'));
  const sourcePath = path.join(root, 'content/feeds/all-modules.md');
  const publicPath = path.join(root, 'public/llms-full.txt');
  const distPath = path.join(root, 'dist/llms-full.txt');
  const docsRoot = path.join(root, 'content/docs');
  const source = [
    '## All Modules',
    'URL: https://wdk.tether.io/developers/blocks',
    '',
    '[Core docs](/sdk/core-module/)',
    '',
    '## Community Modules',
    '',
    '| Module | Category | Description | Documentation |',
    '|--------|----------|-------------|---------------|',
    '| [`@example/community`](https://example.com/community) | Wallet | Example | [Core docs](/sdk/core-module/) |',
  ].join('\n');

  await mkdir(path.dirname(sourcePath), { recursive: true });
  await mkdir(path.dirname(publicPath), { recursive: true });
  await mkdir(path.dirname(distPath), { recursive: true });
  await mkdir(path.join(docsRoot, 'sdk/core-module'), { recursive: true });
  await writeFile(sourcePath, `${source}\n`, 'utf8');
  const artifact = `# WDK Documentation\n\nURL: https://docs.wdk.tether.io/sdk/community-modules/wdk-wallet-cosmos\n\n${source}\n\n***\n`;
  await writeFile(publicPath, artifact, 'utf8');
  await writeFile(distPath, artifact, 'utf8');
  await writeFile(path.join(docsRoot, 'sdk/core-module/index.mdx'), '---\ntitle: Core\n---\n', 'utf8');

  const errors = await validateAllModulesFeed({ sourcePath, publicPath, distPath, docsRoot });

  assert.deepEqual(errors, []);
});

test('rejects a duplicated feed and missing internal documentation route', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'wdk-all-modules-feed-'));
  const sourcePath = path.join(root, 'content/feeds/all-modules.md');
  const publicPath = path.join(root, 'public/llms-full.txt');
  const distPath = path.join(root, 'dist/llms-full.txt');
  const docsRoot = path.join(root, 'content/docs');
  const source = [
    '## All Modules',
    'URL: https://wdk.tether.io/developers/blocks',
    '',
    '[Missing docs](/sdk/missing/)',
    '',
    '## Community Modules',
    '',
    '| Module | Category | Description | Documentation |',
  ].join('\n');
  const duplicated = `${source}\n\n***\n\n${source}\n\n***\n\n`;

  await mkdir(path.dirname(sourcePath), { recursive: true });
  await mkdir(path.dirname(publicPath), { recursive: true });
  await mkdir(path.dirname(distPath), { recursive: true });
  await mkdir(docsRoot, { recursive: true });
  await writeFile(sourcePath, `${source}\n`, 'utf8');
  await writeFile(publicPath, duplicated, 'utf8');
  await writeFile(distPath, duplicated, 'utf8');

  const errors = await validateAllModulesFeed({ sourcePath, publicPath, distPath, docsRoot });

  assert(errors.some((error) => error.includes('missing documentation route: /sdk/missing/')));
  assert(errors.some((error) => error.includes('must include the community-module table')));
  assert(errors.some((error) => error.includes('public llms-full artifact must contain exactly one')));
  assert(errors.some((error) => error.includes('built llms-full artifact must contain exactly one')));
});
