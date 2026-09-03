#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import ts from 'typescript'
import { unified } from 'unified'
import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'

const DEFAULT_SOURCE_DIRECTORIES = [
  'content/docs',
  'content/feeds',
  'skills/wdk'
]
const DEFAULT_VISIBLE_SOURCE_DIRECTORIES = ['src']
const DEFAULT_VISIBLE_SOURCE_FILES = ['scripts/generate-search-index.mjs']
const DEFAULT_GENERATED_MARKDOWN_FILES = [
  'public/llms-full.txt',
  'public/llms.txt'
]
const DEFAULT_BUILD_OUTPUT_DIRECTORIES = ['dist']

const MARKDOWN_EXTENSION = /\.mdx?$/
const VISIBLE_SOURCE_EXTENSION = /\.[cm]?[jt]sx?$/
const JAVASCRIPT_LANGUAGES = new Set([
  'cjs',
  'javascript',
  'js',
  'jsx',
  'json',
  'mjs',
  'ts',
  'tsx',
  'typescript'
])
const HASH_COMMENT_LANGUAGES = new Set([
  'bash',
  'perl',
  'powershell',
  'pwsh',
  'py',
  'python',
  'r',
  'rb',
  'ruby',
  'sh',
  'shell',
  'yaml',
  'yml',
  'zsh'
])
const PLAIN_OUTPUT_LANGUAGES = new Set([
  '',
  'console',
  'plaintext',
  'prompt',
  'shellsession',
  'text',
  'txt'
])
const VERBATIM_OUTPUT_LANGUAGES = new Set([
  'console',
  'plaintext',
  'shellsession',
  'text',
  'txt'
])
const SHELL_LANGUAGES = new Set(['bash', 'sh', 'shell', 'zsh'])
const YAML_LANGUAGES = new Set(['yaml', 'yml'])

const DISPLAY_NAME = /(?:UPPERCASE_SEGMENTS|accessibilityHint|accessibility-hint|accessibilityLabel|accessibility-label|alt|ariaLabel|aria-label|caption|children|copy|description|displayName|heading|headings|label|labels|message|name|note|placeholder|text|title|toast|toastMessage)$/i
const DISPLAY_SUFFIX = /(?:Alt|Caption|Copy|Description|Heading|Hint|Labels?|Message|Name|Placeholder|Text|Title|Toast|ToastMessage)$/
const MACHINE_NAME = /(?:asset|fromToken|paymasterToken|symbol|toToken|token|tokenSymbol)$/i
const MACHINE_SUFFIX = /(?:Asset|Symbol|Token)$/
const HUMAN_CALL = /(?:^|\.)(?:alert|debug|error|info|log|print|printf|warn|(?:show|set|update)?Toast(?:Message)?)$/i
const MACHINE_CALL = /(?:^|\.)(?:findToken|getToken|hasToken|registerAsset|registerToken|resolveToken|setSymbol)$/i
const DISPLAY_CALL = /(?:^|\.)(?:folder|page)$/i

const TOKEN_SYMBOL_POLICIES = [
  {
    root: 'USD',
    candidateRoots: ['USD'],
    reader: ['USD₮', 'USD₮0'],
    codeHuman: ['USDt', 'USDt0'],
    machine: ['USDT', 'USDT0', 'usdt', 'usdt0']
  },
  {
    root: 'USA',
    candidateRoots: ['USA'],
    reader: ['USA₮'],
    codeHuman: ['USAt'],
    machine: ['USAT', 'usat']
  },
  {
    root: 'XAU',
    candidateRoots: ['XAU'],
    reader: ['XAU₮', 'XAU₮0'],
    codeHuman: ['XAUt', 'XAUt0'],
    machine: ['XAUT', 'XAUT0', 'xaut', 'xaut0', 'XAUt']
  },
  {
    root: 'MXN',
    candidateRoots: ['MXN'],
    reader: ['MXN₮'],
    codeHuman: ['MXNt'],
    machine: ['MXNT', 'mxnt']
  },
  {
    root: 'CNH',
    candidateRoots: ['CNH', 'CHN'],
    reader: ['CNH₮', 'CNH₮0'],
    codeHuman: ['CNHt', 'CNHt0'],
    machine: ['CNHT', 'CNHT0', 'cnht', 'cnht0']
  },
  {
    root: 'EUR',
    candidateRoots: ['EUR'],
    reader: ['EUR₮'],
    codeHuman: ['EURt'],
    machine: ['EURT', 'eurt']
  }
]
// Alloy (aUSD₮) stays outside this gate until WDK approves a human-code fallback.

const TOKEN_POLICY_BY_CANDIDATE_ROOT = new Map(TOKEN_SYMBOL_POLICIES.flatMap((policy) => (
  policy.candidateRoots.map((root) => [root, policy])
)))
const TOKEN_ROOT_SOURCE = `(?:${[...TOKEN_POLICY_BY_CANDIDATE_ROOT.keys()].join('|')})`
const TOKEN_CANDIDATE_SOURCE = `${TOKEN_ROOT_SOURCE}(?:[tT]|₮|[Ŧŧ])(?:\\d+)?[sS]?`
const MACHINE_VALUES = [...new Set(TOKEN_SYMBOL_POLICIES.flatMap((policy) => policy.machine))]
const MACHINE_VALUE_SOURCE = MACHINE_VALUES
  .sort((left, right) => right.length - left.length)
  .map(escapeRegExp)
  .join('|')
const UPPERCASE_MACHINE_VALUE_SOURCE = MACHINE_VALUES
  .filter((value) => value === value.toUpperCase())
  .sort((left, right) => right.length - left.length)
  .map(escapeRegExp)
  .join('|')
const LOWERCASE_MACHINE_VALUE_SOURCE = MACHINE_VALUES
  .filter((value) => value === value.toLowerCase())
  .sort((left, right) => right.length - left.length)
  .map(escapeRegExp)
  .join('|')

