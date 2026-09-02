#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { TextDecoder } from 'node:util'

import ts from 'typescript'
import { unified } from 'unified'
import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'

import {
  COMPETING_ASSET_POLICIES,
  PROHIBITED_CHAIN_POLICY
} from './competing-assets-policy.mjs'

const DEFAULT_SOURCE_DIRECTORIES = [
  'content/docs',
  'content/feeds',
  'skills/wdk'
]
const DEFAULT_VISIBLE_SOURCE_DIRECTORIES = ['src']
const DEFAULT_CATALOG_SOURCE_DIRECTORIES = [
  'content/docs',
  'content/feeds',
  'skills/wdk',
  'src',
  'scripts',
  '.github',
  'public',
  'templates'
]
const DEFAULT_CATALOG_EXCLUDED_PATHS = [
  // These self-referential policy sources and adversarial fixtures must name
  // prohibited values in order to enforce and test them.
  'scripts/check-token-symbols.mjs',
  'scripts/competing-assets-policy.mjs',
  'scripts/test/check-competing-assets-integration.test.mjs',
  'scripts/test/check-competing-assets.test.mjs',
  'scripts/test/check-token-symbols.test.mjs'
]
const DEFAULT_VISIBLE_SOURCE_FILES = [
  'scripts/generate-search-index.mjs'
]
const DEFAULT_CATALOG_SOURCE_FILES = [
  // Generated dependency locks and local managed policy text are intentionally
  // outside the authored/published documentation boundary.
  '.env.example',
  '.gitignore',
  '.npmrc',
  '.vercelignore',
  'LICENSE',
  'README.md',
  '_redirects',
  'cli.json',
  'next.config.mjs',
  'package.json',
  'postcss.config.mjs',
  'source.config.ts',
  'scripts/generate-llm-md-files.mjs',
  'scripts/generate-og.mts',
  'scripts/generate-search-index.mjs',
  'scripts/sync-all-modules-feed.mjs',
  'tsconfig.json'
]
const DEFAULT_GENERATED_MARKDOWN_FILES = [
  'public/llms-full.txt',
  'public/llms.txt'
]
const DEFAULT_GENERATED_CATALOG_FILES = []
const DEFAULT_GENERATED_SEARCH_INDEX_FILES = ['public/api/search.json']
const DEFAULT_BUILD_OUTPUT_DIRECTORIES = ['dist']
const DEFAULT_BUILD_OUTPUT_EXCLUDED_PATHS = [
  // Authored source is scanned separately. Compiled Next.js chunks contain
  // minified framework and dependency internals, not canonical reader text;
  // parsing them is both noisy and disproportionately expensive. Static HTML,
  // route payloads, search documents, LLM files, and non-chunk assets remain in
  // the build scan below.
  '_next/static/chunks'
]
const REQUIRED_BUILD_OUTPUT_FILES = [
  'index.html',
  'llms-full.txt',
  'llms.txt',
  'api/search',
  'api/search.json'
]

const MARKDOWN_EXTENSION = /\.mdx?$/
const VISIBLE_SOURCE_EXTENSION = /\.[cm]?[jt]sx?$/
// Prefer canonical reader artifacts over framework duplicates: exported route
// Markdown contains the page body, while its paired Next.js HTML and index.txt
// repeat it inside much larger serialized payloads. Unpaired HTML and route
// payloads remain in scope so a new generated surface cannot disappear silently.
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

