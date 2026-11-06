import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync, realpathSync, statSync } from 'node:fs'
import { lstat, mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const docsRoot = fileURLToPath(new URL('../../', import.meta.url))
const profiles = new Set(['core', 'evm'])
const sourceConditions = new Set(['node', 'import', 'default'])
const declarationConditions = new Set(['types', 'node', 'import', 'default'])
const packageNamePattern = /^(@[a-z0-9][a-z0-9_.-]*\/)?[a-z0-9][a-z0-9_.-]*$/
const hash = (value) => createHash('sha256').update(value).digest('hex')
const within = (root, filename) => filename === root || filename.startsWith(`${root}${path.sep}`)
const json = (value) => `${JSON.stringify(value, null, 2)}\n`
const stableKey = (packageName, subpath, exportName, memberPath, kind, isStatic) =>
  JSON.stringify([packageName, subpath, exportName, memberPath, kind, isStatic])

async function toolchain() {
  const versions = {}
  for (const [name, expected] of [['typedoc', '0.28.17'], ['typedoc-plugin-markdown', '4.10.0'], ['typescript', /^5\.9\./]]) {
    // Resolve from the trusted docs checkout only, never from an input package.
    const root = path.join(docsRoot, 'node_modules', name)
    const metadata = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'))
    if (typeof expected === 'string' ? metadata.version !== expected : !expected.test(metadata.version)) {
      throw new Error(`Unsupported trusted ${name} version: ${metadata.version}`)
    }
    versions[name] = metadata.version
  }
  const typedoc = await import(pathToFileURL(path.join(docsRoot, 'node_modules/typedoc/dist/index.js')).href)
  const markdown = await import(pathToFileURL(path.join(docsRoot, 'node_modules/typedoc-plugin-markdown/dist/index.js')).href)
  const { default: ts } = await import(pathToFileURL(path.join(docsRoot, 'node_modules/typescript/lib/typescript.js')).href)
  return { typedoc, markdown, ts, versions, libRoot: realpathSync(path.join(docsRoot, 'node_modules/typescript/lib')) }
}

function diagnostic(code, message, extra = {}) {
  return { code, message, ...extra }
}

function dependencyPath(dependency) {
  const explicit = dependency.lockPath !== undefined
  const locator = explicit ? dependency.lockPath : `node_modules/${dependency.name}`
  if (typeof locator !== 'string' || path.isAbsolute(locator) || /[\\%]/.test(locator)) throw new Error('Invalid physical dependency lockPath')
  const segments = locator.split('/')
  let finalName
  for (let index = 0; index < segments.length;) {
    if (segments[index++] !== 'node_modules') throw new Error('Dependency lockPath must contain only physical node_modules package segments')
    finalName = segments[index++]
    if (finalName?.startsWith('@')) finalName += `/${segments[index++]}`
    if (!packageNamePattern.test(finalName ?? '')) throw new Error('Invalid package segment in dependency lockPath')
  }
  if (finalName !== dependency.name) throw new Error('Dependency lockPath does not end at its declared package name')
  return { locator, explicit }
}

function selectTarget(value, conditions, trail = []) {
  if (value === null) return { excluded: true, conditions: trail }
  if (typeof value === 'string') return { target: value, conditions: trail }
  if (!value || Array.isArray(value) || typeof value !== 'object') return { unsupported: true, conditions: trail }
  for (const [condition, target] of Object.entries(value)) {
    if (conditions.has(condition)) {
      const result = selectTarget(target, conditions, [...trail, condition])
      if (result.target || result.excluded || result.unsupported) return result
    }
  }
  return { missing: true, conditions: trail }
}

function entrypoints(metadata, diagnostics) {
  let exported = metadata.exports
  if (exported === undefined) {
    exported = { '.': { types: metadata.types ?? metadata.typings, default: metadata.main ?? './index.js' } }
    if (!exported['.'].types) delete exported['.'].types
  } else if (typeof exported !== 'object' || exported === null || Array.isArray(exported) ||
      !Object.keys(exported).some((name) => name.startsWith('.'))) {
    exported = { '.': exported }
  }
  if (metadata.typesVersions) diagnostics.push(diagnostic('unsupported-types-versions', 'typesVersions needs a separately qualified resolver profile.'))
  return Object.entries(exported).map(([subpath, value]) => {
    if (!(subpath === '.' || /^\.\/[a-zA-Z0-9_./-]+$/.test(subpath)) || subpath.split('/').includes('..')) {
      diagnostics.push(diagnostic('unsupported-export', `Unsupported public subpath ${subpath}.`, { subpath }))
      return { subpath, disposition: 'blocked' }
    }
    const source = selectTarget(value, sourceConditions)
    const declaration = selectTarget(value, declarationConditions)
    for (const selected of [source, declaration]) {
      if (metadata.exports !== undefined && selected.target?.includes('%')) {
        selected.invalid = true
        diagnostics.push(diagnostic('unsupported-export-target', `Percent-encoded export targets need a separately qualified Node resolver: ${selected.target}.`, { subpath }))
      }
      if (metadata.exports !== undefined && selected.target && (!selected.target.startsWith('./') || /%2f|%5c/i.test(selected.target) ||
          selected.target.slice(2).split('/').some((segment) => ['.', '..', 'node_modules'].includes(segment)))) {
        selected.invalid = true
        diagnostics.push(diagnostic('invalid-export-target', `Invalid Node export target ${selected.target}.`, { subpath }))
      }
    }
    if (source.target?.endsWith('.json') && declaration.target === source.target) {
      return { subpath, source, declaration, disposition: 'excluded-metadata', reason: 'JSON metadata is not an API code entrypoint.' }
    }
    if (source.excluded && declaration.excluded) return { subpath, source, declaration, disposition: 'excluded-null' }
    if (source.unsupported || declaration.unsupported) diagnostics.push(diagnostic('unsupported-export', `Unsupported export target for ${subpath}.`, { subpath }))
    if (!/\.d\.[cm]?ts$/.test(declaration.target ?? '')) {
      const candidate = source.target?.replace(/\.[cm]?js$/, '.d.ts')
      declaration.target = metadata.exports === undefined && subpath === '.' && (metadata.types ?? metadata.typings) ? metadata.types ?? metadata.typings : candidate
      declaration.inferredLocator = true
    }
    return { subpath, source, declaration, disposition: 'inspect' }
  })
}

async function stagePackage(originalRoot, targetRoot) {
  const original = realpathSync(originalRoot)
  const rows = []
  let total = 0
  let examined = 0
  async function copy(directory, relative = '') {
    if (relative.split(path.sep).length > 48) throw new Error('Analysis input exceeds the bounded directory depth.')
    for (const item of (await readdir(directory, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
      if (++examined > 20000) throw new Error('Analysis input exceeds the bounded directory-entry limit.')
      if (item.name === 'node_modules' || item.name === '.git') continue
      const rel = path.join(relative, item.name)
      const filename = path.join(directory, item.name)
      const stats = await lstat(filename)
      if (stats.isSymbolicLink() || (!stats.isFile() && !stats.isDirectory())) throw new Error(`Unsupported linked/special input: ${rel}`)
      if (stats.isDirectory()) {
        await copy(filename, rel)
      } else if (/\.(?:[cm]?js|[cm]?ts|json)$/.test(item.name)) {
        if (stats.nlink > 1) throw new Error(`Unsupported hardlinked input: ${rel}`)
        if (stats.size > 8 * 1024 * 1024 || rows.length >= 10000 || (total += stats.size) > 64 * 1024 * 1024) throw new Error('Analysis input exceeds the bounded profile limits.')
        const bytes = await readFile(filename)
        await mkdir(path.dirname(path.join(targetRoot, rel)), { recursive: true })
        await writeFile(path.join(targetRoot, rel), bytes, { flag: 'wx' })
        rows.push({ path: rel.split(path.sep).join('/'), sha256: hash(bytes), bytes: bytes.length })
      }
    }
  }
  await mkdir(targetRoot, { recursive: true })
  await copy(original)
  const metadata = JSON.parse(await readFile(path.join(targetRoot, 'package.json'), 'utf8'))
  return { originalRoot: original, root: targetRoot, metadata, files: rows, sha256: hash(json(rows)) }
}

function resolveEntry(root, selected, lane, subpath, diagnostics) {
  if (selected?.invalid) return undefined
  if (!selected?.target) {
    diagnostics.push(diagnostic('missing-entrypoint', `No selected ${lane} entrypoint for ${subpath}.`, { lane, subpath }))
    return undefined
  }
  const target = selected.target.startsWith('./') ? selected.target : `./${selected.target}`
  const filename = path.resolve(root, target)
  if (!within(root, filename) || target.includes('\\') || !existsSync(filename) || !statSync(filename).isFile()) {
    diagnostics.push(diagnostic('missing-entrypoint', `Invalid or missing ${lane} entrypoint ${selected.target}.`, { lane, subpath }))
    return undefined
  }
  if (!(lane === 'source' ? /\.[cm]?js$/ : /\.d\.[cm]?ts$/).test(filename)) {
    diagnostics.push(diagnostic('unsupported-entrypoint', `Unsupported ${lane} entrypoint ${selected.target}.`, { lane, subpath }))
    return undefined
  }
  return filename
}

function compilerHost(ts, options, analysisRoot, libRoot, packages, edges, denied, lane) {
  const host = ts.createCompilerHost(options)
  const deepestPackages = [...packages].sort((a, b) => b.root.length - a.root.length)
  const allowed = (filename) => within(analysisRoot, path.resolve(filename)) || within(libRoot, path.resolve(filename))
  host.fileExists = (filename) => allowed(filename) && existsSync(filename) && statSync(filename).isFile()
  host.readFile = (filename) => {
    if (!allowed(filename)) { denied.add(filename); return undefined }
    return host.fileExists(filename) ? readFileSync(filename, 'utf8') : undefined
  }
  host.directoryExists = (filename) => allowed(filename) && existsSync(filename) && statSync(filename).isDirectory()
  host.getDirectories = (filename) => host.directoryExists(filename) ? readdirSync(filename, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name) : []
  host.realpath = (filename) => allowed(filename) && existsSync(filename) ? realpathSync(filename) : filename
  host.getCurrentDirectory = () => analysisRoot
  host.getSourceFile = (filename, languageVersion) => {
    const text = host.readFile(filename)
    return text === undefined ? undefined : ts.createSourceFile(filename, text, languageVersion, true)
  }
  host.resolveModuleNames = (names, importer) => names.map((specifier) => {
    let resolution = ts.resolveModuleName(specifier, importer, options, host, undefined, undefined, ts.ModuleKind.ESNext).resolvedModule
    // A sibling .d.ts must not replace the JavaScript implementation lane.
    // Dependency declarations remain explicit type/inheritance evidence.
    if (lane === 'source' && specifier.startsWith('.') && /\.[cm]?js$/.test(specifier)) {
      const implementation = path.resolve(path.dirname(importer), specifier)
      if (within(packages[0].root, implementation) && host.fileExists(implementation)) {
        resolution = { resolvedFileName: implementation, extension: /\.mjs$/.test(implementation) ? ts.Extension.Mjs : /\.cjs$/.test(implementation) ? ts.Extension.Cjs : ts.Extension.Js,
          isExternalLibraryImport: false }
      }
    }
    const target = resolution?.resolvedFileName
    const owner = target && deepestPackages.find((pkg) => within(pkg.root, target))
    edges.push({ importer: path.relative(analysisRoot, importer).split(path.sep).join('/'), specifier,
      target: target ? path.relative(analysisRoot, target).split(path.sep).join('/') : null,
      package: owner ? { name: owner.metadata.name, version: owner.metadata.version, sha256: owner.sha256, lockPath: owner.lockPath ?? 'package' } : null })
    return resolution
  })
  return host
}

function symbolKind(ts, symbol) {
  const flags = symbol.flags
  for (const [flag, name] of [[ts.SymbolFlags.Class, 'Class'], [ts.SymbolFlags.Interface, 'Interface'], [ts.SymbolFlags.TypeAlias, 'TypeAlias'],
    [ts.SymbolFlags.Enum, 'Enum'], [ts.SymbolFlags.Function, 'Function'], [ts.SymbolFlags.Method, 'Method'], [ts.SymbolFlags.GetAccessor | ts.SymbolFlags.SetAccessor, 'Accessor'],
    [ts.SymbolFlags.ValueModule | ts.SymbolFlags.NamespaceModule, 'Namespace']]) {
    if (flags & flag) return name
  }
  return flags & (ts.SymbolFlags.Property | ts.SymbolFlags.EnumMember) ? 'Property' : 'Variable'
}

function publicSymbol(ts, symbol) {
  return !(symbol.declarations ?? []).some((node) => ts.getCombinedModifierFlags(node) & (ts.ModifierFlags.Private | ts.ModifierFlags.Protected)) && !symbol.name.startsWith('#')
}

function census(ts, program, entries, packageName, lane) {
  const checker = program.getTypeChecker()
  const rows = []
  const format = ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope
  const wildcardRoles = new Map()
  function typeOnlyWildcardNames(file, visiting = new Set()) {
    if (wildcardRoles.has(file)) return wildcardRoles.get(file)
    if (visiting.has(file)) return new Set()
    const next = new Set([...visiting, file])
    const typeOnly = new Set()
    const values = new Set()
    for (const statement of file.statements) {
      if (!ts.isExportDeclaration(statement) || statement.exportClause || !statement.moduleSpecifier) continue
      const target = checker.getSymbolAtLocation(statement.moduleSpecifier)
      if (!target) continue
      const targetFile = target.declarations?.[0]?.getSourceFile()
      const inherited = targetFile ? typeOnlyWildcardNames(targetFile, next) : new Set()
      for (const symbol of checker.getExportsOfModule(target)) {
        (statement.isTypeOnly || inherited.has(symbol.name) ? typeOnly : values).add(symbol.name)
      }
    }
    const module = checker.getSymbolAtLocation(file)
    for (const symbol of module ? checker.getExportsOfModule(module) : []) {
      if (symbol.flags & ts.SymbolFlags.Value && symbol.declarations?.some((node) => node.getSourceFile() === file && !ts.isExportSpecifier(node) && !ts.isNamespaceExport(node))) values.add(symbol.name)
    }
    for (const name of values) typeOnly.delete(name)
    wildcardRoles.set(file, typeOnly)
    return typeOnly
  }
  function record(symbol, context, memberPath = '', isStatic = false, overrideKind) {
    const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0] ?? context.file
    const kind = overrideKind ?? symbolKind(ts, symbol)
    const type = ['TypeAlias', 'Interface'].includes(kind) ? checker.getDeclaredTypeOfSymbol(symbol) : checker.getTypeOfSymbolAtLocation(symbol, declaration)
    const signatures = type.getCallSignatures()
    const typeText = checker.typeToString(type, declaration, format | (kind === 'TypeAlias' ? ts.TypeFormatFlags.InTypeAlias : 0))
    const row = { key: stableKey(packageName, context.subpath, context.exportName, memberPath, kind, isStatic), lane, subpath: context.subpath,
      exportName: context.exportName, memberPath, kind, isStatic, value: Boolean(symbol.flags & ts.SymbolFlags.Value) && !context.typeOnly,
      type: Boolean(symbol.flags & ts.SymbolFlags.Type) || context.typeOnly, typeText,
      signatures: signatures.map((signature) => checker.signatureToString(signature, declaration, format)),
      signatureCount: signatures.length,
      sources: (symbol.declarations ?? []).map((node) => ({ file: node.getSourceFile().fileName, start: node.pos, end: node.end })) }
    row.signatureFingerprints = row.signatures.map(hash)
    row.fingerprint = hash(json({ typeText, signatures: row.signatures, value: row.value, type: row.type }))
    row.sources = row.sources.map((source) => ({ ...source, sha256: hash(readFileSync(source.file)) }))
    rows.push(row)
    if (!memberPath && ['Class', 'Interface'].includes(kind)) {
      const instance = checker.getDeclaredTypeOfSymbol(symbol)
      for (const member of checker.getPropertiesOfType(instance)) if (publicSymbol(ts, member)) record(member, context, member.name, false)
      if (kind === 'Class') {
        for (const member of checker.getPropertiesOfType(type)) if (member.name !== 'prototype' && publicSymbol(ts, member)) record(member, context, member.name, true)
        const constructors = type.getConstructSignatures().map((signature) => checker.signatureToString(signature, declaration, format))
        if (constructors.length) rows.push({ ...row, key: stableKey(packageName, context.subpath, context.exportName, 'constructor', 'Constructor', false), memberPath: 'constructor', kind: 'Constructor',
          typeText: null, signatures: constructors, signatureCount: constructors.length, signatureFingerprints: constructors.map(hash), fingerprint: hash(json({ signatures: constructors })) })
      }
    }
    if (!memberPath && (kind === 'Namespace' || (kind === 'TypeAlias' && type.objectFlags & ts.ObjectFlags.Anonymous))) {
      for (const member of checker.getPropertiesOfType(type)) if (publicSymbol(ts, member)) record(member, context, member.name, false)
    }
  }
  for (const entry of entries) {
    const file = program.getSourceFile(entry.filename)
    const module = file && checker.getSymbolAtLocation(file)
    if (!module) continue
    const typeOnlyWildcard = typeOnlyWildcardNames(file)
    for (const exported of checker.getExportsOfModule(module)) {
      // TS 5.9 retains alias provenance for named/transitive type exports. A
      // type-only wildcard may expose the underlying class symbol directly,
      // so retain its ExportDeclaration provenance as well.
      const typeOnly = Boolean(checker.getTypeOnlyAliasDeclaration?.(exported)) ||
        typeOnlyWildcard.has(exported.name) ||
        (exported.declarations ?? []).some((node) => (ts.isExportSpecifier(node) && (node.isTypeOnly || node.parent.parent.isTypeOnly)) ||
          (ts.isNamespaceExport(node) && node.parent.isTypeOnly))
      const symbol = exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported
      record(symbol, { file, subpath: entry.subpath, exportName: exported.name, typeOnly })
    }
  }
  return rows.sort((a, b) => a.key.localeCompare(b.key))
}

function reflections(typedoc, project, entries, packageName, lane) {
  const rows = []
  function walk(reflection, context, memberPath = '') {
    let resolved = reflection
    if (reflection.kind === typedoc.ReflectionKind.Reference) resolved = reflection.tryGetTargetReflection?.() ?? reflection
    const kind = typedoc.ReflectionKind[resolved.kind]
    const isStatic = Boolean(resolved.flags.isStatic)
    const normalizedKind = kind === 'EnumMember' ? 'Property' : kind
    rows.push({ key: stableKey(packageName, context.subpath, context.exportName, memberPath, normalizedKind, isStatic), lane,
      subpath: context.subpath, exportName: context.exportName, memberPath, kind: normalizedKind, isStatic, reflectionId: reflection.id,
      resolvedReflectionId: resolved.id, signatureCount: resolved.signatures?.length ?? resolved.type?.declaration?.signatures?.length ?? 0, inheritedFrom: resolved.inheritedFrom?.toString() ?? null,
      disposition: 'candidate' })
    for (const child of resolved.children ?? []) if (!child.flags.isPrivate && !child.flags.isProtected) {
      walk(child, context, memberPath ? `${memberPath}.${child.name}` : child.kind === typedoc.ReflectionKind.Constructor ? 'constructor' : child.name)
    }
    for (const child of resolved.type?.declaration?.children ?? []) walk(child, context, memberPath ? `${memberPath}.${child.name}` : child.name)
  }
  for (const entry of entries) {
    const children = entries.length === 1 ? project.children : project.children?.find((child) => child.name === entry.subpath)?.children
    for (const child of children ?? []) walk(child, { subpath: entry.subpath, exportName: child.name })
  }
  return rows.sort((a, b) => a.key.localeCompare(b.key))
}

function normalizePaths(value, analysisRoot, libRoot) {
  if (typeof value === 'string') return value.replaceAll(analysisRoot, 'analysis').replaceAll(libRoot, 'toolchain/typescript/lib')
  if (Array.isArray(value)) return value.map((child) => normalizePaths(child, analysisRoot, libRoot))
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, normalizePaths(child, analysisRoot, libRoot)]))
  return value
}

