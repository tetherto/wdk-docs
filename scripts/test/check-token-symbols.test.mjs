import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import {
  validateTokenSymbolFiles,
  validateTokenSymbols,
  validateVisibleTokenStrings
} from '../check-token-symbols.mjs'

test('accepts brand styling in prose and ASCII fallback text in code', () => {
  const content = [
    '# Send USD₮ and bridge USD₮0',
    '',
    'Use the exact `USDT` or `USDT0` symbol required by the API.',
    '',
    '```javascript title="Send USDt"',
    "const USDT = 'USDT'",
    "const route = 'tron:USDT'",
    'const amount = 1_000_000n // 1 USDt',
    "console.log('USDt balance:', amount)",
    '```',
    ''
  ].join('\n')

  assert.deepEqual(validateTokenSymbols(content), [])
})

test('rejects machine and ASCII fallback styling in prose', () => {
  const content = [
    '# Send USDT',
    '',
    'Bridge USDT0, then display USDt to the reader.',
    'Do not write usdt or usdt0 in reader-facing text.'
  ].join('\n')

  const issues = validateTokenSymbols(content)

  assert.deepEqual(issues.map((issue) => issue.value), [
    'USDT',
    'USDT0',
    'USDt',
    'usdt',
    'usdt0'
  ])
})

test('rejects Unicode styling and machine-style human text inside code fences', () => {
  const content = [
    '```javascript',
    "const symbol = 'USDT'",
    "const route = 'tron:USDT'",
    'const amount = 1_000_000n // 1 USD₮',
    '// Show the USDT balance.',
    "console.log('USDT balance:', amount)",
    '```'
  ].join('\n')

  const issues = validateTokenSymbols(content)

  assert.equal(issues.length, 3)
  assert(issues.some((issue) => issue.value === 'USD₮'))
  assert.equal(issues.filter((issue) => issue.value === 'USDT').length, 2)
})

test('treats code-fence titles as code-context display labels', () => {
  const issues = validateTokenSymbols([
    '```javascript title="Send USDT"',
    "const symbol = 'USDT'",
    '```'
  ].join('\n'))

  assert.deepEqual(issues.map((issue) => issue.value), ['USDT'])
})

test('checks bare prompt text and inline shell comments inside fences', () => {
  const promptIssues = validateTokenSymbols([
    '```',
    'Send 10 USDT',
    '```'
  ].join('\n'))
  const shellIssues = validateTokenSymbols([
    '```bash',
    'wdk balance # Check USDT',
    '```'
  ].join('\n'))

  assert.deepEqual(promptIssues.map((issue) => issue.value), ['USDT'])
  assert.deepEqual(shellIssues.map((issue) => issue.value), ['USDT'])
})

test('checks hash comments in Python and YAML fences', () => {
  const pythonIssues = validateTokenSymbols([
    '```python',
    'amount = 1  # Send USDT',
    '```'
  ].join('\n'))
  const yamlIssues = validateTokenSymbols([
    '```yaml',
    'symbol: USDT # Display USDT to the reader',
    '```'
  ].join('\n'))

  assert.deepEqual(pythonIssues.map((issue) => issue.value), ['USDT'])
  assert.deepEqual(yamlIssues.map((issue) => issue.value), ['USDT'])
})

test('preserves token spellings inside exact URL destinations', () => {
  const content = [
    '[USD₮ contract](https://example.test/assets/USDT)',
    '[provider output](https://example.test/assets/USDc)',
    '<a href="/assets/USDT">USD₮</a>',
    'Install @vendor/USDT-adapter.',
    '',
    '```javascript',
    "const endpoint = 'https://example.test/assets/USDT'",
    "const packageName = '@vendor/USDT-adapter'",
    '```'
  ].join('\n')

  assert.deepEqual(validateTokenSymbols(content), [])
})

test('preserves exact paths and hash-containing machine syntax', () => {
  const content = [
    'Path:/api/tokens/USDT',
    'route=/api/tokens/USDT',
    '',
    '```yaml',
    'endpoint: https://example.test/a#USDT',
    '```',
    '',
    '```bash',
    'trimmed=${value#USDT}',
    '```'
  ].join('\n')

  assert.deepEqual(validateTokenSymbols(content), [])
})