const LETTER_OR_NUMBER = /[\p{L}\p{N}]/u
const LOWERCASE_LETTER = /\p{Ll}/u
const UPPERCASE_LETTER = /\p{Lu}/u
const DEFAULT_IGNORABLE = /\p{Default_Ignorable_Code_Point}/u
const ASCII_CONFUSABLES = new Map(Object.entries({
  Α: 'A', А: 'A', α: 'a', а: 'a',
  Β: 'B', В: 'B', β: 'b', в: 'b',
  С: 'C', Ϲ: 'C', с: 'c', ϲ: 'c',
  Ε: 'E', Е: 'E', ε: 'e', е: 'e',
  Н: 'H', Η: 'H', н: 'h', η: 'h',
  Ι: 'I', І: 'I', ι: 'i', і: 'i',
  Κ: 'K', К: 'K', κ: 'k', к: 'k',
  Μ: 'M', М: 'M', μ: 'm', м: 'm',
  Ν: 'N', ν: 'n',
  Ο: 'O', О: 'O', ο: 'o', о: 'o',
  Ρ: 'P', Р: 'P', ρ: 'p', р: 'p',
  Ѕ: 'S', ѕ: 's', ꜱ: 's', Ꮪ: 'S',
  Τ: 'T', Т: 'T', τ: 't', т: 't',
  Χ: 'X', Х: 'X', χ: 'x', х: 'x',
  Υ: 'Y', У: 'Y', υ: 'y', у: 'y',
  Ζ: 'Z', ζ: 'z', ɑ: 'a'
}))
const ENCODED_CHARACTER = /(?:\\u\{([0-9a-f]{1,6})\}|\\u([0-9a-f]{4})|\\x([0-9a-f]{2})|&#x([0-9a-f]{1,6});|&#([0-9]{1,7});)/iy
const ENCODED_SURROGATE_PAIR = /\\u([dD][89aAbB][0-9a-f]{2})\\u([dD][c-fC-F][0-9a-f]{2})/y
const CSS_HEX_ESCAPE = /\\([0-9a-f]{1,6})(?:[ \t\r\n\f])?/iy
const HTML_COMMENT_AT_INDEX = /<!--[\s\S]*?-->/y
const NAMED_POLICY_ENTITY = /&(?:emsp|ensp|NewLine|nbsp|Tab|thinsp|ZeroWidthSpace|zwnj|zwj);/iy
const PERCENT_BYTE = /%([0-9a-f]{2})/iy
const POLICY_NORMALIZATION_TRIGGER = /\p{Default_Ignorable_Code_Point}|[\u0370-\u03ff\u0400-\u04ff\u13da\ua731\u0251\u2028\u2029\uff01-\uff5e]|[\u{1d400}-\u{1d7ff}]|\\(?:u\{|u[0-9a-f]{4}|x[0-9a-f]{2}|[0-9a-f]{1,6})|&#(?:x[0-9a-f]{1,6}|[0-9]{1,7});|&(?:emsp|ensp|NewLine|nbsp|Tab|thinsp|ZeroWidthSpace|zwnj|zwj);|<!--|%[0-9a-f]{2}/iu
const IDENTIFIER_SUFFIX = /^(?:(?:accounts?|adapters?|addresses?|allowances?|amounts?|approvals?|assets?|balances?|coins?|configs?|configurations?|contracts?|decimals?|markets?|networks?|pairs?|pools?|prices?|routes?|symbols?|tokens?)|[lv]?\d+)(?:[^\p{L}\p{N}]|$)/iu

function normalizedAliasKey(value) {
  return value.normalize('NFKC').toLowerCase()
}

function normalizedNameKey(value) {
  return value.normalize('NFKC').toLowerCase().trim().replace(/[ \t_-]+/g, ' ')
}

function nameExpressionSource(value) {
  return value
    .normalize('NFKC')
    .trim()
    .split(/[ \t_-]+/)
    .map(escapeRegExp)
    .join('[ \\t_-]+')
}

function identifierFormsForName(value) {
  const words = value.normalize('NFKC').trim().split(/[ \t_-]+/).filter(Boolean)
  if (words.length === 0) return []

  const pascalWords = words.map((word) => {
    if (/^[A-Z0-9]+$/.test(word)) {
      return `${word[0]}${word.slice(1).toLowerCase()}`
    }
    return `${word[0].toUpperCase()}${word.slice(1)}`
  })
  const pascal = pascalWords.join('')
  const preserved = words.join('')
  const lowerCamel = `${pascal[0].toLowerCase()}${pascal.slice(1)}`
  const lowerFirstWord = `${words[0].toLowerCase()}${pascalWords.slice(1).join('')}`
  const upper = words.join('').toUpperCase()
  const lower = words.join('').toLowerCase()
  return [...new Set([pascal, preserved, lowerCamel, lowerFirstWord, upper, lower])]
}

function opaqueIdentifierIsCaseSensitive(value) {
  return /^[1-9A-HJ-NP-Za-km-z]{32,}$/u.test(value)
    || /^[A-Z0-9]+-[A-Z2-7]{20,}$/u.test(value)
    || /^[0-9A-Fa-f]{40}\.r[1-9A-HJ-NP-Za-km-z]{20,}$/u.test(value)
}

function opaqueIdentifierKey(value) {
  return opaqueIdentifierIsCaseSensitive(value) ? `case:${value}` : `fold:${value.toLowerCase()}`
}

function crc16Xmodem(bytes) {
  let checksum = 0
  for (const byte of bytes) {
    checksum ^= byte << 8
    for (let bit = 0; bit < 8; bit += 1) {
      checksum = checksum & 0x8000
        ? ((checksum << 1) ^ 0x1021) & 0xffff
        : (checksum << 1) & 0xffff
    }
  }
  return checksum
}

function canonicalTonAddress(value) {
  const raw = /^(-?\d+):([0-9a-f]{64})$/iu.exec(value)
  if (raw) return `${Number(raw[1])}:${raw[2].toLowerCase()}`
  if (!/^[A-Za-z0-9_-]{48}$/u.test(value)) return null

  let decoded
  try {
    decoded = Buffer.from(value.replace(/-/g, '+').replace(/_/g, '/'), 'base64')
  } catch {
    return null
  }
  if (decoded.length !== 36) return null
  const tag = decoded[0] & 0x7f
  if (tag !== 0x11 && tag !== 0x51) return null
  if (crc16Xmodem(decoded.subarray(0, 34)) !== decoded.readUInt16BE(34)) return null

  const workchain = decoded.readInt8(1)
  return `${workchain}:${decoded.subarray(2, 34).toString('hex')}`
}

export function validateCompetingAssetCatalog(
  policies = COMPETING_ASSET_POLICIES,
  chainPolicy = PROHIBITED_CHAIN_POLICY
) {
  const errors = []
  const ids = new Set()
  const aliases = new Map()
  const addresses = new Map()
  const identifiers = new Map()
  const opaqueIdentifiers = new Map()

  const policyEntries = Array.isArray(policies) ? policies : []
  if (!Array.isArray(policies)) {
    errors.push('Competing-asset policies must be an array.')
  }

  for (const policy of policyEntries) {
    if (!policy || typeof policy !== 'object') {
      errors.push('Every competing-asset policy must be an object.')
      continue
    }
    let policyIdIsUnique = true
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(policy.id ?? '')) {
      errors.push(`Invalid competing-asset policy id: ${String(policy.id)}`)
      policyIdIsUnique = false
    } else if (ids.has(policy.id)) {
      errors.push(`Duplicate competing-asset policy id: ${policy.id}`)
      policyIdIsUnique = false
    } else {
      ids.add(policy.id)
    }
    if (typeof policy.label !== 'string' || policy.label.trim() === '') {
      errors.push(`Competing-asset policy ${policy.id ?? '<unknown>'} needs a label.`)
    }

    const arrays = {}
    for (const field of [
      'symbols',
      'names',
      'addresses',
      'opaqueIdentifiers',
      'ignoredSpellings',
      'caseSensitiveSymbols',
      'contextRequiredSymbols',
      'contextRequiredOpaqueIdentifiers'
    ]) {
      if (policy[field] === undefined) {
        arrays[field] = []
      } else if (!Array.isArray(policy[field])) {
        errors.push(`Competing-asset policy ${policy.id ?? '<unknown>'} field ${field} must be an array.`)
        arrays[field] = []
      } else {
        arrays[field] = policy[field]
      }
    }

    const terms = [...arrays.symbols, ...arrays.names]
    const termFieldsAreArrays = (policy.symbols === undefined || Array.isArray(policy.symbols))
      && (policy.names === undefined || Array.isArray(policy.names))
    if (termFieldsAreArrays && terms.length === 0) {
      errors.push(`Competing-asset policy ${policy.id ?? '<unknown>'} needs a symbol or name.`)
    }
    const policyAliases = new Set()
    for (const value of terms) {
      if (typeof value !== 'string' || value.trim() === '') {
        errors.push(`Competing-asset policy ${policy.id ?? '<unknown>'} has an empty alias.`)
        continue
      }
      const key = normalizedAliasKey(value).replace(/[ \t_-]+/g, ' ')
      if (policyAliases.has(key)) {
        errors.push(`Competing-asset policy ${policy.id} repeats alias ${value}.`)
        continue
      }
      policyAliases.add(key)
      if (!policyIdIsUnique) continue
      const previous = aliases.get(key)
      if (aliases.has(key)) {
        errors.push(`Competing-asset alias ${value} is shared by ${previous} and ${policy.id}.`)
      } else aliases.set(key, policy.id)
    }
    for (const value of arrays.names) {
      if (typeof value !== 'string' || value.trim() === '') continue
      const normalizedIdentifiers = new Map()
      for (const identifier of identifierFormsForName(value)) {
        const key = identifier.toLowerCase()
        if (!normalizedIdentifiers.has(key)) normalizedIdentifiers.set(key, identifier)
      }
      for (const [key, identifier] of normalizedIdentifiers) {
        const previous = identifiers.get(key)
        if (previous && previous !== policy.id) {
          errors.push(`Derived competing-asset identifier ${identifier} is shared by ${previous} and ${policy.id}.`)
        } else {
          identifiers.set(key, policy.id)
        }
      }
    }
    for (const value of arrays.addresses) {
      if (typeof value !== 'string' || !/^0x[0-9a-f]{40}$/i.test(value)) {
        errors.push(`Competing-asset policy ${policy.id} has a malformed EVM address: ${String(value)}`)
        continue
      }
      const key = value.toLowerCase()
      const previous = addresses.get(key)
      if (addresses.has(key)) {
        errors.push(previous === policy.id
          ? `Competing-asset policy ${policy.id} repeats EVM address ${value}.`
          : `EVM address ${value} is shared by ${previous} and ${policy.id}.`)
      }
      else addresses.set(key, policy.id)
    }
    for (const value of arrays.opaqueIdentifiers) {
      if (typeof value !== 'string' || value.trim() === '') {
        errors.push(`Competing-asset policy ${policy.id} has an empty opaque identifier.`)
        continue
      }
      const key = opaqueIdentifierKey(value)
      const previous = opaqueIdentifiers.get(key)
      if (opaqueIdentifiers.has(key)) {
        errors.push(previous === policy.id
          ? `Competing-asset policy ${policy.id} repeats opaque identifier ${value}.`
          : `Opaque identifier ${value} is shared by ${previous} and ${policy.id}.`)
      }
      else opaqueIdentifiers.set(key, policy.id)
    }
    const ignoredSpellings = new Set()
    for (const value of arrays.ignoredSpellings) {
      if (typeof value !== 'string' || value.trim() === '') {
        errors.push(`Competing-asset policy ${policy.id} has an empty ignored spelling.`)
        continue
      }
      if (ignoredSpellings.has(value)) {
        errors.push(`Competing-asset policy ${policy.id} repeats ignored spelling ${value}.`)
        continue
      }
      ignoredSpellings.add(value)
      if (arrays.symbols.includes(value)) {
        errors.push(`Competing-asset policy ${policy.id} cannot ignore configured symbol ${value}.`)
        continue
      }
      const key = normalizedAliasKey(value)
      if (!arrays.symbols.some((symbol) => typeof symbol === 'string' && normalizedAliasKey(symbol) === key)) {
        errors.push(`Competing-asset policy ${policy.id} ignored spelling ${value} must be a case variant of a configured symbol.`)
      }
    }
    for (const field of ['caseSensitiveSymbols', 'contextRequiredSymbols']) {
      const seen = new Set()
      for (const value of arrays[field]) {
        if (typeof value !== 'string' || value.trim() === '') {
          errors.push(`Competing-asset policy ${policy.id} has an empty ${field} value.`)
          continue
        }
        if (seen.has(value)) {
          errors.push(`Competing-asset policy ${policy.id} repeats ${field} value ${value}.`)
          continue
        }
        seen.add(value)
        if (!arrays.symbols.includes(value)) {
          errors.push(`Competing-asset policy ${policy.id} ${field} value ${value} must be a configured symbol.`)
        }
      }
    }
    const contextOpaqueSeen = new Set()
    for (const value of arrays.contextRequiredOpaqueIdentifiers) {
      if (typeof value !== 'string' || value.trim() === '') {
        errors.push(`Competing-asset policy ${policy.id} has an empty contextRequiredOpaqueIdentifiers value.`)
        continue
      }
      const key = opaqueIdentifierKey(value)
      if (contextOpaqueSeen.has(key)) {
        errors.push(`Competing-asset policy ${policy.id} repeats contextRequiredOpaqueIdentifiers value ${value}.`)
        continue
      }
      contextOpaqueSeen.add(key)
      if (!arrays.opaqueIdentifiers.some((identifier) => (
        typeof identifier === 'string' && opaqueIdentifierKey(identifier) === key
      ))) {
        errors.push(`Competing-asset policy ${policy.id} contextRequiredOpaqueIdentifiers value ${value} must be a configured opaque identifier.`)
      }
    }
  }


  for (const [address, owner] of addresses) {
    const opaqueOwner = opaqueIdentifiers.get(`fold:${address}`)
    if (opaqueOwner) {
      errors.push(`EVM address ${address} is also an opaque identifier in ${opaqueOwner}; address owner is ${owner}.`)
    }
  }
  for (const [opaqueKey, owner] of opaqueIdentifiers) {
    const value = opaqueKey.slice(opaqueKey.indexOf(':') + 1)
    if (opaqueKey.startsWith('fold:')) {
      const aliasOwner = aliases.get(value)
      if (aliasOwner) errors.push(`Opaque identifier ${value} in ${owner} collides with an alias in ${aliasOwner}.`)
      const identifierOwner = identifiers.get(value)
      if (identifierOwner) errors.push(`Opaque identifier ${value} in ${owner} collides with a derived identifier in ${identifierOwner}.`)
    }
  }
  for (const [alias, aliasOwner] of aliases) {
    const identifierOwner = identifiers.get(alias)
    if (identifierOwner && identifierOwner !== aliasOwner) {
      errors.push(`Competing-asset alias ${alias} in ${aliasOwner} collides with a derived identifier in ${identifierOwner}.`)
    }
  }

  if (!chainPolicy || typeof chainPolicy !== 'object') {
    errors.push('The prohibited-chain policy must be an object.')
  } else {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(chainPolicy.id ?? '')) {
      errors.push(`Invalid prohibited-chain policy id: ${String(chainPolicy.id)}`)
    } else if (ids.has(chainPolicy.id)) {
      errors.push(`Prohibited-chain policy id ${chainPolicy.id} collides with a competing-asset policy id.`)
    }
    if (typeof chainPolicy.label !== 'string' || chainPolicy.label.trim() === '') {
      errors.push(`Prohibited-chain policy ${chainPolicy.id ?? '<unknown>'} needs a label.`)
    }
    const chainArrays = {}
    for (const field of ['chainIds', 'brandedNames', 'domains', 'slugs', 'addresses']) {
      if (!Array.isArray(chainPolicy[field])) {
        errors.push(`Prohibited-chain policy ${chainPolicy.id ?? '<unknown>'} field ${field} must be an array.`)
        chainArrays[field] = []
      } else {
        chainArrays[field] = chainPolicy[field]
        if (chainPolicy[field].length === 0) {
          errors.push(`Prohibited-chain policy ${chainPolicy.id ?? '<unknown>'} field ${field} must not be empty.`)
        }
      }
    }
    if (Array.isArray(chainPolicy.chainIds) && !chainArrays.chainIds.every((value) => typeof value === 'string' && /^[1-9]\d*$/.test(value))) {
      errors.push(`Prohibited-chain policy ${chainPolicy.id} has a malformed decimal chain id.`)
    }
    if (Array.isArray(chainPolicy.brandedNames) && !chainArrays.brandedNames.every((value) => typeof value === 'string' && value.trim() !== '')) {
      errors.push(`Prohibited-chain policy ${chainPolicy.id} has an empty branded name.`)
    }
    if (Array.isArray(chainPolicy.domains) && !chainArrays.domains.every((value) => typeof value === 'string' && /^(?:[a-z0-9-]+\.)+[a-z]{2,}$/i.test(value))) {
      errors.push(`Prohibited-chain policy ${chainPolicy.id} has a malformed domain.`)
    }
    if (Array.isArray(chainPolicy.slugs) && !chainArrays.slugs.every((value) => typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value))) {
      errors.push(`Prohibited-chain policy ${chainPolicy.id} has a malformed slug.`)
    }
    if (Array.isArray(chainPolicy.addresses) && !chainArrays.addresses.every((value) => typeof value === 'string' && /^0x[0-9a-f]{40}$/i.test(value))) {
      errors.push(`Prohibited-chain policy ${chainPolicy.id} has a malformed EVM address.`)
    }
    for (const [field, values] of Object.entries(chainArrays)) {
      const seen = new Set()
      for (const value of values) {
        const key = typeof value === 'string' ? value.toLowerCase() : String(value)
        if (seen.has(key)) errors.push(`Prohibited-chain policy ${chainPolicy.id} repeats ${field} value ${String(value)}.`)
        else seen.add(key)
      }
    }
    for (const value of chainArrays.addresses) {
      if (typeof value !== 'string') continue
      const assetOwner = addresses.get(value.toLowerCase())
      if (assetOwner) {
        errors.push(`Prohibited-chain address ${value} is already owned by competing-asset policy ${assetOwner}.`)
      }
    }
  }

  return errors
}

