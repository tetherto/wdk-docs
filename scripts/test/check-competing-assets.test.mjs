import test from 'node:test'
import assert from 'node:assert/strict'

import {
  validateCompetingAssetCatalog,
  validateCompetingAssets,
  validateCompetingAssetsInSearchIndex
} from '../check-token-symbols.mjs'
import {
  COMPETING_ASSET_POLICIES,
  PROHIBITED_CHAIN_POLICY
} from '../competing-assets-policy.mjs'

const BASE_REASON = 'Coinbase Base is not permitted in documentation examples or capability inventories. Use an aligned supported chain.'

function policyWith(overrides = {}) {
  return {
    id: 'example-asset',
    label: 'Example Asset',
    symbols: ['EXA'],
    ...overrides
  }
}

function validChainWith(overrides = {}) {
  return { ...PROHIBITED_CHAIN_POLICY, ...overrides }
}

function identifierFormsForName(value) {
  const words = value.normalize('NFKC').trim().split(/[ \t_-]+/).filter(Boolean)
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

function issueSummary(issue) {
  return {
    column: issue.column,
    file: issue.file,
    kind: issue.kind,
    line: issue.line,
    policyId: issue.policyId,
    policyLabel: issue.policyLabel,
    value: issue.value
  }
}

function assertPolicyMatch(content, policy, value, kind) {
  const issues = validateCompetingAssets(content)
  assert.ok(
    issues.some((issue) => (
      issue.policyId === policy.id
      && issue.value === value
      && (!kind || issue.kind === kind)
    )),
    `expected ${policy.id}/${kind ?? 'any kind'} to match ${JSON.stringify(value)}; got ${JSON.stringify(issues.map(issueSummary))}`
  )
}

test('the complete configured competing-asset and prohibited-chain catalogs are valid', () => {
  assert.deepEqual(validateCompetingAssetCatalog(), [])

  assert.ok(COMPETING_ASSET_POLICIES.length > 0)
  assert.ok(COMPETING_ASSET_POLICIES.every((policy) => policy.id && policy.label))
  assert.ok(COMPETING_ASSET_POLICIES.every((policy) => (
    [...(policy.symbols ?? []), ...(policy.names ?? [])].length > 0
  )))
  assert.ok(COMPETING_ASSET_POLICIES.every((policy) => (
    [...(policy.addresses ?? []), ...(policy.opaqueIdentifiers ?? [])].length > 0
  )))
  assert.ok(COMPETING_ASSET_POLICIES.some((policy) => (policy.opaqueIdentifiers ?? []).length > 0))
  for (const requiredPolicy of [
    'agora-ausd',
    'alchemix-alusd',
    'falcon-usdf',
    'paxos-lift-dollar',
    'resolv-usr',
    'synthetix-susd'
  ]) {
    assert.ok(COMPETING_ASSET_POLICIES.some((policy) => policy.id === requiredPolicy), requiredPolicy)
  }
  assert.deepEqual(PROHIBITED_CHAIN_POLICY.chainIds.length, 3)
  assert.ok(PROHIBITED_CHAIN_POLICY.brandedNames.length > 0)
  assert.ok(PROHIBITED_CHAIN_POLICY.addresses.length > 0)
})

test('catalog validation rejects malformed entries and normalized/case-insensitive collisions', () => {
  assert.deepEqual(
    validateCompetingAssetCatalog({}, validChainWith()),
    ['Competing-asset policies must be an array.']
  )
  assert.deepEqual(
    validateCompetingAssetCatalog([null], validChainWith()),
    ['Every competing-asset policy must be an object.']
  )
  assert.deepEqual(
    validateCompetingAssetCatalog([policyWith({ id: 'Not valid' })], validChainWith()),
    ['Invalid competing-asset policy id: Not valid']
  )
  assert.deepEqual(
    validateCompetingAssetCatalog([policyWith({ label: ' ' })], validChainWith()),
    ['Competing-asset policy example-asset needs a label.']
  )
  assert.deepEqual(
    validateCompetingAssetCatalog([policyWith({ symbols: [], names: [] })], validChainWith()),
    ['Competing-asset policy example-asset needs a symbol or name.']
  )
  assert.deepEqual(
    validateCompetingAssetCatalog([policyWith({ symbols: [''] })], validChainWith()),
    ['Competing-asset policy example-asset has an empty alias.']
  )
  assert.deepEqual(
    validateCompetingAssetCatalog([policyWith({ symbols: 'EXA' })], validChainWith()),
    ['Competing-asset policy example-asset field symbols must be an array.']
  )
  assert.deepEqual(
    validateCompetingAssetCatalog([policyWith({ addresses: { value: '0x123' } })], validChainWith()),
    ['Competing-asset policy example-asset field addresses must be an array.']
  )
  assert.deepEqual(
    validateCompetingAssetCatalog([
      policyWith(),
      policyWith({ id: 'second-asset', label: 'Second Asset', names: ['ＵＮＤＥＲＳＣＯＲＥ'], symbols: ['SECOND'] })
    ], validChainWith()),
    []
  )
  assert.deepEqual(
    validateCompetingAssetCatalog([
      policyWith({ symbols: ['USDC'] }),
      policyWith({ id: 'second-asset', label: 'Second Asset', symbols: ['ＵＳＤＣ'] })
    ], validChainWith()),
    ['Competing-asset alias ＵＳＤＣ is shared by example-asset and second-asset.']
  )
  assert.deepEqual(
    validateCompetingAssetCatalog([policyWith({ symbols: ['EXA', 'exa'] })], validChainWith()),
    ['Competing-asset policy example-asset repeats alias exa.']
  )
  assert.deepEqual(
    validateCompetingAssetCatalog([
      policyWith(),
      policyWith({ id: 'example-asset', label: 'Duplicate ID' })
    ], validChainWith()),
    ['Duplicate competing-asset policy id: example-asset']
  )
  assert.deepEqual(
    validateCompetingAssetCatalog([
      policyWith({ addresses: ['0x123'] })
    ], validChainWith()),
    ['Competing-asset policy example-asset has a malformed EVM address: 0x123']
  )
  assert.deepEqual(
    validateCompetingAssetCatalog([
      policyWith({ addresses: ['0x0000000000000000000000000000000000000001'] }),
      policyWith({ id: 'second-asset', label: 'Second Asset', symbols: ['SECOND'], addresses: ['0X0000000000000000000000000000000000000001'] })
    ], validChainWith()),
    ['EVM address 0X0000000000000000000000000000000000000001 is shared by example-asset and second-asset.']
  )
  assert.deepEqual(
    validateCompetingAssetCatalog([policyWith({
      addresses: [
        '0x0000000000000000000000000000000000000001',
        '0X0000000000000000000000000000000000000001'
      ]
    })], validChainWith()),
    ['Competing-asset policy example-asset repeats EVM address 0X0000000000000000000000000000000000000001.']
  )
  assert.deepEqual(
    validateCompetingAssetCatalog([policyWith({ opaqueIdentifiers: [''] })], validChainWith()),
    ['Competing-asset policy example-asset has an empty opaque identifier.']
  )
  assert.deepEqual(
    validateCompetingAssetCatalog([
      policyWith({ opaqueIdentifiers: ['Opaque-ID'] }),
      policyWith({ id: 'second-asset', label: 'Second Asset', symbols: ['SECOND'], opaqueIdentifiers: ['opaque-id'] })
    ], validChainWith()),
    ['Opaque identifier opaque-id is shared by example-asset and second-asset.']
  )
  assert.deepEqual(
    validateCompetingAssetCatalog([policyWith({ opaqueIdentifiers: ['Opaque-ID', 'opaque-id'] })], validChainWith()),
    ['Competing-asset policy example-asset repeats opaque identifier opaque-id.']
  )
  assert.deepEqual(
    validateCompetingAssetCatalog([policyWith({ ignoredSpellings: 'Exa' })], validChainWith()),
    ['Competing-asset policy example-asset field ignoredSpellings must be an array.']
  )
  assert.deepEqual(
    validateCompetingAssetCatalog([policyWith({ ignoredSpellings: ['EXA'] })], validChainWith()),
    ['Competing-asset policy example-asset cannot ignore configured symbol EXA.']
  )
  assert.deepEqual(
    validateCompetingAssetCatalog([policyWith({ ignoredSpellings: ['OTHER'] })], validChainWith()),
    ['Competing-asset policy example-asset ignored spelling OTHER must be a case variant of a configured symbol.']
  )
  assert.deepEqual(
    validateCompetingAssetCatalog([
      policyWith({ symbols: ['FIRST'], names: ['USD Coin'] }),
      policyWith({ id: 'second-asset', label: 'Second Asset', symbols: ['SECOND'], names: ['Usdcoin'] })
    ], validChainWith()),
    [
      'Derived competing-asset identifier Usdcoin is shared by example-asset and second-asset.',
      'Competing-asset alias usdcoin in second-asset collides with a derived identifier in example-asset.'
    ]
  )
  assert.deepEqual(
    validateCompetingAssetCatalog([policyWith({
      addresses: ['0x0000000000000000000000000000000000000001'],
      opaqueIdentifiers: ['0x0000000000000000000000000000000000000001']
    })], validChainWith()),
    ['EVM address 0x0000000000000000000000000000000000000001 is also an opaque identifier in example-asset; address owner is example-asset.']
  )
  assert.deepEqual(
    validateCompetingAssetCatalog([policyWith({ opaqueIdentifiers: ['exa'] })], validChainWith()),
    ['Opaque identifier exa in example-asset collides with an alias in example-asset.']
  )
  assert.deepEqual(
    validateCompetingAssetCatalog([policyWith({ names: ['Example Asset'], opaqueIdentifiers: ['exampleasset'] })], validChainWith()),
    ['Opaque identifier exampleasset in example-asset collides with a derived identifier in example-asset.']
  )
  assert.deepEqual(
    validateCompetingAssetCatalog([policyWith({ caseSensitiveSymbols: 'EXA' })], validChainWith()),
    ['Competing-asset policy example-asset field caseSensitiveSymbols must be an array.']
  )
  assert.deepEqual(
    validateCompetingAssetCatalog([policyWith({ caseSensitiveSymbols: [''] })], validChainWith()),
    ['Competing-asset policy example-asset has an empty caseSensitiveSymbols value.']
  )
  assert.deepEqual(
    validateCompetingAssetCatalog([policyWith({ contextRequiredSymbols: ['OTHER'] })], validChainWith()),
    ['Competing-asset policy example-asset contextRequiredSymbols value OTHER must be a configured symbol.']
  )
  assert.deepEqual(
    validateCompetingAssetCatalog([policyWith({ symbols: ['EXA', 'OTHER'], caseSensitiveSymbols: ['EXA', 'EXA'] })], validChainWith()),
    ['Competing-asset policy example-asset repeats caseSensitiveSymbols value EXA.']
  )
  assert.deepEqual(
    validateCompetingAssetCatalog([policyWith({ opaqueIdentifiers: ['1337'], contextRequiredOpaqueIdentifiers: '1337' })], validChainWith()),
    ['Competing-asset policy example-asset field contextRequiredOpaqueIdentifiers must be an array.']
  )
  assert.deepEqual(
    validateCompetingAssetCatalog([policyWith({ opaqueIdentifiers: ['1337'], contextRequiredOpaqueIdentifiers: ['31337'] })], validChainWith()),
    ['Competing-asset policy example-asset contextRequiredOpaqueIdentifiers value 31337 must be a configured opaque identifier.']
  )
})

test('catalog validation checks the prohibited chain policy independently', () => {
  assert.deepEqual(
    validateCompetingAssetCatalog([policyWith()], null),
    ['The prohibited-chain policy must be an object.']
  )
  assert.deepEqual(
    validateCompetingAssetCatalog([policyWith()], validChainWith({ id: 'Coinbase Base' })),
    ['Invalid prohibited-chain policy id: Coinbase Base']
  )
  assert.deepEqual(
    validateCompetingAssetCatalog([policyWith()], validChainWith({ chainIds: ['8453', 'not-a-chain'] })),
    ['Prohibited-chain policy coinbase-base has a malformed decimal chain id.']
  )
  assert.deepEqual(
    validateCompetingAssetCatalog([policyWith()], validChainWith({ domains: ['base.org', 'not a domain'] })),
    ['Prohibited-chain policy coinbase-base has a malformed domain.']
  )
  assert.deepEqual(
    validateCompetingAssetCatalog([policyWith()], validChainWith({ chainIds: '8453' })),
    ['Prohibited-chain policy coinbase-base field chainIds must be an array.']
  )
  assert.deepEqual(
    validateCompetingAssetCatalog([policyWith()], validChainWith({ domains: { value: 'base.org' } })),
    ['Prohibited-chain policy coinbase-base field domains must be an array.']
  )
  assert.deepEqual(
    validateCompetingAssetCatalog([policyWith()], validChainWith({ brandedNames: [''] })),
    ['Prohibited-chain policy coinbase-base has an empty branded name.']
  )
  assert.deepEqual(
    validateCompetingAssetCatalog([policyWith()], validChainWith({ slugs: ['Base Mainnet'] })),
    ['Prohibited-chain policy coinbase-base has a malformed slug.']
  )
  assert.deepEqual(
    validateCompetingAssetCatalog([policyWith()], validChainWith({ addresses: ['0x123'] })),
    ['Prohibited-chain policy coinbase-base has a malformed EVM address.']
  )
  assert.deepEqual(
    validateCompetingAssetCatalog([policyWith()], validChainWith({ chainIds: ['8453', '8453'] })),
    ['Prohibited-chain policy coinbase-base repeats chainIds value 8453.']
  )
  assert.deepEqual(
    validateCompetingAssetCatalog([policyWith()], validChainWith({ id: 'example-asset' })),
    ['Prohibited-chain policy id example-asset collides with a competing-asset policy id.']
  )
  for (const field of ['chainIds', 'brandedNames', 'domains', 'slugs', 'addresses']) {
    assert.deepEqual(
      validateCompetingAssetCatalog([policyWith()], validChainWith({ [field]: [] })),
      [`Prohibited-chain policy coinbase-base field ${field} must not be empty.`]
    )
  }
})

test('flags every configured symbol, name, EVM address, and opaque identifier', () => {
  for (const policy of COMPETING_ASSET_POLICIES) {
    for (const value of policy.symbols ?? []) {
      const content = policy.contextRequiredSymbols?.includes(value)
        ? `token: ${value}`
        : `‹${value}›`
      assertPolicyMatch(content, policy, value, 'symbol')
    }
    for (const value of policy.names ?? []) {
      // A name can intentionally win over a shorter symbol or identifier from
      // the same policy; assert the policy and exact source value in that case.
      assertPolicyMatch(`‹${value}›`, policy, value)
    }
    for (const value of policy.addresses ?? []) {
      assertPolicyMatch(`‹${value}›`, policy, value, 'address')
    }
    for (const value of policy.opaqueIdentifiers ?? []) {
      const content = policy.contextRequiredOpaqueIdentifiers?.includes(value)
        ? `assetId: ${value}`
        : `‹${value}›`
      assertPolicyMatch(content, policy, value, 'known-identifier')
    }
  }
})

test('matches configured terms and EVM addresses case-insensitively without losing source spelling', () => {
  for (const policy of COMPETING_ASSET_POLICIES) {
    for (const value of policy.symbols ?? []) {
      for (const variant of new Set([value.toLowerCase(), value.toUpperCase()])) {
        if (
          policy.ignoredSpellings?.includes(variant)
          || (policy.caseSensitiveSymbols?.includes(value) && variant !== value)
        ) {
          assert.ok(!validateCompetingAssets(`(${variant})`).some((issue) => issue.policyId === policy.id), variant)
        } else {
          const content = policy.contextRequiredSymbols?.includes(value)
            ? `token: ${variant}`
            : `(${variant})`
          assertPolicyMatch(content, policy, variant)
        }
      }
    }
    for (const value of policy.names ?? []) {
      for (const variant of new Set([value.toLowerCase(), value.toUpperCase()])) {
        assertPolicyMatch(`(${variant})`, policy, variant)
      }
    }
    for (const value of policy.addresses ?? []) {
      for (const variant of new Set([value.toLowerCase(), value.toUpperCase()])) {
        assertPolicyMatch(`[${variant}]`, policy, variant)
      }
    }
  }
})

test('uses format-aware casing for opaque on-chain identifiers', () => {
  const circle = COMPETING_ASSET_POLICIES.find((policy) => policy.id === 'circle-usd')
  const solana = circle.opaqueIdentifiers.find((value) => value.startsWith('EPj'))
  assertPolicyMatch(solana, circle, solana, 'known-identifier')
  assert.deepEqual(validateCompetingAssets(solana.toUpperCase()), [])
  assertPolicyMatch('UUSDC', circle, 'UUSDC', 'known-identifier')
})

test('requires asset context for short numeric identifiers without weakening exact asset symbols', () => {
  const circle = COMPETING_ASSET_POLICIES.find((policy) => policy.id === 'circle-usd')
  for (const value of circle.contextRequiredOpaqueIdentifiers) {
    for (const contextual of [
      `assetId: ${value}`,
      `assetId: "${value}"`,
      `"asset_id": "${value}"`,
      `assetId = '${value}'`,
      `\`asset-id\`: \`${value}\``,
      `{"assetId":${value}}`,
      `{"assetIds":[1,${value}]}`,
      `Polkadot Asset Hub asset ${value}`
    ]) {
      assertPolicyMatch(contextual, circle, value, 'known-identifier')
    }
    for (const unrelated of [
      value,
      `chainId: "${value}"`,
      `networkId: "${value}"`,
      `port: "${value}"`,
      `Issue #${value}`,
      `The result was ${value}.`
    ]) {
      assert.ok(!validateCompetingAssets(unrelated).some((issue) => issue.policyId === circle.id), unrelated)
    }
  }

  assertPolicyMatch('Use PAX.', COMPETING_ASSET_POLICIES.find((policy) => policy.id === 'pax-dollar'), 'PAX', 'symbol')
  assert.deepEqual(validateCompetingAssets('Pax Romana and pax command syntax.'), [])
  assertPolicyMatch('token: BOLD', COMPETING_ASSET_POLICIES.find((policy) => policy.id === 'liquity-bold'), 'BOLD', 'symbol')
  assert.deepEqual(validateCompetingAssets('Use BOLD emphasis and bold text.'), [])
})

test('requires tight asset context for the single-letter M symbol', () => {
  const m0 = COMPETING_ASSET_POLICIES.find((policy) => policy.id === 'm0-m')
  for (const contextual of [
    'token: M',
    "const token = 'M'",
    '{"asset":"M"}',
    '/tokens/M',
    'tokens: ["WETH", "M"]',
    'const supportedTokens = ["WETH", "M"]'
  ]) {
    assertPolicyMatch(contextual, m0, 'M', 'symbol')
  }
  assertPolicyMatch('$M token', m0, 'M token')

  for (const unrelated of [
    'M is a type parameter.',
    'broadcastTimeoutMs',
    'configTtlMs',
    '/reference/SPL_TOKEN_PROGRAM_ID_M'
  ]) {
    assert.ok(!validateCompetingAssets(unrelated).some((issue) => issue.policyId === m0.id), unrelated)
  }

  const mintIssues = validateCompetingAssets('const mint = "mzerokyEX9TNDoK4o2YZQBDmMzjokAeN6M2g2S3pLJo";')
  assert.ok(mintIssues.some((issue) => issue.policyId === m0.id && issue.kind === 'known-identifier'))
  assert.ok(!mintIssues.some((issue) => issue.policyId === m0.id && issue.kind === 'symbol'))
})

test('keeps RSC build IDs out of asset-route context while detecting an explicit symbol field', () => {
  const metadata = [
    ':HL["/assets/vision.png","image"]',
    '17:X',
    '0:{"buildId":"HF7lTrzeaMZdlgeQv2b2H","data":[{"rsc":["$","$1"]}]}'
  ].join('\n')
  const buildIdIssues = validateCompetingAssets(metadata, { file: 'dist/route.__PAGE__.txt', renderMarkup: false })
  assert.ok(!buildIdIssues.some((issue) => issue.policyId === 'm0-m'))

  const withAsset = `${metadata}\n0:{"data":{"symbol":"M"}}`
  const assetIssues = validateCompetingAssets(withAsset, { file: 'dist/route.__PAGE__.txt', renderMarkup: false })
    .filter((issue) => issue.policyId === 'm0-m')
  assert.deepEqual(assetIssues.map((issue) => [issue.line, issue.kind, issue.value]), [
    [4, 'symbol', 'M']
  ])
})

test('requires asset context for RLP without rejecting Ethereum encoding prose', () => {
  const resolv = COMPETING_ASSET_POLICIES.find((policy) => policy.id === 'resolv-usr')
  for (const contextual of [
    'token: RLP',
    "const asset = 'RLP'",
    '/tokens/RLP',
    'RLP token',
    'supportedAssets: ["ETH", "RLP"]'
  ]) {
    assertPolicyMatch(contextual, resolv, 'RLP', 'symbol')
  }

  for (const unrelated of [
    'Recursive Length Prefix (RLP) encodes Ethereum values.',
    'Decode the RLP-encoded transaction.',
    'The RLP decoder rejects malformed lists.',
    '`RLP` means Recursive Length Prefix.'
  ]) {
    assert.ok(!validateCompetingAssets(unrelated).some((issue) => issue.policyId === resolv.id), unrelated)
  }
})

test('blocks lowercase code identifiers for unambiguous mixed-case competitor symbols', () => {
  for (const [content, policyId] of [
    ['const susd = token', 'synthetix-susd'],
    ['const usdx = token', 'synthetix-susd'],
    ['const alusd = token', 'alchemix-alusd']
  ]) {
    assert.ok(validateCompetingAssets(content).some((issue) => issue.policyId === policyId), content)
  }
})

test('allows grammatical plural usds while retaining the exact USDS symbol', () => {
  const sky = COMPETING_ASSET_POLICIES.find((policy) => policy.id === 'sky-usds')
  for (const prose of ['These usds are accepted.', 'Several Usds are listed.', 'Multiple USDs are supported.']) {
    assert.ok(!validateCompetingAssets(prose).some((issue) => issue.policyId === sky.id), prose)
  }
  assertPolicyMatch('token: USDS', sky, 'USDS', 'symbol')
})

test('canonicalizes equivalent TON contract-address formats and validates checksums', () => {
  const cases = [
    ['0:f412fa64e2d8a614e1e6cb84afde5fca1145e533e74dd7f2a1ae84c27c1db090', 'first-digital-usd'],
    ['UQD0Evpk4timFOHmy4Sv3l_KEUXlM-dN1_KhroTCfB2wkLL4', 'first-digital-usd'],
    ['0:086fa2a675f74347b08dd4606a549b8fdb98829cb282bc1949d3b12fbaed9dcc', 'ethena-usd'],
    ['UQAIb6KmdfdDR7CN1GBqVJuP25iCnLKCvBlJ07Evuu2dzKOa', 'ethena-usd'],
    ['0:d0e545323c7acb7102653c073377f7e3c67f122eb94d430a250739f109d4a57d', 'ethena-usd'],
    ['UQDQ5UUyPHrLcQJlPAczd_fjxn8SLrlNQwolBznxCdSlfVHu', 'ethena-usd']
  ]
  for (const [address, policyId] of cases) {
    assert.ok(validateCompetingAssets(address).some((issue) => issue.policyId === policyId && issue.kind === 'ton-address'), address)
  }

  for (const invalid of [
    'UQD0Evpk4timFOHmy4Sv3l_KEUXlM-dN1_KhroTCfB2wkLL5',
    'UQAIb6KmdfdDR7CN1GBqVJuP25iCnLKCvBlJ07Evuu2dzKOb',
    'UQDQ5UUyPHrLcQJlPAczd_fjxn8SLrlNQwolBznxCdSlfVHv',
    '0:f412fa64e2d8a614e1e6cb84afde5fca1145e533e74dd7f2a1ae84c27c1db091'
  ]) {
    assert.deepEqual(validateCompetingAssets(invalid), [], invalid)
  }
})

test('blocks Hedera token IDs and their long-zero EVM equivalents', () => {
  const circle = COMPETING_ASSET_POLICIES.find((policy) => policy.id === 'circle-usd')
  for (const value of ['0.0.456858', '0.0.429274']) {
    assertPolicyMatch(value, circle, value, 'known-identifier')
  }
  for (const value of [
    '0x000000000000000000000000000000000006f89a',
    '0x0000000000000000000000000000000000068cda'
  ]) {
    assertPolicyMatch(value, circle, value, 'address')
  }
  assert.deepEqual(validateCompetingAssets('0x000000000000000000000000000000000006f89b'), [])
})

test('matches all generated identifier spellings for every configured name', () => {
  for (const policy of COMPETING_ASSET_POLICIES) {
    for (const name of policy.names ?? []) {
      for (const identifier of identifierFormsForName(name)) {
        assertPolicyMatch(`const ${identifier} = true`, policy, identifier, 'identifier')
      }
    }
  }

  const independentlySpecifiedCases = [
    ['uSdCoIn', 'circle-usd'],
    ['pAyPaLuSd', 'paypal-usd'],
    ['dAiStAbLeCoIn', 'maker-dai'],
    ['USDCaccount', 'circle-usd'],
    ['DAIcoin', 'maker-dai'],
    ['PYUSDcoin', 'paypal-usd'],
    ['USDCV2', 'circle-usd'],
    ['USDCL2', 'circle-usd'],
    ['USDC2', 'circle-usd'],
    ['DAI42', 'maker-dai']
  ]
  for (const [identifier, policyId] of independentlySpecifiedCases) {
    const issues = validateCompetingAssets(`const ${identifier} = true`)
    assert.ok(
      issues.some((issue) => issue.policyId === policyId),
      `mixed-case identifier ${identifier} did not produce ${policyId}: ${JSON.stringify(issues.map(issueSummary))}`
    )
  }
  for (const nearMiss of ['uSdCoIncidence', 'DAIcoinage', 'USDCV20foo']) {
    assert.deepEqual(validateCompetingAssets(`const ${nearMiss} = true`), [], nearMiss)
  }
})

test('retries overlapping symbol aliases when a longer alias fails its boundary', () => {
  for (const value of ['USDC.enabled', 'USDC.example', 'USDC.endpoint']) {
    assert.deepEqual(validateCompetingAssets(value).map(({ policyId, kind, value: found }) => ({ policyId, kind, value: found })), [
      { policyId: 'circle-usd', kind: 'symbol', value: 'USDC' }
    ])
  }
  assertPolicyMatch('USDC.e', COMPETING_ASSET_POLICIES.find((policy) => policy.id === 'circle-usd'), 'USDC.e', 'symbol')
})

test('blocks independently specified current, legacy, wrapped, and staked asset aliases', () => {
  const cases = [
    ['sfrxusd', 'frax-usd'],
    ['lfrax', 'frax-usd'],
    ['nrusdb', 'blast-usd'],
    ['susdd', 'decentralized-usd'],
    ['usddold', 'decentralized-usd'],
    ['sdola', 'dola'],
    ['fxdola', 'dola'],
    ['rusdy', 'ondo-usdy'],
    ['usdyc', 'ondo-usdy'],
    ['wusdm', 'mountain-usdm'],
    ['busd0', 'usual-usd0'],
    ['rt-busd0', 'usual-usd0'],
    ['susd0', 'usual-usd0'],
    ['usd0a', 'usual-usd0'],
    ['token: BOLD', 'liquity-bold'],
    ['scrvusd', 'curve-usd'],
    ['sgho', 'aave-gho'],
    ['stkgho', 'aave-gho'],
    ['fpi', 'frax-fpi'],
    ['seur0', 'usual-eur0'],
    ['eur0', 'usual-eur0'],
    ['usd1', 'world-liberty-usd1']
  ]
  for (const [value, policyId] of cases) {
    assert.ok(validateCompetingAssets(value).some((issue) => issue.policyId === policyId), value)
  }
})

test('blocks independently specified canonical EVM and non-EVM asset identifiers', () => {
  const cases = [
    ['0x6c3ea9036406852006290770BEdFcAbA0e23A0e8', 'paypal-usd'],
    ['2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo', 'paypal-usd'],
    ['0x4c9EDD5852cd905f086C759E8383e09bff1E68B3', 'ethena-usd'],
    ['0x9D39A5DE30e57443BfF2A8307A4256c8797A3497', 'ethena-usd'],
    ['0x4300000000000000000000000000000000000003', 'blast-usd'],
    ['0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f', 'aave-gho'],
    ['0x865377367054516e17014ccded1e7d814edc9ce4', 'dola'],
    ['0x73A15FeD60Bf67631dC6cd7Bc5B6e8da8190aCF5', 'usual-usd0'],
    ['0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c', 'euro-coin'],
    ['HzwqbKZw8HxMN6bF2yFZNrht3c2iXXzpKcFu7uBEDKtr', 'euro-coin'],
    ['0x6440f144b7e50D6a8439336510312d2F54beB01D', 'liquity-bold'],
    ['0xE8d1E2531761406Af1615A6764B0d5fF52736F56', 'curve-usd'],
    ['0xE1753F2e00940cC31213dd92013cF019DFE4ca1d', 'aave-gho'],
    ['0x5Ca135cB8527d76e932f34B5145575F9d8cbE08E', 'frax-fpi'],
    ['0x3c89Cd1884E7beF73ca3ef08d2eF6EC338fD8E49', 'usual-eur0'],
    ['USD1ttGY1N17NEEHLmELoaybftRBUSErhqYiQzvEmuB', 'world-liberty-usd1']
  ]
  for (const [value, policyId] of cases) {
    assert.ok(validateCompetingAssets(value).some((issue) => issue.policyId === policyId), value)
  }
})

test('matches names across punctuation separators and surrounding punctuation', () => {
  const cases = [
    ['USD Coin', ['USD-Coin', 'USD_Coin', 'USD\tCoin']],
    ['Dai Stablecoin', ['Dai-Stablecoin', 'Dai_Stablecoin']],
    ['PayPal USD', ['PayPal-USD', 'PayPal_USD']],
    ['Magic Internet Money', ['Magic-Internet-Money', 'Magic_Internet_Money']]
  ]

  for (const [name, variants] of cases) {
    const policy = COMPETING_ASSET_POLICIES.find((candidate) => candidate.names?.includes(name))
    assert.ok(policy)
    for (const value of variants) assertPolicyMatch(`(${value}),`, policy, value, 'name')
  }

  assert.deepEqual(
    validateCompetingAssets('USDC.e, USD0++, and (USDbC)!').map(issueSummary),
    [
      { column: 1, file: '<content>', kind: 'symbol', line: 1, policyId: 'circle-usd', policyLabel: 'USD Coin', value: 'USDC.e' },
      { column: 9, file: '<content>', kind: 'symbol', line: 1, policyId: 'usual-usd0', policyLabel: 'Usual USD0', value: 'USD0++' },
      { column: 22, file: '<content>', kind: 'symbol', line: 1, policyId: 'circle-usd', policyLabel: 'USD Coin', value: 'USDbC' }
    ]
  )
})

test('scans prose, code, URLs, package-like paths, and identifiers as raw policy contexts', () => {
  const address = COMPETING_ASSET_POLICIES.find((policy) => policy.id === 'circle-usd').addresses[0]
  const abiEncodedAddress = `0x${'0'.repeat(24)}${address.slice(2)}`
  const bareAddress = address.slice(2)
  const opaque = COMPETING_ASSET_POLICIES.find((policy) => policy.id === 'sky-usds').opaqueIdentifiers[0]
  const content = [
    'Prose names USDC and USD Coin.',
    'https://tokens.example/USDC?address=' + address,
    `calldata=${abiEncodedAddress}`,
    `addressWithoutPrefix=${bareAddress}`,
    '@vendor/USDC-adapter and /assets/USDC',
    '```javascript',
    `const USDCoin = '${opaque}'`,
    'const token = "USDC"',
    '```'
  ].join('\n')
  const issues = validateCompetingAssets(content, { file: 'content/docs/example.mdx' })

  assert.deepEqual(issues.map(({ value, kind, policyId, file }) => ({ value, kind, policyId, file })), [
    { value: 'USDC', kind: 'symbol', policyId: 'circle-usd', file: 'content/docs/example.mdx' },
    { value: 'USD Coin', kind: 'name', policyId: 'circle-usd', file: 'content/docs/example.mdx' },
    { value: 'USDC', kind: 'symbol', policyId: 'circle-usd', file: 'content/docs/example.mdx' },
    { value: address, kind: 'address', policyId: 'circle-usd', file: 'content/docs/example.mdx' },
    { value: abiEncodedAddress, kind: 'abi-encoded-address', policyId: 'circle-usd', file: 'content/docs/example.mdx' },
    { value: bareAddress, kind: 'address-without-prefix', policyId: 'circle-usd', file: 'content/docs/example.mdx' },
    { value: 'USDC', kind: 'symbol', policyId: 'circle-usd', file: 'content/docs/example.mdx' },
    { value: 'USDC', kind: 'symbol', policyId: 'circle-usd', file: 'content/docs/example.mdx' },
    { value: 'USDCoin', kind: 'identifier', policyId: 'circle-usd', file: 'content/docs/example.mdx' },
    { value: opaque, kind: 'known-identifier', policyId: 'sky-usds', file: 'content/docs/example.mdx' },
    { value: 'USDC', kind: 'symbol', policyId: 'circle-usd', file: 'content/docs/example.mdx' }
  ])
})

test('finds known addresses embedded inside calldata without flagging unknown hex', () => {
  const policy = COMPETING_ASSET_POLICIES.find((candidate) => candidate.id === 'circle-usd')
  const address = policy.addresses[0]
  const payload = `0xdeadbeef${address.slice(2)}cafebabe`
  assert.deepEqual(validateCompetingAssets(payload).map(({ kind, policyId, value }) => ({ kind, policyId, value })), [
    { kind: 'embedded-address', policyId: 'circle-usd', value: address.slice(2) }
  ])
  assert.deepEqual(validateCompetingAssets(`0xdeadbeef${'1'.repeat(40)}cafebabe`), [])
})

test('blocks the exact competitor and Coinbase Base shapes removed by the documentation review', () => {
  const regressions = [
    { content: "toToken: 'USDC'", policyId: 'circle-usd' },
    { content: "toToken: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'", policyId: 'circle-usd' },
    {
      content: "server.registerToken('ethereum', 'DAI', { address: '0x6B175474E89094C44Da98b954EedeAC495271d0F' })",
      policyId: 'maker-dai'
    },
    {
      content: 'Aave V3 spans multiple EVM chains (Ethereum, Arbitrum, Base, Optimism).',
      policyId: 'coinbase-base'
    },
    { content: '| `base` | Base |', policyId: 'coinbase-base' },
    { content: "toChain: 'BASE'", policyId: 'coinbase-base' },
    { content: "USDB: 'btkn1...'", policyId: 'blast-usd' },
    {
      content: '0x3274643db77a064abd3bc851de77556a4ad2e2f502f4f0c80845fa8f909ecf0b',
      policyId: 'sky-usds'
    }
  ]

  for (const { content, policyId } of regressions) {
    const issues = validateCompetingAssets(content)
    assert.ok(
      issues.some((issue) => issue.policyId === policyId),
      `${JSON.stringify(content)} did not produce ${policyId}: ${JSON.stringify(issues.map(issueSummary))}`
    )
  }
})

test('normalizes NFKC/fullwidth text and strips zero-width and bidirectional controls', () => {
  const cases = [
    { source: 'ＵＳＤＣ', value: 'ＵＳＤＣ', policyId: 'circle-usd', kind: 'symbol' },
    { source: '𝐔𝐒𝐃𝐂', value: '𝐔𝐒𝐃𝐂', policyId: 'circle-usd', kind: 'symbol' },
    { source: 'ⓊⓈⒹⒸ', value: 'ⓊⓈⒹⒸ', policyId: 'circle-usd', kind: 'symbol' },
    { source: 'ＰａｙＰａｌ　ＵＳＤ', value: 'ＰａｙＰａｌ　ＵＳＤ', policyId: 'paypal-usd', kind: 'name' },
    { source: 'U\u200bS\u200dD\u202eC', value: 'U\u200bS\u200dD\u202eC', policyId: 'circle-usd', kind: 'symbol' },
    { source: 'U\u00adSDC', value: 'U\u00adSDC', policyId: 'circle-usd', kind: 'symbol' },
    { source: 'U\ufe0fSDC', value: 'U\ufe0fSDC', policyId: 'circle-usd', kind: 'symbol' },
    { source: 'U\u034fSDC', value: 'U\u034fSDC', policyId: 'circle-usd', kind: 'symbol' },
    { source: 'P\u061cayPal USD', value: 'P\u061cayPal USD', policyId: 'paypal-usd', kind: 'name' },
    { source: 'UЅDС', value: 'UЅDС', policyId: 'circle-usd', kind: 'symbol' },
    { source: 'UꜱDС', value: 'UꜱDС', policyId: 'circle-usd', kind: 'symbol' },
    { source: 'UᏚDC', value: 'UᏚDC', policyId: 'circle-usd', kind: 'symbol' }
  ]

  for (const { source, value, policyId, kind } of cases) {
    const issues = validateCompetingAssets(`prefix ${source} suffix`)
    assert.ok(issues.some((issue) => (
      issue.policyId === policyId && issue.kind === kind && issue.value === value
    )), `expected normalized match for ${JSON.stringify(source)}; got ${JSON.stringify(issues.map(issueSummary))}`)
  }
})

test('scans rendered prose across Markdown, HTML, and line-break markup without losing source locations', () => {
  const cases = [
    ['US**DC**', 'circle-usd'],
    ['US<span>DC</span>', 'circle-usd'],
    ['USD **Coin**', 'circle-usd'],
    ['PayPal\nUSD', 'paypal-usd'],
    ['on **Base**', 'coinbase-base'],
    ['[Base](https://example.com)', 'coinbase-base'],
    ['USD <strong>Coin</strong>', 'circle-usd'],
    ['on <strong>Base</strong>', 'coinbase-base']
  ]
  for (const [content, policyId] of cases) {
    const issues = validateCompetingAssets(`prefix\n${content}\nsuffix`, { file: 'rendered.mdx' })
    assert.ok(issues.some((issue) => issue.policyId === policyId && issue.line === 2), JSON.stringify({ content, issues: issues.map(issueSummary) }))
  }
  assert.deepEqual(validateCompetingAssets('Use the **base class** and [base URL](https://example.com).'), [])
})

test('decodes policy-relevant named entities, HTML comments, and CSS escapes', () => {
  const cases = [
    ['US<!-- -->DC', 'circle-usd'],
    ['USD&nbsp;Coin', 'circle-usd'],
    ['US&zwnj;DC', 'circle-usd'],
    [String.raw`\55\53\44\43`, 'circle-usd'],
    ['on<!-- -->Base', 'coinbase-base']
  ]
  for (const [content, policyId] of cases) {
    const issues = validateCompetingAssets(content, { file: content.startsWith('\\') ? 'fixture.css' : 'fixture.mdx' })
    assert.ok(issues.some((issue) => issue.policyId === policyId), `${JSON.stringify(content)}: ${JSON.stringify(issues.map(issueSummary))}`)
  }
})

test('decodes JavaScript escapes, numeric HTML entities, and percent-encoded terms', () => {
  const encodedCases = [
    String.raw`\u{55}\u{53}\u{44}\u{43}`,
    String.raw`\u0055\u0053\u0044\u0043`,
    String.raw`\x55\x53\x44\x43`,
    '&#85;&#83;&#68;&#67;',
    '&#x55;&#x53;&#x44;&#x43;',
    '%55%53%44%43',
    'U%D0%85D%D0%A1',
    '%EF%BC%B5%EF%BC%B3%EF%BC%A4%EF%BC%A3',
    String.raw`\uD835\uDC14\uD835\uDC12\uD835\uDC03\uD835\uDC02`
  ]

  for (const encoded of encodedCases) {
    const issues = validateCompetingAssets(`encoded=${encoded}`, { file: 'encoded.txt' })
    assert.deepEqual(issues.map(issueSummary), [
      {
        column: 9,
        file: 'encoded.txt',
        kind: 'symbol',
        line: 1,
        policyId: 'circle-usd',
        policyLabel: 'USD Coin',
        value: encoded
      }
    ], `expected one decoded match for ${JSON.stringify(encoded)}`)
  }

  const encodedName = 'https://tokens.example/USD%20Coin'
  assert.deepEqual(validateCompetingAssets(encodedName).map(issueSummary), [
    {
      column: 24,
      file: '<content>',
      kind: 'name',
      line: 1,
      policyId: 'circle-usd',
      policyLabel: 'USD Coin',
      value: 'USD%20Coin'
    }
  ])

  assert.deepEqual(validateCompetingAssets('malformed=U%D0D%C1%A1'), [])
})

test('reports exact Unicode-code-point locations for every supported line separator', () => {
  for (const newline of ['\n', '\r\n', '\r', '\u2028', '\u2029']) {
    const content = ['heading', 'prefix USDC suffix', 'trailer'].join(newline)
    assert.deepEqual(validateCompetingAssets(content, { file: `example-${newline === '\n' ? 'lf' : 'crlf'}.md` }).map(issueSummary), [
      {
        column: 8,
        file: `example-${newline === '\n' ? 'lf' : 'crlf'}.md`,
        kind: 'symbol',
        line: 2,
        policyId: 'circle-usd',
        policyLabel: 'USD Coin',
        value: 'USDC'
      }
    ])
  }

  assert.deepEqual(validateCompetingAssets('prefix 😀 USDC', { file: 'code-points.md' }).map(issueSummary), [
    {
      column: 10,
      file: 'code-points.md',
      kind: 'symbol',
      line: 1,
      policyId: 'circle-usd',
      policyLabel: 'USD Coin',
      value: 'USDC'
    }
  ])

  const encoded = String.raw`\u0055\u0053\u0044\u0043`
  const content = ['first', `prefix ${encoded}`, 'last'].join('\r\n')
  assert.deepEqual(validateCompetingAssets(content, { file: 'encoded-crlf.md' }).map(issueSummary), [
    {
      column: 8,
      file: 'encoded-crlf.md',
      kind: 'symbol',
      line: 2,
      policyId: 'circle-usd',
      policyLabel: 'USD Coin',
      value: encoded
    }
  ])

  const encodedUtf8 = '%EF%BC%B5%EF%BC%B3%EF%BC%A4%EF%BC%A3'
  assert.deepEqual(validateCompetingAssets(`first\n  ${encodedUtf8}\nlast`, { file: 'encoded-utf8.md' }).map(issueSummary), [
    {
      column: 3,
      file: 'encoded-utf8.md',
      kind: 'symbol',
      line: 2,
      policyId: 'circle-usd',
      policyLabel: 'USD Coin',
      value: encodedUtf8
    }
  ])
})

test('deduplicates overlapping matches within one policy but preserves distinct policies and occurrences', () => {
  assert.deepEqual(validateCompetingAssets('Dola stablecoin').map(issueSummary), [
    {
      column: 1,
      file: '<content>',
      kind: 'name',
      line: 1,
      policyId: 'dola',
      policyLabel: 'Dola',
      value: 'Dola stablecoin'
    }
  ])
  assert.deepEqual(validateCompetingAssets('TrueUSD').map(issueSummary), [
    {
      column: 1,
      file: '<content>',
      kind: 'identifier',
      line: 1,
      policyId: 'trueusd',
      policyLabel: 'TrueUSD',
      value: 'TrueUSD'
    }
  ])
  assert.deepEqual(validateCompetingAssets('Blast USDB').map(issueSummary), [
    {
      column: 1,
      file: '<content>',
      kind: 'name',
      line: 1,
      policyId: 'blast-usd',
      policyLabel: 'Blast USD',
      value: 'Blast USDB'
    }
  ])
  assert.deepEqual(validateCompetingAssets('Pax Gold').map(issueSummary), [
    {
      column: 1,
      file: '<content>',
      kind: 'name',
      line: 1,
      policyId: 'pax-gold',
      policyLabel: 'Pax Gold',
      value: 'Pax Gold'
    }
  ])
  assert.deepEqual(validateCompetingAssets('USDC USDC').map(({ value, column, policyId }) => ({ value, column, policyId })), [
    { value: 'USDC', column: 1, policyId: 'circle-usd' },
    { value: 'USDC', column: 6, policyId: 'circle-usd' }
  ])

  const repeated = validateCompetingAssets(Array(5_000).fill('USDC').join(' '))
  assert.equal(repeated.length, 5_000)
  assert.equal(repeated[0].column, 1)
  assert.equal(repeated.at(-1).value, 'USDC')
})

test('does not flag Tether-family, neutral, field-name, or near-miss corpus values', () => {
  const content = [
    'USD₮ USD₮0 USDt USDt0 USDT USDT0 USA₮ USAt USAT',
    'XAU₮ XAU₮0 XAUt XAUt0 XAUT MXN₮ MXNt CNH₮ CNHt EUR₮ EURt aUSD₮',
    'ETH BTC SOL fiat token stablecoin',
    'dailyChange/USDCoincidence/ghost/mimetype/USDs',
    'base basecamp database base64'
  ].join('\n')
  assert.deepEqual(validateCompetingAssets(content), [])
  assert.deepEqual(validateCompetingAssets('USDS').map(({ policyId, kind, value }) => ({ policyId, kind, value })), [
    { policyId: 'sky-usds', kind: 'symbol', value: 'USDS' }
  ])
})

test('flags contextual Coinbase Base names and routes', () => {
  const cases = [
    ['Coinbase Base', 'chain-name'],
    ['Base by Coinbase', 'chain-name'],
    ['base by coinbase', 'chain-name'],
    ['base mainnet', 'chain-name'],
    ['Base Mainnet', 'chain-name'],
    ['BASE Sepolia', 'chain-name'],
    ['Base Goerli', 'chain-name'],
    ['Base testnet', 'chain-name'],
    ['base devnet', 'chain-name'],
    ['BaseMainnet', 'chain-name'],
    ['baseSepolia', 'chain-name'],
    ['Base chain', 'chain-name'],
    ['Base network', 'chain-name'],
    ['Base L2', 'chain-name'],
    ['on Base', 'chain-route'],
    ['on base', 'chain-route'],
    ['on base using a wallet', 'chain-route'],
    ['on base with a wallet', 'chain-route'],
    ['onto the Base', 'chain-route'],
    ['Bridge to Base', 'chain-route'],
    ['Transfer from BASE', 'chain-route'],
    ['Route via Base', 'chain-route'],
    ['across Base', 'chain-route'],
    ['supports Base', 'chain-route'],
    ['supporting the Base', 'chain-route'],
    ['Base is supported by the provider.', 'chain-name'],
    ['Base remains available.', 'chain-name'],
    ['Base supports EVM swaps.', 'chain-name'],
    ['Base RPC endpoint', 'chain-name'],
    ['Base explorer URL', 'chain-name'],
    ['Deploy the wallet with Base.', 'chain-route'],
    ['Build a payment flow on Base.', 'chain-route'],
    ['Use base as your network.', 'chain-value'],
    ['Select Base as the destination.', 'chain-value'],
    ['Use Base for settlement.', 'chain-value'],
    ['# Base', 'chain-name'],
    ["import { base } from 'viem/chains'", 'chain-value'],
    ["import { base } from 'wagmi/chains'", 'chain-value'],
    ['https://api.example/chains/base', 'chain-route'],
    ['/sdk/base-rpc', 'chain-route'],
    ['/base/route', 'chain-route'],
    ['Supported EVM networks include Ethereum, Arbitrum, Base, and BSC.', 'chain-inventory'],
    ['Aave spans EVM chains (Ethereum, Arbitrum, Base, Optimism).', 'chain-inventory'],
    ['Chains: Ethereum, Arbitrum, Base', 'chain-inventory'],
    ['| `base` | Base |', 'chain-inventory'],
    ['| Base | `base` |', 'chain-inventory']
  ]

  for (const [content, kind] of cases) {
    const issues = validateCompetingAssets(content)
    assert.ok(issues.some((issue) => issue.policyId === PROHIBITED_CHAIN_POLICY.id && issue.kind === kind), `${content} did not produce ${kind}: ${JSON.stringify(issues.map(issueSummary))}`)
    assert.ok(issues.every((issue) => issue.reason === BASE_REASON))
  }
})

test('flags contextual Coinbase Base values, IDs, domains, slugs, and table forms', () => {
  const valueKeys = ['chain', 'chainName', 'destinationChain', 'fromChain', 'network', 'networkName', 'sourceChain', 'toChain']
  for (const key of valueKeys) {
    const issues = validateCompetingAssets(`${key}: "base"`)
    assert.ok(issues.some((issue) => issue.policyId === PROHIBITED_CHAIN_POLICY.id && issue.kind === 'chain-value'), `${key} value was not detected`)
  }
  for (const flag of ['--chain=base', '--network BASE', '--chain base', '--network=BASE']) {
    assert.ok(validateCompetingAssets(flag).some((issue) => issue.kind === 'chain-value'), `${flag} was not detected`)
  }

  for (const source of [
    'chains.base',
    'base.rpcUrls',
    'const explorer = BaseExplorer',
    'const rpc = baseRpcUrl',
    'const chain = coinbaseBase',
    '{"network":"base"}',
    '{"chains":["ethereum","base"]}',
    'const supportedChains = [\n  "ethereum",\n  "base",\n]'
  ]) {
    assert.ok(validateCompetingAssets(source, { file: 'fixture.js' }).some((issue) => issue.policyId === PROHIBITED_CHAIN_POLICY.id), `${source} was not detected`)
  }
  for (const chainId of PROHIBITED_CHAIN_POLICY.chainIds) {
    const hexadecimalChainId = `0x${BigInt(chainId).toString(16)}`
    const paddedDecimalChainId = chainId.padStart(chainId.length + 3, '0')
    const paddedHexadecimalChainId = `0x${BigInt(chainId).toString(16).padStart(8, '0')}`
    const contextualValues = [
      `chain: ${chainId}`,
      `chainId: ${chainId}`,
      `chainId: ${hexadecimalChainId}`,
      `chainId: ${chainId}n`,
      `chainId: ${hexadecimalChainId}n`,
      `chainId: +${chainId}`,
      `chainId: ${chainId}u32`,
      `chainId: ${chainId}u64`,
      `chainId: ${chainId}u128`,
      `chainId: BigInt("${chainId}")`,
      `chainId: Number(${chainId})`,
      `chainId: ${[...chainId].join('_')}`,
      `chainId: 0x${[...BigInt(chainId).toString(16)].join('_')}`,
      `chainId: ${paddedHexadecimalChainId}`,
      `network: ${paddedDecimalChainId}`,
      `toChain: ${chainId}`,
      `network_id = "${chainId}"`,
      `chains: [${chainId}]`,
      `chains: [1, 10, ${chainId}]`,
      `const supportedChains = [\n  1,\n  10,\n  ${chainId},\n]`,
      `supportedChains:\n  - 1\n  - 10\n  - ${chainId}`,
      `chain:\n  id: ${chainId}`,
      `chain["id"] = ${chainId}`,
      `supportedChains = new Set([1, 10, ${chainId}])`,
      `supportedChains = new Set([\n  1,\n  10,\n  ${chainId},\n])`,
      `const configs = { ${chainId}: { rpc: url } }`,
      `{"supportedChains":{"1":true,"${chainId}":true}}`,
      `supportedNetworks = ["${paddedDecimalChainId}"]`,
      `eip155:${chainId}`,
      `eip155:${hexadecimalChainId}`,
      `Base (${chainId})`,
      `base (${chainId})`,
      `Base: ${chainId}`,
      `Base - chain id: ${chainId}`,
      `${chainId} - Base`,
      `| Base | ${chainId} |`,
      `| ${chainId} | Base |`
    ]
    for (const value of contextualValues) {
      assert.ok(validateCompetingAssets(value).some((issue) => issue.policyId === PROHIBITED_CHAIN_POLICY.id && issue.kind === 'chain-id'), `${value} was not detected`)
    }
  }
  assert.ok(validateCompetingAssets('network_id: 0x2105').some((issue) => issue.kind === 'chain-id'))
  assert.ok(validateCompetingAssets("defineChain({ id: 8453, name: 'Base' })").some((issue) => issue.kind === 'chain-id'))
  for (const source of [
    "const chain = { id: 8453, rpcUrls: { default: { http: ['https://rpc.example'] } } }",
    "const chain = { rpcUrls: ['https://rpc.example'], id: 0x2105 }",
    '{ "id": 84532, "nativeCurrency": { "name": "Ether" } }'
  ]) {
    assert.ok(validateCompetingAssets(source).some((issue) => issue.kind === 'chain-id'), `${source} was not detected`)
  }

  for (const route of [
    '/chains/8453/tokens',
    'https://api.example/chains/84531/assets',
    '/networks/84532/routes',
    '/chains/8_4_5_3/tokens'
  ]) {
    assert.ok(validateCompetingAssets(route).some((issue) => issue.kind === 'chain-route'), `${route} was not detected`)
  }

  for (const brandedName of PROHIBITED_CHAIN_POLICY.brandedNames) {
    const issues = validateCompetingAssets(`Use ${brandedName} for this flow.`)
    assert.ok(issues.some((issue) => issue.policyId === PROHIBITED_CHAIN_POLICY.id && issue.kind === 'chain-brand'), `${brandedName} was not detected`)
  }

  for (const domain of PROHIBITED_CHAIN_POLICY.domains) {
    const issues = validateCompetingAssets(`https://www.${domain}/docs`)
    assert.ok(issues.some((issue) => issue.policyId === PROHIBITED_CHAIN_POLICY.id && issue.kind === 'chain-domain'), `${domain} was not detected`)
  }
  for (const slug of PROHIBITED_CHAIN_POLICY.slugs) {
    const issues = validateCompetingAssets(`/${slug}/route`)
    assert.ok(issues.some((issue) => issue.policyId === PROHIBITED_CHAIN_POLICY.id), `${slug} was not detected`)
  }

  for (const address of PROHIBITED_CHAIN_POLICY.addresses) {
    const issues = validateCompetingAssets(`contract: ${address}`)
    assert.ok(issues.some((issue) => (
      issue.policyId === PROHIBITED_CHAIN_POLICY.id
      && issue.kind === 'chain-address'
      && issue.value === address
    )), `${address} was not detected`)
    assert.ok(issues.every((issue) => issue.reason === BASE_REASON))
  }

  const bridgeAddress = PROHIBITED_CHAIN_POLICY.addresses.find((address) => address.toLowerCase() === '0x3154cf16ccdb4c6d922629664174b904d80f2c35')
  assert.ok(bridgeAddress)
  for (const source of [
    bridgeAddress.toLowerCase(),
    bridgeAddress.slice(2),
    `0xdeadbeef${bridgeAddress.slice(2)}cafebabe`,
    `0x${'0'.repeat(24)}${bridgeAddress.slice(2)}`
  ]) {
    assert.ok(validateCompetingAssets(source).some((issue) => issue.policyId === PROHIBITED_CHAIN_POLICY.id), `${source} was not detected`)
  }
})

test('allows generic base words and base-like near misses outside chain contexts', () => {
  const generic = [
    'base',
    'Base',
    'base asset',
    'base account',
    'Base account',
    'base class',
    'base configuration',
    'base currency',
    'base directory',
    'base fee',
    'base implementation',
    'base schema',
    'base type',
    'base unit',
    'base URL',
    'base wallet',
    'basecamp',
    'database',
    'base64',
    'Base58',
    'Encode the recipient as Base58.',
    '5HueCGU8rMjxEXxiPuD5BDuRaK2rH2e8QnQeH8kziAbqUz4Fv2Z',
    'Base salary',
    '"BASE"',
    "'BASE'",
    '`BASE`',
    'The network uses a Base URL.',
    'The network implementation extends a Base class.',
    'Read it from the Base Class.',
    'The value is expressed in Base Units.',
    'Convert decimal amounts to base units.',
    'Remove it from the base ISigner interface.',
    'Remove it from the base `ISigner` interface.',
    'Remove it from the base <code>ISigner</code> interface.',
    String.raw`Remove it from the base \",[\"$\",\"code\",null,{\"children\":\"ISigner\"}],\" interface.`,
    'Add the option to the base WalletConfig type.',
    'Add the option to the base `WalletConfig` type.',
    'Add signing to the base `IWalletAccount` interface.',
    'Settle periodically to the base layer.',
    'Append the segment to the base path.',
    'Inherit it from the base Solana wallet module.',
    'inherits from Base',
    'relative to base',
    'offset from base',
    'supports the base protocol',
    'The parser supports Base syntax.',
    'Return to Base after parsing.',
    'from the base object',
    'Run on base assets using a wallet.',
    'Use base as your base class.',
    'Use base for formatting.',
    'Base supports inheritance.',
    'chainId: 84530',
    'chainId: 0x21050',
    'chainId: 8_453_0',
    'chains: [1, 10, 84530]',
    'const supportedChains = [\n  1,\n  84530,\n]',
    'supportedChains:\n  - 1\n  - 84530',
    'chain:\n  id: 84530',
    'chain["id"] = 84530',
    'supportedChains = new Set([1, 84530])',
    'const configs = { 84530: { rpc: url } }',
    '{"supportedChains":{"1":true,"84530":true}}',
    '/chains/84530/tokens',
    '{ id: 84530, rpcUrls: ["https://rpc.example"] }',
    '{ id: 8453, url: "https://example.com" }',
    '0x4200000000000000000000000000000000000007',
    '0x4200000000000000000000000000000000000010',
    '0x4200000000000000000000000000000000000015',
    'Use bold text and font-weight: bold.',
    'The Bold component renders emphasis.',
    '| `base` | Base URL |'
  ]
  assert.deepEqual(validateCompetingAssets(generic.join('\n')), [])
})

test('validates every configured asset through nested search-index string values', () => {
  const documents = {}
  for (const policy of [...COMPETING_ASSET_POLICIES].reverse()) {
    const contextRequiredOpaque = new Set(policy.contextRequiredOpaqueIdentifiers ?? [])
    documents[`doc-${policy.id}`] = {
      opaque: [...(policy.opaqueIdentifiers ?? [])].filter((value) => !contextRequiredOpaque.has(value)),
      assetIds: [...contextRequiredOpaque],
      addresses: [...(policy.addresses ?? [])],
      names: [...(policy.names ?? [])],
      symbols: [...(policy.symbols ?? [])],
      ignored: null,
      count: 1
    }
  }
  documents['doc-extra'] = {
    nested: {
      description: 'USDC',
      array: ['USD Coin', false, { value: 'Pax Gold' }]
    }
  }

  const issues = validateCompetingAssetsInSearchIndex(JSON.stringify({ docs: { docs: documents } }), { file: 'public/api/search.json' })
  for (const policy of COMPETING_ASSET_POLICIES) {
    assert.ok(issues.some((issue) => issue.policyId === policy.id), `search index did not report ${policy.id}`)
  }
  for (const policy of COMPETING_ASSET_POLICIES) {
    for (const value of [...(policy.symbols ?? []), ...(policy.names ?? []), ...(policy.addresses ?? []), ...(policy.opaqueIdentifiers ?? [])]) {
      assert.ok(issues.some((issue) => issue.policyId === policy.id && issue.value === value), `search index did not report ${policy.id}/${value}`)
    }
  }

  assert.ok(issues.every((issue) => issue.file === 'public/api/search.json'))
  assert.ok(issues.every((issue) => issue.generatedSource === 'docs.docs'))
  assert.ok(issues.every((issue) => issue.line === undefined && issue.column === undefined))
})

test('search-index validation is deterministic and rejects invalid shape', () => {
  const content = JSON.stringify({
    docs: {
      docs: {
        zed: { z: 'USDC', a: 'DAI' },
        alpha: { nested: { z: 'USDS', a: 'USD Coin' } }
      }
    }
  })
  const first = validateCompetingAssetsInSearchIndex(content)
  const second = validateCompetingAssetsInSearchIndex(content)
  assert.deepEqual(first, second)
  assert.deepEqual(first.map((issue) => issue.value), ['USDS', 'USD Coin', 'USDC', 'DAI'])

  assert.throws(
    () => validateCompetingAssetsInSearchIndex('{not-json}', { file: 'search.json' }),
    /Generated search index search\.json is not valid JSON:/
  )
  for (const value of [
    JSON.stringify({}),
    JSON.stringify({ docs: {} }),
    JSON.stringify({ docs: { docs: [] } }),
    JSON.stringify({ docs: { docs: null } })
  ]) {
    assert.throws(
      () => validateCompetingAssetsInSearchIndex(value, { file: 'search.json' }),
      /Generated search index search\.json does not contain a docs\.docs object\./
    )
  }
})

test('search-index validation scans document IDs, route IDs, and nested object keys', () => {
  const content = JSON.stringify({
    docs: {
      docs: {
        '/sdk/base': { title: 'Neutral' },
        '/sdk/usdc': { title: 'Neutral' },
        clean: { USDC: 'Neutral' }
      }
    }
  })
  assert.deepEqual(validateCompetingAssetsInSearchIndex(content).map((issue) => [issue.generatedSource, issue.policyId, issue.value]), [
    ['docs.docs', 'coinbase-base', '/sdk/base'],
    ['docs.docs', 'circle-usd', 'usdc'],
    ['docs.docs', 'circle-usd', 'USDC']
  ])
})

test('search-index validation preserves JSON key and numeric collection context', () => {
  const content = JSON.stringify({
    docs: {
      docs: {
        clean: {
          chainIds: [1, 10, 8453],
          assetIds: [42, 1337],
          network: 'base'
        }
      }
    }
  })
  const issues = validateCompetingAssetsInSearchIndex(content)
  assert.ok(issues.some((issue) => issue.policyId === 'coinbase-base' && issue.kind === 'chain-id'))
  assert.ok(issues.some((issue) => issue.policyId === 'coinbase-base' && issue.kind === 'chain-value'))
  assert.ok(issues.some((issue) => issue.policyId === 'circle-usd' && issue.kind === 'known-identifier' && issue.value === '1337'))

  const nearMiss = JSON.stringify({ docs: { docs: { clean: { chainIds: [84530], ports: [1337] } } } })
  assert.deepEqual(validateCompetingAssetsInSearchIndex(nearMiss), [])
})