async function listMarkdown(root) {
  const files = []
  async function walk(directory) {
    for (const entry of (await readdir(directory, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
      const filename = path.join(directory, entry.name)
      if (entry.isDirectory()) await walk(filename)
      else if (entry.name.endsWith('.md')) files.push(filename)
    }
  }
  if (existsSync(root)) await walk(root)
  return files
}

/** Static mechanical inspection only. Candidates are untrusted scratch Markdown, never authored docs. */
export async function extractPackage({ packageRoot, packageName, outputRoot, profile, dependencies = [] }) {
  if (!profiles.has(profile)) throw new Error(`Unsupported extraction profile: ${profile}`)
  if (!packageNamePattern.test(packageName)) throw new Error(`Invalid package name: ${packageName}`)
  if (!path.isAbsolute(packageRoot) || !path.isAbsolute(outputRoot)) throw new Error('Package/output roots must be absolute paths.')
  const inputRoot = realpathSync(packageRoot)
  let output = path.resolve(outputRoot)
  if (within(inputRoot, output) || within(output, inputRoot) || within(docsRoot, output)) throw new Error('Extraction output must be scratch outside the input and trusted docs checkout.')
  await mkdir(output, { recursive: true })
  output = realpathSync(output)
  if (within(inputRoot, output) || within(output, inputRoot) || within(docsRoot, output)) throw new Error('Extraction output must resolve outside the input and trusted docs checkout.')
  const analysisRoot = path.join(output, 'analysis')
  // An existing analysis tree may contain redirects or evidence from a different run.
  await mkdir(analysisRoot)
  const diagnostics = []
  const chain = await toolchain()
  const subject = await stagePackage(inputRoot, path.join(analysisRoot, 'package'))
  if (subject.metadata.name !== packageName) throw new Error(`Package identity mismatch: expected ${packageName}, found ${subject.metadata.name}`)
  const packages = [subject]
  const seenNames = new Map()
  const seenPaths = new Set()
  for (const dependency of dependencies) {
    if (!packageNamePattern.test(dependency.name)) throw new Error(`Invalid dependency name: ${dependency.name}`)
    const { locator, explicit } = dependencyPath(dependency)
    if (seenPaths.has(locator) || (seenNames.has(dependency.name) && (!explicit || !seenNames.get(dependency.name)))) throw new Error(`Invalid or ambiguous dependency path/name: ${dependency.name}`)
    seenNames.set(dependency.name, explicit)
    seenPaths.add(locator)
    const staged = await stagePackage(dependency.root, path.join(analysisRoot, locator))
    staged.lockPath = locator
    if (staged.metadata.name !== dependency.name) throw new Error(`Dependency identity mismatch: ${dependency.name}`)
    packages.push(staged)
  }
  const publicEntries = entrypoints(subject.metadata, diagnostics)
  const report = { schemaVersion: 1, producer: { name: 'wdk-api-reference-static-inspector', ...chain.versions },
    package: { name: packageName, version: subject.metadata.version, sha256: subject.sha256 }, profile,
    conditions: { source: [...sourceConditions], declaration: [...declarationConditions] },
    mechanicalState: 'blocked', sourceApproval: 'not-assessed', contentAcceptance: 'not-assessed',
    entrypoints: publicEntries, analyzedDependencies: packages.slice(1).map((pkg, inputIndex) => ({ inputIndex, name: pkg.metadata.name, version: pkg.metadata.version, sha256: pkg.sha256, lockPath: pkg.lockPath, files: pkg.files })),
    publicExports: subject.metadata.exports ?? null, declaredDependencies: subject.metadata.dependencies ?? {}, inputFiles: subject.files, resolverEdges: [], lanes: {}, inventory: [], diagnostics,
    artifacts: { inventory: 'inventory.json', sourceReflection: null, declarationReflection: null, sourceCandidates: [], declarationCandidates: [] } }
  for (const lane of ['source', 'declaration']) {
    const entries = publicEntries.filter((entry) => entry.disposition === 'inspect').flatMap((entry) => {
      const filename = resolveEntry(subject.root, entry[lane], lane, entry.subpath, diagnostics)
      return filename ? [{ subpath: entry.subpath, filename }] : []
    })
    const laneReport = { state: 'blocked', entrypoints: entries.map((entry) => entry.subpath), compilerOptions: { strict: true, skipLibCheck: false },
      conversionPolicy: 'Static conversion retains strict diagnostics; no upstream compiler configuration is loaded.',
      strictDiagnostics: [], extractionDiagnostics: [], exports: [], reflections: [], coverage: [] }
    report.lanes[lane] = laneReport
    if (!entries.length) continue
    const options = { allowJs: true, checkJs: lane === 'source', strict: true, skipLibCheck: false, noEmit: true, types: [],
      target: chain.ts.ScriptTarget.ES2022, module: chain.ts.ModuleKind.NodeNext, moduleResolution: chain.ts.ModuleResolutionKind.NodeNext }
    const denied = new Set()
    const edges = []
    const host = compilerHost(chain.ts, options, analysisRoot, chain.libRoot, packages, edges, denied, lane)
    const program = chain.ts.createProgram(entries.map((entry) => entry.filename), options, host)
    const compilerDiagnostics = chain.ts.getPreEmitDiagnostics(program)
    laneReport.strictDiagnostics = compilerDiagnostics.map((item) => ({ code: item.code, category: chain.ts.DiagnosticCategory[item.category],
      message: chain.ts.flattenDiagnosticMessageText(item.messageText, '\n'), file: item.file?.fileName, start: item.start, length: item.length }))
    laneReport.exports = census(chain.ts, program, entries, packageName, lane)
    if (lane === 'source' && entries.some((entry) => entry.filename.endsWith('.cjs') || (entry.filename.endsWith('.js') && subject.metadata.type !== 'module'))) {
      diagnostics.push(diagnostic('unsupported-module-format', 'The source profile requires declared ESM JavaScript or .mjs entrypoints.', { lane }))
    }
    if (laneReport.exports.some((row) => row.memberPath && row.kind === 'Namespace')) diagnostics.push(diagnostic('nested-namespace-scope', 'Nested namespace members are not qualified by the bounded pilot census.', { lane }))
    report.resolverEdges.push(...edges.map((edge) => ({ lane, ...edge })))
    if (compilerDiagnostics.length) diagnostics.push(diagnostic('compiler-diagnostics', `Strict ${lane} compilation has ${compilerDiagnostics.length} diagnostic(s); conversion remains explicitly relaxed evidence.`, { lane }))
    if (denied.size) diagnostics.push(diagnostic('read-boundary', `Compiler rejected ${denied.size} read(s) outside acquired inputs and trusted TypeScript libraries.`, { lane }))
    const unsafeFiles = program.getSourceFiles().filter((file) => !within(chain.libRoot, file.fileName) && /@(?:include(?:Code)?|document)\b/.test(file.text))
    if (unsafeFiles.length) {
      diagnostics.push(diagnostic('comment-read-directive', 'Upstream include/document directives require unsupported file reads; TypeDoc conversion was not run.', { lane, files: unsafeFiles.map((file) => file.fileName) }))
      continue
    }
    if (!laneReport.exports.length) {
      diagnostics.push(diagnostic('empty-exports', `No statically declared public ${lane} exports were found.`, { lane }))
      continue
    }
    const commonJs = program.getSourceFiles().filter((file) => within(subject.root, file.fileName) && /\b(?:module\.exports|exports\s*\[|exports\.[a-zA-Z_$])/.test(file.text))
    if (commonJs.length) diagnostics.push(diagnostic('unsupported-commonjs', 'Dynamic/CommonJS exports are outside the ESM pilot profile.', { lane }))
    try {
      const app = await chain.typedoc.Application.bootstrap({ name: packageName, entryPoints: entries.map((entry) => entry.filename),
        basePath: analysisRoot, readme: 'none', disableGit: true, excludePrivate: true, excludeProtected: true, excludeInternal: false,
        includeVersion: false, disableSources: true, logLevel: 'None' }, [])
      chain.markdown.load(app)
      // TypeDoc's validating registry otherwise checks arbitrary comment-link paths,
      // and the Markdown renderer copies registered media. Keep comment links as
      // scratch text; this pilot never acquires or copies local comment assets.
      app.files.register = (sourcePath, relativePath) => {
        diagnostics.push(diagnostic('local-comment-asset', 'Local comment file/media links are outside the extraction scope and were not read or copied.', { lane, sourcePath, relativePath }))
        return undefined
      }
      app.files.getNameToAbsoluteMap = () => new Map()
      for (const [key, value] of Object.entries({ sanitizeComments: true, useCodeBlocks: true, expandObjects: true, expandParameters: true, formatWithPrettier: false })) app.options.setValue(key, value)
      app.logger.log = (message, level) => { if (level >= chain.typedoc.LogLevel.Warn) laneReport.extractionDiagnostics.push({ level, message }) }
      app.options.setCompilerOptions(entries.map((entry) => entry.filename), options, undefined)
      // Supplying our restricted Program avoids TypeDoc's ambient tsconfig and filesystem resolution.
      chain.typedoc.resetReflectionID()
      const project = app.converter.convert(entries.map((entry) => ({ displayName: entry.subpath, sourceFile: program.getSourceFile(entry.filename), program })))
      const reflectionFile = `${lane}.reflection.json`
      const raw = app.serializer.projectToObject(project, analysisRoot)
      function checkAliases(node) {
        if (Array.isArray(node)) return node.forEach(checkAliases)
        if (!node || typeof node !== 'object') return
        if (node.kind === chain.typedoc.ReflectionKind.TypeAlias && node.type?.type === 'reference' && node.type.name === node.name &&
            node.type.target?.packageName === packageName) diagnostics.push(diagnostic('alias-rendering-gap', `Stock candidate retains a self-named alias without its local definition: ${node.name}.`, { lane, reflectionId: node.id }))
        Object.values(node).forEach(checkAliases)
      }
      checkAliases(raw)
      await writeFile(path.join(output, reflectionFile), json(normalizePaths(raw, analysisRoot, chain.libRoot)))
      report.artifacts[`${lane}Reflection`] = reflectionFile
      laneReport.reflections = reflections(chain.typedoc, project, entries, packageName, lane)
      const reflectionKeys = new Map(laneReport.reflections.map((row) => [row.key, row]))
      laneReport.coverage = laneReport.exports.map((row) => {
        const found = reflectionKeys.get(row.key)
        return { key: row.key, disposition: !found ? 'blocked-missing-reflection' : found.signatureCount < row.signatureCount ? 'blocked-missing-overload' : 'candidate',
          signatureCount: row.signatureCount, reflectionSignatureCount: found?.signatureCount ?? 0 }
      })
      for (const row of laneReport.coverage) if (row.disposition !== 'candidate') diagnostics.push(diagnostic('coverage-gap', row.disposition, { lane, key: row.key }))
      const exportKeys = new Set(laneReport.exports.map((row) => row.key))
      for (const row of laneReport.reflections) if (!exportKeys.has(row.key)) diagnostics.push(diagnostic('unaccounted-reflection', 'TypeDoc candidate item lacks an independent public-export disposition.', { lane, key: row.key }))
      const candidateRoot = path.join(output, `${lane}.candidate`)
      await app.outputs.writeOutput({ name: 'markdown', path: candidateRoot }, project)
      report.artifacts[`${lane}Candidates`] = (await listMarkdown(candidateRoot)).map((filename) => path.relative(output, filename).split(path.sep).join('/'))
      if (!report.artifacts[`${lane}Candidates`].length) diagnostics.push(diagnostic('empty-candidates', `No ${lane} Markdown candidates were generated.`, { lane }))
      if (laneReport.extractionDiagnostics.some((item) => item.level >= chain.typedoc.LogLevel.Error)) diagnostics.push(diagnostic('typedoc-diagnostics', `${lane} TypeDoc conversion/rendering reported errors.`, { lane }))
      laneReport.state = diagnostics.some((item) => item.lane === lane) ? 'partial' : 'complete'
      report.inventory.push(...laneReport.exports.map((row) => ({ ...row, ...laneReport.coverage.find((coverage) => coverage.key === row.key),
        reflectionId: reflectionKeys.get(row.key)?.reflectionId ?? null, inheritedFrom: reflectionKeys.get(row.key)?.inheritedFrom ?? null })))
    } catch (error) {
      diagnostics.push(diagnostic('extraction-failed', error.message, { lane }))
    }
  }
  const source = new Map(report.lanes.source.exports.map((row) => [row.key, row]))
  const declared = new Map(report.lanes.declaration.exports.map((row) => [row.key, row]))
  if (source.size && declared.size) {
    for (const key of new Set([...source.keys(), ...declared.keys()])) {
      const a = source.get(key)
      const b = declared.get(key)
      if (!a || !b) {
        // Type-only declaration exports are correctly absent from JavaScript runtime exports.
        if (!a && b && !report.lanes.declaration.exports.find((row) => row.subpath === b.subpath && row.exportName === b.exportName && !row.memberPath)?.value) continue
        diagnostics.push(diagnostic('source-declaration-export-difference', 'Public export/member differs between source and declaration lanes.', { key }))
      } else if (a.signatureCount !== b.signatureCount || json(a.signatures) !== json(b.signatures) || a.typeText !== b.typeText) {
        diagnostics.push(diagnostic('source-declaration-type-difference', 'Static source and declaration type evidence differ; retain both lanes for review.', { key, source: a.typeText, declaration: b.typeText }))
      }
    }
  }
  report.mechanicalState = Object.values(report.lanes).every((lane) => lane.state === 'blocked') ? 'blocked' : diagnostics.length || Object.values(report.lanes).some((lane) => lane.state !== 'complete') ? 'partial' : 'complete'
  const normalized = normalizePaths(report, analysisRoot, chain.libRoot)
  await writeFile(path.join(output, 'inventory.json'), json(normalized))
  return normalized
}