const COMPETING_CATALOG_ERRORS = validateCompetingAssetCatalog()
if (COMPETING_CATALOG_ERRORS.length > 0) {
  throw new Error(`Invalid competing-asset catalog:\n- ${COMPETING_CATALOG_ERRORS.join('\n- ')}`)
}

const COMPETING_NAME_BY_KEY = new Map()
const COMPETING_IDENTIFIER_BY_VALUE = new Map()
const COMPETING_ADDRESS_BY_VALUE = new Map()
const COMPETING_TON_ADDRESS_BY_VALUE = new Map()
const PROHIBITED_CHAIN_ADDRESS_BY_VALUE = new Set(
  PROHIBITED_CHAIN_POLICY.addresses.map((value) => value.toLowerCase())
)

for (const policy of COMPETING_ASSET_POLICIES) {
  for (const value of policy.names ?? []) {
    COMPETING_NAME_BY_KEY.set(normalizedNameKey(value), policy)
    for (const identifier of identifierFormsForName(value)) {
      const key = identifier.toLowerCase()
      const existing = COMPETING_IDENTIFIER_BY_VALUE.get(key)
      if (!existing || existing.id === policy.id) {
        COMPETING_IDENTIFIER_BY_VALUE.set(key, policy)
      }
    }
  }
  for (const value of policy.addresses ?? []) {
    COMPETING_ADDRESS_BY_VALUE.set(value.toLowerCase(), policy)
  }
  for (const value of policy.opaqueIdentifiers ?? []) {
    const canonicalTon = canonicalTonAddress(value)
    if (canonicalTon) COMPETING_TON_ADDRESS_BY_VALUE.set(canonicalTon, policy)
  }
}

function alternation(values, transform = escapeRegExp) {
  return [...new Set(values)]
    .sort((left, right) => right.length - left.length || left.localeCompare(right))
    .map(transform)
    .join('|')
}

const COMPETING_SYMBOL_CANDIDATES = COMPETING_ASSET_POLICIES
  .flatMap((policy) => (policy.symbols ?? []).map((value) => ({
    expression: new RegExp(
      escapeRegExp(value),
      policy.caseSensitiveSymbols?.includes(value) ? 'gu' : 'giu'
    ),
    policy,
    value
  })))
  .sort((left, right) => right.value.length - left.value.length || left.value.localeCompare(right.value))
const COMPETING_NAME_CANDIDATE = new RegExp(
  alternation(COMPETING_ASSET_POLICIES.flatMap((policy) => policy.names ?? []), nameExpressionSource),
  'giu'
)
const COMPETING_IDENTIFIER_CANDIDATE = new RegExp(
  alternation([...COMPETING_IDENTIFIER_BY_VALUE.keys()]),
  'giu'
)
const ALL_PROHIBITED_EVM_ADDRESSES = [
  ...COMPETING_ADDRESS_BY_VALUE.keys(),
  ...PROHIBITED_CHAIN_ADDRESS_BY_VALUE
]
const EVM_ADDRESS_CANDIDATE = /(?<![0-9a-f])0x[0-9a-f]{40}(?![0-9a-f])/giu
const BARE_COMPETING_ADDRESS_CANDIDATE = new RegExp(
  `(?<![0-9a-f])(?:${alternation(ALL_PROHIBITED_EVM_ADDRESSES.map((value) => value.slice(2)))})(?![0-9a-f])`,
  'giu'
)
const EMBEDDED_COMPETING_ADDRESS_CANDIDATE = new RegExp(
  alternation(ALL_PROHIBITED_EVM_ADDRESSES.map((value) => value.slice(2))),
  'giu'
)
const ABI_ENCODED_ADDRESS_CANDIDATE = /(?<![0-9a-f])(?:0x)?[0-9a-f]{64}(?![0-9a-f])/giu
const TON_RAW_ADDRESS_CANDIDATE = /(?<![A-Za-z0-9_-])-?\d+:[0-9a-f]{64}(?![A-Za-z0-9_-])/giu
const TON_USER_FRIENDLY_ADDRESS_CANDIDATE = /(?<![A-Za-z0-9_-])[A-Za-z0-9_-]{48}(?![A-Za-z0-9_-])/gu
const COMPETING_OPAQUE_IDENTIFIER_CANDIDATES = COMPETING_ASSET_POLICIES
  .flatMap((policy) => (policy.opaqueIdentifiers ?? []).map((value) => ({
    expression: new RegExp(
      `(?<![A-Za-z0-9])${escapeRegExp(value)}(?![A-Za-z0-9])`,
      opaqueIdentifierIsCaseSensitive(value) ? 'gu' : 'giu'
    ),
    policy,
    value
  })))
  .sort((left, right) => right.value.length - left.value.length || left.value.localeCompare(right.value))

function numericLiteralSource(value) {
  return [...value].map(escapeRegExp).join('_?')
}

const PROHIBITED_CHAIN_DECIMAL_ID_SOURCE = `(?:0_?)*(?:${alternation(PROHIBITED_CHAIN_POLICY.chainIds, numericLiteralSource)})`
const PROHIBITED_CHAIN_HEX_ID_SOURCE = `0x(?:0_?)*(?:${alternation(PROHIBITED_CHAIN_POLICY.chainIds.map((value) => BigInt(value).toString(16)), numericLiteralSource)})`
const PROHIBITED_CHAIN_SCALAR_ID_SOURCE = `(?:${PROHIBITED_CHAIN_HEX_ID_SOURCE}|${PROHIBITED_CHAIN_DECIMAL_ID_SOURCE})`
const PROHIBITED_CHAIN_ID_SOURCE = `(?:\\+?${PROHIBITED_CHAIN_SCALAR_ID_SOURCE}(?:n|u(?:32|64|128))?|(?:BigInt|Number)\\([ \\t]*['"\`]?\\+?${PROHIBITED_CHAIN_SCALAR_ID_SOURCE}['"\`]?[ \\t]*\\))`
const PROHIBITED_CHAIN_DOMAIN_SOURCE = alternation(PROHIBITED_CHAIN_POLICY.domains)
const PROHIBITED_CHAIN_SLUG_SOURCE = alternation(PROHIBITED_CHAIN_POLICY.slugs)
const PROHIBITED_CHAIN_BRANDED_NAME_SOURCE = alternation(
  PROHIBITED_CHAIN_POLICY.brandedNames,
  nameExpressionSource
)
const BASE_GENERIC_QUALIFIER_SOURCE = '(?:accounts?|address(?:es)?|assets?|class(?:es)?|configurations?|conversions?|currenc(?:y|ies)|director(?:y|ies)|encodings?|fees?|formats?|implementations?|interfaces?|isigner|iwalletaccount|layers?|modules?|objects?|paths?|protocols?|radices?|schemas?|solana|syntax(?:es)?|types?|units?|urls?|walletconfigs?|wallets?)'
const BASE_GENERIC_QUALIFIER = new RegExp(`^${BASE_GENERIC_QUALIFIER_SOURCE}$`, 'iu')
const CHAIN_VALUE_KEY_SOURCE = '(?:chain|chainName|destinationChain|fromChain|network|networkName|sourceChain|toChain)'
const CHAIN_ID_KEY_SOURCE = '(?:chain|chainId|chain_id|chainName|destinationChain|fromChain|network|networkId|network_id|networkName|sourceChain|toChain|(?:chain|network)\\.(?:id|chainId))'
const CHAIN_COLLECTION_KEY_SOURCE = '(?:chains?|chainIds|chain_ids|networks?|networkIds|network_ids|supportedChains|supportedNetworks)'
const OPTIONAL_PROPERTY_QUOTE_SOURCE = '(?:[\'"`])?'