test('preserves lowercase machine values in code while rejecting lowercase UI copy', () => {
  const content = [
    'Use `usdt` only when the API requires it.',
    '',
    '```javascript',
    "const symbol = 'usdt'",
    '```'
  ].join('\n')

  assert.deepEqual(validateTokenSymbols(content), [])
  assert.deepEqual(
    validateVisibleTokenStrings("const label = 'send usdt'").map((issue) => issue.value),
    ['usdt']
  )
})

test('preserves USDC because it is a distinct token rather than a USD₮ style variant', () => {
  const content = [
    'This route swaps USDC for USD₮.',
    '',
    '```javascript',
    "const fromToken = 'USDC'",
    "const toToken = 'USDT'",
    '```'
  ].join('\n')

  assert.deepEqual(validateTokenSymbols(content), [])
})

test('rejects ambiguous casing and lookalike symbols without rejecting lowercase API values', () => {
  const content = 'USDc UsdT usdT USDŦ `usdt`'
  const issues = validateTokenSymbols(content)

  assert.deepEqual(issues.map((issue) => issue.value), ['USDc', 'UsdT', 'usdT', 'USDŦ'])
})

test('rejects noncanonical glyph casing in prose, code, and UI strings', () => {
  const content = [
    'Send Usd₮ or usd₮0.',
    '',
    '```javascript',
    'console.log("Usd₮ balance")',
    '```'
  ].join('\n')

  assert.deepEqual(validateTokenSymbols(content).map((issue) => issue.value), [
    'Usd₮',
    'usd₮0',
    'Usd₮'
  ])
  assert.deepEqual(
    validateVisibleTokenStrings("const label = 'Usd₮'").map((issue) => issue.value),
    ['Usd₮']
  )
})

test('checks reader-facing strings in navigation and search source files', () => {
  const content = [
    "folder('USDT0 bridge', '/sdk/bridge-usdt0-evm')",
    "const label = 'USDT'",
    "const label = 'usdt'",
    "const exactSymbol = 'USDT'"
  ].join('\n')
  const issues = validateVisibleTokenStrings(content)

  assert.deepEqual(issues.map((issue) => issue.value), ['USDT0', 'USDT', 'usdt'])
})

test('checks common reader-facing source sinks', () => {
  const source = [
    "showToast('USDT')",
    "setToastMessage('USDT')",
    "const heading = 'USDT'",
    "const labels = ['USDT']",
    'const view = <Button accessibilityHint="USDT" />'
  ].join('\n')

  assert.deepEqual(validateVisibleTokenStrings(source, { file: 'view.tsx' })
    .map((issue) => issue.value), [
    'USDT',
    'USDT',
    'USDT',
    'USDT',
    'USDT'
  ])
})

test('checks visible text around preserved package names and hostnames', () => {
  const content = [
    "const label = 'Send USDT with bridge-usdt0-evm'",
    "const description = 'Send USDT; see docs.usdt0.to'"
  ].join('\n')

  assert.deepEqual(validateVisibleTokenStrings(content).map((issue) => issue.value), [
    'USDT',
    'USDT'
  ])
})

test('rejects machine-style display suffixes in human-readable output calls', () => {
  const content = [
    '```javascript',
    "const symbol = 'USDT'",
    "console.log('USDT')",
    "console.log(balance, 'USDT')",
    "console.log('USDt balance:', amount, 'USDT')",
    '```',
    '',
    '```python',
    "print('USDT')",
    '```'
  ].join('\n')

  assert.deepEqual(validateTokenSymbols(content).map((issue) => issue.value), [
    'USDT',
    'USDT',
    'USDT',
    'USDT'
  ])
})

test('preserves machine strings outside or nested within output calls', () => {
  const content = [
    '```javascript',
    "const symbol = 'USDT'; console.log('ready')",
    "registerToken('USDT'); console.log('registered')",
    "console.log({ symbol: 'USDT' })",
    "console.log(getToken('USDT'))",
    '```'
  ].join('\n')

  assert.deepEqual(validateTokenSymbols(content), [])
})

test('checks multiline output arguments and redundant grouping', () => {
  const content = [
    '```javascript',
    'console.log(',
    '  balance,',
    "  'USDT'",
    ')',
    "console.log(('USDT'))",
    '```'
  ].join('\n')

  assert.deepEqual(validateTokenSymbols(content).map((issue) => issue.value), [
    'USDT',
    'USDT'
  ])
})