const ASCII_CANDIDATE = new RegExp(`\\b${TOKEN_ROOT_SOURCE}[tT](?:\\d+)?[sS]?\\b`, 'gi')
const GLYPH_CANDIDATE = new RegExp(`(?<![A-Za-z0-9_])${TOKEN_ROOT_SOURCE}₮(?:\\d+)?[sS]?(?![A-Za-z0-9_])`, 'gi')
const STROKE_LOOKALIKE = new RegExp(`(?<![A-Za-z0-9_])${TOKEN_ROOT_SOURCE}[Ŧŧ](?:\\d+)?[sS]?(?![A-Za-z0-9_])`, 'gi')
const MISPLACED_SUFFIX_CANDIDATE = new RegExp(`\\b${TOKEN_ROOT_SOURCE}\\d+(?:[tT]|₮|[Ŧŧ])[sS]?(?![A-Za-z0-9_])`, 'gi')
const AMBIGUOUS_USDC_STYLE = /\b[uU][sS][dD]c\b/g
const URL_OR_MAILTO = /\b(?:https?:\/\/|mailto:)[^\s<>'")]+/g
const BARE_PATH = /(?:^|[\s(=:,;])\/(?!\/)[^\s<>'")]+/g
const SCOPED_PACKAGE = /@[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+/g
const HOSTNAME = /\b(?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,}\b/g
const NAMESPACED_MACHINE = new RegExp(`\\b[a-z][a-z0-9-]*:(?:${MACHINE_VALUE_SOURCE})\\b`, 'g')
const COMPOSITE_MACHINE = /\b[A-Za-z0-9]+(?:\/[A-Za-z0-9]+)+\b/g
const QUOTED_MACHINE = new RegExp(`(['"])(?:${MACHINE_VALUE_SOURCE}|[a-z][a-z0-9-]*:(?:${MACHINE_VALUE_SOURCE}))\\1`, 'g')
const KNOWN_SOURCE_NAME_SOURCE = `(?:x402-usdt0|wdk-[a-z0-9.-]*(?:${LOWERCASE_MACHINE_VALUE_SOURCE})[a-z0-9.-]*|(?:[a-z0-9.]+-)+(?:${LOWERCASE_MACHINE_VALUE_SOURCE})(?:-[a-z0-9.]+)+)`
const KNOWN_SOURCE_NAME = new RegExp(`\\b${KNOWN_SOURCE_NAME_SOURCE}\\b`, 'g')
const EXACT_MACHINE_VALUE = new RegExp(`^(?:${MACHINE_VALUE_SOURCE})$`)
const EXACT_NAMESPACED_MACHINE_VALUE = new RegExp(`^[a-z][a-z0-9-]*:(?:${MACHINE_VALUE_SOURCE})$`)
const EXACT_QUOTED_MACHINE_VALUE = new RegExp(`^(['"])(?:${MACHINE_VALUE_SOURCE}|[a-z][a-z0-9-]*:(?:${MACHINE_VALUE_SOURCE}))\\1$`)
const EXACT_KNOWN_SOURCE_NAME = new RegExp(`^${KNOWN_SOURCE_NAME_SOURCE}$`)
const EXACT_HYPHENATED_SOURCE_NAME = new RegExp(`^(?=[a-z0-9.-]*-)[a-z0-9.-]*(?:${LOWERCASE_MACHINE_VALUE_SOURCE})[a-z0-9.-]*$`)
const UPPERCASE_MACHINE_IDENTIFIER = new RegExp(`^[A-Z][A-Z0-9_]*(?:${UPPERCASE_MACHINE_VALUE_SOURCE})[A-Z0-9_]*$`)
const SHELL_VARIABLE = /\$(?:\{[A-Za-z_][A-Za-z0-9_]*\}|[A-Za-z_][A-Za-z0-9_]*)/g
const GENERIC_MACHINE_NAME_SOURCE = '(?:asset|fromToken|paymasterToken|symbol|toToken|token|tokenSymbol)'
const GENERIC_MACHINE_CONTAINER_SOURCE = '[A-Za-z0-9₮Ŧŧ:/._-]+'
const GENERIC_MACHINE_VALUE = new RegExp(`(?:^\\s*(?:-\\s*)?(?:export\\s+)?|[{,(]\\s*)["']?${GENERIC_MACHINE_NAME_SOURCE}["']?\\s*[:=]\\s*(?:(["'])(${GENERIC_MACHINE_CONTAINER_SOURCE})\\1|(${GENERIC_MACHINE_CONTAINER_SOURCE}))`, 'gi')
const GENERIC_MULTILINE_MACHINE_VALUE = new RegExp(`(?:^[ \\t]*(?:-[ \\t]*)?(?:export[ \\t]+)?|[{,(][ \\t]*)["']?${GENERIC_MACHINE_NAME_SOURCE}["']?[ \\t]*[:=][ \\t]*(?:#[^\\r\\n]*)?\\r?\\n[ \\t]+(["']?)(${GENERIC_MACHINE_CONTAINER_SOURCE})\\1[ \\t]*,?[ \\t]*(?:#[^\\r\\n]*)?$`, 'gim')
const YAML_MACHINE_BLOCK_HEADER = new RegExp(`^(\\s*)(?:-\\s*)?["']?${GENERIC_MACHINE_NAME_SOURCE}["']?\\s*:\\s*[|>][-+0-9]*\\s*(?:#.*)?$`, 'i')

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function addIssue(issues, file, line, value, reason) {
  const issue = { file, line, value, reason }
  issues.push(issue)
  return issue
}

function findRanges(value, expression, capture = 0) {
  const ranges = []
  expression.lastIndex = 0

  for (const match of value.matchAll(expression)) {
    const captured = match[capture] ?? match[0]
    const offset = match[0].indexOf(captured)
    ranges.push([match.index + offset, match.index + offset + captured.length])
  }

  return ranges
}

function mergeRanges(ranges) {
  return ranges
    .sort((left, right) => left[0] - right[0])
    .reduce((merged, range) => {
      const previous = merged.at(-1)
      if (previous && range[0] <= previous[1]) {
        previous[1] = Math.max(previous[1], range[1])
      } else {
        merged.push([...range])
      }
      return merged
    }, [])
}

function isInsideRange(index, ranges) {
  return ranges.some(([start, end]) => index >= start && index < end)
}

function policyForValue(value) {
  return TOKEN_POLICY_BY_CANDIDATE_ROOT.get(value.slice(0, 3).toUpperCase())
}

function acceptsValue(policy, target, value) {
  if (!policy) return false
  if (target === 'code-human') return policy.codeHuman.includes(value)
  if (target === 'machine') return policy.machine.includes(value)
  if (target === 'prose' || target === 'source-human') return policy.reader.includes(value)
  return false
}

function exactMachineTokenRangesInside(value, containerExpression) {
  const ranges = []
  containerExpression.lastIndex = 0

  for (const container of value.matchAll(containerExpression)) {
    ASCII_CANDIDATE.lastIndex = 0
    for (const candidate of container[0].matchAll(ASCII_CANDIDATE)) {
      const policy = policyForValue(candidate[0])
      if (acceptsValue(policy, 'machine', candidate[0])) {
        const start = container.index + candidate.index
        ranges.push([start, start + candidate[0].length])
      }
    }
  }

  return ranges
}

function preservedRanges(value, { quotedMachine = false } = {}) {
  const ranges = [
    ...findRanges(value, URL_OR_MAILTO),
    ...findRanges(value, BARE_PATH),
    ...findRanges(value, SCOPED_PACKAGE),
    ...findRanges(value, HOSTNAME),
    ...findRanges(value, NAMESPACED_MACHINE),
    ...exactMachineTokenRangesInside(value, COMPOSITE_MACHINE),
    ...findRanges(value, KNOWN_SOURCE_NAME),
    ...findRanges(value, SHELL_VARIABLE)
  ]

  if (quotedMachine) ranges.push(...findRanges(value, QUOTED_MACHINE))
  return mergeRanges(ranges)
}

function collectStyleMatches(value, target, ignoredRanges = []) {
  const matches = []

  function collect(expression) {
    expression.lastIndex = 0
    for (const match of value.matchAll(expression)) {
      const policy = policyForValue(match[0])
      if (
        !isInsideRange(match.index, ignoredRanges)
        && !acceptsValue(policy, target, match[0])
      ) {
        matches.push({ index: match.index, value: match[0], policy })
      }
    }
  }

  collect(ASCII_CANDIDATE)
  collect(GLYPH_CANDIDATE)
  collect(STROKE_LOOKALIKE)
  collect(MISPLACED_SUFFIX_CANDIDATE)
  collect(AMBIGUOUS_USDC_STYLE)

  const unique = new Map()
  for (const match of matches) unique.set(`${match.index}:${match.value}`, match)
  return [...unique.values()].sort((left, right) => left.index - right.index)
}

function reasonForTarget(target, value, policy) {
  if (/^[uU][sS][dD]c$/.test(value)) {
    return 'USDC is a distinct token. Use USDC for Circle or the context-appropriate Tether spelling.'
  }
  if (!policy) return 'Use the context-appropriate canonical token spelling.'
  if (target === 'code-human') {
    return `Use ${policy.codeHuman.join(' or ')} for human-readable text inside code snippets.`
  }
  if (target === 'machine') {
    return `Preserve an exact ${policy.root} machine value, such as ${policy.machine.join(', ')}.`
  }
  return `Use ${policy.reader.join(' or ')} in reader-facing text.`
}

function scanStyledText(issues, value, {
  file,
  line,
  target,
  preserve = true,
  quotedMachine = false,
  sourceOffset = 0,
  onIssue
}) {
  const ignoredRanges = preserve
    ? preservedRanges(value, { quotedMachine })
    : []

  for (const match of collectStyleMatches(value, target, ignoredRanges)) {
    const matchLine = line + value.slice(0, match.index).split('\n').length - 1
    const issue = addIssue(
      issues,
      file,
      matchLine,
      match.value,
      reasonForTarget(target, match.value, match.policy)
    )
    onIssue?.(issue, sourceOffset + match.index)
  }
}

function isDisplayName(name) {
  return DISPLAY_NAME.test(name) || DISPLAY_SUFFIX.test(name)
}

function isMachineName(name) {
  return MACHINE_NAME.test(name) || MACHINE_SUFFIX.test(name)
}

function propertyNameText(name) {
  if (!name) return ''
  if (ts.isIdentifier(name) || ts.isPrivateIdentifier(name)) return name.text
  if (ts.isStringLiteralLike(name) || ts.isNumericLiteral(name)) return name.text
  return name.getText().replace(/^['"]|['"]$/g, '')
}

function expressionName(expression) {
  if (ts.isIdentifier(expression)) return expression.text
  if (ts.isPropertyAccessExpression(expression)) {
    return `${expressionName(expression.expression)}.${expression.name.text}`
  }
  return expression.getText()
}

function assignmentTargetName(expression) {
  if (ts.isIdentifier(expression)) return expression.text
  if (ts.isPropertyAccessExpression(expression)) return expression.name.text
  if (
    ts.isElementAccessExpression(expression)
    && expression.argumentExpression
    && ts.isStringLiteralLike(expression.argumentExpression)
  ) {
    return expression.argumentExpression.text
  }
  return ''
}

function containingFunctionName(node) {
  for (let ancestor = node.parent; ancestor; ancestor = ancestor.parent) {
    const isFunction = ts.isFunctionDeclaration(ancestor)
      || ts.isFunctionExpression(ancestor)
      || ts.isArrowFunction(ancestor)
      || ts.isMethodDeclaration(ancestor)
      || ts.isGetAccessorDeclaration(ancestor)
      || ts.isSetAccessorDeclaration(ancestor)
    if (!isFunction) continue

    if (ancestor.name) return propertyNameText(ancestor.name)
    const container = ancestor.parent
    if (
      ts.isVariableDeclaration(container)
      || ts.isPropertyAssignment(container)
      || ts.isPropertyDeclaration(container)
    ) {
      return propertyNameText(container.name)
    }
    return ''
  }
  return ''
}

function isDisplayLookupKey(node) {
  const tuple = node.parent
  if (!ts.isArrayLiteralExpression(tuple) || tuple.elements[0] !== node) return false
  const entries = tuple.parent
  if (!ts.isArrayLiteralExpression(entries)) return false
  const map = entries.parent
  if (!ts.isNewExpression(map) || expressionName(map.expression) !== 'Map') return false

  for (let ancestor = map.parent; ancestor; ancestor = ancestor.parent) {
    if (!ts.isVariableDeclaration(ancestor)) continue
    return isDisplayName(propertyNameText(ancestor.name))
  }
  return false
}

function isTokenMetadataName(node) {
  const assignment = node.parent
  if (!ts.isPropertyAssignment(assignment) || propertyNameText(assignment.name) !== 'name') {
    return false
  }

  const metadata = assignment.parent
  if (!ts.isObjectLiteralExpression(metadata)) return false
  const metadataKeys = new Set(metadata.properties
    .filter(ts.isPropertyAssignment)
    .map((property) => propertyNameText(property.name)))
  if (
    metadataKeys.has('decimals')
    && (metadataKeys.has('symbol') || metadataKeys.has('tokenSymbol'))
  ) {
    return true
  }
  if (!metadataKeys.has('version') || !metadataKeys.has('decimals')) return false

  const extra = metadata.parent
  if (!ts.isPropertyAssignment(extra) || propertyNameText(extra.name) !== 'extra') return false
  const pricing = extra.parent
  if (!ts.isObjectLiteralExpression(pricing)) return false
  return pricing.properties.some((property) => (
    ts.isPropertyAssignment(property) && propertyNameText(property.name) === 'asset'
  ))
}

function scriptKindFor(language, file = '') {
  if (language === 'tsx' || file.endsWith('.tsx')) return ts.ScriptKind.TSX
  if (language === 'jsx' || file.endsWith('.jsx')) return ts.ScriptKind.JSX
  if (['ts', 'typescript'].includes(language) || file.endsWith('.ts')) return ts.ScriptKind.TS
  if (language === 'json') return ts.ScriptKind.JSON
  return ts.ScriptKind.JS
}

function literalParts(node) {
  if (ts.isStringLiteralLike(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return [{ value: node.text, position: node.getStart() }]
  }
  if (ts.isTemplateExpression(node)) {
    return [
      { value: node.head.text, position: node.head.getStart() },
      ...node.templateSpans.map((span) => ({
        value: span.literal.text,
        position: span.literal.getStart()
      }))
    ]
  }
  return []
}

function isLiteralNode(node) {
  return ts.isStringLiteralLike(node)
    || ts.isNoSubstitutionTemplateLiteral(node)
    || ts.isTemplateExpression(node)
}

function isSourceDefinedValue(value) {
  if (/^(?:https?:\/\/|mailto:|\/)/.test(value)) return true
  if (/^@[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(value)) return true
  if (EXACT_KNOWN_SOURCE_NAME.test(value)) return true
  if (EXACT_HYPHENATED_SOURCE_NAME.test(value)) return true
  if (value === 'sky.money USDT Savings V2') return true
  if (EXACT_QUOTED_MACHINE_VALUE.test(value)) return true
  if (EXACT_MACHINE_VALUE.test(value)) return true
  if (EXACT_NAMESPACED_MACHINE_VALUE.test(value)) return true
  if (UPPERCASE_MACHINE_IDENTIFIER.test(value)) return true
  return false
}

function classifyLiteral(node) {
  if (isDisplayLookupKey(node)) return 'machine'
  if (isTokenMetadataName(node)) return 'machine'

  let child = node
  let parent = node.parent

  while (parent) {
    if (ts.isCallExpression(parent) || ts.isNewExpression(parent)) {
      const name = ts.isCallExpression(parent)
        ? expressionName(parent.expression)
        : parent.expression.getText()
      if (HUMAN_CALL.test(name) || /^\w*Error$/.test(name)) return 'human'
      if (MACHINE_CALL.test(name)) return 'machine'
      if (DISPLAY_CALL.test(name) && parent.arguments?.[0] === child) return 'human'
    }

    if (ts.isJsxAttribute(parent)) {
      const name = parent.name.getText()
      if (isDisplayName(name)) return 'human'
      if (isMachineName(name)) return 'machine'
      return 'generic'
    }

    if (ts.isJsxExpression(parent) && ts.isJsxElement(parent.parent)) return 'human'

    if (ts.isPropertyAssignment(parent)) {
      const name = propertyNameText(parent.name)
      if (isDisplayName(name)) return 'human'
      if (isMachineName(name)) return 'machine'
      return 'generic'
    }

    if (ts.isPropertyDeclaration(parent)) {
      const name = propertyNameText(parent.name)
      if (isDisplayName(name)) return 'human'
      if (isMachineName(name)) return 'machine'
      return 'generic'
    }

    if (
      ts.isBinaryExpression(parent)
      && parent.right === child
      && parent.operatorToken.kind === ts.SyntaxKind.EqualsToken
    ) {
      const name = assignmentTargetName(parent.left)
      if (isDisplayName(name)) return 'human'
      if (isMachineName(name)) return 'machine'
      return 'generic'
    }

    if (ts.isReturnStatement(parent)) {
      const name = containingFunctionName(parent)
      if (isDisplayName(name)) return 'human'
      if (isMachineName(name)) return 'machine'
    }

    if (ts.isVariableDeclaration(parent) || ts.isParameter(parent)) {
      const name = propertyNameText(parent.name)
      if (isDisplayName(name)) return 'human'
      if (isMachineName(name)) return 'machine'
      return 'generic'
    }

    child = parent
    parent = parent.parent
  }

  return 'generic'
}

function scanLiteral(issues, node, {
  file,
  sourceFile,
  baseLine,
  mode
}) {
  const classification = classifyLiteral(node)

  for (const part of literalParts(node)) {
    if (!part.value) continue
    const line = baseLine + sourceFile.getLineAndCharacterOfPosition(part.position).line

    if (classification === 'machine') {
      scanStyledText(issues, part.value, {
        file,
        line,
        target: 'machine',
        preserve: false
      })
      continue
    }

    if (classification === 'human') {
      scanStyledText(issues, part.value, {
        file,
        line,
        target: mode === 'source' ? 'source-human' : 'code-human'
      })
      continue
    }

    if (isSourceDefinedValue(part.value)) continue
    if (mode === 'source' && EXACT_MACHINE_VALUE.test(part.value)) continue

    scanStyledText(issues, part.value, {
      file,
      line,
      target: mode === 'source' ? 'source-human' : 'code-human'
    })
  }
}

function scanTypeScriptComments(issues, code, {
  file,
  language,
  baseLine
}) {
  const languageVariant = ['jsx', 'tsx'].includes(language)
    ? ts.LanguageVariant.JSX
    : ts.LanguageVariant.Standard
  const scanner = ts.createScanner(
    ts.ScriptTarget.Latest,
    false,
    languageVariant,
    code
  )

  for (let token = scanner.scan(); token !== ts.SyntaxKind.EndOfFileToken; token = scanner.scan()) {
    if (
      token !== ts.SyntaxKind.SingleLineCommentTrivia
      && token !== ts.SyntaxKind.MultiLineCommentTrivia
    ) continue

    const tokenText = scanner.getTokenText()
    const comment = tokenText.replace(/^\/\/?\*?/, '').replace(/\*\/$/, '')
    const line = baseLine + code.slice(0, scanner.getTokenPos()).split('\n').length - 1
    scanStyledText(issues, comment, {
      file,
      line,
      target: 'code-human',
      quotedMachine: true
    })
  }

  const htmlComment = /<!--([\s\S]*?)-->/g
  for (const match of code.matchAll(htmlComment)) {
    const line = baseLine + code.slice(0, match.index).split('\n').length - 1
    scanStyledText(issues, match[1], {
      file,
      line,
      target: 'code-human',
      quotedMachine: true
    })
  }
}

function scanTypeScriptCode(issues, code, {
  file,
  language = '',
  baseLine = 1,
  mode = 'code'
}) {
  const sourceFile = ts.createSourceFile(
    file,
    code,
    ts.ScriptTarget.Latest,
    true,
    scriptKindFor(language, file)
  )

  function visit(node) {
    if (ts.isJsxText(node) && node.text.trim()) {
      const line = baseLine + sourceFile.getLineAndCharacterOfPosition(node.getStart()).line
      scanStyledText(issues, node.text, {
        file,
        line,
        target: mode === 'source' ? 'source-human' : 'code-human'
      })
    } else if (isLiteralNode(node)) {
      scanLiteral(issues, node, { file, sourceFile, baseLine, mode })
    }
    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  if (mode === 'code') {
    scanTypeScriptComments(issues, code, { file, language, baseLine })
  }
}

function isHashCommentStart(line, cursor, language) {
  if (cursor === 0) return true
  const previous = line[cursor - 1]
  if (YAML_LANGUAGES.has(language)) return /\s/.test(previous)
  if (SHELL_LANGUAGES.has(language)) return /[\s;|&()]/.test(previous)
  return true
}

function hashCommentIndex(line, language) {
  let quote = null
  let escaped = false

  for (let cursor = 0; cursor < line.length; cursor += 1) {
    const character = line[cursor]
    if (quote) {
      if (escaped) escaped = false
      else if (character === '\\') escaped = true
      else if (character === quote) quote = null
    } else if (character === '"' || character === "'") quote = character
    else if (character === '#' && isHashCommentStart(line, cursor, language)) return cursor
  }

  return -1
}

function scanHashComments(issues, code, {
  file,
  language,
  baseLine,
  ignoredLines = new Set(),
  onIssue
}) {
  const lines = code.split(/\r?\n/)
  const lineStarts = [0]
  for (const match of code.matchAll(/\n/g)) lineStarts.push(match.index + 1)
  for (let index = 0; index < lines.length; index += 1) {
    if (ignoredLines.has(index)) continue
    const line = lines[index]
    const cursor = hashCommentIndex(line, language)
    if (cursor === -1) continue
    scanStyledText(issues, line.slice(cursor + 1), {
      file,
      line: baseLine + index,
      target: 'code-human',
      quotedMachine: true,
      sourceOffset: lineStarts[index] + cursor + 1,
      onIssue
    })
  }
}

function outputValueForLine(line, language) {
  const commandStarts = [0]
  let quote = null
  let escaped = false

  for (let cursor = 0; cursor < line.length; cursor += 1) {
    const character = line[cursor]
    if (escaped) {
      escaped = false
    } else if (character === '\\' && quote !== "'") {
      escaped = true
    } else if (quote) {
      if (character === quote) quote = null
    } else if (character === '"' || character === "'") {
      quote = character
    } else if (character === ';' || (SHELL_LANGUAGES.has(language) && /[|&]/.test(character))) {
      commandStarts.push(cursor + 1)
    }
  }

  for (const start of commandStarts) {
    const match = line.slice(start).match(/^\s*(?:echo|printf|print)\b[\s(]*(.*)$/i)
    const value = match?.[1]
    if (value) {
      return {
        value,
        start: start + match[0].lastIndexOf(value)
      }
    }
  }
  return null
}

function scanGenericCode(issues, code, {
  file,
  language,
  baseLine
}) {
  const genericIssues = []
  const issueOffsets = new WeakMap()
  const trackIssueOffset = (issue, offset) => issueOffsets.set(issue, offset)
  const lines = code.split(/\r?\n/)
  const lineStarts = [0]
  for (const match of code.matchAll(/\n/g)) lineStarts.push(match.index + 1)
  const blockScalarLines = new Set()
  const handledStringLines = new Set()
  const machineValueRanges = []
  const multilineMachineValues = []

  GENERIC_MULTILINE_MACHINE_VALUE.lastIndex = 0
  for (const match of code.matchAll(GENERIC_MULTILINE_MACHINE_VALUE)) {
    const machineValue = match[2]
    const start = match.index + match[0].lastIndexOf(machineValue)
    const lineIndex = code.slice(0, start).split('\n').length - 1
    machineValueRanges.push([start, start + machineValue.length])
    multilineMachineValues.push({ lineIndex, machineValue, sourceOffset: start })
  }

  if (YAML_LANGUAGES.has(language)) {
    for (let index = 0; index < lines.length; index += 1) {
      const header = lines[index].match(/^(\s*)(?:-\s*)?["']?(?:accessibilityHint|accessibilityLabel|alt|ariaLabel|caption|children|description|heading|label|message|note|placeholder|text|title)["']?\s*:\s*[|>][-+0-9]*\s*(?:#.*)?$/i)
      if (!header) continue
      const headerIndent = header[1].length

      for (let cursor = index + 1; cursor < lines.length; cursor += 1) {
        const valueLine = lines[cursor]
        if (!valueLine.trim()) continue
        const valueIndent = valueLine.match(/^\s*/)[0].length
        if (valueIndent <= headerIndent) break
        blockScalarLines.add(cursor)
        scanStyledText(genericIssues, valueLine, {
          file,
          line: baseLine + cursor,
          target: 'code-human',
          sourceOffset: lineStarts[cursor],
          onIssue: trackIssueOffset
        })
      }
    }

    for (let index = 0; index < lines.length; index += 1) {
      const header = lines[index].match(YAML_MACHINE_BLOCK_HEADER)
      if (!header) continue
      const headerIndent = header[1].length

      for (let cursor = index + 1; cursor < lines.length; cursor += 1) {
        const valueLine = lines[cursor]
        if (!valueLine.trim()) continue
        const valueIndent = valueLine.match(/^\s*/)[0].length
        if (valueIndent <= headerIndent) break
        blockScalarLines.add(cursor)
        machineValueRanges.push([
          lineStarts[cursor],
          lineStarts[cursor] + valueLine.length
        ])
        multilineMachineValues.push({
          lineIndex: cursor,
          machineValue: valueLine,
          sourceOffset: lineStarts[cursor]
        })
      }
    }
  }

  for (const { lineIndex, machineValue, sourceOffset } of multilineMachineValues.sort((left, right) => (
    left.lineIndex - right.lineIndex
  ))) {
    scanStyledText(genericIssues, machineValue, {
      file,
      line: baseLine + lineIndex,
      target: 'machine',
      preserve: false,
      sourceOffset,
      onIssue: trackIssueOffset
    })
  }

  for (let index = 0; index < lines.length; index += 1) {
    if (blockScalarLines.has(index)) continue
    const originalLine = lines[index]
    const lineNumber = baseLine + index
    const commentStart = HASH_COMMENT_LANGUAGES.has(language)
      ? hashCommentIndex(originalLine, language)
      : -1
    const line = commentStart === -1 ? originalLine : originalLine.slice(0, commentStart)
    const machineRanges = []

    GENERIC_MACHINE_VALUE.lastIndex = 0
    for (const match of line.matchAll(GENERIC_MACHINE_VALUE)) {
      const machineValue = match[2] ?? match[3]
      const start = match.index + match[0].lastIndexOf(machineValue)
      machineRanges.push([start, start + machineValue.length])
      machineValueRanges.push([
        lineStarts[index] + start,
        lineStarts[index] + start + machineValue.length
      ])
      scanStyledText(genericIssues, machineValue, {
        file,
        line: lineNumber,
        target: 'machine',
        preserve: false,
        sourceOffset: lineStarts[index] + start,
        onIssue: trackIssueOffset
      })
    }

    const masked = line.split('')
    for (const [start, end] of mergeRanges(machineRanges)) {
      for (let cursor = start; cursor < end; cursor += 1) masked[cursor] = ' '
    }
    const visibleLine = masked.join('')
    const displayMatch = visibleLine.match(/(?:^\s*(?:-\s*)?(?:export\s+)?|[{,(]\s*)["']?(?:accessibilityHint|accessibilityLabel|alt|ariaLabel|caption|children|description|heading|label|message|note|placeholder|text|title)["']?\s*[:=]\s*(.*)$/i)
    const displayValue = displayMatch?.[1]
    const displayStart = displayValue
      ? displayMatch.index + displayMatch[0].lastIndexOf(displayValue)
      : -1
    const output = outputValueForLine(visibleLine, language)

    if (output) {
      handledStringLines.add(index)
      scanStyledText(genericIssues, output.value, {
        file,
        line: lineNumber,
        target: 'code-human',
        sourceOffset: lineStarts[index] + output.start,
        onIssue: trackIssueOffset
      })
    } else if (displayValue && !/^\s*(?:'''|""")\s*$/.test(displayValue)) {
      handledStringLines.add(index)
      scanStyledText(genericIssues, displayValue, {
        file,
        line: lineNumber,
        target: 'code-human',
        sourceOffset: lineStarts[index] + displayStart,
        onIssue: trackIssueOffset
      })
    }
  }

  const stringPattern = /(?:'''([\s\S]*?)'''|"""([\s\S]*?)"""|(['"])((?:\\.|(?!\3)[\s\S])*?)\3)/g
  for (const match of code.matchAll(stringPattern)) {
    const value = match[1] ?? match[2] ?? match[4] ?? ''
    if (!value || isSourceDefinedValue(value)) continue
    const lineOffset = code.slice(0, match.index).split('\n').length - 1
    if (handledStringLines.has(lineOffset) || blockScalarLines.has(lineOffset)) continue
    const valueStart = match.index + (match[1] !== undefined || match[2] !== undefined ? 3 : 1)
    const maskedValue = value.split('')
    for (const [start, end] of machineValueRanges) {
      const overlapStart = Math.max(start, valueStart)
      const overlapEnd = Math.min(end, valueStart + value.length)
      for (let cursor = overlapStart; cursor < overlapEnd; cursor += 1) {
        maskedValue[cursor - valueStart] = ' '
      }
    }
    const line = baseLine + lineOffset
    scanStyledText(genericIssues, maskedValue.join(''), {
      file,
      line,
      target: 'code-human',
      sourceOffset: valueStart,
      onIssue: trackIssueOffset
    })
  }

  if (HASH_COMMENT_LANGUAGES.has(language)) {
    scanHashComments(genericIssues, code, {
      file,
      language,
      baseLine,
      ignoredLines: blockScalarLines,
      onIssue: trackIssueOffset
    })
  }

  genericIssues.sort((left, right) => {
    if (left.line !== right.line) return left.line - right.line
    return (issueOffsets.get(left) ?? Number.MAX_SAFE_INTEGER)
      - (issueOffsets.get(right) ?? Number.MAX_SAFE_INTEGER)
  })
  issues.push(...genericIssues)
}

function scanCodeBlock(issues, node, file) {
  const language = (node.lang ?? '').toLowerCase()
  const meta = node.meta ?? ''
  const openingLine = node.position?.start.line ?? 1
  const baseLine = openingLine + 1
  const requestsVerbatimOutput = /(?:^|\s)verbatim-output(?:\s|$)/.test(meta)

  scanStyledText(issues, meta, {
    file,
    line: openingLine,
    target: 'code-human'
  })

  if (requestsVerbatimOutput && !VERBATIM_OUTPUT_LANGUAGES.has(language)) {
    addIssue(
      issues,
      file,
      openingLine,
      'verbatim-output',
      'Use verbatim-output only on plain copied-output fences such as text, console, or shellsession.'
    )
  }
  if (requestsVerbatimOutput && VERBATIM_OUTPUT_LANGUAGES.has(language)) return

  if (PLAIN_OUTPUT_LANGUAGES.has(language)) {
    scanStyledText(issues, node.value, {
      file,
      line: baseLine,
      target: 'code-human'
    })
    return
  }

  if (JAVASCRIPT_LANGUAGES.has(language)) {
    scanTypeScriptCode(issues, node.value, {
      file,
      language,
      baseLine,
      mode: 'code'
    })
    return
  }

  scanGenericCode(issues, node.value, { file, language, baseLine })
}

function scanHtmlDisplayAttributes(issues, node, file) {
  const expression = /\b(accessibilityLabel|alt|ariaLabel|caption|children|description|label|message|placeholder|text|title)\s*=\s*(?:"([\s\S]*?)"|'([\s\S]*?)'|\{([\s\S]*?)\})/gi
  for (const match of node.value.matchAll(expression)) {
    const value = match[2] ?? match[3] ?? match[4] ?? ''
    const lineOffset = node.value.slice(0, match.index).split('\n').length - 1
    scanStyledText(issues, value, {
      file,
      line: (node.position?.start.line ?? 1) + lineOffset,
      target: 'prose'
    })
  }
}

function scanMdxDisplayAttributes(issues, node, file) {
  for (const attribute of node.attributes ?? []) {
    if (attribute.type !== 'mdxJsxAttribute' || !isDisplayName(attribute.name)) continue
    const line = attribute.position?.start.line ?? node.position?.start.line ?? 1

    if (typeof attribute.value === 'string') {
      scanStyledText(issues, attribute.value, {
        file,
        line,
        target: 'prose'
      })
    } else if (attribute.value?.value) {
      scanTypeScriptCode(issues, `const ${attribute.name} = (${attribute.value.value})`, {
        file,
        language: 'tsx',
        baseLine: line,
        mode: 'source'
      })
    }
  }
}

function scanMdxTextExpression(issues, node, file) {
  if (!node.value) return
  const line = node.position?.start.line ?? 1
  scanTypeScriptCode(issues, `const text = (${node.value})`, {
    file,
    language: 'tsx',
    baseLine: line,
    mode: 'source'
  })
}

const INLINE_MACHINE_PATTERNS = [
  {
    expression: new RegExp(`\\b(?:findToken|getToken|hasToken|registerAsset|registerToken|resolveToken|setSymbol)\\s*\\(\\s*(["'])(${TOKEN_CANDIDATE_SOURCE})\\1`, 'gi'),
    capture: 2
  },
  {
    expression: new RegExp(`\\b(?:asset|fromToken|paymasterToken|symbol|toToken|token|tokenSymbol)\\s*[:=]\\s*(["']?)(${TOKEN_CANDIDATE_SOURCE})\\1`, 'gi'),
    capture: 2
  },
  {
    expression: new RegExp(`--(?:asset|from-token|paymaster-token|symbol|to-token|token|token-symbol)(?:=|\\s+)(["']?)(${TOKEN_CANDIDATE_SOURCE})\\1`, 'gi'),
    capture: 2
  }
]

function scanInlineCode(issues, value, { file, line }) {
  if (isSourceDefinedValue(value)) {
    scanStyledText(issues, value, {
      file,
      line,
      target: 'machine',
      preserve: false
    })
    return
  }

  const machineRanges = []
  for (const { expression, capture } of INLINE_MACHINE_PATTERNS) {
    expression.lastIndex = 0
    for (const match of value.matchAll(expression)) {
      const token = match[capture]
      const start = match.index + match[0].lastIndexOf(token)
      machineRanges.push([start, start + token.length])
      scanStyledText(issues, token, {
        file,
        line,
        target: 'machine',
        preserve: false
      })
    }
  }

  const masked = value.split('')
  for (const [start, end] of mergeRanges(machineRanges)) {
    for (let index = start; index < end; index += 1) {
      if (masked[index] !== '\n') masked[index] = ' '
    }
  }
  scanStyledText(issues, masked.join(''), {
    file,
    line,
    target: 'code-human'
  })
}

export function validateTokenSymbols(content, { file = '<content>' } = {}) {
  const issues = []
  const tree = unified().use(remarkParse).use(remarkMdx).parse(content)

  function visit(node) {
    if (node.type === 'text') {
      scanStyledText(issues, node.value, {
        file,
        line: node.position?.start.line ?? 1,
        target: 'prose'
      })
    } else if (node.type === 'inlineCode') {
      scanInlineCode(issues, node.value, {
        file,
        line: node.position?.start.line ?? 1
      })
    } else if (node.type === 'image' || node.type === 'imageReference') {
      scanStyledText(issues, node.alt ?? '', {
        file,
        line: node.position?.start.line ?? 1,
        target: 'prose'
      })
      if (node.title) {
        scanStyledText(issues, node.title, {
          file,
          line: node.position?.start.line ?? 1,
          target: 'prose'
        })
      }
    } else if ((node.type === 'link' || node.type === 'linkReference') && node.title) {
      scanStyledText(issues, node.title, {
        file,
        line: node.position?.start.line ?? 1,
        target: 'prose'
      })
    } else if (node.type === 'code') {
      scanCodeBlock(issues, node, file)
      return
    } else if (node.type === 'html') {
      scanHtmlDisplayAttributes(issues, node, file)
    } else if (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') {
      scanMdxDisplayAttributes(issues, node, file)
    } else if (node.type === 'mdxTextExpression' || node.type === 'mdxFlowExpression') {
      scanMdxTextExpression(issues, node, file)
    }

    for (const child of node.children ?? []) visit(child)
  }

  visit(tree)
  return issues
}

export function validateVisibleTokenStrings(content, { file = '<source>' } = {}) {
  const issues = []
  scanTypeScriptCode(issues, content, {
    file,
    language: path.extname(file).slice(1),
    baseLine: 1,
    mode: 'source'
  })
  return issues
}

async function listFiles(directory, expression) {
  const entries = await fs.promises.readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const target = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...await listFiles(target, expression))
    else if (entry.isFile() && expression.test(entry.name)) files.push(target)
  }

  return files
}

function normalizedRelativePath(root, file) {
  return path.relative(root, file).split(path.sep).join('/')
}

export async function validateTokenSymbolFiles({
  root = process.cwd(),
  sourceDirectories = DEFAULT_SOURCE_DIRECTORIES,
  visibleSourceDirectories = DEFAULT_VISIBLE_SOURCE_DIRECTORIES,
  visibleSourceFiles = DEFAULT_VISIBLE_SOURCE_FILES,
  generatedMarkdownFiles = DEFAULT_GENERATED_MARKDOWN_FILES,
  buildOutputDirectories = []
} = {}) {
  let rootStats
  try {
    rootStats = await fs.promises.stat(root)
  } catch (error) {
    if (error && typeof error === 'object' && error.code === 'ENOENT') {
      throw new Error(`Token-symbol root does not exist: ${root}`)
    }
    throw error
  }
  if (!rootStats.isDirectory()) {
    throw new Error(`Token-symbol root is not a directory: ${root}`)
  }

  const files = new Set()

  for (const relativeDirectory of sourceDirectories) {
    const directory = path.join(root, relativeDirectory)
    if (fs.existsSync(directory)) {
      for (const file of await listFiles(directory, MARKDOWN_EXTENSION)) files.add(file)
    }
  }
  for (const relativeDirectory of buildOutputDirectories) {
    const directory = path.join(root, relativeDirectory)
    if (fs.existsSync(directory)) {
      for (const file of await listFiles(directory, /(?:\.md|llms(?:-full)?\.txt)$/)) files.add(file)
    }
  }
  for (const relativeDirectory of visibleSourceDirectories) {
    const directory = path.join(root, relativeDirectory)
    if (fs.existsSync(directory)) {
      for (const file of await listFiles(directory, VISIBLE_SOURCE_EXTENSION)) files.add(file)
    }
  }
  for (const relativeFile of [...visibleSourceFiles, ...generatedMarkdownFiles]) {
    const file = path.join(root, relativeFile)
    if (fs.existsSync(file)) files.add(file)
  }

  const issues = []
  const sortedFiles = [...files].sort((left, right) => left.localeCompare(right))
  for (const file of sortedFiles) {
    const content = await fs.promises.readFile(file, 'utf8')
    const relativeFile = normalizedRelativePath(root, file)
    const markdown = MARKDOWN_EXTENSION.test(file)
      || /(?:^|\/)llms(?:-full)?\.txt$/.test(relativeFile)
    issues.push(...(markdown
      ? validateTokenSymbols(content, { file: relativeFile })
      : validateVisibleTokenStrings(content, { file: relativeFile })))
  }

  return { files: sortedFiles, issues }
}

function parseArguments(arguments_) {
  let includeBuildOutput = false
  let root = process.cwd()

  for (let index = 0; index < arguments_.length; index += 1) {
    const argument = arguments_[index]
    if (argument === '--include-build-output') {
      includeBuildOutput = true
    } else if (argument === '--root') {
      const value = arguments_[index + 1]
      if (!value || value.startsWith('--')) throw new Error('--root requires a directory path.')
      root = path.resolve(value)
      index += 1
    } else if (argument.startsWith('--root=')) {
      const value = argument.slice('--root='.length)
      if (!value) throw new Error('--root requires a directory path.')
      root = path.resolve(value)
    } else {
      throw new Error(`Unknown argument: ${argument}`)
    }
  }

  return { includeBuildOutput, root }
}

async function run(arguments_ = process.argv.slice(2)) {
  const { includeBuildOutput, root } = parseArguments(arguments_)
  const { files, issues } = await validateTokenSymbolFiles({
    root,
    buildOutputDirectories: includeBuildOutput ? DEFAULT_BUILD_OUTPUT_DIRECTORIES : []
  })

  if (issues.length === 0) {
    console.log(`✅ check-token-symbols: validated ${files.length} documentation source files.`)
    return
  }

  console.error(`❌ check-token-symbols: found ${issues.length} token-style issue(s):\n`)
  for (const issue of issues) {
    console.error(`- ${issue.file}:${issue.line}`)
    console.error(`  found: ${issue.value}`)
    console.error(`  reason: ${issue.reason}`)
  }
  process.exitCode = 1
}

const isEntrypoint = process.argv[1]
  && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
if (isEntrypoint) {
  run().catch((error) => {
    console.error(`❌ check-token-symbols failed: ${error instanceof Error ? error.message : String(error)}`)
    process.exitCode = 1
  })
}