function hasGenericBaseRouteContinuation(content, end) {
  const continuation = content.slice(end, end + 240)
  if (/^[ \t]+(?:[`*_]{1,3})?(?:\d+|binary|decimal|hex(?:adecimal)?|octal)\b/iu.test(continuation)) return true
  const direct = continuation.match(/^[ \t]+(?:[`*_]{1,3})?([\p{L}][\p{L}\p{N}]*)/u)
  if (direct && BASE_GENERIC_QUALIFIER.test(direct[1])) return true

  const html = continuation.match(/^[ \t]+<(?:code|em|strong)(?:[ \t][^>]*)?>[ \t]*([\p{L}][\p{L}\p{N}]*)/iu)
  if (html && BASE_GENERIC_QUALIFIER.test(html[1])) return true

  if (/^[ \t]+\\",\[\\"\$\\",\\"(?:code|em|strong)\\"/iu.test(continuation)) {
    const rsc = continuation.match(/\\"children\\":\\"([\p{L}][\p{L}\p{N}]*)/u)
    if (rsc && BASE_GENERIC_QUALIFIER.test(rsc[1])) return true
  }
  const serialized = continuation.match(/\\?"children\\?"[ \t]*:[ \t]*\\?"([\p{L}][\p{L}\p{N}]*)/u)
  if (serialized && BASE_GENERIC_QUALIFIER.test(serialized[1])) return true
  return false
}

function hasGenericBaseRouteContext(match, content) {
  if (hasGenericBaseRouteContinuation(content, match.index + match[0].length)) return true
  const prefix = content.slice(Math.max(0, match.index - 80), match.index)
  return /\binherit(?:s|ed)?\b[^\r\n.!?]{0,40}$/iu.test(prefix)
    || /\breturn(?:s|ed|ing)?[ \t]+to[ \t]+$/iu.test(prefix)
    || /\b(?:offset|relative)[ \t]+$/iu.test(prefix)
}

const PROHIBITED_CHAIN_PATTERNS = [
  {
    kind: 'chain-name',
    expression: /\b(?:Coinbase[ \t_-]+Base|Base[ \t_-]+by[ \t_-]+Coinbase)\b/giu
  },
  {
    kind: 'chain-brand',
    // These are Coinbase product names. Keep this case-sensitive so ordinary
    // phrases such as "base account" retain their generic meaning.
    expression: new RegExp(`(?<![\\p{L}\\p{N}])(?:${PROHIBITED_CHAIN_BRANDED_NAME_SOURCE})(?![\\p{L}\\p{N}])`, 'gu')
  },
  {
    kind: 'chain-name',
    expression: /\bbase(?:[ \t_-]+)?(?:mainnet|testnet|devnet|sepolia|goerli|chain|network|l2|explorer|gas(?:[ \t_-]+token)?|rpc(?:[ \t_-]+(?:endpoint|url))?)\b/giu
  },
  {
    kind: 'chain-name',
    expression: /^(?:#{1,6}[ \t]+|title:[ \t]*|name:[ \t]*)(?:['"`])?base(?:['"`])?[ \t]*$/gimu
  },
  {
    kind: 'chain-name',
    expression: /(?:\[[*_~`]*base[*_~`]*\]\([^\r\n)]+\)|<a\b[^>\r\n]*>[ \t]*base[ \t]*<\/a>)/giu
  },
  {
    kind: 'chain-route',
    expression: /\b(?:on|onto|via|across|supports?|supporting)[ \t]+(?:the[ \t]+)?base\b/giu,
    accept: (match, content) => !hasGenericBaseRouteContext(match, content)
  },
  {
    kind: 'chain-route',
    expression: /\b(?:bridge|build|deploy|route|run|send|settle|swap|transfer)(?:[ \t]+[\p{L}\p{N}_-]+){0,8}[ \t]+(?:on|onto|to|from|via|across|with)[ \t]+(?:the[ \t]+)?base\b/giu,
    accept: (match, content) => !hasGenericBaseRouteContext(match, content)
  },
  {
    kind: 'chain-name',
    expression: /\bbase[ \t]+(?:is|remains)[ \t]+(?:also[ \t]+)?(?:an?[ \t]+)?(?:available|compatible|configured|enabled|supported)\b/giu
  },
  {
    kind: 'chain-name',
    expression: /\bbase[ \t]+(?:enables?|offers?|provides?|supports?)[ \t]+(?:(?:cross[ \t_-]+chain|evm|on[ \t_-]+chain)[ \t]+)?(?:bridges?|chains?|networks?|payments?|routes?|settlement|swaps?|tokens?|transactions?)\b/giu
  },
  {
    kind: 'chain-value',
    expression: /\b(?:choose|select|set|use)[ \t]+(?:the[ \t]+)?base[ \t]+as[ \t]+(?:(?:a|the|your)[ \t]+)?(?:chain|network|source|destination)\b/giu
  },
  {
    kind: 'chain-value',
    expression: /\b(?:choose|select|set|use)[ \t]+(?:the[ \t]+)?base[ \t]+for[ \t]+(?:bridging|cross[ \t_-]+chain|gas|payments?|routing|settlement|swaps?|transactions?)\b/giu
  },
  {
    kind: 'chain-route',
    expression: /(?:\/(?:chains?|docs|networks?|sdk)\/base(?:[-_/](?:bridges?|chains?|explorers?|mainnet|networks?|routes?|rpcs?|sepolia|swaps?|tokens?))?|\/base[-_/](?:bridges?|chains?|explorers?|mainnet|networks?|routes?|rpcs?|sepolia|swaps?|tokens?))(?![A-Za-z0-9_-])/giu
  },
  {
    kind: 'chain-route',
    expression: new RegExp(`\/(?:chains?|networks?)\/(?:${PROHIBITED_CHAIN_DECIMAL_ID_SOURCE})(?:\/(?:assets?|bridges?|explorers?|routes?|rpcs?|swaps?|tokens?))?(?![A-Za-z0-9_])`, 'giu')
  },
  {
    kind: 'chain-inventory',
    expression: new RegExp(`\\b(?:chains|networks)\\b[ \\t]*(?:\\([^\\r\\n)]{0,200}\\bbase\\b(?![ \\t]+${BASE_GENERIC_QUALIFIER_SOURCE}\\b)[^\\r\\n)]{0,200}\\)|:[ \\t]*[^\\r\\n]{0,200}\\bbase\\b(?![ \\t]+${BASE_GENERIC_QUALIFIER_SOURCE}\\b)|(?:include(?:s|d|ing)?|are)[ \\t]+[^\\r\\n]{0,200}\\bbase\\b(?![ \\t]+${BASE_GENERIC_QUALIFIER_SOURCE}\\b))`, 'giu')
  },
  {
    kind: 'chain-inventory',
    expression: /\|[ \t]*`?base`?[ \t]*\|[ \t]*`?base`?[ \t]*\|/giu
  },
  {
    kind: 'chain-value',
    expression: new RegExp(`${OPTIONAL_PROPERTY_QUOTE_SOURCE}\\b${CHAIN_VALUE_KEY_SOURCE}\\b${OPTIONAL_PROPERTY_QUOTE_SOURCE}[ \\t]*(?:[:=]|\\bis\\b)[ \\t]*['"\`]?(?:base|BASE)['"\`]?\\b`, 'giu')
  },
  {
    kind: 'chain-value',
    expression: /--(?:chain|network)(?:=|[ \t]+)(?:base|BASE)\b/giu
  },
  {
    kind: 'chain-value',
    expression: new RegExp(`${OPTIONAL_PROPERTY_QUOTE_SOURCE}\\b${CHAIN_COLLECTION_KEY_SOURCE}\\b${OPTIONAL_PROPERTY_QUOTE_SOURCE}[ \\t]*(?:[:=]|\\bis\\b)[ \\t]*\\[[^\\]\\r\\n]{0,500}?(['"\`])base\\1`, 'giu')
  },
  {
    kind: 'chain-value',
    expression: /\bchains\.base\b|\bbase\.(?:blockExplorers|contracts|fees|id|nativeCurrency|rpcUrls|serializers|testnet)\b/gu
  },
  {
    kind: 'chain-value',
    expression: new RegExp(`${OPTIONAL_PROPERTY_QUOTE_SOURCE}\\b${CHAIN_COLLECTION_KEY_SOURCE}\\b${OPTIONAL_PROPERTY_QUOTE_SOURCE}[ \\t]*(?:[:=]|\\bis\\b)[ \\t]*\\[[^\\]]{0,500}?['\"\\x60]?base['\"\\x60]?(?![A-Za-z0-9_-])`, 'giu')
  },
  {
    kind: 'chain-value',
    expression: /\b(?:BaseExplorer|base(?:ChainId|Mainnet|Network|Rpc(?:Endpoint|Url|Urls)?|Sepolia|Testnet)|coinbaseBase)\b/giu
  },
  {
    kind: 'chain-route',
    expression: /\b(?:(?:on|onto|via|with)Base|(?:from|to)Base(?:Address|Chain|Explorer|Network|Route|Rpc|Token|Wallet))\b/gu
  },
  {
    kind: 'chain-value',
    expression: /\bimport[\s\S]{0,300}?\{[^}\r\n]{0,200}\bbase\b[^}\r\n]{0,200}\}[\s\S]{0,100}?\bfrom[ \t]*['"`](?:(?:@wagmi\/core|wagmi|viem)\/)?chains(?:\/[^'"`]*)?['"`]/giu
  },
  {
    kind: 'chain-id',
    expression: new RegExp(`${OPTIONAL_PROPERTY_QUOTE_SOURCE}\\b${CHAIN_ID_KEY_SOURCE}\\b${OPTIONAL_PROPERTY_QUOTE_SOURCE}[ \\t]*(?:[:=]|\\bis\\b)[ \\t]*\\[?[ \\t]*['\"\`]?(?:${PROHIBITED_CHAIN_ID_SOURCE})['\"\`]?(?![A-Za-z0-9_])`, 'giu')
  },
  {
    kind: 'chain-id',
    expression: new RegExp(`${OPTIONAL_PROPERTY_QUOTE_SOURCE}\\b${CHAIN_COLLECTION_KEY_SOURCE}\\b${OPTIONAL_PROPERTY_QUOTE_SOURCE}[ \\t]*(?:[:=]|\\bis\\b)[ \\t]*\\[[^\\]\\r\\n]{0,500}?['\"\`]?(?:${PROHIBITED_CHAIN_ID_SOURCE})['\"\`]?(?![A-Za-z0-9_])`, 'giu')
  },
  {
    kind: 'chain-id',
    expression: new RegExp(`--(?:chain-id|network-id)(?:=|[ \\t]+)(?:${PROHIBITED_CHAIN_ID_SOURCE})(?![0-9a-f_])`, 'giu')
  },
  {
    kind: 'chain-id',
    expression: new RegExp(`${OPTIONAL_PROPERTY_QUOTE_SOURCE}\\b${CHAIN_COLLECTION_KEY_SOURCE}\\b${OPTIONAL_PROPERTY_QUOTE_SOURCE}[ \\t]*(?:[:=]|\\bis\\b)[ \\t]*\\[[^\\]]{0,500}?['\"\\x60]?(?:${PROHIBITED_CHAIN_ID_SOURCE})['\"\\x60]?(?![A-Za-z0-9_])`, 'giu')
  },
  {
    kind: 'chain-id',
    // YAML block sequences are not bracketed. Bound the scan to an indented
    // collection block so an unrelated number elsewhere cannot satisfy it.
    expression: new RegExp(`^[ \\t]*${OPTIONAL_PROPERTY_QUOTE_SOURCE}${CHAIN_COLLECTION_KEY_SOURCE}${OPTIONAL_PROPERTY_QUOTE_SOURCE}[ \\t]*:[ \\t]*(?:#[^\\r\\n]*)?(?:\\r\\n|\\r|\\n|\\u2028|\\u2029)(?:(?:[ \\t]+(?:-[ \\t]*)?[^\\r\\n\\u2028\\u2029]*(?:\\r\\n|\\r|\\n|\\u2028|\\u2029)){0,100}?)[ \\t]+-[ \\t]*['\"\\x60]?(?:${PROHIBITED_CHAIN_ID_SOURCE})['\"\\x60]?(?![A-Za-z0-9_])`, 'gimu')
  },
  {
    kind: 'chain-id',
    expression: new RegExp(`\\b(?:chain|network)[ \\t]*\\[[ \\t]*['\"\\x60](?:id|chainId|networkId)['\"\\x60][ \\t]*\\][ \\t]*(?:[:=]|\\bis\\b)[ \\t]*(?:${PROHIBITED_CHAIN_ID_SOURCE})(?![A-Za-z0-9_])`, 'giu')
  },
  {
    kind: 'chain-id',
    expression: new RegExp(`^([ \\t]*)${OPTIONAL_PROPERTY_QUOTE_SOURCE}(?:chain|network)${OPTIONAL_PROPERTY_QUOTE_SOURCE}[ \\t]*:[ \\t]*(?:#[^\\r\\n]*)?(?:\\r\\n|\\r|\\n|\\u2028|\\u2029)\\1[ \\t]+${OPTIONAL_PROPERTY_QUOTE_SOURCE}(?:id|chainId|networkId)${OPTIONAL_PROPERTY_QUOTE_SOURCE}[ \\t]*:[ \\t]*(?:${PROHIBITED_CHAIN_ID_SOURCE})(?![A-Za-z0-9_])`, 'gimu')
  },
  {
    kind: 'chain-id',
    expression: new RegExp(`${OPTIONAL_PROPERTY_QUOTE_SOURCE}\\b${CHAIN_COLLECTION_KEY_SOURCE}\\b${OPTIONAL_PROPERTY_QUOTE_SOURCE}[ \\t]*(?:[:=]|\\bis\\b)[ \\t]*new[ \\t]+(?:Array|Set)[ \\t]*\\([ \\t]*\\[[^\\]]{0,500}?['\"\\x60]?(?:${PROHIBITED_CHAIN_ID_SOURCE})['\"\\x60]?(?![A-Za-z0-9_])`, 'giu')
  },
  {
    kind: 'chain-id',
    expression: new RegExp(`${OPTIONAL_PROPERTY_QUOTE_SOURCE}\\b${CHAIN_COLLECTION_KEY_SOURCE}\\b${OPTIONAL_PROPERTY_QUOTE_SOURCE}[ \\t]*(?:[:=]|\\bis\\b)[ \\t]*\\{[^}]{0,500}?['\"\\x60]?(?:${PROHIBITED_CHAIN_ID_SOURCE})['\"\\x60]?[ \\t]*:`, 'giu')
  },
  {
    kind: 'chain-id',
    expression: new RegExp(`\\b(?:const|let|var)[ \\t]+(?:configs?|registr(?:y|ies)|[A-Za-z_$][A-Za-z0-9_$]*(?:chain|network)[A-Za-z0-9_$]*)[ \\t]*=[ \\t]*\\{[^}]{0,500}?['\"\\x60]?(?:${PROHIBITED_CHAIN_ID_SOURCE})['\"\\x60]?[ \\t]*:`, 'giu')
  },
  {
    kind: 'chain-id',
    expression: new RegExp(`\\beip155:(?:${PROHIBITED_CHAIN_ID_SOURCE})\\b`, 'giu')
  },
  {
    kind: 'chain-id',
    expression: new RegExp(`\\bbase\\b[ \\t]*(?:\\(|:|[-–—])[ \\t]*(?:chain[ \\t]+id[ \\t]*[:=]?[ \\t]*)?(?:${PROHIBITED_CHAIN_ID_SOURCE})\\b|\\b(?:${PROHIBITED_CHAIN_ID_SOURCE})\\b[ \\t]*(?:\\)|:|[-–—])[ \\t]*base\\b`, 'giu')
  },
  {
    kind: 'chain-id',
    expression: new RegExp(`\\|[ \\t]*base[ \\t]*\\|[ \\t]*(?:${PROHIBITED_CHAIN_ID_SOURCE})[ \\t]*\\||\\|[ \\t]*(?:${PROHIBITED_CHAIN_ID_SOURCE})[ \\t]*\\|[ \\t]*base[ \\t]*\\|`, 'giu')
  },
  {
    kind: 'chain-id',
    expression: new RegExp(`\\b(?:defineChain|createChain)\\s*\\(\\s*\\{[^}]{0,500}?\\b(?:id|chainId)\\b[ \\t]*:[ \\t]*(?:${PROHIBITED_CHAIN_ID_SOURCE})(?![A-Za-z0-9_])`, 'giu')
  },
  {
    kind: 'chain-id',
    // A bare `id` is too ambiguous, but EVM chain metadata makes the object a
    // chain definition even when it omits the human-readable network name.
    expression: new RegExp(`\\{(?=[^}]{0,1000}?${OPTIONAL_PROPERTY_QUOTE_SOURCE}\\b(?:id|chainId)\\b${OPTIONAL_PROPERTY_QUOTE_SOURCE}[ \\t]*:[ \\t]*(?:${PROHIBITED_CHAIN_ID_SOURCE})(?![A-Za-z0-9_]))(?=[^}]{0,1000}?${OPTIONAL_PROPERTY_QUOTE_SOURCE}\\b(?:blockExplorers|contracts|nativeCurrency|rpcUrls|testnet)\\b${OPTIONAL_PROPERTY_QUOTE_SOURCE}[ \\t]*:)[^}]{1,1000}?\\}`, 'giu')
  },
  {
    kind: 'chain-id',
    expression: new RegExp(`\\{(?=[^}]{0,500}?${OPTIONAL_PROPERTY_QUOTE_SOURCE}\\b(?:id|chainId)\\b${OPTIONAL_PROPERTY_QUOTE_SOURCE}[ \\t]*:[ \\t]*(?:${PROHIBITED_CHAIN_ID_SOURCE})(?![A-Za-z0-9_]))(?=[^}]{0,500}?${OPTIONAL_PROPERTY_QUOTE_SOURCE}\\b(?:name|slug)\\b${OPTIONAL_PROPERTY_QUOTE_SOURCE}[ \\t]*:[ \\t]*['\"\`]base['\"\`])[^}]{1,500}?\\}`, 'giu')
  },
  {
    kind: 'chain-id',
    expression: new RegExp(`${OPTIONAL_PROPERTY_QUOTE_SOURCE}\\b(?:chain|network)\\b${OPTIONAL_PROPERTY_QUOTE_SOURCE}[ \\t]*:[ \\t]*\\{[^}]{0,500}?${OPTIONAL_PROPERTY_QUOTE_SOURCE}\\b(?:id|chainId)\\b${OPTIONAL_PROPERTY_QUOTE_SOURCE}[ \\t]*:[ \\t]*(?:${PROHIBITED_CHAIN_ID_SOURCE})(?![A-Za-z0-9_])`, 'giu')
  },
  {
    kind: 'chain-domain',
    expression: new RegExp(`(?<![A-Za-z0-9.-])(?:[A-Za-z0-9-]+\\.)*(?:${PROHIBITED_CHAIN_DOMAIN_SOURCE})(?![A-Za-z0-9.-])`, 'giu')
  },
  {
    kind: 'chain-slug',
    expression: new RegExp(`(?<![A-Za-z0-9])(?:${PROHIBITED_CHAIN_SLUG_SOURCE})(?![A-Za-z0-9])`, 'giu')
  }
]

function decodedCharacterAt(content, index) {
  HTML_COMMENT_AT_INDEX.lastIndex = index
  const htmlComment = HTML_COMMENT_AT_INDEX.exec(content)
  if (htmlComment) {
    return { end: index + htmlComment[0].length, value: '' }
  }

  NAMED_POLICY_ENTITY.lastIndex = index
  const namedEntity = NAMED_POLICY_ENTITY.exec(content)
  if (namedEntity) {
    const zeroWidth = /(?:ZeroWidthSpace|zwnj|zwj);$/iu.test(namedEntity[0])
    return { end: index + namedEntity[0].length, value: zeroWidth ? '' : ' ' }
  }

  ENCODED_SURROGATE_PAIR.lastIndex = index
  const surrogatePair = ENCODED_SURROGATE_PAIR.exec(content)
  if (surrogatePair) {
    const high = Number.parseInt(surrogatePair[1], 16)
    const low = Number.parseInt(surrogatePair[2], 16)
    const codePoint = 0x10000 + ((high - 0xd800) << 10) + (low - 0xdc00)
    return {
      end: index + surrogatePair[0].length,
      value: String.fromCodePoint(codePoint)
    }
  }

  CSS_HEX_ESCAPE.lastIndex = index
  const cssEscape = CSS_HEX_ESCAPE.exec(content)
  if (cssEscape) {
    const codePoint = Number.parseInt(cssEscape[1], 16)
    if (Number.isInteger(codePoint) && codePoint <= 0x10ffff && codePoint !== 0 && !(codePoint >= 0xd800 && codePoint <= 0xdfff)) {
      return {
        end: index + cssEscape[0].length,
        value: String.fromCodePoint(codePoint)
      }
    }
  }

  PERCENT_BYTE.lastIndex = index
  const firstPercentByte = PERCENT_BYTE.exec(content)
  if (firstPercentByte) {
    const firstByte = Number.parseInt(firstPercentByte[1], 16)
    const byteLength = firstByte <= 0x7f
      ? 1
      : firstByte >= 0xc2 && firstByte <= 0xdf
        ? 2
        : firstByte >= 0xe0 && firstByte <= 0xef
          ? 3
          : firstByte >= 0xf0 && firstByte <= 0xf4
            ? 4
            : 0
    let encoded = firstPercentByte[0]
    let end = index + firstPercentByte[0].length
    for (let byteIndex = 1; byteIndex < byteLength; byteIndex += 1) {
      PERCENT_BYTE.lastIndex = end
      const nextPercentByte = PERCENT_BYTE.exec(content)
      if (!nextPercentByte) {
        encoded = ''
        break
      }
      encoded += nextPercentByte[0]
      end += nextPercentByte[0].length
    }
    if (encoded && byteLength > 0) {
      try {
        const value = decodeURIComponent(encoded)
        if ([...value].length === 1) return { end, value }
      } catch {
        // Leave malformed percent escapes unchanged so diagnostics retain source fidelity.
      }
    }
  }

  ENCODED_CHARACTER.lastIndex = index
  const encoded = ENCODED_CHARACTER.exec(content)
  if (encoded) {
    const hexadecimal = encoded[1] ?? encoded[2] ?? encoded[3] ?? encoded[4]
    const codePoint = Number.parseInt(hexadecimal ?? encoded[5], hexadecimal ? 16 : 10)
    if (Number.isInteger(codePoint) && codePoint <= 0x10ffff && !(codePoint >= 0xd800 && codePoint <= 0xdfff)) {
      return {
        end: index + encoded[0].length,
        value: String.fromCodePoint(codePoint)
      }
    }
  }

  const codePoint = content.codePointAt(index)
  const value = String.fromCodePoint(codePoint)
  return { end: index + value.length, value }
}

function normalizedPolicyView(content) {
  if (!POLICY_NORMALIZATION_TRIGGER.test(content) && content.normalize('NFKC') === content) {
    return {
      content,
      identity: true,
      sourceEnds: null,
      sourceStarts: null
    }
  }

  const characters = []
  const sourceStarts = []
  const sourceEnds = []

  for (let index = 0; index < content.length;) {
    const decoded = decodedCharacterAt(content, index)
    for (const normalizedCharacter of decoded.value.normalize('NFKC')) {
      const compatible = ASCII_CONFUSABLES.get(normalizedCharacter) ?? normalizedCharacter
      for (const character of compatible.normalize('NFKC')) {
        if (DEFAULT_IGNORABLE.test(character)) continue
        const policyCharacter = /[\p{Zl}\p{Zp}]/u.test(character) ? ' ' : character
        characters.push(policyCharacter)
        for (let offset = 0; offset < policyCharacter.length; offset += 1) {
          sourceStarts.push(index)
          sourceEnds.push(decoded.end)
        }
      }
    }
    index = decoded.end
  }

  return {
    content: characters.join(''),
    identity: false,
    sourceEnds,
    sourceStarts
  }
}

function renderedPolicyView(view) {
  if (!/[&\r\n<*~`\[\]]/.test(view.content)) return null

  const characters = []
  const sourceStarts = []
  const sourceEnds = []
  const append = (value, normalizedIndex, normalizedEnd = normalizedIndex + 1) => {
    characters.push(value)
    const start = view.identity ? normalizedIndex : view.sourceStarts[normalizedIndex]
    const end = view.identity ? normalizedEnd : view.sourceEnds[normalizedEnd - 1]
    for (let offset = 0; offset < value.length; offset += 1) {
      sourceStarts.push(start)
      sourceEnds.push(end)
    }
  }

  const activeMarkers = []
  let fence = null

  for (let index = 0; index < view.content.length;) {
    const remainder = view.content.slice(index)
    const atLineStart = index === 0 || /[\r\n\u2028\u2029]/u.test(view.content[index - 1])
    if (atLineStart) {
      const lineEndMatch = remainder.match(/^[^\r\n\u2028\u2029]*(?:\r\n|[\r\n\u2028\u2029]|$)/u)
      const line = lineEndMatch?.[0] ?? remainder
      const fenceMatch = line.match(/^[ \t]{0,3}(`{3,}|~{3,})/u)
      if (fence || fenceMatch) {
        if (fenceMatch) {
          const marker = fenceMatch[1]
          if (!fence) fence = marker
          else if (marker[0] === fence[0] && marker.length >= fence.length) fence = null
        }
        append(' ', index, index + line.length)
        index += line.length
        continue
      }
    }

    const htmlComment = remainder.match(/^<!--[\s\S]*?-->/u)
    if (htmlComment) {
      index += htmlComment[0].length
      continue
    }

    const spacingEntity = remainder.match(/^&(?:emsp|ensp|NewLine|nbsp|Tab|thinsp);/iu)
    if (spacingEntity) {
      append(' ', index, index + spacingEntity[0].length)
      index += spacingEntity[0].length
      continue
    }

    const zeroWidthEntity = remainder.match(/^&(?:ZeroWidthSpace|zwnj|zwj);/iu)
    if (zeroWidthEntity) {
      index += zeroWidthEntity[0].length
      continue
    }

    const htmlTag = remainder.match(/^<\/?(?:a|abbr|b|code|del|em|i|ins|mark|s|small|span|strong|sub|sup|u)\b[^>\r\n]*>/iu)
    if (htmlTag) {
      index += htmlTag[0].length
      continue
    }

    const markdownLink = remainder.match(/^\[([^\]\r\n]*)\]\([^\r\n)]*\)/u)
    if (markdownLink) {
      const labelStart = index + 1
      for (let offset = 0; offset < markdownLink[1].length;) {
        const character = markdownLink[1].slice(offset).match(/^./su)?.[0] ?? ''
        append(character, labelStart + offset, labelStart + offset + character.length)
        offset += character.length
      }
      index += markdownLink[0].length
      continue
    }

    const character = view.content[index]
    if (character === '`') {
      const marker = remainder.match(/^`+/u)?.[0] ?? '`'
      const closing = view.content.indexOf(marker, index + marker.length)
      const nextLine = view.content.slice(index + marker.length).search(/[\r\n\u2028\u2029]/u)
      if (closing !== -1 && (nextLine === -1 || closing < index + marker.length + nextLine)) {
        append(' ', index, closing + marker.length)
        index = closing + marker.length
        continue
      }
    }
    if (character === '*' || character === '~') {
      const marker = remainder.match(/^(?:\*{1,3}|~{2})/u)?.[0]
      if (marker) {
        if (activeMarkers.at(-1) === marker) {
          activeMarkers.pop()
          index += marker.length
          continue
        }
        const closing = view.content.indexOf(marker, index + marker.length)
        const nextLine = view.content.slice(index + marker.length).search(/[\r\n\u2028\u2029]/u)
        if (closing !== -1 && (nextLine === -1 || closing < index + marker.length + nextLine)) {
          activeMarkers.push(marker)
          index += marker.length
          continue
        }
      }
    }
    if (character === '\r' || character === '\n' || character === '\u2028' || character === '\u2029') {
      const end = character === '\r' && view.content[index + 1] === '\n' ? index + 2 : index + 1
      append(' ', index, end)
      index = end
      continue
    }
    append(character, index)
    index += character.length
  }

  return {
    content: characters.join(''),
    identity: false,
    sourceEnds,
    sourceStarts
  }
}