test('checks multiline template strings, Python strings, and HTML comments', () => {
  const content = [
    '```javascript',
    'console.log(`',
    'Balance: 10 USDT',
    '`)',
    '<!-- Show USDT balance -->',
    '```',
    '',
    '```python',
    "message = '''",
    'Send 10 USDT',
    "'''",
    '```'
  ].join('\n')

  assert.deepEqual(validateTokenSymbols(content).map((issue) => issue.value), [
    'USDT',
    'USDT',
    'USDT'
  ])
})

test('checks JSX labels, YAML labels, and shell output without flagging variables', () => {
  const content = [
    '```tsx',
    'return <Button title="USDT" />',
    'return <img alt="USDT" />',
    "return <img alt={ok ? 'USDT' : 'USDC'} />",
    'return <Text>USDT</Text>',
    "return <Text>{'USDT'}</Text>",
    'return <a>USDT</a>',
    'return <li>usdt</li>',
    'return <Text>',
    '  USDT',
    '</Text>',
    '```',
    '',
    '```yaml',
    'label: USDT',
    'description: Send USDT now',
    'description: https://docs.usdt0.to',
    'label: @vendor/usdt-adapter',
    '```',
    '',
    '```bash',
    'echo USDT',
    'echo "USDT"',
    'echo "$USDT"',
    'echo "${USDT}"',
    '```'
  ].join('\n')

  assert.deepEqual(validateTokenSymbols(content).map((issue) => issue.value), [
    'USDT',
    'USDT',
    'USDT',
    'USDT',
    'USDT',
    'USDT',
    'usdt',
    'USDT',
    'USDT',
    'USDT',
    'USDT',
    'USDT'
  ])
})

test('checks JSX expression text and slash-prefixed display labels in source and docs', () => {
  const source = [
    "const text = <Text>{'USDT'}</Text>",
    'const link = <a>USDT</a>',
    'const item = <li>usdt</li>',
    "const image = <img alt={ok ? 'USDT' : 'USDC'} />",
    'const input = <input placeholder="/pay USDT" />'
  ].join('\n')
  const docs = [
    '<input placeholder="/pay USDT" />',
    '',
    '```tsx',
    'return <Button title="/pay USDT" />',
    '```'
  ].join('\n')

  assert.deepEqual(validateVisibleTokenStrings(source).map((issue) => issue.value), [
    'USDT',
    'USDT',
    'usdt',
    'USDT',
    'USDT'
  ])
  assert.deepEqual(validateTokenSymbols(docs).map((issue) => issue.value), [
    'USDT',
    'USDT'
  ])
})

test('requires an explicit escape for exact copied output', () => {
  const copiedOutput = [
    '```text verbatim-output',
    'USDT balance: 1',
    'https://provider.test/assets/USDT',
    '```'
  ].join('\n')
  const authoredOutput = [
    '```text',
    'USDT balance: 1',
    'https://provider.test/assets/USDT',
    '```'
  ].join('\n')

  assert.deepEqual(validateTokenSymbols(copiedOutput), [])
  assert.deepEqual(
    validateTokenSymbols(authoredOutput).map((issue) => issue.value),
    ['USDT']
  )

  const executableEscape = [
    '```javascript verbatim-output',
    "console.log('USDT balance') // USD₮ output",
    '```'
  ].join('\n')
  assert.deepEqual(
    validateTokenSymbols(executableEscape).map((issue) => issue.value),
    ['verbatim-output', 'USDT', 'USD₮']
  )
})

test('supports tilde fences and exact quoted symbols in comments', () => {
  const content = [
    '~~~javascript title="Inspect USDt"',
    "server.getRegisteredTokens('ethereum') // ['USDT']",
    '~~~'
  ].join('\n')

  assert.deepEqual(validateTokenSymbols(content), [])
})

test('rejects attached prose variants without rejecting exact source names', () => {
  const issues = validateTokenSymbols([
    'USDT-backed USDt-denominated usdt-only UsdT-backed.',
    'Do not pluralize USDTs or add digits as USDT00.',
    'Do not use UsdŦ, usdŧ0, or Usd₮.',
    'Keep [x402-usdt0](https://github.com/example/x402-usdt0) exact.',
    'Keep wdk-protocol-bridge-usdt0-evm exact.'
  ].join('\n'))

  assert.deepEqual(issues.map((issue) => issue.value), [
    'USDT',
    'USDt',
    'usdt',
    'UsdT',
    'USDTs',
    'USDT00',
    'UsdŦ',
    'usdŧ0',
    'Usd₮'
  ])
})

