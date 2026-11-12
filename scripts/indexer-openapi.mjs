import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

export const SOURCE_URL = 'https://wdk-api.tether.io/docs/json';
export const START = '{/* indexer-openapi:start */}';
export const END = '{/* indexer-openapi:end */}';
const compatibility = JSON.parse(readFileSync(new URL('./indexer-openapi-compatibility.json', import.meta.url), 'utf8'));
const METHODS = new Set(['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace']);
const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const fail = (message) => { throw new Error(message); };
const pointer = (base, key) => `${base}/${String(key).replaceAll('~', '~0').replaceAll('/', '~1')}`;

// Compare decimal values without expanding exponents or requiring exact binary fractions.
function decimalValue(literal) {
  const [, sign, whole, fraction = '', exponent = '0'] = /^(-?)(\d+)(?:\.(\d+))?(?:e([+-]?\d+))?$/i.exec(literal);
  const digits = whole + fraction;
  let start = 0;
  let end = digits.length;
  while (digits[start] === '0') start += 1;
  if (start === end) return '0';
  while (digits[end - 1] === '0') end -= 1;
  const power = Number(exponent);
  if (!Number.isSafeInteger(power)) return null;
  return `${sign}${digits.slice(start, end)}e${power - fraction.length + digits.length - end}`;
}

// JSON.parse validates syntax; this pass rejects overwritten keys and rounded numeric values.
export function parseJson(raw) {
  if (typeof raw !== 'string' || Buffer.byteLength(raw) > 2_000_000) fail('Expected JSON text below 2 MB');
  const value = JSON.parse(raw);
  const tokens = raw.match(/"(?:\\.|[^"\\])*"|[{}\[\],:]|[^\s{}\[\],:]+/g) ?? [];
  let index = 0;
  function visit(depth = 0, location = '') {
    if (depth > 100) fail('JSON nesting exceeds 100 levels');
    const token = tokens[index++];
    if (token === '{') {
      const keys = new Set();
      while (tokens[index] !== '}') {
        const key = JSON.parse(tokens[index++]);
        if (keys.has(key)) fail(`Duplicate JSON key: ${key}`);
        keys.add(key);
        index += 1;
        visit(depth + 1, pointer(location, key));
        if (tokens[index] === ',') index += 1;
      }
      index += 1;
    } else if (token === '[') {
      let item = 0;
      while (tokens[index] !== ']') {
        visit(depth + 1, pointer(location, item++));
        if (tokens[index] === ',') index += 1;
      }
      index += 1;
    } else if (token[0] !== '"' && !['true', 'false', 'null'].includes(token)) {
      const number = Number(token);
      if (!Number.isFinite(number) || (Number.isInteger(number) && !Number.isSafeInteger(number))) {
        fail('Unsupported non-finite or unsafe integer JSON number');
      }
      if (decimalValue(token) !== decimalValue(JSON.stringify(number))) {
        fail(`Unsupported lossy JSON number at ${location || '/'}`);
      }
    }
  }
  visit();
  return value;
}

