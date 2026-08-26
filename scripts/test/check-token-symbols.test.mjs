import test from 'node:test'
import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

import {
  validateTokenSymbolFiles,
  validateTokenSymbols,
  validateVisibleTokenStrings
} from '../check-token-symbols.mjs'

const execFileAsync = promisify(execFile)
const CHECKER_PATH = fileURLToPath(new URL('../check-token-symbols.mjs', import.meta.url))

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

test('validates governed components inside composite machine symbols', () => {
  const valid = [
    'USDT/USDC XAUT/USAT XAUt/USDT',
    '',
    '```javascript',
    "const pairs = ['USDT/USDC', 'XAUT/USAT', 'XAUt/USDT']",
    '```'
  ].join('\n')
  const invalid = [
    'USAT0/XAUT CHNT/USDT XAUT01/CNHT',
    '',
    '```javascript',
    "const pairs = ['USAT0/XAUT', 'CHNT/USDT', 'XAUT01/CNHT']",
    '```'
  ].join('\n')

  assert.deepEqual(validateTokenSymbols(valid), [])
  assert.deepEqual(validateTokenSymbols(invalid).map((issue) => issue.value), [
    'USAT0', 'CHNT', 'XAUT01',
    'USAT0', 'CHNT', 'XAUT01'
  ])
})

test('accepts every explicitly supported Tether family by context', () => {
  const content = [
    '# USD₮, USA₮, XAU₮, MXN₮, CNH₮, and EUR₮',
    '',
    'Bridge USD₮0, XAU₮0, or CNH₮0.',
    '',
    '```javascript title="USDt, USAt, XAUt, MXNt, CNHt, and EURt"',
    "const symbols = ['USDT', 'USDT0', 'usdt', 'usdt0', 'USAT', 'usat', 'XAUT', 'XAUT0', 'xaut', 'xaut0', 'XAUt', 'MXNT', 'mxnt', 'CNHT', 'CNHT0', 'cnht', 'cnht0', 'EURT', 'eurt']",
    '// USDt, USAt, XAUt, MXNt, CNHt, and EURt',
    "console.log('USDt0, XAUt0, and CNHt0')",
    '```'
  ].join('\n')

  assert.deepEqual(validateTokenSymbols(content), [])
})

test('rejects machine and fallback forms for every family in prose', () => {
  const content = [
    'USDT USDt usdt',
    'USAT USAt usat',
    'XAUT XAUt xaut',
    'MXNT MXNt mxnt',
    'CNHT CNHt cnht',
    'EURT EURt eurt',
    'USDT0 USDt0 usdt0',
    'XAUT0 XAUt0 xaut0',
    'CNHT0 CNHt0 cnht0'
  ].join('\n')

  assert.deepEqual(validateTokenSymbols(content).map((issue) => issue.value), [
    'USDT', 'USDt', 'usdt',
    'USAT', 'USAt', 'usat',
    'XAUT', 'XAUt', 'xaut',
    'MXNT', 'MXNt', 'mxnt',
    'CNHT', 'CNHt', 'cnht',
    'EURT', 'EURt', 'eurt',
    'USDT0', 'USDt0', 'usdt0',
    'XAUT0', 'XAUt0', 'xaut0',
    'CNHT0', 'CNHt0', 'cnht0'
  ])
})

test('requires ASCII fallbacks for family display text inside code', () => {
  const content = [
    '```javascript',
    '// USDT USD₮ USAT USA₮ XAUT XAU₮ MXNT MXN₮ CNHT CNH₮ EURT EUR₮',
    '// USDT0 USD₮0 XAUT0 XAU₮0 CNHT0 CNH₮0',
    '// USDt USAt XAUt MXNt CNHt EURt USDt0 XAUt0 CNHt0',
    '```'
  ].join('\n')

  assert.deepEqual(validateTokenSymbols(content).map((issue) => issue.value), [
    'USDT', 'USD₮', 'USAT', 'USA₮', 'XAUT', 'XAU₮',
    'MXNT', 'MXN₮', 'CNHT', 'CNH₮', 'EURT', 'EUR₮',
    'USDT0', 'USD₮0', 'XAUT0', 'XAU₮0', 'CNHT0', 'CNH₮0'
  ])
})

