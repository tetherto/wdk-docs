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
  assert.equal(urlToMarkdownRelativePath('/sdk/get-started'), 'sdk/get-started.md');
});

test('tolerates duplicate leading slashes and trailing slashes', () => {
  assert.equal(urlToMarkdownRelativePath('//sdk/get-started/'), 'sdk/get-started.md');
});

test('rejects empty and non-string URLs', () => {
  assert.throws(() => urlToMarkdownRelativePath(''), /Invalid manifest entry url/);
  assert.throws(() => urlToMarkdownRelativePath(undefined), /Invalid manifest entry url/);
});

test('rejects unsafe URL paths', () => {
  assert.throws(() => urlToMarkdownRelativePath('/sdk/../outside'), /Invalid manifest entry url path/);
  assert.throws(() => urlToMarkdownRelativePath('/sdk//get-started'), /Invalid manifest entry url path/);
  assert.throws(() => urlToMarkdownRelativePath('/sdk/get-started?raw=1'), /Invalid manifest entry url/);
  assert.throws(() => urlToMarkdownRelativePath('/sdk/get-started#section'), /Invalid manifest entry url/);
});