test('uses parser-backed JSX and source checks across multiline display expressions', () => {
  const docs = [
    '```tsx',
    'return (',
    '  <Badge>',
    '    USDT',
    '  </Badge>',
    ')',
    'return <strong>USDT</strong>',
    'return <Link>USDT</Link>',
    'return <img',
    '  alt={',
    "    ok ? 'USDT' : 'USDC'",
    '  }',
    '/>',
    '```'
  ].join('\n')
  const source = [
    'const badge = <Badge>USDT</Badge>',
    'const image = <img',
    '  alt={',
    "    ok ? 'USDT' : 'USDC'",
    '  }',
    '/>',
    'const title = `',
    'USDT',
    '`',
    "const tokenLabel = 'USDT'"
  ].join('\n')

  assert.deepEqual(validateTokenSymbols(docs).map((issue) => issue.value), [
    'USDT',
    'USDT',
    'USDT',
    'USDT'
  ])
  assert.deepEqual(validateVisibleTokenStrings(source).map((issue) => issue.value), [
    'USDT',
    'USDT',
    'USDT',
    'USDT'
  ])
})

test('checks MDX expression children, wrapped attributes, and generic source labels', () => {
  const docs = [
    "<Text>{'USDT'}</Text>",
    "<Card title={String('USDT')} />"
  ].join('\n')
  const source = [
    "const UPPERCASE_SEGMENTS = new Map([['usdt0', 'USDT0']])",
    "const config = { name: 'USDT' }",
    "const copy = 'USDT'",
    "const displayName = 'USDT'"
  ].join('\n')

  assert.deepEqual(validateTokenSymbols(docs).map((issue) => issue.value), [
    'USDT',
    'USDT'
  ])
  assert.deepEqual(validateVisibleTokenStrings(source, {
    file: 'scripts/generate-search-index.mjs'
  }).map((issue) => issue.value), [
    'USDT0',
    'USDT',
    'USDT',
    'USDT'
  ])
})

test('checks Markdown accessibility text, titles, and top-level MDX expressions', () => {
  const content = [
    '![USDT token](./token.png "USDT image")',
    '[token](./token "USDT link")',
    "{'USDT'}"
  ].join('\n')

  assert.deepEqual(validateTokenSymbols(content).map((issue) => issue.value), [
    'USDT',
    'USDT',
    'USDT',
    'USDT'
  ])
})

test('classifies machine assignments, class fields, return values, and token metadata', () => {
  const content = [
    '```javascript',
    "config.symbol = 'USDt'",
    "class Token { symbol = 'USDt' }",
    "function getSymbol() { return 'USDt' }",
    "const metadata = { name: 'USDT', symbol: 'USDT', decimals: 6 }",
    '```'
  ].join('\n')

  assert.deepEqual(validateTokenSymbols(content).map((issue) => issue.value), [
    'USDt',
    'USDt',
    'USDt'
  ])
})

test('checks multiline JSON and YAML display text', () => {
  const content = [
    '```json',
    '{',
    '  "label":',
    '    "USDT"',
    '}',
    '```',
    '',
    '```yaml',
    'description: |',
    '  Send USDT',
    '```'
  ].join('\n')

  assert.deepEqual(validateTokenSymbols(content).map((issue) => issue.value), [
    'USDT',
    'USDT'
  ])
})

test('classifies inline machine syntax without changing inline display text', () => {
  const exact = [
    "`getToken('USDT')`",
    "`symbol: 'USDT'`",
    '`--token USDT`'
  ].join(' ')
  const fallback = [
    "`getToken('USDt')`",
    "`symbol: 'USDt'`",
    '`--token USDt`',
    "`console.log('USDt')`"
  ].join(' ')

  assert.deepEqual(validateTokenSymbols(exact), [])
  assert.deepEqual(validateTokenSymbols(fallback).map((issue) => issue.value), [
    'USDt',
    'USDt',
    'USDt'
  ])
})

test('checks generic logging, errors, JSON labels, and copied-output fences', () => {
  const docs = [
    '```javascript',
    "logger.info(balance, 'USDT')",
    "throw new Error('USDT')",
    "console.log('usdt')",
    '```',
    '',
    '```json',
    '{"label":"USDT"}',
    '```',
    '',
    '```console',
    'USDT balance: 1',
    '```',
    '',
    '```shellsession',
    '$ balance USDT',
    '```'
  ].join('\n')
  const copied = [
    '```console verbatim-output',
    'USDT balance: 1',
    '```'
  ].join('\n')

  assert.deepEqual(validateTokenSymbols(docs).map((issue) => issue.value), [
    'USDT',
    'USDT',
    'usdt',
    'USDT',
    'USDT',
    'USDT'
  ])
  assert.deepEqual(validateTokenSymbols(copied), [])
})