test('preserves documented machine values and rejects display styling in machine sinks', () => {
  const content = [
    '```javascript',
    "const accepted = [{ symbol: 'USDT' }, { symbol: 'USDT0' }, { symbol: 'usdt' }, { symbol: 'USAT' }, { symbol: 'usat' }, { symbol: 'XAUT' }, { symbol: 'XAUT0' }, { symbol: 'xaut' }, { symbol: 'XAUt' }, { symbol: 'MXNT' }, { symbol: 'mxnt' }, { symbol: 'CNHT' }, { symbol: 'CNHT0' }, { symbol: 'cnht' }, { symbol: 'EURT' }, { symbol: 'eurt' }]",
    "const rejected = [{ symbol: 'USDt' }, { symbol: 'USD₮' }, { symbol: 'USAt' }, { symbol: 'USA₮' }, { symbol: 'XAU₮' }, { symbol: 'XAUt0' }, { symbol: 'XAU₮0' }, { symbol: 'MXNt' }, { symbol: 'MXN₮' }, { symbol: 'CNHt' }, { symbol: 'CNH₮' }, { symbol: 'CNHt0' }, { symbol: 'CNH₮0' }, { symbol: 'EURt' }, { symbol: 'EUR₮' }]",
    '```'
  ].join('\n')

  assert.deepEqual(validateTokenSymbols(content).map((issue) => issue.value), [
    'USDt', 'USD₮', 'USAt', 'USA₮', 'XAU₮', 'XAUt0', 'XAU₮0',
    'MXNt', 'MXN₮', 'CNHt', 'CNH₮', 'CNHt0', 'CNH₮0', 'EURt', 'EUR₮'
  ])
})

test('rejects unsupported derivatives, suffixes, plurals, casing, and lookalikes', () => {
  const content = [
    'USA₮0 USAt0 USAT0 MXN₮0 MXNt0 MXNT0 EUR₮0 EURt0 EURT0',
    'USD₮00 USDt1 USDT01 XAU₮1 XAUt1 XAUT01 CNH₮00 CNHt1 CNHT01',
    'USD0T XAU0₮ CNH0t',
    'USD₮s XAUts CNHTS eurts USDT0s',
    'Usd₮ xauŦ Cnhŧ0 CHN₮ CHNt CHNT'
  ].join('\n')
  const issues = validateTokenSymbols(content)

  assert.deepEqual(issues.map((issue) => issue.value), [
    'USA₮0', 'USAt0', 'USAT0', 'MXN₮0', 'MXNt0', 'MXNT0', 'EUR₮0', 'EURt0', 'EURT0',
    'USD₮00', 'USDt1', 'USDT01', 'XAU₮1', 'XAUt1', 'XAUT01', 'CNH₮00', 'CNHt1', 'CNHT01',
    'USD0T', 'XAU0₮', 'CNH0t',
    'USD₮s', 'XAUts', 'CNHTS', 'eurts', 'USDT0s',
    'Usd₮', 'xauŦ', 'Cnhŧ0', 'CHN₮', 'CHNt', 'CHNT'
  ])
  assert.match(issues[0].reason, /Use USA₮ in reader-facing text/)
  assert.match(issues.find((issue) => issue.value === 'CHN₮').reason, /Use CNH₮/)
})

