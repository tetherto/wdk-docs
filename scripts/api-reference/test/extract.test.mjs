import test from 'node:test'
import assert from 'node:assert/strict'
import { access, mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { extractPackage } from '../extract.mjs'

const surface = fileURLToPath(new URL('./fixtures/surface/', import.meta.url))

async function scratch(t) {
  const root = await mkdtemp(path.join(tmpdir(), 'wdk-extract-test-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  return root
}

async function tiny(t, files, metadata = {}) {
  const root = await scratch(t)
  const packageRoot = path.join(root, 'input')
  await mkdir(packageRoot)
  await writeFile(path.join(packageRoot, 'package.json'), JSON.stringify({ name: '@fixture/tiny', version: '1.0.0', type: 'module',
    exports: { '.': { types: './index.d.ts', import: './index.js' } }, ...metadata }))
  for (const [name, content] of Object.entries(files)) {
    await mkdir(path.dirname(path.join(packageRoot, name)), { recursive: true })
    await writeFile(path.join(packageRoot, name), content)
  }
  return { packageRoot, packageName: '@fixture/tiny', profile: 'core', outputRoot: path.join(root, 'output') }
}

test('retains rich stock reflection types, all public subpaths, aliases and inherited/static members without upstream config execution', async (t) => {
  const root = await scratch(t)
  const report = await extractPackage({ packageRoot: surface, packageName: '@fixture/surface', outputRoot: path.join(root, 'output'), profile: 'evm' })
  assert.equal(report.mechanicalState, 'complete', JSON.stringify(report.diagnostics))
  assert.deepEqual(report.entrypoints.map((entry) => [entry.subpath, entry.disposition]), [['.', 'inspect'], ['./signers', 'inspect'], ['./package.json', 'excluded-metadata'], ['./private', 'excluded-null']])
  assert(report.lanes.source.exports.some((row) => row.exportName === 'default' && row.memberPath === 'inherited'))
  assert(report.lanes.source.exports.some((row) => row.memberPath === 'label' && row.isStatic))
  assert(report.lanes.source.exports.some((row) => row.exportName === 'Renamed'))
  assert(report.lanes.declaration.exports.some((row) => row.exportName === 'Unsigned' && !row.value && row.type))
  assert(!report.lanes.source.exports.some((row) => row.exportName === 'Unsigned'))
  assert(report.lanes.declaration.coverage.every((row) => row.disposition === 'candidate'))
  const raw = JSON.parse(await readFile(path.join(root, 'output', report.artifacts.declarationReflection), 'utf8'))
  const module = raw.children.find((row) => row.name === '.')
  const wordCount = module.children.find((row) => row.name === 'WordCount')
  assert.deepEqual(wordCount.type.types.map((row) => row.value), [12, 24])
  const values = module.children.find((row) => row.name === 'Values')
  assert.equal(values.type.type, 'array')
  assert.equal(values.type.elementType.type, 'union')
  const callback = module.children.find((row) => row.name === 'Callback')
  assert.equal(callback.type.declaration.signatures[0].parameters[1].flags.isOptional, true)
  assert.equal(callback.type.declaration.signatures[0].type.name, 'Promise')
  const text = JSON.stringify(raw)
  assert(text.includes('"type":"union"'))
  assert(text.includes('"type":"array"'))
  assert(text.includes('"type":"reflection"'))
  assert(text.includes('"type":"tuple"'))
  const markdown = (await Promise.all(report.artifacts.declarationCandidates.map((filename) => readFile(path.join(root, 'output', filename), 'utf8')))).join('\n')
  assert(markdown.includes('12 | 24'))
  assert(markdown.includes('(string | number)[]'))
  assert(markdown.includes('Promise'))
  assert.equal(report.sourceApproval, 'not-assessed')
  assert.equal(report.contentAcceptance, 'not-assessed')
})

test('empty exports block both lanes instead of issuing a complete inventory', async (t) => {
  const options = await tiny(t, { 'index.js': 'export {}', 'index.d.ts': 'export {}' })
  const report = await extractPackage(options)
  assert.equal(report.mechanicalState, 'blocked')
  assert.equal(report.diagnostics.filter((row) => row.code === 'empty-exports').length, 2)
  assert.deepEqual(report.artifacts.sourceCandidates, [])
})

test('percent-encoded export traversal cannot qualify when Node rejects the package target', async (t) => {
  const options = await tiny(t, { '%2e%2e/index.js': 'export const value = 1', '%2e%2e/index.d.ts': 'export const value: 1' },
    { exports: { '.': { types: './%2e%2e/index.d.ts', default: './%2e%2e/index.js' } } })
  const { createRequire } = await import('node:module')
  const require = createRequire(path.join(options.packageRoot, 'probe.js'))
  assert.throws(() => require.resolve('@fixture/tiny'), { code: 'ERR_INVALID_PACKAGE_TARGET' })
  const report = await extractPackage(options)
  assert.notEqual(report.mechanicalState, 'complete')
  assert(report.diagnostics.some((row) => row.code === 'unsupported-export-target'))
})

test('a JSON metadata export is excluded even when its public alias lacks the json suffix', async (t) => {
  const options = await tiny(t, { 'index.js': 'export const value = 1', 'index.d.ts': 'export const value: 1' },
    { exports: { '.': { types: './index.d.ts', import: './index.js' }, './package': { default: './package.json' } } })
  const report = await extractPackage(options)
  assert.equal(report.mechanicalState, 'complete', JSON.stringify(report.diagnostics))
  assert.equal(report.entrypoints.find((entry) => entry.subpath === './package').disposition, 'excluded-metadata')
})

test('source/declaration return mismatch remains useful partial evidence', async (t) => {
  const options = await tiny(t, { 'index.js': '/** @param {number} value @returns {number} */\nexport function convert(value) { return value }',
    'index.d.ts': 'export function convert(value: number): string' })
  const report = await extractPackage(options)
  assert.equal(report.mechanicalState, 'partial')
  assert(report.diagnostics.some((row) => row.code === 'source-declaration-type-difference'))
  assert(report.artifacts.sourceReflection && report.artifacts.declarationReflection)
})

test('preserves function overloads and flags unsupported exports without losing valid root evidence', async (t) => {
  const options = await tiny(t, { 'index.js': '/** @param {string | number} value @returns {string | number} */\nexport function echo(value) { return value }',
    'index.d.ts': 'export function echo(value: string): string\nexport function echo(value: number): number' },
  { exports: { '.': { types: './index.d.ts', import: './index.js' }, './*': './*.js' } })
  const report = await extractPackage(options)
  assert.equal(report.mechanicalState, 'partial')
  assert(report.diagnostics.some((row) => row.code === 'unsupported-export'))
  const overload = report.lanes.declaration.exports.find((row) => row.exportName === 'echo')
  assert.equal(overload.signatureCount, 2)
  assert.equal(report.lanes.declaration.reflections.find((row) => row.exportName === 'echo').signatureCount, 2)
})

test('missing acquired dependencies preserve diagnostics and never fall back to nearby node_modules', async (t) => {
  const options = await tiny(t, { 'index.js': "export { Parent } from 'unacquired-package'", 'index.d.ts': "export { Parent } from 'unacquired-package'" })
  await mkdir(path.join(options.packageRoot, 'node_modules/unacquired-package'), { recursive: true })
  await writeFile(path.join(options.packageRoot, 'node_modules/unacquired-package/index.d.ts'), 'export class Parent {}')
  const report = await extractPackage(options)
  assert.notEqual(report.mechanicalState, 'complete')
  assert(report.lanes.declaration.strictDiagnostics.some((row) => row.code === 2307))
  assert(report.resolverEdges.some((row) => row.specifier === 'unacquired-package' && row.target === null))
})

test('explicit dependency roots retain exact inheritance and importer edges', async (t) => {
  const options = await tiny(t, { 'index.js': "import { Parent } from 'parent-package'\nexport class Child extends Parent {}", 'index.d.ts': "import { Parent } from 'parent-package'\nexport class Child extends Parent {}" })
  const dependencyRoot = path.join(path.dirname(options.packageRoot), 'dependency')
  await mkdir(dependencyRoot)
  await writeFile(path.join(dependencyRoot, 'package.json'), JSON.stringify({ name: 'parent-package', version: '2.3.4', type: 'module', exports: { types: './index.d.ts', import: './index.js' } }))
  await writeFile(path.join(dependencyRoot, 'index.js'), '/** A parent. */\nexport class Parent { /** @returns {number} */ inherited() { return 1 } }')
  await writeFile(path.join(dependencyRoot, 'index.d.ts'), 'export class Parent { inherited(): number }')
  const report = await extractPackage({ ...options, dependencies: [{ name: 'parent-package', root: dependencyRoot }] })
  assert.equal(report.analyzedDependencies[0].version, '2.3.4')
  assert.equal(report.analyzedDependencies[0].sha256.length, 64)
  assert(report.resolverEdges.some((edge) => edge.specifier === 'parent-package' && edge.package?.version === '2.3.4'), JSON.stringify(report))
  assert(report.lanes.declaration.reflections.some((row) => row.memberPath === 'inherited' && row.inheritedFrom))
})

test('file-reading comment directives block conversion before TypeDoc can inspect an arbitrary file', async (t) => {
  const options = await tiny(t, { 'index.js': '/** {@include ../../secret.md} */\nexport const value = 1', 'index.d.ts': '/** {@include ../../secret.md} */\nexport const value: 1' })
  const report = await extractPackage(options)
  assert.equal(report.mechanicalState, 'blocked')
  assert(report.diagnostics.some((row) => row.code === 'comment-read-directive'))
  assert.equal(report.artifacts.sourceReflection, null)
})

test('identical input produces deterministic inventories in separate output roots', async (t) => {
  const options = await tiny(t, { 'index.js': '/** @type {number} */\nexport const value = 1', 'index.d.ts': 'export const value: number' })
  const first = await extractPackage(options)
  const second = await extractPackage({ ...options, outputRoot: `${options.outputRoot}-again` })
  assert.deepEqual(second, first)
})

test('source-only input is partial and records missing declarations', async (t) => {
  const options = await tiny(t, { 'index.js': 'export const value = 1' })
  const report = await extractPackage(options)
  assert.equal(report.mechanicalState, 'partial')
  assert(report.diagnostics.some((row) => row.code === 'missing-entrypoint' && row.lane === 'declaration'))
  assert(report.artifacts.sourceCandidates.length)
})

test('stock local self-alias output stays partial even when TypeScript resolves its hidden definition', async (t) => {
  const options = await tiny(t, { 'index.js': '/** @type {number} */\nexport const value = 1',
    'index.d.ts': "export const value: number\nexport type Options = import('./hidden.js').Options",
    'hidden.d.ts': 'export interface Options { threshold: 12 | 24 }' })
  const report = await extractPackage(options)
  assert.equal(report.mechanicalState, 'partial')
  assert(report.diagnostics.some((row) => row.code === 'alias-rendering-gap'))
  assert(report.artifacts.declarationReflection)
})

test('namespace reexports account for their public function and constant members', async (t) => {
  const options = await tiny(t, { 'index.js': "export * as utils from './utils.js'", 'index.d.ts': "export * as utils from './utils.js'",
    'utils.js': '/** @param {string} value @returns {string} */\nexport function echo(value) { return value }\n/** @type {number} */\nexport const COUNT = 1',
    'utils.d.ts': 'export function echo(value: string): string\nexport const COUNT: number' })
  const report = await extractPackage(options)
  assert.equal(report.mechanicalState, 'complete', JSON.stringify(report.diagnostics))
  assert(report.inventory.some((row) => row.exportName === 'utils' && row.memberPath === 'echo' && row.kind === 'Function'))
})

test('preexisting analysis redirects and package links are rejected before staging', async (t) => {
  const options = await tiny(t, { 'index.js': 'export const value = 1', 'index.d.ts': 'export const value: number' })
  await mkdir(path.join(options.outputRoot, 'analysis'), { recursive: true })
  await assert.rejects(extractPackage(options), /EEXIST/)
  await symlink(path.join(options.packageRoot, 'index.js'), path.join(options.packageRoot, 'linked.js'))
  await assert.rejects(extractPackage({ ...options, outputRoot: `${options.outputRoot}-linked` }), /linked\/special input/)
})

test('sibling declarations cannot erase source return-type differences behind a reexport', async (t) => {
  const options = await tiny(t, { 'index.js': "export { echo } from './utils.js'", 'index.d.ts': "export { echo } from './utils.js'",
    'utils.js': '/** @param {string} value @returns {number} */\nexport function echo(value) { return value.length }',
    'utils.d.ts': 'export function echo(value: string): string' })
  const report = await extractPackage(options)
  assert.equal(report.mechanicalState, 'partial')
  assert(report.lanes.source.exports.find((row) => row.exportName === 'echo').typeText.includes('number'))
  assert(report.lanes.declaration.exports.find((row) => row.exportName === 'echo').typeText.includes('string'))
  assert(report.diagnostics.some((row) => row.code === 'source-declaration-type-difference'))
})

test('malformed Node export targets cannot inherit legacy main filename tolerance', async (t) => {
  const options = await tiny(t, { 'index.js': 'export const value = 1', 'index.d.ts': 'export const value: number' },
    { exports: { types: './index.d.ts', import: 'index.js' } })
  const report = await extractPackage(options)
  assert.equal(report.mechanicalState, 'partial')
  assert(report.diagnostics.some((row) => row.code === 'invalid-export-target'))
  assert.equal(report.artifacts.sourceReflection, null)
  assert(report.artifacts.declarationReflection)
})

test('local Markdown file links cannot read or copy excluded original input bytes', async (t) => {
  const comment = '/** [configuration](../../input/.env) */\n'
  const options = await tiny(t, { 'index.js': comment + '/** @type {number} */\nexport const value = 1',
    'index.d.ts': comment + 'export const value: number', '.env': 'FAKE_PRIVATE_CANARY=must-not-copy' })
  const report = await extractPackage(options)
  assert.equal(report.mechanicalState, 'partial')
  assert(report.diagnostics.some((row) => row.code === 'local-comment-asset'))
  for (const lane of ['source', 'declaration']) await assert.rejects(access(path.join(options.outputRoot, `${lane}.candidate`, '_media', '.env')), /ENOENT/)
  const candidates = (await Promise.all([...report.artifacts.sourceCandidates, ...report.artifacts.declarationCandidates].map((filename) => readFile(path.join(options.outputRoot, filename), 'utf8')))).join('\n')
  assert(!candidates.includes('FAKE_PRIVATE_CANARY'))
})

test('physical dependency paths preserve distinct same-named classes and deepest importer ownership', async (t) => {
  const options = await tiny(t, { 'index.js': "export { Child as Left } from 'left-parent'\nexport { Child as Right } from 'right-parent'",
    'index.d.ts': "export { Child as Left } from 'left-parent'\nexport { Child as Right } from 'right-parent'" })
  async function dependency(folder, name, version, declaration) {
    const root = path.join(path.dirname(options.packageRoot), folder)
    await mkdir(root)
    await writeFile(path.join(root, 'package.json'), JSON.stringify({ name, version, type: 'module', exports: { types: './index.d.ts', import: './index.js' } }))
    await writeFile(path.join(root, 'index.d.ts'), declaration)
    await writeFile(path.join(root, 'index.js'), 'export {}')
    return root
  }
  const child = "import { Parent } from 'same-parent'\nexport class Child extends Parent {}"
  const left = await dependency('left', 'left-parent', '1.0.0', child)
  const right = await dependency('right', 'right-parent', '1.0.0', child)
  const first = await dependency('first', 'same-parent', '1.0.0', 'export class Parent { first(): 1 }')
  const second = await dependency('second', 'same-parent', '2.0.0', 'export class Parent { second(): 2 }')
  const dependencies = [
    { name: 'left-parent', root: left, lockPath: 'node_modules/left-parent' },
    { name: 'right-parent', root: right, lockPath: 'node_modules/right-parent' },
    { name: 'same-parent', root: first, lockPath: 'node_modules/left-parent/node_modules/same-parent' },
    { name: 'same-parent', root: second, lockPath: 'node_modules/right-parent/node_modules/same-parent' }
  ]
  const report = await extractPackage({ ...options, dependencies })
  assert.equal(report.mechanicalState, 'complete', JSON.stringify(report.diagnostics))
  assert(report.lanes.declaration.exports.some((row) => row.exportName === 'Left' && row.memberPath === 'first'))
  assert(!report.lanes.declaration.exports.some((row) => row.exportName === 'Left' && row.memberPath === 'second'))
  assert(report.lanes.declaration.exports.some((row) => row.exportName === 'Right' && row.memberPath === 'second'))
  for (const [importer, version] of [['left-parent', '1.0.0'], ['right-parent', '2.0.0']]) {
    assert(report.resolverEdges.some((edge) => edge.importer === `node_modules/${importer}/index.d.ts` && edge.specifier === 'same-parent' && edge.package?.version === version && edge.package.lockPath === `node_modules/${importer}/node_modules/same-parent`))
  }
  await assert.rejects(extractPackage({ ...options, outputRoot: `${options.outputRoot}-ambiguous`, dependencies: dependencies.slice(2).map(({ lockPath, ...row }) => row) }), /ambiguous dependency/)
  const invalidPaths = ['../node_modules/same-parent', '/node_modules/same-parent', 'node_modules/%73ame-parent', 'node_modules/same-parent/../same-parent', 'node_modules/wrong', 'node_modules\\same-parent']
  for (const [index, lockPath] of invalidPaths.entries()) {
    await assert.rejects(extractPackage({ ...options, outputRoot: `${options.outputRoot}-invalid-${index}`, dependencies: [{ name: 'same-parent', root: first, lockPath }] }), /lockPath|package name/)
  }
})

test('type-only wildcard class exports never become runtime availability claims', async (t) => {
  for (const statement of ["export type * from './hidden.js'", "export * from './middle.js'"]) {
    const options = await tiny(t, { 'index.js': '/** @type {number} */\nexport const value = 1',
      'index.d.ts': `${statement}\nexport const value: number`,
      'middle.d.ts': "export type * from './hidden.js'",
      'hidden.d.ts': 'export class OnlyType { read(): string }' })
    const report = await extractPackage(options)
    assert.equal(report.mechanicalState, 'complete', JSON.stringify(report.diagnostics))
    const rows = report.lanes.declaration.exports.filter((row) => row.exportName === 'OnlyType')
    assert(rows.length)
    assert(rows.every((row) => !row.value && row.type))
    assert(!report.diagnostics.some((row) => row.code === 'source-declaration-export-difference'))
  }
})