function lineStartsFor(content) {
  const starts = [0]
  for (let index = 0; index < content.length; index += 1) {
    if (content[index] === '\r') {
      if (content[index + 1] === '\n') index += 1
      starts.push(index + 1)
    } else if (content[index] === '\n' || content[index] === '\u2028' || content[index] === '\u2029') {
      starts.push(index + 1)
    }
  }
  return starts
}

function sourceLocation(lineStarts, index, content) {
  let low = 0
  let high = lineStarts.length
  while (low + 1 < high) {
    const middle = Math.floor((low + high) / 2)
    if (lineStarts[middle] <= index) low = middle
    else high = middle
  }
  return {
    column: [...content.slice(lineStarts[low], index)].length + 1,
    line: low + 1
  }
}

function isLetterOrNumber(value) {
  return value !== undefined && LETTER_OR_NUMBER.test(value)
}

function hasIdentifierBoundaries(content, start, end) {
  const before = content[start - 1]
  const first = content[start]
  const after = content[end]
  const afterNext = content[end + 1]
  const startsSegment = !isLetterOrNumber(before)
    || ((LOWERCASE_LETTER.test(before) || /\d/.test(before)) && UPPERCASE_LETTER.test(first))
  const pluralSuffix = (after === 's' || after === 'S') && !isLetterOrNumber(afterNext)
  const endsSegment = !isLetterOrNumber(after)
    || pluralSuffix
    || (UPPERCASE_LETTER.test(after) && LOWERCASE_LETTER.test(afterNext ?? ''))
    || IDENTIFIER_SUFFIX.test(content.slice(end))
  return startsSegment && endsSegment
}