test('exhaustively enforces canonical casing, terminal, and suffix combinations', () => {
  const contracts = [
    { roots: ['USD'], reader: ['USD₮', 'USD₮0'], codeHuman: ['USDt', 'USDt0'], machine: ['USDT', 'USDT0', 'usdt', 'usdt0'] },
    { roots: ['USA'], reader: ['USA₮'], codeHuman: ['USAt'], machine: ['USAT', 'usat'] },
    { roots: ['XAU'], reader: ['XAU₮', 'XAU₮0'], codeHuman: ['XAUt', 'XAUt0'], machine: ['XAUT', 'XAUT0', 'xaut', 'xaut0', 'XAUt'] },
    { roots: ['MXN'], reader: ['MXN₮'], codeHuman: ['MXNt'], machine: ['MXNT', 'mxnt'] },
    { roots: ['CNH', 'CHN'], reader: ['CNH₮', 'CNH₮0'], codeHuman: ['CNHt', 'CNHt0'], machine: ['CNHT', 'CNHT0', 'cnht', 'cnht0'] },
    { roots: ['EUR'], reader: ['EUR₮'], codeHuman: ['EURt'], machine: ['EURT', 'eurt'] }
  ]
  const candidates = []

  for (const contract of contracts) {
    for (const root of contract.roots) {
      for (let mask = 0; mask < 2 ** root.length; mask += 1) {
        const casing = [...root]
          .map((character, index) => (mask & (1 << index) ? character.toLowerCase() : character))
          .join('')
        for (const terminal of ['T', 't', '₮', 'Ŧ', 'ŧ']) {
          for (const suffix of ['', '0', '1', '00', 's', 'S']) {
            candidates.push(`${casing}${terminal}${suffix}`)
          }
        }
      }
    }
  }

  const uniqueCandidates = [...new Set(candidates)]
  const acceptedReader = new Set(contracts.flatMap((contract) => contract.reader))
  const acceptedCode = new Set(contracts.flatMap((contract) => contract.codeHuman))
  const acceptedMachine = new Set(contracts.flatMap((contract) => contract.machine))
  const expectedIssues = (accepted) => uniqueCandidates.filter((value) => !accepted.has(value))
  const prose = uniqueCandidates.join('\n')
  const code = ['```text', ...uniqueCandidates, '```'].join('\n')
  const machine = [
    '```json',
    '[',
    ...uniqueCandidates.map((value, index) => (
      `  { "symbol": "${value}" }${index === uniqueCandidates.length - 1 ? '' : ','}`
    )),
    ']',
    '```'
  ].join('\n')

  assert.deepEqual(
    validateTokenSymbols(prose).map((issue) => issue.value),
    expectedIssues(acceptedReader)
  )
  assert.deepEqual(
    validateTokenSymbols(code).map((issue) => issue.value),
    expectedIssues(acceptedCode)
  )
  assert.deepEqual(
    validateTokenSymbols(machine).map((issue) => issue.value),
    expectedIssues(acceptedMachine)
  )
})

test('does not overmatch other tickers, currency roots, or the excluded Alloy family', () => {
  const content = [
    'USD USA XAU MXN CNH EUR',
    'XAU/USD EUR/USD USAToday USDC APT WSTETH',
    'aUSD₮ aUSDT'
  ].join('\n')

  assert.deepEqual(validateTokenSymbols(content), [])
})

test('preserves exact family values while still checking adjacent reader copy', () => {
  const content = [
    'Use gold:XAUT, asia:CNHT0, XAUT/USAT, and USAT_TOKEN_ADDRESS exactly.',
    'See https://example.test/assets/XAUT and /api/tokens/CNHT0.',
    'Install @vendor/xaut-adapter or wdk-protocol-bridge-xaut-evm.',
    'Send XAUT using @vendor/xaut-adapter.'
  ].join('\n')

  const issues = validateTokenSymbols(content)
  assert.deepEqual(issues.map((issue) => issue.value), ['XAUT'])
  assert.equal(issues[0].line, 4)
})

test('preserves exact hyphenated asset IDs without hiding attached reader copy', () => {
  const content = [
    '```javascript',
    "const ids = ['usdt-ethereum', 'usat-ethereum', 'xaut-ethereum', 'mxnt-polygon', 'cnht0-ethereum', 'eurt-ethereum']",
    "const label = 'Send xaut-only or usat-backed tokens'",
    '```'
  ].join('\n')

  assert.deepEqual(validateTokenSymbols(content).map((issue) => issue.value), [
    'xaut', 'usat'
  ])
})

test('checks XAU and CNH sentinels across structured code contexts', () => {
  const content = [
    '```tsx',
    'return <Button title="XAUT" accessibilityHint="CNHT" />',
    '```',
    '',
    '```yaml',
    'description: Send XAUT',
    'symbol: CNHT',
    '```',
    '',
    '```python',
    "print('CNHT')",
    "configure(symbol='XAUT')",
    '```',
    '',
    '```bash',
    'echo XAUT',
    'TOKEN=CNHT',
    '```'
  ].join('\n')

  assert.deepEqual(validateTokenSymbols(content).map((issue) => issue.value), [
    'XAUT', 'CNHT', 'XAUT', 'CNHT', 'XAUT'
  ])
})

test('masks nested machine values in generic output without duplicate diagnostics', () => {
  const python = [
    '```python',
    "print({'symbol': 'XAUT'})",
    "print(symbol='XAUT')",
    "print({'symbol': 'XAUt0'})",
    "print(label='XAUT')",
    '```'
  ].join('\n')
  const shell = [
    '```bash',
    "echo '{\"symbol\":\"XAUT\"}'",
    "echo '{\"symbol\":\"XAUt0\"}'",
    'echo XAUt # Show XAUT',
    '```'
  ].join('\n')
  const yaml = [
    '```yaml',
    'label: XAUt # Show XAUT',
    '```'
  ].join('\n')

  assert.deepEqual(validateTokenSymbols(python).map((issue) => issue.value), [
    'XAUt0', 'XAUT'
  ])
  assert.deepEqual(validateTokenSymbols(shell).map((issue) => issue.value), [
    'XAUt0', 'XAUT'
  ])
  assert.deepEqual(validateTokenSymbols(yaml).map((issue) => issue.value), ['XAUT'])
})

