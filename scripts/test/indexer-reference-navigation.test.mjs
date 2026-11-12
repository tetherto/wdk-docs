import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveIndexerReferenceTarget, revealIndexerReference } from '../../src/lib/indexer-reference-navigation.ts';

const route = '/tools/indexer-api/api-reference';
const current = `https://docs.wdk.tether.io${route}/`;
const known = new Set(['post-apiv1wallets', 'get-apiv1walletswalletid', 'authentication']);

test('resolves existing reference anchors on the current canonical page', () => {
  for (const href of [
    '#post-apiv1wallets',
    `${route}#post-apiv1wallets`,
    `${route}/#post-apiv1wallets`,
    `${route}/?source=search#post-apiv1wallets`,
    `${current}?source=search#post-apiv1wallets`,
    '#post%2Dapiv1wallets',
  ]) assert.equal(resolveIndexerReferenceTarget(href, current, known), 'post-apiv1wallets', href);
  assert.equal(resolveIndexerReferenceTarget('#get-apiv1walletswalletid', `${current}?source=docs`, known), 'get-apiv1walletswalletid');
  assert.equal(resolveIndexerReferenceTarget('#authentication', current, known), 'authentication');
});

test('does not reveal another document, external location, or unknown target', () => {
  for (const href of [
    '/sdk/core-module/#post-apiv1wallets',
    '/tools/indexer-api/sdk-api-reference/#post-apiv1wallets',
    '/tools/indexer-api/api-reference-extra/#post-apiv1wallets',
    `${route}//#post-apiv1wallets`,
    `https://example.com${route}/#post-apiv1wallets`,
    `https://docs.wdk.tether.io@example.com${route}/#post-apiv1wallets`,
    `http://docs.wdk.tether.io${route}/#post-apiv1wallets`,
    `//example.com${route}/#post-apiv1wallets`,
    'javascript:alert(1)',
    '#unknown-operation',
    '#POST-apiv1wallets',
    '#post%252Dapiv1wallets',
    '#',
    '',
  ]) assert.equal(resolveIndexerReferenceTarget(href, current, known), null, href);
  assert.equal(resolveIndexerReferenceTarget(`${route}/#post-apiv1wallets`, 'https://docs.wdk.tether.io/sdk/core-module/', known), null);
});

test('resolves Scalar operation permalinks only to known native operations', () => {
  for (const href of [
    '#tag/wallets/post-apiv1wallets',
    '#tag/nested/group/post-apiv1wallets',
    '#tag/post-apiv1wallets',
    '#tag%2Fwallets%2Fpost-apiv1wallets',
  ]) assert.equal(resolveIndexerReferenceTarget(href, current, known), 'post-apiv1wallets', href);
  assert.equal(resolveIndexerReferenceTarget('#tag/wallets/get-apiv1walletswalletid', current, known), 'get-apiv1walletswalletid');
  for (const href of [
    '#other/wallets/post-apiv1wallets',
    '#tag/wallets/authentication',
    '#tag/wallets/post-apiv1unknown',
    '#tag/wallets/POST-apiv1wallets',
    '#tag/wallets/post-apiv1wallets/unknown',
    '#tag/wallets/',
    '#tag/wallets/%E0%A4%A',
    `https://example.com${route}/#tag/wallets/post-apiv1wallets`,
  ]) assert.equal(resolveIndexerReferenceTarget(href, current, known), null, href);
});

test('handles malformed URLs and fragment escapes without throwing', () => {
  for (const href of ['http://[invalid', '#%', '#%E0%A4%A']) {
    assert.equal(resolveIndexerReferenceTarget(href, current, known), null, href);
  }
  assert.equal(resolveIndexerReferenceTarget('#post-apiv1wallets', 'not a URL', known), null);
});

test('navigation helper is safe to import and call during server rendering', () => {
  assert.equal(revealIndexerReference('#post-apiv1wallets'), false);
});