function hasTermBoundaries(content, start, end) {
  const before = content[start - 1]
  const after = content[end]
  const afterNext = content[end + 1]
  return !isLetterOrNumber(before)
    && (!isLetterOrNumber(after) || ((after === 's' || after === 'S') && !isLetterOrNumber(afterNext)))
}

function hasCompetingSymbolContext(content, start, end, symbol) {
  const prefix = content.slice(Math.max(0, start - 120), start)
  const suffix = content.slice(end, end + 120)
  const assetWord = '(?:assets?|coins?|currenc(?:y|ies)|stablecoins?|symbols?|tokens?)'
  const assetField = '(?:(?:[A-Za-z_$][A-Za-z0-9_$]*)?(?:Assets?|Coins?|Currenc(?:y|ies)|Stablecoins?|Symbols?|Tokens?))'

  // A one-character symbol must be held to a much tighter context than longer
  // symbols. Otherwise an unrelated identifier such as `timeoutMs` can match
  // merely because the word "token" appears elsewhere on the same line.
  if ([...symbol].length === 1) {
    return prefix.endsWith('$')
      || new RegExp(`\\b${assetField}["'\`]?[ \\t]*(?::|=)[ \\t]*["'\`]?$`, 'iu').test(prefix)
      || new RegExp(`\\b${assetField}["'\`]?[ \\t]*(?::|=)[ \\t]*\\[[^\\]\\r\\n]{0,120}$`, 'iu').test(prefix)
      || new RegExp(`^["'\`)}\\],.:;=-]*[ \\t]+${assetWord}\\b`, 'iu').test(suffix)
      || /\/(?:assets?|coins?|stablecoins?|symbols?|tokens?)\/[^/\r\n]*$/iu.test(prefix)
  }

  return new RegExp(`${assetWord}[^\\r\\n]{0,32}$`, 'iu').test(prefix)
    || new RegExp(`^[^\\r\\n]{0,32}${assetWord}\\b`, 'iu').test(suffix)
    || /\/(?:assets?|coins?|stablecoins?|symbols?|tokens?)\/[^/\r\n]*$/iu.test(prefix)
}