test('validates unquoted namespaced machine values in YAML and shell', () => {
  const content = [
    '```yaml',
    'symbol: gold:XAUT',
    'token: asia:CNHT0',
    'fromToken: gold:USAT0',
    'toToken: asia:CHNT',
    '```',
    '',
    '```bash',
    'TOKEN=gold:XAUT',
    'export TOKEN=gold:EURT0',
    '```'
  ].join('\n')

  assert.deepEqual(validateTokenSymbols(content).map((issue) => issue.value), [
    'USAT0', 'CHNT', 'EURT0'
  ])
})

test('validates multiline machine values in YAML and Python without duplicates', () => {
  const invalid = [
    '```yaml',
    'symbol: |',
    '  USAT0',
    'token:',
    '  XAUt0',
    '```',
    '',
    '```python',
    'config = {',
    '  "symbol":',
    '  "XAUt0",',
    '  "token":',
    '  "USAT0",',
    '}',
    '```'
  ].join('\n')
  const exact = [
    '```yaml',
    'symbol: >',
    '  XAUT',
    'token:',
    '  CNHT0',
    '```',
    '',
    '```python',
    'config = {',
    '  "symbol":',
    '  "XAUT",',
    '  "token":',
    '  "CNHT0",',
    '}',
    '```'
  ].join('\n')

  assert.deepEqual(validateTokenSymbols(invalid).map((issue) => issue.value), [
    'USAT0', 'XAUt0', 'XAUt0', 'USAT0'
  ])
  assert.deepEqual(validateTokenSymbols(exact), [])
})

test('scans YAML block scalars once in their outer field context', () => {
  const invalid = [
    '```yaml',
    'symbol: |',
    '  token: USAT0',
    'tokenSymbol: >',
    '  echo CHNT',
    'label: |',
    '  token: XAUT',
    '  "USAŦ"',
    '"message": >',
    '  # USAT',
    '```'
  ].join('\n')
  const exact = [
    '```yaml',
    'symbol: |',
    '  token: USAT',
    'tokenSymbol: >',
    '  echo CNHT',
    'label: |',
    '  token: XAUt',
    '  "USAt"',
    '"message": >',
    '  # USAt',
    '```'
  ].join('\n')

  assert.deepEqual(validateTokenSymbols(invalid).map((issue) => issue.value), [
    'USAT0', 'CHNT', 'XAUT', 'USAŦ', 'USAT'
  ])
  assert.deepEqual(validateTokenSymbols(exact), [])
})

test('validates every governed component in generic machine composites', () => {
  const invalid = [
    '```yaml',
    'symbol: XAUT/USAT0',
    'token: CNHT0/CHNT',
    'asset: gold:XAUT/USAT0',
    'fromToken: "USAT0/XAUT"',
    '```',
    '',
    '```python',
    'config = {',
    "  'symbol': 'XAUT/USAT0',",
    "  'token':",
    "  'CNHT0/CHNT',",
    '}',
    '```',
    '',
    '```bash',
    'TOKEN=XAUT/USAT0',
    'TOKEN=USAT0/XAUT',
    '```'
  ].join('\n')
  const exact = [
    '```yaml',
    'symbol: XAUT/USAT',
    'token: CNHT0/CNHT',
    'asset: gold:XAUt/USAT',
    'fromToken: "USAT/XAUT"',
    '```',
    '',
    '```python',
    'config = {',
    "  'symbol': 'XAUT/USAT',",
    "  'token':",
    "  'CNHT0/CNHT',",
    '}',
    '```',
    '',
    '```bash',
    'TOKEN=XAUT/USAT',
    'TOKEN=USAT/XAUT',
    '```'
  ].join('\n')
  const expected = [
    'USAT0', 'CHNT', 'USAT0', 'USAT0',
    'USAT0', 'CHNT', 'USAT0', 'USAT0'
  ]

  assert.deepEqual(validateTokenSymbols(invalid).map((issue) => issue.value), expected)
  assert.deepEqual(
    validateTokenSymbols(invalid.replaceAll('\n', '\r\n')).map((issue) => issue.value),
    expected
  )
  assert.deepEqual(validateTokenSymbols(exact), [])
})

