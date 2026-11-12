import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { structure } from 'fumadocs-core/mdx-plugins/remark-structure';
import { validateTokenSymbols } from '../check-token-symbols.mjs';
import { END, parseJson, renderReference, replaceReference, SOURCE_URL, START, validateReference } from '../indexer-openapi.mjs';

const raw = readFileSync(new URL('../../public/assets/indexer-api/openapi.json', import.meta.url), 'utf8');
const provenance = parseJson(readFileSync(new URL('../../public/assets/indexer-api/openapi.provenance.json', import.meta.url), 'utf8'));
const snapshot = parseJson(raw);
const digest = (value) => createHash('sha256').update(value).digest('hex');
const fixture = () => structuredClone(snapshot);
const endpoint = '/api/v1/{blockchain}/{token}/{address}/token-balances';
function render(document, receipt = provenance) {
  const input = JSON.stringify(document);
  return renderReference(input, { ...receipt, sha256: digest(input) });
}
function jsonBlocks(output) {
  return [...output.matchAll(/(`{3,})json(?:[ \t]+[^\n]*)?\n([\s\S]*?)\n\1(?=\n)/g)]
    .map((match) => parseJson(match[2]));
}
function withoutFences(output) {
  return output.replace(/(`{3,})[^\n]*\n[\s\S]*?\n\1(?=\n)/g, '')
    .replace(/\\([\\`*_{}[\]|#$])/g, '$1');
}
function definitions(output) {
  return [...output.matchAll(/^<details>\n[\s\S]*?\n<\/details>$/gm)].map(([details]) => {
    assert.match(details, /^`{3,}json plain$/m);
    const blocks = jsonBlocks(details);
    assert.equal(blocks.length, 1, 'each disclosure contains one complete endpoint definition');
    return blocks[0];
  });
}
function definition(output, path, method = 'GET') {
  return definitions(output).find((block) => block.path === path && block.method === method);
}

test('all source operations, request bodies, parameters and response media are represented without mutation', () => {
  const output = renderReference(raw, provenance);
  const expected = [];
  let count = 0;
  for (const [path, item] of Object.entries(snapshot.paths)) for (const [method, operation] of Object.entries(item)) {
    if (method === 'parameters') continue;
    count += 1;
    const heading = `### ${method.toUpperCase()} ${path.replace(/[{}]/g, '\\$&')}`;
    assert.equal(output.split('\n').filter((line) => line === heading).length, 1, heading);
    const security = operation.security ?? snapshot.security ?? [];
    expected.push({
      method: method.toUpperCase(), path, operation, pathParameters: item.parameters ?? [], security,
      securitySchemes: Object.fromEntries(security.flatMap((requirement) => Object.keys(requirement))
        .map((name) => [name, snapshot.components.securitySchemes[name]])),
    });
  }
  assert.deepEqual(definitions(output), expected);
  assert.equal((output.match(/^<details>$/gm) ?? []).length, count);
  assert.equal((output.match(/^<\/details>$/gm) ?? []).length, count);
  assert.doesNotMatch(output, /^#{4,6} /m);
  assert.equal(digest(raw), provenance.sha256);
  assert.ok(validateReference(raw, provenance).issues.length <= 24);
  assert.match(output, /sparkIdentityKey/);
  assert.ok(output.includes('addresses'));
  assert.match(output, /propertyNames/);
  assert.match(output, /HTTP 503/);
});

test('compact field tables retain searchable nested names and plain-language constraints', () => {
  const output = withoutFences(renderReference(raw, provenance));
  const required = output.split('\n').find((line) => line.startsWith('|') && line.includes('meta.spark.sparkIdentityKey'));
  assert.ok(required);
  assert.match(required, /\| string \|[^\n]*\*\*Required\.\*\*/);
  const amount = output.split('\n').find((line) => line.startsWith('|') && line.includes('tokenBalance.amount'));
  assert.ok(amount);
  assert.match(amount, /\| string \|/);
  assert.match(output, /Max items[^\n]*` 10 `/i);
  assert.match(output, /walletId/);
  assert.doesNotMatch(output, /Listed in local required|Not listed|Constraints \|/);
});

test('request templates cover every operation without inventing complete payload examples', () => {
  const output = renderReference(raw, provenance);
  const tree = unified().use(remarkParse).use(remarkGfm).parse(output);
  const code = tree.children.filter((node) => node.type === 'code');
  const requests = code.filter((node) => /^curl\b/.test(node.value));
  const operations = validateReference(raw, provenance).operations;
  assert.equal(requests.length, operations.length);
  const expectedExamples = [];
  for (const { method, endpoint: path, operation, auth } of operations) {
    const request = requests.find((node) => node.value.includes(path) && node.value.includes(method.toUpperCase()));
    assert.ok(request, `${method.toUpperCase()} ${path} needs a request template`);
    assert.ok(request.value.includes(`https://wdk-api.tether.io${path}`));
    assert.equal(request.value.includes('X-API-KEY'), Boolean(auth));
    assert.equal(/--data-binary\s+['"]?@request\.json/.test(request.value), Boolean(operation.requestBody));
    assert.ok(request.value.includes(`'https://wdk-api.tether.io${path}'`), 'request URL is shell-quoted');
    assert.ok(!request.value.includes('\\n'), 'line continuations use real newlines');
    if (auth) {
      assert.ok(request.value.includes("--header 'X-API-KEY: <api-key>'"));
      assert.ok(request.value.includes(' \\\n  --header'), 'multiline request remains one shell command');
    }
    const success = Object.entries(operation.responses).find(([status]) => /^2/.test(status))?.[1];
    for (const media of [...Object.values(operation.requestBody?.content ?? {}), ...Object.values(success?.content ?? {})]) {
      if (Object.hasOwn(media, 'example')) expectedExamples.push(media.example);
      else if (Object.hasOwn(media.schema, 'example')) expectedExamples.push(media.schema.example);
    }
  }
  const examples = jsonBlocks(output.replace(/^<details>\n[\s\S]*?\n<\/details>$/gm, ''));
  assert.deepEqual(examples, expectedExamples, 'complete payload examples must come from the export');
});

test('renders source-provided media and schema examples while preserving their exact definitions', () => {
  const document = fixture();
  const request = document.paths['/api/v1/wallets/{walletId}'].patch.requestBody.content['application/json'];
  const response = document.paths[endpoint].get.responses['200'].content['application/json'];
  request.example = { name: 'Wallet label' };
  request.schema.example = { name: 'Schema fallback' };
  response.schema.example = { tokenBalance: { amount: '17' } };
  const output = render(document);
  const examples = jsonBlocks(output.replace(/^<details>\n[\s\S]*?\n<\/details>$/gm, ''));
  assert.deepEqual(examples, [response.schema.example, request.example]);
  assert.deepEqual(definition(output, endpoint).operation.responses['200'].content['application/json'], response);
  assert.deepEqual(definition(output, '/api/v1/wallets/{walletId}', 'PATCH').operation.requestBody.content['application/json'], request);
});

test('duplicate JSON keys including escaped keys fail before overwrite, while separate scopes are valid', () => {
  for (const input of ['{"a":1,"a":2}', '{"outer":{"x":0,"x":1}}', String.raw`{"a":1,"\u0061":2}`]) {
    assert.throws(() => parseJson(input), /Duplicate JSON key/);
  }
  assert.deepEqual(parseJson('[{"a":1},{"a":2}]'), [{ a: 1 }, { a: 2 }]);
  assert.deepEqual(parseJson('{"quoted\\\"key":[true,false,null,-1.5e2,"x,y:z"]}'), { 'quoted"key': [true, false, null, -150, 'x,y:z'] });
  assert.throws(() => parseJson('{'), SyntaxError);
  assert.throws(() => parseJson('['.repeat(102) + '0' + ']'.repeat(102)), /nesting/);
});

test('rejects foreign source, mismatched hash, invalid health metadata and invalid JSON', () => {
  for (const receipt of [null, {}, { ...provenance, sourceUrl: 'https://wdk-api.tether.su/docs/json' },
    { ...provenance, sourceUrl: `${SOURCE_URL}?token=secret` }, { ...provenance, sha256: '0'.repeat(64) },
    { ...provenance, retrievedAt: 'yesterday' }, { ...provenance, health: { ...provenance.health, httpStatus: 401 } },
    { ...provenance, health: { ...provenance.health, sourceUrl: 'https://example.com' } },
  ]) assert.throws(() => renderReference(raw, receipt));
  assert.throws(() => renderReference('{', provenance));
  for (const status of [200, 503]) assert.doesNotThrow(() => render(fixture(), { ...provenance, health: { ...provenance.health, httpStatus: status } }));
});

test('preserves reviewed dialect defects and blocks added or altered defects without hiding upstream fixes', () => {
  const added = fixture();
  added.paths[endpoint].get.responses['200'].content['application/json'].schema.properties.unreviewed = { type: 'null' };
  assert.throws(() => render(added), /Unreviewed OpenAPI compatibility/);
  const altered = fixture();
  altered.paths['/api/v1/wallets'].post.requestBody.content['application/json'].schema.items.properties.addresses.propertyNames.enum.push('new-network');
  assert.throws(() => render(altered), /Unreviewed OpenAPI compatibility/);
  const fixed = fixture();
  fixed.paths['/api/v1/wallets'].post.requestBody.content['application/json'].schema.items.properties.addresses.propertyNames = undefined;
  assert.doesNotThrow(() => render(fixed));
  const unknown = fixture();
  unknown.paths[endpoint].get.parameters[0].schema.unevaluatedProperties = false;
  assert.throws(() => render(unknown), /Unsupported feature/);
});

test('inherits path parameters and lets the operation override the same parameter, rejecting ambiguous scopes', () => {
  const document = fixture();
  document.paths[endpoint].parameters = [{ name: 'blockchain', in: 'path', required: true, schema: { type: 'string', enum: ['inherited'] } },
    { name: 'cursor', in: 'query', schema: { type: 'string' } }];
  const validated = validateReference(JSON.stringify(document), { ...provenance, sha256: digest(JSON.stringify(document)) });
  const operation = validated.operations.find((item) => item.endpoint === endpoint);
  assert.equal(operation.params.filter((item) => item.name === 'blockchain').length, 1);
  assert.deepEqual(operation.params[0].schema, snapshot.paths[endpoint].get.parameters[0].schema);
  const output = render(document);
  assert.match(withoutFences(output), /\|[^\n]*cursor[^\n]*query[^\n]*\| string \|/i);
  const exact = definition(output, endpoint);
  assert.deepEqual(exact.pathParameters, document.paths[endpoint].parameters);
  assert.deepEqual(exact.operation.parameters, document.paths[endpoint].get.parameters);
  document.paths[endpoint].get.parameters.push(document.paths[endpoint].get.parameters[0]);
  assert.throws(() => render(document), /Duplicate parameter/);
  const missing = fixture();
  missing.paths[endpoint].get.parameters[0].required = false;
  assert.throws(() => render(missing), /path parameter/);
});

test('security inheritance and explicit anonymous override remain distinct; unsupported alternatives fail', () => {
  const document = fixture();
  document.security = [{ ApiKeyAuth: [] }];
  document.paths['/api/v1/health'].get.security = [];
  delete document.paths[endpoint].get.security;
  const output = render(document);
  const health = output.slice(output.indexOf('### GET /api/v1/health'), output.indexOf('### GET /api/v1/chains'));
  assert.match(health, /Public endpoint/);
  const validated = validateReference(JSON.stringify(document), { ...provenance, sha256: digest(JSON.stringify(document)) });
  assert.equal(validated.operations.find((item) => item.endpoint === endpoint).auth.name, 'ApiKeyAuth');
  assert.deepEqual(definition(output, endpoint).security, document.security);
  assert.deepEqual(definition(output, endpoint).securitySchemes, document.components.securitySchemes);
  assert.deepEqual(definition(output, '/api/v1/health').security, []);
  assert.deepEqual(definition(output, '/api/v1/health').securitySchemes, {});
  for (const security of [null, [{ ApiKeyAuth: ['scope'] }], [{ ApiKeyAuth: [] }, {}], [{ UnknownAuth: [] }]]) {
    const invalid = fixture(); invalid.paths[endpoint].get.security = security;
    assert.throws(() => render(invalid));
  }
  const invalidGlobal = fixture(); invalidGlobal.security = null;
  assert.throws(() => render(invalidGlobal));
});

test('rejects unrendered contract features, unresolved references, invalid bodies and invalid servers', () => {
  for (const mutate of [
    (d) => { d.paths[endpoint].get.callbacks = {}; },
    (d) => { d.paths[endpoint].servers = []; },
    (d) => { d.paths[endpoint].get.parameters[0].style = 'simple'; },
    (d) => { d.paths[endpoint].get.responses['200'].headers = {}; },
    (d) => { d.paths[endpoint].get.responses['200'].content['application/json'].schema = { $ref: '#/components/schemas/X' }; },
    (d) => { d.paths['/api/v1/wallets'].post.requestBody.required = 'true'; },
    (d) => { d.paths['/api/v1/wallets'].post.requestBody.content = {}; },
    (d) => { d.components.schemas.X = { type: 'string' }; },
    (d) => { d.servers = [{ url: 'https://credential@wdk-api.tether.io' }]; },
    (d) => { d.servers = [{ url: 'https://wdk-api.tether.io/api' }]; },
    (d) => { d.paths[endpoint].get.responses['999'] = { description: 'Invalid' }; },
    (d) => { d.paths[endpoint].get.responses['20X'] = { description: 'Invalid range' }; },
    (d) => { d.servers = null; },
    (d) => { d.components.securitySchemes.ApiKeyAuth.name = 'X-Key\\nInjected: value'; },
  ]) { const document = fixture(); mutate(document); assert.throws(() => render(document)); }
});

test('escapes contract prose, table fields and fence-like examples without losing raw JSON', () => {
  const document = fixture();
  document.paths[endpoint].get.summary = '# <script>{run()}</script> | [click](https://example.com)';
  document.paths[endpoint].get.parameters[0].schema.description = '``` </details> $math$';
  const output = render(document);
  assert.ok(output.includes('\\# &lt;script&gt;\\{run()\\}&lt;/script&gt;'));
  assert.ok(output.includes('````json plain'));
  assert.deepEqual(definition(output, endpoint).operation.parameters[0].schema.description,
    '``` </details> $math$');
});

test('allows additive supported operations and changed request constraints without a hardcoded inventory', () => {
  const document = fixture();
  document.paths['/api/v1/new-operation'] = { get: { summary: 'New operation', responses: { '204': { description: 'No content' } } } };
  document.paths['/api/v1/batch/token-balances'].post.requestBody.content['application/json'].schema.maxItems = 20;
  const output = render(document);
  assert.match(output, /### GET \/api\/v1\/new-operation/);
  assert.match(withoutFences(output), /Max items[^\n]*` 20 `/i);
  assert.deepEqual(definition(output, '/api/v1/new-operation').operation.responses,
    { '204': { description: 'No content' } });
  assert.match(withoutFences(output), /204/);
});

test('endpoint index links follow actual heading anchors when valid paths have duplicate slugs', () => {
  const document = fixture();
  const paths = ['/api/v1/a/b', '/api/v1/ab', '/api/v1/ab-1'];
  for (const [index, path] of paths.entries()) document.paths[path] = {
    get: { summary: `Duplicate slug ${index}`, responses: { '204': { description: 'No content' } } },
  };
  const output = render(document);
  const headings = structure(output).headings;
  const anchors = paths.map((path) => headings.find((heading) => heading.content === `GET ${path}`)?.id);
  assert.equal(new Set(anchors).size, paths.length);
  for (const [index, anchor] of anchors.entries()) {
    assert.ok(anchor);
    assert.ok(output.includes(`[Duplicate slug ${index}](#${anchor})`));
  }
});

test('replacement preserves curated page content and fails on ambiguous markers', () => {
  const generated = renderReference(raw, provenance);
  const page = `curated intro\n${START}\nold\n${END}\n<SupportCards />`;
  const replaced = replaceReference(page, generated);
  assert.equal(replaced, `curated intro\n${generated}\n<SupportCards />`);
  assert.equal(replaceReference(replaced, generated), replaced);
  assert.equal(renderReference(raw, provenance), generated);
  for (const invalid of ['', `${END}${START}`, `${START}${START}${END}`, `${START}${END}${END}`]) {
    assert.throws(() => replaceReference(invalid, generated), /exactly one/);
  }
});


test('renders one Base URL and preserves the prior endpoint index and operation heading text', () => {
  const output = renderReference(raw, provenance);
  assert.equal(output.split('\n').filter((line) => line === '## Base URL').length, 1);
  assert.ok(output.includes('## Base URL\n\n```text\nhttps://wdk-api.tether.io\n```'));
  assert.ok(output.includes('## API Endpoints\n'));
  assert.ok(output.indexOf('## Authentication\n') < output.indexOf('### GET /api/v1/health'));
  assert.doesNotMatch(output, /Deployment version observed separately|schema-format incompatibilities|full OpenAPI conformance|Listed in local required/);
  assert.ok(output.includes('/assets/indexer-api/openapi.provenance.json'));
  for (const servers of [[], [{ url: '/' }], [{ url: 'https://wdk-api.tether.io/' }]]) {
    const document = fixture(); document.servers = servers;
    assert.ok(render(document).includes('```text\nhttps://wdk-api.tether.io\n```'));
  }
});

test('schema composition retains branch constraints without claiming global optionality', () => {
  const document = fixture();
  document.paths['/api/v1/wallets/{walletId}'].patch.requestBody.content['application/json'].schema = {
    type: 'object', properties: { name: { type: 'string' } }, allOf: [{ required: ['name'] }],
  };
  const output = render(document);
  const exact = definition(output, '/api/v1/wallets/{walletId}', 'PATCH');
  assert.deepEqual(exact.operation.requestBody, document.paths['/api/v1/wallets/{walletId}'].patch.requestBody);
  const visible = withoutFences(output).split('### PATCH /api/v1/wallets/{walletId}')[1].split('\n### ')[0];
  const row = visible.split('\n').find((line) => /\|[^\n]*name[^\n]*\| string \|/.test(line));
  assert.ok(row, 'composed request property remains searchable');
  assert.doesNotMatch(row, /optional|Required: No|\*\*Required\.\*\*/i);
  assert.doesNotMatch(visible, /Listed in local required|Not listed/);
});

test('rejects malformed enums and unrecognized top-level, info and parameter features', () => {
  for (const enumValues of [[], ['ethereum', 'ethereum'], [false], [{ key: 'value' }], [null]]) {
    const document = fixture(); document.paths[endpoint].get.parameters[0].schema.enum = enumValues;
    assert.throws(() => render(document), /enum|Enum/);
  }
  for (const mutate of [
    (d) => { d.externalDocs = { url: 'https://example.com' }; },
    (d) => { d.info.license = { name: 'unknown' }; },
    (d) => { d.paths[endpoint].get.parameters[0].allowEmptyValue = true; },
  ]) { const document = fixture(); mutate(document); assert.throws(() => render(document), /Unsupported feature/); }
});


test('constraint machine values pass the existing token checker without exemptions', () => {
  assert.deepEqual(validateTokenSymbols(renderReference(raw, provenance)), []);
});

test('GFM tables preserve injected constraint literals as code without creating cells or HTML', () => {
  const document = fixture();
  const value = '`` | <img src=x onerror=unsafe()> {run()}\nsecond line';
  document.paths[endpoint].get.responses['200'].content['application/json'].schema.properties['unsafe | <b>{run()}</b>'] = {
    type: 'string', default: value,
  };
  const output = render(document);
  const tree = unified().use(remarkParse).use(remarkGfm).parse(output);
  const nodes = (node) => [node, ...(node.children ?? []).flatMap(nodes)];
  const all = nodes(tree);
  const row = all.find((node) => node.type === 'tableRow' && nodes(node.children[0]).some((child) => child.value?.includes('unsafe | <b>')));
  assert.ok(row);
  assert.equal(row.children.length, 3);
  const code = nodes(row.children[2]).filter((node) => node.type === 'inlineCode').map((node) => node.value);
  assert.ok(code.includes(JSON.stringify(value)));
  assert.ok(!all.some((node) => node.type === 'html' && node.value.includes('onerror')));
  assert.equal(definition(output, endpoint).operation.responses['200'].content['application/json'].schema.properties['unsafe | <b>{run()}</b>'].default, value);
});


test('rejects lossy numeric literals before rendering nested schema examples while preserving finite decimals', () => {
  const document = fixture();
  document.paths[endpoint].get.responses['200'].content['application/json'].schema.example = 'NUMERIC_LITERAL';
  for (const literal of ['1e999', '-1e999', '9007199254740993', '-9007199254740993']) {
    const input = JSON.stringify(document).replace('"NUMERIC_LITERAL"', literal);
    assert.throws(() => renderReference(input, { ...provenance, sha256: digest(input) }), /non-finite or unsafe integer JSON number/);
  }
  assert.deepEqual(parseJson('[0.1,-0.001,1.25e2,9007199254740991]'), [0.1, -0.001, 125, Number.MAX_SAFE_INTEGER]);
});

test('rejects decimal rounding and underflow in constraints before schema validation can normalize them', () => {
  const document = fixture();
  const properties = document.paths[endpoint].get.responses['200'].content['application/json'].schema.properties;
  for (const [type, keyword, literals] of [
    ['number', 'minimum', ['1e-999', '-1e-999', '0.10000000000000001', '-0.10000000000000001', '1e-999999999999999999999']],
    ['string', 'minLength', ['1.0000000000000001']],
  ]) {
    properties.precision = { type, [keyword]: 'RAW_NUMBER' };
    for (const literal of literals) {
      const input = JSON.stringify(document).replace('"RAW_NUMBER"', literal);
      assert.throws(() => renderReference(input, { ...provenance, sha256: digest(input) }),
        new RegExp(`lossy JSON number at /paths/.*?/properties/precision/${keyword}`));
    }
  }
  assert.deepEqual(parseJson('[1.000e0,0.10,125e-3,-0.00100,1E+02,1e-7,0e99999999999999999999,-0]'),
    [1, 0.1, 0.125, -0.001, 100, 1e-7, 0, -0]);
  assert.throws(() => parseJson('{"a/b~c":[0.10000000000000001]}'), /lossy JSON number at \/a~1b~0c\/0/);
  assert.throws(() => parseJson(`1.${'0'.repeat(50_000)}1`), /lossy JSON number at \//);
});