function hasCompetingOpaqueIdentifierContext(content, start, end) {
  const prefix = content.slice(Math.max(0, start - 160), start)
  const suffix = content.slice(end, end + 160)
  return /\b(?:asset[ \t_-]*ids?|assetIds?)["'`)]?[ \t]*(?::|=|#|\bis\b)?[ \t]*(?:["'`])?(?:\[[^\r\n\x5d]{0,120})?$/iu.test(prefix)
    || /\b(?:Polkadot|Westmint)\b|\bAsset[ \t]+Hub\b/iu.test(`${prefix}${suffix}`)
}

function addCompetingMatch(matches, policy, kind, match, view, originalContent) {
  if (!match[0] || match.index === undefined) return
  const start = view.identity ? match.index : view.sourceStarts[match.index]
  const end = view.identity
    ? match.index + match[0].length
    : view.sourceEnds[match.index + match[0].length - 1]
  if (start === undefined || end === undefined) return
  matches.push({
    end,
    kind,
    normalizedEnd: match.index + match[0].length,
    normalizedStart: match.index,
    policyId: policy.id,
    policyLabel: policy.label,
    start,
    value: originalContent.slice(start, end)
  })
}

function addEvmAddressMatches(matches, address, match, view, content, {
  assetKind,
  chainKind
}) {
  const normalizedAddress = address.toLowerCase()
  const assetPolicy = COMPETING_ADDRESS_BY_VALUE.get(normalizedAddress)
  if (assetPolicy) addCompetingMatch(matches, assetPolicy, assetKind, match, view, content)
  if (PROHIBITED_CHAIN_ADDRESS_BY_VALUE.has(normalizedAddress)) {
    addCompetingMatch(matches, PROHIBITED_CHAIN_POLICY, chainKind, match, view, content)
  }
}

function collectExpressionMatches(expression, content, callback) {
  expression.lastIndex = 0
  for (const match of content.matchAll(expression)) callback(match)
}

function competingAssetReason(kind) {
  if (kind.startsWith('chain-')) {
    return 'Coinbase Base is not permitted in documentation examples or capability inventories. Use an aligned supported chain.'
  }
  return 'Competing assets are not permitted in authored or generated documentation. Omit the example or use a source-accurate Tether-family or neutral asset; do not rename immutable upstream values.'
}

function shouldRenderPolicyMarkup(file) {
  return file === '<content>'
    || /\.(?:html?|mdx?)$/iu.test(file)
    || /(?:^|\/)llms(?:-full)?\.txt$/iu.test(file)
}

export function validateCompetingAssets(content, {
  file = '<content>',
  renderMarkup = shouldRenderPolicyMarkup(file)
} = {}) {
  const rawView = normalizedPolicyView(content)
  const renderedView = renderMarkup ? renderedPolicyView(rawView) : null
  const views = renderedView ? [rawView, renderedView] : [rawView]
  const matches = []

  for (const view of views) {
    for (const { expression, policy } of COMPETING_SYMBOL_CANDIDATES) {
      collectExpressionMatches(expression, view.content, (match) => {
        if (policy.ignoredSpellings?.includes(match[0])) return
        const end = match.index + match[0].length
        if (!hasIdentifierBoundaries(view.content, match.index, end)) return
        const configuredSymbol = (policy.symbols ?? []).find((value) => value.toLowerCase() === match[0].toLowerCase())
        if (configuredSymbol && policy.contextRequiredSymbols?.includes(configuredSymbol)
          && !hasCompetingSymbolContext(view.content, match.index, end, configuredSymbol)) return
        addCompetingMatch(matches, policy, 'symbol', match, view, content)
      })
    }

    collectExpressionMatches(COMPETING_NAME_CANDIDATE, view.content, (match) => {
      const policy = COMPETING_NAME_BY_KEY.get(normalizedNameKey(match[0]))
      const end = match.index + match[0].length
      if (!policy || !hasTermBoundaries(view.content, match.index, end)) return
      addCompetingMatch(matches, policy, 'name', match, view, content)
    })

    collectExpressionMatches(COMPETING_IDENTIFIER_CANDIDATE, view.content, (match) => {
      const policy = COMPETING_IDENTIFIER_BY_VALUE.get(match[0].toLowerCase())
      const end = match.index + match[0].length
      if (!policy || !hasIdentifierBoundaries(view.content, match.index, end)) return
      addCompetingMatch(matches, policy, 'identifier', match, view, content)
    })

    collectExpressionMatches(EVM_ADDRESS_CANDIDATE, view.content, (match) => {
      addEvmAddressMatches(matches, match[0], match, view, content, {
        assetKind: 'address',
        chainKind: 'chain-address'
      })
    })

    collectExpressionMatches(BARE_COMPETING_ADDRESS_CANDIDATE, view.content, (match) => {
      addEvmAddressMatches(matches, `0x${match[0]}`, match, view, content, {
        assetKind: 'address-without-prefix',
        chainKind: 'chain-address-without-prefix'
      })
    })

    collectExpressionMatches(EMBEDDED_COMPETING_ADDRESS_CANDIDATE, view.content, (match) => {
      addEvmAddressMatches(matches, `0x${match[0]}`, match, view, content, {
        assetKind: 'embedded-address',
        chainKind: 'chain-embedded-address'
      })
    })

    collectExpressionMatches(ABI_ENCODED_ADDRESS_CANDIDATE, view.content, (match) => {
      const address = `0x${match[0].replace(/^0x/i, '').slice(-40)}`.toLowerCase()
      addEvmAddressMatches(matches, address, match, view, content, {
        assetKind: 'abi-encoded-address',
        chainKind: 'chain-abi-encoded-address'
      })
    })

    for (const expression of [TON_RAW_ADDRESS_CANDIDATE, TON_USER_FRIENDLY_ADDRESS_CANDIDATE]) {
      collectExpressionMatches(expression, view.content, (match) => {
        const canonicalTon = canonicalTonAddress(match[0])
        const policy = canonicalTon ? COMPETING_TON_ADDRESS_BY_VALUE.get(canonicalTon) : null
        if (policy) addCompetingMatch(matches, policy, 'ton-address', match, view, content)
      })
    }

    for (const { expression, policy, value } of COMPETING_OPAQUE_IDENTIFIER_CANDIDATES) {
      collectExpressionMatches(expression, view.content, (match) => {
        if (policy.contextRequiredOpaqueIdentifiers?.includes(value)
          && !hasCompetingOpaqueIdentifierContext(view.content, match.index, match.index + match[0].length)) return
        addCompetingMatch(matches, policy, 'known-identifier', match, view, content)
      })
    }

    for (const { expression, kind, accept } of PROHIBITED_CHAIN_PATTERNS) {
      collectExpressionMatches(expression, view.content, (match) => {
        if (accept && !accept(match, view.content)) return
        addCompetingMatch(matches, PROHIBITED_CHAIN_POLICY, kind, match, view, content)
      })
    }
  }

  const accepted = []
  const acceptedEndByPolicy = new Map()
  for (const match of matches.sort((left, right) => (
    left.start - right.start
    || right.end - left.end
    || left.policyId.localeCompare(right.policyId)
    || left.kind.localeCompare(right.kind)
  ))) {
    const acceptedEnd = acceptedEndByPolicy.get(match.policyId) ?? -1
    if (match.start < acceptedEnd) continue
    accepted.push(match)
    acceptedEndByPolicy.set(match.policyId, match.end)
  }

  const lineStarts = lineStartsFor(content)
  return accepted
    .sort((left, right) => left.start - right.start || left.policyId.localeCompare(right.policyId))
    .map((match) => {
      const { column, line } = sourceLocation(lineStarts, match.start, content)
      return {
        column,
        file,
        kind: match.kind,
        line,
        policyId: match.policyId,
        policyLabel: match.policyLabel,
        reason: competingAssetReason(match.kind),
        value: match.value
      }
    })
}

export function validateCompetingAssetsInSearchIndex(content, { file = '<search-index>' } = {}) {
  let parsed
  try {
    parsed = JSON.parse(content)
  } catch (error) {
    throw new Error(`Generated search index ${file} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`)
  }

  const documents = parsed?.docs?.docs
  if (!documents || typeof documents !== 'object' || Array.isArray(documents)) {
    throw new Error(`Generated search index ${file} does not contain a docs.docs object.`)
  }

  // The Orama artifact also contains an internal radix index whose partial
  // prefixes are not reader-facing documentation. Scan only the canonical
  // document store, with stable key ordering, while retaining JSON object and
  // array context for chain names and numeric asset IDs.
  const sortedDocuments = Object.fromEntries(
    Object.keys(documents)
      .sort((left, right) => left.localeCompare(right))
      .map((documentId) => [documentId, documents[documentId]])
  )
  const projectedContent = JSON.stringify({ docs: { docs: sortedDocuments } })
  return validateCompetingAssets(projectedContent, { file, renderMarkup: false }).map((issue) => ({
    ...issue,
    column: undefined,
    generatedSource: 'docs.docs',
    line: undefined
  }))
}

function validateCompetingAssetsInPath(relativeFile) {
  return validateCompetingAssets(relativeFile, { file: relativeFile, renderMarkup: false }).map((issue) => ({
    ...issue,
    column: undefined,
    generatedSource: '$filePath',
    line: undefined
  }))
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

const UTF8_DECODER = new TextDecoder('utf-8', { fatal: true })
const ISO_BASE_MEDIA_BRANDS = new Set([
  'avif',
  'avis',
  'isom',
  'iso2',
  'M4V ',
  'mp41',
  'mp42',
  'qt  '
])
const SFNT_SCALER_TYPES = new Set(['OTTO', 'true', 'typ1'])

function bytesEqual(buffer, offset, expected) {
  if (buffer.length < offset + expected.length) return false
  return expected.every((byte, index) => buffer[offset + index] === byte)
}

function asciiAt(buffer, offset, length) {
  return buffer.subarray(offset, offset + length).toString('ascii')
}

function hasSfntScalerType(buffer, offset = 0) {
  return bytesEqual(buffer, offset, [0x00, 0x01, 0x00, 0x00])
    || SFNT_SCALER_TYPES.has(asciiAt(buffer, offset, 4))
}

function isSfntDirectory(buffer, offset = 0) {
  if (buffer.length < offset + 12 || !hasSfntScalerType(buffer, offset)) return false

  const tableCount = buffer.readUInt16BE(offset + 4)
  if (tableCount === 0 || tableCount > 4095) return false
  const directoryEnd = offset + 12 + tableCount * 16
  if (directoryEnd > buffer.length) return false

  let largestPowerOfTwo = 1
  let entrySelector = 0
  while (largestPowerOfTwo * 2 <= tableCount) {
    largestPowerOfTwo *= 2
    entrySelector += 1
  }
  const searchRange = largestPowerOfTwo * 16
  if (buffer.readUInt16BE(offset + 6) !== searchRange) return false
  if (buffer.readUInt16BE(offset + 8) !== entrySelector) return false
  if (buffer.readUInt16BE(offset + 10) !== tableCount * 16 - searchRange) return false

  for (let index = 0; index < tableCount; index += 1) {
    const record = offset + 12 + index * 16
    const tableOffset = buffer.readUInt32BE(record + 8)
    const tableLength = buffer.readUInt32BE(record + 12)
    if (tableOffset > buffer.length || tableLength > buffer.length - tableOffset) return false
  }
  return true
}

function isSfntFont(buffer) {
  if (isSfntDirectory(buffer)) return true
  if (asciiAt(buffer, 0, 4) !== 'ttcf' || buffer.length < 12) return false

  const version = buffer.readUInt32BE(4)
  const fontCount = buffer.readUInt32BE(8)
  if (![0x00010000, 0x00020000].includes(version)) return false
  if (fontCount === 0 || fontCount > Math.floor((buffer.length - 12) / 4)) return false
  for (let index = 0; index < fontCount; index += 1) {
    if (!isSfntDirectory(buffer, buffer.readUInt32BE(12 + index * 4))) return false
  }
  return true
}

function isWoffFont(buffer) {
  const signature = asciiAt(buffer, 0, 4)
  const headerLength = signature === 'wOFF' ? 44 : signature === 'wOF2' ? 48 : 0
  if (headerLength === 0 || buffer.length < headerLength) return false
  if (!hasSfntScalerType(buffer, 4) && asciiAt(buffer, 4, 4) !== 'ttcf') return false
  if (buffer.readUInt32BE(8) !== buffer.length) return false

  const tableCount = buffer.readUInt16BE(12)
  if (tableCount === 0 || tableCount > 4095 || buffer.readUInt16BE(14) !== 0) return false
  if (buffer.readUInt32BE(16) < 12 + tableCount * 16) return false

  if (signature === 'wOF2') {
    const compressedLength = buffer.readUInt32BE(20)
    return compressedLength > 0 && compressedLength <= buffer.length - headerLength
  }

  if (headerLength + tableCount * 20 > buffer.length) return false
  for (let index = 0; index < tableCount; index += 1) {
    const record = headerLength + index * 20
    const tableOffset = buffer.readUInt32BE(record + 4)
    const compressedLength = buffer.readUInt32BE(record + 8)
    const originalLength = buffer.readUInt32BE(record + 12)
    if (compressedLength === 0 || compressedLength > originalLength) return false
    if (tableOffset > buffer.length || compressedLength > buffer.length - tableOffset) return false
  }
  return true
}

function isRecognizedBinaryAsset(buffer) {
  return bytesEqual(buffer, 0, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    || bytesEqual(buffer, 0, [0xff, 0xd8, 0xff])
    || asciiAt(buffer, 0, 6) === 'GIF87a'
    || asciiAt(buffer, 0, 6) === 'GIF89a'
    || (asciiAt(buffer, 0, 4) === 'RIFF' && asciiAt(buffer, 8, 4) === 'WEBP')
    || (asciiAt(buffer, 4, 4) === 'ftyp' && ISO_BASE_MEDIA_BRANDS.has(asciiAt(buffer, 8, 4)))
    || isWoffFont(buffer)
    || isSfntFont(buffer)
}

async function readGovernedTextFile(file, { root, contentsByFile }) {
  if (contentsByFile.has(file)) return contentsByFile.get(file)

  const buffer = await fs.promises.readFile(file)
  if (isRecognizedBinaryAsset(buffer)) {
    contentsByFile.set(file, null)
    return null
  }

  let content
  try {
    content = UTF8_DECODER.decode(buffer)
  } catch {
    const relativeFile = normalizedRelativePath(root, file)
    throw new Error(`Governed file ${relativeFile} is neither valid UTF-8 text nor a recognized binary asset.`)
  }
  if (content.includes('\0')) {
    const relativeFile = normalizedRelativePath(root, file)
    throw new Error(`Governed UTF-8 text file ${relativeFile} contains a NUL byte.`)
  }

  contentsByFile.set(file, content)
  return content
}

async function listTextFiles(directory, { root, contentsByFile }) {
  const directoryStats = await fs.promises.lstat(directory)
  if (directoryStats.isSymbolicLink()) {
    throw new Error(`Governed path ${normalizedRelativePath(root, directory)} must not be a symbolic link.`)
  }
  if (!directoryStats.isDirectory()) {
    throw new Error(`Governed directory is not a directory: ${normalizedRelativePath(root, directory)}`)
  }

  const entries = await fs.promises.readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const target = path.join(directory, entry.name)
    if (entry.isSymbolicLink()) {
      throw new Error(`Governed path ${normalizedRelativePath(root, target)} must not be a symbolic link.`)
    }
    if (entry.isDirectory()) {
      files.push(...await listTextFiles(target, { root, contentsByFile }))
    } else if (entry.isFile()) {
      if (await readGovernedTextFile(target, { root, contentsByFile }) !== null) files.push(target)
    } else {
      throw new Error(`Governed path ${normalizedRelativePath(root, target)} has an unsupported file type.`)
    }
  }

  return files
}

function normalizedRelativePath(root, file) {
  return path.relative(root, file).split(path.sep).join('/')
}

async function pathEntryExists(target) {
  try {
    await fs.promises.lstat(target)
    return true
  } catch (error) {
    if (error && typeof error === 'object' && error.code === 'ENOENT') return false
    throw error
  }
}

function isExcludedCatalogPath(root, file, excludedPaths) {
  const relativeFile = normalizedRelativePath(root, file)
  return excludedPaths.some((excludedPath) => (
    relativeFile === excludedPath || relativeFile.startsWith(`${excludedPath}/`)
  ))
}

function isExcludedBuildOutputPath(directory, file, excludedPaths) {
  const relativeFile = normalizedRelativePath(directory, file)
  if (excludedPaths.some((excludedPath) => (
    relativeFile === excludedPath || relativeFile.startsWith(`${excludedPath}/`)
  ))) return true

  const pairedRoute = relativeFile.match(/^(.+)\/index\.(?:html?|txt)$/i)
  return pairedRoute !== null && fs.existsSync(path.join(directory, `${pairedRoute[1]}.md`))
}

export async function validateTokenSymbolFiles({
  root = process.cwd(),
  sourceDirectories = DEFAULT_SOURCE_DIRECTORIES,
  visibleSourceDirectories = DEFAULT_VISIBLE_SOURCE_DIRECTORIES,
  visibleSourceFiles = DEFAULT_VISIBLE_SOURCE_FILES,
  catalogSourceDirectories = DEFAULT_CATALOG_SOURCE_DIRECTORIES,
  catalogExcludedPaths = DEFAULT_CATALOG_EXCLUDED_PATHS,
  catalogSourceFiles = DEFAULT_CATALOG_SOURCE_FILES,
  generatedMarkdownFiles = DEFAULT_GENERATED_MARKDOWN_FILES,
  generatedCatalogFiles = DEFAULT_GENERATED_CATALOG_FILES,
  generatedSearchIndexFiles = DEFAULT_GENERATED_SEARCH_INDEX_FILES,
  buildOutputDirectories = [],
  buildOutputExcludedPaths = DEFAULT_BUILD_OUTPUT_EXCLUDED_PATHS,
  requiredBuildOutputFiles = REQUIRED_BUILD_OUTPUT_FILES
} = {}) {
  let rootStats
  try {
    rootStats = await fs.promises.lstat(root)
  } catch (error) {
    if (error && typeof error === 'object' && error.code === 'ENOENT') {
      throw new Error(`Token-symbol root does not exist: ${root}`)
    }
    throw error
  }
  if (rootStats.isSymbolicLink()) {
    throw new Error(`Token-symbol root must not be a symbolic link: ${root}`)
  }
  if (!rootStats.isDirectory()) {
    throw new Error(`Token-symbol root is not a directory: ${root}`)
  }

  const catalogFiles = new Set()
  const searchIndexFiles = new Set()
  const styleFiles = new Set()
  const contentsByFile = new Map()
  const directoryFiles = new Map()

  async function filesIn(directory) {
    if (!directoryFiles.has(directory)) {
      directoryFiles.set(directory, listTextFiles(directory, { root, contentsByFile }))
    }
    return directoryFiles.get(directory)
  }

  async function requireConfiguredTextFile(file) {
    const stats = await fs.promises.lstat(file)
    if (stats.isSymbolicLink()) {
      throw new Error(`Governed path ${normalizedRelativePath(root, file)} must not be a symbolic link.`)
    }
    if (!stats.isFile()) {
      throw new Error(`Governed file is not a regular file: ${normalizedRelativePath(root, file)}`)
    }
    const content = await readGovernedTextFile(file, { root, contentsByFile })
    if (content === null) {
      throw new Error(`Configured text file ${normalizedRelativePath(root, file)} is a recognized binary asset.`)
    }
  }

  for (const relativeDirectory of catalogSourceDirectories) {
    const directory = path.join(root, relativeDirectory)
    if (await pathEntryExists(directory)) {
      for (const file of await filesIn(directory)) {
        if (!isExcludedCatalogPath(root, file, catalogExcludedPaths)) catalogFiles.add(file)
      }
    }
  }
  for (const relativeDirectory of sourceDirectories) {
    const directory = path.join(root, relativeDirectory)
    if (await pathEntryExists(directory)) {
      for (const file of await filesIn(directory)) {
        catalogFiles.add(file)
        if (MARKDOWN_EXTENSION.test(file)) styleFiles.add(file)
      }
    }
  }
  for (const relativeDirectory of buildOutputDirectories) {
    const directory = path.join(root, relativeDirectory)
    if (!await pathEntryExists(directory)) {
      throw new Error(`Build-output directory does not exist: ${directory}`)
    }
    const files = await filesIn(directory)
    const missingRequiredFiles = requiredBuildOutputFiles
      .filter((relativeFile) => !fs.existsSync(path.join(directory, relativeFile)))
    if (missingRequiredFiles.length > 0) {
      throw new Error(`Build output ${relativeDirectory} is missing required files: ${missingRequiredFiles.join(', ')}`)
    }

    for (const file of files) {
      if (isExcludedBuildOutputPath(directory, file, buildOutputExcludedPaths)) continue
      catalogFiles.add(file)
      if (/(?:\.md|llms(?:-full)?\.txt)$/.test(file)) styleFiles.add(file)
    }
    for (const relativeFile of requiredBuildOutputFiles) {
      const file = path.join(directory, relativeFile)
      if (fs.existsSync(file)) {
        await requireConfiguredTextFile(file)
        catalogFiles.add(file)
        if (/^api\/search(?:\.json)?$/.test(relativeFile)) searchIndexFiles.add(file)
      }
    }
  }
  for (const relativeDirectory of visibleSourceDirectories) {
    const directory = path.join(root, relativeDirectory)
    if (await pathEntryExists(directory)) {
      for (const file of await filesIn(directory)) {
        catalogFiles.add(file)
        if (VISIBLE_SOURCE_EXTENSION.test(file)) styleFiles.add(file)
      }
    }
  }
  for (const relativeFile of visibleSourceFiles) {
    const file = path.join(root, relativeFile)
    if (await pathEntryExists(file)) {
      await requireConfiguredTextFile(file)
      catalogFiles.add(file)
      styleFiles.add(file)
    }
  }
  for (const relativeFile of [
    ...catalogSourceFiles,
    ...generatedMarkdownFiles,
    ...generatedCatalogFiles
  ]) {
    const file = path.join(root, relativeFile)
    if (await pathEntryExists(file)) {
      await requireConfiguredTextFile(file)
      catalogFiles.add(file)
    }
  }
  for (const relativeFile of generatedSearchIndexFiles) {
    const file = path.join(root, relativeFile)
    if (await pathEntryExists(file)) {
      await requireConfiguredTextFile(file)
      catalogFiles.add(file)
      searchIndexFiles.add(file)
    }
  }
  for (const relativeFile of generatedMarkdownFiles) {
    const file = path.join(root, relativeFile)
    if (await pathEntryExists(file)) {
      await requireConfiguredTextFile(file)
      styleFiles.add(file)
    }
  }

  const issues = []
  const sortedFiles = [...new Set([...catalogFiles, ...styleFiles])]
    .sort((left, right) => left.localeCompare(right))
  for (const file of sortedFiles) {
    const content = contentsByFile.get(file)
    if (typeof content !== 'string') {
      throw new Error(`Governed text file was not decoded: ${normalizedRelativePath(root, file)}`)
    }
    const relativeFile = normalizedRelativePath(root, file)
    if (catalogFiles.has(file)) issues.push(...validateCompetingAssetsInPath(relativeFile))
    if (catalogFiles.has(file)) {
      issues.push(...(searchIndexFiles.has(file)
        ? validateCompetingAssetsInSearchIndex(content, { file: relativeFile })
        : validateCompetingAssets(content, { file: relativeFile })))
    }
    if (styleFiles.has(file)) {
      const markdown = MARKDOWN_EXTENSION.test(file)
        || /(?:^|\/)llms(?:-full)?\.txt$/.test(relativeFile)
      issues.push(...(markdown
        ? validateTokenSymbols(content, { file: relativeFile })
        : validateVisibleTokenStrings(content, { file: relativeFile })))
    }
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
    console.log(`✅ check-token-symbols: validated ${files.length} documentation policy files.`)
    return
  }

  console.error(`❌ check-token-symbols: found ${issues.length} documentation-policy issue(s):\n`)
  for (const issue of issues) {
    const location = issue.generatedSource
      ? issue.file
      : `${issue.file}:${issue.line}${issue.column ? `:${issue.column}` : ''}`
    console.error(`- ${location}`)
    if (issue.policyId) {
      console.error(`  policy: ${issue.policyId} (${issue.policyLabel}) [${issue.kind}]`)
    }
    if (issue.generatedSource) console.error(`  generated source: ${issue.generatedSource}`)
    const found = JSON.stringify(String(issue.value).slice(0, 200))
    console.error(`  found: ${found}${String(issue.value).length > 200 ? '…' : ''}`)
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
