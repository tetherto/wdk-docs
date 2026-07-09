import test from 'node:test';
import assert from 'node:assert/strict';

import { urlToMarkdownRelativePath } from '../generate-llm-md-files.mjs';

test('maps the home page to index.md', () => {
  assert.equal(urlToMarkdownRelativePath('/'), 'index.md');
});

test('maps a top-level docs page to a sibling markdown file', () => {
  assert.equal(urlToMarkdownRelativePath('/sdk'), 'sdk.md');
});

test('maps a nested docs page to <path>.md', () => {
  assert.equal(urlToMarkdownRelativePath('/sdk/all-modules'), 'sdk/all-modules.md');
});

test('tolerates duplicate leading slashes and trailing slashes', () => {
  assert.equal(urlToMarkdownRelativePath('//sdk/all-modules/'), 'sdk/all-modules.md');
});

test('rejects empty and non-string URLs', () => {
  assert.throws(() => urlToMarkdownRelativePath(''), /Invalid manifest entry url/);
  assert.throws(() => urlToMarkdownRelativePath(undefined), /Invalid manifest entry url/);
});

test('rejects unsafe URL paths', () => {
  assert.throws(() => urlToMarkdownRelativePath('/sdk/../outside'), /Invalid manifest entry url path/);
  assert.throws(() => urlToMarkdownRelativePath('/sdk//all-modules'), /Invalid manifest entry url path/);
  assert.throws(() => urlToMarkdownRelativePath('/sdk/all-modules?raw=1'), /Invalid manifest entry url/);
  assert.throws(() => urlToMarkdownRelativePath('/sdk/all-modules#section'), /Invalid manifest entry url/);
});