test('rejects fallback styling in machine sinks and glyph styling in source symbols', () => {
  const docs = [
    '```javascript',
    "const symbol = 'USDt'",
    "registerToken('USDt')",
    "const config = { token: 'USD₮' }",
    '```'
  ].join('\n')
  const source = [
    "const symbol = 'USD₮'",
    "const exactSymbol = 'USDT'"
  ].join('\n')

  assert.deepEqual(validateTokenSymbols(docs).map((issue) => issue.value), [
    'USDt',
    'USDt',
    'USD₮'
  ])
  assert.deepEqual(validateVisibleTokenStrings(source).map((issue) => issue.value), [
    'USD₮'
  ])
})

test('preserves exact token names in protocol metadata', () => {
  const content = [
    '```javascript',
    'const price = {',
    '  asset: USDT0,',
    '  extra: { name: "USDT0", version: "1", decimals: 6 },',
    '}',
    '```'
  ].join('\n')

  assert.deepEqual(validateTokenSymbols(content), [])
})

test('enforces machine styling in JSON, YAML, Python, and shell assignments', () => {
  const content = [
    '```json',
    '{',
    '  "symbol": "USDt"',
    '}',
    '```',
    '',
    '```yaml',
    'settings:',
    '  token: USD₮',
    'assets:',
    '  - symbol: USDt',
    '```',
    '',
    '```python',
    'def configure():',
    "    symbol = 'USDt'",
    "configure(symbol='USDt')",
    '```',
    '',
    '```bash',
    'if true; then',
    '  TOKEN=USDt',
    '  export TOKEN=USDt',
    'fi',
    '```'
  ].join('\n')

  assert.deepEqual(validateTokenSymbols(content).map((issue) => issue.value), [
    'USDt',
    'USD₮',
    'USDt',
    'USDt',
    'USDt',
    'USDt',
    'USDt'
  ])
})

test('rejects uppercase plurals and noncanonical numeric suffixes', () => {
  const content = 'USDTS USD₮S USDT1 USD₮1'

  assert.deepEqual(validateTokenSymbols(content).map((issue) => issue.value), [
    'USDTS',
    'USD₮S',
    'USDT1',
    'USD₮1'
  ])
})

test('preserves exact paths, namespaces, composite symbols, and nested machine calls', () => {
  const prose = [
    'Reference route /api/tokens/USDT.',
    '[route]: /api/tokens/USDT',
    'Use `USDT/USDC` when the API requires the pair.'
  ].join('\n')
  const code = [
    '```javascript',
    "const route = '/api/tokens/USDT'",
    "const pair = 'USDT/USDC'",
    "console.log(getToken('USDT'))",
    "const symbol = 'USDT' // bsc:USDT",
    '```'
  ].join('\n')

  assert.deepEqual(validateTokenSymbols(prose), [])
  assert.deepEqual(validateTokenSymbols(code), [])
})

test('includes generated LLM artifacts in the repository-level gate', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'wdk-token-symbols-'))
  const artifact = path.join(root, 'public/llms-full.txt')
  await mkdir(path.dirname(artifact), { recursive: true })
  await writeFile(artifact, '# Send USDT\n', 'utf8')

  const { issues } = await validateTokenSymbolFiles({
    root,
    sourceDirectories: [],
    visibleSourceFiles: [],
    generatedMarkdownFiles: ['public/llms-full.txt']
  })

  assert.deepEqual(issues.map((issue) => [issue.file, issue.value]), [
    ['public/llms-full.txt', 'USDT']
  ])
})

test('optionally validates generated build Markdown', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'wdk-token-build-output-'))
  const artifact = path.join(root, 'dist/page.md')
  await mkdir(path.dirname(artifact), { recursive: true })
  await writeFile(artifact, '# Send USDT\n', 'utf8')

  const { issues } = await validateTokenSymbolFiles({
    root,
    sourceDirectories: [],
    visibleSourceDirectories: [],
    visibleSourceFiles: [],
    generatedMarkdownFiles: [],
    buildOutputDirectories: ['dist']
  })

  assert.deepEqual(issues.map((issue) => [issue.file, issue.value]), [
    ['dist/page.md', 'USDT']
  ])
})
