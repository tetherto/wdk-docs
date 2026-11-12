import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { createIndexerReference } from '../../src/lib/indexer-reference.mjs';
import { curlTemplate, renderReference, validateReference } from '../indexer-openapi.mjs';
import { operationAnchors } from '../../src/lib/indexer-operation-anchor.mjs';

const raw = await readFile(new URL('../../public/assets/indexer-api/openapi.json', import.meta.url), 'utf8');
const provenance = JSON.parse(await readFile(new URL('../../public/assets/indexer-api/openapi.provenance.json', import.meta.url), 'utf8'));

test('Scalar presentation preserves every contract definition and uses the existing cURL templates', () => {
  const original = JSON.parse(raw);
  const { operations, server, issues } = validateReference(raw, provenance);
  const { document: reference, operations: views } = createIndexerReference(raw, provenance);
  assert.equal(views.length, operations.length);
  const native = renderReference(raw, provenance);
  assert.equal(operations.length, 14);
  assert.equal(issues.length, 24);
  assert.deepEqual(reference.servers, [{ url: server }]);
  for (const operation of operations) {
    const view = views.find((item) => item.endpoint === operation.endpoint && item.method === operation.method);
    assert.ok(view);
    assert.deepEqual(Object.keys(view.document.paths), [operation.endpoint]);
    assert.deepEqual(Object.keys(view.document.paths[operation.endpoint]).filter((key) => key !== 'parameters'), [operation.method]);
    assert.deepEqual(view.document.paths[operation.endpoint][operation.method], reference.paths[operation.endpoint][operation.method]);
    assert.deepEqual(view.document.components, reference.components);
    assert.deepEqual(view.document.security, reference.security);
    assert.deepEqual(view.document.paths[operation.endpoint].parameters, reference.paths[operation.endpoint].parameters);
    const shown = reference.paths[operation.endpoint][operation.method];
    const samples = shown['x-codeSamples'];
    assert.equal(samples.length, 1);
    assert.deepEqual(samples[0], { lang: 'bash', label: 'cURL template', source: curlTemplate(operation, server) });
    assert.ok(native.includes('```bash\n' + samples[0].source + '\n```'));
    assert.equal(samples[0].source.includes('X-API-KEY'), Boolean(operation.auth));
    assert.equal(samples[0].source.includes('--data-binary @request.json'), Boolean(operation.operation.requestBody));
    delete shown['x-codeSamples'];
  }
  delete reference.servers;
  delete original.servers;
  assert.deepEqual(reference, original, 'only server context and cURL presentation metadata may be added');
  assert.equal(Object.keys(reference.paths['/api/v1/wallets'].post.responses).length, 8);
});

test('presentation fails closed when the snapshot and provenance no longer match', () => {
  assert.throws(() => createIndexerReference(raw + ' ', provenance), /hash|digest|SHA/i);
});

test('endpoint selector retains the native collision suffix when routes share an anchor', () => {
  assert.deepEqual(operationAnchors([
    { method: 'get', endpoint: '/api/v1/a/b' },
    { method: 'get', endpoint: '/api/v1/ab' },
    { method: 'post', endpoint: '/api/v1/ab' },
  ]), ['get-apiv1ab', 'get-apiv1ab-1', 'post-apiv1ab']);
});