test('checks display text beside machine values and after shell separators', () => {
  const invalid = [
    '```python',
    "configure(symbol='XAUT', note='USAT')",
    "configure(symbol='XAUT', other='USAŦ')",
    "configure(symbol='USAT0', other='USAŦ')",
    "symbol='XAUT'; print('USAT')",
    '```',
    '',
    '```bash',
    'TOKEN=XAUT; echo USAT',
    "TOKEN=XAUT; VALUE='ignore | echo USAT'",
    '```'
  ].join('\n')
  const exact = [
    '```python',
    "configure(symbol='XAUT', note='USAt')",
    "configure(symbol='XAUT', other='USAt')",
    "configure(symbol='USAT', other='USAt')",
    "symbol='XAUT'; print('USAt')",
    '```',
    '',
    '```bash',
    'TOKEN=XAUT && echo USAt',
    '```'
  ].join('\n')

  assert.deepEqual(validateTokenSymbols(invalid).map((issue) => `${issue.line}:${issue.value}`), [
    '2:USAT', '3:USAŦ', '4:USAT0', '4:USAŦ', '5:USAT', '9:USAT', '10:USAT'
  ])
  assert.deepEqual(validateTokenSymbols(exact), [])

  const reverseOrder = [
    '```python',
    "configure(other='USAŦ', symbol='USAT0')",
    '```'
  ].join('\n')
  assert.deepEqual(validateTokenSymbols(reverseOrder).map((issue) => issue.value), [
    'USAŦ', 'USAT0'
  ])

  const repeatedValue = [
    '```python',
    "configure(other='USAT0', symbol='USAT0')",
    '```'
  ].join('\n')
  const repeatedIssues = validateTokenSymbols(repeatedValue)
  assert.deepEqual(repeatedIssues.map((issue) => issue.value), ['USAT0', 'USAT0'])
  assert.match(repeatedIssues[0].reason, /human-readable text/)
  assert.match(repeatedIssues[1].reason, /Preserve an exact USA machine value/)
})

test('CLI exits nonzero with deterministic diagnostics for invalid source files', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'wdk-token-cli-source-'))
  const source = path.join(root, 'content/docs/example.mdx')
  await mkdir(path.dirname(source), { recursive: true })
  await writeFile(source, '# Canonical USD₮\n\nSend XAUT.\nUse CHN₮.\n', 'utf8')

  await assert.rejects(
    execFileAsync(process.execPath, [CHECKER_PATH, '--root', root]),
    (error) => {
      assert.equal(error.code, 1)
      assert.match(error.stderr, /content\/docs\/example\.mdx:3/)
      assert.match(error.stderr, /found: XAUT/)
      assert.match(error.stderr, /content\/docs\/example\.mdx:4/)
      assert.match(error.stderr, /found: CHN₮/)
      return true
    }
  )
})

test('CLI only scans build output when explicitly requested', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'wdk-token-cli-build-'))
  const artifact = path.join(root, 'dist/page.md')
  await mkdir(path.dirname(artifact), { recursive: true })
  await writeFile(artifact, '# Send USAT\n', 'utf8')

  const clean = await execFileAsync(process.execPath, [CHECKER_PATH, `--root=${root}`])
  assert.match(clean.stdout, /validated 0 documentation source files/)

  await assert.rejects(
    execFileAsync(process.execPath, [CHECKER_PATH, '--root', root, '--include-build-output']),
    (error) => {
      assert.equal(error.code, 1)
      assert.match(error.stderr, /dist\/page\.md:1/)
      assert.match(error.stderr, /found: USAT/)
      return true
    }
  )
})

test('CLI fails closed for missing and non-directory roots', async () => {
  const parent = await mkdtemp(path.join(tmpdir(), 'wdk-token-cli-root-'))
  const missingRoot = path.join(parent, 'missing')
  const fileRoot = path.join(parent, 'root.txt')
  await writeFile(fileRoot, 'not a directory\n', 'utf8')

  await assert.rejects(
    execFileAsync(process.execPath, [CHECKER_PATH, '--root', missingRoot]),
    (error) => {
      assert.equal(error.code, 1)
      assert.match(error.stderr, /Token-symbol root does not exist/)
      return true
    }
  )
  await assert.rejects(
    execFileAsync(process.execPath, [CHECKER_PATH, '--root', fileRoot]),
    (error) => {
      assert.equal(error.code, 1)
      assert.match(error.stderr, /Token-symbol root is not a directory/)
      return true
    }
  )
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