function keys(value, allowed, location) {
  if (!isObject(value)) fail(`Expected object at ${location}`);
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key)) fail(`Unsupported feature ${pointer(location, key)}`);
  }
}
function string(value, location) {
  if (typeof value !== 'string' || !value.trim()) fail(`Expected nonempty text at ${location}`);
}
function stringArray(value, location) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string' || !item.trim()) || new Set(value).size !== value.length) {
    fail(`Expected unique text array at ${location}`);
  }
}
function text(value) {
  return String(value).replace(/[&<>]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[character])
    .replace(/[\\`*_{}[\]|#$]/g, '\\$&').replace(/\s+/g, ' ').trim();
}
function jsonBlock(value, language = 'json') {
  const json = JSON.stringify(value, null, 2);
  const length = Array.from(json.matchAll(/`+/g)).reduce((longest, match) => Math.max(longest, match[0].length), 2) + 1;
  const fence = '`'.repeat(length);
  return `${fence}${language}\n${json}\n${fence}`;
}
function inlineCode(value) {
  const fence = '`'.repeat(Array.from(value.matchAll(/`+/g)).reduce((longest, match) => Math.max(longest, match[0].length), 0) + 1);
  return `${fence} ${value.replaceAll('|', '\\|')} ${fence}`;
}
function rawDetails(label, value) {
  // Large exact schemas need no token highlighting; keep their JSON intact for exports.
  return `<details>\n<summary>${text(label)}</summary>\n\n${jsonBlock(value, 'json plain')}\n\n</details>`;
}

function validateProvenance(raw, provenance) {
  const utc = (value) => typeof value === 'string'
    && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(value) && Number.isFinite(Date.parse(value));
  const digest = createHash('sha256').update(raw).digest('hex');
  if (provenance?.environment !== 'production' || provenance.sourceUrl !== SOURCE_URL
    || provenance.sha256 !== digest || !utc(provenance.retrievedAt)) fail('Invalid production source, SHA-256 or retrieval time');
  const health = provenance.health;
  if (health?.sourceUrl !== 'https://wdk-api.tether.io/api/v1/health' || !utc(health.checkedAt)
    || typeof health.deployedVersion !== 'string' || !health.deployedVersion.trim()
    || ![200, 503].includes(health.httpStatus) || typeof health.status !== 'string' || !health.status.trim()) {
    fail('Invalid production health provenance');
  }
}

const SCHEMA_KEYS = ['type', 'title', 'description', 'properties', 'items', 'required', 'additionalProperties',
  'oneOf', 'anyOf', 'allOf', 'enum', 'default', 'example', 'format', 'minLength', 'maxLength', 'pattern',
  'minimum', 'maximum', 'minItems', 'maxItems', 'minProperties', 'maxProperties', 'uniqueItems',
  'nullable', 'readOnly', 'writeOnly', 'deprecated', 'multipleOf', 'exclusiveMinimum', 'exclusiveMaximum', 'propertyNames'];
function validateSchema(schema, location, issues) {
  keys(schema, SCHEMA_KEYS, location);
  if (schema.type !== undefined && !['object', 'array', 'string', 'number', 'integer', 'boolean', 'null'].includes(schema.type)) fail(`Invalid schema type at ${location}`);
  for (const keyword of ['description', 'title', 'format', 'pattern']) if (schema[keyword] !== undefined && typeof schema[keyword] !== 'string') fail(`Invalid ${keyword} at ${location}`);
  for (const keyword of ['nullable', 'readOnly', 'writeOnly', 'deprecated', 'uniqueItems', 'exclusiveMinimum', 'exclusiveMaximum']) if (schema[keyword] !== undefined && typeof schema[keyword] !== 'boolean') fail(`Invalid ${keyword} at ${location}`);
  for (const keyword of ['minLength', 'maxLength', 'minItems', 'maxItems', 'minProperties', 'maxProperties']) if (schema[keyword] !== undefined && (!Number.isInteger(schema[keyword]) || schema[keyword] < 0)) fail(`Invalid ${keyword} at ${location}`);
  for (const keyword of ['minimum', 'maximum', 'multipleOf']) if (schema[keyword] !== undefined && (typeof schema[keyword] !== 'number' || !Number.isFinite(schema[keyword]) || (keyword === 'multipleOf' && schema[keyword] <= 0))) fail(`Invalid ${keyword} at ${location}`);
  if (schema.required !== undefined) stringArray(schema.required, `${location}/required`);
  if (schema.enum !== undefined) {
    if (!Array.isArray(schema.enum) || !schema.enum.length || schema.enum.some((value) => value !== null && !['string', 'number', 'boolean'].includes(typeof value))) fail(`Unsupported or invalid enum at ${location}`);
    if (new Set(schema.enum.map((value) => JSON.stringify(value))).size !== schema.enum.length) fail(`Duplicate enum values at ${location}`);
    for (const value of schema.enum) {
      const matches = !schema.type || (value === null ? schema.type === 'null' || schema.nullable === true
        : schema.type === 'integer' ? Number.isSafeInteger(value)
          : schema.type === 'number' ? typeof value === 'number' && Number.isFinite(value) : typeof value === schema.type);
      if (!matches) fail(`Enum does not match schema type at ${location}`);
    }
  }
  if (schema.type === 'null') issues.push({ pointer: `${location}/type`, keyword: 'type', value: 'null' });
  if (schema.propertyNames !== undefined) {
    keys(schema.propertyNames, ['enum'], `${location}/propertyNames`);
    stringArray(schema.propertyNames.enum, `${location}/propertyNames/enum`);
    issues.push({ pointer: `${location}/propertyNames`, keyword: 'propertyNames', value: schema.propertyNames });
  }
  if (schema.properties !== undefined) {
    if (!isObject(schema.properties)) fail(`Invalid properties at ${location}`);
    for (const [name, child] of Object.entries(schema.properties)) validateSchema(child, pointer(`${location}/properties`, name), issues);
  }
  if (schema.items !== undefined) validateSchema(schema.items, `${location}/items`, issues);
  if (schema.type === 'array' && schema.items === undefined) fail(`Missing array items at ${location}`);
  if (schema.additionalProperties !== undefined && typeof schema.additionalProperties !== 'boolean') validateSchema(schema.additionalProperties, `${location}/additionalProperties`, issues);
  for (const keyword of ['oneOf', 'anyOf', 'allOf']) if (schema[keyword] !== undefined) {
    if (!Array.isArray(schema[keyword]) || !schema[keyword].length) fail(`Invalid ${keyword} at ${location}`);
    schema[keyword].forEach((child, index) => validateSchema(child, `${location}/${keyword}/${index}`, issues));
  }
}
function media(content, location, issues) {
  if (!isObject(content) || !Object.keys(content).length) fail(`Missing media at ${location}`);
  for (const [type, value] of Object.entries(content)) {
    if (!/^[\w!#$&^.+*-]+\/[\w!#$&^.+*-]+$/.test(type)) fail(`Invalid media type at ${location}`);
    keys(value, ['schema', 'example'], pointer(location, type));
    validateSchema(value.schema, `${pointer(location, type)}/schema`, issues);
  }
}
function authentication(document, operation, location) {
  const requirements = Object.hasOwn(operation, 'security') ? operation.security
    : Object.hasOwn(document, 'security') ? document.security : [];
  if (!Array.isArray(requirements)) fail(`Invalid security at ${location}`);
  if (!requirements.length) return null;
  if (requirements.length !== 1 || !isObject(requirements[0])) fail(`Unsupported security alternatives at ${location}`);
  const entries = Object.entries(requirements[0]);
  if (entries.length !== 1 || !Array.isArray(entries[0][1]) || entries[0][1].length) fail(`Unsupported security requirement at ${location}`);
  const [name] = entries[0];
  const scheme = document.components?.securitySchemes?.[name];
  keys(scheme, ['type', 'in', 'name', 'description'], `/components/securitySchemes/${name}`);
  if (scheme.type !== 'apiKey' || scheme.in !== 'header') fail(`Unsupported authentication scheme: ${name}`);
  string(scheme.name, `security scheme ${name}`);
  if (!/^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/.test(scheme.name)) fail(`Invalid authentication header: ${name}`);
  return { name, scheme };
}
function parameters(pathItem, operation, endpoint, location, issues) {
  const result = new Map();
  for (const [scope, list] of [['path', pathItem.parameters], ['operation', operation.parameters]]) {
    if (list === undefined) continue;
    if (!Array.isArray(list)) fail(`Invalid parameters at ${location}`);
    const seen = new Set();
    for (const [index, parameter] of list.entries()) {
      const at = scope === 'path' ? `${location.slice(0, location.lastIndexOf('/'))}/parameters/${index}` : `${location}/parameters/${index}`;
      keys(parameter, ['name', 'in', 'required', 'description', 'schema'], at);
      string(parameter.name, at);
      if (!['path', 'query', 'header', 'cookie'].includes(parameter.in)) fail(`Invalid parameter location at ${at}`);
      if (parameter.required !== undefined && typeof parameter.required !== 'boolean') fail(`Invalid required flag at ${at}`);
      if (parameter.description !== undefined && typeof parameter.description !== 'string') fail(`Invalid description at ${at}`);
      const identity = `${parameter.in}:${parameter.name}`;
      if (seen.has(identity)) fail(`Duplicate parameter at ${at}`);
      seen.add(identity);
      validateSchema(parameter.schema, `${at}/schema`, issues);
      if (parameter.in === 'path' && (parameter.required !== true || !endpoint.includes(`{${parameter.name}}`))) fail(`Invalid path parameter ${parameter.name}`);
      result.set(identity, parameter);
    }
  }
  for (const [, name] of endpoint.matchAll(/\{([^}]+)\}/g)) if (result.get(`path:${name}`)?.required !== true) fail(`Missing required path parameter: ${name}`);
  return [...result.values()];
}

export function validateReference(raw, provenance) {
  const document = parseJson(raw);
  validateProvenance(raw, provenance);
  keys(document, ['openapi', 'info', 'servers', 'components', 'paths', 'tags', 'security'], '');
  if (document.openapi !== compatibility.openapi) fail('OpenAPI dialect requires compatibility review');
  keys(document.info, ['title', 'description', 'version'], '/info');
  string(document.info.title, '/info/title');
  string(document.info.version, '/info/version');
  if (document.info.description !== undefined) string(document.info.description, '/info/description');
  const origin = new URL(SOURCE_URL).origin;
  const servers = document.servers === undefined ? [] : document.servers;
  if (!Array.isArray(servers) || servers.length > 1) fail('Expected at most one production server');
  if (servers.length) {
    keys(servers[0], ['url', 'description'], '/servers/0');
    const server = new URL(servers[0].url, `${origin}/`);
    if (server.href !== `${origin}/`) fail('Unexpected API server');
  }
  keys(document.components, ['securitySchemes', 'schemas'], '/components');
  if (!isObject(document.components.schemas) || Object.keys(document.components.schemas).length) fail('Reusable schemas require reference support');
  if (!isObject(document.components.securitySchemes)) fail('Missing security schemes');
  for (const [name, scheme] of Object.entries(document.components.securitySchemes)) {
    authentication(document, { security: [{ [name]: [] }] }, `/components/securitySchemes/${name}`);
    if (scheme.description !== undefined) string(scheme.description, `security scheme ${name} description`);
  }
  if (document.security !== undefined) authentication(document, {}, '/security');
  if (document.tags !== undefined) {
    if (!Array.isArray(document.tags)) fail('Invalid document tags');
    const names = new Set();
    for (const tag of document.tags) {
      keys(tag, ['name', 'description'], '/tags'); string(tag.name, '/tags/name');
      if (tag.description !== undefined) string(tag.description, '/tags/description');
      if (names.has(tag.name)) fail('Duplicate document tag'); names.add(tag.name);
    }
  }
  if (!isObject(document.paths) || !Object.keys(document.paths).length) fail('Missing API paths');
  const issues = [];
  const operations = [];
  for (const [endpoint, pathItem] of Object.entries(document.paths)) {
    if (!/^\/api\/v1\/[A-Za-z0-9_/{\}-]+$/.test(endpoint) || endpoint.replace(/\{[A-Za-z0-9_]+\}/g, '').match(/[{}]/)) fail(`Invalid API path: ${endpoint}`);
    keys(pathItem, [...METHODS, 'parameters'], pointer('/paths', endpoint));
    let count = 0;
    for (const [method, operation] of Object.entries(pathItem)) {
      if (!METHODS.has(method)) continue;
      count += 1;
      const location = `${pointer('/paths', endpoint)}/${method}`;
      keys(operation, ['summary', 'description', 'tags', 'parameters', 'security', 'requestBody', 'responses', 'operationId', 'deprecated'], location);
      string(operation.summary, `${location}/summary`);
      if (operation.description !== undefined) string(operation.description, `${location}/description`);
      if (operation.tags !== undefined) stringArray(operation.tags, `${location}/tags`);
      if (operation.operationId !== undefined) string(operation.operationId, `${location}/operationId`);
      if (operation.deprecated !== undefined && typeof operation.deprecated !== 'boolean') fail(`Invalid deprecation flag at ${location}`);
      if (Object.hasOwn(operation, 'security') && !Array.isArray(operation.security)) fail(`Invalid security at ${location}`);
      const auth = authentication(document, operation, location);
      const params = parameters(pathItem, operation, endpoint, location, issues);
      if (operation.requestBody !== undefined) {
        keys(operation.requestBody, ['required', 'description', 'content'], `${location}/requestBody`);
        if (operation.requestBody.required !== undefined && typeof operation.requestBody.required !== 'boolean') fail(`Invalid body required flag at ${location}`);
        if (operation.requestBody.description !== undefined) string(operation.requestBody.description, `${location}/requestBody/description`);
        media(operation.requestBody.content, `${location}/requestBody/content`, issues);
      }
      if (!isObject(operation.responses) || !Object.keys(operation.responses).length) fail(`Missing responses at ${location}`);
      for (const [status, response] of Object.entries(operation.responses)) {
        if (!/^(?:[1-5](?:[0-9]{2}|XX)|default)$/.test(status)) fail(`Invalid response status at ${location}`);
        keys(response, ['description', 'content'], `${location}/responses/${status}`);
        string(response.description, `${location}/responses/${status}/description`);
        if (response.content !== undefined) media(response.content, `${location}/responses/${status}/content`, issues);
      }
      operations.push({ method, endpoint, operation, params, auth });
    }
    if (!count) fail(`Path has no operations: ${endpoint}`);
  }
  const allowed = new Map(compatibility.issues.map((issue) => [issue.pointer, JSON.stringify(issue)]));
  for (const issue of issues) if (allowed.get(issue.pointer) !== JSON.stringify(issue)) fail(`Unreviewed OpenAPI compatibility issue at ${issue.pointer}`);
  return { document, operations, issues, server: origin };
}

function schemaType(schema) {
  return schema.type ?? (['oneOf', 'anyOf', 'allOf'].filter((key) => schema[key]).join(', ') || 'See schema');
}

function constraints(schema) {
  const labels = {
    enum: 'Allowed values', default: 'Default', example: 'Example', format: 'Format',
    minLength: 'Min length', maxLength: 'Max length', pattern: 'Pattern',
    minimum: 'Minimum', maximum: 'Maximum', minItems: 'Min items', maxItems: 'Max items',
    minProperties: 'Min properties', maxProperties: 'Max properties', multipleOf: 'Multiple of',
    exclusiveMinimum: 'Exclusive minimum', exclusiveMaximum: 'Exclusive maximum',
    uniqueItems: 'Unique items', nullable: 'Nullable', readOnly: 'Read only', writeOnly: 'Write only', deprecated: 'Deprecated',
  };
  return Object.entries(schema).filter(([key, value]) => labels[key] && !isObject(value))
    .map(([key, value]) => `${labels[key]}: ${Array.isArray(value) ? value.map((item) => inlineCode(JSON.stringify(item))).join(', ') : inlineCode(JSON.stringify(value))}.`).join(' ');
}

function schemaFields(schema, field = '$', required = false) {
  const details = [required ? '**Required.**' : '', text(schema.description ?? ''), constraints(schema)].filter(Boolean).join(' ');
  const fields = [{ field, type: schemaType(schema), details }];
  for (const [name, child] of Object.entries(schema.properties ?? {})) {
    fields.push(...schemaFields(child, `${field}.${name}`, schema.required?.includes(name)));
  }
  if (schema.items) fields.push(...schemaFields(schema.items, `${field}[]`));
  if (isObject(schema.additionalProperties)) fields.push(...schemaFields(schema.additionalProperties, `${field}.*`));
  for (const key of ['oneOf', 'anyOf', 'allOf']) {
    for (const [index, child] of (schema[key] ?? []).entries()) fields.push(...schemaFields(child, `${field} (${key} ${index + 1})`));
  }
  return fields;
}

function fieldTable(schema) {
  return ['<div className="indexer-fields">', '', '| Field | Type | Details |', '| --- | --- | --- |',
    ...schemaFields(schema).map(({ field, type, details }) => `| ${inlineCode(field)} | ${text(type)} | ${details || '—'} |`), '', '</div>', ''];
}

function mediaExample(media) {
  if (Object.hasOwn(media, 'example')) return media.example;
  if (Object.hasOwn(media.schema, 'example')) return media.schema.example;
  return undefined;
}

function operationAnchor(method, endpoint) {
  return `${method}-${endpoint.toLowerCase().replaceAll('/', '').replace(/[{}]/g, '')}`;
}

const shellQuote = (value) => `'${value.replaceAll("'", "'\\''")}'`;

export function renderReference(raw, provenance) {
  const { document, operations, server } = validateReference(raw, provenance);
  const usedAnchors = new Set();
  const endpointLinks = operations.map(({ method, endpoint, operation }) => {
    const base = operationAnchor(method, endpoint);
    let anchor = base;
    let suffix = 0;
    while (usedAnchors.has(anchor)) anchor = `${base}-${++suffix}`;
    usedAnchors.add(anchor);
    return `| ${method.toUpperCase()} | [${text(operation.summary)}](#${anchor}) |`;
  });
  const lines = [START, '', '## Base URL', '', `\`\`\`text\n${server}\n\`\`\``, '',
    `Explore all ${operations.length} operations below. Use chain discovery to find current blockchain and token identifiers.`, '',
    '[Download OpenAPI](/assets/indexer-api/openapi.json) · [Snapshot provenance](/assets/indexer-api/openapi.provenance.json)', '',
    '## Authentication', '',
    'Authentication requirements are listed under each endpoint. Send your API key in the documented header for protected endpoints. [Request an API key](/tools/indexer-api/get-started/).', '',
    '## API Endpoints', '', '| Method | Endpoint |', '| --- | --- |',
    ...endpointLinks, ''];
  for (const { method, endpoint, operation, params, auth } of operations) {
    lines.push(`### ${method.toUpperCase()} ${text(endpoint)}`, '', `**${text(operation.summary)}**`, '');
    if (operation.description) lines.push(text(operation.description), '');
    if (operation.deprecated) lines.push('**Deprecated.**', '');
    lines.push(auth ? `**Authentication:** ${inlineCode(auth.scheme.name)} header required.` : '**Authentication:** Public endpoint.', '');
    if (params.length) {
      lines.push('**Parameters**', '', '<div className="indexer-fields">', '', '| Name | Type | Details |', '| --- | --- | --- |');
      for (const parameter of params) {
        lines.push(`| ${inlineCode(parameter.name)} (${text(parameter.in)}) | ${text(schemaType(parameter.schema))} | Required: ${parameter.required === true ? 'Yes' : 'No'}. ${text(parameter.description ?? '')} ${constraints(parameter.schema)} |`);
      }
      lines.push('', '</div>', '');
    }
    const command = [`curl --request ${method.toUpperCase()} ${shellQuote(`${server}${endpoint}`)}`];
    if (auth) command.push(`  --header ${shellQuote(`${auth.scheme.name}: <api-key>`)}`);
    if (operation.requestBody) {
      const content = operation.requestBody.content;
      for (const [type, media] of Object.entries(content)) {
        lines.push(`**Request body · ${text(type)} · ${operation.requestBody.required === true ? 'Required' : 'Optional'}**`, '');
        if (operation.requestBody.description) lines.push(text(operation.requestBody.description), '');
        lines.push(...fieldTable(media.schema));
        const example = mediaExample(media);
        if (example !== undefined) lines.push('**Example request body**', '', jsonBlock(example), '');
      }
      command.push(`  --header ${shellQuote(`Content-Type: ${Object.keys(content)[0]}`)}`, '  --data-binary @request.json');
    }
    lines.push('**Example request**', '', 'Replace path placeholders and the API key before running.' + (operation.requestBody ? ' Save your request body in `request.json` using the fields above.' : ''), '',
      `\`\`\`bash\n${command.join(' \\' + '\n')}\n\`\`\``, '', '**Responses**', '', '| Status | Description |', '| --- | --- |');
    const responseFields = new Set();
    const success = Object.entries(operation.responses).find(([status]) => /^2/.test(status));
    for (const [status, response] of Object.entries(operation.responses)) {
      lines.push(`| ${inlineCode(status)} | ${text(response.description)}${response.content ? '' : ' No response content declared.'} |`);
      for (const media of Object.values(response.content ?? {})) for (const { field } of schemaFields(media.schema)) responseFields.add(field);
    }
    lines.push('');
    if (success?.[1].content) {
      for (const [type, media] of Object.entries(success[1].content)) {
        lines.push(`**Response fields · HTTP ${text(success[0])} · ${text(type)}**`, '', ...fieldTable(media.schema));
        for (const { field } of schemaFields(media.schema)) responseFields.delete(field);
        const example = mediaExample(media);
        if (example !== undefined) lines.push('**Example response**', '', jsonBlock(example), '');
      }
    }
    if (responseFields.size) lines.push(`**Other response fields:** ${[...responseFields].map(inlineCode).join(', ')}. See the full schema for each status.`, '');
    lines.push(rawDetails('Full endpoint schema (JSON)', {
      method: method.toUpperCase(), path: endpoint, operation,
      pathParameters: document.paths[endpoint].parameters ?? [],
      security: operation.security ?? document.security ?? [],
      securitySchemes: auth ? { [auth.name]: auth.scheme } : {},
    }), '');
  }
  lines.push(END);
  return lines.join('\n');
}

export function replaceReference(page, generated) {
  const start = page.indexOf(START);
  const end = page.indexOf(END);
  if (start < 0 || end < start || page.indexOf(START, start + START.length) >= 0 || page.indexOf(END, end + END.length) >= 0) fail('Expected exactly one ordered OpenAPI reference region');
  return page.slice(0, start) + generated + page.slice(end + END.length);
}
